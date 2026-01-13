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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationApi = void 0;
const decorator_1 = require("../decorator/decorator");
const zod_1 = require("zod");
const schema_base_1 = require("../base/schema-base");
// TODO Interface definition? // 接口定义？
const SchemaMigrateResult = zod_1.z.record(zod_1.z.string(), zod_1.z.any()).describe('Migration result'); // 迁移结果
const SchemaReloadResult = zod_1.z.object({
    success: zod_1.z.boolean().describe('Whether reload is successful'), // 重新加载是否成功
    message: zod_1.z.string().describe('Operation result message') // 操作结果消息
}).describe('Reload configuration result'); // 重新加载配置结果
class ConfigurationApi {
    async migrateFromProject() {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: {},
        };
        try {
            const project = await Promise.resolve().then(() => __importStar(require('../../core/project/index')));
            const { configurationManager } = await Promise.resolve().then(() => __importStar(require('../../core/configuration/index')));
            const result = await configurationManager.migrateFromProject(project.default.path);
            ret.data = result;
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('Configuration migration failed:', e instanceof Error ? e.message : String(e)); // 配置迁移失败:
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    // @tool('configuration-reload')
    async reload() {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: {
                success: false,
                message: ''
            },
        };
        try {
            const { configurationManager } = await Promise.resolve().then(() => __importStar(require('../../core/configuration/index')));
            await configurationManager.reload();
            ret.data = {
                success: true,
                message: 'Configuration reloaded successfully' // 配置重新加载成功
            };
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error('Configuration reload failed:', errorMessage); // 配置重新加载失败:
            ret.data = {
                success: false,
                message: `Configuration reload failed: ${errorMessage}` // 配置重新加载失败: ${errorMessage}
            };
            ret.reason = errorMessage;
        }
        return ret;
    }
}
exports.ConfigurationApi = ConfigurationApi;
__decorate([
    (0, decorator_1.tool)('configuration-remigrate'),
    (0, decorator_1.title)('Re-migrate configuration') // 重新迁移配置
    ,
    (0, decorator_1.description)('Re-migrate and generate cocos.config.json from the settings directory of the current project') // 从当前项目的 settings 目录重新迁移生成 cocos.config.json
    ,
    (0, decorator_1.result)(SchemaMigrateResult),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationApi.prototype, "migrateFromProject", null);
__decorate([
    (0, decorator_1.title)('Reload configuration') // 重新加载配置
    ,
    (0, decorator_1.description)('Reload configuration from the configuration file on the disk, used to refresh the configuration status') // 从硬盘的配置文件重新加载配置，用于刷新配置状态
    ,
    (0, decorator_1.result)(SchemaReloadResult),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationApi.prototype, "reload", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvY29uZmlndXJhdGlvbi9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNEQUFpRjtBQUNqRiw2QkFBd0I7QUFDeEIscURBQXNGO0FBRXRGLHNDQUFzQztBQUN0QyxNQUFNLG1CQUFtQixHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUMsT0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLE9BQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsT0FBTztBQUcvRixNQUFNLGtCQUFrQixHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUM7SUFDaEMsT0FBTyxFQUFFLE9BQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsOEJBQThCLENBQUMsRUFBRSxXQUFXO0lBQzFFLE9BQU8sRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDLENBQUMsU0FBUztDQUNyRSxDQUFDLENBQUMsUUFBUSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxXQUFXO0FBR3ZELE1BQWEsZ0JBQWdCO0lBTW5CLEFBQU4sS0FBSyxDQUFDLGtCQUFrQjtRQUNwQixNQUFNLElBQUksR0FBbUIsMkJBQWEsQ0FBQyxPQUFPLENBQUM7UUFDbkQsTUFBTSxHQUFHLEdBQXFDO1lBQzFDLElBQUksRUFBRSxJQUFJO1lBQ1YsSUFBSSxFQUFFLEVBQUU7U0FDWCxDQUFDO1FBRUYsSUFBSSxDQUFDO1lBQ0QsTUFBTSxPQUFPLEdBQUcsd0RBQWEsMEJBQTBCLEdBQUMsQ0FBQztZQUN6RCxNQUFNLEVBQUUsb0JBQW9CLEVBQUUsR0FBRyx3REFBYSxnQ0FBZ0MsR0FBQyxDQUFDO1lBQ2hGLE1BQU0sTUFBTSxHQUFHLE1BQU0sb0JBQW9CLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRixHQUFHLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztRQUN0QixDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNULEdBQUcsQ0FBQyxJQUFJLEdBQUcsMkJBQWEsQ0FBQyxJQUFJLENBQUM7WUFDOUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVU7WUFDeEcsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVELGdDQUFnQztJQUkxQixBQUFOLEtBQUssQ0FBQyxNQUFNO1FBQ1IsTUFBTSxJQUFJLEdBQW1CLDJCQUFhLENBQUMsT0FBTyxDQUFDO1FBQ25ELE1BQU0sR0FBRyxHQUFvQztZQUN6QyxJQUFJLEVBQUUsSUFBSTtZQUNWLElBQUksRUFBRTtnQkFDRixPQUFPLEVBQUUsS0FBSztnQkFDZCxPQUFPLEVBQUUsRUFBRTthQUNkO1NBQ0osQ0FBQztRQUVGLElBQUksQ0FBQztZQUNELE1BQU0sRUFBRSxvQkFBb0IsRUFBRSxHQUFHLHdEQUFhLGdDQUFnQyxHQUFDLENBQUM7WUFDaEYsTUFBTSxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNwQyxHQUFHLENBQUMsSUFBSSxHQUFHO2dCQUNQLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE9BQU8sRUFBRSxxQ0FBcUMsQ0FBQyxXQUFXO2FBQzdELENBQUM7UUFDTixDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNULEdBQUcsQ0FBQyxJQUFJLEdBQUcsMkJBQWEsQ0FBQyxJQUFJLENBQUM7WUFDOUIsTUFBTSxZQUFZLEdBQUcsQ0FBQyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEJBQThCLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZO1lBQ3pFLEdBQUcsQ0FBQyxJQUFJLEdBQUc7Z0JBQ1AsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsT0FBTyxFQUFFLGdDQUFnQyxZQUFZLEVBQUUsQ0FBQyw0QkFBNEI7YUFDdkYsQ0FBQztZQUNGLEdBQUcsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDO1FBQzlCLENBQUM7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7Q0FDSjtBQTdERCw0Q0E2REM7QUF2RFM7SUFKTCxJQUFBLGdCQUFJLEVBQUMseUJBQXlCLENBQUM7SUFDL0IsSUFBQSxpQkFBSyxFQUFDLDBCQUEwQixDQUFDLENBQUMsU0FBUzs7SUFDM0MsSUFBQSx1QkFBVyxFQUFDLDhGQUE4RixDQUFDLENBQUMsNkNBQTZDOztJQUN6SixJQUFBLGtCQUFNLEVBQUMsbUJBQW1CLENBQUM7Ozs7MERBb0IzQjtBQU1LO0lBSEwsSUFBQSxpQkFBSyxFQUFDLHNCQUFzQixDQUFDLENBQUMsU0FBUzs7SUFDdkMsSUFBQSx1QkFBVyxFQUFDLHdHQUF3RyxDQUFDLENBQUMsMEJBQTBCOztJQUNoSixJQUFBLGtCQUFNLEVBQUMsa0JBQWtCLENBQUM7Ozs7OENBOEIxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlc2NyaXB0aW9uLCBwYXJhbSwgcmVzdWx0LCB0aXRsZSwgdG9vbCB9IGZyb20gJy4uL2RlY29yYXRvci9kZWNvcmF0b3InO1xyXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcclxuaW1wb3J0IHsgQ09NTU9OX1NUQVRVUywgQ29tbW9uUmVzdWx0VHlwZSwgSHR0cFN0YXR1c0NvZGUgfSBmcm9tICcuLi9iYXNlL3NjaGVtYS1iYXNlJztcclxuXHJcbi8vIFRPRE8gSW50ZXJmYWNlIGRlZmluaXRpb24/IC8vIOaOpeWPo+WumuS5ie+8n1xyXG5jb25zdCBTY2hlbWFNaWdyYXRlUmVzdWx0ID0gei5yZWNvcmQoei5zdHJpbmcoKSwgei5hbnkoKSkuZGVzY3JpYmUoJ01pZ3JhdGlvbiByZXN1bHQnKTsgLy8g6L+B56e757uT5p6cXHJcbmV4cG9ydCB0eXBlIFRNaWdyYXRlUmVzdWx0ID0gei5pbmZlcjx0eXBlb2YgU2NoZW1hTWlncmF0ZVJlc3VsdD47XHJcblxyXG5jb25zdCBTY2hlbWFSZWxvYWRSZXN1bHQgPSB6Lm9iamVjdCh7XHJcbiAgICBzdWNjZXNzOiB6LmJvb2xlYW4oKS5kZXNjcmliZSgnV2hldGhlciByZWxvYWQgaXMgc3VjY2Vzc2Z1bCcpLCAvLyDph43mlrDliqDovb3mmK/lkKbmiJDlip9cclxuICAgIG1lc3NhZ2U6IHouc3RyaW5nKCkuZGVzY3JpYmUoJ09wZXJhdGlvbiByZXN1bHQgbWVzc2FnZScpIC8vIOaTjeS9nOe7k+aenOa2iOaBr1xyXG59KS5kZXNjcmliZSgnUmVsb2FkIGNvbmZpZ3VyYXRpb24gcmVzdWx0Jyk7IC8vIOmHjeaWsOWKoOi9vemFjee9rue7k+aenFxyXG5leHBvcnQgdHlwZSBUUmVsb2FkUmVzdWx0ID0gei5pbmZlcjx0eXBlb2YgU2NoZW1hUmVsb2FkUmVzdWx0PjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb25maWd1cmF0aW9uQXBpIHtcclxuXHJcbiAgICBAdG9vbCgnY29uZmlndXJhdGlvbi1yZW1pZ3JhdGUnKVxyXG4gICAgQHRpdGxlKCdSZS1taWdyYXRlIGNvbmZpZ3VyYXRpb24nKSAvLyDph43mlrDov4Hnp7vphY3nva5cclxuICAgIEBkZXNjcmlwdGlvbignUmUtbWlncmF0ZSBhbmQgZ2VuZXJhdGUgY29jb3MuY29uZmlnLmpzb24gZnJvbSB0aGUgc2V0dGluZ3MgZGlyZWN0b3J5IG9mIHRoZSBjdXJyZW50IHByb2plY3QnKSAvLyDku47lvZPliY3pobnnm67nmoQgc2V0dGluZ3Mg55uu5b2V6YeN5paw6L+B56e755Sf5oiQIGNvY29zLmNvbmZpZy5qc29uXHJcbiAgICBAcmVzdWx0KFNjaGVtYU1pZ3JhdGVSZXN1bHQpXHJcbiAgICBhc3luYyBtaWdyYXRlRnJvbVByb2plY3QoKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRNaWdyYXRlUmVzdWx0Pj4ge1xyXG4gICAgICAgIGNvbnN0IGNvZGU6IEh0dHBTdGF0dXNDb2RlID0gQ09NTU9OX1NUQVRVUy5TVUNDRVNTO1xyXG4gICAgICAgIGNvbnN0IHJldDogQ29tbW9uUmVzdWx0VHlwZTxUTWlncmF0ZVJlc3VsdD4gPSB7XHJcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IHt9LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhd2FpdCBpbXBvcnQoJy4uLy4uL2NvcmUvcHJvamVjdC9pbmRleCcpO1xyXG4gICAgICAgICAgICBjb25zdCB7IGNvbmZpZ3VyYXRpb25NYW5hZ2VyIH0gPSBhd2FpdCBpbXBvcnQoJy4uLy4uL2NvcmUvY29uZmlndXJhdGlvbi9pbmRleCcpO1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjb25maWd1cmF0aW9uTWFuYWdlci5taWdyYXRlRnJvbVByb2plY3QocHJvamVjdC5kZWZhdWx0LnBhdGgpO1xyXG4gICAgICAgICAgICByZXQuZGF0YSA9IHJlc3VsdDtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb25maWd1cmF0aW9uIG1pZ3JhdGlvbiBmYWlsZWQ6JywgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpKTsgLy8g6YWN572u6L+B56e75aSx6LSlOlxyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAdG9vbCgnY29uZmlndXJhdGlvbi1yZWxvYWQnKVxyXG4gICAgQHRpdGxlKCdSZWxvYWQgY29uZmlndXJhdGlvbicpIC8vIOmHjeaWsOWKoOi9vemFjee9rlxyXG4gICAgQGRlc2NyaXB0aW9uKCdSZWxvYWQgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBjb25maWd1cmF0aW9uIGZpbGUgb24gdGhlIGRpc2ssIHVzZWQgdG8gcmVmcmVzaCB0aGUgY29uZmlndXJhdGlvbiBzdGF0dXMnKSAvLyDku47noaznm5jnmoTphY3nva7mlofku7bph43mlrDliqDovb3phY3nva7vvIznlKjkuo7liLfmlrDphY3nva7nirbmgIFcclxuICAgIEByZXN1bHQoU2NoZW1hUmVsb2FkUmVzdWx0KVxyXG4gICAgYXN5bmMgcmVsb2FkKCk6IFByb21pc2U8Q29tbW9uUmVzdWx0VHlwZTxUUmVsb2FkUmVzdWx0Pj4ge1xyXG4gICAgICAgIGNvbnN0IGNvZGU6IEh0dHBTdGF0dXNDb2RlID0gQ09NTU9OX1NUQVRVUy5TVUNDRVNTO1xyXG4gICAgICAgIGNvbnN0IHJldDogQ29tbW9uUmVzdWx0VHlwZTxUUmVsb2FkUmVzdWx0PiA9IHtcclxuICAgICAgICAgICAgY29kZTogY29kZSxcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgY29uZmlndXJhdGlvbk1hbmFnZXIgfSA9IGF3YWl0IGltcG9ydCgnLi4vLi4vY29yZS9jb25maWd1cmF0aW9uL2luZGV4Jyk7XHJcbiAgICAgICAgICAgIGF3YWl0IGNvbmZpZ3VyYXRpb25NYW5hZ2VyLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICByZXQuZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnQ29uZmlndXJhdGlvbiByZWxvYWRlZCBzdWNjZXNzZnVsbHknIC8vIOmFjee9rumHjeaWsOWKoOi9veaIkOWKn1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0LmNvZGUgPSBDT01NT05fU1RBVFVTLkZBSUw7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKTtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ29uZmlndXJhdGlvbiByZWxvYWQgZmFpbGVkOicsIGVycm9yTWVzc2FnZSk7IC8vIOmFjee9rumHjeaWsOWKoOi9veWksei0pTpcclxuICAgICAgICAgICAgcmV0LmRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBDb25maWd1cmF0aW9uIHJlbG9hZCBmYWlsZWQ6ICR7ZXJyb3JNZXNzYWdlfWAgLy8g6YWN572u6YeN5paw5Yqg6L295aSx6LSlOiAke2Vycm9yTWVzc2FnZX1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGVycm9yTWVzc2FnZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcbn1cclxuIl19