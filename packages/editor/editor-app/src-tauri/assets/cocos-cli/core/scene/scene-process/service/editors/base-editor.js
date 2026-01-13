"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEditor = void 0;
/**
 * 编辑器基类
 * 提供通用的编辑器功能和状态管理
 * @template TEditorAsset 编辑器处理的资产类型，如 IScene、INode 等
 * @template TEvents 事件类型
 */
class BaseEditor {
    /**
     * 当前打开的资源
     */
    entity = null;
    /**
     * reload 操作的 Promise，用于防止并发调用导致序列化失败
     * 所有调用者都等待这个 Promise，最终会得到基于最新数据的结果
     */
    _reloadPromise = null;
    /**
     * 标记是否有待处理的 reload 请求
     * 如果在一个 reload 执行期间有新的调用，设置此标志，确保最终基于最新数据执行
     */
    _pendingReload = false;
    getRootNode() {
        return this.entity ? this.entity.instance : null;
    }
    setCurrentOpen(entity) {
        this.entity = entity;
    }
    getIdentifier(assetInfo) {
        return {
            assetType: assetInfo.type,
            assetName: assetInfo.name,
            assetUuid: assetInfo.uuid,
            assetUrl: assetInfo.url,
        };
    }
    /**
     * 重载编辑器内容，提供并发保护
     * 如果已有 reload 正在执行，标记待处理标志，确保最终基于最新数据执行
     */
    async reload() {
        // 如果已有 reload 正在执行，标记需要重新执行，确保基于最新数据
        if (this._reloadPromise) {
            this._pendingReload = true;
            // 等待当前执行完成，最终会得到基于最新数据的结果
            return this._reloadPromise;
        }
        // 开始执行 reload
        return this._executeReload();
    }
    /**
     * 执行 reload 操作，支持自动重新执行以确保基于最新数据
     */
    async _executeReload() {
        // 创建新的 Promise，所有调用者都等待这个 Promise
        let resolveCurrent;
        let rejectCurrent;
        this._reloadPromise = new Promise((resolve, reject) => {
            resolveCurrent = resolve;
            rejectCurrent = reject;
        });
        // 执行实际的 reload 操作
        try {
            // 重置待处理标志
            this._pendingReload = false;
            // 执行 reload
            const result = await this._doReload();
            // 如果执行期间有新的 reload 请求，基于最新数据重新执行
            if (this._pendingReload) {
                // 递归执行，等待最新的结果
                const latestResult = await this._executeReload();
                // 解析当前 Promise 为最新结果
                resolveCurrent(latestResult);
                return latestResult;
            }
            else {
                // 没有待处理的请求，返回当前结果并清空 Promise
                resolveCurrent(result);
                this._reloadPromise = null;
                return result;
            }
        }
        catch (error) {
            // 如果出错，也要检查是否有待处理的请求
            if (this._pendingReload) {
                try {
                    // 尝试执行新的 reload，可能会成功
                    const latestResult = await this._executeReload();
                    resolveCurrent(latestResult);
                    return latestResult;
                }
                catch {
                    // 如果新的 reload 也失败，抛出原始错误
                    rejectCurrent(error);
                    this._reloadPromise = null;
                    throw error;
                }
            }
            else {
                // 没有待处理的请求，抛出错误并清空 Promise
                rejectCurrent(error);
                this._reloadPromise = null;
                throw error;
            }
        }
    }
}
exports.BaseEditor = BaseEditor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1lZGl0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9zY2VuZS9zY2VuZS1wcm9jZXNzL3NlcnZpY2UvZWRpdG9ycy9iYXNlLWVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQTs7Ozs7R0FLRztBQUNILE1BQXNCLFVBQVU7SUFDNUI7O09BRUc7SUFDTyxNQUFNLEdBQXlCLElBQUksQ0FBQztJQUU5Qzs7O09BR0c7SUFDTyxjQUFjLEdBQWtDLElBQUksQ0FBQztJQUUvRDs7O09BR0c7SUFDSyxjQUFjLEdBQVksS0FBSyxDQUFDO0lBRWpDLFdBQVc7UUFDZCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDckQsQ0FBQztJQUVNLGNBQWMsQ0FBQyxNQUE0QjtRQUM5QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRVMsYUFBYSxDQUFDLFNBQXFCO1FBQ3pDLE9BQU87WUFDSCxTQUFTLEVBQUUsU0FBUyxDQUFDLElBQUk7WUFDekIsU0FBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJO1lBQ3pCLFNBQVMsRUFBRSxTQUFTLENBQUMsSUFBSTtZQUN6QixRQUFRLEVBQUUsU0FBUyxDQUFDLEdBQUc7U0FDMUIsQ0FBQztJQUNOLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsTUFBTTtRQUNSLHFDQUFxQztRQUNyQyxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztZQUMzQiwwQkFBMEI7WUFDMUIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQy9CLENBQUM7UUFFRCxjQUFjO1FBQ2QsT0FBTyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVEOztPQUVHO0lBQ0ssS0FBSyxDQUFDLGNBQWM7UUFDeEIsa0NBQWtDO1FBQ2xDLElBQUksY0FBOEMsQ0FBQztRQUNuRCxJQUFJLGFBQXFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBZ0IsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDakUsY0FBYyxHQUFHLE9BQU8sQ0FBQztZQUN6QixhQUFhLEdBQUcsTUFBTSxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO1FBRUgsa0JBQWtCO1FBQ2xCLElBQUksQ0FBQztZQUNELFVBQVU7WUFDVixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztZQUU1QixZQUFZO1lBQ1osTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFFdEMsaUNBQWlDO1lBQ2pDLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN0QixlQUFlO2dCQUNmLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNqRCxxQkFBcUI7Z0JBQ3JCLGNBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDOUIsT0FBTyxZQUFZLENBQUM7WUFDeEIsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLDZCQUE2QjtnQkFDN0IsY0FBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN4QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztnQkFDM0IsT0FBTyxNQUFNLENBQUM7WUFDbEIsQ0FBQztRQUNMLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2IscUJBQXFCO1lBQ3JCLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUM7b0JBQ0Qsc0JBQXNCO29CQUN0QixNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDakQsY0FBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUM5QixPQUFPLFlBQVksQ0FBQztnQkFDeEIsQ0FBQztnQkFBQyxNQUFNLENBQUM7b0JBQ0wseUJBQXlCO29CQUN6QixhQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO29CQUMzQixNQUFNLEtBQUssQ0FBQztnQkFDaEIsQ0FBQztZQUNMLENBQUM7aUJBQU0sQ0FBQztnQkFDSiwyQkFBMkI7Z0JBQzNCLGFBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQzNCLE1BQU0sS0FBSyxDQUFDO1lBQ2hCLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQVlKO0FBckhELGdDQXFIQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgSUJhc2VJZGVudGlmaWVyLCBJQ3JlYXRlT3B0aW9ucywgSUVkaXRvclRhcmdldCwgVEVkaXRvckVudGl0eSwgVEVkaXRvckluc3RhbmNlIH0gZnJvbSAnLi4vLi4vLi4vY29tbW9uJztcclxuaW1wb3J0IHR5cGUgeyBJQXNzZXRJbmZvIH0gZnJvbSAnLi4vLi4vLi4vLi4vYXNzZXRzL0B0eXBlcy9wdWJsaWMnO1xyXG5cclxuLyoqXHJcbiAqIOe8lui+keWZqOWfuuexu1xyXG4gKiDmj5DkvpvpgJrnlKjnmoTnvJbovpHlmajlip/og73lkoznirbmgIHnrqHnkIZcclxuICogQHRlbXBsYXRlIFRFZGl0b3JBc3NldCDnvJbovpHlmajlpITnkIbnmoTotYTkuqfnsbvlnovvvIzlpoIgSVNjZW5l44CBSU5vZGUg562JXHJcbiAqIEB0ZW1wbGF0ZSBURXZlbnRzIOS6i+S7tuexu+Wei1xyXG4gKi9cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VFZGl0b3Ige1xyXG4gICAgLyoqXHJcbiAgICAgKiDlvZPliY3miZPlvIDnmoTotYTmupBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGVudGl0eTogSUVkaXRvclRhcmdldCB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVsb2FkIOaTjeS9nOeahCBQcm9taXNl77yM55So5LqO6Ziy5q2i5bm25Y+R6LCD55So5a+86Ie05bqP5YiX5YyW5aSx6LSlXHJcbiAgICAgKiDmiYDmnInosIPnlKjogIXpg73nrYnlvoXov5nkuKogUHJvbWlzZe+8jOacgOe7iOS8muW+l+WIsOWfuuS6juacgOaWsOaVsOaNrueahOe7k+aenFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3JlbG9hZFByb21pc2U6IFByb21pc2U8VEVkaXRvckVudGl0eT4gfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOagh+iusOaYr+WQpuacieW+heWkhOeQhueahCByZWxvYWQg6K+35rGCXHJcbiAgICAgKiDlpoLmnpzlnKjkuIDkuKogcmVsb2FkIOaJp+ihjOacn+mXtOacieaWsOeahOiwg+eUqO+8jOiuvue9ruatpOagh+W/l++8jOehruS/neacgOe7iOWfuuS6juacgOaWsOaVsOaNruaJp+ihjFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9wZW5kaW5nUmVsb2FkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHVibGljIGdldFJvb3ROb2RlKCk6IFRFZGl0b3JJbnN0YW5jZSB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVudGl0eSA/IHRoaXMuZW50aXR5Lmluc3RhbmNlIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0Q3VycmVudE9wZW4oZW50aXR5OiBJRWRpdG9yVGFyZ2V0IHwgbnVsbCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZW50aXR5ID0gZW50aXR5O1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRJZGVudGlmaWVyKGFzc2V0SW5mbzogSUFzc2V0SW5mbykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGFzc2V0VHlwZTogYXNzZXRJbmZvLnR5cGUsXHJcbiAgICAgICAgICAgIGFzc2V0TmFtZTogYXNzZXRJbmZvLm5hbWUsXHJcbiAgICAgICAgICAgIGFzc2V0VXVpZDogYXNzZXRJbmZvLnV1aWQsXHJcbiAgICAgICAgICAgIGFzc2V0VXJsOiBhc3NldEluZm8udXJsLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDph43ovb3nvJbovpHlmajlhoXlrrnvvIzmj5Dkvpvlubblj5Hkv53miqRcclxuICAgICAqIOWmguaenOW3suaciSByZWxvYWQg5q2j5Zyo5omn6KGM77yM5qCH6K6w5b6F5aSE55CG5qCH5b+X77yM56Gu5L+d5pyA57uI5Z+65LqO5pyA5paw5pWw5o2u5omn6KGMXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHJlbG9hZCgpOiBQcm9taXNlPFRFZGl0b3JFbnRpdHk+IHtcclxuICAgICAgICAvLyDlpoLmnpzlt7LmnIkgcmVsb2FkIOato+WcqOaJp+ihjO+8jOagh+iusOmcgOimgemHjeaWsOaJp+ihjO+8jOehruS/neWfuuS6juacgOaWsOaVsOaNrlxyXG4gICAgICAgIGlmICh0aGlzLl9yZWxvYWRQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3BlbmRpbmdSZWxvYWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyDnrYnlvoXlvZPliY3miafooYzlrozmiJDvvIzmnIDnu4jkvJrlvpfliLDln7rkuo7mnIDmlrDmlbDmja7nmoTnu5PmnpxcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlbG9hZFByb21pc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDlvIDlp4vmiafooYwgcmVsb2FkXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V4ZWN1dGVSZWxvYWQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaJp+ihjCByZWxvYWQg5pON5L2c77yM5pSv5oyB6Ieq5Yqo6YeN5paw5omn6KGM5Lul56Gu5L+d5Z+65LqO5pyA5paw5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgX2V4ZWN1dGVSZWxvYWQoKTogUHJvbWlzZTxURWRpdG9yRW50aXR5PiB7XHJcbiAgICAgICAgLy8g5Yib5bu65paw55qEIFByb21pc2XvvIzmiYDmnInosIPnlKjogIXpg73nrYnlvoXov5nkuKogUHJvbWlzZVxyXG4gICAgICAgIGxldCByZXNvbHZlQ3VycmVudDogKHZhbHVlOiBURWRpdG9yRW50aXR5KSA9PiB2b2lkO1xyXG4gICAgICAgIGxldCByZWplY3RDdXJyZW50OiAocmVhc29uPzogYW55KSA9PiB2b2lkO1xyXG4gICAgICAgIHRoaXMuX3JlbG9hZFByb21pc2UgPSBuZXcgUHJvbWlzZTxURWRpdG9yRW50aXR5PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHJlc29sdmVDdXJyZW50ID0gcmVzb2x2ZTtcclxuICAgICAgICAgICAgcmVqZWN0Q3VycmVudCA9IHJlamVjdDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8g5omn6KGM5a6e6ZmF55qEIHJlbG9hZCDmk43kvZxcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyDph43nva7lvoXlpITnkIbmoIflv5dcclxuICAgICAgICAgICAgdGhpcy5fcGVuZGluZ1JlbG9hZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8g5omn6KGMIHJlbG9hZFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9kb1JlbG9hZCgpO1xyXG5cclxuICAgICAgICAgICAgLy8g5aaC5p6c5omn6KGM5pyf6Ze05pyJ5paw55qEIHJlbG9hZCDor7fmsYLvvIzln7rkuo7mnIDmlrDmlbDmja7ph43mlrDmiafooYxcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3BlbmRpbmdSZWxvYWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIOmAkuW9kuaJp+ihjO+8jOetieW+heacgOaWsOeahOe7k+aenFxyXG4gICAgICAgICAgICAgICAgY29uc3QgbGF0ZXN0UmVzdWx0ID0gYXdhaXQgdGhpcy5fZXhlY3V0ZVJlbG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgLy8g6Kej5p6Q5b2T5YmNIFByb21pc2Ug5Li65pyA5paw57uT5p6cXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlQ3VycmVudCEobGF0ZXN0UmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBsYXRlc3RSZXN1bHQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyDmsqHmnInlvoXlpITnkIbnmoTor7fmsYLvvIzov5Tlm57lvZPliY3nu5PmnpzlubbmuIXnqbogUHJvbWlzZVxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZUN1cnJlbnQhKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWxvYWRQcm9taXNlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzlh7rplJnvvIzkuZ/opoHmo4Dmn6XmmK/lkKbmnInlvoXlpITnkIbnmoTor7fmsYJcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3BlbmRpbmdSZWxvYWQpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5bCd6K+V5omn6KGM5paw55qEIHJlbG9hZO+8jOWPr+iDveS8muaIkOWKn1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhdGVzdFJlc3VsdCA9IGF3YWl0IHRoaXMuX2V4ZWN1dGVSZWxvYWQoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlQ3VycmVudCEobGF0ZXN0UmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGF0ZXN0UmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c5paw55qEIHJlbG9hZCDkuZ/lpLHotKXvvIzmipvlh7rljp/lp4vplJnor69cclxuICAgICAgICAgICAgICAgICAgICByZWplY3RDdXJyZW50IShlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVsb2FkUHJvbWlzZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyDmsqHmnInlvoXlpITnkIbnmoTor7fmsYLvvIzmipvlh7rplJnor6/lubbmuIXnqbogUHJvbWlzZVxyXG4gICAgICAgICAgICAgICAgcmVqZWN0Q3VycmVudCEoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVsb2FkUHJvbWlzZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyDmir3osaHmlrnms5XvvIzlrZDnsbvlv4Xpobvlrp7njrBcclxuICAgIGFic3RyYWN0IGVuY29kZShlbnRpdHk/OiBJRWRpdG9yVGFyZ2V0KTogUHJvbWlzZTxURWRpdG9yRW50aXR5PjtcclxuICAgIGFic3RyYWN0IG9wZW4oYXNzZXQ6IElBc3NldEluZm8pOiBQcm9taXNlPFRFZGl0b3JFbnRpdHk+O1xyXG4gICAgYWJzdHJhY3QgY2xvc2UoKTogUHJvbWlzZTxib29sZWFuPjtcclxuICAgIGFic3RyYWN0IHNhdmUoKTogUHJvbWlzZTxJQXNzZXRJbmZvPjtcclxuICAgIC8qKlxyXG4gICAgICog5omn6KGM5a6e6ZmF55qE6YeN6L295pON5L2c77yM5a2Q57G76ZyA6KaB5a6e546w5YW35L2T55qE6YeN6L296YC76L6RXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBfZG9SZWxvYWQoKTogUHJvbWlzZTxURWRpdG9yRW50aXR5PjtcclxuICAgIGFic3RyYWN0IGNyZWF0ZShwYXJhbXM6IElDcmVhdGVPcHRpb25zKTogUHJvbWlzZTxJQmFzZUlkZW50aWZpZXI+O1xyXG59XHJcbiJdfQ==