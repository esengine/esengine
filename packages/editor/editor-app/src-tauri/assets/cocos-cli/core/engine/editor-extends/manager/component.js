'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const node_path_manager_1 = __importDefault(require("./node-path-manager"));
class ComponentManager extends events_1.EventEmitter {
    allow = false;
    // ---- 组件菜单相关 ----
    // 引擎内注册的 menu 列表
    _menus = [];
    _pathToUuid = new Map();
    _uuidToPath = new Map();
    /**
     * 添加一个组件的菜单项
     * @param component
     * @param path
     * @param priority
     */
    addMenu(component, path, priority) {
        if (priority === undefined) {
            priority = -1;
        }
        this._menus.push({
            menuPath: path,
            component,
            priority,
        });
        this.emit('add-menu', path);
    }
    /**
     * 删除一个组件的菜单项
     * @param component
     */
    removeMenu(component) {
        for (let i = 0; i < this._menus.length; i++) {
            if (this._menus[i].component !== component) {
                continue;
            }
            const item = this._menus[i];
            this._menus.splice(i--, 1);
            this.emit('delete-menu', item.menuPath);
        }
    }
    /**
     * 查询已经注册的组件菜单项
     */
    getMenus() {
        return this._menus;
    }
    // ---- 组件实例管理 ----
    // component
    _map = {};
    // 被删除的 component
    // _recycle: {[index: string]: any} = {};
    /**
     * 新增一个组件
     * 1. 调用Node的addComponent时会调用此方法
     * 2. Node添加到场景树时，会遍历身上的组件调用此方法
     * @param uuid
     * @param component
     */
    add(uuid, component) {
        if (!this.allow) {
            return;
        }
        this._map[uuid] = component;
        this._mapComponentToPath(component);
        try {
            this.emit('add', uuid, component);
        }
        catch (error) {
            console.error(error);
        }
    }
    _mapComponentToPath(component) {
        const path = this._generateUniquePath(component);
        this._pathToUuid.set(path, component.uuid);
        this._uuidToPath.set(component.uuid, path);
    }
    _generateUniquePath(component) {
        const className = cc.js.getClassName(component);
        const nodeComponents = component.node.getComponents(className);
        const nodePath = node_path_manager_1.default.getNodePath(component.node.uuid);
        return `${nodePath}/${className}_${nodeComponents.length}`;
    }
    /**
     * 删除一个组件
     * 1. 调用Node的_removeComponent时会调用此方法,removeComponent会在下一帧调用_removeComponent,
     * removeComponent会调用一些Component的生命周期函数，而_removeComponent不会。
     * 2. Node添加到场景树时，会遍历身上的组件调用此方法
     * @param uuid
     */
    remove(uuid) {
        if (!this.allow) {
            return;
        }
        if (!this._map[uuid]) {
            return;
        }
        const comp = this._map[uuid];
        // this._recycle[uuid] = this._map[uuid];
        delete this._map[uuid];
        try {
            this.emit('remove', uuid, comp);
        }
        catch (error) {
            console.error(error);
        }
    }
    /**
     * 清空全部数据
     */
    clear() {
        if (!this.allow) {
            return;
        }
        this._map = {};
        // this._recycle = {};
    }
    /**
     * 获取一个指定的组件
     * @param uuid
     */
    getComponent(uuid) {
        return this._map[uuid] || null;
    }
    getComponentFromPath(path) {
        const uuid = this._pathToUuid.get(path);
        if (!uuid) {
            return null;
        }
        return this.getComponent(uuid);
    }
    getPathFromUuid(uuid) {
        return this._uuidToPath.get(uuid) || '';
    }
    /**
     * 获取所有的组件数据
     */
    getComponents() {
        return this._map;
    }
    changeUUID(oldUUID, newUUID) {
        if (oldUUID === newUUID) {
            return;
        }
        const comp = this._map[oldUUID];
        if (!comp) {
            return;
        }
        comp._id = newUUID;
        this._map[newUUID] = comp;
        delete this._map[oldUUID];
    }
}
exports.default = ComponentManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvZW5naW5lL2VkaXRvci1leHRlbmRzL21hbmFnZXIvY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7QUFFYixtQ0FBc0M7QUFDdEMsNEVBQThDO0FBUTlDLE1BQXFCLGdCQUFpQixTQUFRLHFCQUFZO0lBRXRELEtBQUssR0FBRyxLQUFLLENBQUM7SUFFZCxtQkFBbUI7SUFFbkIsaUJBQWlCO0lBQ2pCLE1BQU0sR0FBZSxFQUFFLENBQUM7SUFDeEIsV0FBVyxHQUF3QixJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQzdDLFdBQVcsR0FBd0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUU3Qzs7Ozs7T0FLRztJQUNILE9BQU8sQ0FBQyxTQUFtQixFQUFFLElBQVksRUFBRSxRQUFpQjtRQUN4RCxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN6QixRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbEIsQ0FBQztRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2IsUUFBUSxFQUFFLElBQUk7WUFDZCxTQUFTO1lBQ1QsUUFBUTtTQUNYLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxVQUFVLENBQUMsU0FBbUI7UUFDMUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDMUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDekMsU0FBUztZQUNiLENBQUM7WUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM1QyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNKLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQsbUJBQW1CO0lBRW5CLFlBQVk7SUFDWixJQUFJLEdBQTZCLEVBQUUsQ0FBQztJQUVwQyxpQkFBaUI7SUFDakIseUNBQXlDO0lBRXpDOzs7Ozs7T0FNRztJQUNILEdBQUcsQ0FBQyxJQUFZLEVBQUUsU0FBYztRQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2QsT0FBTztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQztRQUU1QixJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFcEMsSUFBSSxDQUFDO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QixDQUFDO0lBQ0wsQ0FBQztJQUVELG1CQUFtQixDQUFDLFNBQWM7UUFDOUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsbUJBQW1CLENBQUMsU0FBYztRQUM5QixNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoRCxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvRCxNQUFNLFFBQVEsR0FBRywyQkFBVyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlELE9BQU8sR0FBRyxRQUFRLElBQUksU0FBUyxJQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUMvRCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsTUFBTSxDQUFDLElBQVk7UUFDZixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2QsT0FBTztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ25CLE9BQU87UUFDWCxDQUFDO1FBQ0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3Qix5Q0FBeUM7UUFDekMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQztZQUNELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekIsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUs7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2QsT0FBTztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNmLHNCQUFzQjtJQUUxQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsWUFBWSxDQUFDLElBQVk7UUFDckIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztJQUNuQyxDQUFDO0lBRUQsb0JBQW9CLENBQUMsSUFBWTtRQUM3QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDUixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxlQUFlLENBQUMsSUFBWTtRQUN4QixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM1QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxhQUFhO1FBQ1QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxVQUFVLENBQUMsT0FBZSxFQUFFLE9BQWU7UUFDdkMsSUFBSSxPQUFPLEtBQUssT0FBTyxFQUFFLENBQUM7WUFDdEIsT0FBTztRQUNYLENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNSLE9BQU87UUFDWCxDQUFDO1FBRUQsSUFBSSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUM7UUFFbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDMUIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLENBQUM7Q0FDSjtBQTVLRCxtQ0E0S0MiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xyXG5pbXBvcnQgcGF0aE1hbmFnZXIgZnJvbSAnLi9ub2RlLXBhdGgtbWFuYWdlcic7XHJcblxyXG5pbnRlcmZhY2UgTWVudUl0ZW0ge1xyXG4gICAgY29tcG9uZW50OiBGdW5jdGlvbixcclxuICAgIG1lbnVQYXRoOiBzdHJpbmcsXHJcbiAgICBwcmlvcml0eTogbnVtYmVyLFxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21wb25lbnRNYW5hZ2VyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuXHJcbiAgICBhbGxvdyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIC0tLS0g57uE5Lu26I+c5Y2V55u45YWzIC0tLS1cclxuXHJcbiAgICAvLyDlvJXmk47lhoXms6jlhoznmoQgbWVudSDliJfooahcclxuICAgIF9tZW51czogTWVudUl0ZW1bXSA9IFtdO1xyXG4gICAgX3BhdGhUb1V1aWQ6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKCk7XHJcbiAgICBfdXVpZFRvUGF0aDogTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOS4gOS4que7hOS7tueahOiPnOWNlemhuVxyXG4gICAgICogQHBhcmFtIGNvbXBvbmVudCBcclxuICAgICAqIEBwYXJhbSBwYXRoIFxyXG4gICAgICogQHBhcmFtIHByaW9yaXR5IFxyXG4gICAgICovXHJcbiAgICBhZGRNZW51KGNvbXBvbmVudDogRnVuY3Rpb24sIHBhdGg6IHN0cmluZywgcHJpb3JpdHk/OiBudW1iZXIpIHtcclxuICAgICAgICBpZiAocHJpb3JpdHkgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBwcmlvcml0eSA9IC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9tZW51cy5wdXNoKHtcclxuICAgICAgICAgICAgbWVudVBhdGg6IHBhdGgsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudCxcclxuICAgICAgICAgICAgcHJpb3JpdHksXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5lbWl0KCdhZGQtbWVudScsIHBhdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yig6Zmk5LiA5Liq57uE5Lu255qE6I+c5Y2V6aG5XHJcbiAgICAgKiBAcGFyYW0gY29tcG9uZW50IFxyXG4gICAgICovXHJcbiAgICByZW1vdmVNZW51KGNvbXBvbmVudDogRnVuY3Rpb24pIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX21lbnVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tZW51c1tpXS5jb21wb25lbnQgIT09IGNvbXBvbmVudCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuX21lbnVzW2ldO1xyXG4gICAgICAgICAgICB0aGlzLl9tZW51cy5zcGxpY2UoaS0tLCAxKTtcclxuICAgICAgICAgICAgdGhpcy5lbWl0KCdkZWxldGUtbWVudScsIGl0ZW0ubWVudVBhdGgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOafpeivouW3sue7j+azqOWGjOeahOe7hOS7tuiPnOWNlemhuVxyXG4gICAgICovXHJcbiAgICBnZXRNZW51cygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWVudXM7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLSDnu4Tku7blrp7kvovnrqHnkIYgLS0tLVxyXG5cclxuICAgIC8vIGNvbXBvbmVudFxyXG4gICAgX21hcDogeyBbaW5kZXg6IHN0cmluZ106IGFueSB9ID0ge307XHJcblxyXG4gICAgLy8g6KKr5Yig6Zmk55qEIGNvbXBvbmVudFxyXG4gICAgLy8gX3JlY3ljbGU6IHtbaW5kZXg6IHN0cmluZ106IGFueX0gPSB7fTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOaWsOWinuS4gOS4que7hOS7tlxyXG4gICAgICogMS4g6LCD55SoTm9kZeeahGFkZENvbXBvbmVudOaXtuS8muiwg+eUqOatpOaWueazlVxyXG4gICAgICogMi4gTm9kZea3u+WKoOWIsOWcuuaZr+agkeaXtu+8jOS8mumBjeWOhui6q+S4iueahOe7hOS7tuiwg+eUqOatpOaWueazlVxyXG4gICAgICogQHBhcmFtIHV1aWQgXHJcbiAgICAgKiBAcGFyYW0gY29tcG9uZW50IFxyXG4gICAgICovXHJcbiAgICBhZGQodXVpZDogc3RyaW5nLCBjb21wb25lbnQ6IGFueSkge1xyXG4gICAgICAgIGlmICghdGhpcy5hbGxvdykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX21hcFt1dWlkXSA9IGNvbXBvbmVudDtcclxuXHJcbiAgICAgICAgdGhpcy5fbWFwQ29tcG9uZW50VG9QYXRoKGNvbXBvbmVudCk7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnYWRkJywgdXVpZCwgY29tcG9uZW50KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX21hcENvbXBvbmVudFRvUGF0aChjb21wb25lbnQ6IGFueSkge1xyXG4gICAgICAgIGNvbnN0IHBhdGggPSB0aGlzLl9nZW5lcmF0ZVVuaXF1ZVBhdGgoY29tcG9uZW50KTtcclxuICAgICAgICB0aGlzLl9wYXRoVG9VdWlkLnNldChwYXRoLCBjb21wb25lbnQudXVpZCk7XHJcbiAgICAgICAgdGhpcy5fdXVpZFRvUGF0aC5zZXQoY29tcG9uZW50LnV1aWQsIHBhdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIF9nZW5lcmF0ZVVuaXF1ZVBhdGgoY29tcG9uZW50OiBhbnkpIHtcclxuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSBjYy5qcy5nZXRDbGFzc05hbWUoY29tcG9uZW50KTtcclxuICAgICAgICBjb25zdCBub2RlQ29tcG9uZW50cyA9IGNvbXBvbmVudC5ub2RlLmdldENvbXBvbmVudHMoY2xhc3NOYW1lKTtcclxuICAgICAgICBjb25zdCBub2RlUGF0aCA9IHBhdGhNYW5hZ2VyLmdldE5vZGVQYXRoKGNvbXBvbmVudC5ub2RlLnV1aWQpO1xyXG4gICAgICAgIHJldHVybiBgJHtub2RlUGF0aH0vJHtjbGFzc05hbWV9XyR7bm9kZUNvbXBvbmVudHMubGVuZ3RofWA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliKDpmaTkuIDkuKrnu4Tku7ZcclxuICAgICAqIDEuIOiwg+eUqE5vZGXnmoRfcmVtb3ZlQ29tcG9uZW505pe25Lya6LCD55So5q2k5pa55rOVLHJlbW92ZUNvbXBvbmVudOS8muWcqOS4i+S4gOW4p+iwg+eUqF9yZW1vdmVDb21wb25lbnQsXHJcbiAgICAgKiByZW1vdmVDb21wb25lbnTkvJrosIPnlKjkuIDkuptDb21wb25lbnTnmoTnlJ/lkb3lkajmnJ/lh73mlbDvvIzogIxfcmVtb3ZlQ29tcG9uZW505LiN5Lya44CCXHJcbiAgICAgKiAyLiBOb2Rl5re75Yqg5Yiw5Zy65pmv5qCR5pe277yM5Lya6YGN5Y6G6Lqr5LiK55qE57uE5Lu26LCD55So5q2k5pa55rOVXHJcbiAgICAgKiBAcGFyYW0gdXVpZCBcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlKHV1aWQ6IHN0cmluZykge1xyXG4gICAgICAgIGlmICghdGhpcy5hbGxvdykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5fbWFwW3V1aWRdKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY29tcCA9IHRoaXMuX21hcFt1dWlkXTtcclxuICAgICAgICAvLyB0aGlzLl9yZWN5Y2xlW3V1aWRdID0gdGhpcy5fbWFwW3V1aWRdO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9tYXBbdXVpZF07XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmUnLCB1dWlkLCBjb21wKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmuIXnqbrlhajpg6jmlbDmja5cclxuICAgICAqL1xyXG4gICAgY2xlYXIoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmFsbG93KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbWFwID0ge307XHJcbiAgICAgICAgLy8gdGhpcy5fcmVjeWNsZSA9IHt9O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluS4gOS4quaMh+WumueahOe7hOS7tlxyXG4gICAgICogQHBhcmFtIHV1aWQgXHJcbiAgICAgKi9cclxuICAgIGdldENvbXBvbmVudCh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWFwW3V1aWRdIHx8IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q29tcG9uZW50RnJvbVBhdGgocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgdXVpZCA9IHRoaXMuX3BhdGhUb1V1aWQuZ2V0KHBhdGgpO1xyXG4gICAgICAgIGlmICghdXVpZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29tcG9uZW50KHV1aWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFBhdGhGcm9tVXVpZCh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdXVpZFRvUGF0aC5nZXQodXVpZCkgfHwgJyc7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmiYDmnInnmoTnu4Tku7bmlbDmja5cclxuICAgICAqL1xyXG4gICAgZ2V0Q29tcG9uZW50cygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWFwO1xyXG4gICAgfVxyXG5cclxuICAgIGNoYW5nZVVVSUQob2xkVVVJRDogc3RyaW5nLCBuZXdVVUlEOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAob2xkVVVJRCA9PT0gbmV3VVVJRCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjb21wID0gdGhpcy5fbWFwW29sZFVVSURdO1xyXG4gICAgICAgIGlmICghY29tcCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb21wLl9pZCA9IG5ld1VVSUQ7XHJcblxyXG4gICAgICAgIHRoaXMuX21hcFtuZXdVVUlEXSA9IGNvbXA7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX21hcFtvbGRVVUlEXTtcclxuICAgIH1cclxufVxyXG4iXX0=