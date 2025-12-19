export { SpriteComponent } from './SpriteComponent';
// Re-export material types from material-system for convenience
// 从 material-system 重新导出材质类型以方便使用
export type { MaterialPropertyOverride, MaterialOverrides } from '@esengine/material-system';
export { SpriteAnimatorComponent } from './SpriteAnimatorComponent';
export type { AnimationFrame, AnimationClip } from './SpriteAnimatorComponent';
export { ShinyEffectComponent } from './ShinyEffectComponent';
export { SpriteAnimatorSystem } from './systems/SpriteAnimatorSystem';
export { ShinyEffectSystem } from './systems/ShinyEffectSystem';
export { SpriteRuntimeModule, SpritePlugin } from './SpriteRuntimeModule';

// Service tokens | 服务令牌
export { SpriteAnimatorSystemToken } from './tokens';
