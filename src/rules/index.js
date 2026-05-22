'use strict'

const path = require('path')
const fs = require('fs')

const noHardcodedColors = require('./no-hardcoded-colors')
const noCustomClasses = require('./no-custom-classes')
const useTokenValues = require('./use-token-values')
const noInlineStyles = require('./no-inline-styles')

const BUILT_IN_RULES = {
  'no-hardcoded-colors': noHardcodedColors,
  'no-custom-classes': noCustomClasses,
  'use-token-values': useTokenValues,
  'no-inline-styles': noInlineStyles,
}

function resolveRules(config) {
  const all = { ...BUILT_IN_RULES }

  // Load npm plugins: each exports { name, rules: { 'rule-name': ruleObj } }
  for (const plugin of (config.plugins || [])) {
    const pluginObj = typeof plugin === 'string' ? require(plugin) : plugin
    const prefix = pluginObj.name
    if (!prefix) {
      process.stderr.write(`motif: plugin missing "name" field — skipping\n`)
      continue
    }
    for (const [name, rule] of Object.entries(pluginObj.rules || {})) {
      all[`${prefix}/${name}`] = rule
    }
  }

  // Load rules from a directory
  if (config.rulesDir) {
    const dirPath = path.resolve(config._configDir || process.cwd(), config.rulesDir)
    if (!fs.existsSync(dirPath)) {
      process.stderr.write(`motif: rulesDir "${config.rulesDir}" not found\n`)
    } else {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'))
      for (const file of files) {
        const rule = require(path.join(dirPath, file))
        const name = rule.meta?.name || path.basename(file, '.js')
        all[name] = rule
      }
    }
  }

  // Inline custom rules from config object
  for (const [name, rule] of Object.entries(config.customRules || {})) {
    all[name] = rule
  }

  return all
}

function parseSeverityConfig(value) {
  if (Array.isArray(value)) {
    return { severity: value[0], options: value[1] || {} }
  }
  return { severity: value, options: {} }
}

function loadRules(config) {
  const allRules = resolveRules(config)
  const enabled = []

  for (const [name, rawConfig] of Object.entries(config.rules || {})) {
    const { severity, options } = parseSeverityConfig(rawConfig)
    if (severity === 'off' || severity === 0) continue

    const rule = allRules[name]
    if (!rule) {
      process.stderr.write(`motif: unknown rule "${name}"\n`)
      continue
    }

    enabled.push({ ...rule, effectiveSeverity: severity, ruleOptions: options })
  }

  return enabled
}

module.exports = { loadRules, resolveRules, BUILT_IN_RULES }
