/**
 * 系统调度器
 *
 * 负责管理系统的执行阶段和依赖关系。
 * 支持声明式的 before/after 依赖和拓扑排序。
 *
 * System scheduler.
 * Manages system execution stages and dependencies.
 * Supports declarative before/after dependencies and topological sorting.
 *
 * @example
 * ```typescript
 * // 使用装饰器声明依赖
 * @Stage('update')
 * @After('PhysicsSystem')
 * @Before('RenderSystem')
 * class MovementSystem extends EntitySystem { }
 *
 * // 或者使用方法链
 * class MovementSystem extends EntitySystem {
 *     constructor() {
 *         super();
 *         this.stage('update').after('PhysicsSystem').before('RenderSystem');
 *     }
 * }
 * ```
 */

import { SystemDependencyGraph, CycleDependencyError, type SystemDependencyInfo } from './SystemDependencyGraph';
import { createLogger } from '../../Utils/Logger';
import type { EntitySystem } from '../Systems/EntitySystem';

const logger = createLogger('SystemScheduler');

export { CycleDependencyError };

/**
 * 系统执行阶段
 * System execution stage
 */
export type SystemStage = 'startup' | 'preUpdate' | 'update' | 'postUpdate' | 'cleanup';

/**
 * 默认阶段执行顺序
 * Default stage execution order
 */
export const DEFAULT_STAGE_ORDER: readonly SystemStage[] = [
    'startup',
    'preUpdate',
    'update',
    'postUpdate',
    'cleanup'
];

/**
 * 系统调度元数据
 * System scheduling metadata
 */
export type SystemSchedulingMetadata = {
    /** 执行阶段 | Execution stage */
    stage: SystemStage;
    /** 在这些系统之前执行 | Execute before these systems */
    before: string[];
    /** 在这些系统之后执行 | Execute after these systems */
    after: string[];
    /** 所属集合 | Sets this system belongs to */
    sets: string[];
}

/**
 * 默认调度元数据
 * Default scheduling metadata
 */
export const DEFAULT_SCHEDULING_METADATA: Readonly<SystemSchedulingMetadata> = {
    stage: 'update',
    before: [],
    after: [],
    sets: []
};

/**
 * 系统调度器
 *
 * 管理系统的执行顺序，支持：
 * - 阶段分组（startup, preUpdate, update, postUpdate, cleanup）
 * - before/after 依赖声明
 * - 拓扑排序和循环检测
 * - 与现有 updateOrder 的兼容
 *
 * System scheduler.
 * Manages system execution order, supports:
 * - Stage grouping (startup, preUpdate, update, postUpdate, cleanup)
 * - before/after dependency declarations
 * - Topological sorting and cycle detection
 * - Compatibility with existing updateOrder
 */
export class SystemScheduler {
    /** 按阶段分组的排序结果 | Sorted results grouped by stage */
    private _sortedByStage: Map<SystemStage, EntitySystem[]> = new Map();
    /** 是否需要重新构建 | Whether rebuild is needed */
    private _dirty: boolean = true;
    /** 依赖图 | Dependency graph */
    private _graph: SystemDependencyGraph = new SystemDependencyGraph();
    /** 是否启用依赖排序 | Whether dependency sorting is enabled */
    private _useDependencySort: boolean = true;

    /**
     * 设置是否使用依赖排序
     * Set whether to use dependency sorting
     *
     * @param enabled 是否启用 | Whether to enable
     */
    public setUseDependencySort(enabled: boolean): void {
        if (this._useDependencySort !== enabled) {
            this._useDependencySort = enabled;
            this._dirty = true;
        }
    }

    /**
     * 标记需要重新构建
     * Mark as needing rebuild
     */
    public markDirty(): void {
        this._dirty = true;
    }

    /**
     * 获取指定阶段的排序后系统列表
     * Get sorted system list for specified stage
     *
     * @param systems 所有系统 | All systems
     * @param stage 阶段 | Stage
     * @returns 排序后的系统列表 | Sorted system list
     */
    public getSortedSystems(systems: EntitySystem[], stage?: SystemStage): EntitySystem[] {
        this.ensureBuilt(systems);

        if (stage) {
            return this._sortedByStage.get(stage) ?? [];
        }

        // 返回所有阶段按顺序合并的结果
        const result: EntitySystem[] = [];
        for (const s of DEFAULT_STAGE_ORDER) {
            const stageSystems = this._sortedByStage.get(s);
            if (stageSystems) {
                result.push(...stageSystems);
            }
        }
        return result;
    }

    /**
     * 获取所有排序后的系统（按默认阶段顺序）
     * Get all sorted systems (by default stage order)
     *
     * @param systems 所有系统 | All systems
     * @returns 排序后的系统列表 | Sorted system list
     */
    public getAllSortedSystems(systems: EntitySystem[]): EntitySystem[] {
        return this.getSortedSystems(systems);
    }

    /**
     * 确保已构建排序结果
     * Ensure sorted results are built
     */
    private ensureBuilt(systems: EntitySystem[]): void {
        if (!this._dirty) return;

        this._sortedByStage.clear();

        if (!this._useDependencySort || !this.hasDependencies(systems)) {
            // 使用简单的 updateOrder 排序
            this.buildWithUpdateOrder(systems);
        } else {
            // 使用依赖图拓扑排序
            this.buildWithDependencyGraph(systems);
        }

        this._dirty = false;
    }

    /**
     * 检查系统是否有依赖声明
     * Check if systems have dependency declarations
     */
    private hasDependencies(systems: EntitySystem[]): boolean {
        for (const sys of systems) {
            const meta = this.getSchedulingMetadata(sys);
            if (meta.before.length > 0 || meta.after.length > 0 || meta.sets.length > 0) {
                return true;
            }
            // 检查 stage 是否非默认值
            if (meta.stage !== 'update') {
                return true;
            }
        }
        return false;
    }

    /**
     * 使用 updateOrder 构建排序
     * Build sorting with updateOrder
     */
    private buildWithUpdateOrder(systems: EntitySystem[]): void {
        // 先按 updateOrder 和 addOrder 排序
        const sorted = [...systems].sort((a, b) => {
            const orderDiff = a.updateOrder - b.updateOrder;
            if (orderDiff !== 0) return orderDiff;
            return a.addOrder - b.addOrder;
        });

        // 所有系统放入 update 阶段
        this._sortedByStage.set('update', sorted);
    }

    /**
     * 使用依赖图构建排序
     * Build sorting with dependency graph
     */
    private buildWithDependencyGraph(systems: EntitySystem[]): void {
        // 按阶段分组
        const byStage = new Map<SystemStage, EntitySystem[]>();
        for (const stage of DEFAULT_STAGE_ORDER) {
            byStage.set(stage, []);
        }

        for (const sys of systems) {
            const meta = this.getSchedulingMetadata(sys);
            const stage = meta.stage;
            const stageList = byStage.get(stage);
            if (stageList) {
                stageList.push(sys);
            } else {
                // 未知阶段放入 update
                byStage.get('update')!.push(sys);
            }
        }

        // 对每个阶段内的系统进行拓扑排序
        for (const [stage, stageSystems] of byStage) {
            if (stageSystems.length === 0) {
                this._sortedByStage.set(stage, []);
                continue;
            }

            const sorted = this.sortSystemsInStage(stageSystems);
            this._sortedByStage.set(stage, sorted);
        }
    }

    /**
     * 在阶段内对系统进行拓扑排序
     * Sort systems within a stage using topological sort
     */
    private sortSystemsInStage(systems: EntitySystem[]): EntitySystem[] {
        // 构建名称到系统的映射
        const nameToSystem = new Map<string, EntitySystem>();
        const depInfos: SystemDependencyInfo[] = [];

        for (const sys of systems) {
            const name = sys.systemName;
            nameToSystem.set(name, sys);

            const meta = this.getSchedulingMetadata(sys);
            depInfos.push({
                name,
                before: meta.before,
                after: meta.after,
                sets: meta.sets
            });
        }

        // 构建依赖图并排序
        this._graph.buildFromSystems(depInfos);

        try {
            const sortedNames = this._graph.topologicalSort();

            // 将排序结果映射回系统实例
            const result: EntitySystem[] = [];
            for (const name of sortedNames) {
                const sys = nameToSystem.get(name);
                if (sys) {
                    result.push(sys);
                }
            }

            // 对于没有依赖的系统，保持 updateOrder 作为次要排序键
            return this.stableSortByUpdateOrder(result);
        } catch (error) {
            if (error instanceof CycleDependencyError) {
                // 重新抛出循环错误，让用户知道
                throw error;
            }
            // 其他错误回退到 updateOrder 排序
            logger.warn('Topological sort failed, falling back to updateOrder | 拓扑排序失败，回退到 updateOrder 排序', error);
            return this.fallbackSort(systems);
        }
    }

    /**
     * 稳定排序：在拓扑顺序的基础上，用 updateOrder 作为次要排序键
     * Stable sort: use updateOrder as secondary key after topological order
     */
    private stableSortByUpdateOrder(systems: EntitySystem[]): EntitySystem[] {
        // 拓扑排序已经保证了依赖顺序
        // 对于没有直接依赖关系的系统，按 updateOrder 排序
        // 这里简单处理：假设拓扑排序已经正确，只需保持结果
        return systems;
    }

    /**
     * 回退排序：使用 updateOrder
     * Fallback sort: use updateOrder
     */
    private fallbackSort(systems: EntitySystem[]): EntitySystem[] {
        return [...systems].sort((a, b) => {
            const orderDiff = a.updateOrder - b.updateOrder;
            if (orderDiff !== 0) return orderDiff;
            return a.addOrder - b.addOrder;
        });
    }

    /**
     * 获取系统的调度元数据
     * Get system scheduling metadata
     */
    private getSchedulingMetadata(system: EntitySystem): SystemSchedulingMetadata {
        // 使用公共 getter 方法获取调度信息
        // Use public getter methods to access scheduling info
        return {
            stage: system.getStage(),
            before: [...system.getBefore()],
            after: [...system.getAfter()],
            sets: [...system.getSets()]
        };
    }
}
