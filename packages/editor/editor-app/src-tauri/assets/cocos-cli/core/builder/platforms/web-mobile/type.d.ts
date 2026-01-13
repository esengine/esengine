import { IBuildPaths } from '../../@types';
import { InternalBuildResult } from '../../@types/protected';
export type IOrientation = 'auto' | 'landscape' | 'portrait';
export interface IOptions {
    /**
     * 是否使用 WEBGPU 渲染后端
     * @experiment
     */
    useWebGPU: boolean;
    /**
     * 设备方向
     * @default 'auto'
     */
    orientation: IOrientation;
    /**
     * 是否嵌入 Web 端调试工具
     * @default false
     */
    embedWebDebugger: boolean;
}
export interface IBuildResult extends InternalBuildResult {
    paths: IPaths;
}
export interface IPaths extends IBuildPaths {
    styleCSS?: string;
    indexJs?: string;
    indexHTML?: string;
}
