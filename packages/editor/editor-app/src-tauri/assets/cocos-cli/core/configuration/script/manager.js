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
exports.configurationManager = exports.ConfigurationManager = void 0;
const semver_1 = require("semver");
const path_1 = __importStar(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const console_1 = require("../../base/console");
const utils = __importStar(require("./utils"));
const interface_1 = require("./interface");
const migration_1 = require("../migration");
const registry_1 = require("./registry");
const events_1 = __importDefault(require("events"));
class ConfigurationManager extends events_1.default {
    static VERSION = '1.0.0';
    static name = 'cocos.config.json';
    static SchemaPathSource = (0, path_1.join)(__dirname, '../../../../dist/cocos.config.schema.json');
    static relativeSchemaPath = `./temp/${path_1.default.basename(ConfigurationManager.SchemaPathSource)}`;
    initialized = false;
    projectPath = '';
    configPath = '';
    projectConfig = {};
    _version = '0.0.0';
    get version() {
        return this._version;
    }
    set version(value) {
        this._version = value;
    }
    configurationMap = new Map();
    onRegistryConfigurationBind = this.onRegistryConfiguration.bind(this);
    onUnRegistryConfigurationBind = this.onUnRegistryConfiguration.bind(this);
    /**
     * 初始化配置管理器
     */
    async initialize(projectPath) {
        if (this.initialized) {
            return;
        }
        registry_1.configurationRegistry.on(interface_1.MessageType.Registry, this.onRegistryConfigurationBind);
        registry_1.configurationRegistry.on(interface_1.MessageType.UnRegistry, this.onUnRegistryConfigurationBind);
        this.projectPath = projectPath;
        this.configPath = path_1.default.join(projectPath, ConfigurationManager.name);
        const schemaPath = path_1.default.join(projectPath, ConfigurationManager.relativeSchemaPath);
        await this.load();
        try {
            await fs_extra_1.default.copy(ConfigurationManager.SchemaPathSource, schemaPath);
            // 迁移不能影响正常的配置初始化流程
            await this.migrate();
        }
        catch (error) {
            console.error(error);
        }
        this.initialized = true;
    }
    /**
     * 从硬盘重新加载项目配置，将会丢弃内存中现有的配置
     */
    async reload() {
        await this.load();
        this.emit(interface_1.MessageType.Reload, this.projectConfig);
    }
    onRegistryConfiguration(instance) {
        if (!this.configurationMap.has(instance.moduleName)) {
            // 从 projectConfig 中获取现有配置并初始化到配置实例中
            const existingConfig = this.projectConfig[instance.moduleName];
            if (existingConfig && typeof existingConfig === 'object') {
                // 将现有配置设置到配置实例的 configs 中
                this.initializeConfigFromProject(instance, existingConfig);
            }
            const bind = async (configInstance) => {
                this.projectConfig[configInstance.moduleName] = configInstance.getAll();
                await this.save();
            };
            instance.on(interface_1.MessageType.Save, bind);
            this.configurationMap.set(instance.moduleName, bind);
        }
    }
    onUnRegistryConfiguration(instances) {
        const bind = this.configurationMap.get(instances.moduleName);
        if (bind) {
            // TODO 是否需要删除
            instances.off(interface_1.MessageType.Save, bind);
            this.configurationMap.delete(instances.moduleName);
        }
    }
    /**
     * 从项目配置中初始化配置实例
     * @param instance 配置实例
     * @param existingConfig 现有的项目配置
     * @private
     */
    initializeConfigFromProject(instance, existingConfig) {
        // 必须是 BaseConfiguration 类型，否则抛出错误
        if (!('configs' in instance) || typeof instance.configs !== 'object') {
            const instanceType = instance.constructor?.name || 'Unknown';
            throw new Error(`配置实例必须是 BaseConfiguration 类型，但收到的是 ${instanceType}`);
        }
        // 直接设置 configs 属性
        instance.configs = utils.deepMerge({}, existingConfig);
    }
    /**
     * 迁移，包含了 3x 迁移，允许外部单独触发
     */
    async migrate() {
        const upgrade = (0, semver_1.gt)(ConfigurationManager.VERSION, this.version);
        if (upgrade) {
            // TODO 新版本迁移
            // 3.x 迁移
            await this.migrateFromProject(this.projectPath);
        }
        else {
            console.debug('[Configuration] 项目配置已是最新版本，无需迁移');
        }
    }
    /**
     * 从指定项目路径迁移配置到当前项目
     * @param projectPath 项目路径
     * @returns 迁移后的项目配置
     */
    async migrateFromProject(projectPath) {
        const list = await migration_1.CocosMigrationManager.migrate(projectPath);
        this.projectConfig = utils.deepMerge(this.projectConfig, list.project);
        await this.save();
        return this.projectConfig;
    }
    /**
     * 解析配置键，提取模块名和实际键名
     * @param key 配置键名，如 'test.x.x'
     * @private
     */
    parseKey(key) {
        if (!utils.isValidConfigKey(key)) {
            throw new Error('配置键名不能为空');
        }
        const parts = key.split('.');
        if (parts.length < 2) {
            throw new Error('配置键名格式错误，必须包含模块名，如 "module.key"');
        }
        const moduleName = parts[0];
        const actualKey = parts.slice(1).join('.');
        if (!actualKey || actualKey.trim() === '') {
            throw new Error('配置键名不能为空');
        }
        return { moduleName, actualKey };
    }
    /**
     * 获取模块配置实例
     * @param moduleName 模块名
     * @private
     */
    getInstance(moduleName) {
        const instance = registry_1.configurationRegistry.getInstance(moduleName);
        if (!instance) {
            throw new Error(`[Configuration] 设置配置错误，${moduleName} 未注册`);
        }
        return instance;
    }
    /**
     * 获取配置值
     * 读取规则：优先读项目配置，如果没有再读默认配置，默认配置也没定义的话，就打印警告日志
     * @param key 配置键名，支持点号分隔的嵌套路径，如 'test.x.x'，第一位作为模块名
     * @param scope 配置作用域，不指定时按优先级查找
     */
    async get(key, scope) {
        try {
            await this.ensureInitialized();
            const { moduleName, actualKey } = this.parseKey(key);
            return await this.getInstance(moduleName).get(actualKey, scope);
        }
        catch (error) {
            throw new Error(`[Configuration] 获取配置失败：${error}`);
        }
    }
    /**
     * 更新配置值
     * @param key 配置键名，支持点号分隔的嵌套路径，如 'test.x.x'，第一位作为模块名
     * @param value 新的配置值
     * @param scope 配置作用域，默认为 'project'
     */
    async set(key, value, scope = 'project') {
        try {
            await this.ensureInitialized();
            const { moduleName, actualKey } = this.parseKey(key);
            await this.getInstance(moduleName).set(actualKey, value, scope);
            this.emit(interface_1.MessageType.Update, key, value, scope);
            return true;
        }
        catch (error) {
            throw new Error(`[Configuration] 更新配置失败：${error}`);
        }
    }
    /**
     * 移除配置值
     * @param key 配置键名，支持点号分隔的嵌套路径，如 'test.x.x'，第一位作为模块名
     * @param scope 配置作用域，默认为 'project'
     */
    async remove(key, scope = 'project') {
        try {
            await this.ensureInitialized();
            const { moduleName, actualKey } = this.parseKey(key);
            this.emit(interface_1.MessageType.Remove, key, scope);
            return await this.getInstance(moduleName).remove(actualKey, scope);
        }
        catch (error) {
            throw new Error(`[Configuration] 移除配置失败：${error}`);
        }
    }
    /**
     * 确保配置管理器已初始化
     */
    async ensureInitialized() {
        if (!this.initialized) {
            throw new Error('[Configuration] 未初始化');
        }
    }
    /**
     * 加载项目配置
     */
    async load() {
        try {
            if (await fs_extra_1.default.pathExists(this.configPath)) {
                this.projectConfig = await fs_extra_1.default.readJSON(this.configPath);
                this.projectConfig.version && (this.version = this.projectConfig.version);
                console_1.newConsole.debug(`[Configuration] 已加载项目配置: ${this.configPath}`, this.projectConfig);
            }
            else {
                console_1.newConsole.debug(`[Configuration] 项目配置文件不存在，将创建新文件: ${this.configPath}`);
                // 创建默认配置文件
                await this.save();
            }
        }
        catch (error) {
            console_1.newConsole.error(`[Configuration] 加载项目配置失败: ${this.configPath} - ${error}`);
        }
    }
    /**
     * 保存项目配置
     */
    async save(force = false) {
        if (!force && !Object.keys(this.projectConfig).length) {
            return;
        }
        try {
            this.version = ConfigurationManager.VERSION;
            // 确保目录存在
            await fs_extra_1.default.ensureDir(path_1.default.dirname(this.configPath));
            this.projectConfig.version = this.version;
            this.projectConfig.$schema = ConfigurationManager.relativeSchemaPath;
            // 保存配置文件
            await fs_extra_1.default.writeJSON(this.configPath, this.projectConfig, { spaces: 4 });
            this.emit(interface_1.MessageType.Save, this.projectConfig);
            console_1.newConsole.debug(`[Configuration] 已保存项目配置: ${this.configPath}`);
        }
        catch (error) {
            console_1.newConsole.error(`[Configuration] 保存项目配置失败: ${this.configPath} - ${error}`);
            throw error;
        }
    }
    reset() {
        this.initialized = false;
        this.projectPath = '';
        this.configPath = '';
        this.projectConfig = {};
        this.version = '0.0.0';
        this.configurationMap.clear();
    }
}
exports.ConfigurationManager = ConfigurationManager;
exports.configurationManager = new ConfigurationManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlL2NvbmZpZ3VyYXRpb24vc2NyaXB0L21hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQTRCO0FBQzVCLDZDQUE0QztBQUM1Qyx3REFBMkI7QUFDM0IsZ0RBQWdEO0FBQ2hELCtDQUFpQztBQUNqQywyQ0FBOEU7QUFDOUUsNENBQXFEO0FBQ3JELHlDQUFtRDtBQUVuRCxvREFBa0M7QUErQmxDLE1BQWEsb0JBQXFCLFNBQVEsZ0JBQVk7SUFFbEQsTUFBTSxDQUFDLE9BQU8sR0FBVyxPQUFPLENBQUM7SUFDakMsTUFBTSxDQUFDLElBQUksR0FBRyxtQkFBbUIsQ0FBQztJQUNsQyxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLDJDQUEyQyxDQUFDLENBQUM7SUFDdkYsTUFBTSxDQUFDLGtCQUFrQixHQUFHLFVBQVUsY0FBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7SUFFckYsV0FBVyxHQUFZLEtBQUssQ0FBQztJQUM3QixXQUFXLEdBQVcsRUFBRSxDQUFDO0lBQ3pCLFVBQVUsR0FBVyxFQUFFLENBQUM7SUFDeEIsYUFBYSxHQUFtQixFQUFFLENBQUM7SUFFbkMsUUFBUSxHQUFXLE9BQU8sQ0FBQztJQUNuQyxJQUFJLE9BQU87UUFDUCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUNELElBQUksT0FBTyxDQUFDLEtBQWE7UUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDMUIsQ0FBQztJQUVPLGdCQUFnQixHQUEwQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3BFLDJCQUEyQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENB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LE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2hELG9CQUFVLENBQUMsS0FBSyxDQUFDLDRCQUE0QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNiLG9CQUFVLENBQUMsS0FBSyxDQUFDLDZCQUE2QixJQUFJLENBQUMsVUFBVSxNQUFNLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDNUUsTUFBTSxLQUFLLENBQUM7UUFDaEIsQ0FBQztJQUNMLENBQUM7SUFFRCxLQUFLO1FBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2xDLENBQUM7O0FBaFJMLG9EQWlSQztBQUVZLFFBQUEsb0JBQW9CLEdBQUcsSUFBSSxvQkFBb0IsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ3QgfSBmcm9tICdzZW12ZXInO1xyXG5pbXBvcnQgcGF0aCwgeyBqb2luLCByZWxhdGl2ZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgZnNlIGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHsgbmV3Q29uc29sZSB9IGZyb20gJy4uLy4uL2Jhc2UvY29uc29sZSc7XHJcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBJQ29uZmlndXJhdGlvbiwgQ29uZmlndXJhdGlvblNjb3BlLCBNZXNzYWdlVHlwZSB9IGZyb20gJy4vaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgQ29jb3NNaWdyYXRpb25NYW5hZ2VyIH0gZnJvbSAnLi4vbWlncmF0aW9uJztcclxuaW1wb3J0IHsgY29uZmlndXJhdGlvblJlZ2lzdHJ5IH0gZnJvbSAnLi9yZWdpc3RyeSc7XHJcbmltcG9ydCB7IElCYXNlQ29uZmlndXJhdGlvbiB9IGZyb20gJy4vY29uZmlnJztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJQ29uZmlndXJhdGlvbk1hbmFnZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKiDliJ3lp4vljJbphY3nva7nrqHnkIblmahcclxuICAgICAqL1xyXG4gICAgaW5pdGlhbGl6ZShwcm9qZWN0UGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlumFjee9rlxyXG4gICAgICogQHBhcmFtIGtleSDphY3nva7plK7lkI3vvIzmlK/mjIHngrnlj7fliIbpmpTnmoTltYzlpZfot6/lvoTvvIzlpoIgJ3Rlc3QueC54J++8jOesrOS4gOS9jeS9nOS4uuaooeWdl+WQjVxyXG4gICAgICogQHBhcmFtIHNjb3BlIOmFjee9ruS9nOeUqOWfn++8jOS4jeaMh+WumuaXtuaMieS8mOWFiOe6p+afpeaJvlxyXG4gICAgICovXHJcbiAgICBnZXQ8VD4oa2V5OiBzdHJpbmcsIHNjb3BlPzogQ29uZmlndXJhdGlvblNjb3BlKTogUHJvbWlzZTxUPjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOiuvue9rumFjee9rlxyXG4gICAgICogQHBhcmFtIGtleSDphY3nva7plK7lkI3vvIzmlK/mjIHngrnlj7fliIbpmpTnmoTltYzlpZfot6/lvoTvvIzlpoIgJ3Rlc3QueC54J++8jOesrOS4gOS9jeS9nOS4uuaooeWdl+WQjVxyXG4gICAgICogQHBhcmFtIHZhbHVlIOaWsOeahOmFjee9ruWAvFxyXG4gICAgICogQHBhcmFtIHNjb3BlIOmFjee9ruS9nOeUqOWfn++8jOm7mOiupOS4uiAncHJvamVjdCdcclxuICAgICAqL1xyXG4gICAgc2V0PFQ+KGtleTogc3RyaW5nLCB2YWx1ZTogVCwgc2NvcGU/OiBDb25maWd1cmF0aW9uU2NvcGUpOiBQcm9taXNlPGJvb2xlYW4+O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog56e76Zmk6YWN572uXHJcbiAgICAgKiBAcGFyYW0ga2V5IOmFjee9rumUruWQje+8jOaUr+aMgeeCueWPt+WIhumalOeahOW1jOWll+i3r+W+hO+8jOWmgiAndGVzdC54Lngn77yM56ys5LiA5L2N5L2c5Li65qih5Z2X5ZCNXHJcbiAgICAgKiBAcGFyYW0gc2NvcGUg6YWN572u5L2c55So5Z+f77yM6buY6K6k5Li6ICdwcm9qZWN0J1xyXG4gICAgICovXHJcbiAgICByZW1vdmUoa2V5OiBzdHJpbmcsIHNjb3BlPzogQ29uZmlndXJhdGlvblNjb3BlKTogUHJvbWlzZTxib29sZWFuPjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIENvbmZpZ3VyYXRpb25NYW5hZ2VyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIGltcGxlbWVudHMgSUNvbmZpZ3VyYXRpb25NYW5hZ2VyIHtcclxuXHJcbiAgICBzdGF0aWMgVkVSU0lPTjogc3RyaW5nID0gJzEuMC4wJztcclxuICAgIHN0YXRpYyBuYW1lID0gJ2NvY29zLmNvbmZpZy5qc29uJztcclxuICAgIHN0YXRpYyBTY2hlbWFQYXRoU291cmNlID0gam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi8uLi9kaXN0L2NvY29zLmNvbmZpZy5zY2hlbWEuanNvbicpO1xyXG4gICAgc3RhdGljIHJlbGF0aXZlU2NoZW1hUGF0aCA9IGAuL3RlbXAvJHtwYXRoLmJhc2VuYW1lKENvbmZpZ3VyYXRpb25NYW5hZ2VyLlNjaGVtYVBhdGhTb3VyY2UpfWA7XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBwcm9qZWN0UGF0aDogc3RyaW5nID0gJyc7XHJcbiAgICBwcml2YXRlIGNvbmZpZ1BhdGg6IHN0cmluZyA9ICcnO1xyXG4gICAgcHJpdmF0ZSBwcm9qZWN0Q29uZmlnOiBJQ29uZmlndXJhdGlvbiA9IHt9O1xyXG5cclxuICAgIHByaXZhdGUgX3ZlcnNpb246IHN0cmluZyA9ICcwLjAuMCc7XHJcbiAgICBnZXQgdmVyc2lvbigpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl92ZXJzaW9uO1xyXG4gICAgfVxyXG4gICAgc2V0IHZlcnNpb24odmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX3ZlcnNpb24gPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25NYXA6IE1hcDxzdHJpbmcsICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZD4gPSBuZXcgTWFwKCk7XHJcbiAgICBwcml2YXRlIG9uUmVnaXN0cnlDb25maWd1cmF0aW9uQmluZCA9IHRoaXMub25SZWdpc3RyeUNvbmZpZ3VyYXRpb24uYmluZCh0aGlzKTtcclxuICAgIHByaXZhdGUgb25VblJlZ2lzdHJ5Q29uZmlndXJhdGlvbkJpbmQgPSB0aGlzLm9uVW5SZWdpc3RyeUNvbmZpZ3VyYXRpb24uYmluZCh0aGlzKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIneWni+WMlumFjee9rueuoeeQhuWZqFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgaW5pdGlhbGl6ZShwcm9qZWN0UGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uZmlndXJhdGlvblJlZ2lzdHJ5Lm9uKE1lc3NhZ2VUeXBlLlJlZ2lzdHJ5LCB0aGlzLm9uUmVnaXN0cnlDb25maWd1cmF0aW9uQmluZCk7XHJcbiAgICAgICAgY29uZmlndXJhdGlvblJlZ2lzdHJ5Lm9uKE1lc3NhZ2VUeXBlLlVuUmVnaXN0cnksIHRoaXMub25VblJlZ2lzdHJ5Q29uZmlndXJhdGlvbkJpbmQpO1xyXG5cclxuICAgICAgICB0aGlzLnByb2plY3RQYXRoID0gcHJvamVjdFBhdGg7XHJcbiAgICAgICAgdGhpcy5jb25maWdQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCBDb25maWd1cmF0aW9uTWFuYWdlci5uYW1lKTtcclxuICAgICAgICBjb25zdCBzY2hlbWFQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCBDb25maWd1cmF0aW9uTWFuYWdlci5yZWxhdGl2ZVNjaGVtYVBhdGgpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMubG9hZCgpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGF3YWl0IGZzZS5jb3B5KENvbmZpZ3VyYXRpb25NYW5hZ2VyLlNjaGVtYVBhdGhTb3VyY2UsIHNjaGVtYVBhdGgpO1xyXG4gICAgICAgICAgICAvLyDov4Hnp7vkuI3og73lvbHlk43mraPluLjnmoTphY3nva7liJ3lp4vljJbmtYHnqItcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5taWdyYXRlKCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LuO56Gs55uY6YeN5paw5Yqg6L296aG555uu6YWN572u77yM5bCG5Lya5Lii5byD5YaF5a2Y5Lit546w5pyJ55qE6YWN572uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyByZWxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5sb2FkKCk7XHJcbiAgICAgICAgdGhpcy5lbWl0KE1lc3NhZ2VUeXBlLlJlbG9hZCwgdGhpcy5wcm9qZWN0Q29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uUmVnaXN0cnlDb25maWd1cmF0aW9uKGluc3RhbmNlOiBJQmFzZUNvbmZpZ3VyYXRpb24pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvbk1hcC5oYXMoaW5zdGFuY2UubW9kdWxlTmFtZSkpIHtcclxuICAgICAgICAgICAgLy8g5LuOIHByb2plY3RDb25maWcg5Lit6I635Y+W546w5pyJ6YWN572u5bm25Yid5aeL5YyW5Yiw6YWN572u5a6e5L6L5LitXHJcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nQ29uZmlnID0gdGhpcy5wcm9qZWN0Q29uZmlnW2luc3RhbmNlLm1vZHVsZU5hbWVdO1xyXG4gICAgICAgICAgICBpZiAoZXhpc3RpbmdDb25maWcgJiYgdHlwZW9mIGV4aXN0aW5nQ29uZmlnID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgLy8g5bCG546w5pyJ6YWN572u6K6+572u5Yiw6YWN572u5a6e5L6L55qEIGNvbmZpZ3Mg5LitXHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemVDb25maWdGcm9tUHJvamVjdChpbnN0YW5jZSwgZXhpc3RpbmdDb25maWcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBiaW5kID0gYXN5bmMgKGNvbmZpZ0luc3RhbmNlOiBJQmFzZUNvbmZpZ3VyYXRpb24pID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdENvbmZpZ1tjb25maWdJbnN0YW5jZS5tb2R1bGVOYW1lXSA9IGNvbmZpZ0luc3RhbmNlLmdldEFsbCgpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGluc3RhbmNlLm9uKE1lc3NhZ2VUeXBlLlNhdmUsIGJpbmQpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25NYXAuc2V0KGluc3RhbmNlLm1vZHVsZU5hbWUsIGJpbmQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uVW5SZWdpc3RyeUNvbmZpZ3VyYXRpb24oaW5zdGFuY2VzOiBJQmFzZUNvbmZpZ3VyYXRpb24pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBiaW5kID0gdGhpcy5jb25maWd1cmF0aW9uTWFwLmdldChpbnN0YW5jZXMubW9kdWxlTmFtZSk7XHJcbiAgICAgICAgaWYgKGJpbmQpIHtcclxuICAgICAgICAgICAgLy8gVE9ETyDmmK/lkKbpnIDopoHliKDpmaRcclxuICAgICAgICAgICAgaW5zdGFuY2VzLm9mZihNZXNzYWdlVHlwZS5TYXZlLCBiaW5kKTtcclxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uTWFwLmRlbGV0ZShpbnN0YW5jZXMubW9kdWxlTmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LuO6aG555uu6YWN572u5Lit5Yid5aeL5YyW6YWN572u5a6e5L6LXHJcbiAgICAgKiBAcGFyYW0gaW5zdGFuY2Ug6YWN572u5a6e5L6LXHJcbiAgICAgKiBAcGFyYW0gZXhpc3RpbmdDb25maWcg546w5pyJ55qE6aG555uu6YWN572uXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemVDb25maWdGcm9tUHJvamVjdChpbnN0YW5jZTogSUJhc2VDb25maWd1cmF0aW9uLCBleGlzdGluZ0NvbmZpZzogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQge1xyXG4gICAgICAgIC8vIOW/hemhu+aYryBCYXNlQ29uZmlndXJhdGlvbiDnsbvlnovvvIzlkKbliJnmipvlh7rplJnor69cclxuICAgICAgICBpZiAoISgnY29uZmlncycgaW4gaW5zdGFuY2UpIHx8IHR5cGVvZiBpbnN0YW5jZS5jb25maWdzICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZVR5cGUgPSBpbnN0YW5jZS5jb25zdHJ1Y3Rvcj8ubmFtZSB8fCAnVW5rbm93bic7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihg6YWN572u5a6e5L6L5b+F6aG75pivIEJhc2VDb25maWd1cmF0aW9uIOexu+Wei++8jOS9huaUtuWIsOeahOaYryAke2luc3RhbmNlVHlwZX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g55u05o6l6K6+572uIGNvbmZpZ3Mg5bGe5oCnXHJcbiAgICAgICAgaW5zdGFuY2UuY29uZmlncyA9IHV0aWxzLmRlZXBNZXJnZSh7fSwgZXhpc3RpbmdDb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6L+B56e777yM5YyF5ZCr5LqGIDN4IOi/geenu++8jOWFgeiuuOWklumDqOWNleeLrOinpuWPkVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgbWlncmF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCB1cGdyYWRlID0gZ3QoQ29uZmlndXJhdGlvbk1hbmFnZXIuVkVSU0lPTiwgdGhpcy52ZXJzaW9uKTtcclxuICAgICAgICBpZiAodXBncmFkZSkge1xyXG4gICAgICAgICAgICAvLyBUT0RPIOaWsOeJiOacrOi/geenu1xyXG4gICAgICAgICAgICAvLyAzLngg6L+B56e7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMubWlncmF0ZUZyb21Qcm9qZWN0KHRoaXMucHJvamVjdFBhdGgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ1tDb25maWd1cmF0aW9uXSDpobnnm67phY3nva7lt7LmmK/mnIDmlrDniYjmnKzvvIzml6DpnIDov4Hnp7snKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDku47mjIflrprpobnnm67ot6/lvoTov4Hnp7vphY3nva7liLDlvZPliY3pobnnm65cclxuICAgICAqIEBwYXJhbSBwcm9qZWN0UGF0aCDpobnnm67ot6/lvoRcclxuICAgICAqIEByZXR1cm5zIOi/geenu+WQjueahOmhueebrumFjee9rlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgbWlncmF0ZUZyb21Qcm9qZWN0KHByb2plY3RQYXRoOiBzdHJpbmcpOiBQcm9taXNlPElDb25maWd1cmF0aW9uPiB7XHJcbiAgICAgICAgY29uc3QgbGlzdCA9IGF3YWl0IENvY29zTWlncmF0aW9uTWFuYWdlci5taWdyYXRlKHByb2plY3RQYXRoKTtcclxuICAgICAgICB0aGlzLnByb2plY3RDb25maWcgPSB1dGlscy5kZWVwTWVyZ2UodGhpcy5wcm9qZWN0Q29uZmlnLCBsaXN0LnByb2plY3QpIGFzIElDb25maWd1cmF0aW9uO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnByb2plY3RDb25maWc7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDop6PmnpDphY3nva7plK7vvIzmj5Dlj5bmqKHlnZflkI3lkozlrp7pmYXplK7lkI1cclxuICAgICAqIEBwYXJhbSBrZXkg6YWN572u6ZSu5ZCN77yM5aaCICd0ZXN0LngueCdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcGFyc2VLZXkoa2V5OiBzdHJpbmcpOiB7IG1vZHVsZU5hbWU6IHN0cmluZzsgYWN0dWFsS2V5OiBzdHJpbmcgfSB7XHJcbiAgICAgICAgaWYgKCF1dGlscy5pc1ZhbGlkQ29uZmlnS2V5KGtleSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfphY3nva7plK7lkI3kuI3og73kuLrnqbonKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcnRzID0ga2V5LnNwbGl0KCcuJyk7XHJcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfphY3nva7plK7lkI3moLzlvI/plJnor6/vvIzlv4XpobvljIXlkKvmqKHlnZflkI3vvIzlpoIgXCJtb2R1bGUua2V5XCInKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG1vZHVsZU5hbWUgPSBwYXJ0c1swXTtcclxuICAgICAgICBjb25zdCBhY3R1YWxLZXkgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCcuJyk7XHJcblxyXG4gICAgICAgIGlmICghYWN0dWFsS2V5IHx8IGFjdHVhbEtleS50cmltKCkgPT09ICcnKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcign6YWN572u6ZSu5ZCN5LiN6IO95Li656m6Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geyBtb2R1bGVOYW1lLCBhY3R1YWxLZXkgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluaooeWdl+mFjee9ruWunuS+i1xyXG4gICAgICogQHBhcmFtIG1vZHVsZU5hbWUg5qih5Z2X5ZCNXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldEluc3RhbmNlKG1vZHVsZU5hbWU6IHN0cmluZyk6IElCYXNlQ29uZmlndXJhdGlvbiB7XHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBjb25maWd1cmF0aW9uUmVnaXN0cnkuZ2V0SW5zdGFuY2UobW9kdWxlTmFtZSk7XHJcbiAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFtDb25maWd1cmF0aW9uXSDorr7nva7phY3nva7plJnor6/vvIwke21vZHVsZU5hbWV9IOacquazqOWGjGApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bphY3nva7lgLxcclxuICAgICAqIOivu+WPluinhOWIme+8muS8mOWFiOivu+mhueebrumFjee9ru+8jOWmguaenOayoeacieWGjeivu+m7mOiupOmFjee9ru+8jOm7mOiupOmFjee9ruS5n+ayoeWumuS5ieeahOivne+8jOWwseaJk+WNsOitpuWRiuaXpeW/l1xyXG4gICAgICogQHBhcmFtIGtleSDphY3nva7plK7lkI3vvIzmlK/mjIHngrnlj7fliIbpmpTnmoTltYzlpZfot6/lvoTvvIzlpoIgJ3Rlc3QueC54J++8jOesrOS4gOS9jeS9nOS4uuaooeWdl+WQjVxyXG4gICAgICogQHBhcmFtIHNjb3BlIOmFjee9ruS9nOeUqOWfn++8jOS4jeaMh+WumuaXtuaMieS8mOWFiOe6p+afpeaJvlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgZ2V0PFQ+KGtleTogc3RyaW5nLCBzY29wZT86IENvbmZpZ3VyYXRpb25TY29wZSk6IFByb21pc2U8VD4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZW5zdXJlSW5pdGlhbGl6ZWQoKTtcclxuICAgICAgICAgICAgY29uc3QgeyBtb2R1bGVOYW1lLCBhY3R1YWxLZXkgfSA9IHRoaXMucGFyc2VLZXkoa2V5KTtcclxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0SW5zdGFuY2UobW9kdWxlTmFtZSkuZ2V0KGFjdHVhbEtleSwgc2NvcGUpIGFzIFQ7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBbQ29uZmlndXJhdGlvbl0g6I635Y+W6YWN572u5aSx6LSl77yaJHtlcnJvcn1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrDphY3nva7lgLxcclxuICAgICAqIEBwYXJhbSBrZXkg6YWN572u6ZSu5ZCN77yM5pSv5oyB54K55Y+35YiG6ZqU55qE5bWM5aWX6Lev5b6E77yM5aaCICd0ZXN0LngueCfvvIznrKzkuIDkvY3kvZzkuLrmqKHlnZflkI1cclxuICAgICAqIEBwYXJhbSB2YWx1ZSDmlrDnmoTphY3nva7lgLxcclxuICAgICAqIEBwYXJhbSBzY29wZSDphY3nva7kvZznlKjln5/vvIzpu5jorqTkuLogJ3Byb2plY3QnXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBzZXQ8VD4oa2V5OiBzdHJpbmcsIHZhbHVlOiBULCBzY29wZTogQ29uZmlndXJhdGlvblNjb3BlID0gJ3Byb2plY3QnKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5lbnN1cmVJbml0aWFsaXplZCgpO1xyXG4gICAgICAgICAgICBjb25zdCB7IG1vZHVsZU5hbWUsIGFjdHVhbEtleSB9ID0gdGhpcy5wYXJzZUtleShrZXkpO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmdldEluc3RhbmNlKG1vZHVsZU5hbWUpLnNldChhY3R1YWxLZXksIHZhbHVlLCBzY29wZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdChNZXNzYWdlVHlwZS5VcGRhdGUsIGtleSwgdmFsdWUsIHNjb3BlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBbQ29uZmlndXJhdGlvbl0g5pu05paw6YWN572u5aSx6LSl77yaJHtlcnJvcn1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnp7vpmaTphY3nva7lgLxcclxuICAgICAqIEBwYXJhbSBrZXkg6YWN572u6ZSu5ZCN77yM5pSv5oyB54K55Y+35YiG6ZqU55qE5bWM5aWX6Lev5b6E77yM5aaCICd0ZXN0LngueCfvvIznrKzkuIDkvY3kvZzkuLrmqKHlnZflkI1cclxuICAgICAqIEBwYXJhbSBzY29wZSDphY3nva7kvZznlKjln5/vvIzpu5jorqTkuLogJ3Byb2plY3QnXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyByZW1vdmUoa2V5OiBzdHJpbmcsIHNjb3BlOiBDb25maWd1cmF0aW9uU2NvcGUgPSAncHJvamVjdCcpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmVuc3VyZUluaXRpYWxpemVkKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgbW9kdWxlTmFtZSwgYWN0dWFsS2V5IH0gPSB0aGlzLnBhcnNlS2V5KGtleSk7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdChNZXNzYWdlVHlwZS5SZW1vdmUsIGtleSwgc2NvcGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRJbnN0YW5jZShtb2R1bGVOYW1lKS5yZW1vdmUoYWN0dWFsS2V5LCBzY29wZSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBbQ29uZmlndXJhdGlvbl0g56e76Zmk6YWN572u5aSx6LSl77yaJHtlcnJvcn1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnoa7kv53phY3nva7nrqHnkIblmajlt7LliJ3lp4vljJZcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBlbnN1cmVJbml0aWFsaXplZCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdbQ29uZmlndXJhdGlvbl0g5pyq5Yid5aeL5YyWJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L296aG555uu6YWN572uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgbG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAoYXdhaXQgZnNlLnBhdGhFeGlzdHModGhpcy5jb25maWdQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9qZWN0Q29uZmlnID0gYXdhaXQgZnNlLnJlYWRKU09OKHRoaXMuY29uZmlnUGF0aCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb2plY3RDb25maWcudmVyc2lvbiAmJiAodGhpcy52ZXJzaW9uID0gdGhpcy5wcm9qZWN0Q29uZmlnLnZlcnNpb24pO1xyXG4gICAgICAgICAgICAgICAgbmV3Q29uc29sZS5kZWJ1ZyhgW0NvbmZpZ3VyYXRpb25dIOW3suWKoOi9vemhueebrumFjee9rjogJHt0aGlzLmNvbmZpZ1BhdGh9YCwgdGhpcy5wcm9qZWN0Q29uZmlnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5ld0NvbnNvbGUuZGVidWcoYFtDb25maWd1cmF0aW9uXSDpobnnm67phY3nva7mlofku7bkuI3lrZjlnKjvvIzlsIbliJvlu7rmlrDmlofku7Y6ICR7dGhpcy5jb25maWdQYXRofWApO1xyXG4gICAgICAgICAgICAgICAgLy8g5Yib5bu66buY6K6k6YWN572u5paH5Lu2XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIG5ld0NvbnNvbGUuZXJyb3IoYFtDb25maWd1cmF0aW9uXSDliqDovb3pobnnm67phY3nva7lpLHotKU6ICR7dGhpcy5jb25maWdQYXRofSAtICR7ZXJyb3J9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5L+d5a2Y6aG555uu6YWN572uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgc2F2ZShmb3JjZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgaWYgKCFmb3JjZSAmJiAhT2JqZWN0LmtleXModGhpcy5wcm9qZWN0Q29uZmlnKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB0aGlzLnZlcnNpb24gPSBDb25maWd1cmF0aW9uTWFuYWdlci5WRVJTSU9OO1xyXG4gICAgICAgICAgICAvLyDnoa7kv53nm67lvZXlrZjlnKhcclxuICAgICAgICAgICAgYXdhaXQgZnNlLmVuc3VyZURpcihwYXRoLmRpcm5hbWUodGhpcy5jb25maWdQYXRoKSk7XHJcbiAgICAgICAgICAgIHRoaXMucHJvamVjdENvbmZpZy52ZXJzaW9uID0gdGhpcy52ZXJzaW9uO1xyXG4gICAgICAgICAgICB0aGlzLnByb2plY3RDb25maWcuJHNjaGVtYSA9IENvbmZpZ3VyYXRpb25NYW5hZ2VyLnJlbGF0aXZlU2NoZW1hUGF0aDtcclxuICAgICAgICAgICAgLy8g5L+d5a2Y6YWN572u5paH5Lu2XHJcbiAgICAgICAgICAgIGF3YWl0IGZzZS53cml0ZUpTT04odGhpcy5jb25maWdQYXRoLCB0aGlzLnByb2plY3RDb25maWcsIHsgc3BhY2VzOiA0IH0pO1xyXG4gICAgICAgICAgICB0aGlzLmVtaXQoTWVzc2FnZVR5cGUuU2F2ZSwgdGhpcy5wcm9qZWN0Q29uZmlnKTtcclxuICAgICAgICAgICAgbmV3Q29uc29sZS5kZWJ1ZyhgW0NvbmZpZ3VyYXRpb25dIOW3suS/neWtmOmhueebrumFjee9rjogJHt0aGlzLmNvbmZpZ1BhdGh9YCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgbmV3Q29uc29sZS5lcnJvcihgW0NvbmZpZ3VyYXRpb25dIOS/neWtmOmhueebrumFjee9ruWksei0pTogJHt0aGlzLmNvbmZpZ1BhdGh9IC0gJHtlcnJvcn1gKTtcclxuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0KCkge1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnByb2plY3RQYXRoID0gJyc7XHJcbiAgICAgICAgdGhpcy5jb25maWdQYXRoID0gJyc7XHJcbiAgICAgICAgdGhpcy5wcm9qZWN0Q29uZmlnID0ge307XHJcbiAgICAgICAgdGhpcy52ZXJzaW9uID0gJzAuMC4wJztcclxuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25NYXAuY2xlYXIoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGNvbmZpZ3VyYXRpb25NYW5hZ2VyID0gbmV3IENvbmZpZ3VyYXRpb25NYW5hZ2VyKCk7XHJcbiJdfQ==