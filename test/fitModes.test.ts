import {describe, expect, test} from 'vitest'
import {createImageUrlBuilder} from '../src/builder'
import type {FitMode, ImageUrlBuilder, SanityImageObject} from '../src/types'

// A public demo asset (780x1170 portrait), so the URLs below can be opened on the CDN
const assetRef = 'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg'
const base =
  'https://cdn.sanity.io/images/pv8y60vp/production/7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170.jpg'

const urlFor = createImageUrlBuilder({projectId: 'pv8y60vp', dataset: 'production'})

const crop = {top: 0.1, bottom: 0.1, left: 0.1, right: 0.1}
const hotspot = {x: 0.3, y: 0.3, width: 0.3, height: 0.3}

const sources: Record<string, SanityImageObject> = {
  plain: {asset: {_ref: assetRef}},
  hotspot: {asset: {_ref: assetRef}, hotspot},
  crop: {asset: {_ref: assetRef}, crop},
  'crop+hotspot': {asset: {_ref: assetRef}, crop, hotspot},
}

const sizes: Record<string, {width?: number; height?: number}> = {
  'width only': {width: 300},
  'height only': {height: 300},
  'width and height': {width: 300, height: 300},
}

const fits: (FitMode | undefined)[] = [
  undefined,
  'clip',
  'crop',
  'fill',
  'fillmax',
  'max',
  'min',
  'scale',
]

function apply(
  builder: ImageUrlBuilder,
  {width, height, fit}: {width?: number; height?: number; fit?: FitMode}
): ImageUrlBuilder {
  let result = builder
  if (width) result = result.width(width)
  if (height) result = result.height(height)
  if (fit) result = result.fit(fit)
  return result
}

function params(url: string) {
  return new URL(url).searchParams
}

const matrix = Object.entries(sources).flatMap(([sourceName, source]) =>
  Object.entries(sizes).flatMap(([sizeName, size]) =>
    fits.map((fit) => ({
      name: `${sourceName}, ${sizeName}, fit=${fit ?? 'none'}`,
      source,
      sourceName,
      options: {...size, fit},
    }))
  )
)

describe('fit modes', () => {
  test('matrix of sources, sizes and fit modes', () => {
    const urls = Object.fromEntries(
      matrix.map(({name, source, options}) => [
        name,
        apply(urlFor.image(source), options).url().replace(base, ''),
      ])
    )
    expect(urls).toMatchSnapshot()
  })

  test.each(matrix)('$name: only adds a rect when cropping', ({source, sourceName, options}) => {
    const rect = params(apply(urlFor.image(source), options).url()).get('rect')
    const hasCrop = sourceName.startsWith('crop')
    const sourceCrop = '78,117,624,936'
    const cropsToAspectRatio =
      options.width && options.height && ['crop', 'min', undefined].includes(options.fit)

    if (cropsToAspectRatio) {
      // Square output from a portrait image always needs cutting top and bottom
      expect(rect).toMatch(/^\d+,\d+,(\d+),\1$/)
    } else if (hasCrop) {
      expect(rect).toBe(sourceCrop)
    } else {
      expect(rect).toBeNull()
    }
  })

  test.each(matrix)('$name: records the crop and hotspot', ({source, options}) => {
    const search = params(apply(urlFor.image(source), options).url())
    expect(search.get('x-crop')).toBe(source.crop ? '78,117,624,936' : null)
    expect(search.get('x-hotspot')).toBe(source.hotspot ? '234,351,234,351' : null)
  })

  test.each(matrix)('$name: rebuilding from the URL is stable', ({source, options}) => {
    const url = apply(urlFor.image(source), options).url()
    expect(apply(urlFor.image(url), options).url()).toBe(url)
  })

  test.each(matrix)(
    '$name: resizing from the URL matches resizing from the image record',
    ({source, options}) => {
      const url = apply(urlFor.image(source), options).url()
      for (const fit of fits) {
        for (const size of [{width: 100}, {height: 500}, {width: 400, height: 200}]) {
          const resize = {...size, fit}
          expect(apply(urlFor.image(url), resize).url()).toBe(
            apply(urlFor.image(source), resize).url()
          )
        }
      }
    }
  )

  test('repeated resizes and fit changes do not drift', () => {
    const source = sources['crop+hotspot']
    const steps: {width?: number; height?: number; fit?: FitMode}[] = [
      {width: 300, height: 300},
      {width: 300, height: 300, fit: 'max'},
      {width: 1200, height: 400, fit: 'min'},
      {width: 50},
      {width: 400, height: 900, fit: 'scale'},
      {width: 200, height: 200, fit: 'crop'},
    ]

    let url = urlFor.image(source).url()
    for (const step of steps) {
      url = apply(urlFor.image(url), step).url()
      expect(url).toBe(apply(urlFor.image(source), step).url())
    }
  })

  test('the resized URL keeps the other options it is given', () => {
    const url = urlFor.image(sources['crop+hotspot']).width(300).height(300).url()
    expect(urlFor.image(url).width(600).height(200).fit('max').bg('fff').quality(80).url()).toBe(
      `${base}?rect=78,117,624,936&bg=fff&w=600&h=200&q=80&fit=max&x-crop=78,117,624,936&x-hotspot=234,351,234,351`
    )
  })

  test('an explicit rect is used as-is and does not record the image record', () => {
    const url = urlFor.image(sources['crop+hotspot']).rect(10, 20, 300, 400).width(300).url()
    expect(url).toBe(`${base}?rect=10,20,300,400&w=300`)
  })

  test('ignoreImageParams() does not record the image record', () => {
    const url = urlFor.image(sources['crop+hotspot']).ignoreImageParams().size(300, 300).url()
    expect(url).toBe(`${base}?w=300&h=300`)
  })

  test('rect is never read back from a URL', () => {
    // A rect without x-crop may have been computed for another aspect ratio or fit mode
    const url = `${base}?rect=0,195,780,780&w=300&h=300`
    expect(urlFor.image(url).width(300).height(300).fit('max').url()).toBe(
      `${base}?w=300&h=300&fit=max`
    )
  })

  test('malformed or out-of-bounds intent params are ignored', () => {
    for (const query of [
      'x-crop=1,2,3&x-hotspot=a,b,c,d',
      'x-crop=0,0,781,1170&x-hotspot=-1,0,10,10',
      'x-crop=0,0,0,0',
    ]) {
      expect(urlFor.image(`${base}?${query}`).width(100).url()).toBe(`${base}?w=100`)
    }
  })

  test('URLs with a vanity name or other search params resolve the asset', () => {
    const url = urlFor
      .image(sources['crop+hotspot'])
      .vanityName('cover.jpg')
      .size(300, 300)
      .quality(50)
      .url()
    expect(urlFor.image(url).width(100).url()).toBe(
      `${base}?rect=78,117,624,936&w=100&x-crop=78,117,624,936&x-hotspot=234,351,234,351`
    )
  })

  test('vanity names that look like asset filenames do not replace the asset', () => {
    const url = urlFor
      .image(sources['crop+hotspot'])
      .vanityName('product-800x600.jpg')
      .size(300, 300)
      .url()
    expect(urlFor.image(url).width(100).url()).toBe(
      `${base}?rect=78,117,624,936&w=100&x-crop=78,117,624,936&x-hotspot=234,351,234,351`
    )
  })

  test('asset ids with underscores round-trip from a built URL', () => {
    const underscoreRef = 'image-vK7bXJPEjVpL_C950gH1N73Zv14r7pYsbUdXl-4288x2848-jpg'
    const underscoreBase =
      'https://cdn.sanity.io/images/pv8y60vp/production/vK7bXJPEjVpL_C950gH1N73Zv14r7pYsbUdXl-4288x2848.jpg'
    const source: SanityImageObject = {
      asset: {_ref: underscoreRef},
      crop: {top: 0.1, bottom: 0.1, left: 0.1, right: 0.1},
      hotspot: {x: 0.3, y: 0.3, width: 0.3, height: 0.3},
    }
    const url = urlFor.image(source).width(80).url()
    expect(url).toContain(underscoreBase)
    expect(urlFor.image(url).width(100).url()).toBe(urlFor.image(source).width(100).url())
  })
})

// The comparison from https://github.com/sanity-io/image-url/issues/32: every fit mode at
// width 300 and height 300, for an image without a crop. Render sizes are from the CDN.
describe('issue #32: fit modes with width and height', () => {
  const plain = sources.plain
  const square = (fit?: FitMode) => apply(urlFor.image(plain), {width: 300, height: 300, fit})

  test('no fit crops to a square around the hotspot (300x300), unchanged', () => {
    expect(square().url()).toBe(`${base}?rect=0,195,780,780&w=300&h=300`)
  })

  test('fit=crop crops to a square around the hotspot (300x300), unchanged', () => {
    expect(square('crop').url()).toBe(`${base}?rect=0,195,780,780&w=300&h=300&fit=crop`)
  })

  test('fit=min crops to a square around the hotspot, unchanged', () => {
    expect(square('min').url()).toBe(`${base}?rect=0,195,780,780&w=300&h=300&fit=min`)
  })

  test('fit=clip keeps the whole image (200x300)', () => {
    expect(square('clip').url()).toBe(`${base}?w=300&h=300&fit=clip`)
  })

  test('fit=max keeps the whole image (200x300)', () => {
    expect(square('max').url()).toBe(`${base}?w=300&h=300&fit=max`)
  })

  test('fit=fill pads the whole image (300x300)', () => {
    expect(square('fill').bg('f00').url()).toBe(`${base}?bg=f00&w=300&h=300&fit=fill`)
  })

  test('fit=fillmax pads the whole image (300x300)', () => {
    expect(square('fillmax').bg('f00').url()).toBe(`${base}?bg=f00&w=300&h=300&fit=fillmax`)
  })

  test('fit=scale stretches the whole image (300x300)', () => {
    expect(square('scale').url()).toBe(`${base}?w=300&h=300&fit=scale`)
  })

  test('the hotspot moves the square crop for the cropping modes only', () => {
    const withHotspot = (fit?: FitMode) =>
      apply(urlFor.image(sources.hotspot), {width: 300, height: 300, fit}).url()
    expect(withHotspot()).toBe(`${base}?rect=0,0,780,780&w=300&h=300&x-hotspot=234,351,234,351`)
    expect(withHotspot('max')).toBe(`${base}?w=300&h=300&fit=max&x-hotspot=234,351,234,351`)
  })
})
