import { IBuildCommandOption, Platform } from './builder/@types/protected';
/**
 * 启动器，主要用于整合各个模块的初始化和关闭流程
 * 默认支持几种启动方式：单独导入项目、单独启动项目、单独构建项目
 */
export default class Launcher {
    private projectPath;
    private _init;
    private _import;
    constructor(projectPath: string);
    private init;
    /**
     * 导入资源
     */
    import(): Promise<void>;
    /**
     * 启动项目
     */
    startup(port?: number): Promise<void>;
    /**
     * 构建，主要是作为命令行构建的入口
     * @param platform
     * @param options
     */
    build(platform: Platform, options: Partial<IBuildCommandOption>): Promise<import("./builder/@types/protected").IBuildResultData>;
    static make(platform: Platform, dest: string): Promise<import("./builder/@types/protected").IBuildResultData>;
    static run(platform: Platform, dest: string): Promise<import("./builder/@types/protected").IBuildResultData>;
    close(): Promise<void>;
}
