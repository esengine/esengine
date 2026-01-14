'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.prefabUtils = exports.PrefabState = void 0;
const cc_1 = require("cc");
const node_utils_1 = require("../node/node-utils");
const core_1 = require("../core");
const common_1 = require("../../../common");
const PrefabInfo = cc_1.Prefab._utils.PrefabInfo;
const CompPrefabInfo = cc_1.Prefab._utils.CompPrefabInfo;
const PrefabInstance = cc_1.Prefab._utils.PrefabInstance;
const TargetInfo = cc_1.Prefab._utils.TargetInfo;
const PropertyOverrideInfo = cc_1.Prefab._utils.PropertyOverrideInfo;
const MountedChildrenInfo = cc_1.Prefab._utils.MountedChildrenInfo;
const TargetOverrideInfo = cc_1.Prefab._utils.TargetOverrideInfo;
const MountedComponentsInfo = cc_1.Prefab._utils.MountedComponentsInfo;
var PrefabState;
(function (PrefabState) {
    PrefabState[PrefabState["NotAPrefab"] = 0] = "NotAPrefab";
    PrefabState[PrefabState["PrefabChild"] = 1] = "PrefabChild";
    PrefabState[PrefabState["PrefabInstance"] = 2] = "PrefabInstance";
    PrefabState[PrefabState["PrefabLostAsset"] = 3] = "PrefabLostAsset";
})(PrefabState || (exports.PrefabState = PrefabState = {}));
const compKey = '_components';
const DELIMETER = cc_1.CCClass.Attr.DELIMETER;
function compareStringArray(array1, array2) {
    if (!array1 || !array2) {
        return false;
    }
    if (array1.length !== array2.length) {
        return false;
    }
    return array1.every((value, index) => value === array2[index]);
}
function isInClassChain(srcCtor, dstCtor) {
    if (srcCtor && dstCtor) {
        const chian = cc_1.CCClass.getInheritanceChain(srcCtor);
        chian.push(srcCtor);
        return chian.includes(dstCtor);
    }
    return false;
}
function isSameNode(src, dst) {
    return src.getPathInHierarchy() === dst.getPathInHierarchy() && src.getSiblingIndex() === dst.getSiblingIndex();
}
function pushNestedPrefab(nestedPrefabNode, root, paths) {
    let parent = nestedPrefabNode.parent;
    while (parent && parent !== root) {
        if (parent['_prefab']?.instance) {
            paths.unshift(parent['_prefab']?.instance.fileId);
        }
        parent = parent.parent;
    }
}
class PrefabUtil {
    static PrefabState = PrefabState;
    assetTargetMapCache = new Map();
    prefabAssetNodeInstanceMap = new Map(); // 用于PrefabAsset根节点实例化数据缓存，用于diff对比
    getPrefab(node) {
        return node['_prefab'];
    }
    // 发送节点修改前消息
    fireBeforeChangeMsg(node) {
        core_1.ServiceEvents.emit('node:before-change', node);
    }
    // 发送节点修改消息
    fireChangeMsg(node, opts = {}) {
        opts.type = common_1.NodeEventType.PREFAB_INFO_CHANGED;
        core_1.ServiceEvents.emit('node:change', node);
    }
    getPrefabAssetNodeInstance(prefabInfo) {
        if (this.prefabAssetNodeInstanceMap.has(prefabInfo)) {
            return this.prefabAssetNodeInstanceMap.get(prefabInfo);
        }
        let assetRootNode = undefined;
        if (prefabInfo && prefabInfo.asset && (0, cc_1.isValid)(prefabInfo.asset)) {
            assetRootNode = (0, cc_1.instantiate)(prefabInfo.asset);
        }
        if (assetRootNode) {
            // @ts-ignore
            const rootPrefabInfo = assetRootNode['_prefab'];
            if (rootPrefabInfo) {
                rootPrefabInfo.instance = prefabInfo.instance;
            }
            this.prefabAssetNodeInstanceMap.set(prefabInfo, assetRootNode);
        }
        return assetRootNode;
    }
    clearCache() {
        this.assetTargetMapCache.clear();
        this.prefabAssetNodeInstanceMap.clear();
    }
    removePrefabAssetNodeInstanceCache(prefabInfo) {
        if (this.prefabAssetNodeInstanceMap.has(prefabInfo)) {
            this.prefabAssetNodeInstanceMap.delete(prefabInfo);
        }
    }
    /**
     * 在编辑器中,node._prefab.instance.targetMap存在丢失的情况,比如新建预制体时
     * 所以编辑器中请不要通过引擎字段访问targetMap，从而去获取target
     * 请使用prefabUtil提供的方法来访问
     */
    getTargetMap(node, useCache = false) {
        if (useCache && this.assetTargetMapCache.has(node)) {
            return this.assetTargetMapCache.get(node);
        }
        const assetTargetMap = {};
        this.generateTargetMap(node, assetTargetMap, true);
        this.assetTargetMapCache.set(node, assetTargetMap);
        return assetTargetMap;
    }
    // 通过localID获取节点node上的节点
    getTarget(localID, node, useCache = false) {
        const targetMap = this.getTargetMap(node, useCache);
        return cc_1.Prefab._utils.getTarget(localID, targetMap);
    }
    // 与Prefab._utils.generateTargetMap不同的是，这个需要将mounted children都考虑进来
    generateTargetMap(node, targetMap, isRoot) {
        if (!node) {
            return;
        }
        let curTargetMap = targetMap;
        const prefabInstance = node['_prefab']?.instance;
        if (!isRoot && prefabInstance) {
            targetMap[prefabInstance.fileId] = {};
            curTargetMap = targetMap[prefabInstance.fileId];
        }
        const prefabInfo = node['_prefab'];
        if (prefabInfo) {
            curTargetMap[prefabInfo.fileId] = node;
        }
        const components = node.components;
        for (let i = 0; i < components.length; i++) {
            const comp = components[i];
            if (comp.__prefab) {
                curTargetMap[comp.__prefab.fileId] = comp;
            }
        }
        for (let i = 0; i < node.children.length; i++) {
            const childNode = node.children[i];
            this.generateTargetMap(childNode, curTargetMap, false);
        }
        if (prefabInstance && prefabInstance.mountedChildren.length > 0) {
            for (let i = 0; i < prefabInstance.mountedChildren.length; i++) {
                const childInfo = prefabInstance.mountedChildren[i];
                if (childInfo && childInfo.targetInfo) {
                    let mountedTargetMap = curTargetMap;
                    const localID = childInfo.targetInfo.localID;
                    if (localID.length > 0) {
                        for (let i = 0; i < localID.length - 1; i++) {
                            mountedTargetMap = mountedTargetMap[localID[i]];
                        }
                    }
                    // 如果目标节点是嵌套预制体时，可能出现挂载的节点已经不再是预制体实例的情况 #17493
                    if (childInfo.nodes && mountedTargetMap) {
                        for (let i = 0; i < childInfo.nodes.length; i++) {
                            const childNode = childInfo.nodes[i];
                            if (!childNode) {
                                continue;
                            }
                            // mounted node need to add to the target map
                            this.generateTargetMap(childNode, mountedTargetMap, false);
                        }
                    }
                }
            }
        }
    }
    getPropertyOverrideLocationInfo(node, pathKeys) {
        // 向上查找PrefabInstance路径
        const outMostPrefabInstanceInfo = this.getOutMostPrefabInstanceInfo(node);
        const outMostPrefabInstanceNode = outMostPrefabInstanceInfo.outMostPrefabInstanceNode;
        if (!outMostPrefabInstanceNode) {
            return null;
        }
        const targetPath = outMostPrefabInstanceInfo.targetPath;
        // @ts-ignore
        const outMostPrefabInstance = outMostPrefabInstanceNode['_prefab']?.instance;
        let target = node;
        if (outMostPrefabInstance) {
            targetPath.splice(0, 1); // 不需要存最外层的PrefabInstance的fileID，方便override可以在PrefabInstance复制后复用
            let relativePathKeys = []; // 相对于目标（node\component)的属性查找路径
            if (pathKeys.length <= 0) {
                return null;
            }
            if (pathKeys[0] === compKey) {
                if (pathKeys.length === 2) {
                    // modify component
                    return null;
                }
                if (pathKeys.length === 1) {
                    // TODO，改变components数组
                    return null;
                }
                // component
                const comp = node[pathKeys[0]][pathKeys[1]];
                if (comp.__prefab) {
                    targetPath.push(comp.__prefab.fileId);
                    relativePathKeys = pathKeys.slice(2);
                    target = comp;
                }
                else {
                    // console.error(`component: ${comp.name} doesn't have a prefabInfo`);
                    // mounted component doesn't have a prefabInfo
                    return null;
                }
            }
            else {
                // node
                // @ts-ignore
                const prefabInfo = node['_prefab'];
                if (prefabInfo) {
                    targetPath.push(prefabInfo.fileId);
                    relativePathKeys = pathKeys;
                }
                else {
                    console.error(`node: ${node.name} doesn't have a prefabInfo`);
                }
            }
            return { outMostPrefabInstanceNode, targetPath, relativePathKeys, target };
        }
        return null;
    }
    getPrefabForSerialize(node, quiet = undefined) {
        // deep clone, since we don't want the given node changed by codes below
        const cloneNode = (0, cc_1.instantiate)(node);
        // 在修改节点prefabInfo时先去掉mountedChild的挂载信息
        this.removeMountedRootInfo(cloneNode);
        const prefab = new cc.Prefab();
        const prefabInfo = this.createPrefabInfo(node.uuid);
        prefabInfo.asset = prefab;
        prefabInfo.root = cloneNode;
        // 复制预制体信息
        const oriPrefabInfo = this.getPrefab(cloneNode);
        if (oriPrefabInfo) {
            prefab.optimizationPolicy = oriPrefabInfo.asset?.optimizationPolicy;
            prefab.persistent = oriPrefabInfo.asset?.persistent;
            prefabInfo.targetOverrides = oriPrefabInfo.targetOverrides;
            prefabInfo.fileId = oriPrefabInfo.fileId;
        }
        // @ts-ignore
        cloneNode['_prefab'] = prefabInfo;
        const nestedInstNodes = [];
        // 给子节点设置prefabInfo-asset,处理nestedPrefabInstanceRoots和prefabRootNode
        this.walkNode(cloneNode, (child, isChild) => {
            // 私有节点不需要添加 prefabInfo 数据
            if (child.objFlags & cc.Object.Flags.HideInHierarchy) {
                return;
            }
            const childPrefab = this.getPrefab(child);
            if (childPrefab) {
                if (childPrefab.instance) {
                    // 处理嵌套预制体信息
                    const { outMostPrefabInstanceNode } = this.getOutMostPrefabInstanceInfo(child);
                    if (outMostPrefabInstanceNode === child) {
                        childPrefab.nestedPrefabInstanceRoots = undefined;
                        childPrefab.instance.prefabRootNode = cloneNode;
                        nestedInstNodes.push(child);
                    }
                }
                else {
                    if (child['_prefab']) {
                        child['_prefab'].root = prefabInfo.root;
                        child['_prefab'].asset = prefabInfo.asset;
                    }
                }
            }
            else {
                const newPrefab = new PrefabInfo();
                newPrefab.root = prefabInfo.root;
                newPrefab.asset = prefabInfo.asset;
                newPrefab.fileId = child.uuid;
                child['_prefab'] = newPrefab;
            }
            // 组件也添加 __prefab fileId 属性，以便复用
            if (child.components && child.components.length) {
                for (let i = 0; i < child.components.length; i++) {
                    const comp = child.components[i];
                    if (!comp.__prefab) {
                        comp.__prefab = new CompPrefabInfo();
                        comp.__prefab.fileId = comp.uuid;
                    }
                }
            }
        });
        prefabInfo.nestedPrefabInstanceRoots = nestedInstNodes.length > 0 ? nestedInstNodes : undefined;
        // 清理外部节点的引用,这里会清掉component的ID,必须在上述步骤执行完后才可以清(__prefab.fileId)
        const clearedReference = EditorExtends.PrefabUtils.checkAndStripNode(cloneNode, quiet);
        this.removeInvalidPrefabData(cloneNode);
        this.setMountedRoot(cloneNode, undefined);
        prefab.data = cloneNode;
        return {
            prefab: prefab,
            clearedReference: clearedReference,
        };
    }
    addPrefabInfo(node, rootNode, prefab) {
        return EditorExtends.PrefabUtils.addPrefabInfo(node, rootNode, prefab);
    }
    walkNode(node, handle, isChild = false) {
        EditorExtends.PrefabUtils.walkNode(node, handle, isChild);
    }
    addPrefabInfoToComponent(comp) {
        if (!comp.__prefab) {
            comp.__prefab = new CompPrefabInfo();
        }
        if (!comp.__prefab) {
            return;
        }
        comp.__prefab.fileId = comp.__prefab.fileId ? comp.__prefab.fileId : comp.uuid;
    }
    /**
     * 克隆一个节点，转为预制体，返回预制体序列化数据
     * 注意这个不会影响现有节点数据，但生成的预制体，会有部分外部引用数据被清理
     * @param {*} nodeUUID
     */
    generatePrefabDataFromNode(nodeUUID) {
        let node = null;
        if (typeof nodeUUID === 'string') {
            node = EditorExtends.Node.getNode(nodeUUID);
        }
        else {
            node = nodeUUID;
        }
        if (!node) {
            return null;
        }
        const { prefab, clearedReference } = this.getPrefabForSerialize(node);
        if (!prefab) {
            return null;
        }
        // 先去掉prefabInstance，等支持了Variant再实现不剔除的情况
        prefab.data['_prefab'].instance = undefined;
        // 拖拽生成prefab时要清理instance中对外部节点的引用，否则会把场景保存到prefab中
        this.removeInvalidPropertyOverrideReference(prefab.data);
        const data = EditorExtends.serialize(prefab);
        // 恢复clearedReference
        return {
            prefabData: data,
            clearedReference: clearedReference,
        };
        // return data as string;
    }
    removeMountedRootInfo(node) {
        // @ts-ignore
        const prefabInfo = node['_prefab'];
        if (!prefabInfo) {
            return;
        }
        if (!prefabInfo.instance) {
            return;
        }
        const mountedChildren = prefabInfo.instance.mountedChildren;
        mountedChildren.forEach((mountedChildInfo) => {
            mountedChildInfo.nodes.forEach((node) => {
                this.setMountedRoot(node, undefined);
            });
        });
        const mountedComponents = prefabInfo.instance.mountedComponents;
        mountedComponents.forEach((mountedCompInfo) => {
            mountedCompInfo.components.forEach((comp) => {
                this.setMountedRoot(comp, undefined);
            });
        });
    }
    generateUUID() {
        return EditorExtends.UuidUtils.generate(true);
    }
    createPrefabInstance() {
        const prefabInstance = new PrefabInstance();
        prefabInstance.fileId = this.generateUUID();
        return prefabInstance;
    }
    createPrefabInfo(fileId) {
        const prefabInfo = new PrefabInfo();
        prefabInfo.fileId = fileId;
        return prefabInfo;
    }
    cloneInstanceWithNewFileId(instance) {
        const newInstance = this.createPrefabInstance();
        // 复制propertyOverrides
        const cloneSourcePropOverrides = instance.propertyOverrides;
        newInstance.propertyOverrides = [];
        for (let i = 0; i < cloneSourcePropOverrides.length; i++) {
            const cloneSourcePropOverride = cloneSourcePropOverrides[i];
            const propOverride = new PropertyOverrideInfo();
            propOverride.targetInfo = cloneSourcePropOverride.targetInfo;
            propOverride.propertyPath = cloneSourcePropOverride.propertyPath;
            propOverride.value = cloneSourcePropOverride.value;
            newInstance.propertyOverrides.push(propOverride);
        }
        // 复制mountedChildren
        const cloneMountedChildren = instance.mountedChildren;
        newInstance.mountedChildren = [];
        for (let i = 0; i < cloneMountedChildren.length; i++) {
            const cloneSourceMountedChild = cloneMountedChildren[i];
            const mountedChild = new MountedChildrenInfo();
            mountedChild.targetInfo = cloneSourceMountedChild.targetInfo;
            mountedChild.nodes = cloneSourceMountedChild.nodes.slice();
            newInstance.mountedChildren.push(mountedChild);
        }
        // 复制mountedComponents
        const cloneMountedComponents = instance.mountedComponents;
        newInstance.mountedComponents = [];
        for (let i = 0; i < cloneMountedComponents.length; i++) {
            const cloneSourceMountedComp = cloneMountedComponents[i];
            const mountedComp = new MountedComponentsInfo();
            mountedComp.targetInfo = cloneSourceMountedComp.targetInfo;
            mountedComp.components = cloneSourceMountedComp.components.slice();
            newInstance.mountedComponents.push(mountedComp);
        }
        // 复制removedComponents
        newInstance.removedComponents = instance.removedComponents.slice();
        return newInstance;
    }
    getPrefabInstanceRoot(node) {
        let parent = node;
        let root = null;
        while (parent) {
            // @ts-ignore member access
            if (parent['_prefab']?.instance) {
                root = parent;
                break;
            }
            parent = parent.parent;
        }
        return root;
    }
    isSameSourceTargetOverride(targetOverride, source, sourceLocalID, propPath) {
        if (targetOverride.source === source &&
            ((!sourceLocalID && !targetOverride.sourceInfo) ||
                compareStringArray(sourceLocalID, targetOverride.sourceInfo?.localID)) &&
            compareStringArray(targetOverride.propertyPath, propPath)) {
            return true;
        }
        return false;
    }
    getSourceData(source) {
        // 如果source是一个普通节点下的Component，那直接指向它就可以
        // 如果source是一个mountedComponent，直接指向它就可以
        // 如果source是一个Prefab节点下的非mounted的Component，那就需要通过[根节点+LocalID]的方式来索引。
        let sourceTarget = source;
        let sourceLocalID;
        const sourceNode = source.node;
        if (!sourceNode) {
            return null;
        }
        // @ts-ignore
        if (sourceNode['_prefab'] && !this.isMountedComponent(source)) {
            // 向上查找PrefabInstance路径
            const outMostPrefabInstanceInfo = this.getOutMostPrefabInstanceInfo(sourceNode);
            const outMostPrefabInstanceNode = outMostPrefabInstanceInfo.outMostPrefabInstanceNode;
            if (outMostPrefabInstanceNode) {
                sourceTarget = outMostPrefabInstanceNode;
                sourceLocalID = outMostPrefabInstanceInfo.targetPath;
                sourceLocalID.splice(0, 1); // 不需要存最外层的PrefabInstance的fileID
                if (source.__prefab?.fileId) {
                    sourceLocalID.push(source.__prefab?.fileId);
                }
                else {
                    console.error(`can't get fileId of component: ${source.name} in node: ${source.node.name}`);
                }
            }
        }
        return { sourceTarget, sourceLocalID };
    }
    removeTargetOverrideBySource(prefabInfo, source) {
        if (!prefabInfo) {
            return false;
        }
        if (!prefabInfo.targetOverrides) {
            return false;
        }
        let isAnyRemoved = false;
        for (let i = prefabInfo.targetOverrides.length - 1; i >= 0; i--) {
            const targetOverrideItr = prefabInfo.targetOverrides[i];
            if (targetOverrideItr.source === source) {
                prefabInfo.targetOverrides.splice(i, 1);
                isAnyRemoved = true;
            }
        }
        return isAnyRemoved;
    }
    removeTargetOverride(prefabInfo, source, propPath) {
        if (!prefabInfo) {
            return false;
        }
        if (!prefabInfo.targetOverrides) {
            return false;
        }
        const sourceData = this.getSourceData(source);
        if (!sourceData) {
            return false;
        }
        const sourceTarget = sourceData.sourceTarget;
        const sourceLocalID = sourceData.sourceLocalID;
        let result = false;
        for (let i = prefabInfo.targetOverrides.length - 1; i >= 0; i--) {
            const targetOverrideItr = prefabInfo.targetOverrides[i];
            if (this.isSameSourceTargetOverride(targetOverrideItr, sourceTarget, sourceLocalID, propPath)) {
                prefabInfo.targetOverrides.splice(i, 1);
                result = true;
            }
        }
        return result;
    }
    isInTargetOverrides(targetOverrides, source, propPath) {
        const sourceData = this.getSourceData(source);
        if (!sourceData) {
            return false;
        }
        const sourceTarget = sourceData.sourceTarget;
        const sourceLocalID = sourceData.sourceLocalID;
        for (let i = 0; i < targetOverrides.length; i++) {
            const targetOverrideItr = targetOverrides[i];
            if (this.isSameSourceTargetOverride(targetOverrideItr, sourceTarget, sourceLocalID, propPath)) {
                return true;
            }
        }
        return false;
    }
    getTargetOverride(prefabInfo, source, propPath) {
        let targetOverride = null;
        if (!prefabInfo.targetOverrides) {
            prefabInfo.targetOverrides = [];
        }
        const sourceData = this.getSourceData(source);
        if (!sourceData) {
            return null;
        }
        const sourceTarget = sourceData.sourceTarget;
        const sourceLocalID = sourceData.sourceLocalID;
        for (let i = 0; i < prefabInfo.targetOverrides.length; i++) {
            const targetOverrideItr = prefabInfo.targetOverrides[i];
            if (this.isSameSourceTargetOverride(targetOverrideItr, sourceTarget, sourceLocalID, propPath)) {
                targetOverride = targetOverrideItr;
                break;
            }
        }
        if (!targetOverride) {
            targetOverride = new TargetOverrideInfo();
            targetOverride.source = sourceTarget;
            if (sourceLocalID) {
                targetOverride.sourceInfo = new TargetInfo();
                targetOverride.sourceInfo.localID = sourceLocalID;
            }
            targetOverride.propertyPath = propPath;
            prefabInfo.targetOverrides.push(targetOverride);
        }
        return targetOverride;
    }
    getPropertyOverridesOfTarget(prefabInstance, localID) {
        const propOverrides = [];
        for (let i = 0; i < prefabInstance.propertyOverrides.length; i++) {
            const propOverrideItr = prefabInstance.propertyOverrides[i];
            if (compareStringArray(propOverrideItr.targetInfo?.localID, localID)) {
                propOverrides.push(propOverrideItr);
            }
        }
        return propOverrides;
    }
    isInPropertyOverrides(propPath, propertyOverrides) {
        for (let i = 0; i < propertyOverrides.length; i++) {
            const propOverrideItr = propertyOverrides[i];
            if (compareStringArray(propOverrideItr.propertyPath, propPath)) {
                return true;
            }
        }
        return false;
    }
    getPropertyOverride(prefabInstance, localID, propPath) {
        let propOverride = null;
        let targetInfo = null;
        for (let i = 0; i < prefabInstance.propertyOverrides.length; i++) {
            const propOverrideItr = prefabInstance.propertyOverrides[i];
            if (compareStringArray(propOverrideItr.targetInfo?.localID, localID)) {
                // 复用已有的targetInfo，减少数据冗余
                targetInfo = propOverrideItr.targetInfo;
                if (compareStringArray(propOverrideItr.propertyPath, propPath)) {
                    propOverride = propOverrideItr;
                    break;
                }
            }
        }
        if (!propOverride) {
            propOverride = new PropertyOverrideInfo();
            if (!targetInfo) {
                targetInfo = new TargetInfo();
                targetInfo.localID = localID;
            }
            propOverride.targetInfo = targetInfo;
            propOverride.propertyPath = propPath;
            prefabInstance.propertyOverrides.push(propOverride);
        }
        return propOverride;
    }
    removePropertyOverride(prefabInstance, localID, propPath) {
        for (let i = prefabInstance.propertyOverrides.length - 1; i >= 0; i--) {
            const propOverrideItr = prefabInstance.propertyOverrides[i];
            if (compareStringArray(propOverrideItr.targetInfo?.localID, localID) &&
                compareStringArray(propOverrideItr.propertyPath, propPath)) {
                prefabInstance.propertyOverrides.splice(i, 1);
            }
        }
    }
    findPrefabInstanceMountedChildren(prefabInstance, localID) {
        let mountedChild = null;
        const mountedChildren = prefabInstance.mountedChildren;
        for (let i = 0; i < mountedChildren.length; i++) {
            const childInfo = mountedChildren[i];
            if (childInfo.isTarget(localID)) {
                mountedChild = childInfo;
                break;
            }
        }
        return mountedChild;
    }
    createMountedChildrenInfo(localID) {
        const targetInfo = new TargetInfo();
        targetInfo.localID = localID;
        const mountedChildInfo = new MountedChildrenInfo();
        mountedChildInfo.targetInfo = targetInfo;
        return mountedChildInfo;
    }
    getPrefabInstanceMountedChildren(prefabInstance, localID) {
        let mountedChild = this.findPrefabInstanceMountedChildren(prefabInstance, localID);
        if (!mountedChild) {
            mountedChild = this.createMountedChildrenInfo(localID);
            prefabInstance.mountedChildren.push(mountedChild);
        }
        return mountedChild;
    }
    getPrefabInstanceMountedComponents(prefabInstance, localID) {
        let mountedComponentsInfo = null;
        const mountedComponents = prefabInstance.mountedComponents;
        for (let i = 0; i < mountedComponents.length; i++) {
            const componentsInfo = mountedComponents[i];
            if (componentsInfo.isTarget(localID)) {
                mountedComponentsInfo = componentsInfo;
                break;
            }
        }
        if (!mountedComponentsInfo) {
            const targetInfo = new TargetInfo();
            targetInfo.localID = localID;
            mountedComponentsInfo = new MountedComponentsInfo();
            mountedComponentsInfo.targetInfo = targetInfo;
            prefabInstance.mountedComponents.push(mountedComponentsInfo);
        }
        return mountedComponentsInfo;
    }
    addRemovedComponent(prefabInstance, localID) {
        const removedComponents = prefabInstance.removedComponents;
        for (let i = 0; i < removedComponents.length; i++) {
            const targetInfo = removedComponents[i];
            if (compareStringArray(targetInfo.localID, localID)) {
                return;
            }
        }
        const targetInfo = new TargetInfo();
        targetInfo.localID = localID;
        removedComponents.push(targetInfo);
    }
    deleteRemovedComponent(prefabInstance, localID) {
        const removedComponents = prefabInstance.removedComponents;
        for (let i = 0; i < removedComponents.length; i++) {
            const targetInfo = removedComponents[i];
            if (compareStringArray(targetInfo.localID, localID)) {
                removedComponents.splice(i, 1);
                break;
            }
        }
    }
    /**
     * whether the node is child of a prefab
     * @param node node
     */
    isChildOfPrefabInstance(node) {
        let parent = node.parent;
        let hasPrefabRootInParent = false;
        while (parent) {
            // @ts-ignore: private member access
            if (parent['_prefab']?.instance) {
                hasPrefabRootInParent = true;
                break;
            }
            parent = parent.parent;
        }
        return hasPrefabRootInParent;
    }
    isPrefabInstanceRoot(node) {
        // @ts-ignore: private member access
        const prefabInfo = node['_prefab'];
        if (!prefabInfo || !prefabInfo.instance) {
            return false;
        }
        // @ts-ignore: private member access
        if (!prefabInfo.instance.prefabRootNode || !prefabInfo.instance.prefabRootNode['_prefab']?.instance) {
            return true;
        }
        return false;
    }
    isChildOfPrefabAsset(node) {
        // @ts-ignore: private member access
        const prefabInfo = node['_prefab'];
        if (!prefabInfo) {
            return false;
        }
        const parent = node.parent;
        if (!parent) {
            return false;
        }
        // @ts-ignore: private member access
        const parentPrefabInfo = parent['_prefab'];
        if (!parentPrefabInfo) {
            return false;
        }
        if (prefabInfo.root === parentPrefabInfo.root) {
            return true;
        }
        // 用于嵌套的prefab判断
        if (prefabInfo.instance?.prefabRootNode === parentPrefabInfo.root) {
            return true;
        }
        return false;
    }
    isPartOfPrefabAsset(node) {
        // @ts-ignore: private member access
        const prefabInfo = node['_prefab'];
        const outMostPrefabInfo = this.getOutMostPrefabInstanceInfo(node);
        if (prefabInfo && outMostPrefabInfo.outMostPrefabInstanceNode) {
            if (this.isMountedChildOf(outMostPrefabInfo.outMostPrefabInstanceNode, node)) {
                return false;
            }
            return true;
        }
        return false;
    }
    /**
     * whether the node is part of a prefab,
     * root of prefab is also part of prefab
     * @param node node
     */
    isPartOfPrefabInstance(node) {
        let parent = node;
        let hasPrefabRootInParent = false;
        while (parent) {
            // @ts-ignore: private member access
            if (parent['_prefab']?.instance) {
                hasPrefabRootInParent = true;
                break;
            }
            parent = parent.parent;
        }
        return hasPrefabRootInParent;
    }
    isPartOfAssetInPrefabInstance(node) {
        const isPartOfInstance = this.isPartOfPrefabInstance(node);
        if (!isPartOfInstance) {
            return false;
        }
        const isPartOfAsset = this.isPartOfPrefabAsset(node);
        return isPartOfAsset;
    }
    /**
     * 需要考虑很多种嵌套情况,需要注意mountedChild上又挂其它prefab的问题
     * 1. prefabA->node...
     * 2. prefabA->moutedNode->prefabB->node
     * 3. prefabA->moutedPrefabB->node
     * 4. prefabA->moutedPrefabB->prefabC->node
     * 5. prefabA->prefabB->node
     * @param node
     * @returns
     */
    getOutMostPrefabInstanceInfo(node) {
        const targetPath = [];
        let outMostPrefabInstanceNode = null;
        let nodeIter = node;
        while (nodeIter) {
            const prefabInstance = nodeIter['_prefab']?.instance;
            // 向上查找到第一个预制体实例节点，判断改实例是否有prefabRootNode(嵌套预制体)
            // 当预制体实例不存在prefabRootNode时,或者prefabRootNode指向了当前根节点时，说明找到了最外层预制体实例
            if (prefabInstance) {
                targetPath.unshift(prefabInstance.fileId);
                outMostPrefabInstanceNode = nodeIter;
                // 非嵌套预制体，直接返回
                if (!prefabInstance.prefabRootNode) {
                    break;
                }
                const prefabRoot = prefabInstance.prefabRootNode;
                const rootNode = core_1.Service.Editor.getRootNode();
                if (prefabRoot && rootNode && isSameNode(prefabRoot, rootNode)) {
                    break;
                }
                else {
                    // 是嵌套预制体，直接从prefabRootNode开始继续查找
                    // 需要把节点树中的prefabInstance的fileId加入到targetPath中，因为getTargetMap的生成是按照节点树生成的
                    pushNestedPrefab(nodeIter, prefabInstance.prefabRootNode, targetPath);
                    // 避免死循环
                    if (nodeIter !== prefabInstance.prefabRootNode) {
                        nodeIter = prefabInstance.prefabRootNode;
                    }
                    else {
                        console.warn('getOutMostPrefabInstanceInfo failed: prefab instance root node has loop');
                        break;
                    }
                    continue;
                }
            }
            nodeIter = nodeIter.parent;
        }
        return { outMostPrefabInstanceNode, targetPath };
    }
    isSceneNode(node) {
        if (node instanceof cc_1.Scene) {
            return true;
        }
        return false;
    }
    /**
     * 是否是嵌套的预制体
     * @param node
     * @private
     */
    isNestedPrefab(node) {
        const prefab = node['_prefab'];
        const assetUuid = prefab?.asset?.uuid;
        if (!prefab || !assetUuid)
            return false;
        let parent = node.parent;
        while (parent) {
            // 向上遍历到场景
            if (parent === parent.scene) {
                break;
            }
            const parentPrefabInfo = parent['_prefab'];
            if (parentPrefabInfo && assetUuid !== parentPrefabInfo.asset?.uuid) {
                // 如果检查的节点是预制体根节点就直接 true
                if (prefab.instance) {
                    return true;
                }
                const isNested = this.isNestedPrefab(parent);
                if (!isNested) {
                    return true;
                }
            }
            parent = parent.parent;
        }
        return false;
    }
    getPrefabStateInfo(node) {
        let prefabState = PrefabState.NotAPrefab;
        let isUnwrappable = false;
        let isRevertable = false;
        let isApplicable = false;
        let isAddedChild = false;
        let isNested = false;
        let assetUuid = '';
        if (this.isSceneNode(node)) {
            return { state: prefabState, isUnwrappable, isRevertable, isApplicable, isAddedChild, isNested, assetUuid };
        }
        // @ts-ignore
        if (node['_prefab']) {
            // @ts-ignore
            if (node['_prefab'].asset) {
                // @ts-ignore
                assetUuid = node['_prefab'].asset._uuid;
            }
            // @ts-ignore
            const prefabInstance = node['_prefab'].instance;
            if (prefabInstance) {
                isUnwrappable = true;
                isRevertable = true;
                isApplicable = true;
                prefabState = PrefabState.PrefabInstance;
                const { outMostPrefabInstanceNode } = this.getOutMostPrefabInstanceInfo(node);
                if (outMostPrefabInstanceNode !== node) {
                    isUnwrappable = false;
                    isRevertable = false;
                    isApplicable = false;
                }
            }
            else {
                prefabState = PrefabState.PrefabChild;
            }
            // 检查是否是嵌套 prefab
            isNested = this.isNestedPrefab(node);
            // @ts-ignore
            if (!node['_prefab'].asset || node['_prefab'].asset.isDefault || node['_prefab'].asset.uuid === '') {
                prefabState = PrefabState.PrefabLostAsset;
                // 资源丢失时要允许unlink
                isUnwrappable = true;
            }
            if (this.isSubAsset(assetUuid)) {
                isApplicable = false;
            }
        }
        if (node.parent && !this.isSceneNode(node.parent)) {
            // @ts-ignore
            const parentPrefabInfo = node.parent['_prefab'];
            if (parentPrefabInfo) {
                const outMostPrefabInstanceInfo = this.getOutMostPrefabInstanceInfo(node.parent);
                if (outMostPrefabInstanceInfo && outMostPrefabInstanceInfo.outMostPrefabInstanceNode) {
                    if (this.isMountedChildOf(outMostPrefabInstanceInfo.outMostPrefabInstanceNode, node)) {
                        isAddedChild = true;
                    }
                }
            }
        }
        return { state: prefabState, isUnwrappable, isRevertable, isApplicable, isAddedChild, isNested, assetUuid };
    }
    getMountedRoot(nodeOrComp) {
        return nodeOrComp[cc_1.editorExtrasTag]?.mountedRoot;
    }
    setMountedRoot(nodeOrComp, mountedRoot) {
        if (!nodeOrComp) {
            return;
        }
        if (!nodeOrComp[cc_1.editorExtrasTag]) {
            nodeOrComp[cc_1.editorExtrasTag] = {};
        }
        nodeOrComp[cc_1.editorExtrasTag].mountedRoot = mountedRoot;
    }
    // 待优化，这里要是增加的节点多了会比较费时
    isMountedChildOf(prefabInstanceNode, node) {
        const mountedRoot = this.getMountedRoot(node);
        if (mountedRoot && mountedRoot === prefabInstanceNode) {
            return true;
        }
        return false;
    }
    isMountedComponent(component) {
        const node = component.node;
        if (!node) {
            return false;
        }
        const outMostPrefabInstanceInfo = this.getOutMostPrefabInstanceInfo(node);
        const outMostPrefabInstanceNode = outMostPrefabInstanceInfo.outMostPrefabInstanceNode;
        if (!outMostPrefabInstanceNode) {
            return false;
        }
        const mountedRoot = this.getMountedRoot(component);
        if (mountedRoot && mountedRoot === outMostPrefabInstanceNode) {
            return true;
        }
        return false;
    }
    getRemovedComponents(node) {
        const removedComps = [];
        // @ts-ignore
        const prefabInfo = node['_prefab'];
        if (!prefabInfo) {
            return removedComps;
        }
        const outMostPrefabInstanceInfo = this.getOutMostPrefabInstanceInfo(node);
        const outMostPrefabInstanceNode = outMostPrefabInstanceInfo.outMostPrefabInstanceNode;
        if (!outMostPrefabInstanceNode) {
            return removedComps;
        }
        const targetPath = outMostPrefabInstanceInfo.targetPath;
        // @ts-ignore
        const outMostPrefabInstance = outMostPrefabInstanceNode['_prefab']?.instance;
        // @ts-ignore
        const outMostPrefabInfo = outMostPrefabInstanceNode['_prefab'];
        if (outMostPrefabInstance && outMostPrefabInfo && outMostPrefabInfo.asset) {
            if (outMostPrefabInstance.removedComponents.length <= 0) {
                return removedComps;
            }
            targetPath.splice(0, 1);
            targetPath.push(prefabInfo.fileId);
            const assetRootNode = this.getPrefabAssetNodeInstance(outMostPrefabInfo);
            if (!assetRootNode) {
                return removedComps;
            }
            const assetNode = this.getTarget(targetPath, assetRootNode, true);
            if (!assetNode) {
                return removedComps;
            }
            const curCompFileIDs = node.components.map((comp) => comp.__prefab?.fileId).filter((id) => !!id);
            for (const assetComp of assetNode.components) {
                if (assetComp.__prefab) {
                    if (!curCompFileIDs.includes(assetComp.__prefab.fileId)) {
                        removedComps.push(assetComp);
                    }
                }
            }
        }
        return removedComps;
    }
    checkToRemoveTargetOverride(source, root) {
        if (!root) {
            return;
        }
        // @ts-ignore
        if (this.removeTargetOverrideBySource(root['_prefab'], source)) {
            this.fireChangeMsg(root);
        }
    }
    findOutmostPrefabInstanceNodes(node, instanceRoots) {
        if (!node)
            return;
        const prefabInfo = node['_prefab'];
        if (prefabInfo?.instance) {
            // 遇到预制体时，要对mountedchildren进行递归,不能无脑对子节点递归
            instanceRoots.push(node);
            // 清空预制体及其嵌套预制体的nestedPrefabInstanceRoots
            if (prefabInfo.nestedPrefabInstanceRoots) {
                prefabInfo.nestedPrefabInstanceRoots.forEach((prefabNode) => {
                    // @ts-ignore
                    if (prefabNode['_prefab']) {
                        // @ts-ignore
                        prefabNode['_prefab'].nestedPrefabInstanceRoots = undefined;
                    }
                });
                prefabInfo.nestedPrefabInstanceRoots = undefined;
            }
            prefabInfo.instance?.mountedChildren?.forEach((mountedChildrenInfo) => {
                mountedChildrenInfo.nodes.forEach((child) => {
                    this.findOutmostPrefabInstanceNodes(child, instanceRoots);
                });
            });
        }
        else {
            // 普通节点一直递归
            node.children.forEach((child) => {
                this.findOutmostPrefabInstanceNodes(child, instanceRoots);
            });
        }
    }
    gatherPrefabInstanceRoots(rootNode) {
        // gather prefabInstance node info
        const instanceRoots = [];
        rootNode.children.forEach((child) => {
            if ((0, node_utils_1.isEditorNode)(child)) {
                return;
            }
            this.findOutmostPrefabInstanceNodes(child, instanceRoots);
        });
        if (instanceRoots.length > 0) {
            if (!rootNode['_prefab']) {
                rootNode['_prefab'] = this.createPrefabInfo(rootNode.uuid);
            }
            const rootPrefabInfo = rootNode['_prefab'];
            rootPrefabInfo.nestedPrefabInstanceRoots = instanceRoots;
        }
        else {
            const rootPrefabInfo = rootNode['_prefab'];
            if (rootPrefabInfo) {
                rootPrefabInfo.nestedPrefabInstanceRoots = undefined;
            }
        }
    }
    // public collectPrefabInstanceIDs(rootNode: Node){
    //     const prefabInfo = this.getPrefab(rootNode);
    //     const instances = prefabInfo?.nestedPrefabInstanceRoots;
    //     if (instances && instances.length > 0) {
    //         // 遍历instance上所有子节点（包括mounted的节点）
    //         instances.forEach(node => {
    //             const prefab = this.getPrefab(node);
    //             if (prefab && !this.getMountedRoot(node)) {
    //                 const ids: string[] = [];
    //                 node.walk((child) => {
    //                     ids.push(child.uuid);
    //                     child.components.forEach(component => {
    //                         if (component.uuid){
    //                             ids.push(component.uuid);
    //                         }
    //                     });
    //                 });
    //                 if (prefab.instance?.ids) {
    //                     prefab.instance.ids = ids;
    //                 }
    //                 // console.log('收集后的预制体id', prefab.instance?.ids.length);
    //             }
    //         });
    //     }
    // }
    // prefab 是否是子资源，比如FBX生成的prefab
    isSubAsset(uuid) {
        return uuid.includes('@');
    }
    removePrefabInfo(node) {
        this.fireBeforeChangeMsg(node);
        // @ts-ignore member access
        node['_prefab'] = null;
        // remove component prefabInfo
        node.components.forEach((comp) => {
            comp.__prefab = null;
        });
        this.fireChangeMsg(node);
    }
    // 有可能一些意外情况导致错误的MountedRoot的引用
    // 导致序列化了一些无效的数据
    // 这里校验MountedRoot的数是否准确
    checkMountedRootData(node, recursively) {
        const mountedRoot = this.getMountedRoot(node);
        if (mountedRoot) {
            let isRight = false;
            // @ts-ignore
            const prefabInstance = mountedRoot['_prefab']?.instance;
            if (prefabInstance && prefabInstance.mountedChildren) {
                for (let i = 0; i < prefabInstance.mountedChildren.length; i++) {
                    const mountedInfo = prefabInstance.mountedChildren[i];
                    if (mountedInfo.nodes.includes(node)) {
                        isRight = true;
                        break;
                    }
                }
            }
            if (!isRight) {
                // 校验不通过，删除MountedRoot数据
                this.setMountedRoot(node, undefined);
            }
        }
        node.components.forEach((comp) => {
            const compMountedRoot = this.getMountedRoot(comp);
            if (compMountedRoot) {
                let isRight = false;
                // @ts-ignore
                const prefabInstance = compMountedRoot['_prefab']?.instance;
                if (prefabInstance && prefabInstance.mountedComponents) {
                    for (let i = 0; i < prefabInstance.mountedComponents.length; i++) {
                        const mountedInfo = prefabInstance.mountedComponents[i];
                        if (mountedInfo.components.includes(comp)) {
                            isRight = true;
                            break;
                        }
                    }
                }
                if (!isRight) {
                    // 校验不通过，删除MountedRoot数据
                    this.setMountedRoot(comp, undefined);
                }
            }
        });
        if (recursively) {
            node.children.forEach((child) => {
                this.checkMountedRootData(child, true);
            });
        }
    }
    removePrefabInstanceRoots(rootNode) {
        const prefabInfo = rootNode['_prefab'];
        if (prefabInfo) {
            prefabInfo.nestedPrefabInstanceRoots = undefined;
        }
    }
    // 有些targetOverride里的source都为空了，需要去掉这些
    // 冗余数据
    checkTargetOverridesData(node) {
        const prefabInfo = node['_prefab'];
        if (!prefabInfo) {
            return;
        }
        const targetOverrides = prefabInfo.targetOverrides;
        if (!targetOverrides) {
            return;
        }
        for (let i = targetOverrides.length - 1; i >= 0; i--) {
            const targetOverrideItr = targetOverrides[i];
            if (!targetOverrideItr || !targetOverrideItr.source) {
                targetOverrides.splice(i, 1);
            }
        }
    }
    /**
     * 判断节点是否是最外一层的PrefabInstance的Mounted节点
     * mountedChild的普通子节点也需要判断
     * @param node
     * @returns
     */
    isOutmostPrefabInstanceMountedChildren(node) {
        let nodeIter = node;
        while (nodeIter) {
            const mountedRoot = this.getMountedRoot(nodeIter);
            if (mountedRoot) {
                const outMostPrefabInstanceInfo = this.getOutMostPrefabInstanceInfo(mountedRoot);
                const outMostPrefabInstanceNode = outMostPrefabInstanceInfo.outMostPrefabInstanceNode;
                // 节点是挂在最外层的PrefabInstance下的mountedChildren
                if (outMostPrefabInstanceNode === mountedRoot) {
                    return true;
                }
            }
            nodeIter = nodeIter.parent;
            if (!nodeIter || this.isPrefabInstanceRoot(nodeIter)) {
                break;
            }
        }
        return false;
    }
    /**
     * 移除无效的propertyOverrides信息,移除组件时，需要移除关于该组件的propertyOverrides
     * @param root 预制体实例节点
     */
    removeInvalidPropertyOverrides(root) {
        const prefabInfo = root['_prefab'];
        if (prefabInfo && prefabInfo.instance) {
            const instance = prefabInfo.instance;
            const propertyOverrides = instance.propertyOverrides;
            const size = propertyOverrides.length;
            const targetMap = this.getTargetMap(root);
            if (!targetMap || Object.keys(targetMap).length === 0) {
                console.debug('removeInvalidPropertyOverrides return,targetMap is empty', root);
                return;
            }
            for (let index = size - 1; index >= 0; index--) {
                const propOverride = propertyOverrides[index];
                const targetInfo = propOverride.targetInfo;
                if (targetInfo) {
                    // 判断targetInfo是否存在，不存在的话，移除数据
                    const target = cc_1.Prefab._utils.getTarget(targetInfo.localID, targetMap);
                    if (!target) {
                        propertyOverrides.splice(index, 1);
                        // console.log('移除无效的propertyOverrides信息', propOverride);
                    }
                }
            }
        }
    }
    /**
     * 脚本属性不存在时，或者预制体内的子节点/组件丢失时,要移除数据
     * @param root
     * @returns
     */
    removeInvalidTargetOverrides(root) {
        const prefabInfo = root?.['_prefab'];
        if (prefabInfo) {
            const targetOverrides = prefabInfo.targetOverrides;
            if (!targetOverrides)
                return;
            for (let index = targetOverrides.length - 1; index >= 0; index--) {
                const info = targetOverrides[index];
                // 判断引用节点是否存在
                let source = info.source;
                const sourceInfo = info.sourceInfo;
                let target = null;
                const targetInfo = info.targetInfo;
                if (sourceInfo) {
                    if (info.source instanceof cc_1.Node) {
                        source = this.getTarget(sourceInfo.localID, info.source);
                    }
                }
                // source (引用的节点或组件)
                // info.target (被引用的目标节点的预制体根节点)
                // targetInfo (被引用的 TargetInfo 信息，用来定位具体在哪个)
                // 1.如果 source 与 info.target 都没有也就是查询不到 target 也需要剔除
                if (!source && !info.target) {
                    targetOverrides.splice(index, 1);
                    continue;
                }
                // 2.如果没有 source 存在 info.target 也存在 targetInfo，但是需要查询一下是否有 target，如果没有就进行剔除
                if (!source && info.target && targetInfo && targetInfo.localID) {
                    target = this.getTarget(targetInfo.localID, info.target);
                    if (!target) {
                        targetOverrides.splice(index, 1);
                        continue;
                    }
                }
                if (!source || !targetInfo) {
                    continue;
                }
                if (!(info.target instanceof cc_1.Node)) {
                    continue;
                }
                target = this.getTarget(targetInfo.localID, info.target);
                if (!target) {
                    continue;
                }
                // 属性不存在，目标不存在,类型不一致，则移除属性
                const propertyPath = info.propertyPath.slice();
                let targetPropOwner = source;
                for (let i = 0; i < propertyPath.length; i++) {
                    const propName = propertyPath[i];
                    const attr = cc_1.CCClass.Attr.getClassAttrs(targetPropOwner.constructor);
                    targetPropOwner = targetPropOwner[propName];
                    // propertyPath中间可能会断掉，比如数组被清空
                    if (!targetPropOwner) {
                        targetOverrides.splice(index, 1);
                        break;
                    }
                    if (i === propertyPath.length - 1) {
                        const attrKey = propName + DELIMETER + 'ctor';
                        // 条件一: 当前值的属性目标值类型匹配
                        // 条件二：脚本中的属性类型（attr的ctor）应该是target的父类
                        // #14140 #14944 #13612 #14007
                        // 这里的逻辑经过反复修改，因为可能性实在太多了
                        // 需要考虑数组变化，类型变化，值残留，自定义类型，子类等
                        // 后续应该将清理的操作用户变成用户主动操作,在面板中显示实例上的override信息，并提供删除选项
                        if (!isInClassChain(targetPropOwner.constructor, target.constructor)
                            || (attr && attr[attrKey] && !isInClassChain(target.constructor, attr[attrKey]))) {
                            targetOverrides.splice(index, 1);
                        }
                    }
                }
            }
        }
    }
    /**
     * 清理预制体冗余数据
     * @param root
     */
    removeInvalidPrefabData(root) {
        // 清理targetOverrides
        this.removeInvalidTargetOverrides(root);
        // 清理propertyOverrides
        const prefabInfo = root['_prefab'];
        const nestedInstance = prefabInfo?.nestedPrefabInstanceRoots;
        if (nestedInstance) {
            // 嵌套预制体
            nestedInstance.forEach((node) => {
                this.removeInvalidPropertyOverrides(node);
            });
        }
    }
    /**
     * 清除预制体中，嵌套预制体的propertOverrides对非预制体子节点的引用
     * @param root 预制体根节点
     * @return {nestedPrefabInstanceRoots:{illegalReference}}
     */
    removeInvalidPropertyOverrideReference(root) {
        const prefabInfo = this.getPrefab(root);
        const ret = new Map();
        if (prefabInfo) {
            prefabInfo.nestedPrefabInstanceRoots?.forEach((prefabInstanceNode) => {
                const nestPrefabInfo = this.getPrefab(prefabInstanceNode);
                const propertyOverrides = nestPrefabInfo?.instance?.propertyOverrides;
                if (propertyOverrides) {
                    for (let index = propertyOverrides.length - 1; index >= 0; index--) {
                        const props = propertyOverrides[index];
                        let val = props.value;
                        if (val instanceof cc.Component.EventHandler) {
                            val = val.target;
                        }
                        else if (val instanceof cc.Component) {
                            val = val.node;
                        }
                        if (val && val instanceof cc.Node && !val.isChildOf(root)) {
                            // console.warn('cleanIllegalPropertyOverrideReference', props);
                            propertyOverrides.splice(index, 1);
                            let backUp = ret.get(prefabInstanceNode);
                            if (!backUp) {
                                backUp = [];
                                ret.set(prefabInstanceNode, backUp);
                            }
                            backUp.push(props);
                        }
                    }
                }
            });
        }
        return ret;
    }
}
exports.prefabUtils = new PrefabUtil();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9zY2VuZS9zY2VuZS1wcm9jZXNzL3NlcnZpY2UvcHJlZmFiL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsMkJBQW9HO0FBQ3BHLG1EQUFrRDtBQUNsRCxrQ0FBaUQ7QUFDakQsNENBQTZEO0FBRzdELE1BQU0sVUFBVSxHQUFHLFdBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBRTVDLE1BQU0sY0FBYyxHQUFHLFdBQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDO0FBRXBELE1BQU0sY0FBYyxHQUFHLFdBQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDO0FBRXBELE1BQU0sVUFBVSxHQUFHLFdBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBRTVDLE1BQU0sb0JBQW9CLEdBQUcsV0FBTSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztBQUVoRSxNQUFNLG1CQUFtQixHQUFHLFdBQU0sQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUM7QUFFOUQsTUFBTSxrQkFBa0IsR0FBRyxXQUFNLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDO0FBRTVELE1BQU0scUJBQXFCLEdBQUcsV0FBTSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQztBQUVsRSxJQUFZLFdBS1g7QUFMRCxXQUFZLFdBQVc7SUFDbkIseURBQWMsQ0FBQTtJQUNkLDJEQUFlLENBQUE7SUFDZixpRUFBa0IsQ0FBQTtJQUNsQixtRUFBbUIsQ0FBQTtBQUN2QixDQUFDLEVBTFcsV0FBVywyQkFBWCxXQUFXLFFBS3RCO0FBRUQsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDO0FBQzlCLE1BQU0sU0FBUyxHQUFHLFlBQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBRXpDLFNBQVMsa0JBQWtCLENBQUMsTUFBNEIsRUFBRSxNQUE0QjtJQUNsRixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDckIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEMsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssS0FBSyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsT0FBWSxFQUFFLE9BQVk7SUFDOUMsSUFBSSxPQUFPLElBQUksT0FBTyxFQUFFLENBQUM7UUFDckIsTUFBTSxLQUFLLEdBQUcsWUFBTyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25ELEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEIsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsR0FBUyxFQUFFLEdBQVM7SUFDcEMsT0FBTyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxHQUFHLENBQUMsZUFBZSxFQUFFLEtBQUssR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ3BILENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLGdCQUFzQixFQUFFLElBQVUsRUFBRSxLQUFlO0lBQ3pFLElBQUksTUFBTSxHQUFHLGdCQUFnQixDQUFDLE1BQWMsQ0FBQztJQUM3QyxPQUFPLE1BQU0sSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDL0IsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUM7WUFDOUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFDRCxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQWMsQ0FBQztJQUNuQyxDQUFDO0FBQ0wsQ0FBQztBQUVELE1BQU0sVUFBVTtJQUNMLE1BQU0sQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ2hDLG1CQUFtQixHQUFrQixJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQy9DLDBCQUEwQixHQUEwQixJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsbUNBQW1DO0lBRW5HLFNBQVMsQ0FBQyxJQUFVO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxZQUFZO0lBQ0wsbUJBQW1CLENBQUMsSUFBVTtRQUNqQyxvQkFBYSxDQUFDLElBQUksQ0FBYyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsV0FBVztJQUNKLGFBQWEsQ0FBQyxJQUFrQixFQUFFLE9BQVksRUFBRTtRQUNuRCxJQUFJLENBQUMsSUFBSSxHQUFHLHNCQUFhLENBQUMsbUJBQW1CLENBQUM7UUFDOUMsb0JBQWEsQ0FBQyxJQUFJLENBQWMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFTSwwQkFBMEIsQ0FBQyxVQUFzQjtRQUNwRCxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUNsRCxPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVELElBQUksYUFBYSxHQUFxQixTQUFTLENBQUM7UUFDaEQsSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLEtBQUssSUFBSSxJQUFBLFlBQU8sRUFBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUM5RCxhQUFhLEdBQUcsSUFBQSxnQkFBVyxFQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQsSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUNoQixhQUFhO1lBQ2IsTUFBTSxjQUFjLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELElBQUksY0FBYyxFQUFFLENBQUM7Z0JBQ2pCLGNBQWMsQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztZQUNsRCxDQUFDO1lBRUQsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELE9BQU8sYUFBYSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxVQUFVO1FBQ2IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM1QyxDQUFDO0lBRU0sa0NBQWtDLENBQUMsVUFBc0I7UUFDNUQsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFDbEQsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2RCxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxZQUFZLENBQUMsSUFBVSxFQUFFLFFBQVEsR0FBRyxLQUFLO1FBQzVDLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNqRCxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVELE1BQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVuRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztRQUVuRCxPQUFPLGNBQWMsQ0FBQztJQUMxQixDQUFDO0lBRUQsd0JBQXdCO0lBQ2pCLFNBQVMsQ0FBQyxPQUFpQixFQUFFLElBQVUsRUFBRSxRQUFRLEdBQUcsS0FBSztRQUM1RCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNwRCxPQUFPLFdBQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQsa0VBQWtFO0lBQzFELGlCQUFpQixDQUFDLElBQVUsRUFBRSxTQUFjLEVBQUUsTUFBZTtRQUNqRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDUixPQUFPO1FBQ1gsQ0FBQztRQUNELElBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQztRQUU3QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxDQUFDO1FBQ2pELElBQUksQ0FBQyxNQUFNLElBQUksY0FBYyxFQUFFLENBQUM7WUFDNUIsU0FBUyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdEMsWUFBWSxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuQyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ2IsWUFBWSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDM0MsQ0FBQztRQUVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN6QyxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztZQUM5QyxDQUFDO1FBQ0wsQ0FBQztRQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzVDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVELElBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzlELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM3RCxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQ3BDLElBQUksZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO29CQUNwQyxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztvQkFDN0MsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO3dCQUNyQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs0QkFDMUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3BELENBQUM7b0JBQ0wsQ0FBQztvQkFDRCw4Q0FBOEM7b0JBQzlDLElBQUksU0FBUyxDQUFDLEtBQUssSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO3dCQUN0QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs0QkFDOUMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFFckMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dDQUNiLFNBQVM7NEJBQ2IsQ0FBQzs0QkFFRCw2Q0FBNkM7NEJBQzdDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQy9ELENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRU0sK0JBQStCLENBQUMsSUFBVSxFQUFFLFFBQWtCO1FBQ2pFLHVCQUF1QjtRQUN2QixNQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxRSxNQUFNLHlCQUF5QixHQUFnQix5QkFBeUIsQ0FBQyx5QkFBeUIsQ0FBQztRQUNuRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUM3QixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsTUFBTSxVQUFVLEdBQWEseUJBQXlCLENBQUMsVUFBVSxDQUFDO1FBQ2xFLGFBQWE7UUFDYixNQUFNLHFCQUFxQixHQUE2Qyx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsRUFBRSxRQUFRLENBQUM7UUFFdkgsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUkscUJBQXFCLEVBQUUsQ0FBQztZQUN4QixVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGlFQUFpRTtZQUMxRixJQUFJLGdCQUFnQixHQUFhLEVBQUUsQ0FBQyxDQUFDLCtCQUErQjtZQUVwRSxJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFFRCxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUN4QixtQkFBbUI7b0JBQ25CLE9BQU8sSUFBSSxDQUFDO2dCQUNoQixDQUFDO2dCQUVELElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDeEIsc0JBQXNCO29CQUN0QixPQUFPLElBQUksQ0FBQztnQkFDaEIsQ0FBQztnQkFFRCxZQUFZO2dCQUNaLE1BQU0sSUFBSSxHQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckQsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ2hCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDdEMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckMsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDbEIsQ0FBQztxQkFBTSxDQUFDO29CQUNKLHNFQUFzRTtvQkFDdEUsOENBQThDO29CQUM5QyxPQUFPLElBQUksQ0FBQztnQkFDaEIsQ0FBQztZQUNMLENBQUM7aUJBQU0sQ0FBQztnQkFDSixPQUFPO2dCQUNQLGFBQWE7Z0JBQ2IsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVuQyxJQUFJLFVBQVUsRUFBRSxDQUFDO29CQUNiLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNuQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUM7Z0JBQ2hDLENBQUM7cUJBQU0sQ0FBQztvQkFDSixPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksNEJBQTRCLENBQUMsQ0FBQztnQkFDbEUsQ0FBQztZQUNMLENBQUM7WUFFRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQy9FLENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0scUJBQXFCLENBQUMsSUFBVSxFQUFFLFFBQTZCLFNBQVM7UUFDM0Usd0VBQXdFO1FBQ3hFLE1BQU0sU0FBUyxHQUFHLElBQUEsZ0JBQVcsRUFBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyx1Q0FBdUM7UUFDdkMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXRDLE1BQU0sTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQy9CLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEQsVUFBVSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7UUFDMUIsVUFBVSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7UUFFNUIsVUFBVTtRQUNWLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFlLENBQUM7UUFDOUQsSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUNoQixNQUFNLENBQUMsa0JBQWtCLEdBQUcsYUFBYSxDQUFDLEtBQUssRUFBRSxrQkFBa0IsQ0FBQztZQUNwRSxNQUFNLENBQUMsVUFBVSxHQUFHLGFBQWEsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDO1lBQ3BELFVBQVUsQ0FBQyxlQUFlLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQztZQUMzRCxVQUFVLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUM7UUFDN0MsQ0FBQztRQUNELGFBQWE7UUFDYixTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsVUFBVSxDQUFDO1FBRWxDLE1BQU0sZUFBZSxHQUFXLEVBQUUsQ0FBQztRQUNuQyxvRUFBb0U7UUFDcEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFXLEVBQUUsT0FBZ0IsRUFBRSxFQUFFO1lBQ3ZELDBCQUEwQjtZQUMxQixJQUFJLEtBQUssQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ25ELE9BQU87WUFDWCxDQUFDO1lBQ0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQyxJQUFJLFdBQVcsRUFBRSxDQUFDO2dCQUNkLElBQUksV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUN2QixZQUFZO29CQUNaLE1BQU0sRUFBRSx5QkFBeUIsRUFBRSxHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDL0UsSUFBSSx5QkFBeUIsS0FBSyxLQUFLLEVBQUUsQ0FBQzt3QkFDdEMsV0FBVyxDQUFDLHlCQUF5QixHQUFHLFNBQVMsQ0FBQzt3QkFDbEQsV0FBVyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO3dCQUNoRCxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNoQyxDQUFDO2dCQUNMLENBQUM7cUJBQU0sQ0FBQztvQkFDSixJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO3dCQUNuQixLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7d0JBQ3hDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztvQkFDOUMsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLE1BQU0sU0FBUyxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ25DLFNBQVMsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztnQkFDakMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO2dCQUNuQyxTQUFTLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBRTlCLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUM7WUFDakMsQ0FBQztZQUVELGdDQUFnQztZQUNoQyxJQUFJLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDOUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQy9DLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQzt3QkFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFDckMsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsVUFBVSxDQUFDLHlCQUF5QixHQUFHLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUVoRywrREFBK0Q7UUFDL0QsTUFBTSxnQkFBZ0IsR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV2RixJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7UUFDeEIsT0FBTztZQUNILE1BQU0sRUFBRSxNQUFNO1lBQ2QsZ0JBQWdCLEVBQUUsZ0JBQWdCO1NBQ3JDLENBQUM7SUFDTixDQUFDO0lBRU0sYUFBYSxDQUFDLElBQVUsRUFBRSxRQUFjLEVBQUUsTUFBMEI7UUFDdkUsT0FBTyxhQUFhLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFTSxRQUFRLENBQUMsSUFBVSxFQUFFLE1BQXdELEVBQUUsT0FBTyxHQUFHLEtBQUs7UUFDakcsYUFBYSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRU0sd0JBQXdCLENBQUMsSUFBZTtRQUMzQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUN6QyxDQUFDO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqQixPQUFPO1FBQ1gsQ0FBQztRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUNuRixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLDBCQUEwQixDQUFDLFFBQXVCO1FBQ3JELElBQUksSUFBSSxHQUFnQixJQUFJLENBQUM7UUFDN0IsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUMvQixJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEQsQ0FBQzthQUFNLENBQUM7WUFDSixJQUFJLEdBQUcsUUFBUSxDQUFDO1FBQ3BCLENBQUM7UUFFRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDUixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsTUFBTSxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDVixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQseUNBQXlDO1FBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztRQUU1QyxtREFBbUQ7UUFDbkQsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV6RCxNQUFNLElBQUksR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTdDLHFCQUFxQjtRQUNyQixPQUFPO1lBQ0gsVUFBVSxFQUFFLElBQWM7WUFDMUIsZ0JBQWdCLEVBQUUsZ0JBQWdCO1NBQ3JDLENBQUM7UUFDRix5QkFBeUI7SUFDN0IsQ0FBQztJQUVNLHFCQUFxQixDQUFDLElBQVU7UUFDbkMsYUFBYTtRQUNiLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxPQUFPO1FBQ1gsQ0FBQztRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdkIsT0FBTztRQUNYLENBQUM7UUFFRCxNQUFNLGVBQWUsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQztRQUM1RCxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsRUFBRTtZQUN6QyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUM7UUFDaEUsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDMUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDekMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxZQUFZO1FBQ2YsT0FBTyxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU0sb0JBQW9CO1FBQ3ZCLE1BQU0sY0FBYyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFDNUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFNUMsT0FBTyxjQUFjLENBQUM7SUFDMUIsQ0FBQztJQUVNLGdCQUFnQixDQUFDLE1BQWM7UUFDbEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUNwQyxVQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUMzQixPQUFPLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBRU0sMEJBQTBCLENBQUMsUUFBd0I7UUFDdEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDaEQsc0JBQXNCO1FBQ3RCLE1BQU0sd0JBQXdCLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixDQUFDO1FBQzVELFdBQVcsQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7UUFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3ZELE1BQU0sdUJBQXVCLEdBQUcsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxvQkFBb0IsRUFBRSxDQUFDO1lBQ2hELFlBQVksQ0FBQyxVQUFVLEdBQUcsdUJBQXVCLENBQUMsVUFBVSxDQUFDO1lBQzdELFlBQVksQ0FBQyxZQUFZLEdBQUcsdUJBQXVCLENBQUMsWUFBWSxDQUFDO1lBQ2pFLFlBQVksQ0FBQyxLQUFLLEdBQUcsdUJBQXVCLENBQUMsS0FBSyxDQUFDO1lBQ25ELFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVELG9CQUFvQjtRQUNwQixNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUM7UUFDdEQsV0FBVyxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDakMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ25ELE1BQU0sdUJBQXVCLEdBQUcsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1lBQy9DLFlBQVksQ0FBQyxVQUFVLEdBQUcsdUJBQXVCLENBQUMsVUFBVSxDQUFDO1lBQzdELFlBQVksQ0FBQyxLQUFLLEdBQUcsdUJBQXVCLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzNELFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRCxzQkFBc0I7UUFDdEIsTUFBTSxzQkFBc0IsR0FBRyxRQUFRLENBQUMsaUJBQWlCLENBQUM7UUFDMUQsV0FBVyxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztRQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsc0JBQXNCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDckQsTUFBTSxzQkFBc0IsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RCxNQUFNLFdBQVcsR0FBRyxJQUFJLHFCQUFxQixFQUFFLENBQUM7WUFDaEQsV0FBVyxDQUFDLFVBQVUsR0FBRyxzQkFBc0IsQ0FBQyxVQUFVLENBQUM7WUFDM0QsV0FBVyxDQUFDLFVBQVUsR0FBRyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbkUsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRUQsc0JBQXNCO1FBQ3RCLFdBQVcsQ0FBQyxpQkFBaUIsR0FBRyxRQUFRLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFbkUsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUVNLHFCQUFxQixDQUFDLElBQVU7UUFDbkMsSUFBSSxNQUFNLEdBQWdCLElBQUksQ0FBQztRQUMvQixJQUFJLElBQUksR0FBZ0IsSUFBSSxDQUFDO1FBQzdCLE9BQU8sTUFBTSxFQUFFLENBQUM7WUFDWiwyQkFBMkI7WUFDM0IsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUM7Z0JBQzlCLElBQUksR0FBRyxNQUFNLENBQUM7Z0JBQ2QsTUFBTTtZQUNWLENBQUM7WUFDRCxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUMzQixDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELDBCQUEwQixDQUFDLGNBQWtDLEVBQUUsTUFBd0IsRUFBRSxhQUFtQyxFQUFFLFFBQWtCO1FBQzVJLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxNQUFNO1lBQ2hDLENBQUMsQ0FBQyxDQUFDLGFBQWEsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUM7Z0JBQzNDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzFFLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUM1RCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELGFBQWEsQ0FBQyxNQUFpQjtRQUMzQix1Q0FBdUM7UUFDdkMsdUNBQXVDO1FBQ3ZDLHFFQUFxRTtRQUNyRSxJQUFJLFlBQVksR0FBcUIsTUFBTSxDQUFDO1FBQzVDLElBQUksYUFBYSxDQUFDO1FBQ2xCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDL0IsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVELGFBQWE7UUFDYixJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQzVELHVCQUF1QjtZQUN2QixNQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoRixNQUFNLHlCQUF5QixHQUFnQix5QkFBeUIsQ0FBQyx5QkFBeUIsQ0FBQztZQUVuRyxJQUFJLHlCQUF5QixFQUFFLENBQUM7Z0JBQzVCLFlBQVksR0FBRyx5QkFBeUIsQ0FBQztnQkFDekMsYUFBYSxHQUFHLHlCQUF5QixDQUFDLFVBQVUsQ0FBQztnQkFDckQsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0M7Z0JBQzVELElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQztvQkFDMUIsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNoRCxDQUFDO3FCQUFNLENBQUM7b0JBQ0osT0FBTyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsTUFBTSxDQUFDLElBQUksYUFBYSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ2hHLENBQUM7WUFFTCxDQUFDO1FBQ0wsQ0FBQztRQUVELE9BQU8sRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLENBQUM7SUFDM0MsQ0FBQztJQUVNLDRCQUE0QixDQUFDLFVBQWtDLEVBQUUsTUFBd0I7UUFDNUYsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDOUIsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVELElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztRQUN6QixLQUFLLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDOUQsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hELElBQUksaUJBQWlCLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRSxDQUFDO2dCQUN0QyxVQUFVLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDeEIsQ0FBQztRQUNMLENBQUM7UUFFRCxPQUFPLFlBQVksQ0FBQztJQUN4QixDQUFDO0lBRU0sb0JBQW9CLENBQUMsVUFBeUMsRUFBRSxNQUFpQixFQUFFLFFBQWtCO1FBQ3hHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzlCLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFRCxNQUFNLFlBQVksR0FBcUIsVUFBVSxDQUFDLFlBQVksQ0FBQztRQUMvRCxNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBRS9DLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNuQixLQUFLLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDOUQsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hELElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLGlCQUFpQixFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDNUYsVUFBVSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLENBQUM7UUFDTCxDQUFDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVNLG1CQUFtQixDQUFDLGVBQXFDLEVBQUUsTUFBaUIsRUFBRSxRQUFrQjtRQUNuRyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFRCxNQUFNLFlBQVksR0FBcUIsVUFBVSxDQUFDLFlBQVksQ0FBQztRQUMvRCxNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBRS9DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDOUMsTUFBTSxpQkFBaUIsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0MsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUM1RixPQUFPLElBQUksQ0FBQztZQUNoQixDQUFDO1FBQ0wsQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxVQUFzQixFQUFFLE1BQWlCLEVBQUUsUUFBa0I7UUFDbEYsSUFBSSxjQUFjLEdBQThCLElBQUksQ0FBQztRQUNyRCxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzlCLFVBQVUsQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO1FBQ3BDLENBQUM7UUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxNQUFNLFlBQVksR0FBcUIsVUFBVSxDQUFDLFlBQVksQ0FBQztRQUMvRCxNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBRS9DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3pELE1BQU0saUJBQWlCLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4RCxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQzVGLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQztnQkFDbkMsTUFBTTtZQUNWLENBQUM7UUFDTCxDQUFDO1FBRUQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ2xCLGNBQWMsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7WUFDMUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUM7WUFDckMsSUFBSSxhQUFhLEVBQUUsQ0FBQztnQkFDaEIsY0FBYyxDQUFDLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUM3QyxjQUFjLENBQUMsVUFBVSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUM7WUFDdEQsQ0FBQztZQUNELGNBQWMsQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO1lBQ3ZDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFRCxPQUFPLGNBQWMsQ0FBQztJQUMxQixDQUFDO0lBRU0sNEJBQTRCLENBQUMsY0FBOEIsRUFBRSxPQUFpQjtRQUNqRixNQUFNLGFBQWEsR0FBMkIsRUFBRSxDQUFDO1FBQ2pELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDL0QsTUFBTSxlQUFlLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVELElBQUksa0JBQWtCLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDbkUsYUFBYSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN4QyxDQUFDO1FBQ0wsQ0FBQztRQUVELE9BQU8sYUFBYSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxxQkFBcUIsQ0FBQyxRQUFrQixFQUFFLGlCQUF5QztRQUN0RixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDaEQsTUFBTSxlQUFlLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0MsSUFBSSxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQzdELE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUM7UUFDTCxDQUFDO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLG1CQUFtQixDQUFDLGNBQThCLEVBQUUsT0FBaUIsRUFBRSxRQUFrQjtRQUM1RixJQUFJLFlBQVksR0FBZ0MsSUFBSSxDQUFDO1FBQ3JELElBQUksVUFBVSxHQUFzQixJQUFJLENBQUM7UUFDekMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMvRCxNQUFNLGVBQWUsR0FBRyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUQsSUFBSSxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNuRSx5QkFBeUI7Z0JBQ3pCLFVBQVUsR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDO2dCQUN4QyxJQUFJLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztvQkFDN0QsWUFBWSxHQUFHLGVBQWUsQ0FBQztvQkFDL0IsTUFBTTtnQkFDVixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDaEIsWUFBWSxHQUFHLElBQUksb0JBQW9CLEVBQUUsQ0FBQztZQUUxQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ2QsVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQzlCLFVBQVUsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ2pDLENBQUM7WUFFRCxZQUFZLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztZQUNyQyxZQUFZLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztZQUNyQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRCxPQUFPLFlBQVksQ0FBQztJQUN4QixDQUFDO0lBRU0sc0JBQXNCLENBQUMsY0FBOEIsRUFBRSxPQUFpQixFQUFFLFFBQWtCO1FBQy9GLEtBQUssSUFBSSxDQUFDLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3BFLE1BQU0sZUFBZSxHQUFHLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1RCxJQUFJLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQztnQkFDaEUsa0JBQWtCLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUM3RCxjQUFjLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFTSxpQ0FBaUMsQ0FBQyxjQUE4QixFQUFFLE9BQWlCO1FBQ3RGLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQztRQUN4QixNQUFNLGVBQWUsR0FBRyxjQUFjLENBQUMsZUFBZSxDQUFDO1FBQ3ZELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDOUMsTUFBTSxTQUFTLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUM5QixZQUFZLEdBQUcsU0FBUyxDQUFDO2dCQUN6QixNQUFNO1lBQ1YsQ0FBQztRQUNMLENBQUM7UUFFRCxPQUFPLFlBQVksQ0FBQztJQUN4QixDQUFDO0lBRU0seUJBQXlCLENBQUMsT0FBaUI7UUFDOUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUNwQyxVQUFVLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUM3QixNQUFNLGdCQUFnQixHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztRQUNuRCxnQkFBZ0IsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBRXpDLE9BQU8sZ0JBQWdCLENBQUM7SUFDNUIsQ0FBQztJQUVNLGdDQUFnQyxDQUFDLGNBQThCLEVBQUUsT0FBaUI7UUFDckYsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVuRixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDaEIsWUFBWSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RCxjQUFjLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsT0FBTyxZQUFZLENBQUM7SUFDeEIsQ0FBQztJQUVNLGtDQUFrQyxDQUFDLGNBQThCLEVBQUUsT0FBaUI7UUFDdkYsSUFBSSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7UUFDakMsTUFBTSxpQkFBaUIsR0FBRyxjQUFjLENBQUMsaUJBQWlCLENBQUM7UUFDM0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2hELE1BQU0sY0FBYyxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNuQyxxQkFBcUIsR0FBRyxjQUFjLENBQUM7Z0JBQ3ZDLE1BQU07WUFDVixDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ3pCLE1BQU0sVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7WUFDcEMsVUFBVSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDN0IscUJBQXFCLEdBQUcsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO1lBQ3BELHFCQUFxQixDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDOUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFFRCxPQUFPLHFCQUFxQixDQUFDO0lBQ2pDLENBQUM7SUFFTSxtQkFBbUIsQ0FBQyxjQUE4QixFQUFFLE9BQWlCO1FBQ3hFLE1BQU0saUJBQWlCLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixDQUFDO1FBQzNELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNoRCxNQUFNLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QyxJQUFJLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDbEQsT0FBTztZQUNYLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUNwQyxVQUFVLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUM3QixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVNLHNCQUFzQixDQUFDLGNBQThCLEVBQUUsT0FBaUI7UUFDM0UsTUFBTSxpQkFBaUIsR0FBRyxjQUFjLENBQUMsaUJBQWlCLENBQUM7UUFDM0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2hELE1BQU0sVUFBVSxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksa0JBQWtCLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNsRCxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixNQUFNO1lBQ1YsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksdUJBQXVCLENBQUMsSUFBVTtRQUNyQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3pCLElBQUkscUJBQXFCLEdBQUcsS0FBSyxDQUFDO1FBQ2xDLE9BQU8sTUFBTSxFQUFFLENBQUM7WUFDWixvQ0FBb0M7WUFDcEMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUM7Z0JBQzlCLHFCQUFxQixHQUFHLElBQUksQ0FBQztnQkFDN0IsTUFBTTtZQUNWLENBQUM7WUFDRCxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUMzQixDQUFDO1FBRUQsT0FBTyxxQkFBcUIsQ0FBQztJQUNqQyxDQUFDO0lBRU0sb0JBQW9CLENBQUMsSUFBVTtRQUNsQyxvQ0FBb0M7UUFDcEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRW5DLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdEMsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVELG9DQUFvQztRQUNwQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxjQUFjLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQztZQUNsRyxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLG9CQUFvQixDQUFDLElBQVU7UUFDbEMsb0NBQW9DO1FBQ3BDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVuQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDVixPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRUQsb0NBQW9DO1FBQ3BDLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3BCLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDNUMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVELGdCQUFnQjtRQUNoQixJQUFJLFVBQVUsQ0FBQyxRQUFRLEVBQUUsY0FBYyxLQUFLLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hFLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0sbUJBQW1CLENBQUMsSUFBVTtRQUNqQyxvQ0FBb0M7UUFDcEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRW5DLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xFLElBQUksVUFBVSxJQUFJLGlCQUFpQixDQUFDLHlCQUF5QixFQUFFLENBQUM7WUFDNUQsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDM0UsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLHNCQUFzQixDQUFDLElBQVU7UUFDcEMsSUFBSSxNQUFNLEdBQWdCLElBQUksQ0FBQztRQUMvQixJQUFJLHFCQUFxQixHQUFHLEtBQUssQ0FBQztRQUNsQyxPQUFPLE1BQU0sRUFBRSxDQUFDO1lBQ1osb0NBQW9DO1lBQ3BDLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDO2dCQUM5QixxQkFBcUIsR0FBRyxJQUFJLENBQUM7Z0JBQzdCLE1BQU07WUFDVixDQUFDO1lBQ0QsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDM0IsQ0FBQztRQUVELE9BQU8scUJBQXFCLENBQUM7SUFDakMsQ0FBQztJQUVNLDZCQUE2QixDQUFDLElBQVU7UUFDM0MsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDcEIsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyRCxPQUFPLGFBQWEsQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0ksNEJBQTRCLENBQUMsSUFBVTtRQUMxQyxNQUFNLFVBQVUsR0FBYSxFQUFFLENBQUM7UUFDaEMsSUFBSSx5QkFBeUIsR0FBZ0IsSUFBSSxDQUFDO1FBQ2xELElBQUksUUFBUSxHQUFnQixJQUFJLENBQUM7UUFFakMsT0FBTyxRQUFRLEVBQUUsQ0FBQztZQUNkLE1BQU0sY0FBYyxHQUE2QyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxDQUFDO1lBQy9GLGdEQUFnRDtZQUNoRCxtRUFBbUU7WUFDbkUsSUFBSSxjQUFjLEVBQUUsQ0FBQztnQkFDakIsVUFBVSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzFDLHlCQUF5QixHQUFHLFFBQVEsQ0FBQztnQkFDckMsY0FBYztnQkFDZCxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUNqQyxNQUFNO2dCQUNWLENBQUM7Z0JBQ0QsTUFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDLGNBQWMsQ0FBQztnQkFDakQsTUFBTSxRQUFRLEdBQUcsY0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQVUsQ0FBQztnQkFDdEQsSUFBSSxVQUFVLElBQUksUUFBUSxJQUFJLFVBQVUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztvQkFDN0QsTUFBTTtnQkFDVixDQUFDO3FCQUFNLENBQUM7b0JBQ0osaUNBQWlDO29CQUNqQyx5RUFBeUU7b0JBQ3pFLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUN0RSxRQUFRO29CQUNSLElBQUksUUFBUSxLQUFLLGNBQWMsQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDN0MsUUFBUSxHQUFHLGNBQWMsQ0FBQyxjQUFjLENBQUM7b0JBQzdDLENBQUM7eUJBQU0sQ0FBQzt3QkFDSixPQUFPLENBQUMsSUFBSSxDQUFDLHlFQUF5RSxDQUFDLENBQUM7d0JBQ3hGLE1BQU07b0JBQ1YsQ0FBQztvQkFDRCxTQUFTO2dCQUNiLENBQUM7WUFDTCxDQUFDO1lBQ0QsUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDL0IsQ0FBQztRQUVELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxVQUFVLEVBQUUsQ0FBQztJQUNyRCxDQUFDO0lBRUQsV0FBVyxDQUFDLElBQVU7UUFDbEIsSUFBSSxJQUFJLFlBQVksVUFBSyxFQUFFLENBQUM7WUFDeEIsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssY0FBYyxDQUFDLElBQVU7UUFDN0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sU0FBUyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFFeEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN6QixPQUFPLE1BQU0sRUFBRSxDQUFDO1lBQ1osVUFBVTtZQUNWLElBQUksTUFBTSxLQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDMUIsTUFBTTtZQUNWLENBQUM7WUFDRCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzQyxJQUFJLGdCQUFnQixJQUFJLFNBQVMsS0FBSyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUM7Z0JBQ2pFLHlCQUF5QjtnQkFDekIsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ2xCLE9BQU8sSUFBSSxDQUFDO2dCQUNoQixDQUFDO2dCQUNELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDWixPQUFPLElBQUksQ0FBQztnQkFDaEIsQ0FBQztZQUNMLENBQUM7WUFDRCxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUMzQixDQUFDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLGtCQUFrQixDQUFDLElBQVU7UUFDaEMsSUFBSSxXQUFXLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQztRQUN6QyxJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztRQUN6QixJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDekIsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUVuQixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUN6QixPQUFPLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDO1FBQ2hILENBQUM7UUFFRCxhQUFhO1FBQ2IsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUNsQixhQUFhO1lBQ2IsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3hCLGFBQWE7Z0JBQ2IsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQzVDLENBQUM7WUFFRCxhQUFhO1lBQ2IsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUVoRCxJQUFJLGNBQWMsRUFBRSxDQUFDO2dCQUNqQixhQUFhLEdBQUcsSUFBSSxDQUFDO2dCQUNyQixZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUNwQixZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUNwQixXQUFXLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQztnQkFDekMsTUFBTSxFQUFFLHlCQUF5QixFQUFFLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5RSxJQUFJLHlCQUF5QixLQUFLLElBQUksRUFBRSxDQUFDO29CQUNyQyxhQUFhLEdBQUcsS0FBSyxDQUFDO29CQUN0QixZQUFZLEdBQUcsS0FBSyxDQUFDO29CQUNyQixZQUFZLEdBQUcsS0FBSyxDQUFDO2dCQUN6QixDQUFDO1lBQ0wsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLFdBQVcsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO1lBQzFDLENBQUM7WUFFRCxpQkFBaUI7WUFDakIsUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFckMsYUFBYTtZQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLEVBQUUsRUFBRSxDQUFDO2dCQUNqRyxXQUFXLEdBQUcsV0FBVyxDQUFDLGVBQWUsQ0FBQztnQkFDMUMsaUJBQWlCO2dCQUNqQixhQUFhLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLENBQUM7WUFFRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztnQkFDN0IsWUFBWSxHQUFHLEtBQUssQ0FBQztZQUN6QixDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDaEQsYUFBYTtZQUNiLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNoRCxJQUFJLGdCQUFnQixFQUFFLENBQUM7Z0JBQ25CLE1BQU0seUJBQXlCLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDakYsSUFBSSx5QkFBeUIsSUFBSSx5QkFBeUIsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO29CQUNuRixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyx5QkFBeUIsQ0FBQyx5QkFBeUIsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO3dCQUNuRixZQUFZLEdBQUcsSUFBSSxDQUFDO29CQUN4QixDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1FBRUwsQ0FBQztRQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLENBQUM7SUFDaEgsQ0FBQztJQUVNLGNBQWMsQ0FBQyxVQUE0QjtRQUM5QyxPQUFPLFVBQVUsQ0FBQyxvQkFBZSxDQUFDLEVBQUUsV0FBVyxDQUFDO0lBQ3BELENBQUM7SUFFTSxjQUFjLENBQUMsVUFBNEIsRUFBRSxXQUE2QjtRQUM3RSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxPQUFPO1FBQ1gsQ0FBQztRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQWUsQ0FBQyxFQUFFLENBQUM7WUFDL0IsVUFBVSxDQUFDLG9CQUFlLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckMsQ0FBQztRQUNELFVBQVUsQ0FBQyxvQkFBZSxDQUFDLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztJQUMxRCxDQUFDO0lBRUQsdUJBQXVCO0lBQ2YsZ0JBQWdCLENBQUMsa0JBQXdCLEVBQUUsSUFBVTtRQUN6RCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlDLElBQUksV0FBVyxJQUFJLFdBQVcsS0FBSyxrQkFBa0IsRUFBRSxDQUFDO1lBQ3BELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0sa0JBQWtCLENBQUMsU0FBb0I7UUFDMUMsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztRQUU1QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDUixPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRUQsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUUsTUFBTSx5QkFBeUIsR0FBZ0IseUJBQXlCLENBQUMseUJBQXlCLENBQUM7UUFDbkcsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7WUFDN0IsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFbkQsSUFBSSxXQUFXLElBQUksV0FBVyxLQUFLLHlCQUF5QixFQUFFLENBQUM7WUFDM0QsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSxvQkFBb0IsQ0FBQyxJQUFVO1FBQ2xDLE1BQU0sWUFBWSxHQUFnQixFQUFFLENBQUM7UUFDckMsYUFBYTtRQUNiLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxPQUFPLFlBQVksQ0FBQztRQUN4QixDQUFDO1FBRUQsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUUsTUFBTSx5QkFBeUIsR0FBZ0IseUJBQXlCLENBQUMseUJBQXlCLENBQUM7UUFDbkcsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7WUFDN0IsT0FBTyxZQUFZLENBQUM7UUFDeEIsQ0FBQztRQUNELE1BQU0sVUFBVSxHQUFhLHlCQUF5QixDQUFDLFVBQVUsQ0FBQztRQUNsRSxhQUFhO1FBQ2IsTUFBTSxxQkFBcUIsR0FBNkMseUJBQXlCLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxDQUFDO1FBRXZILGFBQWE7UUFDYixNQUFNLGlCQUFpQixHQUFHLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQy9ELElBQUkscUJBQXFCLElBQUksaUJBQWlCLElBQUksaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFeEUsSUFBSSxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3RELE9BQU8sWUFBWSxDQUFDO1lBQ3hCLENBQUM7WUFFRCxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4QixVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVuQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ2pCLE9BQU8sWUFBWSxDQUFDO1lBQ3hCLENBQUM7WUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFTLENBQUM7WUFDMUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNiLE9BQU8sWUFBWSxDQUFDO1lBQ3hCLENBQUM7WUFFRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqRyxLQUFLLE1BQU0sU0FBUyxJQUFJLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDM0MsSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ3JCLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQzt3QkFDdEQsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDakMsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFFRCxPQUFPLFlBQVksQ0FBQztJQUN4QixDQUFDO0lBRU0sMkJBQTJCLENBQUMsTUFBd0IsRUFBRSxJQUF5QjtRQUNsRixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDUixPQUFPO1FBQ1gsQ0FBQztRQUNELGFBQWE7UUFDYixJQUFJLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUM3RCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLENBQUM7SUFDTCxDQUFDO0lBRU0sOEJBQThCLENBQUMsSUFBaUIsRUFBRSxhQUFxQjtRQUMxRSxJQUFJLENBQUMsSUFBSTtZQUFFLE9BQU87UUFFbEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRW5DLElBQUksVUFBVSxFQUFFLFFBQVEsRUFBRSxDQUFDO1lBQ3ZCLDBDQUEwQztZQUMxQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXpCLHlDQUF5QztZQUN6QyxJQUFJLFVBQVUsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2dCQUN2QyxVQUFVLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBZ0IsRUFBRSxFQUFFO29CQUM5RCxhQUFhO29CQUNiLElBQUksVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7d0JBQ3hCLGFBQWE7d0JBQ2IsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLHlCQUF5QixHQUFHLFNBQVMsQ0FBQztvQkFDaEUsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDSCxVQUFVLENBQUMseUJBQXlCLEdBQUcsU0FBUyxDQUFDO1lBQ3JELENBQUM7WUFFRCxVQUFVLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQyxtQkFBd0IsRUFBRSxFQUFFO2dCQUN2RSxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUU7b0JBQzdDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQzlELENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO2FBQU0sQ0FBQztZQUNKLFdBQVc7WUFDWCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQVUsRUFBRSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsOEJBQThCLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQzlELENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNMLENBQUM7SUFFRCx5QkFBeUIsQ0FBQyxRQUFzQjtRQUM1QyxrQ0FBa0M7UUFDbEMsTUFBTSxhQUFhLEdBQVcsRUFBRSxDQUFDO1FBQ2pDLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBVyxFQUFFLEVBQUU7WUFDdEMsSUFBSSxJQUFBLHlCQUFZLEVBQUMsS0FBYSxDQUFDLEVBQUUsQ0FBQztnQkFDOUIsT0FBTztZQUNYLENBQUM7WUFDRCxJQUFJLENBQUMsOEJBQThCLENBQUMsS0FBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3RFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztnQkFDdkIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0QsQ0FBQztZQUNELE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzQyxjQUFjLENBQUMseUJBQXlCLEdBQUcsYUFBYSxDQUFDO1FBQzdELENBQUM7YUFBTSxDQUFDO1lBQ0osTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLElBQUksY0FBYyxFQUFFLENBQUM7Z0JBQ2pCLGNBQWMsQ0FBQyx5QkFBeUIsR0FBRyxTQUFTLENBQUM7WUFDekQsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsbURBQW1EO0lBQ25ELG1EQUFtRDtJQUNuRCwrREFBK0Q7SUFDL0QsK0NBQStDO0lBQy9DLDRDQUE0QztJQUM1QyxzQ0FBc0M7SUFDdEMsbURBQW1EO0lBQ25ELDBEQUEwRDtJQUMxRCw0Q0FBNEM7SUFDNUMseUNBQXlDO0lBQ3pDLDRDQUE0QztJQUM1Qyw4REFBOEQ7SUFDOUQsK0NBQStDO0lBQy9DLHdEQUF3RDtJQUN4RCw0QkFBNEI7SUFDNUIsMEJBQTBCO0lBQzFCLHNCQUFzQjtJQUN0Qiw4Q0FBOEM7SUFDOUMsaURBQWlEO0lBQ2pELG9CQUFvQjtJQUNwQiw0RUFBNEU7SUFDNUUsZ0JBQWdCO0lBQ2hCLGNBQWM7SUFDZCxRQUFRO0lBQ1IsSUFBSTtJQUVKLCtCQUErQjtJQUN4QixVQUFVLENBQUMsSUFBWTtRQUMxQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVNLGdCQUFnQixDQUFDLElBQVU7UUFDOUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRS9CLDJCQUEyQjtRQUMzQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRXZCLDhCQUE4QjtRQUM5QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQzdCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQsK0JBQStCO0lBQy9CLGdCQUFnQjtJQUNoQix3QkFBd0I7SUFDakIsb0JBQW9CLENBQUMsSUFBVSxFQUFFLFdBQW9CO1FBQ3hELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFOUMsSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUNkLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNwQixhQUFhO1lBQ2IsTUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsQ0FBQztZQUN4RCxJQUFJLGNBQWMsSUFBSSxjQUFjLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ25ELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUM3RCxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN0RCxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7d0JBQ25DLE9BQU8sR0FBRyxJQUFJLENBQUM7d0JBQ2YsTUFBTTtvQkFDVixDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNYLHdCQUF3QjtnQkFDeEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDekMsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQzdCLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEQsSUFBSSxlQUFlLEVBQUUsQ0FBQztnQkFDbEIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUNwQixhQUFhO2dCQUNiLE1BQU0sY0FBYyxHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsRUFBRSxRQUFRLENBQUM7Z0JBQzVELElBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO29CQUNyRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUMvRCxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3hELElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzs0QkFDeEMsT0FBTyxHQUFHLElBQUksQ0FBQzs0QkFDZixNQUFNO3dCQUNWLENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDO2dCQUVELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDWCx3QkFBd0I7b0JBQ3hCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUN6QyxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0lBQ0wsQ0FBQztJQUVNLHlCQUF5QixDQUFDLFFBQXNCO1FBQ25ELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN2QyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ2IsVUFBVSxDQUFDLHlCQUF5QixHQUFHLFNBQVMsQ0FBQztRQUNyRCxDQUFDO0lBQ0wsQ0FBQztJQUVELHNDQUFzQztJQUN0QyxPQUFPO0lBQ0Esd0JBQXdCLENBQUMsSUFBa0I7UUFDOUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLE9BQU87UUFDWCxDQUFDO1FBRUQsTUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQztRQUNuRCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDbkIsT0FBTztRQUNYLENBQUM7UUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNuRCxNQUFNLGlCQUFpQixHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsaUJBQWlCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbEQsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakMsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxzQ0FBc0MsQ0FBQyxJQUFVO1FBQ3BELElBQUksUUFBUSxHQUFnQixJQUFJLENBQUM7UUFDakMsT0FBTyxRQUFRLEVBQUUsQ0FBQztZQUNkLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEQsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDZCxNQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDakYsTUFBTSx5QkFBeUIsR0FBRyx5QkFBeUIsQ0FBQyx5QkFBeUIsQ0FBQztnQkFDdEYsMkNBQTJDO2dCQUMzQyxJQUFJLHlCQUF5QixLQUFLLFdBQVcsRUFBRSxDQUFDO29CQUM1QyxPQUFPLElBQUksQ0FBQztnQkFDaEIsQ0FBQztZQUNMLENBQUM7WUFDRCxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUMzQixJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNuRCxNQUFNO1lBQ1YsQ0FBQztRQUNMLENBQUM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksOEJBQThCLENBQUMsSUFBVTtRQUM1QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkMsSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3BDLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7WUFDckMsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsaUJBQWlCLENBQUM7WUFDckQsTUFBTSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDO1lBQ3RDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDcEQsT0FBTyxDQUFDLEtBQUssQ0FBQywwREFBMEQsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDaEYsT0FBTztZQUNYLENBQUM7WUFDRCxLQUFLLElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO2dCQUM3QyxNQUFNLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDOUMsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQztnQkFDM0MsSUFBSSxVQUFVLEVBQUUsQ0FBQztvQkFDYiw4QkFBOEI7b0JBQzlCLE1BQU0sTUFBTSxHQUFHLFdBQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQ3RFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDVixpQkFBaUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUNuQyx5REFBeUQ7b0JBQzdELENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSw0QkFBNEIsQ0FBQyxJQUFVO1FBQzFDLE1BQU0sVUFBVSxHQUFHLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksVUFBVSxFQUFFLENBQUM7WUFDYixNQUFNLGVBQWUsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDO1lBQ25ELElBQUksQ0FBQyxlQUFlO2dCQUFFLE9BQU87WUFDN0IsS0FBSyxJQUFJLEtBQUssR0FBRyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7Z0JBQy9ELE1BQU0sSUFBSSxHQUF1QixlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3hELGFBQWE7Z0JBQ2IsSUFBSSxNQUFNLEdBQTRCLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQ2xELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQ25DLElBQUksTUFBTSxHQUE0QixJQUFJLENBQUM7Z0JBQzNDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQ25DLElBQUksVUFBVSxFQUFFLENBQUM7b0JBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxZQUFZLFNBQUksRUFBRSxDQUFDO3dCQUM5QixNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDN0QsQ0FBQztnQkFDTCxDQUFDO2dCQUVELG9CQUFvQjtnQkFDcEIsZ0NBQWdDO2dCQUNoQyw0Q0FBNEM7Z0JBRTVDLG9EQUFvRDtnQkFDcEQsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDMUIsZUFBZSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ2pDLFNBQVM7Z0JBQ2IsQ0FBQztnQkFDRCwyRUFBMkU7Z0JBQzNFLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUM3RCxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDekQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUNWLGVBQWUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUNqQyxTQUFTO29CQUNiLENBQUM7Z0JBQ0wsQ0FBQztnQkFFRCxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQ3pCLFNBQVM7Z0JBQ2IsQ0FBQztnQkFFRCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxZQUFZLFNBQUksQ0FBQyxFQUFFLENBQUM7b0JBQ2pDLFNBQVM7Z0JBQ2IsQ0FBQztnQkFFRCxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDekQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNWLFNBQVM7Z0JBQ2IsQ0FBQztnQkFFRCwwQkFBMEI7Z0JBQzFCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQy9DLElBQUksZUFBZSxHQUFRLE1BQU0sQ0FBQztnQkFDbEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDM0MsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqQyxNQUFNLElBQUksR0FBRyxZQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ3JFLGVBQWUsR0FBRyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzVDLDhCQUE4QjtvQkFDOUIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO3dCQUNuQixlQUFlLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDakMsTUFBTTtvQkFDVixDQUFDO29CQUNELElBQUksQ0FBQyxLQUFLLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBQ2hDLE1BQU0sT0FBTyxHQUFHLFFBQVEsR0FBRyxTQUFTLEdBQUcsTUFBTSxDQUFDO3dCQUM5QyxxQkFBcUI7d0JBQ3JCLHNDQUFzQzt3QkFDdEMsOEJBQThCO3dCQUM5Qix5QkFBeUI7d0JBQ3pCLDhCQUE4Qjt3QkFDOUIsb0RBQW9EO3dCQUNwRCxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQzsrQkFDN0QsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDOzRCQUNuRixlQUFlLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDckMsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFDRDs7O09BR0c7SUFDSSx1QkFBdUIsQ0FBQyxJQUFVO1FBQ3JDLG9CQUFvQjtRQUNwQixJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFeEMsc0JBQXNCO1FBQ3RCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuQyxNQUFNLGNBQWMsR0FBRyxVQUFVLEVBQUUseUJBQXlCLENBQUM7UUFDN0QsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUNqQixRQUFRO1lBQ1IsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQVUsRUFBRSxFQUFFO2dCQUNsQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxzQ0FBc0MsQ0FBQyxJQUFVO1FBQ3BELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ2IsVUFBVSxDQUFDLHlCQUF5QixFQUFFLE9BQU8sQ0FBQyxDQUFDLGtCQUF3QixFQUFFLEVBQUU7Z0JBQ3ZFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxpQkFBaUIsR0FBRyxjQUFjLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixDQUFDO2dCQUN0RSxJQUFJLGlCQUFpQixFQUFFLENBQUM7b0JBQ3BCLEtBQUssSUFBSSxLQUFLLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7d0JBQ2pFLE1BQU0sS0FBSyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN2QyxJQUFJLEdBQUcsR0FBUSxLQUFLLENBQUMsS0FBSyxDQUFDO3dCQUMzQixJQUFJLEdBQUcsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDOzRCQUMzQyxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQzt3QkFDckIsQ0FBQzs2QkFBTSxJQUFJLEdBQUcsWUFBWSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7NEJBQ3JDLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO3dCQUNuQixDQUFDO3dCQUNELElBQUksR0FBRyxJQUFJLEdBQUcsWUFBWSxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDOzRCQUN4RCxnRUFBZ0U7NEJBQ2hFLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQ25DLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs0QkFDekMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dDQUNWLE1BQU0sR0FBRyxFQUFFLENBQUM7Z0NBQ1osR0FBRyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQzs0QkFDeEMsQ0FBQzs0QkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN2QixDQUFDO29CQUNMLENBQUM7Z0JBRUwsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQzs7QUFHUSxRQUFBLFdBQVcsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgQ29tcG9uZW50LCBlZGl0b3JFeHRyYXNUYWcsIGluc3RhbnRpYXRlLCBOb2RlLCBQcmVmYWIsIENDQ2xhc3MsIFNjZW5lLCBpc1ZhbGlkIH0gZnJvbSAnY2MnO1xyXG5pbXBvcnQgeyBpc0VkaXRvck5vZGUgfSBmcm9tICcuLi9ub2RlL25vZGUtdXRpbHMnO1xyXG5pbXBvcnQgeyBTZXJ2aWNlRXZlbnRzLCBTZXJ2aWNlIH0gZnJvbSAnLi4vY29yZSc7XHJcbmltcG9ydCB7IElOb2RlRXZlbnRzLCBOb2RlRXZlbnRUeXBlIH0gZnJvbSAnLi4vLi4vLi4vY29tbW9uJztcclxuXHJcbnR5cGUgUHJlZmFiSW5mbyA9IFByZWZhYi5fdXRpbHMuUHJlZmFiSW5mbztcclxuY29uc3QgUHJlZmFiSW5mbyA9IFByZWZhYi5fdXRpbHMuUHJlZmFiSW5mbztcclxudHlwZSBDb21wUHJlZmFiSW5mbyA9IFByZWZhYi5fdXRpbHMuQ29tcFByZWZhYkluZm87XHJcbmNvbnN0IENvbXBQcmVmYWJJbmZvID0gUHJlZmFiLl91dGlscy5Db21wUHJlZmFiSW5mbztcclxudHlwZSBQcmVmYWJJbnN0YW5jZSA9IFByZWZhYi5fdXRpbHMuUHJlZmFiSW5zdGFuY2U7XHJcbmNvbnN0IFByZWZhYkluc3RhbmNlID0gUHJlZmFiLl91dGlscy5QcmVmYWJJbnN0YW5jZTtcclxudHlwZSBUYXJnZXRJbmZvID0gUHJlZmFiLl91dGlscy5UYXJnZXRJbmZvO1xyXG5jb25zdCBUYXJnZXRJbmZvID0gUHJlZmFiLl91dGlscy5UYXJnZXRJbmZvO1xyXG50eXBlIFByb3BlcnR5T3ZlcnJpZGVJbmZvID0gUHJlZmFiLl91dGlscy5Qcm9wZXJ0eU92ZXJyaWRlSW5mbztcclxuY29uc3QgUHJvcGVydHlPdmVycmlkZUluZm8gPSBQcmVmYWIuX3V0aWxzLlByb3BlcnR5T3ZlcnJpZGVJbmZvO1xyXG50eXBlIE1vdW50ZWRDaGlsZHJlbkluZm8gPSBQcmVmYWIuX3V0aWxzLk1vdW50ZWRDaGlsZHJlbkluZm87XHJcbmNvbnN0IE1vdW50ZWRDaGlsZHJlbkluZm8gPSBQcmVmYWIuX3V0aWxzLk1vdW50ZWRDaGlsZHJlbkluZm87XHJcbnR5cGUgVGFyZ2V0T3ZlcnJpZGVJbmZvID0gUHJlZmFiLl91dGlscy5UYXJnZXRPdmVycmlkZUluZm87XHJcbmNvbnN0IFRhcmdldE92ZXJyaWRlSW5mbyA9IFByZWZhYi5fdXRpbHMuVGFyZ2V0T3ZlcnJpZGVJbmZvO1xyXG50eXBlIE1vdW50ZWRDb21wb25lbnRzSW5mbyA9IFByZWZhYi5fdXRpbHMuTW91bnRlZENvbXBvbmVudHNJbmZvO1xyXG5jb25zdCBNb3VudGVkQ29tcG9uZW50c0luZm8gPSBQcmVmYWIuX3V0aWxzLk1vdW50ZWRDb21wb25lbnRzSW5mbztcclxuXHJcbmV4cG9ydCBlbnVtIFByZWZhYlN0YXRlIHtcclxuICAgIE5vdEFQcmVmYWIgPSAwLCAvLyDmma7pgJroioLngrnvvIzpnZ5QcmVmYWJcclxuICAgIFByZWZhYkNoaWxkID0gMSwgLy8gUHJlZmFi5a2Q6IqC54K577yM5LiN5ZCr5pyJUHJlZmFiSW5zdGFuY2VcclxuICAgIFByZWZhYkluc3RhbmNlID0gMiwgLy8gUHJlZmFi55qE5qC56IqC54K55ZCr5pyJUHJlZmFiSW5zdGFuY2XnmoToioLngrlcclxuICAgIFByZWZhYkxvc3RBc3NldCA9IDMsIC8vIOS4ouWksei1hOa6kOeahFByZWZhYuiKgueCuVxyXG59XHJcblxyXG5jb25zdCBjb21wS2V5ID0gJ19jb21wb25lbnRzJztcclxuY29uc3QgREVMSU1FVEVSID0gQ0NDbGFzcy5BdHRyLkRFTElNRVRFUjtcclxuXHJcbmZ1bmN0aW9uIGNvbXBhcmVTdHJpbmdBcnJheShhcnJheTE6IHN0cmluZ1tdIHwgdW5kZWZpbmVkLCBhcnJheTI6IHN0cmluZ1tdIHwgdW5kZWZpbmVkKSB7XHJcbiAgICBpZiAoIWFycmF5MSB8fCAhYXJyYXkyKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhcnJheTEubGVuZ3RoICE9PSBhcnJheTIubGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhcnJheTEuZXZlcnkoKHZhbHVlLCBpbmRleCkgPT4gdmFsdWUgPT09IGFycmF5MltpbmRleF0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0luQ2xhc3NDaGFpbihzcmNDdG9yOiBhbnksIGRzdEN0b3I6IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKHNyY0N0b3IgJiYgZHN0Q3Rvcikge1xyXG4gICAgICAgIGNvbnN0IGNoaWFuID0gQ0NDbGFzcy5nZXRJbmhlcml0YW5jZUNoYWluKHNyY0N0b3IpO1xyXG4gICAgICAgIGNoaWFuLnB1c2goc3JjQ3Rvcik7XHJcbiAgICAgICAgcmV0dXJuIGNoaWFuLmluY2x1ZGVzKGRzdEN0b3IpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1NhbWVOb2RlKHNyYzogTm9kZSwgZHN0OiBOb2RlKSB7XHJcbiAgICByZXR1cm4gc3JjLmdldFBhdGhJbkhpZXJhcmNoeSgpID09PSBkc3QuZ2V0UGF0aEluSGllcmFyY2h5KCkgJiYgc3JjLmdldFNpYmxpbmdJbmRleCgpID09PSBkc3QuZ2V0U2libGluZ0luZGV4KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHB1c2hOZXN0ZWRQcmVmYWIobmVzdGVkUHJlZmFiTm9kZTogTm9kZSwgcm9vdDogTm9kZSwgcGF0aHM6IHN0cmluZ1tdKSB7XHJcbiAgICBsZXQgcGFyZW50ID0gbmVzdGVkUHJlZmFiTm9kZS5wYXJlbnQgYXMgTm9kZTtcclxuICAgIHdoaWxlIChwYXJlbnQgJiYgcGFyZW50ICE9PSByb290KSB7XHJcbiAgICAgICAgaWYgKHBhcmVudFsnX3ByZWZhYiddPy5pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICBwYXRocy51bnNoaWZ0KHBhcmVudFsnX3ByZWZhYiddPy5pbnN0YW5jZS5maWxlSWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50IGFzIE5vZGU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFByZWZhYlV0aWwge1xyXG4gICAgcHVibGljIHN0YXRpYyBQcmVmYWJTdGF0ZSA9IFByZWZhYlN0YXRlO1xyXG4gICAgcHJpdmF0ZSBhc3NldFRhcmdldE1hcENhY2hlOiBNYXA8Tm9kZSwge30+ID0gbmV3IE1hcCgpO1xyXG4gICAgcHJpdmF0ZSBwcmVmYWJBc3NldE5vZGVJbnN0YW5jZU1hcDogTWFwPFByZWZhYkluZm8sIE5vZGU+ID0gbmV3IE1hcCgpOyAvLyDnlKjkuo5QcmVmYWJBc3NldOagueiKgueCueWunuS+i+WMluaVsOaNrue8k+WtmO+8jOeUqOS6jmRpZmblr7nmr5RcclxuXHJcbiAgICBwdWJsaWMgZ2V0UHJlZmFiKG5vZGU6IE5vZGUpOiBQcmVmYWJJbmZvIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIG5vZGVbJ19wcmVmYWInXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDlj5HpgIHoioLngrnkv67mlLnliY3mtojmga9cclxuICAgIHB1YmxpYyBmaXJlQmVmb3JlQ2hhbmdlTXNnKG5vZGU6IE5vZGUpIHtcclxuICAgICAgICBTZXJ2aWNlRXZlbnRzLmVtaXQ8SU5vZGVFdmVudHM+KCdub2RlOmJlZm9yZS1jaGFuZ2UnLCBub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDlj5HpgIHoioLngrnkv67mlLnmtojmga9cclxuICAgIHB1YmxpYyBmaXJlQ2hhbmdlTXNnKG5vZGU6IE5vZGUgfCBTY2VuZSwgb3B0czogYW55ID0ge30pIHtcclxuICAgICAgICBvcHRzLnR5cGUgPSBOb2RlRXZlbnRUeXBlLlBSRUZBQl9JTkZPX0NIQU5HRUQ7XHJcbiAgICAgICAgU2VydmljZUV2ZW50cy5lbWl0PElOb2RlRXZlbnRzPignbm9kZTpjaGFuZ2UnLCBub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UHJlZmFiQXNzZXROb2RlSW5zdGFuY2UocHJlZmFiSW5mbzogUHJlZmFiSW5mbykge1xyXG4gICAgICAgIGlmICh0aGlzLnByZWZhYkFzc2V0Tm9kZUluc3RhbmNlTWFwLmhhcyhwcmVmYWJJbmZvKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcmVmYWJBc3NldE5vZGVJbnN0YW5jZU1hcC5nZXQocHJlZmFiSW5mbyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgYXNzZXRSb290Tm9kZTogTm9kZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICBpZiAocHJlZmFiSW5mbyAmJiBwcmVmYWJJbmZvLmFzc2V0ICYmIGlzVmFsaWQocHJlZmFiSW5mby5hc3NldCkpIHtcclxuICAgICAgICAgICAgYXNzZXRSb290Tm9kZSA9IGluc3RhbnRpYXRlKHByZWZhYkluZm8uYXNzZXQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGFzc2V0Um9vdE5vZGUpIHtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBjb25zdCByb290UHJlZmFiSW5mbyA9IGFzc2V0Um9vdE5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICAgICAgaWYgKHJvb3RQcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICByb290UHJlZmFiSW5mby5pbnN0YW5jZSA9IHByZWZhYkluZm8uaW5zdGFuY2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMucHJlZmFiQXNzZXROb2RlSW5zdGFuY2VNYXAuc2V0KHByZWZhYkluZm8sIGFzc2V0Um9vdE5vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGFzc2V0Um9vdE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsZWFyQ2FjaGUoKSB7XHJcbiAgICAgICAgdGhpcy5hc3NldFRhcmdldE1hcENhY2hlLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5wcmVmYWJBc3NldE5vZGVJbnN0YW5jZU1hcC5jbGVhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW1vdmVQcmVmYWJBc3NldE5vZGVJbnN0YW5jZUNhY2hlKHByZWZhYkluZm86IFByZWZhYkluZm8pIHtcclxuICAgICAgICBpZiAodGhpcy5wcmVmYWJBc3NldE5vZGVJbnN0YW5jZU1hcC5oYXMocHJlZmFiSW5mbykpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmVmYWJBc3NldE5vZGVJbnN0YW5jZU1hcC5kZWxldGUocHJlZmFiSW5mbyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Zyo57yW6L6R5Zmo5LitLG5vZGUuX3ByZWZhYi5pbnN0YW5jZS50YXJnZXRNYXDlrZjlnKjkuKLlpLHnmoTmg4XlhrUs5q+U5aaC5paw5bu66aKE5Yi25L2T5pe2XHJcbiAgICAgKiDmiYDku6XnvJbovpHlmajkuK3or7fkuI3opoHpgJrov4flvJXmk47lrZfmrrXorr/pl650YXJnZXRNYXDvvIzku47ogIzljrvojrflj5Z0YXJnZXRcclxuICAgICAqIOivt+S9v+eUqHByZWZhYlV0aWzmj5DkvpvnmoTmlrnms5XmnaXorr/pl65cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFRhcmdldE1hcChub2RlOiBOb2RlLCB1c2VDYWNoZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKHVzZUNhY2hlICYmIHRoaXMuYXNzZXRUYXJnZXRNYXBDYWNoZS5oYXMobm9kZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXNzZXRUYXJnZXRNYXBDYWNoZS5nZXQobm9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhc3NldFRhcmdldE1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuZ2VuZXJhdGVUYXJnZXRNYXAobm9kZSwgYXNzZXRUYXJnZXRNYXAsIHRydWUpO1xyXG5cclxuICAgICAgICB0aGlzLmFzc2V0VGFyZ2V0TWFwQ2FjaGUuc2V0KG5vZGUsIGFzc2V0VGFyZ2V0TWFwKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGFzc2V0VGFyZ2V0TWFwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOmAmui/h2xvY2FsSUTojrflj5boioLngrlub2Rl5LiK55qE6IqC54K5XHJcbiAgICBwdWJsaWMgZ2V0VGFyZ2V0KGxvY2FsSUQ6IHN0cmluZ1tdLCBub2RlOiBOb2RlLCB1c2VDYWNoZSA9IGZhbHNlKTogTm9kZSB8IENvbXBvbmVudCB8IG51bGwge1xyXG4gICAgICAgIGNvbnN0IHRhcmdldE1hcCA9IHRoaXMuZ2V0VGFyZ2V0TWFwKG5vZGUsIHVzZUNhY2hlKTtcclxuICAgICAgICByZXR1cm4gUHJlZmFiLl91dGlscy5nZXRUYXJnZXQobG9jYWxJRCwgdGFyZ2V0TWFwKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDkuI5QcmVmYWIuX3V0aWxzLmdlbmVyYXRlVGFyZ2V0TWFw5LiN5ZCM55qE5piv77yM6L+Z5Liq6ZyA6KaB5bCGbW91bnRlZCBjaGlsZHJlbumDveiAg+iZkei/m+adpVxyXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVRhcmdldE1hcChub2RlOiBOb2RlLCB0YXJnZXRNYXA6IGFueSwgaXNSb290OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKCFub2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGN1clRhcmdldE1hcCA9IHRhcmdldE1hcDtcclxuXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5zdGFuY2UgPSBub2RlWydfcHJlZmFiJ10/Lmluc3RhbmNlO1xyXG4gICAgICAgIGlmICghaXNSb290ICYmIHByZWZhYkluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIHRhcmdldE1hcFtwcmVmYWJJbnN0YW5jZS5maWxlSWRdID0ge307XHJcbiAgICAgICAgICAgIGN1clRhcmdldE1hcCA9IHRhcmdldE1hcFtwcmVmYWJJbnN0YW5jZS5maWxlSWRdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IG5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICBpZiAocHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICBjdXJUYXJnZXRNYXBbcHJlZmFiSW5mby5maWxlSWRdID0gbm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSBub2RlLmNvbXBvbmVudHM7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbXAgPSBjb21wb25lbnRzW2ldO1xyXG4gICAgICAgICAgICBpZiAoY29tcC5fX3ByZWZhYikge1xyXG4gICAgICAgICAgICAgICAgY3VyVGFyZ2V0TWFwW2NvbXAuX19wcmVmYWIuZmlsZUlkXSA9IGNvbXA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZE5vZGUgPSBub2RlLmNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRlVGFyZ2V0TWFwKGNoaWxkTm9kZSwgY3VyVGFyZ2V0TWFwLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocHJlZmFiSW5zdGFuY2UgJiYgcHJlZmFiSW5zdGFuY2UubW91bnRlZENoaWxkcmVuLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVmYWJJbnN0YW5jZS5tb3VudGVkQ2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkSW5mbyA9IHByZWZhYkluc3RhbmNlLm1vdW50ZWRDaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZEluZm8gJiYgY2hpbGRJbmZvLnRhcmdldEluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbW91bnRlZFRhcmdldE1hcCA9IGN1clRhcmdldE1hcDtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2NhbElEID0gY2hpbGRJbmZvLnRhcmdldEluZm8ubG9jYWxJRDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9jYWxJRC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYWxJRC5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdW50ZWRUYXJnZXRNYXAgPSBtb3VudGVkVGFyZ2V0TWFwW2xvY2FsSURbaV1dO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWmguaenOebruagh+iKgueCueaYr+W1jOWll+mihOWItuS9k+aXtu+8jOWPr+iDveWHuueOsOaMgui9veeahOiKgueCueW3sue7j+S4jeWGjeaYr+mihOWItuS9k+WunuS+i+eahOaDheWGtSAjMTc0OTNcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRJbmZvLm5vZGVzICYmIG1vdW50ZWRUYXJnZXRNYXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZEluZm8ubm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkTm9kZSA9IGNoaWxkSW5mby5ub2Rlc1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNoaWxkTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1vdW50ZWQgbm9kZSBuZWVkIHRvIGFkZCB0byB0aGUgdGFyZ2V0IG1hcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZVRhcmdldE1hcChjaGlsZE5vZGUsIG1vdW50ZWRUYXJnZXRNYXAsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UHJvcGVydHlPdmVycmlkZUxvY2F0aW9uSW5mbyhub2RlOiBOb2RlLCBwYXRoS2V5czogc3RyaW5nW10pIHtcclxuICAgICAgICAvLyDlkJHkuIrmn6Xmib5QcmVmYWJJbnN0YW5jZei3r+W+hFxyXG4gICAgICAgIGNvbnN0IG91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8gPSB0aGlzLmdldE91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8obm9kZSk7XHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZTogTm9kZSB8IG51bGwgPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvLm91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGU7XHJcbiAgICAgICAgaWYgKCFvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0YXJnZXRQYXRoOiBzdHJpbmdbXSA9IG91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8udGFyZ2V0UGF0aDtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluc3RhbmNlOiBQcmVmYWIuX3V0aWxzLlByZWZhYkluc3RhbmNlIHwgdW5kZWZpbmVkID0gb3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZVsnX3ByZWZhYiddPy5pbnN0YW5jZTtcclxuXHJcbiAgICAgICAgbGV0IHRhcmdldCA9IG5vZGU7XHJcbiAgICAgICAgaWYgKG91dE1vc3RQcmVmYWJJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICB0YXJnZXRQYXRoLnNwbGljZSgwLCAxKTsgLy8g5LiN6ZyA6KaB5a2Y5pyA5aSW5bGC55qEUHJlZmFiSW5zdGFuY2XnmoRmaWxlSUTvvIzmlrnkvr9vdmVycmlkZeWPr+S7peWcqFByZWZhYkluc3RhbmNl5aSN5Yi25ZCO5aSN55SoXHJcbiAgICAgICAgICAgIGxldCByZWxhdGl2ZVBhdGhLZXlzOiBzdHJpbmdbXSA9IFtdOyAvLyDnm7jlr7nkuo7nm67moIfvvIhub2RlXFxjb21wb25lbnQp55qE5bGe5oCn5p+l5om+6Lev5b6EXHJcblxyXG4gICAgICAgICAgICBpZiAocGF0aEtleXMubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocGF0aEtleXNbMF0gPT09IGNvbXBLZXkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwYXRoS2V5cy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBtb2RpZnkgY29tcG9uZW50XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBhdGhLZXlzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE/vvIzmlLnlj5hjb21wb25lbnRz5pWw57uEXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY29tcG9uZW50XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wID0gKG5vZGVbcGF0aEtleXNbMF1dIGFzIGFueSlbcGF0aEtleXNbMV1dO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbXAuX19wcmVmYWIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRQYXRoLnB1c2goY29tcC5fX3ByZWZhYi5maWxlSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlUGF0aEtleXMgPSBwYXRoS2V5cy5zbGljZSgyKTtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSBjb21wO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKGBjb21wb25lbnQ6ICR7Y29tcC5uYW1lfSBkb2Vzbid0IGhhdmUgYSBwcmVmYWJJbmZvYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbW91bnRlZCBjb21wb25lbnQgZG9lc24ndCBoYXZlIGEgcHJlZmFiSW5mb1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gbm9kZVxyXG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IG5vZGVbJ19wcmVmYWInXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFBhdGgucHVzaChwcmVmYWJJbmZvLmZpbGVJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmVQYXRoS2V5cyA9IHBhdGhLZXlzO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBub2RlOiAke25vZGUubmFtZX0gZG9lc24ndCBoYXZlIGEgcHJlZmFiSW5mb2ApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4geyBvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlLCB0YXJnZXRQYXRoLCByZWxhdGl2ZVBhdGhLZXlzLCB0YXJnZXQgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQcmVmYWJGb3JTZXJpYWxpemUobm9kZTogTm9kZSwgcXVpZXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQpIHtcclxuICAgICAgICAvLyBkZWVwIGNsb25lLCBzaW5jZSB3ZSBkb24ndCB3YW50IHRoZSBnaXZlbiBub2RlIGNoYW5nZWQgYnkgY29kZXMgYmVsb3dcclxuICAgICAgICBjb25zdCBjbG9uZU5vZGUgPSBpbnN0YW50aWF0ZShub2RlKTtcclxuICAgICAgICAvLyDlnKjkv67mlLnoioLngrlwcmVmYWJJbmZv5pe25YWI5Y675o6JbW91bnRlZENoaWxk55qE5oyC6L295L+h5oGvXHJcbiAgICAgICAgdGhpcy5yZW1vdmVNb3VudGVkUm9vdEluZm8oY2xvbmVOb2RlKTtcclxuXHJcbiAgICAgICAgY29uc3QgcHJlZmFiID0gbmV3IGNjLlByZWZhYigpO1xyXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSB0aGlzLmNyZWF0ZVByZWZhYkluZm8obm9kZS51dWlkKTtcclxuICAgICAgICBwcmVmYWJJbmZvLmFzc2V0ID0gcHJlZmFiO1xyXG4gICAgICAgIHByZWZhYkluZm8ucm9vdCA9IGNsb25lTm9kZTtcclxuXHJcbiAgICAgICAgLy8g5aSN5Yi26aKE5Yi25L2T5L+h5oGvXHJcbiAgICAgICAgY29uc3Qgb3JpUHJlZmFiSW5mbyA9IHRoaXMuZ2V0UHJlZmFiKGNsb25lTm9kZSkgYXMgUHJlZmFiSW5mbztcclxuICAgICAgICBpZiAob3JpUHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICBwcmVmYWIub3B0aW1pemF0aW9uUG9saWN5ID0gb3JpUHJlZmFiSW5mby5hc3NldD8ub3B0aW1pemF0aW9uUG9saWN5O1xyXG4gICAgICAgICAgICBwcmVmYWIucGVyc2lzdGVudCA9IG9yaVByZWZhYkluZm8uYXNzZXQ/LnBlcnNpc3RlbnQ7XHJcbiAgICAgICAgICAgIHByZWZhYkluZm8udGFyZ2V0T3ZlcnJpZGVzID0gb3JpUHJlZmFiSW5mby50YXJnZXRPdmVycmlkZXM7XHJcbiAgICAgICAgICAgIHByZWZhYkluZm8uZmlsZUlkID0gb3JpUHJlZmFiSW5mby5maWxlSWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBjbG9uZU5vZGVbJ19wcmVmYWInXSA9IHByZWZhYkluZm87XHJcblxyXG4gICAgICAgIGNvbnN0IG5lc3RlZEluc3ROb2RlczogTm9kZVtdID0gW107XHJcbiAgICAgICAgLy8g57uZ5a2Q6IqC54K56K6+572ucHJlZmFiSW5mby1hc3NldCzlpITnkIZuZXN0ZWRQcmVmYWJJbnN0YW5jZVJvb3Rz5ZKMcHJlZmFiUm9vdE5vZGVcclxuICAgICAgICB0aGlzLndhbGtOb2RlKGNsb25lTm9kZSwgKGNoaWxkOiBOb2RlLCBpc0NoaWxkOiBib29sZWFuKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOengeacieiKgueCueS4jemcgOimgea3u+WKoCBwcmVmYWJJbmZvIOaVsOaNrlxyXG4gICAgICAgICAgICBpZiAoY2hpbGQub2JqRmxhZ3MgJiBjYy5PYmplY3QuRmxhZ3MuSGlkZUluSGllcmFyY2h5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgY2hpbGRQcmVmYWIgPSB0aGlzLmdldFByZWZhYihjaGlsZCk7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZFByZWZhYikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkUHJlZmFiLmluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5aSE55CG5bWM5aWX6aKE5Yi25L2T5L+h5oGvXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlIH0gPSB0aGlzLmdldE91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8oY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlID09PSBjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFByZWZhYi5uZXN0ZWRQcmVmYWJJbnN0YW5jZVJvb3RzID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFByZWZhYi5pbnN0YW5jZS5wcmVmYWJSb290Tm9kZSA9IGNsb25lTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmVzdGVkSW5zdE5vZGVzLnB1c2goY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkWydfcHJlZmFiJ10pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRbJ19wcmVmYWInXS5yb290ID0gcHJlZmFiSW5mby5yb290O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFsnX3ByZWZhYiddLmFzc2V0ID0gcHJlZmFiSW5mby5hc3NldDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdQcmVmYWIgPSBuZXcgUHJlZmFiSW5mbygpO1xyXG4gICAgICAgICAgICAgICAgbmV3UHJlZmFiLnJvb3QgPSBwcmVmYWJJbmZvLnJvb3Q7XHJcbiAgICAgICAgICAgICAgICBuZXdQcmVmYWIuYXNzZXQgPSBwcmVmYWJJbmZvLmFzc2V0O1xyXG4gICAgICAgICAgICAgICAgbmV3UHJlZmFiLmZpbGVJZCA9IGNoaWxkLnV1aWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgY2hpbGRbJ19wcmVmYWInXSA9IG5ld1ByZWZhYjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8g57uE5Lu25Lmf5re75YqgIF9fcHJlZmFiIGZpbGVJZCDlsZ7mgKfvvIzku6Xkvr/lpI3nlKhcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmNvbXBvbmVudHMgJiYgY2hpbGQuY29tcG9uZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGQuY29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXAgPSBjaGlsZC5jb21wb25lbnRzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghY29tcC5fX3ByZWZhYikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wLl9fcHJlZmFiID0gbmV3IENvbXBQcmVmYWJJbmZvKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXAuX19wcmVmYWIuZmlsZUlkID0gY29tcC51dWlkO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHByZWZhYkluZm8ubmVzdGVkUHJlZmFiSW5zdGFuY2VSb290cyA9IG5lc3RlZEluc3ROb2Rlcy5sZW5ndGggPiAwID8gbmVzdGVkSW5zdE5vZGVzIDogdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICAvLyDmuIXnkIblpJbpg6joioLngrnnmoTlvJXnlKgs6L+Z6YeM5Lya5riF5o6JY29tcG9uZW5055qESUQs5b+F6aG75Zyo5LiK6L+w5q2l6aqk5omn6KGM5a6M5ZCO5omN5Y+v5Lul5riFKF9fcHJlZmFiLmZpbGVJZClcclxuICAgICAgICBjb25zdCBjbGVhcmVkUmVmZXJlbmNlID0gRWRpdG9yRXh0ZW5kcy5QcmVmYWJVdGlscy5jaGVja0FuZFN0cmlwTm9kZShjbG9uZU5vZGUsIHF1aWV0KTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmVJbnZhbGlkUHJlZmFiRGF0YShjbG9uZU5vZGUpO1xyXG4gICAgICAgIHRoaXMuc2V0TW91bnRlZFJvb3QoY2xvbmVOb2RlLCB1bmRlZmluZWQpO1xyXG4gICAgICAgIHByZWZhYi5kYXRhID0gY2xvbmVOb2RlO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHByZWZhYjogcHJlZmFiLFxyXG4gICAgICAgICAgICBjbGVhcmVkUmVmZXJlbmNlOiBjbGVhcmVkUmVmZXJlbmNlLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZFByZWZhYkluZm8obm9kZTogTm9kZSwgcm9vdE5vZGU6IE5vZGUsIHByZWZhYjogUHJlZmFiIHwgdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuIEVkaXRvckV4dGVuZHMuUHJlZmFiVXRpbHMuYWRkUHJlZmFiSW5mbyhub2RlLCByb290Tm9kZSwgcHJlZmFiKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgd2Fsa05vZGUobm9kZTogTm9kZSwgaGFuZGxlOiAobm9kZTogTm9kZSwgaXNDaGlsZDogYm9vbGVhbikgPT4gYm9vbGVhbiB8IHZvaWQsIGlzQ2hpbGQgPSBmYWxzZSkge1xyXG4gICAgICAgIEVkaXRvckV4dGVuZHMuUHJlZmFiVXRpbHMud2Fsa05vZGUobm9kZSwgaGFuZGxlLCBpc0NoaWxkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkUHJlZmFiSW5mb1RvQ29tcG9uZW50KGNvbXA6IENvbXBvbmVudCkge1xyXG4gICAgICAgIGlmICghY29tcC5fX3ByZWZhYikge1xyXG4gICAgICAgICAgICBjb21wLl9fcHJlZmFiID0gbmV3IENvbXBQcmVmYWJJbmZvKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWNvbXAuX19wcmVmYWIpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29tcC5fX3ByZWZhYi5maWxlSWQgPSBjb21wLl9fcHJlZmFiLmZpbGVJZCA/IGNvbXAuX19wcmVmYWIuZmlsZUlkIDogY29tcC51dWlkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5YWL6ZqG5LiA5Liq6IqC54K577yM6L2s5Li66aKE5Yi25L2T77yM6L+U5Zue6aKE5Yi25L2T5bqP5YiX5YyW5pWw5o2uXHJcbiAgICAgKiDms6jmhI/ov5nkuKrkuI3kvJrlvbHlk43njrDmnInoioLngrnmlbDmja7vvIzkvYbnlJ/miJDnmoTpooTliLbkvZPvvIzkvJrmnInpg6jliIblpJbpg6jlvJXnlKjmlbDmja7ooqvmuIXnkIZcclxuICAgICAqIEBwYXJhbSB7Kn0gbm9kZVVVSURcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdlbmVyYXRlUHJlZmFiRGF0YUZyb21Ob2RlKG5vZGVVVUlEOiBzdHJpbmcgfCBOb2RlKSB7XHJcbiAgICAgICAgbGV0IG5vZGU6IE5vZGUgfCBudWxsID0gbnVsbDtcclxuICAgICAgICBpZiAodHlwZW9mIG5vZGVVVUlEID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBub2RlID0gRWRpdG9yRXh0ZW5kcy5Ob2RlLmdldE5vZGUobm9kZVVVSUQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5vZGUgPSBub2RlVVVJRDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgeyBwcmVmYWIsIGNsZWFyZWRSZWZlcmVuY2UgfSA9IHRoaXMuZ2V0UHJlZmFiRm9yU2VyaWFsaXplKG5vZGUpO1xyXG4gICAgICAgIGlmICghcHJlZmFiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5YWI5Y675o6JcHJlZmFiSW5zdGFuY2XvvIznrYnmlK/mjIHkuoZWYXJpYW505YaN5a6e546w5LiN5YmU6Zmk55qE5oOF5Ya1XHJcbiAgICAgICAgcHJlZmFiLmRhdGFbJ19wcmVmYWInXS5pbnN0YW5jZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgLy8g5ouW5ou955Sf5oiQcHJlZmFi5pe26KaB5riF55CGaW5zdGFuY2XkuK3lr7nlpJbpg6joioLngrnnmoTlvJXnlKjvvIzlkKbliJnkvJrmiorlnLrmma/kv53lrZjliLBwcmVmYWLkuK1cclxuICAgICAgICB0aGlzLnJlbW92ZUludmFsaWRQcm9wZXJ0eU92ZXJyaWRlUmVmZXJlbmNlKHByZWZhYi5kYXRhKTtcclxuXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IEVkaXRvckV4dGVuZHMuc2VyaWFsaXplKHByZWZhYik7XHJcblxyXG4gICAgICAgIC8vIOaBouWkjWNsZWFyZWRSZWZlcmVuY2VcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBwcmVmYWJEYXRhOiBkYXRhIGFzIHN0cmluZyxcclxuICAgICAgICAgICAgY2xlYXJlZFJlZmVyZW5jZTogY2xlYXJlZFJlZmVyZW5jZSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vIHJldHVybiBkYXRhIGFzIHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVtb3ZlTW91bnRlZFJvb3RJbmZvKG5vZGU6IE5vZGUpIHtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IG5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICBpZiAoIXByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbmZvLmluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG1vdW50ZWRDaGlsZHJlbiA9IHByZWZhYkluZm8uaW5zdGFuY2UubW91bnRlZENoaWxkcmVuO1xyXG4gICAgICAgIG1vdW50ZWRDaGlsZHJlbi5mb3JFYWNoKChtb3VudGVkQ2hpbGRJbmZvKSA9PiB7XHJcbiAgICAgICAgICAgIG1vdW50ZWRDaGlsZEluZm8ubm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRNb3VudGVkUm9vdChub2RlLCB1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgbW91bnRlZENvbXBvbmVudHMgPSBwcmVmYWJJbmZvLmluc3RhbmNlLm1vdW50ZWRDb21wb25lbnRzO1xyXG4gICAgICAgIG1vdW50ZWRDb21wb25lbnRzLmZvckVhY2goKG1vdW50ZWRDb21wSW5mbykgPT4ge1xyXG4gICAgICAgICAgICBtb3VudGVkQ29tcEluZm8uY29tcG9uZW50cy5mb3JFYWNoKChjb21wKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldE1vdW50ZWRSb290KGNvbXAsIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZW5lcmF0ZVVVSUQoKSB7XHJcbiAgICAgICAgcmV0dXJuIEVkaXRvckV4dGVuZHMuVXVpZFV0aWxzLmdlbmVyYXRlKHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjcmVhdGVQcmVmYWJJbnN0YW5jZSgpIHtcclxuICAgICAgICBjb25zdCBwcmVmYWJJbnN0YW5jZSA9IG5ldyBQcmVmYWJJbnN0YW5jZSgpO1xyXG4gICAgICAgIHByZWZhYkluc3RhbmNlLmZpbGVJZCA9IHRoaXMuZ2VuZXJhdGVVVUlEKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBwcmVmYWJJbnN0YW5jZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY3JlYXRlUHJlZmFiSW5mbyhmaWxlSWQ6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSBuZXcgUHJlZmFiSW5mbygpO1xyXG4gICAgICAgIHByZWZhYkluZm8uZmlsZUlkID0gZmlsZUlkO1xyXG4gICAgICAgIHJldHVybiBwcmVmYWJJbmZvO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbG9uZUluc3RhbmNlV2l0aE5ld0ZpbGVJZChpbnN0YW5jZTogUHJlZmFiSW5zdGFuY2UpIHtcclxuICAgICAgICBjb25zdCBuZXdJbnN0YW5jZSA9IHRoaXMuY3JlYXRlUHJlZmFiSW5zdGFuY2UoKTtcclxuICAgICAgICAvLyDlpI3liLZwcm9wZXJ0eU92ZXJyaWRlc1xyXG4gICAgICAgIGNvbnN0IGNsb25lU291cmNlUHJvcE92ZXJyaWRlcyA9IGluc3RhbmNlLnByb3BlcnR5T3ZlcnJpZGVzO1xyXG4gICAgICAgIG5ld0luc3RhbmNlLnByb3BlcnR5T3ZlcnJpZGVzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbG9uZVNvdXJjZVByb3BPdmVycmlkZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgY2xvbmVTb3VyY2VQcm9wT3ZlcnJpZGUgPSBjbG9uZVNvdXJjZVByb3BPdmVycmlkZXNbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3BPdmVycmlkZSA9IG5ldyBQcm9wZXJ0eU92ZXJyaWRlSW5mbygpO1xyXG4gICAgICAgICAgICBwcm9wT3ZlcnJpZGUudGFyZ2V0SW5mbyA9IGNsb25lU291cmNlUHJvcE92ZXJyaWRlLnRhcmdldEluZm87XHJcbiAgICAgICAgICAgIHByb3BPdmVycmlkZS5wcm9wZXJ0eVBhdGggPSBjbG9uZVNvdXJjZVByb3BPdmVycmlkZS5wcm9wZXJ0eVBhdGg7XHJcbiAgICAgICAgICAgIHByb3BPdmVycmlkZS52YWx1ZSA9IGNsb25lU291cmNlUHJvcE92ZXJyaWRlLnZhbHVlO1xyXG4gICAgICAgICAgICBuZXdJbnN0YW5jZS5wcm9wZXJ0eU92ZXJyaWRlcy5wdXNoKHByb3BPdmVycmlkZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDlpI3liLZtb3VudGVkQ2hpbGRyZW5cclxuICAgICAgICBjb25zdCBjbG9uZU1vdW50ZWRDaGlsZHJlbiA9IGluc3RhbmNlLm1vdW50ZWRDaGlsZHJlbjtcclxuICAgICAgICBuZXdJbnN0YW5jZS5tb3VudGVkQ2hpbGRyZW4gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsb25lTW91bnRlZENoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNsb25lU291cmNlTW91bnRlZENoaWxkID0gY2xvbmVNb3VudGVkQ2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgIGNvbnN0IG1vdW50ZWRDaGlsZCA9IG5ldyBNb3VudGVkQ2hpbGRyZW5JbmZvKCk7XHJcbiAgICAgICAgICAgIG1vdW50ZWRDaGlsZC50YXJnZXRJbmZvID0gY2xvbmVTb3VyY2VNb3VudGVkQ2hpbGQudGFyZ2V0SW5mbztcclxuICAgICAgICAgICAgbW91bnRlZENoaWxkLm5vZGVzID0gY2xvbmVTb3VyY2VNb3VudGVkQ2hpbGQubm9kZXMuc2xpY2UoKTtcclxuICAgICAgICAgICAgbmV3SW5zdGFuY2UubW91bnRlZENoaWxkcmVuLnB1c2gobW91bnRlZENoaWxkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOWkjeWItm1vdW50ZWRDb21wb25lbnRzXHJcbiAgICAgICAgY29uc3QgY2xvbmVNb3VudGVkQ29tcG9uZW50cyA9IGluc3RhbmNlLm1vdW50ZWRDb21wb25lbnRzO1xyXG4gICAgICAgIG5ld0luc3RhbmNlLm1vdW50ZWRDb21wb25lbnRzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbG9uZU1vdW50ZWRDb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNsb25lU291cmNlTW91bnRlZENvbXAgPSBjbG9uZU1vdW50ZWRDb21wb25lbnRzW2ldO1xyXG4gICAgICAgICAgICBjb25zdCBtb3VudGVkQ29tcCA9IG5ldyBNb3VudGVkQ29tcG9uZW50c0luZm8oKTtcclxuICAgICAgICAgICAgbW91bnRlZENvbXAudGFyZ2V0SW5mbyA9IGNsb25lU291cmNlTW91bnRlZENvbXAudGFyZ2V0SW5mbztcclxuICAgICAgICAgICAgbW91bnRlZENvbXAuY29tcG9uZW50cyA9IGNsb25lU291cmNlTW91bnRlZENvbXAuY29tcG9uZW50cy5zbGljZSgpO1xyXG4gICAgICAgICAgICBuZXdJbnN0YW5jZS5tb3VudGVkQ29tcG9uZW50cy5wdXNoKG1vdW50ZWRDb21wKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOWkjeWItnJlbW92ZWRDb21wb25lbnRzXHJcbiAgICAgICAgbmV3SW5zdGFuY2UucmVtb3ZlZENvbXBvbmVudHMgPSBpbnN0YW5jZS5yZW1vdmVkQ29tcG9uZW50cy5zbGljZSgpO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3SW5zdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFByZWZhYkluc3RhbmNlUm9vdChub2RlOiBOb2RlKSB7XHJcbiAgICAgICAgbGV0IHBhcmVudDogTm9kZSB8IG51bGwgPSBub2RlO1xyXG4gICAgICAgIGxldCByb290OiBOb2RlIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgd2hpbGUgKHBhcmVudCkge1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIG1lbWJlciBhY2Nlc3NcclxuICAgICAgICAgICAgaWYgKHBhcmVudFsnX3ByZWZhYiddPy5pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgcm9vdCA9IHBhcmVudDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcm9vdDtcclxuICAgIH1cclxuXHJcbiAgICBpc1NhbWVTb3VyY2VUYXJnZXRPdmVycmlkZSh0YXJnZXRPdmVycmlkZTogVGFyZ2V0T3ZlcnJpZGVJbmZvLCBzb3VyY2U6IENvbXBvbmVudCB8IE5vZGUsIHNvdXJjZUxvY2FsSUQ6IHN0cmluZ1tdIHwgdW5kZWZpbmVkLCBwcm9wUGF0aDogc3RyaW5nW10pIHtcclxuICAgICAgICBpZiAodGFyZ2V0T3ZlcnJpZGUuc291cmNlID09PSBzb3VyY2UgJiZcclxuICAgICAgICAgICAgKCghc291cmNlTG9jYWxJRCAmJiAhdGFyZ2V0T3ZlcnJpZGUuc291cmNlSW5mbykgfHxcclxuICAgICAgICAgICAgICAgIGNvbXBhcmVTdHJpbmdBcnJheShzb3VyY2VMb2NhbElELCB0YXJnZXRPdmVycmlkZS5zb3VyY2VJbmZvPy5sb2NhbElEKSkgJiZcclxuICAgICAgICAgICAgY29tcGFyZVN0cmluZ0FycmF5KHRhcmdldE92ZXJyaWRlLnByb3BlcnR5UGF0aCwgcHJvcFBhdGgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFNvdXJjZURhdGEoc291cmNlOiBDb21wb25lbnQpIHtcclxuICAgICAgICAvLyDlpoLmnpxzb3VyY2XmmK/kuIDkuKrmma7pgJroioLngrnkuIvnmoRDb21wb25lbnTvvIzpgqPnm7TmjqXmjIflkJHlroPlsLHlj6/ku6VcclxuICAgICAgICAvLyDlpoLmnpxzb3VyY2XmmK/kuIDkuKptb3VudGVkQ29tcG9uZW5077yM55u05o6l5oyH5ZCR5a6D5bCx5Y+v5LulXHJcbiAgICAgICAgLy8g5aaC5p6cc291cmNl5piv5LiA5LiqUHJlZmFi6IqC54K55LiL55qE6Z2ebW91bnRlZOeahENvbXBvbmVudO+8jOmCo+WwsemcgOimgemAmui/h1vmoLnoioLngrkrTG9jYWxJRF3nmoTmlrnlvI/mnaXntKLlvJXjgIJcclxuICAgICAgICBsZXQgc291cmNlVGFyZ2V0OiBDb21wb25lbnQgfCBOb2RlID0gc291cmNlO1xyXG4gICAgICAgIGxldCBzb3VyY2VMb2NhbElEO1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZU5vZGUgPSBzb3VyY2Uubm9kZTtcclxuICAgICAgICBpZiAoIXNvdXJjZU5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgaWYgKHNvdXJjZU5vZGVbJ19wcmVmYWInXSAmJiAhdGhpcy5pc01vdW50ZWRDb21wb25lbnQoc291cmNlKSkge1xyXG4gICAgICAgICAgICAvLyDlkJHkuIrmn6Xmib5QcmVmYWJJbnN0YW5jZei3r+W+hFxyXG4gICAgICAgICAgICBjb25zdCBvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvID0gdGhpcy5nZXRPdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvKHNvdXJjZU5vZGUpO1xyXG4gICAgICAgICAgICBjb25zdCBvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlOiBOb2RlIHwgbnVsbCA9IG91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8ub3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBzb3VyY2VUYXJnZXQgPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlO1xyXG4gICAgICAgICAgICAgICAgc291cmNlTG9jYWxJRCA9IG91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8udGFyZ2V0UGF0aDtcclxuICAgICAgICAgICAgICAgIHNvdXJjZUxvY2FsSUQuc3BsaWNlKDAsIDEpOyAvLyDkuI3pnIDopoHlrZjmnIDlpJblsYLnmoRQcmVmYWJJbnN0YW5jZeeahGZpbGVJRFxyXG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZS5fX3ByZWZhYj8uZmlsZUlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlTG9jYWxJRC5wdXNoKHNvdXJjZS5fX3ByZWZhYj8uZmlsZUlkKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2FuJ3QgZ2V0IGZpbGVJZCBvZiBjb21wb25lbnQ6ICR7c291cmNlLm5hbWV9IGluIG5vZGU6ICR7c291cmNlLm5vZGUubmFtZX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7IHNvdXJjZVRhcmdldCwgc291cmNlTG9jYWxJRCB9O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW1vdmVUYXJnZXRPdmVycmlkZUJ5U291cmNlKHByZWZhYkluZm86IFByZWZhYkluZm8gfCB1bmRlZmluZWQsIHNvdXJjZTogTm9kZSB8IENvbXBvbmVudCkge1xyXG4gICAgICAgIGlmICghcHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXByZWZhYkluZm8udGFyZ2V0T3ZlcnJpZGVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBpc0FueVJlbW92ZWQgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKGxldCBpID0gcHJlZmFiSW5mby50YXJnZXRPdmVycmlkZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0T3ZlcnJpZGVJdHIgPSBwcmVmYWJJbmZvLnRhcmdldE92ZXJyaWRlc1tpXTtcclxuICAgICAgICAgICAgaWYgKHRhcmdldE92ZXJyaWRlSXRyLnNvdXJjZSA9PT0gc291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICBwcmVmYWJJbmZvLnRhcmdldE92ZXJyaWRlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpc0FueVJlbW92ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaXNBbnlSZW1vdmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW1vdmVUYXJnZXRPdmVycmlkZShwcmVmYWJJbmZvOiBQcmVmYWJJbmZvIHwgdW5kZWZpbmVkIHwgbnVsbCwgc291cmNlOiBDb21wb25lbnQsIHByb3BQYXRoOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGlmICghcHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXByZWZhYkluZm8udGFyZ2V0T3ZlcnJpZGVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNvdXJjZURhdGEgPSB0aGlzLmdldFNvdXJjZURhdGEoc291cmNlKTtcclxuICAgICAgICBpZiAoIXNvdXJjZURhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc291cmNlVGFyZ2V0OiBDb21wb25lbnQgfCBOb2RlID0gc291cmNlRGF0YS5zb3VyY2VUYXJnZXQ7XHJcbiAgICAgICAgY29uc3Qgc291cmNlTG9jYWxJRCA9IHNvdXJjZURhdGEuc291cmNlTG9jYWxJRDtcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSBwcmVmYWJJbmZvLnRhcmdldE92ZXJyaWRlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRPdmVycmlkZUl0ciA9IHByZWZhYkluZm8udGFyZ2V0T3ZlcnJpZGVzW2ldO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc1NhbWVTb3VyY2VUYXJnZXRPdmVycmlkZSh0YXJnZXRPdmVycmlkZUl0ciwgc291cmNlVGFyZ2V0LCBzb3VyY2VMb2NhbElELCBwcm9wUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIHByZWZhYkluZm8udGFyZ2V0T3ZlcnJpZGVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGlzSW5UYXJnZXRPdmVycmlkZXModGFyZ2V0T3ZlcnJpZGVzOiBUYXJnZXRPdmVycmlkZUluZm9bXSwgc291cmNlOiBDb21wb25lbnQsIHByb3BQYXRoOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZURhdGEgPSB0aGlzLmdldFNvdXJjZURhdGEoc291cmNlKTtcclxuICAgICAgICBpZiAoIXNvdXJjZURhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc291cmNlVGFyZ2V0OiBDb21wb25lbnQgfCBOb2RlID0gc291cmNlRGF0YS5zb3VyY2VUYXJnZXQ7XHJcbiAgICAgICAgY29uc3Qgc291cmNlTG9jYWxJRCA9IHNvdXJjZURhdGEuc291cmNlTG9jYWxJRDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YXJnZXRPdmVycmlkZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0T3ZlcnJpZGVJdHIgPSB0YXJnZXRPdmVycmlkZXNbaV07XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzU2FtZVNvdXJjZVRhcmdldE92ZXJyaWRlKHRhcmdldE92ZXJyaWRlSXRyLCBzb3VyY2VUYXJnZXQsIHNvdXJjZUxvY2FsSUQsIHByb3BQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0VGFyZ2V0T3ZlcnJpZGUocHJlZmFiSW5mbzogUHJlZmFiSW5mbywgc291cmNlOiBDb21wb25lbnQsIHByb3BQYXRoOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGxldCB0YXJnZXRPdmVycmlkZTogVGFyZ2V0T3ZlcnJpZGVJbmZvIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbmZvLnRhcmdldE92ZXJyaWRlcykge1xyXG4gICAgICAgICAgICBwcmVmYWJJbmZvLnRhcmdldE92ZXJyaWRlcyA9IFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc291cmNlRGF0YSA9IHRoaXMuZ2V0U291cmNlRGF0YShzb3VyY2UpO1xyXG4gICAgICAgIGlmICghc291cmNlRGF0YSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNvdXJjZVRhcmdldDogQ29tcG9uZW50IHwgTm9kZSA9IHNvdXJjZURhdGEuc291cmNlVGFyZ2V0O1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZUxvY2FsSUQgPSBzb3VyY2VEYXRhLnNvdXJjZUxvY2FsSUQ7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlZmFiSW5mby50YXJnZXRPdmVycmlkZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0T3ZlcnJpZGVJdHIgPSBwcmVmYWJJbmZvLnRhcmdldE92ZXJyaWRlc1tpXTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNTYW1lU291cmNlVGFyZ2V0T3ZlcnJpZGUodGFyZ2V0T3ZlcnJpZGVJdHIsIHNvdXJjZVRhcmdldCwgc291cmNlTG9jYWxJRCwgcHJvcFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRPdmVycmlkZSA9IHRhcmdldE92ZXJyaWRlSXRyO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGFyZ2V0T3ZlcnJpZGUpIHtcclxuICAgICAgICAgICAgdGFyZ2V0T3ZlcnJpZGUgPSBuZXcgVGFyZ2V0T3ZlcnJpZGVJbmZvKCk7XHJcbiAgICAgICAgICAgIHRhcmdldE92ZXJyaWRlLnNvdXJjZSA9IHNvdXJjZVRhcmdldDtcclxuICAgICAgICAgICAgaWYgKHNvdXJjZUxvY2FsSUQpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldE92ZXJyaWRlLnNvdXJjZUluZm8gPSBuZXcgVGFyZ2V0SW5mbygpO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0T3ZlcnJpZGUuc291cmNlSW5mby5sb2NhbElEID0gc291cmNlTG9jYWxJRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0YXJnZXRPdmVycmlkZS5wcm9wZXJ0eVBhdGggPSBwcm9wUGF0aDtcclxuICAgICAgICAgICAgcHJlZmFiSW5mby50YXJnZXRPdmVycmlkZXMucHVzaCh0YXJnZXRPdmVycmlkZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGFyZ2V0T3ZlcnJpZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFByb3BlcnR5T3ZlcnJpZGVzT2ZUYXJnZXQocHJlZmFiSW5zdGFuY2U6IFByZWZhYkluc3RhbmNlLCBsb2NhbElEOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGNvbnN0IHByb3BPdmVycmlkZXM6IFByb3BlcnR5T3ZlcnJpZGVJbmZvW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZhYkluc3RhbmNlLnByb3BlcnR5T3ZlcnJpZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3BPdmVycmlkZUl0ciA9IHByZWZhYkluc3RhbmNlLnByb3BlcnR5T3ZlcnJpZGVzW2ldO1xyXG4gICAgICAgICAgICBpZiAoY29tcGFyZVN0cmluZ0FycmF5KHByb3BPdmVycmlkZUl0ci50YXJnZXRJbmZvPy5sb2NhbElELCBsb2NhbElEKSkge1xyXG4gICAgICAgICAgICAgICAgcHJvcE92ZXJyaWRlcy5wdXNoKHByb3BPdmVycmlkZUl0cik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBwcm9wT3ZlcnJpZGVzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc0luUHJvcGVydHlPdmVycmlkZXMocHJvcFBhdGg6IHN0cmluZ1tdLCBwcm9wZXJ0eU92ZXJyaWRlczogUHJvcGVydHlPdmVycmlkZUluZm9bXSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvcGVydHlPdmVycmlkZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgcHJvcE92ZXJyaWRlSXRyID0gcHJvcGVydHlPdmVycmlkZXNbaV07XHJcbiAgICAgICAgICAgIGlmIChjb21wYXJlU3RyaW5nQXJyYXkocHJvcE92ZXJyaWRlSXRyLnByb3BlcnR5UGF0aCwgcHJvcFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQcm9wZXJ0eU92ZXJyaWRlKHByZWZhYkluc3RhbmNlOiBQcmVmYWJJbnN0YW5jZSwgbG9jYWxJRDogc3RyaW5nW10sIHByb3BQYXRoOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGxldCBwcm9wT3ZlcnJpZGU6IFByb3BlcnR5T3ZlcnJpZGVJbmZvIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgbGV0IHRhcmdldEluZm86IFRhcmdldEluZm8gfCBudWxsID0gbnVsbDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZhYkluc3RhbmNlLnByb3BlcnR5T3ZlcnJpZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3BPdmVycmlkZUl0ciA9IHByZWZhYkluc3RhbmNlLnByb3BlcnR5T3ZlcnJpZGVzW2ldO1xyXG4gICAgICAgICAgICBpZiAoY29tcGFyZVN0cmluZ0FycmF5KHByb3BPdmVycmlkZUl0ci50YXJnZXRJbmZvPy5sb2NhbElELCBsb2NhbElEKSkge1xyXG4gICAgICAgICAgICAgICAgLy8g5aSN55So5bey5pyJ55qEdGFyZ2V0SW5mb++8jOWHj+WwkeaVsOaNruWGl+S9mVxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0SW5mbyA9IHByb3BPdmVycmlkZUl0ci50YXJnZXRJbmZvO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBhcmVTdHJpbmdBcnJheShwcm9wT3ZlcnJpZGVJdHIucHJvcGVydHlQYXRoLCBwcm9wUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wT3ZlcnJpZGUgPSBwcm9wT3ZlcnJpZGVJdHI7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcHJvcE92ZXJyaWRlKSB7XHJcbiAgICAgICAgICAgIHByb3BPdmVycmlkZSA9IG5ldyBQcm9wZXJ0eU92ZXJyaWRlSW5mbygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF0YXJnZXRJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRJbmZvID0gbmV3IFRhcmdldEluZm8oKTtcclxuICAgICAgICAgICAgICAgIHRhcmdldEluZm8ubG9jYWxJRCA9IGxvY2FsSUQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHByb3BPdmVycmlkZS50YXJnZXRJbmZvID0gdGFyZ2V0SW5mbztcclxuICAgICAgICAgICAgcHJvcE92ZXJyaWRlLnByb3BlcnR5UGF0aCA9IHByb3BQYXRoO1xyXG4gICAgICAgICAgICBwcmVmYWJJbnN0YW5jZS5wcm9wZXJ0eU92ZXJyaWRlcy5wdXNoKHByb3BPdmVycmlkZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcHJvcE92ZXJyaWRlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW1vdmVQcm9wZXJ0eU92ZXJyaWRlKHByZWZhYkluc3RhbmNlOiBQcmVmYWJJbnN0YW5jZSwgbG9jYWxJRDogc3RyaW5nW10sIHByb3BQYXRoOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSBwcmVmYWJJbnN0YW5jZS5wcm9wZXJ0eU92ZXJyaWRlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICBjb25zdCBwcm9wT3ZlcnJpZGVJdHIgPSBwcmVmYWJJbnN0YW5jZS5wcm9wZXJ0eU92ZXJyaWRlc1tpXTtcclxuICAgICAgICAgICAgaWYgKGNvbXBhcmVTdHJpbmdBcnJheShwcm9wT3ZlcnJpZGVJdHIudGFyZ2V0SW5mbz8ubG9jYWxJRCwgbG9jYWxJRCkgJiZcclxuICAgICAgICAgICAgICAgIGNvbXBhcmVTdHJpbmdBcnJheShwcm9wT3ZlcnJpZGVJdHIucHJvcGVydHlQYXRoLCBwcm9wUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIHByZWZhYkluc3RhbmNlLnByb3BlcnR5T3ZlcnJpZGVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZmluZFByZWZhYkluc3RhbmNlTW91bnRlZENoaWxkcmVuKHByZWZhYkluc3RhbmNlOiBQcmVmYWJJbnN0YW5jZSwgbG9jYWxJRDogc3RyaW5nW10pIHtcclxuICAgICAgICBsZXQgbW91bnRlZENoaWxkID0gbnVsbDtcclxuICAgICAgICBjb25zdCBtb3VudGVkQ2hpbGRyZW4gPSBwcmVmYWJJbnN0YW5jZS5tb3VudGVkQ2hpbGRyZW47XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtb3VudGVkQ2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRJbmZvID0gbW91bnRlZENoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICBpZiAoY2hpbGRJbmZvLmlzVGFyZ2V0KGxvY2FsSUQpKSB7XHJcbiAgICAgICAgICAgICAgICBtb3VudGVkQ2hpbGQgPSBjaGlsZEluZm87XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG1vdW50ZWRDaGlsZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY3JlYXRlTW91bnRlZENoaWxkcmVuSW5mbyhsb2NhbElEOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGNvbnN0IHRhcmdldEluZm8gPSBuZXcgVGFyZ2V0SW5mbygpO1xyXG4gICAgICAgIHRhcmdldEluZm8ubG9jYWxJRCA9IGxvY2FsSUQ7XHJcbiAgICAgICAgY29uc3QgbW91bnRlZENoaWxkSW5mbyA9IG5ldyBNb3VudGVkQ2hpbGRyZW5JbmZvKCk7XHJcbiAgICAgICAgbW91bnRlZENoaWxkSW5mby50YXJnZXRJbmZvID0gdGFyZ2V0SW5mbztcclxuXHJcbiAgICAgICAgcmV0dXJuIG1vdW50ZWRDaGlsZEluZm87XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFByZWZhYkluc3RhbmNlTW91bnRlZENoaWxkcmVuKHByZWZhYkluc3RhbmNlOiBQcmVmYWJJbnN0YW5jZSwgbG9jYWxJRDogc3RyaW5nW10pIHtcclxuICAgICAgICBsZXQgbW91bnRlZENoaWxkID0gdGhpcy5maW5kUHJlZmFiSW5zdGFuY2VNb3VudGVkQ2hpbGRyZW4ocHJlZmFiSW5zdGFuY2UsIGxvY2FsSUQpO1xyXG5cclxuICAgICAgICBpZiAoIW1vdW50ZWRDaGlsZCkge1xyXG4gICAgICAgICAgICBtb3VudGVkQ2hpbGQgPSB0aGlzLmNyZWF0ZU1vdW50ZWRDaGlsZHJlbkluZm8obG9jYWxJRCk7XHJcbiAgICAgICAgICAgIHByZWZhYkluc3RhbmNlLm1vdW50ZWRDaGlsZHJlbi5wdXNoKG1vdW50ZWRDaGlsZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbW91bnRlZENoaWxkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRQcmVmYWJJbnN0YW5jZU1vdW50ZWRDb21wb25lbnRzKHByZWZhYkluc3RhbmNlOiBQcmVmYWJJbnN0YW5jZSwgbG9jYWxJRDogc3RyaW5nW10pIHtcclxuICAgICAgICBsZXQgbW91bnRlZENvbXBvbmVudHNJbmZvID0gbnVsbDtcclxuICAgICAgICBjb25zdCBtb3VudGVkQ29tcG9uZW50cyA9IHByZWZhYkluc3RhbmNlLm1vdW50ZWRDb21wb25lbnRzO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbW91bnRlZENvbXBvbmVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50c0luZm8gPSBtb3VudGVkQ29tcG9uZW50c1tpXTtcclxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudHNJbmZvLmlzVGFyZ2V0KGxvY2FsSUQpKSB7XHJcbiAgICAgICAgICAgICAgICBtb3VudGVkQ29tcG9uZW50c0luZm8gPSBjb21wb25lbnRzSW5mbztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIW1vdW50ZWRDb21wb25lbnRzSW5mbykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRJbmZvID0gbmV3IFRhcmdldEluZm8oKTtcclxuICAgICAgICAgICAgdGFyZ2V0SW5mby5sb2NhbElEID0gbG9jYWxJRDtcclxuICAgICAgICAgICAgbW91bnRlZENvbXBvbmVudHNJbmZvID0gbmV3IE1vdW50ZWRDb21wb25lbnRzSW5mbygpO1xyXG4gICAgICAgICAgICBtb3VudGVkQ29tcG9uZW50c0luZm8udGFyZ2V0SW5mbyA9IHRhcmdldEluZm87XHJcbiAgICAgICAgICAgIHByZWZhYkluc3RhbmNlLm1vdW50ZWRDb21wb25lbnRzLnB1c2gobW91bnRlZENvbXBvbmVudHNJbmZvKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBtb3VudGVkQ29tcG9uZW50c0luZm87XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZFJlbW92ZWRDb21wb25lbnQocHJlZmFiSW5zdGFuY2U6IFByZWZhYkluc3RhbmNlLCBsb2NhbElEOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGNvbnN0IHJlbW92ZWRDb21wb25lbnRzID0gcHJlZmFiSW5zdGFuY2UucmVtb3ZlZENvbXBvbmVudHM7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZW1vdmVkQ29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRJbmZvID0gcmVtb3ZlZENvbXBvbmVudHNbaV07XHJcbiAgICAgICAgICAgIGlmIChjb21wYXJlU3RyaW5nQXJyYXkodGFyZ2V0SW5mby5sb2NhbElELCBsb2NhbElEKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB0YXJnZXRJbmZvID0gbmV3IFRhcmdldEluZm8oKTtcclxuICAgICAgICB0YXJnZXRJbmZvLmxvY2FsSUQgPSBsb2NhbElEO1xyXG4gICAgICAgIHJlbW92ZWRDb21wb25lbnRzLnB1c2godGFyZ2V0SW5mbyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlbGV0ZVJlbW92ZWRDb21wb25lbnQocHJlZmFiSW5zdGFuY2U6IFByZWZhYkluc3RhbmNlLCBsb2NhbElEOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGNvbnN0IHJlbW92ZWRDb21wb25lbnRzID0gcHJlZmFiSW5zdGFuY2UucmVtb3ZlZENvbXBvbmVudHM7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZW1vdmVkQ29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRJbmZvID0gcmVtb3ZlZENvbXBvbmVudHNbaV07XHJcbiAgICAgICAgICAgIGlmIChjb21wYXJlU3RyaW5nQXJyYXkodGFyZ2V0SW5mby5sb2NhbElELCBsb2NhbElEKSkge1xyXG4gICAgICAgICAgICAgICAgcmVtb3ZlZENvbXBvbmVudHMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3aGV0aGVyIHRoZSBub2RlIGlzIGNoaWxkIG9mIGEgcHJlZmFiXHJcbiAgICAgKiBAcGFyYW0gbm9kZSBub2RlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpc0NoaWxkT2ZQcmVmYWJJbnN0YW5jZShub2RlOiBOb2RlKSB7XHJcbiAgICAgICAgbGV0IHBhcmVudCA9IG5vZGUucGFyZW50O1xyXG4gICAgICAgIGxldCBoYXNQcmVmYWJSb290SW5QYXJlbnQgPSBmYWxzZTtcclxuICAgICAgICB3aGlsZSAocGFyZW50KSB7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmU6IHByaXZhdGUgbWVtYmVyIGFjY2Vzc1xyXG4gICAgICAgICAgICBpZiAocGFyZW50WydfcHJlZmFiJ10/Lmluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICBoYXNQcmVmYWJSb290SW5QYXJlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBoYXNQcmVmYWJSb290SW5QYXJlbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGlzUHJlZmFiSW5zdGFuY2VSb290KG5vZGU6IE5vZGUpIHtcclxuICAgICAgICAvLyBAdHMtaWdub3JlOiBwcml2YXRlIG1lbWJlciBhY2Nlc3NcclxuICAgICAgICBjb25zdCBwcmVmYWJJbmZvID0gbm9kZVsnX3ByZWZhYiddO1xyXG5cclxuICAgICAgICBpZiAoIXByZWZhYkluZm8gfHwgIXByZWZhYkluZm8uaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZTogcHJpdmF0ZSBtZW1iZXIgYWNjZXNzXHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbmZvLmluc3RhbmNlLnByZWZhYlJvb3ROb2RlIHx8ICFwcmVmYWJJbmZvLmluc3RhbmNlLnByZWZhYlJvb3ROb2RlWydfcHJlZmFiJ10/Lmluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc0NoaWxkT2ZQcmVmYWJBc3NldChub2RlOiBOb2RlKSB7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZTogcHJpdmF0ZSBtZW1iZXIgYWNjZXNzXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IG5vZGVbJ19wcmVmYWInXTtcclxuXHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50O1xyXG4gICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmU6IHByaXZhdGUgbWVtYmVyIGFjY2Vzc1xyXG4gICAgICAgIGNvbnN0IHBhcmVudFByZWZhYkluZm8gPSBwYXJlbnRbJ19wcmVmYWInXTtcclxuICAgICAgICBpZiAoIXBhcmVudFByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHByZWZhYkluZm8ucm9vdCA9PT0gcGFyZW50UHJlZmFiSW5mby5yb290KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g55So5LqO5bWM5aWX55qEcHJlZmFi5Yik5patXHJcbiAgICAgICAgaWYgKHByZWZhYkluZm8uaW5zdGFuY2U/LnByZWZhYlJvb3ROb2RlID09PSBwYXJlbnRQcmVmYWJJbmZvLnJvb3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGlzUGFydE9mUHJlZmFiQXNzZXQobm9kZTogTm9kZSkge1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmU6IHByaXZhdGUgbWVtYmVyIGFjY2Vzc1xyXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSBub2RlWydfcHJlZmFiJ107XHJcblxyXG4gICAgICAgIGNvbnN0IG91dE1vc3RQcmVmYWJJbmZvID0gdGhpcy5nZXRPdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvKG5vZGUpO1xyXG4gICAgICAgIGlmIChwcmVmYWJJbmZvICYmIG91dE1vc3RQcmVmYWJJbmZvLm91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNNb3VudGVkQ2hpbGRPZihvdXRNb3N0UHJlZmFiSW5mby5vdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlLCBub2RlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdoZXRoZXIgdGhlIG5vZGUgaXMgcGFydCBvZiBhIHByZWZhYixcclxuICAgICAqIHJvb3Qgb2YgcHJlZmFiIGlzIGFsc28gcGFydCBvZiBwcmVmYWJcclxuICAgICAqIEBwYXJhbSBub2RlIG5vZGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGlzUGFydE9mUHJlZmFiSW5zdGFuY2Uobm9kZTogTm9kZSkge1xyXG4gICAgICAgIGxldCBwYXJlbnQ6IE5vZGUgfCBudWxsID0gbm9kZTtcclxuICAgICAgICBsZXQgaGFzUHJlZmFiUm9vdEluUGFyZW50ID0gZmFsc2U7XHJcbiAgICAgICAgd2hpbGUgKHBhcmVudCkge1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlOiBwcml2YXRlIG1lbWJlciBhY2Nlc3NcclxuICAgICAgICAgICAgaWYgKHBhcmVudFsnX3ByZWZhYiddPy5pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgaGFzUHJlZmFiUm9vdEluUGFyZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaGFzUHJlZmFiUm9vdEluUGFyZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc1BhcnRPZkFzc2V0SW5QcmVmYWJJbnN0YW5jZShub2RlOiBOb2RlKSB7XHJcbiAgICAgICAgY29uc3QgaXNQYXJ0T2ZJbnN0YW5jZSA9IHRoaXMuaXNQYXJ0T2ZQcmVmYWJJbnN0YW5jZShub2RlKTtcclxuICAgICAgICBpZiAoIWlzUGFydE9mSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaXNQYXJ0T2ZBc3NldCA9IHRoaXMuaXNQYXJ0T2ZQcmVmYWJBc3NldChub2RlKTtcclxuICAgICAgICByZXR1cm4gaXNQYXJ0T2ZBc3NldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmcgOimgeiAg+iZkeW+iOWkmuenjeW1jOWll+aDheWGtSzpnIDopoHms6jmhI9tb3VudGVkQ2hpbGTkuIrlj4jmjILlhbblroNwcmVmYWLnmoTpl67pophcclxuICAgICAqIDEuIHByZWZhYkEtPm5vZGUuLi5cclxuICAgICAqIDIuIHByZWZhYkEtPm1vdXRlZE5vZGUtPnByZWZhYkItPm5vZGVcclxuICAgICAqIDMuIHByZWZhYkEtPm1vdXRlZFByZWZhYkItPm5vZGVcclxuICAgICAqIDQuIHByZWZhYkEtPm1vdXRlZFByZWZhYkItPnByZWZhYkMtPm5vZGVcclxuICAgICAqIDUuIHByZWZhYkEtPnByZWZhYkItPm5vZGVcclxuICAgICAqIEBwYXJhbSBub2RlXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0T3V0TW9zdFByZWZhYkluc3RhbmNlSW5mbyhub2RlOiBOb2RlKSB7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0UGF0aDogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBsZXQgb3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZTogTm9kZSB8IG51bGwgPSBudWxsO1xyXG4gICAgICAgIGxldCBub2RlSXRlcjogTm9kZSB8IG51bGwgPSBub2RlO1xyXG5cclxuICAgICAgICB3aGlsZSAobm9kZUl0ZXIpIHtcclxuICAgICAgICAgICAgY29uc3QgcHJlZmFiSW5zdGFuY2U6IFByZWZhYi5fdXRpbHMuUHJlZmFiSW5zdGFuY2UgfCB1bmRlZmluZWQgPSBub2RlSXRlclsnX3ByZWZhYiddPy5pbnN0YW5jZTtcclxuICAgICAgICAgICAgLy8g5ZCR5LiK5p+l5om+5Yiw56ys5LiA5Liq6aKE5Yi25L2T5a6e5L6L6IqC54K577yM5Yik5pat5pS55a6e5L6L5piv5ZCm5pyJcHJlZmFiUm9vdE5vZGUo5bWM5aWX6aKE5Yi25L2TKVxyXG4gICAgICAgICAgICAvLyDlvZPpooTliLbkvZPlrp7kvovkuI3lrZjlnKhwcmVmYWJSb290Tm9kZeaXtizmiJbogIVwcmVmYWJSb290Tm9kZeaMh+WQkeS6huW9k+WJjeagueiKgueCueaXtu+8jOivtOaYjuaJvuWIsOS6huacgOWkluWxgumihOWItuS9k+WunuS+i1xyXG4gICAgICAgICAgICBpZiAocHJlZmFiSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldFBhdGgudW5zaGlmdChwcmVmYWJJbnN0YW5jZS5maWxlSWQpO1xyXG4gICAgICAgICAgICAgICAgb3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZSA9IG5vZGVJdGVyO1xyXG4gICAgICAgICAgICAgICAgLy8g6Z2e5bWM5aWX6aKE5Yi25L2T77yM55u05o6l6L+U5ZueXHJcbiAgICAgICAgICAgICAgICBpZiAoIXByZWZhYkluc3RhbmNlLnByZWZhYlJvb3ROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmYWJSb290ID0gcHJlZmFiSW5zdGFuY2UucHJlZmFiUm9vdE5vZGU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByb290Tm9kZSA9IFNlcnZpY2UuRWRpdG9yLmdldFJvb3ROb2RlKCkgYXMgTm9kZTtcclxuICAgICAgICAgICAgICAgIGlmIChwcmVmYWJSb290ICYmIHJvb3ROb2RlICYmIGlzU2FtZU5vZGUocHJlZmFiUm9vdCwgcm9vdE5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOaYr+W1jOWll+mihOWItuS9k++8jOebtOaOpeS7jnByZWZhYlJvb3ROb2Rl5byA5aeL57un57ut5p+l5om+XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6ZyA6KaB5oqK6IqC54K55qCR5Lit55qEcHJlZmFiSW5zdGFuY2XnmoRmaWxlSWTliqDlhaXliLB0YXJnZXRQYXRo5Lit77yM5Zug5Li6Z2V0VGFyZ2V0TWFw55qE55Sf5oiQ5piv5oyJ54Wn6IqC54K55qCR55Sf5oiQ55qEXHJcbiAgICAgICAgICAgICAgICAgICAgcHVzaE5lc3RlZFByZWZhYihub2RlSXRlciwgcHJlZmFiSW5zdGFuY2UucHJlZmFiUm9vdE5vZGUsIHRhcmdldFBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOmBv+WFjeatu+W+queOr1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlSXRlciAhPT0gcHJlZmFiSW5zdGFuY2UucHJlZmFiUm9vdE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZUl0ZXIgPSBwcmVmYWJJbnN0YW5jZS5wcmVmYWJSb290Tm9kZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2dldE91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8gZmFpbGVkOiBwcmVmYWIgaW5zdGFuY2Ugcm9vdCBub2RlIGhhcyBsb29wJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBub2RlSXRlciA9IG5vZGVJdGVyLnBhcmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUsIHRhcmdldFBhdGggfTtcclxuICAgIH1cclxuXHJcbiAgICBpc1NjZW5lTm9kZShub2RlOiBOb2RlKSB7XHJcbiAgICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBTY2VuZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpuaYr+W1jOWll+eahOmihOWItuS9k1xyXG4gICAgICogQHBhcmFtIG5vZGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaXNOZXN0ZWRQcmVmYWIobm9kZTogTm9kZSkge1xyXG4gICAgICAgIGNvbnN0IHByZWZhYiA9IG5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICBjb25zdCBhc3NldFV1aWQgPSBwcmVmYWI/LmFzc2V0Py51dWlkO1xyXG4gICAgICAgIGlmICghcHJlZmFiIHx8ICFhc3NldFV1aWQpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IHBhcmVudCA9IG5vZGUucGFyZW50O1xyXG4gICAgICAgIHdoaWxlIChwYXJlbnQpIHtcclxuICAgICAgICAgICAgLy8g5ZCR5LiK6YGN5Y6G5Yiw5Zy65pmvXHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQgPT09IHBhcmVudC5zY2VuZSkge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcGFyZW50UHJlZmFiSW5mbyA9IHBhcmVudFsnX3ByZWZhYiddO1xyXG4gICAgICAgICAgICBpZiAocGFyZW50UHJlZmFiSW5mbyAmJiBhc3NldFV1aWQgIT09IHBhcmVudFByZWZhYkluZm8uYXNzZXQ/LnV1aWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIOWmguaenOajgOafpeeahOiKgueCueaYr+mihOWItuS9k+agueiKgueCueWwseebtOaOpSB0cnVlXHJcbiAgICAgICAgICAgICAgICBpZiAocHJlZmFiLmluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpc05lc3RlZCA9IHRoaXMuaXNOZXN0ZWRQcmVmYWIocGFyZW50KTtcclxuICAgICAgICAgICAgICAgIGlmICghaXNOZXN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFByZWZhYlN0YXRlSW5mbyhub2RlOiBOb2RlKSB7XHJcbiAgICAgICAgbGV0IHByZWZhYlN0YXRlID0gUHJlZmFiU3RhdGUuTm90QVByZWZhYjtcclxuICAgICAgICBsZXQgaXNVbndyYXBwYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBpc1JldmVydGFibGUgPSBmYWxzZTtcclxuICAgICAgICBsZXQgaXNBcHBsaWNhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IGlzQWRkZWRDaGlsZCA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBpc05lc3RlZCA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBhc3NldFV1aWQgPSAnJztcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNTY2VuZU5vZGUobm9kZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdGU6IHByZWZhYlN0YXRlLCBpc1Vud3JhcHBhYmxlLCBpc1JldmVydGFibGUsIGlzQXBwbGljYWJsZSwgaXNBZGRlZENoaWxkLCBpc05lc3RlZCwgYXNzZXRVdWlkIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgaWYgKG5vZGVbJ19wcmVmYWInXSkge1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIGlmIChub2RlWydfcHJlZmFiJ10uYXNzZXQpIHtcclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIGFzc2V0VXVpZCA9IG5vZGVbJ19wcmVmYWInXS5hc3NldC5fdXVpZDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBjb25zdCBwcmVmYWJJbnN0YW5jZSA9IG5vZGVbJ19wcmVmYWInXS5pbnN0YW5jZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChwcmVmYWJJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgaXNVbndyYXBwYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpc1JldmVydGFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaXNBcHBsaWNhYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHByZWZhYlN0YXRlID0gUHJlZmFiU3RhdGUuUHJlZmFiSW5zdGFuY2U7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUgfSA9IHRoaXMuZ2V0T3V0TW9zdFByZWZhYkluc3RhbmNlSW5mbyhub2RlKTtcclxuICAgICAgICAgICAgICAgIGlmIChvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlICE9PSBub2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNVbndyYXBwYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlzUmV2ZXJ0YWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlzQXBwbGljYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcHJlZmFiU3RhdGUgPSBQcmVmYWJTdGF0ZS5QcmVmYWJDaGlsZDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8g5qOA5p+l5piv5ZCm5piv5bWM5aWXIHByZWZhYlxyXG4gICAgICAgICAgICBpc05lc3RlZCA9IHRoaXMuaXNOZXN0ZWRQcmVmYWIobm9kZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIGlmICghbm9kZVsnX3ByZWZhYiddLmFzc2V0IHx8IG5vZGVbJ19wcmVmYWInXS5hc3NldC5pc0RlZmF1bHQgfHwgbm9kZVsnX3ByZWZhYiddLmFzc2V0LnV1aWQgPT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICBwcmVmYWJTdGF0ZSA9IFByZWZhYlN0YXRlLlByZWZhYkxvc3RBc3NldDtcclxuICAgICAgICAgICAgICAgIC8vIOi1hOa6kOS4ouWkseaXtuimgeWFgeiuuHVubGlua1xyXG4gICAgICAgICAgICAgICAgaXNVbndyYXBwYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzU3ViQXNzZXQoYXNzZXRVdWlkKSkge1xyXG4gICAgICAgICAgICAgICAgaXNBcHBsaWNhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChub2RlLnBhcmVudCAmJiAhdGhpcy5pc1NjZW5lTm9kZShub2RlLnBhcmVudCkpIHtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBjb25zdCBwYXJlbnRQcmVmYWJJbmZvID0gbm9kZS5wYXJlbnRbJ19wcmVmYWInXTtcclxuICAgICAgICAgICAgaWYgKHBhcmVudFByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8gPSB0aGlzLmdldE91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8obm9kZS5wYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8gJiYgb3V0TW9zdFByZWZhYkluc3RhbmNlSW5mby5vdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNNb3VudGVkQ2hpbGRPZihvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvLm91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUsIG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzQWRkZWRDaGlsZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IHByZWZhYlN0YXRlLCBpc1Vud3JhcHBhYmxlLCBpc1JldmVydGFibGUsIGlzQXBwbGljYWJsZSwgaXNBZGRlZENoaWxkLCBpc05lc3RlZCwgYXNzZXRVdWlkIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldE1vdW50ZWRSb290KG5vZGVPckNvbXA6IE5vZGUgfCBDb21wb25lbnQpIHtcclxuICAgICAgICByZXR1cm4gbm9kZU9yQ29tcFtlZGl0b3JFeHRyYXNUYWddPy5tb3VudGVkUm9vdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0TW91bnRlZFJvb3Qobm9kZU9yQ29tcDogTm9kZSB8IENvbXBvbmVudCwgbW91bnRlZFJvb3Q6IE5vZGUgfCB1bmRlZmluZWQpIHtcclxuICAgICAgICBpZiAoIW5vZGVPckNvbXApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFub2RlT3JDb21wW2VkaXRvckV4dHJhc1RhZ10pIHtcclxuICAgICAgICAgICAgbm9kZU9yQ29tcFtlZGl0b3JFeHRyYXNUYWddID0ge307XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5vZGVPckNvbXBbZWRpdG9yRXh0cmFzVGFnXS5tb3VudGVkUm9vdCA9IG1vdW50ZWRSb290O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOW+heS8mOWMlu+8jOi/memHjOimgeaYr+WinuWKoOeahOiKgueCueWkmuS6huS8muavlOi+g+i0ueaXtlxyXG4gICAgcHJpdmF0ZSBpc01vdW50ZWRDaGlsZE9mKHByZWZhYkluc3RhbmNlTm9kZTogTm9kZSwgbm9kZTogTm9kZSkge1xyXG4gICAgICAgIGNvbnN0IG1vdW50ZWRSb290ID0gdGhpcy5nZXRNb3VudGVkUm9vdChub2RlKTtcclxuICAgICAgICBpZiAobW91bnRlZFJvb3QgJiYgbW91bnRlZFJvb3QgPT09IHByZWZhYkluc3RhbmNlTm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaXNNb3VudGVkQ29tcG9uZW50KGNvbXBvbmVudDogQ29tcG9uZW50KSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGNvbXBvbmVudC5ub2RlO1xyXG5cclxuICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluc3RhbmNlSW5mbyA9IHRoaXMuZ2V0T3V0TW9zdFByZWZhYkluc3RhbmNlSW5mbyhub2RlKTtcclxuICAgICAgICBjb25zdCBvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlOiBOb2RlIHwgbnVsbCA9IG91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8ub3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZTtcclxuICAgICAgICBpZiAoIW91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbW91bnRlZFJvb3QgPSB0aGlzLmdldE1vdW50ZWRSb290KGNvbXBvbmVudCk7XHJcblxyXG4gICAgICAgIGlmIChtb3VudGVkUm9vdCAmJiBtb3VudGVkUm9vdCA9PT0gb3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UmVtb3ZlZENvbXBvbmVudHMobm9kZTogTm9kZSkge1xyXG4gICAgICAgIGNvbnN0IHJlbW92ZWRDb21wczogQ29tcG9uZW50W10gPSBbXTtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IG5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICBpZiAoIXByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlbW92ZWRDb21wcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8gPSB0aGlzLmdldE91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8obm9kZSk7XHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZTogTm9kZSB8IG51bGwgPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvLm91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGU7XHJcbiAgICAgICAgaWYgKCFvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZW1vdmVkQ29tcHM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRhcmdldFBhdGg6IHN0cmluZ1tdID0gb3V0TW9zdFByZWZhYkluc3RhbmNlSW5mby50YXJnZXRQYXRoO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBjb25zdCBvdXRNb3N0UHJlZmFiSW5zdGFuY2U6IFByZWZhYi5fdXRpbHMuUHJlZmFiSW5zdGFuY2UgfCB1bmRlZmluZWQgPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlWydfcHJlZmFiJ10/Lmluc3RhbmNlO1xyXG5cclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluZm8gPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlWydfcHJlZmFiJ107XHJcbiAgICAgICAgaWYgKG91dE1vc3RQcmVmYWJJbnN0YW5jZSAmJiBvdXRNb3N0UHJlZmFiSW5mbyAmJiBvdXRNb3N0UHJlZmFiSW5mby5hc3NldCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKG91dE1vc3RQcmVmYWJJbnN0YW5jZS5yZW1vdmVkQ29tcG9uZW50cy5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlbW92ZWRDb21wcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGFyZ2V0UGF0aC5zcGxpY2UoMCwgMSk7XHJcbiAgICAgICAgICAgIHRhcmdldFBhdGgucHVzaChwcmVmYWJJbmZvLmZpbGVJZCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBhc3NldFJvb3ROb2RlID0gdGhpcy5nZXRQcmVmYWJBc3NldE5vZGVJbnN0YW5jZShvdXRNb3N0UHJlZmFiSW5mbyk7XHJcbiAgICAgICAgICAgIGlmICghYXNzZXRSb290Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlbW92ZWRDb21wcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgYXNzZXROb2RlID0gdGhpcy5nZXRUYXJnZXQodGFyZ2V0UGF0aCwgYXNzZXRSb290Tm9kZSwgdHJ1ZSkgYXMgTm9kZTtcclxuICAgICAgICAgICAgaWYgKCFhc3NldE5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZW1vdmVkQ29tcHM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGN1ckNvbXBGaWxlSURzID0gbm9kZS5jb21wb25lbnRzLm1hcCgoY29tcCkgPT4gY29tcC5fX3ByZWZhYj8uZmlsZUlkKS5maWx0ZXIoKGlkKSA9PiAhIWlkKTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBhc3NldENvbXAgb2YgYXNzZXROb2RlLmNvbXBvbmVudHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhc3NldENvbXAuX19wcmVmYWIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWN1ckNvbXBGaWxlSURzLmluY2x1ZGVzKGFzc2V0Q29tcC5fX3ByZWZhYi5maWxlSWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWRDb21wcy5wdXNoKGFzc2V0Q29tcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVtb3ZlZENvbXBzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjaGVja1RvUmVtb3ZlVGFyZ2V0T3ZlcnJpZGUoc291cmNlOiBOb2RlIHwgQ29tcG9uZW50LCByb290OiBOb2RlIHwgU2NlbmUgfCBudWxsKSB7XHJcbiAgICAgICAgaWYgKCFyb290KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGlmICh0aGlzLnJlbW92ZVRhcmdldE92ZXJyaWRlQnlTb3VyY2Uocm9vdFsnX3ByZWZhYiddLCBzb3VyY2UpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyZUNoYW5nZU1zZyhyb290KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGZpbmRPdXRtb3N0UHJlZmFiSW5zdGFuY2VOb2Rlcyhub2RlOiBOb2RlIHwgbnVsbCwgaW5zdGFuY2VSb290czogTm9kZVtdKSB7XHJcbiAgICAgICAgaWYgKCFub2RlKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSBub2RlWydfcHJlZmFiJ107XHJcblxyXG4gICAgICAgIGlmIChwcmVmYWJJbmZvPy5pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAvLyDpgYfliLDpooTliLbkvZPml7bvvIzopoHlr7ltb3VudGVkY2hpbGRyZW7ov5vooYzpgJLlvZIs5LiN6IO95peg6ISR5a+55a2Q6IqC54K56YCS5b2SXHJcbiAgICAgICAgICAgIGluc3RhbmNlUm9vdHMucHVzaChub2RlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIOa4heepuumihOWItuS9k+WPiuWFtuW1jOWll+mihOWItuS9k+eahG5lc3RlZFByZWZhYkluc3RhbmNlUm9vdHNcclxuICAgICAgICAgICAgaWYgKHByZWZhYkluZm8ubmVzdGVkUHJlZmFiSW5zdGFuY2VSb290cykge1xyXG4gICAgICAgICAgICAgICAgcHJlZmFiSW5mby5uZXN0ZWRQcmVmYWJJbnN0YW5jZVJvb3RzLmZvckVhY2goKHByZWZhYk5vZGU6IE5vZGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZWZhYk5vZGVbJ19wcmVmYWInXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYk5vZGVbJ19wcmVmYWInXS5uZXN0ZWRQcmVmYWJJbnN0YW5jZVJvb3RzID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcHJlZmFiSW5mby5uZXN0ZWRQcmVmYWJJbnN0YW5jZVJvb3RzID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwcmVmYWJJbmZvLmluc3RhbmNlPy5tb3VudGVkQ2hpbGRyZW4/LmZvckVhY2goKG1vdW50ZWRDaGlsZHJlbkluZm86IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbW91bnRlZENoaWxkcmVuSW5mby5ub2Rlcy5mb3JFYWNoKChjaGlsZDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maW5kT3V0bW9zdFByZWZhYkluc3RhbmNlTm9kZXMoY2hpbGQsIGluc3RhbmNlUm9vdHMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIOaZrumAmuiKgueCueS4gOebtOmAkuW9klxyXG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmluZE91dG1vc3RQcmVmYWJJbnN0YW5jZU5vZGVzKGNoaWxkLCBpbnN0YW5jZVJvb3RzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdhdGhlclByZWZhYkluc3RhbmNlUm9vdHMocm9vdE5vZGU6IE5vZGUgfCBTY2VuZSkge1xyXG4gICAgICAgIC8vIGdhdGhlciBwcmVmYWJJbnN0YW5jZSBub2RlIGluZm9cclxuICAgICAgICBjb25zdCBpbnN0YW5jZVJvb3RzOiBOb2RlW10gPSBbXTtcclxuICAgICAgICByb290Tm9kZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZDogTm9kZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXNFZGl0b3JOb2RlKGNoaWxkIGFzIE5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5maW5kT3V0bW9zdFByZWZhYkluc3RhbmNlTm9kZXMoY2hpbGQgYXMgTm9kZSwgaW5zdGFuY2VSb290cyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZVJvb3RzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgaWYgKCFyb290Tm9kZVsnX3ByZWZhYiddKSB7XHJcbiAgICAgICAgICAgICAgICByb290Tm9kZVsnX3ByZWZhYiddID0gdGhpcy5jcmVhdGVQcmVmYWJJbmZvKHJvb3ROb2RlLnV1aWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJvb3RQcmVmYWJJbmZvID0gcm9vdE5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICAgICAgcm9vdFByZWZhYkluZm8ubmVzdGVkUHJlZmFiSW5zdGFuY2VSb290cyA9IGluc3RhbmNlUm9vdHM7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3Qgcm9vdFByZWZhYkluZm8gPSByb290Tm9kZVsnX3ByZWZhYiddO1xyXG4gICAgICAgICAgICBpZiAocm9vdFByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgICAgIHJvb3RQcmVmYWJJbmZvLm5lc3RlZFByZWZhYkluc3RhbmNlUm9vdHMgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcHVibGljIGNvbGxlY3RQcmVmYWJJbnN0YW5jZUlEcyhyb290Tm9kZTogTm9kZSl7XHJcbiAgICAvLyAgICAgY29uc3QgcHJlZmFiSW5mbyA9IHRoaXMuZ2V0UHJlZmFiKHJvb3ROb2RlKTtcclxuICAgIC8vICAgICBjb25zdCBpbnN0YW5jZXMgPSBwcmVmYWJJbmZvPy5uZXN0ZWRQcmVmYWJJbnN0YW5jZVJvb3RzO1xyXG4gICAgLy8gICAgIGlmIChpbnN0YW5jZXMgJiYgaW5zdGFuY2VzLmxlbmd0aCA+IDApIHtcclxuICAgIC8vICAgICAgICAgLy8g6YGN5Y6GaW5zdGFuY2XkuIrmiYDmnInlrZDoioLngrnvvIjljIXmi6xtb3VudGVk55qE6IqC54K577yJXHJcbiAgICAvLyAgICAgICAgIGluc3RhbmNlcy5mb3JFYWNoKG5vZGUgPT4ge1xyXG4gICAgLy8gICAgICAgICAgICAgY29uc3QgcHJlZmFiID0gdGhpcy5nZXRQcmVmYWIobm9kZSk7XHJcbiAgICAvLyAgICAgICAgICAgICBpZiAocHJlZmFiICYmICF0aGlzLmdldE1vdW50ZWRSb290KG5vZGUpKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgY29uc3QgaWRzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIG5vZGUud2FsaygoY2hpbGQpID0+IHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgaWRzLnB1c2goY2hpbGQudXVpZCk7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIGNoaWxkLmNvbXBvbmVudHMuZm9yRWFjaChjb21wb25lbnQgPT4ge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC51dWlkKXtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZHMucHVzaChjb21wb25lbnQudXVpZCk7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIGlmIChwcmVmYWIuaW5zdGFuY2U/Lmlkcykge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBwcmVmYWIuaW5zdGFuY2UuaWRzID0gaWRzO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygn5pS26ZuG5ZCO55qE6aKE5Yi25L2TaWQnLCBwcmVmYWIuaW5zdGFuY2U/Lmlkcy5sZW5ndGgpO1xyXG4gICAgLy8gICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8gcHJlZmFiIOaYr+WQpuaYr+WtkOi1hOa6kO+8jOavlOWmgkZCWOeUn+aIkOeahHByZWZhYlxyXG4gICAgcHVibGljIGlzU3ViQXNzZXQodXVpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHV1aWQuaW5jbHVkZXMoJ0AnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVtb3ZlUHJlZmFiSW5mbyhub2RlOiBOb2RlKSB7XHJcbiAgICAgICAgdGhpcy5maXJlQmVmb3JlQ2hhbmdlTXNnKG5vZGUpO1xyXG5cclxuICAgICAgICAvLyBAdHMtaWdub3JlIG1lbWJlciBhY2Nlc3NcclxuICAgICAgICBub2RlWydfcHJlZmFiJ10gPSBudWxsO1xyXG5cclxuICAgICAgICAvLyByZW1vdmUgY29tcG9uZW50IHByZWZhYkluZm9cclxuICAgICAgICBub2RlLmNvbXBvbmVudHMuZm9yRWFjaCgoY29tcCkgPT4ge1xyXG4gICAgICAgICAgICBjb21wLl9fcHJlZmFiID0gbnVsbDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5maXJlQ2hhbmdlTXNnKG5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOacieWPr+iDveS4gOS6m+aEj+WkluaDheWGteWvvOiHtOmUmeivr+eahE1vdW50ZWRSb29055qE5byV55SoXHJcbiAgICAvLyDlr7zoh7Tluo/liJfljJbkuobkuIDkupvml6DmlYjnmoTmlbDmja5cclxuICAgIC8vIOi/memHjOagoemqjE1vdW50ZWRSb29055qE5pWw5piv5ZCm5YeG56GuXHJcbiAgICBwdWJsaWMgY2hlY2tNb3VudGVkUm9vdERhdGEobm9kZTogTm9kZSwgcmVjdXJzaXZlbHk6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBtb3VudGVkUm9vdCA9IHRoaXMuZ2V0TW91bnRlZFJvb3Qobm9kZSk7XHJcblxyXG4gICAgICAgIGlmIChtb3VudGVkUm9vdCkge1xyXG4gICAgICAgICAgICBsZXQgaXNSaWdodCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIGNvbnN0IHByZWZhYkluc3RhbmNlID0gbW91bnRlZFJvb3RbJ19wcmVmYWInXT8uaW5zdGFuY2U7XHJcbiAgICAgICAgICAgIGlmIChwcmVmYWJJbnN0YW5jZSAmJiBwcmVmYWJJbnN0YW5jZS5tb3VudGVkQ2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlZmFiSW5zdGFuY2UubW91bnRlZENoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbW91bnRlZEluZm8gPSBwcmVmYWJJbnN0YW5jZS5tb3VudGVkQ2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vdW50ZWRJbmZvLm5vZGVzLmluY2x1ZGVzKG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzUmlnaHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghaXNSaWdodCkge1xyXG4gICAgICAgICAgICAgICAgLy8g5qCh6aqM5LiN6YCa6L+H77yM5Yig6ZmkTW91bnRlZFJvb3TmlbDmja5cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TW91bnRlZFJvb3Qobm9kZSwgdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbm9kZS5jb21wb25lbnRzLmZvckVhY2goKGNvbXApID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY29tcE1vdW50ZWRSb290ID0gdGhpcy5nZXRNb3VudGVkUm9vdChjb21wKTtcclxuICAgICAgICAgICAgaWYgKGNvbXBNb3VudGVkUm9vdCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlzUmlnaHQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZhYkluc3RhbmNlID0gY29tcE1vdW50ZWRSb290WydfcHJlZmFiJ10/Lmluc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHByZWZhYkluc3RhbmNlICYmIHByZWZhYkluc3RhbmNlLm1vdW50ZWRDb21wb25lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVmYWJJbnN0YW5jZS5tb3VudGVkQ29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb3VudGVkSW5mbyA9IHByZWZhYkluc3RhbmNlLm1vdW50ZWRDb21wb25lbnRzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW91bnRlZEluZm8uY29tcG9uZW50cy5pbmNsdWRlcyhjb21wKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSaWdodCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWlzUmlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDmoKHpqozkuI3pgJrov4fvvIzliKDpmaRNb3VudGVkUm9vdOaVsOaNrlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0TW91bnRlZFJvb3QoY29tcCwgdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAocmVjdXJzaXZlbHkpIHtcclxuICAgICAgICAgICAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja01vdW50ZWRSb290RGF0YShjaGlsZCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVtb3ZlUHJlZmFiSW5zdGFuY2VSb290cyhyb290Tm9kZTogTm9kZSB8IFNjZW5lKSB7XHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IHJvb3ROb2RlWydfcHJlZmFiJ107XHJcbiAgICAgICAgaWYgKHByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgcHJlZmFiSW5mby5uZXN0ZWRQcmVmYWJJbnN0YW5jZVJvb3RzID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyDmnInkupt0YXJnZXRPdmVycmlkZemHjOeahHNvdXJjZemDveS4uuepuuS6hu+8jOmcgOimgeWOu+aOiei/meS6m1xyXG4gICAgLy8g5YaX5L2Z5pWw5o2uXHJcbiAgICBwdWJsaWMgY2hlY2tUYXJnZXRPdmVycmlkZXNEYXRhKG5vZGU6IE5vZGUgfCBTY2VuZSkge1xyXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSBub2RlWydfcHJlZmFiJ107XHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHRhcmdldE92ZXJyaWRlcyA9IHByZWZhYkluZm8udGFyZ2V0T3ZlcnJpZGVzO1xyXG4gICAgICAgIGlmICghdGFyZ2V0T3ZlcnJpZGVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSB0YXJnZXRPdmVycmlkZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0T3ZlcnJpZGVJdHIgPSB0YXJnZXRPdmVycmlkZXNbaV07XHJcbiAgICAgICAgICAgIGlmICghdGFyZ2V0T3ZlcnJpZGVJdHIgfHwgIXRhcmdldE92ZXJyaWRlSXRyLnNvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0T3ZlcnJpZGVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIpOaWreiKgueCueaYr+WQpuaYr+acgOWkluS4gOWxgueahFByZWZhYkluc3RhbmNl55qETW91bnRlZOiKgueCuVxyXG4gICAgICogbW91bnRlZENoaWxk55qE5pmu6YCa5a2Q6IqC54K55Lmf6ZyA6KaB5Yik5patXHJcbiAgICAgKiBAcGFyYW0gbm9kZVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIGlzT3V0bW9zdFByZWZhYkluc3RhbmNlTW91bnRlZENoaWxkcmVuKG5vZGU6IE5vZGUpIHtcclxuICAgICAgICBsZXQgbm9kZUl0ZXI6IE5vZGUgfCBudWxsID0gbm9kZTtcclxuICAgICAgICB3aGlsZSAobm9kZUl0ZXIpIHtcclxuICAgICAgICAgICAgY29uc3QgbW91bnRlZFJvb3QgPSB0aGlzLmdldE1vdW50ZWRSb290KG5vZGVJdGVyKTtcclxuICAgICAgICAgICAgaWYgKG1vdW50ZWRSb290KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvID0gdGhpcy5nZXRPdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvKG1vdW50ZWRSb290KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUgPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvLm91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGU7XHJcbiAgICAgICAgICAgICAgICAvLyDoioLngrnmmK/mjILlnKjmnIDlpJblsYLnmoRQcmVmYWJJbnN0YW5jZeS4i+eahG1vdW50ZWRDaGlsZHJlblxyXG4gICAgICAgICAgICAgICAgaWYgKG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUgPT09IG1vdW50ZWRSb290KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbm9kZUl0ZXIgPSBub2RlSXRlci5wYXJlbnQ7XHJcbiAgICAgICAgICAgIGlmICghbm9kZUl0ZXIgfHwgdGhpcy5pc1ByZWZhYkluc3RhbmNlUm9vdChub2RlSXRlcikpIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOenu+mZpOaXoOaViOeahHByb3BlcnR5T3ZlcnJpZGVz5L+h5oGvLOenu+mZpOe7hOS7tuaXtu+8jOmcgOimgeenu+mZpOWFs+S6juivpee7hOS7tueahHByb3BlcnR5T3ZlcnJpZGVzXHJcbiAgICAgKiBAcGFyYW0gcm9vdCDpooTliLbkvZPlrp7kvovoioLngrlcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlbW92ZUludmFsaWRQcm9wZXJ0eU92ZXJyaWRlcyhyb290OiBOb2RlKSB7XHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IHJvb3RbJ19wcmVmYWInXTtcclxuICAgICAgICBpZiAocHJlZmFiSW5mbyAmJiBwcmVmYWJJbmZvLmluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlID0gcHJlZmFiSW5mby5pbnN0YW5jZTtcclxuICAgICAgICAgICAgY29uc3QgcHJvcGVydHlPdmVycmlkZXMgPSBpbnN0YW5jZS5wcm9wZXJ0eU92ZXJyaWRlcztcclxuICAgICAgICAgICAgY29uc3Qgc2l6ZSA9IHByb3BlcnR5T3ZlcnJpZGVzLmxlbmd0aDtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0TWFwID0gdGhpcy5nZXRUYXJnZXRNYXAocm9vdCk7XHJcbiAgICAgICAgICAgIGlmICghdGFyZ2V0TWFwIHx8IE9iamVjdC5rZXlzKHRhcmdldE1hcCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdyZW1vdmVJbnZhbGlkUHJvcGVydHlPdmVycmlkZXMgcmV0dXJuLHRhcmdldE1hcCBpcyBlbXB0eScsIHJvb3QpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gc2l6ZSAtIDE7IGluZGV4ID49IDA7IGluZGV4LS0pIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByb3BPdmVycmlkZSA9IHByb3BlcnR5T3ZlcnJpZGVzW2luZGV4XTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldEluZm8gPSBwcm9wT3ZlcnJpZGUudGFyZ2V0SW5mbztcclxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5Yik5patdGFyZ2V0SW5mb+aYr+WQpuWtmOWcqO+8jOS4jeWtmOWcqOeahOivne+8jOenu+mZpOaVsOaNrlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IFByZWZhYi5fdXRpbHMuZ2V0VGFyZ2V0KHRhcmdldEluZm8ubG9jYWxJRCwgdGFyZ2V0TWFwKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU92ZXJyaWRlcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygn56e76Zmk5peg5pWI55qEcHJvcGVydHlPdmVycmlkZXPkv6Hmga8nLCBwcm9wT3ZlcnJpZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiEmuacrOWxnuaAp+S4jeWtmOWcqOaXtu+8jOaIluiAhemihOWItuS9k+WGheeahOWtkOiKgueCuS/nu4Tku7bkuKLlpLHml7Ys6KaB56e76Zmk5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gcm9vdFxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlbW92ZUludmFsaWRUYXJnZXRPdmVycmlkZXMocm9vdDogTm9kZSkge1xyXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSByb290Py5bJ19wcmVmYWInXTtcclxuICAgICAgICBpZiAocHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRPdmVycmlkZXMgPSBwcmVmYWJJbmZvLnRhcmdldE92ZXJyaWRlcztcclxuICAgICAgICAgICAgaWYgKCF0YXJnZXRPdmVycmlkZXMpIHJldHVybjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaW5kZXggPSB0YXJnZXRPdmVycmlkZXMubGVuZ3RoIC0gMTsgaW5kZXggPj0gMDsgaW5kZXgtLSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5mbzogVGFyZ2V0T3ZlcnJpZGVJbmZvID0gdGFyZ2V0T3ZlcnJpZGVzW2luZGV4XTtcclxuICAgICAgICAgICAgICAgIC8vIOWIpOaWreW8leeUqOiKgueCueaYr+WQpuWtmOWcqFxyXG4gICAgICAgICAgICAgICAgbGV0IHNvdXJjZTogTm9kZSB8IENvbXBvbmVudCB8IG51bGwgPSBpbmZvLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZUluZm8gPSBpbmZvLnNvdXJjZUluZm87XHJcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0OiBOb2RlIHwgQ29tcG9uZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRJbmZvID0gaW5mby50YXJnZXRJbmZvO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZUluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby5zb3VyY2UgaW5zdGFuY2VvZiBOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZSA9IHRoaXMuZ2V0VGFyZ2V0KHNvdXJjZUluZm8ubG9jYWxJRCwgaW5mby5zb3VyY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBzb3VyY2UgKOW8leeUqOeahOiKgueCueaIlue7hOS7tilcclxuICAgICAgICAgICAgICAgIC8vIGluZm8udGFyZ2V0ICjooqvlvJXnlKjnmoTnm67moIfoioLngrnnmoTpooTliLbkvZPmoLnoioLngrkpXHJcbiAgICAgICAgICAgICAgICAvLyB0YXJnZXRJbmZvICjooqvlvJXnlKjnmoQgVGFyZ2V0SW5mbyDkv6Hmga/vvIznlKjmnaXlrprkvY3lhbfkvZPlnKjlk6rkuKopXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gMS7lpoLmnpwgc291cmNlIOS4jiBpbmZvLnRhcmdldCDpg73msqHmnInkuZ/lsLHmmK/mn6Xor6LkuI3liLAgdGFyZ2V0IOS5n+mcgOimgeWJlOmZpFxyXG4gICAgICAgICAgICAgICAgaWYgKCFzb3VyY2UgJiYgIWluZm8udGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3ZlcnJpZGVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyAyLuWmguaenOayoeaciSBzb3VyY2Ug5a2Y5ZyoIGluZm8udGFyZ2V0IOS5n+WtmOWcqCB0YXJnZXRJbmZv77yM5L2G5piv6ZyA6KaB5p+l6K+i5LiA5LiL5piv5ZCm5pyJIHRhcmdldO+8jOWmguaenOayoeacieWwsei/m+ihjOWJlOmZpFxyXG4gICAgICAgICAgICAgICAgaWYgKCFzb3VyY2UgJiYgaW5mby50YXJnZXQgJiYgdGFyZ2V0SW5mbyAmJiB0YXJnZXRJbmZvLmxvY2FsSUQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSB0aGlzLmdldFRhcmdldCh0YXJnZXRJbmZvLmxvY2FsSUQsIGluZm8udGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPdmVycmlkZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICghc291cmNlIHx8ICF0YXJnZXRJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCEoaW5mby50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRoaXMuZ2V0VGFyZ2V0KHRhcmdldEluZm8ubG9jYWxJRCwgaW5mby50YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyDlsZ7mgKfkuI3lrZjlnKjvvIznm67moIfkuI3lrZjlnKgs57G75Z6L5LiN5LiA6Ie077yM5YiZ56e76Zmk5bGe5oCnXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0eVBhdGggPSBpbmZvLnByb3BlcnR5UGF0aC5zbGljZSgpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldFByb3BPd25lcjogYW55ID0gc291cmNlO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9wZXJ0eVBhdGgubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wTmFtZSA9IHByb3BlcnR5UGF0aFtpXTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyID0gQ0NDbGFzcy5BdHRyLmdldENsYXNzQXR0cnModGFyZ2V0UHJvcE93bmVyLmNvbnN0cnVjdG9yKTtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wT3duZXIgPSB0YXJnZXRQcm9wT3duZXJbcHJvcE5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHByb3BlcnR5UGF0aOS4remXtOWPr+iDveS8muaWreaOie+8jOavlOWmguaVsOe7hOiiq+a4heepulxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGFyZ2V0UHJvcE93bmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE92ZXJyaWRlcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IHByb3BlcnR5UGF0aC5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJLZXkgPSBwcm9wTmFtZSArIERFTElNRVRFUiArICdjdG9yJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5p2h5Lu25LiAOiDlvZPliY3lgLznmoTlsZ7mgKfnm67moIflgLznsbvlnovljLnphY1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5p2h5Lu25LqM77ya6ISa5pys5Lit55qE5bGe5oCn57G75Z6L77yIYXR0cueahGN0b3LvvInlupTor6XmmK90YXJnZXTnmoTniLbnsbtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIzE0MTQwICMxNDk0NCAjMTM2MTIgIzE0MDA3XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOi/memHjOeahOmAu+i+kee7j+i/h+WPjeWkjeS/ruaUue+8jOWboOS4uuWPr+iDveaAp+WunuWcqOWkquWkmuS6hlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDpnIDopoHogIPomZHmlbDnu4Tlj5jljJbvvIznsbvlnovlj5jljJbvvIzlgLzmrovnlZnvvIzoh6rlrprkuYnnsbvlnovvvIzlrZDnsbvnrYlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5ZCO57ut5bqU6K+l5bCG5riF55CG55qE5pON5L2c55So5oi35Y+Y5oiQ55So5oi35Li75Yqo5pON5L2cLOWcqOmdouadv+S4reaYvuekuuWunuS+i+S4iueahG92ZXJyaWRl5L+h5oGv77yM5bm25o+Q5L6b5Yig6Zmk6YCJ6aG5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNJbkNsYXNzQ2hhaW4odGFyZ2V0UHJvcE93bmVyLmNvbnN0cnVjdG9yLCB0YXJnZXQuY29uc3RydWN0b3IpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCAoYXR0ciAmJiBhdHRyW2F0dHJLZXldICYmICFpc0luQ2xhc3NDaGFpbih0YXJnZXQuY29uc3RydWN0b3IsIGF0dHJbYXR0cktleV0pKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3ZlcnJpZGVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOa4heeQhumihOWItuS9k+WGl+S9meaVsOaNrlxyXG4gICAgICogQHBhcmFtIHJvb3RcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlbW92ZUludmFsaWRQcmVmYWJEYXRhKHJvb3Q6IE5vZGUpIHtcclxuICAgICAgICAvLyDmuIXnkIZ0YXJnZXRPdmVycmlkZXNcclxuICAgICAgICB0aGlzLnJlbW92ZUludmFsaWRUYXJnZXRPdmVycmlkZXMocm9vdCk7XHJcblxyXG4gICAgICAgIC8vIOa4heeQhnByb3BlcnR5T3ZlcnJpZGVzXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IHJvb3RbJ19wcmVmYWInXTtcclxuICAgICAgICBjb25zdCBuZXN0ZWRJbnN0YW5jZSA9IHByZWZhYkluZm8/Lm5lc3RlZFByZWZhYkluc3RhbmNlUm9vdHM7XHJcbiAgICAgICAgaWYgKG5lc3RlZEluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIC8vIOW1jOWll+mihOWItuS9k1xyXG4gICAgICAgICAgICBuZXN0ZWRJbnN0YW5jZS5mb3JFYWNoKChub2RlOiBOb2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUludmFsaWRQcm9wZXJ0eU92ZXJyaWRlcyhub2RlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5riF6Zmk6aKE5Yi25L2T5Lit77yM5bWM5aWX6aKE5Yi25L2T55qEcHJvcGVydE92ZXJyaWRlc+WvuemdnumihOWItuS9k+WtkOiKgueCueeahOW8leeUqFxyXG4gICAgICogQHBhcmFtIHJvb3Qg6aKE5Yi25L2T5qC56IqC54K5XHJcbiAgICAgKiBAcmV0dXJuIHtuZXN0ZWRQcmVmYWJJbnN0YW5jZVJvb3RzOntpbGxlZ2FsUmVmZXJlbmNlfX1cclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlbW92ZUludmFsaWRQcm9wZXJ0eU92ZXJyaWRlUmVmZXJlbmNlKHJvb3Q6IE5vZGUpIHtcclxuICAgICAgICBjb25zdCBwcmVmYWJJbmZvID0gdGhpcy5nZXRQcmVmYWIocm9vdCk7XHJcbiAgICAgICAgY29uc3QgcmV0ID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIGlmIChwcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgIHByZWZhYkluZm8ubmVzdGVkUHJlZmFiSW5zdGFuY2VSb290cz8uZm9yRWFjaCgocHJlZmFiSW5zdGFuY2VOb2RlOiBOb2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXN0UHJlZmFiSW5mbyA9IHRoaXMuZ2V0UHJlZmFiKHByZWZhYkluc3RhbmNlTm9kZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0eU92ZXJyaWRlcyA9IG5lc3RQcmVmYWJJbmZvPy5pbnN0YW5jZT8ucHJvcGVydHlPdmVycmlkZXM7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydHlPdmVycmlkZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IHByb3BlcnR5T3ZlcnJpZGVzLmxlbmd0aCAtIDE7IGluZGV4ID49IDA7IGluZGV4LS0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcHMgPSBwcm9wZXJ0eU92ZXJyaWRlc1tpbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB2YWw6IGFueSA9IHByb3BzLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsIGluc3RhbmNlb2YgY2MuQ29tcG9uZW50LkV2ZW50SGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gdmFsLnRhcmdldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWwgaW5zdGFuY2VvZiBjYy5Db21wb25lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IHZhbC5ub2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWwgJiYgdmFsIGluc3RhbmNlb2YgY2MuTm9kZSAmJiAhdmFsLmlzQ2hpbGRPZihyb290KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS53YXJuKCdjbGVhbklsbGVnYWxQcm9wZXJ0eU92ZXJyaWRlUmVmZXJlbmNlJywgcHJvcHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlPdmVycmlkZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBiYWNrVXAgPSByZXQuZ2V0KHByZWZhYkluc3RhbmNlTm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWJhY2tVcCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tVcCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5zZXQocHJlZmFiSW5zdGFuY2VOb2RlLCBiYWNrVXApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja1VwLnB1c2gocHJvcHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBwcmVmYWJVdGlscyA9IG5ldyBQcmVmYWJVdGlsKCk7XHJcbiJdfQ==