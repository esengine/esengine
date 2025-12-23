/**
 * FBX model loader implementation
 * FBX 模型加载器实现
 *
 * Supports:
 * - Binary FBX format (.fbx) - FBX 7.x
 * - ASCII FBX format (.fbx)
 * - Geometry extraction (vertices, normals, UVs, indices)
 * - Multiple meshes/objects
 * - Basic material references
 * - Animation extraction (AnimationStack, AnimationLayer, AnimationCurve)
 * - Skeleton/Bone data (Deformer)
 *
 * Note: FBX is a complex proprietary format. This loader focuses on
 * extracting geometry and animation data for rendering.
 * 注意：FBX 是复杂的专有格式。此加载器专注于提取用于渲染的几何和动画数据。
 */

import { AssetType } from '../types/AssetTypes';
import type { IAssetContent, AssetContentType } from '../interfaces/IAssetReader';
import type {
    IAssetLoader,
    IAssetParseContext,
    IGLTFAsset,
    IMeshData,
    IGLTFMaterial,
    IGLTFNode,
    IBoundingBox,
    IGLTFAnimationClip,
    IAnimationSampler,
    IAnimationChannel,
    ISkeletonData,
    ISkeletonJoint
} from '../interfaces/IAssetLoader';
import pako from 'pako';

// ===== FBX Binary Format Structures =====

/** FBX binary header size */
const FBX_HEADER_SIZE = 27; // Magic (21) + unknown (2) + version (4)

/** FBX Node for binary parsing */
interface FBXNode {
    name: string;
    properties: FBXProperty[];
    children: FBXNode[];
}

type FBXProperty = number | bigint | boolean | string | number[] | bigint[] | boolean[] | Uint8Array | Float32Array | Float64Array | Int32Array | BigInt64Array;

/** Parsed FBX geometry data */
interface FBXGeometry {
    id: bigint;                   // Geometry ID | 几何体ID
    name: string;
    vertices: number[];
    indices: number[];
    normals?: number[];
    uvs?: number[];
    materialIds?: number[];
}

/** FBX model object */
interface FBXModel {
    id: bigint;
    name: string;
    geometryId?: bigint;
    materialIds: bigint[];
    // Local transform | 本地变换
    position: [number, number, number];
    rotation: [number, number, number];  // Euler angles in degrees | 欧拉角（度）
    scale: [number, number, number];
    // Pre-rotation (applied before Lcl Rotation) | 预旋转（在 Lcl Rotation 之前应用）
    preRotation?: [number, number, number];
}

/** FBX material */
interface FBXMaterial {
    id: bigint;
    name: string;
    diffuseColor: [number, number, number];
    opacity: number;
}

// ===== FBX Animation Structures =====

/** FBX time constant: 1 second = 46186158000 FbxTime units */
const FBX_TIME_SECOND = 46186158000;

/** FBX animation curve - single component (X, Y, Z, or W) */
interface FBXAnimationCurve {
    id: bigint;
    name: string;
    keyTimes: Float32Array;       // 时间（秒） | Time in seconds
    keyValues: Float32Array;      // 值 | Values
    componentIndex: number;       // 0=X, 1=Y, 2=Z, 3=W
}

/** FBX animation curve node - target property (translation/rotation/scale) */
interface FBXAnimationCurveNode {
    id: bigint;
    name: string;
    attribute: string;            // "T" | "R" | "S" (Translation/Rotation/Scaling)
    targetModelId: bigint;        // 目标 Model 的 ID | Target Model ID
    curves: FBXAnimationCurve[];  // X, Y, Z 曲线 | X, Y, Z curves
}

/** FBX animation layer */
interface FBXAnimationLayer {
    id: bigint;
    name: string;
    curveNodes: FBXAnimationCurveNode[];
}

/** FBX animation stack (clip) */
interface FBXAnimationStack {
    id: bigint;
    name: string;
    layers: FBXAnimationLayer[];
}

/** FBX deformer (skeleton/skin) */
interface FBXDeformer {
    id: bigint;
    name: string;
    type: 'Skin' | 'Cluster';
    boneId?: bigint;              // Cluster: 指向骨骼 Model | Cluster: points to bone Model
    indexes?: number[];           // Cluster: 受影响的顶点索引 | Cluster: affected vertex indices
    weights?: number[];           // Cluster: 顶点权重 | Cluster: vertex weights
    transform?: Float32Array;     // Cluster: 变换矩阵 | Cluster: transform matrix
    transformLink?: Float32Array; // Cluster: 逆绑定矩阵 | Cluster: inverse bind matrix
}

/** FBX connection - links objects together */
interface FBXConnection {
    type: string;                 // "OO" (object-object) or "OP" (object-property)
    fromId: bigint;
    toId: bigint;
    property?: string;
}

/**
 * FBX model loader
 * FBX 模型加载器
 */
export class FBXLoader implements IAssetLoader<IGLTFAsset> {
    readonly supportedType = AssetType.Model3D;
    readonly supportedExtensions = ['.fbx'];
    readonly contentType: AssetContentType = 'binary';

    // Parsing state
    private buffer: ArrayBuffer = new ArrayBuffer(0);
    private view: DataView = new DataView(this.buffer);
    private offset = 0;
    private version = 0;

    /**
     * Parse FBX content
     * 解析 FBX 内容
     */
    async parse(content: IAssetContent, context: IAssetParseContext): Promise<IGLTFAsset> {
        const buffer = content.binary;
        if (!buffer) {
            throw new Error('FBX loader requires binary content');
        }

        // Detect format (binary or ASCII)
        // 检测格式（二进制或 ASCII）
        // FBX binary header is "Kaydara FBX Binary  \0" (21 bytes + null)
        // FBX 二进制头是 "Kaydara FBX Binary  \0"（21字节 + 空字节）
        const headerBytes = new Uint8Array(buffer, 0, Math.min(21, buffer.byteLength));
        const headerString = String.fromCharCode(...headerBytes);
        const isBinary = headerString.startsWith('Kaydara FBX Binary');

        let geometries: FBXGeometry[];
        let models: FBXModel[];
        let materials: FBXMaterial[];
        let animStacks: FBXAnimationStack[] = [];
        let deformers: FBXDeformer[] = [];
        let connections: FBXConnection[] = [];

        if (isBinary) {
            const result = this.parseBinary(buffer);
            geometries = result.geometries;
            models = result.models;
            materials = result.materials;
            animStacks = result.animStacks;
            deformers = result.deformers;
            connections = result.connections;
        } else {
            // Try ASCII parsing (no animation support for ASCII yet)
            // 尝试 ASCII 解析（ASCII 格式暂不支持动画）
            const text = new TextDecoder().decode(buffer);
            const result = this.parseASCII(text);
            geometries = result.geometries;
            models = result.models;
            materials = result.materials;
        }

        // Build skeleton data FIRST to get cluster -> joint index mapping
        // 先构建骨骼数据以获取簇->关节索引映射
        const clusterToJointIndex = new Map<bigint, number>();
        const skeleton = this.buildSkeletonData(deformers, models, connections, clusterToJointIndex) ?? undefined;

        // Convert to mesh data with skinning (using the cluster mapping)
        // 转换为带蒙皮的网格数据（使用簇映射）
        const meshes = this.buildMeshes(geometries, deformers, connections, clusterToJointIndex);

        // Build material list
        // 构建材质列表
        const gltfMaterials = this.buildMaterials(materials);

        // Build geometry ID to mesh index map | 构建几何体ID到网格索引的映射
        const geometryToMeshIndex = new Map<bigint, number>();
        geometries.forEach((geom, index) => {
            if (index < meshes.length) {
                geometryToMeshIndex.set(geom.id, index);
            }
        });

        // Build Model -> Geometry connection map | 构建模型->几何体连接映射
        const modelGeometryMap = new Map<bigint, bigint>();
        for (const conn of connections) {
            if (conn.type === 'OO') {
                const geom = geometries.find(g => g.id === conn.fromId);
                const model = models.find(m => m.id === conn.toId);
                if (geom && model) {
                    modelGeometryMap.set(model.id, geom.id);
                }
            }
        }

        // Build model ID to index map | 构建模型ID到索引的映射
        const modelIdToIndex = new Map<bigint, number>();
        models.forEach((model, index) => {
            modelIdToIndex.set(model.id, index);
        });

        // Build node hierarchy from MODELS (not meshes) to match animation indices
        // 从模型（而非网格）构建节点层级以匹配动画索引
        const nodes: IGLTFNode[] = models.map(model => {
            const geomId = modelGeometryMap.get(model.id);
            const meshIndex = geomId !== undefined ? geometryToMeshIndex.get(geomId) : undefined;

            // Convert euler rotation (degrees) to quaternion | 将欧拉角（度）转换为四元数
            // FBX transform: finalRotation = PreRotation * LclRotation
            // FBX 变换：finalRotation = PreRotation * LclRotation
            let quat: [number, number, number, number];

            if (model.preRotation) {
                // Apply PreRotation before Lcl Rotation | 在 Lcl Rotation 之前应用 PreRotation
                const preRx = model.preRotation[0] * Math.PI / 180;
                const preRy = model.preRotation[1] * Math.PI / 180;
                const preRz = model.preRotation[2] * Math.PI / 180;
                const preQuat = this.eulerToQuaternion(preRx, preRy, preRz);

                const rx = model.rotation[0] * Math.PI / 180;
                const ry = model.rotation[1] * Math.PI / 180;
                const rz = model.rotation[2] * Math.PI / 180;
                const lclQuat = this.eulerToQuaternion(rx, ry, rz);

                // Combine: final = pre * lcl | 组合：final = pre * lcl
                quat = this.multiplyQuaternion(preQuat, lclQuat);
            } else {
                const rx = model.rotation[0] * Math.PI / 180;
                const ry = model.rotation[1] * Math.PI / 180;
                const rz = model.rotation[2] * Math.PI / 180;
                quat = this.eulerToQuaternion(rx, ry, rz);
            }

            return {
                name: model.name,
                meshIndex: meshIndex ?? -1,
                children: [] as number[],
                transform: {
                    position: model.position,
                    rotation: quat,
                    scale: model.scale
                }
            };
        });

        // Build parent-child relationships from connections | 从连接构建父子关系
        for (const conn of connections) {
            if (conn.type === 'OO') {
                const childIdx = modelIdToIndex.get(conn.fromId);
                const parentIdx = modelIdToIndex.get(conn.toId);
                if (childIdx !== undefined && parentIdx !== undefined && childIdx !== parentIdx) {
                    // Add child to parent's children array | 将子节点添加到父节点的 children 数组
                    if (!nodes[parentIdx].children.includes(childIdx)) {
                        nodes[parentIdx].children.push(childIdx);
                    }
                }
            }
        }

        // Calculate overall bounds
        // 计算总边界
        const bounds = this.calculateBounds(meshes);

        // Get model name from file path
        // 从文件路径获取模型名称
        const pathParts = context.metadata.path.split(/[\\/]/);
        const fileName = pathParts[pathParts.length - 1];
        const name = fileName.replace(/\.fbx$/i, '');

        // Convert animation stacks to clips
        // 将动画栈转换为动画片段
        const animations = this.convertToAnimationClips(animStacks, models);

        return {
            name,
            meshes,
            materials: gltfMaterials,
            textures: [],
            nodes,
            rootNodes: nodes.map((_, i) => i),
            bounds,
            sourcePath: context.metadata.path,
            animations,
            skeleton
        };
    }

    /**
     * Dispose FBX asset
     * 释放 FBX 资产
     */
    dispose(asset: IGLTFAsset): void {
        for (const mesh of asset.meshes) {
            (mesh as { vertices: Float32Array | null }).vertices = null!;
            (mesh as { indices: Uint16Array | Uint32Array | null }).indices = null!;
        }
        asset.meshes.length = 0;
    }

    // ===== Binary FBX Parsing =====

    /**
     * Parse binary FBX format
     * 解析二进制 FBX 格式
     */
    private parseBinary(buffer: ArrayBuffer): {
        geometries: FBXGeometry[];
        models: FBXModel[];
        materials: FBXMaterial[];
        animStacks: FBXAnimationStack[];
        deformers: FBXDeformer[];
        connections: FBXConnection[];
    } {
        this.buffer = buffer;
        this.view = new DataView(buffer);
        this.offset = 0;

        // Read header
        // 读取头部
        this.offset = 21; // Skip magic
        this.offset += 2;  // Skip unknown bytes
        this.version = this.view.getUint32(this.offset, true);
        this.offset = FBX_HEADER_SIZE;

        // Parse root nodes
        // 解析根节点
        const nodes: FBXNode[] = [];
        while (this.offset < buffer.byteLength) {
            const node = this.parseNode();
            if (!node) break;
            nodes.push(node);
        }

        // Extract geometry and model data
        // 提取几何和模型数据
        const geometries: FBXGeometry[] = [];
        const models: FBXModel[] = [];
        const materials: FBXMaterial[] = [];

        // Animation data
        // 动画数据
        const animStacks: FBXAnimationStack[] = [];
        const animLayers: FBXAnimationLayer[] = [];
        const animCurveNodes: FBXAnimationCurveNode[] = [];
        const animCurves: FBXAnimationCurve[] = [];
        const deformers: FBXDeformer[] = [];

        // Find Objects node
        // 查找 Objects 节点
        const objectsNode = nodes.find(n => n.name === 'Objects');
        if (objectsNode) {
            for (const child of objectsNode.children) {
                if (child.name === 'Geometry') {
                    const geom = this.extractGeometry(child);
                    if (geom) {
                        geometries.push(geom);
                    }
                } else if (child.name === 'Model') {
                    const model = this.extractModel(child);
                    if (model) models.push(model);
                } else if (child.name === 'Material') {
                    const mat = this.extractMaterial(child);
                    if (mat) materials.push(mat);
                } else if (child.name === 'AnimationStack') {
                    const stack = this.extractAnimationStack(child);
                    if (stack) animStacks.push(stack);
                } else if (child.name === 'AnimationLayer') {
                    const layer = this.extractAnimationLayer(child);
                    if (layer) animLayers.push(layer);
                } else if (child.name === 'AnimationCurveNode') {
                    const curveNode = this.extractAnimationCurveNode(child);
                    if (curveNode) animCurveNodes.push(curveNode);
                } else if (child.name === 'AnimationCurve') {
                    const curve = this.extractAnimationCurve(child);
                    if (curve) animCurves.push(curve);
                } else if (child.name === 'Deformer') {
                    const deformer = this.extractDeformer(child);
                    if (deformer) deformers.push(deformer);
                }
            }
        }

        // Parse connections
        // 解析连接
        const connections = this.parseConnections(nodes);

        // Build animation hierarchy using connections
        // 使用连接构建动画层级
        this.buildAnimationHierarchy(
            animStacks, animLayers, animCurveNodes, animCurves, connections
        );

        return { geometries, models, materials, animStacks, deformers, connections };
    }

    /**
     * Parse a single FBX node (binary format)
     * 解析单个 FBX 节点（二进制格式）
     */
    private parseNode(): FBXNode | null {
        if (this.offset >= this.buffer.byteLength) return null;

        const is64Bit = this.version >= 7500;

        // Read node record
        // 读取节点记录
        let endOffset: number;
        let numProperties: number;

        if (is64Bit) {
            endOffset = Number(this.view.getBigUint64(this.offset, true));
            numProperties = Number(this.view.getBigUint64(this.offset + 8, true));
            // propertyListLen not used, skip reading it
            this.offset += 24;
        } else {
            endOffset = this.view.getUint32(this.offset, true);
            numProperties = this.view.getUint32(this.offset + 4, true);
            // propertyListLen not used, skip reading it
            this.offset += 12;
        }

        // Check for null node (end marker)
        // 检查空节点（结束标记）
        if (endOffset === 0) {
            return null;
        }

        // Read name
        // 读取名称
        const nameLen = this.view.getUint8(this.offset);
        this.offset += 1;
        const nameBytes = new Uint8Array(this.buffer, this.offset, nameLen);
        const name = String.fromCharCode(...nameBytes);
        this.offset += nameLen;

        // Read properties
        // 读取属性
        const properties: FBXProperty[] = [];
        for (let i = 0; i < numProperties; i++) {
            const prop = this.parseProperty();
            properties.push(prop);
        }

        // Read child nodes
        // 读取子节点
        const children: FBXNode[] = [];
        while (this.offset < endOffset) {
            // Check for null terminator
            // 检查空终止符
            const nullCheck = is64Bit ? 13 : 13;
            if (this.offset + nullCheck <= endOffset) {
                const testOffset = is64Bit
                    ? Number(this.view.getBigUint64(this.offset, true))
                    : this.view.getUint32(this.offset, true);
                if (testOffset === 0) {
                    this.offset = endOffset;
                    break;
                }
            }

            const child = this.parseNode();
            if (!child) break;
            children.push(child);
        }

        this.offset = endOffset;

        return { name, properties, children };
    }

    /**
     * Parse a single FBX property
     * 解析单个 FBX 属性
     */
    private parseProperty(): FBXProperty {
        const type = String.fromCharCode(this.view.getUint8(this.offset));
        this.offset += 1;

        switch (type) {
            case 'C': // Bool
                const boolVal = this.view.getUint8(this.offset) !== 0;
                this.offset += 1;
                return boolVal;

            case 'Y': // Int16
                const int16Val = this.view.getInt16(this.offset, true);
                this.offset += 2;
                return int16Val;

            case 'I': // Int32
                const int32Val = this.view.getInt32(this.offset, true);
                this.offset += 4;
                return int32Val;

            case 'L': // Int64
                const int64Val = this.view.getBigInt64(this.offset, true);
                this.offset += 8;
                return int64Val;

            case 'F': // Float
                const floatVal = this.view.getFloat32(this.offset, true);
                this.offset += 4;
                return floatVal;

            case 'D': // Double
                const doubleVal = this.view.getFloat64(this.offset, true);
                this.offset += 8;
                return doubleVal;

            case 'S': // String
            case 'R': // Raw binary
                const strLen = this.view.getUint32(this.offset, true);
                this.offset += 4;
                if (type === 'S') {
                    const strBytes = new Uint8Array(this.buffer, this.offset, strLen);
                    this.offset += strLen;
                    // FBX strings may contain null bytes
                    // FBX 字符串可能包含空字节
                    let str = '';
                    for (let i = 0; i < strLen; i++) {
                        if (strBytes[i] === 0) break;
                        str += String.fromCharCode(strBytes[i]);
                    }
                    return str;
                } else {
                    const rawData = new Uint8Array(this.buffer, this.offset, strLen);
                    this.offset += strLen;
                    return rawData;
                }

            case 'b': // Bool array
            case 'c': // Bool array (alias)
                return this.parseArrayProperty('bool');

            case 'i': // Int32 array
                return this.parseArrayProperty('int32');

            case 'l': // Int64 array
                return this.parseArrayProperty('int64');

            case 'f': // Float array
                return this.parseArrayProperty('float32');

            case 'd': // Double array
                return this.parseArrayProperty('float64');

            default:
                console.warn(`Unknown FBX property type: ${type}`);
                return 0;
        }
    }

    /**
     * Parse array property with potential compression
     * 解析可能压缩的数组属性
     */
    private parseArrayProperty(elementType: 'bool' | 'int32' | 'int64' | 'float32' | 'float64'): number[] | bigint[] | Float32Array | Float64Array {
        const arrayLength = this.view.getUint32(this.offset, true);
        const encoding = this.view.getUint32(this.offset + 4, true);
        const compressedLength = this.view.getUint32(this.offset + 8, true);
        this.offset += 12;

        let data: ArrayBuffer;

        if (encoding === 1) {
            // zlib compressed - decompress using built-in inflate
            // zlib 压缩 - 使用内置 inflate 解压
            const compressedData = new Uint8Array(this.buffer, this.offset, compressedLength);
            this.offset += compressedLength;

            // Calculate expected uncompressed size
            // 计算预期的未压缩大小
            const elementSize = elementType === 'bool' ? 1
                : elementType === 'int32' || elementType === 'float32' ? 4
                : 8;
            const expectedSize = arrayLength * elementSize;

            // Decompress
            // 解压
            const decompressed = this.decompressZlib(compressedData, expectedSize);
            // Copy to new ArrayBuffer to avoid SharedArrayBuffer issues
            // 复制到新 ArrayBuffer 以避免 SharedArrayBuffer 问题
            data = new Uint8Array(decompressed).buffer;
        } else {
            // Uncompressed
            // 未压缩
            const elementSize = elementType === 'bool' ? 1
                : elementType === 'int32' || elementType === 'float32' ? 4
                : 8;
            const byteLength = arrayLength * elementSize;
            data = this.buffer.slice(this.offset, this.offset + byteLength);
            this.offset += byteLength;
        }

        return this.convertToTypedArray(data, arrayLength, elementType);
    }

    /**
     * Convert ArrayBuffer to typed array based on element type
     * 根据元素类型将 ArrayBuffer 转换为类型数组
     */
    private convertToTypedArray(data: ArrayBuffer, arrayLength: number, elementType: 'bool' | 'int32' | 'int64' | 'float32' | 'float64'): number[] | bigint[] | Float32Array | Float64Array {
        switch (elementType) {
            case 'bool': {
                const view = new Uint8Array(data);
                const bools: number[] = [];
                for (let i = 0; i < arrayLength && i < view.length; i++) {
                    bools.push(view[i] !== 0 ? 1 : 0);
                }
                return bools;
            }

            case 'int32': {
                const int32View = new Int32Array(data);
                return Array.from(int32View);
            }

            case 'int64': {
                const view = new DataView(data);
                const int64s: bigint[] = [];
                for (let i = 0; i < arrayLength; i++) {
                    int64s.push(view.getBigInt64(i * 8, true));
                }
                return int64s;
            }

            case 'float32':
                return new Float32Array(data);

            case 'float64':
                return new Float64Array(data);
        }
    }

    /**
     * Decompress zlib data using pako
     * 使用 pako 解压 zlib 数据
     */
    private decompressZlib(compressedData: Uint8Array, _expectedSize: number): Uint8Array {
        try {
            // pako.inflate handles zlib format automatically
            // pako.inflate 自动处理 zlib 格式
            return pako.inflate(compressedData);
        } catch (e) {
            console.warn('[FBXLoader] Decompression error:', e);
            return new Uint8Array(_expectedSize);
        }
    }

    /**
     * Extract geometry from FBX Geometry node
     * 从 FBX Geometry 节点提取几何数据
     */
    private extractGeometry(node: FBXNode): FBXGeometry | null {
        // Get geometry ID and name
        // 获取几何 ID 和名称
        const id = node.properties[0] as bigint;
        const nameProp = node.properties[1];
        let name = 'Geometry';
        if (typeof nameProp === 'string') {
            // FBX name format: "Name\x00\x01Geometry"
            name = nameProp.split('\x00')[0] || name;
        }

        // Find Vertices, PolygonVertexIndex, etc.
        // 查找 Vertices、PolygonVertexIndex 等
        let vertices: number[] = [];
        let indices: number[] = [];
        let normals: number[] | undefined;
        let uvs: number[] | undefined;

        for (const child of node.children) {
            if (child.name === 'Vertices') {
                const prop = child.properties[0];
                vertices = this.toNumberArray(prop);
            } else if (child.name === 'PolygonVertexIndex') {
                // FBX uses negative indices for polygon end markers
                // FBX 使用负索引作为多边形结束标记
                const prop = child.properties[0];
                const polyIndices = this.toNumberArray(prop);

                // Convert polygon indices to triangles
                // 将多边形索引转换为三角形
                indices = this.triangulatePolygons(polyIndices);
            } else if (child.name === 'LayerElementNormal') {
                normals = this.extractLayerElement(child, 'Normals');
            } else if (child.name === 'LayerElementUV') {
                uvs = this.extractLayerElement(child, 'UV');
            }
        }

        if (vertices.length === 0) return null;

        return { id, name, vertices, indices, normals, uvs };
    }

    /**
     * Convert FBX property to number array
     * 将 FBX 属性转换为数字数组
     *
     * Handles all typed arrays (Int32Array, Float64Array, etc.) and regular arrays
     * 处理所有类型数组（Int32Array、Float64Array 等）和普通数组
     */
    private toNumberArray(prop: FBXProperty): number[] {
        if (prop instanceof Float64Array || prop instanceof Float32Array) {
            return Array.from(prop);
        } else if (prop instanceof Int32Array || prop instanceof Uint32Array) {
            return Array.from(prop);
        } else if (prop instanceof Uint8Array || prop instanceof Int8Array) {
            return Array.from(prop);
        } else if (prop instanceof Int16Array || prop instanceof Uint16Array) {
            return Array.from(prop);
        } else if (prop instanceof BigInt64Array) {
            return Array.from(prop, v => Number(v));
        } else if (Array.isArray(prop)) {
            return prop.map(Number);
        }
        return [];
    }

    /**
     * Extract layer element data (normals, UVs, etc.)
     * 提取层元素数据（法线、UV 等）
     */
    private extractLayerElement(node: FBXNode, dataName: string): number[] | undefined {
        for (const child of node.children) {
            if (child.name === dataName) {
                const prop = child.properties[0];
                const arr = this.toNumberArray(prop);
                if (arr.length > 0) {
                    return arr;
                }
            }
        }
        return undefined;
    }

    /**
     * Triangulate FBX polygon indices
     * 三角化 FBX 多边形索引
     *
     * FBX uses negative index to mark polygon end:
     * [0, 1, -3] = triangle (0, 1, 2)
     * [0, 1, 2, -4] = quad (0, 1, 2, 3) -> 2 triangles
     */
    private triangulatePolygons(polyIndices: number[]): number[] {
        const triangles: number[] = [];
        const polygon: number[] = [];

        for (const idx of polyIndices) {
            if (idx < 0) {
                // End of polygon - convert negative to positive
                // 多边形结束 - 将负数转为正数
                polygon.push(~idx); // Bitwise NOT to get actual index

                // Triangulate polygon (fan triangulation)
                // 三角化多边形（扇形三角化）
                for (let i = 1; i < polygon.length - 1; i++) {
                    triangles.push(polygon[0], polygon[i], polygon[i + 1]);
                }
                polygon.length = 0;
            } else {
                polygon.push(idx);
            }
        }

        return triangles;
    }

    /**
     * Extract model from FBX Model node
     * 从 FBX Model 节点提取模型
     */
    private extractModel(node: FBXNode): FBXModel | null {
        const id = node.properties[0] as bigint;
        const nameProp = node.properties[1];
        let name = 'Model';
        if (typeof nameProp === 'string') {
            name = nameProp.split('\x00')[0] || name;
        }

        // Extract transform from Properties70 | 从 Properties70 提取变换
        let position: [number, number, number] = [0, 0, 0];
        let rotation: [number, number, number] = [0, 0, 0];
        let scale: [number, number, number] = [1, 1, 1];
        let preRotation: [number, number, number] | undefined;

        const props70 = node.children.find(c => c.name === 'Properties70');
        if (props70) {
            for (const prop of props70.children) {
                if (prop.name === 'P' && prop.properties.length >= 5) {
                    const propName = prop.properties[0] as string;
                    if (propName === 'Lcl Translation') {
                        position = [
                            Number(prop.properties[4]) || 0,
                            Number(prop.properties[5]) || 0,
                            Number(prop.properties[6]) || 0
                        ];
                    } else if (propName === 'Lcl Rotation') {
                        rotation = [
                            Number(prop.properties[4]) || 0,
                            Number(prop.properties[5]) || 0,
                            Number(prop.properties[6]) || 0
                        ];
                    } else if (propName === 'Lcl Scaling') {
                        scale = [
                            Number(prop.properties[4]) || 1,
                            Number(prop.properties[5]) || 1,
                            Number(prop.properties[6]) || 1
                        ];
                    } else if (propName === 'PreRotation') {
                        // PreRotation is applied before Lcl Rotation
                        // PreRotation 在 Lcl Rotation 之前应用
                        preRotation = [
                            Number(prop.properties[4]) || 0,
                            Number(prop.properties[5]) || 0,
                            Number(prop.properties[6]) || 0
                        ];
                    }
                }
            }
        }

        return {
            id,
            name,
            materialIds: [],
            position,
            rotation,
            scale,
            preRotation
        };
    }

    /**
     * Extract material from FBX Material node
     * 从 FBX Material 节点提取材质
     */
    private extractMaterial(node: FBXNode): FBXMaterial | null {
        const id = node.properties[0] as bigint;
        const nameProp = node.properties[1];
        let name = 'Material';
        if (typeof nameProp === 'string') {
            name = nameProp.split('\x00')[0] || name;
        }

        // Default values
        // 默认值
        let diffuseColor: [number, number, number] = [0.8, 0.8, 0.8];
        let opacity = 1;

        // Find Properties70 node for material properties
        // 查找 Properties70 节点获取材质属性
        const props70 = node.children.find(c => c.name === 'Properties70');
        if (props70) {
            for (const prop of props70.children) {
                if (prop.name === 'P' && prop.properties.length >= 5) {
                    const propName = prop.properties[0] as string;
                    if (propName === 'DiffuseColor') {
                        diffuseColor = [
                            Number(prop.properties[4]) || 0.8,
                            Number(prop.properties[5]) || 0.8,
                            Number(prop.properties[6]) || 0.8
                        ];
                    } else if (propName === 'Opacity') {
                        opacity = Number(prop.properties[4]) || 1;
                    }
                }
            }
        }

        return { id, name, diffuseColor, opacity };
    }

    // ===== Animation Extraction Methods =====

    /**
     * Extract AnimationStack from FBX node
     * 从 FBX 节点提取 AnimationStack
     */
    private extractAnimationStack(node: FBXNode): FBXAnimationStack | null {
        const id = node.properties[0] as bigint;
        const nameProp = node.properties[1];
        let name = 'AnimationStack';
        if (typeof nameProp === 'string') {
            name = nameProp.split('\x00')[0] || name;
        }

        return { id, name, layers: [] };
    }

    /**
     * Extract AnimationLayer from FBX node
     * 从 FBX 节点提取 AnimationLayer
     */
    private extractAnimationLayer(node: FBXNode): FBXAnimationLayer | null {
        const id = node.properties[0] as bigint;
        const nameProp = node.properties[1];
        let name = 'AnimationLayer';
        if (typeof nameProp === 'string') {
            name = nameProp.split('\x00')[0] || name;
        }

        return { id, name, curveNodes: [] };
    }

    /**
     * Extract AnimationCurveNode from FBX node
     * 从 FBX 节点提取 AnimationCurveNode
     */
    private extractAnimationCurveNode(node: FBXNode): FBXAnimationCurveNode | null {
        const id = node.properties[0] as bigint;
        const nameProp = node.properties[1];
        let name = 'AnimationCurveNode';
        if (typeof nameProp === 'string') {
            name = nameProp.split('\x00')[0] || name;
        }

        // Determine attribute type from name
        // 从名称确定属性类型
        let attribute = 'T'; // Default to translation
        if (name.includes('R') || name.toLowerCase().includes('rot')) {
            attribute = 'R';
        } else if (name.includes('S') || name.toLowerCase().includes('scal')) {
            attribute = 'S';
        }

        // Check Properties70 for d|X, d|Y, d|Z defaults (indicates the axis)
        // 检查 Properties70 中的 d|X, d|Y, d|Z 默认值（表示轴向）
        const props70 = node.children.find(c => c.name === 'Properties70');
        if (props70) {
            for (const prop of props70.children) {
                if (prop.name === 'P' && prop.properties.length >= 1) {
                    const propName = prop.properties[0] as string;
                    // Parse attribute name like "d|X", "d|Y", "d|Z"
                    // 解析属性名如 "d|X", "d|Y", "d|Z"
                    if (propName === 'd|X' || propName === 'd|Y' || propName === 'd|Z') {
                        // This is a valid curve node
                        break;
                    }
                }
            }
        }

        return {
            id,
            name,
            attribute,
            targetModelId: BigInt(0), // Will be set by connections
            curves: []
        };
    }

    /**
     * Extract AnimationCurve from FBX node
     * 从 FBX 节点提取 AnimationCurve
     */
    private extractAnimationCurve(node: FBXNode): FBXAnimationCurve | null {
        const id = node.properties[0] as bigint;
        const nameProp = node.properties[1];
        let name = 'AnimationCurve';
        if (typeof nameProp === 'string') {
            name = nameProp.split('\x00')[0] || name;
        }

        // Find KeyTime and KeyValueFloat
        // 查找 KeyTime 和 KeyValueFloat
        let keyTimesRaw: bigint[] = [];
        let keyValuesRaw: number[] = [];

        for (const child of node.children) {
            if (child.name === 'KeyTime') {
                const prop = child.properties[0];
                if (prop instanceof BigInt64Array) {
                    keyTimesRaw = Array.from(prop);
                } else if (Array.isArray(prop)) {
                    keyTimesRaw = prop.map(v => BigInt(v));
                }
            } else if (child.name === 'KeyValueFloat') {
                const prop = child.properties[0];
                keyValuesRaw = this.toNumberArray(prop);
            }
        }

        if (keyTimesRaw.length === 0 || keyValuesRaw.length === 0) {
            return null;
        }

        // Convert FBX time to seconds
        // 将 FBX 时间转换为秒
        const keyTimes = new Float32Array(keyTimesRaw.length);
        for (let i = 0; i < keyTimesRaw.length; i++) {
            keyTimes[i] = Number(keyTimesRaw[i]) / FBX_TIME_SECOND;
        }

        const keyValues = new Float32Array(keyValuesRaw);

        // Determine component index from name (d|X=0, d|Y=1, d|Z=2)
        // 从名称确定分量索引 (d|X=0, d|Y=1, d|Z=2)
        let componentIndex = 0;
        if (name.includes('Y')) componentIndex = 1;
        else if (name.includes('Z')) componentIndex = 2;

        return { id, name, keyTimes, keyValues, componentIndex };
    }

    /**
     * Extract Deformer (Skin/Cluster) from FBX node
     * 从 FBX 节点提取 Deformer（Skin/Cluster）
     */
    private extractDeformer(node: FBXNode): FBXDeformer | null {
        const id = node.properties[0] as bigint;
        const nameProp = node.properties[1];
        const typeProp = node.properties[2];

        let name = 'Deformer';
        if (typeof nameProp === 'string') {
            name = nameProp.split('\x00')[0] || name;
        }

        let type: 'Skin' | 'Cluster' = 'Skin';
        if (typeof typeProp === 'string') {
            if (typeProp.includes('Cluster')) {
                type = 'Cluster';
            }
        }

        const deformer: FBXDeformer = { id, name, type };

        // Extract cluster-specific data
        // 提取 Cluster 特定数据
        if (type === 'Cluster') {
            for (const child of node.children) {
                if (child.name === 'Indexes') {
                    deformer.indexes = this.toNumberArray(child.properties[0]);
                } else if (child.name === 'Weights') {
                    deformer.weights = this.toNumberArray(child.properties[0]);
                } else if (child.name === 'Transform') {
                    const arr = this.toNumberArray(child.properties[0]);
                    if (arr.length >= 16) {
                        // FBX matrices are stored in column-major order, compatible with WebGL
                        // (verified by Three.js FBXLoader which uses Matrix4.fromArray directly)
                        // FBX 矩阵以列主序存储，与 WebGL 兼容
                        deformer.transform = new Float32Array(arr.slice(0, 16));
                    }
                } else if (child.name === 'TransformLink') {
                    const arr = this.toNumberArray(child.properties[0]);
                    if (arr.length >= 16) {
                        // FBX matrices are stored in column-major order, compatible with WebGL
                        // (verified by Three.js FBXLoader which uses Matrix4.fromArray directly)
                        // FBX 矩阵以列主序存储，与 WebGL 兼容
                        deformer.transformLink = new Float32Array(arr.slice(0, 16));
                    }
                }
            }
        }

        return deformer;
    }

    /**
     * Parse Connections section
     * 解析 Connections 部分
     */
    private parseConnections(nodes: FBXNode[]): FBXConnection[] {
        const connections: FBXConnection[] = [];
        const connectionsNode = nodes.find(n => n.name === 'Connections');

        if (!connectionsNode) return connections;

        for (const child of connectionsNode.children) {
            if (child.name === 'C' && child.properties.length >= 3) {
                const type = child.properties[0] as string;
                const fromId = child.properties[1] as bigint;
                const toId = child.properties[2] as bigint;
                const property = child.properties.length > 3 ? child.properties[3] as string : undefined;

                connections.push({ type, fromId, toId, property });
            }
        }

        return connections;
    }

    /**
     * Build animation hierarchy using connections
     * 使用连接构建动画层级
     */
    private buildAnimationHierarchy(
        stacks: FBXAnimationStack[],
        layers: FBXAnimationLayer[],
        curveNodes: FBXAnimationCurveNode[],
        curves: FBXAnimationCurve[],
        connections: FBXConnection[]
    ): void {
        // Build ID maps
        // 构建 ID 映射
        const layerMap = new Map(layers.map(l => [l.id, l]));
        const curveNodeMap = new Map(curveNodes.map(cn => [cn.id, cn]));
        const curveMap = new Map(curves.map(c => [c.id, c]));

        // Process connections
        // 处理连接
        for (const conn of connections) {
            // Layer -> Stack connection
            // 层 -> 栈连接
            const layer = layerMap.get(conn.fromId);
            if (layer) {
                for (const stack of stacks) {
                    if (stack.id === conn.toId) {
                        stack.layers.push(layer);
                        break;
                    }
                }
                continue;
            }

            // CurveNode -> Layer connection
            // 曲线节点 -> 层连接
            const curveNode = curveNodeMap.get(conn.fromId);
            if (curveNode) {
                const targetLayer = layerMap.get(conn.toId);
                if (targetLayer) {
                    targetLayer.curveNodes.push(curveNode);
                } else {
                    // CurveNode -> Model connection (sets target)
                    // 曲线节点 -> 模型连接（设置目标）
                    curveNode.targetModelId = conn.toId;
                    if (conn.property) {
                        // Property indicates the attribute type
                        // 属性表示属性类型
                        if (conn.property.includes('Lcl Translation')) {
                            curveNode.attribute = 'T';
                        } else if (conn.property.includes('Lcl Rotation')) {
                            curveNode.attribute = 'R';
                        } else if (conn.property.includes('Lcl Scaling')) {
                            curveNode.attribute = 'S';
                        }
                    }
                }
                continue;
            }

            // Curve -> CurveNode connection
            // 曲线 -> 曲线节点连接
            const curve = curveMap.get(conn.fromId);
            if (curve) {
                const targetCurveNode = curveNodeMap.get(conn.toId);
                if (targetCurveNode) {
                    // Determine component index from property
                    // 从属性确定分量索引
                    if (conn.property) {
                        if (conn.property === 'd|X') curve.componentIndex = 0;
                        else if (conn.property === 'd|Y') curve.componentIndex = 1;
                        else if (conn.property === 'd|Z') curve.componentIndex = 2;
                    }
                    targetCurveNode.curves.push(curve);
                }
            }
        }

    }

    /**
     * Convert FBX animation stacks to GLTF animation clips
     * 将 FBX 动画栈转换为 GLTF 动画片段
     *
     * IMPORTANT: FBX animation only stores Lcl Rotation, but the actual rotation
     * is PreRotation * LclRotation. We must apply PreRotation to animation data.
     * 重要：FBX 动画只存储 Lcl Rotation，但实际旋转是 PreRotation * LclRotation。
     * 我们必须将 PreRotation 应用到动画数据。
     */
    private convertToAnimationClips(
        stacks: FBXAnimationStack[],
        models: FBXModel[]
    ): IGLTFAnimationClip[] {
        const clips: IGLTFAnimationClip[] = [];

        // Build model ID to node index map and model ID to model map
        // 构建模型 ID 到节点索引的映射，以及模型 ID 到模型的映射
        const modelToNodeIndex = new Map<bigint, number>();
        const modelIdToModel = new Map<bigint, FBXModel>();
        models.forEach((model, index) => {
            modelToNodeIndex.set(model.id, index);
            modelIdToModel.set(model.id, model);
        });

        for (const stack of stacks) {
            // Merge all layers (for now, we just use the first layer's data)
            // 合并所有层（目前，我们只使用第一层的数据）
            const samplers: IAnimationSampler[] = [];
            const channels: IAnimationChannel[] = [];

            for (const layer of stack.layers) {
                for (const curveNode of layer.curveNodes) {
                    const nodeIndex = modelToNodeIndex.get(curveNode.targetModelId);
                    if (nodeIndex === undefined) continue;

                    // Get the model for this animation target (for PreRotation)
                    // 获取此动画目标的模型（用于 PreRotation）
                    const targetModel = modelIdToModel.get(curveNode.targetModelId);

                    // Merge X, Y, Z curves into a single sampler
                    // 将 X, Y, Z 曲线合并为单个采样器
                    const xCurve = curveNode.curves.find(c => c.componentIndex === 0);
                    const yCurve = curveNode.curves.find(c => c.componentIndex === 1);
                    const zCurve = curveNode.curves.find(c => c.componentIndex === 2);

                    if (!xCurve && !yCurve && !zCurve) continue;

                    // Use the curve with most keyframes as reference
                    // 使用关键帧最多的曲线作为参考
                    const refCurve = [xCurve, yCurve, zCurve]
                        .filter(c => c !== undefined)
                        .reduce((a, b) => (a!.keyTimes.length > b!.keyTimes.length ? a : b))!;

                    const keyCount = refCurve.keyTimes.length;

                    // Build input (time) and output (values) arrays
                    // 构建输入（时间）和输出（值）数组
                    const input = refCurve.keyTimes;
                    let output: Float32Array;

                    // Determine path and build output
                    // 确定路径并构建输出
                    let path: 'translation' | 'rotation' | 'scale';
                    if (curveNode.attribute === 'T') {
                        path = 'translation';
                        output = new Float32Array(keyCount * 3);
                        for (let i = 0; i < keyCount; i++) {
                            const time = input[i];
                            output[i * 3] = xCurve ? this.sampleCurveAtTime(xCurve, time) : 0;
                            output[i * 3 + 1] = yCurve ? this.sampleCurveAtTime(yCurve, time) : 0;
                            output[i * 3 + 2] = zCurve ? this.sampleCurveAtTime(zCurve, time) : 0;
                        }
                    } else if (curveNode.attribute === 'R') {
                        path = 'rotation';
                        // Convert euler angles (degrees) to quaternions
                        // Apply PreRotation before Lcl Rotation: final = PreRotation * LclRotation
                        // 将欧拉角（度）转换为四元数
                        // 在 Lcl Rotation 之前应用 PreRotation: final = PreRotation * LclRotation
                        output = new Float32Array(keyCount * 4);

                        // Get PreRotation quaternion if available | 如果有 PreRotation 则获取其四元数
                        let preRotQuat: [number, number, number, number] | null = null;
                        if (targetModel?.preRotation) {
                            const preRx = targetModel.preRotation[0] * Math.PI / 180;
                            const preRy = targetModel.preRotation[1] * Math.PI / 180;
                            const preRz = targetModel.preRotation[2] * Math.PI / 180;
                            preRotQuat = this.eulerToQuaternion(preRx, preRy, preRz);
                        }

                        for (let i = 0; i < keyCount; i++) {
                            const time = input[i];
                            // Sample each axis curve at this time | 在此时间采样每个轴曲线
                            const rx = xCurve ? this.sampleCurveAtTime(xCurve, time) * Math.PI / 180 : 0;
                            const ry = yCurve ? this.sampleCurveAtTime(yCurve, time) * Math.PI / 180 : 0;
                            const rz = zCurve ? this.sampleCurveAtTime(zCurve, time) * Math.PI / 180 : 0;
                            const lclQuat = this.eulerToQuaternion(rx, ry, rz);

                            // Apply PreRotation: final = preRotation * lclRotation
                            // 应用 PreRotation: final = preRotation * lclRotation
                            let finalQuat: [number, number, number, number];
                            if (preRotQuat) {
                                finalQuat = this.multiplyQuaternion(preRotQuat, lclQuat);
                            } else {
                                finalQuat = lclQuat;
                            }

                            output[i * 4] = finalQuat[0];
                            output[i * 4 + 1] = finalQuat[1];
                            output[i * 4 + 2] = finalQuat[2];
                            output[i * 4 + 3] = finalQuat[3];
                        }
                    } else {
                        path = 'scale';
                        output = new Float32Array(keyCount * 3);
                        for (let i = 0; i < keyCount; i++) {
                            const time = input[i];
                            output[i * 3] = xCurve ? this.sampleCurveAtTime(xCurve, time, 1) : 1;
                            output[i * 3 + 1] = yCurve ? this.sampleCurveAtTime(yCurve, time, 1) : 1;
                            output[i * 3 + 2] = zCurve ? this.sampleCurveAtTime(zCurve, time, 1) : 1;
                        }
                    }

                    const samplerIndex = samplers.length;
                    samplers.push({
                        input,
                        output,
                        interpolation: 'LINEAR'
                    });

                    channels.push({
                        samplerIndex,
                        target: {
                            nodeIndex,
                            path
                        }
                    });
                }
            }

            if (channels.length > 0) {
                // Calculate duration from max time
                // 从最大时间计算持续时间
                let duration = 0;
                for (const sampler of samplers) {
                    const maxTime = sampler.input[sampler.input.length - 1];
                    if (maxTime > duration) duration = maxTime;
                }

                clips.push({
                    name: stack.name,
                    duration,
                    samplers,
                    channels
                });
            }
        }

        return clips;
    }

    /**
     * Convert euler angles (radians) to quaternion
     * 将欧拉角（弧度）转换为四元数
     *
     * Uses XYZ intrinsic rotation order (equivalent to ZYX extrinsic).
     * This matches the FBX Lcl Rotation convention used in this loader.
     * 使用 XYZ intrinsic 旋转顺序（等价于 ZYX extrinsic）。
     * 这与本加载器中使用的 FBX Lcl Rotation 约定匹配。
     */
    private eulerToQuaternion(x: number, y: number, z: number): [number, number, number, number] {
        const cx = Math.cos(x / 2);
        const sx = Math.sin(x / 2);
        const cy = Math.cos(y / 2);
        const sy = Math.sin(y / 2);
        const cz = Math.cos(z / 2);
        const sz = Math.sin(z / 2);

        // XYZ intrinsic order (first X, then Y, then Z around local axes)
        // XYZ intrinsic 顺序（先绕局部 X 轴，再绕局部 Y 轴，最后绕局部 Z 轴）
        return [
            sx * cy * cz - cx * sy * sz, // x
            cx * sy * cz + sx * cy * sz, // y
            cx * cy * sz - sx * sy * cz, // z
            cx * cy * cz + sx * sy * sz  // w
        ];
    }

    /**
     * Multiply two quaternions (a * b)
     * 两个四元数相乘 (a * b)
     *
     * Result represents rotation b followed by rotation a
     * 结果表示先旋转 b 再旋转 a
     */
    private multiplyQuaternion(
        a: [number, number, number, number],
        b: [number, number, number, number]
    ): [number, number, number, number] {
        const [ax, ay, az, aw] = a;
        const [bx, by, bz, bw] = b;

        return [
            aw * bx + ax * bw + ay * bz - az * by, // x
            aw * by - ax * bz + ay * bw + az * bx, // y
            aw * bz + ax * by - ay * bx + az * bw, // z
            aw * bw - ax * bx - ay * by - az * bz  // w
        ];
    }

    /**
     * Sample animation curve at a specific time with linear interpolation
     * 使用线性插值在特定时间采样动画曲线
     *
     * @param curve - Animation curve to sample | 要采样的动画曲线
     * @param time - Time in seconds | 时间（秒）
     * @param defaultValue - Default value if curve is empty | 曲线为空时的默认值
     * @returns Interpolated value at the given time | 给定时间的插值
     */
    private sampleCurveAtTime(curve: FBXAnimationCurve, time: number, defaultValue: number = 0): number {
        const { keyTimes, keyValues } = curve;

        if (keyTimes.length === 0) return defaultValue;
        if (keyTimes.length === 1) return keyValues[0];

        // Clamp time to curve range | 将时间钳制到曲线范围
        if (time <= keyTimes[0]) return keyValues[0];
        if (time >= keyTimes[keyTimes.length - 1]) return keyValues[keyValues.length - 1];

        // Find keyframe pair | 查找关键帧对
        let i0 = 0;
        for (let i = 0; i < keyTimes.length - 1; i++) {
            if (time >= keyTimes[i] && time <= keyTimes[i + 1]) {
                i0 = i;
                break;
            }
        }
        const i1 = i0 + 1;

        // Linear interpolation | 线性插值
        const t0 = keyTimes[i0];
        const t1 = keyTimes[i1];
        const t = (time - t0) / (t1 - t0);

        return keyValues[i0] + (keyValues[i1] - keyValues[i0]) * t;
    }

    /**
     * Build skeleton data from deformers
     * 从变形器构建骨骼数据
     *
     * @param deformers - All deformers
     * @param models - All models
     * @param connections - All connections
     * @param clusterToJointIndex - Output map from cluster ID to joint index for skinning
     */
    private buildSkeletonData(
        deformers: FBXDeformer[],
        models: FBXModel[],
        connections: FBXConnection[],
        clusterToJointIndex?: Map<bigint, number>
    ): ISkeletonData | null {
        // Find all Cluster deformers
        // 查找所有 Cluster 变形器
        const clusters = deformers.filter(d => d.type === 'Cluster');
        if (clusters.length === 0) return null;

        // Build model ID to info map
        // 构建模型 ID 到信息的映射
        const modelToIndex = new Map<bigint, number>();
        const modelIdToModel = new Map<bigint, FBXModel>();
        models.forEach((model, index) => {
            modelToIndex.set(model.id, index);
            modelIdToModel.set(model.id, model);
        });

        // Build parent relationships from connections
        // 从连接构建父子关系
        const modelParentMap = new Map<bigint, bigint>();
        for (const conn of connections) {
            if (conn.type === 'OO') {
                // fromId is child, toId is parent
                // fromId 是子节点，toId 是父节点
                const childModel = modelIdToModel.get(conn.fromId);
                const parentModel = modelIdToModel.get(conn.toId);
                if (childModel && parentModel) {
                    modelParentMap.set(conn.fromId, conn.toId);
                }
            }
        }

        // Find bone connections (Cluster -> Model)
        // 查找骨骼连接 (Cluster -> Model)
        const clusterToBone = new Map<bigint, bigint>();
        for (const conn of connections) {
            if (conn.type === 'OO') {
                const cluster = clusters.find(c => c.id === conn.toId);
                if (cluster) {
                    // fromId is the bone model
                    // fromId 是骨骼模型
                    clusterToBone.set(cluster.id, conn.fromId);
                }
            }
        }

        // Collect all bone model IDs
        // 收集所有骨骼模型 ID
        const boneModelIds = new Set<bigint>();
        for (const cluster of clusters) {
            const boneModelId = clusterToBone.get(cluster.id);
            if (boneModelId) {
                boneModelIds.add(boneModelId);
            }
        }

        const joints: ISkeletonJoint[] = [];
        const boneModelIdToJointIndex = new Map<bigint, number>();

        for (const cluster of clusters) {
            const boneModelId = clusterToBone.get(cluster.id);
            if (!boneModelId) continue;

            const nodeIndex = modelToIndex.get(boneModelId);
            if (nodeIndex === undefined) continue;

            const model = modelIdToModel.get(boneModelId);
            const name = model?.name || `Joint_${joints.length}`;

            const jointIndex = joints.length;
            boneModelIdToJointIndex.set(boneModelId, jointIndex);

            // Store cluster ID -> joint index mapping for skinning | 存储簇ID到关节索引的映射用于蒙皮
            if (clusterToJointIndex) {
                clusterToJointIndex.set(cluster.id, jointIndex);
            }

            // FBX TransformLink is the bone's world matrix at bind pose
            // inverseBindMatrix = inverse(TransformLink)
            // FBX TransformLink 是骨骼在绑定姿势时的世界矩阵
            // inverseBindMatrix = inverse(TransformLink)
            const inverseBindMatrix = cluster.transformLink
                ? this.invertMatrix4(cluster.transformLink)
                : this.createIdentityMatrix();

            joints.push({
                name,
                nodeIndex,
                parentIndex: -1, // Will be set later
                inverseBindMatrix
            });
        }

        // Set parent indices
        // 设置父索引
        for (const cluster of clusters) {
            const boneModelId = clusterToBone.get(cluster.id);
            if (!boneModelId) continue;

            const jointIndex = boneModelIdToJointIndex.get(boneModelId);
            if (jointIndex === undefined) continue;

            // Find parent model that is also a bone
            // 查找同时是骨骼的父模型
            let parentModelId = modelParentMap.get(boneModelId);
            while (parentModelId) {
                const parentJointIndex = boneModelIdToJointIndex.get(parentModelId);
                if (parentJointIndex !== undefined) {
                    joints[jointIndex].parentIndex = parentJointIndex;
                    break;
                }
                parentModelId = modelParentMap.get(parentModelId);
            }
        }

        if (joints.length === 0) return null;

        // Find root joint (one with parentIndex === -1)
        // 查找根关节（parentIndex === -1 的那个）
        let rootJointIndex = 0;
        for (let i = 0; i < joints.length; i++) {
            if (joints[i].parentIndex === -1) {
                rootJointIndex = i;
                break;
            }
        }

        return {
            joints,
            rootJointIndex
        };
    }

    /**
     * Create identity matrix
     * 创建单位矩阵
     */
    private createIdentityMatrix(): Float32Array {
        const m = new Float32Array(16);
        m[0] = 1; m[5] = 1; m[10] = 1; m[15] = 1;
        return m;
    }

    /**
     * Invert a 4x4 matrix
     * 求 4x4 矩阵的逆
     *
     * Uses the adjugate method with cofactors
     * 使用余子式的伴随矩阵方法
     */
    private invertMatrix4(m: Float32Array): Float32Array {
        const out = new Float32Array(16);
        const m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
        const m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
        const m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];
        const m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];

        const b00 = m00 * m11 - m01 * m10;
        const b01 = m00 * m12 - m02 * m10;
        const b02 = m00 * m13 - m03 * m10;
        const b03 = m01 * m12 - m02 * m11;
        const b04 = m01 * m13 - m03 * m11;
        const b05 = m02 * m13 - m03 * m12;
        const b06 = m20 * m31 - m21 * m30;
        const b07 = m20 * m32 - m22 * m30;
        const b08 = m20 * m33 - m23 * m30;
        const b09 = m21 * m32 - m22 * m31;
        const b10 = m21 * m33 - m23 * m31;
        const b11 = m22 * m33 - m23 * m32;

        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

        if (Math.abs(det) < 1e-8) {
            // Matrix is singular, return identity | 矩阵奇异，返回单位矩阵
            return this.createIdentityMatrix();
        }

        det = 1.0 / det;

        out[0] = (m11 * b11 - m12 * b10 + m13 * b09) * det;
        out[1] = (m02 * b10 - m01 * b11 - m03 * b09) * det;
        out[2] = (m31 * b05 - m32 * b04 + m33 * b03) * det;
        out[3] = (m22 * b04 - m21 * b05 - m23 * b03) * det;
        out[4] = (m12 * b08 - m10 * b11 - m13 * b07) * det;
        out[5] = (m00 * b11 - m02 * b08 + m03 * b07) * det;
        out[6] = (m32 * b02 - m30 * b05 - m33 * b01) * det;
        out[7] = (m20 * b05 - m22 * b02 + m23 * b01) * det;
        out[8] = (m10 * b10 - m11 * b08 + m13 * b06) * det;
        out[9] = (m01 * b08 - m00 * b10 - m03 * b06) * det;
        out[10] = (m30 * b04 - m31 * b02 + m33 * b00) * det;
        out[11] = (m21 * b02 - m20 * b04 - m23 * b00) * det;
        out[12] = (m11 * b07 - m10 * b09 - m12 * b06) * det;
        out[13] = (m00 * b09 - m01 * b07 + m02 * b06) * det;
        out[14] = (m31 * b01 - m30 * b03 - m32 * b00) * det;
        out[15] = (m20 * b03 - m21 * b01 + m22 * b00) * det;

        return out;
    }

    // ===== ASCII FBX Parsing =====

    /**
     * Parse ASCII FBX format
     * 解析 ASCII FBX 格式
     */
    private parseASCII(text: string): { geometries: FBXGeometry[]; models: FBXModel[]; materials: FBXMaterial[] } {
        const geometries: FBXGeometry[] = [];
        const models: FBXModel[] = [];
        const materials: FBXMaterial[] = [];

        // Find Geometry sections
        // 查找 Geometry 部分
        const geometryRegex = /Geometry:\s*(\d+),\s*"Geometry::([^"]*)",\s*"Mesh"\s*{([^}]*(?:{[^}]*}[^}]*)*)}/g;
        let match;

        while ((match = geometryRegex.exec(text)) !== null) {
            const name = match[2] || 'Geometry';
            const content = match[3];

            // Extract vertices
            // 提取顶点
            const verticesMatch = content.match(/Vertices:\s*\*\d+\s*{\s*a:\s*([\d\s.,eE+-]+)/);
            const vertices: number[] = [];
            if (verticesMatch) {
                const vertexStr = verticesMatch[1].replace(/\s+/g, '');
                for (const v of vertexStr.split(',')) {
                    const val = parseFloat(v);
                    if (!isNaN(val)) vertices.push(val);
                }
            }

            // Extract polygon indices
            // 提取多边形索引
            const indicesMatch = content.match(/PolygonVertexIndex:\s*\*\d+\s*{\s*a:\s*([\d\s.,-]+)/);
            let indices: number[] = [];
            if (indicesMatch) {
                const indexStr = indicesMatch[1].replace(/\s+/g, '');
                const polyIndices: number[] = [];
                for (const i of indexStr.split(',')) {
                    const val = parseInt(i, 10);
                    if (!isNaN(val)) polyIndices.push(val);
                }
                indices = this.triangulatePolygons(polyIndices);
            }

            // Extract normals
            // 提取法线
            let normals: number[] | undefined;
            const normalsMatch = content.match(/Normals:\s*\*\d+\s*{\s*a:\s*([\d\s.,eE+-]+)/);
            if (normalsMatch) {
                normals = [];
                const normalStr = normalsMatch[1].replace(/\s+/g, '');
                for (const n of normalStr.split(',')) {
                    const val = parseFloat(n);
                    if (!isNaN(val)) normals.push(val);
                }
            }

            // Extract UVs
            // 提取 UV
            let uvs: number[] | undefined;
            const uvsMatch = content.match(/UV:\s*\*\d+\s*{\s*a:\s*([\d\s.,eE+-]+)/);
            if (uvsMatch) {
                uvs = [];
                const uvStr = uvsMatch[1].replace(/\s+/g, '');
                for (const u of uvStr.split(',')) {
                    const val = parseFloat(u);
                    if (!isNaN(val)) uvs.push(val);
                }
            }

            if (vertices.length > 0) {
                // ASCII format doesn't have real IDs, use index | ASCII 格式没有真实 ID，使用索引
                geometries.push({ id: BigInt(geometries.length), name, vertices, indices, normals, uvs });
            }
        }

        // Find Material sections
        // 查找 Material 部分
        const materialRegex = /Material:\s*(\d+),\s*"Material::([^"]*)",\s*""\s*{/g;
        while ((match = materialRegex.exec(text)) !== null) {
            materials.push({
                id: BigInt(match[1]),
                name: match[2] || 'Material',
                diffuseColor: [0.8, 0.8, 0.8],
                opacity: 1
            });
        }

        return { geometries, models, materials };
    }

    // ===== Mesh Building =====

    /**
     * Build mesh data from parsed geometries with optional skinning
     * 从解析的几何数据构建网格数据（含可选蒙皮）
     *
     * @param geometries - All geometries
     * @param deformers - All deformers
     * @param connections - All connections
     * @param clusterToJointIndex - Map from cluster ID to skeleton joint index
     */
    private buildMeshes(
        geometries: FBXGeometry[],
        deformers: FBXDeformer[] = [],
        connections: FBXConnection[] = [],
        clusterToJointIndex: Map<bigint, number> = new Map()
    ): IMeshData[] {
        const meshes: IMeshData[] = [];

        // Build geometry ID to skinning map | 构建几何体ID到蒙皮的映射
        const geometrySkinning = this.buildSkinningData(geometries, deformers, connections, clusterToJointIndex);

        for (const geom of geometries) {
            const skinning = geometrySkinning.get(geom.id);
            const mesh = this.buildMesh(geom, skinning);
            if (mesh) meshes.push(mesh);
        }

        // If no meshes, create an empty one
        // 如果没有网格，创建一个空的
        if (meshes.length === 0) {
            throw new Error('FBX file contains no valid geometry');
        }

        return meshes;
    }

    /**
     * Build skinning data for each geometry from deformers
     * 从变形器构建每个几何体的蒙皮数据
     *
     * @param geometries - All geometries
     * @param deformers - All deformers
     * @param connections - All connections
     * @param clusterToJointIndex - Map from cluster ID to skeleton joint index
     */
    private buildSkinningData(
        geometries: FBXGeometry[],
        deformers: FBXDeformer[],
        connections: FBXConnection[],
        clusterToJointIndex: Map<bigint, number>
    ): Map<bigint, { joints: Uint8Array; weights: Float32Array }> {
        const result = new Map<bigint, { joints: Uint8Array; weights: Float32Array }>();

        // Find Skin deformers and their clusters | 查找 Skin 变形器及其簇
        const skins = deformers.filter(d => d.type === 'Skin');
        const clusters = deformers.filter(d => d.type === 'Cluster');

        if (skins.length === 0 || clusters.length === 0) {
            return result;
        }

        // Build Skin -> Clusters mapping | 构建 Skin -> Clusters 映射
        const skinClusters = new Map<bigint, FBXDeformer[]>();
        for (const conn of connections) {
            if (conn.type === 'OO') {
                const skin = skins.find(s => s.id === conn.toId);
                const cluster = clusters.find(c => c.id === conn.fromId);
                if (skin && cluster) {
                    if (!skinClusters.has(skin.id)) {
                        skinClusters.set(skin.id, []);
                    }
                    skinClusters.get(skin.id)!.push(cluster);
                }
            }
        }

        // Build Geometry -> Skin mapping | 构建 Geometry -> Skin 映射
        const geometrySkin = new Map<bigint, bigint>();
        for (const conn of connections) {
            if (conn.type === 'OO') {
                const geom = geometries.find(g => g.id === conn.toId);
                const skin = skins.find(s => s.id === conn.fromId);
                if (geom && skin) {
                    geometrySkin.set(geom.id, skin.id);
                }
            }
        }

        // For each geometry with skin, build per-vertex skinning data
        // 为每个带蒙皮的几何体构建逐顶点蒙皮数据
        for (const [geomId, skinId] of geometrySkin) {
            const geom = geometries.find(g => g.id === geomId);
            const clusterList = skinClusters.get(skinId);

            if (!geom || !clusterList || clusterList.length === 0) continue;

            const vertexCount = geom.vertices.length / 3;
            const joints = new Uint8Array(vertexCount * 4);
            const weights = new Float32Array(vertexCount * 4);

            // Temporary storage for per-vertex influences | 每顶点影响的临时存储
            const vertexInfluences: Array<Array<{ joint: number; weight: number }>> = [];
            for (let i = 0; i < vertexCount; i++) {
                vertexInfluences.push([]);
            }

            // Collect influences from each cluster | 从每个簇收集影响
            for (const cluster of clusterList) {
                if (!cluster.indexes || !cluster.weights) continue;

                // Use the correct joint index from skeleton | 使用骨骼的正确关节索引
                const jointIndex = clusterToJointIndex.get(cluster.id);
                if (jointIndex === undefined) {
                    console.warn(`[FBXLoader] Cluster ${cluster.id} not found in skeleton`);
                    continue;
                }

                for (let i = 0; i < cluster.indexes.length; i++) {
                    const vertexIndex = cluster.indexes[i];
                    const weight = cluster.weights[i];
                    if (vertexIndex < vertexCount && weight > 0.001) {
                        vertexInfluences[vertexIndex].push({
                            joint: jointIndex,
                            weight
                        });
                    }
                }
            }

            // Convert to fixed 4-influence format | 转换为固定的4影响格式
            for (let v = 0; v < vertexCount; v++) {
                const influences = vertexInfluences[v];

                // Sort by weight descending | 按权重降序排序
                influences.sort((a, b) => b.weight - a.weight);

                // Take top 4 influences | 取前4个影响
                let totalWeight = 0;
                for (let i = 0; i < 4 && i < influences.length; i++) {
                    joints[v * 4 + i] = influences[i].joint;
                    weights[v * 4 + i] = influences[i].weight;
                    totalWeight += influences[i].weight;
                }

                // Normalize weights | 归一化权重
                if (totalWeight > 0) {
                    for (let i = 0; i < 4; i++) {
                        weights[v * 4 + i] /= totalWeight;
                    }
                }
            }

            result.set(geomId, { joints, weights });
            console.log(`[FBXLoader] Built skinning for geometry: ${vertexCount} vertices, ${clusterList.length} clusters`);
        }

        return result;
    }

    /**
     * Build a single mesh from FBX geometry with optional skinning
     * 从 FBX 几何数据构建单个网格（含可选蒙皮）
     */
    private buildMesh(
        geom: FBXGeometry,
        skinning?: { joints: Uint8Array; weights: Float32Array }
    ): IMeshData | null {
        if (geom.vertices.length === 0 || geom.indices.length === 0) {
            return null;
        }

        // FBX vertices are in "by control point" format
        // Need to expand for indexed rendering
        // FBX 顶点是"按控制点"格式，需要为索引渲染展开

        const vertices = new Float32Array(geom.vertices);
        const indices = new Uint32Array(geom.indices);

        // Handle normals
        // 处理法线
        let normals: Float32Array;
        if (geom.normals && geom.normals.length > 0) {
            // Check if normals are per-vertex or per-polygon-vertex
            // 检查法线是每顶点还是每多边形顶点
            if (geom.normals.length === geom.vertices.length) {
                normals = new Float32Array(geom.normals);
            } else {
                // Need to map normals from polygon-vertex to vertex
                // 需要将法线从多边形顶点映射到顶点
                normals = this.mapNormalsToVertices(geom.vertices.length / 3, geom.indices, geom.normals);
            }
        } else {
            // Generate normals
            // 生成法线
            normals = this.generateNormals(geom.vertices, geom.indices);
        }

        // Handle UVs
        // 处理 UV
        let uvs: Float32Array;
        if (geom.uvs && geom.uvs.length > 0) {
            // UVs might be indexed differently, try to map
            // UV 可能有不同的索引方式，尝试映射
            const vertexCount = geom.vertices.length / 3;
            if (geom.uvs.length === vertexCount * 2) {
                uvs = new Float32Array(geom.uvs);
            } else {
                // Create default UVs
                // 创建默认 UV
                uvs = new Float32Array(vertexCount * 2);
            }
        } else {
            uvs = new Float32Array((geom.vertices.length / 3) * 2);
        }

        // Calculate bounds
        // 计算边界
        const bounds = this.calculateMeshBounds(geom.vertices);

        const mesh: IMeshData = {
            name: geom.name,
            vertices,
            indices,
            normals,
            uvs,
            bounds,
            materialIndex: 0
        };

        // Add skinning data if available | 如果有蒙皮数据则添加
        if (skinning) {
            mesh.joints = skinning.joints;
            mesh.weights = skinning.weights;
        }

        return mesh;
    }

    /**
     * Map per-polygon-vertex normals to per-vertex normals
     * 将每多边形顶点法线映射到每顶点法线
     */
    private mapNormalsToVertices(vertexCount: number, indices: number[], normals: number[]): Float32Array {
        const vertexNormals = new Float32Array(vertexCount * 3);
        const normalCounts = new Uint8Array(vertexCount);

        for (let i = 0; i < indices.length; i++) {
            const vIdx = indices[i];
            const nBase = i * 3;
            const vBase = vIdx * 3;

            if (nBase + 2 < normals.length) {
                vertexNormals[vBase] += normals[nBase];
                vertexNormals[vBase + 1] += normals[nBase + 1];
                vertexNormals[vBase + 2] += normals[nBase + 2];
                normalCounts[vIdx]++;
            }
        }

        // Average and normalize
        // 平均化和归一化
        for (let i = 0; i < vertexCount; i++) {
            const count = normalCounts[i] || 1;
            const base = i * 3;
            const nx = vertexNormals[base] / count;
            const ny = vertexNormals[base + 1] / count;
            const nz = vertexNormals[base + 2] / count;
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
            vertexNormals[base] = nx / len;
            vertexNormals[base + 1] = ny / len;
            vertexNormals[base + 2] = nz / len;
        }

        return vertexNormals;
    }

    /**
     * Generate flat normals for mesh
     * 为网格生成平面法线
     */
    private generateNormals(positions: number[], indices: number[]): Float32Array {
        const normals = new Float32Array(positions.length);

        for (let i = 0; i < indices.length; i += 3) {
            const i0 = indices[i] * 3;
            const i1 = indices[i + 1] * 3;
            const i2 = indices[i + 2] * 3;

            // Get triangle vertices
            const v0x = positions[i0], v0y = positions[i0 + 1], v0z = positions[i0 + 2];
            const v1x = positions[i1], v1y = positions[i1 + 1], v1z = positions[i1 + 2];
            const v2x = positions[i2], v2y = positions[i2 + 1], v2z = positions[i2 + 2];

            // Calculate edge vectors
            const e1x = v1x - v0x, e1y = v1y - v0y, e1z = v1z - v0z;
            const e2x = v2x - v0x, e2y = v2y - v0y, e2z = v2z - v0z;

            // Cross product
            const nx = e1y * e2z - e1z * e2y;
            const ny = e1z * e2x - e1x * e2z;
            const nz = e1x * e2y - e1y * e2x;

            // Add to vertex normals
            normals[i0] += nx; normals[i0 + 1] += ny; normals[i0 + 2] += nz;
            normals[i1] += nx; normals[i1 + 1] += ny; normals[i1 + 2] += nz;
            normals[i2] += nx; normals[i2 + 1] += ny; normals[i2 + 2] += nz;
        }

        // Normalize
        for (let i = 0; i < normals.length; i += 3) {
            const len = Math.sqrt(normals[i] ** 2 + normals[i + 1] ** 2 + normals[i + 2] ** 2);
            if (len > 0) {
                normals[i] /= len;
                normals[i + 1] /= len;
                normals[i + 2] /= len;
            } else {
                normals[i + 1] = 1; // Default up
            }
        }

        return normals;
    }

    /**
     * Build materials from FBX materials
     * 从 FBX 材质构建材质
     */
    private buildMaterials(fbxMaterials: FBXMaterial[]): IGLTFMaterial[] {
        const materials: IGLTFMaterial[] = [];

        // Default material
        // 默认材质
        materials.push({
            name: 'Default',
            baseColorFactor: [0.8, 0.8, 0.8, 1],
            baseColorTextureIndex: -1,
            metallicFactor: 0,
            roughnessFactor: 0.5,
            metallicRoughnessTextureIndex: -1,
            normalTextureIndex: -1,
            normalScale: 1,
            occlusionTextureIndex: -1,
            occlusionStrength: 1,
            emissiveFactor: [0, 0, 0],
            emissiveTextureIndex: -1,
            alphaMode: 'OPAQUE',
            alphaCutoff: 0.5,
            doubleSided: false
        });

        // Convert FBX materials
        // 转换 FBX 材质
        for (const mat of fbxMaterials) {
            materials.push({
                name: mat.name,
                baseColorFactor: [...mat.diffuseColor, mat.opacity],
                baseColorTextureIndex: -1,
                metallicFactor: 0,
                roughnessFactor: 0.5,
                metallicRoughnessTextureIndex: -1,
                normalTextureIndex: -1,
                normalScale: 1,
                occlusionTextureIndex: -1,
                occlusionStrength: 1,
                emissiveFactor: [0, 0, 0],
                emissiveTextureIndex: -1,
                alphaMode: mat.opacity < 1 ? 'BLEND' : 'OPAQUE',
                alphaCutoff: 0.5,
                doubleSided: false
            });
        }

        return materials;
    }

    /**
     * Calculate mesh bounding box
     * 计算网格边界盒
     */
    private calculateMeshBounds(positions: number[]): IBoundingBox {
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            minZ = Math.min(minZ, z);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            maxZ = Math.max(maxZ, z);
        }

        if (!isFinite(minX)) {
            return { min: [0, 0, 0], max: [0, 0, 0] };
        }

        return {
            min: [minX, minY, minZ],
            max: [maxX, maxY, maxZ]
        };
    }

    /**
     * Calculate combined bounds for all meshes
     * 计算所有网格的组合边界
     */
    private calculateBounds(meshes: IMeshData[]): IBoundingBox {
        if (meshes.length === 0) {
            return { min: [0, 0, 0], max: [0, 0, 0] };
        }

        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (const mesh of meshes) {
            minX = Math.min(minX, mesh.bounds.min[0]);
            minY = Math.min(minY, mesh.bounds.min[1]);
            minZ = Math.min(minZ, mesh.bounds.min[2]);
            maxX = Math.max(maxX, mesh.bounds.max[0]);
            maxY = Math.max(maxY, mesh.bounds.max[1]);
            maxZ = Math.max(maxZ, mesh.bounds.max[2]);
        }

        return {
            min: [minX, minY, minZ],
            max: [maxX, maxY, maxZ]
        };
    }
}
