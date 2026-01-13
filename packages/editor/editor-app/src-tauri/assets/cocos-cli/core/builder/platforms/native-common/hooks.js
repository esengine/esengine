'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwError = void 0;
exports.onBeforeBuild = onBeforeBuild;
exports.onAfterInit = onAfterInit;
exports.onAfterBundleInit = onAfterBundleInit;
exports.onAfterBundleDataTask = onAfterBundleDataTask;
exports.onAfterCompressSettings = onAfterCompressSettings;
exports.onAfterBuild = onAfterBuild;
exports.onBeforeMake = onBeforeMake;
exports.make = make;
exports.run = run;
const os_1 = __importDefault(require("os"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const native_utils_1 = require("./native-utils");
const i18n_1 = __importDefault(require("../../../base/i18n"));
const engine_1 = require("../../../engine");
const utils_1 = require("../../worker/builder/utils");
const manager_1 = __importDefault(require("./pack-tool/manager"));
exports.throwError = true;
function fixPath(p) {
    if (os_1.default.platform() === 'win32') {
        return p.replace(/\\/g, '/').replace(/\/+/, '/');
    }
    return p;
}
async function genCocosParams(options, result) {
    const name = options.name;
    const engineInfo = options.engineInfo;
    const pkgOptions = options.packages[options.platform];
    const params = {
        buildDir: (0, path_1.dirname)(result.paths.dir),
        buildAssetsDir: result.paths.dir,
        projDir: result.paths.projectRoot,
        cmakePath: await (0, native_utils_1.getCmakePath)(),
        nativeEnginePath: engineInfo.native.path,
        enginePath: engineInfo.typescript.path,
        projectName: name,
        debug: options.debug,
        encrypted: pkgOptions.encrypted,
        xxteaKey: pkgOptions.xxteaKey,
        compressZip: pkgOptions.compressZip,
        // @ts-ignore
        cMakeConfig: {
            APP_NAME: `set(APP_NAME "${name}")`,
            // 路径类的字段需要加 “” 否则当路径存在空格将会报错
            COCOS_X_PATH: `set(COCOS_X_PATH "${fixPath(engineInfo.native.path)}")`,
            USE_JOB_SYSTEM_TASKFLOW: pkgOptions.JobSystem === 'taskFlow',
            USE_JOB_SYSTEM_TBB: pkgOptions.JobSystem === 'tbb',
            ENABLE_FLOAT_OUTPUT: options.macroConfig.ENABLE_FLOAT_OUTPUT,
        },
        platformParams: {},
        platform: options.platform,
        // @ts-ignore TODO 需要和 native pack tool 的参数 init 一起转移到各个平台插件内，Linux 没有构建配置信息
        packageName: (options.packages[options.platform] && options.packages[options.platform].packageName) || '',
    };
    // 调试模式下，加密脚本功能无效
    if (options.debug && params.encrypted) {
        console.warn(i18n_1.default.t('builder.platforms.native.encrypt.disable_tips'));
        params.encrypted = false;
    }
    if (engineInfo.native.type === 'custom') {
        params.cMakeConfig.BUILTIN_COCOS_X_PATH = `set(BUILTIN_COCOS_X_PATH "${fixPath(engineInfo.native.builtin)}")`;
    }
    const moduleConfig = engine_1.Engine.queryModuleConfig().moduleCmakeConfig;
    Object.keys(moduleConfig).forEach((module) => {
        if (moduleConfig[module].native) {
            params.cMakeConfig[moduleConfig[module].native] = `set(${moduleConfig[module].native} ${options.includeModules.includes(module) ? 'ON' : 'OFF'})`;
        }
    });
    if (!(0, fs_extra_1.existsSync)(params.buildDir)) {
        await (0, fs_extra_1.mkdir)(params.buildDir);
    }
    return params;
}
/**
 * 获取适配于指定 Lite 的 browserslist 查询。
 *
 * @param repo Lite 的仓库地址。
 */
async function getBrowserslistQuery(repo) {
    const browserslistrcPath = (0, path_1.join)(repo, '.browserslistrc');
    let browserslistrcSource;
    try {
        browserslistrcSource = await (0, fs_extra_1.readFile)(browserslistrcPath, 'utf8');
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
class ShareData {
    _map = {};
    _platform;
    constructor(platform) {
        this._platform = platform;
    }
    set(key, data) {
        this._map[key] = data;
    }
    get(key) {
        return this._map[key];
    }
    clear() {
        this._map = {};
    }
}
class ShareDataInHooks {
    static _map = new Map();
}
// ******************* 钩子函数入口 ******************
function onBeforeBuild(options) {
    // 修改此参数以避免构建时清空原目录
    options.useCache = true;
}
async function onAfterInit(options, result) {
    // 3.4 在 m1 支持了 physx，这部分代码保留一个版本，3.5 后再移除这部分代码和对应 i18n
    // if (options.platform === 'mac' && options.packages.mac!.supportM1 && options.includeModules.includes('physics-physx')) {
    //     throw new Error(i18n.t('builder.platforms.mac.error.m1_with_physic_x'));
    // }
    if (options.server && !options.server.endsWith('/')) {
        options.server += '/';
    }
    // 初始化 2DX 路径
    const { native: { path: nativeRoot }, typescript: { path: engineRoot }, } = options.engineInfo;
    // 后续要支持命令行传参的自定义引擎，因而 native pack tool 管理器的初始化不能放在 load 钩子里
    console.debug('Native engine root:' + nativeRoot);
    this.buildExitRes.dest = result.paths.dir;
    const assetsLink = (0, path_1.join)(result.paths.dir, 'assets');
    result.paths.dir = (0, path_1.join)(result.paths.dir, 'data');
    const output = result.paths.dir;
    if (options.buildMode === 'normal') {
        // 清空并创建 output 文件夹，后续才能添加软链接
        await (0, fs_extra_1.emptyDirSync)(output);
    }
    // 注入一些改变引擎编译的参数，需要在 result.paths.dir 修改过后
    Object.assign(options.buildEngineParam, {
        output: (0, path_1.join)(result.paths.dir, 'src/cocos-js'),
    });
    result.paths.engineDir = options.buildEngineParam.output;
    // To support build-plugins before v3.5.0, need link `assets` to `data/`
    try {
        if (!(0, fs_extra_1.existsSync)(assetsLink)) {
            (0, fs_extra_1.symlinkSync)(output, assetsLink, 'junction');
        }
    }
    catch (e) {
        console.error(`Failed to create symbolic link ${assetsLink}`);
        console.error(e);
    }
    const params = await genCocosParams(options, result);
    options.cocosParams = params;
    options.generateCompileConfig = true;
    // 拷贝 adapter 文件
    for (const name of ['web-adapter', 'engine-adapter']) {
        await (0, fs_extra_1.copy)((0, path_1.join)(params.enginePath, 'bin/adapter/native', `${name}.${options.debug ? '' : 'min.'}js`), (0, path_1.join)(result.paths.dir, 'jsb-adapter', `${name}.js`));
    }
}
async function onAfterBundleInit(options) {
    // Note: 独立 bundle 构建没有 options.engineInfo 需要自行查询
    const { native: { path: nativeRoot }, } = options.engineInfo;
    options.buildScriptParam.hotModuleReload = options.packages[options.platform].hotModuleReload;
    if (options.polyfills) {
        options.polyfills.asyncFunctions = false;
    }
    let targets;
    const browserslistQueries = await getBrowserslistQuery(nativeRoot);
    if (browserslistQueries) {
        targets = browserslistQueries;
    }
    if (targets) {
        options.buildScriptParam.targets = targets;
        if (!options.buildScriptParam.polyfills) {
            options.buildScriptParam.polyfills = {};
        }
        options.buildScriptParam.polyfills.targets = targets;
        if ('asyncFunctions' in options.buildScriptParam.polyfills) {
            delete options.buildScriptParam.polyfills.asyncFunctions;
        }
    }
    options.buildScriptParam.system = { preset: 'commonjs-like' };
}
async function onAfterBundleDataTask(options, bundles, cache) {
    for (const bundle of bundles) {
        bundle.configOutPutName = 'cc.config';
    }
}
/**
 * !! service 插件依赖了此时序内的 create 行为，需要在 onAfterCompressSettings 之前处理好内置模板拷贝
 * onAfterCompressSettings -> onBeforeCopyBuildTemplate 符合构建模板拷贝时序问题
 * @param this
 * @param options
 * @param result
 */
async function onAfterCompressSettings(options, result) {
    // const output = result.paths.dir;
    // const args = ['compile', '-p', 'mac', '-m', 'debug', '--compile-script', '0'];
    // await cocos(args, {
    //     cwd: output,
    // });
    // 支持自定义模板 index.ejs
    const buildTemplateDir = (0, path_1.join)(options.engineInfo.typescript.path, 'templates/native');
    const indexJsTemplateRenderData = {
        polyfillsBundleFile: (result.paths.polyfillsJs && (0, utils_1.relativeUrl)(result.paths.dir, result.paths.polyfillsJs)) || false,
        systemJsBundleFile: (0, utils_1.relativeUrl)(result.paths.dir, result.paths.systemJs),
        importMapFile: (0, utils_1.relativeUrl)(result.paths.dir, result.paths.importMap),
        applicationJs: './' + (0, utils_1.relativeUrl)(result.paths.dir, result.paths.applicationJS),
    };
    // index.ejs 模板文件单独支持在 native 里，其他自定义模板文件加在具体平台模板目录下
    const indexJsTemplatePath = this.buildTemplate.initUrl('index.ejs') || (0, path_1.join)(buildTemplateDir, 'index.ejs');
    const indexJsSource = (await ejs_1.default.renderFile(indexJsTemplatePath, indexJsTemplateRenderData)).toString();
    await (0, fs_extra_1.writeFile)((0, path_1.join)(result.paths.dir, 'main.js'), indexJsSource, 'utf8');
    options.md5CacheOptions.replaceOnly.push('main.js');
    // 【注意时序】
    // 1. 原生工程模板要尽早生成方便后续其他构建插件（service）做一些原生工程的调整或者 sdk 接入等等
    // 2. create 里还包含了脚本加密，为了给用户预留能在 onAfterBuildAssets 修改脚本的时序，需要在 onAfterBuildAssets 钩子之后再执行
    // 3. 在 create 之前要准备几乎所有的项目工程文件，包括 main.js
    const packTools = await manager_1.default.create(options.cocosParams);
    options.packages[options.platform].projectDistPath = packTools.paths.nativePrjDir;
    this.buildExitRes.custom.nativePrjDir = packTools.paths.nativePrjDir;
    // 加密后再更改 remote 目录，否则 remote 目录可能会没有加密到
    const server = options.server || '';
    const remoteDir = (0, path_1.resolve)(result.paths.dir, '../remote');
    // 目前原生平台构建主流程不会清理 data 目录外的文件夹，需要平台插件自行清理旧数据
    (0, fs_extra_1.removeSync)(remoteDir);
    if (server && (0, fs_extra_1.existsSync)(result.paths.remote)) {
        try {
            // moveSync 默认不会覆盖已存在的同名文件，在移动之前需要确认目标文件夹已被清空
            (0, fs_extra_1.moveSync)(result.paths.remote, remoteDir);
            result.paths.remote = remoteDir;
        }
        catch (error) {
            // HACK 自动化偶然会遇到这个问题，原因未知，先不影响构建流程，直接报错也可
            console.error(error);
        }
    }
}
/**
 * 生成原生工程以及相关链接等
 * @param options
 * @param result
 */
async function onAfterBuild(options, result) {
    const tool = await manager_1.default.generate(options.cocosParams);
    this.buildExitRes.custom.nativePrjDir = tool.paths.nativePrjDir;
}
async function onBeforeMake(root, options) {
    if (options.cocosParams) {
        return;
    }
    // @ts-ignore
    if (!options.cMakeConfig || !this.buildTaskOptions) {
        // 如果当前 options 数据不是 cocos param 的数据，需要让用户重新构建
        throw new Error('Get cache build options form cocos.compile.json failed! Please recompile the build task again.');
    }
    // 自 3.8.4 起，移除 native 平台对 cocos.compile 的 HACK，此兼容代码保留两三个大版本即可
    // 由于要兼容命令行生成的行为，不做迁移，在运行时兼容处理
    this.options = this.buildTaskOptions;
    // @ts-ignore
    this.options.cocosParams = JSON.parse(JSON.stringify(options));
    // 遇到就修改原来的 cocos.compile.json 文件
    await this.saveOptions();
}
/**
 * 编译
 * @param root
 * @param options
 */
async function make(root, options) {
    const tool = await manager_1.default.make(options.cocosParams);
    this.buildExitRes.custom.nativePrjDir = tool.paths.nativePrjDir;
    this.buildExitRes.custom.executableFile = await tool.getExecutableFile();
}
/**
 * 运行方法
 * @param root
 * @param options
 */
async function run(root, options) {
    await manager_1.default.run(options.cocosParams);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3BsYXRmb3Jtcy9uYXRpdmUtY29tbW9uL2hvb2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7O0FBb0piLHNDQUdDO0FBRUQsa0NBaURDO0FBRUQsOENBK0JDO0FBRUQsc0RBSUM7QUFTRCwwREEyQ0M7QUFPRCxvQ0FJQztBQUVELG9DQWdCQztBQU9ELG9CQUlDO0FBT0Qsa0JBRUM7QUFwVkQsNENBQW9CO0FBQ3BCLDhDQUFzQjtBQUN0QiwrQkFBOEM7QUFDOUMsdUNBVWtCO0FBQ2xCLGlEQUE4QztBQUc5Qyw4REFBc0M7QUFDdEMsNENBQXlDO0FBQ3pDLHNEQUF5RDtBQUV6RCxrRUFBbUQ7QUFFdEMsUUFBQSxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBRS9CLFNBQVMsT0FBTyxDQUFDLENBQVM7SUFDdEIsSUFBSSxZQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssT0FBTyxFQUFFLENBQUM7UUFDNUIsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFDRCxPQUFPLENBQUMsQ0FBQztBQUNiLENBQUM7QUFHRCxLQUFLLFVBQVUsY0FBYyxDQUFDLE9BQW9CLEVBQUUsTUFBMkI7SUFDM0UsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztJQUMxQixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO0lBQ3RDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXRELE1BQU0sTUFBTSxHQUF3QjtRQUNoQyxRQUFRLEVBQUUsSUFBQSxjQUFPLEVBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENB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aUJBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNwRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IG9zIGZyb20gJ29zJztcclxuaW1wb3J0IEVqcyBmcm9tICdlanMnO1xyXG5pbXBvcnQgeyBkaXJuYW1lLCBqb2luLCByZXNvbHZlIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7XHJcbiAgICBleGlzdHNTeW5jLFxyXG4gICAgbWtkaXIsXHJcbiAgICBtb3ZlU3luYyxcclxuICAgIHJlYWRGaWxlLFxyXG4gICAgcmVtb3ZlU3luYyxcclxuICAgIHdyaXRlRmlsZSxcclxuICAgIHN5bWxpbmtTeW5jLFxyXG4gICAgY29weSxcclxuICAgIGVtcHR5RGlyU3luYyxcclxufSBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCB7IGdldENtYWtlUGF0aCB9IGZyb20gJy4vbmF0aXZlLXV0aWxzJztcclxuaW1wb3J0IHsgSUJ1bmRsZSwgQnVpbGRlckNhY2hlLCBJQnVpbGRlciwgSUJ1aWxkU3RhZ2VUYXNrLCBJbnRlcm5hbEJ1aWxkUmVzdWx0LCBQbGF0Zm9ybSB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBDb2Nvc1BhcmFtcyB9IGZyb20gJy4vcGFjay10b29sL2Jhc2UvZGVmYXVsdCc7XHJcbmltcG9ydCBpMThuIGZyb20gJy4uLy4uLy4uL2Jhc2UvaTE4bic7XHJcbmltcG9ydCB7IEVuZ2luZSB9IGZyb20gJy4uLy4uLy4uL2VuZ2luZSc7XHJcbmltcG9ydCB7IHJlbGF0aXZlVXJsIH0gZnJvbSAnLi4vLi4vd29ya2VyL2J1aWxkZXIvdXRpbHMnO1xyXG5pbXBvcnQgeyBJVGFza09wdGlvbiB9IGZyb20gJy4vdHlwZSc7XHJcbmltcG9ydCBuYXRpdmVQYWNrVG9vbE1nIGZyb20gJy4vcGFjay10b29sL21hbmFnZXInO1xyXG5cclxuZXhwb3J0IGNvbnN0IHRocm93RXJyb3IgPSB0cnVlO1xyXG5cclxuZnVuY3Rpb24gZml4UGF0aChwOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgaWYgKG9zLnBsYXRmb3JtKCkgPT09ICd3aW4zMicpIHtcclxuICAgICAgICByZXR1cm4gcC5yZXBsYWNlKC9cXFxcL2csICcvJykucmVwbGFjZSgvXFwvKy8sICcvJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcDtcclxufVxyXG5cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdlbkNvY29zUGFyYW1zKG9wdGlvbnM6IElUYXNrT3B0aW9uLCByZXN1bHQ6IEludGVybmFsQnVpbGRSZXN1bHQpOiBQcm9taXNlPENvY29zUGFyYW1zPE9iamVjdD4+IHtcclxuICAgIGNvbnN0IG5hbWUgPSBvcHRpb25zLm5hbWU7XHJcbiAgICBjb25zdCBlbmdpbmVJbmZvID0gb3B0aW9ucy5lbmdpbmVJbmZvO1xyXG4gICAgY29uc3QgcGtnT3B0aW9ucyA9IG9wdGlvbnMucGFja2FnZXNbb3B0aW9ucy5wbGF0Zm9ybV07XHJcblxyXG4gICAgY29uc3QgcGFyYW1zOiBDb2Nvc1BhcmFtczxPYmplY3Q+ID0ge1xyXG4gICAgICAgIGJ1aWxkRGlyOiBkaXJuYW1lKHJlc3VsdC5wYXRocy5kaXIpLFxyXG4gICAgICAgIGJ1aWxkQXNzZXRzRGlyOiByZXN1bHQucGF0aHMuZGlyLFxyXG4gICAgICAgIHByb2pEaXI6IHJlc3VsdC5wYXRocy5wcm9qZWN0Um9vdCxcclxuICAgICAgICBjbWFrZVBhdGg6IGF3YWl0IGdldENtYWtlUGF0aCgpLFxyXG4gICAgICAgIG5hdGl2ZUVuZ2luZVBhdGg6IGVuZ2luZUluZm8ubmF0aXZlLnBhdGgsXHJcbiAgICAgICAgZW5naW5lUGF0aDogZW5naW5lSW5mby50eXBlc2NyaXB0LnBhdGgsXHJcbiAgICAgICAgcHJvamVjdE5hbWU6IG5hbWUsXHJcbiAgICAgICAgZGVidWc6IG9wdGlvbnMuZGVidWcsXHJcbiAgICAgICAgZW5jcnlwdGVkOiBwa2dPcHRpb25zLmVuY3J5cHRlZCxcclxuICAgICAgICB4eHRlYUtleTogcGtnT3B0aW9ucy54eHRlYUtleSxcclxuICAgICAgICBjb21wcmVzc1ppcDogcGtnT3B0aW9ucy5jb21wcmVzc1ppcCxcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY01ha2VDb25maWc6IHtcclxuICAgICAgICAgICAgQVBQX05BTUU6IGBzZXQoQVBQX05BTUUgXCIke25hbWV9XCIpYCxcclxuICAgICAgICAgICAgLy8g6Lev5b6E57G755qE5a2X5q616ZyA6KaB5YqgIOKAnOKAnSDlkKbliJnlvZPot6/lvoTlrZjlnKjnqbrmoLzlsIbkvJrmiqXplJlcclxuICAgICAgICAgICAgQ09DT1NfWF9QQVRIOiBgc2V0KENPQ09TX1hfUEFUSCBcIiR7Zml4UGF0aChlbmdpbmVJbmZvLm5hdGl2ZS5wYXRoKX1cIilgLFxyXG4gICAgICAgICAgICBVU0VfSk9CX1NZU1RFTV9UQVNLRkxPVzogcGtnT3B0aW9ucy5Kb2JTeXN0ZW0gPT09ICd0YXNrRmxvdycsXHJcbiAgICAgICAgICAgIFVTRV9KT0JfU1lTVEVNX1RCQjogcGtnT3B0aW9ucy5Kb2JTeXN0ZW0gPT09ICd0YmInLFxyXG4gICAgICAgICAgICBFTkFCTEVfRkxPQVRfT1VUUFVUOiBvcHRpb25zLm1hY3JvQ29uZmlnLkVOQUJMRV9GTE9BVF9PVVRQVVQsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwbGF0Zm9ybVBhcmFtczoge30sXHJcbiAgICAgICAgcGxhdGZvcm06IG9wdGlvbnMucGxhdGZvcm0sXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUT0RPIOmcgOimgeWSjCBuYXRpdmUgcGFjayB0b29sIOeahOWPguaVsCBpbml0IOS4gOi1t+i9rOenu+WIsOWQhOS4quW5s+WPsOaPkuS7tuWGhe+8jExpbnV4IOayoeacieaehOW7uumFjee9ruS/oeaBr1xyXG4gICAgICAgIHBhY2thZ2VOYW1lOiAob3B0aW9ucy5wYWNrYWdlc1tvcHRpb25zLnBsYXRmb3JtXSAmJiBvcHRpb25zLnBhY2thZ2VzW29wdGlvbnMucGxhdGZvcm1dLnBhY2thZ2VOYW1lKSB8fCAnJyxcclxuICAgIH07XHJcblxyXG4gICAgLy8g6LCD6K+V5qih5byP5LiL77yM5Yqg5a+G6ISa5pys5Yqf6IO95peg5pWIXHJcbiAgICBpZiAob3B0aW9ucy5kZWJ1ZyAmJiBwYXJhbXMuZW5jcnlwdGVkKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGkxOG4udCgnYnVpbGRlci5wbGF0Zm9ybXMubmF0aXZlLmVuY3J5cHQuZGlzYWJsZV90aXBzJykpO1xyXG4gICAgICAgIHBhcmFtcy5lbmNyeXB0ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZW5naW5lSW5mby5uYXRpdmUudHlwZSA9PT0gJ2N1c3RvbScpIHtcclxuICAgICAgICBwYXJhbXMuY01ha2VDb25maWcuQlVJTFRJTl9DT0NPU19YX1BBVEggPSBgc2V0KEJVSUxUSU5fQ09DT1NfWF9QQVRIIFwiJHtmaXhQYXRoKGVuZ2luZUluZm8ubmF0aXZlLmJ1aWx0aW4pfVwiKWA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbW9kdWxlQ29uZmlnID0gRW5naW5lLnF1ZXJ5TW9kdWxlQ29uZmlnKCkubW9kdWxlQ21ha2VDb25maWc7XHJcbiAgICBPYmplY3Qua2V5cyhtb2R1bGVDb25maWcpLmZvckVhY2goKG1vZHVsZSkgPT4ge1xyXG4gICAgICAgIGlmIChtb2R1bGVDb25maWdbbW9kdWxlXS5uYXRpdmUpIHtcclxuICAgICAgICAgICAgcGFyYW1zLmNNYWtlQ29uZmlnW21vZHVsZUNvbmZpZ1ttb2R1bGVdLm5hdGl2ZSFdID0gYHNldCgke21vZHVsZUNvbmZpZ1ttb2R1bGVdLm5hdGl2ZX0gJHtvcHRpb25zLmluY2x1ZGVNb2R1bGVzLmluY2x1ZGVzKG1vZHVsZSkgPyAnT04nIDogJ09GRid9KWA7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFleGlzdHNTeW5jKHBhcmFtcy5idWlsZERpcikpIHtcclxuICAgICAgICBhd2FpdCBta2RpcihwYXJhbXMuYnVpbGREaXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwYXJhbXM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDojrflj5bpgILphY3kuo7mjIflrpogTGl0ZSDnmoQgYnJvd3NlcnNsaXN0IOafpeivouOAglxyXG4gKlxyXG4gKiBAcGFyYW0gcmVwbyBMaXRlIOeahOS7k+W6k+WcsOWdgOOAglxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0QnJvd3NlcnNsaXN0UXVlcnkocmVwbzogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBicm93c2Vyc2xpc3RyY1BhdGggPSBqb2luKHJlcG8sICcuYnJvd3NlcnNsaXN0cmMnKTtcclxuICAgIGxldCBicm93c2Vyc2xpc3RyY1NvdXJjZTogc3RyaW5nO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBicm93c2Vyc2xpc3RyY1NvdXJjZSA9IGF3YWl0IHJlYWRGaWxlKGJyb3dzZXJzbGlzdHJjUGF0aCwgJ3V0ZjgnKTtcclxuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHF1ZXJpZXMgPSBwYXJzZUJyb3dzZXJzbGlzdFF1ZXJpZXMoYnJvd3NlcnNsaXN0cmNTb3VyY2UpO1xyXG4gICAgaWYgKHF1ZXJpZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICByZXR1cm4gcXVlcmllcy5qb2luKCcgb3IgJyk7XHJcblxyXG4gICAgZnVuY3Rpb24gcGFyc2VCcm93c2Vyc2xpc3RRdWVyaWVzKHNvdXJjZTogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgcXVlcmllczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2Ygc291cmNlLnNwbGl0KCdcXG4nKSkge1xyXG4gICAgICAgICAgICBjb25zdCBpU2hhcnAgPSBsaW5lLmluZGV4T2YoJyMnKTtcclxuICAgICAgICAgICAgY29uc3QgbGluZVRyaW1tZWQgPSAoaVNoYXJwIDwgMCA/IGxpbmUgOiBsaW5lLnN1YnN0cigwLCBpU2hhcnApKS50cmltKCk7XHJcbiAgICAgICAgICAgIGlmIChsaW5lVHJpbW1lZC5sZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHF1ZXJpZXMucHVzaChsaW5lVHJpbW1lZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHF1ZXJpZXM7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNoYXJlRGF0YSB7XHJcbiAgICBfbWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XHJcbiAgICBfcGxhdGZvcm06IFBsYXRmb3JtO1xyXG4gICAgY29uc3RydWN0b3IocGxhdGZvcm06IFBsYXRmb3JtKSB7XHJcbiAgICAgICAgdGhpcy5fcGxhdGZvcm0gPSBwbGF0Zm9ybTtcclxuICAgIH1cclxuICAgIHNldDxUPihrZXk6IHN0cmluZywgZGF0YTogVCkge1xyXG4gICAgICAgIHRoaXMuX21hcFtrZXldID0gZGF0YTtcclxuICAgIH1cclxuICAgIGdldDxUPihrZXk6IHN0cmluZyk6IFQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9tYXBba2V5XTtcclxuICAgIH1cclxuICAgIGNsZWFyKCkge1xyXG4gICAgICAgIHRoaXMuX21hcCA9IHt9O1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTaGFyZURhdGFJbkhvb2tzIHtcclxuICAgIHN0YXRpYyBfbWFwOiBNYXA8UGxhdGZvcm0sIFNoYXJlRGF0YT4gPSBuZXcgTWFwKCk7XHJcbn1cclxuXHJcbi8vICoqKioqKioqKioqKioqKioqKiog6ZKp5a2Q5Ye95pWw5YWl5Y+jICoqKioqKioqKioqKioqKioqKlxyXG5leHBvcnQgZnVuY3Rpb24gb25CZWZvcmVCdWlsZChvcHRpb25zOiBJVGFza09wdGlvbikge1xyXG4gICAgLy8g5L+u5pS55q2k5Y+C5pWw5Lul6YG/5YWN5p6E5bu65pe25riF56m65Y6f55uu5b2VXHJcbiAgICBvcHRpb25zLnVzZUNhY2hlID0gdHJ1ZTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uQWZ0ZXJJbml0KHRoaXM6IElCdWlsZGVyLCBvcHRpb25zOiBJVGFza09wdGlvbiwgcmVzdWx0OiBJbnRlcm5hbEJ1aWxkUmVzdWx0KSB7XHJcbiAgICAvLyAzLjQg5ZyoIG0xIOaUr+aMgeS6hiBwaHlzeO+8jOi/memDqOWIhuS7o+eggeS/neeVmeS4gOS4queJiOacrO+8jDMuNSDlkI7lho3np7vpmaTov5npg6jliIbku6PnoIHlkozlr7nlupQgaTE4blxyXG4gICAgLy8gaWYgKG9wdGlvbnMucGxhdGZvcm0gPT09ICdtYWMnICYmIG9wdGlvbnMucGFja2FnZXMubWFjIS5zdXBwb3J0TTEgJiYgb3B0aW9ucy5pbmNsdWRlTW9kdWxlcy5pbmNsdWRlcygncGh5c2ljcy1waHlzeCcpKSB7XHJcbiAgICAvLyAgICAgdGhyb3cgbmV3IEVycm9yKGkxOG4udCgnYnVpbGRlci5wbGF0Zm9ybXMubWFjLmVycm9yLm0xX3dpdGhfcGh5c2ljX3gnKSk7XHJcbiAgICAvLyB9XHJcbiAgICBpZiAob3B0aW9ucy5zZXJ2ZXIgJiYgIW9wdGlvbnMuc2VydmVyLmVuZHNXaXRoKCcvJykpIHtcclxuICAgICAgICBvcHRpb25zLnNlcnZlciArPSAnLyc7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5Yid5aeL5YyWIDJEWCDot6/lvoRcclxuICAgIGNvbnN0IHtcclxuICAgICAgICBuYXRpdmU6IHsgcGF0aDogbmF0aXZlUm9vdCB9LFxyXG4gICAgICAgIHR5cGVzY3JpcHQ6IHsgcGF0aDogZW5naW5lUm9vdCB9LFxyXG4gICAgfSA9IG9wdGlvbnMuZW5naW5lSW5mbztcclxuICAgIC8vIOWQjue7reimgeaUr+aMgeWRveS7pOihjOS8oOWPgueahOiHquWumuS5ieW8leaTju+8jOWboOiAjCBuYXRpdmUgcGFjayB0b29sIOeuoeeQhuWZqOeahOWIneWni+WMluS4jeiDveaUvuWcqCBsb2FkIOmSqeWtkOmHjFxyXG4gICAgY29uc29sZS5kZWJ1ZygnTmF0aXZlIGVuZ2luZSByb290OicgKyBuYXRpdmVSb290KTtcclxuICAgIHRoaXMuYnVpbGRFeGl0UmVzLmRlc3QgPSByZXN1bHQucGF0aHMuZGlyO1xyXG4gICAgY29uc3QgYXNzZXRzTGluayA9IGpvaW4ocmVzdWx0LnBhdGhzLmRpciwgJ2Fzc2V0cycpO1xyXG4gICAgcmVzdWx0LnBhdGhzLmRpciA9IGpvaW4ocmVzdWx0LnBhdGhzLmRpciwgJ2RhdGEnKTtcclxuICAgIGNvbnN0IG91dHB1dCA9IHJlc3VsdC5wYXRocy5kaXI7XHJcbiAgICBpZiAob3B0aW9ucy5idWlsZE1vZGUgPT09ICdub3JtYWwnKSB7XHJcbiAgICAgICAgLy8g5riF56m65bm25Yib5bu6IG91dHB1dCDmlofku7blpLnvvIzlkI7nu63miY3og73mt7vliqDova/pk77mjqVcclxuICAgICAgICBhd2FpdCBlbXB0eURpclN5bmMob3V0cHV0KTtcclxuICAgIH1cclxuICAgIC8vIOazqOWFpeS4gOS6m+aUueWPmOW8leaTjue8luivkeeahOWPguaVsO+8jOmcgOimgeWcqCByZXN1bHQucGF0aHMuZGlyIOS/ruaUuei/h+WQjlxyXG4gICAgT2JqZWN0LmFzc2lnbihvcHRpb25zLmJ1aWxkRW5naW5lUGFyYW0sIHtcclxuICAgICAgICBvdXRwdXQ6IGpvaW4ocmVzdWx0LnBhdGhzLmRpciwgJ3NyYy9jb2Nvcy1qcycpLFxyXG4gICAgfSk7XHJcbiAgICByZXN1bHQucGF0aHMuZW5naW5lRGlyID0gb3B0aW9ucy5idWlsZEVuZ2luZVBhcmFtLm91dHB1dDtcclxuICAgIC8vIFRvIHN1cHBvcnQgYnVpbGQtcGx1Z2lucyBiZWZvcmUgdjMuNS4wLCBuZWVkIGxpbmsgYGFzc2V0c2AgdG8gYGRhdGEvYFxyXG4gICAgdHJ5IHtcclxuICAgICAgICBpZiAoIWV4aXN0c1N5bmMoYXNzZXRzTGluaykpIHtcclxuICAgICAgICAgICAgc3ltbGlua1N5bmMob3V0cHV0LCBhc3NldHNMaW5rLCAnanVuY3Rpb24nKTtcclxuICAgICAgICB9XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIGNyZWF0ZSBzeW1ib2xpYyBsaW5rICR7YXNzZXRzTGlua31gKTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgcGFyYW1zID0gYXdhaXQgZ2VuQ29jb3NQYXJhbXMob3B0aW9ucywgcmVzdWx0KTtcclxuICAgIG9wdGlvbnMuY29jb3NQYXJhbXMgPSBwYXJhbXM7XHJcbiAgICBvcHRpb25zLmdlbmVyYXRlQ29tcGlsZUNvbmZpZyA9IHRydWU7XHJcblxyXG4gICAgLy8g5ou36LSdIGFkYXB0ZXIg5paH5Lu2XHJcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgWyd3ZWItYWRhcHRlcicsICdlbmdpbmUtYWRhcHRlciddKSB7XHJcbiAgICAgICAgYXdhaXQgY29weShcclxuICAgICAgICAgICAgam9pbihwYXJhbXMuZW5naW5lUGF0aCwgJ2Jpbi9hZGFwdGVyL25hdGl2ZScsIGAke25hbWV9LiR7b3B0aW9ucy5kZWJ1ZyA/ICcnIDogJ21pbi4nfWpzYCksXHJcbiAgICAgICAgICAgIGpvaW4ocmVzdWx0LnBhdGhzLmRpciwgJ2pzYi1hZGFwdGVyJywgYCR7bmFtZX0uanNgKSxcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25BZnRlckJ1bmRsZUluaXQob3B0aW9uczogSVRhc2tPcHRpb24pIHtcclxuICAgIC8vIE5vdGU6IOeLrOeriyBidW5kbGUg5p6E5bu65rKh5pyJIG9wdGlvbnMuZW5naW5lSW5mbyDpnIDopoHoh6rooYzmn6Xor6JcclxuICAgIGNvbnN0IHtcclxuICAgICAgICBuYXRpdmU6IHsgcGF0aDogbmF0aXZlUm9vdCB9LFxyXG4gICAgfSA9IG9wdGlvbnMuZW5naW5lSW5mbztcclxuXHJcbiAgICBvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0uaG90TW9kdWxlUmVsb2FkID0gb3B0aW9ucy5wYWNrYWdlc1tvcHRpb25zLnBsYXRmb3JtXS5ob3RNb2R1bGVSZWxvYWQ7XHJcblxyXG4gICAgaWYgKG9wdGlvbnMucG9seWZpbGxzKSB7XHJcbiAgICAgICAgb3B0aW9ucy5wb2x5ZmlsbHMuYXN5bmNGdW5jdGlvbnMgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdGFyZ2V0czogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0IGJyb3dzZXJzbGlzdFF1ZXJpZXMgPSBhd2FpdCBnZXRCcm93c2Vyc2xpc3RRdWVyeShuYXRpdmVSb290KTtcclxuICAgIGlmIChicm93c2Vyc2xpc3RRdWVyaWVzKSB7XHJcbiAgICAgICAgdGFyZ2V0cyA9IGJyb3dzZXJzbGlzdFF1ZXJpZXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhcmdldHMpIHtcclxuICAgICAgICBvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0udGFyZ2V0cyA9IHRhcmdldHM7XHJcbiAgICAgICAgaWYgKCFvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0ucG9seWZpbGxzKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMuYnVpbGRTY3JpcHRQYXJhbS5wb2x5ZmlsbHMgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb3B0aW9ucy5idWlsZFNjcmlwdFBhcmFtLnBvbHlmaWxscy50YXJnZXRzID0gdGFyZ2V0cztcclxuICAgICAgICBpZiAoJ2FzeW5jRnVuY3Rpb25zJyBpbiBvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0ucG9seWZpbGxzKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0ucG9seWZpbGxzLmFzeW5jRnVuY3Rpb25zO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0uc3lzdGVtID0geyBwcmVzZXQ6ICdjb21tb25qcy1saWtlJyB9O1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25BZnRlckJ1bmRsZURhdGFUYXNrKG9wdGlvbnM6IElUYXNrT3B0aW9uLCBidW5kbGVzOiBJQnVuZGxlW10sIGNhY2hlOiBCdWlsZGVyQ2FjaGUpIHtcclxuICAgIGZvciAoY29uc3QgYnVuZGxlIG9mIGJ1bmRsZXMpIHtcclxuICAgICAgICBidW5kbGUuY29uZmlnT3V0UHV0TmFtZSA9ICdjYy5jb25maWcnO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogISEgc2VydmljZSDmj5Lku7bkvp3otZbkuobmraTml7bluo/lhoXnmoQgY3JlYXRlIOihjOS4uu+8jOmcgOimgeWcqCBvbkFmdGVyQ29tcHJlc3NTZXR0aW5ncyDkuYvliY3lpITnkIblpb3lhoXnva7mqKHmnb/mi7fotJ1cclxuICogb25BZnRlckNvbXByZXNzU2V0dGluZ3MgLT4gb25CZWZvcmVDb3B5QnVpbGRUZW1wbGF0ZSDnrKblkIjmnoTlu7rmqKHmnb/mi7fotJ3ml7bluo/pl67pophcclxuICogQHBhcmFtIHRoaXNcclxuICogQHBhcmFtIG9wdGlvbnNcclxuICogQHBhcmFtIHJlc3VsdFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uQWZ0ZXJDb21wcmVzc1NldHRpbmdzKHRoaXM6IElCdWlsZGVyLCBvcHRpb25zOiBJVGFza09wdGlvbiwgcmVzdWx0OiBJbnRlcm5hbEJ1aWxkUmVzdWx0KSB7XHJcbiAgICAvLyBjb25zdCBvdXRwdXQgPSByZXN1bHQucGF0aHMuZGlyO1xyXG4gICAgLy8gY29uc3QgYXJncyA9IFsnY29tcGlsZScsICctcCcsICdtYWMnLCAnLW0nLCAnZGVidWcnLCAnLS1jb21waWxlLXNjcmlwdCcsICcwJ107XHJcbiAgICAvLyBhd2FpdCBjb2NvcyhhcmdzLCB7XHJcbiAgICAvLyAgICAgY3dkOiBvdXRwdXQsXHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICAvLyDmlK/mjIHoh6rlrprkuYnmqKHmnb8gaW5kZXguZWpzXHJcbiAgICBjb25zdCBidWlsZFRlbXBsYXRlRGlyID0gam9pbihvcHRpb25zLmVuZ2luZUluZm8udHlwZXNjcmlwdC5wYXRoLCAndGVtcGxhdGVzL25hdGl2ZScpO1xyXG4gICAgY29uc3QgaW5kZXhKc1RlbXBsYXRlUmVuZGVyRGF0YSA9IHtcclxuICAgICAgICBwb2x5ZmlsbHNCdW5kbGVGaWxlOiAocmVzdWx0LnBhdGhzLnBvbHlmaWxsc0pzICYmIHJlbGF0aXZlVXJsKHJlc3VsdC5wYXRocy5kaXIsIHJlc3VsdC5wYXRocy5wb2x5ZmlsbHNKcykpIHx8IGZhbHNlLFxyXG4gICAgICAgIHN5c3RlbUpzQnVuZGxlRmlsZTogcmVsYXRpdmVVcmwocmVzdWx0LnBhdGhzLmRpciwgcmVzdWx0LnBhdGhzLnN5c3RlbUpzISksXHJcbiAgICAgICAgaW1wb3J0TWFwRmlsZTogcmVsYXRpdmVVcmwocmVzdWx0LnBhdGhzLmRpciwgcmVzdWx0LnBhdGhzLmltcG9ydE1hcCksXHJcbiAgICAgICAgYXBwbGljYXRpb25KczogJy4vJyArIHJlbGF0aXZlVXJsKHJlc3VsdC5wYXRocy5kaXIsIHJlc3VsdC5wYXRocy5hcHBsaWNhdGlvbkpTKSxcclxuICAgIH07XHJcbiAgICAvLyBpbmRleC5lanMg5qih5p2/5paH5Lu25Y2V54us5pSv5oyB5ZyoIG5hdGl2ZSDph4zvvIzlhbbku5boh6rlrprkuYnmqKHmnb/mlofku7bliqDlnKjlhbfkvZPlubPlj7DmqKHmnb/nm67lvZXkuItcclxuICAgIGNvbnN0IGluZGV4SnNUZW1wbGF0ZVBhdGggPSB0aGlzLmJ1aWxkVGVtcGxhdGUuaW5pdFVybCgnaW5kZXguZWpzJykgfHwgam9pbihidWlsZFRlbXBsYXRlRGlyLCAnaW5kZXguZWpzJyk7XHJcbiAgICBjb25zdCBpbmRleEpzU291cmNlOiBzdHJpbmcgPSAoKGF3YWl0IEVqcy5yZW5kZXJGaWxlKGluZGV4SnNUZW1wbGF0ZVBhdGgsIGluZGV4SnNUZW1wbGF0ZVJlbmRlckRhdGEpKSBhcyBzdHJpbmcpLnRvU3RyaW5nKCk7XHJcbiAgICBhd2FpdCB3cml0ZUZpbGUoam9pbihyZXN1bHQucGF0aHMuZGlyLCAnbWFpbi5qcycpLCBpbmRleEpzU291cmNlLCAndXRmOCcpO1xyXG4gICAgb3B0aW9ucy5tZDVDYWNoZU9wdGlvbnMucmVwbGFjZU9ubHkucHVzaCgnbWFpbi5qcycpO1xyXG5cclxuICAgIC8vIOOAkOazqOaEj+aXtuW6j+OAkVxyXG4gICAgLy8gMS4g5Y6f55Sf5bel56iL5qih5p2/6KaB5bC95pep55Sf5oiQ5pa55L6/5ZCO57ut5YW25LuW5p6E5bu65o+S5Lu277yIc2VydmljZe+8ieWBmuS4gOS6m+WOn+eUn+W3peeoi+eahOiwg+aVtOaIluiAhSBzZGsg5o6l5YWl562J562JXHJcbiAgICAvLyAyLiBjcmVhdGUg6YeM6L+Y5YyF5ZCr5LqG6ISa5pys5Yqg5a+G77yM5Li65LqG57uZ55So5oi36aKE55WZ6IO95ZyoIG9uQWZ0ZXJCdWlsZEFzc2V0cyDkv67mlLnohJrmnKznmoTml7bluo/vvIzpnIDopoHlnKggb25BZnRlckJ1aWxkQXNzZXRzIOmSqeWtkOS5i+WQjuWGjeaJp+ihjFxyXG4gICAgLy8gMy4g5ZyoIGNyZWF0ZSDkuYvliY3opoHlh4blpIflh6DkuY7miYDmnInnmoTpobnnm67lt6XnqIvmlofku7bvvIzljIXmi6wgbWFpbi5qc1xyXG4gICAgY29uc3QgcGFja1Rvb2xzID0gYXdhaXQgbmF0aXZlUGFja1Rvb2xNZy5jcmVhdGUob3B0aW9ucy5jb2Nvc1BhcmFtcyk7XHJcbiAgICBvcHRpb25zLnBhY2thZ2VzW29wdGlvbnMucGxhdGZvcm1dLnByb2plY3REaXN0UGF0aCA9IHBhY2tUb29scy5wYXRocy5uYXRpdmVQcmpEaXI7XHJcbiAgICB0aGlzLmJ1aWxkRXhpdFJlcy5jdXN0b20ubmF0aXZlUHJqRGlyID0gcGFja1Rvb2xzLnBhdGhzLm5hdGl2ZVByakRpcjtcclxuICAgIC8vIOWKoOWvhuWQjuWGjeabtOaUuSByZW1vdGUg55uu5b2V77yM5ZCm5YiZIHJlbW90ZSDnm67lvZXlj6/og73kvJrmsqHmnInliqDlr4bliLBcclxuICAgIGNvbnN0IHNlcnZlciA9IG9wdGlvbnMuc2VydmVyIHx8ICcnO1xyXG4gICAgY29uc3QgcmVtb3RlRGlyID0gcmVzb2x2ZShyZXN1bHQucGF0aHMuZGlyLCAnLi4vcmVtb3RlJyk7XHJcbiAgICAvLyDnm67liY3ljp/nlJ/lubPlj7DmnoTlu7rkuLvmtYHnqIvkuI3kvJrmuIXnkIYgZGF0YSDnm67lvZXlpJbnmoTmlofku7blpLnvvIzpnIDopoHlubPlj7Dmj5Lku7boh6rooYzmuIXnkIbml6fmlbDmja5cclxuICAgIHJlbW92ZVN5bmMocmVtb3RlRGlyKTtcclxuICAgIGlmIChzZXJ2ZXIgJiYgZXhpc3RzU3luYyhyZXN1bHQucGF0aHMucmVtb3RlKSkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIG1vdmVTeW5jIOm7mOiupOS4jeS8muimhuebluW3suWtmOWcqOeahOWQjOWQjeaWh+S7tu+8jOWcqOenu+WKqOS5i+WJjemcgOimgeehruiupOebruagh+aWh+S7tuWkueW3suiiq+a4heepulxyXG4gICAgICAgICAgICBtb3ZlU3luYyhyZXN1bHQucGF0aHMucmVtb3RlLCByZW1vdGVEaXIpO1xyXG4gICAgICAgICAgICByZXN1bHQucGF0aHMucmVtb3RlID0gcmVtb3RlRGlyO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIC8vIEhBQ0sg6Ieq5Yqo5YyW5YG254S25Lya6YGH5Yiw6L+Z5Liq6Zeu6aKY77yM5Y6f5Zug5pyq55+l77yM5YWI5LiN5b2x5ZON5p6E5bu65rWB56iL77yM55u05o6l5oql6ZSZ5Lmf5Y+vXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOeUn+aIkOWOn+eUn+W3peeoi+S7peWPiuebuOWFs+mTvuaOpeetiVxyXG4gKiBAcGFyYW0gb3B0aW9uc1xyXG4gKiBAcGFyYW0gcmVzdWx0XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25BZnRlckJ1aWxkKHRoaXM6IElCdWlsZGVyLCBvcHRpb25zOiBJVGFza09wdGlvbiwgcmVzdWx0OiBJbnRlcm5hbEJ1aWxkUmVzdWx0KSB7XHJcbiAgICBjb25zdCB0b29sID0gYXdhaXQgbmF0aXZlUGFja1Rvb2xNZy5nZW5lcmF0ZShvcHRpb25zLmNvY29zUGFyYW1zKTtcclxuICAgIHRoaXMuYnVpbGRFeGl0UmVzLmN1c3RvbS5uYXRpdmVQcmpEaXIgPSB0b29sLnBhdGhzLm5hdGl2ZVByakRpcjtcclxuXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvbkJlZm9yZU1ha2UodGhpczogSUJ1aWxkU3RhZ2VUYXNrLCByb290OiBzdHJpbmcsIG9wdGlvbnM6IElUYXNrT3B0aW9uKSB7XHJcbiAgICBpZiAob3B0aW9ucy5jb2Nvc1BhcmFtcykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIGlmICghKG9wdGlvbnMgYXMgQ29jb3NQYXJhbXM8T2JqZWN0PikuY01ha2VDb25maWcgfHwgIXRoaXMuYnVpbGRUYXNrT3B0aW9ucykge1xyXG4gICAgICAgIC8vIOWmguaenOW9k+WJjSBvcHRpb25zIOaVsOaNruS4jeaYryBjb2NvcyBwYXJhbSDnmoTmlbDmja7vvIzpnIDopoHorqnnlKjmiLfph43mlrDmnoTlu7pcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0dldCBjYWNoZSBidWlsZCBvcHRpb25zIGZvcm0gY29jb3MuY29tcGlsZS5qc29uIGZhaWxlZCEgUGxlYXNlIHJlY29tcGlsZSB0aGUgYnVpbGQgdGFzayBhZ2Fpbi4nKTtcclxuICAgIH1cclxuICAgIC8vIOiHqiAzLjguNCDotbfvvIznp7vpmaQgbmF0aXZlIOW5s+WPsOWvuSBjb2Nvcy5jb21waWxlIOeahCBIQUNL77yM5q2k5YW85a655Luj56CB5L+d55WZ5Lik5LiJ5Liq5aSn54mI5pys5Y2z5Y+vXHJcbiAgICAvLyDnlLHkuo7opoHlhbzlrrnlkb3ku6TooYznlJ/miJDnmoTooYzkuLrvvIzkuI3lgZrov4Hnp7vvvIzlnKjov5DooYzml7blhbzlrrnlpITnkIZcclxuICAgIHRoaXMub3B0aW9ucyA9IHRoaXMuYnVpbGRUYXNrT3B0aW9ucztcclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIHRoaXMub3B0aW9ucy5jb2Nvc1BhcmFtcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0aW9ucykpO1xyXG4gICAgLy8g6YGH5Yiw5bCx5L+u5pS55Y6f5p2l55qEIGNvY29zLmNvbXBpbGUuanNvbiDmlofku7ZcclxuICAgIGF3YWl0IHRoaXMuc2F2ZU9wdGlvbnMoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOe8luivkVxyXG4gKiBAcGFyYW0gcm9vdFxyXG4gKiBAcGFyYW0gb3B0aW9uc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1ha2UodGhpczogSUJ1aWxkU3RhZ2VUYXNrLCByb290OiBzdHJpbmcsIG9wdGlvbnM6IElUYXNrT3B0aW9uKSB7XHJcbiAgICBjb25zdCB0b29sID0gYXdhaXQgbmF0aXZlUGFja1Rvb2xNZy5tYWtlKG9wdGlvbnMuY29jb3NQYXJhbXMpO1xyXG4gICAgdGhpcy5idWlsZEV4aXRSZXMuY3VzdG9tLm5hdGl2ZVByakRpciA9IHRvb2wucGF0aHMubmF0aXZlUHJqRGlyO1xyXG4gICAgdGhpcy5idWlsZEV4aXRSZXMuY3VzdG9tLmV4ZWN1dGFibGVGaWxlID0gYXdhaXQgdG9vbC5nZXRFeGVjdXRhYmxlRmlsZSgpO1xyXG59XHJcblxyXG4vKipcclxuICog6L+Q6KGM5pa55rOVXHJcbiAqIEBwYXJhbSByb290XHJcbiAqIEBwYXJhbSBvcHRpb25zXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuKHJvb3Q6IHN0cmluZywgb3B0aW9uczogSVRhc2tPcHRpb24pIHtcclxuICAgIGF3YWl0IG5hdGl2ZVBhY2tUb29sTWcucnVuKG9wdGlvbnMuY29jb3NQYXJhbXMpO1xyXG59XHJcbiJdfQ==