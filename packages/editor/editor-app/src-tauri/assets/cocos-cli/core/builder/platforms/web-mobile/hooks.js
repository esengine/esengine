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
const ejs_1 = __importDefault(require("ejs"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const utils_1 = require("../../worker/builder/utils");
const commonUtils = __importStar(require("../web-common/utils"));
exports.throwError = true;
async function onAfterInit(options, result, cache) {
    // 添加统计信息
    options.buildEngineParam.split = false;
    options.buildEngineParam.assetURLFormat = 'runtime-resolved';
    if (options.server && !options.server.endsWith('/')) {
        options.server += '/';
    }
}
function onAfterBundleInit(options) {
    options.buildScriptParam.system = { preset: 'web' };
    const useWebGPU = options.packages['web-mobile'].useWebGPU;
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
    const packageOptions = options.packages['web-mobile'];
    result.settings.screen.orientation = packageOptions.orientation;
}
async function onBeforeCopyBuildTemplate(options, result) {
    const staticDir = (0, path_1.join)(options.engineInfo.typescript.builtin, 'templates/web-mobile');
    const packageOptions = options.packages['web-mobile'];
    // 拷贝内部提供的模板文件
    const cssFilePath = (0, path_1.join)(result.paths.dir, 'style.css');
    options.md5CacheOptions.includes.push('style.css');
    if (!this.buildTemplate.findFile('style.css')) {
        // 生成 style.css
        (0, fs_extra_1.copyFileSync)((0, path_1.join)(staticDir, 'style.css'), cssFilePath);
    }
    let webDebuggerSrc = '';
    if (packageOptions.embedWebDebugger) {
        const webDebuggerPath = (0, path_1.join)(result.paths.dir, 'vconsole.min.js');
        if (!this.buildTemplate.findFile('vconsole.min.js')) {
            // 生成 vconsole
            (0, fs_extra_1.copyFileSync)((0, path_1.join)(staticDir, 'vconsole.min.js'), webDebuggerPath);
            options.md5CacheOptions.excludes.push('vconsole.min.js');
        }
        webDebuggerSrc = './vconsole.min.js';
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
    // 处理平台模板
    const data = {
        polyfillsBundleFile: result.paths.polyfillsJs && (0, utils_1.relativeUrl)(result.paths.dir, result.paths.polyfillsJs) || false,
        systemJsBundleFile: (0, utils_1.relativeUrl)(result.paths.dir, result.paths.systemJs),
        projectName: options.name,
        engineName: options.buildEngineParam.engineName,
        webDebuggerSrc: webDebuggerSrc,
        cocosTemplate: (0, path_1.join)(staticDir, 'index-plugin.ejs'),
        importMapFile: (0, utils_1.relativeUrl)(result.paths.dir, result.paths.importMap),
        indexJsName: (0, path_1.basename)(indexJsDest),
        cssUrl: (0, path_1.basename)(cssFilePath),
    };
    const content = await ejs_1.default.renderFile(indexEjsTemplate, data);
    result.paths.indexHTML = (0, path_1.join)(result.paths.dir, 'index.html');
    (0, fs_extra_1.outputFileSync)(result.paths.indexHTML, content, 'utf8');
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
    const previewUrl = await commonUtils.run('web-mobile', root);
    this.buildExitRes.custom = {
        previewUrl,
    };
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3BsYXRmb3Jtcy93ZWItbW9iaWxlL2hvb2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBV2Isa0NBUUM7QUFFRCw4Q0FhQztBQU9ELDREQU1DO0FBRUQsOERBMkRDO0FBRUQsb0NBVUM7QUFFRCxrQkFLQztBQTdIRCw4Q0FBc0I7QUFDdEIsdUNBQXdEO0FBQ3hELCtCQUFzQztBQUV0QyxzREFBd0U7QUFFeEUsaUVBQW1EO0FBQ3RDLFFBQUEsVUFBVSxHQUFHLElBQUksQ0FBQztBQUV4QixLQUFLLFVBQVUsV0FBVyxDQUFDLE9BQTRDLEVBQUUsTUFBMkIsRUFBRSxLQUFtQjtJQUU1SCxTQUFTO0lBQ1QsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQztJQUM3RCxJQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ2xELE9BQU8sQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDO0lBQzFCLENBQUM7QUFDTCxDQUFDO0FBRUQsU0FBZ0IsaUJBQWlCLENBQUMsT0FBNEM7SUFDMUUsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUNwRCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUMzRCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQztJQUNyRCxJ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R0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekYsQ0FBQyxDQUFDLENBQUM7SUFDSCxJQUFBLHlCQUFjLEVBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEcsTUFBTSxVQUFVLEdBQUcsTUFBTSxXQUFXLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN2RixJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRztRQUN2QixVQUFVO0tBQ2IsQ0FBQztBQUNOLENBQUM7QUFFTSxLQUFLLFVBQVUsR0FBRyxDQUF3QixJQUFZO0lBQ3pELE1BQU0sVUFBVSxHQUFHLE1BQU0sV0FBVyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUc7UUFDdkIsVUFBVTtLQUNiLENBQUM7QUFDTixDQUFDO0FBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCBFanMgZnJvbSAnZWpzJztcclxuaW1wb3J0IHsgY29weUZpbGVTeW5jLCBvdXRwdXRGaWxlU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHsgYmFzZW5hbWUsIGpvaW4gfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgSW50ZXJuYWxCdWlsZFJlc3VsdCwgQnVpbGRlckNhY2hlLCBJQnVpbGRlciwgSUludGVyQnVpbGRUYXNrT3B0aW9uLCBJQnVpbGRTdGFnZSwgSUJ1aWxkU3RhZ2VUYXNrIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IHJlbGF0aXZlVXJsLCB0cmFuc2Zvcm1Db2RlIH0gZnJvbSAnLi4vLi4vd29ya2VyL2J1aWxkZXIvdXRpbHMnO1xyXG5pbXBvcnQgeyBJQnVpbGRSZXN1bHQgfSBmcm9tICcuL3R5cGUnO1xyXG5pbXBvcnQgKiBhcyBjb21tb25VdGlscyBmcm9tICcuLi93ZWItY29tbW9uL3V0aWxzJztcclxuZXhwb3J0IGNvbnN0IHRocm93RXJyb3IgPSB0cnVlO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uQWZ0ZXJJbml0KG9wdGlvbnM6IElJbnRlckJ1aWxkVGFza09wdGlvbjwnd2ViLW1vYmlsZSc+LCByZXN1bHQ6IEludGVybmFsQnVpbGRSZXN1bHQsIGNhY2hlOiBCdWlsZGVyQ2FjaGUpIHtcclxuXHJcbiAgICAvLyDmt7vliqDnu5/orqHkv6Hmga9cclxuICAgIG9wdGlvbnMuYnVpbGRFbmdpbmVQYXJhbS5zcGxpdCA9IGZhbHNlO1xyXG4gICAgb3B0aW9ucy5idWlsZEVuZ2luZVBhcmFtLmFzc2V0VVJMRm9ybWF0ID0gJ3J1bnRpbWUtcmVzb2x2ZWQnO1xyXG4gICAgaWYgKG9wdGlvbnMuc2VydmVyICYmICFvcHRpb25zLnNlcnZlci5lbmRzV2l0aCgnLycpKSB7XHJcbiAgICAgICAgb3B0aW9ucy5zZXJ2ZXIgKz0gJy8nO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb25BZnRlckJ1bmRsZUluaXQob3B0aW9uczogSUludGVyQnVpbGRUYXNrT3B0aW9uPCd3ZWItbW9iaWxlJz4pIHtcclxuICAgIG9wdGlvbnMuYnVpbGRTY3JpcHRQYXJhbS5zeXN0ZW0gPSB7IHByZXNldDogJ3dlYicgfTtcclxuICAgIGNvbnN0IHVzZVdlYkdQVSA9IG9wdGlvbnMucGFja2FnZXNbJ3dlYi1tb2JpbGUnXS51c2VXZWJHUFU7XHJcbiAgICBvcHRpb25zLmJ1aWxkU2NyaXB0UGFyYW0uZmxhZ3NbJ1dFQkdQVSddID0gdXNlV2ViR1BVO1xyXG4gICAgaWYgKHVzZVdlYkdQVSkge1xyXG4gICAgICAgIGlmICghb3B0aW9ucy5pbmNsdWRlTW9kdWxlcy5pbmNsdWRlcygnZ2Z4LXdlYmdwdScpKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMuaW5jbHVkZU1vZHVsZXMucHVzaCgnZ2Z4LXdlYmdwdScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvcHRpb25zLmFzc2V0U2VyaWFsaXplT3B0aW9uc1snY2MuRWZmZWN0QXNzZXQnXSEuZ2xzbDQgPSB0cnVlO1xyXG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmluY2x1ZGVNb2R1bGVzLmluY2x1ZGVzKCdnZngtd2ViZ3B1JykpIHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IG9wdGlvbnMuaW5jbHVkZU1vZHVsZXMuaW5kZXhPZignZ2Z4LXdlYmdwdScpO1xyXG4gICAgICAgIG9wdGlvbnMuaW5jbHVkZU1vZHVsZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOWJlOmZpOS4jemcgOimgeWPguS4juaehOW7uueahOi1hOa6kFxyXG4gKiBAcGFyYW0gb3B0aW9uc1xyXG4gKiBAcGFyYW0gc2V0dGluZ3NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvbkJlZm9yZUNvbXByZXNzU2V0dGluZ3Mob3B0aW9uczogSUludGVyQnVpbGRUYXNrT3B0aW9uPCd3ZWItbW9iaWxlJz4sIHJlc3VsdDogSW50ZXJuYWxCdWlsZFJlc3VsdCwgY2FjaGU6IEJ1aWxkZXJDYWNoZSkge1xyXG4gICAgaWYgKCFyZXN1bHQucGF0aHMuZGlyKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgcGFja2FnZU9wdGlvbnMgPSBvcHRpb25zLnBhY2thZ2VzWyd3ZWItbW9iaWxlJ107XHJcbiAgICByZXN1bHQuc2V0dGluZ3Muc2NyZWVuLm9yaWVudGF0aW9uID0gcGFja2FnZU9wdGlvbnMub3JpZW50YXRpb247XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvbkJlZm9yZUNvcHlCdWlsZFRlbXBsYXRlKHRoaXM6IElCdWlsZGVyLCBvcHRpb25zOiBJSW50ZXJCdWlsZFRhc2tPcHRpb248J3dlYi1tb2JpbGUnPiwgcmVzdWx0OiBJQnVpbGRSZXN1bHQpIHtcclxuICAgIGNvbnN0IHN0YXRpY0RpciA9IGpvaW4ob3B0aW9ucy5lbmdpbmVJbmZvLnR5cGVzY3JpcHQuYnVpbHRpbiwgJ3RlbXBsYXRlcy93ZWItbW9iaWxlJyk7XHJcbiAgICBjb25zdCBwYWNrYWdlT3B0aW9ucyA9IG9wdGlvbnMucGFja2FnZXNbJ3dlYi1tb2JpbGUnXTtcclxuXHJcbiAgICAvLyDmi7fotJ3lhoXpg6jmj5DkvpvnmoTmqKHmnb/mlofku7ZcclxuICAgIGNvbnN0IGNzc0ZpbGVQYXRoID0gam9pbihyZXN1bHQucGF0aHMuZGlyLCAnc3R5bGUuY3NzJyk7XHJcbiAgICBvcHRpb25zLm1kNUNhY2hlT3B0aW9ucy5pbmNsdWRlcy5wdXNoKCdzdHlsZS5jc3MnKTtcclxuICAgIGlmICghdGhpcy5idWlsZFRlbXBsYXRlLmZpbmRGaWxlKCdzdHlsZS5jc3MnKSkge1xyXG4gICAgICAgIC8vIOeUn+aIkCBzdHlsZS5jc3NcclxuICAgICAgICBjb3B5RmlsZVN5bmMoam9pbihzdGF0aWNEaXIsICdzdHlsZS5jc3MnKSwgY3NzRmlsZVBhdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB3ZWJEZWJ1Z2dlclNyYyA9ICcnO1xyXG4gICAgaWYgKHBhY2thZ2VPcHRpb25zLmVtYmVkV2ViRGVidWdnZXIpIHtcclxuICAgICAgICBjb25zdCB3ZWJEZWJ1Z2dlclBhdGggPSBqb2luKHJlc3VsdC5wYXRocy5kaXIsICd2Y29uc29sZS5taW4uanMnKTtcclxuICAgICAgICBpZiAoIXRoaXMuYnVpbGRUZW1wbGF0ZS5maW5kRmlsZSgndmNvbnNvbGUubWluLmpzJykpIHtcclxuICAgICAgICAgICAgLy8g55Sf5oiQIHZjb25zb2xlXHJcbiAgICAgICAgICAgIGNvcHlGaWxlU3luYyhqb2luKHN0YXRpY0RpciwgJ3Zjb25zb2xlLm1pbi5qcycpLCB3ZWJEZWJ1Z2dlclBhdGgpO1xyXG4gICAgICAgICAgICBvcHRpb25zLm1kNUNhY2hlT3B0aW9ucy5leGNsdWRlcy5wdXNoKCd2Y29uc29sZS5taW4uanMnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2ViRGVidWdnZXJTcmMgPSAnLi92Y29uc29sZS5taW4uanMnO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGluZGV4LmpzIOaooeadv+eUn+aIkFxyXG4gICAgY29uc3QgaW5kZXhKc1RlbXBsYXRlID0gdGhpcy5idWlsZFRlbXBsYXRlLmluaXRVcmwoJ2luZGV4LmpzLmVqcycsICdpbmRleEpzJykgfHwgam9pbihzdGF0aWNEaXIsICdpbmRleC5qcy5lanMnKTtcclxuICAgIGNvbnN0IGluZGV4SnNDb250ZW50OiBzdHJpbmcgPSBhd2FpdCBFanMucmVuZGVyRmlsZShpbmRleEpzVGVtcGxhdGUsIHtcclxuICAgICAgICBhcHBsaWNhdGlvbkpTOiAnLi8nICsgcmVsYXRpdmVVcmwocmVzdWx0LnBhdGhzLmRpciwgcmVzdWx0LnBhdGhzLmFwcGxpY2F0aW9uSlMpLFxyXG4gICAgfSk7XHJcbiAgICAvLyBUT0RPIOmcgOimgeS8mOWMlu+8jOS4jeW6lOivpeebtOaOpeivu+WIsOWGheWtmOmHjFxyXG4gICAgY29uc3QgaW5kZXhKc1NvdXJjZVRyYW5zZm9ybWVkQ29kZSA9IGF3YWl0IHRyYW5zZm9ybUNvZGUoaW5kZXhKc0NvbnRlbnQsIHtcclxuICAgICAgICBpbXBvcnRNYXBGb3JtYXQ6ICdzeXN0ZW1qcycsXHJcbiAgICB9KTtcclxuICAgIGlmICghaW5kZXhKc1NvdXJjZVRyYW5zZm9ybWVkQ29kZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGdlbmVyYXRlIGluZGV4LmpzJyk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBpbmRleEpzRGVzdCA9IGpvaW4ocmVzdWx0LnBhdGhzLmRpciwgYGluZGV4LmpzYCk7XHJcbiAgICByZXN1bHQucGF0aHMuaW5kZXhKcyA9IGluZGV4SnNEZXN0O1xyXG4gICAgb3B0aW9ucy5tZDVDYWNoZU9wdGlvbnMuaW5jbHVkZXMucHVzaChgaW5kZXguanNgKTtcclxuXHJcbiAgICBvdXRwdXRGaWxlU3luYyhpbmRleEpzRGVzdCwgaW5kZXhKc1NvdXJjZVRyYW5zZm9ybWVkQ29kZSwgJ3V0ZjgnKTtcclxuXHJcbiAgICAvLyBpbmRleC5odG1sIOaooeadv+eUn+aIkFxyXG4gICAgY29uc3QgaW5kZXhFanNUZW1wbGF0ZSA9IHRoaXMuYnVpbGRUZW1wbGF0ZS5pbml0VXJsKCdpbmRleC5lanMnKSB8fCBqb2luKHN0YXRpY0RpciwgJ2luZGV4LmVqcycpO1xyXG4gICAgLy8g5aSE55CG5bmz5Y+w5qih5p2/XHJcbiAgICBjb25zdCBkYXRhID0ge1xyXG4gICAgICAgIHBvbHlmaWxsc0J1bmRsZUZpbGU6IHJlc3VsdC5wYXRocy5wb2x5ZmlsbHNKcyAmJiByZWxhdGl2ZVVybChyZXN1bHQucGF0aHMuZGlyLCByZXN1bHQucGF0aHMucG9seWZpbGxzSnMpIHx8IGZhbHNlLFxyXG4gICAgICAgIHN5c3RlbUpzQnVuZGxlRmlsZTogcmVsYXRpdmVVcmwocmVzdWx0LnBhdGhzLmRpciwgcmVzdWx0LnBhdGhzLnN5c3RlbUpzISksXHJcbiAgICAgICAgcHJvamVjdE5hbWU6IG9wdGlvbnMubmFtZSxcclxuICAgICAgICBlbmdpbmVOYW1lOiBvcHRpb25zLmJ1aWxkRW5naW5lUGFyYW0uZW5naW5lTmFtZSxcclxuICAgICAgICB3ZWJEZWJ1Z2dlclNyYzogd2ViRGVidWdnZXJTcmMsXHJcbiAgICAgICAgY29jb3NUZW1wbGF0ZTogam9pbihzdGF0aWNEaXIsICdpbmRleC1wbHVnaW4uZWpzJyksXHJcbiAgICAgICAgaW1wb3J0TWFwRmlsZTogcmVsYXRpdmVVcmwocmVzdWx0LnBhdGhzLmRpciwgcmVzdWx0LnBhdGhzLmltcG9ydE1hcCksXHJcbiAgICAgICAgaW5kZXhKc05hbWU6IGJhc2VuYW1lKGluZGV4SnNEZXN0KSxcclxuICAgICAgICBjc3NVcmw6IGJhc2VuYW1lKGNzc0ZpbGVQYXRoKSxcclxuICAgIH07XHJcbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgRWpzLnJlbmRlckZpbGUoaW5kZXhFanNUZW1wbGF0ZSwgZGF0YSk7XHJcbiAgICByZXN1bHQucGF0aHMuaW5kZXhIVE1MID0gam9pbihyZXN1bHQucGF0aHMuZGlyLCAnaW5kZXguaHRtbCcpO1xyXG4gICAgb3V0cHV0RmlsZVN5bmMocmVzdWx0LnBhdGhzLmluZGV4SFRNTCwgY29udGVudCwgJ3V0ZjgnKTtcclxuICAgIG9wdGlvbnMubWQ1Q2FjaGVPcHRpb25zLnJlcGxhY2VPbmx5LnB1c2goJ2luZGV4Lmh0bWwnKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uQWZ0ZXJCdWlsZCh0aGlzOiBJQnVpbGRlciwgb3B0aW9uczogSUludGVyQnVpbGRUYXNrT3B0aW9uPCd3ZWItbW9iaWxlJz4sIHJlc3VsdDogSW50ZXJuYWxCdWlsZFJlc3VsdCkge1xyXG4gICAgLy8g5pS+5Zyo5pyA5ZCO5aSE55CGIHVybCDvvIzlkKbliJnkvJrnoLTlnY8gbWQ1IOeahOWkhOeQhlxyXG4gICAgcmVzdWx0LnNldHRpbmdzLnBsdWdpbnMuanNMaXN0LmZvckVhY2goKHVybDogc3RyaW5nLCBpOiBudW1iZXIpID0+IHtcclxuICAgICAgICByZXN1bHQuc2V0dGluZ3MucGx1Z2lucy5qc0xpc3RbaV0gPSB1cmwuc3BsaXQoJy8nKS5tYXAoZW5jb2RlVVJJQ29tcG9uZW50KS5qb2luKCcvJyk7XHJcbiAgICB9KTtcclxuICAgIG91dHB1dEZpbGVTeW5jKHJlc3VsdC5wYXRocy5zZXR0aW5ncywgSlNPTi5zdHJpbmdpZnkocmVzdWx0LnNldHRpbmdzLCBudWxsLCBvcHRpb25zLmRlYnVnID8gNCA6IDApKTtcclxuICAgIGNvbnN0IHByZXZpZXdVcmwgPSBhd2FpdCBjb21tb25VdGlscy5nZXRQcmV2aWV3VXJsKHJlc3VsdC5wYXRocy5kaXIsIG9wdGlvbnMucGxhdGZvcm0pO1xyXG4gICAgdGhpcy5idWlsZEV4aXRSZXMuY3VzdG9tID0ge1xyXG4gICAgICAgIHByZXZpZXdVcmwsXHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuKHRoaXM6IElCdWlsZFN0YWdlVGFzaywgcm9vdDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBwcmV2aWV3VXJsID0gYXdhaXQgY29tbW9uVXRpbHMucnVuKCd3ZWItbW9iaWxlJywgcm9vdCk7XHJcbiAgICB0aGlzLmJ1aWxkRXhpdFJlcy5jdXN0b20gPSB7XHJcbiAgICAgICAgcHJldmlld1VybCxcclxuICAgIH07XHJcbn07XHJcbiJdfQ==