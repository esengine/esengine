import { defineConfig } from 'tsup';

export default defineConfig({
    entry: [
        'src/index.ts',
        'src/auth/index.ts',
        'src/auth/testing/index.ts',
        'src/ratelimit/index.ts',
        'src/testing/index.ts',
        'src/ecs/index.ts',
    ],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ['ws', 'jsonwebtoken', '@esengine/rpc', '@esengine/rpc/codec', '@esengine/ecs-framework'],
    treeshake: true,
});
