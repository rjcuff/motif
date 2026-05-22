'use strict'

module.exports = function json(results) {
  let errorCount = 0
  let warnCount = 0

  const output = {
    results: results.map(r => {
      const errors = r.violations.filter(v => v.severity === 'error').length
      const warnings = r.violations.filter(v => v.severity === 'warn').length
      errorCount += errors
      warnCount += warnings
      return {
        filePath: r.file,
        violations: r.violations,
        errorCount: errors,
        warningCount: warnings,
      }
    }),
    errorCount,
    warningCount: warnCount,
  }

  console.log(JSON.stringify(output, null, 2))
  return { errorCount, warnCount }
}
