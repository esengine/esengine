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
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectManager = void 0;
/**
 * 项目管理器，提供打开项目、创建项目的入口
 */
class ProjectManager {
    _currentLauncher = null;
    /**
     * 查询所有项目模板，用于创建的命令行选项显示
     * @returns
     */
    queryTemplates() {
        // TODO
    }
    /**
     * 创建一个项目
     * @param projectPath
     * @param type
     * @returns
     */
    async create(projectPath, type = '3d', template) {
        const { Project } = await Promise.resolve().then(() => __importStar(require('./project/script')));
        // TODO 支持模板后，Project 模块，无需支持空项目的创建了，都由管理器拷贝模板
        return await Project.create(projectPath, type);
    }
    /**
     * 打开某个项目
     * @param path
     */
    async open(path) {
        const { default: Launcher } = await Promise.resolve().then(() => __importStar(require('./launcher')));
        const projectLauncher = new Launcher(path);
        await projectLauncher.startup();
    }
    async close() {
        if (!this._currentLauncher) {
            throw new Error('No project is open');
        }
        await this._currentLauncher.close();
        this._currentLauncher = null;
    }
}
exports.projectManager = new ProjectManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdC1tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvcmUvcHJvamVjdC1tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBOztHQUVHO0FBQ0gsTUFBTSxjQUFjO0lBRVIsZ0JBQWdCLEdBQW9CLElBQUksQ0FBQztJQUVqRDs7O09BR0c7SUFDSCxjQUFjO1FBQ1YsT0FBTztJQUNYLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBbUIsRUFBRSxPQUFvQixJQUFJLEVBQUUsUUFBaUI7UUFDekUsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLHdEQUFhLGtCQUFrQixHQUFDLENBQUM7UUFDckQsOENBQThDO1FBQzlDLE9BQU8sTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFZO1FBQ25CLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsd0RBQWEsWUFBWSxHQUFDLENBQUM7UUFDekQsTUFBTSxlQUFlLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsTUFBTSxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLO1FBQ1AsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBQ0QsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztJQUNqQyxDQUFDO0NBQ0o7QUFFWSxRQUFBLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgTGF1bmNoZXIgZnJvbSAnLi9sYXVuY2hlcic7XHJcbmltcG9ydCB7IFByb2plY3RUeXBlIH0gZnJvbSAnLi9wcm9qZWN0L0B0eXBlcy9wdWJsaWMnO1xyXG5cclxuLyoqXHJcbiAqIOmhueebrueuoeeQhuWZqO+8jOaPkOS+m+aJk+W8gOmhueebruOAgeWIm+W7uumhueebrueahOWFpeWPo1xyXG4gKi9cclxuY2xhc3MgUHJvamVjdE1hbmFnZXIge1xyXG5cclxuICAgIHByaXZhdGUgX2N1cnJlbnRMYXVuY2hlcjogTGF1bmNoZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOafpeivouaJgOaciemhueebruaooeadv++8jOeUqOS6juWIm+W7uueahOWRveS7pOihjOmAiemhueaYvuekulxyXG4gICAgICogQHJldHVybnMgXHJcbiAgICAgKi9cclxuICAgIHF1ZXJ5VGVtcGxhdGVzKCkge1xyXG4gICAgICAgIC8vIFRPRE9cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuS4gOS4qumhueebrlxyXG4gICAgICogQHBhcmFtIHByb2plY3RQYXRoIFxyXG4gICAgICogQHBhcmFtIHR5cGUgXHJcbiAgICAgKiBAcmV0dXJucyBcclxuICAgICAqL1xyXG4gICAgYXN5bmMgY3JlYXRlKHByb2plY3RQYXRoOiBzdHJpbmcsIHR5cGU6IFByb2plY3RUeXBlID0gJzNkJywgdGVtcGxhdGU/OiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCB7IFByb2plY3QgfSA9IGF3YWl0IGltcG9ydCgnLi9wcm9qZWN0L3NjcmlwdCcpO1xyXG4gICAgICAgIC8vIFRPRE8g5pSv5oyB5qih5p2/5ZCO77yMUHJvamVjdCDmqKHlnZfvvIzml6DpnIDmlK/mjIHnqbrpobnnm67nmoTliJvlu7rkuobvvIzpg73nlLHnrqHnkIblmajmi7fotJ3mqKHmnb9cclxuICAgICAgICByZXR1cm4gYXdhaXQgUHJvamVjdC5jcmVhdGUocHJvamVjdFBhdGgsIHR5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5omT5byA5p+Q5Liq6aG555uuXHJcbiAgICAgKiBAcGFyYW0gcGF0aFxyXG4gICAgICovXHJcbiAgICBhc3luYyBvcGVuKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHsgZGVmYXVsdDogTGF1bmNoZXIgfSA9IGF3YWl0IGltcG9ydCgnLi9sYXVuY2hlcicpO1xyXG4gICAgICAgIGNvbnN0IHByb2plY3RMYXVuY2hlciA9IG5ldyBMYXVuY2hlcihwYXRoKTtcclxuICAgICAgICBhd2FpdCBwcm9qZWN0TGF1bmNoZXIuc3RhcnR1cCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGNsb3NlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fY3VycmVudExhdW5jaGVyKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gcHJvamVjdCBpcyBvcGVuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IHRoaXMuX2N1cnJlbnRMYXVuY2hlci5jbG9zZSgpO1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnRMYXVuY2hlciA9IG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBwcm9qZWN0TWFuYWdlciA9IG5ldyBQcm9qZWN0TWFuYWdlcigpO1xyXG4iXX0=