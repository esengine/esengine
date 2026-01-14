import * as rollup from 'rollup';
import { CCEnvConstants } from './build-time-constants';
import { IBuildSystemJsOption, IPolyFills } from '../../../../@types';
import { IAssetInfo, ModulePreservation, ITransformTarget } from '../../../../@types/protected';
import { SharedSettings } from '../../../../../scripting/interface';
import { MacroItem } from '../../../../../engine/@types/config';
import { DBInfo } from '../../../../../scripting/@types/config-export';
interface buildRes {
    scriptPackages: string[];
    importMappings: Record<string, string>;
}
interface Bundle {
    id: string | null;
    scripts: IAssetInfo[];
    outFile: string;
}
/**
 * 编译项目脚本，执行环境为标准 node 环境，请不要使用 Editor 或者 Electron 接口，所以需要使用的字段都需要在外部整理好传入
 * @param options 编译引擎参数
 * @returns
 */
export declare function buildScriptCommand(options: IBuildScriptFunctionOption & SharedSettings): Promise<buildRes>;
export interface IBuildScriptFunctionOption {
    /**
     * Are we in debug mode?
     */
    debug: boolean;
    /**
     * Whether to generate source maps or not.
     */
    sourceMaps: boolean | 'inline';
    /**
     * Module format.
     */
    moduleFormat: rollup.ModuleFormat;
    /**
     * Module preservation.
     */
    modulePreservation: ModulePreservation;
    /**
     * !!Experimental.
     */
    transform: TransformOptions;
    /**
     * All sub-packages.
     */
    bundles: Array<Bundle>;
    /**
     * Root output directory.
     */
    commonDir: string;
    hotModuleReload: boolean;
    applicationJS: string;
    dbInfos: DBInfo[];
    uuidCompressMap: Record<string, string>;
    customMacroList: MacroItem[];
    ccEnvConstants: CCEnvConstants;
    /**
     * This option will bundle external chunk into each bundle's chunk in order to achieve the purpose of cross-project reuse of the bundle.
     * This will increase the size of the bundle and introduce the issue of chunk doppelganger, so use it with caution.
     * @default false
     */
    bundleCommonChunk?: boolean;
    cceModuleMap: Record<string, any>;
}
export declare function buildSystemJsCommand(options: IBuildSystemJsOption): Promise<void>;
export declare function buildPolyfillsCommand(options: IPolyFills | undefined, dest: string): Promise<boolean>;
export interface TransformOptions {
    /**
     * Babel plugins to excluded. Will be passed to as partial `exclude` options of `@babel/preset-env`.
     */
    excludes?: Array<string | RegExp>;
    /**
     * Babel plugins to included. Will be passed to as partial `include` options of `@babel/preset-env`.
     */
    includes?: Array<string | RegExp>;
    targets?: ITransformTarget;
}
export {};
