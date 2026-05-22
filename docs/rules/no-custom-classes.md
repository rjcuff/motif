# no-custom-classes

**Type:** suggestion  
**Default severity:** warn  
**Category:** Design System

Enforce use of design system class names. Flags any class in `className` that isn't in the `allowedClasses` list in your config.

## Why

Ad-hoc class names are the most common source of design system drift. `btn-special`, `header-big`, `my-custom-card` — each one is a new one-off decision that diverges from the design system. By maintaining an explicit allowlist of valid classes, you can guarantee that only design-approved patterns make it into production.

## Examples

Given config:

```js
tokens: {
  allowedClasses: ['btn', 'btn-primary', 'btn-secondary', 'card', 'text-heading'],
}
```

**Incorrect:**

```tsx
<button className="btn-special">Submit</button>
<div className="card my-custom-spacing">Content</div>
<h1 className="text-heading super-big">Title</h1>
```

**Correct:**

```tsx
<button className="btn btn-primary">Submit</button>
<div className="card">Content</div>
<h1 className="text-heading">Title</h1>
```

## Options

```js
'no-custom-classes': ['warn', {
  allowedPrefixes: ['tw-', 'js-'],
}]
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `allowedPrefixes` | `string[]` | `[]` | Class prefixes that are always allowed (useful for Tailwind, BEM modifiers) |

**Example — allow all Tailwind utility classes via prefix:**

```js
'no-custom-classes': ['warn', {
  allowedPrefixes: ['text-', 'bg-', 'p-', 'm-', 'flex', 'grid', 'border', 'rounded', 'shadow'],
}]
```

## Notes

- The rule only checks **static string literals** in `className`. Dynamic expressions (`className={clsx(...)}`, template literals) are not checked.
- The `allowedClasses` list in `tokens` is your source of truth. Keep it version-controlled and reviewed.
- If `allowedClasses` is empty and no `allowedPrefixes` are configured, the rule produces no violations (it can't flag anything without a reference list).
