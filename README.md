# `vite-plugin-import-map`

[![npm version](https://img.shields.io/npm/v/@titovdima/vite-plugin-import-map.svg)](https://www.npmjs.com/package/@titovdima/vite-plugin-import-map)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A simple and flexible Vite plugin to inject an [Import Map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) into your project. Supports both inline import maps and external `import-map.json` file. Automatically reloads the Vite dev server when the map is updated.

---

## ✨ Features

- Injects `<script type="importmap">` into HTML automatically
- Supports inline `imports` or external `import-map.json` file
- Watches and triggers full reload on import map file changes
- Resolves import aliases in dev and marks them as external in production

---

## 💎 Value Proposition

Modern frontends often rely on import aliases for better DX and cleaner project structures. TypeScript supports this via `tsconfig.json`, but these aliases are **only for type checking and editor autocomplete** — they do **not** affect how modules are actually resolved in the browser or by Vite during development and production.

This plugin closes that gap by:

- Injecting a real `<script type="importmap">` into your app's HTML
- Letting browsers resolve imports using native import maps
- Updating Vite’s `resolve.alias` so your dev environment aligns with your runtime
- Watching external `import-map.json` for changes and reloading automatically

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

## 📦 Installation

```bash
npm install @titovdima/vite-plugin-import-map --save-dev
```

or

```bash
yarn add @titovdima/vite-plugin-import-map --dev
```

---

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

Then use the plugin like this:

```ts
import { defineConfig } from "vite";
import importMapPlugin from "@titovdima/vite-plugin-import-map";

export default defineConfig({
  plugins: [
    importMapPlugin({
      file: "import-map.json",
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

| Option    | Type                     | Description                                        |
| --------- | ------------------------ | -------------------------------------------------- |
| `imports` | `Record<string, string>` | (optional) Inline import map                       |
| `file`    | `string`                 | (optional) Path to external `import-map.json` file |

> You must choose **either** `imports` **or** `file` — using both at the same time is not supported and will throw an error. This design prevents ambiguity and ensures the import map is sourced from only one location.

---

## 📌 Notes

- The plugin injects the import map only in development.
- In production, paths are marked as external in the bundle.

---

## 🛣 Roadmap

Planned features:

- [ ] Support for dynamic import maps in production
- [ ] Plugin option to auto-sync with tsconfig paths
- [ ] Better diagnostics for conflicting aliases

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
