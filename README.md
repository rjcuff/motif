# Motif

**ESLint for your design system.** Catch UI/UX drift before it ships.

Motif statically analyzes your JavaScript and TypeScript source files and flags violations like hardcoded colors, raw spacing values, inline styles, and class names that don't belong to your design system — all without depending on ESLint.

```
src/components/Button.tsx
  line 12  error   Hardcoded color "#ff0000" for "color" — use a design token instead   no-hardcoded-colors
  line 18  warn    Class "btn-special" is not in the allowed list                        no-custom-classes

src/pages/Home.jsx
  line 34  warn    Inline style detected — use a design token or utility class instead   no-inline-styles

3 problems (1 error, 2 warnings)
```

---

## Install

```bash
npm install --save-dev motif
# or
yarn add -D motif
# or
pnpm add -D motif
```

**Requirements:** Node.js >= 18.18.0

---

## Quick Start

```bash
# Scaffold a config file
npx motif init

# Lint your entire project
npx motif lint

# Lint a specific directory
npx motif lint ./src

# Watch mode — re-lint on every save
npx motif lint --watch
```

Add to `package.json`:

```json
{
  "scripts": {
    "lint:ui": "motif lint ./src",
    "lint:ui:ci": "motif lint ./src --format json --max-warnings 0"
  }
}
```

---

## Configuration

Motif looks for `motif.config.js` or `.motifrc.json` starting in the target directory and walking up to the filesystem root.

### `motif.config.js`

```js
module.exports = {
  // Rule severities: 'error', 'warn', or 'off'
  // Array form passes options to the rule: ['error', { ...options }]
  rules: {
    'no-hardcoded-colors': 'error',
    'no-custom-classes': ['warn', { allowedPrefixes: ['tw-'] }],
    'use-token-values': ['error', { allowedValues: ['0', '100%'] }],
    'no-inline-styles': 'warn',
  },

  tokens: {
    // Your CSS custom property names
    colors: ['--color-primary', '--color-danger', '--color-neutral-100'],
    spacing: ['--spacing-xs', '--spacing-sm', '--spacing-md', '--spacing-lg'],

    // Class names your design system exports
    allowedClasses: ['btn', 'btn-primary', 'card', 'text-heading'],
  },

  // Glob patterns to ignore
  ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.tsx'],

  // Load all rules from a local directory
  rulesDir: './motif-rules',

  // Inline custom rules
  customRules: {
    'no-legacy-button': require('./motif-rules/no-legacy-button'),
  },

  // npm plugin packages
  plugins: ['motif-plugin-tailwind'],
}
```

### Severity values

| Value | Meaning |
|-------|---------|
| `'error'` | Violation — exits with code 1 |
| `'warn'` | Warning — exits with code 0 (unless `--max-warnings` exceeded) |
| `'off'` | Rule disabled |

---

## Built-in Rules

| Rule | Type | Default | Description |
|------|------|---------|-------------|
| [`no-hardcoded-colors`](docs/rules/no-hardcoded-colors.md) | problem | error | Disallow hardcoded hex/rgb/hsl color values |
| [`use-token-values`](docs/rules/use-token-values.md) | problem | error | Disallow raw dimension values (px, rem…) — use tokens |
| [`no-custom-classes`](docs/rules/no-custom-classes.md) | suggestion | warn | Enforce use of design system class names only |
| [`no-inline-styles`](docs/rules/no-inline-styles.md) | suggestion | warn | Disallow inline `style` props |

---

## CLI Reference

### `motif lint [path]`

Lint files for design system violations.

| Flag | Description |
|------|-------------|
| `--watch` | Re-lint on file changes |
| `--config <path>` | Path to a config file |
| `--format <fmt>` | Output format: `stylish` (default), `json`, `compact` |
| `--quiet` | Report only errors, suppress warnings |
| `--max-warnings <n>` | Exit with code 1 if warnings exceed `n` |

**Exit codes:**
- `0` — No errors (warnings don't affect exit code unless `--max-warnings` is set)
- `1` — One or more errors found

**Examples:**

```bash
# Lint and fail on any warning (useful in CI)
motif lint --max-warnings 0

# JSON output for CI tooling
motif lint --format json > motif-report.json

# Errors only (no warnings in output)
motif lint --quiet

# Use a non-default config
motif lint --config .motifrc.staging.json
```

### `motif rules [path]`

List all available rules with their current severity.

```bash
motif rules
motif rules ./packages/web
```

### `motif init`

Scaffold a `motif.config.js` in the current directory.

---

## Writing Custom Rules

Custom rules follow the same API as built-in rules. Drop a `.js` file anywhere and reference it in your config.

### Rule structure

```js
// motif-rules/no-legacy-button.js
module.exports = {
  meta: {
    name: 'no-legacy-button',
    type: 'problem',           // 'problem' | 'suggestion'
    docs: {
      description: 'Disallow the deprecated <Button> component — use <DSButton> instead',
      category: 'Components',
    },
    fixable: null,             // 'code' when auto-fix is supported (future)
    schema: [],                // JSON Schema array for options validation
  },

  create(context) {
    // context.options  — rule options from config (array form: ['error', { ...opts }])
    // context.settings — full config object (tokens, etc.)
    // context.filename — path of the file being linted
    // context.report() — file a violation

    return {
      // Visitor methods match AST node types.
      // Any @typescript-eslint/parser node type works.
      JSXOpeningElement(node) {
        const name = node.name?.name
        if (name === 'Button') {
          context.report({
            node,
            message: '<Button> is deprecated — use <DSButton> from @acme/ds instead',
          })
        }
      },
    }
  },
}
```

### Loading custom rules

**Option 1 — inline in config:**

```js
// motif.config.js
module.exports = {
  rules: {
    'no-legacy-button': 'error',
  },
  customRules: {
    'no-legacy-button': require('./motif-rules/no-legacy-button'),
  },
}
```

**Option 2 — rules directory (all `.js` files loaded automatically):**

```js
module.exports = {
  rules: {
    'no-legacy-button': 'error',
    'no-old-icon': 'warn',
  },
  rulesDir: './motif-rules',   // loads no-legacy-button.js, no-old-icon.js, etc.
}
```

### Rule options

Rules can accept per-project options using the array config form:

```js
// In motif.config.js:
rules: {
  'my-rule': ['error', { someOption: true, values: ['a', 'b'] }],
}
```

```js
// In the rule:
create(context) {
  const { someOption, values } = context.options
  // ...
}
```

### Available AST node types

Motif uses `@typescript-eslint/parser` — any node type it produces works as a visitor key. Useful ones:

| Node type | When it fires |
|-----------|--------------|
| `JSXAttribute` | Any JSX prop: `style=`, `className=`, `onClick=`, etc. |
| `JSXOpeningElement` | Opening tag: `<Button>`, `<div>`, etc. |
| `JSXElement` | Full JSX element |
| `Literal` | String/number literals in JS |
| `Identifier` | Variable names |
| `ImportDeclaration` | `import` statements |
| `CallExpression` | Function calls |
| `TemplateLiteral` | Template strings |

Browse the full list: [TypeScript ESLint AST spec](https://typescript-eslint.io/developers/custom-rules)

---

## Plugin Authoring

Share rules across teams or publish them on npm.

### Plugin structure

```js
// motif-plugin-acme/index.js
module.exports = {
  name: 'acme',           // prefix for all rules in this plugin
  rules: {
    'no-legacy-button': require('./rules/no-legacy-button'),
    'use-ds-icons': require('./rules/use-ds-icons'),
  },
}
```

### Using a plugin

```js
// motif.config.js
module.exports = {
  plugins: [
    'motif-plugin-acme',             // npm package name
    // or pass the object directly:
    require('./local-plugin'),
  ],
  rules: {
    'acme/no-legacy-button': 'error',
    'acme/use-ds-icons': 'warn',
  },
}
```

### Publishing

Name your package `motif-plugin-<name>` by convention. Your `package.json`:

```json
{
  "name": "motif-plugin-acme",
  "main": "index.js",
  "peerDependencies": {
    "motif": ">=0.1.0"
  }
}
```

---

## CI Integration

### GitHub Actions

```yaml
- name: Lint design system
  run: npx motif lint --format json --max-warnings 0 > motif-report.json
  continue-on-error: true

- name: Upload report
  uses: actions/upload-artifact@v4
  with:
    name: motif-report
    path: motif-report.json
```

### Pre-commit hook (with Husky)

```bash
npx husky add .husky/pre-commit "npx motif lint --quiet"
```

---

## Supported File Types

| Extension | Parser |
|-----------|--------|
| `.js` | `@typescript-eslint/parser` |
| `.ts` | `@typescript-eslint/parser` |
| `.jsx` | `@typescript-eslint/parser` + JSX |
| `.tsx` | `@typescript-eslint/parser` + JSX |

---

## Contributing

Pull requests welcome. For major changes, open an issue first.

```bash
git clone https://github.com/useMotif/motif
cd motif
npm install
node bin/motif.js lint ./src
```

---

## License

MIT
