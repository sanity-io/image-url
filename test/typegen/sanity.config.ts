import {defineArrayMember, defineConfig, defineField, defineType} from 'sanity'

const figure = defineType({
  name: 'figure',
  title: 'Figure',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({name: 'alt', title: 'Alternative text', type: 'string'}),
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
  ],
})

const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string'}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title'}}),
    defineField({name: 'thumbnail', title: 'Thumbnail', type: 'image'}),
    defineField({
      name: 'cover',
      title: 'Cover',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({name: 'figure', title: 'Figure', type: 'figure'}),
    defineField({name: 'attachment', title: 'Attachment', type: 'file'}),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
        }),
        defineArrayMember({type: 'figure'}),
      ],
    }),
  ],
})

export default defineConfig({
  name: 'default',
  title: 'TypeGen fixtures',
  projectId: 'test-project',
  dataset: 'production',
  schema: {
    types: [figure, post],
  },
})
