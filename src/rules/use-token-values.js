'use strict'

const DIMENSION_RE = /^-?\d+(\.\d+)?(px|rem|em|vh|vw|vmin|vmax|%)$/
const TAILWIND_ARBITRARY_DIMENSION_RE = /\b\w+(?:-\w+)*-\[\d+(?:\.\d+)?(?:px|rem|em|vh|vw|vmin|vmax|%)\]/

const SPACING_PROPS = new Set([
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'gap', 'rowGap', 'columnGap',
  'width', 'height', 'maxWidth', 'minWidth', 'maxHeight', 'minHeight',
  'top', 'right', 'bottom', 'left',
  'fontSize', 'lineHeight', 'letterSpacing',
  'borderWidth', 'borderRadius',
])

module.exports = {
  meta: {
    name: 'use-token-values',
    type: 'problem',
    docs: {
      description: 'Enforce design token usage for spacing and sizing — disallow raw dimension values',
      category: 'Design Tokens',
      url: 'https://motif.dev/docs/rules/use-token-values',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowedValues: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific raw values that are allowed (e.g. ["0", "100%"])',
          },
          checkProps: {
            type: 'array',
            items: { type: 'string' },
            description: 'Override the list of CSS properties to check',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options || {}
    const allowedValues = new Set(options.allowedValues || [])
    const propsToCheck = options.checkProps
      ? new Set(options.checkProps)
      : SPACING_PROPS

    return {
      JSXAttribute(node) {
        const attrName = node.name?.name

        if (attrName === 'style') {
          const expr = node.value
          if (!expr || expr.type !== 'JSXExpressionContainer') return
          const obj = expr.expression
          if (!obj || obj.type !== 'ObjectExpression') return

          for (const prop of obj.properties) {
            if (prop.type !== 'Property') continue
            const propName = prop.key?.name || prop.key?.value
            if (!propsToCheck.has(propName)) continue
            const val = prop.value
            if (val?.type === 'Literal' && typeof val.value === 'string') {
              if (DIMENSION_RE.test(val.value) && !allowedValues.has(val.value)) {
                context.report({
                  node: val,
                  message: `Raw value "${val.value}" for "${propName}" — use a design token instead`,
                })
              }
            }
          }
        } else if (attrName === 'className') {
          const val = node.value
          if (!val || val.type !== 'Literal' || typeof val.value !== 'string') return
          if (TAILWIND_ARBITRARY_DIMENSION_RE.test(val.value)) {
            context.report({
              node: val,
              message: 'Tailwind arbitrary dimension in className — use a design token instead',
            })
          }
        }
      },
    }
  },
}
