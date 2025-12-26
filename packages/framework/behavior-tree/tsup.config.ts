import { defineConfig } from 'tsup';
import { runtimeOnlyPreset } from '../../tools/build-config/src/presets/plugin-tsup';

export default defineConfig({
    ...runtimeOnlyPreset({
        tsupConfig: {
            entry: {
                index: 'src/index.ts'
            }
        }
    }),
    tsconfig: 'tsconfig.build.json'
});
