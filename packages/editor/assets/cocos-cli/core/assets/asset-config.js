"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const configuration_1 = require("../configuration");
const project_1 = __importDefault(require("../project"));
const engine_1 = require("../engine");
class AssetConfig {
    /**
     * 环境共享的资源库配置
     */
    _assetConfig = {
        restoreAssetDBFromCache: false,
        flagReimportCheck: false,
        assetDBList: [],
        root: '',
        libraryRoot: '',
        tempRoot: '',
        createTemplateRoot: '',
        sortingPlugin: [],
        // fbx.material.smart
    };
    _init = false;
    /**
     * 持有的可双向绑定的配置管理实例
     */
    _configInstance;
    get data() {
        if (!this._init) {
            throw new Error('AssetConfig not init');
        }
        return this._assetConfig;
    }
    async init() {
        if (this._init) {
            console.warn('AssetConfig already init');
            return;
        }
        this._configInstance = await configuration_1.configurationRegistry.register('import', {
            restoreAssetDBFromCache: this._assetConfig.restoreAssetDBFromCache,
            globList: this._assetConfig.globList,
            createTemplateRoot: (0, path_1.join)(this._assetConfig.root, '.creator/templates'),
        });
        if (!project_1.default.path) {
            throw new Error('Project not found');
        }
        this._assetConfig.root = project_1.default.path;
        const enginePath = engine_1.Engine.getInfo().typescript.path;
        this._assetConfig.libraryRoot = this._assetConfig.libraryRoot || (0, path_1.join)(this._assetConfig.root, 'library');
        this._assetConfig.tempRoot = (0, path_1.join)(this._assetConfig.root, 'temp/asset-db');
        this._assetConfig.assetDBList = [{
                name: 'assets',
                target: (0, path_1.join)(this._assetConfig.root, 'assets'),
                readonly: false,
                visible: true,
                library: (0, path_1.join)(this._assetConfig.root, 'library'),
            }, {
                name: 'internal',
                target: (0, path_1.join)(enginePath, 'editor/assets'),
                readonly: false,
                visible: true,
                library: (0, path_1.join)(enginePath, 'editor/library'),
            }];
        this._init = true;
    }
    getProject(path, scope) {
        return this._configInstance.get(path, scope);
    }
    setProject(path, value, scope) {
        return this._configInstance.set(path, value, scope);
    }
}
exports.default = new AssetConfig();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQtY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLCtCQUE0QjtBQUU1QixvREFBaUc7QUFDakcseURBQWlDO0FBQ2pDLHNDQUFtQztBQWdDbkMsTUFBTSxXQUFXO0lBQ2I7O09BRUc7SUFDSyxZQUFZLEdBQWtCO1FBQ2xDLHVCQUF1QixFQUFFLEtBQUs7UUFDOUIsaUJBQWlCLEVBQUUsS0FBSztRQUN4QixXQUFXLEVBQUUsRUFBRTtRQUNmLElBQUksRUFBRSxFQUFFO1FBQ1IsV0FBVyxFQUFFLEVBQUU7UUFDZixRQUFRLEVBQUUsRUFBRTtRQUNaLGtCQUFrQixFQUFFLEVBQUU7UUFDdEIsYUFBYSxFQUFFLEVBQUU7UUFDakIscUJBQXFCO0tBQ3hCLENBQUM7SUFFTSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBRXRCOztPQUVHO0lBQ0ssZUFBZSxDQUFzQjtJQUM3QyxJQUFJLElBQUk7UUFDSixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDN0IsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJO1FBQ04sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDYixPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFDekMsT0FBTztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0scUNBQXFCLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRTtZQUNsRSx1QkFBdUIsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLHVCQUF1QjtZQUNsRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRO1lBQ3BDLGtCQUFrQixFQUFFLElBQUEsV0FBSSxFQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLG9CQUFvQixDQUFDO1NBQ3pFLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEdBQUcsaUJBQU8sQ0FBQyxJQUFJLENBQUM7UUFDdEMsTUFBTSxVQUFVLEdBQUcsZUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDcEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLElBQUksSUFBQSxXQUFJLEVBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsSUFBQSxXQUFJLEVBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEdBQUcsQ0FBQztnQkFDN0IsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsTUFBTSxFQUFFLElBQUEsV0FBSSxFQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQztnQkFDOUMsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsT0FBTyxFQUFFLElBQUEsV0FBSSxFQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQzthQUNuRCxFQUFFO2dCQUNDLElBQUksRUFBRSxVQUFVO2dCQUNoQixNQUFNLEVBQUUsSUFBQSxXQUFJLEVBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQztnQkFDekMsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsT0FBTyxFQUFFLElBQUEsV0FBSSxFQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQzthQUM5QyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBRUQsVUFBVSxDQUFJLElBQVksRUFBRSxLQUEwQjtRQUNsRCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsVUFBVSxDQUFDLElBQVksRUFBRSxLQUFVLEVBQUUsS0FBMEI7UUFDM0QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3hELENBQUM7Q0FDSjtBQUVELGtCQUFlLElBQUksV0FBVyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IEFzc2V0REJSZWdpc3RlckluZm8gfSBmcm9tICcuL0B0eXBlcy9wcml2YXRlJztcclxuaW1wb3J0IHsgY29uZmlndXJhdGlvblJlZ2lzdHJ5LCBDb25maWd1cmF0aW9uU2NvcGUsIElCYXNlQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uL2NvbmZpZ3VyYXRpb24nO1xyXG5pbXBvcnQgcHJvamVjdCBmcm9tICcuLi9wcm9qZWN0JztcclxuaW1wb3J0IHsgRW5naW5lIH0gZnJvbSAnLi4vZW5naW5lJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQXNzZXREQkNvbmZpZyB7XHJcbiAgICByZXN0b3JlQXNzZXREQkZyb21DYWNoZTogYm9vbGVhbjtcclxuICAgIGZsYWdSZWltcG9ydENoZWNrOiBib29sZWFuO1xyXG4gICAgZ2xvYkxpc3Q/OiBzdHJpbmdbXTtcclxuICAgIC8qKlxyXG4gICAgICog6LWE5rqQIHVzZXJEYXRhIOeahOm7mOiupOWAvFxyXG4gICAgICovXHJcbiAgICB1c2VyRGF0YVRlbXBsYXRlPzogUmVjb3JkPHN0cmluZywgYW55PjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOi1hOa6kOaVsOaNruW6k+S/oeaBr+WIl+ihqFxyXG4gICAgICovXHJcbiAgICBhc3NldERCTGlzdDogQXNzZXREQlJlZ2lzdGVySW5mb1tdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog6LWE5rqQ5qC555uu5b2V77yM6YCa5bi45piv6aG555uu55uu5b2VXHJcbiAgICAgKi9cclxuICAgIHJvb3Q6IHN0cmluZztcclxuXHJcbiAgICAvKipcclxuICAgICAqIOi1hOa6kOW6k+WvvOWFpeWQjuagueebruW9le+8jOmAmuW4uOagueaNrumFjee9rueahCByb290IOiuoeeul1xyXG4gICAgICovXHJcbiAgICBsaWJyYXJ5Um9vdDogc3RyaW5nO1xyXG5cclxuICAgIHRlbXBSb290OiBzdHJpbmc7XHJcbiAgICBjcmVhdGVUZW1wbGF0ZVJvb3Q6IHN0cmluZztcclxuXHJcbiAgICBzb3J0aW5nUGx1Z2luOiBzdHJpbmdbXTtcclxufVxyXG5cclxuY2xhc3MgQXNzZXRDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiDnjq/looPlhbHkuqvnmoTotYTmupDlupPphY3nva5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfYXNzZXRDb25maWc6IEFzc2V0REJDb25maWcgPSB7XHJcbiAgICAgICAgcmVzdG9yZUFzc2V0REJGcm9tQ2FjaGU6IGZhbHNlLFxyXG4gICAgICAgIGZsYWdSZWltcG9ydENoZWNrOiBmYWxzZSxcclxuICAgICAgICBhc3NldERCTGlzdDogW10sXHJcbiAgICAgICAgcm9vdDogJycsXHJcbiAgICAgICAgbGlicmFyeVJvb3Q6ICcnLFxyXG4gICAgICAgIHRlbXBSb290OiAnJyxcclxuICAgICAgICBjcmVhdGVUZW1wbGF0ZVJvb3Q6ICcnLFxyXG4gICAgICAgIHNvcnRpbmdQbHVnaW46IFtdLFxyXG4gICAgICAgIC8vIGZieC5tYXRlcmlhbC5zbWFydFxyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIF9pbml0ID0gZmFsc2U7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmjIHmnInnmoTlj6/lj4zlkJHnu5HlrprnmoTphY3nva7nrqHnkIblrp7kvotcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfY29uZmlnSW5zdGFuY2UhOiBJQmFzZUNvbmZpZ3VyYXRpb247XHJcbiAgICBnZXQgZGF0YSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luaXQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBc3NldENvbmZpZyBub3QgaW5pdCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fYXNzZXRDb25maWc7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgaW5pdCgpIHtcclxuICAgICAgICBpZiAodGhpcy5faW5pdCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0Fzc2V0Q29uZmlnIGFscmVhZHkgaW5pdCcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2NvbmZpZ0luc3RhbmNlID0gYXdhaXQgY29uZmlndXJhdGlvblJlZ2lzdHJ5LnJlZ2lzdGVyKCdpbXBvcnQnLCB7XHJcbiAgICAgICAgICAgIHJlc3RvcmVBc3NldERCRnJvbUNhY2hlOiB0aGlzLl9hc3NldENvbmZpZy5yZXN0b3JlQXNzZXREQkZyb21DYWNoZSxcclxuICAgICAgICAgICAgZ2xvYkxpc3Q6IHRoaXMuX2Fzc2V0Q29uZmlnLmdsb2JMaXN0LFxyXG4gICAgICAgICAgICBjcmVhdGVUZW1wbGF0ZVJvb3Q6IGpvaW4odGhpcy5fYXNzZXRDb25maWcucm9vdCwgJy5jcmVhdG9yL3RlbXBsYXRlcycpLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICghcHJvamVjdC5wYXRoKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvamVjdCBub3QgZm91bmQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fYXNzZXRDb25maWcucm9vdCA9IHByb2plY3QucGF0aDtcclxuICAgICAgICBjb25zdCBlbmdpbmVQYXRoID0gRW5naW5lLmdldEluZm8oKS50eXBlc2NyaXB0LnBhdGg7XHJcbiAgICAgICAgdGhpcy5fYXNzZXRDb25maWcubGlicmFyeVJvb3QgPSB0aGlzLl9hc3NldENvbmZpZy5saWJyYXJ5Um9vdCB8fCBqb2luKHRoaXMuX2Fzc2V0Q29uZmlnLnJvb3QsICdsaWJyYXJ5Jyk7XHJcbiAgICAgICAgdGhpcy5fYXNzZXRDb25maWcudGVtcFJvb3QgPSBqb2luKHRoaXMuX2Fzc2V0Q29uZmlnLnJvb3QsICd0ZW1wL2Fzc2V0LWRiJyk7XHJcbiAgICAgICAgdGhpcy5fYXNzZXRDb25maWcuYXNzZXREQkxpc3QgPSBbe1xyXG4gICAgICAgICAgICBuYW1lOiAnYXNzZXRzJyxcclxuICAgICAgICAgICAgdGFyZ2V0OiBqb2luKHRoaXMuX2Fzc2V0Q29uZmlnLnJvb3QsICdhc3NldHMnKSxcclxuICAgICAgICAgICAgcmVhZG9ubHk6IGZhbHNlLFxyXG4gICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBsaWJyYXJ5OiBqb2luKHRoaXMuX2Fzc2V0Q29uZmlnLnJvb3QsICdsaWJyYXJ5JyksXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBuYW1lOiAnaW50ZXJuYWwnLFxyXG4gICAgICAgICAgICB0YXJnZXQ6IGpvaW4oZW5naW5lUGF0aCwgJ2VkaXRvci9hc3NldHMnKSxcclxuICAgICAgICAgICAgcmVhZG9ubHk6IGZhbHNlLFxyXG4gICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBsaWJyYXJ5OiBqb2luKGVuZ2luZVBhdGgsICdlZGl0b3IvbGlicmFyeScpLFxyXG4gICAgICAgIH1dO1xyXG4gICAgICAgIHRoaXMuX2luaXQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFByb2plY3Q8VD4ocGF0aDogc3RyaW5nLCBzY29wZT86IENvbmZpZ3VyYXRpb25TY29wZSk6IFByb21pc2U8VD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jb25maWdJbnN0YW5jZS5nZXQocGF0aCwgc2NvcGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFByb2plY3QocGF0aDogc3RyaW5nLCB2YWx1ZTogYW55LCBzY29wZT86IENvbmZpZ3VyYXRpb25TY29wZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jb25maWdJbnN0YW5jZS5zZXQocGF0aCwgdmFsdWUsIHNjb3BlKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgbmV3IEFzc2V0Q29uZmlnKCk7XHJcbiJdfQ==