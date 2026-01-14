"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CocosConfigLoader = void 0;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const types_1 = require("./types");
const console_1 = require("../../base/console");
/**
 * CocosCreator 旧配置加载器
 */
class CocosConfigLoader {
    initialized = false;
    projectPath = '';
    configMap = new Map();
    initialize(projectPath) {
        if (this.initialized)
            return;
        this.projectPath = projectPath;
        this.initialized = true;
    }
    /**
     * 根据 scope 获取路径
     * @param pkgName
     * @param scope
     * @private
     */
    getPathByScope(pkgName, scope) {
        let dir = '';
        if (scope === 'project') {
            dir = path_1.default.join(this.projectPath, 'settings');
        }
        else if (scope === 'local') {
            dir = path_1.default.join(this.projectPath, 'profiles');
        }
        else {
            dir = path_1.default.join(os_1.default.homedir(), '.CocosCreator', 'profiles');
        }
        return path_1.default.join(dir, types_1.COCOS_CREATOR_VERSION, 'packages', pkgName + '.json');
    }
    /**
     * 加载配置
     * @param scope 配置范围
     * @param pkgName 包名
     * @returns 配置对象
     */
    async loadConfig(scope, pkgName) {
        const configs = this.configMap.get(scope);
        if (configs && configs[pkgName]) {
            return configs[pkgName];
        }
        const pkgPath = this.getPathByScope(pkgName, scope);
        if (await fs_extra_1.default.pathExists(pkgPath)) {
            try {
                const pkg = await fs_extra_1.default.readJSON(pkgPath);
                const configs = this.configMap.get(scope) || {};
                configs[pkgName] = pkg;
                this.configMap.set(scope, configs);
                return pkg;
            }
            catch (error) {
                console_1.newConsole.warn(`[Migration] 加载 ${scope} 配置失败: ${pkgPath} - ${error}`);
            }
        }
        return null;
    }
}
exports.CocosConfigLoader = CocosConfigLoader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29jb3MtY29uZmlnLWxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlL2NvbmZpZ3VyYXRpb24vbWlncmF0aW9uL2NvY29zLWNvbmZpZy1sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0RBQXdCO0FBQ3hCLDRDQUFvQjtBQUNwQix3REFBMkI7QUFDM0IsbUNBQXlFO0FBQ3pFLGdEQUFnRDtBQUVoRDs7R0FFRztBQUNILE1BQWEsaUJBQWlCO0lBQ2xCLFdBQVcsR0FBRyxLQUFLLENBQUM7SUFDcEIsV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUNqQixTQUFTLEdBQXFCLElBQUksR0FBRyxFQUFFLENBQUM7SUFFekMsVUFBVSxDQUFDLFdBQW1CO1FBQ2pDLElBQUksSUFBSSxDQUFDLFdBQVc7WUFBRSxPQUFPO1FBRTdCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0lBQzVCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLGNBQWMsQ0FBQyxPQUFlLEVBQUUsS0FBOEI7UUFDbEUsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDdEIsR0FBRyxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNsRCxDQUFDO2FBQU0sSUFBSSxLQUFLLEtBQUssT0FBTyxFQUFFLENBQUM7WUFDM0IsR0FBRyxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNsRCxDQUFDO2FBQU0sQ0FBQztZQUNKLEdBQUcsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLFlBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxlQUFlLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVELE9BQU8sY0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsNkJBQXFCLEVBQUUsVUFBVSxFQUFFLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQThCLEVBQUUsT0FBZTtRQUNuRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQyxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUM5QixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDcEQsSUFBSSxNQUFNLGtCQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDO2dCQUNELE1BQU0sR0FBRyxHQUFHLE1BQU0sa0JBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDaEQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNuQyxPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNiLG9CQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixLQUFLLFVBQVUsT0FBTyxNQUFNLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDM0UsQ0FBQztRQUNMLENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUExREQsOENBMERDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBvcyBmcm9tICdvcyc7XHJcbmltcG9ydCBmc2UgZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBDb2Nvc0NyZWF0b3JDb25maWdTY29wZSwgQ09DT1NfQ1JFQVRPUl9WRVJTSU9OIH0gZnJvbSAnLi90eXBlcyc7XHJcbmltcG9ydCB7IG5ld0NvbnNvbGUgfSBmcm9tICcuLi8uLi9iYXNlL2NvbnNvbGUnO1xyXG5cclxuLyoqXHJcbiAqIENvY29zQ3JlYXRvciDml6fphY3nva7liqDovb3lmahcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb2Nvc0NvbmZpZ0xvYWRlciB7XHJcbiAgICBwcml2YXRlIGluaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIHByb2plY3RQYXRoID0gJyc7XHJcbiAgICBwcml2YXRlIGNvbmZpZ01hcDogTWFwPHN0cmluZywgYW55PiA9IG5ldyBNYXAoKTtcclxuXHJcbiAgICBwdWJsaWMgaW5pdGlhbGl6ZShwcm9qZWN0UGF0aDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5wcm9qZWN0UGF0aCA9IHByb2plY3RQYXRoO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uIHNjb3BlIOiOt+WPlui3r+W+hFxyXG4gICAgICogQHBhcmFtIHBrZ05hbWVcclxuICAgICAqIEBwYXJhbSBzY29wZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRQYXRoQnlTY29wZShwa2dOYW1lOiBzdHJpbmcsIHNjb3BlOiBDb2Nvc0NyZWF0b3JDb25maWdTY29wZSk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGRpciA9ICcnO1xyXG4gICAgICAgIGlmIChzY29wZSA9PT0gJ3Byb2plY3QnKSB7XHJcbiAgICAgICAgICAgIGRpciA9IHBhdGguam9pbih0aGlzLnByb2plY3RQYXRoLCAnc2V0dGluZ3MnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNjb3BlID09PSAnbG9jYWwnKSB7XHJcbiAgICAgICAgICAgIGRpciA9IHBhdGguam9pbih0aGlzLnByb2plY3RQYXRoLCAncHJvZmlsZXMnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkaXIgPSBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnLkNvY29zQ3JlYXRvcicsICdwcm9maWxlcycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbihkaXIsIENPQ09TX0NSRUFUT1JfVkVSU0lPTiwgJ3BhY2thZ2VzJywgcGtnTmFtZSArICcuanNvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L296YWN572uXHJcbiAgICAgKiBAcGFyYW0gc2NvcGUg6YWN572u6IyD5Zu0XHJcbiAgICAgKiBAcGFyYW0gcGtnTmFtZSDljIXlkI1cclxuICAgICAqIEByZXR1cm5zIOmFjee9ruWvueixoVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgbG9hZENvbmZpZyhzY29wZTogQ29jb3NDcmVhdG9yQ29uZmlnU2NvcGUsIHBrZ05hbWU6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgY29uc3QgY29uZmlncyA9IHRoaXMuY29uZmlnTWFwLmdldChzY29wZSk7XHJcbiAgICAgICAgaWYgKGNvbmZpZ3MgJiYgY29uZmlnc1twa2dOYW1lXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnc1twa2dOYW1lXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBrZ1BhdGggPSB0aGlzLmdldFBhdGhCeVNjb3BlKHBrZ05hbWUsIHNjb3BlKTtcclxuICAgICAgICBpZiAoYXdhaXQgZnNlLnBhdGhFeGlzdHMocGtnUGF0aCkpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBrZyA9IGF3YWl0IGZzZS5yZWFkSlNPTihwa2dQYXRoKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLmNvbmZpZ01hcC5nZXQoc2NvcGUpIHx8IHt9O1xyXG4gICAgICAgICAgICAgICAgY29uZmlnc1twa2dOYW1lXSA9IHBrZztcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnTWFwLnNldChzY29wZSwgY29uZmlncyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGtnO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgbmV3Q29uc29sZS53YXJuKGBbTWlncmF0aW9uXSDliqDovb0gJHtzY29wZX0g6YWN572u5aSx6LSlOiAke3BrZ1BhdGh9IC0gJHtlcnJvcn1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG4iXX0=