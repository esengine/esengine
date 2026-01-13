import { NormalImportSetting, TangentImportSetting } from './interface';
// 这个文件用于记录导入器的各种类型定义，导出声明文件的时候将导出这个配置文件
export type ImageImportType = 'raw' | 'texture' | 'normal map' | 'sprite-frame' | 'texture cube';

/** 图片资源的 userData  */
export interface ImageAssetUserData {
    /** 图片类型 */
    type: ImageImportType;
    /** 垂直翻转 */
    flipVertical?: boolean;
    /** 消除透明伪影 */
    fixAlphaTransparencyArtifacts?: boolean;
    /** 是否为 RGBE */
    isRGBE?: boolean;
    /** 这个图片是不是拥有 alpha 通道 */
    hasAlpha?: boolean;
    /** 重定向的 uuid，ImageAsset 在编辑器内已隐藏，相关交互操作需要通过此参数重定向操作目标*/
    redirect?: string;
    visible?: boolean;
    /** 是否翻转绿通道 */
    flipGreenChannel?: boolean;

    /**
     * 部分资源导入后可能产生多张图像资源
     */
    sign?: string;
    alpha?: string;
}

export interface SpriteFrameAssetUserData extends SpriteFrameBaseAssetUserData {
    isUuid?: boolean;
    imageUuidOrDatabaseUri: string;
}

export interface SpriteFrameBaseAssetUserData {
    trimType?: string;
    trimThreshold: number;
    rotated: boolean;
    offsetX: number;
    offsetY: number;
    trimX: number;
    trimY: number;
    width: number;
    height: number;
    rawWidth: number;
    rawHeight: number;
    borderTop: number;
    borderBottom: number;
    borderLeft: number;
    borderRight: number;
    packable?: boolean;
    pixelsToUnit: number;
    pivotX: number;
    pivotY: number;
    meshType: number;
    vertices: SpriteFrameVertices;
}

export interface Texture2DAssetUserData extends TextureBaseAssetUserData {
    isUuid?: boolean;
    imageUuidOrDatabaseUri?: string;
}

export type WrapMode = 'repeat' | 'clamp-to-edge' | 'mirrored-repeat';

export type Filter = 'none' | 'nearest' | 'linear';

export interface TextureBaseAssetUserData {
    wrapModeS: WrapMode;
    wrapModeT: WrapMode;
    minfilter: Filter;
    magfilter: Filter;
    mipfilter: Filter;
    anisotropy: number;
}

export interface TextureCubeAssetUserData extends TextureBaseAssetUserData {
    imageDatabaseUri?: string;
    isRGBE: boolean;

    mipBakeMode: number;
    /**
     * `0` 意味着默认。见 https://github.com/cocos-creator/3d-tasks/issues/2253
     */
    faceSize?: number;
    // 符号资源 uuid
    sign?: string;

    // 六个面的 UUID
    front?: string;
    back?: string;
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
}

export interface SpriteFrameVertices {
    rawPosition: number[];
    indexes: number[];
    uv: number[];
    nuv: number[];
    triangles?: number[];
    minPos: number[];
    maxPos: number[];
}

export type ImageImportType = 'raw' | 'texture' | 'normal map' | 'sprite-frame' | 'texture cube';

/** 图片资源的 userData  */
export interface ImageAssetUserData {
    /** 图片类型 */
    type: ImageImportType;
    /** 垂直翻转 */
    flipVertical?: boolean;
    /** 消除透明伪影 */
    fixAlphaTransparencyArtifacts?: boolean;
    /** 是否为 RGBE */
    isRGBE?: boolean;
    /** 这个图片是不是拥有 alpha 通道 */
    hasAlpha?: boolean;
    /** 重定向的 uuid */
    redirect?: string;
    visible?: boolean;
    /** 是否翻转绿通道 */
    flipGreenChannel?: boolean;

    /**
     * 部分资源导入后可能产生多张图像资源
     */
    sign?: string;
    alpha?: string;
}
/** 动画剪辑资源的 userData */
export interface AnimationClipAssetUserData {
    /** 动画名称 */
    name: string;
}

/** 自动图集资源的 userData */
export interface AutoAtlasAssetUserData {
    compressed: boolean;
    dest: any;
    /** 打包图像的尺寸 */
    maxWidth: number;
    maxHeight: number;
    /** 图像的边距 */
    padding: number;
    allowRotation: boolean;
    forceSquared: boolean;
    powerOfTwo: boolean;
    algorithm: string;
    format: string;
    quality: number;
    contourBleed: boolean;
    paddingBleed: boolean;
    filterUnused: boolean;
    removeTextureInBundle: boolean;
    removeImageInBundle: boolean;
    removeSpriteAtlasInBundle: boolean;
    platformSettings: any;
    textureSetting: any;
}

/** 标签图集资源的 userData */
export interface LabelAtlasAssetUserData {
    itemWidth: number;
    itemHeight: number;
    startChar: string;
    fontSize: number;
    spriteFrameUuid: string;
    _fntConfig: FntData;
}
export interface FntData {
    commonHeight?: number;
    fontSize?: number;
    atlasName?: string;
    fontDefDictionary?: FontDefDictionary;
    kerningDict?: KerningDict;
}

export interface FontDefDictionary {
    [charId: number]: FontDef;
}
export interface FontDef {
    rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    xOffset: number;
    yOffset: number;
    xAdvance: number;
}
export interface KerningDict {
    [key: number]: number;
}
/** 渲染纹理资源的 userData */
export interface RenderTextureAssetUserData extends TextureBaseAssetUserData {
    width: number;
    height: number;
}

/** 文件夹资源的 userData */
export interface DirectoryAssetUserData {
    /** 是否是资源包 */
    isBundle?: boolean;
    /** 资源包配置 ID */
    bundleConfigID?: string;
    /** 资源包名称 */
    bundleName?: string;
    /** 优先级 */
    priority?: number;
}

/** Spine 资源的 userData */
export interface SpineAssetUserData {
    /** 图集资源的 UUID */
    atlasUuid: string;
}

/** JavaScript 脚本模块的 userData */
export interface ScriptModuleUserData {
    isPlugin: false;
}

/** JavaScript 插件脚本的 userData */
export interface PluginScriptUserData {
    isPlugin: true;
    /** 界面没有开放给用户。默认开启 */
    experimentalHideCommonJs?: boolean;
    /** 界面没有开放给用户。默认开启 */
    experimentalHideAmd?: boolean;
    /** 仅当 executionScope 为 enclosed 时有效。指定了要模拟的全局变量 */
    simulateGlobals?: string[];
    /** 执行作用域 */
    executionScope?: 'enclosed' | 'global';
    /** 插件执行时机 */
    loadPluginInEditor?: boolean;
    loadPluginInWeb?: boolean;
    loadPluginInMiniGame?: boolean;
    loadPluginInNative?: boolean;
}

/** JavaScript 资源的 userData */
export type JavaScriptAssetUserData = ScriptModuleUserData | PluginScriptUserData;

/** glTF 动画资源的 userData */
export interface GltfAnimationAssetUserData {
    gltfIndex: number;
    events: Array<{
        frame: number;
        func: string;
        params: string[];
    }>;
    editorExtras?: unknown;
    embeddedPlayers?: Array<{
        editorExtras?: unknown;
        begin: number;
        end: number;
        reconciledSpeed: boolean;
        playable:
        | {
            type: 'animation-clip';
            path: string;
            clip: string;
        }
        | {
            type: 'particle-system';
            path: string;
        };
    }>;
    auxiliaryCurves?: Record<string, { curve: any }>;
    wrapMode: number;
    speed?: number;
    sample?: number;
    span?: {
        from: number;
        to: number;
    };
    additive?: any;
}

/** JSON 资源的 userData */
export interface JsonAssetUserData {
    /** 是否启用 JSON5 解析 */
    json5?: boolean;
}

/** 场景/预制体资源的 userData */
export interface PrefabAssetUserData {
    /** 是否为持久节点 */
    persistent?: boolean;
    /** 同步节点名称 */
    syncNodeName?: string;
}

/** Effect 着色器资源的 userData */
export interface EffectAssetUserData {
    /** 预编译组合 */
    combinations?: any;
    /** 编辑器相关数据 */
    editor?: any;
}

/** 音频资源的 userData */
export interface AudioClipAssetUserData {
    /** 下载模式：0-Web Audio, 1-DOM Audio */
    downloadMode: number;
}

/** 位图字体资源的 userData */
export interface BitmapFontAssetUserData {
    /** 字体配置 */
    _fntConfig: any;
    /** 字体大小 */
    fontSize: number;
    /** 纹理 UUID */
    textureUuid: string;
}

/** glTF Skeleton 子资源的 userData */
export interface GltfSkeletonAssetUserData extends IVirtualAssetUserData {
    /** 骨骼数量 */
    jointsLength?: number;
}

/** glTF 嵌入图片子资源的 userData */
export interface GltfEmbededImageAssetUserData extends IVirtualAssetUserData {
    /** 是否修复 Alpha 透明度瑕疵 */
    fixAlphaTransparencyArtifacts?: boolean;
}

/** glTF 虚拟子资源的通用 userData */
export interface IVirtualAssetUserData {
    /** 在 glTF 文件中的索引 */
    gltfIndex?: number;
    /** mesh 资源的面数 */
    triangleCount?: number;
    /** mesh 所在 lod 层级 */
    lodLevel?: number;
    /** 根据 lod 配置自动生成 */
    lodOptions?: {
        /** 自动生成的 mesh 占原 mesh 的百分比 */
        faceCount: number;
    };
    [index: string]: any;
}

/** 精灵图集资源的 userData */
export interface SpriteAtlasAssetUserData {
    /** 图集纹理名称 */
    atlasTextureName: string;
    /** 纹理 UUID */
    textureUuid: string | null;
    /** 精灵帧列表 */
    frames: SpriteFrameAssetUserData[];
    /** 资源 UUID */
    uuid: string;
    /** 格式版本 */
    format: number;
}

/** 渲染纹理精灵帧的 userData */
export interface RtSpriteFrameAssetUserData {
    /** 图片 UUID 或数据库 URI */
    imageUuidOrDatabaseUri: string;
    /** 宽度 */
    width?: number;
    /** 高度 */
    height?: number;
}

/** 粒子资源的 userData */
export interface ParticleAssetUserData {
    totalParticles: number;
    life: number;
    lifeVar: number;
    emissionRate: number;
    duration: number;
    srcBlendFactor: number;
    dstBlendFactor: number;
    startColor: any;
    startColorVar: any;
    endColor: any;
    endColorVar: any;
    startSize: number;
    startSizeVar: number;
    endSize: number;
    endSizeVar: number;
    positionType: number;
    sourcePos: any;
    posVar: any;
    angle: number;
    angleVar: number;
    startSpin: number;
    startSpinVar: number;
    endSpin: number;
    endSpinVar: number;
    emitterMode: number;
    gravity: any;
    speed: number;
    speedVar: number;
    radialAccel: number;
    radialAccelVar: number;
    tangentialAccel: number;
    tangentialAccelVar: number;
    rotationIsDir: boolean;
    startRadius: number;
    startRadiusVar: number;
    endRadius: number;
    endRadiusVar: number;
    rotatePerS: number;
    rotatePerSVar: number;
    spriteFrameUuid: string;
}

export interface AnimationImportSetting {
    /**
     * glTf 中原始动画资源的名称。
     */
    name: string;

    /**
     * 原始动画的长度，单位为秒。
     */
    duration: number;

    /**
     * 用户查看、切割原始动画时的 FPS 设定。
     */
    fps: number;

    /**
     * 对原始动画的划分，由用户配置。
     * 若此资源存在，所有划分出的动画成为 glTf 资源下的独立动画并将被导出；
     * 否则，直接导入原始动画资源。
     */
    splits: Array<{
        /**
         * 以前的 ID。如果存在，优先使用这个 ID 来创建子资源，以防止改名后 UUID 变化。
         */
        previousId?: string;

        /**
         * 划分出的动画的名称。
         */
        name: string;

        /**
         * 划分的起始时刻，单位为秒。
         */
        from: number;

        /**
         * 划分的终止时刻，单位为秒。
         */
        to: number;

        /**
         * 用户查看划分出的子动画时的 FPS 设定。
         */
        fps?: number;

        /**
         * 速度。
         */
        speed?: number;

        /**
         * 动画循环模式。
         */
        wrapMode?: number;

        /**
         * 额外的动画辅助曲线信息。
         */
        auxiliaryCurves?: Record<
            string,
            {
                /**
                 * 序列化后的曲线。
                 */
                curve: unknown;
            }
        >;

        /**
         * 加性动画导入设置。
         */
        additive?: {
            /**
             * 是否将动画导入为加性动画。
             */
            enabled: boolean;

            /**
             * 参考动画。
             * 若设置，将参考该动画第 0 帧的姿势计算加性动画；
             * 否则，则将参考第动画本身第 0 帧的姿势进行计算。
             */
            refClip?: string;
        };
    }>;
}

export interface ImageMeta {
    /**
     * 图片名字。
     */
    name?: string;

    /**
     * 模型文件中该图片的 URI，可能是以下形式：
     *   - Database URL，这种路径的图片存在项目目录中；
     *   - uuid URI，这种路径的图片已经作为子资源导入，路径代表子资源的 uuid。
     * 如果未定义，表示此图片未指定源或指定的源无法解析。
     */
    uri?: string;

    /**
     * 用户设置的图片对象。
     * 3.8.0 以前使用路径，3.8.0 之后使用 UUID。
     */
    remap?: string;
}

export interface SerializedAssetFinder {
    meshes?: Array<string | null>;
    animations?: Array<string | null>;
    skeletons?: Array<string | null>;
    textures?: Array<string | null>;
    materials?: Array<string | null>;
    scenes?: Array<string | null>;
}

export interface GlTFUserData {
    assetFinder?: SerializedAssetFinder;

    imageMetas: ImageMeta[];

    // Normal import settings
    // @default required
    normals?: NormalImportSetting;

    // Tangent import settings;
    // @default required
    tangents?: TangentImportSetting;

    /**
     * Controls how to import morph normals.
     * @default Exclude.
     */
    morphNormals?: NormalImportSetting.exclude | NormalImportSetting.optional;

    // Whether to extract material assets out of embedded (sub)assets,
    // so that the assets become editable.
    // @default false
    dumpMaterials?: boolean;

    // only for chat avatar
    redirectMaterialMap?: Record<string, string>;

    // The directory to dump the materials.
    // Default to a direct sub-folder prefixed with 'Materials_' under current path.
    materialDumpDir?: string;

    /**
     * Whether to use vertex colors(if valid) in material.
     * @default false
     */
    useVertexColors?: boolean;

    /**
     * Whether to enable depth-write if the material specify the `BLEND` mode.
     * See https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#alpha-coverage
     * @default false
     */
    depthWriteInAlphaModeBlend?: boolean;

    // @default true
    skipValidation?: boolean;

    /**
     * 整个数组由导入器创建。`name` 和 `duration` 也都由导入器写入修改，外部不允许修改。
     * `splits` 是允许用户配置的。
     */
    animationImportSettings?: AnimationImportSetting[];

    /**
     * 是否将所有动画挂载到生成的预制体上。
     * @default false
     */
    mountAllAnimationsOnPrefab?: boolean;

    /**
     * 使用旧的 FBX 导入器。（在非 FBX 导入器上是 `undefined`）
     */
    legacyFbxImporter?: boolean;

    /**
     * 禁用 Mesh 分割，默认勾选
     */
    disableMeshSplit?: boolean;

    /**
     * 允许数据访问。
     */
    allowMeshDataAccess?: boolean;

    /**
     * 是否添加填充顶点色
     * @default false
     */
    addVertexColor?: boolean;

    /**
     * 若开启并且模型场景顶部仅有一个节点，那么以该节点作为根节点转换为 Prefab。
     * 否则，以场景为根节点转换为 Prefab。见 cocos/cocos-engine#11858 。
     */
    promoteSingleRootNode?: boolean;
    /*
     * 若开启则自动生成 Lightmap UV，并将 UV 写入第二个通道（若第二个通道有 UV ， 则该 UV 会被覆盖）
     * 否则，使用默认 UV 。
     */
    generateLightmapUVNode?: boolean;

    /**
     * 关于 FBX 的配置。仅当 `legacyFbxImporter === false` 时有效。
     */
    fbx?: IFbxSetting;

    /**
     * 减面配置
     */
    meshOptimizer?: MeshOptimizerOption;

    /**
     * mesh 优化配置
     */
    meshOptimize?: MeshOptimizeOptions;

    /**
     * 是否开启 mesh 减面
     */
    meshSimplify?: MeshSimplifyOptions;

    /**
     * MeshCluster Options
     */
    meshCluster?: MeshClusterOptions;

    /**
     * Mesh compression options
     */
    meshCompress?: MeshCompressOptions;

    lods?: {
        // 是否开启 LODS
        enable: boolean;
        // fbx 是否自带 LOD
        hasBuiltinLOD: boolean;
        // fbx 各层级 lod 的配置
        options: LODsOption[];
    };
}

export interface LODsOption {
    // 屏占比
    screenRatio: number;
    // 和 lod0 的减面比
    faceCount: number;
}

export interface IVirtualAssetUserData {
    // 依赖的原 mesh 的 gltfIndex
    gltfIndex?: number;
    // mesh 资源的面数
    triangleCount?: number;
    // mesh 所在 lod 层级
    lodLevel?: number;
    // 根据 lod 配置自动生成，lodOptions 属性存在说明需要自动生成
    lodOptions?: {
        // 自动生成的 mesh 占原 mesh 的百分比
        faceCount: number;
    };
    [index: string]: any;
}

export interface MeshOptimizerOption {
    // 是否启用此功能
    enable: boolean;
    // 减面算法，默认 simplify
    algorithm?: 'gltfpack' | 'simplify';
    simplifyOptions?: SimplifyOptions;
    // 已废弃，仅做简单记录
    gltfpackOptions?: GltfpackOptions;
}

export interface MeshSimplifyOptions {
    enable: boolean;
    targetRatio?: number;
    autoErrorRate?: boolean;
    errorRate?: number;
    lockBoundary?: boolean;
}

export interface MeshClusterOptions {
    enable: boolean;
    coneCluster?: boolean;
}

export interface MeshCompressOptions {
    enable: boolean;
    encode?: boolean;
    compress?: boolean;
    quantize?: boolean;
}

/**
 * @deprecated
 */
export type MeshOptimizerOptions = MeshSimplifyOptions;

export interface MeshOptimizeOptions {
    enable: boolean;
    vertexCache?: boolean;
    vertexFetch?: boolean;
    overdraw?: boolean;
}

// 已废弃，仅做简单记录
export type GltfpackOptions = Record<string, any>;

export interface SimplifyOptions {
    // 压缩比例
    targetRatio?: number;
    // 防止破面
    enableSmartLink?: boolean;
    // 误差距离
    agressiveness?: number;
    // 计算迭代次数
    maxIterationCount?: number;
}

interface IFbxSetting {
    /**
     * https://github.com/cocos-creator/FBX-glTF-conv/pull/26
     */
    unitConversion?: 'geometry-level' | 'hierarchy-level' | 'disabled';

    /**
     * 动画烘焙速率。单位为 FPS。
     * 一般来说有以下几种 FPS 选项。
     * - NTSC video 30/60
     * - PAL video 25
     * - Film 24
     * 见 https://knowledge.autodesk.com/support/3ds-max/learn-explore/caas/CloudHelp/cloudhelp/2020/ENU/3DSMax-Reference/files/GUID-92B75FD6-C112-44D6-AB89-DB50D11AE0DE-htm.html 。
     * 为了以后的拓展性，我们目前仅支持用户从这几种选项中选择。
     * @default 24
     */
    animationBakeRate?: 0 | 24 | 25 | 30 | 60;

    /**
     * 在导出动画时，是否优先使用 FBX 内记录的时间范围。
     * @default true
     */
    preferLocalTimeSpan?: boolean;

    /**
     * 是否为导入的材质匹配DCC的光照模型.
     * 在导入时,若此字段为 `undefined` 时,该字段将被初始化为当前配置的"是否开启智能材质转换".
     */
    smartMaterialEnabled?: boolean;

    /**
     * 匹配 DCC 原始模型名称。
     */
    matchMeshNames?: boolean;
}

// 重新导出其他类型定义
export * from './interface';