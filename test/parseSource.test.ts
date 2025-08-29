import {describe, test, expect} from 'vitest'
import parseSource from '../src/parseSource'
import {SanityImageObject} from '../src/types'
import {
  assetDocument,
  assetWithUrl,
  croppedImage,
  imageWithNoCropSpecified,
  materializedAssetWithCrop,
  noHotspotImage,
  inProgressUpload,
} from './fixtures'

function compareParsedSource(
  outputSrc: SanityImageObject | null,
  expectedSrc: SanityImageObject | null
) {
  expect(outputSrc).not.toBe(null)
  if (!outputSrc || !expectedSrc) {
    return
  }

  expect(typeof outputSrc).toBe('object')
  expect(typeof outputSrc.asset).toBe('object')
  expect(outputSrc.asset._ref).toEqual(expectedSrc.asset._ref)
  expect(outputSrc).toHaveProperty('crop')
  expect(outputSrc).toHaveProperty('hotspot')
}

describe('parseSource', () => {
  test('does correctly parse full image object', () => {
    const parsedSource = parseSource(imageWithNoCropSpecified())
    compareParsedSource(parsedSource, imageWithNoCropSpecified())
  })

  test('does correctly parse asset document ID', () => {
    const parsedSource = parseSource(imageWithNoCropSpecified().asset._ref)
    compareParsedSource(parsedSource, imageWithNoCropSpecified())
  })

  test('does correctly parse image asset object', () => {
    const parsedSource = parseSource(imageWithNoCropSpecified().asset)
    compareParsedSource(parsedSource, imageWithNoCropSpecified())
  })

  test('does correctly parse image asset document', () => {
    const parsedSource = parseSource(assetDocument())
    compareParsedSource(parsedSource, noHotspotImage())
  })

  test('does correctly parse asset object with only url', () => {
    const parsedSource = parseSource(assetWithUrl())
    compareParsedSource(parsedSource, noHotspotImage())
  })

  test('does correctly parse only asset url', () => {
    const parsedSource = parseSource(assetWithUrl().asset.url)
    compareParsedSource(parsedSource, noHotspotImage())
  })

  test('does not overwrite crop or hotspot settings', () => {
    expect(parseSource(croppedImage())).toEqual(croppedImage())
  })

  test('does not overwrite crop or hotspot settings', () => {
    expect(parseSource(materializedAssetWithCrop())).toMatchObject({
      asset: {
        _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg',
      },
      crop: {
        bottom: 0.1,
      },
    })
  })

  test('returns null on non-image object', () => {
    expect(parseSource({})).toEqual(null)
  })

  test('image with materialized asset, read-only', () => {
    const noCrop = Object.defineProperties(
      {_type: 'image'},
      {
        crop: {
          writable: false,
          value: {bottom: 0, top: 1, left: 2, right: 3},
        },
        hotspot: {
          writable: false,
          value: {height: 0.99, width: 0.98, x: 0.51, y: 0.49},
        },
        asset: {
          writable: false,
          value: Object.freeze({
            _id: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg',
            _type: 'sanity.imageAsset',
          }),
        },
      }
    )

    expect(parseSource(noCrop)).toMatchInlineSnapshot(`
      {
        "_type": "image",
        "crop": {
          "bottom": 0,
          "left": 2,
          "right": 3,
          "top": 1,
        },
        "hotspot": {
          "height": 0.99,
          "width": 0.98,
          "x": 0.51,
          "y": 0.49,
        },
      }
    `)
  })
})
