import EventEmitter from 'events';
import { IBuildOptionBase, IConsoleType } from '../../../@types';
import { IBuildHooksInfo, IBuildResultSuccess } from '../../../@types/protected';
export declare abstract class BuildTaskBase extends EventEmitter {
    breakReason?: string;
    name: string;
    progress: number;
    error?: Error;
    abstract hooksInfo: IBuildHooksInfo;
    abstract options: IBuildOptionBase;
    abstract hookMap: Record<string, string>;
    hookWeight: number;
    id: string;
    buildExitRes: IBuildResultSuccess;
    constructor(id: string, name: string);
    break(reason: string): void;
    onError(error: Error, throwError?: boolean): void;
    /**
     * 更新进度消息 log
     * @param message
     * @param increment
     * @param outputType
     */
    updateProcess(message: string, increment?: number, outputType?: IConsoleType): void;
    abstract handleHook(func: Function, internal: boolean, ...args: any[]): Promise<void>;
    abstract run(): Promise<boolean>;
    runPluginTask(funcName: string, weight?: number): Promise<void>;
}
