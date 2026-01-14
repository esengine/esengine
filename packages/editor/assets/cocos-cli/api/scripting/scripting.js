"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptingApi = void 0;
/**
 * @zh 脚本编译 API
 * @en Scripting API
 *
 * 提供脚本编译功能，用于编辑器视口加载场景时编译和执行用户脚本。
 * Provides script compilation functionality for the editor viewport to compile and execute user scripts when loading scenes.
 */
const zod_1 = require("zod");
const decorator_1 = require("../decorator/decorator");
const schema_base_1 = require("../base/schema-base");
const scripting_1 = __importDefault(require("../../core/scripting"));
const schema_1 = require("./schema");
const scene_1 = require("../../core/scene");
const assets_1 = require("../../core/assets");
class ScriptingApi {
    /**
     * @zh 编译脚本
     * @en Compile Scripts
     */
    async compileScripts(target = 'editor') {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: { success: false },
        };
        try {
            // Check if scripting is ready
            if (!scripting_1.default.isTargetReady(target)) {
                // Trigger compilation
                await scripting_1.default.compileScripts();
            }
            // Get the loader context
            const loaderContext = scripting_1.default.getPackerDriverLoaderContext(target);
            if (!loaderContext) {
                ret.data = {
                    success: false,
                    error: `Loader context not available for target: ${target}`,
                };
                return ret;
            }
            // Query all script assets
            const scriptAssets = await assets_1.assetManager.queryAssetInfos({
                importer: 'typescript',
            });
            const scriptInfos = [];
            // Build script info list
            for (const asset of scriptAssets) {
                if (!asset.uuid)
                    continue;
                const cid = await scene_1.Scene.queryScriptCid(asset.uuid);
                const name = await scene_1.Scene.queryScriptName(asset.uuid);
                if (cid) {
                    scriptInfos.push({
                        uuid: asset.uuid,
                        cid: cid,
                        name: name || asset.name || 'Unknown',
                        path: asset.file || '',
                    });
                }
            }
            // Build the compiled code bundle from loader context
            // The loader context contains module mappings that we need to serialize
            const compiledCode = this.buildScriptBundle(loaderContext, scriptInfos);
            ret.data = {
                success: true,
                code: compiledCode,
                scriptInfos,
            };
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('[ScriptingApi] compileScripts error:', e);
            ret.data = {
                success: false,
                error: e instanceof Error ? e.message : String(e),
            };
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * @zh 查询脚本信息
     * @en Query Script Info
     */
    async queryScriptInfo(uuid) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            const cid = await scene_1.Scene.queryScriptCid(uuid);
            const name = await scene_1.Scene.queryScriptName(uuid);
            if (cid || name) {
                ret.data = {
                    uuid,
                    cid: cid,
                    name: name,
                };
            }
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('[ScriptingApi] queryScriptInfo error:', e);
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * @zh 获取脚本加载器上下文
     * @en Get Script Loader Context
     */
    async getLoaderContext(target = 'editor') {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            const loaderContext = scripting_1.default.getPackerDriverLoaderContext(target);
            if (loaderContext) {
                ret.data = {
                    modules: loaderContext.modules || {},
                    importMap: loaderContext.importMap,
                };
            }
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('[ScriptingApi] getLoaderContext error:', e);
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * @zh 触发脚本编译
     * @en Trigger Script Compilation
     */
    async triggerCompile() {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: false,
        };
        try {
            await scripting_1.default.compileScripts();
            ret.data = true;
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('[ScriptingApi] triggerCompile error:', e);
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * @zh 检查编译状态
     * @en Check Compilation Status
     */
    async isReady(target = 'editor') {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: false,
        };
        try {
            ret.data = scripting_1.default.isTargetReady(target);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('[ScriptingApi] isReady error:', e);
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * @zh 构建脚本包
     * @en Build script bundle
     *
     * 从加载器上下文构建可执行的脚本包
     * Build an executable script bundle from the loader context
     */
    buildScriptBundle(loaderContext, scriptInfos) {
        // Generate class registration code for each script
        const registrations = scriptInfos.map((info) => {
            return `
// Register class for ${info.name} (${info.uuid})
if (typeof __cce_module_context__ !== 'undefined' && __cce_module_context__['${info.uuid}']) {
    const mod = __cce_module_context__['${info.uuid}'];
    if (mod.default && typeof mod.default === 'function') {
        cc.js._setClassId('${info.cid}', mod.default);
        cc.js.setClassName('${info.name}', mod.default);
    }
}`;
        }).join('\n');
        // The actual compiled modules would come from the QuickPackLoaderContext
        // For now, we return a wrapper that helps with class registration
        return `
// Auto-generated script bundle
(function() {
    'use strict';

    // Module context for compiled scripts
    window.__cce_module_context__ = window.__cce_module_context__ || {};

    // Script registration info
    const scriptInfos = ${JSON.stringify(scriptInfos, null, 2)};

    // Register all script classes
    ${registrations}

    // Export script infos for debugging
    window.__cce_script_infos__ = scriptInfos;

    console.log('[ScriptBundle] Registered', scriptInfos.length, 'script classes');
})();
`;
    }
}
exports.ScriptingApi = ScriptingApi;
__decorate([
    (0, decorator_1.tool)('scripting-compile'),
    (0, decorator_1.title)('Compile Project Scripts'),
    (0, decorator_1.description)('Compile all TypeScript/JavaScript scripts in the project and return the compiled code. The compiled code can be executed in the viewport to register component classes before loading scenes.'),
    (0, decorator_1.result)(schema_1.SchemaCompileResult),
    __param(0, (0, decorator_1.param)(schema_1.SchemaCompileTarget)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScriptingApi.prototype, "compileScripts", null);
__decorate([
    (0, decorator_1.tool)('scripting-query-info'),
    (0, decorator_1.title)('Query Script Info'),
    (0, decorator_1.description)('Query information about a specific script asset, including its compressed class ID (cid) and class name.'),
    (0, decorator_1.result)(schema_1.SchemaScriptInfoResult),
    __param(0, (0, decorator_1.param)(schema_1.SchemaScriptUUID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScriptingApi.prototype, "queryScriptInfo", null);
__decorate([
    (0, decorator_1.tool)('scripting-get-loader-context'),
    (0, decorator_1.title)('Get Script Loader Context'),
    (0, decorator_1.description)('Get the script loader context for the specified target, which contains module mappings and import maps needed to execute scripts.'),
    (0, decorator_1.result)(schema_1.SchemaLoaderContext),
    __param(0, (0, decorator_1.param)(schema_1.SchemaCompileTarget)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScriptingApi.prototype, "getLoaderContext", null);
__decorate([
    (0, decorator_1.tool)('scripting-trigger-compile'),
    (0, decorator_1.title)('Trigger Script Compilation'),
    (0, decorator_1.description)('Trigger script compilation. This will compile all modified scripts and update the loader context.'),
    (0, decorator_1.result)(zod_1.z.boolean().describe('Whether compilation was triggered successfully')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScriptingApi.prototype, "triggerCompile", null);
__decorate([
    (0, decorator_1.tool)('scripting-is-ready'),
    (0, decorator_1.title)('Check Script Compilation Status'),
    (0, decorator_1.description)('Check if script compilation is ready for the specified target.'),
    (0, decorator_1.result)(zod_1.z.boolean().describe('Whether compilation is ready')),
    __param(0, (0, decorator_1.param)(schema_1.SchemaCompileTarget)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScriptingApi.prototype, "isReady", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0aW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaS9zY3JpcHRpbmcvc2NyaXB0aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7R0FNRztBQUNILDZCQUF3QjtBQUN4QixzREFBaUY7QUFDakYscURBQXNGO0FBQ3RGLHFFQUFpRDtBQUNqRCxxQ0FXa0I7QUFDbEIsNENBQXlDO0FBQ3pDLDhDQUFpRDtBQUVqRCxNQUFhLFlBQVk7SUFFckI7OztPQUdHO0lBS0csQUFBTixLQUFLLENBQUMsY0FBYyxDQUNZLFNBQXlCLFFBQVE7UUFFN0QsTUFBTSxJQUFJLEdBQW1CLDJCQUFhLENBQUMsT0FBTyxDQUFDO1FBQ25ELE1BQU0sR0FBRyxHQUFxQztZQUMxQyxJQUFJLEVBQUUsSUFBSTtZQUNWLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUU7U0FDM0IsQ0FBQztRQUVGLElBQUksQ0FBQztZQUNELDhCQUE4QjtZQUM5QixJQUFJLENBQUMsbUJBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDdkMsc0JBQXNCO2dCQUN0QixNQUFNLG1CQUFhLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDekMsQ0FBQztZQUVELHlCQUF5QjtZQUN6QixNQUFNLGFBQWEsR0FBRyxtQkFBYSxDQUFDLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDakIsR0FBRyxDQUFDLElBQUksR0FBRztvQkFDUCxPQUFPLEVBQUUsS0FBSztvQkFDZCxLQUFLLEVBQUUsNENBQTRDLE1BQU0sRUFBRTtpQkFDOUQsQ0FBQztnQkFDRixPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUM7WUFFRCwwQkFBMEI7WUFDMUIsTUFBTSxZQUFZLEdBQUcsTUFBTSxxQkFBWSxDQUFDLGVBQWUsQ0FBQztnQkFDcEQsUUFB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SUFBQSxnQkFBSSxFQUFDLDhCQUE4QixDQUFDO0lBQ3BDLElBQUEsaUJBQUssRUFBQywyQkFBMkIsQ0FBQztJQUNsQyxJQUFBLHVCQUFXLEVBQUMsbUlBQW1JLENBQUM7SUFDaEosSUFBQSxrQkFBTSxFQUFDLDRCQUFtQixDQUFDO0lBRXZCLFdBQUEsSUFBQSxpQkFBSyxFQUFDLDRCQUFtQixDQUFDLENBQUE7Ozs7b0RBdUI5QjtBQVVLO0lBSkwsSUFBQSxnQkFBSSxFQUFDLDJCQUEyQixDQUFDO0lBQ2pDLElBQUEsaUJBQUssRUFBQyw0QkFBNEIsQ0FBQztJQUNuQyxJQUFBLHVCQUFXLEVBQUMsbUdBQW1HLENBQUM7SUFDaEgsSUFBQSxrQkFBTSxFQUFDLE9BQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsZ0RBQWdELENBQUMsQ0FBQzs7OztrREFrQjlFO0FBVUs7SUFKTCxJQUFBLGdCQUFJLEVBQUMsb0JBQW9CLENBQUM7SUFDMUIsSUFBQSxpQkFBSyxFQUFDLGlDQUFpQyxDQUFDO0lBQ3hDLElBQUEsdUJBQVcsRUFBQyxnRUFBZ0UsQ0FBQztJQUM3RSxJQUFBLGtCQUFNLEVBQUMsT0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0lBRXhELFdBQUEsSUFBQSxpQkFBSyxFQUFDLDRCQUFtQixDQUFDLENBQUE7Ozs7MkNBaUI5QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHpoIOiEmuacrOe8luivkSBBUElcbiAqIEBlbiBTY3JpcHRpbmcgQVBJXG4gKlxuICog5o+Q5L6b6ISa5pys57yW6K+R5Yqf6IO977yM55So5LqO57yW6L6R5Zmo6KeG5Y+j5Yqg6L295Zy65pmv5pe257yW6K+R5ZKM5omn6KGM55So5oi36ISa5pys44CCXG4gKiBQcm92aWRlcyBzY3JpcHQgY29tcGlsYXRpb24gZnVuY3Rpb25hbGl0eSBmb3IgdGhlIGVkaXRvciB2aWV3cG9ydCB0byBjb21waWxlIGFuZCBleGVjdXRlIHVzZXIgc2NyaXB0cyB3aGVuIGxvYWRpbmcgc2NlbmVzLlxuICovXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IGRlc2NyaXB0aW9uLCBwYXJhbSwgcmVzdWx0LCB0aXRsZSwgdG9vbCB9IGZyb20gJy4uL2RlY29yYXRvci9kZWNvcmF0b3InO1xuaW1wb3J0IHsgQ09NTU9OX1NUQVRVUywgQ29tbW9uUmVzdWx0VHlwZSwgSHR0cFN0YXR1c0NvZGUgfSBmcm9tICcuLi9iYXNlL3NjaGVtYS1iYXNlJztcbmltcG9ydCBzY3JpcHRNYW5hZ2VyIGZyb20gJy4uLy4uL2NvcmUvc2NyaXB0aW5nJztcbmltcG9ydCB7XG4gICAgU2NoZW1hQ29tcGlsZVRhcmdldCxcbiAgICBTY2hlbWFDb21waWxlUmVzdWx0LFxuICAgIFNjaGVtYVNjcmlwdFVVSUQsXG4gICAgU2NoZW1hU2NyaXB0SW5mb1Jlc3VsdCxcbiAgICBTY2hlbWFMb2FkZXJDb250ZXh0LFxuICAgIFRDb21waWxlVGFyZ2V0LFxuICAgIFRDb21waWxlUmVzdWx0LFxuICAgIFRTY3JpcHRJbmZvUmVzdWx0LFxuICAgIFRMb2FkZXJDb250ZXh0LFxuICAgIFRTY3JpcHRJbmZvLFxufSBmcm9tICcuL3NjaGVtYSc7XG5pbXBvcnQgeyBTY2VuZSB9IGZyb20gJy4uLy4uL2NvcmUvc2NlbmUnO1xuaW1wb3J0IHsgYXNzZXRNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vY29yZS9hc3NldHMnO1xuXG5leHBvcnQgY2xhc3MgU2NyaXB0aW5nQXBpIHtcblxuICAgIC8qKlxuICAgICAqIEB6aCDnvJbor5HohJrmnKxcbiAgICAgKiBAZW4gQ29tcGlsZSBTY3JpcHRzXG4gICAgICovXG4gICAgQHRvb2woJ3NjcmlwdGluZy1jb21waWxlJylcbiAgICBAdGl0bGUoJ0NvbXBpbGUgUHJvamVjdCBTY3JpcHRzJylcbiAgICBAZGVzY3JpcHRpb24oJ0NvbXBpbGUgYWxsIFR5cGVTY3JpcHQvSmF2YVNjcmlwdCBzY3JpcHRzIGluIHRoZSBwcm9qZWN0IGFuZCByZXR1cm4gdGhlIGNvbXBpbGVkIGNvZGUuIFRoZSBjb21waWxlZCBjb2RlIGNhbiBiZSBleGVjdXRlZCBpbiB0aGUgdmlld3BvcnQgdG8gcmVnaXN0ZXIgY29tcG9uZW50IGNsYXNzZXMgYmVmb3JlIGxvYWRpbmcgc2NlbmVzLicpXG4gICAgQHJlc3VsdChTY2hlbWFDb21waWxlUmVzdWx0KVxuICAgIGFzeW5jIGNvbXBpbGVTY3JpcHRzKFxuICAgICAgICBAcGFyYW0oU2NoZW1hQ29tcGlsZVRhcmdldCkgdGFyZ2V0OiBUQ29tcGlsZVRhcmdldCA9ICdlZGl0b3InXG4gICAgKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRDb21waWxlUmVzdWx0Pj4ge1xuICAgICAgICBjb25zdCBjb2RlOiBIdHRwU3RhdHVzQ29kZSA9IENPTU1PTl9TVEFUVVMuU1VDQ0VTUztcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFRDb21waWxlUmVzdWx0PiA9IHtcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXG4gICAgICAgICAgICBkYXRhOiB7IHN1Y2Nlc3M6IGZhbHNlIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHNjcmlwdGluZyBpcyByZWFkeVxuICAgICAgICAgICAgaWYgKCFzY3JpcHRNYW5hZ2VyLmlzVGFyZ2V0UmVhZHkodGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIC8vIFRyaWdnZXIgY29tcGlsYXRpb25cbiAgICAgICAgICAgICAgICBhd2FpdCBzY3JpcHRNYW5hZ2VyLmNvbXBpbGVTY3JpcHRzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEdldCB0aGUgbG9hZGVyIGNvbnRleHRcbiAgICAgICAgICAgIGNvbnN0IGxvYWRlckNvbnRleHQgPSBzY3JpcHRNYW5hZ2VyLmdldFBhY2tlckRyaXZlckxvYWRlckNvbnRleHQodGFyZ2V0KTtcbiAgICAgICAgICAgIGlmICghbG9hZGVyQ29udGV4dCkge1xuICAgICAgICAgICAgICAgIHJldC5kYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGBMb2FkZXIgY29udGV4dCBub3QgYXZhaWxhYmxlIGZvciB0YXJnZXQ6ICR7dGFyZ2V0fWAsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBRdWVyeSBhbGwgc2NyaXB0IGFzc2V0c1xuICAgICAgICAgICAgY29uc3Qgc2NyaXB0QXNzZXRzID0gYXdhaXQgYXNzZXRNYW5hZ2VyLnF1ZXJ5QXNzZXRJbmZvcyh7XG4gICAgICAgICAgICAgICAgaW1wb3J0ZXI6ICd0eXBlc2NyaXB0JyxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBzY3JpcHRJbmZvczogVFNjcmlwdEluZm9bXSA9IFtdO1xuXG4gICAgICAgICAgICAvLyBCdWlsZCBzY3JpcHQgaW5mbyBsaXN0XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGFzc2V0IG9mIHNjcmlwdEFzc2V0cykge1xuICAgICAgICAgICAgICAgIGlmICghYXNzZXQudXVpZCkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjaWQgPSBhd2FpdCBTY2VuZS5xdWVyeVNjcmlwdENpZChhc3NldC51dWlkKTtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gYXdhaXQgU2NlbmUucXVlcnlTY3JpcHROYW1lKGFzc2V0LnV1aWQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNpZCkge1xuICAgICAgICAgICAgICAgICAgICBzY3JpcHRJbmZvcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IGFzc2V0LnV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaWQ6IGNpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUgfHwgYXNzZXQubmFtZSB8fCAnVW5rbm93bicsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBhc3NldC5maWxlIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSBjb21waWxlZCBjb2RlIGJ1bmRsZSBmcm9tIGxvYWRlciBjb250ZXh0XG4gICAgICAgICAgICAvLyBUaGUgbG9hZGVyIGNvbnRleHQgY29udGFpbnMgbW9kdWxlIG1hcHBpbmdzIHRoYXQgd2UgbmVlZCB0byBzZXJpYWxpemVcbiAgICAgICAgICAgIGNvbnN0IGNvbXBpbGVkQ29kZSA9IHRoaXMuYnVpbGRTY3JpcHRCdW5kbGUobG9hZGVyQ29udGV4dCwgc2NyaXB0SW5mb3MpO1xuXG4gICAgICAgICAgICByZXQuZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvZGU6IGNvbXBpbGVkQ29kZSxcbiAgICAgICAgICAgICAgICBzY3JpcHRJbmZvcyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1NjcmlwdGluZ0FwaV0gY29tcGlsZVNjcmlwdHMgZXJyb3I6JywgZSk7XG4gICAgICAgICAgICByZXQuZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldC5yZWFzb24gPSBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEB6aCDmn6Xor6LohJrmnKzkv6Hmga9cbiAgICAgKiBAZW4gUXVlcnkgU2NyaXB0IEluZm9cbiAgICAgKi9cbiAgICBAdG9vbCgnc2NyaXB0aW5nLXF1ZXJ5LWluZm8nKVxuICAgIEB0aXRsZSgnUXVlcnkgU2NyaXB0IEluZm8nKVxuICAgIEBkZXNjcmlwdGlvbignUXVlcnkgaW5mb3JtYXRpb24gYWJvdXQgYSBzcGVjaWZpYyBzY3JpcHQgYXNzZXQsIGluY2x1ZGluZyBpdHMgY29tcHJlc3NlZCBjbGFzcyBJRCAoY2lkKSBhbmQgY2xhc3MgbmFtZS4nKVxuICAgIEByZXN1bHQoU2NoZW1hU2NyaXB0SW5mb1Jlc3VsdClcbiAgICBhc3luYyBxdWVyeVNjcmlwdEluZm8oXG4gICAgICAgIEBwYXJhbShTY2hlbWFTY3JpcHRVVUlEKSB1dWlkOiBzdHJpbmdcbiAgICApOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8VFNjcmlwdEluZm9SZXN1bHQ+PiB7XG4gICAgICAgIGNvbnN0IGNvZGU6IEh0dHBTdGF0dXNDb2RlID0gQ09NTU9OX1NUQVRVUy5TVUNDRVNTO1xuICAgICAgICBjb25zdCByZXQ6IENvbW1vblJlc3VsdFR5cGU8VFNjcmlwdEluZm9SZXN1bHQ+ID0ge1xuICAgICAgICAgICAgY29kZTogY29kZSxcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgIH07XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNpZCA9IGF3YWl0IFNjZW5lLnF1ZXJ5U2NyaXB0Q2lkKHV1aWQpO1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGF3YWl0IFNjZW5lLnF1ZXJ5U2NyaXB0TmFtZSh1dWlkKTtcblxuICAgICAgICAgICAgaWYgKGNpZCB8fCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0LmRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHV1aWQsXG4gICAgICAgICAgICAgICAgICAgIGNpZDogY2lkLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1NjcmlwdGluZ0FwaV0gcXVlcnlTY3JpcHRJbmZvIGVycm9yOicsIGUpO1xuICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHpoIOiOt+WPluiEmuacrOWKoOi9veWZqOS4iuS4i+aWh1xuICAgICAqIEBlbiBHZXQgU2NyaXB0IExvYWRlciBDb250ZXh0XG4gICAgICovXG4gICAgQHRvb2woJ3NjcmlwdGluZy1nZXQtbG9hZGVyLWNvbnRleHQnKVxuICAgIEB0aXRsZSgnR2V0IFNjcmlwdCBMb2FkZXIgQ29udGV4dCcpXG4gICAgQGRlc2NyaXB0aW9uKCdHZXQgdGhlIHNjcmlwdCBsb2FkZXIgY29udGV4dCBmb3IgdGhlIHNwZWNpZmllZCB0YXJnZXQsIHdoaWNoIGNvbnRhaW5zIG1vZHVsZSBtYXBwaW5ncyBhbmQgaW1wb3J0IG1hcHMgbmVlZGVkIHRvIGV4ZWN1dGUgc2NyaXB0cy4nKVxuICAgIEByZXN1bHQoU2NoZW1hTG9hZGVyQ29udGV4dClcbiAgICBhc3luYyBnZXRMb2FkZXJDb250ZXh0KFxuICAgICAgICBAcGFyYW0oU2NoZW1hQ29tcGlsZVRhcmdldCkgdGFyZ2V0OiBUQ29tcGlsZVRhcmdldCA9ICdlZGl0b3InXG4gICAgKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRMb2FkZXJDb250ZXh0Pj4ge1xuICAgICAgICBjb25zdCBjb2RlOiBIdHRwU3RhdHVzQ29kZSA9IENPTU1PTl9TVEFUVVMuU1VDQ0VTUztcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFRMb2FkZXJDb250ZXh0PiA9IHtcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXG4gICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBsb2FkZXJDb250ZXh0ID0gc2NyaXB0TWFuYWdlci5nZXRQYWNrZXJEcml2ZXJMb2FkZXJDb250ZXh0KHRhcmdldCk7XG4gICAgICAgICAgICBpZiAobG9hZGVyQ29udGV4dCkge1xuICAgICAgICAgICAgICAgIHJldC5kYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBtb2R1bGVzOiBsb2FkZXJDb250ZXh0Lm1vZHVsZXMgfHwge30sXG4gICAgICAgICAgICAgICAgICAgIGltcG9ydE1hcDogbG9hZGVyQ29udGV4dC5pbXBvcnRNYXAsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0LmNvZGUgPSBDT01NT05fU1RBVFVTLkZBSUw7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbU2NyaXB0aW5nQXBpXSBnZXRMb2FkZXJDb250ZXh0IGVycm9yOicsIGUpO1xuICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHpoIOinpuWPkeiEmuacrOe8luivkVxuICAgICAqIEBlbiBUcmlnZ2VyIFNjcmlwdCBDb21waWxhdGlvblxuICAgICAqL1xuICAgIEB0b29sKCdzY3JpcHRpbmctdHJpZ2dlci1jb21waWxlJylcbiAgICBAdGl0bGUoJ1RyaWdnZXIgU2NyaXB0IENvbXBpbGF0aW9uJylcbiAgICBAZGVzY3JpcHRpb24oJ1RyaWdnZXIgc2NyaXB0IGNvbXBpbGF0aW9uLiBUaGlzIHdpbGwgY29tcGlsZSBhbGwgbW9kaWZpZWQgc2NyaXB0cyBhbmQgdXBkYXRlIHRoZSBsb2FkZXIgY29udGV4dC4nKVxuICAgIEByZXN1bHQoei5ib29sZWFuKCkuZGVzY3JpYmUoJ1doZXRoZXIgY29tcGlsYXRpb24gd2FzIHRyaWdnZXJlZCBzdWNjZXNzZnVsbHknKSlcbiAgICBhc3luYyB0cmlnZ2VyQ29tcGlsZSgpOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8Ym9vbGVhbj4+IHtcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XG4gICAgICAgIGNvbnN0IHJldDogQ29tbW9uUmVzdWx0VHlwZTxib29sZWFuPiA9IHtcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXG4gICAgICAgICAgICBkYXRhOiBmYWxzZSxcbiAgICAgICAgfTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgc2NyaXB0TWFuYWdlci5jb21waWxlU2NyaXB0cygpO1xuICAgICAgICAgICAgcmV0LmRhdGEgPSB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXQuY29kZSA9IENPTU1PTl9TVEFUVVMuRkFJTDtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTY3JpcHRpbmdBcGldIHRyaWdnZXJDb21waWxlIGVycm9yOicsIGUpO1xuICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHpoIOajgOafpee8luivkeeKtuaAgVxuICAgICAqIEBlbiBDaGVjayBDb21waWxhdGlvbiBTdGF0dXNcbiAgICAgKi9cbiAgICBAdG9vbCgnc2NyaXB0aW5nLWlzLXJlYWR5JylcbiAgICBAdGl0bGUoJ0NoZWNrIFNjcmlwdCBDb21waWxhdGlvbiBTdGF0dXMnKVxuICAgIEBkZXNjcmlwdGlvbignQ2hlY2sgaWYgc2NyaXB0IGNvbXBpbGF0aW9uIGlzIHJlYWR5IGZvciB0aGUgc3BlY2lmaWVkIHRhcmdldC4nKVxuICAgIEByZXN1bHQoei5ib29sZWFuKCkuZGVzY3JpYmUoJ1doZXRoZXIgY29tcGlsYXRpb24gaXMgcmVhZHknKSlcbiAgICBhc3luYyBpc1JlYWR5KFxuICAgICAgICBAcGFyYW0oU2NoZW1hQ29tcGlsZVRhcmdldCkgdGFyZ2V0OiBUQ29tcGlsZVRhcmdldCA9ICdlZGl0b3InXG4gICAgKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPGJvb2xlYW4+PiB7XG4gICAgICAgIGNvbnN0IGNvZGU6IEh0dHBTdGF0dXNDb2RlID0gQ09NTU9OX1NUQVRVUy5TVUNDRVNTO1xuICAgICAgICBjb25zdCByZXQ6IENvbW1vblJlc3VsdFR5cGU8Ym9vbGVhbj4gPSB7XG4gICAgICAgICAgICBjb2RlOiBjb2RlLFxuICAgICAgICAgICAgZGF0YTogZmFsc2UsXG4gICAgICAgIH07XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldC5kYXRhID0gc2NyaXB0TWFuYWdlci5pc1RhcmdldFJlYWR5KHRhcmdldCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1NjcmlwdGluZ0FwaV0gaXNSZWFkeSBlcnJvcjonLCBlKTtcbiAgICAgICAgICAgIHJldC5yZWFzb24gPSBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEB6aCDmnoTlu7rohJrmnKzljIVcbiAgICAgKiBAZW4gQnVpbGQgc2NyaXB0IGJ1bmRsZVxuICAgICAqXG4gICAgICog5LuO5Yqg6L295Zmo5LiK5LiL5paH5p6E5bu65Y+v5omn6KGM55qE6ISa5pys5YyFXG4gICAgICogQnVpbGQgYW4gZXhlY3V0YWJsZSBzY3JpcHQgYnVuZGxlIGZyb20gdGhlIGxvYWRlciBjb250ZXh0XG4gICAgICovXG4gICAgcHJpdmF0ZSBidWlsZFNjcmlwdEJ1bmRsZShcbiAgICAgICAgbG9hZGVyQ29udGV4dDogdW5rbm93bixcbiAgICAgICAgc2NyaXB0SW5mb3M6IFRTY3JpcHRJbmZvW11cbiAgICApOiBzdHJpbmcge1xuICAgICAgICAvLyBHZW5lcmF0ZSBjbGFzcyByZWdpc3RyYXRpb24gY29kZSBmb3IgZWFjaCBzY3JpcHRcbiAgICAgICAgY29uc3QgcmVnaXN0cmF0aW9ucyA9IHNjcmlwdEluZm9zLm1hcCgoaW5mbzogVFNjcmlwdEluZm8pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgXG4vLyBSZWdpc3RlciBjbGFzcyBmb3IgJHtpbmZvLm5hbWV9ICgke2luZm8udXVpZH0pXG5pZiAodHlwZW9mIF9fY2NlX21vZHVsZV9jb250ZXh0X18gIT09ICd1bmRlZmluZWQnICYmIF9fY2NlX21vZHVsZV9jb250ZXh0X19bJyR7aW5mby51dWlkfSddKSB7XG4gICAgY29uc3QgbW9kID0gX19jY2VfbW9kdWxlX2NvbnRleHRfX1snJHtpbmZvLnV1aWR9J107XG4gICAgaWYgKG1vZC5kZWZhdWx0ICYmIHR5cGVvZiBtb2QuZGVmYXVsdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjYy5qcy5fc2V0Q2xhc3NJZCgnJHtpbmZvLmNpZH0nLCBtb2QuZGVmYXVsdCk7XG4gICAgICAgIGNjLmpzLnNldENsYXNzTmFtZSgnJHtpbmZvLm5hbWV9JywgbW9kLmRlZmF1bHQpO1xuICAgIH1cbn1gO1xuICAgICAgICB9KS5qb2luKCdcXG4nKTtcblxuICAgICAgICAvLyBUaGUgYWN0dWFsIGNvbXBpbGVkIG1vZHVsZXMgd291bGQgY29tZSBmcm9tIHRoZSBRdWlja1BhY2tMb2FkZXJDb250ZXh0XG4gICAgICAgIC8vIEZvciBub3csIHdlIHJldHVybiBhIHdyYXBwZXIgdGhhdCBoZWxwcyB3aXRoIGNsYXNzIHJlZ2lzdHJhdGlvblxuICAgICAgICByZXR1cm4gYFxuLy8gQXV0by1nZW5lcmF0ZWQgc2NyaXB0IGJ1bmRsZVxuKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIE1vZHVsZSBjb250ZXh0IGZvciBjb21waWxlZCBzY3JpcHRzXG4gICAgd2luZG93Ll9fY2NlX21vZHVsZV9jb250ZXh0X18gPSB3aW5kb3cuX19jY2VfbW9kdWxlX2NvbnRleHRfXyB8fCB7fTtcblxuICAgIC8vIFNjcmlwdCByZWdpc3RyYXRpb24gaW5mb1xuICAgIGNvbnN0IHNjcmlwdEluZm9zID0gJHtKU09OLnN0cmluZ2lmeShzY3JpcHRJbmZvcywgbnVsbCwgMil9O1xuXG4gICAgLy8gUmVnaXN0ZXIgYWxsIHNjcmlwdCBjbGFzc2VzXG4gICAgJHtyZWdpc3RyYXRpb25zfVxuXG4gICAgLy8gRXhwb3J0IHNjcmlwdCBpbmZvcyBmb3IgZGVidWdnaW5nXG4gICAgd2luZG93Ll9fY2NlX3NjcmlwdF9pbmZvc19fID0gc2NyaXB0SW5mb3M7XG5cbiAgICBjb25zb2xlLmxvZygnW1NjcmlwdEJ1bmRsZV0gUmVnaXN0ZXJlZCcsIHNjcmlwdEluZm9zLmxlbmd0aCwgJ3NjcmlwdCBjbGFzc2VzJyk7XG59KSgpO1xuYDtcbiAgICB9XG59XG4iXX0=