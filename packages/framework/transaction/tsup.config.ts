import { defineConfig } from 'tsup'
import { runtimeOnlyPreset } from '../../tools/build-config/src/presets/plugin-tsup'

export default defineConfig({
    ...runtimeOnlyPreset({
        external: ['ioredis', 'mongodb'],
    }),
    tsconfig: 'tsconfig.build.json',
    // tsup 的 DTS bundler 无法正确解析 workspace 包的类型继承链
    // tsup's DTS bundler cannot correctly resolve workspace package type inheritance
    dts: false,
})
