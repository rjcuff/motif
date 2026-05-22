#!/usr/bin/env node
'use strict'

const { program } = require('commander')
const path = require('path')
const fs = require('fs')
const { version } = require('../package.json')
const { run } = require('../src/engine')
const { resolveRules } = require('../src/rules/index')
const { loadConfig } = require('../src/config')

program
  .name('motif')
  .description('Design system linter — catch UI/UX drift before it ships')
  .version(version)

// ─── lint ────────────────────────────────────────────────────────────────────
program
  .command('lint [path]')
  .description('Lint files for design system violations')
  .option('--watch', 'Re-lint on file changes')
  .option('--config <path>', 'Path to config file')
  .option('--format <format>', 'Output format: stylish (default), json, compact', 'stylish')
  .option('--quiet', 'Report only errors, suppress warnings')
  .option('--max-warnings <n>', 'Fail if warnings exceed this number', parseInt)
  .action(async (targetPath, options) => {
    const exitCode = await run({
      targetPath: targetPath || process.cwd(),
      watch: options.watch || false,
      configPath: options.config || null,
      format: options.format || 'stylish',
      quiet: options.quiet || false,
      maxWarnings: options.maxWarnings !== undefined ? options.maxWarnings : -1,
    })
    process.exit(exitCode)
  })

// ─── rules ───────────────────────────────────────────────────────────────────
program
  .command('rules [path]')
  .description('List all available rules (built-in + plugins + custom)')
  .option('--config <path>', 'Path to config file')
  .action((targetPath, options) => {
    const chalk = require('chalk')
    const cwd = path.resolve(targetPath || process.cwd())
    const config = loadConfig(cwd, options.config || null)
    const allRules = resolveRules(config)

    const byCategory = {}
    for (const [name, rule] of Object.entries(allRules)) {
      const category = rule.meta?.docs?.category || 'Uncategorized'
      if (!byCategory[category]) byCategory[category] = []
      byCategory[category].push({ name, rule })
    }

    const enabled = new Set(Object.keys(config.rules))

    console.log(chalk.bold(`\nMotif rules (${Object.keys(allRules).length} total)\n`))

    for (const [category, entries] of Object.entries(byCategory)) {
      console.log(chalk.underline(category))
      for (const { name, rule } of entries) {
        const severity = config.rules[name]
        const badge = enabled.has(name)
          ? chalk.green(`[${Array.isArray(severity) ? severity[0] : severity}]`)
          : chalk.dim('[off]')
        const desc = rule.meta?.docs?.description || rule.meta?.message || ''
        console.log(`  ${badge} ${name.padEnd(30)} ${chalk.dim(desc)}`)
      }
      console.log()
    }
  })

// ─── init ────────────────────────────────────────────────────────────────────
program
  .command('init')
  .description('Scaffold a motif.config.js in the current directory')
  .action(() => {
    const chalk = require('chalk')
    const configPath = path.join(process.cwd(), 'motif.config.js')

    if (fs.existsSync(configPath)) {
      console.error(chalk.red('motif.config.js already exists.'))
      process.exit(1)
    }

    const template = `module.exports = {
  rules: {
    'no-hardcoded-colors': 'error',
    'no-custom-classes': 'warn',
    'use-token-values': 'error',
    'no-inline-styles': 'warn',
  },

  tokens: {
    // CSS custom property names your team uses
    colors: [
      '--color-primary',
      '--color-danger',
      '--color-neutral-100',
    ],
    spacing: [
      '--spacing-xs',
      '--spacing-sm',
      '--spacing-md',
      '--spacing-lg',
    ],
    // Class names from your design system
    allowedClasses: [
      'btn',
      'btn-primary',
      'btn-secondary',
      'card',
      'text-heading',
    ],
  },

  // Glob patterns to ignore
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.test.tsx',
    '**/*.stories.tsx',
  ],

  // Optional: load rules from a local directory
  // rulesDir: './motif-rules',

  // Optional: inline custom rules
  // customRules: {
  //   'no-legacy-button': require('./motif-rules/no-legacy-button'),
  // },

  // Optional: npm plugin packages
  // plugins: ['motif-plugin-tailwind'],
}
`

    fs.writeFileSync(configPath, template)
    console.log(chalk.green('✓ Created motif.config.js'))
    console.log(chalk.dim('\nNext: edit the tokens and allowedClasses to match your design system.'))
    console.log(chalk.dim('Then run: motif lint\n'))
  })

program.parse()
