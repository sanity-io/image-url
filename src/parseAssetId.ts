const example = 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg'

/**
 * @internal
 */
export function parseAssetId(ref: string) {
  const [, id, dimensionString, format] = ref.split('-')

  if (!id || !dimensionString || !format) {
    throw new Error(`Malformed asset _ref '${ref}'. Expected an id like "${example}".`)
  }

  const [imgWidthStr, imgHeightStr] = dimensionString.split('x')

  const width = +imgWidthStr
  const height = +imgHeightStr

  const isValidAssetId = isFinite(width) && isFinite(height)
  if (!isValidAssetId) {
    throw new Error(`Malformed asset _ref '${ref}'. Expected an id like "${example}".`)
  }

  return {id, width, height, format}
}
