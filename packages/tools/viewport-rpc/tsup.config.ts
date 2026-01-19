import { defineConfig } from 'tsup'

export default defineConfig([
    // ESM build for Node.js / bundlers
    {
        entry: {
            index: 'src/index.ts',
        },
        format: ['esm'],
        dts: true,
        clean: true,
        sourcemap: true,
    },
    // IIFE build for browser (global variable)
    {
        entry: {
            browser: 'src/index.ts',
        },
        format: ['iife'],
        globalName: 'ViewportRpc',
        outExtension: () => ({ js: '.js' }),
        dts: false,
        clean: false,
        sourcemap: true,
        minify: false,
    },
])
