import type {
  ImageUrlBuilder,
  ImageUrlBuilderOptions,
  ImageUrlBuilderOptionsWithAliases,
  ImageUrlBuilderOptionsWithAsset,
} from '../types'

/**
 * @public
 */
export interface ImageUrlSigningOptions {
  keyId: string
  privateKey: string
  expiry: string | Date
}

/**
 * @public
 */
export type SignedImageUrlBuilderOptions = ImageUrlBuilderOptions & Partial<ImageUrlSigningOptions>

/**
 * @public
 */
export type SignedImageUrlBuilderOptionsWithAliases = ImageUrlBuilderOptionsWithAliases &
  Partial<ImageUrlSigningOptions>

/**
 * @public
 */
export type SignedImageUrlBuilderOptionsWithAsset = ImageUrlBuilderOptionsWithAsset &
  Partial<ImageUrlSigningOptions>

/**
 * @public
 */
export interface SignedImageUrlBuilder extends ImageUrlBuilder {
  options: SignedImageUrlBuilderOptions
  withOptions(options: SignedImageUrlBuilderOptionsWithAliases): this
  expiry(expiry: string | Date): this
  signingKey(keyId: string, privateKey: string): this
  signedUrl(): string
}
