# use-token-values

**Type:** problem  
**Default severity:** error  
**Category:** Design Tokens

Disallow raw dimension values in JSX `style` props and Tailwind arbitrary dimension classes. Forces spacing, sizing, and typography through your design token system.

## Why

`margin: '16px'` in 20 components means 20 places to update when your spacing scale changes. A token like `var(--spacing-md)` means one place. This rule enforces the habit that prevents spacing drift.

## Examples

**Incorrect:**

```tsx
// Raw pixels in style props
<div style={{ margin: '16px' }}>...</div>
<button style={{ padding: '8px 24px' }}>Submit</button>
<p style={{ fontSize: '14px', lineHeight: '1.5rem' }}>Text</p>

// Tailwind arbitrary dimension classes
<div className="w-[347px] h-[200px]">Panel</div>
<p className="text-[14px] leading-[1.5rem]">Text</p>
```

**Correct:**

```tsx
// CSS variable tokens
<div style={{ margin: 'var(--spacing-md)' }}>...</div>
<button style={{ padding: 'var(--spacing-xs) var(--spacing-lg)' }}>Submit</button>

// Design system classes
<div className="w-panel h-content">Panel</div>
<p className="text-body">Text</p>
```

## Options

```js
'use-token-values': ['error', {
  allowedValues: ['0', '100%', '100vw', '100vh'],
  checkProps: ['margin', 'padding', 'width', 'height'],
}]
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `allowedValues` | `string[]` | `[]` | Raw values to allow (e.g. `"0"`, `"100%"`) |
| `checkProps` | `string[]` | *(see below)* | Override the CSS properties that are checked |

**`allowedValues` tip:** `"0"` is commonly allowed since `var(--spacing-zero)` is impractical.

```js
'use-token-values': ['error', { allowedValues: ['0'] }]
```

## CSS properties checked by default

**Spacing:** `margin`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft`, `padding`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `gap`, `rowGap`, `columnGap`

**Sizing:** `width`, `height`, `maxWidth`, `minWidth`, `maxHeight`, `minHeight`

**Position:** `top`, `right`, `bottom`, `left`

**Typography:** `fontSize`, `lineHeight`, `letterSpacing`

**Border:** `borderWidth`, `borderRadius`

## Dimension units detected

`px`, `rem`, `em`, `vh`, `vw`, `vmin`, `vmax`, `%`
