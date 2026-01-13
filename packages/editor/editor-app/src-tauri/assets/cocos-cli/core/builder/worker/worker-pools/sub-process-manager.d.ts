import { ForkOptions } from 'child_process';
import { IQuickSpawnOption } from '../../@types/protected';
interface ITask {
    name: string;
    path: string;
    lazy?: boolean;
    options?: ForkOptions;
}
/**
 * 任务进程管理器
 */
export declare class WorkerManager {
    private taskMap;
    private _clearFreeChildTimer?;
    static defaultArgv: string[];
    static toggleDebug(): void;
    constructor(tasks?: ITask[]);
    /**
     * 注册一个需要开启子进程独立运行的任务信息，注册后会开启子进程，等待执行，有重复的任务会复用进程
     * @param task
     * @returns
     */
    registerTask(task: ITask): Promise<void>;
    runTask(name: string, method: string, args?: any[]): Promise<any>;
    /**
     * 停止某个进程
     * @param name
     */
    kill(name: string): void;
    /**
     * 中断所有正在执行的进程任务，和直接 kill 有差异
     */
    killRunningChilds: () => void;
    /**
     * 清理在空闲状态的进程
     */
    killFreeChilds: () => void;
    /**
     * 重置清理进程池的定时器, 20 分钟之内没有多余操作，就清理空闲子进程
     */
    private resetClearTimer;
    /**
     * 快速开启子进程
     * @param command
     * @param cmdParams
     * @param options
     * @returns
     */
    quickSpawn(command: string, cmdParams: string[], options?: IQuickSpawnOption): Promise<number | boolean>;
}
export declare const workerManager: WorkerManager;
export {};
