import { Logger } from '@cocos/creator-programming-common/lib/logger';
export declare class PackerDriverLogger implements Logger {
    constructor(debugLogFile: string);
    debug(message: string): void;
    info(message: string): this;
    warn(message: string): this;
    error(message: string): this;
    clear(): void;
    private _fileLogger;
}
