import {createBuilder, ImageUrlBuilder} from '../builder'
import {signedUrlForImage} from './signedUrlForImage'
import type {ImageUrlSignedBuilderOptions, ImageUrlSigningOptions} from './types'
import type {
  ImageUrlBuilderOptions,
  ImageUrlBuilderOptionsWithAliases,
  SanityClientLike,
  SanityModernClientLike,
  SanityProjectDetails,
} from '../types'

function assertValidSignedOptions(
  opts: Partial<ImageUrlSigningOptions>
): asserts opts is ImageUrlSigningOptions {
  if (typeof opts.keyId !== 'string') {
    throw new Error('Cannot call `signedUrl()` without `keyId`')
  }

  if (typeof opts.privateKey !== 'string') {
    throw new Error('Cannot call `signedUrl()` without `privateKey`')
  }
}

/**
 * @internal
 */
export class ImageSignedUrlBuilder extends ImageUrlBuilder {
  public declare options: ImageUrlBuilderOptions & Partial<ImageUrlSigningOptions>

  constructor(parent: ImageSignedUrlBuilder | null, options: ImageUrlSignedBuilderOptions) {
    super(parent, options)
  }

  override withOptions(
    options: Partial<ImageUrlBuilderOptionsWithAliases & ImageUrlSigningOptions>
  ): this {
    const newOptions = this.constructNewOptions(options)
    return new ImageSignedUrlBuilder(this, {...newOptions}) as this
  }

  expiry(expiry: string | Date) {
    return this.withOptions({expiry})
  }

  signingKey(keyId: string, privateKey: string) {
    return this.withOptions({keyId, privateKey})
  }

  signedUrl() {
    const {expiry, keyId, privateKey, ...rest} = this.options
    const signedOptions = {expiry, keyId, privateKey}
    assertValidSignedOptions(signedOptions)
    return signedUrlForImage(rest, signedOptions)
  }
}

/**
 * @public
 */
export function createImageUrlBuilder(
  options?: SanityClientLike | SanityProjectDetails | SanityModernClientLike
) {
  return createBuilder(ImageSignedUrlBuilder, options)
}

/**
 * @public
 */
export type ImageUrlBuilderType = InstanceType<typeof ImageSignedUrlBuilder>
