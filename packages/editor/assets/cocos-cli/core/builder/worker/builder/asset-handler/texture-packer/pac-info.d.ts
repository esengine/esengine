/**
 * 此文件依赖了许多引擎接口，注意版本升级影响
 */
import { SpriteFrame, Texture2D } from 'cc';
import { IAsset } from '../../../../../assets/@types/protected';
import { IPackOptions, IPacInfo, PacStoreInfo, IPackResult, CompressedInfo, IAtlasInfo, ISpriteFrameInfo } from '../../../../@types/protected';
export declare const DefaultPackOption: IPackOptions;
/**
 * 一个图集信息
 */
export declare class PacInfo implements IPacInfo {
    spriteFrameInfos: SpriteFrameInfo[];
    spriteFrames: SpriteFrame[];
    relativePath: string;
    relativeDir: string;
    path: string;
    uuid: string;
    imagePath: string;
    imageUuid: string;
    textureUuid: string;
    name: string;
    width: number;
    height: number;
    dirty: boolean;
    packOptions: IPackOptions;
    storeInfo: PacStoreInfo;
    result?: IPackResult;
    constructor(pacAsset: IAsset, options?: Partial<IPackOptions>);
    initSpriteFramesWithRange(includeAssets?: string[]): Promise<this>;
    /**
     * @param {Object} pacAssetInfo 从 db 中获取出来的 pac 信息
     */
    initSpriteFrames(spriteFrameAssets: (IAsset)[]): Promise<this>;
    private queryInvalidSpriteAssets;
    toJSON(): void;
}
/**
 * 每张图集可能生成多张大图，每一张大图有对应的 AtlasInfo
 */
export declare class AtlasInfo {
    imagePath: string;
    imageUuid: string;
    textureUuid: string;
    name: string;
    spriteFrameInfos: SpriteFrameInfo[];
    width: number;
    height: number;
    compressed: CompressedInfo;
    constructor(spriteFrameInfos: SpriteFrameInfo[], width: number, height: number, name: string, imagePath: string);
    toJSON(): {
        spriteFrameInfos: any[];
        width: number;
        height: number;
        name: string;
        imagePath: string;
        imageUuid: string;
        textureUuid: string;
        compressed: CompressedInfo;
    };
}
export declare class SpriteFrameInfo {
    name: string;
    uuid: string;
    imageUuid: string;
    textureUuid: string;
    spriteFrame: SpriteFrame;
    trim: {
        width: number;
        height: number;
        rotatedWidth: number;
        rotatedHeight: number;
        x: number;
        y: number;
    };
    rawWidth: number;
    rawHeight: number;
    width: number;
    height: number;
    originalPath: string;
    rotated: boolean;
    _file: string;
    _libraryPath: string;
    _pacUuid: string;
    private _mtime;
    constructor(spriteFrame: SpriteFrame, assetInfo: IAsset, options: IPackOptions);
    toJSON(): any;
}
export declare function createAssetInstance(atlases: IAtlasInfo[], pacInfo: IAsset, spriteFrames: SpriteFrame[]): any[];
export declare function createApriteAtlasFromAtlas(atlases: IAtlasInfo[], pacInfo: IAsset, allSpriteFrames: SpriteFrame[]): {
    spriteAtlas: any;
    textures: Texture2D[];
    images: ImageAsset[];
    spriteFrames: SpriteFrame[];
};
export declare function createTextureFromAtlas(atlas: IAtlasInfo, pacInfo: IAsset): {
    texture: any;
    image: any;
};
export declare function applyTextureBaseAssetUserData(userData: any, texture: Texture2D): void;
export declare function generateSpriteFrame(item: ISpriteFrameInfo, oldSpriteFrame: SpriteFrame, texture: Texture2D): SpriteFrame;
