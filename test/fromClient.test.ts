import {describe, test, expect} from 'vitest'
import {createImageUrlBuilder} from '../src/builder'

describe('init from client', () => {
  test('can get config from client', () => {
    const client = {
      clientConfig: {projectId: 'abc123', dataset: 'foo', apiHost: 'https://cdn.sanity.io'},
    }
    expect(createImageUrlBuilder(client).image('image-abc123-200x200-png').toString()).toBe(
      'https://cdn.sanity.io/images/abc123/foo/abc123-200x200.png'
    )
  })

  test('can get base url from client', () => {
    const client = {
      clientConfig: {
        apiHost: 'https://api.sanity.lol',
        projectId: 'abc123',
        dataset: 'foo',
      },
    }
    expect(createImageUrlBuilder(client).image('image-abc123-200x200-png').toString()).toBe(
      'https://cdn.sanity.lol/images/abc123/foo/abc123-200x200.png'
    )
  })

  test('can get media library base url from legacy client config', () => {
    const client = {
      clientConfig: {
        apiHost: 'https://api.sanity.io',
        '~experimental_resource': {type: 'media-library' as const, id: 'library123'},
      },
    }

    expect(createImageUrlBuilder(client).image('image-abc123-200x200-png').toString()).toBe(
      'https://cdn.sanity.io/media-libraries/library123/images/abc123-200x200.png'
    )
  })

  test('can get media library base url from modern client config', () => {
    const client = {
      config: () => ({
        apiHost: 'https://api.sanity.io',
        '~experimental_resource': {type: 'media-library' as const, id: 'library123'},
      }),
    }

    expect(createImageUrlBuilder(client).image('image-abc123-200x200-png').toString()).toBe(
      'https://cdn.sanity.io/media-libraries/library123/images/abc123-200x200.png'
    )
  })
})
