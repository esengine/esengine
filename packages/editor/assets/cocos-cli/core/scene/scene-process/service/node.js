"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeService = void 0;
const core_1 = require("./core");
const common_1 = require("../../common");
const rpc_1 = require("../rpc");
const cc_1 = require("cc");
const node_create_1 = require("./node/node-create");
const node_utils_1 = require("./node/node-utils");
const utils_1 = require("./scene/utils");
const node_type_config_1 = __importDefault(require("./node/node-type-config"));
const NodeMgr = EditorExtends.Node;
/**
 * 子进程节点处理器
 * 在子进程中处理所有节点相关操作
 */
let NodeService = class NodeService extends core_1.BaseService {
    async createNodeByType(params) {
        let canvasNeeded = params.canvasRequired || false;
        const nodeType = params.nodeType;
        const paramsArray = node_type_config_1.default[nodeType];
        if (!paramsArray || paramsArray.length < 0) {
            throw new Error(`Node type '${nodeType}' is not implemented`);
        }
        let assetUuid = paramsArray[0].assetUuid || null;
        canvasNeeded = paramsArray[0].canvasRequired ? true : false;
        const projectType = paramsArray[0]['project-type'];
        const workMode = params.workMode;
        if (projectType && workMode && projectType !== workMode && paramsArray.length > 1) {
            assetUuid = paramsArray[1]['assetUuid'] || null;
            canvasNeeded = paramsArray[1].canvasRequired ? true : false;
        }
        return await this._createNode(assetUuid, canvasNeeded, params.nodeType == common_1.NodeType.EMPTY, params);
    }
    async createNodeByAsset(params) {
        const assetUuid = await rpc_1.Rpc.getInstance().request('assetManager', 'queryUUID', [params.dbURL]);
        if (!assetUuid) {
            throw new Error(`Asset not found for dbURL: ${params.dbURL}`);
        }
        const canvasNeeded = params.canvasRequired || false;
        return await this._createNode(assetUuid, canvasNeeded, false, params);
    }
    async _createNode(assetUuid, canvasNeeded, checkUITransform, params) {
        const currentScene = core_1.Service.Editor.getRootNode();
        if (!currentScene) {
            throw new Error('Failed to create node: the scene is not opened.');
        }
        const workMode = params.workMode || '2d';
        // 使用增强的路径处理方法
        let parent = await this._getOrCreateNodeByPath(params.path);
        if (!parent) {
            parent = currentScene;
        }
        let resultNode;
        if (assetUuid) {
            const { node, canvasRequired } = await (0, node_create_1.createNodeByAsset)({
                uuid: assetUuid,
                canvasRequired: canvasNeeded
            });
            resultNode = node;
            parent = await this.checkCanvasRequired(workMode, Boolean(canvasRequired), parent, params.position);
        }
        if (!resultNode) {
            resultNode = new cc.Node();
        }
        if (!resultNode) {
            return null;
        }
        /**
         * 默认创建节点是从 prefab 模板，所以初始是 prefab 节点
         * 是否要 unlink 为普通节点
         * 有 nodeType 说明是内置资源创建的，需要移除 prefab info
         */
        if ('nodeType' in params) {
            core_1.Service.Prefab.removePrefabInfoFromNode(resultNode, true);
        }
        if (params.name) {
            resultNode.name = params.name;
        }
        this.emit('node:before-add', resultNode);
        if (parent) {
            this.emit('node:before-change', parent);
        }
        /**
         * 新节点的 layer 跟随父级节点，但父级节点为场景根节点除外
         * parent.layer 可能为 0 （界面下拉框为 None），此情况下新节点不跟随
         */
        if (parent && parent.layer && parent !== core_1.Service.Editor.getRootNode()) {
            (0, node_utils_1.setLayer)(resultNode, parent.layer, true);
        }
        // Compared to the editor, the position is set via API, so local coordinates are used here.
        if (params.position) {
            resultNode.setPosition(params.position);
        }
        resultNode.setParent(parent, params.keepWorldTransform);
        // setParent 后，node的path可能会变，node的name需要同步path中对应的name
        const path = NodeMgr.getNodePath(resultNode);
        const name = path.split('/').pop();
        if (name && resultNode.name !== name) {
            resultNode.name = name;
        }
        if (checkUITransform) {
            this.ensureUITransformComponent(resultNode);
        }
        // 发送添加节点事件，添加节点中的根节点
        this.emit('node:add', resultNode);
        // 发送节点修改消息
        if (parent) {
            this.emit('node:change', parent, { type: common_1.NodeEventType.CHILD_CHANGED });
        }
        return utils_1.sceneUtils.generateNodeInfo(resultNode, true);
    }
    /**
     * 获取或创建路径节点
     */
    async _getOrCreateNodeByPath(path) {
        if (!path) {
            return null;
        }
        // 先尝试获取现有节点
        const parent = NodeMgr.getNodeByPath(path);
        if (parent) {
            return parent;
        }
        // 如果不存在，则创建路径
        return await this._ensurePathExists(path);
    }
    /**
     * 确保路径存在，如果不存在则创建空节点
     */
    async _ensurePathExists(path) {
        if (!path) {
            return null;
        }
        const currentScene = core_1.Service.Editor.getRootNode();
        if (!currentScene) {
            return null;
        }
        // 分割路径
        const pathParts = path.split('/').filter(part => part.trim() !== '');
        if (pathParts.length === 0) {
            return null;
        }
        let currentParent = currentScene;
        // 逐级检查并创建路径
        for (let i = 0; i < pathParts.length; i++) {
            const pathPart = pathParts[i];
            let nextNode = currentParent.getChildByName(pathPart);
            if (!nextNode) {
                if (pathPart === 'Canvas') {
                    nextNode = await this.checkCanvasRequired('2d', true, currentParent, undefined);
                }
                else {
                    // 创建空节点
                    nextNode = new cc_1.Node(pathPart);
                    // 设置父级
                    nextNode.setParent(currentParent);
                    // 确保新创建的节点有必要的组件
                    this.ensureUITransformComponent(nextNode);
                    // 发送节点创建事件
                    this.emit('node:add', nextNode);
                }
            }
            if (!nextNode) {
                throw new Error(`Failed to create node: the path ${path} is not valid.`);
            }
            currentParent = nextNode;
        }
        return currentParent;
    }
    async deleteNode(params) {
        const path = params.path;
        const node = NodeMgr.getNodeByPath(path);
        if (!node) {
            return null;
        }
        // 发送节点修改消息
        const parent = node.parent;
        this.emit('node:before-remove', node);
        if (parent) {
            this.emit('node:before-change', parent);
        }
        node.setParent(null, params.keepWorldTransform);
        node._objFlags |= cc_1.CCObject.Flags.Destroyed;
        // 3.6.1 特殊 hack，请在后续版本移除
        // 相关修复 pr: https://github.com/cocos/cocos-editor/pull/890
        try {
            this._walkNode(node, (child) => {
                child._objFlags |= cc_1.CCObject.Flags.Destroyed;
            });
        }
        catch (error) {
            console.warn(error);
        }
        this.emit('node:remove', node);
        return {
            path: path,
        };
    }
    _walkNode(node, func) {
        node && node.children && node.children.forEach((child) => {
            func(child);
            this._walkNode(child, func);
        });
    }
    async updateNode(params) {
        const node = NodeMgr.getNodeByPath(params.path);
        if (!node) {
            throw new Error(`更新节点失败，无法通过 ${params.path} 查询到节点`);
        }
        this.emit('node:before-change', node);
        // TODO 少了 parent 属性的设置
        // if (path === 'parent' && node.parent) {
        //   // 发送节点修改消息
        //   // this.emit('before-change', node.parent);
        // }
        if (params.name && params.name !== node.name) {
            NodeMgr.updateNodeName(node.uuid, params.name);
        }
        // TODO 这里需要按照 3x 用 setProperty 的方式去赋值，因为 prefab 那边需要 path
        const paths = [];
        if (params.properties) {
            const options = params.properties;
            if (options.active !== undefined) {
                node.active = options.active;
                paths.push('active');
            }
            if (options.position) {
                node.setPosition(options.position);
                paths.push('position');
            }
            // if (options.worldPosition) {
            //     node.setWorldPosition(options.worldPosition as Vec3);
            // }
            if (options.rotation) {
                node.rotation = options.rotation;
                paths.push('rotation');
            }
            // if (options.worldRotation) {
            //     node.worldRotation = options.worldRotation as Quat;
            // }
            if (options.eulerAngles) {
                node.eulerAngles = options.eulerAngles;
                paths.push('eulerAngles');
            }
            // if (options.angle) {
            //     node.angle = options.angle;
            // }
            if (options.scale) {
                node.scale = options.scale;
                paths.push('scale');
            }
            // if (options.worldScale) {
            //     node.worldScale = options.worldScale as Vec3;
            // }
            // if (options.forward) {
            //     node.forward = options.forward as Vec3;
            // }
            if (options.mobility) {
                node.mobility = options.mobility;
                paths.push('mobility');
            }
            if (options.layer) {
                node.layer = options.layer;
                paths.push('layer');
            }
            // if (options.hasChangedFlags) {
            //     node.hasChangedFlags = options.hasChangedFlags;
            // }
        }
        const info = {
            path: NodeMgr.getNodePath(node),
        };
        for (const path of paths) {
            this.emit('node:change', node, { type: common_1.NodeEventType.SET_PROPERTY, propPath: path });
        }
        // TODO 少了 parent 属性的设置
        // 改变父子关系
        // if (path === 'parent' && node.parent) {
        //     // 发送节点修改消息
        //     this.emit('change', node.parent, { type: NodeOperationType.SET_PROPERTY, propPath: 'children', record: record });
        // }
        return info;
    }
    async queryNode(params) {
        const node = NodeMgr.getNodeByPath(params.path);
        if (!node) {
            return null;
        }
        return utils_1.sceneUtils.generateNodeInfo(node, params.queryChildren || false);
    }
    /**
     * 确保节点有 UITransform 组件
     * 目前只需保障在创建空节点的时候检查任意上级是否为 canvas
     */
    ensureUITransformComponent(node) {
        if (node instanceof cc.Node && node.children.length === 0) {
            // 空节点
            let inside = false;
            let parent = node.parent;
            while (parent) {
                const components = parent.components.map((comp) => cc.js.getClassName(comp.constructor));
                if (components.includes('cc.Canvas')) {
                    inside = true;
                    break;
                }
                parent = parent.parent;
            }
            if (inside) {
                try {
                    node.addComponent('cc.UITransform');
                }
                catch (error) {
                    console.error(error);
                }
            }
        }
    }
    /**
     * 检查并根据需要创建 canvas节点或为父级添加UITransform组件，返回父级节点，如果需要canvas节点，则父级节点会是canvas节点
     * @param workMode
     * @param canvasRequiredParam
     * @param parent
     * @param position
     * @returns
     */
    async checkCanvasRequired(workMode, canvasRequiredParam, parent, position) {
        if (canvasRequiredParam && parent?.isValid) {
            let canvasNode;
            canvasNode = (0, node_utils_1.getUICanvasNode)(parent);
            if (canvasNode) {
                parent = canvasNode;
            }
            // 自动创建一个 canvas 节点
            if (!canvasNode) {
                // TODO 这里会导致如果在 3D 场景下创建 2d canvas 摄像机的优先级跟主摄像机一样，
                //  导致显示不出 UI 来，先都用 ui canvas
                const canvasAssetUuid = 'f773db21-62b8-4540-956a-29bacf5ddbf5';
                // // 2d 项目创建的 ui 节点，canvas 下的 camera 的 visibility 默认勾上 default
                // if (workMode === '2d') {
                //     canvasAssetUuid = '4c33600e-9ca9-483b-b734-946008261697';
                // }
                const canvasAsset = await (0, node_create_1.loadAny)(canvasAssetUuid);
                canvasNode = cc.instantiate(canvasAsset);
                core_1.Service.Prefab.removePrefabInfoFromNode(canvasNode);
                if (parent) {
                    parent.addChild(canvasNode);
                }
                parent = canvasNode;
            }
            // 目前 canvas 默认 z 为 1，而拖放到 Canvas 的控件因为检测的是 z 为 0 的平面，所以这边先强制把 z 设置为和 canvas 的一样
            if (position) {
                position.z = canvasNode.position.z;
            }
        }
        return parent;
    }
    onEditorOpened() {
        const nodeMap = NodeMgr.getNodesInScene();
        // 场景载入后要将现有节点监听所需事件
        Object.keys(nodeMap).forEach((key) => {
            this.registerEventListeners(nodeMap[key]);
        });
        this.registerNodeMgrEvents();
        core_1.Service.Component.init();
    }
    onEditorClosed() {
        core_1.Service.Component.unregisterCompMgrEvents();
        this.unregisterNodeMgrEvents();
        const nodeMap = NodeMgr.getNodes();
        Object.keys(nodeMap).forEach((key) => {
            this.unregisterEventListeners(nodeMap[key]);
        });
        NodeMgr.clear();
        EditorExtends.Component.clear();
    }
    // ----------
    NodeHandlers = {
        [cc_1.Node.EventType.TRANSFORM_CHANGED]: 'onNodeTransformChanged',
        [cc_1.Node.EventType.SIZE_CHANGED]: 'onNodeSizeChanged',
        [cc_1.Node.EventType.ANCHOR_CHANGED]: 'onNodeAnchorChanged',
        [cc_1.Node.EventType.CHILD_ADDED]: 'onNodeParentChanged',
        [cc_1.Node.EventType.CHILD_REMOVED]: 'onNodeParentChanged',
        [cc_1.Node.EventType.LIGHT_PROBE_CHANGED]: 'onLightProbeChanged',
    };
    nodeHandlers = new Map();
    /**
     * 监听引擎发出的 node 事件
     * @param {*} node
     */
    registerEventListeners(node) {
        if (!node || !node.isValid || (0, node_utils_1.isEditorNode)(node)) {
            return;
        }
        // 遍历事件映射表，统一注册事件
        Object.entries(this.NodeHandlers).forEach(([eventType, handlerName]) => {
            const boundHandler = this[handlerName].bind(this, node);
            node.on(eventType, boundHandler, this);
            this.nodeHandlers.set(`${eventType}_${node.uuid}`, boundHandler);
        });
    }
    /**
     * 取消监听引擎发出的node事件
     * @param {*} node
     */
    unregisterEventListeners(node) {
        if (!node || !node.isValid || (0, node_utils_1.isEditorNode)(node)) {
            return;
        }
        // 遍历事件映射表，统一取消事件
        Object.keys(this.NodeHandlers).forEach(eventType => {
            const key = `${eventType}_${node.uuid}`;
            const handler = this.nodeHandlers.get(key);
            if (handler) {
                node.off(eventType, handler);
                this.nodeHandlers.delete(key);
            }
        });
    }
    NodeMgrEventHandlers = {
        ['add']: 'add',
        ['change']: 'change',
        ['remove']: 'remove',
    };
    nodeMgrEventHandlers = new Map();
    /**
     * 注册引擎 Node 管理相关事件的监听
     */
    registerNodeMgrEvents() {
        this.unregisterNodeMgrEvents();
        Object.entries(this.NodeMgrEventHandlers).forEach(([eventType, handlerName]) => {
            const handler = this[handlerName].bind(this);
            NodeMgr.on(eventType, handler);
            this.nodeMgrEventHandlers.set(eventType, handler);
            // console.log(`NodeMgr on ${eventType}`);
        });
    }
    unregisterNodeMgrEvents() {
        for (const eventType of this.nodeMgrEventHandlers.keys()) {
            const handler = this.nodeMgrEventHandlers.get(eventType);
            if (handler) {
                NodeMgr.off(eventType, handler);
                this.nodeMgrEventHandlers.delete(eventType);
                // console.log(`NodeMgr off ${eventType}`);
            }
        }
    }
    onNodeTransformChanged(node, transformBit) {
        const changeOpts = { type: common_1.NodeEventType.TRANSFORM_CHANGED, source: common_1.EventSourceType.ENGINE };
        switch (transformBit) {
            case cc_1.Node.TransformBit.POSITION:
                changeOpts.propPath = 'position';
                break;
            case cc_1.Node.TransformBit.ROTATION:
                changeOpts.propPath = 'rotation';
                break;
            case cc_1.Node.TransformBit.SCALE:
                changeOpts.propPath = 'scale';
                break;
        }
        this.emit('node:change', node, changeOpts);
    }
    onNodeSizeChanged(node) {
        const changeOpts = { type: common_1.NodeEventType.SIZE_CHANGED, source: common_1.EventSourceType.ENGINE };
        const uiTransform = node.getComponent(cc_1.UITransform);
        if (uiTransform) {
            const index = node.components.indexOf(uiTransform);
            changeOpts.propPath = `_components.${index}.contentSize`;
        }
        this.emit('node:change', node, changeOpts);
    }
    onNodeAnchorChanged(node) {
        const changeOpts = { type: common_1.NodeEventType.ANCHOR_CHANGED, source: common_1.EventSourceType.ENGINE };
        const uiTransform = node.getComponent(cc_1.UITransform);
        if (uiTransform) {
            const index = node.components.indexOf(uiTransform);
            changeOpts.propPath = `_components.${index}.anchorPoint`;
        }
        this.emit('node:change', node, changeOpts);
    }
    onNodeParentChanged(parent, child) {
        if ((0, node_utils_1.isEditorNode)(child)) {
            return;
        }
        this.emit('node:change', parent, { type: common_1.NodeEventType.CHILD_CHANGED });
        // 自身 parent = null 为删除，最后会有 deleted 消息，所以不需要再发 changed 消息
        if (child.parent) {
            this.emit('node:change', child, { type: common_1.NodeEventType.PARENT_CHANGED });
        }
    }
    onLightProbeChanged(node) {
        const changeOpts = { type: common_1.NodeEventType.LIGHT_PROBE_CHANGED, source: common_1.EventSourceType.ENGINE };
        this.emit('node:change', node, changeOpts);
    }
    /**
     * 添加一个节点到管理器内
     * @param uuid
     * @param {*} node
     */
    add(uuid, node) {
        this.registerEventListeners(node);
        if (!(0, node_utils_1.isEditorNode)(node)) {
            this.emit('node:added', node);
        }
    }
    /**
     * 一个节点被修改,由 EditorExtends.Node.emit('change') 触发
     * @param uuid
     * @param node
     */
    change(uuid, node) {
        if (!(0, node_utils_1.isEditorNode)(node)) {
            // 这里是因为 LOD 组件在挂到场景的时候，修改了自己的数据，但编辑器暂时无法知道修改了哪些数据
            // 所以针对 LOD 部分，增加了 propPath, prefab 才能正常修改
            let path = '';
            const lodGroup = node.getComponent(cc_1.LODGroup);
            if (lodGroup) {
                const index = node.components.indexOf(lodGroup);
                path = `__comps__.${index}`;
            }
            this.emit('node:change', node, { type: common_1.NodeEventType.SET_PROPERTY, propPath: path });
        }
    }
    /**
     * 从管理器内移除一个指定的节点
     * @param uuid
     * @param {*} node
     */
    remove(uuid, node) {
        this.unregisterEventListeners(node);
        if (!(0, node_utils_1.isEditorNode)(node)) {
            this.emit('node:removed', node, { source: common_1.EventSourceType.ENGINE });
        }
    }
};
exports.NodeService = NodeService;
exports.NodeService = NodeService = __decorate([
    (0, core_1.register)('Node')
], NodeService);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL3NjZW5lL3NjZW5lLXByb2Nlc3Mvc2VydmljZS9ub2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGlDQUF3RDtBQUN4RCx5Q0Flc0I7QUFDdEIsZ0NBQTZCO0FBQzdCLDJCQUE2RjtBQUM3RixvREFBZ0U7QUFDaEUsa0RBQTRFO0FBQzVFLHlDQUEyQztBQUMzQywrRUFBaUQ7QUFFakQsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQztBQUVuQzs7O0dBR0c7QUFFSSxJQUFNLFdBQVcsR0FBakIsTUFBTSxXQUFZLFNBQVEsa0JBQXdCO0lBQ3JELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUErQjtRQUNsRCxJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsY0FBYyxJQUFJLEtBQUssQ0FBQztRQUNsRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBa0IsQ0FBQztRQUMzQyxNQUFNLFdBQVcsR0FBRywwQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUN6QyxNQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsUUFBUSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFDRCxJQUFJLFNBQVMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQztRQUNqRCxZQUFZLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDNUQsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FB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LFdBQVc7SUFEdkIsSUFBQSxlQUFRLEVBQUMsTUFBTSxDQUFDO0dBQ0osV0FBVyxDQTRrQnZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmVnaXN0ZXIsIEJhc2VTZXJ2aWNlLCBTZXJ2aWNlIH0gZnJvbSAnLi9jb3JlJztcclxuaW1wb3J0IHtcclxuICAgIHR5cGUgSUNyZWF0ZUJ5QXNzZXRQYXJhbXMsXHJcbiAgICB0eXBlIElDcmVhdGVCeU5vZGVUeXBlUGFyYW1zLFxyXG4gICAgdHlwZSBJRGVsZXRlTm9kZVBhcmFtcyxcclxuICAgIHR5cGUgSURlbGV0ZU5vZGVSZXN1bHQsXHJcbiAgICB0eXBlIElOb2RlLFxyXG4gICAgdHlwZSBJTm9kZVNlcnZpY2UsXHJcbiAgICB0eXBlIElRdWVyeU5vZGVQYXJhbXMsXHJcbiAgICB0eXBlIElOb2RlRXZlbnRzLFxyXG4gICAgdHlwZSBJVXBkYXRlTm9kZVBhcmFtcyxcclxuICAgIHR5cGUgSVVwZGF0ZU5vZGVSZXN1bHQsXHJcbiAgICBOb2RlVHlwZSxcclxuICAgIE5vZGVFdmVudFR5cGUsXHJcbiAgICBFdmVudFNvdXJjZVR5cGUsXHJcbiAgICBJQ2hhbmdlTm9kZU9wdGlvbnNcclxufSBmcm9tICcuLi8uLi9jb21tb24nO1xyXG5pbXBvcnQgeyBScGMgfSBmcm9tICcuLi9ycGMnO1xyXG5pbXBvcnQgeyBDQ09iamVjdCwgTm9kZSwgUHJlZmFiLCBRdWF0LCBWZWMzLCBUcmFuc2Zvcm1CaXQsIFVJVHJhbnNmb3JtLCBMT0RHcm91cCB9IGZyb20gJ2NjJztcclxuaW1wb3J0IHsgY3JlYXRlTm9kZUJ5QXNzZXQsIGxvYWRBbnkgfSBmcm9tICcuL25vZGUvbm9kZS1jcmVhdGUnO1xyXG5pbXBvcnQgeyBnZXRVSUNhbnZhc05vZGUsIGlzRWRpdG9yTm9kZSwgc2V0TGF5ZXIgfSBmcm9tICcuL25vZGUvbm9kZS11dGlscyc7XHJcbmltcG9ydCB7IHNjZW5lVXRpbHMgfSBmcm9tICcuL3NjZW5lL3V0aWxzJztcclxuaW1wb3J0IE5vZGVDb25maWcgZnJvbSAnLi9ub2RlL25vZGUtdHlwZS1jb25maWcnO1xyXG5cclxuY29uc3QgTm9kZU1nciA9IEVkaXRvckV4dGVuZHMuTm9kZTtcclxuXHJcbi8qKlxyXG4gKiDlrZDov5vnqIvoioLngrnlpITnkIblmahcclxuICog5Zyo5a2Q6L+b56iL5Lit5aSE55CG5omA5pyJ6IqC54K555u45YWz5pON5L2cXHJcbiAqL1xyXG5AcmVnaXN0ZXIoJ05vZGUnKVxyXG5leHBvcnQgY2xhc3MgTm9kZVNlcnZpY2UgZXh0ZW5kcyBCYXNlU2VydmljZTxJTm9kZUV2ZW50cz4gaW1wbGVtZW50cyBJTm9kZVNlcnZpY2Uge1xyXG4gICAgYXN5bmMgY3JlYXRlTm9kZUJ5VHlwZShwYXJhbXM6IElDcmVhdGVCeU5vZGVUeXBlUGFyYW1zKTogUHJvbWlzZTxJTm9kZSB8IG51bGw+IHtcclxuICAgICAgICBsZXQgY2FudmFzTmVlZGVkID0gcGFyYW1zLmNhbnZhc1JlcXVpcmVkIHx8IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IG5vZGVUeXBlID0gcGFyYW1zLm5vZGVUeXBlIGFzIHN0cmluZztcclxuICAgICAgICBjb25zdCBwYXJhbXNBcnJheSA9IE5vZGVDb25maWdbbm9kZVR5cGVdO1xyXG4gICAgICAgIGlmICghcGFyYW1zQXJyYXkgfHwgcGFyYW1zQXJyYXkubGVuZ3RoIDwgMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vZGUgdHlwZSAnJHtub2RlVHlwZX0nIGlzIG5vdCBpbXBsZW1lbnRlZGApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYXNzZXRVdWlkID0gcGFyYW1zQXJyYXlbMF0uYXNzZXRVdWlkIHx8IG51bGw7XHJcbiAgICAgICAgY2FudmFzTmVlZGVkID0gcGFyYW1zQXJyYXlbMF0uY2FudmFzUmVxdWlyZWQgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgY29uc3QgcHJvamVjdFR5cGUgPSBwYXJhbXNBcnJheVswXVsncHJvamVjdC10eXBlJ107XHJcbiAgICAgICAgY29uc3Qgd29ya01vZGUgPSBwYXJhbXMud29ya01vZGU7XHJcbiAgICAgICAgaWYgKHByb2plY3RUeXBlICYmIHdvcmtNb2RlICYmIHByb2plY3RUeXBlICE9PSB3b3JrTW9kZSAmJiBwYXJhbXNBcnJheS5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGFzc2V0VXVpZCA9IHBhcmFtc0FycmF5WzFdWydhc3NldFV1aWQnXSB8fCBudWxsO1xyXG4gICAgICAgICAgICBjYW52YXNOZWVkZWQgPSBwYXJhbXNBcnJheVsxXS5jYW52YXNSZXF1aXJlZCA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9jcmVhdGVOb2RlKGFzc2V0VXVpZCwgY2FudmFzTmVlZGVkLCBwYXJhbXMubm9kZVR5cGUgPT0gTm9kZVR5cGUuRU1QVFksIHBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgY3JlYXRlTm9kZUJ5QXNzZXQocGFyYW1zOiBJQ3JlYXRlQnlBc3NldFBhcmFtcyk6IFByb21pc2U8SU5vZGUgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3QgYXNzZXRVdWlkID0gYXdhaXQgUnBjLmdldEluc3RhbmNlKCkucmVxdWVzdCgnYXNzZXRNYW5hZ2VyJywgJ3F1ZXJ5VVVJRCcsIFtwYXJhbXMuZGJVUkxdKTtcclxuICAgICAgICBpZiAoIWFzc2V0VXVpZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2V0IG5vdCBmb3VuZCBmb3IgZGJVUkw6ICR7cGFyYW1zLmRiVVJMfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjYW52YXNOZWVkZWQgPSBwYXJhbXMuY2FudmFzUmVxdWlyZWQgfHwgZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX2NyZWF0ZU5vZGUoYXNzZXRVdWlkLCBjYW52YXNOZWVkZWQsIGZhbHNlLCBwYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIF9jcmVhdGVOb2RlKGFzc2V0VXVpZDogc3RyaW5nIHwgbnVsbCwgY2FudmFzTmVlZGVkOiBib29sZWFuLCBjaGVja1VJVHJhbnNmb3JtOiBib29sZWFuLCBwYXJhbXM6IElDcmVhdGVCeU5vZGVUeXBlUGFyYW1zIHwgSUNyZWF0ZUJ5QXNzZXRQYXJhbXMpOiBQcm9taXNlPElOb2RlIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRTY2VuZSA9IFNlcnZpY2UuRWRpdG9yLmdldFJvb3ROb2RlKCk7XHJcbiAgICAgICAgaWYgKCFjdXJyZW50U2NlbmUpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIG5vZGU6IHRoZSBzY2VuZSBpcyBub3Qgb3BlbmVkLicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgd29ya01vZGUgPSBwYXJhbXMud29ya01vZGUgfHwgJzJkJztcclxuICAgICAgICAvLyDkvb/nlKjlop7lvLrnmoTot6/lvoTlpITnkIbmlrnms5VcclxuICAgICAgICBsZXQgcGFyZW50ID0gYXdhaXQgdGhpcy5fZ2V0T3JDcmVhdGVOb2RlQnlQYXRoKHBhcmFtcy5wYXRoKTtcclxuICAgICAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgICAgICBwYXJlbnQgPSBjdXJyZW50U2NlbmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcmVzdWx0Tm9kZTtcclxuICAgICAgICBpZiAoYXNzZXRVdWlkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgbm9kZSwgY2FudmFzUmVxdWlyZWQgfSA9IGF3YWl0IGNyZWF0ZU5vZGVCeUFzc2V0KHtcclxuICAgICAgICAgICAgICAgIHV1aWQ6IGFzc2V0VXVpZCxcclxuICAgICAgICAgICAgICAgIGNhbnZhc1JlcXVpcmVkOiBjYW52YXNOZWVkZWRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJlc3VsdE5vZGUgPSBub2RlO1xyXG4gICAgICAgICAgICBwYXJlbnQgPSBhd2FpdCB0aGlzLmNoZWNrQ2FudmFzUmVxdWlyZWQod29ya01vZGUsIEJvb2xlYW4oY2FudmFzUmVxdWlyZWQpLCBwYXJlbnQsIHBhcmFtcy5wb3NpdGlvbiBhcyBWZWMzKSBhcyBOb2RlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXJlc3VsdE5vZGUpIHtcclxuICAgICAgICAgICAgcmVzdWx0Tm9kZSA9IG5ldyBjYy5Ob2RlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlc3VsdE5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDpu5jorqTliJvlu7roioLngrnmmK/ku44gcHJlZmFiIOaooeadv++8jOaJgOS7peWIneWni+aYryBwcmVmYWIg6IqC54K5XHJcbiAgICAgICAgICog5piv5ZCm6KaBIHVubGluayDkuLrmma7pgJroioLngrlcclxuICAgICAgICAgKiDmnIkgbm9kZVR5cGUg6K+05piO5piv5YaF572u6LWE5rqQ5Yib5bu655qE77yM6ZyA6KaB56e76ZmkIHByZWZhYiBpbmZvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKCdub2RlVHlwZScgaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgICAgIFNlcnZpY2UuUHJlZmFiLnJlbW92ZVByZWZhYkluZm9Gcm9tTm9kZShyZXN1bHROb2RlLCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwYXJhbXMubmFtZSkge1xyXG4gICAgICAgICAgICByZXN1bHROb2RlLm5hbWUgPSBwYXJhbXMubmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZW1pdCgnbm9kZTpiZWZvcmUtYWRkJywgcmVzdWx0Tm9kZSk7XHJcbiAgICAgICAgaWYgKHBhcmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ25vZGU6YmVmb3JlLWNoYW5nZScsIHBhcmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDmlrDoioLngrnnmoQgbGF5ZXIg6Lef6ZqP54i257qn6IqC54K577yM5L2G54i257qn6IqC54K55Li65Zy65pmv5qC56IqC54K56Zmk5aSWXHJcbiAgICAgICAgICogcGFyZW50LmxheWVyIOWPr+iDveS4uiAwIO+8iOeVjOmdouS4i+aLieahhuS4uiBOb25l77yJ77yM5q2k5oOF5Ya15LiL5paw6IqC54K55LiN6Lef6ZqPXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKHBhcmVudCAmJiBwYXJlbnQubGF5ZXIgJiYgcGFyZW50ICE9PSBTZXJ2aWNlLkVkaXRvci5nZXRSb290Tm9kZSgpKSB7XHJcbiAgICAgICAgICAgIHNldExheWVyKHJlc3VsdE5vZGUsIHBhcmVudC5sYXllciwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDb21wYXJlZCB0byB0aGUgZWRpdG9yLCB0aGUgcG9zaXRpb24gaXMgc2V0IHZpYSBBUEksIHNvIGxvY2FsIGNvb3JkaW5hdGVzIGFyZSB1c2VkIGhlcmUuXHJcbiAgICAgICAgaWYgKHBhcmFtcy5wb3NpdGlvbikge1xyXG4gICAgICAgICAgICByZXN1bHROb2RlLnNldFBvc2l0aW9uKHBhcmFtcy5wb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXN1bHROb2RlLnNldFBhcmVudChwYXJlbnQsIHBhcmFtcy5rZWVwV29ybGRUcmFuc2Zvcm0pO1xyXG4gICAgICAgIC8vIHNldFBhcmVudCDlkI7vvIxub2Rl55qEcGF0aOWPr+iDveS8muWPmO+8jG5vZGXnmoRuYW1l6ZyA6KaB5ZCM5q2lcGF0aOS4reWvueW6lOeahG5hbWVcclxuICAgICAgICBjb25zdCBwYXRoID0gTm9kZU1nci5nZXROb2RlUGF0aChyZXN1bHROb2RlKTtcclxuICAgICAgICBjb25zdCBuYW1lID0gcGF0aC5zcGxpdCgnLycpLnBvcCgpO1xyXG4gICAgICAgIGlmIChuYW1lICYmIHJlc3VsdE5vZGUubmFtZSAhPT0gbmFtZSkge1xyXG4gICAgICAgICAgICByZXN1bHROb2RlLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2hlY2tVSVRyYW5zZm9ybSkge1xyXG4gICAgICAgICAgICB0aGlzLmVuc3VyZVVJVHJhbnNmb3JtQ29tcG9uZW50KHJlc3VsdE5vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5Y+R6YCB5re75Yqg6IqC54K55LqL5Lu277yM5re75Yqg6IqC54K55Lit55qE5qC56IqC54K5XHJcbiAgICAgICAgdGhpcy5lbWl0KCdub2RlOmFkZCcsIHJlc3VsdE5vZGUpO1xyXG5cclxuICAgICAgICAvLyDlj5HpgIHoioLngrnkv67mlLnmtojmga9cclxuICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnbm9kZTpjaGFuZ2UnLCBwYXJlbnQsIHsgdHlwZTogTm9kZUV2ZW50VHlwZS5DSElMRF9DSEFOR0VEIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHNjZW5lVXRpbHMuZ2VuZXJhdGVOb2RlSW5mbyhyZXN1bHROb2RlLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluaIluWIm+W7uui3r+W+hOiKgueCuVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFzeW5jIF9nZXRPckNyZWF0ZU5vZGVCeVBhdGgocGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkKTogUHJvbWlzZTxOb2RlIHwgbnVsbD4ge1xyXG4gICAgICAgIGlmICghcGF0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOWFiOWwneivleiOt+WPlueOsOacieiKgueCuVxyXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IE5vZGVNZ3IuZ2V0Tm9kZUJ5UGF0aChwYXRoKTtcclxuICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDlpoLmnpzkuI3lrZjlnKjvvIzliJnliJvlu7rot6/lvoRcclxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fZW5zdXJlUGF0aEV4aXN0cyhwYXRoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOehruS/nei3r+W+hOWtmOWcqO+8jOWmguaenOS4jeWtmOWcqOWImeWIm+W7uuepuuiKgueCuVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFzeW5jIF9lbnN1cmVQYXRoRXhpc3RzKHBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCk6IFByb21pc2U8Tm9kZSB8IG51bGw+IHtcclxuICAgICAgICBpZiAoIXBhdGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjdXJyZW50U2NlbmUgPSBTZXJ2aWNlLkVkaXRvci5nZXRSb290Tm9kZSgpO1xyXG4gICAgICAgIGlmICghY3VycmVudFNjZW5lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5YiG5Ymy6Lev5b6EXHJcbiAgICAgICAgY29uc3QgcGF0aFBhcnRzID0gcGF0aC5zcGxpdCgnLycpLmZpbHRlcihwYXJ0ID0+IHBhcnQudHJpbSgpICE9PSAnJyk7XHJcbiAgICAgICAgaWYgKHBhdGhQYXJ0cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgY3VycmVudFBhcmVudDogTm9kZSA9IGN1cnJlbnRTY2VuZTtcclxuXHJcbiAgICAgICAgLy8g6YCQ57qn5qOA5p+l5bm25Yib5bu66Lev5b6EXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoUGFydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgcGF0aFBhcnQgPSBwYXRoUGFydHNbaV07XHJcbiAgICAgICAgICAgIGxldCBuZXh0Tm9kZSA9IGN1cnJlbnRQYXJlbnQuZ2V0Q2hpbGRCeU5hbWUocGF0aFBhcnQpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhdGhQYXJ0ID09PSAnQ2FudmFzJykge1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHROb2RlID0gYXdhaXQgdGhpcy5jaGVja0NhbnZhc1JlcXVpcmVkKCcyZCcsIHRydWUsIGN1cnJlbnRQYXJlbnQsIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWIm+W7uuepuuiKgueCuVxyXG4gICAgICAgICAgICAgICAgICAgIG5leHROb2RlID0gbmV3IE5vZGUocGF0aFBhcnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOiuvue9rueItue6p1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHROb2RlLnNldFBhcmVudChjdXJyZW50UGFyZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDnoa7kv53mlrDliJvlu7rnmoToioLngrnmnInlv4XopoHnmoTnu4Tku7ZcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVuc3VyZVVJVHJhbnNmb3JtQ29tcG9uZW50KG5leHROb2RlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5Y+R6YCB6IqC54K55Yib5bu65LqL5Lu2XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdub2RlOmFkZCcsIG5leHROb2RlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIW5leHROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBjcmVhdGUgbm9kZTogdGhlIHBhdGggJHtwYXRofSBpcyBub3QgdmFsaWQuYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY3VycmVudFBhcmVudCA9IG5leHROb2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYXJlbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZGVsZXRlTm9kZShwYXJhbXM6IElEZWxldGVOb2RlUGFyYW1zKTogUHJvbWlzZTxJRGVsZXRlTm9kZVJlc3VsdCB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBwYXRoID0gcGFyYW1zLnBhdGg7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IE5vZGVNZ3IuZ2V0Tm9kZUJ5UGF0aChwYXRoKTtcclxuICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDlj5HpgIHoioLngrnkv67mlLnmtojmga9cclxuICAgICAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudDtcclxuICAgICAgICB0aGlzLmVtaXQoJ25vZGU6YmVmb3JlLXJlbW92ZScsIG5vZGUpO1xyXG4gICAgICAgIGlmIChwYXJlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5lbWl0KCdub2RlOmJlZm9yZS1jaGFuZ2UnLCBwYXJlbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbm9kZS5zZXRQYXJlbnQobnVsbCwgcGFyYW1zLmtlZXBXb3JsZFRyYW5zZm9ybSk7XHJcbiAgICAgICAgbm9kZS5fb2JqRmxhZ3MgfD0gQ0NPYmplY3QuRmxhZ3MuRGVzdHJveWVkO1xyXG4gICAgICAgIC8vIDMuNi4xIOeJueauiiBoYWNr77yM6K+35Zyo5ZCO57ut54mI5pys56e76ZmkXHJcbiAgICAgICAgLy8g55u45YWz5L+u5aSNIHByOiBodHRwczovL2dpdGh1Yi5jb20vY29jb3MvY29jb3MtZWRpdG9yL3B1bGwvODkwXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy5fd2Fsa05vZGUobm9kZSwgKGNoaWxkOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLl9vYmpGbGFncyB8PSBDQ09iamVjdC5GbGFncy5EZXN0cm95ZWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihlcnJvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVtaXQoJ25vZGU6cmVtb3ZlJywgbm9kZSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHBhdGg6IHBhdGgsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF93YWxrTm9kZShub2RlOiBOb2RlLCBmdW5jOiBGdW5jdGlvbikge1xyXG4gICAgICAgIG5vZGUgJiYgbm9kZS5jaGlsZHJlbiAmJiBub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XHJcbiAgICAgICAgICAgIGZ1bmMoY2hpbGQpO1xyXG4gICAgICAgICAgICB0aGlzLl93YWxrTm9kZShjaGlsZCwgZnVuYyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgdXBkYXRlTm9kZShwYXJhbXM6IElVcGRhdGVOb2RlUGFyYW1zKTogUHJvbWlzZTxJVXBkYXRlTm9kZVJlc3VsdD4ge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBOb2RlTWdyLmdldE5vZGVCeVBhdGgocGFyYW1zLnBhdGgpO1xyXG4gICAgICAgIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYOabtOaWsOiKgueCueWksei0pe+8jOaXoOazlemAmui/hyAke3BhcmFtcy5wYXRofSDmn6Xor6LliLDoioLngrlgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZW1pdCgnbm9kZTpiZWZvcmUtY2hhbmdlJywgbm9kZSk7XHJcbiAgICAgICAgLy8gVE9ETyDlsJHkuoYgcGFyZW50IOWxnuaAp+eahOiuvue9rlxyXG4gICAgICAgIC8vIGlmIChwYXRoID09PSAncGFyZW50JyAmJiBub2RlLnBhcmVudCkge1xyXG4gICAgICAgIC8vICAgLy8g5Y+R6YCB6IqC54K55L+u5pS55raI5oGvXHJcbiAgICAgICAgLy8gICAvLyB0aGlzLmVtaXQoJ2JlZm9yZS1jaGFuZ2UnLCBub2RlLnBhcmVudCk7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICBpZiAocGFyYW1zLm5hbWUgJiYgcGFyYW1zLm5hbWUgIT09IG5vZGUubmFtZSkge1xyXG4gICAgICAgICAgICBOb2RlTWdyLnVwZGF0ZU5vZGVOYW1lKG5vZGUudXVpZCwgcGFyYW1zLm5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUT0RPIOi/memHjOmcgOimgeaMieeFpyAzeCDnlKggc2V0UHJvcGVydHkg55qE5pa55byP5Y676LWL5YC877yM5Zug5Li6IHByZWZhYiDpgqPovrnpnIDopoEgcGF0aFxyXG4gICAgICAgIGNvbnN0IHBhdGhzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIGlmIChwYXJhbXMucHJvcGVydGllcykge1xyXG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0gcGFyYW1zLnByb3BlcnRpZXM7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmFjdGl2ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLmFjdGl2ZSA9IG9wdGlvbnMuYWN0aXZlO1xyXG4gICAgICAgICAgICAgICAgcGF0aHMucHVzaCgnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMucG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIG5vZGUuc2V0UG9zaXRpb24ob3B0aW9ucy5wb3NpdGlvbiBhcyBWZWMzKTtcclxuICAgICAgICAgICAgICAgIHBhdGhzLnB1c2goJ3Bvc2l0aW9uJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gaWYgKG9wdGlvbnMud29ybGRQb3NpdGlvbikge1xyXG4gICAgICAgICAgICAvLyAgICAgbm9kZS5zZXRXb3JsZFBvc2l0aW9uKG9wdGlvbnMud29ybGRQb3NpdGlvbiBhcyBWZWMzKTtcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5yb3RhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5yb3RhdGlvbiA9IG9wdGlvbnMucm90YXRpb24gYXMgUXVhdDtcclxuICAgICAgICAgICAgICAgIHBhdGhzLnB1c2goJ3JvdGF0aW9uJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gaWYgKG9wdGlvbnMud29ybGRSb3RhdGlvbikge1xyXG4gICAgICAgICAgICAvLyAgICAgbm9kZS53b3JsZFJvdGF0aW9uID0gb3B0aW9ucy53b3JsZFJvdGF0aW9uIGFzIFF1YXQ7XHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXVsZXJBbmdsZXMpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUuZXVsZXJBbmdsZXMgPSBvcHRpb25zLmV1bGVyQW5nbGVzIGFzIFZlYzM7XHJcbiAgICAgICAgICAgICAgICBwYXRocy5wdXNoKCdldWxlckFuZ2xlcycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGlmIChvcHRpb25zLmFuZ2xlKSB7XHJcbiAgICAgICAgICAgIC8vICAgICBub2RlLmFuZ2xlID0gb3B0aW9ucy5hbmdsZTtcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zY2FsZSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5zY2FsZSA9IG9wdGlvbnMuc2NhbGUgYXMgVmVjMztcclxuICAgICAgICAgICAgICAgIHBhdGhzLnB1c2goJ3NjYWxlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gaWYgKG9wdGlvbnMud29ybGRTY2FsZSkge1xyXG4gICAgICAgICAgICAvLyAgICAgbm9kZS53b3JsZFNjYWxlID0gb3B0aW9ucy53b3JsZFNjYWxlIGFzIFZlYzM7XHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgLy8gaWYgKG9wdGlvbnMuZm9yd2FyZCkge1xyXG4gICAgICAgICAgICAvLyAgICAgbm9kZS5mb3J3YXJkID0gb3B0aW9ucy5mb3J3YXJkIGFzIFZlYzM7XHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMubW9iaWxpdHkpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUubW9iaWxpdHkgPSBvcHRpb25zLm1vYmlsaXR5O1xyXG4gICAgICAgICAgICAgICAgcGF0aHMucHVzaCgnbW9iaWxpdHknKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5sYXllcikge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5sYXllciA9IG9wdGlvbnMubGF5ZXI7XHJcbiAgICAgICAgICAgICAgICBwYXRocy5wdXNoKCdsYXllcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGlmIChvcHRpb25zLmhhc0NoYW5nZWRGbGFncykge1xyXG4gICAgICAgICAgICAvLyAgICAgbm9kZS5oYXNDaGFuZ2VkRmxhZ3MgPSBvcHRpb25zLmhhc0NoYW5nZWRGbGFncztcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaW5mbyA9IHtcclxuICAgICAgICAgICAgcGF0aDogTm9kZU1nci5nZXROb2RlUGF0aChub2RlKSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgcGF0aHMpIHtcclxuICAgICAgICAgICAgdGhpcy5lbWl0KCdub2RlOmNoYW5nZScsIG5vZGUsIHsgdHlwZTogTm9kZUV2ZW50VHlwZS5TRVRfUFJPUEVSVFksIHByb3BQYXRoOiBwYXRoIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVE9ETyDlsJHkuoYgcGFyZW50IOWxnuaAp+eahOiuvue9rlxyXG4gICAgICAgIC8vIOaUueWPmOeItuWtkOWFs+ezu1xyXG4gICAgICAgIC8vIGlmIChwYXRoID09PSAncGFyZW50JyAmJiBub2RlLnBhcmVudCkge1xyXG4gICAgICAgIC8vICAgICAvLyDlj5HpgIHoioLngrnkv67mlLnmtojmga9cclxuICAgICAgICAvLyAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnLCBub2RlLnBhcmVudCwgeyB0eXBlOiBOb2RlT3BlcmF0aW9uVHlwZS5TRVRfUFJPUEVSVFksIHByb3BQYXRoOiAnY2hpbGRyZW4nLCByZWNvcmQ6IHJlY29yZCB9KTtcclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgcmV0dXJuIGluZm87XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcXVlcnlOb2RlKHBhcmFtczogSVF1ZXJ5Tm9kZVBhcmFtcyk6IFByb21pc2U8SU5vZGUgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IE5vZGVNZ3IuZ2V0Tm9kZUJ5UGF0aChwYXJhbXMucGF0aCk7XHJcbiAgICAgICAgaWYgKCFub2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc2NlbmVVdGlscy5nZW5lcmF0ZU5vZGVJbmZvKG5vZGUsIHBhcmFtcy5xdWVyeUNoaWxkcmVuIHx8IGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOehruS/neiKgueCueaciSBVSVRyYW5zZm9ybSDnu4Tku7ZcclxuICAgICAqIOebruWJjeWPqumcgOS/nemanOWcqOWIm+W7uuepuuiKgueCueeahOaXtuWAmeajgOafpeS7u+aEj+S4iue6p+aYr+WQpuS4uiBjYW52YXNcclxuICAgICAqL1xyXG4gICAgZW5zdXJlVUlUcmFuc2Zvcm1Db21wb25lbnQobm9kZTogTm9kZSkge1xyXG4gICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgY2MuTm9kZSAmJiBub2RlLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyDnqbroioLngrlcclxuICAgICAgICAgICAgbGV0IGluc2lkZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsZXQgcGFyZW50ID0gbm9kZS5wYXJlbnQ7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAocGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRzID0gcGFyZW50LmNvbXBvbmVudHMubWFwKChjb21wKSA9PiBjYy5qcy5nZXRDbGFzc05hbWUoY29tcC5jb25zdHJ1Y3RvcikpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudHMuaW5jbHVkZXMoJ2NjLkNhbnZhcycpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zaWRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpbnNpZGUpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5hZGRDb21wb25lbnQoJ2NjLlVJVHJhbnNmb3JtJyk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qOA5p+l5bm25qC55o2u6ZyA6KaB5Yib5bu6IGNhbnZhc+iKgueCueaIluS4uueItue6p+a3u+WKoFVJVHJhbnNmb3Jt57uE5Lu277yM6L+U5Zue54i257qn6IqC54K577yM5aaC5p6c6ZyA6KaBY2FudmFz6IqC54K577yM5YiZ54i257qn6IqC54K55Lya5pivY2FudmFz6IqC54K5XHJcbiAgICAgKiBAcGFyYW0gd29ya01vZGVcclxuICAgICAqIEBwYXJhbSBjYW52YXNSZXF1aXJlZFBhcmFtXHJcbiAgICAgKiBAcGFyYW0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0gcG9zaXRpb25cclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGNoZWNrQ2FudmFzUmVxdWlyZWQod29ya01vZGU6IHN0cmluZywgY2FudmFzUmVxdWlyZWRQYXJhbTogYm9vbGVhbiB8IHVuZGVmaW5lZCwgcGFyZW50OiBOb2RlIHwgbnVsbCwgcG9zaXRpb246IFZlYzMgfCB1bmRlZmluZWQpOiBQcm9taXNlPE5vZGUgfCBudWxsPiB7XHJcblxyXG4gICAgICAgIGlmIChjYW52YXNSZXF1aXJlZFBhcmFtICYmIHBhcmVudD8uaXNWYWxpZCkge1xyXG4gICAgICAgICAgICBsZXQgY2FudmFzTm9kZTogTm9kZSB8IG51bGw7XHJcblxyXG4gICAgICAgICAgICBjYW52YXNOb2RlID0gZ2V0VUlDYW52YXNOb2RlKHBhcmVudCk7XHJcbiAgICAgICAgICAgIGlmIChjYW52YXNOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSBjYW52YXNOb2RlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDoh6rliqjliJvlu7rkuIDkuKogY2FudmFzIOiKgueCuVxyXG4gICAgICAgICAgICBpZiAoIWNhbnZhc05vZGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRPRE8g6L+Z6YeM5Lya5a+86Ie05aaC5p6c5ZyoIDNEIOWcuuaZr+S4i+WIm+W7uiAyZCBjYW52YXMg5pGE5YOP5py655qE5LyY5YWI57qn6Lef5Li75pGE5YOP5py65LiA5qC377yMXHJcbiAgICAgICAgICAgICAgICAvLyAg5a+86Ie05pi+56S65LiN5Ye6IFVJIOadpe+8jOWFiOmDveeUqCB1aSBjYW52YXNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbnZhc0Fzc2V0VXVpZCA9ICdmNzczZGIyMS02MmI4LTQ1NDAtOTU2YS0yOWJhY2Y1ZGRiZjUnO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIC8vIDJkIOmhueebruWIm+W7uueahCB1aSDoioLngrnvvIxjYW52YXMg5LiL55qEIGNhbWVyYSDnmoQgdmlzaWJpbGl0eSDpu5jorqTli77kuIogZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgLy8gaWYgKHdvcmtNb2RlID09PSAnMmQnKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FudmFzQXNzZXRVdWlkID0gJzRjMzM2MDBlLTljYTktNDgzYi1iNzM0LTk0NjAwODI2MTY5Nyc7XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FudmFzQXNzZXQgPSBhd2FpdCBsb2FkQW55PFByZWZhYj4oY2FudmFzQXNzZXRVdWlkKTtcclxuICAgICAgICAgICAgICAgIGNhbnZhc05vZGUgPSBjYy5pbnN0YW50aWF0ZShjYW52YXNBc3NldCkgYXMgTm9kZTtcclxuICAgICAgICAgICAgICAgIFNlcnZpY2UuUHJlZmFiLnJlbW92ZVByZWZhYkluZm9Gcm9tTm9kZShjYW52YXNOb2RlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50LmFkZENoaWxkKGNhbnZhc05vZGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gY2FudmFzTm9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8g55uu5YmNIGNhbnZhcyDpu5jorqQgeiDkuLogMe+8jOiAjOaLluaUvuWIsCBDYW52YXMg55qE5o6n5Lu25Zug5Li65qOA5rWL55qE5pivIHog5Li6IDAg55qE5bmz6Z2i77yM5omA5Lul6L+Z6L655YWI5by65Yi25oqKIHog6K6+572u5Li65ZKMIGNhbnZhcyDnmoTkuIDmoLdcclxuICAgICAgICAgICAgaWYgKHBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbi56ID0gY2FudmFzTm9kZS5wb3NpdGlvbi56O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYXJlbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uRWRpdG9yT3BlbmVkKCkge1xyXG4gICAgICAgIGNvbnN0IG5vZGVNYXAgPSBOb2RlTWdyLmdldE5vZGVzSW5TY2VuZSgpO1xyXG4gICAgICAgIC8vIOWcuuaZr+i9veWFpeWQjuimgeWwhueOsOacieiKgueCueebkeWQrOaJgOmcgOS6i+S7tlxyXG4gICAgICAgIE9iamVjdC5rZXlzKG5vZGVNYXApLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyRXZlbnRMaXN0ZW5lcnMobm9kZU1hcFtrZXldKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyTm9kZU1nckV2ZW50cygpO1xyXG4gICAgICAgIFNlcnZpY2UuQ29tcG9uZW50LmluaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25FZGl0b3JDbG9zZWQoKSB7XHJcbiAgICAgICAgU2VydmljZS5Db21wb25lbnQudW5yZWdpc3RlckNvbXBNZ3JFdmVudHMoKTtcclxuICAgICAgICB0aGlzLnVucmVnaXN0ZXJOb2RlTWdyRXZlbnRzKCk7XHJcbiAgICAgICAgY29uc3Qgbm9kZU1hcCA9IE5vZGVNZ3IuZ2V0Tm9kZXMoKTtcclxuICAgICAgICBPYmplY3Qua2V5cyhub2RlTWFwKS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgdGhpcy51bnJlZ2lzdGVyRXZlbnRMaXN0ZW5lcnMobm9kZU1hcFtrZXldKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBOb2RlTWdyLmNsZWFyKCk7XHJcbiAgICAgICAgRWRpdG9yRXh0ZW5kcy5Db21wb25lbnQuY2xlYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tXHJcblxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBOb2RlSGFuZGxlcnMgPSB7XHJcbiAgICAgICAgW05vZGUuRXZlbnRUeXBlLlRSQU5TRk9STV9DSEFOR0VEXTogJ29uTm9kZVRyYW5zZm9ybUNoYW5nZWQnLFxyXG4gICAgICAgIFtOb2RlLkV2ZW50VHlwZS5TSVpFX0NIQU5HRURdOiAnb25Ob2RlU2l6ZUNoYW5nZWQnLFxyXG4gICAgICAgIFtOb2RlLkV2ZW50VHlwZS5BTkNIT1JfQ0hBTkdFRF06ICdvbk5vZGVBbmNob3JDaGFuZ2VkJyxcclxuICAgICAgICBbTm9kZS5FdmVudFR5cGUuQ0hJTERfQURERURdOiAnb25Ob2RlUGFyZW50Q2hhbmdlZCcsXHJcbiAgICAgICAgW05vZGUuRXZlbnRUeXBlLkNISUxEX1JFTU9WRURdOiAnb25Ob2RlUGFyZW50Q2hhbmdlZCcsXHJcbiAgICAgICAgW05vZGUuRXZlbnRUeXBlLkxJR0hUX1BST0JFX0NIQU5HRURdOiAnb25MaWdodFByb2JlQ2hhbmdlZCcsXHJcbiAgICB9IGFzIGNvbnN0O1xyXG4gICAgcHJpdmF0ZSBub2RlSGFuZGxlcnMgPSBuZXcgTWFwPHN0cmluZywgRnVuY3Rpb24+KCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnm5HlkKzlvJXmk47lj5Hlh7rnmoQgbm9kZSDkuovku7ZcclxuICAgICAqIEBwYXJhbSB7Kn0gbm9kZVxyXG4gICAgICovXHJcbiAgICByZWdpc3RlckV2ZW50TGlzdGVuZXJzKG5vZGU6IE5vZGUpIHtcclxuICAgICAgICBpZiAoIW5vZGUgfHwgIW5vZGUuaXNWYWxpZCB8fCBpc0VkaXRvck5vZGUobm9kZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g6YGN5Y6G5LqL5Lu25pig5bCE6KGo77yM57uf5LiA5rOo5YaM5LqL5Lu2XHJcbiAgICAgICAgT2JqZWN0LmVudHJpZXModGhpcy5Ob2RlSGFuZGxlcnMpLmZvckVhY2goKFtldmVudFR5cGUsIGhhbmRsZXJOYW1lXSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBib3VuZEhhbmRsZXIgPSAodGhpcyBhcyBhbnkpW2hhbmRsZXJOYW1lXS5iaW5kKHRoaXMsIG5vZGUpO1xyXG4gICAgICAgICAgICBub2RlLm9uKGV2ZW50VHlwZSwgYm91bmRIYW5kbGVyLCB0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5ub2RlSGFuZGxlcnMuc2V0KGAke2V2ZW50VHlwZX1fJHtub2RlLnV1aWR9YCwgYm91bmRIYW5kbGVyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWPlua2iOebkeWQrOW8leaTjuWPkeWHuueahG5vZGXkuovku7ZcclxuICAgICAqIEBwYXJhbSB7Kn0gbm9kZVxyXG4gICAgICovXHJcbiAgICB1bnJlZ2lzdGVyRXZlbnRMaXN0ZW5lcnMobm9kZTogTm9kZSkge1xyXG4gICAgICAgIGlmICghbm9kZSB8fCAhbm9kZS5pc1ZhbGlkIHx8IGlzRWRpdG9yTm9kZShub2RlKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDpgY3ljobkuovku7bmmKDlsITooajvvIznu5/kuIDlj5bmtojkuovku7ZcclxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLk5vZGVIYW5kbGVycykuZm9yRWFjaChldmVudFR5cGUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtldmVudFR5cGV9XyR7bm9kZS51dWlkfWA7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLm5vZGVIYW5kbGVycy5nZXQoa2V5KTtcclxuICAgICAgICAgICAgaWYgKGhhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUub2ZmKGV2ZW50VHlwZSwgaGFuZGxlcik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVIYW5kbGVycy5kZWxldGUoa2V5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVhZG9ubHkgTm9kZU1nckV2ZW50SGFuZGxlcnMgPSB7XHJcbiAgICAgICAgWydhZGQnXTogJ2FkZCcsXHJcbiAgICAgICAgWydjaGFuZ2UnXTogJ2NoYW5nZScsXHJcbiAgICAgICAgWydyZW1vdmUnXTogJ3JlbW92ZScsXHJcbiAgICB9IGFzIGNvbnN0O1xyXG4gICAgcHJpdmF0ZSBub2RlTWdyRXZlbnRIYW5kbGVycyA9IG5ldyBNYXA8c3RyaW5nLCAoLi4uYXJnczogW10pID0+IHZvaWQ+KCk7XHJcbiAgICAvKipcclxuICAgICAqIOazqOWGjOW8leaTjiBOb2RlIOeuoeeQhuebuOWFs+S6i+S7tueahOebkeWQrFxyXG4gICAgICovXHJcbiAgICByZWdpc3Rlck5vZGVNZ3JFdmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy51bnJlZ2lzdGVyTm9kZU1nckV2ZW50cygpO1xyXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHRoaXMuTm9kZU1nckV2ZW50SGFuZGxlcnMpLmZvckVhY2goKFtldmVudFR5cGUsIGhhbmRsZXJOYW1lXSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gKHRoaXMgYXMgYW55KVtoYW5kbGVyTmFtZV0uYmluZCh0aGlzKTtcclxuICAgICAgICAgICAgTm9kZU1nci5vbihldmVudFR5cGUsIGhhbmRsZXIpO1xyXG4gICAgICAgICAgICB0aGlzLm5vZGVNZ3JFdmVudEhhbmRsZXJzLnNldChldmVudFR5cGUsIGhhbmRsZXIpO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgTm9kZU1nciBvbiAke2V2ZW50VHlwZX1gKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1bnJlZ2lzdGVyTm9kZU1nckV2ZW50cygpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGV2ZW50VHlwZSBvZiB0aGlzLm5vZGVNZ3JFdmVudEhhbmRsZXJzLmtleXMoKSkge1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5ub2RlTWdyRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRUeXBlKTtcclxuICAgICAgICAgICAgaWYgKGhhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgIE5vZGVNZ3Iub2ZmKGV2ZW50VHlwZSwgaGFuZGxlcik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVNZ3JFdmVudEhhbmRsZXJzLmRlbGV0ZShldmVudFR5cGUpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYE5vZGVNZ3Igb2ZmICR7ZXZlbnRUeXBlfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uTm9kZVRyYW5zZm9ybUNoYW5nZWQgKG5vZGU6IE5vZGUsIHRyYW5zZm9ybUJpdDogVHJhbnNmb3JtQml0KSB7XHJcbiAgICAgICAgY29uc3QgY2hhbmdlT3B0czogSUNoYW5nZU5vZGVPcHRpb25zID0geyB0eXBlOiBOb2RlRXZlbnRUeXBlLlRSQU5TRk9STV9DSEFOR0VELCBzb3VyY2U6IEV2ZW50U291cmNlVHlwZS5FTkdJTkUgfTtcclxuXHJcbiAgICAgICAgc3dpdGNoICh0cmFuc2Zvcm1CaXQpIHtcclxuICAgICAgICAgICAgY2FzZSBOb2RlLlRyYW5zZm9ybUJpdC5QT1NJVElPTjpcclxuICAgICAgICAgICAgICAgIGNoYW5nZU9wdHMucHJvcFBhdGggPSAncG9zaXRpb24nO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTm9kZS5UcmFuc2Zvcm1CaXQuUk9UQVRJT046XHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcHRzLnByb3BQYXRoID0gJ3JvdGF0aW9uJztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIE5vZGUuVHJhbnNmb3JtQml0LlNDQUxFOlxyXG4gICAgICAgICAgICAgICAgY2hhbmdlT3B0cy5wcm9wUGF0aCA9ICdzY2FsZSc7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZW1pdCgnbm9kZTpjaGFuZ2UnLCBub2RlLCBjaGFuZ2VPcHRzKTtcclxuICAgIH1cclxuXHJcbiAgICBvbk5vZGVTaXplQ2hhbmdlZCAobm9kZTogTm9kZSkge1xyXG4gICAgICAgIGNvbnN0IGNoYW5nZU9wdHM6IElDaGFuZ2VOb2RlT3B0aW9ucyA9IHsgdHlwZTogTm9kZUV2ZW50VHlwZS5TSVpFX0NIQU5HRUQsIHNvdXJjZTogRXZlbnRTb3VyY2VUeXBlLkVOR0lORSB9O1xyXG4gICAgICAgIGNvbnN0IHVpVHJhbnNmb3JtID0gbm9kZS5nZXRDb21wb25lbnQoVUlUcmFuc2Zvcm0pO1xyXG4gICAgICAgIGlmICh1aVRyYW5zZm9ybSkge1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IG5vZGUuY29tcG9uZW50cy5pbmRleE9mKHVpVHJhbnNmb3JtKTtcclxuICAgICAgICAgICAgY2hhbmdlT3B0cy5wcm9wUGF0aCA9IGBfY29tcG9uZW50cy4ke2luZGV4fS5jb250ZW50U2l6ZWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZW1pdCgnbm9kZTpjaGFuZ2UnLCBub2RlLCBjaGFuZ2VPcHRzKTtcclxuICAgIH1cclxuXHJcbiAgICBvbk5vZGVBbmNob3JDaGFuZ2VkIChub2RlOiBOb2RlKSB7XHJcbiAgICAgICAgY29uc3QgY2hhbmdlT3B0czogSUNoYW5nZU5vZGVPcHRpb25zID0geyB0eXBlOiBOb2RlRXZlbnRUeXBlLkFOQ0hPUl9DSEFOR0VELCBzb3VyY2U6IEV2ZW50U291cmNlVHlwZS5FTkdJTkUgfTtcclxuICAgICAgICBjb25zdCB1aVRyYW5zZm9ybSA9IG5vZGUuZ2V0Q29tcG9uZW50KFVJVHJhbnNmb3JtKTtcclxuICAgICAgICBpZiAodWlUcmFuc2Zvcm0pIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBub2RlLmNvbXBvbmVudHMuaW5kZXhPZih1aVRyYW5zZm9ybSk7XHJcbiAgICAgICAgICAgIGNoYW5nZU9wdHMucHJvcFBhdGggPSBgX2NvbXBvbmVudHMuJHtpbmRleH0uYW5jaG9yUG9pbnRgO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVtaXQoJ25vZGU6Y2hhbmdlJywgbm9kZSwgY2hhbmdlT3B0cyk7XHJcbiAgICB9XHJcblxyXG4gICAgb25Ob2RlUGFyZW50Q2hhbmdlZCAocGFyZW50OiBOb2RlLCBjaGlsZDogTm9kZSkge1xyXG4gICAgICAgIGlmIChpc0VkaXRvck5vZGUoY2hpbGQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZW1pdCgnbm9kZTpjaGFuZ2UnLCBwYXJlbnQsIHsgdHlwZTogTm9kZUV2ZW50VHlwZS5DSElMRF9DSEFOR0VEIH0pO1xyXG5cclxuICAgICAgICAvLyDoh6rouqsgcGFyZW50ID0gbnVsbCDkuLrliKDpmaTvvIzmnIDlkI7kvJrmnIkgZGVsZXRlZCDmtojmga/vvIzmiYDku6XkuI3pnIDopoHlho3lj5EgY2hhbmdlZCDmtojmga9cclxuICAgICAgICBpZiAoY2hpbGQucGFyZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnbm9kZTpjaGFuZ2UnLCBjaGlsZCwgeyB0eXBlOiBOb2RlRXZlbnRUeXBlLlBBUkVOVF9DSEFOR0VEIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvbkxpZ2h0UHJvYmVDaGFuZ2VkKG5vZGU6IE5vZGUpIHtcclxuICAgICAgICBjb25zdCBjaGFuZ2VPcHRzOiBJQ2hhbmdlTm9kZU9wdGlvbnMgPSB7IHR5cGU6IE5vZGVFdmVudFR5cGUuTElHSFRfUFJPQkVfQ0hBTkdFRCwgc291cmNlOiBFdmVudFNvdXJjZVR5cGUuRU5HSU5FIH07XHJcbiAgICAgICAgdGhpcy5lbWl0KCdub2RlOmNoYW5nZScsIG5vZGUsIGNoYW5nZU9wdHMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5LiA5Liq6IqC54K55Yiw566h55CG5Zmo5YaFXHJcbiAgICAgKiBAcGFyYW0gdXVpZFxyXG4gICAgICogQHBhcmFtIHsqfSBub2RlXHJcbiAgICAgKi9cclxuICAgIGFkZCh1dWlkOiBzdHJpbmcsIG5vZGU6IE5vZGUpIHtcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyRXZlbnRMaXN0ZW5lcnMobm9kZSk7XHJcblxyXG4gICAgICAgIGlmICghaXNFZGl0b3JOb2RlKG5vZGUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnbm9kZTphZGRlZCcsIG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS4gOS4quiKgueCueiiq+S/ruaUuSznlLEgRWRpdG9yRXh0ZW5kcy5Ob2RlLmVtaXQoJ2NoYW5nZScpIOinpuWPkVxyXG4gICAgICogQHBhcmFtIHV1aWRcclxuICAgICAqIEBwYXJhbSBub2RlXHJcbiAgICAgKi9cclxuICAgIGNoYW5nZSh1dWlkOiBzdHJpbmcsIG5vZGU6IE5vZGUpIHtcclxuICAgICAgICBpZiAoIWlzRWRpdG9yTm9kZShub2RlKSkge1xyXG4gICAgICAgICAgICAvLyDov5nph4zmmK/lm6DkuLogTE9EIOe7hOS7tuWcqOaMguWIsOWcuuaZr+eahOaXtuWAme+8jOS/ruaUueS6huiHquW3seeahOaVsOaNru+8jOS9hue8lui+keWZqOaaguaXtuaXoOazleefpemBk+S/ruaUueS6huWTquS6m+aVsOaNrlxyXG4gICAgICAgICAgICAvLyDmiYDku6Xpkojlr7kgTE9EIOmDqOWIhu+8jOWinuWKoOS6hiBwcm9wUGF0aCwgcHJlZmFiIOaJjeiDveato+W4uOS/ruaUuVxyXG4gICAgICAgICAgICBsZXQgcGF0aCA9ICcnO1xyXG4gICAgICAgICAgICBjb25zdCBsb2RHcm91cCA9IG5vZGUuZ2V0Q29tcG9uZW50KExPREdyb3VwKTtcclxuICAgICAgICAgICAgaWYgKGxvZEdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IG5vZGUuY29tcG9uZW50cy5pbmRleE9mKGxvZEdyb3VwKTtcclxuICAgICAgICAgICAgICAgIHBhdGggPSBgX19jb21wc19fLiR7aW5kZXh9YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ25vZGU6Y2hhbmdlJywgbm9kZSwgeyB0eXBlOiBOb2RlRXZlbnRUeXBlLlNFVF9QUk9QRVJUWSwgcHJvcFBhdGg6IHBhdGggfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LuO566h55CG5Zmo5YaF56e76Zmk5LiA5Liq5oyH5a6a55qE6IqC54K5XHJcbiAgICAgKiBAcGFyYW0gdXVpZFxyXG4gICAgICogQHBhcmFtIHsqfSBub2RlXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZSh1dWlkOiBzdHJpbmcsIG5vZGU6IE5vZGUpIHtcclxuICAgICAgICB0aGlzLnVucmVnaXN0ZXJFdmVudExpc3RlbmVycyhub2RlKTtcclxuICAgICAgICBpZiAoIWlzRWRpdG9yTm9kZShub2RlKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ25vZGU6cmVtb3ZlZCcsIG5vZGUsIHsgc291cmNlOiBFdmVudFNvdXJjZVR5cGUuRU5HSU5FIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuIl19