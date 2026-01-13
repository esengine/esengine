declare module 'tga-js' {
    export default class TGA {
        width: number;
        height: number;
        getImageData(): { width: number; height: number; data: Uint8ClampedArray };
        constructor();
        load(data: Buffer): null;
    }
}

declare module 'psd.js' {
    import PNG from 'pngjs';
    export default class PSD {
        constructor(data: Buffer);

        parse();

        image: {
            toPng(): PNG;
        };
    }
}

declare module 'draco3dgltf' {
    export function createDecoderModule(options: DecoderModuleOptions): typeof DecoderModule;


    export interface DecoderModuleOptions { }


    interface DecoderModule { }

    namespace DecoderModule {
        function destroy(decoder: Decoder): void;

        function destroy(buffer: DecoderBuffer): void;

        function destroy(int32Array: DracoInt32Array): void;

        function destroy(mesh: Geometry): void;

        export class DecoderBuffer {
            public Init(buffer: Int8Array, size: number): void;
        }

        export class Decoder {
            public GetEncodedGeometryType(buffer: DecoderBuffer): GeometryType;

            public DecodeBufferToMesh(buffer: DecoderBuffer, mesh: Mesh): Status;

            public DecodeBufferToPointCloud(buffer: DecoderBuffer, pointCloud: PointCloud): Status;

            public GetFaceFromMesh(geometry: Geometry, index: number, out: DracoInt32Array): void;

            public GetAttributeId(geometry: Geometry, attributeType: AttributeType): number;

            public GetAttributeByUniqueId(geometry: Geometry, uniqueId: number): Attribute;

            public GetAttribute(geometry: Geometry, attributeId: number): Attribute;

            public GetAttributeInt8ForAllPoints(geometry: Geometry, attribute: Attribute, attributeData: DracoInt8Array): void;

            public GetAttributeInt16ForAllPoints(geometry: Geometry, attribute: Attribute, attributeData: DracoInt16Array): void;

            public GetAttributeInt32ForAllPoints(geometry: Geometry, attribute: Attribute, attributeData: DracoInt32Array): void;

            public GetAttributeUInt8ForAllPoints(geometry: Geometry, attribute: Attribute, attributeData: DracoUInt8Array): void;

            public GetAttributeUInt16ForAllPoints(geometry: Geometry, attribute: Attribute, attributeData: DracoUInt16Array): void;

            public GetAttributeUInt32ForAllPoints(geometry: Geometry, attribute: Attribute, attributeData: DracoUInt32Array): void;

            public GetAttributeFloatForAllPoints(geometry: Geometry, attribute: Attribute, attributeData: DracoFloat32Array): void;
        }

        class Status {
            public ok(): boolean;
            public error_msg(): string;
        }

        enum GeometryType { }
        // See below

        export const TRIANGULAR_MESH: GeometryType;

        export const POINT_CLOUD: GeometryType;

        export class Mesh {
            public ptr: number;

            public num_faces(): number;

            public num_points(): number;
        }

        export class PointCloud {
            public ptr: number;

            public num_points(): number;
        }

        export type Geometry = Mesh | PointCloud;

        enum AttributeType { }
        // See below

        export const POSITION: AttributeType;
        export const NORMAL: AttributeType;
        export const COLOR: AttributeType;
        export const TEX_COORD: AttributeType;

        class Attribute {
            private constructor();
            public num_components(): number;
        }

        export class DracoInt8Array {
            public size(): number;
            public GetValue(index: number): number;
        }

        export class DracoInt16Array {
            public size(): number;
            public GetValue(index: number): number;
        }

        export class DracoInt32Array {
            public size(): number;
            public GetValue(index: number): number;
        }

        export class DracoUInt8Array {
            public size(): number;
            public GetValue(index: number): number;
        }

        export class DracoUInt16Array {
            public size(): number;
            public GetValue(index: number): number;
        }

        export class DracoUInt32Array {
            public size(): number;
            public GetValue(index: number): number;
        }

        export class DracoFloat32Array {
            public size(): number;
            public GetValue(index: number): number;
        }
    }
}
