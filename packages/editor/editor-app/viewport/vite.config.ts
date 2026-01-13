import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Viewport',
      fileName: () => 'viewport.js',
      formats: ['es'], // ES module for browser import
    },
    // Output directly to tauri assets for the editor
    outDir: '../src-tauri/assets',
    emptyOutDir: false,
    minify: false, // Keep readable for debugging
    sourcemap: true,
    commonjsOptions: {
      include: [/effect-compiler/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // Externalize ccesengine - it's loaded separately
      external: [],
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  // Handle CommonJS modules
  optimizeDeps: {
    include: ['glsl-tokenizer', 'glsl-parser', 'js-yaml'],
  },
});
