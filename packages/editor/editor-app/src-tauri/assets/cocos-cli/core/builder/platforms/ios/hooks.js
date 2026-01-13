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
exports.run = exports.make = exports.onBeforeMake = exports.onAfterCompressSettings = exports.onAfterBundleDataTask = exports.onBeforeBuild = exports.throwError = void 0;
exports.onAfterInit = onAfterInit;
exports.onAfterBundleInit = onAfterBundleInit;
exports.onAfterBuildAssets = onAfterBuildAssets;
exports.onBeforeCompressSettings = onBeforeCompressSettings;
exports.onAfterBuild = onAfterBuild;
const nativeCommonHook = __importStar(require("../native-common/hooks"));
const utils_1 = require("./utils");
const cc_1 = require("cc");
const fs_1 = require("fs");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
exports.throwError = true;
exports.onBeforeBuild = nativeCommonHook.onBeforeBuild;
exports.onAfterBundleDataTask = nativeCommonHook.onAfterBundleDataTask;
exports.onAfterCompressSettings = nativeCommonHook.onAfterCompressSettings;
exports.onBeforeMake = nativeCommonHook.onBeforeMake;
exports.make = nativeCommonHook.make;
exports.run = nativeCommonHook.run;
/**
 * 在开始构建之前构建出 native 项目
 * @param options
 * @param cache
 */
async function onAfterInit(options, result, cache) {
    await nativeCommonHook.onAfterInit.call(this, options, result);
    // const output = join(result.paths.dir, '..');
    const renderBackEnd = options.packages.ios.renderBackEnd = {
        gles2: false,
        gles3: false,
        metal: true,
    };
    // 补充一些平台必须的参数
    const params = options.cocosParams;
    Object.keys(renderBackEnd).forEach((backend) => {
        // @ts-ignore
        params.cMakeConfig[`CC_USE_${backend.toUpperCase()}`] = renderBackEnd[backend];
    });
    const pkgOptions = options.packages.ios;
    params.platformParams.orientation = options.packages.ios.orientation;
    params.platformParams.bundleId = options.packages.ios.packageName;
    params.cMakeConfig.MACOSX_BUNDLE_GUI_IDENTIFIER = `set(MACOSX_BUNDLE_GUI_IDENTIFIER ${params.packageName})`;
    if (pkgOptions.developerTeam) {
        // 面板上通过 value_hash 作为标识，这里需要取出 value
        const developerTeam = pkgOptions.developerTeam.split('_')[0];
        params.cMakeConfig.DEVELOPMENT_TEAM = `set(DEVELOPMENT_TEAM ${developerTeam})`;
        params.platformParams.teamid = developerTeam;
    }
    params.cMakeConfig.TARGET_IOS_VERSION = `set(TARGET_IOS_VERSION ${pkgOptions.targetVersion || '12.0'})`;
    params.cMakeConfig.USE_PORTRAIT = !!pkgOptions.orientation.portrait;
    params.cMakeConfig.CUSTOM_COPY_RESOURCE_HOOK = pkgOptions.skipUpdateXcodeProject;
    params.platformParams.skipUpdateXcodeProject = pkgOptions.skipUpdateXcodeProject;
    params.executableName = (0, utils_1.executableNameOrDefault)(params.projectName, options.packages.ios.executableName);
    if (params.executableName === 'CocosGame') {
        console.warn(`The provided project name "${params.projectName}" is not suitable for use as an executable name. 'CocosGame' is applied instead.`);
    }
    params.cMakeConfig.CC_EXECUTABLE_NAME = `set(CC_EXECUTABLE_NAME "${params.executableName}")`;
    if (pkgOptions.osTarget) {
        pkgOptions.osTarget.simulator !== undefined && (params.platformParams.simulator = pkgOptions.osTarget.simulator);
        pkgOptions.osTarget.iphoneos !== undefined && (params.platformParams.iphoneos = pkgOptions.osTarget.iphoneos);
    }
}
async function onAfterBundleInit(options) {
    await nativeCommonHook.onAfterBundleInit(options);
    const renderBackEnd = options.packages.ios.renderBackEnd = {
        gles2: false,
        gles3: false,
        metal: true,
    };
    options.assetSerializeOptions['cc.EffectAsset'].glsl1 = renderBackEnd.gles2 ?? true;
    options.assetSerializeOptions['cc.EffectAsset'].glsl3 = renderBackEnd.gles3 ?? true;
    options.assetSerializeOptions['cc.EffectAsset'].glsl4 = renderBackEnd.metal ?? true;
}
async function onAfterBuildAssets(options, result, cache) {
    // 380 防止构建过程中修改启用插屏，问卷校验失败
    if (!options.useSplashScreen) {
        options.useSplashScreen = true;
    }
}
async function onBeforeCompressSettings(options, result, cache) {
    // 校验完插屏后，压缩 settings 前，关闭 iOS 平台插屏
    result.settings.splashScreen && (result.settings.splashScreen.totalTime = 0);
}
async function onAfterBuild(options, result) {
    await nativeCommonHook.onAfterBuild.call(this, options, result);
    // generate 之后 make 之前，生成插屏图片，暂时屏蔽
    //   await buildSplash(options, result);
}
async function buildSplash(options, result) {
    const splashScreenSettings = result.settings.splashScreen;
    if (splashScreenSettings && splashScreenSettings.logo && splashScreenSettings.background) {
        const destDir = (0, path_1.join)(options.packages.ios.projectDistPath, 'native/engine/ios');
        (0, fs_extra_1.ensureDirSync)(destDir);
        const imageOptions = [{
                width: 1242,
                height: 2208,
                outputPath: (0, path_1.join)(destDir, 'LaunchScreenBackgroundPortrait.png'),
            }, {
                width: 2208,
                height: 1242,
                outputPath: (0, path_1.join)(destDir, 'LaunchScreenBackgroundLandscape.png'),
            }];
        try {
            // 生成横竖屏图
            for (const option of imageOptions) {
                await generateSplashPicture(option, splashScreenSettings, result.settings.screen.designResolution);
            }
            // 引擎会优先读取目标图，所以还要拷贝一张目标图
            const baseImg = options.packages.ios.orientation.portrait ? (0, path_1.join)(destDir, 'LaunchScreenBackgroundPortrait.png') : (0, path_1.join)(destDir, 'LaunchScreenBackgroundLandscape.png');
            (0, fs_1.copyFileSync)(baseImg, (0, path_1.join)(destDir, 'LaunchScreenBackground.png'));
            console.debug('Generate splash to:', (0, path_1.join)(destDir, 'LaunchScreenBackgroundPortrait.png'));
        }
        catch (error) {
            console.warn('Failed to generate splash:', error);
        }
    }
}
async function generateSplashPicture(option, splashSettings, designResolution) {
    // 新建画布
    const canvas = document.createElement('canvas');
    canvas.width = option.width;
    canvas.height = option.height;
    // 将图片画到画布上
    const context = canvas.getContext('2d');
    if (splashSettings.background?.type === 'custom' && splashSettings.background.base64) {
        const policy = designResolution.policy;
        // 绘制自定义图片背景
        const bgImage = new Image();
        bgImage.src = splashSettings.background.base64;
        await loadImage(bgImage);
        // 背景图填充满，背景图根据画布宽高等比例缩放后，以背景图中心展示，超出四周的裁剪
        const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height);
        let width;
        let height;
        if (policy === cc_1.ResolutionPolicy.FIXED_HEIGHT) {
            width = bgImage.width * canvas.height / bgImage.height;
            height = canvas.height;
        }
        else if (policy === cc_1.ResolutionPolicy.FIXED_WIDTH) {
            width = canvas.width;
            height = bgImage.height * canvas.width / bgImage.width;
        }
        else if (policy === cc_1.ResolutionPolicy.SHOW_ALL) {
            if ((bgImage.width / bgImage.height) > (canvas.width / canvas.height)) {
                width = canvas.width;
                height = bgImage.height * canvas.width / bgImage.width;
            }
            else {
                width = bgImage.width * canvas.height / bgImage.height;
                height = canvas.height;
            }
        }
        else if (policy === cc_1.ResolutionPolicy.NO_BORDER) {
            if ((bgImage.width / bgImage.height) > (canvas.width / canvas.height)) {
                width = bgImage.width * canvas.height / bgImage.height;
                height = canvas.height;
            }
            else {
                width = canvas.width;
                height = bgImage.height * canvas.width / bgImage.width;
            }
        }
        else {
            width = canvas.width;
            height = canvas.height;
        }
        const offsetX = (canvas.width - width) / 2;
        const offsetY = (canvas.height - height) / 2;
        context.beginPath();
        context.rect(offsetX, offsetY, width, height);
        context.closePath();
        context.clip();
        context.drawImage(bgImage, offsetX, offsetY, width, height);
    }
    else if (splashSettings.background?.type === 'color' && splashSettings.background.color) {
        // 绘制自定义颜色背景
        const color = splashSettings.background.color;
        context.fillStyle = `rgba(${color.x * 255}, ${color.y * 255}, ${color.z * 255}, ${color.w * 255})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    else {
        // 绘制默认 #04090A 背景
        context.fillStyle = 'rgba(4, 9, 10, 1)';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    if ((splashSettings.logo?.type === 'custom' || splashSettings.logo?.type === 'default') && splashSettings.logo.base64) {
        // 绘制自定义 logo 图片
        const logoImage = new Image();
        logoImage.src = splashSettings.logo.base64;
        await loadImage(logoImage);
        const logoAspectRatio = logoImage.height / logoImage.width;
        const logoHeightPercentage = 0.185; // 如果设置的是 100%，logo的高度固定占预览区域的 18.5%
        const logoAreaHeightPercentage = 5 / 6; // logo 区域高度占设备高度的 5 / 6
        const logoHeight = canvas.height * logoHeightPercentage * splashSettings.displayRatio;
        const logoWidth = logoHeight / logoAspectRatio;
        const logoX = (canvas.width - logoWidth) / 2;
        let logoY = (canvas.height * logoAreaHeightPercentage - logoHeight) / 2;
        if (logoHeight > canvas.height * logoAreaHeightPercentage) {
            logoY = (canvas.height - logoHeight) / 2;
        }
        context.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
        // 绘制水印
        if (splashSettings.logo.type === 'default') {
            context.font = `400 36px Arial`;
            context.textBaseline = 'top';
            context.textAlign = 'center';
            context.fillStyle = 'rgba(250, 250, 250, 0.4)';
            context.lineWidth = 2;
            context.strokeStyle = 'rgba(5, 5, 5, 0.3)';
            context.strokeText('Created with Cocos', canvas.width / 2, logoY + logoHeight + 48);
            context.fillText('Created with Cocos', canvas.width / 2, logoY + logoHeight + 48);
        }
    }
    // 将画布转换为 base64
    const mergedImage = canvas.toDataURL('image/png');
    // 将 base64 转为二进制
    const binaryData = atob(mergedImage.split(',')[1]);
    // 写入到本地文件
    (0, fs_1.writeFileSync)(option.outputPath, binaryData, 'binary');
    console.log('Generate splash to:', option.outputPath);
    function loadImage(image) {
        return new Promise((resolve, reject) => {
            if (image.complete) {
                resolve(image);
            }
            else {
                image.addEventListener('load', () => {
                    resolve(image);
                });
                image.addEventListener('error', error => {
                    reject(error);
                });
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3BsYXRmb3Jtcy9pb3MvaG9va3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEwQmIsa0NBdUNDO0FBRUQsOENBVUM7QUFFRCxnREFLQztBQUVELDREQUdDO0FBRUQsb0NBSUM7QUEzRkQseUVBQTJEO0FBQzNELG1DQUFrRDtBQUNsRCwyQkFBc0M7QUFDdEMsMkJBQWlEO0FBQ2pELCtCQUE0QjtBQUM1Qix1Q0FBeUM7QUFHNUIsUUFBQSxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFFBQUEsYUFBYSxHQUFHLGdCQUFnQixDQUFDLGFBQWEsQ0FBQztBQUMvQyxRQUFBLHFCQUFxQixHQUFHLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDO0FBQy9ELFFBQUEsdUJBQXVCLEdBQUcsZ0JBQWdCLENBQUMsdUJBQXVCLENBQUM7QUFDbkUsUUFBQSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsWUFBWSxDQUFDO0FBQzdDLFFBQUEsSUFBSSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQztBQUM3QixRQUFBLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUM7QUFHeEM7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxXQUFXLENBQWlCLE9BQWlDLEVBQUUsTUFBb0IsRUFBRSxLQUFtQjtJQUMxSCxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMvRCwrQ0FBK0M7SUFDL0MsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHO1FBQ3ZELEtBQUssRUFBRSxLQUFLO1FBQ1osS0FBSyxFQUFFLEtBQUs7UUFDWixLQUFLLEVBQUUsSUFB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O1xyXG5cclxuaW1wb3J0IHsgSUJ1aWxkUmVzdWx0LCBJSU9TSW50ZXJuYWxCdWlsZE9wdGlvbnMgfSBmcm9tICcuL3R5cGUnO1xyXG5pbXBvcnQgeyBCdWlsZGVyQ2FjaGUsIElCdWlsZGVyLCBJbnRlcm5hbEJ1aWxkUmVzdWx0LCBJU2V0dGluZ3NEZXNpZ25SZXNvbHV0aW9uIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCAqIGFzIG5hdGl2ZUNvbW1vbkhvb2sgZnJvbSAnLi4vbmF0aXZlLWNvbW1vbi9ob29rcyc7XHJcbmltcG9ydCB7IGV4ZWN1dGFibGVOYW1lT3JEZWZhdWx0IH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IFJlc29sdXRpb25Qb2xpY3kgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IGNvcHlGaWxlU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBlbnN1cmVEaXJTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBJU3BsYXNoU2V0dGluZyB9IGZyb20gJy4uLy4uLy4uL2VuZ2luZS9AdHlwZXMvcHVibGljJztcclxuXHJcbmV4cG9ydCBjb25zdCB0aHJvd0Vycm9yID0gdHJ1ZTtcclxuZXhwb3J0IGNvbnN0IG9uQmVmb3JlQnVpbGQgPSBuYXRpdmVDb21tb25Ib29rLm9uQmVmb3JlQnVpbGQ7XHJcbmV4cG9ydCBjb25zdCBvbkFmdGVyQnVuZGxlRGF0YVRhc2sgPSBuYXRpdmVDb21tb25Ib29rLm9uQWZ0ZXJCdW5kbGVEYXRhVGFzaztcclxuZXhwb3J0IGNvbnN0IG9uQWZ0ZXJDb21wcmVzc1NldHRpbmdzID0gbmF0aXZlQ29tbW9uSG9vay5vbkFmdGVyQ29tcHJlc3NTZXR0aW5ncztcclxuZXhwb3J0IGNvbnN0IG9uQmVmb3JlTWFrZSA9IG5hdGl2ZUNvbW1vbkhvb2sub25CZWZvcmVNYWtlO1xyXG5leHBvcnQgY29uc3QgbWFrZSA9IG5hdGl2ZUNvbW1vbkhvb2subWFrZTtcclxuZXhwb3J0IGNvbnN0IHJ1biA9IG5hdGl2ZUNvbW1vbkhvb2sucnVuO1xyXG5cclxuXHJcbi8qKlxyXG4gKiDlnKjlvIDlp4vmnoTlu7rkuYvliY3mnoTlu7rlh7ogbmF0aXZlIOmhueebrlxyXG4gKiBAcGFyYW0gb3B0aW9uc1xyXG4gKiBAcGFyYW0gY2FjaGVcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvbkFmdGVySW5pdCh0aGlzOiBJQnVpbGRlciwgb3B0aW9uczogSUlPU0ludGVybmFsQnVpbGRPcHRpb25zLCByZXN1bHQ6IElCdWlsZFJlc3VsdCwgY2FjaGU6IEJ1aWxkZXJDYWNoZSkge1xyXG4gICAgYXdhaXQgbmF0aXZlQ29tbW9uSG9vay5vbkFmdGVySW5pdC5jYWxsKHRoaXMsIG9wdGlvbnMsIHJlc3VsdCk7XHJcbiAgICAvLyBjb25zdCBvdXRwdXQgPSBqb2luKHJlc3VsdC5wYXRocy5kaXIsICcuLicpO1xyXG4gICAgY29uc3QgcmVuZGVyQmFja0VuZCA9IG9wdGlvbnMucGFja2FnZXMuaW9zLnJlbmRlckJhY2tFbmQgPSB7XHJcbiAgICAgICAgZ2xlczI6IGZhbHNlLFxyXG4gICAgICAgIGdsZXMzOiBmYWxzZSxcclxuICAgICAgICBtZXRhbDogdHJ1ZSxcclxuICAgIH07XHJcblxyXG4gICAgLy8g6KGl5YWF5LiA5Lqb5bmz5Y+w5b+F6aG755qE5Y+C5pWwXHJcbiAgICBjb25zdCBwYXJhbXMgPSBvcHRpb25zLmNvY29zUGFyYW1zO1xyXG4gICAgT2JqZWN0LmtleXMocmVuZGVyQmFja0VuZCkuZm9yRWFjaCgoYmFja2VuZCkgPT4ge1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBwYXJhbXMuY01ha2VDb25maWdbYENDX1VTRV8ke2JhY2tlbmQudG9VcHBlckNhc2UoKX1gXSA9IHJlbmRlckJhY2tFbmRbYmFja2VuZF07XHJcbiAgICB9KTtcclxuICAgIGNvbnN0IHBrZ09wdGlvbnMgPSBvcHRpb25zLnBhY2thZ2VzLmlvcztcclxuICAgIHBhcmFtcy5wbGF0Zm9ybVBhcmFtcy5vcmllbnRhdGlvbiA9IG9wdGlvbnMucGFja2FnZXMuaW9zLm9yaWVudGF0aW9uO1xyXG4gICAgcGFyYW1zLnBsYXRmb3JtUGFyYW1zLmJ1bmRsZUlkID0gb3B0aW9ucy5wYWNrYWdlcy5pb3MucGFja2FnZU5hbWU7XHJcbiAgICBwYXJhbXMuY01ha2VDb25maWcuTUFDT1NYX0JVTkRMRV9HVUlfSURFTlRJRklFUiA9IGBzZXQoTUFDT1NYX0JVTkRMRV9HVUlfSURFTlRJRklFUiAkeyhwYXJhbXMgYXMgYW55KS5wYWNrYWdlTmFtZX0pYDtcclxuICAgIGlmIChwa2dPcHRpb25zLmRldmVsb3BlclRlYW0pIHtcclxuICAgICAgICAvLyDpnaLmnb/kuIrpgJrov4cgdmFsdWVfaGFzaCDkvZzkuLrmoIfor4bvvIzov5nph4zpnIDopoHlj5blh7ogdmFsdWVcclxuICAgICAgICBjb25zdCBkZXZlbG9wZXJUZWFtID0gcGtnT3B0aW9ucy5kZXZlbG9wZXJUZWFtLnNwbGl0KCdfJylbMF07XHJcbiAgICAgICAgcGFyYW1zLmNNYWtlQ29uZmlnLkRFVkVMT1BNRU5UX1RFQU0gPSBgc2V0KERFVkVMT1BNRU5UX1RFQU0gJHtkZXZlbG9wZXJUZWFtfSlgO1xyXG4gICAgICAgIHBhcmFtcy5wbGF0Zm9ybVBhcmFtcy50ZWFtaWQgPSBkZXZlbG9wZXJUZWFtO1xyXG4gICAgfVxyXG4gICAgcGFyYW1zLmNNYWtlQ29uZmlnLlRBUkdFVF9JT1NfVkVSU0lPTiA9IGBzZXQoVEFSR0VUX0lPU19WRVJTSU9OICR7cGtnT3B0aW9ucy50YXJnZXRWZXJzaW9uIHx8ICcxMi4wJ30pYDtcclxuICAgIHBhcmFtcy5jTWFrZUNvbmZpZy5VU0VfUE9SVFJBSVQgPSAhIXBrZ09wdGlvbnMub3JpZW50YXRpb24ucG9ydHJhaXQ7XHJcbiAgICBwYXJhbXMuY01ha2VDb25maWcuQ1VTVE9NX0NPUFlfUkVTT1VSQ0VfSE9PSyA9IHBrZ09wdGlvbnMuc2tpcFVwZGF0ZVhjb2RlUHJvamVjdDtcclxuICAgIHBhcmFtcy5wbGF0Zm9ybVBhcmFtcy5za2lwVXBkYXRlWGNvZGVQcm9qZWN0ID0gcGtnT3B0aW9ucy5za2lwVXBkYXRlWGNvZGVQcm9qZWN0O1xyXG4gICAgcGFyYW1zLmV4ZWN1dGFibGVOYW1lID0gZXhlY3V0YWJsZU5hbWVPckRlZmF1bHQocGFyYW1zLnByb2plY3ROYW1lLCBvcHRpb25zLnBhY2thZ2VzLmlvcy5leGVjdXRhYmxlTmFtZSk7XHJcbiAgICBpZiAocGFyYW1zLmV4ZWN1dGFibGVOYW1lID09PSAnQ29jb3NHYW1lJykge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihgVGhlIHByb3ZpZGVkIHByb2plY3QgbmFtZSBcIiR7cGFyYW1zLnByb2plY3ROYW1lfVwiIGlzIG5vdCBzdWl0YWJsZSBmb3IgdXNlIGFzIGFuIGV4ZWN1dGFibGUgbmFtZS4gJ0NvY29zR2FtZScgaXMgYXBwbGllZCBpbnN0ZWFkLmApO1xyXG4gICAgfVxyXG4gICAgcGFyYW1zLmNNYWtlQ29uZmlnLkNDX0VYRUNVVEFCTEVfTkFNRSA9IGBzZXQoQ0NfRVhFQ1VUQUJMRV9OQU1FIFwiJHtwYXJhbXMuZXhlY3V0YWJsZU5hbWV9XCIpYDtcclxuXHJcbiAgICBpZiAocGtnT3B0aW9ucy5vc1RhcmdldCkge1xyXG4gICAgICAgIHBrZ09wdGlvbnMub3NUYXJnZXQuc2ltdWxhdG9yICE9PSB1bmRlZmluZWQgJiYgKHBhcmFtcy5wbGF0Zm9ybVBhcmFtcy5zaW11bGF0b3IgPSBwa2dPcHRpb25zLm9zVGFyZ2V0LnNpbXVsYXRvcik7XHJcbiAgICAgICAgcGtnT3B0aW9ucy5vc1RhcmdldC5pcGhvbmVvcyAhPT0gdW5kZWZpbmVkICYmIChwYXJhbXMucGxhdGZvcm1QYXJhbXMuaXBob25lb3MgPSBwa2dPcHRpb25zLm9zVGFyZ2V0LmlwaG9uZW9zKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uQWZ0ZXJCdW5kbGVJbml0KG9wdGlvbnM6IElJT1NJbnRlcm5hbEJ1aWxkT3B0aW9ucykge1xyXG4gICAgYXdhaXQgbmF0aXZlQ29tbW9uSG9vay5vbkFmdGVyQnVuZGxlSW5pdChvcHRpb25zKTtcclxuICAgIGNvbnN0IHJlbmRlckJhY2tFbmQgPSBvcHRpb25zLnBhY2thZ2VzLmlvcy5yZW5kZXJCYWNrRW5kID0ge1xyXG4gICAgICAgIGdsZXMyOiBmYWxzZSxcclxuICAgICAgICBnbGVzMzogZmFsc2UsXHJcbiAgICAgICAgbWV0YWw6IHRydWUsXHJcbiAgICB9O1xyXG4gICAgb3B0aW9ucy5hc3NldFNlcmlhbGl6ZU9wdGlvbnMhWydjYy5FZmZlY3RBc3NldCddLmdsc2wxID0gcmVuZGVyQmFja0VuZC5nbGVzMiA/PyB0cnVlO1xyXG4gICAgb3B0aW9ucy5hc3NldFNlcmlhbGl6ZU9wdGlvbnMhWydjYy5FZmZlY3RBc3NldCddLmdsc2wzID0gcmVuZGVyQmFja0VuZC5nbGVzMyA/PyB0cnVlO1xyXG4gICAgb3B0aW9ucy5hc3NldFNlcmlhbGl6ZU9wdGlvbnMhWydjYy5FZmZlY3RBc3NldCddLmdsc2w0ID0gcmVuZGVyQmFja0VuZC5tZXRhbCA/PyB0cnVlO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25BZnRlckJ1aWxkQXNzZXRzKG9wdGlvbnM6IElJT1NJbnRlcm5hbEJ1aWxkT3B0aW9ucywgcmVzdWx0OiBJbnRlcm5hbEJ1aWxkUmVzdWx0LCBjYWNoZTogQnVpbGRlckNhY2hlKSB7XHJcbiAgICAvLyAzODAg6Ziy5q2i5p6E5bu66L+H56iL5Lit5L+u5pS55ZCv55So5o+S5bGP77yM6Zeu5Y235qCh6aqM5aSx6LSlXHJcbiAgICBpZiAoIW9wdGlvbnMudXNlU3BsYXNoU2NyZWVuKSB7XHJcbiAgICAgICAgb3B0aW9ucy51c2VTcGxhc2hTY3JlZW4gPSB0cnVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25CZWZvcmVDb21wcmVzc1NldHRpbmdzKG9wdGlvbnM6IElJT1NJbnRlcm5hbEJ1aWxkT3B0aW9ucywgcmVzdWx0OiBJbnRlcm5hbEJ1aWxkUmVzdWx0LCBjYWNoZTogQnVpbGRlckNhY2hlKSB7XHJcbiAgICAvLyDmoKHpqozlrozmj5LlsY/lkI7vvIzljovnvKkgc2V0dGluZ3Mg5YmN77yM5YWz6ZetIGlPUyDlubPlj7Dmj5LlsY9cclxuICAgIHJlc3VsdC5zZXR0aW5ncy5zcGxhc2hTY3JlZW4gJiYgKHJlc3VsdC5zZXR0aW5ncy5zcGxhc2hTY3JlZW4udG90YWxUaW1lID0gMCk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvbkFmdGVyQnVpbGQodGhpczogSUJ1aWxkZXIsIG9wdGlvbnM6IElJT1NJbnRlcm5hbEJ1aWxkT3B0aW9ucywgcmVzdWx0OiBJbnRlcm5hbEJ1aWxkUmVzdWx0KSB7XHJcbiAgICBhd2FpdCBuYXRpdmVDb21tb25Ib29rLm9uQWZ0ZXJCdWlsZC5jYWxsKHRoaXMsIG9wdGlvbnMsIHJlc3VsdCk7XHJcbiAgICAvLyBnZW5lcmF0ZSDkuYvlkI4gbWFrZSDkuYvliY3vvIznlJ/miJDmj5LlsY/lm77niYfvvIzmmoLml7blsY/olL1cclxuIC8vICAgYXdhaXQgYnVpbGRTcGxhc2gob3B0aW9ucywgcmVzdWx0KTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gYnVpbGRTcGxhc2gob3B0aW9uczogSUlPU0ludGVybmFsQnVpbGRPcHRpb25zLCByZXN1bHQ6IEludGVybmFsQnVpbGRSZXN1bHQpIHtcclxuICAgIGNvbnN0IHNwbGFzaFNjcmVlblNldHRpbmdzID0gcmVzdWx0LnNldHRpbmdzLnNwbGFzaFNjcmVlbjtcclxuICAgIGlmIChzcGxhc2hTY3JlZW5TZXR0aW5ncyAmJiBzcGxhc2hTY3JlZW5TZXR0aW5ncy5sb2dvICYmIHNwbGFzaFNjcmVlblNldHRpbmdzLmJhY2tncm91bmQpIHtcclxuICAgICAgICBjb25zdCBkZXN0RGlyID0gam9pbihvcHRpb25zLnBhY2thZ2VzLmlvcy5wcm9qZWN0RGlzdFBhdGgsICduYXRpdmUvZW5naW5lL2lvcycpO1xyXG4gICAgICAgIGVuc3VyZURpclN5bmMoZGVzdERpcik7XHJcbiAgICAgICAgY29uc3QgaW1hZ2VPcHRpb25zID0gW3tcclxuICAgICAgICAgICAgd2lkdGg6IDEyNDIsXHJcbiAgICAgICAgICAgIGhlaWdodDogMjIwOCxcclxuICAgICAgICAgICAgb3V0cHV0UGF0aDogam9pbihkZXN0RGlyLCAnTGF1bmNoU2NyZWVuQmFja2dyb3VuZFBvcnRyYWl0LnBuZycpLFxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgd2lkdGg6IDIyMDgsXHJcbiAgICAgICAgICAgIGhlaWdodDogMTI0MixcclxuICAgICAgICAgICAgb3V0cHV0UGF0aDogam9pbihkZXN0RGlyLCAnTGF1bmNoU2NyZWVuQmFja2dyb3VuZExhbmRzY2FwZS5wbmcnKSxcclxuICAgICAgICB9XTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy8g55Sf5oiQ5qiq56uW5bGP5Zu+XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIGltYWdlT3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgZ2VuZXJhdGVTcGxhc2hQaWN0dXJlKG9wdGlvbiwgc3BsYXNoU2NyZWVuU2V0dGluZ3MsIHJlc3VsdC5zZXR0aW5ncy5zY3JlZW4uZGVzaWduUmVzb2x1dGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8g5byV5pOO5Lya5LyY5YWI6K+75Y+W55uu5qCH5Zu+77yM5omA5Lul6L+Y6KaB5ou36LSd5LiA5byg55uu5qCH5Zu+XHJcbiAgICAgICAgICAgIGNvbnN0IGJhc2VJbWcgPSBvcHRpb25zLnBhY2thZ2VzLmlvcy5vcmllbnRhdGlvbi5wb3J0cmFpdCA/IGpvaW4oZGVzdERpciwgJ0xhdW5jaFNjcmVlbkJhY2tncm91bmRQb3J0cmFpdC5wbmcnKSA6IGpvaW4oZGVzdERpciwgJ0xhdW5jaFNjcmVlbkJhY2tncm91bmRMYW5kc2NhcGUucG5nJyk7XHJcbiAgICAgICAgICAgIGNvcHlGaWxlU3luYyhiYXNlSW1nLCBqb2luKGRlc3REaXIsICdMYXVuY2hTY3JlZW5CYWNrZ3JvdW5kLnBuZycpKTtcclxuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnR2VuZXJhdGUgc3BsYXNoIHRvOicsIGpvaW4oZGVzdERpciwgJ0xhdW5jaFNjcmVlbkJhY2tncm91bmRQb3J0cmFpdC5wbmcnKSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdGYWlsZWQgdG8gZ2VuZXJhdGUgc3BsYXNoOicsIGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlU3BsYXNoUGljdHVyZShvcHRpb246IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXI7IG91dHB1dFBhdGg6IHN0cmluZyB9LCBzcGxhc2hTZXR0aW5nczogSVNwbGFzaFNldHRpbmcsIGRlc2lnblJlc29sdXRpb246IElTZXR0aW5nc0Rlc2lnblJlc29sdXRpb24pIHtcclxuICAgIC8vIOaWsOW7uueUu+W4g1xyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICBjYW52YXMud2lkdGggPSBvcHRpb24ud2lkdGg7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gb3B0aW9uLmhlaWdodDtcclxuICAgIC8vIOWwhuWbvueJh+eUu+WIsOeUu+W4g+S4ilxyXG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpITtcclxuXHJcbiAgICBpZiAoc3BsYXNoU2V0dGluZ3MuYmFja2dyb3VuZD8udHlwZSA9PT0gJ2N1c3RvbScgJiYgc3BsYXNoU2V0dGluZ3MuYmFja2dyb3VuZC5iYXNlNjQpIHtcclxuICAgICAgICBjb25zdCBwb2xpY3kgPSBkZXNpZ25SZXNvbHV0aW9uLnBvbGljeTtcclxuXHJcbiAgICAgICAgLy8g57uY5Yi26Ieq5a6a5LmJ5Zu+54mH6IOM5pmvXHJcbiAgICAgICAgY29uc3QgYmdJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIGJnSW1hZ2Uuc3JjID0gc3BsYXNoU2V0dGluZ3MuYmFja2dyb3VuZC5iYXNlNjQ7XHJcbiAgICAgICAgYXdhaXQgbG9hZEltYWdlKGJnSW1hZ2UpO1xyXG4gICAgICAgIC8vIOiDjOaZr+WbvuWhq+WFhea7oe+8jOiDjOaZr+WbvuagueaNrueUu+W4g+WuvemrmOetieavlOS+i+e8qeaUvuWQju+8jOS7peiDjOaZr+WbvuS4reW/g+Wxleekuu+8jOi2heWHuuWbm+WRqOeahOijgeWJqlxyXG4gICAgICAgIGNvbnN0IHNjYWxlID0gTWF0aC5tYXgoY2FudmFzLndpZHRoIC8gYmdJbWFnZS53aWR0aCwgY2FudmFzLmhlaWdodCAvIGJnSW1hZ2UuaGVpZ2h0KTtcclxuICAgICAgICBsZXQgd2lkdGg7XHJcbiAgICAgICAgbGV0IGhlaWdodDtcclxuICAgICAgICBpZiAocG9saWN5ID09PSBSZXNvbHV0aW9uUG9saWN5LkZJWEVEX0hFSUdIVCkge1xyXG4gICAgICAgICAgICB3aWR0aCA9IGJnSW1hZ2Uud2lkdGggKiBjYW52YXMuaGVpZ2h0IC8gYmdJbWFnZS5oZWlnaHQ7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XHJcbiAgICAgICAgfSBlbHNlIGlmIChwb2xpY3kgPT09IFJlc29sdXRpb25Qb2xpY3kuRklYRURfV0lEVEgpIHtcclxuICAgICAgICAgICAgd2lkdGggPSBjYW52YXMud2lkdGg7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IGJnSW1hZ2UuaGVpZ2h0ICogY2FudmFzLndpZHRoIC8gYmdJbWFnZS53aWR0aDtcclxuICAgICAgICB9IGVsc2UgaWYgKHBvbGljeSA9PT0gUmVzb2x1dGlvblBvbGljeS5TSE9XX0FMTCkge1xyXG4gICAgICAgICAgICBpZiAoKGJnSW1hZ2Uud2lkdGggLyBiZ0ltYWdlLmhlaWdodCkgPiAoY2FudmFzLndpZHRoIC8gY2FudmFzLmhlaWdodCkpIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gY2FudmFzLndpZHRoO1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gYmdJbWFnZS5oZWlnaHQgKiBjYW52YXMud2lkdGggLyBiZ0ltYWdlLndpZHRoO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggPSBiZ0ltYWdlLndpZHRoICogY2FudmFzLmhlaWdodCAvIGJnSW1hZ2UuaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAocG9saWN5ID09PSBSZXNvbHV0aW9uUG9saWN5Lk5PX0JPUkRFUikge1xyXG4gICAgICAgICAgICBpZiAoKGJnSW1hZ2Uud2lkdGggLyBiZ0ltYWdlLmhlaWdodCkgPiAoY2FudmFzLndpZHRoIC8gY2FudmFzLmhlaWdodCkpIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gYmdJbWFnZS53aWR0aCAqIGNhbnZhcy5oZWlnaHQgLyBiZ0ltYWdlLmhlaWdodDtcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IGNhbnZhcy53aWR0aDtcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9IGJnSW1hZ2UuaGVpZ2h0ICogY2FudmFzLndpZHRoIC8gYmdJbWFnZS53aWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHdpZHRoID0gY2FudmFzLndpZHRoO1xyXG4gICAgICAgICAgICBoZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0WCA9IChjYW52YXMud2lkdGggLSB3aWR0aCkgLyAyO1xyXG4gICAgICAgIGNvbnN0IG9mZnNldFkgPSAoY2FudmFzLmhlaWdodCAtIGhlaWdodCkgLyAyO1xyXG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY29udGV4dC5yZWN0KG9mZnNldFgsIG9mZnNldFksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgY29udGV4dC5jbGlwKCk7XHJcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoYmdJbWFnZSwgb2Zmc2V0WCwgb2Zmc2V0WSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICB9IGVsc2UgaWYgKHNwbGFzaFNldHRpbmdzLmJhY2tncm91bmQ/LnR5cGUgPT09ICdjb2xvcicgJiYgc3BsYXNoU2V0dGluZ3MuYmFja2dyb3VuZC5jb2xvcikge1xyXG4gICAgICAgIC8vIOe7mOWItuiHquWumuS5ieminOiJsuiDjOaZr1xyXG4gICAgICAgIGNvbnN0IGNvbG9yID0gc3BsYXNoU2V0dGluZ3MuYmFja2dyb3VuZC5jb2xvcjtcclxuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGByZ2JhKCR7Y29sb3IueCAqIDI1NX0sICR7Y29sb3IueSAqIDI1NX0sICR7Y29sb3IueiAqIDI1NX0sICR7Y29sb3IudyAqIDI1NX0pYDtcclxuICAgICAgICBjb250ZXh0LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIOe7mOWItum7mOiupCAjMDQwOTBBIOiDjOaZr1xyXG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoNCwgOSwgMTAsIDEpJztcclxuICAgICAgICBjb250ZXh0LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKChzcGxhc2hTZXR0aW5ncy5sb2dvPy50eXBlID09PSAnY3VzdG9tJyB8fCBzcGxhc2hTZXR0aW5ncy5sb2dvPy50eXBlID09PSAnZGVmYXVsdCcpICYmIHNwbGFzaFNldHRpbmdzLmxvZ28uYmFzZTY0KSB7XHJcbiAgICAgICAgLy8g57uY5Yi26Ieq5a6a5LmJIGxvZ28g5Zu+54mHXHJcbiAgICAgICAgY29uc3QgbG9nb0ltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgbG9nb0ltYWdlLnNyYyA9IHNwbGFzaFNldHRpbmdzLmxvZ28uYmFzZTY0O1xyXG4gICAgICAgIGF3YWl0IGxvYWRJbWFnZShsb2dvSW1hZ2UpO1xyXG4gICAgICAgIGNvbnN0IGxvZ29Bc3BlY3RSYXRpbyA9IGxvZ29JbWFnZS5oZWlnaHQgLyBsb2dvSW1hZ2Uud2lkdGg7XHJcbiAgICAgICAgY29uc3QgbG9nb0hlaWdodFBlcmNlbnRhZ2UgPSAwLjE4NTsgLy8g5aaC5p6c6K6+572u55qE5pivIDEwMCXvvIxsb2dv55qE6auY5bqm5Zu65a6a5Y2g6aKE6KeI5Yy65Z+f55qEIDE4LjUlXHJcbiAgICAgICAgY29uc3QgbG9nb0FyZWFIZWlnaHRQZXJjZW50YWdlID0gNSAvIDY7IC8vIGxvZ28g5Yy65Z+f6auY5bqm5Y2g6K6+5aSH6auY5bqm55qEIDUgLyA2XHJcbiAgICAgICAgY29uc3QgbG9nb0hlaWdodCA9IGNhbnZhcy5oZWlnaHQgKiBsb2dvSGVpZ2h0UGVyY2VudGFnZSAqIHNwbGFzaFNldHRpbmdzLmRpc3BsYXlSYXRpbztcclxuICAgICAgICBjb25zdCBsb2dvV2lkdGggPSBsb2dvSGVpZ2h0IC8gbG9nb0FzcGVjdFJhdGlvO1xyXG4gICAgICAgIGNvbnN0IGxvZ29YID0gKGNhbnZhcy53aWR0aCAtIGxvZ29XaWR0aCkgLyAyO1xyXG4gICAgICAgIGxldCBsb2dvWSA9IChjYW52YXMuaGVpZ2h0ICogbG9nb0FyZWFIZWlnaHRQZXJjZW50YWdlIC0gbG9nb0hlaWdodCkgLyAyO1xyXG4gICAgICAgIGlmIChsb2dvSGVpZ2h0ID4gY2FudmFzLmhlaWdodCAqIGxvZ29BcmVhSGVpZ2h0UGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICBsb2dvWSA9IChjYW52YXMuaGVpZ2h0IC0gbG9nb0hlaWdodCkgLyAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShsb2dvSW1hZ2UsIGxvZ29YLCBsb2dvWSwgbG9nb1dpZHRoLCBsb2dvSGVpZ2h0KTtcclxuXHJcbiAgICAgICAgLy8g57uY5Yi25rC05Y2wXHJcbiAgICAgICAgaWYgKHNwbGFzaFNldHRpbmdzLmxvZ28udHlwZSA9PT0gJ2RlZmF1bHQnKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQuZm9udCA9IGA0MDAgMzZweCBBcmlhbGA7XHJcbiAgICAgICAgICAgIGNvbnRleHQudGV4dEJhc2VsaW5lID0gJ3RvcCc7XHJcbiAgICAgICAgICAgIGNvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoMjUwLCAyNTAsIDI1MCwgMC40KSc7XHJcbiAgICAgICAgICAgIGNvbnRleHQubGluZVdpZHRoID0gMjtcclxuICAgICAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICdyZ2JhKDUsIDUsIDUsIDAuMyknO1xyXG4gICAgICAgICAgICBjb250ZXh0LnN0cm9rZVRleHQoJ0NyZWF0ZWQgd2l0aCBDb2NvcycsIGNhbnZhcy53aWR0aCAvIDIsIGxvZ29ZICsgbG9nb0hlaWdodCArIDQ4KTtcclxuICAgICAgICAgICAgY29udGV4dC5maWxsVGV4dCgnQ3JlYXRlZCB3aXRoIENvY29zJywgY2FudmFzLndpZHRoIC8gMiwgbG9nb1kgKyBsb2dvSGVpZ2h0ICsgNDgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyDlsIbnlLvluIPovazmjaLkuLogYmFzZTY0XHJcbiAgICBjb25zdCBtZXJnZWRJbWFnZSA9IGNhbnZhcy50b0RhdGFVUkwoJ2ltYWdlL3BuZycpO1xyXG4gICAgLy8g5bCGIGJhc2U2NCDovazkuLrkuozov5vliLZcclxuICAgIGNvbnN0IGJpbmFyeURhdGEgPSBhdG9iKG1lcmdlZEltYWdlLnNwbGl0KCcsJylbMV0pO1xyXG4gICAgLy8g5YaZ5YWl5Yiw5pys5Zyw5paH5Lu2XHJcbiAgICB3cml0ZUZpbGVTeW5jKG9wdGlvbi5vdXRwdXRQYXRoLCBiaW5hcnlEYXRhLCAnYmluYXJ5Jyk7XHJcbiAgICBjb25zb2xlLmxvZygnR2VuZXJhdGUgc3BsYXNoIHRvOicsIG9wdGlvbi5vdXRwdXRQYXRoKTtcclxuXHJcbiAgICBmdW5jdGlvbiBsb2FkSW1hZ2UoaW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8SFRNTEltYWdlRWxlbWVudD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaW1hZ2UuY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoaW1hZ2UpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGltYWdlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuIl19