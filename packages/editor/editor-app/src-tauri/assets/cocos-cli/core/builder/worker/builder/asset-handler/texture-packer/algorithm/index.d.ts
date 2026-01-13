export interface IInputRect {
    width: number;
    height: number;
    [key: string]: any;
}
export interface IPackedRect extends IInputRect {
    x: number;
    y: number;
    rotated?: boolean;
}
export declare const TexturePackerAlgorithm: {
    ipacker(inputs: IInputRect[], maxWidth: number, maxHeight: number, allowRotation: boolean): IPackedRect[];
    MaxRects(inputs: IInputRect[], maxWidth: number, maxHeight: number, allowRotation: boolean): IPackedRect[];
};
