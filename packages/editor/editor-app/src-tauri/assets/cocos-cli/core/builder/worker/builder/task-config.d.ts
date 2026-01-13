import { IPluginHookName } from '../../@types/protected';
type TaskType = 'dataTasks' | 'settingTasks' | 'buildTasks' | 'md5Tasks' | 'postprocessTasks' | string;
export declare class TaskManager {
    private static readonly tasks;
    static readonly pluginTasks: Record<IPluginHookName, IPluginHookName>;
    private static buildTaskMap;
    activeTasks: Set<TaskType>;
    get taskWeight(): number;
    static getBuildTask(type: TaskType): any[];
    static getTaskHandleFromNames(taskNames: string[]): any[];
    static getCustomTaskName(name: string): string;
    activeTask(type: TaskType): any[];
    activeCustomTask(name: string, taskNames: string[]): any[];
}
export {};
