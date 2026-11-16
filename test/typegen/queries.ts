import {defineQuery} from 'groq'

export const postImagesQuery = defineQuery(
  `*[_type == "post" && slug.current == $slug][0]{thumbnail, cover, figure, gallery}`
)

export const postImagesWithAssetQuery = defineQuery(
  `*[_type == "post" && slug.current == $slug][0]{
    thumbnail{..., asset->},
    cover{..., asset->},
    figure{..., asset->},
    gallery[]{..., asset->},
    attachment{..., asset->}
  }`
)

export const postImagesPartialQuery = defineQuery(
  `*[_type == "post" && slug.current == $slug][0]{
    "cover": cover{asset, hotspot, crop},
    "coverAsset": cover.asset->,
    "coverAssetPartial": cover.asset->{_id, url, metadata{lqip, dimensions}},
    "coverUrl": cover.asset->url,
    "coverRef": cover.asset._ref,
    "figure": figure{alt, caption, asset->{_id, url}},
    "galleryAssets": gallery[].asset
  }`
)

export const postsQuery = defineQuery(`*[_type == "post"]{_id, title, cover}`)

export const postQuery = defineQuery(`*[_type == "post" && slug.current == $slug][0]`)
