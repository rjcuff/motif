module.exports = {
  rules: {
    'no-hardcoded-colors': 'error',
    'no-custom-classes': 'warn',
    'use-token-values': 'error',
    'no-inline-styles': 'warn',
  },
  tokens: {
    colors: ['--color-primary', '--color-danger', '--color-neutral-100'],
    spacing: ['--spacing-xs', '--spacing-sm', '--spacing-md', '--spacing-lg'],
    allowedClasses: ['btn', 'btn-primary', 'card', 'text-heading'],
  },
  ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.tsx'],
}
