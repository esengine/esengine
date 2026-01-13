import { IDisplayOptions } from './build-plugin';
export type ITextureCompressType = 'jpg' | 'png' | 'webp' | 'pvrtc_4bits_rgb' | 'pvrtc_4bits_rgba' | 'pvrtc_4bits_rgb_a' | 'pvrtc_2bits_rgb' | 'pvrtc_2bits_rgba' | 'pvrtc_2bits_rgb_a' | 'etc1_rgb' | 'etc1_rgb_a' | 'etc2_rgb' | 'etc2_rgba' | 'astc_4x4' | 'astc_5x5' | 'astc_6x6' | 'astc_8x8' | 'astc_10x5' | 'astc_10x10' | 'astc_12x12' | string;
export type ITextureCompressPlatform = 'miniGame' | 'web' | 'ios' | 'android' | 'harmonyos-next';
export type ITextureCompressFormatType = 'pvr' | 'jpg' | 'png' | 'etc' | 'astc' | 'webp';
export interface IHandlerInfo {
    type: 'program' | 'npm' | 'function';
    info: ICommandInfo | Function;
    func?: Function;
}
export interface ITextureFormatConfig {
    displayName: string;
    options: IDisplayOptions;
    formats: ITextureFormatInfo[];
    suffix: string;
    parallelism: boolean;
    childProcess?: boolean;
}
export interface ITextureCompressConfig {
    name: string;
    textureCompressConfig: PlatformCompressConfig;
}
export interface AllTextureCompressConfig {
    platformConfig: Record<string, ITextureCompressConfig>;
    formatsInfo: Record<string, ITextureFormatInfo>;
    customFormats: Record<string, ITextureFormatInfo>;
    configGroups: IConfigGroups;
    defaultSupport: ISupportFormat;
    textureFormatConfigs: Record<string, ITextureFormatConfig>;
}
export interface UserCompressConfig {
    customConfigs: Record<string, ICustomConfig>;
    defaultConfig: Record<string, {
        name: string;
        options: Record<string, Record<string, {
            quality: string | number;
        }>>;
    }>;
    userPreset: Record<string, {
        name: string;
        options: Record<string, Record<string, {
            quality: string | number;
        }>>;
        overwrite?: Record<string, Record<string, {
            quality: string | number;
        }>>;
    }>;
    genMipmaps: boolean;
}
export interface PlatformCompressConfig {
    platformType: ITextureCompressPlatform;
    support: ISupportFormat;
}
export interface ICustomConfig {
    id: string;
    name: string;
    path: string;
    command: string;
    format: string;
    overwrite?: boolean;
    num?: number;
}
export interface ICommandInfo {
    command: string;
    params?: string[];
    path: string;
}
export interface ITextureFormatInfo {
    displayName: string;
    value: ITextureCompressType | string;
    formatSuffix?: string;
    alpha?: boolean;
    formatType?: ITextureCompressFormatType;
    handler?: IHandlerInfo;
    custom?: boolean;
    params?: string[];
}
export interface ISupportFormat {
    rgb: ITextureCompressType[];
    rgba: ITextureCompressType[];
}
export interface IConfigGroupsInfo {
    defaultSupport?: ISupportFormat;
    support: ISupportFormat;
    displayName: string;
    icon: string;
    supportOverwrite?: boolean;
}
export type IConfigGroups = Record<ITextureCompressPlatform, IConfigGroupsInfo>;
export type IPVRQuality = 'fastest' | 'fast' | 'normal' | 'high' | 'best';
export type IETCQuality = 'slow' | 'fast';
export type IASTCQuality = 'veryfast' | 'fast' | 'medium' | 'thorough' | 'exhaustive';
export type ConfigType = 'options' | 'overwrite';
