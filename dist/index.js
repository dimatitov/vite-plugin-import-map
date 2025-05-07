// src/index.ts
import path from "path";
import fs from "fs";
function importMapPlugin(options) {
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
          console.error("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C import-map.json:", error);
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
            replacement: value
          }))
        }
      };
    },
    handleHotUpdate({ file, server }) {
      if (importMapPath && path.resolve(file) === path.resolve(importMapPath)) {
        server.ws.send({
          type: "full-reload"
        });
      }
    }
  };
}
export {
  importMapPlugin as default
};
