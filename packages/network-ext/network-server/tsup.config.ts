import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/main.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['tsrpc'],
    tsconfig: 'tsconfig.build.json'
});
