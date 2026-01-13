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
exports.PROMISE_STATE = void 0;
exports.url2path = url2path;
exports.getCurrentLocalTime = getCurrentLocalTime;
exports.getMemorySize = getMemorySize;
exports.url2uuid = url2uuid;
exports.libArr2Obj = libArr2Obj;
exports.getExtendsFromCCType = getExtendsFromCCType;
exports.tranAssetInfo = tranAssetInfo;
exports.decidePromiseState = decidePromiseState;
exports.removeFile = removeFile;
exports.serializeCompiledWithInstance = serializeCompiledWithInstance;
exports.getRawInstanceFromImportFile = getRawInstanceFromImportFile;
exports.serializeCompiled = serializeCompiled;
exports.ensureOutputData = ensureOutputData;
const index_1 = require("@cocos/asset-db/index");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const i18n_1 = __importDefault(require("../base/i18n"));
const utils_1 = __importDefault(require("../base/utils"));
const missing_class_reporter_1 = require("../engine/editor-extends/missing-reporter/missing-class-reporter");
function url2path(url) {
    if ((0, path_1.isAbsolute)(url)) {
        return url;
    }
    // 数据库地址转换
    if (url.startsWith('db://')) {
        return (0, index_1.queryPath)(url);
    }
    return utils_1.default.Path.resolveToRaw(url);
}
/**
* 将时间戳转为可阅读的时间信息
*/
function getCurrentLocalTime() {
    const time = new Date();
    return time.toLocaleDateString().replace(/\//g, '-') + ' ' + time.toTimeString().slice(0, 5).replace(/:/g, '-');
}
/**
 * 获取当前内存占用
 */
function getMemorySize() {
    const memory = process.memoryUsage();
    function format(bytes) {
        return (bytes / 1024 / 1024).toFixed(2) + 'MB';
    }
    return 'Process: heapTotal ' + format(memory.heapTotal) + ' heapUsed ' + format(memory.heapUsed) + ' rss ' + format(memory.rss);
}
/**
 * 将 url 转成 uuid
 * @param url
 */
function url2uuid(url) {
    const subAssetName = [];
    let uuid = url;
    let wUUID = '';
    while (!(wUUID = (0, index_1.queryUUID)(uuid)) && uuid !== 'db:/') {
        uuid = uuid.replace(/\/([^/]*)$/, (all, name) => {
            subAssetName.splice(0, 0, index_1.Utils.nameToId(name));
            return '';
        });
    }
    if (wUUID) {
        const asset = (0, index_1.queryAsset)(uuid);
        if (!asset || (asset.isDirectory() && subAssetName.length > 0)) {
            uuid = '';
        }
        else {
            uuid = asset.uuid;
            if (subAssetName.length > 0) {
                uuid += '@' + subAssetName.join('@');
            }
        }
    }
    else {
        uuid = '';
    }
    return uuid;
}
// 检查是否是扩展名的正则判断
const extnameRex = /^\./;
/**
 * 检查一个输入文件名是否是扩展名
 * @param extOrFile
 */
function isExtname(extOrFile) {
    return extOrFile === '' || extnameRex.test(extOrFile);
}
/**
 * assetDB 内 asset 资源自带的 library 是一个数组，需要转成对象
 * @param asset
 */
function libArr2Obj(asset) {
    const result = {};
    for (const extname of asset.meta.files) {
        if (isExtname(extname)) {
            result[extname] = asset.library + extname;
        }
        else {
            result[extname] = (0, path_1.resolve)(asset.library, extname);
        }
    }
    return result;
}
function getExtendsFromCCType(ccType) {
    if (!ccType || ccType === 'cc.Asset') {
        return [];
    }
    let superClass = cc.js.getSuper(cc.js.getClassByName(ccType));
    const extendClass = [];
    let superClassName = cc.js.getClassName(superClass);
    while (superClassName && (extendClass[extendClass.length - 1] !== 'cc.Asset')) {
        extendClass.push(superClassName);
        superClass = cc.js.getSuper(superClass);
        superClassName = cc.js.getClassName(superClass);
    }
    return extendClass;
}
// 整理出需要在删除资源后传播的主要信息
function tranAssetInfo(asset) {
    const info = {
        file: asset.source,
        uuid: asset.uuid,
        library: libArr2Obj(asset),
        importer: asset.meta.importer,
    };
    return info;
}
exports.PROMISE_STATE = {
    PENDING: 'pending',
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected',
};
function decidePromiseState(promise) {
    const t = { name: 'test' };
    return Promise.race([promise, t])
        .then(v => {
        return (v === t) ? exports.PROMISE_STATE.PENDING : exports.PROMISE_STATE.FULFILLED;
    })
        .catch(() => exports.PROMISE_STATE.REJECTED);
}
/**
 * 删除文件
 * @param file
 */
async function removeFile(file) {
    if (!(0, fs_extra_1.existsSync)(file)) {
        return true;
    }
    try {
        await utils_1.default.File.trashItem(file);
    }
    catch (error) {
        console.error(error);
        throw new Error(`asset db removeFile ${file} fail!`);
    }
    // 这个 try 是容错，目的是吐掉报错，报错的原因是重复操作了，db 在刷新的时候也会处理主文件配套的 meta 文件
    try {
        const metaFile = file + '.meta';
        if ((0, fs_extra_1.existsSync)(metaFile)) {
            await utils_1.default.File.trashItem(metaFile);
        }
    }
    catch (error) {
        // do nothing
    }
    return true;
}
// 默认的序列化选项
const defaultSerializeOptions = {
    compressUuid: true, // 是否是作为正式打包导出的序列化操作
    stringify: false, // 序列化出来的以 json 字符串形式还是 json 对象显示，这个要写死统一，否则对 json 做处理的时候都需要做类型判断
    dontStripDefault: false,
    useCCON: false,
    keepNodeUuid: false, // 序列化后是否保留节点组件的 uuid 数据
};
function serializeCompiledWithInstance(instance, options) {
    if (!instance) {
        return null;
    }
    // 重新反序列化并保存
    return serializeCompiled(instance, Object.assign(defaultSerializeOptions, {
        compressUuid: !options.debug,
        debug: options.debug,
        useCCON: options.useCCONB,
        noNativeDep: !instance._native, // 表明该资源是否存在原生依赖，这个字段在运行时会影响 preload 相关接口的表现
    }));
}
async function getRawInstanceFromImportFile(path, assetInfo) {
    const data = path.endsWith('.json') ? await (0, fs_extra_1.readJSON)(path) : await transformCCON(path);
    const result = {
        asset: null,
        detail: null,
    };
    const { deserialize } = await Promise.resolve().then(() => __importStar(require('cc')));
    const deserializeDetails = new deserialize.Details();
    // detail 里面的数组分别一一对应，并且指向 asset 依赖资源的对象，不可随意更改 / 排序
    deserializeDetails.reset();
    missing_class_reporter_1.MissingClass.hasMissingClass = false;
    const deserializedAsset = deserialize(data, deserializeDetails, {
        createAssetRefs: true,
        ignoreEditorOnly: true,
        classFinder: missing_class_reporter_1.MissingClass.classFinder,
    });
    if (!deserializedAsset) {
        console.error(i18n_1.default.t('builder.error.deserialize_failed', {
            url: `{asset(${assetInfo.url})}`,
        }));
        return result;
    }
    // reportMissingClass 会根据 _uuid 来做判断，需要在调用 reportMissingClass 之前赋值
    deserializedAsset._uuid = assetInfo.uuid;
    // if (MissingClass.hasMissingClass && !this.hasMissingClassUuids.has(asset.uuid)) {
    //     MissingClass.reportMissingClass(deserializedAsset);
    //     this.hasMissingClassUuids.add(asset.uuid);
    // }
    // 清空缓存，防止内存泄漏
    missing_class_reporter_1.MissingClass.reset();
    // 预览时只需找出依赖的资源，无需缓存 asset
    // 检查以及查找对应资源，并返回给对应 asset 数据
    // const missingAssets: string[] = [];
    // 根据这个方法分配假的资源对象, 确保序列化时资源能被重新序列化成 uuid
    // const test = this;
    // let missingAssetReporter: any = null;
    // deserializeDetails.assignAssetsBy(function(uuid: string, options: { owner: object; prop: string; type: Function }) {
    // const asset = test.getAsset(uuid);
    // if (asset) {
    //     return EditorExtends.serialize.asAsset(uuid);
    // } else {
    //     // if (!missingAssets.includes(uuid)) {
    //     //     missingAssets.push(uuid);
    //     // test.hasMissingAssetsUuids.add(uuid);
    //     if (options && options.owner) {
    //         missingAssetReporter = missingAssetReporter || new EditorExtends.MissingReporter.object(deserializedAsset);
    //         missingAssetReporter.outputLevel = 'warn';
    //         missingAssetReporter.stashByOwner(options.owner, options.prop, EditorExtends.serialize.asAsset(uuid, options.type));
    //     }
    //     // }
    //     // remove deleted asset reference
    //     return null;
    // }
    // });
    // if (missingAssetReporter) {
    //     missingAssetReporter.reportByOwner();
    // }
    // if (missingAssets.length > 0) {
    //     console.warn(
    //         i18n.t('builder.error.required_asset_missing', {
    //             url: `{asset(${asset.url})}`,
    //             uuid: missingAssets.join('\n '),
    //         }),
    //     );
    // }
    // https://github.com/cocos-creator/3d-tasks/issues/6042 处理 prefab 与 scene 名称同步问题
    // if (['cc.SceneAsset', 'cc.Prefab'].includes(Manager.assetManager.queryAssetProperty(asset, 'type'))) {
    //     deserializedAsset.name = basename(asset.source, extname(asset.source));
    // }
    result.asset = deserializedAsset;
    result.detail = deserializeDetails;
    // this.depend[asset.uuid] = [...new Set(deserializeDetails.uuidList)] as string[];
}
async function transformCCON(path) {
    const buffer = await (0, fs_extra_1.readFile)(path);
    const bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const { decodeCCONBinary } = await Promise.resolve().then(() => __importStar(require('cc/editor/serialization')));
    return decodeCCONBinary(bytes);
}
async function serializeCompiled(asset, options) {
    const outputData = ensureOutputData(asset);
    const result = await getRawInstanceFromImportFile(outputData.import.path, {
        uuid: asset.uuid,
        url: asset.url,
    });
    if (!result?.asset) {
        return null;
    }
    return serializeCompiledWithInstance(result.asset, options);
}
function ensureOutputData(asset) {
    // 3.8.3 以上版本，资源导入后的数据将会记录在 outputData 字段内部
    let outputData = asset.getData('output');
    if (outputData) {
        return outputData;
    }
    outputData = {
        import: {
            type: 'json',
            path: asset.library + '.json',
        },
    };
    let importPath;
    // 生成默认的 debug 版本导出数据
    const nativePath = {};
    asset.meta.files.forEach((extName) => {
        if (['.json', '.cconb'].includes(extName)) {
            outputData.import.path = asset.library + extName;
            if (extName === '.cconb') {
                outputData.import.type = 'buffer';
            }
            return;
        }
        // 旧规则，__ 开头的资源不在运行时使用
        if (extName.startsWith('.___')) {
            return;
        }
        nativePath[extName] = asset.library + extName;
    });
    if (Object.keys(nativePath).length) {
        outputData.native = nativePath;
    }
    asset.setData('output', outputData);
    return outputData;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFZYiw0QkFVQztBQUtELGtEQUdDO0FBSUQsc0NBTUM7QUFNRCw0QkF3QkM7QUFpQkQsZ0NBVUM7QUFFRCxvREFnQkM7QUFHRCxzQ0FRQztBQVFELGdEQU9DO0FBTUQsZ0NBc0JDO0FBWUQsc0VBaUJDO0FBRUQsb0VBZ0ZDO0FBU0QsOENBVUM7QUFFRCw0Q0FvQ0M7QUEvVUQsaURBQWdJO0FBQ2hJLCtCQUEyRDtBQUMzRCx1Q0FBd0U7QUFHeEUsd0RBQWdDO0FBQ2hDLDBEQUFrQztBQUVsQyw2R0FBZ0c7QUFFaEcsU0FBZ0IsUUFBUSxDQUFDLEdBQVc7SUFDaEMsSUFBSSxJQUFBLGlCQUFVLEVBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNsQixPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFDRCxVQUFVO0lBQ1YsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDMUIsT0FBTyxJQUFBLGlCQUFTLEVBQUMsR0FBRyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELE9BQU8sZUFBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUVEOztFQUVFO0FBQ0YsU0FBZ0IsbUJBQW1CO0lBQy9CLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDeEIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFP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QUMsR0FBRyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUNsRCxDQUFDLENBQUMsQ0FBQztJQUVILElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNqQyxVQUFVLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQztJQUNuQyxDQUFDO0lBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDcEMsT0FBTyxVQUFVLENBQUM7QUFDdEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IEFzc2V0LCBWaXJ0dWFsQXNzZXQsIHF1ZXJ5VVVJRCwgVXRpbHMgYXMgZGJVdGlscywgcXVlcnlBc3NldCBhcyBkYlF1ZXJ5QXNzZXQsIHF1ZXJ5UGF0aCB9IGZyb20gJ0Bjb2Nvcy9hc3NldC1kYi9pbmRleCc7XHJcbmltcG9ydCB7IGlzQWJzb2x1dGUsIGpvaW4sIHJlbGF0aXZlLCByZXNvbHZlIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGV4aXN0c1N5bmMsIG1vdmUsIHJlYWRGaWxlLCByZWFkSlNPTiwgcmVtb3ZlIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgdHlwZSB7IEFzc2V0IGFzIENDQXNzZXQsIERldGFpbHMgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB0eXBlIHsgQ0NPTiB9IGZyb20gJ2NjL2VkaXRvci9zZXJpYWxpemF0aW9uJztcclxuaW1wb3J0IGkxOG4gZnJvbSAnLi4vYmFzZS9pMThuJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uL2Jhc2UvdXRpbHMnO1xyXG5pbXBvcnQgeyBJQXNzZXQsIElFeHBvcnREYXRhLCBJU2VyaWFsaXplZE9wdGlvbnMsIFNlcmlhbGl6ZWRBc3NldCB9IGZyb20gJy4vQHR5cGVzL3ByaXZhdGUnO1xyXG5pbXBvcnQgeyBNaXNzaW5nQ2xhc3MgfSBmcm9tICcuLi9lbmdpbmUvZWRpdG9yLWV4dGVuZHMvbWlzc2luZy1yZXBvcnRlci9taXNzaW5nLWNsYXNzLXJlcG9ydGVyJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1cmwycGF0aCh1cmw6IHN0cmluZykge1xyXG4gICAgaWYgKGlzQWJzb2x1dGUodXJsKSkge1xyXG4gICAgICAgIHJldHVybiB1cmw7XHJcbiAgICB9XHJcbiAgICAvLyDmlbDmja7lupPlnLDlnYDovazmjaJcclxuICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnZGI6Ly8nKSkge1xyXG4gICAgICAgIHJldHVybiBxdWVyeVBhdGgodXJsKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gVXRpbHMuUGF0aC5yZXNvbHZlVG9SYXcodXJsKTtcclxufVxyXG5cclxuLyoqXHJcbiog5bCG5pe26Ze05oiz6L2s5Li65Y+v6ZiF6K+755qE5pe26Ze05L+h5oGvXHJcbiovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50TG9jYWxUaW1lKCkge1xyXG4gICAgY29uc3QgdGltZSA9IG5ldyBEYXRlKCk7XHJcbiAgICByZXR1cm4gdGltZS50b0xvY2FsZURhdGVTdHJpbmcoKS5yZXBsYWNlKC9cXC8vZywgJy0nKSArICcgJyArIHRpbWUudG9UaW1lU3RyaW5nKCkuc2xpY2UoMCwgNSkucmVwbGFjZSgvOi9nLCAnLScpO1xyXG59XHJcbi8qKlxyXG4gKiDojrflj5blvZPliY3lhoXlrZjljaDnlKhcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRNZW1vcnlTaXplKCkge1xyXG4gICAgY29uc3QgbWVtb3J5ID0gcHJvY2Vzcy5tZW1vcnlVc2FnZSgpO1xyXG4gICAgZnVuY3Rpb24gZm9ybWF0KGJ5dGVzOiBudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gKGJ5dGVzIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMikgKyAnTUInO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuICdQcm9jZXNzOiBoZWFwVG90YWwgJyArIGZvcm1hdChtZW1vcnkuaGVhcFRvdGFsKSArICcgaGVhcFVzZWQgJyArIGZvcm1hdChtZW1vcnkuaGVhcFVzZWQpICsgJyByc3MgJyArIGZvcm1hdChtZW1vcnkucnNzKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWwhiB1cmwg6L2s5oiQIHV1aWRcclxuICogQHBhcmFtIHVybCBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1cmwydXVpZCh1cmw6IHN0cmluZykge1xyXG4gICAgY29uc3Qgc3ViQXNzZXROYW1lOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgbGV0IHV1aWQgPSB1cmw7XHJcbiAgICBsZXQgd1VVSUQgPSAnJztcclxuICAgIHdoaWxlICghKHdVVUlEID0gcXVlcnlVVUlEKHV1aWQpKSAmJiB1dWlkICE9PSAnZGI6LycpIHtcclxuICAgICAgICB1dWlkID0gdXVpZC5yZXBsYWNlKC9cXC8oW14vXSopJC8sIChhbGw6IHN0cmluZywgbmFtZTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIHN1YkFzc2V0TmFtZS5zcGxpY2UoMCwgMCwgZGJVdGlscy5uYW1lVG9JZChuYW1lKSk7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGlmICh3VVVJRCkge1xyXG4gICAgICAgIGNvbnN0IGFzc2V0ID0gZGJRdWVyeUFzc2V0KHV1aWQpO1xyXG4gICAgICAgIGlmICghYXNzZXQgfHwgKGFzc2V0LmlzRGlyZWN0b3J5KCkgJiYgc3ViQXNzZXROYW1lLmxlbmd0aCA+IDApKSB7XHJcbiAgICAgICAgICAgIHV1aWQgPSAnJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB1dWlkID0gYXNzZXQudXVpZDtcclxuICAgICAgICAgICAgaWYgKHN1YkFzc2V0TmFtZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB1dWlkICs9ICdAJyArIHN1YkFzc2V0TmFtZS5qb2luKCdAJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHV1aWQgPSAnJztcclxuICAgIH1cclxuICAgIHJldHVybiB1dWlkO1xyXG59XHJcblxyXG4vLyDmo4Dmn6XmmK/lkKbmmK/mianlsZXlkI3nmoTmraPliJnliKTmlq1cclxuY29uc3QgZXh0bmFtZVJleCA9IC9eXFwuLztcclxuXHJcbi8qKlxyXG4gKiDmo4Dmn6XkuIDkuKrovpPlhaXmlofku7blkI3mmK/lkKbmmK/mianlsZXlkI1cclxuICogQHBhcmFtIGV4dE9yRmlsZVxyXG4gKi9cclxuZnVuY3Rpb24gaXNFeHRuYW1lKGV4dE9yRmlsZTogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gZXh0T3JGaWxlID09PSAnJyB8fCBleHRuYW1lUmV4LnRlc3QoZXh0T3JGaWxlKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIGFzc2V0REIg5YaFIGFzc2V0IOi1hOa6kOiHquW4pueahCBsaWJyYXJ5IOaYr+S4gOS4quaVsOe7hO+8jOmcgOimgei9rOaIkOWvueixoVxyXG4gKiBAcGFyYW0gYXNzZXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsaWJBcnIyT2JqKGFzc2V0OiBJQXNzZXQpIHtcclxuICAgIGNvbnN0IHJlc3VsdDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xyXG4gICAgZm9yIChjb25zdCBleHRuYW1lIG9mIGFzc2V0Lm1ldGEuZmlsZXMpIHtcclxuICAgICAgICBpZiAoaXNFeHRuYW1lKGV4dG5hbWUpKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdFtleHRuYW1lXSA9IGFzc2V0LmxpYnJhcnkgKyBleHRuYW1lO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdFtleHRuYW1lXSA9IHJlc29sdmUoYXNzZXQubGlicmFyeSwgZXh0bmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEV4dGVuZHNGcm9tQ0NUeXBlKGNjVHlwZTogc3RyaW5nKSB7XHJcbiAgICBpZiAoIWNjVHlwZSB8fCBjY1R5cGUgPT09ICdjYy5Bc3NldCcpIHtcclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHN1cGVyQ2xhc3MgPSBjYy5qcy5nZXRTdXBlcihjYy5qcy5nZXRDbGFzc0J5TmFtZShjY1R5cGUpKTtcclxuICAgIGNvbnN0IGV4dGVuZENsYXNzID0gW107XHJcbiAgICBsZXQgc3VwZXJDbGFzc05hbWUgPSBjYy5qcy5nZXRDbGFzc05hbWUoc3VwZXJDbGFzcyk7XHJcblxyXG4gICAgd2hpbGUgKHN1cGVyQ2xhc3NOYW1lICYmIChleHRlbmRDbGFzc1tleHRlbmRDbGFzcy5sZW5ndGggLSAxXSAhPT0gJ2NjLkFzc2V0JykpIHtcclxuICAgICAgICBleHRlbmRDbGFzcy5wdXNoKHN1cGVyQ2xhc3NOYW1lKTtcclxuICAgICAgICBzdXBlckNsYXNzID0gY2MuanMuZ2V0U3VwZXIoc3VwZXJDbGFzcyk7XHJcbiAgICAgICAgc3VwZXJDbGFzc05hbWUgPSBjYy5qcy5nZXRDbGFzc05hbWUoc3VwZXJDbGFzcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGV4dGVuZENsYXNzO1xyXG59XHJcblxyXG4vLyDmlbTnkIblh7rpnIDopoHlnKjliKDpmaTotYTmupDlkI7kvKDmkq3nmoTkuLvopoHkv6Hmga9cclxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5Bc3NldEluZm8oYXNzZXQ6IEFzc2V0IHwgVmlydHVhbEFzc2V0KSB7XHJcbiAgICBjb25zdCBpbmZvID0ge1xyXG4gICAgICAgIGZpbGU6IGFzc2V0LnNvdXJjZSxcclxuICAgICAgICB1dWlkOiBhc3NldC51dWlkLFxyXG4gICAgICAgIGxpYnJhcnk6IGxpYkFycjJPYmooYXNzZXQpLFxyXG4gICAgICAgIGltcG9ydGVyOiBhc3NldC5tZXRhLmltcG9ydGVyLFxyXG4gICAgfTtcclxuICAgIHJldHVybiBpbmZvO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgUFJPTUlTRV9TVEFURSA9IHtcclxuICAgIFBFTkRJTkc6ICdwZW5kaW5nJyxcclxuICAgIEZVTEZJTExFRDogJ2Z1bGZpbGxlZCcsXHJcbiAgICBSRUpFQ1RFRDogJ3JlamVjdGVkJyxcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWNpZGVQcm9taXNlU3RhdGUocHJvbWlzZTogUHJvbWlzZTxhbnk+KSB7XHJcbiAgICBjb25zdCB0ID0geyBuYW1lOiAndGVzdCcgfTtcclxuICAgIHJldHVybiBQcm9taXNlLnJhY2UoW3Byb21pc2UsIHRdKVxyXG4gICAgICAgIC50aGVuKHYgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKHYgPT09IHQpID8gUFJPTUlTRV9TVEFURS5QRU5ESU5HIDogUFJPTUlTRV9TVEFURS5GVUxGSUxMRUQ7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goKCkgPT4gUFJPTUlTRV9TVEFURS5SRUpFQ1RFRCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDliKDpmaTmlofku7ZcclxuICogQHBhcmFtIGZpbGVcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW1vdmVGaWxlKGZpbGU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgaWYgKCFleGlzdHNTeW5jKGZpbGUpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBVdGlscy5GaWxlLnRyYXNoSXRlbShmaWxlKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBhc3NldCBkYiByZW1vdmVGaWxlICR7ZmlsZX0gZmFpbCFgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDov5nkuKogdHJ5IOaYr+WuuemUme+8jOebrueahOaYr+WQkOaOieaKpemUme+8jOaKpemUmeeahOWOn+WboOaYr+mHjeWkjeaTjeS9nOS6hu+8jGRiIOWcqOWIt+aWsOeahOaXtuWAmeS5n+S8muWkhOeQhuS4u+aWh+S7tumFjeWll+eahCBtZXRhIOaWh+S7tlxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBtZXRhRmlsZSA9IGZpbGUgKyAnLm1ldGEnO1xyXG4gICAgICAgIGlmIChleGlzdHNTeW5jKG1ldGFGaWxlKSkge1xyXG4gICAgICAgICAgICBhd2FpdCBVdGlscy5GaWxlLnRyYXNoSXRlbShtZXRhRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAvLyBkbyBub3RoaW5nXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuXHJcbi8vIOm7mOiupOeahOW6j+WIl+WMlumAiemhuVxyXG5jb25zdCBkZWZhdWx0U2VyaWFsaXplT3B0aW9ucyA9IHtcclxuICAgIGNvbXByZXNzVXVpZDogdHJ1ZSwgLy8g5piv5ZCm5piv5L2c5Li65q2j5byP5omT5YyF5a+85Ye655qE5bqP5YiX5YyW5pON5L2cXHJcbiAgICBzdHJpbmdpZnk6IGZhbHNlLCAvLyDluo/liJfljJblh7rmnaXnmoTku6UganNvbiDlrZfnrKbkuLLlvaLlvI/ov5jmmK8ganNvbiDlr7nosaHmmL7npLrvvIzov5nkuKropoHlhpnmrbvnu5/kuIDvvIzlkKbliJnlr7kganNvbiDlgZrlpITnkIbnmoTml7blgJnpg73pnIDopoHlgZrnsbvlnovliKTmlq1cclxuICAgIGRvbnRTdHJpcERlZmF1bHQ6IGZhbHNlLFxyXG4gICAgdXNlQ0NPTjogZmFsc2UsXHJcbiAgICBrZWVwTm9kZVV1aWQ6IGZhbHNlLCAvLyDluo/liJfljJblkI7mmK/lkKbkv53nlZnoioLngrnnu4Tku7bnmoQgdXVpZCDmlbDmja5cclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVDb21waWxlZFdpdGhJbnN0YW5jZShpbnN0YW5jZTogYW55LCBvcHRpb25zOiBJU2VyaWFsaXplZE9wdGlvbnMgJiB7XHJcbiAgICB1c2VDQ09OQj86IGJvb2xlYW47XHJcbiAgICB1c2VDQ09OPzogYm9vbGVhbjtcclxufSk6IFNlcmlhbGl6ZWRBc3NldCB8IG51bGwge1xyXG4gICAgaWYgKCFpbnN0YW5jZSkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgLy8g6YeN5paw5Y+N5bqP5YiX5YyW5bm25L+d5a2YXHJcbiAgICByZXR1cm4gc2VyaWFsaXplQ29tcGlsZWQoXHJcbiAgICAgICAgaW5zdGFuY2UsXHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbihkZWZhdWx0U2VyaWFsaXplT3B0aW9ucywge1xyXG4gICAgICAgICAgICBjb21wcmVzc1V1aWQ6ICFvcHRpb25zLmRlYnVnLFxyXG4gICAgICAgICAgICBkZWJ1Zzogb3B0aW9ucy5kZWJ1ZyxcclxuICAgICAgICAgICAgdXNlQ0NPTjogb3B0aW9ucy51c2VDQ09OQixcclxuICAgICAgICAgICAgbm9OYXRpdmVEZXA6ICFpbnN0YW5jZS5fbmF0aXZlLCAvLyDooajmmI7or6XotYTmupDmmK/lkKblrZjlnKjljp/nlJ/kvp3otZbvvIzov5nkuKrlrZfmrrXlnKjov5DooYzml7bkvJrlvbHlk40gcHJlbG9hZCDnm7jlhbPmjqXlj6PnmoTooajnjrBcclxuICAgICAgICB9KSxcclxuICAgICkgYXMgKHN0cmluZyB8IENDT04gfCBvYmplY3QpO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UmF3SW5zdGFuY2VGcm9tSW1wb3J0RmlsZShwYXRoOiBzdHJpbmcsIGFzc2V0SW5mbzogeyB1dWlkOiBzdHJpbmcsIHVybDogc3RyaW5nIH0pIHtcclxuICAgIGNvbnN0IGRhdGEgPSBwYXRoLmVuZHNXaXRoKCcuanNvbicpID8gYXdhaXQgcmVhZEpTT04ocGF0aCkgOiBhd2FpdCB0cmFuc2Zvcm1DQ09OKHBhdGghKTtcclxuICAgIGNvbnN0IHJlc3VsdDoge1xyXG4gICAgICAgIGFzc2V0OiBDQ0Fzc2V0IHwgbnVsbDtcclxuICAgICAgICBkZXRhaWw6IERldGFpbHMgfCBudWxsO1xyXG4gICAgfSA9IHtcclxuICAgICAgICBhc3NldDogbnVsbCxcclxuICAgICAgICBkZXRhaWw6IG51bGwsXHJcbiAgICB9O1xyXG4gICAgY29uc3QgeyBkZXNlcmlhbGl6ZSB9ID0gYXdhaXQgaW1wb3J0KCdjYycpO1xyXG4gICAgY29uc3QgZGVzZXJpYWxpemVEZXRhaWxzID0gbmV3IGRlc2VyaWFsaXplLkRldGFpbHMoKTtcclxuICAgIC8vIGRldGFpbCDph4zpnaLnmoTmlbDnu4TliIbliKvkuIDkuIDlr7nlupTvvIzlubbkuJTmjIflkJEgYXNzZXQg5L6d6LWW6LWE5rqQ55qE5a+56LGh77yM5LiN5Y+v6ZqP5oSP5pu05pS5IC8g5o6S5bqPXHJcbiAgICBkZXNlcmlhbGl6ZURldGFpbHMucmVzZXQoKTtcclxuICAgIE1pc3NpbmdDbGFzcy5oYXNNaXNzaW5nQ2xhc3MgPSBmYWxzZTtcclxuICAgIGNvbnN0IGRlc2VyaWFsaXplZEFzc2V0ID0gZGVzZXJpYWxpemUoZGF0YSwgZGVzZXJpYWxpemVEZXRhaWxzLCB7XHJcbiAgICAgICAgY3JlYXRlQXNzZXRSZWZzOiB0cnVlLFxyXG4gICAgICAgIGlnbm9yZUVkaXRvck9ubHk6IHRydWUsXHJcbiAgICAgICAgY2xhc3NGaW5kZXI6IE1pc3NpbmdDbGFzcy5jbGFzc0ZpbmRlcixcclxuICAgIH0pIGFzIENDQXNzZXQ7XHJcbiAgICBpZiAoIWRlc2VyaWFsaXplZEFzc2V0KSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgICAgaTE4bi50KCdidWlsZGVyLmVycm9yLmRlc2VyaWFsaXplX2ZhaWxlZCcsIHtcclxuICAgICAgICAgICAgICAgIHVybDogYHthc3NldCgke2Fzc2V0SW5mby51cmx9KX1gLFxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICApO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgICAvLyByZXBvcnRNaXNzaW5nQ2xhc3Mg5Lya5qC55o2uIF91dWlkIOadpeWBmuWIpOaWre+8jOmcgOimgeWcqOiwg+eUqCByZXBvcnRNaXNzaW5nQ2xhc3Mg5LmL5YmN6LWL5YC8XHJcbiAgICBkZXNlcmlhbGl6ZWRBc3NldC5fdXVpZCA9IGFzc2V0SW5mby51dWlkO1xyXG5cclxuICAgIC8vIGlmIChNaXNzaW5nQ2xhc3MuaGFzTWlzc2luZ0NsYXNzICYmICF0aGlzLmhhc01pc3NpbmdDbGFzc1V1aWRzLmhhcyhhc3NldC51dWlkKSkge1xyXG4gICAgLy8gICAgIE1pc3NpbmdDbGFzcy5yZXBvcnRNaXNzaW5nQ2xhc3MoZGVzZXJpYWxpemVkQXNzZXQpO1xyXG4gICAgLy8gICAgIHRoaXMuaGFzTWlzc2luZ0NsYXNzVXVpZHMuYWRkKGFzc2V0LnV1aWQpO1xyXG4gICAgLy8gfVxyXG4gICAgLy8g5riF56m657yT5a2Y77yM6Ziy5q2i5YaF5a2Y5rOE5ryPXHJcbiAgICBNaXNzaW5nQ2xhc3MucmVzZXQoKTtcclxuICAgIC8vIOmihOiniOaXtuWPqumcgOaJvuWHuuS+nei1lueahOi1hOa6kO+8jOaXoOmcgOe8k+WtmCBhc3NldFxyXG4gICAgLy8g5qOA5p+l5Lul5Y+K5p+l5om+5a+55bqU6LWE5rqQ77yM5bm26L+U5Zue57uZ5a+55bqUIGFzc2V0IOaVsOaNrlxyXG4gICAgLy8gY29uc3QgbWlzc2luZ0Fzc2V0czogc3RyaW5nW10gPSBbXTtcclxuICAgIC8vIOagueaNrui/meS4quaWueazleWIhumFjeWBh+eahOi1hOa6kOWvueixoSwg56Gu5L+d5bqP5YiX5YyW5pe26LWE5rqQ6IO96KKr6YeN5paw5bqP5YiX5YyW5oiQIHV1aWRcclxuICAgIC8vIGNvbnN0IHRlc3QgPSB0aGlzO1xyXG4gICAgLy8gbGV0IG1pc3NpbmdBc3NldFJlcG9ydGVyOiBhbnkgPSBudWxsO1xyXG4gICAgLy8gZGVzZXJpYWxpemVEZXRhaWxzLmFzc2lnbkFzc2V0c0J5KGZ1bmN0aW9uKHV1aWQ6IHN0cmluZywgb3B0aW9uczogeyBvd25lcjogb2JqZWN0OyBwcm9wOiBzdHJpbmc7IHR5cGU6IEZ1bmN0aW9uIH0pIHtcclxuICAgIC8vIGNvbnN0IGFzc2V0ID0gdGVzdC5nZXRBc3NldCh1dWlkKTtcclxuICAgIC8vIGlmIChhc3NldCkge1xyXG4gICAgLy8gICAgIHJldHVybiBFZGl0b3JFeHRlbmRzLnNlcmlhbGl6ZS5hc0Fzc2V0KHV1aWQpO1xyXG4gICAgLy8gfSBlbHNlIHtcclxuICAgIC8vICAgICAvLyBpZiAoIW1pc3NpbmdBc3NldHMuaW5jbHVkZXModXVpZCkpIHtcclxuICAgIC8vICAgICAvLyAgICAgbWlzc2luZ0Fzc2V0cy5wdXNoKHV1aWQpO1xyXG4gICAgLy8gICAgIC8vIHRlc3QuaGFzTWlzc2luZ0Fzc2V0c1V1aWRzLmFkZCh1dWlkKTtcclxuICAgIC8vICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLm93bmVyKSB7XHJcbiAgICAvLyAgICAgICAgIG1pc3NpbmdBc3NldFJlcG9ydGVyID0gbWlzc2luZ0Fzc2V0UmVwb3J0ZXIgfHwgbmV3IEVkaXRvckV4dGVuZHMuTWlzc2luZ1JlcG9ydGVyLm9iamVjdChkZXNlcmlhbGl6ZWRBc3NldCk7XHJcbiAgICAvLyAgICAgICAgIG1pc3NpbmdBc3NldFJlcG9ydGVyLm91dHB1dExldmVsID0gJ3dhcm4nO1xyXG4gICAgLy8gICAgICAgICBtaXNzaW5nQXNzZXRSZXBvcnRlci5zdGFzaEJ5T3duZXIob3B0aW9ucy5vd25lciwgb3B0aW9ucy5wcm9wLCBFZGl0b3JFeHRlbmRzLnNlcmlhbGl6ZS5hc0Fzc2V0KHV1aWQsIG9wdGlvbnMudHlwZSkpO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vICAgICAvLyB9XHJcbiAgICAvLyAgICAgLy8gcmVtb3ZlIGRlbGV0ZWQgYXNzZXQgcmVmZXJlbmNlXHJcbiAgICAvLyAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAvLyB9XHJcbiAgICAvLyB9KTtcclxuICAgIC8vIGlmIChtaXNzaW5nQXNzZXRSZXBvcnRlcikge1xyXG4gICAgLy8gICAgIG1pc3NpbmdBc3NldFJlcG9ydGVyLnJlcG9ydEJ5T3duZXIoKTtcclxuICAgIC8vIH1cclxuICAgIC8vIGlmIChtaXNzaW5nQXNzZXRzLmxlbmd0aCA+IDApIHtcclxuICAgIC8vICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAvLyAgICAgICAgIGkxOG4udCgnYnVpbGRlci5lcnJvci5yZXF1aXJlZF9hc3NldF9taXNzaW5nJywge1xyXG4gICAgLy8gICAgICAgICAgICAgdXJsOiBge2Fzc2V0KCR7YXNzZXQudXJsfSl9YCxcclxuICAgIC8vICAgICAgICAgICAgIHV1aWQ6IG1pc3NpbmdBc3NldHMuam9pbignXFxuICcpLFxyXG4gICAgLy8gICAgICAgICB9KSxcclxuICAgIC8vICAgICApO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9jb2Nvcy1jcmVhdG9yLzNkLXRhc2tzL2lzc3Vlcy82MDQyIOWkhOeQhiBwcmVmYWIg5LiOIHNjZW5lIOWQjeensOWQjOatpemXrumimFxyXG4gICAgLy8gaWYgKFsnY2MuU2NlbmVBc3NldCcsICdjYy5QcmVmYWInXS5pbmNsdWRlcyhNYW5hZ2VyLmFzc2V0TWFuYWdlci5xdWVyeUFzc2V0UHJvcGVydHkoYXNzZXQsICd0eXBlJykpKSB7XHJcbiAgICAvLyAgICAgZGVzZXJpYWxpemVkQXNzZXQubmFtZSA9IGJhc2VuYW1lKGFzc2V0LnNvdXJjZSwgZXh0bmFtZShhc3NldC5zb3VyY2UpKTtcclxuICAgIC8vIH1cclxuXHJcbiAgICByZXN1bHQuYXNzZXQgPSBkZXNlcmlhbGl6ZWRBc3NldDtcclxuICAgIHJlc3VsdC5kZXRhaWwgPSBkZXNlcmlhbGl6ZURldGFpbHM7XHJcbiAgICAvLyB0aGlzLmRlcGVuZFthc3NldC51dWlkXSA9IFsuLi5uZXcgU2V0KGRlc2VyaWFsaXplRGV0YWlscy51dWlkTGlzdCldIGFzIHN0cmluZ1tdO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB0cmFuc2Zvcm1DQ09OKHBhdGg6IHN0cmluZykge1xyXG4gICAgY29uc3QgYnVmZmVyID0gYXdhaXQgcmVhZEZpbGUocGF0aCk7XHJcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlci5idWZmZXIsIGJ1ZmZlci5ieXRlT2Zmc2V0LCBidWZmZXIuYnl0ZUxlbmd0aCk7XHJcbiAgICBjb25zdCB7IGRlY29kZUNDT05CaW5hcnkgfSA9IGF3YWl0IGltcG9ydCgnY2MvZWRpdG9yL3NlcmlhbGl6YXRpb24nKTtcclxuICAgIHJldHVybiBkZWNvZGVDQ09OQmluYXJ5KGJ5dGVzKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlcmlhbGl6ZUNvbXBpbGVkKGFzc2V0OiBJQXNzZXQsIG9wdGlvbnM6IElTZXJpYWxpemVkT3B0aW9ucykge1xyXG4gICAgY29uc3Qgb3V0cHV0RGF0YSA9IGVuc3VyZU91dHB1dERhdGEoYXNzZXQpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZ2V0UmF3SW5zdGFuY2VGcm9tSW1wb3J0RmlsZShvdXRwdXREYXRhLmltcG9ydCEucGF0aCwge1xyXG4gICAgICAgIHV1aWQ6IGFzc2V0LnV1aWQsXHJcbiAgICAgICAgdXJsOiBhc3NldC51cmwsXHJcbiAgICB9KTtcclxuICAgIGlmICghcmVzdWx0Py5hc3NldCkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlcmlhbGl6ZUNvbXBpbGVkV2l0aEluc3RhbmNlKHJlc3VsdC5hc3NldCwgb3B0aW9ucyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVPdXRwdXREYXRhKGFzc2V0OiBJQXNzZXQpIHtcclxuICAgIC8vIDMuOC4zIOS7peS4iueJiOacrO+8jOi1hOa6kOWvvOWFpeWQjueahOaVsOaNruWwhuS8muiusOW9leWcqCBvdXRwdXREYXRhIOWtl+auteWGhemDqFxyXG4gICAgbGV0IG91dHB1dERhdGE6IElFeHBvcnREYXRhID0gYXNzZXQuZ2V0RGF0YSgnb3V0cHV0Jyk7XHJcbiAgICBpZiAob3V0cHV0RGF0YSkge1xyXG4gICAgICAgIHJldHVybiBvdXRwdXREYXRhO1xyXG4gICAgfVxyXG4gICAgb3V0cHV0RGF0YSA9IHtcclxuICAgICAgICBpbXBvcnQ6IHtcclxuICAgICAgICAgICAgdHlwZTogJ2pzb24nLFxyXG4gICAgICAgICAgICBwYXRoOiBhc3NldC5saWJyYXJ5ICsgJy5qc29uJyxcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxuICAgIGxldCBpbXBvcnRQYXRoOiBzdHJpbmc7XHJcbiAgICAvLyDnlJ/miJDpu5jorqTnmoQgZGVidWcg54mI5pys5a+85Ye65pWw5o2uXHJcbiAgICBjb25zdCBuYXRpdmVQYXRoOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XHJcbiAgICBhc3NldC5tZXRhLmZpbGVzLmZvckVhY2goKGV4dE5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIGlmIChbJy5qc29uJywgJy5jY29uYiddLmluY2x1ZGVzKGV4dE5hbWUpKSB7XHJcbiAgICAgICAgICAgIG91dHB1dERhdGEuaW1wb3J0LnBhdGggPSBhc3NldC5saWJyYXJ5ICsgZXh0TmFtZTtcclxuICAgICAgICAgICAgaWYgKGV4dE5hbWUgPT09ICcuY2NvbmInKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXREYXRhLmltcG9ydC50eXBlID0gJ2J1ZmZlcic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5pen6KeE5YiZ77yMX18g5byA5aS055qE6LWE5rqQ5LiN5Zyo6L+Q6KGM5pe25L2/55SoXHJcbiAgICAgICAgaWYgKGV4dE5hbWUuc3RhcnRzV2l0aCgnLl9fXycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmF0aXZlUGF0aFtleHROYW1lXSA9IGFzc2V0LmxpYnJhcnkgKyBleHROYW1lO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKE9iamVjdC5rZXlzKG5hdGl2ZVBhdGgpLmxlbmd0aCkge1xyXG4gICAgICAgIG91dHB1dERhdGEubmF0aXZlID0gbmF0aXZlUGF0aDtcclxuICAgIH1cclxuICAgIGFzc2V0LnNldERhdGEoJ291dHB1dCcsIG91dHB1dERhdGEpO1xyXG4gICAgcmV0dXJuIG91dHB1dERhdGE7XHJcbn1cclxuIl19