import {createImageUrlBuilder} from './builder'
import {defineDeprecated} from './compat'

export {createImageUrlBuilder} from './builder'

export type {
  AutoMode,
  CropMode,
  CropSpec,
  FitMode,
  HotspotSpec,
  ImageFormat,
  ImageUrlBuilder,
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
} from './types'

/**
 * @public
 * @deprecated Use the named export `createImageUrlBuilder` instead of the `default` export
 */
const deprecatedcreateImageUrlBuilder = defineDeprecated(createImageUrlBuilder)
export default deprecatedcreateImageUrlBuilder
