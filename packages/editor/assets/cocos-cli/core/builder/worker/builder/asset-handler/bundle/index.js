"use strict";
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
exports.BundleManager = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const bundle_1 = require("./bundle");
const texture_compress_1 = require("./texture-compress");
const pac_1 = require("./pac");
const cconb_1 = require("../../utils/cconb");
const script_1 = require("../script");
const bundle_utils_1 = require("../../../../share/bundle-utils");
const asset_library_1 = require("../../manager/asset-library");
const asset_1 = require("../../manager/asset");
const utils_1 = require("../../utils");
const json_group_1 = require("./json-group");
const utils_2 = require("../../../../share/utils");
const task_base_1 = require("../../manager/task-base");
const utils_3 = require("../../../../share/utils");
const bin_group_1 = require("./bin-group");
const console_1 = require("../../../../../base/console");
const i18n_1 = __importDefault(require("../../../../../base/i18n"));
const plugin_1 = require("../../../../manager/plugin");
const utils_4 = __importDefault(require("../../../../../base/utils"));
const scripting_1 = __importDefault(require("../../../../../scripting"));
const builder_config_1 = __importDefault(require("../../../../share/builder-config"));
const query_1 = __importDefault(require("../../../../../assets/manager/query"));
const global_1 = require("../../../../share/global");
const { MAIN, START_SCENE, INTERNAL, RESOURCES } = bundle_utils_1.BuiltinBundleName;
// 只 Bundle 构建时，可走此类的生成执行函数
class BundleManager extends task_base_1.BuildTaskBase {
    static BuiltinBundleName = bundle_utils_1.BuiltinBundleName;
    static BundleConfigs = {};
    _task;
    options;
    destDir;
    hooksInfo;
    bundleMap = {};
    bundles = [];
    _pacAssets = [];
    // 按照优先级排序过的 bundle 数组
    _bundleGroupInPriority;
    // 纹理压缩管理器
    imageCompressManager;
    scriptBuilder;
    packResults = [];
    cache;
    hookMap = {
        onBeforeBundleInit: 'onBeforeBundleInit',
        onAfterBundleInit: 'onAfterBundleInit',
        onBeforeBundleDataTask: 'onBeforeBundleDataTask',
        onAfterBundleDataTask: 'onAfterBundleDataTask',
        onBeforeBundleBuildTask: 'onBeforeBundleBuildTask',
        onAfterBundleBuildTask: 'onAfterBundleBuildTask',
    };
    // 执行整个构建流程的顺序流程
    pipeline = [
        this.initOptions,
        this.hookMap.onBeforeBundleInit,
        this.initBundle,
        this.hookMap.onAfterBundleInit,
        this.hookMap.onBeforeBundleDataTask,
        this.initAsset,
        this.bundleDataTask,
        this.hookMap.onAfterBundleDataTask,
        this.hookMap.onBeforeBundleBuildTask,
        this.clearBundleDest,
        this.buildScript,
        this.buildAsset,
        this.hookMap.onAfterBundleBuildTask,
        this.outputBundle,
    ];
    get bundleGroupInPriority() {
        if (this._bundleGroupInPriority) {
            return this._bundleGroupInPriority;
        }
        // bundle 按优先级分组
        let bundleGroupInPriority = new Array(21);
        this.bundles.forEach((bundle) => {
            if (!bundleGroupInPriority[bundle.priority - 1]) {
                bundleGroupInPriority[bundle.priority - 1] = [];
            }
            bundleGroupInPriority[bundle.priority - 1].push(bundle);
        });
        bundleGroupInPriority = bundleGroupInPriority.filter((group) => group).reverse();
        this._bundleGroupInPriority = bundleGroupInPriority;
        return bundleGroupInPriority;
    }
    static internalBundlePriority = {
        [MAIN]: 7,
        [START_SCENE]: 20,
        [INTERNAL]: 21,
        [RESOURCES]: 8,
    };
    constructor(options, imageCompressManager, task) {
        super(options.taskId, 'Bundle Task');
        // @ts-ignore TODO 补全 options 为 IInternalBundleBuildOptions
        this.options = options;
        if (imageCompressManager) {
            this.imageCompressManager = imageCompressManager;
            imageCompressManager.on('update-progress', (message) => {
                this.updateProcess(message);
            });
        }
        this._task = task;
        this.destDir = this.options.dest && utils_4.default.Path.resolveToRaw(this.options.dest) || (0, path_1.join)(builder_config_1.default.projectRoot, 'build', 'assetBundle');
        this.scriptBuilder = new script_1.ScriptBuilder();
        // @ts-ignore
        this.cache = task ? task.cache : new asset_1.BuilderAssetCache();
        this.hooksInfo = task ? task.hooksInfo : plugin_1.pluginManager.getHooksInfo(this.options.platform);
    }
    static async create(options, task) {
        if (!options.skipCompressTexture) {
            const { TextureCompress } = await Promise.resolve().then(() => __importStar(require('../texture-compress')));
            const imageCompressManager = new TextureCompress(options.platform, options.useCacheConfig?.textureCompress);
            return new BundleManager(options, imageCompressManager, task);
        }
        return new BundleManager(options, null, task);
    }
    async loadScript(scriptUuids, pluginScripts) {
        if (this.options.preview) {
            return;
        }
        await scripting_1.default.loadScript(scriptUuids, pluginScripts);
    }
    /**
     * 初始化项目设置的一些 bundle 配置信息
     */
    static async initStaticBundleConfig() {
        const bundleConfig = (await builder_config_1.default.getProject('bundleConfig.custom')) || {};
        if (!bundleConfig.default) {
            bundleConfig.default = bundle_utils_1.DefaultBundleConfig;
        }
        const res = {};
        Object.keys(bundleConfig).forEach((ID) => {
            const configs = bundleConfig[ID].configs;
            res[ID] = {};
            Object.keys(configs).forEach((platformType) => {
                const platformOption = (0, bundle_utils_1.transformPlatformSettings)(configs[platformType], plugin_1.pluginManager.bundleConfigs);
                Object.assign(res[ID], platformOption);
            });
        });
        BundleManager.BundleConfigs = res;
    }
    getUserConfig(ID = 'default') {
        const configMap = BundleManager.BundleConfigs[ID];
        if (!configMap) {
            return null;
        }
        return configMap[this.options.platform];
    }
    /**
     * 对 options 上的数据做补全处理
     */
    async initOptions() {
        this.options.platformType = plugin_1.pluginManager.platformConfig[this.options.platform].platformType;
        this.options.buildScriptParam = {
            experimentalEraseModules: this.options.experimentalEraseModules,
            outputName: 'project',
            flags: {
                DEBUG: !!this.options.debug,
                ...this.options.flags,
            },
            polyfills: this.options.polyfills,
            hotModuleReload: false,
            platform: this.options.platformType || 'INVALID_PLATFORM', // v3.8.6 开始 ccbuild 支持 'INVALID_PLATFORM' 表示无效平台，防止之前初始化为 'HTML5' 后，平台插件忘记覆盖 platform 参数导致走 'HTML5' 的引擎打包流程导致的较难排查的问题
            commonDir: '',
            bundleCommonChunk: this.options.bundleCommonChunk ?? false,
        };
        this.options.assetSerializeOptions = {
            'cc.EffectAsset': {
                glsl1: this.options.includeModules.includes('gfx-webgl'),
                glsl3: this.options.includeModules.includes('gfx-webgl2'),
                glsl4: false,
            },
        };
    }
    clearBundleDest() {
        this.bundles.forEach((bundle) => {
            if (bundle.output) {
                (0, fs_extra_1.emptyDirSync)(bundle.dest);
            }
        });
    }
    /**
     * 初始化整理资源列表
     */
    async initAsset() {
        await this.initBundleRootAssets();
        // 需要在 this.cache 初始化后之后执行
        await this.loadScript(this.cache.scriptUuids, query_1.default.querySortedPlugins());
        await this.initBundleShareAssets();
        await this.initBundleConfig();
    }
    async initBundleConfig() {
        for (const bundle of this.bundles) {
            // TODO 废弃 bundle 的 config 结构，输出 config 时即时整理即可
            // 此处的整理实际上仅为预览服务
            bundle.initConfig();
            if (this.options.preview) {
                await bundle.initAssetPaths();
            }
        }
    }
    async buildAsset() {
        // 先自动图集再纹理压缩
        await this.packImage();
        await this.compressImage();
        await this.outputAssets();
    }
    /**
     * 独立构建 Bundle 时调用
     * @returns
     */
    async run() {
        // 独立构建 Bundle 时，不能抽取公共脚本到 src
        this.options.bundleCommonChunk = true;
        await this.runAllTask();
        return true;
    }
    async outputBundle() {
        this.updateProcess('Output asset in bundles start');
        await Promise.all(this.bundles.map(async (bundle) => {
            if (!bundle.output) {
                return;
            }
            await bundle.build();
        }));
        this.updateProcess('Output asset in bundles success');
    }
    addBundle(options) {
        if (this.bundleMap[options.name]) {
            const newName = options.name + Date.now();
            // Bundle 重名会导致脚本内动态加载出错，需要及时提示
            console.error(i18n_1.default.t('builder.asset_bundle.duplicate_name_messaged_auto_rename', {
                name: options.name,
                newName,
                url: this.bundleMap[options.name].root,
                newUrl: options.root,
            }));
            options.name = newName;
        }
        this.bundleMap[options.name] = new bundle_1.Bundle(options);
    }
    getDefaultBundleConfig(name) {
        const dest = (0, path_1.join)(this.destDir, name);
        const defaultPriority = BundleManager.internalBundlePriority[name];
        return {
            name,
            dest,
            root: '',
            scriptDest: (0, path_1.join)(dest, global_1.BuildGlobalInfo.SCRIPT_NAME),
            priority: defaultPriority || 1,
            compressionType: bundle_utils_1.BundleCompressionTypes.MERGE_DEP,
            isRemote: false,
            md5Cache: this.options.md5Cache,
            debug: this.options.debug,
        };
    }
    /**
     * 根据参数初始化一些信息配置，整理所有的 bundle 分组信息
     */
    async initBundle() {
        await BundleManager.initStaticBundleConfig();
        const options = this.options;
        const cocosBundles = [MAIN, START_SCENE, INTERNAL];
        const internalBundleConfigMap = {};
        this.updateProcess('Init all bundles start...');
        const bundleAssets = await asset_library_1.buildAssetLibrary.queryAssetsByOptions({ isBundle: true });
        options.bundleConfigs = options.bundleConfigs || [];
        // 整理所有的 bundle 信息
        if (options.bundleConfigs.length) {
            options.bundleConfigs.forEach((customConfig) => {
                if (cocosBundles.includes(customConfig.name)) {
                    internalBundleConfigMap[customConfig.name] = customConfig;
                    return;
                }
                const config = this.patchProjectBundleConfig(customConfig);
                if (!config) {
                    console.warn('Invalid bundle config: ', customConfig);
                    return;
                }
                this.addBundle(config);
            });
        }
        const otherBundleOutput = options.bundleConfigs.length ? false : (this._task ? true : false);
        if (!options.buildBundleOnly) {
            // 非只 Bundle 构建模式下，需要补全其他项目内存在的 bundle 信息
            bundleAssets.forEach((assetInfo) => {
                const config = this.patchProjectBundleConfig({
                    root: assetInfo.url,
                    name: '',
                });
                if (!config || this.bundleMap[config.name]) {
                    return;
                }
                config.output = otherBundleOutput;
                this.addBundle(config);
            });
        }
        // 正常构建模式，或者仅构建 Bundle 模式有内置 Bundle 的自定义配置才自动补全
        if (!options.buildBundleOnly || Object.keys(internalBundleConfigMap).length) {
            // 检查填充编辑器内置 Bundle
            this.initInternalBundleConfigs(internalBundleConfigMap);
        }
        this.bundles = Object.values(this.bundleMap).sort((bundleA, bundleB) => {
            return (bundleB.priority - bundleA.priority) || (0, utils_3.compareUUID)(bundleA.name, bundleB.name);
        });
        // 存在 bundleConfigs 时，如果循环完没有获取到任何 bundle 则代表配置有误，需要报错中断
        if (!this.bundles.length) {
            throw new Error('Invalid bundle config, please check your bundle config');
        }
        this.updateProcess(`Num of bundles: ${this.bundles.length}...`);
    }
    /**
     * 初始化内置 Bundle（由于一些历史的 bundle 行为配置，内置 Bundle 的配置需要单独处理）
     */
    initInternalBundleConfigs(internalBundleConfigMap) {
        // 注意顺序，START_SCENE, INTERNAL 的默认配置会取自 MAIN 的配置
        const cocosBundles = [MAIN, START_SCENE, INTERNAL];
        const output = this.options.buildBundleOnly ? false : true;
        cocosBundles.forEach((name) => {
            if (name === START_SCENE && !this.options.startSceneAssetBundle && !internalBundleConfigMap[name]) {
                return;
            }
            if (this.options.buildBundleOnly && !internalBundleConfigMap[name]) {
                return;
            }
            let config = this.getDefaultBundleConfig(name);
            const customConfig = internalBundleConfigMap[name] || { name };
            config = (0, utils_2.defaultsDeep)(Object.assign({}, customConfig), config);
            // 整理后的数据，其他内置 Bundle 可能会再次使用，需要存到 internalBundleConfigMap
            internalBundleConfigMap[name] = config;
            config.output = customConfig.output ?? output;
            if (customConfig.name === MAIN) {
                const isRemote = this.options.mainBundleIsRemote;
                // 如未配置远程服务器地址，取消主包的远程包配置，需要导出的 bundle 才警告
                if (customConfig.output && isRemote && !this.options.server && !this.options.preview) {
                    console.warn(i18n_1.default.t('builder.warn.asset_bundle_is_remote_invalid', {
                        directoryName: 'main',
                    }));
                }
                config.isRemote = customConfig.isRemote || isRemote;
                config.compressionType = customConfig.compressionType || this.options.mainBundleCompressionType;
            }
            else {
                // START_SCENE, INTERNAL 的默认配置是根据实际的项目经验设定的一套规则
                config.isRemote = !!(customConfig.isRemote ?? (this.options.startSceneAssetBundle ? false : internalBundleConfigMap[MAIN].isRemote));
                if (!customConfig.compressionType) {
                    config.compressionType = (this.options.startSceneAssetBundle || internalBundleConfigMap[MAIN].compressionType === bundle_utils_1.BundleCompressionTypes.MERGE_DEP) ?
                        bundle_utils_1.BundleCompressionTypes.MERGE_ALL_JSON : internalBundleConfigMap[MAIN].compressionType;
                }
            }
            // TODO 提取以及单元测试，后续此配置还会调整，临时处理
            if (!customConfig.dest && config.compressionType === 'subpackage') {
                config.dest = (0, path_1.join)((0, path_1.dirname)(this.destDir), global_1.BuildGlobalInfo.SUBPACKAGES_HEADER, config.name);
                config.scriptDest = (0, path_1.join)(config.dest, global_1.BuildGlobalInfo.SCRIPT_NAME);
            }
            else if (!customConfig.dest) {
                config.dest = config.isRemote ? (0, path_1.join)((0, path_1.dirname)(this.destDir), global_1.BuildGlobalInfo.REMOTE_HEADER, config.name) : (0, path_1.join)(this.destDir, config.name);
                config.scriptDest = (0, path_1.join)(config.dest, global_1.BuildGlobalInfo.SCRIPT_NAME);
            }
            if ((this.options.moveRemoteBundleScript && config.isRemote) && !customConfig.scriptDest) {
                config.scriptDest = this._task ? (0, path_1.join)(this._task.result.paths.bundleScripts, config.name, global_1.BuildGlobalInfo.SCRIPT_NAME) : (0, path_1.join)(config.dest, global_1.BuildGlobalInfo.SCRIPT_NAME);
            }
            this.addBundle(config);
        });
    }
    /**
     * 填充成完整可用的项目 Bundle 配置（传入自定义配置 > Bundle 文件夹配置 > 默认配置）
     * @param customConfig
     * @returns IBundleInitOptions | null
     */
    patchProjectBundleConfig(customConfig) {
        // 非内置 Bundle 的配置必须填写 root 选项
        if (!customConfig.root) {
            console.debug(`Invalid Bundle config with bundle root:${customConfig.root}`);
            return null;
        }
        const uuid = asset_library_1.buildAssetLibrary.url2uuid(customConfig.root);
        if (!uuid) {
            console.debug(`Invalid Bundle config with bundle ${customConfig.root}`);
            return null;
        }
        const assetInfo = asset_library_1.buildAssetLibrary.getAsset(uuid);
        if (!assetInfo) {
            console.debug(`Invalid Bundle config with bundle ${customConfig.root}`);
            return null;
        }
        const { bundleFilterConfig, priority, bundleConfigID, bundleName } = assetInfo.meta.userData;
        const name = customConfig.name || bundleName || (0, bundle_utils_1.getBundleDefaultName)(assetInfo);
        const userBundleConfig = this.getUserConfig(bundleConfigID);
        let config = this.getDefaultBundleConfig(name);
        const validCustomConfig = (0, utils_2.defaultsDeep)({
            compressionType: userBundleConfig && userBundleConfig.compressionType,
            isRemote: userBundleConfig && userBundleConfig.isRemote,
            priority,
            bundleFilterConfig,
            name,
        }, customConfig);
        config = (0, utils_2.defaultsDeep)(validCustomConfig, config);
        if (!userBundleConfig) {
            console.warn(`Invalid Bundle config ID ${bundleConfigID} in bundle ${customConfig.root}, the bundle config will use the default config ${JSON.stringify(config)}`);
        }
        // 未配置远程服务器地址，给用户警告提示
        if (config.isRemote && !this.options.server && !this.options.preview) {
            console.warn(i18n_1.default.t('builder.warn.asset_bundle_is_remote_invalid', {
                directoryName: name,
            }));
        }
        // TODO 提取以及单元测试，后续此配置还会调整，临时处理
        if (!customConfig.dest && config.compressionType === 'subpackage' && !this.options.buildBundleOnly) {
            config.dest = (0, path_1.join)((0, path_1.dirname)(this.destDir), global_1.BuildGlobalInfo.SUBPACKAGES_HEADER, config.name);
            config.scriptDest = (0, path_1.join)(config.dest, global_1.BuildGlobalInfo.SCRIPT_NAME);
        }
        else if (!customConfig.dest && config.isRemote && !this.options.buildBundleOnly) {
            config.dest = (0, path_1.join)((0, path_1.dirname)(this.destDir), global_1.BuildGlobalInfo.REMOTE_HEADER, config.name);
            config.scriptDest = (0, path_1.join)(config.dest, global_1.BuildGlobalInfo.SCRIPT_NAME);
        }
        if ((this.options.moveRemoteBundleScript && config.isRemote) && !customConfig.scriptDest) {
            config.scriptDest = this._task ? (0, path_1.join)(this._task.result.paths.bundleScripts, config.name, global_1.BuildGlobalInfo.SCRIPT_NAME) : (0, path_1.join)(config.dest, global_1.BuildGlobalInfo.SCRIPT_NAME);
        }
        return config;
    }
    /**
     * 初始化 bundle 分组内的根资源信息
     * 初始化 bundle 内的各项不同的处理任务
     */
    async initBundleRootAssets() {
        this.updateProcess('Init bundle root assets start...');
        if (this.bundleMap[INTERNAL]) {
            const internalAssets = await queryPreloadAssetList(this.options.includeModules, this.options.engineInfo.typescript.path);
            // 添加引擎依赖的预加载内置资源/脚本到 internal 包内
            console.debug(`Query preload assets/scripts from cc.config.json`);
            internalAssets.forEach((uuid) => {
                this.bundleMap[INTERNAL].addRootAsset(asset_library_1.buildAssetLibrary.getAsset(uuid));
            });
        }
        const launchBundle = this.bundleMap[START_SCENE] || this.bundleMap[MAIN];
        const assets = asset_library_1.buildAssetLibrary.assets;
        for (let i = 0; i < assets.length; i++) {
            const assetInfo = assets[i];
            if (assetInfo.isDirectory()) {
                continue;
            }
            const assetType = asset_library_1.buildAssetLibrary.getAssetProperty(assetInfo, 'type');
            this.cache.addAsset(assetInfo, assetType);
            let bundleWithAsset = this.bundles.find((bundle) => assetInfo.url.startsWith(bundle.root + '/'));
            // 不在 Bundle 内的脚本默认加到启动 bundle 内
            if (assetType === 'cc.Script') {
                if (assetInfo.url.startsWith('db://internal')) {
                    // internal db 下的脚本，不全量构建，以 dependentScripts 为准
                    continue;
                }
                bundleWithAsset = bundleWithAsset || launchBundle;
                if (bundleWithAsset) {
                    bundleWithAsset.addScript(assetInfo);
                }
                continue;
            }
            // 场景作为特殊资源管理: 只要包含在 bundle 内默认参与构建 > 没有指定 scenes 的情况下默认参与 > 指定 scenes 按照此名单
            if (assetType === 'cc.SceneAsset' && (bundleWithAsset || !this.options.scenes || this.options.scenes.find(item => item.uuid === assetInfo.uuid))) {
                // 初始场景加入到初始场景 bundle 内
                if (launchBundle && this.options.startScene === assetInfo.uuid) {
                    launchBundle.addRootAsset(assetInfo);
                    continue;
                }
                if (bundleWithAsset) {
                    bundleWithAsset.addRootAsset(assetInfo);
                }
                else {
                    // 不在 bundle 内的其他场景，放入主包，由于支持 bundle 剔除，main bundle 可能不存在
                    this.bundleMap[MAIN] && this.bundleMap[MAIN].addRootAsset(assetInfo);
                }
                continue;
            }
            if (assetInfo.source.endsWith('.pac')) {
                this._pacAssets.push(assetInfo.uuid);
            }
            if (bundleWithAsset && assetType !== 'cc.SceneAsset') {
                bundleWithAsset.addRootAsset(assetInfo);
                continue;
            }
        }
        if (launchBundle) {
            // 加入项目设置中的 renderPipeline 资源
            if (this.options.renderPipeline) {
                launchBundle.addRootAsset(asset_library_1.buildAssetLibrary.getAsset(this.options.renderPipeline));
            }
            // 加入项目设置中的物理材质
            if (this.options.physicsConfig.defaultMaterial) {
                const asset = asset_library_1.buildAssetLibrary.getAsset(this.options.physicsConfig.defaultMaterial);
                launchBundle.addRootAsset(asset);
            }
        }
        console.debug(`  Number of all scenes: ${this.cache.scenes.length}`);
        console.debug(`  Number of all scripts: ${this.cache.scriptUuids.length}`);
        console.debug(`  Number of other assets: ${this.cache.assetUuids.length}`);
        this.updateProcess('Init bundle root assets success...');
    }
    /**
     * 按照 Bundle 优先级整理 Bundle 的资源列表
     */
    async initBundleShareAssets() {
        // 预览无需根据优先级分析共享资源，预览本身就是按需加载的，不需要提前整理完整的 bundle 资源列表
        if (this.options.preview) {
            return;
        }
        this.updateProcess('Init bundle share assets start...');
        // 处理共享资源
        const sharedAssets = {};
        const manager = this;
        async function walkDepend(uuid, bundle, checked, fatherUuid) {
            if (checked.has(uuid)) {
                return;
            }
            const asset = asset_library_1.buildAssetLibrary.getAsset(uuid);
            if (!asset) {
                if (fatherUuid) {
                    // const fatherAsset = buildAssetLibrary.getAsset(fatherUuid);
                    // console.warn(i18n.t('builder.error.required_asset_missing', {
                    //     uuid: `{asset(${uuid})}`,
                    //     fatherUrl: `{asset(${fatherAsset.url})}`,
                    // }));
                }
                else {
                    console.warn(i18n_1.default.t('builder.error.missing_asset', {
                        uuid: `{asset(${uuid})}`,
                    }));
                }
                return;
            }
            checked.add(uuid);
            bundle.addAsset(asset);
            if ((0, cconb_1.hasCCONFormatAssetInLibrary)(asset)) {
                // TODO 需要优化流程，后续可能被 removeAsset
                const cconExtension = (0, cconb_1.getDesiredCCONExtensionMap)(manager.options.assetSerializeOptions);
                (bundle.config.extensionMap[cconExtension] ??= []).push(asset.uuid);
            }
            if (sharedAssets[uuid]) {
                bundle.addRedirect(uuid, sharedAssets[uuid]);
                return;
            }
            const depends = await asset_library_1.buildAssetLibrary.getDependUuids(uuid);
            await Promise.all(depends.map(async (dependUuid) => {
                return await walkDepend(dependUuid, bundle, checked, uuid);
            }));
        }
        const bundleGroupInPriority = this.bundleGroupInPriority;
        // 递归处理所有 bundle 中场景与根资源
        for (const bundleGroup of bundleGroupInPriority) {
            await Promise.all(bundleGroup.map(async (bundle) => {
                const checked = new Set();
                return await Promise.all(bundle.rootAssets.map(async (uuid) => await walkDepend(uuid, bundle, checked)));
            }));
            // 每循环一组，将该组包含的 uuid 增加到 sharedAssets 中，供下一组 bundle 复用
            bundleGroup.forEach((bundle) => {
                bundle.assetsWithoutRedirect.forEach((uuid) => {
                    if (!sharedAssets[uuid]) {
                        sharedAssets[uuid] = bundle.name;
                    }
                });
            });
        }
        this.updateProcess('Init bundle share assets success...');
    }
    /**
     * 根据不同的选项做不同的 bundle 任务注册
     */
    async bundleDataTask() {
        const imageCompressManager = this.imageCompressManager;
        imageCompressManager && (await imageCompressManager.init());
        await Promise.all(this.bundles.map(async (bundle) => {
            if (!bundle.output) {
                return;
            }
            await (0, json_group_1.handleJsonGroup)(bundle);
            await (0, bin_group_1.handleBinGroup)(bundle, this.options.binGroupConfig);
            imageCompressManager && await (0, texture_compress_1.bundleDataTask)(bundle, imageCompressManager);
        }));
    }
    /**
     * 纹理压缩处理
     * @returns
     */
    async compressImage() {
        if (!this.imageCompressManager) {
            return;
        }
        this.updateProcess('Compress image start...');
        await this.imageCompressManager.run();
        this.updateProcess('Compress image success...');
    }
    /**
     * 执行自动图集任务
     */
    async packImage() {
        this.updateProcess('Pack Images start');
        console_1.newConsole.trackTimeStart('builder:pack-auto-atlas-image');
        // 确认实际参与构建的图集资源列表
        let pacAssets = [];
        if (this.options.buildBundleOnly) {
            this._pacAssets.reduce((pacAssets, pacUuid) => {
                const pacInfo = asset_library_1.buildAssetLibrary.getAsset(pacUuid);
                const inBundle = this.bundles.some((bundle) => {
                    if (!bundle.output) {
                        return false;
                    }
                    if (utils_4.default.Path.contains(pacInfo.url, bundle.root) || utils_4.default.Path.contains(bundle.root, pacInfo.url)) {
                        return true;
                    }
                });
                if (inBundle) {
                    pacAssets.push(pacInfo);
                }
                return pacAssets;
            }, pacAssets);
        }
        else {
            // 非独立构建 Bundle 模式下，所有的图集都需要参与构建，TODO 需要优化
            pacAssets = this._pacAssets.map((pacUuid) => asset_library_1.buildAssetLibrary.getAsset(pacUuid));
        }
        if (!pacAssets.length) {
            console.debug('No pac assets');
            return;
        }
        console.debug(`Number of pac assets: ${pacAssets.length}`);
        const includeAssets = new Set();
        this.bundles.forEach((bundle => bundle.assets.forEach((asset) => includeAssets.add(asset))));
        const { TexturePacker } = await Promise.resolve().then(() => __importStar(require('../texture-packer/index')));
        this.packResults = await (await new TexturePacker().init(pacAssets, Array.from(includeAssets))).pack();
        if (!this.packResults.length) {
            console.debug('No pack results');
            return;
        }
        const imageCompressManager = this.imageCompressManager;
        const dependedAssets = {};
        console.debug(`Number of pack results: ${this.packResults.length}`);
        await Promise.all(this.packResults.map(async (pacRes) => {
            if (!pacRes.result) {
                console.debug('No pack result in pac', pacRes.uuid);
                return;
            }
            const atlases = pacRes.result.atlases;
            const assetInfo = asset_library_1.buildAssetLibrary.getAsset(pacRes.uuid);
            const { createAssetInstance } = await Promise.resolve().then(() => __importStar(require('../texture-packer/pac-info')));
            // atlases 是可被序列化的缓存信息，不包含 spriteFrames
            const pacInstances = createAssetInstance(atlases, assetInfo, pacRes.spriteFrames);
            pacInstances.forEach((instance) => {
                this.cache.addInstance(instance);
            });
            console.debug('start collect depend assets in pac', pacRes.uuid);
            // includeAssets 是 Bundle 根据依赖关系整理的配置，包含了所有有被依赖的构建资源
            await collectDependAssets(pacRes.uuid, includeAssets, dependedAssets);
            for (const spriteFrameInfo of pacRes.spriteFrameInfos) {
                await collectDependAssets(spriteFrameInfo.uuid, includeAssets, dependedAssets);
                await collectDependAssets(spriteFrameInfo.textureUuid, includeAssets, dependedAssets);
                if (dependedAssets[spriteFrameInfo.textureUuid]) {
                    // 由于图集小图内部之间会存在互相依赖，属于伪依赖，不作为真实项目依赖考虑
                    dependedAssets[spriteFrameInfo.textureUuid] = dependedAssets[spriteFrameInfo.textureUuid].filter((uuid) => uuid !== spriteFrameInfo.uuid);
                    if (!dependedAssets[spriteFrameInfo.textureUuid].length) {
                        delete dependedAssets[spriteFrameInfo.textureUuid];
                    }
                }
                await collectDependAssets(spriteFrameInfo.imageUuid, includeAssets, dependedAssets);
                if (dependedAssets[spriteFrameInfo.imageUuid]) {
                    dependedAssets[spriteFrameInfo.imageUuid] = dependedAssets[spriteFrameInfo.imageUuid].filter((uuid) => uuid !== spriteFrameInfo.textureUuid);
                    if (!dependedAssets[spriteFrameInfo.imageUuid].length) {
                        delete dependedAssets[spriteFrameInfo.imageUuid];
                    }
                    imageCompressManager && imageCompressManager.removeTask((0, utils_1.queryImageAssetFromSubAssetByUuid)(spriteFrameInfo.uuid));
                }
            }
            console.debug('start sort bundle in pac', pacRes.uuid);
            await Promise.all((atlases).map(async (atlas) => {
                await (0, pac_1.sortBundleInPac)(this.bundles, atlas, pacRes, dependedAssets, imageCompressManager);
            }));
            console.debug('end sort bundle in pac', pacRes.uuid);
        }));
        await console_1.newConsole.trackTimeEnd('builder:pack-auto-atlas-image', { output: true });
        this.updateProcess('Pack Images success');
    }
    /**
     * 编译项目脚本
     */
    async buildScript() {
        this.updateProcess(`${i18n_1.default.t('builder.tasks.build_project_script')} start...`);
        console_1.newConsole.trackTimeStart('builder:build-project-script');
        if (this.options.buildScriptParam && !this.options.buildScriptParam.commonDir) {
            this.options.buildScriptParam.commonDir = (0, path_1.join)(this.destDir, 'src', 'chunks');
        }
        await this.scriptBuilder.initProjectOptions(this.options);
        const res = await this.scriptBuilder.buildBundleScript(this.bundles);
        const buildProjectTime = await console_1.newConsole.trackTimeEnd('builder:build-project-script');
        this.updateProcess(`${i18n_1.default.t('builder.tasks.build_project_script')} in (${buildProjectTime} ms) √`);
        return res;
    }
    /**
     * 输出所有的 bundle 资源，包含脚本、json、普通资源、纹理压缩、图集等
     */
    async outputAssets() {
        this.updateProcess('Output asset in bundles start');
        const hasCheckedAsset = new Set();
        await Promise.all(this.bundles.map(async (bundle) => {
            if (!bundle.output) {
                return;
            }
            if (this.imageCompressManager) {
                await (0, texture_compress_1.bundleOutputTask)(bundle, this.cache);
            }
            // 输出 json 分组
            await (0, json_group_1.outputJsonGroup)(bundle, this);
            await (0, bin_group_1.outputBinGroup)(bundle, this.options.binGroupConfig);
            // 循环分组内的资源
            await Promise.all(bundle.assetsWithoutRedirect.map(async (uuid) => {
                if (uuid.length <= 15 || bundle.compressTask[uuid]) {
                    // 合图资源、已参与纹理压缩的资源无需拷贝原图
                    return Promise.resolve();
                }
                // 将资源复制到指定位置
                const asset = asset_library_1.buildAssetLibrary.getAsset(uuid);
                if (!asset) {
                    console.error(`Can not get asset info with uuid(${uuid})`);
                    return;
                }
                if (!hasCheckedAsset.has(uuid)) {
                    hasCheckedAsset.add(uuid);
                    // 校验 effect 是否需要 mipmap
                    await checkEffectTextureMipmap(asset, uuid);
                }
                try {
                    await copyAssetFile(asset, bundle, this.options);
                }
                catch (error) {
                    console.error(error);
                    console.error(`output asset file error with uuid(${uuid})`);
                    return Promise.resolve();
                }
            }));
        }));
        this.updateProcess('Output asset in bundles success');
    }
    async handleHook(func, internal, ...args) {
        if (internal) {
            await func.call(this, this.options, this.bundles, this.cache);
        }
        else {
            await func();
        }
    }
    async runAllTask() {
        const weight = 1 / this.pipeline.length;
        for (const task of this.pipeline) {
            if (typeof task === 'string') {
                await this.runPluginTask(task, weight);
            }
            else if (typeof task === 'function') {
                await this.runBuildTask(task, weight);
            }
        }
    }
    async runBuildTask(handle, increment) {
        if (this.error) {
            await this.onError(this.error);
            return;
        }
        try {
            await handle.bind(this)();
            this.updateProcess(`run bundle task ${handle.name} success!`, increment);
        }
        catch (error) {
            this.updateProcess(`run bundle task failed!`, increment);
            await this.onError(error);
        }
    }
}
exports.BundleManager = BundleManager;
async function collectDependAssets(uuid, allAssets, dependedAssets) {
    if (allAssets.has(uuid)) {
        const res = await asset_library_1.buildAssetLibrary.queryAssetUsers(uuid);
        res && res.length && (dependedAssets[uuid] = res);
    }
}
const featuresWithDependencies = [];
const preloadAssets = []; // 预加载资源 uuid 数组（包含脚本）
/**
 * 将资源复制到指定位置
 * @param rawAssetDir 输出文件夹路径
 * @param asset
 */
function copyAssetFile(asset, bundle, options) {
    const cconFormatSource = (0, cconb_1.getCCONFormatAssetInLibrary)(asset);
    if (cconFormatSource) {
        const isCconHandledInGroup = !!bundle.groups.find(group => group.type == 'BIN' && group.uuids.includes(asset.uuid));
        if (isCconHandledInGroup) {
            return Promise.resolve();
        }
        const rawAssetDir = (0, path_1.join)(bundle.dest, bundle.importBase);
        const source = cconFormatSource;
        const relativeName = (0, path_1.relative)((0, utils_1.getLibraryDir)(source), source);
        const dest = (0, path_1.join)((0, path_1.join)(rawAssetDir, relativeName));
        return asset_library_1.buildAssetLibrary.outputCCONAsset(asset.uuid, dest, options);
    }
    const excludeExtName = ['.json'];
    return Promise.all(asset.meta.files.map((extname) => {
        if (excludeExtName.includes(extname)) {
            return Promise.resolve();
        }
        // 规则：构建不打包 __ 开头的资源数据
        if (extname.startsWith('__')) {
            return Promise.resolve();
        }
        const rawAssetDir = (0, path_1.join)(bundle.dest, bundle.nativeBase);
        const source = extname.startsWith('.') ? asset.library + extname : (0, path_1.join)(asset.library, extname);
        // 利用相对路径来获取资源相对地址，避免耦合一些特殊资源的路径拼写规则，比如 font 
        const relativeName = (0, path_1.relative)((0, utils_1.getLibraryDir)(source), source);
        if (!(0, fs_extra_1.existsSync)(source)) {
            console.error(i18n_1.default.t('builder.error.missing_import_files', {
                path: `{link(${source})}`,
                url: `{asset(${asset.url})}`,
            }));
            return Promise.resolve();
        }
        const dest = (0, path_1.join)(rawAssetDir, relativeName);
        // 其他流程可能生成同类型后缀资源，比如压缩纹理，不能将其覆盖
        if ((0, fs_extra_1.existsSync)(dest)) {
            return Promise.resolve();
        }
        return (0, fs_extra_1.copy)(source, dest);
    }));
}
function traversalDependencies(features, featuresInJson) {
    features.forEach((featureName) => {
        if (featuresInJson[featureName]) {
            if (!featuresWithDependencies.includes(featureName)) {
                featuresWithDependencies.push(featureName);
                if (featuresInJson[featureName].dependentAssets) {
                    preloadAssets.push(...featuresInJson[featureName].dependentAssets);
                }
                if (featuresInJson[featureName].dependentScripts) {
                    preloadAssets.push(...featuresInJson[featureName].dependentScripts);
                }
                if (featuresInJson[featureName].dependentModules) {
                    const dependentModules = featuresInJson[featureName].dependentModules;
                    traversalDependencies(dependentModules, featuresInJson);
                }
            }
        }
    });
}
/**
 * 根据模块信息，查找需要预加载的资源列表（包含普通资源与脚本）
 * @param features
 * @returns
 */
async function queryPreloadAssetList(features, enginePath) {
    const ccConfigJson = await (0, fs_extra_1.readJSON)((0, path_1.join)(enginePath, 'cc.config.json'));
    const featuresInJson = ccConfigJson.features;
    featuresWithDependencies.length = 0;
    preloadAssets.length = 0;
    traversalDependencies(features, featuresInJson);
    return Array.from(new Set(preloadAssets));
}
/**
 * effect 设置了 requireMipmaps，对材质进行校验，若发现关联的纹理没有开启 mipmap 则输出警告
 */
async function checkEffectTextureMipmap(asset, uuid) {
    try {
        if (asset_library_1.buildAssetLibrary.getAssetProperty(asset, 'type') === 'cc.Material') {
            const mtl = (await asset_library_1.buildAssetLibrary.getInstance(asset_library_1.buildAssetLibrary.getAsset(uuid)));
            if (mtl.effectAsset && mtl.effectAsset._uuid) {
                const effect = (await asset_library_1.buildAssetLibrary.getInstance(asset_library_1.buildAssetLibrary.getAsset(mtl.effectAsset._uuid)));
                // 遍历 effect.techniques[mtl._techIdx] 下的所有 pass
                // @ts-ignore
                effect.techniques[mtl._techIdx].passes.forEach(async (pass, index) => {
                    if (pass.properties && pass.properties.mainTexture && pass.properties.mainTexture.requireMipmaps) {
                        // 引擎接口报错
                        // const mainTexture = mtl.getProperty('mainTexture', index);
                        // 获取 mainTexture 的 uuid
                        // @ts-ignore
                        const prop = mtl._props && mtl._props[index];
                        // @ts-ignore
                        if (prop.mainTexture && prop.mainTexture._uuid) {
                            // requireMipmaps === ture 的 mainTexture 校验是否开启了 mipmap
                            // @ts-ignore
                            const meta = await asset_library_1.buildAssetLibrary.getMeta(prop.mainTexture._uuid);
                            if (!['nearest', 'linear'].includes(meta.userData.mipfilter)) {
                                console.warn(i18n_1.default.t('builder.warn.require_mipmaps', {
                                    effectUUID: effect._uuid,
                                    // @ts-ignore
                                    textureUUID: prop.mainTexture._uuid,
                                }));
                            }
                        }
                    }
                });
            }
        }
    }
    catch (error) {
        console.debug(error);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3dvcmtlci9idWlsZGVyL2Fzc2V0LWhhbmRsZXIvYnVuZGxlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUFvRTtBQUNwRSwrQkFBK0M7QUFHL0MscUNBQWtDO0FBQ2xDLHlEQUFzRTtBQUV0RSwrQkFBd0M7QUFDeEMsNkNBQXlIO0FBQ3pILHNDQUEwQztBQUMxQyxpRUFBaUs7QUFDakssK0RBQWdFO0FBQ2hFLCtDQUF3RDtBQUN4RCx1Q0FBK0U7QUFDL0UsNkNBQWdFO0FBQ2hFLG1EQUF1RDtBQUV2RCx1REFBd0Q7QUFDeEQsbURBQXNEO0FBQ3RELDJDQUE2RDtBQUM3RCx5REFBeUQ7QUFDekQsb0VBQTRDO0FBSTVDLHVEQUEyRDtBQUMzRCxzRUFBOEM7QUFDOUMseUVBQThDO0FBQzlDLHNGQUE2RDtBQUU3RCxnRkFBNkQ7QUFDN0QscURBQTJEO0FBRTNELE1BQU0sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsR0FBRyxnQ0FBaUIsQ0FBQztBQUNyRSwyQkFBMkI7QUFDM0IsTUFBYSxhQUFjLFNBQVEseUJBQWE7SUFDNUMsTUFBTSxDQUFDLGlCQUFpQixHQUFHLGdDQUFpQixDQUFDO0lBQzdDLE1BQU0sQ0FBQyxhQUFhLEdBQW1HLEVBQUUsQ0FBQztJQUVsSCxLQUFLLENBQVk7SUFDekIsT0FBTyxDQUE4QjtJQUNyQyxPQUFPLENBQVM7SUFDVCxTQUFTLENBQWtCO0lBRWxDLFNBQVMsR0FBNEIsRUFBRSxDQUFDO0lBQ3hDLE9BQU8sR0FBYyxFQUFFLENBQUM7SUFFeEIsVUFBVSxHQUFhLEVBQUUsQ0FBQztJQUUxQixzQkFBc0I7SUFDdEIsc0JBQXNCLENBQW9CO0lBRTFDLFVBQVU7SUFDVixv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IGVtcHR5RGlyU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHsgZGlybmFtZSwgam9pbiwgcmVsYXRpdmUgfSBmcm9tICdwYXRoJztcclxuXHJcbmltcG9ydCB0eXBlIHsgVGV4dHVyZUNvbXByZXNzIH0gZnJvbSAnLi4vdGV4dHVyZS1jb21wcmVzcyc7XHJcbmltcG9ydCB7IEJ1bmRsZSB9IGZyb20gJy4vYnVuZGxlJztcclxuaW1wb3J0IHsgYnVuZGxlRGF0YVRhc2ssIGJ1bmRsZU91dHB1dFRhc2sgfSBmcm9tICcuL3RleHR1cmUtY29tcHJlc3MnO1xyXG5pbXBvcnQgdHlwZSB7IFBhY0luZm8gfSBmcm9tICcuLi90ZXh0dXJlLXBhY2tlci9wYWMtaW5mbyc7XHJcbmltcG9ydCB7IHNvcnRCdW5kbGVJblBhYyB9IGZyb20gJy4vcGFjJztcclxuaW1wb3J0IHsgZ2V0Q0NPTkZvcm1hdEFzc2V0SW5MaWJyYXJ5LCBnZXREZXNpcmVkQ0NPTkV4dGVuc2lvbk1hcCwgaGFzQ0NPTkZvcm1hdEFzc2V0SW5MaWJyYXJ5IH0gZnJvbSAnLi4vLi4vdXRpbHMvY2NvbmInO1xyXG5pbXBvcnQgeyBTY3JpcHRCdWlsZGVyIH0gZnJvbSAnLi4vc2NyaXB0JztcclxuaW1wb3J0IHsgQnVpbHRpbkJ1bmRsZU5hbWUsIEJ1bmRsZUNvbXByZXNzaW9uVHlwZXMsIERlZmF1bHRCdW5kbGVDb25maWcsIGdldEJ1bmRsZURlZmF1bHROYW1lLCB0cmFuc2Zvcm1QbGF0Zm9ybVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2hhcmUvYnVuZGxlLXV0aWxzJztcclxuaW1wb3J0IHsgYnVpbGRBc3NldExpYnJhcnkgfSBmcm9tICcuLi8uLi9tYW5hZ2VyL2Fzc2V0LWxpYnJhcnknO1xyXG5pbXBvcnQgeyBCdWlsZGVyQXNzZXRDYWNoZSB9IGZyb20gJy4uLy4uL21hbmFnZXIvYXNzZXQnO1xyXG5pbXBvcnQgeyBnZXRMaWJyYXJ5RGlyLCBxdWVyeUltYWdlQXNzZXRGcm9tU3ViQXNzZXRCeVV1aWQgfSBmcm9tICcuLi8uLi91dGlscyc7XHJcbmltcG9ydCB7IGhhbmRsZUpzb25Hcm91cCwgb3V0cHV0SnNvbkdyb3VwIH0gZnJvbSAnLi9qc29uLWdyb3VwJztcclxuaW1wb3J0IHsgZGVmYXVsdHNEZWVwIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2hhcmUvdXRpbHMnO1xyXG5pbXBvcnQgeyBFZmZlY3RBc3NldCwgTWF0ZXJpYWwgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IEJ1aWxkVGFza0Jhc2UgfSBmcm9tICcuLi8uLi9tYW5hZ2VyL3Rhc2stYmFzZSc7XHJcbmltcG9ydCB7IGNvbXBhcmVVVUlEIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2hhcmUvdXRpbHMnO1xyXG5pbXBvcnQgeyBoYW5kbGVCaW5Hcm91cCwgb3V0cHV0QmluR3JvdXAgfSBmcm9tICcuL2Jpbi1ncm91cCc7XHJcbmltcG9ydCB7IG5ld0NvbnNvbGUgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9iYXNlL2NvbnNvbGUnO1xyXG5pbXBvcnQgaTE4biBmcm9tICcuLi8uLi8uLi8uLi8uLi9iYXNlL2kxOG4nO1xyXG5pbXBvcnQgeyBJQXNzZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9hc3NldHMvQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IElCdW5kbGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vQHR5cGVzJztcclxuaW1wb3J0IHsgSUJ1bmRsZU1hbmFnZXIsIElCdWlsZGVyLCBJSW50ZXJuYWxCdW5kbGVCdWlsZE9wdGlvbnMsIElCdWlsZEhvb2tzSW5mbywgSUJ1bmRsZSwgQ3VzdG9tQnVuZGxlQ29uZmlnLCBCdW5kbGVSZW5kZXJDb25maWcsIEJ1bmRsZVBsYXRmb3JtVHlwZSwgSUJ1bmRsZUluaXRPcHRpb25zLCBJQnVuZGxlQnVpbGRPcHRpb25zLCBJQnVpbGRPcHRpb25CYXNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IHBsdWdpbk1hbmFnZXIgfSBmcm9tICcuLi8uLi8uLi8uLi9tYW5hZ2VyL3BsdWdpbic7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi8uLi8uLi8uLi8uLi9iYXNlL3V0aWxzJztcclxuaW1wb3J0IHNjcmlwdCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY3JpcHRpbmcnO1xyXG5pbXBvcnQgYnVpbGRlckNvbmZpZyBmcm9tICcuLi8uLi8uLi8uLi9zaGFyZS9idWlsZGVyLWNvbmZpZyc7XHJcbmltcG9ydCB7IElQbHVnaW5TY3JpcHRJbmZvIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NyaXB0aW5nL2ludGVyZmFjZSc7XHJcbmltcG9ydCBhc3NldFF1ZXJ5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2Fzc2V0cy9tYW5hZ2VyL3F1ZXJ5JztcclxuaW1wb3J0IHsgQnVpbGRHbG9iYWxJbmZvIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2hhcmUvZ2xvYmFsJztcclxuXHJcbmNvbnN0IHsgTUFJTiwgU1RBUlRfU0NFTkUsIElOVEVSTkFMLCBSRVNPVVJDRVMgfSA9IEJ1aWx0aW5CdW5kbGVOYW1lO1xyXG4vLyDlj6ogQnVuZGxlIOaehOW7uuaXtu+8jOWPr+i1sOatpOexu+eahOeUn+aIkOaJp+ihjOWHveaVsFxyXG5leHBvcnQgY2xhc3MgQnVuZGxlTWFuYWdlciBleHRlbmRzIEJ1aWxkVGFza0Jhc2UgaW1wbGVtZW50cyBJQnVuZGxlTWFuYWdlciB7XHJcbiAgICBzdGF0aWMgQnVpbHRpbkJ1bmRsZU5hbWUgPSBCdWlsdGluQnVuZGxlTmFtZTtcclxuICAgIHN0YXRpYyBCdW5kbGVDb25maWdzOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCB7IGlzUmVtb3RlOiBib29sZWFuLCBjb21wcmVzc2lvblR5cGU6IEJ1bmRsZUNvbXByZXNzaW9uVHlwZXMgfT4+ID0ge307XHJcblxyXG4gICAgcHJpdmF0ZSBfdGFzaz86IElCdWlsZGVyO1xyXG4gICAgb3B0aW9uczogSUludGVybmFsQnVuZGxlQnVpbGRPcHRpb25zO1xyXG4gICAgZGVzdERpcjogc3RyaW5nO1xyXG4gICAgcHVibGljIGhvb2tzSW5mbzogSUJ1aWxkSG9va3NJbmZvO1xyXG5cclxuICAgIGJ1bmRsZU1hcDogUmVjb3JkPHN0cmluZywgSUJ1bmRsZT4gPSB7fTtcclxuICAgIGJ1bmRsZXM6IElCdW5kbGVbXSA9IFtdO1xyXG5cclxuICAgIF9wYWNBc3NldHM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgLy8g5oyJ54Wn5LyY5YWI57qn5o6S5bqP6L+H55qEIGJ1bmRsZSDmlbDnu4RcclxuICAgIF9idW5kbGVHcm91cEluUHJpb3JpdHk/OiBBcnJheTxJQnVuZGxlW10+O1xyXG5cclxuICAgIC8vIOe6ueeQhuWOi+e8qeeuoeeQhuWZqFxyXG4gICAgaW1hZ2VDb21wcmVzc01hbmFnZXI/OiBUZXh0dXJlQ29tcHJlc3M7XHJcbiAgICBzY3JpcHRCdWlsZGVyOiBTY3JpcHRCdWlsZGVyO1xyXG4gICAgcGFja1Jlc3VsdHM6IFBhY0luZm9bXSA9IFtdO1xyXG4gICAgY2FjaGU6IEJ1aWxkZXJBc3NldENhY2hlO1xyXG5cclxuICAgIHB1YmxpYyBob29rTWFwID0ge1xyXG4gICAgICAgIG9uQmVmb3JlQnVuZGxlSW5pdDogJ29uQmVmb3JlQnVuZGxlSW5pdCcsXHJcbiAgICAgICAgb25BZnRlckJ1bmRsZUluaXQ6ICdvbkFmdGVyQnVuZGxlSW5pdCcsXHJcbiAgICAgICAgb25CZWZvcmVCdW5kbGVEYXRhVGFzazogJ29uQmVmb3JlQnVuZGxlRGF0YVRhc2snLFxyXG4gICAgICAgIG9uQWZ0ZXJCdW5kbGVEYXRhVGFzazogJ29uQWZ0ZXJCdW5kbGVEYXRhVGFzaycsXHJcbiAgICAgICAgb25CZWZvcmVCdW5kbGVCdWlsZFRhc2s6ICdvbkJlZm9yZUJ1bmRsZUJ1aWxkVGFzaycsXHJcbiAgICAgICAgb25BZnRlckJ1bmRsZUJ1aWxkVGFzazogJ29uQWZ0ZXJCdW5kbGVCdWlsZFRhc2snLFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyDmiafooYzmlbTkuKrmnoTlu7rmtYHnqIvnmoTpobrluo/mtYHnqItcclxuICAgIHB1YmxpYyBwaXBlbGluZTogKHN0cmluZyB8IEZ1bmN0aW9uKVtdID0gW1xyXG4gICAgICAgIHRoaXMuaW5pdE9wdGlvbnMsXHJcbiAgICAgICAgdGhpcy5ob29rTWFwLm9uQmVmb3JlQnVuZGxlSW5pdCxcclxuICAgICAgICB0aGlzLmluaXRCdW5kbGUsXHJcbiAgICAgICAgdGhpcy5ob29rTWFwLm9uQWZ0ZXJCdW5kbGVJbml0LFxyXG4gICAgICAgIHRoaXMuaG9va01hcC5vbkJlZm9yZUJ1bmRsZURhdGFUYXNrLFxyXG4gICAgICAgIHRoaXMuaW5pdEFzc2V0LFxyXG4gICAgICAgIHRoaXMuYnVuZGxlRGF0YVRhc2ssXHJcbiAgICAgICAgdGhpcy5ob29rTWFwLm9uQWZ0ZXJCdW5kbGVEYXRhVGFzayxcclxuICAgICAgICB0aGlzLmhvb2tNYXAub25CZWZvcmVCdW5kbGVCdWlsZFRhc2ssXHJcbiAgICAgICAgdGhpcy5jbGVhckJ1bmRsZURlc3QsXHJcbiAgICAgICAgdGhpcy5idWlsZFNjcmlwdCxcclxuICAgICAgICB0aGlzLmJ1aWxkQXNzZXQsXHJcbiAgICAgICAgdGhpcy5ob29rTWFwLm9uQWZ0ZXJCdW5kbGVCdWlsZFRhc2ssXHJcbiAgICAgICAgdGhpcy5vdXRwdXRCdW5kbGUsXHJcbiAgICBdO1xyXG5cclxuICAgIGdldCBidW5kbGVHcm91cEluUHJpb3JpdHkoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2J1bmRsZUdyb3VwSW5Qcmlvcml0eSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYnVuZGxlR3JvdXBJblByaW9yaXR5O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBidW5kbGUg5oyJ5LyY5YWI57qn5YiG57uEXHJcbiAgICAgICAgbGV0IGJ1bmRsZUdyb3VwSW5Qcmlvcml0eSA9IG5ldyBBcnJheTxJQnVuZGxlW10+KDIxKTtcclxuICAgICAgICB0aGlzLmJ1bmRsZXMuZm9yRWFjaCgoYnVuZGxlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghYnVuZGxlR3JvdXBJblByaW9yaXR5W2J1bmRsZS5wcmlvcml0eSAtIDFdKSB7XHJcbiAgICAgICAgICAgICAgICBidW5kbGVHcm91cEluUHJpb3JpdHlbYnVuZGxlLnByaW9yaXR5IC0gMV0gPSBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBidW5kbGVHcm91cEluUHJpb3JpdHlbYnVuZGxlLnByaW9yaXR5IC0gMV0ucHVzaChidW5kbGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGJ1bmRsZUdyb3VwSW5Qcmlvcml0eSA9IGJ1bmRsZUdyb3VwSW5Qcmlvcml0eS5maWx0ZXIoKGdyb3VwKSA9PiBncm91cCkucmV2ZXJzZSgpO1xyXG4gICAgICAgIHRoaXMuX2J1bmRsZUdyb3VwSW5Qcmlvcml0eSA9IGJ1bmRsZUdyb3VwSW5Qcmlvcml0eTtcclxuICAgICAgICByZXR1cm4gYnVuZGxlR3JvdXBJblByaW9yaXR5O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgaW50ZXJuYWxCdW5kbGVQcmlvcml0eTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHtcclxuICAgICAgICBbTUFJTl06IDcsXHJcbiAgICAgICAgW1NUQVJUX1NDRU5FXTogMjAsXHJcbiAgICAgICAgW0lOVEVSTkFMXTogMjEsXHJcbiAgICAgICAgW1JFU09VUkNFU106IDgsXHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3Iob3B0aW9uczogSUJ1aWxkT3B0aW9uQmFzZSwgaW1hZ2VDb21wcmVzc01hbmFnZXI6IFRleHR1cmVDb21wcmVzcyB8IG51bGwsIHRhc2s/OiBJQnVpbGRlcikge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbnMudGFza0lkISwgJ0J1bmRsZSBUYXNrJyk7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUT0RPIOihpeWFqCBvcHRpb25zIOS4uiBJSW50ZXJuYWxCdW5kbGVCdWlsZE9wdGlvbnNcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIGFzIElJbnRlcm5hbEJ1bmRsZUJ1aWxkT3B0aW9ucztcclxuICAgICAgICBpZiAoaW1hZ2VDb21wcmVzc01hbmFnZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5pbWFnZUNvbXByZXNzTWFuYWdlciA9IGltYWdlQ29tcHJlc3NNYW5hZ2VyO1xyXG4gICAgICAgICAgICBpbWFnZUNvbXByZXNzTWFuYWdlci5vbigndXBkYXRlLXByb2dyZXNzJywgKG1lc3NhZ2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUHJvY2VzcyhtZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3Rhc2sgPSB0YXNrO1xyXG4gICAgICAgIHRoaXMuZGVzdERpciA9IHRoaXMub3B0aW9ucy5kZXN0ICYmIHV0aWxzLlBhdGgucmVzb2x2ZVRvUmF3KHRoaXMub3B0aW9ucy5kZXN0KSB8fCBqb2luKGJ1aWxkZXJDb25maWcucHJvamVjdFJvb3QsICdidWlsZCcsICdhc3NldEJ1bmRsZScpO1xyXG4gICAgICAgIHRoaXMuc2NyaXB0QnVpbGRlciA9IG5ldyBTY3JpcHRCdWlsZGVyKCk7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIHRoaXMuY2FjaGUgPSB0YXNrID8gdGFzay5jYWNoZSA6IG5ldyBCdWlsZGVyQXNzZXRDYWNoZSgpO1xyXG4gICAgICAgIHRoaXMuaG9va3NJbmZvID0gdGFzayA/IHRhc2suaG9va3NJbmZvIDogcGx1Z2luTWFuYWdlci5nZXRIb29rc0luZm8odGhpcy5vcHRpb25zLnBsYXRmb3JtKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgY3JlYXRlKG9wdGlvbnM6IElCdWlsZE9wdGlvbkJhc2UsIHRhc2s/OiBJQnVpbGRlcikge1xyXG4gICAgICAgIGlmICghb3B0aW9ucy5za2lwQ29tcHJlc3NUZXh0dXJlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgVGV4dHVyZUNvbXByZXNzIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3RleHR1cmUtY29tcHJlc3MnKTtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2VDb21wcmVzc01hbmFnZXIgPSBuZXcgVGV4dHVyZUNvbXByZXNzKG9wdGlvbnMucGxhdGZvcm0sIG9wdGlvbnMudXNlQ2FjaGVDb25maWc/LnRleHR1cmVDb21wcmVzcyk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQnVuZGxlTWFuYWdlcihvcHRpb25zLCBpbWFnZUNvbXByZXNzTWFuYWdlciwgdGFzayk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgQnVuZGxlTWFuYWdlcihvcHRpb25zLCBudWxsLCB0YXNrKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBsb2FkU2NyaXB0KHNjcmlwdFV1aWRzOiBzdHJpbmdbXSwgcGx1Z2luU2NyaXB0czogSVBsdWdpblNjcmlwdEluZm9bXSkge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucHJldmlldykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IHNjcmlwdC5sb2FkU2NyaXB0KHNjcmlwdFV1aWRzLCBwbHVnaW5TY3JpcHRzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIneWni+WMlumhueebruiuvue9rueahOS4gOS6myBidW5kbGUg6YWN572u5L+h5oGvXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhc3luYyBpbml0U3RhdGljQnVuZGxlQ29uZmlnKCkge1xyXG4gICAgICAgIGNvbnN0IGJ1bmRsZUNvbmZpZzogUmVjb3JkPHN0cmluZywgQ3VzdG9tQnVuZGxlQ29uZmlnPiA9IChhd2FpdCBidWlsZGVyQ29uZmlnLmdldFByb2plY3QoJ2J1bmRsZUNvbmZpZy5jdXN0b20nKSkgfHwge307XHJcbiAgICAgICAgaWYgKCFidW5kbGVDb25maWcuZGVmYXVsdCkge1xyXG4gICAgICAgICAgICBidW5kbGVDb25maWcuZGVmYXVsdCA9IERlZmF1bHRCdW5kbGVDb25maWc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJlczogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xyXG4gICAgICAgIE9iamVjdC5rZXlzKGJ1bmRsZUNvbmZpZykuZm9yRWFjaCgoSUQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY29uZmlncyA9IGJ1bmRsZUNvbmZpZ1tJRF0uY29uZmlncztcclxuICAgICAgICAgICAgcmVzW0lEXSA9IHt9O1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjb25maWdzKS5mb3JFYWNoKChwbGF0Zm9ybVR5cGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBsYXRmb3JtT3B0aW9uID0gdHJhbnNmb3JtUGxhdGZvcm1TZXR0aW5ncyhjb25maWdzW3BsYXRmb3JtVHlwZSBhcyBCdW5kbGVQbGF0Zm9ybVR5cGVdLCBwbHVnaW5NYW5hZ2VyLmJ1bmRsZUNvbmZpZ3MpO1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihyZXNbSURdLCBwbGF0Zm9ybU9wdGlvbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIEJ1bmRsZU1hbmFnZXIuQnVuZGxlQ29uZmlncyA9IHJlcztcclxuICAgIH1cclxuXHJcbiAgICBnZXRVc2VyQ29uZmlnKElEID0gJ2RlZmF1bHQnKSB7XHJcbiAgICAgICAgY29uc3QgY29uZmlnTWFwID0gQnVuZGxlTWFuYWdlci5CdW5kbGVDb25maWdzW0lEXTtcclxuICAgICAgICBpZiAoIWNvbmZpZ01hcCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb25maWdNYXBbdGhpcy5vcHRpb25zLnBsYXRmb3JtXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWvuSBvcHRpb25zIOS4iueahOaVsOaNruWBmuihpeWFqOWkhOeQhlxyXG4gICAgICovXHJcbiAgICBhc3luYyBpbml0T3B0aW9ucygpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMucGxhdGZvcm1UeXBlID0gcGx1Z2luTWFuYWdlci5wbGF0Zm9ybUNvbmZpZ1t0aGlzLm9wdGlvbnMucGxhdGZvcm1dLnBsYXRmb3JtVHlwZTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMuYnVpbGRTY3JpcHRQYXJhbSA9IHtcclxuICAgICAgICAgICAgZXhwZXJpbWVudGFsRXJhc2VNb2R1bGVzOiB0aGlzLm9wdGlvbnMuZXhwZXJpbWVudGFsRXJhc2VNb2R1bGVzLFxyXG4gICAgICAgICAgICBvdXRwdXROYW1lOiAncHJvamVjdCcsXHJcbiAgICAgICAgICAgIGZsYWdzOiB7XHJcbiAgICAgICAgICAgICAgICBERUJVRzogISF0aGlzLm9wdGlvbnMuZGVidWcsXHJcbiAgICAgICAgICAgICAgICAuLi50aGlzLm9wdGlvbnMuZmxhZ3MsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBvbHlmaWxsczogdGhpcy5vcHRpb25zLnBvbHlmaWxscyxcclxuICAgICAgICAgICAgaG90TW9kdWxlUmVsb2FkOiBmYWxzZSxcclxuICAgICAgICAgICAgcGxhdGZvcm06IHRoaXMub3B0aW9ucy5wbGF0Zm9ybVR5cGUgfHwgJ0lOVkFMSURfUExBVEZPUk0nLCAvLyB2My44LjYg5byA5aeLIGNjYnVpbGQg5pSv5oyBICdJTlZBTElEX1BMQVRGT1JNJyDooajnpLrml6DmlYjlubPlj7DvvIzpmLLmraLkuYvliY3liJ3lp4vljJbkuLogJ0hUTUw1JyDlkI7vvIzlubPlj7Dmj5Lku7blv5jorrDopobnm5YgcGxhdGZvcm0g5Y+C5pWw5a+86Ie06LWwICdIVE1MNScg55qE5byV5pOO5omT5YyF5rWB56iL5a+86Ie055qE6L6D6Zq+5o6S5p+l55qE6Zeu6aKYXHJcbiAgICAgICAgICAgIGNvbW1vbkRpcjogJycsXHJcbiAgICAgICAgICAgIGJ1bmRsZUNvbW1vbkNodW5rOiB0aGlzLm9wdGlvbnMuYnVuZGxlQ29tbW9uQ2h1bmsgPz8gZmFsc2UsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmFzc2V0U2VyaWFsaXplT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgJ2NjLkVmZmVjdEFzc2V0Jzoge1xyXG4gICAgICAgICAgICAgICAgZ2xzbDE6IHRoaXMub3B0aW9ucy5pbmNsdWRlTW9kdWxlcy5pbmNsdWRlcygnZ2Z4LXdlYmdsJyksXHJcbiAgICAgICAgICAgICAgICBnbHNsMzogdGhpcy5vcHRpb25zLmluY2x1ZGVNb2R1bGVzLmluY2x1ZGVzKCdnZngtd2ViZ2wyJyksXHJcbiAgICAgICAgICAgICAgICBnbHNsNDogZmFsc2UsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBjbGVhckJ1bmRsZURlc3QoKSB7XHJcbiAgICAgICAgdGhpcy5idW5kbGVzLmZvckVhY2goKGJ1bmRsZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYnVuZGxlLm91dHB1dCkge1xyXG4gICAgICAgICAgICAgICAgZW1wdHlEaXJTeW5jKGJ1bmRsZS5kZXN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yid5aeL5YyW5pW055CG6LWE5rqQ5YiX6KGoXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBpbml0QXNzZXQoKSB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5pbml0QnVuZGxlUm9vdEFzc2V0cygpO1xyXG4gICAgICAgIC8vIOmcgOimgeWcqCB0aGlzLmNhY2hlIOWIneWni+WMluWQjuS5i+WQjuaJp+ihjFxyXG4gICAgICAgIGF3YWl0IHRoaXMubG9hZFNjcmlwdCh0aGlzLmNhY2hlLnNjcmlwdFV1aWRzLCBhc3NldFF1ZXJ5LnF1ZXJ5U29ydGVkUGx1Z2lucygpKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmluaXRCdW5kbGVTaGFyZUFzc2V0cygpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdEJ1bmRsZUNvbmZpZygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyBpbml0QnVuZGxlQ29uZmlnKCkge1xyXG4gICAgICAgIGZvciAoY29uc3QgYnVuZGxlIG9mIHRoaXMuYnVuZGxlcykge1xyXG4gICAgICAgICAgICAvLyBUT0RPIOW6n+W8gyBidW5kbGUg55qEIGNvbmZpZyDnu5PmnoTvvIzovpPlh7ogY29uZmlnIOaXtuWNs+aXtuaVtOeQhuWNs+WPr1xyXG4gICAgICAgICAgICAvLyDmraTlpITnmoTmlbTnkIblrp7pmYXkuIrku4XkuLrpooTop4jmnI3liqFcclxuICAgICAgICAgICAgYnVuZGxlLmluaXRDb25maWcoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wcmV2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBidW5kbGUuaW5pdEFzc2V0UGF0aHMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgYnVpbGRBc3NldCgpIHtcclxuICAgICAgICAvLyDlhYjoh6rliqjlm77pm4blho3nurnnkIbljovnvKlcclxuICAgICAgICBhd2FpdCB0aGlzLnBhY2tJbWFnZSgpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuY29tcHJlc3NJbWFnZSgpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMub3V0cHV0QXNzZXRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDni6znq4vmnoTlu7ogQnVuZGxlIOaXtuiwg+eUqFxyXG4gICAgICogQHJldHVybnMgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBydW4oKSB7XHJcbiAgICAgICAgLy8g54us56uL5p6E5bu6IEJ1bmRsZSDml7bvvIzkuI3og73mir3lj5blhazlhbHohJrmnKzliLAgc3JjXHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmJ1bmRsZUNvbW1vbkNodW5rID0gdHJ1ZTtcclxuICAgICAgICBhd2FpdCB0aGlzLnJ1bkFsbFRhc2soKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgb3V0cHV0QnVuZGxlKCkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlUHJvY2VzcygnT3V0cHV0IGFzc2V0IGluIGJ1bmRsZXMgc3RhcnQnKTtcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbCh0aGlzLmJ1bmRsZXMubWFwKGFzeW5jIChidW5kbGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFidW5kbGUub3V0cHV0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXdhaXQgYnVuZGxlLmJ1aWxkKCk7XHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlUHJvY2VzcygnT3V0cHV0IGFzc2V0IGluIGJ1bmRsZXMgc3VjY2VzcycpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkQnVuZGxlKG9wdGlvbnM6IElCdW5kbGVJbml0T3B0aW9ucykge1xyXG4gICAgICAgIGlmICh0aGlzLmJ1bmRsZU1hcFtvcHRpb25zLm5hbWVdKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld05hbWUgPSBvcHRpb25zLm5hbWUgKyBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgICAvLyBCdW5kbGUg6YeN5ZCN5Lya5a+86Ie06ISa5pys5YaF5Yqo5oCB5Yqg6L295Ye66ZSZ77yM6ZyA6KaB5Y+K5pe25o+Q56S6XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoaTE4bi50KCdidWlsZGVyLmFzc2V0X2J1bmRsZS5kdXBsaWNhdGVfbmFtZV9tZXNzYWdlZF9hdXRvX3JlbmFtZScsIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IG9wdGlvbnMubmFtZSxcclxuICAgICAgICAgICAgICAgIG5ld05hbWUsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMuYnVuZGxlTWFwW29wdGlvbnMubmFtZV0ucm9vdCxcclxuICAgICAgICAgICAgICAgIG5ld1VybDogb3B0aW9ucy5yb290LFxyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIG9wdGlvbnMubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYnVuZGxlTWFwW29wdGlvbnMubmFtZV0gPSBuZXcgQnVuZGxlKG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0RGVmYXVsdEJ1bmRsZUNvbmZpZyhuYW1lOiBzdHJpbmcpOiBJQnVuZGxlSW5pdE9wdGlvbnMge1xyXG4gICAgICAgIGNvbnN0IGRlc3QgPSBqb2luKHRoaXMuZGVzdERpciwgbmFtZSk7XHJcbiAgICAgICAgY29uc3QgZGVmYXVsdFByaW9yaXR5OiBudW1iZXIgPSBCdW5kbGVNYW5hZ2VyLmludGVybmFsQnVuZGxlUHJpb3JpdHlbbmFtZV07XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgZGVzdCxcclxuICAgICAgICAgICAgcm9vdDogJycsXHJcbiAgICAgICAgICAgIHNjcmlwdERlc3Q6IGpvaW4oZGVzdCwgQnVpbGRHbG9iYWxJbmZvLlNDUklQVF9OQU1FKSxcclxuICAgICAgICAgICAgcHJpb3JpdHk6IGRlZmF1bHRQcmlvcml0eSB8fCAxLFxyXG4gICAgICAgICAgICBjb21wcmVzc2lvblR5cGU6IEJ1bmRsZUNvbXByZXNzaW9uVHlwZXMuTUVSR0VfREVQLFxyXG4gICAgICAgICAgICBpc1JlbW90ZTogZmFsc2UsXHJcbiAgICAgICAgICAgIG1kNUNhY2hlOiB0aGlzLm9wdGlvbnMubWQ1Q2FjaGUsXHJcbiAgICAgICAgICAgIGRlYnVnOiB0aGlzLm9wdGlvbnMuZGVidWcsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOagueaNruWPguaVsOWIneWni+WMluS4gOS6m+S/oeaBr+mFjee9ru+8jOaVtOeQhuaJgOacieeahCBidW5kbGUg5YiG57uE5L+h5oGvXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBpbml0QnVuZGxlKCkge1xyXG4gICAgICAgIGF3YWl0IEJ1bmRsZU1hbmFnZXIuaW5pdFN0YXRpY0J1bmRsZUNvbmZpZygpO1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcbiAgICAgICAgY29uc3QgY29jb3NCdW5kbGVzOiBzdHJpbmdbXSA9IFtNQUlOLCBTVEFSVF9TQ0VORSwgSU5URVJOQUxdO1xyXG4gICAgICAgIGNvbnN0IGludGVybmFsQnVuZGxlQ29uZmlnTWFwOiBSZWNvcmQ8c3RyaW5nLCBJQnVuZGxlT3B0aW9ucz4gPSB7fTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVByb2Nlc3MoJ0luaXQgYWxsIGJ1bmRsZXMgc3RhcnQuLi4nKTtcclxuICAgICAgICBjb25zdCBidW5kbGVBc3NldHMgPSBhd2FpdCBidWlsZEFzc2V0TGlicmFyeS5xdWVyeUFzc2V0c0J5T3B0aW9ucyh7IGlzQnVuZGxlOiB0cnVlIH0pO1xyXG4gICAgICAgIG9wdGlvbnMuYnVuZGxlQ29uZmlncyA9IG9wdGlvbnMuYnVuZGxlQ29uZmlncyB8fCBbXTtcclxuICAgICAgICAvLyDmlbTnkIbmiYDmnInnmoQgYnVuZGxlIOS/oeaBr1xyXG4gICAgICAgIGlmIChvcHRpb25zLmJ1bmRsZUNvbmZpZ3MubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMuYnVuZGxlQ29uZmlncy5mb3JFYWNoKChjdXN0b21Db25maWcpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChjb2Nvc0J1bmRsZXMuaW5jbHVkZXMoY3VzdG9tQ29uZmlnLm5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJuYWxCdW5kbGVDb25maWdNYXBbY3VzdG9tQ29uZmlnLm5hbWVdID0gY3VzdG9tQ29uZmlnO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMucGF0Y2hQcm9qZWN0QnVuZGxlQ29uZmlnKGN1c3RvbUNvbmZpZyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWNvbmZpZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSW52YWxpZCBidW5kbGUgY29uZmlnOiAnLCBjdXN0b21Db25maWcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkQnVuZGxlKGNvbmZpZyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBvdGhlckJ1bmRsZU91dHB1dCA9IG9wdGlvbnMuYnVuZGxlQ29uZmlncy5sZW5ndGggPyBmYWxzZSA6ICh0aGlzLl90YXNrID8gdHJ1ZSA6IGZhbHNlKTtcclxuICAgICAgICBpZiAoIW9wdGlvbnMuYnVpbGRCdW5kbGVPbmx5KSB7XHJcbiAgICAgICAgICAgIC8vIOmdnuWPqiBCdW5kbGUg5p6E5bu65qih5byP5LiL77yM6ZyA6KaB6KGl5YWo5YW25LuW6aG555uu5YaF5a2Y5Zyo55qEIGJ1bmRsZSDkv6Hmga9cclxuICAgICAgICAgICAgYnVuZGxlQXNzZXRzLmZvckVhY2goKGFzc2V0SW5mbykgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5wYXRjaFByb2plY3RCdW5kbGVDb25maWcoe1xyXG4gICAgICAgICAgICAgICAgICAgIHJvb3Q6IGFzc2V0SW5mby51cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJycsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICghY29uZmlnIHx8IHRoaXMuYnVuZGxlTWFwW2NvbmZpZy5uYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbmZpZy5vdXRwdXQgPSBvdGhlckJ1bmRsZU91dHB1dDtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkQnVuZGxlKGNvbmZpZyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDmraPluLjmnoTlu7rmqKHlvI/vvIzmiJbogIXku4XmnoTlu7ogQnVuZGxlIOaooeW8j+acieWGhee9riBCdW5kbGUg55qE6Ieq5a6a5LmJ6YWN572u5omN6Ieq5Yqo6KGl5YWoXHJcbiAgICAgICAgaWYgKCFvcHRpb25zLmJ1aWxkQnVuZGxlT25seSB8fCBPYmplY3Qua2V5cyhpbnRlcm5hbEJ1bmRsZUNvbmZpZ01hcCkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIC8vIOajgOafpeWhq+WFhee8lui+keWZqOWGhee9riBCdW5kbGVcclxuICAgICAgICAgICAgdGhpcy5pbml0SW50ZXJuYWxCdW5kbGVDb25maWdzKGludGVybmFsQnVuZGxlQ29uZmlnTWFwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5idW5kbGVzID0gT2JqZWN0LnZhbHVlcyh0aGlzLmJ1bmRsZU1hcCkuc29ydCgoYnVuZGxlQSwgYnVuZGxlQikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGJ1bmRsZUIucHJpb3JpdHkgLSBidW5kbGVBLnByaW9yaXR5KSB8fCBjb21wYXJlVVVJRChidW5kbGVBLm5hbWUsIGJ1bmRsZUIubmFtZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8g5a2Y5ZyoIGJ1bmRsZUNvbmZpZ3Mg5pe277yM5aaC5p6c5b6q546v5a6M5rKh5pyJ6I635Y+W5Yiw5Lu75L2VIGJ1bmRsZSDliJnku6PooajphY3nva7mnInor6/vvIzpnIDopoHmiqXplJnkuK3mlq1cclxuICAgICAgICBpZiAoIXRoaXMuYnVuZGxlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJ1bmRsZSBjb25maWcsIHBsZWFzZSBjaGVjayB5b3VyIGJ1bmRsZSBjb25maWcnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51cGRhdGVQcm9jZXNzKGBOdW0gb2YgYnVuZGxlczogJHt0aGlzLmJ1bmRsZXMubGVuZ3RofS4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yid5aeL5YyW5YaF572uIEJ1bmRsZe+8iOeUseS6juS4gOS6m+WOhuWPsueahCBidW5kbGUg6KGM5Li66YWN572u77yM5YaF572uIEJ1bmRsZSDnmoTphY3nva7pnIDopoHljZXni6zlpITnkIbvvIlcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBpbml0SW50ZXJuYWxCdW5kbGVDb25maWdzKGludGVybmFsQnVuZGxlQ29uZmlnTWFwOiBSZWNvcmQ8c3RyaW5nLCBJQnVuZGxlT3B0aW9ucz4pIHtcclxuICAgICAgICAvLyDms6jmhI/pobrluo/vvIxTVEFSVF9TQ0VORSwgSU5URVJOQUwg55qE6buY6K6k6YWN572u5Lya5Y+W6IeqIE1BSU4g55qE6YWN572uXHJcbiAgICAgICAgY29uc3QgY29jb3NCdW5kbGVzOiBzdHJpbmdbXSA9IFtNQUlOLCBTVEFSVF9TQ0VORSwgSU5URVJOQUxdO1xyXG4gICAgICAgIGNvbnN0IG91dHB1dCA9IHRoaXMub3B0aW9ucy5idWlsZEJ1bmRsZU9ubHkgPyBmYWxzZSA6IHRydWU7XHJcblxyXG4gICAgICAgIGNvY29zQnVuZGxlcy5mb3JFYWNoKChuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChuYW1lID09PSBTVEFSVF9TQ0VORSAmJiAhdGhpcy5vcHRpb25zLnN0YXJ0U2NlbmVBc3NldEJ1bmRsZSAmJiAhaW50ZXJuYWxCdW5kbGVDb25maWdNYXBbbmFtZV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJ1aWxkQnVuZGxlT25seSAmJiAhaW50ZXJuYWxCdW5kbGVDb25maWdNYXBbbmFtZV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgY29uZmlnOiBJQnVuZGxlSW5pdE9wdGlvbnMgPSB0aGlzLmdldERlZmF1bHRCdW5kbGVDb25maWcobmFtZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbUNvbmZpZzogSUJ1bmRsZU9wdGlvbnMgPSBpbnRlcm5hbEJ1bmRsZUNvbmZpZ01hcFtuYW1lXSB8fCB7IG5hbWUgfTtcclxuICAgICAgICAgICAgY29uZmlnID0gZGVmYXVsdHNEZWVwKE9iamVjdC5hc3NpZ24oe30sIGN1c3RvbUNvbmZpZyksIGNvbmZpZyk7XHJcbiAgICAgICAgICAgIC8vIOaVtOeQhuWQjueahOaVsOaNru+8jOWFtuS7luWGhee9riBCdW5kbGUg5Y+v6IO95Lya5YaN5qyh5L2/55So77yM6ZyA6KaB5a2Y5YiwIGludGVybmFsQnVuZGxlQ29uZmlnTWFwXHJcbiAgICAgICAgICAgIGludGVybmFsQnVuZGxlQ29uZmlnTWFwW25hbWVdID0gY29uZmlnO1xyXG4gICAgICAgICAgICBjb25maWcub3V0cHV0ID0gY3VzdG9tQ29uZmlnLm91dHB1dCA/PyBvdXRwdXQ7XHJcbiAgICAgICAgICAgIGlmIChjdXN0b21Db25maWcubmFtZSA9PT0gTUFJTikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaXNSZW1vdGUgPSB0aGlzLm9wdGlvbnMubWFpbkJ1bmRsZUlzUmVtb3RlO1xyXG4gICAgICAgICAgICAgICAgLy8g5aaC5pyq6YWN572u6L+c56iL5pyN5Yqh5Zmo5Zyw5Z2A77yM5Y+W5raI5Li75YyF55qE6L+c56iL5YyF6YWN572u77yM6ZyA6KaB5a+85Ye655qEIGJ1bmRsZSDmiY3orablkYpcclxuICAgICAgICAgICAgICAgIGlmIChjdXN0b21Db25maWcub3V0cHV0ICYmIGlzUmVtb3RlICYmICF0aGlzLm9wdGlvbnMuc2VydmVyICYmICF0aGlzLm9wdGlvbnMucHJldmlldykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihpMThuLnQoJ2J1aWxkZXIud2Fybi5hc3NldF9idW5kbGVfaXNfcmVtb3RlX2ludmFsaWQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeU5hbWU6ICdtYWluJyxcclxuICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25maWcuaXNSZW1vdGUgPSBjdXN0b21Db25maWcuaXNSZW1vdGUgfHwgaXNSZW1vdGU7XHJcbiAgICAgICAgICAgICAgICBjb25maWcuY29tcHJlc3Npb25UeXBlID0gY3VzdG9tQ29uZmlnLmNvbXByZXNzaW9uVHlwZSB8fCB0aGlzLm9wdGlvbnMubWFpbkJ1bmRsZUNvbXByZXNzaW9uVHlwZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFNUQVJUX1NDRU5FLCBJTlRFUk5BTCDnmoTpu5jorqTphY3nva7mmK/moLnmja7lrp7pmYXnmoTpobnnm67nu4/pqozorr7lrprnmoTkuIDlpZfop4TliJlcclxuICAgICAgICAgICAgICAgIGNvbmZpZy5pc1JlbW90ZSA9ICEhKGN1c3RvbUNvbmZpZy5pc1JlbW90ZSA/PyAodGhpcy5vcHRpb25zLnN0YXJ0U2NlbmVBc3NldEJ1bmRsZSA/IGZhbHNlIDogaW50ZXJuYWxCdW5kbGVDb25maWdNYXBbTUFJTl0uaXNSZW1vdGUpKTtcclxuICAgICAgICAgICAgICAgIGlmICghY3VzdG9tQ29uZmlnLmNvbXByZXNzaW9uVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5jb21wcmVzc2lvblR5cGUgPSAodGhpcy5vcHRpb25zLnN0YXJ0U2NlbmVBc3NldEJ1bmRsZSB8fCBpbnRlcm5hbEJ1bmRsZUNvbmZpZ01hcFtNQUlOXS5jb21wcmVzc2lvblR5cGUgPT09IEJ1bmRsZUNvbXByZXNzaW9uVHlwZXMuTUVSR0VfREVQKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEJ1bmRsZUNvbXByZXNzaW9uVHlwZXMuTUVSR0VfQUxMX0pTT04gOiBpbnRlcm5hbEJ1bmRsZUNvbmZpZ01hcFtNQUlOXS5jb21wcmVzc2lvblR5cGUhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFRPRE8g5o+Q5Y+W5Lul5Y+K5Y2V5YWD5rWL6K+V77yM5ZCO57ut5q2k6YWN572u6L+Y5Lya6LCD5pW077yM5Li05pe25aSE55CGXHJcbiAgICAgICAgICAgIGlmICghY3VzdG9tQ29uZmlnLmRlc3QgJiYgY29uZmlnLmNvbXByZXNzaW9uVHlwZSA9PT0gJ3N1YnBhY2thZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25maWcuZGVzdCA9IGpvaW4oZGlybmFtZSh0aGlzLmRlc3REaXIpLCBCdWlsZEdsb2JhbEluZm8uU1VCUEFDS0FHRVNfSEVBREVSLCBjb25maWcubmFtZSk7XHJcbiAgICAgICAgICAgICAgICBjb25maWcuc2NyaXB0RGVzdCA9IGpvaW4oY29uZmlnLmRlc3QsIEJ1aWxkR2xvYmFsSW5mby5TQ1JJUFRfTkFNRSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWN1c3RvbUNvbmZpZy5kZXN0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25maWcuZGVzdCA9IGNvbmZpZy5pc1JlbW90ZSA/IGpvaW4oZGlybmFtZSh0aGlzLmRlc3REaXIpLCBCdWlsZEdsb2JhbEluZm8uUkVNT1RFX0hFQURFUiwgY29uZmlnLm5hbWUpIDogam9pbih0aGlzLmRlc3REaXIsIGNvbmZpZy5uYW1lKTtcclxuICAgICAgICAgICAgICAgIGNvbmZpZy5zY3JpcHREZXN0ID0gam9pbihjb25maWcuZGVzdCwgQnVpbGRHbG9iYWxJbmZvLlNDUklQVF9OQU1FKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKHRoaXMub3B0aW9ucy5tb3ZlUmVtb3RlQnVuZGxlU2NyaXB0ICYmIGNvbmZpZy5pc1JlbW90ZSkgJiYgIWN1c3RvbUNvbmZpZy5zY3JpcHREZXN0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25maWcuc2NyaXB0RGVzdCA9IHRoaXMuX3Rhc2sgPyBqb2luKHRoaXMuX3Rhc2sucmVzdWx0LnBhdGhzLmJ1bmRsZVNjcmlwdHMsIGNvbmZpZy5uYW1lLCBCdWlsZEdsb2JhbEluZm8uU0NSSVBUX05BTUUpIDogam9pbihjb25maWcuZGVzdCwgQnVpbGRHbG9iYWxJbmZvLlNDUklQVF9OQU1FKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGRCdW5kbGUoY29uZmlnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWhq+WFheaIkOWujOaVtOWPr+eUqOeahOmhueebriBCdW5kbGUg6YWN572u77yI5Lyg5YWl6Ieq5a6a5LmJ6YWN572uID4gQnVuZGxlIOaWh+S7tuWkuemFjee9riA+IOm7mOiupOmFjee9ru+8iVxyXG4gICAgICogQHBhcmFtIGN1c3RvbUNvbmZpZyBcclxuICAgICAqIEByZXR1cm5zIElCdW5kbGVJbml0T3B0aW9ucyB8IG51bGxcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBwYXRjaFByb2plY3RCdW5kbGVDb25maWcoY3VzdG9tQ29uZmlnOiBQYXJ0aWFsPElCdW5kbGVPcHRpb25zPik6IElCdW5kbGVJbml0T3B0aW9ucyB8IG51bGwge1xyXG4gICAgICAgIC8vIOmdnuWGhee9riBCdW5kbGUg55qE6YWN572u5b+F6aG75aGr5YaZIHJvb3Qg6YCJ6aG5XHJcbiAgICAgICAgaWYgKCFjdXN0b21Db25maWcucm9vdCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBJbnZhbGlkIEJ1bmRsZSBjb25maWcgd2l0aCBidW5kbGUgcm9vdDoke2N1c3RvbUNvbmZpZy5yb290fWApO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdXVpZCA9IGJ1aWxkQXNzZXRMaWJyYXJ5LnVybDJ1dWlkKGN1c3RvbUNvbmZpZy5yb290KTtcclxuICAgICAgICBpZiAoIXV1aWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgSW52YWxpZCBCdW5kbGUgY29uZmlnIHdpdGggYnVuZGxlICR7Y3VzdG9tQ29uZmlnLnJvb3R9YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYXNzZXRJbmZvID0gYnVpbGRBc3NldExpYnJhcnkuZ2V0QXNzZXQodXVpZCk7XHJcbiAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcclxuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgSW52YWxpZCBCdW5kbGUgY29uZmlnIHdpdGggYnVuZGxlICR7Y3VzdG9tQ29uZmlnLnJvb3R9YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgeyBidW5kbGVGaWx0ZXJDb25maWcsIHByaW9yaXR5LCBidW5kbGVDb25maWdJRCwgYnVuZGxlTmFtZSB9ID0gYXNzZXRJbmZvLm1ldGEudXNlckRhdGE7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGN1c3RvbUNvbmZpZy5uYW1lIHx8IGJ1bmRsZU5hbWUgfHwgZ2V0QnVuZGxlRGVmYXVsdE5hbWUoYXNzZXRJbmZvKTtcclxuICAgICAgICBjb25zdCB1c2VyQnVuZGxlQ29uZmlnID0gdGhpcy5nZXRVc2VyQ29uZmlnKGJ1bmRsZUNvbmZpZ0lEKTtcclxuICAgICAgICBsZXQgY29uZmlnID0gdGhpcy5nZXREZWZhdWx0QnVuZGxlQ29uZmlnKG5hbWUpO1xyXG4gICAgICAgIGNvbnN0IHZhbGlkQ3VzdG9tQ29uZmlnID0gZGVmYXVsdHNEZWVwKHtcclxuICAgICAgICAgICAgY29tcHJlc3Npb25UeXBlOiB1c2VyQnVuZGxlQ29uZmlnICYmIHVzZXJCdW5kbGVDb25maWcuY29tcHJlc3Npb25UeXBlLFxyXG4gICAgICAgICAgICBpc1JlbW90ZTogdXNlckJ1bmRsZUNvbmZpZyAmJiB1c2VyQnVuZGxlQ29uZmlnLmlzUmVtb3RlLFxyXG4gICAgICAgICAgICBwcmlvcml0eSxcclxuICAgICAgICAgICAgYnVuZGxlRmlsdGVyQ29uZmlnLFxyXG4gICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgIH0sIGN1c3RvbUNvbmZpZyk7XHJcbiAgICAgICAgY29uZmlnID0gZGVmYXVsdHNEZWVwKHZhbGlkQ3VzdG9tQ29uZmlnLCBjb25maWcpO1xyXG4gICAgICAgIGlmICghdXNlckJ1bmRsZUNvbmZpZykge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEludmFsaWQgQnVuZGxlIGNvbmZpZyBJRCAke2J1bmRsZUNvbmZpZ0lEfSBpbiBidW5kbGUgJHtjdXN0b21Db25maWcucm9vdH0sIHRoZSBidW5kbGUgY29uZmlnIHdpbGwgdXNlIHRoZSBkZWZhdWx0IGNvbmZpZyAke0pTT04uc3RyaW5naWZ5KGNvbmZpZyl9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOacqumFjee9rui/nOeoi+acjeWKoeWZqOWcsOWdgO+8jOe7meeUqOaIt+itpuWRiuaPkOekulxyXG4gICAgICAgIGlmIChjb25maWcuaXNSZW1vdGUgJiYgIXRoaXMub3B0aW9ucy5zZXJ2ZXIgJiYgIXRoaXMub3B0aW9ucy5wcmV2aWV3KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihpMThuLnQoJ2J1aWxkZXIud2Fybi5hc3NldF9idW5kbGVfaXNfcmVtb3RlX2ludmFsaWQnLCB7XHJcbiAgICAgICAgICAgICAgICBkaXJlY3RvcnlOYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUT0RPIOaPkOWPluS7peWPiuWNleWFg+a1i+ivle+8jOWQjue7reatpOmFjee9rui/mOS8muiwg+aVtO+8jOS4tOaXtuWkhOeQhlxyXG4gICAgICAgIGlmICghY3VzdG9tQ29uZmlnLmRlc3QgJiYgY29uZmlnLmNvbXByZXNzaW9uVHlwZSA9PT0gJ3N1YnBhY2thZ2UnICYmICF0aGlzLm9wdGlvbnMuYnVpbGRCdW5kbGVPbmx5KSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5kZXN0ID0gam9pbihkaXJuYW1lKHRoaXMuZGVzdERpciksIEJ1aWxkR2xvYmFsSW5mby5TVUJQQUNLQUdFU19IRUFERVIsIGNvbmZpZy5uYW1lKTtcclxuICAgICAgICAgICAgY29uZmlnLnNjcmlwdERlc3QgPSBqb2luKGNvbmZpZy5kZXN0LCBCdWlsZEdsb2JhbEluZm8uU0NSSVBUX05BTUUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIWN1c3RvbUNvbmZpZy5kZXN0ICYmIGNvbmZpZy5pc1JlbW90ZSAmJiAhdGhpcy5vcHRpb25zLmJ1aWxkQnVuZGxlT25seSkge1xyXG4gICAgICAgICAgICBjb25maWcuZGVzdCA9IGpvaW4oZGlybmFtZSh0aGlzLmRlc3REaXIpLCBCdWlsZEdsb2JhbEluZm8uUkVNT1RFX0hFQURFUiwgY29uZmlnLm5hbWUpO1xyXG4gICAgICAgICAgICBjb25maWcuc2NyaXB0RGVzdCA9IGpvaW4oY29uZmlnLmRlc3QsIEJ1aWxkR2xvYmFsSW5mby5TQ1JJUFRfTkFNRSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKHRoaXMub3B0aW9ucy5tb3ZlUmVtb3RlQnVuZGxlU2NyaXB0ICYmIGNvbmZpZy5pc1JlbW90ZSkgJiYgIWN1c3RvbUNvbmZpZy5zY3JpcHREZXN0KSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5zY3JpcHREZXN0ID0gdGhpcy5fdGFzayA/IGpvaW4odGhpcy5fdGFzay5yZXN1bHQucGF0aHMuYnVuZGxlU2NyaXB0cywgY29uZmlnLm5hbWUsIEJ1aWxkR2xvYmFsSW5mby5TQ1JJUFRfTkFNRSkgOiBqb2luKGNvbmZpZy5kZXN0LCBCdWlsZEdsb2JhbEluZm8uU0NSSVBUX05BTUUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29uZmlnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yid5aeL5YyWIGJ1bmRsZSDliIbnu4TlhoXnmoTmoLnotYTmupDkv6Hmga9cclxuICAgICAqIOWIneWni+WMliBidW5kbGUg5YaF55qE5ZCE6aG55LiN5ZCM55qE5aSE55CG5Lu75YqhXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgaW5pdEJ1bmRsZVJvb3RBc3NldHMoKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVQcm9jZXNzKCdJbml0IGJ1bmRsZSByb290IGFzc2V0cyBzdGFydC4uLicpO1xyXG4gICAgICAgIGlmICh0aGlzLmJ1bmRsZU1hcFtJTlRFUk5BTF0pIHtcclxuICAgICAgICAgICAgY29uc3QgaW50ZXJuYWxBc3NldHMgPSBhd2FpdCBxdWVyeVByZWxvYWRBc3NldExpc3QodGhpcy5vcHRpb25zLmluY2x1ZGVNb2R1bGVzLCB0aGlzLm9wdGlvbnMuZW5naW5lSW5mby50eXBlc2NyaXB0LnBhdGgpO1xyXG4gICAgICAgICAgICAvLyDmt7vliqDlvJXmk47kvp3otZbnmoTpooTliqDovb3lhoXnva7otYTmupAv6ISa5pys5YiwIGludGVybmFsIOWMheWGhVxyXG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBRdWVyeSBwcmVsb2FkIGFzc2V0cy9zY3JpcHRzIGZyb20gY2MuY29uZmlnLmpzb25gKTtcclxuICAgICAgICAgICAgaW50ZXJuYWxBc3NldHMuZm9yRWFjaCgodXVpZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idW5kbGVNYXBbSU5URVJOQUxdLmFkZFJvb3RBc3NldChidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldCh1dWlkKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsYXVuY2hCdW5kbGUgPSB0aGlzLmJ1bmRsZU1hcFtTVEFSVF9TQ0VORV0gfHwgdGhpcy5idW5kbGVNYXBbTUFJTl07XHJcbiAgICAgICAgY29uc3QgYXNzZXRzID0gYnVpbGRBc3NldExpYnJhcnkuYXNzZXRzO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXNzZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0SW5mbyA9IGFzc2V0c1tpXTtcclxuICAgICAgICAgICAgaWYgKGFzc2V0SW5mby5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBhc3NldFR5cGUgPSBidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldFByb3BlcnR5KGFzc2V0SW5mbywgJ3R5cGUnKTtcclxuICAgICAgICAgICAgdGhpcy5jYWNoZS5hZGRBc3NldChhc3NldEluZm8sIGFzc2V0VHlwZSk7XHJcbiAgICAgICAgICAgIGxldCBidW5kbGVXaXRoQXNzZXQgPSB0aGlzLmJ1bmRsZXMuZmluZCgoYnVuZGxlKSA9PiBhc3NldEluZm8udXJsLnN0YXJ0c1dpdGgoYnVuZGxlLnJvb3QgKyAnLycpKTtcclxuICAgICAgICAgICAgLy8g5LiN5ZyoIEJ1bmRsZSDlhoXnmoTohJrmnKzpu5jorqTliqDliLDlkK/liqggYnVuZGxlIOWGhVxyXG4gICAgICAgICAgICBpZiAoYXNzZXRUeXBlID09PSAnY2MuU2NyaXB0Jykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFzc2V0SW5mby51cmwuc3RhcnRzV2l0aCgnZGI6Ly9pbnRlcm5hbCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaW50ZXJuYWwgZGIg5LiL55qE6ISa5pys77yM5LiN5YWo6YeP5p6E5bu677yM5LulIGRlcGVuZGVudFNjcmlwdHMg5Li65YeGXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBidW5kbGVXaXRoQXNzZXQgPSBidW5kbGVXaXRoQXNzZXQgfHwgbGF1bmNoQnVuZGxlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGJ1bmRsZVdpdGhBc3NldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ1bmRsZVdpdGhBc3NldC5hZGRTY3JpcHQoYXNzZXRJbmZvKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDlnLrmma/kvZzkuLrnibnmrorotYTmupDnrqHnkIY6IOWPquimgeWMheWQq+WcqCBidW5kbGUg5YaF6buY6K6k5Y+C5LiO5p6E5bu6ID4g5rKh5pyJ5oyH5a6aIHNjZW5lcyDnmoTmg4XlhrXkuIvpu5jorqTlj4LkuI4gPiDmjIflrpogc2NlbmVzIOaMieeFp+atpOWQjeWNlVxyXG4gICAgICAgICAgICBpZiAoYXNzZXRUeXBlID09PSAnY2MuU2NlbmVBc3NldCcgJiYgKGJ1bmRsZVdpdGhBc3NldCB8fCAhdGhpcy5vcHRpb25zLnNjZW5lcyB8fCB0aGlzLm9wdGlvbnMuc2NlbmVzLmZpbmQoaXRlbSA9PiBpdGVtLnV1aWQgPT09IGFzc2V0SW5mby51dWlkKSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIOWIneWni+WcuuaZr+WKoOWFpeWIsOWIneWni+WcuuaZryBidW5kbGUg5YaFXHJcbiAgICAgICAgICAgICAgICBpZiAobGF1bmNoQnVuZGxlICYmIHRoaXMub3B0aW9ucy5zdGFydFNjZW5lID09PSBhc3NldEluZm8udXVpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhdW5jaEJ1bmRsZS5hZGRSb290QXNzZXQoYXNzZXRJbmZvKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoYnVuZGxlV2l0aEFzc2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnVuZGxlV2l0aEFzc2V0LmFkZFJvb3RBc3NldChhc3NldEluZm8pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDkuI3lnKggYnVuZGxlIOWGheeahOWFtuS7luWcuuaZr++8jOaUvuWFpeS4u+WMhe+8jOeUseS6juaUr+aMgSBidW5kbGUg5YmU6Zmk77yMbWFpbiBidW5kbGUg5Y+v6IO95LiN5a2Y5ZyoXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idW5kbGVNYXBbTUFJTl0gJiYgdGhpcy5idW5kbGVNYXBbTUFJTl0uYWRkUm9vdEFzc2V0KGFzc2V0SW5mbyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGFzc2V0SW5mby5zb3VyY2UuZW5kc1dpdGgoJy5wYWMnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGFjQXNzZXRzLnB1c2goYXNzZXRJbmZvLnV1aWQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYnVuZGxlV2l0aEFzc2V0ICYmIGFzc2V0VHlwZSAhPT0gJ2NjLlNjZW5lQXNzZXQnKSB7XHJcbiAgICAgICAgICAgICAgICBidW5kbGVXaXRoQXNzZXQuYWRkUm9vdEFzc2V0KGFzc2V0SW5mbyk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChsYXVuY2hCdW5kbGUpIHtcclxuICAgICAgICAgICAgLy8g5Yqg5YWl6aG555uu6K6+572u5Lit55qEIHJlbmRlclBpcGVsaW5lIOi1hOa6kFxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJlbmRlclBpcGVsaW5lKSB7XHJcbiAgICAgICAgICAgICAgICBsYXVuY2hCdW5kbGUuYWRkUm9vdEFzc2V0KGJ1aWxkQXNzZXRMaWJyYXJ5LmdldEFzc2V0KHRoaXMub3B0aW9ucy5yZW5kZXJQaXBlbGluZSkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDliqDlhaXpobnnm67orr7nva7kuK3nmoTniannkIbmnZDotKhcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5waHlzaWNzQ29uZmlnLmRlZmF1bHRNYXRlcmlhbCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYXNzZXQgPSBidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldCh0aGlzLm9wdGlvbnMucGh5c2ljc0NvbmZpZy5kZWZhdWx0TWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICAgICAgbGF1bmNoQnVuZGxlLmFkZFJvb3RBc3NldChhc3NldCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgICBOdW1iZXIgb2YgYWxsIHNjZW5lczogJHt0aGlzLmNhY2hlLnNjZW5lcy5sZW5ndGh9YCk7XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgICBOdW1iZXIgb2YgYWxsIHNjcmlwdHM6ICR7dGhpcy5jYWNoZS5zY3JpcHRVdWlkcy5sZW5ndGh9YCk7XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgICBOdW1iZXIgb2Ygb3RoZXIgYXNzZXRzOiAke3RoaXMuY2FjaGUuYXNzZXRVdWlkcy5sZW5ndGh9YCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVQcm9jZXNzKCdJbml0IGJ1bmRsZSByb290IGFzc2V0cyBzdWNjZXNzLi4uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmjInnhacgQnVuZGxlIOS8mOWFiOe6p+aVtOeQhiBCdW5kbGUg55qE6LWE5rqQ5YiX6KGoXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgaW5pdEJ1bmRsZVNoYXJlQXNzZXRzKCkge1xyXG4gICAgICAgIC8vIOmihOiniOaXoOmcgOagueaNruS8mOWFiOe6p+WIhuaekOWFseS6q+i1hOa6kO+8jOmihOiniOacrOi6q+WwseaYr+aMiemcgOWKoOi9veeahO+8jOS4jemcgOimgeaPkOWJjeaVtOeQhuWujOaVtOeahCBidW5kbGUg6LWE5rqQ5YiX6KGoXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wcmV2aWV3KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51cGRhdGVQcm9jZXNzKCdJbml0IGJ1bmRsZSBzaGFyZSBhc3NldHMgc3RhcnQuLi4nKTtcclxuICAgICAgICAvLyDlpITnkIblhbHkuqvotYTmupBcclxuICAgICAgICBjb25zdCBzaGFyZWRBc3NldHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuICAgICAgICBjb25zdCBtYW5hZ2VyID0gdGhpcztcclxuICAgICAgICBhc3luYyBmdW5jdGlvbiB3YWxrRGVwZW5kKHV1aWQ6IHN0cmluZywgYnVuZGxlOiBJQnVuZGxlLCBjaGVja2VkOiBTZXQ8c3RyaW5nPiwgZmF0aGVyVXVpZD86IHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAoY2hlY2tlZC5oYXModXVpZCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBhc3NldCA9IGJ1aWxkQXNzZXRMaWJyYXJ5LmdldEFzc2V0KHV1aWQpO1xyXG4gICAgICAgICAgICBpZiAoIWFzc2V0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZmF0aGVyVXVpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IGZhdGhlckFzc2V0ID0gYnVpbGRBc3NldExpYnJhcnkuZ2V0QXNzZXQoZmF0aGVyVXVpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS53YXJuKGkxOG4udCgnYnVpbGRlci5lcnJvci5yZXF1aXJlZF9hc3NldF9taXNzaW5nJywge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB1dWlkOiBge2Fzc2V0KCR7dXVpZH0pfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGZhdGhlclVybDogYHthc3NldCgke2ZhdGhlckFzc2V0LnVybH0pfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfSkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oaTE4bi50KCdidWlsZGVyLmVycm9yLm1pc3NpbmdfYXNzZXQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IGB7YXNzZXQoJHt1dWlkfSl9YCxcclxuICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2hlY2tlZC5hZGQodXVpZCk7XHJcbiAgICAgICAgICAgIGJ1bmRsZS5hZGRBc3NldChhc3NldCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaGFzQ0NPTkZvcm1hdEFzc2V0SW5MaWJyYXJ5KGFzc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgLy8gVE9ETyDpnIDopoHkvJjljJbmtYHnqIvvvIzlkI7nu63lj6/og73ooqsgcmVtb3ZlQXNzZXRcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNjb25FeHRlbnNpb24gPSBnZXREZXNpcmVkQ0NPTkV4dGVuc2lvbk1hcChtYW5hZ2VyLm9wdGlvbnMuYXNzZXRTZXJpYWxpemVPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIChidW5kbGUuY29uZmlnLmV4dGVuc2lvbk1hcFtjY29uRXh0ZW5zaW9uXSA/Pz0gW10pLnB1c2goYXNzZXQudXVpZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChzaGFyZWRBc3NldHNbdXVpZF0pIHtcclxuICAgICAgICAgICAgICAgIGJ1bmRsZS5hZGRSZWRpcmVjdCh1dWlkLCBzaGFyZWRBc3NldHNbdXVpZF0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGRlcGVuZHMgPSBhd2FpdCBidWlsZEFzc2V0TGlicmFyeS5nZXREZXBlbmRVdWlkcyh1dWlkKTtcclxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoXHJcbiAgICAgICAgICAgICAgICBkZXBlbmRzLm1hcChhc3luYyAoZGVwZW5kVXVpZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB3YWxrRGVwZW5kKGRlcGVuZFV1aWQsIGJ1bmRsZSwgY2hlY2tlZCwgdXVpZCk7XHJcbiAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGJ1bmRsZUdyb3VwSW5Qcmlvcml0eSA9IHRoaXMuYnVuZGxlR3JvdXBJblByaW9yaXR5O1xyXG4gICAgICAgIC8vIOmAkuW9kuWkhOeQhuaJgOaciSBidW5kbGUg5Lit5Zy65pmv5LiO5qC56LWE5rqQXHJcbiAgICAgICAgZm9yIChjb25zdCBidW5kbGVHcm91cCBvZiBidW5kbGVHcm91cEluUHJpb3JpdHkpIHtcclxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoYnVuZGxlR3JvdXAubWFwKGFzeW5jIChidW5kbGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChidW5kbGUucm9vdEFzc2V0cy5tYXAoYXN5bmMgKHV1aWQpID0+IGF3YWl0IHdhbGtEZXBlbmQodXVpZCwgYnVuZGxlLCBjaGVja2VkKSkpO1xyXG4gICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICAvLyDmr4/lvqrnjq/kuIDnu4TvvIzlsIbor6Xnu4TljIXlkKvnmoQgdXVpZCDlop7liqDliLAgc2hhcmVkQXNzZXRzIOS4re+8jOS+m+S4i+S4gOe7hCBidW5kbGUg5aSN55SoXHJcbiAgICAgICAgICAgIGJ1bmRsZUdyb3VwLmZvckVhY2goKGJ1bmRsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYnVuZGxlLmFzc2V0c1dpdGhvdXRSZWRpcmVjdC5mb3JFYWNoKCh1dWlkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzaGFyZWRBc3NldHNbdXVpZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hhcmVkQXNzZXRzW3V1aWRdID0gYnVuZGxlLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVwZGF0ZVByb2Nlc3MoJ0luaXQgYnVuZGxlIHNoYXJlIGFzc2V0cyBzdWNjZXNzLi4uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja7kuI3lkIznmoTpgInpobnlgZrkuI3lkIznmoQgYnVuZGxlIOS7u+WKoeazqOWGjFxyXG4gICAgICovXHJcbiAgICBhc3luYyBidW5kbGVEYXRhVGFzaygpIHtcclxuICAgICAgICBjb25zdCBpbWFnZUNvbXByZXNzTWFuYWdlciA9IHRoaXMuaW1hZ2VDb21wcmVzc01hbmFnZXI7XHJcbiAgICAgICAgaW1hZ2VDb21wcmVzc01hbmFnZXIgJiYgKGF3YWl0IGltYWdlQ29tcHJlc3NNYW5hZ2VyLmluaXQoKSk7XHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwodGhpcy5idW5kbGVzLm1hcChhc3luYyAoYnVuZGxlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghYnVuZGxlLm91dHB1dCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGF3YWl0IGhhbmRsZUpzb25Hcm91cChidW5kbGUpO1xyXG4gICAgICAgICAgICBhd2FpdCBoYW5kbGVCaW5Hcm91cChidW5kbGUsIHRoaXMub3B0aW9ucy5iaW5Hcm91cENvbmZpZyk7XHJcbiAgICAgICAgICAgIGltYWdlQ29tcHJlc3NNYW5hZ2VyICYmIGF3YWl0IGJ1bmRsZURhdGFUYXNrKGJ1bmRsZSwgaW1hZ2VDb21wcmVzc01hbmFnZXIpO1xyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOe6ueeQhuWOi+e8qeWkhOeQhlxyXG4gICAgICogQHJldHVybnMgXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgY29tcHJlc3NJbWFnZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaW1hZ2VDb21wcmVzc01hbmFnZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVwZGF0ZVByb2Nlc3MoJ0NvbXByZXNzIGltYWdlIHN0YXJ0Li4uJyk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5pbWFnZUNvbXByZXNzTWFuYWdlci5ydW4oKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVByb2Nlc3MoJ0NvbXByZXNzIGltYWdlIHN1Y2Nlc3MuLi4nKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaJp+ihjOiHquWKqOWbvumbhuS7u+WKoVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFzeW5jIHBhY2tJbWFnZSgpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVByb2Nlc3MoJ1BhY2sgSW1hZ2VzIHN0YXJ0Jyk7XHJcbiAgICAgICAgbmV3Q29uc29sZS50cmFja1RpbWVTdGFydCgnYnVpbGRlcjpwYWNrLWF1dG8tYXRsYXMtaW1hZ2UnKTtcclxuICAgICAgICAvLyDnoa7orqTlrp7pmYXlj4LkuI7mnoTlu7rnmoTlm77pm4botYTmupDliJfooahcclxuICAgICAgICBsZXQgcGFjQXNzZXRzOiAoSUFzc2V0KVtdID0gW107XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5idWlsZEJ1bmRsZU9ubHkpIHtcclxuICAgICAgICAgICAgdGhpcy5fcGFjQXNzZXRzLnJlZHVjZSgocGFjQXNzZXRzLCBwYWNVdWlkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYWNJbmZvID0gYnVpbGRBc3NldExpYnJhcnkuZ2V0QXNzZXQocGFjVXVpZCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbkJ1bmRsZSA9IHRoaXMuYnVuZGxlcy5zb21lKChidW5kbGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWJ1bmRsZS5vdXRwdXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodXRpbHMuUGF0aC5jb250YWlucyhwYWNJbmZvLnVybCwgYnVuZGxlLnJvb3QpIHx8IHV0aWxzLlBhdGguY29udGFpbnMoYnVuZGxlLnJvb3QsIHBhY0luZm8udXJsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmIChpbkJ1bmRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhY0Fzc2V0cy5wdXNoKHBhY0luZm8pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhY0Fzc2V0cztcclxuICAgICAgICAgICAgfSwgcGFjQXNzZXRzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyDpnZ7ni6znq4vmnoTlu7ogQnVuZGxlIOaooeW8j+S4i++8jOaJgOacieeahOWbvumbhumDvemcgOimgeWPguS4juaehOW7uu+8jFRPRE8g6ZyA6KaB5LyY5YyWXHJcbiAgICAgICAgICAgIHBhY0Fzc2V0cyA9IHRoaXMuX3BhY0Fzc2V0cy5tYXAoKHBhY1V1aWQpID0+IGJ1aWxkQXNzZXRMaWJyYXJ5LmdldEFzc2V0KHBhY1V1aWQpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFwYWNBc3NldHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ05vIHBhYyBhc3NldHMnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmRlYnVnKGBOdW1iZXIgb2YgcGFjIGFzc2V0czogJHtwYWNBc3NldHMubGVuZ3RofWApO1xyXG4gICAgICAgIGNvbnN0IGluY2x1ZGVBc3NldHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICAgICAgICB0aGlzLmJ1bmRsZXMuZm9yRWFjaCgoYnVuZGxlID0+IGJ1bmRsZS5hc3NldHMuZm9yRWFjaCgoYXNzZXQpID0+IGluY2x1ZGVBc3NldHMuYWRkKGFzc2V0KSkpKTtcclxuICAgICAgICBjb25zdCB7IFRleHR1cmVQYWNrZXIgfSA9IGF3YWl0IGltcG9ydCgnLi4vdGV4dHVyZS1wYWNrZXIvaW5kZXgnKTtcclxuICAgICAgICB0aGlzLnBhY2tSZXN1bHRzID0gYXdhaXQgKGF3YWl0IG5ldyBUZXh0dXJlUGFja2VyKCkuaW5pdChwYWNBc3NldHMsIEFycmF5LmZyb20oaW5jbHVkZUFzc2V0cykpKS5wYWNrKCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLnBhY2tSZXN1bHRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdObyBwYWNrIHJlc3VsdHMnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbWFnZUNvbXByZXNzTWFuYWdlciA9IHRoaXMuaW1hZ2VDb21wcmVzc01hbmFnZXI7XHJcbiAgICAgICAgY29uc3QgZGVwZW5kZWRBc3NldHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHt9O1xyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoYE51bWJlciBvZiBwYWNrIHJlc3VsdHM6ICR7dGhpcy5wYWNrUmVzdWx0cy5sZW5ndGh9YCk7XHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwodGhpcy5wYWNrUmVzdWx0cy5tYXAoYXN5bmMgKHBhY1JlcykgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXBhY1Jlcy5yZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ05vIHBhY2sgcmVzdWx0IGluIHBhYycsIHBhY1Jlcy51dWlkKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBhdGxhc2VzID0gcGFjUmVzLnJlc3VsdC5hdGxhc2VzO1xyXG4gICAgICAgICAgICBjb25zdCBhc3NldEluZm8gPSBidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldChwYWNSZXMudXVpZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgY3JlYXRlQXNzZXRJbnN0YW5jZSB9ID0gYXdhaXQgaW1wb3J0KCcuLi90ZXh0dXJlLXBhY2tlci9wYWMtaW5mbycpO1xyXG4gICAgICAgICAgICAvLyBhdGxhc2VzIOaYr+WPr+iiq+W6j+WIl+WMlueahOe8k+WtmOS/oeaBr++8jOS4jeWMheWQqyBzcHJpdGVGcmFtZXNcclxuICAgICAgICAgICAgY29uc3QgcGFjSW5zdGFuY2VzID0gY3JlYXRlQXNzZXRJbnN0YW5jZShhdGxhc2VzLCBhc3NldEluZm8sIHBhY1Jlcy5zcHJpdGVGcmFtZXMpO1xyXG4gICAgICAgICAgICBwYWNJbnN0YW5jZXMuZm9yRWFjaCgoaW5zdGFuY2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FjaGUuYWRkSW5zdGFuY2UoaW5zdGFuY2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ3N0YXJ0IGNvbGxlY3QgZGVwZW5kIGFzc2V0cyBpbiBwYWMnLCBwYWNSZXMudXVpZCk7XHJcbiAgICAgICAgICAgIC8vIGluY2x1ZGVBc3NldHMg5pivIEJ1bmRsZSDmoLnmja7kvp3otZblhbPns7vmlbTnkIbnmoTphY3nva7vvIzljIXlkKvkuobmiYDmnInmnInooqvkvp3otZbnmoTmnoTlu7rotYTmupBcclxuICAgICAgICAgICAgYXdhaXQgY29sbGVjdERlcGVuZEFzc2V0cyhwYWNSZXMudXVpZCwgaW5jbHVkZUFzc2V0cywgZGVwZW5kZWRBc3NldHMpO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHNwcml0ZUZyYW1lSW5mbyBvZiBwYWNSZXMuc3ByaXRlRnJhbWVJbmZvcykge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgY29sbGVjdERlcGVuZEFzc2V0cyhzcHJpdGVGcmFtZUluZm8udXVpZCwgaW5jbHVkZUFzc2V0cywgZGVwZW5kZWRBc3NldHMpO1xyXG5cclxuICAgICAgICAgICAgICAgIGF3YWl0IGNvbGxlY3REZXBlbmRBc3NldHMoc3ByaXRlRnJhbWVJbmZvLnRleHR1cmVVdWlkLCBpbmNsdWRlQXNzZXRzLCBkZXBlbmRlZEFzc2V0cyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVwZW5kZWRBc3NldHNbc3ByaXRlRnJhbWVJbmZvLnRleHR1cmVVdWlkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOeUseS6juWbvumbhuWwj+WbvuWGhemDqOS5i+mXtOS8muWtmOWcqOS6kuebuOS+nei1lu+8jOWxnuS6juS8quS+nei1lu+8jOS4jeS9nOS4uuecn+WunumhueebruS+nei1luiAg+iZkVxyXG4gICAgICAgICAgICAgICAgICAgIGRlcGVuZGVkQXNzZXRzW3Nwcml0ZUZyYW1lSW5mby50ZXh0dXJlVXVpZF0gPSBkZXBlbmRlZEFzc2V0c1tzcHJpdGVGcmFtZUluZm8udGV4dHVyZVV1aWRdLmZpbHRlcigodXVpZCkgPT4gdXVpZCAhPT0gc3ByaXRlRnJhbWVJbmZvLnV1aWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZGVwZW5kZWRBc3NldHNbc3ByaXRlRnJhbWVJbmZvLnRleHR1cmVVdWlkXS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRlcGVuZGVkQXNzZXRzW3Nwcml0ZUZyYW1lSW5mby50ZXh0dXJlVXVpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGF3YWl0IGNvbGxlY3REZXBlbmRBc3NldHMoc3ByaXRlRnJhbWVJbmZvLmltYWdlVXVpZCwgaW5jbHVkZUFzc2V0cywgZGVwZW5kZWRBc3NldHMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRlcGVuZGVkQXNzZXRzW3Nwcml0ZUZyYW1lSW5mby5pbWFnZVV1aWRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVwZW5kZWRBc3NldHNbc3ByaXRlRnJhbWVJbmZvLmltYWdlVXVpZF0gPSBkZXBlbmRlZEFzc2V0c1tzcHJpdGVGcmFtZUluZm8uaW1hZ2VVdWlkXS5maWx0ZXIoKHV1aWQpID0+IHV1aWQgIT09IHNwcml0ZUZyYW1lSW5mby50ZXh0dXJlVXVpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkZXBlbmRlZEFzc2V0c1tzcHJpdGVGcmFtZUluZm8uaW1hZ2VVdWlkXS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRlcGVuZGVkQXNzZXRzW3Nwcml0ZUZyYW1lSW5mby5pbWFnZVV1aWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpbWFnZUNvbXByZXNzTWFuYWdlciAmJiBpbWFnZUNvbXByZXNzTWFuYWdlci5yZW1vdmVUYXNrKHF1ZXJ5SW1hZ2VBc3NldEZyb21TdWJBc3NldEJ5VXVpZChzcHJpdGVGcmFtZUluZm8udXVpZCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ3N0YXJ0IHNvcnQgYnVuZGxlIGluIHBhYycsIHBhY1Jlcy51dWlkKTtcclxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoKGF0bGFzZXMpLm1hcChhc3luYyAoYXRsYXMpID0+IHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHNvcnRCdW5kbGVJblBhYyh0aGlzLmJ1bmRsZXMsIGF0bGFzLCBwYWNSZXMsIGRlcGVuZGVkQXNzZXRzLCBpbWFnZUNvbXByZXNzTWFuYWdlcik7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnZW5kIHNvcnQgYnVuZGxlIGluIHBhYycsIHBhY1Jlcy51dWlkKTtcclxuICAgICAgICB9KSk7XHJcbiAgICAgICAgYXdhaXQgbmV3Q29uc29sZS50cmFja1RpbWVFbmQoJ2J1aWxkZXI6cGFjay1hdXRvLWF0bGFzLWltYWdlJywgeyBvdXRwdXQ6IHRydWUgfSk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVQcm9jZXNzKCdQYWNrIEltYWdlcyBzdWNjZXNzJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnvJbor5Hpobnnm67ohJrmnKxcclxuICAgICAqL1xyXG4gICAgYXN5bmMgYnVpbGRTY3JpcHQoKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVQcm9jZXNzKGAke2kxOG4udCgnYnVpbGRlci50YXNrcy5idWlsZF9wcm9qZWN0X3NjcmlwdCcpfSBzdGFydC4uLmApO1xyXG4gICAgICAgIG5ld0NvbnNvbGUudHJhY2tUaW1lU3RhcnQoJ2J1aWxkZXI6YnVpbGQtcHJvamVjdC1zY3JpcHQnKTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0gJiYgIXRoaXMub3B0aW9ucy5idWlsZFNjcmlwdFBhcmFtLmNvbW1vbkRpcikge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuYnVpbGRTY3JpcHRQYXJhbS5jb21tb25EaXIgPSBqb2luKHRoaXMuZGVzdERpciwgJ3NyYycsICdjaHVua3MnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgdGhpcy5zY3JpcHRCdWlsZGVyLmluaXRQcm9qZWN0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xyXG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuc2NyaXB0QnVpbGRlci5idWlsZEJ1bmRsZVNjcmlwdCh0aGlzLmJ1bmRsZXMpO1xyXG4gICAgICAgIGNvbnN0IGJ1aWxkUHJvamVjdFRpbWUgPSBhd2FpdCBuZXdDb25zb2xlLnRyYWNrVGltZUVuZCgnYnVpbGRlcjpidWlsZC1wcm9qZWN0LXNjcmlwdCcpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlUHJvY2VzcyhgJHtpMThuLnQoJ2J1aWxkZXIudGFza3MuYnVpbGRfcHJvamVjdF9zY3JpcHQnKX0gaW4gKCR7YnVpbGRQcm9qZWN0VGltZX0gbXMpIOKImmApO1xyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDovpPlh7rmiYDmnInnmoQgYnVuZGxlIOi1hOa6kO+8jOWMheWQq+iEmuacrOOAgWpzb27jgIHmma7pgJrotYTmupDjgIHnurnnkIbljovnvKnjgIHlm77pm4bnrYlcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBvdXRwdXRBc3NldHMoKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVQcm9jZXNzKCdPdXRwdXQgYXNzZXQgaW4gYnVuZGxlcyBzdGFydCcpO1xyXG4gICAgICAgIGNvbnN0IGhhc0NoZWNrZWRBc3NldCA9IG5ldyBTZXQoKTtcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbCh0aGlzLmJ1bmRsZXMubWFwKGFzeW5jIChidW5kbGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFidW5kbGUub3V0cHV0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VDb21wcmVzc01hbmFnZXIpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IGJ1bmRsZU91dHB1dFRhc2soYnVuZGxlLCB0aGlzLmNhY2hlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8g6L6T5Ye6IGpzb24g5YiG57uEXHJcbiAgICAgICAgICAgIGF3YWl0IG91dHB1dEpzb25Hcm91cChidW5kbGUsIHRoaXMpO1xyXG4gICAgICAgICAgICBhd2FpdCBvdXRwdXRCaW5Hcm91cChidW5kbGUsIHRoaXMub3B0aW9ucy5iaW5Hcm91cENvbmZpZyk7XHJcbiAgICAgICAgICAgIC8vIOW+queOr+WIhue7hOWGheeahOi1hOa6kFxyXG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChidW5kbGUuYXNzZXRzV2l0aG91dFJlZGlyZWN0Lm1hcChhc3luYyAodXVpZDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodXVpZC5sZW5ndGggPD0gMTUgfHwgYnVuZGxlLmNvbXByZXNzVGFza1t1dWlkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWQiOWbvui1hOa6kOOAgeW3suWPguS4jue6ueeQhuWOi+e8qeeahOi1hOa6kOaXoOmcgOaLt+i0neWOn+WbvlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIOWwhui1hOa6kOWkjeWItuWIsOaMh+WumuS9jee9rlxyXG4gICAgICAgICAgICAgICAgY29uc3QgYXNzZXQgPSBidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldCh1dWlkKTtcclxuICAgICAgICAgICAgICAgIGlmICghYXNzZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDYW4gbm90IGdldCBhc3NldCBpbmZvIHdpdGggdXVpZCgke3V1aWR9KWApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWhhc0NoZWNrZWRBc3NldC5oYXModXVpZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBoYXNDaGVja2VkQXNzZXQuYWRkKHV1aWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOagoemqjCBlZmZlY3Qg5piv5ZCm6ZyA6KaBIG1pcG1hcFxyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGNoZWNrRWZmZWN0VGV4dHVyZU1pcG1hcChhc3NldCwgdXVpZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBjb3B5QXNzZXRGaWxlKGFzc2V0LCBidW5kbGUsIHRoaXMub3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYG91dHB1dCBhc3NldCBmaWxlIGVycm9yIHdpdGggdXVpZCgke3V1aWR9KWApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgIH0pKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVByb2Nlc3MoJ091dHB1dCBhc3NldCBpbiBidW5kbGVzIHN1Y2Nlc3MnKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBoYW5kbGVIb29rKGZ1bmM6IEZ1bmN0aW9uLCBpbnRlcm5hbDogYm9vbGVhbiwgLi4uYXJnczogYW55W10pIHtcclxuICAgICAgICBpZiAoaW50ZXJuYWwpIHtcclxuICAgICAgICAgICAgYXdhaXQgZnVuYy5jYWxsKHRoaXMsIHRoaXMub3B0aW9ucywgdGhpcy5idW5kbGVzLCB0aGlzLmNhY2hlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhd2FpdCBmdW5jKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJ1bkFsbFRhc2soKSB7XHJcbiAgICAgICAgY29uc3Qgd2VpZ2h0ID0gMSAvIHRoaXMucGlwZWxpbmUubGVuZ3RoO1xyXG4gICAgICAgIGZvciAoY29uc3QgdGFzayBvZiB0aGlzLnBpcGVsaW5lKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGFzayA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucnVuUGx1Z2luVGFzayh0YXNrLCB3ZWlnaHQpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0YXNrID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnJ1bkJ1aWxkVGFzayh0YXNrLCB3ZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJ1bkJ1aWxkVGFzayhoYW5kbGU6IEZ1bmN0aW9uLCBpbmNyZW1lbnQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmVycm9yKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMub25FcnJvcih0aGlzLmVycm9yKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCBoYW5kbGUuYmluZCh0aGlzKSgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByb2Nlc3MoYHJ1biBidW5kbGUgdGFzayAke2hhbmRsZS5uYW1lfSBzdWNjZXNzIWAsIGluY3JlbWVudCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByb2Nlc3MoYHJ1biBidW5kbGUgdGFzayBmYWlsZWQhYCwgaW5jcmVtZW50KTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5vbkVycm9yKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNvbGxlY3REZXBlbmRBc3NldHModXVpZDogc3RyaW5nLCBhbGxBc3NldHM6IFNldDxzdHJpbmc+LCBkZXBlbmRlZEFzc2V0czogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+KSB7XHJcbiAgICBpZiAoYWxsQXNzZXRzLmhhcyh1dWlkKSkge1xyXG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGJ1aWxkQXNzZXRMaWJyYXJ5LnF1ZXJ5QXNzZXRVc2Vycyh1dWlkKTtcclxuICAgICAgICByZXMgJiYgcmVzLmxlbmd0aCAmJiAoZGVwZW5kZWRBc3NldHNbdXVpZF0gPSByZXMpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBmZWF0dXJlc1dpdGhEZXBlbmRlbmNpZXM6IHN0cmluZ1tdID0gW107XHJcbmNvbnN0IHByZWxvYWRBc3NldHM6IHN0cmluZ1tdID0gW107IC8vIOmihOWKoOi9vei1hOa6kCB1dWlkIOaVsOe7hO+8iOWMheWQq+iEmuacrO+8iVxyXG5cclxuLyoqXHJcbiAqIOWwhui1hOa6kOWkjeWItuWIsOaMh+WumuS9jee9rlxyXG4gKiBAcGFyYW0gcmF3QXNzZXREaXIg6L6T5Ye65paH5Lu25aS56Lev5b6EXHJcbiAqIEBwYXJhbSBhc3NldFxyXG4gKi9cclxuZnVuY3Rpb24gY29weUFzc2V0RmlsZShhc3NldDogSUFzc2V0LCBidW5kbGU6IElCdW5kbGUsIG9wdGlvbnM6IElJbnRlcm5hbEJ1bmRsZUJ1aWxkT3B0aW9ucyk6IFByb21pc2U8YW55PiB7XHJcbiAgICBjb25zdCBjY29uRm9ybWF0U291cmNlID0gZ2V0Q0NPTkZvcm1hdEFzc2V0SW5MaWJyYXJ5KGFzc2V0KTtcclxuXHJcbiAgICBpZiAoY2NvbkZvcm1hdFNvdXJjZSkge1xyXG4gICAgICAgIGNvbnN0IGlzQ2NvbkhhbmRsZWRJbkdyb3VwID0gISFidW5kbGUuZ3JvdXBzLmZpbmQoZ3JvdXAgPT4gZ3JvdXAudHlwZSA9PSAnQklOJyAmJiBncm91cC51dWlkcy5pbmNsdWRlcyhhc3NldC51dWlkKSk7XHJcbiAgICAgICAgaWYgKGlzQ2NvbkhhbmRsZWRJbkdyb3VwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmF3QXNzZXREaXIgPSBqb2luKGJ1bmRsZS5kZXN0LCBidW5kbGUuaW1wb3J0QmFzZSk7XHJcbiAgICAgICAgY29uc3Qgc291cmNlID0gY2NvbkZvcm1hdFNvdXJjZTtcclxuICAgICAgICBjb25zdCByZWxhdGl2ZU5hbWUgPSByZWxhdGl2ZShnZXRMaWJyYXJ5RGlyKHNvdXJjZSksIHNvdXJjZSk7XHJcbiAgICAgICAgY29uc3QgZGVzdCA9IGpvaW4oam9pbihyYXdBc3NldERpciwgcmVsYXRpdmVOYW1lKSk7XHJcbiAgICAgICAgcmV0dXJuIGJ1aWxkQXNzZXRMaWJyYXJ5Lm91dHB1dENDT05Bc3NldChcclxuICAgICAgICAgICAgYXNzZXQudXVpZCxcclxuICAgICAgICAgICAgZGVzdCxcclxuICAgICAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGV4Y2x1ZGVFeHROYW1lID0gWycuanNvbiddO1xyXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFxyXG4gICAgICAgIGFzc2V0Lm1ldGEuZmlsZXMubWFwKChleHRuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChleGNsdWRlRXh0TmFtZS5pbmNsdWRlcyhleHRuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOinhOWIme+8muaehOW7uuS4jeaJk+WMhSBfXyDlvIDlpLTnmoTotYTmupDmlbDmja5cclxuICAgICAgICAgICAgaWYgKGV4dG5hbWUuc3RhcnRzV2l0aCgnX18nKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCByYXdBc3NldERpciA9IGpvaW4oYnVuZGxlLmRlc3QsIGJ1bmRsZS5uYXRpdmVCYXNlKTtcclxuICAgICAgICAgICAgY29uc3Qgc291cmNlID0gZXh0bmFtZS5zdGFydHNXaXRoKCcuJykgPyBhc3NldC5saWJyYXJ5ICsgZXh0bmFtZSA6IGpvaW4oYXNzZXQubGlicmFyeSwgZXh0bmFtZSk7XHJcbiAgICAgICAgICAgIC8vIOWIqeeUqOebuOWvuei3r+W+hOadpeiOt+WPlui1hOa6kOebuOWvueWcsOWdgO+8jOmBv+WFjeiApuWQiOS4gOS6m+eJueauiui1hOa6kOeahOi3r+W+hOaLvOWGmeinhOWIme+8jOavlOWmgiBmb250IFxyXG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZU5hbWUgPSByZWxhdGl2ZShnZXRMaWJyYXJ5RGlyKHNvdXJjZSksIHNvdXJjZSk7XHJcbiAgICAgICAgICAgIGlmICghZXhpc3RzU3luYyhzb3VyY2UpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgIGkxOG4udCgnYnVpbGRlci5lcnJvci5taXNzaW5nX2ltcG9ydF9maWxlcycsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogYHtsaW5rKCR7c291cmNlfSl9YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBge2Fzc2V0KCR7YXNzZXQudXJsfSl9YCxcclxuICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZGVzdCA9IGpvaW4ocmF3QXNzZXREaXIsIHJlbGF0aXZlTmFtZSk7XHJcbiAgICAgICAgICAgIC8vIOWFtuS7lua1geeoi+WPr+iDveeUn+aIkOWQjOexu+Wei+WQjue8gOi1hOa6kO+8jOavlOWmguWOi+e8qee6ueeQhu+8jOS4jeiDveWwhuWFtuimhuebllxyXG4gICAgICAgICAgICBpZiAoZXhpc3RzU3luYyhkZXN0KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBjb3B5KHNvdXJjZSwgZGVzdCk7XHJcbiAgICAgICAgfSksXHJcbiAgICApO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0cmF2ZXJzYWxEZXBlbmRlbmNpZXMoZmVhdHVyZXM6IHN0cmluZ1tdLCBmZWF0dXJlc0luSnNvbjogYW55KTogdm9pZCB7XHJcbiAgICBmZWF0dXJlcy5mb3JFYWNoKChmZWF0dXJlTmFtZSkgPT4ge1xyXG4gICAgICAgIGlmIChmZWF0dXJlc0luSnNvbltmZWF0dXJlTmFtZV0pIHtcclxuICAgICAgICAgICAgaWYgKCFmZWF0dXJlc1dpdGhEZXBlbmRlbmNpZXMuaW5jbHVkZXMoZmVhdHVyZU5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBmZWF0dXJlc1dpdGhEZXBlbmRlbmNpZXMucHVzaChmZWF0dXJlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZmVhdHVyZXNJbkpzb25bZmVhdHVyZU5hbWVdLmRlcGVuZGVudEFzc2V0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWxvYWRBc3NldHMucHVzaCguLi5mZWF0dXJlc0luSnNvbltmZWF0dXJlTmFtZV0uZGVwZW5kZW50QXNzZXRzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChmZWF0dXJlc0luSnNvbltmZWF0dXJlTmFtZV0uZGVwZW5kZW50U2NyaXB0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWxvYWRBc3NldHMucHVzaCguLi5mZWF0dXJlc0luSnNvbltmZWF0dXJlTmFtZV0uZGVwZW5kZW50U2NyaXB0cyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZmVhdHVyZXNJbkpzb25bZmVhdHVyZU5hbWVdLmRlcGVuZGVudE1vZHVsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXBlbmRlbnRNb2R1bGVzOiBzdHJpbmdbXSA9IGZlYXR1cmVzSW5Kc29uW2ZlYXR1cmVOYW1lXS5kZXBlbmRlbnRNb2R1bGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYXZlcnNhbERlcGVuZGVuY2llcyhkZXBlbmRlbnRNb2R1bGVzLCBmZWF0dXJlc0luSnNvbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOagueaNruaooeWdl+S/oeaBr++8jOafpeaJvumcgOimgemihOWKoOi9veeahOi1hOa6kOWIl+ihqO+8iOWMheWQq+aZrumAmui1hOa6kOS4juiEmuacrO+8iVxyXG4gKiBAcGFyYW0gZmVhdHVyZXMgXHJcbiAqIEByZXR1cm5zIFxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gcXVlcnlQcmVsb2FkQXNzZXRMaXN0KGZlYXR1cmVzOiBzdHJpbmdbXSwgZW5naW5lUGF0aDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBjY0NvbmZpZ0pzb24gPSBhd2FpdCByZWFkSlNPTihqb2luKGVuZ2luZVBhdGgsICdjYy5jb25maWcuanNvbicpKTtcclxuICAgIGNvbnN0IGZlYXR1cmVzSW5Kc29uID0gY2NDb25maWdKc29uLmZlYXR1cmVzO1xyXG4gICAgZmVhdHVyZXNXaXRoRGVwZW5kZW5jaWVzLmxlbmd0aCA9IDA7XHJcbiAgICBwcmVsb2FkQXNzZXRzLmxlbmd0aCA9IDA7XHJcbiAgICB0cmF2ZXJzYWxEZXBlbmRlbmNpZXMoZmVhdHVyZXMsIGZlYXR1cmVzSW5Kc29uKTtcclxuICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQocHJlbG9hZEFzc2V0cykpO1xyXG59XHJcblxyXG4vKipcclxuICogZWZmZWN0IOiuvue9ruS6hiByZXF1aXJlTWlwbWFwc++8jOWvueadkOi0qOi/m+ihjOagoemqjO+8jOiLpeWPkeeOsOWFs+iBlOeahOe6ueeQhuayoeacieW8gOWQryBtaXBtYXAg5YiZ6L6T5Ye66K2m5ZGKXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBjaGVja0VmZmVjdFRleHR1cmVNaXBtYXAoYXNzZXQ6IElBc3NldCwgdXVpZDogc3RyaW5nKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGlmIChidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldFByb3BlcnR5KGFzc2V0LCAndHlwZScpID09PSAnY2MuTWF0ZXJpYWwnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG10bCA9IChhd2FpdCBidWlsZEFzc2V0TGlicmFyeS5nZXRJbnN0YW5jZShidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldCh1dWlkKSkpIGFzIE1hdGVyaWFsO1xyXG4gICAgICAgICAgICBpZiAobXRsLmVmZmVjdEFzc2V0ICYmIG10bC5lZmZlY3RBc3NldC5fdXVpZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZWZmZWN0ID0gKGF3YWl0IGJ1aWxkQXNzZXRMaWJyYXJ5LmdldEluc3RhbmNlKGJ1aWxkQXNzZXRMaWJyYXJ5LmdldEFzc2V0KG10bC5lZmZlY3RBc3NldC5fdXVpZCkpKSBhcyBFZmZlY3RBc3NldDtcclxuICAgICAgICAgICAgICAgIC8vIOmBjeWOhiBlZmZlY3QudGVjaG5pcXVlc1ttdGwuX3RlY2hJZHhdIOS4i+eahOaJgOaciSBwYXNzXHJcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICBlZmZlY3QudGVjaG5pcXVlc1ttdGwuX3RlY2hJZHhdLnBhc3Nlcy5mb3JFYWNoKGFzeW5jIChwYXNzOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFzcy5wcm9wZXJ0aWVzICYmIHBhc3MucHJvcGVydGllcy5tYWluVGV4dHVyZSAmJiBwYXNzLnByb3BlcnRpZXMubWFpblRleHR1cmUucmVxdWlyZU1pcG1hcHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5byV5pOO5o6l5Y+j5oql6ZSZXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IG1haW5UZXh0dXJlID0gbXRsLmdldFByb3BlcnR5KCdtYWluVGV4dHVyZScsIGluZGV4KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOiOt+WPliBtYWluVGV4dHVyZSDnmoQgdXVpZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3AgPSBtdGwuX3Byb3BzICYmIG10bC5fcHJvcHNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wLm1haW5UZXh0dXJlICYmIHByb3AubWFpblRleHR1cmUuX3V1aWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlcXVpcmVNaXBtYXBzID09PSB0dXJlIOeahCBtYWluVGV4dHVyZSDmoKHpqozmmK/lkKblvIDlkK/kuoYgbWlwbWFwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXRhID0gYXdhaXQgYnVpbGRBc3NldExpYnJhcnkuZ2V0TWV0YShwcm9wLm1haW5UZXh0dXJlLl91dWlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghWyduZWFyZXN0JywgJ2xpbmVhciddLmluY2x1ZGVzKG1ldGEudXNlckRhdGEubWlwZmlsdGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihpMThuLnQoJ2J1aWxkZXIud2Fybi5yZXF1aXJlX21pcG1hcHMnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVmZmVjdFVVSUQ6IGVmZmVjdC5fdXVpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlVVVJRDogcHJvcC5tYWluVGV4dHVyZS5fdXVpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhlcnJvcik7XHJcbiAgICB9XHJcbn0iXX0=