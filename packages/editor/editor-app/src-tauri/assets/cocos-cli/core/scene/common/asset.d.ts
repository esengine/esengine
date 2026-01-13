import { IServiceEvents } from '../scene-process/service/core';
/**
 * 资源事件类型
 */
export interface IAssetEvents {
    'asset:change': [uuid: string];
    'asset:deleted': [uuid: string];
    'asset-refresh': [uuid: string];
}
export interface IPublicAssetService extends Omit<IAssetService, keyof IServiceEvents> {
}
/**
 * 场景相关处理接口
 */
export interface IAssetService extends IServiceEvents {
    /**
     * 资源发生变化时，进行处理
     * @param uuid
     */
    assetChanged(uuid: string): Promise<void>;
    /**
     * 资源删除时，进行处理
     * @param uuid
     */
    assetDeleted(uuid: string): Promise<void>;
}
