"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimerUtil = void 0;
class TimerUtil {
    _timeInterval = 200;
    constructor(timeInterval) {
        this._timeInterval = timeInterval ?? 200;
    }
    _callWaitingMap = new Map();
    /**
     * 限制一个方法在一定时间内的调用次数
     * @param key 这个方法的一个唯一标识
     * @param func 方法
     * @param args 参数
     */
    callFunctionLimit(key, func, ...args) {
        let waitingData = this._callWaitingMap.get(key);
        let canCallFunc = false;
        if (waitingData) {
            if (!waitingData.waitingTimer) {
                canCallFunc = true;
            }
            else {
                waitingData.callFunc = func;
                waitingData.args = args;
                waitingData.needCallAfterWaiting = true;
            }
        }
        else {
            waitingData = {
                needCallAfterWaiting: false,
            };
            this._callWaitingMap.set(key, waitingData);
            canCallFunc = true;
        }
        if (canCallFunc) {
            func(...args);
            waitingData.waitingTimer = setTimeout(() => {
                if (waitingData) {
                    waitingData.waitingTimer = undefined;
                }
                if (waitingData && waitingData.needCallAfterWaiting) {
                    waitingData.needCallAfterWaiting = false;
                    if (waitingData.callFunc) {
                        const args = waitingData.args ?? [];
                        this.callFunctionLimit(key, waitingData.callFunc, ...args);
                    }
                }
            }, this._timeInterval);
        }
    }
    clear() {
        this._callWaitingMap.forEach((call) => {
            if (call.waitingTimer)
                clearTimeout(call.waitingTimer);
        });
        this._callWaitingMap.clear();
    }
}
exports.TimerUtil = TimerUtil;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXItdXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL3NjZW5lL3NjZW5lLXByb2Nlc3Mvc2VydmljZS9wcmVmYWIvdGltZXItdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFPQSxNQUFNLFNBQVM7SUFDSCxhQUFhLEdBQUcsR0FBRyxDQUFDO0lBQzVCLFlBQVksWUFBcUI7UUFDN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLElBQUksR0FBRyxDQUFDO0lBQzdDLENBQUM7SUFDTyxlQUFlLEdBQThCLElBQUksR0FBRyxFQUF3QixDQUFDO0lBRXJGOzs7OztPQUtHO0lBQ0ksaUJBQWlCLENBQUMsR0FBVyxFQUFFLElBQWMsRUFBRSxHQUFHLElBQVc7UUFDaEUsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFaEQsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQUksV0FBVyxFQUFFLENBQUM7WUFDZCxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUM1QixXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLENBQUM7aUJBQU0sQ0FBQztnQkFDSixXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDNUIsV0FBVyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ3hCLFdBQVcsQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7WUFDNUMsQ0FBQztRQUNMLENBQUM7YUFBTSxDQUFDO1lBQ0osV0FBVyxHQUFHO2dCQUNWLG9CQUFvQixFQUFFLEtBQUs7YUFDOUIsQ0FBQztZQUNGLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUMzQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDZCxXQUFXLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3ZDLElBQUksV0FBVyxFQUFFLENBQUM7b0JBQ2QsV0FBVyxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7Z0JBQ3pDLENBQUM7Z0JBRUQsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLG9CQUFvQixFQUFFLENBQUM7b0JBQ2xELFdBQVcsQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7b0JBQ3pDLElBQUksV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUN2QixNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQzt3QkFDcEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7b0JBQy9ELENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFM0IsQ0FBQztJQUNMLENBQUM7SUFFTSxLQUFLO1FBQ1IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNsQyxJQUFJLElBQUksQ0FBQyxZQUFZO2dCQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pDLENBQUM7Q0FDSjtBQUVRLDhCQUFTIiwic291cmNlc0NvbnRlbnQiOlsiaW50ZXJmYWNlIElXYWl0aW5nRGF0YSB7XHJcbiAgICBuZWVkQ2FsbEFmdGVyV2FpdGluZzogYm9vbGVhbjtcclxuICAgIGNhbGxGdW5jPzogRnVuY3Rpb247XHJcbiAgICBhcmdzPzogYW55W107XHJcbiAgICB3YWl0aW5nVGltZXI/OiBOb2RlSlMuVGltZW91dDtcclxufVxyXG5cclxuY2xhc3MgVGltZXJVdGlsIHtcclxuICAgIHByaXZhdGUgX3RpbWVJbnRlcnZhbCA9IDIwMDtcclxuICAgIGNvbnN0cnVjdG9yKHRpbWVJbnRlcnZhbD86IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX3RpbWVJbnRlcnZhbCA9IHRpbWVJbnRlcnZhbCA/PyAyMDA7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIF9jYWxsV2FpdGluZ01hcDogTWFwPHN0cmluZywgSVdhaXRpbmdEYXRhPiA9IG5ldyBNYXA8c3RyaW5nLCBJV2FpdGluZ0RhdGE+KCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpmZDliLbkuIDkuKrmlrnms5XlnKjkuIDlrprml7bpl7TlhoXnmoTosIPnlKjmrKHmlbBcclxuICAgICAqIEBwYXJhbSBrZXkg6L+Z5Liq5pa55rOV55qE5LiA5Liq5ZSv5LiA5qCH6K+GXHJcbiAgICAgKiBAcGFyYW0gZnVuYyDmlrnms5VcclxuICAgICAqIEBwYXJhbSBhcmdzIOWPguaVsFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY2FsbEZ1bmN0aW9uTGltaXQoa2V5OiBzdHJpbmcsIGZ1bmM6IEZ1bmN0aW9uLCAuLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICAgIGxldCB3YWl0aW5nRGF0YSA9IHRoaXMuX2NhbGxXYWl0aW5nTWFwLmdldChrZXkpO1xyXG5cclxuICAgICAgICBsZXQgY2FuQ2FsbEZ1bmMgPSBmYWxzZTtcclxuICAgICAgICBpZiAod2FpdGluZ0RhdGEpIHtcclxuICAgICAgICAgICAgaWYgKCF3YWl0aW5nRGF0YS53YWl0aW5nVGltZXIpIHtcclxuICAgICAgICAgICAgICAgIGNhbkNhbGxGdW5jID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHdhaXRpbmdEYXRhLmNhbGxGdW5jID0gZnVuYztcclxuICAgICAgICAgICAgICAgIHdhaXRpbmdEYXRhLmFyZ3MgPSBhcmdzO1xyXG4gICAgICAgICAgICAgICAgd2FpdGluZ0RhdGEubmVlZENhbGxBZnRlcldhaXRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgd2FpdGluZ0RhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBuZWVkQ2FsbEFmdGVyV2FpdGluZzogZmFsc2UsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuX2NhbGxXYWl0aW5nTWFwLnNldChrZXksIHdhaXRpbmdEYXRhKTtcclxuICAgICAgICAgICAgY2FuQ2FsbEZ1bmMgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNhbkNhbGxGdW5jKSB7XHJcbiAgICAgICAgICAgIGZ1bmMoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHdhaXRpbmdEYXRhLndhaXRpbmdUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdhaXRpbmdEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2FpdGluZ0RhdGEud2FpdGluZ1RpbWVyID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh3YWl0aW5nRGF0YSAmJiB3YWl0aW5nRGF0YS5uZWVkQ2FsbEFmdGVyV2FpdGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIHdhaXRpbmdEYXRhLm5lZWRDYWxsQWZ0ZXJXYWl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdhaXRpbmdEYXRhLmNhbGxGdW5jKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSB3YWl0aW5nRGF0YS5hcmdzID8/IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxGdW5jdGlvbkxpbWl0KGtleSwgd2FpdGluZ0RhdGEuY2FsbEZ1bmMsIC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgdGhpcy5fdGltZUludGVydmFsKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGVhcigpIHtcclxuICAgICAgICB0aGlzLl9jYWxsV2FpdGluZ01hcC5mb3JFYWNoKChjYWxsKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjYWxsLndhaXRpbmdUaW1lcikgY2xlYXJUaW1lb3V0KGNhbGwud2FpdGluZ1RpbWVyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9jYWxsV2FpdGluZ01hcC5jbGVhcigpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgeyBUaW1lclV0aWwgfTtcclxuIl19