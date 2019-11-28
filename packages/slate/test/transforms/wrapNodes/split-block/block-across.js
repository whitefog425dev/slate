/** @jsx jsx */

import { Editor } from 'slate'
import { jsx } from '../../..'

export const input = (
  <editor>
    <block>
      on
      <anchor />e
    </block>
    <block>
      t<focus />
      wo
    </block>
  </editor>
)

export const run = editor => {
  Editor.wrapNodes(editor, <block new />, { split: true })
}

export const output = (
  <editor>
    <block>on</block>
    <block new>
      <block>
        <anchor />e
      </block>
      <block>
        t<focus />
      </block>
    </block>
    <block>wo</block>
  </editor>
)
