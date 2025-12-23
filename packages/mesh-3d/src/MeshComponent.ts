/**
 * MeshComponent - 3D mesh rendering component.
 * MeshComponent - 3D 网格渲染组件。
 */

import { Component, ECSComponent, Property, Serializable, Serialize } from '@esengine/ecs-framework';
import { SortingLayers, type ISortable } from '@esengine/engine-core';
import type { IGLTFAsset, IMeshData } from '@esengine/asset-system';

/**
 * 3D Mesh component for rendering GLTF models.
 * 用于渲染 GLTF 模型的 3D 网格组件。
 *
 * Requires TransformComponent for positioning and MeshRenderSystem for rendering.
 * 需要 TransformComponent 进行定位，MeshRenderSystem 进行渲染。
 */
@ECSComponent('Mesh', { requires: ['Transform'] })
@Serializable({ version: 1, typeId: 'Mesh' })
export class MeshComponent extends Component implements ISortable {
    /**
     * 模型资产 GUID
     * Model asset GUID
     *
     * Stores the unique identifier of the GLTF/GLB/OBJ/FBX model asset.
     * 存储 GLTF/GLB/OBJ/FBX 模型资产的唯一标识符。
     */
    @Serialize()
    @Property({ type: 'asset', label: 'Model', assetType: 'any', extensions: ['.gltf', '.glb', '.obj', '.fbx'] })
    public modelGuid: string = '';

    /**
     * 运行时网格数据（从资产加载）
     * Runtime mesh data (loaded from asset)
     */
    public meshAsset: IGLTFAsset | null = null;

    /**
     * 当前活动的网格索引（用于多网格模型）
     * Active mesh index (for multi-mesh models)
     */
    @Serialize()
    @Property({ type: 'integer', label: 'Mesh Index', min: 0 })
    public meshIndex: number = 0;

    /**
     * 是否投射阴影
     * Whether to cast shadows
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Cast Shadows' })
    public castShadows: boolean = true;

    /**
     * 是否接收阴影
     * Whether to receive shadows
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Receive Shadows' })
    public receiveShadows: boolean = true;

    /**
     * 可见性
     * Visibility
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Visible' })
    public visible: boolean = true;

    /**
     * 排序层（用于透明物体排序）
     * Sorting layer (for transparent object sorting)
     */
    @Serialize()
    @Property({
        type: 'enum',
        label: 'Sorting Layer',
        options: ['Background', 'Default', 'Foreground', 'WorldOverlay', 'UI', 'ScreenOverlay', 'Modal']
    })
    public sortingLayer: string = SortingLayers.Default;

    /**
     * 层内排序顺序
     * Order in layer
     */
    @Serialize()
    @Property({ type: 'integer', label: 'Order In Layer' })
    public orderInLayer: number = 0;

    /**
     * 材质覆盖 GUID 列表（可选）
     * Material override GUIDs (optional)
     */
    @Serialize()
    public materialOverrides: string[] = [];

    /**
     * 运行时材质 ID 列表
     * Runtime material IDs
     */
    public runtimeMaterialIds: number[] = [];

    /**
     * 运行时纹理 ID 列表
     * Runtime texture IDs
     */
    public runtimeTextureIds: number[] = [];

    /**
     * 资产是否已加载
     * Whether asset is loaded
     */
    public get isLoaded(): boolean {
        return this.meshAsset !== null;
    }

    /**
     * 获取当前网格数据
     * Get current mesh data
     */
    public get currentMesh(): IMeshData | null {
        if (!this.meshAsset || !this.meshAsset.meshes.length) return null;
        const index = Math.min(this.meshIndex, this.meshAsset.meshes.length - 1);
        return this.meshAsset.meshes[index];
    }

    /**
     * 获取所有网格数据
     * Get all mesh data
     */
    public get allMeshes(): IMeshData[] {
        return this.meshAsset?.meshes ?? [];
    }

    /**
     * 重置组件
     * Reset component
     */
    reset(): void {
        this.modelGuid = '';
        this.meshAsset = null;
        this.meshIndex = 0;
        this.castShadows = true;
        this.receiveShadows = true;
        this.visible = true;
        this.sortingLayer = 'Default';
        this.orderInLayer = 0;
        this.materialOverrides = [];
        this.runtimeMaterialIds = [];
        this.runtimeTextureIds = [];
    }
}
