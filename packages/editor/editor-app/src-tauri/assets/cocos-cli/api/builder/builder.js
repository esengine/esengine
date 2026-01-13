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
exports.BuilderApi = void 0;
const builder_1 = require("../../core/builder");
const schema_base_1 = require("../base/schema-base");
const decorator_1 = require("../decorator/decorator");
const schema_1 = require("./schema");
class BuilderApi {
    async build(platform, options) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            const res = await (0, builder_1.build)(platform, options);
            ret.data = res;
            if (res.code !== 0 /* BuildExitCode.BUILD_SUCCESS */) {
                ret.code = schema_base_1.COMMON_STATUS.FAIL;
                ret.reason = res.reason || 'Build failed!';
            }
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('build project failed:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    // @tool('builder-get-preview-settings')
    // @title('Get Preview Settings') // 获取预览设置
    // @description('Get Preview Settings') // 获取预览设置
    // @result(SchemaPreviewSettingsResult)
    // async getPreviewSettings() {
    //     const code: HttpStatusCode = COMMON_STATUS.SUCCESS;
    //     const ret: CommonResultType<TPreviewSettingsResult> = {
    //         code: code,
    //         data: null,
    //     };
    //     try {
    //         ret.data = await getPreviewSettings();
    //     } catch (e) {
    //         ret.code = COMMON_STATUS.FAIL;
    //         console.error('get preview settings fail:', e instanceof Error ? e.message : String(e));
    //         ret.reason = e instanceof Error ? e.message : String(e);
    //     }
    //     return ret;
    // }
    async queryDefaultBuildConfig(platform) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            // Temporarily bypassed // 暂时绕过
            ret.data = await (0, builder_1.queryDefaultBuildConfigByPlatform)(platform);
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('query default build config by platform fail:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    async make(platform, dest) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            const res = await (0, builder_1.executeBuildStageTask)(platform, 'make', {
                dest,
                platform,
            });
            ret.data = res;
            if (res.code !== 0 /* BuildExitCode.BUILD_SUCCESS */) {
                ret.code = schema_base_1.COMMON_STATUS.FAIL;
                ret.reason = res.reason || `Make ${platform} in ${dest} failed!`;
            }
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error(`make project ${dest} in platform ${platform} failed:`, e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    async run(platform, dest) {
        const code = schema_base_1.COMMON_STATUS.SUCCESS;
        const ret = {
            code: code,
            data: null,
        };
        try {
            const res = await (0, builder_1.executeBuildStageTask)(platform, 'run', {
                dest,
                platform,
            });
            ret.data = res;
            if (res.code !== 0 /* BuildExitCode.BUILD_SUCCESS */) {
                ret.code = schema_base_1.COMMON_STATUS.FAIL;
                ret.reason = res.reason || `Run ${platform} in ${dest} failed!`;
            }
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('run build result failed:', e instanceof Error ? e.message : String(e));
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
}
exports.BuilderApi = BuilderApi;
__decorate([
    (0, decorator_1.tool)('builder-build'),
    (0, decorator_1.title)('Build Project') // 构建项目
    ,
    (0, decorator_1.description)('Build the project into a game package for the specified platform based on options. If build options are already set in the project, no parameters are needed.') // 根据选项将项目构建成指定平台游戏包, 如项目内已经设置好构建选项，则不需要传入参数
    ,
    (0, decorator_1.result)(schema_1.SchemaBuildResult),
    __param(0, (0, decorator_1.param)(schema_1.SchemaPlatform)),
    __param(1, (0, decorator_1.param)(schema_1.SchemaBuildOption)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BuilderApi.prototype, "build", null);
__decorate([
    (0, decorator_1.tool)('builder-query-default-build-config'),
    (0, decorator_1.title)('Get Default Build Config') // 获取平台默认构建配置
    ,
    (0, decorator_1.description)('Get default build configuration for platform') // 获取平台默认构建配置
    ,
    (0, decorator_1.result)(schema_1.SchemaBuildConfigResult),
    __param(0, (0, decorator_1.param)(schema_1.SchemaPlatform)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BuilderApi.prototype, "queryDefaultBuildConfig", null);
__decorate([
    (0, decorator_1.tool)('builder-make'),
    (0, decorator_1.title)('Make Build Package') // 编译构建包
    ,
    (0, decorator_1.description)('Compile the built game package, supported only by some platforms') // 编译构建后的游戏包，仅部分平台支持
    ,
    (0, decorator_1.result)(schema_1.SchemaMakeResult),
    __param(0, (0, decorator_1.param)(schema_1.SchemaPlatformCanMake)),
    __param(1, (0, decorator_1.param)(schema_1.SchemaBuildDest)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BuilderApi.prototype, "make", null);
__decorate([
    (0, decorator_1.tool)('builder-run'),
    (0, decorator_1.title)('Run Build Result') // 运行构建结果
    ,
    (0, decorator_1.description)('Run the built game, effects vary by platform') // 运行构建后的游戏，不同平台的效果不同
    ,
    (0, decorator_1.result)(schema_1.SchemaBuildResult),
    __param(0, (0, decorator_1.param)(schema_1.SchemaPlatform)),
    __param(1, (0, decorator_1.param)(schema_1.SchemaBuildDest)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BuilderApi.prototype, "run", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvYnVpbGRlci9idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGdEQUFxRztBQUNyRyxxREFBc0Y7QUFFdEYsc0RBQWlGO0FBQ2pGLHFDQUE4VDtBQUU5VCxNQUFhLFVBQVU7SUFNYixBQUFOLEtBQUssQ0FBQyxLQUFLLENBQXdCLFFBQW1CLEVBQTRCLE9BQXNCO1FBQ3BHLE1BQU0sSUFBSSxHQUFtQiwyQkFBYSxDQUFDLE9BQU8sQ0FBQztRQUNuRCxNQUFNLEdBQUcsR0FBdUM7WUFDNUMsSUFBSSxFQUFFLElBQUk7WUFDVixJQUFJLEVBQUUsSUFBSTtTQUNiLENBQUM7UUFDRixJQUFJLENBQUM7WUFDRCxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUEsZUFBSyxFQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMzQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQXVCLENBQUM7WUFDbkMsSUFBSSxHQUFHLENBQUMsSUFBSSx3Q0FBZ0MsRUFBRSxDQUFDO2dCQUMzQyxHQUFHLENBQUMsSUFBSSxHQUFHLDJCQUFhLENBQUMsSUFBSSxDQUFDO2dCQUM5QixHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLElBQUksZUFBZSxDQUFDO1lBQy9DLENBQUM7UUFDTCxDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNULEdBQUcsQ0FBQyxJQUFJLEdBQUcsMkJBQWEsQ0FBQyxJQUFJLENBQUM7WUFDOUIsT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRixHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsWUFBWSxLQUFLLENBQUMs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QUFBLElBQUEsaUJBQUssRUFBQyx1QkFBYyxDQUFDLENBQUE7SUFBdUIsV0FBQSxJQUFBLGlCQUFLLEVBQUMsd0JBQWUsQ0FBQyxDQUFBOzs7O3FDQXNCNUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBidWlsZCwgZXhlY3V0ZUJ1aWxkU3RhZ2VUYXNrLCBxdWVyeURlZmF1bHRCdWlsZENvbmZpZ0J5UGxhdGZvcm0gfSBmcm9tICcuLi8uLi9jb3JlL2J1aWxkZXInO1xyXG5pbXBvcnQgeyBIdHRwU3RhdHVzQ29kZSwgQ09NTU9OX1NUQVRVUywgQ29tbW9uUmVzdWx0VHlwZSB9IGZyb20gJy4uL2Jhc2Uvc2NoZW1hLWJhc2UnO1xyXG5pbXBvcnQgeyBCdWlsZEV4aXRDb2RlLCBJQnVpbGRDb21tYW5kT3B0aW9uIH0gZnJvbSAnLi4vLi4vY29yZS9idWlsZGVyL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBkZXNjcmlwdGlvbiwgcGFyYW0sIHJlc3VsdCwgdGl0bGUsIHRvb2wgfSBmcm9tICcuLi9kZWNvcmF0b3IvZGVjb3JhdG9yJztcclxuaW1wb3J0IHsgU2NoZW1hQnVpbGRDb25maWdSZXN1bHQsIFNjaGVtYUJ1aWxkT3B0aW9uLCBTY2hlbWFCdWlsZFJlc3VsdCwgU2NoZW1hUGxhdGZvcm0sIFNjaGVtYUJ1aWxkRGVzdCwgU2NoZW1hUnVuUmVzdWx0LCBUQnVpbGRDb25maWdSZXN1bHQsIFRCdWlsZE9wdGlvbiwgVEJ1aWxkUmVzdWx0RGF0YSwgVFBsYXRmb3JtLCBUQnVpbGREZXN0LCBUUnVuUmVzdWx0LCBTY2hlbWFQbGF0Zm9ybUNhbk1ha2UsIFRQbGF0Zm9ybUNhbk1ha2UsIElNYWtlUmVzdWx0RGF0YSwgSVJ1blJlc3VsdERhdGEsIFNjaGVtYU1ha2VSZXN1bHQgfSBmcm9tICcuL3NjaGVtYSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQnVpbGRlckFwaSB7XHJcblxyXG4gICAgQHRvb2woJ2J1aWxkZXItYnVpbGQnKVxyXG4gICAgQHRpdGxlKCdCdWlsZCBQcm9qZWN0JykgLy8g5p6E5bu66aG555uuXHJcbiAgICBAZGVzY3JpcHRpb24oJ0J1aWxkIHRoZSBwcm9qZWN0IGludG8gYSBnYW1lIHBhY2thZ2UgZm9yIHRoZSBzcGVjaWZpZWQgcGxhdGZvcm0gYmFzZWQgb24gb3B0aW9ucy4gSWYgYnVpbGQgb3B0aW9ucyBhcmUgYWxyZWFkeSBzZXQgaW4gdGhlIHByb2plY3QsIG5vIHBhcmFtZXRlcnMgYXJlIG5lZWRlZC4nKSAvLyDmoLnmja7pgInpobnlsIbpobnnm67mnoTlu7rmiJDmjIflrprlubPlj7DmuLjmiI/ljIUsIOWmgumhueebruWGheW3sue7j+iuvue9ruWlveaehOW7uumAiemhue+8jOWImeS4jemcgOimgeS8oOWFpeWPguaVsFxyXG4gICAgQHJlc3VsdChTY2hlbWFCdWlsZFJlc3VsdClcclxuICAgIGFzeW5jIGJ1aWxkKEBwYXJhbShTY2hlbWFQbGF0Zm9ybSkgcGxhdGZvcm06IFRQbGF0Zm9ybSwgQHBhcmFtKFNjaGVtYUJ1aWxkT3B0aW9uKSBvcHRpb25zPzogVEJ1aWxkT3B0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFRCdWlsZFJlc3VsdERhdGE+ID0ge1xyXG4gICAgICAgICAgICBjb2RlOiBjb2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBudWxsLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgYnVpbGQocGxhdGZvcm0sIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICByZXQuZGF0YSA9IHJlcyBhcyBUQnVpbGRSZXN1bHREYXRhO1xyXG4gICAgICAgICAgICBpZiAocmVzLmNvZGUgIT09IEJ1aWxkRXhpdENvZGUuQlVJTERfU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgcmV0LmNvZGUgPSBDT01NT05fU1RBVFVTLkZBSUw7XHJcbiAgICAgICAgICAgICAgICByZXQucmVhc29uID0gcmVzLnJlYXNvbiB8fCAnQnVpbGQgZmFpbGVkISc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdidWlsZCBwcm9qZWN0IGZhaWxlZDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEB0b29sKCdidWlsZGVyLWdldC1wcmV2aWV3LXNldHRpbmdzJylcclxuICAgIC8vIEB0aXRsZSgnR2V0IFByZXZpZXcgU2V0dGluZ3MnKSAvLyDojrflj5bpooTop4jorr7nva5cclxuICAgIC8vIEBkZXNjcmlwdGlvbignR2V0IFByZXZpZXcgU2V0dGluZ3MnKSAvLyDojrflj5bpooTop4jorr7nva5cclxuICAgIC8vIEByZXN1bHQoU2NoZW1hUHJldmlld1NldHRpbmdzUmVzdWx0KVxyXG4gICAgLy8gYXN5bmMgZ2V0UHJldmlld1NldHRpbmdzKCkge1xyXG4gICAgLy8gICAgIGNvbnN0IGNvZGU6IEh0dHBTdGF0dXNDb2RlID0gQ09NTU9OX1NUQVRVUy5TVUNDRVNTO1xyXG4gICAgLy8gICAgIGNvbnN0IHJldDogQ29tbW9uUmVzdWx0VHlwZTxUUHJldmlld1NldHRpbmdzUmVzdWx0PiA9IHtcclxuICAgIC8vICAgICAgICAgY29kZTogY29kZSxcclxuICAgIC8vICAgICAgICAgZGF0YTogbnVsbCxcclxuICAgIC8vICAgICB9O1xyXG4gICAgLy8gICAgIHRyeSB7XHJcbiAgICAvLyAgICAgICAgIHJldC5kYXRhID0gYXdhaXQgZ2V0UHJldmlld1NldHRpbmdzKCk7XHJcbiAgICAvLyAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgLy8gICAgICAgICByZXQuY29kZSA9IENPTU1PTl9TVEFUVVMuRkFJTDtcclxuICAgIC8vICAgICAgICAgY29uc29sZS5lcnJvcignZ2V0IHByZXZpZXcgc2V0dGluZ3MgZmFpbDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xyXG4gICAgLy8gICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vICAgICByZXR1cm4gcmV0O1xyXG4gICAgLy8gfVxyXG5cclxuICAgIEB0b29sKCdidWlsZGVyLXF1ZXJ5LWRlZmF1bHQtYnVpbGQtY29uZmlnJylcclxuICAgIEB0aXRsZSgnR2V0IERlZmF1bHQgQnVpbGQgQ29uZmlnJykgLy8g6I635Y+W5bmz5Y+w6buY6K6k5p6E5bu66YWN572uXHJcbiAgICBAZGVzY3JpcHRpb24oJ0dldCBkZWZhdWx0IGJ1aWxkIGNvbmZpZ3VyYXRpb24gZm9yIHBsYXRmb3JtJykgLy8g6I635Y+W5bmz5Y+w6buY6K6k5p6E5bu66YWN572uXHJcbiAgICBAcmVzdWx0KFNjaGVtYUJ1aWxkQ29uZmlnUmVzdWx0KVxyXG4gICAgYXN5bmMgcXVlcnlEZWZhdWx0QnVpbGRDb25maWcoQHBhcmFtKFNjaGVtYVBsYXRmb3JtKSBwbGF0Zm9ybTogVFBsYXRmb3JtKSB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFRCdWlsZENvbmZpZ1Jlc3VsdD4gPSB7XHJcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy8gVGVtcG9yYXJpbHkgYnlwYXNzZWQgLy8g5pqC5pe257uV6L+HXHJcbiAgICAgICAgICAgIHJldC5kYXRhID0gYXdhaXQgcXVlcnlEZWZhdWx0QnVpbGRDb25maWdCeVBsYXRmb3JtKHBsYXRmb3JtKSBhcyB1bmtub3duIGFzIFRCdWlsZENvbmZpZ1Jlc3VsdDtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdxdWVyeSBkZWZhdWx0IGJ1aWxkIGNvbmZpZyBieSBwbGF0Zm9ybSBmYWlsOicsIGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKSk7XHJcbiAgICAgICAgICAgIHJldC5yZWFzb24gPSBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgQHRvb2woJ2J1aWxkZXItbWFrZScpXHJcbiAgICBAdGl0bGUoJ01ha2UgQnVpbGQgUGFja2FnZScpIC8vIOe8luivkeaehOW7uuWMhVxyXG4gICAgQGRlc2NyaXB0aW9uKCdDb21waWxlIHRoZSBidWlsdCBnYW1lIHBhY2thZ2UsIHN1cHBvcnRlZCBvbmx5IGJ5IHNvbWUgcGxhdGZvcm1zJykgLy8g57yW6K+R5p6E5bu65ZCO55qE5ri45oiP5YyF77yM5LuF6YOo5YiG5bmz5Y+w5pSv5oyBXHJcbiAgICBAcmVzdWx0KFNjaGVtYU1ha2VSZXN1bHQpXHJcbiAgICBhc3luYyBtYWtlKEBwYXJhbShTY2hlbWFQbGF0Zm9ybUNhbk1ha2UpIHBsYXRmb3JtOiBUUGxhdGZvcm1DYW5NYWtlLCBAcGFyYW0oU2NoZW1hQnVpbGREZXN0KSBkZXN0OiBUQnVpbGREZXN0KSB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPElNYWtlUmVzdWx0RGF0YT4gPSB7XHJcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBleGVjdXRlQnVpbGRTdGFnZVRhc2socGxhdGZvcm0sICdtYWtlJywge1xyXG4gICAgICAgICAgICAgICAgZGVzdCxcclxuICAgICAgICAgICAgICAgIHBsYXRmb3JtLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0LmRhdGEgPSByZXMgYXMgSU1ha2VSZXN1bHREYXRhO1xyXG4gICAgICAgICAgICBpZiAocmVzLmNvZGUgIT09IEJ1aWxkRXhpdENvZGUuQlVJTERfU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgcmV0LmNvZGUgPSBDT01NT05fU1RBVFVTLkZBSUw7XHJcbiAgICAgICAgICAgICAgICByZXQucmVhc29uID0gcmVzLnJlYXNvbiB8fCBgTWFrZSAke3BsYXRmb3JtfSBpbiAke2Rlc3R9IGZhaWxlZCFgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXQuY29kZSA9IENPTU1PTl9TVEFUVVMuRkFJTDtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgbWFrZSBwcm9qZWN0ICR7ZGVzdH0gaW4gcGxhdGZvcm0gJHtwbGF0Zm9ybX0gZmFpbGVkOmAsIGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKSk7XHJcbiAgICAgICAgICAgIHJldC5yZWFzb24gPSBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgQHRvb2woJ2J1aWxkZXItcnVuJylcclxuICAgIEB0aXRsZSgnUnVuIEJ1aWxkIFJlc3VsdCcpIC8vIOi/kOihjOaehOW7uue7k+aenFxyXG4gICAgQGRlc2NyaXB0aW9uKCdSdW4gdGhlIGJ1aWx0IGdhbWUsIGVmZmVjdHMgdmFyeSBieSBwbGF0Zm9ybScpIC8vIOi/kOihjOaehOW7uuWQjueahOa4uOaIj++8jOS4jeWQjOW5s+WPsOeahOaViOaenOS4jeWQjFxyXG4gICAgQHJlc3VsdChTY2hlbWFCdWlsZFJlc3VsdClcclxuICAgIGFzeW5jIHJ1bihAcGFyYW0oU2NoZW1hUGxhdGZvcm0pIHBsYXRmb3JtOiBUUGxhdGZvcm0sIEBwYXJhbShTY2hlbWFCdWlsZERlc3QpIGRlc3Q6IFRCdWlsZERlc3QpOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8SVJ1blJlc3VsdERhdGE+PiB7XHJcbiAgICAgICAgY29uc3QgY29kZTogSHR0cFN0YXR1c0NvZGUgPSBDT01NT05fU1RBVFVTLlNVQ0NFU1M7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPElSdW5SZXN1bHREYXRhPiA9IHtcclxuICAgICAgICAgICAgY29kZTogY29kZSxcclxuICAgICAgICAgICAgZGF0YTogbnVsbCxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGV4ZWN1dGVCdWlsZFN0YWdlVGFzayhwbGF0Zm9ybSwgJ3J1bicsIHtcclxuICAgICAgICAgICAgICAgIGRlc3QsXHJcbiAgICAgICAgICAgICAgICBwbGF0Zm9ybSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldC5kYXRhID0gcmVzO1xyXG4gICAgICAgICAgICBpZiAocmVzLmNvZGUgIT09IEJ1aWxkRXhpdENvZGUuQlVJTERfU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgcmV0LmNvZGUgPSBDT01NT05fU1RBVFVTLkZBSUw7XHJcbiAgICAgICAgICAgICAgICByZXQucmVhc29uID0gcmVzLnJlYXNvbiB8fCBgUnVuICR7cGxhdGZvcm19IGluICR7ZGVzdH0gZmFpbGVkIWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdydW4gYnVpbGQgcmVzdWx0IGZhaWxlZDonLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpO1xyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG59Il19