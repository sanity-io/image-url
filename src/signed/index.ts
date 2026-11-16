import {defineDeprecated} from '../compat'
import {createImageUrlBuilder} from './signed-builder'

export {createImageUrlBuilder} from './signed-builder'
export {isImageWithAsset} from '../isImageWithAsset'

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
  InferImageValue,
  InferStrictImageValue,
  Orientation,
  SanityAsset,
  SanityClientConfig,
  SanityClientLike,
  SanityImageAssetLike,
  SanityImageCrop,
  SanityImageDimensions,
  SanityImageFitResult,
  SanityImageHotspot,
  SanityImageLike,
  SanityImageObject,
  SanityImageRect,
  SanityImageSource,
  SanityImageWithAsset,
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
