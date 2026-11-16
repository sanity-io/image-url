---
'@sanity/image-url': minor
---

Only add a `rect` when the image is cropped, and keep the crop and hotspot when building from an image URL.

- When both width and height are set, the fit modes that keep the whole image (`clip`, `fill`, `fillmax`, `max`, `scale`) no longer get a `rect` that crops the image to the requested aspect ratio around the hotspot. They now only apply the crop from the image record, so the Image API can fit, pad or stretch the image as documented. Cropping around the hotspot is unchanged when no fit mode is set, and for `crop` and `min`.
- URLs built from an image record with a crop or hotspot now end with `x-crop=left,top,width,height` and `x-hotspot=centerX,centerY,width,height` (in source pixels). The Image API ignores these params, so the rendered image is unchanged, but the URL string is different, so CDN caches see these as new URLs. URLs for images without a crop or hotspot are unchanged.
- `image()` now accepts image URLs with search params or a vanity name, which used to throw. The crop and hotspot are read back from `x-crop` and `x-hotspot`, so resizing a URL or changing its fit mode recomputes the `rect` instead of reusing one that was computed for other dimensions. `rect` is never read back from a URL.
