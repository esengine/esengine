/**
 * MeshRenderSystem - System for rendering 3D meshes.
 * MeshRenderSystem - 3D 网格渲染系统。
 */

import { EntitySystem, Matcher, ECSSystem, Entity } from '@esengine/ecs-framework';
import type { EngineBridge } from '@esengine/ecs-engine-bindgen';
import { TransformComponent } from '@esengine/engine-core';
import type { IMeshData } from '@esengine/asset-system';
import { MeshComponent } from '../MeshComponent';

/**
 * System for rendering 3D mesh components.
 * 用于渲染 3D 网格组件的系统。
 *
 * Queries all entities with MeshComponent and TransformComponent,
 * builds interleaved vertex data, and submits to the Rust engine.
 * 查询所有具有 MeshComponent 和 TransformComponent 的实体，
 * 构建交错顶点数据并提交到 Rust 引擎。
 */
@ECSSystem('MeshRender', { updateOrder: 900 })
export class MeshRenderSystem extends EntitySystem {
    private bridge: EngineBridge | null;

    // Reusable buffers for performance
    // 可重用缓冲区以提高性能
    private vertexBuffer: Float32Array = new Float32Array(0);
    private transformBuffer: Float32Array = new Float32Array(16);

    constructor(bridge: EngineBridge | null = null) {
        super(Matcher.empty().all(MeshComponent).all(TransformComponent));
        this.bridge = bridge;
    }

    /**
     * Set the engine bridge (can be called after construction).
     * 设置引擎桥接（可在构造后调用）。
     */
    public setEngineBridge(bridge: EngineBridge): void {
        this.bridge = bridge;
    }

    // 调试帧计数 | Debug frame counter
    private _frameCount = 0;
    private _lastLogTime = 0;

    /**
     * Process entities each frame.
     * 每帧处理实体。
     */
    protected override process(entities: readonly Entity[]): void {
        this._frameCount++;

        if (!this.bridge) {
            if (this._frameCount % 300 === 1) {
                console.warn('[MeshRenderSystem] No bridge available');
            }
            return;
        }

        // Check if in 3D mode (mode 1 = 3D)
        // 检查是否在 3D 模式
        const renderMode = this.bridge.getRenderMode();

        // Debug: log mode and entity count periodically
        // 调试：定期记录模式和实体数量
        const now = Date.now();
        if (now - this._lastLogTime > 3000) {
            this._lastLogTime = now;
            console.log(`[MeshRenderSystem] Mode: ${renderMode}, Entities: ${entities.length}`);

            // Log mesh status for each entity
            // 记录每个实体的网格状态
            for (const entity of entities) {
                const mesh = entity.getComponent(MeshComponent);
                if (mesh) {
                    console.log(`  - Entity ${entity.name}: modelGuid=${mesh.modelGuid?.substring(0, 8)}..., isLoaded=${mesh.isLoaded}, meshCount=${mesh.allMeshes.length}`);
                }
            }
        }

        if (renderMode !== 1) {
            // 2D mode, skip 3D rendering
            // 2D 模式，跳过 3D 渲染
            return;
        }

        for (const entity of entities) {
            if (!entity.enabled) continue;
            this.renderEntity(entity);
        }
    }

    // 调试：上次提交时间 | Debug: last submit time
    private _lastSubmitLogTime = 0;

    /**
     * Render a single entity's mesh.
     * 渲染单个实体的网格。
     */
    private renderEntity(entity: Entity): void {
        const mesh = entity.getComponent(MeshComponent);
        const transform = entity.getComponent(TransformComponent);

        if (!mesh || !transform || !mesh.visible || !mesh.isLoaded) {
            // Debug skip reason
            // 调试跳过原因
            const now = Date.now();
            if (now - this._lastSubmitLogTime > 5000) {
                this._lastSubmitLogTime = now;
                const reason = !mesh ? 'no mesh' :
                    !transform ? 'no transform' :
                        !mesh.visible ? 'not visible' :
                            !mesh.isLoaded ? 'not loaded' : 'unknown';
                console.log(`[MeshRenderSystem] Skip ${entity.name}: ${reason}`);
            }
            return;
        }

        // Get all meshes to render
        // 获取所有要渲染的网格
        const meshesToRender = mesh.allMeshes;
        if (meshesToRender.length === 0) {
            console.log(`[MeshRenderSystem] Skip ${entity.name}: no meshes`);
            return;
        }

        // Build world transform matrix
        // 构建世界变换矩阵
        this.buildTransformMatrix(transform);

        // Debug: log transform
        // 调试：记录变换
        const now = Date.now();
        if (now - this._lastSubmitLogTime > 5000) {
            this._lastSubmitLogTime = now;
            const pos = transform.position;
            console.log(`[MeshRenderSystem] Rendering ${entity.name}: ${meshesToRender.length} meshes`);
            console.log(`  Transform: pos(${pos.x?.toFixed(2) ?? 0}, ${pos.y?.toFixed(2) ?? 0}, ${pos.z?.toFixed(2) ?? 0})`);
        }

        // Render each mesh
        // 渲染每个网格
        for (let i = 0; i < meshesToRender.length; i++) {
            const meshData = meshesToRender[i];
            if (!meshData) continue;

            // Build interleaved vertex data
            // 构建交错顶点数据
            const vertexData = this.buildVertexData(meshData);
            if (!vertexData) {
                console.warn(`[MeshRenderSystem] Failed to build vertex data for mesh ${i}`);
                continue;
            }

            // Get material and texture IDs
            // 获取材质和纹理 ID
            const materialId = mesh.runtimeMaterialIds[i] ?? 0;
            const textureId = mesh.runtimeTextureIds[i] ?? 0;

            // Debug: log submission
            // 调试：记录提交
            if (now - this._lastSubmitLogTime < 100) {
                console.log(`  Submitting mesh ${i}: ${vertexData.length / 9} vertices, ${meshData.indices.length} indices`);
            }

            // Submit to engine
            // 提交到引擎
            try {
                this.bridge!.submitSimpleMesh3D(
                    vertexData,
                    new Uint32Array(meshData.indices),
                    this.transformBuffer,
                    materialId,
                    textureId
                );
            } catch (e) {
                console.error(`[MeshRenderSystem] submitSimpleMesh3D failed:`, e);
            }
        }
    }

    /**
     * Build 4x4 transform matrix from TransformComponent.
     * 从 TransformComponent 构建 4x4 变换矩阵。
     */
    private buildTransformMatrix(transform: TransformComponent): void {
        // Get world position, rotation, scale with safe defaults
        // 获取世界位置、旋转、缩放（带安全默认值）
        const rawPos = transform.worldPosition;
        const rawRot = transform.worldRotation; // Euler angles in degrees
        const rawScl = transform.worldScale;

        // Safe extraction with defaults for 2D components
        // 2D 组件的安全提取（带默认值）
        const pos = { x: rawPos.x ?? 0, y: rawPos.y ?? 0, z: rawPos.z ?? 0 };
        const rot = { x: rawRot.x ?? 0, y: rawRot.y ?? 0, z: rawRot.z ?? 0 };
        const scl = { x: rawScl.x ?? 1, y: rawScl.y ?? 1, z: rawScl.z ?? 1 };

        // Convert rotation to radians
        // 将旋转转换为弧度
        const rx = (rot.x * Math.PI) / 180;
        const ry = (rot.y * Math.PI) / 180;
        const rz = (rot.z * Math.PI) / 180;

        // Build rotation matrix (ZYX order)
        // 构建旋转矩阵（ZYX 顺序）
        const cx = Math.cos(rx), sx = Math.sin(rx);
        const cy = Math.cos(ry), sy = Math.sin(ry);
        const cz = Math.cos(rz), sz = Math.sin(rz);

        // Combined rotation matrix
        // 组合旋转矩阵
        const r00 = cy * cz;
        const r01 = cy * sz;
        const r02 = -sy;
        const r10 = sx * sy * cz - cx * sz;
        const r11 = sx * sy * sz + cx * cz;
        const r12 = sx * cy;
        const r20 = cx * sy * cz + sx * sz;
        const r21 = cx * sy * sz - sx * cz;
        const r22 = cx * cy;

        // Build column-major 4x4 matrix with scale and translation
        // 构建带缩放和平移的列优先 4x4 矩阵
        const m = this.transformBuffer;

        // Column 0
        m[0] = r00 * scl.x;
        m[1] = r10 * scl.x;
        m[2] = r20 * scl.x;
        m[3] = 0;

        // Column 1
        m[4] = r01 * scl.y;
        m[5] = r11 * scl.y;
        m[6] = r21 * scl.y;
        m[7] = 0;

        // Column 2
        m[8] = r02 * scl.z;
        m[9] = r12 * scl.z;
        m[10] = r22 * scl.z;
        m[11] = 0;

        // Column 3 (translation)
        m[12] = pos.x;
        m[13] = pos.y;
        m[14] = pos.z;
        m[15] = 1;
    }

    /**
     * Build interleaved vertex data for simple 3D mesh.
     * 构建简化 3D 网格的交错顶点数据。
     *
     * Format: [x, y, z, u, v, r, g, b, a] per vertex (9 floats)
     * 格式：每个顶点 [x, y, z, u, v, r, g, b, a]（9 个浮点数）
     */
    private buildVertexData(meshData: IMeshData): Float32Array | null {
        const vertices = meshData.vertices;
        const uvs = meshData.uvs;
        const colors = meshData.colors;

        if (!vertices || vertices.length === 0) return null;

        const vertexCount = vertices.length / 3;
        const floatsPerVertex = 9;
        const totalFloats = vertexCount * floatsPerVertex;

        // Resize buffer if needed
        // 如果需要，调整缓冲区大小
        if (this.vertexBuffer.length < totalFloats) {
            this.vertexBuffer = new Float32Array(totalFloats);
        }

        const hasUVs = uvs && uvs.length >= vertexCount * 2;
        const hasColors = colors && colors.length >= vertexCount * 4;

        for (let i = 0; i < vertexCount; i++) {
            const vBase = i * 3;
            const uvBase = i * 2;
            const colorBase = i * 4;
            const outBase = i * floatsPerVertex;

            // Position
            this.vertexBuffer[outBase] = vertices[vBase];
            this.vertexBuffer[outBase + 1] = vertices[vBase + 1];
            this.vertexBuffer[outBase + 2] = vertices[vBase + 2];

            // UV
            this.vertexBuffer[outBase + 3] = hasUVs ? uvs![uvBase] : 0;
            this.vertexBuffer[outBase + 4] = hasUVs ? uvs![uvBase + 1] : 0;

            // Color (RGBA)
            this.vertexBuffer[outBase + 5] = hasColors ? colors![colorBase] : 1;
            this.vertexBuffer[outBase + 6] = hasColors ? colors![colorBase + 1] : 1;
            this.vertexBuffer[outBase + 7] = hasColors ? colors![colorBase + 2] : 1;
            this.vertexBuffer[outBase + 8] = hasColors ? colors![colorBase + 3] : 1;
        }

        return this.vertexBuffer.subarray(0, totalFloats);
    }
}
