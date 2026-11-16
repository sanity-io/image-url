/**
 * @public
 */
export type ImageUrlBuilderOptions = Partial<SanityProjectDetails> & {
  baseUrl?: string
  mediaLibraryId?: string
  canvasId?: string
  source?: SanityImageSource
  bg?: string
  dpr?: number
  width?: number
  height?: number
  focalPoint?: {x: number; y: number}
  maxWidth?: number
  maxHeight?: number
  minWidth?: number
  minHeight?: number
  blur?: number
  sharpen?: number
  rect?: {left: number; top: number; width: number; height: number}
  format?: ImageFormat
  invert?: boolean
  orientation?: Orientation
  quality?: number
  download?: boolean | string
  flipHorizontal?: boolean
  flipVertical?: boolean
  ignoreImageParams?: boolean
  fit?: FitMode
  crop?: CropMode
  saturation?: number
  auto?: AutoMode
  pad?: number
  vanityName?: string
  frame?: number
}

/**
 * @public
 */
export type ImageUrlBuilderOptionsWithAliases = ImageUrlBuilderOptions & {
  w?: number
  h?: number
  q?: number
  fm?: number
  dl?: boolean | string
  or?: Orientation
  sharp?: number
  'min-h'?: number
  'max-h'?: number
  'min-w'?: number
  'max-w'?: number
  sat?: number
  [key: string]: any
}

/**
 * @public
 */
export type ImageUrlBuilderOptionsWithAsset = ImageUrlBuilderOptions & {
  asset: {
    id: string
    width: number
    height: number
    format: string
  }
  [key: string]: any
}

/**
 * @public
 */
export type ImageFormat = 'jpg' | 'pjpg' | 'png' | 'webp'

/**
 * @public
 */
export type FitMode = 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min'

/**
 * @public
 */
export type CropMode = 'top' | 'bottom' | 'left' | 'right' | 'center' | 'focalpoint' | 'entropy'

/**
 * @public
 */
export type AutoMode = 'format'

/**
 * @public
 */
export type Orientation = 0 | 90 | 180 | 270

/**
 * @internal
 */
export interface SanityClientConfigResource {
  type: 'media-library' | 'canvas' | 'dataset' | (string & {})
  id: string
}

/**
 * @public
 */
export interface SanityClientConfig {
  dataset?: string
  projectId?: string
  apiHost?: string
  /** @internal */
  resource?: SanityClientConfigResource
  /**
   * @deprecated Use `resource` instead
   * @internal
   */
  '~experimental_resource'?: SanityClientConfigResource
}

/**
 * @public
 */
export interface SanityClientLike {
  clientConfig: SanityClientConfig
}

/**
 * @public
 */
export type SanityModernClientLike = {
  config(): SanityClientConfig
}

/**
 * @public
 */
export type SanityImageSource =
  | string // Image asset ID
  | SanityReference
  | SanityAsset
  | SanityImageObject
  | SanityImageWithAssetStub
  | SanityImageLike
  | SanityImageAssetLike

/**
 * @public
 */
export interface SanityProjectDetails {
  baseUrl?: string
  projectId: string
  dataset: string
}

/**
 * @public
 */
export interface SanityReference {
  _ref: string
}

/**
 * @public
 */
export interface SanityImageWithAssetStub {
  asset: {
    url: string
  }
}

/**
 * @public
 */
export interface SanityAsset {
  _id?: string
  url?: string
  path?: string
  assetId?: string
  extension?: string
  [key: string]: any
}

/**
 * @public
 */
export interface SanityImageDimensions {
  aspectRatio: number
  height: number
  width: number
}

/**
 * @public
 */
export interface SanityImageFitResult {
  width?: number
  height?: number
  rect: SanityImageRect
}

/**
 * @public
 */
export interface SanityImageRect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * @public
 */
export interface SanityImageCrop {
  _type?: string
  left: number
  bottom: number
  right: number
  top: number
}

/**
 * @public
 */
export interface SanityImageHotspot {
  _type?: string
  width: number
  height: number
  x: number
  y: number
}

/**
 * @public
 */
export interface SanityImageObject {
  asset: SanityReference | SanityAsset
  crop?: SanityImageCrop
  hotspot?: SanityImageHotspot
}

/**
 * An image asset document, or a projection of one that keeps its `_id`
 * (for example `asset->{_id, url}`).
 *
 * @public
 */
export interface SanityImageAssetLike {
  _id: string
  url?: string | null
}

/**
 * An image object in any shape Sanity TypeGen generates for it: a raw image
 * field, an image with `asset->` dereferenced, or a partial projection such as
 * `image{asset, crop, hotspot}`. Custom image types with extra fields (`alt`,
 * `caption`, ...) and any `_type` are accepted.
 *
 * `asset` is optional and nullable, matching TypeGen, since an image field can
 * exist before an asset has been uploaded to it. Use {@link isImageWithAsset}
 * to narrow a value to one that has an asset.
 *
 * @public
 */
export interface SanityImageLike {
  asset?: SanityReference | {_id?: string | null; url?: string | null} | null
  crop?: {
    _type?: string
    top?: number | null
    bottom?: number | null
    left?: number | null
    right?: number | null
  } | null
  hotspot?: {
    _type?: string
    x?: number | null
    y?: number | null
    height?: number | null
    width?: number | null
  } | null
}

/**
 * Narrows image types to the variant where `asset` is present and non-null.
 *
 * @public
 */
export type SanityImageWithAsset<T> = T extends {asset?: infer Asset}
  ? T & {asset: NonNullable<Asset>}
  : never

type ReferenceTarget<T> = T[Extract<keyof T, symbol>]

type IsImageAsset<T> = T extends {_type: 'sanity.fileAsset'}
  ? false
  : T extends {_ref: string}
  ? 'sanity.fileAsset' extends ReferenceTarget<T>
    ? false
    : true
  : T extends {_id: string}
  ? true
  : T extends object
  ? 'url' extends keyof T
    ? true
    : false
  : false

type IsImage<T> = 'asset' extends keyof T
  ? true extends IsImageAsset<NonNullable<T['asset' & keyof T]>>
    ? true
    : false
  : false

/**
 * Collects every image shape found anywhere in `T`, which can be a TypeGen
 * query result, a union of query results, or a schema type. An image is an
 * object whose `asset` is an image asset reference, a dereferenced image asset
 * or a projection of one. File fields are skipped. `null` and `undefined` are
 * dropped.
 *
 * Use it to type a shared image component that accepts an image from any
 * query:
 *
 * @example
 * ```ts
 * import type {SanityQueries} from '@sanity/client'
 * import type {InferImageValue} from '@sanity/image-url'
 *
 * type ImageValue = InferImageValue<SanityQueries[keyof SanityQueries]>
 * ```
 *
 * @public
 */
export type InferImageValue<T> = T extends readonly (infer Item)[]
  ? InferImageValue<Item>
  : T extends object
  ? IsImage<T> extends true
    ? T
    : {[Key in keyof T]-?: InferImageValue<T[Key]>}[keyof T]
  : never

/**
 * Same as {@link InferImageValue}, but only the variants that have an asset,
 * which is what {@link isImageWithAsset} narrows to. Use it for props that
 * should only ever receive an image that can produce a URL.
 *
 * @public
 */
export type InferStrictImageValue<T> = SanityImageWithAsset<InferImageValue<T>>

/**
 * @public
 */
export interface CropSpec {
  left: number
  top: number
  width: number
  height: number
}

/**
 * @public
 */
export interface HotspotSpec {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * @public
 */
export interface ImageUrlBuilder {
  options: ImageUrlBuilderOptions
  withOptions(options: ImageUrlBuilderOptionsWithAliases): this
  image(source: SanityImageSource): this
  dataset(dataset: string): this
  projectId(projectId: string): this
  withClient(
    client: SanityClientLike | SanityProjectDetails | SanityModernClientLike
  ): ImageUrlBuilder
  bg(bg: string): this
  dpr(dpr: number): this
  width(width: number): this
  height(height: number): this
  focalPoint(x: number, y: number): this
  maxWidth(maxWidth: number): this
  minWidth(minWidth: number): this
  maxHeight(maxHeight: number): this
  minHeight(minHeight: number): this
  size(width: number, height: number): this
  blur(blur: number): this
  sharpen(sharpen: number): this
  rect(left: number, top: number, width: number, height: number): this
  format(format?: ImageFormat | undefined): this
  invert(invert: boolean): this
  orientation(orientation: Orientation): this
  quality(quality: number): this
  forceDownload(download: boolean | string): this
  flipHorizontal(): this
  flipVertical(): this
  ignoreImageParams(): this
  fit(value: FitMode): this
  crop(value: CropMode): this
  saturation(saturation: number): this
  auto(value: AutoMode): this
  pad(pad: number): this
  vanityName(value: string): this
  frame(frame: number): this
  url(): string
  toString(): string
}
