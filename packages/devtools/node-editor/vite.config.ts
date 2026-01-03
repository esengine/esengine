import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';

/**
 * Custom plugin: Handle CSS for node editor
 * 自定义插件：处理节点编辑器的 CSS
 *
 * This plugin does two things:
 * 1. Auto-injects CSS into document.head for normal usage
 * 2. Replaces placeholder in cssText.ts with actual CSS for Shadow DOM usage
 */
function injectCSSPlugin(): any {
    return {
        name: 'inject-css-plugin',
        enforce: 'post' as const,
        generateBundle(_options: any, bundle: any) {
            const bundleKeys = Object.keys(bundle);

            // Find all CSS files (找到所有 CSS 文件)
            const cssFiles = bundleKeys.filter(key => key.endsWith('.css'));

            for (const cssFile of cssFiles) {
                const cssChunk = bundle[cssFile];
                if (!cssChunk || !cssChunk.source) continue;

                const cssContent = cssChunk.source as string;
                const styleId = 'esengine-node-editor-styles';

                // Generate style injection code (生成样式注入代码)
                const injectCode = `(function(){if(typeof document!=='undefined'){var s=document.createElement('style');s.id='${styleId}';if(!document.getElementById(s.id)){s.textContent=${JSON.stringify(cssContent)};document.head.appendChild(s);}}})();`;

                // Process all JS bundles (处理所有 JS 包)
                for (const jsKey of bundleKeys) {
                    if (!jsKey.endsWith('.js') && !jsKey.endsWith('.cjs')) continue;
                    const jsChunk = bundle[jsKey];
                    if (!jsChunk || jsChunk.type !== 'chunk' || !jsChunk.code) continue;

                    // Replace CSS placeholder with actual CSS content
                    // 将 CSS 占位符替换为实际的 CSS 内容
                    // Match both single and double quotes (ESM uses single, CJS uses double)
                    jsChunk.code = jsChunk.code.replace(
                        /['"]__NODE_EDITOR_CSS_PLACEHOLDER__['"]/g,
                        JSON.stringify(cssContent)
                    );

                    // Auto-inject CSS for index bundles (为 index 包自动注入 CSS)
                    if (jsKey === 'index.js' || jsKey === 'index.cjs') {
                        jsChunk.code = injectCode + '\n' + jsChunk.code;
                    }
                }

                // Remove standalone CSS file (删除独立的 CSS 文件)
                delete bundle[cssFile];
            }
        }
    };
}

export default defineConfig({
    plugins: [
        react(),
        dts({
            include: ['src'],
            outDir: 'dist',
            rollupTypes: false
        }),
        injectCSSPlugin()
    ],
    esbuild: {
        jsx: 'automatic',
    },
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts')
            },
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => {
                if (format === 'cjs') return `${entryName}.cjs`;
                return `${entryName}.js`;
            }
        },
        rollupOptions: {
            external: [
                'react',
                'react/jsx-runtime',
                'zustand',
                /^@esengine\//
            ],
            output: {
                exports: 'named',
                preserveModules: false
            }
        },
        target: 'es2020',
        minify: false,
        sourcemap: true
    }
});
