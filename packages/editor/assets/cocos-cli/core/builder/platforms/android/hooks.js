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
exports.run = exports.make = exports.onBeforeMake = exports.onAfterCompressSettings = exports.onAfterBundleDataTask = exports.onBeforeBuild = void 0;
exports.onAfterBuild = onAfterBuild;
exports.onAfterInit = onAfterInit;
exports.onAfterBundleInit = onAfterBundleInit;
const utils_1 = require("./utils");
const nativeCommonHook = __importStar(require("../native-common/hooks"));
const path_1 = require("path");
const global_1 = require("../../../../global");
exports.onBeforeBuild = nativeCommonHook.onBeforeBuild;
exports.onAfterBundleDataTask = nativeCommonHook.onAfterBundleDataTask;
exports.onAfterCompressSettings = nativeCommonHook.onAfterCompressSettings;
async function onAfterBuild(options, result, cache) {
    console.log('[AndroidHooks] onAfterBuild called');
    await nativeCommonHook.onAfterBuild.call(this, options, result);
}
exports.onBeforeMake = nativeCommonHook.onBeforeMake;
exports.make = nativeCommonHook.make;
exports.run = nativeCommonHook.run;
async function onAfterInit(options, result, _cache) {
    await nativeCommonHook.onAfterInit.call(this, options, result);
    // 生成 Android 选项
    const android = await (0, utils_1.generateAndroidOptions)(options);
    options.packages.android = android;
    const renderBackEnd = android.renderBackEnd;
    // 检查 API Level
    const res = await (0, utils_1.checkAndroidAPILevels)(android.apiLevel, options);
    if (res.error) {
        console.error(res.error);
        res.newValue && (android.apiLevel = res.newValue);
    }
    // 处理调试密钥库
    if (android.useDebugKeystore) {
        android.keystorePath = (0, path_1.join)(global_1.GlobalPaths.staticDir, 'tools/keystore/debug.keystore');
        android.keystoreAlias = 'debug_keystore';
        android.keystorePassword = '123456';
        android.keystoreAliasPassword = '123456';
    }
    // 补充一些平台必须的参数
    const params = options.cocosParams;
    Object.assign(params.platformParams, android);
    if (renderBackEnd) {
        Object.keys(renderBackEnd).forEach((backend) => {
            // @ts-ignore
            params.cMakeConfig[`CC_USE_${backend.toUpperCase()}`] = renderBackEnd[backend];
        });
    }
    params.cMakeConfig.CC_ENABLE_SWAPPY = !!android.swappy;
    // ADPF was previously enabled on the android platform.
    params.cMakeConfig.USE_ADPF = true;
}
async function onAfterBundleInit(options) {
    await nativeCommonHook.onAfterBundleInit(options);
    const renderBackEnd = options.packages.android.renderBackEnd;
    options.assetSerializeOptions['cc.EffectAsset'].glsl1 = renderBackEnd.gles2 ?? true;
    options.assetSerializeOptions['cc.EffectAsset'].glsl3 = renderBackEnd.gles3 ?? true;
    options.assetSerializeOptions['cc.EffectAsset'].glsl4 = renderBackEnd.vulkan ?? true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3BsYXRmb3Jtcy9hbmRyb2lkL2hvb2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBWWIsb0NBR0M7QUFLRCxrQ0FxQ0M7QUFFRCw4Q0FPQztBQTlERCxtQ0FBd0U7QUFDeEUseUVBQTJEO0FBQzNELCtCQUE0QjtBQUM1QiwrQ0FBaUQ7QUFFcEMsUUFBQSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDO0FBQy9DLFFBQUEscUJBQXFCLEdBQUcsZ0JBQWdCLENBQUMscUJBQXFCLENBQUM7QUFDL0QsUUFBQSx1QkFBdUIsR0FBRyxnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQztBQUN6RSxLQUFLLFVBQVUsWUFBWSxDQUFpQixPQUFxQyxFQUFFLE1BQW9CLEVBQUUsS0FBbUI7SUFDL0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0lBQ2xELE1BQU0sZ0JBQWdCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3BFLENBQUM7QUFDWSxRQUFBLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUM7QUFDN0MsUUFBQSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDO0FBQzdCLFFBQUEsR0FBRyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQztBQUVqQyxLQUFLLFVBQVUsV0FBVyxDQUFpQixPQUFxQyxFQUFFLE1BQW9CLEVBQUUsTUFBb0I7SUFDL0gsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFL0QsZ0JBQWdCO0lBQ2hCLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBQSw4QkFBc0IsRUFBQyxPQUFPLENBQUMsQ0FBQztJQUN0RCxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFFbkMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQztJQUU1QyxlQUFlO0lBQ2YsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFBLDZCQUFxQixFQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbkUsSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDWixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QixHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELFVBQVU7SUFDVixJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzNCLE9BQU8sQ0FBQyxZQUFZLEdBQUcsSUFBQSxXQUFJLEVBQUMsb0JBQVcsQ0FBQyxTQUFTLEVBQUUsK0JBQStCLENBQUMsQ0FBQztRQUNwRixPQUFPLENBQUMsYUFBYSxHQUFHLGdCQUFnQixDQUFDO1FBQ3pDLE9BQU8sQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUM7UUFDcEMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLFFBQVEsQ0FBQztJQUM3QyxDQUFDO0lBRUQsY0FBYztJQUNkLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7SUFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRTlDLElBQUksYUFBYSxFQUFFLENBQUM7UUFDaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQyxhQUFhO1lBQ2IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLE9BQXVDLENBQUMsQ0FBQztRQUNuSCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRCxNQUFNLENBQUMsV0FBVyxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQ3ZELHVEQUF1RDtJQUN2RCxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDdkMsQ0FBQztBQUVNLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxPQUFxQztJQUN6RSxNQUFNLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2xELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztJQUU3RCxPQUFPLENBQUMscUJBQXNCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUM7SUFDckYsT0FBTyxDQUFDLHFCQUFzQixDQUFDLGdCQUFnQixDQUFDLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDO0lBQ3JGLE9BQU8sQ0FBQyxxQkFBc0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQztBQUMxRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgSUJ1aWxkUmVzdWx0LCBJQW5kcm9pZEludGVybmFsQnVpbGRPcHRpb25zIH0gZnJvbSAnLi90eXBlJztcclxuaW1wb3J0IHsgQnVpbGRlckNhY2hlLCBJQnVpbGRlciB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBnZW5lcmF0ZUFuZHJvaWRPcHRpb25zLCBjaGVja0FuZHJvaWRBUElMZXZlbHMgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0ICogYXMgbmF0aXZlQ29tbW9uSG9vayBmcm9tICcuLi9uYXRpdmUtY29tbW9uL2hvb2tzJztcclxuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBHbG9iYWxQYXRocyB9IGZyb20gJy4uLy4uLy4uLy4uL2dsb2JhbCc7XHJcblxyXG5leHBvcnQgY29uc3Qgb25CZWZvcmVCdWlsZCA9IG5hdGl2ZUNvbW1vbkhvb2sub25CZWZvcmVCdWlsZDtcclxuZXhwb3J0IGNvbnN0IG9uQWZ0ZXJCdW5kbGVEYXRhVGFzayA9IG5hdGl2ZUNvbW1vbkhvb2sub25BZnRlckJ1bmRsZURhdGFUYXNrO1xyXG5leHBvcnQgY29uc3Qgb25BZnRlckNvbXByZXNzU2V0dGluZ3MgPSBuYXRpdmVDb21tb25Ib29rLm9uQWZ0ZXJDb21wcmVzc1NldHRpbmdzO1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25BZnRlckJ1aWxkKHRoaXM6IElCdWlsZGVyLCBvcHRpb25zOiBJQW5kcm9pZEludGVybmFsQnVpbGRPcHRpb25zLCByZXN1bHQ6IElCdWlsZFJlc3VsdCwgY2FjaGU6IEJ1aWxkZXJDYWNoZSkge1xyXG4gICAgY29uc29sZS5sb2coJ1tBbmRyb2lkSG9va3NdIG9uQWZ0ZXJCdWlsZCBjYWxsZWQnKTtcclxuICAgIGF3YWl0IG5hdGl2ZUNvbW1vbkhvb2sub25BZnRlckJ1aWxkLmNhbGwodGhpcywgb3B0aW9ucywgcmVzdWx0KTtcclxufVxyXG5leHBvcnQgY29uc3Qgb25CZWZvcmVNYWtlID0gbmF0aXZlQ29tbW9uSG9vay5vbkJlZm9yZU1ha2U7XHJcbmV4cG9ydCBjb25zdCBtYWtlID0gbmF0aXZlQ29tbW9uSG9vay5tYWtlO1xyXG5leHBvcnQgY29uc3QgcnVuID0gbmF0aXZlQ29tbW9uSG9vay5ydW47XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25BZnRlckluaXQodGhpczogSUJ1aWxkZXIsIG9wdGlvbnM6IElBbmRyb2lkSW50ZXJuYWxCdWlsZE9wdGlvbnMsIHJlc3VsdDogSUJ1aWxkUmVzdWx0LCBfY2FjaGU6IEJ1aWxkZXJDYWNoZSkge1xyXG4gICAgYXdhaXQgbmF0aXZlQ29tbW9uSG9vay5vbkFmdGVySW5pdC5jYWxsKHRoaXMsIG9wdGlvbnMsIHJlc3VsdCk7XHJcbiAgICBcclxuICAgIC8vIOeUn+aIkCBBbmRyb2lkIOmAiemhuVxyXG4gICAgY29uc3QgYW5kcm9pZCA9IGF3YWl0IGdlbmVyYXRlQW5kcm9pZE9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICBvcHRpb25zLnBhY2thZ2VzLmFuZHJvaWQgPSBhbmRyb2lkO1xyXG4gICAgXHJcbiAgICBjb25zdCByZW5kZXJCYWNrRW5kID0gYW5kcm9pZC5yZW5kZXJCYWNrRW5kO1xyXG4gICAgXHJcbiAgICAvLyDmo4Dmn6UgQVBJIExldmVsXHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBjaGVja0FuZHJvaWRBUElMZXZlbHMoYW5kcm9pZC5hcGlMZXZlbCwgb3B0aW9ucyk7XHJcbiAgICBpZiAocmVzLmVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihyZXMuZXJyb3IpO1xyXG4gICAgICAgIHJlcy5uZXdWYWx1ZSAmJiAoYW5kcm9pZC5hcGlMZXZlbCA9IHJlcy5uZXdWYWx1ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIOWkhOeQhuiwg+ivleWvhumSpeW6k1xyXG4gICAgaWYgKGFuZHJvaWQudXNlRGVidWdLZXlzdG9yZSkge1xyXG4gICAgICAgIGFuZHJvaWQua2V5c3RvcmVQYXRoID0gam9pbihHbG9iYWxQYXRocy5zdGF0aWNEaXIsICd0b29scy9rZXlzdG9yZS9kZWJ1Zy5rZXlzdG9yZScpO1xyXG4gICAgICAgIGFuZHJvaWQua2V5c3RvcmVBbGlhcyA9ICdkZWJ1Z19rZXlzdG9yZSc7XHJcbiAgICAgICAgYW5kcm9pZC5rZXlzdG9yZVBhc3N3b3JkID0gJzEyMzQ1Nic7XHJcbiAgICAgICAgYW5kcm9pZC5rZXlzdG9yZUFsaWFzUGFzc3dvcmQgPSAnMTIzNDU2JztcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8g6KGl5YWF5LiA5Lqb5bmz5Y+w5b+F6aG755qE5Y+C5pWwXHJcbiAgICBjb25zdCBwYXJhbXMgPSBvcHRpb25zLmNvY29zUGFyYW1zO1xyXG4gICAgT2JqZWN0LmFzc2lnbihwYXJhbXMucGxhdGZvcm1QYXJhbXMsIGFuZHJvaWQpO1xyXG4gICAgXHJcbiAgICBpZiAocmVuZGVyQmFja0VuZCkge1xyXG4gICAgICAgIE9iamVjdC5rZXlzKHJlbmRlckJhY2tFbmQpLmZvckVhY2goKGJhY2tlbmQpID0+IHtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBwYXJhbXMuY01ha2VDb25maWdbYENDX1VTRV8ke2JhY2tlbmQudG9VcHBlckNhc2UoKX1gXSA9IHJlbmRlckJhY2tFbmRbYmFja2VuZCBhcyAnZ2xlczInIHwgJ2dsZXMzJyB8ICd2dWxrYW4nXTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHBhcmFtcy5jTWFrZUNvbmZpZy5DQ19FTkFCTEVfU1dBUFBZID0gISFhbmRyb2lkLnN3YXBweTtcclxuICAgIC8vIEFEUEYgd2FzIHByZXZpb3VzbHkgZW5hYmxlZCBvbiB0aGUgYW5kcm9pZCBwbGF0Zm9ybS5cclxuICAgIHBhcmFtcy5jTWFrZUNvbmZpZy5VU0VfQURQRiA9IHRydWU7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvbkFmdGVyQnVuZGxlSW5pdChvcHRpb25zOiBJQW5kcm9pZEludGVybmFsQnVpbGRPcHRpb25zKSB7XHJcbiAgICBhd2FpdCBuYXRpdmVDb21tb25Ib29rLm9uQWZ0ZXJCdW5kbGVJbml0KG9wdGlvbnMpO1xyXG4gICAgY29uc3QgcmVuZGVyQmFja0VuZCA9IG9wdGlvbnMucGFja2FnZXMuYW5kcm9pZC5yZW5kZXJCYWNrRW5kO1xyXG4gICAgXHJcbiAgICBvcHRpb25zLmFzc2V0U2VyaWFsaXplT3B0aW9ucyFbJ2NjLkVmZmVjdEFzc2V0J10uZ2xzbDEgPSByZW5kZXJCYWNrRW5kLmdsZXMyID8/IHRydWU7XHJcbiAgICBvcHRpb25zLmFzc2V0U2VyaWFsaXplT3B0aW9ucyFbJ2NjLkVmZmVjdEFzc2V0J10uZ2xzbDMgPSByZW5kZXJCYWNrRW5kLmdsZXMzID8/IHRydWU7XHJcbiAgICBvcHRpb25zLmFzc2V0U2VyaWFsaXplT3B0aW9ucyFbJ2NjLkVmZmVjdEFzc2V0J10uZ2xzbDQgPSByZW5kZXJCYWNrRW5kLnZ1bGthbiA/PyB0cnVlO1xyXG59XHJcblxyXG4iXX0=