import { Asset, VirtualAsset } from '@cocos/asset-db';
import { ThumbnailInfo } from '../../../@types/protected';
import { ImageImportType, SpriteFrameAssetUserData, SpriteFrameBaseAssetUserData, Texture2DAssetUserData, TextureCubeAssetUserData } from '../../../@types/userDatas';
export declare function makeDefaultTextureCubeAssetUserData(): TextureCubeAssetUserData;
export declare function makeDefaultTexture2DAssetUserData(): Texture2DAssetUserData;
export declare function makeDefaultTexture2DAssetUserDataFromImagePath(path: string): Texture2DAssetUserData;
export declare function makeDefaultTexture2DAssetUserDataFromImageUuid(uuid: string, extName?: string): Texture2DAssetUserData;
export declare function makeDefaultSpriteFrameAssetUserData(): SpriteFrameBaseAssetUserData;
export declare function makeDefaultSpriteFrameAssetUserDataFromImageUuid(uuid: string, atlas: string): SpriteFrameAssetUserData;
export declare function saveImageAsset(asset: Asset | VirtualAsset, imageDataBufferOrimagePath: Buffer, extName: string, displayName: string): Promise<void>;
export declare const defaultIconConfig: ThumbnailInfo;
/** 返回一个资源是否可以被消除阴影 */
export declare function isCapableToFixAlphaTransparencyArtifacts(asset: Asset | VirtualAsset, type: ImageImportType, extName: string): boolean;
export declare function handleImageUserData(asset: Asset | VirtualAsset, imageDataBufferOrimagePath: Buffer | string, rawExtName: string): Promise<Buffer<ArrayBufferLike>>;
export declare function importWithType(asset: Asset | VirtualAsset, type: ImageImportType, displayName: string, extName: string): Promise<void>;
export declare function converImage(): Promise<void>;
export declare function openImageAsset(asset: Asset): Promise<boolean>;
