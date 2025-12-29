import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts', 'src/testing/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ['ws', '@esengine/rpc', '@esengine/rpc/codec'],
    treeshake: true,
})
