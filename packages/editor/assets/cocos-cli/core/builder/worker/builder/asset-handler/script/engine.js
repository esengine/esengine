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
exports.buildEngineX = buildEngineX;
exports.buildSplitEngine = buildSplitEngine;
exports.queryEngineImportMap = queryEngineImportMap;
const crypto_1 = require("crypto");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const ccBuild = __importStar(require("@cocos/ccbuild"));
const fs_extra_2 = __importDefault(require("fs-extra"));
const path_2 = __importDefault(require("path"));
const sub_process_manager_1 = require("../../../worker-pools/sub-process-manager");
const fast_glob_1 = __importDefault(require("fast-glob"));
const mangle_config_parser_1 = require("./mangle-config-parser");
const default_mangle_config_1 = require("./default-mangle-config");
const utils_1 = __importDefault(require("../../../../../base/utils"));
const utils_2 = require("../../utils");
const builder_config_1 = __importDefault(require("../../../../share/builder-config"));
// 存储引擎复用参数的文件
const EngineCacheName = 'engine-cache';
/**
 * 见：https://github.com/cocos-creator/engine/pull/6735 中 build-engine 接口返回的注释
 *
 * 补充一下：
 * - 这个文件本来是为多模块设计的，里面记录了类似这样的映射：
 * ```js
 * {
 *   // 暴露给用户的模块名和实际模块文件
 *   "cc.core": "./cc.core.js",
 *   "cc.audio": "./cc.audio.js",
 * }
 * ```
 * - 如果分割了引擎，里面就是记录了如上的映射；
 * - 现在只有在微信下面分割了引擎。其它里面没有分割所以这个文件只记录了模块 `cc` 的映射：
 * ```js
 * {
 *   "cc": "./cc.js",
 * }
 * ```
 */
const exportsMetaFile = 'meta.json';
/**
 * 引擎构建
 * @param options
 * @param settings
 */
async function buildEngineX(options, ccEnvConstants) {
    const { output, metaFile } = await buildEngine(options, ccEnvConstants);
    await (0, fs_extra_1.emptyDir)(options.output);
    await (0, fs_extra_1.copy)(`${output}`, options.output, {
        recursive: true,
    });
    return { metaFile };
}
const fixedMd5Keys = [
    'debug',
    'sourceMaps',
    'includeModules',
    'engineVersion',
    'platformType',
    'split',
    'nativeCodeBundleMode',
    'targets',
    'entry',
    'noDeprecatedFeatures',
    'loose',
    'assetURLFormat',
    'flags',
    'preserveType',
    'wasmCompressionMode',
    'enableNamedRegisterForSystemJSModuleFormat',
    'mangleProperties',
    'inlineEnum',
];
async function buildEngine(options, ccEnvConstants) {
    // TODO
    const noDeprecatedFeaturesConfig = { value: false, version: '' };
    const loose = options.loose || false;
    const noDeprecatedFeatures = noDeprecatedFeaturesConfig.value ?
        (!noDeprecatedFeaturesConfig.version ? true : noDeprecatedFeaturesConfig.version) :
        undefined;
    const profileOptions = {
        noDeprecatedFeatures,
        loose,
    };
    const mangleConfigJsonPath = (0, path_1.join)(builder_config_1.default.projectRoot, 'engine-mangle-config.json');
    if (options.mangleProperties && !await fs_extra_2.default.pathExists(mangleConfigJsonPath)) {
        console.debug(`mangleProperties is enabled, but engine-mangle-config.json not found, create default mangle configuration`);
        default_mangle_config_1.defaultMangleConfig.__doc_url__ = utils_1.default.Url.getDocUrl('advanced-topics/mangle-properties.html');
        await fs_extra_2.default.writeJson(mangleConfigJsonPath, default_mangle_config_1.defaultMangleConfig, { spaces: 2 });
    }
    else {
        console.debug(`mangleProperties is enabled, found engine-mangle-config.json, use it`);
    }
    // 计算缓存名字，并检查状态
    const md5Keys = options.md5Map.length === 0 ?
        fixedMd5Keys : options.md5Map.concat(fixedMd5Keys);
    let md5String = calcMd5String(Object.assign(profileOptions, options), md5Keys);
    if (options.mangleProperties) {
        md5String += `projectPath=${builder_config_1.default.projectRoot},`;
        console.debug(`Found mangle config, append projectPath to md5String: ${md5String.split(',').join(',\n')}`);
    }
    const md5 = (0, crypto_1.createHash)('md5');
    const name = md5.update(md5String).digest('hex');
    // TODO 缓存引擎目录确认
    const output = (0, path_1.join)(options.entry, 'bin/temp', name);
    const metaDir = (0, path_1.join)((0, path_1.dirname)(output), `${name}.meta`);
    const watchFilesRecordFile = `${output}.watch-files.json`;
    const metaFile = (0, path_1.join)(metaDir, exportsMetaFile);
    if (options.useCache && await validateCache(output, watchFilesRecordFile) && await isValidMeta(metaFile)) {
        console.debug(`Use cache engine: {link(${output})}`);
        console.debug(`Use cache, md5String: ${md5String.split(',').join(',\n')}`);
        console.debug(`Use cache, options: ` + JSON.stringify(options, null, 2));
        return {
            output,
            metaFile,
        };
    }
    let mangleConfigJsonMtime = 0;
    let mangleProperties = false;
    if (options.mangleProperties) {
        if (ccEnvConstants.NATIVE) {
            // 原生平台由于某些类使用 .jsb.ts 替代 .ts，比如 node.jsb.ts 替代 node.ts，暂时无法支持属性压缩功能
            console.warn(`Currently, mangling internal properties is not supported on native platforms, current platform: ${options.platformType}`);
        }
        else {
            mangleProperties = (0, mangle_config_parser_1.parseMangleConfig)(mangleConfigJsonPath, options.platformType);
            if (mangleProperties === undefined) {
                console.debug(`engine-mangle-config.json not found, but mangleProperties is enabled, so enable mangleProperties with default mangle configuration`);
                mangleProperties = true;
            }
            else {
                mangleConfigJsonMtime = (await fs_extra_2.default.stat(mangleConfigJsonPath)).mtimeMs;
                console.debug(`mangleProperties: ${JSON.stringify(mangleProperties, null, 2)}`);
            }
        }
    }
    else {
        console.debug(`mangleProperties is disabled, platform: ${options.platformType}`);
    }
    const buildOptions = {
        incremental: watchFilesRecordFile,
        engine: options.entry,
        out: output,
        moduleFormat: 'system',
        compress: !options.debug,
        nativeCodeBundleMode: options.nativeCodeBundleMode,
        assetURLFormat: options.assetURLFormat,
        noDeprecatedFeatures,
        sourceMap: options.sourceMaps,
        targets: options.targets,
        loose,
        features: options.includeModules,
        platform: options.platformType,
        flags: options.flags,
        mode: 'BUILD',
        metaFile,
        preserveType: options.preserveType,
        wasmCompressionMode: options.wasmCompressionMode,
        enableNamedRegisterForSystemJSModuleFormat: options.enableNamedRegisterForSystemJSModuleFormat,
        inlineEnum: options.inlineEnum,
        mangleProperties,
        mangleConfigJsonMtime,
    };
    // 引擎编译目前编译内存占用较大，需要独立进程管理
    await sub_process_manager_1.workerManager.registerTask({
        name: 'build-engine',
        path: (0, path_1.join)(__dirname, './build-engine'),
        options: {
            cwd: options.entry,
        },
    });
    console.debug(`Cache is invalid, start build engine with options: ${JSON.stringify(buildOptions, null, 2)}`);
    console.debug(`md5String: ${md5String.split(',').join(',\n')}`);
    await sub_process_manager_1.workerManager.runTask('build-engine', 'buildEngineCommand', [buildOptions]);
    // await buildEngineCommand(buildOptions);
    await outputCacheJson(options, output);
    sub_process_manager_1.workerManager.kill('build-engine');
    console.debug(`build engine done: output: ${output}`);
    return {
        output,
        metaFile,
    };
}
async function buildSplitEngine(options) {
    // 引擎编译目前编译内存占用较大，需要独立进程管理
    await sub_process_manager_1.workerManager.registerTask({
        name: 'build-engine',
        path: (0, path_1.join)(__dirname, './build-engine'),
    });
    return await sub_process_manager_1.workerManager.runTask('build-engine', 'buildSeparateEngine', [options]);
    // return await buildSeparateEngine(options);
}
/**
 * 验证缓存引擎的有效性。
 * @param cache 引擎缓存路径。
 * @param incrementalFile 增量文件。
 */
async function validateCache(cache, incrementalFile) {
    if (!await fs_extra_2.default.pathExists(cache)) {
        console.debug(`Engine cache (${cache}) does not exist.`);
        return false;
    }
    let zeroCheck = false;
    try {
        const files = await (0, fast_glob_1.default)('**/*.js', {
            cwd: cache,
        });
        if (files.length !== 0) {
            zeroCheck = true;
        }
    }
    catch { }
    if (!zeroCheck) {
        console.warn(`Engine cache directory({link(${cache})}) exists but has empty content. It's abnormal.`);
        return false;
    }
    if (await ccBuild.buildEngine.isSourceChanged(incrementalFile)) {
        return false;
    }
    return true;
}
async function isValidMeta(metaFile) {
    if (!await (0, fs_extra_1.pathExists)(metaFile)) {
        return false;
    }
    let exportMeta;
    try {
        exportMeta = await fs_extra_2.default.readJson(metaFile);
    }
    catch (err) {
        return false;
    }
    if (typeof exportMeta !== 'object' || exportMeta === null) {
        return false;
    }
    const exports = exportMeta.exports;
    if (typeof exports !== 'object') {
        return false;
    }
    const mangleConfigJsonPath = (0, path_1.join)(builder_config_1.default.projectRoot, 'engine-mangle-config.json');
    if (await fs_extra_2.default.pathExists(mangleConfigJsonPath)) {
        const currentMangleConfigJsonMtime = (await fs_extra_2.default.stat(mangleConfigJsonPath)).mtimeMs;
        const currentMangleConfigJsonReadableTime = new Date(currentMangleConfigJsonMtime).toLocaleString();
        const oldMangleConfigJsonMtime = exportMeta.mangleConfigJsonMtime;
        const oldMangleConfigJsonReadableTime = oldMangleConfigJsonMtime !== undefined ? new Date(oldMangleConfigJsonMtime).toLocaleString() : 0;
        if (currentMangleConfigJsonMtime !== oldMangleConfigJsonMtime) {
            console.debug(`engine-mangle-config.json mtime changed: now: ${currentMangleConfigJsonReadableTime} !== old: ${oldMangleConfigJsonReadableTime}`);
            return false;
        }
        else {
            console.debug(`engine-mangle-config.json mtime isn't changed: now: ${currentMangleConfigJsonReadableTime} === old: ${oldMangleConfigJsonReadableTime}`);
        }
    }
    return true;
}
function calcMd5String(config, keys) {
    let str = '';
    for (const key of keys) {
        str += `${key}=${JSON.stringify(config[key])},`;
    }
    return str;
}
/**
 * 生成引擎文件和对应的 map 文件
 * @param options
 * @param output
 */
async function outputCacheJson(options, output) {
    const dest = (0, path_1.join)((0, path_1.dirname)(output), `${EngineCacheName}.json`);
    let data = {};
    if (await (0, fs_extra_1.pathExists)(dest)) {
        data = await (0, fs_extra_1.readJson)(dest);
    }
    data = data || {};
    const hashName = (0, path_1.basename)(output);
    data[hashName] = options;
    await (0, fs_extra_1.outputJSON)(dest, data);
}
async function queryEngineImportMap(metaPath, enginePath, importMapDir, baseUrl) {
    let exportMeta;
    try {
        exportMeta = await fs_extra_2.default.readJson(metaPath);
    }
    catch (err) {
        throw new Error(`Failed to read engine export meta, engine might not have been build correctly: ${err}`);
    }
    const baseUrlObj = baseUrl ? new URL(baseUrl) : undefined;
    const getImportURL = (moduleFile) => {
        let importUrl;
        if (baseUrlObj) {
            importUrl = new URL(moduleFile, baseUrlObj).href;
        }
        else {
            importUrl = `./${(0, utils_2.relativeUrl)(importMapDir, path_2.default.join(enginePath, moduleFile))}`;
        }
        return importUrl;
    };
    const importMap = {};
    for (const [moduleName, moduleFile] of Object.entries(exportMeta.exports)) {
        // importMap.imports[moduleName] = getImportURL(moduleFile);
        importMap[moduleName] = getImportURL(moduleFile);
    }
    for (const [alias, moduleFile] of Object.entries(exportMeta.chunkAliases)) {
        // importMap.imports[alias] = getImportURL(moduleFile);
        importMap[alias] = getImportURL(moduleFile);
    }
    return importMap;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5naW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci93b3JrZXIvYnVpbGRlci9hc3NldC1oYW5kbGVyL3NjcmlwdC9lbmdpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXdEYixvQ0FhQztBQXVKRCw0Q0FRQztBQWlHRCxvREFrQ0M7QUFyV0QsbUNBQW9DO0FBQ3BDLCtCQUErQztBQUMvQyx1Q0FNa0I7QUFDbEIsd0RBQTBDO0FBQzFDLHdEQUEwQjtBQUMxQixnREFBc0I7QUFDdEIsbUZBQTBFO0FBQzFFLDBEQUEyQjtBQUUzQixpRUFBMkQ7QUFDM0QsbUVBQThEO0FBRzlELHNFQUE4QztBQUM5Qyx1Q0FBMEM7QUFDMUMsc0ZBQTZEO0FBRzdELGNBQWM7QUFDZCxNQUFNLGVBQWUsR0FBRyxjQUFjLENBQUM7QUFFdkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxNQUFNLGVBQWUsR0FBRyxXQUFXLENBQUM7QUFFcEM7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxZQUFZLENBQzlCLE9BQTBCLEVBQzFCLGNBQXlEO0lBRXpELE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxXQUFXLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBRXhFLE1BQU0sSUFBQSxtQkFBUSxFQUFDLE9BQU8sQ0FBQyxNQUFPLENBQUMsQ0FBQztJQUVoQyxNQUFNLElBQUEsZUFBSSxFQUFDLEdBQUcsTUFBTSxFQUFFLEVBQUUsT0FBTyxDQUFDLE1BQU8sRUFBRTtRQUNyQyxTQUFTLEVBQUUsSUFBSTtLQUNsQixDQUFDLENBQUM7SUFFSCxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUM7QUFDeEIsQ0FBQztBQVVELE1BQU0sWUFBWSxHQUF3RjtJQUN0RyxPQUFPO0lBQ1As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SyxNQUFNLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7UUFDeEUsdURBQXVEO1FBQ3ZELFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUNELE9BQU8sU0FBUyxDQUFDO0FBQ3JCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBjcmVhdGVIYXNoIH0gZnJvbSAnY3J5cHRvJztcclxuaW1wb3J0IHsgYmFzZW5hbWUsIGRpcm5hbWUsIGpvaW4gfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHtcclxuICAgIG91dHB1dEpTT04sXHJcbiAgICBwYXRoRXhpc3RzLFxyXG4gICAgcmVhZEpzb24sXHJcbiAgICBlbXB0eURpcixcclxuICAgIGNvcHksXHJcbn0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgKiBhcyBjY0J1aWxkIGZyb20gJ0Bjb2Nvcy9jY2J1aWxkJztcclxuaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHBzIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyB3b3JrZXJNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vLi4vd29ya2VyLXBvb2xzL3N1Yi1wcm9jZXNzLW1hbmFnZXInO1xyXG5pbXBvcnQgZmcgZnJvbSAnZmFzdC1nbG9iJztcclxuXHJcbmltcG9ydCB7IHBhcnNlTWFuZ2xlQ29uZmlnIH0gZnJvbSAnLi9tYW5nbGUtY29uZmlnLXBhcnNlcic7XHJcbmltcG9ydCB7IGRlZmF1bHRNYW5nbGVDb25maWcgfSBmcm9tICcuL2RlZmF1bHQtbWFuZ2xlLWNvbmZpZyc7XHJcbmltcG9ydCB7IFN0YXRzUXVlcnkgfSBmcm9tICdAY29jb3MvY2NidWlsZCc7XHJcbmltcG9ydCB7IElCdWlsZEVuZ2luZVBhcmFtLCBJSW50ZXJuYWxCdWlsZE9wdGlvbnMsIElCdWlsZFNlcGFyYXRlRW5naW5lT3B0aW9ucywgSUJ1aWxkU2VwYXJhdGVFbmdpbmVSZXN1bHQgfSBmcm9tICcuLi8uLi8uLi8uLi9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IHV0aWxzIGZyb20gJy4uLy4uLy4uLy4uLy4uL2Jhc2UvdXRpbHMnO1xyXG5pbXBvcnQgeyByZWxhdGl2ZVVybCB9IGZyb20gJy4uLy4uL3V0aWxzJztcclxuaW1wb3J0IGJ1aWxkZXJDb25maWcgZnJvbSAnLi4vLi4vLi4vLi4vc2hhcmUvYnVpbGRlci1jb25maWcnO1xyXG5pbXBvcnQgeyBidWlsZEVuZ2luZU9wdGlvbnMgfSBmcm9tICcuL2J1aWxkLWVuZ2luZSc7XHJcblxyXG4vLyDlrZjlgqjlvJXmk47lpI3nlKjlj4LmlbDnmoTmlofku7ZcclxuY29uc3QgRW5naW5lQ2FjaGVOYW1lID0gJ2VuZ2luZS1jYWNoZSc7XHJcblxyXG4vKipcclxuICog6KeB77yaaHR0cHM6Ly9naXRodWIuY29tL2NvY29zLWNyZWF0b3IvZW5naW5lL3B1bGwvNjczNSDkuK0gYnVpbGQtZW5naW5lIOaOpeWPo+i/lOWbnueahOazqOmHilxyXG4gKlxyXG4gKiDooaXlhYXkuIDkuIvvvJpcclxuICogLSDov5nkuKrmlofku7bmnKzmnaXmmK/kuLrlpJrmqKHlnZforr7orqHnmoTvvIzph4zpnaLorrDlvZXkuobnsbvkvLzov5nmoLfnmoTmmKDlsITvvJpcclxuICogYGBganNcclxuICoge1xyXG4gKiAgIC8vIOaatOmcsue7meeUqOaIt+eahOaooeWdl+WQjeWSjOWunumZheaooeWdl+aWh+S7tlxyXG4gKiAgIFwiY2MuY29yZVwiOiBcIi4vY2MuY29yZS5qc1wiLFxyXG4gKiAgIFwiY2MuYXVkaW9cIjogXCIuL2NjLmF1ZGlvLmpzXCIsXHJcbiAqIH1cclxuICogYGBgXHJcbiAqIC0g5aaC5p6c5YiG5Ymy5LqG5byV5pOO77yM6YeM6Z2i5bCx5piv6K6w5b2V5LqG5aaC5LiK55qE5pig5bCE77ybXHJcbiAqIC0g546w5Zyo5Y+q5pyJ5Zyo5b6u5L+h5LiL6Z2i5YiG5Ymy5LqG5byV5pOO44CC5YW25a6D6YeM6Z2i5rKh5pyJ5YiG5Ymy5omA5Lul6L+Z5Liq5paH5Lu25Y+q6K6w5b2V5LqG5qih5Z2XIGBjY2Ag55qE5pig5bCE77yaXHJcbiAqIGBgYGpzXHJcbiAqIHtcclxuICogICBcImNjXCI6IFwiLi9jYy5qc1wiLFxyXG4gKiB9XHJcbiAqIGBgYFxyXG4gKi9cclxuY29uc3QgZXhwb3J0c01ldGFGaWxlID0gJ21ldGEuanNvbic7XHJcblxyXG4vKipcclxuICog5byV5pOO5p6E5bu6XHJcbiAqIEBwYXJhbSBvcHRpb25zXHJcbiAqIEBwYXJhbSBzZXR0aW5nc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkRW5naW5lWChcclxuICAgIG9wdGlvbnM6IElCdWlsZEVuZ2luZVBhcmFtLFxyXG4gICAgY2NFbnZDb25zdGFudHM6IFN0YXRzUXVlcnkuQ29uc3RhbnRNYW5hZ2VyLkNDRW52Q29uc3RhbnRzLFxyXG4pIHtcclxuICAgIGNvbnN0IHsgb3V0cHV0LCBtZXRhRmlsZSB9ID0gYXdhaXQgYnVpbGRFbmdpbmUob3B0aW9ucywgY2NFbnZDb25zdGFudHMpO1xyXG5cclxuICAgIGF3YWl0IGVtcHR5RGlyKG9wdGlvbnMub3V0cHV0ISk7XHJcblxyXG4gICAgYXdhaXQgY29weShgJHtvdXRwdXR9YCwgb3B0aW9ucy5vdXRwdXQhLCB7XHJcbiAgICAgICAgcmVjdXJzaXZlOiB0cnVlLFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHsgbWV0YUZpbGUgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOi/meS6m+mAiemhueaYr+adpeiHquS6juiuvue9rueahO+8jOS5n+WKoOWFpee8k+WtmOajgOa1i+OAglxyXG4gKi9cclxuaW50ZXJmYWNlIFByb2ZpbGVPcHRpb25zIHtcclxuICAgIG5vRGVwcmVjYXRlZEZlYXR1cmVzOiBzdHJpbmcgfCBib29sZWFuIHwgdW5kZWZpbmVkO1xyXG4gICAgbG9vc2U6IGJvb2xlYW47XHJcbn1cclxuXHJcbmNvbnN0IGZpeGVkTWQ1S2V5czogcmVhZG9ubHkgKGtleW9mIElJbnRlcm5hbEJ1aWxkT3B0aW9uc1snYnVpbGRFbmdpbmVQYXJhbSddIHwga2V5b2YgUHJvZmlsZU9wdGlvbnMpW10gPSBbXHJcbiAgICAnZGVidWcnLFxyXG4gICAgJ3NvdXJjZU1hcHMnLFxyXG4gICAgJ2luY2x1ZGVNb2R1bGVzJyxcclxuICAgICdlbmdpbmVWZXJzaW9uJyxcclxuICAgICdwbGF0Zm9ybVR5cGUnLFxyXG4gICAgJ3NwbGl0JyxcclxuICAgICduYXRpdmVDb2RlQnVuZGxlTW9kZScsXHJcbiAgICAndGFyZ2V0cycsXHJcbiAgICAnZW50cnknLFxyXG4gICAgJ25vRGVwcmVjYXRlZEZlYXR1cmVzJyxcclxuICAgICdsb29zZScsXHJcbiAgICAnYXNzZXRVUkxGb3JtYXQnLFxyXG4gICAgJ2ZsYWdzJyxcclxuICAgICdwcmVzZXJ2ZVR5cGUnLFxyXG4gICAgJ3dhc21Db21wcmVzc2lvbk1vZGUnLFxyXG4gICAgJ2VuYWJsZU5hbWVkUmVnaXN0ZXJGb3JTeXN0ZW1KU01vZHVsZUZvcm1hdCcsXHJcbiAgICAnbWFuZ2xlUHJvcGVydGllcycsXHJcbiAgICAnaW5saW5lRW51bScsXHJcbl07XHJcblxyXG5hc3luYyBmdW5jdGlvbiBidWlsZEVuZ2luZShvcHRpb25zOiBJQnVpbGRFbmdpbmVQYXJhbSwgY2NFbnZDb25zdGFudHM6IFN0YXRzUXVlcnkuQ29uc3RhbnRNYW5hZ2VyLkNDRW52Q29uc3RhbnRzKSB7XHJcbiAgICAvLyBUT0RPXHJcbiAgICBjb25zdCBub0RlcHJlY2F0ZWRGZWF0dXJlc0NvbmZpZzogeyB2YWx1ZTogYm9vbGVhbiwgdmVyc2lvbjogc3RyaW5nIH0gPSB7IHZhbHVlOiBmYWxzZSwgdmVyc2lvbjogJycgfTtcclxuICAgIGNvbnN0IGxvb3NlOiBib29sZWFuID0gb3B0aW9ucy5sb29zZSB8fCBmYWxzZTtcclxuXHJcbiAgICBjb25zdCBub0RlcHJlY2F0ZWRGZWF0dXJlcyA9IG5vRGVwcmVjYXRlZEZlYXR1cmVzQ29uZmlnLnZhbHVlID9cclxuICAgICAgICAoIW5vRGVwcmVjYXRlZEZlYXR1cmVzQ29uZmlnLnZlcnNpb24gPyB0cnVlIDogbm9EZXByZWNhdGVkRmVhdHVyZXNDb25maWcudmVyc2lvbikgOlxyXG4gICAgICAgIHVuZGVmaW5lZDtcclxuXHJcbiAgICBjb25zdCBwcm9maWxlT3B0aW9uczogUHJvZmlsZU9wdGlvbnMgPSB7XHJcbiAgICAgICAgbm9EZXByZWNhdGVkRmVhdHVyZXMsXHJcbiAgICAgICAgbG9vc2UsXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IG1hbmdsZUNvbmZpZ0pzb25QYXRoID0gam9pbihidWlsZGVyQ29uZmlnLnByb2plY3RSb290LCAnZW5naW5lLW1hbmdsZS1jb25maWcuanNvbicpO1xyXG4gICAgaWYgKG9wdGlvbnMubWFuZ2xlUHJvcGVydGllcyAmJiAhYXdhaXQgZnMucGF0aEV4aXN0cyhtYW5nbGVDb25maWdKc29uUGF0aCkpIHtcclxuICAgICAgICBjb25zb2xlLmRlYnVnKGBtYW5nbGVQcm9wZXJ0aWVzIGlzIGVuYWJsZWQsIGJ1dCBlbmdpbmUtbWFuZ2xlLWNvbmZpZy5qc29uIG5vdCBmb3VuZCwgY3JlYXRlIGRlZmF1bHQgbWFuZ2xlIGNvbmZpZ3VyYXRpb25gKTtcclxuICAgICAgICBkZWZhdWx0TWFuZ2xlQ29uZmlnLl9fZG9jX3VybF9fID0gdXRpbHMuVXJsLmdldERvY1VybCgnYWR2YW5jZWQtdG9waWNzL21hbmdsZS1wcm9wZXJ0aWVzLmh0bWwnKTtcclxuICAgICAgICBhd2FpdCBmcy53cml0ZUpzb24obWFuZ2xlQ29uZmlnSnNvblBhdGgsIGRlZmF1bHRNYW5nbGVDb25maWcsIHsgc3BhY2VzOiAyIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLmRlYnVnKGBtYW5nbGVQcm9wZXJ0aWVzIGlzIGVuYWJsZWQsIGZvdW5kIGVuZ2luZS1tYW5nbGUtY29uZmlnLmpzb24sIHVzZSBpdGApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOiuoeeul+e8k+WtmOWQjeWtl++8jOW5tuajgOafpeeKtuaAgVxyXG4gICAgY29uc3QgbWQ1S2V5cyA9IG9wdGlvbnMubWQ1TWFwLmxlbmd0aCA9PT0gMCA/XHJcbiAgICAgICAgZml4ZWRNZDVLZXlzIDogb3B0aW9ucy5tZDVNYXAuY29uY2F0KGZpeGVkTWQ1S2V5cyk7XHJcbiAgICBsZXQgbWQ1U3RyaW5nID0gY2FsY01kNVN0cmluZyhPYmplY3QuYXNzaWduKHByb2ZpbGVPcHRpb25zLCBvcHRpb25zKSwgbWQ1S2V5cyk7XHJcblxyXG4gICAgaWYgKG9wdGlvbnMubWFuZ2xlUHJvcGVydGllcykge1xyXG4gICAgICAgIG1kNVN0cmluZyArPSBgcHJvamVjdFBhdGg9JHtidWlsZGVyQ29uZmlnLnByb2plY3RSb290fSxgO1xyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoYEZvdW5kIG1hbmdsZSBjb25maWcsIGFwcGVuZCBwcm9qZWN0UGF0aCB0byBtZDVTdHJpbmc6ICR7bWQ1U3RyaW5nLnNwbGl0KCcsJykuam9pbignLFxcbicpfWApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG1kNSA9IGNyZWF0ZUhhc2goJ21kNScpO1xyXG4gICAgY29uc3QgbmFtZSA9IG1kNS51cGRhdGUobWQ1U3RyaW5nKS5kaWdlc3QoJ2hleCcpO1xyXG4gICAgLy8gVE9ETyDnvJPlrZjlvJXmk47nm67lvZXnoa7orqRcclxuICAgIGNvbnN0IG91dHB1dCA9IGpvaW4ob3B0aW9ucy5lbnRyeSwgJ2Jpbi90ZW1wJywgbmFtZSk7XHJcbiAgICBjb25zdCBtZXRhRGlyID0gam9pbihkaXJuYW1lKG91dHB1dCksIGAke25hbWV9Lm1ldGFgKTtcclxuICAgIGNvbnN0IHdhdGNoRmlsZXNSZWNvcmRGaWxlID0gYCR7b3V0cHV0fS53YXRjaC1maWxlcy5qc29uYDtcclxuICAgIGNvbnN0IG1ldGFGaWxlID0gam9pbihtZXRhRGlyLCBleHBvcnRzTWV0YUZpbGUpO1xyXG5cclxuICAgIGlmIChvcHRpb25zLnVzZUNhY2hlICYmIGF3YWl0IHZhbGlkYXRlQ2FjaGUob3V0cHV0LCB3YXRjaEZpbGVzUmVjb3JkRmlsZSkgJiYgYXdhaXQgaXNWYWxpZE1ldGEobWV0YUZpbGUpKSB7XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgVXNlIGNhY2hlIGVuZ2luZToge2xpbmsoJHtvdXRwdXR9KX1gKTtcclxuICAgICAgICBjb25zb2xlLmRlYnVnKGBVc2UgY2FjaGUsIG1kNVN0cmluZzogJHttZDVTdHJpbmcuc3BsaXQoJywnKS5qb2luKCcsXFxuJyl9YCk7XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgVXNlIGNhY2hlLCBvcHRpb25zOiBgICsgSlNPTi5zdHJpbmdpZnkob3B0aW9ucywgbnVsbCwgMikpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG91dHB1dCxcclxuICAgICAgICAgICAgbWV0YUZpbGUsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbWFuZ2xlQ29uZmlnSnNvbk10aW1lID0gMDtcclxuICAgIGxldCBtYW5nbGVQcm9wZXJ0aWVzOiBidWlsZEVuZ2luZU9wdGlvbnNbJ21hbmdsZVByb3BlcnRpZXMnXSA9IGZhbHNlO1xyXG4gICAgaWYgKG9wdGlvbnMubWFuZ2xlUHJvcGVydGllcykge1xyXG4gICAgICAgIGlmIChjY0VudkNvbnN0YW50cy5OQVRJVkUpIHtcclxuICAgICAgICAgICAgLy8g5Y6f55Sf5bmz5Y+w55Sx5LqO5p+Q5Lqb57G75L2/55SoIC5qc2IudHMg5pu/5LujIC50c++8jOavlOWmgiBub2RlLmpzYi50cyDmm7/ku6Mgbm9kZS50c++8jOaaguaXtuaXoOazleaUr+aMgeWxnuaAp+WOi+e8qeWKn+iDvVxyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEN1cnJlbnRseSwgbWFuZ2xpbmcgaW50ZXJuYWwgcHJvcGVydGllcyBpcyBub3Qgc3VwcG9ydGVkIG9uIG5hdGl2ZSBwbGF0Zm9ybXMsIGN1cnJlbnQgcGxhdGZvcm06ICR7b3B0aW9ucy5wbGF0Zm9ybVR5cGV9YCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbWFuZ2xlUHJvcGVydGllcyA9IHBhcnNlTWFuZ2xlQ29uZmlnKG1hbmdsZUNvbmZpZ0pzb25QYXRoLCBvcHRpb25zLnBsYXRmb3JtVHlwZSk7XHJcbiAgICAgICAgICAgIGlmIChtYW5nbGVQcm9wZXJ0aWVzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYGVuZ2luZS1tYW5nbGUtY29uZmlnLmpzb24gbm90IGZvdW5kLCBidXQgbWFuZ2xlUHJvcGVydGllcyBpcyBlbmFibGVkLCBzbyBlbmFibGUgbWFuZ2xlUHJvcGVydGllcyB3aXRoIGRlZmF1bHQgbWFuZ2xlIGNvbmZpZ3VyYXRpb25gKTtcclxuICAgICAgICAgICAgICAgIG1hbmdsZVByb3BlcnRpZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbWFuZ2xlQ29uZmlnSnNvbk10aW1lID0gKGF3YWl0IGZzLnN0YXQobWFuZ2xlQ29uZmlnSnNvblBhdGgpKS5tdGltZU1zO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgbWFuZ2xlUHJvcGVydGllczogJHtKU09OLnN0cmluZ2lmeShtYW5nbGVQcm9wZXJ0aWVzLCBudWxsLCAyKX1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgbWFuZ2xlUHJvcGVydGllcyBpcyBkaXNhYmxlZCwgcGxhdGZvcm06ICR7b3B0aW9ucy5wbGF0Zm9ybVR5cGV9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYnVpbGRPcHRpb25zOiBidWlsZEVuZ2luZU9wdGlvbnMgPSB7XHJcbiAgICAgICAgaW5jcmVtZW50YWw6IHdhdGNoRmlsZXNSZWNvcmRGaWxlLFxyXG4gICAgICAgIGVuZ2luZTogb3B0aW9ucy5lbnRyeSxcclxuICAgICAgICBvdXQ6IG91dHB1dCxcclxuICAgICAgICBtb2R1bGVGb3JtYXQ6ICdzeXN0ZW0nLFxyXG4gICAgICAgIGNvbXByZXNzOiAhb3B0aW9ucy5kZWJ1ZyxcclxuICAgICAgICBuYXRpdmVDb2RlQnVuZGxlTW9kZTogb3B0aW9ucy5uYXRpdmVDb2RlQnVuZGxlTW9kZSxcclxuICAgICAgICBhc3NldFVSTEZvcm1hdDogb3B0aW9ucy5hc3NldFVSTEZvcm1hdCxcclxuICAgICAgICBub0RlcHJlY2F0ZWRGZWF0dXJlcyxcclxuICAgICAgICBzb3VyY2VNYXA6IG9wdGlvbnMuc291cmNlTWFwcyxcclxuICAgICAgICB0YXJnZXRzOiBvcHRpb25zLnRhcmdldHMsXHJcbiAgICAgICAgbG9vc2UsXHJcbiAgICAgICAgZmVhdHVyZXM6IG9wdGlvbnMuaW5jbHVkZU1vZHVsZXMsXHJcbiAgICAgICAgcGxhdGZvcm06IG9wdGlvbnMucGxhdGZvcm1UeXBlLFxyXG4gICAgICAgIGZsYWdzOiBvcHRpb25zLmZsYWdzLFxyXG4gICAgICAgIG1vZGU6ICdCVUlMRCcsXHJcbiAgICAgICAgbWV0YUZpbGUsXHJcbiAgICAgICAgcHJlc2VydmVUeXBlOiBvcHRpb25zLnByZXNlcnZlVHlwZSxcclxuICAgICAgICB3YXNtQ29tcHJlc3Npb25Nb2RlOiBvcHRpb25zLndhc21Db21wcmVzc2lvbk1vZGUsXHJcbiAgICAgICAgZW5hYmxlTmFtZWRSZWdpc3RlckZvclN5c3RlbUpTTW9kdWxlRm9ybWF0OiBvcHRpb25zLmVuYWJsZU5hbWVkUmVnaXN0ZXJGb3JTeXN0ZW1KU01vZHVsZUZvcm1hdCxcclxuICAgICAgICBpbmxpbmVFbnVtOiBvcHRpb25zLmlubGluZUVudW0sXHJcbiAgICAgICAgbWFuZ2xlUHJvcGVydGllcyxcclxuICAgICAgICBtYW5nbGVDb25maWdKc29uTXRpbWUsXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIOW8leaTjue8luivkeebruWJjee8luivkeWGheWtmOWNoOeUqOi+g+Wkp++8jOmcgOimgeeLrOeri+i/m+eoi+euoeeQhlxyXG4gICAgYXdhaXQgd29ya2VyTWFuYWdlci5yZWdpc3RlclRhc2soe1xyXG4gICAgICAgIG5hbWU6ICdidWlsZC1lbmdpbmUnLFxyXG4gICAgICAgIHBhdGg6IGpvaW4oX19kaXJuYW1lLCAnLi9idWlsZC1lbmdpbmUnKSxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGN3ZDogb3B0aW9ucy5lbnRyeSxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbiAgICBjb25zb2xlLmRlYnVnKGBDYWNoZSBpcyBpbnZhbGlkLCBzdGFydCBidWlsZCBlbmdpbmUgd2l0aCBvcHRpb25zOiAke0pTT04uc3RyaW5naWZ5KGJ1aWxkT3B0aW9ucywgbnVsbCwgMil9YCk7XHJcbiAgICBjb25zb2xlLmRlYnVnKGBtZDVTdHJpbmc6ICR7bWQ1U3RyaW5nLnNwbGl0KCcsJykuam9pbignLFxcbicpfWApO1xyXG4gICAgYXdhaXQgd29ya2VyTWFuYWdlci5ydW5UYXNrKCdidWlsZC1lbmdpbmUnLCAnYnVpbGRFbmdpbmVDb21tYW5kJywgW2J1aWxkT3B0aW9uc10pO1xyXG4gICAgLy8gYXdhaXQgYnVpbGRFbmdpbmVDb21tYW5kKGJ1aWxkT3B0aW9ucyk7XHJcblxyXG4gICAgYXdhaXQgb3V0cHV0Q2FjaGVKc29uKG9wdGlvbnMsIG91dHB1dCk7XHJcbiAgICB3b3JrZXJNYW5hZ2VyLmtpbGwoJ2J1aWxkLWVuZ2luZScpO1xyXG5cclxuICAgIGNvbnNvbGUuZGVidWcoYGJ1aWxkIGVuZ2luZSBkb25lOiBvdXRwdXQ6ICR7b3V0cHV0fWApO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgb3V0cHV0LFxyXG4gICAgICAgIG1ldGFGaWxlLFxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkU3BsaXRFbmdpbmUob3B0aW9uczogSUJ1aWxkU2VwYXJhdGVFbmdpbmVPcHRpb25zKTogUHJvbWlzZTxJQnVpbGRTZXBhcmF0ZUVuZ2luZVJlc3VsdD4ge1xyXG4gICAgLy8g5byV5pOO57yW6K+R55uu5YmN57yW6K+R5YaF5a2Y5Y2g55So6L6D5aSn77yM6ZyA6KaB54us56uL6L+b56iL566h55CGXHJcbiAgICBhd2FpdCB3b3JrZXJNYW5hZ2VyLnJlZ2lzdGVyVGFzayh7XHJcbiAgICAgICAgbmFtZTogJ2J1aWxkLWVuZ2luZScsXHJcbiAgICAgICAgcGF0aDogam9pbihfX2Rpcm5hbWUsICcuL2J1aWxkLWVuZ2luZScpLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gYXdhaXQgd29ya2VyTWFuYWdlci5ydW5UYXNrKCdidWlsZC1lbmdpbmUnLCAnYnVpbGRTZXBhcmF0ZUVuZ2luZScsIFtvcHRpb25zXSk7XHJcbiAgICAvLyByZXR1cm4gYXdhaXQgYnVpbGRTZXBhcmF0ZUVuZ2luZShvcHRpb25zKTtcclxufVxyXG4vKipcclxuICog6aqM6K+B57yT5a2Y5byV5pOO55qE5pyJ5pWI5oCn44CCXHJcbiAqIEBwYXJhbSBjYWNoZSDlvJXmk47nvJPlrZjot6/lvoTjgIJcclxuICogQHBhcmFtIGluY3JlbWVudGFsRmlsZSDlop7ph4/mlofku7bjgIJcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlQ2FjaGUoY2FjaGU6IHN0cmluZywgaW5jcmVtZW50YWxGaWxlOiBzdHJpbmcpIHtcclxuICAgIGlmICghYXdhaXQgZnMucGF0aEV4aXN0cyhjYWNoZSkpIHtcclxuICAgICAgICBjb25zb2xlLmRlYnVnKGBFbmdpbmUgY2FjaGUgKCR7Y2FjaGV9KSBkb2VzIG5vdCBleGlzdC5gKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHplcm9DaGVjayA9IGZhbHNlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBmaWxlcyA9IGF3YWl0IGZnKCcqKi8qLmpzJywge1xyXG4gICAgICAgICAgICBjd2Q6IGNhY2hlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChmaWxlcy5sZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgemVyb0NoZWNrID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9IGNhdGNoIHsgfVxyXG5cclxuICAgIGlmICghemVyb0NoZWNrKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGBFbmdpbmUgY2FjaGUgZGlyZWN0b3J5KHtsaW5rKCR7Y2FjaGV9KX0pIGV4aXN0cyBidXQgaGFzIGVtcHR5IGNvbnRlbnQuIEl0J3MgYWJub3JtYWwuYCk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhd2FpdCBjY0J1aWxkLmJ1aWxkRW5naW5lLmlzU291cmNlQ2hhbmdlZChpbmNyZW1lbnRhbEZpbGUpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBpc1ZhbGlkTWV0YShtZXRhRmlsZTogc3RyaW5nKSB7XHJcbiAgICBpZiAoIWF3YWl0IHBhdGhFeGlzdHMobWV0YUZpbGUpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBleHBvcnRNZXRhOiB1bmtub3duO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBleHBvcnRNZXRhID0gYXdhaXQgZnMucmVhZEpzb24obWV0YUZpbGUpO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgZXhwb3J0TWV0YSAhPT0gJ29iamVjdCcgfHwgZXhwb3J0TWV0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBleHBvcnRzID0gKGV4cG9ydE1ldGEgYXMgeyBleHBvcnRzPzogdW5rbm93biB9KS5leHBvcnRzO1xyXG4gICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtYW5nbGVDb25maWdKc29uUGF0aCA9IGpvaW4oYnVpbGRlckNvbmZpZy5wcm9qZWN0Um9vdCwgJ2VuZ2luZS1tYW5nbGUtY29uZmlnLmpzb24nKTtcclxuICAgIGlmIChhd2FpdCBmcy5wYXRoRXhpc3RzKG1hbmdsZUNvbmZpZ0pzb25QYXRoKSkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRNYW5nbGVDb25maWdKc29uTXRpbWUgPSAoYXdhaXQgZnMuc3RhdChtYW5nbGVDb25maWdKc29uUGF0aCkpLm10aW1lTXM7XHJcbiAgICAgICAgY29uc3QgY3VycmVudE1hbmdsZUNvbmZpZ0pzb25SZWFkYWJsZVRpbWUgPSBuZXcgRGF0ZShjdXJyZW50TWFuZ2xlQ29uZmlnSnNvbk10aW1lKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICAgIGNvbnN0IG9sZE1hbmdsZUNvbmZpZ0pzb25NdGltZSA9IChleHBvcnRNZXRhIGFzIHsgbWFuZ2xlQ29uZmlnSnNvbk10aW1lPzogbnVtYmVyIH0pLm1hbmdsZUNvbmZpZ0pzb25NdGltZTtcclxuICAgICAgICBjb25zdCBvbGRNYW5nbGVDb25maWdKc29uUmVhZGFibGVUaW1lID0gb2xkTWFuZ2xlQ29uZmlnSnNvbk10aW1lICE9PSB1bmRlZmluZWQgPyBuZXcgRGF0ZShvbGRNYW5nbGVDb25maWdKc29uTXRpbWUpLnRvTG9jYWxlU3RyaW5nKCkgOiAwO1xyXG4gICAgICAgIGlmIChjdXJyZW50TWFuZ2xlQ29uZmlnSnNvbk10aW1lICE9PSBvbGRNYW5nbGVDb25maWdKc29uTXRpbWUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgZW5naW5lLW1hbmdsZS1jb25maWcuanNvbiBtdGltZSBjaGFuZ2VkOiBub3c6ICR7Y3VycmVudE1hbmdsZUNvbmZpZ0pzb25SZWFkYWJsZVRpbWV9ICE9PSBvbGQ6ICR7b2xkTWFuZ2xlQ29uZmlnSnNvblJlYWRhYmxlVGltZX1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYGVuZ2luZS1tYW5nbGUtY29uZmlnLmpzb24gbXRpbWUgaXNuJ3QgY2hhbmdlZDogbm93OiAke2N1cnJlbnRNYW5nbGVDb25maWdKc29uUmVhZGFibGVUaW1lfSA9PT0gb2xkOiAke29sZE1hbmdsZUNvbmZpZ0pzb25SZWFkYWJsZVRpbWV9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjYWxjTWQ1U3RyaW5nKGNvbmZpZzogSUJ1aWxkRW5naW5lUGFyYW0sIGtleXM6IHJlYWRvbmx5IHN0cmluZ1tdKSB7XHJcbiAgICBsZXQgc3RyID0gJyc7XHJcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzIGFzIChrZXlvZiBJQnVpbGRFbmdpbmVQYXJhbSlbXSkge1xyXG4gICAgICAgIHN0ciArPSBgJHtrZXl9PSR7SlNPTi5zdHJpbmdpZnkoY29uZmlnW2tleV0pfSxgO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN0cjtcclxufVxyXG5cclxuLyoqXHJcbiAqIOeUn+aIkOW8leaTjuaWh+S7tuWSjOWvueW6lOeahCBtYXAg5paH5Lu2XHJcbiAqIEBwYXJhbSBvcHRpb25zXHJcbiAqIEBwYXJhbSBvdXRwdXRcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIG91dHB1dENhY2hlSnNvbihvcHRpb25zOiBJQnVpbGRFbmdpbmVQYXJhbSwgb3V0cHV0OiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IGRlc3QgPSBqb2luKGRpcm5hbWUob3V0cHV0KSwgYCR7RW5naW5lQ2FjaGVOYW1lfS5qc29uYCk7XHJcbiAgICBsZXQgZGF0YTogYW55ID0ge307XHJcbiAgICBpZiAoYXdhaXQgcGF0aEV4aXN0cyhkZXN0KSkge1xyXG4gICAgICAgIGRhdGEgPSBhd2FpdCByZWFkSnNvbihkZXN0KTtcclxuICAgIH1cclxuICAgIGRhdGEgPSBkYXRhIHx8IHt9O1xyXG4gICAgY29uc3QgaGFzaE5hbWUgPSBiYXNlbmFtZShvdXRwdXQpO1xyXG4gICAgZGF0YVtoYXNoTmFtZV0gPSBvcHRpb25zO1xyXG4gICAgYXdhaXQgb3V0cHV0SlNPTihkZXN0LCBkYXRhKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHF1ZXJ5RW5naW5lSW1wb3J0TWFwKFxyXG4gICAgbWV0YVBhdGg6IHN0cmluZywgZW5naW5lUGF0aDogc3RyaW5nLFxyXG4gICAgaW1wb3J0TWFwRGlyOiBzdHJpbmcsXHJcbiAgICBiYXNlVXJsPzogc3RyaW5nKSB7XHJcbiAgICBsZXQgZXhwb3J0TWV0YTogY2NCdWlsZC5idWlsZEVuZ2luZS5SZXN1bHQ7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGV4cG9ydE1ldGEgPSBhd2FpdCBmcy5yZWFkSnNvbihtZXRhUGF0aCk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byByZWFkIGVuZ2luZSBleHBvcnQgbWV0YSwgZW5naW5lIG1pZ2h0IG5vdCBoYXZlIGJlZW4gYnVpbGQgY29ycmVjdGx5OiAke2Vycn1gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBiYXNlVXJsT2JqID0gYmFzZVVybCA/IG5ldyBVUkwoYmFzZVVybCkgOiB1bmRlZmluZWQ7XHJcblxyXG4gICAgY29uc3QgZ2V0SW1wb3J0VVJMID0gKG1vZHVsZUZpbGU6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIGxldCBpbXBvcnRVcmw6IHN0cmluZztcclxuICAgICAgICBpZiAoYmFzZVVybE9iaikge1xyXG4gICAgICAgICAgICBpbXBvcnRVcmwgPSBuZXcgVVJMKG1vZHVsZUZpbGUsIGJhc2VVcmxPYmopLmhyZWY7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaW1wb3J0VXJsID0gYC4vJHtyZWxhdGl2ZVVybChpbXBvcnRNYXBEaXIsIHBzLmpvaW4oZW5naW5lUGF0aCwgbW9kdWxlRmlsZSkpfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbXBvcnRVcmw7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGltcG9ydE1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xyXG4gICAgZm9yIChjb25zdCBbbW9kdWxlTmFtZSwgbW9kdWxlRmlsZV0gb2YgT2JqZWN0LmVudHJpZXMoZXhwb3J0TWV0YS5leHBvcnRzKSkge1xyXG4gICAgICAgIC8vIGltcG9ydE1hcC5pbXBvcnRzW21vZHVsZU5hbWVdID0gZ2V0SW1wb3J0VVJMKG1vZHVsZUZpbGUpO1xyXG4gICAgICAgIGltcG9ydE1hcFttb2R1bGVOYW1lXSA9IGdldEltcG9ydFVSTChtb2R1bGVGaWxlKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IFthbGlhcywgbW9kdWxlRmlsZV0gb2YgT2JqZWN0LmVudHJpZXMoZXhwb3J0TWV0YS5jaHVua0FsaWFzZXMpKSB7XHJcbiAgICAgICAgLy8gaW1wb3J0TWFwLmltcG9ydHNbYWxpYXNdID0gZ2V0SW1wb3J0VVJMKG1vZHVsZUZpbGUpO1xyXG4gICAgICAgIGltcG9ydE1hcFthbGlhc10gPSBnZXRJbXBvcnRVUkwobW9kdWxlRmlsZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW1wb3J0TWFwO1xyXG59XHJcbiJdfQ==