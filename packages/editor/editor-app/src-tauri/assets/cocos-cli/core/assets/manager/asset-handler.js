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
exports.CustomImporter = void 0;
const asset_db_1 = require("@cocos/asset-db");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const utils_1 = require("../utils");
const lodash_1 = __importDefault(require("lodash"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const sharp_1 = __importDefault(require("sharp"));
const i18n_1 = __importDefault(require("../../base/i18n"));
const asset_config_1 = __importDefault(require("../asset-config"));
const eol_1 = __importDefault(require("eol"));
const databaseIconConfig = {
    type: 'icon',
    value: 'database',
    thumbnail: false,
};
class CustomImporter extends asset_db_1.Importer {
    constructor(extensions, assetHandler) {
        super();
        const { migrations, migrationHook, version, versionCode, force, import: ImportAsset } = assetHandler.importer;
        if (!ImportAsset) {
            throw new Error(`Can not find import function in assetHandler(${assetHandler.name})`);
        }
        const { validate, name } = assetHandler;
        this._name = name;
        this._version = version || '0.0.0';
        this._versionCode = versionCode || 1;
        migrations && (this._migrations = migrations);
        migrationHook && (this._migrationHook = migrationHook);
        validate && (this.validate = validate);
        force && (this.force = force);
        // TODO 调整命名
        this.extnames = extensions;
        this.import = async (asset) => {
            await assetHandlerManager.runImporterHook(asset, 'before');
            const res = await ImportAsset.call(assetHandler, asset);
            await assetHandlerManager.runImporterHook(asset, 'after');
            return res;
        };
    }
}
exports.CustomImporter = CustomImporter;
class AssetHandlerManager {
    static createTemplateRoot;
    name2handler = {};
    type2handler = {};
    name2importer = {};
    // 缓存已经查找到的处理器
    // TODO 与 importer2custom 整合
    importer2OperateRecord = {};
    // [importer 懒加载] 1/3
    extname2registerInfo = {};
    name2registerInfo = {};
    // 扩展资源处理
    name2custom = {};
    importer2custom = {};
    _iconConfigMap = null;
    // 用户配置里的 userData 缓存
    _userDataCache = {};
    // 导入器里注册的默认 userData 值， 注册后不可修改
    _defaultUserData = {};
    clear() {
        this.name2handler = {};
        this.extname2registerInfo = {};
        this.name2registerInfo = {};
        this.name2custom = {};
        this.importer2OperateRecord = {};
        this.importer2custom = {};
        this._iconConfigMap = null;
    }
    compileEffect(_force) {
        throw new Error('compileEffect is not implemented, please init assetHandler first!');
    }
    ;
    startAutoGenEffectBin() {
        throw new Error('startAutoGenEffectBin is not implemented, please init assetHandler first!');
    }
    ;
    getEffectBinPath() {
        throw new Error('getEffectBinPath is not implemented, please init assetHandler first!');
    }
    ;
    async init() {
        const { assetHandlerInfos } = await Promise.resolve().then(() => __importStar(require('../../assets/asset-handler/config')));
        this.register('cocos-cli', assetHandlerInfos, true);
        AssetHandlerManager.createTemplateRoot = await asset_config_1.default.getProject('createTemplateRoot');
        const { compileEffect, startAutoGenEffectBin, getEffectBinPath } = await Promise.resolve().then(() => __importStar(require('../asset-handler')));
        this.compileEffect = compileEffect;
        this.startAutoGenEffectBin = startAutoGenEffectBin;
        this.getEffectBinPath = getEffectBinPath;
    }
    /**
     * 激活剩余未注册完成的资源处理器
     */
    async activateRegisterAll() {
        await Promise.all(Object.values(this.name2registerInfo).map((info) => {
            console.debug(`lazy register asset handler ${info.name}`);
            return this.activateRegister(info);
        }));
    }
    async activateRegister(registerInfos) {
        const { pkgName, name, extensions, internal } = registerInfos;
        if (this.name2importer[name]) {
            return this.name2importer[name];
        }
        try {
            const assetHandler = await registerInfos.load();
            if (assetHandler) {
                this.name2handler[name] = Object.assign(assetHandler, {
                    from: {
                        pkgName,
                        internal,
                    },
                });
                const extendsHandlerName = assetHandler.extends;
                if (extendsHandlerName) {
                    if (!this.name2handler[extendsHandlerName]) {
                        console.error(`Can not find extend asset-handler ${extendsHandlerName}`);
                        if (this.name2handler[name].assetType) {
                            const type = this.name2handler[name].assetType;
                            this.type2handler[type] = (this.type2handler[type] || []).concat([this.name2handler[name]]);
                        }
                        return null;
                    }
                    this.name2handler[name] = Object.assign({}, this.name2handler[extendsHandlerName], this.name2handler[name]);
                    this.name2handler[name].importer = Object.assign({}, this.name2handler[extendsHandlerName].importer, this.name2handler[name].importer);
                }
                if (this.name2handler[name].assetType) {
                    const type = this.name2handler[name].assetType;
                    this.type2handler[type] = (this.type2handler[type] || []).concat([this.name2handler[name]]);
                }
                // 收集默认配置，注册到导入系统内
                if (assetHandler.userDataConfig) {
                    for (const key in assetHandler.userDataConfig.default) {
                        if (this._userDataCache[name] && this._userDataCache[name][key]) {
                            assetHandler.userDataConfig.default[key].default = this._userDataCache[name][key];
                        }
                        if ([undefined, null].includes(assetHandler.userDataConfig.default[key].default)) {
                            continue;
                        }
                        lodash_1.default.set(this._defaultUserData, `${name}.${key}`, assetHandler.userDataConfig.default[key].default);
                    }
                    const combineUserData = {
                        ...(this._defaultUserData[name] || {}),
                        ...(this._userDataCache[name] || {}),
                    };
                    Object.keys(combineUserData).length && (0, asset_db_1.setDefaultUserData)(name, combineUserData);
                }
                return this.name2importer[name] = new CustomImporter(extensions, this.name2handler[name]);
            }
        }
        catch (error) {
            delete this.name2registerInfo[name];
            console.error(error);
            console.error(`register asset-handler ${name} failed!`);
        }
        return null;
    }
    register(pkgName, assetHandlerInfos, internal) {
        assetHandlerInfos.forEach((info) => {
            // 未传递 extname 的视为子资源导入器，extname = '-'
            const extensions = info.extensions && info.extensions.length ? info.extensions : ['-'];
            this.name2registerInfo[info.name] = {
                ...info,
                pkgName,
                extensions,
                internal,
            };
            extensions.forEach((extname) => {
                this.extname2registerInfo[extname] = this.extname2registerInfo[extname] || [];
                this.extname2registerInfo[extname].push(this.name2registerInfo[info.name]);
            });
        });
    }
    unregister(pkgName, assetHandlerInfos) {
        assetHandlerInfos.forEach((info) => {
            delete this.name2registerInfo[info.name];
            info.extensions.forEach((extname) => {
                if (!this.extname2registerInfo[extname]) {
                    return;
                }
                this.extname2registerInfo[extname] = this.extname2registerInfo[extname].filter((info) => info.pkgName === pkgName);
            });
            this.extname2registerInfo['-'] = this.extname2registerInfo['-'].filter((info) => info.pkgName === pkgName);
        });
    }
    async findImporter(asset, withoutDefaultImporter) {
        let extname = '';
        if (asset instanceof asset_db_1.Asset && asset.extname) {
            extname = asset.extname;
        }
        // 尝试使用标记的导入器, * 的导入器是每次找不到合适导入器时才会走的，再次进入时要重新走流程查找导入器
        if (asset.meta.importer && asset.meta.importer !== '*') {
            let importer = this.name2importer[asset.meta.importer];
            if (importer) {
                return importer;
            }
            const registerInfo = this.name2registerInfo[asset.meta.importer];
            if (registerInfo) {
                importer = await this.activateRegister(registerInfo);
                // 与标记导入器一致的不需要走检验
                if (importer && importer.name === asset.meta.importer) {
                    return importer;
                }
            }
            // 上面的逻辑走完还没有找到导入器，则说明以往标记的导入器已经无法找到，需要报错，之后重新寻找合适的导入器
            console.log(`Can not find the importer ${asset.meta.importer} in editor`);
        }
        // 尝试通过后缀找到适合这个资源的导入器
        const registerInfos = this.extname2registerInfo[extname] || [];
        if (registerInfos.length) {
            const importer = await this._findImporterInRegisterInfo(asset, registerInfos);
            if (importer) {
                return importer;
            }
        }
        if (withoutDefaultImporter) {
            return null;
        }
        // 找不到合适资源的导入器，尝试使用通过导入器
        return await this.getDefaultImporter(asset);
    }
    async getDefaultImporter(asset) {
        return (await this._findImporterInRegisterInfo(asset, this.extname2registerInfo['*'] || []) || null);
    }
    async _findImporterInRegisterInfo(asset, registerInfos) {
        for (let i = registerInfos.length - 1; i >= 0; i--) {
            const { name } = registerInfos[i];
            // 有可能在第一步的流程里已经获取到缓存在 name2importer 内了
            let importer = this.name2importer[name];
            if (!importer) {
                importer = await this.activateRegister(registerInfos[i]);
            }
            if (!importer) {
                continue;
            }
            try {
                const validate = await importer.validate(asset);
                if (validate) {
                    return importer;
                }
            }
            catch (error) {
                console.warn(`Importer(${name}) validate failed: ${asset.uuid}`);
                console.warn(error);
            }
        }
    }
    add(assetHandler, extensions) {
        // 如果已经存在同名的导入器则跳过
        if (assetHandler.name !== '*' &&
            this.name2handler[assetHandler.name] &&
            this.name2handler[assetHandler.name] !== assetHandler) {
            console.warn(`The AssetHandler[${assetHandler.name}] is already registered.`);
            return;
        }
        this.name2handler[assetHandler.name] = assetHandler;
        const importer = new CustomImporter(extensions, assetHandler);
        this.name2importer[assetHandler.name] = importer;
    }
    /**
     * 获取各个资源的新建列表数据
     */
    async getCreateMap() {
        const result = [];
        for (const importer of Object.keys(this.name2handler)) {
            const createMenu = await this.getCreateMenuByName(importer);
            result.push(...createMenu);
        }
        return result;
    }
    /**
     * 根据导入器名称获取资源模板信息
     * @param importer
     * @returns
     */
    async getCreateMenuByName(importer) {
        const handler = this.name2handler[importer];
        if (!handler || !handler.createInfo || !handler.createInfo.generateMenuInfo) {
            return [];
        }
        const { generateMenuInfo, preventDefaultTemplateMenu } = handler.createInfo;
        try {
            const defaultMenuInfo = await generateMenuInfo();
            const templateDir = getUserTemplateDir(importer);
            let templates = preventDefaultTemplateMenu ? [] : await queryUserTemplates(templateDir);
            // TODO 统一命名为 extensions
            const extensions = this.name2importer[importer].extnames;
            // 如果存在后缀则过滤不合法后缀的模板数据，无后缀作为正常模板处理（主要兼容旧版本无后缀的资源模板放置方式）
            templates = templates.filter((file) => {
                const extName = (0, path_1.extname)(file);
                if (!extName) {
                    return true;
                }
                return extensions.includes(extName);
            });
            const createMenu = [];
            defaultMenuInfo.forEach((info) => {
                // 存在用户模板时检查是否有覆盖默认模板的情况
                if (info.template && templates.length) {
                    const userTemplateIndex = templates.findIndex((templatePath) => {
                        return (0, path_1.basename)(templatePath) === (0, path_1.basename)(info.template);
                    });
                    if (userTemplateIndex !== -1) {
                        info = JSON.parse(JSON.stringify(info));
                        info.template = templates[userTemplateIndex];
                        templates.splice(userTemplateIndex, 1);
                    }
                }
                createMenu.push(patchHandler(info, importer, extensions));
            });
            // 与默认模板非同名的模板文件为用户自定义模板
            if (templates.length && createMenu.length) {
                templates.forEach((templatePath) => {
                    createMenu.push(patchHandler({
                        label: (0, path_1.basename)(templatePath, (0, path_1.extname)(templatePath)),
                        template: templatePath,
                        name: (0, path_1.basename)(templatePath, (0, path_1.extname)(templatePath)),
                        fullFileName: (0, path_1.basename)(templatePath, (0, path_1.extname)(templatePath)),
                    }, importer, extensions));
                });
            }
            return createMenu;
        }
        catch (error) {
            console.error(`Generate create list in handler ${importer} failed`);
        }
        return [];
    }
    /**
     * 生成创建资源模板
     * @param importer
     */
    async createAssetTemplate(importer, templatePath, target) {
        templatePath = (0, path_1.isAbsolute)(templatePath) ? templatePath : (0, utils_1.url2path)(templatePath);
        if (!templatePath || !(0, fs_extra_1.existsSync)(templatePath)) {
            return false;
        }
        const assetTemplateDir = getUserTemplateDir(importer);
        await (0, fs_extra_1.ensureDir)(assetTemplateDir);
        await (0, fs_extra_1.copy)(templatePath, target);
        return true;
    }
    async queryIconConfigMap() {
        if (this._iconConfigMap) {
            return this._iconConfigMap;
        }
        const result = {};
        for (const importer of Object.keys(this.name2handler)) {
            const handler = this.name2handler[importer];
            if (!handler.iconInfo) {
                result[importer] = {
                    type: 'icon',
                    value: importer,
                    thumbnail: false,
                };
                continue;
            }
            const { default: defaultConfig, generateThumbnail } = handler.iconInfo;
            result[importer] = {
                ...defaultConfig,
                thumbnail: !!generateThumbnail,
            };
        }
        // 手动补充 database 的资源处理器
        result['database'] = databaseIconConfig;
        this._iconConfigMap = result;
        return result;
    }
    /**
     * 创建资源
     * @param options
     * @returns 返回资源创建地址
     */
    async createAsset(options) {
        options.rename = options.rename ?? true;
        if (!options.handler) {
            const registerInfos = this.extname2registerInfo[(0, path_1.extname)(options.target)];
            options.handler = registerInfos && registerInfos.length ? registerInfos[0].name : undefined;
        }
        if (options.handler) {
            const assetHandler = this.name2handler[options.handler];
            if (assetHandler && assetHandler.createInfo && assetHandler.createInfo.create) {
                // 优先使用自定义的创建方法，若创建结果不存在则走默认的创建流程
                const result = await assetHandler.createInfo.create(options);
                await afterCreateAsset(result, options);
                return result;
            }
        }
        if (options.content === undefined || options.content === null) {
            // 如果给定了模板信息，使用 db 默认的创建拷贝方式
            if (options.template) {
                const path = (0, utils_1.url2path)(options.template);
                if ((0, fs_extra_1.existsSync)(path)) {
                    await (0, fs_extra_1.copy)(path, options.target, { overwrite: options.overwrite });
                    await afterCreateAsset(options.target, options);
                    return options.target;
                }
            }
            // content 不存在，新建一个文件夹
            await (0, fs_extra_1.ensureDir)(options.target);
        }
        else {
            if (typeof options.content === 'object') {
                options.content = JSON.stringify(options.content, null, 4);
            }
            // Normalize EOL for string content
            if (typeof options.content === 'string' && options.handler === 'text') {
                options.content = eol_1.default.auto(options.content);
            }
            // 部分自定义创建资源没有模板，内容为空，只需要一个空文件即可完成创建
            await (0, fs_extra_1.outputFile)(options.target, options.content, 'utf8');
        }
        await afterCreateAsset(options.target, options);
        return options.target;
    }
    /**
     * 调用自定义的销毁资源流程
     * @param asset
     * @returns
     */
    async destroyAsset(asset) {
        const assetHandler = this.name2handler[asset.meta.importer];
        if (assetHandler && assetHandler.destroy) {
            return await assetHandler.destroy(asset);
        }
    }
    async saveAsset(asset, content) {
        const assetHandler = this.name2handler[asset.meta.importer];
        if (assetHandler && assetHandler.createInfo && assetHandler.createInfo.save) {
            // 优先使用自定义的保存方法
            return await assetHandler.createInfo.save(asset, content);
        }
        // Normalize EOL for string content
        if (typeof content === 'string' && asset.meta.importer === 'text') {
            content = eol_1.default.auto(content);
        }
        await (0, fs_extra_1.outputFile)(asset.source, content);
        return true;
    }
    async generateThumbnail(asset, size = 'large') {
        if (!asset) {
            return null;
        }
        // 无效资源需要等待重新导入
        if (asset.invalid) {
            return {
                type: 'icon',
                value: 'file',
            };
        }
        const configMap = await this.queryIconConfigMap();
        if (!configMap[asset.meta.importer]) {
            return null;
        }
        const cacheDest = (0, path_1.join)(asset.temp, `thumbnail-${size}.png`);
        if ((0, fs_extra_1.existsSync)(cacheDest)) {
            return {
                type: 'image',
                value: cacheDest,
            };
        }
        let data;
        if (!configMap[asset.meta.importer].thumbnail) {
            data = configMap[asset.meta.importer];
        }
        else {
            const assetHandler = this.name2handler[asset.meta.importer];
            try {
                data = await assetHandler.iconInfo.generateThumbnail(asset);
            }
            catch (error) {
                console.warn(error);
                console.warn(`generateThumbnail failed for ${asset.url}`);
                return null;
            }
        }
        if (data.type === 'image') {
            const file = (0, path_1.isAbsolute)(data.value) ? data.value : (0, utils_1.url2path)(data.value);
            // SVG 无需 resize
            if (file.endsWith('.svg')) {
                return data;
            }
            if (!(0, fs_extra_1.existsSync)(file)) {
                return null;
            }
            try {
                data.value = await resizeThumbnail(file, cacheDest, size);
            }
            catch (error) {
                console.warn(error);
                console.warn(`resizeThumbnail failed for ${asset.url}`);
            }
        }
        return data;
    }
    /**
     * 生成某个资源的导出文件信息
     * @param asset
     * @param options
     * @returns
     */
    async generateExportData(asset, options) {
        const assetHandler = this.name2handler[asset.meta.importer];
        if (!assetHandler || !assetHandler.exporter || !assetHandler.exporter.generateExportData) {
            return null;
        }
        return await assetHandler.exporter.generateExportData(asset, options);
    }
    /**
     * 拷贝生成导入文件到最终目标地址
     * @param handler
     * @param src
     * @param dest
     * @returns
     */
    async outputExportData(handler, src, dest) {
        const assetHandler = this.name2handler[handler];
        if (!assetHandler || !assetHandler.exporter || !assetHandler.exporter.outputExportData) {
            return false;
        }
        return await assetHandler.exporter.outputExportData(src, dest);
    }
    /**
     * 查询各个资源的基本配置 MAP
     */
    async queryAssetConfigMap() {
        const result = {};
        for (const importer of Object.keys(this.name2handler)) {
            const handler = this.name2handler[importer];
            const config = {
                displayName: handler.displayName,
                description: handler.description,
                docURL: handler.docURL,
            };
            if (handler.iconInfo) {
                config.iconInfo = handler.iconInfo.default;
            }
            if (handler.userDataConfig) {
                config.userDataConfig = handler.userDataConfig.default;
            }
            result[importer] = config;
        }
        return result;
    }
    async queryUserDataConfig(asset) {
        if (!asset) {
            return false;
        }
        const assetHandler = this.name2handler[asset.meta.importer];
        if (!assetHandler || !assetHandler.userDataConfig) {
            return;
        }
        if (!assetHandler.userDataConfig.generate) {
            return assetHandler.userDataConfig.default;
        }
        return await assetHandler.userDataConfig.generate(asset);
    }
    async queryUserDataConfigDefault(importer) {
        const assetHandler = this.name2handler[importer];
        if (!assetHandler || !assetHandler.userDataConfig) {
            return;
        }
        return assetHandler.userDataConfig.default;
    }
    async runImporterHook(asset, hookName) {
        const assetHandler = this.name2handler[asset.meta.importer];
        // 1. 先执行资源处理器内的钩子
        if (assetHandler && assetHandler.importer && typeof assetHandler.importer[hookName] === 'function') {
            try {
                await assetHandler.importer[hookName](asset);
            }
            catch (error) {
                console.error(error);
                console.error(`run ${hookName} hook failed!`);
            }
        }
        // 2. 再执行扩展注册的钩子
        const customHandlers = this.importer2custom[asset.meta.importer];
        if (!customHandlers || !customHandlers.length) {
            return;
        }
        for (const customHandler of customHandlers) {
            const hook = customHandler.importer && customHandler.importer[hookName];
            if (!hook) {
                continue;
            }
            try {
                await hook(asset);
            }
            catch (error) {
                console.error(error);
                console.error(`run ${hookName} hook failed!`);
            }
        }
    }
    _findOperateHandler(importer, operate) {
        if (this.importer2OperateRecord[importer] && this.importer2OperateRecord[importer][operate]) {
            return this.importer2OperateRecord[importer][operate];
        }
        let assetHandler = this.name2handler[importer];
        if (assetHandler && !(operate in assetHandler) && this.importer2custom[importer]) {
            assetHandler = this.importer2custom[importer].find((item) => operate in item);
        }
        if (!assetHandler || !assetHandler[operate]) {
            console.debug(`Cannot find the asset handler of operate ${operate} for importer ${importer}`);
            return null;
        }
        if (!this.importer2OperateRecord[importer]) {
            this.importer2OperateRecord[importer] = {};
        }
        this.importer2OperateRecord[importer][operate] = assetHandler;
        return assetHandler;
    }
    queryAllImporter() {
        let importerArr = Object.keys(this.name2handler);
        // 兼容旧版本的资源导入器
        const internalDB = (0, asset_db_1.get)('internal');
        const name2importer = internalDB.importerManager.name2importer;
        if (Object.keys(name2importer).length) {
            importerArr.push(...Object.keys(internalDB.importerManager.name2importer));
            importerArr = Array.from(new Set(importerArr));
            // 兼容旧版本的升级提示
            console.warn('the importer version need to upgrade.');
        }
        return importerArr.sort();
    }
    queryAllAssetTypes() {
        const assetTypes = new Set();
        Object.values(this.name2handler).forEach((handler) => {
            const { assetType } = handler;
            assetType && assetTypes.add(assetType);
        });
        // 兼容旧版本的资源导入器
        const internalDB = (0, asset_db_1.get)('internal');
        const name2importer = internalDB.importerManager.name2importer;
        if (Object.keys(name2importer).length) {
            for (const importer in name2importer) {
                if (importer === '*') {
                    continue;
                }
                const { assetType } = name2importer[importer];
                assetType && assetTypes.add(assetType);
                console.warn(`the importer${importer} version need to upgrade.`);
            }
            // 兼容旧版本的升级提示
        }
        return Array.from(assetTypes).sort();
    }
    /**
     * 更新默认配置数据并保存（偏好设置的用户操作修改入口）
     */
    async updateDefaultUserData(handler, key, value) {
        lodash_1.default.set(this._userDataCache, `${handler}.${key}`, value);
        this._updateDefaultUserDataToHandler(handler, key, value);
        const combineUserData = {
            ...(this._defaultUserData[handler] || {}),
            ...this._userDataCache[handler],
        };
        (0, asset_db_1.setDefaultUserData)(handler, combineUserData);
        const defaultMetaPath = (0, path_1.join)(asset_config_1.default.data.root, '.creator', 'default-meta.json');
        await (0, fs_extra_1.outputJSON)(defaultMetaPath, this._userDataCache);
    }
    /**
     * 更新导入默认值到导入器的渲染配置内部
     * @param handler
     * @param key
     * @param value
     */
    _updateDefaultUserDataToHandler(handler, key, value) {
        const assetHandler = this.name2handler[handler];
        // 调整已有配置内的默认值
        if (assetHandler && assetHandler.userDataConfig && assetHandler.userDataConfig.default[key]) {
            assetHandler.userDataConfig.default[key].default = value;
        }
    }
}
const assetHandlerManager = new AssetHandlerManager();
exports.default = assetHandlerManager;
function patchHandler(info, handler, extensions) {
    // 避免污染原始 info 数据
    const res = {
        handler,
        ...info,
    };
    if (res.submenu) {
        res.submenu = res.submenu.map((subInfo) => patchHandler(subInfo, handler, extensions));
    }
    if (res.template && !res.fullFileName) {
        res.fullFileName = (0, path_1.basename)(res.template);
        if (!(0, path_1.extname)(res.fullFileName)) {
            // 支持无后缀的模板文件，主要兼容 3.8.2 版本之前的脚本模板
            res.fullFileName += extensions[0];
        }
    }
    return res;
}
async function queryUserTemplates(templateDir) {
    try {
        if ((0, fs_extra_1.existsSync)(templateDir)) {
            return (await (0, fast_glob_1.default)(['**/*', '!*.meta'], {
                onlyFiles: true,
                cwd: templateDir,
            }));
        }
    }
    catch (error) {
        console.warn(error);
    }
    return [];
}
function getUserTemplateDir(importer) {
    return (0, path_1.join)(AssetHandlerManager.createTemplateRoot, importer);
}
const SizeMap = {
    large: 512,
    small: 16,
    middle: 128,
};
async function resizeThumbnail(src, dest, size) {
    if (size === 'origin') {
        return src;
    }
    if (typeof size === 'string') {
        size = SizeMap[size] || 16;
    }
    await (0, fs_extra_1.ensureDir)((0, path_1.dirname)(dest));
    const img = (0, sharp_1.default)(src);
    const width = (await img.metadata()).width;
    // 如果图片尺寸小于缩略图尺寸，则直接拷贝
    if (width && width <= size) {
        await (0, fs_extra_1.copyFile)(src, dest);
        return dest;
    }
    await img.resize(size).toFile(dest);
    return dest;
}
async function afterCreateAsset(paths, options) {
    if (!Array.isArray(paths)) {
        paths = [paths];
    }
    for (const file of paths) {
        // 文件不存在，nodejs 没有成功创建文件
        if (!(0, fs_extra_1.existsSync)(file)) {
            throw new Error(`${i18n_1.default.t('assets.create_asset.fail.drop', {
                target: file,
            })}`);
        }
        // 根据选项配置 meta 模板文件
        if (options.userData || options.uuid) {
            const meta = {
                userData: options.userData || {},
            };
            if (options.uuid) {
                meta.uuid = options.uuid;
            }
            await (0, fs_extra_1.outputJSON)((0, path_1.join)(file + '.meta'), meta, {
                spaces: 4,
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQtaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9tYW5hZ2VyL2Fzc2V0LWhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsOENBQThGO0FBQzlGLHVDQUF5RjtBQUN6RiwrQkFBb0U7QUFDcEUsb0NBQW9DO0FBQ3BDLG9EQUE0QjtBQUM1QiwwREFBMkI7QUFDM0Isa0RBQTBCO0FBQzFCLDJEQUFtQztBQUluQyxtRUFBMEM7QUFDMUMsOENBQXNCO0FBT3RCLE1BQU0sa0JBQWtCLEdBQWU7SUFDbkMsSUFBSSxFQUFFLE1BQU07SUFDWixLQUFLLEVBQUUsVUFBVTtJQUNqQixTQUFTLEVBQUUsS0FBSztDQUNuQixDQUFDO0FBRUYsTUFBYSxjQUFlLFNBQVEsbUJBQWU7SUFDL0MsWUFBWSxVQUFvQixFQUFFLFlBQTBCO1FBQ3hELEtBQUssRUFBRSxDQUFDO1FBQ1IsTUFBTSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLFlBQVksQ0FBQyxRQUEyQixDQUFDO1FBRWpJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELFlBQVksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFDRCxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxHQUFHLFlBQVksQ0FBQztRQUN4QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUM7UUFDbkMsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLElBQUksQ0FBQyxDQUFDO1FBQ3JDLFVBQVUsSUFBSSxDQUFDLElB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LFdBQUksRUFBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFO2dCQUN6QyxNQUFNLEVBQUUsQ0FBQzthQUNaLENBQUMsQ0FBQztRQUNQLENBQUM7SUFDTCxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEltcG9ydGVyIGFzIEFzc2V0REJJbXBvcnRlciwgQXNzZXQsIHNldERlZmF1bHRVc2VyRGF0YSwgZ2V0IH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0IHsgY29weSwgY29weUZpbGUsIGVuc3VyZURpciwgZXhpc3RzU3luYywgb3V0cHV0RmlsZSwgb3V0cHV0SlNPTiB9IGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHsgYmFzZW5hbWUsIGRpcm5hbWUsIGV4dG5hbWUsIGlzQWJzb2x1dGUsIGpvaW4gfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgdXJsMnBhdGggfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCBsb2Rhc2ggZnJvbSAnbG9kYXNoJztcclxuaW1wb3J0IGZnIGZyb20gJ2Zhc3QtZ2xvYic7XHJcbmltcG9ydCBTaGFycCBmcm9tICdzaGFycCc7XHJcbmltcG9ydCBpMThuIGZyb20gJy4uLy4uL2Jhc2UvaTE4bic7XHJcbmltcG9ydCB7IElBc3NldCwgSUV4cG9ydERhdGEgfSBmcm9tICcuLi9AdHlwZXMvcHJvdGVjdGVkL2Fzc2V0JztcclxuaW1wb3J0IHsgSUNPTkNvbmZpZywgQXNzZXRIYW5kbGVyLCBDdXN0b21IYW5kbGVyLCBDdXN0b21Bc3NldEhhbmRsZXIsIElDcmVhdGVNZW51SW5mbywgQ3JlYXRlQXNzZXRPcHRpb25zLCBUaHVtYm5haWxTaXplLCBUaHVtYm5haWxJbmZvLCBJRXhwb3J0T3B0aW9ucywgSUFzc2V0Q29uZmlnLCBJbXBvcnRlckhvb2sgfSBmcm9tICcuLi9AdHlwZXMvcHJvdGVjdGVkL2Fzc2V0LWhhbmRsZXInO1xyXG5pbXBvcnQgdHlwZSB7IEFzc2V0SGFuZGxlckluZm8gfSBmcm9tICcuLi9hc3NldC1oYW5kbGVyL2NvbmZpZyc7XHJcbmltcG9ydCBhc3NldENvbmZpZyBmcm9tICcuLi9hc3NldC1jb25maWcnO1xyXG5pbXBvcnQgZW9sIGZyb20gJ2VvbCc7XHJcblxyXG5pbnRlcmZhY2UgSGFuZGxlckluZm8gZXh0ZW5kcyBBc3NldEhhbmRsZXJJbmZvIHtcclxuICAgIHBrZ05hbWU6IHN0cmluZztcclxuICAgIGludGVybmFsOiBib29sZWFuO1xyXG59XHJcblxyXG5jb25zdCBkYXRhYmFzZUljb25Db25maWc6IElDT05Db25maWcgPSB7XHJcbiAgICB0eXBlOiAnaWNvbicsXHJcbiAgICB2YWx1ZTogJ2RhdGFiYXNlJyxcclxuICAgIHRodW1ibmFpbDogZmFsc2UsXHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgQ3VzdG9tSW1wb3J0ZXIgZXh0ZW5kcyBBc3NldERCSW1wb3J0ZXIge1xyXG4gICAgY29uc3RydWN0b3IoZXh0ZW5zaW9uczogc3RyaW5nW10sIGFzc2V0SGFuZGxlcjogQXNzZXRIYW5kbGVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICBjb25zdCB7IG1pZ3JhdGlvbnMsIG1pZ3JhdGlvbkhvb2ssIHZlcnNpb24sIHZlcnNpb25Db2RlLCBmb3JjZSwgaW1wb3J0OiBJbXBvcnRBc3NldCB9ID0gYXNzZXRIYW5kbGVyLmltcG9ydGVyIGFzIEFzc2V0REJJbXBvcnRlcjtcclxuXHJcbiAgICAgICAgaWYgKCFJbXBvcnRBc3NldCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgZmluZCBpbXBvcnQgZnVuY3Rpb24gaW4gYXNzZXRIYW5kbGVyKCR7YXNzZXRIYW5kbGVyLm5hbWV9KWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB7IHZhbGlkYXRlLCBuYW1lIH0gPSBhc3NldEhhbmRsZXI7XHJcbiAgICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5fdmVyc2lvbiA9IHZlcnNpb24gfHwgJzAuMC4wJztcclxuICAgICAgICB0aGlzLl92ZXJzaW9uQ29kZSA9IHZlcnNpb25Db2RlIHx8IDE7XHJcbiAgICAgICAgbWlncmF0aW9ucyAmJiAodGhpcy5fbWlncmF0aW9ucyA9IG1pZ3JhdGlvbnMpO1xyXG4gICAgICAgIG1pZ3JhdGlvbkhvb2sgJiYgKHRoaXMuX21pZ3JhdGlvbkhvb2sgPSBtaWdyYXRpb25Ib29rKTtcclxuICAgICAgICB2YWxpZGF0ZSAmJiAodGhpcy52YWxpZGF0ZSA9IHZhbGlkYXRlKTtcclxuICAgICAgICBmb3JjZSAmJiAodGhpcy5mb3JjZSA9IGZvcmNlKTtcclxuICAgICAgICAvLyBUT0RPIOiwg+aVtOWRveWQjVxyXG4gICAgICAgIHRoaXMuZXh0bmFtZXMgPSBleHRlbnNpb25zO1xyXG5cclxuICAgICAgICB0aGlzLmltcG9ydCA9IGFzeW5jIChhc3NldDogSUFzc2V0KSA9PiB7XHJcbiAgICAgICAgICAgIGF3YWl0IGFzc2V0SGFuZGxlck1hbmFnZXIucnVuSW1wb3J0ZXJIb29rKGFzc2V0LCAnYmVmb3JlJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IEltcG9ydEFzc2V0LmNhbGwoYXNzZXRIYW5kbGVyLCBhc3NldCk7XHJcbiAgICAgICAgICAgIGF3YWl0IGFzc2V0SGFuZGxlck1hbmFnZXIucnVuSW1wb3J0ZXJIb29rKGFzc2V0LCAnYWZ0ZXInKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcztcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBBc3NldEhhbmRsZXJNYW5hZ2VyIHtcclxuICAgIHN0YXRpYyBjcmVhdGVUZW1wbGF0ZVJvb3Q6IHN0cmluZztcclxuICAgIG5hbWUyaGFuZGxlcjogUmVjb3JkPHN0cmluZywgQXNzZXRIYW5kbGVyPiA9IHt9O1xyXG4gICAgdHlwZTJoYW5kbGVyOiBSZWNvcmQ8c3RyaW5nLCBBc3NldEhhbmRsZXJbXT4gPSB7fTtcclxuICAgIG5hbWUyaW1wb3J0ZXI6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUltcG9ydGVyPiA9IHt9O1xyXG4gICAgLy8g57yT5a2Y5bey57uP5p+l5om+5Yiw55qE5aSE55CG5ZmoXHJcbiAgICAvLyBUT0RPIOS4jiBpbXBvcnRlcjJjdXN0b20g5pW05ZCIXHJcbiAgICBpbXBvcnRlcjJPcGVyYXRlUmVjb3JkOiB7IFtpbXBvcnRlcjogc3RyaW5nXTogeyBbb3BlcmF0ZTogc3RyaW5nXTogQXNzZXRIYW5kbGVyIHwgQ3VzdG9tSGFuZGxlciB9IH0gPSB7fTtcclxuICAgIC8vIFtpbXBvcnRlciDmh5LliqDovb1dIDEvM1xyXG4gICAgZXh0bmFtZTJyZWdpc3RlckluZm86IFJlY29yZDxzdHJpbmcsIEhhbmRsZXJJbmZvW10+ID0ge307XHJcbiAgICBuYW1lMnJlZ2lzdGVySW5mbzogUmVjb3JkPHN0cmluZywgSGFuZGxlckluZm8+ID0ge307XHJcblxyXG4gICAgLy8g5omp5bGV6LWE5rqQ5aSE55CGXHJcbiAgICBuYW1lMmN1c3RvbTogUmVjb3JkPHN0cmluZywgQ3VzdG9tSGFuZGxlcj4gPSB7fTtcclxuICAgIGltcG9ydGVyMmN1c3RvbTogUmVjb3JkPHN0cmluZywgQ3VzdG9tSGFuZGxlcltdPiA9IHt9O1xyXG5cclxuICAgIF9pY29uQ29uZmlnTWFwOiBSZWNvcmQ8c3RyaW5nLCBJQ09OQ29uZmlnPiB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIC8vIOeUqOaIt+mFjee9rumHjOeahCB1c2VyRGF0YSDnvJPlrZhcclxuICAgIF91c2VyRGF0YUNhY2hlOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XHJcbiAgICAvLyDlr7zlhaXlmajph4zms6jlhoznmoTpu5jorqQgdXNlckRhdGEg5YC877yMIOazqOWGjOWQjuS4jeWPr+S/ruaUuVxyXG4gICAgX2RlZmF1bHRVc2VyRGF0YTogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xyXG5cclxuICAgIGNsZWFyKCkge1xyXG4gICAgICAgIHRoaXMubmFtZTJoYW5kbGVyID0ge307XHJcbiAgICAgICAgdGhpcy5leHRuYW1lMnJlZ2lzdGVySW5mbyA9IHt9O1xyXG4gICAgICAgIHRoaXMubmFtZTJyZWdpc3RlckluZm8gPSB7fTtcclxuICAgICAgICB0aGlzLm5hbWUyY3VzdG9tID0ge307XHJcbiAgICAgICAgdGhpcy5pbXBvcnRlcjJPcGVyYXRlUmVjb3JkID0ge307XHJcbiAgICAgICAgdGhpcy5pbXBvcnRlcjJjdXN0b20gPSB7fTtcclxuICAgICAgICB0aGlzLl9pY29uQ29uZmlnTWFwID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb21waWxlRWZmZWN0KF9mb3JjZTogYm9vbGVhbikge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY29tcGlsZUVmZmVjdCBpcyBub3QgaW1wbGVtZW50ZWQsIHBsZWFzZSBpbml0IGFzc2V0SGFuZGxlciBmaXJzdCEnKTtcclxuICAgIH07XHJcbiAgICBzdGFydEF1dG9HZW5FZmZlY3RCaW4oKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzdGFydEF1dG9HZW5FZmZlY3RCaW4gaXMgbm90IGltcGxlbWVudGVkLCBwbGVhc2UgaW5pdCBhc3NldEhhbmRsZXIgZmlyc3QhJyk7XHJcbiAgICB9O1xyXG4gICAgZ2V0RWZmZWN0QmluUGF0aCgpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZ2V0RWZmZWN0QmluUGF0aCBpcyBub3QgaW1wbGVtZW50ZWQsIHBsZWFzZSBpbml0IGFzc2V0SGFuZGxlciBmaXJzdCEnKTtcclxuICAgIH07XHJcblxyXG4gICAgYXN5bmMgaW5pdCgpIHtcclxuICAgICAgICBjb25zdCB7IGFzc2V0SGFuZGxlckluZm9zIH0gPSBhd2FpdCBpbXBvcnQoJy4uLy4uL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2NvbmZpZycpO1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXIoJ2NvY29zLWNsaScsIGFzc2V0SGFuZGxlckluZm9zLCB0cnVlKTtcclxuICAgICAgICBBc3NldEhhbmRsZXJNYW5hZ2VyLmNyZWF0ZVRlbXBsYXRlUm9vdCA9IGF3YWl0IGFzc2V0Q29uZmlnLmdldFByb2plY3QoJ2NyZWF0ZVRlbXBsYXRlUm9vdCcpO1xyXG4gICAgICAgIGNvbnN0IHsgY29tcGlsZUVmZmVjdCwgc3RhcnRBdXRvR2VuRWZmZWN0QmluLCBnZXRFZmZlY3RCaW5QYXRoIH0gPSBhd2FpdCBpbXBvcnQoJy4uL2Fzc2V0LWhhbmRsZXInKTtcclxuICAgICAgICB0aGlzLmNvbXBpbGVFZmZlY3QgPSBjb21waWxlRWZmZWN0O1xyXG4gICAgICAgIHRoaXMuc3RhcnRBdXRvR2VuRWZmZWN0QmluID0gc3RhcnRBdXRvR2VuRWZmZWN0QmluO1xyXG4gICAgICAgIHRoaXMuZ2V0RWZmZWN0QmluUGF0aCA9IGdldEVmZmVjdEJpblBhdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmv4DmtLvliankvZnmnKrms6jlhozlrozmiJDnmoTotYTmupDlpITnkIblmahcclxuICAgICAqL1xyXG4gICAgYXN5bmMgYWN0aXZhdGVSZWdpc3RlckFsbCgpIHtcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChPYmplY3QudmFsdWVzKHRoaXMubmFtZTJyZWdpc3RlckluZm8pLm1hcCgoaW5mbykgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBsYXp5IHJlZ2lzdGVyIGFzc2V0IGhhbmRsZXIgJHtpbmZvLm5hbWV9YCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFjdGl2YXRlUmVnaXN0ZXIoaW5mbyk7XHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgYWN0aXZhdGVSZWdpc3RlcihyZWdpc3RlckluZm9zOiBIYW5kbGVySW5mbykge1xyXG4gICAgICAgIGNvbnN0IHsgcGtnTmFtZSwgbmFtZSwgZXh0ZW5zaW9ucywgaW50ZXJuYWwgfSA9IHJlZ2lzdGVySW5mb3M7XHJcbiAgICAgICAgaWYgKHRoaXMubmFtZTJpbXBvcnRlcltuYW1lXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5uYW1lMmltcG9ydGVyW25hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBhc3NldEhhbmRsZXI6IEFzc2V0SGFuZGxlciA9IGF3YWl0IHJlZ2lzdGVySW5mb3MubG9hZCgpO1xyXG4gICAgICAgICAgICBpZiAoYXNzZXRIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5hbWUyaGFuZGxlcltuYW1lXSA9IE9iamVjdC5hc3NpZ24oYXNzZXRIYW5kbGVyLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgZnJvbToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwa2dOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlcm5hbCxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBleHRlbmRzSGFuZGxlck5hbWUgPSAoYXNzZXRIYW5kbGVyIGFzIEN1c3RvbUFzc2V0SGFuZGxlcikuZXh0ZW5kcztcclxuICAgICAgICAgICAgICAgIGlmIChleHRlbmRzSGFuZGxlck5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMubmFtZTJoYW5kbGVyW2V4dGVuZHNIYW5kbGVyTmFtZV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQ2FuIG5vdCBmaW5kIGV4dGVuZCBhc3NldC1oYW5kbGVyICR7ZXh0ZW5kc0hhbmRsZXJOYW1lfWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5uYW1lMmhhbmRsZXJbbmFtZV0uYXNzZXRUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gdGhpcy5uYW1lMmhhbmRsZXJbbmFtZV0uYXNzZXRUeXBlITtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZTJoYW5kbGVyW3R5cGVdID0gKHRoaXMudHlwZTJoYW5kbGVyW3R5cGVdIHx8IFtdKS5jb25jYXQoW3RoaXMubmFtZTJoYW5kbGVyW25hbWVdXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmFtZTJoYW5kbGVyW25hbWVdID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5uYW1lMmhhbmRsZXJbZXh0ZW5kc0hhbmRsZXJOYW1lXSwgdGhpcy5uYW1lMmhhbmRsZXJbbmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmFtZTJoYW5kbGVyW25hbWVdLmltcG9ydGVyID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5uYW1lMmhhbmRsZXJbZXh0ZW5kc0hhbmRsZXJOYW1lXS5pbXBvcnRlciwgdGhpcy5uYW1lMmhhbmRsZXJbbmFtZV0uaW1wb3J0ZXIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubmFtZTJoYW5kbGVyW25hbWVdLmFzc2V0VHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLm5hbWUyaGFuZGxlcltuYW1lXS5hc3NldFR5cGUhO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZTJoYW5kbGVyW3R5cGVdID0gKHRoaXMudHlwZTJoYW5kbGVyW3R5cGVdIHx8IFtdKS5jb25jYXQoW3RoaXMubmFtZTJoYW5kbGVyW25hbWVdXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyDmlLbpm4bpu5jorqTphY3nva7vvIzms6jlhozliLDlr7zlhaXns7vnu5/lhoVcclxuICAgICAgICAgICAgICAgIGlmIChhc3NldEhhbmRsZXIudXNlckRhdGFDb25maWcpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBhc3NldEhhbmRsZXIudXNlckRhdGFDb25maWcuZGVmYXVsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fdXNlckRhdGFDYWNoZVtuYW1lXSAmJiB0aGlzLl91c2VyRGF0YUNhY2hlW25hbWVdW2tleV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0SGFuZGxlci51c2VyRGF0YUNvbmZpZy5kZWZhdWx0W2tleV0uZGVmYXVsdCA9IHRoaXMuX3VzZXJEYXRhQ2FjaGVbbmFtZV1ba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoW3VuZGVmaW5lZCwgbnVsbF0uaW5jbHVkZXMoYXNzZXRIYW5kbGVyLnVzZXJEYXRhQ29uZmlnLmRlZmF1bHRba2V5XS5kZWZhdWx0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9kYXNoLnNldCh0aGlzLl9kZWZhdWx0VXNlckRhdGEsIGAke25hbWV9LiR7a2V5fWAsIGFzc2V0SGFuZGxlci51c2VyRGF0YUNvbmZpZy5kZWZhdWx0W2tleV0uZGVmYXVsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVVc2VyRGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uKHRoaXMuX2RlZmF1bHRVc2VyRGF0YVtuYW1lXSB8fCB7fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLih0aGlzLl91c2VyRGF0YUNhY2hlW25hbWVdIHx8IHt9KSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhjb21iaW5lVXNlckRhdGEpLmxlbmd0aCAmJiBzZXREZWZhdWx0VXNlckRhdGEobmFtZSwgY29tYmluZVVzZXJEYXRhKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm5hbWUyaW1wb3J0ZXJbbmFtZV0gPSBuZXcgQ3VzdG9tSW1wb3J0ZXIoZXh0ZW5zaW9ucywgdGhpcy5uYW1lMmhhbmRsZXJbbmFtZV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMubmFtZTJyZWdpc3RlckluZm9bbmFtZV07XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGByZWdpc3RlciBhc3NldC1oYW5kbGVyICR7bmFtZX0gZmFpbGVkIWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZWdpc3Rlcihwa2dOYW1lOiBzdHJpbmcsIGFzc2V0SGFuZGxlckluZm9zOiBBc3NldEhhbmRsZXJJbmZvW10sIGludGVybmFsOiBib29sZWFuKSB7XHJcbiAgICAgICAgYXNzZXRIYW5kbGVySW5mb3MuZm9yRWFjaCgoaW5mbykgPT4ge1xyXG4gICAgICAgICAgICAvLyDmnKrkvKDpgJIgZXh0bmFtZSDnmoTop4bkuLrlrZDotYTmupDlr7zlhaXlmajvvIxleHRuYW1lID0gJy0nXHJcbiAgICAgICAgICAgIGNvbnN0IGV4dGVuc2lvbnMgPSBpbmZvLmV4dGVuc2lvbnMgJiYgaW5mby5leHRlbnNpb25zLmxlbmd0aCA/IGluZm8uZXh0ZW5zaW9ucyA6IFsnLSddO1xyXG4gICAgICAgICAgICB0aGlzLm5hbWUycmVnaXN0ZXJJbmZvW2luZm8ubmFtZV0gPSB7XHJcbiAgICAgICAgICAgICAgICAuLi5pbmZvLFxyXG4gICAgICAgICAgICAgICAgcGtnTmFtZSxcclxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMsXHJcbiAgICAgICAgICAgICAgICBpbnRlcm5hbCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZXh0ZW5zaW9ucy5mb3JFYWNoKChleHRuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dG5hbWUycmVnaXN0ZXJJbmZvW2V4dG5hbWVdID0gdGhpcy5leHRuYW1lMnJlZ2lzdGVySW5mb1tleHRuYW1lXSB8fCBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0bmFtZTJyZWdpc3RlckluZm9bZXh0bmFtZV0ucHVzaCh0aGlzLm5hbWUycmVnaXN0ZXJJbmZvW2luZm8ubmFtZV0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1bnJlZ2lzdGVyKHBrZ05hbWU6IHN0cmluZywgYXNzZXRIYW5kbGVySW5mb3M6IEFzc2V0SGFuZGxlckluZm9bXSkge1xyXG4gICAgICAgIGFzc2V0SGFuZGxlckluZm9zLmZvckVhY2goKGluZm8pID0+IHtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMubmFtZTJyZWdpc3RlckluZm9baW5mby5uYW1lXTtcclxuICAgICAgICAgICAgaW5mby5leHRlbnNpb25zLmZvckVhY2goKGV4dG5hbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5leHRuYW1lMnJlZ2lzdGVySW5mb1tleHRuYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0bmFtZTJyZWdpc3RlckluZm9bZXh0bmFtZV0gPSB0aGlzLmV4dG5hbWUycmVnaXN0ZXJJbmZvW2V4dG5hbWVdLmZpbHRlcigoaW5mbykgPT4gaW5mby5wa2dOYW1lID09PSBwa2dOYW1lKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuZXh0bmFtZTJyZWdpc3RlckluZm9bJy0nXSA9IHRoaXMuZXh0bmFtZTJyZWdpc3RlckluZm9bJy0nXS5maWx0ZXIoKGluZm8pID0+IGluZm8ucGtnTmFtZSA9PT0gcGtnTmFtZSk7XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGZpbmRJbXBvcnRlcihhc3NldDogSUFzc2V0LCB3aXRob3V0RGVmYXVsdEltcG9ydGVyPzogYm9vbGVhbik6IFByb21pc2U8QXNzZXREQkltcG9ydGVyIHwgbnVsbD4ge1xyXG4gICAgICAgIGxldCBleHRuYW1lID0gJyc7XHJcbiAgICAgICAgaWYgKGFzc2V0IGluc3RhbmNlb2YgQXNzZXQgJiYgYXNzZXQuZXh0bmFtZSkge1xyXG4gICAgICAgICAgICBleHRuYW1lID0gYXNzZXQuZXh0bmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5bCd6K+V5L2/55So5qCH6K6w55qE5a+85YWl5ZmoLCAqIOeahOWvvOWFpeWZqOaYr+avj+asoeaJvuS4jeWIsOWQiOmAguWvvOWFpeWZqOaXtuaJjeS8mui1sOeahO+8jOWGjeasoei/m+WFpeaXtuimgemHjeaWsOi1sOa1geeoi+afpeaJvuWvvOWFpeWZqFxyXG4gICAgICAgIGlmIChhc3NldC5tZXRhLmltcG9ydGVyICYmIGFzc2V0Lm1ldGEuaW1wb3J0ZXIgIT09ICcqJykge1xyXG4gICAgICAgICAgICBsZXQgaW1wb3J0ZXI6IEFzc2V0REJJbXBvcnRlciB8IG51bGwgPSB0aGlzLm5hbWUyaW1wb3J0ZXJbYXNzZXQubWV0YS5pbXBvcnRlcl07XHJcbiAgICAgICAgICAgIGlmIChpbXBvcnRlcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGltcG9ydGVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJlZ2lzdGVySW5mbyA9IHRoaXMubmFtZTJyZWdpc3RlckluZm9bYXNzZXQubWV0YS5pbXBvcnRlcl07XHJcbiAgICAgICAgICAgIGlmIChyZWdpc3RlckluZm8pIHtcclxuICAgICAgICAgICAgICAgIGltcG9ydGVyID0gYXdhaXQgdGhpcy5hY3RpdmF0ZVJlZ2lzdGVyKHJlZ2lzdGVySW5mbyk7XHJcbiAgICAgICAgICAgICAgICAvLyDkuI7moIforrDlr7zlhaXlmajkuIDoh7TnmoTkuI3pnIDopoHotbDmo4DpqoxcclxuICAgICAgICAgICAgICAgIGlmIChpbXBvcnRlciAmJiBpbXBvcnRlci5uYW1lID09PSBhc3NldC5tZXRhLmltcG9ydGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGltcG9ydGVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOS4iumdoueahOmAu+i+kei1sOWujOi/mOayoeacieaJvuWIsOWvvOWFpeWZqO+8jOWImeivtOaYjuS7peW+gOagh+iusOeahOWvvOWFpeWZqOW3sue7j+aXoOazleaJvuWIsO+8jOmcgOimgeaKpemUme+8jOS5i+WQjumHjeaWsOWvu+aJvuWQiOmAgueahOWvvOWFpeWZqFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQ2FuIG5vdCBmaW5kIHRoZSBpbXBvcnRlciAke2Fzc2V0Lm1ldGEuaW1wb3J0ZXJ9IGluIGVkaXRvcmApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5bCd6K+V6YCa6L+H5ZCO57yA5om+5Yiw6YCC5ZCI6L+Z5Liq6LWE5rqQ55qE5a+85YWl5ZmoXHJcbiAgICAgICAgY29uc3QgcmVnaXN0ZXJJbmZvcyA9IHRoaXMuZXh0bmFtZTJyZWdpc3RlckluZm9bZXh0bmFtZV0gfHwgW107XHJcbiAgICAgICAgaWYgKHJlZ2lzdGVySW5mb3MubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGltcG9ydGVyID0gYXdhaXQgdGhpcy5fZmluZEltcG9ydGVySW5SZWdpc3RlckluZm8oYXNzZXQsIHJlZ2lzdGVySW5mb3MpO1xyXG4gICAgICAgICAgICBpZiAoaW1wb3J0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbXBvcnRlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHdpdGhvdXREZWZhdWx0SW1wb3J0ZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDmib7kuI3liLDlkIjpgILotYTmupDnmoTlr7zlhaXlmajvvIzlsJ3or5Xkvb/nlKjpgJrov4flr7zlhaXlmahcclxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXREZWZhdWx0SW1wb3J0ZXIoYXNzZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldERlZmF1bHRJbXBvcnRlcihhc3NldDogSUFzc2V0KSB7XHJcbiAgICAgICAgcmV0dXJuIChhd2FpdCB0aGlzLl9maW5kSW1wb3J0ZXJJblJlZ2lzdGVySW5mbyhhc3NldCwgdGhpcy5leHRuYW1lMnJlZ2lzdGVySW5mb1snKiddIHx8IFtdKSB8fCBudWxsKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBfZmluZEltcG9ydGVySW5SZWdpc3RlckluZm8oYXNzZXQ6IElBc3NldCwgcmVnaXN0ZXJJbmZvczogSGFuZGxlckluZm9bXSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSByZWdpc3RlckluZm9zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgbmFtZSB9ID0gcmVnaXN0ZXJJbmZvc1tpXTtcclxuICAgICAgICAgICAgLy8g5pyJ5Y+v6IO95Zyo56ys5LiA5q2l55qE5rWB56iL6YeM5bey57uP6I635Y+W5Yiw57yT5a2Y5ZyoIG5hbWUyaW1wb3J0ZXIg5YaF5LqGXHJcbiAgICAgICAgICAgIGxldCBpbXBvcnRlcjogQXNzZXREQkltcG9ydGVyIHwgbnVsbCA9IHRoaXMubmFtZTJpbXBvcnRlcltuYW1lXTtcclxuICAgICAgICAgICAgaWYgKCFpbXBvcnRlcikge1xyXG4gICAgICAgICAgICAgICAgaW1wb3J0ZXIgPSBhd2FpdCB0aGlzLmFjdGl2YXRlUmVnaXN0ZXIocmVnaXN0ZXJJbmZvc1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFpbXBvcnRlcikge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRlID0gYXdhaXQgaW1wb3J0ZXIudmFsaWRhdGUoYXNzZXQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbGlkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGltcG9ydGVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBJbXBvcnRlcigke25hbWV9KSB2YWxpZGF0ZSBmYWlsZWQ6ICR7YXNzZXQudXVpZH1gKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYWRkKGFzc2V0SGFuZGxlcjogQXNzZXRIYW5kbGVyLCBleHRlbnNpb25zOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIC8vIOWmguaenOW3sue7j+WtmOWcqOWQjOWQjeeahOWvvOWFpeWZqOWImei3s+i/h1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgYXNzZXRIYW5kbGVyLm5hbWUgIT09ICcqJyAmJlxyXG4gICAgICAgICAgICB0aGlzLm5hbWUyaGFuZGxlclthc3NldEhhbmRsZXIubmFtZV0gJiZcclxuICAgICAgICAgICAgdGhpcy5uYW1lMmhhbmRsZXJbYXNzZXRIYW5kbGVyLm5hbWVdICE9PSBhc3NldEhhbmRsZXJcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBUaGUgQXNzZXRIYW5kbGVyWyR7YXNzZXRIYW5kbGVyLm5hbWV9XSBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubmFtZTJoYW5kbGVyW2Fzc2V0SGFuZGxlci5uYW1lXSA9IGFzc2V0SGFuZGxlcjtcclxuXHJcbiAgICAgICAgY29uc3QgaW1wb3J0ZXIgPSBuZXcgQ3VzdG9tSW1wb3J0ZXIoZXh0ZW5zaW9ucywgYXNzZXRIYW5kbGVyKTtcclxuICAgICAgICB0aGlzLm5hbWUyaW1wb3J0ZXJbYXNzZXRIYW5kbGVyLm5hbWVdID0gaW1wb3J0ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blkITkuKrotYTmupDnmoTmlrDlu7rliJfooajmlbDmja5cclxuICAgICAqL1xyXG4gICAgYXN5bmMgZ2V0Q3JlYXRlTWFwKCk6IFByb21pc2U8SUNyZWF0ZU1lbnVJbmZvW10+IHtcclxuICAgICAgICBjb25zdCByZXN1bHQ6IE9taXQ8SUNyZWF0ZU1lbnVJbmZvLCAnY3JlYXRlJz5bXSA9IFtdO1xyXG4gICAgICAgIGZvciAoY29uc3QgaW1wb3J0ZXIgb2YgT2JqZWN0LmtleXModGhpcy5uYW1lMmhhbmRsZXIpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZU1lbnUgPSBhd2FpdCB0aGlzLmdldENyZWF0ZU1lbnVCeU5hbWUoaW1wb3J0ZXIpO1xyXG4gICAgICAgICAgICByZXN1bHQucHVzaCguLi5jcmVhdGVNZW51KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOagueaNruWvvOWFpeWZqOWQjeensOiOt+WPlui1hOa6kOaooeadv+S/oeaBr1xyXG4gICAgICogQHBhcmFtIGltcG9ydGVyIFxyXG4gICAgICogQHJldHVybnMgXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGdldENyZWF0ZU1lbnVCeU5hbWUoaW1wb3J0ZXI6IHN0cmluZyk6IFByb21pc2U8SUNyZWF0ZU1lbnVJbmZvW10+IHtcclxuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5uYW1lMmhhbmRsZXJbaW1wb3J0ZXJdO1xyXG4gICAgICAgIGlmICghaGFuZGxlciB8fCAhaGFuZGxlci5jcmVhdGVJbmZvIHx8ICFoYW5kbGVyLmNyZWF0ZUluZm8uZ2VuZXJhdGVNZW51SW5mbykge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHsgZ2VuZXJhdGVNZW51SW5mbywgcHJldmVudERlZmF1bHRUZW1wbGF0ZU1lbnUgfSA9IGhhbmRsZXIuY3JlYXRlSW5mbztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0TWVudUluZm8gPSBhd2FpdCBnZW5lcmF0ZU1lbnVJbmZvKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlRGlyID0gZ2V0VXNlclRlbXBsYXRlRGlyKGltcG9ydGVyKTtcclxuICAgICAgICAgICAgbGV0IHRlbXBsYXRlcyA9IHByZXZlbnREZWZhdWx0VGVtcGxhdGVNZW51ID8gW10gOiBhd2FpdCBxdWVyeVVzZXJUZW1wbGF0ZXModGVtcGxhdGVEaXIpO1xyXG4gICAgICAgICAgICAvLyBUT0RPIOe7n+S4gOWRveWQjeS4uiBleHRlbnNpb25zXHJcbiAgICAgICAgICAgIGNvbnN0IGV4dGVuc2lvbnMgPSB0aGlzLm5hbWUyaW1wb3J0ZXJbaW1wb3J0ZXJdLmV4dG5hbWVzO1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzlrZjlnKjlkI7nvIDliJnov4fmu6TkuI3lkIjms5XlkI7nvIDnmoTmqKHmnb/mlbDmja7vvIzml6DlkI7nvIDkvZzkuLrmraPluLjmqKHmnb/lpITnkIbvvIjkuLvopoHlhbzlrrnml6fniYjmnKzml6DlkI7nvIDnmoTotYTmupDmqKHmnb/mlL7nva7mlrnlvI/vvIlcclxuICAgICAgICAgICAgdGVtcGxhdGVzID0gdGVtcGxhdGVzLmZpbHRlcigoZmlsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZXh0TmFtZSA9IGV4dG5hbWUoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWV4dE5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBleHRlbnNpb25zLmluY2x1ZGVzKGV4dE5hbWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZU1lbnU6IElDcmVhdGVNZW51SW5mb1tdID0gW107XHJcbiAgICAgICAgICAgIGRlZmF1bHRNZW51SW5mby5mb3JFYWNoKChpbmZvKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyDlrZjlnKjnlKjmiLfmqKHmnb/ml7bmo4Dmn6XmmK/lkKbmnInopobnm5bpu5jorqTmqKHmnb/nmoTmg4XlhrVcclxuICAgICAgICAgICAgICAgIGlmIChpbmZvLnRlbXBsYXRlICYmIHRlbXBsYXRlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyVGVtcGxhdGVJbmRleCA9IHRlbXBsYXRlcy5maW5kSW5kZXgoKHRlbXBsYXRlUGF0aCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmFzZW5hbWUodGVtcGxhdGVQYXRoKSA9PT0gYmFzZW5hbWUoaW5mby50ZW1wbGF0ZSEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh1c2VyVGVtcGxhdGVJbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5mbyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaW5mbykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnRlbXBsYXRlID0gdGVtcGxhdGVzW3VzZXJUZW1wbGF0ZUluZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVzLnNwbGljZSh1c2VyVGVtcGxhdGVJbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY3JlYXRlTWVudS5wdXNoKHBhdGNoSGFuZGxlcihpbmZvLCBpbXBvcnRlciwgZXh0ZW5zaW9ucykpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIOS4jum7mOiupOaooeadv+mdnuWQjOWQjeeahOaooeadv+aWh+S7tuS4uueUqOaIt+iHquWumuS5ieaooeadv1xyXG4gICAgICAgICAgICBpZiAodGVtcGxhdGVzLmxlbmd0aCAmJiBjcmVhdGVNZW51Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVzLmZvckVhY2goKHRlbXBsYXRlUGF0aCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZU1lbnUucHVzaChwYXRjaEhhbmRsZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogYmFzZW5hbWUodGVtcGxhdGVQYXRoLCBleHRuYW1lKHRlbXBsYXRlUGF0aCkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGVQYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBiYXNlbmFtZSh0ZW1wbGF0ZVBhdGgsIGV4dG5hbWUodGVtcGxhdGVQYXRoKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxGaWxlTmFtZTogYmFzZW5hbWUodGVtcGxhdGVQYXRoLCBleHRuYW1lKHRlbXBsYXRlUGF0aCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sIGltcG9ydGVyLCBleHRlbnNpb25zKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZU1lbnU7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgR2VuZXJhdGUgY3JlYXRlIGxpc3QgaW4gaGFuZGxlciAke2ltcG9ydGVyfSBmYWlsZWRgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIOeUn+aIkOWIm+W7uui1hOa6kOaooeadv1xyXG4gICAgICogQHBhcmFtIGltcG9ydGVyIFxyXG4gICAgICovXHJcbiAgICBhc3luYyBjcmVhdGVBc3NldFRlbXBsYXRlKGltcG9ydGVyOiBzdHJpbmcsIHRlbXBsYXRlUGF0aDogc3RyaW5nLCB0YXJnZXQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIHRlbXBsYXRlUGF0aCA9IGlzQWJzb2x1dGUodGVtcGxhdGVQYXRoKSA/IHRlbXBsYXRlUGF0aCA6IHVybDJwYXRoKHRlbXBsYXRlUGF0aCk7XHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZVBhdGggfHwgIWV4aXN0c1N5bmModGVtcGxhdGVQYXRoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGFzc2V0VGVtcGxhdGVEaXIgPSBnZXRVc2VyVGVtcGxhdGVEaXIoaW1wb3J0ZXIpO1xyXG4gICAgICAgIGF3YWl0IGVuc3VyZURpcihhc3NldFRlbXBsYXRlRGlyKTtcclxuICAgICAgICBhd2FpdCBjb3B5KHRlbXBsYXRlUGF0aCwgdGFyZ2V0KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBxdWVyeUljb25Db25maWdNYXAoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBJQ09OQ29uZmlnPj4ge1xyXG4gICAgICAgIGlmICh0aGlzLl9pY29uQ29uZmlnTWFwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pY29uQ29uZmlnTWFwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIElDT05Db25maWc+ID0ge307XHJcbiAgICAgICAgZm9yIChjb25zdCBpbXBvcnRlciBvZiBPYmplY3Qua2V5cyh0aGlzLm5hbWUyaGFuZGxlcikpIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMubmFtZTJoYW5kbGVyW2ltcG9ydGVyXTtcclxuICAgICAgICAgICAgaWYgKCFoYW5kbGVyLmljb25JbmZvKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRbaW1wb3J0ZXJdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpY29uJyxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogaW1wb3J0ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgdGh1bWJuYWlsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCB7IGRlZmF1bHQ6IGRlZmF1bHRDb25maWcsIGdlbmVyYXRlVGh1bWJuYWlsIH0gPSBoYW5kbGVyLmljb25JbmZvO1xyXG4gICAgICAgICAgICByZXN1bHRbaW1wb3J0ZXJdID0ge1xyXG4gICAgICAgICAgICAgICAgLi4uZGVmYXVsdENvbmZpZyxcclxuICAgICAgICAgICAgICAgIHRodW1ibmFpbDogISFnZW5lcmF0ZVRodW1ibmFpbCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5omL5Yqo6KGl5YWFIGRhdGFiYXNlIOeahOi1hOa6kOWkhOeQhuWZqFxyXG4gICAgICAgIHJlc3VsdFsnZGF0YWJhc2UnXSA9IGRhdGFiYXNlSWNvbkNvbmZpZztcclxuICAgICAgICB0aGlzLl9pY29uQ29uZmlnTWFwID0gcmVzdWx0O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rotYTmupBcclxuICAgICAqIEBwYXJhbSBvcHRpb25zIFxyXG4gICAgICogQHJldHVybnMg6L+U5Zue6LWE5rqQ5Yib5bu65Zyw5Z2AXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGNyZWF0ZUFzc2V0KG9wdGlvbnM6IENyZWF0ZUFzc2V0T3B0aW9ucyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgb3B0aW9ucy5yZW5hbWUgPSBvcHRpb25zLnJlbmFtZSA/PyB0cnVlO1xyXG4gICAgICAgIGlmICghb3B0aW9ucy5oYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlZ2lzdGVySW5mb3MgPSB0aGlzLmV4dG5hbWUycmVnaXN0ZXJJbmZvW2V4dG5hbWUob3B0aW9ucy50YXJnZXQpXTtcclxuICAgICAgICAgICAgb3B0aW9ucy5oYW5kbGVyID0gcmVnaXN0ZXJJbmZvcyAmJiByZWdpc3RlckluZm9zLmxlbmd0aCA/IHJlZ2lzdGVySW5mb3NbMF0ubmFtZSA6IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLmhhbmRsZXIpIHtcclxuICAgICAgICAgICAgY29uc3QgYXNzZXRIYW5kbGVyID0gdGhpcy5uYW1lMmhhbmRsZXJbb3B0aW9ucy5oYW5kbGVyXTtcclxuICAgICAgICAgICAgaWYgKGFzc2V0SGFuZGxlciAmJiBhc3NldEhhbmRsZXIuY3JlYXRlSW5mbyAmJiBhc3NldEhhbmRsZXIuY3JlYXRlSW5mby5jcmVhdGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIOS8mOWFiOS9v+eUqOiHquWumuS5ieeahOWIm+W7uuaWueazle+8jOiLpeWIm+W7uue7k+aenOS4jeWtmOWcqOWImei1sOm7mOiupOeahOWIm+W7uua1geeoi1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXNzZXRIYW5kbGVyLmNyZWF0ZUluZm8uY3JlYXRlKG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgYWZ0ZXJDcmVhdGVBc3NldChyZXN1bHQsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMuY29udGVudCA9PT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMuY29udGVudCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpznu5nlrprkuobmqKHmnb/kv6Hmga/vvIzkvb/nlKggZGIg6buY6K6k55qE5Yib5bu65ou36LSd5pa55byPXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRoID0gdXJsMnBhdGgob3B0aW9ucy50ZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXhpc3RzU3luYyhwYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGNvcHkocGF0aCwgb3B0aW9ucy50YXJnZXQsIHsgb3ZlcndyaXRlOiBvcHRpb25zLm92ZXJ3cml0ZSB9KTtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBhZnRlckNyZWF0ZUFzc2V0KG9wdGlvbnMudGFyZ2V0LCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy50YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gY29udGVudCDkuI3lrZjlnKjvvIzmlrDlu7rkuIDkuKrmlofku7blpLlcclxuICAgICAgICAgICAgYXdhaXQgZW5zdXJlRGlyKG9wdGlvbnMudGFyZ2V0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuY29udGVudCA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMuY29udGVudCA9IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuY29udGVudCwgbnVsbCwgNCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gTm9ybWFsaXplIEVPTCBmb3Igc3RyaW5nIGNvbnRlbnRcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmNvbnRlbnQgPT09ICdzdHJpbmcnICYmIG9wdGlvbnMuaGFuZGxlciA9PT0gJ3RleHQnKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmNvbnRlbnQgPSBlb2wuYXV0byhvcHRpb25zLmNvbnRlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOmDqOWIhuiHquWumuS5ieWIm+W7uui1hOa6kOayoeacieaooeadv++8jOWGheWuueS4uuepuu+8jOWPqumcgOimgeS4gOS4quepuuaWh+S7tuWNs+WPr+WujOaIkOWIm+W7ulxyXG4gICAgICAgICAgICBhd2FpdCBvdXRwdXRGaWxlKG9wdGlvbnMudGFyZ2V0LCBvcHRpb25zLmNvbnRlbnQsICd1dGY4Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IGFmdGVyQ3JlYXRlQXNzZXQob3B0aW9ucy50YXJnZXQsIG9wdGlvbnMpO1xyXG4gICAgICAgIHJldHVybiBvcHRpb25zLnRhcmdldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiwg+eUqOiHquWumuS5ieeahOmUgOavgei1hOa6kOa1geeoi1xyXG4gICAgICogQHBhcmFtIGFzc2V0IFxyXG4gICAgICogQHJldHVybnMgXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGRlc3Ryb3lBc3NldChhc3NldDogSUFzc2V0KSB7XHJcbiAgICAgICAgY29uc3QgYXNzZXRIYW5kbGVyID0gdGhpcy5uYW1lMmhhbmRsZXJbYXNzZXQubWV0YS5pbXBvcnRlcl07XHJcbiAgICAgICAgaWYgKGFzc2V0SGFuZGxlciAmJiBhc3NldEhhbmRsZXIuZGVzdHJveSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgYXNzZXRIYW5kbGVyLmRlc3Ryb3koYXNzZXQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBzYXZlQXNzZXQoYXNzZXQ6IElBc3NldCwgY29udGVudDogc3RyaW5nIHwgQnVmZmVyKSB7XHJcbiAgICAgICAgY29uc3QgYXNzZXRIYW5kbGVyID0gdGhpcy5uYW1lMmhhbmRsZXJbYXNzZXQubWV0YS5pbXBvcnRlcl07XHJcbiAgICAgICAgaWYgKGFzc2V0SGFuZGxlciAmJiBhc3NldEhhbmRsZXIuY3JlYXRlSW5mbyAmJiBhc3NldEhhbmRsZXIuY3JlYXRlSW5mby5zYXZlKSB7XHJcbiAgICAgICAgICAgIC8vIOS8mOWFiOS9v+eUqOiHquWumuS5ieeahOS/neWtmOaWueazlVxyXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgYXNzZXRIYW5kbGVyLmNyZWF0ZUluZm8uc2F2ZShhc3NldCwgY29udGVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIE5vcm1hbGl6ZSBFT0wgZm9yIHN0cmluZyBjb250ZW50XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJyAmJiBhc3NldC5tZXRhLmltcG9ydGVyID09PSAndGV4dCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IGVvbC5hdXRvKGNvbnRlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhd2FpdCBvdXRwdXRGaWxlKGFzc2V0LnNvdXJjZSwgY29udGVudCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2VuZXJhdGVUaHVtYm5haWwoYXNzZXQ6IElBc3NldCwgc2l6ZTogbnVtYmVyIHwgVGh1bWJuYWlsU2l6ZSA9ICdsYXJnZScpOiBQcm9taXNlPFRodW1ibmFpbEluZm8gfCBudWxsPiB7XHJcbiAgICAgICAgaWYgKCFhc3NldCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOaXoOaViOi1hOa6kOmcgOimgeetieW+hemHjeaWsOWvvOWFpVxyXG4gICAgICAgIGlmIChhc3NldC5pbnZhbGlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnaWNvbicsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ2ZpbGUnLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY29uZmlnTWFwID0gYXdhaXQgdGhpcy5xdWVyeUljb25Db25maWdNYXAoKTtcclxuICAgICAgICBpZiAoIWNvbmZpZ01hcFthc3NldC5tZXRhLmltcG9ydGVyXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNhY2hlRGVzdCA9IGpvaW4oYXNzZXQudGVtcCwgYHRodW1ibmFpbC0ke3NpemV9LnBuZ2ApO1xyXG4gICAgICAgIGlmIChleGlzdHNTeW5jKGNhY2hlRGVzdCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogY2FjaGVEZXN0LFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZGF0YTogVGh1bWJuYWlsSW5mbztcclxuICAgICAgICBpZiAoIWNvbmZpZ01hcFthc3NldC5tZXRhLmltcG9ydGVyXS50aHVtYm5haWwpIHtcclxuICAgICAgICAgICAgZGF0YSA9IGNvbmZpZ01hcFthc3NldC5tZXRhLmltcG9ydGVyXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBhc3NldEhhbmRsZXIgPSB0aGlzLm5hbWUyaGFuZGxlclthc3NldC5tZXRhLmltcG9ydGVyXTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBhd2FpdCBhc3NldEhhbmRsZXIuaWNvbkluZm8hLmdlbmVyYXRlVGh1bWJuYWlsIShhc3NldCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBnZW5lcmF0ZVRodW1ibmFpbCBmYWlsZWQgZm9yICR7YXNzZXQudXJsfWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhdGEudHlwZSA9PT0gJ2ltYWdlJykge1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlID0gaXNBYnNvbHV0ZShkYXRhLnZhbHVlKSA/IGRhdGEudmFsdWUgOiB1cmwycGF0aChkYXRhLnZhbHVlKTtcclxuICAgICAgICAgICAgLy8gU1ZHIOaXoOmcgCByZXNpemVcclxuICAgICAgICAgICAgaWYgKGZpbGUuZW5kc1dpdGgoJy5zdmcnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFleGlzdHNTeW5jKGZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZGF0YS52YWx1ZSA9IGF3YWl0IHJlc2l6ZVRodW1ibmFpbChmaWxlLCBjYWNoZURlc3QsIHNpemUpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgcmVzaXplVGh1bWJuYWlsIGZhaWxlZCBmb3IgJHthc3NldC51cmx9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnlJ/miJDmn5DkuKrotYTmupDnmoTlr7zlh7rmlofku7bkv6Hmga9cclxuICAgICAqIEBwYXJhbSBhc3NldCBcclxuICAgICAqIEBwYXJhbSBvcHRpb25zIFxyXG4gICAgICogQHJldHVybnMgXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGdlbmVyYXRlRXhwb3J0RGF0YShhc3NldDogSUFzc2V0LCBvcHRpb25zPzogSUV4cG9ydE9wdGlvbnMpOiBQcm9taXNlPElFeHBvcnREYXRhIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGFzc2V0SGFuZGxlciA9IHRoaXMubmFtZTJoYW5kbGVyW2Fzc2V0Lm1ldGEuaW1wb3J0ZXJdO1xyXG4gICAgICAgIGlmICghYXNzZXRIYW5kbGVyIHx8ICFhc3NldEhhbmRsZXIuZXhwb3J0ZXIgfHwgIWFzc2V0SGFuZGxlci5leHBvcnRlci5nZW5lcmF0ZUV4cG9ydERhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYXdhaXQgYXNzZXRIYW5kbGVyLmV4cG9ydGVyLmdlbmVyYXRlRXhwb3J0RGF0YShhc3NldCwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmi7fotJ3nlJ/miJDlr7zlhaXmlofku7bliLDmnIDnu4jnm67moIflnLDlnYBcclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxyXG4gICAgICogQHBhcmFtIHNyYyBcclxuICAgICAqIEBwYXJhbSBkZXN0IFxyXG4gICAgICogQHJldHVybnMgXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIG91dHB1dEV4cG9ydERhdGEoaGFuZGxlcjogc3RyaW5nLCBzcmM6IElFeHBvcnREYXRhLCBkZXN0OiBJRXhwb3J0RGF0YSk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIGNvbnN0IGFzc2V0SGFuZGxlciA9IHRoaXMubmFtZTJoYW5kbGVyW2hhbmRsZXJdO1xyXG4gICAgICAgIGlmICghYXNzZXRIYW5kbGVyIHx8ICFhc3NldEhhbmRsZXIuZXhwb3J0ZXIgfHwgIWFzc2V0SGFuZGxlci5leHBvcnRlci5vdXRwdXRFeHBvcnREYXRhKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBhd2FpdCBhc3NldEhhbmRsZXIuZXhwb3J0ZXIub3V0cHV0RXhwb3J0RGF0YShzcmMsIGRlc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5p+l6K+i5ZCE5Liq6LWE5rqQ55qE5Z+65pys6YWN572uIE1BUFxyXG4gICAgICovXHJcbiAgICBhc3luYyBxdWVyeUFzc2V0Q29uZmlnTWFwKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgSUFzc2V0Q29uZmlnPj4ge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgSUFzc2V0Q29uZmlnPiA9IHt9O1xyXG4gICAgICAgIGZvciAoY29uc3QgaW1wb3J0ZXIgb2YgT2JqZWN0LmtleXModGhpcy5uYW1lMmhhbmRsZXIpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLm5hbWUyaGFuZGxlcltpbXBvcnRlcl07XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZzogSUFzc2V0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IGhhbmRsZXIuZGlzcGxheU5hbWUsXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogaGFuZGxlci5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgIGRvY1VSTDogaGFuZGxlci5kb2NVUkwsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChoYW5kbGVyLmljb25JbmZvKSB7XHJcbiAgICAgICAgICAgICAgICBjb25maWcuaWNvbkluZm8gPSBoYW5kbGVyLmljb25JbmZvLmRlZmF1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChoYW5kbGVyLnVzZXJEYXRhQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25maWcudXNlckRhdGFDb25maWcgPSBoYW5kbGVyLnVzZXJEYXRhQ29uZmlnLmRlZmF1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0W2ltcG9ydGVyXSA9IGNvbmZpZztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBxdWVyeVVzZXJEYXRhQ29uZmlnKGFzc2V0OiBJQXNzZXQpIHtcclxuICAgICAgICBpZiAoIWFzc2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYXNzZXRIYW5kbGVyID0gdGhpcy5uYW1lMmhhbmRsZXJbYXNzZXQubWV0YS5pbXBvcnRlcl07XHJcbiAgICAgICAgaWYgKCFhc3NldEhhbmRsZXIgfHwgIWFzc2V0SGFuZGxlci51c2VyRGF0YUNvbmZpZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWFzc2V0SGFuZGxlci51c2VyRGF0YUNvbmZpZy5nZW5lcmF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXNzZXRIYW5kbGVyLnVzZXJEYXRhQ29uZmlnLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYXdhaXQgYXNzZXRIYW5kbGVyLnVzZXJEYXRhQ29uZmlnLmdlbmVyYXRlKGFzc2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBxdWVyeVVzZXJEYXRhQ29uZmlnRGVmYXVsdChpbXBvcnRlcjogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgYXNzZXRIYW5kbGVyID0gdGhpcy5uYW1lMmhhbmRsZXJbaW1wb3J0ZXJdO1xyXG4gICAgICAgIGlmICghYXNzZXRIYW5kbGVyIHx8ICFhc3NldEhhbmRsZXIudXNlckRhdGFDb25maWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYXNzZXRIYW5kbGVyLnVzZXJEYXRhQ29uZmlnLmRlZmF1bHQ7XHJcbiAgICB9XHJcbiAgICBhc3luYyBydW5JbXBvcnRlckhvb2soYXNzZXQ6IElBc3NldCwgaG9va05hbWU6ICdiZWZvcmUnIHwgJ2FmdGVyJykge1xyXG4gICAgICAgIGNvbnN0IGFzc2V0SGFuZGxlciA9IHRoaXMubmFtZTJoYW5kbGVyW2Fzc2V0Lm1ldGEuaW1wb3J0ZXJdO1xyXG4gICAgICAgIC8vIDEuIOWFiOaJp+ihjOi1hOa6kOWkhOeQhuWZqOWGheeahOmSqeWtkFxyXG4gICAgICAgIGlmIChhc3NldEhhbmRsZXIgJiYgYXNzZXRIYW5kbGVyLmltcG9ydGVyICYmIHR5cGVvZiAoYXNzZXRIYW5kbGVyLmltcG9ydGVyIGFzIEltcG9ydGVySG9vaylbaG9va05hbWVdID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCAoYXNzZXRIYW5kbGVyLmltcG9ydGVyIGFzIEltcG9ydGVySG9vaylbaG9va05hbWVdIShhc3NldCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHJ1biAke2hvb2tOYW1lfSBob29rIGZhaWxlZCFgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gMi4g5YaN5omn6KGM5omp5bGV5rOo5YaM55qE6ZKp5a2QXHJcbiAgICAgICAgY29uc3QgY3VzdG9tSGFuZGxlcnMgPSB0aGlzLmltcG9ydGVyMmN1c3RvbVthc3NldC5tZXRhLmltcG9ydGVyXTtcclxuICAgICAgICBpZiAoIWN1c3RvbUhhbmRsZXJzIHx8ICFjdXN0b21IYW5kbGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBjdXN0b21IYW5kbGVyIG9mIGN1c3RvbUhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhvb2sgPSBjdXN0b21IYW5kbGVyLmltcG9ydGVyICYmIGN1c3RvbUhhbmRsZXIuaW1wb3J0ZXJbaG9va05hbWVdO1xyXG4gICAgICAgICAgICBpZiAoIWhvb2spIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBob29rKGFzc2V0KTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgcnVuICR7aG9va05hbWV9IGhvb2sgZmFpbGVkIWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9maW5kT3BlcmF0ZUhhbmRsZXIoaW1wb3J0ZXI6IHN0cmluZywgb3BlcmF0ZToga2V5b2YgQXNzZXRIYW5kbGVyKTogQ3VzdG9tSGFuZGxlciB8IEFzc2V0SGFuZGxlciB8IG51bGwge1xyXG4gICAgICAgIGlmICh0aGlzLmltcG9ydGVyMk9wZXJhdGVSZWNvcmRbaW1wb3J0ZXJdICYmIHRoaXMuaW1wb3J0ZXIyT3BlcmF0ZVJlY29yZFtpbXBvcnRlcl1bb3BlcmF0ZV0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW1wb3J0ZXIyT3BlcmF0ZVJlY29yZFtpbXBvcnRlcl1bb3BlcmF0ZV0gYXMgQ3VzdG9tSGFuZGxlcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGFzc2V0SGFuZGxlcjogQ3VzdG9tSGFuZGxlciB8IEFzc2V0SGFuZGxlciB8IHVuZGVmaW5lZCA9IHRoaXMubmFtZTJoYW5kbGVyW2ltcG9ydGVyXTtcclxuICAgICAgICBpZiAoYXNzZXRIYW5kbGVyICYmICEob3BlcmF0ZSBpbiBhc3NldEhhbmRsZXIpICYmIHRoaXMuaW1wb3J0ZXIyY3VzdG9tW2ltcG9ydGVyXSkge1xyXG4gICAgICAgICAgICBhc3NldEhhbmRsZXIgPSB0aGlzLmltcG9ydGVyMmN1c3RvbVtpbXBvcnRlcl0uZmluZCgoaXRlbSkgPT4gb3BlcmF0ZSBpbiBpdGVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghYXNzZXRIYW5kbGVyIHx8ICEoYXNzZXRIYW5kbGVyIGFzIGFueSlbb3BlcmF0ZV0pIHtcclxuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgQ2Fubm90IGZpbmQgdGhlIGFzc2V0IGhhbmRsZXIgb2Ygb3BlcmF0ZSAke29wZXJhdGV9IGZvciBpbXBvcnRlciAke2ltcG9ydGVyfWApO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLmltcG9ydGVyMk9wZXJhdGVSZWNvcmRbaW1wb3J0ZXJdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW1wb3J0ZXIyT3BlcmF0ZVJlY29yZFtpbXBvcnRlcl0gPSB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5pbXBvcnRlcjJPcGVyYXRlUmVjb3JkW2ltcG9ydGVyXVtvcGVyYXRlXSA9IGFzc2V0SGFuZGxlcjtcclxuXHJcbiAgICAgICAgcmV0dXJuIGFzc2V0SGFuZGxlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcXVlcnlBbGxJbXBvcnRlcigpIHtcclxuICAgICAgICBsZXQgaW1wb3J0ZXJBcnIgPSBPYmplY3Qua2V5cyh0aGlzLm5hbWUyaGFuZGxlcik7XHJcbiAgICAgICAgLy8g5YW85a655pen54mI5pys55qE6LWE5rqQ5a+85YWl5ZmoXHJcbiAgICAgICAgY29uc3QgaW50ZXJuYWxEQiA9IGdldCgnaW50ZXJuYWwnKTtcclxuICAgICAgICBjb25zdCBuYW1lMmltcG9ydGVyID0gaW50ZXJuYWxEQi5pbXBvcnRlck1hbmFnZXIubmFtZTJpbXBvcnRlcjtcclxuICAgICAgICBpZiAoT2JqZWN0LmtleXMobmFtZTJpbXBvcnRlcikubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGltcG9ydGVyQXJyLnB1c2goLi4uT2JqZWN0LmtleXMoaW50ZXJuYWxEQi5pbXBvcnRlck1hbmFnZXIubmFtZTJpbXBvcnRlcikpO1xyXG4gICAgICAgICAgICBpbXBvcnRlckFyciA9IEFycmF5LmZyb20obmV3IFNldChpbXBvcnRlckFycikpO1xyXG4gICAgICAgICAgICAvLyDlhbzlrrnml6fniYjmnKznmoTljYfnuqfmj5DnpLpcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCd0aGUgaW1wb3J0ZXIgdmVyc2lvbiBuZWVkIHRvIHVwZ3JhZGUuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbXBvcnRlckFyci5zb3J0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHF1ZXJ5QWxsQXNzZXRUeXBlcygpIHtcclxuICAgICAgICBjb25zdCBhc3NldFR5cGVzID0gbmV3IFNldCgpO1xyXG4gICAgICAgIE9iamVjdC52YWx1ZXModGhpcy5uYW1lMmhhbmRsZXIpLmZvckVhY2goKGhhbmRsZXIpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgeyBhc3NldFR5cGUgfSA9IGhhbmRsZXI7XHJcbiAgICAgICAgICAgIGFzc2V0VHlwZSAmJiBhc3NldFR5cGVzLmFkZChhc3NldFR5cGUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyDlhbzlrrnml6fniYjmnKznmoTotYTmupDlr7zlhaXlmahcclxuICAgICAgICBjb25zdCBpbnRlcm5hbERCID0gZ2V0KCdpbnRlcm5hbCcpO1xyXG4gICAgICAgIGNvbnN0IG5hbWUyaW1wb3J0ZXIgPSBpbnRlcm5hbERCLmltcG9ydGVyTWFuYWdlci5uYW1lMmltcG9ydGVyO1xyXG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhuYW1lMmltcG9ydGVyKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBpbXBvcnRlciBpbiBuYW1lMmltcG9ydGVyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW1wb3J0ZXIgPT09ICcqJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBhc3NldFR5cGUgfSA9IG5hbWUyaW1wb3J0ZXJbaW1wb3J0ZXJdIGFzIGFueTtcclxuICAgICAgICAgICAgICAgIGFzc2V0VHlwZSAmJiBhc3NldFR5cGVzLmFkZChhc3NldFR5cGUpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGB0aGUgaW1wb3J0ZXIke2ltcG9ydGVyfSB2ZXJzaW9uIG5lZWQgdG8gdXBncmFkZS5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyDlhbzlrrnml6fniYjmnKznmoTljYfnuqfmj5DnpLpcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGFzc2V0VHlwZXMpLnNvcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsOm7mOiupOmFjee9ruaVsOaNruW5tuS/neWtmO+8iOWBj+Wlveiuvue9rueahOeUqOaIt+aTjeS9nOS/ruaUueWFpeWPo++8iVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgdXBkYXRlRGVmYXVsdFVzZXJEYXRhKGhhbmRsZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBsb2Rhc2guc2V0KHRoaXMuX3VzZXJEYXRhQ2FjaGUsIGAke2hhbmRsZXJ9LiR7a2V5fWAsIHZhbHVlKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVEZWZhdWx0VXNlckRhdGFUb0hhbmRsZXIoaGFuZGxlciwga2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgY29uc3QgY29tYmluZVVzZXJEYXRhID0ge1xyXG4gICAgICAgICAgICAuLi4odGhpcy5fZGVmYXVsdFVzZXJEYXRhW2hhbmRsZXJdIHx8IHt9KSxcclxuICAgICAgICAgICAgLi4udGhpcy5fdXNlckRhdGFDYWNoZVtoYW5kbGVyXSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNldERlZmF1bHRVc2VyRGF0YShoYW5kbGVyLCBjb21iaW5lVXNlckRhdGEpO1xyXG5cclxuICAgICAgICBjb25zdCBkZWZhdWx0TWV0YVBhdGggPSBqb2luKGFzc2V0Q29uZmlnLmRhdGEucm9vdCwgJy5jcmVhdG9yJywgJ2RlZmF1bHQtbWV0YS5qc29uJyk7XHJcbiAgICAgICAgYXdhaXQgb3V0cHV0SlNPTihkZWZhdWx0TWV0YVBhdGgsIHRoaXMuX3VzZXJEYXRhQ2FjaGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pu05paw5a+85YWl6buY6K6k5YC85Yiw5a+85YWl5Zmo55qE5riy5p+T6YWN572u5YaF6YOoXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBcclxuICAgICAqIEBwYXJhbSBrZXkgXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3VwZGF0ZURlZmF1bHRVc2VyRGF0YVRvSGFuZGxlcihoYW5kbGVyOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgY29uc3QgYXNzZXRIYW5kbGVyID0gdGhpcy5uYW1lMmhhbmRsZXJbaGFuZGxlcl07XHJcbiAgICAgICAgLy8g6LCD5pW05bey5pyJ6YWN572u5YaF55qE6buY6K6k5YC8XHJcbiAgICAgICAgaWYgKGFzc2V0SGFuZGxlciAmJiBhc3NldEhhbmRsZXIudXNlckRhdGFDb25maWcgJiYgYXNzZXRIYW5kbGVyLnVzZXJEYXRhQ29uZmlnLmRlZmF1bHRba2V5XSkge1xyXG4gICAgICAgICAgICBhc3NldEhhbmRsZXIudXNlckRhdGFDb25maWcuZGVmYXVsdFtrZXldLmRlZmF1bHQgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5jb25zdCBhc3NldEhhbmRsZXJNYW5hZ2VyID0gbmV3IEFzc2V0SGFuZGxlck1hbmFnZXIoKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFzc2V0SGFuZGxlck1hbmFnZXI7XHJcblxyXG5mdW5jdGlvbiBwYXRjaEhhbmRsZXIoaW5mbzogSUNyZWF0ZU1lbnVJbmZvLCBoYW5kbGVyOiBzdHJpbmcsIGV4dGVuc2lvbnM6IHN0cmluZ1tdKSB7XHJcbiAgICAvLyDpgb/lhY3msaHmn5Pljp/lp4sgaW5mbyDmlbDmja5cclxuICAgIGNvbnN0IHJlcyA9IHtcclxuICAgICAgICBoYW5kbGVyLFxyXG4gICAgICAgIC4uLmluZm8sXHJcbiAgICB9O1xyXG4gICAgaWYgKHJlcy5zdWJtZW51KSB7XHJcbiAgICAgICAgcmVzLnN1Ym1lbnUgPSByZXMuc3VibWVudS5tYXAoKHN1YkluZm8pID0+IHBhdGNoSGFuZGxlcihzdWJJbmZvLCBoYW5kbGVyLCBleHRlbnNpb25zKSk7XHJcbiAgICB9XHJcbiAgICBpZiAocmVzLnRlbXBsYXRlICYmICFyZXMuZnVsbEZpbGVOYW1lKSB7XHJcbiAgICAgICAgcmVzLmZ1bGxGaWxlTmFtZSA9IGJhc2VuYW1lKHJlcy50ZW1wbGF0ZSk7XHJcbiAgICAgICAgaWYgKCFleHRuYW1lKHJlcy5mdWxsRmlsZU5hbWUpKSB7XHJcbiAgICAgICAgICAgIC8vIOaUr+aMgeaXoOWQjue8gOeahOaooeadv+aWh+S7tu+8jOS4u+imgeWFvOWuuSAzLjguMiDniYjmnKzkuYvliY3nmoTohJrmnKzmqKHmnb9cclxuICAgICAgICAgICAgcmVzLmZ1bGxGaWxlTmFtZSArPSBleHRlbnNpb25zWzBdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXM7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHF1ZXJ5VXNlclRlbXBsYXRlcyh0ZW1wbGF0ZURpcjogc3RyaW5nKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGlmIChleGlzdHNTeW5jKHRlbXBsYXRlRGlyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGZnKFsnKiovKicsICchKi5tZXRhJ10sIHtcclxuICAgICAgICAgICAgICAgIG9ubHlGaWxlczogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGN3ZDogdGVtcGxhdGVEaXIsXHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihlcnJvcik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gW107XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFVzZXJUZW1wbGF0ZURpcihpbXBvcnRlcjogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gam9pbihBc3NldEhhbmRsZXJNYW5hZ2VyLmNyZWF0ZVRlbXBsYXRlUm9vdCwgaW1wb3J0ZXIpO1xyXG59XHJcblxyXG5jb25zdCBTaXplTWFwID0ge1xyXG4gICAgbGFyZ2U6IDUxMixcclxuICAgIHNtYWxsOiAxNixcclxuICAgIG1pZGRsZTogMTI4LFxyXG59O1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVzaXplVGh1bWJuYWlsKHNyYzogc3RyaW5nLCBkZXN0OiBzdHJpbmcsIHNpemU6IG51bWJlciB8IFRodW1ibmFpbFNpemUpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgaWYgKHNpemUgPT09ICdvcmlnaW4nKSB7XHJcbiAgICAgICAgcmV0dXJuIHNyYztcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2Ygc2l6ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICBzaXplID0gU2l6ZU1hcFtzaXplXSB8fCAxNjtcclxuICAgIH1cclxuICAgIGF3YWl0IGVuc3VyZURpcihkaXJuYW1lKGRlc3QpKTtcclxuICAgIGNvbnN0IGltZyA9IFNoYXJwKHNyYyk7XHJcbiAgICBjb25zdCB3aWR0aCA9IChhd2FpdCBpbWcubWV0YWRhdGEoKSkud2lkdGg7XHJcbiAgICAvLyDlpoLmnpzlm77niYflsLrlr7jlsI/kuo7nvKnnlaXlm77lsLrlr7jvvIzliJnnm7TmjqXmi7fotJ1cclxuICAgIGlmICh3aWR0aCAmJiB3aWR0aCA8PSBzaXplKSB7XHJcbiAgICAgICAgYXdhaXQgY29weUZpbGUoc3JjLCBkZXN0KTtcclxuICAgICAgICByZXR1cm4gZGVzdDtcclxuICAgIH1cclxuICAgIGF3YWl0IGltZy5yZXNpemUoc2l6ZSkudG9GaWxlKGRlc3QpO1xyXG4gICAgcmV0dXJuIGRlc3Q7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGFmdGVyQ3JlYXRlQXNzZXQocGF0aHM6IHN0cmluZyB8IHN0cmluZ1tdLCBvcHRpb25zOiBDcmVhdGVBc3NldE9wdGlvbnMpIHtcclxuICAgIGlmICghQXJyYXkuaXNBcnJheShwYXRocykpIHtcclxuICAgICAgICBwYXRocyA9IFtwYXRoc107XHJcbiAgICB9XHJcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgcGF0aHMpIHtcclxuICAgICAgICAvLyDmlofku7bkuI3lrZjlnKjvvIxub2RlanMg5rKh5pyJ5oiQ5Yqf5Yib5bu65paH5Lu2XHJcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGZpbGUpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtpMThuLnQoJ2Fzc2V0cy5jcmVhdGVfYXNzZXQuZmFpbC5kcm9wJywge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBmaWxlLFxyXG4gICAgICAgICAgICB9KX1gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOagueaNrumAiemhuemFjee9riBtZXRhIOaooeadv+aWh+S7tlxyXG4gICAgICAgIGlmIChvcHRpb25zLnVzZXJEYXRhIHx8IG9wdGlvbnMudXVpZCkge1xyXG4gICAgICAgICAgICBjb25zdCBtZXRhOiBhbnkgPSB7XHJcbiAgICAgICAgICAgICAgICB1c2VyRGF0YTogb3B0aW9ucy51c2VyRGF0YSB8fCB7fSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudXVpZCkge1xyXG4gICAgICAgICAgICAgICAgbWV0YS51dWlkID0gb3B0aW9ucy51dWlkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGF3YWl0IG91dHB1dEpTT04oam9pbihmaWxlICsgJy5tZXRhJyksIG1ldGEsIHtcclxuICAgICAgICAgICAgICAgIHNwYWNlczogNCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==