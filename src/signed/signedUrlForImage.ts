import {signUrl} from '@sanity/signed-urls'
import type {ImageUrlBuilderOptions} from '../types'
import type {ImageUrlSigningOptions} from './types'
import {urlForImage} from '../urlForImage'

export function signedUrlForImage(
  options: ImageUrlBuilderOptions,
  signingOptions: ImageUrlSigningOptions
): string {
  // Get the base URL without any signing specific parameters
  const baseUrl = urlForImage(options)
  // Sign the URL with the signing parameters
  return signUrl(baseUrl, signingOptions)
}
