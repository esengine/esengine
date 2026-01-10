/**
 * @zh Effect 编译器服务 - 调用 Rust 后端编译 .effect 文件
 * @en Effect Compiler Service - Call Rust backend to compile .effect files
 */

import { invoke } from '@tauri-apps/api/core';

/**
 * @zh 编译后的效果数据结构
 * @en Compiled effect data structure
 */
export interface CompiledEffect {
    name: string;
    techniques: TechniqueInfo[];
    shaders: ShaderInfo[];
}

export interface TechniqueInfo {
    name?: string;
    passes: PassInfo[];
}

export interface PassInfo {
    program: string;
    blendState?: BlendStateInfo;
    rasterizerState?: RasterizerStateInfo;
    depthStencilState?: DepthStencilStateInfo;
    properties?: Record<string, PropertyInfo>;
}

export interface BlendStateInfo {
    targets: BlendTargetInfo[];
}

export interface BlendTargetInfo {
    blend?: boolean;
    blendSrc?: number;
    blendDst?: number;
    blendSrcAlpha?: number;
    blendDstAlpha?: number;
}

export interface RasterizerStateInfo {
    cullMode: number;
}

export interface DepthStencilStateInfo {
    depthTest?: boolean;
    depthWrite?: boolean;
}

export interface PropertyInfo {
    value: unknown;
    type: number;
}

export interface ShaderInfo {
    name: string;
    hash: number;
    builtins: BuiltinsInfo;
    defines: DefineInfo[];
    attributes: AttributeInfo[];
    blocks: BlockInfo[];
    samplerTextures: SamplerTextureInfo[];
    buffers: unknown[];
    images: unknown[];
    textures: unknown[];
    samplers: unknown[];
    subpassInputs: unknown[];
    glsl4?: GlslSource;
    glsl3?: GlslSource;
    glsl1?: GlslSource;
}

export interface GlslSource {
    vert: string;
    frag: string;
}

export interface BuiltinsInfo {
    statistics: Record<string, number>;
    globals: BuiltinBindingsInfo;
    locals: BuiltinBindingsInfo;
}

export interface BuiltinBindingsInfo {
    blocks: BuiltinBlockRef[];
    samplerTextures: BuiltinSamplerRef[];
    buffers: unknown[];
    images: unknown[];
}

export interface BuiltinBlockRef {
    name: string;
    defines: string[];
}

export interface BuiltinSamplerRef {
    name: string;
    defines: string[];
}

export interface DefineInfo {
    name: string;
    type: string;
    range?: number[];
    options?: string[];
    default?: string;
}

export interface AttributeInfo {
    name: string;
    defines: string[];
    format: number;
    location: number;
    isNormalized?: boolean;
    isInstanced?: boolean;
}

export interface BlockInfo {
    name: string;
    defines: string[];
    binding: number;
    stageFlags: number;
    members: UniformMember[];
}

export interface UniformMember {
    name: string;
    type: number;
    count: number;
}

export interface SamplerTextureInfo {
    name: string;
    type: number;
    count: number;
    defines: string[];
    stageFlags: number;
    binding: number;
}

/**
 * @zh Effect 编译器服务
 * @en Effect Compiler Service
 */
class EffectCompilerService {
    private cachedEffects: CompiledEffect[] | null = null;
    private enginePath: string | null = null;

    /**
     * @zh 设置引擎路径
     * @en Set engine path
     */
    setEnginePath(path: string): void {
        this.enginePath = path;
        // Clear cache when path changes
        this.cachedEffects = null;
    }

    /**
     * @zh 编译单个效果文件
     * @en Compile a single effect file
     */
    async compileEffect(effectPath: string): Promise<CompiledEffect> {
        if (!this.enginePath) {
            throw new Error('Engine path not set');
        }

        return invoke<CompiledEffect>('compile_effect', {
            effectPath,
            enginePath: this.enginePath,
        });
    }

    /**
     * @zh 编译所有内置效果
     * @en Compile all builtin effects
     */
    async compileBuiltinEffects(): Promise<CompiledEffect[]> {
        if (this.cachedEffects) {
            return this.cachedEffects;
        }

        if (!this.enginePath) {
            throw new Error('Engine path not set');
        }


        try {
            const effects = await invoke<CompiledEffect[]>('compile_builtin_effects', {
                enginePath: this.enginePath,
            });

            this.cachedEffects = effects;
            return effects;
        } catch (error) {
            console.error('[EffectCompiler] Failed to compile effects:', error);
            throw error;
        }
    }

    /**
     * @zh 清除缓存
     * @en Clear cache
     */
    clearCache(): void {
        this.cachedEffects = null;
    }

    /**
     * @zh 获取缓存的效果
     * @en Get cached effects
     */
    getCachedEffects(): CompiledEffect[] | null {
        return this.cachedEffects;
    }
}

// Singleton instance
let effectCompilerInstance: EffectCompilerService | null = null;

/**
 * @zh 获取 Effect 编译器服务实例
 * @en Get Effect Compiler service instance
 */
export function getEffectCompiler(): EffectCompilerService {
    if (!effectCompilerInstance) {
        effectCompilerInstance = new EffectCompilerService();
    }
    return effectCompilerInstance;
}

export { EffectCompilerService };
