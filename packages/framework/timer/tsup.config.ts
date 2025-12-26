import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: [
        '@esengine/ecs-framework',
        '@esengine/blueprint'
    ],
    tsconfig: 'tsconfig.build.json'
});
