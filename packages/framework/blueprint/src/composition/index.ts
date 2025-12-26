/**
 * @zh 蓝图组合系统导出
 * @en Blueprint Composition System Export
 */

// =============================================================================
// 片段 | Fragment
// =============================================================================

export type {
    ExposedPin,
    IBlueprintFragment,
    BlueprintFragmentConfig,
    BlueprintFragmentAsset
} from './BlueprintFragment';

export {
    BlueprintFragment,
    createExposedPin,
    createFragment,
    fragmentFromAsset,
    fragmentToAsset
} from './BlueprintFragment';

// =============================================================================
// 组合器 | Composer
// =============================================================================

export type {
    FragmentSlot,
    SlotConnection,
    IBlueprintComposer,
    CompositionValidationResult,
    CompositionError,
    CompositionWarning,
    BlueprintCompositionAsset
} from './BlueprintComposer';

export {
    BlueprintComposer,
    createComposer
} from './BlueprintComposer';

// =============================================================================
// 注册表 | Registry
// =============================================================================

export type {
    FragmentFilter,
    IFragmentRegistry
} from './FragmentRegistry';

export {
    FragmentRegistry,
    defaultFragmentRegistry,
    createFragmentRegistry
} from './FragmentRegistry';
