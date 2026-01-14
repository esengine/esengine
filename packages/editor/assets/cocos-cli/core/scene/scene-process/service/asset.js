"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetService = void 0;
const core_1 = require("./core");
const cc_1 = require("cc");
const asset_watcher_1 = require("./asset/asset-watcher");
const node_utils_1 = require("./node/node-utils");
let AssetService = class AssetService extends core_1.BaseService {
    /**
     * 主进程监听 asset 事件，所触发事件
     * @param uuid
     */
    async assetChanged(uuid) {
        this.releaseAsset(uuid);
        await asset_watcher_1.assetWatcherManager.onAssetChanged(uuid);
        this.emit('asset:change', uuid);
    }
    /**
     * 主进程监听 asset 事件，所触发事件
     * @param uuid
     */
    async assetDeleted(uuid) {
        asset_watcher_1.assetWatcherManager.onAssetDeleted(uuid);
        this.emit('asset:deleted', uuid);
    }
    onEditorOpened() {
        cc_1.assetManager.assetListener.removeAllListeners();
        // iterate all component
        const nodeObject = EditorExtends.Node.getNodes();
        for (const key in nodeObject) {
            const node = nodeObject[key];
            // 场景节点特殊处理
            if (node instanceof cc.Scene) {
                asset_watcher_1.assetWatcherManager.startWatch(node.globals);
            }
            else {
                if (node && !(0, node_utils_1.isEditorNode)(node)) {
                    node.components.forEach((component) => {
                        asset_watcher_1.assetWatcherManager.startWatch(component);
                    });
                }
            }
        }
    }
    onNodeChanged(node) {
        node.components.forEach((component) => {
            asset_watcher_1.assetWatcherManager.stopWatch(component);
            asset_watcher_1.assetWatcherManager.startWatch(component);
        });
    }
    onComponentAdded(comp) {
        asset_watcher_1.assetWatcherManager.startWatch(comp);
    }
    onComponentRemoved(comp) {
        asset_watcher_1.assetWatcherManager.stopWatch(comp);
    }
    releaseAsset(assetUUID) {
        const asset = cc_1.assetManager.assets.get(assetUUID);
        if (asset) {
            // Hack: Prefab 需要把引用它的资源一起清除缓存，否则嵌套的 Prefab 不会及时更新
            if (asset instanceof cc_1.Prefab) {
                // 不可以先释放，会影响后续数据查询，比如 A->B->C，先释放B，那么A依赖查询就会失败
                const list = [];
                cc_1.assetManager.assets.forEach((cachedAsset, uuid) => {
                    const depsUUIDs = cc_1.assetManager.dependUtil.getDepsRecursively(uuid);
                    if (asset && depsUUIDs.includes(asset.uuid)) {
                        list.push(cachedAsset);
                    }
                });
                list.forEach((cachedAsset) => {
                    cc_1.assetManager.releaseAsset(cachedAsset);
                });
            }
            cc_1.assetManager.releaseAsset(asset);
        }
    }
};
exports.AssetService = AssetService;
exports.AssetService = AssetService = __decorate([
    (0, core_1.register)('Asset')
], AssetService);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9zY2VuZS9zY2VuZS1wcm9jZXNzL3NlcnZpY2UvYXNzZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsaUNBQStDO0FBRS9DLDJCQUFrRTtBQUNsRSx5REFBNEQ7QUFDNUQsa0RBQWlEO0FBRzFDLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQWEsU0FBUSxrQkFBeUI7SUFDdkQ7OztPQUdHO0lBQ0ksS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFZO1FBQ2xDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsTUFBTSxtQ0FBbUIsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7T0FHRztJQUNJLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBWTtRQUNsQyxtQ0FBbUIsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVNLGNBQWM7UUFDakIsaUJBQVksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUNoRCx3QkFBd0I7UUFDeEIsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqRCxLQUFLLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQzNCLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUU3QixXQUFXO1lBQ1gsSUFBSSxJQUFJLFlBQVksRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUMzQixtQ0FBbUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2pELENBQUM7aUJBQU0sQ0FBQztnQkFDSixJQUFJLElBQUksSUFBSSxDQUFDLElBQUEseUJBQVksRUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUM5QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQWMsRUFBRSxFQUFFO3dCQUN2QyxtQ0FBbUIsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzlDLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFTSxhQUFhLENBQUMsSUFBVTtRQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQ2xDLG1DQUFtQixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6QyxtQ0FBbUIsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sZ0JBQWdCLENBQUMsSUFBZTtRQUNuQyxtQ0FBbUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVNLGtCQUFrQixDQUFDLElBQWU7UUFDckMsbUNBQW1CLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFTSxZQUFZLENBQUMsU0FBaUI7UUFDakMsTUFBTSxLQUFLLEdBQUcsaUJBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELElBQUksS0FBSyxFQUFFLENBQUM7WUFDUixtREFBbUQ7WUFDbkQsSUFBSSxLQUFLLFlBQVksV0FBTSxFQUFFLENBQUM7Z0JBQzFCLCtDQUErQztnQkFDL0MsTUFBTSxJQUFJLEdBQVksRUFBRSxDQUFDO2dCQUN6QixpQkFBWSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQUU7b0JBQzlDLE1BQU0sU0FBUyxHQUFHLGlCQUFZLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNuRSxJQUFJLEtBQUssSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDO3dCQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUMzQixDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtvQkFDekIsaUJBQVksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzNDLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUNELGlCQUFZLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLENBQUM7SUFDTCxDQUFDO0NBQ0osQ0FBQTtBQTNFWSxvQ0FBWTt1QkFBWixZQUFZO0lBRHhCLElBQUEsZUFBUSxFQUFDLE9BQU8sQ0FBQztHQUNMLFlBQVksQ0EyRXhCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmFzZVNlcnZpY2UsIHJlZ2lzdGVyIH0gZnJvbSAnLi9jb3JlJztcclxuaW1wb3J0IHsgSUFzc2V0RXZlbnRzLCBJQXNzZXRTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vY29tbW9uJztcclxuaW1wb3J0IHsgQXNzZXQsIGFzc2V0TWFuYWdlciwgQ29tcG9uZW50LCBOb2RlLCBQcmVmYWIgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IGFzc2V0V2F0Y2hlck1hbmFnZXIgfSBmcm9tICcuL2Fzc2V0L2Fzc2V0LXdhdGNoZXInO1xyXG5pbXBvcnQgeyBpc0VkaXRvck5vZGUgfSBmcm9tICcuL25vZGUvbm9kZS11dGlscyc7XHJcblxyXG5AcmVnaXN0ZXIoJ0Fzc2V0JylcclxuZXhwb3J0IGNsYXNzIEFzc2V0U2VydmljZSBleHRlbmRzIEJhc2VTZXJ2aWNlPElBc3NldEV2ZW50cz4gaW1wbGVtZW50cyBJQXNzZXRTZXJ2aWNlIHtcclxuICAgIC8qKlxyXG4gICAgICog5Li76L+b56iL55uR5ZCsIGFzc2V0IOS6i+S7tu+8jOaJgOinpuWPkeS6i+S7tlxyXG4gICAgICogQHBhcmFtIHV1aWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIGFzc2V0Q2hhbmdlZCh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnJlbGVhc2VBc3NldCh1dWlkKTtcclxuICAgICAgICBhd2FpdCBhc3NldFdhdGNoZXJNYW5hZ2VyLm9uQXNzZXRDaGFuZ2VkKHV1aWQpO1xyXG4gICAgICAgIHRoaXMuZW1pdCgnYXNzZXQ6Y2hhbmdlJywgdXVpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDkuLvov5vnqIvnm5HlkKwgYXNzZXQg5LqL5Lu277yM5omA6Kem5Y+R5LqL5Lu2XHJcbiAgICAgKiBAcGFyYW0gdXVpZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgYXNzZXREZWxldGVkKHV1aWQ6IHN0cmluZykge1xyXG4gICAgICAgIGFzc2V0V2F0Y2hlck1hbmFnZXIub25Bc3NldERlbGV0ZWQodXVpZCk7XHJcbiAgICAgICAgdGhpcy5lbWl0KCdhc3NldDpkZWxldGVkJywgdXVpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uRWRpdG9yT3BlbmVkKCkge1xyXG4gICAgICAgIGFzc2V0TWFuYWdlci5hc3NldExpc3RlbmVyLnJlbW92ZUFsbExpc3RlbmVycygpO1xyXG4gICAgICAgIC8vIGl0ZXJhdGUgYWxsIGNvbXBvbmVudFxyXG4gICAgICAgIGNvbnN0IG5vZGVPYmplY3QgPSBFZGl0b3JFeHRlbmRzLk5vZGUuZ2V0Tm9kZXMoKTtcclxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBub2RlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2RlT2JqZWN0W2tleV07XHJcblxyXG4gICAgICAgICAgICAvLyDlnLrmma/oioLngrnnibnmrorlpITnkIZcclxuICAgICAgICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBjYy5TY2VuZSkge1xyXG4gICAgICAgICAgICAgICAgYXNzZXRXYXRjaGVyTWFuYWdlci5zdGFydFdhdGNoKG5vZGUuZ2xvYmFscyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZSAmJiAhaXNFZGl0b3JOb2RlKG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5jb21wb25lbnRzLmZvckVhY2goKGNvbXBvbmVudDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0V2F0Y2hlck1hbmFnZXIuc3RhcnRXYXRjaChjb21wb25lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbk5vZGVDaGFuZ2VkKG5vZGU6IE5vZGUpIHtcclxuICAgICAgICBub2RlLmNvbXBvbmVudHMuZm9yRWFjaCgoY29tcG9uZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGFzc2V0V2F0Y2hlck1hbmFnZXIuc3RvcFdhdGNoKGNvbXBvbmVudCk7XHJcbiAgICAgICAgICAgIGFzc2V0V2F0Y2hlck1hbmFnZXIuc3RhcnRXYXRjaChjb21wb25lbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkNvbXBvbmVudEFkZGVkKGNvbXA6IENvbXBvbmVudCkge1xyXG4gICAgICAgIGFzc2V0V2F0Y2hlck1hbmFnZXIuc3RhcnRXYXRjaChjb21wKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25Db21wb25lbnRSZW1vdmVkKGNvbXA6IENvbXBvbmVudCkge1xyXG4gICAgICAgIGFzc2V0V2F0Y2hlck1hbmFnZXIuc3RvcFdhdGNoKGNvbXApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZWxlYXNlQXNzZXQoYXNzZXRVVUlEOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBhc3NldCA9IGFzc2V0TWFuYWdlci5hc3NldHMuZ2V0KGFzc2V0VVVJRCk7XHJcbiAgICAgICAgaWYgKGFzc2V0KSB7XHJcbiAgICAgICAgICAgIC8vIEhhY2s6IFByZWZhYiDpnIDopoHmiorlvJXnlKjlroPnmoTotYTmupDkuIDotbfmuIXpmaTnvJPlrZjvvIzlkKbliJnltYzlpZfnmoQgUHJlZmFiIOS4jeS8muWPiuaXtuabtOaWsFxyXG4gICAgICAgICAgICBpZiAoYXNzZXQgaW5zdGFuY2VvZiBQcmVmYWIpIHtcclxuICAgICAgICAgICAgICAgIC8vIOS4jeWPr+S7peWFiOmHiuaUvu+8jOS8muW9seWTjeWQjue7reaVsOaNruafpeivou+8jOavlOWmgiBBLT5CLT5D77yM5YWI6YeK5pS+Qu+8jOmCo+S5iEHkvp3otZbmn6Xor6LlsLHkvJrlpLHotKVcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxpc3Q6IEFzc2V0W10gPSBbXTtcclxuICAgICAgICAgICAgICAgIGFzc2V0TWFuYWdlci5hc3NldHMuZm9yRWFjaCgoY2FjaGVkQXNzZXQsIHV1aWQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXBzVVVJRHMgPSBhc3NldE1hbmFnZXIuZGVwZW5kVXRpbC5nZXREZXBzUmVjdXJzaXZlbHkodXVpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFzc2V0ICYmIGRlcHNVVUlEcy5pbmNsdWRlcyhhc3NldC51dWlkKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChjYWNoZWRBc3NldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBsaXN0LmZvckVhY2goKGNhY2hlZEFzc2V0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXRNYW5hZ2VyLnJlbGVhc2VBc3NldChjYWNoZWRBc3NldCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhc3NldE1hbmFnZXIucmVsZWFzZUFzc2V0KGFzc2V0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=