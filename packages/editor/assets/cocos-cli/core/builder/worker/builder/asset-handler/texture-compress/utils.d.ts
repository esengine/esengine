import { ITextureFormatInfo } from '../../../../@types';
export declare function changeSuffix(path: string, suffix: string): string;
export declare function getSuffix(formatInfo: ITextureFormatInfo, suffix: string): string;
export declare function changeInfoToLabel(info: Record<string, any>): string;
export declare function roundToPowerOfTwo(value: number): number;
/**
 * 根据当前图片是否带有透明通道过滤掉同类型的不推荐的格式
 * 如果同类型图片只有一种配置，则不作过滤处理
 * @param compressOptions
 * @param hasAlpha
 */
export declare function checkCompressOptions(compressOptions: Record<string, any>, hasAlpha: boolean, uuid: string): void;
