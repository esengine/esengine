/**
 * @zh 变换服务 - 节点变换操作
 * @en Transform Service - Node transform operations
 *
 * Layer 2: 依赖 EngineAdapter 和 SceneService。
 * Layer 2: Depends on EngineAdapter and SceneService.
 */

import type { Vec3, Quat, TransformInfo } from './types';
import type { IEngineAdapter } from './EngineAdapter';
import type { ISceneService } from './SceneService';
import { getEngineAdapter } from './EngineAdapter';
import { getSceneService } from './SceneService';



/**
 * @zh 变换服务接口
 * @en Transform service interface
 */
export interface ITransformService {
    // Transform Operations
    setPosition(nodeId: string, position: Vec3): void;
    setRotation(nodeId: string, rotation: Quat | number): void;  // number for Z-axis rotation in degrees
    setScale(nodeId: string, scale: Vec3): void;
    setTransform(nodeId: string, transform: Partial<TransformInfo>): void;

    // Batch Operations
    translateNodes(nodeIds: string[], delta: Vec3): void;
    rotateNodes(nodeIds: string[], deltaDegrees: number): void;
    scaleNodes(nodeIds: string[], factor: Vec3): void;

    // Query
    getTransform(nodeId: string): TransformInfo | null;
    getWorldPosition(nodeId: string): Vec3 | null;

    // Coordinate Conversion
    localToWorld(nodeId: string, localPos: Vec3): Vec3 | null;
    worldToLocal(nodeId: string, worldPos: Vec3): Vec3 | null;
}



/**
 * @zh 变换服务实现
 * @en Transform service implementation
 */
class TransformServiceImpl implements ITransformService {
    private _adapter: IEngineAdapter;
    private _sceneService: ISceneService;

    constructor() {
        this._adapter = getEngineAdapter();
        this._sceneService = getSceneService();
    }



    /**
     * @zh 设置节点位置
     * @en Set node position
     */
    setPosition(nodeId: string, position: Vec3): void {
        const node = this._sceneService.findNodeById(nodeId);
        if (!node) return;

        const Vec3Ctor = this._adapter.Vec3;
        if (Vec3Ctor && node.setPosition) {
            const newPos = new Vec3Ctor(position.x, position.y, position.z);
            node.setPosition(newPos);
        } else {
            // Fallback: direct property modification
            node.position.x = position.x;
            node.position.y = position.y;
            node.position.z = position.z;
        }
    }

    /**
     * @zh 设置节点旋转
     * @en Set node rotation
     *
     * @param nodeId - 节点ID / Node ID
     * @param rotation - 四元数或Z轴角度（度）/ Quaternion or Z-axis angle (degrees)
     */
    setRotation(nodeId: string, rotation: Quat | number): void {
        const node = this._sceneService.findNodeById(nodeId);
        if (!node) return;

        if (typeof rotation === 'number') {
            // Convert degrees to quaternion (Z-axis rotation for 2D)
            const radians = rotation * (Math.PI / 180);
            const halfAngle = radians / 2;
            const quat: Quat = {
                x: 0,
                y: 0,
                z: Math.sin(halfAngle),
                w: Math.cos(halfAngle),
            };
            this.applyQuaternion(node, quat);
        } else {
            this.applyQuaternion(node, rotation);
        }
    }

    /**
     * @zh 设置节点缩放
     * @en Set node scale
     */
    setScale(nodeId: string, scale: Vec3): void {
        const node = this._sceneService.findNodeById(nodeId);
        if (!node) return;

        const Vec3Ctor = this._adapter.Vec3;
        if (Vec3Ctor && node.setScale) {
            const newScale = new Vec3Ctor(scale.x, scale.y, scale.z);
            node.setScale(newScale);
        } else {
            // Fallback: direct property modification
            node.scale.x = scale.x;
            node.scale.y = scale.y;
            node.scale.z = scale.z;
        }
    }

    /**
     * @zh 设置节点变换（支持部分更新）
     * @en Set node transform (supports partial update)
     */
    setTransform(nodeId: string, transform: Partial<TransformInfo>): void {
        if (transform.position) {
            this.setPosition(nodeId, transform.position);
        }
        if (transform.rotation) {
            this.setRotation(nodeId, transform.rotation);
        } else if (transform.eulerAngles) {
            // Use Z-axis rotation for 2D
            this.setRotation(nodeId, transform.eulerAngles.z);
        }
        if (transform.scale) {
            this.setScale(nodeId, transform.scale);
        }
    }



    /**
     * @zh 批量平移节点
     * @en Translate multiple nodes
     */
    translateNodes(nodeIds: string[], delta: Vec3): void {
        for (const nodeId of nodeIds) {
            const transform = this.getTransform(nodeId);
            if (transform) {
                this.setPosition(nodeId, {
                    x: transform.position.x + delta.x,
                    y: transform.position.y + delta.y,
                    z: transform.position.z + delta.z,
                });
            }
        }
    }

    /**
     * @zh 批量旋转节点
     * @en Rotate multiple nodes
     */
    rotateNodes(nodeIds: string[], deltaDegrees: number): void {
        for (const nodeId of nodeIds) {
            const transform = this.getTransform(nodeId);
            if (transform) {
                const currentZ = transform.eulerAngles.z;
                this.setRotation(nodeId, currentZ + deltaDegrees);
            }
        }
    }

    /**
     * @zh 批量缩放节点
     * @en Scale multiple nodes
     */
    scaleNodes(nodeIds: string[], factor: Vec3): void {
        for (const nodeId of nodeIds) {
            const transform = this.getTransform(nodeId);
            if (transform) {
                this.setScale(nodeId, {
                    x: transform.scale.x * factor.x,
                    y: transform.scale.y * factor.y,
                    z: transform.scale.z * factor.z,
                });
            }
        }
    }



    /**
     * @zh 获取节点变换
     * @en Get node transform
     */
    getTransform(nodeId: string): TransformInfo | null {
        const node = this._sceneService.findNodeById(nodeId);
        if (!node) return null;

        const rotation = node.rotation;
        const eulerAngles = this.quaternionToEuler(rotation);

        return {
            position: { ...node.position },
            rotation: { ...rotation },
            eulerAngles,
            scale: { ...node.scale },
        };
    }

    /**
     * @zh 获取节点世界坐标
     * @en Get node world position
     */
    getWorldPosition(nodeId: string): Vec3 | null {
        const node = this._sceneService.findNodeById(nodeId);
        if (!node) return null;

        // For now, return local position (world position calculation would need parent chain)
        // TODO: Implement proper world position calculation
        return { ...node.position };
    }



    /**
     * @zh 本地坐标转世界坐标
     * @en Local to world coordinate conversion
     */
    localToWorld(nodeId: string, localPos: Vec3): Vec3 | null {
        const node = this._sceneService.findNodeById(nodeId);
        if (!node) return null;

        // Simplified: just add local position to node position
        // Full implementation would need matrix multiplication through parent chain
        return {
            x: node.position.x + localPos.x,
            y: node.position.y + localPos.y,
            z: node.position.z + localPos.z,
        };
    }

    /**
     * @zh 世界坐标转本地坐标
     * @en World to local coordinate conversion
     */
    worldToLocal(nodeId: string, worldPos: Vec3): Vec3 | null {
        const node = this._sceneService.findNodeById(nodeId);
        if (!node) return null;

        // Simplified: just subtract node position from world position
        // Full implementation would need inverse matrix multiplication
        return {
            x: worldPos.x - node.position.x,
            y: worldPos.y - node.position.y,
            z: worldPos.z - node.position.z,
        };
    }



    private applyQuaternion(node: { setRotation?: (x: number, y: number, z: number, w: number) => void; rotation: Quat }, quat: Quat): void {
        if (node.setRotation) {
            node.setRotation(quat.x, quat.y, quat.z, quat.w);
        } else {
            // Fallback: direct property modification
            node.rotation.x = quat.x;
            node.rotation.y = quat.y;
            node.rotation.z = quat.z;
            node.rotation.w = quat.w;
        }
    }

    private quaternionToEuler(q: Quat): Vec3 {
        // Convert quaternion to euler angles (in degrees)
        const sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
        const cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
        const x = Math.atan2(sinr_cosp, cosr_cosp) * (180 / Math.PI);

        const sinp = 2 * (q.w * q.y - q.z * q.x);
        const y = Math.abs(sinp) >= 1
            ? Math.sign(sinp) * 90
            : Math.asin(sinp) * (180 / Math.PI);

        const siny_cosp = 2 * (q.w * q.z + q.x * q.y);
        const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
        const z = Math.atan2(siny_cosp, cosy_cosp) * (180 / Math.PI);

        return { x, y, z };
    }
}



let instance: TransformServiceImpl | null = null;

/**
 * @zh 获取变换服务单例
 * @en Get transform service singleton
 */
export function getTransformService(): ITransformService {
    if (!instance) {
        instance = new TransformServiceImpl();
    }
    return instance;
}

/**
 * @zh 重置变换服务（仅用于测试）
 * @en Reset transform service (for testing only)
 */
export function resetTransformService(): void {
    instance = null;
}

