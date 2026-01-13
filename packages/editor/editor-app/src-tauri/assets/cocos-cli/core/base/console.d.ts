export type IConsoleType = 'log' | 'warn' | 'error' | 'debug' | 'info' | 'success' | 'ready' | 'start';
interface IConsoleMessage {
    type: IConsoleType;
    value: any;
}
export interface trackTimeEndOptions {
    output?: boolean;
    label?: string;
    value?: number;
}
/**
 * 自定义的一个新 console 类型，用于收集日志
 * 集成 console 提供美观的日志输出
 */
export declare class NewConsole {
    command: boolean;
    messages: IConsoleMessage[];
    private logDest;
    private _start;
    private memoryTrackMap;
    private trackTimeStartMap;
    private consola;
    private pino;
    private cacheLogs;
    private isLogging;
    private isVerbose;
    private currentSpinner;
    private progressMode;
    private lastProgressMessage;
    private progressStartTime;
    private lastPrintType?;
    private lastPrintMessage?;
    private lastPrintTime;
    private duplicateSuppressWindowMs;
    _init: boolean;
    constructor();
    init(logDest: string, cacheLogs?: boolean): void;
    /**
     * 开始记录资源导入日志
     * */
    record(logDest?: string): void;
    /**
     * 停止记录
     */
    stopRecord(): void;
    /**
     * 将参数数组格式化为消息字符串
     * 支持 Error 对象、多个参数等
     */
    private _formatMessage;
    /**
     * 通用的日志记录方法
     * @param type 日志类型
     * @param args 日志参数
     */
    private _logMessage;
    log(...args: any[]): void;
    info(...args: any[]): void;
    success(...args: any[]): void;
    ready(...args: any[]): void;
    start(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    debug(...args: any[]): void;
    /**
     * 处理进度消息显示
     */
    private _handleProgressMessage;
    /**
     * 控制台输出去重与防抖
     */
    private _printOnce;
    /**
     * 开始进度模式
     */
    startProgress(_initialMessage?: string): void;
    /**
     * 更新进度消息
     */
    private _updateProgress;
    /**
     * 停止进度模式
     */
    stopProgress(success?: boolean, finalMessage?: string): void;
    /**
     * 停止当前进度（不显示成功/失败状态）
     */
    private _stopProgress;
    private save;
    trackMemoryStart(name: string): number;
    trackMemoryEnd(name: string, _output?: boolean): void;
    trackTimeStart(message: string, time?: number): void;
    trackTimeEnd(message: string, options?: trackTimeEndOptions, time?: number): number;
    /**
     * 显示构建开始信息
     */
    buildStart(platform: string): void;
    /**
     * 显示构建完成信息
     */
    buildComplete(platform: string, duration: string, success?: boolean): void;
    /**
     * 显示插件任务信息
     */
    pluginTask(pkgName: string, funcName: string, status: 'start' | 'complete' | 'error', duration?: string): void;
    /**
     * 显示进度信息（在进度模式下更新，否则正常显示）
     */
    progress(message: string, current: number, total: number): void;
    /**
     * 创建进度条
     */
    private createProgressBar;
    /**
     * 显示阶段信息
     */
    stage(stage: string, message?: string): void;
    /**
     * 显示任务开始（带进度）
     */
    taskStart(taskName: string, description?: string): void;
    /**
     * 显示任务完成
     */
    taskComplete(taskName: string, success?: boolean, duration?: string): void;
    /**
     * 获取最近的日志信息
     */
    queryLogs(count: number, type?: IConsoleType): string[];
    /**
     * 清除所有日志信息
     */
    clearLogs(): void;
}
export declare function formateBytes(bytes: number): string;
export declare function transTimeToNumber(time: string): number;
/**
 * 获取最新时间
 * @returns 2019-03-26 11:03
 */
export declare function getRealTime(): string;
export declare const newConsole: NewConsole;
export {};
