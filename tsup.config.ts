import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ["src/base/index.ts"],
    clean: true,
    dts: true,
    outDir: "dist",
    format: ['cjs', 'esm'],
    minify: true
});
