import {parseAssetId} from './parseAssetId'
import type {
  CropSpec,
  HotspotSpec,
  SanityImageCrop,
  SanityImageHotspot,
  SanityImageObject,
  SanityImageRect,
} from './types'

/**
 * The Image API ignores unknown search params, so the crop and hotspot from the image record
 * travel in these params. Building from a URL reads them back, so `rect` is recomputed for new
 * dimensions and fit modes. `rect` itself is never read back: it may have been computed for
 * another aspect ratio or fit mode.
 *
 * Both are in source pixels: `x-crop=left,top,width,height` and
 * `x-hotspot=centerX,centerY,width,height`.
 */
export const CROP_INTENT_PARAM = 'x-crop'
export const HOTSPOT_INTENT_PARAM = 'x-hotspot'

interface Dimensions {
  width: number
  height: number
}

/**
 * @internal
 */
export function isFullImage(rect: SanityImageRect, asset: Dimensions): boolean {
  return (
    rect.left === 0 && rect.top === 0 && rect.width === asset.width && rect.height === asset.height
  )
}

/**
 * @internal
 */
export function hotspotCenter(hotspot: HotspotSpec): {x: number; y: number} {
  return {
    x: Math.round((hotspot.right - hotspot.left) / 2 + hotspot.left),
    y: Math.round((hotspot.bottom - hotspot.top) / 2 + hotspot.top),
  }
}

/**
 * Search params that record the crop and hotspot of the image record, left out when they are the
 * defaults (no crop, and a hotspot covering the whole image).
 *
 * @internal
 */
export function intentParams(options: {
  asset: Dimensions
  crop: CropSpec
  hotspot: HotspotSpec
}): string[] {
  const {asset, crop, hotspot} = options
  const params: string[] = []

  if (!isFullImage(crop, asset)) {
    params.push(`${CROP_INTENT_PARAM}=${crop.left},${crop.top},${crop.width},${crop.height}`)
  }

  const center = hotspotCenter(hotspot)
  const width = Math.round(hotspot.right - hotspot.left)
  const height = Math.round(hotspot.bottom - hotspot.top)
  const isDefaultHotspot =
    center.x === Math.round(asset.width / 2) &&
    center.y === Math.round(asset.height / 2) &&
    width === asset.width &&
    height === asset.height
  if (!isDefaultHotspot) {
    params.push(`${HOTSPOT_INTENT_PARAM}=${center.x},${center.y},${width},${height}`)
  }

  return params
}

const ASSET_FILENAME_PATTERN = /^([a-zA-Z0-9]+)-(\d+x\d+)\.([a-z0-9]+)$/

/**
 * Resolves an image record from a Sanity CDN URL: the asset id from the filename (also when the
 * URL has a vanity name or search params), and the crop and hotspot from the search params.
 *
 * @internal
 */
export function imageFromUrl(url: string): SanityImageObject {
  const {pathname, searchParams} = new URL(url)
  const filename = pathname
    .split('/')
    .reverse()
    .find((segment) => ASSET_FILENAME_PATTERN.test(segment))
  if (!filename) {
    return {asset: {_ref: legacyUrlToId(url)}}
  }

  const [, id, dimensions, format] = ASSET_FILENAME_PATTERN.exec(filename)!
  const _ref = `image-${id}-${dimensions}-${format}`
  const asset = parseAssetId(_ref)
  const image: SanityImageObject = {asset: {_ref}}

  const crop = parseRect(searchParams.get(CROP_INTENT_PARAM), asset)
  if (crop) {
    image.crop = cropFromRect(crop, asset)
  }

  const hotspot = parseNumbers(searchParams.get(HOTSPOT_INTENT_PARAM))
  if (hotspot && hotspot.every((value) => value >= 0)) {
    image.hotspot = hotspotFromPixels(hotspot, asset)
  }

  return image
}

function legacyUrlToId(url: string) {
  const parts = url.split('/').slice(-1)
  return `image-${parts[0]}`.replace(/\.([a-z]+)$/, '-$1')
}

function parseNumbers(value: string | null): number[] | null {
  if (!value) {
    return null
  }
  const numbers = value.split(',').map(Number)
  return numbers.length === 4 && numbers.every(isFinite) ? numbers : null
}

function parseRect(value: string | null, asset: Dimensions): SanityImageRect | null {
  const numbers = parseNumbers(value)
  if (!numbers) {
    return null
  }
  const [left, top, width, height] = numbers
  const isWithinImage =
    left >= 0 &&
    top >= 0 &&
    width > 0 &&
    height > 0 &&
    left + width <= asset.width &&
    top + height <= asset.height
  return isWithinImage ? {left, top, width, height} : null
}

function cropFromRect(rect: SanityImageRect, asset: Dimensions): SanityImageCrop {
  return {
    left: rect.left / asset.width,
    top: rect.top / asset.height,
    right: (asset.width - rect.left - rect.width) / asset.width,
    bottom: (asset.height - rect.top - rect.height) / asset.height,
  }
}

function hotspotFromPixels([x, y, width, height]: number[], asset: Dimensions): SanityImageHotspot {
  return {
    x: x / asset.width,
    y: y / asset.height,
    width: width / asset.width,
    height: height / asset.height,
  }
}
