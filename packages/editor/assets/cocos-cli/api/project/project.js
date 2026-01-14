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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectApi = void 0;
const decorator_1 = require("../decorator/decorator");
const schema_base_1 = require("../base/schema-base");
const zod_1 = __importDefault(require("zod"));
class ProjectApi {
    //todo: Implement the function to close the project. Currently, starting mcp will open the project by default // 实现关闭项目的功能，目前启动 mcp 会默认打开项目
    // @tool('project-open')
    async open(projectPath) {
        let code = schema_base_1.COMMON_STATUS.SUCCESS;
        try {
            const { projectManager } = await Promise.resolve().then(() => __importStar(require('../../core/project-manager')));
            await projectManager.open(projectPath);
        }
        catch (e) {
            code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('open project fail:', e instanceof Error ? e.message : String(e) + ' path: ' + projectPath);
        }
        return {
            code: code,
            data: code === schema_base_1.COMMON_STATUS.SUCCESS
        };
    }
    //todo: Implement the function to close the project. Currently, starting mcp will open the project by default // 实现关闭项目的功能，目前启动 mcp 会默认打开项目
    // @tool('project-close')
    async close() {
        let code = schema_base_1.COMMON_STATUS.SUCCESS;
        try {
            const { projectManager } = await Promise.resolve().then(() => __importStar(require('../../core/project-manager')));
            await projectManager.close();
        }
        catch (e) {
            code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('close project fail:', e instanceof Error ? e.message : String(e));
        }
        return {
            code: code,
            data: code === schema_base_1.COMMON_STATUS.SUCCESS
        };
    }
}
exports.ProjectApi = ProjectApi;
__decorate([
    (0, decorator_1.title)('Open Cocos Creator Project') // 打开 Cocos Creator 项目
    ,
    (0, decorator_1.description)('Open the Cocos Creator project at the specified path, initialize the project environment and load the project configuration. The project path must be an absolute path pointing to the project root directory containing project.json. After successful opening, subsequent resource management, build and other operations can be performed.') // 打开指定路径的 Cocos Creator 项目，初始化项目环境并加载项目配置。项目路径必须是绝对路径，指向包含 project.json 的项目根目录。成功打开后可以进行后续的资源管理、构建等操作。
    ,
    (0, decorator_1.result)(zod_1.default.boolean().describe('Project open result, true means success, false means failure')) // 项目打开结果，true 表示成功，false 表示失败
    ,
    __param(0, (0, decorator_1.param)(schema_base_1.SchemaProjectPath)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectApi.prototype, "open", null);
__decorate([
    (0, decorator_1.title)('Close Current Cocos Creator Project') // 关闭当前 Cocos Creator 项目
    ,
    (0, decorator_1.description)('Close the currently opened Cocos Creator project, clean up project-related memory status and resources. After closing, you need to reopen the project to perform subsequent operations. It is recommended to call this method to release resources after completing all project operations.') // 关闭当前打开的 Cocos Creator 项目，清理项目相关的内存状态和资源。关闭后需要重新打开项目才能进行后续操作。建议在完成所有项目操作后调用此方法释放资源。
    ,
    (0, decorator_1.result)(zod_1.default.boolean().describe('Project close result, true means success, false means failure')) // 项目关闭结果，true 表示成功，false 表示失败
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectApi.prototype, "close", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvcHJvamVjdC9wcm9qZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNEQUFpRjtBQUNqRixxREFBeUc7QUFDekcsOENBQW9CO0FBRXBCLE1BQWEsVUFBVTtJQUVuQiwySUFBMkk7SUFDM0ksd0JBQXdCO0lBSWxCLEFBQU4sS0FBSyxDQUFDLElBQUksQ0FBMkIsV0FBbUI7UUFDcEQsSUFBSSxJQUFJLEdBQW1CLDJCQUFhLENBQUMsT0FBTyxDQUFDO1FBQ2pELElBQUksQ0FBQztZQUNELE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyx3REFBYSw0QkFBNEIsR0FBQyxDQUFDO1lBQ3RFLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNULElBQUksR0FBRywyQkFBYSxDQUFDLElBQUksQ0FBQztZQUMxQixPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUMsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUM7UUFDOUcsQ0FBQztRQUVELE9BQU87WUFDSCxJQUFJLEVBQUUsSUFBSTtZQUNWLElBQUksRUFBRSxJQUFJLEtBQUssMkJBQWEsQ0FBQyxPQUFPO1NBQ3ZDLENBQUM7SUFDTixDQUFDO0lBRUQsMklBQTJJO0lBQzNJLHlCQUF5QjtJQUluQixBQUFOLEtBQUssQ0FBQyxLQUFLO1FBQ1AsSUFBSSxJQUFJLEdBQW1CLDJCQUFhLENBQUMsT0FBTyxDQUFDO1FBQ2pELElBQUksQ0FBQztZQUNELE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyx3REFBYSw0QkFBNEIsR0FBQyxDQUFDO1lBQ3RFLE1BQU0sY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ1QsSUFBSSxHQUFHLDJCQUFhLENBQUMsSUFBSSxDQUFDO1lBQzFCLE9BQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckYsQ0FBQztRQUVELE9BQU87WUFDSCxJQUFJLEVBQUUsSUFBSTtZQUNWLElBQUksRUFBRSxJQUFJLEtBQUssMkJBQWEsQ0FBQyxPQUFPO1NBQ3ZDLENBQUM7SUFDTixDQUFDO0NBQ0o7QUEzQ0QsZ0NBMkNDO0FBcENTO0lBSEwsSUFBQSxpQkFBSyxFQUFDLDRCQUE0QixDQUFDLENBQUMsc0JBQXNCOztJQUMxRCxJQUFBLHVCQUFXLEVBQUMsK1VBQStVLENBQUMsQ0FBQyx1R0FBdUc7O0lBQ3BjLElBQUEsa0JBQU0sRUFBQyxhQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLDhEQUE4RCxDQUFDLENBQUMsQ0FBQyw4QkFBOEI7O0lBQ2hILFdBQUEsSUFBQSxpQkFBSyxFQUFDLCtCQUFpQixDQUFDLENBQUE7Ozs7c0NBY25DO0FBT0s7SUFITCxJQUFBLGlCQUFLLEVBQUMscUNBQXFDLENBQUMsQ0FBQyx3QkFBd0I7O0lBQ3JFLElBQUEsdUJBQVcsRUFBQyw2UkFBNlIsQ0FBQyxDQUFDLHFGQUFxRjs7SUFDaFksSUFBQSxrQkFBTSxFQUFDLGFBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsK0RBQStELENBQUMsQ0FBQyxDQUFDLDhCQUE4Qjs7Ozs7dUNBZTVIIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdG9vbCwgcGFyYW0sIHRpdGxlLCBkZXNjcmlwdGlvbiwgcmVzdWx0IH0gZnJvbSAnLi4vZGVjb3JhdG9yL2RlY29yYXRvcic7XHJcbmltcG9ydCB7IENPTU1PTl9TVEFUVVMsIENvbW1vblJlc3VsdFR5cGUsIEh0dHBTdGF0dXNDb2RlLCBTY2hlbWFQcm9qZWN0UGF0aCB9IGZyb20gJy4uL2Jhc2Uvc2NoZW1hLWJhc2UnO1xyXG5pbXBvcnQgeiBmcm9tICd6b2QnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFByb2plY3RBcGkge1xyXG5cclxuICAgIC8vdG9kbzogSW1wbGVtZW50IHRoZSBmdW5jdGlvbiB0byBjbG9zZSB0aGUgcHJvamVjdC4gQ3VycmVudGx5LCBzdGFydGluZyBtY3Agd2lsbCBvcGVuIHRoZSBwcm9qZWN0IGJ5IGRlZmF1bHQgLy8g5a6e546w5YWz6Zet6aG555uu55qE5Yqf6IO977yM55uu5YmN5ZCv5YqoIG1jcCDkvJrpu5jorqTmiZPlvIDpobnnm65cclxuICAgIC8vIEB0b29sKCdwcm9qZWN0LW9wZW4nKVxyXG4gICAgQHRpdGxlKCdPcGVuIENvY29zIENyZWF0b3IgUHJvamVjdCcpIC8vIOaJk+W8gCBDb2NvcyBDcmVhdG9yIOmhueebrlxyXG4gICAgQGRlc2NyaXB0aW9uKCdPcGVuIHRoZSBDb2NvcyBDcmVhdG9yIHByb2plY3QgYXQgdGhlIHNwZWNpZmllZCBwYXRoLCBpbml0aWFsaXplIHRoZSBwcm9qZWN0IGVudmlyb25tZW50IGFuZCBsb2FkIHRoZSBwcm9qZWN0IGNvbmZpZ3VyYXRpb24uIFRoZSBwcm9qZWN0IHBhdGggbXVzdCBiZSBhbiBhYnNvbHV0ZSBwYXRoIHBvaW50aW5nIHRvIHRoZSBwcm9qZWN0IHJvb3QgZGlyZWN0b3J5IGNvbnRhaW5pbmcgcHJvamVjdC5qc29uLiBBZnRlciBzdWNjZXNzZnVsIG9wZW5pbmcsIHN1YnNlcXVlbnQgcmVzb3VyY2UgbWFuYWdlbWVudCwgYnVpbGQgYW5kIG90aGVyIG9wZXJhdGlvbnMgY2FuIGJlIHBlcmZvcm1lZC4nKSAvLyDmiZPlvIDmjIflrprot6/lvoTnmoQgQ29jb3MgQ3JlYXRvciDpobnnm67vvIzliJ3lp4vljJbpobnnm67njq/looPlubbliqDovb3pobnnm67phY3nva7jgILpobnnm67ot6/lvoTlv4XpobvmmK/nu53lr7not6/lvoTvvIzmjIflkJHljIXlkKsgcHJvamVjdC5qc29uIOeahOmhueebruagueebruW9leOAguaIkOWKn+aJk+W8gOWQjuWPr+S7pei/m+ihjOWQjue7reeahOi1hOa6kOeuoeeQhuOAgeaehOW7uuetieaTjeS9nOOAglxyXG4gICAgQHJlc3VsdCh6LmJvb2xlYW4oKS5kZXNjcmliZSgnUHJvamVjdCBvcGVuIHJlc3VsdCwgdHJ1ZSBtZWFucyBzdWNjZXNzLCBmYWxzZSBtZWFucyBmYWlsdXJlJykpIC8vIOmhueebruaJk+W8gOe7k+aenO+8jHRydWUg6KGo56S65oiQ5Yqf77yMZmFsc2Ug6KGo56S65aSx6LSlXHJcbiAgICBhc3luYyBvcGVuKEBwYXJhbShTY2hlbWFQcm9qZWN0UGF0aCkgcHJvamVjdFBhdGg6IHN0cmluZyk6IFByb21pc2U8Q29tbW9uUmVzdWx0VHlwZTxib29sZWFuPj4ge1xyXG4gICAgICAgIGxldCBjb2RlOiBIdHRwU3RhdHVzQ29kZSA9IENPTU1PTl9TVEFUVVMuU1VDQ0VTUztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCB7IHByb2plY3RNYW5hZ2VyIH0gPSBhd2FpdCBpbXBvcnQoJy4uLy4uL2NvcmUvcHJvamVjdC1tYW5hZ2VyJyk7XHJcbiAgICAgICAgICAgIGF3YWl0IHByb2plY3RNYW5hZ2VyLm9wZW4ocHJvamVjdFBhdGgpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29kZSA9IENPTU1PTl9TVEFUVVMuRkFJTDtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignb3BlbiBwcm9qZWN0IGZhaWw6JywgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpICsgJyBwYXRoOiAnICsgcHJvamVjdFBhdGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY29kZTogY29kZSxcclxuICAgICAgICAgICAgZGF0YTogY29kZSA9PT0gQ09NTU9OX1NUQVRVUy5TVUNDRVNTXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvL3RvZG86IEltcGxlbWVudCB0aGUgZnVuY3Rpb24gdG8gY2xvc2UgdGhlIHByb2plY3QuIEN1cnJlbnRseSwgc3RhcnRpbmcgbWNwIHdpbGwgb3BlbiB0aGUgcHJvamVjdCBieSBkZWZhdWx0IC8vIOWunueOsOWFs+mXremhueebrueahOWKn+iDve+8jOebruWJjeWQr+WKqCBtY3Ag5Lya6buY6K6k5omT5byA6aG555uuXHJcbiAgICAvLyBAdG9vbCgncHJvamVjdC1jbG9zZScpXHJcbiAgICBAdGl0bGUoJ0Nsb3NlIEN1cnJlbnQgQ29jb3MgQ3JlYXRvciBQcm9qZWN0JykgLy8g5YWz6Zet5b2T5YmNIENvY29zIENyZWF0b3Ig6aG555uuXHJcbiAgICBAZGVzY3JpcHRpb24oJ0Nsb3NlIHRoZSBjdXJyZW50bHkgb3BlbmVkIENvY29zIENyZWF0b3IgcHJvamVjdCwgY2xlYW4gdXAgcHJvamVjdC1yZWxhdGVkIG1lbW9yeSBzdGF0dXMgYW5kIHJlc291cmNlcy4gQWZ0ZXIgY2xvc2luZywgeW91IG5lZWQgdG8gcmVvcGVuIHRoZSBwcm9qZWN0IHRvIHBlcmZvcm0gc3Vic2VxdWVudCBvcGVyYXRpb25zLiBJdCBpcyByZWNvbW1lbmRlZCB0byBjYWxsIHRoaXMgbWV0aG9kIHRvIHJlbGVhc2UgcmVzb3VyY2VzIGFmdGVyIGNvbXBsZXRpbmcgYWxsIHByb2plY3Qgb3BlcmF0aW9ucy4nKSAvLyDlhbPpl63lvZPliY3miZPlvIDnmoQgQ29jb3MgQ3JlYXRvciDpobnnm67vvIzmuIXnkIbpobnnm67nm7jlhbPnmoTlhoXlrZjnirbmgIHlkozotYTmupDjgILlhbPpl63lkI7pnIDopoHph43mlrDmiZPlvIDpobnnm67miY3og73ov5vooYzlkI7nu63mk43kvZzjgILlu7rorq7lnKjlrozmiJDmiYDmnInpobnnm67mk43kvZzlkI7osIPnlKjmraTmlrnms5Xph4rmlL7otYTmupDjgIJcclxuICAgIEByZXN1bHQoei5ib29sZWFuKCkuZGVzY3JpYmUoJ1Byb2plY3QgY2xvc2UgcmVzdWx0LCB0cnVlIG1lYW5zIHN1Y2Nlc3MsIGZhbHNlIG1lYW5zIGZhaWx1cmUnKSkgLy8g6aG555uu5YWz6Zet57uT5p6c77yMdHJ1ZSDooajnpLrmiJDlip/vvIxmYWxzZSDooajnpLrlpLHotKVcclxuICAgIGFzeW5jIGNsb3NlKCkge1xyXG4gICAgICAgIGxldCBjb2RlOiBIdHRwU3RhdHVzQ29kZSA9IENPTU1PTl9TVEFUVVMuU1VDQ0VTUztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCB7IHByb2plY3RNYW5hZ2VyIH0gPSBhd2FpdCBpbXBvcnQoJy4uLy4uL2NvcmUvcHJvamVjdC1tYW5hZ2VyJyk7XHJcbiAgICAgICAgICAgIGF3YWl0IHByb2plY3RNYW5hZ2VyLmNsb3NlKCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdjbG9zZSBwcm9qZWN0IGZhaWw6JywgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IGNvZGUgPT09IENPTU1PTl9TVEFUVVMuU1VDQ0VTU1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuIl19