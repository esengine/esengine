import { CCEnvConstants } from './build-time-constants';
import { SharedSettings } from '../../../../../scripting/interface';
import { IPolyFills, IBuildSystemJsOption } from '../../../../@types';
import { ImportMapWithImports, IScriptOptions, IInternalBuildOptions, IInternalBundleBuildOptions, IBundle, ImportMap, IImportMapOptions } from '../../../../@types/protected';
import { MacroItem } from '../../../../../engine/@types/config';
interface IScriptProjectOption extends SharedSettings {
    ccEnvConstants: CCEnvConstants;
    dbInfos: {
        dbID: string;
        target: string;
    }[];
    customMacroList: MacroItem[];
}
interface ImportMapOptions {
    data: ImportMapWithImports;
    format?: 'commonjs' | 'esm';
    output: string;
}
export declare class ScriptBuilder {
    _scriptOptions: IScriptOptions;
    _importMapOptions: ImportMapOptions;
    scriptPackages: string[];
    static projectOptions: IScriptProjectOption;
    initTaskOptions(options: IInternalBuildOptions | IInternalBundleBuildOptions): {
        scriptOptions: IScriptOptions;
        importMapOptions: {
            format: "esm" | "commonjs" | undefined;
            data: {
                imports: {};
            };
            output: string;
        };
    };
    initProjectOptions(options: IInternalBuildOptions | IInternalBundleBuildOptions): Promise<void>;
    buildBundleScript(bundles: IBundle[]): Promise<any>;
    static buildPolyfills(options: IPolyFills | undefined, dest: string): Promise<any>;
    static buildSystemJs(options: IBuildSystemJsOption): Promise<any>;
    static outputImportMap(importMap: ImportMap, options: IImportMapOptions): Promise<void>;
}
export {};
