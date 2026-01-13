import { PluginScriptInfo } from '@cocos/lib-programming/dist/executor';
export interface SharedSettings {
    useDefineForClassFields: boolean;
    allowDeclareFields: boolean;
    loose: boolean;
    guessCommonJsExports: boolean;
    exportsConditions: string[];
    preserveSymlinks: boolean;
    importMap?: {
        json: {
            imports?: Record<string, string>;
            scopes?: Record<string, Record<string, string>>;
        };
        url: string;
    };
}
export interface IPluginScriptInfo extends PluginScriptInfo {
    url: string;
}
export interface FilterPluginOptions {
    loadPluginInEditor?: boolean;
    loadPluginInWeb?: boolean;
    loadPluginInNative?: boolean;
    loadPluginInMiniGame?: boolean;
}
