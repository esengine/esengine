/**
 * @zh 运行时核心工具模块
 * @en Runtime Core Utilities
 */

export {
    // 类型
    type IDependable,
    type TopologicalSortOptions,
    type TopologicalSortResult,
    type DependencyValidationResult,
    // 依赖 ID 解析
    resolveDependencyId,
    extractShortId,
    getPackageName,
    // 拓扑排序
    topologicalSort,
    // 依赖验证
    validateDependencies,
    getAllDependencies,
    getReverseDependencies
} from './DependencyUtils';
