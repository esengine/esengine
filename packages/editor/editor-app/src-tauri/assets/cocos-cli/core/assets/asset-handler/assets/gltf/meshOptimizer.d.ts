import { Mesh } from 'cc';
import { MeshCompressOptions, MeshOptimizeOptions, MeshSimplifyOptions, MeshClusterOptions } from '../../../@types/userDatas';
export declare function optimizeMesh(mesh: Mesh, options?: MeshOptimizeOptions): Promise<Mesh>;
export declare function clusterizeMesh(mesh: Mesh, options?: MeshClusterOptions): Promise<Mesh>;
export declare function getDefaultSimplifyOptions(): {
    enable: boolean;
    targetRatio: number;
    autoErrorRatio: boolean;
    lockBoundary: boolean;
};
export declare function simplifyMesh(mesh: Mesh, options?: MeshSimplifyOptions): Promise<Mesh>;
export declare function compressMesh(mesh: Mesh, options?: MeshCompressOptions): Promise<Mesh>;
export declare function encodeMesh(mesh: Mesh): Promise<Mesh>;
export declare function quantizeMesh(mesh: Mesh): Promise<Mesh>;
export declare function deflateMesh(mesh: Mesh): Promise<Mesh>;
