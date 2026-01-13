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
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const utils_1 = require("./utils");
const configuration_1 = require("../../configuration");
class BuilderConfig {
    /**
     * 持有的可双向绑定的配置管理实例
     */
    _configInstance;
    getProject(path, scope) {
        return this._configInstance.get(path, scope);
    }
    setProject(path, value, scope) {
        return this._configInstance.set(path, value, scope);
    }
    commonOptionConfigs = {
        platform: {
            label: 'i18n:builder.options.platform',
            default: 'web-mobile',
            type: 'string',
        },
        name: {
            label: 'i18n:builder.options.name',
            type: 'string',
            // will update in init
            default: 'gameName',
            verifyRules: ['required'],
        },
        polyfills: {
            label: 'i18n:builder.options.polyfills',
            description: 'i18n:builder.options.polyfills_tips',
            type: 'object',
            hidden: true,
            default: {
                asyncFunctions: false,
            },
            properties: {
                asyncFunctions: {
                    label: 'i18n:builder.options.async_functions',
                    description: 'i18n:builder.options.async_functions_tips',
                    type: 'boolean',
                    default: false,
                },
                coreJs: {
                    label: 'i18n:builder.options.core_js',
                    description: 'i18n:builder.options.core_js_tips',
                    type: 'boolean',
                    default: false,
                },
            },
        },
        buildScriptTargets: {
            label: 'i18n:builder.options.buildScriptTargets',
            description: 'i18n:builder.options.buildScriptTargetsTips',
            hidden: true,
            type: 'string',
            default: '',
        },
        server: {
            label: 'i18n:builder.options.remote_server_address',
            description: 'i18n:builder.options.remote_server_address_tips',
            default: '',
            type: 'string',
            verifyRules: ['http'],
        },
        sourceMaps: {
            label: 'i18n:builder.options.sourceMap',
            default: 'inline',
            description: 'i18n:builder.options.sourceMapTips',
            type: 'enum',
            items: [{
                    label: 'i18n:builder.off',
                    value: 'false',
                }, {
                    label: 'i18n:builder.options.sourceMapsInline',
                    value: 'inline',
                }, {
                    label: 'i18n:builder.options.standaloneSourceMaps',
                    value: 'true',
                }],
        },
        experimentalEraseModules: {
            label: 'i18n:builder.options.experimental_erase_modules',
            description: 'i18n:builder.options.experimental_erase_modules_tips',
            default: false,
            experiment: true,
            type: 'boolean',
        },
        startSceneAssetBundle: {
            label: 'i18n:builder.options.start_scene_asset_bundle',
            description: 'i18n:builder.options.start_scene_asset_bundle_tips',
            default: false,
            hidden: true,
            type: 'boolean',
        },
        bundleConfigs: {
            label: 'i18n:builder.options.includeBundles',
            default: [],
            type: 'array',
            items: {
                type: 'object',
                properties: {}, // Placeholder for bundle config properties if needed
            },
            verifyLevel: 'warn',
        },
        // 之前 ios-app-clip 有隐藏 buildPath 的需求
        buildPath: {
            label: 'i18n:builder.options.build_path',
            description: 'i18n:builder.tips.build_path',
            default: 'project://build',
            type: 'string',
            verifyRules: ['required'],
        },
        debug: {
            label: 'i18n:builder.options.debug',
            description: 'i18n:builder.options.debugTips',
            default: true,
            type: 'boolean',
        },
        mangleProperties: {
            label: 'i18n:builder.options.mangleProperties',
            description: 'i18n:builder.options.manglePropertiesTip',
            default: false,
            type: 'boolean',
        },
        inlineEnum: {
            label: 'i18n:builder.options.inlineEnum',
            description: 'i18n:builder.options.inlineEnumTip',
            default: true,
            type: 'boolean',
        },
        md5Cache: {
            label: 'i18n:builder.options.md5_cache',
            description: 'i18n:builder.options.md5CacheTips',
            default: false,
            type: 'boolean',
        },
        md5CacheOptions: {
            default: {
                excludes: [],
                includes: [],
                replaceOnly: [],
                handleTemplateMd5Link: true,
            },
            type: 'object',
            properties: {
                excludes: { type: 'array', items: { type: 'string' }, default: [] },
                includes: { type: 'array', items: { type: 'string' }, default: [] },
                replaceOnly: { type: 'array', items: { type: 'string' }, default: [] },
                handleTemplateMd5Link: { type: 'boolean', default: true },
            },
        },
        mainBundleIsRemote: {
            label: 'i18n:builder.options.main_bundle_is_remote',
            description: 'i18n:builder.asset_bundle.remote_bundle_invalid_tooltip',
            default: false,
            type: 'boolean',
        },
        mainBundleCompressionType: {
            label: 'i18n:builder.options.main_bundle_compression_type',
            description: 'i18n:builder.asset_bundle.compression_type_tooltip',
            default: 'merge_dep',
            type: 'string',
        },
        useSplashScreen: {
            label: 'i18n:builder.use_splash_screen',
            default: true,
            type: 'boolean',
        },
        bundleCommonChunk: {
            label: 'i18n:builder.bundleCommonChunk',
            description: 'i18n:builder.bundleCommonChunkTips',
            default: false,
            type: 'boolean',
        },
        skipCompressTexture: {
            label: 'i18n:builder.options.skip_compress_texture',
            default: false,
            type: 'boolean',
        },
        packAutoAtlas: {
            label: 'i18n:builder.options.pack_autoAtlas',
            default: true,
            type: 'boolean',
        },
        startScene: {
            label: 'i18n:builder.options.start_scene',
            description: 'i18n:builder.options.startSceneTips',
            default: '',
            type: 'string',
        },
        outputName: {
            // 这个数据界面不显示，不需要 i18n
            description: '构建的输出目录名，将会作为后续构建任务上的名称',
            default: '',
            type: 'string',
            verifyRules: ['required', 'normalName'],
        },
        taskName: {
            default: '',
            type: 'string',
            verifyRules: ['required'],
        },
        scenes: {
            label: 'i18n:builder.options.scenes',
            description: 'i18n:builder.tips.build_scenes',
            default: [],
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    url: { type: 'string' },
                    uuid: { type: 'string' },
                },
            },
        },
        overwriteProjectSettings: {
            default: {
                macroConfig: {
                    cleanupImageCache: 'inherit-project-setting',
                },
                includeModules: {
                    physics: 'inherit-project-setting',
                    'physics-2d': 'inherit-project-setting',
                    'gfx-webgl2': 'off',
                },
            },
            type: 'object',
            properties: {
                macroConfig: {
                    type: 'object',
                    properties: {
                        cleanupImageCache: { type: 'string', default: 'inherit-project-setting' },
                    },
                },
                includeModules: {
                    type: 'object',
                    properties: {
                        physics: { type: 'string', default: 'inherit-project-setting' },
                        'physics-2d': { type: 'string', default: 'inherit-project-setting' },
                        'gfx-webgl2': { type: 'string', default: 'off' },
                    },
                },
            },
        },
        nativeCodeBundleMode: {
            default: 'asmjs',
            type: 'string',
        },
        wasmCompressionMode: {
            hidden: true,
            default: false,
            type: 'boolean',
        },
        binGroupConfig: {
            default: {
                threshold: 16,
                enable: false,
            },
            type: 'object',
            label: 'i18n:builder.options.bin_group_config',
            properties: {
                enable: {
                    label: 'i18n:builder.options.enable_cconb_group',
                    description: 'i18n:builder.options.enable_cconb_group_tips',
                    type: 'boolean',
                    default: false,
                },
                threshold: {
                    type: 'number',
                    default: 16,
                },
            },
        },
    };
    getBuildCommonOptions() {
        if (!this._init) {
            throw new Error('BuilderConfig is not initialized');
        }
        const defaultOptions = (0, utils_1.getOptionsDefault)(this.commonOptionConfigs);
        return {
            ...defaultOptions,
            moveRemoteBundleScript: false,
            packages: {},
        };
    }
    getDefaultConfig() {
        return {
            common: this.getBuildCommonOptions(),
            platforms: {
            // 'web-desktop': { xxx }
            },
            useCacheConfig: {
                serializeData: true,
                engine: true,
                textureCompress: true,
                autoAtlas: true,
            },
            bundleConfig: {
                custom: {},
            },
            textureCompressConfig: {
                userPreset: {},
                defaultConfig: {
                    default: {
                        name: 'Default Opaque',
                        options: {
                            miniGame: {
                                etc1_rgb: {
                                    quality: 'fast'
                                },
                                pvrtc_4bits_rgb: {
                                    quality: 'fast'
                                },
                                jpg: {
                                    quality: 80
                                }
                            },
                            android: {
                                astc_8x8: {
                                    quality: 'medium'
                                },
                                etc1_rgb: {
                                    quality: 'fast'
                                },
                                jpg: {
                                    quality: 80
                                }
                            },
                            'harmonyos-next': {
                                astc_8x8: {
                                    quality: 'medium'
                                },
                                etc1_rgb: {
                                    quality: 'fast'
                                },
                                jpg: {
                                    quality: 80
                                }
                            },
                            ios: {
                                astc_8x8: {
                                    quality: 'medium'
                                },
                                pvrtc_4bits_rgb: {
                                    quality: 'fast'
                                },
                                jpg: {
                                    quality: 80
                                }
                            },
                            web: {
                                astc_8x8: {
                                    quality: 'medium'
                                },
                                etc1_rgb: {
                                    quality: 'fast'
                                },
                                pvrtc_4bits_rgb: {
                                    quality: 'fast'
                                },
                                png: {
                                    quality: 80
                                }
                            },
                            pc: {}
                        }
                    },
                    transparent: {
                        name: 'Default Transparent',
                        options: {
                            miniGame: {
                                etc1_rgb_a: {
                                    quality: 'fast'
                                },
                                pvrtc_4bits_rgb_a: {
                                    quality: 'fast'
                                },
                                png: {
                                    quality: 80
                                }
                            },
                            android: {
                                astc_8x8: {
                                    quality: 'medium'
                                },
                                etc1_rgb_a: {
                                    quality: 'fast'
                                },
                                png: {
                                    quality: 80
                                }
                            },
                            'harmonyos-next': {
                                astc_8x8: {
                                    quality: 'medium'
                                },
                                etc1_rgb_a: {
                                    quality: 'fast'
                                },
                                png: {
                                    quality: 80
                                }
                            },
                            ios: {
                                astc_8x8: {
                                    quality: 'medium'
                                },
                                pvrtc_4bits_rgb_a: {
                                    quality: 'fast'
                                },
                                png: {
                                    quality: 80
                                }
                            },
                            web: {
                                astc_8x8: {
                                    quality: 'medium'
                                },
                                etc1_rgb_a: {
                                    quality: 'fast'
                                },
                                pvrtc_4bits_rgb_a: {
                                    quality: 'fast'
                                },
                                png: {
                                    quality: 80
                                }
                            },
                            pc: {}
                        }
                    }
                },
                customConfigs: {},
                genMipmaps: true
            }
        };
    }
    _projectRoot = '';
    _buildTemplateDir = '';
    _projectTempDir = '';
    get projectRoot() {
        if (!this._init) {
            throw new Error('BuilderConfig is not initialized');
        }
        return this._projectRoot;
    }
    get buildTemplateDir() {
        if (!this._init) {
            throw new Error('BuilderConfig is not initialized');
        }
        return this._buildTemplateDir;
    }
    get projectTempDir() {
        if (!this._init) {
            throw new Error('BuilderConfig is not initialized');
        }
        return this._projectTempDir;
    }
    _init = false;
    async init() {
        if (this._init) {
            return;
        }
        const project = await Promise.resolve().then(() => __importStar(require('../../project')));
        this._projectRoot = project.default.path;
        this._buildTemplateDir = (0, path_1.join)(this._projectRoot, 'build-template');
        this._projectTempDir = (0, path_1.join)(this._projectRoot, 'temp', 'builder');
        this.commonOptionConfigs.name.default = project.default.getInfo().name || 'gameName';
        this._init = true;
        this._configInstance = await configuration_1.configurationRegistry.register('builder', this.getDefaultConfig());
    }
}
exports.default = new BuilderConfig();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRlci1jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3NoYXJlL2J1aWxkZXItY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsK0JBQXNDO0FBQ3RDLG1DQUE0QztBQUM1Qyx1REFBb0c7QUFLcEcsTUFBTSxhQUFhO0lBQ2Y7O09BRUc7SUFDSyxlQUFlLENBQXNCO0lBQzdDLFVBQVUsQ0FBSSxJQUFhLEVBQUUsS0FBMEI7UUFDbkQsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFZLEVBQUUsS0FBVSxFQUFFLEtBQTBCO1FBQzNELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsbUJBQW1CLEdBQXVDO1FBQ3RELFFBQVEsRUFBRTtZQUNOLEtBQUssRUFBRSwrQkFBK0I7WUFDdEMsT0FBTyxFQUFFLFlBQVk7WUFDckIsSUFBSSxFQUFFLFFBQVE7U0FDakI7UUFDRCxJQUFJLEVBQUU7WUFDRixLQUFLLEVBQUUsMkJBQTJCO1lBQ2xDLElBQUksRUFBRSxRQUFRO1lBQ2Qsc0JBQXNCO1lBQ3RCLE9BQU8sRUFBRSxVQUFVO1lBQ25CLFdBQVcsRUFBRSxDQUFDLFVBQVUsQ0FBQztTQUM1QjtRQUNELFNBQVMsRUFBRTtZQUNQLEtBQUssRUFBRSxnQ0FBZ0M7WUFDdkMsV0FBVyxFQUFFLHFDQUFxQztZQUNsRCxJQUFJLEVBQUUsUUFBUTtZQUNkLE1BQU0sRUFBRSxJQUFJO1lBQ1osT0FBTyxFQUFFO2dCQUNMLGNBQWMsRUFBRSxLQUFLO2FBQ3hCO1lBQ0QsVUFBVSxFQUFFO2dCQUNSLGNBQWMs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QyxlQUFlLEdBQUcsTUFBTSxxQ0FBcUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFDcEcsQ0FBQztDQUNKO0FBRUQsa0JBQWUsSUFBSSxhQUFhLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhc2VuYW1lLCBqb2luIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGdldE9wdGlvbnNEZWZhdWx0IH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IElCYXNlQ29uZmlndXJhdGlvbiwgQ29uZmlndXJhdGlvblNjb3BlLCBjb25maWd1cmF0aW9uUmVnaXN0cnkgfSBmcm9tICcuLi8uLi9jb25maWd1cmF0aW9uJztcclxuaW1wb3J0IHsgSUJ1aWxkQ29tbW9uT3B0aW9ucyB9IGZyb20gJy4uL0B0eXBlcyc7XHJcbmltcG9ydCB7IElCdWlsZGVyQ29uZmlnSXRlbSB9IGZyb20gJy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBCdWlsZENvbmZpZ3VyYXRpb24gfSBmcm9tICcuLi9AdHlwZXMvY29uZmlnLWV4cG9ydCc7XHJcblxyXG5jbGFzcyBCdWlsZGVyQ29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICog5oyB5pyJ55qE5Y+v5Y+M5ZCR57uR5a6a55qE6YWN572u566h55CG5a6e5L6LXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2NvbmZpZ0luc3RhbmNlITogSUJhc2VDb25maWd1cmF0aW9uO1xyXG4gICAgZ2V0UHJvamVjdDxUPihwYXRoPzogc3RyaW5nLCBzY29wZT86IENvbmZpZ3VyYXRpb25TY29wZSk6IFByb21pc2U8VD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jb25maWdJbnN0YW5jZS5nZXQocGF0aCwgc2NvcGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFByb2plY3QocGF0aDogc3RyaW5nLCB2YWx1ZTogYW55LCBzY29wZT86IENvbmZpZ3VyYXRpb25TY29wZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jb25maWdJbnN0YW5jZS5zZXQocGF0aCwgdmFsdWUsIHNjb3BlKTtcclxuICAgIH1cclxuXHJcbiAgICBjb21tb25PcHRpb25Db25maWdzOiBSZWNvcmQ8c3RyaW5nLCBJQnVpbGRlckNvbmZpZ0l0ZW0+ID0ge1xyXG4gICAgICAgIHBsYXRmb3JtOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpidWlsZGVyLm9wdGlvbnMucGxhdGZvcm0nLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAnd2ViLW1vYmlsZScsXHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmFtZToge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YnVpbGRlci5vcHRpb25zLm5hbWUnLFxyXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICAgICAgLy8gd2lsbCB1cGRhdGUgaW4gaW5pdFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAnZ2FtZU5hbWUnLFxyXG4gICAgICAgICAgICB2ZXJpZnlSdWxlczogWydyZXF1aXJlZCddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcG9seWZpbGxzOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpidWlsZGVyLm9wdGlvbnMucG9seWZpbGxzJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5wb2x5ZmlsbHNfdGlwcycsXHJcbiAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgICAgICAgICBoaWRkZW46IHRydWUsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgIGFzeW5jRnVuY3Rpb25zOiBmYWxzZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgYXN5bmNGdW5jdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ2kxOG46YnVpbGRlci5vcHRpb25zLmFzeW5jX2Z1bmN0aW9ucycsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5hc3luY19mdW5jdGlvbnNfdGlwcycsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNvcmVKczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpidWlsZGVyLm9wdGlvbnMuY29yZV9qcycsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5jb3JlX2pzX3RpcHMnLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBidWlsZFNjcmlwdFRhcmdldHM6IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5idWlsZFNjcmlwdFRhcmdldHMnLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2kxOG46YnVpbGRlci5vcHRpb25zLmJ1aWxkU2NyaXB0VGFyZ2V0c1RpcHMnLFxyXG4gICAgICAgICAgICBoaWRkZW46IHRydWUsXHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlcnZlcjoge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YnVpbGRlci5vcHRpb25zLnJlbW90ZV9zZXJ2ZXJfYWRkcmVzcycsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnaTE4bjpidWlsZGVyLm9wdGlvbnMucmVtb3RlX3NlcnZlcl9hZGRyZXNzX3RpcHMnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcclxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgICAgIHZlcmlmeVJ1bGVzOiBbJ2h0dHAnXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNvdXJjZU1hcHM6IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5zb3VyY2VNYXAnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAnaW5saW5lJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5zb3VyY2VNYXBUaXBzJyxcclxuICAgICAgICAgICAgdHlwZTogJ2VudW0nLFxyXG4gICAgICAgICAgICBpdGVtczogW3tcclxuICAgICAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpidWlsZGVyLm9mZicsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ2ZhbHNlJyxcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5zb3VyY2VNYXBzSW5saW5lJyxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAnaW5saW5lJyxcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5zdGFuZGFsb25lU291cmNlTWFwcycsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ3RydWUnLFxyXG4gICAgICAgICAgICB9XSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4cGVyaW1lbnRhbEVyYXNlTW9kdWxlczoge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YnVpbGRlci5vcHRpb25zLmV4cGVyaW1lbnRhbF9lcmFzZV9tb2R1bGVzJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5leHBlcmltZW50YWxfZXJhc2VfbW9kdWxlc190aXBzJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgICAgIGV4cGVyaW1lbnQ6IHRydWUsXHJcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0YXJ0U2NlbmVBc3NldEJ1bmRsZToge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YnVpbGRlci5vcHRpb25zLnN0YXJ0X3NjZW5lX2Fzc2V0X2J1bmRsZScsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnaTE4bjpidWlsZGVyLm9wdGlvbnMuc3RhcnRfc2NlbmVfYXNzZXRfYnVuZGxlX3RpcHMnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlLFxyXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBidW5kbGVDb25maWdzOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpidWlsZGVyLm9wdGlvbnMuaW5jbHVkZUJ1bmRsZXMnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiBbXSxcclxuICAgICAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczoge30sIC8vIFBsYWNlaG9sZGVyIGZvciBidW5kbGUgY29uZmlnIHByb3BlcnRpZXMgaWYgbmVlZGVkXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHZlcmlmeUxldmVsOiAnd2FybicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDkuYvliY0gaW9zLWFwcC1jbGlwIOaciemakOiXjyBidWlsZFBhdGgg55qE6ZyA5rGCXHJcbiAgICAgICAgYnVpbGRQYXRoOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpidWlsZGVyLm9wdGlvbnMuYnVpbGRfcGF0aCcsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnaTE4bjpidWlsZGVyLnRpcHMuYnVpbGRfcGF0aCcsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6ICdwcm9qZWN0Oi8vYnVpbGQnLFxyXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICAgICAgdmVyaWZ5UnVsZXM6IFsncmVxdWlyZWQnXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlYnVnOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpidWlsZGVyLm9wdGlvbnMuZGVidWcnLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2kxOG46YnVpbGRlci5vcHRpb25zLmRlYnVnVGlwcycsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXHJcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1hbmdsZVByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5tYW5nbGVQcm9wZXJ0aWVzJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5tYW5nbGVQcm9wZXJ0aWVzVGlwJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlubGluZUVudW06IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5pbmxpbmVFbnVtJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5pbmxpbmVFbnVtVGlwJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWQ1Q2FjaGU6IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5tZDVfY2FjaGUnLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2kxOG46YnVpbGRlci5vcHRpb25zLm1kNUNhY2hlVGlwcycsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZDVDYWNoZU9wdGlvbnM6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICAgICAgZXhjbHVkZXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgaW5jbHVkZXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgcmVwbGFjZU9ubHk6IFtdLFxyXG4gICAgICAgICAgICAgICAgaGFuZGxlVGVtcGxhdGVNZDVMaW5rOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgZXhjbHVkZXM6IHsgdHlwZTogJ2FycmF5JywgaXRlbXM6IHsgdHlwZTogJ3N0cmluZycgfSwgZGVmYXVsdDogW10gfSxcclxuICAgICAgICAgICAgICAgIGluY2x1ZGVzOiB7IHR5cGU6ICdhcnJheScsIGl0ZW1zOiB7IHR5cGU6ICdzdHJpbmcnIH0sIGRlZmF1bHQ6IFtdIH0sXHJcbiAgICAgICAgICAgICAgICByZXBsYWNlT25seTogeyB0eXBlOiAnYXJyYXknLCBpdGVtczogeyB0eXBlOiAnc3RyaW5nJyB9LCBkZWZhdWx0OiBbXSB9LFxyXG4gICAgICAgICAgICAgICAgaGFuZGxlVGVtcGxhdGVNZDVMaW5rOiB7IHR5cGU6ICdib29sZWFuJywgZGVmYXVsdDogdHJ1ZSB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWFpbkJ1bmRsZUlzUmVtb3RlOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpidWlsZGVyLm9wdGlvbnMubWFpbl9idW5kbGVfaXNfcmVtb3RlJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdpMThuOmJ1aWxkZXIuYXNzZXRfYnVuZGxlLnJlbW90ZV9idW5kbGVfaW52YWxpZF90b29sdGlwJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1haW5CdW5kbGVDb21wcmVzc2lvblR5cGU6IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5tYWluX2J1bmRsZV9jb21wcmVzc2lvbl90eXBlJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdpMThuOmJ1aWxkZXIuYXNzZXRfYnVuZGxlLmNvbXByZXNzaW9uX3R5cGVfdG9vbHRpcCcsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6ICdtZXJnZV9kZXAnLFxyXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVzZVNwbGFzaFNjcmVlbjoge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YnVpbGRlci51c2Vfc3BsYXNoX3NjcmVlbicsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXHJcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJ1bmRsZUNvbW1vbkNodW5rOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpidWlsZGVyLmJ1bmRsZUNvbW1vbkNodW5rJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdpMThuOmJ1aWxkZXIuYnVuZGxlQ29tbW9uQ2h1bmtUaXBzJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNraXBDb21wcmVzc1RleHR1cmU6IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5za2lwX2NvbXByZXNzX3RleHR1cmUnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGFja0F1dG9BdGxhczoge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YnVpbGRlci5vcHRpb25zLnBhY2tfYXV0b0F0bGFzJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3RhcnRTY2VuZToge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YnVpbGRlci5vcHRpb25zLnN0YXJ0X3NjZW5lJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdpMThuOmJ1aWxkZXIub3B0aW9ucy5zdGFydFNjZW5lVGlwcycsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcnLFxyXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG91dHB1dE5hbWU6IHtcclxuICAgICAgICAgICAgLy8g6L+Z5Liq5pWw5o2u55WM6Z2i5LiN5pi+56S677yM5LiN6ZyA6KaBIGkxOG5cclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICfmnoTlu7rnmoTovpPlh7rnm67lvZXlkI3vvIzlsIbkvJrkvZzkuLrlkI7nu63mnoTlu7rku7vliqHkuIrnmoTlkI3np7AnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcclxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgICAgIHZlcmlmeVJ1bGVzOiBbJ3JlcXVpcmVkJywgJ25vcm1hbE5hbWUnXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRhc2tOYW1lOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcnLFxyXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICAgICAgdmVyaWZ5UnVsZXM6IFsncmVxdWlyZWQnXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNjZW5lczoge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YnVpbGRlci5vcHRpb25zLnNjZW5lcycsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnaTE4bjpidWlsZGVyLnRpcHMuYnVpbGRfc2NlbmVzJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogW10sXHJcbiAgICAgICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IHsgdHlwZTogJ3N0cmluZycgfSxcclxuICAgICAgICAgICAgICAgICAgICB1dWlkOiB7IHR5cGU6ICdzdHJpbmcnIH0sXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3ZlcndyaXRlUHJvamVjdFNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgIG1hY3JvQ29uZmlnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYW51cEltYWdlQ2FjaGU6ICdpbmhlcml0LXByb2plY3Qtc2V0dGluZycsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaW5jbHVkZU1vZHVsZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBwaHlzaWNzOiAnaW5oZXJpdC1wcm9qZWN0LXNldHRpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICdwaHlzaWNzLTJkJzogJ2luaGVyaXQtcHJvamVjdC1zZXR0aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAnZ2Z4LXdlYmdsMic6ICdvZmYnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgIG1hY3JvQ29uZmlnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhbnVwSW1hZ2VDYWNoZTogeyB0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDogJ2luaGVyaXQtcHJvamVjdC1zZXR0aW5nJyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaW5jbHVkZU1vZHVsZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBoeXNpY3M6IHsgdHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6ICdpbmhlcml0LXByb2plY3Qtc2V0dGluZycgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3BoeXNpY3MtMmQnOiB7IHR5cGU6ICdzdHJpbmcnLCBkZWZhdWx0OiAnaW5oZXJpdC1wcm9qZWN0LXNldHRpbmcnIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdnZngtd2ViZ2wyJzogeyB0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDogJ29mZicgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG5hdGl2ZUNvZGVCdW5kbGVNb2RlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6ICdhc21qcycsXHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgd2FzbUNvbXByZXNzaW9uTW9kZToge1xyXG4gICAgICAgICAgICBoaWRkZW46IHRydWUsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBiaW5Hcm91cENvbmZpZzoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICB0aHJlc2hvbGQ6IDE2LFxyXG4gICAgICAgICAgICAgICAgZW5hYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpidWlsZGVyLm9wdGlvbnMuYmluX2dyb3VwX2NvbmZpZycsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgIGVuYWJsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpidWlsZGVyLm9wdGlvbnMuZW5hYmxlX2Njb25iX2dyb3VwJyxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2kxOG46YnVpbGRlci5vcHRpb25zLmVuYWJsZV9jY29uYl9ncm91cF90aXBzJyxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdGhyZXNob2xkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogMTYsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIGdldEJ1aWxkQ29tbW9uT3B0aW9ucygpOiBJQnVpbGRDb21tb25PcHRpb25zIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCdWlsZGVyQ29uZmlnIGlzIG5vdCBpbml0aWFsaXplZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IGdldE9wdGlvbnNEZWZhdWx0KHRoaXMuY29tbW9uT3B0aW9uQ29uZmlncyk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgLi4uZGVmYXVsdE9wdGlvbnMsXHJcbiAgICAgICAgICAgIG1vdmVSZW1vdGVCdW5kbGVTY3JpcHQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBwYWNrYWdlczoge30sXHJcbiAgICAgICAgfSBhcyBJQnVpbGRDb21tb25PcHRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIGdldERlZmF1bHRDb25maWcoKTogQnVpbGRDb25maWd1cmF0aW9uIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjb21tb246IHRoaXMuZ2V0QnVpbGRDb21tb25PcHRpb25zKCksXHJcbiAgICAgICAgICAgIHBsYXRmb3Jtczoge1xyXG4gICAgICAgICAgICAgICAgLy8gJ3dlYi1kZXNrdG9wJzogeyB4eHggfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB1c2VDYWNoZUNvbmZpZzoge1xyXG4gICAgICAgICAgICAgICAgc2VyaWFsaXplRGF0YTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGVuZ2luZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHRleHR1cmVDb21wcmVzczogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGF1dG9BdGxhczogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYnVuZGxlQ29uZmlnOiB7XHJcbiAgICAgICAgICAgICAgICBjdXN0b206IHt9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZXh0dXJlQ29tcHJlc3NDb25maWc6IHtcclxuICAgICAgICAgICAgICAgIHVzZXJQcmVzZXQ6IHt9LFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdENvbmZpZzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0RlZmF1bHQgT3BhcXVlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluaUdhbWU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGMxX3JnYjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiAnZmFzdCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB2cnRjXzRiaXRzX3JnYjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiAnZmFzdCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpwZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiA4MFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmRyb2lkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0Y184eDg6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogJ21lZGl1bSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV0YzFfcmdiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1YWxpdHk6ICdmYXN0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganBnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1YWxpdHk6IDgwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoYXJtb255b3MtbmV4dCc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3RjXzh4ODoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiAnbWVkaXVtJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXRjMV9yZ2I6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogJ2Zhc3QnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqcGc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogODBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW9zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0Y184eDg6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogJ21lZGl1bSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB2cnRjXzRiaXRzX3JnYjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiAnZmFzdCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpwZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiA4MFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3ZWI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3RjXzh4ODoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiAnbWVkaXVtJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXRjMV9yZ2I6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogJ2Zhc3QnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdnJ0Y180Yml0c19yZ2I6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogJ2Zhc3QnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogODBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGM6IHt9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zcGFyZW50OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdEZWZhdWx0IFRyYW5zcGFyZW50JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluaUdhbWU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGMxX3JnYl9hOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1YWxpdHk6ICdmYXN0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHZydGNfNGJpdHNfcmdiX2E6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogJ2Zhc3QnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogODBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5kcm9pZDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdGNfOHg4OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1YWxpdHk6ICdtZWRpdW0nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGMxX3JnYl9hOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1YWxpdHk6ICdmYXN0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1YWxpdHk6IDgwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoYXJtb255b3MtbmV4dCc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3RjXzh4ODoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiAnbWVkaXVtJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXRjMV9yZ2JfYToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiAnZmFzdCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBuZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiA4MFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpb3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3RjXzh4ODoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiAnbWVkaXVtJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHZydGNfNGJpdHNfcmdiX2E6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogJ2Zhc3QnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogODBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2ViOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0Y184eDg6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogJ21lZGl1bSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV0YzFfcmdiX2E6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogJ2Zhc3QnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdnJ0Y180Yml0c19yZ2JfYToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiAnZmFzdCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBuZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiA4MFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYzoge31cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjdXN0b21Db25maWdzOiB7fSxcclxuICAgICAgICAgICAgICAgIGdlbk1pcG1hcHM6IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfcHJvamVjdFJvb3QgPSAnJztcclxuICAgIHByaXZhdGUgX2J1aWxkVGVtcGxhdGVEaXIgPSAnJztcclxuICAgIHByaXZhdGUgX3Byb2plY3RUZW1wRGlyID0gJyc7XHJcblxyXG4gICAgZ2V0IHByb2plY3RSb290KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5pdCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1aWxkZXJDb25maWcgaXMgbm90IGluaXRpYWxpemVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9qZWN0Um9vdDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgYnVpbGRUZW1wbGF0ZURpcigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCdWlsZGVyQ29uZmlnIGlzIG5vdCBpbml0aWFsaXplZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fYnVpbGRUZW1wbGF0ZURpcjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgcHJvamVjdFRlbXBEaXIoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQnVpbGRlckNvbmZpZyBpcyBub3QgaW5pdGlhbGl6ZWQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb2plY3RUZW1wRGlyO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQgPSBmYWxzZTtcclxuXHJcbiAgICBhc3luYyBpbml0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcHJvamVjdCA9IGF3YWl0IGltcG9ydCgnLi4vLi4vcHJvamVjdCcpO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9qZWN0Um9vdCA9IHByb2plY3QuZGVmYXVsdC5wYXRoO1xyXG4gICAgICAgIHRoaXMuX2J1aWxkVGVtcGxhdGVEaXIgPSBqb2luKHRoaXMuX3Byb2plY3RSb290LCAnYnVpbGQtdGVtcGxhdGUnKTtcclxuICAgICAgICB0aGlzLl9wcm9qZWN0VGVtcERpciA9IGpvaW4odGhpcy5fcHJvamVjdFJvb3QsICd0ZW1wJywgJ2J1aWxkZXInLCk7XHJcbiAgICAgICAgdGhpcy5jb21tb25PcHRpb25Db25maWdzLm5hbWUuZGVmYXVsdCA9IHByb2plY3QuZGVmYXVsdC5nZXRJbmZvKCkubmFtZSB8fCAnZ2FtZU5hbWUnO1xyXG5cclxuICAgICAgICB0aGlzLl9pbml0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9jb25maWdJbnN0YW5jZSA9IGF3YWl0IGNvbmZpZ3VyYXRpb25SZWdpc3RyeS5yZWdpc3RlcignYnVpbGRlcicsIHRoaXMuZ2V0RGVmYXVsdENvbmZpZygpKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgbmV3IEJ1aWxkZXJDb25maWcoKTtcclxuIl19