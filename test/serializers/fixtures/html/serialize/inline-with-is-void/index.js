
import React from 'react'

export default {
  rules: [
    {
      serialize(obj, children) {
        if (obj.kind == 'block' && obj.type == 'paragraph') {
          return <p>{children}</p>
        }
        if (obj.kind == 'inline' && obj.type == 'image') {
          return <img />
        }
      }
    }
  ]
}
