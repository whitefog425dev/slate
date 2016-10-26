
import assert from 'assert'

export default function (state) {
  const { document, selection } = state
  const texts = document.getTexts()
  const firstText = texts.first()
  const secondText = texts.get(1)

  const nextSelection = selection.merge({
      anchorKey: firstText.key,
      focusKey: firstText.key,
      anchorOffset: 2,
      focusOffset: 2
  })

  const next = state
    .transform()
    .moveTo(nextSelection)
    .insertTextByKey(secondText.key, 5, 'X')
    .apply()

  assert.deepEqual(
    next.selection.toJS(),
    nextSelection.toJS()
  )

  return next
}
