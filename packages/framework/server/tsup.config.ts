import { defineConfig } from 'tsup'

export default defineConfig({
    entry: [
        'src/index.ts',
        'src/auth/index.ts',
        'src/auth/testing/index.ts',
        'src/testing/index.ts'
    ],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ['ws', 'jsonwebtoken', '@esengine/rpc', '@esengine/rpc/codec'],
    treeshake: true,
})
