/**
 * @zh 意图类型定义（引擎基础接口）
 * @en Intent type definitions (engine base interface)
 *
 * @zh 引擎只提供基础的 IIntent 接口，具体的意图类型由游戏项目定义
 * @en Engine only provides base IIntent interface, specific intent types are defined by game projects
 */

// =============================================================================
// 基础意图接口 | Base Intent Interface
// =============================================================================

/**
 * @zh 基础意图接口
 * @en Base intent interface
 *
 * @zh 所有游戏意图都应该继承这个接口
 * @en All game intents should extend this interface
 *
 * @example
 * ```typescript
 * // 游戏项目中定义具体意图 | Define specific intents in game project
 * interface UnitMoveIntent extends IIntent {
 *     readonly type: 'unit.move';
 *     unitId: string;
 *     direction: number;
 * }
 * ```
 */
export interface IIntent {
    /**
     * @zh 意图类型（唯一标识符）
     * @en Intent type (unique identifier)
     */
    readonly type: string;

    /**
     * @zh 发起者玩家 ID（由 IntentCollector 自动填充）
     * @en Originator player ID (auto-filled by IntentCollector)
     */
    playerId?: string;

    /**
     * @zh 产生时的 tick（由 IntentCollector 自动填充）
     * @en Tick when generated (auto-filled by IntentCollector)
     */
    tick?: number;
}

// =============================================================================
// 意图键提取器 | Intent Key Extractor
// =============================================================================

/**
 * @zh 意图键提取器函数类型
 * @en Intent key extractor function type
 *
 * @zh 用于从意图中提取唯一键，防止同一对象重复操作
 * @en Used to extract unique key from intent, preventing duplicate operations on same object
 */
export type IntentKeyExtractor<T extends IIntent = IIntent> = (intent: T) => string;

/**
 * @zh 默认的意图键提取器（只使用 type）
 * @en Default intent key extractor (uses type only)
 */
export const defaultIntentKeyExtractor: IntentKeyExtractor = (intent) => intent.type;

// =============================================================================
// 通用结果常量 | Common Result Constants
// =============================================================================

/**
 * @zh 操作成功
 * @en Operation successful
 */
export const OK = 0;

/**
 * @zh 通用错误
 * @en Generic error
 */
export const ERR_GENERIC = -1;

/**
 * @zh 不是所有者
 * @en Not the owner
 */
export const ERR_NOT_OWNER = -2;

/**
 * @zh 目标无效
 * @en Invalid target
 */
export const ERR_INVALID_TARGET = -3;

/**
 * @zh 不在范围内
 * @en Not in range
 */
export const ERR_NOT_IN_RANGE = -4;

/**
 * @zh 资源不足
 * @en Not enough resources
 */
export const ERR_NOT_ENOUGH_RESOURCES = -5;

/**
 * @zh 正忙
 * @en Currently busy
 */
export const ERR_BUSY = -6;

/**
 * @zh 参数无效
 * @en Invalid arguments
 */
export const ERR_INVALID_ARGS = -7;

// =============================================================================
// 通用方向常量 | Common Direction Constants
// =============================================================================

export const TOP = 1;
export const TOP_RIGHT = 2;
export const RIGHT = 3;
export const BOTTOM_RIGHT = 4;
export const BOTTOM = 5;
export const BOTTOM_LEFT = 6;
export const LEFT = 7;
export const TOP_LEFT = 8;

/**
 * @zh 方向类型
 * @en Direction type
 */
export type Direction = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
