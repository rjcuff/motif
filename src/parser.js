'use strict'

const parser = require('@typescript-eslint/parser')

function parseFile(code, filePath) {
  const useJsx = filePath.endsWith('.jsx') || filePath.endsWith('.tsx')
  return parser.parse(code, {
    ecmaFeatures: { jsx: useJsx },
    loc: true,
    range: true,
    tokens: false,
    comment: false,
    ecmaVersion: 'latest',
    sourceType: 'module',
  })
}

module.exports = { parseFile }
