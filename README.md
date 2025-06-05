# `vite-plugin-import-map`

[![npm version](https://img.shields.io/npm/v/@titovdima/vite-plugin-import-map.svg)](https://www.npmjs.com/package/@titovdima/vite-plugin-import-map)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 📦 Prefer the public version?  
> Use [`vite-plugin-module-alias`](https://www.npmjs.com/package/vite-plugin-module-alias) — same functionality, no scope, ideal for production use.

A simple and flexible Vite plugin to inject an [Import Map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) into your project. Supports both inline import maps and external `import-map.json` file. Automatically reloads the Vite dev server when the map is updated.

---

## ✨ Features

- Injects `<script type="importmap">` into HTML automatically
- Supports inline `imports` or external `import-map.json` file
- Watches and triggers full reload on import map file changes
- Resolves import aliases in dev and marks them as external in production
- Optionally syncs TypeScript `paths` by updating `tsconfig.json`

---

## 💎 Value Proposition

Modern frontends often rely on import aliases for better DX and cleaner project structures. TypeScript supports this via `tsconfig.json`, but these aliases are **only for type checking and editor autocomplete** — they do **not** affect how modules are actually resolved in the browser or by Vite during development and production.

This plugin closes that gap by:

- Injecting a real `<script type="importmap">` into your app's HTML
- Letting browsers resolve imports using native import maps
- Updating Vite’s `resolve.alias` so your dev environment aligns with your runtime
- Watching external `import-map.json` for changes and reloading automatically
- Optionally syncs aliases to your `tsconfig.json` file via the `tsconfigPath` option
- Automatically removes outdated aliases from `paths` to keep things clean
- Keeps TypeScript, IDE, Vite, and browser resolution fully aligned

Together, this ensures:

- **Consistent resolution** between editor, Vite, and browser
- **Cleaner imports** without relying on relative paths
- **Improved maintainability** and **shared import maps** across tooling

### 🧠 TypeScript integration

To keep type resolution working in your IDE, continue to define aliases in your `tsconfig.json` like so:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

Then let the plugin handle runtime resolution seamlessly.

---

## 📦 Installation

```bash
npm install @titovdima/vite-plugin-import-map --save-dev
```

or

```bash
yarn add @titovdima/vite-plugin-import-map --dev
```

---

## 🔧 Project Setup
This project uses ECMAScript Modules (ESM). To ensure it works correctly, make sure the following flag is set in your package.json:

```json
{
  "type": "module"
}
```


## 🚀 Usage

You can configure the plugin in one of two ways — either by providing an inline `imports` object directly in your `vite.config.ts`, or by specifying a path to an external `import-map.json` file. **Do not use both at once.**

### Option 1: Inline Import Map (via `vite.config.ts`)

```ts
import { defineConfig } from "vite";
import importMapPlugin from "@titovdima/vite-plugin-import-map";

export default defineConfig({
  plugins: [
    importMapPlugin({
      imports: {
        "@components": "/src/components",
        "@utils": "/src/utils",
      },
    }),
  ],
});
```

### Option 2: External JSON File

You can define the import map in a separate `import-map.json` file at the project root:

```json
{
  "imports": {
    "@components": "/src/components",
    "@utils": "/src/utils",
    "@assets": "/src/assets"
  }
}
```

### 🔤 Supported Format for Imports

The keys in the import map support the following formats:

- Exact match: `"@components": "src/components"` or `"@components": "./src/components"` or `"@components": "/src/components"`
- **Note:** All of the above will be normalized and resolved based on the project root.
- **Important:** Prefix matches (e.g. `"@components/"`) are **not** currently supported.

Then use the plugin like this:

```ts
import { defineConfig } from "vite";
import importMapPlugin from "@titovdima/vite-plugin-import-map";

export default defineConfig({
  plugins: [
    importMapPlugin({
      importMapPath: "import-map.json",
    }),
  ],
});
```

---

## 📁 Example Imports

Now you can import modules using cleaner aliases:

```ts
import Button from "@components/Button";
import { formatDate } from "@utils/date";
import logo from "@assets/logo.png";
```

---

## ⚙️ Plugin Options

| Option          | Type                     | Description                                                                                                                                                      |
| --------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `imports`       | `Record<string, string>` | (optional) Inline import map. Only absolute paths starting with '/' are supported. **Use either `imports` or `importMapPath`—both at once will cause an error.** |
| `importMapPath` | `string`                 | (optional) Path to external `import-map.json` file. **Use either `imports` or `importMapPath`—both at once will cause an error.**                                |
| `tsconfigPath`  | `string`                 | (optional) Path to `tsconfig.json` or a variant (e.g. `tsconfig.app.json`) to auto-sync TypeScript paths.                                                        |
| `autoRestart`   | `boolean`                | (optional) Automatically restarts Vite server when `importMapPath` changes. Default is `false`.                                                                  |

✅ Comments in `tsconfig.json` are now preserved when the plugin syncs paths — no more stripped-out comments, thanks to the switch to `comment-json`!

> You must choose **either** `imports` **or** `importMapPath` — using both at the same time is not supported and will throw an error. This design ensures that the import map comes from only one source, preventing ambiguity.

---

## 🔧 TypeScript Path Syncing

When you specify the `tsconfigPath` option, the plugin will automatically update your TypeScript configuration to match your import map. This keeps editor IntelliSense and compile-time path resolution in sync with your runtime aliases.

- Aliases will be written to the `compilerOptions.paths` section.
- Any aliases removed from the import map will also be cleaned up in the tsconfig file.
- The plugin ensures paths use the `@alias/*` → `path/to/*` format required by TypeScript.

```md
If `baseUrl` is not set, the plugin will default it to `"."` to ensure paths work as expected.
```

This is because TypeScript requires a baseUrl to correctly resolve paths, and "." ensures that all aliases are resolved relative to the project root.

> ℹ️ After aliases are updated, **you may need to restart the TypeScript server** in your IDE for changes to take effect. Restarting the server ensures that all changes are applied.

### Example: tsconfig.app.json

If you are using a project references setup, you may want to sync aliases into `tsconfig.app.json` instead of the root `tsconfig.json`.

```ts
importMapPlugin({
  importMapPath: "import-map.json",
  tsconfigPath: "tsconfig.app.json",
});
```

And the plugin will produce:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

This is necessary because the TypeScript Language Service in your IDE (e.g. VSCode) does not automatically reload the `tsconfig.json` file when it is modified. To apply the changes, you must restart the TypeScript server:

- In **VSCode**, use `Ctrl+Shift+P` → **TypeScript: Restart TS Server**.
- Alternatively, restart the Vite development server to reflect changes during runtime.

---

## Server Restart Behavior

If you modify the `import-map.json` file while the dev server is running, you may need to restart Vite for changes to take full effect.

You have two options:

- **Manual restart**: The plugin will print a warning to remind you to restart the server.
- **Automatic restart**: Set `autoRestart: true` in the plugin config to have Vite restart automatically.

Note: Automatic restart uses Vite’s internal `server.restart()` API, which may change in future Vite versions. Use with care.

```ts
importMapPlugin({
  importMapPath: "import-map.json",
  tsconfigPath: "tsconfig.app.json",
  autoRestart: true, // 🚀 auto-restarts Vite when import map changes
});
```

---

## 📌 Notes

- The plugin injects the import map only in development.
- In production, paths are marked as external in the bundle, ensuring that imports are resolved correctly during runtime.

---

## 🛣 Roadmap

Planned features:

- [x] Plugin option to auto-sync with tsconfig paths
- [x] Automatic cleanup of removed aliases from tsconfig
- [ ] Support for dynamic import maps in production
- [ ] Better diagnostics for conflicting aliases

---

## 🙌 Contributors

Thanks to these awesome people for their contributions:

- [@itisArshdeep](https://github.com/itisArshdeep) – added support for preserving comments in `tsconfig.json` using `comment-json`

---

## 🧩 Dependencies

This plugin uses [`comment-json`](https://www.npmjs.com/package/comment-json) to safely read and write `tsconfig.json` files while preserving comments.

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
