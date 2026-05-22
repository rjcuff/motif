'use strict'

const path = require('path')
const fs = require('fs')

const DEFAULTS = {
  rules: {
    'no-hardcoded-colors': 'error',
    'no-custom-classes': 'warn',
    'use-token-values': 'error',
    'no-inline-styles': 'warn',
  },
  tokens: {
    colors: [],
    spacing: [],
    allowedClasses: [],
  },
  plugins: [],
  customRules: {},
  rulesDir: null,
  ignore: ['**/node_modules/**', '**/dist/**'],
}

function loadConfig(startDir, configPath) {
  if (configPath) {
    return mergeWithDefaults(require(path.resolve(configPath)), startDir)
  }

  let dir = path.resolve(startDir)
  while (true) {
    const jsConfig = path.join(dir, 'motif.config.js')
    const jsonConfig = path.join(dir, '.motifrc.json')

    if (fs.existsSync(jsConfig)) return mergeWithDefaults(require(jsConfig), dir)
    if (fs.existsSync(jsonConfig)) {
      return mergeWithDefaults(JSON.parse(fs.readFileSync(jsonConfig, 'utf8')), dir)
    }

    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }

  return { ...DEFAULTS, _configDir: startDir }
}

function mergeWithDefaults(userConfig, configDir) {
  return {
    rules: { ...DEFAULTS.rules, ...(userConfig.rules || {}) },
    tokens: { ...DEFAULTS.tokens, ...(userConfig.tokens || {}) },
    plugins: userConfig.plugins || [],
    customRules: userConfig.customRules || {},
    rulesDir: userConfig.rulesDir || null,
    ignore: userConfig.ignore || DEFAULTS.ignore,
    _configDir: configDir,
  }
}

module.exports = { loadConfig, DEFAULTS }
