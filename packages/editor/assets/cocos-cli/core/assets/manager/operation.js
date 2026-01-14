"use strict";
/**
 * 资源操作类，会调用 assetManager/assetDB/assetHandler 等模块
 */
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
exports.assetOperation = void 0;
exports.moveFile = moveFile;
const asset_db_1 = require("@cocos/asset-db");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const asset_config_1 = __importDefault(require("../asset-config"));
const utils_1 = require("../utils");
const asset_db_2 = __importDefault(require("./asset-db"));
const asset_handler_1 = __importDefault(require("./asset-handler"));
const i18n_1 = __importDefault(require("../../base/i18n"));
const query_1 = __importDefault(require("./query"));
const utils_2 = __importDefault(require("../../base/utils"));
const events_1 = __importDefault(require("events"));
const utils_3 = require("../asset-handler/utils");
const lodash = __importStar(require("lodash"));
class AssetOperation extends events_1.default {
    /**
     * 检查一个资源文件夹是否为只读
     */
    _checkReadonly(asset) {
        if (asset._assetDB.options.readonly) {
            throw new Error(`${i18n_1.default.t('assets.operation.readonly')} \n  url: ${asset.url}`);
        }
    }
    _checkExists(path) {
        if (!(0, fs_extra_1.existsSync)(path)) {
            throw new Error(`file ${path} not exists`);
        }
    }
    /**
     * 检查是否存在文件，如果存在则根据选项决定是否覆盖或重命名
     * @param path
     * @param option
     * @returns 返回新的文件路径
     */
    _checkOverwrite(path, option) {
        if ((0, fs_extra_1.existsSync)(path) && !option?.overwrite) {
            if (option?.rename) {
                return utils_2.default.File.getName(path);
            }
            throw new Error(`file ${path} already exists, please use overwrite option to overwrite it or use rename option to auto rename it first.`);
        }
        return path;
    }
    async saveAssetMeta(uuid, meta, asset) {
        // 不能为数组
        if (typeof meta !== 'object'
            || Array.isArray(meta)) {
            throw new Error(`Save meta failed(${uuid}): The meta must be an Object string`);
        }
        asset = asset || query_1.default.queryAsset(uuid);
        (0, utils_3.mergeMeta)(asset.meta, meta);
        await asset.save(); // 这里才是将数据保存到 .meta 文件
        await asset._assetDB.reimport(asset.uuid);
    }
    async updateUserData(uuidOrURLOrPath, path, value) {
        const asset = query_1.default.queryAsset(uuidOrURLOrPath);
        if (!asset) {
            console.error(`can not find asset ${uuidOrURLOrPath}`);
            return;
        }
        lodash.set(asset?.meta.userData, path, value);
        await asset.save();
        return asset?.meta.userData;
    }
    async saveAsset(uuidOrURLOrPath, content) {
        const asset = query_1.default.queryAsset(uuidOrURLOrPath);
        if (!asset) {
            throw new Error(`${i18n_1.default.t('assets.save_asset.fail.asset')}`);
        }
        if (asset._assetDB.options.readonly) {
            throw new Error(`${i18n_1.default.t('assets.operation.readonly')} \n  url: ${asset.url}`);
        }
        if (content === undefined) {
            throw new Error(`${i18n_1.default.t('assets.save_asset.fail.content')}`);
        }
        if (!asset.source) {
            // 不存在源文件的资源无法保存
            throw new Error(`${i18n_1.default.t('assets.save_asset.fail.uuid')}`);
        }
        const res = await asset_handler_1.default.saveAsset(asset, content);
        if (res) {
            await asset._assetDB.reimport(asset.uuid);
        }
        if (asset && (!asset.imported || asset.invalid)) {
            throw asset.importError || new Error(`Save asset ${asset.source} failed`);
        }
        return query_1.default.encodeAsset(asset);
    }
    checkValidUrl(urlOrPath) {
        if (!urlOrPath.startsWith('db://')) {
            urlOrPath = query_1.default.queryUrl(urlOrPath);
            if (!urlOrPath) {
                throw new Error(`${i18n_1.default.t('assets.operation.invalid_url')} \n  url: ${urlOrPath}`);
            }
        }
        const dbName = urlOrPath.split('/').filter(Boolean)[1];
        const dbInfo = asset_db_2.default.assetDBInfo[dbName];
        if (!dbInfo || dbInfo.readonly) {
            throw new Error(`${i18n_1.default.t('assets.operation.readonly')} \n  url: ${urlOrPath}`);
        }
        return true;
    }
    async createAsset(options) {
        if (!options.target || typeof options.target !== 'string') {
            throw new Error(`Cannot create asset because options.target is required.`);
        }
        // 判断目标路径是否为只读
        this.checkValidUrl(options.target);
        if (!(0, path_1.isAbsolute)(options.target)) {
            options.target = (0, utils_1.url2path)(options.target);
        }
        options.target = this._checkOverwrite(options.target, options);
        const assetPath = await asset_handler_1.default.createAsset(options);
        await this.refreshAsset(assetPath);
        const asset = query_1.default.queryAsset(assetPath);
        if (!asset) {
            throw new Error(`Create asset in ${options.target} failed`);
        }
        if (asset && (!asset.imported || asset.invalid)) {
            throw asset.importError || new Error(`Create asset in ${options.target} failed`);
        }
        return query_1.default.encodeAsset(asset);
    }
    /**
     * 根据类型创建资源
     * @param type
     * @param dirOrUrl 目标目录
     * @param baseName 基础名称
     * @param options
     * @returns
     */
    async createAssetByType(type, dirOrUrl, baseName, options) {
        const createMenus = await asset_handler_1.default.getCreateMenuByName(type);
        if (!createMenus.length) {
            throw new Error(`Can not support create type: ${type}`);
        }
        let dir = dirOrUrl;
        if (dirOrUrl.startsWith('db://')) {
            dir = (0, utils_1.url2path)(dirOrUrl);
        }
        let createInfo = createMenus[0];
        if (createMenus.length > 1 && options?.templateName) {
            createInfo = createMenus.find((menu) => menu.name === options.templateName);
            if (!createInfo) {
                throw new Error(`Can not find template: ${options.templateName}`);
            }
        }
        const extName = (0, path_1.extname)(createInfo.fullFileName);
        const target = (0, path_1.join)(dir, baseName + extName);
        return await this.createAsset({
            handler: createInfo.handler,
            target,
            overwrite: options?.overwrite ?? false,
            template: createInfo.template,
            content: options?.content,
        });
    }
    /**
     * 从项目外拷贝导入资源进来
     * @param source
     * @param target
     * @param options
     */
    async importAsset(source, target, options) {
        if (target.startsWith('db://')) {
            target = (0, utils_1.url2path)(target);
        }
        await (0, fs_extra_1.copy)(source, target, options);
        await this.refreshAsset(target);
        const assetInfo = query_1.default.queryAssetInfo(target);
        if (!assetInfo) {
            return [];
        }
        if (!assetInfo.isDirectory) {
            return [assetInfo];
        }
        return query_1.default.queryAssetInfos({
            pattern: `${assetInfo.url}/**/*`
        });
    }
    /**
     * 生成导出数据接口，主要用于：预览、构建阶段
     * @param asset
     * @param options
     * @returns
     */
    async generateExportData(asset, options) {
        // 3.8.3 以上版本，资源导入后的数据将会记录在 asset.outputData 字段内部
        let outputData = asset.getData('output');
        if (outputData && !options) {
            return outputData;
        }
        // 1.优先调用资源处理器内的导出逻辑
        // 需要注意，由于有类似的用法，因而 assetManager 只能在构建阶段使用，无法在给资源处理器内调用
        const data = await asset_handler_1.default.generateExportData(asset, options);
        if (data) {
            return data;
        }
        // 2. 默认的导出流程
        // 2.1 无序列化数据的，视为引擎运行时无法支持的资源，不导出
        if (!asset.meta.files.includes('.json') && !asset.meta.files.includes('.cconb')) {
            return null;
        }
        outputData = (0, utils_1.ensureOutputData)(asset);
        // 2.2 无具体的导出选项或者导出信息内不包含序列化数据，则使用默认的导出信息即可
        if (!options || !outputData.native) {
            return outputData;
        }
        // 2.3 TODO 根据不同的 options 条件生成不同的序列化结果
        // const cachePath = assetOutputPathCache.query(asset.uuid, options);
        // if (!cachePath) {
        //     const assetData = await serializeCompiled(asset, options);
        //     await outputFile(outputData.import.path, assetData);
        //     await assetOutputPathCache.add(asset, options, outputData.import.path);
        // } else {
        //     outputData.import.path = cachePath;
        // }
        // asset.setData('output', outputData);
        return outputData;
    }
    /**
     * 拷贝生成导入文件到最终目标地址，主要用于：构建阶段
     * @param handler
     * @param src
     * @param dest
     * @returns
     */
    async outputExportData(handler, src, dest) {
        const res = await asset_handler_1.default.outputExportData(handler, src, dest);
        if (!res) {
            await (0, fs_extra_1.copy)(src.import.path, dest.import.path);
            if (src.native && dest.native) {
                const nativeSrc = Object.values(src.native);
                const nativeDest = Object.values(dest.native);
                await Promise.all(nativeSrc.map((path, i) => (0, fs_extra_1.copy)(path, nativeDest[i])));
            }
        }
    }
    /**
     * 刷新某个资源或是资源目录
     * @param pathOrUrlOrUUID
     * @returns boolean
     */
    async refreshAsset(pathOrUrlOrUUID) {
        // 将实际的刷新任务塞到 db 管理器的队列内等待执行
        return await asset_db_2.default.addTask(this._refreshAsset.bind(this), [pathOrUrlOrUUID]);
    }
    async _refreshAsset(pathOrUrlOrUUID, autoRefreshDir = true) {
        const result = await (0, asset_db_1.refresh)(pathOrUrlOrUUID);
        if (result === undefined) {
            throw new Error(`can not find asset ${pathOrUrlOrUUID}`);
        }
        if (autoRefreshDir) {
            // HACK 某些情况下导入原始资源后，文件夹的 mtime 会发生变化，导致资源量大的情况下下次获得焦点自动刷新时会有第二次的文件夹大批量刷新
            // 用进入队列的方式才能保障 pause 等机制不会被影响
            await asset_db_2.default.addTask(asset_db_2.default.autoRefreshAssetLazy.bind(asset_db_2.default), [(0, path_1.dirname)(pathOrUrlOrUUID)]);
        }
        // this.autoRefreshAssetLazy(dirname(pathOrUrlOrUUID));
        console.debug(`refresh asset ${(0, path_1.dirname)(pathOrUrlOrUUID)} success`);
        return result;
    }
    /**
     * 重新导入某个资源
     * @param pathOrUrlOrUUID
     * @returns
     */
    async reimportAsset(pathOrUrlOrUUID) {
        return await asset_db_2.default.addTask(this._reimportAsset.bind(this), [pathOrUrlOrUUID]);
    }
    async _reimportAsset(pathOrUrlOrUUID) {
        // 底层的 reimport 不支持子资源的 url 改为使用 uuid 重新导入
        if (pathOrUrlOrUUID.startsWith('db://')) {
            pathOrUrlOrUUID = (0, utils_1.url2uuid)(pathOrUrlOrUUID);
        }
        const asset = await (0, asset_db_1.reimport)(pathOrUrlOrUUID);
        if (!asset) {
            throw new Error(`无法找到资源 ${pathOrUrlOrUUID}, 请检查参数是否正确`);
        }
        if (asset && (!asset.imported || asset.invalid)) {
            throw asset.importError || new Error(`Reimport asset ${asset.source} failed`);
        }
        return query_1.default.encodeAsset(asset);
    }
    /**
     * 移动资源
     * @param source 源文件的 url 或者绝对路径 db://assets/abc.txt
     * @param target 目标 url 或者绝对路径 db://assets/a.txt
     * @param option 导入资源的参数 { overwrite, xxx, rename }
     * @returns {Promise<IAssetInfo | null>}
     */
    async moveAsset(source, target, option) {
        return await asset_db_2.default.addTask(this._moveAsset.bind(this), [source, target, option]);
    }
    async _moveAsset(source, target, option) {
        console.debug(`start move asset from ${source} -> ${target}...`);
        if (target.startsWith('db://')) {
            target = (0, utils_1.url2path)(target);
        }
        const asset = query_1.default.queryAsset(source);
        if (!asset) {
            throw new Error(`asset in source file ${source} not exists`);
        }
        this._checkReadonly(asset);
        source = asset.source;
        target = this._checkOverwrite(target, option);
        await moveFile(source, target, option);
        const url = (0, asset_db_1.queryUrl)(target);
        const reg = /db:\/\/[^/]+/.exec(url);
        // 常规的资源移动：期望只有 change 消息
        if (reg && reg[0] && url.startsWith(reg[0])) {
            await this.refreshAsset(target);
            // 因为文件被移走之后，文件夹的 mtime 会变化，所以要主动刷新一次被移走文件的文件夹
            // 必须在目标位置文件刷新完成后再刷新，如果放到前面，会导致先识别到文件被删除，触发 delete 后再发送 add
            await this.refreshAsset((0, path_1.dirname)(source));
        }
        else {
            // 跨数据库移动资源或者覆盖操作时需要先刷目标文件，触发 delete 后再发送 add
            await this.refreshAsset(source);
            await this.refreshAsset(target);
        }
        console.debug(`move asset from ${source} -> ${target} success`);
    }
    /**
     * 重命名某个资源
     * @param source
     * @param target
     */
    async renameAsset(source, target, option) {
        return await asset_db_2.default.addTask(this._renameAsset.bind(this), [source, target, option]);
    }
    async _renameAsset(source, target, option) {
        console.debug(`start rename asset from ${source} -> ${target}...`);
        const asset = query_1.default.queryAsset(source);
        if (!asset) {
            throw new Error(`asset in source file ${source} not exists`);
        }
        this._checkReadonly(asset);
        source = asset.source;
        this._checkExists(source);
        if (target.startsWith('db://')) {
            target = (0, utils_1.url2path)(target);
        }
        target = this._checkOverwrite(target, option);
        // 源地址不能被目标地址包含，也不能相等
        if (target.startsWith((0, path_1.join)(source, '/'))) {
            throw new Error(`${i18n_1.default.t('assets.rename_asset.fail.parent')} \nsource: ${source}\ntarget: ${target}`);
        }
        const uri = {
            basename: (0, path_1.basename)(target),
            dirname: (0, path_1.dirname)(target),
        };
        const temp = (0, path_1.join)(uri.dirname, '.rename_temp');
        // 改到临时路径，然后刷新，删除原来的缓存
        await (0, fs_extra_1.rename)(source + '.meta', temp + '.meta');
        await (0, fs_extra_1.rename)(source, temp);
        await this._refreshAsset(source, false);
        // 改为真正的路径，然后刷新，用新名字重新导入
        await (0, fs_extra_1.rename)(temp + '.meta', target + '.meta');
        await (0, fs_extra_1.rename)(temp, target);
        await this._refreshAsset(target);
        // TODO 返回资源信息
        console.debug(`rename asset from ${source} -> ${target} success`);
    }
    /**
     * 移除资源
     * @param path
     * @returns
     */
    async removeAsset(uuidOrURLOrPath) {
        const asset = query_1.default.queryAsset(uuidOrURLOrPath);
        if (!asset) {
            throw new Error(`${i18n_1.default.t('assets.delete_asset.fail.unexist')} \nsource: ${uuidOrURLOrPath}`);
        }
        this._checkReadonly(asset);
        if (asset._parent) {
            throw new Error(`子资源无法单独删除，请传递父资源的 URL 地址`);
        }
        const path = asset.source;
        const res = await asset_db_2.default.addTask(this._removeAsset.bind(this), [path]);
        return res ? query_1.default.encodeAsset(asset) : null;
    }
    async _removeAsset(path) {
        let res = false;
        await (0, utils_1.removeFile)(path);
        await this.refreshAsset(path);
        res = true;
        console.debug(`remove asset ${path} success`);
        return res;
    }
}
exports.assetOperation = new AssetOperation();
exports.default = exports.assetOperation;
/**
 * 移动文件
 * @param file
 */
async function moveFile(source, target, options) {
    if (!options || !options.overwrite) {
        options = { overwrite: false }; // fs move 要求实参 options 要有值
    }
    const tempDir = (0, path_1.join)(asset_config_1.default.data.tempRoot, 'move-temp');
    const relativePath = (0, path_1.relative)(asset_config_1.default.data.root, target);
    try {
        if (!utils_2.default.Path.contains(source, target)) {
            await (0, fs_extra_1.move)(source + '.meta', target + '.meta', { overwrite: true }); // meta 先移动
            await (0, fs_extra_1.move)(source, target, options);
            return;
        }
        // assets/scripts/scripts -> assets/scripts 直接操作会报错，需要分次执行
        // 清空临时目录
        await (0, fs_extra_1.remove)((0, path_1.join)(tempDir, relativePath));
        await (0, fs_extra_1.remove)((0, path_1.join)(tempDir, relativePath) + '.meta');
        // 先移动到临时目录
        await (0, fs_extra_1.move)(source + '.meta', (0, path_1.join)(tempDir, relativePath) + '.meta', { overwrite: true }); // meta 先移动
        await (0, fs_extra_1.move)(source, (0, path_1.join)(tempDir, relativePath), { overwrite: true });
        // 再移动到目标目录
        await (0, fs_extra_1.move)((0, path_1.join)(tempDir, relativePath) + '.meta', target + '.meta', { overwrite: true }); // meta 先移动
        await (0, fs_extra_1.move)((0, path_1.join)(tempDir, relativePath), target, options);
    }
    catch (error) {
        console.error(`asset db moveFile from ${source} -> ${target} fail!`);
        console.error(error);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlcmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL21hbmFnZXIvb3BlcmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdWJILDRCQTZCQztBQWxkRCw4Q0FBcUU7QUFDckUsdUNBQWtFO0FBQ2xFLCtCQUE4RTtBQUk5RSxtRUFBMEM7QUFDMUMsb0NBQTRFO0FBQzVFLDBEQUF3QztBQUN4QyxvRUFBa0Q7QUFDbEQsMkRBQW1DO0FBQ25DLG9EQUFpQztBQUNqQyw2REFBcUM7QUFDckMsb0RBQWtDO0FBQ2xDLGtEQUFtRDtBQUNuRCwrQ0FBaUM7QUFFakMsTUFBTSxjQUFlLFNBQVEsZ0JBQVk7SUFFckM7O09BRUc7SUFDSCxjQUFjLENBQUMsS0FBYTtRQUN4QixJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxjQUFJLENBQUMsQ0FBQyxDQUFDLDJCQUEyQixDQUFDLGFBQWEsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDcEYsQ0FBQztJQUNMLENBQUM7SUFFRCxZQUFZLENBQUMsSUFBWTtRQUNyQixJQUFJLENBQUMsSUFBQSxxQkFBVSxFQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLElBQUksYUFBYSxDQUFDLENBQUM7UUFDL0MsQ0FBQztJQUNMLENBQUM7SUFDRDs7Ozs7T0FLRztJQUNILGVBQWUsQ0FBQyxJQUFZLEVBQUUsTUFBNkI7UUFDdkQsSUFBSSxJQUFBLHFCQUFVLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDekMsSUFBSSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUM7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qCBhc3NldE1hbmFnZXIvYXNzZXREQi9hc3NldEhhbmRsZXIg562J5qih5Z2XXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgcmVmcmVzaCwgcmVpbXBvcnQsIHF1ZXJ5VXJsLCBBc3NldCB9IGZyb20gJ0Bjb2Nvcy9hc3NldC1kYic7XHJcbmltcG9ydCB7IGNvcHksIG1vdmUsIHJlbW92ZSwgcmVuYW1lLCBleGlzdHNTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBpc0Fic29sdXRlLCBkaXJuYW1lLCBiYXNlbmFtZSwgam9pbiwgcmVsYXRpdmUsIGV4dG5hbWUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgSU1vdmVPcHRpb25zIH0gZnJvbSAnLi4vQHR5cGVzL3ByaXZhdGUnO1xyXG5pbXBvcnQgeyBJQXNzZXQsIENyZWF0ZUFzc2V0T3B0aW9ucywgSUV4cG9ydE9wdGlvbnMsIElFeHBvcnREYXRhLCBDcmVhdGVBc3NldEJ5VHlwZU9wdGlvbnMsIElDcmVhdGVNZW51SW5mbyB9IGZyb20gJy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBBc3NldE9wZXJhdGlvbk9wdGlvbiwgQXNzZXRVc2VyRGF0YU1hcCwgSUFzc2V0SW5mbywgSUFzc2V0TWV0YSwgSVN1cHBvcnRDcmVhdGVUeXBlIH0gZnJvbSAnLi4vQHR5cGVzL3B1YmxpYyc7XHJcbmltcG9ydCBhc3NldENvbmZpZyBmcm9tICcuLi9hc3NldC1jb25maWcnO1xyXG5pbXBvcnQgeyB1cmwycGF0aCwgZW5zdXJlT3V0cHV0RGF0YSwgdXJsMnV1aWQsIHJlbW92ZUZpbGUgfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCBhc3NldERCTWFuYWdlciBmcm9tICcuL2Fzc2V0LWRiJztcclxuaW1wb3J0IGFzc2V0SGFuZGxlck1hbmFnZXIgZnJvbSAnLi9hc3NldC1oYW5kbGVyJztcclxuaW1wb3J0IGkxOG4gZnJvbSAnLi4vLi4vYmFzZS9pMThuJztcclxuaW1wb3J0IGFzc2V0UXVlcnkgZnJvbSAnLi9xdWVyeSc7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi8uLi9iYXNlL3V0aWxzJztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xyXG5pbXBvcnQgeyBtZXJnZU1ldGEgfSBmcm9tICcuLi9hc3NldC1oYW5kbGVyL3V0aWxzJztcclxuaW1wb3J0ICogYXMgbG9kYXNoIGZyb20gJ2xvZGFzaCc7XHJcblxyXG5jbGFzcyBBc3NldE9wZXJhdGlvbiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6XkuIDkuKrotYTmupDmlofku7blpLnmmK/lkKbkuLrlj6ror7tcclxuICAgICAqL1xyXG4gICAgX2NoZWNrUmVhZG9ubHkoYXNzZXQ6IElBc3NldCkge1xyXG4gICAgICAgIGlmIChhc3NldC5fYXNzZXREQi5vcHRpb25zLnJlYWRvbmx5KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtpMThuLnQoJ2Fzc2V0cy5vcGVyYXRpb24ucmVhZG9ubHknKX0gXFxuICB1cmw6ICR7YXNzZXQudXJsfWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfY2hlY2tFeGlzdHMocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKHBhdGgpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZmlsZSAke3BhdGh9IG5vdCBleGlzdHNgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOajgOafpeaYr+WQpuWtmOWcqOaWh+S7tu+8jOWmguaenOWtmOWcqOWImeagueaNrumAiemhueWGs+WumuaYr+WQpuimhuebluaIlumHjeWRveWQjVxyXG4gICAgICogQHBhcmFtIHBhdGggXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9uIFxyXG4gICAgICogQHJldHVybnMg6L+U5Zue5paw55qE5paH5Lu26Lev5b6EXHJcbiAgICAgKi9cclxuICAgIF9jaGVja092ZXJ3cml0ZShwYXRoOiBzdHJpbmcsIG9wdGlvbj86IEFzc2V0T3BlcmF0aW9uT3B0aW9uKSB7XHJcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMocGF0aCkgJiYgIW9wdGlvbj8ub3ZlcndyaXRlKSB7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb24/LnJlbmFtZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHV0aWxzLkZpbGUuZ2V0TmFtZShwYXRoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGZpbGUgJHtwYXRofSBhbHJlYWR5IGV4aXN0cywgcGxlYXNlIHVzZSBvdmVyd3JpdGUgb3B0aW9uIHRvIG92ZXJ3cml0ZSBpdCBvciB1c2UgcmVuYW1lIG9wdGlvbiB0byBhdXRvIHJlbmFtZSBpdCBmaXJzdC5gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgc2F2ZUFzc2V0TWV0YSh1dWlkOiBzdHJpbmcsIG1ldGE6IElBc3NldE1ldGEsIGFzc2V0PzogSUFzc2V0KSB7XHJcbiAgICAgICAgLy8g5LiN6IO95Li65pWw57uEXHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICB0eXBlb2YgbWV0YSAhPT0gJ29iamVjdCdcclxuICAgICAgICAgICAgfHwgQXJyYXkuaXNBcnJheShtZXRhKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNhdmUgbWV0YSBmYWlsZWQoJHt1dWlkfSk6IFRoZSBtZXRhIG11c3QgYmUgYW4gT2JqZWN0IHN0cmluZ2ApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhc3NldCA9IGFzc2V0IHx8IGFzc2V0UXVlcnkucXVlcnlBc3NldCh1dWlkKSE7XHJcbiAgICAgICAgbWVyZ2VNZXRhKGFzc2V0Lm1ldGEsIG1ldGEpO1xyXG4gICAgICAgIGF3YWl0IGFzc2V0LnNhdmUoKTsgLy8g6L+Z6YeM5omN5piv5bCG5pWw5o2u5L+d5a2Y5YiwIC5tZXRhIOaWh+S7tlxyXG4gICAgICAgIGF3YWl0IGFzc2V0Ll9hc3NldERCLnJlaW1wb3J0KGFzc2V0LnV1aWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHVwZGF0ZVVzZXJEYXRhPFQgZXh0ZW5kcyBrZXlvZiBBc3NldFVzZXJEYXRhTWFwID0gJ3Vua25vd24nPih1dWlkT3JVUkxPclBhdGg6IHN0cmluZywgcGF0aDogc3RyaW5nLCB2YWx1ZTogYW55KTogUHJvbWlzZTxBc3NldFVzZXJEYXRhTWFwW1RdPiB7XHJcbiAgICAgICAgY29uc3QgYXNzZXQgPSBhc3NldFF1ZXJ5LnF1ZXJ5QXNzZXQodXVpZE9yVVJMT3JQYXRoKTtcclxuICAgICAgICBpZiAoIWFzc2V0KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGNhbiBub3QgZmluZCBhc3NldCAke3V1aWRPclVSTE9yUGF0aH1gKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2Rhc2guc2V0KGFzc2V0Py5tZXRhLnVzZXJEYXRhLCBwYXRoLCB2YWx1ZSk7XHJcbiAgICAgICAgYXdhaXQgYXNzZXQuc2F2ZSgpO1xyXG4gICAgICAgIHJldHVybiBhc3NldD8ubWV0YS51c2VyRGF0YTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBzYXZlQXNzZXQodXVpZE9yVVJMT3JQYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyB8IEJ1ZmZlcikge1xyXG4gICAgICAgIGNvbnN0IGFzc2V0ID0gYXNzZXRRdWVyeS5xdWVyeUFzc2V0KHV1aWRPclVSTE9yUGF0aCk7XHJcbiAgICAgICAgaWYgKCFhc3NldCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7aTE4bi50KCdhc3NldHMuc2F2ZV9hc3NldC5mYWlsLmFzc2V0Jyl9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhc3NldC5fYXNzZXREQi5vcHRpb25zLnJlYWRvbmx5KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtpMThuLnQoJ2Fzc2V0cy5vcGVyYXRpb24ucmVhZG9ubHknKX0gXFxuICB1cmw6ICR7YXNzZXQudXJsfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29udGVudCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtpMThuLnQoJ2Fzc2V0cy5zYXZlX2Fzc2V0LmZhaWwuY29udGVudCcpfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWFzc2V0LnNvdXJjZSkge1xyXG4gICAgICAgICAgICAvLyDkuI3lrZjlnKjmupDmlofku7bnmoTotYTmupDml6Dms5Xkv53lrZhcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2kxOG4udCgnYXNzZXRzLnNhdmVfYXNzZXQuZmFpbC51dWlkJyl9YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBhc3NldEhhbmRsZXJNYW5hZ2VyLnNhdmVBc3NldChhc3NldCwgY29udGVudCk7XHJcbiAgICAgICAgaWYgKHJlcykge1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldC5fYXNzZXREQi5yZWltcG9ydChhc3NldC51dWlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGFzc2V0ICYmICghYXNzZXQuaW1wb3J0ZWQgfHwgYXNzZXQuaW52YWxpZCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgYXNzZXQuaW1wb3J0RXJyb3IgfHwgbmV3IEVycm9yKGBTYXZlIGFzc2V0ICR7YXNzZXQuc291cmNlfSBmYWlsZWRgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFzc2V0UXVlcnkuZW5jb2RlQXNzZXQoYXNzZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIGNoZWNrVmFsaWRVcmwodXJsT3JQYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIXVybE9yUGF0aC5zdGFydHNXaXRoKCdkYjovLycpKSB7XHJcbiAgICAgICAgICAgIHVybE9yUGF0aCA9IGFzc2V0UXVlcnkucXVlcnlVcmwodXJsT3JQYXRoKTtcclxuICAgICAgICAgICAgaWYgKCF1cmxPclBhdGgpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtpMThuLnQoJ2Fzc2V0cy5vcGVyYXRpb24uaW52YWxpZF91cmwnKX0gXFxuICB1cmw6ICR7dXJsT3JQYXRofWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBkYk5hbWUgPSB1cmxPclBhdGguc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbilbMV07XHJcbiAgICAgICAgY29uc3QgZGJJbmZvID0gYXNzZXREQk1hbmFnZXIuYXNzZXREQkluZm9bZGJOYW1lXTtcclxuXHJcbiAgICAgICAgaWYgKCFkYkluZm8gfHwgZGJJbmZvLnJlYWRvbmx5KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtpMThuLnQoJ2Fzc2V0cy5vcGVyYXRpb24ucmVhZG9ubHknKX0gXFxuICB1cmw6ICR7dXJsT3JQYXRofWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgY3JlYXRlQXNzZXQob3B0aW9uczogQ3JlYXRlQXNzZXRPcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKCFvcHRpb25zLnRhcmdldCB8fCB0eXBlb2Ygb3B0aW9ucy50YXJnZXQgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGNyZWF0ZSBhc3NldCBiZWNhdXNlIG9wdGlvbnMudGFyZ2V0IGlzIHJlcXVpcmVkLmApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDliKTmlq3nm67moIfot6/lvoTmmK/lkKbkuLrlj6ror7tcclxuICAgICAgICB0aGlzLmNoZWNrVmFsaWRVcmwob3B0aW9ucy50YXJnZXQpO1xyXG4gICAgICAgIGlmICghaXNBYnNvbHV0ZShvcHRpb25zLnRhcmdldCkpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy50YXJnZXQgPSB1cmwycGF0aChvcHRpb25zLnRhcmdldCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9wdGlvbnMudGFyZ2V0ID0gdGhpcy5fY2hlY2tPdmVyd3JpdGUob3B0aW9ucy50YXJnZXQsIG9wdGlvbnMpO1xyXG4gICAgICAgIGNvbnN0IGFzc2V0UGF0aCA9IGF3YWl0IGFzc2V0SGFuZGxlck1hbmFnZXIuY3JlYXRlQXNzZXQob3B0aW9ucyk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5yZWZyZXNoQXNzZXQoYXNzZXRQYXRoKTtcclxuICAgICAgICBjb25zdCBhc3NldCA9IGFzc2V0UXVlcnkucXVlcnlBc3NldChhc3NldFBhdGgpO1xyXG4gICAgICAgIGlmICghYXNzZXQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDcmVhdGUgYXNzZXQgaW4gJHtvcHRpb25zLnRhcmdldH0gZmFpbGVkYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhc3NldCAmJiAoIWFzc2V0LmltcG9ydGVkIHx8IGFzc2V0LmludmFsaWQpKSB7XHJcbiAgICAgICAgICAgIHRocm93IGFzc2V0LmltcG9ydEVycm9yIHx8IG5ldyBFcnJvcihgQ3JlYXRlIGFzc2V0IGluICR7b3B0aW9ucy50YXJnZXR9IGZhaWxlZGApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYXNzZXRRdWVyeS5lbmNvZGVBc3NldChhc3NldCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja7nsbvlnovliJvlu7rotYTmupBcclxuICAgICAqIEBwYXJhbSB0eXBlIFxyXG4gICAgICogQHBhcmFtIGRpck9yVXJsIOebruagh+ebruW9lVxyXG4gICAgICogQHBhcmFtIGJhc2VOYW1lIOWfuuehgOWQjeensFxyXG4gICAgICogQHBhcmFtIG9wdGlvbnMgXHJcbiAgICAgKiBAcmV0dXJucyBcclxuICAgICAqL1xyXG4gICAgYXN5bmMgY3JlYXRlQXNzZXRCeVR5cGUodHlwZTogSVN1cHBvcnRDcmVhdGVUeXBlLCBkaXJPclVybDogc3RyaW5nLCBiYXNlTmFtZTogc3RyaW5nLCBvcHRpb25zPzogQ3JlYXRlQXNzZXRCeVR5cGVPcHRpb25zKSB7XHJcbiAgICAgICAgY29uc3QgY3JlYXRlTWVudXMgPSBhd2FpdCBhc3NldEhhbmRsZXJNYW5hZ2VyLmdldENyZWF0ZU1lbnVCeU5hbWUodHlwZSk7XHJcbiAgICAgICAgaWYgKCFjcmVhdGVNZW51cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IHN1cHBvcnQgY3JlYXRlIHR5cGU6ICR7dHlwZX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGRpciA9IGRpck9yVXJsO1xyXG4gICAgICAgIGlmIChkaXJPclVybC5zdGFydHNXaXRoKCdkYjovLycpKSB7XHJcbiAgICAgICAgICAgIGRpciA9IHVybDJwYXRoKGRpck9yVXJsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNyZWF0ZUluZm86IHVuZGVmaW5lZCB8IElDcmVhdGVNZW51SW5mbyA9IGNyZWF0ZU1lbnVzWzBdO1xyXG4gICAgICAgIGlmIChjcmVhdGVNZW51cy5sZW5ndGggPiAxICYmIG9wdGlvbnM/LnRlbXBsYXRlTmFtZSkge1xyXG4gICAgICAgICAgICBjcmVhdGVJbmZvID0gY3JlYXRlTWVudXMuZmluZCgobWVudSkgPT4gbWVudS5uYW1lID09PSBvcHRpb25zLnRlbXBsYXRlTmFtZSk7XHJcbiAgICAgICAgICAgIGlmICghY3JlYXRlSW5mbykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IGZpbmQgdGVtcGxhdGU6ICR7b3B0aW9ucy50ZW1wbGF0ZU5hbWV9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZXh0TmFtZSA9IGV4dG5hbWUoY3JlYXRlSW5mby5mdWxsRmlsZU5hbWUpO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGpvaW4oZGlyLCBiYXNlTmFtZSArIGV4dE5hbWUpO1xyXG5cclxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5jcmVhdGVBc3NldCh7XHJcbiAgICAgICAgICAgIGhhbmRsZXI6IGNyZWF0ZUluZm8uaGFuZGxlcixcclxuICAgICAgICAgICAgdGFyZ2V0LFxyXG4gICAgICAgICAgICBvdmVyd3JpdGU6IG9wdGlvbnM/Lm92ZXJ3cml0ZSA/PyBmYWxzZSxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IGNyZWF0ZUluZm8udGVtcGxhdGUsXHJcbiAgICAgICAgICAgIGNvbnRlbnQ6IG9wdGlvbnM/LmNvbnRlbnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDku47pobnnm67lpJbmi7fotJ3lr7zlhaXotYTmupDov5vmnaVcclxuICAgICAqIEBwYXJhbSBzb3VyY2UgXHJcbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFxyXG4gICAgICogQHBhcmFtIG9wdGlvbnMgXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGltcG9ydEFzc2V0KHNvdXJjZTogc3RyaW5nLCB0YXJnZXQ6IHN0cmluZywgb3B0aW9ucz86IEFzc2V0T3BlcmF0aW9uT3B0aW9uKTogUHJvbWlzZTxJQXNzZXRJbmZvW10+IHtcclxuICAgICAgICBpZiAodGFyZ2V0LnN0YXJ0c1dpdGgoJ2RiOi8vJykpIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID0gdXJsMnBhdGgodGFyZ2V0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgY29weShzb3VyY2UsIHRhcmdldCwgb3B0aW9ucyk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5yZWZyZXNoQXNzZXQodGFyZ2V0KTtcclxuICAgICAgICBjb25zdCBhc3NldEluZm8gPSBhc3NldFF1ZXJ5LnF1ZXJ5QXNzZXRJbmZvKHRhcmdldCk7XHJcbiAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWFzc2V0SW5mby5pc0RpcmVjdG9yeSkge1xyXG4gICAgICAgICAgICByZXR1cm4gW2Fzc2V0SW5mb107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhc3NldFF1ZXJ5LnF1ZXJ5QXNzZXRJbmZvcyh7XHJcbiAgICAgICAgICAgIHBhdHRlcm46IGAke2Fzc2V0SW5mby51cmx9LyoqLypgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnlJ/miJDlr7zlh7rmlbDmja7mjqXlj6PvvIzkuLvopoHnlKjkuo7vvJrpooTop4jjgIHmnoTlu7rpmLbmrrVcclxuICAgICAqIEBwYXJhbSBhc3NldCBcclxuICAgICAqIEBwYXJhbSBvcHRpb25zIFxyXG4gICAgICogQHJldHVybnMgXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGdlbmVyYXRlRXhwb3J0RGF0YShhc3NldDogQXNzZXQsIG9wdGlvbnM/OiBJRXhwb3J0T3B0aW9ucyk6IFByb21pc2U8SUV4cG9ydERhdGEgfCBudWxsPiB7XHJcbiAgICAgICAgLy8gMy44LjMg5Lul5LiK54mI5pys77yM6LWE5rqQ5a+85YWl5ZCO55qE5pWw5o2u5bCG5Lya6K6w5b2V5ZyoIGFzc2V0Lm91dHB1dERhdGEg5a2X5q615YaF6YOoXHJcbiAgICAgICAgbGV0IG91dHB1dERhdGE6IElFeHBvcnREYXRhID0gYXNzZXQuZ2V0RGF0YSgnb3V0cHV0Jyk7XHJcbiAgICAgICAgaWYgKG91dHB1dERhdGEgJiYgIW9wdGlvbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dERhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDEu5LyY5YWI6LCD55So6LWE5rqQ5aSE55CG5Zmo5YaF55qE5a+85Ye66YC76L6RXHJcbiAgICAgICAgLy8g6ZyA6KaB5rOo5oSP77yM55Sx5LqO5pyJ57G75Ly855qE55So5rOV77yM5Zug6ICMIGFzc2V0TWFuYWdlciDlj6rog73lnKjmnoTlu7rpmLbmrrXkvb/nlKjvvIzml6Dms5XlnKjnu5notYTmupDlpITnkIblmajlhoXosIPnlKhcclxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgYXNzZXRIYW5kbGVyTWFuYWdlci5nZW5lcmF0ZUV4cG9ydERhdGEoYXNzZXQsIG9wdGlvbnMpO1xyXG4gICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gMi4g6buY6K6k55qE5a+85Ye65rWB56iLXHJcbiAgICAgICAgLy8gMi4xIOaXoOW6j+WIl+WMluaVsOaNrueahO+8jOinhuS4uuW8leaTjui/kOihjOaXtuaXoOazleaUr+aMgeeahOi1hOa6kO+8jOS4jeWvvOWHulxyXG4gICAgICAgIGlmICghYXNzZXQubWV0YS5maWxlcy5pbmNsdWRlcygnLmpzb24nKSAmJiAhYXNzZXQubWV0YS5maWxlcy5pbmNsdWRlcygnLmNjb25iJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG91dHB1dERhdGEgPSBlbnN1cmVPdXRwdXREYXRhKGFzc2V0KTtcclxuXHJcbiAgICAgICAgLy8gMi4yIOaXoOWFt+S9k+eahOWvvOWHuumAiemhueaIluiAheWvvOWHuuS/oeaBr+WGheS4jeWMheWQq+W6j+WIl+WMluaVsOaNru+8jOWImeS9v+eUqOm7mOiupOeahOWvvOWHuuS/oeaBr+WNs+WPr1xyXG4gICAgICAgIGlmICghb3B0aW9ucyB8fCAhb3V0cHV0RGF0YS5uYXRpdmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dERhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAyLjMgVE9ETyDmoLnmja7kuI3lkIznmoQgb3B0aW9ucyDmnaHku7bnlJ/miJDkuI3lkIznmoTluo/liJfljJbnu5PmnpxcclxuICAgICAgICAvLyBjb25zdCBjYWNoZVBhdGggPSBhc3NldE91dHB1dFBhdGhDYWNoZS5xdWVyeShhc3NldC51dWlkLCBvcHRpb25zKTtcclxuICAgICAgICAvLyBpZiAoIWNhY2hlUGF0aCkge1xyXG4gICAgICAgIC8vICAgICBjb25zdCBhc3NldERhdGEgPSBhd2FpdCBzZXJpYWxpemVDb21waWxlZChhc3NldCwgb3B0aW9ucyk7XHJcbiAgICAgICAgLy8gICAgIGF3YWl0IG91dHB1dEZpbGUob3V0cHV0RGF0YS5pbXBvcnQucGF0aCwgYXNzZXREYXRhKTtcclxuICAgICAgICAvLyAgICAgYXdhaXQgYXNzZXRPdXRwdXRQYXRoQ2FjaGUuYWRkKGFzc2V0LCBvcHRpb25zLCBvdXRwdXREYXRhLmltcG9ydC5wYXRoKTtcclxuICAgICAgICAvLyB9IGVsc2Uge1xyXG4gICAgICAgIC8vICAgICBvdXRwdXREYXRhLmltcG9ydC5wYXRoID0gY2FjaGVQYXRoO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgLy8gYXNzZXQuc2V0RGF0YSgnb3V0cHV0Jywgb3V0cHV0RGF0YSk7XHJcbiAgICAgICAgcmV0dXJuIG91dHB1dERhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmi7fotJ3nlJ/miJDlr7zlhaXmlofku7bliLDmnIDnu4jnm67moIflnLDlnYDvvIzkuLvopoHnlKjkuo7vvJrmnoTlu7rpmLbmrrVcclxuICAgICAqIEBwYXJhbSBoYW5kbGVyXHJcbiAgICAgKiBAcGFyYW0gc3JjXHJcbiAgICAgKiBAcGFyYW0gZGVzdFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgYXN5bmMgb3V0cHV0RXhwb3J0RGF0YShoYW5kbGVyOiBzdHJpbmcsIHNyYzogSUV4cG9ydERhdGEsIGRlc3Q6IElFeHBvcnREYXRhKSB7XHJcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgYXNzZXRIYW5kbGVyTWFuYWdlci5vdXRwdXRFeHBvcnREYXRhKGhhbmRsZXIsIHNyYywgZGVzdCk7XHJcbiAgICAgICAgaWYgKCFyZXMpIHtcclxuICAgICAgICAgICAgYXdhaXQgY29weShzcmMuaW1wb3J0LnBhdGgsIGRlc3QuaW1wb3J0LnBhdGgpO1xyXG4gICAgICAgICAgICBpZiAoc3JjLm5hdGl2ZSAmJiBkZXN0Lm5hdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmF0aXZlU3JjOiBzdHJpbmdbXSA9IE9iamVjdC52YWx1ZXMoc3JjLm5hdGl2ZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuYXRpdmVEZXN0OiBzdHJpbmdbXSA9IE9iamVjdC52YWx1ZXMoZGVzdC5uYXRpdmUpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwobmF0aXZlU3JjLm1hcCgocGF0aCwgaSkgPT4gY29weShwYXRoLCBuYXRpdmVEZXN0W2ldKSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yi35paw5p+Q5Liq6LWE5rqQ5oiW5piv6LWE5rqQ55uu5b2VXHJcbiAgICAgKiBAcGFyYW0gcGF0aE9yVXJsT3JVVUlEIFxyXG4gICAgICogQHJldHVybnMgYm9vbGVhblxyXG4gICAgICovXHJcbiAgICBhc3luYyByZWZyZXNoQXNzZXQocGF0aE9yVXJsT3JVVUlEOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xyXG4gICAgICAgIC8vIOWwhuWunumZheeahOWIt+aWsOS7u+WKoeWhnuWIsCBkYiDnrqHnkIblmajnmoTpmJ/liJflhoXnrYnlvoXmiafooYxcclxuICAgICAgICByZXR1cm4gYXdhaXQgYXNzZXREQk1hbmFnZXIuYWRkVGFzayh0aGlzLl9yZWZyZXNoQXNzZXQuYmluZCh0aGlzKSwgW3BhdGhPclVybE9yVVVJRF0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX3JlZnJlc2hBc3NldChwYXRoT3JVcmxPclVVSUQ6IHN0cmluZywgYXV0b1JlZnJlc2hEaXIgPSB0cnVlKTogUHJvbWlzZTxudW1iZXI+IHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZWZyZXNoKHBhdGhPclVybE9yVVVJRCk7XHJcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgY2FuIG5vdCBmaW5kIGFzc2V0ICR7cGF0aE9yVXJsT3JVVUlEfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYXV0b1JlZnJlc2hEaXIpIHtcclxuICAgICAgICAgICAgLy8gSEFDSyDmn5Dkupvmg4XlhrXkuIvlr7zlhaXljp/lp4votYTmupDlkI7vvIzmlofku7blpLnnmoQgbXRpbWUg5Lya5Y+R55Sf5Y+Y5YyW77yM5a+86Ie06LWE5rqQ6YeP5aSn55qE5oOF5Ya15LiL5LiL5qyh6I635b6X54Sm54K56Ieq5Yqo5Yi35paw5pe25Lya5pyJ56ys5LqM5qyh55qE5paH5Lu25aS55aSn5om56YeP5Yi35pawXHJcbiAgICAgICAgICAgIC8vIOeUqOi/m+WFpemYn+WIl+eahOaWueW8j+aJjeiDveS/nemanCBwYXVzZSDnrYnmnLrliLbkuI3kvJrooqvlvbHlk41cclxuICAgICAgICAgICAgYXdhaXQgYXNzZXREQk1hbmFnZXIuYWRkVGFzayhhc3NldERCTWFuYWdlci5hdXRvUmVmcmVzaEFzc2V0TGF6eS5iaW5kKGFzc2V0REJNYW5hZ2VyKSwgW2Rpcm5hbWUocGF0aE9yVXJsT3JVVUlEKV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0aGlzLmF1dG9SZWZyZXNoQXNzZXRMYXp5KGRpcm5hbWUocGF0aE9yVXJsT3JVVUlEKSk7XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgcmVmcmVzaCBhc3NldCAke2Rpcm5hbWUocGF0aE9yVXJsT3JVVUlEKX0gc3VjY2Vzc2ApO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDph43mlrDlr7zlhaXmn5DkuKrotYTmupBcclxuICAgICAqIEBwYXJhbSBwYXRoT3JVcmxPclVVSUQgXHJcbiAgICAgKiBAcmV0dXJucyBcclxuICAgICAqL1xyXG4gICAgYXN5bmMgcmVpbXBvcnRBc3NldChwYXRoT3JVcmxPclVVSUQ6IHN0cmluZyk6IFByb21pc2U8SUFzc2V0SW5mbz4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBhc3NldERCTWFuYWdlci5hZGRUYXNrKHRoaXMuX3JlaW1wb3J0QXNzZXQuYmluZCh0aGlzKSwgW3BhdGhPclVybE9yVVVJRF0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX3JlaW1wb3J0QXNzZXQocGF0aE9yVXJsT3JVVUlEOiBzdHJpbmcpOiBQcm9taXNlPElBc3NldEluZm8+IHtcclxuICAgICAgICAvLyDlupXlsYLnmoQgcmVpbXBvcnQg5LiN5pSv5oyB5a2Q6LWE5rqQ55qEIHVybCDmlLnkuLrkvb/nlKggdXVpZCDph43mlrDlr7zlhaVcclxuICAgICAgICBpZiAocGF0aE9yVXJsT3JVVUlELnN0YXJ0c1dpdGgoJ2RiOi8vJykpIHtcclxuICAgICAgICAgICAgcGF0aE9yVXJsT3JVVUlEID0gdXJsMnV1aWQocGF0aE9yVXJsT3JVVUlEKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYXNzZXQgPSBhd2FpdCByZWltcG9ydChwYXRoT3JVcmxPclVVSUQpO1xyXG4gICAgICAgIGlmICghYXNzZXQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGDml6Dms5Xmib7liLDotYTmupAgJHtwYXRoT3JVcmxPclVVSUR9LCDor7fmo4Dmn6Xlj4LmlbDmmK/lkKbmraPnoa5gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGFzc2V0ICYmICghYXNzZXQuaW1wb3J0ZWQgfHwgYXNzZXQuaW52YWxpZCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgYXNzZXQuaW1wb3J0RXJyb3IgfHwgbmV3IEVycm9yKGBSZWltcG9ydCBhc3NldCAke2Fzc2V0LnNvdXJjZX0gZmFpbGVkYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhc3NldFF1ZXJ5LmVuY29kZUFzc2V0KGFzc2V0KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOenu+WKqOi1hOa6kFxyXG4gICAgICogQHBhcmFtIHNvdXJjZSDmupDmlofku7bnmoQgdXJsIOaIluiAhee7neWvuei3r+W+hCBkYjovL2Fzc2V0cy9hYmMudHh0XHJcbiAgICAgKiBAcGFyYW0gdGFyZ2V0IOebruaghyB1cmwg5oiW6ICF57ud5a+56Lev5b6EIGRiOi8vYXNzZXRzL2EudHh0XHJcbiAgICAgKiBAcGFyYW0gb3B0aW9uIOWvvOWFpei1hOa6kOeahOWPguaVsCB7IG92ZXJ3cml0ZSwgeHh4LCByZW5hbWUgfVxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8SUFzc2V0SW5mbyB8IG51bGw+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyBtb3ZlQXNzZXQoc291cmNlOiBzdHJpbmcsIHRhcmdldDogc3RyaW5nLCBvcHRpb24/OiBBc3NldE9wZXJhdGlvbk9wdGlvbikge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBhc3NldERCTWFuYWdlci5hZGRUYXNrKHRoaXMuX21vdmVBc3NldC5iaW5kKHRoaXMpLCBbc291cmNlLCB0YXJnZXQsIG9wdGlvbl0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX21vdmVBc3NldChzb3VyY2U6IHN0cmluZywgdGFyZ2V0OiBzdHJpbmcsIG9wdGlvbj86IEFzc2V0T3BlcmF0aW9uT3B0aW9uKSB7XHJcbiAgICAgICAgY29uc29sZS5kZWJ1Zyhgc3RhcnQgbW92ZSBhc3NldCBmcm9tICR7c291cmNlfSAtPiAke3RhcmdldH0uLi5gKTtcclxuICAgICAgICBpZiAodGFyZ2V0LnN0YXJ0c1dpdGgoJ2RiOi8vJykpIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID0gdXJsMnBhdGgodGFyZ2V0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYXNzZXQgPSBhc3NldFF1ZXJ5LnF1ZXJ5QXNzZXQoc291cmNlKTtcclxuICAgICAgICBpZiAoIWFzc2V0KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgYXNzZXQgaW4gc291cmNlIGZpbGUgJHtzb3VyY2V9IG5vdCBleGlzdHNgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY2hlY2tSZWFkb25seShhc3NldCk7XHJcbiAgICAgICAgc291cmNlID0gYXNzZXQuc291cmNlO1xyXG4gICAgICAgIHRhcmdldCA9IHRoaXMuX2NoZWNrT3ZlcndyaXRlKHRhcmdldCwgb3B0aW9uKTtcclxuICAgICAgICBhd2FpdCBtb3ZlRmlsZShzb3VyY2UsIHRhcmdldCwgb3B0aW9uKTtcclxuXHJcbiAgICAgICAgY29uc3QgdXJsID0gcXVlcnlVcmwodGFyZ2V0KTtcclxuICAgICAgICBjb25zdCByZWcgPSAvZGI6XFwvXFwvW14vXSsvLmV4ZWModXJsKTtcclxuICAgICAgICAvLyDluLjop4TnmoTotYTmupDnp7vliqjvvJrmnJ/mnJvlj6rmnIkgY2hhbmdlIOa2iOaBr1xyXG4gICAgICAgIGlmIChyZWcgJiYgcmVnWzBdICYmIHVybC5zdGFydHNXaXRoKHJlZ1swXSkpIHtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWZyZXNoQXNzZXQodGFyZ2V0KTtcclxuICAgICAgICAgICAgLy8g5Zug5Li65paH5Lu26KKr56e76LWw5LmL5ZCO77yM5paH5Lu25aS555qEIG10aW1lIOS8muWPmOWMlu+8jOaJgOS7peimgeS4u+WKqOWIt+aWsOS4gOasoeiiq+enu+i1sOaWh+S7tueahOaWh+S7tuWkuVxyXG4gICAgICAgICAgICAvLyDlv4XpobvlnKjnm67moIfkvY3nva7mlofku7bliLfmlrDlrozmiJDlkI7lho3liLfmlrDvvIzlpoLmnpzmlL7liLDliY3pnaLvvIzkvJrlr7zoh7TlhYjor4bliKvliLDmlofku7booqvliKDpmaTvvIzop6blj5EgZGVsZXRlIOWQjuWGjeWPkemAgSBhZGRcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWZyZXNoQXNzZXQoZGlybmFtZShzb3VyY2UpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyDot6jmlbDmja7lupPnp7vliqjotYTmupDmiJbogIXopobnm5bmk43kvZzml7bpnIDopoHlhYjliLfnm67moIfmlofku7bvvIzop6blj5EgZGVsZXRlIOWQjuWGjeWPkemAgSBhZGRcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWZyZXNoQXNzZXQoc291cmNlKTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWZyZXNoQXNzZXQodGFyZ2V0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgbW92ZSBhc3NldCBmcm9tICR7c291cmNlfSAtPiAke3RhcmdldH0gc3VjY2Vzc2ApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN5ZG95ZCN5p+Q5Liq6LWE5rqQXHJcbiAgICAgKiBAcGFyYW0gc291cmNlIFxyXG4gICAgICogQHBhcmFtIHRhcmdldCBcclxuICAgICAqL1xyXG4gICAgYXN5bmMgcmVuYW1lQXNzZXQoc291cmNlOiBzdHJpbmcsIHRhcmdldDogc3RyaW5nLCBvcHRpb24/OiBBc3NldE9wZXJhdGlvbk9wdGlvbikge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBhc3NldERCTWFuYWdlci5hZGRUYXNrKHRoaXMuX3JlbmFtZUFzc2V0LmJpbmQodGhpcyksIFtzb3VyY2UsIHRhcmdldCwgb3B0aW9uXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfcmVuYW1lQXNzZXQoc291cmNlOiBzdHJpbmcsIHRhcmdldDogc3RyaW5nLCBvcHRpb24/OiBBc3NldE9wZXJhdGlvbk9wdGlvbikge1xyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoYHN0YXJ0IHJlbmFtZSBhc3NldCBmcm9tICR7c291cmNlfSAtPiAke3RhcmdldH0uLi5gKTtcclxuICAgICAgICBjb25zdCBhc3NldCA9IGFzc2V0UXVlcnkucXVlcnlBc3NldChzb3VyY2UpO1xyXG4gICAgICAgIGlmICghYXNzZXQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBhc3NldCBpbiBzb3VyY2UgZmlsZSAke3NvdXJjZX0gbm90IGV4aXN0c2ApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9jaGVja1JlYWRvbmx5KGFzc2V0KTtcclxuICAgICAgICBzb3VyY2UgPSBhc3NldC5zb3VyY2U7XHJcbiAgICAgICAgdGhpcy5fY2hlY2tFeGlzdHMoc291cmNlKTtcclxuICAgICAgICBpZiAodGFyZ2V0LnN0YXJ0c1dpdGgoJ2RiOi8vJykpIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID0gdXJsMnBhdGgodGFyZ2V0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGFyZ2V0ID0gdGhpcy5fY2hlY2tPdmVyd3JpdGUodGFyZ2V0LCBvcHRpb24pO1xyXG4gICAgICAgIC8vIOa6kOWcsOWdgOS4jeiDveiiq+ebruagh+WcsOWdgOWMheWQq++8jOS5n+S4jeiDveebuOetiVxyXG4gICAgICAgIGlmICh0YXJnZXQuc3RhcnRzV2l0aChqb2luKHNvdXJjZSwgJy8nKSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2kxOG4udCgnYXNzZXRzLnJlbmFtZV9hc3NldC5mYWlsLnBhcmVudCcpfSBcXG5zb3VyY2U6ICR7c291cmNlfVxcbnRhcmdldDogJHt0YXJnZXR9YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB1cmkgPSB7XHJcbiAgICAgICAgICAgIGJhc2VuYW1lOiBiYXNlbmFtZSh0YXJnZXQpLFxyXG4gICAgICAgICAgICBkaXJuYW1lOiBkaXJuYW1lKHRhcmdldCksXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCB0ZW1wID0gam9pbih1cmkuZGlybmFtZSwgJy5yZW5hbWVfdGVtcCcpO1xyXG5cclxuICAgICAgICAvLyDmlLnliLDkuLTml7bot6/lvoTvvIznhLblkI7liLfmlrDvvIzliKDpmaTljp/mnaXnmoTnvJPlrZhcclxuICAgICAgICBhd2FpdCByZW5hbWUoc291cmNlICsgJy5tZXRhJywgdGVtcCArICcubWV0YScpO1xyXG4gICAgICAgIGF3YWl0IHJlbmFtZShzb3VyY2UsIHRlbXApO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuX3JlZnJlc2hBc3NldChzb3VyY2UsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgLy8g5pS55Li655yf5q2j55qE6Lev5b6E77yM54S25ZCO5Yi35paw77yM55So5paw5ZCN5a2X6YeN5paw5a+85YWlXHJcbiAgICAgICAgYXdhaXQgcmVuYW1lKHRlbXAgKyAnLm1ldGEnLCB0YXJnZXQgKyAnLm1ldGEnKTtcclxuICAgICAgICBhd2FpdCByZW5hbWUodGVtcCwgdGFyZ2V0KTtcclxuICAgICAgICBhd2FpdCB0aGlzLl9yZWZyZXNoQXNzZXQodGFyZ2V0KTtcclxuICAgICAgICAvLyBUT0RPIOi/lOWbnui1hOa6kOS/oeaBr1xyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoYHJlbmFtZSBhc3NldCBmcm9tICR7c291cmNlfSAtPiAke3RhcmdldH0gc3VjY2Vzc2ApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog56e76Zmk6LWE5rqQXHJcbiAgICAgKiBAcGFyYW0gcGF0aCBcclxuICAgICAqIEByZXR1cm5zIFxyXG4gICAgICovXHJcbiAgICBhc3luYyByZW1vdmVBc3NldCh1dWlkT3JVUkxPclBhdGg6IHN0cmluZyk6IFByb21pc2U8SUFzc2V0SW5mbyB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBhc3NldCA9IGFzc2V0UXVlcnkucXVlcnlBc3NldCh1dWlkT3JVUkxPclBhdGgpO1xyXG4gICAgICAgIGlmICghYXNzZXQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2kxOG4udCgnYXNzZXRzLmRlbGV0ZV9hc3NldC5mYWlsLnVuZXhpc3QnKX0gXFxuc291cmNlOiAke3V1aWRPclVSTE9yUGF0aH1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY2hlY2tSZWFkb25seShhc3NldCk7XHJcblxyXG4gICAgICAgIGlmIChhc3NldC5fcGFyZW50KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihg5a2Q6LWE5rqQ5peg5rOV5Y2V54us5Yig6Zmk77yM6K+35Lyg6YCS54i26LWE5rqQ55qEIFVSTCDlnLDlnYBgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcGF0aCA9IGFzc2V0LnNvdXJjZTtcclxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBhc3NldERCTWFuYWdlci5hZGRUYXNrKHRoaXMuX3JlbW92ZUFzc2V0LmJpbmQodGhpcyksIFtwYXRoXSk7XHJcbiAgICAgICAgcmV0dXJuIHJlcyA/IGFzc2V0UXVlcnkuZW5jb2RlQXNzZXQoYXNzZXQpIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9yZW1vdmVBc3NldChwYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICBsZXQgcmVzID0gZmFsc2U7XHJcbiAgICAgICAgYXdhaXQgcmVtb3ZlRmlsZShwYXRoKTtcclxuICAgICAgICBhd2FpdCB0aGlzLnJlZnJlc2hBc3NldChwYXRoKTtcclxuICAgICAgICByZXMgPSB0cnVlO1xyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoYHJlbW92ZSBhc3NldCAke3BhdGh9IHN1Y2Nlc3NgKTtcclxuICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgYXNzZXRPcGVyYXRpb24gPSBuZXcgQXNzZXRPcGVyYXRpb24oKTtcclxuZXhwb3J0IGRlZmF1bHQgYXNzZXRPcGVyYXRpb247XHJcblxyXG4vKipcclxuICog56e75Yqo5paH5Lu2XHJcbiAqIEBwYXJhbSBmaWxlXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbW92ZUZpbGUoc291cmNlOiBzdHJpbmcsIHRhcmdldDogc3RyaW5nLCBvcHRpb25zPzogSU1vdmVPcHRpb25zKSB7XHJcblxyXG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLm92ZXJ3cml0ZSkge1xyXG4gICAgICAgIG9wdGlvbnMgPSB7IG92ZXJ3cml0ZTogZmFsc2UgfTsgLy8gZnMgbW92ZSDopoHmsYLlrp7lj4Igb3B0aW9ucyDopoHmnInlgLxcclxuICAgIH1cclxuICAgIGNvbnN0IHRlbXBEaXIgPSBqb2luKGFzc2V0Q29uZmlnLmRhdGEudGVtcFJvb3QsICdtb3ZlLXRlbXAnKTtcclxuICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlKGFzc2V0Q29uZmlnLmRhdGEucm9vdCwgdGFyZ2V0KTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKCF1dGlscy5QYXRoLmNvbnRhaW5zKHNvdXJjZSwgdGFyZ2V0KSkge1xyXG4gICAgICAgICAgICBhd2FpdCBtb3ZlKHNvdXJjZSArICcubWV0YScsIHRhcmdldCArICcubWV0YScsIHsgb3ZlcndyaXRlOiB0cnVlIH0pOyAvLyBtZXRhIOWFiOenu+WKqFxyXG4gICAgICAgICAgICBhd2FpdCBtb3ZlKHNvdXJjZSwgdGFyZ2V0LCBvcHRpb25zKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBhc3NldHMvc2NyaXB0cy9zY3JpcHRzIC0+IGFzc2V0cy9zY3JpcHRzIOebtOaOpeaTjeS9nOS8muaKpemUme+8jOmcgOimgeWIhuasoeaJp+ihjFxyXG4gICAgICAgIC8vIOa4heepuuS4tOaXtuebruW9lVxyXG4gICAgICAgIGF3YWl0IHJlbW92ZShqb2luKHRlbXBEaXIsIHJlbGF0aXZlUGF0aCkpO1xyXG4gICAgICAgIGF3YWl0IHJlbW92ZShqb2luKHRlbXBEaXIsIHJlbGF0aXZlUGF0aCkgKyAnLm1ldGEnKTtcclxuXHJcbiAgICAgICAgLy8g5YWI56e75Yqo5Yiw5Li05pe255uu5b2VXHJcbiAgICAgICAgYXdhaXQgbW92ZShzb3VyY2UgKyAnLm1ldGEnLCBqb2luKHRlbXBEaXIsIHJlbGF0aXZlUGF0aCkgKyAnLm1ldGEnLCB7IG92ZXJ3cml0ZTogdHJ1ZSB9KTsgLy8gbWV0YSDlhYjnp7vliqhcclxuICAgICAgICBhd2FpdCBtb3ZlKHNvdXJjZSwgam9pbih0ZW1wRGlyLCByZWxhdGl2ZVBhdGgpLCB7IG92ZXJ3cml0ZTogdHJ1ZSB9KTtcclxuXHJcbiAgICAgICAgLy8g5YaN56e75Yqo5Yiw55uu5qCH55uu5b2VXHJcbiAgICAgICAgYXdhaXQgbW92ZShqb2luKHRlbXBEaXIsIHJlbGF0aXZlUGF0aCkgKyAnLm1ldGEnLCB0YXJnZXQgKyAnLm1ldGEnLCB7IG92ZXJ3cml0ZTogdHJ1ZSB9KTsgLy8gbWV0YSDlhYjnp7vliqhcclxuICAgICAgICBhd2FpdCBtb3ZlKGpvaW4odGVtcERpciwgcmVsYXRpdmVQYXRoKSwgdGFyZ2V0LCBvcHRpb25zKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgYXNzZXQgZGIgbW92ZUZpbGUgZnJvbSAke3NvdXJjZX0gLT4gJHt0YXJnZXR9IGZhaWwhYCk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICB9XHJcbn1cclxuIl19