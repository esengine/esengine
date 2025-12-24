/**
 * @zh 检查器模块 - 公共 API
 * @en Inspector Module - Public API
 *
 * @zh 这是检查器的主要入口点，所有外部代码应从这里导入
 * @en This is the main entry point for inspectors, all external code should import from here
 *
 * @example
 * ```tsx
 * import { Inspector, PropertyInspector } from '@/components/inspectors';
 * ```
 */

// 主入口组件 | Main entry component
export { Inspector } from './Inspector';

// 属性检查器 | Property Inspector
export { PropertyInspector } from '../PropertyInspector';

// 类型 | Types
export type { InspectorProps, InspectorTarget, AssetFileInfo } from './types';

// 子组件 (按需导入) | Sub-components (import as needed)
export * from './views';
export * from './fields';
export * from './common';
