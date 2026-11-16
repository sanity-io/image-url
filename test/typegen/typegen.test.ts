import {describe, expect, test} from 'vitest'
import {createImageUrlBuilder} from '../../src'
import type {
  PostImagesPartialQueryResult,
  PostImagesWithAssetQueryResult,
  PostQueryResult,
} from './sanity.types'

const builder = createImageUrlBuilder({projectId: 'zp7mbokg', dataset: 'production'})

const assetId = 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg'
const assetUrl =
  'https://cdn.sanity.io/images/zp7mbokg/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg'

const asset = {
  _id: assetId,
  _type: 'sanity.imageAsset',
  _createdAt: '2025-01-01T00:00:00Z',
  _updatedAt: '2025-01-01T00:00:00Z',
  _rev: 'rev',
  url: assetUrl,
} as const

type Post = NonNullable<PostQueryResult>
type PostWithAssets = NonNullable<PostImagesWithAssetQueryResult>
type PartialPost = NonNullable<PostImagesPartialQueryResult>

describe('TypeGen shaped values', () => {
  test('an image with an asset reference and no crop or hotspot', () => {
    const cover: Post['cover'] = {_type: 'image', asset: {_type: 'reference', _ref: assetId}}
    expect(builder.image(cover!).width(100).height(100).url()).toBe(
      `${assetUrl}?rect=0,500,2000,2000&w=100&h=100`
    )
  })

  test('a partial projection with null crop and hotspot', () => {
    const cover: PartialPost['cover'] = {
      asset: {_type: 'reference', _ref: assetId},
      crop: null,
      hotspot: null,
    }
    expect(builder.image(cover!).width(100).height(100).url()).toBe(
      `${assetUrl}?rect=0,500,2000,2000&w=100&h=100`
    )
  })

  test('crop and hotspot objects with missing coordinates fall back to defaults', () => {
    const figure: Post['figure'] = {
      _type: 'figure',
      asset: {_type: 'reference', _ref: assetId},
      crop: {_type: 'sanity.imageCrop'},
      hotspot: {_type: 'sanity.imageHotspot', x: 0.5},
      alt: 'Alt text',
    }
    expect(builder.image(figure!).width(100).height(100).url()).toBe(
      `${assetUrl}?rect=0,500,2000,2000&w=100&h=100`
    )
  })

  test('an image with a dereferenced asset', () => {
    const figure: PostWithAssets['figure'] = {
      _type: 'figure',
      asset,
      crop: {_type: 'sanity.imageCrop', top: 0, bottom: 0.5, left: 0, right: 0},
      hotspot: {_type: 'sanity.imageHotspot', x: 0.5, y: 0.25, width: 1, height: 0.5},
    }
    expect(builder.image(figure!).width(100).height(100).url()).toBe(
      `${assetUrl}?rect=250,0,1500,1500&w=100&h=100`
    )
  })

  test('a partial asset projection', () => {
    const coverAsset: PartialPost['coverAssetPartial'] = {_id: assetId, url: null, metadata: null}
    expect(builder.image(coverAsset!).url()).toBe(assetUrl)

    const figure: PartialPost['figure'] = {
      alt: null,
      caption: null,
      asset: {_id: assetId, url: null},
    }
    expect(builder.image(figure!).width(100).url()).toBe(`${assetUrl}?w=100`)
  })

  test('an image whose dereferenced asset is null throws a descriptive error', () => {
    const figure: PostWithAssets['figure'] = {_type: 'figure', asset: null}
    expect(() => builder.image(figure!).url()).toThrowError(/Unable to resolve image URL/)
  })
})
