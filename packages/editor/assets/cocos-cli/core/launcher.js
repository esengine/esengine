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
const path_1 = require("path");
const utils_1 = __importDefault(require("./base/utils"));
const console_1 = require("./base/console");
const server_1 = require("../server");
const global_1 = require("../global");
const scripting_1 = __importDefault(require("./scripting"));
const scene_1 = require("./scene");
/**
 * 启动器，主要用于整合各个模块的初始化和关闭流程
 * 默认支持几种启动方式：单独导入项目、单独启动项目、单独构建项目
 */
class Launcher {
    projectPath;
    _init = false;
    _import = false;
    constructor(projectPath) {
        this.projectPath = projectPath;
        // 初始化日志系统
        console_1.newConsole.init((0, path_1.join)(this.projectPath, 'temp', 'logs'), true);
        console_1.newConsole.record();
    }
    async init() {
        if (this._init) {
            return;
        }
        this._init = true;
        /**
         * 初始化一些基础模块信息
         */
        utils_1.default.Path.register('project', {
            label: '项目',
            path: this.projectPath,
        });
        const { configurationManager } = await Promise.resolve().then(() => __importStar(require('./configuration')));
        await configurationManager.initialize(this.projectPath);
        // 初始化项目信息
        const { default: Project } = await Promise.resolve().then(() => __importStar(require('./project')));
        await Project.open(this.projectPath);
        // 初始化引擎
        const { initEngine } = await Promise.resolve().then(() => __importStar(require('./engine')));
        await initEngine(global_1.GlobalPaths.enginePath, this.projectPath);
        console.log('initEngine success');
    }
    /**
     * 导入资源
     */
    async import() {
        if (this._import) {
            return;
        }
        this._import = true;
        await this.init();
        // 在导入资源之前，初始化 scripting 模块，才能正常导入编译脚本
        const { Engine } = await Promise.resolve().then(() => __importStar(require('./engine')));
        await scripting_1.default.initialize(this.projectPath, global_1.GlobalPaths.enginePath, Engine.getConfig().includeModules);
        // 启动以及初始化资源数据库
        const { startupAssetDB } = await Promise.resolve().then(() => __importStar(require('./assets')));
        await startupAssetDB();
    }
    /**
     * 启动项目
     */
    async startup(port) {
        await this.import();
        await (0, server_1.startServer)(port);
        // 初始化构建
        const { init: initBuilder } = await Promise.resolve().then(() => __importStar(require('./builder')));
        await initBuilder();
        // 启动场景进程，需要在 Builder 之后，因为服务器路由场景还没有做前缀约束匹配范围比较广
        await (0, scene_1.startupScene)(global_1.GlobalPaths.enginePath, this.projectPath);
    }
    /**
     * 构建，主要是作为命令行构建的入口
     * @param platform
     * @param options
     */
    async build(platform, options) {
        global_1.GlobalConfig.mode = 'simple';
        // 先导入项目
        await this.import();
        // 执行构建流程
        const { init, build } = await Promise.resolve().then(() => __importStar(require('./builder')));
        await init(platform);
        return await build(platform, options);
    }
    static async make(platform, dest) {
        global_1.GlobalConfig.mode = 'simple';
        const { init, executeBuildStageTask } = await Promise.resolve().then(() => __importStar(require('./builder')));
        await init(platform);
        return await executeBuildStageTask('command make', 'make', {
            platform,
            dest,
        });
    }
    static async run(platform, dest) {
        global_1.GlobalConfig.mode = 'simple';
        const { init, executeBuildStageTask } = await Promise.resolve().then(() => __importStar(require('./builder')));
        if (platform.startsWith('web')) {
            await (0, server_1.startServer)();
        }
        await init(platform);
        return await executeBuildStageTask('command run', 'run', {
            platform,
            dest,
        });
    }
    async close() {
        // 保存项目配置
        const { default: Project } = await Promise.resolve().then(() => __importStar(require('./project')));
        await Project.close();
        // ----- TODO 可能有的更多其他模块的保存销毁操作 ----
    }
}
exports.default = Launcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF1bmNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9sYXVuY2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtCQUE0QjtBQUU1Qix5REFBaUM7QUFDakMsNENBQTRDO0FBRTVDLHNDQUF3QztBQUN4QyxzQ0FBc0Q7QUFDdEQsNERBQW9DO0FBQ3BDLG1DQUF1QztBQUd2Qzs7O0dBR0c7QUFDSCxNQUFxQixRQUFRO0lBQ2pCLFdBQVcsQ0FBUztJQUVwQixLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2QsT0FBTyxHQUFHLEtBQUssQ0FBQztJQUV4QixZQUFZLFdBQW1CO1FBQzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLFVBQVU7UUFDVixvQkFBVSxDQUFDLElBQUksQ0FBQyxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5RCxvQkFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFTyxLQUFLLENBQUMsSUFBSTtRQUNkLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2IsT0FBTztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQjs7V0FFRztRQUNILGVBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRTtZQUMzQixLQUFLLEVBQUUsSUFBSTtZQUNYLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVztTQUN6QixDQUFDLENBQUM7UUFDSCxNQUFNLEVBQUUsb0JBQW9CLEVBQUUsR0FBRyx3REFBYSxpQkFBaUIsR0FBQyxDQUFDO1FBQ2pFLE1BQU0sb0JBQW9CLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN4RCxV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SUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDN0IsTUFBTSxJQUFBLG9CQUFXLEdBQUUsQ0FBQztRQUN4QixDQUFDO1FBQ0QsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckIsT0FBTyxNQUFNLHFCQUFxQixDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUU7WUFDckQsUUFBUTtZQUNSLElBQUk7U0FDUCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUs7UUFDUCxTQUFTO1FBQ1QsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyx3REFBYSxXQUFXLEdBQUMsQ0FBQztRQUN2RCxNQUFNLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QixvQ0FBb0M7SUFDeEMsQ0FBQztDQUNKO0FBOUdELDJCQThHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgSUJ1aWxkQ29tbWFuZE9wdGlvbiwgUGxhdGZvcm0gfSBmcm9tICcuL2J1aWxkZXIvQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuL2Jhc2UvdXRpbHMnO1xyXG5pbXBvcnQgeyBuZXdDb25zb2xlIH0gZnJvbSAnLi9iYXNlL2NvbnNvbGUnO1xyXG5pbXBvcnQgeyBnZXRDdXJyZW50TG9jYWxUaW1lIH0gZnJvbSAnLi9hc3NldHMvdXRpbHMnO1xyXG5pbXBvcnQgeyBzdGFydFNlcnZlciB9IGZyb20gJy4uL3NlcnZlcic7XHJcbmltcG9ydCB7IEdsb2JhbENvbmZpZywgR2xvYmFsUGF0aHMgfSBmcm9tICcuLi9nbG9iYWwnO1xyXG5pbXBvcnQgc2NyaXB0aW5nIGZyb20gJy4vc2NyaXB0aW5nJztcclxuaW1wb3J0IHsgc3RhcnR1cFNjZW5lIH0gZnJvbSAnLi9zY2VuZSc7XHJcblxyXG5cclxuLyoqXHJcbiAqIOWQr+WKqOWZqO+8jOS4u+imgeeUqOS6juaVtOWQiOWQhOS4quaooeWdl+eahOWIneWni+WMluWSjOWFs+mXrea1geeoi1xyXG4gKiDpu5jorqTmlK/mjIHlh6Dnp43lkK/liqjmlrnlvI/vvJrljZXni6zlr7zlhaXpobnnm67jgIHljZXni6zlkK/liqjpobnnm67jgIHljZXni6zmnoTlu7rpobnnm65cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExhdW5jaGVyIHtcclxuICAgIHByaXZhdGUgcHJvamVjdFBhdGg6IHN0cmluZztcclxuXHJcbiAgICBwcml2YXRlIF9pbml0ID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF9pbXBvcnQgPSBmYWxzZTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcm9qZWN0UGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5wcm9qZWN0UGF0aCA9IHByb2plY3RQYXRoO1xyXG4gICAgICAgIC8vIOWIneWni+WMluaXpeW/l+ezu+e7n1xyXG4gICAgICAgIG5ld0NvbnNvbGUuaW5pdChqb2luKHRoaXMucHJvamVjdFBhdGgsICd0ZW1wJywgJ2xvZ3MnKSwgdHJ1ZSk7XHJcbiAgICAgICAgbmV3Q29uc29sZS5yZWNvcmQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIGluaXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pbml0ID0gdHJ1ZTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDliJ3lp4vljJbkuIDkupvln7rnoYDmqKHlnZfkv6Hmga9cclxuICAgICAgICAgKi9cclxuICAgICAgICB1dGlscy5QYXRoLnJlZ2lzdGVyKCdwcm9qZWN0Jywge1xyXG4gICAgICAgICAgICBsYWJlbDogJ+mhueebricsXHJcbiAgICAgICAgICAgIHBhdGg6IHRoaXMucHJvamVjdFBhdGgsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgeyBjb25maWd1cmF0aW9uTWFuYWdlciB9ID0gYXdhaXQgaW1wb3J0KCcuL2NvbmZpZ3VyYXRpb24nKTtcclxuICAgICAgICBhd2FpdCBjb25maWd1cmF0aW9uTWFuYWdlci5pbml0aWFsaXplKHRoaXMucHJvamVjdFBhdGgpO1xyXG4gICAgICAgIC8vIOWIneWni+WMlumhueebruS/oeaBr1xyXG4gICAgICAgIGNvbnN0IHsgZGVmYXVsdDogUHJvamVjdCB9ID0gYXdhaXQgaW1wb3J0KCcuL3Byb2plY3QnKTtcclxuICAgICAgICBhd2FpdCBQcm9qZWN0Lm9wZW4odGhpcy5wcm9qZWN0UGF0aCk7XHJcbiAgICAgICAgLy8g5Yid5aeL5YyW5byV5pOOXHJcbiAgICAgICAgY29uc3QgeyBpbml0RW5naW5lIH0gPSBhd2FpdCBpbXBvcnQoJy4vZW5naW5lJyk7XHJcbiAgICAgICAgYXdhaXQgaW5pdEVuZ2luZShHbG9iYWxQYXRocy5lbmdpbmVQYXRoLCB0aGlzLnByb2plY3RQYXRoKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnaW5pdEVuZ2luZSBzdWNjZXNzJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlr7zlhaXotYTmupBcclxuICAgICAqL1xyXG4gICAgYXN5bmMgaW1wb3J0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbXBvcnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pbXBvcnQgPSB0cnVlO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIC8vIOWcqOWvvOWFpei1hOa6kOS5i+WJje+8jOWIneWni+WMliBzY3JpcHRpbmcg5qih5Z2X77yM5omN6IO95q2j5bi45a+85YWl57yW6K+R6ISa5pysXHJcbiAgICAgICAgY29uc3QgeyBFbmdpbmUgfSA9IGF3YWl0IGltcG9ydCgnLi9lbmdpbmUnKTtcclxuICAgICAgICBhd2FpdCBzY3JpcHRpbmcuaW5pdGlhbGl6ZSh0aGlzLnByb2plY3RQYXRoLCBHbG9iYWxQYXRocy5lbmdpbmVQYXRoLCBFbmdpbmUuZ2V0Q29uZmlnKCkuaW5jbHVkZU1vZHVsZXMpO1xyXG4gICAgICAgIC8vIOWQr+WKqOS7peWPiuWIneWni+WMlui1hOa6kOaVsOaNruW6k1xyXG4gICAgICAgIGNvbnN0IHsgc3RhcnR1cEFzc2V0REIgfSA9IGF3YWl0IGltcG9ydCgnLi9hc3NldHMnKTtcclxuICAgICAgICBhd2FpdCBzdGFydHVwQXNzZXREQigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5ZCv5Yqo6aG555uuXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHN0YXJ0dXAocG9ydD86IG51bWJlcikge1xyXG4gICAgICAgIGF3YWl0IHRoaXMuaW1wb3J0KCk7XHJcbiAgICAgICAgYXdhaXQgc3RhcnRTZXJ2ZXIocG9ydCk7XHJcbiAgICAgICAgLy8g5Yid5aeL5YyW5p6E5bu6XHJcbiAgICAgICAgY29uc3QgeyBpbml0OiBpbml0QnVpbGRlciB9ID0gYXdhaXQgaW1wb3J0KCcuL2J1aWxkZXInKTtcclxuICAgICAgICBhd2FpdCBpbml0QnVpbGRlcigpO1xyXG4gICAgICAgIC8vIOWQr+WKqOWcuuaZr+i/m+eoi++8jOmcgOimgeWcqCBCdWlsZGVyIOS5i+WQju+8jOWboOS4uuacjeWKoeWZqOi3r+eUseWcuuaZr+i/mOayoeacieWBmuWJjee8gOe6puadn+WMuemFjeiMg+WbtOavlOi+g+W5v1xyXG4gICAgICAgIGF3YWl0IHN0YXJ0dXBTY2VuZShHbG9iYWxQYXRocy5lbmdpbmVQYXRoLCB0aGlzLnByb2plY3RQYXRoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaehOW7uu+8jOS4u+imgeaYr+S9nOS4uuWRveS7pOihjOaehOW7uueahOWFpeWPo1xyXG4gICAgICogQHBhcmFtIHBsYXRmb3JtXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBhc3luYyBidWlsZChwbGF0Zm9ybTogUGxhdGZvcm0sIG9wdGlvbnM6IFBhcnRpYWw8SUJ1aWxkQ29tbWFuZE9wdGlvbj4pIHtcclxuICAgICAgICBHbG9iYWxDb25maWcubW9kZSA9ICdzaW1wbGUnO1xyXG4gICAgICAgIC8vIOWFiOWvvOWFpemhueebrlxyXG4gICAgICAgIGF3YWl0IHRoaXMuaW1wb3J0KCk7XHJcbiAgICAgICAgLy8g5omn6KGM5p6E5bu65rWB56iLXHJcbiAgICAgICAgY29uc3QgeyBpbml0LCBidWlsZCB9ID0gYXdhaXQgaW1wb3J0KCcuL2J1aWxkZXInKTtcclxuICAgICAgICBhd2FpdCBpbml0KHBsYXRmb3JtKTtcclxuICAgICAgICByZXR1cm4gYXdhaXQgYnVpbGQocGxhdGZvcm0sIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBtYWtlKHBsYXRmb3JtOiBQbGF0Zm9ybSwgZGVzdDogc3RyaW5nKSB7XHJcbiAgICAgICAgR2xvYmFsQ29uZmlnLm1vZGUgPSAnc2ltcGxlJztcclxuICAgICAgICBjb25zdCB7IGluaXQsIGV4ZWN1dGVCdWlsZFN0YWdlVGFzayB9ID0gYXdhaXQgaW1wb3J0KCcuL2J1aWxkZXInKTtcclxuICAgICAgICBhd2FpdCBpbml0KHBsYXRmb3JtKTtcclxuICAgICAgICByZXR1cm4gYXdhaXQgZXhlY3V0ZUJ1aWxkU3RhZ2VUYXNrKCdjb21tYW5kIG1ha2UnLCAnbWFrZScsIHtcclxuICAgICAgICAgICAgcGxhdGZvcm0sXHJcbiAgICAgICAgICAgIGRlc3QsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIHJ1bihwbGF0Zm9ybTogUGxhdGZvcm0sIGRlc3Q6IHN0cmluZykge1xyXG4gICAgICAgIEdsb2JhbENvbmZpZy5tb2RlID0gJ3NpbXBsZSc7XHJcbiAgICAgICAgY29uc3QgeyBpbml0LCBleGVjdXRlQnVpbGRTdGFnZVRhc2sgfSA9IGF3YWl0IGltcG9ydCgnLi9idWlsZGVyJyk7XHJcbiAgICAgICAgaWYgKHBsYXRmb3JtLnN0YXJ0c1dpdGgoJ3dlYicpKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHN0YXJ0U2VydmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IGluaXQocGxhdGZvcm0pO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBleGVjdXRlQnVpbGRTdGFnZVRhc2soJ2NvbW1hbmQgcnVuJywgJ3J1bicsIHtcclxuICAgICAgICAgICAgcGxhdGZvcm0sXHJcbiAgICAgICAgICAgIGRlc3QsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgY2xvc2UoKSB7XHJcbiAgICAgICAgLy8g5L+d5a2Y6aG555uu6YWN572uXHJcbiAgICAgICAgY29uc3QgeyBkZWZhdWx0OiBQcm9qZWN0IH0gPSBhd2FpdCBpbXBvcnQoJy4vcHJvamVjdCcpO1xyXG4gICAgICAgIGF3YWl0IFByb2plY3QuY2xvc2UoKTtcclxuICAgICAgICAvLyAtLS0tLSBUT0RPIOWPr+iDveacieeahOabtOWkmuWFtuS7luaooeWdl+eahOS/neWtmOmUgOavgeaTjeS9nCAtLS0tXHJcbiAgICB9XHJcbn0iXX0=