/**
 * @zh Inspector 内部组件 - 被 inspectors/ 目录使用
 * @en Inspector Internal Components - Used by inspectors/ directory
 *
 * @zh 注意：这是内部实现目录，外部应使用 inspectors/ 目录
 * @en Note: This is internal implementation, external code should use inspectors/ directory
 *
 * @zh 架构说明：
 * - inspectors/Inspector.tsx - 入口组件，处理不同类型的检查器路由
 * - inspector/EntityInspectorPanel.tsx - 实体检查器核心实现
 * - inspector/ComponentPropertyEditor.tsx - 组件属性编辑器
 *
 * @en Architecture:
 * - inspectors/Inspector.tsx - Entry component, routes to different inspector types
 * - inspector/EntityInspectorPanel.tsx - Core entity inspector implementation
 * - inspector/ComponentPropertyEditor.tsx - Component property editor
 *
 * @deprecated 外部代码请使用 '@/components/inspectors' 导入
 * @deprecated External code should import from '@/components/inspectors'
 */

// 主组件 | Main components
export * from './InspectorPanel';
export * from './EntityInspectorPanel';
export * from './ComponentPropertyEditor';

// 类型 | Types
export * from './types';

// 头部组件 | Header components
export * from './header';

// 分组组件 | Section components
export * from './sections';

// 控件组件 | Control components
export * from './controls';
