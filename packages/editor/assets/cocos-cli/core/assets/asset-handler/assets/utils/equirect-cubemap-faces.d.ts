import { Sharp } from 'sharp';
interface IData {
    height: number;
    width: number;
    data: Uint8Array;
}
export declare function srgbToLinear(value: number): number;
export declare function linearToSRGB(value: number): number;
export declare function nearestPowerOfTwo(value: number): number;
export declare enum InterpolationType {
    BILINEAR = "bilinear",
    NEAREST = "nearest"
}
export interface TransformOptions {
    interpolation?: InterpolationType;
    isRGBE?: boolean;
    flipTheta?: boolean;
}
export declare function equirectToCubemapFaces(image: Sharp, faceSize: number, options?: TransformOptions): Promise<IData[]>;
export {};
