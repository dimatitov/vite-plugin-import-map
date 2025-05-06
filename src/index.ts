import { Plugin } from "vite";
import path from "path";

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
          const importMapModule = require(path.resolve(importMapPath));
          importMapJson = JSON.stringify(importMapModule);
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
      if (importMapPath && file === importMapPath) {
        server.ws.send({
          type: "full-reload",
        });
      }
    },
  };
}
