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
exports.BuildResult = exports.InternalBuildResult = void 0;
const path_1 = require("path");
const asset_library_1 = require("./asset-library");
const BundleUtils = __importStar(require("../asset-handler/bundle/utils"));
const events_1 = __importDefault(require("events"));
const utils_1 = require("../utils");
const builder_config_1 = __importDefault(require("../../../share/builder-config"));
const i18n_1 = __importDefault(require("../../../../base/i18n"));
const global_1 = require("../../../share/global");
class Paths {
    dir;
    output;
    cache = {};
    compileConfig;
    effectBin = '';
    engineMeta = '';
    hashedMap = {};
    plugins = {};
    tempDir;
    projectRoot;
    constructor(dir, platform) {
        this.dir = dir || '';
        this.output = this.dir;
        this.compileConfig = (0, path_1.join)(dir, global_1.BuildGlobalInfo.buildOptionsFileName);
        this.tempDir = (0, path_1.join)(builder_config_1.default.projectTempDir, 'builder', platform);
        this.projectRoot = builder_config_1.default.projectRoot;
    }
    get settings() {
        return this.cache.settings || (0, path_1.join)(this.dir, 'src', 'settings.json');
    }
    set settings(val) {
        this.cache.settings = val;
    }
    get subpackages() {
        return this.cache.subpackages || (0, path_1.join)(this.dir, global_1.BuildGlobalInfo.SUBPACKAGES_HEADER);
    }
    set subpackages(val) {
        this.cache.subpackages = val;
    }
    get assets() {
        return this.cache.assets || (0, path_1.join)(this.dir, global_1.BuildGlobalInfo.ASSETS_HEADER);
    }
    set assets(val) {
        this.cache.assets = val;
    }
    get remote() {
        return this.cache.remote || (0, path_1.join)(this.dir, global_1.BuildGlobalInfo.REMOTE_HEADER);
    }
    set remote(val) {
        this.cache.remote = val;
    }
    get applicationJS() {
        return this.cache.applicationJS || (0, path_1.join)(this.dir, 'application.js');
    }
    set applicationJS(val) {
        this.cache.applicationJS = val;
    }
    get importMap() {
        return this.cache.importMap || (0, path_1.join)(this.dir, 'import-map.js');
    }
    set importMap(val) {
        this.cache.importMap = val;
    }
    get bundleScripts() {
        return this.cache.bundleScripts || (0, path_1.join)(this.dir, 'src', global_1.BuildGlobalInfo.BUNDLE_SCRIPTS_HEADER);
    }
    set bundleScripts(val) {
        this.cache.bundleScripts = val;
    }
}
// 构建过程处理的缓存对象
class InternalBuildResult extends events_1.default {
    settings = {
        CocosEngine: '0.0.0',
        engine: {
            debug: true,
            platform: 'web-desktop',
            customLayers: [],
            sortingLayers: [],
            macros: {},
            builtinAssets: [],
        },
        animation: {
            customJointTextureLayouts: [],
        },
        assets: {
            server: '',
            remoteBundles: [],
            subpackages: [],
            preloadBundles: [],
            bundleVers: {},
            preloadAssets: [],
            projectBundles: [],
        },
        plugins: {
            jsList: [],
        },
        scripting: {},
        launch: {
            launchScene: '',
        },
        screen: {
            exactFitScreen: true,
            designResolution: {
                width: 960,
                height: 640,
                policy: 0,
            },
        },
        rendering: {
            renderPipeline: '',
        },
    };
    // 脚本资源包分组（子包/分包）
    scriptPackages = [];
    // 插件版本
    pluginVers = {};
    // 纹理压缩结果存储
    compressImageResult = {};
    /**
     * @param name
     * @param options
     * 导入映射
     */
    importMap = { imports: {} };
    rawOptions;
    paths;
    compileOptions = null; // 允许自定义编译选项，如果未指定将会使用构建 options 存储
    __task;
    pluginScripts = [];
    separateEngineResult;
    get dest() {
        // TODO 兼容 adsense 插件从外部插件转为内部插件，兼容至 3.9
        return this.paths.dir;
    }
    constructor(task, preview) {
        super();
        this.rawOptions = JSON.parse(JSON.stringify(task.options));
        // 虚拟路径
        let dest = (0, path_1.join)(builder_config_1.default.projectRoot, 'build', 'preview');
        if (!preview) {
            dest = (0, utils_1.getBuildPath)(task.options);
        }
        this.paths = new Paths(dest, task.options.platform);
        this.__task = task;
    }
}
exports.InternalBuildResult = InternalBuildResult;
class BuildResult {
    __task;
    settings;
    dest;
    get paths() {
        return this.__task.result.paths;
    }
    constructor(task) {
        this.__task = task;
        this.dest = (0, utils_1.getBuildPath)(task.options);
        this.settings = task.result.settings;
    }
    /**
     * 指定的 uuid 资源是否包含在构建资源中
     */
    containsAsset(uuid) {
        return !!this.__task.bundleManager.bundles.find((bundle) => bundle.containsAsset(uuid));
    }
    /**
     * 获取指定 uuid 原始资源的存放路径（不包括序列化 json）
     * 自动图集的小图 uuid 和自动图集的 uuid 都将会查询到合图大图的生成路径
     * 实际返回多个路径的情况：查询 uuid 为自动图集资源，且对应图集生成多张大图，纹理压缩会有多个图片格式路径
     */
    getRawAssetPaths(uuid) {
        const assetInfo = asset_library_1.buildAssetLibrary.getAsset(uuid);
        if (!assetInfo) {
            return [];
        }
        const bundles = this.__task.bundleManager.bundles.filter((bundle) => bundle.containsAsset(uuid, true));
        if (!bundles.length) {
            return [];
        }
        return bundles.flatMap((bundle) => {
            const res = {
                bundleName: bundle.name,
                raw: [],
            };
            if (bundle.getRedirect(uuid)) {
                res.redirect = bundle.getRedirect(uuid);
            }
            else {
                res.raw = BundleUtils.getRawAssetPaths(uuid, bundle);
            }
            if (!res.raw.length && !res.redirect) {
                return [];
            }
            return res;
        });
    }
    /**
     * 获取指定 uuid 资源的路径相关信息
     * @return Array<{raw?: string | string[]; import?: string; groupIndex?: number;}>
     * @return.raw: 该资源源文件的实际存储位置，存在多个为数组，不存在则为空
     * @return.import: 该资源序列化数据的实际存储位置，不存在为空，可能是 .bin 或者 .json 格式
     * @return.groupIndex: 若该资源的序列化数据在某个分组内，这里标识在分组内的 index，不存在为空
     */
    getAssetPathInfo(uuid) {
        const bundles = this.__task.bundleManager.bundles.filter((bundle) => bundle.containsAsset(uuid, true));
        if (!bundles.length) {
            return [];
        }
        return bundles.flatMap((bundle) => {
            const result = {
                bundleName: bundle.name,
            };
            if (bundle.getRedirect(uuid)) {
                result.redirect = bundle.getRedirect(uuid);
            }
            else {
                Object.assign(result, BundleUtils.getAssetPathInfo(uuid, bundle));
            }
            if (!result.raw && !result.redirect && !result.import) {
                return [];
            }
            return result;
        });
    }
    /**
     * @deprecated please use getImportAssetPaths instead
     * @param uuid
     */
    getJsonPathInfo(uuid) {
        console.warn(i18n_1.default.t('builder.warn.deprecated_tip', {
            oldName: 'result.getJsonPathInfo',
            newName: 'result.getImportAssetPaths',
        }));
        return this.getImportAssetPaths(uuid);
    }
    /**
     * 指定 uuid 资源的序列化信息在构建后的信息
     * @param uuid
     */
    getImportAssetPaths(uuid) {
        const bundles = this.__task.bundleManager.bundles.filter((bundle) => bundle.containsAsset(uuid));
        if (!bundles.length) {
            return [];
        }
        return bundles.flatMap((bundle) => {
            const result = {
                bundleName: bundle.name,
            };
            if (bundle.getRedirect(uuid)) {
                result.redirect = bundle.getRedirect(uuid);
            }
            else {
                const info = BundleUtils.getImportPathInfo(uuid, bundle);
                if (!info) {
                    return [];
                }
                Object.assign(result, info);
            }
            return result;
        });
    }
}
exports.BuildResult = BuildResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtcmVzdWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci93b3JrZXIvYnVpbGRlci9tYW5hZ2VyL2J1aWxkLXJlc3VsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQkFBNEI7QUFDNUIsbURBQW9EO0FBQ3BELDJFQUE2RDtBQUM3RCxvREFBa0M7QUFDbEMsb0NBQXdDO0FBR3hDLG1GQUEwRDtBQUMxRCxpRUFBeUM7QUFDekMsa0RBQXdEO0FBRXhELE1BQU0sS0FBSztJQUNQLEdBQUcsQ0FBUztJQUNILE1BQU0sQ0FBUztJQUN4QixLQUFLLEdBQTJCLEVBQUUsQ0FBQztJQUNuQyxhQUFhLENBQVM7SUFFdEIsU0FBUyxHQUFZLEVBQUUsQ0FBQztJQUN4QixVQUFVLEdBQUcsRUFBRSxDQUFDO0lBRWhCLFNBQVMsR0FBMkIsRUFBRSxDQUFDO0lBRXZDLE9BQU8sR0FBMkIsRUFBRSxDQUFDO0lBQ3JDLE9BQU8sQ0FBUztJQUNoQixXQUFXLENBQVM7SUFDcEIsWUFBWSxHQUFXLEVBQUUsUUFBZ0I7UUFDckMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUN2QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUEsV0FBSSxFQUFDLEdBQUcsRUFBRSx3QkFBZSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFBLFdBQUksRUFBQyx3QkFBYSxDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLFdBQVcsR0FBRyx3QkFBYSxDQUFDLFdBQVcsQ0FBQztJQUNqRCxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsSUFBSSxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxlQUFlLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQsSUFBSSxRQUFRLENBQUMsR0FBVztRQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUM7SUFDOUIsQ0FBQztJQUVELElBQUksV0FBVztRQUNYLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLElBQUksSUFBQSxXQUFJLEVBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSx3QkFBZSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDeEYsQ0FBQztJQUVELElBQUksV0FBVyxDQUFDLEdBQVc7UUFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLElBQUEsV0FBSSxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsd0JBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRUQsSUFBSSxNQUFNLENBQUMsR0FBVztRQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7SUFDNUIsQ0FBQztJQUVELElBQUksTUFBTTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksSUFBQSxXQUFJLEVBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSx3QkFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFFRCxJQUFJLE1BQU0sQ0FBQyxHQUFXO1FBQ2xCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztJQUM1QixDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsSUFBSSxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVELElBQUksYUFBYSxDQUFDLEdBQVc7UUFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDO0lBQ25DLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLElBQUEsV0FBSSxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELElBQUksU0FBUyxDQUFDLEdBQVc7UUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0lBQy9CLENBQUM7SUFFRCxJQUFJLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLElBQUEsV0FBSSxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLHdCQUFlLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUNwRyxDQUFDO0lBRUQsSUFBSSxhQUFhLENBQUMsR0FBVztRQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUM7SUFDbkMsQ0FBQztDQUNKO0FBRUQsY0FBYztBQUNkLE1BQWEsbUJBQW9CLFNBQVEsZ0JBQVk7SUFDMUMsUUFBUSxHQUFjO1FBQ3pCLFdBQVcsRUFBRSxPQUFPO1FBQ3BCLE1BQU0sRUFBRTtZQUNKLEtBQUssRUFBRSxJQUFJO1lBQ1gsUUFBUSxFQUFFLGFBQWE7WUFDdkIsWUFBWSxFQUFFLEVBQUU7WUFDaEIsYUFBYSxFQUFFLEVBQUU7WUFDakIsTUFBTSxFQUFFLEVBQUU7WUFDVixhQUFhLEVBQUUsRUFBRTtTQUNwQjtRQUNELFNBQVMsRUFBRTtZQUNQLHlCQUF5QixFQUFFLEVBQUU7U0FDaEM7UUFDRCxNQUFNLEVBQUU7WUFDSixNQUFNLEVBQUUsRUFBRTtZQUNWLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLFdBQVcsRUFBRSxFQUFFO1lBQ2YsY0FBYyxFQUFFLEVBQUU7WUFDbEIsVUFBVSxFQUFFLEVBQUU7WUFDZCxhQUFhLEVBQUUsRUFBRTtZQUNqQixjQUFjLEVBQUUsRUFBRTtTQUNyQjtRQUNELE9BQU8sRUFBRTtZQUNMLE1BQU0sRUFBRSxFQUFFO1NBQ2I7UUFDRCxTQUFTLEVBQUUsRUFBRTtRQUNiLE1BQU0sRUFBRTtZQUNKLFdBQVcsRUFBRSxFQUFFO1NBQ2xCO1FBQ0QsTUFBTSxFQUFFO1lBQ0osY0FBYyxFQUFFLElBQUk7WUFDcEIsZ0JBQWdCLEVBQUU7Z0JBQ2QsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsTUFBTSxFQUFFLEdBQUc7Z0JBQ1gsTUFBTSxFQUFFLENBQUM7YUFDWjtTQUNKO1FBQ0QsU0FBUyxFQUFFO1lBQ1AsY0FBYyxFQUFFLEVBQUU7U0FDckI7S0FDSixDQUFDO0lBRUYsaUJBQWlCO0lBQ1YsY0FBYyxHQUFhLEVBQUUsQ0FBQztJQUVyQyxPQUFPO0lBQ0EsVUFBVSxHQUEyQixFQUFFLENBQUM7SUFFL0MsV0FBVztJQUNKLG1CQUFtQixHQUF5QixFQUFFLENBQUM7SUFFdEQ7Ozs7T0FJRztJQUNJLFNBQVMsR0FBeUIsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFFbEQsVUFBVSxDQUFtQjtJQUU3QixLQUFLLENBQWM7SUFFbkIsY0FBYyxHQUFRLElBQUksQ0FBQyxDQUFDLG1DQUFtQztJQUU5RCxNQUFNLENBQVc7SUFFbEIsYUFBYSxHQUlmLEVBQUUsQ0FBQztJQUVELG9CQUFvQixDQUE4QjtJQUV6RCxJQUFXLElBQUk7UUFDWCx3Q0FBd0M7UUFDeEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUMxQixDQUFDO0lBRUQsWUFBWSxJQUFjLEVBQUUsT0FBZ0I7UUFDeEMsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMzRCxPQUFPO1FBQ1AsSUFBSSxJQUFJLEdBQUcsSUFBQSxXQUFJLEVBQUMsd0JBQWEsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNYLElBQUksR0FBRyxJQUFBLG9CQUFZLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7Q0FFSjtBQTVGRCxrREE0RkM7QUFFRCxNQUFhLFdBQVc7SUFDSCxNQUFNLENBQVc7SUFFM0IsUUFBUSxDQUFhO0lBQ3JCLElBQUksQ0FBUztJQUVwQixJQUFXLEtBQUs7UUFDWixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNwQyxDQUFDO0lBRUQsWUFBWSxJQUFjO1FBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBQSxvQkFBWSxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7T0FFRztJQUNJLGFBQWEsQ0FBQyxJQUFZO1FBQzdCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLGdCQUFnQixDQUFDLElBQVk7UUFDaEMsTUFBTSxTQUFTLEdBQUcsaUNBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNiLE9BQU8sRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdkcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNsQixPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUM5QixNQUFNLEdBQUcsR0FBc0I7Z0JBQzNCLFVBQVUsRUFBRSxNQUFNLENBQUMsSUFBSTtnQkFDdkIsR0FBRyxFQUFFLEVBQUU7YUFDVixDQUFDO1lBQ0YsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLEdBQUcsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QyxDQUFDO2lCQUFNLENBQUM7Z0JBQ0osR0FBRyxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3pELENBQUM7WUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ25DLE9BQU8sRUFBRSxDQUFDO1lBQ2QsQ0FBQztZQUNELE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksZ0JBQWdCLENBQUMsSUFBWTtRQUNoQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3ZHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEIsT0FBTyxFQUFFLENBQUM7UUFDZCxDQUFDO1FBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDOUIsTUFBTSxNQUFNLEdBQW1CO2dCQUMzQixVQUFVLEVBQUUsTUFBTSxDQUFDLElBQUk7YUFDMUIsQ0FBQztZQUNGLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUMzQixNQUFNLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0MsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN0RSxDQUFDO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNwRCxPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUM7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7O09BR0c7SUFDSSxlQUFlLENBQUMsSUFBWTtRQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLGNBQUksQ0FBQyxDQUFDLENBQUMsNkJBQTZCLEVBQUU7WUFDL0MsT0FBTyxFQUFFLHdCQUF3QjtZQUNqQyxPQUFPLEVBQUUsNEJBQTRCO1NBQ3hDLENBQUMsQ0FBQyxDQUFDO1FBQ0osT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVEOzs7T0FHRztJQUNJLG1CQUFtQixDQUFDLElBQVk7UUFDbkMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2pHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEIsT0FBTyxFQUFFLENBQUM7UUFDZCxDQUFDO1FBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDOUIsTUFBTSxNQUFNLEdBQXlCO2dCQUNqQyxVQUFVLEVBQUUsTUFBTSxDQUFDLElBQUk7YUFDMUIsQ0FBQztZQUNGLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUMzQixNQUFNLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0MsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDUixPQUFPLEVBQUUsQ0FBQztnQkFDZCxDQUFDO2dCQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2hDLENBQUM7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FFSjtBQXhIRCxrQ0F3SEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGJ1aWxkQXNzZXRMaWJyYXJ5IH0gZnJvbSAnLi9hc3NldC1saWJyYXJ5JztcclxuaW1wb3J0ICogYXMgQnVuZGxlVXRpbHMgZnJvbSAnLi4vYXNzZXQtaGFuZGxlci9idW5kbGUvdXRpbHMnO1xyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cyc7XHJcbmltcG9ydCB7IGdldEJ1aWxkUGF0aCB9IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IHsgSUJ1aWxkUGF0aHMsIElTZXR0aW5ncywgSUJ1aWxkT3B0aW9uQmFzZSwgSUJ1aWxkUmVzdWx0LCBJUmF3QXNzZXRQYXRoSW5mbywgSUFzc2V0UGF0aEluZm8sIElJbXBvcnRBc3NldFBhdGhJbmZvIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzJztcclxuaW1wb3J0IHsgSUNvbXByZXNzSW1hZ2VSZXN1bHQsIEltcG9ydE1hcFdpdGhJbXBvcnRzLCBJQnVpbGRlciwgSUJ1aWxkU2VwYXJhdGVFbmdpbmVSZXN1bHQsIEludGVybmFsQnVpbGRSZXN1bHQgYXMgSUludGVybmFsQnVpbGRSZXN1bHQgfSBmcm9tICcuLi8uLi8uLi9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IGJ1aWxkZXJDb25maWcgZnJvbSAnLi4vLi4vLi4vc2hhcmUvYnVpbGRlci1jb25maWcnO1xyXG5pbXBvcnQgaTE4biBmcm9tICcuLi8uLi8uLi8uLi9iYXNlL2kxOG4nO1xyXG5pbXBvcnQgeyBCdWlsZEdsb2JhbEluZm8gfSBmcm9tICcuLi8uLi8uLi9zaGFyZS9nbG9iYWwnO1xyXG5cclxuY2xhc3MgUGF0aHMgaW1wbGVtZW50cyBJQnVpbGRQYXRocyB7XHJcbiAgICBkaXI6IHN0cmluZztcclxuICAgIHJlYWRvbmx5IG91dHB1dDogc3RyaW5nO1xyXG4gICAgY2FjaGU6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuICAgIGNvbXBpbGVDb25maWc6IHN0cmluZztcclxuXHJcbiAgICBlZmZlY3RCaW4/OiBzdHJpbmcgPSAnJztcclxuICAgIGVuZ2luZU1ldGEgPSAnJztcclxuXHJcbiAgICBoYXNoZWRNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuXHJcbiAgICBwbHVnaW5zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XHJcbiAgICB0ZW1wRGlyOiBzdHJpbmc7XHJcbiAgICBwcm9qZWN0Um9vdDogc3RyaW5nO1xyXG4gICAgY29uc3RydWN0b3IoZGlyOiBzdHJpbmcsIHBsYXRmb3JtOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmRpciA9IGRpciB8fCAnJztcclxuICAgICAgICB0aGlzLm91dHB1dCA9IHRoaXMuZGlyO1xyXG4gICAgICAgIHRoaXMuY29tcGlsZUNvbmZpZyA9IGpvaW4oZGlyLCBCdWlsZEdsb2JhbEluZm8uYnVpbGRPcHRpb25zRmlsZU5hbWUpO1xyXG4gICAgICAgIHRoaXMudGVtcERpciA9IGpvaW4oYnVpbGRlckNvbmZpZy5wcm9qZWN0VGVtcERpciwgJ2J1aWxkZXInLCBwbGF0Zm9ybSk7XHJcbiAgICAgICAgdGhpcy5wcm9qZWN0Um9vdCA9IGJ1aWxkZXJDb25maWcucHJvamVjdFJvb3Q7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlLnNldHRpbmdzIHx8IGpvaW4odGhpcy5kaXIsICdzcmMnLCAnc2V0dGluZ3MuanNvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBzZXR0aW5ncyh2YWw6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuY2FjaGUuc2V0dGluZ3MgPSB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHN1YnBhY2thZ2VzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlLnN1YnBhY2thZ2VzIHx8IGpvaW4odGhpcy5kaXIsIEJ1aWxkR2xvYmFsSW5mby5TVUJQQUNLQUdFU19IRUFERVIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBzdWJwYWNrYWdlcyh2YWw6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuY2FjaGUuc3VicGFja2FnZXMgPSB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGFzc2V0cygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5hc3NldHMgfHwgam9pbih0aGlzLmRpciwgQnVpbGRHbG9iYWxJbmZvLkFTU0VUU19IRUFERVIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBhc3NldHModmFsOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmNhY2hlLmFzc2V0cyA9IHZhbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgcmVtb3RlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlLnJlbW90ZSB8fCBqb2luKHRoaXMuZGlyLCBCdWlsZEdsb2JhbEluZm8uUkVNT1RFX0hFQURFUik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHJlbW90ZSh2YWw6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuY2FjaGUucmVtb3RlID0gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBhcHBsaWNhdGlvbkpTKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmFwcGxpY2F0aW9uSlMgfHwgam9pbih0aGlzLmRpciwgJ2FwcGxpY2F0aW9uLmpzJyk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGFwcGxpY2F0aW9uSlModmFsOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmNhY2hlLmFwcGxpY2F0aW9uSlMgPSB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGltcG9ydE1hcCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5pbXBvcnRNYXAgfHwgam9pbih0aGlzLmRpciwgJ2ltcG9ydC1tYXAuanMnKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgaW1wb3J0TWFwKHZhbDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5jYWNoZS5pbXBvcnRNYXAgPSB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGJ1bmRsZVNjcmlwdHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuYnVuZGxlU2NyaXB0cyB8fCBqb2luKHRoaXMuZGlyLCAnc3JjJywgQnVpbGRHbG9iYWxJbmZvLkJVTkRMRV9TQ1JJUFRTX0hFQURFUik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGJ1bmRsZVNjcmlwdHModmFsOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmNhY2hlLmJ1bmRsZVNjcmlwdHMgPSB2YWw7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIOaehOW7uui/h+eoi+WkhOeQhueahOe8k+WtmOWvueixoVxyXG5leHBvcnQgY2xhc3MgSW50ZXJuYWxCdWlsZFJlc3VsdCBleHRlbmRzIEV2ZW50RW1pdHRlciBpbXBsZW1lbnRzIElJbnRlcm5hbEJ1aWxkUmVzdWx0IHtcclxuICAgIHB1YmxpYyBzZXR0aW5nczogSVNldHRpbmdzID0ge1xyXG4gICAgICAgIENvY29zRW5naW5lOiAnMC4wLjAnLFxyXG4gICAgICAgIGVuZ2luZToge1xyXG4gICAgICAgICAgICBkZWJ1ZzogdHJ1ZSxcclxuICAgICAgICAgICAgcGxhdGZvcm06ICd3ZWItZGVza3RvcCcsXHJcbiAgICAgICAgICAgIGN1c3RvbUxheWVyczogW10sXHJcbiAgICAgICAgICAgIHNvcnRpbmdMYXllcnM6IFtdLFxyXG4gICAgICAgICAgICBtYWNyb3M6IHt9LFxyXG4gICAgICAgICAgICBidWlsdGluQXNzZXRzOiBbXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICBjdXN0b21Kb2ludFRleHR1cmVMYXlvdXRzOiBbXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFzc2V0czoge1xyXG4gICAgICAgICAgICBzZXJ2ZXI6ICcnLFxyXG4gICAgICAgICAgICByZW1vdGVCdW5kbGVzOiBbXSxcclxuICAgICAgICAgICAgc3VicGFja2FnZXM6IFtdLFxyXG4gICAgICAgICAgICBwcmVsb2FkQnVuZGxlczogW10sXHJcbiAgICAgICAgICAgIGJ1bmRsZVZlcnM6IHt9LFxyXG4gICAgICAgICAgICBwcmVsb2FkQXNzZXRzOiBbXSxcclxuICAgICAgICAgICAgcHJvamVjdEJ1bmRsZXM6IFtdLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGx1Z2luczoge1xyXG4gICAgICAgICAgICBqc0xpc3Q6IFtdLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2NyaXB0aW5nOiB7fSxcclxuICAgICAgICBsYXVuY2g6IHtcclxuICAgICAgICAgICAgbGF1bmNoU2NlbmU6ICcnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2NyZWVuOiB7XHJcbiAgICAgICAgICAgIGV4YWN0Rml0U2NyZWVuOiB0cnVlLFxyXG4gICAgICAgICAgICBkZXNpZ25SZXNvbHV0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aDogOTYwLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA2NDAsXHJcbiAgICAgICAgICAgICAgICBwb2xpY3k6IDAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW5kZXJpbmc6IHtcclxuICAgICAgICAgICAgcmVuZGVyUGlwZWxpbmU6ICcnLFxyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIOiEmuacrOi1hOa6kOWMheWIhue7hO+8iOWtkOWMhS/liIbljIXvvIlcclxuICAgIHB1YmxpYyBzY3JpcHRQYWNrYWdlczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAvLyDmj5Lku7bniYjmnKxcclxuICAgIHB1YmxpYyBwbHVnaW5WZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XHJcblxyXG4gICAgLy8g57q555CG5Y6L57yp57uT5p6c5a2Y5YKoXHJcbiAgICBwdWJsaWMgY29tcHJlc3NJbWFnZVJlc3VsdDogSUNvbXByZXNzSW1hZ2VSZXN1bHQgPSB7fTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSBuYW1lXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xyXG4gICAgICog5a+85YWl5pig5bCEXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpbXBvcnRNYXA6IEltcG9ydE1hcFdpdGhJbXBvcnRzID0geyBpbXBvcnRzOiB7fSB9O1xyXG5cclxuICAgIHB1YmxpYyByYXdPcHRpb25zOiBJQnVpbGRPcHRpb25CYXNlO1xyXG5cclxuICAgIHB1YmxpYyBwYXRoczogSUJ1aWxkUGF0aHM7XHJcblxyXG4gICAgcHVibGljIGNvbXBpbGVPcHRpb25zOiBhbnkgPSBudWxsOyAvLyDlhYHorrjoh6rlrprkuYnnvJbor5HpgInpobnvvIzlpoLmnpzmnKrmjIflrprlsIbkvJrkvb/nlKjmnoTlu7ogb3B0aW9ucyDlrZjlgqhcclxuXHJcbiAgICBwcml2YXRlIF9fdGFzazogSUJ1aWxkZXI7XHJcblxyXG4gICAgcHVibGljIHBsdWdpblNjcmlwdHM6IEFycmF5PHtcclxuICAgICAgICB1dWlkOiBzdHJpbmc7XHJcbiAgICAgICAgdXJsOiBzdHJpbmc7XHJcbiAgICAgICAgZmlsZTogc3RyaW5nO1xyXG4gICAgfT4gPSBbXTtcclxuXHJcbiAgICBwdWJsaWMgc2VwYXJhdGVFbmdpbmVSZXN1bHQ/OiBJQnVpbGRTZXBhcmF0ZUVuZ2luZVJlc3VsdDtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IGRlc3QoKSB7XHJcbiAgICAgICAgLy8gVE9ETyDlhbzlrrkgYWRzZW5zZSDmj5Lku7bku47lpJbpg6jmj5Lku7bovazkuLrlhoXpg6jmj5Lku7bvvIzlhbzlrrnoh7MgMy45XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0aHMuZGlyO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRhc2s6IElCdWlsZGVyLCBwcmV2aWV3OiBib29sZWFuKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnJhd09wdGlvbnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRhc2sub3B0aW9ucykpO1xyXG4gICAgICAgIC8vIOiZmuaLn+i3r+W+hFxyXG4gICAgICAgIGxldCBkZXN0ID0gam9pbihidWlsZGVyQ29uZmlnLnByb2plY3RSb290LCAnYnVpbGQnLCAncHJldmlldycpO1xyXG4gICAgICAgIGlmICghcHJldmlldykge1xyXG4gICAgICAgICAgICBkZXN0ID0gZ2V0QnVpbGRQYXRoKHRhc2sub3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGF0aHMgPSBuZXcgUGF0aHMoZGVzdCwgdGFzay5vcHRpb25zLnBsYXRmb3JtKTtcclxuICAgICAgICB0aGlzLl9fdGFzayA9IHRhc2s7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQnVpbGRSZXN1bHQgaW1wbGVtZW50cyBJQnVpbGRSZXN1bHQge1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfX3Rhc2s6IElCdWlsZGVyO1xyXG5cclxuICAgIHB1YmxpYyBzZXR0aW5ncz86IElTZXR0aW5ncztcclxuICAgIHB1YmxpYyBkZXN0OiBzdHJpbmc7XHJcblxyXG4gICAgcHVibGljIGdldCBwYXRocygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fX3Rhc2sucmVzdWx0LnBhdGhzO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRhc2s6IElCdWlsZGVyKSB7XHJcbiAgICAgICAgdGhpcy5fX3Rhc2sgPSB0YXNrO1xyXG4gICAgICAgIHRoaXMuZGVzdCA9IGdldEJ1aWxkUGF0aCh0YXNrLm9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSB0YXNrLnJlc3VsdC5zZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaMh+WumueahCB1dWlkIOi1hOa6kOaYr+WQpuWMheWQq+WcqOaehOW7uui1hOa6kOS4rVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY29udGFpbnNBc3NldCh1dWlkOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLl9fdGFzay5idW5kbGVNYW5hZ2VyLmJ1bmRsZXMuZmluZCgoYnVuZGxlKSA9PiBidW5kbGUuY29udGFpbnNBc3NldCh1dWlkKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmjIflrpogdXVpZCDljp/lp4votYTmupDnmoTlrZjmlL7ot6/lvoTvvIjkuI3ljIXmi6zluo/liJfljJYganNvbu+8iVxyXG4gICAgICog6Ieq5Yqo5Zu+6ZuG55qE5bCP5Zu+IHV1aWQg5ZKM6Ieq5Yqo5Zu+6ZuG55qEIHV1aWQg6YO95bCG5Lya5p+l6K+i5Yiw5ZCI5Zu+5aSn5Zu+55qE55Sf5oiQ6Lev5b6EXHJcbiAgICAgKiDlrp7pmYXov5Tlm57lpJrkuKrot6/lvoTnmoTmg4XlhrXvvJrmn6Xor6IgdXVpZCDkuLroh6rliqjlm77pm4botYTmupDvvIzkuJTlr7nlupTlm77pm4bnlJ/miJDlpJrlvKDlpKflm77vvIznurnnkIbljovnvKnkvJrmnInlpJrkuKrlm77niYfmoLzlvI/ot6/lvoRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFJhd0Fzc2V0UGF0aHModXVpZDogc3RyaW5nKTogSVJhd0Fzc2V0UGF0aEluZm9bXSB7XHJcbiAgICAgICAgY29uc3QgYXNzZXRJbmZvID0gYnVpbGRBc3NldExpYnJhcnkuZ2V0QXNzZXQodXVpZCk7XHJcbiAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBidW5kbGVzID0gdGhpcy5fX3Rhc2suYnVuZGxlTWFuYWdlci5idW5kbGVzLmZpbHRlcigoYnVuZGxlKSA9PiBidW5kbGUuY29udGFpbnNBc3NldCh1dWlkLCB0cnVlKSk7XHJcbiAgICAgICAgaWYgKCFidW5kbGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBidW5kbGVzLmZsYXRNYXAoKGJ1bmRsZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZXM6IElSYXdBc3NldFBhdGhJbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgYnVuZGxlTmFtZTogYnVuZGxlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICByYXc6IFtdLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoYnVuZGxlLmdldFJlZGlyZWN0KHV1aWQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXMucmVkaXJlY3QgPSBidW5kbGUuZ2V0UmVkaXJlY3QodXVpZCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXMucmF3ID0gQnVuZGxlVXRpbHMuZ2V0UmF3QXNzZXRQYXRocyh1dWlkLCBidW5kbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghcmVzLnJhdy5sZW5ndGggJiYgIXJlcy5yZWRpcmVjdCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmjIflrpogdXVpZCDotYTmupDnmoTot6/lvoTnm7jlhbPkv6Hmga9cclxuICAgICAqIEByZXR1cm4gQXJyYXk8e3Jhdz86IHN0cmluZyB8IHN0cmluZ1tdOyBpbXBvcnQ/OiBzdHJpbmc7IGdyb3VwSW5kZXg/OiBudW1iZXI7fT5cclxuICAgICAqIEByZXR1cm4ucmF3OiDor6XotYTmupDmupDmlofku7bnmoTlrp7pmYXlrZjlgqjkvY3nva7vvIzlrZjlnKjlpJrkuKrkuLrmlbDnu4TvvIzkuI3lrZjlnKjliJnkuLrnqbpcclxuICAgICAqIEByZXR1cm4uaW1wb3J0OiDor6XotYTmupDluo/liJfljJbmlbDmja7nmoTlrp7pmYXlrZjlgqjkvY3nva7vvIzkuI3lrZjlnKjkuLrnqbrvvIzlj6/og73mmK8gLmJpbiDmiJbogIUgLmpzb24g5qC85byPXHJcbiAgICAgKiBAcmV0dXJuLmdyb3VwSW5kZXg6IOiLpeivpei1hOa6kOeahOW6j+WIl+WMluaVsOaNruWcqOafkOS4quWIhue7hOWGhe+8jOi/memHjOagh+ivhuWcqOWIhue7hOWGheeahCBpbmRleO+8jOS4jeWtmOWcqOS4uuepulxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0QXNzZXRQYXRoSW5mbyh1dWlkOiBzdHJpbmcpOiBJQXNzZXRQYXRoSW5mb1tdIHtcclxuICAgICAgICBjb25zdCBidW5kbGVzID0gdGhpcy5fX3Rhc2suYnVuZGxlTWFuYWdlci5idW5kbGVzLmZpbHRlcigoYnVuZGxlKSA9PiBidW5kbGUuY29udGFpbnNBc3NldCh1dWlkLCB0cnVlKSk7XHJcbiAgICAgICAgaWYgKCFidW5kbGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBidW5kbGVzLmZsYXRNYXAoKGJ1bmRsZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6IElBc3NldFBhdGhJbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgYnVuZGxlTmFtZTogYnVuZGxlLm5hbWUsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChidW5kbGUuZ2V0UmVkaXJlY3QodXVpZCkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5yZWRpcmVjdCA9IGJ1bmRsZS5nZXRSZWRpcmVjdCh1dWlkKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzdWx0LCBCdW5kbGVVdGlscy5nZXRBc3NldFBhdGhJbmZvKHV1aWQsIGJ1bmRsZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0LnJhdyAmJiAhcmVzdWx0LnJlZGlyZWN0ICYmICFyZXN1bHQuaW1wb3J0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBkZXByZWNhdGVkIHBsZWFzZSB1c2UgZ2V0SW1wb3J0QXNzZXRQYXRocyBpbnN0ZWFkXHJcbiAgICAgKiBAcGFyYW0gdXVpZCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEpzb25QYXRoSW5mbyh1dWlkOiBzdHJpbmcpOiBJSW1wb3J0QXNzZXRQYXRoSW5mb1tdIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oaTE4bi50KCdidWlsZGVyLndhcm4uZGVwcmVjYXRlZF90aXAnLCB7XHJcbiAgICAgICAgICAgIG9sZE5hbWU6ICdyZXN1bHQuZ2V0SnNvblBhdGhJbmZvJyxcclxuICAgICAgICAgICAgbmV3TmFtZTogJ3Jlc3VsdC5nZXRJbXBvcnRBc3NldFBhdGhzJyxcclxuICAgICAgICB9KSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW1wb3J0QXNzZXRQYXRocyh1dWlkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaMh+WumiB1dWlkIOi1hOa6kOeahOW6j+WIl+WMluS/oeaBr+WcqOaehOW7uuWQjueahOS/oeaBr1xyXG4gICAgICogQHBhcmFtIHV1aWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEltcG9ydEFzc2V0UGF0aHModXVpZDogc3RyaW5nKTogSUltcG9ydEFzc2V0UGF0aEluZm9bXSB7XHJcbiAgICAgICAgY29uc3QgYnVuZGxlcyA9IHRoaXMuX190YXNrLmJ1bmRsZU1hbmFnZXIuYnVuZGxlcy5maWx0ZXIoKGJ1bmRsZSkgPT4gYnVuZGxlLmNvbnRhaW5zQXNzZXQodXVpZCkpO1xyXG4gICAgICAgIGlmICghYnVuZGxlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYnVuZGxlcy5mbGF0TWFwKChidW5kbGUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBJSW1wb3J0QXNzZXRQYXRoSW5mbyA9IHtcclxuICAgICAgICAgICAgICAgIGJ1bmRsZU5hbWU6IGJ1bmRsZS5uYW1lLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoYnVuZGxlLmdldFJlZGlyZWN0KHV1aWQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucmVkaXJlY3QgPSBidW5kbGUuZ2V0UmVkaXJlY3QodXVpZCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmZvID0gQnVuZGxlVXRpbHMuZ2V0SW1wb3J0UGF0aEluZm8odXVpZCwgYnVuZGxlKTtcclxuICAgICAgICAgICAgICAgIGlmICghaW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzdWx0LCBpbmZvKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufSJdfQ==