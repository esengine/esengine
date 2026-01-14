'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAssetLibrary = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const serialization_1 = require("cc/editor/serialization");
const cconb_utils_1 = require("./cconb-utils");
const cc_1 = require("cc");
const utils_1 = require("../utils");
const assert_1 = __importDefault(require("assert"));
const cconb_1 = require("../utils/cconb");
const asset_1 = __importDefault(require("../../../../assets/manager/asset"));
const asset_db_1 = __importDefault(require("../../../../assets/manager/asset-db"));
const builder_config_1 = __importDefault(require("../../../share/builder-config"));
const i18n_1 = __importDefault(require("../../../../base/i18n"));
// 版本号记录
const CACHE_VERSION = '1.0.1';
/**
 * 资源管理器，主要负责资源的缓存更新
 * TODO 需要迁移到 asset-db 里面
 */
class BuildAssetLibrary {
    // 资源索引缓存，只记录引用，不需要担心缓存数据内存，需要注意 reset 避免内存泄漏
    assetMap = {};
    get assets() {
        const assets = Object.values(this.assetMap);
        if (!assets.length) {
            this.queryAllAssets();
            return Object.values(this.assetMap);
        }
        return assets;
    }
    // 资源依赖关系缓存, { uuid: 此资源依赖的资源 uuid 数组}
    depend = {};
    // 资源的被依赖关系缓存，{ uuid: 依赖此资源的资源 uuid 数组}
    dependedMap = {};
    meta = {};
    // 缓存地址
    cacheTempDir = (0, path_1.join)(builder_config_1.default.projectTempDir, 'asset-db');
    assetMtimeCache = {};
    assetMtimeCacheFile = (0, path_1.join)(builder_config_1.default.projectTempDir, 'builder', 'assets-mtime.json');
    // 是否使用缓存开关
    useCache = true;
    // 收集反序列化过程出现异常的资源 map （不缓存）
    hasMissingClassUuids = new Set();
    hasMissingAssetsUuids = new Set();
    // 存储 asset path 与 uuid 索引关系
    pathToUuid = {};
    // 默认的序列化选项
    defaultSerializedOptions = {
        compressUuid: true, // 是否是作为正式打包导出的序列化操作
        stringify: false, // 序列化出来的以 json 字符串形式还是 json 对象显示,这个要写死统一，否则对 json 做处理的时候都需要做类型判断
        dontStripDefault: false,
        useCCON: false,
        keepNodeUuid: false, // 序列化后是否保留节点组件的 uuid 数据
    };
    async initMtimeCache() {
        if ((0, fs_extra_1.existsSync)(this.assetMtimeCacheFile)) {
            try {
                this.assetMtimeCache = (await (0, fs_extra_1.readJSON)(this.assetMtimeCacheFile)) || {};
            }
            catch (error) { }
        }
    }
    async saveMtimeCache() {
        await (0, fs_extra_1.outputJSON)(this.assetMtimeCacheFile, this.assetMtimeCache);
    }
    /**
     * 资源管理器初始化
     */
    async init() {
        this.queryAllAssets();
        // TODO 允许外部修改
        this.defaultSerializedOptions.keepNodeUuid = false;
        this.useCache = true;
        console.debug(`init custom config: keepNodeUuid: ${this.defaultSerializedOptions.keepNodeUuid}, useCache: ${this.useCache}`);
        await this.initMtimeCache();
    }
    /**
     * 查询全部资源，包括子资源
     * @returns
     */
    queryAllAssets() {
        const assetMap = {};
        const assetDBMap = asset_db_1.default.assetDBMap;
        // 循环每一个已经启动的 database
        for (const name in assetDBMap) {
            const database = assetDBMap[name];
            for (const asset of database.uuid2asset.values()) {
                (0, utils_1.recursively)(asset, (asset) => {
                    assetMap[asset.uuid] = asset;
                });
            }
        }
        this.assetMap = assetMap;
        return this.assets;
    }
    /**
     * 获取资源的缓存目录
     * @param uuid
     */
    getAssetTempDirByUuid(uuid) {
        // 缓存目录需要根据 db 目录的不同发生变化
        const dbName = this.getAsset(uuid)._assetDB.options.name;
        return (0, path_1.join)(this.cacheTempDir, dbName, uuid.substr(0, 2), uuid, 'build' + CACHE_VERSION);
    }
    /**
     * 删除一个资源的缓存
     * @param uuid
     */
    clearAsset(uuid) {
        // 移除缓存的序列化信息
        const cacheFile = this.getAssetTempDirByUuid(uuid);
        if (cacheFile && (0, fs_extra_1.existsSync)(cacheFile)) {
            (0, fs_extra_1.removeSync)(cacheFile);
        }
        delete this.depend[uuid];
        // 移除 depend 里面的引用的相关 uuid 数据
        Object.keys(this.depend).forEach((uuid) => {
            const uuids = this.depend[uuid];
            uuids.includes(uuid) && uuids.splice(0, uuids.indexOf(uuid));
        });
    }
    /**
     * 查询一个资源的 meta 数据
     * @param uuid
     */
    getMeta(uuid) {
        if (this.meta[uuid] !== undefined) {
            return this.meta[uuid];
        }
        return this.meta[uuid] = asset_1.default.queryAssetMeta(uuid);
    }
    addMeta(uuid, meta) {
        meta && (this.meta[uuid] = meta);
    }
    getAsset(uuid) {
        return this.assetMap[uuid] || asset_1.default.queryAsset(uuid);
    }
    queryAssetsByOptions(options) {
        return asset_1.default.queryAssets(options);
    }
    async queryAssetUsers(uuid) {
        if (this.dependedMap[uuid]) {
            return this.dependedMap[uuid];
        }
        this.dependedMap[uuid] = await asset_1.default.queryAssetUsers(uuid) || [];
        return this.dependedMap[uuid];
    }
    /**
 * 获取一个资源的 asset info 数据
 * @param uuid
 */
    getAssetInfo(uuid, dataKeys = ['subAssets', 'mtime', 'meta', 'depends']) {
        return asset_1.default.queryAssetInfo(uuid, dataKeys);
    }
    /**
     * 查询一个资源依赖的其他资源的方法
     * @param uuid
     */
    async getDependUuids(uuid) {
        if (this.depend[uuid]) {
            return this.depend[uuid];
        }
        const asset = this.getAsset(uuid);
        if (!asset) {
            return [];
        }
        // cc.SceneAsset cc.Prefab 类型不可使用 db 缓存的依赖信息，因为存储了脚本信息，相关的更新机制目前有问题，获取的数据会有冗余
        if (!['cc.SceneAsset', 'cc.Prefab'].includes(asset_1.default.queryAssetProperty(asset, 'type'))) {
            this.depend[uuid] = await asset_1.default.queryAssetDependencies(uuid) || [];
            return this.depend[uuid];
        }
        await this.getRawInstance(asset);
        return this.depend[uuid] || [];
    }
    /**
     * 深度获取指定 uuid 资源的依赖资源 uuid 列表
     * @param uuid
     */
    async getDependUuidsDeep(uuid) {
        let result = [];
        let temp = [];
        const depends = await this.getDependUuids(uuid);
        if (!depends) {
            return [];
        }
        temp = [...depends];
        result = [...depends];
        do {
            const res = [];
            for (const subUuid of temp) {
                const depend = await this.getDependUuids(subUuid);
                res.push(...depend);
            }
            // 剔除已存在的资源避免循环依赖时的死循环
            temp = res.filter((uuid) => !result.includes(uuid));
            result.push(...temp);
        } while (temp.length > 0);
        return Array.from(new Set(result));
    }
    /**
     * 获取某个资源的反序列化对象
     * @param uuid
     */
    async getInstance(asset) {
        if (!asset) {
            return null;
        }
        const instanceResult = await this.getRawInstance(asset);
        return instanceResult.asset;
    }
    /**
     * 获取重新序列化后的即将输出的 JSON 数据
     * @param uuid
     * @param options
     * @returns
     */
    async getSerializedJSON(uuid, options) {
        const asset = this.getAsset(uuid);
        if (!asset || !asset.meta.files.includes('.json')) {
            return null;
        }
        // 构建缓存的文件夹
        const cacheFile = (0, path_1.join)(this.getAssetTempDirByUuid(uuid), `${options.debug ? 'debug' : 'release'}.json`);
        if (this.checkUseCache(asset) && (0, fs_extra_1.existsSync)(cacheFile)) {
            try {
                return await (0, fs_extra_1.readJSON)(cacheFile);
            }
            catch (error) {
                unExpectException(error);
            }
        }
        const result = await this.getRawInstance(asset);
        if (!result.asset) {
            console.error(i18n_1.default.t('builder.error.get_asset_json_failed', {
                url: asset.url,
                type: asset_1.default.queryAssetProperty(asset, 'type'),
            }));
            return null;
        }
        const jsonObject = this.serialize(result.asset, options);
        try {
            // 如果上一步读取缓存有失败，后续不再保存缓存
            if (this.checkCanSaveCache(asset.uuid)) {
                await (0, fs_extra_1.outputJSON)(cacheFile, jsonObject, {
                    spaces: 4,
                });
                this.assetMtimeCache[asset.uuid] = asset_1.default.queryAssetProperty(asset, 'mtime');
            }
        }
        catch (error) {
            unExpectException(error);
        }
        return jsonObject;
    }
    /**
     * 直接生成某个资源的构建后数据
     * @param uuid
     * @param debug
     */
    async outputAssets(uuid, dest, debug) {
        const cacheFile = (0, path_1.join)(this.getAssetTempDirByUuid(uuid), `${debug ? 'debug' : 'release'}.json`);
        try {
            if (this.checkCanSaveCache(uuid)) {
                await (0, fs_extra_1.copy)(cacheFile, dest);
                return;
            }
        }
        catch (error) {
            unExpectException(error);
        }
        const jsonObject = this.getSerializedJSON(uuid, {
            debug,
        });
        if (!jsonObject) {
            return;
        }
        try {
            await (0, fs_extra_1.outputJSON)(cacheFile, jsonObject);
            (0, fs_extra_1.copy)(cacheFile, dest);
        }
        catch (error) {
            unExpectException(error);
            await (0, fs_extra_1.outputJSON)(dest, jsonObject);
        }
    }
    async outputCCONAsset(uuid, dest, options) {
        const instanceRes = await this.getRawInstance(this.getAsset(uuid));
        if (!instanceRes || !instanceRes.asset) {
            console.error(`get instance (${uuid}) failed!`);
            return;
        }
        // 目前所有 CCON 资产在资产库里面的后缀都是 .bin
        // 后面如果调整了这里要对应调整。
        // 断言一下，确保没问题。
        const originalDest = dest;
        const originalExtname = (0, path_1.extname)(originalDest);
        (0, assert_1.default)(originalExtname === '.bin');
        const baseName = (0, path_1.basename)(originalDest, originalExtname);
        const fullBaseName = (0, path_1.join)((0, path_1.dirname)(originalDest), baseName);
        const ccon = exports.buildAssetLibrary.serialize(instanceRes.asset, {
            debug: options.debug,
            useCCONB: true,
            dontStripDefault: false,
            _exporting: true,
        });
        (0, assert_1.default)(ccon instanceof serialization_1.CCON);
        try {
            await (0, cconb_1.outputCCONFormat)(ccon, fullBaseName);
        }
        catch (error) {
            console.error(error);
            console.error(`outputCCONFormat with asset:(${uuid}) failed!`);
        }
    }
    /**
     * 获取某个资源的构建后序列化数据
     * @param uuid
     */
    serialize(instance, options) {
        if (!instance) {
            return null;
        }
        // 调用 effect 编译器来做 effect 多余数据剔除，不走数据缓存，每次重新剔除生成
        if (instance instanceof cc_1.EffectAsset) {
            const { stripEditorSupport } = require((0, path_1.join)(__dirname, '../../../../assets/effect-compiler/utils.js'));
            instance = stripEditorSupport(instance, options['cc.EffectAsset']);
        }
        // TODO: 引擎 https://github.com/cocos/cocos-engine/issues/14613 该 issue 正式修复关闭后，这段代码可以移除
        // HACK 剔除勾选了 light.staticSettings.editorOnly 的灯光组件
        if (instance instanceof cc_1.SceneAsset) {
            const nodes = instance.scene?.children || [];
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                const comps = node.getComponentsInChildren(cc_1.LightComponent);
                comps.forEach((comp) => {
                    if (comp.staticSettings?.editorOnly) {
                        comp._destroyImmediate();
                    }
                });
            }
        }
        // 重新反序列化并保存
        return (options.useCCONB ? EditorExtends.serialize : EditorExtends.serializeCompiled)(instance, Object.assign(this.defaultSerializedOptions, {
            compressUuid: !options.debug,
            useCCON: options.useCCONB,
            noNativeDep: !instance._native, // 表明该资源是否存在原生依赖，这个字段在运行时会影响 preload 相关接口的表现
        }));
    }
    /**
     * 获取反序列化后的原始对象
     * @param uuid
     */
    async getRawInstance(asset) {
        const result = {
            asset: null,
            detail: null,
        };
        if (asset.invalid) {
            console.error(i18n_1.default.t('builder.error.asset_import_failed', {
                url: `{asset(${asset.url})}`,
                type: asset_1.default.queryAssetProperty(asset, 'type'),
            }));
            return result;
        }
        const jsonSrc = asset.meta.files.includes('.json') ? asset.library + '.json' : '';
        const cconbSrc = (0, cconb_1.getCCONFormatAssetInLibrary)(asset);
        if (!jsonSrc && !cconbSrc) {
            // TODO 由于目前无法确认，.json 不存在是由于资源本身如此还是因为导入器 bug，只能先 debug 打印
            console.debug(i18n_1.default.t('builder.warn.no_serialized_json', {
                url: `{asset(${asset.url})}`,
                type: asset_1.default.queryAssetProperty(asset, 'type'),
            }));
            return result;
        }
        const data = jsonSrc ? await (0, fs_extra_1.readJSON)(jsonSrc) : await (0, cconb_utils_1.transformCCON)(cconbSrc);
        return this.getRawInstanceFromData(data, asset);
    }
    getRawInstanceFromData(data, asset) {
        const result = {
            asset: null,
            detail: null,
        };
        const deserializeDetails = new cc.deserialize.Details();
        // detail 里面的数组分别一一对应，并且指向 asset 依赖资源的对象，不可随意更改 / 排序
        deserializeDetails.reset();
        const MissingClass = EditorExtends.MissingReporter.classInstance;
        MissingClass.hasMissingClass = false;
        const deserializedAsset = (0, cc_1.deserialize)(data, deserializeDetails, {
            createAssetRefs: true,
            ignoreEditorOnly: true,
            classFinder: MissingClass.classFinder,
        });
        if (!deserializedAsset) {
            console.error(i18n_1.default.t('builder.error.deserialize_failed', {
                url: `{asset(${asset.url})}`,
            }));
            return result;
        }
        // reportMissingClass 会根据 _uuid 来做判断，需要在调用 reportMissingClass 之前赋值
        deserializedAsset._uuid = asset.uuid;
        if (MissingClass.hasMissingClass && !this.hasMissingClassUuids.has(asset.uuid)) {
            MissingClass.reportMissingClass(deserializedAsset);
            this.hasMissingClassUuids.add(asset.uuid);
        }
        // 清空缓存，防止内存泄漏
        MissingClass.reset();
        // 预览时只需找出依赖的资源，无需缓存 asset
        // 检查以及查找对应资源，并返回给对应 asset 数据
        // const missingAssets: string[] = [];
        // 根据这个方法分配假的资源对象, 确保序列化时资源能被重新序列化成 uuid
        const test = this;
        let missingAssetReporter = null;
        deserializeDetails.assignAssetsBy(function (uuid, options) {
            const asset = test.getAsset(uuid);
            if (asset) {
                return EditorExtends.serialize.asAsset(uuid);
            }
            else {
                // if (!missingAssets.includes(uuid)) {
                //     missingAssets.push(uuid);
                test.hasMissingAssetsUuids.add(uuid);
                if (options && options.owner) {
                    missingAssetReporter = missingAssetReporter || new EditorExtends.MissingReporter.object(deserializedAsset);
                    missingAssetReporter.outputLevel = 'warn';
                    missingAssetReporter.stashByOwner(options.owner, options.prop, EditorExtends.serialize.asAsset(uuid, options.type));
                }
                // }
                // remove deleted asset reference
                return null;
            }
        });
        if (missingAssetReporter) {
            missingAssetReporter.reportByOwner();
        }
        // if (missingAssets.length > 0) {
        //     console.warn(
        //         i18n.t('builder.error.required_asset_missing', {
        //             url: `{asset(${asset.url})}`,
        //             uuid: missingAssets.join('\n '),
        //         }),
        //     );
        // }
        // https://github.com/cocos-creator/3d-tasks/issues/6042 处理 prefab 与 scene 名称同步问题
        if (['cc.SceneAsset', 'cc.Prefab'].includes(asset_1.default.queryAssetProperty(asset, 'type'))) {
            deserializedAsset.name = (0, path_1.basename)(asset.source, (0, path_1.extname)(asset.source));
        }
        result.asset = deserializedAsset;
        result.detail = deserializeDetails;
        this.depend[asset.uuid] = [...new Set(deserializeDetails.uuidList)];
        return result;
    }
    /**
     * 重置
     */
    reset() {
        this.assetMap = {};
        this.meta = {};
        this.depend = {};
        this.dependedMap = {};
        this.hasMissingClassUuids.clear();
        this.hasMissingAssetsUuids.clear();
    }
    checkUseCache(asset) {
        // 场景、prefab 资源的缓存，在发生脚本变化后就需要失效, effect 目前有构建剔除机制暂时不缓存结果
        if (!this.useCache || (['cc.SceneAsset', 'cc.Prefab', 'cc.EffectAsset'].includes(asset_1.default.queryAssetProperty(asset, 'type')))) {
            return false;
        }
        return true;
    }
    checkCanSaveCache(uuid) {
        // 场景、prefab 资源的缓存，在发生脚本变化后就需要失效
        if (this.hasMissingClassUuids.has(uuid) || this.hasMissingClassUuids.has(uuid)) {
            return false;
        }
        return true;
    }
    getAssetProperty = asset_1.default.queryAssetProperty;
    url2uuid = asset_1.default.url2uuid;
}
exports.buildAssetLibrary = new BuildAssetLibrary();
function unExpectException(error) {
    console.debug(error);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQtbGlicmFyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2J1aWxkZXIvd29ya2VyL2J1aWxkZXIvbWFuYWdlci9hc3NldC1saWJyYXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7O0FBRWIsdUNBQThFO0FBQzlFLCtCQUF3RDtBQUN4RCwyREFBK0M7QUFDL0MsK0NBQThDO0FBQzlDLDJCQUFrRztBQUNsRyxvQ0FBdUM7QUFDdkMsb0RBQTRCO0FBQzVCLDBDQUErRTtBQUUvRSw2RUFBNEQ7QUFFNUQsbUZBQWlFO0FBQ2pFLG1GQUEwRDtBQUMxRCxpRUFBeUM7QUFFekMsUUFBUTtBQUNSLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQztBQUU5Qjs7O0dBR0c7QUFDSCxNQUFNLGlCQUFpQjtJQUNuQiw2Q0FBNkM7SUFDckMsUUFBUSxHQUEyQixFQUFFLENBQUM7SUFFOUMsSUFBVyxNQUFNO1FBQ2IsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEIsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELHNDQUFzQztJQUM5QixNQUFNLEdBQW1CLEVBQUUsQ0FBQztJQUNwQyx1Q0FBdUM7SUFDL0IsV0FBVyxHQUFtQixFQUFFLENBQUM7SUFFakMsSUFBSSxHQUFhLEVBQUUsQ0FBQztJQUU1QixPQUFPO0lBQ0MsWUFBWSxHQUFXLElBQUEsV0FBSSxFQUFDLHdCQUFhLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3RFLGVBQWUsR0FB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O0lBRU0sZ0JBQWdCLEdBQUcsZUFBWSxDQUFDLGtCQUFrQixDQUFDO0lBQ25ELFFBQVEsR0FBRyxlQUFZLENBQUMsUUFBUSxDQUFDO0NBQzNDO0FBQ1ksUUFBQSxpQkFBaUIsR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7QUFFekQsU0FBUyxpQkFBaUIsQ0FBQyxLQUFVO0lBQ2pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IHJlYWRKU09OLCBleGlzdHNTeW5jLCBvdXRwdXRKU09OLCByZW1vdmVTeW5jLCBjb3B5IH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBiYXNlbmFtZSwgZGlybmFtZSwgZXh0bmFtZSwgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBDQ09OIH0gZnJvbSAnY2MvZWRpdG9yL3NlcmlhbGl6YXRpb24nO1xyXG5pbXBvcnQgeyB0cmFuc2Zvcm1DQ09OIH0gZnJvbSAnLi9jY29uYi11dGlscyc7XHJcbmltcG9ydCB7IGRlc2VyaWFsaXplLCBFZmZlY3RBc3NldCwgQXNzZXQgYXMgQ0NBc3NldCwgU2NlbmVBc3NldCwgTGlnaHRDb21wb25lbnQsIE5vZGUgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IHJlY3Vyc2l2ZWx5IH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XHJcbmltcG9ydCB7IGdldENDT05Gb3JtYXRBc3NldEluTGlicmFyeSwgb3V0cHV0Q0NPTkZvcm1hdCB9IGZyb20gJy4uL3V0aWxzL2Njb25iJztcclxuaW1wb3J0IHsgSUFzc2V0SW5mbywgSU1ldGFNYXAsIElTZXJpYWxpemVkT3B0aW9ucywgSVV1aWREZXBlbmRNYXAsIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCBhc3NldE1hbmFnZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXNzZXRzL21hbmFnZXIvYXNzZXQnO1xyXG5pbXBvcnQgeyBJQXNzZXQsIFF1ZXJ5QXNzZXRzT3B0aW9uLCBJQXNzZXRJbmZvIGFzIElBc3NldEluZm9Gcm9tREIgfSBmcm9tICcuLi8uLi8uLi8uLi9hc3NldHMvQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCBhc3NldERCTWFuYWdlciBmcm9tICcuLi8uLi8uLi8uLi9hc3NldHMvbWFuYWdlci9hc3NldC1kYic7XHJcbmltcG9ydCBidWlsZGVyQ29uZmlnIGZyb20gJy4uLy4uLy4uL3NoYXJlL2J1aWxkZXItY29uZmlnJztcclxuaW1wb3J0IGkxOG4gZnJvbSAnLi4vLi4vLi4vLi4vYmFzZS9pMThuJztcclxuXHJcbi8vIOeJiOacrOWPt+iusOW9lVxyXG5jb25zdCBDQUNIRV9WRVJTSU9OID0gJzEuMC4xJztcclxuXHJcbi8qKlxyXG4gKiDotYTmupDnrqHnkIblmajvvIzkuLvopoHotJ/otKPotYTmupDnmoTnvJPlrZjmm7TmlrBcclxuICogVE9ETyDpnIDopoHov4Hnp7vliLAgYXNzZXQtZGIg6YeM6Z2iXHJcbiAqL1xyXG5jbGFzcyBCdWlsZEFzc2V0TGlicmFyeSB7XHJcbiAgICAvLyDotYTmupDntKLlvJXnvJPlrZjvvIzlj6rorrDlvZXlvJXnlKjvvIzkuI3pnIDopoHmi4Xlv4PnvJPlrZjmlbDmja7lhoXlrZjvvIzpnIDopoHms6jmhI8gcmVzZXQg6YG/5YWN5YaF5a2Y5rOE5ryPXHJcbiAgICBwcml2YXRlIGFzc2V0TWFwOiBSZWNvcmQ8c3RyaW5nLCBJQXNzZXQ+ID0ge307XHJcblxyXG4gICAgcHVibGljIGdldCBhc3NldHMoKSB7XHJcbiAgICAgICAgY29uc3QgYXNzZXRzID0gT2JqZWN0LnZhbHVlcyh0aGlzLmFzc2V0TWFwKTtcclxuICAgICAgICBpZiAoIWFzc2V0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5xdWVyeUFsbEFzc2V0cygpO1xyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmFzc2V0TWFwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFzc2V0cztcclxuICAgIH1cclxuXHJcbiAgICAvLyDotYTmupDkvp3otZblhbPns7vnvJPlrZgsIHsgdXVpZDog5q2k6LWE5rqQ5L6d6LWW55qE6LWE5rqQIHV1aWQg5pWw57uEfVxyXG4gICAgcHJpdmF0ZSBkZXBlbmQ6IElVdWlkRGVwZW5kTWFwID0ge307XHJcbiAgICAvLyDotYTmupDnmoTooqvkvp3otZblhbPns7vnvJPlrZjvvIx7IHV1aWQ6IOS+nei1luatpOi1hOa6kOeahOi1hOa6kCB1dWlkIOaVsOe7hH1cclxuICAgIHByaXZhdGUgZGVwZW5kZWRNYXA6IElVdWlkRGVwZW5kTWFwID0ge307XHJcblxyXG4gICAgcHJpdmF0ZSBtZXRhOiBJTWV0YU1hcCA9IHt9O1xyXG5cclxuICAgIC8vIOe8k+WtmOWcsOWdgFxyXG4gICAgcHJpdmF0ZSBjYWNoZVRlbXBEaXI6IHN0cmluZyA9IGpvaW4oYnVpbGRlckNvbmZpZy5wcm9qZWN0VGVtcERpciwgJ2Fzc2V0LWRiJyk7XHJcbiAgICBwcml2YXRlIGFzc2V0TXRpbWVDYWNoZTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xyXG4gICAgcHJpdmF0ZSBhc3NldE10aW1lQ2FjaGVGaWxlOiBzdHJpbmcgPSBqb2luKGJ1aWxkZXJDb25maWcucHJvamVjdFRlbXBEaXIsICdidWlsZGVyJywgJ2Fzc2V0cy1tdGltZS5qc29uJyk7XHJcblxyXG4gICAgLy8g5piv5ZCm5L2/55So57yT5a2Y5byA5YWzXHJcbiAgICBwdWJsaWMgdXNlQ2FjaGUgPSB0cnVlO1xyXG5cclxuICAgIC8vIOaUtumbhuWPjeW6j+WIl+WMlui/h+eoi+WHuueOsOW8guW4uOeahOi1hOa6kCBtYXAg77yI5LiN57yT5a2Y77yJXHJcbiAgICBwcml2YXRlIGhhc01pc3NpbmdDbGFzc1V1aWRzID0gbmV3IFNldCgpO1xyXG4gICAgcHJpdmF0ZSBoYXNNaXNzaW5nQXNzZXRzVXVpZHMgPSBuZXcgU2V0KCk7XHJcbiAgICAvLyDlrZjlgqggYXNzZXQgcGF0aCDkuI4gdXVpZCDntKLlvJXlhbPns7tcclxuICAgIHB1YmxpYyBwYXRoVG9VdWlkOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XHJcblxyXG4gICAgLy8g6buY6K6k55qE5bqP5YiX5YyW6YCJ6aG5XHJcbiAgICBwcml2YXRlIGRlZmF1bHRTZXJpYWxpemVkT3B0aW9ucyA9IHtcclxuICAgICAgICBjb21wcmVzc1V1aWQ6IHRydWUsIC8vIOaYr+WQpuaYr+S9nOS4uuato+W8j+aJk+WMheWvvOWHuueahOW6j+WIl+WMluaTjeS9nFxyXG4gICAgICAgIHN0cmluZ2lmeTogZmFsc2UsIC8vIOW6j+WIl+WMluWHuuadpeeahOS7pSBqc29uIOWtl+espuS4suW9ouW8j+i/mOaYryBqc29uIOWvueixoeaYvuekuizov5nkuKropoHlhpnmrbvnu5/kuIDvvIzlkKbliJnlr7kganNvbiDlgZrlpITnkIbnmoTml7blgJnpg73pnIDopoHlgZrnsbvlnovliKTmlq1cclxuICAgICAgICBkb250U3RyaXBEZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICB1c2VDQ09OOiBmYWxzZSxcclxuICAgICAgICBrZWVwTm9kZVV1aWQ6IGZhbHNlLCAvLyDluo/liJfljJblkI7mmK/lkKbkv53nlZnoioLngrnnu4Tku7bnmoQgdXVpZCDmlbDmja5cclxuICAgIH07XHJcblxyXG4gICAgYXN5bmMgaW5pdE10aW1lQ2FjaGUoKSB7XHJcbiAgICAgICAgaWYgKGV4aXN0c1N5bmModGhpcy5hc3NldE10aW1lQ2FjaGVGaWxlKSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hc3NldE10aW1lQ2FjaGUgPSAoYXdhaXQgcmVhZEpTT04odGhpcy5hc3NldE10aW1lQ2FjaGVGaWxlKSkgfHwge307XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7IH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgc2F2ZU10aW1lQ2FjaGUoKSB7XHJcbiAgICAgICAgYXdhaXQgb3V0cHV0SlNPTih0aGlzLmFzc2V0TXRpbWVDYWNoZUZpbGUsIHRoaXMuYXNzZXRNdGltZUNhY2hlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOi1hOa6kOeuoeeQhuWZqOWIneWni+WMllxyXG4gICAgICovXHJcbiAgICBhc3luYyBpbml0KCkge1xyXG4gICAgICAgIHRoaXMucXVlcnlBbGxBc3NldHMoKTtcclxuICAgICAgICAvLyBUT0RPIOWFgeiuuOWklumDqOS/ruaUuVxyXG4gICAgICAgIHRoaXMuZGVmYXVsdFNlcmlhbGl6ZWRPcHRpb25zLmtlZXBOb2RlVXVpZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudXNlQ2FjaGUgPSB0cnVlO1xyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoYGluaXQgY3VzdG9tIGNvbmZpZzoga2VlcE5vZGVVdWlkOiAke3RoaXMuZGVmYXVsdFNlcmlhbGl6ZWRPcHRpb25zLmtlZXBOb2RlVXVpZH0sIHVzZUNhY2hlOiAke3RoaXMudXNlQ2FjaGV9YCk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5pbml0TXRpbWVDYWNoZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5p+l6K+i5YWo6YOo6LWE5rqQ77yM5YyF5ous5a2Q6LWE5rqQXHJcbiAgICAgKiBAcmV0dXJucyBcclxuICAgICAqL1xyXG4gICAgcXVlcnlBbGxBc3NldHMoKSB7XHJcbiAgICAgICAgY29uc3QgYXNzZXRNYXA6IFJlY29yZDxzdHJpbmcsIElBc3NldD4gPSB7fTtcclxuICAgICAgICBjb25zdCBhc3NldERCTWFwID0gYXNzZXREQk1hbmFnZXIuYXNzZXREQk1hcDtcclxuICAgICAgICAvLyDlvqrnjq/mr4/kuIDkuKrlt7Lnu4/lkK/liqjnmoQgZGF0YWJhc2VcclxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gYXNzZXREQk1hcCkge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhYmFzZSA9IGFzc2V0REJNYXBbbmFtZV07XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgYXNzZXQgb2YgZGF0YWJhc2UudXVpZDJhc3NldC52YWx1ZXMoKSkge1xyXG4gICAgICAgICAgICAgICAgcmVjdXJzaXZlbHkoYXNzZXQsIChhc3NldDogSUFzc2V0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXRNYXBbYXNzZXQudXVpZF0gPSBhc3NldDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYXNzZXRNYXAgPSBhc3NldE1hcDtcclxuICAgICAgICByZXR1cm4gdGhpcy5hc3NldHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5botYTmupDnmoTnvJPlrZjnm67lvZVcclxuICAgICAqIEBwYXJhbSB1dWlkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRBc3NldFRlbXBEaXJCeVV1aWQodXVpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgLy8g57yT5a2Y55uu5b2V6ZyA6KaB5qC55o2uIGRiIOebruW9leeahOS4jeWQjOWPkeeUn+WPmOWMllxyXG4gICAgICAgIGNvbnN0IGRiTmFtZSA9IHRoaXMuZ2V0QXNzZXQodXVpZCkuX2Fzc2V0REIub3B0aW9ucy5uYW1lO1xyXG4gICAgICAgIHJldHVybiBqb2luKHRoaXMuY2FjaGVUZW1wRGlyLCBkYk5hbWUsIHV1aWQuc3Vic3RyKDAsIDIpLCB1dWlkLCAnYnVpbGQnICsgQ0FDSEVfVkVSU0lPTik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliKDpmaTkuIDkuKrotYTmupDnmoTnvJPlrZhcclxuICAgICAqIEBwYXJhbSB1dWlkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjbGVhckFzc2V0KHV1aWQ6IHN0cmluZykge1xyXG4gICAgICAgIC8vIOenu+mZpOe8k+WtmOeahOW6j+WIl+WMluS/oeaBr1xyXG4gICAgICAgIGNvbnN0IGNhY2hlRmlsZSA9IHRoaXMuZ2V0QXNzZXRUZW1wRGlyQnlVdWlkKHV1aWQpO1xyXG4gICAgICAgIGlmIChjYWNoZUZpbGUgJiYgZXhpc3RzU3luYyhjYWNoZUZpbGUpKSB7XHJcbiAgICAgICAgICAgIHJlbW92ZVN5bmMoY2FjaGVGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuZGVwZW5kW3V1aWRdO1xyXG4gICAgICAgIC8vIOenu+mZpCBkZXBlbmQg6YeM6Z2i55qE5byV55So55qE55u45YWzIHV1aWQg5pWw5o2uXHJcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5kZXBlbmQpLmZvckVhY2goKHV1aWQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdXVpZHMgPSB0aGlzLmRlcGVuZFt1dWlkXTtcclxuICAgICAgICAgICAgdXVpZHMuaW5jbHVkZXModXVpZCkgJiYgdXVpZHMuc3BsaWNlKDAsIHV1aWRzLmluZGV4T2YodXVpZCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5p+l6K+i5LiA5Liq6LWE5rqQ55qEIG1ldGEg5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gdXVpZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0TWV0YSh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAodGhpcy5tZXRhW3V1aWRdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWV0YVt1dWlkXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm1ldGFbdXVpZF0gPSBhc3NldE1hbmFnZXIucXVlcnlBc3NldE1ldGEodXVpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZE1ldGEodXVpZDogc3RyaW5nLCBtZXRhOiBhbnkpIHtcclxuICAgICAgICBtZXRhICYmICh0aGlzLm1ldGFbdXVpZF0gPSBtZXRhKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0QXNzZXQodXVpZDogc3RyaW5nKTogSUFzc2V0IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hc3NldE1hcFt1dWlkXSB8fCBhc3NldE1hbmFnZXIucXVlcnlBc3NldCh1dWlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcXVlcnlBc3NldHNCeU9wdGlvbnMob3B0aW9uczogUXVlcnlBc3NldHNPcHRpb24pOiBJQXNzZXRbXSB7XHJcbiAgICAgICAgcmV0dXJuIGFzc2V0TWFuYWdlci5xdWVyeUFzc2V0cyhvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgcXVlcnlBc3NldFVzZXJzKHV1aWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcclxuICAgICAgICBpZiAodGhpcy5kZXBlbmRlZE1hcFt1dWlkXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZXBlbmRlZE1hcFt1dWlkXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kZXBlbmRlZE1hcFt1dWlkXSA9IGF3YWl0IGFzc2V0TWFuYWdlci5xdWVyeUFzc2V0VXNlcnModXVpZCkgfHwgW107XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVwZW5kZWRNYXBbdXVpZF07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAqIOiOt+WPluS4gOS4qui1hOa6kOeahCBhc3NldCBpbmZvIOaVsOaNrlxyXG4gKiBAcGFyYW0gdXVpZFxyXG4gKi9cclxuICAgIHB1YmxpYyBnZXRBc3NldEluZm8odXVpZDogc3RyaW5nLCBkYXRhS2V5czogKGtleW9mIElBc3NldEluZm9Gcm9tREIpW10gPSBbJ3N1YkFzc2V0cycsICdtdGltZScsICdtZXRhJywgJ2RlcGVuZHMnXSkge1xyXG4gICAgICAgIHJldHVybiBhc3NldE1hbmFnZXIucXVlcnlBc3NldEluZm8odXVpZCwgZGF0YUtleXMpIGFzIHVua25vd24gYXMgSUFzc2V0SW5mbztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOafpeivouS4gOS4qui1hOa6kOS+nei1lueahOWFtuS7lui1hOa6kOeahOaWueazlVxyXG4gICAgICogQHBhcmFtIHV1aWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIGdldERlcGVuZFV1aWRzKHV1aWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcclxuICAgICAgICBpZiAodGhpcy5kZXBlbmRbdXVpZF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVwZW5kW3V1aWRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBhc3NldCA9IHRoaXMuZ2V0QXNzZXQodXVpZCk7XHJcbiAgICAgICAgaWYgKCFhc3NldCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNjLlNjZW5lQXNzZXQgY2MuUHJlZmFiIOexu+Wei+S4jeWPr+S9v+eUqCBkYiDnvJPlrZjnmoTkvp3otZbkv6Hmga/vvIzlm6DkuLrlrZjlgqjkuobohJrmnKzkv6Hmga/vvIznm7jlhbPnmoTmm7TmlrDmnLrliLbnm67liY3mnInpl67popjvvIzojrflj5bnmoTmlbDmja7kvJrmnInlhpfkvZlcclxuICAgICAgICBpZiAoIVsnY2MuU2NlbmVBc3NldCcsICdjYy5QcmVmYWInXS5pbmNsdWRlcyhhc3NldE1hbmFnZXIucXVlcnlBc3NldFByb3BlcnR5KGFzc2V0LCAndHlwZScpKSkge1xyXG4gICAgICAgICAgICB0aGlzLmRlcGVuZFt1dWlkXSA9IGF3YWl0IGFzc2V0TWFuYWdlci5xdWVyeUFzc2V0RGVwZW5kZW5jaWVzKHV1aWQpIHx8IFtdO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZXBlbmRbdXVpZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IHRoaXMuZ2V0UmF3SW5zdGFuY2UoYXNzZXQpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5kZXBlbmRbdXVpZF0gfHwgW107XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7Hluqbojrflj5bmjIflrpogdXVpZCDotYTmupDnmoTkvp3otZbotYTmupAgdXVpZCDliJfooahcclxuICAgICAqIEBwYXJhbSB1dWlkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBnZXREZXBlbmRVdWlkc0RlZXAodXVpZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xyXG4gICAgICAgIGxldCByZXN1bHQ6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgbGV0IHRlbXA6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgY29uc3QgZGVwZW5kcyA9IGF3YWl0IHRoaXMuZ2V0RGVwZW5kVXVpZHModXVpZCk7XHJcbiAgICAgICAgaWYgKCFkZXBlbmRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGVtcCA9IFsuLi5kZXBlbmRzXTtcclxuICAgICAgICByZXN1bHQgPSBbLi4uZGVwZW5kc107XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBjb25zdCByZXMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBzdWJVdWlkIG9mIHRlbXApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRlcGVuZCA9IGF3YWl0IHRoaXMuZ2V0RGVwZW5kVXVpZHMoc3ViVXVpZCk7XHJcbiAgICAgICAgICAgICAgICByZXMucHVzaCguLi5kZXBlbmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOWJlOmZpOW3suWtmOWcqOeahOi1hOa6kOmBv+WFjeW+queOr+S+nei1luaXtueahOatu+W+queOr1xyXG4gICAgICAgICAgICB0ZW1wID0gcmVzLmZpbHRlcigodXVpZCkgPT4gIXJlc3VsdC5pbmNsdWRlcyh1dWlkKSk7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKC4uLnRlbXApO1xyXG4gICAgICAgIH0gd2hpbGUgKHRlbXAubGVuZ3RoID4gMCk7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChyZXN1bHQpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluafkOS4qui1hOa6kOeahOWPjeW6j+WIl+WMluWvueixoVxyXG4gICAgICogQHBhcmFtIHV1aWRcclxuICAgICAqL1xyXG4gICAgYXN5bmMgZ2V0SW5zdGFuY2UoYXNzZXQ6IElBc3NldCkge1xyXG4gICAgICAgIGlmICghYXNzZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGluc3RhbmNlUmVzdWx0ID0gYXdhaXQgdGhpcy5nZXRSYXdJbnN0YW5jZShhc3NldCk7XHJcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlUmVzdWx0LmFzc2V0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W6YeN5paw5bqP5YiX5YyW5ZCO55qE5Y2z5bCG6L6T5Ye655qEIEpTT04g5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gdXVpZFxyXG4gICAgICogQHBhcmFtIG9wdGlvbnNcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBnZXRTZXJpYWxpemVkSlNPTih1dWlkOiBzdHJpbmcsIG9wdGlvbnM6IElTZXJpYWxpemVkT3B0aW9ucyk6IFByb21pc2U8YW55IHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGFzc2V0ID0gdGhpcy5nZXRBc3NldCh1dWlkKTtcclxuICAgICAgICBpZiAoIWFzc2V0IHx8ICFhc3NldC5tZXRhLmZpbGVzLmluY2x1ZGVzKCcuanNvbicpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDmnoTlu7rnvJPlrZjnmoTmlofku7blpLlcclxuICAgICAgICBjb25zdCBjYWNoZUZpbGUgPSBqb2luKHRoaXMuZ2V0QXNzZXRUZW1wRGlyQnlVdWlkKHV1aWQpISwgYCR7b3B0aW9ucy5kZWJ1ZyA/ICdkZWJ1ZycgOiAncmVsZWFzZSd9Lmpzb25gKTtcclxuICAgICAgICBpZiAodGhpcy5jaGVja1VzZUNhY2hlKGFzc2V0KSAmJiBleGlzdHNTeW5jKGNhY2hlRmlsZSkpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCByZWFkSlNPTihjYWNoZUZpbGUpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdW5FeHBlY3RFeGNlcHRpb24oZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZXN1bHQ6IGFueSA9IGF3YWl0IHRoaXMuZ2V0UmF3SW5zdGFuY2UoYXNzZXQpO1xyXG4gICAgICAgIGlmICghcmVzdWx0LmFzc2V0KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoaTE4bi50KCdidWlsZGVyLmVycm9yLmdldF9hc3NldF9qc29uX2ZhaWxlZCcsIHtcclxuICAgICAgICAgICAgICAgIHVybDogYXNzZXQudXJsLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogYXNzZXRNYW5hZ2VyLnF1ZXJ5QXNzZXRQcm9wZXJ0eShhc3NldCwgJ3R5cGUnKSxcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGpzb25PYmplY3QgPSB0aGlzLnNlcmlhbGl6ZShyZXN1bHQuYXNzZXQsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIOWmguaenOS4iuS4gOatpeivu+WPlue8k+WtmOacieWksei0pe+8jOWQjue7reS4jeWGjeS/neWtmOe8k+WtmFxyXG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja0NhblNhdmVDYWNoZShhc3NldC51dWlkKSkge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgb3V0cHV0SlNPTihjYWNoZUZpbGUsIGpzb25PYmplY3QsIHtcclxuICAgICAgICAgICAgICAgICAgICBzcGFjZXM6IDQsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXRNdGltZUNhY2hlW2Fzc2V0LnV1aWRdID0gYXNzZXRNYW5hZ2VyLnF1ZXJ5QXNzZXRQcm9wZXJ0eShhc3NldCwgJ210aW1lJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICB1bkV4cGVjdEV4Y2VwdGlvbihlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBqc29uT2JqZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog55u05o6l55Sf5oiQ5p+Q5Liq6LWE5rqQ55qE5p6E5bu65ZCO5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gdXVpZFxyXG4gICAgICogQHBhcmFtIGRlYnVnXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBvdXRwdXRBc3NldHModXVpZDogc3RyaW5nLCBkZXN0OiBzdHJpbmcsIGRlYnVnOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgY2FjaGVGaWxlID0gam9pbih0aGlzLmdldEFzc2V0VGVtcERpckJ5VXVpZCh1dWlkKSEsIGAke2RlYnVnID8gJ2RlYnVnJyA6ICdyZWxlYXNlJ30uanNvbmApO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrQ2FuU2F2ZUNhY2hlKHV1aWQpKSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBjb3B5KGNhY2hlRmlsZSwgZGVzdCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICB1bkV4cGVjdEV4Y2VwdGlvbihlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGpzb25PYmplY3QgPSB0aGlzLmdldFNlcmlhbGl6ZWRKU09OKHV1aWQsIHtcclxuICAgICAgICAgICAgZGVidWcsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKCFqc29uT2JqZWN0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYXdhaXQgb3V0cHV0SlNPTihjYWNoZUZpbGUsIGpzb25PYmplY3QpO1xyXG4gICAgICAgICAgICBjb3B5KGNhY2hlRmlsZSwgZGVzdCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgdW5FeHBlY3RFeGNlcHRpb24oZXJyb3IpO1xyXG4gICAgICAgICAgICBhd2FpdCBvdXRwdXRKU09OKGRlc3QsIGpzb25PYmplY3QpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgb3V0cHV0Q0NPTkFzc2V0KFxyXG4gICAgICAgIHV1aWQ6IHN0cmluZyxcclxuICAgICAgICBkZXN0OiBzdHJpbmcsXHJcbiAgICAgICAgb3B0aW9uczogSVNlcmlhbGl6ZWRPcHRpb25zLFxyXG4gICAgKSB7XHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2VSZXMgPSBhd2FpdCB0aGlzLmdldFJhd0luc3RhbmNlKHRoaXMuZ2V0QXNzZXQodXVpZCkpO1xyXG4gICAgICAgIGlmICghaW5zdGFuY2VSZXMgfHwgIWluc3RhbmNlUmVzLmFzc2V0KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGdldCBpbnN0YW5jZSAoJHt1dWlkfSkgZmFpbGVkIWApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDnm67liY3miYDmnIkgQ0NPTiDotYTkuqflnKjotYTkuqflupPph4zpnaLnmoTlkI7nvIDpg73mmK8gLmJpblxyXG4gICAgICAgIC8vIOWQjumdouWmguaenOiwg+aVtOS6hui/memHjOimgeWvueW6lOiwg+aVtOOAglxyXG4gICAgICAgIC8vIOaWreiogOS4gOS4i++8jOehruS/neayoemXrumimOOAglxyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsRGVzdCA9IGRlc3Q7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxFeHRuYW1lID0gZXh0bmFtZShvcmlnaW5hbERlc3QpO1xyXG4gICAgICAgIGFzc2VydChvcmlnaW5hbEV4dG5hbWUgPT09ICcuYmluJyk7XHJcbiAgICAgICAgY29uc3QgYmFzZU5hbWUgPSBiYXNlbmFtZShvcmlnaW5hbERlc3QsIG9yaWdpbmFsRXh0bmFtZSk7XHJcbiAgICAgICAgY29uc3QgZnVsbEJhc2VOYW1lID0gam9pbihkaXJuYW1lKG9yaWdpbmFsRGVzdCksIGJhc2VOYW1lKTtcclxuXHJcbiAgICAgICAgY29uc3QgY2NvbjogQ0NPTiA9IGJ1aWxkQXNzZXRMaWJyYXJ5LnNlcmlhbGl6ZShpbnN0YW5jZVJlcy5hc3NldCwge1xyXG4gICAgICAgICAgICBkZWJ1Zzogb3B0aW9ucy5kZWJ1ZyxcclxuICAgICAgICAgICAgdXNlQ0NPTkI6IHRydWUsXHJcbiAgICAgICAgICAgIGRvbnRTdHJpcERlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBfZXhwb3J0aW5nOiB0cnVlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGFzc2VydChjY29uIGluc3RhbmNlb2YgQ0NPTik7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYXdhaXQgb3V0cHV0Q0NPTkZvcm1hdChjY29uLCBmdWxsQmFzZU5hbWUpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBvdXRwdXRDQ09ORm9ybWF0IHdpdGggYXNzZXQ6KCR7dXVpZH0pIGZhaWxlZCFgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmn5DkuKrotYTmupDnmoTmnoTlu7rlkI7luo/liJfljJbmlbDmja5cclxuICAgICAqIEBwYXJhbSB1dWlkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXJpYWxpemUoaW5zdGFuY2U6IGFueSwgb3B0aW9uczogSVNlcmlhbGl6ZWRPcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOiwg+eUqCBlZmZlY3Qg57yW6K+R5Zmo5p2l5YGaIGVmZmVjdCDlpJrkvZnmlbDmja7liZTpmaTvvIzkuI3otbDmlbDmja7nvJPlrZjvvIzmr4/mrKHph43mlrDliZTpmaTnlJ/miJBcclxuICAgICAgICBpZiAoaW5zdGFuY2UgaW5zdGFuY2VvZiBFZmZlY3RBc3NldCkge1xyXG4gICAgICAgICAgICBjb25zdCB7IHN0cmlwRWRpdG9yU3VwcG9ydCB9ID0gcmVxdWlyZShqb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uLy4uL2Fzc2V0cy9lZmZlY3QtY29tcGlsZXIvdXRpbHMuanMnKSk7XHJcbiAgICAgICAgICAgIGluc3RhbmNlID0gc3RyaXBFZGl0b3JTdXBwb3J0KGluc3RhbmNlLCBvcHRpb25zWydjYy5FZmZlY3RBc3NldCddKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRPRE86IOW8leaTjiBodHRwczovL2dpdGh1Yi5jb20vY29jb3MvY29jb3MtZW5naW5lL2lzc3Vlcy8xNDYxMyDor6UgaXNzdWUg5q2j5byP5L+u5aSN5YWz6Zet5ZCO77yM6L+Z5q615Luj56CB5Y+v5Lul56e76ZmkXHJcbiAgICAgICAgLy8gSEFDSyDliZTpmaTli77pgInkuoYgbGlnaHQuc3RhdGljU2V0dGluZ3MuZWRpdG9yT25seSDnmoTnga/lhYnnu4Tku7ZcclxuICAgICAgICBpZiAoaW5zdGFuY2UgaW5zdGFuY2VvZiBTY2VuZUFzc2V0KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gaW5zdGFuY2Uuc2NlbmU/LmNoaWxkcmVuIHx8IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlOiBOb2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wcyA9IG5vZGUuZ2V0Q29tcG9uZW50c0luQ2hpbGRyZW4oTGlnaHRDb21wb25lbnQpO1xyXG4gICAgICAgICAgICAgICAgY29tcHMuZm9yRWFjaCgoY29tcDogTGlnaHRDb21wb25lbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcC5zdGF0aWNTZXR0aW5ncz8uZWRpdG9yT25seSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wLl9kZXN0cm95SW1tZWRpYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOmHjeaWsOWPjeW6j+WIl+WMluW5tuS/neWtmFxyXG4gICAgICAgIHJldHVybiAob3B0aW9ucy51c2VDQ09OQiA/IEVkaXRvckV4dGVuZHMuc2VyaWFsaXplIDogRWRpdG9yRXh0ZW5kcy5zZXJpYWxpemVDb21waWxlZCkoXHJcbiAgICAgICAgICAgIGluc3RhbmNlLFxyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMuZGVmYXVsdFNlcmlhbGl6ZWRPcHRpb25zLCB7XHJcbiAgICAgICAgICAgICAgICBjb21wcmVzc1V1aWQ6ICFvcHRpb25zLmRlYnVnLFxyXG4gICAgICAgICAgICAgICAgdXNlQ0NPTjogb3B0aW9ucy51c2VDQ09OQixcclxuICAgICAgICAgICAgICAgIG5vTmF0aXZlRGVwOiAhaW5zdGFuY2UuX25hdGl2ZSwgLy8g6KGo5piO6K+l6LWE5rqQ5piv5ZCm5a2Y5Zyo5Y6f55Sf5L6d6LWW77yM6L+Z5Liq5a2X5q615Zyo6L+Q6KGM5pe25Lya5b2x5ZONIHByZWxvYWQg55u45YWz5o6l5Y+j55qE6KGo546wXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blj43luo/liJfljJblkI7nmoTljp/lp4vlr7nosaFcclxuICAgICAqIEBwYXJhbSB1dWlkXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgZ2V0UmF3SW5zdGFuY2UoYXNzZXQ6IElBc3NldCkge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcclxuICAgICAgICAgICAgYXNzZXQ6IG51bGwsXHJcbiAgICAgICAgICAgIGRldGFpbDogbnVsbCxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChhc3NldC5pbnZhbGlkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAgICAgICBpMThuLnQoJ2J1aWxkZXIuZXJyb3IuYXNzZXRfaW1wb3J0X2ZhaWxlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IGB7YXNzZXQoJHthc3NldC51cmx9KX1gLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGFzc2V0TWFuYWdlci5xdWVyeUFzc2V0UHJvcGVydHkoYXNzZXQsICd0eXBlJyksXHJcbiAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGpzb25TcmMgPSBhc3NldC5tZXRhLmZpbGVzLmluY2x1ZGVzKCcuanNvbicpID8gYXNzZXQubGlicmFyeSArICcuanNvbicgOiAnJztcclxuICAgICAgICBjb25zdCBjY29uYlNyYyA9IGdldENDT05Gb3JtYXRBc3NldEluTGlicmFyeShhc3NldCk7XHJcbiAgICAgICAgaWYgKCFqc29uU3JjICYmICFjY29uYlNyYykge1xyXG4gICAgICAgICAgICAvLyBUT0RPIOeUseS6juebruWJjeaXoOazleehruiupO+8jC5qc29uIOS4jeWtmOWcqOaYr+eUseS6jui1hOa6kOacrOi6q+WmguatpOi/mOaYr+WboOS4uuWvvOWFpeWZqCBidWfvvIzlj6rog73lhYggZGVidWcg5omT5Y2wXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoXHJcbiAgICAgICAgICAgICAgICBpMThuLnQoJ2J1aWxkZXIud2Fybi5ub19zZXJpYWxpemVkX2pzb24nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBge2Fzc2V0KCR7YXNzZXQudXJsfSl9YCxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBhc3NldE1hbmFnZXIucXVlcnlBc3NldFByb3BlcnR5KGFzc2V0LCAndHlwZScpLFxyXG4gICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBkYXRhID0ganNvblNyYyA/IGF3YWl0IHJlYWRKU09OKGpzb25TcmMpIDogYXdhaXQgdHJhbnNmb3JtQ0NPTihjY29uYlNyYyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UmF3SW5zdGFuY2VGcm9tRGF0YShkYXRhLCBhc3NldCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0UmF3SW5zdGFuY2VGcm9tRGF0YShkYXRhOiBDQ09OIHwgT2JqZWN0LCBhc3NldDogSUFzc2V0KSB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0OiB7XHJcbiAgICAgICAgICAgIGFzc2V0OiBDQ0Fzc2V0IHwgbnVsbDtcclxuICAgICAgICAgICAgZGV0YWlsOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgICAgIH0gPSB7XHJcbiAgICAgICAgICAgIGFzc2V0OiBudWxsLFxyXG4gICAgICAgICAgICBkZXRhaWw6IG51bGwsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBkZXNlcmlhbGl6ZURldGFpbHMgPSBuZXcgY2MuZGVzZXJpYWxpemUuRGV0YWlscygpO1xyXG4gICAgICAgIC8vIGRldGFpbCDph4zpnaLnmoTmlbDnu4TliIbliKvkuIDkuIDlr7nlupTvvIzlubbkuJTmjIflkJEgYXNzZXQg5L6d6LWW6LWE5rqQ55qE5a+56LGh77yM5LiN5Y+v6ZqP5oSP5pu05pS5IC8g5o6S5bqPXHJcbiAgICAgICAgZGVzZXJpYWxpemVEZXRhaWxzLnJlc2V0KCk7XHJcbiAgICAgICAgY29uc3QgTWlzc2luZ0NsYXNzID0gRWRpdG9yRXh0ZW5kcy5NaXNzaW5nUmVwb3J0ZXIuY2xhc3NJbnN0YW5jZTtcclxuICAgICAgICBNaXNzaW5nQ2xhc3MuaGFzTWlzc2luZ0NsYXNzID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgZGVzZXJpYWxpemVkQXNzZXQgPSBkZXNlcmlhbGl6ZShkYXRhLCBkZXNlcmlhbGl6ZURldGFpbHMsIHtcclxuICAgICAgICAgICAgY3JlYXRlQXNzZXRSZWZzOiB0cnVlLFxyXG4gICAgICAgICAgICBpZ25vcmVFZGl0b3JPbmx5OiB0cnVlLFxyXG4gICAgICAgICAgICBjbGFzc0ZpbmRlcjogTWlzc2luZ0NsYXNzLmNsYXNzRmluZGVyLFxyXG4gICAgICAgIH0pIGFzIENDQXNzZXQ7XHJcbiAgICAgICAgaWYgKCFkZXNlcmlhbGl6ZWRBc3NldCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICAgICAgaTE4bi50KCdidWlsZGVyLmVycm9yLmRlc2VyaWFsaXplX2ZhaWxlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IGB7YXNzZXQoJHthc3NldC51cmx9KX1gLFxyXG4gICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHJlcG9ydE1pc3NpbmdDbGFzcyDkvJrmoLnmja4gX3V1aWQg5p2l5YGa5Yik5pat77yM6ZyA6KaB5Zyo6LCD55SoIHJlcG9ydE1pc3NpbmdDbGFzcyDkuYvliY3otYvlgLxcclxuICAgICAgICBkZXNlcmlhbGl6ZWRBc3NldC5fdXVpZCA9IGFzc2V0LnV1aWQ7XHJcblxyXG4gICAgICAgIGlmIChNaXNzaW5nQ2xhc3MuaGFzTWlzc2luZ0NsYXNzICYmICF0aGlzLmhhc01pc3NpbmdDbGFzc1V1aWRzLmhhcyhhc3NldC51dWlkKSkge1xyXG4gICAgICAgICAgICBNaXNzaW5nQ2xhc3MucmVwb3J0TWlzc2luZ0NsYXNzKGRlc2VyaWFsaXplZEFzc2V0KTtcclxuICAgICAgICAgICAgdGhpcy5oYXNNaXNzaW5nQ2xhc3NVdWlkcy5hZGQoYXNzZXQudXVpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOa4heepuue8k+WtmO+8jOmYsuatouWGheWtmOazhOa8j1xyXG4gICAgICAgIE1pc3NpbmdDbGFzcy5yZXNldCgpO1xyXG4gICAgICAgIC8vIOmihOiniOaXtuWPqumcgOaJvuWHuuS+nei1lueahOi1hOa6kO+8jOaXoOmcgOe8k+WtmCBhc3NldFxyXG4gICAgICAgIC8vIOajgOafpeS7peWPiuafpeaJvuWvueW6lOi1hOa6kO+8jOW5tui/lOWbnue7meWvueW6lCBhc3NldCDmlbDmja5cclxuICAgICAgICAvLyBjb25zdCBtaXNzaW5nQXNzZXRzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIC8vIOagueaNrui/meS4quaWueazleWIhumFjeWBh+eahOi1hOa6kOWvueixoSwg56Gu5L+d5bqP5YiX5YyW5pe26LWE5rqQ6IO96KKr6YeN5paw5bqP5YiX5YyW5oiQIHV1aWRcclxuICAgICAgICBjb25zdCB0ZXN0ID0gdGhpcztcclxuICAgICAgICBsZXQgbWlzc2luZ0Fzc2V0UmVwb3J0ZXI6IGFueSA9IG51bGw7XHJcbiAgICAgICAgZGVzZXJpYWxpemVEZXRhaWxzLmFzc2lnbkFzc2V0c0J5KGZ1bmN0aW9uICh1dWlkOiBzdHJpbmcsIG9wdGlvbnM6IHsgb3duZXI6IG9iamVjdDsgcHJvcDogc3RyaW5nOyB0eXBlOiBGdW5jdGlvbiB9KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0ID0gdGVzdC5nZXRBc3NldCh1dWlkKTtcclxuICAgICAgICAgICAgaWYgKGFzc2V0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gRWRpdG9yRXh0ZW5kcy5zZXJpYWxpemUuYXNBc3NldCh1dWlkKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIGlmICghbWlzc2luZ0Fzc2V0cy5pbmNsdWRlcyh1dWlkKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIG1pc3NpbmdBc3NldHMucHVzaCh1dWlkKTtcclxuICAgICAgICAgICAgICAgIHRlc3QuaGFzTWlzc2luZ0Fzc2V0c1V1aWRzLmFkZCh1dWlkKTtcclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMub3duZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBtaXNzaW5nQXNzZXRSZXBvcnRlciA9IG1pc3NpbmdBc3NldFJlcG9ydGVyIHx8IG5ldyBFZGl0b3JFeHRlbmRzLk1pc3NpbmdSZXBvcnRlci5vYmplY3QoZGVzZXJpYWxpemVkQXNzZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1pc3NpbmdBc3NldFJlcG9ydGVyLm91dHB1dExldmVsID0gJ3dhcm4nO1xyXG4gICAgICAgICAgICAgICAgICAgIG1pc3NpbmdBc3NldFJlcG9ydGVyLnN0YXNoQnlPd25lcihvcHRpb25zLm93bmVyLCBvcHRpb25zLnByb3AsIEVkaXRvckV4dGVuZHMuc2VyaWFsaXplLmFzQXNzZXQodXVpZCwgb3B0aW9ucy50eXBlKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgZGVsZXRlZCBhc3NldCByZWZlcmVuY2VcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKG1pc3NpbmdBc3NldFJlcG9ydGVyKSB7XHJcbiAgICAgICAgICAgIG1pc3NpbmdBc3NldFJlcG9ydGVyLnJlcG9ydEJ5T3duZXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaWYgKG1pc3NpbmdBc3NldHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgLy8gICAgICAgICBpMThuLnQoJ2J1aWxkZXIuZXJyb3IucmVxdWlyZWRfYXNzZXRfbWlzc2luZycsIHtcclxuICAgICAgICAvLyAgICAgICAgICAgICB1cmw6IGB7YXNzZXQoJHthc3NldC51cmx9KX1gLFxyXG4gICAgICAgIC8vICAgICAgICAgICAgIHV1aWQ6IG1pc3NpbmdBc3NldHMuam9pbignXFxuICcpLFxyXG4gICAgICAgIC8vICAgICAgICAgfSksXHJcbiAgICAgICAgLy8gICAgICk7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vY29jb3MtY3JlYXRvci8zZC10YXNrcy9pc3N1ZXMvNjA0MiDlpITnkIYgcHJlZmFiIOS4jiBzY2VuZSDlkI3np7DlkIzmraXpl67pophcclxuICAgICAgICBpZiAoWydjYy5TY2VuZUFzc2V0JywgJ2NjLlByZWZhYiddLmluY2x1ZGVzKGFzc2V0TWFuYWdlci5xdWVyeUFzc2V0UHJvcGVydHkoYXNzZXQsICd0eXBlJykpKSB7XHJcbiAgICAgICAgICAgIGRlc2VyaWFsaXplZEFzc2V0Lm5hbWUgPSBiYXNlbmFtZShhc3NldC5zb3VyY2UsIGV4dG5hbWUoYXNzZXQuc291cmNlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXN1bHQuYXNzZXQgPSBkZXNlcmlhbGl6ZWRBc3NldDtcclxuICAgICAgICByZXN1bHQuZGV0YWlsID0gZGVzZXJpYWxpemVEZXRhaWxzO1xyXG4gICAgICAgIHRoaXMuZGVwZW5kW2Fzc2V0LnV1aWRdID0gWy4uLm5ldyBTZXQoZGVzZXJpYWxpemVEZXRhaWxzLnV1aWRMaXN0KV0gYXMgc3RyaW5nW107XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjee9rlxyXG4gICAgICovXHJcbiAgICByZXNldCgpIHtcclxuICAgICAgICB0aGlzLmFzc2V0TWFwID0ge307XHJcbiAgICAgICAgdGhpcy5tZXRhID0ge307XHJcbiAgICAgICAgdGhpcy5kZXBlbmQgPSB7fTtcclxuICAgICAgICB0aGlzLmRlcGVuZGVkTWFwID0ge307XHJcbiAgICAgICAgdGhpcy5oYXNNaXNzaW5nQ2xhc3NVdWlkcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuaGFzTWlzc2luZ0Fzc2V0c1V1aWRzLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjaGVja1VzZUNhY2hlKGFzc2V0OiBJQXNzZXQpOiBib29sZWFuIHtcclxuICAgICAgICAvLyDlnLrmma/jgIFwcmVmYWIg6LWE5rqQ55qE57yT5a2Y77yM5Zyo5Y+R55Sf6ISa5pys5Y+Y5YyW5ZCO5bCx6ZyA6KaB5aSx5pWILCBlZmZlY3Qg55uu5YmN5pyJ5p6E5bu65YmU6Zmk5py65Yi25pqC5pe25LiN57yT5a2Y57uT5p6cXHJcbiAgICAgICAgaWYgKCF0aGlzLnVzZUNhY2hlIHx8IChbJ2NjLlNjZW5lQXNzZXQnLCAnY2MuUHJlZmFiJywgJ2NjLkVmZmVjdEFzc2V0J10uaW5jbHVkZXMoYXNzZXRNYW5hZ2VyLnF1ZXJ5QXNzZXRQcm9wZXJ0eShhc3NldCwgJ3R5cGUnKSkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjaGVja0NhblNhdmVDYWNoZSh1dWlkOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICAvLyDlnLrmma/jgIFwcmVmYWIg6LWE5rqQ55qE57yT5a2Y77yM5Zyo5Y+R55Sf6ISa5pys5Y+Y5YyW5ZCO5bCx6ZyA6KaB5aSx5pWIXHJcbiAgICAgICAgaWYgKHRoaXMuaGFzTWlzc2luZ0NsYXNzVXVpZHMuaGFzKHV1aWQpIHx8IHRoaXMuaGFzTWlzc2luZ0NsYXNzVXVpZHMuaGFzKHV1aWQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEFzc2V0UHJvcGVydHkgPSBhc3NldE1hbmFnZXIucXVlcnlBc3NldFByb3BlcnR5O1xyXG4gICAgcHVibGljIHVybDJ1dWlkID0gYXNzZXRNYW5hZ2VyLnVybDJ1dWlkO1xyXG59XHJcbmV4cG9ydCBjb25zdCBidWlsZEFzc2V0TGlicmFyeSA9IG5ldyBCdWlsZEFzc2V0TGlicmFyeSgpO1xyXG5cclxuZnVuY3Rpb24gdW5FeHBlY3RFeGNlcHRpb24oZXJyb3I6IGFueSkge1xyXG4gICAgY29uc29sZS5kZWJ1ZyhlcnJvcik7XHJcbn1cclxuIl19