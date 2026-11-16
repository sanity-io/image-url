---
'@sanity/image-url': patch
---

Stop adding a hotspot-centered `rect` for fit modes that keep the whole image (`clip`, `fill`, `fillmax`, `max`, `scale`) when both width and height are set. These modes now only apply the crop from the image record, so the Image API can fit, pad or scale the image as documented. Cropping around the hotspot is unchanged when no fit mode is set, and for `crop` and `min`.
