"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bundle = void 0;
const asset_db_1 = require("@cocos/asset-db");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const bundle_utils_1 = require("../../../../share/bundle-utils");
const asset_library_1 = require("../../manager/asset-library");
const utils_1 = require("../../utils");
const bundle_1 = require("../../utils/bundle");
const zip_1 = require("../../utils/zip");
const cconb_1 = require("../../utils/cconb");
const fast_glob_1 = __importDefault(require("fast-glob"));
const asset_1 = __importDefault(require("../../../../../assets/manager/asset"));
const utils_2 = require("./utils");
const i18n_1 = __importDefault(require("../../../../../base/i18n"));
const utils_3 = __importDefault(require("../../../../../base/utils"));
const global_1 = require("../../../../share/global");
class Bundle {
    get scenes() {
        return Array.from(Object.values(this._scenes)).sort();
    }
    get assets() {
        return Array.from(this._assets).sort();
    }
    get assetsWithoutRedirect() {
        return this.assets.filter((x) => !this.getRedirect(x));
    }
    get scripts() {
        return Array.from(this._scripts).sort();
    }
    get rootAssets() {
        return Array.from(this._rootAssets);
    }
    get isSubpackage() {
        return this.compressionType === bundle_utils_1.BundleCompressionTypes.SUBPACKAGE;
    }
    root = ''; // bundle 的根目录, 开发者勾选的目录，如果是 main 包，这个字段为 ''
    dest = ''; // bundle 的输出目录
    importBase = global_1.BuildGlobalInfo.IMPORT_HEADER;
    nativeBase = global_1.BuildGlobalInfo.NATIVE_HEADER;
    scriptDest = ''; // 脚本的输出地址
    name = ''; // bundle 的名称
    priority = 0; // bundle 的优先级
    compressionType = bundle_utils_1.BundleCompressionTypes.MERGE_DEP; // bundle 的压缩类型
    assetVer = { import: {}, native: {} };
    zipVer = ''; // Zip 压缩模式，压缩包的版本
    version = ''; // bundle 的版本信息
    isRemote = false; // bundle 是否是远程包
    isZip = false; // bundle 是否是 zip 包，即使压缩类型设置为 zip，也不一定是 zip 包
    redirect = {};
    deps = new Set();
    groups = [];
    bundleFilterConfig;
    output;
    hasPreloadScript = true;
    extensionMap = {};
    packs = {};
    paths = {};
    md5Cache = false;
    debug = false;
    // TODO 废弃 bundle 的 config 结构，输出 config 时即时整理即可
    config = {
        importBase: global_1.BuildGlobalInfo.IMPORT_HEADER,
        nativeBase: global_1.BuildGlobalInfo.NATIVE_HEADER,
        name: '',
        deps: [],
        uuids: [],
        paths: {},
        scenes: {},
        packs: {},
        versions: { import: [], native: [] },
        redirect: [],
        debug: false,
        extensionMap: {},
        hasPreloadScript: true,
        dependencyRelationships: {},
    };
    configOutPutName = '';
    atlasRes = {
        // 存储 texture/sprite/atlas 和 image 的对应关系
        assetsToImage: {},
        imageToAtlas: {},
        atlasToImages: {},
    };
    // 存储纹理压缩 image uuid 与对应的纹理资源地址
    compressRes = {};
    _rootAssets = new Set(); // 该 bundle 直接包含的资源
    _scenes = {};
    _scripts = new Set();
    // 除脚本、图片以外的资源 uuid 合集
    _assets = new Set();
    compressTask = {};
    _jsonAsset = new Set();
    _cconAsset = new Set();
    _pacAssets = new Set();
    constructor(options) {
        this.root = options.root;
        this.name = options.name;
        this.dest = options.dest;
        this.md5Cache = options.md5Cache;
        this.debug = options.debug;
        this.priority = options.priority;
        this.compressionType = options.compressionType;
        this.isRemote = options.isRemote;
        this.scriptDest = options.scriptDest;
        this.bundleFilterConfig = (0, utils_2.initBundleConfig)(options.bundleFilterConfig);
        this.output = options.output ?? true;
    }
    /**
     * 添加根资源，此方法会递归添加子资源的数据支持普通资源与脚本资源
     * @param asset
     * @returns
     */
    addRootAsset(asset) {
        if (!asset) {
            return;
        }
        (0, utils_1.recursively)(asset, (asset) => {
            const assetType = asset_1.default.queryAssetProperty(asset, 'type');
            if (assetType === 'cc.Script') {
                this.addScript(asset);
                return;
            }
            if (asset.meta?.files && !asset.meta.files.includes('.json') && !(0, cconb_1.hasCCONFormatAssetInLibrary)(asset)) {
                return;
            }
            const canAdd = (0, bundle_1.checkAssetWithFilterConfig)(asset, this.bundleFilterConfig);
            if (!canAdd) {
                // root asset 根据 bundle 配置的正常剔除行为，无需警告，打印记录即可
                console.debug(`asset {asset(${asset.url})} can not match the bundler filter config(${this.name})`);
                return;
            }
            this._rootAssets.add(asset.uuid);
            this.addAsset(asset);
        });
    }
    /**
     * 添加参与 Bundle 打包的脚本资源，最终输出到 index.js 内
     * 需要提前判断脚本资源类型
     * @param asset
     * @returns
     */
    addScript(asset) {
        if (!asset || this._scripts.has(asset.uuid)) {
            return;
        }
        // hack 过滤特殊的声明文件
        if (asset.url.toLowerCase().endsWith('.d.ts')) {
            return;
        }
        if (!asset.meta.userData.isPlugin) {
            this._scripts.add(asset.uuid);
        }
    }
    /**
     * 添加一个资源到该 bundle 中
     */
    addAsset(asset) {
        if (!asset || this._assets.has(asset.uuid)) {
            return;
        }
        if (asset.meta.files.includes('.json')) {
            this._jsonAsset.add(asset.uuid);
        }
        if ((0, cconb_1.hasCCONFormatAssetInLibrary)(asset)) {
            this._cconAsset.add(asset.uuid);
        }
        const assetType = asset_1.default.queryAssetProperty(asset, 'type');
        switch (assetType) {
            case 'cc.Script':
                this.addScript(asset);
                return;
            case 'cc.SceneAsset':
                this._scenes[asset.uuid] = {
                    uuid: asset.uuid,
                    url: asset.url,
                };
                this._assets.add(asset.uuid);
                return;
            default:
                this._assets.add(asset.uuid);
        }
    }
    removeAsset(assetUuid) {
        if (!assetUuid) {
            return;
        }
        this._assets.delete(assetUuid);
        this._rootAssets.delete(assetUuid);
        delete this._scenes[assetUuid];
        this._jsonAsset.delete(assetUuid);
        this._scripts.delete(assetUuid);
        delete this.redirect[assetUuid];
        this.removeFromGroups(assetUuid);
        delete this.compressTask[assetUuid];
        delete this.compressRes[assetUuid];
    }
    addRedirect(uuid, redirect) {
        if (!uuid) {
            return;
        }
        this.redirect[uuid] = redirect;
        this.deps.add(redirect);
        this.addAssetWithUuid(uuid);
    }
    addScriptWithUuid(asset) {
        this._scripts.add(asset);
    }
    /**
     * 类似图集等资源的 uuid 可能没有 asset info
     * @param asset
     */
    addAssetWithUuid(asset) {
        this._assets.add(asset);
    }
    getRedirect(uuid) {
        return this.redirect[uuid];
    }
    addGroup(type, uuids, name = '') {
        this.groups.push({ type, uuids, name });
    }
    addToGroup(type, uuid) {
        const group = this.groups.find((item) => item.type === type);
        if (group) {
            group.uuids.push(uuid);
        }
        else {
            this.addGroup(type, [uuid]);
        }
    }
    removeFromGroups(uuid) {
        this.groups.forEach((group) => {
            cc.js.array.fastRemove(group.uuids, uuid);
        });
        this.groups = this.groups.filter((group) => group.uuids.length > 1);
    }
    /**
     * 初始化 bundle 的 config 数据
     */
    initConfig() {
        this.config.importBase = this.importBase;
        this.config.nativeBase = this.nativeBase;
        this.config.name = this.name;
        this.config.debug = this.debug;
        this.config.hasPreloadScript = this.hasPreloadScript;
        this.config.deps = Array.from(this.deps).sort();
        this.config.uuids = this.assets.sort();
        const redirect = this.config.redirect = [];
        const uuids = Object.keys(this.redirect).sort();
        for (const uuid of uuids) {
            redirect.push(uuid, String(this.config.deps.indexOf(this.redirect[uuid])));
        }
        this.scenes.forEach((sceneItem) => {
            this.config.scenes[sceneItem.url] = sceneItem.uuid;
        });
    }
    async initAssetPaths() {
        // HACK internal bundle 是引擎自身引用的资源，不需要支持 paths 动态加载
        // if (this.name === BuiltinBundleName.INTERNAL) {
        //     return;
        // }
        // 整理 Bundle 根资源的加载路径
        const urlCollect = {};
        // 先去重一次
        this.rootAssets.forEach((uuid) => {
            const asset = asset_library_1.buildAssetLibrary.getAssetInfo(uuid);
            const info = [asset.loadUrl.replace(this.root + '/', '').replace((0, path_1.extname)(asset.url), ''), asset.type];
            // 内置资源不做此警告提示
            this.name !== bundle_utils_1.BuiltinBundleName.INTERNAL && checkUrl(asset.uuid, info[0], info[1]);
            // 作为判断是否为子资源的标识符，子资源需要加标记 1
            if (!(asset instanceof asset_db_1.Asset)) {
                info.push(1);
            }
            this.config.paths[asset.uuid] = info;
        });
        function checkUrl(uuid, url, type) {
            if (!urlCollect[url]) {
                urlCollect[url] = {};
            }
            if (!urlCollect[url][type]) {
                urlCollect[url][type] = uuid;
            }
            // 同名，同类型 url
            const existUuid = urlCollect[url][type];
            if (existUuid === uuid) {
                return;
            }
            const assetA = asset_library_1.buildAssetLibrary.getAsset(existUuid);
            const assetB = asset_library_1.buildAssetLibrary.getAsset(uuid);
            console.warn(i18n_1.default.t('builder.warn.same_load_url', {
                urlA: `{asset(${assetA.url})} uuid: ${existUuid}`,
                urlB: `{asset(${assetB.url})} uuid: ${uuid}`,
                url,
            }));
        }
        // Note: dependencyRelationships 引擎尚未支持，无需写入
        // 并且由于预览不加载脚本并且场景 prefab 的依赖信息目前无法脱离反序列化流程等原因，无法在预览阶段获取完整依赖，如需开放此功能需要这两处问题解决后
        // for (const uuid of this.assetsWithoutRedirect) {
        //     const depends = await buildAssetLibrary.getDependUuids(uuid);
        //     depends.length && (this.config.dependencyRelationships[uuid] = depends);
        // }
    }
    async outputConfigs() {
        if (!this.output) {
            return;
        }
        if (this.isZip) {
            this.config.isZip = true;
            this.config.zipVersion = this.zipVer;
        }
        console.debug(`output config of bundle ${this.name}`);
        let outputPath = (0, path_1.join)(this.dest, (this.configOutPutName || (0, path_1.parse)(global_1.BuildGlobalInfo.CONFIG_NAME).name) + '.json');
        if (this.version) {
            outputPath = (0, path_1.join)(this.dest, `${this.configOutPutName || (0, path_1.parse)(global_1.BuildGlobalInfo.CONFIG_NAME).name}.${this.version}.json`);
        }
        const content = JSON.stringify(this.config, null, this.config.debug ? 4 : 0);
        (0, fs_extra_1.outputFileSync)(outputPath, content, 'utf8');
        console.debug(`output config of bundle ${this.name} success`);
    }
    async build() {
        // 重新整理一次 config 避免漏掉一些后续流程新增的数据
        await this.initConfig();
        await this.genPackedAssetsConfig();
        if (this.md5Cache) {
            await this.createAssetsMd5();
            await this.compress();
            await this.zipBundle();
            await this.md5Bundle();
            await this.outputConfigs();
        }
        else {
            await this.compress();
            await this.zipBundle();
            await this.outputConfigs();
        }
    }
    async md5Bundle() {
        if (!this.md5Cache) {
            return;
        }
        const hash = (0, utils_1.calcMd5)([JSON.stringify(this.config), (0, fs_extra_1.readFileSync)(this.scriptDest)]);
        if (!this.isSubpackage) {
            const newName = (0, path_1.join)((0, path_1.dirname)(this.scriptDest), `${(0, path_1.parse)(this.scriptDest).name}.${hash}${(0, path_1.extname)(this.scriptDest)}`);
            (0, fs_extra_1.renameSync)(this.scriptDest, newName);
            this.scriptDest = newName;
        }
        this.version = hash;
        if (this.isZip) {
            const zipPath = (0, path_1.join)(this.dest, global_1.BuildGlobalInfo.BUNDLE_ZIP_NAME);
            if ((0, fs_extra_1.existsSync)(zipPath)) {
                const res = await (0, utils_1.appendMd5ToPaths)([zipPath]);
                if (res) {
                    this.zipVer = res.hash;
                }
            }
        }
    }
    /**
     * 对 bundle 内的资源文件进行 md5 处理
     * @returns
     */
    async createAssetsMd5() {
        if (!this.md5Cache || this.isZip) {
            return;
        }
        this.assetVer.import = {};
        this.assetVer.native = {};
        if (!this.assets.length) {
            return;
        }
        console.debug(`add md5 to bundle ${this.name}...`);
        // 先收集每个 uuid 下对应的多个路径
        const suffixMap = {
            native: {},
            import: {},
        };
        const fontPaths = [];
        const importPaths = await (0, fast_glob_1.default)('**', { cwd: (0, path_1.join)(this.dest, this.importBase), absolute: true });
        for (let i = 0; i < importPaths.length; i++) {
            const filePath = importPaths[i];
            const uuid = (0, utils_1.getUuidFromPath)(filePath);
            if (!suffixMap.import[uuid]) {
                suffixMap.import[uuid] = [];
            }
            suffixMap.import[uuid].push(filePath);
        }
        const nativePaths = await (0, fast_glob_1.default)('**', { cwd: (0, path_1.join)(this.dest, this.nativeBase), absolute: true });
        for (let i = 0; i < nativePaths.length; i++) {
            const filePath = nativePaths[i];
            const uuid = (0, utils_1.getUuidFromPath)(filePath);
            if (!suffixMap.native[uuid]) {
                suffixMap.native[uuid] = [];
            }
            // ttf 字体类型路径需要单独提取出来特殊处理,只对文件夹做 hash 值处理
            if ((0, path_1.basename)((0, path_1.dirname)(filePath)) === uuid) {
                fontPaths.push(filePath);
                continue;
            }
            suffixMap.native[uuid].push(filePath);
        }
        for (const uuid in suffixMap.import) {
            const res = await (0, utils_1.appendMd5ToPaths)(suffixMap.import[uuid]);
            if (!res) {
                continue;
            }
            this.assetVer.import[uuid] = res.hash;
        }
        for (const uuid in suffixMap.native) {
            const res = await (0, utils_1.appendMd5ToPaths)(suffixMap.native[uuid]);
            if (!res) {
                continue;
            }
            this.assetVer.native[uuid] = res.hash;
        }
        for (let i = 0; i < fontPaths.length; i++) {
            const path = fontPaths[i];
            try {
                const hash = (0, utils_1.calcMd5)((0, fs_extra_1.readFileSync)(path));
                const uuid = (0, utils_1.getUuidFromPath)(path);
                (0, fs_extra_1.renameSync)((0, path_1.dirname)(path), (0, path_1.dirname)(path) + `.${hash}`);
                this.assetVer.native[uuid] = hash;
            }
            catch (error) {
                console.error(error);
            }
        }
        // 填充 md5 数据
        const importUUids = Object.keys(this.assetVer.import).sort();
        for (const uuid of importUUids) {
            if (!this.config.uuids.includes(uuid)) {
                // 做一层校验报错，避免在运行时才暴露混淆排查
                console.error(`Can not find import asset(${uuid}) in bundle ${this.root}.`);
                this.config.uuids.push(uuid);
            }
            this.config.versions.import.push(uuid, this.assetVer.import[uuid]);
        }
        const nativeUUids = Object.keys(this.assetVer.native).sort();
        for (const uuid of nativeUUids) {
            if (!this.config.uuids.includes(uuid)) {
                // 做一层校验报错，避免在运行时才暴露混淆排查
                console.error(`Can not find native asset(${uuid}) in bundle ${this.root}.`);
                this.config.uuids.push(uuid);
            }
            this.config.versions.native.push(uuid, this.assetVer.native[uuid]);
        }
        console.debug(`add md5 to bundle ${this.name} success`);
    }
    async zipBundle() {
        if (this.compressionType !== bundle_utils_1.BundleCompressionTypes.ZIP || !this.output) {
            return;
        }
        console.debug(`zip bundle ${this.name}...`);
        const dest = this.dest;
        const nativeDir = (0, path_1.join)(dest, this.nativeBase);
        const importDir = (0, path_1.join)(dest, this.importBase);
        const dirsToCompress = [nativeDir, importDir].filter(dir => (0, fs_extra_1.existsSync)(dir));
        if (dirsToCompress.length > 0) {
            this.isZip = true;
            await (0, zip_1.compressDirs)(dirsToCompress, dest, (0, path_1.join)(dest, global_1.BuildGlobalInfo.BUNDLE_ZIP_NAME));
        }
        console.debug(`zip bundle ${this.name} success...`);
    }
    compress() {
        if (this.debug) {
            return;
        }
        console.debug(`compress config of bundle ${this.name}...`);
        function collectUuids(config) {
            const uuidCount = {};
            const uuidIndices = {};
            function addUuid(uuid) {
                const count = (uuidCount[uuid] || 0) + 1;
                uuidCount[uuid] = count;
                if (!(uuid in uuidIndices)) {
                    uuidIndices[uuid] = uuid;
                }
            }
            const paths = config.paths;
            for (const path in paths) {
                addUuid(path);
            }
            const scenes = config.scenes;
            for (const name in scenes) {
                addUuid(scenes[name]);
            }
            for (const extName in config.extensionMap) {
                config.extensionMap[extName].forEach(addUuid);
            }
            const packIds = Object.keys(config.packs).sort();
            const sortedPackAssets = {};
            for (const packId of packIds) {
                config.packs[packId].forEach(addUuid);
                sortedPackAssets[packId] = config.packs[packId];
            }
            config.packs = sortedPackAssets;
            const versions = config.versions;
            for (const entries of Object.values(versions)) {
                for (let i = 0; i < entries.length; i += 2) {
                    addUuid(entries[i]);
                }
            }
            const redirect = config.redirect;
            for (let i = 0; i < redirect.length; i += 2) {
                addUuid(redirect[i]);
            }
            // sort by reference count
            config.uuids.sort((a, b) => uuidCount[b] - uuidCount[a]);
            config.uuids.forEach((uuid, index) => uuidIndices[uuid] = index);
            config.uuids = config.uuids.map((uuid) => utils_3.default.UUID.compressUUID(uuid, true));
            return uuidIndices;
        }
        const config = this.config;
        const uuidIndices = collectUuids(config);
        const paths = config.paths;
        const newPaths = config.paths = {};
        const types = config.types = [];
        for (const uuid in paths) {
            const entry = paths[uuid];
            const index = uuidIndices[uuid];
            let typeIndex = types.indexOf(entry[1]);
            if (typeIndex === -1) {
                typeIndex = types.length;
                types.push(entry[1]);
            }
            entry[1] = typeIndex;
            newPaths[index] = entry;
        }
        // 引擎尚未对接使用 https://github.com/cocos/3d-tasks/issues/16152
        // const newDependencyRelationships: Record<string, Array<string | number>> = {};
        // for (const uuid in config.dependencyRelationships) {
        //     let depends: Array<string | number> = config.dependencyRelationships[uuid];
        //     const index = uuidIndices[uuid] ?? utils.string.compressUUID(uuid, true);
        //     depends = depends.map((uuid) => uuidIndices[uuid] ?? utils.string.compressUUID(uuid as string, true));
        //     newDependencyRelationships[index] = depends;
        // }
        // config.dependencyRelationships = newDependencyRelationships;
        const scenes = config.scenes;
        for (const name in scenes) {
            const scene = scenes[name];
            const uuidIndex = uuidIndices[scene];
            scenes[name] = Number(uuidIndex);
        }
        for (const extName in config.extensionMap) {
            const uuids = config.extensionMap[extName];
            for (let i = 0; i < uuids.length; ++i) {
                const uuidIndex = uuidIndices[uuids[i]];
                uuids[i] = uuidIndex;
            }
            uuids.sort();
        }
        const packedAssets = config.packs;
        for (const packId in packedAssets) {
            const packedIds = packedAssets[packId];
            for (let i = 0; i < packedIds.length; ++i) {
                const uuidIndex = uuidIndices[packedIds[i]];
                packedIds[i] = uuidIndex;
            }
        }
        const redirect = config.redirect;
        for (let i = 0; i < redirect.length; i += 2) {
            const uuidIndex = uuidIndices[redirect[i]];
            redirect[i] = Number(uuidIndex);
        }
        if (!this.debug) {
            const versions = this.config.versions;
            for (const entries of Object.values(versions)) {
                for (let i = 0; i < entries.length; i += 2) {
                    const uuidIndex = uuidIndices[entries[i]];
                    entries[i] = Number(uuidIndex);
                }
            }
        }
        console.debug(`compress config of bundle ${this.name} success`);
    }
    /**
     * 整理 JSON 分组以及资源路径数据到 config 内
     */
    async genPackedAssetsConfig() {
        // 重新计算一次，中间过程可能会新增数据
        this.config.uuids = this.assets.sort();
        const redirect = this.config.redirect = [];
        const uuids = Object.keys(this.redirect).sort();
        for (const uuid of uuids) {
            redirect.push(uuid, String(this.config.deps.indexOf(this.redirect[uuid])));
        }
        Object.keys(this.config.extensionMap).forEach((key) => {
            this.config.extensionMap[key].sort();
        });
        // group 里的数据转换成 packedAssets 数据
        const usedUuids = [];
        for (const group of this.groups) {
            if (!group.name) {
                continue;
            }
            if (group.uuids.length === 0) {
                continue;
            }
            // 这里的 uuids 不能排序，在 json 分组生成阶段就需要确定，group.uuids 需要用做数据查询，config.packs 后续会压缩，需要深拷贝
            this.config.packs[group.name] = JSON.parse(JSON.stringify(group.uuids));
            group.uuids.forEach((uuid) => {
                usedUuids.push(uuid);
            });
        }
        // 需要在比较晚期的时候进行，因为有些图集相关资源可能因为不同的配置选项过滤移出 Bundle
        await this.initAssetPaths();
    }
    /**
     * 指定的 uuid 资源是否包含在构建资源中
     * @param deep 是否深度查找，指定 uuid 的关联资源存在即视为存在 Bundle 包含该资源，例如未生成图集序列化资源但是合图 Image 存在的情况
     */
    containsAsset(uuid, deep = false) {
        return this._scripts.has(uuid)
            || this._assets.has(uuid)
            || !!this._scenes[uuid]
            || (deep ? !!(this.atlasRes.atlasToImages[uuid] && this.atlasRes.atlasToImages[uuid].length) : false);
    }
}
exports.Bundle = Bundle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci93b3JrZXIvYnVpbGRlci9hc3NldC1oYW5kbGVyL2J1bmRsZS9idW5kbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsOENBQXNEO0FBQ3RELHVDQUEwRjtBQUMxRiwrQkFBK0Q7QUFDL0QsaUVBQTJGO0FBQzNGLCtEQUFnRTtBQUNoRSx1Q0FBc0Y7QUFDdEYsK0NBQWdFO0FBQ2hFLHlDQUErQztBQUMvQyw2Q0FBZ0U7QUFDaEUsMERBQTJCO0FBRzNCLGdGQUErRDtBQUUvRCxtQ0FBMkM7QUFDM0Msb0VBQTRDO0FBQzVDLHNFQUE4QztBQUM5QyxxREFBMkQ7QUFDM0QsTUFBYSxNQUFNO0lBRWYsSUFBVyxNQUFNO1FBQ2IsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDMUQsQ0FBQztJQUVELElBQVcsTUFBTTtRQUNiLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDM0MsQ0FBQztJQUVELElBQVcscUJBQXFCO1FBQzVCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxJQUFXLE9BQU87UUFDZCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzVDLENBQUM7SUFFRCxJQUFXLFVBQVU7UUFDakIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENB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QUMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUN2QyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN6QixTQUFTO1lBQ2IsQ0FBQztZQUNELFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFFRCxLQUFLLE1BQU0sSUFBSSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNsQyxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUEsd0JBQWdCLEVBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDUCxTQUFTO1lBQ2IsQ0FBQztZQUNELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDMUMsQ0FBQztRQUNELEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2xDLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBQSx3QkFBZ0IsRUFBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNQLFNBQVM7WUFDYixDQUFDO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztRQUMxQyxDQUFDO1FBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN4QyxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDO2dCQUNELE1BQU0sSUFBSSxHQUFHLElBQUEsZUFBTyxFQUFDLElBQUEsdUJBQVksRUFBQyxJ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QUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlHLENBQUM7Q0FFSjtBQTNvQkQsd0JBMm9CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0LCBWaXJ0dWFsQXNzZXQgfSBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5pbXBvcnQgeyByZWFkRmlsZVN5bmMsIHJlbmFtZVN5bmMsIG91dHB1dEZpbGVTeW5jLCBleGlzdHNTeW5jLCBlbXB0eURpciB9IGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHsgYmFzZW5hbWUsIGRpcm5hbWUsIGV4dG5hbWUsIGpvaW4sIHBhcnNlIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IEJ1aWx0aW5CdW5kbGVOYW1lLCBCdW5kbGVDb21wcmVzc2lvblR5cGVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2hhcmUvYnVuZGxlLXV0aWxzJztcclxuaW1wb3J0IHsgYnVpbGRBc3NldExpYnJhcnkgfSBmcm9tICcuLi8uLi9tYW5hZ2VyL2Fzc2V0LWxpYnJhcnknO1xyXG5pbXBvcnQgeyByZWN1cnNpdmVseSwgZ2V0VXVpZEZyb21QYXRoLCBhcHBlbmRNZDVUb1BhdGhzLCBjYWxjTWQ1IH0gZnJvbSAnLi4vLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBjaGVja0Fzc2V0V2l0aEZpbHRlckNvbmZpZyB9IGZyb20gJy4uLy4uL3V0aWxzL2J1bmRsZSc7XHJcbmltcG9ydCB7IGNvbXByZXNzRGlycyB9IGZyb20gJy4uLy4uL3V0aWxzL3ppcCc7XHJcbmltcG9ydCB7IGhhc0NDT05Gb3JtYXRBc3NldEluTGlicmFyeSB9IGZyb20gJy4uLy4uL3V0aWxzL2Njb25iJztcclxuaW1wb3J0IGZnIGZyb20gJ2Zhc3QtZ2xvYic7XHJcbmltcG9ydCB7IEJ1bmRsZUNvbXByZXNzaW9uVHlwZSwgQnVuZGxlRmlsdGVyQ29uZmlnLCBJQnVuZGxlQ29uZmlnLCBJQnVpbGRTY2VuZUl0ZW0gfSBmcm9tICcuLi8uLi8uLi8uLi9AdHlwZXMnO1xyXG5pbXBvcnQgeyBJVmVyc2lvbk1hcCwgSUdyb3VwLCBJQXRsYXNSZXN1bHQsIElJbWFnZVRhc2tJbmZvLCBJQnVuZGxlSW5pdE9wdGlvbnMsIElKU09OR3JvdXBUeXBlLCBJU3VmZml4TWFwIH0gZnJvbSAnLi4vLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCBhc3NldE1hbmFnZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXNzZXRzL21hbmFnZXIvYXNzZXQnO1xyXG5pbXBvcnQgeyBJQXNzZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9hc3NldHMvQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IGluaXRCdW5kbGVDb25maWcgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IGkxOG4gZnJvbSAnLi4vLi4vLi4vLi4vLi4vYmFzZS9pMThuJztcclxuaW1wb3J0IHV0aWxzIGZyb20gJy4uLy4uLy4uLy4uLy4uL2Jhc2UvdXRpbHMnO1xyXG5pbXBvcnQgeyBCdWlsZEdsb2JhbEluZm8gfSBmcm9tICcuLi8uLi8uLi8uLi9zaGFyZS9nbG9iYWwnO1xyXG5leHBvcnQgY2xhc3MgQnVuZGxlIHtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IHNjZW5lcygpIHtcclxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShPYmplY3QudmFsdWVzKHRoaXMuX3NjZW5lcykpLnNvcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGFzc2V0cygpIHtcclxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9hc3NldHMpLnNvcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGFzc2V0c1dpdGhvdXRSZWRpcmVjdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hc3NldHMuZmlsdGVyKCh4KSA9PiAhdGhpcy5nZXRSZWRpcmVjdCh4KSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBzY3JpcHRzKCkge1xyXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX3NjcmlwdHMpLnNvcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHJvb3RBc3NldHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fcm9vdEFzc2V0cyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBpc1N1YnBhY2thZ2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcHJlc3Npb25UeXBlID09PSBCdW5kbGVDb21wcmVzc2lvblR5cGVzLlNVQlBBQ0tBR0U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJvb3QgPSAnJzsgLy8gYnVuZGxlIOeahOagueebruW9lSwg5byA5Y+R6ICF5Yu+6YCJ55qE55uu5b2V77yM5aaC5p6c5pivIG1haW4g5YyF77yM6L+Z5Liq5a2X5q615Li6ICcnXHJcbiAgICBwdWJsaWMgZGVzdCA9ICcnOyAvLyBidW5kbGUg55qE6L6T5Ye655uu5b2VXHJcbiAgICBwdWJsaWMgaW1wb3J0QmFzZTogc3RyaW5nID0gQnVpbGRHbG9iYWxJbmZvLklNUE9SVF9IRUFERVI7XHJcbiAgICBwdWJsaWMgbmF0aXZlQmFzZTogc3RyaW5nID0gQnVpbGRHbG9iYWxJbmZvLk5BVElWRV9IRUFERVI7XHJcbiAgICBwdWJsaWMgc2NyaXB0RGVzdCA9ICcnOyAvLyDohJrmnKznmoTovpPlh7rlnLDlnYBcclxuICAgIHB1YmxpYyBuYW1lID0gJyc7IC8vIGJ1bmRsZSDnmoTlkI3np7BcclxuICAgIHB1YmxpYyBwcmlvcml0eSA9IDA7IC8vIGJ1bmRsZSDnmoTkvJjlhYjnuqdcclxuICAgIHB1YmxpYyBjb21wcmVzc2lvblR5cGU6IEJ1bmRsZUNvbXByZXNzaW9uVHlwZSA9IEJ1bmRsZUNvbXByZXNzaW9uVHlwZXMuTUVSR0VfREVQOyAvLyBidW5kbGUg55qE5Y6L57yp57G75Z6LXHJcbiAgICBwdWJsaWMgYXNzZXRWZXI6IElWZXJzaW9uTWFwID0geyBpbXBvcnQ6IHt9LCBuYXRpdmU6IHt9IH07XHJcbiAgICBwdWJsaWMgemlwVmVyID0gJyc7IC8vIFppcCDljovnvKnmqKHlvI/vvIzljovnvKnljIXnmoTniYjmnKxcclxuICAgIHB1YmxpYyB2ZXJzaW9uID0gJyc7IC8vIGJ1bmRsZSDnmoTniYjmnKzkv6Hmga9cclxuICAgIHB1YmxpYyBpc1JlbW90ZSA9IGZhbHNlOyAvLyBidW5kbGUg5piv5ZCm5piv6L+c56iL5YyFXHJcbiAgICBwdWJsaWMgaXNaaXAgPSBmYWxzZTsgLy8gYnVuZGxlIOaYr+WQpuaYryB6aXAg5YyF77yM5Y2z5L2/5Y6L57yp57G75Z6L6K6+572u5Li6IHppcO+8jOS5n+S4jeS4gOWumuaYryB6aXAg5YyFXHJcbiAgICBwdWJsaWMgcmVkaXJlY3Q6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuICAgIHB1YmxpYyBkZXBzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgcHVibGljIGdyb3VwczogSUdyb3VwW10gPSBbXTtcclxuICAgIHB1YmxpYyBidW5kbGVGaWx0ZXJDb25maWc/OiBCdW5kbGVGaWx0ZXJDb25maWdbXTtcclxuICAgIHB1YmxpYyBvdXRwdXQ6IGJvb2xlYW47XHJcbiAgICBwdWJsaWMgaGFzUHJlbG9hZFNjcmlwdCA9IHRydWU7XHJcbiAgICBwdWJsaWMgZXh0ZW5zaW9uTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7fTtcclxuICAgIHB1YmxpYyBwYWNrczogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0ge307XHJcbiAgICBwdWJsaWMgcGF0aHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHt9O1xyXG4gICAgcHVibGljIG1kNUNhY2hlID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgZGVidWcgPSBmYWxzZTtcclxuICAgIC8vIFRPRE8g5bqf5byDIGJ1bmRsZSDnmoQgY29uZmlnIOe7k+aehO+8jOi+k+WHuiBjb25maWcg5pe25Y2z5pe25pW055CG5Y2z5Y+vXHJcbiAgICBwdWJsaWMgY29uZmlnOiBJQnVuZGxlQ29uZmlnID0ge1xyXG4gICAgICAgIGltcG9ydEJhc2U6IEJ1aWxkR2xvYmFsSW5mby5JTVBPUlRfSEVBREVSLFxyXG4gICAgICAgIG5hdGl2ZUJhc2U6IEJ1aWxkR2xvYmFsSW5mby5OQVRJVkVfSEVBREVSLFxyXG4gICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgIGRlcHM6IFtdLFxyXG4gICAgICAgIHV1aWRzOiBbXSxcclxuICAgICAgICBwYXRoczoge30sXHJcbiAgICAgICAgc2NlbmVzOiB7fSxcclxuICAgICAgICBwYWNrczoge30sXHJcbiAgICAgICAgdmVyc2lvbnM6IHsgaW1wb3J0OiBbXSwgbmF0aXZlOiBbXSB9LFxyXG4gICAgICAgIHJlZGlyZWN0OiBbXSxcclxuICAgICAgICBkZWJ1ZzogZmFsc2UsXHJcbiAgICAgICAgZXh0ZW5zaW9uTWFwOiB7fSxcclxuICAgICAgICBoYXNQcmVsb2FkU2NyaXB0OiB0cnVlLFxyXG4gICAgICAgIGRlcGVuZGVuY3lSZWxhdGlvbnNoaXBzOiB7fSxcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGNvbmZpZ091dFB1dE5hbWUgPSAnJztcclxuXHJcbiAgICBwdWJsaWMgYXRsYXNSZXM6IElBdGxhc1Jlc3VsdCA9IHtcclxuICAgICAgICAvLyDlrZjlgqggdGV4dHVyZS9zcHJpdGUvYXRsYXMg5ZKMIGltYWdlIOeahOWvueW6lOWFs+ezu1xyXG4gICAgICAgIGFzc2V0c1RvSW1hZ2U6IHt9LFxyXG4gICAgICAgIGltYWdlVG9BdGxhczoge30sXHJcbiAgICAgICAgYXRsYXNUb0ltYWdlczoge30sXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIOWtmOWCqOe6ueeQhuWOi+e8qSBpbWFnZSB1dWlkIOS4juWvueW6lOeahOe6ueeQhui1hOa6kOWcsOWdgFxyXG4gICAgcHVibGljIGNvbXByZXNzUmVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7fTtcclxuXHJcbiAgICBfcm9vdEFzc2V0czogU2V0PHN0cmluZz4gPSBuZXcgU2V0PHN0cmluZz4oKTsgLy8g6K+lIGJ1bmRsZSDnm7TmjqXljIXlkKvnmoTotYTmupBcclxuICAgIF9zY2VuZXM6IFJlY29yZDxzdHJpbmcsIElCdWlsZFNjZW5lSXRlbT4gPSB7fTtcclxuICAgIF9zY3JpcHRzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgLy8g6Zmk6ISa5pys44CB5Zu+54mH5Lul5aSW55qE6LWE5rqQIHV1aWQg5ZCI6ZuGXHJcbiAgICBfYXNzZXRzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgY29tcHJlc3NUYXNrOiBSZWNvcmQ8c3RyaW5nLCBJSW1hZ2VUYXNrSW5mbz4gPSB7fTtcclxuICAgIF9qc29uQXNzZXQ6IFNldDxzdHJpbmc+ID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgICBfY2NvbkFzc2V0OiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgX3BhY0Fzc2V0czogU2V0PHN0cmluZz4gPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBJQnVuZGxlSW5pdE9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLnJvb3QgPSBvcHRpb25zLnJvb3Q7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lO1xyXG4gICAgICAgIHRoaXMuZGVzdCA9IG9wdGlvbnMuZGVzdDtcclxuICAgICAgICB0aGlzLm1kNUNhY2hlID0gb3B0aW9ucy5tZDVDYWNoZTtcclxuICAgICAgICB0aGlzLmRlYnVnID0gb3B0aW9ucy5kZWJ1ZztcclxuICAgICAgICB0aGlzLnByaW9yaXR5ID0gb3B0aW9ucy5wcmlvcml0eTtcclxuICAgICAgICB0aGlzLmNvbXByZXNzaW9uVHlwZSA9IG9wdGlvbnMuY29tcHJlc3Npb25UeXBlO1xyXG4gICAgICAgIHRoaXMuaXNSZW1vdGUgPSBvcHRpb25zLmlzUmVtb3RlO1xyXG4gICAgICAgIHRoaXMuc2NyaXB0RGVzdCA9IG9wdGlvbnMuc2NyaXB0RGVzdDtcclxuICAgICAgICB0aGlzLmJ1bmRsZUZpbHRlckNvbmZpZyA9IGluaXRCdW5kbGVDb25maWcob3B0aW9ucy5idW5kbGVGaWx0ZXJDb25maWcpO1xyXG4gICAgICAgIHRoaXMub3V0cHV0ID0gb3B0aW9ucy5vdXRwdXQgPz8gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOaguei1hOa6kO+8jOatpOaWueazleS8mumAkuW9kua3u+WKoOWtkOi1hOa6kOeahOaVsOaNruaUr+aMgeaZrumAmui1hOa6kOS4juiEmuacrOi1hOa6kFxyXG4gICAgICogQHBhcmFtIGFzc2V0IFxyXG4gICAgICogQHJldHVybnMgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGRSb290QXNzZXQoYXNzZXQ6IEFzc2V0IHwgVmlydHVhbEFzc2V0KSB7XHJcbiAgICAgICAgaWYgKCFhc3NldCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlY3Vyc2l2ZWx5KGFzc2V0LCAoYXNzZXQ6IEFzc2V0IHwgVmlydHVhbEFzc2V0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0VHlwZSA9IGFzc2V0TWFuYWdlci5xdWVyeUFzc2V0UHJvcGVydHkoYXNzZXQsICd0eXBlJyk7XHJcbiAgICAgICAgICAgIGlmIChhc3NldFR5cGUgPT09ICdjYy5TY3JpcHQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFNjcmlwdChhc3NldCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFzc2V0Lm1ldGE/LmZpbGVzICYmICFhc3NldC5tZXRhLmZpbGVzLmluY2x1ZGVzKCcuanNvbicpICYmICFoYXNDQ09ORm9ybWF0QXNzZXRJbkxpYnJhcnkoYXNzZXQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgY2FuQWRkID0gY2hlY2tBc3NldFdpdGhGaWx0ZXJDb25maWcoYXNzZXQsIHRoaXMuYnVuZGxlRmlsdGVyQ29uZmlnKTtcclxuICAgICAgICAgICAgaWYgKCFjYW5BZGQpIHtcclxuICAgICAgICAgICAgICAgIC8vIHJvb3QgYXNzZXQg5qC55o2uIGJ1bmRsZSDphY3nva7nmoTmraPluLjliZTpmaTooYzkuLrvvIzml6DpnIDorablkYrvvIzmiZPljbDorrDlvZXljbPlj69cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYGFzc2V0IHthc3NldCgke2Fzc2V0LnVybH0pfSBjYW4gbm90IG1hdGNoIHRoZSBidW5kbGVyIGZpbHRlciBjb25maWcoJHt0aGlzLm5hbWV9KWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3Jvb3RBc3NldHMuYWRkKGFzc2V0LnV1aWQpO1xyXG4gICAgICAgICAgICB0aGlzLmFkZEFzc2V0KGFzc2V0KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOWPguS4jiBCdW5kbGUg5omT5YyF55qE6ISa5pys6LWE5rqQ77yM5pyA57uI6L6T5Ye65YiwIGluZGV4LmpzIOWGhVxyXG4gICAgICog6ZyA6KaB5o+Q5YmN5Yik5pat6ISa5pys6LWE5rqQ57G75Z6LXHJcbiAgICAgKiBAcGFyYW0gYXNzZXQgXHJcbiAgICAgKiBAcmV0dXJucyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZFNjcmlwdChhc3NldDogQXNzZXQgfCBWaXJ0dWFsQXNzZXQpIHtcclxuICAgICAgICBpZiAoIWFzc2V0IHx8IHRoaXMuX3NjcmlwdHMuaGFzKGFzc2V0LnV1aWQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaGFjayDov4fmu6TnibnmrornmoTlo7DmmI7mlofku7ZcclxuICAgICAgICBpZiAoYXNzZXQudXJsLnRvTG93ZXJDYXNlKCkuZW5kc1dpdGgoJy5kLnRzJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWFzc2V0Lm1ldGEudXNlckRhdGEuaXNQbHVnaW4pIHtcclxuICAgICAgICAgICAgdGhpcy5fc2NyaXB0cy5hZGQoYXNzZXQudXVpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5LiA5Liq6LWE5rqQ5Yiw6K+lIGJ1bmRsZSDkuK1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZEFzc2V0KGFzc2V0OiBJQXNzZXQpIHtcclxuICAgICAgICBpZiAoIWFzc2V0IHx8IHRoaXMuX2Fzc2V0cy5oYXMoYXNzZXQudXVpZCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGFzc2V0Lm1ldGEuZmlsZXMuaW5jbHVkZXMoJy5qc29uJykpIHtcclxuICAgICAgICAgICAgdGhpcy5fanNvbkFzc2V0LmFkZChhc3NldC51dWlkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChoYXNDQ09ORm9ybWF0QXNzZXRJbkxpYnJhcnkoYXNzZXQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2Njb25Bc3NldC5hZGQoYXNzZXQudXVpZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhc3NldFR5cGUgPSBhc3NldE1hbmFnZXIucXVlcnlBc3NldFByb3BlcnR5KGFzc2V0LCAndHlwZScpO1xyXG4gICAgICAgIHN3aXRjaCAoYXNzZXRUeXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ2NjLlNjcmlwdCc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFNjcmlwdChhc3NldCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGNhc2UgJ2NjLlNjZW5lQXNzZXQnOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2NlbmVzW2Fzc2V0LnV1aWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHV1aWQ6IGFzc2V0LnV1aWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBhc3NldC51cmwsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYXNzZXRzLmFkZChhc3NldC51dWlkKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMuX2Fzc2V0cy5hZGQoYXNzZXQudXVpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW1vdmVBc3NldChhc3NldFV1aWQ6IHN0cmluZykge1xyXG4gICAgICAgIGlmICghYXNzZXRVdWlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fYXNzZXRzLmRlbGV0ZShhc3NldFV1aWQpO1xyXG4gICAgICAgIHRoaXMuX3Jvb3RBc3NldHMuZGVsZXRlKGFzc2V0VXVpZCk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX3NjZW5lc1thc3NldFV1aWRdO1xyXG4gICAgICAgIHRoaXMuX2pzb25Bc3NldC5kZWxldGUoYXNzZXRVdWlkKTtcclxuICAgICAgICB0aGlzLl9zY3JpcHRzLmRlbGV0ZShhc3NldFV1aWQpO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnJlZGlyZWN0W2Fzc2V0VXVpZF07XHJcbiAgICAgICAgdGhpcy5yZW1vdmVGcm9tR3JvdXBzKGFzc2V0VXVpZCk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuY29tcHJlc3NUYXNrW2Fzc2V0VXVpZF07XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuY29tcHJlc3NSZXNbYXNzZXRVdWlkXTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkUmVkaXJlY3QodXVpZDogc3RyaW5nLCByZWRpcmVjdDogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCF1dWlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yZWRpcmVjdFt1dWlkXSA9IHJlZGlyZWN0O1xyXG4gICAgICAgIHRoaXMuZGVwcy5hZGQocmVkaXJlY3QpO1xyXG4gICAgICAgIHRoaXMuYWRkQXNzZXRXaXRoVXVpZCh1dWlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkU2NyaXB0V2l0aFV1aWQoYXNzZXQ6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX3NjcmlwdHMuYWRkKGFzc2V0KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOexu+S8vOWbvumbhuetiei1hOa6kOeahCB1dWlkIOWPr+iDveayoeaciSBhc3NldCBpbmZvXHJcbiAgICAgKiBAcGFyYW0gYXNzZXQgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGRBc3NldFdpdGhVdWlkKGFzc2V0OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9hc3NldHMuYWRkKGFzc2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UmVkaXJlY3QodXVpZDogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yZWRpcmVjdFt1dWlkXTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkR3JvdXAodHlwZTogSUpTT05Hcm91cFR5cGUsIHV1aWRzOiBzdHJpbmdbXSwgbmFtZSA9ICcnKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cHMucHVzaCh7IHR5cGUsIHV1aWRzLCBuYW1lIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRUb0dyb3VwKHR5cGU6IElKU09OR3JvdXBUeXBlLCB1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBncm91cCA9IHRoaXMuZ3JvdXBzLmZpbmQoKGl0ZW0pID0+IGl0ZW0udHlwZSA9PT0gdHlwZSk7XHJcbiAgICAgICAgaWYgKGdyb3VwKSB7XHJcbiAgICAgICAgICAgIGdyb3VwLnV1aWRzLnB1c2godXVpZCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRHcm91cCh0eXBlLCBbdXVpZF0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVtb3ZlRnJvbUdyb3Vwcyh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xyXG4gICAgICAgICAgICBjYy5qcy5hcnJheS5mYXN0UmVtb3ZlKGdyb3VwLnV1aWRzLCB1dWlkKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmdyb3VwcyA9IHRoaXMuZ3JvdXBzLmZpbHRlcigoZ3JvdXApID0+IGdyb3VwLnV1aWRzLmxlbmd0aCA+IDEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yid5aeL5YyWIGJ1bmRsZSDnmoQgY29uZmlnIOaVsOaNrlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaW5pdENvbmZpZygpIHtcclxuICAgICAgICB0aGlzLmNvbmZpZy5pbXBvcnRCYXNlID0gdGhpcy5pbXBvcnRCYXNlO1xyXG4gICAgICAgIHRoaXMuY29uZmlnLm5hdGl2ZUJhc2UgPSB0aGlzLm5hdGl2ZUJhc2U7XHJcbiAgICAgICAgdGhpcy5jb25maWcubmFtZSA9IHRoaXMubmFtZTtcclxuICAgICAgICB0aGlzLmNvbmZpZy5kZWJ1ZyA9IHRoaXMuZGVidWc7XHJcbiAgICAgICAgdGhpcy5jb25maWcuaGFzUHJlbG9hZFNjcmlwdCA9IHRoaXMuaGFzUHJlbG9hZFNjcmlwdDtcclxuICAgICAgICB0aGlzLmNvbmZpZy5kZXBzID0gQXJyYXkuZnJvbSh0aGlzLmRlcHMpLnNvcnQoKTtcclxuICAgICAgICB0aGlzLmNvbmZpZy51dWlkcyA9IHRoaXMuYXNzZXRzLnNvcnQoKTtcclxuICAgICAgICBjb25zdCByZWRpcmVjdDogKHN0cmluZyB8IG51bWJlcilbXSA9IHRoaXMuY29uZmlnLnJlZGlyZWN0ID0gW107XHJcbiAgICAgICAgY29uc3QgdXVpZHMgPSBPYmplY3Qua2V5cyh0aGlzLnJlZGlyZWN0KS5zb3J0KCk7XHJcbiAgICAgICAgZm9yIChjb25zdCB1dWlkIG9mIHV1aWRzKSB7XHJcbiAgICAgICAgICAgIHJlZGlyZWN0LnB1c2godXVpZCwgU3RyaW5nKHRoaXMuY29uZmlnLmRlcHMuaW5kZXhPZih0aGlzLnJlZGlyZWN0W3V1aWRdKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNjZW5lcy5mb3JFYWNoKChzY2VuZUl0ZW0pID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jb25maWcuc2NlbmVzW3NjZW5lSXRlbS51cmxdID0gc2NlbmVJdGVtLnV1aWQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGluaXRBc3NldFBhdGhzKCkge1xyXG4gICAgICAgIC8vIEhBQ0sgaW50ZXJuYWwgYnVuZGxlIOaYr+W8leaTjuiHqui6q+W8leeUqOeahOi1hOa6kO+8jOS4jemcgOimgeaUr+aMgSBwYXRocyDliqjmgIHliqDovb1cclxuICAgICAgICAvLyBpZiAodGhpcy5uYW1lID09PSBCdWlsdGluQnVuZGxlTmFtZS5JTlRFUk5BTCkge1xyXG4gICAgICAgIC8vICAgICByZXR1cm47XHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIC8vIOaVtOeQhiBCdW5kbGUg5qC56LWE5rqQ55qE5Yqg6L296Lev5b6EXHJcbiAgICAgICAgY29uc3QgdXJsQ29sbGVjdDogYW55ID0ge307XHJcbiAgICAgICAgLy8g5YWI5Y676YeN5LiA5qyhXHJcbiAgICAgICAgdGhpcy5yb290QXNzZXRzLmZvckVhY2goKHV1aWQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYXNzZXQgPSBidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldEluZm8odXVpZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZm86IGFueSA9IFthc3NldC5sb2FkVXJsLnJlcGxhY2UodGhpcy5yb290ICsgJy8nLCAnJykucmVwbGFjZShleHRuYW1lKGFzc2V0LnVybCksICcnKSwgYXNzZXQudHlwZV07XHJcbiAgICAgICAgICAgIC8vIOWGhee9rui1hOa6kOS4jeWBmuatpOitpuWRiuaPkOekulxyXG4gICAgICAgICAgICB0aGlzLm5hbWUgIT09IEJ1aWx0aW5CdW5kbGVOYW1lLklOVEVSTkFMICYmIGNoZWNrVXJsKGFzc2V0LnV1aWQsIGluZm9bMF0sIGluZm9bMV0pO1xyXG4gICAgICAgICAgICAvLyDkvZzkuLrliKTmlq3mmK/lkKbkuLrlrZDotYTmupDnmoTmoIfor4bnrKbvvIzlrZDotYTmupDpnIDopoHliqDmoIforrAgMVxyXG4gICAgICAgICAgICBpZiAoIShhc3NldCBpbnN0YW5jZW9mIEFzc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgaW5mby5wdXNoKDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLnBhdGhzW2Fzc2V0LnV1aWRdID0gaW5mbztcclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrVXJsKHV1aWQ6IHN0cmluZywgdXJsOiBzdHJpbmcsIHR5cGU6IHN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAoIXVybENvbGxlY3RbdXJsXSkge1xyXG4gICAgICAgICAgICAgICAgdXJsQ29sbGVjdFt1cmxdID0ge307XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF1cmxDb2xsZWN0W3VybF1bdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIHVybENvbGxlY3RbdXJsXVt0eXBlXSA9IHV1aWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8g5ZCM5ZCN77yM5ZCM57G75Z6LIHVybFxyXG4gICAgICAgICAgICBjb25zdCBleGlzdFV1aWQgPSB1cmxDb2xsZWN0W3VybF1bdHlwZV07XHJcbiAgICAgICAgICAgIGlmIChleGlzdFV1aWQgPT09IHV1aWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBhc3NldEEgPSBidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldChleGlzdFV1aWQpO1xyXG4gICAgICAgICAgICBjb25zdCBhc3NldEIgPSBidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldCh1dWlkKTtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGkxOG4udCgnYnVpbGRlci53YXJuLnNhbWVfbG9hZF91cmwnLCB7XHJcbiAgICAgICAgICAgICAgICB1cmxBOiBge2Fzc2V0KCR7YXNzZXRBLnVybH0pfSB1dWlkOiAke2V4aXN0VXVpZH1gLFxyXG4gICAgICAgICAgICAgICAgdXJsQjogYHthc3NldCgke2Fzc2V0Qi51cmx9KX0gdXVpZDogJHt1dWlkfWAsXHJcbiAgICAgICAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5vdGU6IGRlcGVuZGVuY3lSZWxhdGlvbnNoaXBzIOW8leaTjuWwmuacquaUr+aMge+8jOaXoOmcgOWGmeWFpVxyXG4gICAgICAgIC8vIOW5tuS4lOeUseS6jumihOiniOS4jeWKoOi9veiEmuacrOW5tuS4lOWcuuaZryBwcmVmYWIg55qE5L6d6LWW5L+h5oGv55uu5YmN5peg5rOV6ISx56a75Y+N5bqP5YiX5YyW5rWB56iL562J5Y6f5Zug77yM5peg5rOV5Zyo6aKE6KeI6Zi25q616I635Y+W5a6M5pW05L6d6LWW77yM5aaC6ZyA5byA5pS+5q2k5Yqf6IO96ZyA6KaB6L+Z5Lik5aSE6Zeu6aKY6Kej5Yaz5ZCOXHJcbiAgICAgICAgLy8gZm9yIChjb25zdCB1dWlkIG9mIHRoaXMuYXNzZXRzV2l0aG91dFJlZGlyZWN0KSB7XHJcbiAgICAgICAgLy8gICAgIGNvbnN0IGRlcGVuZHMgPSBhd2FpdCBidWlsZEFzc2V0TGlicmFyeS5nZXREZXBlbmRVdWlkcyh1dWlkKTtcclxuICAgICAgICAvLyAgICAgZGVwZW5kcy5sZW5ndGggJiYgKHRoaXMuY29uZmlnLmRlcGVuZGVuY3lSZWxhdGlvbnNoaXBzW3V1aWRdID0gZGVwZW5kcyk7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyBvdXRwdXRDb25maWdzKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5vdXRwdXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pc1ppcCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5pc1ppcCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLnppcFZlcnNpb24gPSB0aGlzLnppcFZlcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5kZWJ1Zyhgb3V0cHV0IGNvbmZpZyBvZiBidW5kbGUgJHt0aGlzLm5hbWV9YCk7XHJcbiAgICAgICAgbGV0IG91dHB1dFBhdGggPSBqb2luKHRoaXMuZGVzdCwgKHRoaXMuY29uZmlnT3V0UHV0TmFtZSB8fCBwYXJzZShCdWlsZEdsb2JhbEluZm8uQ09ORklHX05BTUUpLm5hbWUpICsgJy5qc29uJyk7XHJcbiAgICAgICAgaWYgKHRoaXMudmVyc2lvbikge1xyXG4gICAgICAgICAgICBvdXRwdXRQYXRoID0gam9pbih0aGlzLmRlc3QsIGAke3RoaXMuY29uZmlnT3V0UHV0TmFtZSB8fCBwYXJzZShCdWlsZEdsb2JhbEluZm8uQ09ORklHX05BTUUpLm5hbWV9LiR7dGhpcy52ZXJzaW9ufS5qc29uYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjb250ZW50ID0gSlNPTi5zdHJpbmdpZnkodGhpcy5jb25maWcsIG51bGwsIHRoaXMuY29uZmlnLmRlYnVnID8gNCA6IDApO1xyXG4gICAgICAgIG91dHB1dEZpbGVTeW5jKG91dHB1dFBhdGgsIGNvbnRlbnQsICd1dGY4Jyk7XHJcbiAgICAgICAgY29uc29sZS5kZWJ1Zyhgb3V0cHV0IGNvbmZpZyBvZiBidW5kbGUgJHt0aGlzLm5hbWV9IHN1Y2Nlc3NgKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBidWlsZCgpIHtcclxuICAgICAgICAvLyDph43mlrDmlbTnkIbkuIDmrKEgY29uZmlnIOmBv+WFjea8j+aOieS4gOS6m+WQjue7rea1geeoi+aWsOWinueahOaVsOaNrlxyXG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdENvbmZpZygpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuZ2VuUGFja2VkQXNzZXRzQ29uZmlnKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1kNUNhY2hlKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY3JlYXRlQXNzZXRzTWQ1KCk7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY29tcHJlc3MoKTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy56aXBCdW5kbGUoKTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5tZDVCdW5kbGUoKTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5vdXRwdXRDb25maWdzKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5jb21wcmVzcygpO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnppcEJ1bmRsZSgpO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLm91dHB1dENvbmZpZ3MoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgbWQ1QnVuZGxlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5tZDVDYWNoZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGhhc2ggPSBjYWxjTWQ1KFtKU09OLnN0cmluZ2lmeSh0aGlzLmNvbmZpZyksIHJlYWRGaWxlU3luYyh0aGlzLnNjcmlwdERlc3QpXSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzU3VicGFja2FnZSkge1xyXG4gICAgICAgICAgICBjb25zdCBuZXdOYW1lID0gam9pbihkaXJuYW1lKHRoaXMuc2NyaXB0RGVzdCksIGAke3BhcnNlKHRoaXMuc2NyaXB0RGVzdCkubmFtZX0uJHtoYXNofSR7ZXh0bmFtZSh0aGlzLnNjcmlwdERlc3QpfWApO1xyXG4gICAgICAgICAgICByZW5hbWVTeW5jKHRoaXMuc2NyaXB0RGVzdCwgbmV3TmFtZSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2NyaXB0RGVzdCA9IG5ld05hbWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudmVyc2lvbiA9IGhhc2g7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzWmlwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHppcFBhdGggPSBqb2luKHRoaXMuZGVzdCwgQnVpbGRHbG9iYWxJbmZvLkJVTkRMRV9aSVBfTkFNRSk7XHJcbiAgICAgICAgICAgIGlmIChleGlzdHNTeW5jKHppcFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBhcHBlbmRNZDVUb1BhdGhzKFt6aXBQYXRoXSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy56aXBWZXIgPSByZXMuaGFzaCE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlr7kgYnVuZGxlIOWGheeahOi1hOa6kOaWh+S7tui/m+ihjCBtZDUg5aSE55CGXHJcbiAgICAgKiBAcmV0dXJucyBcclxuICAgICAqL1xyXG4gICAgYXN5bmMgY3JlYXRlQXNzZXRzTWQ1KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5tZDVDYWNoZSB8fCB0aGlzLmlzWmlwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hc3NldFZlci5pbXBvcnQgPSB7fTtcclxuICAgICAgICB0aGlzLmFzc2V0VmVyLm5hdGl2ZSA9IHt9O1xyXG4gICAgICAgIGlmICghdGhpcy5hc3NldHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgYWRkIG1kNSB0byBidW5kbGUgJHt0aGlzLm5hbWV9Li4uYCk7XHJcbiAgICAgICAgLy8g5YWI5pS26ZuG5q+P5LiqIHV1aWQg5LiL5a+55bqU55qE5aSa5Liq6Lev5b6EXHJcbiAgICAgICAgY29uc3Qgc3VmZml4TWFwOiBJU3VmZml4TWFwID0ge1xyXG4gICAgICAgICAgICBuYXRpdmU6IHt9LFxyXG4gICAgICAgICAgICBpbXBvcnQ6IHt9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgZm9udFBhdGhzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIGNvbnN0IGltcG9ydFBhdGhzID0gYXdhaXQgZmcoJyoqJywgeyBjd2Q6IGpvaW4odGhpcy5kZXN0LCB0aGlzLmltcG9ydEJhc2UpLCBhYnNvbHV0ZTogdHJ1ZSB9KTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGltcG9ydFBhdGhzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gaW1wb3J0UGF0aHNbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IHV1aWQgPSBnZXRVdWlkRnJvbVBhdGgoZmlsZVBhdGgpO1xyXG4gICAgICAgICAgICBpZiAoIXN1ZmZpeE1hcC5pbXBvcnRbdXVpZF0pIHtcclxuICAgICAgICAgICAgICAgIHN1ZmZpeE1hcC5pbXBvcnRbdXVpZF0gPSBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdWZmaXhNYXAuaW1wb3J0W3V1aWRdLnB1c2goZmlsZVBhdGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBuYXRpdmVQYXRocyA9IGF3YWl0IGZnKCcqKicsIHsgY3dkOiBqb2luKHRoaXMuZGVzdCwgdGhpcy5uYXRpdmVCYXNlKSwgYWJzb2x1dGU6IHRydWUgfSk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuYXRpdmVQYXRocy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9IG5hdGl2ZVBhdGhzW2ldO1xyXG4gICAgICAgICAgICBjb25zdCB1dWlkID0gZ2V0VXVpZEZyb21QYXRoKGZpbGVQYXRoKTtcclxuICAgICAgICAgICAgaWYgKCFzdWZmaXhNYXAubmF0aXZlW3V1aWRdKSB7XHJcbiAgICAgICAgICAgICAgICBzdWZmaXhNYXAubmF0aXZlW3V1aWRdID0gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gdHRmIOWtl+S9k+exu+Wei+i3r+W+hOmcgOimgeWNleeLrOaPkOWPluWHuuadpeeJueauiuWkhOeQhizlj6rlr7nmlofku7blpLnlgZogaGFzaCDlgLzlpITnkIZcclxuICAgICAgICAgICAgaWYgKGJhc2VuYW1lKGRpcm5hbWUoZmlsZVBhdGgpKSA9PT0gdXVpZCkge1xyXG4gICAgICAgICAgICAgICAgZm9udFBhdGhzLnB1c2goZmlsZVBhdGgpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3VmZml4TWFwLm5hdGl2ZVt1dWlkXS5wdXNoKGZpbGVQYXRoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgdXVpZCBpbiBzdWZmaXhNYXAuaW1wb3J0KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGFwcGVuZE1kNVRvUGF0aHMoc3VmZml4TWFwLmltcG9ydFt1dWlkXSk7XHJcbiAgICAgICAgICAgIGlmICghcmVzKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmFzc2V0VmVyLmltcG9ydFt1dWlkXSA9IHJlcy5oYXNoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGNvbnN0IHV1aWQgaW4gc3VmZml4TWFwLm5hdGl2ZSkge1xyXG4gICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBhcHBlbmRNZDVUb1BhdGhzKHN1ZmZpeE1hcC5uYXRpdmVbdXVpZF0pO1xyXG4gICAgICAgICAgICBpZiAoIXJlcykge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hc3NldFZlci5uYXRpdmVbdXVpZF0gPSByZXMuaGFzaDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmb250UGF0aHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgcGF0aCA9IGZvbnRQYXRoc1tpXTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGhhc2ggPSBjYWxjTWQ1KHJlYWRGaWxlU3luYyhwYXRoKSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1dWlkID0gZ2V0VXVpZEZyb21QYXRoKHBhdGgpO1xyXG4gICAgICAgICAgICAgICAgcmVuYW1lU3luYyhkaXJuYW1lKHBhdGgpLCBkaXJuYW1lKHBhdGgpICsgYC4ke2hhc2h9YCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2V0VmVyLm5hdGl2ZVt1dWlkXSA9IGhhc2g7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5aGr5YWFIG1kNSDmlbDmja5cclxuICAgICAgICBjb25zdCBpbXBvcnRVVWlkcyA9IE9iamVjdC5rZXlzKHRoaXMuYXNzZXRWZXIuaW1wb3J0KS5zb3J0KCk7XHJcbiAgICAgICAgZm9yIChjb25zdCB1dWlkIG9mIGltcG9ydFVVaWRzKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jb25maWcudXVpZHMuaW5jbHVkZXModXVpZCkpIHtcclxuICAgICAgICAgICAgICAgIC8vIOWBmuS4gOWxguagoemqjOaKpemUme+8jOmBv+WFjeWcqOi/kOihjOaXtuaJjeaatOmcsua3t+a3huaOkuafpVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQ2FuIG5vdCBmaW5kIGltcG9ydCBhc3NldCgke3V1aWR9KSBpbiBidW5kbGUgJHt0aGlzLnJvb3R9LmApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcudXVpZHMucHVzaCh1dWlkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZy52ZXJzaW9ucy5pbXBvcnQucHVzaCh1dWlkLCB0aGlzLmFzc2V0VmVyLmltcG9ydFt1dWlkXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5hdGl2ZVVVaWRzID0gT2JqZWN0LmtleXModGhpcy5hc3NldFZlci5uYXRpdmUpLnNvcnQoKTtcclxuICAgICAgICBmb3IgKGNvbnN0IHV1aWQgb2YgbmF0aXZlVVVpZHMpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy51dWlkcy5pbmNsdWRlcyh1dWlkKSkge1xyXG4gICAgICAgICAgICAgICAgLy8g5YGa5LiA5bGC5qCh6aqM5oql6ZSZ77yM6YG/5YWN5Zyo6L+Q6KGM5pe25omN5pq06Zyy5re35reG5o6S5p+lXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDYW4gbm90IGZpbmQgbmF0aXZlIGFzc2V0KCR7dXVpZH0pIGluIGJ1bmRsZSAke3RoaXMucm9vdH0uYCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy51dWlkcy5wdXNoKHV1aWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLnZlcnNpb25zLm5hdGl2ZS5wdXNoKHV1aWQsIHRoaXMuYXNzZXRWZXIubmF0aXZlW3V1aWRdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgYWRkIG1kNSB0byBidW5kbGUgJHt0aGlzLm5hbWV9IHN1Y2Nlc3NgKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyB6aXBCdW5kbGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29tcHJlc3Npb25UeXBlICE9PSBCdW5kbGVDb21wcmVzc2lvblR5cGVzLlpJUCB8fCAhdGhpcy5vdXRwdXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmRlYnVnKGB6aXAgYnVuZGxlICR7dGhpcy5uYW1lfS4uLmApO1xyXG4gICAgICAgIGNvbnN0IGRlc3QgPSB0aGlzLmRlc3Q7XHJcbiAgICAgICAgY29uc3QgbmF0aXZlRGlyID0gam9pbihkZXN0LCB0aGlzLm5hdGl2ZUJhc2UpO1xyXG4gICAgICAgIGNvbnN0IGltcG9ydERpciA9IGpvaW4oZGVzdCwgdGhpcy5pbXBvcnRCYXNlKTtcclxuICAgICAgICBjb25zdCBkaXJzVG9Db21wcmVzcyA9IFtuYXRpdmVEaXIsIGltcG9ydERpcl0uZmlsdGVyKGRpciA9PiBleGlzdHNTeW5jKGRpcikpO1xyXG4gICAgICAgIGlmIChkaXJzVG9Db21wcmVzcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNaaXAgPSB0cnVlO1xyXG4gICAgICAgICAgICBhd2FpdCBjb21wcmVzc0RpcnMoZGlyc1RvQ29tcHJlc3MsIGRlc3QsIGpvaW4oZGVzdCwgQnVpbGRHbG9iYWxJbmZvLkJVTkRMRV9aSVBfTkFNRSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmRlYnVnKGB6aXAgYnVuZGxlICR7dGhpcy5uYW1lfSBzdWNjZXNzLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29tcHJlc3MoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGVidWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmRlYnVnKGBjb21wcmVzcyBjb25maWcgb2YgYnVuZGxlICR7dGhpcy5uYW1lfS4uLmApO1xyXG4gICAgICAgIGZ1bmN0aW9uIGNvbGxlY3RVdWlkcyhjb25maWc6IElCdW5kbGVDb25maWcpIHtcclxuICAgICAgICAgICAgY29uc3QgdXVpZENvdW50OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbiAgICAgICAgICAgIGNvbnN0IHV1aWRJbmRpY2VzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudW1iZXI+ID0ge307XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBhZGRVdWlkKHV1aWQ6IHN0cmluZyB8IG51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY291bnQgPSAodXVpZENvdW50W3V1aWRdIHx8IDApICsgMTtcclxuICAgICAgICAgICAgICAgIHV1aWRDb3VudFt1dWlkXSA9IGNvdW50O1xyXG4gICAgICAgICAgICAgICAgaWYgKCEodXVpZCBpbiB1dWlkSW5kaWNlcykpIHtcclxuICAgICAgICAgICAgICAgICAgICB1dWlkSW5kaWNlc1t1dWlkXSA9IHV1aWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHBhdGhzID0gY29uZmlnLnBhdGhzO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhdGggaW4gcGF0aHMpIHtcclxuICAgICAgICAgICAgICAgIGFkZFV1aWQocGF0aCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNjZW5lcyA9IGNvbmZpZy5zY2VuZXM7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBzY2VuZXMpIHtcclxuICAgICAgICAgICAgICAgIGFkZFV1aWQoc2NlbmVzW25hbWVdIGFzIHN0cmluZyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgZXh0TmFtZSBpbiBjb25maWcuZXh0ZW5zaW9uTWFwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25maWcuZXh0ZW5zaW9uTWFwW2V4dE5hbWVdLmZvckVhY2goYWRkVXVpZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHBhY2tJZHMgPSBPYmplY3Qua2V5cyhjb25maWcucGFja3MpLnNvcnQoKTtcclxuICAgICAgICAgICAgY29uc3Qgc29ydGVkUGFja0Fzc2V0czogUmVjb3JkPHN0cmluZywgQXJyYXk8c3RyaW5nIHwgbnVtYmVyPj4gPSB7fTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBwYWNrSWQgb2YgcGFja0lkcykge1xyXG4gICAgICAgICAgICAgICAgY29uZmlnLnBhY2tzW3BhY2tJZF0uZm9yRWFjaChhZGRVdWlkKTtcclxuICAgICAgICAgICAgICAgIHNvcnRlZFBhY2tBc3NldHNbcGFja0lkXSA9IGNvbmZpZy5wYWNrc1twYWNrSWRdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbmZpZy5wYWNrcyA9IHNvcnRlZFBhY2tBc3NldHM7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB2ZXJzaW9ucyA9IGNvbmZpZy52ZXJzaW9ucztcclxuICAgICAgICAgICAgZm9yIChjb25zdCBlbnRyaWVzIG9mIE9iamVjdC52YWx1ZXModmVyc2lvbnMpKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpICs9IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICBhZGRVdWlkKGVudHJpZXNbaV0gYXMgc3RyaW5nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcmVkaXJlY3QgPSBjb25maWcucmVkaXJlY3Q7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVkaXJlY3QubGVuZ3RoOyBpICs9IDIpIHtcclxuICAgICAgICAgICAgICAgIGFkZFV1aWQocmVkaXJlY3RbaV0gYXMgc3RyaW5nKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gc29ydCBieSByZWZlcmVuY2UgY291bnRcclxuICAgICAgICAgICAgY29uZmlnLnV1aWRzLnNvcnQoKGEsIGIpID0+IHV1aWRDb3VudFtiXSAtIHV1aWRDb3VudFthXSk7XHJcbiAgICAgICAgICAgIGNvbmZpZy51dWlkcy5mb3JFYWNoKCh1dWlkLCBpbmRleCkgPT4gdXVpZEluZGljZXNbdXVpZF0gPSBpbmRleCk7XHJcbiAgICAgICAgICAgIGNvbmZpZy51dWlkcyA9IGNvbmZpZy51dWlkcy5tYXAoKHV1aWQpID0+IHV0aWxzLlVVSUQuY29tcHJlc3NVVUlEKHV1aWQsIHRydWUpKTtcclxuICAgICAgICAgICAgcmV0dXJuIHV1aWRJbmRpY2VzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZztcclxuICAgICAgICBjb25zdCB1dWlkSW5kaWNlcyA9IGNvbGxlY3RVdWlkcyhjb25maWcpO1xyXG4gICAgICAgIGNvbnN0IHBhdGhzID0gY29uZmlnLnBhdGhzO1xyXG4gICAgICAgIGNvbnN0IG5ld1BhdGhzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0gY29uZmlnLnBhdGhzID0ge307XHJcbiAgICAgICAgY29uc3QgdHlwZXM6IHN0cmluZ1tdID0gY29uZmlnLnR5cGVzID0gW107XHJcbiAgICAgICAgZm9yIChjb25zdCB1dWlkIGluIHBhdGhzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gcGF0aHNbdXVpZF07XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gdXVpZEluZGljZXNbdXVpZF07XHJcbiAgICAgICAgICAgIGxldCB0eXBlSW5kZXggPSB0eXBlcy5pbmRleE9mKGVudHJ5WzFdKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHR5cGVJbmRleCA9IHR5cGVzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHR5cGVzLnB1c2goZW50cnlbMV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVudHJ5WzFdID0gdHlwZUluZGV4O1xyXG4gICAgICAgICAgICBuZXdQYXRoc1tpbmRleF0gPSBlbnRyeTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5byV5pOO5bCa5pyq5a+55o6l5L2/55SoIGh0dHBzOi8vZ2l0aHViLmNvbS9jb2Nvcy8zZC10YXNrcy9pc3N1ZXMvMTYxNTJcclxuICAgICAgICAvLyBjb25zdCBuZXdEZXBlbmRlbmN5UmVsYXRpb25zaGlwczogUmVjb3JkPHN0cmluZywgQXJyYXk8c3RyaW5nIHwgbnVtYmVyPj4gPSB7fTtcclxuICAgICAgICAvLyBmb3IgKGNvbnN0IHV1aWQgaW4gY29uZmlnLmRlcGVuZGVuY3lSZWxhdGlvbnNoaXBzKSB7XHJcbiAgICAgICAgLy8gICAgIGxldCBkZXBlbmRzOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+ID0gY29uZmlnLmRlcGVuZGVuY3lSZWxhdGlvbnNoaXBzW3V1aWRdO1xyXG4gICAgICAgIC8vICAgICBjb25zdCBpbmRleCA9IHV1aWRJbmRpY2VzW3V1aWRdID8/IHV0aWxzLnN0cmluZy5jb21wcmVzc1VVSUQodXVpZCwgdHJ1ZSk7XHJcbiAgICAgICAgLy8gICAgIGRlcGVuZHMgPSBkZXBlbmRzLm1hcCgodXVpZCkgPT4gdXVpZEluZGljZXNbdXVpZF0gPz8gdXRpbHMuc3RyaW5nLmNvbXByZXNzVVVJRCh1dWlkIGFzIHN0cmluZywgdHJ1ZSkpO1xyXG4gICAgICAgIC8vICAgICBuZXdEZXBlbmRlbmN5UmVsYXRpb25zaGlwc1tpbmRleF0gPSBkZXBlbmRzO1xyXG4gICAgICAgIC8vIH1cclxuICAgICAgICAvLyBjb25maWcuZGVwZW5kZW5jeVJlbGF0aW9uc2hpcHMgPSBuZXdEZXBlbmRlbmN5UmVsYXRpb25zaGlwcztcclxuXHJcbiAgICAgICAgY29uc3Qgc2NlbmVzID0gY29uZmlnLnNjZW5lcztcclxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gc2NlbmVzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNjZW5lID0gc2NlbmVzW25hbWVdO1xyXG4gICAgICAgICAgICBjb25zdCB1dWlkSW5kZXggPSB1dWlkSW5kaWNlc1tzY2VuZV07XHJcbiAgICAgICAgICAgIHNjZW5lc1tuYW1lXSA9IE51bWJlcih1dWlkSW5kZXgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBleHROYW1lIGluIGNvbmZpZy5leHRlbnNpb25NYXApIHtcclxuICAgICAgICAgICAgY29uc3QgdXVpZHMgPSBjb25maWcuZXh0ZW5zaW9uTWFwW2V4dE5hbWVdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHV1aWRzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1dWlkSW5kZXggPSB1dWlkSW5kaWNlc1t1dWlkc1tpXV07XHJcbiAgICAgICAgICAgICAgICB1dWlkc1tpXSA9IHV1aWRJbmRleDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1dWlkcy5zb3J0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwYWNrZWRBc3NldHMgPSBjb25maWcucGFja3M7XHJcbiAgICAgICAgZm9yIChjb25zdCBwYWNrSWQgaW4gcGFja2VkQXNzZXRzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhY2tlZElkcyA9IHBhY2tlZEFzc2V0c1twYWNrSWRdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhY2tlZElkcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXVpZEluZGV4ID0gdXVpZEluZGljZXNbcGFja2VkSWRzW2ldXTtcclxuICAgICAgICAgICAgICAgIHBhY2tlZElkc1tpXSA9IHV1aWRJbmRleDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVkaXJlY3QgPSBjb25maWcucmVkaXJlY3Q7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWRpcmVjdC5sZW5ndGg7IGkgKz0gMikge1xyXG4gICAgICAgICAgICBjb25zdCB1dWlkSW5kZXggPSB1dWlkSW5kaWNlc1tyZWRpcmVjdFtpXV07XHJcbiAgICAgICAgICAgIHJlZGlyZWN0W2ldID0gTnVtYmVyKHV1aWRJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5kZWJ1Zykge1xyXG4gICAgICAgICAgICBjb25zdCB2ZXJzaW9ucyA9IHRoaXMuY29uZmlnLnZlcnNpb25zO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVudHJpZXMgb2YgT2JqZWN0LnZhbHVlcyh2ZXJzaW9ucykpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkgKz0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHV1aWRJbmRleCA9IHV1aWRJbmRpY2VzW2VudHJpZXNbaV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIGVudHJpZXNbaV0gPSBOdW1iZXIodXVpZEluZGV4KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmRlYnVnKGBjb21wcmVzcyBjb25maWcgb2YgYnVuZGxlICR7dGhpcy5uYW1lfSBzdWNjZXNzYCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmlbTnkIYgSlNPTiDliIbnu4Tku6Xlj4rotYTmupDot6/lvoTmlbDmja7liLAgY29uZmlnIOWGhVxyXG4gICAgICovXHJcbiAgICBhc3luYyBnZW5QYWNrZWRBc3NldHNDb25maWcoKSB7XHJcbiAgICAgICAgLy8g6YeN5paw6K6h566X5LiA5qyh77yM5Lit6Ze06L+H56iL5Y+v6IO95Lya5paw5aKe5pWw5o2uXHJcbiAgICAgICAgdGhpcy5jb25maWcudXVpZHMgPSB0aGlzLmFzc2V0cy5zb3J0KCk7XHJcbiAgICAgICAgY29uc3QgcmVkaXJlY3Q6IChzdHJpbmcgfCBudW1iZXIpW10gPSB0aGlzLmNvbmZpZy5yZWRpcmVjdCA9IFtdO1xyXG4gICAgICAgIGNvbnN0IHV1aWRzID0gT2JqZWN0LmtleXModGhpcy5yZWRpcmVjdCkuc29ydCgpO1xyXG4gICAgICAgIGZvciAoY29uc3QgdXVpZCBvZiB1dWlkcykge1xyXG4gICAgICAgICAgICByZWRpcmVjdC5wdXNoKHV1aWQsIFN0cmluZyh0aGlzLmNvbmZpZy5kZXBzLmluZGV4T2YodGhpcy5yZWRpcmVjdFt1dWlkXSkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5jb25maWcuZXh0ZW5zaW9uTWFwKS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jb25maWcuZXh0ZW5zaW9uTWFwW2tleV0uc29ydCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIGdyb3VwIOmHjOeahOaVsOaNrui9rOaNouaIkCBwYWNrZWRBc3NldHMg5pWw5o2uXHJcbiAgICAgICAgY29uc3QgdXNlZFV1aWRzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgdGhpcy5ncm91cHMpIHtcclxuICAgICAgICAgICAgaWYgKCFncm91cC5uYW1lKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGlmIChncm91cC51dWlkcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOi/memHjOeahCB1dWlkcyDkuI3og73mjpLluo/vvIzlnKgganNvbiDliIbnu4TnlJ/miJDpmLbmrrXlsLHpnIDopoHnoa7lrprvvIxncm91cC51dWlkcyDpnIDopoHnlKjlgZrmlbDmja7mn6Xor6LvvIxjb25maWcucGFja3Mg5ZCO57ut5Lya5Y6L57yp77yM6ZyA6KaB5rex5ou36LSdXHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLnBhY2tzW2dyb3VwLm5hbWUhXSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZ3JvdXAudXVpZHMpKTtcclxuICAgICAgICAgICAgZ3JvdXAudXVpZHMuZm9yRWFjaCgodXVpZDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB1c2VkVXVpZHMucHVzaCh1dWlkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOmcgOimgeWcqOavlOi+g+aZmuacn+eahOaXtuWAmei/m+ihjO+8jOWboOS4uuacieS6m+WbvumbhuebuOWFs+i1hOa6kOWPr+iDveWboOS4uuS4jeWQjOeahOmFjee9rumAiemhuei/h+a7pOenu+WHuiBCdW5kbGVcclxuICAgICAgICBhd2FpdCB0aGlzLmluaXRBc3NldFBhdGhzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmjIflrprnmoQgdXVpZCDotYTmupDmmK/lkKbljIXlkKvlnKjmnoTlu7rotYTmupDkuK1cclxuICAgICAqIEBwYXJhbSBkZWVwIOaYr+WQpua3seW6puafpeaJvu+8jOaMh+WumiB1dWlkIOeahOWFs+iBlOi1hOa6kOWtmOWcqOWNs+inhuS4uuWtmOWcqCBCdW5kbGUg5YyF5ZCr6K+l6LWE5rqQ77yM5L6L5aaC5pyq55Sf5oiQ5Zu+6ZuG5bqP5YiX5YyW6LWE5rqQ5L2G5piv5ZCI5Zu+IEltYWdlIOWtmOWcqOeahOaDheWGtVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY29udGFpbnNBc3NldCh1dWlkOiBzdHJpbmcsIGRlZXAgPSBmYWxzZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JpcHRzLmhhcyh1dWlkKVxyXG4gICAgICAgICAgICB8fCB0aGlzLl9hc3NldHMuaGFzKHV1aWQpXHJcbiAgICAgICAgICAgIHx8ICEhdGhpcy5fc2NlbmVzW3V1aWRdXHJcbiAgICAgICAgICAgIHx8IChkZWVwID8gISEodGhpcy5hdGxhc1Jlcy5hdGxhc1RvSW1hZ2VzW3V1aWRdICYmIHRoaXMuYXRsYXNSZXMuYXRsYXNUb0ltYWdlc1t1dWlkXS5sZW5ndGgpIDogZmFsc2UpO1xyXG4gICAgfVxyXG5cclxufSJdfQ==