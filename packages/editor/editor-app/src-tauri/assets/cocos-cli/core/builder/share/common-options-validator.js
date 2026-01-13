"use strict";
/**
 * 校验构建通用配置参数
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.overwriteModuleConfig = void 0;
exports.checkScenes = checkScenes;
exports.checkStartScene = checkStartScene;
exports.calcValidOutputName = calcValidOutputName;
exports.checkConflict = checkConflict;
exports.generateNewOutputName = generateNewOutputName;
exports.checkBuildPathIsInvalid = checkBuildPathIsInvalid;
exports.getDefaultScenes = getDefaultScenes;
exports.getDefaultStartScene = getDefaultStartScene;
exports.checkBuildCommonOptionsByKey = checkBuildCommonOptionsByKey;
exports.checkBuildCommonOptions = checkBuildCommonOptions;
exports.checkBundleCompressionSetting = checkBundleCompressionSetting;
exports.handleOverwriteProjectSettings = handleOverwriteProjectSettings;
exports.checkProjectSetting = checkProjectSetting;
const path_1 = require("path");
const bundle_utils_1 = require("./bundle-utils");
const platforms_options_1 = require("./platforms-options");
const i18n_1 = __importDefault(require("../../base/i18n"));
const utils_1 = __importDefault(require("../../base/utils"));
const asset_1 = __importDefault(require("../../assets/manager/asset"));
const engine_1 = require("../../engine");
const builder_config_1 = __importDefault(require("./builder-config"));
const validator_manager_1 = require("./validator-manager");
exports.overwriteModuleConfig = {
    physics: {
        match: (key) => {
            return key.startsWith('physics-') && !key.startsWith('physics-2d');
        },
        default: 'inherit-project-setting',
    },
    'physics-2d': {
        match: (key) => {
            return key.startsWith('physics-2d-');
        },
        default: 'inherit-project-setting',
    },
};
/**
 * 校验场景数据
 * @returns 校验结果
 * @param scenes
 */
function checkScenes(scenes) {
    if (!Array.isArray(scenes) || !scenes.length) {
        return new Error('Scenes is empty');
    }
    const validScenes = scenes.filter((scene) => scene && scene.uuid);
    if (validScenes.length !== scenes.length) {
        return new Error(i18n_1.default.t('builder.error.missing_scenes'));
    }
    const res = validScenes.map((scene) => asset_1.default.queryUrl(scene.uuid));
    const invalidIndex = res.findIndex((url) => !url);
    if (invalidIndex !== -1) {
        return new Error(i18n_1.default.t('builder.error.missing_scenes', {
            url: validScenes[invalidIndex].url,
        }));
    }
    return true;
}
/**
  * 确认初始场景对错
  * @param uuidOrUrl
  */
function checkStartScene(uuidOrUrl) {
    const asset = asset_1.default.queryAsset(uuidOrUrl);
    if (!asset) {
        return new Error(`can not find asset by uuid or url ${uuidOrUrl}`);
    }
    const bundleDirInfos = asset_1.default.queryAssets({ isBundle: true });
    if (bundleDirInfos.find((info) => asset.url.startsWith(info.url + '/'))) {
        return new Error(`asset ${uuidOrUrl} is in bundle, can not be set as start scene`);
    }
    return true;
}
/**
  * 根据输入的文件夹和目标名称计算不和本地冲突的文件地址
  * @param root
  * @param dirName
  */
async function calcValidOutputName(root, dirName, platform, id) {
    if (!root || !dirName) {
        return '';
    }
    let dest = (0, path_1.join)(utils_1.default.Path.resolveToRaw(root), dirName);
    dest = utils_1.default.File.getName(dest);
    return (0, path_1.basename)(dest);
}
// 创建 taskMap 中 buildPath 字典
function createBuildPathDict(taskMap) {
    const buildPathDict = {};
    for (const key in taskMap) {
        const task = taskMap[key];
        const taskBuildPath = utils_1.default.Path.resolveToRaw(task.options.buildPath);
        if (!buildPathDict[taskBuildPath]) {
            buildPathDict[taskBuildPath] = [];
        }
        buildPathDict[taskBuildPath].push(task.options.outputName);
    }
    return buildPathDict;
}
// 判断输出路径是否与 taskMap 中的路径冲突
function checkConflict(buildPath, outputName, buildPathDict) {
    // 同 buildPath 下 outputName 是否重复
    const outputNames = buildPathDict[buildPath] || [];
    for (const name of outputNames) {
        if (outputName === name) {
            return true;
        }
    }
    return false;
}
// 生成新的输出目录名称
function generateNewOutputName(buildPath, platform, buildPathDict) {
    // 获取同 buildPath 下 platform 输出目录的最高序号
    const outputNames = buildPathDict[buildPath] || [];
    let maxIndex = 0;
    for (const name of outputNames) {
        if (name.startsWith(platform + '-')) {
            const index = parseInt(name.substring(platform.length + 1), 10);
            if (!isNaN(index) && index > maxIndex) {
                maxIndex = index;
            }
        }
    }
    // 生成新的输出目录名
    const newIndex = (maxIndex + 1).toString().padStart(3, '0');
    return `${platform}-${newIndex}`;
}
/**
 * 检查路径是否无效
 * @param path
 * @returns
 */
function checkBuildPathIsInvalid(path) {
    if (!path) {
        return true;
    }
    if (path.startsWith('project://')) {
        const matchInfo = path.match(/^([a-zA-z]*):\/\/(.*)$/);
        if (matchInfo) {
            const relPath = matchInfo[2].replace(/\\/g, '/');
            // 超出项目外的相对路径以及 project:// 下为绝对路径的地址无效
            if ((0, path_1.isAbsolute)(relPath) || relPath.includes('../') || relPath.startsWith('/')) {
                return true;
            }
        }
    }
    else {
        if (!(0, path_1.isAbsolute)(path)) {
            return true;
        }
    }
    return false;
}
/**
  * 校验传入的引擎模块信息
  * @param value[]
  * @returns 校验结果
  */
function checkIncludeModules(modules) {
    if (!Array.isArray(modules)) {
        return ` includeModules(${modules}) should be an array!`;
    }
    // TODO 校验是否包含一些引擎的必须模块
    return true;
}
// export async function getCommonOptions(platform: Platform, useDefault = false) {
//     const commonConfig = await builderConfig.getProject<IBuildCommonOptions>('common', useDefault ? 'default' : 'project');
//     const result: IBuildTaskOption<Platform> = JSON.parse(JSON.stringify(commonConfig));
//     if (!useDefault) {
//         const platformCustomCommonOptions = await builderConfig.getProject<IBuildCommonOptions>(`platforms.${platform}`);
//         if (platformCustomCommonOptions) {
//             Object.keys(platformCustomCommonOptions).forEach((key) => {
//                 if (platformCustomCommonOptions[key as keyof IBuildCommonOptions] !== undefined) {
//                     // @ts-ignore
//                     result[key] = platformCustomCommonOptions[key as keyof IBuildCommonOptions];
//                 }
//             });
//         }
//     }
//     // 场景信息不使用用户修改过的数据，这部分信息和资源相关联数据经常会变化，不存储使用
//     result.scenes = await getDefaultScenes();
//     if (!(await checkStartScene(result.startScene))) {
//         result.startScene = await getDefaultStartScene();
//     }
//     if (!result.startScene) {
//         console.error(i18n.t('builder.error.invalidStartScene'));
//     }
//     result.platform = platform;
//     return result;
// }
function getDefaultScenes() {
    const scenes = asset_1.default.queryAssets({ ccType: 'cc.SceneAsset', pattern: '!db://internal/default_file_content/**/*' });
    if (!scenes) {
        return [];
    }
    const directory = asset_1.default.queryAssets({ isBundle: true });
    return scenes.map((asset) => {
        return {
            url: asset.url,
            uuid: asset.uuid,
            bundle: directory.find((dir) => asset.url.startsWith(dir.url + '/'))?.url || '',
        };
    });
}
function getDefaultStartScene() {
    const scenes = getDefaultScenes();
    const realScenes = scenes.filter((item) => !item.bundle);
    return realScenes[0] && realScenes[0].uuid;
}
async function checkBuildCommonOptionsByKey(key, value, options) {
    const res = {
        error: '',
        newValue: value,
        level: 'error',
    };
    switch (key) {
        case 'scenes':
            {
                const error = checkScenes(value) || false;
                if (error instanceof Error) {
                    res.error = error.message;
                    res.newValue = getDefaultScenes();
                }
                return res;
            }
        case 'startScene':
            {
                const error = checkStartScene(value) || false;
                if (error instanceof Error) {
                    res.error = error.message;
                    res.newValue = getDefaultStartScene();
                }
                return res;
            }
        case 'mainBundleIsRemote':
            if (value && options.mainBundleCompressionType === bundle_utils_1.BundleCompressionTypes.SUBPACKAGE) {
                res.newValue = false;
                res.error = ' bundle can not be remote when compression type is subpackage!';
            }
            else if (!value && options.mainBundleCompressionType === bundle_utils_1.BundleCompressionTypes.ZIP) {
                res.newValue = true;
                res.error = ' bundle must be remote when compression type is zip!';
            }
            return res;
        case 'outputName':
            if (!value) {
                res.error = ' outputName can not be empty';
                res.newValue = await calcValidOutputName(options.buildPath, options.platform, options.platform);
            }
            else {
                // HACK 原生平台不支持中文和特殊符号
                if (platforms_options_1.NATIVE_PLATFORM.includes(options.platform) && checkIncludeChineseAndSymbol(value)) {
                    res.error = 'i18n:builder.error.buildPathContainsChineseAndSymbol';
                }
            }
            break;
        case 'taskName':
            if (!value) {
                res.error = ' taskName can not be empty';
                res.newValue = options.outputName;
            }
            break;
        case 'buildPath':
            if (!value || value === 'project://') {
                res.error = ' buildPath can not be empty';
                res.newValue = 'project://build';
            }
            else if (checkBuildPathIsInvalid(value)) {
                res.error = 'buildPath is invalid!';
                res.newValue = 'project://build';
            }
            else {
                // 添加对旧版本相对路径的转换支持
                if (typeof value === 'string' && value.startsWith('.')) {
                    value = 'project://' + value;
                }
                if (!value || !(0, path_1.isAbsolute)(utils_1.default.Path.resolveToRaw(value))) {
                    res.error = `buildPath(${value}) is invalid!`;
                    res.newValue = 'project://build';
                }
                // hack 原生平台不支持中文和特殊符号
                if (platforms_options_1.NATIVE_PLATFORM.includes(options.platform) && checkIncludeChineseAndSymbol(value)) {
                    res.error = 'i18n:builder.error.buildPathContainsChineseAndSymbol';
                }
            }
            break;
        case 'md5Cache':
        case 'debug':
        case 'useSplashScreen':
        case 'mergeStartScene':
        case 'experimentalEraseModules':
        case 'sourceMaps':
            if (value === 'true') {
                res.newValue = true;
            }
            else if (value === 'false') {
                res.newValue = false;
            }
            break;
        case 'server':
            {
                res.error = await validator_manager_1.validatorManager.check(value, builder_config_1.default.commonOptionConfigs.server.verifyRules || [], options, options.platform + options.platform);
            }
            break;
        default:
            return null;
    }
    return res;
}
function checkIncludeChineseAndSymbol(value) {
    return /[`~!#$%^&*+=<>?'{}|,;'·~！#￥%……&*（）+={}|《》？：“”【】、；‘'，。、@\u4e00-\u9fa5]/im.test(value);
}
async function checkBuildCommonOptions(options) {
    const commonOptions = builder_config_1.default.getBuildCommonOptions();
    const checkResMap = {};
    // const checkKeys = Array.from(new Set(Object.keys(commonOptions).concat(Object.keys(options))))
    // 正常来说应该检查默认值和 options 整合的 key
    for (const key of Object.keys(commonOptions)) {
        checkResMap[key] = await checkBuildCommonOptionsByKey(key, options[key], options) || { newValue: options[key], error: '', level: 'error' };
    }
    return checkResMap;
}
function checkBundleCompressionSetting(value, supportedCompressionTypes) {
    const result = {
        error: '',
        newValue: value,
    };
    if (supportedCompressionTypes && -1 === supportedCompressionTypes.indexOf(value)) {
        result.newValue = bundle_utils_1.BundleCompressionTypes.MERGE_DEP;
        result.error = ` compression type(${value}) is invalid for this platform!`;
    }
    return result;
}
/**
 * 整合构建配置的引擎模块配置
 * 规则：
 *   字段值为布尔值，则当前值作为此模块的开关
 *   字段值为字符串，则根据 overwriteModuleConfig 配置值进行剔除替换
 * @param options
 */
function handleOverwriteProjectSettings(options) {
    const overwriteModules = options.overwriteProjectSettings?.includeModules;
    let includeModules = options.includeModules;
    if (includeModules && overwriteModules && includeModules.length) {
        for (const module in overwriteModules) {
            if (overwriteModules[module] !== 'inherit-project-setting') {
                switch (overwriteModules[module]) {
                    case 'on':
                        includeModules.push(module);
                        break;
                    case 'off':
                        includeModules = includeModules.filter((engineModule) => engineModule !== module);
                        break;
                    default:
                        if (exports.overwriteModuleConfig[module]) {
                            const overwriteModuleIndex = includeModules.findIndex(exports.overwriteModuleConfig[module].match);
                            if (overwriteModuleIndex === -1) {
                                // 未开启模块时，替换无效
                                return;
                            }
                            includeModules.splice(overwriteModuleIndex, 1, overwriteModules[module]);
                        }
                        else {
                            console.warn('Invalid overwrite config of engine');
                        }
                }
            }
        }
        options.includeModules = Array.from(new Set(includeModules));
    }
}
async function checkProjectSetting(options) {
    options.engineInfo = options.engineInfo || engine_1.Engine.getInfo();
    const { designResolution, renderPipeline, physicsConfig, customLayers, sortingLayers, macroConfig, includeModules } = engine_1.Engine.getConfig();
    // 默认 Canvas 设置
    if (!options.designResolution) {
        options.designResolution = designResolution;
    }
    // renderPipeline
    if (!options.renderPipeline) {
        if (renderPipeline) {
            options.renderPipeline = renderPipeline;
        }
    }
    // physicsConfig
    if (!options.physicsConfig) {
        options.physicsConfig = physicsConfig;
        if (!options.physicsConfig.defaultMaterial) {
            options.physicsConfig.defaultMaterial = 'ba21476f-2866-4f81-9c4d-6e359316e448';
        }
    }
    // customLayers
    if (!options.customLayers) {
        options.customLayers = customLayers;
    }
    // sortingLayers
    if (!options.sortingLayers) {
        if (sortingLayers) {
            options.sortingLayers = sortingLayers;
        }
    }
    // macro 配置
    if (!options.macroConfig) {
        if (macroConfig) {
            options.macroConfig = macroConfig;
        }
    }
    if (!options.includeModules || !options.includeModules.length) {
        options.includeModules = includeModules;
    }
    if (!options.flags) {
        options.flags = {
            LOAD_BULLET_MANUALLY: false,
            LOAD_SPINE_MANUALLY: false,
        };
    }
    if (!options.splashScreen) {
        options.splashScreen = engine_1.Engine.getConfig().splashScreen;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLW9wdGlvbnMtdmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci9zaGFyZS9jb21tb24tb3B0aW9ucy12YWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7Ozs7QUF1Q0gsa0NBaUJDO0FBTUQsMENBV0M7QUFPRCxrREFPQztBQWlCRCxzQ0FTQztBQUdELHNEQWVDO0FBT0QsMERBbUJDO0FBeUNELDRDQWFDO0FBRUQsb0RBSUM7QUFFRCxvRUFtR0M7QUFNRCwwREFTQztBQUVELHNFQVVDO0FBUUQsd0VBNkJDO0FBRUQsa0RBMERDO0FBeGJELCtCQUFrRDtBQUNsRCxpREFBd0Q7QUFDeEQsMkRBQXNEO0FBSXRELDJEQUFtQztBQUNuQyw2REFBcUM7QUFDckMsdUVBQXNEO0FBQ3RELHlDQUFzQztBQUN0QyxzRUFBNkM7QUFDN0MsMkRBQXVEO0FBTTFDLFFBQUEscUJBQXFCLEdBQWlDO0lBQy9ELE9BQU8sRUFBRTtRQUNMLEtBQUssRUFBRSxDQUFDLEdBQVcsRUFBRSxFQUFFO1lBQ25CLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUNELE9BQU8sRUFBRSx5QkFBeUI7S0FDckM7SUFDRCxZQUFZLEVBQUU7UUFDVixLQUFLLEVBQUUsQ0FBQyxHQUFXLEVBQUUsRUFBRTtZQUNuQixPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUNELE9BQU8sRUFBRSx5QkFBeUI7S0FDckM7Q0FDSixDQUFDO0FBRUY7Ozs7R0FJRztBQUNILFNBQWdCLFdBQVcsQ0FBQyxNQUF5QjtJQUNqRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FB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QUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM1RCxPQUFPLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNqQixPQUFPLENBQUMsS0FBSyxHQUFHO1lBQ1osb0JBQW9CLEVBQUUsS0FBSztZQUMzQixtQkFBbUIsRUFBRSxLQUFLO1NBQzdCLENBQUM7SUFDTixDQUFDO0lBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN4QixPQUFPLENBQUMsWUFBWSxHQUFHLGVBQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxZQUFZLENBQUM7SUFDM0QsQ0FBQztBQUVMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICog5qCh6aqM5p6E5bu66YCa55So6YWN572u5Y+C5pWwXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgYmFzZW5hbWUsIGlzQWJzb2x1dGUsIGpvaW4gfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgQnVuZGxlQ29tcHJlc3Npb25UeXBlcyB9IGZyb20gJy4vYnVuZGxlLXV0aWxzJztcclxuaW1wb3J0IHsgTkFUSVZFX1BMQVRGT1JNIH0gZnJvbSAnLi9wbGF0Zm9ybXMtb3B0aW9ucyc7XHJcbmltcG9ydCB7IElCdWlsZFNjZW5lSXRlbSwgSUJ1aWxkVGFza0l0ZW1KU09OLCBJQnVpbGRUYXNrT3B0aW9uIH0gZnJvbSAnLi4vQHR5cGVzJztcclxuaW1wb3J0IHsgSUludGVybmFsQnVpbGRTY2VuZUl0ZW0gfSBmcm9tICcuLi9AdHlwZXMvb3B0aW9ucyc7XHJcbmltcG9ydCB7IEJ1aWxkQ2hlY2tSZXN1bHQsIEJ1bmRsZUNvbXByZXNzaW9uVHlwZSwgSUludGVybmFsQnVpbGRPcHRpb25zLCBJSW50ZXJuYWxCdW5kbGVCdWlsZE9wdGlvbnMgfSBmcm9tICcuLi9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IGkxOG4gZnJvbSAnLi4vLi4vYmFzZS9pMThuJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uL2Jhc2UvdXRpbHMnO1xyXG5pbXBvcnQgYXNzZXRNYW5hZ2VyIGZyb20gJy4uLy4uL2Fzc2V0cy9tYW5hZ2VyL2Fzc2V0JztcclxuaW1wb3J0IHsgRW5naW5lIH0gZnJvbSAnLi4vLi4vZW5naW5lJztcclxuaW1wb3J0IGJ1aWxkZXJDb25maWcgZnJvbSAnLi9idWlsZGVyLWNvbmZpZyc7XHJcbmltcG9ydCB7IHZhbGlkYXRvck1hbmFnZXIgfSBmcm9tICcuL3ZhbGlkYXRvci1tYW5hZ2VyJztcclxuaW50ZXJmYWNlIE1vZHVsZUNvbmZpZyB7XHJcbiAgICBtYXRjaDogKG1vZHVsZTogc3RyaW5nKSA9PiBib29sZWFuO1xyXG4gICAgZGVmYXVsdDogc3RyaW5nIHwgYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IG92ZXJ3cml0ZU1vZHVsZUNvbmZpZzogUmVjb3JkPHN0cmluZywgTW9kdWxlQ29uZmlnPiA9IHtcclxuICAgIHBoeXNpY3M6IHtcclxuICAgICAgICBtYXRjaDogKGtleTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBrZXkuc3RhcnRzV2l0aCgncGh5c2ljcy0nKSAmJiAha2V5LnN0YXJ0c1dpdGgoJ3BoeXNpY3MtMmQnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlZmF1bHQ6ICdpbmhlcml0LXByb2plY3Qtc2V0dGluZycsXHJcbiAgICB9LFxyXG4gICAgJ3BoeXNpY3MtMmQnOiB7XHJcbiAgICAgICAgbWF0Y2g6IChrZXk6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ga2V5LnN0YXJ0c1dpdGgoJ3BoeXNpY3MtMmQtJyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZWZhdWx0OiAnaW5oZXJpdC1wcm9qZWN0LXNldHRpbmcnLFxyXG4gICAgfSxcclxufTtcclxuXHJcbi8qKlxyXG4gKiDmoKHpqozlnLrmma/mlbDmja5cclxuICogQHJldHVybnMg5qCh6aqM57uT5p6cXHJcbiAqIEBwYXJhbSBzY2VuZXNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja1NjZW5lcyhzY2VuZXM6IElCdWlsZFNjZW5lSXRlbVtdKTogYm9vbGVhbiB8IEVycm9yIHtcclxuICAgIGlmICghQXJyYXkuaXNBcnJheShzY2VuZXMpIHx8ICFzY2VuZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBFcnJvcignU2NlbmVzIGlzIGVtcHR5Jyk7XHJcbiAgICB9XHJcbiAgICBjb25zdCB2YWxpZFNjZW5lcyA9IHNjZW5lcy5maWx0ZXIoKHNjZW5lKSA9PiBzY2VuZSAmJiBzY2VuZS51dWlkKTtcclxuICAgIGlmICh2YWxpZFNjZW5lcy5sZW5ndGggIT09IHNjZW5lcy5sZW5ndGgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IEVycm9yKGkxOG4udCgnYnVpbGRlci5lcnJvci5taXNzaW5nX3NjZW5lcycpKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZXMgPSB2YWxpZFNjZW5lcy5tYXAoKHNjZW5lKSA9PiBhc3NldE1hbmFnZXIucXVlcnlVcmwoc2NlbmUudXVpZCkpO1xyXG4gICAgY29uc3QgaW52YWxpZEluZGV4ID0gcmVzLmZpbmRJbmRleCgodXJsKSA9PiAhdXJsKTtcclxuICAgIGlmIChpbnZhbGlkSW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihpMThuLnQoJ2J1aWxkZXIuZXJyb3IubWlzc2luZ19zY2VuZXMnLCB7XHJcbiAgICAgICAgICAgIHVybDogdmFsaWRTY2VuZXNbaW52YWxpZEluZGV4XS51cmwsXHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbi8qKlxyXG4gICog56Gu6K6k5Yid5aeL5Zy65pmv5a+56ZSZXHJcbiAgKiBAcGFyYW0gdXVpZE9yVXJsIFxyXG4gICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja1N0YXJ0U2NlbmUodXVpZE9yVXJsOiBzdHJpbmcpOiBib29sZWFuIHwgRXJyb3Ige1xyXG4gICAgY29uc3QgYXNzZXQgPSBhc3NldE1hbmFnZXIucXVlcnlBc3NldCh1dWlkT3JVcmwpO1xyXG4gICAgaWYgKCFhc3NldCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRXJyb3IoYGNhbiBub3QgZmluZCBhc3NldCBieSB1dWlkIG9yIHVybCAke3V1aWRPclVybH1gKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGJ1bmRsZURpckluZm9zID0gYXNzZXRNYW5hZ2VyLnF1ZXJ5QXNzZXRzKHsgaXNCdW5kbGU6IHRydWUgfSk7XHJcbiAgICBpZiAoYnVuZGxlRGlySW5mb3MuZmluZCgoaW5mbykgPT4gYXNzZXQudXJsLnN0YXJ0c1dpdGgoaW5mby51cmwgKyAnLycpKSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRXJyb3IoYGFzc2V0ICR7dXVpZE9yVXJsfSBpcyBpbiBidW5kbGUsIGNhbiBub3QgYmUgc2V0IGFzIHN0YXJ0IHNjZW5lYCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbi8qKlxyXG4gICog5qC55o2u6L6T5YWl55qE5paH5Lu25aS55ZKM55uu5qCH5ZCN56ew6K6h566X5LiN5ZKM5pys5Zyw5Yay56qB55qE5paH5Lu25Zyw5Z2AXHJcbiAgKiBAcGFyYW0gcm9vdFxyXG4gICogQHBhcmFtIGRpck5hbWVcclxuICAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FsY1ZhbGlkT3V0cHV0TmFtZShyb290OiBzdHJpbmcsIGRpck5hbWU6IHN0cmluZywgcGxhdGZvcm06IHN0cmluZywgaWQ/OiBzdHJpbmcpIHtcclxuICAgIGlmICghcm9vdCB8fCAhZGlyTmFtZSkge1xyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuICAgIGxldCBkZXN0ID0gam9pbihVdGlscy5QYXRoLnJlc29sdmVUb1Jhdyhyb290KSwgZGlyTmFtZSk7XHJcbiAgICBkZXN0ID0gVXRpbHMuRmlsZS5nZXROYW1lKGRlc3QpO1xyXG4gICAgcmV0dXJuIGJhc2VuYW1lKGRlc3QpO1xyXG59XHJcblxyXG4vLyDliJvlu7ogdGFza01hcCDkuK0gYnVpbGRQYXRoIOWtl+WFuFxyXG5mdW5jdGlvbiBjcmVhdGVCdWlsZFBhdGhEaWN0KHRhc2tNYXA6IFJlY29yZDxzdHJpbmcsIElCdWlsZFRhc2tJdGVtSlNPTj4pIHtcclxuICAgIGNvbnN0IGJ1aWxkUGF0aERpY3Q6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHt9O1xyXG4gICAgZm9yIChjb25zdCBrZXkgaW4gdGFza01hcCkge1xyXG4gICAgICAgIGNvbnN0IHRhc2s6IElCdWlsZFRhc2tJdGVtSlNPTiA9IHRhc2tNYXBba2V5XTtcclxuICAgICAgICBjb25zdCB0YXNrQnVpbGRQYXRoID0gVXRpbHMuUGF0aC5yZXNvbHZlVG9SYXcodGFzay5vcHRpb25zLmJ1aWxkUGF0aCk7XHJcbiAgICAgICAgaWYgKCFidWlsZFBhdGhEaWN0W3Rhc2tCdWlsZFBhdGhdKSB7XHJcbiAgICAgICAgICAgIGJ1aWxkUGF0aERpY3RbdGFza0J1aWxkUGF0aF0gPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnVpbGRQYXRoRGljdFt0YXNrQnVpbGRQYXRoXS5wdXNoKHRhc2sub3B0aW9ucy5vdXRwdXROYW1lKTtcclxuICAgIH1cclxuICAgIHJldHVybiBidWlsZFBhdGhEaWN0O1xyXG59XHJcblxyXG4vLyDliKTmlq3ovpPlh7rot6/lvoTmmK/lkKbkuI4gdGFza01hcCDkuK3nmoTot6/lvoTlhrLnqoFcclxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQ29uZmxpY3QoYnVpbGRQYXRoOiBzdHJpbmcsIG91dHB1dE5hbWU6IHN0cmluZywgYnVpbGRQYXRoRGljdDogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+KSB7XHJcbiAgICAvLyDlkIwgYnVpbGRQYXRoIOS4iyBvdXRwdXROYW1lIOaYr+WQpumHjeWkjVxyXG4gICAgY29uc3Qgb3V0cHV0TmFtZXMgPSBidWlsZFBhdGhEaWN0W2J1aWxkUGF0aF0gfHwgW107XHJcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2Ygb3V0cHV0TmFtZXMpIHtcclxuICAgICAgICBpZiAob3V0cHV0TmFtZSA9PT0gbmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbi8vIOeUn+aIkOaWsOeahOi+k+WHuuebruW9leWQjeensFxyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVOZXdPdXRwdXROYW1lKGJ1aWxkUGF0aDogc3RyaW5nLCBwbGF0Zm9ybTogc3RyaW5nLCBidWlsZFBhdGhEaWN0OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4pIHtcclxuICAgIC8vIOiOt+WPluWQjCBidWlsZFBhdGgg5LiLIHBsYXRmb3JtIOi+k+WHuuebruW9leeahOacgOmrmOW6j+WPt1xyXG4gICAgY29uc3Qgb3V0cHV0TmFtZXMgPSBidWlsZFBhdGhEaWN0W2J1aWxkUGF0aF0gfHwgW107XHJcbiAgICBsZXQgbWF4SW5kZXggPSAwO1xyXG4gICAgZm9yIChjb25zdCBuYW1lIG9mIG91dHB1dE5hbWVzKSB7XHJcbiAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aChwbGF0Zm9ybSArICctJykpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBwYXJzZUludChuYW1lLnN1YnN0cmluZyhwbGF0Zm9ybS5sZW5ndGggKyAxKSwgMTApO1xyXG4gICAgICAgICAgICBpZiAoIWlzTmFOKGluZGV4KSAmJiBpbmRleCA+IG1heEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBtYXhJbmRleCA9IGluZGV4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8g55Sf5oiQ5paw55qE6L6T5Ye655uu5b2V5ZCNXHJcbiAgICBjb25zdCBuZXdJbmRleCA9IChtYXhJbmRleCArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoMywgJzAnKTtcclxuICAgIHJldHVybiBgJHtwbGF0Zm9ybX0tJHtuZXdJbmRleH1gO1xyXG59XHJcblxyXG4vKipcclxuICog5qOA5p+l6Lev5b6E5piv5ZCm5peg5pWIXHJcbiAqIEBwYXJhbSBwYXRoIFxyXG4gKiBAcmV0dXJucyBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja0J1aWxkUGF0aElzSW52YWxpZChwYXRoOiBzdHJpbmcpIHtcclxuICAgIGlmICghcGF0aCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKHBhdGguc3RhcnRzV2l0aCgncHJvamVjdDovLycpKSB7XHJcbiAgICAgICAgY29uc3QgbWF0Y2hJbmZvID0gcGF0aC5tYXRjaCgvXihbYS16QS16XSopOlxcL1xcLyguKikkLyk7XHJcbiAgICAgICAgaWYgKG1hdGNoSW5mbykge1xyXG4gICAgICAgICAgICBjb25zdCByZWxQYXRoID0gbWF0Y2hJbmZvWzJdLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcclxuICAgICAgICAgICAgLy8g6LaF5Ye66aG555uu5aSW55qE55u45a+56Lev5b6E5Lul5Y+KIHByb2plY3Q6Ly8g5LiL5Li657ud5a+56Lev5b6E55qE5Zyw5Z2A5peg5pWIXHJcbiAgICAgICAgICAgIGlmIChpc0Fic29sdXRlKHJlbFBhdGgpIHx8IHJlbFBhdGguaW5jbHVkZXMoJy4uLycpIHx8IHJlbFBhdGguc3RhcnRzV2l0aCgnLycpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKCFpc0Fic29sdXRlKHBhdGgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLyoqXHJcbiAgKiDmoKHpqozkvKDlhaXnmoTlvJXmk47mqKHlnZfkv6Hmga9cclxuICAqIEBwYXJhbSB2YWx1ZVtdXHJcbiAgKiBAcmV0dXJucyDmoKHpqoznu5PmnpxcclxuICAqL1xyXG5mdW5jdGlvbiBjaGVja0luY2x1ZGVNb2R1bGVzKG1vZHVsZXM6IHN0cmluZ1tdKTogYm9vbGVhbiB8IHN0cmluZyB7XHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkobW9kdWxlcykpIHtcclxuICAgICAgICByZXR1cm4gYCBpbmNsdWRlTW9kdWxlcygke21vZHVsZXN9KSBzaG91bGQgYmUgYW4gYXJyYXkhYDtcclxuICAgIH1cclxuICAgIC8vIFRPRE8g5qCh6aqM5piv5ZCm5YyF5ZCr5LiA5Lqb5byV5pOO55qE5b+F6aG75qih5Z2XXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuLy8gZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENvbW1vbk9wdGlvbnMocGxhdGZvcm06IFBsYXRmb3JtLCB1c2VEZWZhdWx0ID0gZmFsc2UpIHtcclxuLy8gICAgIGNvbnN0IGNvbW1vbkNvbmZpZyA9IGF3YWl0IGJ1aWxkZXJDb25maWcuZ2V0UHJvamVjdDxJQnVpbGRDb21tb25PcHRpb25zPignY29tbW9uJywgdXNlRGVmYXVsdCA/ICdkZWZhdWx0JyA6ICdwcm9qZWN0Jyk7XHJcbi8vICAgICBjb25zdCByZXN1bHQ6IElCdWlsZFRhc2tPcHRpb248UGxhdGZvcm0+ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb21tb25Db25maWcpKTtcclxuLy8gICAgIGlmICghdXNlRGVmYXVsdCkge1xyXG4vLyAgICAgICAgIGNvbnN0IHBsYXRmb3JtQ3VzdG9tQ29tbW9uT3B0aW9ucyA9IGF3YWl0IGJ1aWxkZXJDb25maWcuZ2V0UHJvamVjdDxJQnVpbGRDb21tb25PcHRpb25zPihgcGxhdGZvcm1zLiR7cGxhdGZvcm19YCk7XHJcbi8vICAgICAgICAgaWYgKHBsYXRmb3JtQ3VzdG9tQ29tbW9uT3B0aW9ucykge1xyXG4vLyAgICAgICAgICAgICBPYmplY3Qua2V5cyhwbGF0Zm9ybUN1c3RvbUNvbW1vbk9wdGlvbnMpLmZvckVhY2goKGtleSkgPT4ge1xyXG4vLyAgICAgICAgICAgICAgICAgaWYgKHBsYXRmb3JtQ3VzdG9tQ29tbW9uT3B0aW9uc1trZXkgYXMga2V5b2YgSUJ1aWxkQ29tbW9uT3B0aW9uc10gIT09IHVuZGVmaW5lZCkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuLy8gICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHBsYXRmb3JtQ3VzdG9tQ29tbW9uT3B0aW9uc1trZXkgYXMga2V5b2YgSUJ1aWxkQ29tbW9uT3B0aW9uc107XHJcbi8vICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgIH1cclxuLy8gICAgIH1cclxuLy8gICAgIC8vIOWcuuaZr+S/oeaBr+S4jeS9v+eUqOeUqOaIt+S/ruaUuei/h+eahOaVsOaNru+8jOi/memDqOWIhuS/oeaBr+WSjOi1hOa6kOebuOWFs+iBlOaVsOaNrue7j+W4uOS8muWPmOWMlu+8jOS4jeWtmOWCqOS9v+eUqFxyXG4vLyAgICAgcmVzdWx0LnNjZW5lcyA9IGF3YWl0IGdldERlZmF1bHRTY2VuZXMoKTtcclxuLy8gICAgIGlmICghKGF3YWl0IGNoZWNrU3RhcnRTY2VuZShyZXN1bHQuc3RhcnRTY2VuZSkpKSB7XHJcbi8vICAgICAgICAgcmVzdWx0LnN0YXJ0U2NlbmUgPSBhd2FpdCBnZXREZWZhdWx0U3RhcnRTY2VuZSgpO1xyXG4vLyAgICAgfVxyXG4vLyAgICAgaWYgKCFyZXN1bHQuc3RhcnRTY2VuZSkge1xyXG4vLyAgICAgICAgIGNvbnNvbGUuZXJyb3IoaTE4bi50KCdidWlsZGVyLmVycm9yLmludmFsaWRTdGFydFNjZW5lJykpO1xyXG4vLyAgICAgfVxyXG4vLyAgICAgcmVzdWx0LnBsYXRmb3JtID0gcGxhdGZvcm07XHJcbi8vICAgICByZXR1cm4gcmVzdWx0O1xyXG4vLyB9XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdFNjZW5lcygpOiBJSW50ZXJuYWxCdWlsZFNjZW5lSXRlbVtdIHtcclxuICAgIGNvbnN0IHNjZW5lcyA9IGFzc2V0TWFuYWdlci5xdWVyeUFzc2V0cyh7IGNjVHlwZTogJ2NjLlNjZW5lQXNzZXQnLCBwYXR0ZXJuOiAnIWRiOi8vaW50ZXJuYWwvZGVmYXVsdF9maWxlX2NvbnRlbnQvKiovKicgfSk7XHJcbiAgICBpZiAoIXNjZW5lcykge1xyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuICAgIGNvbnN0IGRpcmVjdG9yeSA9IGFzc2V0TWFuYWdlci5xdWVyeUFzc2V0cyh7IGlzQnVuZGxlOiB0cnVlIH0pO1xyXG4gICAgcmV0dXJuIHNjZW5lcy5tYXAoKGFzc2V0KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdXJsOiBhc3NldC51cmwsXHJcbiAgICAgICAgICAgIHV1aWQ6IGFzc2V0LnV1aWQsXHJcbiAgICAgICAgICAgIGJ1bmRsZTogZGlyZWN0b3J5LmZpbmQoKGRpcikgPT4gYXNzZXQudXJsLnN0YXJ0c1dpdGgoZGlyLnVybCArICcvJykpPy51cmwgfHwgJycsXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdFN0YXJ0U2NlbmUoKSB7XHJcbiAgICBjb25zdCBzY2VuZXMgPSBnZXREZWZhdWx0U2NlbmVzKCk7XHJcbiAgICBjb25zdCByZWFsU2NlbmVzID0gc2NlbmVzLmZpbHRlcigoaXRlbTogYW55KSA9PiAhaXRlbS5idW5kbGUpO1xyXG4gICAgcmV0dXJuIHJlYWxTY2VuZXNbMF0gJiYgcmVhbFNjZW5lc1swXS51dWlkO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tCdWlsZENvbW1vbk9wdGlvbnNCeUtleShrZXk6IHN0cmluZywgdmFsdWU6IGFueSwgb3B0aW9uczogSUJ1aWxkVGFza09wdGlvbik6IFByb21pc2U8QnVpbGRDaGVja1Jlc3VsdCB8IG51bGw+IHtcclxuICAgIGNvbnN0IHJlczogQnVpbGRDaGVja1Jlc3VsdCA9IHtcclxuICAgICAgICBlcnJvcjogJycsXHJcbiAgICAgICAgbmV3VmFsdWU6IHZhbHVlLFxyXG4gICAgICAgIGxldmVsOiAnZXJyb3InLFxyXG4gICAgfTtcclxuICAgIHN3aXRjaCAoa2V5KSB7XHJcbiAgICAgICAgY2FzZSAnc2NlbmVzJzpcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBjaGVja1NjZW5lcyh2YWx1ZSkgfHwgZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5lcnJvciA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLm5ld1ZhbHVlID0gZ2V0RGVmYXVsdFNjZW5lcygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgJ3N0YXJ0U2NlbmUnOlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGNoZWNrU3RhcnRTY2VuZSh2YWx1ZSkgfHwgZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5lcnJvciA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLm5ld1ZhbHVlID0gZ2V0RGVmYXVsdFN0YXJ0U2NlbmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBjYXNlICdtYWluQnVuZGxlSXNSZW1vdGUnOlxyXG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgb3B0aW9ucy5tYWluQnVuZGxlQ29tcHJlc3Npb25UeXBlID09PSBCdW5kbGVDb21wcmVzc2lvblR5cGVzLlNVQlBBQ0tBR0UpIHtcclxuICAgICAgICAgICAgICAgIHJlcy5uZXdWYWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVycm9yID0gJyBidW5kbGUgY2FuIG5vdCBiZSByZW1vdGUgd2hlbiBjb21wcmVzc2lvbiB0eXBlIGlzIHN1YnBhY2thZ2UhJztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghdmFsdWUgJiYgb3B0aW9ucy5tYWluQnVuZGxlQ29tcHJlc3Npb25UeXBlID09PSBCdW5kbGVDb21wcmVzc2lvblR5cGVzLlpJUCkge1xyXG4gICAgICAgICAgICAgICAgcmVzLm5ld1ZhbHVlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJlcy5lcnJvciA9ICcgYnVuZGxlIG11c3QgYmUgcmVtb3RlIHdoZW4gY29tcHJlc3Npb24gdHlwZSBpcyB6aXAhJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgICAgIGNhc2UgJ291dHB1dE5hbWUnOlxyXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXMuZXJyb3IgPSAnIG91dHB1dE5hbWUgY2FuIG5vdCBiZSBlbXB0eSc7XHJcbiAgICAgICAgICAgICAgICByZXMubmV3VmFsdWUgPSBhd2FpdCBjYWxjVmFsaWRPdXRwdXROYW1lKG9wdGlvbnMuYnVpbGRQYXRoLCBvcHRpb25zLnBsYXRmb3JtLCBvcHRpb25zLnBsYXRmb3JtKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIEhBQ0sg5Y6f55Sf5bmz5Y+w5LiN5pSv5oyB5Lit5paH5ZKM54m55q6K56ym5Y+3XHJcbiAgICAgICAgICAgICAgICBpZiAoTkFUSVZFX1BMQVRGT1JNLmluY2x1ZGVzKG9wdGlvbnMucGxhdGZvcm0pICYmIGNoZWNrSW5jbHVkZUNoaW5lc2VBbmRTeW1ib2wodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmVycm9yID0gJ2kxOG46YnVpbGRlci5lcnJvci5idWlsZFBhdGhDb250YWluc0NoaW5lc2VBbmRTeW1ib2wnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3Rhc2tOYW1lJzpcclxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzLmVycm9yID0gJyB0YXNrTmFtZSBjYW4gbm90IGJlIGVtcHR5JztcclxuICAgICAgICAgICAgICAgIHJlcy5uZXdWYWx1ZSA9IG9wdGlvbnMub3V0cHV0TmFtZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdidWlsZFBhdGgnOlxyXG4gICAgICAgICAgICBpZiAoIXZhbHVlIHx8IHZhbHVlID09PSAncHJvamVjdDovLycpIHtcclxuICAgICAgICAgICAgICAgIHJlcy5lcnJvciA9ICcgYnVpbGRQYXRoIGNhbiBub3QgYmUgZW1wdHknO1xyXG4gICAgICAgICAgICAgICAgcmVzLm5ld1ZhbHVlID0gJ3Byb2plY3Q6Ly9idWlsZCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hlY2tCdWlsZFBhdGhJc0ludmFsaWQodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXMuZXJyb3IgPSAnYnVpbGRQYXRoIGlzIGludmFsaWQhJztcclxuICAgICAgICAgICAgICAgIHJlcy5uZXdWYWx1ZSA9ICdwcm9qZWN0Oi8vYnVpbGQnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8g5re75Yqg5a+55pen54mI5pys55u45a+56Lev5b6E55qE6L2s5o2i5pSv5oyBXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5zdGFydHNXaXRoKCcuJykpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdwcm9qZWN0Oi8vJyArIHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSB8fCAhaXNBYnNvbHV0ZShVdGlscy5QYXRoLnJlc29sdmVUb1Jhdyh2YWx1ZSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmVycm9yID0gYGJ1aWxkUGF0aCgke3ZhbHVlfSkgaXMgaW52YWxpZCFgO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5uZXdWYWx1ZSA9ICdwcm9qZWN0Oi8vYnVpbGQnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gaGFjayDljp/nlJ/lubPlj7DkuI3mlK/mjIHkuK3mloflkoznibnmrornrKblj7dcclxuICAgICAgICAgICAgICAgIGlmIChOQVRJVkVfUExBVEZPUk0uaW5jbHVkZXMob3B0aW9ucy5wbGF0Zm9ybSkgJiYgY2hlY2tJbmNsdWRlQ2hpbmVzZUFuZFN5bWJvbCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXMuZXJyb3IgPSAnaTE4bjpidWlsZGVyLmVycm9yLmJ1aWxkUGF0aENvbnRhaW5zQ2hpbmVzZUFuZFN5bWJvbCc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbWQ1Q2FjaGUnOlxyXG4gICAgICAgIGNhc2UgJ2RlYnVnJzpcclxuICAgICAgICBjYXNlICd1c2VTcGxhc2hTY3JlZW4nOlxyXG4gICAgICAgIGNhc2UgJ21lcmdlU3RhcnRTY2VuZSc6XHJcbiAgICAgICAgY2FzZSAnZXhwZXJpbWVudGFsRXJhc2VNb2R1bGVzJzpcclxuICAgICAgICBjYXNlICdzb3VyY2VNYXBzJzpcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAndHJ1ZScpIHtcclxuICAgICAgICAgICAgICAgIHJlcy5uZXdWYWx1ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09ICdmYWxzZScpIHtcclxuICAgICAgICAgICAgICAgIHJlcy5uZXdWYWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3NlcnZlcic6XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlcy5lcnJvciA9IGF3YWl0IHZhbGlkYXRvck1hbmFnZXIuY2hlY2soXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUsXHJcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRlckNvbmZpZy5jb21tb25PcHRpb25Db25maWdzLnNlcnZlci52ZXJpZnlSdWxlcyB8fCBbXSxcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucGxhdGZvcm0gKyBvcHRpb25zLnBsYXRmb3JtLFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHJldHVybiByZXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNoZWNrSW5jbHVkZUNoaW5lc2VBbmRTeW1ib2wodmFsdWU6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIC9bYH4hIyQlXiYqKz08Pj8ne318LDsnwrd+77yBI++/pSXigKbigKYmKu+8iO+8iSs9e31844CK44CL77yf77ya4oCc4oCd44CQ44CR44CB77yb4oCYJ++8jOOAguOAgUBcXHU0ZTAwLVxcdTlmYTVdL2ltLnRlc3QodmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tCdWlsZENvbW1vbk9wdGlvbnMob3B0aW9uczogYW55KSB7XHJcbiAgICBjb25zdCBjb21tb25PcHRpb25zID0gYnVpbGRlckNvbmZpZy5nZXRCdWlsZENvbW1vbk9wdGlvbnMoKTtcclxuICAgIGNvbnN0IGNoZWNrUmVzTWFwOiBSZWNvcmQ8c3RyaW5nLCBCdWlsZENoZWNrUmVzdWx0PiA9IHt9O1xyXG4gICAgLy8gY29uc3QgY2hlY2tLZXlzID0gQXJyYXkuZnJvbShuZXcgU2V0KE9iamVjdC5rZXlzKGNvbW1vbk9wdGlvbnMpLmNvbmNhdChPYmplY3Qua2V5cyhvcHRpb25zKSkpKVxyXG4gICAgLy8g5q2j5bi45p2l6K+05bqU6K+l5qOA5p+l6buY6K6k5YC85ZKMIG9wdGlvbnMg5pW05ZCI55qEIGtleVxyXG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoY29tbW9uT3B0aW9ucykpIHtcclxuICAgICAgICBjaGVja1Jlc01hcFtrZXldID0gYXdhaXQgY2hlY2tCdWlsZENvbW1vbk9wdGlvbnNCeUtleShrZXksIG9wdGlvbnNba2V5XSwgb3B0aW9ucykgfHwgeyBuZXdWYWx1ZTogb3B0aW9uc1trZXldLCBlcnJvcjogJycsIGxldmVsOiAnZXJyb3InIH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY2hlY2tSZXNNYXA7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja0J1bmRsZUNvbXByZXNzaW9uU2V0dGluZyh2YWx1ZTogQnVuZGxlQ29tcHJlc3Npb25UeXBlLCBzdXBwb3J0ZWRDb21wcmVzc2lvblR5cGVzOiBCdW5kbGVDb21wcmVzc2lvblR5cGVbXSkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0ge1xyXG4gICAgICAgIGVycm9yOiAnJyxcclxuICAgICAgICBuZXdWYWx1ZTogdmFsdWUsXHJcbiAgICB9O1xyXG4gICAgaWYgKHN1cHBvcnRlZENvbXByZXNzaW9uVHlwZXMgJiYgLTEgPT09IHN1cHBvcnRlZENvbXByZXNzaW9uVHlwZXMuaW5kZXhPZih2YWx1ZSkpIHtcclxuICAgICAgICByZXN1bHQubmV3VmFsdWUgPSBCdW5kbGVDb21wcmVzc2lvblR5cGVzLk1FUkdFX0RFUDtcclxuICAgICAgICByZXN1bHQuZXJyb3IgPSBgIGNvbXByZXNzaW9uIHR5cGUoJHt2YWx1ZX0pIGlzIGludmFsaWQgZm9yIHRoaXMgcGxhdGZvcm0hYDtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuLyoqXHJcbiAqIOaVtOWQiOaehOW7uumFjee9rueahOW8leaTjuaooeWdl+mFjee9rlxyXG4gKiDop4TliJnvvJpcclxuICogICDlrZfmrrXlgLzkuLrluIPlsJTlgLzvvIzliJnlvZPliY3lgLzkvZzkuLrmraTmqKHlnZfnmoTlvIDlhbNcclxuICogICDlrZfmrrXlgLzkuLrlrZfnrKbkuLLvvIzliJnmoLnmja4gb3ZlcndyaXRlTW9kdWxlQ29uZmlnIOmFjee9ruWAvOi/m+ihjOWJlOmZpOabv+aNolxyXG4gKiBAcGFyYW0gb3B0aW9ucyBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVPdmVyd3JpdGVQcm9qZWN0U2V0dGluZ3Mob3B0aW9uczogSUJ1aWxkVGFza09wdGlvbikge1xyXG4gICAgY29uc3Qgb3ZlcndyaXRlTW9kdWxlcyA9IG9wdGlvbnMub3ZlcndyaXRlUHJvamVjdFNldHRpbmdzPy5pbmNsdWRlTW9kdWxlcztcclxuICAgIGxldCBpbmNsdWRlTW9kdWxlcyA9IG9wdGlvbnMuaW5jbHVkZU1vZHVsZXM7XHJcbiAgICBpZiAoaW5jbHVkZU1vZHVsZXMgJiYgb3ZlcndyaXRlTW9kdWxlcyAmJiBpbmNsdWRlTW9kdWxlcy5sZW5ndGgpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZSBpbiBvdmVyd3JpdGVNb2R1bGVzKSB7XHJcbiAgICAgICAgICAgIGlmIChvdmVyd3JpdGVNb2R1bGVzW21vZHVsZV0gIT09ICdpbmhlcml0LXByb2plY3Qtc2V0dGluZycpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAob3ZlcndyaXRlTW9kdWxlc1ttb2R1bGVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnb24nOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdWRlTW9kdWxlcy5wdXNoKG1vZHVsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ29mZic6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1ZGVNb2R1bGVzID0gaW5jbHVkZU1vZHVsZXMuZmlsdGVyKChlbmdpbmVNb2R1bGUpID0+IGVuZ2luZU1vZHVsZSAhPT0gbW9kdWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG92ZXJ3cml0ZU1vZHVsZUNvbmZpZ1ttb2R1bGVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvdmVyd3JpdGVNb2R1bGVJbmRleCA9IGluY2x1ZGVNb2R1bGVzLmZpbmRJbmRleChvdmVyd3JpdGVNb2R1bGVDb25maWdbbW9kdWxlXS5tYXRjaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob3ZlcndyaXRlTW9kdWxlSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5pyq5byA5ZCv5qih5Z2X5pe277yM5pu/5o2i5peg5pWIXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVkZU1vZHVsZXMuc3BsaWNlKG92ZXJ3cml0ZU1vZHVsZUluZGV4LCAxLCBvdmVyd3JpdGVNb2R1bGVzW21vZHVsZV0gYXMgc3RyaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSW52YWxpZCBvdmVyd3JpdGUgY29uZmlnIG9mIGVuZ2luZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgb3B0aW9ucy5pbmNsdWRlTW9kdWxlcyA9IEFycmF5LmZyb20obmV3IFNldChpbmNsdWRlTW9kdWxlcykpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tQcm9qZWN0U2V0dGluZyhvcHRpb25zOiBJSW50ZXJuYWxCdWlsZE9wdGlvbnMgfCBJSW50ZXJuYWxCdW5kbGVCdWlsZE9wdGlvbnMpIHtcclxuICAgIG9wdGlvbnMuZW5naW5lSW5mbyA9IG9wdGlvbnMuZW5naW5lSW5mbyB8fCBFbmdpbmUuZ2V0SW5mbygpO1xyXG5cclxuICAgIGNvbnN0IHsgZGVzaWduUmVzb2x1dGlvbiwgcmVuZGVyUGlwZWxpbmUsIHBoeXNpY3NDb25maWcsIGN1c3RvbUxheWVycywgc29ydGluZ0xheWVycywgbWFjcm9Db25maWcsIGluY2x1ZGVNb2R1bGVzIH0gPSBFbmdpbmUuZ2V0Q29uZmlnKCk7XHJcbiAgICAvLyDpu5jorqQgQ2FudmFzIOiuvue9rlxyXG4gICAgaWYgKCFvcHRpb25zLmRlc2lnblJlc29sdXRpb24pIHtcclxuICAgICAgICBvcHRpb25zLmRlc2lnblJlc29sdXRpb24gPSBkZXNpZ25SZXNvbHV0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlbmRlclBpcGVsaW5lXHJcbiAgICBpZiAoIW9wdGlvbnMucmVuZGVyUGlwZWxpbmUpIHtcclxuICAgICAgICBpZiAocmVuZGVyUGlwZWxpbmUpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5yZW5kZXJQaXBlbGluZSA9IHJlbmRlclBpcGVsaW5lO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBwaHlzaWNzQ29uZmlnXHJcbiAgICBpZiAoIW9wdGlvbnMucGh5c2ljc0NvbmZpZykge1xyXG4gICAgICAgIG9wdGlvbnMucGh5c2ljc0NvbmZpZyA9IHBoeXNpY3NDb25maWc7XHJcbiAgICAgICAgaWYgKCFvcHRpb25zLnBoeXNpY3NDb25maWcuZGVmYXVsdE1hdGVyaWFsKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMucGh5c2ljc0NvbmZpZy5kZWZhdWx0TWF0ZXJpYWwgPSAnYmEyMTQ3NmYtMjg2Ni00ZjgxLTljNGQtNmUzNTkzMTZlNDQ4JztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY3VzdG9tTGF5ZXJzXHJcbiAgICBpZiAoIW9wdGlvbnMuY3VzdG9tTGF5ZXJzKSB7XHJcbiAgICAgICAgb3B0aW9ucy5jdXN0b21MYXllcnMgPSBjdXN0b21MYXllcnM7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc29ydGluZ0xheWVyc1xyXG4gICAgaWYgKCFvcHRpb25zLnNvcnRpbmdMYXllcnMpIHtcclxuICAgICAgICBpZiAoc29ydGluZ0xheWVycykge1xyXG4gICAgICAgICAgICBvcHRpb25zLnNvcnRpbmdMYXllcnMgPSBzb3J0aW5nTGF5ZXJzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBtYWNybyDphY3nva5cclxuICAgIGlmICghb3B0aW9ucy5tYWNyb0NvbmZpZykge1xyXG4gICAgICAgIGlmIChtYWNyb0NvbmZpZykge1xyXG4gICAgICAgICAgICBvcHRpb25zLm1hY3JvQ29uZmlnID0gbWFjcm9Db25maWc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghb3B0aW9ucy5pbmNsdWRlTW9kdWxlcyB8fCAhb3B0aW9ucy5pbmNsdWRlTW9kdWxlcy5sZW5ndGgpIHtcclxuICAgICAgICBvcHRpb25zLmluY2x1ZGVNb2R1bGVzID0gaW5jbHVkZU1vZHVsZXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFvcHRpb25zLmZsYWdzKSB7XHJcbiAgICAgICAgb3B0aW9ucy5mbGFncyA9IHtcclxuICAgICAgICAgICAgTE9BRF9CVUxMRVRfTUFOVUFMTFk6IGZhbHNlLFxyXG4gICAgICAgICAgICBMT0FEX1NQSU5FX01BTlVBTExZOiBmYWxzZSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghb3B0aW9ucy5zcGxhc2hTY3JlZW4pIHtcclxuICAgICAgICBvcHRpb25zLnNwbGFzaFNjcmVlbiA9IEVuZ2luZS5nZXRDb25maWcoKS5zcGxhc2hTY3JlZW47XHJcbiAgICB9XHJcblxyXG59Il19