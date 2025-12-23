/**
 * OBJ model loader implementation
 * OBJ 模型加载器实现
 *
 * Supports:
 * - Wavefront OBJ format (.obj)
 * - Vertices, normals, texture coordinates
 * - Triangular and quad faces (quads are triangulated)
 * - Multiple objects/groups
 * - MTL material references (materials loaded separately)
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
    IBoundingBox
} from '../interfaces/IAssetLoader';

/**
 * Parsed OBJ data structure
 * 解析后的 OBJ 数据结构
 */
interface OBJParseResult {
    positions: number[];
    normals: number[];
    uvs: number[];
    objects: OBJObject[];
    mtlLib?: string;
}

interface OBJObject {
    name: string;
    material?: string;
    faces: OBJFace[];
}

interface OBJFace {
    vertices: OBJVertex[];
}

interface OBJVertex {
    positionIndex: number;
    uvIndex?: number;
    normalIndex?: number;
}

/**
 * OBJ model loader
 * OBJ 模型加载器
 */
export class OBJLoader implements IAssetLoader<IGLTFAsset> {
    readonly supportedType = AssetType.Model3D;
    readonly supportedExtensions = ['.obj'];
    readonly contentType: AssetContentType = 'text';

    /**
     * Parse OBJ content
     * 解析 OBJ 内容
     */
    async parse(content: IAssetContent, context: IAssetParseContext): Promise<IGLTFAsset> {
        const text = content.text;
        if (!text) {
            throw new Error('OBJ loader requires text content');
        }

        // Parse OBJ text
        // 解析 OBJ 文本
        const objData = this.parseOBJ(text);

        // Convert to meshes
        // 转换为网格
        const meshes = this.buildMeshes(objData);

        // Create default materials
        // 创建默认材质
        const materials = this.buildMaterials(objData);

        // Build nodes (one per object)
        // 构建节点（每个对象一个）
        const nodes: IGLTFNode[] = meshes.map((mesh, index) => ({
            name: mesh.name,
            meshIndex: index,
            children: [],
            transform: {
                position: [0, 0, 0],
                rotation: [0, 0, 0, 1],
                scale: [1, 1, 1]
            }
        }));

        // Calculate overall bounds
        // 计算总边界
        const bounds = this.calculateBounds(meshes);

        // Get model name from file path
        // 从文件路径获取模型名称
        const pathParts = context.metadata.path.split(/[\\/]/);
        const fileName = pathParts[pathParts.length - 1];
        const name = fileName.replace(/\.obj$/i, '');

        return {
            name,
            meshes,
            materials,
            textures: [],
            nodes,
            rootNodes: nodes.map((_, i) => i),
            bounds,
            sourcePath: context.metadata.path
        };
    }

    /**
     * Dispose OBJ asset
     * 释放 OBJ 资产
     */
    dispose(asset: IGLTFAsset): void {
        for (const mesh of asset.meshes) {
            (mesh as { vertices: Float32Array | null }).vertices = null!;
            (mesh as { indices: Uint16Array | Uint32Array | null }).indices = null!;
        }
        asset.meshes.length = 0;
    }

    // ===== Private Methods =====

    /**
     * Parse OBJ text format
     * 解析 OBJ 文本格式
     */
    private parseOBJ(text: string): OBJParseResult {
        const lines = text.split('\n');

        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const objects: OBJObject[] = [];

        let currentObject: OBJObject = { name: 'default', faces: [] };
        let mtlLib: string | undefined;

        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum].trim();

            // Skip comments and empty lines
            // 跳过注释和空行
            if (line.length === 0 || line.startsWith('#')) continue;

            const parts = line.split(/\s+/);
            const keyword = parts[0];

            switch (keyword) {
                case 'v': // Vertex position
                    positions.push(
                        parseFloat(parts[1]) || 0,
                        parseFloat(parts[2]) || 0,
                        parseFloat(parts[3]) || 0
                    );
                    break;

                case 'vn': // Vertex normal
                    normals.push(
                        parseFloat(parts[1]) || 0,
                        parseFloat(parts[2]) || 0,
                        parseFloat(parts[3]) || 0
                    );
                    break;

                case 'vt': // Texture coordinate
                    uvs.push(
                        parseFloat(parts[1]) || 0,
                        parseFloat(parts[2]) || 0
                    );
                    break;

                case 'f': // Face
                    const face = this.parseFace(parts.slice(1));
                    if (face.vertices.length >= 3) {
                        // Triangulate if more than 3 vertices (fan triangulation)
                        // 如果超过 3 个顶点则三角化（扇形三角化）
                        for (let i = 1; i < face.vertices.length - 1; i++) {
                            currentObject.faces.push({
                                vertices: [
                                    face.vertices[0],
                                    face.vertices[i],
                                    face.vertices[i + 1]
                                ]
                            });
                        }
                    }
                    break;

                case 'o': // Object name
                case 'g': // Group name
                    if (currentObject.faces.length > 0) {
                        objects.push(currentObject);
                    }
                    currentObject = {
                        name: parts.slice(1).join(' ') || 'unnamed',
                        faces: []
                    };
                    break;

                case 'usemtl': // Material reference
                    // If current object has faces with different material, split it
                    // 如果当前对象有不同材质的面，则拆分
                    if (currentObject.faces.length > 0 && currentObject.material) {
                        objects.push(currentObject);
                        currentObject = {
                            name: `${currentObject.name}_${parts[1]}`,
                            faces: [],
                            material: parts[1]
                        };
                    } else {
                        currentObject.material = parts[1];
                    }
                    break;

                case 'mtllib': // MTL library reference
                    mtlLib = parts[1];
                    break;

                case 's': // Smoothing group (ignored)
                case 'l': // Line (ignored)
                    break;
            }
        }

        // Push last object
        // 推送最后一个对象
        if (currentObject.faces.length > 0) {
            objects.push(currentObject);
        }

        // If no objects were created, create one from default
        // 如果没有创建对象，从默认创建一个
        if (objects.length === 0 && currentObject.faces.length === 0) {
            throw new Error('OBJ file contains no geometry');
        }

        return { positions, normals, uvs, objects, mtlLib };
    }

    /**
     * Parse a face definition
     * 解析面定义
     *
     * Format: v, v/vt, v/vt/vn, v//vn
     */
    private parseFace(parts: string[]): OBJFace {
        const vertices: OBJVertex[] = [];

        for (const part of parts) {
            const indices = part.split('/');
            const vertex: OBJVertex = {
                positionIndex: parseInt(indices[0], 10) - 1 // OBJ is 1-indexed
            };

            if (indices.length > 1 && indices[1]) {
                vertex.uvIndex = parseInt(indices[1], 10) - 1;
            }

            if (indices.length > 2 && indices[2]) {
                vertex.normalIndex = parseInt(indices[2], 10) - 1;
            }

            vertices.push(vertex);
        }

        return { vertices };
    }

    /**
     * Build mesh data from parsed OBJ
     * 从解析的 OBJ 构建网格数据
     */
    private buildMeshes(objData: OBJParseResult): IMeshData[] {
        const meshes: IMeshData[] = [];

        for (const obj of objData.objects) {
            const mesh = this.buildMesh(obj, objData);
            meshes.push(mesh);
        }

        return meshes;
    }

    /**
     * Build a single mesh from OBJ object
     * 从 OBJ 对象构建单个网格
     */
    private buildMesh(obj: OBJObject, objData: OBJParseResult): IMeshData {
        // OBJ uses indexed vertices, but indices can reference different
        // position/uv/normal combinations, so we need to expand
        // OBJ 使用索引顶点，但索引可以引用不同的 position/uv/normal 组合，所以需要展开

        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        // Map to track unique vertex combinations
        // 用于跟踪唯一顶点组合的映射
        const vertexMap = new Map<string, number>();
        let vertexIndex = 0;

        for (const face of obj.faces) {
            const faceIndices: number[] = [];

            for (const vertex of face.vertices) {
                // Create unique key for this vertex combination
                // 为此顶点组合创建唯一键
                const key = `${vertex.positionIndex}/${vertex.uvIndex ?? ''}/${vertex.normalIndex ?? ''}`;

                let index = vertexMap.get(key);
                if (index === undefined) {
                    // New unique vertex - add to arrays
                    // 新的唯一顶点 - 添加到数组
                    index = vertexIndex++;
                    vertexMap.set(key, index);

                    // Position
                    const pi = vertex.positionIndex * 3;
                    positions.push(
                        objData.positions[pi] ?? 0,
                        objData.positions[pi + 1] ?? 0,
                        objData.positions[pi + 2] ?? 0
                    );

                    // UV
                    if (vertex.uvIndex !== undefined) {
                        const ui = vertex.uvIndex * 2;
                        uvs.push(
                            objData.uvs[ui] ?? 0,
                            1 - (objData.uvs[ui + 1] ?? 0) // Flip V coordinate
                        );
                    } else {
                        uvs.push(0, 0);
                    }

                    // Normal
                    if (vertex.normalIndex !== undefined) {
                        const ni = vertex.normalIndex * 3;
                        normals.push(
                            objData.normals[ni] ?? 0,
                            objData.normals[ni + 1] ?? 0,
                            objData.normals[ni + 2] ?? 0
                        );
                    } else {
                        normals.push(0, 1, 0); // Default up normal
                    }
                }

                faceIndices.push(index);
            }

            // Add triangle indices
            // 添加三角形索引
            if (faceIndices.length === 3) {
                indices.push(faceIndices[0], faceIndices[1], faceIndices[2]);
            }
        }

        // Calculate bounds
        // 计算边界
        const bounds = this.calculateMeshBounds(positions);

        // Generate normals if not provided
        // 如果未提供法线则生成
        const hasValidNormals = objData.normals.length > 0;
        const finalNormals = hasValidNormals
            ? new Float32Array(normals)
            : this.generateNormals(positions, indices);

        return {
            name: obj.name,
            vertices: new Float32Array(positions),
            indices: new Uint32Array(indices),
            normals: finalNormals,
            uvs: new Float32Array(uvs),
            bounds,
            materialIndex: -1 // Material resolved by name
        };
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

            // Add to vertex normals (will be normalized later or kept as-is for flat shading)
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
            }
        }

        return normals;
    }

    /**
     * Build default materials
     * 构建默认材质
     */
    private buildMaterials(objData: OBJParseResult): IGLTFMaterial[] {
        // Create one default material per unique material name
        // 为每个唯一的材质名称创建一个默认材质
        const materialNames = new Set<string>();
        for (const obj of objData.objects) {
            if (obj.material) {
                materialNames.add(obj.material);
            }
        }

        const materials: IGLTFMaterial[] = [];

        // Default material
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

        // Named materials (with placeholder values)
        for (const name of materialNames) {
            materials.push({
                name,
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
