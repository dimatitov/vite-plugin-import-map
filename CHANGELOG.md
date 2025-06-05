# Changelog

All notable changes to this project will be documented in this file.

## [1.3.4] - 2025-06-05

### Fixed

- Normalize version

## [1.3.4] - 2025-06-05

### Added

- Add `Contributors` in README

## [1.3.3] - 2025-06-05

### Changed

- Switched from `strip-json-comments` to [`comment-json`](https://github.com/zeke/comment-json) for reading and writing `tsconfig.json`, preserving comments when syncing paths.

### Thanks

- Big thanks to [@itisArshdeep](https://github.com/itisArshdeep) for implementing this improvement!

## [1.2.0] - 2024-05-08

### Added

- `autoRestart` option to automatically restart Vite dev server on import map change.
- Real-time syncing from `import-map.json` during dev server runtime.
- Logging to notify when a manual restart is needed.
- Documentation updates for new features and plugin options.

### Fixed

- Normalized relative paths to absolute project paths in `tsconfig`.
- Ensured correct handling of `baseUrl` and alias formatting.

## [1.2.1] - 2024-05-08

### Fixed

- Fix title `Server Restart Behavior` in readme.

## [1.2.2] - 2024-05-08

### Added

- `publish.yml` for CI/CD in GitHub action

## [1.2.3] - 2024-05-08

### Fixed

- Fix README `npm i`

## [1.2.4] - 2024-05-08

### Fixed

- Fix README `yarn add vite-plugin-module-alias --dev`
- Up version

## [1.2.5] - 2024-05-08

### Fixed

- Fix README

## [1.2.6] - 2024-05-09

### Added

- Add new information for tsconfig

### Fixed

- Fixed an issue in `makeRelativePath` where paths starting with `/` were handled incorrectly.

## [1.2.7] - 2024-05-12

### Fixed

- remove CJS

## [1.2.8] - 2024-05-12

### Fixed

- add info in README "type": "module"
- remove dir dist from github 

## [1.2.9] - 2024-05-12

### Fixed

- hot fix: add dist in package

