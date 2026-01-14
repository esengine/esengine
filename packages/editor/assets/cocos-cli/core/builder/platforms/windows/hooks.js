'use strict';
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
exports.run = exports.make = exports.onBeforeMake = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onAfterBundleDataTask = exports.onBeforeBuild = void 0;
exports.onAfterInit = onAfterInit;
exports.onAfterBundleInit = onAfterBundleInit;
const utils_1 = require("./utils");
const nativeCommonHook = __importStar(require("../native-common/hooks"));
exports.onBeforeBuild = nativeCommonHook.onBeforeBuild;
exports.onAfterBundleDataTask = nativeCommonHook.onAfterBundleDataTask;
exports.onAfterCompressSettings = nativeCommonHook.onAfterCompressSettings;
exports.onAfterBuild = nativeCommonHook.onAfterBuild;
exports.onBeforeMake = nativeCommonHook.onBeforeMake;
exports.make = nativeCommonHook.make;
exports.run = nativeCommonHook.run;
async function onAfterInit(options, result, cache) {
    await nativeCommonHook.onAfterInit.call(this, options, result);
    const renderBackEnd = options.packages.windows.renderBackEnd;
    // 补充一些平台必须的参数
    const params = options.cocosParams;
    params.platformParams.targetPlatform = 'x64';
    params.platformParams.vsVersion = options.packages.windows.vsData || '';
    // TODO 仅部分平台支持的选项，需要放在平台插件里自行注册
    params.cMakeConfig.USE_SERVER_MODE = `set(USE_SERVER_MODE ${options.packages.windows.serverMode ? 'ON' : 'OFF'})`;
    const netMode = Number(options.packages.windows.netMode);
    params.cMakeConfig.NET_MODE = `set(NET_MODE ${(isNaN(netMode) || netMode > 2 || netMode < 0) ? 0 : netMode})`;
    // @ts-ignore
    options.buildScriptParam.flags.NET_MODE = (isNaN(netMode) || netMode > 2 || netMode < 0) ? 0 : netMode;
    params.cMakeConfig.NET_MODE = `set(NET_MODE ${(isNaN(netMode) || netMode > 2 || netMode < 0) ? 0 : netMode})`;
    params.executableName = (0, utils_1.executableNameOrDefault)(params.projectName, options.packages.windows.executableName);
    if (params.executableName === 'CocosGame') {
        console.warn(`The provided project name "${params.projectName}" is not suitable for use as an executable name. 'CocosGame' is applied instead.`);
    }
    params.cMakeConfig.CC_EXECUTABLE_NAME = `set(CC_EXECUTABLE_NAME "${params.executableName}")`;
    if (renderBackEnd) {
        Object.keys(renderBackEnd).forEach((backend) => {
            // @ts-ignore
            params.cMakeConfig[`CC_USE_${backend.toUpperCase()}`] = renderBackEnd[backend];
        });
    }
}
async function onAfterBundleInit(options) {
    await nativeCommonHook.onAfterBundleInit(options);
    const renderBackEnd = options.packages.windows.renderBackEnd;
    options.assetSerializeOptions['cc.EffectAsset'].glsl1 = renderBackEnd.gles2 ?? true;
    options.assetSerializeOptions['cc.EffectAsset'].glsl3 = renderBackEnd.gles3 ?? true;
    options.assetSerializeOptions['cc.EffectAsset'].glsl4 = renderBackEnd.vulkan ?? true;
    const netMode = Number(options.packages.windows.netMode);
    options.buildScriptParam.flags.NET_MODE = (isNaN(netMode) || netMode > 2 || netMode < 0) ? 0 : netMode;
    options.buildScriptParam.flags.SERVER_MODE = !!options.packages.windows.serverMode;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3BsYXRmb3Jtcy93aW5kb3dzL2hvb2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZWIsa0NBMEJDO0FBRUQsOENBVUM7QUFqREQsbUNBQWtEO0FBQ2xELHlFQUEyRDtBQUU5QyxRQUFBLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUM7QUFDL0MsUUFBQSxxQkFBcUIsR0FBRyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQztBQUMvRCxRQUFBLHVCQUF1QixHQUFHLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDO0FBQ25FLFFBQUEsWUFBWSxHQUFHLGdCQUFnQixDQUFDLFlBQVksQ0FBQztBQUM3QyxRQUFBLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUM7QUFDN0MsUUFBQSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDO0FBQzdCLFFBQUEsR0FBRyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQztBQUVqQyxLQUFLLFVBQVUsV0FBVyxDQUFpQixPQUFxQyxFQUFFLE1BQW9CLEVBQUUsS0FBbUI7SUFDOUgsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDL0QsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO0lBQzdELGNBQWM7SUFDZCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO0lBQ25DLE1BQU0sQ0FBQyxjQUFjLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztJQUM3QyxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLE9B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R0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7SUFDdkcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztBQUN2RixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgSUJ1aWxkUmVzdWx0LCBJV2luZG93c0ludGVybmFsQnVpbGRPcHRpb25zIH0gZnJvbSAnLi90eXBlJztcclxuaW1wb3J0IHsgQnVpbGRlckNhY2hlLCBJQnVpbGRlciB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBleGVjdXRhYmxlTmFtZU9yRGVmYXVsdCB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgKiBhcyBuYXRpdmVDb21tb25Ib29rIGZyb20gJy4uL25hdGl2ZS1jb21tb24vaG9va3MnO1xyXG5cclxuZXhwb3J0IGNvbnN0IG9uQmVmb3JlQnVpbGQgPSBuYXRpdmVDb21tb25Ib29rLm9uQmVmb3JlQnVpbGQ7XHJcbmV4cG9ydCBjb25zdCBvbkFmdGVyQnVuZGxlRGF0YVRhc2sgPSBuYXRpdmVDb21tb25Ib29rLm9uQWZ0ZXJCdW5kbGVEYXRhVGFzaztcclxuZXhwb3J0IGNvbnN0IG9uQWZ0ZXJDb21wcmVzc1NldHRpbmdzID0gbmF0aXZlQ29tbW9uSG9vay5vbkFmdGVyQ29tcHJlc3NTZXR0aW5ncztcclxuZXhwb3J0IGNvbnN0IG9uQWZ0ZXJCdWlsZCA9IG5hdGl2ZUNvbW1vbkhvb2sub25BZnRlckJ1aWxkO1xyXG5leHBvcnQgY29uc3Qgb25CZWZvcmVNYWtlID0gbmF0aXZlQ29tbW9uSG9vay5vbkJlZm9yZU1ha2U7XHJcbmV4cG9ydCBjb25zdCBtYWtlID0gbmF0aXZlQ29tbW9uSG9vay5tYWtlO1xyXG5leHBvcnQgY29uc3QgcnVuID0gbmF0aXZlQ29tbW9uSG9vay5ydW47XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25BZnRlckluaXQodGhpczogSUJ1aWxkZXIsIG9wdGlvbnM6IElXaW5kb3dzSW50ZXJuYWxCdWlsZE9wdGlvbnMsIHJlc3VsdDogSUJ1aWxkUmVzdWx0LCBjYWNoZTogQnVpbGRlckNhY2hlKSB7XHJcbiAgICBhd2FpdCBuYXRpdmVDb21tb25Ib29rLm9uQWZ0ZXJJbml0LmNhbGwodGhpcywgb3B0aW9ucywgcmVzdWx0KTtcclxuICAgIGNvbnN0IHJlbmRlckJhY2tFbmQgPSBvcHRpb25zLnBhY2thZ2VzLndpbmRvd3MucmVuZGVyQmFja0VuZDtcclxuICAgIC8vIOihpeWFheS4gOS6m+W5s+WPsOW/hemhu+eahOWPguaVsFxyXG4gICAgY29uc3QgcGFyYW1zID0gb3B0aW9ucy5jb2Nvc1BhcmFtcztcclxuICAgIHBhcmFtcy5wbGF0Zm9ybVBhcmFtcy50YXJnZXRQbGF0Zm9ybSA9ICd4NjQnO1xyXG4gICAgcGFyYW1zLnBsYXRmb3JtUGFyYW1zLnZzVmVyc2lvbiA9IG9wdGlvbnMucGFja2FnZXMud2luZG93cy52c0RhdGEgfHwgJyc7XHJcbiAgICAvLyBUT0RPIOS7hemDqOWIhuW5s+WPsOaUr+aMgeeahOmAiemhue+8jOmcgOimgeaUvuWcqOW5s+WPsOaPkuS7tumHjOiHquihjOazqOWGjFxyXG4gICAgcGFyYW1zLmNNYWtlQ29uZmlnLlVTRV9TRVJWRVJfTU9ERSA9IGBzZXQoVVNFX1NFUlZFUl9NT0RFICR7b3B0aW9ucy5wYWNrYWdlcy53aW5kb3dzLnNlcnZlck1vZGUgPyAnT04nIDogJ09GRid9KWA7XHJcbiAgICBjb25zdCBuZXRNb2RlID0gTnVtYmVyKG9wdGlvbnMucGFja2FnZXMud2luZG93cy5uZXRNb2RlKTtcclxuICAgIHBhcmFtcy5jTWFrZUNvbmZpZy5ORVRfTU9ERSA9IGBzZXQoTkVUX01PREUgJHsoaXNOYU4obmV0TW9kZSkgfHwgbmV0TW9kZSA+IDIgfHwgbmV0TW9kZSA8IDApID8gMCA6IG5ldE1vZGV9KWA7XHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICBvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0uZmxhZ3MuTkVUX01PREUgPSAoaXNOYU4obmV0TW9kZSkgfHwgbmV0TW9kZSA+IDIgfHwgbmV0TW9kZSA8IDApID8gMCA6IG5ldE1vZGU7XHJcbiAgICBwYXJhbXMuY01ha2VDb25maWcuTkVUX01PREUgPSBgc2V0KE5FVF9NT0RFICR7KGlzTmFOKG5ldE1vZGUpIHx8IG5ldE1vZGUgPiAyIHx8IG5ldE1vZGUgPCAwKSA/IDAgOiBuZXRNb2RlfSlgO1xyXG4gICAgcGFyYW1zLmV4ZWN1dGFibGVOYW1lID0gZXhlY3V0YWJsZU5hbWVPckRlZmF1bHQocGFyYW1zLnByb2plY3ROYW1lLCBvcHRpb25zLnBhY2thZ2VzLndpbmRvd3MuZXhlY3V0YWJsZU5hbWUpO1xyXG4gICAgaWYgKHBhcmFtcy5leGVjdXRhYmxlTmFtZSA9PT0gJ0NvY29zR2FtZScpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oYFRoZSBwcm92aWRlZCBwcm9qZWN0IG5hbWUgXCIke3BhcmFtcy5wcm9qZWN0TmFtZX1cIiBpcyBub3Qgc3VpdGFibGUgZm9yIHVzZSBhcyBhbiBleGVjdXRhYmxlIG5hbWUuICdDb2Nvc0dhbWUnIGlzIGFwcGxpZWQgaW5zdGVhZC5gKTtcclxuICAgIH1cclxuICAgIHBhcmFtcy5jTWFrZUNvbmZpZy5DQ19FWEVDVVRBQkxFX05BTUUgPSBgc2V0KENDX0VYRUNVVEFCTEVfTkFNRSBcIiR7cGFyYW1zLmV4ZWN1dGFibGVOYW1lfVwiKWA7XHJcblxyXG4gICAgaWYgKHJlbmRlckJhY2tFbmQpIHtcclxuICAgICAgICBPYmplY3Qua2V5cyhyZW5kZXJCYWNrRW5kKS5mb3JFYWNoKChiYWNrZW5kKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgcGFyYW1zLmNNYWtlQ29uZmlnW2BDQ19VU0VfJHtiYWNrZW5kLnRvVXBwZXJDYXNlKCl9YF0gPSByZW5kZXJCYWNrRW5kW2JhY2tlbmRdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25BZnRlckJ1bmRsZUluaXQob3B0aW9uczogSVdpbmRvd3NJbnRlcm5hbEJ1aWxkT3B0aW9ucykge1xyXG4gICAgYXdhaXQgbmF0aXZlQ29tbW9uSG9vay5vbkFmdGVyQnVuZGxlSW5pdChvcHRpb25zKTtcclxuICAgIGNvbnN0IHJlbmRlckJhY2tFbmQgPSBvcHRpb25zLnBhY2thZ2VzLndpbmRvd3MucmVuZGVyQmFja0VuZDtcclxuXHJcbiAgICBvcHRpb25zLmFzc2V0U2VyaWFsaXplT3B0aW9ucyFbJ2NjLkVmZmVjdEFzc2V0J10uZ2xzbDEgPSByZW5kZXJCYWNrRW5kLmdsZXMyID8/IHRydWU7XHJcbiAgICBvcHRpb25zLmFzc2V0U2VyaWFsaXplT3B0aW9ucyFbJ2NjLkVmZmVjdEFzc2V0J10uZ2xzbDMgPSByZW5kZXJCYWNrRW5kLmdsZXMzID8/IHRydWU7XHJcbiAgICBvcHRpb25zLmFzc2V0U2VyaWFsaXplT3B0aW9ucyFbJ2NjLkVmZmVjdEFzc2V0J10uZ2xzbDQgPSByZW5kZXJCYWNrRW5kLnZ1bGthbiA/PyB0cnVlO1xyXG4gICAgY29uc3QgbmV0TW9kZSA9IE51bWJlcihvcHRpb25zLnBhY2thZ2VzLndpbmRvd3MubmV0TW9kZSk7XHJcbiAgICBvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0uZmxhZ3MuTkVUX01PREUgPSAoaXNOYU4obmV0TW9kZSkgfHwgbmV0TW9kZSA+IDIgfHwgbmV0TW9kZSA8IDApID8gMCA6IG5ldE1vZGU7XHJcbiAgICBvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0uZmxhZ3MuU0VSVkVSX01PREUgPSAhIW9wdGlvbnMucGFja2FnZXMud2luZG93cy5zZXJ2ZXJNb2RlO1xyXG59XHJcbiJdfQ==