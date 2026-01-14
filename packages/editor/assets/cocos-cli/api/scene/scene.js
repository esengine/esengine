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
exports.SceneApi = void 0;
const schema_1 = require("./schema");
const schema_identifier_1 = require("../base/schema-identifier");
const decorator_js_1 = require("../decorator/decorator.js");
const schema_base_1 = require("../base/schema-base");
const scene_1 = require("../../core/scene");
const component_1 = require("./component");
const node_1 = require("./node");
const prefab_1 = require("./prefab");
class SceneApi {
    component;
    node;
    prefab;
    constructor() {
        this.component = new component_1.ComponentApi();
        this.node = new node_1.NodeApi();
        this.prefab = new prefab_1.PrefabApi();
    }
    async queryCurrent() {
        try {
            const data = await scene_1.Scene.queryCurrent();
            return {
                data: data,
                code: schema_base_1.COMMON_STATUS.SUCCESS,
            };
        }
        catch (e) {
            console.error(e);
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e)
            };
        }
    }
    async open(dbURLOrUUID) {
        try {
            const data = await scene_1.Scene.open({ urlOrUUID: dbURLOrUUID });
            return {
                data: data,
                code: schema_base_1.COMMON_STATUS.SUCCESS,
            };
        }
        catch (e) {
            console.error(e);
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e)
            };
        }
    }
    async close() {
        try {
            const data = await scene_1.Scene.close({});
            return {
                data,
                code: schema_base_1.COMMON_STATUS.SUCCESS,
            };
        }
        catch (e) {
            console.error(e);
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e)
            };
        }
    }
    async save() {
        try {
            const data = await scene_1.Scene.save({});
            return {
                data,
                code: schema_base_1.COMMON_STATUS.SUCCESS,
            };
        }
        catch (e) {
            console.error(e);
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e)
            };
        }
    }
    async createScene(options) {
        try {
            const data = await scene_1.Scene.create({
                type: 'scene',
                baseName: options.baseName,
                targetDirectory: options.dbURL,
                templateType: options.templateType,
            });
            return {
                code: schema_base_1.COMMON_STATUS.SUCCESS,
                data: data,
            };
        }
        catch (e) {
            console.error(e);
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e)
            };
        }
    }
    async reloadScene() {
        try {
            const data = await scene_1.Scene.reload({});
            return {
                code: schema_base_1.COMMON_STATUS.SUCCESS,
                data: data,
            };
        }
        catch (e) {
            console.error(e);
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e)
            };
        }
    }
}
exports.SceneApi = SceneApi;
__decorate([
    (0, decorator_js_1.tool)('scene-query-current'),
    (0, decorator_js_1.title)('Get current opened scene/prefab info') // 获取当前打开的场景/预制体信息
    ,
    (0, decorator_js_1.description)('Get current opened scene/prefab info, return null if none opened') // 获取当前打开场景/预制体信息，如果没有打开，返回 null
    ,
    (0, decorator_js_1.result)(schema_1.SchemaCurrentResult),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SceneApi.prototype, "queryCurrent", null);
__decorate([
    (0, decorator_js_1.tool)('scene-open'),
    (0, decorator_js_1.title)('Open scene/prefab') // 打开场景/预制体
    ,
    (0, decorator_js_1.description)('Open specified scene/prefab asset.') // 打开指定场景/预制体资源。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaOpenResult),
    __param(0, (0, decorator_js_1.param)(schema_identifier_1.SchemaAssetUrlOrUUID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SceneApi.prototype, "open", null);
__decorate([
    (0, decorator_js_1.tool)('scene-close'),
    (0, decorator_js_1.title)('Close scene/prefab') // 关闭场景/预制体
    ,
    (0, decorator_js_1.description)('Close current opened scene/prefab.') // 关闭当前打开的场景/预制体。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaCloseResult),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SceneApi.prototype, "close", null);
__decorate([
    (0, decorator_js_1.tool)('scene-save'),
    (0, decorator_js_1.title)('Save scene/prefab') // 保存场景/预制体
    ,
    (0, decorator_js_1.description)('Save current opened scene/prefab to asset, including scene node structure, component data, asset references etc. Will update .meta file after save.') // 保存当前打开的场景/预制体到资源，包括场景节点结构、组件数据、资源引用等信息。保存后会更新场景的 .meta 文件。
    ,
    (0, decorator_js_1.result)(schema_1.SchemaSaveResult),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SceneApi.prototype, "save", null);
__decorate([
    (0, decorator_js_1.tool)('scene-create'),
    (0, decorator_js_1.title)('Create scene') // 创建场景
    ,
    (0, decorator_js_1.description)('Create new scene asset in project') // 在项目中创建新的场景资源
    ,
    (0, decorator_js_1.result)(schema_1.SchemaCreateResult),
    __param(0, (0, decorator_js_1.param)(schema_1.SchemaCreateOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SceneApi.prototype, "createScene", null);
__decorate([
    (0, decorator_js_1.tool)('scene-reload'),
    (0, decorator_js_1.title)('Reload scene/prefab') // 重新加载场景/预制体
    ,
    (0, decorator_js_1.description)('Reload scene/prefab') // 重新加载场景/预制体
    ,
    (0, decorator_js_1.result)(schema_1.SchemaReload),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SceneApi.prototype, "reloadScene", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpL3NjZW5lL3NjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFDQWdCa0I7QUFDbEIsaUVBQWlFO0FBQ2pFLDREQUFvRjtBQUNwRixxREFBc0U7QUFDdEUsNENBQTZEO0FBQzdELDJDQUEyQztBQUMzQyxpQ0FBaUM7QUFDakMscUNBQXFDO0FBRXJDLE1BQWEsUUFBUTtJQUNWLFNBQVMsQ0FBZTtJQUN4QixJQUFJLENBQVU7SUFDZCxNQUFNLENBQVk7SUFFekI7UUFDSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksd0JBQVksRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxjQUFPLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksa0JBQVMsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFNSyxBQUFOLEtBQUssQ0FBQyxZQUFZO1FBQ2QsSUFBSSxDQUFDO1lBQ0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxhQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDeEMsT0FBTztnQkFDSCxJQUFJLEVBQUUsSUFBc0I7Z0JBQzVCLElBQUksRUFBRSwyQkFBYSxDQUFDLE9BQU87YUFDOUIsQ0FBQztRQUNOLENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ1QsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQixPQUFPO2dCQUNILElBQUksRUFBRSwyQkFBYSxDQUFDLElBQUk7Z0JBQ3hCLE1BQU0sRUFBRSxDQUFDLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ3JELENBQUM7UUFDTixDQUFDO0lBQ0wsQ0FBQztJQU1LLEFBQU4sS0FBSyxDQUFDLElBQUksQ0FBOEIsV0FB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Q0FBQyxXQUFXOztJQUN2QyxJQUFBLDBCQUFXLEVBQUMsb0NBQW9DLENBQUMsQ0FBQyxpQkFBaUI7O0lBQ25FLElBQUEscUJBQU0sRUFBQywwQkFBaUIsQ0FBQzs7OztxQ0FlekI7QUFNSztJQUpMLElBQUEsbUJBQUksRUFBQyxZQUFZLENBQUM7SUFDbEIsSUFBQSxvQkFBSyxFQUFDLG1CQUFtQixDQUFDLENBQUMsV0FBVzs7SUFDdEMsSUFBQSwwQkFBVyxFQUFDLHFKQUFxSixDQUFDLENBQUMsNkRBQTZEOztJQUNoTyxJQUFBLHFCQUFNLEVBQUMseUJBQWdCLENBQUM7Ozs7b0NBZXhCO0FBTUs7SUFKTCxJQUFBLG1CQUFJLEVBQUMsY0FBYyxDQUFDO0lBQ3BCLElBQUEsb0JBQUssRUFBQyxjQUFjLENBQUMsQ0FBQyxPQUFPOztJQUM3QixJQUFBLDBCQUFXLEVBQUMsbUNBQW1DLENBQUMsQ0FBQyxlQUFlOztJQUNoRSxJQUFBLHFCQUFNLEVBQUMsMkJBQWtCLENBQUM7SUFDUixXQUFBLElBQUEsb0JBQUssRUFBQyw0QkFBbUIsQ0FBQyxDQUFBOzs7OzJDQW9CNUM7QUFNSztJQUpMLElBQUEsbUJBQUksRUFBQyxjQUFjLENBQUM7SUFDcEIsSUFBQSxvQkFBSyxFQUFDLHFCQUFxQixDQUFDLENBQUMsYUFBYTs7SUFDMUMsSUFBQSwwQkFBVyxFQUFDLHFCQUFxQixDQUFDLENBQUMsYUFBYTs7SUFDaEQsSUFBQSxxQkFBTSxFQUFDLHFCQUFZLENBQUM7Ozs7MkNBZXBCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICAgIFNjaGVtYUNsb3NlUmVzdWx0LFxyXG4gICAgU2NoZW1hQ3JlYXRlT3B0aW9ucyxcclxuICAgIFNjaGVtYUNyZWF0ZVJlc3VsdCxcclxuICAgIFNjaGVtYUN1cnJlbnRSZXN1bHQsXHJcbiAgICBTY2hlbWFPcGVuUmVzdWx0LFxyXG4gICAgU2NoZW1hUmVsb2FkLFxyXG4gICAgU2NoZW1hU2F2ZVJlc3VsdCxcclxuICAgIFRBc3NldFVybE9yVVVJRCxcclxuICAgIFRDbG9zZVJlc3VsdCxcclxuICAgIFRDcmVhdGVPcHRpb25zLFxyXG4gICAgVENyZWF0ZVJlc3VsdCxcclxuICAgIFRDdXJyZW50UmVzdWx0LFxyXG4gICAgVE9wZW5SZXN1bHQsXHJcbiAgICBUUmVsb2FkLFxyXG4gICAgVFNhdmVSZXN1bHQsXHJcbn0gZnJvbSAnLi9zY2hlbWEnO1xyXG5pbXBvcnQgeyBTY2hlbWFBc3NldFVybE9yVVVJRCB9IGZyb20gJy4uL2Jhc2Uvc2NoZW1hLWlkZW50aWZpZXInO1xyXG5pbXBvcnQgeyBkZXNjcmlwdGlvbiwgcGFyYW0sIHJlc3VsdCwgdGl0bGUsIHRvb2wgfSBmcm9tICcuLi9kZWNvcmF0b3IvZGVjb3JhdG9yLmpzJztcclxuaW1wb3J0IHsgQ09NTU9OX1NUQVRVUywgQ29tbW9uUmVzdWx0VHlwZSB9IGZyb20gJy4uL2Jhc2Uvc2NoZW1hLWJhc2UnO1xyXG5pbXBvcnQgeyBTY2VuZSwgVFNjZW5lVGVtcGxhdGVUeXBlIH0gZnJvbSAnLi4vLi4vY29yZS9zY2VuZSc7XHJcbmltcG9ydCB7IENvbXBvbmVudEFwaSB9IGZyb20gJy4vY29tcG9uZW50JztcclxuaW1wb3J0IHsgTm9kZUFwaSB9IGZyb20gJy4vbm9kZSc7XHJcbmltcG9ydCB7IFByZWZhYkFwaSB9IGZyb20gJy4vcHJlZmFiJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTY2VuZUFwaSB7XHJcbiAgICBwdWJsaWMgY29tcG9uZW50OiBDb21wb25lbnRBcGk7XHJcbiAgICBwdWJsaWMgbm9kZTogTm9kZUFwaTtcclxuICAgIHB1YmxpYyBwcmVmYWI6IFByZWZhYkFwaTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmNvbXBvbmVudCA9IG5ldyBDb21wb25lbnRBcGkoKTtcclxuICAgICAgICB0aGlzLm5vZGUgPSBuZXcgTm9kZUFwaSgpO1xyXG4gICAgICAgIHRoaXMucHJlZmFiID0gbmV3IFByZWZhYkFwaSgpO1xyXG4gICAgfVxyXG5cclxuICAgIEB0b29sKCdzY2VuZS1xdWVyeS1jdXJyZW50JylcclxuICAgIEB0aXRsZSgnR2V0IGN1cnJlbnQgb3BlbmVkIHNjZW5lL3ByZWZhYiBpbmZvJykgLy8g6I635Y+W5b2T5YmN5omT5byA55qE5Zy65pmvL+mihOWItuS9k+S/oeaBr1xyXG4gICAgQGRlc2NyaXB0aW9uKCdHZXQgY3VycmVudCBvcGVuZWQgc2NlbmUvcHJlZmFiIGluZm8sIHJldHVybiBudWxsIGlmIG5vbmUgb3BlbmVkJykgLy8g6I635Y+W5b2T5YmN5omT5byA5Zy65pmvL+mihOWItuS9k+S/oeaBr++8jOWmguaenOayoeacieaJk+W8gO+8jOi/lOWbniBudWxsXHJcbiAgICBAcmVzdWx0KFNjaGVtYUN1cnJlbnRSZXN1bHQpXHJcbiAgICBhc3luYyBxdWVyeUN1cnJlbnQoKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRDdXJyZW50UmVzdWx0Pj4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBTY2VuZS5xdWVyeUN1cnJlbnQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEgYXMgVEN1cnJlbnRSZXN1bHQsXHJcbiAgICAgICAgICAgICAgICBjb2RlOiBDT01NT05fU1RBVFVTLlNVQ0NFU1MsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IENPTU1PTl9TVEFUVVMuRkFJTCxcclxuICAgICAgICAgICAgICAgIHJlYXNvbjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIEB0b29sKCdzY2VuZS1vcGVuJylcclxuICAgIEB0aXRsZSgnT3BlbiBzY2VuZS9wcmVmYWInKSAvLyDmiZPlvIDlnLrmma8v6aKE5Yi25L2TXHJcbiAgICBAZGVzY3JpcHRpb24oJ09wZW4gc3BlY2lmaWVkIHNjZW5lL3ByZWZhYiBhc3NldC4nKSAvLyDmiZPlvIDmjIflrprlnLrmma8v6aKE5Yi25L2T6LWE5rqQ44CCXHJcbiAgICBAcmVzdWx0KFNjaGVtYU9wZW5SZXN1bHQpXHJcbiAgICBhc3luYyBvcGVuKEBwYXJhbShTY2hlbWFBc3NldFVybE9yVVVJRCkgZGJVUkxPclVVSUQ6IFRBc3NldFVybE9yVVVJRCk6IFByb21pc2U8Q29tbW9uUmVzdWx0VHlwZTxUT3BlblJlc3VsdD4+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgU2NlbmUub3Blbih7IHVybE9yVVVJRDogZGJVUkxPclVVSUQgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhIGFzIFRPcGVuUmVzdWx0LFxyXG4gICAgICAgICAgICAgICAgY29kZTogQ09NTU9OX1NUQVRVUy5TVUNDRVNTLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IENPTU1PTl9TVEFUVVMuRkFJTCxcclxuICAgICAgICAgICAgICAgIHJlYXNvbjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIEB0b29sKCdzY2VuZS1jbG9zZScpXHJcbiAgICBAdGl0bGUoJ0Nsb3NlIHNjZW5lL3ByZWZhYicpIC8vIOWFs+mXreWcuuaZry/pooTliLbkvZNcclxuICAgIEBkZXNjcmlwdGlvbignQ2xvc2UgY3VycmVudCBvcGVuZWQgc2NlbmUvcHJlZmFiLicpIC8vIOWFs+mXreW9k+WJjeaJk+W8gOeahOWcuuaZry/pooTliLbkvZPjgIJcclxuICAgIEByZXN1bHQoU2NoZW1hQ2xvc2VSZXN1bHQpXHJcbiAgICBhc3luYyBjbG9zZSgpOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8VENsb3NlUmVzdWx0Pj4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBTY2VuZS5jbG9zZSh7fSk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBkYXRhLFxyXG4gICAgICAgICAgICAgICAgY29kZTogQ09NTU9OX1NUQVRVUy5TVUNDRVNTLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IENPTU1PTl9TVEFUVVMuRkFJTCxcclxuICAgICAgICAgICAgICAgIHJlYXNvbjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIEB0b29sKCdzY2VuZS1zYXZlJylcclxuICAgIEB0aXRsZSgnU2F2ZSBzY2VuZS9wcmVmYWInKSAvLyDkv53lrZjlnLrmma8v6aKE5Yi25L2TXHJcbiAgICBAZGVzY3JpcHRpb24oJ1NhdmUgY3VycmVudCBvcGVuZWQgc2NlbmUvcHJlZmFiIHRvIGFzc2V0LCBpbmNsdWRpbmcgc2NlbmUgbm9kZSBzdHJ1Y3R1cmUsIGNvbXBvbmVudCBkYXRhLCBhc3NldCByZWZlcmVuY2VzIGV0Yy4gV2lsbCB1cGRhdGUgLm1ldGEgZmlsZSBhZnRlciBzYXZlLicpIC8vIOS/neWtmOW9k+WJjeaJk+W8gOeahOWcuuaZry/pooTliLbkvZPliLDotYTmupDvvIzljIXmi6zlnLrmma/oioLngrnnu5PmnoTjgIHnu4Tku7bmlbDmja7jgIHotYTmupDlvJXnlKjnrYnkv6Hmga/jgILkv53lrZjlkI7kvJrmm7TmlrDlnLrmma/nmoQgLm1ldGEg5paH5Lu244CCXHJcbiAgICBAcmVzdWx0KFNjaGVtYVNhdmVSZXN1bHQpXHJcbiAgICBhc3luYyBzYXZlKCk6IFByb21pc2U8Q29tbW9uUmVzdWx0VHlwZTxUU2F2ZVJlc3VsdD4+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgU2NlbmUuc2F2ZSh7fSk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBkYXRhLFxyXG4gICAgICAgICAgICAgICAgY29kZTogQ09NTU9OX1NUQVRVUy5TVUNDRVNTLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IENPTU1PTl9TVEFUVVMuRkFJTCxcclxuICAgICAgICAgICAgICAgIHJlYXNvbjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIEB0b29sKCdzY2VuZS1jcmVhdGUnKVxyXG4gICAgQHRpdGxlKCdDcmVhdGUgc2NlbmUnKSAvLyDliJvlu7rlnLrmma9cclxuICAgIEBkZXNjcmlwdGlvbignQ3JlYXRlIG5ldyBzY2VuZSBhc3NldCBpbiBwcm9qZWN0JykgLy8g5Zyo6aG555uu5Lit5Yib5bu65paw55qE5Zy65pmv6LWE5rqQXHJcbiAgICBAcmVzdWx0KFNjaGVtYUNyZWF0ZVJlc3VsdClcclxuICAgIGFzeW5jIGNyZWF0ZVNjZW5lKEBwYXJhbShTY2hlbWFDcmVhdGVPcHRpb25zKSBvcHRpb25zOiBUQ3JlYXRlT3B0aW9ucyk6IFByb21pc2U8Q29tbW9uUmVzdWx0VHlwZTxUQ3JlYXRlUmVzdWx0Pj4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBTY2VuZS5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3NjZW5lJyxcclxuICAgICAgICAgICAgICAgIGJhc2VOYW1lOiBvcHRpb25zLmJhc2VOYW1lLFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0RGlyZWN0b3J5OiBvcHRpb25zLmRiVVJMLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVUeXBlOiBvcHRpb25zLnRlbXBsYXRlVHlwZSBhcyBUU2NlbmVUZW1wbGF0ZVR5cGUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IENPTU1PTl9TVEFUVVMuU1VDQ0VTUyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEgYXMgVENyZWF0ZVJlc3VsdCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBDT01NT05fU1RBVFVTLkZBSUwsXHJcbiAgICAgICAgICAgICAgICByZWFzb246IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBAdG9vbCgnc2NlbmUtcmVsb2FkJylcclxuICAgIEB0aXRsZSgnUmVsb2FkIHNjZW5lL3ByZWZhYicpIC8vIOmHjeaWsOWKoOi9veWcuuaZry/pooTliLbkvZNcclxuICAgIEBkZXNjcmlwdGlvbignUmVsb2FkIHNjZW5lL3ByZWZhYicpIC8vIOmHjeaWsOWKoOi9veWcuuaZry/pooTliLbkvZNcclxuICAgIEByZXN1bHQoU2NoZW1hUmVsb2FkKVxyXG4gICAgYXN5bmMgcmVsb2FkU2NlbmUoKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRSZWxvYWQ+PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IFNjZW5lLnJlbG9hZCh7fSk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBDT01NT05fU1RBVFVTLlNVQ0NFU1MsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhIGFzIFRSZWxvYWQsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgY29kZTogQ09NTU9OX1NUQVRVUy5GQUlMLFxyXG4gICAgICAgICAgICAgICAgcmVhc29uOiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19