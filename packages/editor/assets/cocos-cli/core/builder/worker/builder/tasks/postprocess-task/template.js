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
exports.name = exports.title = void 0;
exports.handle = handle;
const ejs_1 = __importDefault(require("ejs"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const babel = __importStar(require("@babel/core"));
// @ts-ignore
const preset_env_1 = __importDefault(require("@babel/preset-env"));
const utils_1 = require("../../utils");
const i18n_1 = __importDefault(require("../../../../../base/i18n"));
const utils_2 = __importDefault(require("../../../../../base/utils"));
// 当前的 ejs 模板版本，升级版本后需要修改该字段与 application.ejs 里的版本号
const APPLICATION_EJS_VERSION = '1.0.0';
exports.title = 'i18n:builder.tasks.build_template';
exports.name = 'build-task/template';
/**
 * application.js 模板编译
 * @param options
 * @param settings
 */
async function handle(options, result, cache) {
    // 生成 settings.json
    const content = JSON.stringify(result.settings, null, options.debug ? 4 : 0);
    (0, fs_extra_1.outputFileSync)(result.paths.settings, content, 'utf8');
    const enginePath = options.engineInfo.typescript.path;
    const templateDir = (0, path_1.join)(enginePath, 'templates/launcher');
    const applicationEjsPath = this.buildTemplate.query('application') || (0, path_1.join)(templateDir, 'application.ejs');
    const settingsJsonPath = (0, utils_1.relativeUrl)(result.paths.dir, result.paths.settings);
    // ---- 编译 application.js ----
    const applicationSource = (await ejs_1.default.renderFile(applicationEjsPath, Object.assign(options.appTemplateData, {
        settingsJsonPath,
        hasPhysicsAmmo: options.buildEngineParam.includeModules.includes('physics-ammo'),
        versionTips: i18n_1.default.t('builder.tips.application_ejs_version'),
        customVersion: APPLICATION_EJS_VERSION,
        versionCheckTemplate: (0, path_1.join)(templateDir, 'version-check.ejs'),
    })));
    const applicationSourceTransformed = await babel.transformAsync(applicationSource, {
        presets: [[preset_env_1.default, {
                    modules: (0, utils_1.toBabelModules)('systemjs'),
                    targets: options.buildScriptParam.targets,
                }]],
    });
    if (!applicationSourceTransformed || !applicationSourceTransformed.code) {
        throw new Error('无法生成 application.js');
    }
    (0, fs_extra_1.outputFileSync)(result.paths.applicationJS, applicationSourceTransformed.code);
    options.md5CacheOptions.includes.push(utils_2.default.Path.relative(result.paths.dir, result.paths.applicationJS));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3dvcmtlci9idWlsZGVyL3Rhc2tzL3Bvc3Rwcm9jZXNzLXRhc2svdGVtcGxhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEyQmIsd0JBaUNDO0FBM0RELDhDQUEyQjtBQUUzQix1Q0FBd0c7QUFDeEcsK0JBQStDO0FBQy9DLG1EQUFxQztBQUNyQyxhQUFhO0FBQ2IsbUVBQStDO0FBRy9DLHVDQUEwRDtBQUMxRCxvRUFBNEM7QUFFNUMsc0VBQThDO0FBRTlDLG1EQUFtRDtBQUNuRCxNQUFNLHVCQUF1QixHQUFHLE9BQU8sQ0FBQztBQUUzQixRQUFBLEtBQUssR0FBRyxtQ0FBbUMsQ0FBQztBQUU1QyxRQUFBLElBQUksR0FBRyxxQkFBcUIsQ0FBQztBQUUxQzs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLE1BQU0sQ0FBaUIsT0FBOEIsRUFBRSxNQUEyQixFQUFFLEtBQXdCO0lBQzlILG1CQUFtQjtJQUNuQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0UsSUFBQSx5QkFBYyxFQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUV2RCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7SUFDdEQsTUFBTSxXQUFXLEdBQUcsSUFBQSxXQUFJLEVBQUMsVUFBVSxFQUFFLG9CQUFvQixDQUFDLENBQUM7SUFDM0QsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsYUFBYyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxJQUFBLFdBQUksRUFBQyxXQUFXLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUU1RyxNQUFNLGdCQUFnQixHQUFHLElBQUEsbUJBQVcsRUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlFLDhCQUE4QjtJQUM5QixNQUFNLGlCQUFpQixHQUFHLENBQUMsTUFBTSxhQUFRLENBQUMsVUFBVSxDQUNoRCxrQkFBa0IsRUFDbEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFO1FBQ25DLGdCQUFnQjtRQUNoQixjQUFjLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDO1FBQ2hGLFdBQVcsRUFBRSxjQUFJLENBQUMsQ0FBQyxDQUFDLHNDQUFzQyxDQUFDO1FBQzNELGFBQWEsRUFBRSx1QkFBdUI7UUFDdEMsb0JBQW9CLEVBQUUsSUFBQSxXQUFJLEVBQUMsV0FBVyxFQUFFLG1CQUFtQixDQUFDO0tBQy9ELENBQUMsQ0FDTCxDQUFXLENBQUM7SUFDYixNQUFNLDRCQUE0QixHQUFHLE1BQU0sS0FBSyxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRTtRQUMvRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLG9CQUFjLEVBQUU7b0JBQ3ZCLE9BQU8sRUFBRSxJQUFBLHNCQUFjLEVBQUMsVUFBVSxDQUFDO29CQUNuQyxPQUFPLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU87aUJBQzVDLENBQUMsQ0FBQztLQUNOLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyw0QkFBNEIsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RFLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBQ0QsSUFBQSx5QkFBYyxFQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLDRCQUE0QixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlFLE9BQU8sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7QUFDN0csQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuaW1wb3J0IHRlbXBsYXRlIGZyb20gJ2Vqcyc7XHJcblxyXG5pbXBvcnQgeyBjb3B5RmlsZVN5bmMsIGNvcHlTeW5jLCBleGlzdHNTeW5jLCBvdXRwdXRGaWxlU3luYywgcmVhZEZpbGVTeW5jLCByZW1vdmVTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBqb2luLCBkaXJuYW1lLCBiYXNlbmFtZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgKiBhcyBiYWJlbCBmcm9tICdAYmFiZWwvY29yZSc7XHJcbi8vIEB0cy1pZ25vcmVcclxuaW1wb3J0IGJhYmVsUHJlc2V0RW52IGZyb20gJ0BiYWJlbC9wcmVzZXQtZW52JztcclxuaW1wb3J0IHsgQnVpbGRlckFzc2V0Q2FjaGUgfSBmcm9tICcuLi8uLi9tYW5hZ2VyL2Fzc2V0JztcclxuaW1wb3J0IHsgSW50ZXJuYWxCdWlsZFJlc3VsdCB9IGZyb20gJy4uLy4uL21hbmFnZXIvYnVpbGQtcmVzdWx0JztcclxuaW1wb3J0IHsgcmVsYXRpdmVVcmwsIHRvQmFiZWxNb2R1bGVzIH0gZnJvbSAnLi4vLi4vdXRpbHMnO1xyXG5pbXBvcnQgaTE4biBmcm9tICcuLi8uLi8uLi8uLi8uLi9iYXNlL2kxOG4nO1xyXG5pbXBvcnQgeyBJQnVpbGRlciwgSUludGVybmFsQnVpbGRPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi8uLi8uLi8uLi8uLi9iYXNlL3V0aWxzJztcclxuXHJcbi8vIOW9k+WJjeeahCBlanMg5qih5p2/54mI5pys77yM5Y2H57qn54mI5pys5ZCO6ZyA6KaB5L+u5pS56K+l5a2X5q615LiOIGFwcGxpY2F0aW9uLmVqcyDph4znmoTniYjmnKzlj7dcclxuY29uc3QgQVBQTElDQVRJT05fRUpTX1ZFUlNJT04gPSAnMS4wLjAnO1xyXG5cclxuZXhwb3J0IGNvbnN0IHRpdGxlID0gJ2kxOG46YnVpbGRlci50YXNrcy5idWlsZF90ZW1wbGF0ZSc7XHJcblxyXG5leHBvcnQgY29uc3QgbmFtZSA9ICdidWlsZC10YXNrL3RlbXBsYXRlJztcclxuXHJcbi8qKlxyXG4gKiBhcHBsaWNhdGlvbi5qcyDmqKHmnb/nvJbor5FcclxuICogQHBhcmFtIG9wdGlvbnNcclxuICogQHBhcmFtIHNldHRpbmdzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlKHRoaXM6IElCdWlsZGVyLCBvcHRpb25zOiBJSW50ZXJuYWxCdWlsZE9wdGlvbnMsIHJlc3VsdDogSW50ZXJuYWxCdWlsZFJlc3VsdCwgY2FjaGU6IEJ1aWxkZXJBc3NldENhY2hlKSB7XHJcbiAgICAvLyDnlJ/miJAgc2V0dGluZ3MuanNvblxyXG4gICAgY29uc3QgY29udGVudCA9IEpTT04uc3RyaW5naWZ5KHJlc3VsdC5zZXR0aW5ncywgbnVsbCwgb3B0aW9ucy5kZWJ1ZyA/IDQgOiAwKTtcclxuICAgIG91dHB1dEZpbGVTeW5jKHJlc3VsdC5wYXRocy5zZXR0aW5ncywgY29udGVudCwgJ3V0ZjgnKTtcclxuXHJcbiAgICBjb25zdCBlbmdpbmVQYXRoID0gb3B0aW9ucy5lbmdpbmVJbmZvLnR5cGVzY3JpcHQucGF0aDtcclxuICAgIGNvbnN0IHRlbXBsYXRlRGlyID0gam9pbihlbmdpbmVQYXRoLCAndGVtcGxhdGVzL2xhdW5jaGVyJyk7XHJcbiAgICBjb25zdCBhcHBsaWNhdGlvbkVqc1BhdGggPSB0aGlzLmJ1aWxkVGVtcGxhdGUhLnF1ZXJ5KCdhcHBsaWNhdGlvbicpIHx8IGpvaW4odGVtcGxhdGVEaXIsICdhcHBsaWNhdGlvbi5lanMnKTtcclxuXHJcbiAgICBjb25zdCBzZXR0aW5nc0pzb25QYXRoID0gcmVsYXRpdmVVcmwocmVzdWx0LnBhdGhzLmRpciwgcmVzdWx0LnBhdGhzLnNldHRpbmdzKTtcclxuICAgIC8vIC0tLS0g57yW6K+RIGFwcGxpY2F0aW9uLmpzIC0tLS1cclxuICAgIGNvbnN0IGFwcGxpY2F0aW9uU291cmNlID0gKGF3YWl0IHRlbXBsYXRlLnJlbmRlckZpbGUoXHJcbiAgICAgICAgYXBwbGljYXRpb25FanNQYXRoLFxyXG4gICAgICAgIE9iamVjdC5hc3NpZ24ob3B0aW9ucy5hcHBUZW1wbGF0ZURhdGEsIHtcclxuICAgICAgICAgICAgc2V0dGluZ3NKc29uUGF0aCxcclxuICAgICAgICAgICAgaGFzUGh5c2ljc0FtbW86IG9wdGlvbnMuYnVpbGRFbmdpbmVQYXJhbS5pbmNsdWRlTW9kdWxlcy5pbmNsdWRlcygncGh5c2ljcy1hbW1vJyksXHJcbiAgICAgICAgICAgIHZlcnNpb25UaXBzOiBpMThuLnQoJ2J1aWxkZXIudGlwcy5hcHBsaWNhdGlvbl9lanNfdmVyc2lvbicpLFxyXG4gICAgICAgICAgICBjdXN0b21WZXJzaW9uOiBBUFBMSUNBVElPTl9FSlNfVkVSU0lPTixcclxuICAgICAgICAgICAgdmVyc2lvbkNoZWNrVGVtcGxhdGU6IGpvaW4odGVtcGxhdGVEaXIsICd2ZXJzaW9uLWNoZWNrLmVqcycpLFxyXG4gICAgICAgIH0pLFxyXG4gICAgKSkgYXMgc3RyaW5nO1xyXG4gICAgY29uc3QgYXBwbGljYXRpb25Tb3VyY2VUcmFuc2Zvcm1lZCA9IGF3YWl0IGJhYmVsLnRyYW5zZm9ybUFzeW5jKGFwcGxpY2F0aW9uU291cmNlLCB7XHJcbiAgICAgICAgcHJlc2V0czogW1tiYWJlbFByZXNldEVudiwge1xyXG4gICAgICAgICAgICBtb2R1bGVzOiB0b0JhYmVsTW9kdWxlcygnc3lzdGVtanMnKSxcclxuICAgICAgICAgICAgdGFyZ2V0czogb3B0aW9ucy5idWlsZFNjcmlwdFBhcmFtLnRhcmdldHMsXHJcbiAgICAgICAgfV1dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFhcHBsaWNhdGlvblNvdXJjZVRyYW5zZm9ybWVkIHx8ICFhcHBsaWNhdGlvblNvdXJjZVRyYW5zZm9ybWVkLmNvZGUpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ+aXoOazleeUn+aIkCBhcHBsaWNhdGlvbi5qcycpO1xyXG4gICAgfVxyXG4gICAgb3V0cHV0RmlsZVN5bmMocmVzdWx0LnBhdGhzLmFwcGxpY2F0aW9uSlMsIGFwcGxpY2F0aW9uU291cmNlVHJhbnNmb3JtZWQuY29kZSk7XHJcbiAgICBvcHRpb25zLm1kNUNhY2hlT3B0aW9ucy5pbmNsdWRlcy5wdXNoKHV0aWxzLlBhdGgucmVsYXRpdmUocmVzdWx0LnBhdGhzLmRpciwgcmVzdWx0LnBhdGhzLmFwcGxpY2F0aW9uSlMpKTtcclxufVxyXG5cclxuLy8gLS0tLVxyXG4iXX0=