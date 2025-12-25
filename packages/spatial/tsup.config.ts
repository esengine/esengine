import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: [
        '@esengine/ecs-framework',
        '@esengine/ecs-framework-math'
    ],
    tsconfig: 'tsconfig.build.json'
});
