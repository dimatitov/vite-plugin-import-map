import fs from "fs";
import path from "path";
import * as commentJson from "comment-json";

function makeRelativePath(p: string): string {
  if (p.startsWith("/src")) {
    const trimmed = p.replace(/^\/+/, "");
    const normalized = trimmed.replace(/\\/g, "/");
    return normalized.endsWith("/") ? `${normalized}*` : `${normalized}/*`;
  }
  const relative = path.relative(process.cwd(), p).replace(/\\/g, "/");
  return relative.endsWith("/") ? `${relative}*` : `${relative}/*`;
}

export function updateTsConfig(
  imports: Record<string, string>,
  tsconfigPath: string
) {
  const fullPath = path.resolve(process.cwd(), tsconfigPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(
      `[vite-plugin-import-map] tsconfig file not found: ${fullPath}`
    );
    return;
  }

  try {
    const raw = fs.readFileSync(fullPath, "utf-8");
    const tsconfig = commentJson.parse(raw);

    tsconfig.compilerOptions = tsconfig.compilerOptions || {};
    tsconfig.compilerOptions.paths = tsconfig.compilerOptions.paths || {};

    // Ensure baseUrl is set to "." if it's not already configured
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
      const isGenerated =
        existingKey.endsWith("/*") && existingKey.includes("/");
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

    // THIS IS THE IMPORTANT CHANGE - use commentJson.stringify instead of JSON.stringify
    fs.writeFileSync(fullPath, commentJson.stringify(tsconfig, null, 2));
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