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
exports.quickSpawn = exports.getBuildPath = void 0;
exports.compareOptions = compareOptions;
exports.pickDifferentOptions = pickDifferentOptions;
exports.copyPaths = copyPaths;
exports.recursively = recursively;
exports.removeDbHeader = removeDbHeader;
exports.dbUrlToRawPath = dbUrlToRawPath;
exports.relativeUrl = relativeUrl;
exports.isInstallNodeJs = isInstallNodeJs;
exports.getFileSizeDeep = getFileSizeDeep;
exports.copyDirSync = copyDirSync;
exports.compressUuid = compressUuid;
exports.decompressUuid = decompressUuid;
exports.getUuidFromPath = getUuidFromPath;
exports.nameToSubId = nameToSubId;
exports.getResImportPath = getResImportPath;
exports.getResRawAssetsPath = getResRawAssetsPath;
exports.toBabelModules = toBabelModules;
exports.transformCode = transformCode;
exports.compileJS = compileJS;
exports.createBundle = createBundle;
exports.appendMd5ToPaths = appendMd5ToPaths;
exports.calcMd5 = calcMd5;
exports.patchMd5ToPath = patchMd5ToPath;
exports.getLibraryDir = getLibraryDir;
exports.queryImageAssetFromSubAssetByUuid = queryImageAssetFromSubAssetByUuid;
const path_1 = require("path");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const babel = __importStar(require("@babel/core"));
const preset_env_1 = __importDefault(require("@babel/preset-env"));
const sub_process_manager_1 = require("../../worker-pools/sub-process-manager");
const utils_1 = __importDefault(require("../../../../base/utils"));
const builder_config_1 = __importDefault(require("../../../share/builder-config"));
const global_1 = require("../../../share/global");
var utils_2 = require("../../../share/utils");
Object.defineProperty(exports, "getBuildPath", { enumerable: true, get: function () { return utils_2.getBuildPath; } });
// 当前文件对外暴露的接口是直接对用户公开的，对内使用的工具接口请在其他文件夹内放置
/**
 * 比对两个 options 选项是否一致，不一致的数据需要打印出来
 * @param oldOptions 旧选项
 * @param newOptions 新选项
 * @returns 如果两个选项一致返回 true，否则返回 false
 */
function compareOptions(oldOptions, newOptions) {
    const res = pickDifferentOptions(oldOptions, newOptions);
    if (res.isEqual) {
        return true;
    }
    console.log(`different options: ${Object.keys(res.diff).map((key) => `${key}: ${res.diff[key].old} -> ${res.diff[key].new}`)}`);
    return false;
}
function pickDifferentOptions(oldOptions, newOptions, path = '', diff = {}) {
    let isEqual = true;
    // Helper function to log differences
    const collectDifference = (key, oldValue, newValue) => {
        diff[path ? `${path}.${key}` : key] = {
            new: newValue,
            old: oldValue,
        };
        isEqual = false;
    };
    // Check if both inputs are objects
    if (typeof oldOptions !== 'object' || typeof newOptions !== 'object') {
        if (oldOptions !== newOptions) {
            collectDifference('', oldOptions, newOptions);
        }
        return {
            diff,
            isEqual,
        };
    }
    // Get all keys from both objects
    const allKeys = new Set([...Object.keys(oldOptions), ...Object.keys(newOptions)]);
    for (const key of allKeys) {
        const oldValue = oldOptions[key];
        const newValue = newOptions[key];
        // If both values are objects, recursively compare them
        if (typeof oldValue === 'object' && typeof newValue === 'object' && oldValue !== null && newValue !== null) {
            if (!pickDifferentOptions(oldValue, newValue, path ? `${path}.${key}` : key, diff).isEqual) {
                isEqual = false;
            }
        }
        else if (oldValue !== newValue) {
            collectDifference(key, oldValue, newValue);
        }
    }
    return {
        diff,
        isEqual,
    };
}
function copyPaths(paths) {
    return Promise.all(paths.map((path) => (0, fs_extra_1.copy)(path.src, path.dest)));
}
/**
 * 递归遍历这个资源上的所有子资源
 * @param asset
 * @param handle
 */
function recursively(asset, handle) {
    if (!asset.subAssets) {
        return;
    }
    handle && handle(asset);
    Object.keys(asset.subAssets).forEach((name) => {
        const subAsset = asset.subAssets[name];
        recursively(subAsset, handle);
    });
}
const DB_PROTOCOL_HEADER = 'db://';
// 去除 db:// 的路径
function removeDbHeader(path) {
    if (!path) {
        return '';
    }
    if (!path.startsWith(DB_PROTOCOL_HEADER)) {
        console.error('unknown path to build: ' + path);
        return path;
    }
    // 获取剔除 db:// 后的文件目录
    const mountPoint = path.slice(DB_PROTOCOL_HEADER.length);
    return mountPoint;
}
/**
 * 将 db 开头的 url 转为项目里的实际 url
 * @param url db://
 */
function dbUrlToRawPath(url) {
    return (0, path_1.join)(builder_config_1.default.projectRoot, removeDbHeader(url));
}
/**
 * 获取相对路径，并且路径分隔符做转换处理
 * @param from
 * @param to
 */
function relativeUrl(from, to) {
    return (0, path_1.relative)(from, to).replace(/\\/g, '/');
}
/**
 * 检查是否安装了 node.js
 */
function isInstallNodeJs() {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)('node -v', {
            env: process.env,
        }, (error) => {
            if (!error) {
                // 检查成功
                resolve(true);
                return;
            }
            console.error(error);
            resolve(false);
        });
    });
}
/**
 * 获取文件夹或者文件大小
 */
function getFileSizeDeep(path) {
    if (!(0, fs_1.existsSync)(path)) {
        return 0;
    }
    const stat = (0, fs_1.statSync)(path);
    if (!stat.isDirectory()) {
        return stat.size;
    }
    let result = 0;
    // 文件夹
    const files = (0, fs_1.readdirSync)(path);
    files.forEach((fileName) => {
        result += getFileSizeDeep((0, path_1.join)(path, fileName));
    });
    return result;
}
/**
 * 拷贝文件夹
 * @param path
 * @param dest
 */
function copyDirSync(path, dest) {
    if (!(0, fs_1.existsSync)(path)) {
        return 0;
    }
    const stat = (0, fs_1.statSync)(path);
    if (!stat.isDirectory()) {
        (0, fs_extra_1.ensureDirSync)((0, path_1.dirname)(dest));
        return (0, fs_1.copyFileSync)(path, dest);
    }
    // 文件夹
    const files = (0, fs_1.readdirSync)(path);
    (0, fs_extra_1.ensureDirSync)(dest);
    files.forEach((fileName) => {
        const file = (0, path_1.join)(path, fileName);
        const fileDest = (0, path_1.join)(dest, fileName);
        copyDirSync(file, fileDest);
    });
}
// 注意：目前 utils 用的是 UUID，EditorExtends 用的是 Uuid 
function compressUuid(uuid, min = true) {
    return utils_1.default.UUID.compressUUID(uuid, min);
}
function decompressUuid(uuid) {
    return utils_1.default.UUID.decompressUUID(uuid);
}
/**
 * 从 library 路径获取 uuid
 * @param path
 */
function getUuidFromPath(path) {
    return utils_1.default.UUID.getUuidFromLibPath(path);
}
/**
 * 获取某个名字对应的短 uuid
 * @param name
 * @returns
 */
function nameToSubId(name) {
    return utils_1.default.UUID.nameToSubId(name);
}
/**
 * 拼接成 import 路径
 * @param dest
 * @param uuid
 * @param extName 指定 import 的文件格式，默认 .json
 */
function getResImportPath(dest, uuid, extName = '.json') {
    return (0, path_1.join)(dest, global_1.BuildGlobalInfo.IMPORT_HEADER, uuid.substr(0, 2), uuid + extName);
}
/**
 * 拼接成 raw-assets 路径
 * @param dest
 * @param uuid
 * @param extName 路径后缀
 */
function getResRawAssetsPath(dest, uuid, extName) {
    return (0, path_1.join)(dest, global_1.BuildGlobalInfo.NATIVE_HEADER, uuid.substr(0, 2), uuid + extName);
}
function toBabelModules(modules) {
    return modules === 'esm' ? false : modules;
}
/**
 * 脚本编译
 * TODO 此类编译脚本相关逻辑，后续需要迁移到进程管理器内调用
 * @param code
 * @param options
 */
async function transformCode(code, options) {
    const { loose, importMapFormat } = options;
    const babelFileResult = await babel.transformAsync(code, {
        presets: [[preset_env_1.default, {
                    modules: importMapFormat ? toBabelModules(importMapFormat) : undefined,
                    loose: loose !== null && loose !== void 0 ? loose : true,
                }]],
    });
    if (!babelFileResult || !babelFileResult.code) {
        throw new Error('Failed to transform!');
    }
    return babelFileResult.code;
}
/**
 * 编译脚本
 * @param contents
 * @param path
 */
function compileJS(contents, path) {
    let result;
    try {
        const Babel = require('@babel/core');
        result = Babel.transform(contents, {
            ast: false,
            highlightCode: false,
            sourceMaps: false,
            compact: false,
            filename: path, // search path for babelrc
            presets: [
                require('@babel/preset-env'),
            ],
            plugins: [
                // make sure that transform-decorators-legacy comes before transform-class-properties.
                [
                    require('@babel/plugin-proposal-decorators'),
                    { legacy: true },
                ],
                [
                    require('@babel/plugin-proposal-class-properties'),
                    { loose: true },
                ],
                [
                    require('babel-plugin-add-module-exports'),
                ],
                [
                    require('@babel/plugin-proposal-export-default-from'),
                ],
            ],
        });
    }
    catch (err) {
        err.stack = `Compile ${path} error: ${err.stack}`;
        throw err;
    }
    return result.code;
}
async function createBundle(src, dest, options) {
    return new Promise((resolve, reject) => {
        const babelify = require('babelify');
        const browserify = require('browserify');
        const bundler = browserify(src);
        if (options && options.excludes) {
            options.excludes.forEach(function (path) {
                bundler.exclude(path);
            });
        }
        (0, fs_extra_1.ensureDirSync)((0, path_1.dirname)(dest));
        bundler.transform(babelify, {
            presets: [require('@babel/preset-env')],
            plugins: [require('@babel/plugin-proposal-class-properties')],
        })
            .bundle((err, buffer) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            (0, fs_1.writeFileSync)(dest, new Uint8Array(buffer), 'utf8');
            resolve();
        });
    });
}
const HASH_LEN = 5;
/**
 * 给某些路径文件添加 md5 后缀
 * @param paths
 */
async function appendMd5ToPaths(paths) {
    if (!Array.isArray(paths)) {
        return null;
    }
    // 参与 md5 计算的数据需要排序，且不能并发否则会影响数据计算
    paths = paths.sort();
    const dataArr = [];
    for (const path of paths) {
        let data;
        try {
            data = await (0, fs_extra_1.readFile)(path);
            dataArr.push(data);
        }
        catch (error) {
            console.error(error);
            console.error(`readFile {link(${path})}`);
            continue;
        }
    }
    const hash = calcMd5(dataArr);
    const resultPaths = [];
    await Promise.all(paths.map((path, i) => {
        // 非资源类替换名字
        resultPaths[i] = patchMd5ToPath(path, hash);
        // 计算完 hash 值之后进行改名
        return (0, fs_extra_1.rename)(path, resultPaths[i]);
    }));
    return {
        paths: resultPaths,
        hash,
    };
}
/**
 * 计算某个数据的 md5 值
 * @param data
 */
function calcMd5(data) {
    data = Array.isArray(data) ? data : [data];
    const { createHash } = require('crypto');
    const cryptoHash = createHash('md5');
    data.forEach((dataItem) => {
        cryptoHash.update(dataItem);
    });
    return cryptoHash.digest('hex').slice(0, HASH_LEN);
}
/**
 * 将某个 hash 值添加到某个路径上
 * @param targetPath
 * @param hash
 * @returns
 */
function patchMd5ToPath(targetPath, hash) {
    const parseObj = (0, path_1.parse)(targetPath);
    parseObj.base = '';
    parseObj.name += `.${hash}`;
    return (0, path_1.format)(parseObj);
}
/**
 * 获取一个资源 library 地址里的 library 文件夹绝对路径
 * @param libraryPath
 * @returns
 */
function getLibraryDir(libraryPath) {
    // library 地址可能在项目内也可能在其他任何位置
    // 此处参考了 uuid 模块的 getUuidFromLibPath 所用正则来获取 library 以及之前的路径
    const matchInfo = libraryPath.match(/(.*)[/\\][0-9a-fA-F]{2}[/\\][0-9a-fA-F-]{8,}((@[0-9a-fA-F]{5,})+)?.*/);
    return matchInfo[1];
}
// 此工具方法走 workerManager 管理，方便对开启的进程做中断
exports.quickSpawn = sub_process_manager_1.workerManager.quickSpawn.bind(sub_process_manager_1.workerManager);
function queryImageAssetFromSubAssetByUuid(subAssetUuid) {
    return subAssetUuid.split('@')[0];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3dvcmtlci9idWlsZGVyL3V0aWxzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUJiLHdDQU9DO0FBRUQsb0RBOENDO0FBRUQsOEJBRUM7QUFPRCxrQ0FTQztBQUlELHdDQVdDO0FBTUQsd0NBRUM7QUFPRCxrQ0FFQztBQUtELDBDQWtCQztBQUtELDBDQWVDO0FBT0Qsa0NBaUJDO0FBR0Qsb0NBRUM7QUFFRCx3Q0FFQztBQU1ELDBDQUVDO0FBT0Qsa0NBRUM7QUFRRCw0Q0FFQztBQVFELGtEQUVDO0FBRUQsd0NBRUM7QUFRRCxzQ0FZQztBQU9ELDhCQW9DQztBQXFCRCxvQ0F5QkM7QUFXRCw0Q0FrQ0M7QUFNRCwwQkFRQztBQVFELHdDQUtDO0FBT0Qsc0NBS0M7QUFLRCw4RUFFQztBQS9iRCwrQkFBOEQ7QUFDOUQsaURBQXFDO0FBQ3JDLDJCQUFvRjtBQUNwRix1Q0FBaUU7QUFDakUsbURBQXFDO0FBQ3JDLG1FQUErQztBQUMvQyxnRkFBdUU7QUFFdkUsbUVBQTJDO0FBQzNDLG1GQUEwRDtBQUUxRCxrREFBd0Q7QUFFeEQsOENBQW9EO0FBQTNDLHFHQUFBLFlBQVksT0FBQTtBQUVyQiwyQ0FBMkM7QUFFM0M7Ozs7O0dBS0c7QUFDSCxTQUFnQixjQUFjLENBQUMsVUFBK0IsRUFBRSxVQUErQjtJQUMzRixNQUFNLEdBQUcsR0FBRyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDekQsSUFBSSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDZCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hJLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFFRCxTQUFnQixvQkFBb0IsQ0FBQyxVQUErQixFQUFFLFVBQStCLEVBQUUsSUFBSSxHQUFHLEVBQUUsRUFBRSxPQUErQyxFQUFFO0lBSS9KLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQztJQUNuQixxQ0FBcUM7SUFDckMsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLEdBQVcsRUFBRSxRQUFhLEVBQUUsUUFBYSxFQUFFLEVBQUU7UUFDcEUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHO1lBQ2xDLEdBQUcsRUFBRSxRQUFRO1lBQ2IsR0FBRyxFQUFFLFFBQVE7U0FDaEIsQ0FBQztRQUNGLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDcEIsQ0FBQyxDQUFDO0lBRUYsbUNBQW1DO0lBQ25DLElBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQ25FLElBQUksVUFBVSxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQzVCLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUNELE9BQU87WUFDSCxJQUFJO1lBQ0osT0FBTztTQUNWLENBQUM7SUFDTixDQUFDO0lBRUQsaUNBQWlDO0lBQ2pDLE1BQU0sT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFbEYsS0FBSyxNQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUN4QixNQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsTUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWpDLHVEQUF1RDtRQUN2RCxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLElBQUksUUFBUSxLQUFLLElBQUksSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDekcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN6RixPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLENBQUM7UUFDTCxDQUFDO2FBQU0sSUFBSSxRQUFRLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDL0IsaUJBQWlCLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMvQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE9BQU87UUFDSCxJQUFJO1FBQ0osT0FBTztLQUNWLENBQUM7QUFDTixDQUFDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLEtBQXNDO0lBQzVELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFBLGVBQUksRUFBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkUsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixXQUFXLENBQUMsS0FBYSxFQUFFLE1BQWdCO0lBQ3ZELElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDbkIsT0FBTztJQUNYLENBQUM7SUFDRCxNQUFNLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFFO1FBQ2xELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkMsV0FBVyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQztBQUNuQyxlQUFlO0FBQ2YsU0FBZ0IsY0FBYyxDQUFDLElBQVk7SUFDdkMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1IsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDO1FBQ3ZDLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDaEQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUNELG9CQUFvQjtJQUNwQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3pELE9BQU8sVUFBVSxDQUFDO0FBQ3RCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixjQUFjLENBQUMsR0FBVztJQUN0QyxPQUFPLElBQUEsV0FBSSxFQUFDLHdCQUFhLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsV0FBVyxDQUFDLElBQVksRUFBRSxFQUFVO0lBQ2hELE9BQU8sSUFBQSxlQUFRLEVBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDbEQsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsZUFBZTtJQUMzQixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ25DLElBQUEsb0JBQUksRUFDQSxTQUFTLEVBQ1Q7WUFDSSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUc7U0FDbkIsRUFDRCxDQUFDLEtBQVUsRUFBRSxFQUFFO1lBQ1gsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNULE9BQU87Z0JBQ1AsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNkLE9BQU87WUFDWCxDQUFDO1lBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkIsQ0FBQyxDQUNKLENBQUM7SUFDTixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLGVBQWUsQ0FBQyxJQUFZO0lBQ3hDLElBQUksQ0FBQyxJQUFBLGVBQVUsRUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUNELE1BQU0sSUFBSSxHQUFHLElBQUEsYUFBUSxFQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztRQUN0QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUNELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNmLE1BQU07SUFDTixNQUFNLEtBQUssR0FBRyxJQUFBLGdCQUFXLEVBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO1FBQ3ZCLE1BQU0sSUFBSSxlQUFlLENBQUMsSUFBQSxXQUFJLEVBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQWdCLFdBQVcsQ0FBQyxJQUFZLEVBQUUsSUFBWTtJQUNsRCxJQUFJLENBQUMsSUFBQSxlQUFVLEVBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNwQixPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFDRCxNQUFNLElBQUksR0FBRyxJQUFBLGFBQVEsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7UUFDdEIsSUFBQSx3QkFBYSxFQUFDLElBQUEsY0FBTyxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDN0IsT0FBTyxJQUFBLGlCQUFZLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFDRCxNQUFNO0lBQ04sTUFBTSxLQUFLLEdBQUcsSUFBQSxnQkFBVyxFQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLElBQUEsd0JBQWEsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUNwQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7UUFDdkIsTUFBTSxJQUFJLEdBQUcsSUFBQSxXQUFJLEVBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sUUFBUSxHQUFHLElBQUEsV0FBSSxFQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN0QyxXQUFXLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2hDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELCtDQUErQztBQUMvQyxTQUFnQixZQUFZLENBQUMsSUFBWSxFQUFFLEdBQUcsR0FBRyxJQUFJO0lBQ2pELE9BQU8sZUFBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFFRCxTQUFnQixjQUFjLENBQUMsSUFBWTtJQUN2QyxPQUFPLGVBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNDLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixlQUFlLENBQUMsSUFBWTtJQUN4QyxPQUFPLGVBQUssQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixXQUFXLENBQUMsSUFBWTtJQUNwQyxPQUFPLGVBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQWdCLGdCQUFnQixDQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsT0FBTyxHQUFHLE9BQU87SUFDMUUsT0FBTyxJQUFBLFdBQUksRUFBQyxJQUFJLEVBQUUsd0JBQWUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDO0FBQ3hGLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQWdCLG1CQUFtQixDQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsT0FBZTtJQUMzRSxPQUFPLElBQUEsV0FBSSxFQUFDLElBQUksRUFBRSx3QkFBZSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUM7QUFDeEYsQ0FBQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxPQUFpQjtJQUM1QyxPQUFPLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQy9DLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNJLEtBQUssVUFBVSxhQUFhLENBQUMsSUFBWSxFQUFFLE9BQTBCO0lBQ3hFLE1BQU0sRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBQzNDLE1BQU0sZUFBZSxHQUFHLE1BQU0sS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUU7UUFDckQsT0FBTyxFQUFFLENBQUMsQ0FBQyxvQkFBYyxFQUFFO29CQUN2QixPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7b0JBQ3RFLEtBQUssRUFBRSxLQUFLLEtBQUssSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJO2lCQUMzRCxDQUFDLENBQUM7S0FDTixDQUFDLENBQUM7SUFDSCxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzVDLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0QsT0FBTyxlQUFlLENBQUMsSUFBSSxDQUFDO0FBQ2hDLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsU0FBUyxDQUFDLFFBQWdCLEVBQUUsSUFBWTtJQUNwRCxJQUFJLE1BQU0sQ0FBQztJQUNYLElBQUksQ0FBQztRQUNELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNyQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUU7WUFDL0IsR0FBRyxFQUFFLEtBQUs7WUFDVixhQUFhLEVBQUUsS0FBSztZQUNwQixVQUFVLEVBQUUsS0FBSztZQUNqQixPQUFPLEVBQUUsS0FBSztZQUNkLFFBQVEsRUFBRSxJQUFJLEVBQUUsMEJBQTBCO1lBQzFDLE9BQU8sRUFBRTtnQkFDTCxPQUFPLENBQUMsbUJBQW1CLENBQUM7YUFDL0I7WUFDRCxPQUFPLEVBQUU7Z0JBQ0wsc0ZBQXNGO2dCQUN0RjtvQkFDSSxPQUFPLENBQUMsbUNBQW1DLENBQUM7b0JBQzVDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtpQkFDbkI7Z0JBQ0Q7b0JBQ0ksT0FBTyxDQUFDLHlDQUF5QyxDQUFDO29CQUNsRCxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7aUJBQ2xCO2dCQUNEO29CQUNJLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQztpQkFDN0M7Z0JBQ0Q7b0JBQ0ksT0FBTyxDQUFDLDRDQUE0QyxDQUFDO2lCQUN4RDthQUNKO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFDaEIsR0FBRyxDQUFDLEtBQUssR0FBRyxXQUFXLElBQUksV0FBVyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbEQsTUFBTSxHQUFHLENBQUM7SUFDZCxDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3ZCLENBQUM7QUFxQk0sS0FBSyxVQUFVLFlBQVksQ0FBQyxHQUFXLEVBQUUsSUFBWSxFQUFFLE9BQThCO0lBQ3hGLE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDekMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN6QyxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEMsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzlCLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSTtnQkFDbkMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFDRCxJQUFBLHdCQUFhLEVBQUMsSUFBQSxjQUFPLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM3QixPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtZQUN4QixPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUN2QyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMseUNBQXlDLENBQUMsQ0FBQztTQUNoRSxDQUFDO2FBQ0csTUFBTSxDQUFDLENBQUMsR0FBVSxFQUFFLE1BQWMsRUFBRSxFQUFFO1lBQ25DLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNaLE9BQU87WUFDWCxDQUFDO1lBQ0QsSUFBQSxrQkFBYSxFQUFDLElBQUksRUFBRSxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNwRCxPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBS25COzs7R0FHRztBQUNJLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxLQUFlO0lBQ2xELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDeEIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUNELGtDQUFrQztJQUNsQyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3JCLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNuQixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ3ZCLElBQUksSUFBSSxDQUFDO1FBQ1QsSUFBSSxDQUFDO1lBQ0QsSUFBSSxHQUFHLE1BQU0sSUFBQSxtQkFBUSxFQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JCLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLElBQUksSUFBSSxDQUFDLENBQUM7WUFDMUMsU0FBUztRQUNiLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLE1BQU0sV0FBVyxHQUFhLEVBQUUsQ0FBQztJQUNqQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ2IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNsQixXQUFXO1FBQ1gsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUMsbUJBQW1CO1FBQ25CLE9BQU8sSUFBQSxpQkFBTSxFQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4QyxDQUFDLENBQUMsQ0FDTCxDQUFDO0lBRUYsT0FBTztRQUNILEtBQUssRUFBRSxXQUFXO1FBQ2xCLElBQUk7S0FDUCxDQUFDO0FBQ04sQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQWdCLE9BQU8sQ0FBQyxJQUFnRDtJQUNwRSxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNDLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDekMsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtRQUN0QixVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdkQsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsY0FBYyxDQUFDLFVBQWtCLEVBQUUsSUFBWTtJQUMzRCxNQUFNLFFBQVEsR0FBRyxJQUFBLFlBQUssRUFBQyxVQUFVLENBQUMsQ0FBQztJQUNuQyxRQUFRLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNuQixRQUFRLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUM7SUFDNUIsT0FBTyxJQUFBLGFBQU0sRUFBQyxRQUFRLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQWdCLGFBQWEsQ0FBQyxXQUFtQjtJQUM3Qyw2QkFBNkI7SUFDN0IsNERBQTREO0lBQzVELE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsc0VBQXNFLENBQUMsQ0FBQztJQUM1RyxPQUFPLFNBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QixDQUFDO0FBRUQsc0NBQXNDO0FBQ3pCLFFBQUEsVUFBVSxHQUFHLG1DQUFhLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxtQ0FBYSxDQUFDLENBQUM7QUFFdkUsU0FBZ0IsaUNBQWlDLENBQUMsWUFBb0I7SUFDbEUsT0FBTyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBqb2luLCByZWxhdGl2ZSwgZGlybmFtZSwgZm9ybWF0LCBwYXJzZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBleGVjIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XHJcbmltcG9ydCB7IHN0YXRTeW5jLCByZWFkZGlyU3luYywgZXhpc3RzU3luYywgY29weUZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBjb3B5LCBlbnN1cmVEaXJTeW5jLCByZWFkRmlsZSwgcmVuYW1lIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgKiBhcyBiYWJlbCBmcm9tICdAYmFiZWwvY29yZSc7XHJcbmltcG9ydCBiYWJlbFByZXNldEVudiBmcm9tICdAYmFiZWwvcHJlc2V0LWVudic7XHJcbmltcG9ydCB7IHdvcmtlck1hbmFnZXIgfSBmcm9tICcuLi8uLi93b3JrZXItcG9vbHMvc3ViLXByb2Nlc3MtbWFuYWdlcic7XHJcbmltcG9ydCB7IElBc3NldCB9IGZyb20gJy4uLy4uLy4uLy4uL2Fzc2V0cy9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IHV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2Jhc2UvdXRpbHMnO1xyXG5pbXBvcnQgYnVpbGRlckNvbmZpZyBmcm9tICcuLi8uLi8uLi9zaGFyZS9idWlsZGVyLWNvbmZpZyc7XHJcbmltcG9ydCB7IElNb2R1bGVzLCBJVHJhbnNmb3JtT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBCdWlsZEdsb2JhbEluZm8gfSBmcm9tICcuLi8uLi8uLi9zaGFyZS9nbG9iYWwnO1xyXG5cclxuZXhwb3J0IHsgZ2V0QnVpbGRQYXRoIH0gZnJvbSAnLi4vLi4vLi4vc2hhcmUvdXRpbHMnO1xyXG5cclxuLy8g5b2T5YmN5paH5Lu25a+55aSW5pq06Zyy55qE5o6l5Y+j5piv55u05o6l5a+555So5oi35YWs5byA55qE77yM5a+55YaF5L2/55So55qE5bel5YW35o6l5Y+j6K+35Zyo5YW25LuW5paH5Lu25aS55YaF5pS+572uXHJcblxyXG4vKipcclxuICog5q+U5a+55Lik5LiqIG9wdGlvbnMg6YCJ6aG55piv5ZCm5LiA6Ie077yM5LiN5LiA6Ie055qE5pWw5o2u6ZyA6KaB5omT5Y2w5Ye65p2lXHJcbiAqIEBwYXJhbSBvbGRPcHRpb25zIOaXp+mAiemhuVxyXG4gKiBAcGFyYW0gbmV3T3B0aW9ucyDmlrDpgInpoblcclxuICogQHJldHVybnMg5aaC5p6c5Lik5Liq6YCJ6aG55LiA6Ie06L+U5ZueIHRydWXvvIzlkKbliJnov5Tlm54gZmFsc2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjb21wYXJlT3B0aW9ucyhvbGRPcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBuZXdPcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCByZXMgPSBwaWNrRGlmZmVyZW50T3B0aW9ucyhvbGRPcHRpb25zLCBuZXdPcHRpb25zKTtcclxuICAgIGlmIChyZXMuaXNFcXVhbCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coYGRpZmZlcmVudCBvcHRpb25zOiAke09iamVjdC5rZXlzKHJlcy5kaWZmKS5tYXAoKGtleSkgPT4gYCR7a2V5fTogJHtyZXMuZGlmZltrZXldLm9sZH0gLT4gJHtyZXMuZGlmZltrZXldLm5ld31gKX1gKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBpY2tEaWZmZXJlbnRPcHRpb25zKG9sZE9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIGFueT4sIG5ld09wdGlvbnM6IFJlY29yZDxzdHJpbmcsIGFueT4sIHBhdGggPSAnJywgZGlmZjogUmVjb3JkPHN0cmluZywgeyBuZXc6IGFueSwgb2xkOiBhbnkgfT4gPSB7fSk6IHtcclxuICAgIGlzRXF1YWw6IGJvb2xlYW47XHJcbiAgICBkaWZmOiBSZWNvcmQ8c3RyaW5nLCB7IG5ldzogYW55LCBvbGQ6IGFueSB9PixcclxufSB7XHJcbiAgICBsZXQgaXNFcXVhbCA9IHRydWU7XHJcbiAgICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gbG9nIGRpZmZlcmVuY2VzXHJcbiAgICBjb25zdCBjb2xsZWN0RGlmZmVyZW5jZSA9IChrZXk6IHN0cmluZywgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgIGRpZmZbcGF0aCA/IGAke3BhdGh9LiR7a2V5fWAgOiBrZXldID0ge1xyXG4gICAgICAgICAgICBuZXc6IG5ld1ZhbHVlLFxyXG4gICAgICAgICAgICBvbGQ6IG9sZFZhbHVlLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaXNFcXVhbCA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBDaGVjayBpZiBib3RoIGlucHV0cyBhcmUgb2JqZWN0c1xyXG4gICAgaWYgKHR5cGVvZiBvbGRPcHRpb25zICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgbmV3T3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcclxuICAgICAgICBpZiAob2xkT3B0aW9ucyAhPT0gbmV3T3B0aW9ucykge1xyXG4gICAgICAgICAgICBjb2xsZWN0RGlmZmVyZW5jZSgnJywgb2xkT3B0aW9ucywgbmV3T3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGRpZmYsXHJcbiAgICAgICAgICAgIGlzRXF1YWwsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgYWxsIGtleXMgZnJvbSBib3RoIG9iamVjdHNcclxuICAgIGNvbnN0IGFsbEtleXMgPSBuZXcgU2V0KFsuLi5PYmplY3Qua2V5cyhvbGRPcHRpb25zKSwgLi4uT2JqZWN0LmtleXMobmV3T3B0aW9ucyldKTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBhbGxLZXlzKSB7XHJcbiAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBvbGRPcHRpb25zW2tleV07XHJcbiAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBuZXdPcHRpb25zW2tleV07XHJcblxyXG4gICAgICAgIC8vIElmIGJvdGggdmFsdWVzIGFyZSBvYmplY3RzLCByZWN1cnNpdmVseSBjb21wYXJlIHRoZW1cclxuICAgICAgICBpZiAodHlwZW9mIG9sZFZhbHVlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbmV3VmFsdWUgPT09ICdvYmplY3QnICYmIG9sZFZhbHVlICE9PSBudWxsICYmIG5ld1ZhbHVlICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGlmICghcGlja0RpZmZlcmVudE9wdGlvbnMob2xkVmFsdWUsIG5ld1ZhbHVlLCBwYXRoID8gYCR7cGF0aH0uJHtrZXl9YCA6IGtleSwgZGlmZikuaXNFcXVhbCkge1xyXG4gICAgICAgICAgICAgICAgaXNFcXVhbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgY29sbGVjdERpZmZlcmVuY2Uoa2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGRpZmYsXHJcbiAgICAgICAgaXNFcXVhbCxcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjb3B5UGF0aHMocGF0aHM6IHsgc3JjOiBzdHJpbmcsIGRlc3Q6IHN0cmluZyB9W10pIHtcclxuICAgIHJldHVybiBQcm9taXNlLmFsbChwYXRocy5tYXAoKHBhdGgpID0+IGNvcHkocGF0aC5zcmMsIHBhdGguZGVzdCkpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOmAkuW9kumBjeWOhui/meS4qui1hOa6kOS4iueahOaJgOacieWtkOi1hOa6kFxyXG4gKiBAcGFyYW0gYXNzZXRcclxuICogQHBhcmFtIGhhbmRsZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlY3Vyc2l2ZWx5KGFzc2V0OiBJQXNzZXQsIGhhbmRsZTogRnVuY3Rpb24pIHtcclxuICAgIGlmICghYXNzZXQuc3ViQXNzZXRzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaGFuZGxlICYmIGhhbmRsZShhc3NldCk7XHJcbiAgICBPYmplY3Qua2V5cyhhc3NldC5zdWJBc3NldHMpLmZvckVhY2goKG5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIGNvbnN0IHN1YkFzc2V0ID0gYXNzZXQuc3ViQXNzZXRzW25hbWVdO1xyXG4gICAgICAgIHJlY3Vyc2l2ZWx5KHN1YkFzc2V0LCBoYW5kbGUpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IERCX1BST1RPQ09MX0hFQURFUiA9ICdkYjovLyc7XHJcbi8vIOWOu+mZpCBkYjovLyDnmoTot6/lvoRcclxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZURiSGVhZGVyKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBpZiAoIXBhdGgpIHtcclxuICAgICAgICByZXR1cm4gJyc7XHJcbiAgICB9XHJcbiAgICBpZiAoIXBhdGguc3RhcnRzV2l0aChEQl9QUk9UT0NPTF9IRUFERVIpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcigndW5rbm93biBwYXRoIHRvIGJ1aWxkOiAnICsgcGF0aCk7XHJcbiAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICB9XHJcbiAgICAvLyDojrflj5bliZTpmaQgZGI6Ly8g5ZCO55qE5paH5Lu255uu5b2VXHJcbiAgICBjb25zdCBtb3VudFBvaW50ID0gcGF0aC5zbGljZShEQl9QUk9UT0NPTF9IRUFERVIubGVuZ3RoKTtcclxuICAgIHJldHVybiBtb3VudFBvaW50O1xyXG59XHJcblxyXG4vKipcclxuICog5bCGIGRiIOW8gOWktOeahCB1cmwg6L2s5Li66aG555uu6YeM55qE5a6e6ZmFIHVybFxyXG4gKiBAcGFyYW0gdXJsIGRiOi8vXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGJVcmxUb1Jhd1BhdGgodXJsOiBzdHJpbmcpIHtcclxuICAgIHJldHVybiBqb2luKGJ1aWxkZXJDb25maWcucHJvamVjdFJvb3QsIHJlbW92ZURiSGVhZGVyKHVybCkpO1xyXG59XHJcblxyXG4vKipcclxuICog6I635Y+W55u45a+56Lev5b6E77yM5bm25LiU6Lev5b6E5YiG6ZqU56ym5YGa6L2s5o2i5aSE55CGXHJcbiAqIEBwYXJhbSBmcm9tXHJcbiAqIEBwYXJhbSB0b1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbGF0aXZlVXJsKGZyb206IHN0cmluZywgdG86IHN0cmluZykge1xyXG4gICAgcmV0dXJuIHJlbGF0aXZlKGZyb20sIHRvKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmo4Dmn6XmmK/lkKblronoo4XkuoYgbm9kZS5qc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzSW5zdGFsbE5vZGVKcygpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgZXhlYyhcclxuICAgICAgICAgICAgJ25vZGUgLXYnLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbnY6IHByb2Nlc3MuZW52LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAoZXJyb3I6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOajgOafpeaIkOWKn1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICApO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDojrflj5bmlofku7blpLnmiJbogIXmlofku7blpKflsI9cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWxlU2l6ZURlZXAocGF0aDogc3RyaW5nKSB7XHJcbiAgICBpZiAoIWV4aXN0c1N5bmMocGF0aCkpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGNvbnN0IHN0YXQgPSBzdGF0U3luYyhwYXRoKTtcclxuICAgIGlmICghc3RhdC5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0YXQuc2l6ZTtcclxuICAgIH1cclxuICAgIGxldCByZXN1bHQgPSAwO1xyXG4gICAgLy8g5paH5Lu25aS5XHJcbiAgICBjb25zdCBmaWxlcyA9IHJlYWRkaXJTeW5jKHBhdGgpO1xyXG4gICAgZmlsZXMuZm9yRWFjaCgoZmlsZU5hbWUpID0+IHtcclxuICAgICAgICByZXN1bHQgKz0gZ2V0RmlsZVNpemVEZWVwKGpvaW4ocGF0aCwgZmlsZU5hbWUpKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIOaLt+i0neaWh+S7tuWkuVxyXG4gKiBAcGFyYW0gcGF0aFxyXG4gKiBAcGFyYW0gZGVzdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlEaXJTeW5jKHBhdGg6IHN0cmluZywgZGVzdDogc3RyaW5nKSB7XHJcbiAgICBpZiAoIWV4aXN0c1N5bmMocGF0aCkpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGNvbnN0IHN0YXQgPSBzdGF0U3luYyhwYXRoKTtcclxuICAgIGlmICghc3RhdC5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgICAgZW5zdXJlRGlyU3luYyhkaXJuYW1lKGRlc3QpKTtcclxuICAgICAgICByZXR1cm4gY29weUZpbGVTeW5jKHBhdGgsIGRlc3QpO1xyXG4gICAgfVxyXG4gICAgLy8g5paH5Lu25aS5XHJcbiAgICBjb25zdCBmaWxlcyA9IHJlYWRkaXJTeW5jKHBhdGgpO1xyXG4gICAgZW5zdXJlRGlyU3luYyhkZXN0KTtcclxuICAgIGZpbGVzLmZvckVhY2goKGZpbGVOYW1lKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZmlsZSA9IGpvaW4ocGF0aCwgZmlsZU5hbWUpO1xyXG4gICAgICAgIGNvbnN0IGZpbGVEZXN0ID0gam9pbihkZXN0LCBmaWxlTmFtZSk7XHJcbiAgICAgICAgY29weURpclN5bmMoZmlsZSwgZmlsZURlc3QpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8vIOazqOaEj++8muebruWJjSB1dGlscyDnlKjnmoTmmK8gVVVJRO+8jEVkaXRvckV4dGVuZHMg55So55qE5pivIFV1aWQgXHJcbmV4cG9ydCBmdW5jdGlvbiBjb21wcmVzc1V1aWQodXVpZDogc3RyaW5nLCBtaW4gPSB0cnVlKSB7XHJcbiAgICByZXR1cm4gdXRpbHMuVVVJRC5jb21wcmVzc1VVSUQodXVpZCwgbWluKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlY29tcHJlc3NVdWlkKHV1aWQ6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIHV0aWxzLlVVSUQuZGVjb21wcmVzc1VVSUQodXVpZCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDku44gbGlicmFyeSDot6/lvoTojrflj5YgdXVpZFxyXG4gKiBAcGFyYW0gcGF0aFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFV1aWRGcm9tUGF0aChwYXRoOiBzdHJpbmcpIHtcclxuICAgIHJldHVybiB1dGlscy5VVUlELmdldFV1aWRGcm9tTGliUGF0aChwYXRoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOiOt+WPluafkOS4quWQjeWtl+WvueW6lOeahOefrSB1dWlkXHJcbiAqIEBwYXJhbSBuYW1lIFxyXG4gKiBAcmV0dXJucyBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBuYW1lVG9TdWJJZChuYW1lOiBzdHJpbmcpIHtcclxuICAgIHJldHVybiB1dGlscy5VVUlELm5hbWVUb1N1YklkKG5hbWUpO1xyXG59XHJcblxyXG4vKipcclxuICog5ou85o6l5oiQIGltcG9ydCDot6/lvoRcclxuICogQHBhcmFtIGRlc3RcclxuICogQHBhcmFtIHV1aWRcclxuICogQHBhcmFtIGV4dE5hbWUg5oyH5a6aIGltcG9ydCDnmoTmlofku7bmoLzlvI/vvIzpu5jorqQgLmpzb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRSZXNJbXBvcnRQYXRoKGRlc3Q6IHN0cmluZywgdXVpZDogc3RyaW5nLCBleHROYW1lID0gJy5qc29uJykge1xyXG4gICAgcmV0dXJuIGpvaW4oZGVzdCwgQnVpbGRHbG9iYWxJbmZvLklNUE9SVF9IRUFERVIsIHV1aWQuc3Vic3RyKDAsIDIpLCB1dWlkICsgZXh0TmFtZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmi7zmjqXmiJAgcmF3LWFzc2V0cyDot6/lvoRcclxuICogQHBhcmFtIGRlc3RcclxuICogQHBhcmFtIHV1aWRcclxuICogQHBhcmFtIGV4dE5hbWUg6Lev5b6E5ZCO57yAXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVzUmF3QXNzZXRzUGF0aChkZXN0OiBzdHJpbmcsIHV1aWQ6IHN0cmluZywgZXh0TmFtZTogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gam9pbihkZXN0LCBCdWlsZEdsb2JhbEluZm8uTkFUSVZFX0hFQURFUiwgdXVpZC5zdWJzdHIoMCwgMiksIHV1aWQgKyBleHROYW1lKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRvQmFiZWxNb2R1bGVzKG1vZHVsZXM6IElNb2R1bGVzKTogc3RyaW5nIHwgZmFsc2Uge1xyXG4gICAgcmV0dXJuIG1vZHVsZXMgPT09ICdlc20nID8gZmFsc2UgOiBtb2R1bGVzO1xyXG59XHJcblxyXG4vKipcclxuICog6ISa5pys57yW6K+RXHJcbiAqIFRPRE8g5q2k57G757yW6K+R6ISa5pys55u45YWz6YC76L6R77yM5ZCO57ut6ZyA6KaB6L+B56e75Yiw6L+b56iL566h55CG5Zmo5YaF6LCD55SoXHJcbiAqIEBwYXJhbSBjb2RlXHJcbiAqIEBwYXJhbSBvcHRpb25zXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdHJhbnNmb3JtQ29kZShjb2RlOiBzdHJpbmcsIG9wdGlvbnM6IElUcmFuc2Zvcm1PcHRpb25zKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgIGNvbnN0IHsgbG9vc2UsIGltcG9ydE1hcEZvcm1hdCB9ID0gb3B0aW9ucztcclxuICAgIGNvbnN0IGJhYmVsRmlsZVJlc3VsdCA9IGF3YWl0IGJhYmVsLnRyYW5zZm9ybUFzeW5jKGNvZGUsIHtcclxuICAgICAgICBwcmVzZXRzOiBbW2JhYmVsUHJlc2V0RW52LCB7XHJcbiAgICAgICAgICAgIG1vZHVsZXM6IGltcG9ydE1hcEZvcm1hdCA/IHRvQmFiZWxNb2R1bGVzKGltcG9ydE1hcEZvcm1hdCkgOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgIGxvb3NlOiBsb29zZSAhPT0gbnVsbCAmJiBsb29zZSAhPT0gdm9pZCAwID8gbG9vc2UgOiB0cnVlLFxyXG4gICAgICAgIH1dXSxcclxuICAgIH0pO1xyXG4gICAgaWYgKCFiYWJlbEZpbGVSZXN1bHQgfHwgIWJhYmVsRmlsZVJlc3VsdC5jb2RlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gdHJhbnNmb3JtIScpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJhYmVsRmlsZVJlc3VsdC5jb2RlO1xyXG59XHJcblxyXG4vKipcclxuICog57yW6K+R6ISa5pysXHJcbiAqIEBwYXJhbSBjb250ZW50c1xyXG4gKiBAcGFyYW0gcGF0aFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVKUyhjb250ZW50czogQnVmZmVyLCBwYXRoOiBzdHJpbmcpIHtcclxuICAgIGxldCByZXN1bHQ7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IEJhYmVsID0gcmVxdWlyZSgnQGJhYmVsL2NvcmUnKTtcclxuICAgICAgICByZXN1bHQgPSBCYWJlbC50cmFuc2Zvcm0oY29udGVudHMsIHtcclxuICAgICAgICAgICAgYXN0OiBmYWxzZSxcclxuICAgICAgICAgICAgaGlnaGxpZ2h0Q29kZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNvdXJjZU1hcHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBjb21wYWN0OiBmYWxzZSxcclxuICAgICAgICAgICAgZmlsZW5hbWU6IHBhdGgsIC8vIHNlYXJjaCBwYXRoIGZvciBiYWJlbHJjXHJcbiAgICAgICAgICAgIHByZXNldHM6IFtcclxuICAgICAgICAgICAgICAgIHJlcXVpcmUoJ0BiYWJlbC9wcmVzZXQtZW52JyksXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIHBsdWdpbnM6IFtcclxuICAgICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHRyYW5zZm9ybS1kZWNvcmF0b3JzLWxlZ2FjeSBjb21lcyBiZWZvcmUgdHJhbnNmb3JtLWNsYXNzLXByb3BlcnRpZXMuXHJcbiAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZSgnQGJhYmVsL3BsdWdpbi1wcm9wb3NhbC1kZWNvcmF0b3JzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgeyBsZWdhY3k6IHRydWUgfSxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZSgnQGJhYmVsL3BsdWdpbi1wcm9wb3NhbC1jbGFzcy1wcm9wZXJ0aWVzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgeyBsb29zZTogdHJ1ZSB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlKCdiYWJlbC1wbHVnaW4tYWRkLW1vZHVsZS1leHBvcnRzJyksXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmUoJ0BiYWJlbC9wbHVnaW4tcHJvcG9zYWwtZXhwb3J0LWRlZmF1bHQtZnJvbScpLFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgICAgZXJyLnN0YWNrID0gYENvbXBpbGUgJHtwYXRofSBlcnJvcjogJHtlcnIuc3RhY2t9YDtcclxuICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0LmNvZGU7XHJcbn1cclxuXHJcbi8vIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRNb2R1bGVGaWxlcyhyZXN1bHQ6IEludGVybmFsQnVpbGRSZXN1bHQpIHtcclxuLy8gICAgIGNvbnN0IGdsb2JieU9wdGlvbnM6IEdsb2JieU9wdGlvbnMgPSB7IC8qIG5vZGlyOiB0cnVlKi8gfTtcclxuLy8gICAgIHJldHVybiAoW10gYXMgc3RyaW5nW10pLmNvbmNhdCguLi5hd2FpdCBQcm9taXNlLmFsbChbXHJcbi8vICAgICAgICAgLy8gRW5naW5lIG1vZHVsZSBmaWxlc1xyXG4vLyAgICAgICAgIHJlc3VsdC5wYXRocy5lbmdpbmVEaXIgPyBnbG9iYnkoam9pbihyZXN1bHQucGF0aHMuZW5naW5lRGlyLCAnKiovKi5qcycpLCBnbG9iYnlPcHRpb25zKSA6IFtdLFxyXG4vLyAgICAgICAgIC8vIGFwcGxpY2F0aW9uLmpzXHJcbi8vICAgICAgICAgcmVzdWx0LnBhdGhzLmFwcGxpY2F0aW9uSlMsXHJcbi8vICAgICAgICAgLy8gUHJvamVjdCBzaGFyZWQgbW9kdWxlIGZpbGVzXHJcbi8vICAgICAgICAgZ2xvYmJ5KGpvaW4ocmVzdWx0LnBhdGhzLmRpciwgJ3NyYy9jaHVua3MvKiovKi5qcycpLCBnbG9iYnlPcHRpb25zKSxcclxuLy8gICAgICAgICAvLyBTY3JpcHQgbW9kdWxlcyBpbiBidW5kbGVcclxuLy8gICAgICAgICByZXN1bHQuYnVuZGxlTWFuYWdlci5idW5kbGVzLm1hcCgoYnVuZGxlKSA9PiBidW5kbGUuc2NyaXB0RGVzdCksXHJcbi8vICAgICBdKSk7XHJcbi8vIH1cclxuXHJcbmludGVyZmFjZSBJQ3JlYXRlQnVuZGxlT3B0aW9ucyB7XHJcbiAgICBleGNsdWRlcz86IHN0cmluZ1tdO1xyXG4gICAgZGVidWc/OiBib29sZWFuO1xyXG4gICAgc291cmNlTWFwPzogYm9vbGVhbjtcclxufVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlQnVuZGxlKHNyYzogc3RyaW5nLCBkZXN0OiBzdHJpbmcsIG9wdGlvbnM/OiBJQ3JlYXRlQnVuZGxlT3B0aW9ucykge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBjb25zdCBiYWJlbGlmeSA9IHJlcXVpcmUoJ2JhYmVsaWZ5Jyk7XHJcbiAgICAgICAgY29uc3QgYnJvd3NlcmlmeSA9IHJlcXVpcmUoJ2Jyb3dzZXJpZnknKTtcclxuICAgICAgICBjb25zdCBidW5kbGVyID0gYnJvd3NlcmlmeShzcmMpO1xyXG4gICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZXhjbHVkZXMpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5leGNsdWRlcy5mb3JFYWNoKGZ1bmN0aW9uIChwYXRoKSB7XHJcbiAgICAgICAgICAgICAgICBidW5kbGVyLmV4Y2x1ZGUocGF0aCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbnN1cmVEaXJTeW5jKGRpcm5hbWUoZGVzdCkpO1xyXG4gICAgICAgIGJ1bmRsZXIudHJhbnNmb3JtKGJhYmVsaWZ5LCB7XHJcbiAgICAgICAgICAgIHByZXNldHM6IFtyZXF1aXJlKCdAYmFiZWwvcHJlc2V0LWVudicpXSxcclxuICAgICAgICAgICAgcGx1Z2luczogW3JlcXVpcmUoJ0BiYWJlbC9wbHVnaW4tcHJvcG9zYWwtY2xhc3MtcHJvcGVydGllcycpXSxcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYnVuZGxlKChlcnI6IEVycm9yLCBidWZmZXI6IEJ1ZmZlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3cml0ZUZpbGVTeW5jKGRlc3QsIG5ldyBVaW50OEFycmF5KGJ1ZmZlciksICd1dGY4Jyk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IEhBU0hfTEVOID0gNTtcclxuaW50ZXJmYWNlIElBcHBlbmRSZXMge1xyXG4gICAgaGFzaDogc3RyaW5nO1xyXG4gICAgcGF0aHM6IHN0cmluZ1tdO1xyXG59XHJcbi8qKlxyXG4gKiDnu5nmn5Dkupvot6/lvoTmlofku7bmt7vliqAgbWQ1IOWQjue8gFxyXG4gKiBAcGFyYW0gcGF0aHNcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhcHBlbmRNZDVUb1BhdGhzKHBhdGhzOiBzdHJpbmdbXSk6IFByb21pc2U8SUFwcGVuZFJlcyB8IG51bGw+IHtcclxuICAgIGlmICghQXJyYXkuaXNBcnJheShwYXRocykpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIC8vIOWPguS4jiBtZDUg6K6h566X55qE5pWw5o2u6ZyA6KaB5o6S5bqP77yM5LiU5LiN6IO95bm25Y+R5ZCm5YiZ5Lya5b2x5ZON5pWw5o2u6K6h566XXHJcbiAgICBwYXRocyA9IHBhdGhzLnNvcnQoKTtcclxuICAgIGNvbnN0IGRhdGFBcnIgPSBbXTtcclxuICAgIGZvciAoY29uc3QgcGF0aCBvZiBwYXRocykge1xyXG4gICAgICAgIGxldCBkYXRhO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGRhdGEgPSBhd2FpdCByZWFkRmlsZShwYXRoKTtcclxuICAgICAgICAgICAgZGF0YUFyci5wdXNoKGRhdGEpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGByZWFkRmlsZSB7bGluaygke3BhdGh9KX1gKTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGhhc2ggPSBjYWxjTWQ1KGRhdGFBcnIpO1xyXG4gICAgY29uc3QgcmVzdWx0UGF0aHM6IHN0cmluZ1tdID0gW107XHJcbiAgICBhd2FpdCBQcm9taXNlLmFsbChcclxuICAgICAgICBwYXRocy5tYXAoKHBhdGgsIGkpID0+IHtcclxuICAgICAgICAgICAgLy8g6Z2e6LWE5rqQ57G75pu/5o2i5ZCN5a2XXHJcbiAgICAgICAgICAgIHJlc3VsdFBhdGhzW2ldID0gcGF0Y2hNZDVUb1BhdGgocGF0aCwgaGFzaCk7XHJcbiAgICAgICAgICAgIC8vIOiuoeeul+WujCBoYXNoIOWAvOS5i+WQjui/m+ihjOaUueWQjVxyXG4gICAgICAgICAgICByZXR1cm4gcmVuYW1lKHBhdGgsIHJlc3VsdFBhdGhzW2ldKTtcclxuICAgICAgICB9KSxcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBwYXRoczogcmVzdWx0UGF0aHMsXHJcbiAgICAgICAgaGFzaCxcclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDorqHnrpfmn5DkuKrmlbDmja7nmoQgbWQ1IOWAvFxyXG4gKiBAcGFyYW0gZGF0YVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNhbGNNZDUoZGF0YTogKEJ1ZmZlciB8IHN0cmluZykgfCBBcnJheTxCdWZmZXIgfCBzdHJpbmc+KTogc3RyaW5nIHtcclxuICAgIGRhdGEgPSBBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YSA6IFtkYXRhXTtcclxuICAgIGNvbnN0IHsgY3JlYXRlSGFzaCB9ID0gcmVxdWlyZSgnY3J5cHRvJyk7XHJcbiAgICBjb25zdCBjcnlwdG9IYXNoID0gY3JlYXRlSGFzaCgnbWQ1Jyk7XHJcbiAgICBkYXRhLmZvckVhY2goKGRhdGFJdGVtKSA9PiB7XHJcbiAgICAgICAgY3J5cHRvSGFzaC51cGRhdGUoZGF0YUl0ZW0pO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY3J5cHRvSGFzaC5kaWdlc3QoJ2hleCcpLnNsaWNlKDAsIEhBU0hfTEVOKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWwhuafkOS4qiBoYXNoIOWAvOa3u+WKoOWIsOafkOS4qui3r+W+hOS4ilxyXG4gKiBAcGFyYW0gdGFyZ2V0UGF0aCBcclxuICogQHBhcmFtIGhhc2ggXHJcbiAqIEByZXR1cm5zIFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoTWQ1VG9QYXRoKHRhcmdldFBhdGg6IHN0cmluZywgaGFzaDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBwYXJzZU9iaiA9IHBhcnNlKHRhcmdldFBhdGgpO1xyXG4gICAgcGFyc2VPYmouYmFzZSA9ICcnO1xyXG4gICAgcGFyc2VPYmoubmFtZSArPSBgLiR7aGFzaH1gO1xyXG4gICAgcmV0dXJuIGZvcm1hdChwYXJzZU9iaik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDojrflj5bkuIDkuKrotYTmupAgbGlicmFyeSDlnLDlnYDph4znmoQgbGlicmFyeSDmlofku7blpLnnu53lr7not6/lvoRcclxuICogQHBhcmFtIGxpYnJhcnlQYXRoIFxyXG4gKiBAcmV0dXJucyBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRMaWJyYXJ5RGlyKGxpYnJhcnlQYXRoOiBzdHJpbmcpIHtcclxuICAgIC8vIGxpYnJhcnkg5Zyw5Z2A5Y+v6IO95Zyo6aG555uu5YaF5Lmf5Y+v6IO95Zyo5YW25LuW5Lu75L2V5L2N572uXHJcbiAgICAvLyDmraTlpITlj4LogIPkuoYgdXVpZCDmqKHlnZfnmoQgZ2V0VXVpZEZyb21MaWJQYXRoIOaJgOeUqOato+WImeadpeiOt+WPliBsaWJyYXJ5IOS7peWPiuS5i+WJjeeahOi3r+W+hFxyXG4gICAgY29uc3QgbWF0Y2hJbmZvID0gbGlicmFyeVBhdGgubWF0Y2goLyguKilbL1xcXFxdWzAtOWEtZkEtRl17Mn1bL1xcXFxdWzAtOWEtZkEtRi1dezgsfSgoQFswLTlhLWZBLUZdezUsfSkrKT8uKi8pO1xyXG4gICAgcmV0dXJuIG1hdGNoSW5mbyFbMV07XHJcbn1cclxuXHJcbi8vIOatpOW3peWFt+aWueazlei1sCB3b3JrZXJNYW5hZ2VyIOeuoeeQhu+8jOaWueS+v+WvueW8gOWQr+eahOi/m+eoi+WBmuS4reaWrVxyXG5leHBvcnQgY29uc3QgcXVpY2tTcGF3biA9IHdvcmtlck1hbmFnZXIucXVpY2tTcGF3bi5iaW5kKHdvcmtlck1hbmFnZXIpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5SW1hZ2VBc3NldEZyb21TdWJBc3NldEJ5VXVpZChzdWJBc3NldFV1aWQ6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIHN1YkFzc2V0VXVpZC5zcGxpdCgnQCcpWzBdO1xyXG59XHJcbiJdfQ==