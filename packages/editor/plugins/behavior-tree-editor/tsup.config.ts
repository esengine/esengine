import { defineConfig } from 'tsup';
import { editorOnlyPreset } from '../../../tools/build-config/src/presets/plugin-tsup';

export default defineConfig({
    ...editorOnlyPreset({
        external: ['@esengine/asset-system']
    }),
    tsconfig: 'tsconfig.build.json'
});
