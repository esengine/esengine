"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginManager = exports.PluginManager = void 0;
const events_1 = __importDefault(require("events"));
const path_1 = require("path");
const common_options_validator_1 = require("../share/common-options-validator");
const platforms_options_1 = require("../share/platforms-options");
const validator_manager_1 = require("../share/validator-manager");
const utils_1 = require("../share/utils");
const utils_2 = __importDefault(require("../../base/utils"));
const i18n_1 = __importDefault(require("../../base/i18n"));
const lodash_1 = __importDefault(require("lodash"));
const texture_compress_1 = require("../share/texture-compress");
const console_1 = require("../../base/console");
const builder_config_1 = __importDefault(require("../share/builder-config"));
const global_1 = require("../../../global");
const fs_1 = require("fs");
const utils_3 = __importDefault(require("../../base/utils"));
const fs_extra_1 = require("fs-extra");
// 对外支持的对外公开的资源处理方法汇总
const CustomAssetHandlerTypes = ['compressTextures'];
const pluginRoots = [
    (0, path_1.join)(__dirname, '../platforms'),
    (0, path_1.join)(global_1.GlobalPaths.workspace, 'packages/platforms'),
];
function getRegisterInfo(root, dirName) {
    const packageJSONPath = (0, path_1.join)(root, 'package.json');
    if ((0, fs_1.existsSync)(packageJSONPath)) {
        const packageJSON = require(packageJSONPath);
        const builder = packageJSON.contributes.builder;
        if (!builder.register) {
            return null;
        }
        return {
            platform: builder.platform,
            hooks: builder.hooks ? (0, path_1.join)(root, builder.hooks) : undefined,
            config: require((0, path_1.join)(root, builder.config)).default,
            path: root,
            type: 'register',
        };
    }
    if (utils_3.default.Path.contains(global_1.GlobalPaths.workspace, root)) {
        if (platforms_options_1.PLATFORMS.includes(dirName)) {
            return {
                platform: (0, path_1.basename)(root),
                path: root,
                config: require((0, path_1.join)(root, 'config')).default,
                hooks: (0, path_1.join)(root, 'hooks'),
                type: 'register',
            };
        }
        return null;
    }
    throw new Error(`Can not find package.json in root: ${root}`);
}
async function scanPluginRoot(root) {
    const dirNames = (0, fs_1.readdirSync)(root);
    const res = [];
    for (const dirName of dirNames) {
        try {
            const registerInfo = await getRegisterInfo((0, path_1.join)(root, dirName), dirName);
            registerInfo && res.push(registerInfo);
        }
        catch (error) {
            console.error(error);
            console.error(`Register platform package failed in root: ${root}`);
        }
    }
    return res;
}
class PluginManager extends events_1.default {
    // 平台选项信息
    bundleConfigs = {};
    commonOptionConfig = {};
    pkgOptionConfigs = {};
    platformConfig = {};
    buildTemplateConfigMap = {};
    configMap; // 存储注入进来的 config
    // 存储注册进来的，带有 hooks 的插件路径，[pkgName][platform]: hooks
    builderPathsMap = {};
    customBuildStagesMap = {};
    customBuildStages;
    // 存储注册进来的，带有 assetHandlers 配置的一些方法 [ICustomAssetHandlerType][pkgName]: Function
    assetHandlers = {};
    // 存储插件优先级（TODO 目前优先级记录在 config 内，针对不同平台可能有不同的优先级）
    pkgPriorities = {};
    // 记录已注册的插件名称
    packageRegisterInfo = new Map();
    platformRegisterInfoPool = new Map();
    constructor() {
        super();
        const compsMap = {};
        this.pkgOptionConfigs = compsMap;
        this.configMap = JSON.parse(JSON.stringify(compsMap));
        this.customBuildStages = JSON.parse(JSON.stringify(compsMap));
        CustomAssetHandlerTypes.forEach((handlerName) => {
            this.assetHandlers[handlerName] = {};
        });
    }
    async init() {
        for (const root of pluginRoots) {
            if (!(0, fs_1.existsSync)(root)) {
                continue;
            }
            const infos = await scanPluginRoot(root);
            for (const info of infos) {
                this.platformRegisterInfoPool.set(info.platform, info);
            }
        }
    }
    async registerAllPlatform() {
        for (const platform of this.platformRegisterInfoPool.keys()) {
            try {
                await this.register(platform);
            }
            catch (error) {
                console.error(error);
                console.error(`register platform ${platform} failed!`);
            }
        }
    }
    async register(platform) {
        if (this.platformConfig[platform]) {
            console.debug(`platform ${platform} has register already!`);
            return;
        }
        const info = this.platformRegisterInfoPool.get(platform);
        if (!info) {
            throw new Error(`Can not find platform register info for ${platform}`);
        }
        await this.registerPlatform(info);
        await this.internalRegister(info);
        console.log(`register platform ${platform} success!`);
    }
    checkPlatform(platform) {
        try {
            return !!platform && !!this.platformConfig[platform].platformType;
        }
        catch (error) {
            return false;
        }
    }
    async registerPlatform(registerInfo) {
        const { platform, config } = registerInfo;
        if (this.platformConfig[platform]) {
            console.error(`platform ${platform} has register already!`);
            return;
        }
        this.configMap[platform] = {};
        this.platformConfig[platform] = {};
        if (config.assetBundleConfig) {
            this.bundleConfigs[platform] = Object.assign(this.bundleConfigs[platform] || {}, {
                platformType: config.assetBundleConfig.platformType,
                supportOptions: {
                    compressionType: config.assetBundleConfig.supportedCompressionTypes,
                },
            });
        }
        // 注册压缩纹理配置，需要在平台剔除之前
        if (typeof config.textureCompressConfig === 'object') {
            const configGroupsInfo = texture_compress_1.configGroups[config.textureCompressConfig.platformType];
            if (!configGroupsInfo) {
                console.error(`Invalid platformType ${config.textureCompressConfig.platformType}`);
            }
            else {
                configGroupsInfo.support.rgb = lodash_1.default.union(configGroupsInfo.support.rgb, config.textureCompressConfig.support.rgb);
                configGroupsInfo.support.rgba = lodash_1.default.union(configGroupsInfo.support.rgba, config.textureCompressConfig.support.rgba);
                if (configGroupsInfo.defaultSupport) {
                    config.textureCompressConfig.support.rgb = lodash_1.default.union(config.textureCompressConfig.support.rgb, configGroupsInfo.defaultSupport.rgb);
                    config.textureCompressConfig.support.rgba = lodash_1.default.union(config.textureCompressConfig.support.rgba, configGroupsInfo.defaultSupport.rgba);
                }
            }
            this.platformConfig[platform].texture = config.textureCompressConfig;
        }
        this.platformConfig[platform].name = config.displayName;
        this.platformConfig[platform].platformType = config.platformType;
        if (config.buildTemplateConfig && config.buildTemplateConfig.templates.length) {
            const label = config.displayName || platform;
            this.platformConfig[platform].createTemplateLabel = label;
            this.buildTemplateConfigMap[label] = config.buildTemplateConfig;
        }
        if (this.bundleConfigs[platform]) {
            this.platformConfig[platform].type = this.bundleConfigs[platform].platformType;
        }
    }
    async internalRegister(registerInfo) {
        const { platform, config, path } = registerInfo;
        if (!this.platformConfig[platform] || !this.platformConfig[platform].name) {
            throw new Error(`platform ${platform} has been registered!`);
        }
        const pkgName = registerInfo.pkgName || platform;
        this.pkgPriorities[pkgName] = config.priority || (path.includes(global_1.GlobalPaths.workspace) ? 1 : 0);
        this._registerI18n(registerInfo);
        // 注册校验方法
        if (typeof config.verifyRuleMap === 'object') {
            for (const [ruleName, item] of Object.entries(config.verifyRuleMap)) {
                // 添加以 平台 + 插件 作为 key 的校验规则
                validator_manager_1.validatorManager.addRule(ruleName, item, platform + pkgName);
            }
        }
        if (config.doc && !config.doc.startsWith('http')) {
            config.doc = utils_2.default.Url.getDocUrl(config.doc);
        }
        if (typeof config.options === 'object') {
            lodash_1.default.set(this.pkgOptionConfigs, `${registerInfo.platform}.${pkgName}`, config.options);
            Object.keys(config.options).forEach((key) => {
                (0, utils_1.checkConfigDefault)(config.options[key]);
            });
            await builder_config_1.default.setProject(`platforms.${platform}.packages.${platform}`, (0, utils_1.getOptionsDefault)(config.options), 'default');
        }
        // 整理通用构建选项的校验规则
        if (config.commonOptions) {
            // 此机制依赖了插件的启动顺序来写入配置
            if (!this.commonOptionConfig[platform]) {
                // 使用默认通用配置和首个插件自定义的通用配置进行融合
                this.commonOptionConfig[platform] = Object.assign({}, lodash_1.default.defaultsDeep({}, config.commonOptions, JSON.parse(JSON.stringify(builder_config_1.default.commonOptionConfigs))));
            }
            else {
                this.commonOptionConfig[platform] = (0, utils_1.defaultMerge)({}, this.commonOptionConfig[platform], config.commonOptions || {});
            }
            const commonOptions = config.commonOptions;
            for (const key in commonOptions) {
                if (commonOptions[key].verifyRules) {
                    this.commonOptionConfig[platform][key] = Object.assign({}, this.commonOptionConfig[platform][key], {
                        verifyKey: platform + pkgName,
                    });
                }
            }
        }
        if (config.customBuildStages) {
            // 注册构建阶段性任务
            lodash_1.default.set(this.customBuildStages, `${platform}.${pkgName}`, config.customBuildStages);
            lodash_1.default.set(this.customBuildStagesMap, `${pkgName}.${platform}`, config.customBuildStages);
            await builder_config_1.default.setProject(`platforms.${platform}.generateCompileConfig`, this.shouldGenerateOptions(platform), 'default');
        }
        this.pkgPriorities[pkgName] = config.priority || 0;
        this.configMap[platform][pkgName] = config;
        // 注册 hooks 路径
        if (registerInfo.hooks) {
            config.hooks = registerInfo.hooks;
            lodash_1.default.set(this.builderPathsMap, `${pkgName}.${platform}`, config.hooks);
        }
        // 注册构建模板菜单项
        console.debug(`[Build] internalRegister pkg(${pkgName}) in ${platform} platform success!`);
    }
    _registerI18n(registerInfo) {
        const { platform, path } = registerInfo;
        const i18nPath = (0, path_1.join)(path, 'i18n');
        if ((0, fs_1.existsSync)(i18nPath)) {
            try {
                (0, fs_1.readdirSync)(i18nPath).forEach((file) => {
                    if (file.endsWith('.json')) {
                        const lang = (0, path_1.basename)(file, '.json');
                        const path = registerInfo.pkgName || platform;
                        i18n_1.default.registerLanguagePatch(lang, path, (0, fs_extra_1.readJSONSync)((0, path_1.join)(i18nPath, file)));
                    }
                });
            }
            catch (error) {
                if (registerInfo.type === 'register') {
                    throw error;
                }
                console.error(error);
            }
        }
    }
    getCommonOptionConfigs(platform) {
        return this.commonOptionConfig[platform];
    }
    getCommonOptionConfigByKey(key, options) {
        const config = this.commonOptionConfig[options.platform] && this.commonOptionConfig[options.platform][key] || {};
        if (builder_config_1.default.commonOptionConfigs[key]) {
            const defaultConfig = JSON.parse(JSON.stringify(builder_config_1.default.commonOptionConfigs[key]));
            lodash_1.default.defaultsDeep(config, defaultConfig);
        }
        if (!config || !config.verifyRules) {
            return null;
        }
        return config;
    }
    getPackageOptionConfigByKey(key, pkgName, options) {
        if (!key || !pkgName) {
            return null;
        }
        const configs = this.pkgOptionConfigs[options.platform][pkgName];
        if (!configs) {
            return null;
        }
        return lodash_1.default.get(configs, key);
    }
    getOptionConfigByKey(key, options) {
        if (!key) {
            return null;
        }
        const keyMatch = key && (key).match(/^options.packages.(([^.]*).*)$/);
        if (!keyMatch || !keyMatch[2]) {
            return this.getCommonOptionConfigByKey(key, options);
        }
        const [, path, pkgName] = keyMatch;
        return this.getPackageOptionConfigByKey(path, pkgName, options);
    }
    /**
     * 完整校验构建参数（校验平台插件相关的参数校验）
     * @param options
     */
    async checkOptions(options) {
        // 对参数做数据验证
        let checkRes = true;
        if (this.bundleConfigs[options.platform]) {
            const supportedCompressionTypes = this.bundleConfigs[options.platform].supportOptions.compressionType;
            const compressionTypeResult = await (0, common_options_validator_1.checkBundleCompressionSetting)(options.mainBundleCompressionType, supportedCompressionTypes);
            const isValid = validator_manager_1.validator.checkWithInternalRule('valid', compressionTypeResult.newValue);
            if (isValid) {
                lodash_1.default.set(options, 'mainBundleCompressionType', compressionTypeResult.newValue);
            }
            // 有报错信息，也有修复值，只发报错不中断，使用新值
            if (compressionTypeResult.error && isValid) {
                console.warn(i18n_1.default.t('builder.warn.check_failed_with_new_value', {
                    key: 'mainBundleCompressionType',
                    value: options.mainBundleCompressionType,
                    error: i18n_1.default.transI18nName(compressionTypeResult.error) || compressionTypeResult.error,
                    newValue: JSON.stringify(compressionTypeResult.newValue),
                }));
            }
        }
        else {
            console.debug(`Can not find bundle config with platform ${options.platform}`);
        }
        // (校验处已经做了错误数据使用默认值的处理)检验数据通过后做一次数据融合
        const defaultOptions = await this.getOptionsByPlatform(options.platform);
        // lodash 的 defaultsDeep 会对数组也进行深度合并，不符合我们的使用预期，需要自己编写该函数
        const rightOptions = (0, utils_1.defaultsDeep)(JSON.parse(JSON.stringify(options)), defaultOptions);
        // 传递了 buildStageGroup 的选项，不需要做默认值合并
        if ('buildStageGroup' in options) {
            rightOptions.buildStageGroup = options.buildStageGroup;
        }
        // 通用参数的构建校验, 需要使用默认值补全所有的 key
        for (const key of Object.keys(rightOptions)) {
            if (key === 'packages') {
                continue;
            }
            const res = await this.checkCommonOptionByKey(key, rightOptions[key], rightOptions);
            if (res && res.error && res.level === 'error') {
                const errMsg = i18n_1.default.transI18nName(res.error) || res.error;
                if (!validator_manager_1.validator.checkWithInternalRule('valid', res.newValue)) {
                    checkRes = false;
                    console.error(i18n_1.default.t('builder.error.check_failed', {
                        key,
                        value: JSON.stringify(rightOptions[key]),
                        error: errMsg,
                    }));
                    // 出现检查错误，直接中断构建
                    return;
                }
                else {
                    // 常规构建如果新的值可用，不中断，只警告
                    console.warn(i18n_1.default.t('builder.warn.check_failed_with_new_value', {
                        key,
                        value: JSON.stringify(rightOptions[key]),
                        error: errMsg,
                        newValue: JSON.stringify(res.newValue),
                    }));
                }
            }
            rightOptions[key] = res.newValue;
        }
        const result = await this.checkPluginOptions(rightOptions);
        if (!result) {
            checkRes = false;
        }
        if (checkRes) {
            return rightOptions;
        }
    }
    async checkCommonOptions(options) {
        const checkRes = {};
        for (const key of Object.keys(options)) {
            if (key === 'packages') {
                continue;
            }
            // @ts-ignore
            checkRes[key] = await this.checkCommonOptionByKey(key, options[key], options);
        }
        return checkRes;
    }
    async checkCommonOptionByKey(key, value, options) {
        // 优先使用自定义的校验函数
        const res = await (0, common_options_validator_1.checkBuildCommonOptionsByKey)(key, value, options);
        if (res) {
            return res;
        }
        const config = this.getCommonOptionConfigByKey(key, options);
        if (!config) {
            return {
                newValue: value,
                error: '',
                level: 'error',
            };
        }
        const error = await validator_manager_1.validatorManager.check(value, config.verifyRules, options, this.commonOptionConfig[options.platform] && this.commonOptionConfig[options.platform][key]?.verifyKey || (options.platform + options.platform));
        return {
            error,
            newValue: error ? config.default : value,
            level: config.verifyLevel || 'error',
        };
    }
    /**
     * 校验构建插件注册的构建参数
     * @param options
     */
    async checkPluginOptions(options) {
        if (typeof options.packages !== 'object') {
            return false;
        }
        let checkRes = true;
        for (const pkgName of Object.keys(options.packages)) {
            const packageOptions = options.packages[pkgName];
            if (!packageOptions) {
                continue;
            }
            const buildConfig = exports.pluginManager.configMap[options.platform][pkgName];
            if (!buildConfig || !buildConfig.options) {
                continue;
            }
            for (const key of Object.keys(packageOptions)) {
                if (!buildConfig.options[key] || !buildConfig.options[key].verifyRules) {
                    continue;
                }
                // @ts-ignore
                const value = packageOptions[key];
                const error = await validator_manager_1.validatorManager.check(value, buildConfig.options[key].verifyRules, options, exports.pluginManager.commonOptionConfig[options.platform][key]?.verifyKey || (options.platform + pkgName));
                if (!error) {
                    continue;
                }
                let useDefault = validator_manager_1.validator.checkWithInternalRule('valid', buildConfig.options[key].default);
                // 有默认值也需要再走一遍校验
                if (useDefault) {
                    useDefault = !(await validator_manager_1.validatorManager.check(buildConfig.options[key].default, buildConfig.options[key].verifyRules, options, exports.pluginManager.commonOptionConfig[options.platform][key]?.verifyKey || (options.platform + pkgName)));
                }
                const verifyLevel = buildConfig.options[key].verifyLevel || 'error';
                const errMsg = (typeof error === 'string' && i18n_1.default.transI18nName(error)) || error;
                if (!useDefault && verifyLevel === 'error') {
                    console.error(i18n_1.default.t('builder.error.check_failed', {
                        key: `options.packages.${pkgName}.${key}`,
                        value: JSON.stringify(value),
                        error: errMsg,
                    }));
                    checkRes = false;
                    continue;
                }
                else {
                    const consoleType = (verifyLevel !== 'error' && console_1.newConsole[verifyLevel]) ? verifyLevel : 'warn';
                    // 有报错信息，但有默认值，报错后填充默认值
                    console_1.newConsole[consoleType](i18n_1.default.t('builder.warn.check_failed_with_new_value', {
                        key: `options.packages.${pkgName}.${key}`,
                        value: JSON.stringify(value),
                        error: errMsg,
                        newValue: JSON.stringify(buildConfig.options[key].default),
                    }));
                    lodash_1.default.set(packageOptions, key, buildConfig.options[key].default);
                }
            }
        }
        return checkRes;
    }
    shouldGenerateOptions(platform) {
        const customBuildStageMap = this.customBuildStages[platform];
        return !!Object.values(customBuildStageMap).find((stages) => stages.find((stageItem => stageItem.requiredBuildOptions !== false)));
    }
    /**
     * 获取平台默认值
     * @param platform
     */
    async getOptionsByPlatform(platform) {
        const options = await builder_config_1.default.getProject(`platforms.${platform}`);
        const commonOptions = await builder_config_1.default.getProject(`common`);
        commonOptions.platform = platform;
        commonOptions.outputName = platform;
        return Object.assign(commonOptions, options);
    }
    getTexturePlatformConfigs() {
        const result = {};
        Object.keys(this.platformConfig).forEach((platform) => {
            result[platform] = {
                name: this.platformConfig[platform].name,
                textureCompressConfig: this.platformConfig[platform].texture,
            };
        });
        return result;
    }
    queryPlatformConfig() {
        return {
            native: Object.keys(this.platformConfig).filter((platform) => platforms_options_1.NATIVE_PLATFORM.includes(platform)),
            config: this.platformConfig,
        };
    }
    /**
     * 获取带有钩子函数的构建阶段任务
     * @param platform
     * @returns
     */
    getBuildStageWithHookTasks(platform, taskName) {
        const customStages = this.customBuildStages[platform];
        if (!customStages) {
            return null;
        }
        const pkgNameOrder = this.sortPkgNameWidthPriority(Object.keys(customStages));
        for (const pkgName of pkgNameOrder) {
            const stage = customStages[pkgName].find((item) => item.hook === taskName);
            if (stage) {
                return stage;
            }
        }
        return null;
    }
    /**
     * 根据插件权重传参的插件数组
     * @param pkgNames
     * @returns
     */
    sortPkgNameWidthPriority(pkgNames) {
        return pkgNames.sort((a, b) => {
            // 平台构建插件的顺序始终在外部注册的任意插件之上
            if (!platforms_options_1.PLATFORMS.includes(a) && platforms_options_1.PLATFORMS.includes(b)) {
                return 1;
            }
            else if (platforms_options_1.PLATFORMS.includes(a) && !platforms_options_1.PLATFORMS.includes(b)) {
                return -1;
            }
            return this.pkgPriorities[b] - this.pkgPriorities[a];
        });
    }
    /**
     * 获取平台插件的构建路径信息
     * @param platform
     */
    getHooksInfo(platform) {
        // 为了保障插件的先后注册顺序，采用了数组的方式传递
        const result = {
            pkgNameOrder: [],
            infos: {},
        };
        Object.keys(this.builderPathsMap[platform]).forEach((pkgName) => {
            result.infos[pkgName] = {
                path: this.builderPathsMap[platform][pkgName],
                internal: pkgName === platform,
            };
        });
        result.pkgNameOrder = this.sortPkgNameWidthPriority(Object.keys(result.infos));
        return result;
    }
    getBuildTemplateConfig(platform) {
        return this.buildTemplateConfigMap[this.platformConfig[platform].createTemplateLabel];
    }
    /**
     * 根据类型获取对应的执行方法
     * @param type
     * @returns
     */
    getAssetHandlers(type) {
        const pkgNames = Object.keys(this.assetHandlers[type]);
        return {
            pkgNameOrder: this.sortPkgNameWidthPriority(pkgNames),
            handles: this.assetHandlers[type],
        };
    }
}
exports.PluginManager = PluginManager;
exports.pluginManager = new PluginManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci9tYW5hZ2VyL3BsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxvREFBa0M7QUFDbEMsK0JBQXNDO0FBQ3RDLGdGQUFnSDtBQUNoSCxrRUFBd0U7QUFDeEUsa0VBQXlFO0FBQ3pFLDBDQUFpSDtBQUdqSCw2REFBcUM7QUFDckMsMkRBQW1DO0FBQ25DLG9EQUE0QjtBQUM1QixnRUFBeUQ7QUFDekQsZ0RBQWdEO0FBQ2hELDZFQUFvRDtBQUNwRCw0Q0FBOEM7QUFDOUMsMkJBQTZDO0FBQzdDLDZEQUFxQztBQUNyQyx1Q0FBd0M7QUFheEMscUJBQXFCO0FBQ3JCLE1BQU0sdUJBQXVCLEdBQThCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUVoRixNQUFNLFdBQVcsR0FBRztJQUNoQixJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUsY0FBYyxDQUFDO0lBQy9CLElBQUEsV0FBSSxFQUFDLG9CQUFXLENBQUMsU0FBUyxFQUFFLG9CQUFvQixDQUFDO0NBQ3BELENBQUM7QUFFRixTQUFTLGVBQWUsQ0FBQyxJQUFZLEVBQUUsT0FBZTtJQUNsRCxNQUFNLGVBQWUsR0FBRyxJQUFBLFdBQUksRUFBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDbkQsSUFBSSxJQUFBLGVBQVUsRUFBQyxlQUFlLENBQUMsRUFBRSxDQUFDO1FBQzlCLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM3QyxNQUFNLE9BQU8sR0FBeUIsV0FBVyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDdEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwQixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsT0FBTztZQUNILFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtZQUMxQixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBQSxXQUFJLEVBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztZQUM1RCxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUEsV0FBSSxFQUFDLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPO1lBQ25ELElBQUksRUFBRSxJQUFJO1lBQ1YsSUFBSSxFQUFFLFVBQVU7U0FDbkIsQ0FBQztJQUNOLENBQUM7SUFFRCxJQUFJLGVBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDbkQsSUFBSSw2QkFBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQzlCLE9BQU87Z0JBQ0gsUUFBUSxFQUFFLElBQUEsZUFBUSxFQUFDLElBQUksQ0FBQztnQkFDeEIsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFBLFdBQUksRUFBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPO2dCQUM3QyxLQUFLLEVBQUUsSUFBQSxXQUFJLEVBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztnQkFDMUIsSUFBSSxFQUFFLFVBQVU7YUFDbkIsQ0FBQztRQUNOLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUNsRSxDQUFDO0FBRUQsS0FBSyxVQUFVLGNBQWMsQ0FBQyxJQUFZO0lBQ3RDLE1BQU0sUUFBUSxHQUFHLElBQUEsZ0JBQVcsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUNuQyxNQUFNLEdBQUcsR0FBNEIsRUFBRSxDQUFDO0lBQ3hDLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDO1lBQ0QsTUFBTSxZQUFZLEdBQUcsTUFBTSxlQUFlLENBQUMsSUFBQSxXQUFJLEVBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3pFLFlBQVksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixPQUFPLENBQUMsS0FBSyxDQUFDLDZDQUE2QyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBRUQsTUFBYSxhQUFjLFNBQVEsZ0JBQVk7SUFDM0MsU0FBUztJQUNGLGFBQWEsR0FBeUMsRUFBRSxDQUFDO0lBQ3pELGtCQUFrQixHQUFnRixFQUFFLENBQUM7SUFDckcsZ0JBQWdCLEdBQW9ELEVBQUUsQ0FBQztJQUN2RSxjQUFjLEdBQW9DLEVBQUUsQ0FBQztJQUNyRCxzQkFBc0IsR0FBd0MsRUFBRSxDQUFDO0lBQ2pFLFNBQVMsQ0FBNkQsQ0FBQyxpQkFBaUI7SUFDL0Ysb0RBQW9EO0lBQzVDLGVBQWUsR0FBMkMsRUFBRSxDQUFDO0lBQzdELG9CQUFvQixHQUl4QixFQUFFLENBQUM7SUFDRyxpQkFBaUIsQ0FFeEI7SUFFSCxnRkFBZ0Y7SUFDeEUsYUFBYSxHQUFHLEVBQW9CLENBQUM7SUFDN0Msa0RBQWtEO0lBQy9CLGFBQWEsR0FBMkIsRUFBRSxDQUFDO0lBRTlELGFBQWE7SUFDTixtQkFBbUIsR0FBcUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUVqRSx3QkFBd0IsR0FBdUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUVqRjtRQUNJLEtBQUssRUFBRSxDQUFDO1FBQ1IsTUFBTSxRQUFRLEdBQVEsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUM7UUFDakMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDOUQsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDNUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDekMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDTixLQUFLLE1BQU0sSUFBSSxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxJQUFBLGVBQVUsRUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNwQixTQUFTO1lBQ2IsQ0FBQztZQUNELE1BQU0sS0FBSyxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMzRCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFTSxLQUFLLENBQUMsbUJBQW1CO1FBQzVCLEtBQUssTUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7WUFDMUQsSUFBSSxDQUFDO2dCQUNELE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsQyxDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDYixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyQixPQUFPLENBQUMsS0FBSyxDQUFDLHFCQUFxQixRQUFRLFVBQVUsQ0FBQyxDQUFDO1lBQzNELENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVNLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBZ0I7UUFDbEMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDaEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLFFBQVEsd0JBQXdCLENBQUMsQ0FBQztZQUM1RCxPQUFPO1FBQ1gsQ0FBQztRQUNELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1IsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBQ0QsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsUUFBUSxXQUFXLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRU0sYUFBYSxDQUFDLFFBQWdCO1FBQ2pDLElBQUksQ0FBQztZQUNELE9BQU8sQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLENBQUM7UUFDdEUsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDYixPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO0lBQ0wsQ0FBQztJQUVPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFtQztRQUM5RCxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxHQUFHLFlBQVksQ0FBQztRQUMxQyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUNoQyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksUUFBUSx3QkFBd0IsQ0FBQyxDQUFDO1lBQzVELE9BQU87UUFDWCxDQUFDO1FBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFxQixDQUFDO1FBQ3RELElBQUksTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUM3RSxZQUFZLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLFlBQVk7Z0JBQ25ELGNBQWMsRUFBRTtvQkFDWixlQUFlLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLHlCQUF5QjtpQkFDdEU7YUFDSixDQUFDLENBQUM7UUFDUCxDQUFDO1FBQ0QscUJBQXFCO1FBQ3JCLElBQUksT0FBTyxNQUFNLENBQUMscUJBQXFCLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDbkQsTUFBTSxnQkFBZ0IsR0FBc0IsK0JBQVksQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDcEcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZGLENBQUM7aUJBQU0sQ0FBQztnQkFDSixnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLGdCQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDcEgsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxnQkFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZILElBQUksZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ2xDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLGdCQUFNLENBQUMsS0FBSyxDQUNuRCxNQUFNLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFDeEMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FDdEMsQ0FBQztvQkFDRixNQUFNLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxnQkFBTSxDQUFDLEtBQUssQ0FDcEQsTUFBTSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQ3pDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQ3ZDLENBQUM7Z0JBQ04sQ0FBQztZQUNMLENBQUM7WUFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUM7UUFDekUsQ0FBQztRQUNELElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDeEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLEdBQUksTUFBcUMsQ0FBQyxZQUFZLENBQUM7UUFFakcsSUFBSSxNQUFNLENBQUMsbUJBQW1CLElBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM1RSxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQztZQUM3QyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztZQUMxRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDO1FBQ3BFLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksQ0FBQztRQUNuRixDQUFDO0lBQ0wsQ0FBQztJQUVPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFrQztRQUM3RCxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxZQUFZLENBQUM7UUFDaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3hFLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxRQUFRLHVCQUF1QixDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxPQUFPLElBQUksUUFBUSxDQUFDO1FBQ2pELElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2pDLFNBQVM7UUFDVCxJQUFJLE9BQU8sTUFBTSxDQUFDLGFBQWEsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUMzQyxLQUFLLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztnQkFDbEUsMkJBQTJCO2dCQUMzQixvQ0FBZ0IsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUM7WUFDakUsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFJLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxHQUFHLEdBQUcsZUFBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFDRCxJQUFJLE9BQU8sTUFBTSxDQUFDLE9BQU8sS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNyQyxnQkFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxZQUFZLENBQUMsUUFBUSxJQUFJLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6RixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDeEMsSUFBQSwwQkFBa0IsRUFBQyxNQUFNLENBQUMsT0FBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDN0MsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLHdCQUFhLENBQUMsVUFBVSxDQUFDLGFBQWEsUUFBUSxhQUFhLFFBQVEsRUFBRSxFQUFFLElBQUEseUJBQWlCLEVBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQy9ILENBQUM7UUFFRCxnQkFBZ0I7UUFDaEIsSUFBSSxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDdkIscUJBQXFCO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDckMsNEJBQTRCO2dCQUM1QixJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHdCQUFhLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4SyxDQUFDO2lCQUFNLENBQUM7Z0JBQ0osSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUEsb0JBQVksRUFBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxhQUFhLElBQUksRUFBRSxDQUFDLENBQUM7WUFDeEgsQ0FBQztZQUNELE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7WUFDM0MsS0FBSyxNQUFNLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ2pDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQy9GLFNBQVMsRUFBRSxRQUFRLEdBQUcsT0FBTztxQkFDaEMsQ0FBQyxDQUFDO2dCQUNQLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUNELElBQUksTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDM0IsWUFBWTtZQUNaLGdCQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLFFBQVEsSUFBSSxPQUFPLEVBQUUsRUFBRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN2RixnQkFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxPQUFPLElBQUksUUFBUSxFQUFFLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDMUYsTUFBTSx3QkFBYSxDQUFDLFVBQVUsQ0FBQyxhQUFhLFFBQVEsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ25JLENBQUM7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQzNDLGNBQWM7UUFDZCxJQUFJLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNyQixNQUFNLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFDbEMsZ0JBQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxHQUFHLE9BQU8sSUFBSSxRQUFRLEVBQUUsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUNELFlBQVk7UUFDWixPQUFPLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxPQUFPLFFBQVEsUUFBUSxvQkFBb0IsQ0FBQyxDQUFDO0lBQy9GLENBQUM7SUFFRCxhQUFhLENBQUMsWUFBa0M7UUFDNUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsR0FBRyxZQUFZLENBQUM7UUFDeEMsTUFBTSxRQUFRLEdBQUcsSUFBQSxXQUFJLEVBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3BDLElBQUksSUFBQSxlQUFVLEVBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUM7Z0JBQ0QsSUFBQSxnQkFBVyxFQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO29CQUNuQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQzt3QkFDekIsTUFBTSxJQUFJLEdBQUcsSUFBQSxlQUFRLEVBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO3dCQUNyQyxNQUFNLElBQUksR0FBRyxZQUFZLENBQUMsT0FBTyxJQUFJLFFBQVEsQ0FBQzt3QkFDOUMsY0FBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBQSx1QkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQy9FLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDYixJQUFJLFlBQVksQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFLENBQUM7b0JBQ25DLE1BQU0sS0FBSyxDQUFDO2dCQUNoQixDQUFDO2dCQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRU0sc0JBQXNCLENBQUMsUUFBa0I7UUFDNUMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVNLDBCQUEwQixDQUFDLEdBQTJCLEVBQUUsT0FBeUI7UUFDcEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxRQUFvQixDQUFDLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxRQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3pJLElBQUksd0JBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3pDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyx3QkFBYSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RixnQkFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUNELElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDakMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTSwyQkFBMkIsQ0FBQyxHQUFXLEVBQUUsT0FBZSxFQUFFLE9BQXlCO1FBQ3RGLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNuQixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxRQUFvQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ1gsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUNELE9BQU8sZ0JBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFTSxvQkFBb0IsQ0FBQyxHQUEyQixFQUFFLE9BQXlCO1FBQzlFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNQLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxNQUFNLFFBQVEsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDNUIsT0FBTyxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRCxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsUUFBUSxDQUFDO1FBQ25DLE9BQU8sSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVEOzs7T0FHRztJQUNJLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBb0Y7UUFDMUcsV0FBVztRQUNYLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQW9CLENBQUMsRUFBRSxDQUFDO1lBQ25ELE1BQU0seUJBQXlCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsUUFBb0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUM7WUFDbEgsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLElBQUEsd0RBQTZCLEVBQUMsT0FBTyxDQUFDLHlCQUF5QixFQUFFLHlCQUF5QixDQUFDLENBQUM7WUFDaEksTUFBTSxPQUFPLEdBQUcsNkJBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekYsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDVixnQkFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsMkJBQTJCLEVBQUUscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckYsQ0FBQztZQUNELDJCQUEyQjtZQUMzQixJQUFJLHFCQUFxQixDQUFDLEtBQUssSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDekMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFJLENBQUMsQ0FBQyxDQUFDLDBDQUEwQyxFQUFFO29CQUM1RCxHQUFHLEVBQUUsMkJBQTJCO29CQUNoQyxLQUFLLEVBQUUsT0FBTyxDQUFDLHlCQUF5QjtvQkFDeEMsS0FBSyxFQUFFLGNBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLElBQUkscUJBQXFCLENBQUMsS0FBSztvQkFDckYsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDO2lCQUMzRCxDQUFDLENBQUMsQ0FBQztZQUNSLENBQUM7UUFDTCxDQUFDO2FBQU0sQ0FBQztZQUNKLE9BQU8sQ0FBQyxLQUFLLENBQUMsNENBQTRDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ2xGLENBQUM7UUFFRCxzQ0FBc0M7UUFDdEMsTUFBTSxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pFLHlEQUF5RDtRQUN6RCxNQUFNLFlBQVksR0FBRyxJQUFBLG9CQUFZLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDdkYsb0NBQW9DO1FBQ3BDLElBQUksaUJBQWlCLElBQUksT0FBTyxFQUFFLENBQUM7WUFDL0IsWUFBWSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDO1FBQzNELENBQUM7UUFDRCw4QkFBOEI7UUFDOUIsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFDMUMsSUFBSSxHQUFHLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQ3JCLFNBQVM7WUFDYixDQUFDO1lBQ0QsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBNkIsRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDOUcsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLE9BQU8sRUFBRSxDQUFDO2dCQUM1QyxNQUFNLE1BQU0sR0FBRyxjQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDO2dCQUMxRCxJQUFJLENBQUMsNkJBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7b0JBQzFELFFBQVEsR0FBRyxLQUFLLENBQUM7b0JBQ2pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBSSxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsRUFBRTt3QkFDL0MsR0FBRzt3QkFDSCxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3hDLEtBQUssRUFBRSxNQUFNO3FCQUNoQixDQUFDLENBQUMsQ0FBQztvQkFDSixnQkFBZ0I7b0JBQ2hCLE9BQU87Z0JBQ1gsQ0FBQztxQkFBTSxDQUFDO29CQUNKLHNCQUFzQjtvQkFDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFJLENBQUMsQ0FBQyxDQUFDLDBDQUEwQyxFQUFFO3dCQUM1RCxHQUFHO3dCQUNILEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDeEMsS0FBSyxFQUFFLE1BQU07d0JBQ2IsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztxQkFDekMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1IsQ0FBQztZQUNMLENBQUM7WUFDRCxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztRQUNyQyxDQUFDO1FBQ0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ1YsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUNyQixDQUFDO1FBQ0QsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNYLE9BQU8sWUFBWSxDQUFDO1FBQ3hCLENBQUM7SUFDTCxDQUFDO0lBRU0sS0FBSyxDQUFDLGtCQUFrQixDQUFDLE9BQXlCO1FBQ3JELE1BQU0sUUFBUSxHQUFxQyxFQUFFLENBQUM7UUFDdEQsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDckMsSUFBSSxHQUFHLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQ3JCLFNBQVM7WUFDYixDQUFDO1lBQ0QsYUFBYTtZQUNiLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUE2QixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM1RyxDQUFDO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxHQUEyQixFQUFFLEtBQVUsRUFBRSxPQUF5QjtRQUNsRyxlQUFlO1FBQ2YsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFBLHVEQUE0QixFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDcEUsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNOLE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ1YsT0FBTztnQkFDSCxRQUFRLEVBQUUsS0FBSztnQkFDZixLQUFLLEVBQUUsRUFBRTtnQkFDVCxLQUFLLEVBQUUsT0FBTzthQUNqQixDQUFDO1FBQ04sQ0FBQztRQUVELE1BQU0sS0FBSyxHQUFHLE1BQU0sb0NBQWdCLENBQUMsS0FBSyxDQUN0QyxLQUFLLEVBQ0wsTUFBTSxDQUFDLFdBQVksRUFDbkIsT0FBTyxFQUNQLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsUUFBb0IsQ0FBQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsUUFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQVMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUMxSyxDQUFDO1FBQ0YsT0FBTztZQUNILEtBQUs7WUFDTCxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLO1lBQ3hDLEtBQUssRUFBRSxNQUFNLENBQUMsV0FBVyxJQUFJLE9BQU87U0FDdkMsQ0FBQztJQUNOLENBQUM7SUFFRDs7O09BR0c7SUFDSyxLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBeUI7UUFDdEQsSUFBSSxPQUFPLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDdkMsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUNELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztRQUNwQixLQUFLLE1BQU0sT0FBTyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDbEQsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFtQixDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNsQixTQUFTO1lBQ2IsQ0FBQztZQUVELE1BQU0sV0FBVyxHQUFHLHFCQUFhLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFvQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkYsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdkMsU0FBUztZQUNiLENBQUM7WUFDRCxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUNyRSxTQUFTO2dCQUNiLENBQUM7Z0JBQ0QsYUFBYTtnQkFDYixNQUFNLEtBQUssR0FBUSxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sS0FBSyxHQUFHLE1BQU0sb0NBQWdCLENBQUMsS0FBSyxDQUN0QyxLQUFLLEVBQ0wsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFZLEVBQ3JDLE9BQU8sRUFDUCxxQkFBYSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxRQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FDakgsQ0FBQztnQkFDRixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ1QsU0FBUztnQkFDYixDQUFDO2dCQUNELElBQUksVUFBVSxHQUFHLDZCQUFTLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzVGLGdCQUFnQjtnQkFDaEIsSUFBSSxVQUFVLEVBQUUsQ0FBQztvQkFDYixVQUFVLEdBQUcsQ0FBQyxDQUFDLE1BQU0sb0NBQWdCLENBQUMsS0FBSyxDQUN2QyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFDaEMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFZLEVBQ3JDLE9BQU8sRUFDUCxxQkFBYSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxRQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FDakgsQ0FBQyxDQUFDO2dCQUNQLENBQUM7Z0JBQ0QsTUFBTSxXQUFXLEdBQWlCLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQztnQkFDbEYsTUFBTSxNQUFNLEdBQUcsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksY0FBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQztnQkFFakYsSUFBSSxDQUFDLFVBQVUsSUFBSSxXQUFXLEtBQUssT0FBTyxFQUFFLENBQUM7b0JBQ3pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBSSxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsRUFBRTt3QkFDL0MsR0FBRyxFQUFFLG9CQUFvQixPQUFPLElBQUksR0FBRyxFQUFFO3dCQUN6QyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7d0JBQzVCLEtBQUssRUFBRSxNQUFNO3FCQUNoQixDQUFDLENBQUMsQ0FBQztvQkFDSixRQUFRLEdBQUcsS0FBSyxDQUFDO29CQUNqQixTQUFTO2dCQUNiLENBQUM7cUJBQU0sQ0FBQztvQkFDSixNQUFNLFdBQVcsR0FBRyxDQUFDLFdBQVcsS0FBSyxPQUFPLElBQUksb0JBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztvQkFDaEcsdUJBQXVCO29CQUN2QixvQkFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGNBQUksQ0FBQyxDQUFDLENBQUMsMENBQTBDLEVBQUU7d0JBQ3ZFLEdBQUcsRUFBRSxvQkFBb0IsT0FBTyxJQUFJLEdBQUcsRUFBRTt3QkFDekMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO3dCQUM1QixLQUFLLEVBQUUsTUFBTTt3QkFDYixRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztxQkFDN0QsQ0FBQyxDQUFDLENBQUM7b0JBQ0osZ0JBQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN0RSxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRU0scUJBQXFCLENBQUMsUUFBMkI7UUFDcEQsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0QsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLG9CQUFvQixLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2SSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksS0FBSyxDQUFDLG9CQUFvQixDQUE4QixRQUFXO1FBQ3RFLE1BQU0sT0FBTyxHQUFHLE1BQU0sd0JBQWEsQ0FBQyxVQUFVLENBQW1CLGFBQWEsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMxRixNQUFNLGFBQWEsR0FBRyxNQUFNLHdCQUFhLENBQUMsVUFBVSxDQUFzQixRQUFRLENBQUMsQ0FBQztRQUNwRixhQUFhLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUNsQyxhQUFhLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztRQUNwQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFTSx5QkFBeUI7UUFDNUIsTUFBTSxNQUFNLEdBQTJDLEVBQUUsQ0FBQztRQUMxRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUNsRCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUc7Z0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSTtnQkFDeEMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPO2FBQy9ELENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTSxtQkFBbUI7UUFDdEIsT0FBTztZQUNILE1BQU0sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLG1DQUFlLENBQUMsUUFBUSxDQUFDLFFBQW9CLENBQUMsQ0FBQztZQUM3RyxNQUFNLEVBQUUsSUFBSSxDQUFDLGNBQWM7U0FDOUIsQ0FBQztJQUNOLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksMEJBQTBCLENBQUMsUUFBMkIsRUFBRSxRQUFnQjtRQUMzRSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2hCLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQzlFLEtBQUssTUFBTSxPQUFPLElBQUksWUFBWSxFQUFFLENBQUM7WUFDakMsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQXFCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUM7WUFDNUYsSUFBSSxLQUFLLEVBQUUsQ0FBQztnQkFDUixPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssd0JBQXdCLENBQUMsUUFBa0I7UUFDL0MsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzFCLDBCQUEwQjtZQUMxQixJQUFJLENBQUMsNkJBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksNkJBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDbEQsT0FBTyxDQUFDLENBQUM7WUFDYixDQUFDO2lCQUFNLElBQUksNkJBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyw2QkFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUN6RCxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2QsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFlBQVksQ0FBQyxRQUEyQjtRQUMzQywyQkFBMkI7UUFDM0IsTUFBTSxNQUFNLEdBQW9CO1lBQzVCLFlBQVksRUFBRSxFQUFFO1lBQ2hCLEtBQUssRUFBRSxFQUFFO1NBQ1osQ0FBQztRQUNGLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzVELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUc7Z0JBQ3BCLElBQUksRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQztnQkFDN0MsUUFBUSxFQUFFLE9BQU8sS0FBSyxRQUFRO2FBQ2pDLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDL0UsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVNLHNCQUFzQixDQUFDLFFBQWdCO1FBQzFDLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLGdCQUFnQixDQUFDLElBQTZCO1FBQ2pELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELE9BQU87WUFDSCxZQUFZLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsQ0FBQztZQUNyRCxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7U0FDcEMsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQXppQkQsc0NBeWlCQztBQUVZLFFBQUEsYUFBYSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cyc7XHJcbmltcG9ydCB7IGJhc2VuYW1lLCBqb2luIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGNoZWNrQnVpbGRDb21tb25PcHRpb25zQnlLZXksIGNoZWNrQnVuZGxlQ29tcHJlc3Npb25TZXR0aW5nIH0gZnJvbSAnLi4vc2hhcmUvY29tbW9uLW9wdGlvbnMtdmFsaWRhdG9yJztcclxuaW1wb3J0IHsgTkFUSVZFX1BMQVRGT1JNLCBQTEFURk9STVMgfSBmcm9tICcuLi9zaGFyZS9wbGF0Zm9ybXMtb3B0aW9ucyc7XHJcbmltcG9ydCB7IHZhbGlkYXRvciwgdmFsaWRhdG9yTWFuYWdlciB9IGZyb20gJy4uL3NoYXJlL3ZhbGlkYXRvci1tYW5hZ2VyJztcclxuaW1wb3J0IHsgY2hlY2tDb25maWdEZWZhdWx0LCBkZWZhdWx0TWVyZ2UsIGRlZmF1bHRzRGVlcCwgZ2V0T3B0aW9uc0RlZmF1bHQsIHJlc29sdmVUb1JhdyB9IGZyb20gJy4uL3NoYXJlL3V0aWxzJztcclxuaW1wb3J0IHsgUGxhdGZvcm0sIElEaXNwbGF5T3B0aW9ucywgSUJ1aWxkVGFza09wdGlvbiwgSUNvbnNvbGVUeXBlIH0gZnJvbSAnLi4vQHR5cGVzJztcclxuaW1wb3J0IHsgSUludGVybmFsQnVpbGRQbHVnaW5Db25maWcsIElQbGF0Zm9ybUJ1aWxkUGx1Z2luQ29uZmlnLCBQbGF0Zm9ybUJ1bmRsZUNvbmZpZywgSUJ1aWxkU3RhZ2VJdGVtLCBCdWlsZENoZWNrUmVzdWx0LCBCdWlsZFRlbXBsYXRlQ29uZmlnLCBJQ29uZmlnR3JvdXBzSW5mbywgSVBsYXRmb3JtQ29uZmlnLCBJVGV4dHVyZUNvbXByZXNzQ29uZmlnLCBJQnVpbGRIb29rc0luZm8sIElCdWlsZENvbW1hbmRPcHRpb24sIE1ha2VSZXF1aXJlZCwgSUJ1aWxkZXJDb25maWdJdGVtLCBJUGxhdGZvcm1SZWdpc3RlckluZm8sIElQbHVnaW5SZWdpc3RlckluZm8sIElQYWNrYWdlUmVnaXN0ZXJJbmZvLCBJQnVpbGRlclJlZ2lzdGVySW5mbyB9IGZyb20gJy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vYmFzZS91dGlscyc7XHJcbmltcG9ydCBpMThuIGZyb20gJy4uLy4uL2Jhc2UvaTE4bic7XHJcbmltcG9ydCBsb2Rhc2ggZnJvbSAnbG9kYXNoJztcclxuaW1wb3J0IHsgY29uZmlnR3JvdXBzIH0gZnJvbSAnLi4vc2hhcmUvdGV4dHVyZS1jb21wcmVzcyc7XHJcbmltcG9ydCB7IG5ld0NvbnNvbGUgfSBmcm9tICcuLi8uLi9iYXNlL2NvbnNvbGUnO1xyXG5pbXBvcnQgYnVpbGRlckNvbmZpZyBmcm9tICcuLi9zaGFyZS9idWlsZGVyLWNvbmZpZyc7XHJcbmltcG9ydCB7IEdsb2JhbFBhdGhzIH0gZnJvbSAnLi4vLi4vLi4vZ2xvYmFsJztcclxuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZGRpclN5bmMgfSBmcm9tICdmcyc7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi8uLi9iYXNlL3V0aWxzJztcclxuaW1wb3J0IHsgcmVhZEpTT05TeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJbnRlcm5hbFBhY2thZ2VJbmZvIHtcclxuICAgIG5hbWU6IHN0cmluZzsgLy8g5o+S5Lu25ZCNXHJcbiAgICBwYXRoOiBzdHJpbmc7IC8vIOaPkuS7tui3r+W+hFxyXG4gICAgYnVpbGRQYXRoOiBzdHJpbmc7IC8vIOazqOWGjOWIsOaehOW7uueahOWFpeWPo1xyXG4gICAgZG9jPzogc3RyaW5nOyAvLyDmj5Lku7bms6jlhozliLDmnoTlu7rpnaLmnb/kuIrvvIzmmL7npLrnmoTmlofmoaPlhaXlj6NcclxuICAgIGRpc3BsYXlOYW1lPzogc3RyaW5nOyAvLyDmj5Lku7bnmoTmmL7npLrlkI3np7BcclxuICAgIHZlcnNpb246IHN0cmluZzsgLy8g54mI5pys5Y+3XHJcbn1cclxuXHJcbnR5cGUgSUN1c3RvbUFzc2V0SGFuZGxlclR5cGUgPSAnY29tcHJlc3NUZXh0dXJlcyc7XHJcbnR5cGUgSUFzc2V0SGFuZGxlcnMgPSBSZWNvcmQ8SUN1c3RvbUFzc2V0SGFuZGxlclR5cGUsIFJlY29yZDxzdHJpbmcsIEZ1bmN0aW9uPj47XHJcbi8vIOWvueWkluaUr+aMgeeahOWvueWkluWFrOW8gOeahOi1hOa6kOWkhOeQhuaWueazleaxh+aAu1xyXG5jb25zdCBDdXN0b21Bc3NldEhhbmRsZXJUeXBlczogSUN1c3RvbUFzc2V0SGFuZGxlclR5cGVbXSA9IFsnY29tcHJlc3NUZXh0dXJlcyddO1xyXG5cclxuY29uc3QgcGx1Z2luUm9vdHMgPSBbXHJcbiAgICBqb2luKF9fZGlybmFtZSwgJy4uL3BsYXRmb3JtcycpLFxyXG4gICAgam9pbihHbG9iYWxQYXRocy53b3Jrc3BhY2UsICdwYWNrYWdlcy9wbGF0Zm9ybXMnKSxcclxuXTtcclxuXHJcbmZ1bmN0aW9uIGdldFJlZ2lzdGVySW5mbyhyb290OiBzdHJpbmcsIGRpck5hbWU6IHN0cmluZykgOiBJUGxhdGZvcm1SZWdpc3RlckluZm8gfCBudWxsIHtcclxuICAgIGNvbnN0IHBhY2thZ2VKU09OUGF0aCA9IGpvaW4ocm9vdCwgJ3BhY2thZ2UuanNvbicpO1xyXG4gICAgaWYgKGV4aXN0c1N5bmMocGFja2FnZUpTT05QYXRoKSkge1xyXG4gICAgICAgIGNvbnN0IHBhY2thZ2VKU09OID0gcmVxdWlyZShwYWNrYWdlSlNPTlBhdGgpO1xyXG4gICAgICAgIGNvbnN0IGJ1aWxkZXI6IElQYWNrYWdlUmVnaXN0ZXJJbmZvID0gcGFja2FnZUpTT04uY29udHJpYnV0ZXMuYnVpbGRlcjtcclxuICAgICAgICBpZiAoIWJ1aWxkZXIucmVnaXN0ZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHBsYXRmb3JtOiBidWlsZGVyLnBsYXRmb3JtLFxyXG4gICAgICAgICAgICBob29rczogYnVpbGRlci5ob29rcyA/IGpvaW4ocm9vdCwgYnVpbGRlci5ob29rcykgOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgIGNvbmZpZzogcmVxdWlyZShqb2luKHJvb3QsIGJ1aWxkZXIuY29uZmlnKSkuZGVmYXVsdCxcclxuICAgICAgICAgICAgcGF0aDogcm9vdCxcclxuICAgICAgICAgICAgdHlwZTogJ3JlZ2lzdGVyJyxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh1dGlscy5QYXRoLmNvbnRhaW5zKEdsb2JhbFBhdGhzLndvcmtzcGFjZSwgcm9vdCkpIHtcclxuICAgICAgICBpZiAoUExBVEZPUk1TLmluY2x1ZGVzKGRpck5hbWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBwbGF0Zm9ybTogYmFzZW5hbWUocm9vdCksXHJcbiAgICAgICAgICAgICAgICBwYXRoOiByb290LFxyXG4gICAgICAgICAgICAgICAgY29uZmlnOiByZXF1aXJlKGpvaW4ocm9vdCwgJ2NvbmZpZycpKS5kZWZhdWx0LFxyXG4gICAgICAgICAgICAgICAgaG9va3M6IGpvaW4ocm9vdCwgJ2hvb2tzJyksXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAncmVnaXN0ZXInLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgZmluZCBwYWNrYWdlLmpzb24gaW4gcm9vdDogJHtyb290fWApO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzY2FuUGx1Z2luUm9vdChyb290OiBzdHJpbmcpOiBQcm9taXNlPElQbGF0Zm9ybVJlZ2lzdGVySW5mb1tdPntcclxuICAgIGNvbnN0IGRpck5hbWVzID0gcmVhZGRpclN5bmMocm9vdCk7XHJcbiAgICBjb25zdCByZXM6IElQbGF0Zm9ybVJlZ2lzdGVySW5mb1tdID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGRpck5hbWUgb2YgZGlyTmFtZXMpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCByZWdpc3RlckluZm8gPSBhd2FpdCBnZXRSZWdpc3RlckluZm8oam9pbihyb290LCBkaXJOYW1lKSwgZGlyTmFtZSk7XHJcbiAgICAgICAgICAgIHJlZ2lzdGVySW5mbyAmJiByZXMucHVzaChyZWdpc3RlckluZm8pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBSZWdpc3RlciBwbGF0Zm9ybSBwYWNrYWdlIGZhaWxlZCBpbiByb290OiAke3Jvb3R9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFBsdWdpbk1hbmFnZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG4gICAgLy8g5bmz5Y+w6YCJ6aG55L+h5oGvXHJcbiAgICBwdWJsaWMgYnVuZGxlQ29uZmlnczogUmVjb3JkPHN0cmluZywgUGxhdGZvcm1CdW5kbGVDb25maWc+ID0ge307XHJcbiAgICBwdWJsaWMgY29tbW9uT3B0aW9uQ29uZmlnOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBJQnVpbGRlckNvbmZpZ0l0ZW0gICYgeyB2ZXJpZnlLZXk6IHN0cmluZyB9Pj4gPSB7fTtcclxuICAgIHB1YmxpYyBwa2dPcHRpb25Db25maWdzOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBJRGlzcGxheU9wdGlvbnM+PiA9IHt9O1xyXG4gICAgcHVibGljIHBsYXRmb3JtQ29uZmlnOiBSZWNvcmQ8c3RyaW5nLCBJUGxhdGZvcm1Db25maWc+ID0ge307XHJcbiAgICBwdWJsaWMgYnVpbGRUZW1wbGF0ZUNvbmZpZ01hcDogUmVjb3JkPHN0cmluZywgQnVpbGRUZW1wbGF0ZUNvbmZpZz4gPSB7fTtcclxuICAgIHB1YmxpYyBjb25maWdNYXA6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIElJbnRlcm5hbEJ1aWxkUGx1Z2luQ29uZmlnPj47IC8vIOWtmOWCqOazqOWFpei/m+adpeeahCBjb25maWdcclxuICAgIC8vIOWtmOWCqOazqOWGjOi/m+adpeeahO+8jOW4puaciSBob29rcyDnmoTmj5Lku7bot6/lvoTvvIxbcGtnTmFtZV1bcGxhdGZvcm1dOiBob29rc1xyXG4gICAgcHJpdmF0ZSBidWlsZGVyUGF0aHNNYXA6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIHN0cmluZz4+ID0ge307XHJcbiAgICBwcml2YXRlIGN1c3RvbUJ1aWxkU3RhZ2VzTWFwOiB7XHJcbiAgICAgICAgW3BrZ05hbWU6IHN0cmluZ106IHtcclxuICAgICAgICAgICAgW3BsYXRmb3JtOiBzdHJpbmddOiBJQnVpbGRTdGFnZUl0ZW1bXTtcclxuICAgICAgICB9O1xyXG4gICAgfSA9IHt9O1xyXG4gICAgcHJvdGVjdGVkIGN1c3RvbUJ1aWxkU3RhZ2VzOiBSZWNvcmQ8c3RyaW5nLCB7XHJcbiAgICAgICAgW3BrZ05hbWU6IHN0cmluZ106IElCdWlsZFN0YWdlSXRlbVtdO1xyXG4gICAgfT47XHJcblxyXG4gICAgLy8g5a2Y5YKo5rOo5YaM6L+b5p2l55qE77yM5bim5pyJIGFzc2V0SGFuZGxlcnMg6YWN572u55qE5LiA5Lqb5pa55rOVIFtJQ3VzdG9tQXNzZXRIYW5kbGVyVHlwZV1bcGtnTmFtZV06IEZ1bmN0aW9uXHJcbiAgICBwcml2YXRlIGFzc2V0SGFuZGxlcnMgPSB7fSBhcyBJQXNzZXRIYW5kbGVycztcclxuICAgIC8vIOWtmOWCqOaPkuS7tuS8mOWFiOe6p++8iFRPRE8g55uu5YmN5LyY5YWI57qn6K6w5b2V5ZyoIGNvbmZpZyDlhoXvvIzpkojlr7nkuI3lkIzlubPlj7Dlj6/og73mnInkuI3lkIznmoTkvJjlhYjnuqfvvIlcclxuICAgIHByb3RlY3RlZCByZWFkb25seSBwa2dQcmlvcml0aWVzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcblxyXG4gICAgLy8g6K6w5b2V5bey5rOo5YaM55qE5o+S5Lu25ZCN56ewXHJcbiAgICBwdWJsaWMgcGFja2FnZVJlZ2lzdGVySW5mbzogTWFwPHN0cmluZywgSW50ZXJuYWxQYWNrYWdlSW5mbz4gPSBuZXcgTWFwKCk7XHJcblxyXG4gICAgcHJpdmF0ZSBwbGF0Zm9ybVJlZ2lzdGVySW5mb1Bvb2w6IE1hcDxzdHJpbmcsIElQbGF0Zm9ybVJlZ2lzdGVySW5mbz4gPSBuZXcgTWFwKCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICBjb25zdCBjb21wc01hcDogYW55ID0ge307XHJcbiAgICAgICAgdGhpcy5wa2dPcHRpb25Db25maWdzID0gY29tcHNNYXA7XHJcbiAgICAgICAgdGhpcy5jb25maWdNYXAgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbXBzTWFwKSk7XHJcbiAgICAgICAgdGhpcy5jdXN0b21CdWlsZFN0YWdlcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY29tcHNNYXApKTtcclxuICAgICAgICBDdXN0b21Bc3NldEhhbmRsZXJUeXBlcy5mb3JFYWNoKChoYW5kbGVyTmFtZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmFzc2V0SGFuZGxlcnNbaGFuZGxlck5hbWVdID0ge307XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgaW5pdCgpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IHJvb3Qgb2YgcGx1Z2luUm9vdHMpIHtcclxuICAgICAgICAgICAgaWYgKCFleGlzdHNTeW5jKHJvb3QpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBpbmZvcyA9IGF3YWl0IHNjYW5QbHVnaW5Sb290KHJvb3QpO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGluZm8gb2YgaW5mb3MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxhdGZvcm1SZWdpc3RlckluZm9Qb29sLnNldChpbmZvLnBsYXRmb3JtLCBpbmZvKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgcmVnaXN0ZXJBbGxQbGF0Zm9ybSgpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IHBsYXRmb3JtIG9mIHRoaXMucGxhdGZvcm1SZWdpc3RlckluZm9Qb29sLmtleXMoKSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWdpc3RlcihwbGF0Zm9ybSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHJlZ2lzdGVyIHBsYXRmb3JtICR7cGxhdGZvcm19IGZhaWxlZCFgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgcmVnaXN0ZXIocGxhdGZvcm06IHN0cmluZykge1xyXG4gICAgICAgIGlmICh0aGlzLnBsYXRmb3JtQ29uZmlnW3BsYXRmb3JtXSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBwbGF0Zm9ybSAke3BsYXRmb3JtfSBoYXMgcmVnaXN0ZXIgYWxyZWFkeSFgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbmZvID0gdGhpcy5wbGF0Zm9ybVJlZ2lzdGVySW5mb1Bvb2wuZ2V0KHBsYXRmb3JtKTtcclxuICAgICAgICBpZiAoIWluZm8pIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IGZpbmQgcGxhdGZvcm0gcmVnaXN0ZXIgaW5mbyBmb3IgJHtwbGF0Zm9ybX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgdGhpcy5yZWdpc3RlclBsYXRmb3JtKGluZm8pO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuaW50ZXJuYWxSZWdpc3RlcihpbmZvKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgcmVnaXN0ZXIgcGxhdGZvcm0gJHtwbGF0Zm9ybX0gc3VjY2VzcyFgKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2hlY2tQbGF0Zm9ybShwbGF0Zm9ybTogc3RyaW5nKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmV0dXJuICEhcGxhdGZvcm0gJiYgISF0aGlzLnBsYXRmb3JtQ29uZmlnW3BsYXRmb3JtXS5wbGF0Zm9ybVR5cGU7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIHJlZ2lzdGVyUGxhdGZvcm0ocmVnaXN0ZXJJbmZvOiBJUGxhdGZvcm1SZWdpc3RlckluZm8pIHtcclxuICAgICAgICBjb25zdCB7IHBsYXRmb3JtLCBjb25maWcgfSA9IHJlZ2lzdGVySW5mbztcclxuICAgICAgICBpZiAodGhpcy5wbGF0Zm9ybUNvbmZpZ1twbGF0Zm9ybV0pIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgcGxhdGZvcm0gJHtwbGF0Zm9ybX0gaGFzIHJlZ2lzdGVyIGFscmVhZHkhYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jb25maWdNYXBbcGxhdGZvcm1dID0ge307XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybUNvbmZpZ1twbGF0Zm9ybV0gPSB7fSBhcyBJUGxhdGZvcm1Db25maWc7XHJcbiAgICAgICAgaWYgKGNvbmZpZy5hc3NldEJ1bmRsZUNvbmZpZykge1xyXG4gICAgICAgICAgICB0aGlzLmJ1bmRsZUNvbmZpZ3NbcGxhdGZvcm1dID0gT2JqZWN0LmFzc2lnbih0aGlzLmJ1bmRsZUNvbmZpZ3NbcGxhdGZvcm1dIHx8IHt9LCB7XHJcbiAgICAgICAgICAgICAgICBwbGF0Zm9ybVR5cGU6IGNvbmZpZy5hc3NldEJ1bmRsZUNvbmZpZy5wbGF0Zm9ybVR5cGUsXHJcbiAgICAgICAgICAgICAgICBzdXBwb3J0T3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXByZXNzaW9uVHlwZTogY29uZmlnLmFzc2V0QnVuZGxlQ29uZmlnLnN1cHBvcnRlZENvbXByZXNzaW9uVHlwZXMsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5rOo5YaM5Y6L57yp57q555CG6YWN572u77yM6ZyA6KaB5Zyo5bmz5Y+w5YmU6Zmk5LmL5YmNXHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWcudGV4dHVyZUNvbXByZXNzQ29uZmlnID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb25zdCBjb25maWdHcm91cHNJbmZvOiBJQ29uZmlnR3JvdXBzSW5mbyA9IGNvbmZpZ0dyb3Vwc1tjb25maWcudGV4dHVyZUNvbXByZXNzQ29uZmlnLnBsYXRmb3JtVHlwZV07XHJcbiAgICAgICAgICAgIGlmICghY29uZmlnR3JvdXBzSW5mbykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgSW52YWxpZCBwbGF0Zm9ybVR5cGUgJHtjb25maWcudGV4dHVyZUNvbXByZXNzQ29uZmlnLnBsYXRmb3JtVHlwZX1gKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbmZpZ0dyb3Vwc0luZm8uc3VwcG9ydC5yZ2IgPSBsb2Rhc2gudW5pb24oY29uZmlnR3JvdXBzSW5mby5zdXBwb3J0LnJnYiwgY29uZmlnLnRleHR1cmVDb21wcmVzc0NvbmZpZy5zdXBwb3J0LnJnYik7XHJcbiAgICAgICAgICAgICAgICBjb25maWdHcm91cHNJbmZvLnN1cHBvcnQucmdiYSA9IGxvZGFzaC51bmlvbihjb25maWdHcm91cHNJbmZvLnN1cHBvcnQucmdiYSwgY29uZmlnLnRleHR1cmVDb21wcmVzc0NvbmZpZy5zdXBwb3J0LnJnYmEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZ0dyb3Vwc0luZm8uZGVmYXVsdFN1cHBvcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25maWcudGV4dHVyZUNvbXByZXNzQ29uZmlnLnN1cHBvcnQucmdiID0gbG9kYXNoLnVuaW9uKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcudGV4dHVyZUNvbXByZXNzQ29uZmlnLnN1cHBvcnQucmdiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWdHcm91cHNJbmZvLmRlZmF1bHRTdXBwb3J0LnJnYixcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy50ZXh0dXJlQ29tcHJlc3NDb25maWcuc3VwcG9ydC5yZ2JhID0gbG9kYXNoLnVuaW9uKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcudGV4dHVyZUNvbXByZXNzQ29uZmlnLnN1cHBvcnQucmdiYSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnR3JvdXBzSW5mby5kZWZhdWx0U3VwcG9ydC5yZ2JhLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wbGF0Zm9ybUNvbmZpZ1twbGF0Zm9ybV0udGV4dHVyZSA9IGNvbmZpZy50ZXh0dXJlQ29tcHJlc3NDb25maWc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGxhdGZvcm1Db25maWdbcGxhdGZvcm1dLm5hbWUgPSBjb25maWcuZGlzcGxheU5hbWU7XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybUNvbmZpZ1twbGF0Zm9ybV0ucGxhdGZvcm1UeXBlID0gKGNvbmZpZyBhcyBJUGxhdGZvcm1CdWlsZFBsdWdpbkNvbmZpZykucGxhdGZvcm1UeXBlO1xyXG5cclxuICAgICAgICBpZiAoY29uZmlnLmJ1aWxkVGVtcGxhdGVDb25maWcgJiYgY29uZmlnLmJ1aWxkVGVtcGxhdGVDb25maWcudGVtcGxhdGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBsYWJlbCA9IGNvbmZpZy5kaXNwbGF5TmFtZSB8fCBwbGF0Zm9ybTtcclxuICAgICAgICAgICAgdGhpcy5wbGF0Zm9ybUNvbmZpZ1twbGF0Zm9ybV0uY3JlYXRlVGVtcGxhdGVMYWJlbCA9IGxhYmVsO1xyXG4gICAgICAgICAgICB0aGlzLmJ1aWxkVGVtcGxhdGVDb25maWdNYXBbbGFiZWxdID0gY29uZmlnLmJ1aWxkVGVtcGxhdGVDb25maWc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmJ1bmRsZUNvbmZpZ3NbcGxhdGZvcm1dKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxhdGZvcm1Db25maWdbcGxhdGZvcm1dLnR5cGUgPSB0aGlzLmJ1bmRsZUNvbmZpZ3NbcGxhdGZvcm1dLnBsYXRmb3JtVHlwZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBpbnRlcm5hbFJlZ2lzdGVyKHJlZ2lzdGVySW5mbzogSUJ1aWxkZXJSZWdpc3RlckluZm8pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCB7IHBsYXRmb3JtLCBjb25maWcsIHBhdGggfSA9IHJlZ2lzdGVySW5mbztcclxuICAgICAgICBpZiAoIXRoaXMucGxhdGZvcm1Db25maWdbcGxhdGZvcm1dIHx8ICF0aGlzLnBsYXRmb3JtQ29uZmlnW3BsYXRmb3JtXS5uYW1lKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgcGxhdGZvcm0gJHtwbGF0Zm9ybX0gaGFzIGJlZW4gcmVnaXN0ZXJlZCFgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBrZ05hbWUgPSByZWdpc3RlckluZm8ucGtnTmFtZSB8fCBwbGF0Zm9ybTtcclxuICAgICAgICB0aGlzLnBrZ1ByaW9yaXRpZXNbcGtnTmFtZV0gPSBjb25maWcucHJpb3JpdHkgfHwgKHBhdGguaW5jbHVkZXMoR2xvYmFsUGF0aHMud29ya3NwYWNlKSA/IDEgOiAwKTtcclxuICAgICAgICB0aGlzLl9yZWdpc3RlckkxOG4ocmVnaXN0ZXJJbmZvKTtcclxuICAgICAgICAvLyDms6jlhozmoKHpqozmlrnms5VcclxuICAgICAgICBpZiAodHlwZW9mIGNvbmZpZy52ZXJpZnlSdWxlTWFwID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtydWxlTmFtZSwgaXRlbV0gb2YgT2JqZWN0LmVudHJpZXMoY29uZmlnLnZlcmlmeVJ1bGVNYXApKSB7XHJcbiAgICAgICAgICAgICAgICAvLyDmt7vliqDku6Ug5bmz5Y+wICsg5o+S5Lu2IOS9nOS4uiBrZXkg55qE5qCh6aqM6KeE5YiZXHJcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3JNYW5hZ2VyLmFkZFJ1bGUocnVsZU5hbWUsIGl0ZW0sIHBsYXRmb3JtICsgcGtnTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcuZG9jICYmICFjb25maWcuZG9jLnN0YXJ0c1dpdGgoJ2h0dHAnKSkge1xyXG4gICAgICAgICAgICBjb25maWcuZG9jID0gVXRpbHMuVXJsLmdldERvY1VybChjb25maWcuZG9jKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb25maWcub3B0aW9ucyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgbG9kYXNoLnNldCh0aGlzLnBrZ09wdGlvbkNvbmZpZ3MsIGAke3JlZ2lzdGVySW5mby5wbGF0Zm9ybX0uJHtwa2dOYW1lfWAsIGNvbmZpZy5vcHRpb25zKTtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY29uZmlnLm9wdGlvbnMpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2hlY2tDb25maWdEZWZhdWx0KGNvbmZpZy5vcHRpb25zIVtrZXldKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGF3YWl0IGJ1aWxkZXJDb25maWcuc2V0UHJvamVjdChgcGxhdGZvcm1zLiR7cGxhdGZvcm19LnBhY2thZ2VzLiR7cGxhdGZvcm19YCwgZ2V0T3B0aW9uc0RlZmF1bHQoY29uZmlnLm9wdGlvbnMpLCAnZGVmYXVsdCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5pW055CG6YCa55So5p6E5bu66YCJ6aG555qE5qCh6aqM6KeE5YiZXHJcbiAgICAgICAgaWYgKGNvbmZpZy5jb21tb25PcHRpb25zKSB7XHJcbiAgICAgICAgICAgIC8vIOatpOacuuWItuS+nei1luS6huaPkuS7tueahOWQr+WKqOmhuuW6j+adpeWGmeWFpemFjee9rlxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY29tbW9uT3B0aW9uQ29uZmlnW3BsYXRmb3JtXSkge1xyXG4gICAgICAgICAgICAgICAgLy8g5L2/55So6buY6K6k6YCa55So6YWN572u5ZKM6aaW5Liq5o+S5Lu26Ieq5a6a5LmJ55qE6YCa55So6YWN572u6L+b6KGM6J6N5ZCIXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1vbk9wdGlvbkNvbmZpZ1twbGF0Zm9ybV0gPSBPYmplY3QuYXNzaWduKHt9LCBsb2Rhc2guZGVmYXVsdHNEZWVwKHt9LCBjb25maWcuY29tbW9uT3B0aW9ucywgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShidWlsZGVyQ29uZmlnLmNvbW1vbk9wdGlvbkNvbmZpZ3MpKSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb21tb25PcHRpb25Db25maWdbcGxhdGZvcm1dID0gZGVmYXVsdE1lcmdlKHt9LCB0aGlzLmNvbW1vbk9wdGlvbkNvbmZpZ1twbGF0Zm9ybV0sIGNvbmZpZy5jb21tb25PcHRpb25zIHx8IHt9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBjb21tb25PcHRpb25zID0gY29uZmlnLmNvbW1vbk9wdGlvbnM7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGNvbW1vbk9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjb21tb25PcHRpb25zW2tleV0udmVyaWZ5UnVsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbW1vbk9wdGlvbkNvbmZpZ1twbGF0Zm9ybV1ba2V5XSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29tbW9uT3B0aW9uQ29uZmlnW3BsYXRmb3JtXVtrZXldLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcmlmeUtleTogcGxhdGZvcm0gKyBwa2dOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb25maWcuY3VzdG9tQnVpbGRTdGFnZXMpIHtcclxuICAgICAgICAgICAgLy8g5rOo5YaM5p6E5bu66Zi25q615oCn5Lu75YqhXHJcbiAgICAgICAgICAgIGxvZGFzaC5zZXQodGhpcy5jdXN0b21CdWlsZFN0YWdlcywgYCR7cGxhdGZvcm19LiR7cGtnTmFtZX1gLCBjb25maWcuY3VzdG9tQnVpbGRTdGFnZXMpO1xyXG4gICAgICAgICAgICBsb2Rhc2guc2V0KHRoaXMuY3VzdG9tQnVpbGRTdGFnZXNNYXAsIGAke3BrZ05hbWV9LiR7cGxhdGZvcm19YCwgY29uZmlnLmN1c3RvbUJ1aWxkU3RhZ2VzKTtcclxuICAgICAgICAgICAgYXdhaXQgYnVpbGRlckNvbmZpZy5zZXRQcm9qZWN0KGBwbGF0Zm9ybXMuJHtwbGF0Zm9ybX0uZ2VuZXJhdGVDb21waWxlQ29uZmlnYCwgdGhpcy5zaG91bGRHZW5lcmF0ZU9wdGlvbnMocGxhdGZvcm0pLCAnZGVmYXVsdCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wa2dQcmlvcml0aWVzW3BrZ05hbWVdID0gY29uZmlnLnByaW9yaXR5IHx8IDA7XHJcbiAgICAgICAgdGhpcy5jb25maWdNYXBbcGxhdGZvcm1dW3BrZ05hbWVdID0gY29uZmlnO1xyXG4gICAgICAgIC8vIOazqOWGjCBob29rcyDot6/lvoRcclxuICAgICAgICBpZiAocmVnaXN0ZXJJbmZvLmhvb2tzKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5ob29rcyA9IHJlZ2lzdGVySW5mby5ob29rcztcclxuICAgICAgICAgICAgbG9kYXNoLnNldCh0aGlzLmJ1aWxkZXJQYXRoc01hcCwgYCR7cGtnTmFtZX0uJHtwbGF0Zm9ybX1gLCBjb25maWcuaG9va3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDms6jlhozmnoTlu7rmqKHmnb/oj5zljZXpoblcclxuICAgICAgICBjb25zb2xlLmRlYnVnKGBbQnVpbGRdIGludGVybmFsUmVnaXN0ZXIgcGtnKCR7cGtnTmFtZX0pIGluICR7cGxhdGZvcm19IHBsYXRmb3JtIHN1Y2Nlc3MhYCk7XHJcbiAgICB9XHJcblxyXG4gICAgX3JlZ2lzdGVySTE4bihyZWdpc3RlckluZm86IElCdWlsZGVyUmVnaXN0ZXJJbmZvKSB7XHJcbiAgICAgICAgY29uc3QgeyBwbGF0Zm9ybSwgcGF0aCB9ID0gcmVnaXN0ZXJJbmZvO1xyXG4gICAgICAgIGNvbnN0IGkxOG5QYXRoID0gam9pbihwYXRoLCAnaTE4bicpO1xyXG4gICAgICAgIGlmIChleGlzdHNTeW5jKGkxOG5QYXRoKSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcmVhZGRpclN5bmMoaTE4blBhdGgpLmZvckVhY2goKGZpbGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZS5lbmRzV2l0aCgnLmpzb24nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsYW5nID0gYmFzZW5hbWUoZmlsZSwgJy5qc29uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGggPSByZWdpc3RlckluZm8ucGtnTmFtZSB8fCBwbGF0Zm9ybTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaTE4bi5yZWdpc3Rlckxhbmd1YWdlUGF0Y2gobGFuZywgcGF0aCwgcmVhZEpTT05TeW5jKGpvaW4oaTE4blBhdGgsIGZpbGUpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVnaXN0ZXJJbmZvLnR5cGUgPT09ICdyZWdpc3RlcicpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDb21tb25PcHRpb25Db25maWdzKHBsYXRmb3JtOiBQbGF0Zm9ybSk6IFJlY29yZDxzdHJpbmcsIElCdWlsZGVyQ29uZmlnSXRlbT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbW1vbk9wdGlvbkNvbmZpZ1twbGF0Zm9ybV07XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldENvbW1vbk9wdGlvbkNvbmZpZ0J5S2V5KGtleToga2V5b2YgSUJ1aWxkVGFza09wdGlvbiwgb3B0aW9uczogSUJ1aWxkVGFza09wdGlvbik6IElCdWlsZGVyQ29uZmlnSXRlbSB8IG51bGwge1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29tbW9uT3B0aW9uQ29uZmlnW29wdGlvbnMucGxhdGZvcm0gYXMgUGxhdGZvcm1dICYmIHRoaXMuY29tbW9uT3B0aW9uQ29uZmlnW29wdGlvbnMucGxhdGZvcm0gYXMgUGxhdGZvcm1dW2tleV0gfHwge307XHJcbiAgICAgICAgaWYgKGJ1aWxkZXJDb25maWcuY29tbW9uT3B0aW9uQ29uZmlnc1trZXldKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRDb25maWcgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGJ1aWxkZXJDb25maWcuY29tbW9uT3B0aW9uQ29uZmlnc1trZXldKSk7XHJcbiAgICAgICAgICAgIGxvZGFzaC5kZWZhdWx0c0RlZXAoY29uZmlnLCBkZWZhdWx0Q29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFjb25maWcgfHwgIWNvbmZpZy52ZXJpZnlSdWxlcykge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbmZpZztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UGFja2FnZU9wdGlvbkNvbmZpZ0J5S2V5KGtleTogc3RyaW5nLCBwa2dOYW1lOiBzdHJpbmcsIG9wdGlvbnM6IElCdWlsZFRhc2tPcHRpb24pOiBJQnVpbGRlckNvbmZpZ0l0ZW0gfCBudWxsIHtcclxuICAgICAgICBpZiAoIWtleSB8fCAhcGtnTmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMucGtnT3B0aW9uQ29uZmlnc1tvcHRpb25zLnBsYXRmb3JtIGFzIFBsYXRmb3JtXVtwa2dOYW1lXTtcclxuICAgICAgICBpZiAoIWNvbmZpZ3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsb2Rhc2guZ2V0KGNvbmZpZ3MsIGtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldE9wdGlvbkNvbmZpZ0J5S2V5KGtleToga2V5b2YgSUJ1aWxkVGFza09wdGlvbiwgb3B0aW9uczogSUJ1aWxkVGFza09wdGlvbik6IElCdWlsZGVyQ29uZmlnSXRlbSB8IG51bGwge1xyXG4gICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBrZXlNYXRjaCA9IGtleSAmJiAoa2V5KS5tYXRjaCgvXm9wdGlvbnMucGFja2FnZXMuKChbXi5dKikuKikkLyk7XHJcbiAgICAgICAgaWYgKCFrZXlNYXRjaCB8fCAha2V5TWF0Y2hbMl0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29tbW9uT3B0aW9uQ29uZmlnQnlLZXkoa2V5LCBvcHRpb25zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IFssIHBhdGgsIHBrZ05hbWVdID0ga2V5TWF0Y2g7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGFja2FnZU9wdGlvbkNvbmZpZ0J5S2V5KHBhdGgsIHBrZ05hbWUsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5a6M5pW05qCh6aqM5p6E5bu65Y+C5pWw77yI5qCh6aqM5bmz5Y+w5o+S5Lu255u45YWz55qE5Y+C5pWw5qCh6aqM77yJXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgY2hlY2tPcHRpb25zKG9wdGlvbnM6IE1ha2VSZXF1aXJlZDxJQnVpbGRDb21tYW5kT3B0aW9uLCAncGxhdGZvcm0nIHwgJ21haW5CdW5kbGVDb21wcmVzc2lvblR5cGUnPik6IFByb21pc2U8dW5kZWZpbmVkIHwgSUJ1aWxkVGFza09wdGlvbj4ge1xyXG4gICAgICAgIC8vIOWvueWPguaVsOWBmuaVsOaNrumqjOivgVxyXG4gICAgICAgIGxldCBjaGVja1JlcyA9IHRydWU7XHJcbiAgICAgICAgaWYgKHRoaXMuYnVuZGxlQ29uZmlnc1tvcHRpb25zLnBsYXRmb3JtIGFzIFBsYXRmb3JtXSkge1xyXG4gICAgICAgICAgICBjb25zdCBzdXBwb3J0ZWRDb21wcmVzc2lvblR5cGVzID0gdGhpcy5idW5kbGVDb25maWdzW29wdGlvbnMucGxhdGZvcm0gYXMgUGxhdGZvcm1dLnN1cHBvcnRPcHRpb25zLmNvbXByZXNzaW9uVHlwZTtcclxuICAgICAgICAgICAgY29uc3QgY29tcHJlc3Npb25UeXBlUmVzdWx0ID0gYXdhaXQgY2hlY2tCdW5kbGVDb21wcmVzc2lvblNldHRpbmcob3B0aW9ucy5tYWluQnVuZGxlQ29tcHJlc3Npb25UeXBlLCBzdXBwb3J0ZWRDb21wcmVzc2lvblR5cGVzKTtcclxuICAgICAgICAgICAgY29uc3QgaXNWYWxpZCA9IHZhbGlkYXRvci5jaGVja1dpdGhJbnRlcm5hbFJ1bGUoJ3ZhbGlkJywgY29tcHJlc3Npb25UeXBlUmVzdWx0Lm5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKGlzVmFsaWQpIHtcclxuICAgICAgICAgICAgICAgIGxvZGFzaC5zZXQob3B0aW9ucywgJ21haW5CdW5kbGVDb21wcmVzc2lvblR5cGUnLCBjb21wcmVzc2lvblR5cGVSZXN1bHQubmV3VmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOacieaKpemUmeS/oeaBr++8jOS5n+acieS/ruWkjeWAvO+8jOWPquWPkeaKpemUmeS4jeS4reaWre+8jOS9v+eUqOaWsOWAvFxyXG4gICAgICAgICAgICBpZiAoY29tcHJlc3Npb25UeXBlUmVzdWx0LmVycm9yICYmIGlzVmFsaWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihpMThuLnQoJ2J1aWxkZXIud2Fybi5jaGVja19mYWlsZWRfd2l0aF9uZXdfdmFsdWUnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnbWFpbkJ1bmRsZUNvbXByZXNzaW9uVHlwZScsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG9wdGlvbnMubWFpbkJ1bmRsZUNvbXByZXNzaW9uVHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogaTE4bi50cmFuc0kxOG5OYW1lKGNvbXByZXNzaW9uVHlwZVJlc3VsdC5lcnJvcikgfHwgY29tcHJlc3Npb25UeXBlUmVzdWx0LmVycm9yLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBKU09OLnN0cmluZ2lmeShjb21wcmVzc2lvblR5cGVSZXN1bHQubmV3VmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgQ2FuIG5vdCBmaW5kIGJ1bmRsZSBjb25maWcgd2l0aCBwbGF0Zm9ybSAke29wdGlvbnMucGxhdGZvcm19YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAo5qCh6aqM5aSE5bey57uP5YGa5LqG6ZSZ6K+v5pWw5o2u5L2/55So6buY6K6k5YC855qE5aSE55CGKeajgOmqjOaVsOaNrumAmui/h+WQjuWBmuS4gOasoeaVsOaNruiejeWQiFxyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0gYXdhaXQgdGhpcy5nZXRPcHRpb25zQnlQbGF0Zm9ybShvcHRpb25zLnBsYXRmb3JtKTtcclxuICAgICAgICAvLyBsb2Rhc2gg55qEIGRlZmF1bHRzRGVlcCDkvJrlr7nmlbDnu4TkuZ/ov5vooYzmt7HluqblkIjlubbvvIzkuI3nrKblkIjmiJHku6znmoTkvb/nlKjpooTmnJ/vvIzpnIDopoHoh6rlt7HnvJblhpnor6Xlh73mlbBcclxuICAgICAgICBjb25zdCByaWdodE9wdGlvbnMgPSBkZWZhdWx0c0RlZXAoSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHRpb25zKSksIGRlZmF1bHRPcHRpb25zKTtcclxuICAgICAgICAvLyDkvKDpgJLkuoYgYnVpbGRTdGFnZUdyb3VwIOeahOmAiemhue+8jOS4jemcgOimgeWBmum7mOiupOWAvOWQiOW5tlxyXG4gICAgICAgIGlmICgnYnVpbGRTdGFnZUdyb3VwJyBpbiBvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHJpZ2h0T3B0aW9ucy5idWlsZFN0YWdlR3JvdXAgPSBvcHRpb25zLmJ1aWxkU3RhZ2VHcm91cDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g6YCa55So5Y+C5pWw55qE5p6E5bu65qCh6aqMLCDpnIDopoHkvb/nlKjpu5jorqTlgLzooaXlhajmiYDmnInnmoQga2V5XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMocmlnaHRPcHRpb25zKSkge1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAncGFja2FnZXMnKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLmNoZWNrQ29tbW9uT3B0aW9uQnlLZXkoa2V5IGFzIGtleW9mIElCdWlsZFRhc2tPcHRpb24sIHJpZ2h0T3B0aW9uc1trZXldLCByaWdodE9wdGlvbnMpO1xyXG4gICAgICAgICAgICBpZiAocmVzICYmIHJlcy5lcnJvciAmJiByZXMubGV2ZWwgPT09ICdlcnJvcicpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGVyck1zZyA9IGkxOG4udHJhbnNJMThuTmFtZShyZXMuZXJyb3IpIHx8IHJlcy5lcnJvcjtcclxuICAgICAgICAgICAgICAgIGlmICghdmFsaWRhdG9yLmNoZWNrV2l0aEludGVybmFsUnVsZSgndmFsaWQnLCByZXMubmV3VmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tSZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGkxOG4udCgnYnVpbGRlci5lcnJvci5jaGVja19mYWlsZWQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IEpTT04uc3RyaW5naWZ5KHJpZ2h0T3B0aW9uc1trZXldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVyck1zZyxcclxuICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5Ye6546w5qOA5p+l6ZSZ6K+v77yM55u05o6l5Lit5pat5p6E5bu6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDluLjop4TmnoTlu7rlpoLmnpzmlrDnmoTlgLzlj6/nlKjvvIzkuI3kuK3mlq3vvIzlj6rorablkYpcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oaTE4bi50KCdidWlsZGVyLndhcm4uY2hlY2tfZmFpbGVkX3dpdGhfbmV3X3ZhbHVlJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeShyaWdodE9wdGlvbnNba2V5XSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJNc2csXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBKU09OLnN0cmluZ2lmeShyZXMubmV3VmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByaWdodE9wdGlvbnNba2V5XSA9IHJlcy5uZXdWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5jaGVja1BsdWdpbk9wdGlvbnMocmlnaHRPcHRpb25zKTtcclxuICAgICAgICBpZiAoIXJlc3VsdCkge1xyXG4gICAgICAgICAgICBjaGVja1JlcyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2hlY2tSZXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJpZ2h0T3B0aW9ucztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGNoZWNrQ29tbW9uT3B0aW9ucyhvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgY2hlY2tSZXM6IFJlY29yZDxzdHJpbmcsIEJ1aWxkQ2hlY2tSZXN1bHQ+ID0ge307XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMob3B0aW9ucykpIHtcclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3BhY2thZ2VzJykge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBjaGVja1Jlc1trZXldID0gYXdhaXQgdGhpcy5jaGVja0NvbW1vbk9wdGlvbkJ5S2V5KGtleSBhcyBrZXlvZiBJQnVpbGRUYXNrT3B0aW9uLCBvcHRpb25zW2tleV0sIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hlY2tSZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGNoZWNrQ29tbW9uT3B0aW9uQnlLZXkoa2V5OiBrZXlvZiBJQnVpbGRUYXNrT3B0aW9uLCB2YWx1ZTogYW55LCBvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uKTogUHJvbWlzZTxCdWlsZENoZWNrUmVzdWx0PiB7XHJcbiAgICAgICAgLy8g5LyY5YWI5L2/55So6Ieq5a6a5LmJ55qE5qCh6aqM5Ye95pWwXHJcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgY2hlY2tCdWlsZENvbW1vbk9wdGlvbnNCeUtleShrZXksIHZhbHVlLCBvcHRpb25zKTtcclxuICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuZ2V0Q29tbW9uT3B0aW9uQ29uZmlnQnlLZXkoa2V5LCBvcHRpb25zKTtcclxuICAgICAgICBpZiAoIWNvbmZpZykge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgZXJyb3I6ICcnLFxyXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdlcnJvcicsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBlcnJvciA9IGF3YWl0IHZhbGlkYXRvck1hbmFnZXIuY2hlY2soXHJcbiAgICAgICAgICAgIHZhbHVlLFxyXG4gICAgICAgICAgICBjb25maWcudmVyaWZ5UnVsZXMhLFxyXG4gICAgICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgICAgICB0aGlzLmNvbW1vbk9wdGlvbkNvbmZpZ1tvcHRpb25zLnBsYXRmb3JtIGFzIFBsYXRmb3JtXSAmJiB0aGlzLmNvbW1vbk9wdGlvbkNvbmZpZ1tvcHRpb25zLnBsYXRmb3JtIGFzIFBsYXRmb3JtXVtrZXldPy52ZXJpZnlLZXkgfHwgKG9wdGlvbnMucGxhdGZvcm0gKyBvcHRpb25zLnBsYXRmb3JtKSxcclxuICAgICAgICApO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGVycm9yLFxyXG4gICAgICAgICAgICBuZXdWYWx1ZTogZXJyb3IgPyBjb25maWcuZGVmYXVsdCA6IHZhbHVlLFxyXG4gICAgICAgICAgICBsZXZlbDogY29uZmlnLnZlcmlmeUxldmVsIHx8ICdlcnJvcicsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOagoemqjOaehOW7uuaPkuS7tuazqOWGjOeahOaehOW7uuWPguaVsFxyXG4gICAgICogQHBhcmFtIG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBjaGVja1BsdWdpbk9wdGlvbnMob3B0aW9uczogSUJ1aWxkVGFza09wdGlvbikge1xyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5wYWNrYWdlcyAhPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY2hlY2tSZXMgPSB0cnVlO1xyXG4gICAgICAgIGZvciAoY29uc3QgcGtnTmFtZSBvZiBPYmplY3Qua2V5cyhvcHRpb25zLnBhY2thZ2VzKSkge1xyXG4gICAgICAgICAgICBjb25zdCBwYWNrYWdlT3B0aW9ucyA9IG9wdGlvbnMucGFja2FnZXNbcGtnTmFtZSBhcyBQbGF0Zm9ybV07XHJcbiAgICAgICAgICAgIGlmICghcGFja2FnZU9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBidWlsZENvbmZpZyA9IHBsdWdpbk1hbmFnZXIuY29uZmlnTWFwW29wdGlvbnMucGxhdGZvcm0gYXMgUGxhdGZvcm1dW3BrZ05hbWVdO1xyXG4gICAgICAgICAgICBpZiAoIWJ1aWxkQ29uZmlnIHx8ICFidWlsZENvbmZpZy5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhwYWNrYWdlT3B0aW9ucykpIHtcclxuICAgICAgICAgICAgICAgIGlmICghYnVpbGRDb25maWcub3B0aW9uc1trZXldIHx8ICFidWlsZENvbmZpZy5vcHRpb25zW2tleV0udmVyaWZ5UnVsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlOiBhbnkgPSBwYWNrYWdlT3B0aW9uc1trZXldO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBhd2FpdCB2YWxpZGF0b3JNYW5hZ2VyLmNoZWNrKFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlnLm9wdGlvbnNba2V5XS52ZXJpZnlSdWxlcyEsXHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5NYW5hZ2VyLmNvbW1vbk9wdGlvbkNvbmZpZ1tvcHRpb25zLnBsYXRmb3JtIGFzIFBsYXRmb3JtXVtrZXldPy52ZXJpZnlLZXkgfHwgKG9wdGlvbnMucGxhdGZvcm0gKyBwa2dOYW1lKSxcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgdXNlRGVmYXVsdCA9IHZhbGlkYXRvci5jaGVja1dpdGhJbnRlcm5hbFJ1bGUoJ3ZhbGlkJywgYnVpbGRDb25maWcub3B0aW9uc1trZXldLmRlZmF1bHQpO1xyXG4gICAgICAgICAgICAgICAgLy8g5pyJ6buY6K6k5YC85Lmf6ZyA6KaB5YaN6LWw5LiA6YGN5qCh6aqMXHJcbiAgICAgICAgICAgICAgICBpZiAodXNlRGVmYXVsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZURlZmF1bHQgPSAhKGF3YWl0IHZhbGlkYXRvck1hbmFnZXIuY2hlY2soXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlnLm9wdGlvbnNba2V5XS5kZWZhdWx0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZy5vcHRpb25zW2tleV0udmVyaWZ5UnVsZXMhLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbHVnaW5NYW5hZ2VyLmNvbW1vbk9wdGlvbkNvbmZpZ1tvcHRpb25zLnBsYXRmb3JtIGFzIFBsYXRmb3JtXVtrZXldPy52ZXJpZnlLZXkgfHwgKG9wdGlvbnMucGxhdGZvcm0gKyBwa2dOYW1lKSxcclxuICAgICAgICAgICAgICAgICAgICApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IHZlcmlmeUxldmVsOiBJQ29uc29sZVR5cGUgPSBidWlsZENvbmZpZy5vcHRpb25zW2tleV0udmVyaWZ5TGV2ZWwgfHwgJ2Vycm9yJztcclxuICAgICAgICAgICAgICAgIGNvbnN0IGVyck1zZyA9ICh0eXBlb2YgZXJyb3IgPT09ICdzdHJpbmcnICYmIGkxOG4udHJhbnNJMThuTmFtZShlcnJvcikpIHx8IGVycm9yO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghdXNlRGVmYXVsdCAmJiB2ZXJpZnlMZXZlbCA9PT0gJ2Vycm9yJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoaTE4bi50KCdidWlsZGVyLmVycm9yLmNoZWNrX2ZhaWxlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBgb3B0aW9ucy5wYWNrYWdlcy4ke3BrZ05hbWV9LiR7a2V5fWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJNc2csXHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrUmVzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnNvbGVUeXBlID0gKHZlcmlmeUxldmVsICE9PSAnZXJyb3InICYmIG5ld0NvbnNvbGVbdmVyaWZ5TGV2ZWxdKSA/IHZlcmlmeUxldmVsIDogJ3dhcm4nO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOacieaKpemUmeS/oeaBr++8jOS9huaciem7mOiupOWAvO+8jOaKpemUmeWQjuWhq+WFhem7mOiupOWAvFxyXG4gICAgICAgICAgICAgICAgICAgIG5ld0NvbnNvbGVbY29uc29sZVR5cGVdKGkxOG4udCgnYnVpbGRlci53YXJuLmNoZWNrX2ZhaWxlZF93aXRoX25ld192YWx1ZScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBgb3B0aW9ucy5wYWNrYWdlcy4ke3BrZ05hbWV9LiR7a2V5fWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJNc2csXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBKU09OLnN0cmluZ2lmeShidWlsZENvbmZpZy5vcHRpb25zW2tleV0uZGVmYXVsdCksXHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZGFzaC5zZXQocGFja2FnZU9wdGlvbnMsIGtleSwgYnVpbGRDb25maWcub3B0aW9uc1trZXldLmRlZmF1bHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY2hlY2tSZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNob3VsZEdlbmVyYXRlT3B0aW9ucyhwbGF0Zm9ybTogUGxhdGZvcm0gfCBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCBjdXN0b21CdWlsZFN0YWdlTWFwID0gdGhpcy5jdXN0b21CdWlsZFN0YWdlc1twbGF0Zm9ybV07XHJcbiAgICAgICAgcmV0dXJuICEhT2JqZWN0LnZhbHVlcyhjdXN0b21CdWlsZFN0YWdlTWFwKS5maW5kKChzdGFnZXMpID0+IHN0YWdlcy5maW5kKChzdGFnZUl0ZW0gPT4gc3RhZ2VJdGVtLnJlcXVpcmVkQnVpbGRPcHRpb25zICE9PSBmYWxzZSkpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluW5s+WPsOm7mOiupOWAvFxyXG4gICAgICogQHBhcmFtIHBsYXRmb3JtXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBnZXRPcHRpb25zQnlQbGF0Zm9ybTxQIGV4dGVuZHMgUGxhdGZvcm0gfCBzdHJpbmc+KHBsYXRmb3JtOiBQKTogUHJvbWlzZTxJQnVpbGRUYXNrT3B0aW9uPiB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGF3YWl0IGJ1aWxkZXJDb25maWcuZ2V0UHJvamVjdDxJQnVpbGRUYXNrT3B0aW9uPihgcGxhdGZvcm1zLiR7cGxhdGZvcm19YCk7XHJcbiAgICAgICAgY29uc3QgY29tbW9uT3B0aW9ucyA9IGF3YWl0IGJ1aWxkZXJDb25maWcuZ2V0UHJvamVjdDxJQnVpbGRDb21tYW5kT3B0aW9uPihgY29tbW9uYCk7XHJcbiAgICAgICAgY29tbW9uT3B0aW9ucy5wbGF0Zm9ybSA9IHBsYXRmb3JtO1xyXG4gICAgICAgIGNvbW1vbk9wdGlvbnMub3V0cHV0TmFtZSA9IHBsYXRmb3JtO1xyXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKGNvbW1vbk9wdGlvbnMsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRUZXh0dXJlUGxhdGZvcm1Db25maWdzKCk6IFJlY29yZDxzdHJpbmcsIElUZXh0dXJlQ29tcHJlc3NDb25maWc+IHtcclxuICAgICAgICBjb25zdCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIElUZXh0dXJlQ29tcHJlc3NDb25maWc+ID0ge307XHJcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5wbGF0Zm9ybUNvbmZpZykuZm9yRWFjaCgocGxhdGZvcm0pID0+IHtcclxuICAgICAgICAgICAgcmVzdWx0W3BsYXRmb3JtXSA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMucGxhdGZvcm1Db25maWdbcGxhdGZvcm1dLm5hbWUsXHJcbiAgICAgICAgICAgICAgICB0ZXh0dXJlQ29tcHJlc3NDb25maWc6IHRoaXMucGxhdGZvcm1Db25maWdbcGxhdGZvcm1dLnRleHR1cmUsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcXVlcnlQbGF0Zm9ybUNvbmZpZygpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBuYXRpdmU6IE9iamVjdC5rZXlzKHRoaXMucGxhdGZvcm1Db25maWcpLmZpbHRlcigocGxhdGZvcm0pID0+IE5BVElWRV9QTEFURk9STS5pbmNsdWRlcyhwbGF0Zm9ybSBhcyBQbGF0Zm9ybSkpLFxyXG4gICAgICAgICAgICBjb25maWc6IHRoaXMucGxhdGZvcm1Db25maWcsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluW4puaciemSqeWtkOWHveaVsOeahOaehOW7uumYtuauteS7u+WKoVxyXG4gICAgICogQHBhcmFtIHBsYXRmb3JtIFxyXG4gICAgICogQHJldHVybnMgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRCdWlsZFN0YWdlV2l0aEhvb2tUYXNrcyhwbGF0Zm9ybTogUGxhdGZvcm0gfCBzdHJpbmcsIHRhc2tOYW1lOiBzdHJpbmcpOiBJQnVpbGRTdGFnZUl0ZW0gfCBudWxsIHtcclxuICAgICAgICBjb25zdCBjdXN0b21TdGFnZXMgPSB0aGlzLmN1c3RvbUJ1aWxkU3RhZ2VzW3BsYXRmb3JtXTtcclxuICAgICAgICBpZiAoIWN1c3RvbVN0YWdlcykge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcGtnTmFtZU9yZGVyID0gdGhpcy5zb3J0UGtnTmFtZVdpZHRoUHJpb3JpdHkoT2JqZWN0LmtleXMoY3VzdG9tU3RhZ2VzKSk7XHJcbiAgICAgICAgZm9yIChjb25zdCBwa2dOYW1lIG9mIHBrZ05hbWVPcmRlcikge1xyXG4gICAgICAgICAgICBjb25zdCBzdGFnZSA9IGN1c3RvbVN0YWdlc1twa2dOYW1lXS5maW5kKChpdGVtOiBJQnVpbGRTdGFnZUl0ZW0pID0+IGl0ZW0uaG9vayA9PT0gdGFza05hbWUpO1xyXG4gICAgICAgICAgICBpZiAoc3RhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdGFnZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOagueaNruaPkuS7tuadg+mHjeS8oOWPgueahOaPkuS7tuaVsOe7hFxyXG4gICAgICogQHBhcmFtIHBrZ05hbWVzIFxyXG4gICAgICogQHJldHVybnMgXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc29ydFBrZ05hbWVXaWR0aFByaW9yaXR5KHBrZ05hbWVzOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIHJldHVybiBwa2dOYW1lcy5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOW5s+WPsOaehOW7uuaPkuS7tueahOmhuuW6j+Wni+e7iOWcqOWklumDqOazqOWGjOeahOS7u+aEj+aPkuS7tuS5i+S4ilxyXG4gICAgICAgICAgICBpZiAoIVBMQVRGT1JNUy5pbmNsdWRlcyhhKSAmJiBQTEFURk9STVMuaW5jbHVkZXMoYikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKFBMQVRGT1JNUy5pbmNsdWRlcyhhKSAmJiAhUExBVEZPUk1TLmluY2x1ZGVzKGIpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGtnUHJpb3JpdGllc1tiXSAtIHRoaXMucGtnUHJpb3JpdGllc1thXTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluW5s+WPsOaPkuS7tueahOaehOW7uui3r+W+hOS/oeaBr1xyXG4gICAgICogQHBhcmFtIHBsYXRmb3JtXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRIb29rc0luZm8ocGxhdGZvcm06IFBsYXRmb3JtIHwgc3RyaW5nKTogSUJ1aWxkSG9va3NJbmZvIHtcclxuICAgICAgICAvLyDkuLrkuobkv53pmpzmj5Lku7bnmoTlhYjlkI7ms6jlhozpobrluo/vvIzph4fnlKjkuobmlbDnu4TnmoTmlrnlvI/kvKDpgJJcclxuICAgICAgICBjb25zdCByZXN1bHQ6IElCdWlsZEhvb2tzSW5mbyA9IHtcclxuICAgICAgICAgICAgcGtnTmFtZU9yZGVyOiBbXSxcclxuICAgICAgICAgICAgaW5mb3M6IHt9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5idWlsZGVyUGF0aHNNYXBbcGxhdGZvcm1dKS5mb3JFYWNoKChwa2dOYW1lKSA9PiB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5pbmZvc1twa2dOYW1lXSA9IHtcclxuICAgICAgICAgICAgICAgIHBhdGg6IHRoaXMuYnVpbGRlclBhdGhzTWFwW3BsYXRmb3JtXVtwa2dOYW1lXSxcclxuICAgICAgICAgICAgICAgIGludGVybmFsOiBwa2dOYW1lID09PSBwbGF0Zm9ybSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXN1bHQucGtnTmFtZU9yZGVyID0gdGhpcy5zb3J0UGtnTmFtZVdpZHRoUHJpb3JpdHkoT2JqZWN0LmtleXMocmVzdWx0LmluZm9zKSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0QnVpbGRUZW1wbGF0ZUNvbmZpZyhwbGF0Zm9ybTogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVpbGRUZW1wbGF0ZUNvbmZpZ01hcFt0aGlzLnBsYXRmb3JtQ29uZmlnW3BsYXRmb3JtXS5jcmVhdGVUZW1wbGF0ZUxhYmVsXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOagueaNruexu+Wei+iOt+WPluWvueW6lOeahOaJp+ihjOaWueazlVxyXG4gICAgICogQHBhcmFtIHR5cGUgXHJcbiAgICAgKiBAcmV0dXJucyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEFzc2V0SGFuZGxlcnModHlwZTogSUN1c3RvbUFzc2V0SGFuZGxlclR5cGUpIHtcclxuICAgICAgICBjb25zdCBwa2dOYW1lcyA9IE9iamVjdC5rZXlzKHRoaXMuYXNzZXRIYW5kbGVyc1t0eXBlXSk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcGtnTmFtZU9yZGVyOiB0aGlzLnNvcnRQa2dOYW1lV2lkdGhQcmlvcml0eShwa2dOYW1lcyksXHJcbiAgICAgICAgICAgIGhhbmRsZXM6IHRoaXMuYXNzZXRIYW5kbGVyc1t0eXBlXSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgcGx1Z2luTWFuYWdlciA9IG5ldyBQbHVnaW5NYW5hZ2VyKCk7XHJcbiJdfQ==