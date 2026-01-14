import {
    AnimationClipAssetUserData,
    AutoAtlasAssetUserData,
    LabelAtlasAssetUserData,
    RenderTextureAssetUserData,
    DirectoryAssetUserData,
    TextureCubeAssetUserData,
    ImageAssetUserData,
    SpriteFrameAssetUserData,
    Texture2DAssetUserData,
    SpineAssetUserData,
    JavaScriptAssetUserData,
    GltfAnimationAssetUserData,
    ParticleAssetUserData,
    JsonAssetUserData,
    PrefabAssetUserData,
    EffectAssetUserData,
    AudioClipAssetUserData,
    BitmapFontAssetUserData,
    GltfSkeletonAssetUserData,
    GltfEmbededImageAssetUserData,
    IVirtualAssetUserData,
    GlTFUserData,
    SpriteAtlasAssetUserData,
    RtSpriteFrameAssetUserData,
} from './userDatas';
import { ASSET_HANDLER_TYPES, SUPPORT_CREATE_TYPES } from './interface';

// 支持创建的资源类型（引擎类型）
export type ISupportCreateCCType =
    | 'cc.AnimationClip'        // 动画剪辑
    | 'cc.Script'               // 脚本（TypeScript/JavaScript）
    | 'cc.SpriteAtlas'          // 精灵图集（自动图集）
    | 'cc.EffectAsset'          // 着色器效果
    | 'cc.SceneAsset'           // 场景
    | 'cc.Prefab'               // 预制体
    | 'cc.Material'             // 材质
    | 'cc.TextureCube'          // 立方体贴图
    | 'cc.TerrainAsset'         // 地形
    | 'cc.PhysicsMaterial'      // 物理材质
    | 'cc.LabelAtlas'           // 标签图集
    | 'cc.RenderTexture'        // 渲染纹理
    | 'cc.AnimationGraph'       // 动画图
    | 'cc.AnimationMask'        // 动画遮罩
    | 'cc.AnimationGraphVariant'; // 动画图变体


export type IAssetType =
    | ISupportCreateCCType
    | 'cc.Asset'               // 基础资源类型（instantiation-asset）
    | 'cce.Database'           // 数据库资源
    | 'cce.EffectHeader'       // 着色器头文件
    | 'cc.VideoClip'           // 视频剪辑
    | 'cc.TiledMapAsset'       // 瓦片地图
    | 'cc.TTFFont'             // TTF 字体
    | 'cc.Texture2D'           // 2D 纹理
    | 'cc.SpriteFrame'         // 精灵帧（sprite-frame、rt-sprite-frame）
    | 'cc.ImageAsset'          // 图片资源（image、gltf/image、image/alpha、image/sign、texture-cube-face）
    | 'cc.TextAsset'           // 文本资源
    | 'cc.JsonAsset'           // JSON 资源
    | 'cc.AudioClip'           // 音频剪辑
    | 'cc.BitmapFont'          // 位图字体
    | 'cc.BufferAsset'         // 缓冲区资源
    | 'cc.ParticleAsset'       // 粒子资源
    | 'cc.RenderPipeline'     // 渲染管线
    | 'cc.Skeleton'            // 骨骼（gltf/skeleton、instantiation-asset/skeleton）
    | 'cc.Mesh'                // 网格（gltf/mesh、instantiation-asset/mesh）
    | 'sp.SkeletonData'        // Spine 骨骼数据
    | 'dragonBones.DragonBonesAsset'      // DragonBones 资源
    | 'dragonBones.DragonBonesAtlasAsset' // DragonBones 图集资源
    | 'RenderStage'            // 渲染阶段
    | 'RenderFlow';            // 渲染流程

/** 支持创建的资源类型（从常量数组派生） */
export type ISupportCreateType = typeof SUPPORT_CREATE_TYPES[number];


/** 资源处理器类型（从常量数组派生） */
export type AssetHandlerType = typeof ASSET_HANDLER_TYPES[number] | 'database';

export interface AssetUserDataMap {
    'animation-clip': AnimationClipAssetUserData;
    'auto-atlas': AutoAtlasAssetUserData;
    'label-atlas': LabelAtlasAssetUserData;
    'render-texture': RenderTextureAssetUserData;
    'directory': DirectoryAssetUserData;
    'texture-cube': TextureCubeAssetUserData;
    'erp-texture-cube': TextureCubeAssetUserData;
    'image': ImageAssetUserData;
    'sprite-frame': SpriteFrameAssetUserData;
    'texture': Texture2DAssetUserData;
    'spine-data': SpineAssetUserData;
    'javascript': JavaScriptAssetUserData;
    'gltf-animation': GltfAnimationAssetUserData;
    'particle': ParticleAssetUserData;
    'json': JsonAssetUserData;
    'prefab': PrefabAssetUserData;
    'scene': PrefabAssetUserData;
    'effect': EffectAssetUserData;
    'audio-clip': AudioClipAssetUserData;
    'bitmap-font': BitmapFontAssetUserData;
    'gltf-skeleton': GltfSkeletonAssetUserData;
    'gltf-embeded-image': GltfEmbededImageAssetUserData;
    'gltf-mesh': IVirtualAssetUserData;
    'gltf-material': IVirtualAssetUserData;
    'gltf-scene': IVirtualAssetUserData;
    'gltf': GlTFUserData;
    'fbx': GlTFUserData;
    'sprite-atlas': SpriteAtlasAssetUserData;
    'rt-sprite-frame': RtSpriteFrameAssetUserData;
    'sign-image': ImageAssetUserData;
    'alpha-image': ImageAssetUserData;

    // 无特定 userData 的资源类型（仅保留 unknown）
    'unknown': any;
}