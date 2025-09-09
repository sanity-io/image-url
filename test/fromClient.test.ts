import {describe, test, expect} from 'vitest'
import {urlBuilder} from '../src/builder'

describe('init from client', () => {
  test('can get config from client', () => {
    const client = {
      clientConfig: {projectId: 'abc123', dataset: 'foo', apiHost: 'https://cdn.sanity.io'},
    }
    expect(urlBuilder(client).image('image-abc123-200x200-png').toString()).toBe(
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
    expect(urlBuilder(client).image('image-abc123-200x200-png').toString()).toBe(
      'https://cdn.sanity.lol/images/abc123/foo/abc123-200x200.png'
    )
  })
})
