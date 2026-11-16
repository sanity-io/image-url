import type {SanityImageLike, SanityImageWithAsset} from './types'

/**
 * Checks that an image value has an asset that a URL can be built from. Image
 * fields can be saved before an asset is uploaded, and an `asset->` projection
 * returns `null` when the asset is missing, so TypeGen types `asset` as
 * optional or nullable.
 *
 * @example
 * ```ts
 * if (isImageWithAsset(data?.cover)) {
 *   builder.image(data.cover).width(800).url()
 * }
 * ```
 *
 * @public
 */
export function isImageWithAsset<T extends SanityImageLike>(
  value: T | null | undefined
): value is SanityImageWithAsset<T> {
  if (!value || typeof value !== 'object') {
    return false
  }

  const asset = value.asset as {_ref?: unknown; _id?: unknown; url?: unknown} | null | undefined
  if (!asset || typeof asset !== 'object') {
    return false
  }

  return (
    typeof asset._ref === 'string' || typeof asset._id === 'string' || typeof asset.url === 'string'
  )
}
