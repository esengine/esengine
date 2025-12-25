/**
 * @zh 效果容器
 * @en Effect Container
 *
 * @zh 管理单个实体上的所有效果
 * @en Manages all effects on a single entity
 */

import type {
    IEffectInstance,
    IEffectDefinition,
    IEffectEvent,
    EffectEventListener,
    EffectEventType,
    IEffectHandler
} from './IEffect';

let instanceCounter = 0;

function generateInstanceId(): string {
    return `effect_${Date.now()}_${++instanceCounter}`;
}

/**
 * @zh 效果容器
 * @en Effect container
 */
export class EffectContainer<TTarget = unknown> {
    private readonly _effects: Map<string, IEffectInstance> = new Map();
    private readonly _effectsByType: Map<string, Set<string>> = new Map();
    private readonly _effectsByTag: Map<string, Set<string>> = new Map();
    private readonly _handlers: Map<string, IEffectHandler<TTarget>> = new Map();
    private readonly _listeners: Map<EffectEventType, Set<EffectEventListener>> = new Map();
    private readonly _target: TTarget;
    private readonly _targetId: string;

    /**
     * @zh 创建效果容器
     * @en Create effect container
     *
     * @param target - @zh 目标对象 @en Target object
     * @param targetId - @zh 目标 ID @en Target ID
     */
    constructor(target: TTarget, targetId: string) {
        this._target = target;
        this._targetId = targetId;
    }

    /**
     * @zh 获取目标对象
     * @en Get target object
     */
    get target(): TTarget {
        return this._target;
    }

    /**
     * @zh 获取目标 ID
     * @en Get target ID
     */
    get targetId(): string {
        return this._targetId;
    }

    /**
     * @zh 获取效果数量
     * @en Get effect count
     */
    get count(): number {
        return this._effects.size;
    }

    /**
     * @zh 注册效果处理器
     * @en Register effect handler
     */
    registerHandler(typeId: string, handler: IEffectHandler<TTarget>): void {
        this._handlers.set(typeId, handler);
    }

    /**
     * @zh 注销效果处理器
     * @en Unregister effect handler
     */
    unregisterHandler(typeId: string): void {
        this._handlers.delete(typeId);
    }

    /**
     * @zh 添加事件监听器
     * @en Add event listener
     */
    addEventListener(type: EffectEventType, listener: EffectEventListener): void {
        if (!this._listeners.has(type)) {
            this._listeners.set(type, new Set());
        }
        this._listeners.get(type)!.add(listener);
    }

    /**
     * @zh 移除事件监听器
     * @en Remove event listener
     */
    removeEventListener(type: EffectEventType, listener: EffectEventListener): void {
        this._listeners.get(type)?.delete(listener);
    }

    private _emitEvent(type: EffectEventType, effect: IEffectInstance, data?: Record<string, unknown>): void {
        const event: IEffectEvent = {
            type,
            effect,
            targetId: this._targetId,
            timestamp: Date.now(),
            data
        };

        this._listeners.get(type)?.forEach(listener => listener(event));
    }

    /**
     * @zh 应用效果
     * @en Apply effect
     *
     * @param definition - @zh 效果定义 @en Effect definition
     * @param sourceId - @zh 来源 ID @en Source ID
     * @param initialData - @zh 初始数据 @en Initial data
     * @returns @zh 效果实例或 null @en Effect instance or null
     */
    apply(
        definition: IEffectDefinition,
        sourceId?: string,
        initialData?: Record<string, unknown>
    ): IEffectInstance | null {
        // Handle exclusive tags - remove conflicting effects
        if (definition.exclusiveTags) {
            for (const tag of definition.exclusiveTags) {
                this.removeByTag(tag);
            }
        }

        // Check for existing effect of same type
        const existingIds = this._effectsByType.get(definition.typeId);
        if (existingIds && existingIds.size > 0) {
            const existingId = existingIds.values().next().value as string;
            const existing = this._effects.get(existingId);

            if (existing) {
                return this._handleStacking(existing, definition);
            }
        }

        // Create new effect instance
        const instance = this._createInstance(definition, sourceId, initialData);

        // Add to collections
        this._effects.set(instance.instanceId, instance);

        if (!this._effectsByType.has(definition.typeId)) {
            this._effectsByType.set(definition.typeId, new Set());
        }
        this._effectsByType.get(definition.typeId)!.add(instance.instanceId);

        for (const tag of definition.tags) {
            if (!this._effectsByTag.has(tag)) {
                this._effectsByTag.set(tag, new Set());
            }
            this._effectsByTag.get(tag)!.add(instance.instanceId);
        }

        // Call handler
        const handler = this._handlers.get(definition.typeId);
        handler?.onApply?.(instance, this._target);

        // Emit event
        this._emitEvent('applied', instance);

        return instance;
    }

    private _createInstance(
        definition: IEffectDefinition,
        sourceId?: string,
        initialData?: Record<string, unknown>
    ): IEffectInstance {
        const duration = definition.duration;
        let remainingTime = Infinity;

        if (duration.type === 'timed' && duration.duration !== undefined) {
            remainingTime = duration.duration;
        }

        return {
            instanceId: generateInstanceId(),
            definition,
            sourceId,
            stacks: 1,
            remainingTime,
            nextTickTime: definition.tickInterval ?? 0,
            data: { ...initialData },
            isActive: true,
            appliedAt: Date.now()
        };
    }

    private _handleStacking(existing: IEffectInstance, definition: IEffectDefinition): IEffectInstance | null {
        const rule = definition.stacking.rule;

        switch (rule) {
            case 'refresh':
                // Reset duration
                if (definition.duration.type === 'timed' && definition.duration.duration !== undefined) {
                    existing.remainingTime = definition.duration.duration;
                }
                this._handlers.get(definition.typeId)?.onRefresh?.(existing, this._target);
                this._emitEvent('refreshed', existing);
                return existing;

            case 'stack':
                // Add stacks
                const maxStacks = definition.stacking.maxStacks ?? Infinity;
                if (existing.stacks < maxStacks) {
                    existing.stacks++;
                    this._handlers.get(definition.typeId)?.onStack?.(existing, this._target, existing.stacks);
                    this._emitEvent('stacked', existing, { stacks: existing.stacks });
                }
                // Also refresh duration
                if (definition.duration.type === 'timed' && definition.duration.duration !== undefined) {
                    existing.remainingTime = definition.duration.duration;
                }
                return existing;

            case 'replace':
                // Remove existing and apply new
                this.remove(existing.instanceId);
                return null; // Will be created as new

            case 'ignore':
                // Do nothing
                return existing;

            case 'independent':
            default:
                // Allow multiple instances - will create new one
                return null;
        }
    }

    /**
     * @zh 移除效果
     * @en Remove effect
     *
     * @param instanceId - @zh 实例 ID @en Instance ID
     */
    remove(instanceId: string): boolean {
        const effect = this._effects.get(instanceId);
        if (!effect) return false;

        effect.isActive = false;

        // Call handler
        const handler = this._handlers.get(effect.definition.typeId);
        handler?.onRemove?.(effect, this._target);

        // Remove from collections
        this._effects.delete(instanceId);
        this._effectsByType.get(effect.definition.typeId)?.delete(instanceId);

        for (const tag of effect.definition.tags) {
            this._effectsByTag.get(tag)?.delete(instanceId);
        }

        // Emit event
        this._emitEvent('removed', effect);

        return true;
    }

    /**
     * @zh 按类型移除效果
     * @en Remove effects by type
     */
    removeByType(typeId: string): number {
        const ids = this._effectsByType.get(typeId);
        if (!ids) return 0;

        let count = 0;
        for (const id of [...ids]) {
            if (this.remove(id)) count++;
        }
        return count;
    }

    /**
     * @zh 按标签移除效果
     * @en Remove effects by tag
     */
    removeByTag(tag: string): number {
        const ids = this._effectsByTag.get(tag);
        if (!ids) return 0;

        let count = 0;
        for (const id of [...ids]) {
            if (this.remove(id)) count++;
        }
        return count;
    }

    /**
     * @zh 移除所有效果
     * @en Remove all effects
     */
    removeAll(): void {
        for (const id of [...this._effects.keys()]) {
            this.remove(id);
        }
    }

    /**
     * @zh 获取效果实例
     * @en Get effect instance
     */
    get(instanceId: string): IEffectInstance | undefined {
        return this._effects.get(instanceId);
    }

    /**
     * @zh 按类型获取效果
     * @en Get effects by type
     */
    getByType(typeId: string): IEffectInstance[] {
        const ids = this._effectsByType.get(typeId);
        if (!ids) return [];
        return [...ids].map(id => this._effects.get(id)!).filter(Boolean);
    }

    /**
     * @zh 按标签获取效果
     * @en Get effects by tag
     */
    getByTag(tag: string): IEffectInstance[] {
        const ids = this._effectsByTag.get(tag);
        if (!ids) return [];
        return [...ids].map(id => this._effects.get(id)!).filter(Boolean);
    }

    /**
     * @zh 检查是否有指定类型的效果
     * @en Check if has effect of specified type
     */
    hasType(typeId: string): boolean {
        const ids = this._effectsByType.get(typeId);
        return ids !== undefined && ids.size > 0;
    }

    /**
     * @zh 检查是否有指定标签的效果
     * @en Check if has effect with specified tag
     */
    hasTag(tag: string): boolean {
        const ids = this._effectsByTag.get(tag);
        return ids !== undefined && ids.size > 0;
    }

    /**
     * @zh 获取指定类型的叠加层数
     * @en Get stack count for specified type
     */
    getStacks(typeId: string): number {
        const effects = this.getByType(typeId);
        return effects.reduce((sum, e) => sum + e.stacks, 0);
    }

    /**
     * @zh 获取所有效果
     * @en Get all effects
     */
    getAll(): IEffectInstance[] {
        return [...this._effects.values()];
    }

    /**
     * @zh 更新效果（每帧调用）
     * @en Update effects (called every frame)
     *
     * @param deltaTime - @zh 帧时间（秒）@en Delta time in seconds
     */
    update(deltaTime: number): void {
        const toRemove: string[] = [];

        for (const effect of this._effects.values()) {
            if (!effect.isActive) continue;

            const definition = effect.definition;
            const handler = this._handlers.get(definition.typeId);

            // Update remaining time
            if (definition.duration.type === 'timed') {
                effect.remainingTime -= deltaTime;
                if (effect.remainingTime <= 0) {
                    this._emitEvent('expired', effect);
                    toRemove.push(effect.instanceId);
                    continue;
                }
            }

            // Check conditional duration
            if (definition.duration.type === 'conditional') {
                const condition = definition.duration.condition;
                if (condition && !condition()) {
                    this._emitEvent('expired', effect);
                    toRemove.push(effect.instanceId);
                    continue;
                }
            }

            // Handle periodic tick
            if (definition.tickInterval && definition.tickInterval > 0) {
                effect.nextTickTime -= deltaTime;
                if (effect.nextTickTime <= 0) {
                    handler?.onTick?.(effect, this._target, deltaTime);
                    this._emitEvent('ticked', effect);
                    effect.nextTickTime = definition.tickInterval;
                }
            }

            // Call update handler
            handler?.onUpdate?.(effect, this._target, deltaTime);
        }

        // Remove expired effects
        for (const id of toRemove) {
            this.remove(id);
        }
    }
}

/**
 * @zh 创建效果容器
 * @en Create effect container
 */
export function createEffectContainer<TTarget>(target: TTarget, targetId: string): EffectContainer<TTarget> {
    return new EffectContainer(target, targetId);
}
