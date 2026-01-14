"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildStageTask = void 0;
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const sub_process_manager_1 = require("../worker-pools/sub-process-manager");
const task_base_1 = require("./manager/task-base");
const console_1 = require("../../../base/console");
const global_1 = require("../../share/global");
class BuildStageTask extends task_base_1.BuildTaskBase {
    // 从构建包缓存文件内获取到的构建选项信息
    options;
    hooksInfo;
    root;
    hookMap;
    constructor(id, config) {
        super(id, config.name);
        this.hooksInfo = config.hooksInfo;
        this.root = config.root;
        this.options = config.buildTaskOptions;
        // 首字母转为大写后走前后钩子函数流程
        const name = config.name[0].toUpperCase() + config.name.slice(1, config.name.length);
        this.hookMap = {
            [`onBefore${name}`]: `onBefore${name}`,
            [this.name]: this.name,
            [`onAfter${name}`]: `onAfter${name}`,
        };
        this.buildExitRes.dest = config.root;
    }
    async run() {
        const trickTimeLabel = `// ---- builder:run-build-stage-${this.name} ----`;
        console.debug(trickTimeLabel);
        // 为了保障构建 + 编译或者单独编译的情况都有统计到，直接加在此处
        console_1.newConsole.trackTimeStart(trickTimeLabel);
        this.updateProcess('init options success', 0.1);
        try {
            for (const taskName of Object.keys(this.hookMap)) {
                await this.runPluginTask(taskName);
            }
        }
        catch (error) {
            this.error = error;
        }
        await console_1.newConsole.trackTimeEnd(trickTimeLabel, { output: true });
        if (this.error) {
            throw this.error;
        }
        return true;
    }
    break(reason) {
        sub_process_manager_1.workerManager.killRunningChilds();
        super.break(reason);
    }
    async handleHook(func, internal) {
        if (internal) {
            await func.call(this, this.root, this.options);
        }
        else {
            await func(this.root, this.options);
        }
    }
    async saveOptions() {
        await (0, fs_extra_1.outputJSON)((0, path_1.join)(this.root, global_1.BuildGlobalInfo.buildOptionsFileName), this.options);
    }
}
exports.BuildStageTask = BuildStageTask;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhZ2UtdGFzay1tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci93b3JrZXIvYnVpbGRlci9zdGFnZS10YXNrLW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0JBQTRCO0FBQzVCLHVDQUFzQztBQUN0Qyw2RUFBb0U7QUFDcEUsbURBQW9EO0FBQ3BELG1EQUFtRDtBQUduRCwrQ0FBcUQ7QUFRckQsTUFBYSxjQUFlLFNBQVEseUJBQWE7SUFDN0Msc0JBQXNCO0lBQ3RCLE9BQU8sQ0FBbUI7SUFDMUIsU0FBUyxDQUFrQjtJQUNuQixJQUFJLENBQVM7SUFDckIsT0FBTyxDQUF5QjtJQUVoQyxZQUFZLEVBQVUsRUFBRSxNQUF5QjtRQUM3QyxLQUFLLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDbEMsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1FBQ3ZDLG9CQUFvQjtRQUNwQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JGLElBQUksQ0FBQyxPQUFPLEdBQUc7WUFDWCxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUMsRUFBRSxXQUFXLElBQUksRUFBRTtZQUN0QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSTtZQUN0QixDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUMsRUFBRSxVQUFVLElBQUksRUFBRTtTQUN2QyxDQUFDO1FBQ0YsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztJQUN6QyxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUc7UUFDWixNQUFNLGNBQWMsR0FBRyxtQ0FBbUMsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDO1FBQzNFLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDOUIsbUNBQW1DO1FBQ25DLG9CQUFVLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxhQUFhLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFaEQsSUFBSSxDQUFDO1lBQ0QsS0FBSyxNQUFNLFFBQVEsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUMvQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkMsQ0FBQztRQUNMLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFjLENBQUM7UUFDaEMsQ0FBQztRQUNELE1BQU0sb0JBQVUsQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDaEUsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDYixNQUFNLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDckIsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxLQUFLLENBQUMsTUFBYztRQUN2QixtQ0FBYSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDbEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFjLEVBQUUsUUFBaUI7UUFDOUMsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNYLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkQsQ0FBQzthQUFNLENBQUM7WUFDSixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN4QyxDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxXQUFXO1FBQ2IsTUFBTSxJQUFBLHFCQUFVLEVBQUMsSUFBQSxXQUFJLEVBQUMsSUFBSSxDQUFDLElBQUksRUFBRSx3QkFBZSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFGLENBQUM7Q0FDSjtBQTNERCx3Q0EyREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IG91dHB1dEpTT04gfSBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCB7IHdvcmtlck1hbmFnZXIgfSBmcm9tICcuLi93b3JrZXItcG9vbHMvc3ViLXByb2Nlc3MtbWFuYWdlcic7XHJcbmltcG9ydCB7IEJ1aWxkVGFza0Jhc2UgfSBmcm9tICcuL21hbmFnZXIvdGFzay1iYXNlJztcclxuaW1wb3J0IHsgbmV3Q29uc29sZSB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvY29uc29sZSc7XHJcbmltcG9ydCB7IElCdWlsZE9wdGlvbkJhc2UgfSBmcm9tICcuLi8uLi9AdHlwZXMnO1xyXG5pbXBvcnQgeyBJQnVpbGRIb29rc0luZm8sIElCdWlsZFN0YWdlVGFzaywgSUJ1aWxkU3RhZ2VJdGVtIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IEJ1aWxkR2xvYmFsSW5mbyB9IGZyb20gJy4uLy4uL3NoYXJlL2dsb2JhbCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElCdWlsZFN0YWdlQ29uZmlnIGV4dGVuZHMgSUJ1aWxkU3RhZ2VJdGVtIHtcclxuICAgIHJvb3Q6IHN0cmluZztcclxuICAgIGhvb2tzSW5mbzogSUJ1aWxkSG9va3NJbmZvO1xyXG4gICAgYnVpbGRUYXNrT3B0aW9uczogSUJ1aWxkT3B0aW9uQmFzZTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJ1aWxkU3RhZ2VUYXNrIGV4dGVuZHMgQnVpbGRUYXNrQmFzZSBpbXBsZW1lbnRzIElCdWlsZFN0YWdlVGFzayB7XHJcbiAgICAvLyDku47mnoTlu7rljIXnvJPlrZjmlofku7blhoXojrflj5bliLDnmoTmnoTlu7rpgInpobnkv6Hmga9cclxuICAgIG9wdGlvbnM6IElCdWlsZE9wdGlvbkJhc2U7XHJcbiAgICBob29rc0luZm86IElCdWlsZEhvb2tzSW5mbztcclxuICAgIHByaXZhdGUgcm9vdDogc3RyaW5nO1xyXG4gICAgaG9va01hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCBjb25maWc6IElCdWlsZFN0YWdlQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoaWQsIGNvbmZpZy5uYW1lKTtcclxuICAgICAgICB0aGlzLmhvb2tzSW5mbyA9IGNvbmZpZy5ob29rc0luZm87XHJcbiAgICAgICAgdGhpcy5yb290ID0gY29uZmlnLnJvb3Q7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gY29uZmlnLmJ1aWxkVGFza09wdGlvbnM7XHJcbiAgICAgICAgLy8g6aaW5a2X5q+N6L2s5Li65aSn5YaZ5ZCO6LWw5YmN5ZCO6ZKp5a2Q5Ye95pWw5rWB56iLXHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGNvbmZpZy5uYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyBjb25maWcubmFtZS5zbGljZSgxLCBjb25maWcubmFtZS5sZW5ndGgpO1xyXG4gICAgICAgIHRoaXMuaG9va01hcCA9IHtcclxuICAgICAgICAgICAgW2BvbkJlZm9yZSR7bmFtZX1gXTogYG9uQmVmb3JlJHtuYW1lfWAsXHJcbiAgICAgICAgICAgIFt0aGlzLm5hbWVdOiB0aGlzLm5hbWUsXHJcbiAgICAgICAgICAgIFtgb25BZnRlciR7bmFtZX1gXTogYG9uQWZ0ZXIke25hbWV9YCxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuYnVpbGRFeGl0UmVzLmRlc3QgPSBjb25maWcucm9vdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgcnVuKCkge1xyXG4gICAgICAgIGNvbnN0IHRyaWNrVGltZUxhYmVsID0gYC8vIC0tLS0gYnVpbGRlcjpydW4tYnVpbGQtc3RhZ2UtJHt0aGlzLm5hbWV9IC0tLS1gO1xyXG4gICAgICAgIGNvbnNvbGUuZGVidWcodHJpY2tUaW1lTGFiZWwpO1xyXG4gICAgICAgIC8vIOS4uuS6huS/nemanOaehOW7uiArIOe8luivkeaIluiAheWNleeLrOe8luivkeeahOaDheWGtemDveaciee7n+iuoeWIsO+8jOebtOaOpeWKoOWcqOatpOWkhFxyXG4gICAgICAgIG5ld0NvbnNvbGUudHJhY2tUaW1lU3RhcnQodHJpY2tUaW1lTGFiZWwpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlUHJvY2VzcygnaW5pdCBvcHRpb25zIHN1Y2Nlc3MnLCAwLjEpO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRhc2tOYW1lIG9mIE9iamVjdC5rZXlzKHRoaXMuaG9va01hcCkpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucnVuUGx1Z2luVGFzayh0YXNrTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICB0aGlzLmVycm9yID0gZXJyb3IgYXMgRXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IG5ld0NvbnNvbGUudHJhY2tUaW1lRW5kKHRyaWNrVGltZUxhYmVsLCB7IG91dHB1dDogdHJ1ZSB9KTtcclxuICAgICAgICBpZiAodGhpcy5lcnJvcikge1xyXG4gICAgICAgICAgICB0aHJvdyB0aGlzLmVycm9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYnJlYWsocmVhc29uOiBzdHJpbmcpIHtcclxuICAgICAgICB3b3JrZXJNYW5hZ2VyLmtpbGxSdW5uaW5nQ2hpbGRzKCk7XHJcbiAgICAgICAgc3VwZXIuYnJlYWsocmVhc29uKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBoYW5kbGVIb29rKGZ1bmM6IEZ1bmN0aW9uLCBpbnRlcm5hbDogYm9vbGVhbikge1xyXG4gICAgICAgIGlmIChpbnRlcm5hbCkge1xyXG4gICAgICAgICAgICBhd2FpdCBmdW5jLmNhbGwodGhpcywgdGhpcy5yb290LCB0aGlzLm9wdGlvbnMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGF3YWl0IGZ1bmModGhpcy5yb290LCB0aGlzLm9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBzYXZlT3B0aW9ucygpIHtcclxuICAgICAgICBhd2FpdCBvdXRwdXRKU09OKGpvaW4odGhpcy5yb290LCBCdWlsZEdsb2JhbEluZm8uYnVpbGRPcHRpb25zRmlsZU5hbWUpLCB0aGlzLm9wdGlvbnMpO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==