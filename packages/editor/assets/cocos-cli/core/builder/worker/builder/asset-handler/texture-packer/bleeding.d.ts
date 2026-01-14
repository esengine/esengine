export interface IRect {
    x: number;
    y: number;
    width: number;
    height: number;
    xMax: number;
    yMax: number;
}
export interface IBleedOptions {
    contourBleed: boolean;
    paddingBleed: boolean;
}
export interface IAtlasInfo {
    width: number;
    height: number;
    spriteFrameInfos: Array<{
        trim: {
            x: number;
            y: number;
            rotatedWidth: number;
            rotatedHeight: number;
        };
    }>;
}
export declare class BleedingProcessor {
    private static applyContourBleed;
    private static applyPaddingBleed;
    static applyBleed(options: IBleedOptions, atlas: IAtlasInfo, srcBuffer: Uint8Array, resultBuffer: Uint8Array): void;
}
