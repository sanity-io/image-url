import {createImageUrlBuilder, type SanityImageSource} from '@sanity/image-url'

const builder = createImageUrlBuilder({projectId: 'project', dataset: 'dataset'})

export const urlFor = (source: SanityImageSource) =>
  builder.image(source).auto('format').fit('max').format('webp')
