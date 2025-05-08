// src/index.ts
import path2 from "path";
import fs2 from "fs";

// src/utils/updateTsConfig.ts
import fs from "fs";
import path from "path";
import stripJsonComments from "strip-json-comments";
function makeRelativePath(p) {
  const relative = path.relative(process.cwd(), p).replace(/\\/g, "/");
  return relative.endsWith("/") ? `${relative}*` : `${relative}/*`;
}
function updateTsConfig(imports, tsconfigPath) {
  const fullPath = path.resolve(process.cwd(), tsconfigPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(
      `[vite-plugin-import-map] tsconfig file not found: ${fullPath}`
    );
    return;
  }
  try {
    const raw = fs.readFileSync(fullPath, "utf-8");
    const tsconfig = JSON.parse(stripJsonComments(raw));
    tsconfig.compilerOptions = tsconfig.compilerOptions || {};
    tsconfig.compilerOptions.paths = tsconfig.compilerOptions.paths || {};
    if (!tsconfig.compilerOptions.baseUrl) {
      tsconfig.compilerOptions.baseUrl = ".";
      console.log(
        `[vite-plugin-import-map] Setting baseUrl to "." in ${tsconfigPath}`
      );
    }
    const newKeys = Object.keys(imports).map(
      (k) => (k.endsWith("/") ? k : `${k}/`) + "*"
    );
    const paths = tsconfig.compilerOptions.paths;
    Object.keys(paths).forEach((existingKey) => {
      const isGenerated = existingKey.endsWith("/*") && existingKey.includes("/");
      const isObsolete = !newKeys.includes(existingKey);
      if (isGenerated && isObsolete) {
        delete paths[existingKey];
      }
    });
    Object.entries(imports).forEach(([key, value]) => {
      const aliasKey = key.endsWith("/") ? `${key}*` : `${key}/*`;
      const normalizedPath = makeRelativePath(value);
      paths[aliasKey] = [normalizedPath];
    });
    fs.writeFileSync(fullPath, JSON.stringify(tsconfig, null, 2));
    console.log(
      `[vite-plugin-import-map] Updated ${tsconfigPath} with import aliases`
    );
    console.log(
      `[vite-plugin-import-map] To apply updated TypeScript paths, restart the TypeScript server in your editor.`
    );
  } catch (err) {
    console.error(
      `[vite-plugin-import-map] Failed to update ${tsconfigPath}:`,
      err
    );
  }
}

// src/index.ts
function importMapPlugin(options) {
  const { imports, importMapPath } = options;
  let resolvedImports = imports ?? {};
  return {
    name: "vite-plugin-import-map",
    enforce: "pre",
    config() {
      if (importMapPath) {
        try {
          const resolvedPath = path2.resolve(process.cwd(), importMapPath);
          const fileContents = fs2.readFileSync(resolvedPath, "utf-8");
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
            value = path2.resolve(process.cwd(), value);
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
      if (importMapPath && path2.resolve(file) === path2.resolve(process.cwd(), importMapPath)) {
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
