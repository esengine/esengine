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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.sceneConfigInstance = void 0;
exports.startupScene = startupScene;
const scene_configs_1 = require("./scene-configs");
Object.defineProperty(exports, "sceneConfigInstance", { enumerable: true, get: function () { return scene_configs_1.sceneConfigInstance; } });
// 接口类型
__exportStar(require("./common"), exports);
// 主进程
__exportStar(require("./main-process"), exports);
const core_1 = require("../../server/middleware/core");
const scene_middleware_1 = __importDefault(require("./scene.middleware"));
/**
 * 启动场景
 * @param enginePath 引擎目录
 * @param projectPath 项目目录
 */
async function startupScene(enginePath, projectPath) {
    core_1.middlewareService.register('Scene', scene_middleware_1.default);
    // 场景配置初始化
    await scene_configs_1.sceneConfigInstance.init();
    // 启动场景进程
    const { sceneWorker } = await Promise.resolve().then(() => __importStar(require('./main-process/scene-worker')));
    await sceneWorker.start(enginePath, projectPath);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9zY2VuZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlQSxvQ0FPQztBQXRCRCxtREFBc0Q7QUFLN0Msb0dBTEEsbUNBQW1CLE9BS0E7QUFKNUIsT0FBTztBQUNQLDJDQUF5QjtBQUN6QixNQUFNO0FBQ04saURBQStCO0FBRy9CLHVEQUFpRTtBQUNqRSwwRUFBaUQ7QUFFakQ7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxZQUFZLENBQUMsVUFBa0IsRUFBRSxXQUFtQjtJQUN0RSx3QkFBaUIsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLDBCQUFlLENBQUMsQ0FBQztJQUNyRCxVQUFVO0lBQ1YsTUFBTSxtQ0FBbUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNqQyxTQUFTO0lBQ1QsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLHdEQUFhLDZCQUE2QixHQUFDLENBQUM7SUFDcEUsTUFBTSxXQUFXLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUNyRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc2NlbmVDb25maWdJbnN0YW5jZSB9IGZyb20gJy4vc2NlbmUtY29uZmlncyc7XHJcbi8vIOaOpeWPo+exu+Wei1xyXG5leHBvcnQgKiBmcm9tICcuL2NvbW1vbic7XHJcbi8vIOS4u+i/m+eoi1xyXG5leHBvcnQgKiBmcm9tICcuL21haW4tcHJvY2Vzcyc7XHJcbmV4cG9ydCB7IHNjZW5lQ29uZmlnSW5zdGFuY2UgfTtcclxuXHJcbmltcG9ydCB7IG1pZGRsZXdhcmVTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmVyL21pZGRsZXdhcmUvY29yZSc7XHJcbmltcG9ydCBTY2VuZU1pZGRsZXdhcmUgZnJvbSAnLi9zY2VuZS5taWRkbGV3YXJlJztcclxuXHJcbi8qKlxyXG4gKiDlkK/liqjlnLrmma9cclxuICogQHBhcmFtIGVuZ2luZVBhdGgg5byV5pOO55uu5b2VXHJcbiAqIEBwYXJhbSBwcm9qZWN0UGF0aCDpobnnm67nm67lvZVcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydHVwU2NlbmUoZW5naW5lUGF0aDogc3RyaW5nLCBwcm9qZWN0UGF0aDogc3RyaW5nKSB7XHJcbiAgICBtaWRkbGV3YXJlU2VydmljZS5yZWdpc3RlcignU2NlbmUnLCBTY2VuZU1pZGRsZXdhcmUpO1xyXG4gICAgLy8g5Zy65pmv6YWN572u5Yid5aeL5YyWXHJcbiAgICBhd2FpdCBzY2VuZUNvbmZpZ0luc3RhbmNlLmluaXQoKTtcclxuICAgIC8vIOWQr+WKqOWcuuaZr+i/m+eoi1xyXG4gICAgY29uc3QgeyBzY2VuZVdvcmtlciB9ID0gYXdhaXQgaW1wb3J0KCcuL21haW4tcHJvY2Vzcy9zY2VuZS13b3JrZXInKTtcclxuICAgIGF3YWl0IHNjZW5lV29ya2VyLnN0YXJ0KGVuZ2luZVBhdGgsIHByb2plY3RQYXRoKTtcclxufVxyXG4iXX0=