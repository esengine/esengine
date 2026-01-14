import { ICompressConfig } from '../../../../@types';
export declare function isPowerOfTwo(num: number): boolean;
export declare function getMipLevel(width: number, height: number): number;
export declare function genMipmapFiles(file: string, destDir?: string, forceChangeToPowerOfTwo?: boolean): Promise<string[]>;
export declare function checkHasMipMaps(meta: any): boolean;
export declare function compressMipmapFiles(optionItem: ICompressConfig, compressFunc: Function): Promise<Buffer[]>;
