import {defineDeprecated} from '../compat'
import {createImageUrlBuilder} from './signed-builder'

export {createImageUrlBuilder} from './signed-builder'

export type {
  AutoMode,
  CropMode,
  CropSpec,
  FitMode,
  HotspotSpec,
  ImageFormat,
  ImageUrlBuilderOptions,
  ImageUrlBuilderOptionsWithAliases,
  ImageUrlBuilderOptionsWithAsset,
  Orientation,
  SanityAsset,
  SanityClientConfig,
  SanityClientLike,
  SanityImageCrop,
  SanityImageDimensions,
  SanityImageFitResult,
  SanityImageHotspot,
  SanityImageObject,
  SanityImageRect,
  SanityImageSource,
  SanityImageWithAssetStub,
  SanityModernClientLike,
  SanityProjectDetails,
  SanityReference,
} from '../types'

export type {
  ImageUrlSigningOptions,
  SignedImageUrlBuilder,
  SignedImageUrlBuilderOptions,
  SignedImageUrlBuilderOptionsWithAliases,
  SignedImageUrlBuilderOptionsWithAsset,
} from './types'

/**
 * @public
 * @deprecated Use the named export `createImageUrlBuilder` instead of the `default` export
 */
const deprecatedcreateImageUrlBuilder = defineDeprecated(createImageUrlBuilder)
export default deprecatedcreateImageUrlBuilder
