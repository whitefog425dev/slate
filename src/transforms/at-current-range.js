
import Normalize from '../utils/normalize'

/**
 * Add a `mark` to the characters in the current selection.
 *
 * @param {Transform} transform
 * @param {Mark} mark
 */

export function addMark(transform, mark) {
  mark = Normalize.mark(mark)
  const { state } = transform
  const { document, selection } = state

  if (selection.isExpanded) {
    transform.addMarkAtRange(selection, mark)
    return
  }

  if (selection.marks) {
    const marks = selection.marks.add(mark)
    const sel = selection.merge({ marks })
    transform.moveTo(sel)
    return
  }

  const marks = document.getMarksAtRange(selection).add(mark)
  const sel = selection.merge({ marks })
  transform.moveTo(sel)
}

/**
 * Delete at the current selection.
 *
 * @param {Transform} transform
 */

export function _delete(transform) {
  const { state } = transform
  const { selection } = state
  if (selection.isCollapsed) return

  transform
    .snapshotSelection()
    .deleteAtRange(selection)
    // Ensure that the selection is collapsed to the start, because in certain
    // cases when deleting across inline nodes this isn't guaranteed.
    .collapseToStart()
    .snapshotSelection()
}

/**
 * Delete backward `n` characters at the current selection.
 *
 * @param {Transform} transform
 * @param {Number} n (optional)
 */

export function deleteBackward(transform, n = 1) {
  const { state } = transform
  const { selection } = state
  transform.deleteBackwardAtRange(selection, n)
}

/**
 * Delete backward until the character boundary at the current selection.
 *
 * @param {Transform} transform
 */

export function deleteCharBackward(transform) {
  const { state } = transform
  const { selection } = state
  transform.deleteCharBackwardAtRange(selection)
}

/**
 * Delete backward until the line boundary at the current selection.
 *
 * @param {Transform} transform
 */

export function deleteLineBackward(transform) {
  const { state } = transform
  const { selection } = state
  transform.deleteLineBackwardAtRange(selection)
}

/**
 * Delete backward until the word boundary at the current selection.
 *
 * @param {Transform} transform
 */

export function deleteWordBackward(transform) {
  const { state } = transform
  const { selection } = state
  transform.deleteWordBackwardAtRange(selection)
}

/**
 * Delete forward `n` characters at the current selection.
 *
 * @param {Transform} transform
 * @param {Number} n (optional)
 */

export function deleteForward(transform, n = 1) {
  const { state } = transform
  const { selection } = state
  transform.deleteForwardAtRange(selection, n)
}

/**
 * Delete forward until the character boundary at the current selection.
 *
 * @param {Transform} transform
 */

export function deleteCharForward(transform) {
  const { state } = transform
  const { selection } = state
  transform.deleteCharForwardAtRange(selection)
}

/**
 * Delete forward until the line boundary at the current selection.
 *
 * @param {Transform} transform
 */

export function deleteLineForward(transform) {
  const { state } = transform
  const { selection } = state
  transform.deleteLineForwardAtRange(selection)
}

/**
 * Delete forward until the word boundary at the current selection.
 *
 * @param {Transform} transform
 */

export function deleteWordForward(transform) {
  const { state } = transform
  const { selection } = state
  transform.deleteWordForwardAtRange(selection)
}

/**
 * Insert a `block` at the current selection.
 *
 * @param {Transform} transform
 * @param {String|Object|Block} block
 */

export function insertBlock(transform, block) {
  block = Normalize.block(block)
  const { state } = transform
  const { selection } = state
  transform.insertBlockAtRange(selection, block)

  // If the node was successfully inserted, update the selection.
  const node = transform.state.document.getNode(block.key)
  if (node) transform.collapseToEndOf(node)
}

/**
 * Insert a `fragment` at the current selection.
 *
 * @param {Transform} transform
 * @param {Document} fragment
 */

export function insertFragment(transform, fragment) {
  let { state } = transform
  let { document, selection } = state

  if (!fragment.length) return

  const { startText, endText } = state
  const lastText = fragment.getLastText()
  const lastInline = fragment.getClosestInline(lastText.key)
  const keys = document.getTexts().map(text => text.key)
  const isAppending = (
    selection.hasEdgeAtEndOf(endText) ||
    selection.hasEdgeAtStartOf(startText)
  )

  transform.unsetSelection()
  transform.insertFragmentAtRange(selection, fragment)
  state = transform.state
  document = state.document

  const newTexts = document.getTexts().filter(n => !keys.includes(n.key))
  const newText = isAppending ? newTexts.last() : newTexts.takeLast(2).first()
  let after

  if (newText && lastInline) {
    after = selection.collapseToEndOf(newText)
  }

  else if (newText) {
    after = selection
      .collapseToStartOf(newText)
      .moveForward(lastText.length)
  }

  else {
    after = selection
      .collapseToStart()
      .moveForward(lastText.length)
  }

  transform.moveTo(after)
}

/**
 * Insert a `inline` at the current selection.
 *
 * @param {Transform} transform
 * @param {String|Object|Block} inline
 */

export function insertInline(transform, inline) {
  inline = Normalize.inline(inline)
  const { state } = transform
  const { selection } = state
  transform.insertInlineAtRange(selection, inline)

  // If the node was successfully inserted, update the selection.
  const node = transform.state.document.getNode(inline.key)
  if (node) transform.collapseToEndOf(node)
}

/**
 * Insert a `text` string at the current selection.
 *
 * @param {Transform} transform
 * @param {String} text
 * @param {Set<Mark>} marks (optional)
 */

export function insertText(transform, text, marks) {
  const { state } = transform
  const { document, selection } = state
  marks = marks || selection.marks
  transform.insertTextAtRange(selection, text, marks)

  // If the text was successfully inserted, and the selection had marks on it,
  // unset the selection's marks.
  if (selection.marks && document != transform.state.document) {
    transform.unsetMarks()
  }
}

/**
 * Set `properties` of the block nodes in the current selection.
 *
 * @param {Transform} transform
 * @param {Object} properties
 */

export function setBlock(transform, properties) {
  const { state } = transform
  const { selection } = state
  transform.setBlockAtRange(selection, properties)
}

/**
 * Set `properties` of the inline nodes in the current selection.
 *
 * @param {Transform} transform
 * @param {Object} properties
 */

export function setInline(transform, properties) {
  const { state } = transform
  const { selection } = state
  transform.setInlineAtRange(selection, properties)
}

/**
 * Split the block node at the current selection, to optional `depth`.
 *
 * @param {Transform} transform
 * @param {Number} depth (optional)
 */

export function splitBlock(transform, depth = 1) {
  let { state } = transform
  let { selection } = state
  transform
    .snapshotSelection()
    .splitBlockAtRange(selection, depth)
    .collapseToEnd()
    .snapshotSelection()
}

/**
 * Split the inline nodes at the current selection, to optional `depth`.
 *
 * @param {Transform} transform
 * @param {Number} depth (optional)
 */

export function splitInline(transform, depth = Infinity) {
  let { state } = transform
  let { selection } = state
  transform
    .snapshotSelection()
    .splitInlineAtRange(selection, depth)
    .snapshotSelection()
}

/**
 * Remove a `mark` from the characters in the current selection.
 *
 * @param {Transform} transform
 * @param {Mark} mark
 */

export function removeMark(transform, mark) {
  mark = Normalize.mark(mark)
  const { state } = transform
  const { document, selection } = state

  if (selection.isExpanded) {
    transform.removeMarkAtRange(selection, mark)
    return
  }

  if (selection.marks) {
    const marks = selection.marks.remove(mark)
    const sel = selection.merge({ marks })
    transform.moveTo(sel)
    return
  }

  const marks = document.getMarksAtRange(selection).remove(mark)
  const sel = selection.merge({ marks })
  transform.moveTo(sel)
}

/**
 * Add or remove a `mark` from the characters in the current selection,
 * depending on whether it's already there.
 *
 * @param {Transform} transform
 * @param {Mark} mark
 */

export function toggleMark(transform, mark) {
  mark = Normalize.mark(mark)
  const { state } = transform
  const exists = state.marks.some(m => m.equals(mark))

  if (exists) {
    transform.removeMark(mark)
  } else {
    transform.addMark(mark)
  }
}

/**
 * Unwrap the current selection from a block parent with `properties`.
 *
 * @param {Transform} transform
 * @param {Object|String} properties
 */

export function unwrapBlock(transform, properties) {
  const { state } = transform
  const { selection } = state
  transform.unwrapBlockAtRange(selection, properties)
}

/**
 * Unwrap the current selection from an inline parent with `properties`.
 *
 * @param {Transform} transform
 * @param {Object|String} properties
 */

export function unwrapInline(transform, properties) {
  const { state } = transform
  const { selection } = state
  transform.unwrapInlineAtRange(selection, properties)
}

/**
 * Wrap the block nodes in the current selection with a new block node with
 * `properties`.
 *
 * @param {Transform} transform
 * @param {Object|String} properties
 */

export function wrapBlock(transform, properties) {
  const { state } = transform
  const { selection } = state
  transform.wrapBlockAtRange(selection, properties)
}

/**
 * Wrap the current selection in new inline nodes with `properties`.
 *
 * @param {Transform} transform
 * @param {Object|String} properties
 */

export function wrapInline(transform, properties) {
  let { state } = transform
  let { document, selection } = state
  let after

  const { startKey } = selection
  const previous = document.getPreviousText(startKey)

  transform.unsetSelection()
  transform.wrapInlineAtRange(selection, properties)
  state = transform.state
  document = state.document

  // Determine what the selection should be after wrapping.
  if (selection.isCollapsed) {
    after = selection
  }

  else if (selection.startOffset == 0) {
    const text = previous ? document.getNextText(previous.key) : document.getFirstText()
    after = selection.moveToRangeOf(text)
  }

  else if (selection.startKey == selection.endKey) {
    const text = document.getNextText(selection.startKey)
    after = selection.moveToRangeOf(text)
  }

  else {
    const anchor = document.getNextText(selection.anchorKey)
    const focus = document.getDescendant(selection.focusKey)
    after = selection.merge({
      anchorKey: anchor.key,
      anchorOffset: 0,
      focusKey: focus.key,
      focusOffset: selection.focusOffset
    })
  }

  after = after.normalize(document)
  transform.moveTo(after)
}

/**
 * Wrap the current selection with prefix/suffix.
 *
 * @param {Transform} transform
 * @param {String} prefix
 * @param {String} suffix
 */

export function wrapText(transform, prefix, suffix = prefix) {
  const { state } = transform
  const { selection } = state
  transform.wrapTextAtRange(selection, prefix, suffix)

  // Adding the suffix will have pushed the end of the selection further on, so
  // we need to move it back to account for this.
  transform.moveEndOffset(0 - suffix.length)

  // If the selection was collapsed, it will have moved the start offset too.
  if (selection.isCollapsed) {
    transform.moveStartOffset(0 - prefix.length)
  }
}
