'use strict'

const fs = require('fs')
const path = require('path')
const { loadConfig } = require('./config')
const { scanFiles } = require('./scanner')
const { parseFile } = require('./parser')
const { walk, mergeVisitors } = require('./walker')
const { loadRules } = require('./rules/index')
const { report } = require('./reporter')

function lintFile(filePath, rules, config) {
  const code = fs.readFileSync(filePath, 'utf8')

  let ast
  try {
    ast = parseFile(code, filePath)
  } catch (err) {
    return { file: filePath, violations: [], parseError: err.message }
  }

  const violations = []

  const ruleVisitorsList = rules.map(rule => {
    const context = {
      options: rule.ruleOptions || {},
      settings: config,
      filename: filePath,
      report({ node, message }) {
        const loc = node.loc?.start || { line: 0, column: 0 }
        violations.push({
          rule: rule.meta.name,
          severity: rule.effectiveSeverity,
          message,
          line: loc.line,
          column: loc.column,
        })
      },
    }
    return rule.create.call(rule, context)
  })

  const merged = mergeVisitors(ruleVisitorsList)
  walk(ast, merged)

  return { file: filePath, violations, parseError: null }
}

async function run({ targetPath, configPath, watch, format = 'stylish', quiet = false, maxWarnings = -1 }) {
  const resolvedTarget = path.resolve(targetPath)
  const config = loadConfig(resolvedTarget, configPath)
  const rules = loadRules(config)

  if (rules.length === 0) {
    console.log('No rules enabled.')
    return 0
  }

  const files = await scanFiles(resolvedTarget, config.ignore)

  if (files.length === 0) {
    console.log('No files found.')
    return 0
  }

  if (watch) {
    const { startWatch } = require('./watcher')
    await startWatch({ targetPath: resolvedTarget, rules, config, format, quiet })
    return 0
  }

  const results = files.map(f => lintFile(f, rules, config))

  for (const r of results) {
    if (r.parseError) {
      const rel = path.relative(resolvedTarget, r.file)
      process.stderr.write(`Parse error in ${rel}: ${r.parseError}\n`)
    }
  }

  const filtered = quiet
    ? results.map(r => ({ ...r, violations: r.violations.filter(v => v.severity === 'error') }))
    : results

  const { errorCount, warnCount } = report(filtered, resolvedTarget, format)

  if (errorCount > 0) return 1
  if (maxWarnings >= 0 && warnCount > maxWarnings) {
    if (format === 'stylish') {
      const chalk = require('chalk')
      console.log(chalk.red(`\nMotif found too many warnings (maximum: ${maxWarnings}).`))
    }
    return 1
  }

  return 0
}

module.exports = { run, lintFile }
