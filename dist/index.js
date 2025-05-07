// src/index.ts
import path from "path";
import fs from "fs";
function importMapPlugin(options) {
  const { imports, importMapPath } = options;
  let resolvedImports = imports ?? {};
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
          console.error("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C import-map.json:", error);
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
      return {
        resolve: {
          alias: Object.entries(resolvedImports).map(([key, value]) => {
            const adjustedKey = new RegExp(`^${key}`);
            return {
              find: adjustedKey,
              replacement: value
            };
          })
        }
      };
    },
    transformIndexHtml(html) {
      const importMapJson = JSON.stringify({ imports: resolvedImports });
      const scriptTag = `<script type="importmap">${importMapJson}</script>`;
      return html.replace("</head>", `${scriptTag}</head>`);
    },
    handleHotUpdate({ file, server }) {
      if (importMapPath && path.resolve(file) === path.resolve(process.cwd(), importMapPath)) {
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
