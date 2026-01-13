import type { ImportMap } from '@cocos/creator-programming-import-maps/lib/import-map';
import type { Logger } from '@cocos/creator-programming-common/lib/logger';
import { ConfigurationScope } from '../../configuration';
import { ScriptProjectConfig } from '../@types/config-export';
export interface SharedSettings extends Pick<ScriptProjectConfig, 'useDefineForClassFields' | 'allowDeclareFields' | 'loose' | 'guessCommonJsExports' | 'exportsConditions'> {
    useDefineForClassFields: boolean;
    allowDeclareFields: boolean;
    loose: boolean;
    guessCommonJsExports: boolean;
    exportsConditions: string[];
    importMap?: {
        json: ImportMap;
        url: string;
    };
    preserveSymlinks: boolean;
}
export declare function getDefaultSharedSettings(): ScriptProjectConfig;
declare class ScriptConfig {
    private _config;
    /**
     * 持有的可双向绑定的配置管理实例
     * TODO 目前没有防护没有 init 的情况
     */
    private _configInstance;
    private _init;
    init(): Promise<void>;
    getProject<T>(path?: string, scope?: ConfigurationScope): Promise<T>;
    setProject(path: string, value: any, scope?: ConfigurationScope): Promise<boolean>;
}
export declare const scriptConfig: ScriptConfig;
export declare function querySharedSettings(logger: Logger): Promise<SharedSettings>;
export {};
