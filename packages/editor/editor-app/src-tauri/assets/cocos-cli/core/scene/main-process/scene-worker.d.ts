import { ChildProcess } from 'child_process';
export interface ISceneWorkerEvents {
    'restart': boolean;
}
export declare class SceneWorker {
    static ExitWorkerEvent: string;
    private _process;
    get process(): ChildProcess;
    private eventEmitter;
    private maxRestartAttempts;
    private currentRestartCount;
    private enginePath;
    private projectPath;
    private isRestarting;
    private isManualStop;
    start(enginePath: string, projectPath: string): Promise<boolean>;
    stop(): Promise<boolean>;
    /**
     * 判断是否崩溃
     * @private
     */
    private isCrashExit;
    /**
     * 重启场景进程
     * @private
     */
    private restart;
    registerListener(): Promise<void>;
    /**
     * 监听指定类型的事件（类型安全版本）
     * @param event 事件名称
     * @param listener 事件监听器
     */
    on<TEvents extends Record<string, any>>(event: keyof TEvents, listener: TEvents[keyof TEvents] extends void ? () => void : (payload: TEvents[keyof TEvents]) => void): void;
    /**
     * 监听指定类型的事件（通用版本）
     * @param event 事件名称
     * @param listener 事件监听器
     */
    on(event: string, listener: (...args: any[]) => void): void;
    /**
     * 监听指定类型的事件（一次性，类型安全版本）
     * @param event 事件名称
     * @param listener 事件监听器
     */
    once<TEvents extends Record<string, any>>(event: keyof TEvents, listener: TEvents[keyof TEvents] extends void ? () => void : (payload: TEvents[keyof TEvents]) => void): void;
    /**
     * 监听指定类型的事件（一次性，通用版本）
     * @param event 事件名称
     * @param listener 事件监听器
     */
    once(event: string, listener: (...args: any[]) => void): void;
    /**
     * 移除指定类型的事件监听器（类型安全版本）
     * @param event 事件名称
     * @param listener 事件监听器
     */
    off<TEvents extends Record<string, any>>(event: keyof TEvents, listener: TEvents[keyof TEvents] extends void ? () => void : (payload: TEvents[keyof TEvents]) => void): void;
    off(event: string, listener: (...args: any[]) => void): void;
    /**
     * 发射指定类型的事件（类型安全版本）
     * @param event 事件名称
     * @param args 事件参数
     */
    emit<TEvents extends Record<string, any>>(event: keyof TEvents, ...args: TEvents[keyof TEvents] extends void ? [] : [TEvents[keyof TEvents]]): void;
    /**
     * 触发事件（通用版本）
     * @param event 事件名称
     * @param args 事件参数
     */
    emit(event: string, ...args: any[]): void;
    /**
     * 清除事件监听器
     * @param event 事件名称，如果不提供则清除所有
     */
    clear(event?: string): void;
}
export declare const sceneWorker: SceneWorker;
