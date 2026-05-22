'use strict'

const path = require('path')

module.exports = function compact(results, cwd) {
  let errorCount = 0
  let warnCount = 0

  for (const { file, violations } of results) {
    const relPath = path.relative(cwd, file)
    for (const v of violations) {
      console.log(`${relPath}:${v.line}:${v.column}: ${v.severity} ${v.message} (${v.rule})`)
      if (v.severity === 'error') errorCount++
      else warnCount++
    }
  }

  return { errorCount, warnCount }
}
