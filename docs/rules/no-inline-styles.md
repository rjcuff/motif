# no-inline-styles

**Type:** suggestion  
**Default severity:** warn  
**Category:** Design System

Disallow inline `style` props in JSX. Inline styles bypass your design system entirely and are harder to maintain, override, and theme.

## Why

Inline styles create one-off visual decisions scattered across the codebase. They can't be overridden with CSS specificity rules, they don't respond to design token updates, and they make theming (dark mode, white-labeling) difficult. Prefer utility classes or CSS custom properties.

## Examples

**Incorrect:**

```tsx
<div style={{ color: '#ff0000' }}>Error</div>
<button style={{ padding: '12px 24px', borderRadius: '4px' }}>Submit</button>
<p style={{ fontSize: '14px', lineHeight: '1.5' }}>Body text</p>
```

**Correct:**

```tsx
<div className="text-danger">Error</div>
<button className="btn btn-primary">Submit</button>
<p className="text-body">Body text</p>
```

## Options

```js
'no-inline-styles': ['warn', {
  allowEmpty: true,
}]
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `allowEmpty` | `boolean` | `false` | Allow empty style objects: `style={{}}` |

## When to disable

Disable per-line with a comment for cases where inline styles are genuinely necessary (e.g. dynamic width from user input, CSS variable overrides on a specific instance):

```tsx
{/* Inline style required — width is dynamic from user-resizable panel */}
<div style={{ width: panelWidth }}>...</div>
```

Or disable in config for a specific file pattern:

```js
ignore: ['**/DynamicLayout.tsx'],
```
