/**
 * 系统调度装饰器
 *
 * 提供声明式的系统调度配置，包括执行阶段和依赖关系。
 *
 * System scheduling decorators.
 * Provides declarative system scheduling configuration including execution stage and dependencies.
 *
 * @example
 * ```typescript
 * @Stage('update')
 * @After('PhysicsSystem')
 * @Before('RenderSystem')
 * @InSet('GameplaySystems')
 * class MovementSystem extends EntitySystem {
 *     // ...
 * }
 * ```
 */

import type { SystemStage, SystemSchedulingMetadata } from '../Core/SystemScheduler';

/**
 * 调度元数据 Symbol
 * Scheduling metadata symbol
 */
export const SCHEDULING_METADATA = Symbol('schedulingMetadata');

/**
 * 获取或创建调度元数据
 * Get or create scheduling metadata
 */
function getOrCreateMetadata(target: object): SystemSchedulingMetadata {
    const proto = target as Record<symbol, SystemSchedulingMetadata | undefined>;
    if (!proto[SCHEDULING_METADATA]) {
        proto[SCHEDULING_METADATA] = {
            stage: 'update',
            before: [],
            after: [],
            sets: []
        };
    }
    return proto[SCHEDULING_METADATA]!;
}

/**
 * 设置系统执行阶段
 * Set system execution stage
 *
 * @param stage 执行阶段 | Execution stage
 * - 'startup': 只在首帧执行一次 | Execute once on first frame
 * - 'preUpdate': 在 update 之前执行 | Execute before update
 * - 'update': 主更新阶段（默认）| Main update stage (default)
 * - 'postUpdate': 在 update 之后执行 | Execute after update
 * - 'cleanup': 帧末清理阶段 | End of frame cleanup stage
 *
 * @example
 * ```typescript
 * @Stage('preUpdate')
 * class InputSystem extends EntitySystem { }
 *
 * @Stage('postUpdate')
 * class RenderSystem extends EntitySystem { }
 * ```
 */
export function Stage(stage: SystemStage): ClassDecorator {
    return function (target) {
        const metadata = getOrCreateMetadata(target.prototype);
        metadata.stage = stage;
        return target;
    };
}

/**
 * 声明此系统在指定系统之前执行
 * Declare this system executes before specified systems
 *
 * @param systems 系统名称列表 | System names
 *
 * @example
 * ```typescript
 * @Before('RenderSystem', 'UISystem')
 * class TransformSystem extends EntitySystem { }
 * ```
 */
export function Before(...systems: string[]): ClassDecorator {
    return function (target) {
        const metadata = getOrCreateMetadata(target.prototype);
        metadata.before.push(...systems);
        return target;
    };
}

/**
 * 声明此系统在指定系统之后执行
 * Declare this system executes after specified systems
 *
 * @param systems 系统名称列表（可使用 'set:' 前缀指定集合）| System names (use 'set:' prefix for sets)
 *
 * @example
 * ```typescript
 * @After('PhysicsSystem')
 * class CollisionResponseSystem extends EntitySystem { }
 *
 * // 使用集合
 * @After('set:PhysicsSystems')
 * class GameLogicSystem extends EntitySystem { }
 * ```
 */
export function After(...systems: string[]): ClassDecorator {
    return function (target) {
        const metadata = getOrCreateMetadata(target.prototype);
        metadata.after.push(...systems);
        return target;
    };
}

/**
 * 将系统加入指定集合
 * Add system to specified sets
 *
 * 集合是虚拟分组，可用于批量依赖声明。
 * Sets are virtual groups that can be used for batch dependency declarations.
 *
 * @param sets 集合名称列表 | Set names
 *
 * @example
 * ```typescript
 * @InSet('PhysicsSystems')
 * class RigidBodySystem extends EntitySystem { }
 *
 * @InSet('PhysicsSystems')
 * class CollisionSystem extends EntitySystem { }
 *
 * // 其他系统可以依赖整个集合
 * @After('set:PhysicsSystems')
 * class GameLogicSystem extends EntitySystem { }
 * ```
 */
export function InSet(...sets: string[]): ClassDecorator {
    return function (target) {
        const metadata = getOrCreateMetadata(target.prototype);
        metadata.sets.push(...sets);
        return target;
    };
}

/**
 * 获取系统的调度元数据
 * Get system scheduling metadata
 *
 * @param target 系统类或实例 | System class or instance
 * @returns 调度元数据或 undefined | Scheduling metadata or undefined
 */
export function getSchedulingMetadata(target: object): SystemSchedulingMetadata | undefined {
    // 从原型链查找
    let proto = Object.getPrototypeOf(target);
    while (proto) {
        const metadata = (proto as Record<symbol, SystemSchedulingMetadata | undefined>)[SCHEDULING_METADATA];
        if (metadata) {
            return metadata;
        }
        proto = Object.getPrototypeOf(proto);
    }
    return undefined;
}

/**
 * 检查系统是否有调度元数据
 * Check if system has scheduling metadata
 *
 * @param target 系统类或实例 | System class or instance
 * @returns 是否有元数据 | Whether has metadata
 */
export function hasSchedulingMetadata(target: object): boolean {
    return getSchedulingMetadata(target) !== undefined;
}
