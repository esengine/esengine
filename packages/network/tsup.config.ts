import { defineConfig } from 'tsup';
import { runtimeOnlyPreset } from '../build-config/src/presets/plugin-tsup';

export default defineConfig({
    ...runtimeOnlyPreset({
        external: [/^tsrpc/, 'tsbuffer', 'tsbuffer-schema']
    }),
    tsconfig: 'tsconfig.build.json',
    // 禁用 tsup 的 DTS 捆绑器，改用 tsc 生成声明文件
    // tsup 的 DTS bundler 无法正确解析 tsrpc 的类型继承链
    // Disable tsup's DTS bundler, use tsc to generate declarations
    // tsup's DTS bundler cannot correctly resolve tsrpc's type inheritance chain
    dts: false
});
