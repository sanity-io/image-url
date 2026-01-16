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
        resource: {type: 'media-library' as const, id: 'library123'},
      }),
    }

    expect(createImageUrlBuilder(client).image('image-abc123-200x200-png').toString()).toBe(
      'https://cdn.sanity.io/media-libraries/library123/images/abc123-200x200.png'
    )
  })

  test('withClient swaps to media library client and preserves options', () => {
    const datasetClient = {
      clientConfig: {
        apiHost: 'https://api.sanity.io',
        projectId: 'abc123',
        dataset: 'foo',
      },
    }

    const mediaClient = {
      clientConfig: {
        apiHost: 'https://api.sanity.io',
        resource: {type: 'media-library' as const, id: 'library123'},
      },
    }

    const builder = createImageUrlBuilder(datasetClient)
      .image('image-abc123-200x200-png')
      .width(200)

    const swapped = builder.withClient(mediaClient)

    expect(swapped).not.toBe(builder)
    expect(swapped.toString()).toBe(
      'https://cdn.sanity.io/media-libraries/library123/images/abc123-200x200.png?w=200'
    )
    expect(builder.toString()).toBe(
      'https://cdn.sanity.io/images/abc123/foo/abc123-200x200.png?w=200'
    )
  })

  test('withClient can swap back to project/dataset from media library', () => {
    const mediaClient = {
      clientConfig: {
        apiHost: 'https://api.sanity.io',
        resource: {type: 'media-library' as const, id: 'library123'},
      },
    }

    const builder = createImageUrlBuilder(mediaClient).image('image-abc123-200x200-png').width(320)

    const datasetBuilder = builder.withClient({
      baseUrl: 'https://cdn.otherhost.io',
      projectId: 'proj123',
      dataset: 'animals',
    })

    expect(datasetBuilder.toString()).toBe(
      'https://cdn.otherhost.io/images/proj123/animals/abc123-200x200.png?w=320'
    )
  })

  test('resource takes precedence over ~experimental_resource when both are present', () => {
    const client = {
      clientConfig: {
        apiHost: 'https://api.sanity.io',
        resource: {type: 'media-library' as const, id: 'new-library'},
        '~experimental_resource': {type: 'media-library' as const, id: 'old-library'},
      },
    }

    expect(createImageUrlBuilder(client).image('image-abc123-200x200-png').toString()).toBe(
      'https://cdn.sanity.io/media-libraries/new-library/images/abc123-200x200.png'
    )
  })

  test('throws error when resource is missing id', () => {
    const client = {
      clientConfig: {
        apiHost: 'https://api.sanity.io',
        resource: {type: 'media-library' as const, id: ''},
      },
    }

    expect(() => createImageUrlBuilder(client)).toThrow(
      'Media library clients must include an id in "resource"'
    )
  })
})
