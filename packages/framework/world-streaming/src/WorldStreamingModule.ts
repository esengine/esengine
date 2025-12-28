import type { IScene, ServiceContainer, IComponentRegistry } from '@esengine/ecs-framework';
import { ChunkComponent } from './components/ChunkComponent';
import { StreamingAnchorComponent } from './components/StreamingAnchorComponent';
import { ChunkLoaderComponent } from './components/ChunkLoaderComponent';
import { ChunkStreamingSystem } from './systems/ChunkStreamingSystem';
import { ChunkCullingSystem } from './systems/ChunkCullingSystem';
import { ChunkManager } from './services/ChunkManager';

/**
 * 世界流式加载配置
 *
 * Configuration for world streaming setup.
 */
export interface IWorldStreamingSetupOptions {
    /**
     * 区块大小（世界单位）
     *
     * Chunk size in world units.
     */
    chunkSize?: number;

    /**
     * 是否添加 Culling 系统
     *
     * Whether to add the culling system.
     */
    bEnableCulling?: boolean;
}

/**
 * 世界流式加载模块
 *
 * Helper class for setting up world streaming functionality.
 *
 * 提供世界流式加载功能的帮助类。
 */
export class WorldStreamingModule {
    private _chunkManager: ChunkManager | null = null;

    get chunkManager(): ChunkManager | null {
        return this._chunkManager;
    }

    /**
     * 注册组件到注册表
     *
     * Register streaming components to registry.
     */
    registerComponents(registry: IComponentRegistry): void {
        registry.register(ChunkComponent);
        registry.register(StreamingAnchorComponent);
        registry.register(ChunkLoaderComponent);
    }

    /**
     * 注册服务到容器
     *
     * Register streaming services to container.
     */
    registerServices(services: ServiceContainer, chunkSize?: number): void {
        this._chunkManager = new ChunkManager(chunkSize);
        services.registerInstance(ChunkManager, this._chunkManager);
    }

    /**
     * 创建并添加系统到场景
     *
     * Create and add streaming systems to scene.
     */
    createSystems(scene: IScene, options?: IWorldStreamingSetupOptions): void {
        const streamingSystem = new ChunkStreamingSystem();
        if (this._chunkManager) {
            streamingSystem.setChunkManager(this._chunkManager);
        }
        scene.addSystem(streamingSystem);

        if (options?.bEnableCulling !== false) {
            scene.addSystem(new ChunkCullingSystem());
        }
    }

    /**
     * 一键设置流式加载
     *
     * Setup world streaming in one call.
     */
    setup(
        scene: IScene,
        services: ServiceContainer,
        registry: IComponentRegistry,
        options?: IWorldStreamingSetupOptions
    ): ChunkManager {
        this.registerComponents(registry);
        this.registerServices(services, options?.chunkSize);
        this.createSystems(scene, options);
        return this._chunkManager!;
    }
}

export const worldStreamingModule = new WorldStreamingModule();
