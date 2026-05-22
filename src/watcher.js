'use strict'

const path = require('path')
const chokidar = require('chokidar')
const { lintFile } = require('./engine')
const { report } = require('./reporter')

async function startWatch({ targetPath, rules, config, format = 'stylish', quiet = false }) {
  const chalk = require('chalk')

  function relint(absPath) {
    process.stdout.write('\x1Bc')
    console.log(chalk.dim(`motif --watch  •  changed: ${path.relative(targetPath, absPath)}\n`))

    const result = lintFile(absPath, rules, config)
    const filtered = quiet
      ? { ...result, violations: result.violations.filter(v => v.severity === 'error') }
      : result

    report([filtered], targetPath, format)
  }

  const watcher = chokidar.watch('**/*.{js,ts,jsx,tsx}', {
    cwd: targetPath,
    ignored: config.ignore,
    ignoreInitial: true,
    persistent: true,
  })

  console.log(chalk.dim(`Watching ${targetPath} for changes…\n`))
  console.log(chalk.dim('Press Ctrl+C to stop.\n'))

  watcher.on('change', filePath => relint(path.resolve(targetPath, filePath)))
  watcher.on('add', filePath => relint(path.resolve(targetPath, filePath)))

  // Keep process alive
  process.stdin.resume()
}

module.exports = { startWatch }
