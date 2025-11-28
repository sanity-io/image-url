# Change Log

## 2.0.1

### Patch Changes

- [#90](https://github.com/sanity-io/image-url/pull/90) [`b1ebf65`](https://github.com/sanity-io/image-url/commit/b1ebf65b4c5ae3a7eda1ac1857b531497adeedf9) Thanks [@rdunk](https://github.com/rdunk)! - Replaced the exported builder class instance types with public interfaces to avoid TS4094 errors and fixed the signed builder type export names

## 2.0.0

### Major Changes

- [#84](https://github.com/sanity-io/image-url/pull/84) [`440e082`](https://github.com/sanity-io/image-url/commit/440e0821fc629fdaa189dddaa436667b4cdcb477) Thanks [@rdunk](https://github.com/rdunk)! - Export all public types from the main package entry point. Replaces type imports from internal `/lib` paths.

- [#84](https://github.com/sanity-io/image-url/pull/84) [`440e082`](https://github.com/sanity-io/image-url/commit/440e0821fc629fdaa189dddaa436667b4cdcb477) Thanks [@rdunk](https://github.com/rdunk)! - Dropped CommonJS support. The package is now ESM only; use `import` syntax instead of `require()`.

- [#84](https://github.com/sanity-io/image-url/pull/84) [`440e082`](https://github.com/sanity-io/image-url/commit/440e0821fc629fdaa189dddaa436667b4cdcb477) Thanks [@rdunk](https://github.com/rdunk)! - Replaced the default export with a named export. Use `createImageUrlBuilder` instead of the default export.

### Minor Changes

- [#85](https://github.com/sanity-io/image-url/pull/85) [`0e70296`](https://github.com/sanity-io/image-url/commit/0e702963824b82caf09a96c825b31ec31b51f686) Thanks [@rdunk](https://github.com/rdunk)! - Added support for signed URLs via the `signed` export path.

- [#87](https://github.com/sanity-io/image-url/pull/87) [`4ed76df`](https://github.com/sanity-io/image-url/commit/4ed76df8ab4b399bde911a6fce397c3553f16538) Thanks [@rdunk](https://github.com/rdunk)! - Added support for transforming Media Library specific image URLs

## 1.2.0

### Minor Changes

- [#77](https://github.com/sanity-io/image-url/pull/77) [`c48fd9f`](https://github.com/sanity-io/image-url/commit/c48fd9f588915a1dc5d0e313e8a3f7e21e0fe307) Thanks [@stipsan](https://github.com/stipsan)! - add placeholder object for when image is being uploaded (#76)

### Patch Changes

- [#82](https://github.com/sanity-io/image-url/pull/82) [`c7370d4`](https://github.com/sanity-io/image-url/commit/c7370d4d54f0ca7edefd9e9d283367a7c15d3114) Thanks [@RitaDias](https://github.com/RitaDias)! - - when still uploading return a placeholder image via dataurl (#84)

All _notable_ changes will be documented in this file.

## 1.1.0 - 2024-10-30

### Changes

- Add new `frame()` method
- Add new `vanityName()` method (thanks @Isissss!)
- Allow specifying `baseUrl` in builder typings (thanks @ryami333!)
- Allow resetting format through `.format(undefined)` (thanks @selbekk!)

## 1.0.2 - 2023-01-18

### Changes

- Support upcoming `@sanity/client@5`

## 1.0.1 - 2021-09-01

### Changes

- Drop the `dpr` parameter if it has the default value (`1`)

## 1.0.0 - 2021-09-01

### BREAKING

- Throw error when passing invalid source instead of returning `null`
