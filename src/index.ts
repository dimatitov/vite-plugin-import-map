import { Plugin } from "vite";
import path from "path";
import fs from "fs";

import { updateTsConfig } from "./utils/updateTsConfig";

export interface ImportMapPluginOptions {
  /**
   * Directly specify import map entries. Optional, can also use importMapPath.
   */
  imports?: Record<string, string>;
  /**
   * Path to an import map JSON file. Optional, can also use imports.
   */
  importMapPath?: string;
  /**
   * Whether to update tsconfig.json with import map entries. Default is false.
   */
  tsconfigPath?: string;
}

export default function importMapPlugin(
  options: ImportMapPluginOptions
): Plugin {
  const { imports, importMapPath } = options;

  let resolvedImports: Record<string, string> = imports ?? {};

  return {
    name: "vite-plugin-module-alias",
    enforce: "pre",

    config() {
      if (importMapPath) {
        try {
          const resolvedPath = path.resolve(process.cwd(), importMapPath);
          const fileContents = fs.readFileSync(resolvedPath, "utf-8");
          const parsedData = JSON.parse(fileContents);
          if (parsedData.imports) {
            resolvedImports = parsedData.imports;
            console.log("Import aliases:", resolvedImports);
          }
        } catch (error) {
          console.error("Не удалось загрузить import-map.json:", error);
        }
      }

      resolvedImports = Object.fromEntries(
        Object.entries(resolvedImports).map(([key, value]) => {
          if (!value.startsWith("/")) {
            value = path.resolve(process.cwd(), value);
          }

          return [key, value];
        })
      );

      if (options.tsconfigPath) {
        updateTsConfig(resolvedImports, options.tsconfigPath);
      }

      return {
        resolve: {
          alias: Object.entries(resolvedImports).map(([key, value]) => {
            const adjustedKey = new RegExp(`^${key}`);
            return {
              find: adjustedKey,
              replacement: value,
            };
          }),
        },
      };
    },

    transformIndexHtml(html) {
      const importMapJson = JSON.stringify({ imports: resolvedImports });
      const scriptTag = `<script type="importmap">${importMapJson}</script>`;
      return html.replace("</head>", `${scriptTag}</head>`);
    },

    handleHotUpdate({ file, server }) {
      if (
        importMapPath &&
        path.resolve(file) === path.resolve(process.cwd(), importMapPath)
      ) {
        server.ws.send({
          type: "full-reload",
        });
      }
    },
  };
}
