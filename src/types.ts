/**
 * @public
 */
export type ImageUrlBuilderOptions = Partial<SanityProjectDetails> & {
  baseUrl?: string
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
 * @public
 */
export interface SanityClientLike {
  clientConfig: {dataset?: string; projectId?: string; apiHost?: string}
}

/**
 * @public
 */
export type SanityModernClientLike = {
  config(): {dataset?: string; projectId?: string; apiHost?: string}
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
