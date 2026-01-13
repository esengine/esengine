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
exports.buildScriptCommand = buildScriptCommand;
exports.buildSystemJsCommand = buildSystemJsCommand;
exports.buildPolyfillsCommand = buildPolyfillsCommand;
const fs_extra_1 = __importStar(require("fs-extra"));
const mod_lo_1 = require("@cocos/creator-programming-mod-lo/lib/mod-lo");
const creator_programming_rollup_plugin_mod_lo_1 = __importDefault(require("@cocos/creator-programming-rollup-plugin-mod-lo"));
const to_named_register_1 = __importDefault(require("../../utils/to-named-register"));
const url_1 = require("url");
const babel = __importStar(require("@babel/core"));
const rollup = __importStar(require("rollup"));
// @ts-ignore
const rollup_plugin_sourcemaps_1 = __importDefault(require("rollup-plugin-sourcemaps"));
const rollup_plugin_terser_1 = require("rollup-plugin-terser");
const path_1 = __importStar(require("path"));
const pack_mods_1 = require("../../utils/pack-mods");
const creator_programming_common_1 = require("@cocos/creator-programming-common");
const module_system_1 = require("@cocos/module-system");
const build_polyfills_1 = __importDefault(require("@cocos/build-polyfills"));
const minimatch_1 = __importDefault(require("minimatch"));
function relativeUrl(from, to) {
    return (0, path_1.relative)(from, to).replace(/\\/g, '/');
}
let bundleIdToNameChunk;
function matchPattern(path, pattern) {
    return (0, minimatch_1.default)(path.replace(/\\/g, '/'), pattern.replace(/\\/g, '/'));
}
const useEditorFolderFeature = false; // TODO: 之后正式接入编辑器 Editor 目录后移除这个开关
function getExternalEditorModules(cceModuleMap) {
    return Object.keys(cceModuleMap).filter(name => name !== 'mapLocation');
}
async function genImportRestrictions(dbInfos, externalEditorModules) {
    if (!useEditorFolderFeature) {
        return undefined;
    }
    const restrictions = [];
    restrictions.length = 0;
    const banSourcePatterns = [...externalEditorModules];
    for (const info of dbInfos) {
        const dbPath = info.target;
        if (dbPath) {
            const dbEditorPattern = path_1.default.join(dbPath, '**', 'editor', '**/*');
            banSourcePatterns.push(dbEditorPattern);
        }
    }
    for (let i = 0; i < dbInfos.length; ++i) {
        const info = dbInfos[i];
        const dbPath = info.target;
        if (dbPath) {
            const dbPattern = path_1.default.join(dbPath, '**/*');
            const dbEditorPattern = path_1.default.join(dbPath, '**', 'editor', '**/*');
            restrictions[i] = {
                importerPatterns: [dbPattern, '!' + dbEditorPattern], // TODO: 如果需要兼容就项目，则路径不能这么配置，等编辑器提供查询接口
                banSourcePatterns,
            };
        }
    }
    return restrictions;
}
/**
 * 编译项目脚本，执行环境为标准 node 环境，请不要使用 Editor 或者 Electron 接口，所以需要使用的字段都需要在外部整理好传入
 * @param options 编译引擎参数
 * @returns
 */
async function buildScriptCommand(options) {
    const res = {
        scriptPackages: [],
        importMappings: {},
    };
    if (options.bundles.length === 0) {
        return res;
    }
    const sourceMaps = options.sourceMaps;
    const ccEnvMod = Object.entries(options.ccEnvConstants).map(([k, v]) => `export const ${k} = ${v};`).join('\n');
    // https://github.com/rollup/rollup/issues/2952
    // > Currently, the assumption is that a resolved id is the absolute path of a file on the host system (including the correct slashes).
    const { bundles, modulePreservation } = options;
    const bundleCommonChunk = options.bundleCommonChunk = options.bundleCommonChunk ?? false;
    const memoryMods = {};
    const uuidMap = {}; // script uuid to url
    const fileBundleMap = {}; // script file path / prerequisite url to bundle index
    const prerequisiteModuleURLs = new Set();
    const exposedFileModuleURLs = new Set();
    const exposeEachAssetModule = options.modulePreservation === 'preserve';
    const getBundleIndexOfChunk = (chunk) => {
        let { facadeModuleId } = chunk;
        if (!facadeModuleId) {
            // This chunk does not corresponds to a module.
            // Maybe happen if it's a virtual module or it correspond to multiple modules.
            return -1;
        }
        // If the module ID is file URL like, we convert it to path.
        // If conversion failed, it's not a file module and can never be bundle file.
        let facadeModulePath = '';
        // NOTE: 转化 CJS interop module id 为原始的 module id
        let facadeModuleURLString = facadeModuleId;
        if (!facadeModuleURLString.startsWith('file:///')) {
            facadeModuleURLString = (0, url_1.pathToFileURL)(facadeModuleId).href;
        }
        const facadeModuleURL = new url_1.URL(facadeModuleURLString);
        if ((0, creator_programming_common_1.isCjsInteropUrl)(facadeModuleURL)) {
            const cjsInteropTargetURL = (0, creator_programming_common_1.getCjsInteropTarget)(facadeModuleURL);
            facadeModuleId = (0, url_1.fileURLToPath)(cjsInteropTargetURL.href);
        }
        if (!facadeModuleId.startsWith('file:///')) {
            facadeModulePath = facadeModuleId;
        }
        else {
            try {
                facadeModulePath = (0, url_1.fileURLToPath)(facadeModuleId);
            }
            catch {
                return -1;
            }
        }
        return fileBundleMap[facadeModulePath] ?? -1;
    };
    /**
     * Identify if the specified chunk corresponds to a module that should be exposed,
     * if so, return the exposed URL of the corresponding module.
     */
    const identifyExposedModule = (chunk) => {
        const { facadeModuleId } = chunk;
        if (!facadeModuleId) {
            // This chunk does not corresponds to a module.
            // Maybe happen if it's a virtual module or it correspond to multiple modules.
            return '';
        }
        // All prerequisite import modules should be exposed.
        if (prerequisiteModuleURLs.has(facadeModuleId)) {
            return facadeModuleId;
        }
        // It can be a to-be-exposed file.
        if (exposedFileModuleURLs.has(facadeModuleId)) {
            return facadeModuleId;
        }
        return '';
    };
    // Groups of entries to rollup with multiple pass
    const entryGroups = [];
    const editorPatters = options.dbInfos.map(info => path_1.default.join(info.target, '**/editor/**/*'));
    for (let iBundle = 0; iBundle < bundles.length; ++iBundle) {
        const bundle = bundles[iBundle];
        const entries = [];
        for (const script of bundle.scripts) {
            const url = (0, url_1.pathToFileURL)(script.file).href;
            uuidMap[url] = script.uuid;
            if (modulePreservation === 'facade' ||
                modulePreservation === 'preserve') {
                // If facade model is used,
                // we preserve the module structure.
                if (useEditorFolderFeature) {
                    if (!editorPatters.some(pattern => matchPattern((0, url_1.fileURLToPath)(url), pattern))) {
                        // 排除 Editor 目录下的脚本
                        entries.push(url);
                    }
                }
                else {
                    entries.push(url);
                }
            }
            fileBundleMap[script.file] = iBundle;
            if (exposeEachAssetModule) {
                exposedFileModuleURLs.add(url);
            }
        }
        const preImportsModule = `virtual:///prerequisite-imports/${bundle.id}`;
        let bundleScriptFiles = bundle.scripts.map((script) => script.file);
        if (useEditorFolderFeature) {
            bundleScriptFiles = bundleScriptFiles.filter(file => !editorPatters.some(pattern => matchPattern(file, pattern)));
        }
        memoryMods[preImportsModule] = makePrerequisiteImports(bundleScriptFiles);
        fileBundleMap[preImportsModule] = iBundle;
        entries.push(preImportsModule);
        entryGroups.push(entries);
        prerequisiteModuleURLs.add(preImportsModule);
    }
    if (!bundleCommonChunk) {
        // merge into one time rollup
        const mergedEntries = [];
        entryGroups.forEach(entries => {
            mergedEntries.push(...entries);
        });
        entryGroups.length = 0;
        entryGroups.push(mergedEntries);
    }
    const externalEditorModules = getExternalEditorModules(options.cceModuleMap);
    const importRestrictions = await genImportRestrictions(options.dbInfos, externalEditorModules);
    const modLo = new mod_lo_1.ModLo({
        targets: options.transform.targets,
        loose: options.loose,
        exportsConditions: options.exportsConditions,
        guessCommonJsExports: options.guessCommonJsExports,
        useDefineForClassFields: options.useDefineForClassFields,
        allowDeclareFields: options.allowDeclareFields,
        _internalTransform: {
            excludes: options.transform?.excludes ?? [],
            includes: options.transform?.includes ?? [],
        },
        _compressUUID: (uuid) => options.uuidCompressMap[uuid],
        _helperModule: creator_programming_rollup_plugin_mod_lo_1.default.helperModule,
        hot: options.hotModuleReload,
        importRestrictions,
        preserveSymlinks: options.preserveSymlinks,
    });
    const userImportMap = options.importMap;
    const importMap = {};
    const importMapURL = userImportMap ? new url_1.URL(userImportMap.url) : new url_1.URL('foo:/bar');
    importMap.imports = {
        'cc/env': 'virtual:/cc/env',
        'cc/userland/macro': 'virtual:/cc/userland/macro',
    };
    const assetPrefixes = [];
    for (const dbInfo of options.dbInfos) {
        const dbURL = `db://${dbInfo.dbID}/`;
        const assetDirURL = (0, url_1.pathToFileURL)(path_1.default.join(dbInfo.target, path_1.default.join(path_1.default.sep))).href;
        importMap.imports[dbURL] = assetDirURL;
        assetPrefixes.push(assetDirURL);
    }
    if (userImportMap) {
        if (userImportMap.json.imports) {
            importMap.imports = {
                ...importMap.imports,
                ...userImportMap.json.imports,
            };
        }
        if (userImportMap.json.scopes) {
            for (const [scopeRep, specifierMap] of Object.entries(userImportMap.json.scopes)) {
                const scopes = importMap.scopes ??= {};
                scopes[scopeRep] = {
                    ...(scopes[scopeRep] ?? {}),
                    ...specifierMap,
                };
            }
        }
    }
    modLo.setImportMap(importMap, importMapURL);
    modLo.setAssetPrefixes(assetPrefixes);
    modLo.addMemoryModule('virtual:/cc/env', ccEnvMod);
    // 处理自定义宏模块
    modLo.addMemoryModule('virtual:/cc/userland/macro', options.customMacroList.map((item) => `export const ${item.key} = ${item.value};`).join('\n'));
    for (const [url, code] of Object.entries(memoryMods)) {
        modLo.addMemoryModule(url, code);
    }
    for (const [url, uuid] of Object.entries(uuidMap)) {
        modLo.setUUID(url, uuid);
    }
    const rollupPlugins = [
        (0, creator_programming_rollup_plugin_mod_lo_1.default)({ modLo }),
    ];
    if (modulePreservation === 'facade' || modulePreservation === 'erase') {
        rollupPlugins.push(rpNamedChunk());
    }
    if (options.sourceMaps) {
        rollupPlugins.push((0, rollup_plugin_sourcemaps_1.default)());
    }
    if (!options.debug) {
        rollupPlugins.push((0, rollup_plugin_terser_1.terser)());
    }
    if (modulePreservation === 'erase') {
        rollupPlugins.push({
            name: 'cocos-creator/resolve-import-meta',
            resolveImportMeta(property, { moduleId }) {
                switch (property) {
                    default:
                        return undefined;
                    case 'url':
                        try {
                            const url = new url_1.URL(moduleId).href;
                            return `'${url}'`;
                        }
                        catch {
                            console.error(`Can not access import.meta.url of module '${moduleId}'. '${moduleId}' is not a valid URL.`);
                            return undefined;
                        }
                }
            },
        });
    }
    const ignoreEmptyBundleWarning = options.modulePreservation !== 'preserve';
    const rollupWarningHandler = (warning, defaultHandler) => {
        if (ignoreEmptyBundleWarning && (typeof warning === 'object') && warning.code === 'EMPTY_BUNDLE') {
            return;
        }
        if (typeof warning !== 'string') {
            if (warning.code === 'CIRCULAR_DEPENDENCY') {
                if (warning.importer?.includes('node_modules')) {
                    return;
                }
            }
        }
        // defaultHandler(warning);
        const message = typeof warning === 'object' ? (warning.message || warning) : warning;
        console.warn(`[[BuildGlobalInfo.Script.Rollup]] ${message}`);
    };
    const importMappings = {};
    // 如果开启了 bundleCommonChunk，则 iBundle 是 bundleIndex
    for (let iBundle = 0; iBundle < entryGroups.length; ++iBundle) {
        const entries = entryGroups[iBundle];
        if (bundleCommonChunk) {
            bundleIdToNameChunk = bundles[iBundle].id;
        }
        const rollupOptions = {
            input: entries,
            plugins: rollupPlugins,
            preserveModules: modulePreservation !== 'erase',
            external: ['cc'],
            onwarn: rollupWarningHandler,
        };
        const rollupBuild = await rollup.rollup(rollupOptions);
        const rollupOutputOptions = {
            sourcemap: options.sourceMaps,
            exports: 'named', // Explicitly set this to disable warning
            // about coexistence of default and named exports
        };
        if (options.modulePreservation === 'preserve') {
            rollupOutputOptions.format = options.moduleFormat;
        }
        else {
            // Facade or erase
            Object.assign(rollupOutputOptions, {
                format: 'system',
                strict: false,
                systemNullSetters: true,
            });
        }
        const rollupOutput = await rollupBuild.generate(rollupOutputOptions);
        if (options.modulePreservation === 'preserve') {
            const chunkHomeDir = options.commonDir;
            for (const chunkOrAsset of rollupOutput.output) {
                if (chunkOrAsset.type !== 'chunk') {
                    continue;
                }
                else {
                    const relativePath = chunkOrAsset.fileName.match(/\.(js|ts|mjs)$/)
                        ? chunkOrAsset.fileName
                        : `${chunkOrAsset.fileName}.js`;
                    const path = path_1.default.join(chunkHomeDir, relativePath);
                    await fs_extra_1.default.outputFile(path, chunkOrAsset.code, 'utf8');
                    const exposedURL = identifyExposedModule(chunkOrAsset);
                    if (exposedURL) {
                        // TODO: better calculation
                        const chunkPathBasedOnImportMap = `./chunks/${relativePath}`.replace(/\\/g, '/');
                        importMappings[exposedURL] = chunkPathBasedOnImportMap;
                    }
                }
            }
        }
        else if (bundleCommonChunk) {
            const bundle = bundles[iBundle];
            const entryChunkBundler = new ChunkBundler(bundle.outFile);
            for (const chunkOrAsset of rollupOutput.output) {
                if (chunkOrAsset.type !== 'chunk') {
                    continue;
                }
                entryChunkBundler.add(chunkOrAsset);
                const exposedURL = identifyExposedModule(chunkOrAsset);
                // 模块映射需要在模块内部做好，不依赖外部的 import-map，否则 bundle 将不能跨项目复用
                if (exposedURL) {
                    entryChunkBundler.addModuleMapping(exposedURL, getChunkUrl(chunkOrAsset));
                }
            }
            await entryChunkBundler.write({
                sourceMaps,
                wrap: false, // 主包把所有 System.register() 包起来，子包不包。
            });
        }
        else {
            const nonEntryChunksBundleOutFile = path_1.default.join(options.commonDir, 'bundle.js');
            const nonEntryChunkBundler = new ChunkBundler(nonEntryChunksBundleOutFile);
            let nNonEntryChunks = 0;
            const entryChunkBundlers = bundles.map((bundle) => new ChunkBundler(bundle.outFile));
            for (const chunkOrAsset of rollupOutput.output) {
                if (chunkOrAsset.type !== 'chunk') {
                    continue;
                }
                // NOTE: 一些需要 CJS interop 的模块因为插入了 interop 模块，被 rollup 解析为非入口 chunk
                const isEntry = !!chunkOrAsset.facadeModuleId && entries.includes(chunkOrAsset.facadeModuleId);
                if (!chunkOrAsset.isEntry && !isEntry) {
                    nonEntryChunkBundler.add(chunkOrAsset);
                    ++nNonEntryChunks;
                }
                else {
                    const bundleIndex = getBundleIndexOfChunk(chunkOrAsset);
                    if (bundleIndex < 0 || entryChunkBundlers[bundleIndex] === undefined) {
                        console.warn(`Unexpected: entry chunk name ${chunkOrAsset.name} is not in list.`);
                        nonEntryChunkBundler.add(chunkOrAsset);
                        ++nNonEntryChunks;
                    }
                    else {
                        entryChunkBundlers[bundleIndex].add(chunkOrAsset);
                        const exposedURL = identifyExposedModule(chunkOrAsset);
                        // 模块映射需要在模块内部做好，不依赖外部的 import-map，否则 bundle 将不能跨项目复用
                        if (exposedURL) {
                            entryChunkBundlers[bundleIndex].addModuleMapping(exposedURL, getChunkUrl(chunkOrAsset));
                        }
                    }
                }
            }
            console.debug(`Number of non-entry chunks: ${entryChunkBundlers.length}`);
            await Promise.all(entryChunkBundlers.map(async (entryChunkBundler, iEntry) => {
                await entryChunkBundler.write({
                    sourceMaps,
                    wrap: false, // 主包把所有 System.register() 包起来，子包不包。
                });
            }));
            if (nNonEntryChunks) {
                await nonEntryChunkBundler.write({
                    sourceMaps,
                    wrap: true,
                });
                const url = nonEntryChunksBundleOutFile;
                res.scriptPackages.push(url);
            }
        }
    }
    bundleIdToNameChunk = null;
    res.importMappings = importMappings;
    function makePrerequisiteImports(modules) {
        return modules.sort()
            .map((m) => {
            return `import "${(0, url_1.pathToFileURL)(m).href}";`;
        })
            .join('\n');
    }
    return res;
}
async function buildSystemJsCommand(options) {
    return await (0, module_system_1.build)({
        out: options.dest,
        // @ts-ignore TODO buildSystemJs 目前的 sourceMap 接口定义有缺失，需要发版本
        sourceMap: options.sourceMaps,
        minify: !options.debug,
        platform: options.platform,
        hmr: options.hotModuleReload,
    });
}
async function buildPolyfillsCommand(options = {}, dest) {
    const leastRequiredCoreJsModules = [
        'es.global-this', // globalThis
    ];
    // 构建 Polyfills
    const buildPolyfillsOptions = {
        debug: false,
        sourceMap: false,
        // file: ps.join(result.paths.dir, 'src', 'polyfills.bundle.js'),
        file: dest,
    };
    // Async functions polyfills
    if (options.asyncFunctions) {
        buildPolyfillsOptions.asyncFunctions = true;
    }
    // CoreJs polyfills
    if (options.coreJs) {
        buildPolyfillsOptions.coreJs = {
            modules: ['es'],
            blacklist: [],
            targets: options.targets,
        };
    }
    else {
        buildPolyfillsOptions.coreJs = {
            modules: leastRequiredCoreJsModules,
            blacklist: [],
            targets: options.targets,
        };
    }
    const hasPolyfill = await (0, build_polyfills_1.default)(buildPolyfillsOptions);
    // HACK buildPolyfills 返回值不对
    if (hasPolyfill && await (0, fs_extra_1.pathExists)(buildPolyfillsOptions.file)) {
        return true;
    }
    return false;
}
class ChunkBundler {
    _out;
    _parts = [];
    _chunkMappings = {};
    constructor(out) {
        this._out = out;
    }
    add(chunk) {
        this._parts.push([chunk.fileName, {
                code: chunk.code,
                map: chunk.map?.toString(),
            }]);
    }
    addModuleMapping(mapping, chunk) {
        this._chunkMappings[mapping] = chunk;
    }
    async write(options) {
        return await (0, pack_mods_1.packMods)(this._parts.sort(([a], [b]) => a.localeCompare(b)).map(([_, p]) => p), this._chunkMappings, this._out, options);
    }
}
function rpNamedChunk() {
    return {
        name: 'named-chunk',
        renderChunk: async function (code, chunk, options) {
            const chunkId = getChunkUrl(chunk);
            const transformResult = await babel.transformAsync(code, {
                sourceMaps: true,
                compact: false,
                plugins: [[to_named_register_1.default, { name: chunkId }]],
            });
            if (!transformResult) {
                this.warn('Failed to render chunk.');
                return null;
            }
            return {
                code: transformResult.code,
                map: transformResult.map,
            };
        },
    };
}
function getChunkUrl(chunk) {
    if (bundleIdToNameChunk) {
        // 解决 bundle 跨项目时模块命名冲突的问题
        return `bundle://${bundleIdToNameChunk}/${chunk.fileName}`;
    }
    else {
        return `chunks:///${chunk.fileName}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtc2NyaXB0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci93b3JrZXIvYnVpbGRlci9hc3NldC1oYW5kbGVyL3NjcmlwdC9idWlsZC1zY3JpcHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxRkEsZ0RBNFpDO0FBNERELG9EQVNDO0FBRUQsc0RBb0NDO0FBNWxCRCxxREFBMEM7QUFDMUMseUVBQWdGO0FBQ2hGLCtIQUFzRTtBQUN0RSxzRkFBNEQ7QUFDNUQsNkJBQXdEO0FBQ3hELG1EQUFxQztBQUNyQywrQ0FBaUM7QUFDakMsYUFBYTtBQUNiLHdGQUFvRDtBQUNwRCwrREFBOEM7QUFDOUMsNkNBQW9DO0FBQ3BDLHFEQUFpRDtBQUVqRCxrRkFBeUY7QUFDekYsd0RBQThEO0FBQzlELDZFQUFvRDtBQUdwRCwwREFBa0M7QUFnQmxDLFNBQVMsV0FBVyxDQUFDLElBQVksRUFBRSxFQUFVO0lBQ3pDLE9BQU8sSUFBQSxlQUFRLEVBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDbEQsQ0FBQztBQUVELElBQUksbUJBQWtDLENBQUM7QUFFdkMsU0FBUyxZQUFZLENBQUMsSUFBWSxFQUFFLE9BQWU7SUFDL0MsT0FBTyxJQUFBLG1CQUFTLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1RSxDQUFDO0FBRUQsTUFBTSxzQkFBc0IsR0FBRyxLQUFLLENBQUMsQ0FBQyxtQ0FBbUM7QUFFekUsU0FBUyx3QkFBd0IsQ0FBQyxZQUFpQztJQUMvRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFD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RSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7Q0FDSjtBQUVELFNBQVMsWUFBWTtJQUNqQixPQUFPO1FBQ0gsSUFBSSxFQUFFLGFBQWE7UUFDbkIsV0FBVyxFQUFFLEtBQUssV0FBaUIsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPO1lBRW5ELE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuQyxNQUFNLGVBQWUsR0FBRyxNQUFNLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFO2dCQUNyRCxVQUFVLEVBQUUsSUFBSTtnQkFDaEIsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsT0FBTyxFQUFFLENBQUMsQ0FBQywyQkFBZSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDbEQsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3JDLE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFDRCxPQUFPO2dCQUNILElBQUksRUFBRSxlQUFlLENBQUMsSUFBSztnQkFDM0IsR0FBRyxFQUFFLGVBQWUsQ0FBQyxHQUFHO2FBQzNCLENBQUM7UUFDTixDQUFDO0tBQ0osQ0FBQztBQUNOLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxLQUEyQjtJQUM1QyxJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDdEIsMEJBQTBCO1FBQzFCLE9BQU8sWUFBWSxtQkFBbUIsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDL0QsQ0FBQztTQUFNLENBQUM7UUFDSixPQUFPLGFBQWEsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3pDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzLCB7IHBhdGhFeGlzdHMgfSBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCB7IE1vZExvLCBJbXBvcnRNYXAgfSBmcm9tICdAY29jb3MvY3JlYXRvci1wcm9ncmFtbWluZy1tb2QtbG8vbGliL21vZC1sbyc7XHJcbmltcG9ydCBycE1vZExvIGZyb20gJ0Bjb2Nvcy9jcmVhdG9yLXByb2dyYW1taW5nLXJvbGx1cC1wbHVnaW4tbW9kLWxvJztcclxuaW1wb3J0IHRvTmFtZWRSZWdpc3RlciBmcm9tICcuLi8uLi91dGlscy90by1uYW1lZC1yZWdpc3Rlcic7XHJcbmltcG9ydCB7IFVSTCwgcGF0aFRvRmlsZVVSTCwgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCc7XHJcbmltcG9ydCAqIGFzIGJhYmVsIGZyb20gJ0BiYWJlbC9jb3JlJztcclxuaW1wb3J0ICogYXMgcm9sbHVwIGZyb20gJ3JvbGx1cCc7XHJcbi8vIEB0cy1pZ25vcmVcclxuaW1wb3J0IHJwU291cmNlbWFwcyBmcm9tICdyb2xsdXAtcGx1Z2luLXNvdXJjZW1hcHMnO1xyXG5pbXBvcnQgeyB0ZXJzZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXRlcnNlcic7XHJcbmltcG9ydCBwcywgeyByZWxhdGl2ZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBwYWNrTW9kcyB9IGZyb20gJy4uLy4uL3V0aWxzL3BhY2stbW9kcyc7XHJcbmltcG9ydCB7IENDRW52Q29uc3RhbnRzIH0gZnJvbSAnLi9idWlsZC10aW1lLWNvbnN0YW50cyc7XHJcbmltcG9ydCB7IGlzQ2pzSW50ZXJvcFVybCwgZ2V0Q2pzSW50ZXJvcFRhcmdldCB9IGZyb20gJ0Bjb2Nvcy9jcmVhdG9yLXByb2dyYW1taW5nLWNvbW1vbic7XHJcbmltcG9ydCB7IGJ1aWxkIGFzIGJ1aWxkU3lzdGVtSnMgfSBmcm9tICdAY29jb3MvbW9kdWxlLXN5c3RlbSc7XHJcbmltcG9ydCBidWlsZFBvbHlmaWxscyBmcm9tICdAY29jb3MvYnVpbGQtcG9seWZpbGxzJztcclxuaW1wb3J0IHsgSUJ1aWxkU3lzdGVtSnNPcHRpb24sIElQb2x5RmlsbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9AdHlwZXMnO1xyXG5pbXBvcnQgeyBJQXNzZXRJbmZvLCBNb2R1bGVQcmVzZXJ2YXRpb24sIElUcmFuc2Zvcm1UYXJnZXQgfSBmcm9tICcuLi8uLi8uLi8uLi9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IG1pbmltYXRjaCBmcm9tICdtaW5pbWF0Y2gnO1xyXG5pbXBvcnQgeyBTaGFyZWRTZXR0aW5ncyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjcmlwdGluZy9pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBNYWNyb0l0ZW0gfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9lbmdpbmUvQHR5cGVzL2NvbmZpZyc7XHJcbmltcG9ydCB7IERCSW5mbyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjcmlwdGluZy9AdHlwZXMvY29uZmlnLWV4cG9ydCc7XHJcblxyXG5pbnRlcmZhY2UgYnVpbGRSZXMge1xyXG4gICAgc2NyaXB0UGFja2FnZXM6IHN0cmluZ1tdO1xyXG4gICAgaW1wb3J0TWFwcGluZ3M6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XHJcbn1cclxuXHJcbmludGVyZmFjZSBCdW5kbGUge1xyXG4gICAgaWQ6IHN0cmluZyB8IG51bGw7XHJcbiAgICBzY3JpcHRzOiBJQXNzZXRJbmZvW107XHJcbiAgICBvdXRGaWxlOiBzdHJpbmc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbGF0aXZlVXJsKGZyb206IHN0cmluZywgdG86IHN0cmluZykge1xyXG4gICAgcmV0dXJuIHJlbGF0aXZlKGZyb20sIHRvKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XHJcbn1cclxuXHJcbmxldCBidW5kbGVJZFRvTmFtZUNodW5rOiBudWxsIHwgc3RyaW5nO1xyXG5cclxuZnVuY3Rpb24gbWF0Y2hQYXR0ZXJuKHBhdGg6IHN0cmluZywgcGF0dGVybjogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gbWluaW1hdGNoKHBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpLCBwYXR0ZXJuLnJlcGxhY2UoL1xcXFwvZywgJy8nKSk7XHJcbn1cclxuXHJcbmNvbnN0IHVzZUVkaXRvckZvbGRlckZlYXR1cmUgPSBmYWxzZTsgLy8gVE9ETzog5LmL5ZCO5q2j5byP5o6l5YWl57yW6L6R5ZmoIEVkaXRvciDnm67lvZXlkI7np7vpmaTov5nkuKrlvIDlhbNcclxuXHJcbmZ1bmN0aW9uIGdldEV4dGVybmFsRWRpdG9yTW9kdWxlcyhjY2VNb2R1bGVNYXA6IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyhjY2VNb2R1bGVNYXApLmZpbHRlcihuYW1lID0+IG5hbWUgIT09ICdtYXBMb2NhdGlvbicpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZW5JbXBvcnRSZXN0cmljdGlvbnMoZGJJbmZvczogREJJbmZvW10sIGV4dGVybmFsRWRpdG9yTW9kdWxlczogc3RyaW5nW10pIHtcclxuICAgIGlmICghdXNlRWRpdG9yRm9sZGVyRmVhdHVyZSkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICBjb25zdCByZXN0cmljdGlvbnMgPSBbXTtcclxuICAgIHJlc3RyaWN0aW9ucy5sZW5ndGggPSAwO1xyXG4gICAgY29uc3QgYmFuU291cmNlUGF0dGVybnMgPSBbLi4uZXh0ZXJuYWxFZGl0b3JNb2R1bGVzXTtcclxuICAgIGZvciAoY29uc3QgaW5mbyBvZiBkYkluZm9zKSB7XHJcbiAgICAgICAgY29uc3QgZGJQYXRoID0gaW5mby50YXJnZXQ7XHJcbiAgICAgICAgaWYgKGRiUGF0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBkYkVkaXRvclBhdHRlcm4gPSBwcy5qb2luKGRiUGF0aCwgJyoqJywgJ2VkaXRvcicsICcqKi8qJyk7XHJcbiAgICAgICAgICAgIGJhblNvdXJjZVBhdHRlcm5zLnB1c2goZGJFZGl0b3JQYXR0ZXJuKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYkluZm9zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgY29uc3QgaW5mbyA9IGRiSW5mb3NbaV07XHJcbiAgICAgICAgY29uc3QgZGJQYXRoID0gaW5mby50YXJnZXQ7XHJcbiAgICAgICAgaWYgKGRiUGF0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBkYlBhdHRlcm4gPSBwcy5qb2luKGRiUGF0aCwgJyoqLyonKTtcclxuICAgICAgICAgICAgY29uc3QgZGJFZGl0b3JQYXR0ZXJuID0gcHMuam9pbihkYlBhdGgsICcqKicsICdlZGl0b3InLCAnKiovKicpO1xyXG4gICAgICAgICAgICByZXN0cmljdGlvbnNbaV0gPSB7XHJcbiAgICAgICAgICAgICAgICBpbXBvcnRlclBhdHRlcm5zOiBbZGJQYXR0ZXJuLCAnIScgKyBkYkVkaXRvclBhdHRlcm5dLCAvLyBUT0RPOiDlpoLmnpzpnIDopoHlhbzlrrnlsLHpobnnm67vvIzliJnot6/lvoTkuI3og73ov5nkuYjphY3nva7vvIznrYnnvJbovpHlmajmj5Dkvpvmn6Xor6LmjqXlj6NcclxuICAgICAgICAgICAgICAgIGJhblNvdXJjZVBhdHRlcm5zLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN0cmljdGlvbnM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDnvJbor5Hpobnnm67ohJrmnKzvvIzmiafooYznjq/looPkuLrmoIflh4Ygbm9kZSDnjq/looPvvIzor7fkuI3opoHkvb/nlKggRWRpdG9yIOaIluiAhSBFbGVjdHJvbiDmjqXlj6PvvIzmiYDku6XpnIDopoHkvb/nlKjnmoTlrZfmrrXpg73pnIDopoHlnKjlpJbpg6jmlbTnkIblpb3kvKDlhaVcclxuICogQHBhcmFtIG9wdGlvbnMg57yW6K+R5byV5pOO5Y+C5pWwXHJcbiAqIEByZXR1cm5zIFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkU2NyaXB0Q29tbWFuZChcclxuICAgIG9wdGlvbnM6IElCdWlsZFNjcmlwdEZ1bmN0aW9uT3B0aW9uICYgU2hhcmVkU2V0dGluZ3MsXHJcbik6IFByb21pc2U8YnVpbGRSZXM+IHtcclxuICAgIGNvbnN0IHJlczogYnVpbGRSZXMgPSB7XHJcbiAgICAgICAgc2NyaXB0UGFja2FnZXM6IFtdLFxyXG4gICAgICAgIGltcG9ydE1hcHBpbmdzOiB7fSxcclxuICAgIH07XHJcbiAgICBpZiAob3B0aW9ucy5idW5kbGVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc291cmNlTWFwcyA9IG9wdGlvbnMuc291cmNlTWFwcztcclxuICAgIGNvbnN0IGNjRW52TW9kID0gT2JqZWN0LmVudHJpZXMob3B0aW9ucy5jY0VudkNvbnN0YW50cykubWFwKChbaywgdl0pID0+IGBleHBvcnQgY29uc3QgJHtrfSA9ICR7dn07YCkuam9pbignXFxuJyk7XHJcblxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3JvbGx1cC9yb2xsdXAvaXNzdWVzLzI5NTJcclxuICAgIC8vID4gQ3VycmVudGx5LCB0aGUgYXNzdW1wdGlvbiBpcyB0aGF0IGEgcmVzb2x2ZWQgaWQgaXMgdGhlIGFic29sdXRlIHBhdGggb2YgYSBmaWxlIG9uIHRoZSBob3N0IHN5c3RlbSAoaW5jbHVkaW5nIHRoZSBjb3JyZWN0IHNsYXNoZXMpLlxyXG5cclxuICAgIGNvbnN0IHsgYnVuZGxlcywgbW9kdWxlUHJlc2VydmF0aW9uIH0gPSBvcHRpb25zO1xyXG4gICAgY29uc3QgYnVuZGxlQ29tbW9uQ2h1bmsgPSBvcHRpb25zLmJ1bmRsZUNvbW1vbkNodW5rID0gb3B0aW9ucy5idW5kbGVDb21tb25DaHVuayA/PyBmYWxzZTtcclxuXHJcbiAgICBjb25zdCBtZW1vcnlNb2RzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XHJcbiAgICBjb25zdCB1dWlkTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307IC8vIHNjcmlwdCB1dWlkIHRvIHVybFxyXG4gICAgY29uc3QgZmlsZUJ1bmRsZU1hcDogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9OyAvLyBzY3JpcHQgZmlsZSBwYXRoIC8gcHJlcmVxdWlzaXRlIHVybCB0byBidW5kbGUgaW5kZXhcclxuICAgIGNvbnN0IHByZXJlcXVpc2l0ZU1vZHVsZVVSTHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICAgIGNvbnN0IGV4cG9zZWRGaWxlTW9kdWxlVVJMcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgY29uc3QgZXhwb3NlRWFjaEFzc2V0TW9kdWxlID0gb3B0aW9ucy5tb2R1bGVQcmVzZXJ2YXRpb24gPT09ICdwcmVzZXJ2ZSc7XHJcblxyXG4gICAgY29uc3QgZ2V0QnVuZGxlSW5kZXhPZkNodW5rID0gKGNodW5rOiByb2xsdXAuT3V0cHV0Q2h1bmspID0+IHtcclxuICAgICAgICBsZXQgeyBmYWNhZGVNb2R1bGVJZCB9ID0gY2h1bms7XHJcblxyXG4gICAgICAgIGlmICghZmFjYWRlTW9kdWxlSWQpIHtcclxuICAgICAgICAgICAgLy8gVGhpcyBjaHVuayBkb2VzIG5vdCBjb3JyZXNwb25kcyB0byBhIG1vZHVsZS5cclxuICAgICAgICAgICAgLy8gTWF5YmUgaGFwcGVuIGlmIGl0J3MgYSB2aXJ0dWFsIG1vZHVsZSBvciBpdCBjb3JyZXNwb25kIHRvIG11bHRpcGxlIG1vZHVsZXMuXHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBtb2R1bGUgSUQgaXMgZmlsZSBVUkwgbGlrZSwgd2UgY29udmVydCBpdCB0byBwYXRoLlxyXG4gICAgICAgIC8vIElmIGNvbnZlcnNpb24gZmFpbGVkLCBpdCdzIG5vdCBhIGZpbGUgbW9kdWxlIGFuZCBjYW4gbmV2ZXIgYmUgYnVuZGxlIGZpbGUuXHJcbiAgICAgICAgbGV0IGZhY2FkZU1vZHVsZVBhdGggPSAnJztcclxuXHJcbiAgICAgICAgLy8gTk9URTog6L2s5YyWIENKUyBpbnRlcm9wIG1vZHVsZSBpZCDkuLrljp/lp4vnmoQgbW9kdWxlIGlkXHJcbiAgICAgICAgbGV0IGZhY2FkZU1vZHVsZVVSTFN0cmluZyA9IGZhY2FkZU1vZHVsZUlkO1xyXG4gICAgICAgIGlmICghZmFjYWRlTW9kdWxlVVJMU3RyaW5nLnN0YXJ0c1dpdGgoJ2ZpbGU6Ly8vJykpIHtcclxuICAgICAgICAgICAgZmFjYWRlTW9kdWxlVVJMU3RyaW5nID0gcGF0aFRvRmlsZVVSTChmYWNhZGVNb2R1bGVJZCkuaHJlZjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZmFjYWRlTW9kdWxlVVJMID0gbmV3IFVSTChmYWNhZGVNb2R1bGVVUkxTdHJpbmcpO1xyXG4gICAgICAgIGlmIChpc0Nqc0ludGVyb3BVcmwoZmFjYWRlTW9kdWxlVVJMKSkge1xyXG4gICAgICAgICAgICBjb25zdCBjanNJbnRlcm9wVGFyZ2V0VVJMID0gZ2V0Q2pzSW50ZXJvcFRhcmdldChmYWNhZGVNb2R1bGVVUkwpO1xyXG4gICAgICAgICAgICBmYWNhZGVNb2R1bGVJZCA9IGZpbGVVUkxUb1BhdGgoY2pzSW50ZXJvcFRhcmdldFVSTC5ocmVmKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZmFjYWRlTW9kdWxlSWQuc3RhcnRzV2l0aCgnZmlsZTovLy8nKSkge1xyXG4gICAgICAgICAgICBmYWNhZGVNb2R1bGVQYXRoID0gZmFjYWRlTW9kdWxlSWQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGZhY2FkZU1vZHVsZVBhdGggPSBmaWxlVVJMVG9QYXRoKGZhY2FkZU1vZHVsZUlkKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmaWxlQnVuZGxlTWFwW2ZhY2FkZU1vZHVsZVBhdGhdID8/IC0xO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIElkZW50aWZ5IGlmIHRoZSBzcGVjaWZpZWQgY2h1bmsgY29ycmVzcG9uZHMgdG8gYSBtb2R1bGUgdGhhdCBzaG91bGQgYmUgZXhwb3NlZCxcclxuICAgICAqIGlmIHNvLCByZXR1cm4gdGhlIGV4cG9zZWQgVVJMIG9mIHRoZSBjb3JyZXNwb25kaW5nIG1vZHVsZS5cclxuICAgICAqL1xyXG4gICAgY29uc3QgaWRlbnRpZnlFeHBvc2VkTW9kdWxlID0gKGNodW5rOiByb2xsdXAuT3V0cHV0Q2h1bmspID0+IHtcclxuICAgICAgICBjb25zdCB7IGZhY2FkZU1vZHVsZUlkIH0gPSBjaHVuaztcclxuXHJcbiAgICAgICAgaWYgKCFmYWNhZGVNb2R1bGVJZCkge1xyXG4gICAgICAgICAgICAvLyBUaGlzIGNodW5rIGRvZXMgbm90IGNvcnJlc3BvbmRzIHRvIGEgbW9kdWxlLlxyXG4gICAgICAgICAgICAvLyBNYXliZSBoYXBwZW4gaWYgaXQncyBhIHZpcnR1YWwgbW9kdWxlIG9yIGl0IGNvcnJlc3BvbmQgdG8gbXVsdGlwbGUgbW9kdWxlcy5cclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWxsIHByZXJlcXVpc2l0ZSBpbXBvcnQgbW9kdWxlcyBzaG91bGQgYmUgZXhwb3NlZC5cclxuICAgICAgICBpZiAocHJlcmVxdWlzaXRlTW9kdWxlVVJMcy5oYXMoZmFjYWRlTW9kdWxlSWQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWNhZGVNb2R1bGVJZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEl0IGNhbiBiZSBhIHRvLWJlLWV4cG9zZWQgZmlsZS5cclxuICAgICAgICBpZiAoZXhwb3NlZEZpbGVNb2R1bGVVUkxzLmhhcyhmYWNhZGVNb2R1bGVJZCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhY2FkZU1vZHVsZUlkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBHcm91cHMgb2YgZW50cmllcyB0byByb2xsdXAgd2l0aCBtdWx0aXBsZSBwYXNzXHJcbiAgICBjb25zdCBlbnRyeUdyb3VwczogQXJyYXk8QXJyYXk8c3RyaW5nPj4gPSBbXTtcclxuICAgIGNvbnN0IGVkaXRvclBhdHRlcnMgPSBvcHRpb25zLmRiSW5mb3MubWFwKGluZm8gPT4gcHMuam9pbihpbmZvLnRhcmdldCwgJyoqL2VkaXRvci8qKi8qJykpO1xyXG4gICAgZm9yIChsZXQgaUJ1bmRsZSA9IDA7IGlCdW5kbGUgPCBidW5kbGVzLmxlbmd0aDsgKytpQnVuZGxlKSB7XHJcbiAgICAgICAgY29uc3QgYnVuZGxlID0gYnVuZGxlc1tpQnVuZGxlXTtcclxuICAgICAgICBjb25zdCBlbnRyaWVzID0gW107XHJcbiAgICAgICAgZm9yIChjb25zdCBzY3JpcHQgb2YgYnVuZGxlLnNjcmlwdHMpIHtcclxuICAgICAgICAgICAgY29uc3QgdXJsID0gcGF0aFRvRmlsZVVSTChzY3JpcHQuZmlsZSkuaHJlZjtcclxuICAgICAgICAgICAgdXVpZE1hcFt1cmxdID0gc2NyaXB0LnV1aWQ7XHJcbiAgICAgICAgICAgIGlmIChtb2R1bGVQcmVzZXJ2YXRpb24gPT09ICdmYWNhZGUnIHx8XHJcbiAgICAgICAgICAgICAgICBtb2R1bGVQcmVzZXJ2YXRpb24gPT09ICdwcmVzZXJ2ZScpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIGZhY2FkZSBtb2RlbCBpcyB1c2VkLFxyXG4gICAgICAgICAgICAgICAgLy8gd2UgcHJlc2VydmUgdGhlIG1vZHVsZSBzdHJ1Y3R1cmUuXHJcbiAgICAgICAgICAgICAgICBpZiAodXNlRWRpdG9yRm9sZGVyRmVhdHVyZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZWRpdG9yUGF0dGVycy5zb21lKHBhdHRlcm4gPT4gbWF0Y2hQYXR0ZXJuKGZpbGVVUkxUb1BhdGgodXJsKSwgcGF0dGVybikpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaOkumZpCBFZGl0b3Ig55uu5b2V5LiL55qE6ISa5pysXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudHJpZXMucHVzaCh1cmwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW50cmllcy5wdXNoKHVybCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZmlsZUJ1bmRsZU1hcFtzY3JpcHQuZmlsZV0gPSBpQnVuZGxlO1xyXG5cclxuICAgICAgICAgICAgaWYgKGV4cG9zZUVhY2hBc3NldE1vZHVsZSkge1xyXG4gICAgICAgICAgICAgICAgZXhwb3NlZEZpbGVNb2R1bGVVUkxzLmFkZCh1cmwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwcmVJbXBvcnRzTW9kdWxlID0gYHZpcnR1YWw6Ly8vcHJlcmVxdWlzaXRlLWltcG9ydHMvJHtidW5kbGUuaWR9YDtcclxuICAgICAgICBsZXQgYnVuZGxlU2NyaXB0RmlsZXMgPSBidW5kbGUuc2NyaXB0cy5tYXAoKHNjcmlwdCkgPT4gc2NyaXB0LmZpbGUpO1xyXG4gICAgICAgIGlmICh1c2VFZGl0b3JGb2xkZXJGZWF0dXJlKSB7XHJcbiAgICAgICAgICAgIGJ1bmRsZVNjcmlwdEZpbGVzID0gYnVuZGxlU2NyaXB0RmlsZXMuZmlsdGVyKGZpbGUgPT4gIWVkaXRvclBhdHRlcnMuc29tZShwYXR0ZXJuID0+IG1hdGNoUGF0dGVybihmaWxlLCBwYXR0ZXJuKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtZW1vcnlNb2RzW3ByZUltcG9ydHNNb2R1bGVdID0gbWFrZVByZXJlcXVpc2l0ZUltcG9ydHMoYnVuZGxlU2NyaXB0RmlsZXMpO1xyXG4gICAgICAgIGZpbGVCdW5kbGVNYXBbcHJlSW1wb3J0c01vZHVsZV0gPSBpQnVuZGxlO1xyXG4gICAgICAgIGVudHJpZXMucHVzaChwcmVJbXBvcnRzTW9kdWxlKTtcclxuICAgICAgICBlbnRyeUdyb3Vwcy5wdXNoKGVudHJpZXMpO1xyXG4gICAgICAgIHByZXJlcXVpc2l0ZU1vZHVsZVVSTHMuYWRkKHByZUltcG9ydHNNb2R1bGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghYnVuZGxlQ29tbW9uQ2h1bmspIHtcclxuICAgICAgICAvLyBtZXJnZSBpbnRvIG9uZSB0aW1lIHJvbGx1cFxyXG4gICAgICAgIGNvbnN0IG1lcmdlZEVudHJpZXM6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuICAgICAgICBlbnRyeUdyb3Vwcy5mb3JFYWNoKGVudHJpZXMgPT4ge1xyXG4gICAgICAgICAgICBtZXJnZWRFbnRyaWVzLnB1c2goLi4uZW50cmllcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZW50cnlHcm91cHMubGVuZ3RoID0gMDtcclxuICAgICAgICBlbnRyeUdyb3Vwcy5wdXNoKG1lcmdlZEVudHJpZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGV4dGVybmFsRWRpdG9yTW9kdWxlcyA9IGdldEV4dGVybmFsRWRpdG9yTW9kdWxlcyhvcHRpb25zLmNjZU1vZHVsZU1hcCk7XHJcbiAgICBjb25zdCBpbXBvcnRSZXN0cmljdGlvbnMgPSBhd2FpdCBnZW5JbXBvcnRSZXN0cmljdGlvbnMob3B0aW9ucy5kYkluZm9zLCBleHRlcm5hbEVkaXRvck1vZHVsZXMpO1xyXG4gICAgY29uc3QgbW9kTG8gPSBuZXcgTW9kTG8oe1xyXG4gICAgICAgIHRhcmdldHM6IG9wdGlvbnMudHJhbnNmb3JtLnRhcmdldHMsXHJcbiAgICAgICAgbG9vc2U6IG9wdGlvbnMubG9vc2UsXHJcbiAgICAgICAgZXhwb3J0c0NvbmRpdGlvbnM6IG9wdGlvbnMuZXhwb3J0c0NvbmRpdGlvbnMsXHJcbiAgICAgICAgZ3Vlc3NDb21tb25Kc0V4cG9ydHM6IG9wdGlvbnMuZ3Vlc3NDb21tb25Kc0V4cG9ydHMsXHJcbiAgICAgICAgdXNlRGVmaW5lRm9yQ2xhc3NGaWVsZHM6IG9wdGlvbnMudXNlRGVmaW5lRm9yQ2xhc3NGaWVsZHMsXHJcbiAgICAgICAgYWxsb3dEZWNsYXJlRmllbGRzOiBvcHRpb25zLmFsbG93RGVjbGFyZUZpZWxkcyxcclxuICAgICAgICBfaW50ZXJuYWxUcmFuc2Zvcm06IHtcclxuICAgICAgICAgICAgZXhjbHVkZXM6IG9wdGlvbnMudHJhbnNmb3JtPy5leGNsdWRlcyA/PyBbXSxcclxuICAgICAgICAgICAgaW5jbHVkZXM6IG9wdGlvbnMudHJhbnNmb3JtPy5pbmNsdWRlcyA/PyBbXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIF9jb21wcmVzc1VVSUQ6ICh1dWlkOiBzdHJpbmcpID0+IG9wdGlvbnMudXVpZENvbXByZXNzTWFwW3V1aWRdLFxyXG4gICAgICAgIF9oZWxwZXJNb2R1bGU6IHJwTW9kTG8uaGVscGVyTW9kdWxlLFxyXG4gICAgICAgIGhvdDogb3B0aW9ucy5ob3RNb2R1bGVSZWxvYWQsXHJcbiAgICAgICAgaW1wb3J0UmVzdHJpY3Rpb25zLFxyXG4gICAgICAgIHByZXNlcnZlU3ltbGlua3M6IG9wdGlvbnMucHJlc2VydmVTeW1saW5rcyxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHVzZXJJbXBvcnRNYXAgPSBvcHRpb25zLmltcG9ydE1hcDtcclxuXHJcbiAgICBjb25zdCBpbXBvcnRNYXA6IEltcG9ydE1hcCA9IHt9O1xyXG4gICAgY29uc3QgaW1wb3J0TWFwVVJMID0gdXNlckltcG9ydE1hcCA/IG5ldyBVUkwodXNlckltcG9ydE1hcC51cmwpIDogbmV3IFVSTCgnZm9vOi9iYXInKTtcclxuXHJcbiAgICBpbXBvcnRNYXAuaW1wb3J0cyA9IHtcclxuICAgICAgICAnY2MvZW52JzogJ3ZpcnR1YWw6L2NjL2VudicsXHJcbiAgICAgICAgJ2NjL3VzZXJsYW5kL21hY3JvJzogJ3ZpcnR1YWw6L2NjL3VzZXJsYW5kL21hY3JvJyxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgYXNzZXRQcmVmaXhlczogc3RyaW5nW10gPSBbXTtcclxuICAgIGZvciAoY29uc3QgZGJJbmZvIG9mIG9wdGlvbnMuZGJJbmZvcykge1xyXG4gICAgICAgIGNvbnN0IGRiVVJMID0gYGRiOi8vJHtkYkluZm8uZGJJRH0vYDtcclxuICAgICAgICBjb25zdCBhc3NldERpclVSTCA9IHBhdGhUb0ZpbGVVUkwocHMuam9pbihkYkluZm8udGFyZ2V0LCBwcy5qb2luKHBzLnNlcCkpKS5ocmVmO1xyXG4gICAgICAgIGltcG9ydE1hcC5pbXBvcnRzW2RiVVJMXSA9IGFzc2V0RGlyVVJMO1xyXG4gICAgICAgIGFzc2V0UHJlZml4ZXMucHVzaChhc3NldERpclVSTCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHVzZXJJbXBvcnRNYXApIHtcclxuICAgICAgICBpZiAodXNlckltcG9ydE1hcC5qc29uLmltcG9ydHMpIHtcclxuICAgICAgICAgICAgaW1wb3J0TWFwLmltcG9ydHMgPSB7XHJcbiAgICAgICAgICAgICAgICAuLi5pbXBvcnRNYXAuaW1wb3J0cyxcclxuICAgICAgICAgICAgICAgIC4uLnVzZXJJbXBvcnRNYXAuanNvbi5pbXBvcnRzLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodXNlckltcG9ydE1hcC5qc29uLnNjb3Blcykge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtzY29wZVJlcCwgc3BlY2lmaWVyTWFwXSBvZiBPYmplY3QuZW50cmllcyh1c2VySW1wb3J0TWFwLmpzb24uc2NvcGVzKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NvcGVzID0gaW1wb3J0TWFwLnNjb3BlcyA/Pz0ge307XHJcbiAgICAgICAgICAgICAgICBzY29wZXNbc2NvcGVSZXBdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLihzY29wZXNbc2NvcGVSZXBdID8/IHt9KSxcclxuICAgICAgICAgICAgICAgICAgICAuLi5zcGVjaWZpZXJNYXAsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vZExvLnNldEltcG9ydE1hcChpbXBvcnRNYXAsIGltcG9ydE1hcFVSTCk7XHJcbiAgICBtb2RMby5zZXRBc3NldFByZWZpeGVzKGFzc2V0UHJlZml4ZXMpO1xyXG5cclxuICAgIG1vZExvLmFkZE1lbW9yeU1vZHVsZSgndmlydHVhbDovY2MvZW52JywgY2NFbnZNb2QpO1xyXG5cclxuICAgIC8vIOWkhOeQhuiHquWumuS5ieWuj+aooeWdl1xyXG4gICAgbW9kTG8uYWRkTWVtb3J5TW9kdWxlKCd2aXJ0dWFsOi9jYy91c2VybGFuZC9tYWNybycsXHJcbiAgICAgICAgb3B0aW9ucy5jdXN0b21NYWNyb0xpc3QubWFwKChpdGVtOiBhbnkpID0+IGBleHBvcnQgY29uc3QgJHtpdGVtLmtleX0gPSAke2l0ZW0udmFsdWV9O2ApLmpvaW4oJ1xcbicpKTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IFt1cmwsIGNvZGVdIG9mIE9iamVjdC5lbnRyaWVzKG1lbW9yeU1vZHMpKSB7XHJcbiAgICAgICAgbW9kTG8uYWRkTWVtb3J5TW9kdWxlKHVybCwgY29kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBbdXJsLCB1dWlkXSBvZiBPYmplY3QuZW50cmllcyh1dWlkTWFwKSkge1xyXG4gICAgICAgIG1vZExvLnNldFVVSUQodXJsLCB1dWlkKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByb2xsdXBQbHVnaW5zOiByb2xsdXAuUGx1Z2luW10gPSBbXHJcbiAgICAgICAgcnBNb2RMbyh7IG1vZExvIH0pLFxyXG4gICAgXTtcclxuICAgIGlmIChtb2R1bGVQcmVzZXJ2YXRpb24gPT09ICdmYWNhZGUnIHx8IG1vZHVsZVByZXNlcnZhdGlvbiA9PT0gJ2VyYXNlJykge1xyXG4gICAgICAgIHJvbGx1cFBsdWdpbnMucHVzaChycE5hbWVkQ2h1bmsoKSk7XHJcbiAgICB9XHJcbiAgICBpZiAob3B0aW9ucy5zb3VyY2VNYXBzKSB7XHJcbiAgICAgICAgcm9sbHVwUGx1Z2lucy5wdXNoKHJwU291cmNlbWFwcygpKTtcclxuICAgIH1cclxuICAgIGlmICghb3B0aW9ucy5kZWJ1Zykge1xyXG4gICAgICAgIHJvbGx1cFBsdWdpbnMucHVzaChcclxuICAgICAgICAgICAgdGVyc2VyKCksXHJcbiAgICAgICAgICAgIC8vIFRPRE9cclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtb2R1bGVQcmVzZXJ2YXRpb24gPT09ICdlcmFzZScpIHtcclxuICAgICAgICByb2xsdXBQbHVnaW5zLnB1c2goe1xyXG4gICAgICAgICAgICBuYW1lOiAnY29jb3MtY3JlYXRvci9yZXNvbHZlLWltcG9ydC1tZXRhJyxcclxuICAgICAgICAgICAgcmVzb2x2ZUltcG9ydE1ldGEocHJvcGVydHksIHsgbW9kdWxlSWQgfSkge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChwcm9wZXJ0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAndXJsJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwobW9kdWxlSWQpLmhyZWY7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCcke3VybH0nYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDYW4gbm90IGFjY2VzcyBpbXBvcnQubWV0YS51cmwgb2YgbW9kdWxlICcke21vZHVsZUlkfScuICcke21vZHVsZUlkfScgaXMgbm90IGEgdmFsaWQgVVJMLmApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGlnbm9yZUVtcHR5QnVuZGxlV2FybmluZyA9IG9wdGlvbnMubW9kdWxlUHJlc2VydmF0aW9uICE9PSAncHJlc2VydmUnO1xyXG5cclxuICAgIGNvbnN0IHJvbGx1cFdhcm5pbmdIYW5kbGVyOiByb2xsdXAuV2FybmluZ0hhbmRsZXJXaXRoRGVmYXVsdCA9ICh3YXJuaW5nLCBkZWZhdWx0SGFuZGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChpZ25vcmVFbXB0eUJ1bmRsZVdhcm5pbmcgJiYgKHR5cGVvZiB3YXJuaW5nID09PSAnb2JqZWN0JykgJiYgd2FybmluZy5jb2RlID09PSAnRU1QVFlfQlVORExFJykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHdhcm5pbmcgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGlmICh3YXJuaW5nLmNvZGUgPT09ICdDSVJDVUxBUl9ERVBFTkRFTkNZJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdhcm5pbmcuaW1wb3J0ZXI/LmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gZGVmYXVsdEhhbmRsZXIod2FybmluZyk7XHJcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IHR5cGVvZiB3YXJuaW5nID09PSAnb2JqZWN0JyA/ICh3YXJuaW5nLm1lc3NhZ2UgfHwgd2FybmluZykgOiB3YXJuaW5nO1xyXG4gICAgICAgIGNvbnNvbGUud2FybihgW1tCdWlsZEdsb2JhbEluZm8uU2NyaXB0LlJvbGx1cF1dICR7bWVzc2FnZX1gKTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgaW1wb3J0TWFwcGluZ3M6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuICAgIC8vIOWmguaenOW8gOWQr+S6hiBidW5kbGVDb21tb25DaHVua++8jOWImSBpQnVuZGxlIOaYryBidW5kbGVJbmRleFxyXG4gICAgZm9yIChsZXQgaUJ1bmRsZSA9IDA7IGlCdW5kbGUgPCBlbnRyeUdyb3Vwcy5sZW5ndGg7ICsraUJ1bmRsZSkge1xyXG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBlbnRyeUdyb3Vwc1tpQnVuZGxlXTtcclxuXHJcbiAgICAgICAgaWYgKGJ1bmRsZUNvbW1vbkNodW5rKSB7XHJcbiAgICAgICAgICAgIGJ1bmRsZUlkVG9OYW1lQ2h1bmsgPSBidW5kbGVzW2lCdW5kbGVdLmlkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgcm9sbHVwT3B0aW9uczogcm9sbHVwLlJvbGx1cE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGlucHV0OiBlbnRyaWVzLFxyXG4gICAgICAgICAgICBwbHVnaW5zOiByb2xsdXBQbHVnaW5zLFxyXG4gICAgICAgICAgICBwcmVzZXJ2ZU1vZHVsZXM6IG1vZHVsZVByZXNlcnZhdGlvbiAhPT0gJ2VyYXNlJyxcclxuICAgICAgICAgICAgZXh0ZXJuYWw6IFsnY2MnXSxcclxuICAgICAgICAgICAgb253YXJuOiByb2xsdXBXYXJuaW5nSGFuZGxlcixcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCByb2xsdXBCdWlsZCA9IGF3YWl0IHJvbGx1cC5yb2xsdXAocm9sbHVwT3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJvbGx1cE91dHB1dE9wdGlvbnM6IHJvbGx1cC5PdXRwdXRPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBzb3VyY2VtYXA6IG9wdGlvbnMuc291cmNlTWFwcyxcclxuICAgICAgICAgICAgZXhwb3J0czogJ25hbWVkJywgLy8gRXhwbGljaXRseSBzZXQgdGhpcyB0byBkaXNhYmxlIHdhcm5pbmdcclxuICAgICAgICAgICAgLy8gYWJvdXQgY29leGlzdGVuY2Ugb2YgZGVmYXVsdCBhbmQgbmFtZWQgZXhwb3J0c1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKG9wdGlvbnMubW9kdWxlUHJlc2VydmF0aW9uID09PSAncHJlc2VydmUnKSB7XHJcbiAgICAgICAgICAgIHJvbGx1cE91dHB1dE9wdGlvbnMuZm9ybWF0ID0gb3B0aW9ucy5tb2R1bGVGb3JtYXQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gRmFjYWRlIG9yIGVyYXNlXHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24ocm9sbHVwT3V0cHV0T3B0aW9ucywge1xyXG4gICAgICAgICAgICAgICAgZm9ybWF0OiAnc3lzdGVtJyxcclxuICAgICAgICAgICAgICAgIHN0cmljdDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBzeXN0ZW1OdWxsU2V0dGVyczogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByb2xsdXBPdXRwdXQgPSBhd2FpdCByb2xsdXBCdWlsZC5nZW5lcmF0ZShyb2xsdXBPdXRwdXRPcHRpb25zKTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMubW9kdWxlUHJlc2VydmF0aW9uID09PSAncHJlc2VydmUnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNodW5rSG9tZURpciA9IG9wdGlvbnMuY29tbW9uRGlyO1xyXG5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBjaHVua09yQXNzZXQgb2Ygcm9sbHVwT3V0cHV0Lm91dHB1dCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNodW5rT3JBc3NldC50eXBlICE9PSAnY2h1bmsnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IGNodW5rT3JBc3NldC5maWxlTmFtZS5tYXRjaCgvXFwuKGpzfHRzfG1qcykkLylcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBjaHVua09yQXNzZXQuZmlsZU5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBgJHtjaHVua09yQXNzZXQuZmlsZU5hbWV9LmpzYDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGF0aCA9IHBzLmpvaW4oY2h1bmtIb21lRGlyLCByZWxhdGl2ZVBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGZzLm91dHB1dEZpbGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rT3JBc3NldC5jb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAndXRmOCcsXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhwb3NlZFVSTCA9IGlkZW50aWZ5RXhwb3NlZE1vZHVsZShjaHVua09yQXNzZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChleHBvc2VkVVJMKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGJldHRlciBjYWxjdWxhdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaHVua1BhdGhCYXNlZE9uSW1wb3J0TWFwID0gYC4vY2h1bmtzLyR7cmVsYXRpdmVQYXRofWAucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbXBvcnRNYXBwaW5nc1tleHBvc2VkVVJMXSA9IGNodW5rUGF0aEJhc2VkT25JbXBvcnRNYXA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChidW5kbGVDb21tb25DaHVuaykge1xyXG4gICAgICAgICAgICBjb25zdCBidW5kbGUgPSBidW5kbGVzW2lCdW5kbGVdO1xyXG4gICAgICAgICAgICBjb25zdCBlbnRyeUNodW5rQnVuZGxlcjogQ2h1bmtCdW5kbGVyID0gbmV3IENodW5rQnVuZGxlcihidW5kbGUub3V0RmlsZSk7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmtPckFzc2V0IG9mIHJvbGx1cE91dHB1dC5vdXRwdXQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjaHVua09yQXNzZXQudHlwZSAhPT0gJ2NodW5rJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZW50cnlDaHVua0J1bmRsZXIuYWRkKGNodW5rT3JBc3NldCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBleHBvc2VkVVJMID0gaWRlbnRpZnlFeHBvc2VkTW9kdWxlKGNodW5rT3JBc3NldCk7XHJcbiAgICAgICAgICAgICAgICAvLyDmqKHlnZfmmKDlsITpnIDopoHlnKjmqKHlnZflhoXpg6jlgZrlpb3vvIzkuI3kvp3otZblpJbpg6jnmoQgaW1wb3J0LW1hcO+8jOWQpuWImSBidW5kbGUg5bCG5LiN6IO96Leo6aG555uu5aSN55SoXHJcbiAgICAgICAgICAgICAgICBpZiAoZXhwb3NlZFVSTCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVudHJ5Q2h1bmtCdW5kbGVyLmFkZE1vZHVsZU1hcHBpbmcoZXhwb3NlZFVSTCwgZ2V0Q2h1bmtVcmwoY2h1bmtPckFzc2V0KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXdhaXQgZW50cnlDaHVua0J1bmRsZXIud3JpdGUoe1xyXG4gICAgICAgICAgICAgICAgc291cmNlTWFwcyxcclxuICAgICAgICAgICAgICAgIHdyYXA6IGZhbHNlLCAvLyDkuLvljIXmiormiYDmnIkgU3lzdGVtLnJlZ2lzdGVyKCkg5YyF6LW35p2l77yM5a2Q5YyF5LiN5YyF44CCXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vbkVudHJ5Q2h1bmtzQnVuZGxlT3V0RmlsZSA9IHBzLmpvaW4ob3B0aW9ucy5jb21tb25EaXIsICdidW5kbGUuanMnKTtcclxuICAgICAgICAgICAgY29uc3Qgbm9uRW50cnlDaHVua0J1bmRsZXIgPSBuZXcgQ2h1bmtCdW5kbGVyKG5vbkVudHJ5Q2h1bmtzQnVuZGxlT3V0RmlsZSk7XHJcbiAgICAgICAgICAgIGxldCBuTm9uRW50cnlDaHVua3MgPSAwO1xyXG4gICAgICAgICAgICBjb25zdCBlbnRyeUNodW5rQnVuZGxlcnM6IENodW5rQnVuZGxlcltdID0gYnVuZGxlcy5tYXAoKGJ1bmRsZSkgPT4gbmV3IENodW5rQnVuZGxlcihidW5kbGUub3V0RmlsZSkpO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rT3JBc3NldCBvZiByb2xsdXBPdXRwdXQub3V0cHV0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2h1bmtPckFzc2V0LnR5cGUgIT09ICdjaHVuaycpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIE5PVEU6IOS4gOS6m+mcgOimgSBDSlMgaW50ZXJvcCDnmoTmqKHlnZflm6DkuLrmj5LlhaXkuoYgaW50ZXJvcCDmqKHlnZfvvIzooqsgcm9sbHVwIOino+aekOS4uumdnuWFpeWPoyBjaHVua1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaXNFbnRyeSA9ICEhY2h1bmtPckFzc2V0LmZhY2FkZU1vZHVsZUlkICYmIGVudHJpZXMuaW5jbHVkZXMoY2h1bmtPckFzc2V0LmZhY2FkZU1vZHVsZUlkKTtcclxuICAgICAgICAgICAgICAgIGlmICghY2h1bmtPckFzc2V0LmlzRW50cnkgJiYgIWlzRW50cnkpIHtcclxuICAgICAgICAgICAgICAgICAgICBub25FbnRyeUNodW5rQnVuZGxlci5hZGQoY2h1bmtPckFzc2V0KTtcclxuICAgICAgICAgICAgICAgICAgICArK25Ob25FbnRyeUNodW5rcztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVuZGxlSW5kZXggPSBnZXRCdW5kbGVJbmRleE9mQ2h1bmsoY2h1bmtPckFzc2V0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYnVuZGxlSW5kZXggPCAwIHx8IGVudHJ5Q2h1bmtCdW5kbGVyc1tidW5kbGVJbmRleF0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuZXhwZWN0ZWQ6IGVudHJ5IGNodW5rIG5hbWUgJHtjaHVua09yQXNzZXQubmFtZX0gaXMgbm90IGluIGxpc3QuYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vbkVudHJ5Q2h1bmtCdW5kbGVyLmFkZChjaHVua09yQXNzZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArK25Ob25FbnRyeUNodW5rcztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRyeUNodW5rQnVuZGxlcnNbYnVuZGxlSW5kZXhdLmFkZChjaHVua09yQXNzZXQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhwb3NlZFVSTCA9IGlkZW50aWZ5RXhwb3NlZE1vZHVsZShjaHVua09yQXNzZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmqKHlnZfmmKDlsITpnIDopoHlnKjmqKHlnZflhoXpg6jlgZrlpb3vvIzkuI3kvp3otZblpJbpg6jnmoQgaW1wb3J0LW1hcO+8jOWQpuWImSBidW5kbGUg5bCG5LiN6IO96Leo6aG555uu5aSN55SoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHBvc2VkVVJMKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeUNodW5rQnVuZGxlcnNbYnVuZGxlSW5kZXhdLmFkZE1vZHVsZU1hcHBpbmcoZXhwb3NlZFVSTCwgZ2V0Q2h1bmtVcmwoY2h1bmtPckFzc2V0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYE51bWJlciBvZiBub24tZW50cnkgY2h1bmtzOiAke2VudHJ5Q2h1bmtCdW5kbGVycy5sZW5ndGh9YCk7XHJcbiAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKGVudHJ5Q2h1bmtCdW5kbGVycy5tYXAoYXN5bmMgKGVudHJ5Q2h1bmtCdW5kbGVyLCBpRW50cnkpID0+IHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IGVudHJ5Q2h1bmtCdW5kbGVyLndyaXRlKHtcclxuICAgICAgICAgICAgICAgICAgICBzb3VyY2VNYXBzLFxyXG4gICAgICAgICAgICAgICAgICAgIHdyYXA6IGZhbHNlLCAvLyDkuLvljIXmiormiYDmnIkgU3lzdGVtLnJlZ2lzdGVyKCkg5YyF6LW35p2l77yM5a2Q5YyF5LiN5YyF44CCXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICBpZiAobk5vbkVudHJ5Q2h1bmtzKSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBub25FbnRyeUNodW5rQnVuZGxlci53cml0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlTWFwcyxcclxuICAgICAgICAgICAgICAgICAgICB3cmFwOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBub25FbnRyeUNodW5rc0J1bmRsZU91dEZpbGU7XHJcbiAgICAgICAgICAgICAgICByZXMuc2NyaXB0UGFja2FnZXMucHVzaCh1cmwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGJ1bmRsZUlkVG9OYW1lQ2h1bmsgPSBudWxsO1xyXG4gICAgcmVzLmltcG9ydE1hcHBpbmdzID0gaW1wb3J0TWFwcGluZ3M7XHJcblxyXG4gICAgZnVuY3Rpb24gbWFrZVByZXJlcXVpc2l0ZUltcG9ydHMobW9kdWxlczogc3RyaW5nW10pIHtcclxuICAgICAgICByZXR1cm4gbW9kdWxlcy5zb3J0KClcclxuICAgICAgICAgICAgLm1hcCgobSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGBpbXBvcnQgXCIke3BhdGhUb0ZpbGVVUkwobSkuaHJlZn1cIjtgO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuam9pbignXFxuJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElCdWlsZFNjcmlwdEZ1bmN0aW9uT3B0aW9uIHtcclxuICAgIC8qKlxyXG4gICAgICogQXJlIHdlIGluIGRlYnVnIG1vZGU/XHJcbiAgICAgKi9cclxuICAgIGRlYnVnOiBib29sZWFuO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hldGhlciB0byBnZW5lcmF0ZSBzb3VyY2UgbWFwcyBvciBub3QuXHJcbiAgICAgKi9cclxuICAgIHNvdXJjZU1hcHM6IGJvb2xlYW4gfCAnaW5saW5lJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIE1vZHVsZSBmb3JtYXQuXHJcbiAgICAgKi9cclxuICAgIG1vZHVsZUZvcm1hdDogcm9sbHVwLk1vZHVsZUZvcm1hdDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE1vZHVsZSBwcmVzZXJ2YXRpb24uXHJcbiAgICAgKi9cclxuICAgIG1vZHVsZVByZXNlcnZhdGlvbjogTW9kdWxlUHJlc2VydmF0aW9uO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogISFFeHBlcmltZW50YWwuXHJcbiAgICAgKi9cclxuICAgIHRyYW5zZm9ybTogVHJhbnNmb3JtT3B0aW9ucztcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFsbCBzdWItcGFja2FnZXMuXHJcbiAgICAgKi9cclxuICAgIGJ1bmRsZXM6IEFycmF5PEJ1bmRsZT47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSb290IG91dHB1dCBkaXJlY3RvcnkuXHJcbiAgICAgKi9cclxuICAgIGNvbW1vbkRpcjogc3RyaW5nO1xyXG5cclxuICAgIGhvdE1vZHVsZVJlbG9hZDogYm9vbGVhbjtcclxuXHJcbiAgICBhcHBsaWNhdGlvbkpTOiBzdHJpbmc7XHJcblxyXG4gICAgZGJJbmZvczogREJJbmZvW107XHJcblxyXG4gICAgdXVpZENvbXByZXNzTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xyXG5cclxuICAgIGN1c3RvbU1hY3JvTGlzdDogTWFjcm9JdGVtW107XHJcblxyXG4gICAgY2NFbnZDb25zdGFudHM6IENDRW52Q29uc3RhbnRzO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBvcHRpb24gd2lsbCBidW5kbGUgZXh0ZXJuYWwgY2h1bmsgaW50byBlYWNoIGJ1bmRsZSdzIGNodW5rIGluIG9yZGVyIHRvIGFjaGlldmUgdGhlIHB1cnBvc2Ugb2YgY3Jvc3MtcHJvamVjdCByZXVzZSBvZiB0aGUgYnVuZGxlLlxyXG4gICAgICogVGhpcyB3aWxsIGluY3JlYXNlIHRoZSBzaXplIG9mIHRoZSBidW5kbGUgYW5kIGludHJvZHVjZSB0aGUgaXNzdWUgb2YgY2h1bmsgZG9wcGVsZ2FuZ2VyLCBzbyB1c2UgaXQgd2l0aCBjYXV0aW9uLlxyXG4gICAgICogQGRlZmF1bHQgZmFsc2VcclxuICAgICAqL1xyXG4gICAgYnVuZGxlQ29tbW9uQ2h1bms/OiBib29sZWFuO1xyXG5cclxuICAgIGNjZU1vZHVsZU1hcDogUmVjb3JkPHN0cmluZywgYW55PjtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkU3lzdGVtSnNDb21tYW5kKG9wdGlvbnM6IElCdWlsZFN5c3RlbUpzT3B0aW9uKSB7XHJcbiAgICByZXR1cm4gYXdhaXQgYnVpbGRTeXN0ZW1Kcyh7XHJcbiAgICAgICAgb3V0OiBvcHRpb25zLmRlc3QsXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUT0RPIGJ1aWxkU3lzdGVtSnMg55uu5YmN55qEIHNvdXJjZU1hcCDmjqXlj6PlrprkuYnmnInnvLrlpLHvvIzpnIDopoHlj5HniYjmnKxcclxuICAgICAgICBzb3VyY2VNYXA6IG9wdGlvbnMuc291cmNlTWFwcyxcclxuICAgICAgICBtaW5pZnk6ICFvcHRpb25zLmRlYnVnLFxyXG4gICAgICAgIHBsYXRmb3JtOiBvcHRpb25zLnBsYXRmb3JtLFxyXG4gICAgICAgIGhtcjogb3B0aW9ucy5ob3RNb2R1bGVSZWxvYWQsXHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkUG9seWZpbGxzQ29tbWFuZChvcHRpb25zOiBJUG9seUZpbGxzID0ge30sIGRlc3Q6IHN0cmluZykge1xyXG5cclxuICAgIGNvbnN0IGxlYXN0UmVxdWlyZWRDb3JlSnNNb2R1bGVzOiBzdHJpbmdbXSA9IFtcclxuICAgICAgICAnZXMuZ2xvYmFsLXRoaXMnLCAvLyBnbG9iYWxUaGlzXHJcbiAgICBdO1xyXG4gICAgLy8g5p6E5bu6IFBvbHlmaWxsc1xyXG4gICAgY29uc3QgYnVpbGRQb2x5ZmlsbHNPcHRpb25zOiBidWlsZFBvbHlmaWxscy5PcHRpb25zID0ge1xyXG4gICAgICAgIGRlYnVnOiBmYWxzZSxcclxuICAgICAgICBzb3VyY2VNYXA6IGZhbHNlLFxyXG4gICAgICAgIC8vIGZpbGU6IHBzLmpvaW4ocmVzdWx0LnBhdGhzLmRpciwgJ3NyYycsICdwb2x5ZmlsbHMuYnVuZGxlLmpzJyksXHJcbiAgICAgICAgZmlsZTogZGVzdCxcclxuICAgIH07XHJcbiAgICAvLyBBc3luYyBmdW5jdGlvbnMgcG9seWZpbGxzXHJcbiAgICBpZiAob3B0aW9ucy5hc3luY0Z1bmN0aW9ucykge1xyXG4gICAgICAgIGJ1aWxkUG9seWZpbGxzT3B0aW9ucy5hc3luY0Z1bmN0aW9ucyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICAvLyBDb3JlSnMgcG9seWZpbGxzXHJcbiAgICBpZiAob3B0aW9ucy5jb3JlSnMpIHtcclxuICAgICAgICBidWlsZFBvbHlmaWxsc09wdGlvbnMuY29yZUpzID0ge1xyXG4gICAgICAgICAgICBtb2R1bGVzOiBbJ2VzJ10sXHJcbiAgICAgICAgICAgIGJsYWNrbGlzdDogW10sXHJcbiAgICAgICAgICAgIHRhcmdldHM6IG9wdGlvbnMudGFyZ2V0cyxcclxuICAgICAgICB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBidWlsZFBvbHlmaWxsc09wdGlvbnMuY29yZUpzID0ge1xyXG4gICAgICAgICAgICBtb2R1bGVzOiBsZWFzdFJlcXVpcmVkQ29yZUpzTW9kdWxlcyxcclxuICAgICAgICAgICAgYmxhY2tsaXN0OiBbXSxcclxuICAgICAgICAgICAgdGFyZ2V0czogb3B0aW9ucy50YXJnZXRzLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBjb25zdCBoYXNQb2x5ZmlsbCA9IGF3YWl0IGJ1aWxkUG9seWZpbGxzKGJ1aWxkUG9seWZpbGxzT3B0aW9ucyk7XHJcbiAgICAvLyBIQUNLIGJ1aWxkUG9seWZpbGxzIOi/lOWbnuWAvOS4jeWvuVxyXG4gICAgaWYgKGhhc1BvbHlmaWxsICYmIGF3YWl0IHBhdGhFeGlzdHMoYnVpbGRQb2x5ZmlsbHNPcHRpb25zLmZpbGUpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuZXhwb3J0IGludGVyZmFjZSBUcmFuc2Zvcm1PcHRpb25zIHtcclxuICAgIC8qKlxyXG4gICAgICogQmFiZWwgcGx1Z2lucyB0byBleGNsdWRlZC4gV2lsbCBiZSBwYXNzZWQgdG8gYXMgcGFydGlhbCBgZXhjbHVkZWAgb3B0aW9ucyBvZiBgQGJhYmVsL3ByZXNldC1lbnZgLlxyXG4gICAgICovXHJcbiAgICBleGNsdWRlcz86IEFycmF5PHN0cmluZyB8IFJlZ0V4cD47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCYWJlbCBwbHVnaW5zIHRvIGluY2x1ZGVkLiBXaWxsIGJlIHBhc3NlZCB0byBhcyBwYXJ0aWFsIGBpbmNsdWRlYCBvcHRpb25zIG9mIGBAYmFiZWwvcHJlc2V0LWVudmAuXHJcbiAgICAgKi9cclxuICAgIGluY2x1ZGVzPzogQXJyYXk8c3RyaW5nIHwgUmVnRXhwPjtcclxuXHJcbiAgICB0YXJnZXRzPzogSVRyYW5zZm9ybVRhcmdldDtcclxufVxyXG5cclxuY2xhc3MgQ2h1bmtCdW5kbGVyIHtcclxuICAgIHByaXZhdGUgX291dDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfcGFydHM6IEFycmF5PFtzdHJpbmcgLyogZm9yIHNvcnQgb25seSwgdG8gZW5zdXJlIHRoZSBvcmRlciAqLywge1xyXG4gICAgICAgIGNvZGU6IHN0cmluZztcclxuICAgICAgICBtYXA/OiBzdHJpbmc7XHJcbiAgICB9XT4gPSBbXTtcclxuICAgIHByaXZhdGUgX2NodW5rTWFwcGluZ3M6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihvdXQ6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX291dCA9IG91dDtcclxuICAgIH1cclxuXHJcbiAgICBhZGQoY2h1bms6IHJvbGx1cC5PdXRwdXRDaHVuaykge1xyXG4gICAgICAgIHRoaXMuX3BhcnRzLnB1c2goW2NodW5rLmZpbGVOYW1lLCB7XHJcbiAgICAgICAgICAgIGNvZGU6IGNodW5rLmNvZGUsXHJcbiAgICAgICAgICAgIG1hcDogY2h1bmsubWFwPy50b1N0cmluZygpLFxyXG4gICAgICAgIH1dKTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRNb2R1bGVNYXBwaW5nKG1hcHBpbmc6IHN0cmluZywgY2h1bms6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX2NodW5rTWFwcGluZ3NbbWFwcGluZ10gPSBjaHVuaztcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyB3cml0ZShvcHRpb25zOiB7IHNvdXJjZU1hcHM6IGJvb2xlYW4gfCAnaW5saW5lJywgd3JhcD86IGJvb2xlYW4gfSkge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBwYWNrTW9kcyhcclxuICAgICAgICAgICAgdGhpcy5fcGFydHMuc29ydChcclxuICAgICAgICAgICAgICAgIChbYV0sIFtiXSkgPT4gYS5sb2NhbGVDb21wYXJlKGIpLFxyXG4gICAgICAgICAgICApLm1hcCgoW18sIHBdKSA9PiBwKSwgdGhpcy5fY2h1bmtNYXBwaW5ncywgdGhpcy5fb3V0LCBvcHRpb25zKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcnBOYW1lZENodW5rKCk6IHJvbGx1cC5QbHVnaW4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBuYW1lOiAnbmFtZWQtY2h1bmsnLFxyXG4gICAgICAgIHJlbmRlckNodW5rOiBhc3luYyBmdW5jdGlvbiAodGhpcywgY29kZSwgY2h1bmssIG9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGNodW5rSWQgPSBnZXRDaHVua1VybChjaHVuayk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybVJlc3VsdCA9IGF3YWl0IGJhYmVsLnRyYW5zZm9ybUFzeW5jKGNvZGUsIHtcclxuICAgICAgICAgICAgICAgIHNvdXJjZU1hcHM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjb21wYWN0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHBsdWdpbnM6IFtbdG9OYW1lZFJlZ2lzdGVyLCB7IG5hbWU6IGNodW5rSWQgfV1dLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKCF0cmFuc2Zvcm1SZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud2FybignRmFpbGVkIHRvIHJlbmRlciBjaHVuay4nKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiB0cmFuc2Zvcm1SZXN1bHQuY29kZSEsXHJcbiAgICAgICAgICAgICAgICBtYXA6IHRyYW5zZm9ybVJlc3VsdC5tYXAsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENodW5rVXJsKGNodW5rOiByb2xsdXAuUmVuZGVyZWRDaHVuaykge1xyXG4gICAgaWYgKGJ1bmRsZUlkVG9OYW1lQ2h1bmspIHtcclxuICAgICAgICAvLyDop6PlhrMgYnVuZGxlIOi3qOmhueebruaXtuaooeWdl+WRveWQjeWGsueqgeeahOmXrumimFxyXG4gICAgICAgIHJldHVybiBgYnVuZGxlOi8vJHtidW5kbGVJZFRvTmFtZUNodW5rfS8ke2NodW5rLmZpbGVOYW1lfWA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBgY2h1bmtzOi8vLyR7Y2h1bmsuZmlsZU5hbWV9YDtcclxuICAgIH1cclxufVxyXG4iXX0=