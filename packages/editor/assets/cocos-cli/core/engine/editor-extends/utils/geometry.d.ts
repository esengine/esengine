import { gfx } from 'cc';
interface IWritableArrayLike<T> {
    length: number;
    [index: number]: T;
}
export declare const calculateNormals: (positions: ArrayLike<number>, indices: ArrayLike<number>, out?: IWritableArrayLike<number>) => IWritableArrayLike<number>;
export declare const calculateTangents: (positions: ArrayLike<number>, indices: ArrayLike<number>, normals: ArrayLike<number>, uvs: ArrayLike<number>, out?: IWritableArrayLike<number>) => IWritableArrayLike<number>;
export declare function forEachFace(indices: ArrayLike<number>, primitiveMode: gfx.PrimitiveMode, callback: (faceIndices: number[]) => any): void;
export declare class MeshSplitInfo {
    indices: number[];
    jointSet: Set<number>;
    primitiveMode: gfx.PrimitiveMode;
    constructor(primitiveMode?: any);
}
export declare const splitBasedOnJoints: (joints: ArrayLike<number>, indices: ArrayLike<number>, primitiveMode: gfx.PrimitiveMode, capacity: number) => MeshSplitInfo[];
export declare function getUintArrayCtor(maxElement: number): Uint8ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor;
export {};
