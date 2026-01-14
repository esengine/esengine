import { BuilderAssetCache } from './manager/asset';
import { InternalBuildResult } from './manager/build-result';
import { BuildResult } from './manager/build-result';
import { TaskManager } from './task-config';
import { BundleManager } from './asset-handler/bundle';
import { BuildTaskBase } from './manager/task-base';
import { BuildTemplate } from './manager/build-template';
import { ITaskResultMap } from '../../@types/builder';
import { IBuilder, IInternalBuildOptions, IBuildHooksInfo, IBuildTask, IPluginHookName, IBuildOptionBase, IBuildUtils } from '../../@types/protected';
export declare class BuildTask extends BuildTaskBase implements IBuilder {
    cache: BuilderAssetCache;
    result: InternalBuildResult;
    buildTemplate: BuildTemplate;
    buildResult?: BuildResult;
    options: IInternalBuildOptions;
    hooksInfo: IBuildHooksInfo;
    taskManager: TaskManager;
    private mainTaskWeight;
    static isCommandBuild: boolean;
    private currentStageTask?;
    bundleManager: BundleManager;
    hookMap: Record<IPluginHookName, IPluginHookName>;
    pipeline: (string | Function | IBuildTask[])[];
    /**
     * 构建任务的结果缓存，只允许接口访问
     */
    private taskResMap;
    static utils: IBuildUtils;
    get utils(): IBuildUtils;
    constructor(id: string, options: IBuildOptionBase);
    get stage(): string;
    /**
     * 获取某个任务结果
     * @param name
     */
    getTaskResult(name: keyof ITaskResultMap): {
        projectJs: string;
        systemJs: string;
        polyfillsJs: string | null;
    } | import("../../@types/builder").IBuildPacResult | undefined;
    /**
     * 开始整理构建需要的参数
     */
    init(): Promise<void>;
    /**
     * 执行具体的构建任务
     */
    run(): Promise<boolean>;
    /**
     * 仅构建 Bundle 流程
     */
    buildBundleOnly(): Promise<void>;
    private postBuild;
    private handleBuildStageTask;
    private initBundleManager;
    break(reason: string): void;
    lockAssetDB(): Promise<void>;
    unLockAssetDB(): void;
    /**
     * 获取预览 settings 信息
     */
    getPreviewSettings(): Promise<import("../../@types/protected").ISettings>;
    private initOptions;
    /**
     * 执行某个任务列表
     * @param buildTasks 任务列表数组
     * @param weight 全部任务列表所占权重
     * @param args 需要传递给任务的其他参数
     */
    private runBuildTask;
    handleHook(func: Function, internal: boolean, ...args: any[]): Promise<void>;
    onError(error: Error, throwError?: boolean): void;
    runErrorHook(): Promise<void>;
}
