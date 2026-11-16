---
'@sanity/image-url': minor
---

Accept Sanity TypeGen image types in `image()` without casts, and add `InferImageValue`, `InferStrictImageValue` and `isImageWithAsset` for typing shared image components.

`SanityImageSource` now also accepts `SanityImageLike` and `SanityImageAssetLike`, which match the image shapes TypeGen generates: raw image fields, images with `asset->` dereferenced, partial projections like `image{asset, crop, hotspot}` and `asset->{_id, url}`, and custom image types with extra fields. Existing types are unchanged.

Images whose dereferenced asset is `null` now throw the usual "Unable to resolve image URL" error instead of a `TypeError`, and crop or hotspot objects with missing coordinates fall back to the default values instead of producing `NaN` in the URL.
