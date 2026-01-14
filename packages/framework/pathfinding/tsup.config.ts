import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        'index': 'src/index.ts',
        'ecs': 'src/ecs/index.ts',
        'nodes': 'src/nodes/index.ts'
    },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    tsconfig: 'tsconfig.build.json'
});
