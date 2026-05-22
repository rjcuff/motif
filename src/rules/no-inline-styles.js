'use strict'

module.exports = {
  meta: {
    name: 'no-inline-styles',
    type: 'suggestion',
    docs: {
      description: 'Disallow inline style props — use design tokens or utility classes instead',
      category: 'Design System',
      url: 'https://motif.dev/docs/rules/no-inline-styles',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowEmpty: {
            type: 'boolean',
            description: 'Allow empty style objects: style={{}}',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options || {}
    const allowEmpty = options.allowEmpty === true

    return {
      JSXAttribute(node) {
        if (node.name?.name !== 'style') return

        if (allowEmpty) {
          const expr = node.value
          if (expr?.type === 'JSXExpressionContainer') {
            const obj = expr.expression
            if (obj?.type === 'ObjectExpression' && obj.properties.length === 0) return
          }
        }

        context.report({
          node,
          message: 'Inline style detected — use a design token or utility class instead',
        })
      },
    }
  },
}
