/**
 * MeshAssetLoaderSystem - System for loading mesh assets on demand.
 * MeshAssetLoaderSystem - 按需加载网格资产的系统。
 */

import { EntitySystem, Matcher, ECSSystem, Entity } from '@esengine/ecs-framework';
import type { IAssetManager, IGLTFAsset } from '@esengine/asset-system';
import { MeshComponent } from '../MeshComponent';

/**
 * System for loading mesh assets when modelGuid changes.
 * 当 modelGuid 变化时加载网格资产的系统。
 *
 * This system monitors MeshComponents and loads their model assets
 * when the modelGuid property is set and the asset isn't loaded yet.
 * 此系统监视 MeshComponent 并在设置 modelGuid 属性且资产尚未加载时加载其模型资产。
 */
@ECSSystem('MeshAssetLoader', { updateOrder: 50 })
export class MeshAssetLoaderSystem extends EntitySystem {
    private assetManager: IAssetManager | null = null;
    private loadingSet: Set<string> = new Set();

    constructor() {
        super(Matcher.empty().all(MeshComponent));
    }

    /**
     * Set the asset manager for loading assets.
     * 设置用于加载资产的资产管理器。
     */
    public setAssetManager(manager: IAssetManager): void {
        this.assetManager = manager;
    }

    /**
     * Process entities each frame.
     * 每帧处理实体。
     */
    protected override process(entities: readonly Entity[]): void {
        for (const entity of entities) {
            if (!entity.enabled) continue;
            this.checkAndLoadAsset(entity);
        }
    }

    /**
     * Check if a mesh component needs its asset loaded.
     * 检查网格组件是否需要加载其资产。
     */
    private checkAndLoadAsset(entity: Entity): void {
        const mesh = entity.getComponent(MeshComponent);
        if (!mesh) return;

        // Skip if no modelGuid
        // 如果没有 modelGuid 则跳过
        if (!mesh.modelGuid) return;

        // Skip if already loaded
        // 如果已加载则跳过
        if (mesh.isLoaded) return;

        // Skip if already loading
        // 如果正在加载则跳过
        const loadKey = `${entity.id}:${mesh.modelGuid}`;
        if (this.loadingSet.has(loadKey)) return;

        // Start loading
        // 开始加载
        this.loadingSet.add(loadKey);
        this.loadMeshAsset(entity, mesh, loadKey);
    }

    /**
     * Load a mesh asset using the asset manager.
     * 使用资产管理器加载网格资产。
     */
    private async loadMeshAsset(entity: Entity, mesh: MeshComponent, loadKey: string): Promise<void> {
        try {
            if (!this.assetManager) {
                console.warn('[MeshAssetLoaderSystem] No asset manager available');
                return;
            }

            const modelGuid = mesh.modelGuid;

            // Try to load using asset manager
            // 尝试使用资产管理器加载
            console.log(`[MeshAssetLoaderSystem] Loading: ${modelGuid}`);

            // Check if it's a GUID or a path
            // 检查是否是 GUID 还是路径
            const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(modelGuid);

            let result;
            if (isGuid) {
                result = await this.assetManager.loadAsset<IGLTFAsset>(modelGuid);
            } else {
                result = await this.assetManager.loadAssetByPath<IGLTFAsset>(modelGuid);
            }

            // Check if entity still exists and has the same modelGuid
            // 检查实体是否仍然存在且 modelGuid 是否相同
            if (!entity.enabled || mesh.modelGuid !== modelGuid) {
                return;
            }

            // IAssetLoadResult contains: asset, handle, metadata, loadTime
            // API throws on error, returns result directly on success
            // IAssetLoadResult 包含：asset, handle, metadata, loadTime
            // API 在错误时抛出异常，成功时直接返回结果
            if (result && result.asset) {
                mesh.meshAsset = result.asset;
                console.log(`[MeshAssetLoaderSystem] Loaded: ${modelGuid} (${result.asset.meshes?.length ?? 0} meshes)`);
            } else {
                console.warn(`[MeshAssetLoaderSystem] No asset returned for ${modelGuid}`);
            }

        } catch (error) {
            console.error(`[MeshAssetLoaderSystem] Failed to load ${mesh.modelGuid}:`, error);
        } finally {
            this.loadingSet.delete(loadKey);
        }
    }
}
