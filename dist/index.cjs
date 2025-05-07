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
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
function importMapPlugin(options) {
  const { imports, importMapPath } = options;
  let resolvedImports = imports ?? {};
  return {
    name: "vite-plugin-import-map",
    enforce: "pre",
    config() {
      if (importMapPath) {
        try {
          const resolvedPath = import_path.default.resolve(process.cwd(), importMapPath);
          const fileContents = import_fs.default.readFileSync(resolvedPath, "utf-8");
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
            value = import_path.default.resolve(process.cwd(), value);
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
      if (importMapPath && import_path.default.resolve(file) === import_path.default.resolve(process.cwd(), importMapPath)) {
        server.ws.send({
          type: "full-reload"
        });
      }
    }
  };
}
