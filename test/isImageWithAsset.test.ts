import {describe, expect, test} from 'vitest'
import {isImageWithAsset} from '../src'
import {isImageWithAsset as isSignedImageWithAsset} from '../src/signed'
import {imageWithNoCropSpecified, inProgressUpload, materializedAssetWithCrop} from './fixtures'

describe('isImageWithAsset', () => {
  test('is true for images with an asset reference', () => {
    expect(isImageWithAsset(imageWithNoCropSpecified())).toBe(true)
  })

  test('is true for images with a dereferenced asset', () => {
    expect(isImageWithAsset(materializedAssetWithCrop())).toBe(true)
    expect(isImageWithAsset({asset: {_id: 'image-abc-1x1-png', url: null}})).toBe(true)
    expect(isImageWithAsset({asset: {url: 'https://cdn.sanity.io/images/p/d/abc-1x1.png'}})).toBe(
      true
    )
  })

  test('is false for images without an asset', () => {
    expect(isImageWithAsset({_type: 'image'})).toBe(false)
    expect(isImageWithAsset({_type: 'image', asset: null})).toBe(false)
    expect(isImageWithAsset({_type: 'image', asset: {_id: null, url: null}})).toBe(false)
    expect(isImageWithAsset(inProgressUpload())).toBe(false)
  })

  test('is false for missing values', () => {
    expect(isImageWithAsset(null)).toBe(false)
    expect(isImageWithAsset(undefined)).toBe(false)
  })

  test('is exported from the signed entry point', () => {
    expect(isSignedImageWithAsset).toBe(isImageWithAsset)
  })
})
