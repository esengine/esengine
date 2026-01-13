import { IInternalBuildOptions, InternalBuildResult } from '../../@types/protected';
import { CocosParams } from '../native-common/pack-tool/base/default';
import { ICustomBuildScriptParam, IOptions as INativeOption } from '../native-common/type';
export type IOptions = INativeOption & {
    executableName: string;
    renderBackEnd: {
        vulkan: boolean;
        gles3: boolean;
        gles2: boolean;
    };
    targetPlatform: 'win32' | 'x64';
    serverMode: boolean;
    vsData: string;
    vsVersion?: string;
};
export interface ITaskOptionPackages {
    windows: IOptions;
}
export interface IWindowsInternalBuildOptions extends IInternalBuildOptions {
    windows: IOptions;
    buildScriptParam: ICustomBuildScriptParam;
    cocosParams: CocosParams<any>;
    platform: 'windows';
}
export interface IBuildResult extends InternalBuildResult {
    userFrameWorks: boolean;
}
