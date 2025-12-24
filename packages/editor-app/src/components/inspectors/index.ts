/**
 * @zh 检查器模块 - 公共 API
 * @en Inspector Module - Public API
 *
 * @zh 这是检查器的主要入口点，所有外部代码应从这里导入
 * @en This is the main entry point for inspectors, all external code should import from here
 *
 * @example
 * ```tsx
 * import { Inspector } from '@/components/inspectors';
 *
 * <Inspector
 *     entityStore={entityStore}
 *     messageHub={messageHub}
 *     inspectorRegistry={inspectorRegistry}
 *     commandManager={commandManager}
 * />
 * ```
 */

export { Inspector } from './Inspector';
export type { InspectorProps, InspectorTarget, AssetFileInfo } from './types';
