/**
 * @zh 意图类型定义
 * @en Intent type definitions
 *
 * @zh 意图是玩家蓝图产生的操作请求，由服务器统一处理
 * @en Intents are operation requests from player blueprints, processed by server
 */

// =============================================================================
// 基础意图接口 | Base Intent Interface
// =============================================================================

/**
 * @zh 基础意图接口
 * @en Base intent interface
 */
export interface IIntent {
    /**
     * @zh 意图类型
     * @en Intent type
     */
    readonly type: string;

    /**
     * @zh 发起者玩家 ID
     * @en Originator player ID
     */
    playerId?: string;

    /**
     * @zh 产生时的 tick
     * @en Tick when generated
     */
    tick?: number;
}

// =============================================================================
// Unit 意图 | Unit Intents
// =============================================================================

/**
 * @zh 单位移动意图
 * @en Unit move intent
 */
export interface UnitMoveIntent extends IIntent {
    readonly type: 'unit.move';
    unitId: string;
    direction: number;
}

/**
 * @zh 单位采集意图
 * @en Unit harvest intent
 */
export interface UnitHarvestIntent extends IIntent {
    readonly type: 'unit.harvest';
    unitId: string;
    targetId: string;
}

/**
 * @zh 单位建造意图
 * @en Unit build intent
 */
export interface UnitBuildIntent extends IIntent {
    readonly type: 'unit.build';
    unitId: string;
    targetId: string;
}

/**
 * @zh 单位修理意图
 * @en Unit repair intent
 */
export interface UnitRepairIntent extends IIntent {
    readonly type: 'unit.repair';
    unitId: string;
    targetId: string;
}

/**
 * @zh 单位攻击意图
 * @en Unit attack intent
 */
export interface UnitAttackIntent extends IIntent {
    readonly type: 'unit.attack';
    unitId: string;
    targetId: string;
}

/**
 * @zh 单位转移资源意图
 * @en Unit transfer intent
 */
export interface UnitTransferIntent extends IIntent {
    readonly type: 'unit.transfer';
    unitId: string;
    targetId: string;
    resourceType: string;
    amount: number;
}

/**
 * @zh 单位拾取意图
 * @en Unit pickup intent
 */
export interface UnitPickupIntent extends IIntent {
    readonly type: 'unit.pickup';
    unitId: string;
    targetId: string;
}

// =============================================================================
// Spawner 意图 | Spawner Intents
// =============================================================================

/**
 * @zh 身体部件常量
 * @en Body part constants
 */
export type BodyPartConstant =
    | 'move'
    | 'work'
    | 'carry'
    | 'attack'
    | 'ranged_attack'
    | 'heal'
    | 'claim'
    | 'tough';

/**
 * @zh 生成器生成单位意图
 * @en Spawner spawn unit intent
 */
export interface SpawnerSpawnUnitIntent extends IIntent {
    readonly type: 'spawner.spawnUnit';
    spawnerId: string;
    body: BodyPartConstant[];
    name: string;
    memory?: Record<string, unknown>;
}

/**
 * @zh 生成器取消生成意图
 * @en Spawner cancel spawning intent
 */
export interface SpawnerCancelIntent extends IIntent {
    readonly type: 'spawner.cancel';
    spawnerId: string;
}

// =============================================================================
// 结构意图 | Structure Intents
// =============================================================================

/**
 * @zh 塔攻击意图
 * @en Tower attack intent
 */
export interface TowerAttackIntent extends IIntent {
    readonly type: 'tower.attack';
    towerId: string;
    targetId: string;
}

/**
 * @zh 塔修理意图
 * @en Tower repair intent
 */
export interface TowerRepairIntent extends IIntent {
    readonly type: 'tower.repair';
    towerId: string;
    targetId: string;
}

/**
 * @zh 塔治疗意图
 * @en Tower heal intent
 */
export interface TowerHealIntent extends IIntent {
    readonly type: 'tower.heal';
    towerId: string;
    targetId: string;
}

// =============================================================================
// 联合类型 | Union Type
// =============================================================================

/**
 * @zh 所有意图类型的联合
 * @en Union of all intent types
 */
export type Intent =
    | UnitMoveIntent
    | UnitHarvestIntent
    | UnitBuildIntent
    | UnitRepairIntent
    | UnitAttackIntent
    | UnitTransferIntent
    | UnitPickupIntent
    | SpawnerSpawnUnitIntent
    | SpawnerCancelIntent
    | TowerAttackIntent
    | TowerRepairIntent
    | TowerHealIntent;

/**
 * @zh 意图类型字符串
 * @en Intent type strings
 */
export type IntentType = Intent['type'];

// =============================================================================
// 结果常量 | Result Constants
// =============================================================================

/**
 * @zh 操作成功
 * @en Operation successful
 */
export const OK = 0;

/**
 * @zh 不是所有者
 * @en Not the owner
 */
export const ERR_NOT_OWNER = -1;

/**
 * @zh 没有路径
 * @en No path found
 */
export const ERR_NO_PATH = -2;

/**
 * @zh 名称已存在
 * @en Name already exists
 */
export const ERR_NAME_EXISTS = -3;

/**
 * @zh 正忙
 * @en Currently busy
 */
export const ERR_BUSY = -4;

/**
 * @zh 能量不足
 * @en Not enough energy
 */
export const ERR_NOT_ENOUGH_ENERGY = -6;

/**
 * @zh 资源不足
 * @en Not enough resources
 */
export const ERR_NOT_ENOUGH_RESOURCES = -6;

/**
 * @zh 目标无效
 * @en Invalid target
 */
export const ERR_INVALID_TARGET = -7;

/**
 * @zh 满了
 * @en Full capacity
 */
export const ERR_FULL = -8;

/**
 * @zh 不在范围内
 * @en Not in range
 */
export const ERR_NOT_IN_RANGE = -9;

/**
 * @zh 参数无效
 * @en Invalid arguments
 */
export const ERR_INVALID_ARGS = -10;

/**
 * @zh 疲劳中
 * @en Fatigued
 */
export const ERR_TIRED = -11;

/**
 * @zh 没有身体部件
 * @en No body part for action
 */
export const ERR_NO_BODYPART = -12;

// =============================================================================
// 方向常量 | Direction Constants
// =============================================================================

export const TOP = 1;
export const TOP_RIGHT = 2;
export const RIGHT = 3;
export const BOTTOM_RIGHT = 4;
export const BOTTOM = 5;
export const BOTTOM_LEFT = 6;
export const LEFT = 7;
export const TOP_LEFT = 8;
