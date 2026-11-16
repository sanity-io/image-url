/**
 * Type-level tests for @sanity/image-url with Sanity TypeGen generated types.
 *
 * `sanity.types.ts` is generated from `sanity.config.ts` and `queries.ts` with
 * `pnpm typegen`. Every image shape TypeGen produces for those queries should be
 * accepted by `builder.image()` without casts.
 */
import {createClient, type SanityQueries} from '@sanity/client'
import {describe, expectTypeOf, test} from 'vitest'

import {
  createImageUrlBuilder,
  isImageWithAsset,
  type InferImageValue,
  type InferStrictImageValue,
  type SanityImageSource,
} from '../../src'
import {createImageUrlBuilder as createSignedImageUrlBuilder} from '../../src/signed'
import {postImagesQuery, postImagesWithAssetQuery, postQuery} from './queries'
import type {
  AllSanitySchemaTypes,
  Figure,
  Post,
  PostImagesPartialQueryResult,
  PostImagesQueryResult,
  PostImagesWithAssetQueryResult,
  PostQueryResult,
  PostsQueryResult,
  SanityFileAssetReference,
  SanityImageAssetReference,
} from './sanity.types'

const client = createClient({
  projectId: 'test',
  dataset: 'test',
  useCdn: true,
  apiVersion: '2025-01-01',
})
const builder = createImageUrlBuilder(client)
const urlFor = (source: SanityImageSource) => builder.image(source)

declare const raw: NonNullable<PostImagesQueryResult>
declare const deref: NonNullable<PostImagesWithAssetQueryResult>
declare const partial: NonNullable<PostImagesPartialQueryResult>
declare const posts: PostsQueryResult
declare const post: NonNullable<PostQueryResult>

describe('image() accepts TypeGen query results', () => {
  test('raw image fields', () => {
    if (raw.thumbnail) builder.image(raw.thumbnail)
    if (raw.cover) builder.image(raw.cover)
    if (raw.figure) builder.image(raw.figure)
    for (const item of raw.gallery ?? []) builder.image(item)
  })

  test('image fields with `asset->` dereferenced', () => {
    if (deref.thumbnail) builder.image(deref.thumbnail)
    if (deref.cover) builder.image(deref.cover)
    if (deref.figure) builder.image(deref.figure)
    for (const item of deref.gallery ?? []) builder.image(item)
    if (deref.cover?.asset) builder.image(deref.cover.asset)
  })

  test('partial projections', () => {
    if (partial.cover) builder.image(partial.cover)
    if (partial.coverAsset) builder.image(partial.coverAsset)
    if (partial.coverAssetPartial) builder.image(partial.coverAssetPartial)
    if (partial.coverUrl) builder.image(partial.coverUrl)
    if (partial.coverRef) builder.image(partial.coverRef)
    if (partial.figure) builder.image(partial.figure)
    for (const asset of partial.galleryAssets ?? []) if (asset) builder.image(asset)
  })

  test('list and whole-document queries', () => {
    for (const item of posts) if (item.cover) builder.image(item.cover)
    if (post.cover) builder.image(post.cover)
    if (post.figure) builder.image(post.figure)
  })

  test('schema types', () => {
    expectTypeOf<NonNullable<Post['thumbnail']>>().toExtend<SanityImageSource>()
    expectTypeOf<NonNullable<Post['cover']>>().toExtend<SanityImageSource>()
    expectTypeOf<NonNullable<Post['gallery']>[number]>().toExtend<SanityImageSource>()
    expectTypeOf<Figure>().toExtend<SanityImageSource>()
  })

  test('results inferred by client.fetch', async () => {
    const data = await client.fetch(postImagesWithAssetQuery, {slug: 'hello'})
    if (data?.figure) urlFor(data.figure).width(800).url()
  })

  test('the signed builder', () => {
    const signed = createSignedImageUrlBuilder(client)
    if (deref.figure) signed.image(deref.figure)
    if (partial.cover) signed.image(partial.cover)
  })
})

describe('image() rejects values that can never produce a URL', () => {
  test('nullable values must be narrowed first', () => {
    // @ts-expect-error - `cover` is null when the field is unset
    builder.image(raw.cover)
    // @ts-expect-error - `undefined` when the document is missing
    builder.image(undefined)
    // @ts-expect-error - `null`
    builder.image(null)
  })

  test('non-image primitives', () => {
    // @ts-expect-error - number
    builder.image(42)
    // @ts-expect-error - boolean
    builder.image(true)
  })
})

describe('InferImageValue', () => {
  test('collects image fields from a query result', () => {
    expectTypeOf<InferImageValue<PostImagesQueryResult>>().toEqualTypeOf<
      | (NonNullable<PostImagesQueryResult>['thumbnail' | 'cover' | 'figure'] & {})
      | NonNullable<NonNullable<PostImagesQueryResult>['gallery']>[number]
    >()
  })

  test('collects dereferenced images and skips file fields', () => {
    type Value = InferImageValue<PostImagesWithAssetQueryResult>
    expectTypeOf<Value>().toEqualTypeOf<
      | (NonNullable<PostImagesWithAssetQueryResult>['thumbnail' | 'cover' | 'figure'] & {})
      | NonNullable<NonNullable<PostImagesWithAssetQueryResult>['gallery']>[number]
    >()
    expectTypeOf<Extract<Value, {_type: 'file'}>>().toBeNever()
  })

  test('collects partial projections, but not bare assets, refs or urls', () => {
    expectTypeOf<InferImageValue<PostImagesPartialQueryResult>>().toEqualTypeOf<
      NonNullable<PostImagesPartialQueryResult>['cover' | 'figure'] & {}
    >()
  })

  test('collects images from schema types and skips file fields', () => {
    type Value = InferImageValue<AllSanitySchemaTypes>
    expectTypeOf<Figure>().toExtend<Value>()
    expectTypeOf<NonNullable<Post['cover']>>().toExtend<Value>()
    expectTypeOf<Extract<Value, {asset?: SanityFileAssetReference}>>().toBeNever()
  })

  test('every image from every registered query is a valid source', () => {
    type Value = InferImageValue<SanityQueries[keyof SanityQueries]>
    expectTypeOf<Value>().not.toBeNever()
    expectTypeOf<Value>().toExtend<SanityImageSource>()
    expectTypeOf<Figure>().toExtend<Value>()
    expectTypeOf<NonNullable<PostImagesPartialQueryResult>['cover'] & {}>().toExtend<Value>()
    expectTypeOf<Extract<Value, {_type: 'file'}>>().toBeNever()
  })

  test('types a shared image component that accepts images from any query', () => {
    type ImageValue = InferImageValue<SanityQueries[keyof SanityQueries]>
    const sanityImage = ({value}: {value: ImageValue}) => {
      if (!isImageWithAsset(value)) return null
      return {src: builder.image(value).url(), alt: ('alt' in value && value.alt) || ''}
    }

    if (raw.cover) sanityImage({value: raw.cover})
    if (deref.figure) sanityImage({value: deref.figure})
    if (partial.cover) sanityImage({value: partial.cover})
    if (partial.figure) sanityImage({value: partial.figure})
    for (const item of post.gallery ?? []) sanityImage({value: item})
    // @ts-expect-error - a bare asset reference is not an image object
    if (partial.galleryAssets?.[0]) sanityImage({value: partial.galleryAssets[0]})
  })

  test('is never for values without images', () => {
    expectTypeOf<InferImageValue<string | null>>().toBeNever()
    expectTypeOf<InferImageValue<{title: string; tags: string[]}>>().toBeNever()
  })
})

describe('InferStrictImageValue', () => {
  test('requires a non-null asset', () => {
    type Value = InferStrictImageValue<PostImagesWithAssetQueryResult>
    expectTypeOf<Value['asset']>().not.toBeNullable()
    expectTypeOf<Value['asset']['_id']>().toEqualTypeOf<string>()

    type RawValue = InferStrictImageValue<PostImagesQueryResult>
    expectTypeOf<RawValue['asset']>().toEqualTypeOf<SanityImageAssetReference>()
  })
})

describe('isImageWithAsset', () => {
  test('narrows nullable query results to images with an asset', async () => {
    const data = await client.fetch(postImagesQuery, {slug: 'hello'})
    if (isImageWithAsset(data?.cover)) {
      expectTypeOf(data.cover.asset).toEqualTypeOf<SanityImageAssetReference>()
      builder.image(data.cover)
    }
  })

  test('narrows dereferenced assets', async () => {
    const data = await client.fetch(postQuery, {slug: 'hello'})
    if (isImageWithAsset(data?.figure)) {
      expectTypeOf(data.figure).toExtend<Figure>()
      expectTypeOf(data.figure.asset).toEqualTypeOf<SanityImageAssetReference>()
    }
    if (isImageWithAsset(deref.figure)) {
      expectTypeOf(deref.figure.asset._id).toEqualTypeOf<string>()
    }
  })

  test('narrows to InferStrictImageValue', () => {
    type Value = InferImageValue<SanityQueries[keyof SanityQueries]>
    const render = (value: InferStrictImageValue<SanityQueries[keyof SanityQueries]>) =>
      builder.image(value).url()
    const value = {} as Value
    // @ts-expect-error - the asset may be missing
    render(value)
    if (isImageWithAsset(value)) render(value)
  })

  test('rejects values that are not images', () => {
    // @ts-expect-error - a string is not an image object
    isImageWithAsset('image-abc-1x1-png')
    // @ts-expect-error - `asset` must be a reference or an asset document
    isImageWithAsset({asset: 123})
  })
})
