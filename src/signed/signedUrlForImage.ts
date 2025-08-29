import type {ImageUrlBuilderOptions} from '../types'
import type {ImageUrlSigningOptions} from './types'
import {etc, hashes, sign} from '@noble/ed25519'
import {sha512} from '@noble/hashes/sha2.js'
import urlForImage from '../urlForImage'

hashes.sha512 = sha512

// Swap alphabet, keep '=' padding
function normalizeBase64Url(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_')
}

// Go's base64.URLEncoding uses a URL-safe alphabet WITH '=' padding. To match,
// we need only URL-safe chars, to allow between 0 to 2 '=' at the end, and
// ensure length is a multiple of 4
function toBase64UrlWithPadding(bytes: Uint8Array): string {
  let b64: string

  if (typeof Buffer !== 'undefined') {
    // Node: Uint8Array → Buffer → base64
    b64 = Buffer.from(bytes).toString('base64')
  } else {
    // Browser: Uint8Array → binary string → btoa
    // @todo Do we want to allow signing in the browser?
    const bin = String.fromCharCode(...bytes)
    b64 = btoa(bin)
  }
  // Ensure padding, although likely unnecessary as an Ed25519 signature is
  // always 64 bytes / 88 chars when encoded in b64
  if (b64.length % 4) b64 += '='.repeat(4 - (b64.length % 4))

  return normalizeBase64Url(b64)
}

function normalizeExpiry(expiry: string | Date | undefined): string | undefined {
  if (!expiry) {
    return undefined
  }

  let date: Date
  if (expiry instanceof Date) {
    date = expiry
  } else {
    date = new Date(expiry)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid expiry date format')
    }
  }

  const now = new Date()
  if (date.getTime() < now.getTime()) {
    throw new Error('Expiry date must be in the future')
  }

  // Format as 'YYYY-MM-DDTHH:mm:ssZ' (strip milliseconds)
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

export default function signedUrlForImage(
  options: ImageUrlBuilderOptions,
  signingOptions: ImageUrlSigningOptions
): string {
  const {expiry, keyId, privateKey} = signingOptions
  // Get the base URL without any signing specific parameters
  const baseUrl = urlForImage(options)
  // Support expiry as Date or string
  const expiryString = normalizeExpiry(expiry)
  // Append keyid and expiry (if present), in that order
  const sep = baseUrl.includes('?') ? '&' : '?'
  const query = [`keyid=${keyId}`, expiryString && `expiry=${expiryString}`]
    .filter(Boolean)
    .join('&')
  const urlToSign = `${baseUrl}${sep}${query}`
  // Encode the URL as bytes
  const urlBytes = new TextEncoder().encode(urlToSign)
  // Encode the private key as bytes
  const privateKeyBytes = etc.hexToBytes(privateKey)
  // Get the signed URL as bytes
  const signatureBytes = sign(urlBytes, privateKeyBytes)
  // Convert the signature to a URL-safe base64 string
  const signatureBase64 = toBase64UrlWithPadding(signatureBytes)
  // Construct and return the full signed URL
  return `${urlToSign}&signature=${signatureBase64}`
}
