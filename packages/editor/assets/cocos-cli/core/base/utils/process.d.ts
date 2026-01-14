import { SpawnOptions } from 'child_process';
export declare const enum LogLevel {
    LOG = 0,
    WARN = 1,
    ERROR = 2,
    NULL = 3
}
export interface IQuickSpawnOption extends SpawnOptions {
    cwd?: string;
    env?: any;
    logLevel?: LogLevel;
    downGradeWaring?: boolean;
    downGradeLog?: boolean;
    downGradeError?: boolean;
    onlyPrintWhenError?: boolean;
    prefix?: string;
}
/**
* 快速开启子进程
* @param command
* @param cmdParams
* @param options
* @returns
*/
export declare function quickSpawn(command: string, cmdParams: string[], options?: IQuickSpawnOption): Promise<boolean>;
