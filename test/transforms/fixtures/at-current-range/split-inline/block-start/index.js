
import assert from 'assert'

export default function (state) {
  const { document, selection } = state
  const texts = document.getTexts()
  const second = texts.get(1)
  const range = selection.merge({
    anchorKey: second.key,
    anchorOffset: 0,
    focusKey: second.key,
    focusOffset: 0
  })

  const next = state
    .transform()
    .moveTo(range)
    .splitInline()
    .apply()

  const updated = next.document.getTexts().get(1)

  assert.deepEqual(
    next.selection.toJS(),
    range.collapseToStartOf(updated).toJS()
  )

  return next
}
