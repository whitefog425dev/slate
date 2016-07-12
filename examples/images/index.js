
import { Editor, Mark, Raw } from '../..'
import React from 'react'
import ReactDOM from 'react-dom'
import initialState from './state.json'
import { Map } from 'immutable'

/**
 * Node renderers.
 *
 * @type {Object}
 */

const NODES = {
  image: (props) => {
    const { node, state } = props
    const { data } = node
    const isActive = state.isFocused && state.blocks.includes(node)
    const src = data.get('src')
    return <img {...props.attributes} src={src} data-active={isActive} />
  }
}

/**
 * The images example.
 *
 * @type {Component}
 */

class Images extends React.Component {

  state = {
    state: Raw.deserialize(initialState)
  };

  /**
   * Render the app.
   *
   * @return {Element} element
   */

  render = () => {
    return (
      <div>
        {this.renderToolbar()}
        {this.renderEditor()}
      </div>
    )
  }

  /**
   * Render the toolbar.
   *
   * @return {Element} element
   */

  renderToolbar = () => {
    return (
      <div className="menu toolbar-menu">
        <span className="button" onMouseDown={this.onClickImage}>
          <span className="material-icons">image</span>
        </span>
      </div>
    )
  }

  /**
   * Render the editor.
   *
   * @return {Element} element
   */

  renderEditor = () => {
    return (
      <div className="editor">
        <Editor
          state={this.state.state}
          renderNode={this.renderNode}
          onChange={this.onChange}
        />
      </div>
    )
  }

  /**
   * Render a `node`.
   *
   * @param {Node} node
   * @return {Element}
   */

  renderNode = (node) => {
    return NODES[node.type]
  }

  /**
   * On change.
   *
   * @param {State} state
   */

  onChange = (state) => {
    console.groupCollapsed('Change!')
    console.log('Document:', state.document.toJS())
    console.log('Selection:', state.selection.toJS())
    console.log('Content:', Raw.serialize(state))
    console.groupEnd()
    this.setState({ state })
  }

  /**
   * On clicking the image button, prompt for an image and insert it.
   *
   * @param {Event} e
   */

  onClickImage = (e) => {
    e.preventDefault()
    const src = window.prompt('Enter the URL of the image:')
    if (!src) return
    this.insertImage(src)
  }

  /**
   * Insert an image with `src` at the current selection.
   *
   * @param {String} src
   */

  insertImage = (src) => {
    let { state } = this.state

    if (state.isExpanded) {
      state = state
        .transform()
        .delete()
        .apply()
    }

    const { anchorBlock, selection } = state
    let transform = state.transform()

    if (anchorBlock.text != '') {
      if (selection.isAtEndOf(anchorBlock)) {
        transform = transform.splitBlock()
      } else if (selection.isAtStartOf(anchorBlock)) {
        transform = transform.splitBlock().moveToStartOfPreviousBlock()
      } else {
        transform = transform.splitBlock().splitBlock().moveToStartOfPreviousBlock()
      }
    }

    state = transform
      .setBlock({
        type: 'image',
        isVoid: true,
        data: { src }
      })
      .apply()

    this.setState({ state })
  }

}

/**
 * Export.
 */

export default Images
