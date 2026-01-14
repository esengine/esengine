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
exports.init = init;
exports.build = build;
exports.buildBundleOnly = buildBundleOnly;
exports.executeBuildStageTask = executeBuildStageTask;
exports.getPreviewSettings = getPreviewSettings;
exports.queryBuildConfig = queryBuildConfig;
exports.queryDefaultBuildConfigByPlatform = queryDefaultBuildConfigByPlatform;
const fs_extra_1 = require("fs-extra");
const i18n_1 = __importDefault(require("../base/i18n"));
const plugin_1 = require("./manager/plugin");
const utils_1 = require("./share/utils");
const console_1 = require("../base/console");
const path_1 = require("path");
const asset_1 = __importDefault(require("../assets/manager/asset"));
const utils_2 = require("./worker/builder/utils");
const builder_config_1 = __importDefault(require("./share/builder-config"));
const utils_3 = __importDefault(require("../base/utils"));
const core_1 = require("../../server/middleware/core");
const build_middleware_1 = __importDefault(require("./build.middleware"));
const global_1 = require("./share/global");
async function init(platform) {
    await builder_config_1.default.init();
    await plugin_1.pluginManager.init();
    core_1.middlewareService.register('Build', build_middleware_1.default);
    if (platform) {
        await plugin_1.pluginManager.register(platform);
    }
    else {
        await plugin_1.pluginManager.registerAllPlatform();
    }
}
async function build(platform, options) {
    if (!options) {
        options = await plugin_1.pluginManager.getOptionsByPlatform(platform);
    }
    options.platform = platform;
    // 不支持的构建平台不执行构建
    if (!plugin_1.pluginManager.checkPlatform(platform)) {
        console.error(i18n_1.default.t('builder.tips.disable_platform_for_build_command', {
            platform: platform,
        }));
        return { code: 34 /* BuildExitCode.BUILD_FAILED */, reason: `Unsupported platform ${platform} for build command!` };
    }
    options.taskId = options.taskId || String(new Date().getTime());
    options.taskName = options.taskName || platform;
    // 命令行构建前，补全项目配置数据
    // await checkProjectSettingsBeforeCommand(options);
    // @ts-ignore
    let realOptions = options;
    if (!options.skipCheck) {
        try {
            // 校验插件选项
            // @ts-ignore
            const rightOptions = await plugin_1.pluginManager.checkOptions(options);
            if (!rightOptions) {
                console.error(i18n_1.default.t('builder.error.check_options_failed'));
                return { code: 32 /* BuildExitCode.PARAM_ERROR */, reason: 'Check options failed!' };
            }
            realOptions = rightOptions;
            console.log(JSON.stringify(realOptions, null, 2));
        }
        catch (error) {
            console.error(error);
            return { code: 32 /* BuildExitCode.PARAM_ERROR */, reason: 'Check options failed! ' + String(error) };
        }
    }
    let buildSuccess = true;
    const startTime = Date.now();
    // 显示构建开始信息
    console_1.newConsole.buildStart(platform);
    try {
        const { BuildTask } = await Promise.resolve().then(() => __importStar(require('./worker/builder')));
        const builder = new BuildTask(options.taskId, realOptions);
        // 监听构建进度
        builder.on('update', (message, progress) => {
            console_1.newConsole.progress(message, Math.round(progress * 100), 100);
        });
        await builder.run();
        buildSuccess = !builder.error;
        const duration = (0, utils_1.formatMSTime)(Date.now() - startTime);
        console_1.newConsole.buildComplete(platform, duration, buildSuccess);
        builder.buildExitRes.dest = utils_3.default.Path.resolveToUrl(builder.buildExitRes.dest, 'project');
        console.debug(JSON.stringify(builder.buildExitRes));
        return buildSuccess ? builder.buildExitRes : { code: 34 /* BuildExitCode.BUILD_FAILED */, reason: 'Build failed!' };
    }
    catch (error) {
        buildSuccess = false;
        const duration = (0, utils_1.formatMSTime)(Date.now() - startTime);
        console_1.newConsole.error(error);
        console_1.newConsole.buildComplete(platform, duration, false);
        // 如果错误对象包含 code 属性，使用该错误码（如 500）
        let errorCode = error?.code && typeof error.code === 'number' ? error.code : 34 /* BuildExitCode.BUILD_FAILED */;
        if (errorCode === 0 /* BuildExitCode.BUILD_SUCCESS */) {
            errorCode = 34 /* BuildExitCode.BUILD_FAILED */;
        }
        return { code: errorCode, reason: error?.message || String(error) };
    }
}
async function buildBundleOnly(bundleOptions) {
    const { BundleManager } = await Promise.resolve().then(() => __importStar(require('./worker/builder/asset-handler/bundle')));
    const startTime = Date.now();
    const options = bundleOptions.buildTaskOptions;
    const tasksLabel = bundleOptions.taskName || 'bundle Build';
    const taskStartTime = Date.now();
    try {
        console_1.newConsole.stage('BUNDLE', `${tasksLabel} (${options.platform}) starting...`);
        console.debug('Start build task, options:', options);
        console_1.newConsole.trackMemoryStart(`builder:build-bundle-total`);
        const builder = await BundleManager.create(options);
        builder.on('update', (message, progress) => {
            console_1.newConsole.progress(`${options.platform}: ${message}`, Math.round(progress * 100), 100);
        });
        await builder.run();
        console_1.newConsole.trackMemoryEnd(`builder:build-bundle-total`);
        const totalDuration = (0, utils_1.formatMSTime)(Date.now() - startTime);
        console_1.newConsole.taskComplete('Bundle Build', !!builder.error, totalDuration);
        if (builder.error) {
            const errorMsg = typeof builder.error == 'object' ? (builder.error.stack || builder.error.message) : builder.error;
            console_1.newConsole.error(`${tasksLabel} (${options.platform}) failed: ${errorMsg}`);
            return { code: 34 /* BuildExitCode.BUILD_FAILED */, reason: errorMsg };
        }
        else {
            const duration = (0, utils_1.formatMSTime)(Date.now() - taskStartTime);
            console_1.newConsole.success(`${tasksLabel} (${options.platform}) completed in ${duration}`);
            return builder.buildExitRes;
        }
    }
    catch (error) {
        const errMsg = `${tasksLabel} (${options.platform}) error: ${String(error)}`;
        console_1.newConsole.error(errMsg);
        const totalDuration = (0, utils_1.formatMSTime)(Date.now() - startTime);
        console_1.newConsole.taskComplete('Bundle Build', false, totalDuration);
        return { code: 34 /* BuildExitCode.BUILD_FAILED */, reason: errMsg };
    }
}
async function executeBuildStageTask(taskId, stageName, options) {
    if (!options.taskName) {
        options.taskName = stageName + ' build';
    }
    options.dest = utils_3.default.Path.resolveToRaw(options.dest);
    let buildOptions;
    if (!options.platform.startsWith('web')) {
        try {
            buildOptions = readBuildTaskOptions(options.dest);
        }
        catch (error) {
            console.error(error);
            if (!buildOptions) {
                return { code: 32 /* BuildExitCode.PARAM_ERROR */, reason: 'Build options is not exist!' };
            }
        }
    }
    let buildSuccess = true;
    const BuildStageTask = (await Promise.resolve().then(() => __importStar(require('./worker/builder/stage-task-manager')))).BuildStageTask;
    const stageConfig = plugin_1.pluginManager.getBuildStageWithHookTasks(options.platform, stageName);
    if (!stageConfig) {
        console.error(`No Build stage ${stageName}`);
        return { code: 34 /* BuildExitCode.BUILD_FAILED */, reason: `No Build stage ${stageName}!` };
    }
    console_1.newConsole.trackMemoryStart(`builder:build-stage-total ${stageName}`);
    const buildStageTask = new BuildStageTask(taskId, {
        hooksInfo: plugin_1.pluginManager.getHooksInfo(options.platform),
        root: options.dest,
        buildTaskOptions: buildOptions,
        ...stageConfig,
    });
    const stageLabel = stageConfig.name;
    buildSuccess = await buildStageTask.run();
    console_1.newConsole.trackMemoryEnd(`builder:build-stage-total ${stageName}`);
    if (!buildStageTask.error) {
        console.log(`[task:${stageLabel}]: success!`);
    }
    else {
        console.error(`${stageLabel} package ${options.dest} failed!`);
        console.log(`[task:${stageLabel}]: failed!`);
        buildSuccess = false;
    }
    buildStageTask.buildExitRes.dest = utils_3.default.Path.resolveToUrl(buildStageTask.buildExitRes.dest, 'project');
    console.log(JSON.stringify(buildStageTask.buildExitRes));
    return buildSuccess ? buildStageTask.buildExitRes : { code: 34 /* BuildExitCode.BUILD_FAILED */, reason: 'Build stage task failed!' };
}
function readBuildTaskOptions(root) {
    const configFile = (0, path_1.join)(root, global_1.BuildGlobalInfo.buildOptionsFileName);
    return (0, fs_extra_1.readJSONSync)(configFile);
}
async function getPreviewSettings(options) {
    const buildOptions = options || (await plugin_1.pluginManager.getOptionsByPlatform('web-desktop'));
    buildOptions.preview = true;
    // TODO 预览 settings 的排队之类的
    const { BuildTask } = await Promise.resolve().then(() => __importStar(require('./worker/builder/index')));
    const buildTask = new BuildTask(buildOptions.taskId || 'v', buildOptions);
    console.time('Get settings.js in preview');
    // 拿出 settings 信息
    const settings = await buildTask.getPreviewSettings();
    // 拼接脚本对应文件的 map
    const script2library = {};
    for (const uuid of buildTask.cache.scriptUuids) {
        const asset = asset_1.default.queryAsset(uuid);
        if (!asset) {
            console.error('unknown script uuid: ' + uuid);
            continue;
        }
        script2library[(0, utils_2.removeDbHeader)(asset.url).replace(/.ts$/, '.js')] = asset.library + '.js';
    }
    console.timeEnd('Get settings.js in preview');
    // 返回数据
    return {
        settings,
        script2library,
        bundleConfigs: buildTask.bundleManager.bundles.map((x) => x.config),
    };
}
function queryBuildConfig() {
    return builder_config_1.default.getProject();
}
async function queryDefaultBuildConfigByPlatform(platform) {
    return await plugin_1.pluginManager.getOptionsByPlatform(platform);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBLG9CQVNDO0FBRUQsc0JBdUVDO0FBRUQsMENBc0NDO0FBRUQsc0RBK0NDO0FBT0QsZ0RBNEJDO0FBRUQsNENBRUM7QUFFRCw4RUFFQztBQXRPRCx1Q0FBd0M7QUFDeEMsd0RBQWdDO0FBRWhDLDZDQUFpRDtBQUNqRCx5Q0FBNkM7QUFDN0MsNkNBQTZDO0FBQzdDLCtCQUE0QjtBQUM1QixvRUFBbUQ7QUFDbkQsa0RBQXdEO0FBQ3hELDRFQUFtRDtBQUVuRCwwREFBa0M7QUFDbEMsdURBQWlFO0FBQ2pFLDBFQUFpRDtBQUNqRCwyQ0FBaUQ7QUFFMUMsS0FBSyxVQUFVLElBQUksQ0FBQyxRQUFpQjtJQUN4QyxNQUFNLHdCQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDM0IsTUFBTSxzQkFBYSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzNCLHdCQUFpQixDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsMEJBQWUsQ0FBQyxDQUFDO0lBQ3JELElBQUksUUFBUSxFQUFFLENBQUM7UUFDWCxNQUFNLHNCQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLENBQUM7U0FBTSxDQUFDO1FBQ0osTUFBTSxzQkFBYSxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDOUMsQ0FBQztBQUNMLENBQUM7QUFFTSxLQUFLLFVBQVUsS0FBSyxDQUFxQixRQUFXLEVBQUUsT0FBNkI7SUFFdEYsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ1gsT0FBTyxHQUFHLE1BQU0sc0JBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBQ0QsT0FBTyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFF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QUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQyxDQUFDO1lBQzlDLFNBQVM7UUFDYixDQUFDO1FBQ0QsY0FBYyxDQUFDLElBQUEsc0JBQWMsRUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBQzdGLENBQUM7SUFDRCxPQUFPLENBQUMsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDOUMsT0FBTztJQUNQLE9BQU87UUFDSCxRQUFRO1FBQ1IsY0FBYztRQUNkLGFBQWEsRUFBRSxTQUFTLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7S0FDdEUsQ0FBQztBQUNOLENBQUM7QUFFRCxTQUFnQixnQkFBZ0I7SUFDNUIsT0FBTyx3QkFBYSxDQUFDLFVBQVUsRUFBc0IsQ0FBQztBQUMxRCxDQUFDO0FBRU0sS0FBSyxVQUFVLGlDQUFpQyxDQUFDLFFBQWtCO0lBQ3RFLE9BQU8sTUFBTSxzQkFBYSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZWFkSlNPTlN5bmMgfSBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCBpMThuIGZyb20gJy4uL2Jhc2UvaTE4bic7XHJcbmltcG9ydCB7IEJ1aWxkRXhpdENvZGUsIElCdWlsZENvbW1hbmRPcHRpb24sIElCdWlsZFJlc3VsdERhdGEsIElCdWlsZFN0YWdlT3B0aW9ucywgSUJ1aWxkVGFza09wdGlvbiwgSUJ1bmRsZUJ1aWxkT3B0aW9ucywgSVByZXZpZXdTZXR0aW5nc1Jlc3VsdCwgUGxhdGZvcm0gfSBmcm9tICcuL0B0eXBlcy9wcml2YXRlJztcclxuaW1wb3J0IHsgcGx1Z2luTWFuYWdlciB9IGZyb20gJy4vbWFuYWdlci9wbHVnaW4nO1xyXG5pbXBvcnQgeyBmb3JtYXRNU1RpbWUgfSBmcm9tICcuL3NoYXJlL3V0aWxzJztcclxuaW1wb3J0IHsgbmV3Q29uc29sZSB9IGZyb20gJy4uL2Jhc2UvY29uc29sZSc7XHJcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IGFzc2V0TWFuYWdlciBmcm9tICcuLi9hc3NldHMvbWFuYWdlci9hc3NldCc7XHJcbmltcG9ydCB7IHJlbW92ZURiSGVhZGVyIH0gZnJvbSAnLi93b3JrZXIvYnVpbGRlci91dGlscyc7XHJcbmltcG9ydCBidWlsZGVyQ29uZmlnIGZyb20gJy4vc2hhcmUvYnVpbGRlci1jb25maWcnO1xyXG5pbXBvcnQgeyBCdWlsZENvbmZpZ3VyYXRpb24gfSBmcm9tICcuL0B0eXBlcy9jb25maWctZXhwb3J0JztcclxuaW1wb3J0IHV0aWxzIGZyb20gJy4uL2Jhc2UvdXRpbHMnO1xyXG5pbXBvcnQgeyBtaWRkbGV3YXJlU2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZlci9taWRkbGV3YXJlL2NvcmUnO1xyXG5pbXBvcnQgQnVpbGRNaWRkbGV3YXJlIGZyb20gJy4vYnVpbGQubWlkZGxld2FyZSc7XHJcbmltcG9ydCB7IEJ1aWxkR2xvYmFsSW5mbyB9IGZyb20gJy4vc2hhcmUvZ2xvYmFsJztcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0KHBsYXRmb3JtPzogc3RyaW5nKSB7XHJcbiAgICBhd2FpdCBidWlsZGVyQ29uZmlnLmluaXQoKTtcclxuICAgIGF3YWl0IHBsdWdpbk1hbmFnZXIuaW5pdCgpO1xyXG4gICAgbWlkZGxld2FyZVNlcnZpY2UucmVnaXN0ZXIoJ0J1aWxkJywgQnVpbGRNaWRkbGV3YXJlKTtcclxuICAgIGlmIChwbGF0Zm9ybSkge1xyXG4gICAgICAgIGF3YWl0IHBsdWdpbk1hbmFnZXIucmVnaXN0ZXIocGxhdGZvcm0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBhd2FpdCBwbHVnaW5NYW5hZ2VyLnJlZ2lzdGVyQWxsUGxhdGZvcm0oKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkPFAgZXh0ZW5kcyBQbGF0Zm9ybT4ocGxhdGZvcm06IFAsIG9wdGlvbnM/OiBJQnVpbGRDb21tYW5kT3B0aW9uKTogUHJvbWlzZTxJQnVpbGRSZXN1bHREYXRhPiB7XHJcblxyXG4gICAgaWYgKCFvcHRpb25zKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IGF3YWl0IHBsdWdpbk1hbmFnZXIuZ2V0T3B0aW9uc0J5UGxhdGZvcm0ocGxhdGZvcm0pO1xyXG4gICAgfVxyXG4gICAgb3B0aW9ucy5wbGF0Zm9ybSA9IHBsYXRmb3JtO1xyXG5cclxuICAgIC8vIOS4jeaUr+aMgeeahOaehOW7uuW5s+WPsOS4jeaJp+ihjOaehOW7ulxyXG4gICAgaWYgKCFwbHVnaW5NYW5hZ2VyLmNoZWNrUGxhdGZvcm0ocGxhdGZvcm0pKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihpMThuLnQoJ2J1aWxkZXIudGlwcy5kaXNhYmxlX3BsYXRmb3JtX2Zvcl9idWlsZF9jb21tYW5kJywge1xyXG4gICAgICAgICAgICBwbGF0Zm9ybTogcGxhdGZvcm0sXHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIHJldHVybiB7IGNvZGU6IEJ1aWxkRXhpdENvZGUuQlVJTERfRkFJTEVELCByZWFzb246IGBVbnN1cHBvcnRlZCBwbGF0Zm9ybSAke3BsYXRmb3JtfSBmb3IgYnVpbGQgY29tbWFuZCFgIH07XHJcbiAgICB9XHJcbiAgICBvcHRpb25zLnRhc2tJZCA9IG9wdGlvbnMudGFza0lkIHx8IFN0cmluZyhuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XHJcbiAgICBvcHRpb25zLnRhc2tOYW1lID0gb3B0aW9ucy50YXNrTmFtZSB8fCBwbGF0Zm9ybTtcclxuXHJcbiAgICAvLyDlkb3ku6TooYzmnoTlu7rliY3vvIzooaXlhajpobnnm67phY3nva7mlbDmja5cclxuICAgIC8vIGF3YWl0IGNoZWNrUHJvamVjdFNldHRpbmdzQmVmb3JlQ29tbWFuZChvcHRpb25zKTtcclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIGxldCByZWFsT3B0aW9uczogSUJ1aWxkVGFza09wdGlvbjxhbnk+ID0gb3B0aW9ucztcclxuICAgIGlmICghb3B0aW9ucy5za2lwQ2hlY2spIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyDmoKHpqozmj5Lku7bpgInpoblcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBjb25zdCByaWdodE9wdGlvbnMgPSBhd2FpdCBwbHVnaW5NYW5hZ2VyLmNoZWNrT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICAgICAgaWYgKCFyaWdodE9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoaTE4bi50KCdidWlsZGVyLmVycm9yLmNoZWNrX29wdGlvbnNfZmFpbGVkJykpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgY29kZTogQnVpbGRFeGl0Q29kZS5QQVJBTV9FUlJPUiwgcmVhc29uOiAnQ2hlY2sgb3B0aW9ucyBmYWlsZWQhJyB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlYWxPcHRpb25zID0gcmlnaHRPcHRpb25zO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShyZWFsT3B0aW9ucywgbnVsbCwgMikpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICByZXR1cm4geyBjb2RlOiBCdWlsZEV4aXRDb2RlLlBBUkFNX0VSUk9SLCByZWFzb246ICdDaGVjayBvcHRpb25zIGZhaWxlZCEgJyArIFN0cmluZyhlcnJvcikgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGJ1aWxkU3VjY2VzcyA9IHRydWU7XHJcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgIC8vIOaYvuekuuaehOW7uuW8gOWni+S/oeaBr1xyXG4gICAgbmV3Q29uc29sZS5idWlsZFN0YXJ0KHBsYXRmb3JtKTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgeyBCdWlsZFRhc2sgfSA9IGF3YWl0IGltcG9ydCgnLi93b3JrZXIvYnVpbGRlcicpO1xyXG4gICAgICAgIGNvbnN0IGJ1aWxkZXIgPSBuZXcgQnVpbGRUYXNrKG9wdGlvbnMudGFza0lkLCByZWFsT3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIOebkeWQrOaehOW7uui/m+W6plxyXG4gICAgICAgIGJ1aWxkZXIub24oJ3VwZGF0ZScsIChtZXNzYWdlOiBzdHJpbmcsIHByb2dyZXNzOiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgbmV3Q29uc29sZS5wcm9ncmVzcyhtZXNzYWdlLCBNYXRoLnJvdW5kKHByb2dyZXNzICogMTAwKSwgMTAwKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYXdhaXQgYnVpbGRlci5ydW4oKTtcclxuICAgICAgICBidWlsZFN1Y2Nlc3MgPSAhYnVpbGRlci5lcnJvcjtcclxuICAgICAgICBjb25zdCBkdXJhdGlvbiA9IGZvcm1hdE1TVGltZShEYXRlLm5vdygpIC0gc3RhcnRUaW1lKTtcclxuICAgICAgICBuZXdDb25zb2xlLmJ1aWxkQ29tcGxldGUocGxhdGZvcm0sIGR1cmF0aW9uLCBidWlsZFN1Y2Nlc3MpO1xyXG4gICAgICAgIGJ1aWxkZXIuYnVpbGRFeGl0UmVzLmRlc3QgPSB1dGlscy5QYXRoLnJlc29sdmVUb1VybChidWlsZGVyLmJ1aWxkRXhpdFJlcy5kZXN0LCAncHJvamVjdCcpO1xyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoSlNPTi5zdHJpbmdpZnkoYnVpbGRlci5idWlsZEV4aXRSZXMpKTtcclxuICAgICAgICByZXR1cm4gYnVpbGRTdWNjZXNzID8gYnVpbGRlci5idWlsZEV4aXRSZXMgOiB7IGNvZGU6IEJ1aWxkRXhpdENvZGUuQlVJTERfRkFJTEVELCByZWFzb246ICdCdWlsZCBmYWlsZWQhJyB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIGJ1aWxkU3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IGR1cmF0aW9uID0gZm9ybWF0TVNUaW1lKERhdGUubm93KCkgLSBzdGFydFRpbWUpO1xyXG4gICAgICAgIG5ld0NvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgIG5ld0NvbnNvbGUuYnVpbGRDb21wbGV0ZShwbGF0Zm9ybSwgZHVyYXRpb24sIGZhbHNlKTtcclxuICAgICAgICAvLyDlpoLmnpzplJnor6/lr7nosaHljIXlkKsgY29kZSDlsZ7mgKfvvIzkvb/nlKjor6XplJnor6/noIHvvIjlpoIgNTAw77yJXHJcbiAgICAgICAgbGV0IGVycm9yQ29kZSA9IGVycm9yPy5jb2RlICYmIHR5cGVvZiBlcnJvci5jb2RlID09PSAnbnVtYmVyJyA/IGVycm9yLmNvZGUgYXMgQnVpbGRFeGl0Q29kZSA6IEJ1aWxkRXhpdENvZGUuQlVJTERfRkFJTEVEO1xyXG4gICAgICAgIGlmIChlcnJvckNvZGUgPT09IEJ1aWxkRXhpdENvZGUuQlVJTERfU1VDQ0VTUykge1xyXG4gICAgICAgICAgICBlcnJvckNvZGUgPSBCdWlsZEV4aXRDb2RlLkJVSUxEX0ZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgY29kZTogZXJyb3JDb2RlIGFzIEV4Y2x1ZGU8QnVpbGRFeGl0Q29kZSwgQnVpbGRFeGl0Q29kZS5CVUlMRF9TVUNDRVNTPiwgcmVhc29uOiBlcnJvcj8ubWVzc2FnZSB8fCBTdHJpbmcoZXJyb3IpIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBidWlsZEJ1bmRsZU9ubHkoYnVuZGxlT3B0aW9uczogSUJ1bmRsZUJ1aWxkT3B0aW9ucyk6IFByb21pc2U8SUJ1aWxkUmVzdWx0RGF0YT4ge1xyXG4gICAgY29uc3QgeyBCdW5kbGVNYW5hZ2VyIH0gPSBhd2FpdCBpbXBvcnQoJy4vd29ya2VyL2J1aWxkZXIvYXNzZXQtaGFuZGxlci9idW5kbGUnKTtcclxuICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IGJ1bmRsZU9wdGlvbnMuYnVpbGRUYXNrT3B0aW9ucztcclxuICAgIGNvbnN0IHRhc2tzTGFiZWwgPSBidW5kbGVPcHRpb25zLnRhc2tOYW1lIHx8ICdidW5kbGUgQnVpbGQnO1xyXG4gICAgY29uc3QgdGFza1N0YXJ0VGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBuZXdDb25zb2xlLnN0YWdlKCdCVU5ETEUnLCBgJHt0YXNrc0xhYmVsfSAoJHtvcHRpb25zLnBsYXRmb3JtfSkgc3RhcnRpbmcuLi5gKTtcclxuICAgICAgICBjb25zb2xlLmRlYnVnKCdTdGFydCBidWlsZCB0YXNrLCBvcHRpb25zOicsIG9wdGlvbnMpO1xyXG4gICAgICAgIG5ld0NvbnNvbGUudHJhY2tNZW1vcnlTdGFydChgYnVpbGRlcjpidWlsZC1idW5kbGUtdG90YWxgKTtcclxuXHJcbiAgICAgICAgY29uc3QgYnVpbGRlciA9IGF3YWl0IEJ1bmRsZU1hbmFnZXIuY3JlYXRlKG9wdGlvbnMpO1xyXG4gICAgICAgIGJ1aWxkZXIub24oJ3VwZGF0ZScsIChtZXNzYWdlOiBzdHJpbmcsIHByb2dyZXNzOiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgbmV3Q29uc29sZS5wcm9ncmVzcyhgJHtvcHRpb25zLnBsYXRmb3JtfTogJHttZXNzYWdlfWAsIE1hdGgucm91bmQocHJvZ3Jlc3MgKiAxMDApLCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBhd2FpdCBidWlsZGVyLnJ1bigpO1xyXG4gICAgICAgIG5ld0NvbnNvbGUudHJhY2tNZW1vcnlFbmQoYGJ1aWxkZXI6YnVpbGQtYnVuZGxlLXRvdGFsYCk7XHJcbiAgICAgICAgY29uc3QgdG90YWxEdXJhdGlvbiA9IGZvcm1hdE1TVGltZShEYXRlLm5vdygpIC0gc3RhcnRUaW1lKTtcclxuICAgICAgICBuZXdDb25zb2xlLnRhc2tDb21wbGV0ZSgnQnVuZGxlIEJ1aWxkJywgISFidWlsZGVyLmVycm9yLCB0b3RhbER1cmF0aW9uKTtcclxuICAgICAgICBpZiAoYnVpbGRlci5lcnJvcikge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9IHR5cGVvZiBidWlsZGVyLmVycm9yID09ICdvYmplY3QnID8gKGJ1aWxkZXIuZXJyb3Iuc3RhY2sgfHwgYnVpbGRlci5lcnJvci5tZXNzYWdlKSA6IGJ1aWxkZXIuZXJyb3I7XHJcbiAgICAgICAgICAgIG5ld0NvbnNvbGUuZXJyb3IoYCR7dGFza3NMYWJlbH0gKCR7b3B0aW9ucy5wbGF0Zm9ybX0pIGZhaWxlZDogJHtlcnJvck1zZ31gKTtcclxuICAgICAgICAgICAgcmV0dXJuIHsgY29kZTogQnVpbGRFeGl0Q29kZS5CVUlMRF9GQUlMRUQsIHJlYXNvbjplcnJvck1zZyB9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uID0gZm9ybWF0TVNUaW1lKERhdGUubm93KCkgLSB0YXNrU3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgbmV3Q29uc29sZS5zdWNjZXNzKGAke3Rhc2tzTGFiZWx9ICgke29wdGlvbnMucGxhdGZvcm19KSBjb21wbGV0ZWQgaW4gJHtkdXJhdGlvbn1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkZXIuYnVpbGRFeGl0UmVzO1xyXG4gICAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICBjb25zdCBlcnJNc2cgPSBgJHt0YXNrc0xhYmVsfSAoJHtvcHRpb25zLnBsYXRmb3JtfSkgZXJyb3I6ICR7U3RyaW5nKGVycm9yKX1gO1xyXG4gICAgICAgIG5ld0NvbnNvbGUuZXJyb3IoZXJyTXNnKTtcclxuICAgICAgICBjb25zdCB0b3RhbER1cmF0aW9uID0gZm9ybWF0TVNUaW1lKERhdGUubm93KCkgLSBzdGFydFRpbWUpO1xyXG4gICAgICAgIG5ld0NvbnNvbGUudGFza0NvbXBsZXRlKCdCdW5kbGUgQnVpbGQnLCBmYWxzZSwgdG90YWxEdXJhdGlvbik7XHJcbiAgICAgICAgcmV0dXJuIHsgY29kZTogQnVpbGRFeGl0Q29kZS5CVUlMRF9GQUlMRUQsIHJlYXNvbjplcnJNc2cgfTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVCdWlsZFN0YWdlVGFzayh0YXNrSWQ6IHN0cmluZywgc3RhZ2VOYW1lOiBzdHJpbmcsIG9wdGlvbnM6IElCdWlsZFN0YWdlT3B0aW9ucyk6IFByb21pc2U8SUJ1aWxkUmVzdWx0RGF0YT4ge1xyXG4gICAgaWYgKCFvcHRpb25zLnRhc2tOYW1lKSB7XHJcbiAgICAgICAgb3B0aW9ucy50YXNrTmFtZSA9IHN0YWdlTmFtZSArICcgYnVpbGQnO1xyXG4gICAgfVxyXG4gICAgb3B0aW9ucy5kZXN0ID0gdXRpbHMuUGF0aC5yZXNvbHZlVG9SYXcob3B0aW9ucy5kZXN0KTtcclxuICAgIGxldCBidWlsZE9wdGlvbnM7XHJcbiAgICBpZiAoIW9wdGlvbnMucGxhdGZvcm0uc3RhcnRzV2l0aCgnd2ViJykpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBidWlsZE9wdGlvbnMgPSByZWFkQnVpbGRUYXNrT3B0aW9ucyhvcHRpb25zLmRlc3QpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICBpZiAoIWJ1aWxkT3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgY29kZTogQnVpbGRFeGl0Q29kZS5QQVJBTV9FUlJPUiwgcmVhc29uOiAnQnVpbGQgb3B0aW9ucyBpcyBub3QgZXhpc3QhJyB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBidWlsZFN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgY29uc3QgQnVpbGRTdGFnZVRhc2sgPSAoYXdhaXQgaW1wb3J0KCcuL3dvcmtlci9idWlsZGVyL3N0YWdlLXRhc2stbWFuYWdlcicpKS5CdWlsZFN0YWdlVGFzaztcclxuXHJcbiAgICBjb25zdCBzdGFnZUNvbmZpZyA9IHBsdWdpbk1hbmFnZXIuZ2V0QnVpbGRTdGFnZVdpdGhIb29rVGFza3Mob3B0aW9ucy5wbGF0Zm9ybSwgc3RhZ2VOYW1lKTtcclxuICAgIGlmICghc3RhZ2VDb25maWcpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBObyBCdWlsZCBzdGFnZSAke3N0YWdlTmFtZX1gKTtcclxuICAgICAgICByZXR1cm4geyBjb2RlOiBCdWlsZEV4aXRDb2RlLkJVSUxEX0ZBSUxFRCwgcmVhc29uOiBgTm8gQnVpbGQgc3RhZ2UgJHtzdGFnZU5hbWV9IWAgfTtcclxuICAgIH1cclxuXHJcbiAgICBuZXdDb25zb2xlLnRyYWNrTWVtb3J5U3RhcnQoYGJ1aWxkZXI6YnVpbGQtc3RhZ2UtdG90YWwgJHtzdGFnZU5hbWV9YCk7XHJcbiAgICBjb25zdCBidWlsZFN0YWdlVGFzayA9IG5ldyBCdWlsZFN0YWdlVGFzayh0YXNrSWQsIHtcclxuICAgICAgICBob29rc0luZm86IHBsdWdpbk1hbmFnZXIuZ2V0SG9va3NJbmZvKG9wdGlvbnMucGxhdGZvcm0pLFxyXG4gICAgICAgIHJvb3Q6IG9wdGlvbnMuZGVzdCxcclxuICAgICAgICBidWlsZFRhc2tPcHRpb25zOiBidWlsZE9wdGlvbnMhLFxyXG4gICAgICAgIC4uLnN0YWdlQ29uZmlnLFxyXG4gICAgfSk7XHJcbiAgICBjb25zdCBzdGFnZUxhYmVsID0gc3RhZ2VDb25maWcubmFtZTtcclxuICAgIGJ1aWxkU3VjY2VzcyA9IGF3YWl0IGJ1aWxkU3RhZ2VUYXNrLnJ1bigpO1xyXG4gICAgbmV3Q29uc29sZS50cmFja01lbW9yeUVuZChgYnVpbGRlcjpidWlsZC1zdGFnZS10b3RhbCAke3N0YWdlTmFtZX1gKTtcclxuXHJcbiAgICBpZiAoIWJ1aWxkU3RhZ2VUYXNrLmVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFt0YXNrOiR7c3RhZ2VMYWJlbH1dOiBzdWNjZXNzIWApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGAke3N0YWdlTGFiZWx9IHBhY2thZ2UgJHtvcHRpb25zLmRlc3R9IGZhaWxlZCFgKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW3Rhc2s6JHtzdGFnZUxhYmVsfV06IGZhaWxlZCFgKTtcclxuICAgICAgICBidWlsZFN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGJ1aWxkU3RhZ2VUYXNrLmJ1aWxkRXhpdFJlcy5kZXN0ID0gdXRpbHMuUGF0aC5yZXNvbHZlVG9VcmwoYnVpbGRTdGFnZVRhc2suYnVpbGRFeGl0UmVzLmRlc3QsICdwcm9qZWN0Jyk7XHJcbiAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShidWlsZFN0YWdlVGFzay5idWlsZEV4aXRSZXMpKTtcclxuICAgIHJldHVybiBidWlsZFN1Y2Nlc3MgPyBidWlsZFN0YWdlVGFzay5idWlsZEV4aXRSZXMgOiB7IGNvZGU6IEJ1aWxkRXhpdENvZGUuQlVJTERfRkFJTEVELCByZWFzb246ICdCdWlsZCBzdGFnZSB0YXNrIGZhaWxlZCEnIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlYWRCdWlsZFRhc2tPcHRpb25zKHJvb3Q6IHN0cmluZyk6IElCdWlsZFRhc2tPcHRpb248YW55PiB7XHJcbiAgICBjb25zdCBjb25maWdGaWxlID0gam9pbihyb290LCBCdWlsZEdsb2JhbEluZm8uYnVpbGRPcHRpb25zRmlsZU5hbWUpO1xyXG4gICAgcmV0dXJuIHJlYWRKU09OU3luYyhjb25maWdGaWxlKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByZXZpZXdTZXR0aW5nczxQIGV4dGVuZHMgUGxhdGZvcm0+KG9wdGlvbnM/OiBJQnVpbGRUYXNrT3B0aW9uPFA+KTogUHJvbWlzZTxJUHJldmlld1NldHRpbmdzUmVzdWx0PiB7XHJcbiAgICBjb25zdCBidWlsZE9wdGlvbnMgPSBvcHRpb25zIHx8IChhd2FpdCBwbHVnaW5NYW5hZ2VyLmdldE9wdGlvbnNCeVBsYXRmb3JtKCd3ZWItZGVza3RvcCcpKTtcclxuICAgIGJ1aWxkT3B0aW9ucy5wcmV2aWV3ID0gdHJ1ZTtcclxuICAgIC8vIFRPRE8g6aKE6KeIIHNldHRpbmdzIOeahOaOkumYn+S5i+exu+eahFxyXG4gICAgY29uc3QgeyBCdWlsZFRhc2sgfSA9IGF3YWl0IGltcG9ydCgnLi93b3JrZXIvYnVpbGRlci9pbmRleCcpO1xyXG4gICAgY29uc3QgYnVpbGRUYXNrID0gbmV3IEJ1aWxkVGFzayhidWlsZE9wdGlvbnMudGFza0lkIHx8ICd2JywgYnVpbGRPcHRpb25zIGFzIHVua25vd24gYXMgSUJ1aWxkVGFza09wdGlvbjxQbGF0Zm9ybT4pO1xyXG4gICAgY29uc29sZS50aW1lKCdHZXQgc2V0dGluZ3MuanMgaW4gcHJldmlldycpO1xyXG5cclxuICAgIC8vIOaLv+WHuiBzZXR0aW5ncyDkv6Hmga9cclxuICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgYnVpbGRUYXNrLmdldFByZXZpZXdTZXR0aW5ncygpO1xyXG5cclxuICAgIC8vIOaLvOaOpeiEmuacrOWvueW6lOaWh+S7tueahCBtYXBcclxuICAgIGNvbnN0IHNjcmlwdDJsaWJyYXJ5OiB7IFtpbmRleDogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcclxuICAgIGZvciAoY29uc3QgdXVpZCBvZiBidWlsZFRhc2suY2FjaGUuc2NyaXB0VXVpZHMpIHtcclxuICAgICAgICBjb25zdCBhc3NldCA9IGFzc2V0TWFuYWdlci5xdWVyeUFzc2V0KHV1aWQpO1xyXG4gICAgICAgIGlmICghYXNzZXQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcigndW5rbm93biBzY3JpcHQgdXVpZDogJyArIHV1aWQpO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2NyaXB0MmxpYnJhcnlbcmVtb3ZlRGJIZWFkZXIoYXNzZXQudXJsKS5yZXBsYWNlKC8udHMkLywgJy5qcycpXSA9IGFzc2V0LmxpYnJhcnkgKyAnLmpzJztcclxuICAgIH1cclxuICAgIGNvbnNvbGUudGltZUVuZCgnR2V0IHNldHRpbmdzLmpzIGluIHByZXZpZXcnKTtcclxuICAgIC8vIOi/lOWbnuaVsOaNrlxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzZXR0aW5ncyxcclxuICAgICAgICBzY3JpcHQybGlicmFyeSxcclxuICAgICAgICBidW5kbGVDb25maWdzOiBidWlsZFRhc2suYnVuZGxlTWFuYWdlci5idW5kbGVzLm1hcCgoeCkgPT4geC5jb25maWcpLFxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5QnVpbGRDb25maWcoKSB7XHJcbiAgICByZXR1cm4gYnVpbGRlckNvbmZpZy5nZXRQcm9qZWN0PEJ1aWxkQ29uZmlndXJhdGlvbj4oKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHF1ZXJ5RGVmYXVsdEJ1aWxkQ29uZmlnQnlQbGF0Zm9ybShwbGF0Zm9ybTogUGxhdGZvcm0pIHtcclxuICAgIHJldHVybiBhd2FpdCBwbHVnaW5NYW5hZ2VyLmdldE9wdGlvbnNCeVBsYXRmb3JtKHBsYXRmb3JtKTtcclxufSJdfQ==