'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallbacksInvoker = void 0;
const createMap = cc.js.createMap;
const fastRemoveAt = cc.js.array.fastRemoveAt;
const pool_1 = __importDefault(require("./pool"));
function empty() { }
class CallbackInfo {
    callback = empty;
    target = undefined;
    once = false;
    off;
    set(callback, target, once, off) {
        this.callback = callback;
        this.target = target;
        this.once = !!once;
        this.off = off;
    }
}
const callbackInfoPool = new pool_1.default(() => {
    return new CallbackInfo();
}, 32);
class CallbackList {
    callbackInfos = [];
    isInvoking = false;
    containCanceled = false;
    /**
     * @zh
     * 从列表中移除与指定目标相同回调函数的事件。
     * @param cb - 指定回调函数
     */
    removeByCallback(cb) {
        for (let i = 0; i < this.callbackInfos.length; ++i) {
            const info = this.callbackInfos[i];
            if (info && info.callback === cb) {
                callbackInfoPool.free(info);
                fastRemoveAt(this.callbackInfos, i);
                --i;
            }
        }
    }
    /**
     * @zh
     * 从列表中移除与指定目标相同调用者的事件。
     * @param target - 指定调用者
     */
    removeByTarget(target) {
        for (let i = 0; i < this.callbackInfos.length; ++i) {
            const info = this.callbackInfos[i];
            if (info && info.target === target) {
                callbackInfoPool.free(info);
                fastRemoveAt(this.callbackInfos, i);
                --i;
            }
        }
    }
    /**
     * @zh
     * 移除指定编号事件。
     *
     * @param index - 指定编号。
     */
    cancel(index) {
        const info = this.callbackInfos[index];
        if (info) {
            callbackInfoPool.free(info);
            this.callbackInfos[index] = null;
        }
        this.containCanceled = true;
    }
    /**
     * @zh
     * 注销所有事件。
     */
    cancelAll() {
        for (let i = 0; i < this.callbackInfos.length; i++) {
            const info = this.callbackInfos[i];
            if (info) {
                callbackInfoPool.free(info);
                this.callbackInfos[i] = null;
            }
        }
        this.containCanceled = true;
    }
    // filter all removed callbacks and compact array
    purgeCanceled() {
        for (let i = this.callbackInfos.length - 1; i >= 0; --i) {
            const info = this.callbackInfos[i];
            if (!info) {
                fastRemoveAt(this.callbackInfos, i);
            }
        }
        this.containCanceled = false;
    }
    clear() {
        this.cancelAll();
        this.callbackInfos.length = 0;
        this.isInvoking = false;
        this.containCanceled = false;
    }
}
const MAX_SIZE = 16;
const callbackListPool = new pool_1.default(() => {
    return new CallbackList();
}, MAX_SIZE);
/**
 * @zh
 * CallbacksInvoker 用来根据 Key 管理事件监听器列表并调用回调方法。
 * @class CallbacksInvoker
 */
class CallbacksInvoker {
    _callbackTable = createMap(true);
    /**
     * @zh
     * 事件添加管理
     * @param key - 一个监听事件类型的字符串。
     * @param callback - 事件分派时将被调用的回调函数。
     * @param target
     * @param once - 是否只调用一次。
     */
    on(key, callback, target, once) {
        let list = this._callbackTable[key];
        if (!list) {
            list = this._callbackTable[key] = callbackListPool.alloc();
        }
        const info = callbackInfoPool.alloc();
        info.set(callback, target, once);
        list.callbackInfos.push(info);
    }
    /**
     * @zh
     * 检查指定事件是否已注册回调。
     *
     * @param key - 一个监听事件类型的字符串。
     * @param callback - 事件分派时将被调用的回调函数。
     * @param target - 调用回调的目标。
     * @return - 指定事件是否已注册回调。
     */
    hasEventListener(key, callback, target) {
        const list = this._callbackTable[key];
        if (!list) {
            return false;
        }
        // check any valid callback
        const infos = list.callbackInfos;
        if (!callback) {
            // Make sure no cancelled callbacks
            if (list.isInvoking) {
                for (const info of infos) {
                    if (info) {
                        return true;
                    }
                }
                return false;
            }
            else {
                return infos.length > 0;
            }
        }
        for (let i = 0; i < infos.length; ++i) {
            const info = infos[i];
            if (info && info.callback === callback && info.target === target) {
                return true;
            }
        }
        return false;
    }
    /**
     * @zh
     * 移除在特定事件类型中注册的所有回调或在某个目标中注册的所有回调。
     *
     * @param keyOrTarget - 要删除的事件键或要删除的目标。
     */
    removeAll(keyOrTarget) {
        if (typeof keyOrTarget === 'string') {
            // remove by key
            const list = this._callbackTable[keyOrTarget];
            if (list) {
                if (list.isInvoking) {
                    list.cancelAll();
                }
                else {
                    list.clear();
                    callbackListPool.free(list);
                    delete this._callbackTable[keyOrTarget];
                }
            }
        }
        else if (keyOrTarget) {
            // remove by target
            for (const key in this._callbackTable) {
                const list = this._callbackTable[key];
                if (list.isInvoking) {
                    const infos = list.callbackInfos;
                    for (let i = 0; i < infos.length; ++i) {
                        const info = infos[i];
                        if (info && info.target === keyOrTarget) {
                            list.cancel(i);
                        }
                    }
                }
                else {
                    list.removeByTarget(keyOrTarget);
                }
            }
        }
    }
    removeAllListeners() {
        Object.keys(this._callbackTable).forEach((key) => {
            this.removeAll(key);
        });
    }
    /**
     * @zh
     * 删除之前与同类型，回调，目标注册的回调。
     *
     * @param key - 一个监听事件类型的字符串。
     * @param callback - 移除指定注册回调。如果没有给，则删除全部同事件类型的监听。
     * @param target - 调用回调的目标。
     */
    off(key, callback, target) {
        const list = this._callbackTable[key];
        if (list) {
            const infos = list.callbackInfos;
            if (callback) {
                for (let i = 0; i < infos.length; ++i) {
                    const info = infos[i];
                    if (info && info.callback === callback && info.target === target) {
                        if (list.isInvoking) {
                            list.cancel(i);
                        }
                        else {
                            fastRemoveAt(infos, i);
                            callbackInfoPool.free(info);
                        }
                        break;
                    }
                }
            }
            else {
                this.removeAll(key);
            }
        }
    }
    /**
     * @zh
     * 事件派发
     *
     * @param key - 一个监听事件类型的字符串
     * @param args
     */
    emit(key, ...args) {
        const list = this._callbackTable[key];
        if (list) {
            const rootInvoker = !list.isInvoking;
            list.isInvoking = true;
            const infos = list.callbackInfos;
            for (let i = 0, len = infos.length; i < len; ++i) {
                const info = infos[i];
                if (info) {
                    const callback = info.callback;
                    const target = info.target;
                    // Pre off once callbacks to avoid influence on logic in callback
                    if (info.once) {
                        this.off(key, callback, target);
                    }
                    if (target) {
                        callback.call(target, ...args);
                    }
                    else {
                        callback(...args);
                    }
                }
            }
            if (rootInvoker) {
                list.isInvoking = false;
                if (list.containCanceled) {
                    list.purgeCanceled();
                }
            }
        }
    }
}
exports.CallbacksInvoker = CallbacksInvoker;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbGJhY2tzLWludm9rZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9zY2VuZS9zY2VuZS1wcm9jZXNzL3NlcnZpY2UvYXNzZXQvY2FsbGJhY2tzLWludm9rZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7QUFFYixNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQztBQUNsQyxNQUFNLFlBQVksR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7QUFDOUMsa0RBQTBCO0FBSTFCLFNBQVMsS0FBSyxLQUFJLENBQUM7QUFFbkIsTUFBTSxZQUFZO0lBQ1AsUUFBUSxHQUFhLEtBQUssQ0FBQztJQUMzQixNQUFNLEdBQXVCLFNBQVMsQ0FBQztJQUN2QyxJQUFJLEdBQUcsS0FBSyxDQUFDO0lBQ2IsR0FBRyxDQUF1QjtJQUUxQixHQUFHLENBQUMsUUFBa0IsRUFBRSxNQUFlLEVBQUUsSUFBYyxFQUFFLEdBQWM7UUFDMUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ25CLENBQUM7Q0FDSjtBQUVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxjQUFJLENBQUMsR0FBRyxFQUFFO0lBQ25DLE9BQU8sSUFBSSxZQUFZLEVBQUUsQ0FBQztBQUM5QixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFFUCxNQUFNLFlBQVk7SUFDUCxhQUFhLEdBQStCLEVBQUUsQ0FBQztJQUMvQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0lBQ25CLGVBQWUsR0FBRyxLQUFLLENBQUM7SUFFL0I7Ozs7T0FJRztJQUNJLGdCQUFnQixDQUFDLEVBQVk7UUFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDakQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLEVBQUUsRUFBRSxDQUFDO2dCQUMvQixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzVCLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxFQUFFLENBQUMsQ0FBQztZQUNSLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUNEOzs7O09BSUc7SUFDSSxjQUFjLENBQUMsTUFBYztRQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUNqRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFLENBQUM7Z0JBQ2pDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUIsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLEVBQUUsQ0FBQyxDQUFDO1lBQ1IsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMsS0FBYTtRQUN2QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLElBQUksSUFBSSxFQUFFLENBQUM7WUFDUCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDckMsQ0FBQztRQUNELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7O09BR0c7SUFDSSxTQUFTO1FBQ1osS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDakQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNQLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDakMsQ0FBQztRQUNMLENBQUM7UUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztJQUNoQyxDQUFDO0lBRUQsaURBQWlEO0lBQzFDLGFBQWE7UUFDaEIsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ3RELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNSLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLENBQUM7UUFDTCxDQUFDO1FBQ0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7SUFDakMsQ0FBQztJQUVNLEtBQUs7UUFDUixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO0lBQ2pDLENBQUM7Q0FDSjtBQUVELE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNwQixNQUFNLGdCQUFnQixHQUFHLElBQUksY0FBSSxDQUFlLEdBQUcsRUFBRTtJQUNqRCxPQUFPLElBQUksWUFBWSxFQUFFLENBQUM7QUFDOUIsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBTWI7Ozs7R0FJRztBQUNILE1BQWEsZ0JBQWdCO0lBQ2YsY0FBYyxHQUFtQixTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFM0Q7Ozs7Ozs7T0FPRztJQUNJLEVBQUUsQ0FBQyxHQUFXLEVBQUUsUUFBa0IsRUFBRSxNQUFlLEVBQUUsSUFBYztRQUN0RSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNSLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQy9ELENBQUM7UUFDRCxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0ksZ0JBQWdCLENBQUMsR0FBVyxFQUFFLFFBQW1CLEVBQUUsTUFBZTtRQUNyRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNSLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFRCwyQkFBMkI7UUFDM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUNqQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDWixtQ0FBbUM7WUFDbkMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ2xCLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ3ZCLElBQUksSUFBSSxFQUFFLENBQUM7d0JBQ1AsT0FBTyxJQUFJLENBQUM7b0JBQ2hCLENBQUM7Z0JBQ0wsQ0FBQztnQkFDRCxPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDO2lCQUFNLENBQUM7Z0JBQ0osT0FBTyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUM1QixDQUFDO1FBQ0wsQ0FBQztRQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDcEMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFLENBQUM7Z0JBQy9ELE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksU0FBUyxDQUFDLFdBQTRCO1FBQ3pDLElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDbEMsZ0JBQWdCO1lBQ2hCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDOUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDUCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDbEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNyQixDQUFDO3FCQUFNLENBQUM7b0JBQ0osSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNiLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDNUIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUM1QyxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7YUFBTSxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ3JCLG1CQUFtQjtZQUNuQixLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDcEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUUsQ0FBQztnQkFDdkMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQ2xCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7b0JBQ2pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7d0JBQ3BDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDdEIsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxXQUFXLEVBQUUsQ0FBQzs0QkFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDbkIsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7cUJBQU0sQ0FBQztvQkFDSixJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNyQyxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ00sa0JBQWtCO1FBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQzdDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUNJLEdBQUcsQ0FBQyxHQUFXLEVBQUUsUUFBbUIsRUFBRSxNQUFlO1FBQ3hELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEMsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNQLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDakMsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDWCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO29CQUNwQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RCLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFLENBQUM7d0JBQy9ELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDOzRCQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNuQixDQUFDOzZCQUFNLENBQUM7NEJBQ0osWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzs0QkFDdkIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNoQyxDQUFDO3dCQUNELE1BQU07b0JBQ1YsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksSUFBSSxDQUFDLEdBQVcsRUFBRSxHQUFHLElBQVc7UUFDbkMsTUFBTSxJQUFJLEdBQWlCLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFFLENBQUM7UUFDckQsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNQLE1BQU0sV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUNyQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUV2QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDL0MsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixJQUFJLElBQUksRUFBRSxDQUFDO29CQUNQLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQy9CLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7b0JBQzNCLGlFQUFpRTtvQkFDakUsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUNwQyxDQUFDO29CQUNELElBQUksTUFBTSxFQUFFLENBQUM7d0JBQ1QsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztvQkFDbkMsQ0FBQzt5QkFBTSxDQUFDO3dCQUNKLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO29CQUN0QixDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDZCxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztnQkFDeEIsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBQ3ZCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDekIsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBN0tELDRDQTZLQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IGNyZWF0ZU1hcCA9IGNjLmpzLmNyZWF0ZU1hcDtcclxuY29uc3QgZmFzdFJlbW92ZUF0ID0gY2MuanMuYXJyYXkuZmFzdFJlbW92ZUF0O1xyXG5pbXBvcnQgUG9vbCBmcm9tICcuL3Bvb2wnO1xyXG5cclxudHlwZSBDb25zdHJ1Y3RvcjxUID0ge30+ID0gbmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gVDtcclxuXHJcbmZ1bmN0aW9uIGVtcHR5KCkge31cclxuXHJcbmNsYXNzIENhbGxiYWNrSW5mbyB7XHJcbiAgICBwdWJsaWMgY2FsbGJhY2s6IEZ1bmN0aW9uID0gZW1wdHk7XHJcbiAgICBwdWJsaWMgdGFyZ2V0OiBPYmplY3QgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XHJcbiAgICBwdWJsaWMgb25jZSA9IGZhbHNlO1xyXG4gICAgcHVibGljIG9mZjogRnVuY3Rpb24gfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgcHVibGljIHNldChjYWxsYmFjazogRnVuY3Rpb24sIHRhcmdldD86IE9iamVjdCwgb25jZT86IGJvb2xlYW4sIG9mZj86IEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgICAgIHRoaXMub25jZSA9ICEhb25jZTtcclxuICAgICAgICB0aGlzLm9mZiA9IG9mZjtcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgY2FsbGJhY2tJbmZvUG9vbCA9IG5ldyBQb29sKCgpID0+IHtcclxuICAgIHJldHVybiBuZXcgQ2FsbGJhY2tJbmZvKCk7XHJcbn0sIDMyKTtcclxuXHJcbmNsYXNzIENhbGxiYWNrTGlzdCB7XHJcbiAgICBwdWJsaWMgY2FsbGJhY2tJbmZvczogQXJyYXk8Q2FsbGJhY2tJbmZvIHwgbnVsbD4gPSBbXTtcclxuICAgIHB1YmxpYyBpc0ludm9raW5nID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgY29udGFpbkNhbmNlbGVkID0gZmFsc2U7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAemhcclxuICAgICAqIOS7juWIl+ihqOS4reenu+mZpOS4juaMh+Wumuebruagh+ebuOWQjOWbnuiwg+WHveaVsOeahOS6i+S7tuOAglxyXG4gICAgICogQHBhcmFtIGNiIC0g5oyH5a6a5Zue6LCD5Ye95pWwXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZW1vdmVCeUNhbGxiYWNrKGNiOiBGdW5jdGlvbikge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jYWxsYmFja0luZm9zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSB0aGlzLmNhbGxiYWNrSW5mb3NbaV07XHJcbiAgICAgICAgICAgIGlmIChpbmZvICYmIGluZm8uY2FsbGJhY2sgPT09IGNiKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFja0luZm9Qb29sLmZyZWUoaW5mbyk7XHJcbiAgICAgICAgICAgICAgICBmYXN0UmVtb3ZlQXQodGhpcy5jYWxsYmFja0luZm9zLCBpKTtcclxuICAgICAgICAgICAgICAgIC0taTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQHpoXHJcbiAgICAgKiDku47liJfooajkuK3np7vpmaTkuI7mjIflrprnm67moIfnm7jlkIzosIPnlKjogIXnmoTkuovku7bjgIJcclxuICAgICAqIEBwYXJhbSB0YXJnZXQgLSDmjIflrprosIPnlKjogIVcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlbW92ZUJ5VGFyZ2V0KHRhcmdldDogT2JqZWN0KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNhbGxiYWNrSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5mbyA9IHRoaXMuY2FsbGJhY2tJbmZvc1tpXTtcclxuICAgICAgICAgICAgaWYgKGluZm8gJiYgaW5mby50YXJnZXQgPT09IHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2tJbmZvUG9vbC5mcmVlKGluZm8pO1xyXG4gICAgICAgICAgICAgICAgZmFzdFJlbW92ZUF0KHRoaXMuY2FsbGJhY2tJbmZvcywgaSk7XHJcbiAgICAgICAgICAgICAgICAtLWk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAemhcclxuICAgICAqIOenu+mZpOaMh+Wumue8luWPt+S6i+S7tuOAglxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBpbmRleCAtIOaMh+Wumue8luWPt+OAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY2FuY2VsKGluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCBpbmZvID0gdGhpcy5jYWxsYmFja0luZm9zW2luZGV4XTtcclxuICAgICAgICBpZiAoaW5mbykge1xyXG4gICAgICAgICAgICBjYWxsYmFja0luZm9Qb29sLmZyZWUoaW5mbyk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tJbmZvc1tpbmRleF0gPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvbnRhaW5DYW5jZWxlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAemhcclxuICAgICAqIOazqOmUgOaJgOacieS6i+S7tuOAglxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY2FuY2VsQWxsKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jYWxsYmFja0luZm9zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSB0aGlzLmNhbGxiYWNrSW5mb3NbaV07XHJcbiAgICAgICAgICAgIGlmIChpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFja0luZm9Qb29sLmZyZWUoaW5mbyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrSW5mb3NbaV0gPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY29udGFpbkNhbmNlbGVkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmaWx0ZXIgYWxsIHJlbW92ZWQgY2FsbGJhY2tzIGFuZCBjb21wYWN0IGFycmF5XHJcbiAgICBwdWJsaWMgcHVyZ2VDYW5jZWxlZCgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5jYWxsYmFja0luZm9zLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSB0aGlzLmNhbGxiYWNrSW5mb3NbaV07XHJcbiAgICAgICAgICAgIGlmICghaW5mbykge1xyXG4gICAgICAgICAgICAgICAgZmFzdFJlbW92ZUF0KHRoaXMuY2FsbGJhY2tJbmZvcywgaSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jb250YWluQ2FuY2VsZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xlYXIoKSB7XHJcbiAgICAgICAgdGhpcy5jYW5jZWxBbGwoKTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrSW5mb3MubGVuZ3RoID0gMDtcclxuICAgICAgICB0aGlzLmlzSW52b2tpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNvbnRhaW5DYW5jZWxlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBNQVhfU0laRSA9IDE2O1xyXG5jb25zdCBjYWxsYmFja0xpc3RQb29sID0gbmV3IFBvb2w8Q2FsbGJhY2tMaXN0PigoKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IENhbGxiYWNrTGlzdCgpO1xyXG59LCBNQVhfU0laRSk7XHJcblxyXG5pbnRlcmZhY2UgSUNhbGxiYWNrVGFibGUge1xyXG4gICAgW3g6IHN0cmluZ106IENhbGxiYWNrTGlzdCB8IHVuZGVmaW5lZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEB6aFxyXG4gKiBDYWxsYmFja3NJbnZva2VyIOeUqOadpeagueaNriBLZXkg566h55CG5LqL5Lu255uR5ZCs5Zmo5YiX6KGo5bm26LCD55So5Zue6LCD5pa55rOV44CCXHJcbiAqIEBjbGFzcyBDYWxsYmFja3NJbnZva2VyXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2FsbGJhY2tzSW52b2tlciB7XHJcbiAgICBwcm90ZWN0ZWQgX2NhbGxiYWNrVGFibGU6IElDYWxsYmFja1RhYmxlID0gY3JlYXRlTWFwKHRydWUpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHpoXHJcbiAgICAgKiDkuovku7bmt7vliqDnrqHnkIZcclxuICAgICAqIEBwYXJhbSBrZXkgLSDkuIDkuKrnm5HlkKzkuovku7bnsbvlnovnmoTlrZfnrKbkuLLjgIJcclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayAtIOS6i+S7tuWIhua0vuaXtuWwhuiiq+iwg+eUqOeahOWbnuiwg+WHveaVsOOAglxyXG4gICAgICogQHBhcmFtIHRhcmdldFxyXG4gICAgICogQHBhcmFtIG9uY2UgLSDmmK/lkKblj6rosIPnlKjkuIDmrKHjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIG9uKGtleTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24sIHRhcmdldD86IE9iamVjdCwgb25jZT86IGJvb2xlYW4pIHtcclxuICAgICAgICBsZXQgbGlzdCA9IHRoaXMuX2NhbGxiYWNrVGFibGVba2V5XTtcclxuICAgICAgICBpZiAoIWxpc3QpIHtcclxuICAgICAgICAgICAgbGlzdCA9IHRoaXMuX2NhbGxiYWNrVGFibGVba2V5XSA9IGNhbGxiYWNrTGlzdFBvb2wuYWxsb2MoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW5mbyA9IGNhbGxiYWNrSW5mb1Bvb2wuYWxsb2MoKTtcclxuICAgICAgICBpbmZvLnNldChjYWxsYmFjaywgdGFyZ2V0LCBvbmNlKTtcclxuICAgICAgICBsaXN0LmNhbGxiYWNrSW5mb3MucHVzaChpbmZvKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEB6aFxyXG4gICAgICog5qOA5p+l5oyH5a6a5LqL5Lu25piv5ZCm5bey5rOo5YaM5Zue6LCD44CCXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGtleSAtIOS4gOS4quebkeWQrOS6i+S7tuexu+Wei+eahOWtl+espuS4suOAglxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIC0g5LqL5Lu25YiG5rS+5pe25bCG6KKr6LCD55So55qE5Zue6LCD5Ye95pWw44CCXHJcbiAgICAgKiBAcGFyYW0gdGFyZ2V0IC0g6LCD55So5Zue6LCD55qE55uu5qCH44CCXHJcbiAgICAgKiBAcmV0dXJuIC0g5oyH5a6a5LqL5Lu25piv5ZCm5bey5rOo5YaM5Zue6LCD44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBoYXNFdmVudExpc3RlbmVyKGtleTogc3RyaW5nLCBjYWxsYmFjaz86IEZ1bmN0aW9uLCB0YXJnZXQ/OiBPYmplY3QpIHtcclxuICAgICAgICBjb25zdCBsaXN0ID0gdGhpcy5fY2FsbGJhY2tUYWJsZVtrZXldO1xyXG4gICAgICAgIGlmICghbGlzdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjaGVjayBhbnkgdmFsaWQgY2FsbGJhY2tcclxuICAgICAgICBjb25zdCBpbmZvcyA9IGxpc3QuY2FsbGJhY2tJbmZvcztcclxuICAgICAgICBpZiAoIWNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSBubyBjYW5jZWxsZWQgY2FsbGJhY2tzXHJcbiAgICAgICAgICAgIGlmIChsaXN0LmlzSW52b2tpbmcpIHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaW5mbyBvZiBpbmZvcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbmZvcy5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluZm9zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSBpbmZvc1tpXTtcclxuICAgICAgICAgICAgaWYgKGluZm8gJiYgaW5mby5jYWxsYmFjayA9PT0gY2FsbGJhY2sgJiYgaW5mby50YXJnZXQgPT09IHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHpoXHJcbiAgICAgKiDnp7vpmaTlnKjnibnlrprkuovku7bnsbvlnovkuK3ms6jlhoznmoTmiYDmnInlm57osIPmiJblnKjmn5DkuKrnm67moIfkuK3ms6jlhoznmoTmiYDmnInlm57osIPjgIJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ga2V5T3JUYXJnZXQgLSDopoHliKDpmaTnmoTkuovku7bplK7miJbopoHliKDpmaTnmoTnm67moIfjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlbW92ZUFsbChrZXlPclRhcmdldDogc3RyaW5nIHwgT2JqZWN0KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlPclRhcmdldCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgLy8gcmVtb3ZlIGJ5IGtleVxyXG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gdGhpcy5fY2FsbGJhY2tUYWJsZVtrZXlPclRhcmdldF07XHJcbiAgICAgICAgICAgIGlmIChsaXN0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobGlzdC5pc0ludm9raW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5jYW5jZWxBbGwoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrTGlzdFBvb2wuZnJlZShsaXN0KTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tUYWJsZVtrZXlPclRhcmdldF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGtleU9yVGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSBieSB0YXJnZXRcclxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy5fY2FsbGJhY2tUYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbGlzdCA9IHRoaXMuX2NhbGxiYWNrVGFibGVba2V5XSE7XHJcbiAgICAgICAgICAgICAgICBpZiAobGlzdC5pc0ludm9raW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5mb3MgPSBsaXN0LmNhbGxiYWNrSW5mb3M7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbmZvcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmZvID0gaW5mb3NbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvICYmIGluZm8udGFyZ2V0ID09PSBrZXlPclRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5jYW5jZWwoaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucmVtb3ZlQnlUYXJnZXQoa2V5T3JUYXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHVibGljIHJlbW92ZUFsbExpc3RlbmVycygpIHtcclxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLl9jYWxsYmFja1RhYmxlKS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVBbGwoa2V5KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQHpoXHJcbiAgICAgKiDliKDpmaTkuYvliY3kuI7lkIznsbvlnovvvIzlm57osIPvvIznm67moIfms6jlhoznmoTlm57osIPjgIJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ga2V5IC0g5LiA5Liq55uR5ZCs5LqL5Lu257G75Z6L55qE5a2X56ym5Liy44CCXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgLSDnp7vpmaTmjIflrprms6jlhozlm57osIPjgILlpoLmnpzmsqHmnInnu5nvvIzliJnliKDpmaTlhajpg6jlkIzkuovku7bnsbvlnovnmoTnm5HlkKzjgIJcclxuICAgICAqIEBwYXJhbSB0YXJnZXQgLSDosIPnlKjlm57osIPnmoTnm67moIfjgIJcclxuICAgICAqL1xyXG4gICAgcHVibGljIG9mZihrZXk6IHN0cmluZywgY2FsbGJhY2s/OiBGdW5jdGlvbiwgdGFyZ2V0PzogT2JqZWN0KSB7XHJcbiAgICAgICAgY29uc3QgbGlzdCA9IHRoaXMuX2NhbGxiYWNrVGFibGVba2V5XTtcclxuICAgICAgICBpZiAobGlzdCkge1xyXG4gICAgICAgICAgICBjb25zdCBpbmZvcyA9IGxpc3QuY2FsbGJhY2tJbmZvcztcclxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluZm9zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5mbyA9IGluZm9zW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmZvICYmIGluZm8uY2FsbGJhY2sgPT09IGNhbGxiYWNrICYmIGluZm8udGFyZ2V0ID09PSB0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxpc3QuaXNJbnZva2luZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5jYW5jZWwoaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYXN0UmVtb3ZlQXQoaW5mb3MsIGkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tJbmZvUG9vbC5mcmVlKGluZm8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQWxsKGtleSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAemhcclxuICAgICAqIOS6i+S7tua0vuWPkVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBrZXkgLSDkuIDkuKrnm5HlkKzkuovku7bnsbvlnovnmoTlrZfnrKbkuLJcclxuICAgICAqIEBwYXJhbSBhcmdzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBlbWl0KGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICAgIGNvbnN0IGxpc3Q6IENhbGxiYWNrTGlzdCA9IHRoaXMuX2NhbGxiYWNrVGFibGVba2V5XSE7XHJcbiAgICAgICAgaWYgKGxpc3QpIHtcclxuICAgICAgICAgICAgY29uc3Qgcm9vdEludm9rZXIgPSAhbGlzdC5pc0ludm9raW5nO1xyXG4gICAgICAgICAgICBsaXN0LmlzSW52b2tpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgaW5mb3MgPSBsaXN0LmNhbGxiYWNrSW5mb3M7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBpbmZvcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5mbyA9IGluZm9zW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYWxsYmFjayA9IGluZm8uY2FsbGJhY2s7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gaW5mby50YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJlIG9mZiBvbmNlIGNhbGxiYWNrcyB0byBhdm9pZCBpbmZsdWVuY2Ugb24gbG9naWMgaW4gY2FsbGJhY2tcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby5vbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2ZmKGtleSwgY2FsbGJhY2ssIHRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0YXJnZXQsIC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHJvb3RJbnZva2VyKSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0LmlzSW52b2tpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmIChsaXN0LmNvbnRhaW5DYW5jZWxlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVyZ2VDYW5jZWxlZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==