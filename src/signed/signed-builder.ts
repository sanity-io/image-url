import {constructNewOptions, createBuilder, ImageUrlBuilderImpl} from '../builder'
import {signedUrlForImage} from './signedUrlForImage'
import type {
  ImageUrlSigningOptions,
  SignedImageUrlBuilder,
  SignedImageUrlBuilderOptions,
  SignedImageUrlBuilderOptionsWithAliases,
} from './types'
import type {SanityClientLike, SanityModernClientLike, SanityProjectDetails} from '../types'

function assertValidSignedOptions(
  opts: Partial<ImageUrlSigningOptions>
): asserts opts is ImageUrlSigningOptions {
  if (!opts.keyId || typeof opts.keyId !== 'string') {
    throw new Error('Cannot call `signedUrl()` without `keyId`')
  }

  if (!opts.privateKey || typeof opts.privateKey !== 'string') {
    throw new Error('Cannot call `signedUrl()` without `privateKey`')
  }

  if (!opts.expiry || (typeof opts.expiry !== 'string' && !(opts.expiry instanceof Date))) {
    throw new Error('Cannot call `signedUrl()` without `expiry`')
  }
}

/**
 * @internal
 */
export class SignedImageUrlBuilderImpl
  extends ImageUrlBuilderImpl
  implements SignedImageUrlBuilder
{
  public declare options: SignedImageUrlBuilderOptions

  constructor(parent: SignedImageUrlBuilderImpl | null, options: SignedImageUrlBuilderOptions) {
    super(parent, options)
  }

  override withOptions(options: SignedImageUrlBuilderOptionsWithAliases): this {
    const newOptions = constructNewOptions(this.options, options)
    return new SignedImageUrlBuilderImpl(this, {...newOptions}) as this
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
): SignedImageUrlBuilder {
  return createBuilder(SignedImageUrlBuilderImpl, options)
}
