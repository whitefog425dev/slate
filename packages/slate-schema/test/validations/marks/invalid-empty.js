/** @jsx jsx */

import { jsx } from 'slate-hyperscript'

export const schema = [
  {
    for: 'node',
    match: 'element',
    validate: {
      marks: [],
    },
  },
]

export const input = (
  <editor>
    <element>
      <mark a>text</mark>
    </element>
  </editor>
)

export const output = (
  <editor>
    <element>text</element>
  </editor>
)
