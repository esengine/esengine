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
exports.run = exports.make = exports.onBeforeMake = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onAfterBundleDataTask = exports.onBeforeBuild = exports.throwError = void 0;
exports.onAfterInit = onAfterInit;
exports.onAfterBundleInit = onAfterBundleInit;
const nativeCommonHook = __importStar(require("../native-common/hooks"));
const utils_1 = require("./utils");
exports.throwError = true;
exports.onBeforeBuild = nativeCommonHook.onBeforeBuild;
exports.onAfterBundleDataTask = nativeCommonHook.onAfterBundleDataTask;
exports.onAfterCompressSettings = nativeCommonHook.onAfterCompressSettings;
exports.onAfterBuild = nativeCommonHook.onAfterBuild;
exports.onBeforeMake = nativeCommonHook.onBeforeMake;
exports.make = nativeCommonHook.make;
exports.run = nativeCommonHook.run;
async function onAfterInit(options, result, cache) {
    await nativeCommonHook.onAfterInit.call(this, options, result);
    const renderBackEnd = options.packages.mac.renderBackEnd = {
        gles2: false,
        gles3: false,
        metal: true,
    };
    const pkgOptions = options.packages.mac;
    // 补充一些平台必须的参数
    const params = options.cocosParams;
    params.cMakeConfig.TARGET_OSX_VERSION = `set(TARGET_OSX_VERSION ${pkgOptions.targetVersion || '10.14'})`;
    params.cMakeConfig.CUSTOM_COPY_RESOURCE_HOOK = pkgOptions.skipUpdateXcodeProject;
    params.cMakeConfig.MACOSX_BUNDLE_GUI_IDENTIFIER = `set(MACOSX_BUNDLE_GUI_IDENTIFIER ${pkgOptions.packageName})`;
    params.platformParams.skipUpdateXcodeProject = pkgOptions.skipUpdateXcodeProject;
    params.executableName = (0, utils_1.executableNameOrDefault)(params.projectName, options.packages.mac.executableName);
    if (params.executableName === 'CocosGame') {
        console.warn(`The provided project name "${params.projectName}" is not suitable for use as an executable name. 'CocosGame' is applied instead.`);
    }
    params.cMakeConfig.CC_EXECUTABLE_NAME = `set(CC_EXECUTABLE_NAME "${params.executableName}")`;
    params.platformParams.bundleId = pkgOptions.packageName;
    Object.keys(renderBackEnd).forEach((backend) => {
        // @ts-ignore
        params.cMakeConfig[`CC_USE_${backend.toUpperCase()}`] = renderBackEnd[backend];
    });
    // TODO 仅部分平台支持的选项，需要放在平台插件里自行注册
    if (!options.packages.native) {
        options.packages.native = {};
    }
    params.cMakeConfig.USE_SERVER_MODE = `set(USE_SERVER_MODE ${options.packages.native.serverMode ? 'ON' : 'OFF'})`;
    let netMode = Number(options.packages.native.netMode);
    netMode = options.packages.native.netMode = (isNaN(netMode) || netMode > 2 || netMode < 0) ? 0 : netMode;
    params.cMakeConfig.NET_MODE = `set(NET_MODE ${netMode})`;
}
async function onAfterBundleInit(options) {
    await nativeCommonHook.onAfterBundleInit(options);
    const renderBackEnd = options.packages.mac.renderBackEnd;
    options.assetSerializeOptions['cc.EffectAsset'].glsl1 = renderBackEnd.gles2 ?? true;
    options.assetSerializeOptions['cc.EffectAsset'].glsl3 = renderBackEnd.gles3 ?? true;
    options.assetSerializeOptions['cc.EffectAsset'].glsl4 = renderBackEnd.metal ?? true;
    let netMode = Number(options.packages.native.netMode);
    netMode = options.packages.native.netMode = (isNaN(netMode) || netMode > 2 || netMode < 0) ? 0 : netMode;
    options.buildScriptParam.flags.SERVER_MODE = !!options.packages.native.serverMode;
    options.buildScriptParam.flags.NET_MODE = options.packages.native.netMode;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3BsYXRmb3Jtcy9tYWMvaG9va3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQmIsa0NBaUNDO0FBRUQsOENBVUM7QUF6REQseUVBQTJEO0FBQzNELG1DQUFrRDtBQUVyQyxRQUFBLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDbEIsUUFBQSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDO0FBQy9DLFFBQUEscUJBQXFCLEdBQUcsZ0JBQWdCLENBQUMscUJBQXFCLENBQUM7QUFDL0QsUUFBQSx1QkFBdUIsR0FBRyxnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQztBQUNuRSxRQUFBLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUM7QUFDN0MsUUFBQSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsWUFBWSxDQUFDO0FBQzdDLFFBQUEsSUFBSSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQztBQUM3QixRQUFBLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUM7QUFFakMsS0FBSyxVQUFVLFdBQVcsQ0FBaUIsT0FBaUMsRUFBRSxNQUFvQixFQUFFLEtBQW1CO0lBQzFILE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQy9ELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRztRQUN2RCxLQUFLLEVBQUUsS0FBSztRQUNaLEtBQUssRUFBRSxLQUFLO1FBQ1osS0FBSyxFQUFFLElBQUk7S0FDZCxDQUFDO0lBQ0YsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7SUFDeEMs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Q0FBQyxLQUFLLElBQUksSUFBSSxDQUFDO0lBQ3JGLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2RCxPQUFPLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFPLENBQUMsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sR0FBRyxDQUFDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUMxRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ2xGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTyxDQUFDLE9BQU8sQ0FBQztBQUMvRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgSUJ1aWxkUmVzdWx0LCBJTWFjSW50ZXJuYWxCdWlsZE9wdGlvbnMgfSBmcm9tICcuL3R5cGUnO1xyXG5pbXBvcnQgeyBCdWlsZGVyQ2FjaGUsIElCdWlsZGVyIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCAqIGFzIG5hdGl2ZUNvbW1vbkhvb2sgZnJvbSAnLi4vbmF0aXZlLWNvbW1vbi9ob29rcyc7XHJcbmltcG9ydCB7IGV4ZWN1dGFibGVOYW1lT3JEZWZhdWx0IH0gZnJvbSAnLi91dGlscyc7XHJcblxyXG5leHBvcnQgY29uc3QgdGhyb3dFcnJvciA9IHRydWU7XHJcbmV4cG9ydCBjb25zdCBvbkJlZm9yZUJ1aWxkID0gbmF0aXZlQ29tbW9uSG9vay5vbkJlZm9yZUJ1aWxkO1xyXG5leHBvcnQgY29uc3Qgb25BZnRlckJ1bmRsZURhdGFUYXNrID0gbmF0aXZlQ29tbW9uSG9vay5vbkFmdGVyQnVuZGxlRGF0YVRhc2s7XHJcbmV4cG9ydCBjb25zdCBvbkFmdGVyQ29tcHJlc3NTZXR0aW5ncyA9IG5hdGl2ZUNvbW1vbkhvb2sub25BZnRlckNvbXByZXNzU2V0dGluZ3M7XHJcbmV4cG9ydCBjb25zdCBvbkFmdGVyQnVpbGQgPSBuYXRpdmVDb21tb25Ib29rLm9uQWZ0ZXJCdWlsZDtcclxuZXhwb3J0IGNvbnN0IG9uQmVmb3JlTWFrZSA9IG5hdGl2ZUNvbW1vbkhvb2sub25CZWZvcmVNYWtlO1xyXG5leHBvcnQgY29uc3QgbWFrZSA9IG5hdGl2ZUNvbW1vbkhvb2subWFrZTtcclxuZXhwb3J0IGNvbnN0IHJ1biA9IG5hdGl2ZUNvbW1vbkhvb2sucnVuO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uQWZ0ZXJJbml0KHRoaXM6IElCdWlsZGVyLCBvcHRpb25zOiBJTWFjSW50ZXJuYWxCdWlsZE9wdGlvbnMsIHJlc3VsdDogSUJ1aWxkUmVzdWx0LCBjYWNoZTogQnVpbGRlckNhY2hlKSB7XHJcbiAgICBhd2FpdCBuYXRpdmVDb21tb25Ib29rLm9uQWZ0ZXJJbml0LmNhbGwodGhpcywgb3B0aW9ucywgcmVzdWx0KTtcclxuICAgIGNvbnN0IHJlbmRlckJhY2tFbmQgPSBvcHRpb25zLnBhY2thZ2VzLm1hYy5yZW5kZXJCYWNrRW5kID0ge1xyXG4gICAgICAgIGdsZXMyOiBmYWxzZSxcclxuICAgICAgICBnbGVzMzogZmFsc2UsXHJcbiAgICAgICAgbWV0YWw6IHRydWUsXHJcbiAgICB9O1xyXG4gICAgY29uc3QgcGtnT3B0aW9ucyA9IG9wdGlvbnMucGFja2FnZXMubWFjO1xyXG4gICAgLy8g6KGl5YWF5LiA5Lqb5bmz5Y+w5b+F6aG755qE5Y+C5pWwXHJcbiAgICBjb25zdCBwYXJhbXMgPSBvcHRpb25zLmNvY29zUGFyYW1zO1xyXG4gICAgcGFyYW1zLmNNYWtlQ29uZmlnLlRBUkdFVF9PU1hfVkVSU0lPTiA9IGBzZXQoVEFSR0VUX09TWF9WRVJTSU9OICR7cGtnT3B0aW9ucy50YXJnZXRWZXJzaW9uIHx8ICcxMC4xNCd9KWA7XHJcbiAgICBwYXJhbXMuY01ha2VDb25maWcuQ1VTVE9NX0NPUFlfUkVTT1VSQ0VfSE9PSyA9IHBrZ09wdGlvbnMuc2tpcFVwZGF0ZVhjb2RlUHJvamVjdDtcclxuICAgIHBhcmFtcy5jTWFrZUNvbmZpZy5NQUNPU1hfQlVORExFX0dVSV9JREVOVElGSUVSID0gYHNldChNQUNPU1hfQlVORExFX0dVSV9JREVOVElGSUVSICR7cGtnT3B0aW9ucy5wYWNrYWdlTmFtZX0pYDtcclxuICAgIHBhcmFtcy5wbGF0Zm9ybVBhcmFtcy5za2lwVXBkYXRlWGNvZGVQcm9qZWN0ID0gcGtnT3B0aW9ucy5za2lwVXBkYXRlWGNvZGVQcm9qZWN0O1xyXG4gICAgcGFyYW1zLmV4ZWN1dGFibGVOYW1lID0gZXhlY3V0YWJsZU5hbWVPckRlZmF1bHQocGFyYW1zLnByb2plY3ROYW1lLCBvcHRpb25zLnBhY2thZ2VzLm1hYy5leGVjdXRhYmxlTmFtZSk7XHJcbiAgICBpZiAocGFyYW1zLmV4ZWN1dGFibGVOYW1lID09PSAnQ29jb3NHYW1lJykge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihgVGhlIHByb3ZpZGVkIHByb2plY3QgbmFtZSBcIiR7cGFyYW1zLnByb2plY3ROYW1lfVwiIGlzIG5vdCBzdWl0YWJsZSBmb3IgdXNlIGFzIGFuIGV4ZWN1dGFibGUgbmFtZS4gJ0NvY29zR2FtZScgaXMgYXBwbGllZCBpbnN0ZWFkLmApO1xyXG4gICAgfVxyXG4gICAgcGFyYW1zLmNNYWtlQ29uZmlnLkNDX0VYRUNVVEFCTEVfTkFNRSA9IGBzZXQoQ0NfRVhFQ1VUQUJMRV9OQU1FIFwiJHtwYXJhbXMuZXhlY3V0YWJsZU5hbWV9XCIpYDtcclxuXHJcbiAgICBwYXJhbXMucGxhdGZvcm1QYXJhbXMuYnVuZGxlSWQgPSBwa2dPcHRpb25zLnBhY2thZ2VOYW1lO1xyXG4gICAgT2JqZWN0LmtleXMocmVuZGVyQmFja0VuZCkuZm9yRWFjaCgoYmFja2VuZCkgPT4ge1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBwYXJhbXMuY01ha2VDb25maWdbYENDX1VTRV8ke2JhY2tlbmQudG9VcHBlckNhc2UoKX1gXSA9IHJlbmRlckJhY2tFbmRbYmFja2VuZF07XHJcbiAgICB9KTtcclxuICAgIC8vIFRPRE8g5LuF6YOo5YiG5bmz5Y+w5pSv5oyB55qE6YCJ6aG577yM6ZyA6KaB5pS+5Zyo5bmz5Y+w5o+S5Lu26YeM6Ieq6KGM5rOo5YaMXHJcbiAgICBpZiAoIW9wdGlvbnMucGFja2FnZXMubmF0aXZlKSB7XHJcbiAgICAgICAgb3B0aW9ucy5wYWNrYWdlcy5uYXRpdmUgPSB7fTtcclxuICAgIH1cclxuICAgIHBhcmFtcy5jTWFrZUNvbmZpZy5VU0VfU0VSVkVSX01PREUgPSBgc2V0KFVTRV9TRVJWRVJfTU9ERSAke29wdGlvbnMucGFja2FnZXMubmF0aXZlIS5zZXJ2ZXJNb2RlID8gJ09OJyA6ICdPRkYnfSlgO1xyXG4gICAgbGV0IG5ldE1vZGUgPSBOdW1iZXIob3B0aW9ucy5wYWNrYWdlcy5uYXRpdmUhLm5ldE1vZGUpO1xyXG4gICAgbmV0TW9kZSA9IG9wdGlvbnMucGFja2FnZXMubmF0aXZlIS5uZXRNb2RlID0gKGlzTmFOKG5ldE1vZGUpIHx8IG5ldE1vZGUgPiAyIHx8IG5ldE1vZGUgPCAwKSA/IDAgOiBuZXRNb2RlO1xyXG4gICAgcGFyYW1zLmNNYWtlQ29uZmlnLk5FVF9NT0RFID0gYHNldChORVRfTU9ERSAke25ldE1vZGV9KWA7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvbkFmdGVyQnVuZGxlSW5pdChvcHRpb25zOiBJTWFjSW50ZXJuYWxCdWlsZE9wdGlvbnMpIHtcclxuICAgIGF3YWl0IG5hdGl2ZUNvbW1vbkhvb2sub25BZnRlckJ1bmRsZUluaXQob3B0aW9ucyk7XHJcbiAgICBjb25zdCByZW5kZXJCYWNrRW5kID0gb3B0aW9ucy5wYWNrYWdlcy5tYWMucmVuZGVyQmFja0VuZDtcclxuICAgIG9wdGlvbnMuYXNzZXRTZXJpYWxpemVPcHRpb25zIVsnY2MuRWZmZWN0QXNzZXQnXS5nbHNsMSA9IHJlbmRlckJhY2tFbmQuZ2xlczIgPz8gdHJ1ZTtcclxuICAgIG9wdGlvbnMuYXNzZXRTZXJpYWxpemVPcHRpb25zIVsnY2MuRWZmZWN0QXNzZXQnXS5nbHNsMyA9IHJlbmRlckJhY2tFbmQuZ2xlczMgPz8gdHJ1ZTtcclxuICAgIG9wdGlvbnMuYXNzZXRTZXJpYWxpemVPcHRpb25zIVsnY2MuRWZmZWN0QXNzZXQnXS5nbHNsNCA9IHJlbmRlckJhY2tFbmQubWV0YWwgPz8gdHJ1ZTtcclxuICAgIGxldCBuZXRNb2RlID0gTnVtYmVyKG9wdGlvbnMucGFja2FnZXMubmF0aXZlIS5uZXRNb2RlKTtcclxuICAgIG5ldE1vZGUgPSBvcHRpb25zLnBhY2thZ2VzLm5hdGl2ZSEubmV0TW9kZSA9IChpc05hTihuZXRNb2RlKSB8fCBuZXRNb2RlID4gMiB8fCBuZXRNb2RlIDwgMCkgPyAwIDogbmV0TW9kZTtcclxuICAgIG9wdGlvbnMuYnVpbGRTY3JpcHRQYXJhbS5mbGFncy5TRVJWRVJfTU9ERSA9ICEhb3B0aW9ucy5wYWNrYWdlcy5uYXRpdmUuc2VydmVyTW9kZTtcclxuICAgIG9wdGlvbnMuYnVpbGRTY3JpcHRQYXJhbS5mbGFncy5ORVRfTU9ERSA9IG9wdGlvbnMucGFja2FnZXMubmF0aXZlIS5uZXRNb2RlO1xyXG59XHJcbiJdfQ==