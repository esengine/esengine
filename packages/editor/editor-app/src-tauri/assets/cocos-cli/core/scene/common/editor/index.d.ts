import { IScene } from './scene';
import type { Node, Scene } from 'cc';
import type { INode } from '../node';
import type { ICloseOptions, ICreateOptions, IOpenOptions, IReloadOptions, ISaveOptions } from './options';
import { IAssetInfo } from '../../../assets/@types/public';
import { IBaseIdentifier } from './base';
import { IServiceEvents } from '../../scene-process/service/core';
export type TEditorEntity = IScene | INode;
export type TEditorInstance = Scene | Node;
export * from './type';
export * from './base';
export * from './options';
export * from './scene';
/**
 * 事件类型
 */
export interface IEditorEvents {
    'editor:open': [];
    'editor:close': [];
    'editor:save': [];
    'editor:reload': [];
}
/**
 * 存储场景基础信息以及实例
 */
export interface IEditorTarget {
    identifier: IBaseIdentifier;
    instance: TEditorInstance;
}
export interface IPublicEditorService extends Omit<IEditorService, 'getRootNode' | 'getCurrentEditorType' | keyof IServiceEvents> {
}
export interface IEditorService extends IServiceEvents {
    /**
     * 当前编辑器类型
     */
    getCurrentEditorType(): 'scene' | 'prefab' | 'unknown';
    /**
     * 打开资产
     * @param params
     */
    open(params: IOpenOptions): Promise<TEditorEntity>;
    /**
     * 关闭当前资产
     */
    close(params: ICloseOptions): Promise<boolean>;
    /**
     * 保存资产
     */
    save(params: ISaveOptions): Promise<IAssetInfo>;
    /**
     * 重载资产
     * @param params
     */
    reload(params: IReloadOptions): Promise<boolean>;
    /**
     * 创建新资产
     * @param params
     */
    create(params: ICreateOptions): Promise<IBaseIdentifier>;
    /**
     * 是否有打开编辑器
     */
    hasOpen(): Promise<boolean>;
    /**
     * 获取当前打开的资产
     */
    queryCurrent(): Promise<TEditorEntity | null>;
    /**
     *
     */
    getRootNode(): TEditorInstance | null;
}
