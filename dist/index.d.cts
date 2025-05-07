import { Plugin } from 'vite';

interface ImportMapPluginOptions {
    /**
     * Directly specify import map entries. Optional, can also use importMapPath.
     */
    imports?: Record<string, string>;
    /**
     * Path to an import map JSON file. Optional, can also use imports.
     */
    importMapPath?: string;
}
declare function importMapPlugin(options: ImportMapPluginOptions): Plugin;

export { ImportMapPluginOptions, importMapPlugin as default };
