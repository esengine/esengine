'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderAssetCache = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const index_1 = require("../utils/index");
const asset_library_1 = require("./asset-library");
const cconb_1 = require("../utils/cconb");
const asset_1 = __importDefault(require("../../../../assets/manager/asset"));
const builder_config_1 = __importDefault(require("../../../share/builder-config"));
/**
 * 资源管理器，主要负责资源的缓存查询缓存等
 * 所有 __ 开头的属性方法都不对外公开
 */
class BuilderAssetCache {
    // 场景资源信息
    scenes = [];
    // 脚本资源信息缓存
    scriptUuids = [];
    // 其他资源信息缓存，不包含场景和脚本
    assetUuids = [];
    // 资源反序列化之后的结果
    instanceMap = {};
    _task;
    constructor(task) {
        this._task = task;
    }
    /**
     * 初始化
     */
    async init() {
        await asset_library_1.buildAssetLibrary.init();
    }
    /**
     * 查询某个 uuid 是否存在
     * @param uuid
     * @returns
     */
    async hasAsset(uuid) {
        return !!(this.assetUuids.includes(uuid) || this.scriptUuids.includes(uuid) || this.scenes.find(item => item.uuid === uuid));
    }
    /**
     * 添加一个资源到缓存
     * @param asset
     */
    addAsset(asset, type) {
        // @ts-ignore
        if (asset.invalid || asset.url.startsWith('db://internal/default_file_content')) {
            return;
        }
        // HACK 3.9.0 此接口入参接收参数格式有变动，暂时先兼容
        if (!asset._assetDB) {
            console.warn('The addAsset method no longer supports the AssetInfo type, so please pass parameters that conform to the IAsset interface definition.');
            asset = asset_library_1.buildAssetLibrary.getAsset(asset.uuid);
        }
        const ccType = type || asset_1.default.queryAssetProperty(asset, 'type');
        // 分类到指定的位置
        switch (ccType) {
            case 'cc.SceneAsset':
                this.scenes.push({
                    uuid: asset.uuid,
                    url: asset.url,
                });
                break;
            case 'cc.Script':
                // hack 过滤特殊的声明文件，过滤资源模板内的脚本
                if (asset.url.toLowerCase().endsWith('.d.ts')) {
                    break;
                }
                this.scriptUuids.push(asset.uuid);
                break;
            default:
                if (asset.meta.files.includes('.json') || (0, cconb_1.hasCCONFormatAssetInLibrary)(asset)) {
                    this.assetUuids.push(asset.uuid);
                }
        }
    }
    /**
     * 删除一个资源的缓存
     */
    removeAsset(uuid, type) {
        const asset = asset_library_1.buildAssetLibrary.getAsset(uuid);
        if (!asset) {
            return;
        }
        const assetType = type || asset_1.default.queryAssetProperty(asset, 'type');
        switch (assetType) {
            case 'cc.SceneAsset':
                for (let i = 0; i < this.scenes.length; i++) {
                    if (this.scenes[i].uuid === uuid) {
                        this.scenes.splice(i, 1);
                        return;
                    }
                }
                break;
            case 'cc.Script':
                for (let i = 0; i < this.scriptUuids.length; i++) {
                    if (this.scriptUuids[i] === uuid) {
                        this.scriptUuids.splice(i, 1);
                        return;
                    }
                }
                break;
            default:
                (0, index_1.recursively)(asset, (asset) => {
                    if (asset.meta.files.includes('.json') || (0, cconb_1.hasCCONFormatAssetInLibrary)(asset)) {
                        for (let i = 0; i < this.assetUuids.length; i++) {
                            if (this.assetUuids[i] === asset.uuid) {
                                this.assetUuids.splice(i, 1);
                                return;
                            }
                        }
                    }
                });
        }
    }
    /**
     * 查询指定 uuid 的资源信息
     * @param uuid
     */
    getAssetInfo(uuid) {
        return asset_library_1.buildAssetLibrary.getAssetInfo(uuid);
    }
    /**
     * 添加或修改一个实例化对象到缓存
     * @param instance
     */
    addInstance(instance) {
        if (!instance || !instance._uuid) {
            return;
        }
        this.instanceMap[instance._uuid] = instance;
    }
    /**
     * 删除一个资源的缓存
     * @param uuid
     */
    clearAsset(uuid) {
        this.scenes.length = 0;
        this.scriptUuids.length = 0;
        this.assetUuids.length = 0;
        delete this.instanceMap[uuid];
    }
    /**
     * 查询一个资源的 meta 数据
     * @param uuid
     */
    getMeta(uuid) {
        return asset_library_1.buildAssetLibrary.getMeta(uuid);
    }
    async addMeta(uuid, meta) {
        asset_library_1.buildAssetLibrary.addMeta(uuid, meta);
    }
    /**
     * 获取指定 uuid 资源的依赖资源 uuid 列表
     * @param uuid
     */
    async getDependUuids(uuid) {
        return await asset_library_1.buildAssetLibrary.getDependUuids(uuid);
    }
    /**
     * 深度获取指定 uuid 资源的依赖资源 uuid 列表
     * @param uuid
     */
    async getDependUuidsDeep(uuid) {
        return await asset_library_1.buildAssetLibrary.getDependUuidsDeep(uuid);
    }
    /**
     *
     * 获取指定 uuid 资源在 library 内的序列化 JSON 内容
     * @param uuid
     */
    async getLibraryJSON(uuid) {
        const asset = asset_library_1.buildAssetLibrary.getAsset(uuid);
        if (!asset || !asset.meta.files.includes('.json')) {
            return null;
        }
        // 不需要缓存 json 数据
        return await (0, fs_extra_1.readJSON)(asset.library + '.json');
    }
    /**
     * 获取指定 uuid 资源的重新序列化后的 JSON 内容（最终输出）
     * @param uuid
     * @param options
     */
    async getSerializedJSON(uuid, options) {
        const instance = this.instanceMap[uuid];
        let jsonObject;
        // 优先使用 cache 中的缓存数据生成序列化文件
        if (instance) {
            jsonObject = asset_library_1.buildAssetLibrary.serialize(instance, options);
        }
        else {
            jsonObject = await asset_library_1.buildAssetLibrary.getSerializedJSON(uuid, options);
        }
        return jsonObject ? jsonObject : null;
    }
    /**
     * 直接输出某个资源序列化 JSON 到指定包内
     * @param uuid
     * @param destDir
     * @param options
     */
    async outputAssetJson(uuid, destDir, options) {
        const asset = asset_library_1.buildAssetLibrary.getAsset(uuid);
        const instance = this.instanceMap[uuid];
        if (!instance && !asset) {
            return;
        }
        if (!instance) {
            const dest = (0, path_1.join)(destDir, uuid.substr(0, 2), uuid + '.json');
            await asset_library_1.buildAssetLibrary.outputAssets(uuid, dest, options.debug);
        }
        else {
            // 正常资源的输出路径需要以 library 内的输出路径为准，不可直接拼接，比如 ttf 字体类的生成路径
            const dest = (0, path_1.join)(destDir, asset.library.replace((0, path_1.join)(builder_config_1.default.projectRoot, 'library'), '') + '.json');
            const jsonObject = asset_library_1.buildAssetLibrary.serialize(instance, {
                debug: options.debug,
            });
            await (0, fs_extra_1.outputJSON)(dest, jsonObject);
        }
    }
    /**
     * 循环一种数据
     * @param type
     * @param handle
     */
    async forEach(type, handle) {
        // @ts-ignore
        if (!this[type]) {
            return;
        }
        // @ts-ignore
        const uuids = Object.keys(this[type]);
        if (!uuids) {
            return;
        }
        for (let i = 0; i < uuids.length; i++) {
            const uuid = uuids[i];
            handle && (await handle(uuid, i));
        }
    }
    /**
     * 查询一个资源反序列化后的实例
     * @param uuid
     */
    async getInstance(uuid) {
        if (this.instanceMap[uuid]) {
            return this.instanceMap[uuid];
        }
        const asset = await asset_library_1.buildAssetLibrary.getAsset(uuid);
        return asset_library_1.buildAssetLibrary.getInstance(asset);
    }
}
exports.BuilderAssetCache = BuilderAssetCache;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3dvcmtlci9idWlsZGVyL21hbmFnZXIvYXNzZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7QUFFYix1Q0FBZ0Q7QUFDaEQsK0JBQTRCO0FBQzVCLDBDQUE2QztBQUM3QyxtREFBb0Q7QUFDcEQsMENBQTZEO0FBSTdELDZFQUE0RDtBQUM1RCxtRkFBMEQ7QUFFMUQ7OztHQUdHO0FBQ0gsTUFBYSxpQkFBaUI7SUFFMUIsU0FBUztJQUNPLE1BQU0sR0FBMkIsRUFBRSxDQUFDO0lBRXBELFdBQVc7SUFDSyxXQUFXLEdBQWtCLEVBQUUsQ0FBQztJQUVoRCxvQkFBb0I7SUFDYixVQUFVLEdBQWtCLEVBQUUsQ0FBQztJQUV0QyxjQUFjO0lBQ0csV0FBVyxHQUFpQixFQUFFLENBQUM7SUFFL0IsS0FBSyxDQUFZO0lBRWxDLFlBQVksSUFBZTtRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsSUFBSTtRQUNOLE1BQU0saUNBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsUUFBUSxDQUFDLElBQVk7UUFDdkIsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqSSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksUUFBUSxDQUFDLEtBQWEsRUFBRSxJQUFh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Q3JELE9BQU8saUNBQWlCLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hELENBQUM7Q0FDSjtBQXBRRCw4Q0FvUUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBvdXRwdXRKU09OLCByZWFkSlNPTiB9IGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyByZWN1cnNpdmVseSB9IGZyb20gJy4uL3V0aWxzL2luZGV4JztcclxuaW1wb3J0IHsgYnVpbGRBc3NldExpYnJhcnkgfSBmcm9tICcuL2Fzc2V0LWxpYnJhcnknO1xyXG5pbXBvcnQgeyBoYXNDQ09ORm9ybWF0QXNzZXRJbkxpYnJhcnkgfSBmcm9tICcuLi91dGlscy9jY29uYic7XHJcbmltcG9ydCB7IElBc3NldCB9IGZyb20gJy4uLy4uLy4uLy4uL2Fzc2V0cy9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IHsgSUJ1aWxkU2NlbmVJdGVtIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzJztcclxuaW1wb3J0IHsgSUluc3RhbmNlTWFwLCBJQnVpbGRlciwgSVNlcmlhbGl6ZWRPcHRpb25zLCBJSW50ZXJuYWxCdWlsZE9wdGlvbnMsIEJ1aWxkZXJDYWNoZSBhcyBJQnVpbGRlckNhY2hlIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCBhc3NldE1hbmFnZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXNzZXRzL21hbmFnZXIvYXNzZXQnO1xyXG5pbXBvcnQgYnVpbGRlckNvbmZpZyBmcm9tICcuLi8uLi8uLi9zaGFyZS9idWlsZGVyLWNvbmZpZyc7XHJcblxyXG4vKipcclxuICog6LWE5rqQ566h55CG5Zmo77yM5Li76KaB6LSf6LSj6LWE5rqQ55qE57yT5a2Y5p+l6K+i57yT5a2Y562JXHJcbiAqIOaJgOaciSBfXyDlvIDlpLTnmoTlsZ7mgKfmlrnms5Xpg73kuI3lr7nlpJblhazlvIBcclxuICovXHJcbmV4cG9ydCBjbGFzcyBCdWlsZGVyQXNzZXRDYWNoZSBpbXBsZW1lbnRzIElCdWlsZGVyQ2FjaGUge1xyXG5cclxuICAgIC8vIOWcuuaZr+i1hOa6kOS/oeaBr1xyXG4gICAgcHVibGljIHJlYWRvbmx5IHNjZW5lczogQXJyYXk8SUJ1aWxkU2NlbmVJdGVtPiA9IFtdO1xyXG5cclxuICAgIC8vIOiEmuacrOi1hOa6kOS/oeaBr+e8k+WtmFxyXG4gICAgcHVibGljIHJlYWRvbmx5IHNjcmlwdFV1aWRzOiBBcnJheTxzdHJpbmc+ID0gW107XHJcblxyXG4gICAgLy8g5YW25LuW6LWE5rqQ5L+h5oGv57yT5a2Y77yM5LiN5YyF5ZCr5Zy65pmv5ZKM6ISa5pysXHJcbiAgICBwdWJsaWMgYXNzZXRVdWlkczogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG5cclxuICAgIC8vIOi1hOa6kOWPjeW6j+WIl+WMluS5i+WQjueahOe7k+aenFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBpbnN0YW5jZU1hcDogSUluc3RhbmNlTWFwID0ge307XHJcblxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfdGFzaz86IElCdWlsZGVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRhc2s/OiBJQnVpbGRlcikge1xyXG4gICAgICAgIHRoaXMuX3Rhc2sgPSB0YXNrO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yid5aeL5YyWXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGluaXQoKSB7XHJcbiAgICAgICAgYXdhaXQgYnVpbGRBc3NldExpYnJhcnkuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5p+l6K+i5p+Q5LiqIHV1aWQg5piv5ZCm5a2Y5ZyoXHJcbiAgICAgKiBAcGFyYW0gdXVpZCBcclxuICAgICAqIEByZXR1cm5zIFxyXG4gICAgICovXHJcbiAgICBhc3luYyBoYXNBc3NldCh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gISEodGhpcy5hc3NldFV1aWRzLmluY2x1ZGVzKHV1aWQpIHx8IHRoaXMuc2NyaXB0VXVpZHMuaW5jbHVkZXModXVpZCkgfHwgdGhpcy5zY2VuZXMuZmluZChpdGVtID0+IGl0ZW0udXVpZCA9PT0gdXVpZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5LiA5Liq6LWE5rqQ5Yiw57yT5a2YXHJcbiAgICAgKiBAcGFyYW0gYXNzZXRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZEFzc2V0KGFzc2V0OiBJQXNzZXQsIHR5cGU/OiBzdHJpbmcpIHtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgaWYgKGFzc2V0LmludmFsaWQgfHwgYXNzZXQudXJsLnN0YXJ0c1dpdGgoJ2RiOi8vaW50ZXJuYWwvZGVmYXVsdF9maWxlX2NvbnRlbnQnKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEhBQ0sgMy45LjAg5q2k5o6l5Y+j5YWl5Y+C5o6l5pS25Y+C5pWw5qC85byP5pyJ5Y+Y5Yqo77yM5pqC5pe25YWI5YW85a65XHJcbiAgICAgICAgaWYgKCFhc3NldC5fYXNzZXREQikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1RoZSBhZGRBc3NldCBtZXRob2Qgbm8gbG9uZ2VyIHN1cHBvcnRzIHRoZSBBc3NldEluZm8gdHlwZSwgc28gcGxlYXNlIHBhc3MgcGFyYW1ldGVycyB0aGF0IGNvbmZvcm0gdG8gdGhlIElBc3NldCBpbnRlcmZhY2UgZGVmaW5pdGlvbi4nKTtcclxuICAgICAgICAgICAgYXNzZXQgPSBidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldChhc3NldC51dWlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY2NUeXBlID0gdHlwZSB8fCBhc3NldE1hbmFnZXIucXVlcnlBc3NldFByb3BlcnR5KGFzc2V0LCAndHlwZScpO1xyXG4gICAgICAgIC8vIOWIhuexu+WIsOaMh+WumueahOS9jee9rlxyXG4gICAgICAgIHN3aXRjaCAoY2NUeXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ2NjLlNjZW5lQXNzZXQnOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zY2VuZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXVpZDogYXNzZXQudXVpZCxcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IGFzc2V0LnVybCxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2NjLlNjcmlwdCc6XHJcbiAgICAgICAgICAgICAgICAvLyBoYWNrIOi/h+a7pOeJueauiueahOWjsOaYjuaWh+S7tu+8jOi/h+a7pOi1hOa6kOaooeadv+WGheeahOiEmuacrFxyXG4gICAgICAgICAgICAgICAgaWYgKGFzc2V0LnVybC50b0xvd2VyQ2FzZSgpLmVuZHNXaXRoKCcuZC50cycpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjcmlwdFV1aWRzLnB1c2goYXNzZXQudXVpZCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGlmIChhc3NldC5tZXRhLmZpbGVzLmluY2x1ZGVzKCcuanNvbicpIHx8IGhhc0NDT05Gb3JtYXRBc3NldEluTGlicmFyeShhc3NldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFzc2V0VXVpZHMucHVzaChhc3NldC51dWlkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliKDpmaTkuIDkuKrotYTmupDnmoTnvJPlrZhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlbW92ZUFzc2V0KHV1aWQ6IHN0cmluZywgdHlwZT86IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IGFzc2V0ID0gYnVpbGRBc3NldExpYnJhcnkuZ2V0QXNzZXQodXVpZCk7XHJcbiAgICAgICAgaWYgKCFhc3NldCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGFzc2V0VHlwZSA9IHR5cGUgfHwgYXNzZXRNYW5hZ2VyLnF1ZXJ5QXNzZXRQcm9wZXJ0eShhc3NldCwgJ3R5cGUnKTtcclxuICAgICAgICBzd2l0Y2ggKGFzc2V0VHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlICdjYy5TY2VuZUFzc2V0JzpcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zY2VuZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zY2VuZXNbaV0udXVpZCA9PT0gdXVpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjZW5lcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnY2MuU2NyaXB0JzpcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zY3JpcHRVdWlkcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNjcmlwdFV1aWRzW2ldID09PSB1dWlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NyaXB0VXVpZHMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZWN1cnNpdmVseShhc3NldCwgKGFzc2V0OiBJQXNzZXQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXNzZXQubWV0YS5maWxlcy5pbmNsdWRlcygnLmpzb24nKSB8fCBoYXNDQ09ORm9ybWF0QXNzZXRJbkxpYnJhcnkoYXNzZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5hc3NldFV1aWRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hc3NldFV1aWRzW2ldID09PSBhc3NldC51dWlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hc3NldFV1aWRzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmn6Xor6LmjIflrpogdXVpZCDnmoTotYTmupDkv6Hmga9cclxuICAgICAqIEBwYXJhbSB1dWlkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRBc3NldEluZm8odXVpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIGJ1aWxkQXNzZXRMaWJyYXJ5LmdldEFzc2V0SW5mbyh1dWlkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOaIluS/ruaUueS4gOS4quWunuS+i+WMluWvueixoeWIsOe8k+WtmFxyXG4gICAgICogQHBhcmFtIGluc3RhbmNlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGRJbnN0YW5jZShpbnN0YW5jZTogYW55KSB7XHJcbiAgICAgICAgaWYgKCFpbnN0YW5jZSB8fCAhaW5zdGFuY2UuX3V1aWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmluc3RhbmNlTWFwW2luc3RhbmNlLl91dWlkXSA9IGluc3RhbmNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yig6Zmk5LiA5Liq6LWE5rqQ55qE57yT5a2YXHJcbiAgICAgKiBAcGFyYW0gdXVpZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY2xlYXJBc3NldCh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnNjZW5lcy5sZW5ndGggPSAwO1xyXG4gICAgICAgIHRoaXMuc2NyaXB0VXVpZHMubGVuZ3RoID0gMDtcclxuICAgICAgICB0aGlzLmFzc2V0VXVpZHMubGVuZ3RoID0gMDtcclxuICAgICAgICBkZWxldGUgdGhpcy5pbnN0YW5jZU1hcFt1dWlkXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOafpeivouS4gOS4qui1hOa6kOeahCBtZXRhIOaVsOaNrlxyXG4gICAgICogQHBhcmFtIHV1aWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldE1ldGEodXVpZDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICByZXR1cm4gYnVpbGRBc3NldExpYnJhcnkuZ2V0TWV0YSh1dWlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgYWRkTWV0YSh1dWlkOiBzdHJpbmcsIG1ldGE6IGFueSkge1xyXG4gICAgICAgIGJ1aWxkQXNzZXRMaWJyYXJ5LmFkZE1ldGEodXVpZCwgbWV0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmjIflrpogdXVpZCDotYTmupDnmoTkvp3otZbotYTmupAgdXVpZCDliJfooahcclxuICAgICAqIEBwYXJhbSB1dWlkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBnZXREZXBlbmRVdWlkcyh1dWlkOiBzdHJpbmcpOiBQcm9taXNlPHJlYWRvbmx5IHN0cmluZ1tdPiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGJ1aWxkQXNzZXRMaWJyYXJ5LmdldERlcGVuZFV1aWRzKHV1aWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5rex5bqm6I635Y+W5oyH5a6aIHV1aWQg6LWE5rqQ55qE5L6d6LWW6LWE5rqQIHV1aWQg5YiX6KGoXHJcbiAgICAgKiBAcGFyYW0gdXVpZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgZ2V0RGVwZW5kVXVpZHNEZWVwKHV1aWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgYnVpbGRBc3NldExpYnJhcnkuZ2V0RGVwZW5kVXVpZHNEZWVwKHV1aWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIOiOt+WPluaMh+WumiB1dWlkIOi1hOa6kOWcqCBsaWJyYXJ5IOWGheeahOW6j+WIl+WMliBKU09OIOWGheWuuVxyXG4gICAgICogQHBhcmFtIHV1aWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIGdldExpYnJhcnlKU09OKHV1aWQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgY29uc3QgYXNzZXQgPSBidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldCh1dWlkKTtcclxuICAgICAgICBpZiAoIWFzc2V0IHx8ICFhc3NldC5tZXRhLmZpbGVzLmluY2x1ZGVzKCcuanNvbicpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDkuI3pnIDopoHnvJPlrZgganNvbiDmlbDmja5cclxuICAgICAgICByZXR1cm4gYXdhaXQgcmVhZEpTT04oYXNzZXQubGlicmFyeSArICcuanNvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5oyH5a6aIHV1aWQg6LWE5rqQ55qE6YeN5paw5bqP5YiX5YyW5ZCO55qEIEpTT04g5YaF5a6577yI5pyA57uI6L6T5Ye677yJXHJcbiAgICAgKiBAcGFyYW0gdXVpZFxyXG4gICAgICogQHBhcmFtIG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIGdldFNlcmlhbGl6ZWRKU09OKHV1aWQ6IHN0cmluZywgb3B0aW9uczogSVNlcmlhbGl6ZWRPcHRpb25zKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICBjb25zdCBpbnN0YW5jZSA9IHRoaXMuaW5zdGFuY2VNYXBbdXVpZF07XHJcbiAgICAgICAgbGV0IGpzb25PYmplY3Q7XHJcbiAgICAgICAgLy8g5LyY5YWI5L2/55SoIGNhY2hlIOS4reeahOe8k+WtmOaVsOaNrueUn+aIkOW6j+WIl+WMluaWh+S7tlxyXG4gICAgICAgIGlmIChpbnN0YW5jZSkge1xyXG4gICAgICAgICAgICBqc29uT2JqZWN0ID0gYnVpbGRBc3NldExpYnJhcnkuc2VyaWFsaXplKGluc3RhbmNlLCBvcHRpb25zKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBqc29uT2JqZWN0ID0gYXdhaXQgYnVpbGRBc3NldExpYnJhcnkuZ2V0U2VyaWFsaXplZEpTT04odXVpZCwgb3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBqc29uT2JqZWN0ID8ganNvbk9iamVjdCA6IG51bGw7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog55u05o6l6L6T5Ye65p+Q5Liq6LWE5rqQ5bqP5YiX5YyWIEpTT04g5Yiw5oyH5a6a5YyF5YaFXHJcbiAgICAgKiBAcGFyYW0gdXVpZFxyXG4gICAgICogQHBhcmFtIGRlc3REaXJcclxuICAgICAqIEBwYXJhbSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBvdXRwdXRBc3NldEpzb24odXVpZDogc3RyaW5nLCBkZXN0RGlyOiBzdHJpbmcsIG9wdGlvbnM6IElJbnRlcm5hbEJ1aWxkT3B0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IGFzc2V0ID0gYnVpbGRBc3NldExpYnJhcnkuZ2V0QXNzZXQodXVpZCk7XHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSB0aGlzLmluc3RhbmNlTWFwW3V1aWRdO1xyXG4gICAgICAgIGlmICghaW5zdGFuY2UgJiYgIWFzc2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xyXG4gICAgICAgICAgICBjb25zdCBkZXN0ID0gam9pbihkZXN0RGlyLCB1dWlkLnN1YnN0cigwLCAyKSwgdXVpZCArICcuanNvbicpO1xyXG4gICAgICAgICAgICBhd2FpdCBidWlsZEFzc2V0TGlicmFyeS5vdXRwdXRBc3NldHModXVpZCwgZGVzdCwgb3B0aW9ucy5kZWJ1Zyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8g5q2j5bi46LWE5rqQ55qE6L6T5Ye66Lev5b6E6ZyA6KaB5LulIGxpYnJhcnkg5YaF55qE6L6T5Ye66Lev5b6E5Li65YeG77yM5LiN5Y+v55u05o6l5ou85o6l77yM5q+U5aaCIHR0ZiDlrZfkvZPnsbvnmoTnlJ/miJDot6/lvoRcclxuICAgICAgICAgICAgY29uc3QgZGVzdCA9IGpvaW4oZGVzdERpciwgYXNzZXQubGlicmFyeS5yZXBsYWNlKGpvaW4oYnVpbGRlckNvbmZpZy5wcm9qZWN0Um9vdCwgJ2xpYnJhcnknKSwgJycpICsgJy5qc29uJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGpzb25PYmplY3QgPSBidWlsZEFzc2V0TGlicmFyeS5zZXJpYWxpemUoaW5zdGFuY2UsIHtcclxuICAgICAgICAgICAgICAgIGRlYnVnOiBvcHRpb25zLmRlYnVnLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYXdhaXQgb3V0cHV0SlNPTihkZXN0LCBqc29uT2JqZWN0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlvqrnjq/kuIDnp43mlbDmja5cclxuICAgICAqIEBwYXJhbSB0eXBlXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBmb3JFYWNoKHR5cGU6IHN0cmluZywgaGFuZGxlOiBGdW5jdGlvbik6IFByb21pc2U8dW5kZWZpbmVkPiB7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGlmICghdGhpc1t0eXBlXSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBjb25zdCB1dWlkcyA9IE9iamVjdC5rZXlzKHRoaXNbdHlwZV0pO1xyXG4gICAgICAgIGlmICghdXVpZHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHV1aWRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHV1aWQgPSB1dWlkc1tpXTtcclxuICAgICAgICAgICAgaGFuZGxlICYmIChhd2FpdCBoYW5kbGUodXVpZCwgaSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOafpeivouS4gOS4qui1hOa6kOWPjeW6j+WIl+WMluWQjueahOWunuS+i1xyXG4gICAgICogQHBhcmFtIHV1aWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIGdldEluc3RhbmNlKHV1aWQ6IHN0cmluZykge1xyXG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlTWFwW3V1aWRdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlTWFwW3V1aWRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBhc3NldCA9IGF3YWl0IGJ1aWxkQXNzZXRMaWJyYXJ5LmdldEFzc2V0KHV1aWQpO1xyXG4gICAgICAgIHJldHVybiBidWlsZEFzc2V0TGlicmFyeS5nZXRJbnN0YW5jZShhc3NldCk7XHJcbiAgICB9XHJcbn1cclxuIl19