import React from 'react'

// Should trigger: no-hardcoded-colors (error), no-inline-styles (warn)
const Bad = () => (
  <div style={{ color: '#ff0000', margin: '16px' }}>
    hello
  </div>
)

// Should trigger: no-inline-styles (warn), use-token-values (error)
const AlsoWrong = () => (
  <button style={{ padding: '24px' }} className="btn-special w-[347px]">
    click
  </button>
)

// Should trigger: no-custom-classes (warn)
const WrongClass = () => (
  <div className="btn my-random-class text-[#abc]">
    content
  </div>
)

// Clean — no violations
const Good = () => (
  <div style={{ color: 'var(--color-primary)' }} className="btn card">
    good
  </div>
)
