import { defineConfig } from 'tsup';
import { runtimeOnlyPreset } from '../../tools/build-config/src/presets/plugin-tsup';

export default defineConfig({
    ...runtimeOnlyPreset({
        tsupConfig: {
            // Multiple entry points: main + ESEngine integration
            entry: {
                index: 'src/index.ts',
                'esengine/index': 'src/esengine/index.ts'
            }
        }
    }),
    tsconfig: 'tsconfig.build.json'
});
