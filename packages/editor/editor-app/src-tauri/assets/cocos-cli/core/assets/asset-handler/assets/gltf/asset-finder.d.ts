import * as cc from 'cc';
import { Constructor } from 'cc';
import { SerializedAssetFinder } from '../../../@types/userDatas';
import { GltfAssetFinderKind, IGltfAssetFinder } from '../utils/gltf-converter';
export type MyFinderKind = GltfAssetFinderKind | 'scenes';
export declare class DefaultGltfAssetFinder implements IGltfAssetFinder {
    private _assetDetails;
    constructor(_assetDetails?: SerializedAssetFinder);
    serialize(): SerializedAssetFinder;
    set(kind: MyFinderKind, values: Array<string | null>): void;
    find<T extends cc.Asset>(kind: MyFinderKind, index: number, type: Constructor<T>): T | null;
}
