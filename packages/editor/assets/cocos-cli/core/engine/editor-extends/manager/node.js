'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const ObjectWalker = __importStar(require("../missing-reporter/object-walker"));
const utils_1 = __importDefault(require("../../../base/utils"));
const node_path_manager_1 = __importDefault(require("./node-path-manager"));
const lodash = require('lodash');
class NodeManager extends events_1.EventEmitter {
    // 当前在场景树中的节点集合,包括在层级管理器中隐藏的
    allow = false;
    _map = {};
    _parentChildren = new Map(); // 父节点UUID -> 子节点UUID集合
    // 被删除节点集合,为了undo，编辑器不会把Node删除
    // _recycle: { [index: string]: any } = {};
    /**
     * 新增一个节点，当引擎将一个节点添加到场景树中，同时会遍历子节点，递归的调用这个方法。
     * @param uuid
     * @param node
     */
    add(uuid, node) {
        if (!this.allow) {
            return;
        }
        this._map[uuid] = node;
        const parentUuid = node.parent ? node.parent.uuid : undefined;
        // 生成唯一路径
        node_path_manager_1.default.generateUniquePath(uuid, node.name, parentUuid);
        // 维护父子关系
        if (parentUuid) {
            if (!this._parentChildren.has(parentUuid)) {
                this._parentChildren.set(parentUuid, new Set());
            }
            this._parentChildren.get(parentUuid).add(uuid);
        }
        try {
            this.emit('add', uuid, node);
        }
        catch (error) {
            console.error(error);
        }
    }
    /**
     * 删除一个节点，当引擎将一个节点从场景树中移除，同时会遍历子节点，递归的调用这个方法。
     * @param uuid
     */
    remove(uuid) {
        if (!this.allow) {
            return;
        }
        if (!this._map[uuid]) {
            return;
        }
        const node = this._map[uuid];
        node_path_manager_1.default.remove(uuid);
        // 清理父子关系
        this._cleanupParentRelations(uuid);
        // this._recycle[uuid] = this._map[uuid];
        delete this._map[uuid];
        try {
            this.emit('remove', uuid, node);
        }
        catch (error) {
            console.error(error);
        }
    }
    /**
     * 清空所有数据
     */
    clear() {
        if (!this.allow) {
            return;
        }
        this._map = {};
        node_path_manager_1.default.clear();
        this._parentChildren.clear();
        // this._recycle = {};
    }
    /**
     * 更新节点名称和路径
     */
    updateNodeName(uuid, newName) {
        if (!this._map[uuid]) {
            return;
        }
        const node = this._map[uuid];
        // 获取父节点UUID
        const parentUuid = this._getParentUuid(uuid);
        node_path_manager_1.default.updateUuid(uuid, newName, parentUuid);
        // 更新节点名称计数
        if (parentUuid) {
            this._updateNameCount(parentUuid, node.name, newName);
        }
        // 更新节点对象的名称
        node.name = newName;
    }
    /**
     * 获取一个节点数据，查的范围包括被删除的节点
     * @param uuid
     */
    getNode(uuid) {
        return this._map[uuid] ?? null;
    }
    getNodeByPath(path) {
        const uuid = node_path_manager_1.default.getNodeUuid(path);
        if (uuid) {
            return this.getNode(uuid);
        }
        return null;
    }
    getNodePath(node) {
        return node_path_manager_1.default.getNodePath(node.uuid);
    }
    getNodeUuidByPath(path) {
        const uuid = node_path_manager_1.default.getNodeUuid(path);
        const node = uuid && this.getNode(uuid);
        return node ? node.uuid : null;
    }
    getNodeByPathOrThrow(path) {
        const node = this.getNodeByPath(path);
        if (!node) {
            throw new Error(`找不到路径为 '${path}' 的节点`);
        }
        return node;
    }
    getNodeUuidByPathOrThrow(nodePath) {
        const nodeUuid = this.getNodeUuidByPath(nodePath);
        if (!nodeUuid) {
            throw new Error(`找不到路径为 "${nodePath}" 的节点`);
        }
        return nodeUuid;
    }
    /**
     * 获取所有的节点数据
     */
    getNodes() {
        return this._map;
    }
    /**
     * 获取场景中使用了某个资源的节点
     * @param uuid asset uuid
     */
    getNodesByAsset(uuid) {
        const nodesUuid = [];
        if (!uuid) {
            return nodesUuid;
        }
        ObjectWalker.walkProperties(cc.director.getScene().children, (obj, key, value, parsedObjects) => {
            let isAsset = false;
            if (value._uuid) {
                isAsset = value._uuid.includes(uuid) || utils_1.default.UUID.compressUUID(value._uuid, true).includes(uuid);
            }
            let isScript = false;
            if (value.__scriptUuid) {
                isScript = value.__scriptUuid.includes(uuid) || utils_1.default.UUID.compressUUID(value.__scriptUuid, false).includes(uuid);
            }
            if (isAsset || isScript) {
                const node = lodash.findLast(parsedObjects, (item) => item instanceof cc.Node);
                if (node && !nodesUuid.includes(node.uuid)) {
                    nodesUuid.push(node.uuid);
                }
            }
        }, {
            dontSkipNull: false,
            ignoreSubPrefabHelper: true,
        });
        return nodesUuid;
    }
    /**
     * 获取所有在场景树中的节点数据
     */
    getNodesInScene() {
        return this._map;
    }
    changeNodeUUID(oldUUID, newUUID) {
        if (oldUUID === newUUID) {
            return;
        }
        const node = this._map[oldUUID];
        if (!node) {
            return;
        }
        node._id = newUUID;
        // 更新节点路径
        node_path_manager_1.default.changeUuid(oldUUID, newUUID);
        this._map[newUUID] = node;
        delete this._map[oldUUID];
    }
    /**
    * 获取节点的父节点UUID
    */
    _getParentUuid(uuid) {
        for (const [parentUuid, children] of this._parentChildren.entries()) {
            if (children.has(uuid)) {
                return parentUuid;
            }
        }
    }
    /**
     * 清理父子关系
     */
    _cleanupParentRelations(uuid) {
        // 从父节点中移除
        const parentUuid = this._getParentUuid(uuid);
        if (parentUuid) {
            this._parentChildren.get(parentUuid)?.delete(uuid);
            this._updateNameCount(parentUuid, this._map[uuid]?.name, null);
        }
        // 递归清理所有子节点
        const children = this._parentChildren.get(uuid);
        if (children) {
            for (const childUuid of children) {
                this.remove(childUuid);
            }
            this._parentChildren.delete(uuid);
        }
    }
    /**
     * 更新名称计数
     */
    _updateNameCount(parentUuid, oldName, newName) {
        const nameMap = node_path_manager_1.default.getNameMap(parentUuid);
        if (!nameMap) {
            return;
        }
        // 减少旧名称的计数
        if (oldName && nameMap.has(oldName)) {
            const count = nameMap.get(oldName);
            if (count > 1) {
                nameMap.set(oldName, count - 1);
            }
            else {
                nameMap.delete(oldName);
            }
        }
        // 增加新名称的计数
        if (newName) {
            if (!nameMap.has(newName)) {
                nameMap.set(newName, 1);
            }
            else {
                nameMap.set(newName, nameMap.get(newName) + 1);
            }
        }
    }
}
exports.default = NodeManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2VuZ2luZS9lZGl0b3ItZXh0ZW5kcy9tYW5hZ2VyL25vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdiLG1DQUFzQztBQUV0QyxnRkFBa0U7QUFDbEUsZ0VBQXdDO0FBQ3hDLDRFQUE4QztBQUU5QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFakMsTUFBcUIsV0FBWSxTQUFRLHFCQUFZO0lBQ2pELDRCQUE0QjtJQUM1QixLQUFLLEdBQUcsS0FBSyxDQUFDO0lBRWQsSUFBSSxHQUE2QixFQUFFLENBQUM7SUFFNUIsZUFBZSxHQUE2QixJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsdUJBQXVCO0lBRXRGLDhCQUE4QjtJQUM5QiwyQ0FBMkM7SUFFM0M7Ozs7T0FJRztJQUNILEdBQUcsQ0FBQyxJQUFZLEVBQUUsSUFBVTtRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2QsT0FBTztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUV2QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzlELFNBQVM7UUFDVCwyQkFBVyxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRTVELFNBQVM7UUFDVCxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENB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QUFDO1lBQ3BDLENBQUM7aUJBQU0sQ0FBQztnQkFDSixPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVCLENBQUM7UUFDTCxDQUFDO1FBRUQsV0FBVztRQUNYLElBQUksT0FBTyxFQUFFLENBQUM7WUFDVixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QixDQUFDO2lCQUFNLENBQUM7Z0JBQ0osT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNwRCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQXpSRCw4QkF5UkMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgdHlwZSB7IE5vZGUgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XHJcblxyXG5pbXBvcnQgKiBhcyBPYmplY3RXYWxrZXIgZnJvbSAnLi4vbWlzc2luZy1yZXBvcnRlci9vYmplY3Qtd2Fsa2VyJztcclxuaW1wb3J0IHV0aWxzIGZyb20gJy4uLy4uLy4uL2Jhc2UvdXRpbHMnO1xyXG5pbXBvcnQgcGF0aE1hbmFnZXIgZnJvbSAnLi9ub2RlLXBhdGgtbWFuYWdlcic7XHJcblxyXG5jb25zdCBsb2Rhc2ggPSByZXF1aXJlKCdsb2Rhc2gnKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5vZGVNYW5hZ2VyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuICAgIC8vIOW9k+WJjeWcqOWcuuaZr+agkeS4reeahOiKgueCuembhuWQiCzljIXmi6zlnKjlsYLnuqfnrqHnkIblmajkuK3pmpDol4/nmoRcclxuICAgIGFsbG93ID0gZmFsc2U7XHJcblxyXG4gICAgX21hcDogeyBbaW5kZXg6IHN0cmluZ106IGFueSB9ID0ge307XHJcblxyXG4gICAgcHJpdmF0ZSBfcGFyZW50Q2hpbGRyZW46IE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+PiA9IG5ldyBNYXAoKTsgLy8g54i26IqC54K5VVVJRCAtPiDlrZDoioLngrlVVUlE6ZuG5ZCIXHJcblxyXG4gICAgLy8g6KKr5Yig6Zmk6IqC54K56ZuG5ZCILOS4uuS6hnVuZG/vvIznvJbovpHlmajkuI3kvJrmiopOb2Rl5Yig6ZmkXHJcbiAgICAvLyBfcmVjeWNsZTogeyBbaW5kZXg6IHN0cmluZ106IGFueSB9ID0ge307XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmlrDlop7kuIDkuKroioLngrnvvIzlvZPlvJXmk47lsIbkuIDkuKroioLngrnmt7vliqDliLDlnLrmma/moJHkuK3vvIzlkIzml7bkvJrpgY3ljoblrZDoioLngrnvvIzpgJLlvZLnmoTosIPnlKjov5nkuKrmlrnms5XjgIJcclxuICAgICAqIEBwYXJhbSB1dWlkXHJcbiAgICAgKiBAcGFyYW0gbm9kZVxyXG4gICAgICovXHJcbiAgICBhZGQodXVpZDogc3RyaW5nLCBub2RlOiBOb2RlKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmFsbG93KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbWFwW3V1aWRdID0gbm9kZTtcclxuXHJcbiAgICAgICAgY29uc3QgcGFyZW50VXVpZCA9IG5vZGUucGFyZW50ID8gbm9kZS5wYXJlbnQudXVpZCA6IHVuZGVmaW5lZDtcclxuICAgICAgICAvLyDnlJ/miJDllK/kuIDot6/lvoRcclxuICAgICAgICBwYXRoTWFuYWdlci5nZW5lcmF0ZVVuaXF1ZVBhdGgodXVpZCwgbm9kZS5uYW1lLCBwYXJlbnRVdWlkKTtcclxuXHJcbiAgICAgICAgLy8g57u05oqk54i25a2Q5YWz57O7XHJcbiAgICAgICAgaWYgKHBhcmVudFV1aWQpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9wYXJlbnRDaGlsZHJlbi5oYXMocGFyZW50VXVpZCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BhcmVudENoaWxkcmVuLnNldChwYXJlbnRVdWlkLCBuZXcgU2V0KCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudENoaWxkcmVuLmdldChwYXJlbnRVdWlkKSEuYWRkKHV1aWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy5lbWl0KCdhZGQnLCB1dWlkLCBub2RlKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliKDpmaTkuIDkuKroioLngrnvvIzlvZPlvJXmk47lsIbkuIDkuKroioLngrnku47lnLrmma/moJHkuK3np7vpmaTvvIzlkIzml7bkvJrpgY3ljoblrZDoioLngrnvvIzpgJLlvZLnmoTosIPnlKjov5nkuKrmlrnms5XjgIJcclxuICAgICAqIEBwYXJhbSB1dWlkXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZSh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIXRoaXMuYWxsb3cpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuX21hcFt1dWlkXSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9tYXBbdXVpZF07XHJcblxyXG4gICAgICAgIHBhdGhNYW5hZ2VyLnJlbW92ZSh1dWlkKTtcclxuXHJcbiAgICAgICAgLy8g5riF55CG54i25a2Q5YWz57O7XHJcbiAgICAgICAgdGhpcy5fY2xlYW51cFBhcmVudFJlbGF0aW9ucyh1dWlkKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5fcmVjeWNsZVt1dWlkXSA9IHRoaXMuX21hcFt1dWlkXTtcclxuICAgICAgICBkZWxldGUgdGhpcy5fbWFwW3V1aWRdO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlJywgdXVpZCwgbm9kZSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5riF56m65omA5pyJ5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIGNsZWFyKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5hbGxvdykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX21hcCA9IHt9O1xyXG4gICAgICAgIHBhdGhNYW5hZ2VyLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5fcGFyZW50Q2hpbGRyZW4uY2xlYXIoKTtcclxuICAgICAgICAvLyB0aGlzLl9yZWN5Y2xlID0ge307XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pu05paw6IqC54K55ZCN56ew5ZKM6Lev5b6EXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZU5vZGVOYW1lKHV1aWQ6IHN0cmluZywgbmV3TmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9tYXBbdXVpZF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuX21hcFt1dWlkXTtcclxuXHJcbiAgICAgICAgLy8g6I635Y+W54i26IqC54K5VVVJRFxyXG4gICAgICAgIGNvbnN0IHBhcmVudFV1aWQgPSB0aGlzLl9nZXRQYXJlbnRVdWlkKHV1aWQpO1xyXG4gICAgICAgIHBhdGhNYW5hZ2VyLnVwZGF0ZVV1aWQodXVpZCwgbmV3TmFtZSwgcGFyZW50VXVpZCk7XHJcbiAgICAgICAgLy8g5pu05paw6IqC54K55ZCN56ew6K6h5pWwXHJcbiAgICAgICAgaWYgKHBhcmVudFV1aWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlTmFtZUNvdW50KHBhcmVudFV1aWQsIG5vZGUubmFtZSwgbmV3TmFtZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDmm7TmlrDoioLngrnlr7nosaHnmoTlkI3np7BcclxuICAgICAgICBub2RlLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5LiA5Liq6IqC54K55pWw5o2u77yM5p+l55qE6IyD5Zu05YyF5ous6KKr5Yig6Zmk55qE6IqC54K5XHJcbiAgICAgKiBAcGFyYW0gdXVpZFxyXG4gICAgICovXHJcbiAgICBnZXROb2RlKHV1aWQ6IHN0cmluZyk6IE5vZGUgfCBudWxsIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWFwW3V1aWRdID8/IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Tm9kZUJ5UGF0aChwYXRoOiBzdHJpbmcpOiBOb2RlIHwgbnVsbCB7XHJcbiAgICAgICAgY29uc3QgdXVpZCA9IHBhdGhNYW5hZ2VyLmdldE5vZGVVdWlkKHBhdGgpO1xyXG4gICAgICAgIGlmICh1dWlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE5vZGUodXVpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE5vZGVQYXRoKG5vZGU6IE5vZGUpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBwYXRoTWFuYWdlci5nZXROb2RlUGF0aChub2RlLnV1aWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE5vZGVVdWlkQnlQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIGNvbnN0IHV1aWQgPSBwYXRoTWFuYWdlci5nZXROb2RlVXVpZChwYXRoKTtcclxuICAgICAgICBjb25zdCBub2RlID0gdXVpZCAmJiB0aGlzLmdldE5vZGUodXVpZCk7XHJcbiAgICAgICAgcmV0dXJuIG5vZGUgPyBub2RlLnV1aWQgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE5vZGVCeVBhdGhPclRocm93KHBhdGg6IHN0cmluZyk6IE5vZGUge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldE5vZGVCeVBhdGgocGF0aCk7XHJcbiAgICAgICAgaWYgKCFub2RlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihg5om+5LiN5Yiw6Lev5b6E5Li6ICcke3BhdGh9JyDnmoToioLngrlgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Tm9kZVV1aWRCeVBhdGhPclRocm93KG5vZGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IG5vZGVVdWlkID0gdGhpcy5nZXROb2RlVXVpZEJ5UGF0aChub2RlUGF0aCk7XHJcbiAgICAgICAgaWYgKCFub2RlVXVpZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYOaJvuS4jeWIsOi3r+W+hOS4uiBcIiR7bm9kZVBhdGh9XCIg55qE6IqC54K5YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBub2RlVXVpZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluaJgOacieeahOiKgueCueaVsOaNrlxyXG4gICAgICovXHJcbiAgICBnZXROb2RlcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWFwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5Zy65pmv5Lit5L2/55So5LqG5p+Q5Liq6LWE5rqQ55qE6IqC54K5XHJcbiAgICAgKiBAcGFyYW0gdXVpZCBhc3NldCB1dWlkXHJcbiAgICAgKi9cclxuICAgIGdldE5vZGVzQnlBc3NldCh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBub2Rlc1V1aWQ6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgICAgIGlmICghdXVpZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZXNVdWlkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgT2JqZWN0V2Fsa2VyLndhbGtQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICBjYy5kaXJlY3Rvci5nZXRTY2VuZSgpLmNoaWxkcmVuLFxyXG4gICAgICAgICAgICAob2JqOiBhbnksIGtleTogYW55LCB2YWx1ZTogYW55LCBwYXJzZWRPYmplY3RzOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBpc0Fzc2V0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUuX3V1aWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpc0Fzc2V0ID0gdmFsdWUuX3V1aWQuaW5jbHVkZXModXVpZCkgfHwgdXRpbHMuVVVJRC5jb21wcmVzc1VVSUQodmFsdWUuX3V1aWQsIHRydWUpLmluY2x1ZGVzKHV1aWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBpc1NjcmlwdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlLl9fc2NyaXB0VXVpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzU2NyaXB0ID0gdmFsdWUuX19zY3JpcHRVdWlkLmluY2x1ZGVzKHV1aWQpIHx8IHV0aWxzLlVVSUQuY29tcHJlc3NVVUlEKHZhbHVlLl9fc2NyaXB0VXVpZCwgZmFsc2UpLmluY2x1ZGVzKHV1aWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc0Fzc2V0IHx8IGlzU2NyaXB0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IGxvZGFzaC5maW5kTGFzdChwYXJzZWRPYmplY3RzLCAoaXRlbTogYW55KSA9PiBpdGVtIGluc3RhbmNlb2YgY2MuTm9kZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlICYmICFub2Rlc1V1aWQuaW5jbHVkZXMobm9kZS51dWlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1V1aWQucHVzaChub2RlLnV1aWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZG9udFNraXBOdWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGlnbm9yZVN1YlByZWZhYkhlbHBlcjogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gbm9kZXNVdWlkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5omA5pyJ5Zyo5Zy65pmv5qCR5Lit55qE6IqC54K55pWw5o2uXHJcbiAgICAgKi9cclxuICAgIGdldE5vZGVzSW5TY2VuZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWFwO1xyXG4gICAgfVxyXG5cclxuICAgIGNoYW5nZU5vZGVVVUlEKG9sZFVVSUQ6IHN0cmluZywgbmV3VVVJRDogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKG9sZFVVSUQgPT09IG5ld1VVSUQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuX21hcFtvbGRVVUlEXTtcclxuICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbm9kZS5faWQgPSBuZXdVVUlEO1xyXG5cclxuICAgICAgICAvLyDmm7TmlrDoioLngrnot6/lvoRcclxuICAgICAgICBwYXRoTWFuYWdlci5jaGFuZ2VVdWlkKG9sZFVVSUQsIG5ld1VVSUQpO1xyXG5cclxuICAgICAgICB0aGlzLl9tYXBbbmV3VVVJRF0gPSBub2RlO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9tYXBbb2xkVVVJRF07XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgKiDojrflj5boioLngrnnmoTniLboioLngrlVVUlEXHJcbiAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZ2V0UGFyZW50VXVpZCh1dWlkOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGZvciAoY29uc3QgW3BhcmVudFV1aWQsIGNoaWxkcmVuXSBvZiB0aGlzLl9wYXJlbnRDaGlsZHJlbi5lbnRyaWVzKCkpIHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmhhcyh1dWlkKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcmVudFV1aWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmuIXnkIbniLblrZDlhbPns7tcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfY2xlYW51cFBhcmVudFJlbGF0aW9ucyh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICAvLyDku47niLboioLngrnkuK3np7vpmaRcclxuICAgICAgICBjb25zdCBwYXJlbnRVdWlkID0gdGhpcy5fZ2V0UGFyZW50VXVpZCh1dWlkKTtcclxuICAgICAgICBpZiAocGFyZW50VXVpZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9wYXJlbnRDaGlsZHJlbi5nZXQocGFyZW50VXVpZCk/LmRlbGV0ZSh1dWlkKTtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlTmFtZUNvdW50KHBhcmVudFV1aWQsIHRoaXMuX21hcFt1dWlkXT8ubmFtZSwgbnVsbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDpgJLlvZLmuIXnkIbmiYDmnInlrZDoioLngrlcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX3BhcmVudENoaWxkcmVuLmdldCh1dWlkKTtcclxuICAgICAgICBpZiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZFV1aWQgb2YgY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKGNoaWxkVXVpZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fcGFyZW50Q2hpbGRyZW4uZGVsZXRlKHV1aWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsOWQjeensOiuoeaVsFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF91cGRhdGVOYW1lQ291bnQocGFyZW50VXVpZDogc3RyaW5nLCBvbGROYW1lOiBzdHJpbmcgfCBudWxsLCBuZXdOYW1lOiBzdHJpbmcgfCBudWxsKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZU1hcCA9IHBhdGhNYW5hZ2VyLmdldE5hbWVNYXAocGFyZW50VXVpZCk7XHJcbiAgICAgICAgaWYgKCFuYW1lTWFwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOWHj+WwkeaXp+WQjeensOeahOiuoeaVsFxyXG4gICAgICAgIGlmIChvbGROYW1lICYmIG5hbWVNYXAuaGFzKG9sZE5hbWUpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gbmFtZU1hcC5nZXQob2xkTmFtZSkhO1xyXG4gICAgICAgICAgICBpZiAoY291bnQgPiAxKSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lTWFwLnNldChvbGROYW1lLCBjb3VudCAtIDEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbmFtZU1hcC5kZWxldGUob2xkTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOWinuWKoOaWsOWQjeensOeahOiuoeaVsFxyXG4gICAgICAgIGlmIChuZXdOYW1lKSB7XHJcbiAgICAgICAgICAgIGlmICghbmFtZU1hcC5oYXMobmV3TmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIG5hbWVNYXAuc2V0KG5ld05hbWUsIDEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbmFtZU1hcC5zZXQobmV3TmFtZSwgbmFtZU1hcC5nZXQobmV3TmFtZSkhICsgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19