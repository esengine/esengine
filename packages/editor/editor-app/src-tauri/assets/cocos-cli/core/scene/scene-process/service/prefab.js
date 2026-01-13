"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefabService = void 0;
const core_1 = require("./core");
const cc_1 = require("cc");
const component_1 = require("./prefab/component");
const node_1 = require("./prefab/node");
const utils_1 = require("./prefab/utils");
const validate_params_1 = require("./prefab/validate-params");
const utils_2 = require("./scene/utils");
const rpc_1 = require("../rpc");
let PrefabService = class PrefabService extends core_1.BaseService {
    _softReloadTimer = null;
    _utils = utils_1.prefabUtils;
    init() { }
    /**
     * 将节点转换为预制体资源
     */
    async createPrefabFromNode(params) {
        try {
            (0, validate_params_1.validateCreatePrefabParams)(params);
            const nodeUuid = EditorExtends.Node.getNodeUuidByPathOrThrow(params.nodePath);
            const assetInfo = await rpc_1.Rpc.getInstance().request('assetManager', 'queryAssetInfo', [params.dbURL]);
            if (!params.overwrite && assetInfo && assetInfo.type === 'cc.Prefab') {
                throw new Error(`已有同名 ${assetInfo.url} 预制体`);
            }
            const node = await this.createPrefabAssetFromNode(nodeUuid, params.dbURL, {
                overwrite: !!params.overwrite,
                undo: true,
            });
            if (!node) {
                throw new Error('创建预制体资源失败，返回结果为 null');
            }
            return utils_2.sceneUtils.generateNodeInfo(node, false);
        }
        catch (e) {
            console.error(`创建预制体失败: 节点路径: ${params.nodePath} 资源 URL: ${params.dbURL} 错误信息:`, e);
            throw e;
        }
    }
    /**
     * 将节点的修改应用回预制体资源
     */
    async applyPrefabChanges(params) {
        try {
            (0, validate_params_1.validateNodePathParams)(params);
            const node = EditorExtends.Node.getNodeByPathOrThrow(params.nodePath);
            const prefabInfo = utils_1.prefabUtils.getPrefab(node);
            if (!prefabInfo) {
                throw new Error(`该节点 '${params.nodePath}' 不是预制体`);
            }
            await this.applyPrefab(node.uuid);
            return true;
        }
        catch (e) {
            console.error(`应用回预制体资源失败: 节点路径: ${params.nodePath} 错误信息:`, e);
            throw e;
        }
    }
    /**
     * 重置节点到预制体原始状态
     */
    async revertToPrefab(params) {
        try {
            (0, validate_params_1.validateNodePathParams)(params);
            const node = EditorExtends.Node.getNodeByPathOrThrow(params.nodePath);
            return await this.revertPrefab(node);
        }
        catch (e) {
            console.error(`重置节点到预制体原始状态失败：节点路径 ${params.nodePath} 错误信息:`, e);
            throw e;
        }
    }
    /**
     * 解耦预制体实例，使其成为普通节点
     */
    async unpackPrefabInstance(params) {
        try {
            (0, validate_params_1.validateNodePathParams)(params);
            const node = EditorExtends.Node.getNodeByPathOrThrow(params.nodePath);
            if (!utils_1.prefabUtils.getPrefab(node)?.instance) {
                throw new Error(`${params.nodePath} 是普通节点`);
            }
            this.unWrapPrefabInstance(node.uuid, !!params.recursive);
            return utils_2.sceneUtils.generateNodeInfo(node, true);
        }
        catch (e) {
            console.error(`解耦为普通节点失败：节点路径 ${params.nodePath} 是否递归: ${params.recursive} 错误信息:`, e);
            throw e;
        }
    }
    /**
     * 检查节点是否为预制体实例
     */
    async isPrefabInstance(params) {
        try {
            const node = EditorExtends.Node.getNodeByPathOrThrow(params.nodePath);
            return !!utils_1.prefabUtils.getPrefab(node)?.instance;
        }
        catch (e) {
            console.error(`检查节点是否预制体实例失败：节点路径 ${params.nodePath} 错误信息:`, e);
            throw e;
        }
    }
    /**
     * 获取节点的预制体信息
     */
    async getPrefabInfo(params) {
        try {
            const node = EditorExtends.Node.getNodeByPathOrThrow(params.nodePath);
            const prefabInfo = utils_1.prefabUtils.getPrefab(node);
            if (!prefabInfo) {
                return null;
            }
            return utils_2.sceneUtils.generatePrefabInfo(prefabInfo);
        }
        catch (e) {
            console.error(`获取节点的预制体信息失败：节点路径 ${params.nodePath} 错误信息:`, e);
            throw e;
        }
    }
    /////////////////////////
    // node operation
    ////////////////////////
    onEditorOpened() {
        node_1.nodeOperation.onSceneOpened();
    }
    onNodeRemoved(node) {
        node_1.nodeOperation.onNodeRemoved(node);
    }
    onNodeChangedInGeneralMode(node, opts, root) {
        node_1.nodeOperation.onNodeChangedInGeneralMode(node, opts, root);
    }
    onAddNode(node) {
        node_1.nodeOperation.onAddNode(node);
    }
    onNodeAdded(node) {
        node_1.nodeOperation.onNodeAdded(node);
    }
    onNodeChanged(node, opts = {}) {
        this.onNodeChangedInGeneralMode(node, opts, core_1.Service.Editor.getRootNode());
    }
    onSetPropertyComponent(comp, opts = {}) {
        this.onNodeChangedInGeneralMode(comp.node, opts, core_1.Service.Editor.getRootNode());
    }
    removePrefabInfoFromNode(node, removeNested) {
        node_1.nodeOperation.removePrefabInfoFromNode(node, removeNested);
    }
    checkToRemoveTargetOverride(source, root) {
        utils_1.prefabUtils.checkToRemoveTargetOverride(source, root);
    }
    /**
     * 从一个节点生成一个PrefabAsset
     * @param nodeUUID
     * @param url
     * @param options
     */
    async createPrefabAssetFromNode(nodeUUID, url, options = { undo: true, overwrite: true }) {
        return await node_1.nodeOperation.createPrefabAssetFromNode(nodeUUID, url, options);
    }
    /**
     * 将一个 node 与一个 prefab 关联到一起
     * @param nodeUUID
     * @param {*} assetUuid 关联的资源
     */
    async linkNodeWithPrefabAsset(nodeUUID, assetUuid) {
        await node_1.nodeOperation.linkNodeWithPrefabAsset(nodeUUID, assetUuid);
    }
    /**
     * 从一个节点生成 prefab数据
     * 返回序列化数据
     * @param {*} nodeUUID
     */
    generatePrefabDataFromNode(nodeUUID) {
        return utils_1.prefabUtils.generatePrefabDataFromNode(nodeUUID);
    }
    /**
     * 还原一个PrefabInstance的数据为它所关联的PrefabAsset
     * @param nodeUUID node
     */
    async revertPrefab(nodeUUID) {
        return node_1.nodeOperation.revertPrefab(nodeUUID);
    }
    // 获取unlinkPrefab会影响到的uuid
    getUnlinkNodeUuids(uuid, removeNested) {
        const uuids = [];
        const node = EditorExtends.Node.getNode(uuid);
        function collectUuids(node) {
            const prefabInfo = utils_1.prefabUtils.getPrefab(node);
            if (removeNested) {
                uuids.push(node.uuid);
                node.children.forEach((child) => {
                    collectUuids(child);
                });
            }
            else if (prefabInfo) {
                if (!prefabInfo.instance) {
                    uuids.push(node.uuid);
                    node.children.forEach((child) => {
                        collectUuids(child);
                    });
                }
            }
        }
        if (node) {
            uuids.push(uuid);
            node.children.forEach((child) => {
                collectUuids(child);
            });
        }
        return uuids;
    }
    /**
     * 解除PrefabInstance对PrefabAsset的关联
     * @param nodeUUID 节点或节点的UUID
     * @param removeNested 是否递归的解除子节点PrefabInstance
     */
    unWrapPrefabInstance(nodeUUID, removeNested) {
        return node_1.nodeOperation.unWrapPrefabInstance(nodeUUID, removeNested);
    }
    // 在Prefab编辑模式下不能移除prefabInfo，只需要移除instance
    unWrapPrefabInstanceInPrefabMode(nodeUUID, removeNested) {
        return node_1.nodeOperation.unWrapPrefabInstanceInPrefabMode(nodeUUID, removeNested);
    }
    /**
     * 将一个PrefabInstance的数据应用到对应的Asset资源上
     * @param nodeUUID uuid
     */
    async applyPrefab(nodeUUID) {
        return await node_1.nodeOperation.applyPrefab(nodeUUID);
    }
    /// /////////////////////
    // components operation
    ////////////////////////
    onAddComponent(comp) {
        component_1.componentOperation.onAddComponent(comp);
    }
    onComponentAdded(comp) {
        component_1.componentOperation.onComponentAdded(comp);
    }
    // 编辑器主动删除Component时调用
    onRemoveComponentInGeneralMode(comp, rootNode) {
        component_1.componentOperation.onRemoveComponentInGeneralMode(comp, rootNode);
    }
    // Component被删除时调用，当根节点删除时，所有子节点的Component删除事件也会触发到这里
    onComponentRemovedInGeneralMode(comp, rootNode) {
        component_1.componentOperation.onComponentRemovedInGeneralMode(comp, rootNode);
    }
    async revertRemovedComponent(nodeUUID, fileID) {
        await component_1.componentOperation.revertRemovedComponent(nodeUUID, fileID);
    }
    async applyRemovedComponent(nodeUUID, fileID) {
        await component_1.componentOperation.applyRemovedComponent(nodeUUID, fileID);
    }
    async onAssetChanged(uuid) {
        // prefab 资源的变动，softReload场景
        if (node_1.nodeOperation.assetToNodesMap.has(uuid) && await core_1.Service.Editor.hasOpen()) {
            clearTimeout(this._softReloadTimer);
            this._softReloadTimer = setTimeout(async () => {
                await core_1.Service.Editor.reload({});
            }, 500);
        }
    }
    async onAssetDeleted(uuid) {
        if (node_1.nodeOperation.assetToNodesMap.has(uuid) && await core_1.Service.Editor.hasOpen()) {
            clearTimeout(this._softReloadTimer);
            this._softReloadTimer = setTimeout(async () => {
                await core_1.Service.Editor.reload({});
            }, 500);
        }
    }
    /**
     * 将一个节点恢复到关联的 prefab 的状态
     * @param {*} nodeUuid
     */
    revert(nodeUuid) { }
    /**
     * 将一个节点的修改，应用到关联的 prefab 上
     * @param {*} nodeUuid
     */
    sync(nodeUuid) { }
    createNodeFromPrefabAsset(asset) {
        const node = (0, cc_1.instantiate)(asset);
        // @ts-ignore
        const prefabInfo = node['_prefab'];
        if (!prefabInfo) {
            console.error('Not a Prefab Asset:', asset.uuid);
            return null;
        }
        if (!prefabInfo.instance) {
            prefabInfo.instance = utils_1.prefabUtils.createPrefabInstance();
        }
        return node;
    }
    // TODO: apply单个属性的override到prefabAsset
    filterChildOfAssetOfPrefabInstance(uuids, operationTips) {
        if (!Array.isArray(uuids)) {
            uuids = [uuids];
        }
        const filterUUIDs = [];
        for (const uuid of uuids) {
            const node = EditorExtends.Node.getNode(uuid);
            // 增加容错
            if (!node) {
                continue;
            }
            // 是当前环境下的mountedChildren，就不算是资源里的
            if (utils_1.prefabUtils.isOutmostPrefabInstanceMountedChildren(node)) {
                filterUUIDs.push(uuid);
                continue;
            }
            if (!utils_1.prefabUtils.isPrefabInstanceRoot(node) && utils_1.prefabUtils.isPartOfAssetInPrefabInstance(node)) {
                console.warn(`Node [${node.name}] is a prefab child of prefabInstance [${node['_prefab']?.root?.name}], ${operationTips}`);
                // 消除其它面板的等待操作，例如hierarchy操作节点时会先进入等待状态，如果没有node的change消息，就会一直处于等待状态。
                core_1.ServiceEvents.broadcast('scene:change-node', node.uuid);
                continue;
            }
            filterUUIDs.push(uuid);
        }
        return filterUUIDs;
    }
    filterPartOfPrefabAsset(uuids, operationTips) {
        if (!Array.isArray(uuids)) {
            uuids = [uuids];
        }
        const filterUUIDs = [];
        for (const uuid of uuids) {
            const node = EditorExtends.Node.getNode(uuid);
            // 增加容错
            if (!node) {
                continue;
            }
            if (utils_1.prefabUtils.isPartOfAssetInPrefabInstance(node)) {
                console.warn(`Node [${node.name}] is part of prefabInstance [${node['_prefab']?.root?.name}], ${operationTips}`);
                // 消除其它面板的等待操作，例如hierarchy操作节点时会先进入等待状态，如果没有node的change消息，就会一直处于等待状态。
                core_1.ServiceEvents.broadcast('scene:change-node', node.uuid);
                continue;
            }
            filterUUIDs.push(uuid);
        }
        return filterUUIDs;
    }
    // PrefabInstance的Prefab子节点不能删除
    filterChildOfPrefabAssetWhenRemoveNode(uuids) {
        return this.filterChildOfAssetOfPrefabInstance(uuids, 'it\'s not allowed to delete in current context, you can delete it in it\'s prefabAsset or \
        do it after unlink prefab from root node');
    }
    filterChildOfPrefabAssetWhenSetParent(uuids) {
        return this.filterChildOfAssetOfPrefabInstance(uuids, 'it\'s not allowed to change parent in current context, you can modify it in it\'s prefabAsset or \
        do it after unlink prefab from root node');
    }
    canModifySibling(uuid, target, offset) {
        // 不需要移动
        if (offset === 0) {
            return false;
        }
        // 传入的是一个父节点ID
        const node = EditorExtends.Node.getNode(uuid);
        // 增加容错
        if (!node) {
            return false;
        }
        // 保处理在PrefabInstance下的属于PrefabAsset中的节点
        if (node['_prefab'] && utils_1.prefabUtils.isPartOfPrefabAsset(node) && node['_prefab']?.root?.['_prefab']?.instance && node.children) {
            // 过滤在hierarchy隐藏的节点
            const filterHiddenChildren = node.children.filter((child) => !(child.objFlags & cc.Object.Flags.HideInHierarchy));
            const child = node.children[target];
            if (!child) {
                return false;
            }
            let isAddedChild = true;
            if (child['_prefab']) {
                const prefabState = utils_1.prefabUtils.getPrefabStateInfo(child);
                isAddedChild = prefabState.isAddedChild;
                // 如果要移动的节点是一个Prefab的子节点
                if (!isAddedChild) {
                    console.warn(`Node [${child.name}] is a prefab child of prefabInstance [${child['_prefab'].root?.name}], \
                    it's not allowed to modify hierarchy in current context, you can modify it in it's prefabAsset or do it after unlink prefab from root node`);
                    // 消除其它面板的等待操作，例如hierarchy操作节点时会先进入等待状态，如果没有node的change消息，就会一直处于等待状态。
                    core_1.ServiceEvents.broadcast('scene:change-node', child.uuid);
                    return false;
                }
            }
            // 找出要移动的节点在没有过滤掉隐藏节点的场景中的位置
            const targetChild = filterHiddenChildren[target + offset];
            if (isAddedChild && targetChild['_prefab']) {
                console.warn(`Node [${targetChild.name}] is a prefab child of prefabInstance [${targetChild['_prefab'].root?.name}], \
                it's not allowed to modify hierarchy in current context, you can modify it in it's prefabAsset or do it after unlink prefab from root node`);
                // 消除其它面板的等待操作，例如hierarchy操作节点时会先进入等待状态，如果没有node的change消息，就会一直处于等待状态。
                core_1.ServiceEvents.broadcast('scene:change-node', child.uuid);
                return false;
            }
        }
        return true;
    }
    filterPartOfPrefabAssetWhenCreateComponent(uuids) {
        return this.filterPartOfPrefabAsset(uuids, 'it\'s not allow to add component in current context currently, you can add component in it\'s prefabAsset or \
        do it after unlink prefab from root node');
    }
    filterPartOfPrefabAssetWhenRemoveComponent(uuids) {
        return this.filterPartOfPrefabAsset(uuids, 'it\'s not allow to remove component in current context currently, you can remove component in it\'s prefabAsset or \
        do it after unlink prefab from root node');
    }
    /**
     * 暴力遍历root所有属性，找到rule返回true的路径
     * 比如找Scene节点的路径，rule = (obj)=> return obj.globals
     * @param root 根节点
     * @param rule 判断函数
     * @returns
     */
    findPathWithRule(root, rule) {
        const path = [];
        const cache = new Map();
        const walk = function (obj, prekey) {
            const keys = Object.keys(obj);
            keys.forEach(key => {
                if (typeof (obj[key]) === 'object' && obj[key]) {
                    // @ts-ignore
                    if (!cache.get(obj[key])) {
                        cache.set(obj[key], true);
                        if (rule(obj[key])) {
                            console.log('找到了', prekey + '|' + key);
                            path.push(prekey + '|' + key);
                        }
                        else {
                            walk(obj[key], prekey + '|' + key);
                        }
                    }
                }
            });
        };
        walk(root, '');
        return path;
    }
};
exports.PrefabService = PrefabService;
exports.PrefabService = PrefabService = __decorate([
    (0, core_1.register)('Prefab')
], PrefabService);
exports.default = new PrefabService();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmFiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvc2NlbmUvc2NlbmUtcHJvY2Vzcy9zZXJ2aWNlL3ByZWZhYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxpQ0FBdUU7QUFDdkUsMkJBQXlEO0FBQ3pELGtEQUF3RDtBQUN4RCx3Q0FBOEM7QUFDOUMsMENBQTZDO0FBYzdDLDhEQUE4RjtBQUM5Rix5Q0FBMkM7QUFDM0MsZ0NBQTZCO0FBR3RCLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxrQkFBMEI7SUFFakQsZ0JBQWdCLEdBQVEsSUFBSSxDQUFDO0lBQzdCLE1BQU0sR0FBRyxtQkFBVyxDQUFDO0lBRXRCLElBQUksS0FBSyxDQUFDO0lBRWpCOztPQUVHO0lBQ0gsS0FBSyxDQUFDLG9CQUFvQixDQUFDLE1BQW1DO1FBQzFELElBQUksQ0FBQztZQUVELElBQUEsNENBQTBCLEVBQUMsTUFBTSxDQUFDLENBQUM7WUFFbkMsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFOUUsTUFBTSxTQUFTLEdBQUcsTUFBTSxTQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3BHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO2dCQUNuRSxNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsU0FBUyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDakQsQ0FBQztZQUVELE1BQU0sSUFBSSxHQUFnQixNQUFNLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEtBQUss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ZVksc0NBQWE7d0JBQWIsYUFBYTtJQUR6QixJQUFBLGVBQVEsRUFBQyxRQUFRLENBQUM7R0FDTixhQUFhLENBMGV6QjtBQUVELGtCQUFlLElBQUksYUFBYSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCYXNlU2VydmljZSwgcmVnaXN0ZXIsIFNlcnZpY2UsIFNlcnZpY2VFdmVudHMgfSBmcm9tICcuL2NvcmUnO1xyXG5pbXBvcnQgeyBDb21wb25lbnQsIGluc3RhbnRpYXRlLCBOb2RlLCBTY2VuZSB9IGZyb20gJ2NjJztcclxuaW1wb3J0IHsgY29tcG9uZW50T3BlcmF0aW9uIH0gZnJvbSAnLi9wcmVmYWIvY29tcG9uZW50JztcclxuaW1wb3J0IHsgbm9kZU9wZXJhdGlvbiB9IGZyb20gJy4vcHJlZmFiL25vZGUnO1xyXG5pbXBvcnQgeyBwcmVmYWJVdGlscyB9IGZyb20gJy4vcHJlZmFiL3V0aWxzJztcclxuaW1wb3J0IHR5cGUge1xyXG4gICAgSUFwcGx5UHJlZmFiQ2hhbmdlc1BhcmFtcyxcclxuICAgIElDaGFuZ2VOb2RlT3B0aW9ucyxcclxuICAgIElDcmVhdGVQcmVmYWJGcm9tTm9kZVBhcmFtcyxcclxuICAgIElHZXRQcmVmYWJJbmZvUGFyYW1zLFxyXG4gICAgSUlzUHJlZmFiSW5zdGFuY2VQYXJhbXMsXHJcbiAgICBJTm9kZSxcclxuICAgIElQcmVmYWJFdmVudHMsXHJcbiAgICBJUHJlZmFiSW5mbyxcclxuICAgIElQcmVmYWJTZXJ2aWNlLFxyXG4gICAgSVJldmVydFRvUHJlZmFiUGFyYW1zLFxyXG4gICAgSVVucGFja1ByZWZhYkluc3RhbmNlUGFyYW1zLFxyXG59IGZyb20gJy4uLy4uL2NvbW1vbic7XHJcbmltcG9ydCB7IHZhbGlkYXRlQ3JlYXRlUHJlZmFiUGFyYW1zLCB2YWxpZGF0ZU5vZGVQYXRoUGFyYW1zIH0gZnJvbSAnLi9wcmVmYWIvdmFsaWRhdGUtcGFyYW1zJztcclxuaW1wb3J0IHsgc2NlbmVVdGlscyB9IGZyb20gJy4vc2NlbmUvdXRpbHMnO1xyXG5pbXBvcnQgeyBScGMgfSBmcm9tICcuLi9ycGMnO1xyXG5cclxuQHJlZ2lzdGVyKCdQcmVmYWInKVxyXG5leHBvcnQgY2xhc3MgUHJlZmFiU2VydmljZSBleHRlbmRzIEJhc2VTZXJ2aWNlPElQcmVmYWJFdmVudHM+IGltcGxlbWVudHMgSVByZWZhYlNlcnZpY2Uge1xyXG5cclxuICAgIHByaXZhdGUgX3NvZnRSZWxvYWRUaW1lcjogYW55ID0gbnVsbDtcclxuICAgIHByaXZhdGUgX3V0aWxzID0gcHJlZmFiVXRpbHM7XHJcblxyXG4gICAgcHVibGljIGluaXQoKSB7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWwhuiKgueCuei9rOaNouS4uumihOWItuS9k+i1hOa6kFxyXG4gICAgICovXHJcbiAgICBhc3luYyBjcmVhdGVQcmVmYWJGcm9tTm9kZShwYXJhbXM6IElDcmVhdGVQcmVmYWJGcm9tTm9kZVBhcmFtcyk6IFByb21pc2U8SU5vZGU+IHtcclxuICAgICAgICB0cnkge1xyXG5cclxuICAgICAgICAgICAgdmFsaWRhdGVDcmVhdGVQcmVmYWJQYXJhbXMocGFyYW1zKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGVVdWlkID0gRWRpdG9yRXh0ZW5kcy5Ob2RlLmdldE5vZGVVdWlkQnlQYXRoT3JUaHJvdyhwYXJhbXMubm9kZVBhdGgpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgYXNzZXRJbmZvID0gYXdhaXQgUnBjLmdldEluc3RhbmNlKCkucmVxdWVzdCgnYXNzZXRNYW5hZ2VyJywgJ3F1ZXJ5QXNzZXRJbmZvJywgW3BhcmFtcy5kYlVSTF0pO1xyXG4gICAgICAgICAgICBpZiAoIXBhcmFtcy5vdmVyd3JpdGUgJiYgYXNzZXRJbmZvICYmIGFzc2V0SW5mby50eXBlID09PSAnY2MuUHJlZmFiJykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGDlt7LmnInlkIzlkI0gJHthc3NldEluZm8udXJsfSDpooTliLbkvZNgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3Qgbm9kZTogTm9kZSB8IG51bGwgPSBhd2FpdCB0aGlzLmNyZWF0ZVByZWZhYkFzc2V0RnJvbU5vZGUobm9kZVV1aWQsIHBhcmFtcy5kYlVSTCwge1xyXG4gICAgICAgICAgICAgICAgb3ZlcndyaXRlOiAhIXBhcmFtcy5vdmVyd3JpdGUsXHJcbiAgICAgICAgICAgICAgICB1bmRvOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfliJvlu7rpooTliLbkvZPotYTmupDlpLHotKXvvIzov5Tlm57nu5PmnpzkuLogbnVsbCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzY2VuZVV0aWxzLmdlbmVyYXRlTm9kZUluZm8obm9kZSwgZmFsc2UpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihg5Yib5bu66aKE5Yi25L2T5aSx6LSlOiDoioLngrnot6/lvoQ6ICR7cGFyYW1zLm5vZGVQYXRofSDotYTmupAgVVJMOiAke3BhcmFtcy5kYlVSTH0g6ZSZ6K+v5L+h5oGvOmAsIGUpO1xyXG4gICAgICAgICAgICB0aHJvdyBlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWwhuiKgueCueeahOS/ruaUueW6lOeUqOWbnumihOWItuS9k+i1hOa6kFxyXG4gICAgICovXHJcbiAgICBhc3luYyBhcHBseVByZWZhYkNoYW5nZXMocGFyYW1zOiBJQXBwbHlQcmVmYWJDaGFuZ2VzUGFyYW1zKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFsaWRhdGVOb2RlUGF0aFBhcmFtcyhwYXJhbXMpO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IEVkaXRvckV4dGVuZHMuTm9kZS5nZXROb2RlQnlQYXRoT3JUaHJvdyhwYXJhbXMubm9kZVBhdGgpO1xyXG4gICAgICAgICAgICBjb25zdCBwcmVmYWJJbmZvID0gcHJlZmFiVXRpbHMuZ2V0UHJlZmFiKG5vZGUpO1xyXG4gICAgICAgICAgICBpZiAoIXByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihg6K+l6IqC54K5ICcke3BhcmFtcy5ub2RlUGF0aH0nIOS4jeaYr+mihOWItuS9k2ApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmFwcGx5UHJlZmFiKG5vZGUudXVpZCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihg5bqU55So5Zue6aKE5Yi25L2T6LWE5rqQ5aSx6LSlOiDoioLngrnot6/lvoQ6ICR7cGFyYW1zLm5vZGVQYXRofSDplJnor6/kv6Hmga86YCwgZSk7XHJcbiAgICAgICAgICAgIHRocm93IGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN572u6IqC54K55Yiw6aKE5Yi25L2T5Y6f5aeL54q25oCBXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHJldmVydFRvUHJlZmFiKHBhcmFtczogSVJldmVydFRvUHJlZmFiUGFyYW1zKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFsaWRhdGVOb2RlUGF0aFBhcmFtcyhwYXJhbXMpO1xyXG4gICAgICAgICAgICBjb25zdCBub2RlID0gRWRpdG9yRXh0ZW5kcy5Ob2RlLmdldE5vZGVCeVBhdGhPclRocm93KHBhcmFtcy5ub2RlUGF0aCk7XHJcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJldmVydFByZWZhYihub2RlKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOmHjee9ruiKgueCueWIsOmihOWItuS9k+WOn+Wni+eKtuaAgeWksei0pe+8muiKgueCuei3r+W+hCAke3BhcmFtcy5ub2RlUGF0aH0g6ZSZ6K+v5L+h5oGvOmAsIGUpO1xyXG4gICAgICAgICAgICB0aHJvdyBlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOino+iApumihOWItuS9k+WunuS+i++8jOS9v+WFtuaIkOS4uuaZrumAmuiKgueCuVxyXG4gICAgICovXHJcbiAgICBhc3luYyB1bnBhY2tQcmVmYWJJbnN0YW5jZShwYXJhbXM6IElVbnBhY2tQcmVmYWJJbnN0YW5jZVBhcmFtcyk6IFByb21pc2U8SU5vZGU+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB2YWxpZGF0ZU5vZGVQYXRoUGFyYW1zKHBhcmFtcyk7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBFZGl0b3JFeHRlbmRzLk5vZGUuZ2V0Tm9kZUJ5UGF0aE9yVGhyb3cocGFyYW1zLm5vZGVQYXRoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghcHJlZmFiVXRpbHMuZ2V0UHJlZmFiKG5vZGUpPy5pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3BhcmFtcy5ub2RlUGF0aH0g5piv5pmu6YCa6IqC54K5YCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMudW5XcmFwUHJlZmFiSW5zdGFuY2Uobm9kZS51dWlkLCAhIXBhcmFtcy5yZWN1cnNpdmUpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2NlbmVVdGlscy5nZW5lcmF0ZU5vZGVJbmZvKG5vZGUsIHRydWUpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihg6Kej6ICm5Li65pmu6YCa6IqC54K55aSx6LSl77ya6IqC54K56Lev5b6EICR7cGFyYW1zLm5vZGVQYXRofSDmmK/lkKbpgJLlvZI6ICR7cGFyYW1zLnJlY3Vyc2l2ZX0g6ZSZ6K+v5L+h5oGvOmAsIGUpO1xyXG4gICAgICAgICAgICB0aHJvdyBlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOajgOafpeiKgueCueaYr+WQpuS4uumihOWItuS9k+WunuS+i1xyXG4gICAgICovXHJcbiAgICBhc3luYyBpc1ByZWZhYkluc3RhbmNlKHBhcmFtczogSUlzUHJlZmFiSW5zdGFuY2VQYXJhbXMpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlID0gRWRpdG9yRXh0ZW5kcy5Ob2RlLmdldE5vZGVCeVBhdGhPclRocm93KHBhcmFtcy5ub2RlUGF0aCk7XHJcbiAgICAgICAgICAgIHJldHVybiAhIXByZWZhYlV0aWxzLmdldFByZWZhYihub2RlKT8uaW5zdGFuY2U7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGDmo4Dmn6XoioLngrnmmK/lkKbpooTliLbkvZPlrp7kvovlpLHotKXvvJroioLngrnot6/lvoQgJHtwYXJhbXMubm9kZVBhdGh9IOmUmeivr+S/oeaBrzpgLCBlKTtcclxuICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5boioLngrnnmoTpooTliLbkvZPkv6Hmga9cclxuICAgICAqL1xyXG4gICAgYXN5bmMgZ2V0UHJlZmFiSW5mbyhwYXJhbXM6IElHZXRQcmVmYWJJbmZvUGFyYW1zKTogUHJvbWlzZTxJUHJlZmFiSW5mbyB8IG51bGw+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlID0gRWRpdG9yRXh0ZW5kcy5Ob2RlLmdldE5vZGVCeVBhdGhPclRocm93KHBhcmFtcy5ub2RlUGF0aCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSBwcmVmYWJVdGlscy5nZXRQcmVmYWIobm9kZSk7XHJcbiAgICAgICAgICAgIGlmICghcHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNjZW5lVXRpbHMuZ2VuZXJhdGVQcmVmYWJJbmZvKHByZWZhYkluZm8pIGFzIElQcmVmYWJJbmZvO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihg6I635Y+W6IqC54K555qE6aKE5Yi25L2T5L+h5oGv5aSx6LSl77ya6IqC54K56Lev5b6EICR7cGFyYW1zLm5vZGVQYXRofSDplJnor6/kv6Hmga86YCwgZSk7XHJcbiAgICAgICAgICAgIHRocm93IGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIC8vIG5vZGUgb3BlcmF0aW9uXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIHB1YmxpYyBvbkVkaXRvck9wZW5lZCgpIHtcclxuICAgICAgICBub2RlT3BlcmF0aW9uLm9uU2NlbmVPcGVuZWQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25Ob2RlUmVtb3ZlZChub2RlOiBOb2RlKSB7XHJcbiAgICAgICAgbm9kZU9wZXJhdGlvbi5vbk5vZGVSZW1vdmVkKG5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbk5vZGVDaGFuZ2VkSW5HZW5lcmFsTW9kZShub2RlOiBOb2RlLCBvcHRzOiBJQ2hhbmdlTm9kZU9wdGlvbnMsIHJvb3Q6IE5vZGUgfCBTY2VuZSB8IG51bGwpIHtcclxuICAgICAgICBub2RlT3BlcmF0aW9uLm9uTm9kZUNoYW5nZWRJbkdlbmVyYWxNb2RlKG5vZGUsIG9wdHMsIHJvb3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkFkZE5vZGUobm9kZTogTm9kZSkge1xyXG4gICAgICAgIG5vZGVPcGVyYXRpb24ub25BZGROb2RlKG5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbk5vZGVBZGRlZChub2RlOiBOb2RlKSB7XHJcbiAgICAgICAgbm9kZU9wZXJhdGlvbi5vbk5vZGVBZGRlZChub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25Ob2RlQ2hhbmdlZChub2RlOiBOb2RlLCBvcHRzOiBJQ2hhbmdlTm9kZU9wdGlvbnMgPSB7fSkge1xyXG4gICAgICAgIHRoaXMub25Ob2RlQ2hhbmdlZEluR2VuZXJhbE1vZGUobm9kZSwgb3B0cywgU2VydmljZS5FZGl0b3IuZ2V0Um9vdE5vZGUoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uU2V0UHJvcGVydHlDb21wb25lbnQoY29tcDogQ29tcG9uZW50LCBvcHRzOiBJQ2hhbmdlTm9kZU9wdGlvbnMgPSB7fSkge1xyXG4gICAgICAgIHRoaXMub25Ob2RlQ2hhbmdlZEluR2VuZXJhbE1vZGUoY29tcC5ub2RlLCBvcHRzLCBTZXJ2aWNlLkVkaXRvci5nZXRSb290Tm9kZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVtb3ZlUHJlZmFiSW5mb0Zyb21Ob2RlKG5vZGU6IE5vZGUsIHJlbW92ZU5lc3RlZD86IGJvb2xlYW4pIHtcclxuICAgICAgICBub2RlT3BlcmF0aW9uLnJlbW92ZVByZWZhYkluZm9Gcm9tTm9kZShub2RlLCByZW1vdmVOZXN0ZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjaGVja1RvUmVtb3ZlVGFyZ2V0T3ZlcnJpZGUoc291cmNlOiBOb2RlIHwgQ29tcG9uZW50LCByb290OiBOb2RlIHwgU2NlbmUgfCBudWxsKSB7XHJcbiAgICAgICAgcHJlZmFiVXRpbHMuY2hlY2tUb1JlbW92ZVRhcmdldE92ZXJyaWRlKHNvdXJjZSwgcm9vdCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDku47kuIDkuKroioLngrnnlJ/miJDkuIDkuKpQcmVmYWJBc3NldFxyXG4gICAgICogQHBhcmFtIG5vZGVVVUlEXHJcbiAgICAgKiBAcGFyYW0gdXJsXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgY3JlYXRlUHJlZmFiQXNzZXRGcm9tTm9kZShub2RlVVVJRDogc3RyaW5nLCB1cmw6IHN0cmluZywgb3B0aW9ucyA9IHsgdW5kbzogdHJ1ZSwgb3ZlcndyaXRlOiB0cnVlIH0pOiBQcm9taXNlPE5vZGUgfCBudWxsPiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IG5vZGVPcGVyYXRpb24uY3JlYXRlUHJlZmFiQXNzZXRGcm9tTm9kZShub2RlVVVJRCwgdXJsLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWwhuS4gOS4qiBub2RlIOS4juS4gOS4qiBwcmVmYWIg5YWz6IGU5Yiw5LiA6LW3XHJcbiAgICAgKiBAcGFyYW0gbm9kZVVVSURcclxuICAgICAqIEBwYXJhbSB7Kn0gYXNzZXRVdWlkIOWFs+iBlOeahOi1hOa6kFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgbGlua05vZGVXaXRoUHJlZmFiQXNzZXQobm9kZVVVSUQ6IHN0cmluZyB8IE5vZGUsIGFzc2V0VXVpZDogc3RyaW5nIHwgYW55KSB7XHJcbiAgICAgICAgYXdhaXQgbm9kZU9wZXJhdGlvbi5saW5rTm9kZVdpdGhQcmVmYWJBc3NldChub2RlVVVJRCwgYXNzZXRVdWlkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS7juS4gOS4quiKgueCueeUn+aIkCBwcmVmYWLmlbDmja5cclxuICAgICAqIOi/lOWbnuW6j+WIl+WMluaVsOaNrlxyXG4gICAgICogQHBhcmFtIHsqfSBub2RlVVVJRFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2VuZXJhdGVQcmVmYWJEYXRhRnJvbU5vZGUobm9kZVVVSUQ6IHN0cmluZyB8IE5vZGUpIHtcclxuICAgICAgICByZXR1cm4gcHJlZmFiVXRpbHMuZ2VuZXJhdGVQcmVmYWJEYXRhRnJvbU5vZGUobm9kZVVVSUQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6L+Y5Y6f5LiA5LiqUHJlZmFiSW5zdGFuY2XnmoTmlbDmja7kuLrlroPmiYDlhbPogZTnmoRQcmVmYWJBc3NldFxyXG4gICAgICogQHBhcmFtIG5vZGVVVUlEIG5vZGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIHJldmVydFByZWZhYihub2RlVVVJRDogTm9kZSB8IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBub2RlT3BlcmF0aW9uLnJldmVydFByZWZhYihub2RlVVVJRCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g6I635Y+WdW5saW5rUHJlZmFi5Lya5b2x5ZON5Yiw55qEdXVpZFxyXG4gICAgcHVibGljIGdldFVubGlua05vZGVVdWlkcyh1dWlkOiBzdHJpbmcsIHJlbW92ZU5lc3RlZD86IGJvb2xlYW4pOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgY29uc3QgdXVpZHM6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IEVkaXRvckV4dGVuZHMuTm9kZS5nZXROb2RlKHV1aWQpO1xyXG4gICAgICAgIGZ1bmN0aW9uIGNvbGxlY3RVdWlkcyhub2RlOiBOb2RlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSBwcmVmYWJVdGlscy5nZXRQcmVmYWIobm9kZSk7XHJcbiAgICAgICAgICAgIGlmIChyZW1vdmVOZXN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHV1aWRzLnB1c2gobm9kZS51dWlkKTtcclxuICAgICAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0VXVpZHMoY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwcmVmYWJJbmZvLmluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXVpZHMucHVzaChub2RlLnV1aWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdFV1aWRzKGNoaWxkKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobm9kZSkge1xyXG4gICAgICAgICAgICB1dWlkcy5wdXNoKHV1aWQpO1xyXG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb2xsZWN0VXVpZHMoY2hpbGQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHV1aWRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6Kej6ZmkUHJlZmFiSW5zdGFuY2Xlr7lQcmVmYWJBc3NldOeahOWFs+iBlFxyXG4gICAgICogQHBhcmFtIG5vZGVVVUlEIOiKgueCueaIluiKgueCueeahFVVSURcclxuICAgICAqIEBwYXJhbSByZW1vdmVOZXN0ZWQg5piv5ZCm6YCS5b2S55qE6Kej6Zmk5a2Q6IqC54K5UHJlZmFiSW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIHVuV3JhcFByZWZhYkluc3RhbmNlKG5vZGVVVUlEOiBzdHJpbmcsIHJlbW92ZU5lc3RlZD86IGJvb2xlYW4pIHtcclxuICAgICAgICByZXR1cm4gbm9kZU9wZXJhdGlvbi51bldyYXBQcmVmYWJJbnN0YW5jZShub2RlVVVJRCwgcmVtb3ZlTmVzdGVkKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDlnKhQcmVmYWLnvJbovpHmqKHlvI/kuIvkuI3og73np7vpmaRwcmVmYWJJbmZv77yM5Y+q6ZyA6KaB56e76ZmkaW5zdGFuY2VcclxuICAgIHB1YmxpYyB1bldyYXBQcmVmYWJJbnN0YW5jZUluUHJlZmFiTW9kZShub2RlVVVJRDogc3RyaW5nIHwgTm9kZSwgcmVtb3ZlTmVzdGVkPzogYm9vbGVhbikge1xyXG4gICAgICAgIHJldHVybiBub2RlT3BlcmF0aW9uLnVuV3JhcFByZWZhYkluc3RhbmNlSW5QcmVmYWJNb2RlKG5vZGVVVUlELCByZW1vdmVOZXN0ZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5bCG5LiA5LiqUHJlZmFiSW5zdGFuY2XnmoTmlbDmja7lupTnlKjliLDlr7nlupTnmoRBc3NldOi1hOa6kOS4ilxyXG4gICAgICogQHBhcmFtIG5vZGVVVUlEIHV1aWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIGFwcGx5UHJlZmFiKG5vZGVVVUlEOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgbm9kZU9wZXJhdGlvbi5hcHBseVByZWZhYihub2RlVVVJRCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgLy8gY29tcG9uZW50cyBvcGVyYXRpb25cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgcHVibGljIG9uQWRkQ29tcG9uZW50KGNvbXA6IENvbXBvbmVudCkge1xyXG4gICAgICAgIGNvbXBvbmVudE9wZXJhdGlvbi5vbkFkZENvbXBvbmVudChjb21wKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25Db21wb25lbnRBZGRlZChjb21wOiBDb21wb25lbnQpIHtcclxuICAgICAgICBjb21wb25lbnRPcGVyYXRpb24ub25Db21wb25lbnRBZGRlZChjb21wKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDnvJbovpHlmajkuLvliqjliKDpmaRDb21wb25lbnTml7bosIPnlKhcclxuICAgIHB1YmxpYyBvblJlbW92ZUNvbXBvbmVudEluR2VuZXJhbE1vZGUoY29tcDogQ29tcG9uZW50LCByb290Tm9kZTogTm9kZSB8IFNjZW5lIHwgbnVsbCkge1xyXG4gICAgICAgIGNvbXBvbmVudE9wZXJhdGlvbi5vblJlbW92ZUNvbXBvbmVudEluR2VuZXJhbE1vZGUoY29tcCwgcm9vdE5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENvbXBvbmVudOiiq+WIoOmZpOaXtuiwg+eUqO+8jOW9k+agueiKgueCueWIoOmZpOaXtu+8jOaJgOacieWtkOiKgueCueeahENvbXBvbmVudOWIoOmZpOS6i+S7tuS5n+S8muinpuWPkeWIsOi/memHjFxyXG4gICAgcHVibGljIG9uQ29tcG9uZW50UmVtb3ZlZEluR2VuZXJhbE1vZGUoY29tcDogQ29tcG9uZW50LCByb290Tm9kZTogTm9kZSB8IFNjZW5lIHwgbnVsbCkge1xyXG4gICAgICAgIGNvbXBvbmVudE9wZXJhdGlvbi5vbkNvbXBvbmVudFJlbW92ZWRJbkdlbmVyYWxNb2RlKGNvbXAsIHJvb3ROb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgcmV2ZXJ0UmVtb3ZlZENvbXBvbmVudChub2RlVVVJRDogc3RyaW5nLCBmaWxlSUQ6IHN0cmluZykge1xyXG4gICAgICAgIGF3YWl0IGNvbXBvbmVudE9wZXJhdGlvbi5yZXZlcnRSZW1vdmVkQ29tcG9uZW50KG5vZGVVVUlELCBmaWxlSUQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyBhcHBseVJlbW92ZWRDb21wb25lbnQobm9kZVVVSUQ6IHN0cmluZywgZmlsZUlEOiBzdHJpbmcpIHtcclxuICAgICAgICBhd2FpdCBjb21wb25lbnRPcGVyYXRpb24uYXBwbHlSZW1vdmVkQ29tcG9uZW50KG5vZGVVVUlELCBmaWxlSUQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyBvbkFzc2V0Q2hhbmdlZCh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICAvLyBwcmVmYWIg6LWE5rqQ55qE5Y+Y5Yqo77yMc29mdFJlbG9hZOWcuuaZr1xyXG4gICAgICAgIGlmIChub2RlT3BlcmF0aW9uLmFzc2V0VG9Ob2Rlc01hcC5oYXModXVpZCkgJiYgYXdhaXQgU2VydmljZS5FZGl0b3IuaGFzT3BlbigpKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9zb2Z0UmVsb2FkVGltZXIpO1xyXG4gICAgICAgICAgICB0aGlzLl9zb2Z0UmVsb2FkVGltZXIgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IFNlcnZpY2UuRWRpdG9yLnJlbG9hZCh7fSk7XHJcbiAgICAgICAgICAgIH0sIDUwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyBvbkFzc2V0RGVsZXRlZCh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAobm9kZU9wZXJhdGlvbi5hc3NldFRvTm9kZXNNYXAuaGFzKHV1aWQpICYmIGF3YWl0IFNlcnZpY2UuRWRpdG9yLmhhc09wZW4oKSkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fc29mdFJlbG9hZFRpbWVyKTtcclxuICAgICAgICAgICAgdGhpcy5fc29mdFJlbG9hZFRpbWVyID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBTZXJ2aWNlLkVkaXRvci5yZWxvYWQoe30pO1xyXG4gICAgICAgICAgICB9LCA1MDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWwhuS4gOS4quiKgueCueaBouWkjeWIsOWFs+iBlOeahCBwcmVmYWIg55qE54q25oCBXHJcbiAgICAgKiBAcGFyYW0geyp9IG5vZGVVdWlkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZXZlcnQobm9kZVV1aWQ6IHN0cmluZykgeyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlsIbkuIDkuKroioLngrnnmoTkv67mlLnvvIzlupTnlKjliLDlhbPogZTnmoQgcHJlZmFiIOS4ilxyXG4gICAgICogQHBhcmFtIHsqfSBub2RlVXVpZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3luYyhub2RlVXVpZDogc3RyaW5nKSB7IH1cclxuXHJcbiAgICBwdWJsaWMgY3JlYXRlTm9kZUZyb21QcmVmYWJBc3NldChhc3NldDogYW55KSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZTogTm9kZSA9IGluc3RhbnRpYXRlKGFzc2V0KTtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IG5vZGVbJ19wcmVmYWInXTtcclxuXHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ05vdCBhIFByZWZhYiBBc3NldDonLCBhc3NldC51dWlkKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXByZWZhYkluZm8uaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgcHJlZmFiSW5mby5pbnN0YW5jZSA9IHByZWZhYlV0aWxzLmNyZWF0ZVByZWZhYkluc3RhbmNlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPOiBhcHBseeWNleS4quWxnuaAp+eahG92ZXJyaWRl5YiwcHJlZmFiQXNzZXRcclxuXHJcbiAgICBwdWJsaWMgZmlsdGVyQ2hpbGRPZkFzc2V0T2ZQcmVmYWJJbnN0YW5jZSh1dWlkczogc3RyaW5nIHwgc3RyaW5nW10sIG9wZXJhdGlvblRpcHM6IHN0cmluZykge1xyXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh1dWlkcykpIHtcclxuICAgICAgICAgICAgdXVpZHMgPSBbdXVpZHNdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZmlsdGVyVVVJRHMgPSBbXTtcclxuICAgICAgICBmb3IgKGNvbnN0IHV1aWQgb2YgdXVpZHMpIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IEVkaXRvckV4dGVuZHMuTm9kZS5nZXROb2RlKHV1aWQpO1xyXG5cclxuICAgICAgICAgICAgLy8g5aKe5Yqg5a656ZSZXHJcbiAgICAgICAgICAgIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIOaYr+W9k+WJjeeOr+Wig+S4i+eahG1vdW50ZWRDaGlsZHJlbu+8jOWwseS4jeeul+aYr+i1hOa6kOmHjOeahFxyXG4gICAgICAgICAgICBpZiAocHJlZmFiVXRpbHMuaXNPdXRtb3N0UHJlZmFiSW5zdGFuY2VNb3VudGVkQ2hpbGRyZW4obm9kZSkpIHtcclxuICAgICAgICAgICAgICAgIGZpbHRlclVVSURzLnB1c2godXVpZCk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFwcmVmYWJVdGlscy5pc1ByZWZhYkluc3RhbmNlUm9vdChub2RlKSAmJiBwcmVmYWJVdGlscy5pc1BhcnRPZkFzc2V0SW5QcmVmYWJJbnN0YW5jZShub2RlKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBOb2RlIFske25vZGUubmFtZX1dIGlzIGEgcHJlZmFiIGNoaWxkIG9mIHByZWZhYkluc3RhbmNlIFske25vZGVbJ19wcmVmYWInXT8ucm9vdD8ubmFtZX1dLCAke29wZXJhdGlvblRpcHN9YCk7XHJcbiAgICAgICAgICAgICAgICAvLyDmtojpmaTlhbblroPpnaLmnb/nmoTnrYnlvoXmk43kvZzvvIzkvovlpoJoaWVyYXJjaHnmk43kvZzoioLngrnml7bkvJrlhYjov5vlhaXnrYnlvoXnirbmgIHvvIzlpoLmnpzmsqHmnIlub2Rl55qEY2hhbmdl5raI5oGv77yM5bCx5Lya5LiA55u05aSE5LqO562J5b6F54q25oCB44CCXHJcbiAgICAgICAgICAgICAgICBTZXJ2aWNlRXZlbnRzLmJyb2FkY2FzdCgnc2NlbmU6Y2hhbmdlLW5vZGUnLCBub2RlLnV1aWQpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZpbHRlclVVSURzLnB1c2godXVpZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmlsdGVyVVVJRHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGZpbHRlclBhcnRPZlByZWZhYkFzc2V0KHV1aWRzOiBzdHJpbmcgfCBzdHJpbmdbXSwgb3BlcmF0aW9uVGlwczogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHV1aWRzKSkge1xyXG4gICAgICAgICAgICB1dWlkcyA9IFt1dWlkc107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmaWx0ZXJVVUlEcyA9IFtdO1xyXG4gICAgICAgIGZvciAoY29uc3QgdXVpZCBvZiB1dWlkcykge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlID0gRWRpdG9yRXh0ZW5kcy5Ob2RlLmdldE5vZGUodXVpZCk7XHJcblxyXG4gICAgICAgICAgICAvLyDlop7liqDlrrnplJlcclxuICAgICAgICAgICAgaWYgKCFub2RlKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHByZWZhYlV0aWxzLmlzUGFydE9mQXNzZXRJblByZWZhYkluc3RhbmNlKG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYE5vZGUgWyR7bm9kZS5uYW1lfV0gaXMgcGFydCBvZiBwcmVmYWJJbnN0YW5jZSBbJHtub2RlWydfcHJlZmFiJ10/LnJvb3Q/Lm5hbWV9XSwgJHtvcGVyYXRpb25UaXBzfWApO1xyXG4gICAgICAgICAgICAgICAgLy8g5raI6Zmk5YW25a6D6Z2i5p2/55qE562J5b6F5pON5L2c77yM5L6L5aaCaGllcmFyY2h55pON5L2c6IqC54K55pe25Lya5YWI6L+b5YWl562J5b6F54q25oCB77yM5aaC5p6c5rKh5pyJbm9kZeeahGNoYW5nZea2iOaBr++8jOWwseS8muS4gOebtOWkhOS6juetieW+heeKtuaAgeOAglxyXG4gICAgICAgICAgICAgICAgU2VydmljZUV2ZW50cy5icm9hZGNhc3QoJ3NjZW5lOmNoYW5nZS1ub2RlJywgbm9kZS51dWlkKTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmaWx0ZXJVVUlEcy5wdXNoKHV1aWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZpbHRlclVVSURzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByZWZhYkluc3RhbmNl55qEUHJlZmFi5a2Q6IqC54K55LiN6IO95Yig6ZmkXHJcbiAgICBwdWJsaWMgZmlsdGVyQ2hpbGRPZlByZWZhYkFzc2V0V2hlblJlbW92ZU5vZGUodXVpZHM6IHN0cmluZyB8IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyQ2hpbGRPZkFzc2V0T2ZQcmVmYWJJbnN0YW5jZSh1dWlkcywgJ2l0XFwncyBub3QgYWxsb3dlZCB0byBkZWxldGUgaW4gY3VycmVudCBjb250ZXh0LCB5b3UgY2FuIGRlbGV0ZSBpdCBpbiBpdFxcJ3MgcHJlZmFiQXNzZXQgb3IgXFxcclxuICAgICAgICBkbyBpdCBhZnRlciB1bmxpbmsgcHJlZmFiIGZyb20gcm9vdCBub2RlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGZpbHRlckNoaWxkT2ZQcmVmYWJBc3NldFdoZW5TZXRQYXJlbnQodXVpZHM6IHN0cmluZyB8IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyQ2hpbGRPZkFzc2V0T2ZQcmVmYWJJbnN0YW5jZSh1dWlkcywgJ2l0XFwncyBub3QgYWxsb3dlZCB0byBjaGFuZ2UgcGFyZW50IGluIGN1cnJlbnQgY29udGV4dCwgeW91IGNhbiBtb2RpZnkgaXQgaW4gaXRcXCdzIHByZWZhYkFzc2V0IG9yIFxcXHJcbiAgICAgICAgZG8gaXQgYWZ0ZXIgdW5saW5rIHByZWZhYiBmcm9tIHJvb3Qgbm9kZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjYW5Nb2RpZnlTaWJsaW5nKHV1aWQ6IHN0cmluZywgdGFyZ2V0OiBudW1iZXIsIG9mZnNldDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8g5LiN6ZyA6KaB56e75YqoXHJcbiAgICAgICAgaWYgKG9mZnNldCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDkvKDlhaXnmoTmmK/kuIDkuKrniLboioLngrlJRFxyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBFZGl0b3JFeHRlbmRzLk5vZGUuZ2V0Tm9kZSh1dWlkKTtcclxuXHJcbiAgICAgICAgLy8g5aKe5Yqg5a656ZSZXHJcbiAgICAgICAgaWYgKCFub2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOS/neWkhOeQhuWcqFByZWZhYkluc3RhbmNl5LiL55qE5bGe5LqOUHJlZmFiQXNzZXTkuK3nmoToioLngrlcclxuICAgICAgICBpZiAobm9kZVsnX3ByZWZhYiddICYmIHByZWZhYlV0aWxzLmlzUGFydE9mUHJlZmFiQXNzZXQobm9kZSkgJiYgbm9kZVsnX3ByZWZhYiddPy5yb290Py5bJ19wcmVmYWInXT8uaW5zdGFuY2UgJiYgbm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAvLyDov4fmu6TlnKhoaWVyYXJjaHnpmpDol4/nmoToioLngrlcclxuICAgICAgICAgICAgY29uc3QgZmlsdGVySGlkZGVuQ2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuLmZpbHRlcigoY2hpbGQ6IE5vZGUpID0+ICEoY2hpbGQub2JqRmxhZ3MgJiBjYy5PYmplY3QuRmxhZ3MuSGlkZUluSGllcmFyY2h5KSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gbm9kZS5jaGlsZHJlblt0YXJnZXRdO1xyXG4gICAgICAgICAgICBpZiAoIWNoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpc0FkZGVkQ2hpbGQgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoY2hpbGRbJ19wcmVmYWInXSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZmFiU3RhdGUgPSBwcmVmYWJVdGlscy5nZXRQcmVmYWJTdGF0ZUluZm8oY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgaXNBZGRlZENoaWxkID0gcHJlZmFiU3RhdGUuaXNBZGRlZENoaWxkO1xyXG4gICAgICAgICAgICAgICAgLy8g5aaC5p6c6KaB56e75Yqo55qE6IqC54K55piv5LiA5LiqUHJlZmFi55qE5a2Q6IqC54K5XHJcbiAgICAgICAgICAgICAgICBpZiAoIWlzQWRkZWRDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgTm9kZSBbJHtjaGlsZC5uYW1lfV0gaXMgYSBwcmVmYWIgY2hpbGQgb2YgcHJlZmFiSW5zdGFuY2UgWyR7Y2hpbGRbJ19wcmVmYWInXS5yb290Py5uYW1lfV0sIFxcXHJcbiAgICAgICAgICAgICAgICAgICAgaXQncyBub3QgYWxsb3dlZCB0byBtb2RpZnkgaGllcmFyY2h5IGluIGN1cnJlbnQgY29udGV4dCwgeW91IGNhbiBtb2RpZnkgaXQgaW4gaXQncyBwcmVmYWJBc3NldCBvciBkbyBpdCBhZnRlciB1bmxpbmsgcHJlZmFiIGZyb20gcm9vdCBub2RlYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5raI6Zmk5YW25a6D6Z2i5p2/55qE562J5b6F5pON5L2c77yM5L6L5aaCaGllcmFyY2h55pON5L2c6IqC54K55pe25Lya5YWI6L+b5YWl562J5b6F54q25oCB77yM5aaC5p6c5rKh5pyJbm9kZeeahGNoYW5nZea2iOaBr++8jOWwseS8muS4gOebtOWkhOS6juetieW+heeKtuaAgeOAglxyXG4gICAgICAgICAgICAgICAgICAgIFNlcnZpY2VFdmVudHMuYnJvYWRjYXN0KCdzY2VuZTpjaGFuZ2Utbm9kZScsIGNoaWxkLnV1aWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8g5om+5Ye66KaB56e75Yqo55qE6IqC54K55Zyo5rKh5pyJ6L+H5ruk5o6J6ZqQ6JeP6IqC54K555qE5Zy65pmv5Lit55qE5L2N572uXHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldENoaWxkID0gZmlsdGVySGlkZGVuQ2hpbGRyZW5bdGFyZ2V0ICsgb2Zmc2V0XTtcclxuICAgICAgICAgICAgaWYgKGlzQWRkZWRDaGlsZCAmJiB0YXJnZXRDaGlsZFsnX3ByZWZhYiddKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYE5vZGUgWyR7dGFyZ2V0Q2hpbGQubmFtZX1dIGlzIGEgcHJlZmFiIGNoaWxkIG9mIHByZWZhYkluc3RhbmNlIFske3RhcmdldENoaWxkWydfcHJlZmFiJ10ucm9vdD8ubmFtZX1dLCBcXFxyXG4gICAgICAgICAgICAgICAgaXQncyBub3QgYWxsb3dlZCB0byBtb2RpZnkgaGllcmFyY2h5IGluIGN1cnJlbnQgY29udGV4dCwgeW91IGNhbiBtb2RpZnkgaXQgaW4gaXQncyBwcmVmYWJBc3NldCBvciBkbyBpdCBhZnRlciB1bmxpbmsgcHJlZmFiIGZyb20gcm9vdCBub2RlYCk7XHJcbiAgICAgICAgICAgICAgICAvLyDmtojpmaTlhbblroPpnaLmnb/nmoTnrYnlvoXmk43kvZzvvIzkvovlpoJoaWVyYXJjaHnmk43kvZzoioLngrnml7bkvJrlhYjov5vlhaXnrYnlvoXnirbmgIHvvIzlpoLmnpzmsqHmnIlub2Rl55qEY2hhbmdl5raI5oGv77yM5bCx5Lya5LiA55u05aSE5LqO562J5b6F54q25oCB44CCXHJcbiAgICAgICAgICAgICAgICBTZXJ2aWNlRXZlbnRzLmJyb2FkY2FzdCgnc2NlbmU6Y2hhbmdlLW5vZGUnLCBjaGlsZC51dWlkKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGZpbHRlclBhcnRPZlByZWZhYkFzc2V0V2hlbkNyZWF0ZUNvbXBvbmVudCh1dWlkczogc3RyaW5nIHwgc3RyaW5nW10pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWx0ZXJQYXJ0T2ZQcmVmYWJBc3NldCh1dWlkcywgJ2l0XFwncyBub3QgYWxsb3cgdG8gYWRkIGNvbXBvbmVudCBpbiBjdXJyZW50IGNvbnRleHQgY3VycmVudGx5LCB5b3UgY2FuIGFkZCBjb21wb25lbnQgaW4gaXRcXCdzIHByZWZhYkFzc2V0IG9yIFxcXHJcbiAgICAgICAgZG8gaXQgYWZ0ZXIgdW5saW5rIHByZWZhYiBmcm9tIHJvb3Qgbm9kZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBmaWx0ZXJQYXJ0T2ZQcmVmYWJBc3NldFdoZW5SZW1vdmVDb21wb25lbnQodXVpZHM6IHN0cmluZyB8IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyUGFydE9mUHJlZmFiQXNzZXQodXVpZHMsICdpdFxcJ3Mgbm90IGFsbG93IHRvIHJlbW92ZSBjb21wb25lbnQgaW4gY3VycmVudCBjb250ZXh0IGN1cnJlbnRseSwgeW91IGNhbiByZW1vdmUgY29tcG9uZW50IGluIGl0XFwncyBwcmVmYWJBc3NldCBvciBcXFxyXG4gICAgICAgIGRvIGl0IGFmdGVyIHVubGluayBwcmVmYWIgZnJvbSByb290IG5vZGUnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaatOWKm+mBjeWOhnJvb3TmiYDmnInlsZ7mgKfvvIzmib7liLBydWxl6L+U5ZuedHJ1ZeeahOi3r+W+hFxyXG4gICAgICog5q+U5aaC5om+U2NlbmXoioLngrnnmoTot6/lvoTvvIxydWxlID0gKG9iaik9PiByZXR1cm4gb2JqLmdsb2JhbHNcclxuICAgICAqIEBwYXJhbSByb290IOagueiKgueCuVxyXG4gICAgICogQHBhcmFtIHJ1bGUg5Yik5pat5Ye95pWwXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZmluZFBhdGhXaXRoUnVsZShyb290OiBOb2RlLCBydWxlOiBGdW5jdGlvbikge1xyXG4gICAgICAgIGNvbnN0IHBhdGg6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgY29uc3QgY2FjaGUgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgY29uc3Qgd2FsayA9IGZ1bmN0aW9uIChvYmo6IGFueSwgcHJla2V5OiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XHJcbiAgICAgICAgICAgIGtleXMuZm9yRWFjaChrZXkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAob2JqW2tleV0pID09PSAnb2JqZWN0JyAmJiBvYmpba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNhY2hlLmdldChvYmpba2V5XSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuc2V0KG9ialtrZXldLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGUob2JqW2tleV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5om+5Yiw5LqGJywgcHJla2V5ICsgJ3wnICsga2V5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgucHVzaChwcmVrZXkgKyAnfCcgKyBrZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2FsayhvYmpba2V5XSwgcHJla2V5ICsgJ3wnICsga2V5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgd2Fsayhyb290LCAnJyk7XHJcbiAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IG5ldyBQcmVmYWJTZXJ2aWNlKCk7XHJcbiJdfQ==