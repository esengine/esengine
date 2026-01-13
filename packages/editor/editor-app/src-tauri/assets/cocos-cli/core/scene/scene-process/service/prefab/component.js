"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.componentOperation = void 0;
const cc_1 = require("cc");
const utils_1 = require("./utils");
const dump_1 = __importDefault(require("../dump"));
const rpc_1 = require("../../rpc");
const core_1 = require("../core");
// import { SceneUndoCommand } from '../../../export/undo';
const nodeMgr = EditorExtends.Node;
const CompPrefabInfo = cc_1.Prefab._utils.CompPrefabInfo;
// class ApplyRemoveComponentCommand extends SceneUndoCommand {
//     public removedCompInfo: IRemovedComponentInfo | null = null;
//     private _undoFunc: Function;
//     private _redoFunc: Function;
//     constructor(undoFunc: Function, redoFunc: Function) {
//         super();
//         this._undoFunc = undoFunc;
//         this._redoFunc = redoFunc;
//     }
//
//     public async undo() {
//         if (this.removedCompInfo) {
//             this._undoFunc(this.removedCompInfo);
//         }
//     }
//
//     public async redo() {
//         if (this.removedCompInfo) {
//             this._redoFunc(this.removedCompInfo.nodeUUID, this.removedCompInfo.compData.__prefab!.fileId);
//         }
//     }
// }
/**
 * Component 相关的操作
 */
class ComponentOperation {
    isRevertingRemovedComponents = false;
    isRemovingMountedComponents = false;
    compMap = {}; // uuid->comp映射表，用于diff比较
    cacheComp(comp) {
        this.compMap[comp.uuid] = comp._instantiate();
    }
    getCachedComp(uuid) {
        return this.compMap[uuid];
    }
    clearCompCache() {
        this.compMap = {};
    }
    onAddComponent(comp) {
        this.cacheComp(comp);
        if (this.isRevertingRemovedComponents) {
            return;
        }
        const node = comp.node;
        // @ts-ignore
        if (node && node['_prefab']) {
            this.updateMountedComponents(node);
        }
    }
    onComponentAdded(comp) {
        this.cacheComp(comp);
        if (core_1.Service.Editor.getCurrentEditorType() === 'prefab' && comp.node &&
            // @ts-ignore
            comp.node['_prefab']) {
            // prefab节点上的Component需要添加prefab信息
            if (!comp.__prefab) {
                comp.__prefab = new CompPrefabInfo();
                comp.__prefab.fileId = comp.uuid;
            }
        }
    }
    onRemoveComponentInGeneralMode(comp, rootNode) {
        if (this.isRemovingMountedComponents) {
            return;
        }
        const node = comp.node;
        // @ts-ignore
        if (node && node['_prefab']) {
            const mountedRoot = utils_1.prefabUtils.getMountedRoot(comp);
            if (comp.__prefab && !mountedRoot) {
                this.onPrefabComponentRemoved(comp);
            }
            else {
                this.updateMountedComponents(node);
            }
        }
    }
    onPrefabComponentRemoved(comp) {
        const compPrefabInfo = comp.__prefab;
        if (!compPrefabInfo) {
            return;
        }
        const node = comp.node;
        // @ts-ignore
        const prefabInfo = node['_prefab'];
        if (!prefabInfo) {
            return;
        }
        // 向上查找PrefabInstance路径
        const outMostPrefabInstanceInfo = utils_1.prefabUtils.getOutMostPrefabInstanceInfo(node);
        const outMostPrefabInstanceNode = outMostPrefabInstanceInfo.outMostPrefabInstanceNode;
        if (!outMostPrefabInstanceNode) {
            return;
        }
        const targetPath = outMostPrefabInstanceInfo.targetPath;
        // @ts-ignore
        const outMostPrefabInstance = outMostPrefabInstanceNode['_prefab']?.instance;
        if (outMostPrefabInstance) {
            targetPath.splice(0, 1); // 不需要存最外层的PrefabInstance的fileID，方便override可以在PrefabInstance复制后复用  
            targetPath.push(compPrefabInfo.fileId);
            utils_1.prefabUtils.fireBeforeChangeMsg(outMostPrefabInstanceNode);
            utils_1.prefabUtils.addRemovedComponent(outMostPrefabInstance, targetPath);
            utils_1.prefabUtils.fireChangeMsg(outMostPrefabInstanceNode);
        }
    }
    onComponentRemovedInGeneralMode(comp, rootNode) {
        if (this.isRemovingMountedComponents) {
            return;
        }
        utils_1.prefabUtils.checkToRemoveTargetOverride(comp, rootNode);
    }
    /**
     * 将 PrefabInstance 上删除的组件应用到 PrefabAsset 中
     * @param nodeUUID 节点的uuid
     * @param fileID component的fileID
     */
    async doApplyRemovedComponent(nodeUUID, fileID) {
        const node = nodeMgr.getNode(nodeUUID);
        if (!node) {
            return null;
        }
        const outMostPrefabInstanceInfo = utils_1.prefabUtils.getOutMostPrefabInstanceInfo(node);
        const outMostPrefabInstanceNode = outMostPrefabInstanceInfo.outMostPrefabInstanceNode;
        if (!outMostPrefabInstanceNode) {
            return null;
        }
        const targetPath = outMostPrefabInstanceInfo.targetPath;
        // @ts-ignore
        const outMostPrefabInstance = outMostPrefabInstanceNode['_prefab']?.instance;
        // @ts-ignore
        const outMostPrefabInfo = outMostPrefabInstanceNode['_prefab'];
        if (outMostPrefabInstance && outMostPrefabInfo && outMostPrefabInfo.asset) {
            const assetUUID = outMostPrefabInfo.asset._uuid;
            // 如果是子资源，则不能应用
            if (utils_1.prefabUtils.isSubAsset(assetUUID)) {
                console.warn('can\'t apply RemovedComponent in SubAsset Prefab');
                return null;
            }
            targetPath.splice(0, 1);
            targetPath.push(fileID);
            const assetRootNode = utils_1.prefabUtils.getPrefabAssetNodeInstance(outMostPrefabInfo);
            if (!assetRootNode) {
                return null;
            }
            const targetCompInAsset = utils_1.prefabUtils.getTarget(targetPath, assetRootNode);
            const compIndex = targetCompInAsset.node.components.indexOf(targetCompInAsset);
            const compData = targetCompInAsset._instantiate();
            if (!compData) {
                return null;
            }
            // #14002 移除组件是嵌套预制体的组件，需要额外处理。是mounted的组件就移除mounted信息，不是的话要更新removedComponents属性
            // 可以参考applyPrefab的结果 
            if (node['_prefab']?.instance && node['_prefab']?.instance !== outMostPrefabInstance) {
                // @ts-ignore
                const assetRootPrefabInfo = assetRootNode._prefab;
                const oldInstance = assetRootPrefabInfo.instance;
                assetRootPrefabInfo.instance = undefined;
                this.onRemoveComponentInGeneralMode(targetCompInAsset, assetRootNode);
                assetRootPrefabInfo.instance = oldInstance;
            }
            // 删除Component
            targetCompInAsset._destroyImmediate();
            // 去掉instance,否则里边的mountedRoot会被消除
            // @ts-ignore
            const assetRootNodePrefab = assetRootNode['_prefab'];
            if (assetRootNodePrefab) {
                assetRootNodePrefab.instance = undefined;
            }
            const ret = utils_1.prefabUtils.generatePrefabDataFromNode(assetRootNode);
            if (!ret)
                return null;
            const prefabData = ret.prefabData;
            const info = await rpc_1.Rpc.getInstance().request('assetManager', 'queryAssetInfo', [outMostPrefabInfo.asset._uuid]);
            if (!info)
                return null;
            utils_1.prefabUtils.fireBeforeChangeMsg(outMostPrefabInstanceNode);
            utils_1.prefabUtils.deleteRemovedComponent(outMostPrefabInstance, targetPath);
            utils_1.prefabUtils.fireChangeMsg(outMostPrefabInstanceNode);
            await rpc_1.Rpc.getInstance().request('assetManager', 'createAsset', [{
                    target: info.source,
                    content: prefabData,
                    overwrite: true
                }]);
            // cce.SceneFacadeManager.abortSnapshot();
            return {
                nodeUUID,
                compIndex,
                compData,
            };
        }
        return null;
    }
    /**
     * undo ApplyRemovedComponent 操作
     * @param IRemovedComponentInfo 移除的component信息
     */
    async undoApplyRemovedComponent(removedCompInfo) {
        if (!removedCompInfo) {
            return;
        }
        const node = nodeMgr.getNode(removedCompInfo.nodeUUID);
        if (!node) {
            return;
        }
        const outMostPrefabInstanceInfo = utils_1.prefabUtils.getOutMostPrefabInstanceInfo(node);
        const outMostPrefabInstanceNode = outMostPrefabInstanceInfo.outMostPrefabInstanceNode;
        if (!outMostPrefabInstanceNode) {
            return;
        }
        const targetPath = outMostPrefabInstanceInfo.targetPath;
        // @ts-ignore
        const outMostPrefabInstance = outMostPrefabInstanceNode['_prefab']?.instance;
        // @ts-ignore
        const outMostPrefabInfo = outMostPrefabInstanceNode['_prefab'];
        if (outMostPrefabInstance && outMostPrefabInfo && outMostPrefabInfo.asset) {
            targetPath.splice(0, 1);
            const nodeLocalID = targetPath.slice();
            // @ts-ignore
            nodeLocalID.push(node['_prefab'].fileId);
            const compFileID = removedCompInfo.compData.__prefab.fileId;
            targetPath.push(compFileID);
            const assetRootNode = utils_1.prefabUtils.getPrefabAssetNodeInstance(outMostPrefabInfo);
            if (!assetRootNode) {
                return;
            }
            const nodeInAsset = utils_1.prefabUtils.getTarget(nodeLocalID, assetRootNode);
            // @ts-ignore
            nodeInAsset._addComponentAt(removedCompInfo.compData, removedCompInfo.compIndex);
            const ret = utils_1.prefabUtils.generatePrefabDataFromNode(assetRootNode);
            if (!ret)
                return;
            const info = await rpc_1.Rpc.getInstance().request('assetManager', 'queryAssetInfo', [outMostPrefabInfo.asset._uuid]);
            if (!info)
                return;
            utils_1.prefabUtils.fireBeforeChangeMsg(outMostPrefabInstanceNode);
            utils_1.prefabUtils.addRemovedComponent(outMostPrefabInstance, targetPath);
            utils_1.prefabUtils.fireChangeMsg(outMostPrefabInstanceNode);
            await rpc_1.Rpc.getInstance().request('assetManager', 'createAsset', [{
                    target: info.source,
                    content: ret.prefabData,
                    overwrite: true
                }]);
            // cce.SceneFacadeManager.abortSnapshot();
        }
    }
    async applyRemovedComponent(nodeUUID, fileID) {
        // const command = new ApplyRemoveComponentCommand(
        //     this.undoApplyRemovedComponent.bind(this), this.doApplyRemovedComponent.bind(this));
        // const undoID = cce.SceneFacadeManager.beginRecording(nodeUUID, { customCommand: command });
        const removedCompInfo = await this.doApplyRemovedComponent(nodeUUID, fileID);
        if (removedCompInfo) {
            // command.removedCompInfo = removedCompInfo;
            // cce.SceneFacadeManager.endRecording(undoID);
            // cce.SceneFacadeManager.snapshot();
            // cce.SceneFacadeManager.abortSnapshot();
        }
        else {
            // cce.SceneFacadeManager.cancelRecording(undoID);
        }
    }
    async cloneComponentToNode(node, clonedComp) {
        const copyCompDump = dump_1.default.dumpComponent(clonedComp);
        // 不要同步_objFlags，否则因为没有onEnable的标记会导致onDisable不被调用
        // delete copyCompDump.value._objFlags;
        const newComp = node.addComponent(cc_1.js.getClassName(clonedComp));
        const components = node.components;
        if (components && components.length) {
            const lastIndex = components.length - 1;
            const lastComp = components[lastIndex];
            if (lastComp && lastComp === newComp) {
                await dump_1.default.restoreProperty(node, `__comps__.${lastIndex}`, copyCompDump);
                // MissingScript的_$erialized要特殊还原
                if (newComp instanceof cc_1.MissingScript) {
                    // 这里_$erialized因为有node引用没法简单的clone出一份，只能
                    // 先用prefabAsset上的component身上的那份数据
                    // @ts-expect-error
                    newComp._$erialized = clonedComp._$erialized;
                }
            }
        }
    }
    /**
     * 撤销 removedComponent，会将PrefabAsset中的Component还原到当前节点上
     * @param nodeUUID node的UUID
     * @param fileID component的fileID
     */
    async revertRemovedComponent(nodeUUID, fileID) {
        const node = nodeMgr.getNode(nodeUUID);
        if (!node) {
            return;
        }
        const outMostPrefabInstanceInfo = utils_1.prefabUtils.getOutMostPrefabInstanceInfo(node);
        const outMostPrefabInstanceNode = outMostPrefabInstanceInfo.outMostPrefabInstanceNode;
        if (!outMostPrefabInstanceNode) {
            return;
        }
        const targetPath = outMostPrefabInstanceInfo.targetPath;
        // @ts-ignore
        const outMostPrefabInstance = outMostPrefabInstanceNode['_prefab']?.instance;
        // @ts-ignore
        const outMostPrefabInfo = outMostPrefabInstanceNode['_prefab'];
        if (outMostPrefabInstance && outMostPrefabInfo && outMostPrefabInfo.asset) {
            targetPath.splice(0, 1);
            targetPath.push(fileID);
            const assetRootNode = (0, cc_1.instantiate)(outMostPrefabInfo.asset);
            if (!assetRootNode) {
                return;
            }
            // const undoId = cce.SceneFacadeManager.beginRecording([outMostPrefabInstanceNode.uuid, nodeUUID]);
            const targetCompInAsset = utils_1.prefabUtils.getTarget(targetPath, assetRootNode);
            utils_1.prefabUtils.fireBeforeChangeMsg(node);
            this.isRevertingRemovedComponents = true;
            await this.cloneComponentToNode(node, targetCompInAsset);
            this.isRevertingRemovedComponents = false;
            utils_1.prefabUtils.fireChangeMsg(node);
            utils_1.prefabUtils.fireBeforeChangeMsg(outMostPrefabInstanceNode);
            utils_1.prefabUtils.deleteRemovedComponent(outMostPrefabInstance, targetPath);
            utils_1.prefabUtils.fireChangeMsg(outMostPrefabInstanceNode);
            // cce.SceneFacadeManager.endRecording(undoId);
        }
    }
    updateMountedComponents(node) {
        // PrefabInstance中增加/删除Component，需要更新mountedComponents
        // @ts-ignore
        const prefabInfo = node['_prefab'];
        if (!prefabInfo) {
            return;
        }
        // 向上查找PrefabInstance路径
        const outMostPrefabInstanceInfo = utils_1.prefabUtils.getOutMostPrefabInstanceInfo(node);
        const outMostPrefabInstanceNode = outMostPrefabInstanceInfo.outMostPrefabInstanceNode;
        if (!outMostPrefabInstanceNode) {
            return null;
        }
        const targetPath = outMostPrefabInstanceInfo.targetPath;
        // @ts-ignore
        const outMostPrefabInfo = outMostPrefabInstanceNode['_prefab'];
        const outMostPrefabInstance = outMostPrefabInfo?.instance;
        if (!outMostPrefabInstanceNode || !outMostPrefabInfo || !outMostPrefabInstance) {
            return;
        }
        const assetRootNode = utils_1.prefabUtils.getPrefabAssetNodeInstance(outMostPrefabInfo);
        if (!assetRootNode) {
            return;
        }
        targetPath.splice(0, 1); // 不需要存最外层的PrefabInstance的fileID，方便override可以在PrefabInstance复制后复用  
        targetPath.push(prefabInfo.fileId);
        const nodeInAsset = utils_1.prefabUtils.getTarget(targetPath, assetRootNode);
        if (!nodeInAsset) {
            return;
        }
        const compsFileIDs = nodeInAsset.components.map((comp) => {
            return comp.__prefab?.fileId;
        });
        const mountedComponents = [];
        for (let i = 0; i < node.components.length; i++) {
            const comp = node.components[i];
            const compPrefabInfo = comp.__prefab;
            // 非Prefab中的component
            if (!compPrefabInfo) {
                mountedComponents.push(comp);
            }
            else {
                // 不在prefabAsset中的component，要加到mountedComponents
                if (!compsFileIDs.includes(comp.__prefab?.fileId)) {
                    // 1. mountedRoot为空表示为新加的Component
                    // 2. mountedRoot不为空需要查看是不是挂在这个PrefabInstance节点下的，因为可能是挂在
                    // 里层PrefabInstance里,这里就不应该重复添加
                    const mountedRoot = utils_1.prefabUtils.getMountedRoot(comp);
                    if (!mountedRoot || mountedRoot === outMostPrefabInstanceNode) {
                        mountedComponents.push(comp);
                    }
                }
            }
        }
        utils_1.prefabUtils.fireBeforeChangeMsg(outMostPrefabInstanceNode);
        if (mountedComponents.length > 0) {
            const mountedComponentsInfo = utils_1.prefabUtils.getPrefabInstanceMountedComponents(outMostPrefabInstance, targetPath);
            mountedComponentsInfo.components = mountedComponents;
            mountedComponentsInfo.components.forEach((comp) => {
                utils_1.prefabUtils.setMountedRoot(comp, outMostPrefabInstanceNode);
            });
        }
        else {
            for (let i = 0; i < outMostPrefabInstance.mountedComponents.length; i++) {
                const compInfo = outMostPrefabInstance.mountedComponents[i];
                if (compInfo.isTarget(targetPath)) {
                    compInfo.components.forEach((comp) => {
                        utils_1.prefabUtils.setMountedRoot(comp, undefined);
                    });
                    outMostPrefabInstance.mountedComponents.splice(i, 1);
                    break;
                }
            }
        }
        utils_1.prefabUtils.fireChangeMsg(outMostPrefabInstanceNode);
    }
    applyMountedComponents(node) {
        const rootNode = node;
        // @ts-ignore
        const prefabInfo = rootNode['_prefab'];
        if (!prefabInfo) {
            return;
        }
        const prefabInstance = prefabInfo.instance;
        if (!prefabInstance) {
            return;
        }
        const mountedCompsMap = new Map();
        const mountedComponents = prefabInstance.mountedComponents;
        for (let i = 0; i < mountedComponents.length; i++) {
            const mountedComponentInfo = mountedComponents[i];
            const targetInfo = mountedComponentInfo.targetInfo;
            if (!targetInfo)
                continue;
            const target = utils_1.prefabUtils.getTarget(targetInfo.localID, rootNode);
            if (!target)
                continue;
            // 把mountedComponentInfo中的组件加到PrefabAsset中
            mountedComponentInfo.components.forEach((mountedComp) => {
                if (!mountedComp.__prefab) {
                    mountedComp.__prefab = new CompPrefabInfo();
                    mountedComp.__prefab.fileId = mountedComp.uuid;
                }
                // 节点挂载嵌套预制体身上
                if (targetInfo.localID.length > 1) {
                    prefabInfo.instance = undefined;
                    const nestedInstPrefabInstanceInfo = utils_1.prefabUtils.getOutMostPrefabInstanceInfo(target);
                    prefabInfo.instance = prefabInstance;
                    const nestedInstNode = nestedInstPrefabInstanceInfo.outMostPrefabInstanceNode;
                    if (!nestedInstNode) {
                        return;
                    }
                    // @ts-ignore
                    const nestedInstPrefabInfo = nestedInstNode['_prefab'];
                    if (!nestedInstPrefabInfo) {
                        return;
                    }
                    const nestedInstPrefabInstance = nestedInstPrefabInfo.instance;
                    if (!nestedInstPrefabInstance) {
                        return;
                    }
                    // @ts-ignore
                    const targetPrefabInfo = target['_prefab'];
                    if (!targetPrefabInfo) {
                        return;
                    }
                    // 更新预制体数据，localID从第二个开始(数据存在嵌套预制体实例上，所以可以忽略第一个fileID(自身))
                    const mountedNodePath = nestedInstPrefabInstanceInfo.targetPath.slice(1);
                    mountedNodePath.push(targetPrefabInfo.fileId);
                    const nestedMountedComponentInfo = utils_1.prefabUtils.getPrefabInstanceMountedComponents(nestedInstPrefabInstance, mountedNodePath);
                    nestedMountedComponentInfo.components.push(mountedComp);
                    utils_1.prefabUtils.setMountedRoot(mountedComp, nestedInstNode);
                    // 记录undo索引数据,从根节点开始找，所以需要第一个fileID
                    const targetPath = nestedInstPrefabInstanceInfo.targetPath.slice();
                    targetPath.push(mountedComp.__prefab.fileId);
                    mountedCompsMap.set(targetPath, { prefabInfo: null });
                }
                else {
                    mountedCompsMap.set([mountedComp.__prefab.fileId], { prefabInfo: null });
                    utils_1.prefabUtils.setMountedRoot(mountedComp, undefined);
                }
            });
        }
        prefabInstance.mountedComponents = [];
        return mountedCompsMap;
    }
}
exports.componentOperation = new ComponentOperation();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvc2NlbmUvc2NlbmUtcHJvY2Vzcy9zZXJ2aWNlL3ByZWZhYi9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMkJBQW9GO0FBQ3BGLG1DQUFzQztBQUN0QyxtREFBK0I7QUFDL0IsbUNBQWdDO0FBQ2hDLGtDQUFrQztBQUNsQywyREFBMkQ7QUFFM0QsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQztBQUduQyxNQUFNLGNBQWMsR0FBRyxXQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQWFwRCwrREFBK0Q7QUFDL0QsbUVBQW1FO0FBQ25FLG1DQUFtQztBQUNuQyxtQ0FBbUM7QUFDbkMsNERBQTREO0FBQzVELG1CQUFtQjtBQUNuQixxQ0FBcUM7QUFDckMscUNBQXFDO0FBQ3JDLFFBQVE7QUFDUixFQUFFO0FBQ0YsNEJBQTRCO0FBQzVCLHNDQUFzQztBQUN0QyxvREFBb0Q7QUFDcEQsWUFBWTtBQUNaLFFBQVE7QUFDUixFQUFFO0FBQ0YsNEJBQTRCO0FBQzVCLHNDQUFzQztBQUN0Qyw2R0FBNkc7QUFDN0csWUFBWTtBQUNaLFFBQVE7QUFDUixJQUFJO0FBRUo7O0dBRUc7QUFDSCxNQUFNLGtCQUFrQjtJQUNiLDRCQUE0QixHQUFHLEtBQUssQ0FBQztJQUNyQywyQkFBMkIsR0FBRyxLQUFLLENBQUM7SUFDbkMsT0FBTyxHQUFtQyxFQUFFLENBQUMsQ0FBQyx5QkFBeUI7SUFFeEUsU0FBUyxDQUFDLElBQWU7UUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRyxDQUFDO0lBQ25ELENBQUM7SUFFTSxhQUFhLENBQUMsSUFBWTtRQUM3QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFD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QVcsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDdkQsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVELGNBQWMsQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7UUFFdEMsT0FBTyxlQUFlLENBQUM7SUFDM0IsQ0FBQztDQUNKO0FBRVksUUFBQSxrQkFBa0IsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTY2VuZSwgQ29tcG9uZW50LCBpbnN0YW50aWF0ZSwganMsIE1pc3NpbmdTY3JpcHQsIE5vZGUsIFByZWZhYiB9IGZyb20gJ2NjJztcclxuaW1wb3J0IHsgcHJlZmFiVXRpbHMgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IGR1bXBVdGlsIGZyb20gJy4uL2R1bXAnO1xyXG5pbXBvcnQgeyBScGMgfSBmcm9tICcuLi8uLi9ycGMnO1xyXG5pbXBvcnQgeyBTZXJ2aWNlIH0gZnJvbSAnLi4vY29yZSc7XHJcbi8vIGltcG9ydCB7IFNjZW5lVW5kb0NvbW1hbmQgfSBmcm9tICcuLi8uLi8uLi9leHBvcnQvdW5kbyc7XHJcblxyXG5jb25zdCBub2RlTWdyID0gRWRpdG9yRXh0ZW5kcy5Ob2RlO1xyXG5cclxudHlwZSBDb21wUHJlZmFiSW5mbyA9IFByZWZhYi5fdXRpbHMuQ29tcFByZWZhYkluZm87XHJcbmNvbnN0IENvbXBQcmVmYWJJbmZvID0gUHJlZmFiLl91dGlscy5Db21wUHJlZmFiSW5mbztcclxudHlwZSBQcmVmYWJJbnN0YW5jZSA9IFByZWZhYi5fdXRpbHMuUHJlZmFiSW5zdGFuY2U7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElDb21wb25lbnRQcmVmYWJEYXRhIHtcclxuICAgIHByZWZhYkluZm86IENvbXBQcmVmYWJJbmZvIHwgbnVsbDtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJUmVtb3ZlZENvbXBvbmVudEluZm8ge1xyXG4gICAgbm9kZVVVSUQ6IHN0cmluZztcclxuICAgIGNvbXBJbmRleDogbnVtYmVyO1xyXG4gICAgY29tcERhdGE6IENvbXBvbmVudDtcclxufVxyXG5cclxuLy8gY2xhc3MgQXBwbHlSZW1vdmVDb21wb25lbnRDb21tYW5kIGV4dGVuZHMgU2NlbmVVbmRvQ29tbWFuZCB7XHJcbi8vICAgICBwdWJsaWMgcmVtb3ZlZENvbXBJbmZvOiBJUmVtb3ZlZENvbXBvbmVudEluZm8gfCBudWxsID0gbnVsbDtcclxuLy8gICAgIHByaXZhdGUgX3VuZG9GdW5jOiBGdW5jdGlvbjtcclxuLy8gICAgIHByaXZhdGUgX3JlZG9GdW5jOiBGdW5jdGlvbjtcclxuLy8gICAgIGNvbnN0cnVjdG9yKHVuZG9GdW5jOiBGdW5jdGlvbiwgcmVkb0Z1bmM6IEZ1bmN0aW9uKSB7XHJcbi8vICAgICAgICAgc3VwZXIoKTtcclxuLy8gICAgICAgICB0aGlzLl91bmRvRnVuYyA9IHVuZG9GdW5jO1xyXG4vLyAgICAgICAgIHRoaXMuX3JlZG9GdW5jID0gcmVkb0Z1bmM7XHJcbi8vICAgICB9XHJcbi8vXHJcbi8vICAgICBwdWJsaWMgYXN5bmMgdW5kbygpIHtcclxuLy8gICAgICAgICBpZiAodGhpcy5yZW1vdmVkQ29tcEluZm8pIHtcclxuLy8gICAgICAgICAgICAgdGhpcy5fdW5kb0Z1bmModGhpcy5yZW1vdmVkQ29tcEluZm8pO1xyXG4vLyAgICAgICAgIH1cclxuLy8gICAgIH1cclxuLy9cclxuLy8gICAgIHB1YmxpYyBhc3luYyByZWRvKCkge1xyXG4vLyAgICAgICAgIGlmICh0aGlzLnJlbW92ZWRDb21wSW5mbykge1xyXG4vLyAgICAgICAgICAgICB0aGlzLl9yZWRvRnVuYyh0aGlzLnJlbW92ZWRDb21wSW5mby5ub2RlVVVJRCwgdGhpcy5yZW1vdmVkQ29tcEluZm8uY29tcERhdGEuX19wcmVmYWIhLmZpbGVJZCk7XHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgfVxyXG4vLyB9XHJcblxyXG4vKipcclxuICogQ29tcG9uZW50IOebuOWFs+eahOaTjeS9nFxyXG4gKi9cclxuY2xhc3MgQ29tcG9uZW50T3BlcmF0aW9uIHtcclxuICAgIHB1YmxpYyBpc1JldmVydGluZ1JlbW92ZWRDb21wb25lbnRzID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgaXNSZW1vdmluZ01vdW50ZWRDb21wb25lbnRzID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIGNvbXBNYXA6IHsgW2luZGV4OiBzdHJpbmddOiBDb21wb25lbnQgfSA9IHt9OyAvLyB1dWlkLT5jb21w5pig5bCE6KGo77yM55So5LqOZGlmZuavlOi+g1xyXG5cclxuICAgIHB1YmxpYyBjYWNoZUNvbXAoY29tcDogQ29tcG9uZW50KSB7XHJcbiAgICAgICAgdGhpcy5jb21wTWFwW2NvbXAudXVpZF0gPSBjb21wLl9pbnN0YW50aWF0ZSgpITtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q2FjaGVkQ29tcCh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wTWFwW3V1aWRdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGVhckNvbXBDYWNoZSgpIHtcclxuICAgICAgICB0aGlzLmNvbXBNYXAgPSB7fTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25BZGRDb21wb25lbnQoY29tcDogQ29tcG9uZW50KSB7XHJcbiAgICAgICAgdGhpcy5jYWNoZUNvbXAoY29tcCk7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNSZXZlcnRpbmdSZW1vdmVkQ29tcG9uZW50cykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBjb21wLm5vZGU7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGlmIChub2RlICYmIG5vZGVbJ19wcmVmYWInXSkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU1vdW50ZWRDb21wb25lbnRzKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25Db21wb25lbnRBZGRlZChjb21wOiBDb21wb25lbnQpIHtcclxuICAgICAgICB0aGlzLmNhY2hlQ29tcChjb21wKTtcclxuXHJcbiAgICAgICAgaWYgKFNlcnZpY2UuRWRpdG9yLmdldEN1cnJlbnRFZGl0b3JUeXBlKCkgPT09ICdwcmVmYWInICYmIGNvbXAubm9kZSAmJlxyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIGNvbXAubm9kZVsnX3ByZWZhYiddKSB7XHJcbiAgICAgICAgICAgIC8vIHByZWZhYuiKgueCueS4iueahENvbXBvbmVudOmcgOimgea3u+WKoHByZWZhYuS/oeaBr1xyXG4gICAgICAgICAgICBpZiAoIWNvbXAuX19wcmVmYWIpIHtcclxuICAgICAgICAgICAgICAgIGNvbXAuX19wcmVmYWIgPSBuZXcgQ29tcFByZWZhYkluZm8oKTtcclxuICAgICAgICAgICAgICAgIGNvbXAuX19wcmVmYWIhLmZpbGVJZCA9IGNvbXAudXVpZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25SZW1vdmVDb21wb25lbnRJbkdlbmVyYWxNb2RlKGNvbXA6IENvbXBvbmVudCwgcm9vdE5vZGU6IE5vZGUgfCBTY2VuZSB8IG51bGwpIHtcclxuICAgICAgICBpZiAodGhpcy5pc1JlbW92aW5nTW91bnRlZENvbXBvbmVudHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGNvbXAubm9kZTtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgaWYgKG5vZGUgJiYgbm9kZVsnX3ByZWZhYiddKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1vdW50ZWRSb290ID0gcHJlZmFiVXRpbHMuZ2V0TW91bnRlZFJvb3QoY29tcCk7XHJcbiAgICAgICAgICAgIGlmIChjb21wLl9fcHJlZmFiICYmICFtb3VudGVkUm9vdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vblByZWZhYkNvbXBvbmVudFJlbW92ZWQoY29tcCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZU1vdW50ZWRDb21wb25lbnRzKG5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25QcmVmYWJDb21wb25lbnRSZW1vdmVkKGNvbXA6IENvbXBvbmVudCkge1xyXG4gICAgICAgIGNvbnN0IGNvbXBQcmVmYWJJbmZvID0gY29tcC5fX3ByZWZhYjtcclxuICAgICAgICBpZiAoIWNvbXBQcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBjb21wLm5vZGU7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSBub2RlWydfcHJlZmFiJ107XHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOWQkeS4iuafpeaJvlByZWZhYkluc3RhbmNl6Lev5b6EXHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluc3RhbmNlSW5mbyA9IHByZWZhYlV0aWxzLmdldE91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8obm9kZSk7XHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZTogTm9kZSB8IG51bGwgPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvLm91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGU7XHJcbiAgICAgICAgaWYgKCFvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0UGF0aDogc3RyaW5nW10gPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvLnRhcmdldFBhdGg7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGNvbnN0IG91dE1vc3RQcmVmYWJJbnN0YW5jZTogUHJlZmFiLl91dGlscy5QcmVmYWJJbnN0YW5jZSB8IHVuZGVmaW5lZCA9IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGVbJ19wcmVmYWInXT8uaW5zdGFuY2U7XHJcblxyXG4gICAgICAgIGlmIChvdXRNb3N0UHJlZmFiSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgdGFyZ2V0UGF0aC5zcGxpY2UoMCwgMSk7IC8vIOS4jemcgOimgeWtmOacgOWkluWxgueahFByZWZhYkluc3RhbmNl55qEZmlsZUlE77yM5pa55L6/b3ZlcnJpZGXlj6/ku6XlnKhQcmVmYWJJbnN0YW5jZeWkjeWItuWQjuWkjeeUqCAgXHJcbiAgICAgICAgICAgIHRhcmdldFBhdGgucHVzaChjb21wUHJlZmFiSW5mby5maWxlSWQpO1xyXG5cclxuICAgICAgICAgICAgcHJlZmFiVXRpbHMuZmlyZUJlZm9yZUNoYW5nZU1zZyhvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKTtcclxuXHJcbiAgICAgICAgICAgIHByZWZhYlV0aWxzLmFkZFJlbW92ZWRDb21wb25lbnQob3V0TW9zdFByZWZhYkluc3RhbmNlLCB0YXJnZXRQYXRoKTtcclxuXHJcbiAgICAgICAgICAgIHByZWZhYlV0aWxzLmZpcmVDaGFuZ2VNc2cob3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkNvbXBvbmVudFJlbW92ZWRJbkdlbmVyYWxNb2RlKGNvbXA6IENvbXBvbmVudCwgcm9vdE5vZGU6IE5vZGUgfCBTY2VuZSB8IG51bGwpIHtcclxuICAgICAgICBpZiAodGhpcy5pc1JlbW92aW5nTW91bnRlZENvbXBvbmVudHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJlZmFiVXRpbHMuY2hlY2tUb1JlbW92ZVRhcmdldE92ZXJyaWRlKGNvbXAsIHJvb3ROb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWwhiBQcmVmYWJJbnN0YW5jZSDkuIrliKDpmaTnmoTnu4Tku7blupTnlKjliLAgUHJlZmFiQXNzZXQg5LitXHJcbiAgICAgKiBAcGFyYW0gbm9kZVVVSUQg6IqC54K555qEdXVpZFxyXG4gICAgICogQHBhcmFtIGZpbGVJRCBjb21wb25lbnTnmoRmaWxlSURcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIGRvQXBwbHlSZW1vdmVkQ29tcG9uZW50KG5vZGVVVUlEOiBzdHJpbmcsIGZpbGVJRDogc3RyaW5nKTogUHJvbWlzZTxudWxsIHwgSVJlbW92ZWRDb21wb25lbnRJbmZvPiB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVNZ3IuZ2V0Tm9kZShub2RlVVVJRCk7XHJcblxyXG4gICAgICAgIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8gPSBwcmVmYWJVdGlscy5nZXRPdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvKG5vZGUpO1xyXG4gICAgICAgIGNvbnN0IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGU6IE5vZGUgfCBudWxsID0gb3V0TW9zdFByZWZhYkluc3RhbmNlSW5mby5vdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlO1xyXG4gICAgICAgIGlmICghb3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0UGF0aDogc3RyaW5nW10gPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvLnRhcmdldFBhdGg7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGNvbnN0IG91dE1vc3RQcmVmYWJJbnN0YW5jZTogUHJlZmFiLl91dGlscy5QcmVmYWJJbnN0YW5jZSB8IHVuZGVmaW5lZCA9IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGVbJ19wcmVmYWInXT8uaW5zdGFuY2U7XHJcblxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBjb25zdCBvdXRNb3N0UHJlZmFiSW5mbyA9IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICBpZiAob3V0TW9zdFByZWZhYkluc3RhbmNlICYmIG91dE1vc3RQcmVmYWJJbmZvICYmIG91dE1vc3RQcmVmYWJJbmZvLmFzc2V0KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0VVVJRCA9IG91dE1vc3RQcmVmYWJJbmZvLmFzc2V0Ll91dWlkO1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzmmK/lrZDotYTmupDvvIzliJnkuI3og73lupTnlKhcclxuICAgICAgICAgICAgaWYgKHByZWZhYlV0aWxzLmlzU3ViQXNzZXQoYXNzZXRVVUlEKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdjYW5cXCd0IGFwcGx5IFJlbW92ZWRDb21wb25lbnQgaW4gU3ViQXNzZXQgUHJlZmFiJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGFyZ2V0UGF0aC5zcGxpY2UoMCwgMSk7XHJcbiAgICAgICAgICAgIHRhcmdldFBhdGgucHVzaChmaWxlSUQpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgYXNzZXRSb290Tm9kZSA9IHByZWZhYlV0aWxzLmdldFByZWZhYkFzc2V0Tm9kZUluc3RhbmNlKG91dE1vc3RQcmVmYWJJbmZvKTtcclxuICAgICAgICAgICAgaWYgKCFhc3NldFJvb3ROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0Q29tcEluQXNzZXQgPSBwcmVmYWJVdGlscy5nZXRUYXJnZXQodGFyZ2V0UGF0aCwgYXNzZXRSb290Tm9kZSkgYXMgQ29tcG9uZW50O1xyXG4gICAgICAgICAgICBjb25zdCBjb21wSW5kZXggPSB0YXJnZXRDb21wSW5Bc3NldC5ub2RlLmNvbXBvbmVudHMuaW5kZXhPZih0YXJnZXRDb21wSW5Bc3NldCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbXBEYXRhID0gdGFyZ2V0Q29tcEluQXNzZXQuX2luc3RhbnRpYXRlKCk7XHJcbiAgICAgICAgICAgIGlmICghY29tcERhdGEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAjMTQwMDIg56e76Zmk57uE5Lu25piv5bWM5aWX6aKE5Yi25L2T55qE57uE5Lu277yM6ZyA6KaB6aKd5aSW5aSE55CG44CC5pivbW91bnRlZOeahOe7hOS7tuWwseenu+mZpG1vdW50ZWTkv6Hmga/vvIzkuI3mmK/nmoTor53opoHmm7TmlrByZW1vdmVkQ29tcG9uZW50c+WxnuaAp1xyXG4gICAgICAgICAgICAvLyDlj6/ku6Xlj4LogINhcHBseVByZWZhYueahOe7k+aenCBcclxuICAgICAgICAgICAgaWYgKG5vZGVbJ19wcmVmYWInXT8uaW5zdGFuY2UgJiYgbm9kZVsnX3ByZWZhYiddPy5pbnN0YW5jZSAhPT0gb3V0TW9zdFByZWZhYkluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICBjb25zdCBhc3NldFJvb3RQcmVmYWJJbmZvID0gYXNzZXRSb290Tm9kZS5fcHJlZmFiITtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9sZEluc3RhbmNlID0gYXNzZXRSb290UHJlZmFiSW5mby5pbnN0YW5jZTtcclxuICAgICAgICAgICAgICAgIGFzc2V0Um9vdFByZWZhYkluZm8uaW5zdGFuY2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uUmVtb3ZlQ29tcG9uZW50SW5HZW5lcmFsTW9kZSh0YXJnZXRDb21wSW5Bc3NldCwgYXNzZXRSb290Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICBhc3NldFJvb3RQcmVmYWJJbmZvLmluc3RhbmNlID0gb2xkSW5zdGFuY2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIOWIoOmZpENvbXBvbmVudFxyXG4gICAgICAgICAgICB0YXJnZXRDb21wSW5Bc3NldC5fZGVzdHJveUltbWVkaWF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8g5Y675o6JaW5zdGFuY2Us5ZCm5YiZ6YeM6L6555qEbW91bnRlZFJvb3TkvJrooqvmtojpmaRcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBjb25zdCBhc3NldFJvb3ROb2RlUHJlZmFiID0gYXNzZXRSb290Tm9kZVsnX3ByZWZhYiddO1xyXG4gICAgICAgICAgICBpZiAoYXNzZXRSb290Tm9kZVByZWZhYikge1xyXG4gICAgICAgICAgICAgICAgYXNzZXRSb290Tm9kZVByZWZhYi5pbnN0YW5jZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcmV0ID0gcHJlZmFiVXRpbHMuZ2VuZXJhdGVQcmVmYWJEYXRhRnJvbU5vZGUoYXNzZXRSb290Tm9kZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXJldCkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIGNvbnN0IHByZWZhYkRhdGEgPSByZXQucHJlZmFiRGF0YTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSBhd2FpdCBScGMuZ2V0SW5zdGFuY2UoKS5yZXF1ZXN0KCdhc3NldE1hbmFnZXInLCAncXVlcnlBc3NldEluZm8nLCBbb3V0TW9zdFByZWZhYkluZm8uYXNzZXQuX3V1aWRdKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghaW5mbykgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgICAgICBwcmVmYWJVdGlscy5maXJlQmVmb3JlQ2hhbmdlTXNnKG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUpO1xyXG4gICAgICAgICAgICBwcmVmYWJVdGlscy5kZWxldGVSZW1vdmVkQ29tcG9uZW50KG91dE1vc3RQcmVmYWJJbnN0YW5jZSwgdGFyZ2V0UGF0aCk7XHJcbiAgICAgICAgICAgIHByZWZhYlV0aWxzLmZpcmVDaGFuZ2VNc2cob3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZSk7XHJcblxyXG4gICAgICAgICAgICBhd2FpdCBScGMuZ2V0SW5zdGFuY2UoKS5yZXF1ZXN0KCdhc3NldE1hbmFnZXInLCAnY3JlYXRlQXNzZXQnLCBbe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBpbmZvLnNvdXJjZSxcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHByZWZhYkRhdGEsXHJcbiAgICAgICAgICAgICAgICBvdmVyd3JpdGU6IHRydWVcclxuICAgICAgICAgICAgfV0pO1xyXG5cclxuICAgICAgICAgICAgLy8gY2NlLlNjZW5lRmFjYWRlTWFuYWdlci5hYm9ydFNuYXBzaG90KCk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBub2RlVVVJRCxcclxuICAgICAgICAgICAgICAgIGNvbXBJbmRleCxcclxuICAgICAgICAgICAgICAgIGNvbXBEYXRhLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1bmRvIEFwcGx5UmVtb3ZlZENvbXBvbmVudCDmk43kvZxcclxuICAgICAqIEBwYXJhbSBJUmVtb3ZlZENvbXBvbmVudEluZm8g56e76Zmk55qEY29tcG9uZW505L+h5oGvXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyB1bmRvQXBwbHlSZW1vdmVkQ29tcG9uZW50KHJlbW92ZWRDb21wSW5mbzogSVJlbW92ZWRDb21wb25lbnRJbmZvKSB7XHJcbiAgICAgICAgaWYgKCFyZW1vdmVkQ29tcEluZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVNZ3IuZ2V0Tm9kZShyZW1vdmVkQ29tcEluZm8ubm9kZVVVSUQpO1xyXG5cclxuICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluc3RhbmNlSW5mbyA9IHByZWZhYlV0aWxzLmdldE91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8obm9kZSk7XHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZTogTm9kZSB8IG51bGwgPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvLm91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGU7XHJcbiAgICAgICAgaWYgKCFvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0UGF0aDogc3RyaW5nW10gPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvLnRhcmdldFBhdGg7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGNvbnN0IG91dE1vc3RQcmVmYWJJbnN0YW5jZTogUHJlZmFiLl91dGlscy5QcmVmYWJJbnN0YW5jZSB8IHVuZGVmaW5lZCA9IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGVbJ19wcmVmYWInXT8uaW5zdGFuY2U7XHJcblxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBjb25zdCBvdXRNb3N0UHJlZmFiSW5mbyA9IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICBpZiAob3V0TW9zdFByZWZhYkluc3RhbmNlICYmIG91dE1vc3RQcmVmYWJJbmZvICYmIG91dE1vc3RQcmVmYWJJbmZvLmFzc2V0KSB7XHJcbiAgICAgICAgICAgIHRhcmdldFBhdGguc3BsaWNlKDAsIDEpO1xyXG4gICAgICAgICAgICBjb25zdCBub2RlTG9jYWxJRCA9IHRhcmdldFBhdGguc2xpY2UoKTtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBub2RlTG9jYWxJRC5wdXNoKG5vZGVbJ19wcmVmYWInXS5maWxlSWQpO1xyXG4gICAgICAgICAgICBjb25zdCBjb21wRmlsZUlEID0gcmVtb3ZlZENvbXBJbmZvLmNvbXBEYXRhLl9fcHJlZmFiIS5maWxlSWQ7XHJcbiAgICAgICAgICAgIHRhcmdldFBhdGgucHVzaChjb21wRmlsZUlEKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0Um9vdE5vZGUgPSBwcmVmYWJVdGlscy5nZXRQcmVmYWJBc3NldE5vZGVJbnN0YW5jZShvdXRNb3N0UHJlZmFiSW5mbyk7XHJcbiAgICAgICAgICAgIGlmICghYXNzZXRSb290Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBub2RlSW5Bc3NldCA9IHByZWZhYlV0aWxzLmdldFRhcmdldChub2RlTG9jYWxJRCwgYXNzZXRSb290Tm9kZSk7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgbm9kZUluQXNzZXQuX2FkZENvbXBvbmVudEF0KHJlbW92ZWRDb21wSW5mby5jb21wRGF0YSwgcmVtb3ZlZENvbXBJbmZvLmNvbXBJbmRleCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCByZXQgPSBwcmVmYWJVdGlscy5nZW5lcmF0ZVByZWZhYkRhdGFGcm9tTm9kZShhc3NldFJvb3ROb2RlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghcmV0KSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBjb25zdCBpbmZvID0gYXdhaXQgUnBjLmdldEluc3RhbmNlKCkucmVxdWVzdCgnYXNzZXRNYW5hZ2VyJywgJ3F1ZXJ5QXNzZXRJbmZvJywgW291dE1vc3RQcmVmYWJJbmZvLmFzc2V0Ll91dWlkXSk7XHJcbiAgICAgICAgICAgIGlmICghaW5mbykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgcHJlZmFiVXRpbHMuZmlyZUJlZm9yZUNoYW5nZU1zZyhvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKTtcclxuICAgICAgICAgICAgcHJlZmFiVXRpbHMuYWRkUmVtb3ZlZENvbXBvbmVudChvdXRNb3N0UHJlZmFiSW5zdGFuY2UsIHRhcmdldFBhdGgpO1xyXG4gICAgICAgICAgICBwcmVmYWJVdGlscy5maXJlQ2hhbmdlTXNnKG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUpO1xyXG5cclxuICAgICAgICAgICAgYXdhaXQgUnBjLmdldEluc3RhbmNlKCkucmVxdWVzdCgnYXNzZXRNYW5hZ2VyJywgJ2NyZWF0ZUFzc2V0JywgW3tcclxuICAgICAgICAgICAgICAgIHRhcmdldDogaW5mby5zb3VyY2UsXHJcbiAgICAgICAgICAgICAgICBjb250ZW50OiByZXQucHJlZmFiRGF0YSxcclxuICAgICAgICAgICAgICAgIG92ZXJ3cml0ZTogdHJ1ZVxyXG4gICAgICAgICAgICB9XSk7XHJcbiAgICAgICAgICAgIC8vIGNjZS5TY2VuZUZhY2FkZU1hbmFnZXIuYWJvcnRTbmFwc2hvdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgYXBwbHlSZW1vdmVkQ29tcG9uZW50KG5vZGVVVUlEOiBzdHJpbmcsIGZpbGVJRDogc3RyaW5nKSB7XHJcbiAgICAgICAgLy8gY29uc3QgY29tbWFuZCA9IG5ldyBBcHBseVJlbW92ZUNvbXBvbmVudENvbW1hbmQoXHJcbiAgICAgICAgLy8gICAgIHRoaXMudW5kb0FwcGx5UmVtb3ZlZENvbXBvbmVudC5iaW5kKHRoaXMpLCB0aGlzLmRvQXBwbHlSZW1vdmVkQ29tcG9uZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgIC8vIGNvbnN0IHVuZG9JRCA9IGNjZS5TY2VuZUZhY2FkZU1hbmFnZXIuYmVnaW5SZWNvcmRpbmcobm9kZVVVSUQsIHsgY3VzdG9tQ29tbWFuZDogY29tbWFuZCB9KTtcclxuICAgICAgICBjb25zdCByZW1vdmVkQ29tcEluZm8gPSBhd2FpdCB0aGlzLmRvQXBwbHlSZW1vdmVkQ29tcG9uZW50KG5vZGVVVUlELCBmaWxlSUQpO1xyXG4gICAgICAgIGlmIChyZW1vdmVkQ29tcEluZm8pIHtcclxuICAgICAgICAgICAgLy8gY29tbWFuZC5yZW1vdmVkQ29tcEluZm8gPSByZW1vdmVkQ29tcEluZm87XHJcbiAgICAgICAgICAgIC8vIGNjZS5TY2VuZUZhY2FkZU1hbmFnZXIuZW5kUmVjb3JkaW5nKHVuZG9JRCk7XHJcbiAgICAgICAgICAgIC8vIGNjZS5TY2VuZUZhY2FkZU1hbmFnZXIuc25hcHNob3QoKTtcclxuICAgICAgICAgICAgLy8gY2NlLlNjZW5lRmFjYWRlTWFuYWdlci5hYm9ydFNuYXBzaG90KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gY2NlLlNjZW5lRmFjYWRlTWFuYWdlci5jYW5jZWxSZWNvcmRpbmcodW5kb0lEKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGNsb25lQ29tcG9uZW50VG9Ob2RlKG5vZGU6IE5vZGUsIGNsb25lZENvbXA6IENvbXBvbmVudCkge1xyXG4gICAgICAgIGNvbnN0IGNvcHlDb21wRHVtcCA9IGR1bXBVdGlsLmR1bXBDb21wb25lbnQoY2xvbmVkQ29tcCk7XHJcbiAgICAgICAgLy8g5LiN6KaB5ZCM5q2lX29iakZsYWdz77yM5ZCm5YiZ5Zug5Li65rKh5pyJb25FbmFibGXnmoTmoIforrDkvJrlr7zoh7RvbkRpc2FibGXkuI3ooqvosIPnlKhcclxuICAgICAgICAvLyBkZWxldGUgY29weUNvbXBEdW1wLnZhbHVlLl9vYmpGbGFncztcclxuICAgICAgICBjb25zdCBuZXdDb21wID0gbm9kZS5hZGRDb21wb25lbnQoanMuZ2V0Q2xhc3NOYW1lKGNsb25lZENvbXApKTtcclxuXHJcbiAgICAgICAgY29uc3QgY29tcG9uZW50cyA9IG5vZGUuY29tcG9uZW50cztcclxuICAgICAgICBpZiAoY29tcG9uZW50cyAmJiBjb21wb25lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBsYXN0SW5kZXggPSBjb21wb25lbnRzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIGNvbnN0IGxhc3RDb21wID0gY29tcG9uZW50c1tsYXN0SW5kZXhdO1xyXG4gICAgICAgICAgICBpZiAobGFzdENvbXAgJiYgbGFzdENvbXAgPT09IG5ld0NvbXApIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IGR1bXBVdGlsLnJlc3RvcmVQcm9wZXJ0eShub2RlLCBgX19jb21wc19fLiR7bGFzdEluZGV4fWAsIGNvcHlDb21wRHVtcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gTWlzc2luZ1NjcmlwdOeahF8kZXJpYWxpemVk6KaB54m55q6K6L+Y5Y6fXHJcbiAgICAgICAgICAgICAgICBpZiAobmV3Q29tcCBpbnN0YW5jZW9mIE1pc3NpbmdTY3JpcHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDov5nph4xfJGVyaWFsaXplZOWboOS4uuaciW5vZGXlvJXnlKjmsqHms5XnroDljZXnmoRjbG9uZeWHuuS4gOS7ve+8jOWPquiDvVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWFiOeUqHByZWZhYkFzc2V05LiK55qEY29tcG9uZW506Lqr5LiK55qE6YKj5Lu95pWw5o2uXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICAgICAgICAgICAgICAgIG5ld0NvbXAuXyRlcmlhbGl6ZWQgPSBjbG9uZWRDb21wLl8kZXJpYWxpemVkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pKk6ZSAIHJlbW92ZWRDb21wb25lbnTvvIzkvJrlsIZQcmVmYWJBc3NldOS4reeahENvbXBvbmVudOi/mOWOn+WIsOW9k+WJjeiKgueCueS4ilxyXG4gICAgICogQHBhcmFtIG5vZGVVVUlEIG5vZGXnmoRVVUlEXHJcbiAgICAgKiBAcGFyYW0gZmlsZUlEIGNvbXBvbmVudOeahGZpbGVJRFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgcmV2ZXJ0UmVtb3ZlZENvbXBvbmVudChub2RlVVVJRDogc3RyaW5nLCBmaWxlSUQ6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTWdyLmdldE5vZGUobm9kZVVVSUQpO1xyXG5cclxuICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluc3RhbmNlSW5mbyA9IHByZWZhYlV0aWxzLmdldE91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8obm9kZSk7XHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZTogTm9kZSB8IG51bGwgPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvLm91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGU7XHJcbiAgICAgICAgaWYgKCFvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0UGF0aDogc3RyaW5nW10gPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvLnRhcmdldFBhdGg7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGNvbnN0IG91dE1vc3RQcmVmYWJJbnN0YW5jZTogUHJlZmFiLl91dGlscy5QcmVmYWJJbnN0YW5jZSB8IHVuZGVmaW5lZCA9IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGVbJ19wcmVmYWInXT8uaW5zdGFuY2U7XHJcblxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBjb25zdCBvdXRNb3N0UHJlZmFiSW5mbyA9IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICBpZiAob3V0TW9zdFByZWZhYkluc3RhbmNlICYmIG91dE1vc3RQcmVmYWJJbmZvICYmIG91dE1vc3RQcmVmYWJJbmZvLmFzc2V0KSB7XHJcbiAgICAgICAgICAgIHRhcmdldFBhdGguc3BsaWNlKDAsIDEpO1xyXG4gICAgICAgICAgICB0YXJnZXRQYXRoLnB1c2goZmlsZUlEKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0Um9vdE5vZGUgPSBpbnN0YW50aWF0ZShvdXRNb3N0UHJlZmFiSW5mby5hc3NldCk7XHJcbiAgICAgICAgICAgIGlmICghYXNzZXRSb290Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHVuZG9JZCA9IGNjZS5TY2VuZUZhY2FkZU1hbmFnZXIuYmVnaW5SZWNvcmRpbmcoW291dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUudXVpZCwgbm9kZVVVSURdKTtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0Q29tcEluQXNzZXQgPSBwcmVmYWJVdGlscy5nZXRUYXJnZXQodGFyZ2V0UGF0aCwgYXNzZXRSb290Tm9kZSkgYXMgQ29tcG9uZW50O1xyXG5cclxuICAgICAgICAgICAgcHJlZmFiVXRpbHMuZmlyZUJlZm9yZUNoYW5nZU1zZyhub2RlKTtcclxuICAgICAgICAgICAgdGhpcy5pc1JldmVydGluZ1JlbW92ZWRDb21wb25lbnRzID0gdHJ1ZTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5jbG9uZUNvbXBvbmVudFRvTm9kZShub2RlLCB0YXJnZXRDb21wSW5Bc3NldCk7XHJcbiAgICAgICAgICAgIHRoaXMuaXNSZXZlcnRpbmdSZW1vdmVkQ29tcG9uZW50cyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBwcmVmYWJVdGlscy5maXJlQ2hhbmdlTXNnKG5vZGUpO1xyXG5cclxuICAgICAgICAgICAgcHJlZmFiVXRpbHMuZmlyZUJlZm9yZUNoYW5nZU1zZyhvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKTtcclxuICAgICAgICAgICAgcHJlZmFiVXRpbHMuZGVsZXRlUmVtb3ZlZENvbXBvbmVudChvdXRNb3N0UHJlZmFiSW5zdGFuY2UsIHRhcmdldFBhdGgpO1xyXG4gICAgICAgICAgICBwcmVmYWJVdGlscy5maXJlQ2hhbmdlTXNnKG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUpO1xyXG4gICAgICAgICAgICAvLyBjY2UuU2NlbmVGYWNhZGVNYW5hZ2VyLmVuZFJlY29yZGluZyh1bmRvSWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlTW91bnRlZENvbXBvbmVudHMobm9kZTogTm9kZSkge1xyXG4gICAgICAgIC8vIFByZWZhYkluc3RhbmNl5Lit5aKe5YqgL+WIoOmZpENvbXBvbmVudO+8jOmcgOimgeabtOaWsG1vdW50ZWRDb21wb25lbnRzXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSBub2RlWydfcHJlZmFiJ107XHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOWQkeS4iuafpeaJvlByZWZhYkluc3RhbmNl6Lev5b6EXHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluc3RhbmNlSW5mbyA9IHByZWZhYlV0aWxzLmdldE91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8obm9kZSk7XHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZTogTm9kZSB8IG51bGwgPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvLm91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGU7XHJcbiAgICAgICAgaWYgKCFvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0YXJnZXRQYXRoOiBzdHJpbmdbXSA9IG91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8udGFyZ2V0UGF0aDtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluZm8gPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlWydfcHJlZmFiJ107XHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluc3RhbmNlOiBQcmVmYWJJbnN0YW5jZSB8IHVuZGVmaW5lZCA9IG91dE1vc3RQcmVmYWJJbmZvPy5pbnN0YW5jZTtcclxuXHJcbiAgICAgICAgaWYgKCFvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlIHx8ICFvdXRNb3N0UHJlZmFiSW5mbyB8fCAhb3V0TW9zdFByZWZhYkluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGFzc2V0Um9vdE5vZGUgPSBwcmVmYWJVdGlscy5nZXRQcmVmYWJBc3NldE5vZGVJbnN0YW5jZShvdXRNb3N0UHJlZmFiSW5mbyk7XHJcbiAgICAgICAgaWYgKCFhc3NldFJvb3ROb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRhcmdldFBhdGguc3BsaWNlKDAsIDEpOyAvLyDkuI3pnIDopoHlrZjmnIDlpJblsYLnmoRQcmVmYWJJbnN0YW5jZeeahGZpbGVJRO+8jOaWueS+v292ZXJyaWRl5Y+v5Lul5ZyoUHJlZmFiSW5zdGFuY2XlpI3liLblkI7lpI3nlKggIFxyXG4gICAgICAgIHRhcmdldFBhdGgucHVzaChwcmVmYWJJbmZvLmZpbGVJZCk7XHJcblxyXG4gICAgICAgIGNvbnN0IG5vZGVJbkFzc2V0OiBOb2RlID0gcHJlZmFiVXRpbHMuZ2V0VGFyZ2V0KHRhcmdldFBhdGgsIGFzc2V0Um9vdE5vZGUpIGFzIE5vZGU7XHJcbiAgICAgICAgaWYgKCFub2RlSW5Bc3NldCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNvbXBzRmlsZUlEcyA9IG5vZGVJbkFzc2V0LmNvbXBvbmVudHMubWFwKChjb21wKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb21wLl9fcHJlZmFiPy5maWxlSWQ7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IG1vdW50ZWRDb21wb25lbnRzOiBDb21wb25lbnRbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbXAgPSBub2RlLmNvbXBvbmVudHNbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbXBQcmVmYWJJbmZvID0gY29tcC5fX3ByZWZhYjtcclxuICAgICAgICAgICAgLy8g6Z2eUHJlZmFi5Lit55qEY29tcG9uZW50XHJcbiAgICAgICAgICAgIGlmICghY29tcFByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgICAgIG1vdW50ZWRDb21wb25lbnRzLnB1c2goY29tcCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyDkuI3lnKhwcmVmYWJBc3NldOS4reeahGNvbXBvbmVudO+8jOimgeWKoOWIsG1vdW50ZWRDb21wb25lbnRzXHJcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBzRmlsZUlEcy5pbmNsdWRlcyhjb21wLl9fcHJlZmFiPy5maWxlSWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gMS4gbW91bnRlZFJvb3TkuLrnqbrooajnpLrkuLrmlrDliqDnmoRDb21wb25lbnRcclxuICAgICAgICAgICAgICAgICAgICAvLyAyLiBtb3VudGVkUm9vdOS4jeS4uuepuumcgOimgeafpeeci+aYr+S4jeaYr+aMguWcqOi/meS4qlByZWZhYkluc3RhbmNl6IqC54K55LiL55qE77yM5Zug5Li65Y+v6IO95piv5oyC5ZyoXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6YeM5bGCUHJlZmFiSW5zdGFuY2Xph4ws6L+Z6YeM5bCx5LiN5bqU6K+l6YeN5aSN5re75YqgXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbW91bnRlZFJvb3QgPSBwcmVmYWJVdGlscy5nZXRNb3VudGVkUm9vdChjb21wKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1vdW50ZWRSb290IHx8IG1vdW50ZWRSb290ID09PSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdW50ZWRDb21wb25lbnRzLnB1c2goY29tcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcmVmYWJVdGlscy5maXJlQmVmb3JlQ2hhbmdlTXNnKG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUpO1xyXG5cclxuICAgICAgICBpZiAobW91bnRlZENvbXBvbmVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBjb25zdCBtb3VudGVkQ29tcG9uZW50c0luZm8gPSBwcmVmYWJVdGlscy5nZXRQcmVmYWJJbnN0YW5jZU1vdW50ZWRDb21wb25lbnRzKG91dE1vc3RQcmVmYWJJbnN0YW5jZSwgdGFyZ2V0UGF0aCk7XHJcbiAgICAgICAgICAgIG1vdW50ZWRDb21wb25lbnRzSW5mby5jb21wb25lbnRzID0gbW91bnRlZENvbXBvbmVudHM7XHJcbiAgICAgICAgICAgIG1vdW50ZWRDb21wb25lbnRzSW5mby5jb21wb25lbnRzLmZvckVhY2goKGNvbXApID0+IHtcclxuICAgICAgICAgICAgICAgIHByZWZhYlV0aWxzLnNldE1vdW50ZWRSb290KGNvbXAsIG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dE1vc3RQcmVmYWJJbnN0YW5jZS5tb3VudGVkQ29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29tcEluZm8gPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2UubW91bnRlZENvbXBvbmVudHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY29tcEluZm8uaXNUYXJnZXQodGFyZ2V0UGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wSW5mby5jb21wb25lbnRzLmZvckVhY2goKGNvbXApID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiVXRpbHMuc2V0TW91bnRlZFJvb3QoY29tcCwgdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0TW9zdFByZWZhYkluc3RhbmNlLm1vdW50ZWRDb21wb25lbnRzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJlZmFiVXRpbHMuZmlyZUNoYW5nZU1zZyhvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXBwbHlNb3VudGVkQ29tcG9uZW50cyhub2RlOiBOb2RlKSB7XHJcbiAgICAgICAgY29uc3Qgcm9vdE5vZGU6IE5vZGUgPSBub2RlO1xyXG5cclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IHJvb3ROb2RlWydfcHJlZmFiJ107XHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5zdGFuY2UgPSBwcmVmYWJJbmZvLmluc3RhbmNlO1xyXG4gICAgICAgIGlmICghcHJlZmFiSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbW91bnRlZENvbXBzTWFwID0gbmV3IE1hcDxzdHJpbmdbXSwgSUNvbXBvbmVudFByZWZhYkRhdGE+KCk7XHJcbiAgICAgICAgY29uc3QgbW91bnRlZENvbXBvbmVudHMgPSBwcmVmYWJJbnN0YW5jZS5tb3VudGVkQ29tcG9uZW50cztcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtb3VudGVkQ29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBtb3VudGVkQ29tcG9uZW50SW5mbyA9IG1vdW50ZWRDb21wb25lbnRzW2ldO1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRJbmZvID0gbW91bnRlZENvbXBvbmVudEluZm8udGFyZ2V0SW5mbztcclxuICAgICAgICAgICAgaWYgKCF0YXJnZXRJbmZvKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHByZWZhYlV0aWxzLmdldFRhcmdldCh0YXJnZXRJbmZvLmxvY2FsSUQsIHJvb3ROb2RlKSBhcyBOb2RlO1xyXG4gICAgICAgICAgICBpZiAoIXRhcmdldCkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAvLyDmioptb3VudGVkQ29tcG9uZW50SW5mb+S4reeahOe7hOS7tuWKoOWIsFByZWZhYkFzc2V05LitXHJcbiAgICAgICAgICAgIG1vdW50ZWRDb21wb25lbnRJbmZvLmNvbXBvbmVudHMuZm9yRWFjaCgobW91bnRlZENvbXApID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghbW91bnRlZENvbXAuX19wcmVmYWIpIHtcclxuICAgICAgICAgICAgICAgICAgICBtb3VudGVkQ29tcC5fX3ByZWZhYiA9IG5ldyBDb21wUHJlZmFiSW5mbygpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vdW50ZWRDb21wLl9fcHJlZmFiLmZpbGVJZCA9IG1vdW50ZWRDb21wLnV1aWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyDoioLngrnmjILovb3ltYzlpZfpooTliLbkvZPouqvkuIpcclxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRJbmZvLmxvY2FsSUQubGVuZ3RoID4gMSkgeyBcclxuICAgICAgICAgICAgICAgICAgICBwcmVmYWJJbmZvLmluc3RhbmNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5lc3RlZEluc3RQcmVmYWJJbnN0YW5jZUluZm8gPSBwcmVmYWJVdGlscy5nZXRPdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvKHRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJlZmFiSW5mby5pbnN0YW5jZSA9IHByZWZhYkluc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5lc3RlZEluc3ROb2RlID0gbmVzdGVkSW5zdFByZWZhYkluc3RhbmNlSW5mby5vdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbmVzdGVkSW5zdE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5lc3RlZEluc3RQcmVmYWJJbmZvID0gbmVzdGVkSW5zdE5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW5lc3RlZEluc3RQcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmVzdGVkSW5zdFByZWZhYkluc3RhbmNlID0gbmVzdGVkSW5zdFByZWZhYkluZm8uaW5zdGFuY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFuZXN0ZWRJbnN0UHJlZmFiSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldFByZWZhYkluZm8gPSB0YXJnZXRbJ19wcmVmYWInXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRhcmdldFByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyDmm7TmlrDpooTliLbkvZPmlbDmja7vvIxsb2NhbElE5LuO56ys5LqM5Liq5byA5aeLKOaVsOaNruWtmOWcqOW1jOWll+mihOWItuS9k+WunuS+i+S4iu+8jOaJgOS7peWPr+S7peW/veeVpeesrOS4gOS4qmZpbGVJRCjoh6rouqspKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vdW50ZWROb2RlUGF0aCA9IG5lc3RlZEluc3RQcmVmYWJJbnN0YW5jZUluZm8udGFyZ2V0UGF0aC5zbGljZSgxKTtcclxuICAgICAgICAgICAgICAgICAgICBtb3VudGVkTm9kZVBhdGgucHVzaCh0YXJnZXRQcmVmYWJJbmZvLmZpbGVJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmVzdGVkTW91bnRlZENvbXBvbmVudEluZm8gPSBwcmVmYWJVdGlscy5nZXRQcmVmYWJJbnN0YW5jZU1vdW50ZWRDb21wb25lbnRzKG5lc3RlZEluc3RQcmVmYWJJbnN0YW5jZSwgbW91bnRlZE5vZGVQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXN0ZWRNb3VudGVkQ29tcG9uZW50SW5mby5jb21wb25lbnRzLnB1c2gobW91bnRlZENvbXApO1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYlV0aWxzLnNldE1vdW50ZWRSb290KG1vdW50ZWRDb21wLCBuZXN0ZWRJbnN0Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6K6w5b2VdW5kb+e0ouW8leaVsOaNrizku47moLnoioLngrnlvIDlp4vmib7vvIzmiYDku6XpnIDopoHnrKzkuIDkuKpmaWxlSURcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRQYXRoID0gbmVzdGVkSW5zdFByZWZhYkluc3RhbmNlSW5mby50YXJnZXRQYXRoLnNsaWNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UGF0aC5wdXNoKG1vdW50ZWRDb21wLl9fcHJlZmFiLmZpbGVJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW91bnRlZENvbXBzTWFwLnNldCh0YXJnZXRQYXRoLCB7cHJlZmFiSW5mbzogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBtb3VudGVkQ29tcHNNYXAuc2V0KFttb3VudGVkQ29tcC5fX3ByZWZhYi5maWxlSWRdLCB7cHJlZmFiSW5mbzogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYlV0aWxzLnNldE1vdW50ZWRSb290KG1vdW50ZWRDb21wLCB1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByZWZhYkluc3RhbmNlLm1vdW50ZWRDb21wb25lbnRzID0gW107XHJcblxyXG4gICAgICAgIHJldHVybiBtb3VudGVkQ29tcHNNYXA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjb21wb25lbnRPcGVyYXRpb24gPSBuZXcgQ29tcG9uZW50T3BlcmF0aW9uKCk7XHJcbiJdfQ==