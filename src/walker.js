'use strict'

const { visitorKeys } = require('@typescript-eslint/visitor-keys')

function walk(node, visitors) {
  if (!node || typeof node !== 'object') return

  if (node.type) {
    const handlers = visitors[node.type]
    if (handlers) {
      for (const handler of handlers) handler(node)
    }
  }

  const keys = visitorKeys[node.type] || []
  for (const key of keys) {
    const child = node[key]
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === 'object') walk(item, visitors)
      }
    } else if (child && typeof child === 'object') {
      walk(child, visitors)
    }
  }
}

function mergeVisitors(ruleVisitorsList) {
  const merged = {}
  for (const ruleVisitors of ruleVisitorsList) {
    for (const [nodeType, fn] of Object.entries(ruleVisitors)) {
      if (!merged[nodeType]) merged[nodeType] = []
      merged[nodeType].push(fn)
    }
  }
  return merged
}

module.exports = { walk, mergeVisitors }
