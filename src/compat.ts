function once<TFn extends (...args: never[]) => unknown>(fn: TFn) {
  let didCall = false
  let returnValue: ReturnType<TFn> | undefined
  return (...args: Parameters<TFn>): ReturnType<TFn> => {
    if (didCall) {
      return returnValue as ReturnType<TFn>
    }
    returnValue = fn(...args) as ReturnType<TFn>
    didCall = true
    return returnValue
  }
}

const createWarningPrinter = (message: readonly string[]) =>
  once((...args: unknown[]) => {
    // tslint:disable-next-line:no-console -- warn once while keeping old default import usable
    console.warn(message.join(' '), ...args)
  })

const printNoDefaultExport = createWarningPrinter([
  'The default export of @sanity/image-url has been deprecated. Use the named export `createImageUrlBuilder` instead.',
])

/* @internal */
export function defineDeprecated<ImageUrlBuilder, OptionsType>(
  createImageUrlBuilder: (options?: OptionsType) => ImageUrlBuilder
) {
  return function deprecatedCreateImageUrlBuilder(options?: OptionsType) {
    printNoDefaultExport()
    return createImageUrlBuilder(options)
  }
}
