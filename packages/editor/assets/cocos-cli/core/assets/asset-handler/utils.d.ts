import type { CCON } from 'cc/editor/serialization';
import { Asset } from '@cocos/asset-db';
import { IAssetMeta } from '../@types/private';
import type { I18nKeys } from '../../../i18n/types/generated';
export declare function i18nTranslate<Key extends I18nKeys>(key: Key, ...args: any[]): string;
export declare function getDependUUIDList(content: string | CCON | Object, uuid?: string): any;
export declare function getDependList(content: string | CCON | Object): {
    uuids: any;
    dependScriptUuids: unknown[];
};
export declare function deserialize(json: CCON | Object): any;
export declare function getDeserializeResult(json: CCON | Object): {
    instance: any;
    uuids: any;
    dependScriptUuids: unknown[];
    classFinder: (id: any, owner?: any, propName?: any) => any;
};
export declare function linkToAssetTarget(uuid: string): string;
/**
 * 判断 val 的值是否超出
 * @param val
 * @param min
 * @param max
 */
export declare function clamp(val: number, min: number, max: number): number;
/**
 * 获取一个像素的颜色值
 * @param data
 * @param x
 * @param y
 * @param imgWidth
 */
export declare function getPixiel(buffer: Buffer, x: number, y: number, imgWidth: number): {
    r: number;
    g: number;
    b: number;
    a: number;
};
/**
 * 获取非透明像素的矩形大小
 * @param data
 * @param w
 * @param h
 * @param trimThreshold
 */
export declare function getTrimRect(buffer: Buffer, w: number, h: number, trimThreshold: number): number[];
export declare function removeNull(sceneData: any, assetUuid: string): boolean;
export declare class MigrateStep {
    private resolveQueue;
    hold(): Promise<void>;
    step(): void;
}
export declare function openCode(asset: Asset): Promise<boolean>;
/**
 * 将两个 meta 合并
 * 因为 meta 的可能被其他 asset 直接引用，所以不能直接覆盖
 * subMetas 里的数据是另一个 asset 的 meta，所以也需要拷贝
 * @param a
 * @param b
 */
export declare function mergeMeta(a: IAssetMeta, b: IAssetMeta): void;
export declare function getMediaDuration(filePath: string): Promise<number>;
