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
import { UITransformComponent, UIRenderComponent, UITextComponent } from '@esengine/ui';
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
 * UI 元素调试信息
 * UI element debug info
 */
export interface UIDebugInfo {
    entityId: number;
    entityName: string;
    type: 'rect' | 'image' | 'text' | 'ninepatch' | 'circle' | 'rounded-rect' | 'unknown';
    x: number;
    y: number;
    width: number;
    height: number;
    worldX: number;
    worldY: number;
    rotation: number;
    visible: boolean;
    alpha: number;
    sortingLayer: string;
    orderInLayer: number;
    textureGuid?: string;
    textureUrl?: string;
    backgroundColor?: string;
    text?: string;
    fontSize?: number;
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
    uiElements: UIDebugInfo[];
    stats: {
        totalSprites: number;
        totalParticles: number;
        totalUIElements: number;
        totalTextures: number;
        drawCalls: number;
    };
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
            console.log('[RenderDebugService] Texture from cache:', textureGuid);
            return this._textureCache.get(textureGuid);
        }

        // 如果正在加载中，返回 undefined | If loading, return undefined
        if (this._texturePending.has(textureGuid)) {
            console.log('[RenderDebugService] Texture loading:', textureGuid);
            return undefined;
        }

        // 异步加载纹理 | Load texture asynchronously
        console.log('[RenderDebugService] Starting texture load:', textureGuid);
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
            console.log('[RenderDebugService] Loading texture:', fullPath);
            const base64 = await invoke<string>('read_file_as_base64', { filePath: fullPath });
            const dataUrl = `data:${mimeType};base64,${base64}`;

            console.log('[RenderDebugService] Texture loaded, base64 length:', base64.length);
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
            uiElements: this._collectUI(scene.entities.buffer),
            stats: {
                totalSprites: 0,
                totalParticles: 0,
                totalUIElements: 0,
                totalTextures: 0,
                drawCalls: 0,
            },
        };

        // 计算统计 | Calculate stats
        snapshot.stats.totalSprites = snapshot.sprites.length;
        snapshot.stats.totalParticles = snapshot.particles.reduce((sum, p) => sum + p.activeCount, 0);
        snapshot.stats.totalUIElements = snapshot.uiElements.length;
        snapshot.stats.totalTextures = snapshot.textures.length;

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
     * 收集 UI 元素信息
     * Collect UI element info
     */
    private _collectUI(entities: readonly Entity[]): UIDebugInfo[] {
        const uiElements: UIDebugInfo[] = [];

        for (const entity of entities) {
            const uiTransform = entity.getComponent(UITransformComponent);

            if (!uiTransform) continue;

            const uiRender = entity.getComponent(UIRenderComponent);
            const uiText = entity.getComponent(UITextComponent);

            // 确定类型 | Determine type
            let type: UIDebugInfo['type'] = 'unknown';
            if (uiText) {
                type = 'text';
            } else if (uiRender) {
                switch (uiRender.type) {
                    case 'rect': type = 'rect'; break;
                    case 'image': type = 'image'; break;
                    case 'ninepatch': type = 'ninepatch'; break;
                    case 'circle': type = 'circle'; break;
                    case 'rounded-rect': type = 'rounded-rect'; break;
                    default: type = 'rect';
                }
            }

            // 获取纹理 GUID | Get texture GUID
            const textureGuid = uiRender?.textureGuid?.toString() ?? '';

            // 转换颜色为十六进制字符串 | Convert color to hex string
            const backgroundColor = uiRender?.backgroundColor !== undefined
                ? `#${uiRender.backgroundColor.toString(16).padStart(6, '0')}`
                : undefined;

            uiElements.push({
                entityId: entity.id,
                entityName: entity.name,
                type,
                x: uiTransform.x,
                y: uiTransform.y,
                width: uiTransform.width,
                height: uiTransform.height,
                worldX: uiTransform.worldX,
                worldY: uiTransform.worldY,
                rotation: uiTransform.rotation,
                visible: uiTransform.visible && uiTransform.worldVisible,
                alpha: uiTransform.worldAlpha,
                sortingLayer: uiTransform.sortingLayer,
                orderInLayer: uiTransform.orderInLayer,
                textureGuid: textureGuid || undefined,
                textureUrl: textureGuid ? this._resolveTextureUrl(textureGuid) : undefined,
                backgroundColor,
                text: uiText?.text,
                fontSize: uiText?.fontSize,
            });
        }

        return uiElements;
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

// 导出到全局以便控制台使用 | Export to global for console usage
if (typeof window !== 'undefined') {
    (window as any).renderDebugService = renderDebugService;
}
