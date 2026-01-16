# @sanity/image-url

Quickly generate image urls from Sanity image records.

This helper will by default respect any crops/hotspots specified in the Sanity content provided to it. The most typical use case for this is to give it a sanity image and specify a width, height or both and get a nice, cropped and resized image according to the wishes of the content editor and the specifications of the front end developer.

In addition to the core use case, this library provides a handy builder to access the rich selection of processing options available in the Sanity image pipeline.

## Getting started

```sh
npm install --save @sanity/image-url
```

## Usage

The most common way to use this library in your project is to configure it by passing it [your configured sanityClient](https://www.npmjs.com/package/@sanity/client). That way it will automatically be preconfigured to your current project and dataset:

```js
import myConfiguredSanityClient from './sanityClient'
import {createImageUrlBuilder} from '@sanity/image-url'

const builder = createImageUrlBuilder(myConfiguredSanityClient)

function urlFor(source) {
  return builder.image(source)
}
```

Then you can use the handy builder syntax to generate your urls:

```jsx
<img src={urlFor(author.image).width(200).url()} />
```

This will ensure that the author image is always 200 pixels wide, automatically applying any crop specified by the editor and cropping towards the hot-spot she drew. You can specify both width and height like this:

```jsx
<img src={urlFor(movie.poster).width(500).height(300).url()}>
```

There are a large number of useful options you can specify, like e.g. blur:

```jsx
<img src={urlFor(mysteryPerson.mugshot).width(200).height(200).blur(50).url()}>
```

Note that the `url()` function needs to be the final one in order to output the url as a string.

## Builder methods

### `image(source)`

Specify the image to be rendered. Accepts either a Sanity `image` record, an `asset` record, or just the asset id as a string. In order for hotspot/crop processing to be applied, the `image` record must be supplied, as well as both width and height.

### `dataset(dataset)`, `projectId(projectId)`

Usually you should preconfigure your builder with dataset and project id, but even when you did, these let you temporarily override them if you need to render assets from other projects or datasets.

### `withClient(client)`

Switch the builder to use another client configuration. `withClient()` accepts the same input as `createImageUrlBuilder` (a configured Sanity client or raw project details) and returns a builder that keeps any previously chained options while inheriting the new client's base URL.

```ts
const builder = createImageUrlBuilder(primaryClient).image(doc.image).width(400)
const otherBuilder = builder.withClient(secondaryClient)

builder.url()
// https://cdn.sanity.io/images/myProject/production/…?w=400

otherBuilder.url()
// https://cdn.sanity.io/images/anotherProject/staging/…?w=400
```

### `width(pixels)`

Specify the width of the rendered image in pixels.

### `height(pixels)`

Specify the height of the rendered image in pixels.

### `size(width, height)`

Specify width and height in one go.

### `focalPoint(x, y)`

Specify a center point to focus on when cropping the image. Values from 0.0 to 1.0 in fractions of the image dimensions. When specified, overrides any crop or hotspot in the image record.

### `blur(amount)`, `sharpen(amount)`, `invert()`

Apply image processing.

### `rect(left, top, width, height)`

Specify the crop in pixels. Overrides any crop/hotspot in the image record.

### `format(name)`

Specify the image format of the image. 'jpg', 'pjpg', 'png', 'webp'

### `auto(mode)`

Specify transformations to automatically apply based on browser capabilities. Supported values:

- `format` - Automatically uses WebP and AVIF if supported

### `orientation(angle)`

Rotation in degrees. Acceptable values: 0, 90, 180, 270

### `quality(value)`

Compression quality, where applicable. 0-100

### `forceDownload(defaultFileName)`

Make this an url to download the image. Specify the file name that will be suggested to the user.

### `flipHorizontal()`, `flipVertical()`

Flips the image.

### `crop(mode)`

Specifies how to crop the image. When specified, overrides any crop or hotspot in the image record. See the [documentation](https://www.sanity.io/docs/image-urls#crop-749d37d946b6) for details.

### `fit(value)`

Configures the fit mode. See the [documentation](https://www.sanity.io/docs/image-urls#fit-45b29dc6f09f) for details.

### `dpr(value)`

Specifies device pixel ratio scaling factor. From 1 to 3.

### `saturation(value)`

Adjusts the saturation of the image. Currently the only supported value is `-100` - meaning it grayscales the image.

### `ignoreImageParams()`

Ignore any specifications from the image record (i.e. crop and hotspot).

### `url()`, `toString()`

Return the url as a string.

### `pad(value)`

Specify the number of pixels to pad the image.

### `vanityName(fileName)`

Specify a "vanity name" for the image. This is useful for SEO purposes and is added to the end of the URL. For example:

```ts
urlFor('image-928ac96d53b0c9049836c86ff25fd3c009039a16-200x200-png').vanityName('myImage.png')
// https://cdn.sanity.io/…/928ac96d53b0c9049836c86ff25fd3c009039a16-200x200.png/myImage.png
```

### `frame(value)`

Specify the frame of an animated image to transform. Acceptable values:

- `1` - Returns the first frame of the animated image as a static preview of the image.

### Deprecated: `minWidth(pixels)`, `maxWidth(pixels)`, `minHeight(pixels)`, `maxHeight(pixels)`

Specifies min/max dimensions when cropping.

**Deprecated**: You usually want to use `width`/`height` with a fit mode of `max` or `min` instead.

## Custom CDN domains

> [!NOTE]
> This feature is available to select Enterprise accounts. Get in touch with your sales executive to learn more.

You can specify a custom `baseUrl` in the builder options in order to override the default (`https://cdn.sanity.io`):

```js
import {createImageUrlBuilder} from '@sanity/image-url'

const builder = createImageUrlBuilder({
  baseUrl: 'https://my.custom.domain',
  projectId: 'abc123',
  dataset: 'production',
})
const urlFor = (source) => builder.image(source)

urlFor('image-928ac96d53b0c9049836c86ff25fd3c009039a16-200x200-png')
  .auto('format')
  .fit('max')
  .width(720)
  .toString()

// output: https://my.custom.domain/images/abc123/production/928ac96d53b0c9049836c86ff25fd3c009039a16-200x200.png?auto=format&fit=max&w=720
```

If you already have a configured client instance:

```js
import {createImageUrlBuilder} from '@sanity/image-url'
import myConfiguredClient from './mySanityClient'

const builder = createImageUrlBuilder({
  ...myConfiguredClient.config(),
  baseUrl: 'https://my.custom.domain',
})
```

## Signed URLs

> [!NOTE]
> URL signing is available to select Enterprise accounts using the [Media Library](https://www.sanity.io/media-library). Get in touch with your sales executive to learn more.

Signed URLs provide a secure way to deliver assets through Sanity's CDN. Each URL includes a signature that both validates access and ensures the asset is served only with the exact transformations specified in the URL. This prevents unauthorized use, hotlinking, and unapproved image manipulation.

> [!WARNING]
> URL signing should only be performed server-side. Never expose your private signing key in client-side code.

### Getting started with signing

To sign URLs, you'll need the following credentials, which can be generated via your Media Library's settings:

1. a **Key ID** - The unique identifier for your signing key
2. a **Private key** - The key used to generated URL signatures

### Basic usage

Import from the `signed` submodule to create a builder that supports signing:

```js
import {createImageUrlBuilder} from '@sanity/image-url/signed'

const builder = createImageUrlBuilder({
  projectId: 'abc123',
  dataset: 'production',
})

const signedUrl = builder
  .image('image-928ac96d53b0c9049836c86ff25fd3c009039a16-200x200-png')
  .width(500)
  .signingKey('my-key-id', 'my-private-key')
  .expiry('2026-12-31T23:59:59Z')
  .signedUrl()

// output: https://cdn.sanity.io/images/abc123/production/928ac96d53b0c9049836c86ff25fd3c009039a16-200x200.png?w=500&keyid=my-key-id&expiry=2026-12-31T23:59:59Z&signature=...
```

### Setting an expiry time

You can specify an expiry time for signed URLs to ensure they're only valid for a limited period:

```js
// Using an ISO 8601 date string
const url = builder
  .image(author.image)
  .width(500)
  .signingKey('my-key-id', 'my-private-key-hex-string')
  .expiry('2026-12-31T23:59:59Z')
  .signedUrl()

// Using a Date object
const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
const url = builder
  .image(author.image)
  .width(500)
  .signingKey('my-key-id', 'my-private-key')
  .expiry(expiryDate)
  .signedUrl()
```

### Creating a reusable signed builder

For convenience, you can call `signingKey()` early to create a reusable builder instance to automatically sign all URLs:

```js
import {createImageUrlBuilder} from '@sanity/image-url/signed'

// Create a builder with signing credentials configured
const signedBuilder = createImageUrlBuilder({
  projectId: 'abc123',
  dataset: 'production',
}).signingKey('my-key-id', 'my-private-key')

// Now you can reuse this builder for multiple images
function urlFor(source) {
  return signedBuilder.image(source)
}

// Use it just like the regular builder, but call signedUrl() instead of url()
const url1 = urlFor(author.image).width(200).expiry('2026-12-31T23:59:59Z').signedUrl()
const url2 = urlFor(movie.poster).width(500).height(300).expiry('2026-12-31T23:59:59Z').signedUrl()
```

### Important notes

- The signed builder includes all the same methods as the regular builder (`width()`, `height()`, `blur()`, etc.)
- Call `signedUrl()` instead of `url()` to generate a signed URL
- If you call `url()` on a signed builder, it will return a regular unsigned URL
- You must call both `signingKey()` and `expiry()` before calling `signedUrl()`
- Expiry times must be in the future

## Migration Guides

If you're upgrading from v1 to v2, please see the [Migration Guide](./MIGRATE-v1-to-v2.md) for instructions on breaking changes and how to update your code.

## How to publish

1. On your development PR (or after), you can run a command `pnpm changeset add`

This will add a .md file in the .changeset which is necessary for the automated release PR to know that it should go out in the next release

2. Go to the PRs and you should find an open PR with Version Packages for the title (such as https://github.com/sanity-io/image-url/pull/79)

3. Confirm that everything you want to be released is in the description. If it isn't double check that the .mds are in the main branch.

4. Approve and let the automated action finish.

## License

MIT © [Sanity.io](https://www.sanity.io/)
