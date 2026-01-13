import { IServiceEvents } from '../scene-process/service/core';
export interface IEngineEvents {
    'engine:update': [];
    'engine:ticked': [];
}
export interface IPublicEngineService extends Omit<IEngineService, keyof IServiceEvents> {
}
export interface IEngineService extends IServiceEvents {
    /**
     * 初始化引擎服务，目前是暂时引擎 mainLoop
     */
    init(): Promise<void>;
    /**
     * 让引擎执行一帧
     */
    repaintInEditMode(): Promise<void>;
}
