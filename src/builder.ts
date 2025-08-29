import type {
  AutoMode,
  CropMode,
  FitMode,
  ImageFormat,
  ImageUrlBuilderOptions,
  ImageUrlBuilderOptionsWithAliases,
  SanityModernClientLike,
  Orientation,
  SanityClientLike,
  SanityImageSource,
  SanityProjectDetails,
} from './types'
import urlForImage, {SPEC_NAME_TO_URL_NAME_MAPPINGS} from './urlForImage'

const validFits = ['clip', 'crop', 'fill', 'fillmax', 'max', 'scale', 'min']
const validCrops = ['top', 'bottom', 'left', 'right', 'center', 'focalpoint', 'entropy']
const validAutoModes = ['format']

function isSanityModernClientLike(
  client?: SanityClientLike | SanityProjectDetails | SanityModernClientLike
): client is SanityModernClientLike {
  return client && 'config' in client ? typeof client.config === 'function' : false
}

function isSanityClientLike(
  client?: SanityClientLike | SanityProjectDetails | SanityModernClientLike
): client is SanityClientLike {
  return client && 'clientConfig' in client ? typeof client.clientConfig === 'object' : false
}

/**
 * @internal
 */
export function rewriteSpecName(key: string) {
  const specs = SPEC_NAME_TO_URL_NAME_MAPPINGS
  for (const entry of specs) {
    const [specName, param] = entry
    if (key === specName || key === param) {
      return specName
    }
  }

  return key
}

/**
 * @public
 */
export function createBuilder<C extends typeof ImageUrlBuilder>(
  Builder: C,
  _options?: SanityClientLike | SanityProjectDetails | SanityModernClientLike
): InstanceType<C> {
  let options: ConstructorParameters<C>[1] = {}

  if (isSanityModernClientLike(_options)) {
    // Inherit config from client
    const {apiHost: apiUrl, projectId, dataset} = _options.config()
    const apiHost = apiUrl || 'https://api.sanity.io'
    options = {
      baseUrl: apiHost.replace(/^https:\/\/api\./, 'https://cdn.'),
      projectId,
      dataset,
    }
  }

  // Did we get a SanityClient?
  else if (isSanityClientLike(_options)) {
    // Inherit config from client
    const {apiHost: apiUrl, projectId, dataset} = _options.clientConfig
    const apiHost = apiUrl || 'https://api.sanity.io'
    options = {
      baseUrl: apiHost.replace(/^https:\/\/api\./, 'https://cdn.'),
      projectId,
      dataset,
    }
  }

  // Or just accept the options as given
  else {
    options = _options || {}
  }

  return new Builder(null, options) as InstanceType<C>
}

/**
 * @public
 */
export default function urlBuilder(
  options?: SanityClientLike | SanityProjectDetails | SanityModernClientLike
) {
  return createBuilder(ImageUrlBuilder, options)
}

/**
 * @public
 */
export class ImageUrlBuilder {
  public options: ImageUrlBuilderOptions

  constructor(parent: ImageUrlBuilder | null, options: ImageUrlBuilderOptions) {
    this.options = parent
      ? {...(parent.options || {}), ...(options || {})} // Merge parent options
      : {...(options || {})} // Copy options
  }

  protected constructNewOptions(options: Partial<ImageUrlBuilderOptionsWithAliases>) {
    const baseUrl = options.baseUrl || this.options.baseUrl

    const newOptions: {[key: string]: any} = {baseUrl}
    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        const specKey = rewriteSpecName(key)
        newOptions[specKey] = options[key]
      }
    }
    return {baseUrl, ...newOptions}
  }

  withOptions(options: Partial<ImageUrlBuilderOptionsWithAliases>): this {
    const newOptions = this.constructNewOptions(options)
    return new ImageUrlBuilder(this, newOptions) as this
  }

  // The image to be represented. Accepts a Sanity 'image'-document, 'asset'-document or
  // _id of asset. To get the benefit of automatic hot-spot/crop integration with the content
  // studio, the 'image'-document must be provided.
  image(source: SanityImageSource) {
    return this.withOptions({source})
  }

  // Specify the dataset
  dataset(dataset: string) {
    return this.withOptions({dataset})
  }

  // Specify the projectId
  projectId(projectId: string) {
    return this.withOptions({projectId})
  }

  // Specify background color
  bg(bg: string) {
    return this.withOptions({bg})
  }

  // Set DPR scaling factor
  dpr(dpr: number) {
    // A DPR of 1 is the default - so only include it if we have a different value
    return this.withOptions(dpr && dpr !== 1 ? {dpr} : {})
  }

  // Specify the width of the image in pixels
  width(width: number) {
    return this.withOptions({width})
  }

  // Specify the height of the image in pixels
  height(height: number) {
    return this.withOptions({height})
  }

  // Specify focal point in fraction of image dimensions. Each component 0.0-1.0
  focalPoint(x: number, y: number) {
    return this.withOptions({focalPoint: {x, y}})
  }

  maxWidth(maxWidth: number) {
    return this.withOptions({maxWidth})
  }

  minWidth(minWidth: number) {
    return this.withOptions({minWidth})
  }

  maxHeight(maxHeight: number) {
    return this.withOptions({maxHeight})
  }

  minHeight(minHeight: number) {
    return this.withOptions({minHeight})
  }

  // Specify width and height in pixels
  size(width: number, height: number) {
    return this.withOptions({width, height})
  }

  // Specify blur between 0 and 100
  blur(blur: number) {
    return this.withOptions({blur})
  }

  sharpen(sharpen: number) {
    return this.withOptions({sharpen})
  }

  // Specify the desired rectangle of the image
  rect(left: number, top: number, width: number, height: number) {
    return this.withOptions({rect: {left, top, width, height}})
  }

  // Specify the image format of the image. 'jpg', 'pjpg', 'png', 'webp'
  format(format?: ImageFormat | undefined) {
    return this.withOptions({format})
  }

  invert(invert: boolean) {
    return this.withOptions({invert})
  }

  // Rotation in degrees 0, 90, 180, 270
  orientation(orientation: Orientation) {
    return this.withOptions({orientation})
  }

  // Compression quality 0-100
  quality(quality: number) {
    return this.withOptions({quality})
  }

  // Make it a download link. Parameter is default filename.
  forceDownload(download: boolean | string) {
    return this.withOptions({download})
  }

  // Flip image horizontally
  flipHorizontal() {
    return this.withOptions({flipHorizontal: true})
  }

  // Flip image vertically
  flipVertical() {
    return this.withOptions({flipVertical: true})
  }

  // Ignore crop/hotspot from image record, even when present
  ignoreImageParams() {
    return this.withOptions({ignoreImageParams: true})
  }

  fit(value: FitMode) {
    if (validFits.indexOf(value) === -1) {
      throw new Error(`Invalid fit mode "${value}"`)
    }

    return this.withOptions({fit: value})
  }

  crop(value: CropMode) {
    if (validCrops.indexOf(value) === -1) {
      throw new Error(`Invalid crop mode "${value}"`)
    }

    return this.withOptions({crop: value})
  }

  // Saturation
  saturation(saturation: number) {
    return this.withOptions({saturation})
  }

  auto(value: AutoMode) {
    if (validAutoModes.indexOf(value) === -1) {
      throw new Error(`Invalid auto mode "${value}"`)
    }

    return this.withOptions({auto: value})
  }

  // Specify the number of pixels to pad the image
  pad(pad: number) {
    return this.withOptions({pad})
  }

  // Vanity URL for more SEO friendly URLs
  vanityName(value: string) {
    return this.withOptions({vanityName: value})
  }

  frame(frame: number) {
    if (frame !== 1) {
      throw new Error(`Invalid frame value "${frame}"`)
    }

    return this.withOptions({frame})
  }

  // Gets the url based on the submitted parameters
  url() {
    return urlForImage(this.options)
  }

  // Alias for url()
  toString() {
    return this.url()
  }
}
