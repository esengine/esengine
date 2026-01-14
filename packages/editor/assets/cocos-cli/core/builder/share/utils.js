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
exports.compareNumeric = compareNumeric;
exports.compareUUID = compareNumeric;
exports.getOptionsDefault = getOptionsDefault;
exports.checkCompressOptions = checkCompressOptions;
exports.warnModuleFallBack = warnModuleFallBack;
exports.transTimeToNumber = transTimeToNumber;
exports.getTaskLogDest = getTaskLogDest;
exports.getCurrentTime = getCurrentTime;
exports.changeToLocalTime = changeToLocalTime;
exports.checkHasError = checkHasError;
exports.getParamsFromCommand = getParamsFromCommand;
exports.checkConfigDefault = checkConfigDefault;
exports.defaultsDeep = defaultsDeep;
exports.defaultMerge = defaultMerge;
exports.getBuildPath = getBuildPath;
exports.requestModule = requestModule;
exports.formatMSTime = formatMSTime;
exports.resolveToRaw = resolveToRaw;
const path_1 = require("path");
const textureCompressConfig = __importStar(require("../share/texture-compress"));
const i18n_1 = __importDefault(require("../../base/i18n"));
const utils_1 = __importDefault(require("../../base/utils"));
const builder_config_1 = __importDefault(require("./builder-config"));
function compareNumeric(lhs, rhs) {
    return lhs.localeCompare(rhs, 'en', { numeric: true });
}
/**
 * 解析配置 options 内的默认值
 * @param options
 */
function getOptionsDefault(options) {
    const result = {};
    Object.keys(options).forEach((key) => {
        result[key] = options[key].default;
    });
    return result;
}
function checkCompressOptions(configs) {
    if (!configs || typeof configs !== 'object' || Array.isArray(configs)) {
        console.error(i18n_1.default.t('builder.project.texture_compress.tips.require_object'));
        return false;
    }
    const platforms = Object.keys(textureCompressConfig.configGroups);
    for (const key of Object.keys(configs)) {
        const item = configs[key];
        if (!item || typeof item !== 'object') {
            console.error(i18n_1.default.t('builder.project.texture_compress.tips.xx_require_object', {
                name: `${key}(${item})`,
            }));
            return false;
        }
        if (!item.name) {
            console.error(i18n_1.default.t('builder.project.texture_compress.tips.require_name'));
            return false;
        }
        if (!item.options || typeof item.options !== 'object' || Array.isArray(item)) {
            console.error(i18n_1.default.t('builder.project.texture_compress.tips.xx_require_object', {
                name: 'options',
            }));
            return false;
        }
        for (const configPlatform of Object.keys(item.options)) {
            if (!platforms.includes(configPlatform)) {
                console.error(i18n_1.default.t('builder.project.texture_compress.tips.platform_err', {
                    name: 'options',
                    supportPlatforms: platforms.toString(),
                }));
                return false;
            }
            const compressOptions = item.options[configPlatform];
            for (const textureCompressType of Object.keys(compressOptions)) {
                // const config = textureCompressConfig.formatsInfo[textureCompressType];
                // if (!config) {
                //     console.error(i18n.t('builder.project.texture_compress.tips.texture_type_err', {
                //         format: textureCompressType,
                //         supportFormats: Object.keys(textureCompressConfig.formatsInfo).toString(),
                //     }));
                //     return false;
                // }
                // // @ts-ignore
                // const qualityOptions = textureCompressConfig.textureFormatConfigs[config.formatType];
                // const value = compressOptions[textureCompressType];
                // if (config.formatType !== 'number') {
                //     if (!Object.keys(qualityOptions.options).includes(value)) {
                //         console.error(i18n.t('builder.project.texture_compress.tips.options_quality_type_err', {
                //             userformatType: value,
                //             formatType: config.formatType,
                //             formatTypeOptions: Object.keys(qualityOptions.options).toString(),
                //         }));
                //         return false;
                //     }
                // } else {
                //     if (typeof value !== 'number' || value < qualityOptions.min || value > qualityOptions.max) {
                //         console.error(i18n.t('builder.project.texture_compress.tips.options_quality_type_err', {
                //             userformatType: value,
                //             min: qualityOptions.min,
                //             max: qualityOptions.max,
                //         }));
                //         return false;
                //     }
                // }
            }
        }
    }
    return true;
}
async function warnModuleFallBack(moduleToFallBack, platform) {
    if (!Object.keys(moduleToFallBack).length) {
        return;
    }
    const fallbackMsg = Object.keys(moduleToFallBack).reduce((prev, curr, index) => {
        if (index === 1) {
            return changeFallbackStr(prev) + `, ${changeFallbackStr(curr, moduleToFallBack[curr])}`;
        }
        return prev + `, ${changeFallbackStr(curr, moduleToFallBack[curr])}`;
    });
    return console.warn(i18n_1.default.t('builder.warn.engine_modules_fall_back_tip', {
        platform,
        fallbackMsg,
    }));
}
function changeFallbackStr(module, fallback) {
    return fallback ? `${module} -> ${fallback}` : `${module}×`;
}
/**
 * 将路径名称的时间转为时间戳
 * @param time
 * @returns
 */
function transTimeToNumber(time) {
    time = (0, path_1.basename)(time, '.log');
    const info = time.match(/-(\d+)$/);
    if (info) {
        const timeStr = Array.from(time);
        timeStr[info.index] = ':';
        return new Date(timeStr.join('')).getTime();
    }
    return new Date().getTime();
}
/**
 * 获取一个可作为构建任务日志的路径(project://temp/builder/log/xxx2019-3-20 16-00.log)
 * @param taskName
 * @param time
 * @returns
 */
function getTaskLogDest(taskName, time) {
    return utils_1.default.Path.resolveToUrl((0, path_1.join)(builder_config_1.default.projectTempDir, 'builder', 'log', taskName + changeToLocalTime(time, 5).replace(/:/g, '-') + '.log'), 'project');
}
/**
 * 获取可阅读的最新时间信息（2023-4-24 17:31:54）
 */
function getCurrentTime() {
    return changeToLocalTime(Date.now());
}
/**
 * 将时间戳转为可阅读的时间信息（2023-4-24 17:31:54）
 * @param t
 */
function changeToLocalTime(t, len = 8) {
    const time = new Date(Number(t));
    return time.toLocaleDateString().replace(/\//g, '-') + ' ' + time.toTimeString().slice(0, len);
}
/**
 * 检查传递的 errorMap 内是否包含错误字符串信息
 * @param errorMap
 * @returns boolean true：存在错误
 */
function checkHasError(errorMap) {
    if (!errorMap) {
        return false;
    }
    if (typeof errorMap === 'object' && !Array.isArray(errorMap)) {
        for (const key of Object.keys(errorMap)) {
            const res = checkHasError(errorMap[key]);
            if (res) {
                return true;
            }
        }
    }
    else if (typeof errorMap === 'string') {
        return true;
    }
    return false;
}
/**
 * 从命令中提取参数
 * @param command
 * @returns
 */
function getParamsFromCommand(command) {
    if (!command) {
        return [];
    }
    const matchInfo = command.match(/\$\{([^${}]*)}/g);
    if (!matchInfo) {
        return [];
    }
    return matchInfo.map((str) => str.replace('${', '').replace('}', ''));
}
function checkConfigDefault(config) {
    if (!config) {
        return null;
    }
    if (config.default !== undefined && config.default !== null) {
        return config.default;
    }
    if (config.type === 'array' && config.items) {
        config.default = [];
        // array items can be a single config or an array of configs
        const items = Array.isArray(config.items) ? config.items : [config.items];
        items.forEach((item, index) => {
            config.default[index] = checkConfigDefault(item);
        });
    }
    if (config.type === 'object' && config.properties) {
        config.default = {};
        Object.keys(config.properties).forEach((itemKey) => {
            config.default[itemKey] = checkConfigDefault(config.properties[itemKey]);
        });
    }
    return config.default;
}
function defaultsDeep(data, defaultData) {
    if (data === undefined || data === null) {
        return data;
    }
    if (Array.isArray(data)) {
        return data;
    }
    Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (typeof value === 'object' && !Array.isArray(value) && value) {
            if (!data[key]) {
                data[key] = {};
            }
            defaultsDeep(data[key], value);
            return;
        }
        if (data[key] === undefined || data[key] === null) {
            data[key] = value;
        }
    });
    return data;
}
function defaultMerge(target, ...sources) {
    // 遍历 sources 数组中的每一个源对象
    for (const source of sources) {
        // 如果源对象为空或不是一个对象，跳过
        if (!source || typeof source !== 'object') {
            continue;
        }
        // 遍历源对象的所有可枚举属性
        for (const key in source) {
            // 如果目标对象没有该属性，直接复制
            if (!(key in target)) {
                target[key] = source[key];
            }
            else {
                // 如果目标对象已经有该属性，且该属性的值是对象类型，递归合并
                if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    // 如果自定义合并函数存在，则调用自定义合并函数，否则递归调用 mergeWith() 方法合并
                    target[key] = defaultMerge(target[key], source[key]);
                }
                else {
                    // 否则直接使用源对象的属性覆盖目标对象的属性
                    target[key] = source[key];
                }
            }
        }
    }
    // 返回合并后的目标对象
    return target;
}
function getBuildPath(options) {
    return (0, path_1.join)(utils_1.default.Path.resolveToRaw(options.buildPath), options.outputName || options.platform);
}
/**
 * 执行某个模块的方法或者获取某个模块的属性值
 * @param module
 * @param key
 * @param args
 */
async function requestModule(module, key, ...args) {
    try {
        if (typeof module === 'function') {
            return await module[key](...args);
        }
        return module[key];
    }
    catch (error) {
        console.debug(error);
        return null;
    }
}
/**
 * 将毫秒时间转换为时分秒
 * @param msTime
 */
function formatMSTime(msTime) {
    const time = msTime / 1000;
    let res = '';
    const hour = Math.floor(time / 60 / 60);
    if (hour) {
        res = `${hour} h`;
    }
    const minute = (Math.floor(time / 60) % 60);
    if (minute) {
        res += ` ${minute} min`;
    }
    const second = (Math.floor(time) % 60);
    if (second) {
        res += ` ${second} s`;
    }
    const ms = msTime - (hour * 60 * 60 + minute * 60 + second) * 1000;
    // 产品需求：不足秒时才显示毫秒
    if (ms && !res) {
        res += ` ${ms} ms`;
    }
    return res.trimStart();
}
function resolveToRaw(urlOrPath, root) {
    if ((0, path_1.isAbsolute)(urlOrPath)) {
        return urlOrPath;
    }
    else {
        return (0, path_1.join)(root, urlOrPath);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3NoYXJlL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBT0Esd0NBRUM7QUFFMEIscUNBQVc7QUFNdEMsOENBTUM7QUFFRCxvREF3RUM7QUFFRCxnREFjQztBQVdELDhDQVNDO0FBUUQsd0NBRUM7QUFLRCx3Q0FFQztBQU1ELDhDQUdDO0FBT0Qsc0NBZUM7QUFPRCxvREFTQztBQUVELGdEQXNCQztBQUVELG9DQXFCQztBQUVELG9DQTBCQztBQUVELG9DQUVDO0FBUUQsc0NBVUM7QUFNRCxvQ0FxQkM7QUFFRCxvQ0FNQztBQXpVRCwrQkFBdUU7QUFDdkUsaUZBQW1FO0FBQ25FLDJEQUFtQztBQUNuQyw2REFBcUM7QUFFckMsc0VBQTZDO0FBRTdDLFNBQWdCLGNBQWMsQ0FBQyxHQUFXLEVBQUUsR0FBVztJQUNuRCxPQUFPLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFJRDs7O0dBR0c7QUFDSCxTQUFnQixpQkFBaUIsQ0FBQyxPQUF3QjtJQUN0RCxNQUFNLE1BQU0sR0FBd0IsRUFBRSxDQUFDO0lBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDakMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7SUFDdkMsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBRUQsU0FBZ0Isb0JBQW9CLENBQUMsT0FBWTtJQUM3QyxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sT0FBTyxLQUFL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RCxNQUFNLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztJQUNuRSxpQkFBaUI7SUFDakIsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNiLEdBQUcsSUFBSSxJQUFJLEVBQUUsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxPQUFPLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLFNBQWlCLEVBQUUsSUFBWTtJQUN4RCxJQUFJLElBQUEsaUJBQVUsRUFBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7U0FBTSxDQUFDO1FBQ0osT0FBTyxJQUFBLFdBQUksRUFBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDakMsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiYXNlbmFtZSwgaXNBYnNvbHV0ZSwgam9pbiwgbm9ybWFsaXplLCByZWxhdGl2ZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgKiBhcyB0ZXh0dXJlQ29tcHJlc3NDb25maWcgZnJvbSAnLi4vc2hhcmUvdGV4dHVyZS1jb21wcmVzcyc7XHJcbmltcG9ydCBpMThuIGZyb20gJy4uLy4uL2Jhc2UvaTE4bic7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9iYXNlL3V0aWxzJztcclxuaW1wb3J0IHsgSUJ1aWxkT3B0aW9uQmFzZSwgSUJ1aWxkVGFza09wdGlvbiwgSURpc3BsYXlPcHRpb25zIH0gZnJvbSAnLi4vQHR5cGVzJztcclxuaW1wb3J0IGJ1aWxkZXJDb25maWcgZnJvbSAnLi9idWlsZGVyLWNvbmZpZyc7XHJcbmltcG9ydCB7IElCdWlsZGVyQ29uZmlnSXRlbSB9IGZyb20gJy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5leHBvcnQgZnVuY3Rpb24gY29tcGFyZU51bWVyaWMobGhzOiBzdHJpbmcsIHJoczogc3RyaW5nKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBsaHMubG9jYWxlQ29tcGFyZShyaHMsICdlbicsIHsgbnVtZXJpYzogdHJ1ZSB9KTtcclxufVxyXG5cclxuZXhwb3J0IHsgY29tcGFyZU51bWVyaWMgYXMgY29tcGFyZVVVSUQgfTtcclxuXHJcbi8qKlxyXG4gKiDop6PmnpDphY3nva4gb3B0aW9ucyDlhoXnmoTpu5jorqTlgLxcclxuICogQHBhcmFtIG9wdGlvbnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRPcHRpb25zRGVmYXVsdChvcHRpb25zOiBJRGlzcGxheU9wdGlvbnMpIHtcclxuICAgIGNvbnN0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xyXG4gICAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgcmVzdWx0W2tleV0gPSBvcHRpb25zW2tleV0uZGVmYXVsdDtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQ29tcHJlc3NPcHRpb25zKGNvbmZpZ3M6IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCFjb25maWdzIHx8IHR5cGVvZiBjb25maWdzICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KGNvbmZpZ3MpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihpMThuLnQoJ2J1aWxkZXIucHJvamVjdC50ZXh0dXJlX2NvbXByZXNzLnRpcHMucmVxdWlyZV9vYmplY3QnKSk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBsYXRmb3JtcyA9IE9iamVjdC5rZXlzKHRleHR1cmVDb21wcmVzc0NvbmZpZy5jb25maWdHcm91cHMpO1xyXG5cclxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGNvbmZpZ3MpKSB7XHJcbiAgICAgICAgY29uc3QgaXRlbSA9IGNvbmZpZ3Nba2V5XTtcclxuICAgICAgICBpZiAoIWl0ZW0gfHwgdHlwZW9mIGl0ZW0gIT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoaTE4bi50KCdidWlsZGVyLnByb2plY3QudGV4dHVyZV9jb21wcmVzcy50aXBzLnh4X3JlcXVpcmVfb2JqZWN0Jywge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogYCR7a2V5fSgke2l0ZW19KWAsXHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWl0ZW0ubmFtZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGkxOG4udCgnYnVpbGRlci5wcm9qZWN0LnRleHR1cmVfY29tcHJlc3MudGlwcy5yZXF1aXJlX25hbWUnKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghaXRlbS5vcHRpb25zIHx8IHR5cGVvZiBpdGVtLm9wdGlvbnMgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoaXRlbSkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihpMThuLnQoJ2J1aWxkZXIucHJvamVjdC50ZXh0dXJlX2NvbXByZXNzLnRpcHMueHhfcmVxdWlyZV9vYmplY3QnLCB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnb3B0aW9ucycsXHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGNvbnN0IGNvbmZpZ1BsYXRmb3JtIG9mIE9iamVjdC5rZXlzKGl0ZW0ub3B0aW9ucykpIHtcclxuICAgICAgICAgICAgaWYgKCFwbGF0Zm9ybXMuaW5jbHVkZXMoY29uZmlnUGxhdGZvcm0pKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGkxOG4udCgnYnVpbGRlci5wcm9qZWN0LnRleHR1cmVfY29tcHJlc3MudGlwcy5wbGF0Zm9ybV9lcnInLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ29wdGlvbnMnLFxyXG4gICAgICAgICAgICAgICAgICAgIHN1cHBvcnRQbGF0Zm9ybXM6IHBsYXRmb3Jtcy50b1N0cmluZygpLFxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBjb21wcmVzc09wdGlvbnMgPSBpdGVtLm9wdGlvbnNbY29uZmlnUGxhdGZvcm1dO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRleHR1cmVDb21wcmVzc1R5cGUgb2YgT2JqZWN0LmtleXMoY29tcHJlc3NPcHRpb25zKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc3QgY29uZmlnID0gdGV4dHVyZUNvbXByZXNzQ29uZmlnLmZvcm1hdHNJbmZvW3RleHR1cmVDb21wcmVzc1R5cGVdO1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKCFjb25maWcpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmVycm9yKGkxOG4udCgnYnVpbGRlci5wcm9qZWN0LnRleHR1cmVfY29tcHJlc3MudGlwcy50ZXh0dXJlX3R5cGVfZXJyJywge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBmb3JtYXQ6IHRleHR1cmVDb21wcmVzc1R5cGUsXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIHN1cHBvcnRGb3JtYXRzOiBPYmplY3Qua2V5cyh0ZXh0dXJlQ29tcHJlc3NDb25maWcuZm9ybWF0c0luZm8pLnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgIC8vIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIC8vIGNvbnN0IHF1YWxpdHlPcHRpb25zID0gdGV4dHVyZUNvbXByZXNzQ29uZmlnLnRleHR1cmVGb3JtYXRDb25maWdzW2NvbmZpZy5mb3JtYXRUeXBlXTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnN0IHZhbHVlID0gY29tcHJlc3NPcHRpb25zW3RleHR1cmVDb21wcmVzc1R5cGVdO1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKGNvbmZpZy5mb3JtYXRUeXBlICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGlmICghT2JqZWN0LmtleXMocXVhbGl0eU9wdGlvbnMub3B0aW9ucykuaW5jbHVkZXModmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUuZXJyb3IoaTE4bi50KCdidWlsZGVyLnByb2plY3QudGV4dHVyZV9jb21wcmVzcy50aXBzLm9wdGlvbnNfcXVhbGl0eV90eXBlX2VycicsIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIHVzZXJmb3JtYXRUeXBlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIGZvcm1hdFR5cGU6IGNvbmZpZy5mb3JtYXRUeXBlLFxyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgZm9ybWF0VHlwZU9wdGlvbnM6IE9iamVjdC5rZXlzKHF1YWxpdHlPcHRpb25zLm9wdGlvbnMpLnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicgfHwgdmFsdWUgPCBxdWFsaXR5T3B0aW9ucy5taW4gfHwgdmFsdWUgPiBxdWFsaXR5T3B0aW9ucy5tYXgpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY29uc29sZS5lcnJvcihpMThuLnQoJ2J1aWxkZXIucHJvamVjdC50ZXh0dXJlX2NvbXByZXNzLnRpcHMub3B0aW9uc19xdWFsaXR5X3R5cGVfZXJyJywge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgdXNlcmZvcm1hdFR5cGU6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgbWluOiBxdWFsaXR5T3B0aW9ucy5taW4sXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBtYXg6IHF1YWxpdHlPcHRpb25zLm1heCxcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3YXJuTW9kdWxlRmFsbEJhY2sobW9kdWxlVG9GYWxsQmFjazogUmVjb3JkPHN0cmluZywgc3RyaW5nPiwgcGxhdGZvcm06IHN0cmluZykge1xyXG4gICAgaWYgKCFPYmplY3Qua2V5cyhtb2R1bGVUb0ZhbGxCYWNrKS5sZW5ndGgpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBmYWxsYmFja01zZyA9IE9iamVjdC5rZXlzKG1vZHVsZVRvRmFsbEJhY2spLnJlZHVjZSgocHJldiwgY3VyciwgaW5kZXgpID0+IHtcclxuICAgICAgICBpZiAoaW5kZXggPT09IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNoYW5nZUZhbGxiYWNrU3RyKHByZXYpICsgYCwgJHtjaGFuZ2VGYWxsYmFja1N0cihjdXJyLCBtb2R1bGVUb0ZhbGxCYWNrW2N1cnJdKX1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcHJldiArIGAsICR7Y2hhbmdlRmFsbGJhY2tTdHIoY3VyciwgbW9kdWxlVG9GYWxsQmFja1tjdXJyXSl9YDtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNvbnNvbGUud2FybihpMThuLnQoJ2J1aWxkZXIud2Fybi5lbmdpbmVfbW9kdWxlc19mYWxsX2JhY2tfdGlwJywge1xyXG4gICAgICAgIHBsYXRmb3JtLFxyXG4gICAgICAgIGZhbGxiYWNrTXNnLFxyXG4gICAgfSkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjaGFuZ2VGYWxsYmFja1N0cihtb2R1bGU6IHN0cmluZywgZmFsbGJhY2s/OiBzdHJpbmcpIHtcclxuICAgIHJldHVybiBmYWxsYmFjayA/IGAke21vZHVsZX0gLT4gJHtmYWxsYmFja31gIDogYCR7bW9kdWxlfcOXYDtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWwhui3r+W+hOWQjeensOeahOaXtumXtOi9rOS4uuaXtumXtOaIs1xyXG4gKiBAcGFyYW0gdGltZSBcclxuICogQHJldHVybnMgXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNUaW1lVG9OdW1iZXIodGltZTogc3RyaW5nKSB7XHJcbiAgICB0aW1lID0gYmFzZW5hbWUodGltZSwgJy5sb2cnKTtcclxuICAgIGNvbnN0IGluZm8gPSB0aW1lLm1hdGNoKC8tKFxcZCspJC8pO1xyXG4gICAgaWYgKGluZm8pIHtcclxuICAgICAgICBjb25zdCB0aW1lU3RyID0gQXJyYXkuZnJvbSh0aW1lKTtcclxuICAgICAgICB0aW1lU3RyW2luZm8uaW5kZXghXSA9ICc6JztcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUodGltZVN0ci5qb2luKCcnKSkuZ2V0VGltZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG59XHJcblxyXG4vKipcclxuICog6I635Y+W5LiA5Liq5Y+v5L2c5Li65p6E5bu65Lu75Yqh5pel5b+X55qE6Lev5b6EKHByb2plY3Q6Ly90ZW1wL2J1aWxkZXIvbG9nL3h4eDIwMTktMy0yMCAxNi0wMC5sb2cpXHJcbiAqIEBwYXJhbSB0YXNrTmFtZSBcclxuICogQHBhcmFtIHRpbWUgXHJcbiAqIEByZXR1cm5zIFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhc2tMb2dEZXN0KHRhc2tOYW1lOiBzdHJpbmcsIHRpbWU6IG51bWJlciB8IHN0cmluZykge1xyXG4gICAgcmV0dXJuIFV0aWxzLlBhdGgucmVzb2x2ZVRvVXJsKGpvaW4oYnVpbGRlckNvbmZpZy5wcm9qZWN0VGVtcERpciwgJ2J1aWxkZXInLCAnbG9nJywgdGFza05hbWUgKyBjaGFuZ2VUb0xvY2FsVGltZSh0aW1lLCA1KS5yZXBsYWNlKC86L2csICctJykgKyAnLmxvZycpLCAncHJvamVjdCcpO1xyXG59XHJcblxyXG4vKipcclxuICog6I635Y+W5Y+v6ZiF6K+755qE5pyA5paw5pe26Ze05L+h5oGv77yIMjAyMy00LTI0IDE3OjMxOjU077yJXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudFRpbWUoKSB7XHJcbiAgICByZXR1cm4gY2hhbmdlVG9Mb2NhbFRpbWUoRGF0ZS5ub3coKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDlsIbml7bpl7TmiLPovazkuLrlj6/pmIXor7vnmoTml7bpl7Tkv6Hmga/vvIgyMDIzLTQtMjQgMTc6MzE6NTTvvIlcclxuICogQHBhcmFtIHQgXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2hhbmdlVG9Mb2NhbFRpbWUodDogbnVtYmVyIHwgc3RyaW5nLCBsZW4gPSA4KSB7XHJcbiAgICBjb25zdCB0aW1lID0gbmV3IERhdGUoTnVtYmVyKHQpKTtcclxuICAgIHJldHVybiB0aW1lLnRvTG9jYWxlRGF0ZVN0cmluZygpLnJlcGxhY2UoL1xcLy9nLCAnLScpICsgJyAnICsgdGltZS50b1RpbWVTdHJpbmcoKS5zbGljZSgwLCBsZW4pO1xyXG59XHJcblxyXG4vKipcclxuICog5qOA5p+l5Lyg6YCS55qEIGVycm9yTWFwIOWGheaYr+WQpuWMheWQq+mUmeivr+Wtl+espuS4suS/oeaBr1xyXG4gKiBAcGFyYW0gZXJyb3JNYXAgXHJcbiAqIEByZXR1cm5zIGJvb2xlYW4gdHJ1Ze+8muWtmOWcqOmUmeivr1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrSGFzRXJyb3IoZXJyb3JNYXA/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIWVycm9yTWFwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBlcnJvck1hcCA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoZXJyb3JNYXApKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZXJyb3JNYXApKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGNoZWNrSGFzRXJyb3IoZXJyb3JNYXBba2V5XSk7XHJcbiAgICAgICAgICAgIGlmIChyZXMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXJyb3JNYXAgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDku47lkb3ku6TkuK3mj5Dlj5blj4LmlbBcclxuICogQHBhcmFtIGNvbW1hbmQgXHJcbiAqIEByZXR1cm5zIFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmFtc0Zyb21Db21tYW5kKGNvbW1hbmQ6IHN0cmluZykge1xyXG4gICAgaWYgKCFjb21tYW5kKSB7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbWF0Y2hJbmZvID0gY29tbWFuZC5tYXRjaCgvXFwkXFx7KFteJHt9XSopfS9nKTtcclxuICAgIGlmICghbWF0Y2hJbmZvKSB7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1hdGNoSW5mby5tYXAoKHN0cikgPT4gc3RyLnJlcGxhY2UoJyR7JywgJycpLnJlcGxhY2UoJ30nLCAnJykpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tDb25maWdEZWZhdWx0KGNvbmZpZzogSUJ1aWxkZXJDb25maWdJdGVtKTogYW55IHtcclxuICAgIGlmICghY29uZmlnKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAoY29uZmlnLmRlZmF1bHQgIT09IHVuZGVmaW5lZCAmJiBjb25maWcuZGVmYXVsdCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBjb25maWcuZGVmYXVsdDtcclxuICAgIH1cclxuICAgIGlmIChjb25maWcudHlwZSA9PT0gJ2FycmF5JyAmJiBjb25maWcuaXRlbXMpIHtcclxuICAgICAgICBjb25maWcuZGVmYXVsdCA9IFtdO1xyXG4gICAgICAgIC8vIGFycmF5IGl0ZW1zIGNhbiBiZSBhIHNpbmdsZSBjb25maWcgb3IgYW4gYXJyYXkgb2YgY29uZmlnc1xyXG4gICAgICAgIGNvbnN0IGl0ZW1zID0gQXJyYXkuaXNBcnJheShjb25maWcuaXRlbXMpID8gY29uZmlnLml0ZW1zIDogW2NvbmZpZy5pdGVtc107XHJcbiAgICAgICAgaXRlbXMuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgY29uZmlnLmRlZmF1bHQhW2luZGV4XSA9IGNoZWNrQ29uZmlnRGVmYXVsdChpdGVtIGFzIElCdWlsZGVyQ29uZmlnSXRlbSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpZiAoY29uZmlnLnR5cGUgPT09ICdvYmplY3QnICYmIGNvbmZpZy5wcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgY29uZmlnLmRlZmF1bHQgPSB7fTtcclxuICAgICAgICBPYmplY3Qua2V5cyhjb25maWcucHJvcGVydGllcykuZm9yRWFjaCgoaXRlbUtleSkgPT4ge1xyXG4gICAgICAgICAgICBjb25maWcuZGVmYXVsdCFbaXRlbUtleV0gPSBjaGVja0NvbmZpZ0RlZmF1bHQoY29uZmlnLnByb3BlcnRpZXNbaXRlbUtleV0gYXMgSUJ1aWxkZXJDb25maWdJdGVtKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBjb25maWcuZGVmYXVsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRzRGVlcChkYXRhOiBhbnksIGRlZmF1bHREYXRhOiBhbnkpIHtcclxuICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQgfHwgZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfVxyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH1cclxuICAgIE9iamVjdC5rZXlzKGRlZmF1bHREYXRhKS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IGRlZmF1bHREYXRhW2tleV07XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGlmICghZGF0YVtrZXldKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB7fTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWZhdWx0c0RlZXAoZGF0YVtrZXldLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhdGFba2V5XSA9PT0gdW5kZWZpbmVkIHx8IGRhdGFba2V5XSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBkYXRhO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdE1lcmdlKHRhcmdldDogUmVjb3JkPHN0cmluZywgYW55PiwgLi4uc291cmNlczogUmVjb3JkPHN0cmluZywgYW55PltdKSB7XHJcbiAgICAvLyDpgY3ljoYgc291cmNlcyDmlbDnu4TkuK3nmoTmr4/kuIDkuKrmupDlr7nosaFcclxuICAgIGZvciAoY29uc3Qgc291cmNlIG9mIHNvdXJjZXMpIHtcclxuICAgICAgICAvLyDlpoLmnpzmupDlr7nosaHkuLrnqbrmiJbkuI3mmK/kuIDkuKrlr7nosaHvvIzot7Pov4dcclxuICAgICAgICBpZiAoIXNvdXJjZSB8fCB0eXBlb2Ygc291cmNlICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g6YGN5Y6G5rqQ5a+56LGh55qE5omA5pyJ5Y+v5p6a5Li+5bGe5oCnXHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XHJcbiAgICAgICAgICAgIC8vIOWmguaenOebruagh+WvueixoeayoeacieivpeWxnuaAp++8jOebtOaOpeWkjeWItlxyXG4gICAgICAgICAgICBpZiAoIShrZXkgaW4gdGFyZ2V0KSkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIOWmguaenOebruagh+WvueixoeW3sue7j+acieivpeWxnuaAp++8jOS4lOivpeWxnuaAp+eahOWAvOaYr+Wvueixoeexu+Wei++8jOmAkuW9kuWQiOW5tlxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2Vba2V5XSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoc291cmNlW2tleV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c6Ieq5a6a5LmJ5ZCI5bm25Ye95pWw5a2Y5Zyo77yM5YiZ6LCD55So6Ieq5a6a5LmJ5ZCI5bm25Ye95pWw77yM5ZCm5YiZ6YCS5b2S6LCD55SoIG1lcmdlV2l0aCgpIOaWueazleWQiOW5tlxyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gZGVmYXVsdE1lcmdlKHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWQpuWImeebtOaOpeS9v+eUqOa6kOWvueixoeeahOWxnuaAp+imhuebluebruagh+WvueixoeeahOWxnuaAp1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyDov5Tlm57lkIjlubblkI7nmoTnm67moIflr7nosaFcclxuICAgIHJldHVybiB0YXJnZXQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRCdWlsZFBhdGgob3B0aW9uczogSUJ1aWxkT3B0aW9uQmFzZSkge1xyXG4gICAgcmV0dXJuIGpvaW4oVXRpbHMuUGF0aC5yZXNvbHZlVG9SYXcob3B0aW9ucy5idWlsZFBhdGgpLCBvcHRpb25zLm91dHB1dE5hbWUgfHwgb3B0aW9ucy5wbGF0Zm9ybSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmiafooYzmn5DkuKrmqKHlnZfnmoTmlrnms5XmiJbogIXojrflj5bmn5DkuKrmqKHlnZfnmoTlsZ7mgKflgLxcclxuICogQHBhcmFtIG1vZHVsZSBcclxuICogQHBhcmFtIGtleSBcclxuICogQHBhcmFtIGFyZ3MgXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVxdWVzdE1vZHVsZShtb2R1bGU6IGFueSwga2V5OiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBtb2R1bGVba2V5XSguLi5hcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1vZHVsZVtrZXldO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmRlYnVnKGVycm9yKTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOWwhuavq+enkuaXtumXtOi9rOaNouS4uuaXtuWIhuenklxyXG4gKiBAcGFyYW0gbXNUaW1lIFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdE1TVGltZShtc1RpbWU6IG51bWJlcikge1xyXG4gICAgY29uc3QgdGltZSA9IG1zVGltZSAvIDEwMDA7XHJcbiAgICBsZXQgcmVzID0gJyc7XHJcbiAgICBjb25zdCBob3VyID0gTWF0aC5mbG9vcih0aW1lIC8gNjAgLyA2MCk7XHJcbiAgICBpZiAoaG91cikge1xyXG4gICAgICAgIHJlcyA9IGAke2hvdXJ9IGhgO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbWludXRlID0gKE1hdGguZmxvb3IodGltZSAvIDYwKSAlIDYwKTtcclxuICAgIGlmIChtaW51dGUpIHtcclxuICAgICAgICByZXMgKz0gYCAke21pbnV0ZX0gbWluYDtcclxuICAgIH1cclxuICAgIGNvbnN0IHNlY29uZCA9IChNYXRoLmZsb29yKHRpbWUpICUgNjApO1xyXG4gICAgaWYgKHNlY29uZCkge1xyXG4gICAgICAgIHJlcyArPSBgICR7c2Vjb25kfSBzYDtcclxuICAgIH1cclxuICAgIGNvbnN0IG1zID0gbXNUaW1lIC0gKGhvdXIgKiA2MCAqIDYwICsgbWludXRlICogNjAgKyBzZWNvbmQpICogMTAwMDtcclxuICAgIC8vIOS6p+WTgemcgOaxgu+8muS4jei2s+enkuaXtuaJjeaYvuekuuavq+enklxyXG4gICAgaWYgKG1zICYmICFyZXMpIHtcclxuICAgICAgICByZXMgKz0gYCAke21zfSBtc2A7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzLnRyaW1TdGFydCgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVRvUmF3KHVybE9yUGF0aDogc3RyaW5nLCByb290OiBzdHJpbmcpIHtcclxuICAgIGlmIChpc0Fic29sdXRlKHVybE9yUGF0aCkpIHtcclxuICAgICAgICByZXR1cm4gdXJsT3JQYXRoO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gam9pbihyb290LCB1cmxPclBhdGgpO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==