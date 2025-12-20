import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    external: [
        'react',
        'react-dom',
        '@esengine/ecs-framework',
        '@esengine/editor-core',
        '@esengine/asset-system',
        '@esengine/fairygui',
        'lucide-react'
    ],
    esbuildOptions(options) {
        options.jsx = 'automatic';
    }
});
