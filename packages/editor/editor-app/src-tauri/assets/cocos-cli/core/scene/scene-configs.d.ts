import { ConfigurationScope } from '../configuration';
export interface ISceneConfig {
    /**
     * 是否循环
     */
    tick: boolean;
}
declare class SceneConfig {
    private defaultConfig;
    private configInstance;
    init(): Promise<void>;
    get<T>(path?: string, scope?: ConfigurationScope): Promise<T>;
    set(path: string, value: any, scope?: ConfigurationScope): Promise<boolean>;
}
export declare const sceneConfigInstance: SceneConfig;
export {};
