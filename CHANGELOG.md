# Changelog

All notable changes to this project will be documented in this file.

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
