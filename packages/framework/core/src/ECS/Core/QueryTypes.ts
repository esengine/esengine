import { Component } from '../Component';
import { ComponentType } from './ComponentStorage';
import { BitMask64Data } from '../Utils/BigIntCompatibility';
import { Entity } from '../Entity';

/**
 * 查询条件类型
 */
export enum QueryConditionType {
    /** 必须包含所有指定组件 */
    ALL = 'all',
    /** 必须包含任意一个指定组件 */
    ANY = 'any',
    /** 不能包含任何指定组件 */
    NONE = 'none'
}

/**
 * 查询条件接口
 */
export type QueryCondition = {
    type: QueryConditionType;
    componentTypes: ComponentType[];
    mask: BitMask64Data;
}

/**
 * 实体查询结果接口
 */
export type QueryResult = {
    entities: readonly Entity[];
    count: number;
    /** 查询执行时间（毫秒） */
    executionTime: number;
    /** 是否来自缓存 */
    fromCache: boolean;

    /**
     * @zh 按组件值过滤实体（在 queryAll/queryAny/queryNone 结果上可用）
     * @en Filter entities by component value (available on queryAll/queryAny/queryNone results)
     *
     * @example
     * ```typescript
     * const hpItems = scene.queryAll(Item).where!(Item, i => i.itemId === 'potion_hp');
     * ```
     */
    where?<T extends Component>(
        componentType: ComponentType<T>,
        predicate: (component: T) => boolean
    ): readonly Entity[];
}
