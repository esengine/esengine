import type { EngineApi } from '../api/engine/engine';
import type { ProjectApi } from '../api/project/project';
import type { AssetsApi } from '../api/assets/assets';
import type { BuilderApi } from '../api/builder/builder';
import type { ConfigurationApi } from '../api/configuration/configuration';
import type { SceneApi } from '../api/scene/scene';
import type { SystemApi } from '../api/system/system';
import type { ScriptingApi } from '../api/scripting/scripting';
import { TProjectPath, TPort, TProjectType } from './schema';
import { TPlatform, TBuildOption, TPlatformCanMake, TBuildDest } from './builder/schema';
export declare class CocosAPI {
    scene: SceneApi;
    engine: EngineApi;
    project: ProjectApi;
    assets: AssetsApi;
    builder: BuilderApi;
    configuration: ConfigurationApi;
    system: SystemApi;
    scripting: ScriptingApi;
    static create(): Promise<CocosAPI>;
    private constructor();
    /**
     * 初始化 API 实例，主要是为了实现按需加载
     */
    private _init;
    /**
     * 启动 MCP 服务器
     * @param projectPath
     * @param port
     */
    startupMcpServer(projectPath: TProjectPath, port?: TPort): void;
    /**
     * 启动工程
     */
    startup(projectPath: TProjectPath, port?: TPort): Promise<void>;
    /**
     * 命令行创建入口
     * 创建一个项目
     * @param projectPath
     * @param type
     */
    static createProject(projectPath: TProjectPath, type: TProjectType): Promise<boolean>;
    /**
     * 命令行构建入口
     * @param platform
     * @param options
     */
    static buildProject(projectPath: string, platform: TPlatform, options: TBuildOption): Promise<import("../core/builder/@types/protected").IBuildResultData>;
    /**
     * 命令行打包入口
     * @param platform
     * @param dest
     */
    static makeProject(platform: TPlatformCanMake, dest: TBuildDest): Promise<import("../core/builder/@types/protected").IBuildResultData>;
    /**
     * 命令行运行入口
     * @param platform
     * @param dest
     */
    static runProject(platform: TPlatform, dest: TBuildDest): Promise<import("../core/builder/@types/protected").IBuildResultData>;
}
