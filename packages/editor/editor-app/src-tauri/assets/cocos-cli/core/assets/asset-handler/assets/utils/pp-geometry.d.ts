import { gfx } from 'cc';
export type PPGeometryTypedArrayConstructor = typeof Int8Array | typeof Uint8Array | typeof Int16Array | typeof Uint16Array | typeof Int32Array | typeof Uint32Array | typeof Float32Array | typeof Float64Array;
export type PPGeometryTypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
/**
 * Post-processing geometry.
 */
export declare class PPGeometry {
    static skinningProcess(originals: PPGeometry[], disableMeshSplit: boolean | undefined): {
        geometries: PPGeometry[];
        materialIndices: number[];
        jointMaps: number[][];
    };
    get vertexCount(): number;
    get indices(): PPGeometryTypedArray | undefined;
    get primitiveMode(): gfx.PrimitiveMode;
    get jointMapIndex(): number | undefined;
    private _vertexCount;
    private _vertices;
    private _primitiveMode;
    private _indices?;
    private _generatedIndices?;
    private _jointSet?;
    private _jointMapIndex?;
    constructor(vertexCount: number, primitiveMode: gfx.PrimitiveMode, indices?: PPGeometryTypedArray, jointSet?: Set<number>);
    calculateNormals(storageConstructor?: PPGeometryTypedArrayConstructor): PPGeometryTypedArray;
    calculateTangents(storageConstructor?: PPGeometryTypedArrayConstructor, uvset?: number): PPGeometryTypedArray;
    sanityCheck(): void;
    getAttribute(semantic: PPGeometry.Semantic): PPGeometry.Attribute;
    hasAttribute(semantic: PPGeometry.Semantic): boolean;
    deleteAttribute(semantic: PPGeometry.Semantic): void;
    setAttribute(semantic: PPGeometry.Semantic, data: PPGeometryTypedArray, components: number, isNormalized?: boolean): void;
    attributes(): Generator<PPGeometry.Attribute, void, unknown>;
    forEachAttribute(visitor: (attribute: PPGeometry.Attribute) => void): void;
    /**
     * Reduce the max number of joint influence up to 4(one set).
     * Note, this method may result in non-normalized weights.
     */
    reduceJointInfluences(): void;
    private _getTriangleIndices;
    private _assertAttribute;
}
export declare namespace PPGeometry {
    enum StdSemantics {
        position = 0,
        normal = 1,
        texcoord = 2,
        tangent = 3,
        joints = 4,
        weights = 5,
        color = 6
    }
    namespace StdSemantics {
        function set(semantic: StdSemantics, set: number): number;
        function decode(semantic: number): {
            semantic0: StdSemantics;
            set: number;
        };
    }
    type Semantic = StdSemantics | number | string;
    function isStdSemantic(semantic: Semantic): semantic is StdSemantics | number;
    class Attribute {
        semantic: PPGeometry.Semantic;
        data: PPGeometryTypedArray;
        components: number;
        isNormalized: boolean;
        morphs: PPGeometryTypedArray[] | null;
        constructor(semantic: PPGeometry.Semantic, data: PPGeometryTypedArray, components: number, isNormalized?: boolean);
        getGFXFormat(): gfx.Format;
    }
}
/**
 * @returns The corresponding GFX attribute name.
 * @throws If the attribute **is standard semantic** but is not a valid GFX attribute name:
 * - It has a different number of component which is not permitted.
 * - Its set count beyond how many that kind of GFX attributes can proceed.
 */
export declare function getGfxAttributeName(attribute: PPGeometry.Attribute): string;
/**
 * Get the normalizer which normalize the integers of specified type array
 * into [0, 1](for unsigned integers) or [-1, 1](for signed integers).
 * The normalization is performed as described in:
 * https://www.khronos.org/opengl/wiki/Normalized_Integer
 * @returns The normalizer, or `undefined` if no corresponding normalizer.
 */
export declare const getNormalizer: (typedArray: PPGeometryTypedArray) => (value: number) => number;
