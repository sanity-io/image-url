# Change Log

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
