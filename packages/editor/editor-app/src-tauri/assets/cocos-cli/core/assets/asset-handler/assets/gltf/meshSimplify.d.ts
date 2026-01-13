import { Vec3 } from 'cc';
import { Mesh } from 'cc';
import { SimplifyOptions } from '../../meta-schemas/glTF.meta';
/**
 * 设置参数
 */
declare class SimplificationOptions {
    preserveSurfaceCurvature: boolean;
    preserveBorderEdges: boolean;
    preserveUVSeamEdges: boolean;
    preserveUVFoldoverEdges: boolean;
    enableSmartLink: boolean;
    vertexLinkDistance: number;
    maxIterationCount: number;
    agressiveness: number;
}
/**
 * 网格简化
 */
export declare class MeshSimplify {
    simplificationOptions: SimplificationOptions;
    private _triangles;
    private _vertices;
    private _vertNormals;
    private _vertTangents;
    private _vertUV2D;
    private _vertUV3D;
    private _vertUV4D;
    private _vertColors;
    private _vertJoints;
    private _vertWeights;
    private _refs;
    private _geometricInfo;
    private _triangleHashSet1;
    private _triangleHashSet2;
    /**
     * 初始化
     * @param origVertices
     * @param origFaces
     * @param info
     */
    init(origVertices: Vec3[], origFaces: any[], info: {
        normals?: any;
        uvs?: any;
        tangents?: any;
        colors?: any;
        joints?: any;
        weights?: any;
    }): void;
    /**
     * 修改队列长度
     * @param array
     * @param count
     * @returns
     */
    private _resize;
    /**
     * 移动数据
     * @param refs
     * @param dest
     * @param source
     * @param count
     */
    private _move;
    /**
     * 合并网格
     */
    compactMesh(): void;
    /**
     * 简化网格
     * @param target_count
     * @param agressiveness
     */
    private _simplifyMesh;
    private _flipped;
    /**
     * 更新三角形信息
     * @param i0
     * @param ia0
     * @param v
     * @param deleted
     * @param deleted_triangles
     * @returns
     */
    private _updateTriangles;
    private _updateMesh;
    private _vertexError;
    private _calculateError;
    private _updateReferences;
    private _curvatureError;
    private _getTrianglesContainingVertex;
    private _getTrianglesContainingBothVertices;
    simplifyMesh(target_count: number, agressiveness?: number): {
        positions: any;
        indices: any;
        normals?: number[];
        uvs?: any;
        tangents?: any;
        colors?: any;
        attrs: any;
    } | undefined;
    /**
     * 构建geometry信息
     * @param geometry
     */
    buildGeometric(geometry: {
        vertices?: Vec3[];
        faces?: any[];
        positions: string | any[];
        normals: any;
        uvs: any;
        tangents: any;
        indices?: ArrayLike<number>;
        weights?: any;
        joints?: any;
        colors?: any;
    }): void;
    /**
     * 计算合并的uv信息
     * @param point
     * @param a
     * @param b
     * @param c
     * @param result
     */
    calculateBarycentricCoords(point: Vec3, a: Vec3, b: Vec3, c: Vec3, result: Vec3): void;
    private _interpolateVertexAttributes;
    private _normalizeTangent;
}
export declare function getDefaultSimplifyOptions(): {
    targetRatio: number;
    enableSmartLink: boolean;
    agressiveness: number;
    maxIterationCount: number;
};
export declare function simplifyMesh(mesh: Mesh, options?: SimplifyOptions): any;
export {};
