export interface KHRDracoMeshCompression {
    bufferView: number;
    attributes: Record<string, number>;
}
export interface DecodedDracoGeometry {
    indices?: DecodedStorage;
    vertices: Record<string, DecodedStorage>;
}
export type DecodedStorage = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array;
export type DecodedStorageConstructor = Int8ArrayConstructor | Int16ArrayConstructor | Int32ArrayConstructor | Uint8ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor;
export interface DecodeDracoGeometryOptions {
    buffer: Int8Array;
    indices?: DecodedStorageConstructor;
    attributes: Record<string, {
        /**
         * Unique id in the compressed data.
         */
        uniqueId: number;
        /**
         * Its associated accessor.
         */
        storageConstructor: DecodedStorageConstructor;
        /**
         * How many storage units one attribute occupies.
         */
        components: number;
    }>;
}
export declare function decodeDracoGeometry(options: DecodeDracoGeometryOptions): DecodedDracoGeometry;
