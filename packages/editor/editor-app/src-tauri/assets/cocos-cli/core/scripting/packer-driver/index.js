"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackerDriver = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const url_1 = require("url");
const perf_hooks_1 = require("perf_hooks");
const prerequisite_imports_1 = require("./prerequisite-imports");
const utils_1 = require("@cocos/lib-programming/dist/utils");
const ccbuild_1 = require("@cocos/ccbuild");
const asserts_1 = require("../utils/asserts");
const query_shared_settings_1 = require("../shared/query-shared-settings");
const quick_pack_1 = require("@cocos/creator-programming-quick-pack/lib/quick-pack");
const mod_lo_1 = require("@cocos/creator-programming-mod-lo/lib/mod-lo");
const asset_db_interop_1 = require("./asset-db-interop");
const asset_1 = require("@cocos/asset-db/libs/asset");
const logger_1 = require("./logger");
const language_service_1 = require("../language-service");
const delegate_1 = require("../utils/delegate");
const json5_1 = __importDefault(require("json5"));
const fs_1 = require("fs");
const utils_2 = require("../../assets/utils");
const utils_3 = require("../../builder/worker/builder/utils");
const intelligence_1 = require("../intelligence");
const event_emitter_1 = require("../event-emitter");
const path_2 = __importDefault(require("path"));
const VERSION = '20';
const featureUnitModulePrefix = 'cce:/internal/x/cc-fu/';
function getEditorPatterns(dbInfos) {
    const editorPatterns = [];
    for (const info of dbInfos) {
        const dbEditorPattern = path_1.default.join(info.target, '**', 'editor', '**/*');
        editorPatterns.push(dbEditorPattern);
    }
    return editorPatterns;
}
function getCCEModuleIDs(cceModuleMap) {
    return Object.keys(cceModuleMap).filter(id => id !== 'mapLocation');
}
async function wrapToSetImmediateQueue(thiz, fn, ...args) {
    return new Promise((resolve, reject) => {
        // 注意：Editor.Message.broadcast 内部会使用 setImmediate 延时广播事件。
        // 如果在 broadcast 之后调用了比较耗时的操作，那么消息会在耗时操作后才被收到。
        // 因此这里使用 setImmediate 来转换同步函数为异步，保证转换的函数在 broadcast 消息被收到后再执行。
        setImmediate(() => {
            try {
                resolve(fn.apply(thiz, args));
            }
            catch (e) {
                reject(e);
            }
        });
    });
}
/**
 * Packer 驱动器。
 * - 底层用 QuickPack 快速打包模块相关的资源。
 * - 产出是可以进行加载的模块资源，包括模块、Source map等；需要使用 QuickPackLoader 对这些模块资源进行加载和访问。
 */
class PackerDriver {
    languageService = null;
    static _instance = null;
    static getInstance() {
        (0, asserts_1.asserts)(PackerDriver._instance, 'PackerDriver is not created yet. Please call PackerDriver.create first.');
        return PackerDriver._instance;
    }
    /**
     * 创建 Packer 驱动器。
     */
    static async create(projectPath, engineTsPath) {
        await query_shared_settings_1.scriptConfig.init();
        const tsBuilder = new intelligence_1.TypeScriptConfigBuilder(projectPath, engineTsPath);
        PackerDriver._cceModuleMap = PackerDriver.queryCCEModuleMap();
        const baseWorkspace = path_1.default.join(tsBuilder.getTempPath(), 'programming', 'packer-driver');
        const versionFile = path_1.default.join(baseWorkspace, 'VERSION');
        const targetWorkspaceBase = path_1.default.join(baseWorkspace, 'targets');
        const debugLogFile = path_1.default.join(baseWorkspace, 'logs', 'debug.log');
        const targets = {};
        const verbose = true;
        if (await fs_extra_1.default.pathExists(debugLogFile)) {
            try {
                await fs_extra_1.default.unlink(debugLogFile);
            }
            catch (err) {
                console.warn(`Failed to reset log file: ${debugLogFile}`);
            }
        }
        const logger = new logger_1.PackerDriverLogger(debugLogFile);
        logger.debug(new Date().toLocaleString());
        logger.debug(`Project: ${projectPath}`);
        logger.debug(`Targets: ${Object.keys(predefinedTargets)}`);
        const incrementalRecord = await PackerDriver._createIncrementalRecord(logger);
        await PackerDriver._validateIncrementalRecord(incrementalRecord, versionFile, targetWorkspaceBase, logger);
        const loadMappings = {
            'cce:/internal/code-quality/': (0, url_1.pathToFileURL)(path_1.default.join(__dirname, '../..', '..', '..', 'static', 'scripting', 'builtin-mods', 'code-quality', '/')).href,
        };
        const statsQuery = await ccbuild_1.StatsQuery.create(engineTsPath);
        const emptyEngineIndexModuleSource = statsQuery.evaluateIndexModuleSource([]);
        const crOptions = {
            moduleRequestFilter: [/^cc\.?.*$/g],
            reporter: {
                moduleName: 'cce:/internal/code-quality/cr.mjs',
                functionName: 'report',
            },
        };
        for (const [targetId, target] of Object.entries(predefinedTargets)) {
            logger.debug(`Initializing target [${target.name}]`);
            const modLoExternals = [
                'cc/env',
                'cc/userland/macro',
                ...getCCEModuleIDs(PackerDriver._cceModuleMap), // 设置编辑器导出的模块为外部模块
            ];
            modLoExternals.push(...statsQuery.getFeatureUnits().map((featureUnit) => `${featureUnitModulePrefix}${featureUnit}`));
            let browsersListTargets = target.browsersListTargets;
            if (targetId === 'preview' && incrementalRecord.config.previewTarget) {
                browsersListTargets = incrementalRecord.config.previewTarget;
                logger.debug(`Use specified preview browserslist target: ${browsersListTargets}`);
            }
            const modLo = new mod_lo_1.ModLo({
                targets: browsersListTargets,
                loose: incrementalRecord.config.loose,
                guessCommonJsExports: incrementalRecord.config.guessCommonJsExports,
                useDefineForClassFields: incrementalRecord.config.useDefineForClassFields,
                allowDeclareFields: incrementalRecord.config.allowDeclareFields,
                cr: crOptions,
                _compressUUID(uuid) {
                    return (0, utils_3.compressUuid)(uuid, false);
                },
                logger,
                checkObsolete: true,
                importRestrictions: PackerDriver._importRestrictions,
                preserveSymlinks: incrementalRecord.config.preserveSymlinks,
            });
            modLo.setExtraExportsConditions(incrementalRecord.config.exportsConditions);
            modLo.setExternals(modLoExternals);
            modLo.setLoadMappings(loadMappings);
            const targetWorkspace = path_1.default.join(targetWorkspaceBase, targetId);
            const quickPack = new quick_pack_1.QuickPack({
                modLo,
                origin: projectPath,
                workspace: targetWorkspace,
                logger,
                verbose,
            });
            logger.debug('Loading cache');
            const t1 = perf_hooks_1.performance.now();
            await quickPack.loadCache();
            const t2 = perf_hooks_1.performance.now();
            logger.debug(`Loading cache costs ${t2 - t1}ms.`);
            let engineIndexModule;
            if (target.isEditor) {
                const features = await PackerDriver._getEngineFeaturesShippedInEditor(statsQuery);
                logger.debug(`Engine features shipped in editor: ${features}`);
                engineIndexModule = {
                    source: PackerDriver._getEngineIndexModuleSource(statsQuery, features),
                    respectToFeatureSetting: false,
                };
            }
            else {
                engineIndexModule = {
                    source: emptyEngineIndexModuleSource,
                    respectToFeatureSetting: true,
                };
            }
            const quickPackLoaderContext = quickPack.createLoaderContext();
            targets[targetId] = new PackTarget({
                name: targetId,
                modLo,
                sourceMaps: target.sourceMaps,
                quickPack,
                quickPackLoaderContext,
                logger,
                engineIndexModule,
                tentativePrerequisiteImportsMod: target.isEditor ?? false,
                userImportMap: incrementalRecord.config.importMap ? {
                    json: incrementalRecord.config.importMap.json,
                    url: new url_1.URL(incrementalRecord.config.importMap.url),
                } : undefined,
            });
        }
        const packer = new PackerDriver(tsBuilder, targets, statsQuery, logger);
        PackerDriver._instance = packer;
        return packer;
    }
    static queryCCEModuleMap() {
        const cceModuleMapLocation = path_1.default.join(__dirname, '../../../../static/scripting/cce-module.jsonc');
        const cceModuleMap = json5_1.default.parse(fs_extra_1.default.readFileSync(cceModuleMapLocation, 'utf8'));
        cceModuleMap.mapLocation = cceModuleMapLocation;
        return cceModuleMap;
    }
    /**构建任务的委托，在构建之前会把委托里面的所有内容执行 */
    beforeEditorBuildDelegate = new delegate_1.AsyncDelegate();
    busy() {
        return this._building;
    }
    async updateDbInfos(dbInfo, dbChangeType) {
        const oldDbInfoSize = this._dbInfos.length;
        if (dbChangeType === asset_db_interop_1.DBChangeType.add) {
            if (!this._dbInfos.some(item => item.dbID === dbInfo.dbID)) {
                this._dbInfos.push(dbInfo);
            }
        }
        else if (dbChangeType === asset_db_interop_1.DBChangeType.remove) {
            this._dbInfos = this._dbInfos.filter(item => item.dbID !== dbInfo.dbID);
            const scriptInfos = this._assetDbInterop.removeTsScriptInfoCache(dbInfo.target);
            scriptInfos.forEach((info) => {
                this._assetChangeQueue.push({
                    type: asset_1.AssetActionEnum.delete,
                    importer: 'typescript',
                    filePath: info.filePath,
                    uuid: info.uuid,
                    isPluginScript: info.isPluginScript,
                    url: info.url,
                });
            });
        }
        if (oldDbInfoSize === this._dbInfos.length) {
            return;
        }
        const self = this;
        const update = async () => {
            const assetDatabaseDomains = await this._assetDbInterop.queryAssetDomains(this._dbInfos);
            self._logger.debug('Reset databases. ' +
                `Enumerated domains: ${JSON.stringify(assetDatabaseDomains, undefined, 2)}`);
            const tsBuilder = self._tsBuilder;
            tsBuilder.setDbURLInfos(this._dbInfos);
            const realTsConfigPath = tsBuilder.getRealTsConfigPath();
            const projectPath = tsBuilder.getProjectPath();
            const compilerOptions = await tsBuilder.getCompilerOptions();
            const internalDbURLInfos = await tsBuilder.getInternalDbURLInfos();
            self.languageService = new language_service_1.LanguageServiceAdapter(realTsConfigPath, projectPath, self.beforeEditorBuildDelegate, compilerOptions, internalDbURLInfos);
            for (const target of Object.values(this._targets)) {
                target.updateDbInfos(this._dbInfos);
                await target.setAssetDatabaseDomains(assetDatabaseDomains);
            }
        };
        if (this.busy()) {
            this._beforeBuildTasks.push(() => {
                update();
            });
        }
        else {
            await update();
        }
    }
    dispatchAssetChanges(assetChange) {
        this._assetDbInterop.onAssetChange(assetChange);
    }
    /**
     * 从 asset-db 获取所有数据并构建，包含 ts 和 js 脚本。
     * AssetChange format:
     *  {
     *      type: AssetChangeType.add,
            uuid: assetInfo.uuid,
            filePath: assetInfo.file,
            url: getURL(assetInfo),
            isPluginScript: isPluginScript(meta || assetInfo.meta!),
     *  }
     * @param assetChanges 资源变更列表
     * @param taskId 任务ID，用于跟踪任务状态
     */
    async build(changeInfos, taskId) {
        const logger = this._logger;
        logger.debug('Pulling asset-db.');
        const t1 = perf_hooks_1.performance.now();
        if (changeInfos && changeInfos.length > 0) {
            changeInfos.forEach(changeInfo => {
                this._assetDbInterop.onAssetChange(changeInfo);
            });
            const assetChanges = this._assetDbInterop.getAssetChangeQueue();
            this._assetChangeQueue.push(...assetChanges);
            this._assetDbInterop.resetAssetChangeQueue();
        }
        const t2 = perf_hooks_1.performance.now();
        logger.debug(`Fetch asset-db cost: ${t2 - t1}ms.`);
        await this._startBuild(taskId);
    }
    async clearCache() {
        if (this._clearing) {
            this._logger.debug('Failed to clear cache: previous clearing have not finished yet.');
            return;
        }
        if (this.busy()) {
            this._logger.error('Failed to clear cache: the building is still working in progress.');
            return;
        }
        this._clearing = true;
        for (const [name, target] of Object.entries(this._targets)) {
            this._logger.debug(`Clear cache of target ${name}`);
            await target.clearCache();
        }
        this._logger.debug('Request build after clearing...');
        await this.build([]);
        this._clearing = false;
    }
    getQuickPackLoaderContext(targetName) {
        this._warnMissingTarget(targetName);
        if (targetName in this._targets) {
            return this._targets[targetName].quickPackLoaderContext;
        }
        else {
            return undefined;
        }
    }
    isReady(targetName) {
        this._warnMissingTarget(targetName);
        if (targetName in this._targets) {
            return this._targets[targetName].ready;
        }
        else {
            return undefined;
        }
    }
    /**
     * 获取当前正在执行的编译任务ID
     * @returns 任务ID，如果没有正在执行的任务则返回null
     */
    getCurrentTaskId() {
        return this._currentTaskId;
    }
    queryScriptDeps(queryPath) {
        const scriptPath = path_2.default.normalize(queryPath).replace(/\\/g, '/');
        this._transformDepsGraph();
        if (this._depsGraphCache[scriptPath]) {
            return Array.from(this._depsGraphCache[scriptPath]);
        }
        return [];
    }
    queryScriptUsers(queryPath) {
        const scriptPath = path_2.default.normalize(queryPath).replace(/\\/g, '/');
        this._transformDepsGraph();
        if (this._usedGraphCache[scriptPath]) {
            return Array.from(this._usedGraphCache[scriptPath]);
        }
        return [];
    }
    async shutDown() {
        await this.destroyed();
    }
    _dbInfos = [];
    _tsBuilder;
    _clearing = false;
    _targets = {};
    _logger;
    _statsQuery;
    _assetDbInterop;
    _assetChangeQueue = [];
    _building = false;
    _featureChanged = false;
    _beforeBuildTasks = [];
    _depsGraph = {};
    _needUpdateDepsCache = false;
    _usedGraphCache = {};
    _depsGraphCache = {};
    static _cceModuleMap;
    static _importRestrictions = [];
    _init = false;
    _features = [];
    _currentTaskId = null;
    constructor(builder, targets, statsQuery, logger) {
        this._tsBuilder = builder;
        this._targets = targets;
        this._statsQuery = statsQuery;
        this._logger = logger;
        this._assetDbInterop = new asset_db_interop_1.AssetDbInterop();
    }
    set features(features) {
        this._features = features;
        this._featureChanged = true;
    }
    async init(features) {
        if (this._init) {
            return;
        }
        this._init = true;
        this._features = features;
        await this._syncEngineFeatures(features);
    }
    async generateDeclarations() {
        await this._tsBuilder.generateDeclarations([]);
    }
    async querySharedSettings() {
        return (0, query_shared_settings_1.querySharedSettings)(this._logger);
    }
    async destroyed() {
        this._init = false;
        await this._assetDbInterop.destroyed();
    }
    _warnMissingTarget(targetName) {
        if (!(targetName in this._targets)) {
            console.warn(`Invalid pack target: ${targetName}. Existing targets are: ${Object.keys(this._targets)}`);
        }
    }
    /**
     * 开始一次构建。
     * @param taskId 任务ID，用于跟踪任务状态
     */
    async _startBuild(taskId) {
        // 目前不能直接跳过，因为调用编译接口时是期望立即执行的，如果跳过会导致编译任务无法执行。
        // if (this._building) {
        //     this._logger.debug('Build iteration already started, skip.');
        //     return;
        // }
        this._building = true;
        this._currentTaskId = taskId || null;
        event_emitter_1.eventEmitter.emit('compile-start', 'project', taskId);
        this._logger.clear();
        this._logger.debug('Build iteration starts.\n' +
            `Number of accumulated asset changes: ${this._assetChangeQueue.length}\n` +
            `Feature changed: ${this._featureChanged}` +
            (taskId ? `\nTask ID: ${taskId}` : ''));
        if (this._featureChanged) {
            this._featureChanged = false;
            await this._syncEngineFeatures(this._features);
        }
        const assetChanges = this._assetChangeQueue;
        this._assetChangeQueue = [];
        const beforeTasks = this._beforeBuildTasks.slice();
        this._beforeBuildTasks.length = 0;
        for (const beforeTask of beforeTasks) {
            beforeTask();
        }
        await this.beforeEditorBuildDelegate.dispatch(assetChanges.filter(item => item.type === asset_1.AssetActionEnum.change));
        const nonDTSChanges = assetChanges.filter(item => !item.filePath.endsWith('.d.ts'));
        let err = null;
        for (const [, target] of Object.entries(this._targets)) {
            if (assetChanges.length !== 0) {
                await target.applyAssetChanges(nonDTSChanges);
            }
            const buildResult = await target.build();
            if (buildResult.err) {
                err = buildResult.err;
                target.deleteCacheFile(err.file);
                continue;
            }
            buildResult.depsGraph && (this._depsGraph = buildResult.depsGraph); // 更新依赖图
            this._needUpdateDepsCache = true;
        }
        this._building = false;
        this._currentTaskId = null;
        event_emitter_1.eventEmitter.emit('compiled', 'project');
        if (err) {
            throw err;
        }
    }
    static async _createIncrementalRecord(logger) {
        const sharedModLoOptions = await (0, query_shared_settings_1.querySharedSettings)(logger);
        const incrementalRecord = {
            version: VERSION,
            config: {
                ...sharedModLoOptions,
            },
        };
        const previewBrowsersListConfigFile = await query_shared_settings_1.scriptConfig.getProject('previewBrowserslistConfigFile');
        if (previewBrowsersListConfigFile && previewBrowsersListConfigFile !== 'project://') {
            const previewBrowsersListConfigFilePath = (0, utils_2.url2path)(previewBrowsersListConfigFile);
            try {
                if (previewBrowsersListConfigFilePath && (0, fs_1.existsSync)(previewBrowsersListConfigFilePath)) {
                    const previewTarget = await readBrowserslistTarget(previewBrowsersListConfigFilePath);
                    if (previewTarget) {
                        incrementalRecord.config.previewTarget = previewTarget;
                    }
                }
                else {
                    logger.warn(`Preview target config file not found. ${previewBrowsersListConfigFilePath || previewBrowsersListConfigFile}`);
                }
            }
            catch (error) {
                logger.error(`Failed to load preview target config file at ${previewBrowsersListConfigFilePath || previewBrowsersListConfigFile}: ${error}`);
            }
        }
        return incrementalRecord;
    }
    static async _validateIncrementalRecord(record, recordFile, targetWorkspaceBase, logger) {
        let matched = false;
        try {
            const oldRecord = await fs_extra_1.default.readJson(recordFile);
            matched = matchObject(record, oldRecord);
            if (matched) {
                logger.debug('Incremental file seems great.');
            }
            else {
                logger.debug('[PackerDriver] Options doesn\'t match.\n' +
                    `Last: ${JSON.stringify(record, undefined, 2)}\n` +
                    `Current: ${JSON.stringify(oldRecord, undefined, 2)}`);
            }
        }
        catch (err) {
            logger.debug(`Packer deriver version file lost or format incorrect: ${err}`);
        }
        if (!matched) {
            logger.debug('Clearing out the targets...');
            await fs_extra_1.default.emptyDir(targetWorkspaceBase);
            await fs_extra_1.default.outputJson(recordFile, record, { spaces: 2 });
        }
        return matched;
    }
    static async _getEngineFeaturesShippedInEditor(statsQuery) {
        // 从 v3.8.5 开始，支持手动加载 WASM 模块，提供了 loadWasmModuleBox2D, loadWasmModuleBullet 等方法，这些方法是在 feature 入口 ( exports 目录下的文件导出的)
        // 之前剔除这些后端 feature 入口，应该是在 https://github.com/cocos/3d-tasks/issues/5747 中的建议。
        // 但实际上，编辑器环境下的引擎打包的时候，已经把所有模块打进 bundled/index.js 中，见：https://github.com/cocos/cocos-editor/blob/3.8.5/app/builtin/engine/static/engine-compiler/source/index.ts#L114 。
        // 启动引擎也执行了每个后端的代码，详见：https://github.com/cocos/cocos-editor/blob/3.8.5/app/builtin/scene/source/script/3d/manager/startup/engine/index.ts#L97 。
        // 项目 import 的 cc 在这里被加载： https://github.com/cocos/cocos-editor/blob/3.8.5/packages/lib-programming/src/executor/index.ts#L355 
        // 其包含的导出 features 是根据 _getEngineFeaturesShippedInEditor 这个当前函数返回的 features 决定的。因此，不会包含 loadWasmModuleBox2D， loadWasmModuleBullet， loadWasmModulePhysX 这几个函数。
        // 这个逻辑跟浏览器预览、构建后的运行时环境都有差异，而且没有必要，排除这些方法只会导致差异，并不能带来包体、性能方面的提升。
        return statsQuery.getFeatures();
        // const editorFeatures: string[] = statsQuery.getFeatures().filter((featureName) => {
        //     return ![
        //         'physics-ammo',
        //         'physics-builtin',
        //         'physics-cannon',
        //         'physics-physx',
        //         'physics-2d-box2d',
        //         'physics-2d-builtin',
        //     ].includes(featureName);
        // });
        // return editorFeatures;
    }
    async _syncEngineFeatures(features) {
        this._logger.debug(`Sync engine features: ${features}`);
        const engineIndexModuleSource = PackerDriver._getEngineIndexModuleSource(this._statsQuery, features);
        for (const [, target] of Object.entries(this._targets)) {
            if (target.respectToEngineFeatureSetting) {
                await target.setEngineIndexModuleSource(engineIndexModuleSource);
            }
        }
    }
    static _getEngineIndexModuleSource(statsQuery, features) {
        const featureUnits = statsQuery.getUnitsOfFeatures(features);
        const engineIndexModuleSource = statsQuery.evaluateIndexModuleSource(featureUnits, (featureUnit) => `${featureUnitModulePrefix}${featureUnit}`);
        return engineIndexModuleSource;
    }
    /**
     * 将 depsGraph 从 file 协议转成 db 路径协议。
     * 并且过滤掉一些外部模块。
     */
    _transformDepsGraph() {
        if (!this._needUpdateDepsCache) {
            return;
        }
        this._needUpdateDepsCache = false;
        const _depsGraph = {};
        const _usedGraph = {};
        for (const [scriptFilePath, depFilePaths] of Object.entries(this._depsGraph)) {
            if (!scriptFilePath.startsWith('file://')) {
                continue;
            }
            const scriptPath = (0, url_1.fileURLToPath)(scriptFilePath).replace(/\\/g, '/');
            if (!_depsGraph[scriptPath]) {
                _depsGraph[scriptPath] = new Set();
            }
            for (const path of depFilePaths) {
                if (!path.startsWith('file://')) {
                    continue;
                }
                const depPath = (0, url_1.fileURLToPath)(path).replace(/\\/g, '/');
                _depsGraph[scriptPath].add(depPath);
                if (!_usedGraph[depPath]) {
                    _usedGraph[depPath] = new Set();
                }
                _usedGraph[depPath].add(scriptPath);
            }
        }
        this._usedGraphCache = _usedGraph;
        this._depsGraphCache = _depsGraph;
    }
}
exports.PackerDriver = PackerDriver;
const engineIndexModURL = 'cce:/internal/x/cc';
const DEFAULT_PREVIEW_BROWSERS_LIST_TARGET = 'supports es6-module';
const predefinedTargets = {
    editor: {
        name: 'Editor',
        browsersListTargets: utils_1.editorBrowserslistQuery,
        sourceMaps: 'inline',
        isEditor: true,
    },
    preview: {
        name: 'Preview',
        sourceMaps: true,
        browsersListTargets: DEFAULT_PREVIEW_BROWSERS_LIST_TARGET,
    },
};
async function readBrowserslistTarget(browserslistrcPath) {
    let browserslistrcSource;
    try {
        browserslistrcSource = await fs_extra_1.default.readFile(browserslistrcPath, 'utf8');
    }
    catch (err) {
        return;
    }
    const queries = parseBrowserslistQueries(browserslistrcSource);
    if (queries.length === 0) {
        return;
    }
    return queries.join(' or ');
    function parseBrowserslistQueries(source) {
        const queries = [];
        for (const line of source.split('\n')) {
            const iSharp = line.indexOf('#');
            const lineTrimmed = (iSharp < 0 ? line : line.substr(0, iSharp)).trim();
            if (lineTrimmed.length !== 0) {
                queries.push(lineTrimmed);
            }
        }
        return queries;
    }
}
// 考虑到这是潜在的收费点，默认关闭入口脚本的优化功能
const OPTIMIZE_ENTRY_SOURCE_COMPILATION = false;
class PackTarget {
    constructor(options) {
        this._name = options.name;
        this._modLo = options.modLo;
        this._quickPack = options.quickPack;
        this._quickPackLoaderContext = options.quickPackLoaderContext;
        this._sourceMaps = options.sourceMaps;
        this._logger = options.logger;
        this._respectToFeatureSetting = options.engineIndexModule.respectToFeatureSetting;
        this._tentativePrerequisiteImportsMod = options.tentativePrerequisiteImportsMod;
        this._userImportMap = options.userImportMap;
        const modLo = this._modLo;
        this._entryMod = modLo.addMemoryModule(prerequisite_imports_1.prerequisiteImportsModURL, (this._tentativePrerequisiteImportsMod ? prerequisite_imports_1.makeTentativePrerequisiteImports : prerequisite_imports_1.makePrerequisiteImportsMod)([]));
        this._entryModSource = this._entryMod.source;
        this._engineIndexMod = modLo.addMemoryModule(engineIndexModURL, options.engineIndexModule.source);
        // In constructor, there's no build in progress, so we can safely call setAssetDatabaseDomains
        // without waiting. We use a synchronous initialization method.
        this._setAssetDatabaseDomainsSync([]);
    }
    get quickPackLoaderContext() {
        return this._quickPackLoaderContext;
    }
    get ready() {
        return this._ready;
    }
    get respectToEngineFeatureSetting() {
        return this._respectToFeatureSetting;
    }
    updateDbInfos(dbInfos) {
        this._dbInfos = dbInfos;
    }
    async build() {
        // 如果正在构建，返回同一个 Promise，避免并发执行
        if (this._buildPromise) {
            this._logger.debug(`Target(${this._name}) build already in progress, waiting for existing build...`);
            return this._buildPromise;
        }
        // 开始新的构建
        this._buildStarted = true;
        const targetName = this._name;
        // 创建构建 Promise
        this._buildPromise = this._executeBuild(targetName);
        try {
            const result = await this._buildPromise;
            return result;
        }
        finally {
            // 构建完成后清除 Promise，允许下次构建
            this._buildPromise = null;
        }
    }
    async _executeBuild(targetName) {
        // 发送开始编译消息
        event_emitter_1.eventEmitter.emit('pack-build-start', targetName);
        this._logger.debug(`Target(${targetName}) build started.`);
        let buildResult = {};
        const t1 = perf_hooks_1.performance.now();
        try {
            buildResult = await this._build();
        }
        catch (err) {
            this._logger.error(`${err}, stack: ${err.stack}`);
            buildResult.err = err;
        }
        finally {
            this._firstBuild = false;
            const t2 = perf_hooks_1.performance.now();
            this._logger.debug(`Target(${targetName}) ends with cost ${t2 - t1}ms.`);
            this._ready = true;
            // 发送编译完成消息
            event_emitter_1.eventEmitter.emit('pack-build-end', targetName);
            this._buildStarted = false;
        }
        return buildResult;
    }
    deleteCacheFile(filePath) {
        const mods = this._prerequisiteAssetMods;
        if (filePath && mods.size) {
            mods.delete(filePath);
        }
    }
    async _build() {
        const prerequisiteAssetMods = await this._getPrerequisiteAssetModsWithFilter();
        const buildEntries = [
            engineIndexModURL,
            prerequisite_imports_1.prerequisiteImportsModURL,
            ...prerequisiteAssetMods,
        ];
        const cleanResolution = this._cleanResolutionNextTime;
        if (cleanResolution) {
            this._cleanResolutionNextTime = false;
        }
        if (cleanResolution) {
            console.debug('This build will perform a clean module resolution.');
        }
        let buildResult = {};
        await wrapToSetImmediateQueue(this, async () => {
            buildResult = await this._quickPack.build(buildEntries, {
                retryResolutionOnUnchangedModule: this._firstBuild,
                cleanResolution: cleanResolution,
            });
        });
        return buildResult;
    }
    async clearCache() {
        this._quickPack.clear();
        this._firstBuild = true;
    }
    async applyAssetChanges(changes) {
        // 如果正在构建，等待构建完成
        if (this._buildPromise) {
            this._logger.debug(`Target(${this._name}) build in progress, waiting before applying asset changes...`);
            await this._buildPromise;
        }
        this._ensureIdle();
        for (const change of changes) {
            const uuid = change.uuid;
            // Note: "modified" directive is decomposed as "remove" and "add".
            if (change.type === asset_1.AssetActionEnum.change ||
                change.type === asset_1.AssetActionEnum.delete) {
                const oldURL = this._uuidURLMap.get(uuid);
                if (!oldURL) {
                    // As of now, we receive an asset modifying or changing directive
                    // but the asset was not processed by us before.
                    // This however can only happen when:
                    // - the asset is removed, and it's an plugin script;
                    // - the asset is modified from plugin script to non-plugin-script.
                    // Otherwise, something went wrong.
                    // But we could not distinguish the second reason from
                    // "received an error asset change directive"
                    // since we don't know the asset's previous status. So we choose to skip this check.
                    // this._logger.warn(`Unexpected: ${uuid} is not in registry.`);
                }
                else {
                    this._uuidURLMap.delete(uuid);
                    this._modLo.unsetUUID(oldURL);
                    const deleted = this._prerequisiteAssetMods.delete(oldURL);
                    if (!deleted) {
                        this._logger.warn(`Unexpected: ${oldURL} is not in registry.`);
                    }
                }
            }
            if (change.type === asset_1.AssetActionEnum.change ||
                change.type === asset_1.AssetActionEnum.add) {
                if (change.isPluginScript) {
                    continue;
                }
                const { href: url } = change.url;
                this._uuidURLMap.set(uuid, url);
                this._modLo.setUUID(url, uuid);
                this._prerequisiteAssetMods.add(url);
            }
        }
        // Update the import main module
        const prerequisiteImports = await this._getPrerequisiteAssetModsWithFilter();
        const source = (this._tentativePrerequisiteImportsMod ? prerequisite_imports_1.makeTentativePrerequisiteImports : prerequisite_imports_1.makePrerequisiteImportsMod)(prerequisiteImports);
        console.time('update entry mod');
        if (OPTIMIZE_ENTRY_SOURCE_COMPILATION) {
            // 注意：.source 是一个 setter，其内部会更新 timestamp，导致每次都重新编译入口文件，如果项目比较大，入口文件的编译会非常耗时。
            // 这里优化，只有在有差异的情况下才去更新 source
            if (this._entryModSource.length !== source.length || this._entryModSource !== source) {
                this._entryModSource = this._entryMod.source = source;
            }
        }
        else {
            // 旧的逻辑是每次任意脚本变化，都重新设置入口 source，对大项目影响比较大
            this._entryModSource = this._entryMod.source = source;
        }
        console.timeEnd('update entry mod');
    }
    async setEngineIndexModuleSource(source) {
        // 如果正在构建，等待构建完成
        if (this._buildPromise) {
            this._logger.debug(`Target(${this._name}) build in progress, waiting before setting engine index module source...`);
            await this._buildPromise;
        }
        this._ensureIdle();
        this._engineIndexMod.source = source;
    }
    async setAssetDatabaseDomains(assetDatabaseDomains) {
        // 如果正在构建，等待构建完成
        if (this._buildPromise) {
            this._logger.debug(`Target(${this._name}) build in progress, waiting before setting asset database domains...`);
            await this._buildPromise;
        }
        this._ensureIdle();
        this._setAssetDatabaseDomainsSync(assetDatabaseDomains);
    }
    _setAssetDatabaseDomainsSync(assetDatabaseDomains) {
        const { _userImportMap: userImportMap } = this;
        const importMap = {};
        const importMapURL = userImportMap ? userImportMap.url : new url_1.URL('foo:/bar');
        // Integrates builtin mappings, since all of builtin mappings are absolute, we do not need parse.
        importMap.imports = {};
        importMap.imports['cc'] = engineIndexModURL;
        const assetPrefixes = [];
        for (const assetDatabaseDomain of assetDatabaseDomains) {
            const assetDirURL = (0, url_1.pathToFileURL)(path_1.default.join(assetDatabaseDomain.physical, path_1.default.join(path_1.default.sep))).href;
            importMap.imports[assetDatabaseDomain.root.href] = assetDirURL;
            assetPrefixes.push(assetDirURL);
        }
        if (userImportMap) {
            if (userImportMap.json.imports) {
                importMap.imports = {
                    ...importMap.imports,
                    ...userImportMap.json.imports,
                };
            }
            if (userImportMap.json.scopes) {
                for (const [scopeRep, specifierMap] of Object.entries(userImportMap.json.scopes)) {
                    const scopes = importMap.scopes ??= {};
                    scopes[scopeRep] = {
                        ...(scopes[scopeRep] ?? {}),
                        ...specifierMap,
                    };
                }
            }
        }
        this._logger.debug(`Our import map(${importMapURL}): ${JSON.stringify(importMap, undefined, 2)}`);
        this._modLo.setImportMap(importMap, importMapURL);
        this._modLo.setAssetPrefixes(assetPrefixes);
        this._cleanResolutionNextTime = true;
    }
    _dbInfos = [];
    _buildStarted = false;
    _buildPromise = null;
    _ready = false;
    _name;
    _engineIndexMod;
    _entryMod;
    _entryModSource = '';
    _modLo;
    _sourceMaps;
    _quickPack;
    _quickPackLoaderContext;
    _prerequisiteAssetMods = new Set();
    _uuidURLMap = new Map();
    _logger;
    _firstBuild = true;
    _cleanResolutionNextTime = true;
    _respectToFeatureSetting;
    _tentativePrerequisiteImportsMod;
    _userImportMap;
    async _getPrerequisiteAssetModsWithFilter() {
        const prerequisiteAssetMods = Array.from(this._prerequisiteAssetMods).sort();
        return prerequisiteAssetMods;
    }
    _ensureIdle() {
        (0, asserts_1.asserts)(!this._buildStarted, 'Build is in progress, but a status change request is filed');
    }
}
function matchObject(lhs, rhs) {
    return matchLhs(lhs, rhs);
    function matchLhs(lhs, rhs) {
        if (Array.isArray(lhs)) {
            return Array.isArray(rhs) && lhs.length === rhs.length &&
                lhs.every((v, i) => matchLhs(v, rhs[i]));
        }
        else if (typeof lhs === 'object' && lhs !== null) {
            return typeof rhs === 'object'
                && rhs !== null
                && Object.keys(lhs).every((key) => matchLhs(lhs[key], rhs[key]));
        }
        else if (lhs === null) {
            return rhs === null;
        }
        else {
            return lhs === rhs;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9zY3JpcHRpbmcvcGFja2VyLWRyaXZlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxnREFBc0I7QUFDdEIsd0RBQTBCO0FBQzFCLDZCQUF3RDtBQUN4RCwyQ0FBeUM7QUFDekMsaUVBQWlJO0FBQ2pJLDZEQUE0RTtBQUM1RSw0Q0FBNEM7QUFDNUMsOENBQTJDO0FBQzNDLDJFQUFvRztBQUVwRyxxRkFBaUY7QUFFakYseUVBS3NEO0FBQ3RELHlEQUEwSTtBQUMxSSxzREFBNkQ7QUFDN0QscUNBQThDO0FBQzlDLDBEQUE2RDtBQUM3RCxnREFBa0Q7QUFDbEQsa0RBQTBCO0FBRTFCLDJCQUFnQztBQUNoQyw4Q0FBOEM7QUFDOUMsOERBQWtFO0FBQ2xFLGtEQUEwRDtBQUMxRCxvREFBZ0Q7QUFFaEQsZ0RBQXdCO0FBRXhCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQztBQUVyQixNQUFNLHVCQUF1QixHQUFHLHdCQUF3QixDQUFDO0FBRXpELFNBQVMsaUJBQWlCLENBQUMsT0FBaUI7SUFDeEMsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDO0lBQzFCLEtBQUssTUFBTSxJQUFJLElBQUksT0FBTyxFQUFFLENBQUM7UUFDekIsTUFBTSxlQUFlLEdBQUcsY0FBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDckUsY0FBYyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBQ0QsT0FBTyxjQUFjLENBQUM7QUFDMUIsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFDLFlBQTBCO0lBQy9DLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUss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QUFPLE9BQU8sR0FBRyxLQUFLLFFBQVE7bUJBQ3ZCLEdBQUcsS0FBSyxJQUFJO21CQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUUsR0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFHLEdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0YsQ0FBQzthQUFNLElBQUksR0FBRyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ3RCLE9BQU8sR0FBRyxLQUFLLElBQUksQ0FBQztRQUN4QixDQUFDO2FBQU0sQ0FBQztZQUNKLE9BQU8sR0FBRyxLQUFLLEdBQUcsQ0FBQztRQUN2QixDQUFDO0lBQ0wsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuaW1wb3J0IHBzIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBwYXRoVG9GaWxlVVJMLCBVUkwgfSBmcm9tICd1cmwnO1xyXG5pbXBvcnQgeyBwZXJmb3JtYW5jZSB9IGZyb20gJ3BlcmZfaG9va3MnO1xyXG5pbXBvcnQgeyBtYWtlUHJlcmVxdWlzaXRlSW1wb3J0c01vZCwgbWFrZVRlbnRhdGl2ZVByZXJlcXVpc2l0ZUltcG9ydHMsIHByZXJlcXVpc2l0ZUltcG9ydHNNb2RVUkwgfSBmcm9tICcuL3ByZXJlcXVpc2l0ZS1pbXBvcnRzJztcclxuaW1wb3J0IHsgZWRpdG9yQnJvd3NlcnNsaXN0UXVlcnkgfSBmcm9tICdAY29jb3MvbGliLXByb2dyYW1taW5nL2Rpc3QvdXRpbHMnO1xyXG5pbXBvcnQgeyBTdGF0c1F1ZXJ5IH0gZnJvbSAnQGNvY29zL2NjYnVpbGQnO1xyXG5pbXBvcnQgeyBhc3NlcnRzIH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0cyc7XHJcbmltcG9ydCB7IHF1ZXJ5U2hhcmVkU2V0dGluZ3MsIHNjcmlwdENvbmZpZywgU2hhcmVkU2V0dGluZ3MgfSBmcm9tICcuLi9zaGFyZWQvcXVlcnktc2hhcmVkLXNldHRpbmdzJztcclxuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnQGNvY29zL2NyZWF0b3ItcHJvZ3JhbW1pbmctY29tbW9uL2xpYi9sb2dnZXInO1xyXG5pbXBvcnQgeyBRdWlja1BhY2sgfSBmcm9tICdAY29jb3MvY3JlYXRvci1wcm9ncmFtbWluZy1xdWljay1wYWNrL2xpYi9xdWljay1wYWNrJztcclxuaW1wb3J0IHsgUXVpY2tQYWNrTG9hZGVyQ29udGV4dCB9IGZyb20gJ0Bjb2Nvcy9jcmVhdG9yLXByb2dyYW1taW5nLXF1aWNrLXBhY2svbGliL2xvYWRlcic7XHJcbmltcG9ydCB7XHJcbiAgICBNb2RMbyxcclxuICAgIE1lbW9yeU1vZHVsZSxcclxuICAgIE1vZExvT3B0aW9ucyxcclxuICAgIEltcG9ydE1hcCxcclxufSBmcm9tICdAY29jb3MvY3JlYXRvci1wcm9ncmFtbWluZy1tb2QtbG8vbGliL21vZC1sbyc7XHJcbmltcG9ydCB7IEFzc2V0Q2hhbmdlLCBBc3NldENoYW5nZUluZm8sIEFzc2V0RGF0YWJhc2VEb21haW4sIEFzc2V0RGJJbnRlcm9wLCBEQkNoYW5nZVR5cGUsIE1vZGlmaWVkQXNzZXRDaGFuZ2UgfSBmcm9tICcuL2Fzc2V0LWRiLWludGVyb3AnO1xyXG5pbXBvcnQgeyBBc3NldEFjdGlvbkVudW0gfSBmcm9tICdAY29jb3MvYXNzZXQtZGIvbGlicy9hc3NldCc7XHJcbmltcG9ydCB7IFBhY2tlckRyaXZlckxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyJztcclxuaW1wb3J0IHsgTGFuZ3VhZ2VTZXJ2aWNlQWRhcHRlciB9IGZyb20gJy4uL2xhbmd1YWdlLXNlcnZpY2UnO1xyXG5pbXBvcnQgeyBBc3luY0RlbGVnYXRlIH0gZnJvbSAnLi4vdXRpbHMvZGVsZWdhdGUnO1xyXG5pbXBvcnQgSlNPTjUgZnJvbSAnanNvbjUnO1xyXG5pbXBvcnQgbWluaW1hdGNoIGZyb20gJ21pbmltYXRjaCc7XHJcbmltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tICdmcyc7XHJcbmltcG9ydCB7IHVybDJwYXRoIH0gZnJvbSAnLi4vLi4vYXNzZXRzL3V0aWxzJztcclxuaW1wb3J0IHsgY29tcHJlc3NVdWlkIH0gZnJvbSAnLi4vLi4vYnVpbGRlci93b3JrZXIvYnVpbGRlci91dGlscyc7XHJcbmltcG9ydCB7IFR5cGVTY3JpcHRDb25maWdCdWlsZGVyIH0gZnJvbSAnLi4vaW50ZWxsaWdlbmNlJztcclxuaW1wb3J0IHsgZXZlbnRFbWl0dGVyIH0gZnJvbSAnLi4vZXZlbnQtZW1pdHRlcic7XHJcbmltcG9ydCB7IERCSW5mbyB9IGZyb20gJy4uL0B0eXBlcy9jb25maWctZXhwb3J0JztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5jb25zdCBWRVJTSU9OID0gJzIwJztcclxuXHJcbmNvbnN0IGZlYXR1cmVVbml0TW9kdWxlUHJlZml4ID0gJ2NjZTovaW50ZXJuYWwveC9jYy1mdS8nO1xyXG5cclxuZnVuY3Rpb24gZ2V0RWRpdG9yUGF0dGVybnMoZGJJbmZvczogREJJbmZvW10pIHtcclxuICAgIGNvbnN0IGVkaXRvclBhdHRlcm5zID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGluZm8gb2YgZGJJbmZvcykge1xyXG4gICAgICAgIGNvbnN0IGRiRWRpdG9yUGF0dGVybiA9IHBzLmpvaW4oaW5mby50YXJnZXQsICcqKicsICdlZGl0b3InLCAnKiovKicpO1xyXG4gICAgICAgIGVkaXRvclBhdHRlcm5zLnB1c2goZGJFZGl0b3JQYXR0ZXJuKTtcclxuICAgIH1cclxuICAgIHJldHVybiBlZGl0b3JQYXR0ZXJucztcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q0NFTW9kdWxlSURzKGNjZU1vZHVsZU1hcDogQ0NFTW9kdWxlTWFwKSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoY2NlTW9kdWxlTWFwKS5maWx0ZXIoaWQgPT4gaWQgIT09ICdtYXBMb2NhdGlvbicpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB3cmFwVG9TZXRJbW1lZGlhdGVRdWV1ZTxUYXJnZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSwgUmVzdWx0Pih0aGl6OiBUYXJnZXQsIGZuOiAoLi4uYXJnczogQXJncykgPT4gUmVzdWx0LCAuLi5hcmdzOiBBcmdzKTogUHJvbWlzZTxSZXN1bHQ+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZTxSZXN1bHQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAvLyDms6jmhI/vvJpFZGl0b3IuTWVzc2FnZS5icm9hZGNhc3Qg5YaF6YOo5Lya5L2/55SoIHNldEltbWVkaWF0ZSDlu7bml7blub/mkq3kuovku7bjgIJcclxuICAgICAgICAvLyDlpoLmnpzlnKggYnJvYWRjYXN0IOS5i+WQjuiwg+eUqOS6huavlOi+g+iAl+aXtueahOaTjeS9nO+8jOmCo+S5iOa2iOaBr+S8muWcqOiAl+aXtuaTjeS9nOWQjuaJjeiiq+aUtuWIsOOAglxyXG4gICAgICAgIC8vIOWboOatpOi/memHjOS9v+eUqCBzZXRJbW1lZGlhdGUg5p2l6L2s5o2i5ZCM5q2l5Ye95pWw5Li65byC5q2l77yM5L+d6K+B6L2s5o2i55qE5Ye95pWw5ZyoIGJyb2FkY2FzdCDmtojmga/ooqvmlLbliLDlkI7lho3miafooYzjgIJcclxuICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShmbi5hcHBseSh0aGl6LCBhcmdzKSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuaW50ZXJmYWNlIEJ1aWxkUmVzdWx0IHtcclxuICAgIGRlcHNHcmFwaD86IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPjtcclxuICAgIGVycj86IG51bGwgfCBFcnJvcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIENDRU1vZHVsZUNvbmZpZyB7XHJcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xyXG4gICAgbWFpbjogc3RyaW5nO1xyXG4gICAgdHlwZXM6IHN0cmluZztcclxufVxyXG5cclxudHlwZSBDQ0VNb2R1bGVNYXAgPSB7XHJcbiAgICBbbW9kdWxlTmFtZTogc3RyaW5nXTogQ0NFTW9kdWxlQ29uZmlnO1xyXG59ICYge1xyXG4gICAgbWFwTG9jYXRpb246IHN0cmluZztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBQYWNrZXIg6amx5Yqo5Zmo44CCXHJcbiAqIC0g5bqV5bGC55SoIFF1aWNrUGFjayDlv6vpgJ/miZPljIXmqKHlnZfnm7jlhbPnmoTotYTmupDjgIJcclxuICogLSDkuqflh7rmmK/lj6/ku6Xov5vooYzliqDovb3nmoTmqKHlnZfotYTmupDvvIzljIXmi6zmqKHlnZfjgIFTb3VyY2UgbWFw562J77yb6ZyA6KaB5L2/55SoIFF1aWNrUGFja0xvYWRlciDlr7nov5nkupvmqKHlnZfotYTmupDov5vooYzliqDovb3lkozorr/pl67jgIJcclxuICovXHJcbmV4cG9ydCBjbGFzcyBQYWNrZXJEcml2ZXIge1xyXG4gICAgcHVibGljIGxhbmd1YWdlU2VydmljZTogTGFuZ3VhZ2VTZXJ2aWNlQWRhcHRlciB8IG51bGwgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBQYWNrZXJEcml2ZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCk6IFBhY2tlckRyaXZlciB7XHJcbiAgICAgICAgYXNzZXJ0cyhQYWNrZXJEcml2ZXIuX2luc3RhbmNlLCAnUGFja2VyRHJpdmVyIGlzIG5vdCBjcmVhdGVkIHlldC4gUGxlYXNlIGNhbGwgUGFja2VyRHJpdmVyLmNyZWF0ZSBmaXJzdC4nKTtcclxuICAgICAgICByZXR1cm4gUGFja2VyRHJpdmVyLl9pbnN0YW5jZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uiBQYWNrZXIg6amx5Yqo5Zmo44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgY3JlYXRlKHByb2plY3RQYXRoOiBzdHJpbmcsIGVuZ2luZVRzUGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgYXdhaXQgc2NyaXB0Q29uZmlnLmluaXQoKTtcclxuICAgICAgICBjb25zdCB0c0J1aWxkZXIgPSBuZXcgVHlwZVNjcmlwdENvbmZpZ0J1aWxkZXIocHJvamVjdFBhdGgsIGVuZ2luZVRzUGF0aCk7XHJcbiAgICAgICAgUGFja2VyRHJpdmVyLl9jY2VNb2R1bGVNYXAgPSBQYWNrZXJEcml2ZXIucXVlcnlDQ0VNb2R1bGVNYXAoKTtcclxuICAgICAgICBjb25zdCBiYXNlV29ya3NwYWNlID0gcHMuam9pbih0c0J1aWxkZXIuZ2V0VGVtcFBhdGgoKSwgJ3Byb2dyYW1taW5nJywgJ3BhY2tlci1kcml2ZXInKTtcclxuICAgICAgICBjb25zdCB2ZXJzaW9uRmlsZSA9IHBzLmpvaW4oYmFzZVdvcmtzcGFjZSwgJ1ZFUlNJT04nKTtcclxuICAgICAgICBjb25zdCB0YXJnZXRXb3Jrc3BhY2VCYXNlID0gcHMuam9pbihiYXNlV29ya3NwYWNlLCAndGFyZ2V0cycpO1xyXG4gICAgICAgIGNvbnN0IGRlYnVnTG9nRmlsZSA9IHBzLmpvaW4oYmFzZVdvcmtzcGFjZSwgJ2xvZ3MnLCAnZGVidWcubG9nJyk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRhcmdldHM6IFBhY2tlckRyaXZlclsnX3RhcmdldHMnXSA9IHt9O1xyXG5cclxuICAgICAgICBjb25zdCB2ZXJib3NlID0gdHJ1ZTtcclxuICAgICAgICBpZiAoYXdhaXQgZnMucGF0aEV4aXN0cyhkZWJ1Z0xvZ0ZpbGUpKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBmcy51bmxpbmsoZGVidWdMb2dGaWxlKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byByZXNldCBsb2cgZmlsZTogJHtkZWJ1Z0xvZ0ZpbGV9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxvZ2dlciA9IG5ldyBQYWNrZXJEcml2ZXJMb2dnZXIoZGVidWdMb2dGaWxlKTtcclxuXHJcbiAgICAgICAgbG9nZ2VyLmRlYnVnKG5ldyBEYXRlKCkudG9Mb2NhbGVTdHJpbmcoKSk7XHJcbiAgICAgICAgbG9nZ2VyLmRlYnVnKGBQcm9qZWN0OiAke3Byb2plY3RQYXRofWApO1xyXG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhgVGFyZ2V0czogJHtPYmplY3Qua2V5cyhwcmVkZWZpbmVkVGFyZ2V0cyl9YCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGluY3JlbWVudGFsUmVjb3JkID0gYXdhaXQgUGFja2VyRHJpdmVyLl9jcmVhdGVJbmNyZW1lbnRhbFJlY29yZChsb2dnZXIpO1xyXG5cclxuICAgICAgICBhd2FpdCBQYWNrZXJEcml2ZXIuX3ZhbGlkYXRlSW5jcmVtZW50YWxSZWNvcmQoXHJcbiAgICAgICAgICAgIGluY3JlbWVudGFsUmVjb3JkLFxyXG4gICAgICAgICAgICB2ZXJzaW9uRmlsZSxcclxuICAgICAgICAgICAgdGFyZ2V0V29ya3NwYWNlQmFzZSxcclxuICAgICAgICAgICAgbG9nZ2VyLFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvYWRNYXBwaW5nczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgICAgICAgJ2NjZTovaW50ZXJuYWwvY29kZS1xdWFsaXR5Lyc6IHBhdGhUb0ZpbGVVUkwoXHJcbiAgICAgICAgICAgICAgICBwcy5qb2luKF9fZGlybmFtZSwgJy4uLy4uJywgJy4uJywgJy4uJywgJ3N0YXRpYycsICdzY3JpcHRpbmcnLCAnYnVpbHRpbi1tb2RzJywgJ2NvZGUtcXVhbGl0eScsICcvJykpLmhyZWYsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3Qgc3RhdHNRdWVyeSA9IGF3YWl0IFN0YXRzUXVlcnkuY3JlYXRlKGVuZ2luZVRzUGF0aCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGVtcHR5RW5naW5lSW5kZXhNb2R1bGVTb3VyY2UgPSBzdGF0c1F1ZXJ5LmV2YWx1YXRlSW5kZXhNb2R1bGVTb3VyY2UoW10pO1xyXG5cclxuICAgICAgICBjb25zdCBjck9wdGlvbnM6IE1vZExvT3B0aW9uc1snY3InXSA9IHtcclxuICAgICAgICAgICAgbW9kdWxlUmVxdWVzdEZpbHRlcjogWy9eY2NcXC4/LiokL2ddLFxyXG4gICAgICAgICAgICByZXBvcnRlcjoge1xyXG4gICAgICAgICAgICAgICAgbW9kdWxlTmFtZTogJ2NjZTovaW50ZXJuYWwvY29kZS1xdWFsaXR5L2NyLm1qcycsXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdyZXBvcnQnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgW3RhcmdldElkLCB0YXJnZXRdIG9mIE9iamVjdC5lbnRyaWVzKHByZWRlZmluZWRUYXJnZXRzKSkge1xyXG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoYEluaXRpYWxpemluZyB0YXJnZXQgWyR7dGFyZ2V0Lm5hbWV9XWApO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbW9kTG9FeHRlcm5hbHM6IHN0cmluZ1tdID0gW1xyXG4gICAgICAgICAgICAgICAgJ2NjL2VudicsXHJcbiAgICAgICAgICAgICAgICAnY2MvdXNlcmxhbmQvbWFjcm8nLFxyXG4gICAgICAgICAgICAgICAgLi4uZ2V0Q0NFTW9kdWxlSURzKFBhY2tlckRyaXZlci5fY2NlTW9kdWxlTWFwKSwgLy8g6K6+572u57yW6L6R5Zmo5a+85Ye655qE5qih5Z2X5Li65aSW6YOo5qih5Z2XXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBtb2RMb0V4dGVybmFscy5wdXNoKC4uLnN0YXRzUXVlcnkuZ2V0RmVhdHVyZVVuaXRzKCkubWFwKFxyXG4gICAgICAgICAgICAgICAgKGZlYXR1cmVVbml0KSA9PiBgJHtmZWF0dXJlVW5pdE1vZHVsZVByZWZpeH0ke2ZlYXR1cmVVbml0fWApKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBicm93c2Vyc0xpc3RUYXJnZXRzID0gdGFyZ2V0LmJyb3dzZXJzTGlzdFRhcmdldHM7XHJcbiAgICAgICAgICAgIGlmICh0YXJnZXRJZCA9PT0gJ3ByZXZpZXcnICYmIGluY3JlbWVudGFsUmVjb3JkLmNvbmZpZy5wcmV2aWV3VGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBicm93c2Vyc0xpc3RUYXJnZXRzID0gaW5jcmVtZW50YWxSZWNvcmQuY29uZmlnLnByZXZpZXdUYXJnZXQ7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoYFVzZSBzcGVjaWZpZWQgcHJldmlldyBicm93c2Vyc2xpc3QgdGFyZ2V0OiAke2Jyb3dzZXJzTGlzdFRhcmdldHN9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbW9kTG8gPSBuZXcgTW9kTG8oe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0czogYnJvd3NlcnNMaXN0VGFyZ2V0cyxcclxuICAgICAgICAgICAgICAgIGxvb3NlOiBpbmNyZW1lbnRhbFJlY29yZC5jb25maWcubG9vc2UsXHJcbiAgICAgICAgICAgICAgICBndWVzc0NvbW1vbkpzRXhwb3J0czogaW5jcmVtZW50YWxSZWNvcmQuY29uZmlnLmd1ZXNzQ29tbW9uSnNFeHBvcnRzLFxyXG4gICAgICAgICAgICAgICAgdXNlRGVmaW5lRm9yQ2xhc3NGaWVsZHM6IGluY3JlbWVudGFsUmVjb3JkLmNvbmZpZy51c2VEZWZpbmVGb3JDbGFzc0ZpZWxkcyxcclxuICAgICAgICAgICAgICAgIGFsbG93RGVjbGFyZUZpZWxkczogaW5jcmVtZW50YWxSZWNvcmQuY29uZmlnLmFsbG93RGVjbGFyZUZpZWxkcyxcclxuICAgICAgICAgICAgICAgIGNyOiBjck9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBfY29tcHJlc3NVVUlEKHV1aWQ6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21wcmVzc1V1aWQodXVpZCwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGxvZ2dlcixcclxuICAgICAgICAgICAgICAgIGNoZWNrT2Jzb2xldGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBpbXBvcnRSZXN0cmljdGlvbnM6IFBhY2tlckRyaXZlci5faW1wb3J0UmVzdHJpY3Rpb25zLFxyXG4gICAgICAgICAgICAgICAgcHJlc2VydmVTeW1saW5rczogaW5jcmVtZW50YWxSZWNvcmQuY29uZmlnLnByZXNlcnZlU3ltbGlua3MsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbW9kTG8uc2V0RXh0cmFFeHBvcnRzQ29uZGl0aW9ucyhpbmNyZW1lbnRhbFJlY29yZC5jb25maWcuZXhwb3J0c0NvbmRpdGlvbnMpO1xyXG4gICAgICAgICAgICBtb2RMby5zZXRFeHRlcm5hbHMobW9kTG9FeHRlcm5hbHMpO1xyXG4gICAgICAgICAgICBtb2RMby5zZXRMb2FkTWFwcGluZ3MobG9hZE1hcHBpbmdzKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFdvcmtzcGFjZSA9IHBzLmpvaW4odGFyZ2V0V29ya3NwYWNlQmFzZSwgdGFyZ2V0SWQpO1xyXG4gICAgICAgICAgICBjb25zdCBxdWlja1BhY2sgPSBuZXcgUXVpY2tQYWNrKHtcclxuICAgICAgICAgICAgICAgIG1vZExvLFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luOiBwcm9qZWN0UGF0aCxcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZTogdGFyZ2V0V29ya3NwYWNlLFxyXG4gICAgICAgICAgICAgICAgbG9nZ2VyLFxyXG4gICAgICAgICAgICAgICAgdmVyYm9zZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0xvYWRpbmcgY2FjaGUnKTtcclxuICAgICAgICAgICAgY29uc3QgdDEgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICAgICAgYXdhaXQgcXVpY2tQYWNrLmxvYWRDYWNoZSgpO1xyXG4gICAgICAgICAgICBjb25zdCB0MiA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoYExvYWRpbmcgY2FjaGUgY29zdHMgJHt0MiAtIHQxfW1zLmApO1xyXG5cclxuICAgICAgICAgICAgbGV0IGVuZ2luZUluZGV4TW9kdWxlOlxyXG4gICAgICAgICAgICAgICAgQ29uc3RydWN0b3JQYXJhbWV0ZXJzPHR5cGVvZiBQYWNrVGFyZ2V0PlswXVsnZW5naW5lSW5kZXhNb2R1bGUnXTtcclxuICAgICAgICAgICAgaWYgKHRhcmdldC5pc0VkaXRvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmVhdHVyZXMgPSBhd2FpdCBQYWNrZXJEcml2ZXIuX2dldEVuZ2luZUZlYXR1cmVzU2hpcHBlZEluRWRpdG9yKHN0YXRzUXVlcnkpO1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGBFbmdpbmUgZmVhdHVyZXMgc2hpcHBlZCBpbiBlZGl0b3I6ICR7ZmVhdHVyZXN9YCk7XHJcbiAgICAgICAgICAgICAgICBlbmdpbmVJbmRleE1vZHVsZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IFBhY2tlckRyaXZlci5fZ2V0RW5naW5lSW5kZXhNb2R1bGVTb3VyY2Uoc3RhdHNRdWVyeSwgZmVhdHVyZXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3BlY3RUb0ZlYXR1cmVTZXR0aW5nOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbmdpbmVJbmRleE1vZHVsZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGVtcHR5RW5naW5lSW5kZXhNb2R1bGVTb3VyY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzcGVjdFRvRmVhdHVyZVNldHRpbmc6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBxdWlja1BhY2tMb2FkZXJDb250ZXh0ID0gcXVpY2tQYWNrLmNyZWF0ZUxvYWRlckNvbnRleHQoKTtcclxuICAgICAgICAgICAgdGFyZ2V0c1t0YXJnZXRJZF0gPSBuZXcgUGFja1RhcmdldCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiB0YXJnZXRJZCxcclxuICAgICAgICAgICAgICAgIG1vZExvLFxyXG4gICAgICAgICAgICAgICAgc291cmNlTWFwczogdGFyZ2V0LnNvdXJjZU1hcHMsXHJcbiAgICAgICAgICAgICAgICBxdWlja1BhY2ssXHJcbiAgICAgICAgICAgICAgICBxdWlja1BhY2tMb2FkZXJDb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgbG9nZ2VyLFxyXG4gICAgICAgICAgICAgICAgZW5naW5lSW5kZXhNb2R1bGUsXHJcbiAgICAgICAgICAgICAgICB0ZW50YXRpdmVQcmVyZXF1aXNpdGVJbXBvcnRzTW9kOiB0YXJnZXQuaXNFZGl0b3IgPz8gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB1c2VySW1wb3J0TWFwOiBpbmNyZW1lbnRhbFJlY29yZC5jb25maWcuaW1wb3J0TWFwID8ge1xyXG4gICAgICAgICAgICAgICAgICAgIGpzb246IGluY3JlbWVudGFsUmVjb3JkLmNvbmZpZy5pbXBvcnRNYXAuanNvbixcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IG5ldyBVUkwoaW5jcmVtZW50YWxSZWNvcmQuY29uZmlnLmltcG9ydE1hcC51cmwpLFxyXG4gICAgICAgICAgICAgICAgfSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwYWNrZXIgPSBuZXcgUGFja2VyRHJpdmVyKFxyXG4gICAgICAgICAgICB0c0J1aWxkZXIsXHJcbiAgICAgICAgICAgIHRhcmdldHMsXHJcbiAgICAgICAgICAgIHN0YXRzUXVlcnksXHJcbiAgICAgICAgICAgIGxvZ2dlclxyXG4gICAgICAgICk7XHJcbiAgICAgICAgUGFja2VyRHJpdmVyLl9pbnN0YW5jZSA9IHBhY2tlcjtcclxuICAgICAgICByZXR1cm4gcGFja2VyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcXVlcnlDQ0VNb2R1bGVNYXAoKTogQ0NFTW9kdWxlTWFwIHtcclxuICAgICAgICBjb25zdCBjY2VNb2R1bGVNYXBMb2NhdGlvbiA9IHBzLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vLi4vc3RhdGljL3NjcmlwdGluZy9jY2UtbW9kdWxlLmpzb25jJyk7XHJcbiAgICAgICAgY29uc3QgY2NlTW9kdWxlTWFwID0gSlNPTjUucGFyc2UoZnMucmVhZEZpbGVTeW5jKGNjZU1vZHVsZU1hcExvY2F0aW9uLCAndXRmOCcpKSBhcyBDQ0VNb2R1bGVNYXA7XHJcbiAgICAgICAgY2NlTW9kdWxlTWFwLm1hcExvY2F0aW9uID0gY2NlTW9kdWxlTWFwTG9jYXRpb247XHJcbiAgICAgICAgcmV0dXJuIGNjZU1vZHVsZU1hcDtcclxuICAgIH1cclxuXHJcbiAgICAvKirmnoTlu7rku7vliqHnmoTlp5TmiZjvvIzlnKjmnoTlu7rkuYvliY3kvJrmiorlp5TmiZjph4zpnaLnmoTmiYDmnInlhoXlrrnmiafooYwgKi9cclxuICAgIHB1YmxpYyByZWFkb25seSBiZWZvcmVFZGl0b3JCdWlsZERlbGVnYXRlOiBBc3luY0RlbGVnYXRlPChjaGFuZ2VzOiBNb2RpZmllZEFzc2V0Q2hhbmdlW10pID0+IFByb21pc2U8dm9pZD4+ID0gbmV3IEFzeW5jRGVsZWdhdGUoKTtcclxuICAgIHB1YmxpYyBidXN5KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9idWlsZGluZztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgdXBkYXRlRGJJbmZvcyhkYkluZm86IERCSW5mbywgZGJDaGFuZ2VUeXBlOiBEQkNoYW5nZVR5cGUpIHtcclxuICAgICAgICBjb25zdCBvbGREYkluZm9TaXplID0gdGhpcy5fZGJJbmZvcy5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGRiQ2hhbmdlVHlwZSA9PT0gREJDaGFuZ2VUeXBlLmFkZCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2RiSW5mb3Muc29tZShpdGVtID0+IGl0ZW0uZGJJRCA9PT0gZGJJbmZvLmRiSUQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kYkluZm9zLnB1c2goZGJJbmZvKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoZGJDaGFuZ2VUeXBlID09PSBEQkNoYW5nZVR5cGUucmVtb3ZlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RiSW5mb3MgPSB0aGlzLl9kYkluZm9zLmZpbHRlcihpdGVtID0+IGl0ZW0uZGJJRCAhPT0gZGJJbmZvLmRiSUQpO1xyXG4gICAgICAgICAgICBjb25zdCBzY3JpcHRJbmZvcyA9IHRoaXMuX2Fzc2V0RGJJbnRlcm9wLnJlbW92ZVRzU2NyaXB0SW5mb0NhY2hlKGRiSW5mby50YXJnZXQpO1xyXG4gICAgICAgICAgICBzY3JpcHRJbmZvcy5mb3JFYWNoKChpbmZvKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hc3NldENoYW5nZVF1ZXVlLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IEFzc2V0QWN0aW9uRW51bS5kZWxldGUsXHJcbiAgICAgICAgICAgICAgICAgICAgaW1wb3J0ZXI6ICd0eXBlc2NyaXB0JyxcclxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogaW5mby5maWxlUGF0aCxcclxuICAgICAgICAgICAgICAgICAgICB1dWlkOiBpbmZvLnV1aWQsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNQbHVnaW5TY3JpcHQ6IGluZm8uaXNQbHVnaW5TY3JpcHQsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBpbmZvLnVybCxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9sZERiSW5mb1NpemUgPT09IHRoaXMuX2RiSW5mb3MubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgY29uc3QgdXBkYXRlID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBhc3NldERhdGFiYXNlRG9tYWlucyA9IGF3YWl0IHRoaXMuX2Fzc2V0RGJJbnRlcm9wLnF1ZXJ5QXNzZXREb21haW5zKHRoaXMuX2RiSW5mb3MpO1xyXG4gICAgICAgICAgICBzZWxmLl9sb2dnZXIuZGVidWcoXHJcbiAgICAgICAgICAgICAgICAnUmVzZXQgZGF0YWJhc2VzLiAnICtcclxuICAgICAgICAgICAgICAgIGBFbnVtZXJhdGVkIGRvbWFpbnM6ICR7SlNPTi5zdHJpbmdpZnkoYXNzZXREYXRhYmFzZURvbWFpbnMsIHVuZGVmaW5lZCwgMil9YCk7XHJcblxyXG5cclxuICAgICAgICAgICAgY29uc3QgdHNCdWlsZGVyID0gc2VsZi5fdHNCdWlsZGVyO1xyXG4gICAgICAgICAgICB0c0J1aWxkZXIuc2V0RGJVUkxJbmZvcyh0aGlzLl9kYkluZm9zKTtcclxuICAgICAgICAgICAgY29uc3QgcmVhbFRzQ29uZmlnUGF0aCA9IHRzQnVpbGRlci5nZXRSZWFsVHNDb25maWdQYXRoKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3RQYXRoID0gdHNCdWlsZGVyLmdldFByb2plY3RQYXRoKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbXBpbGVyT3B0aW9ucyA9IGF3YWl0IHRzQnVpbGRlci5nZXRDb21waWxlck9wdGlvbnMoKTtcclxuICAgICAgICAgICAgY29uc3QgaW50ZXJuYWxEYlVSTEluZm9zID0gYXdhaXQgdHNCdWlsZGVyLmdldEludGVybmFsRGJVUkxJbmZvcygpO1xyXG4gICAgICAgICAgICBzZWxmLmxhbmd1YWdlU2VydmljZSA9IG5ldyBMYW5ndWFnZVNlcnZpY2VBZGFwdGVyKHJlYWxUc0NvbmZpZ1BhdGgsIHByb2plY3RQYXRoLCBzZWxmLmJlZm9yZUVkaXRvckJ1aWxkRGVsZWdhdGUsIGNvbXBpbGVyT3B0aW9ucywgaW50ZXJuYWxEYlVSTEluZm9zKTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCB0YXJnZXQgb2YgT2JqZWN0LnZhbHVlcyh0aGlzLl90YXJnZXRzKSkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnVwZGF0ZURiSW5mb3ModGhpcy5fZGJJbmZvcyk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YXJnZXQuc2V0QXNzZXREYXRhYmFzZURvbWFpbnMoYXNzZXREYXRhYmFzZURvbWFpbnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAodGhpcy5idXN5KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5fYmVmb3JlQnVpbGRUYXNrcy5wdXNoKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhd2FpdCB1cGRhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcGF0Y2hBc3NldENoYW5nZXMoYXNzZXRDaGFuZ2U6IEFzc2V0Q2hhbmdlSW5mbykge1xyXG4gICAgICAgIHRoaXMuX2Fzc2V0RGJJbnRlcm9wLm9uQXNzZXRDaGFuZ2UoYXNzZXRDaGFuZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LuOIGFzc2V0LWRiIOiOt+WPluaJgOacieaVsOaNruW5tuaehOW7uu+8jOWMheWQqyB0cyDlkowganMg6ISa5pys44CCXHJcbiAgICAgKiBBc3NldENoYW5nZSBmb3JtYXQ6XHJcbiAgICAgKiAge1xyXG4gICAgICogICAgICB0eXBlOiBBc3NldENoYW5nZVR5cGUuYWRkLFxyXG4gICAgICAgICAgICB1dWlkOiBhc3NldEluZm8udXVpZCxcclxuICAgICAgICAgICAgZmlsZVBhdGg6IGFzc2V0SW5mby5maWxlLFxyXG4gICAgICAgICAgICB1cmw6IGdldFVSTChhc3NldEluZm8pLFxyXG4gICAgICAgICAgICBpc1BsdWdpblNjcmlwdDogaXNQbHVnaW5TY3JpcHQobWV0YSB8fCBhc3NldEluZm8ubWV0YSEpLFxyXG4gICAgICogIH1cclxuICAgICAqIEBwYXJhbSBhc3NldENoYW5nZXMg6LWE5rqQ5Y+Y5pu05YiX6KGoXHJcbiAgICAgKiBAcGFyYW0gdGFza0lkIOS7u+WKoUlE77yM55So5LqO6Lef6Liq5Lu75Yqh54q25oCBXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBidWlsZChjaGFuZ2VJbmZvcz86IEFzc2V0Q2hhbmdlSW5mb1tdLCB0YXNrSWQ/OiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBsb2dnZXIgPSB0aGlzLl9sb2dnZXI7XHJcblxyXG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnUHVsbGluZyBhc3NldC1kYi4nKTtcclxuXHJcbiAgICAgICAgY29uc3QgdDEgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICBpZiAoY2hhbmdlSW5mb3MgJiYgY2hhbmdlSW5mb3MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBjaGFuZ2VJbmZvcy5mb3JFYWNoKGNoYW5nZUluZm8gPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYXNzZXREYkludGVyb3Aub25Bc3NldENoYW5nZShjaGFuZ2VJbmZvKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0Q2hhbmdlcyA9IHRoaXMuX2Fzc2V0RGJJbnRlcm9wLmdldEFzc2V0Q2hhbmdlUXVldWUoKTtcclxuICAgICAgICAgICAgdGhpcy5fYXNzZXRDaGFuZ2VRdWV1ZS5wdXNoKC4uLmFzc2V0Q2hhbmdlcyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Fzc2V0RGJJbnRlcm9wLnJlc2V0QXNzZXRDaGFuZ2VRdWV1ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0MiA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG5cclxuICAgICAgICBsb2dnZXIuZGVidWcoYEZldGNoIGFzc2V0LWRiIGNvc3Q6ICR7dDIgLSB0MX1tcy5gKTtcclxuXHJcbiAgICAgICAgYXdhaXQgdGhpcy5fc3RhcnRCdWlsZCh0YXNrSWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyBjbGVhckNhY2hlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9jbGVhcmluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2dnZXIuZGVidWcoJ0ZhaWxlZCB0byBjbGVhciBjYWNoZTogcHJldmlvdXMgY2xlYXJpbmcgaGF2ZSBub3QgZmluaXNoZWQgeWV0LicpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmJ1c3koKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byBjbGVhciBjYWNoZTogdGhlIGJ1aWxkaW5nIGlzIHN0aWxsIHdvcmtpbmcgaW4gcHJvZ3Jlc3MuJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY2xlYXJpbmcgPSB0cnVlO1xyXG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIHRhcmdldF0gb2YgT2JqZWN0LmVudHJpZXModGhpcy5fdGFyZ2V0cykpIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9nZ2VyLmRlYnVnKGBDbGVhciBjYWNoZSBvZiB0YXJnZXQgJHtuYW1lfWApO1xyXG4gICAgICAgICAgICBhd2FpdCB0YXJnZXQuY2xlYXJDYWNoZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sb2dnZXIuZGVidWcoJ1JlcXVlc3QgYnVpbGQgYWZ0ZXIgY2xlYXJpbmcuLi4nKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmJ1aWxkKFtdKTtcclxuICAgICAgICB0aGlzLl9jbGVhcmluZyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRRdWlja1BhY2tMb2FkZXJDb250ZXh0KHRhcmdldE5hbWU6IFRhcmdldE5hbWUpIHtcclxuICAgICAgICB0aGlzLl93YXJuTWlzc2luZ1RhcmdldCh0YXJnZXROYW1lKTtcclxuICAgICAgICBpZiAodGFyZ2V0TmFtZSBpbiB0aGlzLl90YXJnZXRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90YXJnZXRzW3RhcmdldE5hbWVdLnF1aWNrUGFja0xvYWRlckNvbnRleHQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGlzUmVhZHkodGFyZ2V0TmFtZTogVGFyZ2V0TmFtZSkge1xyXG4gICAgICAgIHRoaXMuX3dhcm5NaXNzaW5nVGFyZ2V0KHRhcmdldE5hbWUpO1xyXG4gICAgICAgIGlmICh0YXJnZXROYW1lIGluIHRoaXMuX3RhcmdldHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RhcmdldHNbdGFyZ2V0TmFtZV0ucmVhZHk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blvZPliY3mraPlnKjmiafooYznmoTnvJbor5Hku7vliqFJRFxyXG4gICAgICogQHJldHVybnMg5Lu75YqhSUTvvIzlpoLmnpzmsqHmnInmraPlnKjmiafooYznmoTku7vliqHliJnov5Tlm55udWxsXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRDdXJyZW50VGFza0lkKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50VGFza0lkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBxdWVyeVNjcmlwdERlcHMocXVlcnlQYXRoOiBzdHJpbmcpOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgY29uc3Qgc2NyaXB0UGF0aDogc3RyaW5nID0gcGF0aC5ub3JtYWxpemUocXVlcnlQYXRoKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XHJcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtRGVwc0dyYXBoKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2RlcHNHcmFwaENhY2hlW3NjcmlwdFBhdGhdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX2RlcHNHcmFwaENhY2hlW3NjcmlwdFBhdGhdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHF1ZXJ5U2NyaXB0VXNlcnMocXVlcnlQYXRoOiBzdHJpbmcpOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgY29uc3Qgc2NyaXB0UGF0aDogc3RyaW5nID0gcGF0aC5ub3JtYWxpemUocXVlcnlQYXRoKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XHJcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtRGVwc0dyYXBoKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX3VzZWRHcmFwaENhY2hlW3NjcmlwdFBhdGhdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX3VzZWRHcmFwaENhY2hlW3NjcmlwdFBhdGhdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyBzaHV0RG93bigpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLmRlc3Ryb3llZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RiSW5mb3M6IERCSW5mb1tdID0gW107XHJcbiAgICBwcml2YXRlIF90c0J1aWxkZXI6IFR5cGVTY3JpcHRDb25maWdCdWlsZGVyO1xyXG4gICAgcHJpdmF0ZSBfY2xlYXJpbmcgPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX3RhcmdldHM6IFJlY29yZDxUYXJnZXROYW1lLCBQYWNrVGFyZ2V0PiA9IHt9O1xyXG4gICAgcHJpdmF0ZSBfbG9nZ2VyOiBQYWNrZXJEcml2ZXJMb2dnZXI7XHJcbiAgICBwcml2YXRlIF9zdGF0c1F1ZXJ5OiBTdGF0c1F1ZXJ5O1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfYXNzZXREYkludGVyb3A6IEFzc2V0RGJJbnRlcm9wO1xyXG4gICAgcHJpdmF0ZSBfYXNzZXRDaGFuZ2VRdWV1ZTogQXNzZXRDaGFuZ2VbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBfYnVpbGRpbmcgPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX2ZlYXR1cmVDaGFuZ2VkID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF9iZWZvcmVCdWlsZFRhc2tzOiAoKCkgPT4gdm9pZClbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBfZGVwc0dyYXBoOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7fTtcclxuICAgIHByaXZhdGUgX25lZWRVcGRhdGVEZXBzQ2FjaGUgPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX3VzZWRHcmFwaENhY2hlOiBSZWNvcmQ8c3RyaW5nLCBTZXQ8c3RyaW5nPj4gPSB7fTtcclxuICAgIHByaXZhdGUgX2RlcHNHcmFwaENhY2hlOiBSZWNvcmQ8c3RyaW5nLCBTZXQ8c3RyaW5nPj4gPSB7fTtcclxuICAgIHByaXZhdGUgc3RhdGljIF9jY2VNb2R1bGVNYXA6IENDRU1vZHVsZU1hcDtcclxuICAgIHByaXZhdGUgc3RhdGljIF9pbXBvcnRSZXN0cmljdGlvbnM6IGFueVtdID0gW107XHJcbiAgICBwcml2YXRlIF9pbml0ID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF9mZWF0dXJlczogc3RyaW5nW10gPSBbXTtcclxuICAgIHByaXZhdGUgX2N1cnJlbnRUYXNrSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoYnVpbGRlcjogVHlwZVNjcmlwdENvbmZpZ0J1aWxkZXIsIHRhcmdldHM6IFBhY2tlckRyaXZlclsnX3RhcmdldHMnXSwgc3RhdHNRdWVyeTogU3RhdHNRdWVyeSwgbG9nZ2VyOiBQYWNrZXJEcml2ZXJMb2dnZXIpIHtcclxuICAgICAgICB0aGlzLl90c0J1aWxkZXIgPSBidWlsZGVyO1xyXG4gICAgICAgIHRoaXMuX3RhcmdldHMgPSB0YXJnZXRzO1xyXG4gICAgICAgIHRoaXMuX3N0YXRzUXVlcnkgPSBzdGF0c1F1ZXJ5O1xyXG4gICAgICAgIHRoaXMuX2xvZ2dlciA9IGxvZ2dlcjtcclxuICAgICAgICB0aGlzLl9hc3NldERiSW50ZXJvcCA9IG5ldyBBc3NldERiSW50ZXJvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgZmVhdHVyZXMoZmVhdHVyZXM6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgdGhpcy5fZmVhdHVyZXMgPSBmZWF0dXJlcztcclxuICAgICAgICB0aGlzLl9mZWF0dXJlQ2hhbmdlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGluaXQoZmVhdHVyZXM6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pbml0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9mZWF0dXJlcyA9IGZlYXR1cmVzO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuX3N5bmNFbmdpbmVGZWF0dXJlcyhmZWF0dXJlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGdlbmVyYXRlRGVjbGFyYXRpb25zKCkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMuX3RzQnVpbGRlci5nZW5lcmF0ZURlY2xhcmF0aW9ucyhbXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIHF1ZXJ5U2hhcmVkU2V0dGluZ3MoKTogUHJvbWlzZTxTaGFyZWRTZXR0aW5ncz4ge1xyXG4gICAgICAgIHJldHVybiBxdWVyeVNoYXJlZFNldHRpbmdzKHRoaXMuX2xvZ2dlcik7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZGVzdHJveWVkKCkge1xyXG4gICAgICAgIHRoaXMuX2luaXQgPSBmYWxzZTtcclxuICAgICAgICBhd2FpdCB0aGlzLl9hc3NldERiSW50ZXJvcC5kZXN0cm95ZWQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF93YXJuTWlzc2luZ1RhcmdldCh0YXJnZXROYW1lOiBUYXJnZXROYW1lKSB7XHJcbiAgICAgICAgaWYgKCEodGFyZ2V0TmFtZSBpbiB0aGlzLl90YXJnZXRzKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEludmFsaWQgcGFjayB0YXJnZXQ6ICR7dGFyZ2V0TmFtZX0uIEV4aXN0aW5nIHRhcmdldHMgYXJlOiAke09iamVjdC5rZXlzKHRoaXMuX3RhcmdldHMpfWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOW8gOWni+S4gOasoeaehOW7uuOAglxyXG4gICAgICogQHBhcmFtIHRhc2tJZCDku7vliqFJRO+8jOeUqOS6jui3n+i4quS7u+WKoeeKtuaAgVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFzeW5jIF9zdGFydEJ1aWxkKHRhc2tJZD86IHN0cmluZykge1xyXG4gICAgICAgIC8vIOebruWJjeS4jeiDveebtOaOpei3s+i/h++8jOWboOS4uuiwg+eUqOe8luivkeaOpeWPo+aXtuaYr+acn+acm+eri+WNs+aJp+ihjOeahO+8jOWmguaenOi3s+i/h+S8muWvvOiHtOe8luivkeS7u+WKoeaXoOazleaJp+ihjOOAglxyXG4gICAgICAgIC8vIGlmICh0aGlzLl9idWlsZGluZykge1xyXG4gICAgICAgIC8vICAgICB0aGlzLl9sb2dnZXIuZGVidWcoJ0J1aWxkIGl0ZXJhdGlvbiBhbHJlYWR5IHN0YXJ0ZWQsIHNraXAuJyk7XHJcbiAgICAgICAgLy8gICAgIHJldHVybjtcclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgdGhpcy5fYnVpbGRpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnRUYXNrSWQgPSB0YXNrSWQgfHwgbnVsbDtcclxuICAgICAgICBldmVudEVtaXR0ZXIuZW1pdCgnY29tcGlsZS1zdGFydCcsICdwcm9qZWN0JywgdGFza0lkKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbG9nZ2VyLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5fbG9nZ2VyLmRlYnVnKFxyXG4gICAgICAgICAgICAnQnVpbGQgaXRlcmF0aW9uIHN0YXJ0cy5cXG4nICtcclxuICAgICAgICAgICAgYE51bWJlciBvZiBhY2N1bXVsYXRlZCBhc3NldCBjaGFuZ2VzOiAke3RoaXMuX2Fzc2V0Q2hhbmdlUXVldWUubGVuZ3RofVxcbmAgK1xyXG4gICAgICAgICAgICBgRmVhdHVyZSBjaGFuZ2VkOiAke3RoaXMuX2ZlYXR1cmVDaGFuZ2VkfWAgK1xyXG4gICAgICAgICAgICAodGFza0lkID8gYFxcblRhc2sgSUQ6ICR7dGFza0lkfWAgOiAnJyksXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAodGhpcy5fZmVhdHVyZUNoYW5nZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fZmVhdHVyZUNoYW5nZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5fc3luY0VuZ2luZUZlYXR1cmVzKHRoaXMuX2ZlYXR1cmVzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYXNzZXRDaGFuZ2VzID0gdGhpcy5fYXNzZXRDaGFuZ2VRdWV1ZTtcclxuICAgICAgICB0aGlzLl9hc3NldENoYW5nZVF1ZXVlID0gW107XHJcbiAgICAgICAgY29uc3QgYmVmb3JlVGFza3MgPSB0aGlzLl9iZWZvcmVCdWlsZFRhc2tzLnNsaWNlKCk7XHJcbiAgICAgICAgdGhpcy5fYmVmb3JlQnVpbGRUYXNrcy5sZW5ndGggPSAwO1xyXG4gICAgICAgIGZvciAoY29uc3QgYmVmb3JlVGFzayBvZiBiZWZvcmVUYXNrcykge1xyXG4gICAgICAgICAgICBiZWZvcmVUYXNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IHRoaXMuYmVmb3JlRWRpdG9yQnVpbGREZWxlZ2F0ZS5kaXNwYXRjaChhc3NldENoYW5nZXMuZmlsdGVyKGl0ZW0gPT4gaXRlbS50eXBlID09PSBBc3NldEFjdGlvbkVudW0uY2hhbmdlKSBhcyBNb2RpZmllZEFzc2V0Q2hhbmdlW10pO1xyXG4gICAgICAgIGNvbnN0IG5vbkRUU0NoYW5nZXMgPSBhc3NldENoYW5nZXMuZmlsdGVyKGl0ZW0gPT4gIWl0ZW0uZmlsZVBhdGguZW5kc1dpdGgoJy5kLnRzJykpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBlcnI6IEVycm9yIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgZm9yIChjb25zdCBbLCB0YXJnZXRdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMuX3RhcmdldHMpKSB7XHJcbiAgICAgICAgICAgIGlmIChhc3NldENoYW5nZXMubGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YXJnZXQuYXBwbHlBc3NldENoYW5nZXMobm9uRFRTQ2hhbmdlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgYnVpbGRSZXN1bHQgPSBhd2FpdCB0YXJnZXQuYnVpbGQoKTtcclxuICAgICAgICAgICAgaWYgKGJ1aWxkUmVzdWx0LmVycikge1xyXG4gICAgICAgICAgICAgICAgZXJyID0gYnVpbGRSZXN1bHQuZXJyO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmRlbGV0ZUNhY2hlRmlsZSgoZXJyIGFzIGFueSkuZmlsZSk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBidWlsZFJlc3VsdC5kZXBzR3JhcGggJiYgKHRoaXMuX2RlcHNHcmFwaCA9IGJ1aWxkUmVzdWx0LmRlcHNHcmFwaCk7IC8vIOabtOaWsOS+nei1luWbvlxyXG4gICAgICAgICAgICB0aGlzLl9uZWVkVXBkYXRlRGVwc0NhY2hlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fYnVpbGRpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9jdXJyZW50VGFza0lkID0gbnVsbDtcclxuXHJcbiAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQoJ2NvbXBpbGVkJywgJ3Byb2plY3QnKTtcclxuXHJcbiAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIF9jcmVhdGVJbmNyZW1lbnRhbFJlY29yZChsb2dnZXI6IExvZ2dlcik6IFByb21pc2U8SW5jcmVtZW50YWxSZWNvcmQ+IHtcclxuICAgICAgICBjb25zdCBzaGFyZWRNb2RMb09wdGlvbnMgPSBhd2FpdCBxdWVyeVNoYXJlZFNldHRpbmdzKGxvZ2dlcik7XHJcblxyXG4gICAgICAgIGNvbnN0IGluY3JlbWVudGFsUmVjb3JkOiBJbmNyZW1lbnRhbFJlY29yZCA9IHtcclxuICAgICAgICAgICAgdmVyc2lvbjogVkVSU0lPTixcclxuICAgICAgICAgICAgY29uZmlnOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zaGFyZWRNb2RMb09wdGlvbnMsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgcHJldmlld0Jyb3dzZXJzTGlzdENvbmZpZ0ZpbGUgPSBhd2FpdCBzY3JpcHRDb25maWcuZ2V0UHJvamVjdCgncHJldmlld0Jyb3dzZXJzbGlzdENvbmZpZ0ZpbGUnKSBhcyBzdHJpbmc7XHJcbiAgICAgICAgaWYgKHByZXZpZXdCcm93c2Vyc0xpc3RDb25maWdGaWxlICYmIHByZXZpZXdCcm93c2Vyc0xpc3RDb25maWdGaWxlICE9PSAncHJvamVjdDovLycpIHtcclxuICAgICAgICAgICAgY29uc3QgcHJldmlld0Jyb3dzZXJzTGlzdENvbmZpZ0ZpbGVQYXRoID0gdXJsMnBhdGgocHJldmlld0Jyb3dzZXJzTGlzdENvbmZpZ0ZpbGUgYXMgc3RyaW5nKTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGlmIChwcmV2aWV3QnJvd3NlcnNMaXN0Q29uZmlnRmlsZVBhdGggJiYgZXhpc3RzU3luYyhwcmV2aWV3QnJvd3NlcnNMaXN0Q29uZmlnRmlsZVBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldmlld1RhcmdldCA9IGF3YWl0IHJlYWRCcm93c2Vyc2xpc3RUYXJnZXQocHJldmlld0Jyb3dzZXJzTGlzdENvbmZpZ0ZpbGVQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldmlld1RhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNyZW1lbnRhbFJlY29yZC5jb25maWcucHJldmlld1RhcmdldCA9IHByZXZpZXdUYXJnZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIud2FybihgUHJldmlldyB0YXJnZXQgY29uZmlnIGZpbGUgbm90IGZvdW5kLiAke3ByZXZpZXdCcm93c2Vyc0xpc3RDb25maWdGaWxlUGF0aCB8fCBwcmV2aWV3QnJvd3NlcnNMaXN0Q29uZmlnRmlsZX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgRmFpbGVkIHRvIGxvYWQgcHJldmlldyB0YXJnZXQgY29uZmlnIGZpbGUgYXQgJHtwcmV2aWV3QnJvd3NlcnNMaXN0Q29uZmlnRmlsZVBhdGggfHwgcHJldmlld0Jyb3dzZXJzTGlzdENvbmZpZ0ZpbGV9OiAke2Vycm9yfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaW5jcmVtZW50YWxSZWNvcmQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgX3ZhbGlkYXRlSW5jcmVtZW50YWxSZWNvcmQoXHJcbiAgICAgICAgcmVjb3JkOiBJbmNyZW1lbnRhbFJlY29yZCxcclxuICAgICAgICByZWNvcmRGaWxlOiBzdHJpbmcsXHJcbiAgICAgICAgdGFyZ2V0V29ya3NwYWNlQmFzZTogc3RyaW5nLFxyXG4gICAgICAgIGxvZ2dlcjogTG9nZ2VyLFxyXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgbGV0IG1hdGNoZWQgPSBmYWxzZTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBvbGRSZWNvcmQ6IEluY3JlbWVudGFsUmVjb3JkID0gYXdhaXQgZnMucmVhZEpzb24ocmVjb3JkRmlsZSk7XHJcbiAgICAgICAgICAgIG1hdGNoZWQgPSBtYXRjaE9iamVjdChyZWNvcmQsIG9sZFJlY29yZCk7XHJcbiAgICAgICAgICAgIGlmIChtYXRjaGVkKSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0luY3JlbWVudGFsIGZpbGUgc2VlbXMgZ3JlYXQuJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoXHJcbiAgICAgICAgICAgICAgICAgICAgJ1tQYWNrZXJEcml2ZXJdIE9wdGlvbnMgZG9lc25cXCd0IG1hdGNoLlxcbicgK1xyXG4gICAgICAgICAgICAgICAgICAgIGBMYXN0OiAke0pTT04uc3RyaW5naWZ5KHJlY29yZCwgdW5kZWZpbmVkLCAyKX1cXG5gICtcclxuICAgICAgICAgICAgICAgICAgICBgQ3VycmVudDogJHtKU09OLnN0cmluZ2lmeShvbGRSZWNvcmQsIHVuZGVmaW5lZCwgMil9YCxcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGBQYWNrZXIgZGVyaXZlciB2ZXJzaW9uIGZpbGUgbG9zdCBvciBmb3JtYXQgaW5jb3JyZWN0OiAke2Vycn1gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghbWF0Y2hlZCkge1xyXG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0NsZWFyaW5nIG91dCB0aGUgdGFyZ2V0cy4uLicpO1xyXG4gICAgICAgICAgICBhd2FpdCBmcy5lbXB0eURpcih0YXJnZXRXb3Jrc3BhY2VCYXNlKTtcclxuICAgICAgICAgICAgYXdhaXQgZnMub3V0cHV0SnNvbihyZWNvcmRGaWxlLCByZWNvcmQsIHsgc3BhY2VzOiAyIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG1hdGNoZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgX2dldEVuZ2luZUZlYXR1cmVzU2hpcHBlZEluRWRpdG9yKHN0YXRzUXVlcnk6IFN0YXRzUXVlcnkpIHtcclxuICAgICAgICAvLyDku44gdjMuOC41IOW8gOWni++8jOaUr+aMgeaJi+WKqOWKoOi9vSBXQVNNIOaooeWdl++8jOaPkOS+m+S6hiBsb2FkV2FzbU1vZHVsZUJveDJELCBsb2FkV2FzbU1vZHVsZUJ1bGxldCDnrYnmlrnms5XvvIzov5nkupvmlrnms5XmmK/lnKggZmVhdHVyZSDlhaXlj6MgKCBleHBvcnRzIOebruW9leS4i+eahOaWh+S7tuWvvOWHuueahClcclxuICAgICAgICAvLyDkuYvliY3liZTpmaTov5nkupvlkI7nq68gZmVhdHVyZSDlhaXlj6PvvIzlupTor6XmmK/lnKggaHR0cHM6Ly9naXRodWIuY29tL2NvY29zLzNkLXRhc2tzL2lzc3Vlcy81NzQ3IOS4reeahOW7uuiuruOAglxyXG4gICAgICAgIC8vIOS9huWunumZheS4iu+8jOe8lui+keWZqOeOr+Wig+S4i+eahOW8leaTjuaJk+WMheeahOaXtuWAme+8jOW3sue7j+aKiuaJgOacieaooeWdl+aJk+i/myBidW5kbGVkL2luZGV4LmpzIOS4re+8jOinge+8mmh0dHBzOi8vZ2l0aHViLmNvbS9jb2Nvcy9jb2Nvcy1lZGl0b3IvYmxvYi8zLjguNS9hcHAvYnVpbHRpbi9lbmdpbmUvc3RhdGljL2VuZ2luZS1jb21waWxlci9zb3VyY2UvaW5kZXgudHMjTDExNCDjgIJcclxuICAgICAgICAvLyDlkK/liqjlvJXmk47kuZ/miafooYzkuobmr4/kuKrlkI7nq6/nmoTku6PnoIHvvIzor6bop4HvvJpodHRwczovL2dpdGh1Yi5jb20vY29jb3MvY29jb3MtZWRpdG9yL2Jsb2IvMy44LjUvYXBwL2J1aWx0aW4vc2NlbmUvc291cmNlL3NjcmlwdC8zZC9tYW5hZ2VyL3N0YXJ0dXAvZW5naW5lL2luZGV4LnRzI0w5NyDjgIJcclxuICAgICAgICAvLyDpobnnm64gaW1wb3J0IOeahCBjYyDlnKjov5nph4zooqvliqDovb3vvJogaHR0cHM6Ly9naXRodWIuY29tL2NvY29zL2NvY29zLWVkaXRvci9ibG9iLzMuOC41L3BhY2thZ2VzL2xpYi1wcm9ncmFtbWluZy9zcmMvZXhlY3V0b3IvaW5kZXgudHMjTDM1NSBcclxuICAgICAgICAvLyDlhbbljIXlkKvnmoTlr7zlh7ogZmVhdHVyZXMg5piv5qC55o2uIF9nZXRFbmdpbmVGZWF0dXJlc1NoaXBwZWRJbkVkaXRvciDov5nkuKrlvZPliY3lh73mlbDov5Tlm57nmoQgZmVhdHVyZXMg5Yaz5a6a55qE44CC5Zug5q2k77yM5LiN5Lya5YyF5ZCrIGxvYWRXYXNtTW9kdWxlQm94MkTvvIwgbG9hZFdhc21Nb2R1bGVCdWxsZXTvvIwgbG9hZFdhc21Nb2R1bGVQaHlzWCDov5nlh6DkuKrlh73mlbDjgIJcclxuICAgICAgICAvLyDov5nkuKrpgLvovpHot5/mtY/op4jlmajpooTop4jjgIHmnoTlu7rlkI7nmoTov5DooYzml7bnjq/looPpg73mnInlt67lvILvvIzogIzkuJTmsqHmnInlv4XopoHvvIzmjpLpmaTov5nkupvmlrnms5Xlj6rkvJrlr7zoh7Tlt67lvILvvIzlubbkuI3og73luKbmnaXljIXkvZPjgIHmgKfog73mlrnpnaLnmoTmj5DljYfjgIJcclxuICAgICAgICByZXR1cm4gc3RhdHNRdWVyeS5nZXRGZWF0dXJlcygpO1xyXG5cclxuICAgICAgICAvLyBjb25zdCBlZGl0b3JGZWF0dXJlczogc3RyaW5nW10gPSBzdGF0c1F1ZXJ5LmdldEZlYXR1cmVzKCkuZmlsdGVyKChmZWF0dXJlTmFtZSkgPT4ge1xyXG4gICAgICAgIC8vICAgICByZXR1cm4gIVtcclxuICAgICAgICAvLyAgICAgICAgICdwaHlzaWNzLWFtbW8nLFxyXG4gICAgICAgIC8vICAgICAgICAgJ3BoeXNpY3MtYnVpbHRpbicsXHJcbiAgICAgICAgLy8gICAgICAgICAncGh5c2ljcy1jYW5ub24nLFxyXG4gICAgICAgIC8vICAgICAgICAgJ3BoeXNpY3MtcGh5c3gnLFxyXG4gICAgICAgIC8vICAgICAgICAgJ3BoeXNpY3MtMmQtYm94MmQnLFxyXG4gICAgICAgIC8vICAgICAgICAgJ3BoeXNpY3MtMmQtYnVpbHRpbicsXHJcbiAgICAgICAgLy8gICAgIF0uaW5jbHVkZXMoZmVhdHVyZU5hbWUpO1xyXG4gICAgICAgIC8vIH0pO1xyXG4gICAgICAgIC8vIHJldHVybiBlZGl0b3JGZWF0dXJlcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9zeW5jRW5naW5lRmVhdHVyZXMoZmVhdHVyZXM6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgdGhpcy5fbG9nZ2VyLmRlYnVnKGBTeW5jIGVuZ2luZSBmZWF0dXJlczogJHtmZWF0dXJlc31gKTtcclxuXHJcbiAgICAgICAgY29uc3QgZW5naW5lSW5kZXhNb2R1bGVTb3VyY2UgPSBQYWNrZXJEcml2ZXIuX2dldEVuZ2luZUluZGV4TW9kdWxlU291cmNlKHRoaXMuX3N0YXRzUXVlcnksIGZlYXR1cmVzKTtcclxuICAgICAgICBmb3IgKGNvbnN0IFssIHRhcmdldF0gb2YgT2JqZWN0LmVudHJpZXModGhpcy5fdGFyZ2V0cykpIHtcclxuICAgICAgICAgICAgaWYgKHRhcmdldC5yZXNwZWN0VG9FbmdpbmVGZWF0dXJlU2V0dGluZykge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGFyZ2V0LnNldEVuZ2luZUluZGV4TW9kdWxlU291cmNlKGVuZ2luZUluZGV4TW9kdWxlU291cmNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfZ2V0RW5naW5lSW5kZXhNb2R1bGVTb3VyY2Uoc3RhdHNRdWVyeTogU3RhdHNRdWVyeSwgZmVhdHVyZXM6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgY29uc3QgZmVhdHVyZVVuaXRzID0gc3RhdHNRdWVyeS5nZXRVbml0c09mRmVhdHVyZXMoZmVhdHVyZXMpO1xyXG4gICAgICAgIGNvbnN0IGVuZ2luZUluZGV4TW9kdWxlU291cmNlID0gc3RhdHNRdWVyeS5ldmFsdWF0ZUluZGV4TW9kdWxlU291cmNlKFxyXG4gICAgICAgICAgICBmZWF0dXJlVW5pdHMsXHJcbiAgICAgICAgICAgIChmZWF0dXJlVW5pdCkgPT4gYCR7ZmVhdHVyZVVuaXRNb2R1bGVQcmVmaXh9JHtmZWF0dXJlVW5pdH1gLFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgcmV0dXJuIGVuZ2luZUluZGV4TW9kdWxlU291cmNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5bCGIGRlcHNHcmFwaCDku44gZmlsZSDljY/orq7ovazmiJAgZGIg6Lev5b6E5Y2P6K6u44CCXHJcbiAgICAgKiDlubbkuJTov4fmu6TmjonkuIDkupvlpJbpg6jmqKHlnZfjgIJcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfdHJhbnNmb3JtRGVwc0dyYXBoKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fbmVlZFVwZGF0ZURlcHNDYWNoZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX25lZWRVcGRhdGVEZXBzQ2FjaGUgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBfZGVwc0dyYXBoOiBSZWNvcmQ8c3RyaW5nLCBTZXQ8c3RyaW5nPj4gPSB7fTtcclxuICAgICAgICBjb25zdCBfdXNlZEdyYXBoOiBSZWNvcmQ8c3RyaW5nLCBTZXQ8c3RyaW5nPj4gPSB7fTtcclxuICAgICAgICBmb3IgKGNvbnN0IFtzY3JpcHRGaWxlUGF0aCwgZGVwRmlsZVBhdGhzXSBvZiBPYmplY3QuZW50cmllcyh0aGlzLl9kZXBzR3JhcGgpKSB7XHJcbiAgICAgICAgICAgIGlmICghc2NyaXB0RmlsZVBhdGguc3RhcnRzV2l0aCgnZmlsZTovLycpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBzY3JpcHRQYXRoID0gZmlsZVVSTFRvUGF0aChzY3JpcHRGaWxlUGF0aCkucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xyXG4gICAgICAgICAgICBpZiAoIV9kZXBzR3JhcGhbc2NyaXB0UGF0aF0pIHtcclxuICAgICAgICAgICAgICAgIF9kZXBzR3JhcGhbc2NyaXB0UGF0aF0gPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChjb25zdCBwYXRoIG9mIGRlcEZpbGVQYXRocykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwYXRoLnN0YXJ0c1dpdGgoJ2ZpbGU6Ly8nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZGVwUGF0aCA9IGZpbGVVUkxUb1BhdGgocGF0aCkucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xyXG4gICAgICAgICAgICAgICAgX2RlcHNHcmFwaFtzY3JpcHRQYXRoXS5hZGQoZGVwUGF0aCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIV91c2VkR3JhcGhbZGVwUGF0aF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBfdXNlZEdyYXBoW2RlcFBhdGhdID0gbmV3IFNldCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgX3VzZWRHcmFwaFtkZXBQYXRoXS5hZGQoc2NyaXB0UGF0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdXNlZEdyYXBoQ2FjaGUgPSBfdXNlZEdyYXBoO1xyXG4gICAgICAgIHRoaXMuX2RlcHNHcmFwaENhY2hlID0gX2RlcHNHcmFwaDtcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgZW5naW5lSW5kZXhNb2RVUkwgPSAnY2NlOi9pbnRlcm5hbC94L2NjJztcclxuXHJcbnR5cGUgVGFyZ2V0TmFtZSA9IHN0cmluZztcclxuXHJcbnR5cGUgUHJlZGVmaW5lZFRhcmdldE5hbWUgPSAnZWRpdG9yJyB8ICdwcmV2aWV3JztcclxuXHJcbmNvbnN0IERFRkFVTFRfUFJFVklFV19CUk9XU0VSU19MSVNUX1RBUkdFVCA9ICdzdXBwb3J0cyBlczYtbW9kdWxlJztcclxuXHJcbmNvbnN0IHByZWRlZmluZWRUYXJnZXRzOiBSZWNvcmQ8UHJlZGVmaW5lZFRhcmdldE5hbWUsIFByZWRlZmluZWRUYXJnZXQ+ID0ge1xyXG4gICAgZWRpdG9yOiB7XHJcbiAgICAgICAgbmFtZTogJ0VkaXRvcicsXHJcbiAgICAgICAgYnJvd3NlcnNMaXN0VGFyZ2V0czogZWRpdG9yQnJvd3NlcnNsaXN0UXVlcnksXHJcbiAgICAgICAgc291cmNlTWFwczogJ2lubGluZScsXHJcbiAgICAgICAgaXNFZGl0b3I6IHRydWUsXHJcbiAgICB9LFxyXG4gICAgcHJldmlldzoge1xyXG4gICAgICAgIG5hbWU6ICdQcmV2aWV3JyxcclxuICAgICAgICBzb3VyY2VNYXBzOiB0cnVlLFxyXG4gICAgICAgIGJyb3dzZXJzTGlzdFRhcmdldHM6IERFRkFVTFRfUFJFVklFV19CUk9XU0VSU19MSVNUX1RBUkdFVCxcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZWFkQnJvd3NlcnNsaXN0VGFyZ2V0KGJyb3dzZXJzbGlzdHJjUGF0aDogc3RyaW5nKSB7XHJcbiAgICBsZXQgYnJvd3NlcnNsaXN0cmNTb3VyY2U6IHN0cmluZztcclxuICAgIHRyeSB7XHJcbiAgICAgICAgYnJvd3NlcnNsaXN0cmNTb3VyY2UgPSBhd2FpdCBmcy5yZWFkRmlsZShicm93c2Vyc2xpc3RyY1BhdGgsICd1dGY4Jyk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcXVlcmllcyA9IHBhcnNlQnJvd3NlcnNsaXN0UXVlcmllcyhicm93c2Vyc2xpc3RyY1NvdXJjZSk7XHJcbiAgICBpZiAocXVlcmllcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHF1ZXJpZXMuam9pbignIG9yICcpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHBhcnNlQnJvd3NlcnNsaXN0UXVlcmllcyhzb3VyY2U6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHF1ZXJpZXM6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIHNvdXJjZS5zcGxpdCgnXFxuJykpIHtcclxuICAgICAgICAgICAgY29uc3QgaVNoYXJwID0gbGluZS5pbmRleE9mKCcjJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGxpbmVUcmltbWVkID0gKGlTaGFycCA8IDAgPyBsaW5lIDogbGluZS5zdWJzdHIoMCwgaVNoYXJwKSkudHJpbSgpO1xyXG4gICAgICAgICAgICBpZiAobGluZVRyaW1tZWQubGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBxdWVyaWVzLnB1c2gobGluZVRyaW1tZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBxdWVyaWVzO1xyXG4gICAgfVxyXG59XHJcblxyXG5pbnRlcmZhY2UgUHJlZGVmaW5lZFRhcmdldCB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBicm93c2Vyc0xpc3RUYXJnZXRzPzogTW9kTG9PcHRpb25zWyd0YXJnZXRzJ107XHJcbiAgICBzb3VyY2VNYXBzPzogYm9vbGVhbiB8ICdpbmxpbmUnO1xyXG4gICAgaXNFZGl0b3I/OiBib29sZWFuO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgSW1wb3J0TWFwV2l0aFVSTCB7XHJcbiAgICBqc29uOiBJbXBvcnRNYXA7XHJcbiAgICB1cmw6IFVSTDtcclxufVxyXG5cclxuLy8g6ICD6JmR5Yiw6L+Z5piv5r2c5Zyo55qE5pS26LS554K577yM6buY6K6k5YWz6Zet5YWl5Y+j6ISa5pys55qE5LyY5YyW5Yqf6IO9XHJcbmNvbnN0IE9QVElNSVpFX0VOVFJZX1NPVVJDRV9DT01QSUxBVElPTiA9IGZhbHNlO1xyXG5cclxuY2xhc3MgUGFja1RhcmdldCB7XHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7XHJcbiAgICAgICAgbmFtZTogc3RyaW5nO1xyXG4gICAgICAgIG1vZExvOiBNb2RMbztcclxuICAgICAgICBzb3VyY2VNYXBzPzogYm9vbGVhbiB8ICdpbmxpbmUnO1xyXG4gICAgICAgIHF1aWNrUGFjazogUXVpY2tQYWNrO1xyXG4gICAgICAgIHF1aWNrUGFja0xvYWRlckNvbnRleHQ6IFF1aWNrUGFja0xvYWRlckNvbnRleHQ7XHJcbiAgICAgICAgbG9nZ2VyOiBMb2dnZXI7XHJcbiAgICAgICAgdGVudGF0aXZlUHJlcmVxdWlzaXRlSW1wb3J0c01vZDogYm9vbGVhbjtcclxuICAgICAgICBlbmdpbmVJbmRleE1vZHVsZToge1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogYCdjYydgIOaooeWdl+eahOWIneWni+WGheWuueOAglxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgc291cmNlOiBzdHJpbmc7XHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog6L+Z5Liq55uu5qCH55qE5piv5ZCm55CG5Lya55So5oi355qE5byV5pOO5Yqf6IO96K6+572u44CCXHJcbiAgICAgICAgICAgICAqIOWmguaenOaYr++8jGBzZXRFbmdpbmVJbmRleE1vZHVsZVNvdXJjZWAg5LiN5Lya6KKr6LCD55So44CCXHJcbiAgICAgICAgICAgICAqIOWQpuWIme+8jOW9k+e8lui+keWZqOeahOW8leaTjuWKn+iDveaUueWPmOaXtu+8jGBzZXRFbmdpbmVJbmRleE1vZHVsZVNvdXJjZWAg5Lya6KKr6LCD55So5Lul6YeN5paw6K6+572uIGAnY2MnYCDmqKHlnZfnmoTlhoXlrrnjgIJcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHJlc3BlY3RUb0ZlYXR1cmVTZXR0aW5nOiBib29sZWFuO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdXNlckltcG9ydE1hcD86IEltcG9ydE1hcFdpdGhVUkw7XHJcbiAgICB9KSB7XHJcbiAgICAgICAgdGhpcy5fbmFtZSA9IG9wdGlvbnMubmFtZTtcclxuICAgICAgICB0aGlzLl9tb2RMbyA9IG9wdGlvbnMubW9kTG87XHJcbiAgICAgICAgdGhpcy5fcXVpY2tQYWNrID0gb3B0aW9ucy5xdWlja1BhY2s7XHJcbiAgICAgICAgdGhpcy5fcXVpY2tQYWNrTG9hZGVyQ29udGV4dCA9IG9wdGlvbnMucXVpY2tQYWNrTG9hZGVyQ29udGV4dDtcclxuICAgICAgICB0aGlzLl9zb3VyY2VNYXBzID0gb3B0aW9ucy5zb3VyY2VNYXBzO1xyXG4gICAgICAgIHRoaXMuX2xvZ2dlciA9IG9wdGlvbnMubG9nZ2VyO1xyXG4gICAgICAgIHRoaXMuX3Jlc3BlY3RUb0ZlYXR1cmVTZXR0aW5nID0gb3B0aW9ucy5lbmdpbmVJbmRleE1vZHVsZS5yZXNwZWN0VG9GZWF0dXJlU2V0dGluZztcclxuICAgICAgICB0aGlzLl90ZW50YXRpdmVQcmVyZXF1aXNpdGVJbXBvcnRzTW9kID0gb3B0aW9ucy50ZW50YXRpdmVQcmVyZXF1aXNpdGVJbXBvcnRzTW9kO1xyXG4gICAgICAgIHRoaXMuX3VzZXJJbXBvcnRNYXAgPSBvcHRpb25zLnVzZXJJbXBvcnRNYXA7XHJcblxyXG4gICAgICAgIGNvbnN0IG1vZExvID0gdGhpcy5fbW9kTG87XHJcbiAgICAgICAgdGhpcy5fZW50cnlNb2QgPSBtb2RMby5hZGRNZW1vcnlNb2R1bGUocHJlcmVxdWlzaXRlSW1wb3J0c01vZFVSTCxcclxuICAgICAgICAgICAgKHRoaXMuX3RlbnRhdGl2ZVByZXJlcXVpc2l0ZUltcG9ydHNNb2QgPyBtYWtlVGVudGF0aXZlUHJlcmVxdWlzaXRlSW1wb3J0cyA6IG1ha2VQcmVyZXF1aXNpdGVJbXBvcnRzTW9kKShbXSkpO1xyXG4gICAgICAgIHRoaXMuX2VudHJ5TW9kU291cmNlID0gdGhpcy5fZW50cnlNb2Quc291cmNlO1xyXG5cclxuICAgICAgICB0aGlzLl9lbmdpbmVJbmRleE1vZCA9IG1vZExvLmFkZE1lbW9yeU1vZHVsZShlbmdpbmVJbmRleE1vZFVSTCwgb3B0aW9ucy5lbmdpbmVJbmRleE1vZHVsZS5zb3VyY2UpO1xyXG5cclxuICAgICAgICAvLyBJbiBjb25zdHJ1Y3RvciwgdGhlcmUncyBubyBidWlsZCBpbiBwcm9ncmVzcywgc28gd2UgY2FuIHNhZmVseSBjYWxsIHNldEFzc2V0RGF0YWJhc2VEb21haW5zXHJcbiAgICAgICAgLy8gd2l0aG91dCB3YWl0aW5nLiBXZSB1c2UgYSBzeW5jaHJvbm91cyBpbml0aWFsaXphdGlvbiBtZXRob2QuXHJcbiAgICAgICAgdGhpcy5fc2V0QXNzZXREYXRhYmFzZURvbWFpbnNTeW5jKFtdKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgcXVpY2tQYWNrTG9hZGVyQ29udGV4dCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcXVpY2tQYWNrTG9hZGVyQ29udGV4dDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgcmVhZHkoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlYWR5O1xyXG4gICAgfVxyXG5cclxuICAgIGdldCByZXNwZWN0VG9FbmdpbmVGZWF0dXJlU2V0dGluZygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVzcGVjdFRvRmVhdHVyZVNldHRpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZURiSW5mb3MoZGJJbmZvczogREJJbmZvW10pIHtcclxuICAgICAgICB0aGlzLl9kYkluZm9zID0gZGJJbmZvcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgYnVpbGQoKTogUHJvbWlzZTxCdWlsZFJlc3VsdD4ge1xyXG4gICAgICAgIC8vIOWmguaenOato+WcqOaehOW7uu+8jOi/lOWbnuWQjOS4gOS4qiBQcm9taXNl77yM6YG/5YWN5bm25Y+R5omn6KGMXHJcbiAgICAgICAgaWYgKHRoaXMuX2J1aWxkUHJvbWlzZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2dnZXIuZGVidWcoYFRhcmdldCgke3RoaXMuX25hbWV9KSBidWlsZCBhbHJlYWR5IGluIHByb2dyZXNzLCB3YWl0aW5nIGZvciBleGlzdGluZyBidWlsZC4uLmApO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYnVpbGRQcm9taXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5byA5aeL5paw55qE5p6E5bu6XHJcbiAgICAgICAgdGhpcy5fYnVpbGRTdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICBjb25zdCB0YXJnZXROYW1lID0gdGhpcy5fbmFtZTtcclxuXHJcbiAgICAgICAgLy8g5Yib5bu65p6E5bu6IFByb21pc2VcclxuICAgICAgICB0aGlzLl9idWlsZFByb21pc2UgPSB0aGlzLl9leGVjdXRlQnVpbGQodGFyZ2V0TmFtZSk7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2J1aWxkUHJvbWlzZTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICAvLyDmnoTlu7rlrozmiJDlkI7muIXpmaQgUHJvbWlzZe+8jOWFgeiuuOS4i+asoeaehOW7ulxyXG4gICAgICAgICAgICB0aGlzLl9idWlsZFByb21pc2UgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9leGVjdXRlQnVpbGQodGFyZ2V0TmFtZTogc3RyaW5nKTogUHJvbWlzZTxCdWlsZFJlc3VsdD4ge1xyXG4gICAgICAgIC8vIOWPkemAgeW8gOWni+e8luivkea2iOaBr1xyXG4gICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KCdwYWNrLWJ1aWxkLXN0YXJ0JywgdGFyZ2V0TmFtZSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2xvZ2dlci5kZWJ1ZyhgVGFyZ2V0KCR7dGFyZ2V0TmFtZX0pIGJ1aWxkIHN0YXJ0ZWQuYCk7XHJcblxyXG4gICAgICAgIGxldCBidWlsZFJlc3VsdDogQnVpbGRSZXN1bHQgPSB7fTtcclxuICAgICAgICBjb25zdCB0MSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGJ1aWxkUmVzdWx0ID0gYXdhaXQgdGhpcy5fYnVpbGQoKTtcclxuICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2dnZXIuZXJyb3IoYCR7ZXJyfSwgc3RhY2s6ICR7ZXJyLnN0YWNrfWApO1xyXG4gICAgICAgICAgICBidWlsZFJlc3VsdC5lcnIgPSBlcnI7XHJcbiAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgdGhpcy5fZmlyc3RCdWlsZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjb25zdCB0MiA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgICAgICB0aGlzLl9sb2dnZXIuZGVidWcoYFRhcmdldCgke3RhcmdldE5hbWV9KSBlbmRzIHdpdGggY29zdCAke3QyIC0gdDF9bXMuYCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9yZWFkeSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAvLyDlj5HpgIHnvJbor5HlrozmiJDmtojmga9cclxuICAgICAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQoJ3BhY2stYnVpbGQtZW5kJywgdGFyZ2V0TmFtZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9idWlsZFN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBidWlsZFJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBkZWxldGVDYWNoZUZpbGUoZmlsZVBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IG1vZHMgPSB0aGlzLl9wcmVyZXF1aXNpdGVBc3NldE1vZHM7XHJcbiAgICAgICAgaWYgKGZpbGVQYXRoICYmIG1vZHMuc2l6ZSkge1xyXG4gICAgICAgICAgICBtb2RzLmRlbGV0ZShmaWxlUGF0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2J1aWxkKCk6IFByb21pc2U8QnVpbGRSZXN1bHQ+IHtcclxuICAgICAgICBjb25zdCBwcmVyZXF1aXNpdGVBc3NldE1vZHMgPSBhd2FpdCB0aGlzLl9nZXRQcmVyZXF1aXNpdGVBc3NldE1vZHNXaXRoRmlsdGVyKCk7XHJcbiAgICAgICAgY29uc3QgYnVpbGRFbnRyaWVzID0gW1xyXG4gICAgICAgICAgICBlbmdpbmVJbmRleE1vZFVSTCxcclxuICAgICAgICAgICAgcHJlcmVxdWlzaXRlSW1wb3J0c01vZFVSTCxcclxuICAgICAgICAgICAgLi4ucHJlcmVxdWlzaXRlQXNzZXRNb2RzLFxyXG4gICAgICAgIF07XHJcbiAgICAgICAgY29uc3QgY2xlYW5SZXNvbHV0aW9uID0gdGhpcy5fY2xlYW5SZXNvbHV0aW9uTmV4dFRpbWU7XHJcbiAgICAgICAgaWYgKGNsZWFuUmVzb2x1dGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLl9jbGVhblJlc29sdXRpb25OZXh0VGltZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2xlYW5SZXNvbHV0aW9uKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ1RoaXMgYnVpbGQgd2lsbCBwZXJmb3JtIGEgY2xlYW4gbW9kdWxlIHJlc29sdXRpb24uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBidWlsZFJlc3VsdDogQnVpbGRSZXN1bHQgPSB7fTtcclxuICAgICAgICBhd2FpdCB3cmFwVG9TZXRJbW1lZGlhdGVRdWV1ZSh0aGlzLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIGJ1aWxkUmVzdWx0ID0gYXdhaXQgdGhpcy5fcXVpY2tQYWNrLmJ1aWxkKGJ1aWxkRW50cmllcywge1xyXG4gICAgICAgICAgICAgICAgcmV0cnlSZXNvbHV0aW9uT25VbmNoYW5nZWRNb2R1bGU6IHRoaXMuX2ZpcnN0QnVpbGQsXHJcbiAgICAgICAgICAgICAgICBjbGVhblJlc29sdXRpb246IGNsZWFuUmVzb2x1dGlvbixcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBidWlsZFJlc3VsdDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGNsZWFyQ2FjaGUoKSB7XHJcbiAgICAgICAgdGhpcy5fcXVpY2tQYWNrLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5fZmlyc3RCdWlsZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGFwcGx5QXNzZXRDaGFuZ2VzKGNoYW5nZXM6IHJlYWRvbmx5IEFzc2V0Q2hhbmdlW10pIHtcclxuICAgICAgICAvLyDlpoLmnpzmraPlnKjmnoTlu7rvvIznrYnlvoXmnoTlu7rlrozmiJBcclxuICAgICAgICBpZiAodGhpcy5fYnVpbGRQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZ2dlci5kZWJ1ZyhgVGFyZ2V0KCR7dGhpcy5fbmFtZX0pIGJ1aWxkIGluIHByb2dyZXNzLCB3YWl0aW5nIGJlZm9yZSBhcHBseWluZyBhc3NldCBjaGFuZ2VzLi4uYCk7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX2J1aWxkUHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZW5zdXJlSWRsZSgpO1xyXG4gICAgICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGNoYW5nZXMpIHtcclxuICAgICAgICAgICAgY29uc3QgdXVpZCA9IGNoYW5nZS51dWlkO1xyXG4gICAgICAgICAgICAvLyBOb3RlOiBcIm1vZGlmaWVkXCIgZGlyZWN0aXZlIGlzIGRlY29tcG9zZWQgYXMgXCJyZW1vdmVcIiBhbmQgXCJhZGRcIi5cclxuICAgICAgICAgICAgaWYgKGNoYW5nZS50eXBlID09PSBBc3NldEFjdGlvbkVudW0uY2hhbmdlIHx8XHJcbiAgICAgICAgICAgICAgICBjaGFuZ2UudHlwZSA9PT0gQXNzZXRBY3Rpb25FbnVtLmRlbGV0ZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkVVJMID0gdGhpcy5fdXVpZFVSTE1hcC5nZXQodXVpZCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW9sZFVSTCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEFzIG9mIG5vdywgd2UgcmVjZWl2ZSBhbiBhc3NldCBtb2RpZnlpbmcgb3IgY2hhbmdpbmcgZGlyZWN0aXZlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYnV0IHRoZSBhc3NldCB3YXMgbm90IHByb2Nlc3NlZCBieSB1cyBiZWZvcmUuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBob3dldmVyIGNhbiBvbmx5IGhhcHBlbiB3aGVuOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIC0gdGhlIGFzc2V0IGlzIHJlbW92ZWQsIGFuZCBpdCdzIGFuIHBsdWdpbiBzY3JpcHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gLSB0aGUgYXNzZXQgaXMgbW9kaWZpZWQgZnJvbSBwbHVnaW4gc2NyaXB0IHRvIG5vbi1wbHVnaW4tc2NyaXB0LlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgc29tZXRoaW5nIHdlbnQgd3JvbmcuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQnV0IHdlIGNvdWxkIG5vdCBkaXN0aW5ndWlzaCB0aGUgc2Vjb25kIHJlYXNvbiBmcm9tXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXCJyZWNlaXZlZCBhbiBlcnJvciBhc3NldCBjaGFuZ2UgZGlyZWN0aXZlXCJcclxuICAgICAgICAgICAgICAgICAgICAvLyBzaW5jZSB3ZSBkb24ndCBrbm93IHRoZSBhc3NldCdzIHByZXZpb3VzIHN0YXR1cy4gU28gd2UgY2hvb3NlIHRvIHNraXAgdGhpcyBjaGVjay5cclxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLl9sb2dnZXIud2FybihgVW5leHBlY3RlZDogJHt1dWlkfSBpcyBub3QgaW4gcmVnaXN0cnkuYCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3V1aWRVUkxNYXAuZGVsZXRlKHV1aWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21vZExvLnVuc2V0VVVJRChvbGRVUkwpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlbGV0ZWQgPSB0aGlzLl9wcmVyZXF1aXNpdGVBc3NldE1vZHMuZGVsZXRlKG9sZFVSTCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkZWxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvZ2dlci53YXJuKGBVbmV4cGVjdGVkOiAke29sZFVSTH0gaXMgbm90IGluIHJlZ2lzdHJ5LmApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2hhbmdlLnR5cGUgPT09IEFzc2V0QWN0aW9uRW51bS5jaGFuZ2UgfHxcclxuICAgICAgICAgICAgICAgIGNoYW5nZS50eXBlID09PSBBc3NldEFjdGlvbkVudW0uYWRkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hhbmdlLmlzUGx1Z2luU2NyaXB0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7IGhyZWY6IHVybCB9ID0gY2hhbmdlLnVybDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3V1aWRVUkxNYXAuc2V0KHV1aWQsIHVybCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tb2RMby5zZXRVVUlEKHVybCwgdXVpZCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmVyZXF1aXNpdGVBc3NldE1vZHMuYWRkKHVybCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgaW1wb3J0IG1haW4gbW9kdWxlXHJcbiAgICAgICAgY29uc3QgcHJlcmVxdWlzaXRlSW1wb3J0cyA9IGF3YWl0IHRoaXMuX2dldFByZXJlcXVpc2l0ZUFzc2V0TW9kc1dpdGhGaWx0ZXIoKTtcclxuICAgICAgICBjb25zdCBzb3VyY2UgPSAodGhpcy5fdGVudGF0aXZlUHJlcmVxdWlzaXRlSW1wb3J0c01vZCA/IG1ha2VUZW50YXRpdmVQcmVyZXF1aXNpdGVJbXBvcnRzIDogbWFrZVByZXJlcXVpc2l0ZUltcG9ydHNNb2QpKHByZXJlcXVpc2l0ZUltcG9ydHMpO1xyXG5cclxuICAgICAgICBjb25zb2xlLnRpbWUoJ3VwZGF0ZSBlbnRyeSBtb2QnKTtcclxuICAgICAgICBpZiAoT1BUSU1JWkVfRU5UUllfU09VUkNFX0NPTVBJTEFUSU9OKSB7XHJcbiAgICAgICAgICAgIC8vIOazqOaEj++8mi5zb3VyY2Ug5piv5LiA5LiqIHNldHRlcu+8jOWFtuWGhemDqOS8muabtOaWsCB0aW1lc3RhbXDvvIzlr7zoh7Tmr4/mrKHpg73ph43mlrDnvJbor5HlhaXlj6Pmlofku7bvvIzlpoLmnpzpobnnm67mr5TovoPlpKfvvIzlhaXlj6Pmlofku7bnmoTnvJbor5HkvJrpnZ7luLjogJfml7bjgIJcclxuICAgICAgICAgICAgLy8g6L+Z6YeM5LyY5YyW77yM5Y+q5pyJ5Zyo5pyJ5beu5byC55qE5oOF5Ya15LiL5omN5Y675pu05pawIHNvdXJjZVxyXG4gICAgICAgICAgICBpZiAodGhpcy5fZW50cnlNb2RTb3VyY2UubGVuZ3RoICE9PSBzb3VyY2UubGVuZ3RoIHx8IHRoaXMuX2VudHJ5TW9kU291cmNlICE9PSBzb3VyY2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2VudHJ5TW9kU291cmNlID0gdGhpcy5fZW50cnlNb2Quc291cmNlID0gc291cmNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8g5pen55qE6YC76L6R5piv5q+P5qyh5Lu75oSP6ISa5pys5Y+Y5YyW77yM6YO96YeN5paw6K6+572u5YWl5Y+jIHNvdXJjZe+8jOWvueWkp+mhueebruW9seWTjeavlOi+g+Wkp1xyXG4gICAgICAgICAgICB0aGlzLl9lbnRyeU1vZFNvdXJjZSA9IHRoaXMuX2VudHJ5TW9kLnNvdXJjZSA9IHNvdXJjZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS50aW1lRW5kKCd1cGRhdGUgZW50cnkgbW9kJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIHNldEVuZ2luZUluZGV4TW9kdWxlU291cmNlKHNvdXJjZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgLy8g5aaC5p6c5q2j5Zyo5p6E5bu677yM562J5b6F5p6E5bu65a6M5oiQXHJcbiAgICAgICAgaWYgKHRoaXMuX2J1aWxkUHJvbWlzZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2dnZXIuZGVidWcoYFRhcmdldCgke3RoaXMuX25hbWV9KSBidWlsZCBpbiBwcm9ncmVzcywgd2FpdGluZyBiZWZvcmUgc2V0dGluZyBlbmdpbmUgaW5kZXggbW9kdWxlIHNvdXJjZS4uLmApO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9idWlsZFByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2Vuc3VyZUlkbGUoKTtcclxuICAgICAgICB0aGlzLl9lbmdpbmVJbmRleE1vZC5zb3VyY2UgPSBzb3VyY2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIHNldEFzc2V0RGF0YWJhc2VEb21haW5zKGFzc2V0RGF0YWJhc2VEb21haW5zOiBBc3NldERhdGFiYXNlRG9tYWluW10pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAvLyDlpoLmnpzmraPlnKjmnoTlu7rvvIznrYnlvoXmnoTlu7rlrozmiJBcclxuICAgICAgICBpZiAodGhpcy5fYnVpbGRQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZ2dlci5kZWJ1ZyhgVGFyZ2V0KCR7dGhpcy5fbmFtZX0pIGJ1aWxkIGluIHByb2dyZXNzLCB3YWl0aW5nIGJlZm9yZSBzZXR0aW5nIGFzc2V0IGRhdGFiYXNlIGRvbWFpbnMuLi5gKTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5fYnVpbGRQcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9lbnN1cmVJZGxlKCk7XHJcbiAgICAgICAgdGhpcy5fc2V0QXNzZXREYXRhYmFzZURvbWFpbnNTeW5jKGFzc2V0RGF0YWJhc2VEb21haW5zKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9zZXRBc3NldERhdGFiYXNlRG9tYWluc1N5bmMoYXNzZXREYXRhYmFzZURvbWFpbnM6IEFzc2V0RGF0YWJhc2VEb21haW5bXSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHsgX3VzZXJJbXBvcnRNYXA6IHVzZXJJbXBvcnRNYXAgfSA9IHRoaXM7XHJcblxyXG4gICAgICAgIGNvbnN0IGltcG9ydE1hcDogSW1wb3J0TWFwID0ge307XHJcbiAgICAgICAgY29uc3QgaW1wb3J0TWFwVVJMID0gdXNlckltcG9ydE1hcCA/IHVzZXJJbXBvcnRNYXAudXJsIDogbmV3IFVSTCgnZm9vOi9iYXInKTtcclxuXHJcbiAgICAgICAgLy8gSW50ZWdyYXRlcyBidWlsdGluIG1hcHBpbmdzLCBzaW5jZSBhbGwgb2YgYnVpbHRpbiBtYXBwaW5ncyBhcmUgYWJzb2x1dGUsIHdlIGRvIG5vdCBuZWVkIHBhcnNlLlxyXG4gICAgICAgIGltcG9ydE1hcC5pbXBvcnRzID0ge307XHJcbiAgICAgICAgaW1wb3J0TWFwLmltcG9ydHNbJ2NjJ10gPSBlbmdpbmVJbmRleE1vZFVSTDtcclxuICAgICAgICBjb25zdCBhc3NldFByZWZpeGVzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIGZvciAoY29uc3QgYXNzZXREYXRhYmFzZURvbWFpbiBvZiBhc3NldERhdGFiYXNlRG9tYWlucykge1xyXG4gICAgICAgICAgICBjb25zdCBhc3NldERpclVSTCA9IHBhdGhUb0ZpbGVVUkwocHMuam9pbihhc3NldERhdGFiYXNlRG9tYWluLnBoeXNpY2FsLCBwcy5qb2luKHBzLnNlcCkpKS5ocmVmO1xyXG4gICAgICAgICAgICBpbXBvcnRNYXAuaW1wb3J0c1thc3NldERhdGFiYXNlRG9tYWluLnJvb3QuaHJlZl0gPSBhc3NldERpclVSTDtcclxuICAgICAgICAgICAgYXNzZXRQcmVmaXhlcy5wdXNoKGFzc2V0RGlyVVJMKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh1c2VySW1wb3J0TWFwKSB7XHJcbiAgICAgICAgICAgIGlmICh1c2VySW1wb3J0TWFwLmpzb24uaW1wb3J0cykge1xyXG4gICAgICAgICAgICAgICAgaW1wb3J0TWFwLmltcG9ydHMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uaW1wb3J0TWFwLmltcG9ydHMsXHJcbiAgICAgICAgICAgICAgICAgICAgLi4udXNlckltcG9ydE1hcC5qc29uLmltcG9ydHMsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh1c2VySW1wb3J0TWFwLmpzb24uc2NvcGVzKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtzY29wZVJlcCwgc3BlY2lmaWVyTWFwXSBvZiBPYmplY3QuZW50cmllcyh1c2VySW1wb3J0TWFwLmpzb24uc2NvcGVzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNjb3BlcyA9IGltcG9ydE1hcC5zY29wZXMgPz89IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3Blc1tzY29wZVJlcF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLihzY29wZXNbc2NvcGVSZXBdID8/IHt9KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3BlY2lmaWVyTWFwLFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2xvZ2dlci5kZWJ1ZyhcclxuICAgICAgICAgICAgYE91ciBpbXBvcnQgbWFwKCR7aW1wb3J0TWFwVVJMfSk6ICR7SlNPTi5zdHJpbmdpZnkoaW1wb3J0TWFwLCB1bmRlZmluZWQsIDIpfWAsXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbW9kTG8uc2V0SW1wb3J0TWFwKGltcG9ydE1hcCwgaW1wb3J0TWFwVVJMKTtcclxuICAgICAgICB0aGlzLl9tb2RMby5zZXRBc3NldFByZWZpeGVzKGFzc2V0UHJlZml4ZXMpO1xyXG5cclxuICAgICAgICB0aGlzLl9jbGVhblJlc29sdXRpb25OZXh0VGltZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZGJJbmZvczogREJJbmZvW10gPSBbXTtcclxuICAgIHByaXZhdGUgX2J1aWxkU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfYnVpbGRQcm9taXNlOiBQcm9taXNlPEJ1aWxkUmVzdWx0PiB8IG51bGwgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBfcmVhZHkgPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX25hbWU6IHN0cmluZztcclxuICAgIHByaXZhdGUgX2VuZ2luZUluZGV4TW9kOiBNZW1vcnlNb2R1bGU7XHJcbiAgICBwcml2YXRlIF9lbnRyeU1vZDogTWVtb3J5TW9kdWxlO1xyXG4gICAgcHJpdmF0ZSBfZW50cnlNb2RTb3VyY2UgPSAnJztcclxuICAgIHByaXZhdGUgX21vZExvOiBNb2RMbztcclxuICAgIHByaXZhdGUgX3NvdXJjZU1hcHM/OiBib29sZWFuIHwgJ2lubGluZSc7XHJcbiAgICBwcml2YXRlIF9xdWlja1BhY2s6IFF1aWNrUGFjaztcclxuICAgIHByaXZhdGUgX3F1aWNrUGFja0xvYWRlckNvbnRleHQ6IFF1aWNrUGFja0xvYWRlckNvbnRleHQ7XHJcbiAgICBwcml2YXRlIF9wcmVyZXF1aXNpdGVBc3NldE1vZHM6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpO1xyXG4gICAgcHJpdmF0ZSBfdXVpZFVSTE1hcDogTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoKTtcclxuICAgIHByaXZhdGUgX2xvZ2dlcjogTG9nZ2VyO1xyXG4gICAgcHJpdmF0ZSBfZmlyc3RCdWlsZCA9IHRydWU7XHJcbiAgICBwcml2YXRlIF9jbGVhblJlc29sdXRpb25OZXh0VGltZSA9IHRydWU7XHJcbiAgICBwcml2YXRlIF9yZXNwZWN0VG9GZWF0dXJlU2V0dGluZzogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgX3RlbnRhdGl2ZVByZXJlcXVpc2l0ZUltcG9ydHNNb2Q6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIF91c2VySW1wb3J0TWFwOiBJbXBvcnRNYXBXaXRoVVJMIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2dldFByZXJlcXVpc2l0ZUFzc2V0TW9kc1dpdGhGaWx0ZXIoKSB7XHJcbiAgICAgICAgY29uc3QgcHJlcmVxdWlzaXRlQXNzZXRNb2RzID0gQXJyYXkuZnJvbSh0aGlzLl9wcmVyZXF1aXNpdGVBc3NldE1vZHMpLnNvcnQoKTtcclxuICAgICAgICByZXR1cm4gcHJlcmVxdWlzaXRlQXNzZXRNb2RzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2Vuc3VyZUlkbGUoKSB7XHJcbiAgICAgICAgYXNzZXJ0cyghdGhpcy5fYnVpbGRTdGFydGVkLCAnQnVpbGQgaXMgaW4gcHJvZ3Jlc3MsIGJ1dCBhIHN0YXR1cyBjaGFuZ2UgcmVxdWVzdCBpcyBmaWxlZCcpO1xyXG4gICAgfVxyXG59XHJcblxyXG5pbnRlcmZhY2UgSW5jcmVtZW50YWxSZWNvcmQge1xyXG4gICAgdmVyc2lvbjogc3RyaW5nO1xyXG4gICAgY29uZmlnOiB7XHJcbiAgICAgICAgcHJldmlld1RhcmdldD86IHN0cmluZztcclxuICAgIH0gJiBTaGFyZWRTZXR0aW5ncztcclxufVxyXG5cclxuZnVuY3Rpb24gbWF0Y2hPYmplY3QobGhzOiB1bmtub3duLCByaHM6IHVua25vd24pIHtcclxuICAgIHJldHVybiBtYXRjaExocyhsaHMsIHJocyk7XHJcblxyXG4gICAgZnVuY3Rpb24gbWF0Y2hMaHMobGhzOiB1bmtub3duLCByaHM6IHVua25vd24pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShsaHMpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHJocykgJiYgbGhzLmxlbmd0aCA9PT0gcmhzLmxlbmd0aCAmJlxyXG4gICAgICAgICAgICAgICAgbGhzLmV2ZXJ5KCh2LCBpKSA9PiBtYXRjaExocyh2LCByaHNbaV0pKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBsaHMgPT09ICdvYmplY3QnICYmIGxocyAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHJocyA9PT0gJ29iamVjdCdcclxuICAgICAgICAgICAgICAgICYmIHJocyAhPT0gbnVsbFxyXG4gICAgICAgICAgICAgICAgJiYgT2JqZWN0LmtleXMobGhzKS5ldmVyeSgoa2V5KSA9PiBtYXRjaExocygobGhzIGFzIGFueSlba2V5XSwgKHJocyBhcyBhbnkpW2tleV0pKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGxocyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmhzID09PSBudWxsO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBsaHMgPT09IHJocztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19