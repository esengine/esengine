import { EngineInfo } from './@types/public';
import { IEngineConfig, IInitEngineInfo } from './@types/config';
import { IModuleConfig } from './@types/modules';
/**
 * 整合 engine 的一些编译、配置读取等功能
 */
export interface IEngine {
    getInfo(): EngineInfo;
    getConfig(): IEngineConfig;
    init(enginePath: string): Promise<this>;
    initEngine(info: IInitEngineInfo): Promise<this>;
}
declare class EngineManager implements IEngine {
    private _init;
    private _info;
    private _config;
    private _configInstance;
    private get defaultConfig();
    /**
     * TODO init data in register project modules
     */
    private moduleConfigCache;
    get type(): "3d" | "2d";
    getInfo(): EngineInfo;
    getConfig(useDefault?: boolean): IEngineConfig;
    /**
     * TODO 初始化配置等
     */
    init(enginePath: string): Promise<this>;
    updateConfig(): Promise<this | undefined>;
    importEditorExtensions(): Promise<void>;
    initEditorExtensions(): Promise<void>;
    /**
     * 加载以及初始化引擎环境
     * @param info 初始化引擎数据
     * @param onBeforeGameInit - 在初始化之前需要做的工作
     * @param onAfterGameInit - 在初始化之后需要做的工作
     */
    initEngine(info: IInitEngineInfo, onBeforeGameInit?: () => Promise<void>, onAfterGameInit?: () => Promise<void>): Promise<this>;
    queryInternalAssetList(enginePath: string): Promise<string[]>;
    /**
     * TODO
     * @returns
     */
    queryModuleConfig(): IModuleConfig;
}
declare const Engine: EngineManager;
export { Engine };
/**
 * 初始化 engine
 * @param enginePath
 * @param projectPath
 * @param serverURL
 */
export declare function initEngine(enginePath: string, projectPath: string, serverURL?: string): Promise<void>;
