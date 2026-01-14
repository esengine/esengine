'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildTask = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const asset_1 = require("./manager/asset");
const build_result_1 = require("./manager/build-result");
const build_result_2 = require("./manager/build-result");
const task_config_1 = require("./task-config");
const stage_task_manager_1 = require("./stage-task-manager");
const sub_process_manager_1 = require("../worker-pools/sub-process-manager");
const bundle_1 = require("./asset-handler/bundle");
const cc_1 = require("cc");
const task_base_1 = require("./manager/task-base");
const utils_1 = require("../../share/utils");
const build_template_1 = require("./manager/build-template");
const console_1 = require("../../../base/console");
const assets_1 = require("../../../assets");
const utils_2 = __importDefault(require("../../../base/utils"));
const plugin_1 = require("../../manager/plugin");
const i18n_1 = __importDefault(require("../../../base/i18n"));
const common_options_validator_1 = require("../../share/common-options-validator");
const buildUtils = __importStar(require("./utils"));
const utils_3 = __importDefault(require("../../../base/utils"));
class BuildTask extends task_base_1.BuildTaskBase {
    cache;
    result;
    buildTemplate;
    // 对外部插件提供的构建结果
    buildResult;
    options;
    hooksInfo;
    taskManager;
    // 构建主流程任务权重，随着其他阶段性任务的加入可能会有变化
    mainTaskWeight = 1;
    // 是否为命令行构建
    static isCommandBuild = false;
    currentStageTask;
    bundleManager;
    hookMap = {
        onBeforeBuild: 'onBeforeBuild',
        onBeforeInit: 'onBeforeInit',
        onAfterInit: 'onAfterInit',
        onBeforeBuildAssets: 'onBeforeBuildAssets',
        onAfterBuildAssets: 'onAfterBuildAssets',
        onBeforeCompressSettings: 'onBeforeCompressSettings',
        onAfterCompressSettings: 'onAfterCompressSettings',
        onAfterBuild: 'onAfterBuild',
        onBeforeCopyBuildTemplate: 'onBeforeCopyBuildTemplate',
        onAfterCopyBuildTemplate: 'onAfterCopyBuildTemplate',
        onError: 'onError',
    };
    // 执行整个构建流程的顺序流程
    pipeline = [];
    /**
     * 构建任务的结果缓存，只允许接口访问
     */
    taskResMap = {};
    static utils = {
        isInstallNodeJs: buildUtils.isInstallNodeJs,
        relativeUrl: buildUtils.relativeUrl,
        transformCode: buildUtils.transformCode,
        resolveToRaw: utils_3.default.Path.resolveToRaw,
    };
    get utils() {
        return BuildTask.utils;
    }
    constructor(id, options) {
        super(id, 'build');
        this.taskManager = new task_config_1.TaskManager();
        this.taskManager.activeTask('dataTasks');
        this.taskManager.activeTask('settingTasks');
        this.taskManager.activeTask('buildTasks');
        this.taskManager.activeTask('md5Tasks');
        this.taskManager.activeTask('postprocessTasks');
        this.hooksInfo = plugin_1.pluginManager.getHooksInfo(options.platform);
        // TODO 补全 options 为 IInternalBuildOptions
        this.options = options;
        this.cache = new asset_1.BuilderAssetCache(this);
        this.result = new build_result_1.InternalBuildResult(this, !!options.preview);
        if (options.preview || options.buildMode === 'bundle') {
            return;
        }
        this.result.addListener('updateProcess', (message) => {
            this.updateProcess(message);
        });
        this.taskManager.activeTask('buildTasks');
        this.options.md5Cache && (this.taskManager.activeTask('md5Tasks'));
        this.taskManager.activeTask('postprocessTasks');
        this.buildResult = new build_result_2.BuildResult(this);
        if (this.options.nextStages) {
            // 当存在阶段性任务时，构建主流程的权重降级
            this.mainTaskWeight = 1 / (this.options.nextStages.length + 1);
        }
        this.hookWeight = this.mainTaskWeight * this.taskManager.taskWeight;
        this.buildTemplate = new build_template_1.BuildTemplate(this.options.platform, this.options.taskName, plugin_1.pluginManager.getBuildTemplateConfig(this.options.platform));
        // TODO
        // this.pipeline = [
        //     this.hookMap.onBeforeBuild,
        //     this.lockAssetDB,
        //     this.hookMap.onBeforeInit,
        //     this.init,
        //     this.hookMap.onAfterInit,
        //     this.initBundleManager,
        //     this.dataTasks,
        //     this.buildTasks,
        //     this.hookMap.onAfterBuildAssets,
        //     this.md5Tasks,
        //     this.settingTasks,
        //     this.hookMap.onBeforeCompressSettings,
        //     this.postprocessTasks,
        //     this.hookMap.onAfterCompressSettings,
        //     this.hookMap.onAfterBuild,
        // ];
    }
    get stage() {
        if (!this.currentStageTask) {
            return 'build';
        }
        return this.currentStageTask.name;
    }
    /**
     * 获取某个任务结果
     * @param name
     */
    getTaskResult(name) {
        return this.taskResMap[name];
    }
    /**
     * 开始整理构建需要的参数
     */
    async init() {
        // TODO 所有类似的新流程，都应该走统一的 runBuildTask 处理，否则可能无法中断
        if (this.error) {
            return;
        }
        console.debug('Query all assets info in project');
        await this.initOptions();
        // 清空所有资源缓存
        cc.assetManager.releaseAll();
        await this.cache.init();
    }
    /**
     * 执行具体的构建任务
     */
    async run() {
        const { dir } = this.result.paths;
        if (!dir) {
            console.error('No output path can be built.');
            return false;
        }
        if (this.options.buildMode === 'bundle') {
            await this.buildBundleOnly();
            return true;
        }
        await (0, fs_extra_1.ensureDir)(this.result.paths.dir);
        // 允许插件在 onBeforeBuild 内修改 useCache
        await this.runPluginTask(task_config_1.TaskManager.pluginTasks.onBeforeBuild);
        if (!this.options.useCache) {
            // 固定清理工程的时机，请勿改动以免造成不必要的插件兼容问题
            (0, fs_extra_1.emptyDirSync)(this.result.paths.dir);
        }
        await this.lockAssetDB();
        await this.runPluginTask(task_config_1.TaskManager.pluginTasks.onBeforeInit);
        await this.init();
        await this.runPluginTask(task_config_1.TaskManager.pluginTasks.onAfterInit);
        await this.initBundleManager();
        await this.bundleManager.runPluginTask(this.bundleManager.hookMap.onBeforeBundleDataTask);
        // 开始执行预制任务
        await this.runBuildTask(task_config_1.TaskManager.getBuildTask('dataTasks'), this.taskManager.taskWeight);
        await this.bundleManager.runPluginTask(this.bundleManager.hookMap.onAfterBundleDataTask);
        await this.runPluginTask(task_config_1.TaskManager.pluginTasks.onBeforeBuildAssets);
        await this.bundleManager.runPluginTask(this.bundleManager.hookMap.onBeforeBundleBuildTask);
        // 开始执行构建任务
        await this.runBuildTask(task_config_1.TaskManager.getBuildTask('buildTasks'), this.taskManager.taskWeight);
        await this.bundleManager.runPluginTask(this.bundleManager.hookMap.onAfterBundleBuildTask);
        await this.runPluginTask(task_config_1.TaskManager.pluginTasks.onAfterBuildAssets);
        await this.runBuildTask(task_config_1.TaskManager.getBuildTask('settingTasks'), this.taskManager.taskWeight);
        await this.runPluginTask(task_config_1.TaskManager.pluginTasks.onBeforeCompressSettings);
        await this.runBuildTask(task_config_1.TaskManager.getBuildTask('postprocessTasks'), this.taskManager.taskWeight);
        await this.runPluginTask(task_config_1.TaskManager.pluginTasks.onAfterCompressSettings);
        await this.runPluginTask(task_config_1.TaskManager.pluginTasks.onBeforeCopyBuildTemplate);
        // 拷贝自定义模板
        await this.buildTemplate.copyTo(this.result.paths.output);
        await this.runPluginTask(task_config_1.TaskManager.pluginTasks.onAfterCopyBuildTemplate);
        // MD5 处理
        this.options.md5Cache && (await this.runBuildTask(task_config_1.TaskManager.getBuildTask('md5Tasks'), this.taskManager.taskWeight));
        // 构建进程结束之前
        await this.runPluginTask(task_config_1.TaskManager.pluginTasks.onAfterBuild);
        await this.postBuild();
        this.options.nextStages && (await this.handleBuildStageTask(this.options.nextStages));
        return true;
    }
    /**
     * 仅构建 Bundle 流程
     */
    async buildBundleOnly() {
        const settingTasks = this.taskManager.activeCustomTask('settingTasks', [
            'setting-task/cache',
            'setting-task/asset',
            'setting-task/script',
        ]);
        await this.lockAssetDB();
        // 走构建任务的仅 Bundle 构建模式也需要执行 init 前后钩子，因为此时需要保障包完整
        // 不执行一些选项的修改可能没有同步到
        await this.runPluginTask(task_config_1.TaskManager.pluginTasks.onBeforeInit);
        await this.init();
        await this.runPluginTask(task_config_1.TaskManager.pluginTasks.onAfterInit);
        this.bundleManager = await bundle_1.BundleManager.create(this.options, this);
        this.bundleManager.options.dest = this.result.paths.assets;
        this.bundleManager.destDir = this.result.paths.assets;
        this.bundleManager.updateProcess = (message, progress) => {
            this.updateProcess(message, progress - this.bundleManager.progress);
        };
        await this.bundleManager.run();
        await this.runBuildTask(settingTasks, this.taskManager.taskWeight);
        const bundles = this.bundleManager.bundles.filter((bundle) => bundle.output).sort((a, b) => a.name.localeCompare(b.name));
        if (this.options.md5Cache) {
            for (const bundle of bundles) {
                this.result.settings.assets.bundleVers[bundle.name] = bundle.version;
            }
        }
        // 生成 settings.json
        const content = JSON.stringify(this.result.settings, null, this.options.debug ? 4 : 0);
        (0, fs_extra_1.outputFileSync)(this.result.paths.settings, content, 'utf8');
        await this.unLockAssetDB();
    }
    async postBuild() {
        this.unLockAssetDB();
        if (this.options.generateCompileConfig) {
            // 保存当前的 options 到实际包内，作为后续编译参数也为将来制作仅构建引擎等等处理做备份
            (0, fs_extra_1.outputJSONSync)(this.result.paths.compileConfig, this.result.compileOptions || this.options);
        }
        // 统计流程放在最后，避免出错时干扰其他流程
        // 追踪构建时长，统计构建错误，发送统计消息
        const totalTime = await console_1.newConsole.trackTimeEnd('builder:build-project-total', { output: true });
        console.debug(`build task(${this.options.taskName}) in ${totalTime}!`);
    }
    async handleBuildStageTask(stages) {
        const stageWeight = 1 - this.mainTaskWeight;
        for (const taskName of stages) {
            const stageConfig = plugin_1.pluginManager.getBuildStageWithHookTasks(this.options.platform, taskName);
            if (!stageConfig) {
                this.updateProcess(`No stage task: ${taskName} in platform ${this.options.platform}, please check your build options`, stageWeight);
                continue;
            }
            // HACK 目前原生平台钩子函数修改了 result.paths.dir 因而构建路径需要自行重新拼接
            const root = (0, utils_1.getBuildPath)(this.options);
            const buildStageTask = new stage_task_manager_1.BuildStageTask(this.id, {
                ...stageConfig,
                hooksInfo: this.hooksInfo,
                root,
                buildTaskOptions: this.options,
            });
            this.currentStageTask = buildStageTask;
            buildStageTask.on('update', (message, increment) => {
                this.updateProcess(message, increment * stageWeight);
            });
            await buildStageTask.run();
            if (this.error) {
                await this.onError(this.error);
                return;
            }
            else if (buildStageTask.error) {
                this.error = buildStageTask.error;
                return;
            }
        }
    }
    async initBundleManager() {
        // TODO 所有类似的新流程，都应该走统一的 runBuildTask 处理，否则可能无法中断
        if (this.error) {
            await this.onError(this.error);
            return;
        }
        this.bundleManager = await bundle_1.BundleManager.create(this.options, this);
        this.bundleManager.options.dest = this.result.paths.assets;
        this.bundleManager.destDir = this.result.paths.assets;
        if (this.options.preview) {
            await this.bundleManager.initOptions();
        }
        else {
            this.bundleManager.updateProcess = (message, progress) => {
                this.updateProcess(message, progress - this.bundleManager.progress);
            };
        }
        await this.bundleManager.runPluginTask(this.bundleManager.hookMap.onBeforeBundleInit);
        await this.bundleManager.initBundle();
        await this.bundleManager.runPluginTask(this.bundleManager.hookMap.onAfterBundleInit);
    }
    break(reason) {
        sub_process_manager_1.workerManager.killRunningChilds();
        this.unLockAssetDB();
        this.bundleManager && this.bundleManager.break(reason);
        if (this.currentStageTask) {
            // 这里不需要等待，break 触发一下即可，后续有抛异常会被正常捕获
            this.currentStageTask.break(reason);
        }
        this.onError(new Error(`Build task ${this.options.taskName || this.options.outputName} is break!`), false);
    }
    async lockAssetDB() {
        // TODO 所有类似的新流程，都应该走统一的 runBuildTask 处理，否则可能无法中断
        this.updateProcess('Start lock asset db...');
        await assets_1.assetDBManager.pause('build');
    }
    unLockAssetDB() {
        assets_1.assetDBManager.resume();
    }
    /**
     * 获取预览 settings 信息
     */
    async getPreviewSettings() {
        await this.init();
        this.result.settings.engine.engineModules = this.options.includeModules;
        await this.initBundleManager();
        // 开始执行预制任务
        await this.runBuildTask(task_config_1.TaskManager.getBuildTask('dataTasks'), this.taskManager.taskWeight);
        await this.runBuildTask(task_config_1.TaskManager.getBuildTask('settingTasks'), this.taskManager.taskWeight);
        return this.result.settings;
    }
    async initOptions() {
        this.options.platformType = plugin_1.pluginManager.platformConfig[this.options.platform].platformType;
        const defaultMd5CacheOptions = {
            excludes: [],
            includes: [],
            replaceOnly: [],
            handleTemplateMd5Link: false,
        };
        this.options.md5CacheOptions = Object.assign(defaultMd5CacheOptions, this.options.md5CacheOptions || {});
        await (0, common_options_validator_1.checkProjectSetting)(this.options);
        // TODO 支持传参直接传递 resolution
        this.options.resolution = {
            width: this.options.designResolution.width,
            height: this.options.designResolution.height,
            policy: cc_1.ResolutionPolicy.SHOW_ALL,
        };
        const resolution = this.options.resolution;
        if (this.options.designResolution.fitHeight) {
            if (this.options.designResolution.fitWidth) {
                resolution.policy = cc_1.ResolutionPolicy.SHOW_ALL;
            }
            else {
                resolution.policy = cc_1.ResolutionPolicy.FIXED_HEIGHT;
            }
        }
        else {
            if (this.options.designResolution.fitWidth) {
                resolution.policy = cc_1.ResolutionPolicy.FIXED_WIDTH;
            }
            else {
                resolution.policy = cc_1.ResolutionPolicy.NO_BORDER;
            }
        }
        // 处理自定义管线的相关逻辑，项目设置交互已处理过的主要是为了场景环境，构建需要再次确认，避免模块有出入
        const CUSTOM_PIPELINE_NAME = this.options.macroConfig.CUSTOM_PIPELINE_NAME;
        if (this.options.customPipeline) {
            const legacyPipelineIndex = this.options.includeModules.findIndex((module) => module === 'legacy-pipeline');
            if (legacyPipelineIndex !== -1) {
                this.options.includeModules.splice(legacyPipelineIndex, 1);
            }
            !this.options.includeModules.includes('custom-pipeline') && this.options.includeModules.push('custom-pipeline');
            // 使用了内置管线的情况下, 添加 custom-pipeline-builtin-scripts 模块方能打包对应的脚本
            if (CUSTOM_PIPELINE_NAME === 'Builtin' || !CUSTOM_PIPELINE_NAME) {
                this.options.includeModules.push('custom-pipeline-builtin-scripts');
            }
        }
        else {
            const customPipelineIndex = this.options.includeModules.findIndex((module) => module === 'custom-pipeline');
            if (customPipelineIndex !== -1) {
                this.options.includeModules.splice(customPipelineIndex, 1);
            }
            !this.options.includeModules.includes('legacy-pipeline') && this.options.includeModules.push('legacy-pipeline');
        }
        if (this.options.preview) {
            return;
        }
        this.options.appTemplateData = {
            debugMode: this.options.debug,
            renderMode: false, // !!options.renderMode,
            showFPS: this.options.debug,
            resolution,
            md5Cache: this.options.md5Cache,
            cocosTemplate: '',
        };
        this.options.buildEngineParam = {
            entry: this.options.engineInfo.typescript.path,
            debug: this.options.debug,
            mangleProperties: this.options.mangleProperties,
            inlineEnum: this.options.inlineEnum,
            sourceMaps: this.options.sourceMaps,
            includeModules: this.options.includeModules,
            engineVersion: this.options.engineInfo.version,
            // 参与影响引擎复用规则的参数 key
            md5Map: [],
            engineName: 'cocos-js',
            output: (0, path_1.join)(this.result.paths.dir, 'cocos-js'),
            platformType: this.options.platformType,
            useCache: this.options.useCacheConfig?.engine === false ? false : true,
            nativeCodeBundleMode: this.options.nativeCodeBundleMode,
            wasmCompressionMode: this.options.wasmCompressionMode,
        };
        this.options.buildScriptParam = {
            experimentalEraseModules: this.options.experimentalEraseModules,
            outputName: 'project',
            flags: {
                DEBUG: !!this.options.debug,
                ...this.options.flags,
            },
            polyfills: this.options.polyfills,
            hotModuleReload: false,
            platform: this.options.platformType,
            commonDir: '',
            bundleCommonChunk: this.options.bundleCommonChunk ?? false,
            targets: this.options.buildScriptTargets,
        };
        if (this.options.polyfills) {
            this.options.polyfills.targets = this.options.buildScriptTargets;
        }
        else {
            this.options.polyfills = {
                targets: this.options.buildScriptTargets,
            };
        }
        this.options.assetSerializeOptions = {
            'cc.EffectAsset': {
                glsl1: this.options.includeModules.includes('gfx-webgl'),
                glsl3: this.options.includeModules.includes('gfx-webgl2'),
                glsl4: false,
            },
        };
        this.buildExitRes.dest = this.result.paths.dir;
    }
    /**
     * 执行某个任务列表
     * @param buildTasks 任务列表数组
     * @param weight 全部任务列表所占权重
     * @param args 需要传递给任务的其他参数
     */
    async runBuildTask(buildTasks, weight, ...args) {
        weight = this.mainTaskWeight * weight / buildTasks.length;
        // 开始执行预制任务
        for (let i = 0; i < buildTasks.length; i++) {
            if (this.error) {
                this.onError(this.error);
                return;
            }
            const task = buildTasks[i];
            const taskTitle = await transTitle(task.title);
            const trickTimeLabel = `// ---- build task ${taskTitle} ----`;
            console_1.newConsole.trackTimeStart(trickTimeLabel);
            this.updateProcess(taskTitle + ' start');
            console.debug(trickTimeLabel);
            console_1.newConsole.trackMemoryStart(taskTitle);
            try {
                const result = await task.handle.call(this, this.options, this.result, this.cache, ...args);
                // @ts-ignore
                task.name && result && (this.taskResMap[task.name] = result);
                const time = await console_1.newConsole.trackTimeEnd(trickTimeLabel, { output: true });
                this.updateProcess(`run build task ${taskTitle} success in ${(0, utils_1.formatMSTime)(time)}√`, weight, 'log');
            }
            catch (error) {
                console_1.newConsole.trackMemoryEnd(taskTitle);
                this.updateProcess(`run build task ${taskTitle} failed!`, weight, 'error');
                await this.onError(error, true);
                return;
            }
            console_1.newConsole.trackMemoryEnd(taskTitle);
        }
    }
    async handleHook(func, internal, ...args) {
        if (internal) {
            await func.call(this, this.options, this.result, this.cache, ...args);
        }
        else {
            await func(this.result.rawOptions, this.buildResult, ...args);
        }
    }
    onError(error, throwError = true) {
        this.error = error;
        this.bundleManager && (this.bundleManager.error = error);
        if (throwError) {
            throw error;
        }
    }
    async runErrorHook() {
        try {
            const funcName = 'onError';
            for (const pkgName of this.hooksInfo.pkgNameOrder) {
                const info = this.hooksInfo.infos[pkgName];
                let hooks;
                const timeLabel = `${pkgName}:(${funcName})`;
                try {
                    hooks = utils_2.default.File.requireFile(info.path);
                    if (hooks[funcName]) {
                        this.updateProcess(`${timeLabel} start...`);
                        console.debug(`// ---- ${pkgName}:(${funcName}) ----`);
                        console_1.newConsole.trackMemoryStart(timeLabel);
                        if (info.internal) {
                            await hooks[funcName].call(this, this.options, this.result, this.cache);
                        }
                        else {
                            // @ts-ignore
                            await hooks[funcName](this.result.rawOptions, this.buildResult);
                        }
                        console_1.newConsole.trackMemoryEnd(timeLabel);
                        console.debug(`// ---- ${pkgName}:(${funcName}) success ----`);
                        this.updateProcess(`${pkgName}:(${funcName})`);
                    }
                }
                catch (error) {
                    console_1.newConsole.trackMemoryEnd(timeLabel);
                    // @ts-ignore
                    console.error((new BuildError(`Run build plugin ${pkgName}:(${funcName}) failed!`)).stack);
                }
            }
            await this.postBuild();
        }
        catch (error) {
            console.debug(error);
        }
    }
}
exports.BuildTask = BuildTask;
/**
 * 翻译 title
 * @param title 原始 title 或者带有 i18n 开头的 title
 */
function transTitle(title) {
    if (typeof title !== 'string') {
        return '';
    }
    if (title.startsWith('i18n:')) {
        title = title.replace('i18n:', '');
        const res = i18n_1.default.t(title);
        if (res === title) {
            console.debug(`${title} is not defined in i18n`);
        }
        return res || title;
    }
    return title;
}
class BuildError {
    message;
    constructor(msg) {
        Error.captureStackTrace(this, BuildError);
        this.message = msg;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3dvcmtlci9idWlsZGVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRWIsdUNBQW1GO0FBQ25GLCtCQUE0QjtBQUM1QiwyQ0FBb0Q7QUFDcEQseURBQTZEO0FBQzdELHlEQUFxRDtBQUNyRCwrQ0FBNEM7QUFDNUMsNkRBQXNEO0FBQ3RELDZFQUFvRTtBQUNwRSxtREFBdUQ7QUFDdkQsMkJBQXNDO0FBQ3RDLG1EQUFvRDtBQUNwRCw2Q0FBK0Q7QUFDL0QsNkRBQXlEO0FBQ3pELG1EQUFtRDtBQUduRCw0Q0FBaUQ7QUFDakQsZ0VBQXdDO0FBQ3hDLGlEQUFxRDtBQUNyRCw4REFBc0M7QUFDdEMsbUZBQTJFO0FBRTNFLG9EQUFzQztBQUN0QyxnRUFBd0M7QUFFeEMsTUFBYSxTQUFVLFNBQVEseUJBQWE7SUFDakMsS0FBSyxDQUFvQjtJQUV6QixNQUFNLENBQXNCO0lBQzVCLGFBQWEsQ0FBaUI7SUFFckMsZUFBZTtJQUNSLFdBQVcsQ0FBZTtJQUUxQixPQUFPLENBQXdCO0lBRS9CLFNBQVMsQ0FBa0I7SUFFM0IsV0FBVyxDQUFjO0lBRWhDLCtCQUErQjtJQUN2QixjQUFjLEdBQUcsQ0FBQyxDQUFDO0lBRTNCLFdBQVc7SUFDWCxNQUFNLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztJQUV0QixnQkFBZ0IsQ0FBa0I7SUFFbkMsYUFBYSxDQUFpQjtJQUU5QixPQUFPLEdBQTZDO1FBQ3ZELGFBQWEsRUFBRSxlQUFlO1FBQzlCLFlBQVksRUFBRSxjQUFjO1FBQzVCLFdBQVcsRUFBRSxhQUFhO1FBQzFCLG1CQUFtQixFQUFFLHFCQUFxQjtRQUMxQyxrQkFBa0IsRUFBRSxvQkFBb0I7UUFDeEMsd0JBQXdCLEVBQUUsMEJBQTBCO1FBQ3BE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SyxRQUFRLEVBQUUsQ0FBQztRQUM1QixPQUFPLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFDRCxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUM1QixLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkMsTUFBTSxHQUFHLEdBQUcsY0FBSSxDQUFDLENBQUMsQ0FBQyxLQUFpQixDQUFDLENBQUM7UUFDdEMsSUFBSSxHQUFHLEtBQUssS0FBSyxFQUFFLENBQUM7WUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUsseUJBQXlCLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBQ0QsT0FBTyxHQUFHLElBQUksS0FBSyxDQUFDO0lBQ3hCLENBQUM7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBRUQsTUFBTSxVQUFVO0lBQ1osT0FBTyxDQUFTO0lBQ2hCLFlBQVksR0FBVztRQUNuQixLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO0lBQ3ZCLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IGVtcHR5RGlyU3luYywgZW5zdXJlRGlyLCBvdXRwdXRGaWxlU3luYywgb3V0cHV0SlNPTlN5bmMgfSBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgQnVpbGRlckFzc2V0Q2FjaGUgfSBmcm9tICcuL21hbmFnZXIvYXNzZXQnO1xyXG5pbXBvcnQgeyBJbnRlcm5hbEJ1aWxkUmVzdWx0IH0gZnJvbSAnLi9tYW5hZ2VyL2J1aWxkLXJlc3VsdCc7XHJcbmltcG9ydCB7IEJ1aWxkUmVzdWx0IH0gZnJvbSAnLi9tYW5hZ2VyL2J1aWxkLXJlc3VsdCc7XHJcbmltcG9ydCB7IFRhc2tNYW5hZ2VyIH0gZnJvbSAnLi90YXNrLWNvbmZpZyc7XHJcbmltcG9ydCB7IEJ1aWxkU3RhZ2VUYXNrIH0gZnJvbSAnLi9zdGFnZS10YXNrLW1hbmFnZXInO1xyXG5pbXBvcnQgeyB3b3JrZXJNYW5hZ2VyIH0gZnJvbSAnLi4vd29ya2VyLXBvb2xzL3N1Yi1wcm9jZXNzLW1hbmFnZXInO1xyXG5pbXBvcnQgeyBCdW5kbGVNYW5hZ2VyIH0gZnJvbSAnLi9hc3NldC1oYW5kbGVyL2J1bmRsZSc7XHJcbmltcG9ydCB7IFJlc29sdXRpb25Qb2xpY3kgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IEJ1aWxkVGFza0Jhc2UgfSBmcm9tICcuL21hbmFnZXIvdGFzay1iYXNlJztcclxuaW1wb3J0IHsgZm9ybWF0TVNUaW1lLCBnZXRCdWlsZFBhdGggfSBmcm9tICcuLi8uLi9zaGFyZS91dGlscyc7XHJcbmltcG9ydCB7IEJ1aWxkVGVtcGxhdGUgfSBmcm9tICcuL21hbmFnZXIvYnVpbGQtdGVtcGxhdGUnO1xyXG5pbXBvcnQgeyBuZXdDb25zb2xlIH0gZnJvbSAnLi4vLi4vLi4vYmFzZS9jb25zb2xlJztcclxuaW1wb3J0IHsgSVRhc2tSZXN1bHRNYXAgfSBmcm9tICcuLi8uLi9AdHlwZXMvYnVpbGRlcic7XHJcbmltcG9ydCB7IElCdWlsZGVyLCBJSW50ZXJuYWxCdWlsZE9wdGlvbnMsIElCdWlsZEhvb2tzSW5mbywgSUJ1aWxkVGFzaywgSVBsdWdpbkhvb2tOYW1lLCBJQnVpbGRPcHRpb25CYXNlLCBJQnVpbGRSZXN1bHREYXRhLCBJQnVpbGRVdGlscyB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBhc3NldERCTWFuYWdlciB9IGZyb20gJy4uLy4uLy4uL2Fzc2V0cyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi9iYXNlL3V0aWxzJztcclxuaW1wb3J0IHsgcGx1Z2luTWFuYWdlciB9IGZyb20gJy4uLy4uL21hbmFnZXIvcGx1Z2luJztcclxuaW1wb3J0IGkxOG4gZnJvbSAnLi4vLi4vLi4vYmFzZS9pMThuJztcclxuaW1wb3J0IHsgY2hlY2tQcm9qZWN0U2V0dGluZyB9IGZyb20gJy4uLy4uL3NoYXJlL2NvbW1vbi1vcHRpb25zLXZhbGlkYXRvcic7XHJcbmltcG9ydCB7IEkxOG5LZXlzIH0gZnJvbSAnLi4vLi4vLi4vLi4vaTE4bi90eXBlcy9nZW5lcmF0ZWQnO1xyXG5pbXBvcnQgKiBhcyBidWlsZFV0aWxzIGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vLi4vLi4vYmFzZS91dGlscyc7XHJcblxyXG5leHBvcnQgY2xhc3MgQnVpbGRUYXNrIGV4dGVuZHMgQnVpbGRUYXNrQmFzZSBpbXBsZW1lbnRzIElCdWlsZGVyIHtcclxuICAgIHB1YmxpYyBjYWNoZTogQnVpbGRlckFzc2V0Q2FjaGU7XHJcblxyXG4gICAgcHVibGljIHJlc3VsdDogSW50ZXJuYWxCdWlsZFJlc3VsdDtcclxuICAgIHB1YmxpYyBidWlsZFRlbXBsYXRlITogQnVpbGRUZW1wbGF0ZTtcclxuXHJcbiAgICAvLyDlr7nlpJbpg6jmj5Lku7bmj5DkvpvnmoTmnoTlu7rnu5PmnpxcclxuICAgIHB1YmxpYyBidWlsZFJlc3VsdD86IEJ1aWxkUmVzdWx0O1xyXG5cclxuICAgIHB1YmxpYyBvcHRpb25zOiBJSW50ZXJuYWxCdWlsZE9wdGlvbnM7XHJcblxyXG4gICAgcHVibGljIGhvb2tzSW5mbzogSUJ1aWxkSG9va3NJbmZvO1xyXG5cclxuICAgIHB1YmxpYyB0YXNrTWFuYWdlcjogVGFza01hbmFnZXI7XHJcblxyXG4gICAgLy8g5p6E5bu65Li75rWB56iL5Lu75Yqh5p2D6YeN77yM6ZqP552A5YW25LuW6Zi25q615oCn5Lu75Yqh55qE5Yqg5YWl5Y+v6IO95Lya5pyJ5Y+Y5YyWXHJcbiAgICBwcml2YXRlIG1haW5UYXNrV2VpZ2h0ID0gMTtcclxuXHJcbiAgICAvLyDmmK/lkKbkuLrlkb3ku6TooYzmnoTlu7pcclxuICAgIHN0YXRpYyBpc0NvbW1hbmRCdWlsZCA9IGZhbHNlO1xyXG5cclxuICAgIHByaXZhdGUgY3VycmVudFN0YWdlVGFzaz86IEJ1aWxkU3RhZ2VUYXNrO1xyXG5cclxuICAgIHB1YmxpYyBidW5kbGVNYW5hZ2VyITogQnVuZGxlTWFuYWdlcjtcclxuXHJcbiAgICBwdWJsaWMgaG9va01hcDogUmVjb3JkPElQbHVnaW5Ib29rTmFtZSwgSVBsdWdpbkhvb2tOYW1lPiA9IHtcclxuICAgICAgICBvbkJlZm9yZUJ1aWxkOiAnb25CZWZvcmVCdWlsZCcsXHJcbiAgICAgICAgb25CZWZvcmVJbml0OiAnb25CZWZvcmVJbml0JyxcclxuICAgICAgICBvbkFmdGVySW5pdDogJ29uQWZ0ZXJJbml0JyxcclxuICAgICAgICBvbkJlZm9yZUJ1aWxkQXNzZXRzOiAnb25CZWZvcmVCdWlsZEFzc2V0cycsXHJcbiAgICAgICAgb25BZnRlckJ1aWxkQXNzZXRzOiAnb25BZnRlckJ1aWxkQXNzZXRzJyxcclxuICAgICAgICBvbkJlZm9yZUNvbXByZXNzU2V0dGluZ3M6ICdvbkJlZm9yZUNvbXByZXNzU2V0dGluZ3MnLFxyXG4gICAgICAgIG9uQWZ0ZXJDb21wcmVzc1NldHRpbmdzOiAnb25BZnRlckNvbXByZXNzU2V0dGluZ3MnLFxyXG4gICAgICAgIG9uQWZ0ZXJCdWlsZDogJ29uQWZ0ZXJCdWlsZCcsXHJcbiAgICAgICAgb25CZWZvcmVDb3B5QnVpbGRUZW1wbGF0ZTogJ29uQmVmb3JlQ29weUJ1aWxkVGVtcGxhdGUnLFxyXG4gICAgICAgIG9uQWZ0ZXJDb3B5QnVpbGRUZW1wbGF0ZTogJ29uQWZ0ZXJDb3B5QnVpbGRUZW1wbGF0ZScsXHJcbiAgICAgICAgb25FcnJvcjogJ29uRXJyb3InLFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyDmiafooYzmlbTkuKrmnoTlu7rmtYHnqIvnmoTpobrluo/mtYHnqItcclxuICAgIHB1YmxpYyBwaXBlbGluZTogKHN0cmluZyB8IEZ1bmN0aW9uIHwgSUJ1aWxkVGFza1tdKVtdID0gW107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmnoTlu7rku7vliqHnmoTnu5PmnpznvJPlrZjvvIzlj6rlhYHorrjmjqXlj6Porr/pl65cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB0YXNrUmVzTWFwOiBJVGFza1Jlc3VsdE1hcCA9IHt9O1xyXG5cclxuICAgIHN0YXRpYyB1dGlsczogSUJ1aWxkVXRpbHMgPSB7XHJcbiAgICAgICAgaXNJbnN0YWxsTm9kZUpzOiBidWlsZFV0aWxzLmlzSW5zdGFsbE5vZGVKcyxcclxuICAgICAgICByZWxhdGl2ZVVybDogYnVpbGRVdGlscy5yZWxhdGl2ZVVybCxcclxuICAgICAgICB0cmFuc2Zvcm1Db2RlOiBidWlsZFV0aWxzLnRyYW5zZm9ybUNvZGUsXHJcbiAgICAgICAgcmVzb2x2ZVRvUmF3OiB1dGlscy5QYXRoLnJlc29sdmVUb1JhdyxcclxuICAgIH07XHJcblxyXG4gICAgZ2V0IHV0aWxzKCkge1xyXG4gICAgICAgIHJldHVybiBCdWlsZFRhc2sudXRpbHM7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgb3B0aW9uczogSUJ1aWxkT3B0aW9uQmFzZSkge1xyXG4gICAgICAgIHN1cGVyKGlkLCAnYnVpbGQnKTtcclxuICAgICAgICB0aGlzLnRhc2tNYW5hZ2VyID0gbmV3IFRhc2tNYW5hZ2VyKCk7XHJcbiAgICAgICAgdGhpcy50YXNrTWFuYWdlci5hY3RpdmVUYXNrKCdkYXRhVGFza3MnKTtcclxuICAgICAgICB0aGlzLnRhc2tNYW5hZ2VyLmFjdGl2ZVRhc2soJ3NldHRpbmdUYXNrcycpO1xyXG4gICAgICAgIHRoaXMudGFza01hbmFnZXIuYWN0aXZlVGFzaygnYnVpbGRUYXNrcycpO1xyXG4gICAgICAgIHRoaXMudGFza01hbmFnZXIuYWN0aXZlVGFzaygnbWQ1VGFza3MnKTtcclxuICAgICAgICB0aGlzLnRhc2tNYW5hZ2VyLmFjdGl2ZVRhc2soJ3Bvc3Rwcm9jZXNzVGFza3MnKTtcclxuICAgICAgICB0aGlzLmhvb2tzSW5mbyA9IHBsdWdpbk1hbmFnZXIuZ2V0SG9va3NJbmZvKG9wdGlvbnMucGxhdGZvcm0pO1xyXG4gICAgICAgIC8vIFRPRE8g6KGl5YWoIG9wdGlvbnMg5Li6IElJbnRlcm5hbEJ1aWxkT3B0aW9uc1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgYXMgSUludGVybmFsQnVpbGRPcHRpb25zO1xyXG5cclxuICAgICAgICB0aGlzLmNhY2hlID0gbmV3IEJ1aWxkZXJBc3NldENhY2hlKHRoaXMpO1xyXG4gICAgICAgIHRoaXMucmVzdWx0ID0gbmV3IEludGVybmFsQnVpbGRSZXN1bHQodGhpcywgISFvcHRpb25zLnByZXZpZXcpO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5wcmV2aWV3IHx8IG9wdGlvbnMuYnVpbGRNb2RlID09PSAnYnVuZGxlJykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucmVzdWx0LmFkZExpc3RlbmVyKCd1cGRhdGVQcm9jZXNzJywgKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByb2Nlc3MobWVzc2FnZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy50YXNrTWFuYWdlci5hY3RpdmVUYXNrKCdidWlsZFRhc2tzJyk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLm1kNUNhY2hlICYmICh0aGlzLnRhc2tNYW5hZ2VyLmFjdGl2ZVRhc2soJ21kNVRhc2tzJykpO1xyXG4gICAgICAgIHRoaXMudGFza01hbmFnZXIuYWN0aXZlVGFzaygncG9zdHByb2Nlc3NUYXNrcycpO1xyXG4gICAgICAgIHRoaXMuYnVpbGRSZXN1bHQgPSBuZXcgQnVpbGRSZXN1bHQodGhpcyk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5uZXh0U3RhZ2VzKSB7XHJcbiAgICAgICAgICAgIC8vIOW9k+WtmOWcqOmYtuauteaAp+S7u+WKoeaXtu+8jOaehOW7uuS4u+a1geeoi+eahOadg+mHjemZjee6p1xyXG4gICAgICAgICAgICB0aGlzLm1haW5UYXNrV2VpZ2h0ID0gMSAvICh0aGlzLm9wdGlvbnMubmV4dFN0YWdlcy5sZW5ndGggKyAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ob29rV2VpZ2h0ID0gdGhpcy5tYWluVGFza1dlaWdodCAqIHRoaXMudGFza01hbmFnZXIudGFza1dlaWdodDtcclxuICAgICAgICB0aGlzLmJ1aWxkVGVtcGxhdGUgPSBuZXcgQnVpbGRUZW1wbGF0ZSh0aGlzLm9wdGlvbnMucGxhdGZvcm0sIHRoaXMub3B0aW9ucy50YXNrTmFtZSwgcGx1Z2luTWFuYWdlci5nZXRCdWlsZFRlbXBsYXRlQ29uZmlnKHRoaXMub3B0aW9ucy5wbGF0Zm9ybSkpO1xyXG5cclxuICAgICAgICAvLyBUT0RPXHJcbiAgICAgICAgLy8gdGhpcy5waXBlbGluZSA9IFtcclxuICAgICAgICAvLyAgICAgdGhpcy5ob29rTWFwLm9uQmVmb3JlQnVpbGQsXHJcbiAgICAgICAgLy8gICAgIHRoaXMubG9ja0Fzc2V0REIsXHJcbiAgICAgICAgLy8gICAgIHRoaXMuaG9va01hcC5vbkJlZm9yZUluaXQsXHJcbiAgICAgICAgLy8gICAgIHRoaXMuaW5pdCxcclxuICAgICAgICAvLyAgICAgdGhpcy5ob29rTWFwLm9uQWZ0ZXJJbml0LFxyXG4gICAgICAgIC8vICAgICB0aGlzLmluaXRCdW5kbGVNYW5hZ2VyLFxyXG4gICAgICAgIC8vICAgICB0aGlzLmRhdGFUYXNrcyxcclxuICAgICAgICAvLyAgICAgdGhpcy5idWlsZFRhc2tzLFxyXG4gICAgICAgIC8vICAgICB0aGlzLmhvb2tNYXAub25BZnRlckJ1aWxkQXNzZXRzLFxyXG4gICAgICAgIC8vICAgICB0aGlzLm1kNVRhc2tzLFxyXG4gICAgICAgIC8vICAgICB0aGlzLnNldHRpbmdUYXNrcyxcclxuICAgICAgICAvLyAgICAgdGhpcy5ob29rTWFwLm9uQmVmb3JlQ29tcHJlc3NTZXR0aW5ncyxcclxuICAgICAgICAvLyAgICAgdGhpcy5wb3N0cHJvY2Vzc1Rhc2tzLFxyXG4gICAgICAgIC8vICAgICB0aGlzLmhvb2tNYXAub25BZnRlckNvbXByZXNzU2V0dGluZ3MsXHJcbiAgICAgICAgLy8gICAgIHRoaXMuaG9va01hcC5vbkFmdGVyQnVpbGQsXHJcbiAgICAgICAgLy8gXTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHN0YWdlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50U3RhZ2VUYXNrKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnYnVpbGQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U3RhZ2VUYXNrLm5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmn5DkuKrku7vliqHnu5PmnpxcclxuICAgICAqIEBwYXJhbSBuYW1lXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRUYXNrUmVzdWx0KG5hbWU6IGtleW9mIElUYXNrUmVzdWx0TWFwKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jlc01hcFtuYW1lXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOW8gOWni+aVtOeQhuaehOW7uumcgOimgeeahOWPguaVsFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgaW5pdCgpIHtcclxuICAgICAgICAvLyBUT0RPIOaJgOacieexu+S8vOeahOaWsOa1geeoi++8jOmDveW6lOivpei1sOe7n+S4gOeahCBydW5CdWlsZFRhc2sg5aSE55CG77yM5ZCm5YiZ5Y+v6IO95peg5rOV5Lit5patXHJcbiAgICAgICAgaWYgKHRoaXMuZXJyb3IpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmRlYnVnKCdRdWVyeSBhbGwgYXNzZXRzIGluZm8gaW4gcHJvamVjdCcpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdE9wdGlvbnMoKTtcclxuXHJcbiAgICAgICAgLy8g5riF56m65omA5pyJ6LWE5rqQ57yT5a2YXHJcbiAgICAgICAgY2MuYXNzZXRNYW5hZ2VyLnJlbGVhc2VBbGwoKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmNhY2hlLmluaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaJp+ihjOWFt+S9k+eahOaehOW7uuS7u+WKoVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgcnVuKCkge1xyXG4gICAgICAgIGNvbnN0IHsgZGlyIH0gPSB0aGlzLnJlc3VsdC5wYXRocztcclxuICAgICAgICBpZiAoIWRpcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdObyBvdXRwdXQgcGF0aCBjYW4gYmUgYnVpbHQuJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYnVpbGRNb2RlID09PSAnYnVuZGxlJykge1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmJ1aWxkQnVuZGxlT25seSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgZW5zdXJlRGlyKHRoaXMucmVzdWx0LnBhdGhzLmRpcik7XHJcbiAgICAgICAgLy8g5YWB6K645o+S5Lu25ZyoIG9uQmVmb3JlQnVpbGQg5YaF5L+u5pS5IHVzZUNhY2hlXHJcbiAgICAgICAgYXdhaXQgdGhpcy5ydW5QbHVnaW5UYXNrKFRhc2tNYW5hZ2VyLnBsdWdpblRhc2tzLm9uQmVmb3JlQnVpbGQpO1xyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnVzZUNhY2hlKSB7XHJcbiAgICAgICAgICAgIC8vIOWbuuWumua4heeQhuW3peeoi+eahOaXtuacuu+8jOivt+WLv+aUueWKqOS7peWFjemAoOaIkOS4jeW/heimgeeahOaPkuS7tuWFvOWuuemXrumimFxyXG4gICAgICAgICAgICBlbXB0eURpclN5bmModGhpcy5yZXN1bHQucGF0aHMuZGlyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgdGhpcy5sb2NrQXNzZXREQigpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMucnVuUGx1Z2luVGFzayhUYXNrTWFuYWdlci5wbHVnaW5UYXNrcy5vbkJlZm9yZUluaXQpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMucnVuUGx1Z2luVGFzayhUYXNrTWFuYWdlci5wbHVnaW5UYXNrcy5vbkFmdGVySW5pdCk7XHJcblxyXG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdEJ1bmRsZU1hbmFnZXIoKTtcclxuXHJcbiAgICAgICAgYXdhaXQgdGhpcy5idW5kbGVNYW5hZ2VyLnJ1blBsdWdpblRhc2sodGhpcy5idW5kbGVNYW5hZ2VyLmhvb2tNYXAub25CZWZvcmVCdW5kbGVEYXRhVGFzayk7XHJcbiAgICAgICAgLy8g5byA5aeL5omn6KGM6aKE5Yi25Lu75YqhXHJcbiAgICAgICAgYXdhaXQgdGhpcy5ydW5CdWlsZFRhc2soVGFza01hbmFnZXIuZ2V0QnVpbGRUYXNrKCdkYXRhVGFza3MnKSwgdGhpcy50YXNrTWFuYWdlci50YXNrV2VpZ2h0KTtcclxuICAgICAgICBhd2FpdCB0aGlzLmJ1bmRsZU1hbmFnZXIucnVuUGx1Z2luVGFzayh0aGlzLmJ1bmRsZU1hbmFnZXIuaG9va01hcC5vbkFmdGVyQnVuZGxlRGF0YVRhc2spO1xyXG5cclxuICAgICAgICBhd2FpdCB0aGlzLnJ1blBsdWdpblRhc2soVGFza01hbmFnZXIucGx1Z2luVGFza3Mub25CZWZvcmVCdWlsZEFzc2V0cyk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5idW5kbGVNYW5hZ2VyLnJ1blBsdWdpblRhc2sodGhpcy5idW5kbGVNYW5hZ2VyLmhvb2tNYXAub25CZWZvcmVCdW5kbGVCdWlsZFRhc2spO1xyXG4gICAgICAgIC8vIOW8gOWni+aJp+ihjOaehOW7uuS7u+WKoVxyXG4gICAgICAgIGF3YWl0IHRoaXMucnVuQnVpbGRUYXNrKFRhc2tNYW5hZ2VyLmdldEJ1aWxkVGFzaygnYnVpbGRUYXNrcycpLCB0aGlzLnRhc2tNYW5hZ2VyLnRhc2tXZWlnaHQpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuYnVuZGxlTWFuYWdlci5ydW5QbHVnaW5UYXNrKHRoaXMuYnVuZGxlTWFuYWdlci5ob29rTWFwLm9uQWZ0ZXJCdW5kbGVCdWlsZFRhc2spO1xyXG4gICAgICAgIGF3YWl0IHRoaXMucnVuUGx1Z2luVGFzayhUYXNrTWFuYWdlci5wbHVnaW5UYXNrcy5vbkFmdGVyQnVpbGRBc3NldHMpO1xyXG5cclxuICAgICAgICBhd2FpdCB0aGlzLnJ1bkJ1aWxkVGFzayhUYXNrTWFuYWdlci5nZXRCdWlsZFRhc2soJ3NldHRpbmdUYXNrcycpLCB0aGlzLnRhc2tNYW5hZ2VyLnRhc2tXZWlnaHQpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMucnVuUGx1Z2luVGFzayhUYXNrTWFuYWdlci5wbHVnaW5UYXNrcy5vbkJlZm9yZUNvbXByZXNzU2V0dGluZ3MpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMucnVuQnVpbGRUYXNrKFRhc2tNYW5hZ2VyLmdldEJ1aWxkVGFzaygncG9zdHByb2Nlc3NUYXNrcycpLCB0aGlzLnRhc2tNYW5hZ2VyLnRhc2tXZWlnaHQpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMucnVuUGx1Z2luVGFzayhUYXNrTWFuYWdlci5wbHVnaW5UYXNrcy5vbkFmdGVyQ29tcHJlc3NTZXR0aW5ncyk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5ydW5QbHVnaW5UYXNrKFRhc2tNYW5hZ2VyLnBsdWdpblRhc2tzLm9uQmVmb3JlQ29weUJ1aWxkVGVtcGxhdGUpO1xyXG4gICAgICAgIC8vIOaLt+i0neiHquWumuS5ieaooeadv1xyXG4gICAgICAgIGF3YWl0IHRoaXMuYnVpbGRUZW1wbGF0ZSEuY29weVRvKHRoaXMucmVzdWx0LnBhdGhzLm91dHB1dCk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5ydW5QbHVnaW5UYXNrKFRhc2tNYW5hZ2VyLnBsdWdpblRhc2tzLm9uQWZ0ZXJDb3B5QnVpbGRUZW1wbGF0ZSk7XHJcbiAgICAgICAgLy8gTUQ1IOWkhOeQhlxyXG4gICAgICAgIHRoaXMub3B0aW9ucy5tZDVDYWNoZSAmJiAoYXdhaXQgdGhpcy5ydW5CdWlsZFRhc2soVGFza01hbmFnZXIuZ2V0QnVpbGRUYXNrKCdtZDVUYXNrcycpLCB0aGlzLnRhc2tNYW5hZ2VyLnRhc2tXZWlnaHQpKTtcclxuICAgICAgICAvLyDmnoTlu7rov5vnqIvnu5PmnZ/kuYvliY1cclxuICAgICAgICBhd2FpdCB0aGlzLnJ1blBsdWdpblRhc2soVGFza01hbmFnZXIucGx1Z2luVGFza3Mub25BZnRlckJ1aWxkKTtcclxuICAgICAgICBhd2FpdCB0aGlzLnBvc3RCdWlsZCgpO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5uZXh0U3RhZ2VzICYmIChhd2FpdCB0aGlzLmhhbmRsZUJ1aWxkU3RhZ2VUYXNrKHRoaXMub3B0aW9ucy5uZXh0U3RhZ2VzKSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDku4XmnoTlu7ogQnVuZGxlIOa1geeoi1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgYnVpbGRCdW5kbGVPbmx5KCkge1xyXG4gICAgICAgIGNvbnN0IHNldHRpbmdUYXNrcyA9IHRoaXMudGFza01hbmFnZXIuYWN0aXZlQ3VzdG9tVGFzaygnc2V0dGluZ1Rhc2tzJywgW1xyXG4gICAgICAgICAgICAnc2V0dGluZy10YXNrL2NhY2hlJyxcclxuICAgICAgICAgICAgJ3NldHRpbmctdGFzay9hc3NldCcsXHJcbiAgICAgICAgICAgICdzZXR0aW5nLXRhc2svc2NyaXB0JyxcclxuICAgICAgICBdKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmxvY2tBc3NldERCKCk7XHJcbiAgICAgICAgLy8g6LWw5p6E5bu65Lu75Yqh55qE5LuFIEJ1bmRsZSDmnoTlu7rmqKHlvI/kuZ/pnIDopoHmiafooYwgaW5pdCDliY3lkI7pkqnlrZDvvIzlm6DkuLrmraTml7bpnIDopoHkv53pmpzljIXlrozmlbRcclxuICAgICAgICAvLyDkuI3miafooYzkuIDkupvpgInpobnnmoTkv67mlLnlj6/og73msqHmnInlkIzmraXliLBcclxuICAgICAgICBhd2FpdCB0aGlzLnJ1blBsdWdpblRhc2soVGFza01hbmFnZXIucGx1Z2luVGFza3Mub25CZWZvcmVJbml0KTtcclxuICAgICAgICBhd2FpdCB0aGlzLmluaXQoKTtcclxuICAgICAgICBhd2FpdCB0aGlzLnJ1blBsdWdpblRhc2soVGFza01hbmFnZXIucGx1Z2luVGFza3Mub25BZnRlckluaXQpO1xyXG4gICAgICAgIHRoaXMuYnVuZGxlTWFuYWdlciA9IGF3YWl0IEJ1bmRsZU1hbmFnZXIuY3JlYXRlKHRoaXMub3B0aW9ucywgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5idW5kbGVNYW5hZ2VyLm9wdGlvbnMuZGVzdCA9IHRoaXMucmVzdWx0LnBhdGhzLmFzc2V0cztcclxuICAgICAgICB0aGlzLmJ1bmRsZU1hbmFnZXIuZGVzdERpciA9IHRoaXMucmVzdWx0LnBhdGhzLmFzc2V0cztcclxuICAgICAgICB0aGlzLmJ1bmRsZU1hbmFnZXIudXBkYXRlUHJvY2VzcyA9IChtZXNzYWdlLCBwcm9ncmVzczogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJvY2VzcyhtZXNzYWdlLCBwcm9ncmVzcyAtIHRoaXMuYnVuZGxlTWFuYWdlci5wcm9ncmVzcyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBhd2FpdCB0aGlzLmJ1bmRsZU1hbmFnZXIucnVuKCk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5ydW5CdWlsZFRhc2soc2V0dGluZ1Rhc2tzLCB0aGlzLnRhc2tNYW5hZ2VyLnRhc2tXZWlnaHQpO1xyXG4gICAgICAgIGNvbnN0IGJ1bmRsZXMgPSB0aGlzLmJ1bmRsZU1hbmFnZXIuYnVuZGxlcy5maWx0ZXIoKGJ1bmRsZSkgPT4gYnVuZGxlLm91dHB1dCkuc29ydCgoYSwgYikgPT4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKSk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tZDVDYWNoZSkge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGJ1bmRsZSBvZiBidW5kbGVzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdC5zZXR0aW5ncy5hc3NldHMuYnVuZGxlVmVyc1tidW5kbGUubmFtZV0gPSBidW5kbGUudmVyc2lvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDnlJ/miJAgc2V0dGluZ3MuanNvblxyXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBKU09OLnN0cmluZ2lmeSh0aGlzLnJlc3VsdC5zZXR0aW5ncywgbnVsbCwgdGhpcy5vcHRpb25zLmRlYnVnID8gNCA6IDApO1xyXG4gICAgICAgIG91dHB1dEZpbGVTeW5jKHRoaXMucmVzdWx0LnBhdGhzLnNldHRpbmdzLCBjb250ZW50LCAndXRmOCcpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMudW5Mb2NrQXNzZXREQigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgcG9zdEJ1aWxkKCkge1xyXG5cclxuICAgICAgICB0aGlzLnVuTG9ja0Fzc2V0REIoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5nZW5lcmF0ZUNvbXBpbGVDb25maWcpIHtcclxuICAgICAgICAgICAgLy8g5L+d5a2Y5b2T5YmN55qEIG9wdGlvbnMg5Yiw5a6e6ZmF5YyF5YaF77yM5L2c5Li65ZCO57ut57yW6K+R5Y+C5pWw5Lmf5Li65bCG5p2l5Yi25L2c5LuF5p6E5bu65byV5pOO562J562J5aSE55CG5YGa5aSH5Lu9XHJcbiAgICAgICAgICAgIG91dHB1dEpTT05TeW5jKHRoaXMucmVzdWx0LnBhdGhzLmNvbXBpbGVDb25maWcsIHRoaXMucmVzdWx0LmNvbXBpbGVPcHRpb25zIHx8IHRoaXMub3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOe7n+iuoea1geeoi+aUvuWcqOacgOWQju+8jOmBv+WFjeWHuumUmeaXtuW5suaJsOWFtuS7lua1geeoi1xyXG4gICAgICAgIC8vIOi/vei4quaehOW7uuaXtumVv++8jOe7n+iuoeaehOW7uumUmeivr++8jOWPkemAgee7n+iuoea2iOaBr1xyXG4gICAgICAgIGNvbnN0IHRvdGFsVGltZSA9IGF3YWl0IG5ld0NvbnNvbGUudHJhY2tUaW1lRW5kKCdidWlsZGVyOmJ1aWxkLXByb2plY3QtdG90YWwnLCB7IG91dHB1dDogdHJ1ZSB9KTtcclxuICAgICAgICBjb25zb2xlLmRlYnVnKGBidWlsZCB0YXNrKCR7dGhpcy5vcHRpb25zLnRhc2tOYW1lfSkgaW4gJHt0b3RhbFRpbWV9IWApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlQnVpbGRTdGFnZVRhc2soc3RhZ2VzOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGNvbnN0IHN0YWdlV2VpZ2h0ID0gMSAtIHRoaXMubWFpblRhc2tXZWlnaHQ7XHJcbiAgICAgICAgZm9yIChjb25zdCB0YXNrTmFtZSBvZiBzdGFnZXMpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhZ2VDb25maWcgPSBwbHVnaW5NYW5hZ2VyLmdldEJ1aWxkU3RhZ2VXaXRoSG9va1Rhc2tzKHRoaXMub3B0aW9ucy5wbGF0Zm9ybSwgdGFza05hbWUpO1xyXG4gICAgICAgICAgICBpZiAoIXN0YWdlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVByb2Nlc3MoYE5vIHN0YWdlIHRhc2s6ICR7dGFza05hbWV9IGluIHBsYXRmb3JtICR7dGhpcy5vcHRpb25zLnBsYXRmb3JtfSwgcGxlYXNlIGNoZWNrIHlvdXIgYnVpbGQgb3B0aW9uc2AsIHN0YWdlV2VpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIEhBQ0sg55uu5YmN5Y6f55Sf5bmz5Y+w6ZKp5a2Q5Ye95pWw5L+u5pS55LqGIHJlc3VsdC5wYXRocy5kaXIg5Zug6ICM5p6E5bu66Lev5b6E6ZyA6KaB6Ieq6KGM6YeN5paw5ou85o6lXHJcbiAgICAgICAgICAgIGNvbnN0IHJvb3QgPSBnZXRCdWlsZFBhdGgodGhpcy5vcHRpb25zKTtcclxuICAgICAgICAgICAgY29uc3QgYnVpbGRTdGFnZVRhc2sgPSBuZXcgQnVpbGRTdGFnZVRhc2sodGhpcy5pZCwge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhZ2VDb25maWcsXHJcbiAgICAgICAgICAgICAgICBob29rc0luZm86IHRoaXMuaG9va3NJbmZvLFxyXG4gICAgICAgICAgICAgICAgcm9vdCxcclxuICAgICAgICAgICAgICAgIGJ1aWxkVGFza09wdGlvbnM6IHRoaXMub3B0aW9ucyxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFN0YWdlVGFzayA9IGJ1aWxkU3RhZ2VUYXNrO1xyXG4gICAgICAgICAgICBidWlsZFN0YWdlVGFzay5vbigndXBkYXRlJywgKG1lc3NhZ2U6IHN0cmluZywgaW5jcmVtZW50OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUHJvY2VzcyhtZXNzYWdlLCBpbmNyZW1lbnQgKiBzdGFnZVdlaWdodCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBhd2FpdCBidWlsZFN0YWdlVGFzay5ydW4oKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMub25FcnJvcih0aGlzLmVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChidWlsZFN0YWdlVGFzay5lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvciA9IGJ1aWxkU3RhZ2VUYXNrLmVycm9yO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgaW5pdEJ1bmRsZU1hbmFnZXIoKSB7XHJcbiAgICAgICAgLy8gVE9ETyDmiYDmnInnsbvkvLznmoTmlrDmtYHnqIvvvIzpg73lupTor6XotbDnu5/kuIDnmoQgcnVuQnVpbGRUYXNrIOWkhOeQhu+8jOWQpuWImeWPr+iDveaXoOazleS4reaWrVxyXG4gICAgICAgIGlmICh0aGlzLmVycm9yKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMub25FcnJvcih0aGlzLmVycm9yKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJ1bmRsZU1hbmFnZXIgPSBhd2FpdCBCdW5kbGVNYW5hZ2VyLmNyZWF0ZSh0aGlzLm9wdGlvbnMsIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuYnVuZGxlTWFuYWdlci5vcHRpb25zLmRlc3QgPSB0aGlzLnJlc3VsdC5wYXRocy5hc3NldHM7XHJcbiAgICAgICAgdGhpcy5idW5kbGVNYW5hZ2VyLmRlc3REaXIgPSB0aGlzLnJlc3VsdC5wYXRocy5hc3NldHM7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wcmV2aWV3KSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuYnVuZGxlTWFuYWdlci5pbml0T3B0aW9ucygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVuZGxlTWFuYWdlci51cGRhdGVQcm9jZXNzID0gKG1lc3NhZ2U6IHN0cmluZywgcHJvZ3Jlc3M6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQcm9jZXNzKG1lc3NhZ2UsIHByb2dyZXNzIC0gdGhpcy5idW5kbGVNYW5hZ2VyLnByb2dyZXNzKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgdGhpcy5idW5kbGVNYW5hZ2VyLnJ1blBsdWdpblRhc2sodGhpcy5idW5kbGVNYW5hZ2VyLmhvb2tNYXAub25CZWZvcmVCdW5kbGVJbml0KTtcclxuICAgICAgICBhd2FpdCB0aGlzLmJ1bmRsZU1hbmFnZXIuaW5pdEJ1bmRsZSgpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuYnVuZGxlTWFuYWdlci5ydW5QbHVnaW5UYXNrKHRoaXMuYnVuZGxlTWFuYWdlci5ob29rTWFwLm9uQWZ0ZXJCdW5kbGVJbml0KTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGJyZWFrKHJlYXNvbjogc3RyaW5nKSB7XHJcbiAgICAgICAgd29ya2VyTWFuYWdlci5raWxsUnVubmluZ0NoaWxkcygpO1xyXG4gICAgICAgIHRoaXMudW5Mb2NrQXNzZXREQigpO1xyXG4gICAgICAgIHRoaXMuYnVuZGxlTWFuYWdlciAmJiB0aGlzLmJ1bmRsZU1hbmFnZXIuYnJlYWsocmVhc29uKTtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50U3RhZ2VUYXNrKSB7XHJcbiAgICAgICAgICAgIC8vIOi/memHjOS4jemcgOimgeetieW+he+8jGJyZWFrIOinpuWPkeS4gOS4i+WNs+WPr++8jOWQjue7reacieaKm+W8guW4uOS8muiiq+ato+W4uOaNleiOt1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGFnZVRhc2suYnJlYWsocmVhc29uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMub25FcnJvcihuZXcgRXJyb3IoYEJ1aWxkIHRhc2sgJHt0aGlzLm9wdGlvbnMudGFza05hbWUgfHwgdGhpcy5vcHRpb25zLm91dHB1dE5hbWV9IGlzIGJyZWFrIWApLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGxvY2tBc3NldERCKCkge1xyXG4gICAgICAgIC8vIFRPRE8g5omA5pyJ57G75Ly855qE5paw5rWB56iL77yM6YO95bqU6K+l6LWw57uf5LiA55qEIHJ1bkJ1aWxkVGFzayDlpITnkIbvvIzlkKbliJnlj6/og73ml6Dms5XkuK3mlq1cclxuICAgICAgICB0aGlzLnVwZGF0ZVByb2Nlc3MoJ1N0YXJ0IGxvY2sgYXNzZXQgZGIuLi4nKTtcclxuICAgICAgICBhd2FpdCBhc3NldERCTWFuYWdlci5wYXVzZSgnYnVpbGQnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdW5Mb2NrQXNzZXREQigpIHtcclxuICAgICAgICBhc3NldERCTWFuYWdlci5yZXN1bWUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlumihOiniCBzZXR0aW5ncyDkv6Hmga9cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIGdldFByZXZpZXdTZXR0aW5ncygpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLmluaXQoKTtcclxuICAgICAgICB0aGlzLnJlc3VsdC5zZXR0aW5ncy5lbmdpbmUuZW5naW5lTW9kdWxlcyA9IHRoaXMub3B0aW9ucy5pbmNsdWRlTW9kdWxlcztcclxuICAgICAgICBhd2FpdCB0aGlzLmluaXRCdW5kbGVNYW5hZ2VyKCk7XHJcbiAgICAgICAgLy8g5byA5aeL5omn6KGM6aKE5Yi25Lu75YqhXHJcbiAgICAgICAgYXdhaXQgdGhpcy5ydW5CdWlsZFRhc2soVGFza01hbmFnZXIuZ2V0QnVpbGRUYXNrKCdkYXRhVGFza3MnKSwgdGhpcy50YXNrTWFuYWdlci50YXNrV2VpZ2h0KTtcclxuICAgICAgICBhd2FpdCB0aGlzLnJ1bkJ1aWxkVGFzayhUYXNrTWFuYWdlci5nZXRCdWlsZFRhc2soJ3NldHRpbmdUYXNrcycpLCB0aGlzLnRhc2tNYW5hZ2VyLnRhc2tXZWlnaHQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdC5zZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIGluaXRPcHRpb25zKCkge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5wbGF0Zm9ybVR5cGUgPSBwbHVnaW5NYW5hZ2VyLnBsYXRmb3JtQ29uZmlnW3RoaXMub3B0aW9ucy5wbGF0Zm9ybV0ucGxhdGZvcm1UeXBlO1xyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRNZDVDYWNoZU9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGV4Y2x1ZGVzOiBbXSxcclxuICAgICAgICAgICAgaW5jbHVkZXM6IFtdLFxyXG4gICAgICAgICAgICByZXBsYWNlT25seTogW10sXHJcbiAgICAgICAgICAgIGhhbmRsZVRlbXBsYXRlTWQ1TGluazogZmFsc2UsXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMubWQ1Q2FjaGVPcHRpb25zID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0TWQ1Q2FjaGVPcHRpb25zLCB0aGlzLm9wdGlvbnMubWQ1Q2FjaGVPcHRpb25zIHx8IHt9KTtcclxuICAgICAgICBhd2FpdCBjaGVja1Byb2plY3RTZXR0aW5nKHRoaXMub3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIFRPRE8g5pSv5oyB5Lyg5Y+C55u05o6l5Lyg6YCSIHJlc29sdXRpb25cclxuICAgICAgICB0aGlzLm9wdGlvbnMucmVzb2x1dGlvbiA9IHtcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMub3B0aW9ucy5kZXNpZ25SZXNvbHV0aW9uLndpZHRoLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMub3B0aW9ucy5kZXNpZ25SZXNvbHV0aW9uLmhlaWdodCxcclxuICAgICAgICAgICAgcG9saWN5OiBSZXNvbHV0aW9uUG9saWN5LlNIT1dfQUxMLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc29sdXRpb24gPSB0aGlzLm9wdGlvbnMucmVzb2x1dGlvbjtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRlc2lnblJlc29sdXRpb24uZml0SGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVzaWduUmVzb2x1dGlvbi5maXRXaWR0aCkge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbi5wb2xpY3kgPSBSZXNvbHV0aW9uUG9saWN5LlNIT1dfQUxMO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbi5wb2xpY3kgPSBSZXNvbHV0aW9uUG9saWN5LkZJWEVEX0hFSUdIVDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVzaWduUmVzb2x1dGlvbi5maXRXaWR0aCkge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbi5wb2xpY3kgPSBSZXNvbHV0aW9uUG9saWN5LkZJWEVEX1dJRFRIO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbi5wb2xpY3kgPSBSZXNvbHV0aW9uUG9saWN5Lk5PX0JPUkRFUjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5aSE55CG6Ieq5a6a5LmJ566h57q/55qE55u45YWz6YC76L6R77yM6aG555uu6K6+572u5Lqk5LqS5bey5aSE55CG6L+H55qE5Li76KaB5piv5Li65LqG5Zy65pmv546v5aKD77yM5p6E5bu66ZyA6KaB5YaN5qyh56Gu6K6k77yM6YG/5YWN5qih5Z2X5pyJ5Ye65YWlXHJcbiAgICAgICAgY29uc3QgQ1VTVE9NX1BJUEVMSU5FX05BTUUgPSB0aGlzLm9wdGlvbnMubWFjcm9Db25maWcuQ1VTVE9NX1BJUEVMSU5FX05BTUU7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXN0b21QaXBlbGluZSkge1xyXG4gICAgICAgICAgICBjb25zdCBsZWdhY3lQaXBlbGluZUluZGV4ID0gdGhpcy5vcHRpb25zLmluY2x1ZGVNb2R1bGVzLmZpbmRJbmRleCgobW9kdWxlOiBzdHJpbmcpID0+IG1vZHVsZSA9PT0gJ2xlZ2FjeS1waXBlbGluZScpO1xyXG4gICAgICAgICAgICBpZiAobGVnYWN5UGlwZWxpbmVJbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pbmNsdWRlTW9kdWxlcy5zcGxpY2UobGVnYWN5UGlwZWxpbmVJbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgIXRoaXMub3B0aW9ucy5pbmNsdWRlTW9kdWxlcy5pbmNsdWRlcygnY3VzdG9tLXBpcGVsaW5lJykgJiYgdGhpcy5vcHRpb25zLmluY2x1ZGVNb2R1bGVzLnB1c2goJ2N1c3RvbS1waXBlbGluZScpO1xyXG4gICAgICAgICAgICAvLyDkvb/nlKjkuoblhoXnva7nrqHnur/nmoTmg4XlhrXkuIssIOa3u+WKoCBjdXN0b20tcGlwZWxpbmUtYnVpbHRpbi1zY3JpcHRzIOaooeWdl+aWueiDveaJk+WMheWvueW6lOeahOiEmuacrFxyXG4gICAgICAgICAgICBpZiAoQ1VTVE9NX1BJUEVMSU5FX05BTUUgPT09ICdCdWlsdGluJyB8fCAhQ1VTVE9NX1BJUEVMSU5FX05BTUUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pbmNsdWRlTW9kdWxlcy5wdXNoKCdjdXN0b20tcGlwZWxpbmUtYnVpbHRpbi1zY3JpcHRzJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBjdXN0b21QaXBlbGluZUluZGV4ID0gdGhpcy5vcHRpb25zLmluY2x1ZGVNb2R1bGVzLmZpbmRJbmRleCgobW9kdWxlOiBzdHJpbmcpID0+IG1vZHVsZSA9PT0gJ2N1c3RvbS1waXBlbGluZScpO1xyXG4gICAgICAgICAgICBpZiAoY3VzdG9tUGlwZWxpbmVJbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pbmNsdWRlTW9kdWxlcy5zcGxpY2UoY3VzdG9tUGlwZWxpbmVJbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgIXRoaXMub3B0aW9ucy5pbmNsdWRlTW9kdWxlcy5pbmNsdWRlcygnbGVnYWN5LXBpcGVsaW5lJykgJiYgdGhpcy5vcHRpb25zLmluY2x1ZGVNb2R1bGVzLnB1c2goJ2xlZ2FjeS1waXBlbGluZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnByZXZpZXcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9wdGlvbnMuYXBwVGVtcGxhdGVEYXRhID0ge1xyXG4gICAgICAgICAgICBkZWJ1Z01vZGU6IHRoaXMub3B0aW9ucy5kZWJ1ZyxcclxuICAgICAgICAgICAgcmVuZGVyTW9kZTogZmFsc2UsIC8vICEhb3B0aW9ucy5yZW5kZXJNb2RlLFxyXG4gICAgICAgICAgICBzaG93RlBTOiB0aGlzLm9wdGlvbnMuZGVidWcsXHJcbiAgICAgICAgICAgIHJlc29sdXRpb24sXHJcbiAgICAgICAgICAgIG1kNUNhY2hlOiB0aGlzLm9wdGlvbnMubWQ1Q2FjaGUsXHJcbiAgICAgICAgICAgIGNvY29zVGVtcGxhdGU6ICcnLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmJ1aWxkRW5naW5lUGFyYW0gPSB7XHJcbiAgICAgICAgICAgIGVudHJ5OiB0aGlzLm9wdGlvbnMuZW5naW5lSW5mby50eXBlc2NyaXB0LnBhdGgsXHJcbiAgICAgICAgICAgIGRlYnVnOiB0aGlzLm9wdGlvbnMuZGVidWcsXHJcbiAgICAgICAgICAgIG1hbmdsZVByb3BlcnRpZXM6IHRoaXMub3B0aW9ucy5tYW5nbGVQcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICBpbmxpbmVFbnVtOiB0aGlzLm9wdGlvbnMuaW5saW5lRW51bSxcclxuICAgICAgICAgICAgc291cmNlTWFwczogdGhpcy5vcHRpb25zLnNvdXJjZU1hcHMsXHJcbiAgICAgICAgICAgIGluY2x1ZGVNb2R1bGVzOiB0aGlzLm9wdGlvbnMuaW5jbHVkZU1vZHVsZXMsXHJcbiAgICAgICAgICAgIGVuZ2luZVZlcnNpb246IHRoaXMub3B0aW9ucy5lbmdpbmVJbmZvLnZlcnNpb24sXHJcbiAgICAgICAgICAgIC8vIOWPguS4juW9seWTjeW8leaTjuWkjeeUqOinhOWImeeahOWPguaVsCBrZXlcclxuICAgICAgICAgICAgbWQ1TWFwOiBbXSxcclxuICAgICAgICAgICAgZW5naW5lTmFtZTogJ2NvY29zLWpzJyxcclxuICAgICAgICAgICAgb3V0cHV0OiBqb2luKHRoaXMucmVzdWx0LnBhdGhzLmRpciwgJ2NvY29zLWpzJyksXHJcbiAgICAgICAgICAgIHBsYXRmb3JtVHlwZTogdGhpcy5vcHRpb25zLnBsYXRmb3JtVHlwZSxcclxuICAgICAgICAgICAgdXNlQ2FjaGU6IHRoaXMub3B0aW9ucy51c2VDYWNoZUNvbmZpZz8uZW5naW5lID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmF0aXZlQ29kZUJ1bmRsZU1vZGU6IHRoaXMub3B0aW9ucy5uYXRpdmVDb2RlQnVuZGxlTW9kZSxcclxuICAgICAgICAgICAgd2FzbUNvbXByZXNzaW9uTW9kZTogdGhpcy5vcHRpb25zLndhc21Db21wcmVzc2lvbk1vZGUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0gPSB7XHJcbiAgICAgICAgICAgIGV4cGVyaW1lbnRhbEVyYXNlTW9kdWxlczogdGhpcy5vcHRpb25zLmV4cGVyaW1lbnRhbEVyYXNlTW9kdWxlcyxcclxuICAgICAgICAgICAgb3V0cHV0TmFtZTogJ3Byb2plY3QnLFxyXG4gICAgICAgICAgICBmbGFnczoge1xyXG4gICAgICAgICAgICAgICAgREVCVUc6ICEhdGhpcy5vcHRpb25zLmRlYnVnLFxyXG4gICAgICAgICAgICAgICAgLi4udGhpcy5vcHRpb25zLmZsYWdzLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwb2x5ZmlsbHM6IHRoaXMub3B0aW9ucy5wb2x5ZmlsbHMsXHJcbiAgICAgICAgICAgIGhvdE1vZHVsZVJlbG9hZDogZmFsc2UsXHJcbiAgICAgICAgICAgIHBsYXRmb3JtOiB0aGlzLm9wdGlvbnMucGxhdGZvcm1UeXBlLFxyXG4gICAgICAgICAgICBjb21tb25EaXI6ICcnLFxyXG4gICAgICAgICAgICBidW5kbGVDb21tb25DaHVuazogdGhpcy5vcHRpb25zLmJ1bmRsZUNvbW1vbkNodW5rID8/IGZhbHNlLFxyXG4gICAgICAgICAgICB0YXJnZXRzOiB0aGlzLm9wdGlvbnMuYnVpbGRTY3JpcHRUYXJnZXRzLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucG9seWZpbGxzKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wb2x5ZmlsbHMudGFyZ2V0cyA9IHRoaXMub3B0aW9ucy5idWlsZFNjcmlwdFRhcmdldHM7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnBvbHlmaWxscyA9IHtcclxuICAgICAgICAgICAgICAgIHRhcmdldHM6IHRoaXMub3B0aW9ucy5idWlsZFNjcmlwdFRhcmdldHMsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm9wdGlvbnMuYXNzZXRTZXJpYWxpemVPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAnY2MuRWZmZWN0QXNzZXQnOiB7XHJcbiAgICAgICAgICAgICAgICBnbHNsMTogdGhpcy5vcHRpb25zLmluY2x1ZGVNb2R1bGVzLmluY2x1ZGVzKCdnZngtd2ViZ2wnKSxcclxuICAgICAgICAgICAgICAgIGdsc2wzOiB0aGlzLm9wdGlvbnMuaW5jbHVkZU1vZHVsZXMuaW5jbHVkZXMoJ2dmeC13ZWJnbDInKSxcclxuICAgICAgICAgICAgICAgIGdsc2w0OiBmYWxzZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmJ1aWxkRXhpdFJlcy5kZXN0ID0gdGhpcy5yZXN1bHQucGF0aHMuZGlyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5omn6KGM5p+Q5Liq5Lu75Yqh5YiX6KGoXHJcbiAgICAgKiBAcGFyYW0gYnVpbGRUYXNrcyDku7vliqHliJfooajmlbDnu4RcclxuICAgICAqIEBwYXJhbSB3ZWlnaHQg5YWo6YOo5Lu75Yqh5YiX6KGo5omA5Y2g5p2D6YeNXHJcbiAgICAgKiBAcGFyYW0gYXJncyDpnIDopoHkvKDpgJLnu5nku7vliqHnmoTlhbbku5blj4LmlbBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBydW5CdWlsZFRhc2soYnVpbGRUYXNrczogSUJ1aWxkVGFza1tdLCB3ZWlnaHQ6IG51bWJlciwgLi4uYXJnczogYW55KSB7XHJcbiAgICAgICAgd2VpZ2h0ID0gdGhpcy5tYWluVGFza1dlaWdodCAqIHdlaWdodCAvIGJ1aWxkVGFza3MubGVuZ3RoO1xyXG4gICAgICAgIC8vIOW8gOWni+aJp+ihjOmihOWItuS7u+WKoVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnVpbGRUYXNrcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKHRoaXMuZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHRhc2sgPSBidWlsZFRhc2tzW2ldO1xyXG4gICAgICAgICAgICBjb25zdCB0YXNrVGl0bGUgPSBhd2FpdCB0cmFuc1RpdGxlKHRhc2sudGl0bGUpO1xyXG4gICAgICAgICAgICBjb25zdCB0cmlja1RpbWVMYWJlbCA9IGAvLyAtLS0tIGJ1aWxkIHRhc2sgJHt0YXNrVGl0bGV9IC0tLS1gO1xyXG4gICAgICAgICAgICBuZXdDb25zb2xlLnRyYWNrVGltZVN0YXJ0KHRyaWNrVGltZUxhYmVsKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVQcm9jZXNzKHRhc2tUaXRsZSArICcgc3RhcnQnKTtcclxuICAgICAgICAgICAgY29uc29sZS5kZWJ1Zyh0cmlja1RpbWVMYWJlbCk7XHJcbiAgICAgICAgICAgIG5ld0NvbnNvbGUudHJhY2tNZW1vcnlTdGFydCh0YXNrVGl0bGUpO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGFzay5oYW5kbGUuY2FsbCh0aGlzLCB0aGlzLm9wdGlvbnMsIHRoaXMucmVzdWx0LCB0aGlzLmNhY2hlLCAuLi5hcmdzKTtcclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIHRhc2submFtZSAmJiByZXN1bHQgJiYgKHRoaXMudGFza1Jlc01hcFt0YXNrLm5hbWVdID0gcmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWUgPSBhd2FpdCBuZXdDb25zb2xlLnRyYWNrVGltZUVuZCh0cmlja1RpbWVMYWJlbCwgeyBvdXRwdXQ6IHRydWUgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVByb2Nlc3MoYHJ1biBidWlsZCB0YXNrICR7dGFza1RpdGxlfSBzdWNjZXNzIGluICR7Zm9ybWF0TVNUaW1lKHRpbWUpfeKImmAsIHdlaWdodCwgJ2xvZycpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBuZXdDb25zb2xlLnRyYWNrTWVtb3J5RW5kKHRhc2tUaXRsZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVByb2Nlc3MoYHJ1biBidWlsZCB0YXNrICR7dGFza1RpdGxlfSBmYWlsZWQhYCwgd2VpZ2h0LCAnZXJyb3InKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMub25FcnJvcihlcnJvciwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV3Q29uc29sZS50cmFja01lbW9yeUVuZCh0YXNrVGl0bGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBoYW5kbGVIb29rKGZ1bmM6IEZ1bmN0aW9uLCBpbnRlcm5hbDogYm9vbGVhbiwgLi4uYXJnczogYW55W10pIHtcclxuICAgICAgICBpZiAoaW50ZXJuYWwpIHtcclxuICAgICAgICAgICAgYXdhaXQgZnVuYy5jYWxsKHRoaXMsIHRoaXMub3B0aW9ucywgdGhpcy5yZXN1bHQsIHRoaXMuY2FjaGUsIC4uLmFyZ3MpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGF3YWl0IGZ1bmModGhpcy5yZXN1bHQucmF3T3B0aW9ucywgdGhpcy5idWlsZFJlc3VsdCwgLi4uYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uRXJyb3IoZXJyb3I6IEVycm9yLCB0aHJvd0Vycm9yID0gdHJ1ZSkge1xyXG4gICAgICAgIHRoaXMuZXJyb3IgPSBlcnJvcjtcclxuICAgICAgICB0aGlzLmJ1bmRsZU1hbmFnZXIgJiYgKHRoaXMuYnVuZGxlTWFuYWdlci5lcnJvciA9IGVycm9yKTtcclxuICAgICAgICBpZiAodGhyb3dFcnJvcikge1xyXG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcnVuRXJyb3JIb29rKCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZ1bmNOYW1lID0gJ29uRXJyb3InO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBrZ05hbWUgb2YgdGhpcy5ob29rc0luZm8ucGtnTmFtZU9yZGVyKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmZvID0gdGhpcy5ob29rc0luZm8uaW5mb3NbcGtnTmFtZV07XHJcbiAgICAgICAgICAgICAgICBsZXQgaG9va3M6IGFueTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVMYWJlbCA9IGAke3BrZ05hbWV9Oigke2Z1bmNOYW1lfSlgO1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBob29rcyA9IFV0aWxzLkZpbGUucmVxdWlyZUZpbGUoaW5mby5wYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaG9va3NbZnVuY05hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUHJvY2VzcyhgJHt0aW1lTGFiZWx9IHN0YXJ0Li4uYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYC8vIC0tLS0gJHtwa2dOYW1lfTooJHtmdW5jTmFtZX0pIC0tLS1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q29uc29sZS50cmFja01lbW9yeVN0YXJ0KHRpbWVMYWJlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLmludGVybmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBob29rc1tmdW5jTmFtZV0uY2FsbCh0aGlzLCB0aGlzLm9wdGlvbnMsIHRoaXMucmVzdWx0LCB0aGlzLmNhY2hlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGhvb2tzW2Z1bmNOYW1lXSh0aGlzLnJlc3VsdC5yYXdPcHRpb25zLCB0aGlzLmJ1aWxkUmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdDb25zb2xlLnRyYWNrTWVtb3J5RW5kKHRpbWVMYWJlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYC8vIC0tLS0gJHtwa2dOYW1lfTooJHtmdW5jTmFtZX0pIHN1Y2Nlc3MgLS0tLWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVByb2Nlc3MoYCR7cGtnTmFtZX06KCR7ZnVuY05hbWV9KWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXdDb25zb2xlLnRyYWNrTWVtb3J5RW5kKHRpbWVMYWJlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoKG5ldyBCdWlsZEVycm9yKGBSdW4gYnVpbGQgcGx1Z2luICR7cGtnTmFtZX06KCR7ZnVuY05hbWV9KSBmYWlsZWQhYCkpLnN0YWNrKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBvc3RCdWlsZCgpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOe/u+ivkSB0aXRsZVxyXG4gKiBAcGFyYW0gdGl0bGUg5Y6f5aeLIHRpdGxlIOaIluiAheW4puaciSBpMThuIOW8gOWktOeahCB0aXRsZVxyXG4gKi9cclxuZnVuY3Rpb24gdHJhbnNUaXRsZSh0aXRsZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmICh0eXBlb2YgdGl0bGUgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG4gICAgaWYgKHRpdGxlLnN0YXJ0c1dpdGgoJ2kxOG46JykpIHtcclxuICAgICAgICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UoJ2kxOG46JywgJycpO1xyXG4gICAgICAgIGNvbnN0IHJlcyA9IGkxOG4udCh0aXRsZSBhcyBJMThuS2V5cyk7XHJcbiAgICAgICAgaWYgKHJlcyA9PT0gdGl0bGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgJHt0aXRsZX0gaXMgbm90IGRlZmluZWQgaW4gaTE4bmApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzIHx8IHRpdGxlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRpdGxlO1xyXG59XHJcblxyXG5jbGFzcyBCdWlsZEVycm9yIHtcclxuICAgIG1lc3NhZ2U6IHN0cmluZztcclxuICAgIGNvbnN0cnVjdG9yKG1zZzogc3RyaW5nKSB7XHJcbiAgICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgQnVpbGRFcnJvcik7XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbXNnO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==