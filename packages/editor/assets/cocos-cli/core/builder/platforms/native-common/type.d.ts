import { IBuildScriptParam, IInternalBuildOptions, InternalBuildResult } from '../../@types/protected';
import { CocosParams, InternalNativePlatform } from './pack-tool/base/default';
export interface ICMakeConfig {
    USE_AUDIO?: boolean;
    USE_VIDEO?: boolean;
    USE_WEBVIEW?: boolean;
    USE_JOB_SYSTEM_TBB?: boolean;
    USE_JOB_SYSTEM_TASKFLOW?: boolean;
    USE_PORTRAIT?: boolean;
    CC_USE_METAL?: boolean;
    CC_USE_VUKAN?: boolean;
    CC_USE_GLES3: boolean;
    CC_USE_GLES2: boolean;
    COCOS_X_PATH?: string;
    APP_NAME?: string;
    XXTEAKEY: string;
    [propName: string]: any;
    USE_SERVER_MODE: string;
}
declare enum NetMode {
    client = 0,
    hostServer = 1,
    listenServer = 2
}
export interface ICustomBuildScriptParam extends IBuildScriptParam {
    experimentalHotReload: boolean;
}
export interface IOptions {
    template: string;
    engine?: string;
    runAfterMake: boolean;
    encrypted: boolean;
    compressZip: boolean;
    xxteaKey?: string;
    params?: CocosParams<Object>;
    JobSystem: 'none' | 'tbb' | 'taskFlow';
    serverMode: boolean;
    netMode: NetMode;
    hotModuleReload: boolean;
    projectDistPath: string;
    cocosParams: CocosParams<any>;
    buildScriptParam: ICustomBuildScriptParam;
}
export interface ITaskOption extends IInternalBuildOptions {
    platform: InternalNativePlatform;
    packages: any;
    buildScriptParam: ICustomBuildScriptParam;
    cocosParams: CocosParams<Object>;
}
export interface IBuildCache extends InternalBuildResult {
    userFrameWorks: boolean;
}
export {};
