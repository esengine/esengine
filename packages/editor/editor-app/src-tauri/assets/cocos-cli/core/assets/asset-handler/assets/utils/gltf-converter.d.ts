import * as DataURI from '@cocos/data-uri';
import * as cc from 'cc';
import { Quat, Vec3, Constructor } from 'cc';
import { Animation, BufferView, GlTf, Image, Material, Mesh, Node, Scene, Skin, Texture } from '../../../@types/glTF';
import { GlTFUserData } from '../../../@types/userDatas';
import { NormalImportSetting, TangentImportSetting } from '../../../@types/interface';
import { PPGeometry } from './pp-geometry';
import { TextureBaseAssetUserData } from '../../../@types/userDatas';
export interface GltfImagePathInfo {
    isDataUri: boolean;
    fullPath: string;
}
export interface GltfImageDataURIInfo {
    isDataUri: boolean;
    dataURI: DataURI.DataURI;
}
export type GltfImageUriInfo = GltfImagePathInfo | GltfImageDataURIInfo;
export declare function isFilesystemPath(uriInfo: GltfImageUriInfo): uriInfo is GltfImagePathInfo;
export type GltfAssetFinderKind = 'meshes' | 'animations' | 'skeletons' | 'textures' | 'materials';
export interface IGltfAssetFinder {
    find<T extends cc.Asset>(kind: GltfAssetFinderKind, index: number, type: Constructor<T>): T | null;
}
export type AssetLoader = (uuid: string) => cc.Asset;
export type GltfSubAsset = Node | Mesh | Texture | Skin | Animation | Image | Material | Scene;
export declare function getPathFromRoot(target: cc.Node | null, root: cc.Node): string;
export declare function getWorldTransformUntilRoot(target: cc.Node, root: cc.Node, outPos: Vec3, outRot: Quat, outScale: Vec3): void;
export interface IMeshOptions {
    normals: NormalImportSetting;
    tangents: TangentImportSetting;
}
export interface IGltfSemantic {
    name: string;
    baseType: number;
    type: string;
}
export declare function doCreateSocket(sceneNode: cc.Node, out: cc.Socket[], model: cc.Node): void;
interface IProcessedMesh {
    geometries: PPGeometry[];
    materialIndices: number[];
    jointMaps: number[][];
    minPosition: Vec3;
    maxPosition: Vec3;
}
export declare class GltfConverter {
    private _gltf;
    private _buffers;
    private _gltfFilePath;
    get gltf(): GlTf;
    get path(): string;
    get processedMeshes(): IProcessedMesh[];
    get fbxMissingImagesId(): number[];
    private static _defaultLogger;
    private _promotedRootNodes;
    private _nodePathTable;
    /**
     * The parent index of each node.
     */
    private _parents;
    /**
     * The root node of each skin.
     */
    private _skinRoots;
    private _logger;
    private _processedMeshes;
    private _socketMappings;
    private _fbxMissingImagesId;
    constructor(_gltf: GlTf, _buffers: Buffer[], _gltfFilePath: string, options?: GltfConverter.Options);
    createMesh(iGltfMesh: number, bGenerateLightmapUV?: boolean, bAddVertexColor?: boolean): any;
    createSkeleton(iGltfSkin: number, sortMap?: number[]): any;
    getAnimationDuration(iGltfAnimation: number): number;
    createAnimation(iGltfAnimation: number): any;
    createMaterial(iGltfMaterial: number, gltfAssetFinder: IGltfAssetFinder, effectGetter: (name: string) => cc.EffectAsset, options: {
        useVertexColors?: boolean;
        depthWriteInAlphaModeBlend?: boolean;
        smartMaterialEnabled?: boolean;
    }): any;
    getTextureParameters(gltfTexture: Texture, userData: TextureBaseAssetUserData): void;
    createScene(iGltfScene: number, gltfAssetFinder: IGltfAssetFinder, withTransform?: boolean): cc.Node;
    createSockets(sceneNode: cc.Node): cc.Socket[];
    readImageInBufferView(bufferView: BufferView): Buffer<ArrayBufferLike>;
    private _warnIfExtensionNotSupported;
    private _promoteSingleRootNodes;
    private _getNodeRotation;
    private _gltfChannelToCurveData;
    private _glTFWeightChannelToTracks;
    private _getParent;
    private _getRootParent;
    private _commonRoot;
    private _getSkinRoot;
    private _readPrimitive;
    private _decodeDracoGeometry;
    private _readBounds;
    private _applySettings;
    private _readBufferView;
    private _readAccessorIntoArray;
    private _readAccessorIntoArrayAndNormalizeAsFloat;
    private _getSceneNode;
    private _createEmptyNodeRecursive;
    private _setupNode;
    private _createEmptyNode;
    private _readNodeMatrix;
    private _getNodePath;
    private _isAncestorOf;
    private _mapToSocketPath;
    private _createNodePathTable;
    /**
     * Note, if `bufferView` property is not defined, this method will do nothing.
     * So you should ensure that the data area of `outputBuffer` is filled with `0`s.
     * @param gltfAccessor
     * @param outputBuffer
     * @param outputStride
     */
    private _readAccessor;
    private _applyDeviation;
    private _getPrimitiveMode;
    private _getAttributeBaseTypeStorage;
    private _getComponentsPerAttribute;
    private _getBytesPerComponent;
    private _getComponentReader;
    private _getComponentWriter;
    private _getGltfXXName;
    /**
     * Normalize a number array if max value is greater than 1,returns the max value and the normalized array.
     * @param orgArray
     * @private
     */
    private _normalizeArrayToCocosColor;
    private _convertAdskPhysicalMaterial;
    private _convertMaxPhysicalMaterial;
    private _convertMayaStandardSurface;
    private _convertPhongMaterial;
    private _convertBlenderPBRMaterial;
    private _convertGltfPbrSpecularGlossiness;
    private _khrTextureTransformToTiling;
}
export declare namespace GltfConverter {
    interface Options {
        logger?: Logger;
        userData?: Omit<GlTFUserData, 'imageMetas'>;
        promoteSingleRootNode?: boolean;
        generateLightmapUVNode?: boolean;
    }
    type Logger = <ErrorType extends ConverterError>(level: LogLevel, error: ErrorType, args: ConverterErrorArgumentFormat[ErrorType]) => void;
    enum LogLevel {
        Info = 0,
        Warning = 1,
        Error = 2,
        Debug = 3
    }
    enum ConverterError {
        /**
         * glTf requires that skin joints must exists in same scene as node references it.
         */
        ReferenceSkinInDifferentScene = 0,
        /**
         * Specified alpha mode is not supported currently.
         */
        UnsupportedAlphaMode = 1,
        /**
         * Unsupported texture parameter.
         */
        UnsupportedTextureParameter = 2,
        /**
         * Unsupported channel path.
         */
        UnsupportedChannelPath = 3,
        DisallowCubicSplineChannelSplit = 4,
        FailedToCalculateTangents = 5,
        /**
         * All targets of the specified sub-mesh are zero-displaced.
         */
        EmptyMorph = 6,
        UnsupportedExtension = 7
    }
    interface ConverterErrorArgumentFormat {
        [ConverterError.UnsupportedExtension]: {
            name: string;
            required?: boolean;
        };
        [ConverterError.ReferenceSkinInDifferentScene]: {
            skin: number;
            node: number;
        };
        [ConverterError.UnsupportedAlphaMode]: {
            mode: string;
            material: number;
        };
        [ConverterError.UnsupportedTextureParameter]: {
            type: 'minFilter' | 'magFilter' | 'wrapMode';
            value: number;
            fallback?: number;
            texture: number;
            sampler: number;
        };
        [ConverterError.UnsupportedChannelPath]: {
            channel: number;
            animation: number;
            path: string;
        };
        [ConverterError.DisallowCubicSplineChannelSplit]: {
            channel: number;
            animation: number;
        };
        [ConverterError.FailedToCalculateTangents]: {
            reason: 'normal' | 'uv';
            primitive: number;
            mesh: number;
        };
        [ConverterError.EmptyMorph]: {
            mesh: number;
            primitive: number;
        };
    }
}
interface ParsedAndBufferResolvedGlTf {
    /**
     * The parsed glTF document.
     */
    glTF: GlTf;
    /**
     * Buffers of this glTF referenced.
     */
    buffers: ResolvedBuffer[];
}
/**
 * Either buffer itself or full path to external buffer file.
 */
type ResolvedBuffer = string | Buffer;
export declare function readGltf(gltfFilePath: string): Promise<ParsedAndBufferResolvedGlTf>;
export declare function isDataUri(uri: string): boolean;
export declare class BufferBlob {
    private _arrayBufferOrPaddings;
    private _length;
    setNextAlignment(align: number): void;
    addBuffer(arrayBuffer: ArrayBuffer | Uint8Array): number;
    getLength(): number;
    getCombined(): Uint8Array<ArrayBuffer>;
}
export declare class GlTfConformanceError extends Error {
}
export {};
