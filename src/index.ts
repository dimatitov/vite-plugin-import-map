import { Plugin } from "vite";
import path from "path";
import fs from "fs";

export interface ImportMapPluginOptions {
  imports: Record<string, string>;
  importMapPath?: string;
}

export default function importMapPlugin(
  options: ImportMapPluginOptions
): Plugin {
  const { imports, importMapPath } = options;

  return {
    name: "vite-plugin-import-map",
    enforce: "pre",

    transformIndexHtml(html) {
      let importMapJson = JSON.stringify({ imports });

      if (importMapPath) {
        try {
          const resolvedPath = path.resolve(importMapPath);

          const fileContents = fs.readFileSync(resolvedPath, "utf-8");

          const parsedData = JSON.parse(fileContents);

          importMapJson = JSON.stringify(parsedData);
        } catch (error) {
          console.error("Не удалось загрузить import-map.json:", error);
        }
      }

      const scriptTag = `<script type="importmap">${importMapJson}</script>`;
      return html.replace("</head>", `${scriptTag}</head>`);
    },

    config() {
      return {
        resolve: {
          alias: Object.entries(imports).map(([key, value]) => ({
            find: key,
            replacement: value,
          })),
        },
      };
    },

    handleHotUpdate({ file, server }) {
      if (importMapPath && path.resolve(file) === path.resolve(importMapPath)) {
        server.ws.send({
          type: "full-reload",
        });
      }
    },
  };
}
