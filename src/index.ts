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
  /**
   * Automatically restart Vite server on import map change. Default is false.
   */
  autoRestart?: boolean;
}

export default function importMapPlugin(
  options: ImportMapPluginOptions
): Plugin {
  const { imports, importMapPath, autoRestart = false, tsconfigPath } = options;

  let resolvedImports: Record<string, string> = imports ?? {};

  return {
    name: "vite-plugin-import-map",
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
          console.error("Failed to load import-map.json:", error);
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

      console.log(
        `[vite-plugin-import-map] Updated import map with aliases:`,
        resolvedImports
      );

      if (tsconfigPath) {
        updateTsConfig(resolvedImports, tsconfigPath);
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
        try {
          const fileContents = fs.readFileSync(file, "utf-8");
          const parsedData = JSON.parse(fileContents);

          if (parsedData.imports) {
            resolvedImports = parsedData.imports;
            console.log(
              "[vite-plugin-import-map] Updated import map on the fly:",
              resolvedImports
            );
          }

          if (autoRestart) {
            console.log(
              "[vite-plugin-import-map] Restarting Vite server to apply changes..."
            );
            server.restart();
          } else {
            console.log(
              "[vite-plugin-import-map] Import map updated. Please restart Vite manually to apply changes."
            );
          }

          server.ws.send({
            type: "full-reload",
          });
        } catch (error) {
          console.error(
            "[vite-plugin-import-map] Error reading or parsing import-map.json:",
            error
          );
        }
      }
    },
  };
}
