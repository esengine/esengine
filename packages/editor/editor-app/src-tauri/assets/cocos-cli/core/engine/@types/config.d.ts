import { extend } from 'lodash';

type IFlags = Record<string, boolean | number>;
export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

interface IPhysicsConfig {
    gravity: IVec3Like; // （0，-10， 0）
    allowSleep: boolean; // true
    sleepThreshold: number; // 0.1，最小 0
    autoSimulation: boolean; // true
    fixedTimeStep: number; // 1 / 60 ，最小 0
    maxSubSteps: number; // 1，最小 0
    defaultMaterial?: string; // 物理材质 uuid
    useNodeChains: boolean; // true
    collisionMatrix: ICollisionMatrix;
    physicsEngine: string;
    physX?: {
        notPackPhysXLibs: boolean;
        multiThread: boolean;
        subThreadCount: number;
        epsilon: number;
    };
}

// 物理配置
interface ICollisionMatrix {
    [x: string]: number;
}

interface IVec3Like {
    x: number;
    y: number;
    z: number;
}

interface IPhysicsMaterial {
    friction: number; // 0.5
    rollingFriction: number; // 0.1
    spinningFriction: number; // 0.1
    restitution: number; // 0.1
}

export interface ICustomJointTextureLayout {
    textureLength: number;
    contents: IChunkContent[];
}

export interface IChunkContent {
    skeleton: null | string;
    clips: string[];
}
export type MacroItem = {
    key: string;
    value: boolean;
}
export interface ISplashBackgroundColor {
    x: number;
    y: number;
    z: number;
    w: number;
}
export interface ISplashSetting {
    displayRatio: number;
    totalTime: number;
    watermarkLocation: 'default' | 'topLeft' | 'topRight' | 'topCenter' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';
    autoFit: boolean;

    logo?: {
        type: 'default' | 'none' | 'custom';
        image?: string;
        base64?: string;
    }
    background?: {
        type: 'default' | 'color' | 'custom';
        color?: ISplashBackgroundColor;
        image?: string;
        base64?: string;
    }
}

/**
 * 构建使用的设计分辨率数据
 */
export interface IDesignResolution {
    height: number;
    width: number;
    fitWidth?: boolean;
    fitHeight?: boolean;
    policy?: number;
}

export interface IEngineModuleConfig {
    // ---- 模块配置相关 ----
    includeModules: string[];
    flags?: IFlags;
    noDeprecatedFeatures?: { value: boolean, version: string };
}

export interface IEngineConfig extends IEngineModuleConfig {
    physicsConfig: IPhysicsConfig;
    macroConfig?: Record<string, string | number | boolean>;
    sortingLayers: { id: number, name: string, value: number }[];
    customLayers: { name: string, value: number }[];
    renderPipeline?: string;
    // 是否使用自定义管线，如与其他模块配置不匹配将会以当前选项为准
    customPipeline?: boolean;
    highQuality: boolean;

    macroCustom: MacroItem[];

    customJointTextureLayouts: ICustomJointTextureLayout[];
    designResolution: IDesignResolution;
    splashScreen: ISplashSetting;
    downloadMaxConcurrency: number;
}

export interface IEngineProjectConfig extends Exclude<IEngineConfig, 'includeModules' | 'flags' | 'noDeprecatedFeatures'> {
    configs?: Record<string, IEngineModuleConfig>;
    globalConfigKey?: string;
}

export interface IInitEngineInfo {
    importBase: string;
    nativeBase: string;
    writablePath: string;
    serverURL?: string;
}

interface CCEModuleConfig {
    description: string;
    main: string;
    types: string;
}
export type CCEModuleMap = {
    [moduleName: string]: CCEModuleConfig;
} & {
    mapLocation: string;
};