/** @jsx h */

import h from '../../../helpers/h'

export default function(editor) {
  editor.deleteForward()
}

export const input = (
  <value>
    <document>
      <paragraph>
        w<cursor />ord
      </paragraph>
    </document>
  </value>
)

export const output = (
  <value>
    <document>
      <paragraph>
        w<cursor />rd
      </paragraph>
    </document>
  </value>
)
