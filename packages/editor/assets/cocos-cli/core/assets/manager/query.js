"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAssets = searchAssets;
const asset_db_1 = require("@cocos/asset-db");
const path_1 = require("path");
const utils_1 = require("../utils");
const asset_db_2 = __importDefault(require("./asset-db"));
const asset_handler_1 = __importDefault(require("./asset-handler"));
const scripting_1 = __importDefault(require("../../scripting"));
const i18n_1 = __importDefault(require("../../base/i18n"));
const asset_config_1 = __importDefault(require("../asset-config"));
const minimatch_1 = __importDefault(require("minimatch"));
const utils_2 = __importDefault(require("../../base/utils"));
const fs_extra_1 = require("fs-extra");
class AssetQueryManager {
    /**
     * 1. 资源/脚本 uuid, asset -> uuid 依赖的普通资源列表
     * 2. 资源 uuid, script -> uuid 依赖的脚本列表
     * 3. 脚本 uuid, script -> uuid 脚本依赖的脚本列表
     * @param uuidOrURL
     * @param type
     * @returns
     */
    async queryAssetDependencies(uuidOrURL, type = 'asset') {
        const asset = this.queryAsset(uuidOrURL);
        if (!asset) {
            return [];
        }
        let uuids = [];
        if (['asset', 'all'].includes(type)) {
            uuids = this.queryAssetProperty(asset, 'depends');
        }
        if (['script', 'all'].includes(type)) {
            const ccType = this.queryAssetProperty(asset, 'type');
            if (ccType === 'cc.Script') {
                // 返回依赖脚本的 db URL
                // const pathList: string[] = await Editor.Message.request('programming', 'packer-driver/query-script-deps', asset.source);
                // uuids.push(...pathList.map(path => queryUUID(path)));
            }
            else {
                uuids.push(...this.queryAssetProperty(asset, 'dependScripts'));
            }
        }
        return uuids;
    }
    /**
     * 1. 资源/脚本 uuid, asset -> 使用 uuid 的普通资源列表
     * 2. 资源 uuid, script -> 使用 uuid 的脚本列表
     * 3. 脚本 uuid，script -> 使用此 uuid 脚本的脚本列表
     * @param uuidOrURL
     * @param type
     * @returns
     */
    async queryAssetUsers(uuidOrURL, type = 'asset') {
        const asset = this.queryAsset(uuidOrURL);
        if (!asset) {
            return [];
        }
        const ccType = this.queryAssetProperty(asset, 'type');
        let usages = [];
        if (['asset', 'all'].includes(type)) {
            if (ccType === 'cc.Script') {
                usages = this.queryAssetProperty(asset, 'dependedScripts');
            }
            else {
                usages = this.queryAssetProperty(asset, 'dependeds');
            }
        }
        if (['script', 'all'].includes(type)) {
            if (ccType === 'cc.Script') {
                const pathList = await scripting_1.default.queryScriptUsers(asset.source);
                pathList.forEach(path => usages.push((0, asset_db_1.queryUUID)(path)));
            }
            else {
                // 查询依赖此资源的脚本，目前依赖信息都记录在场景上，所以实际上并没有脚本会依赖资源，代码写死是无法查询的
            }
        }
        return usages;
    }
    /**
     * 传入一个 uuid 或者 url 或者绝对路径，查询指向的资源
     * @param uuidOrURLOrPath
     */
    queryAsset(uuidOrURLOrPath) {
        const uuid = utils_2.default.UUID.isUUID(uuidOrURLOrPath) ? uuidOrURLOrPath : this.queryUUID(uuidOrURLOrPath);
        for (const name in asset_db_2.default.assetDBMap) {
            const database = asset_db_2.default.assetDBMap[name];
            if (!database) {
                continue;
            }
            // 查找的是数据库, 由于数据库的单条数据不在 database 里，所以需要这里单独返回
            if (uuid === `db://${name}`) {
                return {
                    displayName: '',
                    basename: name,
                    extname: '',
                    imported: true,
                    source: `db://${name}`,
                    subAssets: {},
                    library: '',
                    parent: null,
                    userData: {},
                    isDirectory() {
                        return false;
                    },
                    uuid: `db://${name}`,
                    meta: {
                        ver: '1.0.0',
                        uuid: `db://${name}`,
                        name: name,
                        id: name,
                        subMetas: {},
                        userData: {},
                        importer: 'database',
                        imported: true,
                        files: [],
                        displayName: '',
                    },
                };
            }
            const asset = database.getAsset(uuid || '');
            if (asset) {
                return asset;
            }
        }
        return null;
    }
    queryAssetInfo(urlOrUUIDOrPath, dataKeys) {
        if (!urlOrUUIDOrPath || typeof urlOrUUIDOrPath !== 'string') {
            throw new Error('parameter error');
        }
        let uuid = '';
        if (urlOrUUIDOrPath.startsWith('db://')) {
            const name = urlOrUUIDOrPath.substr(5);
            if (asset_db_2.default.assetDBMap[name]) {
                return this.queryDBAssetInfo(name);
            }
            uuid = (0, utils_1.url2uuid)(urlOrUUIDOrPath);
        }
        else if ((0, path_1.isAbsolute)(urlOrUUIDOrPath)) {
            for (const name in asset_db_2.default.assetDBMap) {
                const database = asset_db_2.default.assetDBMap[name];
                if (!database) {
                    continue;
                }
                if (database.path2asset.has(urlOrUUIDOrPath)) {
                    uuid = database.path2asset.get(urlOrUUIDOrPath).uuid;
                    break;
                }
            }
        }
        else {
            uuid = urlOrUUIDOrPath;
        }
        if (!uuid) {
            return null;
        }
        return this.queryAssetInfoByUUID(uuid, dataKeys);
    }
    /**
     * 查询指定资源的信息
     * @param uuid 资源的唯一标识符
     * @param dataKeys 资源输出可选项
     */
    queryAssetInfoByUUID(uuid, dataKeys) {
        if (!uuid) {
            return null;
        }
        // 查询资源
        const asset = (0, asset_db_1.queryAsset)(uuid);
        if (!asset) {
            return null;
        }
        return this.encodeAsset(asset, dataKeys);
    }
    /**
     * 根据提供的 options 查询对应的资源数组(不包含数据库对象)
     * @param options 搜索配置
     * @param dataKeys 指定需要的资源信息字段
     */
    queryAssetInfos(options, dataKeys) {
        let allAssets = [];
        const dbInfos = [];
        // 循环每一个已经启动的 database
        for (const name in asset_db_2.default.assetDBMap) {
            const database = asset_db_2.default.assetDBMap[name];
            allAssets = allAssets.concat(Array.from(database.uuid2asset.values()));
            dbInfos.push(this.queryDBAssetInfo(name));
        }
        let filterAssets = allAssets;
        if (options) {
            if (options.isBundle) {
                // 兼容旧版本使用 isBundle 查询会默认带上 meta 的行为
                dataKeys = (dataKeys || []).concat(['meta']);
            }
            // 根据选项筛选过滤的函数信息
            const filterInfos = FilterHandlerInfos.filter(info => {
                info.value = options[info.name];
                if (info.resolve) {
                    info.value = info.resolve(info.value);
                }
                if (info.value === undefined) {
                    return false;
                }
                return true;
            });
            filterAssets = searchAssets(filterInfos, allAssets);
        }
        const result = filterAssets.map((asset) => this.encodeAsset(asset, dataKeys));
        if (!options || (allAssets.length && allAssets.length === result.length)) {
            // 无效过滤条件或者查询全部资源时需要包含默认 db 的资源，主要为了兼容旧版本的接口行为，正常资源查询应该不包含数据库对象
            return result.concat(dbInfos);
        }
        else if (options.pattern && Object.keys(options).length === 1) {
            // 存在 pattern 参数时，需要包含数据库对象，主要是兼容旧版本行为
            return dbInfos.filter((db) => {
                return (0, minimatch_1.default)(db.url, options.pattern);
            }).concat(result);
        }
        else {
            return result;
        }
    }
    queryAssets(options = {}) {
        if (typeof options !== 'object' || Array.isArray(options)) {
            options = {};
        }
        let assets = [];
        // 循环每一个已经启动的 database
        for (const name in asset_db_2.default.assetDBMap) {
            if (!(name in asset_db_2.default.assetDBMap)) {
                continue;
            }
            const database = asset_db_2.default.assetDBMap[name];
            assets = assets.concat(Array.from(database.uuid2asset.values()));
        }
        if (options) {
            // 根据选项筛选过滤的函数信息
            const filterInfos = FilterHandlerInfos.filter(info => {
                info.value = options[info.name];
                if (info.resolve) {
                    info.value = info.resolve(info.value);
                }
                if (info.value === undefined) {
                    return false;
                }
                return true;
            });
            assets = searchAssets(filterInfos, assets);
        }
        return assets;
    }
    /**
     * 查询符合某个筛选规则的排序后的插件脚本列表
     * @param filterOptions
     * @returns
     */
    querySortedPlugins(filterOptions = {}) {
        const plugins = this.queryAssetInfos({
            ccType: 'cc.Script',
            userData: {
                ...filterOptions,
                isPlugin: true,
            },
        }, ['name']);
        if (!plugins.length) {
            return [];
        }
        // 1. 先按照默认插件脚本的排序规则，取插件脚本名称排序
        plugins.sort((a, b) => a.name.localeCompare(b.name));
        // 2. 根据项目设置内配置好的脚本优先级顺序，调整原有的脚本排序
        const sorted = asset_config_1.default.data.sortingPlugin;
        if (Array.isArray(sorted) && sorted.length) {
            // 过滤掉用户配置排序中不符合当前环境或者说不存在的插件脚本
            const filterSorted = sorted.filter((uuid) => plugins.find(info => info.uuid === uuid));
            // 倒序处理主要是为了兼容 383 之前的处理规则，保持一致的结果行为。顺序排结果有差异。
            filterSorted.reverse().reduce((preIndex, current) => {
                const currentIndex = plugins.findIndex((info) => info.uuid === current);
                if (currentIndex > preIndex) {
                    const scripts = plugins.splice(currentIndex, 1);
                    plugins.splice(preIndex, 0, scripts[0]);
                    return preIndex;
                }
                return currentIndex;
            }, plugins.length);
        }
        return plugins.map((asset) => {
            return {
                uuid: asset.uuid,
                file: asset.library['.js'],
                url: asset.url,
            };
        });
    }
    /**
     * 将一个 Asset 转成 info 对象
     * @param database
     * @param asset
     * @param invalid 是否是无效的资源，例如已被删除的资源
     */
    encodeAsset(asset, dataKeys = ['subAssets', 'displayName'], invalid = false) {
        let name = '';
        let source = '';
        let file = '';
        const database = asset._assetDB;
        if (asset.uuid === asset.source || (asset instanceof asset_db_1.Asset && asset.source)) {
            name = (0, path_1.basename)(asset.source);
            source = asset_db_2.default.path2url(asset.source, database.options.name);
            file = asset.source;
        }
        else {
            name = asset._name;
        }
        let loadUrl = name;
        let url = name;
        // 注：asset.uuid === asset.source 是 mac 上的 db://assets
        if (asset.uuid === asset.source || asset instanceof asset_db_1.Asset) {
            url = loadUrl = source;
        }
        else {
            let parent = asset.parent;
            while (parent && !(parent instanceof asset_db_1.Asset)) {
                loadUrl = `${parent._name}/${name}`;
                parent = parent.parent;
            }
            // @ts-ignore
            if (parent instanceof asset_db_1.Asset) {
                const ext = (0, path_1.extname)(parent._source);
                const tempSource = asset_db_2.default.path2url(parent._source, database.options.name);
                url = tempSource + '/' + loadUrl;
                loadUrl = tempSource.substr(0, tempSource.length - ext.length) + '/' + loadUrl;
            }
        }
        let isDirectory = false;
        try {
            isDirectory = asset.isDirectory();
        }
        catch (error) {
            if (invalid) {
                // 被删除的资源此处抛异常不报错
                console.debug(error);
            }
            else {
                console.error(error);
            }
            isDirectory = (0, path_1.extname)(asset.source) === '';
        }
        if (!isDirectory) {
            loadUrl = loadUrl.replace(/\.[^./]+$/, '');
        }
        const info = {
            name,
            displayName: asset.displayName,
            source,
            loadUrl, // loader 加载使用的路径
            url, // 实际的带有扩展名的路径
            file, // 实际磁盘路径
            uuid: asset.uuid,
            importer: asset.meta.importer,
            imported: asset.meta.imported, // 是否结束导入过程
            invalid: asset.invalid, // 是否导入成功
            type: this.queryAssetProperty(asset, 'type'),
            isDirectory,
            readonly: database.options.readonly,
            library: (0, utils_1.libArr2Obj)(asset),
        };
        dataKeys.forEach((key) => {
            // @ts-ignore 2322
            info[key] = this.queryAssetProperty(asset, key) ?? info[key];
        });
        // 没有显示指定获取 isBundle 字段时，默认只有 bundle 文件夹才会加上标记
        if (!dataKeys.includes('isBundle')) {
            const value = this.queryAssetProperty(asset, 'isBundle');
            if (value) {
                info.isBundle = true;
            }
        }
        if (dataKeys.includes('parent') && asset.parent) {
            info.parent = {
                source: asset.parent.source,
                library: (0, utils_1.libArr2Obj)(asset.parent),
                uuid: asset.parent.uuid,
            };
        }
        if (dataKeys.includes('subAssets')) {
            info.subAssets = {};
            for (const name in asset.subAssets) {
                if (!(name in asset.subAssets)) {
                    continue;
                }
                const childInfo = this.encodeAsset(asset.subAssets[name], dataKeys);
                info.subAssets[name] = childInfo;
            }
        }
        return info;
    }
    queryAssetProperty(asset, property) {
        switch (property) {
            case 'loadUrl':
                {
                    const name = this.queryAssetProperty(asset, 'name');
                    let loadUrl = name;
                    // 注：asset.uuid === asset.source 是 mac 上的 db://assets
                    if (asset instanceof asset_db_1.Asset) {
                        loadUrl = asset_db_2.default.path2url(asset.source, asset._assetDB.options.name);
                    }
                    else {
                        let parent = asset.parent;
                        while (parent && !(parent instanceof asset_db_1.Asset)) {
                            loadUrl = `${parent._name}/${name}`;
                            parent = parent.parent;
                        }
                        // @ts-ignore
                        if (parent instanceof asset_db_1.Asset) {
                            const ext = (0, path_1.extname)(parent._source);
                            const tempSource = asset_db_2.default.path2url(parent._source, asset._assetDB.options.name);
                            loadUrl = tempSource.substr(0, tempSource.length - ext.length) + '/' + loadUrl;
                        }
                    }
                    const isDirectory = asset.isDirectory();
                    if (!isDirectory) {
                        loadUrl = loadUrl.replace(/\.[^./]+$/, '');
                    }
                    return loadUrl;
                }
            case 'name':
                if (asset.uuid === asset.source || (asset instanceof asset_db_1.Asset && asset.source)) {
                    return (0, path_1.basename)(asset.source);
                }
                else {
                    return asset._name;
                }
            case 'readonly':
                return asset._assetDB.options.readonly;
            case 'url':
                {
                    const name = this.queryAssetProperty(asset, 'name');
                    if (asset.uuid === asset.source || asset instanceof asset_db_1.Asset) {
                        return asset_db_2.default.path2url(asset.source, asset._assetDB.options.name);
                    }
                    else {
                        let path = name;
                        let parent = asset.parent;
                        while (parent && !(parent instanceof asset_db_1.Asset)) {
                            path = `${parent._name}/${name}`;
                            parent = parent.parent;
                        }
                        // @ts-ignore
                        if (parent instanceof asset_db_1.Asset) {
                            const tempSource = asset_db_2.default.path2url(parent._source, asset._assetDB.options.name);
                            return tempSource + '/' + path;
                        }
                        else {
                            return path;
                        }
                    }
                }
            case 'type':
                {
                    const handler = asset_handler_1.default.name2handler[asset.meta.importer] || asset._assetDB.importerManager.name2importer[asset.meta.importer] || null;
                    return handler ? handler.assetType || 'cc.Asset' : 'cc.Asset';
                }
            case 'isBundle':
                return asset.meta.userData && asset.meta.userData.isBundle;
            case 'instantiation':
                {
                    const handler = asset_handler_1.default.name2handler[asset.meta.importer] || asset._assetDB.importerManager.name2importer[asset.meta.importer] || null;
                    return handler ? handler.instantiation : undefined;
                }
            case 'library':
                return (0, utils_1.libArr2Obj)(asset);
            case 'displayName':
                return asset.displayName;
            case 'redirect':
                // 整理跳转数据
                if (asset.meta.userData && asset.meta.userData.redirect) {
                    const redirectInfo = this.queryAsset(asset.meta.userData.redirect);
                    if (redirectInfo) {
                        const redirectHandler = asset_handler_1.default.name2handler[redirectInfo.meta.importer] || null;
                        return {
                            uuid: redirectInfo.uuid,
                            type: redirectHandler ? redirectHandler.assetType || 'cc.Asset' : 'cc.Asset',
                        };
                    }
                }
                return;
            case 'extends':
                {
                    // 此处兼容了旧的资源导入器
                    const CCType = this.queryAssetProperty(asset, 'type');
                    return (0, utils_1.getExtendsFromCCType)(CCType);
                }
            case 'visible':
                {
                    // @ts-ignore TODO 底层 options 并无此字段
                    let visible = asset._assetDB.options.visible;
                    if (visible && asset.userData.visible === false) {
                        visible = false;
                    }
                    return visible === false ? false : true;
                }
            case 'mtime':
                {
                    const info = asset._assetDB.infoManager.get(asset.source);
                    return info ? info.time : null;
                }
            case 'meta':
                return asset.meta;
            case 'depends':
                {
                    return Array.from(asset.getData('depends') || []);
                }
            case 'dependeds':
                {
                    const usedList = [];
                    function collectUuid(depends, uuid) {
                        if (depends.includes(asset.uuid)) {
                            usedList.push(uuid);
                        }
                    }
                    (0, asset_db_1.forEach)((db) => {
                        const map = db.dataManager.dataMap;
                        for (const id in map) {
                            const item = map[id];
                            if (item.value && item.value.depends && item.value.depends.length) {
                                collectUuid(item.value.depends, id);
                            }
                        }
                    });
                    return usedList;
                }
            case 'dependScripts':
                {
                    const data = asset._assetDB.dataManager.dataMap[asset.uuid];
                    return Array.from(data && data.value && data.value['dependScripts'] || []);
                }
            case 'dependedScripts':
                {
                    const usedList = [];
                    (0, asset_db_1.forEach)((db) => {
                        const map = db.dataManager.dataMap;
                        for (const id in map) {
                            const item = map[id];
                            if (item.value && item.value.dependScripts && item.value.dependScripts.includes(asset.uuid)) {
                                usedList.push(id);
                            }
                        }
                    });
                    return usedList;
                }
        }
    }
    /**
     * 查询指定的资源的 meta
     * @param uuidOrURLOrPath 资源的唯一标识符
     */
    queryAssetMeta(uuidOrURLOrPath) {
        if (!uuidOrURLOrPath || typeof uuidOrURLOrPath !== 'string') {
            return null;
        }
        let uuid = uuidOrURLOrPath;
        if (uuidOrURLOrPath.startsWith('db://')) {
            const name = uuidOrURLOrPath.substr(5);
            if (asset_db_2.default.assetDBMap[name]) {
                // @ts-ignore DB 数据库并不存在 meta 理论上并不需要返回，但旧版本已支持
                return {
                    // displayName: name,
                    files: [],
                    // id: '',
                    imported: true,
                    importer: 'database',
                    // name: '',
                    subMetas: {},
                    userData: {},
                    uuid: uuidOrURLOrPath,
                    ver: '1.0.0',
                };
            }
            uuid = (0, utils_1.url2uuid)(uuidOrURLOrPath);
        }
        const asset = (0, asset_db_1.queryAsset)(uuid);
        if (!asset) {
            return null;
        }
        return asset.meta;
    }
    /**
     * 查询指定的资源以及对应 meta 的 mtime
     * @param uuid 资源的唯一标识符
     */
    queryAssetMtime(uuid) {
        if (!uuid || typeof uuid !== 'string') {
            return null;
        }
        for (const name in asset_db_2.default.assetDBMap) {
            if (!(name in asset_db_2.default.assetDBMap)) {
                continue;
            }
            const database = asset_db_2.default.assetDBMap[name];
            if (!database) {
                continue;
            }
            const asset = database.getAsset(uuid);
            if (asset) {
                const info = database.infoManager.get(asset.source);
                return info ? info.time : null;
            }
        }
        return null;
    }
    queryUUID(urlOrPath) {
        if (!urlOrPath || typeof urlOrPath !== 'string') {
            return null;
        }
        if (urlOrPath.startsWith('db://')) {
            const name = urlOrPath.substr(5);
            if (asset_db_2.default.assetDBMap[name]) {
                return `db://${name}`;
            }
            const uuid = (0, utils_1.url2uuid)(urlOrPath);
            if (uuid) {
                return uuid;
            }
        }
        try {
            return (0, asset_db_1.queryUUID)(urlOrPath);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * db 根节点不是有效的 asset 类型资源
     * 这里伪造一份它的数据信息
     * @param name db name
     */
    queryDBAssetInfo(name) {
        const dbInfo = asset_db_2.default.assetDBInfo[name];
        if (!dbInfo) {
            return null;
        }
        const info = {
            name,
            displayName: name || '',
            source: `db://${name}`,
            loadUrl: `db://${name}`,
            url: `db://${name}`,
            file: dbInfo.target, // 实际磁盘路径
            uuid: `db://${name}`,
            importer: 'database',
            imported: true,
            invalid: false,
            type: 'cce.Database',
            isDirectory: false,
            library: {},
            subAssets: {},
            readonly: dbInfo.readonly,
        };
        return info;
    }
    queryUrl(uuidOrPath) {
        if (!uuidOrPath || typeof uuidOrPath !== 'string') {
            throw new Error('parameter error');
        }
        // 根路径 /assets, /internal 对应的 url 模拟数据
        const name = uuidOrPath.substr(asset_config_1.default.data.root.length + 1);
        if (asset_db_2.default.assetDBMap[name]) {
            return `db://${name}`;
        }
        return (0, asset_db_1.queryUrl)(uuidOrPath);
    }
    queryPath(urlOrUuid) {
        if (!urlOrUuid || typeof urlOrUuid !== 'string') {
            return '';
        }
        if (urlOrUuid.startsWith('db://')) {
            const name = urlOrUuid.substr(5);
            if (asset_db_2.default.assetDBMap[name]) {
                return asset_db_2.default.assetDBMap[name].options.target;
            }
            const uuid = (0, utils_1.url2uuid)(urlOrUuid);
            if (uuid) {
                return (0, asset_db_1.queryPath)(uuid);
            }
        }
        return (0, asset_db_1.queryPath)(urlOrUuid);
    }
    generateAvailableURL(url) {
        if (!url || typeof url !== 'string') {
            return '';
        }
        const path = (0, asset_db_1.queryPath)(url);
        if (!path) {
            return '';
        }
        else if (!(0, fs_extra_1.existsSync)(path)) {
            return url;
        }
        const newPath = utils_2.default.File.getName(path);
        return (0, asset_db_1.queryUrl)(newPath);
    }
}
const assetQuery = new AssetQueryManager();
// 允许使用全局变量去查询 db 的一些数据信息
if (!globalThis.assetQuery) {
    globalThis.assetQuery = assetQuery;
}
exports.default = assetQuery;
// 根据资源类型筛选
const TYPES = {
    scripts: ['.js', '.ts'],
    scene: ['.scene'],
    effect: ['.effect'],
    image: ['.jpg', '.png', '.jpeg', '.webp', '.tga'],
};
function searchAssets(filterHandlerInfos, assets, resultAssets = []) {
    if (!filterHandlerInfos.length) {
        return assets;
    }
    assets.forEach((asset) => {
        if (asset.subAssets && Object.keys(asset.subAssets).length > 0) {
            searchAssets(filterHandlerInfos, Object.values(asset.subAssets), resultAssets);
        }
        const unMatch = filterHandlerInfos.some((filterHandlerInfo) => {
            if (filterHandlerInfo.value === undefined) {
                return false;
            }
            return !filterHandlerInfo.handler(filterHandlerInfo.value, asset);
        });
        if (!unMatch) {
            resultAssets.push(asset);
        }
    });
    return resultAssets;
}
function filterUserDataInfo(userDataFilters, asset) {
    return !Object.keys(userDataFilters).some((key) => userDataFilters[key] !== asset.meta.userData[key]);
}
const FilterHandlerInfos = [{
        name: 'ccType',
        handler: (ccTypes, asset) => {
            return ccTypes.includes(assetQuery.queryAssetProperty(asset, 'type'));
        },
        resolve: (value) => {
            if (typeof value === 'string') {
                if (typeof value === 'string') {
                    return [value.trim()];
                }
                else if (Array.isArray(value)) {
                    return value;
                }
                else {
                    return undefined;
                }
            }
            return value;
        },
    }, {
        name: 'pattern',
        handler: (value, asset) => {
            const loadUrl = assetQuery.queryAssetProperty(asset, 'loadUrl');
            const url = assetQuery.queryAssetProperty(asset, 'url');
            return (0, minimatch_1.default)(loadUrl, value) || (0, minimatch_1.default)(url, value);
        },
        resolve: (value) => {
            return typeof value === 'string' ? value : undefined;
        },
    }, {
        name: 'importer',
        handler: (importers, asset) => {
            return importers.includes(asset.meta.importer);
        },
        resolve: (value) => {
            if (typeof value === 'string') {
                if (typeof value === 'string') {
                    return [value.trim()];
                }
                else if (Array.isArray(value)) {
                    return value;
                }
                else {
                    return;
                }
            }
        },
    }, {
        name: 'isBundle',
        handler: (value, asset) => {
            return (!!assetQuery.queryAssetProperty(asset, 'isBundle')) === value;
        },
    }, {
        name: 'extname',
        handler: (extensionNames, asset) => {
            const extension = (0, path_1.extname)(asset.source).toLowerCase();
            if (extensionNames.includes(extension) && !/\.d\.ts$/.test(asset.source)) {
                return true;
            }
            return false;
        },
        resolve(value) {
            if (typeof value === 'string') {
                return [value.trim().toLocaleLowerCase()];
            }
            else if (Array.isArray(value)) {
                return value.map(name => name.trim().toLocaleLowerCase());
            }
            else {
                return;
            }
        },
    }, {
        name: 'userData',
        handler: (value, asset) => {
            return filterUserDataInfo(value, asset);
        },
    }, {
        name: 'type',
        handler: (types, asset) => {
            return types.includes((0, path_1.extname)(asset.source)) && !/\.d\.ts$/.test(asset.source);
        },
        resolve: (value) => {
            const types = TYPES[value];
            if (!types) {
                return;
            }
            console.warn(i18n_1.default.t('assets.deprecated_tip', {
                oldName: 'options.type',
                newName: 'options.ccType',
                version: '3.8.0',
            }));
            return types;
        },
    }];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvbWFuYWdlci9xdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQW92QkEsb0NBd0JDO0FBNXdCRCw4Q0FBb0g7QUFDcEgsK0JBQXFEO0FBSXJELG9DQUFzRTtBQUN0RSwwREFBd0M7QUFDeEMsb0VBQWtEO0FBQ2xELGdFQUFxQztBQUNyQywyREFBbUM7QUFDbkMsbUVBQTBDO0FBQzFDLDBEQUFrQztBQUNsQyw2REFBcUM7QUFDckMsdUNBQXNDO0FBTXRDLE1BQU0saUJBQWlCO0lBRW5COzs7Ozs7O09BT0c7SUFDSCxLQUFLLENBQUMsc0JBQXNCLENBQUMsU0FBaUIsRUFBRSxPQUF1QixPQUFPO1FBQzFFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ1QsT0FBTyxFQUFFLENBQUM7UUFDZCxDQUFDO1FBQ0QsSUFBSSxLQUFLLEdBQWEsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbEMsS0FBSyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUNELElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN0RCxJQUFJLE1BQU0sS0FBSyxXQUFXLEVBQUUsQ0FBQztnQkFDekIsaUJBQWlCO2dCQUNqQiwySEFBMkg7Z0JBQzNILHdEQUF3RDtZQUM1RCxDQUFDO2lCQUFN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QyxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBQSxjQUFPLEVBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuRixDQUFDO1FBQ0QsT0FBTyxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7WUFDdkIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDVCxPQUFPO1lBQ1gsQ0FBQztZQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBSSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsRUFBRTtnQkFDekMsT0FBTyxFQUFFLGNBQWM7Z0JBQ3ZCLE9BQU8sRUFBRSxnQkFBZ0I7Z0JBQ3pCLE9BQU8sRUFBRSxPQUFPO2FBQ25CLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztLQUNKLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHF1ZXJ5VVVJRCwgcXVlcnlBc3NldCwgVmlydHVhbEFzc2V0LCBBc3NldERCLCBxdWVyeVVybCwgQXNzZXQsIGZvckVhY2gsIHF1ZXJ5UGF0aCB9IGZyb20gJ0Bjb2Nvcy9hc3NldC1kYic7XHJcbmltcG9ydCB7IGlzQWJzb2x1dGUsIGJhc2VuYW1lLCBleHRuYW1lIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IFF1ZXJ5QXNzZXRUeXBlLCBJQXNzZXQgfSBmcm9tICcuLi9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyVHlwZSwgSUFzc2V0SW5mbywgSUFzc2V0TWV0YSwgUXVlcnlBc3NldHNPcHRpb24gfSBmcm9tICcuLi9AdHlwZXMvcHVibGljJztcclxuaW1wb3J0IHsgRmlsdGVyUGx1Z2luT3B0aW9ucywgSVBsdWdpblNjcmlwdEluZm8gfSBmcm9tICcuLi8uLi9zY3JpcHRpbmcvaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgdXJsMnV1aWQsIGxpYkFycjJPYmosIGdldEV4dGVuZHNGcm9tQ0NUeXBlIH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgYXNzZXREQk1hbmFnZXIgZnJvbSAnLi9hc3NldC1kYic7XHJcbmltcG9ydCBhc3NldEhhbmRsZXJNYW5hZ2VyIGZyb20gJy4vYXNzZXQtaGFuZGxlcic7XHJcbmltcG9ydCBzY3JpcHQgZnJvbSAnLi4vLi4vc2NyaXB0aW5nJztcclxuaW1wb3J0IGkxOG4gZnJvbSAnLi4vLi4vYmFzZS9pMThuJztcclxuaW1wb3J0IGFzc2V0Q29uZmlnIGZyb20gJy4uL2Fzc2V0LWNvbmZpZyc7XHJcbmltcG9ydCBtaW5pbWF0Y2ggZnJvbSAnbWluaW1hdGNoJztcclxuaW1wb3J0IHV0aWxzIGZyb20gJy4uLy4uL2Jhc2UvdXRpbHMnO1xyXG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5cclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgdmFyIGFzc2V0UXVlcnk6IEFzc2V0UXVlcnlNYW5hZ2VyO1xyXG59XHJcblxyXG5jbGFzcyBBc3NldFF1ZXJ5TWFuYWdlciB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAxLiDotYTmupAv6ISa5pysIHV1aWQsIGFzc2V0IC0+IHV1aWQg5L6d6LWW55qE5pmu6YCa6LWE5rqQ5YiX6KGoXHJcbiAgICAgKiAyLiDotYTmupAgdXVpZCwgc2NyaXB0IC0+IHV1aWQg5L6d6LWW55qE6ISa5pys5YiX6KGoXHJcbiAgICAgKiAzLiDohJrmnKwgdXVpZCwgc2NyaXB0IC0+IHV1aWQg6ISa5pys5L6d6LWW55qE6ISa5pys5YiX6KGoXHJcbiAgICAgKiBAcGFyYW0gdXVpZE9yVVJMXHJcbiAgICAgKiBAcGFyYW0gdHlwZSBcclxuICAgICAqIEByZXR1cm5zIFxyXG4gICAgICovXHJcbiAgICBhc3luYyBxdWVyeUFzc2V0RGVwZW5kZW5jaWVzKHV1aWRPclVSTDogc3RyaW5nLCB0eXBlOiBRdWVyeUFzc2V0VHlwZSA9ICdhc3NldCcpIHtcclxuICAgICAgICBjb25zdCBhc3NldCA9IHRoaXMucXVlcnlBc3NldCh1dWlkT3JVUkwpO1xyXG4gICAgICAgIGlmICghYXNzZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdXVpZHM6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgaWYgKFsnYXNzZXQnLCAnYWxsJ10uaW5jbHVkZXModHlwZSkpIHtcclxuICAgICAgICAgICAgdXVpZHMgPSB0aGlzLnF1ZXJ5QXNzZXRQcm9wZXJ0eShhc3NldCwgJ2RlcGVuZHMnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFsnc2NyaXB0JywgJ2FsbCddLmluY2x1ZGVzKHR5cGUpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNjVHlwZSA9IHRoaXMucXVlcnlBc3NldFByb3BlcnR5KGFzc2V0LCAndHlwZScpO1xyXG4gICAgICAgICAgICBpZiAoY2NUeXBlID09PSAnY2MuU2NyaXB0Jykge1xyXG4gICAgICAgICAgICAgICAgLy8g6L+U5Zue5L6d6LWW6ISa5pys55qEIGRiIFVSTFxyXG4gICAgICAgICAgICAgICAgLy8gY29uc3QgcGF0aExpc3Q6IHN0cmluZ1tdID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgncHJvZ3JhbW1pbmcnLCAncGFja2VyLWRyaXZlci9xdWVyeS1zY3JpcHQtZGVwcycsIGFzc2V0LnNvdXJjZSk7XHJcbiAgICAgICAgICAgICAgICAvLyB1dWlkcy5wdXNoKC4uLnBhdGhMaXN0Lm1hcChwYXRoID0+IHF1ZXJ5VVVJRChwYXRoKSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdXVpZHMucHVzaCguLi50aGlzLnF1ZXJ5QXNzZXRQcm9wZXJ0eShhc3NldCwgJ2RlcGVuZFNjcmlwdHMnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHV1aWRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogMS4g6LWE5rqQL+iEmuacrCB1dWlkLCBhc3NldCAtPiDkvb/nlKggdXVpZCDnmoTmma7pgJrotYTmupDliJfooahcclxuICAgICAqIDIuIOi1hOa6kCB1dWlkLCBzY3JpcHQgLT4g5L2/55SoIHV1aWQg55qE6ISa5pys5YiX6KGoXHJcbiAgICAgKiAzLiDohJrmnKwgdXVpZO+8jHNjcmlwdCAtPiDkvb/nlKjmraQgdXVpZCDohJrmnKznmoTohJrmnKzliJfooahcclxuICAgICAqIEBwYXJhbSB1dWlkT3JVUkwgXHJcbiAgICAgKiBAcGFyYW0gdHlwZSBcclxuICAgICAqIEByZXR1cm5zIFxyXG4gICAgICovXHJcbiAgICBhc3luYyBxdWVyeUFzc2V0VXNlcnModXVpZE9yVVJMOiBzdHJpbmcsIHR5cGU6IFF1ZXJ5QXNzZXRUeXBlID0gJ2Fzc2V0Jyk6IFByb21pc2U8c3RyaW5nW10+IHtcclxuICAgICAgICBjb25zdCBhc3NldCA9IHRoaXMucXVlcnlBc3NldCh1dWlkT3JVUkwpO1xyXG4gICAgICAgIGlmICghYXNzZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjY1R5cGUgPSB0aGlzLnF1ZXJ5QXNzZXRQcm9wZXJ0eShhc3NldCwgJ3R5cGUnKTtcclxuICAgICAgICBsZXQgdXNhZ2VzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgICAgICBpZiAoWydhc3NldCcsICdhbGwnXS5pbmNsdWRlcyh0eXBlKSkge1xyXG4gICAgICAgICAgICBpZiAoY2NUeXBlID09PSAnY2MuU2NyaXB0Jykge1xyXG4gICAgICAgICAgICAgICAgdXNhZ2VzID0gdGhpcy5xdWVyeUFzc2V0UHJvcGVydHkoYXNzZXQsICdkZXBlbmRlZFNjcmlwdHMnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHVzYWdlcyA9IHRoaXMucXVlcnlBc3NldFByb3BlcnR5KGFzc2V0LCAnZGVwZW5kZWRzJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChbJ3NjcmlwdCcsICdhbGwnXS5pbmNsdWRlcyh0eXBlKSkge1xyXG4gICAgICAgICAgICBpZiAoY2NUeXBlID09PSAnY2MuU2NyaXB0Jykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGF0aExpc3Q6IHN0cmluZ1tdID0gYXdhaXQgc2NyaXB0LnF1ZXJ5U2NyaXB0VXNlcnMoYXNzZXQuc291cmNlKTtcclxuICAgICAgICAgICAgICAgIHBhdGhMaXN0LmZvckVhY2gocGF0aCA9PiB1c2FnZXMucHVzaChxdWVyeVVVSUQocGF0aCkpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIOafpeivouS+nei1luatpOi1hOa6kOeahOiEmuacrO+8jOebruWJjeS+nei1luS/oeaBr+mDveiusOW9leWcqOWcuuaZr+S4iu+8jOaJgOS7peWunumZheS4iuW5tuayoeacieiEmuacrOS8muS+nei1lui1hOa6kO+8jOS7o+eggeWGmeatu+aYr+aXoOazleafpeivoueahFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdXNhZ2VzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Lyg5YWl5LiA5LiqIHV1aWQg5oiW6ICFIHVybCDmiJbogIXnu53lr7not6/lvoTvvIzmn6Xor6LmjIflkJHnmoTotYTmupBcclxuICAgICAqIEBwYXJhbSB1dWlkT3JVUkxPclBhdGhcclxuICAgICAqL1xyXG4gICAgcXVlcnlBc3NldCh1dWlkT3JVUkxPclBhdGg6IHN0cmluZyk6IElBc3NldCB8IG51bGwge1xyXG4gICAgICAgIGNvbnN0IHV1aWQgPSB1dGlscy5VVUlELmlzVVVJRCh1dWlkT3JVUkxPclBhdGgpID8gdXVpZE9yVVJMT3JQYXRoIDogdGhpcy5xdWVyeVVVSUQodXVpZE9yVVJMT3JQYXRoKTtcclxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gYXNzZXREQk1hbmFnZXIuYXNzZXREQk1hcCkge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhYmFzZSA9IGFzc2V0REJNYW5hZ2VyLmFzc2V0REJNYXBbbmFtZV07XHJcbiAgICAgICAgICAgIGlmICghZGF0YWJhc2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDmn6Xmib7nmoTmmK/mlbDmja7lupMsIOeUseS6juaVsOaNruW6k+eahOWNleadoeaVsOaNruS4jeWcqCBkYXRhYmFzZSDph4zvvIzmiYDku6XpnIDopoHov5nph4zljZXni6zov5Tlm55cclxuICAgICAgICAgICAgaWYgKHV1aWQgPT09IGBkYjovLyR7bmFtZX1gKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICBiYXNlbmFtZTogbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBleHRuYW1lOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICBpbXBvcnRlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGBkYjovLyR7bmFtZX1gLFxyXG4gICAgICAgICAgICAgICAgICAgIHN1YkFzc2V0czoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgbGlicmFyeTogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJEYXRhOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICBpc0RpcmVjdG9yeSgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgdXVpZDogYGRiOi8vJHtuYW1lfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXI6ICcxLjAuMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IGBkYjovLyR7bmFtZX1gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3ViTWV0YXM6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YToge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltcG9ydGVyOiAnZGF0YWJhc2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbXBvcnRlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH0gYXMgdW5rbm93biBhcyBJQXNzZXQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0ID0gZGF0YWJhc2UuZ2V0QXNzZXQodXVpZCB8fCAnJyk7XHJcbiAgICAgICAgICAgIGlmIChhc3NldCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzc2V0IGFzIHVua25vd24gYXMgSUFzc2V0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHF1ZXJ5QXNzZXRJbmZvKHVybE9yVVVJRE9yUGF0aDogc3RyaW5nLCBkYXRhS2V5cz86IChrZXlvZiBJQXNzZXRJbmZvKVtdKTogSUFzc2V0SW5mbyB8IG51bGwge1xyXG4gICAgICAgIGlmICghdXJsT3JVVUlET3JQYXRoIHx8IHR5cGVvZiB1cmxPclVVSURPclBhdGggIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncGFyYW1ldGVyIGVycm9yJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB1dWlkID0gJyc7XHJcblxyXG4gICAgICAgIGlmICh1cmxPclVVSURPclBhdGguc3RhcnRzV2l0aCgnZGI6Ly8nKSkge1xyXG4gICAgICAgICAgICBjb25zdCBuYW1lID0gdXJsT3JVVUlET3JQYXRoLnN1YnN0cig1KTtcclxuICAgICAgICAgICAgaWYgKGFzc2V0REJNYW5hZ2VyLmFzc2V0REJNYXBbbmFtZV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5REJBc3NldEluZm8obmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdXVpZCA9IHVybDJ1dWlkKHVybE9yVVVJRE9yUGF0aCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChpc0Fic29sdXRlKHVybE9yVVVJRE9yUGF0aCkpIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBuYW1lIGluIGFzc2V0REJNYW5hZ2VyLmFzc2V0REJNYXApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGFiYXNlID0gYXNzZXREQk1hbmFnZXIuYXNzZXREQk1hcFtuYW1lXTtcclxuICAgICAgICAgICAgICAgIGlmICghZGF0YWJhc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChkYXRhYmFzZS5wYXRoMmFzc2V0Lmhhcyh1cmxPclVVSURPclBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXVpZCA9IGRhdGFiYXNlLnBhdGgyYXNzZXQuZ2V0KHVybE9yVVVJRE9yUGF0aCkhLnV1aWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB1dWlkID0gdXJsT3JVVUlET3JQYXRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF1dWlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnlBc3NldEluZm9CeVVVSUQodXVpZCwgZGF0YUtleXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5p+l6K+i5oyH5a6a6LWE5rqQ55qE5L+h5oGvXHJcbiAgICAgKiBAcGFyYW0gdXVpZCDotYTmupDnmoTllK/kuIDmoIfor4bnrKZcclxuICAgICAqIEBwYXJhbSBkYXRhS2V5cyDotYTmupDovpPlh7rlj6/pgInpoblcclxuICAgICAqL1xyXG4gICAgcXVlcnlBc3NldEluZm9CeVVVSUQodXVpZDogc3RyaW5nLCBkYXRhS2V5cz86IChrZXlvZiBJQXNzZXRJbmZvKVtdKTogSUFzc2V0SW5mbyB8IG51bGwge1xyXG4gICAgICAgIGlmICghdXVpZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5p+l6K+i6LWE5rqQXHJcbiAgICAgICAgY29uc3QgYXNzZXQgPSBxdWVyeUFzc2V0KHV1aWQpO1xyXG4gICAgICAgIGlmICghYXNzZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5lbmNvZGVBc3NldChhc3NldCwgZGF0YUtleXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2u5o+Q5L6b55qEIG9wdGlvbnMg5p+l6K+i5a+55bqU55qE6LWE5rqQ5pWw57uEKOS4jeWMheWQq+aVsOaNruW6k+WvueixoSlcclxuICAgICAqIEBwYXJhbSBvcHRpb25zIOaQnOe0oumFjee9rlxyXG4gICAgICogQHBhcmFtIGRhdGFLZXlzIOaMh+WumumcgOimgeeahOi1hOa6kOS/oeaBr+Wtl+autVxyXG4gICAgICovXHJcbiAgICBxdWVyeUFzc2V0SW5mb3Mob3B0aW9ucz86IFF1ZXJ5QXNzZXRzT3B0aW9uLCBkYXRhS2V5cz86IChrZXlvZiBJQXNzZXRJbmZvKVtdKTogSUFzc2V0SW5mb1tdIHtcclxuICAgICAgICBsZXQgYWxsQXNzZXRzOiBJQXNzZXRbXSA9IFtdO1xyXG4gICAgICAgIGNvbnN0IGRiSW5mb3M6IElBc3NldEluZm9bXSA9IFtdO1xyXG4gICAgICAgIC8vIOW+queOr+avj+S4gOS4quW3sue7j+WQr+WKqOeahCBkYXRhYmFzZVxyXG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBhc3NldERCTWFuYWdlci5hc3NldERCTWFwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGFiYXNlID0gYXNzZXREQk1hbmFnZXIuYXNzZXREQk1hcFtuYW1lXTtcclxuICAgICAgICAgICAgYWxsQXNzZXRzID0gYWxsQXNzZXRzLmNvbmNhdChBcnJheS5mcm9tKGRhdGFiYXNlLnV1aWQyYXNzZXQudmFsdWVzKCkpKTtcclxuICAgICAgICAgICAgZGJJbmZvcy5wdXNoKHRoaXMucXVlcnlEQkFzc2V0SW5mbyhuYW1lKSEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZmlsdGVyQXNzZXRzOiBJQXNzZXRbXSA9IGFsbEFzc2V0cztcclxuICAgICAgICBpZiAob3B0aW9ucykge1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5pc0J1bmRsZSkge1xyXG4gICAgICAgICAgICAgICAgLy8g5YW85a655pen54mI5pys5L2/55SoIGlzQnVuZGxlIOafpeivouS8mum7mOiupOW4puS4iiBtZXRhIOeahOihjOS4ulxyXG4gICAgICAgICAgICAgICAgZGF0YUtleXMgPSAoZGF0YUtleXMgfHwgW10pLmNvbmNhdChbJ21ldGEnXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8g5qC55o2u6YCJ6aG5562b6YCJ6L+H5ruk55qE5Ye95pWw5L+h5oGvXHJcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlckluZm9zID0gRmlsdGVySGFuZGxlckluZm9zLmZpbHRlcihpbmZvID0+IHtcclxuICAgICAgICAgICAgICAgIGluZm8udmFsdWUgPSBvcHRpb25zW2luZm8ubmFtZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5mby5yZXNvbHZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5mby52YWx1ZSA9IGluZm8ucmVzb2x2ZShpbmZvLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpbmZvLnZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGZpbHRlckFzc2V0cyA9IHNlYXJjaEFzc2V0cyhmaWx0ZXJJbmZvcywgYWxsQXNzZXRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZmlsdGVyQXNzZXRzLm1hcCgoYXNzZXQpID0+IHRoaXMuZW5jb2RlQXNzZXQoYXNzZXQsIGRhdGFLZXlzKSk7XHJcbiAgICAgICAgaWYgKCFvcHRpb25zIHx8IChhbGxBc3NldHMubGVuZ3RoICYmIGFsbEFzc2V0cy5sZW5ndGggPT09IHJlc3VsdC5sZW5ndGgpKSB7XHJcbiAgICAgICAgICAgIC8vIOaXoOaViOi/h+a7pOadoeS7tuaIluiAheafpeivouWFqOmDqOi1hOa6kOaXtumcgOimgeWMheWQq+m7mOiupCBkYiDnmoTotYTmupDvvIzkuLvopoHkuLrkuoblhbzlrrnml6fniYjmnKznmoTmjqXlj6PooYzkuLrvvIzmraPluLjotYTmupDmn6Xor6LlupTor6XkuI3ljIXlkKvmlbDmja7lupPlr7nosaFcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5jb25jYXQoZGJJbmZvcyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnBhdHRlcm4gJiYgT2JqZWN0LmtleXMob3B0aW9ucykubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIC8vIOWtmOWcqCBwYXR0ZXJuIOWPguaVsOaXtu+8jOmcgOimgeWMheWQq+aVsOaNruW6k+Wvueixoe+8jOS4u+imgeaYr+WFvOWuueaXp+eJiOacrOihjOS4ulxyXG4gICAgICAgICAgICByZXR1cm4gZGJJbmZvcy5maWx0ZXIoKGRiKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWluaW1hdGNoKGRiLnVybCwgb3B0aW9ucy5wYXR0ZXJuISk7XHJcbiAgICAgICAgICAgIH0pLmNvbmNhdChyZXN1bHQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHF1ZXJ5QXNzZXRzKG9wdGlvbnM6IFF1ZXJ5QXNzZXRzT3B0aW9uID0ge30pIHtcclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkob3B0aW9ucykpIHtcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGFzc2V0czogSUFzc2V0W10gPSBbXTtcclxuICAgICAgICAvLyDlvqrnjq/mr4/kuIDkuKrlt7Lnu4/lkK/liqjnmoQgZGF0YWJhc2VcclxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gYXNzZXREQk1hbmFnZXIuYXNzZXREQk1hcCkge1xyXG4gICAgICAgICAgICBpZiAoIShuYW1lIGluIGFzc2V0REJNYW5hZ2VyLmFzc2V0REJNYXApKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgZGF0YWJhc2UgPSBhc3NldERCTWFuYWdlci5hc3NldERCTWFwW25hbWVdO1xyXG4gICAgICAgICAgICBhc3NldHMgPSBhc3NldHMuY29uY2F0KEFycmF5LmZyb20oZGF0YWJhc2UudXVpZDJhc3NldC52YWx1ZXMoKSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgLy8g5qC55o2u6YCJ6aG5562b6YCJ6L+H5ruk55qE5Ye95pWw5L+h5oGvXHJcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlckluZm9zID0gRmlsdGVySGFuZGxlckluZm9zLmZpbHRlcihpbmZvID0+IHtcclxuICAgICAgICAgICAgICAgIGluZm8udmFsdWUgPSBvcHRpb25zW2luZm8ubmFtZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5mby5yZXNvbHZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5mby52YWx1ZSA9IGluZm8ucmVzb2x2ZShpbmZvLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpbmZvLnZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGFzc2V0cyA9IHNlYXJjaEFzc2V0cyhmaWx0ZXJJbmZvcywgYXNzZXRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFzc2V0cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOafpeivouespuWQiOafkOS4quetm+mAieinhOWImeeahOaOkuW6j+WQjueahOaPkuS7tuiEmuacrOWIl+ihqFxyXG4gICAgICogQHBhcmFtIGZpbHRlck9wdGlvbnMgXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBxdWVyeVNvcnRlZFBsdWdpbnMoZmlsdGVyT3B0aW9uczogRmlsdGVyUGx1Z2luT3B0aW9ucyA9IHt9KTogSVBsdWdpblNjcmlwdEluZm9bXSB7XHJcbiAgICAgICAgY29uc3QgcGx1Z2lucyA9IHRoaXMucXVlcnlBc3NldEluZm9zKHtcclxuICAgICAgICAgICAgY2NUeXBlOiAnY2MuU2NyaXB0JyxcclxuICAgICAgICAgICAgdXNlckRhdGE6IHtcclxuICAgICAgICAgICAgICAgIC4uLmZpbHRlck9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBpc1BsdWdpbjogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LCBbJ25hbWUnXSk7XHJcbiAgICAgICAgaWYgKCFwbHVnaW5zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAxLiDlhYjmjInnhafpu5jorqTmj5Lku7bohJrmnKznmoTmjpLluo/op4TliJnvvIzlj5bmj5Lku7bohJrmnKzlkI3np7DmjpLluo9cclxuICAgICAgICBwbHVnaW5zLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpO1xyXG5cclxuICAgICAgICAvLyAyLiDmoLnmja7pobnnm67orr7nva7lhoXphY3nva7lpb3nmoTohJrmnKzkvJjlhYjnuqfpobrluo/vvIzosIPmlbTljp/mnInnmoTohJrmnKzmjpLluo9cclxuICAgICAgICBjb25zdCBzb3J0ZWQ6IHN0cmluZ1tdID0gYXNzZXRDb25maWcuZGF0YS5zb3J0aW5nUGx1Z2luO1xyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHNvcnRlZCkgJiYgc29ydGVkLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAvLyDov4fmu6TmjonnlKjmiLfphY3nva7mjpLluo/kuK3kuI3nrKblkIjlvZPliY3njq/looPmiJbogIXor7TkuI3lrZjlnKjnmoTmj5Lku7bohJrmnKxcclxuICAgICAgICAgICAgY29uc3QgZmlsdGVyU29ydGVkID0gc29ydGVkLmZpbHRlcigodXVpZCkgPT4gcGx1Z2lucy5maW5kKGluZm8gPT4gaW5mby51dWlkID09PSB1dWlkKSk7XHJcbiAgICAgICAgICAgIC8vIOWAkuW6j+WkhOeQhuS4u+imgeaYr+S4uuS6huWFvOWuuSAzODMg5LmL5YmN55qE5aSE55CG6KeE5YiZ77yM5L+d5oyB5LiA6Ie055qE57uT5p6c6KGM5Li644CC6aG65bqP5o6S57uT5p6c5pyJ5beu5byC44CCXHJcbiAgICAgICAgICAgIGZpbHRlclNvcnRlZC5yZXZlcnNlKCkucmVkdWNlKChwcmVJbmRleCwgY3VycmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gcGx1Z2lucy5maW5kSW5kZXgoKGluZm8pID0+IGluZm8udXVpZCA9PT0gY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEluZGV4ID4gcHJlSW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzY3JpcHRzID0gcGx1Z2lucy5zcGxpY2UoY3VycmVudEluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5zLnNwbGljZShwcmVJbmRleCwgMCwgc2NyaXB0c1swXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZUluZGV4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRJbmRleDtcclxuICAgICAgICAgICAgfSwgcGx1Z2lucy5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHBsdWdpbnMubWFwKChhc3NldCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdXVpZDogYXNzZXQudXVpZCxcclxuICAgICAgICAgICAgICAgIGZpbGU6IGFzc2V0LmxpYnJhcnlbJy5qcyddLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBhc3NldC51cmwsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5bCG5LiA5LiqIEFzc2V0IOi9rOaIkCBpbmZvIOWvueixoVxyXG4gICAgICogQHBhcmFtIGRhdGFiYXNlXHJcbiAgICAgKiBAcGFyYW0gYXNzZXRcclxuICAgICAqIEBwYXJhbSBpbnZhbGlkIOaYr+WQpuaYr+aXoOaViOeahOi1hOa6kO+8jOS+i+WmguW3suiiq+WIoOmZpOeahOi1hOa6kFxyXG4gICAgICovXHJcbiAgICBlbmNvZGVBc3NldChhc3NldDogSUFzc2V0LCBkYXRhS2V5czogKGtleW9mIElBc3NldEluZm8pW10gPSBbJ3N1YkFzc2V0cycsICdkaXNwbGF5TmFtZSddLCBpbnZhbGlkID0gZmFsc2UpIHtcclxuICAgICAgICBsZXQgbmFtZSA9ICcnO1xyXG4gICAgICAgIGxldCBzb3VyY2UgPSAnJztcclxuICAgICAgICBsZXQgZmlsZSA9ICcnO1xyXG4gICAgICAgIGNvbnN0IGRhdGFiYXNlID0gYXNzZXQuX2Fzc2V0REI7XHJcbiAgICAgICAgaWYgKGFzc2V0LnV1aWQgPT09IGFzc2V0LnNvdXJjZSB8fCAoYXNzZXQgaW5zdGFuY2VvZiBBc3NldCAmJiBhc3NldC5zb3VyY2UpKSB7XHJcbiAgICAgICAgICAgIG5hbWUgPSBiYXNlbmFtZShhc3NldC5zb3VyY2UpO1xyXG4gICAgICAgICAgICBzb3VyY2UgPSBhc3NldERCTWFuYWdlci5wYXRoMnVybChhc3NldC5zb3VyY2UsIGRhdGFiYXNlLm9wdGlvbnMubmFtZSk7XHJcbiAgICAgICAgICAgIGZpbGUgPSBhc3NldC5zb3VyY2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbmFtZSA9IGFzc2V0Ll9uYW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGxvYWRVcmwgPSBuYW1lO1xyXG4gICAgICAgIGxldCB1cmwgPSBuYW1lO1xyXG5cclxuICAgICAgICAvLyDms6jvvJphc3NldC51dWlkID09PSBhc3NldC5zb3VyY2Ug5pivIG1hYyDkuIrnmoQgZGI6Ly9hc3NldHNcclxuICAgICAgICBpZiAoYXNzZXQudXVpZCA9PT0gYXNzZXQuc291cmNlIHx8IGFzc2V0IGluc3RhbmNlb2YgQXNzZXQpIHtcclxuICAgICAgICAgICAgdXJsID0gbG9hZFVybCA9IHNvdXJjZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgcGFyZW50OiBBc3NldCB8IFZpcnR1YWxBc3NldCB8IG51bGwgPSBhc3NldC5wYXJlbnQ7XHJcbiAgICAgICAgICAgIHdoaWxlIChwYXJlbnQgJiYgIShwYXJlbnQgaW5zdGFuY2VvZiBBc3NldCkpIHtcclxuICAgICAgICAgICAgICAgIGxvYWRVcmwgPSBgJHtwYXJlbnQuX25hbWV9LyR7bmFtZX1gO1xyXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQgaW5zdGFuY2VvZiBBc3NldCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZXh0ID0gZXh0bmFtZShwYXJlbnQuX3NvdXJjZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ZW1wU291cmNlID0gYXNzZXREQk1hbmFnZXIucGF0aDJ1cmwocGFyZW50Ll9zb3VyY2UsIGRhdGFiYXNlLm9wdGlvbnMubmFtZSk7XHJcbiAgICAgICAgICAgICAgICB1cmwgPSB0ZW1wU291cmNlICsgJy8nICsgbG9hZFVybDtcclxuICAgICAgICAgICAgICAgIGxvYWRVcmwgPSB0ZW1wU291cmNlLnN1YnN0cigwLCB0ZW1wU291cmNlLmxlbmd0aCAtIGV4dC5sZW5ndGgpICsgJy8nICsgbG9hZFVybDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaXNEaXJlY3RvcnkgPSBmYWxzZTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpc0RpcmVjdG9yeSA9IGFzc2V0LmlzRGlyZWN0b3J5KCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgaWYgKGludmFsaWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIOiiq+WIoOmZpOeahOi1hOa6kOatpOWkhOaKm+W8guW4uOS4jeaKpemUmVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhlcnJvcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpc0RpcmVjdG9yeSA9IGV4dG5hbWUoYXNzZXQuc291cmNlKSA9PT0gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaXNEaXJlY3RvcnkpIHtcclxuICAgICAgICAgICAgbG9hZFVybCA9IGxvYWRVcmwucmVwbGFjZSgvXFwuW14uL10rJC8sICcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGluZm86IElBc3NldEluZm8gPSB7XHJcbiAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBhc3NldC5kaXNwbGF5TmFtZSxcclxuICAgICAgICAgICAgc291cmNlLFxyXG4gICAgICAgICAgICBsb2FkVXJsLCAvLyBsb2FkZXIg5Yqg6L295L2/55So55qE6Lev5b6EXHJcbiAgICAgICAgICAgIHVybCwgLy8g5a6e6ZmF55qE5bim5pyJ5omp5bGV5ZCN55qE6Lev5b6EXHJcbiAgICAgICAgICAgIGZpbGUsIC8vIOWunumZheejgeebmOi3r+W+hFxyXG4gICAgICAgICAgICB1dWlkOiBhc3NldC51dWlkLFxyXG4gICAgICAgICAgICBpbXBvcnRlcjogYXNzZXQubWV0YS5pbXBvcnRlciBhcyBBc3NldEhhbmRsZXJUeXBlLFxyXG4gICAgICAgICAgICBpbXBvcnRlZDogYXNzZXQubWV0YS5pbXBvcnRlZCwgLy8g5piv5ZCm57uT5p2f5a+85YWl6L+H56iLXHJcbiAgICAgICAgICAgIGludmFsaWQ6IGFzc2V0LmludmFsaWQsIC8vIOaYr+WQpuWvvOWFpeaIkOWKn1xyXG4gICAgICAgICAgICB0eXBlOiB0aGlzLnF1ZXJ5QXNzZXRQcm9wZXJ0eShhc3NldCwgJ3R5cGUnKSxcclxuICAgICAgICAgICAgaXNEaXJlY3RvcnksXHJcbiAgICAgICAgICAgIHJlYWRvbmx5OiBkYXRhYmFzZS5vcHRpb25zLnJlYWRvbmx5LFxyXG4gICAgICAgICAgICBsaWJyYXJ5OiBsaWJBcnIyT2JqKGFzc2V0KSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkYXRhS2V5cy5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAyMzIyXHJcbiAgICAgICAgICAgIGluZm9ba2V5XSA9IHRoaXMucXVlcnlBc3NldFByb3BlcnR5KGFzc2V0LCBrZXkpID8/IGluZm9ba2V5XTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8g5rKh5pyJ5pi+56S65oyH5a6a6I635Y+WIGlzQnVuZGxlIOWtl+auteaXtu+8jOm7mOiupOWPquaciSBidW5kbGUg5paH5Lu25aS55omN5Lya5Yqg5LiK5qCH6K6wXHJcbiAgICAgICAgaWYgKCFkYXRhS2V5cy5pbmNsdWRlcygnaXNCdW5kbGUnKSkge1xyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMucXVlcnlBc3NldFByb3BlcnR5KGFzc2V0LCAnaXNCdW5kbGUnKTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpbmZvLmlzQnVuZGxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGRhdGFLZXlzLmluY2x1ZGVzKCdwYXJlbnQnKSAmJiBhc3NldC5wYXJlbnQpIHtcclxuICAgICAgICAgICAgaW5mby5wYXJlbnQgPSB7XHJcbiAgICAgICAgICAgICAgICBzb3VyY2U6IGFzc2V0LnBhcmVudC5zb3VyY2UsXHJcbiAgICAgICAgICAgICAgICBsaWJyYXJ5OiBsaWJBcnIyT2JqKGFzc2V0LnBhcmVudCksXHJcbiAgICAgICAgICAgICAgICB1dWlkOiBhc3NldC5wYXJlbnQudXVpZCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhdGFLZXlzLmluY2x1ZGVzKCdzdWJBc3NldHMnKSkge1xyXG4gICAgICAgICAgICBpbmZvLnN1YkFzc2V0cyA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gYXNzZXQuc3ViQXNzZXRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIShuYW1lIGluIGFzc2V0LnN1YkFzc2V0cykpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkSW5mbzogSUFzc2V0SW5mbyA9IHRoaXMuZW5jb2RlQXNzZXQoYXNzZXQuc3ViQXNzZXRzW25hbWVdLCBkYXRhS2V5cyk7XHJcbiAgICAgICAgICAgICAgICBpbmZvLnN1YkFzc2V0c1tuYW1lXSA9IGNoaWxkSW5mbztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaW5mbztcclxuICAgIH1cclxuXHJcbiAgICBxdWVyeUFzc2V0UHJvcGVydHkoYXNzZXQ6IElBc3NldCwgcHJvcGVydHk6IChrZXlvZiBJQXNzZXRJbmZvIHwgJ2RlcGVuZHMnIHwgJ2RlcGVuZFNjcmlwdHMnIHwgJ2RlcGVuZGVkU2NyaXB0cycpKTogYW55IHtcclxuXHJcbiAgICAgICAgc3dpdGNoIChwcm9wZXJ0eSkge1xyXG4gICAgICAgICAgICBjYXNlICdsb2FkVXJsJzpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gdGhpcy5xdWVyeUFzc2V0UHJvcGVydHkoYXNzZXQsICduYW1lJykgYXMgc3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsb2FkVXJsID0gbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDms6jvvJphc3NldC51dWlkID09PSBhc3NldC5zb3VyY2Ug5pivIG1hYyDkuIrnmoQgZGI6Ly9hc3NldHNcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXNzZXQgaW5zdGFuY2VvZiBBc3NldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkVXJsID0gYXNzZXREQk1hbmFnZXIucGF0aDJ1cmwoYXNzZXQuc291cmNlLCBhc3NldC5fYXNzZXREQi5vcHRpb25zLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnQ6IEFzc2V0IHwgVmlydHVhbEFzc2V0IHwgbnVsbCA9IGFzc2V0LnBhcmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHBhcmVudCAmJiAhKHBhcmVudCBpbnN0YW5jZW9mIEFzc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZFVybCA9IGAke3BhcmVudC5fbmFtZX0vJHtuYW1lfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudCBpbnN0YW5jZW9mIEFzc2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHQgPSBleHRuYW1lKHBhcmVudC5fc291cmNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlbXBTb3VyY2UgPSBhc3NldERCTWFuYWdlci5wYXRoMnVybChwYXJlbnQuX3NvdXJjZSwgYXNzZXQuX2Fzc2V0REIub3B0aW9ucy5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRVcmwgPSB0ZW1wU291cmNlLnN1YnN0cigwLCB0ZW1wU291cmNlLmxlbmd0aCAtIGV4dC5sZW5ndGgpICsgJy8nICsgbG9hZFVybDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNEaXJlY3RvcnkgPSBhc3NldC5pc0RpcmVjdG9yeSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNEaXJlY3RvcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZFVybCA9IGxvYWRVcmwucmVwbGFjZSgvXFwuW14uL10rJC8sICcnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRVcmw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ25hbWUnOlxyXG4gICAgICAgICAgICAgICAgaWYgKGFzc2V0LnV1aWQgPT09IGFzc2V0LnNvdXJjZSB8fCAoYXNzZXQgaW5zdGFuY2VvZiBBc3NldCAmJiBhc3NldC5zb3VyY2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJhc2VuYW1lKGFzc2V0LnNvdXJjZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NldC5fbmFtZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAncmVhZG9ubHknOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzc2V0Ll9hc3NldERCLm9wdGlvbnMucmVhZG9ubHk7XHJcbiAgICAgICAgICAgIGNhc2UgJ3VybCc6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IHRoaXMucXVlcnlBc3NldFByb3BlcnR5KGFzc2V0LCAnbmFtZScpIGFzIHN0cmluZztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXNzZXQudXVpZCA9PT0gYXNzZXQuc291cmNlIHx8IGFzc2V0IGluc3RhbmNlb2YgQXNzZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2V0REJNYW5hZ2VyLnBhdGgydXJsKGFzc2V0LnNvdXJjZSwgYXNzZXQuX2Fzc2V0REIub3B0aW9ucy5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IG5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnQ6IEFzc2V0IHwgVmlydHVhbEFzc2V0IHwgbnVsbCA9IGFzc2V0LnBhcmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHBhcmVudCAmJiAhKHBhcmVudCBpbnN0YW5jZW9mIEFzc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCA9IGAke3BhcmVudC5fbmFtZX0vJHtuYW1lfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudCBpbnN0YW5jZW9mIEFzc2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZW1wU291cmNlID0gYXNzZXREQk1hbmFnZXIucGF0aDJ1cmwocGFyZW50Ll9zb3VyY2UsIGFzc2V0Ll9hc3NldERCLm9wdGlvbnMubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGVtcFNvdXJjZSArICcvJyArIHBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGF0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAndHlwZSc6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IGFzc2V0SGFuZGxlck1hbmFnZXIubmFtZTJoYW5kbGVyW2Fzc2V0Lm1ldGEuaW1wb3J0ZXJdIHx8IGFzc2V0Ll9hc3NldERCLmltcG9ydGVyTWFuYWdlci5uYW1lMmltcG9ydGVyW2Fzc2V0Lm1ldGEuaW1wb3J0ZXJdIHx8IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXIgPyBoYW5kbGVyLmFzc2V0VHlwZSB8fCAnY2MuQXNzZXQnIDogJ2NjLkFzc2V0JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAnaXNCdW5kbGUnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzc2V0Lm1ldGEudXNlckRhdGEgJiYgYXNzZXQubWV0YS51c2VyRGF0YS5pc0J1bmRsZTtcclxuICAgICAgICAgICAgY2FzZSAnaW5zdGFudGlhdGlvbic6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IGFzc2V0SGFuZGxlck1hbmFnZXIubmFtZTJoYW5kbGVyW2Fzc2V0Lm1ldGEuaW1wb3J0ZXJdIHx8IGFzc2V0Ll9hc3NldERCLmltcG9ydGVyTWFuYWdlci5uYW1lMmltcG9ydGVyW2Fzc2V0Lm1ldGEuaW1wb3J0ZXJdIHx8IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXIgPyBoYW5kbGVyLmluc3RhbnRpYXRpb24gOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ2xpYnJhcnknOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpYkFycjJPYmooYXNzZXQpO1xyXG4gICAgICAgICAgICBjYXNlICdkaXNwbGF5TmFtZSc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXNzZXQuZGlzcGxheU5hbWU7XHJcbiAgICAgICAgICAgIGNhc2UgJ3JlZGlyZWN0JzpcclxuICAgICAgICAgICAgICAgIC8vIOaVtOeQhui3s+i9rOaVsOaNrlxyXG4gICAgICAgICAgICAgICAgaWYgKGFzc2V0Lm1ldGEudXNlckRhdGEgJiYgYXNzZXQubWV0YS51c2VyRGF0YS5yZWRpcmVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZGlyZWN0SW5mbyA9IHRoaXMucXVlcnlBc3NldChhc3NldC5tZXRhLnVzZXJEYXRhLnJlZGlyZWN0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVkaXJlY3RJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZGlyZWN0SGFuZGxlciA9IGFzc2V0SGFuZGxlck1hbmFnZXIubmFtZTJoYW5kbGVyW3JlZGlyZWN0SW5mby5tZXRhLmltcG9ydGVyXSB8fCBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXVpZDogcmVkaXJlY3RJbmZvLnV1aWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiByZWRpcmVjdEhhbmRsZXIgPyByZWRpcmVjdEhhbmRsZXIuYXNzZXRUeXBlIHx8ICdjYy5Bc3NldCcgOiAnY2MuQXNzZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgY2FzZSAnZXh0ZW5kcyc6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5q2k5aSE5YW85a655LqG5pen55qE6LWE5rqQ5a+85YWl5ZmoXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgQ0NUeXBlID0gdGhpcy5xdWVyeUFzc2V0UHJvcGVydHkoYXNzZXQsICd0eXBlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldEV4dGVuZHNGcm9tQ0NUeXBlKENDVHlwZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ3Zpc2libGUnOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgVE9ETyDlupXlsYIgb3B0aW9ucyDlubbml6DmraTlrZfmrrVcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdmlzaWJsZSA9IGFzc2V0Ll9hc3NldERCLm9wdGlvbnMudmlzaWJsZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodmlzaWJsZSAmJiBhc3NldC51c2VyRGF0YS52aXNpYmxlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2aXNpYmxlID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAnbXRpbWUnOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZm8gPSBhc3NldC5fYXNzZXREQi5pbmZvTWFuYWdlci5nZXQoYXNzZXQuc291cmNlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5mbyA/IGluZm8udGltZSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ21ldGEnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzc2V0Lm1ldGE7XHJcbiAgICAgICAgICAgIGNhc2UgJ2RlcGVuZHMnOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKGFzc2V0LmdldERhdGEoJ2RlcGVuZHMnKSB8fCBbXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ2RlcGVuZGVkcyc6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlZExpc3Q6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gY29sbGVjdFV1aWQoZGVwZW5kczogc3RyaW5nW10sIHV1aWQ6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVwZW5kcy5pbmNsdWRlcyhhc3NldC51dWlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlZExpc3QucHVzaCh1dWlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3JFYWNoKChkYjogQXNzZXREQikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSBkYi5kYXRhTWFuYWdlci5kYXRhTWFwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGlkIGluIG1hcCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IG1hcFtpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS52YWx1ZSAmJiBpdGVtLnZhbHVlLmRlcGVuZHMgJiYgaXRlbS52YWx1ZS5kZXBlbmRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3RVdWlkKGl0ZW0udmFsdWUuZGVwZW5kcywgaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVzZWRMaXN0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlICdkZXBlbmRTY3JpcHRzJzpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYXNzZXQuX2Fzc2V0REIuZGF0YU1hbmFnZXIuZGF0YU1hcFthc3NldC51dWlkXTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShkYXRhICYmIGRhdGEudmFsdWUgJiYgZGF0YS52YWx1ZVsnZGVwZW5kU2NyaXB0cyddIHx8IFtdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAnZGVwZW5kZWRTY3JpcHRzJzpcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VkTGlzdDogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3JFYWNoKChkYjogQXNzZXREQikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSBkYi5kYXRhTWFuYWdlci5kYXRhTWFwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGlkIGluIG1hcCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IG1hcFtpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS52YWx1ZSAmJiBpdGVtLnZhbHVlLmRlcGVuZFNjcmlwdHMgJiYgaXRlbS52YWx1ZS5kZXBlbmRTY3JpcHRzLmluY2x1ZGVzKGFzc2V0LnV1aWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlZExpc3QucHVzaChpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXNlZExpc3Q7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5p+l6K+i5oyH5a6a55qE6LWE5rqQ55qEIG1ldGFcclxuICAgICAqIEBwYXJhbSB1dWlkT3JVUkxPclBhdGgg6LWE5rqQ55qE5ZSv5LiA5qCH6K+G56ymXHJcbiAgICAgKi9cclxuICAgIHF1ZXJ5QXNzZXRNZXRhKHV1aWRPclVSTE9yUGF0aDogc3RyaW5nKTogSUFzc2V0TWV0YSB8IG51bGwge1xyXG4gICAgICAgIGlmICghdXVpZE9yVVJMT3JQYXRoIHx8IHR5cGVvZiB1dWlkT3JVUkxPclBhdGggIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdXVpZCA9IHV1aWRPclVSTE9yUGF0aDtcclxuICAgICAgICBpZiAodXVpZE9yVVJMT3JQYXRoLnN0YXJ0c1dpdGgoJ2RiOi8vJykpIHtcclxuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHV1aWRPclVSTE9yUGF0aC5zdWJzdHIoNSk7XHJcbiAgICAgICAgICAgIGlmIChhc3NldERCTWFuYWdlci5hc3NldERCTWFwW25hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIERCIOaVsOaNruW6k+W5tuS4jeWtmOWcqCBtZXRhIOeQhuiuuuS4iuW5tuS4jemcgOimgei/lOWbnu+8jOS9huaXp+eJiOacrOW3suaUr+aMgVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBkaXNwbGF5TmFtZTogbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBmaWxlczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWQ6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGltcG9ydGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGltcG9ydGVyOiAnZGF0YWJhc2UnLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5hbWU6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIHN1Yk1ldGFzOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YToge30sXHJcbiAgICAgICAgICAgICAgICAgICAgdXVpZDogdXVpZE9yVVJMT3JQYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgIHZlcjogJzEuMC4wJyxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdXVpZCA9IHVybDJ1dWlkKHV1aWRPclVSTE9yUGF0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGFzc2V0ID0gcXVlcnlBc3NldCh1dWlkKTtcclxuICAgICAgICBpZiAoIWFzc2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGFzc2V0Lm1ldGE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmn6Xor6LmjIflrprnmoTotYTmupDku6Xlj4rlr7nlupQgbWV0YSDnmoQgbXRpbWVcclxuICAgICAqIEBwYXJhbSB1dWlkIOi1hOa6kOeahOWUr+S4gOagh+ivhuesplxyXG4gICAgICovXHJcbiAgICBxdWVyeUFzc2V0TXRpbWUodXVpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCF1dWlkIHx8IHR5cGVvZiB1dWlkICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBhc3NldERCTWFuYWdlci5hc3NldERCTWFwKSB7XHJcbiAgICAgICAgICAgIGlmICghKG5hbWUgaW4gYXNzZXREQk1hbmFnZXIuYXNzZXREQk1hcCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGFiYXNlOiBBc3NldERCID0gYXNzZXREQk1hbmFnZXIuYXNzZXREQk1hcFtuYW1lXTtcclxuICAgICAgICAgICAgaWYgKCFkYXRhYmFzZSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgYXNzZXQgPSBkYXRhYmFzZS5nZXRBc3NldCh1dWlkKTtcclxuICAgICAgICAgICAgaWYgKGFzc2V0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmZvID0gZGF0YWJhc2UuaW5mb01hbmFnZXIuZ2V0KGFzc2V0LnNvdXJjZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5mbyA/IGluZm8udGltZSA6IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcXVlcnlVVUlEKHVybE9yUGF0aDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgaWYgKCF1cmxPclBhdGggfHwgdHlwZW9mIHVybE9yUGF0aCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodXJsT3JQYXRoLnN0YXJ0c1dpdGgoJ2RiOi8vJykpIHtcclxuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHVybE9yUGF0aC5zdWJzdHIoNSk7XHJcbiAgICAgICAgICAgIGlmIChhc3NldERCTWFuYWdlci5hc3NldERCTWFwW25hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYGRiOi8vJHtuYW1lfWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgdXVpZCA9IHVybDJ1dWlkKHVybE9yUGF0aCk7XHJcbiAgICAgICAgICAgIGlmICh1dWlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdXVpZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmV0dXJuIHF1ZXJ5VVVJRCh1cmxPclBhdGgpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRiIOagueiKgueCueS4jeaYr+acieaViOeahCBhc3NldCDnsbvlnovotYTmupBcclxuICAgICAqIOi/memHjOS8qumAoOS4gOS7veWug+eahOaVsOaNruS/oeaBr1xyXG4gICAgICogQHBhcmFtIG5hbWUgZGIgbmFtZVxyXG4gICAgICovXHJcbiAgICBxdWVyeURCQXNzZXRJbmZvKG5hbWU6IHN0cmluZyk6IElBc3NldEluZm8gfCBudWxsIHtcclxuICAgICAgICBjb25zdCBkYkluZm8gPSBhc3NldERCTWFuYWdlci5hc3NldERCSW5mb1tuYW1lXTtcclxuICAgICAgICBpZiAoIWRiSW5mbykge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGluZm86IElBc3NldEluZm8gPSB7XHJcbiAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBuYW1lIHx8ICcnLFxyXG4gICAgICAgICAgICBzb3VyY2U6IGBkYjovLyR7bmFtZX1gLFxyXG4gICAgICAgICAgICBsb2FkVXJsOiBgZGI6Ly8ke25hbWV9YCxcclxuICAgICAgICAgICAgdXJsOiBgZGI6Ly8ke25hbWV9YCxcclxuICAgICAgICAgICAgZmlsZTogZGJJbmZvLnRhcmdldCwgLy8g5a6e6ZmF56OB55uY6Lev5b6EXHJcbiAgICAgICAgICAgIHV1aWQ6IGBkYjovLyR7bmFtZX1gLFxyXG4gICAgICAgICAgICBpbXBvcnRlcjogJ2RhdGFiYXNlJyxcclxuICAgICAgICAgICAgaW1wb3J0ZWQ6IHRydWUsXHJcbiAgICAgICAgICAgIGludmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICB0eXBlOiAnY2NlLkRhdGFiYXNlJyxcclxuICAgICAgICAgICAgaXNEaXJlY3Rvcnk6IGZhbHNlLFxyXG4gICAgICAgICAgICBsaWJyYXJ5OiB7fSxcclxuICAgICAgICAgICAgc3ViQXNzZXRzOiB7fSxcclxuICAgICAgICAgICAgcmVhZG9ubHk6IGRiSW5mby5yZWFkb25seSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gaW5mbztcclxuICAgIH1cclxuXHJcbiAgICBxdWVyeVVybCh1dWlkT3JQYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIXV1aWRPclBhdGggfHwgdHlwZW9mIHV1aWRPclBhdGggIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncGFyYW1ldGVyIGVycm9yJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDmoLnot6/lvoQgL2Fzc2V0cywgL2ludGVybmFsIOWvueW6lOeahCB1cmwg5qih5ouf5pWw5o2uXHJcbiAgICAgICAgY29uc3QgbmFtZSA9IHV1aWRPclBhdGguc3Vic3RyKGFzc2V0Q29uZmlnLmRhdGEucm9vdC5sZW5ndGggKyAxKTtcclxuICAgICAgICBpZiAoYXNzZXREQk1hbmFnZXIuYXNzZXREQk1hcFtuYW1lXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYGRiOi8vJHtuYW1lfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBxdWVyeVVybCh1dWlkT3JQYXRoKTtcclxuICAgIH1cclxuXHJcbiAgICBxdWVyeVBhdGgodXJsT3JVdWlkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghdXJsT3JVdWlkIHx8IHR5cGVvZiB1cmxPclV1aWQgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHVybE9yVXVpZC5zdGFydHNXaXRoKCdkYjovLycpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSB1cmxPclV1aWQuc3Vic3RyKDUpO1xyXG4gICAgICAgICAgICBpZiAoYXNzZXREQk1hbmFnZXIuYXNzZXREQk1hcFtuYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzc2V0REJNYW5hZ2VyLmFzc2V0REJNYXBbbmFtZV0ub3B0aW9ucy50YXJnZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgdXVpZCA9IHVybDJ1dWlkKHVybE9yVXVpZCk7XHJcbiAgICAgICAgICAgIGlmICh1dWlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcXVlcnlQYXRoKHV1aWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBxdWVyeVBhdGgodXJsT3JVdWlkKTtcclxuICAgIH1cclxuXHJcbiAgICBnZW5lcmF0ZUF2YWlsYWJsZVVSTCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCF1cmwgfHwgdHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwYXRoID0gcXVlcnlQYXRoKHVybCk7XHJcbiAgICAgICAgaWYgKCFwYXRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9IGVsc2UgaWYgKCFleGlzdHNTeW5jKHBhdGgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1cmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5ld1BhdGggPSB1dGlscy5GaWxlLmdldE5hbWUocGF0aCk7XHJcbiAgICAgICAgcmV0dXJuIHF1ZXJ5VXJsKG5ld1BhdGgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBhc3NldFF1ZXJ5ID0gbmV3IEFzc2V0UXVlcnlNYW5hZ2VyKCk7XHJcblxyXG4vLyDlhYHorrjkvb/nlKjlhajlsYDlj5jph4/ljrvmn6Xor6IgZGIg55qE5LiA5Lqb5pWw5o2u5L+h5oGvXHJcbmlmICghZ2xvYmFsVGhpcy5hc3NldFF1ZXJ5KSB7XHJcbiAgICBnbG9iYWxUaGlzLmFzc2V0UXVlcnkgPSBhc3NldFF1ZXJ5O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhc3NldFF1ZXJ5O1xyXG5cclxuLy8g5qC55o2u6LWE5rqQ57G75Z6L562b6YCJXHJcbmNvbnN0IFRZUEVTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7XHJcbiAgICBzY3JpcHRzOiBbJy5qcycsICcudHMnXSxcclxuICAgIHNjZW5lOiBbJy5zY2VuZSddLFxyXG4gICAgZWZmZWN0OiBbJy5lZmZlY3QnXSxcclxuICAgIGltYWdlOiBbJy5qcGcnLCAnLnBuZycsICcuanBlZycsICcud2VicCcsICcudGdhJ10sXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2VhcmNoQXNzZXRzKGZpbHRlckhhbmRsZXJJbmZvczogRmlsdGVySGFuZGxlckluZm9bXSwgYXNzZXRzOiBJQXNzZXRbXSwgcmVzdWx0QXNzZXRzOiBJQXNzZXRbXSA9IFtdKSB7XHJcbiAgICBpZiAoIWZpbHRlckhhbmRsZXJJbmZvcy5sZW5ndGgpIHtcclxuICAgICAgICByZXR1cm4gYXNzZXRzO1xyXG4gICAgfVxyXG4gICAgYXNzZXRzLmZvckVhY2goKGFzc2V0OiBBc3NldCB8IFZpcnR1YWxBc3NldCkgPT4ge1xyXG4gICAgICAgIGlmIChhc3NldC5zdWJBc3NldHMgJiYgT2JqZWN0LmtleXMoYXNzZXQuc3ViQXNzZXRzKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHNlYXJjaEFzc2V0cyhcclxuICAgICAgICAgICAgICAgIGZpbHRlckhhbmRsZXJJbmZvcyxcclxuICAgICAgICAgICAgICAgIE9iamVjdC52YWx1ZXMoYXNzZXQuc3ViQXNzZXRzKSxcclxuICAgICAgICAgICAgICAgIHJlc3VsdEFzc2V0cyxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdW5NYXRjaCA9IGZpbHRlckhhbmRsZXJJbmZvcy5zb21lKChmaWx0ZXJIYW5kbGVySW5mbykgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVySGFuZGxlckluZm8udmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAhZmlsdGVySGFuZGxlckluZm8uaGFuZGxlcihmaWx0ZXJIYW5kbGVySW5mby52YWx1ZSwgYXNzZXQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICghdW5NYXRjaCkge1xyXG4gICAgICAgICAgICByZXN1bHRBc3NldHMucHVzaChhc3NldCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdEFzc2V0cztcclxufVxyXG5cclxuZnVuY3Rpb24gZmlsdGVyVXNlckRhdGFJbmZvKHVzZXJEYXRhRmlsdGVyczogUmVjb3JkPHN0cmluZywgYW55PiwgYXNzZXQ6IElBc3NldCkge1xyXG4gICAgcmV0dXJuICFPYmplY3Qua2V5cyh1c2VyRGF0YUZpbHRlcnMpLnNvbWUoKGtleSkgPT4gdXNlckRhdGFGaWx0ZXJzW2tleV0gIT09IGFzc2V0Lm1ldGEudXNlckRhdGFba2V5XSk7XHJcbn1cclxuXHJcbmludGVyZmFjZSBGaWx0ZXJIYW5kbGVySW5mbyB7XHJcbiAgICBuYW1lOiBrZXlvZiBRdWVyeUFzc2V0c09wdGlvbjtcclxuICAgIC8vIOWunumZheeahOWkhOeQhuaWueazlVxyXG4gICAgaGFuZGxlcjogKHZhbHVlOiBhbnksIGFzc2V0czogSUFzc2V0KSA9PiBib29sZWFuO1xyXG4gICAgLy8g5a+56L+H5ruk5pWw5o2u6L+b6KGM6L2s5o2i5qOA5p+l77yM6L+U5ZueIG51bGwg6KGo56S65b2T5YmN5pWw5o2u5peg5pWIXHJcbiAgICByZXNvbHZlPzogKHZhbHVlOiBhbnkpID0+IGFueSB8IHVuZGVmaW5lZDtcclxuICAgIHZhbHVlPzogYW55O1xyXG59XHJcblxyXG5jb25zdCBGaWx0ZXJIYW5kbGVySW5mb3M6IEZpbHRlckhhbmRsZXJJbmZvW10gPSBbe1xyXG4gICAgbmFtZTogJ2NjVHlwZScsXHJcbiAgICBoYW5kbGVyOiAoY2NUeXBlczogc3RyaW5nW10sIGFzc2V0OiBJQXNzZXQpID0+IHtcclxuICAgICAgICByZXR1cm4gY2NUeXBlcy5pbmNsdWRlcyhhc3NldFF1ZXJ5LnF1ZXJ5QXNzZXRQcm9wZXJ0eShhc3NldCwgJ3R5cGUnKSk7XHJcbiAgICB9LFxyXG4gICAgcmVzb2x2ZTogKHZhbHVlOiBzdHJpbmcgfCBzdHJpbmdbXSkgPT4ge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW3ZhbHVlLnRyaW0oKV07XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfSxcclxufSwge1xyXG4gICAgbmFtZTogJ3BhdHRlcm4nLFxyXG4gICAgaGFuZGxlcjogKHZhbHVlOiBzdHJpbmcsIGFzc2V0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgbG9hZFVybCA9IGFzc2V0UXVlcnkucXVlcnlBc3NldFByb3BlcnR5KGFzc2V0LCAnbG9hZFVybCcpO1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGFzc2V0UXVlcnkucXVlcnlBc3NldFByb3BlcnR5KGFzc2V0LCAndXJsJyk7XHJcbiAgICAgICAgcmV0dXJuIG1pbmltYXRjaChsb2FkVXJsLCB2YWx1ZSkgfHwgbWluaW1hdGNoKHVybCwgdmFsdWUpO1xyXG4gICAgfSxcclxuICAgIHJlc29sdmU6ICh2YWx1ZTogc3RyaW5nIHwgc3RyaW5nW10pID0+IHtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlIDogdW5kZWZpbmVkO1xyXG4gICAgfSxcclxufSwge1xyXG4gICAgbmFtZTogJ2ltcG9ydGVyJyxcclxuICAgIGhhbmRsZXI6IChpbXBvcnRlcnM6IHN0cmluZ1tdLCBhc3NldCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBpbXBvcnRlcnMuaW5jbHVkZXMoYXNzZXQubWV0YS5pbXBvcnRlcik7XHJcbiAgICB9LFxyXG4gICAgcmVzb2x2ZTogKHZhbHVlOiBzdHJpbmcgfCBzdHJpbmdbXSkgPT4ge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW3ZhbHVlLnRyaW0oKV07XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbn0sIHtcclxuICAgIG5hbWU6ICdpc0J1bmRsZScsXHJcbiAgICBoYW5kbGVyOiAodmFsdWU6IGJvb2xlYW4sIGFzc2V0KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICghIWFzc2V0UXVlcnkucXVlcnlBc3NldFByb3BlcnR5KGFzc2V0LCAnaXNCdW5kbGUnKSkgPT09IHZhbHVlO1xyXG4gICAgfSxcclxufSwge1xyXG4gICAgbmFtZTogJ2V4dG5hbWUnLFxyXG4gICAgaGFuZGxlcjogKGV4dGVuc2lvbk5hbWVzOiBzdHJpbmdbXSwgYXNzZXQpID0+IHtcclxuICAgICAgICBjb25zdCBleHRlbnNpb24gPSBleHRuYW1lKGFzc2V0LnNvdXJjZSkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBpZiAoZXh0ZW5zaW9uTmFtZXMuaW5jbHVkZXMoZXh0ZW5zaW9uKSAmJiAhL1xcLmRcXC50cyQvLnRlc3QoYXNzZXQuc291cmNlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuICAgIHJlc29sdmUodmFsdWU6IHN0cmluZyB8IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFt2YWx1ZS50cmltKCkudG9Mb2NhbGVMb3dlckNhc2UoKV07XHJcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubWFwKG5hbWUgPT4gbmFtZS50cmltKCkudG9Mb2NhbGVMb3dlckNhc2UoKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbn0sIHtcclxuICAgIG5hbWU6ICd1c2VyRGF0YScsXHJcbiAgICBoYW5kbGVyOiAodmFsdWU6IFJlY29yZDxzdHJpbmcsIGFueT4sIGFzc2V0KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGZpbHRlclVzZXJEYXRhSW5mbyh2YWx1ZSwgYXNzZXQpO1xyXG4gICAgfSxcclxufSwge1xyXG4gICAgbmFtZTogJ3R5cGUnLFxyXG4gICAgaGFuZGxlcjogKHR5cGVzOiBzdHJpbmdbXSwgYXNzZXQpID0+IHtcclxuICAgICAgICByZXR1cm4gdHlwZXMuaW5jbHVkZXMoZXh0bmFtZShhc3NldC5zb3VyY2UpKSAmJiAhL1xcLmRcXC50cyQvLnRlc3QoYXNzZXQuc291cmNlKTtcclxuICAgIH0sXHJcbiAgICByZXNvbHZlOiAodmFsdWU6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIGNvbnN0IHR5cGVzID0gVFlQRVNbdmFsdWVdO1xyXG4gICAgICAgIGlmICghdHlwZXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLndhcm4oaTE4bi50KCdhc3NldHMuZGVwcmVjYXRlZF90aXAnLCB7XHJcbiAgICAgICAgICAgIG9sZE5hbWU6ICdvcHRpb25zLnR5cGUnLFxyXG4gICAgICAgICAgICBuZXdOYW1lOiAnb3B0aW9ucy5jY1R5cGUnLFxyXG4gICAgICAgICAgICB2ZXJzaW9uOiAnMy44LjAnLFxyXG4gICAgICAgIH0pKTtcclxuICAgICAgICByZXR1cm4gdHlwZXM7XHJcbiAgICB9LFxyXG59XTsiXX0=