'use strict';

import { CustomHandler, AssetHandler } from "../protected/asset-handler";
import { AssetDBContribution, AssetHandlerInfo } from "../protected";

export interface EditorMethodModule {
    methods: { [name: string]: Function; };
    load(): void;
    unload(): void;
}

/**
 * 注册在插件管理器内的扩展信息(对内)
 */
export interface PackageRegisterInfo extends Omit<AssetDBContribution, 'asset-handle' | 'importer' | 'openMessage' | 'global-hook' | 'mount-hook'> {
    importerRegisterInfo?: ImporterRegisterInfo;
    name: string;
    assetHandlerInfos?: Array<AssetHandlerInfo>;
    hooks: string[];
    enable: boolean; // HACK 由于目前需要在插件启动之前关联这些内容
    internal: boolean;
}

export interface AssetDBRegisterInfo {
    name: string;
    target: string;
    readonly: boolean;
    visible: boolean;
    globList?: string[];
    preImportExtList?: string[];

    library?: string;
    temp?: string;
}