"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.InteractiveConfig = void 0;
/**
 * 交互模式配置管理器
 */
class InteractiveConfig {
    static instance;
    interactiveMode = true;
    constructor() { }
    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!InteractiveConfig.instance) {
            InteractiveConfig.instance = new InteractiveConfig();
        }
        return InteractiveConfig.instance;
    }
    /**
     * 设置交互模式
     */
    setInteractiveMode(enabled) {
        this.interactiveMode = enabled;
    }
    /**
     * 检查是否启用交互模式
     */
    isInteractiveEnabled() {
        return this.interactiveMode;
    }
    /**
     * 检查是否应该显示 banner
     */
    shouldDisplayBanner() {
        return this.interactiveMode;
    }
    /**
     * 检查是否应该使用交互式组件
     */
    shouldUseInteractive() {
        return this.interactiveMode;
    }
    /**
     * 检查是否应该使用加载动画
     */
    shouldUseSpinner() {
        return this.interactiveMode;
    }
    /**
     * 检查是否应该使用进度条
     */
    shouldUseProgressBar() {
        return this.interactiveMode;
    }
}
exports.InteractiveConfig = InteractiveConfig;
// 导出单例实例
exports.config = InteractiveConfig.getInstance();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Rpc3BsYXkvY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOztHQUVHO0FBQ0gsTUFBYSxpQkFBaUI7SUFDbEIsTUFBTSxDQUFDLFFBQVEsQ0FBb0I7SUFDbkMsZUFBZSxHQUFZLElBQUksQ0FBQztJQUV4QyxnQkFBd0IsQ0FBQztJQUV6Qjs7T0FFRztJQUNILE1BQU0sQ0FBQyxXQUFXO1FBQ2QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzlCLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7UUFDekQsQ0FBQztRQUNELE9BQU8saUJBQWlCLENBQUMsUUFBUSxDQUFDO0lBQ3RDLENBQUM7SUFFRDs7T0FFRztJQUNILGtCQUFrQixDQUFDLE9BQWdCO1FBQy9CLElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDO0lBQ25DLENBQUM7SUFFRDs7T0FFRztJQUNILG9CQUFvQjtRQUNoQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7SUFDaEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsbUJBQW1CO1FBQ2YsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7T0FFRztJQUNILG9CQUFvQjtRQUNoQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7SUFDaEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZ0JBQWdCO1FBQ1osT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7T0FFRztJQUNILG9CQUFvQjtRQUNoQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7SUFDaEMsQ0FBQztDQUNKO0FBekRELDhDQXlEQztBQUVELFNBQVM7QUFDSSxRQUFBLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiDkuqTkupLmqKHlvI/phY3nva7nrqHnkIblmahcclxuICovXHJcbmV4cG9ydCBjbGFzcyBJbnRlcmFjdGl2ZUNvbmZpZyB7XHJcbiAgICBwcml2YXRlIHN0YXRpYyBpbnN0YW5jZTogSW50ZXJhY3RpdmVDb25maWc7XHJcbiAgICBwcml2YXRlIGludGVyYWN0aXZlTW9kZTogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5Y2V5L6L5a6e5L6LXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBJbnRlcmFjdGl2ZUNvbmZpZyB7XHJcbiAgICAgICAgaWYgKCFJbnRlcmFjdGl2ZUNvbmZpZy5pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICBJbnRlcmFjdGl2ZUNvbmZpZy5pbnN0YW5jZSA9IG5ldyBJbnRlcmFjdGl2ZUNvbmZpZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gSW50ZXJhY3RpdmVDb25maWcuaW5zdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7kuqTkupLmqKHlvI9cclxuICAgICAqL1xyXG4gICAgc2V0SW50ZXJhY3RpdmVNb2RlKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmludGVyYWN0aXZlTW9kZSA9IGVuYWJsZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6XmmK/lkKblkK/nlKjkuqTkupLmqKHlvI9cclxuICAgICAqL1xyXG4gICAgaXNJbnRlcmFjdGl2ZUVuYWJsZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJhY3RpdmVNb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qOA5p+l5piv5ZCm5bqU6K+l5pi+56S6IGJhbm5lclxyXG4gICAgICovXHJcbiAgICBzaG91bGREaXNwbGF5QmFubmVyKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmludGVyYWN0aXZlTW9kZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOajgOafpeaYr+WQpuW6lOivpeS9v+eUqOS6pOS6kuW8j+e7hOS7tlxyXG4gICAgICovXHJcbiAgICBzaG91bGRVc2VJbnRlcmFjdGl2ZSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmFjdGl2ZU1vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6XmmK/lkKblupTor6Xkvb/nlKjliqDovb3liqjnlLtcclxuICAgICAqL1xyXG4gICAgc2hvdWxkVXNlU3Bpbm5lcigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmFjdGl2ZU1vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6XmmK/lkKblupTor6Xkvb/nlKjov5vluqbmnaFcclxuICAgICAqL1xyXG4gICAgc2hvdWxkVXNlUHJvZ3Jlc3NCYXIoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJhY3RpdmVNb2RlO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyDlr7zlh7rljZXkvovlrp7kvotcclxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IEludGVyYWN0aXZlQ29uZmlnLmdldEluc3RhbmNlKCk7XHJcbiJdfQ==