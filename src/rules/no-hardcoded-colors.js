'use strict'

const HEX_RE = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const RGB_RE = /^rgba?\s*\(/i
const HSL_RE = /^hsla?\s*\(/i
const TAILWIND_ARBITRARY_COLOR_RE = /(?:^|\s)(?:text|bg|border|ring|fill|stroke|from|to|via|decoration|outline|shadow|caret|accent)-\[#[0-9a-fA-F]{3,8}\]/

const COLOR_PROPS = new Set([
  'color', 'background', 'backgroundColor',
  'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
  'outlineColor', 'fill', 'stroke', 'caretColor', 'textDecorationColor', 'columnRuleColor',
])

function isHardcodedColor(value) {
  if (typeof value !== 'string') return false
  return HEX_RE.test(value) || RGB_RE.test(value) || HSL_RE.test(value)
}

module.exports = {
  meta: {
    name: 'no-hardcoded-colors',
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded color values in JSX style props and Tailwind arbitrary classes',
      category: 'Design Tokens',
      url: 'https://motif.dev/docs/rules/no-hardcoded-colors',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowedColors: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific color values that are allowed (e.g. ["#000000", "#ffffff"])',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options || {}
    const allowedColors = new Set((options.allowedColors || []).map(c => c.toLowerCase()))

    function isAllowed(value) {
      return allowedColors.has(value.toLowerCase())
    }

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
            if (!COLOR_PROPS.has(propName)) continue
            const val = prop.value
            if (val?.type === 'Literal' && isHardcodedColor(val.value) && !isAllowed(val.value)) {
              context.report({
                node: val,
                message: `Hardcoded color "${val.value}" for "${propName}" — use a design token instead`,
              })
            }
          }
        } else if (attrName === 'className') {
          const val = node.value
          if (!val || val.type !== 'Literal' || typeof val.value !== 'string') return
          if (TAILWIND_ARBITRARY_COLOR_RE.test(val.value)) {
            context.report({
              node: val,
              message: 'Tailwind arbitrary color in className — use a design token instead',
            })
          }
        }
      },
    }
  },
}
