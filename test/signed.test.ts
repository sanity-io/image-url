import {Buffer as NodeBuffer} from 'node:buffer'
import {createClient} from '@sanity/client'
import {describe, test, expect, vi} from 'vitest'
import {createImageUrlBuilder} from '../src/signed/signed-builder'
import {croppedImage} from './fixtures'

const keyId = 'test-key-id'
const privateKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
const expiry = '2025-12-31T23:59:59Z'

// Helpers
const baseImage = () =>
  createImageUrlBuilder().projectId('zp7mbokg').dataset('production').image(croppedImage())
const qp = (url: string, key: string) => new URL(url).searchParams.get(key)
const lastParam = (url: string) => {
  const params = new URL(url).searchParams
  const last = Array.from(params.entries()).pop() || []
  return {key: last[0], value: last[1]}
}

describe('signed-builder', () => {
  test('should generate a url with signing specific parameters', () => {
    const url = baseImage().signingKey(keyId, privateKey).signedUrl()
    expect(qp(url, 'keyid')).toBe(keyId)
    expect(qp(url, 'signature')).toBeTruthy()
  })

  test('should generate a url with signing specific parameters (browser)', () => {
    vi.stubGlobal('Buffer', undefined)
    const fakeBtoa = vi.fn((bin: string) => NodeBuffer.from(bin, 'binary').toString('base64'))
    vi.stubGlobal('btoa', fakeBtoa)

    try {
      const url = baseImage().signingKey(keyId, privateKey).signedUrl()
      expect(qp(url, 'keyid')).toBe(keyId)
      expect(qp(url, 'signature')).toBeTruthy()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  test('should throw if signedUrl is called without signing options', () => {
    expect(() => baseImage().signedUrl()).toThrow()
  })

  test('should throw if keyId is missing when calling signingKey', () => {
    expect(() =>
      baseImage()
        .signingKey(undefined as any, privateKey)
        .signedUrl()
    ).toThrow(/keyId/i)
  })

  test('should throw if privateKey is missing when calling signingKey', () => {
    expect(() =>
      baseImage()
        .signingKey(keyId, undefined as any)
        .signedUrl()
    ).toThrow(/privateKey/i)
  })

  test('should include expiry parameter when provided', () => {
    const url = baseImage().signingKey(keyId, privateKey).expiry(expiry).signedUrl()
    expect(qp(url, 'expiry')).toBe(expiry)
  })

  test('should throw on invalid expiry format', () => {
    expect(() => baseImage().signingKey(keyId, privateKey).expiry('nope').signedUrl()).toThrow(
      /expiry/i
    )
  })

  test('should throw if expiry is in the past', () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    expect(() =>
      baseImage().signingKey(keyId, privateKey).expiry('2025-12-31T23:59:59Z').signedUrl()
    ).toThrow(/expiry/i)
    vi.useRealTimers()
  })

  test('should accept Date as expiry value', () => {
    const date = new Date(expiry)
    const url = baseImage().signingKey(keyId, privateKey).expiry(date).signedUrl()
    expect(qp(url, 'expiry')).toBe(expiry)
  })

  test('should append signature as the last query parameter', () => {
    const url = baseImage().width(320).signingKey(keyId, privateKey).height(240).signedUrl()
    expect(lastParam(url).key).toBe('signature')
  })

  test('should produce signature independent of options call order', () => {
    const a = baseImage().width(320).height(240).signingKey(keyId, privateKey).signedUrl()
    const b = baseImage().height(240).signingKey(keyId, privateKey).width(320).signedUrl()
    expect(qp(a, 'signature')).toBe(qp(b, 'signature'))
  })

  test('should not include signing parameters if signedUrl() is not used', () => {
    const url = baseImage().signingKey(keyId, privateKey).expiry(expiry).url()
    expect(qp(url, 'signature')).toBeNull()
    expect(qp(url, 'keyid')).toBeNull()
    expect(qp(url, 'expiry')).toBeNull()
  })

  test('should not leak signing params after signedUrl() is called', () => {
    const builder = baseImage().expiry(expiry).signingKey(keyId, privateKey)
    void builder.signedUrl()
    const plain = builder.url()
    expect(qp(plain, 'signature')).toBeNull()
    expect(qp(plain, 'keyid')).toBeNull()
    expect(qp(plain, 'expiry')).toBeNull()
  })

  test('should allow using withOptions for signing parameters', () => {
    const url = baseImage()
      .withOptions({
        keyId,
        privateKey,
        expiry,
      })
      .signedUrl()
    expect(qp(url, 'signature')).toBeTruthy()
    expect(qp(url, 'keyid')).toBe(keyId)
    expect(qp(url, 'expiry')).toBe(expiry)
  })

  test('should allow using signedImage with a client', () => {
    const client = createClient({projectId: 'zp7mbokg', dataset: 'production'})
    const builder = createImageUrlBuilder(client)
      .image('image-928ac96d53b0c9049836c86ff25fd3c009039a16-200x200-png')
      .signingKey(keyId, privateKey)
    expect(() => builder.signedUrl()).not.toThrow()
  })

  test('should change signature when options change', () => {
    const url1 = baseImage().withOptions({w: 320}).signingKey(keyId, privateKey).signedUrl()
    const url2 = baseImage().withOptions({w: 321}).signingKey(keyId, privateKey).signedUrl()
    expect(qp(url1, 'signature')).not.toBe(qp(url2, 'signature'))
  })

  test('should produce URL-safe base64 signature with padding', () => {
    const url = baseImage().signingKey(keyId, privateKey).signedUrl()
    const signature = qp(url, 'signature')!
    expect(/^[A-Za-z0-9\-_]+={0,2}$/.test(signature)).toBe(true)
    expect(signature.length % 4).toBe(0)
  })

  test('should be idempotent when calling signedUrl() repeatedly', () => {
    const builder = baseImage().signingKey(keyId, privateKey)
    const a = builder.signedUrl()
    const b = builder.signedUrl()
    expect(a).toBe(b)
  })

  test('should merge and override correctly when using withOptions', () => {
    const url = baseImage()
      .withOptions({keyId: 'replace', privateKey})
      .withOptions({keyId})
      .signedUrl()
    expect(qp(url, 'keyid')).toBe(keyId)
    expect(qp(url, 'signature')).toBeTruthy()
  })
})
