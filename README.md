# `vite-plugin-import-map`

[![npm version](https://img.shields.io/npm/v/vite-plugin-import-map.svg)](https://www.npmjs.com/package/vite-plugin-import-map)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A simple and flexible Vite plugin to inject an [Import Map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) into your project. Supports both inline import maps and external `import-map.json` file. Automatically reloads the Vite dev server when the map is updated.

---

## ✨ Features

- Injects `<script type="importmap">` into HTML automatically
- Supports inline `imports` or external `import-map.json` file
- Watches and triggers full reload on import map file changes
- Resolves import aliases in dev and marks them as external in production

---

## 📦 Installation

```bash
npm install vite-plugin-import-map --save-dev
```

or

```bash
yarn add vite-plugin-import-map --dev
```

---

## 🚀 Usage

You can configure the plugin in one of two ways — either by providing an inline `imports` object directly in your `vite.config.ts`, or by specifying a path to an external `import-map.json` file. **Do not use both at once.**

### Option 1: Inline Import Map (via `vite.config.ts`)

```ts
import { defineConfig } from "vite";
import importMapPlugin from "vite-plugin-import-map";

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
import importMapPlugin from "vite-plugin-import-map";

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

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
