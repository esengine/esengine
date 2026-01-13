'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class ScriptManager extends events_1.EventEmitter {
    allow = false;
    _map = {};
    /**
     * 将一个 ctor 放到一个脚本注册 class 的数组里
     * @param uuid
     * @param ctor
     */
    add(uuid, ctor) {
        if (!this.allow) {
            return;
        }
        this._map[uuid] = this._map[uuid] || [];
        const index = this._map[uuid].indexOf(ctor);
        if (index !== -1) {
            return;
        }
        this._map[uuid].push(ctor);
    }
    /**
     * 在 uuid 指向的脚本 ctor 数组里删除对应的 ctor
     * @param uuid
     * @param ctor
     */
    remove(uuid, ctor) {
        if (!this.allow) {
            return;
        }
        if (!this._map[uuid]) {
            return;
        }
        const index = this._map[uuid].indexOf(ctor);
        if (index === -1) {
            return;
        }
        this._map[uuid].splice(index);
    }
    /**
     * 获取指定模块内注册的 class 列表
     * @param uuid
     */
    getCtors(uuid) {
        return (this._map[uuid] || []).slice();
    }
}
exports.default = ScriptManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvZW5naW5lL2VkaXRvci1leHRlbmRzL21hbmFnZXIvc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixtQ0FBc0M7QUFFdEMsTUFBcUIsYUFBYyxTQUFRLHFCQUFZO0lBRW5ELEtBQUssR0FBRyxLQUFLLENBQUM7SUFFZCxJQUFJLEdBQWtDLEVBQUUsQ0FBQTtJQUV4Qzs7OztPQUlHO0lBQ0gsR0FBRyxDQUFDLElBQVksRUFBRSxJQUFjO1FBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZCxPQUFPO1FBQ1gsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDeEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNmLE9BQU87UUFDWCxDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsSUFBWSxFQUFFLElBQWM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNkLE9BQU87UUFDWCxDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNuQixPQUFPO1FBQ1gsQ0FBQztRQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDZixPQUFPO1FBQ1gsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxRQUFRLENBQUMsSUFBWTtRQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0NBQ0o7QUFsREQsZ0NBa0RDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjcmlwdE1hbmFnZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG5cclxuICAgIGFsbG93ID0gZmFsc2U7XHJcblxyXG4gICAgX21hcDoge1tpbmRleDogc3RyaW5nXTogRnVuY3Rpb25bXX0gPSB7fVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5bCG5LiA5LiqIGN0b3Ig5pS+5Yiw5LiA5Liq6ISa5pys5rOo5YaMIGNsYXNzIOeahOaVsOe7hOmHjFxyXG4gICAgICogQHBhcmFtIHV1aWQgXHJcbiAgICAgKiBAcGFyYW0gY3RvciBcclxuICAgICAqL1xyXG4gICAgYWRkKHV1aWQ6IHN0cmluZywgY3RvcjogRnVuY3Rpb24pIHtcclxuICAgICAgICBpZiAoIXRoaXMuYWxsb3cpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9tYXBbdXVpZF0gPSB0aGlzLl9tYXBbdXVpZF0gfHwgW107XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9tYXBbdXVpZF0uaW5kZXhPZihjdG9yKTtcclxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbWFwW3V1aWRdLnB1c2goY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlnKggdXVpZCDmjIflkJHnmoTohJrmnKwgY3RvciDmlbDnu4Tph4zliKDpmaTlr7nlupTnmoQgY3RvclxyXG4gICAgICogQHBhcmFtIHV1aWQgXHJcbiAgICAgKiBAcGFyYW0gY3RvciBcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlKHV1aWQ6IHN0cmluZywgY3RvcjogRnVuY3Rpb24pIHtcclxuICAgICAgICBpZiAoIXRoaXMuYWxsb3cpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuX21hcFt1dWlkXSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuX21hcFt1dWlkXS5pbmRleE9mKGN0b3IpO1xyXG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9tYXBbdXVpZF0uc3BsaWNlKGluZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluaMh+WumuaooeWdl+WGheazqOWGjOeahCBjbGFzcyDliJfooahcclxuICAgICAqIEBwYXJhbSB1dWlkIFxyXG4gICAgICovXHJcbiAgICBnZXRDdG9ycyh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX21hcFt1dWlkXSB8fCBbXSkuc2xpY2UoKTtcclxuICAgIH1cclxufVxyXG4iXX0=