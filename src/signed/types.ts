import type {ImageUrlBuilderOptions} from '../types'

/**
 * @public
 */
export interface ImageUrlSigningOptions {
  keyId: string
  privateKey: string
  expiry?: string | Date
}

/**
 * @public
 */
export type ImageUrlSignedBuilderOptions = ImageUrlBuilderOptions & Partial<ImageUrlSigningOptions>
