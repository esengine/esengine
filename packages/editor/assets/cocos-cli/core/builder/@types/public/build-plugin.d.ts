import { IBuildResult, ICompressConfig } from './build-result';
import { IBuilderConfigItem, IBuildOptionBase } from '../protected';
export interface IBuildPluginConfig {
    doc?: string;
    hooks?: string;
    panel?: string;
    options?: IDisplayOptions;
    verifyRuleMap?: IVerificationRuleMap;
}
export interface IBuildPluginProfile {
    builder?: {
        common?: Record<string, any>;
        options?: Record<string, Record<string, any>>;
        taskOptionsMap?: Record<string, any>;
    };
    __version__: string;
    common?: Record<string, any>;
    options?: Record<string, Record<string, any>>;
}
export type IVerificationFunc = (val: any, ...arg: any[]) => boolean | Promise<boolean>;
export type IInternalVerificationFunc = (val: any, ...arg: any[]) => boolean;
export type IVerificationRuleMap = Record<string, IVerificationRule>;
export interface IVerificationRule {
    func: IVerificationFunc;
    message: string;
}
export interface IInternalVerificationRule {
    func: IInternalVerificationFunc;
    message: string;
}
export type IDisplayOptions = Record<string, IBuilderConfigItem>;
export type ArrayItem = {
    label: string;
    value: string;
};
export interface IBuildPlugin {
    configs?: BuildPlugin.Configs;
    assetHandlers?: BuildPlugin.AssetHandlers;
    load?: BuildPlugin.load;
    unload?: BuildPlugin.Unload;
}
export type IBaseHooks = (options: IBuildOptionBase, result: IBuildResult) => Promise<void> | void;
export type IBuildStageHooks = (root: string, options: IBuildOptionBase) => Promise<void> | void;
export declare namespace BuildPlugin {
    type Configs = Record<string, IBuildPluginConfig>;
    type AssetHandlers = string;
    type load = () => Promise<void> | void;
    type Unload = () => Promise<void> | void;
}
export declare namespace BuildHook {
    type throwError = boolean;
    type title = string;
    type onError = IBaseHooks;
    type onBeforeBuild = IBaseHooks;
    type onBeforeCompressSettings = IBaseHooks;
    type onAfterCompressSettings = IBaseHooks;
    type onAfterBuild = IBaseHooks;
    type onAfterMake = IBuildStageHooks;
    type onBeforeMake = IBuildStageHooks;
    type load = () => Promise<void> | void;
    type unload = () => Promise<void> | void;
}
export declare namespace AssetHandlers {
    type compressTextures = (tasks: ICompressConfig[]) => Promise<void>;
}
