import type {
  SanityAsset,
  SanityImageObject,
  SanityImageSource,
  SanityImageWithAssetStub,
  SanityReference,
} from './types'

const isRef = (src: SanityImageSource): src is SanityReference => {
  const source = src as SanityReference
  return source ? typeof source._ref === 'string' : false
}

const isAsset = (src: SanityImageSource): src is SanityAsset => {
  const source = src as SanityAsset
  return source ? typeof source._id === 'string' : false
}

const isAssetStub = (src: SanityImageSource): src is SanityImageWithAssetStub => {
  const source = src as SanityImageWithAssetStub
  return source && source.asset ? typeof source.asset.url === 'string' : false
}

// Detect in-progress uploads (has upload key but no complete asset reference)
export const isInProgressUpload = (src: SanityImageSource): boolean => {
  if (typeof src === 'object' && src !== null) {
    const obj = src as any
    // Check if it has an upload key (indicating in-progress upload)
    return obj._upload && (!obj.asset || !obj.asset._ref)
  }
  return false
}

/**
 * @internal
 * Convert an asset-id, asset or image to an image record suitable for processing
 */
export function parseSource(source?: SanityImageSource) {
  if (!source) {
    return null
  }

  let image: SanityImageObject

  if (typeof source === 'string' && isUrl(source)) {
    // Someone passed an existing image url?
    image = {
      asset: {_ref: urlToId(source)},
    }
  } else if (typeof source === 'string') {
    // Just an asset id
    image = {
      asset: {_ref: source},
    }
  } else if (isRef(source)) {
    // We just got passed an asset directly
    image = {
      asset: source,
    }
  } else if (isAsset(source)) {
    // If we were passed an image asset document
    image = {
      asset: {
        _ref: source._id || '',
      },
    }
  } else if (isAssetStub(source)) {
    // If we were passed a partial asset (`url`, but no `_id`)
    image = {
      asset: {
        _ref: urlToId(source.asset.url),
      },
    }
  } else if ('asset' in source && source.asset && typeof source.asset === 'object') {
    // Probably an actual image with materialized asset
    image = {...(source as SanityImageObject)}
  } else {
    // We got something that does not look like an image, or it is an image
    // that currently isn't sporting an asset.
    return null
  }

  const img = source as SanityImageObject
  if (img.crop) {
    image.crop = img.crop
  }

  if (img.hotspot) {
    image.hotspot = img.hotspot
  }

  return applyDefaults(image)
}

function isUrl(url: string) {
  return /^https?:\/\//.test(`${url}`)
}

function urlToId(url: string) {
  const parts = url.split('/').slice(-1)
  return `image-${parts[0]}`.replace(/\.([a-z]+)$/, '-$1')
}

const DEFAULT_CROP = {left: 0, top: 0, bottom: 0, right: 0}
const DEFAULT_HOTSPOT = {x: 0.5, y: 0.5, height: 1.0, width: 1.0}

// Mock crop and hotspot if image lacks it, or lacks some of their coordinates
function applyDefaults(image: SanityImageObject) {
  if (isComplete(image.crop, DEFAULT_CROP) && isComplete(image.hotspot, DEFAULT_HOTSPOT)) {
    return image as Required<SanityImageObject>
  }

  const result: Required<SanityImageObject> = {
    ...image,
    crop: withDefaults(image.crop, DEFAULT_CROP),
    hotspot: withDefaults(image.hotspot, DEFAULT_HOTSPOT),
  }
  return result
}

function isComplete(value: object | undefined, defaults: Record<string, number>) {
  if (!value) {
    return false
  }
  const record = value as Record<string, unknown>
  return Object.keys(defaults).every((key) => typeof record[key] === 'number')
}

function withDefaults<T extends Record<string, number>>(value: object | undefined, defaults: T): T {
  if (isComplete(value, defaults)) {
    return value as T
  }

  const result: Record<string, unknown> = {...value}
  for (const key of Object.keys(defaults)) {
    if (typeof result[key] !== 'number') {
      result[key] = defaults[key]
    }
  }
  return result as T
}
