/**
 * GLTF/GLB model loader implementation
 * GLTF/GLB 模型加载器实现
 *
 * Supports:
 * - GLTF 2.0 (.gltf with external/embedded resources)
 * - GLB (.glb binary format)
 * - PBR materials
 * - Scene hierarchy
 * - Animations (basic)
 * - Skinning (basic)
 */

import { AssetType } from '../types/AssetTypes';
import type { IAssetContent, AssetContentType } from '../interfaces/IAssetReader';
import type {
    IAssetLoader,
    IAssetParseContext,
    IGLTFAsset,
    IMeshData,
    IGLTFMaterial,
    IGLTFTextureInfo,
    IGLTFNode,
    IGLTFAnimationClip,
    IAnimationSampler,
    IAnimationChannel,
    IBoundingBox,
    ISkeletonData,
    ISkeletonJoint
} from '../interfaces/IAssetLoader';

// ===== GLTF JSON Schema Types =====

interface GLTFJson {
    asset: { version: string; generator?: string };
    scene?: number;
    scenes?: GLTFScene[];
    nodes?: GLTFNodeDef[];
    meshes?: GLTFMeshDef[];
    accessors?: GLTFAccessor[];
    bufferViews?: GLTFBufferView[];
    buffers?: GLTFBuffer[];
    materials?: GLTFMaterialDef[];
    textures?: GLTFTextureDef[];
    images?: GLTFImage[];
    samplers?: GLTFSampler[];
    animations?: GLTFAnimation[];
    skins?: GLTFSkin[];
}

interface GLTFScene {
    name?: string;
    nodes?: number[];
}

interface GLTFNodeDef {
    name?: string;
    mesh?: number;
    children?: number[];
    translation?: [number, number, number];
    rotation?: [number, number, number, number];
    scale?: [number, number, number];
    matrix?: number[];
    skin?: number;
}

interface GLTFMeshDef {
    name?: string;
    primitives: GLTFPrimitive[];
}

interface GLTFPrimitive {
    attributes: Record<string, number>;
    indices?: number;
    material?: number;
    mode?: number;
}

interface GLTFAccessor {
    bufferView?: number;
    byteOffset?: number;
    componentType: number;
    count: number;
    type: string;
    min?: number[];
    max?: number[];
    normalized?: boolean;
}

interface GLTFBufferView {
    buffer: number;
    byteOffset?: number;
    byteLength: number;
    byteStride?: number;
    target?: number;
}

interface GLTFBuffer {
    uri?: string;
    byteLength: number;
}

interface GLTFMaterialDef {
    name?: string;
    pbrMetallicRoughness?: {
        baseColorFactor?: [number, number, number, number];
        baseColorTexture?: { index: number };
        metallicFactor?: number;
        roughnessFactor?: number;
        metallicRoughnessTexture?: { index: number };
    };
    normalTexture?: { index: number; scale?: number };
    occlusionTexture?: { index: number; strength?: number };
    emissiveFactor?: [number, number, number];
    emissiveTexture?: { index: number };
    alphaMode?: 'OPAQUE' | 'MASK' | 'BLEND';
    alphaCutoff?: number;
    doubleSided?: boolean;
}

interface GLTFTextureDef {
    source?: number;
    sampler?: number;
    name?: string;
}

interface GLTFImage {
    uri?: string;
    mimeType?: string;
    bufferView?: number;
    name?: string;
}

interface GLTFSampler {
    magFilter?: number;
    minFilter?: number;
    wrapS?: number;
    wrapT?: number;
}

interface GLTFAnimation {
    name?: string;
    channels: GLTFAnimationChannel[];
    samplers: GLTFAnimationSampler[];
}

interface GLTFAnimationChannel {
    sampler: number;
    target: {
        node?: number;
        path: 'translation' | 'rotation' | 'scale' | 'weights';
    };
}

interface GLTFAnimationSampler {
    input: number;
    output: number;
    interpolation?: 'LINEAR' | 'STEP' | 'CUBICSPLINE';
}

interface GLTFSkin {
    name?: string;
    inverseBindMatrices?: number;
    skeleton?: number;
    joints: number[];
}

// ===== Component Type Constants =====
const COMPONENT_TYPE_BYTE = 5120;
const COMPONENT_TYPE_UNSIGNED_BYTE = 5121;
const COMPONENT_TYPE_SHORT = 5122;
const COMPONENT_TYPE_UNSIGNED_SHORT = 5123;
const COMPONENT_TYPE_UNSIGNED_INT = 5125;
const COMPONENT_TYPE_FLOAT = 5126;

// ===== GLB Constants =====
const GLB_MAGIC = 0x46546C67; // 'glTF'
const GLB_VERSION = 2;
const GLB_CHUNK_TYPE_JSON = 0x4E4F534A; // 'JSON'
const GLB_CHUNK_TYPE_BIN = 0x004E4942; // 'BIN\0'

/**
 * GLTF/GLB model loader
 * GLTF/GLB 模型加载器
 */
export class GLTFLoader implements IAssetLoader<IGLTFAsset> {
    readonly supportedType = AssetType.Model3D;
    readonly supportedExtensions = ['.gltf', '.glb'];
    readonly contentType: AssetContentType = 'binary';

    /**
     * Parse GLTF/GLB content
     * 解析 GLTF/GLB 内容
     */
    async parse(content: IAssetContent, context: IAssetParseContext): Promise<IGLTFAsset> {
        const binary = content.binary;
        if (!binary) {
            throw new Error('GLTF loader requires binary content');
        }

        const isGLB = this.isGLB(binary);
        let json: GLTFJson;
        let binaryChunk: ArrayBuffer | null = null;

        if (isGLB) {
            const glbData = this.parseGLB(binary);
            json = glbData.json;
            binaryChunk = glbData.binary;
        } else {
            // GLTF is JSON text
            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(binary);
            json = JSON.parse(text) as GLTFJson;
        }

        // Validate GLTF version
        if (!json.asset?.version?.startsWith('2.')) {
            throw new Error(`Unsupported GLTF version: ${json.asset?.version}. Only GLTF 2.x is supported.`);
        }

        // Load external buffers if needed
        const buffers = await this.loadBuffers(json, binaryChunk, context);

        // Parse all components
        const meshes = this.parseMeshes(json, buffers);
        const materials = this.parseMaterials(json);
        const textures = await this.parseTextures(json, buffers, context);
        const nodes = this.parseNodes(json);
        const rootNodes = this.getRootNodes(json);
        const animations = this.parseAnimations(json, buffers);
        const skeleton = this.parseSkeleton(json, buffers);
        const bounds = this.calculateBounds(meshes);

        // Get model name from file path
        const pathParts = context.metadata.path.split(/[\\/]/);
        const fileName = pathParts[pathParts.length - 1];
        const name = fileName.replace(/\.(gltf|glb)$/i, '');

        return {
            name,
            meshes,
            materials,
            textures,
            nodes,
            rootNodes,
            animations: animations.length > 0 ? animations : undefined,
            skeleton,
            bounds,
            sourcePath: context.metadata.path
        };
    }

    /**
     * Dispose GLTF asset
     * 释放 GLTF 资产
     */
    dispose(asset: IGLTFAsset): void {
        // Clear mesh data
        for (const mesh of asset.meshes) {
            (mesh as { vertices: Float32Array | null }).vertices = null!;
            (mesh as { indices: Uint16Array | Uint32Array | null }).indices = null!;
            if (mesh.normals) (mesh as { normals: Float32Array | null }).normals = null;
            if (mesh.uvs) (mesh as { uvs: Float32Array | null }).uvs = null;
            if (mesh.colors) (mesh as { colors: Float32Array | null }).colors = null;
        }
        asset.meshes.length = 0;
        asset.materials.length = 0;
        asset.textures.length = 0;
        asset.nodes.length = 0;
    }

    // ===== Private Methods =====

    /**
     * Check if content is GLB format
     */
    private isGLB(data: ArrayBuffer): boolean {
        if (data.byteLength < 12) return false;
        const view = new DataView(data);
        return view.getUint32(0, true) === GLB_MAGIC;
    }

    /**
     * Parse GLB binary format
     */
    private parseGLB(data: ArrayBuffer): { json: GLTFJson; binary: ArrayBuffer | null } {
        const view = new DataView(data);

        // Header
        const magic = view.getUint32(0, true);
        const version = view.getUint32(4, true);
        const length = view.getUint32(8, true);

        if (magic !== GLB_MAGIC) {
            throw new Error('Invalid GLB magic number');
        }
        if (version !== GLB_VERSION) {
            throw new Error(`Unsupported GLB version: ${version}`);
        }
        if (length !== data.byteLength) {
            throw new Error('GLB length mismatch');
        }

        let json: GLTFJson | null = null;
        let binary: ArrayBuffer | null = null;
        let offset = 12;

        // Parse chunks
        while (offset < length) {
            const chunkLength = view.getUint32(offset, true);
            const chunkType = view.getUint32(offset + 4, true);
            const chunkData = data.slice(offset + 8, offset + 8 + chunkLength);

            if (chunkType === GLB_CHUNK_TYPE_JSON) {
                const decoder = new TextDecoder('utf-8');
                json = JSON.parse(decoder.decode(chunkData)) as GLTFJson;
            } else if (chunkType === GLB_CHUNK_TYPE_BIN) {
                binary = chunkData;
            }

            offset += 8 + chunkLength;
        }

        if (!json) {
            throw new Error('GLB missing JSON chunk');
        }

        return { json, binary };
    }

    /**
     * Load buffer data
     */
    private async loadBuffers(
        json: GLTFJson,
        binaryChunk: ArrayBuffer | null,
        _context: IAssetParseContext
    ): Promise<ArrayBuffer[]> {
        const buffers: ArrayBuffer[] = [];

        if (!json.buffers) return buffers;

        for (let i = 0; i < json.buffers.length; i++) {
            const bufferDef = json.buffers[i];

            if (!bufferDef.uri) {
                // GLB embedded binary chunk
                if (binaryChunk && i === 0) {
                    buffers.push(binaryChunk);
                } else {
                    throw new Error(`Buffer ${i} has no URI and no binary chunk available`);
                }
            } else if (bufferDef.uri.startsWith('data:')) {
                // Data URI
                buffers.push(this.decodeDataUri(bufferDef.uri));
            } else {
                // External file - not supported yet, would need asset loader context
                throw new Error(`External buffer URIs not supported yet: ${bufferDef.uri}`);
            }
        }

        return buffers;
    }

    /**
     * Decode base64 data URI
     */
    private decodeDataUri(uri: string): ArrayBuffer {
        const match = uri.match(/^data:[^;]*;base64,(.*)$/);
        if (!match) {
            throw new Error('Invalid data URI format');
        }

        const base64 = match[1];
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Get accessor data as typed array
     */
    private getAccessorData(
        json: GLTFJson,
        buffers: ArrayBuffer[],
        accessorIndex: number
    ): { data: ArrayBufferView; count: number; componentCount: number } {
        const accessor = json.accessors![accessorIndex];
        const bufferView = json.bufferViews![accessor.bufferView!];
        const buffer = buffers[bufferView.buffer];

        const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
        const componentCount = this.getComponentCount(accessor.type);
        const elementCount = accessor.count * componentCount;

        let data: ArrayBufferView;

        switch (accessor.componentType) {
            case COMPONENT_TYPE_BYTE:
                data = new Int8Array(buffer, byteOffset, elementCount);
                break;
            case COMPONENT_TYPE_UNSIGNED_BYTE:
                data = new Uint8Array(buffer, byteOffset, elementCount);
                break;
            case COMPONENT_TYPE_SHORT:
                data = new Int16Array(buffer, byteOffset, elementCount);
                break;
            case COMPONENT_TYPE_UNSIGNED_SHORT:
                data = new Uint16Array(buffer, byteOffset, elementCount);
                break;
            case COMPONENT_TYPE_UNSIGNED_INT:
                data = new Uint32Array(buffer, byteOffset, elementCount);
                break;
            case COMPONENT_TYPE_FLOAT:
                data = new Float32Array(buffer, byteOffset, elementCount);
                break;
            default:
                throw new Error(`Unsupported component type: ${accessor.componentType}`);
        }

        return { data, count: accessor.count, componentCount };
    }

    /**
     * Get component count from accessor type
     */
    private getComponentCount(type: string): number {
        switch (type) {
            case 'SCALAR': return 1;
            case 'VEC2': return 2;
            case 'VEC3': return 3;
            case 'VEC4': return 4;
            case 'MAT2': return 4;
            case 'MAT3': return 9;
            case 'MAT4': return 16;
            default:
                throw new Error(`Unknown accessor type: ${type}`);
        }
    }

    /**
     * Parse all meshes
     */
    private parseMeshes(json: GLTFJson, buffers: ArrayBuffer[]): IMeshData[] {
        const meshes: IMeshData[] = [];

        if (!json.meshes) return meshes;

        for (const meshDef of json.meshes) {
            for (const primitive of meshDef.primitives) {
                // Only support triangles (mode 4 or undefined)
                if (primitive.mode !== undefined && primitive.mode !== 4) {
                    console.warn('Skipping non-triangle primitive');
                    continue;
                }

                const mesh = this.parsePrimitive(json, buffers, primitive, meshDef.name || 'Mesh');
                meshes.push(mesh);
            }
        }

        return meshes;
    }

    /**
     * Parse a single primitive
     */
    private parsePrimitive(
        json: GLTFJson,
        buffers: ArrayBuffer[],
        primitive: GLTFPrimitive,
        name: string
    ): IMeshData {
        // Position (required)
        const positionAccessor = primitive.attributes['POSITION'];
        if (positionAccessor === undefined) {
            throw new Error('Mesh primitive missing POSITION attribute');
        }
        const positionData = this.getAccessorData(json, buffers, positionAccessor);
        const vertices = new Float32Array(positionData.data.buffer, (positionData.data as Float32Array).byteOffset, positionData.count * 3);

        // Indices (optional, generate sequential if missing)
        let indices: Uint16Array | Uint32Array;
        if (primitive.indices !== undefined) {
            const indexData = this.getAccessorData(json, buffers, primitive.indices);
            if (indexData.data instanceof Uint32Array) {
                indices = indexData.data;
            } else if (indexData.data instanceof Uint16Array) {
                indices = indexData.data;
            } else {
                // Convert to Uint32Array
                indices = new Uint32Array(indexData.count);
                for (let i = 0; i < indexData.count; i++) {
                    indices[i] = (indexData.data as Uint8Array)[i];
                }
            }
        } else {
            // Generate sequential indices
            indices = new Uint32Array(positionData.count);
            for (let i = 0; i < positionData.count; i++) {
                indices[i] = i;
            }
        }

        // Normals (optional)
        let normals: Float32Array | undefined;
        const normalAccessor = primitive.attributes['NORMAL'];
        if (normalAccessor !== undefined) {
            const normalData = this.getAccessorData(json, buffers, normalAccessor);
            normals = new Float32Array(normalData.data.buffer, (normalData.data as Float32Array).byteOffset, normalData.count * 3);
        }

        // UVs (optional, TEXCOORD_0)
        let uvs: Float32Array | undefined;
        const uvAccessor = primitive.attributes['TEXCOORD_0'];
        if (uvAccessor !== undefined) {
            const uvData = this.getAccessorData(json, buffers, uvAccessor);
            uvs = new Float32Array(uvData.data.buffer, (uvData.data as Float32Array).byteOffset, uvData.count * 2);
        }

        // Vertex colors (optional, COLOR_0)
        let colors: Float32Array | undefined;
        const colorAccessor = primitive.attributes['COLOR_0'];
        if (colorAccessor !== undefined) {
            const colorData = this.getAccessorData(json, buffers, colorAccessor);
            // Normalize if needed
            if (colorData.data instanceof Float32Array) {
                colors = colorData.data;
            } else {
                // Convert from normalized bytes
                colors = new Float32Array(colorData.count * colorData.componentCount);
                const source = colorData.data as Uint8Array;
                for (let i = 0; i < source.length; i++) {
                    colors[i] = source[i] / 255;
                }
            }
        }

        // Tangents (optional)
        let tangents: Float32Array | undefined;
        const tangentAccessor = primitive.attributes['TANGENT'];
        if (tangentAccessor !== undefined) {
            const tangentData = this.getAccessorData(json, buffers, tangentAccessor);
            tangents = new Float32Array(tangentData.data.buffer, (tangentData.data as Float32Array).byteOffset, tangentData.count * 4);
        }

        // Skinning: JOINTS_0 (bone indices per vertex)
        // 蒙皮：JOINTS_0（每顶点的骨骼索引）
        let joints: Uint8Array | Uint16Array | undefined;
        const jointsAccessor = primitive.attributes['JOINTS_0'];
        if (jointsAccessor !== undefined) {
            const jointsData = this.getAccessorData(json, buffers, jointsAccessor);
            if (jointsData.data instanceof Uint8Array) {
                joints = new Uint8Array(jointsData.data.buffer, jointsData.data.byteOffset, jointsData.count * 4);
            } else if (jointsData.data instanceof Uint16Array) {
                joints = new Uint16Array(jointsData.data.buffer, jointsData.data.byteOffset, jointsData.count * 4);
            }
        }

        // Skinning: WEIGHTS_0 (bone weights per vertex)
        // 蒙皮：WEIGHTS_0（每顶点的骨骼权重）
        let weights: Float32Array | undefined;
        const weightsAccessor = primitive.attributes['WEIGHTS_0'];
        if (weightsAccessor !== undefined) {
            const weightsData = this.getAccessorData(json, buffers, weightsAccessor);
            if (weightsData.data instanceof Float32Array) {
                weights = new Float32Array(weightsData.data.buffer, weightsData.data.byteOffset, weightsData.count * 4);
            } else if (weightsData.data instanceof Uint8Array) {
                // Convert from normalized Uint8 to floats
                weights = new Float32Array(weightsData.count * 4);
                const source = weightsData.data;
                for (let i = 0; i < source.length; i++) {
                    weights[i] = source[i] / 255;
                }
            } else if (weightsData.data instanceof Uint16Array) {
                // Convert from normalized Uint16 to floats
                weights = new Float32Array(weightsData.count * 4);
                const source = weightsData.data;
                for (let i = 0; i < source.length; i++) {
                    weights[i] = source[i] / 65535;
                }
            }
        }

        // Calculate bounds
        const bounds = this.calculateMeshBounds(vertices);

        return {
            name,
            vertices,
            indices,
            normals,
            uvs,
            tangents,
            colors,
            joints,
            weights,
            bounds,
            materialIndex: primitive.material ?? -1
        };
    }

    /**
     * Calculate mesh bounding box
     */
    private calculateMeshBounds(vertices: Float32Array): IBoundingBox {
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            minZ = Math.min(minZ, z);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            maxZ = Math.max(maxZ, z);
        }

        return {
            min: [minX, minY, minZ],
            max: [maxX, maxY, maxZ]
        };
    }

    /**
     * Parse all materials
     */
    private parseMaterials(json: GLTFJson): IGLTFMaterial[] {
        const materials: IGLTFMaterial[] = [];

        if (!json.materials) {
            // Add default material
            materials.push(this.createDefaultMaterial());
            return materials;
        }

        for (const matDef of json.materials) {
            const pbr = matDef.pbrMetallicRoughness || {};

            materials.push({
                name: matDef.name || 'Material',
                baseColorFactor: pbr.baseColorFactor || [1, 1, 1, 1],
                baseColorTextureIndex: pbr.baseColorTexture?.index ?? -1,
                metallicFactor: pbr.metallicFactor ?? 1,
                roughnessFactor: pbr.roughnessFactor ?? 1,
                metallicRoughnessTextureIndex: pbr.metallicRoughnessTexture?.index ?? -1,
                normalTextureIndex: matDef.normalTexture?.index ?? -1,
                normalScale: matDef.normalTexture?.scale ?? 1,
                occlusionTextureIndex: matDef.occlusionTexture?.index ?? -1,
                occlusionStrength: matDef.occlusionTexture?.strength ?? 1,
                emissiveFactor: matDef.emissiveFactor || [0, 0, 0],
                emissiveTextureIndex: matDef.emissiveTexture?.index ?? -1,
                alphaMode: matDef.alphaMode || 'OPAQUE',
                alphaCutoff: matDef.alphaCutoff ?? 0.5,
                doubleSided: matDef.doubleSided ?? false
            });
        }

        return materials;
    }

    /**
     * Create default material
     */
    private createDefaultMaterial(): IGLTFMaterial {
        return {
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
        };
    }

    /**
     * Parse textures
     */
    private async parseTextures(
        json: GLTFJson,
        buffers: ArrayBuffer[],
        _context: IAssetParseContext
    ): Promise<IGLTFTextureInfo[]> {
        const textures: IGLTFTextureInfo[] = [];

        if (!json.textures || !json.images) return textures;

        for (const texDef of json.textures) {
            if (texDef.source === undefined) {
                textures.push({});
                continue;
            }

            const imageDef = json.images[texDef.source];
            const textureInfo: IGLTFTextureInfo = {
                name: imageDef.name || texDef.name
            };

            if (imageDef.bufferView !== undefined) {
                // Embedded image
                const bufferView = json.bufferViews![imageDef.bufferView];
                const buffer = buffers[bufferView.buffer];
                const byteOffset = bufferView.byteOffset || 0;
                textureInfo.imageData = buffer.slice(byteOffset, byteOffset + bufferView.byteLength);
                textureInfo.mimeType = imageDef.mimeType;
            } else if (imageDef.uri) {
                if (imageDef.uri.startsWith('data:')) {
                    // Data URI
                    textureInfo.imageData = this.decodeDataUri(imageDef.uri);
                    const mimeMatch = imageDef.uri.match(/^data:(.*?);/);
                    textureInfo.mimeType = mimeMatch?.[1];
                } else {
                    // External URI
                    textureInfo.uri = imageDef.uri;
                }
            }

            textures.push(textureInfo);
        }

        return textures;
    }

    /**
     * Parse scene nodes
     */
    private parseNodes(json: GLTFJson): IGLTFNode[] {
        const nodes: IGLTFNode[] = [];

        if (!json.nodes) return nodes;

        for (const nodeDef of json.nodes) {
            let position: [number, number, number] = [0, 0, 0];
            let rotation: [number, number, number, number] = [0, 0, 0, 1];
            let scale: [number, number, number] = [1, 1, 1];

            if (nodeDef.matrix) {
                // Decompose matrix
                const m = nodeDef.matrix;
                // Extract translation
                position = [m[12], m[13], m[14]];
                // Extract scale
                scale = [
                    Math.sqrt(m[0] * m[0] + m[1] * m[1] + m[2] * m[2]),
                    Math.sqrt(m[4] * m[4] + m[5] * m[5] + m[6] * m[6]),
                    Math.sqrt(m[8] * m[8] + m[9] * m[9] + m[10] * m[10])
                ];
                // Extract rotation (simplified, assumes no shear)
                rotation = this.matrixToQuaternion(m, scale);
            } else {
                if (nodeDef.translation) {
                    position = nodeDef.translation;
                }
                if (nodeDef.rotation) {
                    rotation = nodeDef.rotation;
                }
                if (nodeDef.scale) {
                    scale = nodeDef.scale;
                }
            }

            nodes.push({
                name: nodeDef.name || 'Node',
                meshIndex: nodeDef.mesh,
                children: nodeDef.children || [],
                transform: { position, rotation, scale }
            });
        }

        return nodes;
    }

    /**
     * Extract quaternion from matrix
     */
    private matrixToQuaternion(m: number[], scale: [number, number, number]): [number, number, number, number] {
        // Normalize rotation matrix
        const sx = scale[0], sy = scale[1], sz = scale[2];
        const m00 = m[0] / sx, m01 = m[4] / sy, m02 = m[8] / sz;
        const m10 = m[1] / sx, m11 = m[5] / sy, m12 = m[9] / sz;
        const m20 = m[2] / sx, m21 = m[6] / sy, m22 = m[10] / sz;

        const trace = m00 + m11 + m22;
        let x: number, y: number, z: number, w: number;

        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);
            w = 0.25 / s;
            x = (m21 - m12) * s;
            y = (m02 - m20) * s;
            z = (m10 - m01) * s;
        } else if (m00 > m11 && m00 > m22) {
            const s = 2.0 * Math.sqrt(1.0 + m00 - m11 - m22);
            w = (m21 - m12) / s;
            x = 0.25 * s;
            y = (m01 + m10) / s;
            z = (m02 + m20) / s;
        } else if (m11 > m22) {
            const s = 2.0 * Math.sqrt(1.0 + m11 - m00 - m22);
            w = (m02 - m20) / s;
            x = (m01 + m10) / s;
            y = 0.25 * s;
            z = (m12 + m21) / s;
        } else {
            const s = 2.0 * Math.sqrt(1.0 + m22 - m00 - m11);
            w = (m10 - m01) / s;
            x = (m02 + m20) / s;
            y = (m12 + m21) / s;
            z = 0.25 * s;
        }

        return [x, y, z, w];
    }

    /**
     * Get root node indices
     */
    private getRootNodes(json: GLTFJson): number[] {
        const sceneIndex = json.scene ?? 0;
        const scene = json.scenes?.[sceneIndex];
        return scene?.nodes || [];
    }

    /**
     * Parse animations
     */
    private parseAnimations(json: GLTFJson, buffers: ArrayBuffer[]): IGLTFAnimationClip[] {
        const animations: IGLTFAnimationClip[] = [];

        if (!json.animations) return animations;

        for (const animDef of json.animations) {
            const samplers: IAnimationSampler[] = [];
            const channels: IAnimationChannel[] = [];
            let duration = 0;

            // Parse samplers
            for (const samplerDef of animDef.samplers) {
                const inputData = this.getAccessorData(json, buffers, samplerDef.input);
                const outputData = this.getAccessorData(json, buffers, samplerDef.output);

                const input = new Float32Array(inputData.data.buffer, (inputData.data as Float32Array).byteOffset, inputData.count);
                const output = new Float32Array(outputData.data.buffer, (outputData.data as Float32Array).byteOffset, outputData.count * outputData.componentCount);

                // Update duration
                if (input.length > 0) {
                    duration = Math.max(duration, input[input.length - 1]);
                }

                samplers.push({
                    input,
                    output,
                    interpolation: samplerDef.interpolation || 'LINEAR'
                });
            }

            // Parse channels
            for (const channelDef of animDef.channels) {
                if (channelDef.target.node === undefined) continue;

                channels.push({
                    samplerIndex: channelDef.sampler,
                    target: {
                        nodeIndex: channelDef.target.node,
                        path: channelDef.target.path
                    }
                });
            }

            animations.push({
                name: animDef.name || 'Animation',
                duration,
                samplers,
                channels
            });
        }

        return animations;
    }

    /**
     * Parse skeleton/skin data
     */
    private parseSkeleton(json: GLTFJson, buffers: ArrayBuffer[]): ISkeletonData | undefined {
        if (!json.skins || json.skins.length === 0) return undefined;

        // Use first skin
        const skin = json.skins[0];
        const joints: ISkeletonJoint[] = [];

        // Load inverse bind matrices
        let inverseBindMatrices: Float32Array | null = null;
        if (skin.inverseBindMatrices !== undefined) {
            const ibmData = this.getAccessorData(json, buffers, skin.inverseBindMatrices);
            inverseBindMatrices = new Float32Array(ibmData.data.buffer, (ibmData.data as Float32Array).byteOffset, ibmData.count * 16);
        }

        // Build joint hierarchy
        const jointIndexMap = new Map<number, number>();
        for (let i = 0; i < skin.joints.length; i++) {
            jointIndexMap.set(skin.joints[i], i);
        }

        for (let i = 0; i < skin.joints.length; i++) {
            const nodeIndex = skin.joints[i];
            const node = json.nodes![nodeIndex];

            // Find parent
            let parentIndex = -1;
            for (const [idx, jointIdx] of jointIndexMap) {
                if (jointIdx !== i) {
                    const parentNode = json.nodes![idx];
                    if (parentNode.children?.includes(nodeIndex)) {
                        parentIndex = jointIdx;
                        break;
                    }
                }
            }

            const ibm = new Float32Array(16);
            if (inverseBindMatrices) {
                for (let j = 0; j < 16; j++) {
                    ibm[j] = inverseBindMatrices[i * 16 + j];
                }
            } else {
                // Identity matrix
                ibm[0] = ibm[5] = ibm[10] = ibm[15] = 1;
            }

            joints.push({
                name: node.name || `Joint_${i}`,
                nodeIndex,
                parentIndex,
                inverseBindMatrix: ibm
            });
        }

        // Find root joint
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
     * Calculate combined bounds for all meshes
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
