/**
 * @zh ccesengine 类型桥接
 * @en ccesengine type bridge
 *
 * @zh 声明全局 window.cc，使用 cc.d.ts + cc-editor.d.ts 的类型
 * @en Declare global window.cc, using types from cc.d.ts + cc-editor.d.ts
 */

// Re-export common types from cc module
export type {
  Game,
  Director,
  AssetManager,
  Node,
  Scene,
  Camera,
  Sprite,
  SpriteFrame,
  Texture2D,
  ImageAsset,
  Color,
  Vec3,
  Asset,
  SceneAsset,
  Bundle,
  BundleConfig,
  BundleConfigOption,
  AssetInfo,
  AssetInfoCache,
  GeometryRenderer,
  Root,
  PipelineSceneData,
  Material,
  MeshRenderer,
  Mesh,
  Component,
  EffectAsset,
} from 'cc';

// Re-export internal camera type from renderer.scene
import type { renderer } from 'cc';

/**
 * @zh 内部渲染相机类型
 * @en Internal render camera type
 */
export type RenderCamera = renderer.scene.Camera;

// Import entire cc module type
import type * as cc from 'cc';
import type { EffectAsset } from 'cc';

/**
 * @zh 编译后的 Effect 数据结构
 * @en Compiled effect data structure
 */
export interface CompiledEffectData {
  name: string;
  techniques: EffectAsset.ITechniqueInfo[];
  shaders: EffectAsset.IShaderInfo[];
  combinations: EffectAsset.IPreCompileInfo[];
  hideInEditor?: boolean;
}

/**
 * @zh 扩展 Window 接口，声明全局 cc 和 builtin effects
 * @en Extend Window interface to declare global cc and builtin effects
 */
declare global {
  interface Window {
    cc: typeof cc;
    /** @zh 预编译的 effects @en Pre-compiled effects */
    __BUILTIN_EFFECTS__?: CompiledEffectData[];
    /** @zh Shader chunks（头文件）用于动态编译 @en Shader chunks (headers) for dynamic compilation */
    __BUILTIN_CHUNKS__?: Record<string, string>;
    /** @zh 原始 effect 文件内容，用于动态编译 @en Raw effect file contents for dynamic compilation */
    __RAW_EFFECTS__?: Record<string, string>;
  }
}

/**
 * @zh 获取全局 cc 对象
 * @en Get global cc object
 */
export function getCC(): typeof cc {
  return window.cc;
}

// CC 模块类型别名
export type CC = typeof cc;
