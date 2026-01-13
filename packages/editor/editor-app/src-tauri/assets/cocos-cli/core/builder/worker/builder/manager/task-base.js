"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildTaskBase = void 0;
const events_1 = __importDefault(require("events"));
const console_1 = require("../../../../base/console");
const utils_1 = __importDefault(require("../../../../base/utils"));
const i18n_1 = __importDefault(require("../../../../base/i18n"));
class BuildTaskBase extends events_1.default {
    // break 原因
    breakReason;
    name;
    progress = 0;
    error;
    hookWeight = 0.4;
    id;
    buildExitRes = {
        code: 0 /* BuildExitCode.BUILD_SUCCESS */,
        dest: '',
        custom: {},
    };
    constructor(id, name) {
        super();
        this.name = name;
        this.id = id;
    }
    break(reason) {
        this.breakReason = reason;
        this.error = new Error('task is break by reason: ' + reason + '!');
    }
    onError(error, throwError = true) {
        this.error = error;
        if (throwError) {
            throw error;
        }
    }
    /**
     * 更新进度消息 log
     * @param message
     * @param increment
     * @param outputType
     */
    updateProcess(message, increment = 0, outputType = 'debug') {
        increment && (this.progress = utils_1.default.Math.clamp01(this.progress + increment));
        this.emit('update', message, this.progress);
        const percentage = Math.round(this.progress * 100);
        const progressMessage = `${message} (${percentage}%)`;
        console_1.newConsole[outputType](progressMessage);
    }
    async runPluginTask(funcName, weight) {
        // 预览 settings 不执行任何构建的钩子函数
        if (!Object.keys(this.hookMap).length || this.error || this.options?.preview) {
            return;
        }
        const increment = this.hookWeight / Object.keys(this.hookMap).length;
        for (let i = 0; i < this.hooksInfo.pkgNameOrder.length; i++) {
            if (this.error) {
                this.onError(this.error);
                return;
            }
            const pkgName = this.hooksInfo.pkgNameOrder[i];
            const info = this.hooksInfo.infos[pkgName];
            let hooks;
            try {
                const trickTimeLabel = `// ---- build task ${pkgName}：${funcName} ----`;
                console_1.newConsole.trackTimeStart(trickTimeLabel);
                hooks = utils_1.default.File.requireFile(info.path);
                if (hooks[funcName]) {
                    // 使用新的 console 方法显示插件任务开始
                    console_1.newConsole.pluginTask(pkgName, funcName, 'start');
                    console.debug(trickTimeLabel);
                    await this.handleHook(hooks[funcName], info.internal);
                    const time = console_1.newConsole.trackTimeEnd(trickTimeLabel, { output: true });
                    // 使用新的 console 方法显示插件任务完成
                    console_1.newConsole.pluginTask(pkgName, funcName, 'complete', `${time}ms`);
                    this.updateProcess(`${pkgName}:${funcName} completed ✓`, increment, 'success');
                }
            }
            catch (error) {
                const errorMsg = i18n_1.default.t('builder.error.run_hooks_failed', {
                    pkgName,
                    funcName,
                });
                // 使用新的 console 方法显示插件任务错误
                console_1.newConsole.pluginTask(pkgName, funcName, 'error');
                this.updateProcess(errorMsg, increment, 'error');
                this.updateProcess(String(error), increment, 'error');
                if (hooks && hooks.throwError || info.internal) {
                    this.onError(error);
                }
            }
        }
    }
}
exports.BuildTaskBase = BuildTaskBase;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci93b3JrZXIvYnVpbGRlci9tYW5hZ2VyL3Rhc2stYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxvREFBa0M7QUFDbEMsc0RBQXNEO0FBR3RELG1FQUEyQztBQUMzQyxpRUFBeUM7QUFFekMsTUFBc0IsYUFBYyxTQUFRLGdCQUFZO0lBQ3BELFdBQVc7SUFDSixXQUFXLENBQVU7SUFDckIsSUFBSSxDQUFTO0lBQ2IsUUFBUSxHQUFHLENBQUMsQ0FBQztJQUNiLEtBQUssQ0FBUztJQUlkLFVBQVUsR0FBRyxHQUFHLENBQUM7SUFDakIsRUFBRSxDQUFTO0lBQ1gsWUFBWSxHQUF3QjtRQUN2QyxJQUFJLHFDQUE2QjtRQUNqQyxJQUFJLEVBQUUsRUFBRTtRQUNSLE1BQU0sRUFBRSxFQUFFO0tBQ2IsQ0FBQztJQUVGLFlBQVksRUFBVSxFQUFFLElBQVk7UUFDaEMsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRU0sS0FBSyxDQUFDLE1BQWM7UUFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7UUFDMUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQywyQkFBMkIsR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELE9BQU8sQ0FBQyxLQUFZLEVBQUUsVUFBVSxHQUFHLElBQUk7UUFDbkMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUNiLE1BQU0sS0FBSyxDQUFDO1FBQ2hCLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxhQUFhLENBQUMsT0FB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QUUsQ0FBQztnQkFDYixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsQ0FBQyxDQUFDLGdDQUFnQyxFQUFFO29CQUN0RCxPQUFPO29CQUNQLFFBQVE7aUJBQ1gsQ0FBQyxDQUFDO2dCQUNILDBCQUEwQjtnQkFDMUIsb0JBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3RELElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUM3QyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQWMsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0NBQ0o7QUFoR0Qsc0NBZ0dDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xyXG5pbXBvcnQgeyBuZXdDb25zb2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vYmFzZS9jb25zb2xlJztcclxuaW1wb3J0IHsgSUJ1aWxkT3B0aW9uQmFzZSwgSUNvbnNvbGVUeXBlIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzJztcclxuaW1wb3J0IHsgQnVpbGRFeGl0Q29kZSwgSUJ1aWxkSG9va3NJbmZvLCBJQnVpbGRSZXN1bHRTdWNjZXNzIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9iYXNlL3V0aWxzJztcclxuaW1wb3J0IGkxOG4gZnJvbSAnLi4vLi4vLi4vLi4vYmFzZS9pMThuJztcclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCdWlsZFRhc2tCYXNlIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuICAgIC8vIGJyZWFrIOWOn+WboFxyXG4gICAgcHVibGljIGJyZWFrUmVhc29uPzogc3RyaW5nO1xyXG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcclxuICAgIHB1YmxpYyBwcm9ncmVzcyA9IDA7XHJcbiAgICBwdWJsaWMgZXJyb3I/OiBFcnJvcjtcclxuICAgIHB1YmxpYyBhYnN0cmFjdCBob29rc0luZm86IElCdWlsZEhvb2tzSW5mbztcclxuICAgIHB1YmxpYyBhYnN0cmFjdCBvcHRpb25zOiBJQnVpbGRPcHRpb25CYXNlO1xyXG4gICAgcHVibGljIGFic3RyYWN0IGhvb2tNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XHJcbiAgICBwdWJsaWMgaG9va1dlaWdodCA9IDAuNDtcclxuICAgIHB1YmxpYyBpZDogc3RyaW5nO1xyXG4gICAgcHVibGljIGJ1aWxkRXhpdFJlczogSUJ1aWxkUmVzdWx0U3VjY2VzcyA9IHtcclxuICAgICAgICBjb2RlOiBCdWlsZEV4aXRDb2RlLkJVSUxEX1NVQ0NFU1MsXHJcbiAgICAgICAgZGVzdDogJycsXHJcbiAgICAgICAgY3VzdG9tOiB7fSxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYnJlYWsocmVhc29uOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmJyZWFrUmVhc29uID0gcmVhc29uO1xyXG4gICAgICAgIHRoaXMuZXJyb3IgPSBuZXcgRXJyb3IoJ3Rhc2sgaXMgYnJlYWsgYnkgcmVhc29uOiAnICsgcmVhc29uICsgJyEnKTtcclxuICAgIH1cclxuXHJcbiAgICBvbkVycm9yKGVycm9yOiBFcnJvciwgdGhyb3dFcnJvciA9IHRydWUpIHtcclxuICAgICAgICB0aGlzLmVycm9yID0gZXJyb3I7XHJcbiAgICAgICAgaWYgKHRocm93RXJyb3IpIHtcclxuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pu05paw6L+b5bqm5raI5oGvIGxvZ1xyXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgXHJcbiAgICAgKiBAcGFyYW0gaW5jcmVtZW50IFxyXG4gICAgICogQHBhcmFtIG91dHB1dFR5cGUgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB1cGRhdGVQcm9jZXNzKG1lc3NhZ2U6IHN0cmluZywgaW5jcmVtZW50ID0gMCwgb3V0cHV0VHlwZTogSUNvbnNvbGVUeXBlID0gJ2RlYnVnJykge1xyXG4gICAgICAgIGluY3JlbWVudCAmJiAodGhpcy5wcm9ncmVzcyA9IFV0aWxzLk1hdGguY2xhbXAwMSh0aGlzLnByb2dyZXNzICsgaW5jcmVtZW50KSk7XHJcbiAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCBtZXNzYWdlLCB0aGlzLnByb2dyZXNzKTtcclxuXHJcbiAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IE1hdGgucm91bmQodGhpcy5wcm9ncmVzcyAqIDEwMCk7XHJcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3NNZXNzYWdlID0gYCR7bWVzc2FnZX0gKCR7cGVyY2VudGFnZX0lKWA7XHJcbiAgICAgICAgbmV3Q29uc29sZVtvdXRwdXRUeXBlXShwcm9ncmVzc01lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGFic3RyYWN0IGhhbmRsZUhvb2soZnVuYzogRnVuY3Rpb24sIGludGVybmFsOiBib29sZWFuLCAuLi5hcmdzOiBhbnlbXSk6IFByb21pc2U8dm9pZD47XHJcbiAgICBhYnN0cmFjdCBydW4oKTogUHJvbWlzZTxib29sZWFuPjtcclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgcnVuUGx1Z2luVGFzayhmdW5jTmFtZTogc3RyaW5nLCB3ZWlnaHQ/OiBudW1iZXIpIHtcclxuICAgICAgICAvLyDpooTop4ggc2V0dGluZ3Mg5LiN5omn6KGM5Lu75L2V5p6E5bu655qE6ZKp5a2Q5Ye95pWwXHJcbiAgICAgICAgaWYgKCFPYmplY3Qua2V5cyh0aGlzLmhvb2tNYXApLmxlbmd0aCB8fCB0aGlzLmVycm9yIHx8IHRoaXMub3B0aW9ucz8ucHJldmlldykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGluY3JlbWVudCA9IHRoaXMuaG9va1dlaWdodCAvIE9iamVjdC5rZXlzKHRoaXMuaG9va01hcCkubGVuZ3RoO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ob29rc0luZm8ucGtnTmFtZU9yZGVyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IodGhpcy5lcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcGtnTmFtZSA9IHRoaXMuaG9va3NJbmZvLnBrZ05hbWVPcmRlcltpXTtcclxuICAgICAgICAgICAgY29uc3QgaW5mbyA9IHRoaXMuaG9va3NJbmZvLmluZm9zW3BrZ05hbWVdO1xyXG4gICAgICAgICAgICBsZXQgaG9va3M6IGFueTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRyaWNrVGltZUxhYmVsID0gYC8vIC0tLS0gYnVpbGQgdGFzayAke3BrZ05hbWV977yaJHtmdW5jTmFtZX0gLS0tLWA7XHJcbiAgICAgICAgICAgICAgICBuZXdDb25zb2xlLnRyYWNrVGltZVN0YXJ0KHRyaWNrVGltZUxhYmVsKTtcclxuICAgICAgICAgICAgICAgIGhvb2tzID0gVXRpbHMuRmlsZS5yZXF1aXJlRmlsZShpbmZvLnBhdGgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGhvb2tzW2Z1bmNOYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOS9v+eUqOaWsOeahCBjb25zb2xlIOaWueazleaYvuekuuaPkuS7tuS7u+WKoeW8gOWni1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0NvbnNvbGUucGx1Z2luVGFzayhwa2dOYW1lLCBmdW5jTmFtZSwgJ3N0YXJ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1Zyh0cmlja1RpbWVMYWJlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVIb29rKGhvb2tzW2Z1bmNOYW1lXSwgaW5mby5pbnRlcm5hbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGltZSA9IG5ld0NvbnNvbGUudHJhY2tUaW1lRW5kKHRyaWNrVGltZUxhYmVsLCB7IG91dHB1dDogdHJ1ZSB9KTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDkvb/nlKjmlrDnmoQgY29uc29sZSDmlrnms5XmmL7npLrmj5Lku7bku7vliqHlrozmiJBcclxuICAgICAgICAgICAgICAgICAgICBuZXdDb25zb2xlLnBsdWdpblRhc2socGtnTmFtZSwgZnVuY05hbWUsICdjb21wbGV0ZScsIGAke3RpbWV9bXNgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVByb2Nlc3MoYCR7cGtnTmFtZX06JHtmdW5jTmFtZX0gY29tcGxldGVkIOKck2AsIGluY3JlbWVudCwgJ3N1Y2Nlc3MnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gaTE4bi50KCdidWlsZGVyLmVycm9yLnJ1bl9ob29rc19mYWlsZWQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGtnTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jTmFtZSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8g5L2/55So5paw55qEIGNvbnNvbGUg5pa55rOV5pi+56S65o+S5Lu25Lu75Yqh6ZSZ6K+vXHJcbiAgICAgICAgICAgICAgICBuZXdDb25zb2xlLnBsdWdpblRhc2socGtnTmFtZSwgZnVuY05hbWUsICdlcnJvcicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQcm9jZXNzKGVycm9yTXNnLCBpbmNyZW1lbnQsICdlcnJvcicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQcm9jZXNzKFN0cmluZyhlcnJvciksIGluY3JlbWVudCwgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaG9va3MgJiYgaG9va3MudGhyb3dFcnJvciB8fCBpbmZvLmludGVybmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKGVycm9yIGFzIEVycm9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==