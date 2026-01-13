import { IServiceEvents } from '../scene-process/service/core';
export interface IScriptEvents {
    /**
     * 当脚本刷新并执行完成时触发
     */
    'script:execution-finished': [];
}
export interface IPublicScriptService extends Omit<IScriptService, keyof IServiceEvents | 'suspend' | 'isCustomComponent'> {
}
export interface IScriptService extends IServiceEvents {
    investigatePackerDriver(): Promise<void>;
    loadScript(): Promise<void>;
    removeScript(): Promise<void>;
    scriptChange(): Promise<void>;
    queryScriptCid(uuid: string): Promise<string | null>;
    queryScriptName(uuid: string): Promise<string | null>;
    isCustomComponent(classConstructor: Function): Promise<boolean>;
    suspend(condition: Promise<any>): void;
}
