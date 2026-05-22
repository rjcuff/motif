'use strict'

const stylish = require('./formatters/stylish')
const json = require('./formatters/json')
const compact = require('./formatters/compact')

const FORMATTERS = { stylish, json, compact }

function report(results, cwd, format = 'stylish') {
  const formatter = FORMATTERS[format] || FORMATTERS.stylish
  return formatter(results, cwd)
}

module.exports = { report }
