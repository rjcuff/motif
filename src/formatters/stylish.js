'use strict'

const chalk = require('chalk')
const path = require('path')

module.exports = function stylish(results, cwd) {
  let errorCount = 0
  let warnCount = 0

  const fileResults = results.filter(r => r.violations.length > 0)

  for (const { file, violations } of fileResults) {
    const relPath = path.relative(cwd, file)
    console.log('\n' + chalk.underline(relPath))

    for (const v of violations) {
      const lineCol = chalk.dim(String(`line ${v.line}`).padEnd(10))
      const severity = v.severity === 'error'
        ? chalk.red('error'.padEnd(7))
        : chalk.yellow('warn'.padEnd(7))
      const message = v.message.padEnd(55)
      const rule = chalk.dim(v.rule)

      console.log(`  ${lineCol} ${severity} ${message} ${rule}`)

      if (v.severity === 'error') errorCount++
      else warnCount++
    }
  }

  const total = errorCount + warnCount

  if (total === 0) {
    console.log(chalk.green('\n✓ No violations found'))
    return { errorCount: 0, warnCount: 0 }
  }

  const plural = (n, word) => `${n} ${word}${n !== 1 ? 's' : ''}`
  const summary = `\n${plural(total, 'problem')} (${plural(errorCount, 'error')}, ${plural(warnCount, 'warning')})`

  console.log(errorCount > 0 ? chalk.red(summary) : chalk.yellow(summary))
  return { errorCount, warnCount }
}
