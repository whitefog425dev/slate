
import Editor, { Mark, Raw } from '../..'
import React from 'react'
import ReactDOM from 'react-dom'
import keycode from 'keycode'

/**
 * Define the initial state.
 *
 * @type {Object} state
 */

const state = {
  nodes: [
    {
      type: 'paragraph',
      nodes: [
        {
          type: 'text',
          ranges: [
            {
              text: 'The editor gives you full control over the logic you can add. For example, it\'s fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with "> " you get a blockquote that looks like this:',
            }
          ]
        }
      ]
    },
    {
      type: 'block-quote',
      nodes: [
        {
          type: 'text',
          ranges: [
            {
              text: 'A wise quote.'
            }
          ]
        }
      ]
    },
    {
      type: 'paragraph',
      nodes: [
        {
          type: 'text',
          ranges: [
            {
              text: 'Order when you start a line with "## " you get a level-two heading, like this:',
            }
          ]
        }
      ]
    },
    {
      type: 'heading-two',
      nodes: [
        {
          type: 'text',
          ranges: [
            {
              text: 'Try it out!'
            }
          ]
        }
      ]
    },
    {
      type: 'paragraph',
      nodes: [
        {
          type: 'text',
          ranges: [
            {
              text: 'Try it out for yourself! Try starting a new line with ">", "-", or "#"s.'
            }
          ]
        }
      ]
    }
  ]
}

/**
 * Define our example app.
 *
 * @type {Component} App
 */

class App extends React.Component {

  /**
   * Deserialize the raw initial state.
   *
   * @type {Object}
   */

  state = {
    state: Raw.deserialize(state)
  };

  /**
   * Render the example.
   *
   * @return {Component} component
   */

  render() {
    return (
      <div className="editor">
        <Editor
          state={this.state.state}
          renderNode={node => this.renderNode(node)}
          renderMark={mark => this.renderMark(mark)}
          onKeyDown={(e, state) => this.onKeyDown(e, state)}
          onChange={(state) => {
            console.groupCollapsed('Change!')
            console.log('Document:', state.document.toJS())
            console.log('Selection:', state.selection.toJS())
            console.log('Content:', Raw.serialize(state))
            console.groupEnd()
            this.setState({ state })
          }}
        />
      </div>
    )
  }

  /**
   * Render each of our custom `node` types.
   *
   * @param {Node} node
   * @return {Component} component
   */

  renderNode(node) {
    switch (node.type) {
      case 'block-quote': {
        return (props) => <blockquote>{props.children}</blockquote>
      }
      case 'bulleted-list': {
        return (props) => <ul>{props.chidlren}</ul>
      }
      case 'heading-one': {
        return (props) => <h1>{props.children}</h1>
      }
      case 'heading-two': {
        return (props) => <h2>{props.children}</h2>
      }
      case 'heading-three': {
        return (props) => <h3>{props.children}</h3>
      }
      case 'heading-four': {
        return (props) => <h4>{props.children}</h4>
      }
      case 'heading-five': {
        return (props) => <h5>{props.children}</h5>
      }
      case 'heading-six': {
        return (props) => <h6>{props.children}</h6>
      }
      case 'list-item': {
        return (props) => <li>{props.chidlren}</li>
      }
      case 'numbered-list': {
        return (props) => <ol>{props.children}</ol>
      }
      case 'paragraph': {
        return (props) => <p>{props.children}</p>
      }
    }
  }

  /**
   * On key down, check for our specific key shortcuts.
   *
   * @param {Event} e
   * @param {State} state
   * @return {State or Null} state
   */

  onKeyDown(e, state) {
    const key = keycode(e.which)
    switch (key) {
      case 'space': return this.onSpace(e, state)
      case 'backspace': return this.onBackspace(e, state)
      case 'enter': return this.onEnter(e, state)
    }
  }

  /**
   * On space, if it was after an auto-markdown shortcut, convert the current
   * node into the shortcut's corresponding type.
   *
   * @param {Event} e
   * @param {State} state
   * @return {State or Null} state
   */

  onSpace(e, state) {
    if (state.isCurrentlyExpanded) return
    let { selection } = state
    const { currentTextNodes, document } = state
    const { startOffset } = selection
    const node = currentTextNodes.first()
    const { text } = node
    const chars = text.slice(0, startOffset).replace(/\s*/g, '')
    let transform = state.transform()

    switch (chars) {
      case '#':
        transform = transform.setType('heading-one')
        break
      case '##':
        transform = transform.setType('heading-two')
        break
      case '###':
        transform = transform.setType('heading-three')
        break
      case '####':
        transform = transform.setType('heading-four')
        break
      case '#####':
        transform = transform.setType('heading-five')
        break
      case '######':
        transform = transform.setType('heading-six')
        break
      case '>':
        transform = transform.setType('block-quote')
        break
      case '-':
        transform = transform.setType('list-item')
        const wrapper = document.getParentNode(node)
        if (wrapper.type == 'paragraph') transform = transform.setType('bulleted-list')
        if (wrapper.type == 'bulleted-list') transform = transform.wrap('list-item')
        if (wrapper.type == 'list-item') transform = transform.wrap('unordered-list')
        break
      default:
        return
    }

    state = transform
      .deleteAtRange(selection.extendBackwardToStartOf(node))
      .apply()

    selection = selection.moveToStartOf(node)
    state = state.merge({ selection })
    e.preventDefault()
    return state
  }

  /**
   * On backspace, if at the start of a non-paragraph, convert it back into a
   * paragraph node.
   *
   * @param {Event} e
   * @param {State} state
   * @return {State or Null} state
   */

  onBackspace(e, state) {
    if (state.isCurrentlyExpanded) return
    if (state.currentStartOffset != 0) return
    const node = state.currentWrappingNodes.first()
    if (node.type == 'paragraph') return

    e.preventDefault()
    return state
      .transform()
      .setType('paragraph')
      .apply()
  }

  /**
   * On return, if at the end of a node type that should not be extended,
   * create a new paragraph below it.
   *
   * @param {Event} e
   * @param {State} state
   * @return {State or Null} state
   */

  onEnter(e, state) {
    if (state.isCurrentlyExpanded) return
    const node = state.currentWrappingNodes.first()
    if (state.currentStartOffset == 0 && node.length == 0) return this.onBackspace(e, state)
    if (state.currentEndOffset != node.length) return

    if (
      node.type != 'heading-one' &&
      node.type != 'heading-two' &&
      node.type != 'heading-three' &&
      node.type != 'heading-four' &&
      node.type != 'heading-five' &&
      node.type != 'heading-six' &&
      node.type != 'block-quote'
    ) {
      return
    }

    e.preventDefault()
    return state
      .transform()
      .split()
      .setType('paragraph')
      .apply()
  }

}

/**
 * Mount the app.
 */

const app = <App />
const root = document.body.querySelector('main')
ReactDOM.render(app, root)
