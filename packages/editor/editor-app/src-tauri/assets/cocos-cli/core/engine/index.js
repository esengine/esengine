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
exports.Engine = void 0;
exports.initEngine = initEngine;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = require("path");
const configuration_1 = require("../configuration");
const assets_1 = require("../assets");
const layerMask = [];
for (let i = 0; i <= 19; i++) {
    layerMask[i] = 1 << i;
}
const Backends = {
    'physics-cannon': 'cannon.js',
    'physics-ammo': 'bullet',
    'physics-builtin': 'builtin',
    'physics-physx': 'physx',
};
const Backends2D = {
    'physics-2d-box2d': 'box2d',
    'physics-2d-box2d-wasm': 'box2d-wasm',
    'physics-2d-builtin': 'builtin',
};
// TODO issue 记录： https://github.com/cocos/3d-tasks/issues/18489 后续完善
// 后处理管线模块的开关，在图像设置那边处理 (说是 3.9 会彻底删除)
// 所以界面上的 勾选动作 和 状态判断 都要忽略这个列表的数据，从 3.8.6 开始我将这个 ignoreKeys 改成 ignoreModules 从 视图层移到主进程
// 直接在数据源上过滤掉，减少 视图层的判断
const ignoreModules = ['custom-pipeline-post-process'];
class EngineManager {
    _init = false;
    _info = {
        version: '3.8.8',
        tmpDir: '',
        typescript: {
            path: '',
            type: 'builtin',
            builtin: '',
        },
        native: {
            path: '',
            type: 'builtin',
            builtin: '',
        }
    };
    _config = this.defaultConfig;
    _configInstance;
    get defaultConfig() {
        return {
            includeModules: [
                '2d',
                '3d',
                'debug-renderer',
                'affine-transform',
                'animation',
                'audio',
                'base',
                'custom-pipeline',
                'dragon-bones',
                'gfx-webgl',
                'graphics',
                'intersection-2d',
                'light-probe',
                'marionette',
                'mask',
                'particle',
                'particle-2d',
                'physics-2d-box2d',
                'physics-ammo',
                'primitive',
                'profiler',
                'rich-text',
                'skeletal-animation',
                'spine-3.8',
                'terrain',
                'tiled-map',
                'tween',
                'ui',
                'ui-skew',
                'video',
                'websocket',
                'webview'
            ],
            flags: {
                LOAD_BULLET_MANUALLY: false,
                LOAD_SPINE_MANUALLY: false
            },
            physicsConfig: {
                gravity: { x: 0, y: -10, z: 0 },
                allowSleep: true,
                sleepThreshold: 0.1,
                autoSimulation: true,
                fixedTimeStep: 1 / 60,
                maxSubSteps: 1,
                defaultMaterial: '',
                useNodeChains: true,
                collisionMatrix: { 0: 1 },
                physicsEngine: '',
                physX: {
                    notPackPhysXLibs: false,
                    multiThread: false,
                    subThreadCount: 0,
                    epsilon: 0.0001,
                },
            },
            highQuality: false,
            customLayers: [],
            sortingLayers: [],
            macroCustom: [],
            // TODO 从 engine 内初始化
            macroConfig: {
                ENABLE_TILEDMAP_CULLING: true,
                TOUCH_TIMEOUT: 5000,
                ENABLE_TRANSPARENT_CANVAS: false,
                ENABLE_WEBGL_ANTIALIAS: true,
                ENABLE_FLOAT_OUTPUT: false,
                CLEANUP_IMAGE_CACHE: false,
                ENABLE_MULTI_TOUCH: true,
                MAX_LABEL_CANVAS_POOL_SIZE: 20,
                ENABLE_WEBGL_HIGHP_STRUCT_VALUES: false,
                BATCHER2D_MEM_INCREMENT: 144
            },
            customJointTextureLayouts: [],
            splashScreen: {
                displayRatio: 1,
                totalTime: 2000,
                logo: {
                    type: 'default',
                    image: ''
                },
                background: {
                    type: 'default',
                    color: {
                        x: 0.0156862745098039,
                        y: 0.0352941176470588,
                        z: 0.0392156862745098,
                        w: 1
                    },
                    image: ''
                },
                watermarkLocation: 'default',
                autoFit: true
            },
            designResolution: {
                width: 1280,
                height: 720,
                fitWidth: true,
                fitHeight: false
            },
            downloadMaxConcurrency: 15,
            renderPipeline: 'fd8ec536-a354-4a17-9c74-4f3883c378c8',
        };
    }
    /**
     * TODO init data in register project modules
     */
    moduleConfigCache = {
        moduleDependMap: {}, // 依赖关系
        moduleDependedMap: {}, // 被依赖的关系
        nativeCodeModules: [], // 原生模块(构建功能需要用到)
        moduleCmakeConfig: {}, // 模块的 cmake 配置 3.8.6 从 moduleConfig 挪到这边
        features: {}, // 引擎提供的所有选项(包括选项的 options)
        // 用于界面渲染的数据
        moduleTreeDump: {
            default: {},
            categories: {},
        },
        ignoreModules: ignoreModules,
        envLimitModule: {}, // 记录有环境限制的模块数据
    };
    get type() {
        return this._config.includeModules.includes('3d') ? '3d' : '2d';
    }
    getInfo() {
        if (!this._init) {
            throw new Error('Engine not init');
        }
        return this._info;
    }
    getConfig(useDefault) {
        if (useDefault) {
            return this.defaultConfig;
        }
        if (!this._init) {
            throw new Error('Engine not init');
        }
        return this._config;
    }
    // TODO 对外开发一些 compile 已写好的接口
    /**
     * TODO 初始化配置等
     */
    async init(enginePath) {
        if (this._init) {
            return this;
        }
        this._info.typescript.builtin = this._info.typescript.path = enginePath;
        this._info.native.builtin = this._info.native.path = (0, path_1.join)(enginePath, 'native');
        this._info.version = await Promise.resolve(`${(0, path_1.join)(enginePath, 'package.json')}`).then(s => __importStar(require(s))).then((pkg) => pkg.version);
        this._info.tmpDir = (0, path_1.join)(enginePath, '.temp');
        const configInstance = await configuration_1.configurationRegistry.register('engine', this.defaultConfig);
        this._configInstance = configInstance;
        this._init = true;
        await this.updateConfig();
        return this;
    }
    async updateConfig() {
        const projectConfig = await this._configInstance.get();
        this._config = projectConfig;
        if (!projectConfig.configs || Object.keys(projectConfig.configs).length === 0) {
            return this;
        }
        const globalConfigKey = projectConfig.globalConfigKey || Object.keys(projectConfig.configs)[0];
        this._config.includeModules = projectConfig.configs[globalConfigKey].includeModules;
        this._config.flags = projectConfig.configs[globalConfigKey].flags;
        this._config.noDeprecatedFeatures = projectConfig.configs[globalConfigKey].noDeprecatedFeatures;
    }
    async importEditorExtensions() {
        // @ts-ignore
        globalThis.EditorExtends = await Promise.resolve().then(() => __importStar(require('./editor-extends')));
        // 注意：目前 utils 用的是 UUID，EditorExtends 用的是 Uuid 
        // @ts-ignore
        globalThis.EditorExtends.UuidUtils.compressUuid = globalThis.EditorExtends.UuidUtils.compressUUID;
    }
    async initEditorExtensions() {
        // @ts-ignore
        globalThis.EditorExtends.init();
    }
    /**
     * 加载以及初始化引擎环境
     * @param info 初始化引擎数据
     * @param onBeforeGameInit - 在初始化之前需要做的工作
     * @param onAfterGameInit - 在初始化之后需要做的工作
     */
    async initEngine(info, onBeforeGameInit, onAfterGameInit) {
        const { default: preload } = await Promise.resolve().then(() => __importStar(require('cc/preload')));
        await this.importEditorExtensions();
        await preload({
            engineRoot: this._info.typescript.path,
            engineDev: (0, path_1.join)(this._info.typescript.path, 'bin', '.cache', 'dev-cli'),
            writablePath: info.writablePath,
            requiredModules: [
                'cc',
                'cc/editor/populate-internal-constants',
                'cc/editor/serialization',
                'cc/editor/new-gen-anim',
                'cc/editor/embedded-player',
                'cc/editor/reflection-probe',
                'cc/editor/lod-group-utils',
                'cc/editor/material',
                'cc/editor/2d-misc',
                'cc/editor/offline-mappings',
                'cc/editor/custom-pipeline',
                'cc/editor/animation-clip-migration',
                'cc/editor/exotic-animation',
                'cc/editor/color-utils',
            ]
        });
        await this.initEditorExtensions();
        const modules = this.getConfig().includeModules || [];
        const { physicsConfig, macroConfig, customLayers, sortingLayers, highQuality } = this.getConfig();
        const bundles = assets_1.assetManager.queryAssets({ isBundle: true }).map((item) => item.meta?.userData?.bundleName ?? item.name);
        const builtinAssets = info.serverURL && await this.queryInternalAssetList(this.getInfo().typescript.path);
        const defaultConfig = {
            debugMode: cc.debug.DebugMode.WARN,
            overrideSettings: {
                engine: {
                    builtinAssets: builtinAssets || [],
                    macros: macroConfig,
                    sortingLayers,
                    customLayers: customLayers.map((layer) => {
                        const index = layerMask.findIndex((num) => { return layer.value === num; });
                        return {
                            name: layer.name,
                            bit: index,
                        };
                    }),
                },
                profiling: {
                    showFPS: false,
                },
                screen: {
                    frameRate: 30,
                    exactFitScreen: true,
                },
                rendering: {
                    renderMode: 3,
                    highQualityMode: highQuality,
                },
                physics: {
                    ...physicsConfig,
                    // 物理引擎如果没有明确设置，默认是开启的，因此需要明确定义为false
                    enabled: !!info.serverURL ? true : false,
                },
                assets: {
                    importBase: info.importBase,
                    nativeBase: info.nativeBase,
                    remoteBundles: ['internal', 'main'].concat(bundles),
                    server: info.serverURL,
                }
            },
            exactFitScreen: true,
        };
        cc.physics.selector.runInEditor = true;
        if (onBeforeGameInit) {
            await onBeforeGameInit();
        }
        await cc.game.init(defaultConfig);
        if (onAfterGameInit) {
            await onAfterGameInit();
        }
        let backend = 'builtin';
        let backend2d = 'builtin';
        modules.forEach((module) => {
            if (module in Backends) {
                // @ts-ignore
                backend = Backends[module];
            }
            else if (module in Backends2D) {
                // @ts-ignore
                backend2d = Backends2D[module];
            }
        });
        // 切换物理引擎
        cc.physics.selector.switchTo(backend);
        // 禁用计算，避免刚体在tick的时候生效
        // cc.physics.PhysicsSystem.instance.enable = false;
        // @ts-ignore
        // window.cc.internal.physics2d.selector.switchTo(backend2d);
        return this;
    }
    async queryInternalAssetList(enginePath) {
        // 添加引擎依赖的预加载内置资源到主包内
        const ccConfigJson = await fs_extra_1.default.readJSON((0, path_1.join)(enginePath, 'cc.config.json'));
        const internalAssets = [];
        for (const featureName in ccConfigJson.features) {
            if (ccConfigJson.features[featureName].dependentAssets) {
                internalAssets.push(...ccConfigJson.features[featureName].dependentAssets);
            }
        }
        return Array.from(new Set(internalAssets));
    }
    /**
     * TODO
     * @returns
     */
    queryModuleConfig() {
        return this.moduleConfigCache;
    }
}
const Engine = new EngineManager();
exports.Engine = Engine;
/**
 * 初始化 engine
 * @param enginePath
 * @param projectPath
 * @param serverURL
 */
async function initEngine(enginePath, projectPath, serverURL) {
    await Engine.init(enginePath);
    // 这里 importBase 与 nativeBase 用服务器是为了让服务器转换资源真实存放的路径
    await Engine.initEngine({
        serverURL: serverURL,
        importBase: serverURL ?? (0, path_1.join)(projectPath, 'library'),
        nativeBase: serverURL ?? (0, path_1.join)(projectPath, 'library'),
        writablePath: (0, path_1.join)(projectPath, 'temp'),
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9lbmdpbmUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdVlBLGdDQVNDO0FBaFpELHdEQUEyQjtBQUkzQiwrQkFBNEI7QUFDNUIsb0RBQTZFO0FBQzdFLHNDQUF5QztBQWF6QyxNQUFNLFNBQVMsR0FBYSxFQUFFLENBQUM7QUFDL0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQzNCLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFCLENBQUM7QUFFRCxNQUFNLFFBQVEsR0FBRztJQUNiLGdCQUFnQixFQUFFLFdBQVc7SUFDN0IsY0FBYyxFQUFFLFFBQVE7SUFDeEIsaUJBQWlCLEVBQUUsU0FBUztJQUM1QixlQUFlLEVBQUUsT0FBTztDQUMzQixDQUFDO0FBRUYsTUFBTSxVQUFVLEdBQUc7SUFDZixrQkFBa0IsRUFBRSxPQUFPO0lBQzNCLHVCQUF1QixFQUFFLFlBQVk7SUFDckMsb0JBQW9CLEVBQUUsU0FBUztDQUNsQyxDQUFDO0FBRUYscUVBQXFFO0FBQ3JFLHNDQUFzQztBQUN0Qyx1RkFBdUY7QUFDdkYsdUJBQXVCO0FBQ3ZCLE1BQU0sYUFBYSxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUN2RCxNQUFNLGFBQWE7SUFDUCxLQUFLLEdBQVksS0FBSyxDQUFDO0lBQ3ZCLEtBQUssR0FBZTtRQUN4QixPQUFPLEVBQUUsT0FBTztRQUNoQixNQUFNLEVBQUUsRUFBRTtRQUNWLFVBQVUsRUFBRTtZQUNSLElBQUksRUFBRSxFQUFFO1lBQ1IsSUFBSSxFQUFFLFNBQVM7WUFDZixPQUFPLEVBQUUsRUFBRTtTQUNkO1FBQ0QsTUFBTSxFQUFFO1lBQ0os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U0FBUyxJQUFJLElBQUEsV0FBSSxFQUFDLFdBQVcsRUFBRSxTQUFTLENBQUM7UUFDckQsWUFBWSxFQUFFLElBQUEsV0FBSSxFQUFDLFdBQVcsRUFBRSxNQUFNLENBQUM7S0FDMUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmc2UgZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBFbmdpbmVJbmZvIH0gZnJvbSAnLi9AdHlwZXMvcHVibGljJztcclxuaW1wb3J0IHsgSUVuZ2luZUNvbmZpZywgSUVuZ2luZVByb2plY3RDb25maWcsIElJbml0RW5naW5lSW5mbyB9IGZyb20gJy4vQHR5cGVzL2NvbmZpZyc7XHJcbmltcG9ydCB7IElNb2R1bGVDb25maWcgfSBmcm9tICcuL0B0eXBlcy9tb2R1bGVzJztcclxuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBjb25maWd1cmF0aW9uUmVnaXN0cnksIElCYXNlQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uL2NvbmZpZ3VyYXRpb24nO1xyXG5pbXBvcnQgeyBhc3NldE1hbmFnZXIgfSBmcm9tICcuLi9hc3NldHMnO1xyXG5cclxuLyoqXHJcbiAqIOaVtOWQiCBlbmdpbmUg55qE5LiA5Lqb57yW6K+R44CB6YWN572u6K+75Y+W562J5Yqf6IO9XHJcbiAqL1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJRW5naW5lIHtcclxuICAgIGdldEluZm8oKTogRW5naW5lSW5mbztcclxuICAgIGdldENvbmZpZygpOiBJRW5naW5lQ29uZmlnO1xyXG4gICAgaW5pdChlbmdpbmVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHRoaXM+O1xyXG4gICAgaW5pdEVuZ2luZShpbmZvOiBJSW5pdEVuZ2luZUluZm8pOiBQcm9taXNlPHRoaXM+O1xyXG59XHJcblxyXG5jb25zdCBsYXllck1hc2s6IG51bWJlcltdID0gW107XHJcbmZvciAobGV0IGkgPSAwOyBpIDw9IDE5OyBpKyspIHtcclxuICAgIGxheWVyTWFza1tpXSA9IDEgPDwgaTtcclxufVxyXG5cclxuY29uc3QgQmFja2VuZHMgPSB7XHJcbiAgICAncGh5c2ljcy1jYW5ub24nOiAnY2Fubm9uLmpzJyxcclxuICAgICdwaHlzaWNzLWFtbW8nOiAnYnVsbGV0JyxcclxuICAgICdwaHlzaWNzLWJ1aWx0aW4nOiAnYnVpbHRpbicsXHJcbiAgICAncGh5c2ljcy1waHlzeCc6ICdwaHlzeCcsXHJcbn07XHJcblxyXG5jb25zdCBCYWNrZW5kczJEID0ge1xyXG4gICAgJ3BoeXNpY3MtMmQtYm94MmQnOiAnYm94MmQnLFxyXG4gICAgJ3BoeXNpY3MtMmQtYm94MmQtd2FzbSc6ICdib3gyZC13YXNtJyxcclxuICAgICdwaHlzaWNzLTJkLWJ1aWx0aW4nOiAnYnVpbHRpbicsXHJcbn07XHJcblxyXG4vLyBUT0RPIGlzc3VlIOiusOW9le+8miBodHRwczovL2dpdGh1Yi5jb20vY29jb3MvM2QtdGFza3MvaXNzdWVzLzE4NDg5IOWQjue7reWujOWWhFxyXG4vLyDlkI7lpITnkIbnrqHnur/mqKHlnZfnmoTlvIDlhbPvvIzlnKjlm77lg4/orr7nva7pgqPovrnlpITnkIYgKOivtOaYryAzLjkg5Lya5b275bqV5Yig6ZmkKVxyXG4vLyDmiYDku6XnlYzpnaLkuIrnmoQg5Yu+6YCJ5Yqo5L2cIOWSjCDnirbmgIHliKTmlq0g6YO96KaB5b+955Wl6L+Z5Liq5YiX6KGo55qE5pWw5o2u77yM5LuOIDMuOC42IOW8gOWni+aIkeWwhui/meS4qiBpZ25vcmVLZXlzIOaUueaIkCBpZ25vcmVNb2R1bGVzIOS7jiDop4blm77lsYLnp7vliLDkuLvov5vnqItcclxuLy8g55u05o6l5Zyo5pWw5o2u5rqQ5LiK6L+H5ruk5o6J77yM5YeP5bCRIOinhuWbvuWxgueahOWIpOaWrVxyXG5jb25zdCBpZ25vcmVNb2R1bGVzID0gWydjdXN0b20tcGlwZWxpbmUtcG9zdC1wcm9jZXNzJ107XHJcbmNsYXNzIEVuZ2luZU1hbmFnZXIgaW1wbGVtZW50cyBJRW5naW5lIHtcclxuICAgIHByaXZhdGUgX2luaXQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX2luZm86IEVuZ2luZUluZm8gPSB7XHJcbiAgICAgICAgdmVyc2lvbjogJzMuOC44JyxcclxuICAgICAgICB0bXBEaXI6ICcnLFxyXG4gICAgICAgIHR5cGVzY3JpcHQ6IHtcclxuICAgICAgICAgICAgcGF0aDogJycsXHJcbiAgICAgICAgICAgIHR5cGU6ICdidWlsdGluJyxcclxuICAgICAgICAgICAgYnVpbHRpbjogJycsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBuYXRpdmU6IHtcclxuICAgICAgICAgICAgcGF0aDogJycsXHJcbiAgICAgICAgICAgIHR5cGU6ICdidWlsdGluJyxcclxuICAgICAgICAgICAgYnVpbHRpbjogJycsXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX2NvbmZpZzogSUVuZ2luZUNvbmZpZyA9IHRoaXMuZGVmYXVsdENvbmZpZztcclxuICAgIHByaXZhdGUgX2NvbmZpZ0luc3RhbmNlITogSUJhc2VDb25maWd1cmF0aW9uO1xyXG5cclxuICAgIHByaXZhdGUgZ2V0IGRlZmF1bHRDb25maWcoKTogSUVuZ2luZUNvbmZpZyB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaW5jbHVkZU1vZHVsZXM6IFtcclxuICAgICAgICAgICAgICAgICcyZCcsXHJcbiAgICAgICAgICAgICAgICAnM2QnLFxyXG4gICAgICAgICAgICAgICAgJ2RlYnVnLXJlbmRlcmVyJyxcclxuICAgICAgICAgICAgICAgICdhZmZpbmUtdHJhbnNmb3JtJyxcclxuICAgICAgICAgICAgICAgICdhbmltYXRpb24nLFxyXG4gICAgICAgICAgICAgICAgJ2F1ZGlvJyxcclxuICAgICAgICAgICAgICAgICdiYXNlJyxcclxuICAgICAgICAgICAgICAgICdjdXN0b20tcGlwZWxpbmUnLFxyXG4gICAgICAgICAgICAgICAgJ2RyYWdvbi1ib25lcycsXHJcbiAgICAgICAgICAgICAgICAnZ2Z4LXdlYmdsJyxcclxuICAgICAgICAgICAgICAgICdncmFwaGljcycsXHJcbiAgICAgICAgICAgICAgICAnaW50ZXJzZWN0aW9uLTJkJyxcclxuICAgICAgICAgICAgICAgICdsaWdodC1wcm9iZScsXHJcbiAgICAgICAgICAgICAgICAnbWFyaW9uZXR0ZScsXHJcbiAgICAgICAgICAgICAgICAnbWFzaycsXHJcbiAgICAgICAgICAgICAgICAncGFydGljbGUnLFxyXG4gICAgICAgICAgICAgICAgJ3BhcnRpY2xlLTJkJyxcclxuICAgICAgICAgICAgICAgICdwaHlzaWNzLTJkLWJveDJkJyxcclxuICAgICAgICAgICAgICAgICdwaHlzaWNzLWFtbW8nLFxyXG4gICAgICAgICAgICAgICAgJ3ByaW1pdGl2ZScsXHJcbiAgICAgICAgICAgICAgICAncHJvZmlsZXInLFxyXG4gICAgICAgICAgICAgICAgJ3JpY2gtdGV4dCcsXHJcbiAgICAgICAgICAgICAgICAnc2tlbGV0YWwtYW5pbWF0aW9uJyxcclxuICAgICAgICAgICAgICAgICdzcGluZS0zLjgnLFxyXG4gICAgICAgICAgICAgICAgJ3RlcnJhaW4nLFxyXG4gICAgICAgICAgICAgICAgJ3RpbGVkLW1hcCcsXHJcbiAgICAgICAgICAgICAgICAndHdlZW4nLFxyXG4gICAgICAgICAgICAgICAgJ3VpJyxcclxuICAgICAgICAgICAgICAgICd1aS1za2V3JyxcclxuICAgICAgICAgICAgICAgICd2aWRlbycsXHJcbiAgICAgICAgICAgICAgICAnd2Vic29ja2V0JyxcclxuICAgICAgICAgICAgICAgICd3ZWJ2aWV3J1xyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBmbGFnczoge1xyXG4gICAgICAgICAgICAgICAgTE9BRF9CVUxMRVRfTUFOVUFMTFk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgTE9BRF9TUElORV9NQU5VQUxMWTogZmFsc2VcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcGh5c2ljc0NvbmZpZzoge1xyXG4gICAgICAgICAgICAgICAgZ3Jhdml0eTogeyB4OiAwLCB5OiAtMTAsIHo6IDAgfSxcclxuICAgICAgICAgICAgICAgIGFsbG93U2xlZXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzbGVlcFRocmVzaG9sZDogMC4xLFxyXG4gICAgICAgICAgICAgICAgYXV0b1NpbXVsYXRpb246IHRydWUsXHJcbiAgICAgICAgICAgICAgICBmaXhlZFRpbWVTdGVwOiAxIC8gNjAsXHJcbiAgICAgICAgICAgICAgICBtYXhTdWJTdGVwczogMSxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRNYXRlcmlhbDogJycsXHJcbiAgICAgICAgICAgICAgICB1c2VOb2RlQ2hhaW5zOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uTWF0cml4OiB7IDA6IDEgfSxcclxuICAgICAgICAgICAgICAgIHBoeXNpY3NFbmdpbmU6ICcnLFxyXG4gICAgICAgICAgICAgICAgcGh5c1g6IHtcclxuICAgICAgICAgICAgICAgICAgICBub3RQYWNrUGh5c1hMaWJzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBtdWx0aVRocmVhZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgc3ViVGhyZWFkQ291bnQ6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgZXBzaWxvbjogMC4wMDAxLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaGlnaFF1YWxpdHk6IGZhbHNlLFxyXG4gICAgICAgICAgICBjdXN0b21MYXllcnM6IFtdLFxyXG4gICAgICAgICAgICBzb3J0aW5nTGF5ZXJzOiBbXSxcclxuICAgICAgICAgICAgbWFjcm9DdXN0b206IFtdLFxyXG4gICAgICAgICAgICAvLyBUT0RPIOS7jiBlbmdpbmUg5YaF5Yid5aeL5YyWXHJcbiAgICAgICAgICAgIG1hY3JvQ29uZmlnOiB7XHJcbiAgICAgICAgICAgICAgICBFTkFCTEVfVElMRURNQVBfQ1VMTElORzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIFRPVUNIX1RJTUVPVVQ6IDUwMDAsXHJcbiAgICAgICAgICAgICAgICBFTkFCTEVfVFJBTlNQQVJFTlRfQ0FOVkFTOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIEVOQUJMRV9XRUJHTF9BTlRJQUxJQVM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBFTkFCTEVfRkxPQVRfT1VUUFVUOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIENMRUFOVVBfSU1BR0VfQ0FDSEU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgRU5BQkxFX01VTFRJX1RPVUNIOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgTUFYX0xBQkVMX0NBTlZBU19QT09MX1NJWkU6IDIwLFxyXG4gICAgICAgICAgICAgICAgRU5BQkxFX1dFQkdMX0hJR0hQX1NUUlVDVF9WQUxVRVM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgQkFUQ0hFUjJEX01FTV9JTkNSRU1FTlQ6IDE0NFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjdXN0b21Kb2ludFRleHR1cmVMYXlvdXRzOiBbXSxcclxuICAgICAgICAgICAgc3BsYXNoU2NyZWVuOiB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5UmF0aW86IDEsXHJcbiAgICAgICAgICAgICAgICB0b3RhbFRpbWU6IDIwMDAsXHJcbiAgICAgICAgICAgICAgICBsb2dvOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RlZmF1bHQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlOiAnJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZGVmYXVsdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeDogMC4wMTU2ODYyNzQ1MDk4MDM5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiAwLjAzNTI5NDExNzY0NzA1ODgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHo6IDAuMDM5MjE1Njg2Mjc0NTA5OCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdzogMVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2U6ICcnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0ZXJtYXJrTG9jYXRpb246ICdkZWZhdWx0JyxcclxuICAgICAgICAgICAgICAgIGF1dG9GaXQ6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVzaWduUmVzb2x1dGlvbjoge1xyXG4gICAgICAgICAgICAgICAgd2lkdGg6IDEyODAsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDcyMCxcclxuICAgICAgICAgICAgICAgIGZpdFdpZHRoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZml0SGVpZ2h0OiBmYWxzZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkb3dubG9hZE1heENvbmN1cnJlbmN5OiAxNSxcclxuICAgICAgICAgICAgcmVuZGVyUGlwZWxpbmU6ICdmZDhlYzUzNi1hMzU0LTRhMTctOWM3NC00ZjM4ODNjMzc4YzgnLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUT0RPIGluaXQgZGF0YSBpbiByZWdpc3RlciBwcm9qZWN0IG1vZHVsZXNcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBtb2R1bGVDb25maWdDYWNoZTogSU1vZHVsZUNvbmZpZyA9IHtcclxuICAgICAgICBtb2R1bGVEZXBlbmRNYXA6IHt9LCAvLyDkvp3otZblhbPns7tcclxuICAgICAgICBtb2R1bGVEZXBlbmRlZE1hcDoge30sIC8vIOiiq+S+nei1lueahOWFs+ezu1xyXG4gICAgICAgIG5hdGl2ZUNvZGVNb2R1bGVzOiBbXSwgLy8g5Y6f55Sf5qih5Z2XKOaehOW7uuWKn+iDvemcgOimgeeUqOWIsClcclxuICAgICAgICBtb2R1bGVDbWFrZUNvbmZpZzoge30sIC8vIOaooeWdl+eahCBjbWFrZSDphY3nva4gMy44LjYg5LuOIG1vZHVsZUNvbmZpZyDmjKrliLDov5novrlcclxuICAgICAgICBmZWF0dXJlczoge30sIC8vIOW8leaTjuaPkOS+m+eahOaJgOaciemAiemhuSjljIXmi6zpgInpobnnmoQgb3B0aW9ucylcclxuICAgICAgICAvLyDnlKjkuo7nlYzpnaLmuLLmn5PnmoTmlbDmja5cclxuICAgICAgICBtb2R1bGVUcmVlRHVtcDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiB7fSxcclxuICAgICAgICAgICAgY2F0ZWdvcmllczoge30sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBpZ25vcmVNb2R1bGVzOiBpZ25vcmVNb2R1bGVzLFxyXG4gICAgICAgIGVudkxpbWl0TW9kdWxlOiB7fSwgLy8g6K6w5b2V5pyJ546v5aKD6ZmQ5Yi255qE5qih5Z2X5pWw5o2uXHJcbiAgICB9O1xyXG5cclxuICAgIGdldCB0eXBlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jb25maWcuaW5jbHVkZU1vZHVsZXMuaW5jbHVkZXMoJzNkJykgPyAnM2QnIDogJzJkJztcclxuICAgIH1cclxuXHJcbiAgICBnZXRJbmZvKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VuZ2luZSBub3QgaW5pdCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5faW5mbztcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb25maWcodXNlRGVmYXVsdD86IGJvb2xlYW4pOiBJRW5naW5lQ29uZmlnIHtcclxuICAgICAgICBpZiAodXNlRGVmYXVsdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZWZhdWx0Q29uZmlnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuX2luaXQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbmdpbmUgbm90IGluaXQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZztcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPIOWvueWkluW8gOWPkeS4gOS6myBjb21waWxlIOW3suWGmeWlveeahOaOpeWPo1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVE9ETyDliJ3lp4vljJbphY3nva7nrYlcclxuICAgICAqL1xyXG4gICAgYXN5bmMgaW5pdChlbmdpbmVQYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAodGhpcy5faW5pdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faW5mby50eXBlc2NyaXB0LmJ1aWx0aW4gPSB0aGlzLl9pbmZvLnR5cGVzY3JpcHQucGF0aCA9IGVuZ2luZVBhdGg7XHJcbiAgICAgICAgdGhpcy5faW5mby5uYXRpdmUuYnVpbHRpbiA9IHRoaXMuX2luZm8ubmF0aXZlLnBhdGggPSBqb2luKGVuZ2luZVBhdGgsICduYXRpdmUnKTtcclxuICAgICAgICB0aGlzLl9pbmZvLnZlcnNpb24gPSBhd2FpdCBpbXBvcnQoam9pbihlbmdpbmVQYXRoLCAncGFja2FnZS5qc29uJykpLnRoZW4oKHBrZykgPT4gcGtnLnZlcnNpb24pO1xyXG4gICAgICAgIHRoaXMuX2luZm8udG1wRGlyID0gam9pbihlbmdpbmVQYXRoLCAnLnRlbXAnKTtcclxuICAgICAgICBjb25zdCBjb25maWdJbnN0YW5jZSA9IGF3YWl0IGNvbmZpZ3VyYXRpb25SZWdpc3RyeS5yZWdpc3RlcignZW5naW5lJywgdGhpcy5kZWZhdWx0Q29uZmlnKTtcclxuICAgICAgICB0aGlzLl9jb25maWdJbnN0YW5jZSA9IGNvbmZpZ0luc3RhbmNlO1xyXG4gICAgICAgIHRoaXMuX2luaXQgPSB0cnVlO1xyXG4gICAgICAgIGF3YWl0IHRoaXMudXBkYXRlQ29uZmlnKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgdXBkYXRlQ29uZmlnKCkge1xyXG4gICAgICAgIGNvbnN0IHByb2plY3RDb25maWcgPSBhd2FpdCB0aGlzLl9jb25maWdJbnN0YW5jZS5nZXQ8SUVuZ2luZVByb2plY3RDb25maWc+KCk7XHJcbiAgICAgICAgdGhpcy5fY29uZmlnID0gcHJvamVjdENvbmZpZztcclxuICAgICAgICBpZiAoIXByb2plY3RDb25maWcuY29uZmlncyB8fCBPYmplY3Qua2V5cyhwcm9qZWN0Q29uZmlnLmNvbmZpZ3MpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZ2xvYmFsQ29uZmlnS2V5ID0gcHJvamVjdENvbmZpZy5nbG9iYWxDb25maWdLZXkgfHwgT2JqZWN0LmtleXMocHJvamVjdENvbmZpZy5jb25maWdzKVswXTtcclxuICAgICAgICB0aGlzLl9jb25maWcuaW5jbHVkZU1vZHVsZXMgPSBwcm9qZWN0Q29uZmlnLmNvbmZpZ3NbZ2xvYmFsQ29uZmlnS2V5XS5pbmNsdWRlTW9kdWxlcztcclxuICAgICAgICB0aGlzLl9jb25maWcuZmxhZ3MgPSBwcm9qZWN0Q29uZmlnLmNvbmZpZ3NbZ2xvYmFsQ29uZmlnS2V5XS5mbGFncztcclxuICAgICAgICB0aGlzLl9jb25maWcubm9EZXByZWNhdGVkRmVhdHVyZXMgPSBwcm9qZWN0Q29uZmlnLmNvbmZpZ3NbZ2xvYmFsQ29uZmlnS2V5XS5ub0RlcHJlY2F0ZWRGZWF0dXJlcztcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBpbXBvcnRFZGl0b3JFeHRlbnNpb25zKCkge1xyXG5cclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgZ2xvYmFsVGhpcy5FZGl0b3JFeHRlbmRzID0gYXdhaXQgaW1wb3J0KCcuL2VkaXRvci1leHRlbmRzJyk7XHJcbiAgICAgICAgLy8g5rOo5oSP77ya55uu5YmNIHV0aWxzIOeUqOeahOaYryBVVUlE77yMRWRpdG9yRXh0ZW5kcyDnlKjnmoTmmK8gVXVpZCBcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgZ2xvYmFsVGhpcy5FZGl0b3JFeHRlbmRzLlV1aWRVdGlscy5jb21wcmVzc1V1aWQgPSBnbG9iYWxUaGlzLkVkaXRvckV4dGVuZHMuVXVpZFV0aWxzLmNvbXByZXNzVVVJRDtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBpbml0RWRpdG9yRXh0ZW5zaW9ucygpIHtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgZ2xvYmFsVGhpcy5FZGl0b3JFeHRlbmRzLmluaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9veS7peWPiuWIneWni+WMluW8leaTjueOr+Wig1xyXG4gICAgICogQHBhcmFtIGluZm8g5Yid5aeL5YyW5byV5pOO5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gb25CZWZvcmVHYW1lSW5pdCAtIOWcqOWIneWni+WMluS5i+WJjemcgOimgeWBmueahOW3peS9nFxyXG4gICAgICogQHBhcmFtIG9uQWZ0ZXJHYW1lSW5pdCAtIOWcqOWIneWni+WMluS5i+WQjumcgOimgeWBmueahOW3peS9nFxyXG4gICAgICovXHJcbiAgICBhc3luYyBpbml0RW5naW5lKGluZm86IElJbml0RW5naW5lSW5mbywgb25CZWZvcmVHYW1lSW5pdD86ICgpID0+IFByb21pc2U8dm9pZD4sIG9uQWZ0ZXJHYW1lSW5pdD86ICgpID0+IFByb21pc2U8dm9pZD4pIHtcclxuICAgICAgICBjb25zdCB7IGRlZmF1bHQ6IHByZWxvYWQgfSA9IGF3YWl0IGltcG9ydCgnY2MvcHJlbG9hZCcpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuaW1wb3J0RWRpdG9yRXh0ZW5zaW9ucygpO1xyXG4gICAgICAgIGF3YWl0IHByZWxvYWQoe1xyXG4gICAgICAgICAgICBlbmdpbmVSb290OiB0aGlzLl9pbmZvLnR5cGVzY3JpcHQucGF0aCxcclxuICAgICAgICAgICAgZW5naW5lRGV2OiBqb2luKHRoaXMuX2luZm8udHlwZXNjcmlwdC5wYXRoLCAnYmluJywgJy5jYWNoZScsICdkZXYtY2xpJyksXHJcbiAgICAgICAgICAgIHdyaXRhYmxlUGF0aDogaW5mby53cml0YWJsZVBhdGgsXHJcbiAgICAgICAgICAgIHJlcXVpcmVkTW9kdWxlczogW1xyXG4gICAgICAgICAgICAgICAgJ2NjJyxcclxuICAgICAgICAgICAgICAgICdjYy9lZGl0b3IvcG9wdWxhdGUtaW50ZXJuYWwtY29uc3RhbnRzJyxcclxuICAgICAgICAgICAgICAgICdjYy9lZGl0b3Ivc2VyaWFsaXphdGlvbicsXHJcbiAgICAgICAgICAgICAgICAnY2MvZWRpdG9yL25ldy1nZW4tYW5pbScsXHJcbiAgICAgICAgICAgICAgICAnY2MvZWRpdG9yL2VtYmVkZGVkLXBsYXllcicsXHJcbiAgICAgICAgICAgICAgICAnY2MvZWRpdG9yL3JlZmxlY3Rpb24tcHJvYmUnLFxyXG4gICAgICAgICAgICAgICAgJ2NjL2VkaXRvci9sb2QtZ3JvdXAtdXRpbHMnLFxyXG4gICAgICAgICAgICAgICAgJ2NjL2VkaXRvci9tYXRlcmlhbCcsXHJcbiAgICAgICAgICAgICAgICAnY2MvZWRpdG9yLzJkLW1pc2MnLFxyXG4gICAgICAgICAgICAgICAgJ2NjL2VkaXRvci9vZmZsaW5lLW1hcHBpbmdzJyxcclxuICAgICAgICAgICAgICAgICdjYy9lZGl0b3IvY3VzdG9tLXBpcGVsaW5lJyxcclxuICAgICAgICAgICAgICAgICdjYy9lZGl0b3IvYW5pbWF0aW9uLWNsaXAtbWlncmF0aW9uJyxcclxuICAgICAgICAgICAgICAgICdjYy9lZGl0b3IvZXhvdGljLWFuaW1hdGlvbicsXHJcbiAgICAgICAgICAgICAgICAnY2MvZWRpdG9yL2NvbG9yLXV0aWxzJyxcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdEVkaXRvckV4dGVuc2lvbnMoKTtcclxuXHJcbiAgICAgICAgY29uc3QgbW9kdWxlcyA9IHRoaXMuZ2V0Q29uZmlnKCkuaW5jbHVkZU1vZHVsZXMgfHwgW107XHJcbiAgICAgICAgY29uc3QgeyBwaHlzaWNzQ29uZmlnLCBtYWNyb0NvbmZpZywgY3VzdG9tTGF5ZXJzLCBzb3J0aW5nTGF5ZXJzLCBoaWdoUXVhbGl0eSB9ID0gdGhpcy5nZXRDb25maWcoKTtcclxuICAgICAgICBjb25zdCBidW5kbGVzID0gYXNzZXRNYW5hZ2VyLnF1ZXJ5QXNzZXRzKHsgaXNCdW5kbGU6IHRydWUgfSkubWFwKChpdGVtOiBhbnkpID0+IGl0ZW0ubWV0YT8udXNlckRhdGE/LmJ1bmRsZU5hbWUgPz8gaXRlbS5uYW1lKTtcclxuICAgICAgICBjb25zdCBidWlsdGluQXNzZXRzID0gaW5mby5zZXJ2ZXJVUkwgJiYgYXdhaXQgdGhpcy5xdWVyeUludGVybmFsQXNzZXRMaXN0KHRoaXMuZ2V0SW5mbygpLnR5cGVzY3JpcHQucGF0aCk7XHJcbiAgICAgICAgY29uc3QgZGVmYXVsdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgZGVidWdNb2RlOiBjYy5kZWJ1Zy5EZWJ1Z01vZGUuV0FSTixcclxuICAgICAgICAgICAgb3ZlcnJpZGVTZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgZW5naW5lOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnVpbHRpbkFzc2V0czogYnVpbHRpbkFzc2V0cyB8fCBbXSxcclxuICAgICAgICAgICAgICAgICAgICBtYWNyb3M6IG1hY3JvQ29uZmlnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRpbmdMYXllcnMsXHJcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tTGF5ZXJzOiBjdXN0b21MYXllcnMubWFwKChsYXllcjogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gbGF5ZXJNYXNrLmZpbmRJbmRleCgobnVtKSA9PiB7IHJldHVybiBsYXllci52YWx1ZSA9PT0gbnVtOyB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGxheWVyLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiaXQ6IGluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHByb2ZpbGluZzoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3dGUFM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNjcmVlbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGZyYW1lUmF0ZTogMzAsXHJcbiAgICAgICAgICAgICAgICAgICAgZXhhY3RGaXRTY3JlZW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcmVuZGVyaW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyTW9kZTogMyxcclxuICAgICAgICAgICAgICAgICAgICBoaWdoUXVhbGl0eU1vZGU6IGhpZ2hRdWFsaXR5LFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBoeXNpY3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5waHlzaWNzQ29uZmlnLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOeJqeeQhuW8leaTjuWmguaenOayoeacieaYjuehruiuvue9ru+8jOm7mOiupOaYr+W8gOWQr+eahO+8jOWboOatpOmcgOimgeaYjuehruWumuS5ieS4umZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogISFpbmZvLnNlcnZlclVSTCA/IHRydWUgOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBhc3NldHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbXBvcnRCYXNlOiBpbmZvLmltcG9ydEJhc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbmF0aXZlQmFzZTogaW5mby5uYXRpdmVCYXNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlbW90ZUJ1bmRsZXM6IFsnaW50ZXJuYWwnLCAnbWFpbiddLmNvbmNhdChidW5kbGVzKSxcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXI6IGluZm8uc2VydmVyVVJMLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBleGFjdEZpdFNjcmVlbjogdHJ1ZSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNjLnBoeXNpY3Muc2VsZWN0b3IucnVuSW5FZGl0b3IgPSB0cnVlO1xyXG4gICAgICAgIGlmIChvbkJlZm9yZUdhbWVJbml0KSB7XHJcbiAgICAgICAgICAgIGF3YWl0IG9uQmVmb3JlR2FtZUluaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgY2MuZ2FtZS5pbml0KGRlZmF1bHRDb25maWcpO1xyXG4gICAgICAgIGlmIChvbkFmdGVyR2FtZUluaXQpIHtcclxuICAgICAgICAgICAgYXdhaXQgb25BZnRlckdhbWVJbml0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgYmFja2VuZCA9ICdidWlsdGluJztcclxuICAgICAgICBsZXQgYmFja2VuZDJkID0gJ2J1aWx0aW4nO1xyXG4gICAgICAgIG1vZHVsZXMuZm9yRWFjaCgobW9kdWxlOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgaWYgKG1vZHVsZSBpbiBCYWNrZW5kcykge1xyXG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgYmFja2VuZCA9IEJhY2tlbmRzW21vZHVsZV07XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobW9kdWxlIGluIEJhY2tlbmRzMkQpIHtcclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIGJhY2tlbmQyZCA9IEJhY2tlbmRzMkRbbW9kdWxlXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyDliIfmjaLniannkIblvJXmk45cclxuICAgICAgICBjYy5waHlzaWNzLnNlbGVjdG9yLnN3aXRjaFRvKGJhY2tlbmQpO1xyXG4gICAgICAgIC8vIOemgeeUqOiuoeeul++8jOmBv+WFjeWImuS9k+WcqHRpY2vnmoTml7blgJnnlJ/mlYhcclxuICAgICAgICAvLyBjYy5waHlzaWNzLlBoeXNpY3NTeXN0ZW0uaW5zdGFuY2UuZW5hYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAvLyB3aW5kb3cuY2MuaW50ZXJuYWwucGh5c2ljczJkLnNlbGVjdG9yLnN3aXRjaFRvKGJhY2tlbmQyZCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcXVlcnlJbnRlcm5hbEFzc2V0TGlzdChlbmdpbmVQYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICAvLyDmt7vliqDlvJXmk47kvp3otZbnmoTpooTliqDovb3lhoXnva7otYTmupDliLDkuLvljIXlhoVcclxuICAgICAgICBjb25zdCBjY0NvbmZpZ0pzb24gPSBhd2FpdCBmc2UucmVhZEpTT04oam9pbihlbmdpbmVQYXRoLCAnY2MuY29uZmlnLmpzb24nKSk7XHJcbiAgICAgICAgY29uc3QgaW50ZXJuYWxBc3NldHM6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgZm9yIChjb25zdCBmZWF0dXJlTmFtZSBpbiBjY0NvbmZpZ0pzb24uZmVhdHVyZXMpIHtcclxuICAgICAgICAgICAgaWYgKGNjQ29uZmlnSnNvbi5mZWF0dXJlc1tmZWF0dXJlTmFtZV0uZGVwZW5kZW50QXNzZXRzKSB7XHJcbiAgICAgICAgICAgICAgICBpbnRlcm5hbEFzc2V0cy5wdXNoKC4uLmNjQ29uZmlnSnNvbi5mZWF0dXJlc1tmZWF0dXJlTmFtZV0uZGVwZW5kZW50QXNzZXRzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KGludGVybmFsQXNzZXRzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUT0RPXHJcbiAgICAgKiBAcmV0dXJucyBcclxuICAgICAqL1xyXG4gICAgcXVlcnlNb2R1bGVDb25maWcoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kdWxlQ29uZmlnQ2FjaGU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IEVuZ2luZSA9IG5ldyBFbmdpbmVNYW5hZ2VyKCk7XHJcblxyXG5leHBvcnQgeyBFbmdpbmUgfTtcclxuXHJcbi8qKlxyXG4gKiDliJ3lp4vljJYgZW5naW5lXHJcbiAqIEBwYXJhbSBlbmdpbmVQYXRoXHJcbiAqIEBwYXJhbSBwcm9qZWN0UGF0aFxyXG4gKiBAcGFyYW0gc2VydmVyVVJMXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdEVuZ2luZShlbmdpbmVQYXRoOiBzdHJpbmcsIHByb2plY3RQYXRoOiBzdHJpbmcsIHNlcnZlclVSTD86IHN0cmluZykge1xyXG4gICAgYXdhaXQgRW5naW5lLmluaXQoZW5naW5lUGF0aCk7XHJcbiAgICAvLyDov5nph4wgaW1wb3J0QmFzZSDkuI4gbmF0aXZlQmFzZSDnlKjmnI3liqHlmajmmK/kuLrkuoborqnmnI3liqHlmajovazmjaLotYTmupDnnJ/lrp7lrZjmlL7nmoTot6/lvoRcclxuICAgIGF3YWl0IEVuZ2luZS5pbml0RW5naW5lKHtcclxuICAgICAgICBzZXJ2ZXJVUkw6IHNlcnZlclVSTCxcclxuICAgICAgICBpbXBvcnRCYXNlOiBzZXJ2ZXJVUkwgPz8gam9pbihwcm9qZWN0UGF0aCwgJ2xpYnJhcnknKSxcclxuICAgICAgICBuYXRpdmVCYXNlOiBzZXJ2ZXJVUkwgPz8gam9pbihwcm9qZWN0UGF0aCwgJ2xpYnJhcnknKSxcclxuICAgICAgICB3cml0YWJsZVBhdGg6IGpvaW4ocHJvamVjdFBhdGgsICd0ZW1wJyksXHJcbiAgICB9KTtcclxufVxyXG4iXX0=