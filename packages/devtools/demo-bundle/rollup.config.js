import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/esengine.iife.js',
        format: 'iife',
        name: 'ESEngine',
        sourcemap: true
    },
    plugins: [
        resolve({
            browser: true,
            preferBuiltins: false
        }),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
            declaration: false
        })
    ]
};
