'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSeparateEngine = buildSeparateEngine;
exports.buildCocos = buildCocos;
/**
 * 此文件需要在独立 node 进程里可调用，不可使用 Editor/Electron 接口
 * 引擎分离编译后，默认会生成一份包含全部引擎散文件的目录结构，默认名称为 all
 * 如果指定了 pluginFeatures 则会为其 pick 出一份插件目录
 */
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const crypto_1 = require("crypto");
const ccbuild_1 = require("@cocos/ccbuild");
const utils_1 = require("../../utils");
class EngineCachePaths {
    dir;
    all;
    plugin;
    meta;
    signatureJSON;
    pluginJSON;
    constructor(dir, pluginName) {
        this.dir = dir;
        this.all = (0, path_1.join)(dir, 'all');
        this.plugin = (0, path_1.join)(dir, pluginName);
        this.meta = (0, path_1.join)(dir, 'meta.json');
        this.signatureJSON = (0, path_1.join)(this.plugin, 'signature.json');
        this.pluginJSON = (0, path_1.join)(this.plugin, 'plugin.json');
    }
    toJSON() {
        return {
            dir: this.dir,
            all: this.all,
            plugin: this.plugin,
            meta: this.meta,
            signatureJSON: this.signatureJSON,
            pluginJSON: this.pluginJSON,
        };
    }
}
function extractMacros(expression) {
    return expression.split('||').map(match => match.trim().substring(1));
}
function intiEngineFeatures(engineDir) {
    const modulesInfo = require((0, path_1.join)(engineDir, 'editor', 'engine-features', 'render-config.json'));
    const pluginFeatures = [];
    const envLimitModule = {};
    const stepModule = (moduleKey, moduleItem) => {
        if (moduleItem.envCondition) {
            envLimitModule[moduleKey] = {
                envList: extractMacros(moduleItem.envCondition),
                fallback: moduleItem.fallback,
            };
        }
        if (moduleItem.enginePlugin) {
            pluginFeatures.push(moduleKey);
        }
    };
    function addModuleOrGroup(moduleKey, moduleItem) {
        if ('options' in moduleItem) {
            Object.entries(moduleItem.options).forEach(([optionKey, optionItem]) => {
                stepModule(optionKey, optionItem);
            });
        }
        else {
            stepModule(moduleKey, moduleItem);
        }
    }
    Object.entries(modulesInfo.features).forEach(([moduleKey, moduleItem]) => {
        addModuleOrGroup(moduleKey, moduleItem);
    });
    return {
        envLimitModule,
        pluginFeatures,
    };
}
class EngineFeatureQuery {
    all = [];
    allUnit = [];
    plugin = [];
    pluginUnit = [];
    engineStatsQuery;
    envLimitModule = {};
    _defaultPlugins;
    // 分离引擎插件目前只支持选中一个 Spine 版本，兼容性考虑，排除掉 spine-4.2
    _excludeFeatures = ['spine-4.2'];
    env;
    /**
     * please use EngineFeatureQuery.create instead
     * @param options
     */
    constructor(options) {
        this.env = {
            mode: 'BUILD',
            platform: options.platformType,
            flags: {
                SERVER_MODE: false,
                DEBUG: false,
                WASM_SUBPACKAGE: false,
            },
        };
        const res = intiEngineFeatures(options.engine);
        this.envLimitModule = res.envLimitModule;
        this._defaultPlugins = res.pluginFeatures;
    }
    static async create(options) {
        const engineFeatureQuery = new EngineFeatureQuery(options);
        await engineFeatureQuery._init(options);
        return engineFeatureQuery;
    }
    async _init(options) {
        this.engineStatsQuery = await ccbuild_1.StatsQuery.create(options.engine);
        const features = this.filterEngineModules(this.engineStatsQuery.getFeatures());
        this.all = features.filter((feature) => !this._excludeFeatures.includes(feature));
        this.allUnit = this.engineStatsQuery.getUnitsOfFeatures(this.all);
        switch (options.pluginFeatures) {
            case 'default':
                this.plugin = this.filterEngineModules(this._defaultPlugins);
                this.pluginUnit = this.engineStatsQuery.getUnitsOfFeatures(this.plugin);
                break;
            case 'all':
            default:
                this.plugin = this.all;
                this.pluginUnit = this.allUnit;
                break;
        }
    }
    /**
     * 过滤模块
     * @param includeModules 原始模块列表
     * @returns 返回对象，包含需要回退的模块映射和过滤后的包含模块列表
     */
    filterEngineModules(features) {
        const ccEnvConstants = this.engineStatsQuery.constantManager.genCCEnvConstants(this.env);
        const moduleToFallBack = {};
        Object.keys(this.envLimitModule).forEach((moduleId) => {
            if (!features.includes(moduleId)) {
                return;
            }
            const { envList, fallback } = this.envLimitModule[moduleId];
            const enable = envList.some((env) => ccEnvConstants[env]);
            if (enable) {
                return;
            }
            moduleToFallBack[moduleId] = fallback || '';
            if (fallback) {
                features.splice(features.indexOf(moduleId), 1, fallback);
            }
            else {
                features.splice(features.indexOf(moduleId), 1);
            }
        });
        return features;
    }
    getUnitsOfFeatures(features) {
        return this.engineStatsQuery.getUnitsOfFeatures(features);
    }
}
// 引擎插件模块生成器
class EngineFeatureUnitGenerator {
    metaInfo;
    importMap = {};
    engineCachePaths;
    engineFeatureQuery;
    options;
    constructor(options, metaInfo, engineCachePaths, engineFeatureQuery) {
        this.metaInfo = metaInfo;
        this.engineCachePaths = engineCachePaths;
        this.engineFeatureQuery = engineFeatureQuery;
        this.options = options;
    }
    static async create(options) {
        // 1. 获取引擎插件模块列表
        const engineFeatureQuery = await EngineFeatureQuery.create({
            platformType: options.platformType,
            engine: options.engine,
            pluginFeatures: options.pluginFeatures,
        });
        // 2. 传递参数以及计算过的 pluginFeatures 用于生成引擎插件缓存
        const engineCachePaths = await buildCocos({
            ...options,
            engineFeatureQuery,
        });
        const metaInfo = (0, fs_extra_1.readJSONSync)(engineCachePaths.meta);
        return new EngineFeatureUnitGenerator(options, metaInfo, engineCachePaths, engineFeatureQuery);
    }
    isAliasedChunk(chunk) {
        return chunk in this.metaInfo.chunkAliases;
    }
    getFileName(file) {
        return this.metaInfo.chunkAliases[file] ?? file;
    }
    addChunkToPlugin = (chunk) => {
        const fileName = this.getFileName(chunk);
        const chunkSpecifier = this.isAliasedChunk(chunk)
            ? chunk
            : `../${(0, path_1.basename)(this.options.output)}/${fileName}`;
        const importURL = `plugin:${this.options.pluginName}/${fileName}`;
        this.importMap[chunkSpecifier] = importURL;
    };
    addToLocal(file) {
        const fileName = this.getFileName(file);
        const target = (0, path_1.join)(this.options.output, fileName);
        (0, fs_extra_1.ensureDirSync)((0, path_1.dirname)(target));
        (0, fs_extra_1.copyFileSync)((0, path_1.join)(this.engineCachePaths.all, fileName), target);
        if (this.isAliasedChunk(file)) {
            this.importMap[file] = `../${(0, path_1.basename)(this.options.output)}/${fileName}`;
        }
    }
    async run() {
        const { options, engineFeatureQuery, engineCachePaths } = this;
        // 3. 计算 cc.js 需要存放的模块索引信息，includeModules 并非代表所有用户选择的模块信息需要使用 getUnitsOfFeatures 计算
        const includeModules = options.includeModules;
        const allUnits = engineFeatureQuery.getUnitsOfFeatures(includeModules);
        const localFeatureUnits = allUnits.filter((item) => !engineFeatureQuery.pluginUnit.includes(item));
        const metaInfo = (0, fs_extra_1.readJSONSync)(engineCachePaths.meta);
        const localPluginFeatureUnits = allUnits.filter((item) => engineFeatureQuery.pluginUnit.includes(item));
        const ccModuleFile = (0, path_1.join)(options.output, 'cc.js');
        const featureUnitNameMapper = (featureUnit) => {
            // 优先使用引擎插件的模块，减小本地包体
            if (this.engineFeatureQuery.pluginUnit.includes(featureUnit)) {
                return `plugin:${this.options.pluginName}/${featureUnit}.js`;
            }
            return `./${featureUnit}.js`;
        };
        const ccModuleSource = await ccbuild_1.buildEngine.transform(engineFeatureQuery.engineStatsQuery.evaluateIndexModuleSource(allUnits, featureUnitNameMapper), 'system');
        await (0, fs_extra_1.outputFile)(ccModuleFile, ccModuleSource.code, 'utf8');
        const localChunks = ccbuild_1.buildEngine.enumerateDependentChunks(metaInfo, localFeatureUnits);
        const pluginChunks = ccbuild_1.buildEngine.enumerateDependentChunks(metaInfo, engineFeatureQuery.pluginUnit);
        // NOTE：游戏包内有使用到的插件模块和本地模块依赖的 asset，都要放到本地包内
        const assets = ccbuild_1.buildEngine.enumerateDependentAssets(metaInfo, localFeatureUnits).concat(ccbuild_1.buildEngine.enumerateDependentAssets(metaInfo, localPluginFeatureUnits));
        localChunks.forEach((chunk) => {
            if (pluginChunks.includes(chunk)) {
                this.addChunkToPlugin(chunk);
            }
            else {
                this.addToLocal(chunk);
            }
        });
        assets.forEach((asset) => {
            this.addToLocal(asset);
        });
        this.importMap['cc'] = `./${relativeUrl((0, path_1.dirname)(options.importMapOutFile), options.output)}/cc.js`;
        if (options.outputLocalPlugin) {
            const localPluginChunks = ccbuild_1.buildEngine.enumerateDependentChunks(metaInfo, localPluginFeatureUnits);
            // 生成本地需要的插件文件夹到输出目录
            await this.generateLocalPlugin(localPluginChunks);
        }
    }
    async generateLocalPlugin(featureFiles) {
        const cocosDest = (0, path_1.join)((0, path_1.dirname)(this.options.output), this.options.pluginName);
        return EngineFeatureUnitGenerator.generatePlugins(this.engineCachePaths, featureFiles, cocosDest, this.options.signatureProvider);
    }
    static async generatePlugins(enginePaths, featureFiles, dist, signatureProvider) {
        if (!featureFiles.length) {
            return [];
        }
        const metaInfo = (0, fs_extra_1.readJSONSync)(enginePaths.meta);
        (0, fs_extra_1.ensureDirSync)(dist);
        let updateMeta = false;
        const signature = [];
        await Promise.all(featureFiles.map(async (file, i) => {
            const src = (0, path_1.join)(enginePaths.all, file);
            const dest = (0, path_1.join)(dist, file);
            if (!metaInfo.md5Map[file]) {
                console.debug(`patch md5 for ${file}`);
                metaInfo.md5Map[file] = await calcCodeMd5(src);
                updateMeta = true;
            }
            signature.push({
                md5: metaInfo.md5Map[file],
                path: file,
            });
            (0, fs_extra_1.ensureDirSync)((0, path_1.dirname)(dest));
            // 注意，单独拷贝文件可以，如果是从安装包内拷贝文件夹会有权限问题
            (0, fs_extra_1.copyFileSync)(src, dest);
        }));
        signatureProvider && await (0, fs_extra_1.outputJSON)((0, path_1.join)(dist, (0, path_1.basename)(enginePaths.signatureJSON)), {
            provider: signatureProvider,
            signature,
        });
        await (0, fs_extra_1.outputJSON)((0, path_1.join)(dist, (0, path_1.basename)(enginePaths.pluginJSON)), {
            main: 'base.js',
        });
        // 更新 metaInfo 数据
        updateMeta && await (0, fs_extra_1.writeJSONSync)(enginePaths.meta, metaInfo, { spaces: 2 });
        return signature;
    }
}
/**
 * 根据选项编译分离引擎，并返回 importMap 信息
 * @param options
 */
async function buildSeparateEngine(options) {
    const engineFeatureGenerator = await EngineFeatureUnitGenerator.create(options);
    await engineFeatureGenerator.run();
    return {
        importMap: engineFeatureGenerator.importMap,
        paths: engineFeatureGenerator.engineCachePaths,
    };
}
/**
 * 编译引擎分离插件到缓存目录下(命令行会调用)
 */
async function buildCocos(options) {
    const outDir = (0, path_1.join)(options.engine, `bin/.cache/editor-cache/${options.platform}`);
    const enginePaths = new EngineCachePaths(outDir, options.pluginName);
    if (options.useCacheForce && (0, fs_extra_1.existsSync)(enginePaths.plugin)) {
        // 目前暂未检查完整的缓存是否有效
        return enginePaths;
    }
    options.engineFeatureQuery = options.engineFeatureQuery || await EngineFeatureQuery.create({
        platformType: options.platformType,
        engine: options.engine,
        pluginFeatures: options.pluginFeatures,
    });
    const { engineFeatureQuery } = options;
    // @ts-ignore 目前编译引擎接口里的 flags 定义无法互相使用，实际上是同一份数据
    const buildOptions = {
        engine: options.engine,
        out: enginePaths.all,
        moduleFormat: 'system',
        compress: true,
        split: true,
        nativeCodeBundleMode: options.nativeCodeBundleMode,
        features: engineFeatureQuery.all,
        inlineEnum: false, // 分离引擎插件先不开启内联枚举功能，等 v3.8.5 后续版本验证稳定后再考虑开启
        ...engineFeatureQuery.env,
        // platform: engineFeatureQuery.env.platform,
        // mode: engineFeatureQuery.env.mode,
        // flags: engineFeatureQuery.env.flags,
    };
    const cacheOptionsPath = (0, path_1.join)(outDir, 'options.json');
    if ((0, fs_extra_1.existsSync)(cacheOptionsPath)) {
        const cacheOptions = (0, fs_extra_1.readJSONSync)(cacheOptionsPath);
        if ((0, utils_1.compareOptions)(cacheOptions, buildOptions)) {
            console.log(`use cache engine in ${enginePaths.dir}`);
            return enginePaths;
        }
    }
    else {
        console.log(`Can not find options cache in ${cacheOptionsPath}`);
    }
    (0, fs_extra_1.emptyDirSync)(outDir);
    // 立马缓存构建选项，否则可能会被后续流程修改
    const buildOptionsCache = JSON.parse(JSON.stringify(buildOptions));
    const buildResult = await (0, ccbuild_1.buildEngine)(buildOptions);
    const md5Map = {};
    // 计算引擎 md5 值
    await Promise.all(Object.keys(buildResult.exports).map(async (key) => {
        const dest = (0, path_1.join)(enginePaths.all, buildResult.exports[key]);
        const md5 = calcCodeMd5(dest);
        md5Map[buildResult.exports[key]] = md5;
    }));
    // 缓存一下引擎提供的模块映射
    await (0, fs_extra_1.writeJSONSync)(enginePaths.meta, Object.assign(buildResult, { md5Map }), { spaces: 2 });
    // 整理出可供上传的引擎插件内容
    if (engineFeatureQuery.plugin.length) {
        const featureUnits = engineFeatureQuery.getUnitsOfFeatures(engineFeatureQuery.plugin);
        // NOTE: 插件里只能放 chunks，不能放 assets
        const featureFiles = ccbuild_1.buildEngine.enumerateDependentChunks(buildResult, featureUnits);
        await generatePlugins(enginePaths, featureFiles, enginePaths.plugin, options.signatureProvider);
    }
    // 最后再生成选项缓存文件，避免引擎文件生成时中断后文件不完整导致后续步骤无法运行
    await (0, fs_extra_1.outputJSON)(cacheOptionsPath, buildOptionsCache, { spaces: 4 });
    return enginePaths;
}
function relativeUrl(from, to) {
    return (0, path_1.relative)(from, to).replace(/\\/g, '/');
}
/**
 * 摘选生成引擎插件包
 * @param enginePaths
 * @param featureFiles
 * @param dist
 * @returns
 */
async function generatePlugins(enginePaths, featureFiles, dist, signatureProvider) {
    if (!featureFiles.length) {
        return [];
    }
    const metaInfo = (0, fs_extra_1.readJSONSync)(enginePaths.meta);
    (0, fs_extra_1.ensureDirSync)(dist);
    let updateMeta = false;
    const signature = [];
    await Promise.all(featureFiles.map(async (file, i) => {
        const src = (0, path_1.join)(enginePaths.all, file);
        const dest = (0, path_1.join)(dist, file);
        if (!metaInfo.md5Map[file]) {
            console.debug(`patch md5 for ${file}`);
            metaInfo.md5Map[file] = await calcCodeMd5(src);
            updateMeta = true;
        }
        signature.push({
            md5: metaInfo.md5Map[file],
            path: file,
        });
        (0, fs_extra_1.ensureDirSync)((0, path_1.dirname)(dest));
        // 注意，单独拷贝文件可以，如果是从安装包内拷贝文件夹会有权限问题
        (0, fs_extra_1.copyFileSync)(src, dest);
    }));
    signatureProvider && await (0, fs_extra_1.outputJSON)(enginePaths.signatureJSON, {
        provider: signatureProvider,
        signature,
    });
    await (0, fs_extra_1.outputJSON)(enginePaths.pluginJSON, {
        main: 'base.js',
    });
    // 更新 metaInfo 数据
    updateMeta && await (0, fs_extra_1.writeJSONSync)(enginePaths.meta, metaInfo, { spaces: 2 });
    return signature;
}
function calcCodeMd5(file) {
    return (0, crypto_1.createHash)('md5').update((0, fs_extra_1.readFileSync)(file)).digest('hex');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VwYXJhdGUtZW5naW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci93b3JrZXIvYnVpbGRlci9hc3NldC1oYW5kbGVyL3NjcmlwdC9zZXBhcmF0ZS1lbmdpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQStVYixrREFRQztBQUtELGdDQW1FQztBQTlaRDs7OztHQUlHO0FBQ0gsdUNBQW1NO0FBQ25NLCtCQUF5RDtBQUN6RCxtQ0FBb0M7QUFDcEMsNENBQXlEO0FBQ3pELHVDQUE2QztBQUk3QyxNQUFNLGdCQUFnQjtJQUNsQixHQUFHLENBQVM7SUFDWixHQUFHLENBQVM7SUFDWixNQUFNLENBQVM7SUFDZixJQUFJLENBQVM7SUFDYixhQUFhLENBQVM7SUFDdEIsVUFBVSxDQUFTO0lBQ25CLFlBQVksR0FBVyxFQUFFLFVBQWtCO1FBQ3ZDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFBLFdBQUksRUFBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLFdBQUksRUFBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFBLFdBQUksRUFBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCxNQUFNO1FBQ0YsT0FBTztZQUNILEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLEdBQUcs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Q2xCLENBQUMsQ0FBQztJQUNILGlCQUFpQjtJQUNqQixVQUFVLElBQUksTUFBTSxJQUFBLHdCQUFhLEVBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM3RSxPQUFPLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsSUFBWTtJQUM3QixPQUFPLElBQUEsbUJBQVUsRUFBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBQSx1QkFBWSxFQUFDLElBQUksQ0FBZSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcbi8qKlxyXG4gKiDmraTmlofku7bpnIDopoHlnKjni6znq4sgbm9kZSDov5vnqIvph4zlj6/osIPnlKjvvIzkuI3lj6/kvb/nlKggRWRpdG9yL0VsZWN0cm9uIOaOpeWPo1xyXG4gKiDlvJXmk47liIbnprvnvJbor5HlkI7vvIzpu5jorqTkvJrnlJ/miJDkuIDku73ljIXlkKvlhajpg6jlvJXmk47mlaPmlofku7bnmoTnm67lvZXnu5PmnoTvvIzpu5jorqTlkI3np7DkuLogYWxsXHJcbiAqIOWmguaenOaMh+WumuS6hiBwbHVnaW5GZWF0dXJlcyDliJnkvJrkuLrlhbYgcGljayDlh7rkuIDku73mj5Lku7bnm67lvZVcclxuICovXHJcbmltcG9ydCB7IHdyaXRlSlNPTlN5bmMsIGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luYywgcmVhZEpTT05TeW5jLCBlbXB0eURpclN5bmMsIGVuc3VyZURpclN5bmMsIGNvcHlGaWxlU3luYywgb3V0cHV0SlNPTlN5bmMsIGNvcHlTeW5jLCBvdXRwdXRKU09OLCBjb3B5LCBvdXRwdXRGaWxlIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBqb2luLCBiYXNlbmFtZSwgZGlybmFtZSwgcmVsYXRpdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgY3JlYXRlSGFzaCB9IGZyb20gJ2NyeXB0byc7XHJcbmltcG9ydCB7IGJ1aWxkRW5naW5lLCBTdGF0c1F1ZXJ5IH0gZnJvbSAnQGNvY29zL2NjYnVpbGQnO1xyXG5pbXBvcnQgeyBjb21wYXJlT3B0aW9ucyB9IGZyb20gJy4uLy4uL3V0aWxzJztcclxuaW1wb3J0IHsgSUJ1aWxkU2VwYXJhdGVFbmdpbmVDYWNoZU9wdGlvbnMsIElCdWlsZFNlcGFyYXRlRW5naW5lT3B0aW9ucywgSUJ1aWxkU2VwYXJhdGVFbmdpbmVSZXN1bHQsIElFbmdpbmVDYWNoZVBhdGhzLCBJRW52TGltaXRNb2R1bGUsIElTaWduYXR1cmVDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9AdHlwZXMvcHJpdmF0ZSc7XHJcbmltcG9ydCB7IE1vZHVsZVJlbmRlckNvbmZpZywgSUZlYXR1cmVJdGVtLCBJTW9kdWxlSXRlbSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2VuZ2luZS9AdHlwZXMvbW9kdWxlcyc7XHJcblxyXG5jbGFzcyBFbmdpbmVDYWNoZVBhdGhzIGltcGxlbWVudHMgSUVuZ2luZUNhY2hlUGF0aHMge1xyXG4gICAgZGlyOiBzdHJpbmc7XHJcbiAgICBhbGw6IHN0cmluZztcclxuICAgIHBsdWdpbjogc3RyaW5nO1xyXG4gICAgbWV0YTogc3RyaW5nO1xyXG4gICAgc2lnbmF0dXJlSlNPTjogc3RyaW5nO1xyXG4gICAgcGx1Z2luSlNPTjogc3RyaW5nO1xyXG4gICAgY29uc3RydWN0b3IoZGlyOiBzdHJpbmcsIHBsdWdpbk5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZGlyID0gZGlyO1xyXG4gICAgICAgIHRoaXMuYWxsID0gam9pbihkaXIsICdhbGwnKTtcclxuICAgICAgICB0aGlzLnBsdWdpbiA9IGpvaW4oZGlyLCBwbHVnaW5OYW1lKTtcclxuICAgICAgICB0aGlzLm1ldGEgPSBqb2luKGRpciwgJ21ldGEuanNvbicpO1xyXG4gICAgICAgIHRoaXMuc2lnbmF0dXJlSlNPTiA9IGpvaW4odGhpcy5wbHVnaW4sICdzaWduYXR1cmUuanNvbicpO1xyXG4gICAgICAgIHRoaXMucGx1Z2luSlNPTiA9IGpvaW4odGhpcy5wbHVnaW4sICdwbHVnaW4uanNvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIHRvSlNPTigpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBkaXI6IHRoaXMuZGlyLFxyXG4gICAgICAgICAgICBhbGw6IHRoaXMuYWxsLFxyXG4gICAgICAgICAgICBwbHVnaW46IHRoaXMucGx1Z2luLFxyXG4gICAgICAgICAgICBtZXRhOiB0aGlzLm1ldGEsXHJcbiAgICAgICAgICAgIHNpZ25hdHVyZUpTT046IHRoaXMuc2lnbmF0dXJlSlNPTixcclxuICAgICAgICAgICAgcGx1Z2luSlNPTjogdGhpcy5wbHVnaW5KU09OLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmludGVyZmFjZSBJRW5naW5lRmVhdHVyZVF1ZXJ5T3B0aW9ucyB7XHJcbiAgICBwbGF0Zm9ybVR5cGU6IFN0YXRzUXVlcnkuQ29uc3RhbnRNYW5hZ2VyLlBsYXRmb3JtVHlwZTtcclxuICAgIGVuZ2luZTogc3RyaW5nO1xyXG4gICAgcGx1Z2luRmVhdHVyZXM/OiBzdHJpbmdbXSB8ICdhbGwnIHwgJ2RlZmF1bHQnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBleHRyYWN0TWFjcm9zKGV4cHJlc3Npb246IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuICAgIHJldHVybiBleHByZXNzaW9uLnNwbGl0KCd8fCcpLm1hcChtYXRjaCA9PiBtYXRjaC50cmltKCkuc3Vic3RyaW5nKDEpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaW50aUVuZ2luZUZlYXR1cmVzKGVuZ2luZURpcjogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBtb2R1bGVzSW5mbzogTW9kdWxlUmVuZGVyQ29uZmlnID0gcmVxdWlyZShqb2luKGVuZ2luZURpciwgJ2VkaXRvcicsICdlbmdpbmUtZmVhdHVyZXMnLCAncmVuZGVyLWNvbmZpZy5qc29uJykpO1xyXG5cclxuICAgIGNvbnN0IHBsdWdpbkZlYXR1cmVzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgY29uc3QgZW52TGltaXRNb2R1bGU6IElFbnZMaW1pdE1vZHVsZSA9IHt9O1xyXG4gICAgY29uc3Qgc3RlcE1vZHVsZSA9IChtb2R1bGVLZXk6IHN0cmluZywgbW9kdWxlSXRlbTogSUZlYXR1cmVJdGVtKSA9PiB7XHJcbiAgICAgICAgaWYgKG1vZHVsZUl0ZW0uZW52Q29uZGl0aW9uKSB7XHJcbiAgICAgICAgICAgIGVudkxpbWl0TW9kdWxlW21vZHVsZUtleV0gPSB7XHJcbiAgICAgICAgICAgICAgICBlbnZMaXN0OiBleHRyYWN0TWFjcm9zKG1vZHVsZUl0ZW0uZW52Q29uZGl0aW9uKSxcclxuICAgICAgICAgICAgICAgIGZhbGxiYWNrOiBtb2R1bGVJdGVtLmZhbGxiYWNrLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1vZHVsZUl0ZW0uZW5naW5lUGx1Z2luKSB7XHJcbiAgICAgICAgICAgIHBsdWdpbkZlYXR1cmVzLnB1c2gobW9kdWxlS2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgZnVuY3Rpb24gYWRkTW9kdWxlT3JHcm91cChtb2R1bGVLZXk6IHN0cmluZywgbW9kdWxlSXRlbTogSU1vZHVsZUl0ZW0pIHtcclxuICAgICAgICBpZiAoJ29wdGlvbnMnIGluIG1vZHVsZUl0ZW0pIHtcclxuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMobW9kdWxlSXRlbS5vcHRpb25zKS5mb3JFYWNoKChbb3B0aW9uS2V5LCBvcHRpb25JdGVtXSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3RlcE1vZHVsZShvcHRpb25LZXksIG9wdGlvbkl0ZW0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdGVwTW9kdWxlKG1vZHVsZUtleSwgbW9kdWxlSXRlbSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgT2JqZWN0LmVudHJpZXMobW9kdWxlc0luZm8uZmVhdHVyZXMpLmZvckVhY2goKFttb2R1bGVLZXksIG1vZHVsZUl0ZW1dKSA9PiB7XHJcbiAgICAgICAgYWRkTW9kdWxlT3JHcm91cChtb2R1bGVLZXksIG1vZHVsZUl0ZW0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBlbnZMaW1pdE1vZHVsZSxcclxuICAgICAgICBwbHVnaW5GZWF0dXJlcyxcclxuICAgIH07XHJcbn1cclxuXHJcbmNsYXNzIEVuZ2luZUZlYXR1cmVRdWVyeSB7XHJcblxyXG4gICAgYWxsOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgYWxsVW5pdDogc3RyaW5nW10gPSBbXTtcclxuICAgIHBsdWdpbjogc3RyaW5nW10gPSBbXTtcclxuICAgIHBsdWdpblVuaXQ6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgZW5naW5lU3RhdHNRdWVyeSE6IFN0YXRzUXVlcnk7XHJcbiAgICBlbnZMaW1pdE1vZHVsZTogSUVudkxpbWl0TW9kdWxlID0ge307XHJcblxyXG4gICAgX2RlZmF1bHRQbHVnaW5zOiBzdHJpbmdbXTtcclxuXHJcbiAgICAvLyDliIbnprvlvJXmk47mj5Lku7bnm67liY3lj6rmlK/mjIHpgInkuK3kuIDkuKogU3BpbmUg54mI5pys77yM5YW85a655oCn6ICD6JmR77yM5o6S6Zmk5o6JIHNwaW5lLTQuMlxyXG4gICAgX2V4Y2x1ZGVGZWF0dXJlcyA9IFsnc3BpbmUtNC4yJ107XHJcblxyXG4gICAgZW52OiBTdGF0c1F1ZXJ5LkNvbnN0YW50TWFuYWdlci5Db25zdGFudE9wdGlvbnM7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGVhc2UgdXNlIEVuZ2luZUZlYXR1cmVRdWVyeS5jcmVhdGUgaW5zdGVhZFxyXG4gICAgICogQHBhcmFtIG9wdGlvbnMgXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3Iob3B0aW9uczogSUVuZ2luZUZlYXR1cmVRdWVyeU9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLmVudiA9IHtcclxuICAgICAgICAgICAgbW9kZTogJ0JVSUxEJyxcclxuICAgICAgICAgICAgcGxhdGZvcm06IG9wdGlvbnMucGxhdGZvcm1UeXBlLFxyXG4gICAgICAgICAgICBmbGFnczoge1xyXG4gICAgICAgICAgICAgICAgU0VSVkVSX01PREU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgREVCVUc6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgV0FTTV9TVUJQQUNLQUdFOiBmYWxzZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IHJlcyA9IGludGlFbmdpbmVGZWF0dXJlcyhvcHRpb25zLmVuZ2luZSk7XHJcbiAgICAgICAgdGhpcy5lbnZMaW1pdE1vZHVsZSA9IHJlcy5lbnZMaW1pdE1vZHVsZTtcclxuICAgICAgICB0aGlzLl9kZWZhdWx0UGx1Z2lucyA9IHJlcy5wbHVnaW5GZWF0dXJlcztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgY3JlYXRlKG9wdGlvbnM6IElFbmdpbmVGZWF0dXJlUXVlcnlPcHRpb25zKSB7XHJcbiAgICAgICAgY29uc3QgZW5naW5lRmVhdHVyZVF1ZXJ5ID0gbmV3IEVuZ2luZUZlYXR1cmVRdWVyeShvcHRpb25zKTtcclxuICAgICAgICBhd2FpdCBlbmdpbmVGZWF0dXJlUXVlcnkuX2luaXQob3B0aW9ucyk7XHJcbiAgICAgICAgcmV0dXJuIGVuZ2luZUZlYXR1cmVRdWVyeTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KG9wdGlvbnM6IElFbmdpbmVGZWF0dXJlUXVlcnlPcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5lbmdpbmVTdGF0c1F1ZXJ5ID0gYXdhaXQgU3RhdHNRdWVyeS5jcmVhdGUob3B0aW9ucy5lbmdpbmUpO1xyXG5cclxuICAgICAgICBjb25zdCBmZWF0dXJlcyA9IHRoaXMuZmlsdGVyRW5naW5lTW9kdWxlcyh0aGlzLmVuZ2luZVN0YXRzUXVlcnkuZ2V0RmVhdHVyZXMoKSk7XHJcbiAgICAgICAgdGhpcy5hbGwgPSBmZWF0dXJlcy5maWx0ZXIoKGZlYXR1cmUpID0+ICF0aGlzLl9leGNsdWRlRmVhdHVyZXMuaW5jbHVkZXMoZmVhdHVyZSkpO1xyXG4gICAgICAgIHRoaXMuYWxsVW5pdCA9IHRoaXMuZW5naW5lU3RhdHNRdWVyeS5nZXRVbml0c09mRmVhdHVyZXModGhpcy5hbGwpO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMucGx1Z2luRmVhdHVyZXMpIHtcclxuICAgICAgICAgICAgY2FzZSAnZGVmYXVsdCc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbiA9IHRoaXMuZmlsdGVyRW5naW5lTW9kdWxlcyh0aGlzLl9kZWZhdWx0UGx1Z2lucyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpblVuaXQgPSB0aGlzLmVuZ2luZVN0YXRzUXVlcnkuZ2V0VW5pdHNPZkZlYXR1cmVzKHRoaXMucGx1Z2luKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdhbGwnOlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4gPSB0aGlzLmFsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luVW5pdCA9IHRoaXMuYWxsVW5pdDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDov4fmu6TmqKHlnZdcclxuICAgICAqIEBwYXJhbSBpbmNsdWRlTW9kdWxlcyDljp/lp4vmqKHlnZfliJfooahcclxuICAgICAqIEByZXR1cm5zIOi/lOWbnuWvueixoe+8jOWMheWQq+mcgOimgeWbnumAgOeahOaooeWdl+aYoOWwhOWSjOi/h+a7pOWQjueahOWMheWQq+aooeWdl+WIl+ihqFxyXG4gICAgICovXHJcbiAgICBmaWx0ZXJFbmdpbmVNb2R1bGVzKGZlYXR1cmVzOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGNvbnN0IGNjRW52Q29uc3RhbnRzID0gdGhpcy5lbmdpbmVTdGF0c1F1ZXJ5LmNvbnN0YW50TWFuYWdlci5nZW5DQ0VudkNvbnN0YW50cyh0aGlzLmVudik7XHJcbiAgICAgICAgY29uc3QgbW9kdWxlVG9GYWxsQmFjazogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xyXG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuZW52TGltaXRNb2R1bGUpLmZvckVhY2goKG1vZHVsZUlkOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFmZWF0dXJlcy5pbmNsdWRlcyhtb2R1bGVJZCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCB7IGVudkxpc3QsIGZhbGxiYWNrIH0gPSB0aGlzLmVudkxpbWl0TW9kdWxlW21vZHVsZUlkXTtcclxuICAgICAgICAgICAgY29uc3QgZW5hYmxlID0gZW52TGlzdC5zb21lKChlbnYpID0+IGNjRW52Q29uc3RhbnRzW2VudiBhcyBrZXlvZiBTdGF0c1F1ZXJ5LkNvbnN0YW50TWFuYWdlci5DQ0VudkNvbnN0YW50c10pO1xyXG4gICAgICAgICAgICBpZiAoZW5hYmxlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbW9kdWxlVG9GYWxsQmFja1ttb2R1bGVJZF0gPSBmYWxsYmFjayB8fCAnJztcclxuICAgICAgICAgICAgaWYgKGZhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBmZWF0dXJlcy5zcGxpY2UoZmVhdHVyZXMuaW5kZXhPZihtb2R1bGVJZCksIDEsIGZhbGxiYWNrKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZlYXR1cmVzLnNwbGljZShmZWF0dXJlcy5pbmRleE9mKG1vZHVsZUlkKSwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZmVhdHVyZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VW5pdHNPZkZlYXR1cmVzKGZlYXR1cmVzOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVuZ2luZVN0YXRzUXVlcnkuZ2V0VW5pdHNPZkZlYXR1cmVzKGZlYXR1cmVzKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8g5byV5pOO5o+S5Lu25qih5Z2X55Sf5oiQ5ZmoXHJcbmNsYXNzIEVuZ2luZUZlYXR1cmVVbml0R2VuZXJhdG9yIHtcclxuICAgIG1ldGFJbmZvOiBidWlsZEVuZ2luZS5SZXN1bHQ7XHJcbiAgICBpbXBvcnRNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuICAgIGVuZ2luZUNhY2hlUGF0aHM6IEVuZ2luZUNhY2hlUGF0aHM7XHJcbiAgICBlbmdpbmVGZWF0dXJlUXVlcnk6IEVuZ2luZUZlYXR1cmVRdWVyeTtcclxuICAgIG9wdGlvbnM6IElCdWlsZFNlcGFyYXRlRW5naW5lT3B0aW9ucztcclxuICAgIHByaXZhdGUgY29uc3RydWN0b3Iob3B0aW9uczogSUJ1aWxkU2VwYXJhdGVFbmdpbmVPcHRpb25zLCBtZXRhSW5mbzogYnVpbGRFbmdpbmUuUmVzdWx0LCBlbmdpbmVDYWNoZVBhdGhzOiBFbmdpbmVDYWNoZVBhdGhzLCBlbmdpbmVGZWF0dXJlUXVlcnk6IEVuZ2luZUZlYXR1cmVRdWVyeSkge1xyXG4gICAgICAgIHRoaXMubWV0YUluZm8gPSBtZXRhSW5mbztcclxuICAgICAgICB0aGlzLmVuZ2luZUNhY2hlUGF0aHMgPSBlbmdpbmVDYWNoZVBhdGhzO1xyXG4gICAgICAgIHRoaXMuZW5naW5lRmVhdHVyZVF1ZXJ5ID0gZW5naW5lRmVhdHVyZVF1ZXJ5O1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGNyZWF0ZShvcHRpb25zOiBJQnVpbGRTZXBhcmF0ZUVuZ2luZU9wdGlvbnMpIHtcclxuICAgICAgICAvLyAxLiDojrflj5blvJXmk47mj5Lku7bmqKHlnZfliJfooahcclxuICAgICAgICBjb25zdCBlbmdpbmVGZWF0dXJlUXVlcnkgPSBhd2FpdCBFbmdpbmVGZWF0dXJlUXVlcnkuY3JlYXRlKHtcclxuICAgICAgICAgICAgcGxhdGZvcm1UeXBlOiBvcHRpb25zLnBsYXRmb3JtVHlwZSxcclxuICAgICAgICAgICAgZW5naW5lOiBvcHRpb25zLmVuZ2luZSxcclxuICAgICAgICAgICAgcGx1Z2luRmVhdHVyZXM6IG9wdGlvbnMucGx1Z2luRmVhdHVyZXMsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIDIuIOS8oOmAkuWPguaVsOS7peWPiuiuoeeul+i/h+eahCBwbHVnaW5GZWF0dXJlcyDnlKjkuo7nlJ/miJDlvJXmk47mj5Lku7bnvJPlrZhcclxuICAgICAgICBjb25zdCBlbmdpbmVDYWNoZVBhdGhzID0gYXdhaXQgYnVpbGRDb2Nvcyh7XHJcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXHJcbiAgICAgICAgICAgIGVuZ2luZUZlYXR1cmVRdWVyeSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBtZXRhSW5mbzogYnVpbGRFbmdpbmUuUmVzdWx0ID0gcmVhZEpTT05TeW5jKGVuZ2luZUNhY2hlUGF0aHMubWV0YSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBFbmdpbmVGZWF0dXJlVW5pdEdlbmVyYXRvcihvcHRpb25zLCBtZXRhSW5mbywgZW5naW5lQ2FjaGVQYXRocywgZW5naW5lRmVhdHVyZVF1ZXJ5KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGlzQWxpYXNlZENodW5rKGNodW5rOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gY2h1bmsgaW4gdGhpcy5tZXRhSW5mby5jaHVua0FsaWFzZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRGaWxlTmFtZShmaWxlOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXRhSW5mby5jaHVua0FsaWFzZXNbZmlsZV0gPz8gZmlsZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFkZENodW5rVG9QbHVnaW4gPSAoY2h1bms6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gdGhpcy5nZXRGaWxlTmFtZShjaHVuayk7XHJcbiAgICAgICAgY29uc3QgY2h1bmtTcGVjaWZpZXIgPSB0aGlzLmlzQWxpYXNlZENodW5rKGNodW5rKVxyXG4gICAgICAgICAgICA/IGNodW5rXHJcbiAgICAgICAgICAgIDogYC4uLyR7YmFzZW5hbWUodGhpcy5vcHRpb25zLm91dHB1dCl9LyR7ZmlsZU5hbWV9YDtcclxuICAgICAgICBjb25zdCBpbXBvcnRVUkwgPSBgcGx1Z2luOiR7dGhpcy5vcHRpb25zLnBsdWdpbk5hbWV9LyR7ZmlsZU5hbWV9YDtcclxuICAgICAgICB0aGlzLmltcG9ydE1hcFtjaHVua1NwZWNpZmllcl0gPSBpbXBvcnRVUkw7XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgYWRkVG9Mb2NhbChmaWxlOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHRoaXMuZ2V0RmlsZU5hbWUoZmlsZSk7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gam9pbih0aGlzLm9wdGlvbnMub3V0cHV0LCBmaWxlTmFtZSk7XHJcbiAgICAgICAgZW5zdXJlRGlyU3luYyhkaXJuYW1lKHRhcmdldCkpO1xyXG4gICAgICAgIGNvcHlGaWxlU3luYyhqb2luKHRoaXMuZW5naW5lQ2FjaGVQYXRocy5hbGwsIGZpbGVOYW1lKSwgdGFyZ2V0KTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNBbGlhc2VkQ2h1bmsoZmlsZSkpIHtcclxuICAgICAgICAgICAgdGhpcy5pbXBvcnRNYXBbZmlsZV0gPSBgLi4vJHtiYXNlbmFtZSh0aGlzLm9wdGlvbnMub3V0cHV0KX0vJHtmaWxlTmFtZX1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBydW4oKSB7XHJcbiAgICAgICAgY29uc3QgeyBvcHRpb25zLCBlbmdpbmVGZWF0dXJlUXVlcnksIGVuZ2luZUNhY2hlUGF0aHMgfSA9IHRoaXM7XHJcbiAgICAgICAgLy8gMy4g6K6h566XIGNjLmpzIOmcgOimgeWtmOaUvueahOaooeWdl+e0ouW8leS/oeaBr++8jGluY2x1ZGVNb2R1bGVzIOW5tumdnuS7o+ihqOaJgOacieeUqOaIt+mAieaLqeeahOaooeWdl+S/oeaBr+mcgOimgeS9v+eUqCBnZXRVbml0c09mRmVhdHVyZXMg6K6h566XXHJcbiAgICAgICAgY29uc3QgaW5jbHVkZU1vZHVsZXMgPSBvcHRpb25zLmluY2x1ZGVNb2R1bGVzO1xyXG4gICAgICAgIGNvbnN0IGFsbFVuaXRzID0gZW5naW5lRmVhdHVyZVF1ZXJ5LmdldFVuaXRzT2ZGZWF0dXJlcyhpbmNsdWRlTW9kdWxlcyk7XHJcbiAgICAgICAgY29uc3QgbG9jYWxGZWF0dXJlVW5pdHMgPSBhbGxVbml0cy5maWx0ZXIoKGl0ZW0pID0+ICFlbmdpbmVGZWF0dXJlUXVlcnkucGx1Z2luVW5pdC5pbmNsdWRlcyhpdGVtKSk7XHJcbiAgICAgICAgY29uc3QgbWV0YUluZm86IGJ1aWxkRW5naW5lLlJlc3VsdCA9IHJlYWRKU09OU3luYyhlbmdpbmVDYWNoZVBhdGhzLm1ldGEpO1xyXG4gICAgICAgIGNvbnN0IGxvY2FsUGx1Z2luRmVhdHVyZVVuaXRzID0gYWxsVW5pdHMuZmlsdGVyKChpdGVtKSA9PiBlbmdpbmVGZWF0dXJlUXVlcnkucGx1Z2luVW5pdC5pbmNsdWRlcyhpdGVtKSk7XHJcbiAgICAgICAgY29uc3QgY2NNb2R1bGVGaWxlID0gam9pbihvcHRpb25zLm91dHB1dCwgJ2NjLmpzJyk7XHJcbiAgICAgICAgY29uc3QgZmVhdHVyZVVuaXROYW1lTWFwcGVyID0gKGZlYXR1cmVVbml0OiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgLy8g5LyY5YWI5L2/55So5byV5pOO5o+S5Lu255qE5qih5Z2X77yM5YeP5bCP5pys5Zyw5YyF5L2TXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmVuZ2luZUZlYXR1cmVRdWVyeS5wbHVnaW5Vbml0LmluY2x1ZGVzKGZlYXR1cmVVbml0KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGBwbHVnaW46JHt0aGlzLm9wdGlvbnMucGx1Z2luTmFtZX0vJHtmZWF0dXJlVW5pdH0uanNgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBgLi8ke2ZlYXR1cmVVbml0fS5qc2A7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBjY01vZHVsZVNvdXJjZSA9IGF3YWl0IGJ1aWxkRW5naW5lLnRyYW5zZm9ybShcclxuICAgICAgICAgICAgZW5naW5lRmVhdHVyZVF1ZXJ5LmVuZ2luZVN0YXRzUXVlcnkuZXZhbHVhdGVJbmRleE1vZHVsZVNvdXJjZShhbGxVbml0cywgZmVhdHVyZVVuaXROYW1lTWFwcGVyKSxcclxuICAgICAgICAgICAgJ3N5c3RlbScsXHJcbiAgICAgICAgKTtcclxuICAgICAgICBhd2FpdCBvdXRwdXRGaWxlKGNjTW9kdWxlRmlsZSwgY2NNb2R1bGVTb3VyY2UuY29kZSwgJ3V0ZjgnKTtcclxuICAgICAgICBjb25zdCBsb2NhbENodW5rczogc3RyaW5nW10gPSBidWlsZEVuZ2luZS5lbnVtZXJhdGVEZXBlbmRlbnRDaHVua3MobWV0YUluZm8sIGxvY2FsRmVhdHVyZVVuaXRzKTtcclxuICAgICAgICBjb25zdCBwbHVnaW5DaHVua3M6IHN0cmluZ1tdID0gYnVpbGRFbmdpbmUuZW51bWVyYXRlRGVwZW5kZW50Q2h1bmtzKG1ldGFJbmZvLCBlbmdpbmVGZWF0dXJlUXVlcnkucGx1Z2luVW5pdCk7XHJcbiAgICAgICAgLy8gTk9URe+8mua4uOaIj+WMheWGheacieS9v+eUqOWIsOeahOaPkuS7tuaooeWdl+WSjOacrOWcsOaooeWdl+S+nei1lueahCBhc3NldO+8jOmDveimgeaUvuWIsOacrOWcsOWMheWGhVxyXG4gICAgICAgIGNvbnN0IGFzc2V0cyA9IGJ1aWxkRW5naW5lLmVudW1lcmF0ZURlcGVuZGVudEFzc2V0cyhtZXRhSW5mbywgbG9jYWxGZWF0dXJlVW5pdHMpLmNvbmNhdChidWlsZEVuZ2luZS5lbnVtZXJhdGVEZXBlbmRlbnRBc3NldHMobWV0YUluZm8sIGxvY2FsUGx1Z2luRmVhdHVyZVVuaXRzKSk7XHJcblxyXG4gICAgICAgIGxvY2FsQ2h1bmtzLmZvckVhY2goKGNodW5rKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChwbHVnaW5DaHVua3MuaW5jbHVkZXMoY2h1bmspKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZENodW5rVG9QbHVnaW4oY2h1bmspO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRUb0xvY2FsKGNodW5rKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGFzc2V0cy5mb3JFYWNoKChhc3NldCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmFkZFRvTG9jYWwoYXNzZXQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuaW1wb3J0TWFwWydjYyddID0gYC4vJHtyZWxhdGl2ZVVybChkaXJuYW1lKG9wdGlvbnMuaW1wb3J0TWFwT3V0RmlsZSksIG9wdGlvbnMub3V0cHV0KX0vY2MuanNgO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5vdXRwdXRMb2NhbFBsdWdpbikge1xyXG4gICAgICAgICAgICBjb25zdCBsb2NhbFBsdWdpbkNodW5rcyA9IGJ1aWxkRW5naW5lLmVudW1lcmF0ZURlcGVuZGVudENodW5rcyhtZXRhSW5mbywgbG9jYWxQbHVnaW5GZWF0dXJlVW5pdHMpO1xyXG4gICAgICAgICAgICAvLyDnlJ/miJDmnKzlnLDpnIDopoHnmoTmj5Lku7bmlofku7blpLnliLDovpPlh7rnm67lvZVcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5nZW5lcmF0ZUxvY2FsUGx1Z2luKGxvY2FsUGx1Z2luQ2h1bmtzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2VuZXJhdGVMb2NhbFBsdWdpbihmZWF0dXJlRmlsZXM6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgY29uc3QgY29jb3NEZXN0ID0gam9pbihkaXJuYW1lKHRoaXMub3B0aW9ucy5vdXRwdXQpLCB0aGlzLm9wdGlvbnMucGx1Z2luTmFtZSk7XHJcbiAgICAgICAgcmV0dXJuIEVuZ2luZUZlYXR1cmVVbml0R2VuZXJhdG9yLmdlbmVyYXRlUGx1Z2lucyh0aGlzLmVuZ2luZUNhY2hlUGF0aHMsIGZlYXR1cmVGaWxlcywgY29jb3NEZXN0LCB0aGlzLm9wdGlvbnMuc2lnbmF0dXJlUHJvdmlkZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZW5lcmF0ZVBsdWdpbnMoZW5naW5lUGF0aHM6IEVuZ2luZUNhY2hlUGF0aHMsIGZlYXR1cmVGaWxlczogc3RyaW5nW10sIGRpc3Q6IHN0cmluZywgc2lnbmF0dXJlUHJvdmlkZXI/OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIWZlYXR1cmVGaWxlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBtZXRhSW5mbyA9IHJlYWRKU09OU3luYyhlbmdpbmVQYXRocy5tZXRhKTtcclxuICAgICAgICBlbnN1cmVEaXJTeW5jKGRpc3QpO1xyXG4gICAgICAgIGxldCB1cGRhdGVNZXRhID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3Qgc2lnbmF0dXJlOiBJU2lnbmF0dXJlQ29uZmlnW10gPSBbXTtcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChcclxuICAgICAgICAgICAgZmVhdHVyZUZpbGVzLm1hcChhc3luYyAoZmlsZSwgaSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3JjID0gam9pbihlbmdpbmVQYXRocy5hbGwsIGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGVzdCA9IGpvaW4oZGlzdCwgZmlsZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW1ldGFJbmZvLm1kNU1hcFtmaWxlXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYHBhdGNoIG1kNSBmb3IgJHtmaWxlfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGFJbmZvLm1kNU1hcFtmaWxlXSA9IGF3YWl0IGNhbGNDb2RlTWQ1KHNyYyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlTWV0YSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzaWduYXR1cmUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbWQ1OiBtZXRhSW5mby5tZDVNYXBbZmlsZV0sXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogZmlsZSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZW5zdXJlRGlyU3luYyhkaXJuYW1lKGRlc3QpKTtcclxuICAgICAgICAgICAgICAgIC8vIOazqOaEj++8jOWNleeLrOaLt+i0neaWh+S7tuWPr+S7pe+8jOWmguaenOaYr+S7juWuieijheWMheWGheaLt+i0neaWh+S7tuWkueS8muacieadg+mZkOmXrumimFxyXG4gICAgICAgICAgICAgICAgY29weUZpbGVTeW5jKHNyYywgZGVzdCk7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgc2lnbmF0dXJlUHJvdmlkZXIgJiYgYXdhaXQgb3V0cHV0SlNPTihqb2luKGRpc3QsIGJhc2VuYW1lKGVuZ2luZVBhdGhzLnNpZ25hdHVyZUpTT04pKSwge1xyXG4gICAgICAgICAgICBwcm92aWRlcjogc2lnbmF0dXJlUHJvdmlkZXIsXHJcbiAgICAgICAgICAgIHNpZ25hdHVyZSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBhd2FpdCBvdXRwdXRKU09OKGpvaW4oZGlzdCwgYmFzZW5hbWUoZW5naW5lUGF0aHMucGx1Z2luSlNPTikpLCB7XHJcbiAgICAgICAgICAgIG1haW46ICdiYXNlLmpzJyxcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyDmm7TmlrAgbWV0YUluZm8g5pWw5o2uXHJcbiAgICAgICAgdXBkYXRlTWV0YSAmJiBhd2FpdCB3cml0ZUpTT05TeW5jKGVuZ2luZVBhdGhzLm1ldGEsIG1ldGFJbmZvLCB7IHNwYWNlczogMiB9KTtcclxuICAgICAgICByZXR1cm4gc2lnbmF0dXJlO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog5qC55o2u6YCJ6aG557yW6K+R5YiG56a75byV5pOO77yM5bm26L+U5ZueIGltcG9ydE1hcCDkv6Hmga9cclxuICogQHBhcmFtIG9wdGlvbnMgXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVpbGRTZXBhcmF0ZUVuZ2luZShvcHRpb25zOiBJQnVpbGRTZXBhcmF0ZUVuZ2luZU9wdGlvbnMpOiBQcm9taXNlPElCdWlsZFNlcGFyYXRlRW5naW5lUmVzdWx0PiB7XHJcblxyXG4gICAgY29uc3QgZW5naW5lRmVhdHVyZUdlbmVyYXRvciA9IGF3YWl0IEVuZ2luZUZlYXR1cmVVbml0R2VuZXJhdG9yLmNyZWF0ZShvcHRpb25zKTtcclxuICAgIGF3YWl0IGVuZ2luZUZlYXR1cmVHZW5lcmF0b3IucnVuKCk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGltcG9ydE1hcDogZW5naW5lRmVhdHVyZUdlbmVyYXRvci5pbXBvcnRNYXAsXHJcbiAgICAgICAgcGF0aHM6IGVuZ2luZUZlYXR1cmVHZW5lcmF0b3IuZW5naW5lQ2FjaGVQYXRocyxcclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDnvJbor5HlvJXmk47liIbnprvmj5Lku7bliLDnvJPlrZjnm67lvZXkuIso5ZG95Luk6KGM5Lya6LCD55SoKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkQ29jb3Mob3B0aW9uczogSUJ1aWxkU2VwYXJhdGVFbmdpbmVDYWNoZU9wdGlvbnMpOiBQcm9taXNlPEVuZ2luZUNhY2hlUGF0aHM+IHtcclxuICAgIGNvbnN0IG91dERpciA9IGpvaW4ob3B0aW9ucy5lbmdpbmUsIGBiaW4vLmNhY2hlL2VkaXRvci1jYWNoZS8ke29wdGlvbnMucGxhdGZvcm19YCk7XHJcbiAgICBjb25zdCBlbmdpbmVQYXRocyA9IG5ldyBFbmdpbmVDYWNoZVBhdGhzKG91dERpciwgb3B0aW9ucy5wbHVnaW5OYW1lKTtcclxuICAgIGlmIChvcHRpb25zLnVzZUNhY2hlRm9yY2UgJiYgZXhpc3RzU3luYyhlbmdpbmVQYXRocy5wbHVnaW4pKSB7XHJcbiAgICAgICAgLy8g55uu5YmN5pqC5pyq5qOA5p+l5a6M5pW055qE57yT5a2Y5piv5ZCm5pyJ5pWIXHJcbiAgICAgICAgcmV0dXJuIGVuZ2luZVBhdGhzO1xyXG4gICAgfVxyXG4gICAgb3B0aW9ucy5lbmdpbmVGZWF0dXJlUXVlcnkgPSBvcHRpb25zLmVuZ2luZUZlYXR1cmVRdWVyeSB8fCBhd2FpdCBFbmdpbmVGZWF0dXJlUXVlcnkuY3JlYXRlKHtcclxuICAgICAgICBwbGF0Zm9ybVR5cGU6IG9wdGlvbnMucGxhdGZvcm1UeXBlLFxyXG4gICAgICAgIGVuZ2luZTogb3B0aW9ucy5lbmdpbmUsXHJcbiAgICAgICAgcGx1Z2luRmVhdHVyZXM6IG9wdGlvbnMucGx1Z2luRmVhdHVyZXMsXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IHsgZW5naW5lRmVhdHVyZVF1ZXJ5IH0gPSBvcHRpb25zO1xyXG5cclxuICAgIC8vIEB0cy1pZ25vcmUg55uu5YmN57yW6K+R5byV5pOO5o6l5Y+j6YeM55qEIGZsYWdzIOWumuS5ieaXoOazleS6kuebuOS9v+eUqO+8jOWunumZheS4iuaYr+WQjOS4gOS7veaVsOaNrlxyXG4gICAgY29uc3QgYnVpbGRPcHRpb25zOiBidWlsZEVuZ2luZS5PcHRpb25zID0ge1xyXG4gICAgICAgIGVuZ2luZTogb3B0aW9ucy5lbmdpbmUsXHJcbiAgICAgICAgb3V0OiBlbmdpbmVQYXRocy5hbGwsXHJcbiAgICAgICAgbW9kdWxlRm9ybWF0OiAnc3lzdGVtJyxcclxuICAgICAgICBjb21wcmVzczogdHJ1ZSxcclxuICAgICAgICBzcGxpdDogdHJ1ZSxcclxuICAgICAgICBuYXRpdmVDb2RlQnVuZGxlTW9kZTogb3B0aW9ucy5uYXRpdmVDb2RlQnVuZGxlTW9kZSxcclxuICAgICAgICBmZWF0dXJlczogZW5naW5lRmVhdHVyZVF1ZXJ5LmFsbCxcclxuICAgICAgICBpbmxpbmVFbnVtOiBmYWxzZSwgLy8g5YiG56a75byV5pOO5o+S5Lu25YWI5LiN5byA5ZCv5YaF6IGU5p6a5Li+5Yqf6IO977yM562JIHYzLjguNSDlkI7nu63niYjmnKzpqozor4HnqLPlrprlkI7lho3ogIPomZHlvIDlkK9cclxuICAgICAgICAuLi5lbmdpbmVGZWF0dXJlUXVlcnkuZW52LFxyXG4gICAgICAgIC8vIHBsYXRmb3JtOiBlbmdpbmVGZWF0dXJlUXVlcnkuZW52LnBsYXRmb3JtLFxyXG4gICAgICAgIC8vIG1vZGU6IGVuZ2luZUZlYXR1cmVRdWVyeS5lbnYubW9kZSxcclxuICAgICAgICAvLyBmbGFnczogZW5naW5lRmVhdHVyZVF1ZXJ5LmVudi5mbGFncyxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgY2FjaGVPcHRpb25zUGF0aCA9IGpvaW4ob3V0RGlyLCAnb3B0aW9ucy5qc29uJyk7XHJcbiAgICBpZiAoZXhpc3RzU3luYyhjYWNoZU9wdGlvbnNQYXRoKSkge1xyXG4gICAgICAgIGNvbnN0IGNhY2hlT3B0aW9ucyA9IHJlYWRKU09OU3luYyhjYWNoZU9wdGlvbnNQYXRoKTtcclxuICAgICAgICBpZiAoY29tcGFyZU9wdGlvbnMoY2FjaGVPcHRpb25zLCBidWlsZE9wdGlvbnMpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGB1c2UgY2FjaGUgZW5naW5lIGluICR7ZW5naW5lUGF0aHMuZGlyfWApO1xyXG4gICAgICAgICAgICByZXR1cm4gZW5naW5lUGF0aHM7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgQ2FuIG5vdCBmaW5kIG9wdGlvbnMgY2FjaGUgaW4gJHtjYWNoZU9wdGlvbnNQYXRofWApO1xyXG4gICAgfVxyXG4gICAgZW1wdHlEaXJTeW5jKG91dERpcik7XHJcbiAgICAvLyDnq4vpqaznvJPlrZjmnoTlu7rpgInpobnvvIzlkKbliJnlj6/og73kvJrooqvlkI7nu63mtYHnqIvkv67mlLlcclxuICAgIGNvbnN0IGJ1aWxkT3B0aW9uc0NhY2hlID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShidWlsZE9wdGlvbnMpKTtcclxuXHJcbiAgICBjb25zdCBidWlsZFJlc3VsdCA9IGF3YWl0IGJ1aWxkRW5naW5lKGJ1aWxkT3B0aW9ucyk7XHJcbiAgICBjb25zdCBtZDVNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuICAgIC8vIOiuoeeul+W8leaTjiBtZDUg5YC8XHJcbiAgICBhd2FpdCBQcm9taXNlLmFsbChcclxuICAgICAgICBPYmplY3Qua2V5cyhidWlsZFJlc3VsdC5leHBvcnRzKS5tYXAoYXN5bmMgKGtleSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBkZXN0ID0gam9pbihlbmdpbmVQYXRocy5hbGwsIGJ1aWxkUmVzdWx0LmV4cG9ydHNba2V5XSk7XHJcbiAgICAgICAgICAgIGNvbnN0IG1kNSA9IGNhbGNDb2RlTWQ1KGRlc3QpO1xyXG4gICAgICAgICAgICBtZDVNYXBbYnVpbGRSZXN1bHQuZXhwb3J0c1trZXldXSA9IG1kNTtcclxuICAgICAgICB9KSxcclxuICAgICk7XHJcbiAgICAvLyDnvJPlrZjkuIDkuIvlvJXmk47mj5DkvpvnmoTmqKHlnZfmmKDlsIRcclxuICAgIGF3YWl0IHdyaXRlSlNPTlN5bmMoZW5naW5lUGF0aHMubWV0YSwgT2JqZWN0LmFzc2lnbihidWlsZFJlc3VsdCwgeyBtZDVNYXAgfSksIHsgc3BhY2VzOiAyIH0pO1xyXG5cclxuICAgIC8vIOaVtOeQhuWHuuWPr+S+m+S4iuS8oOeahOW8leaTjuaPkuS7tuWGheWuuVxyXG4gICAgaWYgKGVuZ2luZUZlYXR1cmVRdWVyeS5wbHVnaW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgY29uc3QgZmVhdHVyZVVuaXRzID0gZW5naW5lRmVhdHVyZVF1ZXJ5LmdldFVuaXRzT2ZGZWF0dXJlcyhlbmdpbmVGZWF0dXJlUXVlcnkucGx1Z2luKTtcclxuICAgICAgICAvLyBOT1RFOiDmj5Lku7bph4zlj6rog73mlL4gY2h1bmtz77yM5LiN6IO95pS+IGFzc2V0c1xyXG4gICAgICAgIGNvbnN0IGZlYXR1cmVGaWxlcyA9IGJ1aWxkRW5naW5lLmVudW1lcmF0ZURlcGVuZGVudENodW5rcyhidWlsZFJlc3VsdCwgZmVhdHVyZVVuaXRzKTtcclxuICAgICAgICBhd2FpdCBnZW5lcmF0ZVBsdWdpbnMoZW5naW5lUGF0aHMsIGZlYXR1cmVGaWxlcywgZW5naW5lUGF0aHMucGx1Z2luLCBvcHRpb25zLnNpZ25hdHVyZVByb3ZpZGVyKTtcclxuICAgIH1cclxuICAgIC8vIOacgOWQjuWGjeeUn+aIkOmAiemhuee8k+WtmOaWh+S7tu+8jOmBv+WFjeW8leaTjuaWh+S7tueUn+aIkOaXtuS4reaWreWQjuaWh+S7tuS4jeWujOaVtOWvvOiHtOWQjue7reatpemqpOaXoOazlei/kOihjFxyXG4gICAgYXdhaXQgb3V0cHV0SlNPTihjYWNoZU9wdGlvbnNQYXRoLCBidWlsZE9wdGlvbnNDYWNoZSwgeyBzcGFjZXM6IDQgfSk7XHJcbiAgICByZXR1cm4gZW5naW5lUGF0aHM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbGF0aXZlVXJsKGZyb206IHN0cmluZywgdG86IHN0cmluZykge1xyXG4gICAgcmV0dXJuIHJlbGF0aXZlKGZyb20sIHRvKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmkZjpgInnlJ/miJDlvJXmk47mj5Lku7bljIVcclxuICogQHBhcmFtIGVuZ2luZVBhdGhzIFxyXG4gKiBAcGFyYW0gZmVhdHVyZUZpbGVzIFxyXG4gKiBAcGFyYW0gZGlzdCBcclxuICogQHJldHVybnMgXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVBsdWdpbnMoZW5naW5lUGF0aHM6IEVuZ2luZUNhY2hlUGF0aHMsIGZlYXR1cmVGaWxlczogc3RyaW5nW10sIGRpc3Q6IHN0cmluZywgc2lnbmF0dXJlUHJvdmlkZXI/OiBzdHJpbmcpOiBQcm9taXNlPElTaWduYXR1cmVDb25maWdbXT4ge1xyXG4gICAgaWYgKCFmZWF0dXJlRmlsZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbWV0YUluZm8gPSByZWFkSlNPTlN5bmMoZW5naW5lUGF0aHMubWV0YSk7XHJcbiAgICBlbnN1cmVEaXJTeW5jKGRpc3QpO1xyXG4gICAgbGV0IHVwZGF0ZU1ldGEgPSBmYWxzZTtcclxuICAgIGNvbnN0IHNpZ25hdHVyZTogSVNpZ25hdHVyZUNvbmZpZ1tdID0gW107XHJcbiAgICBhd2FpdCBQcm9taXNlLmFsbChcclxuICAgICAgICBmZWF0dXJlRmlsZXMubWFwKGFzeW5jIChmaWxlLCBpKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNyYyA9IGpvaW4oZW5naW5lUGF0aHMuYWxsLCBmaWxlKTtcclxuICAgICAgICAgICAgY29uc3QgZGVzdCA9IGpvaW4oZGlzdCwgZmlsZSk7XHJcbiAgICAgICAgICAgIGlmICghbWV0YUluZm8ubWQ1TWFwW2ZpbGVdKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBwYXRjaCBtZDUgZm9yICR7ZmlsZX1gKTtcclxuICAgICAgICAgICAgICAgIG1ldGFJbmZvLm1kNU1hcFtmaWxlXSA9IGF3YWl0IGNhbGNDb2RlTWQ1KHNyYyk7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVNZXRhID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzaWduYXR1cmUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBtZDU6IG1ldGFJbmZvLm1kNU1hcFtmaWxlXSxcclxuICAgICAgICAgICAgICAgIHBhdGg6IGZpbGUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBlbnN1cmVEaXJTeW5jKGRpcm5hbWUoZGVzdCkpO1xyXG4gICAgICAgICAgICAvLyDms6jmhI/vvIzljZXni6zmi7fotJ3mlofku7blj6/ku6XvvIzlpoLmnpzmmK/ku47lronoo4XljIXlhoXmi7fotJ3mlofku7blpLnkvJrmnInmnYPpmZDpl67pophcclxuICAgICAgICAgICAgY29weUZpbGVTeW5jKHNyYywgZGVzdCk7XHJcbiAgICAgICAgfSksXHJcbiAgICApO1xyXG4gICAgc2lnbmF0dXJlUHJvdmlkZXIgJiYgYXdhaXQgb3V0cHV0SlNPTihlbmdpbmVQYXRocy5zaWduYXR1cmVKU09OLCB7XHJcbiAgICAgICAgcHJvdmlkZXI6IHNpZ25hdHVyZVByb3ZpZGVyLFxyXG4gICAgICAgIHNpZ25hdHVyZSxcclxuICAgIH0pO1xyXG4gICAgYXdhaXQgb3V0cHV0SlNPTihlbmdpbmVQYXRocy5wbHVnaW5KU09OLCB7XHJcbiAgICAgICAgbWFpbjogJ2Jhc2UuanMnLFxyXG4gICAgfSk7XHJcbiAgICAvLyDmm7TmlrAgbWV0YUluZm8g5pWw5o2uXHJcbiAgICB1cGRhdGVNZXRhICYmIGF3YWl0IHdyaXRlSlNPTlN5bmMoZW5naW5lUGF0aHMubWV0YSwgbWV0YUluZm8sIHsgc3BhY2VzOiAyIH0pO1xyXG4gICAgcmV0dXJuIHNpZ25hdHVyZTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2FsY0NvZGVNZDUoZmlsZTogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gY3JlYXRlSGFzaCgnbWQ1JykudXBkYXRlKHJlYWRGaWxlU3luYyhmaWxlKSBhcyBVaW50OEFycmF5KS5kaWdlc3QoJ2hleCcpO1xyXG59XHJcbiJdfQ==