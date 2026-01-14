"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskManager = void 0;
class TaskManager {
    static tasks = {
        dataTasks: [
            'data-task/asset',
            'data-task/script',
        ],
        // 注意先后顺序，不可随意调整，具体参考XXX（TODO）
        buildTasks: [
            // 资源处理，先脚本，后资源，资源包含 Bundle
            'build-task/script',
            'build-task/asset',
        ],
        md5Tasks: [
            // 项目处理
            'postprocess-task/suffix', // TODO 需要允许用户在 md5 注入之前修改内容
        ],
        settingTasks: [
            'setting-task/asset',
            'setting-task/script',
            'setting-task/options',
        ],
        postprocessTasks: [
            'postprocess-task/template',
        ],
    };
    static pluginTasks = {
        onBeforeBuild: 'onBeforeBuild',
        onBeforeInit: 'onBeforeInit',
        onAfterInit: 'onAfterInit',
        onBeforeBuildAssets: 'onBeforeBuildAssets',
        onAfterBuildAssets: 'onAfterBuildAssets',
        onBeforeCompressSettings: 'onBeforeCompressSettings',
        onAfterCompressSettings: 'onAfterCompressSettings',
        onAfterBuild: 'onAfterBuild',
        onBeforeCopyBuildTemplate: 'onBeforeCopyBuildTemplate',
        onAfterCopyBuildTemplate: 'onAfterCopyBuildTemplate',
        onError: 'onError',
    };
    static buildTaskMap = {
        dataTasks: [],
        settingTasks: [],
        buildTasks: [],
        md5Tasks: [],
        postprocessTasks: [],
    };
    activeTasks = new Set();
    get taskWeight() {
        return 1 / this.activeTasks.size;
    }
    // 获取某一类资源任务
    static getBuildTask(type) {
        if (!this.buildTaskMap[type]) {
            return this.buildTaskMap[type];
        }
        return this.buildTaskMap[type] = TaskManager.tasks[type].map((name) => require(`./tasks/${name}`));
    }
    static getTaskHandleFromNames(taskNames) {
        return taskNames.map((name) => require(`./tasks/${name}`));
    }
    static getCustomTaskName(name) {
        return 'custom-task' + name;
    }
    activeTask(type) {
        this.activeTasks.add(type);
        return TaskManager.getBuildTask(type);
    }
    activeCustomTask(name, taskNames) {
        const type = TaskManager.getCustomTaskName(name);
        // 自定义任务如果不可以复用缓存
        delete TaskManager.tasks[type];
        this.activeTasks.add(type);
        return TaskManager.buildTaskMap[type] = TaskManager.getTaskHandleFromNames(taskNames);
    }
}
exports.TaskManager = TaskManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay1jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3dvcmtlci9idWlsZGVyL3Rhc2stY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUlBLE1BQWEsV0FBVztJQUVaLE1BQU0sQ0FBVSxLQUFLLEdBQStCO1FBQ3hELFNBQVMsRUFBRTtZQUNQLGlCQUFpQjtZQUNqQixrQkFBa0I7U0FDckI7UUFDRCw4QkFBOEI7UUFDOUIsVUFBVSxFQUFFO1lBQ1IsMkJBQTJCO1lBQzNCLG1CQUFtQjtZQUNuQixrQkFBa0I7U0FDckI7UUFDRCxRQUFRLEVBQUU7WUFDTixPQUFPO1lBQ1AseUJBQXlCLEVBQUUsNEJBQTRCO1NBQzFEO1FBQ0QsWUFBWSxFQUFFO1lBQ1Ysb0JBQW9CO1lBQ3BCLHFCQUFxQjtZQUNyQixzQkFBc0I7U0FDekI7UUFDRCxnQkFBZ0IsRUFBRTtZQUNkLDJCQUEyQjtTQUM5QjtLQUNKLENBQUM7SUFFRixNQUFNLENBQVUsV0FBVyxHQUE2QztRQUNwRSxhQUFhLEVBQUUsZUFBZTtRQUM5QixZQUFZLEVBQUUsY0FBYztRQUM1QixXQUFXLEVBQUUsYUFBYTtRQUMxQixtQkFBbUIsRUFBRSxxQkFBcUI7UUFDMUMsa0JBQWtCLEVBQUUsb0JBQW9CO1FBQ3hDLHdCQUF3QixFQUFFLDBCQUEwQjtRQUNwRCx1QkFBdUIsRUFBRSx5QkFBeUI7UUFDbEQsWUFBWSxFQUFFLGNBQWM7UUFDNUIseUJBQXlCLEVBQUUsMkJBQTJCO1FBQ3RELHdCQUF3QixFQUFFLDBCQUEwQjtRQUNwRCxPQUFPLEVBQUUsU0FBUztLQUNyQixDQUFDO0lBRU0sTUFBTSxDQUFDLFlBQVksR0FBbUM7UUFDMUQsU0FBUyxFQUFFLEVBQUU7UUFDYixZQUFZLEVBQUUsRUFBRTtRQUNoQixVQUFVLEVBQUUsRUFBRTtRQUNkLFFBQVEsRUFBRSxFQUFFO1FBQ1osZ0JBQWdCLEVBQUUsRUFBRTtLQUN2QixDQUFDO0lBRUYsV0FBVyxHQUFrQixJQUFJLEdBQUcsRUFBRSxDQUFDO0lBRXZDLElBQUksVUFBVTtRQUNWLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO0lBQ3JDLENBQUM7SUFFRCxZQUFZO0lBQ0wsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFjO1FBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDM0IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN2RyxDQUFDO0lBRU0sTUFBTSxDQUFDLHNCQUFzQixDQUFDLFNBQW1CO1FBQ3BELE9BQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFTSxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBWTtRQUN4QyxPQUFPLGFBQWEsR0FBRyxJQUFJLENBQUM7SUFDaEMsQ0FBQztJQUVNLFVBQVUsQ0FBQyxJQUFjO1FBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLE9BQU8sV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRU0sZ0JBQWdCLENBQUMsSUFBWSxFQUFFLFNBQW1CO1FBQ3JELE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCxpQkFBaUI7UUFDakIsT0FBTyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLE9BQU8sV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUYsQ0FBQzs7QUFsRkwsa0NBb0ZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSUJ1aWxkVGFzaywgSVBsdWdpbkhvb2tOYW1lIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcblxyXG50eXBlIFRhc2tUeXBlID0gJ2RhdGFUYXNrcycgfCAnc2V0dGluZ1Rhc2tzJyB8ICdidWlsZFRhc2tzJyB8ICdtZDVUYXNrcycgfCAncG9zdHByb2Nlc3NUYXNrcycgfCBzdHJpbmc7XHJcblxyXG5leHBvcnQgY2xhc3MgVGFza01hbmFnZXIge1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IHRhc2tzOiBSZWNvcmQ8VGFza1R5cGUsIHN0cmluZ1tdPiA9IHtcclxuICAgICAgICBkYXRhVGFza3M6IFtcclxuICAgICAgICAgICAgJ2RhdGEtdGFzay9hc3NldCcsXHJcbiAgICAgICAgICAgICdkYXRhLXRhc2svc2NyaXB0JyxcclxuICAgICAgICBdLFxyXG4gICAgICAgIC8vIOazqOaEj+WFiOWQjumhuuW6j++8jOS4jeWPr+maj+aEj+iwg+aVtO+8jOWFt+S9k+WPguiAg1hYWO+8iFRPRE/vvIlcclxuICAgICAgICBidWlsZFRhc2tzOiBbXHJcbiAgICAgICAgICAgIC8vIOi1hOa6kOWkhOeQhu+8jOWFiOiEmuacrO+8jOWQjui1hOa6kO+8jOi1hOa6kOWMheWQqyBCdW5kbGVcclxuICAgICAgICAgICAgJ2J1aWxkLXRhc2svc2NyaXB0JyxcclxuICAgICAgICAgICAgJ2J1aWxkLXRhc2svYXNzZXQnLFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgbWQ1VGFza3M6IFtcclxuICAgICAgICAgICAgLy8g6aG555uu5aSE55CGXHJcbiAgICAgICAgICAgICdwb3N0cHJvY2Vzcy10YXNrL3N1ZmZpeCcsIC8vIFRPRE8g6ZyA6KaB5YWB6K6455So5oi35ZyoIG1kNSDms6jlhaXkuYvliY3kv67mlLnlhoXlrrlcclxuICAgICAgICBdLFxyXG4gICAgICAgIHNldHRpbmdUYXNrczogW1xyXG4gICAgICAgICAgICAnc2V0dGluZy10YXNrL2Fzc2V0JyxcclxuICAgICAgICAgICAgJ3NldHRpbmctdGFzay9zY3JpcHQnLFxyXG4gICAgICAgICAgICAnc2V0dGluZy10YXNrL29wdGlvbnMnLFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgcG9zdHByb2Nlc3NUYXNrczogW1xyXG4gICAgICAgICAgICAncG9zdHByb2Nlc3MtdGFzay90ZW1wbGF0ZScsXHJcbiAgICAgICAgXSxcclxuICAgIH07XHJcblxyXG4gICAgc3RhdGljIHJlYWRvbmx5IHBsdWdpblRhc2tzOiBSZWNvcmQ8SVBsdWdpbkhvb2tOYW1lLCBJUGx1Z2luSG9va05hbWU+ID0ge1xyXG4gICAgICAgIG9uQmVmb3JlQnVpbGQ6ICdvbkJlZm9yZUJ1aWxkJyxcclxuICAgICAgICBvbkJlZm9yZUluaXQ6ICdvbkJlZm9yZUluaXQnLFxyXG4gICAgICAgIG9uQWZ0ZXJJbml0OiAnb25BZnRlckluaXQnLFxyXG4gICAgICAgIG9uQmVmb3JlQnVpbGRBc3NldHM6ICdvbkJlZm9yZUJ1aWxkQXNzZXRzJyxcclxuICAgICAgICBvbkFmdGVyQnVpbGRBc3NldHM6ICdvbkFmdGVyQnVpbGRBc3NldHMnLFxyXG4gICAgICAgIG9uQmVmb3JlQ29tcHJlc3NTZXR0aW5nczogJ29uQmVmb3JlQ29tcHJlc3NTZXR0aW5ncycsXHJcbiAgICAgICAgb25BZnRlckNvbXByZXNzU2V0dGluZ3M6ICdvbkFmdGVyQ29tcHJlc3NTZXR0aW5ncycsXHJcbiAgICAgICAgb25BZnRlckJ1aWxkOiAnb25BZnRlckJ1aWxkJyxcclxuICAgICAgICBvbkJlZm9yZUNvcHlCdWlsZFRlbXBsYXRlOiAnb25CZWZvcmVDb3B5QnVpbGRUZW1wbGF0ZScsXHJcbiAgICAgICAgb25BZnRlckNvcHlCdWlsZFRlbXBsYXRlOiAnb25BZnRlckNvcHlCdWlsZFRlbXBsYXRlJyxcclxuICAgICAgICBvbkVycm9yOiAnb25FcnJvcicsXHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGJ1aWxkVGFza01hcDogUmVjb3JkPFRhc2tUeXBlLCBJQnVpbGRUYXNrW10+ID0ge1xyXG4gICAgICAgIGRhdGFUYXNrczogW10sXHJcbiAgICAgICAgc2V0dGluZ1Rhc2tzOiBbXSxcclxuICAgICAgICBidWlsZFRhc2tzOiBbXSxcclxuICAgICAgICBtZDVUYXNrczogW10sXHJcbiAgICAgICAgcG9zdHByb2Nlc3NUYXNrczogW10sXHJcbiAgICB9O1xyXG5cclxuICAgIGFjdGl2ZVRhc2tzOiBTZXQ8VGFza1R5cGU+ID0gbmV3IFNldCgpO1xyXG5cclxuICAgIGdldCB0YXNrV2VpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiAxIC8gdGhpcy5hY3RpdmVUYXNrcy5zaXplO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOiOt+WPluafkOS4gOexu+i1hOa6kOS7u+WKoVxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRCdWlsZFRhc2sodHlwZTogVGFza1R5cGUpIHtcclxuICAgICAgICBpZiAoIXRoaXMuYnVpbGRUYXNrTWFwW3R5cGVdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJ1aWxkVGFza01hcFt0eXBlXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVpbGRUYXNrTWFwW3R5cGVdID0gVGFza01hbmFnZXIudGFza3NbdHlwZV0ubWFwKChuYW1lKSA9PiByZXF1aXJlKGAuL3Rhc2tzLyR7bmFtZX1gKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRUYXNrSGFuZGxlRnJvbU5hbWVzKHRhc2tOYW1lczogc3RyaW5nW10pIHtcclxuICAgICAgICByZXR1cm4gdGFza05hbWVzLm1hcCgobmFtZSkgPT4gcmVxdWlyZShgLi90YXNrcy8ke25hbWV9YCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Q3VzdG9tVGFza05hbWUobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuICdjdXN0b20tdGFzaycgKyBuYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhY3RpdmVUYXNrKHR5cGU6IFRhc2tUeXBlKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVUYXNrcy5hZGQodHlwZSk7XHJcbiAgICAgICAgcmV0dXJuIFRhc2tNYW5hZ2VyLmdldEJ1aWxkVGFzayh0eXBlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWN0aXZlQ3VzdG9tVGFzayhuYW1lOiBzdHJpbmcsIHRhc2tOYW1lczogc3RyaW5nW10pIHtcclxuICAgICAgICBjb25zdCB0eXBlID0gVGFza01hbmFnZXIuZ2V0Q3VzdG9tVGFza05hbWUobmFtZSk7XHJcbiAgICAgICAgLy8g6Ieq5a6a5LmJ5Lu75Yqh5aaC5p6c5LiN5Y+v5Lul5aSN55So57yT5a2YXHJcbiAgICAgICAgZGVsZXRlIFRhc2tNYW5hZ2VyLnRhc2tzW3R5cGVdO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlVGFza3MuYWRkKHR5cGUpO1xyXG4gICAgICAgIHJldHVybiBUYXNrTWFuYWdlci5idWlsZFRhc2tNYXBbdHlwZV0gPSBUYXNrTWFuYWdlci5nZXRUYXNrSGFuZGxlRnJvbU5hbWVzKHRhc2tOYW1lcyk7XHJcbiAgICB9XHJcblxyXG59XHJcbiJdfQ==