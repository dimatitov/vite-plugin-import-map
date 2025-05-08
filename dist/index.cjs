"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => importMapPlugin
});
module.exports = __toCommonJS(src_exports);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);

// src/utils/updateTsConfig.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_strip_json_comments = __toESM(require("strip-json-comments"), 1);
function makeRelativePath(p) {
  const relative = import_path.default.relative(process.cwd(), p).replace(/\\/g, "/");
  return relative.endsWith("/") ? `${relative}*` : `${relative}/*`;
}
function updateTsConfig(imports, tsconfigPath) {
  const fullPath = import_path.default.resolve(process.cwd(), tsconfigPath);
  if (!import_fs.default.existsSync(fullPath)) {
    console.warn(
      `[vite-plugin-import-map] tsconfig file not found: ${fullPath}`
    );
    return;
  }
  try {
    const raw = import_fs.default.readFileSync(fullPath, "utf-8");
    const tsconfig = JSON.parse((0, import_strip_json_comments.default)(raw));
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
    import_fs.default.writeFileSync(fullPath, JSON.stringify(tsconfig, null, 2));
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
          const resolvedPath = import_path2.default.resolve(process.cwd(), importMapPath);
          const fileContents = import_fs2.default.readFileSync(resolvedPath, "utf-8");
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
            value = import_path2.default.resolve(process.cwd(), value);
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
      if (importMapPath && import_path2.default.resolve(file) === import_path2.default.resolve(process.cwd(), importMapPath)) {
        server.ws.send({
          type: "full-reload"
        });
      }
    }
  };
}
