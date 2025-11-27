import {parseAssetId} from './parseAssetId'
import {parseSource, isInProgressUpload} from './parseSource'
import type {
  CropSpec,
  HotspotSpec,
  ImageUrlBuilderOptions,
  ImageUrlBuilderOptionsWithAsset,
  SanityAsset,
  SanityImageFitResult,
  SanityImageRect,
  SanityReference,
} from './types'

export const SPEC_NAME_TO_URL_NAME_MAPPINGS = [
  ['width', 'w'],
  ['height', 'h'],
  ['format', 'fm'],
  ['download', 'dl'],
  ['blur', 'blur'],
  ['sharpen', 'sharp'],
  ['invert', 'invert'],
  ['orientation', 'or'],
  ['minHeight', 'min-h'],
  ['maxHeight', 'max-h'],
  ['minWidth', 'min-w'],
  ['maxWidth', 'max-w'],
  ['quality', 'q'],
  ['fit', 'fit'],
  ['crop', 'crop'],
  ['saturation', 'sat'],
  ['auto', 'auto'],
  ['dpr', 'dpr'],
  ['pad', 'pad'],
  ['frame', 'frame'],
]

/**
 * @internal
 */
export function urlForImage(options: ImageUrlBuilderOptions): string {
  let spec = {...(options || {})}
  const source = spec.source
  delete spec.source

  const image = parseSource(source)
  if (!image) {
    if (source && isInProgressUpload(source)) {
      // This is a placeholder image that will be replaced with the actual image when the upload is complete
      // This is a 0x0 transparent PNG image
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8HwQACfsD/QNViZkAAAAASUVORK5CYII='
    }
    throw new Error(`Unable to resolve image URL from source (${JSON.stringify(source)})`)
  }

  const id = (image.asset as SanityReference)._ref || (image.asset as SanityAsset)._id || ''
  const asset = parseAssetId(id)

  // Compute crop rect in terms of pixel coordinates in the raw source image
  const cropLeft = Math.round(image.crop.left * asset.width)
  const cropTop = Math.round(image.crop.top * asset.height)
  const crop = {
    left: cropLeft,
    top: cropTop,
    width: Math.round(asset.width - image.crop.right * asset.width - cropLeft),
    height: Math.round(asset.height - image.crop.bottom * asset.height - cropTop),
  }

  // Compute hot spot rect in terms of pixel coordinates
  const hotSpotVerticalRadius = (image.hotspot.height * asset.height) / 2
  const hotSpotHorizontalRadius = (image.hotspot.width * asset.width) / 2
  const hotSpotCenterX = image.hotspot.x * asset.width
  const hotSpotCenterY = image.hotspot.y * asset.height
  const hotspot = {
    left: hotSpotCenterX - hotSpotHorizontalRadius,
    top: hotSpotCenterY - hotSpotVerticalRadius,
    right: hotSpotCenterX + hotSpotHorizontalRadius,
    bottom: hotSpotCenterY + hotSpotVerticalRadius,
  }

  // If irrelevant, or if we are requested to: don't perform crop/fit based on
  // the crop/hotspot.
  if (!(spec.rect || spec.focalPoint || spec.ignoreImageParams || spec.crop)) {
    spec = {...spec, ...fit({crop, hotspot}, spec)}
  }

  return specToImageUrl({...spec, asset})
}

// eslint-disable-next-line complexity
function specToImageUrl(spec: ImageUrlBuilderOptionsWithAsset) {
  const cdnUrl = (spec.baseUrl || 'https://cdn.sanity.io').replace(/\/+$/, '')
  const vanityStub = spec.vanityName ? `/${spec.vanityName}` : ''
  const filename = `${spec.asset.id}-${spec.asset.width}x${spec.asset.height}.${spec.asset.format}${vanityStub}`
  const baseUrl = spec.mediaLibraryId
    ? `${cdnUrl}/media-libraries/${spec.mediaLibraryId}/images/${filename}`
    : `${cdnUrl}/images/${spec.projectId}/${spec.dataset}/${filename}`

  const params: string[] = []

  if (spec.rect) {
    // Only bother url with a crop if it actually crops anything
    const {left, top, width, height} = spec.rect
    const isEffectiveCrop =
      left !== 0 || top !== 0 || height !== spec.asset.height || width !== spec.asset.width

    if (isEffectiveCrop) {
      params.push(`rect=${left},${top},${width},${height}`)
    }
  }

  if (spec.bg) {
    params.push(`bg=${spec.bg}`)
  }

  if (spec.focalPoint) {
    params.push(`fp-x=${spec.focalPoint.x}`)
    params.push(`fp-y=${spec.focalPoint.y}`)
  }

  const flip = [spec.flipHorizontal && 'h', spec.flipVertical && 'v'].filter(Boolean).join('')
  if (flip) {
    params.push(`flip=${flip}`)
  }

  // Map from spec name to url param name, and allow using the actual param name as an alternative
  SPEC_NAME_TO_URL_NAME_MAPPINGS.forEach((mapping) => {
    const [specName, param] = mapping
    if (typeof spec[specName] !== 'undefined') {
      params.push(`${param}=${encodeURIComponent(spec[specName])}`)
    } else if (typeof spec[param] !== 'undefined') {
      params.push(`${param}=${encodeURIComponent(spec[param])}`)
    }
  })

  if (params.length === 0) {
    return baseUrl
  }

  return `${baseUrl}?${params.join('&')}`
}

function fit(
  source: {crop: CropSpec; hotspot: HotspotSpec},
  spec: ImageUrlBuilderOptions
): SanityImageFitResult {
  let cropRect: SanityImageRect

  const imgWidth = spec.width
  const imgHeight = spec.height

  // If we are not constraining the aspect ratio, we'll just use the whole crop
  if (!(imgWidth && imgHeight)) {
    return {width: imgWidth, height: imgHeight, rect: source.crop}
  }

  const crop = source.crop
  const hotspot = source.hotspot

  // If we are here, that means aspect ratio is locked and fitting will be a bit harder
  const desiredAspectRatio = imgWidth / imgHeight
  const cropAspectRatio = crop.width / crop.height

  if (cropAspectRatio > desiredAspectRatio) {
    // The crop is wider than the desired aspect ratio. That means we are cutting from the sides
    const height = Math.round(crop.height)
    const width = Math.round(height * desiredAspectRatio)
    const top = Math.max(0, Math.round(crop.top))

    // Center output horizontally over hotspot
    const hotspotXCenter = Math.round((hotspot.right - hotspot.left) / 2 + hotspot.left)
    let left = Math.max(0, Math.round(hotspotXCenter - width / 2))

    // Keep output within crop
    if (left < crop.left) {
      left = crop.left
    } else if (left + width > crop.left + crop.width) {
      left = crop.left + crop.width - width
    }

    cropRect = {left, top, width, height}
  } else {
    // The crop is taller than the desired ratio, we are cutting from top and bottom
    const width = crop.width
    const height = Math.round(width / desiredAspectRatio)
    const left = Math.max(0, Math.round(crop.left))

    // Center output vertically over hotspot
    const hotspotYCenter = Math.round((hotspot.bottom - hotspot.top) / 2 + hotspot.top)
    let top = Math.max(0, Math.round(hotspotYCenter - height / 2))

    // Keep output rect within crop
    if (top < crop.top) {
      top = crop.top
    } else if (top + height > crop.top + crop.height) {
      top = crop.top + crop.height - height
    }

    cropRect = {left, top, width, height}
  }

  return {
    width: imgWidth,
    height: imgHeight,
    rect: cropRect,
  }
}
