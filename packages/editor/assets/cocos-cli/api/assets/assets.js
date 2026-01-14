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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsApi = void 0;
const schema_1 = require("./schema");
const zod_1 = require("zod");
const decorator_js_1 = require("../decorator/decorator.js");
const schema_base_1 = require("../base/schema-base");
const assets_1 = require("../../core/assets");
class AssetsApi {
    /**
     * Delete Asset // 删除资源
     */
    async deleteAsset(dbPath) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: { dbPath },
        };
        try {
            await assets_1.assetManager.removeAsset(dbPath);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('remove asset fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Refresh Asset Directory // 刷新资源目录
     */
    async refresh(dir) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            await assets_1.assetManager.refreshAsset(dir);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('refresh dir fail:', e);
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Query Asset Info // 查询资源信息
     */
    async queryAssetInfo(urlOrUUIDOrPath, dataKeys) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            ret.data = await assets_1.assetManager.queryAssetInfo(urlOrUUIDOrPath, dataKeys);
            if (!ret.data) {
                ret.code = schema_base_1.COMMON_STATUS.FAIL;
                ret.reason = `❌Asset can not be found: ${urlOrUUIDOrPath}`;
            }
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('query asset info fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Query Asset Metadata // 查询资源元数据
     */
    async queryAssetMeta(urlOrUUIDOrPath) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            ret.data = await assets_1.assetManager.queryAssetMeta(urlOrUUIDOrPath);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('query asset meta fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Query Creatable Asset Map // 查询可创建资源映射表
     */
    async queryCreateMap() {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: [],
        };
        try {
            ret.data = await assets_1.assetManager.getCreateMap();
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('query create map fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Batch Query Asset Info // 批量查询资源信息
     */
    async queryAssetInfos(options) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: [],
        };
        try {
            ret.data = await assets_1.assetManager.queryAssetInfos(options);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('query asset infos fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Query All Asset Database Info // 查询所有资源数据库信息
     */
    // @tool('assets-query-asset-db-infos')
    async queryAssetDBInfos() {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: [],
        };
        try {
            ret.data = Object.values(assets_1.assetDBManager.assetDBInfo);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('query asset db infos fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Create Asset By Type // 按类型创建资源
     */
    async createAssetByType(ccType, dirOrUrl, baseName, options) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            ret.data = await assets_1.assetManager.createAssetByType(ccType, dirOrUrl, baseName, options);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error(e);
            ret.reason = e instanceof Error ? e.message + e.stack : String(e);
        }
        return ret;
    }
    async createAsset(options) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            ret.data = await assets_1.assetManager.createAsset(options);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error(e);
            ret.reason = e instanceof Error ? e.message + e.stack : String(e);
        }
        return ret;
    }
    /**
     * Import Asset // 导入资源
     */
    async importAsset(source, target, options) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: [],
        };
        try {
            ret.data = await assets_1.assetManager.importAsset(source, target, options);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('import asset fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Reimport Asset // 重新导入资源
     */
    async reimportAsset(pathOrUrlOrUUID) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            const assetInfo = await assets_1.assetManager.reimportAsset(pathOrUrlOrUUID);
            ret.data = assetInfo;
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error(e);
            ret.reason = e instanceof Error ? e.message + e.stack : String(e);
        }
        return ret;
    }
    /**
     * Save Asset // 保存资源
     */
    async saveAsset(pathOrUrlOrUUID, data) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            ret.data = await assets_1.assetManager.saveAsset(pathOrUrlOrUUID, data);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('save asset fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Query Asset UUID // 查询资源 UUID
     */
    async queryUUID(urlOrPath) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            ret.data = assets_1.assetManager.queryUUID(urlOrPath);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('query UUID fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Query Asset Path // 查询资源路径
     */
    async queryPath(urlOrUuid) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            ret.data = assets_1.assetManager.queryPath(urlOrUuid);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('query path fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Query Asset URL // 查询资源 URL
     */
    async queryUrl(uuidOrPath) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            ret.data = assets_1.assetManager.queryUrl(uuidOrPath);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('query URL fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Query Asset Dependencies // 查询资源依赖
     */
    // @tool('assets-query-asset-dependencies')
    async queryAssetDependencies(uuidOrUrl, type = 'asset') {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: [],
        };
        try {
            ret.data = await assets_1.assetManager.queryAssetDependencies(uuidOrUrl, type);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('query asset dependencies fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Query Asset Users // 查询资源使用者
     */
    // @tool('assets-query-asset-users')
    async queryAssetUsers(uuidOrUrl, type = 'asset') {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: [],
        };
        try {
            ret.data = await assets_1.assetManager.queryAssetUsers(uuidOrUrl, type);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('query asset users fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Query Sorted Plugin Scripts // 查询排序后的插件脚本
     */
    // @tool('assets-query-sorted-plugins')
    async querySortedPlugins(filterOptions = {}) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: [],
        };
        try {
            ret.data = assets_1.assetManager.querySortedPlugins(filterOptions);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('query sorted plugins fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Rename Asset // 重命名资源
     */
    async renameAsset(source, target, options = {}) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            ret.data = await assets_1.assetManager.renameAsset(source, target, options);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('rename asset fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Move Asset // 移动资源
     */
    async moveAsset(source, target, options = {}) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            ret.data = await assets_1.assetManager.moveAsset(source, target, options);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('move asset fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Update Default User Data // 更新默认用户数据
     */
    async updateDefaultUserData(handler, path, value) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            await assets_1.assetManager.updateDefaultUserData(handler, path, value);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('update default user data fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Query Asset User Data Config // 查询资源用户数据配置
     */
    async queryAssetUserDataConfig(urlOrUuidOrPath) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            const asset = assets_1.assetManager.queryAsset(urlOrUuidOrPath);
            if (asset) {
                ret.data = await assets_1.assetManager.queryAssetUserDataConfig(asset);
            }
            else {
                ret.reason = `❌Asset can not be found: ${urlOrUuidOrPath}`;
            }
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('query asset user data config fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Update Asset User Data // 更新资源用户数据
     */
    async updateAssetUserData(urlOrUuidOrPath, path, value) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            ret.data = await assets_1.assetManager.updateUserData(urlOrUuidOrPath, path, value);
            if (!ret.data) {
                ret.reason = `❌Asset can not be found: ${urlOrUuidOrPath}`;
            }
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('update asset user data fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Query Asset Config Map // 查询资源配置映射表
     */
    // @tool('assets-query-asset-config-map')
    async queryAssetConfigMap() {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: {},
        };
        try {
            ret.data = await assets_1.assetManager.queryAssetConfigMap();
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('query asset config map fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
}
exports.AssetsApi = AssetsApi;
__decorate([
    (0, decorator_js_1.tool)('assets-delete-asset'),
    (0, decorator_js_1.title)('Delete Project Asset') // 删除项目资源
    ,
    (0, decorator_js_1.description)('Delete specified asset files from the Cocos Creator project. Supports deleting single files or entire directories. Deleted assets will be removed from the asset database, and corresponding .meta files will also be deleted. The deletion operation is irreversible, please use with caution.') // 从 Cocos Creator 项目中删除指定的资源文件。支持删除单个文件或整个目录。删除的资源会从资源数据库中移除，同时删除对应的 .meta 文件。删除操作不可逆，请谨慎使用。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaDbDirResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaDirOrDbPath)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "deleteAsset", null);
__decorate([
    (0, decorator_js_1.tool)('assets-refresh'),
    (0, decorator_js_1.title)('Refresh Asset Directory') // 刷新资源目录
    ,
    (0, decorator_js_1.description)('Refresh the specified asset directory in the Cocos Creator project, rescan all asset files in the directory, and update the asset database index. This method needs to be called to synchronize the asset status when asset files are modified externally or new files are added.') // 刷新 Cocos Creator 项目中的指定资源目录，重新扫描目录下的所有资源文件，更新资源数据库索引。当外部修改了资源文件或添加了新文件时，需要调用此方法同步资源状态。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaRefreshDirResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaDirOrDbPath)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "refresh", null);
__decorate([
    (0, decorator_js_1.tool)('assets-query-asset-info'),
    (0, decorator_js_1.title)('Query Detailed Asset Info') // 查询资源详细信息
    ,
    (0, decorator_js_1.description)('Query detailed information of an asset based on its URL, UUID, or file path. You can specify the fields to query via the dataKeys parameter to optimize performance. Returned information includes asset name, type, path, UUID, import status, etc.') // 根据资源的 URL、UUID 或文件路径查询资源的详细信息。可以通过 dataKeys 参数指定需要查询的字段，以优化性能。返回的信息包括资源名称、类型、路径、UUID、导入状态等。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaAssetInfoResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaUrlOrUUIDOrPath)),
    __param(1, (0, decorator_js_1.param)(schema_1.SchemaDataKeys)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "queryAssetInfo", null);
__decorate([
    (0, decorator_js_1.tool)('assets-query-asset-meta'),
    (0, decorator_js_1.title)('Query Asset Metadata') // 查询资源元数据
    ,
    (0, decorator_js_1.description)('Query the content of the .meta file of an asset based on its URL, UUID, or file path. Metadata includes asset import configuration, user-defined data, version information, etc.') // 根据资源的 URL、UUID 或文件路径查询资源的 .meta 文件内容。元数据包含资源的导入配置、用户自定义数据、版本信息等。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaAssetMetaResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaUrlOrUUIDOrPath)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "queryAssetMeta", null);
__decorate([
    (0, decorator_js_1.tool)('assets-query-create-map'),
    (0, decorator_js_1.title)('Query Creatable Asset Map') // 查询可创建资源映射表
    ,
    (0, decorator_js_1.description)('Get the mapping table of all supported creatable asset types. The returned mapping table contains asset handler names, corresponding engine types, creation menu information, etc., used to understand which types of assets the system supports creating.') // 获取所有支持创建的资源类型映射表。返回的映射表包含资源处理器名称、对应的引擎类型、创建菜单信息等，用于了解系统支持创建哪些类型的资源。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaCreateMapResult),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "queryCreateMap", null);
__decorate([
    (0, decorator_js_1.tool)('assets-query-asset-infos'),
    (0, decorator_js_1.title)('Batch Query Asset Info') // 批量查询资源信息
    ,
    (0, decorator_js_1.description)('Batch retrieve asset information based on query conditions. Supports filtering by asset type, importer, path pattern, extension, userData, etc. Can be used for asset list display, batch processing, and other scenarios.') // 根据查询条件批量获取资源信息。支持按资源类型、导入器、路径模式、扩展名、userData 等条件筛选。可用于资源列表展示、批量处理等场景。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaAssetInfosResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaQueryAssetsOption)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "queryAssetInfos", null);
__decorate([
    (0, decorator_js_1.title)('Query All Asset Database Info') // 查询所有资源数据库信息
    ,
    (0, decorator_js_1.description)('Get information about all asset databases in the project, including the built-in database (internal), asset database (assets), etc. Returns database configuration, path, options, and other information.') // 获取项目中所有资源数据库的信息，包括内置数据库（internal）、资源数据库（assets）等。返回数据库的配置、路径、选项等信息。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaAssetDBInfosResult),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "queryAssetDBInfos", null);
__decorate([
    (0, decorator_js_1.tool)('assets-create-asset-by-type'),
    (0, decorator_js_1.title)('Create Asset By Type') // 按类型创建资源
    ,
    (0, decorator_js_1.description)('Create a new asset at the target path based on the specified asset handler type. Supports creating various resources such as animations, scripts, materials, scenes, prefabs, etc. You can customize file content, template name, or control whether to overwrite or automatically rename via the options parameter. If file content is not specified, the built-in default template for the corresponding type will be used.') // 根据指定的资源处理器类型在目标路径创建新资源。支持创建动画、脚本、材质、场景、预制体等各类资源。可通过 options 参数自定义文件内容、模板名称或者控制是否覆盖、自动重命名，未指定文件内容时将使用对应类型的内置默认模板创建。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaCreatedAssetResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaSupportCreateType)),
    __param(1, (0, decorator_js_1.param)(schema_1.SchemaDirOrDbPath)),
    __param(2, (0, decorator_js_1.param)(schema_1.SchemaBaseName)),
    __param(3, (0, decorator_js_1.param)(schema_1.SchemaCreateAssetByTypeOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "createAssetByType", null);
__decorate([
    (0, decorator_js_1.tool)('assets-create-asset'),
    (0, decorator_js_1.title)('Create Asset') // 创建资源
    ,
    (0, decorator_js_1.description)('Create asset based on actual address and file content') // 根据实际地址和文件内容创建资源
    ,
    (0, decorator_js_1.result)(schema_1.SchemaCreatedAssetResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaCreateAssetOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "createAsset", null);
__decorate([
    (0, decorator_js_1.tool)('assets-import-asset'),
    (0, decorator_js_1.title)('Import External Asset') // 导入外部资源
    ,
    (0, decorator_js_1.description)('Import external asset files into the project. Copy files from the source path to the target path, and automatically execute the asset import process to generate .meta files and library files. Suitable for introducing images, audio, models, and other resources from outside.') // 将外部资源文件导入到项目中。从源路径复制文件到目标路径，并自动执行资源导入流程，生成 .meta 文件和库文件。适用于从外部引入图片、音频、模型等资源。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaImportedAssetResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaSourcePath)),
    __param(1, (0, decorator_js_1.param)(schema_1.SchemaTargetPath)),
    __param(2, (0, decorator_js_1.param)(schema_1.SchemaAssetOperationOption)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "importAsset", null);
__decorate([
    (0, decorator_js_1.tool)('assets-reimport-asset'),
    (0, decorator_js_1.title)('Reimport Asset') // 重新导入资源
    ,
    (0, decorator_js_1.description)('Force reimport of specified assets. When asset files or import configurations change, call this method to re-execute the import process and update library files and asset information. Commonly used for asset repair or refresh after configuration updates.') // 强制重新导入指定资源。当资源文件或导入配置发生变化时，调用此方法重新执行导入流程，更新库文件和资源信息。常用于资源修复或配置更新后的刷新。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaReimportResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaUrlOrUUIDOrPath)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "reimportAsset", null);
__decorate([
    (0, decorator_js_1.tool)('assets-save-asset'),
    (0, decorator_js_1.title)('Save Asset Data') // 保存资源数据
    ,
    (0, decorator_js_1.description)('Save the content of asset files. Used to modify the content of text-based assets (such as scripts, configuration files, scenes, etc.) and write to disk. Supports both string and Buffer data formats.') // 保存资源文件的内容。用于修改文本类资源（如脚本、配置文件、场景等）的内容并写入磁盘。支持字符串和 Buffer 两种数据格式。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaSaveAssetResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaUrlOrUUIDOrPath)),
    __param(1, (0, decorator_js_1.param)(schema_1.SchemaAssetData)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "saveAsset", null);
__decorate([
    (0, decorator_js_1.tool)('assets-query-uuid'),
    (0, decorator_js_1.title)('Query Asset UUID') // 查询资源 UUID
    ,
    (0, decorator_js_1.description)('Query the unique identifier UUID of an asset based on its URL or file path. Supports db:// protocol paths and file system paths.') // 根据资源的 URL 或文件路径查询资源的唯一标识符 UUID。支持 db:// 协议路径和文件系统路径。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaUUIDResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaUrlOrUUIDOrPath)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "queryUUID", null);
__decorate([
    (0, decorator_js_1.tool)('assets-query-path'),
    (0, decorator_js_1.title)('Query Asset File Path') // 查询资源文件路径
    ,
    (0, decorator_js_1.description)('Query the actual path of an asset in the file system based on its URL or UUID. Returns an absolute path string.') // 根据资源的 URL 或 UUID 查询资源在文件系统中的实际路径。返回绝对路径字符串。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaPathResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaUrlOrUUIDOrPath)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "queryPath", null);
__decorate([
    (0, decorator_js_1.tool)('assets-query-url'),
    (0, decorator_js_1.title)('Query Asset URL') // 查询资源 URL
    ,
    (0, decorator_js_1.description)('Query the URL address of an asset in the database based on its file path or UUID. Returns a URL in db:// protocol format.') // 根据资源的文件路径或 UUID 查询资源在数据库中的 URL 地址。返回 db:// 协议格式的 URL。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaUrlResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaUrlOrUUIDOrPath)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "queryUrl", null);
__decorate([
    (0, decorator_js_1.title)('Query Asset Dependencies') // 查询资源依赖
    ,
    (0, decorator_js_1.description)('Query the list of other assets that the specified asset depends on. Supports querying normal asset dependencies, script dependencies, or all dependencies.') // 查询指定资源所依赖的其他资源列表。支持查询普通资源依赖、脚本依赖或全部依赖。
    ,
    (0, decorator_js_1.result)(zod_1.z.array(zod_1.z.string()).describe('List of dependent asset UUIDs')) // 依赖资源的 UUID 列表
    ,
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaUrlOrUUIDOrPath)),
    __param(1, (0, decorator_js_1.param)(schema_1.SchemaQueryAssetType)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "queryAssetDependencies", null);
__decorate([
    (0, decorator_js_1.title)('Query Asset Users') // 查询资源使用者
    ,
    (0, decorator_js_1.description)('Query the list of other assets that use the specified asset. Supports querying normal asset users, script users, or all users.') // 查询使用指定资源的其他资源列表。支持查询普通资源使用者、脚本使用者或全部使用者。
    ,
    (0, decorator_js_1.result)(zod_1.z.array(zod_1.z.string()).describe('List of asset UUIDs using this asset')) // 使用该资源的资源 UUID 列表
    ,
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaUrlOrUUIDOrPath)),
    __param(1, (0, decorator_js_1.param)(schema_1.SchemaQueryAssetType)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "queryAssetUsers", null);
__decorate([
    (0, decorator_js_1.title)('Query Sorted Plugin Scripts') // 查询排序后的插件脚本
    ,
    (0, decorator_js_1.description)('Query the sorted list of all plugin scripts in the project. Supports filtering plugin scripts by platform.') // 查询项目中所有插件脚本的排序列表。支持按平台筛选插件脚本。
    ,
    (0, decorator_js_1.result)(zod_1.z.array(schema_1.SchemaPluginScriptInfo).describe('List of plugin script information')) // 插件脚本信息列表
    ,
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaFilterPluginOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "querySortedPlugins", null);
__decorate([
    (0, decorator_js_1.tool)('assets-rename-asset'),
    (0, decorator_js_1.title)('Rename Asset') // 重命名资源
    ,
    (0, decorator_js_1.description)('Rename the specified asset file. Supports renaming files and folders, with options to overwrite or automatically rename.') // 重命名指定的资源文件。支持重命名文件和文件夹，可选择是否覆盖或自动重命名。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaAssetInfoResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaUrlOrUUIDOrPath)),
    __param(1, (0, decorator_js_1.param)(schema_1.SchemaUrlOrUUIDOrPath)),
    __param(2, (0, decorator_js_1.param)(schema_1.SchemaAssetRenameOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "renameAsset", null);
__decorate([
    (0, decorator_js_1.tool)('assets-move-asset'),
    (0, decorator_js_1.title)('Move Asset') // 移动资源
    ,
    (0, decorator_js_1.description)('Move assets from the source location to the target location. Supports moving files and folders, with options to overwrite or automatically rename.') // 将资源从源位置移动到目标位置。支持移动文件和文件夹，可选择是否覆盖或自动重命名。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaAssetInfoResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaUrlOrUUIDOrPath)),
    __param(1, (0, decorator_js_1.param)(schema_1.SchemaUrlOrUUIDOrPath)),
    __param(2, (0, decorator_js_1.param)(schema_1.SchemaAssetMoveOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "moveAsset", null);
__decorate([
    (0, decorator_js_1.tool)('assets-update-default-user-data'),
    (0, decorator_js_1.title)('Update Default User Data') // 更新默认用户数据
    ,
    (0, decorator_js_1.description)('Update the default user data configuration for the specified asset handler. Used to modify the default import settings for assets.') // 更新指定资源处理器的默认用户数据配置。用于修改资源的默认导入设置。
    ,
    (0, decorator_js_1.result)(zod_1.z.null().describe('Update operation result (no return value)')) // 更新操作结果（无返回值）
    ,
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaUserDataHandler)),
    __param(1, (0, decorator_js_1.param)(schema_1.SchemaUpdateAssetUserDataPath)),
    __param(2, (0, decorator_js_1.param)(schema_1.SchemaUpdateAssetUserDataValue)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "updateDefaultUserData", null);
__decorate([
    (0, decorator_js_1.tool)('assets-query-asset-user-data-config'),
    (0, decorator_js_1.title)('Query Asset User Data Config') // 查询资源用户数据配置
    ,
    (0, decorator_js_1.description)('Query the user data configuration information of the specified asset. Returns the asset\'s import configuration and user-defined data.') // 查询指定资源的用户数据配置信息。返回资源的导入配置和用户自定义数据。
    ,
    (0, decorator_js_1.result)(zod_1.z.any().nullable().describe('Asset user data configuration object')) // 资源用户数据配置对象
    ,
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaUrlOrUUIDOrPath)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "queryAssetUserDataConfig", null);
__decorate([
    (0, decorator_js_1.tool)('assets-update-asset-user-data'),
    (0, decorator_js_1.title)('Update Asset User Data') // 更新资源用户数据
    ,
    (0, decorator_js_1.description)('Update the user data configuration of the specified asset. Precisely update the asset\'s user data via path and value, supporting nested path access.') // 更新指定资源的用户数据配置。通过路径和值来精确更新资源的用户数据，支持嵌套路径访问。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaUpdateAssetUserDataResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaUrlOrUUIDOrPath)),
    __param(1, (0, decorator_js_1.param)(schema_1.SchemaUpdateAssetUserDataPath)),
    __param(2, (0, decorator_js_1.param)(schema_1.SchemaUpdateAssetUserDataValue)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "updateAssetUserData", null);
__decorate([
    (0, decorator_js_1.title)('Query Asset Config Map') // 查询资源配置映射表
    ,
    (0, decorator_js_1.description)('Query the basic configuration mapping table for each asset handler. Returns a mapping table containing configuration information such as asset display name, description, documentation URL, user data configuration, icon information, etc.') // 查询各个资源处理器的基本配置映射表。返回包含资源显示名称、描述、文档URL、用户数据配置、图标信息等配置信息的映射表。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaAssetConfigMapResult),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssetsApi.prototype, "queryAssetConfigMap", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaS9hc3NldHMvYXNzZXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFDQXVFa0I7QUFDbEIsNkJBQXdCO0FBQ3hCLDREQUFvRjtBQUNwRixxREFBc0Y7QUFDdEYsOENBQWlFO0FBR2pFLE1BQWEsU0FBUztJQUVsQjs7T0FFRztJQUtHLEFBQU4sS0FBSyxDQUFDLFdBQVcsQ0FBMkIsTUFBb0I7UUFDNUQsTUFBTSxJQUFJLEdBQW1CLDJCQUFhLENBQUMsT0FBTyxDQUFDO1FBQ25ELE1BQU0sR0FBRyxHQUFtQztZQUN4QyxJQUFJLEVBQUUsSUFBSTtZQUNWLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRTtTQUNuQixDQUFDO1FBRUYsSUFBSSxDQUFDO1lBQ0QsTUFBTSxxQkFBWSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNULEdBQUcsQ0FBQyxJQUFJLEdBQUcsMkJBQWEsQ0FBQyxJQUFJLENBQUM7WUFDOUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRixHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQ7O09BRUc7SUFLRyxBQUFOLEtBQUssQ0FBQyxPQUFPLENBQTJCLEdBQWlCO1FBQ3JELE1BQU0sSUFBSSxHQUFtQiwyQkFBYSxDQUFDLE9BQU8s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SUFBQSwwQkFBVyxFQUFDLHdJQUF3SSxDQUFDLENBQUMscUNBQXFDOztJQUMzTCxJQUFBLHFCQUFNLEVBQUMsT0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDLENBQUMsYUFBYTs7SUFFckYsV0FBQSxJQUFBLG9CQUFLLEVBQUMsOEJBQXFCLENBQUMsQ0FBQTs7Ozt5REFzQmhDO0FBU0s7SUFKTCxJQUFBLG1CQUFJLEVBQUMsK0JBQStCLENBQUM7SUFDckMsSUFBQSxvQkFBSyxFQUFDLHdCQUF3QixDQUFDLENBQUMsV0FBVzs7SUFDM0MsSUFBQSwwQkFBVyxFQUFDLHVKQUF1SixDQUFDLENBQUMsNkNBQTZDOztJQUNsTixJQUFBLHFCQUFNLEVBQUMsd0NBQStCLENBQUM7SUFFbkMsV0FBQSxJQUFBLG9CQUFLLEVBQUMsOEJBQXFCLENBQUMsQ0FBQTtJQUM1QixXQUFBLElBQUEsb0JBQUssRUFBQyxzQ0FBNkIsQ0FBQyxDQUFBO0lBQ3BDLFdBQUEsSUFBQSxvQkFBSyxFQUFDLHVDQUE4QixDQUFDLENBQUE7Ozs7b0RBb0J6QztBQVNLO0lBSEwsSUFBQSxvQkFBSyxFQUFDLHdCQUF3QixDQUFDLENBQUMsWUFBWTs7SUFDNUMsSUFBQSwwQkFBVyxFQUFDLDhPQUE4TyxDQUFDLENBQUMsOERBQThEOztJQUMxVCxJQUFBLHFCQUFNLEVBQUMsbUNBQTBCLENBQUM7Ozs7b0RBaUJsQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgICBTY2hlbWFEYkRpclJlc3VsdCxcclxuICAgIFNjaGVtYURpck9yRGJQYXRoLFxyXG4gICAgVERiRGlyUmVzdWx0LFxyXG4gICAgVERpck9yRGJQYXRoLFxyXG4gICAgU2NoZW1hVXJsT3JVVUlET3JQYXRoLFxyXG4gICAgU2NoZW1hRGF0YUtleXMsXHJcbiAgICBTY2hlbWFRdWVyeUFzc2V0c09wdGlvbixcclxuICAgIFNjaGVtYVN1cHBvcnRDcmVhdGVUeXBlLFxyXG4gICAgU2NoZW1hVGFyZ2V0UGF0aCxcclxuICAgIFNjaGVtYUFzc2V0T3BlcmF0aW9uT3B0aW9uLFxyXG4gICAgU2NoZW1hU291cmNlUGF0aCxcclxuICAgIFNjaGVtYUFzc2V0RGF0YSxcclxuICAgIFRVcmxPclVVSURPclBhdGgsXHJcbiAgICBURGF0YUtleXMsXHJcbiAgICBUUXVlcnlBc3NldHNPcHRpb24sXHJcbiAgICBUU3VwcG9ydENyZWF0ZVR5cGUsXHJcbiAgICBUQXNzZXRPcGVyYXRpb25PcHRpb24sXHJcbiAgICBUQXNzZXREYXRhLFxyXG4gICAgU2NoZW1hQXNzZXRJbmZvUmVzdWx0LFxyXG4gICAgU2NoZW1hQXNzZXRNZXRhUmVzdWx0LFxyXG4gICAgU2NoZW1hQ3JlYXRlTWFwUmVzdWx0LFxyXG4gICAgU2NoZW1hQXNzZXRJbmZvc1Jlc3VsdCxcclxuICAgIFNjaGVtYUFzc2V0REJJbmZvc1Jlc3VsdCxcclxuICAgIFNjaGVtYUNyZWF0ZWRBc3NldFJlc3VsdCxcclxuICAgIFNjaGVtYUltcG9ydGVkQXNzZXRSZXN1bHQsXHJcbiAgICBTY2hlbWFSZWltcG9ydFJlc3VsdCxcclxuICAgIFNjaGVtYVNhdmVBc3NldFJlc3VsdCxcclxuICAgIFRBc3NldEluZm9SZXN1bHQsXHJcbiAgICBUQXNzZXRNZXRhUmVzdWx0LFxyXG4gICAgVENyZWF0ZU1hcFJlc3VsdCxcclxuICAgIFRBc3NldEluZm9zUmVzdWx0LFxyXG4gICAgVEFzc2V0REJJbmZvc1Jlc3VsdCxcclxuICAgIFRDcmVhdGVkQXNzZXRSZXN1bHQsXHJcbiAgICBUSW1wb3J0ZWRBc3NldFJlc3VsdCxcclxuICAgIFRSZWltcG9ydFJlc3VsdCxcclxuICAgIFRTYXZlQXNzZXRSZXN1bHQsXHJcbiAgICBUUmVmcmVzaERpclJlc3VsdCxcclxuICAgIFNjaGVtYUJhc2VOYW1lLFxyXG4gICAgVEJhc2VOYW1lLFxyXG4gICAgU2NoZW1hUmVmcmVzaERpclJlc3VsdCxcclxuICAgIFNjaGVtYUNyZWF0ZUFzc2V0QnlUeXBlT3B0aW9ucyxcclxuICAgIFRDcmVhdGVBc3NldEJ5VHlwZU9wdGlvbnMsXHJcbiAgICBTY2hlbWFDcmVhdGVBc3NldE9wdGlvbnMsXHJcbiAgICBUQ3JlYXRlQXNzZXRPcHRpb25zLFxyXG4gICAgU2NoZW1hVVVJRFJlc3VsdCxcclxuICAgIFNjaGVtYVBhdGhSZXN1bHQsXHJcbiAgICBTY2hlbWFVcmxSZXN1bHQsXHJcbiAgICBUVVVJRFJlc3VsdCxcclxuICAgIFRQYXRoUmVzdWx0LFxyXG4gICAgVFVybFJlc3VsdCxcclxuICAgIFNjaGVtYVF1ZXJ5QXNzZXRUeXBlLFxyXG4gICAgU2NoZW1hRmlsdGVyUGx1Z2luT3B0aW9ucyxcclxuICAgIFNjaGVtYVBsdWdpblNjcmlwdEluZm8sXHJcbiAgICBTY2hlbWFBc3NldE1vdmVPcHRpb25zLFxyXG4gICAgU2NoZW1hQXNzZXRSZW5hbWVPcHRpb25zLFxyXG4gICAgU2NoZW1hVXNlckRhdGFIYW5kbGVyLFxyXG4gICAgVFF1ZXJ5QXNzZXRUeXBlLFxyXG4gICAgVEZpbHRlclBsdWdpbk9wdGlvbnMsXHJcbiAgICBUUGx1Z2luU2NyaXB0SW5mbyxcclxuICAgIFRBc3NldE1vdmVPcHRpb25zLFxyXG4gICAgVEFzc2V0UmVuYW1lT3B0aW9ucyxcclxuICAgIFRVc2VyRGF0YUhhbmRsZXIsXHJcbiAgICBTY2hlbWFVcGRhdGVBc3NldFVzZXJEYXRhUGF0aCxcclxuICAgIFNjaGVtYVVwZGF0ZUFzc2V0VXNlckRhdGFWYWx1ZSxcclxuICAgIFNjaGVtYVVwZGF0ZUFzc2V0VXNlckRhdGFSZXN1bHQsXHJcbiAgICBUVXBkYXRlQXNzZXRVc2VyRGF0YVBhdGgsXHJcbiAgICBUVXBkYXRlQXNzZXRVc2VyRGF0YVZhbHVlLFxyXG4gICAgVFVwZGF0ZUFzc2V0VXNlckRhdGFSZXN1bHQsXHJcbiAgICBTY2hlbWFBc3NldENvbmZpZ01hcFJlc3VsdCxcclxuICAgIFRBc3NldENvbmZpZ01hcFJlc3VsdFxyXG59IGZyb20gJy4vc2NoZW1hJztcclxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XHJcbmltcG9ydCB7IGRlc2NyaXB0aW9uLCBwYXJhbSwgcmVzdWx0LCB0aXRsZSwgdG9vbCB9IGZyb20gJy4uL2RlY29yYXRvci9kZWNvcmF0b3IuanMnO1xyXG5pbXBvcnQgeyBDT01NT05fU1RBVFVTLCBDb21tb25SZXN1bHRUeXBlLCBIdHRwU3RhdHVzQ29kZSB9IGZyb20gJy4uL2Jhc2Uvc2NoZW1hLWJhc2UnO1xyXG5pbXBvcnQgeyBhc3NldERCTWFuYWdlciwgYXNzZXRNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vY29yZS9hc3NldHMnO1xyXG5pbXBvcnQgeyBJQXNzZXRJbmZvIH0gZnJvbSAnLi4vLi4vY29yZS9hc3NldHMvQHR5cGVzL3B1YmxpYyc7XHJcblxyXG5leHBvcnQgY2xhc3MgQXNzZXRzQXBpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERlbGV0ZSBBc3NldCAvLyDliKDpmaTotYTmupBcclxuICAgICAqL1xyXG4gICAgQHRvb2woJ2Fzc2V0cy1kZWxldGUtYXNzZXQnKVxyXG4gICAgQHRpdGxlKCdEZWxldGUgUHJvamVjdCBBc3NldCcpIC8vIOWIoOmZpOmhueebrui1hOa6kFxyXG4gICAgQGRlc2NyaXB0aW9uKCdEZWxldGUgc3BlY2lmaWVkIGFzc2V0IGZpbGVzIGZyb20gdGhlIENvY29zIENyZWF0b3IgcHJvamVjdC4gU3VwcG9ydHMgZGVsZXRpbmcgc2luZ2xlIGZpbGVzIG9yIGVudGlyZSBkaXJlY3Rvcmllcy4gRGVsZXRlZCBhc3NldHMgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGFzc2V0IGRhdGFiYXNlLCBhbmQgY29ycmVzcG9uZGluZyAubWV0YSBmaWxlcyB3aWxsIGFsc28gYmUgZGVsZXRlZC4gVGhlIGRlbGV0aW9uIG9wZXJhdGlvbiBpcyBpcnJldmVyc2libGUsIHBsZWFzZSB1c2Ugd2l0aCBjYXV0aW9uLicpIC8vIOS7jiBDb2NvcyBDcmVhdG9yIOmhueebruS4reWIoOmZpOaMh+WumueahOi1hOa6kOaWh+S7tuOAguaUr+aMgeWIoOmZpOWNleS4quaWh+S7tuaIluaVtOS4quebruW9leOAguWIoOmZpOeahOi1hOa6kOS8muS7jui1hOa6kOaVsOaNruW6k+S4reenu+mZpO+8jOWQjOaXtuWIoOmZpOWvueW6lOeahCAubWV0YSDmlofku7bjgILliKDpmaTmk43kvZzkuI3lj6/pgIbvvIzor7fosKjmhY7kvb/nlKjjgIJcclxuICAgIEByZXN1bHQoU2NoZW1hRGJEaXJSZXN1bHQpXHJcbiAgICBhc3luYyBkZWxldGVBc3NldChAcGFyYW0oU2NoZW1hRGlyT3JEYlBhdGgpIGRiUGF0aDogVERpck9yRGJQYXRoKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFREYkRpclJlc3VsdD4+IHtcclxuICAgICAgICBjb25zdCBjb2RlOiBIdHRwU3RhdHVzQ29kZSA9IENPTU1PTl9TVEFUVVMuU1VDQ0VTUztcclxuICAgICAgICBjb25zdCByZXQ6IENvbW1vblJlc3VsdFR5cGU8VERiRGlyUmVzdWx0PiA9IHtcclxuICAgICAgICAgICAgY29kZTogY29kZSxcclxuICAgICAgICAgICAgZGF0YTogeyBkYlBhdGggfSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldE1hbmFnZXIucmVtb3ZlQXNzZXQoZGJQYXRoKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdyZW1vdmUgYXNzZXQgZmFpbDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZnJlc2ggQXNzZXQgRGlyZWN0b3J5IC8vIOWIt+aWsOi1hOa6kOebruW9lVxyXG4gICAgICovXHJcbiAgICBAdG9vbCgnYXNzZXRzLXJlZnJlc2gnKVxyXG4gICAgQHRpdGxlKCdSZWZyZXNoIEFzc2V0IERpcmVjdG9yeScpIC8vIOWIt+aWsOi1hOa6kOebruW9lVxyXG4gICAgQGRlc2NyaXB0aW9uKCdSZWZyZXNoIHRoZSBzcGVjaWZpZWQgYXNzZXQgZGlyZWN0b3J5IGluIHRoZSBDb2NvcyBDcmVhdG9yIHByb2plY3QsIHJlc2NhbiBhbGwgYXNzZXQgZmlsZXMgaW4gdGhlIGRpcmVjdG9yeSwgYW5kIHVwZGF0ZSB0aGUgYXNzZXQgZGF0YWJhc2UgaW5kZXguIFRoaXMgbWV0aG9kIG5lZWRzIHRvIGJlIGNhbGxlZCB0byBzeW5jaHJvbml6ZSB0aGUgYXNzZXQgc3RhdHVzIHdoZW4gYXNzZXQgZmlsZXMgYXJlIG1vZGlmaWVkIGV4dGVybmFsbHkgb3IgbmV3IGZpbGVzIGFyZSBhZGRlZC4nKSAvLyDliLfmlrAgQ29jb3MgQ3JlYXRvciDpobnnm67kuK3nmoTmjIflrprotYTmupDnm67lvZXvvIzph43mlrDmiavmj4/nm67lvZXkuIvnmoTmiYDmnInotYTmupDmlofku7bvvIzmm7TmlrDotYTmupDmlbDmja7lupPntKLlvJXjgILlvZPlpJbpg6jkv67mlLnkuobotYTmupDmlofku7bmiJbmt7vliqDkuobmlrDmlofku7bml7bvvIzpnIDopoHosIPnlKjmraTmlrnms5XlkIzmraXotYTmupDnirbmgIHjgIJcclxuICAgIEByZXN1bHQoU2NoZW1hUmVmcmVzaERpclJlc3VsdClcclxuICAgIGFzeW5jIHJlZnJlc2goQHBhcmFtKFNjaGVtYURpck9yRGJQYXRoKSBkaXI6IFREaXJPckRiUGF0aCk6IFByb21pc2U8Q29tbW9uUmVzdWx0VHlwZTxUUmVmcmVzaERpclJlc3VsdD4+IHtcclxuICAgICAgICBjb25zdCBjb2RlOiBIdHRwU3RhdHVzQ29kZSA9IENPTU1PTl9TVEFUVVMuU1VDQ0VTUztcclxuICAgICAgICBjb25zdCByZXQ6IENvbW1vblJlc3VsdFR5cGU8VFJlZnJlc2hEaXJSZXN1bHQ+ID0ge1xyXG4gICAgICAgICAgICBjb2RlOiBjb2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBudWxsLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGF3YWl0IGFzc2V0TWFuYWdlci5yZWZyZXNoQXNzZXQoZGlyKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdyZWZyZXNoIGRpciBmYWlsOicsIGUpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFF1ZXJ5IEFzc2V0IEluZm8gLy8g5p+l6K+i6LWE5rqQ5L+h5oGvXHJcbiAgICAgKi9cclxuICAgIEB0b29sKCdhc3NldHMtcXVlcnktYXNzZXQtaW5mbycpXHJcbiAgICBAdGl0bGUoJ1F1ZXJ5IERldGFpbGVkIEFzc2V0IEluZm8nKSAvLyDmn6Xor6LotYTmupDor6bnu4bkv6Hmga9cclxuICAgIEBkZXNjcmlwdGlvbignUXVlcnkgZGV0YWlsZWQgaW5mb3JtYXRpb24gb2YgYW4gYXNzZXQgYmFzZWQgb24gaXRzIFVSTCwgVVVJRCwgb3IgZmlsZSBwYXRoLiBZb3UgY2FuIHNwZWNpZnkgdGhlIGZpZWxkcyB0byBxdWVyeSB2aWEgdGhlIGRhdGFLZXlzIHBhcmFtZXRlciB0byBvcHRpbWl6ZSBwZXJmb3JtYW5jZS4gUmV0dXJuZWQgaW5mb3JtYXRpb24gaW5jbHVkZXMgYXNzZXQgbmFtZSwgdHlwZSwgcGF0aCwgVVVJRCwgaW1wb3J0IHN0YXR1cywgZXRjLicpIC8vIOagueaNrui1hOa6kOeahCBVUkzjgIFVVUlEIOaIluaWh+S7tui3r+W+hOafpeivoui1hOa6kOeahOivpue7huS/oeaBr+OAguWPr+S7pemAmui/hyBkYXRhS2V5cyDlj4LmlbDmjIflrprpnIDopoHmn6Xor6LnmoTlrZfmrrXvvIzku6XkvJjljJbmgKfog73jgILov5Tlm57nmoTkv6Hmga/ljIXmi6zotYTmupDlkI3np7DjgIHnsbvlnovjgIHot6/lvoTjgIFVVUlE44CB5a+85YWl54q25oCB562J44CCXHJcbiAgICBAcmVzdWx0KFNjaGVtYUFzc2V0SW5mb1Jlc3VsdClcclxuICAgIGFzeW5jIHF1ZXJ5QXNzZXRJbmZvKFxyXG4gICAgICAgIEBwYXJhbShTY2hlbWFVcmxPclVVSURPclBhdGgpIHVybE9yVVVJRE9yUGF0aDogVFVybE9yVVVJRE9yUGF0aCxcclxuICAgICAgICBAcGFyYW0oU2NoZW1hRGF0YUtleXMpIGRhdGFLZXlzPzogVERhdGFLZXlzXHJcbiAgICApOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8VEFzc2V0SW5mb1Jlc3VsdD4+IHtcclxuICAgICAgICBjb25zdCBjb2RlOiBIdHRwU3RhdHVzQ29kZSA9IENPTU1PTl9TVEFUVVMuU1VDQ0VTUztcclxuICAgICAgICBjb25zdCByZXQ6IENvbW1vblJlc3VsdFR5cGU8VEFzc2V0SW5mb1Jlc3VsdD4gPSB7XHJcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmV0LmRhdGEgPSBhd2FpdCBhc3NldE1hbmFnZXIucXVlcnlBc3NldEluZm8odXJsT3JVVUlET3JQYXRoLCBkYXRhS2V5cyBhcyAoa2V5b2YgSUFzc2V0SW5mbylbXSB8IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgIGlmICghcmV0LmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGDinYxBc3NldCBjYW4gbm90IGJlIGZvdW5kOiAke3VybE9yVVVJRE9yUGF0aH1gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXQuY29kZSA9IENPTU1PTl9TVEFUVVMuRkFJTDtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcigncXVlcnkgYXNzZXQgaW5mbyBmYWlsOicsIGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKSk7XHJcbiAgICAgICAgICAgIHJldC5yZWFzb24gPSBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUXVlcnkgQXNzZXQgTWV0YWRhdGEgLy8g5p+l6K+i6LWE5rqQ5YWD5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIEB0b29sKCdhc3NldHMtcXVlcnktYXNzZXQtbWV0YScpXHJcbiAgICBAdGl0bGUoJ1F1ZXJ5IEFzc2V0IE1ldGFkYXRhJykgLy8g5p+l6K+i6LWE5rqQ5YWD5pWw5o2uXHJcbiAgICBAZGVzY3JpcHRpb24oJ1F1ZXJ5IHRoZSBjb250ZW50IG9mIHRoZSAubWV0YSBmaWxlIG9mIGFuIGFzc2V0IGJhc2VkIG9uIGl0cyBVUkwsIFVVSUQsIG9yIGZpbGUgcGF0aC4gTWV0YWRhdGEgaW5jbHVkZXMgYXNzZXQgaW1wb3J0IGNvbmZpZ3VyYXRpb24sIHVzZXItZGVmaW5lZCBkYXRhLCB2ZXJzaW9uIGluZm9ybWF0aW9uLCBldGMuJykgLy8g5qC55o2u6LWE5rqQ55qEIFVSTOOAgVVVSUQg5oiW5paH5Lu26Lev5b6E5p+l6K+i6LWE5rqQ55qEIC5tZXRhIOaWh+S7tuWGheWuueOAguWFg+aVsOaNruWMheWQq+i1hOa6kOeahOWvvOWFpemFjee9ruOAgeeUqOaIt+iHquWumuS5ieaVsOaNruOAgeeJiOacrOS/oeaBr+etieOAglxyXG4gICAgQHJlc3VsdChTY2hlbWFBc3NldE1ldGFSZXN1bHQpXHJcbiAgICBhc3luYyBxdWVyeUFzc2V0TWV0YShAcGFyYW0oU2NoZW1hVXJsT3JVVUlET3JQYXRoKSB1cmxPclVVSURPclBhdGg6IFRVcmxPclVVSURPclBhdGgpOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8VEFzc2V0TWV0YVJlc3VsdD4+IHtcclxuICAgICAgICBjb25zdCBjb2RlOiBIdHRwU3RhdHVzQ29kZSA9IENPTU1PTl9TVEFUVVMuU1VDQ0VTUztcclxuICAgICAgICBjb25zdCByZXQ6IENvbW1vblJlc3VsdFR5cGU8VEFzc2V0TWV0YVJlc3VsdD4gPSB7XHJcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmV0LmRhdGEgPSBhd2FpdCBhc3NldE1hbmFnZXIucXVlcnlBc3NldE1ldGEodXJsT3JVVUlET3JQYXRoKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdxdWVyeSBhc3NldCBtZXRhIGZhaWw6JywgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpKTtcclxuICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBRdWVyeSBDcmVhdGFibGUgQXNzZXQgTWFwIC8vIOafpeivouWPr+WIm+W7uui1hOa6kOaYoOWwhOihqFxyXG4gICAgICovXHJcbiAgICBAdG9vbCgnYXNzZXRzLXF1ZXJ5LWNyZWF0ZS1tYXAnKVxyXG4gICAgQHRpdGxlKCdRdWVyeSBDcmVhdGFibGUgQXNzZXQgTWFwJykgLy8g5p+l6K+i5Y+v5Yib5bu66LWE5rqQ5pig5bCE6KGoXHJcbiAgICBAZGVzY3JpcHRpb24oJ0dldCB0aGUgbWFwcGluZyB0YWJsZSBvZiBhbGwgc3VwcG9ydGVkIGNyZWF0YWJsZSBhc3NldCB0eXBlcy4gVGhlIHJldHVybmVkIG1hcHBpbmcgdGFibGUgY29udGFpbnMgYXNzZXQgaGFuZGxlciBuYW1lcywgY29ycmVzcG9uZGluZyBlbmdpbmUgdHlwZXMsIGNyZWF0aW9uIG1lbnUgaW5mb3JtYXRpb24sIGV0Yy4sIHVzZWQgdG8gdW5kZXJzdGFuZCB3aGljaCB0eXBlcyBvZiBhc3NldHMgdGhlIHN5c3RlbSBzdXBwb3J0cyBjcmVhdGluZy4nKSAvLyDojrflj5bmiYDmnInmlK/mjIHliJvlu7rnmoTotYTmupDnsbvlnovmmKDlsITooajjgILov5Tlm57nmoTmmKDlsITooajljIXlkKvotYTmupDlpITnkIblmajlkI3np7DjgIHlr7nlupTnmoTlvJXmk47nsbvlnovjgIHliJvlu7roj5zljZXkv6Hmga/nrYnvvIznlKjkuo7kuobop6Pns7vnu5/mlK/mjIHliJvlu7rlk6rkupvnsbvlnovnmoTotYTmupDjgIJcclxuICAgIEByZXN1bHQoU2NoZW1hQ3JlYXRlTWFwUmVzdWx0KVxyXG4gICAgYXN5bmMgcXVlcnlDcmVhdGVNYXAoKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRDcmVhdGVNYXBSZXN1bHQ+PiB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFRDcmVhdGVNYXBSZXN1bHQ+ID0ge1xyXG4gICAgICAgICAgICBjb2RlOiBjb2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXQuZGF0YSA9IGF3YWl0IGFzc2V0TWFuYWdlci5nZXRDcmVhdGVNYXAoKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdxdWVyeSBjcmVhdGUgbWFwIGZhaWw6JywgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpKTtcclxuICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCYXRjaCBRdWVyeSBBc3NldCBJbmZvIC8vIOaJuemHj+afpeivoui1hOa6kOS/oeaBr1xyXG4gICAgICovXHJcbiAgICBAdG9vbCgnYXNzZXRzLXF1ZXJ5LWFzc2V0LWluZm9zJylcclxuICAgIEB0aXRsZSgnQmF0Y2ggUXVlcnkgQXNzZXQgSW5mbycpIC8vIOaJuemHj+afpeivoui1hOa6kOS/oeaBr1xyXG4gICAgQGRlc2NyaXB0aW9uKCdCYXRjaCByZXRyaWV2ZSBhc3NldCBpbmZvcm1hdGlvbiBiYXNlZCBvbiBxdWVyeSBjb25kaXRpb25zLiBTdXBwb3J0cyBmaWx0ZXJpbmcgYnkgYXNzZXQgdHlwZSwgaW1wb3J0ZXIsIHBhdGggcGF0dGVybiwgZXh0ZW5zaW9uLCB1c2VyRGF0YSwgZXRjLiBDYW4gYmUgdXNlZCBmb3IgYXNzZXQgbGlzdCBkaXNwbGF5LCBiYXRjaCBwcm9jZXNzaW5nLCBhbmQgb3RoZXIgc2NlbmFyaW9zLicpIC8vIOagueaNruafpeivouadoeS7tuaJuemHj+iOt+WPlui1hOa6kOS/oeaBr+OAguaUr+aMgeaMiei1hOa6kOexu+Wei+OAgeWvvOWFpeWZqOOAgei3r+W+hOaooeW8j+OAgeaJqeWxleWQjeOAgXVzZXJEYXRhIOetieadoeS7tuetm+mAieOAguWPr+eUqOS6jui1hOa6kOWIl+ihqOWxleekuuOAgeaJuemHj+WkhOeQhuetieWcuuaZr+OAglxyXG4gICAgQHJlc3VsdChTY2hlbWFBc3NldEluZm9zUmVzdWx0KVxyXG4gICAgYXN5bmMgcXVlcnlBc3NldEluZm9zKEBwYXJhbShTY2hlbWFRdWVyeUFzc2V0c09wdGlvbikgb3B0aW9ucz86IFRRdWVyeUFzc2V0c09wdGlvbik6IFByb21pc2U8Q29tbW9uUmVzdWx0VHlwZTxUQXNzZXRJbmZvc1Jlc3VsdD4+IHtcclxuICAgICAgICBjb25zdCBjb2RlOiBIdHRwU3RhdHVzQ29kZSA9IENPTU1PTl9TVEFUVVMuU1VDQ0VTUztcclxuICAgICAgICBjb25zdCByZXQ6IENvbW1vblJlc3VsdFR5cGU8VEFzc2V0SW5mb3NSZXN1bHQ+ID0ge1xyXG4gICAgICAgICAgICBjb2RlOiBjb2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXQuZGF0YSA9IGF3YWl0IGFzc2V0TWFuYWdlci5xdWVyeUFzc2V0SW5mb3Mob3B0aW9ucyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXQuY29kZSA9IENPTU1PTl9TVEFUVVMuRkFJTDtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcigncXVlcnkgYXNzZXQgaW5mb3MgZmFpbDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFF1ZXJ5IEFsbCBBc3NldCBEYXRhYmFzZSBJbmZvIC8vIOafpeivouaJgOaciei1hOa6kOaVsOaNruW6k+S/oeaBr1xyXG4gICAgICovXHJcbiAgICAvLyBAdG9vbCgnYXNzZXRzLXF1ZXJ5LWFzc2V0LWRiLWluZm9zJylcclxuICAgIEB0aXRsZSgnUXVlcnkgQWxsIEFzc2V0IERhdGFiYXNlIEluZm8nKSAvLyDmn6Xor6LmiYDmnInotYTmupDmlbDmja7lupPkv6Hmga9cclxuICAgIEBkZXNjcmlwdGlvbignR2V0IGluZm9ybWF0aW9uIGFib3V0IGFsbCBhc3NldCBkYXRhYmFzZXMgaW4gdGhlIHByb2plY3QsIGluY2x1ZGluZyB0aGUgYnVpbHQtaW4gZGF0YWJhc2UgKGludGVybmFsKSwgYXNzZXQgZGF0YWJhc2UgKGFzc2V0cyksIGV0Yy4gUmV0dXJucyBkYXRhYmFzZSBjb25maWd1cmF0aW9uLCBwYXRoLCBvcHRpb25zLCBhbmQgb3RoZXIgaW5mb3JtYXRpb24uJykgLy8g6I635Y+W6aG555uu5Lit5omA5pyJ6LWE5rqQ5pWw5o2u5bqT55qE5L+h5oGv77yM5YyF5ous5YaF572u5pWw5o2u5bqT77yIaW50ZXJuYWzvvInjgIHotYTmupDmlbDmja7lupPvvIhhc3NldHPvvInnrYnjgILov5Tlm57mlbDmja7lupPnmoTphY3nva7jgIHot6/lvoTjgIHpgInpobnnrYnkv6Hmga/jgIJcclxuICAgIEByZXN1bHQoU2NoZW1hQXNzZXREQkluZm9zUmVzdWx0KVxyXG4gICAgYXN5bmMgcXVlcnlBc3NldERCSW5mb3MoKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRBc3NldERCSW5mb3NSZXN1bHQ+PiB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFRBc3NldERCSW5mb3NSZXN1bHQ+ID0ge1xyXG4gICAgICAgICAgICBjb2RlOiBjb2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXQuZGF0YSA9IE9iamVjdC52YWx1ZXMoYXNzZXREQk1hbmFnZXIuYXNzZXREQkluZm8pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0LmNvZGUgPSBDT01NT05fU1RBVFVTLkZBSUw7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3F1ZXJ5IGFzc2V0IGRiIGluZm9zIGZhaWw6JywgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpKTtcclxuICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgQXNzZXQgQnkgVHlwZSAvLyDmjInnsbvlnovliJvlu7rotYTmupBcclxuICAgICAqL1xyXG4gICAgQHRvb2woJ2Fzc2V0cy1jcmVhdGUtYXNzZXQtYnktdHlwZScpXHJcbiAgICBAdGl0bGUoJ0NyZWF0ZSBBc3NldCBCeSBUeXBlJykgLy8g5oyJ57G75Z6L5Yib5bu66LWE5rqQXHJcbiAgICBAZGVzY3JpcHRpb24oJ0NyZWF0ZSBhIG5ldyBhc3NldCBhdCB0aGUgdGFyZ2V0IHBhdGggYmFzZWQgb24gdGhlIHNwZWNpZmllZCBhc3NldCBoYW5kbGVyIHR5cGUuIFN1cHBvcnRzIGNyZWF0aW5nIHZhcmlvdXMgcmVzb3VyY2VzIHN1Y2ggYXMgYW5pbWF0aW9ucywgc2NyaXB0cywgbWF0ZXJpYWxzLCBzY2VuZXMsIHByZWZhYnMsIGV0Yy4gWW91IGNhbiBjdXN0b21pemUgZmlsZSBjb250ZW50LCB0ZW1wbGF0ZSBuYW1lLCBvciBjb250cm9sIHdoZXRoZXIgdG8gb3ZlcndyaXRlIG9yIGF1dG9tYXRpY2FsbHkgcmVuYW1lIHZpYSB0aGUgb3B0aW9ucyBwYXJhbWV0ZXIuIElmIGZpbGUgY29udGVudCBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgYnVpbHQtaW4gZGVmYXVsdCB0ZW1wbGF0ZSBmb3IgdGhlIGNvcnJlc3BvbmRpbmcgdHlwZSB3aWxsIGJlIHVzZWQuJykgLy8g5qC55o2u5oyH5a6a55qE6LWE5rqQ5aSE55CG5Zmo57G75Z6L5Zyo55uu5qCH6Lev5b6E5Yib5bu65paw6LWE5rqQ44CC5pSv5oyB5Yib5bu65Yqo55S744CB6ISa5pys44CB5p2Q6LSo44CB5Zy65pmv44CB6aKE5Yi25L2T562J5ZCE57G76LWE5rqQ44CC5Y+v6YCa6L+HIG9wdGlvbnMg5Y+C5pWw6Ieq5a6a5LmJ5paH5Lu25YaF5a6544CB5qih5p2/5ZCN56ew5oiW6ICF5o6n5Yi25piv5ZCm6KaG55uW44CB6Ieq5Yqo6YeN5ZG95ZCN77yM5pyq5oyH5a6a5paH5Lu25YaF5a655pe25bCG5L2/55So5a+55bqU57G75Z6L55qE5YaF572u6buY6K6k5qih5p2/5Yib5bu644CCXHJcbiAgICBAcmVzdWx0KFNjaGVtYUNyZWF0ZWRBc3NldFJlc3VsdClcclxuICAgIGFzeW5jIGNyZWF0ZUFzc2V0QnlUeXBlKFxyXG4gICAgICAgIEBwYXJhbShTY2hlbWFTdXBwb3J0Q3JlYXRlVHlwZSkgY2NUeXBlOiBUU3VwcG9ydENyZWF0ZVR5cGUsXHJcbiAgICAgICAgQHBhcmFtKFNjaGVtYURpck9yRGJQYXRoKSBkaXJPclVybDogVERpck9yRGJQYXRoLFxyXG4gICAgICAgIEBwYXJhbShTY2hlbWFCYXNlTmFtZSkgYmFzZU5hbWU6IFRCYXNlTmFtZSxcclxuICAgICAgICBAcGFyYW0oU2NoZW1hQ3JlYXRlQXNzZXRCeVR5cGVPcHRpb25zKSBvcHRpb25zPzogVENyZWF0ZUFzc2V0QnlUeXBlT3B0aW9uc1xyXG4gICAgKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRDcmVhdGVkQXNzZXRSZXN1bHQ+PiB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFRDcmVhdGVkQXNzZXRSZXN1bHQ+ID0ge1xyXG4gICAgICAgICAgICBjb2RlOiBjb2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBudWxsLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJldC5kYXRhID0gYXdhaXQgYXNzZXRNYW5hZ2VyLmNyZWF0ZUFzc2V0QnlUeXBlKGNjVHlwZSwgZGlyT3JVcmwsIGJhc2VOYW1lLCBvcHRpb25zKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlICsgZS5zdGFjayA6IFN0cmluZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgQHRvb2woJ2Fzc2V0cy1jcmVhdGUtYXNzZXQnKVxyXG4gICAgQHRpdGxlKCdDcmVhdGUgQXNzZXQnKSAvLyDliJvlu7rotYTmupBcclxuICAgIEBkZXNjcmlwdGlvbignQ3JlYXRlIGFzc2V0IGJhc2VkIG9uIGFjdHVhbCBhZGRyZXNzIGFuZCBmaWxlIGNvbnRlbnQnKSAvLyDmoLnmja7lrp7pmYXlnLDlnYDlkozmlofku7blhoXlrrnliJvlu7rotYTmupBcclxuICAgIEByZXN1bHQoU2NoZW1hQ3JlYXRlZEFzc2V0UmVzdWx0KVxyXG4gICAgYXN5bmMgY3JlYXRlQXNzZXQoXHJcbiAgICAgICAgQHBhcmFtKFNjaGVtYUNyZWF0ZUFzc2V0T3B0aW9ucykgb3B0aW9uczogVENyZWF0ZUFzc2V0T3B0aW9uc1xyXG4gICAgKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRDcmVhdGVkQXNzZXRSZXN1bHQ+PiB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFRDcmVhdGVkQXNzZXRSZXN1bHQ+ID0ge1xyXG4gICAgICAgICAgICBjb2RlOiBjb2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBudWxsLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJldC5kYXRhID0gYXdhaXQgYXNzZXRNYW5hZ2VyLmNyZWF0ZUFzc2V0KG9wdGlvbnMpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0LmNvZGUgPSBDT01NT05fU1RBVFVTLkZBSUw7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgICAgIHJldC5yZWFzb24gPSBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgKyBlLnN0YWNrIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW1wb3J0IEFzc2V0IC8vIOWvvOWFpei1hOa6kFxyXG4gICAgICovXHJcbiAgICBAdG9vbCgnYXNzZXRzLWltcG9ydC1hc3NldCcpXHJcbiAgICBAdGl0bGUoJ0ltcG9ydCBFeHRlcm5hbCBBc3NldCcpIC8vIOWvvOWFpeWklumDqOi1hOa6kFxyXG4gICAgQGRlc2NyaXB0aW9uKCdJbXBvcnQgZXh0ZXJuYWwgYXNzZXQgZmlsZXMgaW50byB0aGUgcHJvamVjdC4gQ29weSBmaWxlcyBmcm9tIHRoZSBzb3VyY2UgcGF0aCB0byB0aGUgdGFyZ2V0IHBhdGgsIGFuZCBhdXRvbWF0aWNhbGx5IGV4ZWN1dGUgdGhlIGFzc2V0IGltcG9ydCBwcm9jZXNzIHRvIGdlbmVyYXRlIC5tZXRhIGZpbGVzIGFuZCBsaWJyYXJ5IGZpbGVzLiBTdWl0YWJsZSBmb3IgaW50cm9kdWNpbmcgaW1hZ2VzLCBhdWRpbywgbW9kZWxzLCBhbmQgb3RoZXIgcmVzb3VyY2VzIGZyb20gb3V0c2lkZS4nKSAvLyDlsIblpJbpg6jotYTmupDmlofku7blr7zlhaXliLDpobnnm67kuK3jgILku47mupDot6/lvoTlpI3liLbmlofku7bliLDnm67moIfot6/lvoTvvIzlubboh6rliqjmiafooYzotYTmupDlr7zlhaXmtYHnqIvvvIznlJ/miJAgLm1ldGEg5paH5Lu25ZKM5bqT5paH5Lu244CC6YCC55So5LqO5LuO5aSW6YOo5byV5YWl5Zu+54mH44CB6Z+z6aKR44CB5qih5Z6L562J6LWE5rqQ44CCXHJcbiAgICBAcmVzdWx0KFNjaGVtYUltcG9ydGVkQXNzZXRSZXN1bHQpXHJcbiAgICBhc3luYyBpbXBvcnRBc3NldChcclxuICAgICAgICBAcGFyYW0oU2NoZW1hU291cmNlUGF0aCkgc291cmNlOiBURGlyT3JEYlBhdGgsXHJcbiAgICAgICAgQHBhcmFtKFNjaGVtYVRhcmdldFBhdGgpIHRhcmdldDogVERpck9yRGJQYXRoLFxyXG4gICAgICAgIEBwYXJhbShTY2hlbWFBc3NldE9wZXJhdGlvbk9wdGlvbikgb3B0aW9ucz86IFRBc3NldE9wZXJhdGlvbk9wdGlvblxyXG4gICAgKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRJbXBvcnRlZEFzc2V0UmVzdWx0Pj4ge1xyXG4gICAgICAgIGNvbnN0IGNvZGU6IEh0dHBTdGF0dXNDb2RlID0gQ09NTU9OX1NUQVRVUy5TVUNDRVNTO1xyXG4gICAgICAgIGNvbnN0IHJldDogQ29tbW9uUmVzdWx0VHlwZTxUSW1wb3J0ZWRBc3NldFJlc3VsdD4gPSB7XHJcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJldC5kYXRhID0gYXdhaXQgYXNzZXRNYW5hZ2VyLmltcG9ydEFzc2V0KHNvdXJjZSwgdGFyZ2V0LCBvcHRpb25zKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdpbXBvcnQgYXNzZXQgZmFpbDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlaW1wb3J0IEFzc2V0IC8vIOmHjeaWsOWvvOWFpei1hOa6kFxyXG4gICAgICovXHJcbiAgICBAdG9vbCgnYXNzZXRzLXJlaW1wb3J0LWFzc2V0JylcclxuICAgIEB0aXRsZSgnUmVpbXBvcnQgQXNzZXQnKSAvLyDph43mlrDlr7zlhaXotYTmupBcclxuICAgIEBkZXNjcmlwdGlvbignRm9yY2UgcmVpbXBvcnQgb2Ygc3BlY2lmaWVkIGFzc2V0cy4gV2hlbiBhc3NldCBmaWxlcyBvciBpbXBvcnQgY29uZmlndXJhdGlvbnMgY2hhbmdlLCBjYWxsIHRoaXMgbWV0aG9kIHRvIHJlLWV4ZWN1dGUgdGhlIGltcG9ydCBwcm9jZXNzIGFuZCB1cGRhdGUgbGlicmFyeSBmaWxlcyBhbmQgYXNzZXQgaW5mb3JtYXRpb24uIENvbW1vbmx5IHVzZWQgZm9yIGFzc2V0IHJlcGFpciBvciByZWZyZXNoIGFmdGVyIGNvbmZpZ3VyYXRpb24gdXBkYXRlcy4nKSAvLyDlvLrliLbph43mlrDlr7zlhaXmjIflrprotYTmupDjgILlvZPotYTmupDmlofku7bmiJblr7zlhaXphY3nva7lj5HnlJ/lj5jljJbml7bvvIzosIPnlKjmraTmlrnms5Xph43mlrDmiafooYzlr7zlhaXmtYHnqIvvvIzmm7TmlrDlupPmlofku7blkozotYTmupDkv6Hmga/jgILluLjnlKjkuo7otYTmupDkv67lpI3miJbphY3nva7mm7TmlrDlkI7nmoTliLfmlrDjgIJcclxuICAgIEByZXN1bHQoU2NoZW1hUmVpbXBvcnRSZXN1bHQpXHJcbiAgICBhc3luYyByZWltcG9ydEFzc2V0KEBwYXJhbShTY2hlbWFVcmxPclVVSURPclBhdGgpIHBhdGhPclVybE9yVVVJRDogVFVybE9yVVVJRE9yUGF0aCk6IFByb21pc2U8Q29tbW9uUmVzdWx0VHlwZTxUUmVpbXBvcnRSZXN1bHQ+PiB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFRSZWltcG9ydFJlc3VsdD4gPSB7XHJcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgYXNzZXRJbmZvID0gYXdhaXQgYXNzZXRNYW5hZ2VyLnJlaW1wb3J0QXNzZXQocGF0aE9yVXJsT3JVVUlEKTtcclxuICAgICAgICAgICAgcmV0LmRhdGEgPSBhc3NldEluZm87XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXQuY29kZSA9IENPTU1PTl9TVEFUVVMuRkFJTDtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSArIGUuc3RhY2sgOiBTdHJpbmcoZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2F2ZSBBc3NldCAvLyDkv53lrZjotYTmupBcclxuICAgICAqL1xyXG4gICAgQHRvb2woJ2Fzc2V0cy1zYXZlLWFzc2V0JylcclxuICAgIEB0aXRsZSgnU2F2ZSBBc3NldCBEYXRhJykgLy8g5L+d5a2Y6LWE5rqQ5pWw5o2uXHJcbiAgICBAZGVzY3JpcHRpb24oJ1NhdmUgdGhlIGNvbnRlbnQgb2YgYXNzZXQgZmlsZXMuIFVzZWQgdG8gbW9kaWZ5IHRoZSBjb250ZW50IG9mIHRleHQtYmFzZWQgYXNzZXRzIChzdWNoIGFzIHNjcmlwdHMsIGNvbmZpZ3VyYXRpb24gZmlsZXMsIHNjZW5lcywgZXRjLikgYW5kIHdyaXRlIHRvIGRpc2suIFN1cHBvcnRzIGJvdGggc3RyaW5nIGFuZCBCdWZmZXIgZGF0YSBmb3JtYXRzLicpIC8vIOS/neWtmOi1hOa6kOaWh+S7tueahOWGheWuueOAgueUqOS6juS/ruaUueaWh+acrOexu+i1hOa6kO+8iOWmguiEmuacrOOAgemFjee9ruaWh+S7tuOAgeWcuuaZr+etie+8ieeahOWGheWuueW5tuWGmeWFpeejgeebmOOAguaUr+aMgeWtl+espuS4suWSjCBCdWZmZXIg5Lik56eN5pWw5o2u5qC85byP44CCXHJcbiAgICBAcmVzdWx0KFNjaGVtYVNhdmVBc3NldFJlc3VsdClcclxuICAgIGFzeW5jIHNhdmVBc3NldChcclxuICAgICAgICBAcGFyYW0oU2NoZW1hVXJsT3JVVUlET3JQYXRoKSBwYXRoT3JVcmxPclVVSUQ6IFRVcmxPclVVSURPclBhdGgsXHJcbiAgICAgICAgQHBhcmFtKFNjaGVtYUFzc2V0RGF0YSkgZGF0YTogVEFzc2V0RGF0YVxyXG4gICAgKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRTYXZlQXNzZXRSZXN1bHQ+PiB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFRTYXZlQXNzZXRSZXN1bHQ+ID0ge1xyXG4gICAgICAgICAgICBjb2RlOiBjb2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBudWxsLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJldC5kYXRhID0gYXdhaXQgYXNzZXRNYW5hZ2VyLnNhdmVBc3NldChwYXRoT3JVcmxPclVVSUQsIGRhdGEpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0LmNvZGUgPSBDT01NT05fU1RBVFVTLkZBSUw7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3NhdmUgYXNzZXQgZmFpbDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFF1ZXJ5IEFzc2V0IFVVSUQgLy8g5p+l6K+i6LWE5rqQIFVVSURcclxuICAgICAqL1xyXG4gICAgQHRvb2woJ2Fzc2V0cy1xdWVyeS11dWlkJylcclxuICAgIEB0aXRsZSgnUXVlcnkgQXNzZXQgVVVJRCcpIC8vIOafpeivoui1hOa6kCBVVUlEXHJcbiAgICBAZGVzY3JpcHRpb24oJ1F1ZXJ5IHRoZSB1bmlxdWUgaWRlbnRpZmllciBVVUlEIG9mIGFuIGFzc2V0IGJhc2VkIG9uIGl0cyBVUkwgb3IgZmlsZSBwYXRoLiBTdXBwb3J0cyBkYjovLyBwcm90b2NvbCBwYXRocyBhbmQgZmlsZSBzeXN0ZW0gcGF0aHMuJykgLy8g5qC55o2u6LWE5rqQ55qEIFVSTCDmiJbmlofku7bot6/lvoTmn6Xor6LotYTmupDnmoTllK/kuIDmoIfor4bnrKYgVVVJROOAguaUr+aMgSBkYjovLyDljY/orq7ot6/lvoTlkozmlofku7bns7vnu5/ot6/lvoTjgIJcclxuICAgIEByZXN1bHQoU2NoZW1hVVVJRFJlc3VsdClcclxuICAgIGFzeW5jIHF1ZXJ5VVVJRChAcGFyYW0oU2NoZW1hVXJsT3JVVUlET3JQYXRoKSB1cmxPclBhdGg6IFRVcmxPclVVSURPclBhdGgpOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8VFVVSURSZXN1bHQ+PiB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFRVVUlEUmVzdWx0PiA9IHtcclxuICAgICAgICAgICAgY29kZTogY29kZSxcclxuICAgICAgICAgICAgZGF0YTogbnVsbCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXQuZGF0YSA9IGFzc2V0TWFuYWdlci5xdWVyeVVVSUQodXJsT3JQYXRoKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdxdWVyeSBVVUlEIGZhaWw6JywgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpKTtcclxuICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBRdWVyeSBBc3NldCBQYXRoIC8vIOafpeivoui1hOa6kOi3r+W+hFxyXG4gICAgICovXHJcbiAgICBAdG9vbCgnYXNzZXRzLXF1ZXJ5LXBhdGgnKVxyXG4gICAgQHRpdGxlKCdRdWVyeSBBc3NldCBGaWxlIFBhdGgnKSAvLyDmn6Xor6LotYTmupDmlofku7bot6/lvoRcclxuICAgIEBkZXNjcmlwdGlvbignUXVlcnkgdGhlIGFjdHVhbCBwYXRoIG9mIGFuIGFzc2V0IGluIHRoZSBmaWxlIHN5c3RlbSBiYXNlZCBvbiBpdHMgVVJMIG9yIFVVSUQuIFJldHVybnMgYW4gYWJzb2x1dGUgcGF0aCBzdHJpbmcuJykgLy8g5qC55o2u6LWE5rqQ55qEIFVSTCDmiJYgVVVJRCDmn6Xor6LotYTmupDlnKjmlofku7bns7vnu5/kuK3nmoTlrp7pmYXot6/lvoTjgILov5Tlm57nu53lr7not6/lvoTlrZfnrKbkuLLjgIJcclxuICAgIEByZXN1bHQoU2NoZW1hUGF0aFJlc3VsdClcclxuICAgIGFzeW5jIHF1ZXJ5UGF0aChAcGFyYW0oU2NoZW1hVXJsT3JVVUlET3JQYXRoKSB1cmxPclV1aWQ6IFRVcmxPclVVSURPclBhdGgpOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8VFBhdGhSZXN1bHQ+PiB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFRQYXRoUmVzdWx0PiA9IHtcclxuICAgICAgICAgICAgY29kZTogY29kZSxcclxuICAgICAgICAgICAgZGF0YTogbnVsbCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXQuZGF0YSA9IGFzc2V0TWFuYWdlci5xdWVyeVBhdGgodXJsT3JVdWlkKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdxdWVyeSBwYXRoIGZhaWw6JywgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpKTtcclxuICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBRdWVyeSBBc3NldCBVUkwgLy8g5p+l6K+i6LWE5rqQIFVSTFxyXG4gICAgICovXHJcbiAgICBAdG9vbCgnYXNzZXRzLXF1ZXJ5LXVybCcpXHJcbiAgICBAdGl0bGUoJ1F1ZXJ5IEFzc2V0IFVSTCcpIC8vIOafpeivoui1hOa6kCBVUkxcclxuICAgIEBkZXNjcmlwdGlvbignUXVlcnkgdGhlIFVSTCBhZGRyZXNzIG9mIGFuIGFzc2V0IGluIHRoZSBkYXRhYmFzZSBiYXNlZCBvbiBpdHMgZmlsZSBwYXRoIG9yIFVVSUQuIFJldHVybnMgYSBVUkwgaW4gZGI6Ly8gcHJvdG9jb2wgZm9ybWF0LicpIC8vIOagueaNrui1hOa6kOeahOaWh+S7tui3r+W+hOaIliBVVUlEIOafpeivoui1hOa6kOWcqOaVsOaNruW6k+S4reeahCBVUkwg5Zyw5Z2A44CC6L+U5ZueIGRiOi8vIOWNj+iuruagvOW8j+eahCBVUkzjgIJcclxuICAgIEByZXN1bHQoU2NoZW1hVXJsUmVzdWx0KVxyXG4gICAgYXN5bmMgcXVlcnlVcmwoQHBhcmFtKFNjaGVtYVVybE9yVVVJRE9yUGF0aCkgdXVpZE9yUGF0aDogVFVybE9yVVVJRE9yUGF0aCk6IFByb21pc2U8Q29tbW9uUmVzdWx0VHlwZTxUVXJsUmVzdWx0Pj4ge1xyXG4gICAgICAgIGNvbnN0IGNvZGU6IEh0dHBTdGF0dXNDb2RlID0gQ09NTU9OX1NUQVRVUy5TVUNDRVNTO1xyXG4gICAgICAgIGNvbnN0IHJldDogQ29tbW9uUmVzdWx0VHlwZTxUVXJsUmVzdWx0PiA9IHtcclxuICAgICAgICAgICAgY29kZTogY29kZSxcclxuICAgICAgICAgICAgZGF0YTogbnVsbCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXQuZGF0YSA9IGFzc2V0TWFuYWdlci5xdWVyeVVybCh1dWlkT3JQYXRoKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdxdWVyeSBVUkwgZmFpbDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFF1ZXJ5IEFzc2V0IERlcGVuZGVuY2llcyAvLyDmn6Xor6LotYTmupDkvp3otZZcclxuICAgICAqL1xyXG4gICAgLy8gQHRvb2woJ2Fzc2V0cy1xdWVyeS1hc3NldC1kZXBlbmRlbmNpZXMnKVxyXG4gICAgQHRpdGxlKCdRdWVyeSBBc3NldCBEZXBlbmRlbmNpZXMnKSAvLyDmn6Xor6LotYTmupDkvp3otZZcclxuICAgIEBkZXNjcmlwdGlvbignUXVlcnkgdGhlIGxpc3Qgb2Ygb3RoZXIgYXNzZXRzIHRoYXQgdGhlIHNwZWNpZmllZCBhc3NldCBkZXBlbmRzIG9uLiBTdXBwb3J0cyBxdWVyeWluZyBub3JtYWwgYXNzZXQgZGVwZW5kZW5jaWVzLCBzY3JpcHQgZGVwZW5kZW5jaWVzLCBvciBhbGwgZGVwZW5kZW5jaWVzLicpIC8vIOafpeivouaMh+Wumui1hOa6kOaJgOS+nei1lueahOWFtuS7lui1hOa6kOWIl+ihqOOAguaUr+aMgeafpeivouaZrumAmui1hOa6kOS+nei1luOAgeiEmuacrOS+nei1luaIluWFqOmDqOS+nei1luOAglxyXG4gICAgQHJlc3VsdCh6LmFycmF5KHouc3RyaW5nKCkpLmRlc2NyaWJlKCdMaXN0IG9mIGRlcGVuZGVudCBhc3NldCBVVUlEcycpKSAvLyDkvp3otZbotYTmupDnmoQgVVVJRCDliJfooahcclxuICAgIGFzeW5jIHF1ZXJ5QXNzZXREZXBlbmRlbmNpZXMoXHJcbiAgICAgICAgQHBhcmFtKFNjaGVtYVVybE9yVVVJRE9yUGF0aCkgdXVpZE9yVXJsOiBUVXJsT3JVVUlET3JQYXRoLFxyXG4gICAgICAgIEBwYXJhbShTY2hlbWFRdWVyeUFzc2V0VHlwZSkgdHlwZTogVFF1ZXJ5QXNzZXRUeXBlID0gJ2Fzc2V0J1xyXG4gICAgKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPHN0cmluZ1tdPj4ge1xyXG4gICAgICAgIGNvbnN0IGNvZGU6IEh0dHBTdGF0dXNDb2RlID0gQ09NTU9OX1NUQVRVUy5TVUNDRVNTO1xyXG4gICAgICAgIGNvbnN0IHJldDogQ29tbW9uUmVzdWx0VHlwZTxzdHJpbmdbXT4gPSB7XHJcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJldC5kYXRhID0gYXdhaXQgYXNzZXRNYW5hZ2VyLnF1ZXJ5QXNzZXREZXBlbmRlbmNpZXModXVpZE9yVXJsLCB0eXBlKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdxdWVyeSBhc3NldCBkZXBlbmRlbmNpZXMgZmFpbDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFF1ZXJ5IEFzc2V0IFVzZXJzIC8vIOafpeivoui1hOa6kOS9v+eUqOiAhVxyXG4gICAgICovXHJcbiAgICAvLyBAdG9vbCgnYXNzZXRzLXF1ZXJ5LWFzc2V0LXVzZXJzJylcclxuICAgIEB0aXRsZSgnUXVlcnkgQXNzZXQgVXNlcnMnKSAvLyDmn6Xor6LotYTmupDkvb/nlKjogIVcclxuICAgIEBkZXNjcmlwdGlvbignUXVlcnkgdGhlIGxpc3Qgb2Ygb3RoZXIgYXNzZXRzIHRoYXQgdXNlIHRoZSBzcGVjaWZpZWQgYXNzZXQuIFN1cHBvcnRzIHF1ZXJ5aW5nIG5vcm1hbCBhc3NldCB1c2Vycywgc2NyaXB0IHVzZXJzLCBvciBhbGwgdXNlcnMuJykgLy8g5p+l6K+i5L2/55So5oyH5a6a6LWE5rqQ55qE5YW25LuW6LWE5rqQ5YiX6KGo44CC5pSv5oyB5p+l6K+i5pmu6YCa6LWE5rqQ5L2/55So6ICF44CB6ISa5pys5L2/55So6ICF5oiW5YWo6YOo5L2/55So6ICF44CCXHJcbiAgICBAcmVzdWx0KHouYXJyYXkoei5zdHJpbmcoKSkuZGVzY3JpYmUoJ0xpc3Qgb2YgYXNzZXQgVVVJRHMgdXNpbmcgdGhpcyBhc3NldCcpKSAvLyDkvb/nlKjor6XotYTmupDnmoTotYTmupAgVVVJRCDliJfooahcclxuICAgIGFzeW5jIHF1ZXJ5QXNzZXRVc2VycyhcclxuICAgICAgICBAcGFyYW0oU2NoZW1hVXJsT3JVVUlET3JQYXRoKSB1dWlkT3JVcmw6IFRVcmxPclVVSURPclBhdGgsXHJcbiAgICAgICAgQHBhcmFtKFNjaGVtYVF1ZXJ5QXNzZXRUeXBlKSB0eXBlOiBUUXVlcnlBc3NldFR5cGUgPSAnYXNzZXQnXHJcbiAgICApOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8c3RyaW5nW10+PiB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPHN0cmluZ1tdPiA9IHtcclxuICAgICAgICAgICAgY29kZTogY29kZSxcclxuICAgICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmV0LmRhdGEgPSBhd2FpdCBhc3NldE1hbmFnZXIucXVlcnlBc3NldFVzZXJzKHV1aWRPclVybCwgdHlwZSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXQuY29kZSA9IENPTU1PTl9TVEFUVVMuRkFJTDtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcigncXVlcnkgYXNzZXQgdXNlcnMgZmFpbDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFF1ZXJ5IFNvcnRlZCBQbHVnaW4gU2NyaXB0cyAvLyDmn6Xor6LmjpLluo/lkI7nmoTmj5Lku7bohJrmnKxcclxuICAgICAqL1xyXG4gICAgLy8gQHRvb2woJ2Fzc2V0cy1xdWVyeS1zb3J0ZWQtcGx1Z2lucycpXHJcbiAgICBAdGl0bGUoJ1F1ZXJ5IFNvcnRlZCBQbHVnaW4gU2NyaXB0cycpIC8vIOafpeivouaOkuW6j+WQjueahOaPkuS7tuiEmuacrFxyXG4gICAgQGRlc2NyaXB0aW9uKCdRdWVyeSB0aGUgc29ydGVkIGxpc3Qgb2YgYWxsIHBsdWdpbiBzY3JpcHRzIGluIHRoZSBwcm9qZWN0LiBTdXBwb3J0cyBmaWx0ZXJpbmcgcGx1Z2luIHNjcmlwdHMgYnkgcGxhdGZvcm0uJykgLy8g5p+l6K+i6aG555uu5Lit5omA5pyJ5o+S5Lu26ISa5pys55qE5o6S5bqP5YiX6KGo44CC5pSv5oyB5oyJ5bmz5Y+w562b6YCJ5o+S5Lu26ISa5pys44CCXHJcbiAgICBAcmVzdWx0KHouYXJyYXkoU2NoZW1hUGx1Z2luU2NyaXB0SW5mbykuZGVzY3JpYmUoJ0xpc3Qgb2YgcGx1Z2luIHNjcmlwdCBpbmZvcm1hdGlvbicpKSAvLyDmj5Lku7bohJrmnKzkv6Hmga/liJfooahcclxuICAgIGFzeW5jIHF1ZXJ5U29ydGVkUGx1Z2lucyhcclxuICAgICAgICBAcGFyYW0oU2NoZW1hRmlsdGVyUGx1Z2luT3B0aW9ucykgZmlsdGVyT3B0aW9uczogVEZpbHRlclBsdWdpbk9wdGlvbnMgPSB7fVxyXG4gICAgKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRQbHVnaW5TY3JpcHRJbmZvW10+PiB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFRQbHVnaW5TY3JpcHRJbmZvW10+ID0ge1xyXG4gICAgICAgICAgICBjb2RlOiBjb2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXQuZGF0YSA9IGFzc2V0TWFuYWdlci5xdWVyeVNvcnRlZFBsdWdpbnMoZmlsdGVyT3B0aW9ucyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXQuY29kZSA9IENPTU1PTl9TVEFUVVMuRkFJTDtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcigncXVlcnkgc29ydGVkIHBsdWdpbnMgZmFpbDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbmFtZSBBc3NldCAvLyDph43lkb3lkI3otYTmupBcclxuICAgICAqL1xyXG4gICAgQHRvb2woJ2Fzc2V0cy1yZW5hbWUtYXNzZXQnKVxyXG4gICAgQHRpdGxlKCdSZW5hbWUgQXNzZXQnKSAvLyDph43lkb3lkI3otYTmupBcclxuICAgIEBkZXNjcmlwdGlvbignUmVuYW1lIHRoZSBzcGVjaWZpZWQgYXNzZXQgZmlsZS4gU3VwcG9ydHMgcmVuYW1pbmcgZmlsZXMgYW5kIGZvbGRlcnMsIHdpdGggb3B0aW9ucyB0byBvdmVyd3JpdGUgb3IgYXV0b21hdGljYWxseSByZW5hbWUuJykgLy8g6YeN5ZG95ZCN5oyH5a6a55qE6LWE5rqQ5paH5Lu244CC5pSv5oyB6YeN5ZG95ZCN5paH5Lu25ZKM5paH5Lu25aS577yM5Y+v6YCJ5oup5piv5ZCm6KaG55uW5oiW6Ieq5Yqo6YeN5ZG95ZCN44CCXHJcbiAgICBAcmVzdWx0KFNjaGVtYUFzc2V0SW5mb1Jlc3VsdClcclxuICAgIGFzeW5jIHJlbmFtZUFzc2V0KFxyXG4gICAgICAgIEBwYXJhbShTY2hlbWFVcmxPclVVSURPclBhdGgpIHNvdXJjZTogVERpck9yRGJQYXRoLFxyXG4gICAgICAgIEBwYXJhbShTY2hlbWFVcmxPclVVSURPclBhdGgpIHRhcmdldDogVERpck9yRGJQYXRoLFxyXG4gICAgICAgIEBwYXJhbShTY2hlbWFBc3NldFJlbmFtZU9wdGlvbnMpIG9wdGlvbnM6IFRBc3NldFJlbmFtZU9wdGlvbnMgPSB7fVxyXG4gICAgKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRBc3NldEluZm9SZXN1bHQ+PiB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFRBc3NldEluZm9SZXN1bHQ+ID0ge1xyXG4gICAgICAgICAgICBjb2RlOiBjb2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBudWxsLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJldC5kYXRhID0gYXdhaXQgYXNzZXRNYW5hZ2VyLnJlbmFtZUFzc2V0KHNvdXJjZSwgdGFyZ2V0LCBvcHRpb25zKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdyZW5hbWUgYXNzZXQgZmFpbDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1vdmUgQXNzZXQgLy8g56e75Yqo6LWE5rqQXHJcbiAgICAgKi9cclxuICAgIEB0b29sKCdhc3NldHMtbW92ZS1hc3NldCcpXHJcbiAgICBAdGl0bGUoJ01vdmUgQXNzZXQnKSAvLyDnp7vliqjotYTmupBcclxuICAgIEBkZXNjcmlwdGlvbignTW92ZSBhc3NldHMgZnJvbSB0aGUgc291cmNlIGxvY2F0aW9uIHRvIHRoZSB0YXJnZXQgbG9jYXRpb24uIFN1cHBvcnRzIG1vdmluZyBmaWxlcyBhbmQgZm9sZGVycywgd2l0aCBvcHRpb25zIHRvIG92ZXJ3cml0ZSBvciBhdXRvbWF0aWNhbGx5IHJlbmFtZS4nKSAvLyDlsIbotYTmupDku47mupDkvY3nva7np7vliqjliLDnm67moIfkvY3nva7jgILmlK/mjIHnp7vliqjmlofku7blkozmlofku7blpLnvvIzlj6/pgInmi6nmmK/lkKbopobnm5bmiJboh6rliqjph43lkb3lkI3jgIJcclxuICAgIEByZXN1bHQoU2NoZW1hQXNzZXRJbmZvUmVzdWx0KVxyXG4gICAgYXN5bmMgbW92ZUFzc2V0KFxyXG4gICAgICAgIEBwYXJhbShTY2hlbWFVcmxPclVVSURPclBhdGgpIHNvdXJjZTogVERpck9yRGJQYXRoLFxyXG4gICAgICAgIEBwYXJhbShTY2hlbWFVcmxPclVVSURPclBhdGgpIHRhcmdldDogVERpck9yRGJQYXRoLFxyXG4gICAgICAgIEBwYXJhbShTY2hlbWFBc3NldE1vdmVPcHRpb25zKSBvcHRpb25zOiBUQXNzZXRNb3ZlT3B0aW9ucyA9IHt9XHJcbiAgICApOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8VEFzc2V0SW5mb1Jlc3VsdD4+IHtcclxuICAgICAgICBjb25zdCBjb2RlOiBIdHRwU3RhdHVzQ29kZSA9IENPTU1PTl9TVEFUVVMuU1VDQ0VTUztcclxuICAgICAgICBjb25zdCByZXQ6IENvbW1vblJlc3VsdFR5cGU8VEFzc2V0SW5mb1Jlc3VsdD4gPSB7XHJcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmV0LmRhdGEgPSBhd2FpdCBhc3NldE1hbmFnZXIubW92ZUFzc2V0KHNvdXJjZSwgdGFyZ2V0LCBvcHRpb25zKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdtb3ZlIGFzc2V0IGZhaWw6JywgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpKTtcclxuICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgRGVmYXVsdCBVc2VyIERhdGEgLy8g5pu05paw6buY6K6k55So5oi35pWw5o2uXHJcbiAgICAgKi9cclxuICAgIEB0b29sKCdhc3NldHMtdXBkYXRlLWRlZmF1bHQtdXNlci1kYXRhJylcclxuICAgIEB0aXRsZSgnVXBkYXRlIERlZmF1bHQgVXNlciBEYXRhJykgLy8g5pu05paw6buY6K6k55So5oi35pWw5o2uXHJcbiAgICBAZGVzY3JpcHRpb24oJ1VwZGF0ZSB0aGUgZGVmYXVsdCB1c2VyIGRhdGEgY29uZmlndXJhdGlvbiBmb3IgdGhlIHNwZWNpZmllZCBhc3NldCBoYW5kbGVyLiBVc2VkIHRvIG1vZGlmeSB0aGUgZGVmYXVsdCBpbXBvcnQgc2V0dGluZ3MgZm9yIGFzc2V0cy4nKSAvLyDmm7TmlrDmjIflrprotYTmupDlpITnkIblmajnmoTpu5jorqTnlKjmiLfmlbDmja7phY3nva7jgILnlKjkuo7kv67mlLnotYTmupDnmoTpu5jorqTlr7zlhaXorr7nva7jgIJcclxuICAgIEByZXN1bHQoei5udWxsKCkuZGVzY3JpYmUoJ1VwZGF0ZSBvcGVyYXRpb24gcmVzdWx0IChubyByZXR1cm4gdmFsdWUpJykpIC8vIOabtOaWsOaTjeS9nOe7k+aenO+8iOaXoOi/lOWbnuWAvO+8iVxyXG4gICAgYXN5bmMgdXBkYXRlRGVmYXVsdFVzZXJEYXRhKFxyXG4gICAgICAgIEBwYXJhbShTY2hlbWFVc2VyRGF0YUhhbmRsZXIpIGhhbmRsZXI6IFRVc2VyRGF0YUhhbmRsZXIsXHJcbiAgICAgICAgQHBhcmFtKFNjaGVtYVVwZGF0ZUFzc2V0VXNlckRhdGFQYXRoKSBwYXRoOiBUVXBkYXRlQXNzZXRVc2VyRGF0YVBhdGgsXHJcbiAgICAgICAgQHBhcmFtKFNjaGVtYVVwZGF0ZUFzc2V0VXNlckRhdGFWYWx1ZSkgdmFsdWU6IFRVcGRhdGVBc3NldFVzZXJEYXRhVmFsdWVcclxuICAgICk6IFByb21pc2U8Q29tbW9uUmVzdWx0VHlwZTxudWxsPj4ge1xyXG4gICAgICAgIGNvbnN0IGNvZGU6IEh0dHBTdGF0dXNDb2RlID0gQ09NTU9OX1NUQVRVUy5TVUNDRVNTO1xyXG4gICAgICAgIGNvbnN0IHJldDogQ29tbW9uUmVzdWx0VHlwZTxudWxsPiA9IHtcclxuICAgICAgICAgICAgY29kZTogY29kZSxcclxuICAgICAgICAgICAgZGF0YTogbnVsbCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldE1hbmFnZXIudXBkYXRlRGVmYXVsdFVzZXJEYXRhKGhhbmRsZXIsIHBhdGgsIHZhbHVlKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCd1cGRhdGUgZGVmYXVsdCB1c2VyIGRhdGEgZmFpbDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFF1ZXJ5IEFzc2V0IFVzZXIgRGF0YSBDb25maWcgLy8g5p+l6K+i6LWE5rqQ55So5oi35pWw5o2u6YWN572uXHJcbiAgICAgKi9cclxuICAgIEB0b29sKCdhc3NldHMtcXVlcnktYXNzZXQtdXNlci1kYXRhLWNvbmZpZycpXHJcbiAgICBAdGl0bGUoJ1F1ZXJ5IEFzc2V0IFVzZXIgRGF0YSBDb25maWcnKSAvLyDmn6Xor6LotYTmupDnlKjmiLfmlbDmja7phY3nva5cclxuICAgIEBkZXNjcmlwdGlvbignUXVlcnkgdGhlIHVzZXIgZGF0YSBjb25maWd1cmF0aW9uIGluZm9ybWF0aW9uIG9mIHRoZSBzcGVjaWZpZWQgYXNzZXQuIFJldHVybnMgdGhlIGFzc2V0XFwncyBpbXBvcnQgY29uZmlndXJhdGlvbiBhbmQgdXNlci1kZWZpbmVkIGRhdGEuJykgLy8g5p+l6K+i5oyH5a6a6LWE5rqQ55qE55So5oi35pWw5o2u6YWN572u5L+h5oGv44CC6L+U5Zue6LWE5rqQ55qE5a+85YWl6YWN572u5ZKM55So5oi36Ieq5a6a5LmJ5pWw5o2u44CCXHJcbiAgICBAcmVzdWx0KHouYW55KCkubnVsbGFibGUoKS5kZXNjcmliZSgnQXNzZXQgdXNlciBkYXRhIGNvbmZpZ3VyYXRpb24gb2JqZWN0JykpIC8vIOi1hOa6kOeUqOaIt+aVsOaNrumFjee9ruWvueixoVxyXG4gICAgYXN5bmMgcXVlcnlBc3NldFVzZXJEYXRhQ29uZmlnKFxyXG4gICAgICAgIEBwYXJhbShTY2hlbWFVcmxPclVVSURPclBhdGgpIHVybE9yVXVpZE9yUGF0aDogVFVybE9yVVVJRE9yUGF0aFxyXG4gICAgKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPGFueT4+IHtcclxuICAgICAgICBjb25zdCBjb2RlOiBIdHRwU3RhdHVzQ29kZSA9IENPTU1PTl9TVEFUVVMuU1VDQ0VTUztcclxuICAgICAgICBjb25zdCByZXQ6IENvbW1vblJlc3VsdFR5cGU8YW55PiA9IHtcclxuICAgICAgICAgICAgY29kZTogY29kZSxcclxuICAgICAgICAgICAgZGF0YTogbnVsbCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBhc3NldCA9IGFzc2V0TWFuYWdlci5xdWVyeUFzc2V0KHVybE9yVXVpZE9yUGF0aCk7XHJcbiAgICAgICAgICAgIGlmIChhc3NldCkge1xyXG4gICAgICAgICAgICAgICAgcmV0LmRhdGEgPSBhd2FpdCBhc3NldE1hbmFnZXIucXVlcnlBc3NldFVzZXJEYXRhQ29uZmlnKGFzc2V0KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldC5yZWFzb24gPSBg4p2MQXNzZXQgY2FuIG5vdCBiZSBmb3VuZDogJHt1cmxPclV1aWRPclBhdGh9YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0LmNvZGUgPSBDT01NT05fU1RBVFVTLkZBSUw7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3F1ZXJ5IGFzc2V0IHVzZXIgZGF0YSBjb25maWcgZmFpbDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZSBBc3NldCBVc2VyIERhdGEgLy8g5pu05paw6LWE5rqQ55So5oi35pWw5o2uXHJcbiAgICAgKi9cclxuICAgIEB0b29sKCdhc3NldHMtdXBkYXRlLWFzc2V0LXVzZXItZGF0YScpXHJcbiAgICBAdGl0bGUoJ1VwZGF0ZSBBc3NldCBVc2VyIERhdGEnKSAvLyDmm7TmlrDotYTmupDnlKjmiLfmlbDmja5cclxuICAgIEBkZXNjcmlwdGlvbignVXBkYXRlIHRoZSB1c2VyIGRhdGEgY29uZmlndXJhdGlvbiBvZiB0aGUgc3BlY2lmaWVkIGFzc2V0LiBQcmVjaXNlbHkgdXBkYXRlIHRoZSBhc3NldFxcJ3MgdXNlciBkYXRhIHZpYSBwYXRoIGFuZCB2YWx1ZSwgc3VwcG9ydGluZyBuZXN0ZWQgcGF0aCBhY2Nlc3MuJykgLy8g5pu05paw5oyH5a6a6LWE5rqQ55qE55So5oi35pWw5o2u6YWN572u44CC6YCa6L+H6Lev5b6E5ZKM5YC85p2l57K+56Gu5pu05paw6LWE5rqQ55qE55So5oi35pWw5o2u77yM5pSv5oyB5bWM5aWX6Lev5b6E6K6/6Zeu44CCXHJcbiAgICBAcmVzdWx0KFNjaGVtYVVwZGF0ZUFzc2V0VXNlckRhdGFSZXN1bHQpXHJcbiAgICBhc3luYyB1cGRhdGVBc3NldFVzZXJEYXRhKFxyXG4gICAgICAgIEBwYXJhbShTY2hlbWFVcmxPclVVSURPclBhdGgpIHVybE9yVXVpZE9yUGF0aDogVFVybE9yVVVJRE9yUGF0aCxcclxuICAgICAgICBAcGFyYW0oU2NoZW1hVXBkYXRlQXNzZXRVc2VyRGF0YVBhdGgpIHBhdGg6IFRVcGRhdGVBc3NldFVzZXJEYXRhUGF0aCxcclxuICAgICAgICBAcGFyYW0oU2NoZW1hVXBkYXRlQXNzZXRVc2VyRGF0YVZhbHVlKSB2YWx1ZTogVFVwZGF0ZUFzc2V0VXNlckRhdGFWYWx1ZVxyXG4gICAgKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRVcGRhdGVBc3NldFVzZXJEYXRhUmVzdWx0Pj4ge1xyXG4gICAgICAgIGNvbnN0IGNvZGU6IEh0dHBTdGF0dXNDb2RlID0gQ09NTU9OX1NUQVRVUy5TVUNDRVNTO1xyXG4gICAgICAgIGNvbnN0IHJldDogQ29tbW9uUmVzdWx0VHlwZTxUVXBkYXRlQXNzZXRVc2VyRGF0YVJlc3VsdD4gPSB7XHJcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmV0LmRhdGEgPSBhd2FpdCBhc3NldE1hbmFnZXIudXBkYXRlVXNlckRhdGEodXJsT3JVdWlkT3JQYXRoLCBwYXRoLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmICghcmV0LmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHJldC5yZWFzb24gPSBg4p2MQXNzZXQgY2FuIG5vdCBiZSBmb3VuZDogJHt1cmxPclV1aWRPclBhdGh9YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0LmNvZGUgPSBDT01NT05fU1RBVFVTLkZBSUw7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3VwZGF0ZSBhc3NldCB1c2VyIGRhdGEgZmFpbDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFF1ZXJ5IEFzc2V0IENvbmZpZyBNYXAgLy8g5p+l6K+i6LWE5rqQ6YWN572u5pig5bCE6KGoXHJcbiAgICAgKi9cclxuICAgIC8vIEB0b29sKCdhc3NldHMtcXVlcnktYXNzZXQtY29uZmlnLW1hcCcpXHJcbiAgICBAdGl0bGUoJ1F1ZXJ5IEFzc2V0IENvbmZpZyBNYXAnKSAvLyDmn6Xor6LotYTmupDphY3nva7mmKDlsITooahcclxuICAgIEBkZXNjcmlwdGlvbignUXVlcnkgdGhlIGJhc2ljIGNvbmZpZ3VyYXRpb24gbWFwcGluZyB0YWJsZSBmb3IgZWFjaCBhc3NldCBoYW5kbGVyLiBSZXR1cm5zIGEgbWFwcGluZyB0YWJsZSBjb250YWluaW5nIGNvbmZpZ3VyYXRpb24gaW5mb3JtYXRpb24gc3VjaCBhcyBhc3NldCBkaXNwbGF5IG5hbWUsIGRlc2NyaXB0aW9uLCBkb2N1bWVudGF0aW9uIFVSTCwgdXNlciBkYXRhIGNvbmZpZ3VyYXRpb24sIGljb24gaW5mb3JtYXRpb24sIGV0Yy4nKSAvLyDmn6Xor6LlkITkuKrotYTmupDlpITnkIblmajnmoTln7rmnKzphY3nva7mmKDlsITooajjgILov5Tlm57ljIXlkKvotYTmupDmmL7npLrlkI3np7DjgIHmj4/ov7DjgIHmlofmoaNVUkzjgIHnlKjmiLfmlbDmja7phY3nva7jgIHlm77moIfkv6Hmga/nrYnphY3nva7kv6Hmga/nmoTmmKDlsITooajjgIJcclxuICAgIEByZXN1bHQoU2NoZW1hQXNzZXRDb25maWdNYXBSZXN1bHQpXHJcbiAgICBhc3luYyBxdWVyeUFzc2V0Q29uZmlnTWFwKCk6IFByb21pc2U8Q29tbW9uUmVzdWx0VHlwZTxUQXNzZXRDb25maWdNYXBSZXN1bHQ+PiB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFRBc3NldENvbmZpZ01hcFJlc3VsdD4gPSB7XHJcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IHt9LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJldC5kYXRhID0gYXdhaXQgYXNzZXRNYW5hZ2VyLnF1ZXJ5QXNzZXRDb25maWdNYXAoKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdxdWVyeSBhc3NldCBjb25maWcgbWFwIGZhaWw6JywgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpKTtcclxuICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcbn1cclxuIl19