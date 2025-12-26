/**
 * 渲染调试服务
 * Render Debug Service
 *
 * 从引擎收集渲染调试数据
 * Collects render debug data from the engine
 */

import { Core, Entity } from '@esengine/ecs-framework';
import { TransformComponent } from '@esengine/engine-core';
import { SpriteComponent } from '@esengine/sprite';
import { ParticleSystemComponent } from '@esengine/particle';
import { FGUIComponent, GRoot, GComponent } from '@esengine/fairygui';
import { AssetRegistryService, ProjectService } from '@esengine/editor-core';
import { invoke } from '@tauri-apps/api/core';

/**
 * 纹理调试信息
 * Texture debug info
 */
export interface TextureDebugInfo {
    id: number;
    path: string;
    width: number;
    height: number;
    state: 'loading' | 'ready' | 'failed';
}

/**
 * Shader uniform 值
 * Shader uniform value
 */
export interface UniformDebugValue {
    type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'color' | 'int';
    value: number | number[];
}

/**
 * Sprite 调试信息
 * Sprite debug info
 */
export interface SpriteDebugInfo {
    entityId: number;
    entityName: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    textureId: number;
    texturePath: string;
    /** 预解析的纹理 URL（可直接用于 img src）| Pre-resolved texture URL (can be used directly in img src) */
    textureUrl?: string;
    uv: [number, number, number, number];
    color: string;
    alpha: number;
    sortingLayer: string;
    orderInLayer: number;
    /** 材质/着色器 ID | Material/Shader ID */
    materialId: number;
    /** 着色器名称 | Shader name */
    shaderName: string;
    /** Shader uniform 覆盖值 | Shader uniform override values */
    uniforms: Record<string, UniformDebugValue>;
    /** 顶点属性: 宽高比 (width/height) | Vertex attribute: aspect ratio */
    aspectRatio: number;
}

/**
 * 粒子调试信息
 * Particle debug info
 */
export interface ParticleDebugInfo {
    entityId: number;
    entityName: string;
    systemName: string;
    isPlaying: boolean;
    activeCount: number;
    maxParticles: number;
    textureId: number;
    texturePath: string;
    /** 预解析的纹理 URL（可直接用于 img src）| Pre-resolved texture URL (can be used directly in img src) */
    textureUrl?: string;
    textureSheetAnimation: {
        enabled: boolean;
        tilesX: number;
        tilesY: number;
        totalFrames: number;
    } | null;
    sampleParticles: Array<{
        index: number;
        x: number;
        y: number;
        frame: number;
        uv: [number, number, number, number];
        age: number;
        lifetime: number;
        size: number;
        color: string;
        alpha: number;
    }>;
}

/**
 * FairyGUI 元素调试信息
 * FairyGUI element debug info
 */
export interface FGUIDebugInfo {
    entityId: number;
    entityName: string;
    packageName: string;
    componentName: string;
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
    alpha: number;
    /** 子对象数量 | Child count */
    childCount: number;
}

/**
 * 渲染调试快照
 * Render debug snapshot
 */
export interface RenderDebugSnapshot {
    timestamp: number;
    frameNumber: number;
    textures: TextureDebugInfo[];
    sprites: SpriteDebugInfo[];
    particles: ParticleDebugInfo[];
    fguiElements: FGUIDebugInfo[];
    stats: {
        totalSprites: number;
        totalParticles: number;
        totalFGUIElements: number;
        totalTextures: number;
        drawCalls: number;
    };
}

/**
 * 内置着色器 ID 到名称的映射
 * Built-in shader ID to name mapping
 */
const SHADER_NAMES: Record<number, string> = {
    0: 'DefaultSprite',
    1: 'Grayscale',
    2: 'Tint',
    3: 'Flash',
    4: 'Outline',
    5: 'Shiny'
};

/**
 * 根据材质/着色器 ID 获取着色器名称
 * Get shader name from material/shader ID
 */
function getShaderName(id: number): string {
    return SHADER_NAMES[id] ?? `Custom(${id})`;
}

/**
 * 渲染调试服务
 * Render Debug Service
 */
export class RenderDebugService {
    private static _instance: RenderDebugService | null = null;
    private _frameNumber: number = 0;
    private _enabled: boolean = false;
    private _snapshots: RenderDebugSnapshot[] = [];
    private _maxSnapshots: number = 60;

    // 引擎引用 | Engine reference
    private _engineBridge: any = null;

    static getInstance(): RenderDebugService {
        if (!RenderDebugService._instance) {
            RenderDebugService._instance = new RenderDebugService();
        }
        return RenderDebugService._instance;
    }

    /**
     * 设置引擎桥接
     * Set engine bridge
     */
    setEngineBridge(bridge: any): void {
        this._engineBridge = bridge;
    }

    /**
     * 启用/禁用调试
     * Enable/disable debugging
     */
    setEnabled(enabled: boolean): void {
        this._enabled = enabled;
        if (!enabled) {
            this._snapshots = [];
        }
    }

    get enabled(): boolean {
        return this._enabled;
    }

    // 纹理 base64 缓存 | Texture base64 cache
    private _textureCache = new Map<string, string>();
    private _texturePending = new Set<string>();

    /**
     * 解析纹理 GUID 为 base64 data URL（从缓存获取）
     * Resolve texture GUID to base64 data URL (from cache)
     */
    private _resolveTextureUrl(textureGuid: string | null | undefined): string | undefined {
        if (!textureGuid) return undefined;

        // 从缓存获取 | Get from cache
        if (this._textureCache.has(textureGuid)) {
            return this._textureCache.get(textureGuid);
        }

        // 如果正在加载中，返回 undefined | If loading, return undefined
        if (this._texturePending.has(textureGuid)) {
            return undefined;
        }

        // 异步加载纹理 | Load texture asynchronously
        this._loadTextureToCache(textureGuid);
        return undefined;
    }

    /**
     * 异步加载纹理到缓存
     * Load texture to cache asynchronously
     */
    private async _loadTextureToCache(textureGuid: string): Promise<void> {
        if (this._textureCache.has(textureGuid) || this._texturePending.has(textureGuid)) {
            return;
        }

        this._texturePending.add(textureGuid);

        try {
            const assetRegistry = Core.services.tryResolve(AssetRegistryService) as AssetRegistryService | null;
            const projectService = Core.services.tryResolve(ProjectService) as { getCurrentProject: () => { path: string } | null } | null;

            let resolvedPath: string | null = null;

            // 检查是否是 GUID 格式 | Check if GUID format
            const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(textureGuid);

            if (isGuid && assetRegistry) {
                resolvedPath = assetRegistry.getPathByGuid(textureGuid) || null;
            } else {
                resolvedPath = textureGuid;
            }

            if (!resolvedPath) {
                this._texturePending.delete(textureGuid);
                return;
            }

            // 检查是否是图片 | Check if image
            const ext = resolvedPath.toLowerCase().split('.').pop() || '';
            const imageExts: Record<string, string> = {
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'gif': 'image/gif',
                'webp': 'image/webp',
                'bmp': 'image/bmp'
            };

            const mimeType = imageExts[ext];
            if (!mimeType) {
                this._texturePending.delete(textureGuid);
                return;
            }

            // 构建完整路径 | Build full path
            const projectPath = projectService?.getCurrentProject()?.path;
            const fullPath = resolvedPath.startsWith('/') || resolvedPath.includes(':')
                ? resolvedPath
                : projectPath
                    ? `${projectPath}/${resolvedPath}`
                    : resolvedPath;

            // 通过 Tauri command 读取文件并转为 base64 | Read file via Tauri command and convert to base64
            const base64 = await invoke<string>('read_file_as_base64', { filePath: fullPath });
            const dataUrl = `data:${mimeType};base64,${base64}`;

            this._textureCache.set(textureGuid, dataUrl);
        } catch (err) {
            console.error('[RenderDebugService] Failed to load texture:', textureGuid, err);
        } finally {
            this._texturePending.delete(textureGuid);
        }
    }

    /**
     * 收集当前帧的调试数据
     * Collect debug data for current frame
     */
    collectSnapshot(): RenderDebugSnapshot | null {
        if (!this._enabled) return null;

        const scene = Core.scene;
        if (!scene) return null;

        this._frameNumber++;

        const snapshot: RenderDebugSnapshot = {
            timestamp: Date.now(),
            frameNumber: this._frameNumber,
            textures: this._collectTextures(),
            sprites: this._collectSprites(scene.entities.buffer),
            particles: this._collectParticles(scene.entities.buffer),
            fguiElements: this._collectFGUI(scene.entities.buffer),
            stats: {
                totalSprites: 0,
                totalParticles: 0,
                totalFGUIElements: 0,
                totalTextures: 0,
                drawCalls: 0,
            },
        };

        // 计算统计 | Calculate stats
        snapshot.stats.totalSprites = snapshot.sprites.length;
        snapshot.stats.totalParticles = snapshot.particles.reduce((sum, p) => sum + p.activeCount, 0);
        snapshot.stats.totalFGUIElements = snapshot.fguiElements.length;
        snapshot.stats.totalTextures = snapshot.textures.length;
        snapshot.stats.drawCalls = snapshot.sprites.length + snapshot.particles.length + snapshot.fguiElements.length;

        // 保存快照 | Save snapshot
        this._snapshots.push(snapshot);
        if (this._snapshots.length > this._maxSnapshots) {
            this._snapshots.shift();
        }

        return snapshot;
    }

    /**
     * 获取最新快照
     * Get latest snapshot
     */
    getLatestSnapshot(): RenderDebugSnapshot | null {
        return this._snapshots.length > 0 ? this._snapshots[this._snapshots.length - 1] ?? null : null;
    }

    /**
     * 获取所有快照
     * Get all snapshots
     */
    getSnapshots(): RenderDebugSnapshot[] {
        return [...this._snapshots];
    }

    /**
     * 清除快照
     * Clear snapshots
     */
    clearSnapshots(): void {
        this._snapshots = [];
    }

    /**
     * 收集纹理信息
     * Collect texture info
     */
    private _collectTextures(): TextureDebugInfo[] {
        const textures: TextureDebugInfo[] = [];

        // TODO: 从 EngineBridge 获取纹理管理器数据
        // TODO: Get texture manager data from EngineBridge
        if (this._engineBridge) {
            // const textureManager = this._engineBridge.getTextureManager();
            // for (const [id, tex] of textureManager.entries()) {
            //     textures.push({ ... });
            // }
        }

        return textures;
    }

    /**
     * 收集 Sprite 信息
     * Collect sprite info
     */
    private _collectSprites(entities: readonly Entity[]): SpriteDebugInfo[] {
        const sprites: SpriteDebugInfo[] = [];

        for (const entity of entities) {
            const sprite = entity.getComponent(SpriteComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!sprite || !transform) continue;

            const pos = transform.worldPosition ?? transform.position;
            const rot = typeof transform.rotation === 'number'
                ? transform.rotation
                : transform.rotation.z;

            const textureGuid = sprite.textureGuid ?? '';
            const materialId = sprite.getMaterialId?.() ?? 0;

            // 收集 uniform 覆盖值 | Collect uniform override values
            const uniforms: Record<string, UniformDebugValue> = {};
            const overrides = sprite.materialOverrides ?? {};
            for (const [name, override] of Object.entries(overrides)) {
                uniforms[name] = {
                    type: override.type,
                    value: override.value
                };
            }

            // 计算 aspectRatio (与 Rust 端一致: width / height)
            // Calculate aspectRatio (same as Rust side: width / height)
            const width = sprite.width * (transform.scale?.x ?? 1);
            const height = sprite.height * (transform.scale?.y ?? 1);
            const aspectRatio = Math.abs(height) > 0.001 ? width / height : 1.0;

            sprites.push({
                entityId: entity.id,
                entityName: entity.name,
                x: pos.x,
                y: pos.y,
                width: sprite.width,
                height: sprite.height,
                rotation: rot,
                textureId: (sprite as any).textureId ?? 0,
                texturePath: textureGuid,
                textureUrl: this._resolveTextureUrl(textureGuid),
                uv: [...sprite.uv] as [number, number, number, number],
                color: sprite.color,
                alpha: sprite.alpha,
                sortingLayer: sprite.sortingLayer,
                orderInLayer: sprite.orderInLayer,
                materialId,
                shaderName: getShaderName(materialId),
                uniforms,
                aspectRatio,
            });
        }

        return sprites;
    }

    /**
     * 收集粒子系统信息
     * Collect particle system info
     */
    private _collectParticles(entities: readonly Entity[]): ParticleDebugInfo[] {
        const particleSystems: ParticleDebugInfo[] = [];

        for (const entity of entities) {
            const ps = entity.getComponent(ParticleSystemComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!ps) continue;

            const pool = ps.pool;

            // 通过 getModule 获取 TextureSheetAnimation 模块 | Get TextureSheetAnimation module via getModule
            const textureSheetAnim = ps.getModule?.('TextureSheetAnimation') as any;

            // 收集所有活跃粒子 | Collect all active particles
            const sampleParticles: ParticleDebugInfo['sampleParticles'] = [];
            if (pool) {
                let count = 0;
                pool.forEachActive((p: any) => {
                    const tilesX = p._animTilesX ?? 1;
                    const tilesY = p._animTilesY ?? 1;
                    const frame = p._animFrame ?? 0;
                    const col = frame % tilesX;
                    const row = Math.floor(frame / tilesX);
                    const uWidth = 1 / tilesX;
                    const vHeight = 1 / tilesY;

                    sampleParticles.push({
                        index: count,
                        x: p.x,
                        y: p.y,
                        frame,
                        uv: [
                            col * uWidth,
                            row * vHeight,
                            (col + 1) * uWidth,
                            (row + 1) * vHeight,
                        ],
                        age: p.age,
                        lifetime: p.lifetime,
                        size: p.size ?? p.startSize ?? 1,
                        color: p.color ?? '#ffffff',
                        alpha: p.alpha ?? 1,
                    });
                    count++;
                });
            }

            // 获取模块的 tilesX/tilesY | Get tilesX/tilesY from module
            const tilesX = textureSheetAnim?.tilesX ?? 1;
            const tilesY = textureSheetAnim?.tilesY ?? 1;
            const totalFrames = textureSheetAnim?.actualTotalFrames ?? (tilesX * tilesY);

            const textureGuid = ps.textureGuid ?? '';
            particleSystems.push({
                entityId: entity.id,
                entityName: entity.name,
                systemName: `ParticleSystem_${entity.id}`,
                isPlaying: ps.isPlaying,
                activeCount: pool?.activeCount ?? 0,
                maxParticles: ps.maxParticles,
                textureId: ps.textureId ?? 0,
                texturePath: textureGuid,
                textureUrl: this._resolveTextureUrl(textureGuid),
                textureSheetAnimation: textureSheetAnim?.enabled ? {
                    enabled: true,
                    tilesX,
                    tilesY,
                    totalFrames,
                } : null,
                sampleParticles,
            });
        }

        return particleSystems;
    }

    /**
     * 收集 FairyGUI 元素信息
     * Collect FairyGUI element info
     */
    private _collectFGUI(entities: readonly Entity[]): FGUIDebugInfo[] {
        const fguiElements: FGUIDebugInfo[] = [];

        for (const entity of entities) {
            const fguiComp = entity.getComponent(FGUIComponent) as FGUIComponent | null;

            if (!fguiComp) continue;

            const root = fguiComp.root;
            const displayObject = root as GComponent | null;

            fguiElements.push({
                entityId: entity.id,
                entityName: entity.name,
                packageName: fguiComp.packageGuid ?? '',
                componentName: fguiComp.componentName ?? '',
                x: displayObject?.x ?? 0,
                y: displayObject?.y ?? 0,
                width: displayObject?.width ?? 0,
                height: displayObject?.height ?? 0,
                visible: displayObject?.visible ?? true,
                alpha: displayObject?.alpha ?? 1,
                childCount: displayObject?.numChildren ?? 0,
            });
        }

        return fguiElements;
    }

    /**
     * 导出调试数据为 JSON
     * Export debug data as JSON
     */
    exportAsJSON(): string {
        return JSON.stringify({
            exportTime: new Date().toISOString(),
            snapshots: this._snapshots,
        }, null, 2);
    }

    /**
     * 打印当前粒子 UV 到控制台
     * Print current particle UVs to console
     */
    logParticleUVs(): void {
        const snapshot = this.collectSnapshot();
        if (!snapshot) {
            console.log('[RenderDebugService] No scene available');
            return;
        }

        console.group('[RenderDebugService] Particle UV Debug');
        for (const ps of snapshot.particles) {
            console.group(`${ps.entityName} (${ps.activeCount} active)`);
            if (ps.textureSheetAnimation) {
                console.log(`TextureSheetAnimation: ${ps.textureSheetAnimation.tilesX}x${ps.textureSheetAnimation.tilesY}`);
            }
            for (const p of ps.sampleParticles) {
                console.log(`  Particle ${p.index}: frame=${p.frame}, UV=[${p.uv.map(v => v.toFixed(3)).join(', ')}]`);
            }
            console.groupEnd();
        }
        console.groupEnd();
    }
}

// 全局实例 | Global instance
export const renderDebugService = RenderDebugService.getInstance();
