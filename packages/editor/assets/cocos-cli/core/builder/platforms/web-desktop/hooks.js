"use strict";
'use-strict';
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
exports.throwError = void 0;
exports.onAfterInit = onAfterInit;
exports.onAfterBundleInit = onAfterBundleInit;
exports.onBeforeCompressSettings = onBeforeCompressSettings;
exports.onBeforeCopyBuildTemplate = onBeforeCopyBuildTemplate;
exports.onAfterBuild = onAfterBuild;
exports.run = run;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const ejs_1 = __importDefault(require("ejs"));
const utils_1 = require("../../worker/builder/utils");
const commonUtils = __importStar(require("../web-common/utils"));
exports.throwError = true;
function onAfterInit(options, result, cache) {
    options.buildEngineParam.assetURLFormat = 'runtime-resolved';
    if (options.server && !options.server.endsWith('/')) {
        options.server += '/';
    }
}
function onAfterBundleInit(options) {
    options.buildScriptParam.system = { preset: 'web' };
    const useWebGPU = options.packages['web-desktop'].useWebGPU;
    options.buildScriptParam.flags['WEBGPU'] = useWebGPU;
    if (useWebGPU) {
        if (!options.includeModules.includes('gfx-webgpu')) {
            options.includeModules.push('gfx-webgpu');
        }
        options.assetSerializeOptions['cc.EffectAsset'].glsl4 = true;
    }
    else if (options.includeModules.includes('gfx-webgpu')) {
        const index = options.includeModules.indexOf('gfx-webgpu');
        options.includeModules.splice(index, 1);
    }
}
/**
 * 剔除不需要参与构建的资源
 * @param options
 * @param settings
 */
async function onBeforeCompressSettings(options, result, cache) {
    if (!result.paths.dir) {
        return;
    }
    const settings = result.settings;
    settings.screen.exactFitScreen = false;
}
async function onBeforeCopyBuildTemplate(options, result) {
    const staticDir = (0, path_1.join)(options.engineInfo.typescript.path, 'templates/web-desktop');
    const packageOptions = options.packages['web-desktop'];
    // 拷贝内部提供的模板文件
    const cssFilePath = (0, path_1.join)(result.paths.dir, 'style.css');
    options.md5CacheOptions.includes.push('style.css');
    if (!this.buildTemplate.findFile('style.css')) {
        // 生成 style.css
        (0, fs_extra_1.copyFileSync)((0, path_1.join)(staticDir, 'style.css'), cssFilePath);
    }
    if (!this.buildTemplate.findFile('favicon.ico')) {
        (0, fs_extra_1.copyFileSync)((0, path_1.join)(staticDir, 'favicon.ico'), (0, path_1.join)(result.paths.dir, 'favicon.ico'));
    }
    // index.js 模板生成
    const indexJsTemplate = this.buildTemplate.initUrl('index.js.ejs', 'indexJs') || (0, path_1.join)(staticDir, 'index.js.ejs');
    const indexJsContent = await ejs_1.default.renderFile(indexJsTemplate, {
        applicationJS: './' + (0, utils_1.relativeUrl)(result.paths.dir, result.paths.applicationJS),
    });
    // TODO 需要优化，不应该直接读到内存里
    const indexJsSourceTransformedCode = await (0, utils_1.transformCode)(indexJsContent, {
        importMapFormat: 'systemjs',
    });
    if (!indexJsSourceTransformedCode) {
        throw new Error('Cannot generate index.js');
    }
    const indexJsDest = (0, path_1.join)(result.paths.dir, `index.js`);
    result.paths.indexJs = indexJsDest;
    options.md5CacheOptions.includes.push(`index.js`);
    (0, fs_extra_1.outputFileSync)(indexJsDest, indexJsSourceTransformedCode, 'utf8');
    // index.html 模板生成
    const indexEjsTemplate = this.buildTemplate.initUrl('index.ejs') || (0, path_1.join)(staticDir, 'index.ejs');
    const data = {
        polyfillsBundleFile: (result.paths.polyfillsJs && (0, utils_1.relativeUrl)(result.paths.dir, result.paths.polyfillsJs)) || false,
        systemJsBundleFile: (0, utils_1.relativeUrl)(result.paths.dir, result.paths.systemJs),
        projectName: options.name,
        engineName: options.buildEngineParam.engineName,
        previewWidth: packageOptions.resolution.designWidth,
        previewHeight: packageOptions.resolution.designHeight,
        cocosTemplate: (0, path_1.join)(staticDir, 'index-plugin.ejs'),
        importMapFile: (0, utils_1.relativeUrl)(result.paths.dir, result.paths.importMap),
        indexJsName: './index.js',
        cssUrl: './style.css',
    };
    const content = await ejs_1.default.renderFile(indexEjsTemplate, data);
    result.paths.indexHTML = (0, path_1.join)(result.paths.dir, 'index.html');
    (0, fs_extra_1.outputFileSync)(result.paths.indexHTML, content, 'utf8');
    // 入口文件排除 md5 写入
    options.md5CacheOptions.replaceOnly.push('index.html');
}
async function onAfterBuild(options, result) {
    // 放在最后处理 url ，否则会破坏 md5 的处理
    result.settings.plugins.jsList.forEach((url, i) => {
        result.settings.plugins.jsList[i] = url.split('/').map(encodeURIComponent).join('/');
    });
    (0, fs_extra_1.outputFileSync)(result.paths.settings, JSON.stringify(result.settings, null, options.debug ? 4 : 0));
    const previewUrl = await commonUtils.getPreviewUrl(result.paths.dir, options.platform);
    this.buildExitRes.custom = {
        previewUrl,
    };
}
async function run(root) {
    const previewUrl = await commonUtils.run('web-desktop', root);
    this.buildExitRes.custom = {
        previewUrl,
    };
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3BsYXRmb3Jtcy93ZWItZGVza3RvcC9ob29rcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFZYixrQ0FLQztBQUVELDhDQWFDO0FBTUQsNERBTUM7QUFFRCw4REFvREM7QUFDRCxvQ0FVQztBQUVELGtCQUtDO0FBbEhELHVDQUFvRTtBQUNwRSwrQkFBZ0Q7QUFDaEQsOENBQXNCO0FBR3RCLHNEQUF3RTtBQUN4RSxpRUFBbUQ7QUFFdEMsUUFBQSxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBRS9CLFNBQWdCLFdBQVcsQ0FBQyxPQUE2QyxFQUFFLE1BQTJCLEVBQUUsS0FBbUI7SUFDdkgsT0FBTyxDQUFDLGdCQUFnQixDQUFDLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQztJQUM3RCxJQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ2xELE9BQU8sQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDO0lBQzFCLENBQUM7QUFDTCxDQUFDO0FBRUQsU0FBZ0IsaUJBQWlCLENBQUMsT0FBNkM7SUFDM0UsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUNwRCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUM1RCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQztJQUNyRCxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ1osSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxD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O0lBQ3BHLE1BQU0sVUFBVSxHQUFHLE1BQU0sV0FBVyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdkYsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUc7UUFDdkIsVUFBVTtLQUNiLENBQUM7QUFDTixDQUFDO0FBRU0sS0FBSyxVQUFVLEdBQUcsQ0FBd0IsSUFBWTtJQUN6RCxNQUFNLFVBQVUsR0FBRyxNQUFNLFdBQVcsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlELElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHO1FBQ3ZCLFVBQVU7S0FDYixDQUFDO0FBQ04sQ0FBQztBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlLXN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBjb3B5RmlsZVN5bmMsIGV4aXN0c1N5bmMsIG91dHB1dEZpbGVTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBiYXNlbmFtZSwgam9pbiwgcmVsYXRpdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IEVqcyBmcm9tICdlanMnO1xyXG5pbXBvcnQgeyBJbnRlcm5hbEJ1aWxkUmVzdWx0LCBCdWlsZGVyQ2FjaGUsIElCdWlsZGVyLCBJQnVpbGRUYXNrT3B0aW9uLCBJQnVpbGRTdGFnZVRhc2ssIElJbnRlckJ1aWxkVGFza09wdGlvbiB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBJQnVpbGRSZXN1bHQgfSBmcm9tICcuL3R5cGUnO1xyXG5pbXBvcnQgeyByZWxhdGl2ZVVybCwgdHJhbnNmb3JtQ29kZSB9IGZyb20gJy4uLy4uL3dvcmtlci9idWlsZGVyL3V0aWxzJztcclxuaW1wb3J0ICogYXMgY29tbW9uVXRpbHMgZnJvbSAnLi4vd2ViLWNvbW1vbi91dGlscyc7XHJcblxyXG5leHBvcnQgY29uc3QgdGhyb3dFcnJvciA9IHRydWU7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb25BZnRlckluaXQob3B0aW9uczogSUludGVyQnVpbGRUYXNrT3B0aW9uPCd3ZWItZGVza3RvcCc+LCByZXN1bHQ6IEludGVybmFsQnVpbGRSZXN1bHQsIGNhY2hlOiBCdWlsZGVyQ2FjaGUpIHtcclxuICAgIG9wdGlvbnMuYnVpbGRFbmdpbmVQYXJhbS5hc3NldFVSTEZvcm1hdCA9ICdydW50aW1lLXJlc29sdmVkJztcclxuICAgIGlmIChvcHRpb25zLnNlcnZlciAmJiAhb3B0aW9ucy5zZXJ2ZXIuZW5kc1dpdGgoJy8nKSkge1xyXG4gICAgICAgIG9wdGlvbnMuc2VydmVyICs9ICcvJztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG9uQWZ0ZXJCdW5kbGVJbml0KG9wdGlvbnM6IElJbnRlckJ1aWxkVGFza09wdGlvbjwnd2ViLWRlc2t0b3AnPikge1xyXG4gICAgb3B0aW9ucy5idWlsZFNjcmlwdFBhcmFtLnN5c3RlbSA9IHsgcHJlc2V0OiAnd2ViJyB9O1xyXG4gICAgY29uc3QgdXNlV2ViR1BVID0gb3B0aW9ucy5wYWNrYWdlc1snd2ViLWRlc2t0b3AnXS51c2VXZWJHUFU7XHJcbiAgICBvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0uZmxhZ3NbJ1dFQkdQVSddID0gdXNlV2ViR1BVO1xyXG4gICAgaWYgKHVzZVdlYkdQVSkge1xyXG4gICAgICAgIGlmICghb3B0aW9ucy5pbmNsdWRlTW9kdWxlcy5pbmNsdWRlcygnZ2Z4LXdlYmdwdScpKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMuaW5jbHVkZU1vZHVsZXMucHVzaCgnZ2Z4LXdlYmdwdScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvcHRpb25zLmFzc2V0U2VyaWFsaXplT3B0aW9uc1snY2MuRWZmZWN0QXNzZXQnXSEuZ2xzbDQgPSB0cnVlO1xyXG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmluY2x1ZGVNb2R1bGVzLmluY2x1ZGVzKCdnZngtd2ViZ3B1JykpIHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IG9wdGlvbnMuaW5jbHVkZU1vZHVsZXMuaW5kZXhPZignZ2Z4LXdlYmdwdScpO1xyXG4gICAgICAgIG9wdGlvbnMuaW5jbHVkZU1vZHVsZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICog5YmU6Zmk5LiN6ZyA6KaB5Y+C5LiO5p6E5bu655qE6LWE5rqQXHJcbiAqIEBwYXJhbSBvcHRpb25zXHJcbiAqIEBwYXJhbSBzZXR0aW5nc1xyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uQmVmb3JlQ29tcHJlc3NTZXR0aW5ncyhvcHRpb25zOiBJSW50ZXJCdWlsZFRhc2tPcHRpb248J3dlYi1kZXNrdG9wJz4sIHJlc3VsdDogSW50ZXJuYWxCdWlsZFJlc3VsdCwgY2FjaGU6IEJ1aWxkZXJDYWNoZSkge1xyXG4gICAgaWYgKCFyZXN1bHQucGF0aHMuZGlyKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3Qgc2V0dGluZ3MgPSByZXN1bHQuc2V0dGluZ3M7XHJcbiAgICBzZXR0aW5ncy5zY3JlZW4uZXhhY3RGaXRTY3JlZW4gPSBmYWxzZTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uQmVmb3JlQ29weUJ1aWxkVGVtcGxhdGUodGhpczogSUJ1aWxkZXIsIG9wdGlvbnM6IElJbnRlckJ1aWxkVGFza09wdGlvbjwnd2ViLWRlc2t0b3AnPiwgcmVzdWx0OiBJQnVpbGRSZXN1bHQpIHtcclxuICAgIGNvbnN0IHN0YXRpY0RpciA9IGpvaW4ob3B0aW9ucy5lbmdpbmVJbmZvLnR5cGVzY3JpcHQucGF0aCwgJ3RlbXBsYXRlcy93ZWItZGVza3RvcCcpO1xyXG4gICAgY29uc3QgcGFja2FnZU9wdGlvbnMgPSBvcHRpb25zLnBhY2thZ2VzWyd3ZWItZGVza3RvcCddO1xyXG5cclxuICAgIC8vIOaLt+i0neWGhemDqOaPkOS+m+eahOaooeadv+aWh+S7tlxyXG4gICAgY29uc3QgY3NzRmlsZVBhdGggPSBqb2luKHJlc3VsdC5wYXRocy5kaXIsICdzdHlsZS5jc3MnKTtcclxuICAgIG9wdGlvbnMubWQ1Q2FjaGVPcHRpb25zLmluY2x1ZGVzLnB1c2goJ3N0eWxlLmNzcycpO1xyXG4gICAgaWYgKCF0aGlzLmJ1aWxkVGVtcGxhdGUuZmluZEZpbGUoJ3N0eWxlLmNzcycpKSB7XHJcbiAgICAgICAgLy8g55Sf5oiQIHN0eWxlLmNzc1xyXG4gICAgICAgIGNvcHlGaWxlU3luYyhqb2luKHN0YXRpY0RpciwgJ3N0eWxlLmNzcycpLCBjc3NGaWxlUGF0aCk7XHJcbiAgICB9XHJcbiAgICBpZiAoIXRoaXMuYnVpbGRUZW1wbGF0ZS5maW5kRmlsZSgnZmF2aWNvbi5pY28nKSkge1xyXG4gICAgICAgIGNvcHlGaWxlU3luYyhqb2luKHN0YXRpY0RpciwgJ2Zhdmljb24uaWNvJyksIGpvaW4ocmVzdWx0LnBhdGhzLmRpciwgJ2Zhdmljb24uaWNvJykpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGluZGV4LmpzIOaooeadv+eUn+aIkFxyXG4gICAgY29uc3QgaW5kZXhKc1RlbXBsYXRlID0gdGhpcy5idWlsZFRlbXBsYXRlLmluaXRVcmwoJ2luZGV4LmpzLmVqcycsICdpbmRleEpzJykgfHwgam9pbihzdGF0aWNEaXIsICdpbmRleC5qcy5lanMnKTtcclxuICAgIGNvbnN0IGluZGV4SnNDb250ZW50OiBzdHJpbmcgPSBhd2FpdCBFanMucmVuZGVyRmlsZShpbmRleEpzVGVtcGxhdGUsIHtcclxuICAgICAgICBhcHBsaWNhdGlvbkpTOiAnLi8nICsgcmVsYXRpdmVVcmwocmVzdWx0LnBhdGhzLmRpciwgcmVzdWx0LnBhdGhzLmFwcGxpY2F0aW9uSlMpLFxyXG4gICAgfSk7XHJcbiAgICAvLyBUT0RPIOmcgOimgeS8mOWMlu+8jOS4jeW6lOivpeebtOaOpeivu+WIsOWGheWtmOmHjFxyXG4gICAgY29uc3QgaW5kZXhKc1NvdXJjZVRyYW5zZm9ybWVkQ29kZSA9IGF3YWl0IHRyYW5zZm9ybUNvZGUoaW5kZXhKc0NvbnRlbnQsIHtcclxuICAgICAgICBpbXBvcnRNYXBGb3JtYXQ6ICdzeXN0ZW1qcycsXHJcbiAgICB9KTtcclxuICAgIGlmICghaW5kZXhKc1NvdXJjZVRyYW5zZm9ybWVkQ29kZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGdlbmVyYXRlIGluZGV4LmpzJyk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBpbmRleEpzRGVzdCA9IGpvaW4ocmVzdWx0LnBhdGhzLmRpciwgYGluZGV4LmpzYCk7XHJcbiAgICByZXN1bHQucGF0aHMuaW5kZXhKcyA9IGluZGV4SnNEZXN0O1xyXG4gICAgb3B0aW9ucy5tZDVDYWNoZU9wdGlvbnMuaW5jbHVkZXMucHVzaChgaW5kZXguanNgKTtcclxuXHJcbiAgICBvdXRwdXRGaWxlU3luYyhpbmRleEpzRGVzdCwgaW5kZXhKc1NvdXJjZVRyYW5zZm9ybWVkQ29kZSwgJ3V0ZjgnKTtcclxuXHJcbiAgICAvLyBpbmRleC5odG1sIOaooeadv+eUn+aIkFxyXG4gICAgY29uc3QgaW5kZXhFanNUZW1wbGF0ZSA9IHRoaXMuYnVpbGRUZW1wbGF0ZS5pbml0VXJsKCdpbmRleC5lanMnKSB8fCBqb2luKHN0YXRpY0RpciwgJ2luZGV4LmVqcycpO1xyXG4gICAgY29uc3QgZGF0YSA9IHtcclxuICAgICAgICBwb2x5ZmlsbHNCdW5kbGVGaWxlOiAocmVzdWx0LnBhdGhzLnBvbHlmaWxsc0pzICYmIHJlbGF0aXZlVXJsKHJlc3VsdC5wYXRocy5kaXIsIHJlc3VsdC5wYXRocy5wb2x5ZmlsbHNKcykpIHx8IGZhbHNlLFxyXG4gICAgICAgIHN5c3RlbUpzQnVuZGxlRmlsZTogcmVsYXRpdmVVcmwocmVzdWx0LnBhdGhzLmRpciwgcmVzdWx0LnBhdGhzLnN5c3RlbUpzISksXHJcbiAgICAgICAgcHJvamVjdE5hbWU6IG9wdGlvbnMubmFtZSxcclxuICAgICAgICBlbmdpbmVOYW1lOiBvcHRpb25zLmJ1aWxkRW5naW5lUGFyYW0uZW5naW5lTmFtZSxcclxuICAgICAgICBwcmV2aWV3V2lkdGg6IHBhY2thZ2VPcHRpb25zLnJlc29sdXRpb24uZGVzaWduV2lkdGgsXHJcbiAgICAgICAgcHJldmlld0hlaWdodDogcGFja2FnZU9wdGlvbnMucmVzb2x1dGlvbi5kZXNpZ25IZWlnaHQsXHJcbiAgICAgICAgY29jb3NUZW1wbGF0ZTogam9pbihzdGF0aWNEaXIsICdpbmRleC1wbHVnaW4uZWpzJyksXHJcbiAgICAgICAgaW1wb3J0TWFwRmlsZTogcmVsYXRpdmVVcmwocmVzdWx0LnBhdGhzLmRpciwgcmVzdWx0LnBhdGhzLmltcG9ydE1hcCksXHJcbiAgICAgICAgaW5kZXhKc05hbWU6ICcuL2luZGV4LmpzJyxcclxuICAgICAgICBjc3NVcmw6ICcuL3N0eWxlLmNzcycsXHJcbiAgICB9O1xyXG4gICAgY29uc3QgY29udGVudCA9IGF3YWl0IEVqcy5yZW5kZXJGaWxlKGluZGV4RWpzVGVtcGxhdGUsIGRhdGEpO1xyXG4gICAgcmVzdWx0LnBhdGhzLmluZGV4SFRNTCA9IGpvaW4ocmVzdWx0LnBhdGhzLmRpciwgJ2luZGV4Lmh0bWwnKTtcclxuICAgIG91dHB1dEZpbGVTeW5jKHJlc3VsdC5wYXRocy5pbmRleEhUTUwsIGNvbnRlbnQsICd1dGY4Jyk7XHJcbiAgICAvLyDlhaXlj6Pmlofku7bmjpLpmaQgbWQ1IOWGmeWFpVxyXG4gICAgb3B0aW9ucy5tZDVDYWNoZU9wdGlvbnMucmVwbGFjZU9ubHkucHVzaCgnaW5kZXguaHRtbCcpO1xyXG59XHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvbkFmdGVyQnVpbGQodGhpczogSUJ1aWxkZXIsIG9wdGlvbnM6IElJbnRlckJ1aWxkVGFza09wdGlvbjwnd2ViLWRlc2t0b3AnPiwgcmVzdWx0OiBJbnRlcm5hbEJ1aWxkUmVzdWx0KSB7XHJcbiAgICAvLyDmlL7lnKjmnIDlkI7lpITnkIYgdXJsIO+8jOWQpuWImeS8muegtOWdjyBtZDUg55qE5aSE55CGXHJcbiAgICByZXN1bHQuc2V0dGluZ3MucGx1Z2lucy5qc0xpc3QuZm9yRWFjaCgodXJsOiBzdHJpbmcsIGk6IG51bWJlcikgPT4ge1xyXG4gICAgICAgIHJlc3VsdC5zZXR0aW5ncy5wbHVnaW5zLmpzTGlzdFtpXSA9IHVybC5zcGxpdCgnLycpLm1hcChlbmNvZGVVUklDb21wb25lbnQpLmpvaW4oJy8nKTtcclxuICAgIH0pO1xyXG4gICAgb3V0cHV0RmlsZVN5bmMocmVzdWx0LnBhdGhzLnNldHRpbmdzLCBKU09OLnN0cmluZ2lmeShyZXN1bHQuc2V0dGluZ3MsIG51bGwsIG9wdGlvbnMuZGVidWcgPyA0IDogMCkpO1xyXG4gICAgY29uc3QgcHJldmlld1VybCA9IGF3YWl0IGNvbW1vblV0aWxzLmdldFByZXZpZXdVcmwocmVzdWx0LnBhdGhzLmRpciwgb3B0aW9ucy5wbGF0Zm9ybSk7XHJcbiAgICB0aGlzLmJ1aWxkRXhpdFJlcy5jdXN0b20gPSB7XHJcbiAgICAgICAgcHJldmlld1VybCxcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW4odGhpczogSUJ1aWxkU3RhZ2VUYXNrLCByb290OiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IHByZXZpZXdVcmwgPSBhd2FpdCBjb21tb25VdGlscy5ydW4oJ3dlYi1kZXNrdG9wJywgcm9vdCk7XHJcbiAgICB0aGlzLmJ1aWxkRXhpdFJlcy5jdXN0b20gPSB7XHJcbiAgICAgICAgcHJldmlld1VybCxcclxuICAgIH07XHJcbn07XHJcbiJdfQ==