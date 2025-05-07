import { Plugin } from 'vite';

interface ImportMapPluginOptions {
    imports: Record<string, string>;
    importMapPath?: string;
}
declare function importMapPlugin(options: ImportMapPluginOptions): Plugin;

export { ImportMapPluginOptions, importMapPlugin as default };
