/**
 * Asset loader interfaces
 * 资产加载器接口
 */

import {
    AssetType,
    AssetGUID,
    IAssetLoadOptions,
    IAssetMetadata
} from '../types/AssetTypes';
import type { IAssetContent, AssetContentType } from './IAssetReader';

/**
 * Parse context provided to loaders.
 * 提供给加载器的解析上下文。
 */
export interface IAssetParseContext {
    /** Asset metadata. | 资产元数据。 */
    metadata: IAssetMetadata;
    /** Load options. | 加载选项。 */
    options?: IAssetLoadOptions;
    /**
     * Load a dependency asset by relative path.
     * 通过相对路径加载依赖资产。
     */
    loadDependency<D = unknown>(relativePath: string): Promise<D>;
}

/**
 * Asset loader interface.
 * 资产加载器接口。
 *
 * Loaders only parse content, file reading is handled by AssetManager.
 * 加载器只负责解析内容，文件读取由 AssetManager 处理。
 */
export interface IAssetLoader<T = unknown> {
    /** Supported asset type. | 支持的资产类型。 */
    readonly supportedType: AssetType;

    /** Supported file extensions. | 支持的文件扩展名。 */
    readonly supportedExtensions: string[];

    /**
     * Required content type for this loader.
     * 此加载器需要的内容类型。
     *
     * - 'text': For JSON, shader, material files
     * - 'binary': For binary formats
     * - 'image': For textures
     * - 'audio': For audio files
     */
    readonly contentType: AssetContentType;

    /**
     * Parse asset from content.
     * 从内容解析资产。
     *
     * @param content - File content. | 文件内容。
     * @param context - Parse context. | 解析上下文。
     * @returns Parsed asset. | 解析后的资产。
     */
    parse(content: IAssetContent, context: IAssetParseContext): Promise<T>;

    /**
     * Dispose loaded asset and free resources.
     * 释放已加载的资产。
     */
    dispose(asset: T): void;
}

/**
 * Asset loader factory interface
 * 资产加载器工厂接口
 */
export interface IAssetLoaderFactory {
    /**
     * Create loader for specific asset type
     * 为特定资产类型创建加载器
     */
    createLoader(type: AssetType): IAssetLoader | null;

    /**
     * Create loader for a specific file path (selects by extension)
     * 为特定文件路径创建加载器（按扩展名选择）
     *
     * This method is preferred over createLoader() when multiple loaders
     * support the same asset type (e.g., Model3D with GLTF/OBJ/FBX).
     * 当多个加载器支持相同资产类型时（如 Model3D 的 GLTF/OBJ/FBX），
     * 优先使用此方法而非 createLoader()。
     */
    createLoaderForPath(path: string): IAssetLoader | null;

    /**
     * Register custom loader
     * 注册自定义加载器
     */
    registerLoader(type: AssetType, loader: IAssetLoader): void;

    /**
     * Register a loader for a specific file extension
     * 为特定文件扩展名注册加载器
     */
    registerExtensionLoader(extension: string, loader: IAssetLoader): void;

    /**
     * Unregister loader
     * 注销加载器
     */
    unregisterLoader(type: AssetType): void;

    /**
     * Check if loader exists for type
     * 检查类型是否有加载器
     */
    hasLoader(type: AssetType): boolean;

    /**
     * Get asset type by file extension
     * 根据文件扩展名获取资产类型
     */
    getAssetTypeByExtension(extension: string): AssetType | null;

    /**
     * Get asset type by file path
     * 根据文件路径获取资产类型
     */
    getAssetTypeByPath(path: string): AssetType | null;

    /**
     * Get all supported file extensions from all registered loaders.
     * 获取所有注册加载器支持的文件扩展名。
     *
     * @returns Array of extension patterns (e.g., ['*.png', '*.jpg', '*.particle'])
     */
    getAllSupportedExtensions(): string[];

    /**
     * Get extension to type mapping for all registered loaders.
     * 获取所有注册加载器的扩展名到类型的映射。
     *
     * @returns Map of extension (without dot) to asset type string
     */
    getExtensionTypeMap(): Record<string, string>;
}

/**
 * Texture asset interface
 * 纹理资产接口
 */
export interface ITextureAsset {
    /** WebGL纹理ID / WebGL texture ID */
    textureId: number;
    /** 宽度 / Width */
    width: number;
    /** 高度 / Height */
    height: number;
    /** 格式 / Format */
    format: 'rgba' | 'rgb' | 'alpha';
    /** 是否有Mipmap / Has mipmaps */
    hasMipmaps: boolean;
    /** 原始数据（如果可用） / Raw image data if available */
    data?: ImageData | HTMLImageElement;

    // ===== Sprite Settings =====
    // ===== Sprite 设置 =====

    /**
     * 九宫格切片边距 [top, right, bottom, left]
     * Nine-patch slice border
     *
     * Defines the non-stretchable borders for nine-patch rendering.
     * 定义九宫格渲染时不可拉伸的边框区域。
     */
    sliceBorder?: [number, number, number, number];

    /**
     * Sprite 锚点 [x, y]（0-1 归一化）
     * Sprite pivot point (0-1 normalized)
     */
    pivot?: [number, number];
}

/**
 * Mesh asset interface
 * 网格资产接口
 */
export interface IMeshAsset {
    /** 顶点数据 / Vertex data */
    vertices: Float32Array;
    /** 索引数据 / Index data */
    indices: Uint16Array | Uint32Array;
    /** 法线数据 / Normal data */
    normals?: Float32Array;
    /** UV坐标 / UV coordinates */
    uvs?: Float32Array;
    /** 切线数据 / Tangent data */
    tangents?: Float32Array;
    /** 边界盒 / Axis-aligned bounding box */
    bounds: {
        min: [number, number, number];
        max: [number, number, number];
    };
}

/**
 * Audio asset interface
 * 音频资产接口
 */
export interface IAudioAsset {
    /** 音频缓冲区 / Audio buffer */
    buffer: AudioBuffer;
    /** 时长（秒） / Duration in seconds */
    duration: number;
    /** 采样率 / Sample rate */
    sampleRate: number;
    /** 声道数 / Number of channels */
    channels: number;
}

/**
 * Shader property type
 * 着色器属性类型
 */
export type ShaderPropertyType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'int' | 'sampler2D' | 'mat3' | 'mat4';

/**
 * Shader property definition
 * 着色器属性定义
 */
export interface IShaderProperty {
    /** 属性名称（uniform 名） / Property name (uniform name) */
    name: string;
    /** 属性类型 / Property type */
    type: ShaderPropertyType;
    /** 默认值 / Default value */
    default: number | number[];
    /** 显示名称（编辑器用） / Display name for editor */
    displayName?: string;
    /** 值范围（用于 float/int） / Value range for float/int */
    range?: [number, number];
    /** 是否隐藏（内部使用） / Hidden from inspector */
    hidden?: boolean;
}

/**
 * Shader asset interface
 * 着色器资产接口
 *
 * Shader assets contain GLSL source code and property definitions.
 * 着色器资产包含 GLSL 源代码和属性定义。
 */
export interface IShaderAsset {
    /** 着色器名称 / Shader name (e.g., "UI/Shiny") */
    name: string;
    /** 顶点着色器源代码 / Vertex shader GLSL source */
    vertex: string;
    /** 片段着色器源代码 / Fragment shader GLSL source */
    fragment: string;
    /** 属性定义列表 / Property definitions */
    properties: IShaderProperty[];
    /** 编译后的着色器 ID（运行时填充） / Compiled shader ID (runtime) */
    shaderId?: number;
}

/**
 * Material property value
 * 材质属性值
 */
export type MaterialPropertyValue = number | number[] | string;

/**
 * Material animator configuration
 * 材质动画器配置
 */
export interface IMaterialAnimator {
    /** 要动画的属性名 / Property to animate */
    property: string;
    /** 起始值 / Start value */
    from: number;
    /** 结束值 / End value */
    to: number;
    /** 持续时间（秒） / Duration in seconds */
    duration: number;
    /** 是否循环 / Loop animation */
    loop?: boolean;
    /** 循环间隔（秒） / Delay between loops */
    loopDelay?: number;
    /** 缓动函数 / Easing function */
    easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
    /** 是否自动播放 / Auto play on start */
    autoPlay?: boolean;
}

/**
 * Material asset interface
 * 材质资产接口
 *
 * Material assets reference a shader and define property values.
 * 材质资产引用着色器并定义属性值。
 */
export interface IMaterialAsset {
    /** 材质名称 / Material name */
    name: string;
    /** 着色器 GUID 或内置路径 / Shader GUID or built-in path (e.g., "builtin://shaders/Shiny") */
    shader: string;
    /** 材质属性值 / Material property values */
    properties: Record<string, MaterialPropertyValue>;
    /** 纹理映射 / Texture slot mappings (property name -> texture GUID) */
    textures?: Record<string, AssetGUID>;
    /** 渲染状态 / Render states */
    renderStates?: {
        cullMode?: 'none' | 'front' | 'back';
        blendMode?: 'none' | 'alpha' | 'additive' | 'multiply' | 'screen';
        depthTest?: boolean;
        depthWrite?: boolean;
    };
    /** 动画器配置（可选） / Animator configuration (optional) */
    animator?: IMaterialAnimator;
    /** 运行时：编译后的着色器 ID / Runtime: compiled shader ID */
    _shaderId?: number;
    /** 运行时：引擎材质 ID / Runtime: engine material ID */
    _materialId?: number;
}

// 预制体资产接口从专用文件导出 | Prefab asset interface exported from dedicated file
export type { IPrefabAsset, IPrefabData, IPrefabMetadata, IPrefabService } from './IPrefabAsset';

/**
 * Scene asset interface
 * 场景资产接口
 */
export interface ISceneAsset {
    /** 场景名称 / Scene name */
    name: string;
    /** 实体列表 / Serialized entity list */
    entities: unknown[];
    /** 场景设置 / Scene settings */
    settings: {
        /** 环境光 / Ambient light */
        ambientLight?: [number, number, number];
        /** 雾效 / Fog settings */
        fog?: {
            enabled: boolean;
            color: [number, number, number];
            density: number;
        };
        /** 天空盒 / Skybox asset */
        skybox?: AssetGUID;
    };
    /** 引用的资产 / All referenced assets */
    referencedAssets: AssetGUID[];
}

/**
 * JSON asset interface
 * JSON资产接口
 */
export interface IJsonAsset {
    /** JSON数据 / JSON data */
    data: unknown;
}

/**
 * Text asset interface
 * 文本资产接口
 */
export interface ITextAsset {
    /** 文本内容 / Text content */
    content: string;
    /** 编码格式 / Encoding */
    encoding: 'utf8' | 'utf16' | 'ascii';
}

/**
 * Binary asset interface
 * 二进制资产接口
 */
export interface IBinaryAsset {
    /** 二进制数据 / Binary data */
    data: ArrayBuffer;
    /** MIME类型 / MIME type */
    mimeType?: string;
}

// ===== GLTF/GLB 3D Model Types =====
// ===== GLTF/GLB 3D 模型类型 =====

/**
 * Bounding box interface
 * 边界盒接口
 */
export interface IBoundingBox {
    /** 最小坐标 [x, y, z] | Minimum coordinates */
    min: [number, number, number];
    /** 最大坐标 [x, y, z] | Maximum coordinates */
    max: [number, number, number];
}

/**
 * Extended mesh data with name and material reference
 * 扩展的网格数据，包含名称和材质引用
 */
export interface IMeshData extends IMeshAsset {
    /** 网格名称 | Mesh name */
    name: string;
    /** 引用的材质索引 | Referenced material index */
    materialIndex: number;
    /** 顶点颜色（如果有）| Vertex colors if available */
    colors?: Float32Array;

    // ===== Skinning data for skeletal animation =====
    // ===== 骨骼动画蒙皮数据 =====

    /**
     * Joint indices per vertex (4 influences, GLTF JOINTS_0)
     * 每顶点的关节索引（4 个影响，GLTF JOINTS_0）
     * Format: [j0, j1, j2, j3] for each vertex
     */
    joints?: Uint8Array | Uint16Array;

    /**
     * Joint weights per vertex (4 influences, GLTF WEIGHTS_0)
     * 每顶点的关节权重（4 个影响，GLTF WEIGHTS_0）
     * Format: [w0, w1, w2, w3] for each vertex, should sum to 1.0
     */
    weights?: Float32Array;
}

/**
 * GLTF material definition
 * GLTF 材质定义
 */
export interface IGLTFMaterial {
    /** 材质名称 | Material name */
    name: string;
    /** 基础颜色 [r, g, b, a] | Base color factor */
    baseColorFactor: [number, number, number, number];
    /** 基础颜色纹理索引 | Base color texture index (-1 if none) */
    baseColorTextureIndex: number;
    /** 金属度 (0-1) | Metallic factor */
    metallicFactor: number;
    /** 粗糙度 (0-1) | Roughness factor */
    roughnessFactor: number;
    /** 金属粗糙度纹理索引 | Metallic-roughness texture index */
    metallicRoughnessTextureIndex: number;
    /** 法线纹理索引 | Normal texture index */
    normalTextureIndex: number;
    /** 法线缩放 | Normal scale */
    normalScale: number;
    /** 遮挡纹理索引 | Occlusion texture index */
    occlusionTextureIndex: number;
    /** 遮挡强度 | Occlusion strength */
    occlusionStrength: number;
    /** 自发光因子 [r, g, b] | Emissive factor */
    emissiveFactor: [number, number, number];
    /** 自发光纹理索引 | Emissive texture index */
    emissiveTextureIndex: number;
    /** Alpha 模式 | Alpha mode */
    alphaMode: 'OPAQUE' | 'MASK' | 'BLEND';
    /** Alpha 剔除阈值 | Alpha cutoff */
    alphaCutoff: number;
    /** 是否双面 | Double sided */
    doubleSided: boolean;
}

/**
 * GLTF texture info
 * GLTF 纹理信息
 */
export interface IGLTFTextureInfo {
    /** 纹理名称 | Texture name */
    name?: string;
    /** 图像数据（嵌入式）| Image data (embedded) */
    imageData?: ArrayBuffer;
    /** 图像 MIME 类型 | Image MIME type */
    mimeType?: string;
    /** 外部 URI（非嵌入）| External URI (non-embedded) */
    uri?: string;
    /** 加载后的纹理资产 GUID | Loaded texture asset GUID */
    textureGuid?: AssetGUID;
}

/**
 * GLTF node (scene hierarchy)
 * GLTF 节点（场景层级）
 */
export interface IGLTFNode {
    /** 节点名称 | Node name */
    name: string;
    /** 网格索引（可选）| Mesh index (optional) */
    meshIndex?: number;
    /** 子节点索引列表 | Child node indices */
    children: number[];
    /** 变换信息 | Transform info */
    transform: {
        /** 位置 [x, y, z] | Position */
        position: [number, number, number];
        /** 旋转四元数 [x, y, z, w] | Rotation quaternion */
        rotation: [number, number, number, number];
        /** 缩放 [x, y, z] | Scale */
        scale: [number, number, number];
    };
}

/**
 * Animation channel target
 * 动画通道目标
 */
export interface IAnimationChannelTarget {
    /** 目标节点索引 | Target node index */
    nodeIndex: number;
    /** 目标属性 | Target property */
    path: 'translation' | 'rotation' | 'scale' | 'weights';
}

/**
 * Animation sampler
 * 动画采样器
 */
export interface IAnimationSampler {
    /** 输入时间数组 | Input time array */
    input: Float32Array;
    /** 输出值数组 | Output values array */
    output: Float32Array;
    /** 插值类型 | Interpolation type */
    interpolation: 'LINEAR' | 'STEP' | 'CUBICSPLINE';
}

/**
 * Animation channel
 * 动画通道
 */
export interface IAnimationChannel {
    /** 采样器索引 | Sampler index */
    samplerIndex: number;
    /** 目标 | Target */
    target: IAnimationChannelTarget;
}

/**
 * Animation clip from GLTF
 * GLTF 动画片段
 */
export interface IGLTFAnimationClip {
    /** 动画名称 | Animation name */
    name: string;
    /** 动画时长（秒）| Duration in seconds */
    duration: number;
    /** 采样器列表 | Sampler list */
    samplers: IAnimationSampler[];
    /** 通道列表 | Channel list */
    channels: IAnimationChannel[];
}

/**
 * Skeleton joint
 * 骨骼关节
 */
export interface ISkeletonJoint {
    /** 关节名称 | Joint name */
    name: string;
    /** 节点索引 | Node index */
    nodeIndex: number;
    /** 父关节索引（-1 表示根）| Parent joint index (-1 for root) */
    parentIndex: number;
    /** 逆绑定矩阵 (4x4) | Inverse bind matrix */
    inverseBindMatrix: Float32Array;
}

/**
 * Skeleton data
 * 骨骼数据
 */
export interface ISkeletonData {
    /** 关节列表 | Joint list */
    joints: ISkeletonJoint[];
    /** 根关节索引 | Root joint index */
    rootJointIndex: number;
}

/**
 * GLTF/GLB 3D model asset interface
 * GLTF/GLB 3D 模型资产接口
 */
export interface IGLTFAsset {
    /** 模型名称 | Model name */
    name: string;

    /** 网格数据列表 | Mesh data list */
    meshes: IMeshData[];

    /** 材质列表 | Material list */
    materials: IGLTFMaterial[];

    /** 纹理信息列表 | Texture info list */
    textures: IGLTFTextureInfo[];

    /** 场景层级节点 | Scene hierarchy nodes */
    nodes: IGLTFNode[];

    /** 根节点索引列表 | Root node indices */
    rootNodes: number[];

    /** 动画片段列表（可选）| Animation clips (optional) */
    animations?: IGLTFAnimationClip[];

    /** 骨骼数据（可选）| Skeleton data (optional) */
    skeleton?: ISkeletonData;

    /** 整体边界盒 | Overall bounding box */
    bounds: IBoundingBox;

    /** 源文件路径 | Source file path */
    sourcePath?: string;
}
