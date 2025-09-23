# Migrate `@sanity/image-url`: v1 to v2

Version 2 of `@sanity/image-url` introduces changes to modernize the package which primarily affects how the package is imported. All builder API methods remain the same, and URLs generated will be identical given the same inputs.

## Breaking changes

### Named exports

The default export has been replaced with a named export: `createImageUrlBuilder`. This makes the API more explicit and follows modern JavaScript conventions.

```diff
- import imageUrlBuilder from '@sanity/image-url'
+ import {createImageUrlBuilder} from '@sanity/image-url'
```

### Fixed type exports

All TypeScript types are now exported from the main package entry point. Previously, types had to be imported from internal `/lib` directory paths, which was not part of the public API. Importing from these paths will no longer work.

```diff
- import type {SanityImageSource} from '@sanity/image-url/lib/types/types'
+ import type {SanityImageSource} from '@sanity/image-url'
```

### ESM only

The package now uses ES modules exclusively. CommonJS `require()` syntax is no longer supported and must be replaced with `import` statements.

```diff
- const urlBuilder = require('@sanity/image-url')
+ import {createImageUrlBuilder} from '@sanity/image-url'
```

### Node.js minimum version

The minimum supported Node.js version has been updated from `10.0.0` to `20.19.0`.

## Example migration

```diff
import React from 'react'
import myConfiguredSanityClient from './sanityClient'
- import imageUrlBuilder from '@sanity/image-url'
+ import {createImageUrlBuilder} from '@sanity/image-url'

- const builder = imageUrlBuilder(myConfiguredSanityClient)
+ const builder = createImageUrlBuilder(myConfiguredSanityClient)

function urlFor(source) {
  return builder.image(source)
}

function MyComponent({image}) {
  return (
    <img src={urlFor(image).width(400).height(300).url()} />
  )
}
```
