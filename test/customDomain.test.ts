import {describe, test, expect} from 'vitest'
import {createImageUrlBuilder} from '../src/builder'

describe('custom domains', () => {
  test('can specify `baseUrl`', () => {
    const options = {
      projectId: 'xyz321',
      dataset: 'staging',
      baseUrl: 'https://mycustom.domain',
    }
    expect(
      createImageUrlBuilder(options)
        .image('image-928ac96d53b0c9049836c86ff25fd3c009039a16-200x200-png')
        .toString()
    ).toBe(
      'https://mycustom.domain/images/xyz321/staging/928ac96d53b0c9049836c86ff25fd3c009039a16-200x200.png'
    )
  })

  test('strips trailing slashes for `baseUrl`', () => {
    const options = {
      projectId: 'xyz321',
      dataset: 'staging',
      baseUrl: 'https://mycustom.domain/',
    }
    expect(
      createImageUrlBuilder(options)
        .image('image-928ac96d53b0c9049836c86ff25fd3c009039a16-200x200-png')
        .toString()
    ).toBe(
      'https://mycustom.domain/images/xyz321/staging/928ac96d53b0c9049836c86ff25fd3c009039a16-200x200.png'
    )
  })

  test('can infer from client `apiHost`', () => {
    const options = {
      clientConfig: {
        projectId: 'xyz321',
        dataset: 'staging',
        apiHost: 'https://api.totally.custom',
      },
    }
    expect(
      createImageUrlBuilder(options)
        .image('image-928ac96d53b0c9049836c86ff25fd3c009039a16-200x200-png')
        .toString()
    ).toBe(
      'https://cdn.totally.custom/images/xyz321/staging/928ac96d53b0c9049836c86ff25fd3c009039a16-200x200.png'
    )
  })
})
