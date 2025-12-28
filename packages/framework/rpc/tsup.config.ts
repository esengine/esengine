import { defineConfig } from 'tsup'

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        'server/index': 'src/server/index.ts',
        'client/index': 'src/client/index.ts',
        'codec/index': 'src/codec/index.ts',
    },
    format: ['esm'],
    dts: false,
    clean: true,
    sourcemap: true,
    external: ['ws', 'msgpackr'],
})
