import { IAsset } from '../../../assets/@types/protected';
import { IBuildSceneItem, UUID } from '../public';
import { IInternalBuildOptions, IAssetInfo } from './options';
export interface BuilderCache {
    readonly scenes: Array<IBuildSceneItem>;
    readonly scriptUuids: Array<string>;
    readonly assetUuids: Array<string>;
    init: () => Promise<void>;
    hasAsset: (uuid: string) => Promise<boolean>;
    addAsset: (asset: IAsset) => void;
    addInstance: (instance: any) => void;
    clearAsset: (uuid: string) => void;
    removeAsset: (uuid: string) => void;
    getMeta: (uuid: string) => Promise<any>;
    getAssetInfo: (uuid: string) => IAssetInfo;
    addMeta: (uuid: string, meta: any) => void;
    getDependUuids: (uuid: string) => Promise<readonly string[]>;
    getDependUuidsDeep: (uuid: string) => Promise<readonly string[]>;
    /**
     * 获取序列化文件
     */
    getLibraryJSON: (uuid: string) => Promise<any>;
    getSerializedJSON: (uuid: string, options: IInternalBuildOptions) => Promise<any>;
    forEach: (type: string, handle: Function) => Promise<void>;
    getInstance: (uuid: string) => Promise<any>;
    outputAssetJson: (uuid: string, destDir: string, options: IInternalBuildOptions) => Promise<void>;
}
export type IUrl = string;
export type IAssetInfoMap = Record<UUID, IAssetInfo>;
export type IUuidDependMap = Record<UUID, UUID[]>;
export type IJsonGroupMap = Record<UUID, IJSONGroupItem>;
export type IAssetGroupMap = Record<UUID, IAssetGroupItem>;
export type IMetaMap = Record<UUID, any>;
export type IJsonMap = Record<UUID, any>;
export type IInstanceMap = Record<UUID, any>;
export type ICompressOptions = Record<string, number>;
export interface IAssetGroupItem {
    baseUrls: string[];
    scriptDest: string;
    scriptUuids: UUID[];
    assetUuids: UUID[];
}
export interface IJSONGroupItem {
    name?: string;
    type: string;
    uuids: UUID[];
}
export interface IAssetGroupOptions {
    scriptUrl: string;
    baseUrl: string;
}
export type IGroupType = 'json' | 'script' | 'asset';
export type IUpdateType = 'asset-change' | 'asset-add' | 'asset-delete';
export interface IUpdateInfo {
    type: IUpdateType;
    uuid: string;
}
