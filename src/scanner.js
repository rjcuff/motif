'use strict'

const glob = require('fast-glob')

const EXTENSIONS = ['js', 'ts', 'jsx', 'tsx']

async function scanFiles(targetPath, ignorePatterns = []) {
  const pattern = `**/*.{${EXTENSIONS.join(',')}}`
  return glob(pattern, {
    cwd: targetPath,
    absolute: true,
    ignore: ignorePatterns,
    dot: false,
  })
}

module.exports = { scanFiles }
