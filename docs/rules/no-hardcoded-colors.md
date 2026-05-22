# no-hardcoded-colors

**Type:** problem  
**Default severity:** error  
**Category:** Design Tokens

Disallow hardcoded color values in JSX `style` props and Tailwind arbitrary color classes. Forces all colors through your design token system.

## Why

Hardcoded colors fragment your design system. A `#1a73e8` in one component and `#1A73E8` in another are visually identical but impossible to update together. Design tokens — CSS custom properties — let you update every color in one place.

## Examples

**Incorrect:**

```tsx
// Hex color in style prop
<div style={{ color: '#ff0000' }}>Error</div>

// RGB color in style prop
<div style={{ backgroundColor: 'rgb(255, 0, 0)' }}>Error</div>

// Tailwind arbitrary color class
<span className="text-[#1a73e8]">Link</span>
<div className="bg-[#f0f0f0] border-[#cccccc]">Card</div>
```

**Correct:**

```tsx
// CSS variable token
<div style={{ color: 'var(--color-danger)' }}>Error</div>

// Design system class
<span className="text-primary">Link</span>
<div className="bg-surface border-muted">Card</div>
```

## Options

```js
'no-hardcoded-colors': ['error', {
  allowedColors: ['#000000', '#ffffff'],
}]
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `allowedColors` | `string[]` | `[]` | Specific color values to allow (case-insensitive) |

**Example — allow true black and white:**

```js
'no-hardcoded-colors': ['error', {
  allowedColors: ['#000', '#000000', '#fff', '#ffffff'],
}]
```

## Detected patterns

| Pattern | Example |
|---------|---------|
| Hex 3-digit | `#f00` |
| Hex 6-digit | `#ff0000` |
| Hex 8-digit (alpha) | `#ff0000cc` |
| RGB | `rgb(255, 0, 0)` |
| RGBA | `rgba(255, 0, 0, 0.5)` |
| HSL | `hsl(0, 100%, 50%)` |
| HSLA | `hsla(0, 100%, 50%, 0.5)` |
| Tailwind arbitrary | `text-[#ff0000]`, `bg-[#abc]` |

**Not detected (out of scope for MVP):**

- Named CSS colors (`red`, `tomato`) — low priority, common in prototyping
- Colors in template literals (`className={\`text-[${color}]\`}`)
- Colors in `clsx()` / `cn()` calls

## CSS properties checked

`color`, `background`, `backgroundColor`, `borderColor`, `borderTopColor`, `borderRightColor`, `borderBottomColor`, `borderLeftColor`, `outlineColor`, `fill`, `stroke`, `caretColor`, `textDecorationColor`, `columnRuleColor`
