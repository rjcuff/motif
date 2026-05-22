'use strict'

module.exports = {
  meta: {
    name: 'no-custom-classes',
    type: 'suggestion',
    docs: {
      description: 'Enforce use of design system classes — disallow ad-hoc class names',
      category: 'Design System',
      url: 'https://motif.dev/docs/rules/no-custom-classes',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowedPrefixes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Class prefixes that are always allowed (e.g. ["tw-", "js-"])',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options || {}
    const allowedClasses = new Set(context.settings?.tokens?.allowedClasses || [])
    const allowedPrefixes = options.allowedPrefixes || []

    if (allowedClasses.size === 0 && allowedPrefixes.length === 0) return {}

    function isAllowed(cls) {
      if (allowedClasses.has(cls)) return true
      return allowedPrefixes.some(prefix => cls.startsWith(prefix))
    }

    return {
      JSXAttribute(node) {
        if (node.name?.name !== 'className') return
        const val = node.value
        if (!val || val.type !== 'Literal' || typeof val.value !== 'string') return

        const classes = val.value.split(/\s+/).filter(Boolean)
        for (const cls of classes) {
          if (!isAllowed(cls)) {
            context.report({
              node: val,
              message: `Class "${cls}" is not in the allowed list — use a design system class`,
            })
          }
        }
      },
    }
  },
}
