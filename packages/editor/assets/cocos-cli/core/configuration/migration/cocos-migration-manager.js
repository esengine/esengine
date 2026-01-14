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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CocosMigrationManager = void 0;
const cocos_migration_1 = require("./cocos-migration");
const console_1 = require("../../base/console");
/**
 * 深度合并配置对象
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
function mergeConfigs(target, source) {
    const result = { ...target };
    if (!source || typeof source !== 'object') {
        return result;
    }
    for (const [key, value] of Object.entries(source)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            // 递归合并对象
            result[key] = mergeConfigs(result[key] || {}, value);
        }
        else {
            // 直接赋值
            result[key] = value;
        }
    }
    return result;
}
/**
 * CocosCreator 3.x 配置迁移管理器
 */
class CocosMigrationManager {
    static _targets = new Map();
    static _initialized = false;
    /**
     * 迁移器列表
     */
    static get migrationTargets() {
        return this._targets;
    }
    /**
     * 注册所有迁移器
     */
    static async registerMigration() {
        if (this._initialized) {
            return;
        }
        const { getMigrationList } = await Promise.resolve().then(() => __importStar(require('./register-migration')));
        const migrationList = getMigrationList();
        // 清空现有迁移器
        this.clear();
        // 注册所有迁移器
        this.register(migrationList);
        this._initialized = true;
        console_1.newConsole.log(`[Migration] 已注册 ${migrationList.length} 个迁移器`);
    }
    /**
     * 注册迁移器
     * @param migrationTarget 迁移器实例
     */
    static register(migrationTarget) {
        migrationTarget = !Array.isArray(migrationTarget) ? [migrationTarget] : migrationTarget;
        for (const target of migrationTarget) {
            const scope = target.targetScope || 'project';
            const items = this._targets.get(scope) || [];
            items.push(target);
            this._targets.set(scope, items);
            console_1.newConsole.debug(`[Migration] 已注册迁移插件: ${target.pluginName}`);
        }
    }
    /**
     * 执行迁移
     * @param projectPath 项目路径
     * @returns 迁移后的新配置
     */
    static async migrate(projectPath) {
        await this.registerMigration();
        if (this._targets.size === 0) {
            throw new Error('[Migration] 没有注册任何迁移器');
        }
        const result = CocosMigrationManager.createConfigList();
        console_1.newConsole.log(`[Migration] 开始执行迁移`);
        let success = true;
        // 执行所有注册的迁移
        for (const items of this._targets.values()) {
            for (const target of items) {
                try {
                    const targetScope = target.targetScope || 'project';
                    const migratedConfig = await cocos_migration_1.CocosMigration.migrate(projectPath, target);
                    result[targetScope] = mergeConfigs(result[targetScope], migratedConfig);
                    console_1.newConsole.debug(`[Migration] 迁移完成: ${target.pluginName}`);
                }
                catch (error) {
                    success = false;
                    console.error(error);
                    console_1.newConsole.error(`[Migration] 迁移失败: ${target.pluginName}`);
                }
            }
        }
        if (!success) {
            throw new Error('[Migration] 迁移失败, 详情请查看日志');
        }
        console_1.newConsole.log('[Migration] 所有迁移执行成功');
        return result;
    }
    /**
     * 清空所有迁移器
     */
    static clear() {
        this._targets.clear();
        console_1.newConsole.debug('[Migration] 已清空所有迁移器');
    }
    /**
     * 生成新的配置
     * @private
     */
    static createConfigList() {
        return {
            project: {},
        };
    }
}
exports.CocosMigrationManager = CocosMigrationManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29jb3MtbWlncmF0aW9uLW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9jb25maWd1cmF0aW9uL21pZ3JhdGlvbi9jb2Nvcy1taWdyYXRpb24tbWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSx1REFBbUQ7QUFDbkQsZ0RBQWdEO0FBRWhEOzs7OztHQUtHO0FBQ0gsU0FBUyxZQUFZLENBQUMsTUFBVyxFQUFFLE1BQVc7SUFDMUMsTUFBTSxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sRUFBRSxDQUFDO0lBRTdCLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDeEMsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDaEQsSUFBSSxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQzlELFNBQVM7WUFDVCxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekQsQ0FBQzthQUFNLENBQUM7WUFDSixPQUFPO1lBQ1AsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUN4QixDQUFDO0lBQ0wsQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFFRDs7R0FFRztBQUNILE1BQWEscUJBQXFCO0lBQ3RCLE1BQU0sQ0FBQyxRQUFRLEdBQWlELElBQUksR0FBRyxFQUFFLENBQUM7SUFDMUUs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O29CQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNyQixvQkFBVSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7Z0JBQy9ELENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUNELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBRUQsb0JBQVUsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUN2QyxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNLENBQUMsS0FBSztRQUNmLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdEIsb0JBQVUsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssTUFBTSxDQUFDLGdCQUFnQjtRQUMzQixPQUFPO1lBQ0gsT0FBTyxFQUFFLEVBQUU7U0FDZCxDQUFDO0lBQ04sQ0FBQzs7QUFwR0wsc0RBcUdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29jb3NDTElDb25maWdTY29wZSwgSU1pZ3JhdGlvblRhcmdldCB9IGZyb20gJy4vdHlwZXMnO1xyXG5pbXBvcnQgeyBDb2Nvc01pZ3JhdGlvbiB9IGZyb20gJy4vY29jb3MtbWlncmF0aW9uJztcclxuaW1wb3J0IHsgbmV3Q29uc29sZSB9IGZyb20gJy4uLy4uL2Jhc2UvY29uc29sZSc7XHJcblxyXG4vKipcclxuICog5rex5bqm5ZCI5bm26YWN572u5a+56LGhXHJcbiAqIEBwYXJhbSB0YXJnZXQg55uu5qCH5a+56LGhXHJcbiAqIEBwYXJhbSBzb3VyY2Ug5rqQ5a+56LGhXHJcbiAqIEByZXR1cm5zIOWQiOW5tuWQjueahOWvueixoVxyXG4gKi9cclxuZnVuY3Rpb24gbWVyZ2VDb25maWdzKHRhcmdldDogYW55LCBzb3VyY2U6IGFueSk6IGFueSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSB7IC4uLnRhcmdldCB9O1xyXG5cclxuICAgIGlmICghc291cmNlIHx8IHR5cGVvZiBzb3VyY2UgIT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzb3VyY2UpKSB7XHJcbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIC8vIOmAkuW9kuWQiOW5tuWvueixoVxyXG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IG1lcmdlQ29uZmlncyhyZXN1bHRba2V5XSB8fCB7fSwgdmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIOebtOaOpei1i+WAvFxyXG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogQ29jb3NDcmVhdG9yIDMueCDphY3nva7ov4Hnp7vnrqHnkIblmahcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb2Nvc01pZ3JhdGlvbk1hbmFnZXIge1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3RhcmdldHM6IE1hcDxDb2Nvc0NMSUNvbmZpZ1Njb3BlLCBJTWlncmF0aW9uVGFyZ2V0W10+ID0gbmV3IE1hcCgpO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDov4Hnp7vlmajliJfooahcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXQgbWlncmF0aW9uVGFyZ2V0cygpOiBNYXA8Q29jb3NDTElDb25maWdTY29wZSwgSU1pZ3JhdGlvblRhcmdldFtdPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RhcmdldHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jlhozmiYDmnInov4Hnp7vlmahcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgcmVnaXN0ZXJNaWdyYXRpb24oKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHsgZ2V0TWlncmF0aW9uTGlzdCB9ID0gYXdhaXQgaW1wb3J0KCcuL3JlZ2lzdGVyLW1pZ3JhdGlvbicpO1xyXG4gICAgICAgIGNvbnN0IG1pZ3JhdGlvbkxpc3QgPSBnZXRNaWdyYXRpb25MaXN0KCk7XHJcblxyXG4gICAgICAgIC8vIOa4heepuueOsOaciei/geenu+WZqFxyXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcclxuXHJcbiAgICAgICAgLy8g5rOo5YaM5omA5pyJ6L+B56e75ZmoXHJcbiAgICAgICAgdGhpcy5yZWdpc3RlcihtaWdyYXRpb25MaXN0KTtcclxuXHJcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICAgIG5ld0NvbnNvbGUubG9nKGBbTWlncmF0aW9uXSDlt7Lms6jlhowgJHttaWdyYXRpb25MaXN0Lmxlbmd0aH0g5Liq6L+B56e75ZmoYCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jlhozov4Hnp7vlmahcclxuICAgICAqIEBwYXJhbSBtaWdyYXRpb25UYXJnZXQg6L+B56e75Zmo5a6e5L6LXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmVnaXN0ZXIobWlncmF0aW9uVGFyZ2V0OiBJTWlncmF0aW9uVGFyZ2V0IHwgSU1pZ3JhdGlvblRhcmdldFtdKTogdm9pZCB7XHJcbiAgICAgICAgbWlncmF0aW9uVGFyZ2V0ID0gIUFycmF5LmlzQXJyYXkobWlncmF0aW9uVGFyZ2V0KSA/IFttaWdyYXRpb25UYXJnZXRdIDogbWlncmF0aW9uVGFyZ2V0O1xyXG4gICAgICAgIGZvciAoY29uc3QgdGFyZ2V0IG9mIG1pZ3JhdGlvblRhcmdldCkge1xyXG4gICAgICAgICAgICBjb25zdCBzY29wZSA9IHRhcmdldC50YXJnZXRTY29wZSB8fCAncHJvamVjdCc7XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5fdGFyZ2V0cy5nZXQoc2NvcGUpIHx8IFtdO1xyXG4gICAgICAgICAgICBpdGVtcy5wdXNoKHRhcmdldCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3RhcmdldHMuc2V0KHNjb3BlLCBpdGVtcyk7XHJcbiAgICAgICAgICAgIG5ld0NvbnNvbGUuZGVidWcoYFtNaWdyYXRpb25dIOW3suazqOWGjOi/geenu+aPkuS7tjogJHt0YXJnZXQucGx1Z2luTmFtZX1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmiafooYzov4Hnp7tcclxuICAgICAqIEBwYXJhbSBwcm9qZWN0UGF0aCDpobnnm67ot6/lvoRcclxuICAgICAqIEByZXR1cm5zIOi/geenu+WQjueahOaWsOmFjee9rlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIG1pZ3JhdGUocHJvamVjdFBhdGg6IHN0cmluZyk6IFByb21pc2U8UmVjb3JkPENvY29zQ0xJQ29uZmlnU2NvcGUsIFJlY29yZDxzdHJpbmcsIGFueT4+PiB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5yZWdpc3Rlck1pZ3JhdGlvbigpO1xyXG4gICAgICAgIGlmICh0aGlzLl90YXJnZXRzLnNpemUgPT09IDApIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdbTWlncmF0aW9uXSDmsqHmnInms6jlhozku7vkvZXov4Hnp7vlmagnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVzdWx0OiBSZWNvcmQ8Q29jb3NDTElDb25maWdTY29wZSwgUmVjb3JkPHN0cmluZywgYW55Pj4gPSBDb2Nvc01pZ3JhdGlvbk1hbmFnZXIuY3JlYXRlQ29uZmlnTGlzdCgpO1xyXG5cclxuICAgICAgICBuZXdDb25zb2xlLmxvZyhgW01pZ3JhdGlvbl0g5byA5aeL5omn6KGM6L+B56e7YCk7XHJcbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgIC8vIOaJp+ihjOaJgOacieazqOWGjOeahOi/geenu1xyXG4gICAgICAgIGZvciAoY29uc3QgaXRlbXMgb2YgdGhpcy5fdGFyZ2V0cy52YWx1ZXMoKSkge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRhcmdldCBvZiBpdGVtcykge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRTY29wZSA9IHRhcmdldC50YXJnZXRTY29wZSB8fCAncHJvamVjdCc7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWlncmF0ZWRDb25maWcgPSBhd2FpdCBDb2Nvc01pZ3JhdGlvbi5taWdyYXRlKHByb2plY3RQYXRoLCB0YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFt0YXJnZXRTY29wZV0gPSBtZXJnZUNvbmZpZ3MocmVzdWx0W3RhcmdldFNjb3BlXSwgbWlncmF0ZWRDb25maWcpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0NvbnNvbGUuZGVidWcoYFtNaWdyYXRpb25dIOi/geenu+WujOaIkDogJHt0YXJnZXQucGx1Z2luTmFtZX1gKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0NvbnNvbGUuZXJyb3IoYFtNaWdyYXRpb25dIOi/geenu+Wksei0pTogJHt0YXJnZXQucGx1Z2luTmFtZX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdbTWlncmF0aW9uXSDov4Hnp7vlpLHotKUsIOivpuaDheivt+afpeeci+aXpeW/lycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbmV3Q29uc29sZS5sb2coJ1tNaWdyYXRpb25dIOaJgOaciei/geenu+aJp+ihjOaIkOWKnycpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmuIXnqbrmiYDmnInov4Hnp7vlmahcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl90YXJnZXRzLmNsZWFyKCk7XHJcbiAgICAgICAgbmV3Q29uc29sZS5kZWJ1ZygnW01pZ3JhdGlvbl0g5bey5riF56m65omA5pyJ6L+B56e75ZmoJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnlJ/miJDmlrDnmoTphY3nva5cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc3RhdGljIGNyZWF0ZUNvbmZpZ0xpc3QoKTogUmVjb3JkPENvY29zQ0xJQ29uZmlnU2NvcGUsIFJlY29yZDxzdHJpbmcsIGFueT4+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBwcm9qZWN0OiB7fSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbiJdfQ==