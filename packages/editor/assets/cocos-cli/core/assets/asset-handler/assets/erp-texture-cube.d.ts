import { AssetHandler } from '../../@types/protected';
/**
 * @en The way to fill mipmaps.
 * @zh 填充mipmaps的方式。
 */
export declare enum MipmapMode {
    /**
     * @zh
     * 不使用mipmaps
     * @en
     * Not using mipmaps
     * @readonly
     */
    NONE = 0,
    /**
     * @zh
     * 使用自动生成的mipmaps
     * @en
     * Using the automatically generated mipmaps
     * @readonly
     */
    AUTO = 1,
    /**
     * @zh
     * 使用卷积图填充mipmaps
     * @en
     * Filling mipmaps with convolutional maps
     * @readonly
     */
    BAKED_CONVOLUTION_MAP = 2
}
export declare const ERPTextureCubeHandler: AssetHandler;
export default ERPTextureCubeHandler;
export interface IFaceSwapSpace {
    [faceName: string]: Buffer;
}
export declare function checkSize(width: number, height: number): boolean;
