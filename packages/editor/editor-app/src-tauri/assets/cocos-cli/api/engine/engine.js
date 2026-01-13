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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineApi = void 0;
const decorator_1 = require("../decorator/decorator");
const schema_base_1 = require("../base/schema-base");
const engine_1 = require("../../core/engine");
const schema_1 = require("./schema");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
/**
 * @zh 内置材质配置
 * @en Builtin material configurations
 *
 * 这些配置用于在 viewport 中初始化 UI 渲染所需的内置材质
 * These configs are used to initialize builtin materials needed for UI rendering in viewport
 */
const BUILTIN_MATERIAL_CONFIGS = [
    {
        name: 'ui-base-material',
        effectName: 'builtin-sprite',
        defines: { USE_TEXTURE: false },
    },
    {
        name: 'ui-sprite-material',
        effectName: 'builtin-sprite',
        defines: { USE_TEXTURE: true },
    },
    {
        name: 'ui-sprite-gray-material',
        effectName: 'builtin-sprite',
        defines: { USE_TEXTURE: true, IS_GRAY: true },
    },
    {
        name: 'ui-sprite-alpha-sep-material',
        effectName: 'builtin-sprite',
        defines: { USE_TEXTURE: true, CC_USE_EMBEDDED_ALPHA: true },
    },
    {
        name: 'ui-sprite-gray-alpha-sep-material',
        effectName: 'builtin-sprite',
        defines: { USE_TEXTURE: true, IS_GRAY: true, CC_USE_EMBEDDED_ALPHA: true },
    },
    // Graphics material
    {
        name: 'ui-graphics-material',
        effectName: 'builtin-graphics',
        defines: {},
    },
];
/**
 * @zh Effect 名称映射
 * @en Effect name mapping
 *
 * 将文件路径名称映射到引擎期望的规范名称
 * Maps file path names to canonical names expected by the engine
 */
const EFFECT_NAME_MAPPING = {
    'for2d/builtin-sprite': 'builtin-sprite',
    'internal/builtin-graphics': 'builtin-graphics',
};
class EngineApi {
    /**
     * @zh 获取内置资源
     * @en Get Builtin Resources
     *
     * 返回 viewport 初始化所需的所有内置资源，包括 shader chunks、effects 和材质配置
     * Returns all builtin resources needed for viewport initialization, including shader chunks, effects, and material configs
     */
    async getBuiltinResources() {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: {
                chunks: {},
                effects: {},
                materialConfigs: [],
                effectNameMapping: {},
            },
        };
        try {
            const engineInfo = engine_1.Engine.getInfo();
            const enginePath = engineInfo.typescript.path;
            // Load builtin chunks
            const chunksDir = (0, path_1.join)(enginePath, 'editor/assets/chunks');
            ret.data.chunks = this.loadChunks(chunksDir);
            // Load builtin effects (only the ones needed for UI)
            const effectsDir = (0, path_1.join)(enginePath, 'editor/assets/effects');
            ret.data.effects = this.loadEffects(effectsDir);
            // Add material configs
            ret.data.materialConfigs = BUILTIN_MATERIAL_CONFIGS;
            // Add effect name mapping
            ret.data.effectNameMapping = EFFECT_NAME_MAPPING;
            console.log(`[EngineApi] Loaded ${Object.keys(ret.data.chunks).length} chunks, ${Object.keys(ret.data.effects).length} effects`);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('[EngineApi] getBuiltinResources error:', e);
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * @zh 递归加载所有 chunks
     * @en Recursively load all chunks
     */
    loadChunks(dir, basePath = '') {
        const chunks = {};
        try {
            const items = (0, fs_extra_1.readdirSync)(dir);
            for (const item of items) {
                const fullPath = (0, path_1.join)(dir, item);
                const stat = (0, fs_extra_1.statSync)(fullPath);
                if (stat.isDirectory()) {
                    // Recursively load chunks from subdirectory
                    const subPath = basePath ? `${basePath}/${item}` : item;
                    const subChunks = this.loadChunks(fullPath, subPath);
                    Object.assign(chunks, subChunks);
                }
                else if ((0, path_1.extname)(item) === '.chunk') {
                    // Load chunk file
                    const name = basePath
                        ? `${basePath}/${(0, path_1.basename)(item, '.chunk')}`
                        : (0, path_1.basename)(item, '.chunk');
                    const content = (0, fs_extra_1.readFileSync)(fullPath, 'utf-8');
                    chunks[name] = content;
                }
            }
        }
        catch (e) {
            console.warn(`[EngineApi] Failed to load chunks from ${dir}:`, e);
        }
        return chunks;
    }
    /**
     * @zh 加载所需的 effects
     * @en Load required effects
     */
    loadEffects(dir, basePath = '') {
        const effects = {};
        // List of effects needed for viewport UI rendering
        const requiredEffects = new Set([
            'for2d/builtin-sprite',
            'internal/builtin-graphics',
            'internal/builtin-geometry-renderer',
            'internal/builtin-clear-stencil',
            'builtin-unlit',
            'pipeline/skybox',
        ]);
        try {
            const items = (0, fs_extra_1.readdirSync)(dir);
            for (const item of items) {
                const fullPath = (0, path_1.join)(dir, item);
                const stat = (0, fs_extra_1.statSync)(fullPath);
                if (stat.isDirectory()) {
                    // Recursively load effects from subdirectory
                    const subPath = basePath ? `${basePath}/${item}` : item;
                    const subEffects = this.loadEffects(fullPath, subPath);
                    Object.assign(effects, subEffects);
                }
                else if ((0, path_1.extname)(item) === '.effect') {
                    // Load effect file
                    const pathName = basePath
                        ? `${basePath}/${(0, path_1.basename)(item, '.effect')}`
                        : (0, path_1.basename)(item, '.effect');
                    // Only load required effects
                    if (requiredEffects.has(pathName) || this.isRequiredEffect(pathName)) {
                        const content = (0, fs_extra_1.readFileSync)(fullPath, 'utf-8');
                        // Use canonical name if mapping exists
                        const canonicalName = EFFECT_NAME_MAPPING[pathName] || pathName;
                        effects[canonicalName] = content;
                        // Also store with original path name for compatibility
                        if (canonicalName !== pathName) {
                            effects[pathName] = content;
                        }
                    }
                }
            }
        }
        catch (e) {
            console.warn(`[EngineApi] Failed to load effects from ${dir}:`, e);
        }
        return effects;
    }
    /**
     * @zh 检查是否为必需的 effect
     * @en Check if effect is required
     */
    isRequiredEffect(pathName) {
        // Include internal and for2d effects
        return pathName.startsWith('internal/') || pathName.startsWith('for2d/');
    }
}
exports.EngineApi = EngineApi;
__decorate([
    (0, decorator_1.tool)('engine-get-builtin-resources'),
    (0, decorator_1.title)('Get Builtin Resources'),
    (0, decorator_1.description)('Get builtin shader chunks, effects, and material configurations needed for viewport initialization. This includes all resources required for UI rendering (sprites, graphics, etc).'),
    (0, decorator_1.result)(schema_1.SchemaBuiltinResources),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EngineApi.prototype, "getBuiltinResources", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5naW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaS9lbmdpbmUvZW5naW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLHNEQUFpRjtBQUNqRixxREFBc0Y7QUFDdEYsOENBQTJDO0FBQzNDLHFDQUFzRjtBQUN0Rix1Q0FBK0Q7QUFDL0QsK0JBQXlEO0FBRXpEOzs7Ozs7R0FNRztBQUNILE1BQU0sd0JBQXdCLEdBQXNCO0lBQ2hEO1FBQ0ksSUFBSSxFQUFFLGtCQUFrQjtRQUN4QixVQUFVLEVBQUUsZ0JBQWdCO1FBQzVCLE9BQU8sRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUU7S0FDbEM7SUFDRDtRQUNJLElBQUksRUFBRSxvQkFBb0I7UUFDMUIsVUFBVSxFQUFFLGdCQUFnQjtRQUM1QixPQUFPLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFO0tBQ2pDO0lBQ0Q7UUFDSSxJQUFJLEVBQUUseUJBQXlCO1FBQy9CLFVBQVUsRUFBRSxnQkFBZ0I7UUFDNUIsT0FBTyxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO0tBQ2hEO0lBQ0Q7UUFDSSxJQUFJLEVBQUUsOEJBQThCO1FBQ3BDLFVBQVUsRUFBRSxnQkFBZ0I7UUFDNUIsT0FBTyxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxJQUFJLEVBQUU7S0FDOUQ7SUFDRDtRQUNJLElBQUksRUFBRSxtQ0FBbUM7UUFDekMsVUFBVSxFQUFFLGdCQUFnQjtRQUM1QixPQUFPLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFO0tBQzdFO0lBQ0Qsb0JBQW9CO0lBQ3BCO1FBQ0ksSUFBSSxFQUFFLHNCQUFzQjtRQUM1QixVQUFVLEVBQUUsa0JBQWtCO1FBQzlCLE9BQU8sRUFBRSxFQUFF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LFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQzt3QkFDaEUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLE9BQU8sQ0FBQzt3QkFFakMsdURBQXVEO3dCQUN2RCxJQUFJLGFBQWEsS0FBSyxRQUFRLEVBQUUsQ0FBQzs0QkFDN0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLE9BQU8sQ0FBQzt3QkFDaEMsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDVCxPQUFPLENBQUMsSUFBSSxDQUFDLDJDQUEyQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVEOzs7T0FHRztJQUNLLGdCQUFnQixDQUFDLFFBQWdCO1FBQ3JDLHFDQUFxQztRQUNyQyxPQUFPLFFBQVEsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM3RSxDQUFDO0NBQ0o7QUF0SkQsOEJBc0pDO0FBMUlTO0lBSkwsSUFBQSxnQkFBSSxFQUFDLDhCQUE4QixDQUFDO0lBQ3BDLElBQUEsaUJBQUssRUFBQyx1QkFBdUIsQ0FBQztJQUM5QixJQUFBLHVCQUFXLEVBQUMscUxBQXFMLENBQUM7SUFDbE0sSUFBQSxrQkFBTSxFQUFDLCtCQUFzQixDQUFDOzs7O29EQXVDOUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQHpoIOW8leaTjiBBUElcclxuICogQGVuIEVuZ2luZSBBUElcclxuICpcclxuICog5o+Q5L6b5byV5pOO55u45YWz55qE5Yqf6IO977yM5YyF5ous5YaF572u6LWE5rqQ5p+l6K+i562J44CCXHJcbiAqIFByb3ZpZGVzIGVuZ2luZS1yZWxhdGVkIGZ1bmN0aW9uYWxpdHksIGluY2x1ZGluZyBidWlsdGluIHJlc291cmNlIHF1ZXJpZXMuXHJcbiAqL1xyXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcclxuaW1wb3J0IHsgZGVzY3JpcHRpb24sIHBhcmFtLCByZXN1bHQsIHRpdGxlLCB0b29sIH0gZnJvbSAnLi4vZGVjb3JhdG9yL2RlY29yYXRvcic7XHJcbmltcG9ydCB7IENPTU1PTl9TVEFUVVMsIENvbW1vblJlc3VsdFR5cGUsIEh0dHBTdGF0dXNDb2RlIH0gZnJvbSAnLi4vYmFzZS9zY2hlbWEtYmFzZSc7XHJcbmltcG9ydCB7IEVuZ2luZSB9IGZyb20gJy4uLy4uL2NvcmUvZW5naW5lJztcclxuaW1wb3J0IHsgU2NoZW1hQnVpbHRpblJlc291cmNlcywgVEJ1aWx0aW5SZXNvdXJjZXMsIFRNYXRlcmlhbENvbmZpZyB9IGZyb20gJy4vc2NoZW1hJztcclxuaW1wb3J0IHsgcmVhZGRpclN5bmMsIHJlYWRGaWxlU3luYywgc3RhdFN5bmMgfSBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCB7IGpvaW4sIGJhc2VuYW1lLCBleHRuYW1lLCByZWxhdGl2ZSB9IGZyb20gJ3BhdGgnO1xyXG5cclxuLyoqXHJcbiAqIEB6aCDlhoXnva7mnZDotKjphY3nva5cclxuICogQGVuIEJ1aWx0aW4gbWF0ZXJpYWwgY29uZmlndXJhdGlvbnNcclxuICpcclxuICog6L+Z5Lqb6YWN572u55So5LqO5ZyoIHZpZXdwb3J0IOS4reWIneWni+WMliBVSSDmuLLmn5PmiYDpnIDnmoTlhoXnva7mnZDotKhcclxuICogVGhlc2UgY29uZmlncyBhcmUgdXNlZCB0byBpbml0aWFsaXplIGJ1aWx0aW4gbWF0ZXJpYWxzIG5lZWRlZCBmb3IgVUkgcmVuZGVyaW5nIGluIHZpZXdwb3J0XHJcbiAqL1xyXG5jb25zdCBCVUlMVElOX01BVEVSSUFMX0NPTkZJR1M6IFRNYXRlcmlhbENvbmZpZ1tdID0gW1xyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICd1aS1iYXNlLW1hdGVyaWFsJyxcclxuICAgICAgICBlZmZlY3ROYW1lOiAnYnVpbHRpbi1zcHJpdGUnLFxyXG4gICAgICAgIGRlZmluZXM6IHsgVVNFX1RFWFRVUkU6IGZhbHNlIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICd1aS1zcHJpdGUtbWF0ZXJpYWwnLFxyXG4gICAgICAgIGVmZmVjdE5hbWU6ICdidWlsdGluLXNwcml0ZScsXHJcbiAgICAgICAgZGVmaW5lczogeyBVU0VfVEVYVFVSRTogdHJ1ZSB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAndWktc3ByaXRlLWdyYXktbWF0ZXJpYWwnLFxyXG4gICAgICAgIGVmZmVjdE5hbWU6ICdidWlsdGluLXNwcml0ZScsXHJcbiAgICAgICAgZGVmaW5lczogeyBVU0VfVEVYVFVSRTogdHJ1ZSwgSVNfR1JBWTogdHJ1ZSB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAndWktc3ByaXRlLWFscGhhLXNlcC1tYXRlcmlhbCcsXHJcbiAgICAgICAgZWZmZWN0TmFtZTogJ2J1aWx0aW4tc3ByaXRlJyxcclxuICAgICAgICBkZWZpbmVzOiB7IFVTRV9URVhUVVJFOiB0cnVlLCBDQ19VU0VfRU1CRURERURfQUxQSEE6IHRydWUgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ3VpLXNwcml0ZS1ncmF5LWFscGhhLXNlcC1tYXRlcmlhbCcsXHJcbiAgICAgICAgZWZmZWN0TmFtZTogJ2J1aWx0aW4tc3ByaXRlJyxcclxuICAgICAgICBkZWZpbmVzOiB7IFVTRV9URVhUVVJFOiB0cnVlLCBJU19HUkFZOiB0cnVlLCBDQ19VU0VfRU1CRURERURfQUxQSEE6IHRydWUgfSxcclxuICAgIH0sXHJcbiAgICAvLyBHcmFwaGljcyBtYXRlcmlhbFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICd1aS1ncmFwaGljcy1tYXRlcmlhbCcsXHJcbiAgICAgICAgZWZmZWN0TmFtZTogJ2J1aWx0aW4tZ3JhcGhpY3MnLFxyXG4gICAgICAgIGRlZmluZXM6IHt9LFxyXG4gICAgfSxcclxuXTtcclxuXHJcbi8qKlxyXG4gKiBAemggRWZmZWN0IOWQjeensOaYoOWwhFxyXG4gKiBAZW4gRWZmZWN0IG5hbWUgbWFwcGluZ1xyXG4gKlxyXG4gKiDlsIbmlofku7bot6/lvoTlkI3np7DmmKDlsITliLDlvJXmk47mnJ/mnJvnmoTop4TojIPlkI3np7BcclxuICogTWFwcyBmaWxlIHBhdGggbmFtZXMgdG8gY2Fub25pY2FsIG5hbWVzIGV4cGVjdGVkIGJ5IHRoZSBlbmdpbmVcclxuICovXHJcbmNvbnN0IEVGRkVDVF9OQU1FX01BUFBJTkc6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAnZm9yMmQvYnVpbHRpbi1zcHJpdGUnOiAnYnVpbHRpbi1zcHJpdGUnLFxyXG4gICAgJ2ludGVybmFsL2J1aWx0aW4tZ3JhcGhpY3MnOiAnYnVpbHRpbi1ncmFwaGljcycsXHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgRW5naW5lQXBpIHtcclxuICAgIC8qKlxyXG4gICAgICogQHpoIOiOt+WPluWGhee9rui1hOa6kFxyXG4gICAgICogQGVuIEdldCBCdWlsdGluIFJlc291cmNlc1xyXG4gICAgICpcclxuICAgICAqIOi/lOWbniB2aWV3cG9ydCDliJ3lp4vljJbmiYDpnIDnmoTmiYDmnInlhoXnva7otYTmupDvvIzljIXmi6wgc2hhZGVyIGNodW5rc+OAgWVmZmVjdHMg5ZKM5p2Q6LSo6YWN572uXHJcbiAgICAgKiBSZXR1cm5zIGFsbCBidWlsdGluIHJlc291cmNlcyBuZWVkZWQgZm9yIHZpZXdwb3J0IGluaXRpYWxpemF0aW9uLCBpbmNsdWRpbmcgc2hhZGVyIGNodW5rcywgZWZmZWN0cywgYW5kIG1hdGVyaWFsIGNvbmZpZ3NcclxuICAgICAqL1xyXG4gICAgQHRvb2woJ2VuZ2luZS1nZXQtYnVpbHRpbi1yZXNvdXJjZXMnKVxyXG4gICAgQHRpdGxlKCdHZXQgQnVpbHRpbiBSZXNvdXJjZXMnKVxyXG4gICAgQGRlc2NyaXB0aW9uKCdHZXQgYnVpbHRpbiBzaGFkZXIgY2h1bmtzLCBlZmZlY3RzLCBhbmQgbWF0ZXJpYWwgY29uZmlndXJhdGlvbnMgbmVlZGVkIGZvciB2aWV3cG9ydCBpbml0aWFsaXphdGlvbi4gVGhpcyBpbmNsdWRlcyBhbGwgcmVzb3VyY2VzIHJlcXVpcmVkIGZvciBVSSByZW5kZXJpbmcgKHNwcml0ZXMsIGdyYXBoaWNzLCBldGMpLicpXHJcbiAgICBAcmVzdWx0KFNjaGVtYUJ1aWx0aW5SZXNvdXJjZXMpXHJcbiAgICBhc3luYyBnZXRCdWlsdGluUmVzb3VyY2VzKCk6IFByb21pc2U8Q29tbW9uUmVzdWx0VHlwZTxUQnVpbHRpblJlc291cmNlcz4+IHtcclxuICAgICAgICBjb25zdCBjb2RlOiBIdHRwU3RhdHVzQ29kZSA9IENPTU1PTl9TVEFUVVMuU1VDQ0VTUztcclxuICAgICAgICBjb25zdCByZXQ6IENvbW1vblJlc3VsdFR5cGU8VEJ1aWx0aW5SZXNvdXJjZXM+ID0ge1xyXG4gICAgICAgICAgICBjb2RlOiBjb2RlLFxyXG4gICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBjaHVua3M6IHt9LFxyXG4gICAgICAgICAgICAgICAgZWZmZWN0czoge30sXHJcbiAgICAgICAgICAgICAgICBtYXRlcmlhbENvbmZpZ3M6IFtdLFxyXG4gICAgICAgICAgICAgICAgZWZmZWN0TmFtZU1hcHBpbmc6IHt9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVuZ2luZUluZm8gPSBFbmdpbmUuZ2V0SW5mbygpO1xyXG4gICAgICAgICAgICBjb25zdCBlbmdpbmVQYXRoID0gZW5naW5lSW5mby50eXBlc2NyaXB0LnBhdGg7XHJcblxyXG4gICAgICAgICAgICAvLyBMb2FkIGJ1aWx0aW4gY2h1bmtzXHJcbiAgICAgICAgICAgIGNvbnN0IGNodW5rc0RpciA9IGpvaW4oZW5naW5lUGF0aCwgJ2VkaXRvci9hc3NldHMvY2h1bmtzJyk7XHJcbiAgICAgICAgICAgIHJldC5kYXRhIS5jaHVua3MgPSB0aGlzLmxvYWRDaHVua3MoY2h1bmtzRGlyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIExvYWQgYnVpbHRpbiBlZmZlY3RzIChvbmx5IHRoZSBvbmVzIG5lZWRlZCBmb3IgVUkpXHJcbiAgICAgICAgICAgIGNvbnN0IGVmZmVjdHNEaXIgPSBqb2luKGVuZ2luZVBhdGgsICdlZGl0b3IvYXNzZXRzL2VmZmVjdHMnKTtcclxuICAgICAgICAgICAgcmV0LmRhdGEhLmVmZmVjdHMgPSB0aGlzLmxvYWRFZmZlY3RzKGVmZmVjdHNEaXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIG1hdGVyaWFsIGNvbmZpZ3NcclxuICAgICAgICAgICAgcmV0LmRhdGEhLm1hdGVyaWFsQ29uZmlncyA9IEJVSUxUSU5fTUFURVJJQUxfQ09ORklHUztcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBlZmZlY3QgbmFtZSBtYXBwaW5nXHJcbiAgICAgICAgICAgIHJldC5kYXRhIS5lZmZlY3ROYW1lTWFwcGluZyA9IEVGRkVDVF9OQU1FX01BUFBJTkc7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW0VuZ2luZUFwaV0gTG9hZGVkICR7T2JqZWN0LmtleXMocmV0LmRhdGEhLmNodW5rcykubGVuZ3RofSBjaHVua3MsICR7T2JqZWN0LmtleXMocmV0LmRhdGEhLmVmZmVjdHMpLmxlbmd0aH0gZWZmZWN0c2ApO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0LmNvZGUgPSBDT01NT05fU1RBVFVTLkZBSUw7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tFbmdpbmVBcGldIGdldEJ1aWx0aW5SZXNvdXJjZXMgZXJyb3I6JywgZSk7XHJcbiAgICAgICAgICAgIHJldC5yZWFzb24gPSBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHpoIOmAkuW9kuWKoOi9veaJgOaciSBjaHVua3NcclxuICAgICAqIEBlbiBSZWN1cnNpdmVseSBsb2FkIGFsbCBjaHVua3NcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBsb2FkQ2h1bmtzKGRpcjogc3RyaW5nLCBiYXNlUGF0aDogc3RyaW5nID0gJycpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcclxuICAgICAgICBjb25zdCBjaHVua3M6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgaXRlbXMgPSByZWFkZGlyU3luYyhkaXIpO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gam9pbihkaXIsIGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdCA9IHN0YXRTeW5jKGZ1bGxQYXRoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVjdXJzaXZlbHkgbG9hZCBjaHVua3MgZnJvbSBzdWJkaXJlY3RvcnlcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJQYXRoID0gYmFzZVBhdGggPyBgJHtiYXNlUGF0aH0vJHtpdGVtfWAgOiBpdGVtO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YkNodW5rcyA9IHRoaXMubG9hZENodW5rcyhmdWxsUGF0aCwgc3ViUGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihjaHVua3MsIHN1YkNodW5rcyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV4dG5hbWUoaXRlbSkgPT09ICcuY2h1bmsnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTG9hZCBjaHVuayBmaWxlXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGJhc2VQYXRoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCR7YmFzZVBhdGh9LyR7YmFzZW5hbWUoaXRlbSwgJy5jaHVuaycpfWBcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBiYXNlbmFtZShpdGVtLCAnLmNodW5rJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHJlYWRGaWxlU3luYyhmdWxsUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtzW25hbWVdID0gY29udGVudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbRW5naW5lQXBpXSBGYWlsZWQgdG8gbG9hZCBjaHVua3MgZnJvbSAke2Rpcn06YCwgZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY2h1bmtzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHpoIOWKoOi9veaJgOmcgOeahCBlZmZlY3RzXHJcbiAgICAgKiBAZW4gTG9hZCByZXF1aXJlZCBlZmZlY3RzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgbG9hZEVmZmVjdHMoZGlyOiBzdHJpbmcsIGJhc2VQYXRoOiBzdHJpbmcgPSAnJyk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xyXG4gICAgICAgIGNvbnN0IGVmZmVjdHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuXHJcbiAgICAgICAgLy8gTGlzdCBvZiBlZmZlY3RzIG5lZWRlZCBmb3Igdmlld3BvcnQgVUkgcmVuZGVyaW5nXHJcbiAgICAgICAgY29uc3QgcmVxdWlyZWRFZmZlY3RzID0gbmV3IFNldChbXHJcbiAgICAgICAgICAgICdmb3IyZC9idWlsdGluLXNwcml0ZScsXHJcbiAgICAgICAgICAgICdpbnRlcm5hbC9idWlsdGluLWdyYXBoaWNzJyxcclxuICAgICAgICAgICAgJ2ludGVybmFsL2J1aWx0aW4tZ2VvbWV0cnktcmVuZGVyZXInLFxyXG4gICAgICAgICAgICAnaW50ZXJuYWwvYnVpbHRpbi1jbGVhci1zdGVuY2lsJyxcclxuICAgICAgICAgICAgJ2J1aWx0aW4tdW5saXQnLFxyXG4gICAgICAgICAgICAncGlwZWxpbmUvc2t5Ym94JyxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgaXRlbXMgPSByZWFkZGlyU3luYyhkaXIpO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gam9pbihkaXIsIGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdCA9IHN0YXRTeW5jKGZ1bGxQYXRoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVjdXJzaXZlbHkgbG9hZCBlZmZlY3RzIGZyb20gc3ViZGlyZWN0b3J5XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ViUGF0aCA9IGJhc2VQYXRoID8gYCR7YmFzZVBhdGh9LyR7aXRlbX1gIDogaXRlbTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJFZmZlY3RzID0gdGhpcy5sb2FkRWZmZWN0cyhmdWxsUGF0aCwgc3ViUGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihlZmZlY3RzLCBzdWJFZmZlY3RzKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXh0bmFtZShpdGVtKSA9PT0gJy5lZmZlY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTG9hZCBlZmZlY3QgZmlsZVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhOYW1lID0gYmFzZVBhdGhcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBgJHtiYXNlUGF0aH0vJHtiYXNlbmFtZShpdGVtLCAnLmVmZmVjdCcpfWBcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBiYXNlbmFtZShpdGVtLCAnLmVmZmVjdCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBPbmx5IGxvYWQgcmVxdWlyZWQgZWZmZWN0c1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXF1aXJlZEVmZmVjdHMuaGFzKHBhdGhOYW1lKSB8fCB0aGlzLmlzUmVxdWlyZWRFZmZlY3QocGF0aE5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVXNlIGNhbm9uaWNhbCBuYW1lIGlmIG1hcHBpbmcgZXhpc3RzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhbm9uaWNhbE5hbWUgPSBFRkZFQ1RfTkFNRV9NQVBQSU5HW3BhdGhOYW1lXSB8fCBwYXRoTmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWZmZWN0c1tjYW5vbmljYWxOYW1lXSA9IGNvbnRlbnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBbHNvIHN0b3JlIHdpdGggb3JpZ2luYWwgcGF0aCBuYW1lIGZvciBjb21wYXRpYmlsaXR5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYW5vbmljYWxOYW1lICE9PSBwYXRoTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWZmZWN0c1twYXRoTmFtZV0gPSBjb250ZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtFbmdpbmVBcGldIEZhaWxlZCB0byBsb2FkIGVmZmVjdHMgZnJvbSAke2Rpcn06YCwgZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZWZmZWN0cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEB6aCDmo4Dmn6XmmK/lkKbkuLrlv4XpnIDnmoQgZWZmZWN0XHJcbiAgICAgKiBAZW4gQ2hlY2sgaWYgZWZmZWN0IGlzIHJlcXVpcmVkXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaXNSZXF1aXJlZEVmZmVjdChwYXRoTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgLy8gSW5jbHVkZSBpbnRlcm5hbCBhbmQgZm9yMmQgZWZmZWN0c1xyXG4gICAgICAgIHJldHVybiBwYXRoTmFtZS5zdGFydHNXaXRoKCdpbnRlcm5hbC8nKSB8fCBwYXRoTmFtZS5zdGFydHNXaXRoKCdmb3IyZC8nKTtcclxuICAgIH1cclxufVxyXG4iXX0=