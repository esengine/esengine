import { defineConfig } from 'tsup';
import { editorOnlyPreset } from '../../../tools/build-config/src/presets/plugin-tsup';

export default defineConfig({
    ...editorOnlyPreset({}),
    tsconfig: 'tsconfig.build.json',
    noExternal: ['@esengine/asset-system']
});
