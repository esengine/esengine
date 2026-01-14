"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CocosMigration = void 0;
const cocos_config_loader_1 = require("./cocos-config-loader");
/**
 * CocosCreator 配置迁移器实现
 */
class CocosMigration {
    static loader = new cocos_config_loader_1.CocosConfigLoader();
    /**
     * 执行迁移
     * @param projectPath 项目路径
     * @param target 迁移目标配置
     * @returns 迁移后的新配置
     */
    static async migrate(projectPath, target) {
        CocosMigration.loader.initialize(projectPath);
        const oldPluginConfig = await CocosMigration.loader.loadConfig(target.sourceScope, target.pluginName);
        if (!oldPluginConfig)
            return {};
        let migratedConfig = await target.migrate(oldPluginConfig);
        // 应用目标路径
        if (target.targetPath) {
            migratedConfig = CocosMigration.applyTargetPath(migratedConfig, target.targetPath);
        }
        return migratedConfig;
    }
    /**
     * 应用目标路径
     * @param config 配置对象
     * @param targetPath 目标路径
     * @returns 应用路径后的配置
     */
    static applyTargetPath(config, targetPath) {
        if (!targetPath)
            return config;
        const pathParts = targetPath.split('.');
        let result = config;
        // 从后往前构建嵌套对象
        for (let i = pathParts.length - 1; i >= 0; i--) {
            result = { [pathParts[i]]: result };
        }
        return result;
    }
}
exports.CocosMigration = CocosMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29jb3MtbWlncmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvY29uZmlndXJhdGlvbi9taWdyYXRpb24vY29jb3MtbWlncmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQUEwRDtBQUUxRDs7R0FFRztBQUNILE1BQWEsY0FBYztJQUNmLE1BQU0sQ0FBQyxNQUFNLEdBQXNCLElBQUksdUNBQWlCLEVBQUUsQ0FBQztJQUVuRTs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQW1CLEVBQUUsTUFBd0I7UUFDckUsY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDOUMsTUFBTSxlQUFlLEdBQUcsTUFBTSxjQUFjLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0RyxJQUFJLENBQUMsZUFBZTtZQUFFLE9BQU8sRUFBRSxDQUFDO1FBRWhDLElBQUksY0FBYyxHQUFRLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUVoRSxTQUFTO1FBQ1QsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDcEIsY0FBYyxHQUFHLGNBQWMsQ0FBQyxlQUFlLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2RixDQUFDO1FBRUQsT0FBTyxjQUFjLENBQUM7SUFDMUIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFXLEVBQUUsVUFBa0I7UUFDMUQsSUFBSSxDQUFDLFVBQVU7WUFBRSxPQUFPLE1BQU0sQ0FBQztRQUUvQixNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVwQixhQUFhO1FBQ2IsS0FBSyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDN0MsTUFBTSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQztRQUN4QyxDQUFDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQzs7QUExQ0wsd0NBMkNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSU1pZ3JhdGlvblRhcmdldCB9IGZyb20gJy4vdHlwZXMnO1xyXG5pbXBvcnQgeyBDb2Nvc0NvbmZpZ0xvYWRlciB9IGZyb20gJy4vY29jb3MtY29uZmlnLWxvYWRlcic7XHJcblxyXG4vKipcclxuICogQ29jb3NDcmVhdG9yIOmFjee9rui/geenu+WZqOWunueOsFxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENvY29zTWlncmF0aW9uIHtcclxuICAgIHByaXZhdGUgc3RhdGljIGxvYWRlcjogQ29jb3NDb25maWdMb2FkZXIgPSBuZXcgQ29jb3NDb25maWdMb2FkZXIoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOaJp+ihjOi/geenu1xyXG4gICAgICogQHBhcmFtIHByb2plY3RQYXRoIOmhueebrui3r+W+hFxyXG4gICAgICogQHBhcmFtIHRhcmdldCDov4Hnp7vnm67moIfphY3nva5cclxuICAgICAqIEByZXR1cm5zIOi/geenu+WQjueahOaWsOmFjee9rlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIG1pZ3JhdGUocHJvamVjdFBhdGg6IHN0cmluZywgdGFyZ2V0OiBJTWlncmF0aW9uVGFyZ2V0KTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICBDb2Nvc01pZ3JhdGlvbi5sb2FkZXIuaW5pdGlhbGl6ZShwcm9qZWN0UGF0aCk7XHJcbiAgICAgICAgY29uc3Qgb2xkUGx1Z2luQ29uZmlnID0gYXdhaXQgQ29jb3NNaWdyYXRpb24ubG9hZGVyLmxvYWRDb25maWcodGFyZ2V0LnNvdXJjZVNjb3BlLCB0YXJnZXQucGx1Z2luTmFtZSk7XHJcbiAgICAgICAgaWYgKCFvbGRQbHVnaW5Db25maWcpIHJldHVybiB7fTtcclxuXHJcbiAgICAgICAgbGV0IG1pZ3JhdGVkQ29uZmlnOiBhbnkgPSBhd2FpdCB0YXJnZXQubWlncmF0ZShvbGRQbHVnaW5Db25maWcpO1xyXG5cclxuICAgICAgICAvLyDlupTnlKjnm67moIfot6/lvoRcclxuICAgICAgICBpZiAodGFyZ2V0LnRhcmdldFBhdGgpIHtcclxuICAgICAgICAgICAgbWlncmF0ZWRDb25maWcgPSBDb2Nvc01pZ3JhdGlvbi5hcHBseVRhcmdldFBhdGgobWlncmF0ZWRDb25maWcsIHRhcmdldC50YXJnZXRQYXRoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBtaWdyYXRlZENvbmZpZztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOW6lOeUqOebruagh+i3r+W+hFxyXG4gICAgICogQHBhcmFtIGNvbmZpZyDphY3nva7lr7nosaFcclxuICAgICAqIEBwYXJhbSB0YXJnZXRQYXRoIOebruagh+i3r+W+hFxyXG4gICAgICogQHJldHVybnMg5bqU55So6Lev5b6E5ZCO55qE6YWN572uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc3RhdGljIGFwcGx5VGFyZ2V0UGF0aChjb25maWc6IGFueSwgdGFyZ2V0UGF0aDogc3RyaW5nKTogYW55IHtcclxuICAgICAgICBpZiAoIXRhcmdldFBhdGgpIHJldHVybiBjb25maWc7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhdGhQYXJ0cyA9IHRhcmdldFBhdGguc3BsaXQoJy4nKTtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gY29uZmlnO1xyXG5cclxuICAgICAgICAvLyDku47lkI7lvoDliY3mnoTlu7rltYzlpZflr7nosaFcclxuICAgICAgICBmb3IgKGxldCBpID0gcGF0aFBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHsgW3BhdGhQYXJ0c1tpXV06IHJlc3VsdCB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxyXG4iXX0=