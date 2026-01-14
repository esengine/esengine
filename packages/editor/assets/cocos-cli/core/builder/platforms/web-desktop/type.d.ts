import { IBuildPaths } from '../../@types';
import { InternalBuildResult } from '../../@types/protected';
export interface IOptions {
    /**
     * 是否使用 WEBGPU 渲染后端
     * @default false
     * @experiment
     */
    useWebGPU: boolean;
    /**
     * 游戏视图分辨率
     */
    resolution: {
        designHeight: number;
        designWidth: number;
    };
}
export interface IBuildResult extends InternalBuildResult {
    paths: IPaths;
}
export interface IPaths extends IBuildPaths {
    styleCSS?: string;
    indexJs?: string;
    indexHTML?: string;
}
