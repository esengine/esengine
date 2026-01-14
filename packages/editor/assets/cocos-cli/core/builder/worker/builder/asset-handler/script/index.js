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
exports.ScriptBuilder = void 0;
const path_1 = require("path");
const build_time_constants_1 = require("./build-time-constants");
const fs_extra_1 = require("fs-extra");
const sub_process_manager_1 = require("../../../worker-pools/sub-process-manager");
const asset_library_1 = require("../../manager/asset-library");
const babel = __importStar(require("@babel/core"));
const preset_env_1 = __importDefault(require("@babel/preset-env"));
const assets_1 = require("../../../../../assets");
const scripting_1 = __importDefault(require("../../../../../scripting"));
const engine_1 = require("../../../../../engine");
const utils_1 = require("../../utils");
const project_1 = __importDefault(require("../../../../../project"));
const static_compile_check_1 = require("./static-compile-check");
class ScriptBuilder {
    _scriptOptions;
    _importMapOptions;
    // 脚本资源包分组（子包/分包）
    scriptPackages = [];
    static projectOptions;
    initTaskOptions(options) {
        // TODO 此处配置应该在外部整合好
        const transformOptions = {};
        if (!options.buildScriptParam.polyfills?.asyncFunctions) {
            (transformOptions.excludes ?? (transformOptions.excludes = [])).push('transform-regenerator');
        }
        if (options.buildScriptParam.targets) {
            transformOptions.targets = options.buildScriptParam.targets;
        }
        let modulePreservation = 'facade';
        if (options.buildScriptParam.experimentalEraseModules) {
            modulePreservation = 'erase';
        }
        const hotModuleReload = options.buildScriptParam.hotModuleReload ?? false;
        if (hotModuleReload) {
            modulePreservation = 'preserve';
        }
        const scriptOptions = {
            modulePreservation,
            debug: options.debug,
            sourceMaps: options.sourceMaps,
            hotModuleReload,
            transform: transformOptions,
            moduleFormat: 'system',
            commonDir: options.buildScriptParam.commonDir || '', // TODO 需要新的参数
            bundleCommonChunk: options.buildScriptParam.bundleCommonChunk ?? false,
        };
        return {
            scriptOptions,
            importMapOptions: {
                format: options.buildScriptParam.importMapFormat,
                data: { imports: {} },
                output: '',
            },
        };
    }
    async initProjectOptions(options) {
        const { scriptOptions, importMapOptions } = this.initTaskOptions(options);
        this._scriptOptions = scriptOptions;
        this._importMapOptions = importMapOptions;
        const ccEnvConstants = await (0, build_time_constants_1.getCCEnvConstants)({
            platform: options.buildScriptParam.platform,
            flags: options.buildScriptParam.flags,
        }, options.engineInfo.typescript.path);
        const sharedSettings = await scripting_1.default.querySharedSettings();
        // TODO 从 db 查询的都要封装在 asset-library 模块内
        const dbInfos = Object.values(assets_1.assetDBManager.assetDBMap).map((info) => {
            return {
                dbID: info.options.name,
                target: info.options.target,
            };
        });
        const customMacroList = engine_1.Engine.getConfig().macroCustom;
        ScriptBuilder.projectOptions = {
            customMacroList,
            dbInfos,
            ccEnvConstants,
            ...sharedSettings,
        };
    }
    async buildBundleScript(bundles) {
        const scriptBundles = [];
        const uuidCompressMap = {};
        bundles.forEach((bundle) => {
            if (!bundle.output) {
                return;
            }
            bundle.config.hasPreloadScript = !this._scriptOptions.hotModuleReload;
            scriptBundles.push({
                id: bundle.name,
                scripts: bundle.scripts.map((uuid) => {
                    uuidCompressMap[uuid] = (0, utils_1.compressUuid)(uuid, false);
                    return asset_library_1.buildAssetLibrary.getAssetInfo(uuid);
                }).sort((a, b) => a.name.localeCompare(b.name)),
                outFile: bundle.scriptDest,
            });
        });
        if (!scriptBundles.length) {
            console.debug('[script] no script to build');
            return;
        }
        // 执行静态编译检查
        // 注意：如果在 BuildCommand 中已经执行过，这里会重复执行。
        // 但为了确保脚本编译的安全性，这里强制检查。
        const checkResult = await (0, static_compile_check_1.runStaticCompileCheck)(project_1.default.path, true);
        if (!checkResult.passed) {
            // 构建失败，抛出错误，错误码为 500
            const errorMessage = checkResult.errorMessage || 'Found assets-related TypeScript errors';
            const error = new Error(errorMessage);
            error.code = 38 /* BuildExitCode.STATIC_COMPILE_ERROR */;
            throw error;
        }
        const cceModuleMap = scripting_1.default.queryCCEModuleMap();
        const buildScriptOptions = {
            ...this._scriptOptions,
            ...ScriptBuilder.projectOptions,
            bundles: scriptBundles,
            uuidCompressMap,
            applicationJS: '',
            cceModuleMap,
        };
        // 项目脚本编译目前编译内存占用较大，需要独立进程管理
        await sub_process_manager_1.workerManager.registerTask({
            name: 'build-script',
            path: (0, path_1.join)(__dirname, './build-script'),
            options: {
                cwd: project_1.default.path,
            }
        });
        const res = await sub_process_manager_1.workerManager.runTask('build-script', 'buildScriptCommand', [buildScriptOptions]);
        if (res) {
            if (res.scriptPackages) {
                this.scriptPackages.push(...res.scriptPackages);
            }
            if (res.importMappings) {
                Object.assign(this._importMapOptions.data.imports, res.importMappings);
            }
        }
        sub_process_manager_1.workerManager.kill('build-script');
        console.debug('Copy externalScripts success!');
        return res;
    }
    static async buildPolyfills(options = {}, dest) {
        await sub_process_manager_1.workerManager.registerTask({
            name: 'build-script',
            path: (0, path_1.join)(__dirname, './build-script'),
        });
        return await sub_process_manager_1.workerManager.runTask('build-script', 'buildPolyfillsCommand', [options, dest]);
    }
    static async buildSystemJs(options) {
        await sub_process_manager_1.workerManager.registerTask({
            name: 'build-script',
            path: (0, path_1.join)(__dirname, './build-script'),
        });
        return await sub_process_manager_1.workerManager.runTask('build-script', 'buildSystemJsCommand', [options]);
    }
    static async outputImportMap(importMap, options) {
        const { content } = await transformImportMap(importMap, options);
        await (0, fs_extra_1.ensureDir)((0, path_1.dirname)(options.dest));
        await (0, fs_extra_1.writeFile)(options.dest, content, {
            encoding: 'utf8',
        });
    }
}
exports.ScriptBuilder = ScriptBuilder;
async function transformImportMap(importMap, options) {
    const { importMapFormat } = options;
    let extension;
    let content = JSON.stringify(importMap, undefined, options.debug ? 2 : 0);
    if (importMapFormat === undefined) {
        extension = '.json';
    }
    else {
        extension = '.js';
        const code = `export default ${content}`;
        content = (await babel.transformAsync(code, {
            presets: [[
                    preset_env_1.default, {
                        modules: importMapFormat === 'esm' ? false : importMapFormat,
                    },
                ]],
        }))?.code;
    }
    return {
        extension,
        content,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3dvcmtlci9idWlsZGVyL2Fzc2V0LWhhbmRsZXIvc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRWIsK0JBQXFDO0FBQ3JDLGlFQUEyRTtBQUUzRSx1Q0FBNEQ7QUFDNUQsbUZBQTBFO0FBQzFFLCtEQUFnRTtBQUNoRSxtREFBcUM7QUFDckMsbUVBQStDO0FBSy9DLGtEQUF1RDtBQUN2RCx5RUFBOEM7QUFDOUMsa0RBQStDO0FBRS9DLHVDQUEyQztBQUMzQyxxRUFBNkM7QUFDN0MsaUVBQStEO0FBZ0IvRCxNQUFhLGFBQWE7SUFFdEIsY0FBYyxDQUFrQjtJQUNoQyxpQkFBaUIsQ0FBb0I7SUFFckMsaUJBQWlCO0lBQ1YsY0FBYyxHQUFhLEVBQUUsQ0FBQztJQUVyQyxNQUFNLENBQUMsY0FBYyxDQUF1QjtJQUU1QyxlQUFlLENBQUMsT0FBNEQ7UUFDeEUsb0JBQW9CO1FBQ3BCLE1BQU0sZ0JBQWdCLEdBQXFCLEVBQUUsQ0FBQztRQUM5QyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsQ0FBQztZQUN0RCxDQUFDLGdCQUFnQixDQUFDLFFBQVEsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ2xHLENBQUM7UUFDRCxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNuQyxnQkFBZ0IsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQztRQUNoRSxDQUFDO1FBRUQsSUFBSSxrQkFBa0IsR0FBdUIsUUFB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R0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRSxJQUFJLGVBQWUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNoQyxTQUFTLEdBQUcsT0FBTyxDQUFDO0lBQ3hCLENBQUM7U0FBTSxDQUFDO1FBQ0osU0FBUyxHQUFHLEtBQUssQ0FBQztRQUNsQixNQUFNLElBQUksR0FBRyxrQkFBa0IsT0FBTyxFQUFFLENBQUM7UUFDekMsT0FBTyxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRTtZQUN4QyxPQUFPLEVBQUUsQ0FBQztvQkFDTixvQkFBYyxFQUFFO3dCQUNaLE9BQU8sRUFBRSxlQUFlLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGVBQWU7cUJBQy9EO2lCQUNKLENBQUM7U0FDTCxDQUFDLENBQUMsRUFBRSxJQUFLLENBQUM7SUFDZixDQUFDO0lBQ0QsT0FBTztRQUNILFNBQVM7UUFDVCxPQUFPO0tBQ1YsQ0FBQztBQUNOLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBkaXJuYW1lLCBqb2luIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IENDRW52Q29uc3RhbnRzLCBnZXRDQ0VudkNvbnN0YW50cyB9IGZyb20gJy4vYnVpbGQtdGltZS1jb25zdGFudHMnO1xyXG5pbXBvcnQgeyBidWlsZFNjcmlwdENvbW1hbmQsIGJ1aWxkU3lzdGVtSnNDb21tYW5kLCBJQnVpbGRTY3JpcHRGdW5jdGlvbk9wdGlvbiwgVHJhbnNmb3JtT3B0aW9ucyB9IGZyb20gJy4vYnVpbGQtc2NyaXB0JztcclxuaW1wb3J0IHsgZW5zdXJlRGlyLCBwYXRoRXhpc3RzLCB3cml0ZUZpbGUgfSBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCB7IHdvcmtlck1hbmFnZXIgfSBmcm9tICcuLi8uLi8uLi93b3JrZXItcG9vbHMvc3ViLXByb2Nlc3MtbWFuYWdlcic7XHJcbmltcG9ydCB7IGJ1aWxkQXNzZXRMaWJyYXJ5IH0gZnJvbSAnLi4vLi4vbWFuYWdlci9hc3NldC1saWJyYXJ5JztcclxuaW1wb3J0ICogYXMgYmFiZWwgZnJvbSAnQGJhYmVsL2NvcmUnO1xyXG5pbXBvcnQgYmFiZWxQcmVzZXRFbnYgZnJvbSAnQGJhYmVsL3ByZXNldC1lbnYnO1xyXG5pbXBvcnQgeyBTdGF0c1F1ZXJ5IH0gZnJvbSAnQGNvY29zL2NjYnVpbGQnO1xyXG5pbXBvcnQgeyBTaGFyZWRTZXR0aW5ncyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjcmlwdGluZy9pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBJUG9seUZpbGxzLCBJQnVpbGRTeXN0ZW1Kc09wdGlvbiB9IGZyb20gJy4uLy4uLy4uLy4uL0B0eXBlcyc7XHJcbmltcG9ydCB7IEltcG9ydE1hcFdpdGhJbXBvcnRzLCBJU2NyaXB0T3B0aW9ucywgSUludGVybmFsQnVpbGRPcHRpb25zLCBJSW50ZXJuYWxCdW5kbGVCdWlsZE9wdGlvbnMsIE1vZHVsZVByZXNlcnZhdGlvbiwgSUJ1bmRsZSwgSUFzc2V0SW5mbywgSW1wb3J0TWFwLCBJSW1wb3J0TWFwT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBhc3NldERCTWFuYWdlciB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2Fzc2V0cyc7XHJcbmltcG9ydCBzY3JpcHQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NyaXB0aW5nJztcclxuaW1wb3J0IHsgRW5naW5lIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vZW5naW5lJztcclxuaW1wb3J0IHsgTWFjcm9JdGVtIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vZW5naW5lL0B0eXBlcy9jb25maWcnO1xyXG5pbXBvcnQgeyBjb21wcmVzc1V1aWQgfSBmcm9tICcuLi8uLi91dGlscyc7XHJcbmltcG9ydCBwcm9qZWN0IGZyb20gJy4uLy4uLy4uLy4uLy4uL3Byb2plY3QnO1xyXG5pbXBvcnQgeyBydW5TdGF0aWNDb21waWxlQ2hlY2sgfSBmcm9tICcuL3N0YXRpYy1jb21waWxlLWNoZWNrJztcclxuaW1wb3J0IHsgQnVpbGRFeGl0Q29kZSB9IGZyb20gJy4uLy4uLy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG50eXBlIFBsYXRmb3JtVHlwZSA9IFN0YXRzUXVlcnkuQ29uc3RhbnRNYW5hZ2VyLlBsYXRmb3JtVHlwZTtcclxuXHJcbmludGVyZmFjZSBJU2NyaXB0UHJvamVjdE9wdGlvbiBleHRlbmRzIFNoYXJlZFNldHRpbmdzIHtcclxuICAgIGNjRW52Q29uc3RhbnRzOiBDQ0VudkNvbnN0YW50cztcclxuICAgIGRiSW5mb3M6IHsgZGJJRDogc3RyaW5nOyB0YXJnZXQ6IHN0cmluZyB9W107XHJcbiAgICBjdXN0b21NYWNyb0xpc3Q6IE1hY3JvSXRlbVtdO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgSW1wb3J0TWFwT3B0aW9ucyB7XHJcbiAgICBkYXRhOiBJbXBvcnRNYXBXaXRoSW1wb3J0cztcclxuICAgIGZvcm1hdD86ICdjb21tb25qcycgfCAnZXNtJztcclxuICAgIG91dHB1dDogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2NyaXB0QnVpbGRlciB7XHJcblxyXG4gICAgX3NjcmlwdE9wdGlvbnMhOiBJU2NyaXB0T3B0aW9ucztcclxuICAgIF9pbXBvcnRNYXBPcHRpb25zITogSW1wb3J0TWFwT3B0aW9ucztcclxuXHJcbiAgICAvLyDohJrmnKzotYTmupDljIXliIbnu4TvvIjlrZDljIUv5YiG5YyF77yJXHJcbiAgICBwdWJsaWMgc2NyaXB0UGFja2FnZXM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgc3RhdGljIHByb2plY3RPcHRpb25zOiBJU2NyaXB0UHJvamVjdE9wdGlvbjtcclxuXHJcbiAgICBpbml0VGFza09wdGlvbnMob3B0aW9uczogSUludGVybmFsQnVpbGRPcHRpb25zIHwgSUludGVybmFsQnVuZGxlQnVpbGRPcHRpb25zKSB7XHJcbiAgICAgICAgLy8gVE9ETyDmraTlpITphY3nva7lupTor6XlnKjlpJbpg6jmlbTlkIjlpb1cclxuICAgICAgICBjb25zdCB0cmFuc2Zvcm1PcHRpb25zOiBUcmFuc2Zvcm1PcHRpb25zID0ge307XHJcbiAgICAgICAgaWYgKCFvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0ucG9seWZpbGxzPy5hc3luY0Z1bmN0aW9ucykge1xyXG4gICAgICAgICAgICAodHJhbnNmb3JtT3B0aW9ucy5leGNsdWRlcyA/PyAodHJhbnNmb3JtT3B0aW9ucy5leGNsdWRlcyA9IFtdKSkucHVzaCgndHJhbnNmb3JtLXJlZ2VuZXJhdG9yJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0udGFyZ2V0cykge1xyXG4gICAgICAgICAgICB0cmFuc2Zvcm1PcHRpb25zLnRhcmdldHMgPSBvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0udGFyZ2V0cztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBtb2R1bGVQcmVzZXJ2YXRpb246IE1vZHVsZVByZXNlcnZhdGlvbiA9ICdmYWNhZGUnO1xyXG4gICAgICAgIGlmIChvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0uZXhwZXJpbWVudGFsRXJhc2VNb2R1bGVzKSB7XHJcbiAgICAgICAgICAgIG1vZHVsZVByZXNlcnZhdGlvbiA9ICdlcmFzZSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGhvdE1vZHVsZVJlbG9hZCA9IG9wdGlvbnMuYnVpbGRTY3JpcHRQYXJhbS5ob3RNb2R1bGVSZWxvYWQgPz8gZmFsc2U7XHJcbiAgICAgICAgaWYgKGhvdE1vZHVsZVJlbG9hZCkge1xyXG4gICAgICAgICAgICBtb2R1bGVQcmVzZXJ2YXRpb24gPSAncHJlc2VydmUnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2NyaXB0T3B0aW9uczogSVNjcmlwdE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIG1vZHVsZVByZXNlcnZhdGlvbixcclxuICAgICAgICAgICAgZGVidWc6IG9wdGlvbnMuZGVidWcsXHJcbiAgICAgICAgICAgIHNvdXJjZU1hcHM6IG9wdGlvbnMuc291cmNlTWFwcyxcclxuICAgICAgICAgICAgaG90TW9kdWxlUmVsb2FkLFxyXG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybU9wdGlvbnMsXHJcbiAgICAgICAgICAgIG1vZHVsZUZvcm1hdDogJ3N5c3RlbScsXHJcbiAgICAgICAgICAgIGNvbW1vbkRpcjogb3B0aW9ucy5idWlsZFNjcmlwdFBhcmFtLmNvbW1vbkRpciB8fCAnJywgLy8gVE9ETyDpnIDopoHmlrDnmoTlj4LmlbBcclxuICAgICAgICAgICAgYnVuZGxlQ29tbW9uQ2h1bms6IG9wdGlvbnMuYnVpbGRTY3JpcHRQYXJhbS5idW5kbGVDb21tb25DaHVuayA/PyBmYWxzZSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzY3JpcHRPcHRpb25zLFxyXG4gICAgICAgICAgICBpbXBvcnRNYXBPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IG9wdGlvbnMuYnVpbGRTY3JpcHRQYXJhbS5pbXBvcnRNYXBGb3JtYXQsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7IGltcG9ydHM6IHt9IH0sXHJcbiAgICAgICAgICAgICAgICBvdXRwdXQ6ICcnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgaW5pdFByb2plY3RPcHRpb25zKG9wdGlvbnM6IElJbnRlcm5hbEJ1aWxkT3B0aW9ucyB8IElJbnRlcm5hbEJ1bmRsZUJ1aWxkT3B0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IHsgc2NyaXB0T3B0aW9ucywgaW1wb3J0TWFwT3B0aW9ucyB9ID0gdGhpcy5pbml0VGFza09wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5fc2NyaXB0T3B0aW9ucyA9IHNjcmlwdE9wdGlvbnM7XHJcbiAgICAgICAgdGhpcy5faW1wb3J0TWFwT3B0aW9ucyA9IGltcG9ydE1hcE9wdGlvbnM7XHJcbiAgICAgICAgY29uc3QgY2NFbnZDb25zdGFudHMgPSBhd2FpdCBnZXRDQ0VudkNvbnN0YW50cyh7XHJcbiAgICAgICAgICAgIHBsYXRmb3JtOiBvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0ucGxhdGZvcm0sXHJcbiAgICAgICAgICAgIGZsYWdzOiBvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0uZmxhZ3MsXHJcbiAgICAgICAgfSwgb3B0aW9ucy5lbmdpbmVJbmZvLnR5cGVzY3JpcHQucGF0aCk7XHJcbiAgICAgICAgY29uc3Qgc2hhcmVkU2V0dGluZ3MgPSBhd2FpdCBzY3JpcHQucXVlcnlTaGFyZWRTZXR0aW5ncygpO1xyXG4gICAgICAgIC8vIFRPRE8g5LuOIGRiIOafpeivoueahOmDveimgeWwgeijheWcqCBhc3NldC1saWJyYXJ5IOaooeWdl+WGhVxyXG4gICAgICAgIGNvbnN0IGRiSW5mb3MgPSBPYmplY3QudmFsdWVzKGFzc2V0REJNYW5hZ2VyLmFzc2V0REJNYXApLm1hcCgoaW5mbykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZGJJRDogaW5mby5vcHRpb25zLm5hbWUsXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IGluZm8ub3B0aW9ucy50YXJnZXQsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgY3VzdG9tTWFjcm9MaXN0ID0gRW5naW5lLmdldENvbmZpZygpLm1hY3JvQ3VzdG9tO1xyXG4gICAgICAgIFNjcmlwdEJ1aWxkZXIucHJvamVjdE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGN1c3RvbU1hY3JvTGlzdCxcclxuICAgICAgICAgICAgZGJJbmZvcyxcclxuICAgICAgICAgICAgY2NFbnZDb25zdGFudHMsXHJcbiAgICAgICAgICAgIC4uLnNoYXJlZFNldHRpbmdzLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgYnVpbGRCdW5kbGVTY3JpcHQoYnVuZGxlczogSUJ1bmRsZVtdKSB7XHJcbiAgICAgICAgY29uc3Qgc2NyaXB0QnVuZGxlczogQXJyYXk8eyBpZDogc3RyaW5nLCBzY3JpcHRzOiBJQXNzZXRJbmZvW10sIG91dEZpbGU6IHN0cmluZyB9PiA9IFtdO1xyXG4gICAgICAgIGNvbnN0IHV1aWRDb21wcmVzc01hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xyXG4gICAgICAgIGJ1bmRsZXMuZm9yRWFjaCgoYnVuZGxlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghYnVuZGxlLm91dHB1dCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJ1bmRsZS5jb25maWcuaGFzUHJlbG9hZFNjcmlwdCA9ICF0aGlzLl9zY3JpcHRPcHRpb25zLmhvdE1vZHVsZVJlbG9hZDtcclxuICAgICAgICAgICAgc2NyaXB0QnVuZGxlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGlkOiBidW5kbGUubmFtZSxcclxuICAgICAgICAgICAgICAgIHNjcmlwdHM6IGJ1bmRsZS5zY3JpcHRzLm1hcCgodXVpZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHV1aWRDb21wcmVzc01hcFt1dWlkXSA9IGNvbXByZXNzVXVpZCh1dWlkLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkQXNzZXRMaWJyYXJ5LmdldEFzc2V0SW5mbyh1dWlkKTtcclxuICAgICAgICAgICAgICAgIH0pLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpLFxyXG4gICAgICAgICAgICAgICAgb3V0RmlsZTogYnVuZGxlLnNjcmlwdERlc3QsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoIXNjcmlwdEJ1bmRsZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ1tzY3JpcHRdIG5vIHNjcmlwdCB0byBidWlsZCcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDmiafooYzpnZnmgIHnvJbor5Hmo4Dmn6VcclxuICAgICAgICAvLyDms6jmhI/vvJrlpoLmnpzlnKggQnVpbGRDb21tYW5kIOS4reW3sue7j+aJp+ihjOi/h++8jOi/memHjOS8mumHjeWkjeaJp+ihjOOAglxyXG4gICAgICAgIC8vIOS9huS4uuS6huehruS/neiEmuacrOe8luivkeeahOWuieWFqOaAp++8jOi/memHjOW8uuWItuajgOafpeOAglxyXG4gICAgICAgIGNvbnN0IGNoZWNrUmVzdWx0ID0gYXdhaXQgcnVuU3RhdGljQ29tcGlsZUNoZWNrKHByb2plY3QucGF0aCwgdHJ1ZSk7XHJcbiAgICAgICAgaWYgKCFjaGVja1Jlc3VsdC5wYXNzZWQpIHtcclxuICAgICAgICAgICAgLy8g5p6E5bu65aSx6LSl77yM5oqb5Ye66ZSZ6K+v77yM6ZSZ6K+v56CB5Li6IDUwMFxyXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBjaGVja1Jlc3VsdC5lcnJvck1lc3NhZ2UgfHwgJ0ZvdW5kIGFzc2V0cy1yZWxhdGVkIFR5cGVTY3JpcHQgZXJyb3JzJztcclxuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgICAgICAgKGVycm9yIGFzIGFueSkuY29kZSA9IEJ1aWxkRXhpdENvZGUuU1RBVElDX0NPTVBJTEVfRVJST1I7XHJcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBjY2VNb2R1bGVNYXAgPSBzY3JpcHQucXVlcnlDQ0VNb2R1bGVNYXAoKTtcclxuICAgICAgICBjb25zdCBidWlsZFNjcmlwdE9wdGlvbnM6IElCdWlsZFNjcmlwdEZ1bmN0aW9uT3B0aW9uICYgU2hhcmVkU2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgIC4uLnRoaXMuX3NjcmlwdE9wdGlvbnMsXHJcbiAgICAgICAgICAgIC4uLlNjcmlwdEJ1aWxkZXIucHJvamVjdE9wdGlvbnMsXHJcbiAgICAgICAgICAgIGJ1bmRsZXM6IHNjcmlwdEJ1bmRsZXMsXHJcbiAgICAgICAgICAgIHV1aWRDb21wcmVzc01hcCxcclxuICAgICAgICAgICAgYXBwbGljYXRpb25KUzogJycsXHJcbiAgICAgICAgICAgIGNjZU1vZHVsZU1hcCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyDpobnnm67ohJrmnKznvJbor5Hnm67liY3nvJbor5HlhoXlrZjljaDnlKjovoPlpKfvvIzpnIDopoHni6znq4vov5vnqIvnrqHnkIZcclxuICAgICAgICBhd2FpdCB3b3JrZXJNYW5hZ2VyLnJlZ2lzdGVyVGFzayh7XHJcbiAgICAgICAgICAgIG5hbWU6ICdidWlsZC1zY3JpcHQnLFxyXG4gICAgICAgICAgICBwYXRoOiBqb2luKF9fZGlybmFtZSwgJy4vYnVpbGQtc2NyaXB0JyksXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIGN3ZDogcHJvamVjdC5wYXRoLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgd29ya2VyTWFuYWdlci5ydW5UYXNrKCdidWlsZC1zY3JpcHQnLCAnYnVpbGRTY3JpcHRDb21tYW5kJywgW2J1aWxkU2NyaXB0T3B0aW9uc10pO1xyXG4gICAgICAgIGlmIChyZXMpIHtcclxuICAgICAgICAgICAgaWYgKHJlcy5zY3JpcHRQYWNrYWdlcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY3JpcHRQYWNrYWdlcy5wdXNoKC4uLnJlcy5zY3JpcHRQYWNrYWdlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlcy5pbXBvcnRNYXBwaW5ncykge1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLl9pbXBvcnRNYXBPcHRpb25zLmRhdGEuaW1wb3J0cywgcmVzLmltcG9ydE1hcHBpbmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd29ya2VyTWFuYWdlci5raWxsKCdidWlsZC1zY3JpcHQnKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZygnQ29weSBleHRlcm5hbFNjcmlwdHMgc3VjY2VzcyEnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgYnVpbGRQb2x5ZmlsbHMob3B0aW9uczogSVBvbHlGaWxscyA9IHt9LCBkZXN0OiBzdHJpbmcpIHtcclxuICAgICAgICBhd2FpdCB3b3JrZXJNYW5hZ2VyLnJlZ2lzdGVyVGFzayh7XHJcbiAgICAgICAgICAgIG5hbWU6ICdidWlsZC1zY3JpcHQnLFxyXG4gICAgICAgICAgICBwYXRoOiBqb2luKF9fZGlybmFtZSwgJy4vYnVpbGQtc2NyaXB0JyksXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHdvcmtlck1hbmFnZXIucnVuVGFzaygnYnVpbGQtc2NyaXB0JywgJ2J1aWxkUG9seWZpbGxzQ29tbWFuZCcsIFtvcHRpb25zLCBkZXN0XSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGJ1aWxkU3lzdGVtSnMob3B0aW9uczogSUJ1aWxkU3lzdGVtSnNPcHRpb24pIHtcclxuICAgICAgICBhd2FpdCB3b3JrZXJNYW5hZ2VyLnJlZ2lzdGVyVGFzayh7XHJcbiAgICAgICAgICAgIG5hbWU6ICdidWlsZC1zY3JpcHQnLFxyXG4gICAgICAgICAgICBwYXRoOiBqb2luKF9fZGlybmFtZSwgJy4vYnVpbGQtc2NyaXB0JyksXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHdvcmtlck1hbmFnZXIucnVuVGFzaygnYnVpbGQtc2NyaXB0JywgJ2J1aWxkU3lzdGVtSnNDb21tYW5kJywgW29wdGlvbnNdKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgb3V0cHV0SW1wb3J0TWFwKGltcG9ydE1hcDogSW1wb3J0TWFwLCBvcHRpb25zOiBJSW1wb3J0TWFwT3B0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IHsgY29udGVudCB9ID0gYXdhaXQgdHJhbnNmb3JtSW1wb3J0TWFwKGltcG9ydE1hcCwgb3B0aW9ucyk7XHJcbiAgICAgICAgYXdhaXQgZW5zdXJlRGlyKGRpcm5hbWUob3B0aW9ucy5kZXN0KSk7XHJcbiAgICAgICAgYXdhaXQgd3JpdGVGaWxlKG9wdGlvbnMuZGVzdCwgY29udGVudCwge1xyXG4gICAgICAgICAgICBlbmNvZGluZzogJ3V0ZjgnLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB0cmFuc2Zvcm1JbXBvcnRNYXAoaW1wb3J0TWFwOiBJbXBvcnRNYXAsIG9wdGlvbnM6IElJbXBvcnRNYXBPcHRpb25zKSB7XHJcbiAgICBjb25zdCB7IGltcG9ydE1hcEZvcm1hdCB9ID0gb3B0aW9ucztcclxuICAgIGxldCBleHRlbnNpb246IHN0cmluZztcclxuICAgIGxldCBjb250ZW50ID0gSlNPTi5zdHJpbmdpZnkoaW1wb3J0TWFwLCB1bmRlZmluZWQsIG9wdGlvbnMuZGVidWcgPyAyIDogMCk7XHJcbiAgICBpZiAoaW1wb3J0TWFwRm9ybWF0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBleHRlbnNpb24gPSAnLmpzb24nO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBleHRlbnNpb24gPSAnLmpzJztcclxuICAgICAgICBjb25zdCBjb2RlID0gYGV4cG9ydCBkZWZhdWx0ICR7Y29udGVudH1gO1xyXG4gICAgICAgIGNvbnRlbnQgPSAoYXdhaXQgYmFiZWwudHJhbnNmb3JtQXN5bmMoY29kZSwge1xyXG4gICAgICAgICAgICBwcmVzZXRzOiBbW1xyXG4gICAgICAgICAgICAgICAgYmFiZWxQcmVzZXRFbnYsIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVzOiBpbXBvcnRNYXBGb3JtYXQgPT09ICdlc20nID8gZmFsc2UgOiBpbXBvcnRNYXBGb3JtYXQsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBdXSxcclxuICAgICAgICB9KSk/LmNvZGUhO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBleHRlbnNpb24sXHJcbiAgICAgICAgY29udGVudCxcclxuICAgIH07XHJcbn0iXX0=