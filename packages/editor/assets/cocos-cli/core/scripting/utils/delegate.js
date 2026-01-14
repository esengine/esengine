"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncDelegate = void 0;
exports.fastRemove = fastRemove;
/* eslint-disable prefer-rest-params */
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
function fastRemove(array, value) {
    const index = array.indexOf(value);
    if (index >= 0) {
        array[index] = array[array.length - 1];
        --array.length;
    }
}
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
class AsyncDelegate {
    _delegates = [];
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
    add(callback) {
        if (!this._delegates.includes(callback)) {
            this._delegates.push(callback);
        }
    }
    /**
     * @zh
     * 查询是否已注册某个回调。
     * @en
     * Queries if a callback has been registered.
     *
     * @param callback @en The callback to query. @zh 要查询的回调函数。
     * @returns @en Whether the callback has been added. @zh 是否已经添加了回调。
     */
    hasListener(callback) {
        return this._delegates.includes(callback);
    }
    /**
     * @en
     * Remove the specific callback of this delegate.
     *
     * @zh
     * 移除此代理中某个具体的回调。
     *
     * @param callback @en The callback to remove. @zh 要移除的某个回调。
     */
    remove(callback) {
        fastRemove(this._delegates, callback);
    }
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
    dispatch(...args) {
        return Promise.all(this._delegates.map((func) => func(...arguments)).filter(Boolean));
    }
}
exports.AsyncDelegate = AsyncDelegate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZWdhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9zY3JpcHRpbmcvdXRpbHMvZGVsZWdhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBWUEsZ0NBTUM7QUFsQkQsdUNBQXVDO0FBQ3ZDOzs7Ozs7Ozs7O0dBVUc7QUFDSCxTQUFnQixVQUFVLENBQUksS0FBVSxFQUFFLEtBQVE7SUFDOUMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQyxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNiLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN2QyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDbkIsQ0FBQztBQUNMLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJHO0FBQ0gsTUFBYSxhQUFhO0lBQ2QsVUFBVSxHQUFRLEVBQUUsQ0FBQztJQUU3Qjs7Ozs7Ozs7OztPQVVHO0lBQ0ksR0FBRyxDQUFDLFFBQVc7UUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkMsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNJLFdBQVcsQ0FBQyxRQUFXO1FBQzFCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0ksTUFBTSxDQUFDLFFBQVc7UUFDckIsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNJLFFBQVEsQ0FBQyxHQUFHLElBQW1CO1FBQ2xDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUMxRixDQUFDO0NBQ0o7QUEzREQsc0NBMkRDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgcHJlZmVyLXJlc3QtcGFyYW1zICovXHJcbi8qKlxyXG4gKiBAemhcclxuICog56e76Zmk6aaW5Liq5oyH5a6a55qE5pWw57uE5YWD57Sg44CC5Yik5a6a5YWD57Sg55u4562J5pe255u45b2T5LqO5LqO5L2/55So5LqGIGBBcnJheS5wcm90b3R5cGUuaW5kZXhPZmDjgIJcclxuICog5q2k5Ye95pWw5Y2B5YiG6auY5pWI77yM5L2G5Lya5pS55Y+Y5pWw57uE55qE5YWD57Sg5qyh5bqP44CCXHJcbiAqIEBlblxyXG4gKiBSZW1vdmVzIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGEgc3BlY2lmaWMgb2JqZWN0IGZyb20gdGhlIGFycmF5LlxyXG4gKiBEZWNpc2lvbiBvZiB0aGUgZXF1YWxpdHkgb2YgZWxlbWVudHMgaXMgc2ltaWxhciB0byBgQXJyYXkucHJvdG90eXBlLmluZGV4T2ZgLlxyXG4gKiBJdCdzIGZhc3RlciBidXQgdGhlIG9yZGVyIG9mIHRoZSBhcnJheSB3aWxsIGJlIGNoYW5nZWQuXHJcbiAqIEBwYXJhbSBhcnJheSBAemgg6KKr5pON5L2c55qE5pWw57uE44CCQGVuIFRoZSBhcnJheSB0byBiZSBvcGVyYXRlZC5cclxuICogQHBhcmFtIHZhbHVlIEB6aCDlvoXnp7vpmaTlhYPntKDjgIJAZW4gVGhlIHZhbHVlIHRvIGJlIHJlbW92ZWQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZmFzdFJlbW92ZTxUPihhcnJheTogVFtdLCB2YWx1ZTogVCkge1xyXG4gICAgY29uc3QgaW5kZXggPSBhcnJheS5pbmRleE9mKHZhbHVlKTtcclxuICAgIGlmIChpbmRleCA+PSAwKSB7XHJcbiAgICAgICAgYXJyYXlbaW5kZXhdID0gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgLS1hcnJheS5sZW5ndGg7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAemhcclxuICogQXN5bmMgRGVsZWdhdGUg55So5LqO5pSv5oyB5byC5q2l5Zue6LCD55qE5Luj55CG77yM5L2g5Y+v5Lul5paw5bu65LiA5Liq5byC5q2l5Luj55CG77yM5bm25rOo5YaM5byC5q2l5Zue6LCD77yM562J5Yiw5a+55bqU55qE5pe25py66Kem5Y+R5Luj55CG5LqL5Lu244CCXHJcbiAqXHJcbiAqIEBlblxyXG4gKiBBc3luYyBEZWxlZ2F0ZSBpcyBhIGRlbGVnYXRlIHRoYXQgc3VwcG9ydHMgYXN5bmNocm9ub3VzIGNhbGxiYWNrcy5cclxuICogWW91IGNhbiBjcmVhdGUgYSBuZXcgQXN5bmNEZWxlZ2F0ZSwgcmVnaXN0ZXIgdGhlIGFzeW5jaHJvbm91cyBjYWxsYmFjaywgYW5kIHdhaXQgdW50aWwgdGhlIGNvcnJlc3BvbmRpbmcgdGltZSB0byBkaXNwYXRjaCB0aGUgZXZlbnQuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGBgYHRzXHJcbiAqIGNvbnN0IGFkID0gbmV3IEFzeW5jRGVsZWdhdGUoKTtcclxuICogYWQuYWRkKCgpID0+IHtcclxuICogICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAqICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICogICAgICAgICAgICBjb25zb2xlLmxvZygnaGVsbG8gd29ybGQnKTtcclxuICogICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAqICAgICAgICB9LCAxMDAwKTtcclxuICogICAgIH0pXHJcbiAqIH0pO1xyXG4gKiBhd2FpdCBhZC5kaXNwYXRjaCgpO1xyXG4gKiBgYGBcclxuICovXHJcbmV4cG9ydCBjbGFzcyBBc3luY0RlbGVnYXRlPFQgZXh0ZW5kcyAoLi4uYXJnczogYW55KSA9PiAoUHJvbWlzZTx2b2lkPiB8IHZvaWQpID0gKCkgPT4gKFByb21pc2U8dm9pZD4gfCB2b2lkKT4ge1xyXG4gICAgcHJpdmF0ZSBfZGVsZWdhdGVzOiBUW10gPSBbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBlblxyXG4gICAgICogQWRkIGFuIGFzeW5jIGNhbGxiYWNrIG9yIHN5bmMgY2FsbGJhY2suXHJcbiAgICAgKlxyXG4gICAgICogQHpoXHJcbiAgICAgKiDmt7vliqDkuIDkuKrlvILmraXlm57osIPmiJblkIzmraXlm57osIPjgIJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqIEBlbiBUaGUgY2FsbGJhY2sgdG8gYWRkLCBhbmQgd2lsbCBiZSBpbnZva2VkIHdoZW4gdGhpcyBkZWxlZ2F0ZSBpcyBkaXNwYXRjaGluZy5cclxuICAgICAqIEB6aCDopoHmt7vliqDnmoTlm57osIPvvIzlubblsIblnKjor6Xlp5TmiZjosIPluqbml7booqvosIPnlKjjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZChjYWxsYmFjazogVCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fZGVsZWdhdGVzLmluY2x1ZGVzKGNhbGxiYWNrKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9kZWxlZ2F0ZXMucHVzaChjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHpoXHJcbiAgICAgKiDmn6Xor6LmmK/lkKblt7Lms6jlhozmn5DkuKrlm57osIPjgIJcclxuICAgICAqIEBlblxyXG4gICAgICogUXVlcmllcyBpZiBhIGNhbGxiYWNrIGhhcyBiZWVuIHJlZ2lzdGVyZWQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIEBlbiBUaGUgY2FsbGJhY2sgdG8gcXVlcnkuIEB6aCDopoHmn6Xor6LnmoTlm57osIPlh73mlbDjgIJcclxuICAgICAqIEByZXR1cm5zIEBlbiBXaGV0aGVyIHRoZSBjYWxsYmFjayBoYXMgYmVlbiBhZGRlZC4gQHpoIOaYr+WQpuW3sue7j+a3u+WKoOS6huWbnuiwg+OAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaGFzTGlzdGVuZXIoY2FsbGJhY2s6IFQpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGVzLmluY2x1ZGVzKGNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBlblxyXG4gICAgICogUmVtb3ZlIHRoZSBzcGVjaWZpYyBjYWxsYmFjayBvZiB0aGlzIGRlbGVnYXRlLlxyXG4gICAgICpcclxuICAgICAqIEB6aFxyXG4gICAgICog56e76Zmk5q2k5Luj55CG5Lit5p+Q5Liq5YW35L2T55qE5Zue6LCD44CCXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIEBlbiBUaGUgY2FsbGJhY2sgdG8gcmVtb3ZlLiBAemgg6KaB56e76Zmk55qE5p+Q5Liq5Zue6LCD44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZW1vdmUoY2FsbGJhY2s6IFQpIHtcclxuICAgICAgICBmYXN0UmVtb3ZlKHRoaXMuX2RlbGVnYXRlcywgY2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGVuXHJcbiAgICAgKiBEaXNwYXRjaGluZyB0aGUgZGVsZWdhdGUgZXZlbnQuIFRoaXMgZnVuY3Rpb24gd2lsbCB0cmlnZ2VyIGFsbCBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgY2FsbGJhY2tzIGFuZCBkb2VzIG5vdCBndWFyYW50ZWUgZXhlY3V0aW9uIG9yZGVyLlxyXG4gICAgICpcclxuICAgICAqIEB6aFxyXG4gICAgICog5rS+5Y+R5Luj55CG5LqL5Lu244CC5q2k5Ye95pWw5Lya6Kem5Y+R5omA5pyJ5LmL5YmN5rOo5YaM55qE5Zue6LCD77yM5bm25LiU5LiN5L+d6K+B5omn6KGM6aG65bqP44CCXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGFyZ3MgQGVuIFRoZSBwYXJhbWV0ZXJzIHRvIGJlIHRyYW5zZmVycmVkIHRvIGNhbGxiYWNrLiBAemgg5Lyg6YCS57uZ5Zue6LCD5Ye95pWw55qE5Y+C5pWw44CCXHJcbiAgICAgKiBAcmV0dXJucyBAZW4gVGhlIHByb21pc2UgYXdhaXRpbmcgYWxsIGFzeW5jIGNhbGxiYWNrIHJlc29sdmVkLiBAemgg562J5b6F5omA5pyJ5byC5q2l5Zue6LCD57uT5p2f55qEIFByb21pc2Ug5a+56LGh44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBkaXNwYXRjaCguLi5hcmdzOiBQYXJhbWV0ZXJzPFQ+KSB7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHRoaXMuX2RlbGVnYXRlcy5tYXAoKGZ1bmMpID0+IGZ1bmMoLi4uYXJndW1lbnRzKSkuZmlsdGVyKEJvb2xlYW4pKTtcclxuICAgIH1cclxufVxyXG4iXX0=