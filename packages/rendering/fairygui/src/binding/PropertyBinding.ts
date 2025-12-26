/**
 * Property change callback
 * 属性变更回调
 */
export type PropertyChangeCallback<T> = (newValue: T, oldValue: T) => void;

/**
 * Property binding subscription
 * 属性绑定订阅
 */
export interface IPropertySubscription {
    /** Unsubscribe from property changes | 取消订阅属性变更 */
    unsubscribe(): void;
}

/**
 * Observable property interface
 * 可观察属性接口
 */
export interface IObservableProperty<T> {
    /** Get current value | 获取当前值 */
    readonly value: T;
    /** Subscribe to changes | 订阅变更 */
    subscribe(callback: PropertyChangeCallback<T>): IPropertySubscription;
    /** Bind to another property | 绑定到另一个属性 */
    bindTo(target: IWritableProperty<T>): IPropertySubscription;
}

/**
 * Writable property interface
 * 可写属性接口
 */
export interface IWritableProperty<T> extends IObservableProperty<T> {
    /** Set value | 设置值 */
    value: T;
}

/**
 * ObservableProperty
 *
 * Reactive property that notifies subscribers when value changes.
 *
 * 响应式属性，值变更时通知订阅者
 *
 * @example
 * ```typescript
 * const name = new ObservableProperty('初始值');
 * name.subscribe((newVal, oldVal) => console.log(`Changed: ${oldVal} -> ${newVal}`));
 * name.value = '新值'; // 触发回调
 * ```
 */
export class ObservableProperty<T> implements IWritableProperty<T> {
    private _value: T;
    private _subscribers: Set<PropertyChangeCallback<T>> = new Set();
    private _equalityFn: (a: T, b: T) => boolean;

    constructor(initialValue: T, equalityFn?: (a: T, b: T) => boolean) {
        this._value = initialValue;
        this._equalityFn = equalityFn ?? ((a, b) => a === b);
    }

    public get value(): T {
        return this._value;
    }

    public set value(newValue: T) {
        if (!this._equalityFn(this._value, newValue)) {
            const oldValue = this._value;
            this._value = newValue;
            this.notify(newValue, oldValue);
        }
    }

    /**
     * Set value without triggering notifications
     * 设置值但不触发通知
     */
    public setSilent(newValue: T): void {
        this._value = newValue;
    }

    public subscribe(callback: PropertyChangeCallback<T>): IPropertySubscription {
        this._subscribers.add(callback);
        return {
            unsubscribe: () => this._subscribers.delete(callback)
        };
    }

    public bindTo(target: IWritableProperty<T>): IPropertySubscription {
        target.value = this._value;
        return this.subscribe((newValue) => {
            target.value = newValue;
        });
    }

    /**
     * Create a derived property that transforms this property's value
     * 创建一个转换此属性值的派生属性
     */
    public map<U>(transform: (value: T) => U): IObservableProperty<U> {
        const derived = new DerivedProperty<U>(transform(this._value));
        this.subscribe((newValue) => {
            derived.update(transform(newValue));
        });
        return derived;
    }

    /**
     * Combine with another property
     * 与另一个属性组合
     */
    public combine<U, R>(
        other: IObservableProperty<U>,
        combiner: (a: T, b: U) => R
    ): IObservableProperty<R> {
        const derived = new DerivedProperty<R>(combiner(this._value, other.value));

        this.subscribe((newValue) => {
            derived.update(combiner(newValue, other.value));
        });

        other.subscribe((newValue) => {
            derived.update(combiner(this._value, newValue));
        });

        return derived;
    }

    private notify(newValue: T, oldValue: T): void {
        for (const callback of this._subscribers) {
            try {
                callback(newValue, oldValue);
            } catch (error) {
                console.error('Error in property change callback:', error);
            }
        }
    }
}

/**
 * DerivedProperty
 *
 * Read-only property derived from other properties.
 *
 * 从其他属性派生的只读属性
 */
class DerivedProperty<T> implements IObservableProperty<T> {
    private _value: T;
    private _subscribers: Set<PropertyChangeCallback<T>> = new Set();

    constructor(initialValue: T) {
        this._value = initialValue;
    }

    public get value(): T {
        return this._value;
    }

    public update(newValue: T): void {
        if (this._value !== newValue) {
            const oldValue = this._value;
            this._value = newValue;
            for (const callback of this._subscribers) {
                callback(newValue, oldValue);
            }
        }
    }

    public subscribe(callback: PropertyChangeCallback<T>): IPropertySubscription {
        this._subscribers.add(callback);
        return {
            unsubscribe: () => this._subscribers.delete(callback)
        };
    }

    public bindTo(target: IWritableProperty<T>): IPropertySubscription {
        target.value = this._value;
        return this.subscribe((newValue) => {
            target.value = newValue;
        });
    }
}

/**
 * ComputedProperty
 *
 * Property that computes its value from a function.
 *
 * 通过函数计算值的属性
 *
 * @example
 * ```typescript
 * const firstName = new ObservableProperty('张');
 * const lastName = new ObservableProperty('三');
 * const fullName = new ComputedProperty(
 *     () => firstName.value + lastName.value,
 *     [firstName, lastName]
 * );
 * ```
 */
export class ComputedProperty<T> implements IObservableProperty<T> {
    private _computeFn: () => T;
    private _cachedValue: T;
    private _dirty: boolean = false;
    private _subscribers: Set<PropertyChangeCallback<T>> = new Set();
    private _subscriptions: IPropertySubscription[] = [];

    constructor(computeFn: () => T, dependencies: IObservableProperty<unknown>[]) {
        this._computeFn = computeFn;
        this._cachedValue = computeFn();

        for (const dep of dependencies) {
            this._subscriptions.push(
                dep.subscribe(() => {
                    this._dirty = true;
                    this.recompute();
                })
            );
        }
    }

    public get value(): T {
        if (this._dirty) {
            this.recompute();
        }
        return this._cachedValue;
    }

    public subscribe(callback: PropertyChangeCallback<T>): IPropertySubscription {
        this._subscribers.add(callback);
        return {
            unsubscribe: () => this._subscribers.delete(callback)
        };
    }

    public bindTo(target: IWritableProperty<T>): IPropertySubscription {
        target.value = this.value;
        return this.subscribe((newValue) => {
            target.value = newValue;
        });
    }

    public dispose(): void {
        for (const sub of this._subscriptions) {
            sub.unsubscribe();
        }
        this._subscriptions.length = 0;
        this._subscribers.clear();
    }

    private recompute(): void {
        const oldValue = this._cachedValue;
        this._cachedValue = this._computeFn();
        this._dirty = false;

        if (oldValue !== this._cachedValue) {
            for (const callback of this._subscribers) {
                callback(this._cachedValue, oldValue);
            }
        }
    }
}

/**
 * PropertyBinder
 *
 * Utility for managing multiple property bindings.
 *
 * 管理多个属性绑定的工具类
 *
 * @example
 * ```typescript
 * const binder = new PropertyBinder();
 * binder.bind(source.name, target, 'displayName');
 * binder.bind(source.value, target.progressBar, 'progress');
 * // Later...
 * binder.dispose(); // Cleans up all bindings
 * ```
 */
export class PropertyBinder {
    private _subscriptions: IPropertySubscription[] = [];

    /**
     * Bind a property to an object's field
     * 将属性绑定到对象的字段
     */
    public bind<T, K extends keyof T>(
        source: IObservableProperty<T[K]>,
        target: T,
        key: K
    ): this {
        target[key] = source.value;
        this._subscriptions.push(
            source.subscribe((newValue) => {
                target[key] = newValue;
            })
        );
        return this;
    }

    /**
     * Two-way bind between properties
     * 属性间双向绑定
     */
    public bindTwoWay<T>(
        propA: IWritableProperty<T>,
        propB: IWritableProperty<T>
    ): this {
        let updating = false;

        this._subscriptions.push(
            propA.subscribe((newValue) => {
                if (!updating) {
                    updating = true;
                    propB.value = newValue;
                    updating = false;
                }
            })
        );

        this._subscriptions.push(
            propB.subscribe((newValue) => {
                if (!updating) {
                    updating = true;
                    propA.value = newValue;
                    updating = false;
                }
            })
        );

        return this;
    }

    /**
     * Add a custom subscription
     * 添加自定义订阅
     */
    public addSubscription(subscription: IPropertySubscription): this {
        this._subscriptions.push(subscription);
        return this;
    }

    /**
     * Dispose all bindings
     * 销毁所有绑定
     */
    public dispose(): void {
        for (const sub of this._subscriptions) {
            sub.unsubscribe();
        }
        this._subscriptions.length = 0;
    }
}
