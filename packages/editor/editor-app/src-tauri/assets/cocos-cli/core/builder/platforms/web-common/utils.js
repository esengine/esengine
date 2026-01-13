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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreviewUrl = getPreviewUrl;
exports.run = run;
const fs_1 = require("fs");
const path_1 = require("path");
const utils_1 = __importDefault(require("../../../base/utils"));
const builder_config_1 = __importDefault(require("../../share/builder-config"));
const build_middleware_1 = require("../../build.middleware");
const utils_browser_1 = require("./utils-browser");
async function getPreviewUrl(dest, platform) {
    const rawPath = utils_1.default.Path.resolveToRaw(dest);
    if (!(0, fs_1.existsSync)(rawPath)) {
        throw new Error(`Build path not found: ${dest}`);
    }
    const serverService = (await Promise.resolve().then(() => __importStar(require('../../../../server/server')))).serverService;
    const buildKey = (0, build_middleware_1.getBuildUrlPath)(rawPath);
    if (buildKey) {
        return `${serverService.url}/build/${buildKey}/index.html`;
    }
    if (rawPath.startsWith(builder_config_1.default.projectRoot) && platform) {
        const registerName = (0, path_1.basename)(rawPath);
        (0, build_middleware_1.registerBuildPath)(platform, registerName, rawPath);
        return `${serverService.url}/build/${platform}/${registerName}/index.html`;
    }
    const buildRoot = (0, path_1.join)(builder_config_1.default.projectRoot, 'build');
    const relativePath = (0, path_1.relative)(buildRoot, rawPath);
    return serverService.url + '/build/' + relativePath + '/index.html';
}
async function run(platform, dest) {
    // if (GlobalConfig.mode === 'simple') {
    //     throw new Error('simple mode not support run in platform ' + platform);
    // }
    const url = await getPreviewUrl(dest, platform);
    // 打开浏览器
    try {
        const remoteDebuggingMode = true;
        const port = 9222;
        await (0, utils_browser_1.openUrlAsync)(url, { remoteDebuggingMode, port });
        // 如果启用了远程调试模式，连接并监听浏览器日志
        if (remoteDebuggingMode) {
            await (0, utils_browser_1.connectToChromeDevTools)(port, url);
        }
    }
    catch (error) {
        console.error('打开浏览器时发生错误:', error);
        console.log(`请手动打开浏览器访问: ${url}`);
    }
    return url;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3BsYXRmb3Jtcy93ZWItY29tbW9uL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBUUEsc0NBb0JDO0FBRUQsa0JBb0JDO0FBbERELDJCQUFnQztBQUNoQywrQkFBZ0Q7QUFDaEQsZ0VBQXdDO0FBQ3hDLGdGQUF1RDtBQUN2RCw2REFBNEU7QUFDNUUsbURBQXdFO0FBR2pFLEtBQUssVUFBVSxhQUFhLENBQUMsSUFBWSxFQUFFLFFBQWlCO0lBQy9ELE1BQU0sT0FBTyxHQUFHLGVBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlDLElBQUksQ0FBQyxJQUFBLGVBQVUsRUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLElBQUksRUFBRSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUNELE1BQU0sYUFBYSxHQUFHLENBQUMsd0RBQWEsMkJBQTJCLEdBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQztJQUNoRixNQUFNLFFBQVEsR0FBRyxJQUFBLGtDQUFlLEVBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUMsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNYLE9BQU8sR0FBRyxhQUFhLENBQUMsR0FBRyxVQUFVLFFBQVEsYUFBYSxDQUFDO0lBQy9ELENBQUM7SUFFRCxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsd0JBQWEsQ0FBQyxXQUFXLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUM1RCxNQUFNLFlBQVksR0FBRyxJQUFBLGVBQVEsRUFBQyxPQUFPLENBQUMsQ0FBQztRQUN2QyxJQUFBLG9DQUFpQixFQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkQsT0FBTyxHQUFHLGFBQWEsQ0FBQyxHQUFHLFVBQVUsUUFBUSxJQUFJLFlBQVksYUFBYSxDQUFDO0lBQy9FLENBQUM7SUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFBLFdBQUksRUFBQyx3QkFBYSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzRCxNQUFNLFlBQVksR0FBRyxJQUFBLGVBQVEsRUFBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEQsT0FBTyxhQUFhLENBQUMsR0FBRyxHQUFHLFNBQVMsR0FBRyxZQUFZLEdBQUcsYUFBYSxDQUFDO0FBQ3hFLENBQUM7QUFFTSxLQUFLLFVBQVUsR0FBRyxDQUFDLFFBQWdCLEVBQUUsSUFBWTtJQUNwRCx3Q0FBd0M7SUFDeEMsOEVBQThFO0lBQzlFLElBQUk7SUFDSixNQUFNLEdBQUcsR0FBRyxNQUFNLGFBQWEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDaEQsUUFBUTtJQUNSLElBQUksQ0FBQztRQUNELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1FBQ2pDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUNsQixNQUFNLElBQUEsNEJBQVksRUFBQyxHQUFHLEVBQUUsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRXZELHlCQUF5QjtRQUN6QixJQUFJLG1CQUFtQixFQUFFLENBQUM7WUFDdEIsTUFBTSxJQUFBLHVDQUF1QixFQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM3QyxDQUFDO0lBQ0wsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgam9pbiwgcmVsYXRpdmUsIGJhc2VuYW1lIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi8uLi8uLi9iYXNlL3V0aWxzJztcclxuaW1wb3J0IGJ1aWxkZXJDb25maWcgZnJvbSAnLi4vLi4vc2hhcmUvYnVpbGRlci1jb25maWcnO1xyXG5pbXBvcnQgeyBnZXRCdWlsZFVybFBhdGgsIHJlZ2lzdGVyQnVpbGRQYXRoIH0gZnJvbSAnLi4vLi4vYnVpbGQubWlkZGxld2FyZSc7XHJcbmltcG9ydCB7IG9wZW5VcmxBc3luYywgY29ubmVjdFRvQ2hyb21lRGV2VG9vbHMgfSBmcm9tICcuL3V0aWxzLWJyb3dzZXInO1xyXG5cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcmV2aWV3VXJsKGRlc3Q6IHN0cmluZywgcGxhdGZvcm0/OiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IHJhd1BhdGggPSB1dGlscy5QYXRoLnJlc29sdmVUb1JhdyhkZXN0KTtcclxuICAgIGlmICghZXhpc3RzU3luYyhyYXdQYXRoKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQnVpbGQgcGF0aCBub3QgZm91bmQ6ICR7ZGVzdH1gKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHNlcnZlclNlcnZpY2UgPSAoYXdhaXQgaW1wb3J0KCcuLi8uLi8uLi8uLi9zZXJ2ZXIvc2VydmVyJykpLnNlcnZlclNlcnZpY2U7XHJcbiAgICBjb25zdCBidWlsZEtleSA9IGdldEJ1aWxkVXJsUGF0aChyYXdQYXRoKTtcclxuICAgIGlmIChidWlsZEtleSkge1xyXG4gICAgICAgIHJldHVybiBgJHtzZXJ2ZXJTZXJ2aWNlLnVybH0vYnVpbGQvJHtidWlsZEtleX0vaW5kZXguaHRtbGA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmIChyYXdQYXRoLnN0YXJ0c1dpdGgoYnVpbGRlckNvbmZpZy5wcm9qZWN0Um9vdCkgJiYgcGxhdGZvcm0pIHtcclxuICAgICAgICBjb25zdCByZWdpc3Rlck5hbWUgPSBiYXNlbmFtZShyYXdQYXRoKTtcclxuICAgICAgICByZWdpc3RlckJ1aWxkUGF0aChwbGF0Zm9ybSwgcmVnaXN0ZXJOYW1lLCByYXdQYXRoKTtcclxuICAgICAgICByZXR1cm4gYCR7c2VydmVyU2VydmljZS51cmx9L2J1aWxkLyR7cGxhdGZvcm19LyR7cmVnaXN0ZXJOYW1lfS9pbmRleC5odG1sYDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3QgYnVpbGRSb290ID0gam9pbihidWlsZGVyQ29uZmlnLnByb2plY3RSb290LCAnYnVpbGQnKTtcclxuICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlKGJ1aWxkUm9vdCwgcmF3UGF0aCk7XHJcbiAgICByZXR1cm4gc2VydmVyU2VydmljZS51cmwgKyAnL2J1aWxkLycgKyByZWxhdGl2ZVBhdGggKyAnL2luZGV4Lmh0bWwnO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuKHBsYXRmb3JtOiBzdHJpbmcsIGRlc3Q6IHN0cmluZykge1xyXG4gICAgLy8gaWYgKEdsb2JhbENvbmZpZy5tb2RlID09PSAnc2ltcGxlJykge1xyXG4gICAgLy8gICAgIHRocm93IG5ldyBFcnJvcignc2ltcGxlIG1vZGUgbm90IHN1cHBvcnQgcnVuIGluIHBsYXRmb3JtICcgKyBwbGF0Zm9ybSk7XHJcbiAgICAvLyB9XHJcbiAgICBjb25zdCB1cmwgPSBhd2FpdCBnZXRQcmV2aWV3VXJsKGRlc3QsIHBsYXRmb3JtKTtcclxuICAgIC8vIOaJk+W8gOa1j+iniOWZqFxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByZW1vdGVEZWJ1Z2dpbmdNb2RlID0gdHJ1ZTtcclxuICAgICAgICBjb25zdCBwb3J0ID0gOTIyMjtcclxuICAgICAgICBhd2FpdCBvcGVuVXJsQXN5bmModXJsLCB7IHJlbW90ZURlYnVnZ2luZ01vZGUsIHBvcnQgfSk7XHJcblxyXG4gICAgICAgIC8vIOWmguaenOWQr+eUqOS6hui/nOeoi+iwg+ivleaooeW8j++8jOi/nuaOpeW5tuebkeWQrOa1j+iniOWZqOaXpeW/l1xyXG4gICAgICAgIGlmIChyZW1vdGVEZWJ1Z2dpbmdNb2RlKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IGNvbm5lY3RUb0Nocm9tZURldlRvb2xzKHBvcnQsIHVybCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCfmiZPlvIDmtY/op4jlmajml7blj5HnlJ/plJnor686JywgZXJyb3IpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGDor7fmiYvliqjmiZPlvIDmtY/op4jlmajorr/pl646ICR7dXJsfWApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHVybDtcclxufVxyXG4iXX0=