import SanityClient from '@sanity/client'
import imgUrl from '../src'

describe('init from client', () => {
  test('can get config from client', () => {
    const client = new SanityClient({projectId: 'abc123', dataset: 'foo', useCdn: true})
    expect(imgUrl(client).image('image-abc123-200x200-png').toString()).toBe(
      'https://cdn.sanity.io/images/abc123/foo/abc123-200x200.png'
    )
  })

  test('can get base url from client', () => {
    const client = new SanityClient({
      apiHost: 'https://api.sanity.lol',
      projectId: 'abc123',
      dataset: 'foo',
      useCdn: true,
    })

    expect(imgUrl(client).image('image-abc123-200x200-png').toString()).toBe(
      'https://cdn.sanity.lol/images/abc123/foo/abc123-200x200.png'
    )
  })
})
