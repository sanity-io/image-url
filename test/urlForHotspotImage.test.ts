import urlForImage from '../src/urlForImage'
import {croppedImage, materializedAssetWithCrop, noHotspotImage, uncroppedImage} from './fixtures'

describe('urlForImage', () => {
  test('should throw on invalid source', () => {
    // @ts-ignore: Because we're throwing on invalids
    expect(() => urlForImage({source: {}}).toString()).toThrowError(
      'Unable to resolve image URL from source ({})'
    )
  })

  test('does not crop when no crop is required', () => {
    expect(
      urlForImage({source: uncroppedImage(), projectId: 'zp7mbokg', dataset: 'production'})
    ).toBe(
      'https://cdn.sanity.io/images/zp7mbokg/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg'
    )
  })

  test('does does not crop, but limits size when only width dimension is specified', () => {
    expect(
      urlForImage({
        source: uncroppedImage(),
        projectId: 'zp7mbokg',
        dataset: 'production',
        width: 100,
      })
    ).toBe(
      'https://cdn.sanity.io/images/zp7mbokg/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg?w=100'
    )
  })

  test('does does not crop, but limits size when only height dimension is specified', () => {
    expect(
      urlForImage({
        source: uncroppedImage(),
        projectId: 'zp7mbokg',
        dataset: 'production',
        height: 100,
      })
    ).toBe(
      'https://cdn.sanity.io/images/zp7mbokg/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg?h=100'
    )
  })

  test('a tall crop is centered on the hotspot', () => {
    expect(
      urlForImage({
        source: uncroppedImage(),
        projectId: 'zp7mbokg',
        dataset: 'production',
        width: 30,
        height: 100,
      })
    ).toBe(
      'https://cdn.sanity.io/images/zp7mbokg/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg?rect=150,0,900,3000&w=30&h=100'
    )
  })

  test('a wide crop is centered on the hotspot', () => {
    expect(
      urlForImage({
        source: uncroppedImage(),
        projectId: 'zp7mbokg',
        dataset: 'production',
        width: 100,
        height: 30,
      })
    ).toBe(
      'https://cdn.sanity.io/images/zp7mbokg/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg?rect=0,600,2000,600&w=100&h=30'
    )
  })

  test('a crop with identical aspect and no specified crop is not cropped', () => {
    expect(
      urlForImage({
        source: uncroppedImage(),
        projectId: 'zp7mbokg',
        dataset: 'production',
        width: 200,
        height: 300,
      })
    ).toBe(
      'https://cdn.sanity.io/images/zp7mbokg/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg?w=200&h=300'
    )
  })

  test('respects the crop, even when no explicit crop is asked for', () => {
    expect(
      urlForImage({source: croppedImage(), projectId: 'zp7mbokg', dataset: 'production'})
    ).toBe(
      'https://cdn.sanity.io/images/zp7mbokg/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg?rect=200,300,1600,2400'
    )
  })

  test('a tall crop is centered on the hotspot and constrained within the image crop', () => {
    expect(
      urlForImage({
        source: croppedImage(),
        projectId: 'zp7mbokg',
        dataset: 'production',
        width: 30,
        height: 100,
      })
    ).toBe(
      'https://cdn.sanity.io/images/zp7mbokg/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg?rect=240,300,720,2400&w=30&h=100'
    )
  })

  test('ignores the image crop if caller specifies another', () => {
    expect(
      urlForImage({
        source: croppedImage(),
        rect: {left: 10, top: 20, width: 30, height: 40},
        projectId: 'zp7mbokg',
        dataset: 'production',
        width: 30,
        height: 100,
      })
    ).toBe(
      'https://cdn.sanity.io/images/zp7mbokg/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg?rect=10,20,30,40&w=30&h=100'
    )
  })

  test('gracefully handles a non-hotspot image', () => {
    expect(
      urlForImage({
        source: noHotspotImage(),
        projectId: 'zp7mbokg',
        dataset: 'production',
        height: 100,
      })
    ).toBe(
      'https://cdn.sanity.io/images/zp7mbokg/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg?h=100'
    )
  })

  test('gracefully handles a non-crop image', () => {
    expect(
      urlForImage({
        source: noHotspotImage(),
        projectId: 'zp7mbokg',
        dataset: 'production',
        height: 100,
      })
    ).toBe(
      'https://cdn.sanity.io/images/zp7mbokg/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg?h=100'
    )
  })

  test('gracefully handles materialized asset', () => {
    expect(
      urlForImage({
        source: materializedAssetWithCrop(),
        projectId: 'zp7mbokg',
        dataset: 'production',
        height: 100,
      })
    ).toBe(
      'https://cdn.sanity.io/images/zp7mbokg/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg?rect=200,300,1600,2400&h=100'
    )
  })
})
