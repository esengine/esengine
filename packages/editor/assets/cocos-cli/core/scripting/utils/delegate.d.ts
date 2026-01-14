/**
 * @zh
 * 移除首个指定的数组元素。判定元素相等时相当于于使用了 `Array.prototype.indexOf`。
 * 此函数十分高效，但会改变数组的元素次序。
 * @en
 * Removes the first occurrence of a specific object from the array.
 * Decision of the equality of elements is similar to `Array.prototype.indexOf`.
 * It's faster but the order of the array will be changed.
 * @param array @zh 被操作的数组。@en The array to be operated.
 * @param value @zh 待移除元素。@en The value to be removed.
 */
export declare function fastRemove<T>(array: T[], value: T): void;
/**
 * @zh
 * Async Delegate 用于支持异步回调的代理，你可以新建一个异步代理，并注册异步回调，等到对应的时机触发代理事件。
 *
 * @en
 * Async Delegate is a delegate that supports asynchronous callbacks.
 * You can create a new AsyncDelegate, register the asynchronous callback, and wait until the corresponding time to dispatch the event.
 *
 * @example
 * ```ts
 * const ad = new AsyncDelegate();
 * ad.add(() => {
 *     return new Promise((resolve, reject) => {
 *        setTimeout(() => {
 *            console.log('hello world');
 *            resolve();
 *        }, 1000);
 *     })
 * });
 * await ad.dispatch();
 * ```
 */
export declare class AsyncDelegate<T extends (...args: any) => (Promise<void> | void) = () => (Promise<void> | void)> {
    private _delegates;
    /**
     * @en
     * Add an async callback or sync callback.
     *
     * @zh
     * 添加一个异步回调或同步回调。
     *
     * @param callback
     * @en The callback to add, and will be invoked when this delegate is dispatching.
     * @zh 要添加的回调，并将在该委托调度时被调用。
     */
    add(callback: T): void;
    /**
     * @zh
     * 查询是否已注册某个回调。
     * @en
     * Queries if a callback has been registered.
     *
     * @param callback @en The callback to query. @zh 要查询的回调函数。
     * @returns @en Whether the callback has been added. @zh 是否已经添加了回调。
     */
    hasListener(callback: T): boolean;
    /**
     * @en
     * Remove the specific callback of this delegate.
     *
     * @zh
     * 移除此代理中某个具体的回调。
     *
     * @param callback @en The callback to remove. @zh 要移除的某个回调。
     */
    remove(callback: T): void;
    /**
     * @en
     * Dispatching the delegate event. This function will trigger all previously registered callbacks and does not guarantee execution order.
     *
     * @zh
     * 派发代理事件。此函数会触发所有之前注册的回调，并且不保证执行顺序。
     *
     * @param args @en The parameters to be transferred to callback. @zh 传递给回调函数的参数。
     * @returns @en The promise awaiting all async callback resolved. @zh 等待所有异步回调结束的 Promise 对象。
     */
    dispatch(...args: Parameters<T>): Promise<void[]>;
}
