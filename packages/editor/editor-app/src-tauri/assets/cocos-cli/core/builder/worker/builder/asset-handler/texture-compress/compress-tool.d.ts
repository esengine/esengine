import { ICompressConfig, ITextureCompressType } from '../../../../@types';
/**
 * 压缩 jpg png
 * @param {string} option 参数
 * @param {object} format 图片格式类型以及对应质量
 */
export declare function compressJpgAndPng(option: ICompressConfig): Promise<void>;
/**
 * 压缩 webp 格式图片
 * @param {string} option
 * @param {object} format
 */
export declare function compressWebp(option: ICompressConfig): Promise<void>;
/**
 * 压缩 pvr 类型图片
 * @param {*} option
 * @param {*} format
 */
export declare function compressPVR(option: ICompressConfig): Promise<void>;
/**
 * 压缩 etc 类型图片
 * @param option
 * @param format
 */
export declare function compressEtc(option: ICompressConfig): Promise<void>;
/**
 * 压缩 astc 类型图片
 * @param format
 */
export declare function compressAstc(option: ICompressConfig): Promise<void>;
/**
 * 根据图片类型获取压缩函数
 * @param format
 */
export declare function getCompressFunc(format: ITextureCompressType): typeof compressJpgAndPng | undefined;
export declare function compressCustomFormat(config: ICompressConfig): Promise<void>;
