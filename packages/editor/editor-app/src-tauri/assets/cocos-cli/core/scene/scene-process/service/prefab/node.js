"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeOperation = void 0;
const cc_1 = require("cc");
const utils_1 = require("./utils");
const component_1 = require("./component");
const util_1 = require("util");
const node_utils_1 = require("../node/node-utils");
const core_1 = require("../core");
const common_1 = require("../../../common");
const rpc_1 = require("../../rpc");
const timer_util_1 = require("./timer-util");
const nodeMgr = EditorExtends.Node;
const compMgr = EditorExtends.Component;
const PrefabInfo = cc_1.Prefab._utils.PrefabInfo;
const PropertyOverrideInfo = cc_1.Prefab._utils.PropertyOverrideInfo;
const CompPrefabInfo = cc_1.Prefab._utils.CompPrefabInfo;
const TargetInfo = cc_1.Prefab._utils.TargetInfo;
const TargetOverrideInfo = cc_1.Prefab._utils.TargetOverrideInfo;
// scale 默认不 override，因为模型往往缩放有问题，这样重导后就直接生效了
const RootReservedProperty = ['_name', '_lpos', '_lrot', '_euler'];
const compKey = '_components';
// 在 diff 比较剔除的一些属性
const diffExcludePropMap = {
    'cc.Node': ['_objFlags', '_parent', '_children', '_components', '_prefab', cc_1.editorExtrasTag],
    'cc.Component': ['node', '_objFlags', cc_1.editorExtrasTag],
};
function getDiffExcludeProps(ctor) {
    let props = [];
    Object.keys(diffExcludePropMap).forEach((key) => {
        const ccKls = cc_1.js.getClassByName(key);
        if (ccKls && cc_1.js.isChildClassOf(ctor, ccKls)) {
            props = props.concat(diffExcludePropMap[key]);
        }
    });
    return props;
}
// class ApplyPrefabCommand extends SceneUndoCommand {
//     public applyPrefabInfo: IApplyPrefabInfo | null = null;
//     private _undoFunc: Function;
//     private _redoFunc: Function;
//     constructor(undoFunc: Function, redoFunc: Function) {
//         super();
//         this._undoFunc = undoFunc;
//         this._redoFunc = redoFunc;
//     }
//
//     public async undo() {
//         if (this.applyPrefabInfo) {
//             await this._undoFunc(this.applyPrefabInfo);
//         }
//     }
//
//     public async redo() {
//         if (this.applyPrefabInfo) {
//             await this._redoFunc(this.applyPrefabInfo.nodeUUID);
//         }
//     }
// }
//
// // 创建预制体的自定义 undo
// // 创建前的节点 uuid 和创建后的节点 uuid 数据不一样
// class CreatePrefabCommand extends SceneUndoCommand {
//     public async undo() {
//         await this.applyData(this.undoData);
//     }
//
//     public async redo() {
//         await this.applyData(this.redoData);
//     }
// }
//
// class RevertPrefabCommand extends CreatePrefabCommand {
//     tag = 'RevertPrefabCommand';
// }
class NodeOperation {
    assetToNodesMap = new Map(); // 存储 prefab 资源和场景节点的关系表
    isRemovingMountedChildren = false;
    _timerUtil = new timer_util_1.TimerUtil();
    onSceneOpened() {
        this.assetToNodesMap.clear();
        component_1.componentOperation.clearCompCache();
        utils_1.prefabUtils.clearCache();
        for (const uuid in nodeMgr.getNodes()) {
            const node = nodeMgr.getNode(uuid);
            // 场景节点特殊处理
            if (node instanceof cc_1.Scene) {
                return;
            }
            if (node && !(0, node_utils_1.isEditorNode)(node)) {
                this.checkToAddPrefabAssetMap(node);
                node.components.forEach((comp) => {
                    component_1.componentOperation.cacheComp(comp);
                });
            }
        }
    }
    onNodeRemoved(node) {
        const prefabInfo = node['_prefab'];
        const prefabInstance = prefabInfo?.instance;
        if (prefabInstance && prefabInfo?.asset) {
            const nodes = this.assetToNodesMap.get(prefabInfo.asset._uuid);
            if (nodes) {
                const index = nodes.indexOf(node);
                if (index >= 0) {
                    nodes.splice(index, 1);
                }
            }
        }
    }
    // 修改 PrefabInstance 中节点数据，要保存在最外层的 PrefabInstance中
    checkToAddOverrides(node, inPropPath, root) {
        const prefabInfo = utils_1.prefabUtils.getPrefab(node);
        if (!node || !(0, cc_1.isValid)(node) || (prefabInfo && !(0, cc_1.isValid)(prefabInfo.asset))) {
            return;
        }
        if (!inPropPath) {
            return;
        }
        const propPath = inPropPath.replace(/^__comps__/, compKey);
        const pathKeys = (propPath || '').split('.');
        let comp = null;
        // 路径里有 __comps__ 就说明是组件
        if (inPropPath !== propPath && pathKeys[0] === compKey) {
            comp = node[pathKeys[0]][pathKeys[1]];
        }
        // 检测是否是 PrefabAsset 中的普通节点（非嵌套 Prefab 中的节点）
        const isNormalPrefabNode = prefabInfo && !prefabInfo.root?.['_prefab']?.instance;
        // 普通节点或者 mountedComponent，只需要判断是否要加 TargetOverride（在普通节点的 Component 引用到 Prefab 里的 Node 或 Component 时）
        if (!prefabInfo || isNormalPrefabNode || (comp && utils_1.prefabUtils.isMountedComponent(comp))) {
            if (root) {
                // 不能用 getDiffPropertyInfos 来判断引用，因为获取到的 differInfo 的属性路径是与修改的值不一样的，比如自定义类型数组 #13612
                // const comparedComp = componentOperation.getCachedComp(comp.uuid);
                // if (!comparedComp) {
                //     console.error(`can't get compared component of ${comp.name}`);
                //     return;
                // }
                // @ts-ignore
                // const diffInfos = this.getDiffPropertyInfos(comp, comparedComp, [],
                //          this.isInTargetOverrides.bind(this, comp, root._prefab?.targetOverrides)); // 利用偏函数传入预设参数
                // if (diffInfos && diffInfos.length > 0) {
                //     for (let i = 0; i < diffInfos.length; i++) {
                //         const info = diffInfos[i];
                //         this.checkToAddTargetOverride(comp, info, root);
                //     }
                // }
                this.addTargetOverrideWithModifyPath(node, pathKeys, root);
            }
        }
        // 如果改了组件，且 path 长度只有 2，则是设置了整个组件
        else if (comp && pathKeys.length === 2) {
            // @ts-ignore
            const props = comp.constructor.__props__;
            props.forEach((prop) => {
                const attr = cc.Class.attr(comp, prop);
                if (attr.visible !== false) {
                    this.checkToAddPropertyOverrides(node, [...pathKeys, prop], root);
                }
            });
        }
        else {
            this.checkToAddPropertyOverrides(node, pathKeys, root);
        }
    }
    /**
     * 一些组件，引擎内部会有数据更新操作，但没有统一处理，比如 lod\widget 的更新
     * 针对这些组件，需要在节点变化时，更新 override 数据
     * @param node
     * @param propPath
     * @param root
     */
    updateSpecialComponent(node, propPath, root) {
        // 有可能存在节点被删除了，但是还出发了 updateSpecialComponent
        if (!node.isValid)
            return;
        if (propPath === 'position') {
            // 更新一下 widget
            const widget = node.getComponent(cc_1.Widget);
            if (widget && !utils_1.prefabUtils.isMountedComponent(widget)) {
                const index = node.components.indexOf(widget);
                const props = {
                    isAlignLeft: 'left',
                    isAlignRight: 'right',
                    isAlignHorizontalCenter: 'horizontalCenter',
                    isAlignTop: 'top',
                    isAlignBottom: 'bottom',
                    isAbsoluteVerticalCenter: 'verticalCenter',
                };
                Object.keys(props).forEach((key) => {
                    // @ts-ignore
                    if (widget[key]) {
                        this.checkToAddPropertyOverrides(node, ['_components', `${index}`, props[key]], root);
                    }
                });
            }
        }
    }
    onAddNode(node) {
        const parentNode = node.parent;
        if (!parentNode) {
            return;
        }
        this.updateChildrenData(parentNode);
        this.createReservedPropertyOverrides(node);
    }
    onNodeAdded(node) {
        this.checkToAddPrefabAssetMap(node);
        if (core_1.Service.Editor.getCurrentEditorType() === 'prefab') {
            // prefab 模式下添加节点，需要都加 Prefab 相关的信息
            const prefabInfo = utils_1.prefabUtils.getPrefab(node);
            const rootNode = core_1.Service.Editor.getRootNode();
            if (!rootNode) {
                return;
            }
            const rootPrefabInfo = utils_1.prefabUtils.getPrefab(rootNode);
            if (!rootPrefabInfo) {
                return;
            }
            if (prefabInfo?.instance) {
                // 如果是嵌套预制体添加，它本身是有 prefabRootNode 的，不要去改变它
                prefabInfo.instance.prefabRootNode = prefabInfo.instance.prefabRootNode ?? rootPrefabInfo.root;
            }
            else {
                // 非 PrefabInstance 节点才需要添加或更新 PrefabInfo
                if (!prefabInfo || !prefabInfo.root?.['_prefab']?.instance) {
                    if (rootPrefabInfo.root) {
                        utils_1.prefabUtils.addPrefabInfo(node, rootPrefabInfo.root, rootPrefabInfo.asset);
                    }
                    else {
                        console.warn('root of PrefabInfo is null, set to root node');
                        // 将 root 指向自己
                        rootPrefabInfo.root = rootNode;
                        utils_1.prefabUtils.addPrefabInfo(node, rootPrefabInfo.root, rootPrefabInfo.asset);
                    }
                }
            }
        }
    }
    /**
     * 当一个组件需要引用到别的 PrefabInstance 中的
     * @param target 要检查的组件
     * @param diffInfo 差异数据
     * @param root 根节点
     * @returns
     */
    checkToAddTargetOverride(target, diffInfo, root) {
        if (!(target instanceof cc_1.Component)) {
            return false;
        }
        const propValue = diffInfo.value;
        // @ts-ignore
        const rootPrefabInfo = root['_prefab'];
        // 设置 Component 的某个属性为空，需要判断是否清除 TargetOverrides
        if ((propValue === null || propValue === undefined) && target) {
            utils_1.prefabUtils.removeTargetOverride(rootPrefabInfo, target, diffInfo.pathKeys);
            return false;
        }
        let checkNode = null;
        if (propValue instanceof cc_1.Node) {
            checkNode = propValue;
        }
        else if (propValue instanceof cc_1.Component) {
            checkNode = propValue.node;
        }
        if (!checkNode) {
            return false;
        }
        const checkPrefabInfo = utils_1.prefabUtils.getPrefab(checkNode);
        if (!checkPrefabInfo) {
            return false;
        }
        // 向上查找 PrefabInstance 路径
        const outMostPrefabInstanceInfo = utils_1.prefabUtils.getOutMostPrefabInstanceInfo(checkNode);
        const outMostPrefabInstanceNode = outMostPrefabInstanceInfo.outMostPrefabInstanceNode;
        if (!outMostPrefabInstanceNode) {
            return false;
        }
        if (propValue instanceof cc_1.Node && outMostPrefabInstanceNode === propValue) {
            // 最外的 Instance 根节点，不需要通过 TargetOverrides 来重新映射了，直接存场景索引就可以找到
            utils_1.prefabUtils.removeTargetOverride(rootPrefabInfo, target, diffInfo.pathKeys);
            return false;
        }
        const targetPath = outMostPrefabInstanceInfo.targetPath;
        // @ts-ignore
        const outMostPrefabInstance = outMostPrefabInstanceNode['_prefab']?.instance;
        if (outMostPrefabInstance) {
            targetPath.splice(0, 1); // 不需要存最外层的 PrefabInstance 的 fileID
            // 只处理component
            if (propValue instanceof cc_1.Node) {
                // @ts-ignore
                const prefabInfo = propValue['_prefab'];
                if (prefabInfo && prefabInfo.fileId) {
                    targetPath.push(prefabInfo.fileId);
                }
                else {
                    console.error(`can't get fileId of prefab node: ${propValue.name}`);
                    return false;
                }
            }
            else if (propValue instanceof cc_1.Component) {
                // @ts-ignore
                const compPrefabInfo = propValue.__prefab;
                if (compPrefabInfo && compPrefabInfo.fileId) {
                    targetPath.push(compPrefabInfo.fileId);
                }
                else {
                    // 非 mounted 的 component 才需要报错
                    if (!utils_1.prefabUtils.getMountedRoot(propValue)) {
                        console.error(`can't get fileId of prefab component: ${propValue.name} in node: ${propValue.node.name}`);
                    }
                    return false;
                }
            }
            // get root prefabInfo
            // scene or root in prefabAsset
            if (!root) {
                return false;
            }
            // @ts-ignore
            if (!root['_prefab']) {
                // @ts-ignore
                root['_prefab'] = utils_1.prefabUtils.createPrefabInfo(root.uuid);
            }
            // @ts-ignore
            const rootPrefabInfo = root['_prefab'];
            const targetOverride = utils_1.prefabUtils.getTargetOverride(rootPrefabInfo, target, diffInfo.pathKeys);
            if (targetOverride) {
                utils_1.prefabUtils.fireBeforeChangeMsg(root);
                targetOverride.target = outMostPrefabInstanceNode;
                const targetInfo = new TargetInfo();
                targetInfo.localID = targetPath;
                targetOverride.targetInfo = targetInfo;
                utils_1.prefabUtils.fireChangeMsg(root);
                return true;
            }
        }
        return false;
    }
    // 对比当前节点和对应预制体原始资源中的数据的差异
    checkToAddPropertyOverrides(node, pathKeys, root) {
        // 获取节点所属预制体的相关信息
        const propertyOverrideLocation = utils_1.prefabUtils.getPropertyOverrideLocationInfo(node, pathKeys);
        if (!propertyOverrideLocation) {
            return;
        }
        const outMostPrefabInstanceNode = propertyOverrideLocation.outMostPrefabInstanceNode;
        if (!outMostPrefabInstanceNode) {
            return;
        }
        // @ts-ignore
        const outMostPrefabInfo = outMostPrefabInstanceNode['_prefab'];
        if (!outMostPrefabInfo || !outMostPrefabInfo.asset) {
            return;
        }
        const outMostPrefabInstance = outMostPrefabInfo?.instance;
        if (!outMostPrefabInstance) {
            return;
        }
        const curTarget = propertyOverrideLocation.target;
        const mountedRoot = utils_1.prefabUtils.getMountedRoot(curTarget);
        // 如果修改的是一个在当前上下文下的 mounted 节点或组件，就不需要写 overrides，因为 mounted 的节点或组件本身就会被序列化
        if (mountedRoot && mountedRoot === outMostPrefabInstanceNode) {
            return;
        }
        const localID = propertyOverrideLocation.targetPath;
        const assetRootNode = utils_1.prefabUtils.getPrefabAssetNodeInstance(outMostPrefabInfo);
        if (!assetRootNode) {
            return;
        }
        const targetInAsset = utils_1.prefabUtils.getTarget(localID, assetRootNode);
        if (!targetInAsset) {
            console.debug(`can't find item: ${curTarget.name} in prefab asset ${outMostPrefabInfo.asset._uuid}`);
            return;
        }
        const propOverrides = utils_1.prefabUtils.getPropertyOverridesOfTarget(outMostPrefabInstance, localID);
        const diffInfos = this.getDiffPropertyInfos(curTarget, targetInAsset, [], this.isInPropertyOverrides.bind(this, propOverrides)); // 利用偏函数传入预设参数
        // 清除以前用 setter 记录下的数据
        // prefabUtil.removePropertyOverride(outMostPrefabInstance, localID, propertyOverrideLocation.relativePathKeys);
        if (diffInfos && diffInfos.length > 0) {
            utils_1.prefabUtils.fireBeforeChangeMsg(propertyOverrideLocation.outMostPrefabInstanceNode);
            for (let i = 0; i < diffInfos.length; i++) {
                const info = diffInfos[i];
                if (curTarget instanceof cc_1.Component && this.checkToAddTargetOverride(curTarget, info, root)) {
                    continue;
                }
                const propOverride = utils_1.prefabUtils.getPropertyOverride(outMostPrefabInstance, localID, info.pathKeys);
                propOverride.value = info.value;
            }
            if (root) {
                // diffPropertyInfos 获取到的差异信息,有些情况会漏掉，直接比较最准确
                this.addTargetOverrideWithModifyPath(node, pathKeys, root);
            }
            utils_1.prefabUtils.fireChangeMsg(propertyOverrideLocation.outMostPrefabInstanceNode);
        }
    }
    // 是否已经在 TargetOverride 记录中
    isInTargetOverrides(source, targetOverrides, pathKeys) {
        if (!targetOverrides) {
            return false;
        }
        return utils_1.prefabUtils.isInTargetOverrides(targetOverrides, source, pathKeys);
    }
    // 是否在 PropertyOverrides 中
    isInPropertyOverrides(propertyOverrides, pathKeys) {
        return utils_1.prefabUtils.isInPropertyOverrides(pathKeys, propertyOverrides);
    }
    /**
     * 对比得到两个 ccClass 的差异数据
     * @param curTarget 对比的对象
     * @param comparedTarget 被比较的对象
     * @param propPathKeys 当前对象的属性路径数组
     * @param isModifiedFunc 用于判断属性是否被修改的方法
     * @returns
     */
    getDiffPropertyInfos(curTarget, comparedTarget, propPathKeys, isModifiedFunc) {
        if (!curTarget) {
            return null;
        }
        const curTargetCtor = curTarget.constructor;
        const comparedTargetCtor = comparedTarget.constructor;
        if (!curTargetCtor || !comparedTargetCtor || curTargetCtor !== comparedTargetCtor) {
            return null;
        }
        // @ts-ignore
        const props = curTargetCtor.__values__; // 可序列化的属性都放在这里边
        const excludeProps = getDiffExcludeProps(curTargetCtor);
        let diffPropertyInfos = [];
        props.map((key) => {
            if (excludeProps.includes(key)) {
                return;
            }
            const attr = cc_1.CCClass.attr(curTargetCtor, key);
            if (attr.serializable === false) {
                return;
            }
            const curPropValue = curTarget[key];
            const comparedPropValue = comparedTarget[key];
            const infos = this.handleDiffPropertyInfos(curPropValue, comparedPropValue, key, propPathKeys, isModifiedFunc);
            diffPropertyInfos = diffPropertyInfos.concat(infos);
        });
        return diffPropertyInfos;
    }
    handleDiffPropertyInfos(curPropValue, comparedPropValue, propName, propPathKeys, isModifiedFunc) {
        let diffPropertyInfos = [];
        const pathKeys = propPathKeys.concat(propName);
        const diffProp = {
            pathKeys,
            value: curPropValue,
        };
        if (curPropValue === null || curPropValue === undefined) {
            if (curPropValue !== comparedPropValue || isModifiedFunc(pathKeys)) {
                diffPropertyInfos.push(diffProp);
            }
        }
        else {
            if (comparedPropValue === null || comparedPropValue === undefined || isModifiedFunc(pathKeys)) {
                diffPropertyInfos.push(diffProp);
            }
            else {
                // 两个需要对比的值都非空，需要进行更详细的对比
                if (Array.isArray(curPropValue)) {
                    // 数组长度发生变化，需要记录
                    const lengthPathKeys = pathKeys.concat('length');
                    if (curPropValue.length !== comparedPropValue.length || isModifiedFunc(lengthPathKeys)) {
                        const lengthDiffProp = {
                            pathKeys: lengthPathKeys,
                            value: curPropValue.length,
                        };
                        diffPropertyInfos.push(lengthDiffProp);
                    }
                    for (let i = 0; i < curPropValue.length; i++) {
                        const infos = this.handleDiffPropertyInfos(curPropValue[i], comparedPropValue[i], '' + i, pathKeys, isModifiedFunc);
                        if (infos && infos.length > 0) {
                            diffPropertyInfos = diffPropertyInfos.concat(infos);
                        }
                    }
                }
                else if (typeof curPropValue === 'object') {
                    if (curPropValue instanceof cc_1.Node) {
                        // @ts-ignore
                        const prefabInfo = curPropValue['_prefab'];
                        // 普通节点用 uuid 比较，prefab 用 fileId 比较（可能会有相同，之后再 fix）
                        if ((prefabInfo && prefabInfo.fileId !== comparedPropValue['_prefab']?.fileId) ||
                            curPropValue.uuid !== comparedPropValue.uuid) {
                            diffPropertyInfos.push(diffProp);
                        }
                    }
                    else if (curPropValue instanceof cc_1.Component) {
                        // 普通组件组件用 uuid 比较，prefab 用 fileId 比较（可能会有相同，之后再 fix）
                        if ((curPropValue.__prefab && curPropValue.__prefab.fileId !== comparedPropValue.__prefab?.filedId) ||
                            curPropValue.uuid !== comparedPropValue.uuid) {
                            diffPropertyInfos.push(diffProp);
                        }
                    }
                    else if (curPropValue instanceof cc_1.ValueType) {
                        if (!curPropValue.equals(comparedPropValue) || isModifiedFunc(pathKeys)) {
                            diffPropertyInfos.push(diffProp);
                        }
                    }
                    else if (curPropValue instanceof cc_1.Asset) {
                        if (curPropValue._uuid !== comparedPropValue._uuid || isModifiedFunc(pathKeys)) {
                            diffPropertyInfos.push(diffProp);
                        }
                    }
                    else if (cc_1.CCClass.isCCClassOrFastDefined(curPropValue.constructor)) {
                        const infos = this.getDiffPropertyInfos(curPropValue, comparedPropValue, pathKeys, isModifiedFunc);
                        if (infos && infos.length > 0) {
                            diffPropertyInfos = diffPropertyInfos.concat(infos);
                        }
                    }
                }
                else {
                    // primitive type
                    if (curPropValue !== comparedPropValue || isModifiedFunc(pathKeys)) {
                        diffPropertyInfos.push(diffProp);
                    }
                }
            }
        }
        return diffPropertyInfos;
    }
    /**
     * 直接通过修改节点路径来判断添加 targetOverride 信息
     * @param node 修改的节点
     * @param pathKeys 属性键值路径
     * @param root
     */
    addTargetOverrideWithModifyPath(node, pathKeys, root) {
        let value = node;
        let comp = null;
        for (let index = 0; index < pathKeys.length; index++) {
            const key = pathKeys[index];
            if (!value)
                break;
            // @ts-ignore
            value = value[key];
            if (index === 1 && pathKeys[0] === '_components') {
                // 组件必然是_components[x]开头
                // @ts-ignore
                comp = value;
            }
        }
        if (value !== node && comp) {
            // 必须移除掉组件的路径，因为targetOverrideInfo是存的comp而不是node
            pathKeys.shift();
            pathKeys.shift();
            this.checkToAddTargetOverride(comp, { pathKeys: pathKeys, value: value }, root);
        }
    }
    checkToAddPrefabAssetMap(node) {
        // @ts-ignore
        const prefabInfo = node['_prefab'];
        const prefabInstance = prefabInfo?.instance;
        if (prefabInstance && prefabInfo?.asset) {
            let nodes = this.assetToNodesMap.get(prefabInfo.asset._uuid);
            if (!nodes) {
                nodes = [];
                this.assetToNodesMap.set(prefabInfo.asset._uuid, nodes);
            }
            if (!nodes.includes(node)) {
                nodes.push(node);
            }
        }
    }
    onNodeChangedInGeneralMode(node, opts, root) {
        if (!opts) {
            return;
        }
        if (opts.type === common_1.NodeEventType.CHILD_CHANGED) {
            this.updateChildrenData(node);
            return;
        }
        else if (opts.type === common_1.NodeEventType.PARENT_CHANGED) {
            if (core_1.Service.Editor.getCurrentEditorType() === 'prefab') {
                const prefabInstance = node['_prefab']?.instance;
                if (prefabInstance) {
                    prefabInstance.prefabRootNode = root;
                }
            }
        }
        if (opts.propPath === 'children' && opts.type === common_1.NodeEventType.MOVE_ARRAY_ELEMENT) {
            // 不记录 children 的变动值到 override 中
            return;
        }
        // 修改 PrefabInstance 中节点数据，要保存在最外层的 PrefabInstance中
        if (opts.propPath) {
            const key = node.uuid + '|' + opts.propPath;
            this._timerUtil.callFunctionLimit(key, this.checkToAddOverrides.bind(this), node, opts.propPath, root);
        }
        this._timerUtil.callFunctionLimit(node.uuid, this.updateSpecialComponent.bind(this), node, opts.propPath, root);
    }
    /**
     * 判断是否是需要保留的 PropertyOverride
     * @param propOverride Prefab 实例
     * @param prefabRootFileId prefab 根节点的 FileId
     */
    isReservedPropertyOverrides(propOverride, prefabRootFileId) {
        const targetInfo = propOverride.targetInfo;
        if (targetInfo?.localID.length === 1 && targetInfo.localID[0] === prefabRootFileId) {
            const propPath = propOverride.propertyPath;
            if (propPath.length === 1 && RootReservedProperty.includes(propPath[0])) {
                return true;
            }
        }
        return false;
    }
    /**
     * 移除实例的 PropertyOverrides，保留一些一般不需要和 PrefabAsset 自动同步的覆盖
     * @param prefabInstance Prefab 实例
     * @param prefabRootFileId prefab 根节点的 FileId
     */
    removeModifiedPropertyOverrides(prefabInstance, prefabRootFileId) {
        const reservedPropertyOverrides = [];
        for (let i = 0; i < prefabInstance.propertyOverrides.length; i++) {
            const propOverride = prefabInstance.propertyOverrides[i];
            if (this.isReservedPropertyOverrides(propOverride, prefabRootFileId)) {
                reservedPropertyOverrides.push(propOverride);
            }
        }
        prefabInstance.propertyOverrides = reservedPropertyOverrides;
    }
    // 处理嵌套节点的 Override，要从场景的 instance 写到 prefab 资源中的嵌套子节点上的 instance 的 override 中
    applyMountedChildren(node) {
        const rootNode = node;
        const prefabInfo = utils_1.prefabUtils.getPrefab(rootNode);
        if (!prefabInfo || !prefabInfo.instance)
            return;
        const prefabInstance = prefabInfo.instance;
        const mountedChildrenMap = new Map();
        const mountedChildren = prefabInstance.mountedChildren;
        for (let i = 0; i < mountedChildren.length; i++) {
            const mountedChildInfo = mountedChildren[i];
            const targetInfo = mountedChildInfo.targetInfo;
            if (!targetInfo) {
                continue;
            }
            // localID 长度大于1，表示是加到了嵌套的 PrefabInstance 节点中去了
            if (targetInfo.localID.length > 1) {
                // 需要将 mounted 的信息加到嵌套的那个 PrefabInstance 中去
                const target = utils_1.prefabUtils.getTarget(targetInfo.localID, rootNode);
                // 找下一级的 PrefabInstance
                prefabInfo.instance = undefined;
                const nestedInstPrefabInstanceInfo = utils_1.prefabUtils.getOutMostPrefabInstanceInfo(target);
                prefabInfo.instance = prefabInstance;
                const nestedInstNode = nestedInstPrefabInstanceInfo.outMostPrefabInstanceNode;
                if (!nestedInstNode) {
                    continue;
                }
                // @ts-ignore
                const nestedInstPrefabInfo = nestedInstNode['_prefab'];
                if (!nestedInstPrefabInfo) {
                    continue;
                }
                const nestedInstPrefabInstance = nestedInstPrefabInfo.instance;
                if (!nestedInstPrefabInstance) {
                    continue;
                }
                const targetPath = nestedInstPrefabInstanceInfo.targetPath.slice();
                const mountedParentPath = nestedInstPrefabInstanceInfo.targetPath.slice(1);
                const targetFileId = utils_1.prefabUtils.getPrefab(target)?.fileId;
                if (!targetFileId) {
                    continue;
                }
                mountedParentPath.push(targetFileId);
                const nestedMountedChildInfo = utils_1.prefabUtils.getPrefabInstanceMountedChildren(nestedInstPrefabInstance, mountedParentPath);
                mountedChildInfo.nodes.forEach((mountedNode) => {
                    // @ts-ignore
                    const oldPrefabInfo = mountedNode['_prefab'];
                    utils_1.prefabUtils.addPrefabInfo(mountedNode, nestedInstNode, nestedInstPrefabInfo.asset);
                    utils_1.prefabUtils.setMountedRoot(mountedNode, nestedInstNode);
                    // @ts-ignore
                    const mountedNodePrefabInfo = mountedNode['_prefab'];
                    if (!mountedNodePrefabInfo) {
                        return;
                    }
                    // 找到原来的 mounted 节点，在新的 Prefab 下的 LocalID，以便还原时候根据它来查找节点
                    targetPath.push(mountedNodePrefabInfo.fileId);
                    mountedChildrenMap.set(targetPath, { prefabInfo: oldPrefabInfo });
                });
                nestedMountedChildInfo.nodes = nestedMountedChildInfo.nodes.concat(mountedChildInfo.nodes);
            }
            else {
                // 没有嵌套的的 mounted 节点会直接成为 PrefabAsset 里的节点
                mountedChildInfo.nodes.forEach((mountedNode) => {
                    // @ts-ignore
                    let mountedNodePrefabInfo = utils_1.prefabUtils.getPrefab(mountedNode);
                    utils_1.prefabUtils.setMountedRoot(mountedNode, undefined);
                    if (!mountedNodePrefabInfo) {
                        utils_1.prefabUtils.addPrefabInfo(mountedNode, node, prefabInfo.asset);
                        mountedNodePrefabInfo = utils_1.prefabUtils.getPrefab(mountedNode);
                    }
                    else {
                        // 非 instance 才要换 asset
                        if (!mountedNodePrefabInfo.instance) {
                            utils_1.prefabUtils.addPrefabInfo(mountedNode, node, prefabInfo.asset);
                        }
                    }
                    mountedChildrenMap.set([mountedNodePrefabInfo.fileId], { prefabInfo: null });
                });
            }
        }
        prefabInstance.mountedChildren = [];
        return mountedChildrenMap;
    }
    applyPropertyOverrides(node) {
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
        const propertyOverrides = prefabInstance.propertyOverrides;
        const reservedPropertyOverrides = [];
        for (let i = 0; i < propertyOverrides.length; i++) {
            const propOverride = propertyOverrides[i];
            // 保留一些一般不需要和 PrefabAsset 自动同步的 override
            if (this.isReservedPropertyOverrides(propOverride, prefabInfo.fileId)) {
                reservedPropertyOverrides.push(propOverride);
                continue;
            }
            const targetInfo = propOverride.targetInfo;
            if (!targetInfo) {
                continue;
            }
            // localID 长度大于1，表示是加到了嵌套的 PrefabInstance 节点中去了
            if (targetInfo.localID.length > 1) {
                // 需要将 mounted 的信息加到嵌套的那个 PrefabInstance 中去
                const target = utils_1.prefabUtils.getTarget(targetInfo.localID, rootNode);
                if (!target) {
                    continue;
                }
                let targetNode = target;
                if (targetNode instanceof cc_1.Component) {
                    targetNode = targetNode.node;
                }
                // 找下一级的 PrefabInstance
                prefabInfo.instance = undefined;
                const nestedInstPrefabInstanceInfo = utils_1.prefabUtils.getOutMostPrefabInstanceInfo(targetNode);
                prefabInfo.instance = prefabInstance;
                const nestedInstNode = nestedInstPrefabInstanceInfo.outMostPrefabInstanceNode;
                if (!nestedInstNode) {
                    continue;
                }
                // @ts-ignore
                const nestedInstPrefabInfo = nestedInstNode['_prefab'];
                if (!nestedInstPrefabInfo) {
                    continue;
                }
                const nestedInstPrefabInstance = nestedInstPrefabInfo.instance;
                if (!nestedInstPrefabInstance) {
                    continue;
                }
                const targetPath = nestedInstPrefabInstanceInfo.targetPath.slice();
                targetPath.splice(0, 1);
                // @ts-ignore
                const targetPrefabInfo = target instanceof cc_1.Node ? target['_prefab'] : target.__prefab;
                if (!targetPrefabInfo) {
                    continue;
                }
                targetPath.push(targetPrefabInfo.fileId);
                const nestedPropOverride = utils_1.prefabUtils.getPropertyOverride(nestedInstPrefabInstance, targetPath, propOverride.propertyPath);
                nestedPropOverride.value = propOverride.value;
            }
            else {
                // 没有嵌套的的 override 数据会直接存到 PrefabAsset 的节点上
            }
        }
        prefabInstance.propertyOverrides = reservedPropertyOverrides;
    }
    // 更新脚本中预制体 child 引用的值到预制体资源
    applyTargetOverrides(node) {
        const appliedTargetOverrides = [];
        // 场景节点或 prefab 资源中的根节点
        const sceneRootNode = core_1.Service.Editor.getRootNode();
        if (!sceneRootNode) {
            return appliedTargetOverrides;
        }
        const sceneRootNodePrefabInfo = utils_1.prefabUtils.getPrefab(sceneRootNode);
        if (!sceneRootNodePrefabInfo) {
            return appliedTargetOverrides;
        }
        const prefabInfo = utils_1.prefabUtils.getPrefab(node);
        if (!prefabInfo) {
            return appliedTargetOverrides;
        }
        const prefabInstance = prefabInfo.instance;
        if (!prefabInstance) {
            return appliedTargetOverrides;
        }
        if (sceneRootNodePrefabInfo.targetOverrides) {
            for (let i = sceneRootNodePrefabInfo.targetOverrides.length - 1; i >= 0; i--) {
                const targetOverride = sceneRootNodePrefabInfo.targetOverrides[i];
                let source = targetOverride.source;
                const sourceNode = source instanceof cc_1.Component ? source.node : source;
                const sourceInfo = targetOverride.sourceInfo;
                if (sourceInfo) {
                    if (source instanceof cc_1.Node) {
                        const node = utils_1.prefabUtils.getTarget(sourceInfo.localID, source);
                        source = node ? node : source;
                    }
                }
                const targetInfo = targetOverride.targetInfo;
                if (!targetInfo) {
                    continue;
                }
                const targetInstance = targetOverride.target?.['_prefab']?.instance;
                if (!targetInstance) {
                    continue;
                }
                const t = targetOverride.target;
                const target = t ? utils_1.prefabUtils.getTarget(targetInfo.localID, t) : null;
                if (!target) {
                    // Can't find target
                    continue;
                }
                const targetNode = target instanceof cc_1.Component ? target.node : target;
                if (!sourceNode || !targetNode) {
                    continue;
                }
                // 如果引用和被引用的节点都在 prefab 中，就要把 targetOverride 信息更新掉;
                if ((0, node_utils_1.isPartOfNode)(sourceNode, node) && (0, node_utils_1.isPartOfNode)(targetNode, node)) {
                    if (!prefabInfo.targetOverrides) {
                        prefabInfo.targetOverrides = [];
                    }
                    let sourceInAsset = source;
                    const assetTargetOverride = new TargetOverrideInfo();
                    assetTargetOverride.propertyPath = targetOverride.propertyPath;
                    // 更新 source 相关数据
                    const sourceLocalID = sourceInfo?.localID;
                    if (sourceLocalID) {
                        if (targetOverride.source instanceof cc_1.Node) {
                            const sourceComp = utils_1.prefabUtils.getTarget(sourceLocalID, targetOverride.source);
                            if (sourceComp) {
                                sourceInAsset = sourceComp;
                            }
                        }
                    }
                    let targetInAsset = targetOverride.target;
                    // 更新 target 相关数据
                    const assetTargetLocalID = targetInfo.localID;
                    if (assetTargetLocalID) {
                        // 这里和 source 不同的地方是，对 target 的索引是通过 PrefabInstance 的 FileId + 节点/组件的 FileId
                        // source 的索引可以没有 source 所在节点的 PrefabInstance 的 FileId
                        if (targetOverride.target instanceof cc_1.Node) {
                            const target = utils_1.prefabUtils.getTarget(assetTargetLocalID, targetOverride.target);
                            if (target) {
                                targetInAsset = target;
                            }
                        }
                    }
                    prefabInfo.instance = undefined;
                    this.checkToAddTargetOverride(sourceInAsset, {
                        pathKeys: targetOverride.propertyPath,
                        value: targetInAsset,
                    }, node);
                    prefabInfo.instance = prefabInstance;
                    // 清理掉 targetOverride 数据
                    sceneRootNodePrefabInfo.targetOverrides.splice(i, 1);
                }
                appliedTargetOverrides.push(targetOverride);
            }
        }
        return appliedTargetOverrides;
    }
    applyRemovedComponents(node) {
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
        const assetRootNode = utils_1.prefabUtils.getPrefabAssetNodeInstance(prefabInfo);
        if (!assetRootNode) {
            return null;
        }
        const removedComponents = prefabInstance.removedComponents;
        for (let i = 0; i < removedComponents.length; i++) {
            const targetInfo = removedComponents[i];
            if (!targetInfo) {
                continue;
            }
            // localID 长度大于1，表示是加到了嵌套的 PrefabInstance 节点中去了
            if (targetInfo.localID.length > 1) {
                const targetCompInAsset = utils_1.prefabUtils.getTarget(targetInfo.localID, assetRootNode);
                if (!targetCompInAsset || !targetCompInAsset.__prefab) {
                    continue;
                }
                const targetNodeInAsset = targetCompInAsset.node;
                const targetNodeInAssetPrefabInfo = utils_1.prefabUtils.getPrefab(targetNodeInAsset);
                if (!targetCompInAsset || !targetNodeInAssetPrefabInfo) {
                    continue;
                }
                // 先在 PrefabAsset 找到删除的 component 所在的节点的 localID，因为删除的 component 在当前
                // PrefabInstance 中已经不在了，无法通过 component 的 FileId 来找了，所以要通过找 node，
                // 然后再找下一层级的 PrefabInstance
                const targetNodeLocalID = targetInfo.localID.slice();
                targetNodeLocalID.pop();
                targetNodeLocalID.push(targetNodeInAssetPrefabInfo.fileId);
                // 在当前 PrefabInstance 中查找节点
                const curTargetNode = utils_1.prefabUtils.getTarget(targetNodeLocalID, rootNode);
                // 找下一级的 PrefabInstance
                prefabInfo.instance = undefined;
                const nestedInstPrefabInstanceInfo = utils_1.prefabUtils.getOutMostPrefabInstanceInfo(curTargetNode);
                prefabInfo.instance = prefabInstance;
                const nestedInstNode = nestedInstPrefabInstanceInfo.outMostPrefabInstanceNode;
                if (!nestedInstNode) {
                    continue;
                }
                const nestedInstPrefabInfo = utils_1.prefabUtils.getPrefab(nestedInstNode);
                if (!nestedInstPrefabInfo) {
                    continue;
                }
                const nestedInstPrefabInstance = nestedInstPrefabInfo.instance;
                if (!nestedInstPrefabInstance) {
                    continue;
                }
                const targetPath = nestedInstPrefabInstanceInfo.targetPath.slice();
                targetPath.splice(0, 1);
                targetPath.push(targetCompInAsset.__prefab.fileId);
                const newTargetInfo = new TargetInfo();
                newTargetInfo.localID = targetPath;
                nestedInstPrefabInstance.removedComponents.push(newTargetInfo);
            }
        }
        prefabInstance.removedComponents = [];
    }
    async waitForSceneLoaded() {
        return new Promise((r, _) => {
            core_1.Service.Editor.reload({}).then(() => {
                r(true);
            });
        });
    }
    /**
     * 将一个 PrefabInstance 的数据应用到对应的 Asset 资源上
     * @param nodeUUID uuid
     */
    async applyPrefab(nodeUUID) {
        // const command = new ApplyPrefabCommand(this.undoApplyPrefab.bind(this), this.doApplyPrefab.bind(this));
        // const undoID = cce.SceneFacadeManager.beginRecording(nodeUUID, { customCommand: command });
        const appPrefabInfo = await this.doApplyPrefab(nodeUUID);
        if (appPrefabInfo) {
            // command.applyPrefabInfo = appPrefabInfo;
            // cce.SceneFacadeManager.endRecording(undoID);
            // cce.SceneFacadeManager.snapshot());
            // cce.SceneFacadeManager.abortSnapshot();
            // 因为 apply prefab 后一定会触发 soft reload ,要等场景加载完成
            // 防止在切换到 prefab 编辑模式之后才触发 soft reload
            return true;
        }
        else {
            // cce.SceneFacadeManager.cancelRecording(undoID);
        }
        return false;
    }
    async doApplyPrefab(nodeUUID) {
        const node = nodeMgr.getNode(nodeUUID);
        if (!node)
            return null;
        const prefabInfo = utils_1.prefabUtils.getPrefab(node);
        const prefabInstance = prefabInfo?.instance;
        if (!prefabInstance || !prefabInfo?.asset)
            return null;
        const asset = prefabInfo.asset;
        // 如果是子资源，则不能应用
        if (utils_1.prefabUtils.isSubAsset(asset._uuid)) {
            console.warn('can\'t apply data to SubAsset Prefab');
            return null;
        }
        const oldNodeData = asset.data;
        const info = await rpc_1.Rpc.getInstance().request('assetManager', 'queryAssetInfo', [asset._uuid]);
        if (!info)
            return null;
        // 把非预制体内的节点，更新到预制体信息中
        const mountedChildrenInfoMap = this.applyMountedChildren(node);
        if (!mountedChildrenInfoMap)
            return null;
        // 把非预制体内的组件，更新到预制体信息中
        const mountedComponentsInfoMap = component_1.componentOperation.applyMountedComponents(node);
        if (!mountedComponentsInfoMap)
            return null;
        const propertyOverrides = prefabInstance.propertyOverrides;
        this.applyPropertyOverrides(node);
        const removedComponents = prefabInstance.removedComponents;
        this.applyRemovedComponents(node);
        const appliedTargetOverrides = this.applyTargetOverrides(node);
        const ret = utils_1.prefabUtils.generatePrefabDataFromNode(node);
        if (!ret)
            return null;
        if (ret.clearedReference) {
            this.restoreClearedReference(node, ret.clearedReference);
        }
        return new Promise((resolve) => {
            let finished = false;
            const TIMEOUT_MS = 5000;
            const done = () => {
                if (finished)
                    return;
                finished = true;
                clearTimeout(timer);
                resolve({
                    nodeUUID,
                    mountedChildrenInfoMap,
                    mountedComponentsInfoMap,
                    propertyOverrides,
                    removedComponents,
                    oldPrefabNodeData: oldNodeData,
                    targetOverrides: appliedTargetOverrides,
                });
            };
            // 监听事件
            core_1.ServiceEvents.once('editor:reload', () => {
                done();
            });
            // 超时兜底
            const timer = setTimeout(() => {
                console.warn('[doApplyPrefab] editor:reload 未触发');
                done();
            }, TIMEOUT_MS);
            // 保存资源
            rpc_1.Rpc.getInstance().request('assetManager', 'saveAsset', [
                info.source, ret.prefabData,
            ]).then(() => {
                utils_1.prefabUtils.removePrefabAssetNodeInstanceCache(prefabInfo);
            });
        });
    }
    async undoApplyPrefab(applyPrefabInfo) {
        const node = nodeMgr.getNode(applyPrefabInfo.nodeUUID);
        if (!node) {
            return;
        }
        // @ts-ignore
        const prefabInfo = node['_prefab'];
        if (!prefabInfo) {
            return;
        }
        const prefabInstance = prefabInfo.instance;
        if (!prefabInstance) {
            return;
        }
        const asset = prefabInfo.asset;
        if (!asset) {
            return;
        }
        const info = await rpc_1.Rpc.getInstance().request('assetManager', 'queryAssetInfo', [asset._uuid]);
        if (!info) {
            return;
        }
        asset.data = applyPrefabInfo.oldPrefabNodeData;
        const content = EditorExtends.serialize(asset);
        prefabInstance.mountedChildren = [];
        const targetMap = utils_1.prefabUtils.getTargetMap(node);
        applyPrefabInfo.mountedChildrenInfoMap.forEach((oldNodeData, localID) => {
            const target = cc_1.Prefab._utils.getTarget(localID, targetMap);
            if (!target) {
                return;
            }
            utils_1.prefabUtils.setMountedRoot(target, node);
            // @ts-ignore
            target['_prefab'] = oldNodeData.prefabInfo;
            if (target.parent) {
                this.updateChildrenData(target.parent);
            }
        });
        applyPrefabInfo.mountedComponentsInfoMap.forEach((oldCompData, localID) => {
            const target = cc_1.Prefab._utils.getTarget(localID, targetMap);
            if (!target) {
                return;
            }
            utils_1.prefabUtils.setMountedRoot(target, node);
            target.__prefab = oldCompData.prefabInfo;
            if (target.node) {
                component_1.componentOperation.updateMountedComponents(target.node);
            }
        });
        prefabInstance.propertyOverrides = applyPrefabInfo.propertyOverrides;
        prefabInstance.removedComponents = applyPrefabInfo.removedComponents;
        // 场景节点或 prefab 资源中的根节点
        const sceneRootNode = core_1.Service.Editor.getRootNode();
        if (sceneRootNode) {
            const sceneRootNodePrefabInfo = utils_1.prefabUtils.getPrefab(sceneRootNode);
            if (sceneRootNodePrefabInfo) {
                if (!sceneRootNodePrefabInfo.targetOverrides) {
                    sceneRootNodePrefabInfo.targetOverrides = [];
                }
                // 还原根节点的targetOverride
                applyPrefabInfo.targetOverrides?.forEach((overrideInfo) => {
                    const targetOverride = new TargetOverrideInfo();
                    if (overrideInfo.sourceUUID) {
                        const node = nodeMgr.getNode(overrideInfo.sourceUUID);
                        if (node) {
                            targetOverride.source = node;
                        }
                        else {
                            const comp = compMgr.getComponent(overrideInfo.sourceUUID);
                            if (comp) {
                                targetOverride.source = comp;
                            }
                        }
                    }
                    targetOverride.sourceInfo = overrideInfo.sourceInfo;
                    if (overrideInfo.targetUUID) {
                        const node = nodeMgr.getNode(overrideInfo.targetUUID);
                        if (node) {
                            targetOverride.target = node;
                        }
                        else {
                            const comp = compMgr.getComponent(overrideInfo.targetUUID);
                            if (comp) {
                                // TODO 这里不可能从组件管理器查找，是为什么这么写
                                // @ts-ignore
                                targetOverride.target = comp;
                            }
                        }
                    }
                    targetOverride.targetInfo = overrideInfo.targetInfo;
                    targetOverride.propertyPath = overrideInfo.propertyPath;
                    sceneRootNodePrefabInfo.targetOverrides?.push(targetOverride);
                });
                cc_1.Prefab._utils.applyTargetOverrides(sceneRootNode);
            }
        }
        // 场景中使用的 Prefab 节点的 PrefabAsset 变动会重新 load 场景，所以不需要单独去变动节点了。
        await rpc_1.Rpc.getInstance().request('assetManager', 'createAsset', [{
                target: info.source,
                content: content,
                overwrite: true
            }]);
        // cce.SceneFacadeManager.abortSnapshot();
    }
    updateChildrenData(node) {
        if (!node) {
            return;
        }
        // 如果当前正在移除 MountedChildren，则不需要更新这个数据了
        if (this.isRemovingMountedChildren) {
            return;
        }
        // @ts-ignore
        const prefabInfo = node['_prefab'];
        // 如果节点不是一个Prefab就不用往下处理了
        if (!prefabInfo) {
            return;
        }
        // 如果最外层有一个 prefabInstance，就要记录到 prefabInstance 中成为一个 mountedChildren, 还需要保证顺序
        const outMostPrefabInstanceInfo = utils_1.prefabUtils.getOutMostPrefabInstanceInfo(node);
        const outMostPrefabInstanceNode = outMostPrefabInstanceInfo.outMostPrefabInstanceNode;
        if (!outMostPrefabInstanceNode) {
            return;
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
        targetPath.splice(0, 1); // 不需要存最外层的 PrefabInstance 的 fileID，方便 override 可以在 PrefabInstance 复制后复用
        targetPath.push(prefabInfo.fileId);
        const nodeInAsset = utils_1.prefabUtils.getTarget(targetPath, assetRootNode);
        if (!nodeInAsset) {
            return;
        }
        const childrenFileIDs = nodeInAsset.children.map((child) => {
            // @ts-ignore
            const prefabInfo = child['_prefab'];
            if (!prefabInfo) {
                return;
            }
            if (prefabInfo.instance) {
                return prefabInfo.instance.fileId;
            }
            else {
                return prefabInfo.fileId;
            }
        });
        const addedChildren = [];
        for (let i = 0; i < node.children.length; i++) {
            const childNode = node.children[i];
            const childPrefabInfo = utils_1.prefabUtils.getPrefab(childNode);
            const childPrefabInstance = childPrefabInfo?.instance;
            // 可以写入 mountedChildren 的条件：
            // 1. 是一个普通节点
            // 2. 是一个不在别的 Prefab 资源里的新增节点
            if (!childPrefabInfo) {
                addedChildren.push(childNode);
            }
            else {
                const fileID = childPrefabInstance ? childPrefabInstance.fileId : childPrefabInfo.fileId;
                if (!childrenFileIDs.includes(fileID)) {
                    // 1. mountedRoot 为空表示为新加的节点
                    // 2. mountedRoot 不为空需要查看是不是挂在这个 PrefabInstance 节点下的，因为可能是挂在里层 PrefabInstance 里,这里就不应该重复添加
                    // 3. mountedRoot 不为空，并且 mountedRoot 不是 outMostPrefabInstanceNode 需要进行同步（fix: https://github.com/cocos/3d-tasks/issues/18516）
                    const mountedRoot = utils_1.prefabUtils.getMountedRoot(childNode);
                    if (!mountedRoot || mountedRoot === outMostPrefabInstanceNode || mountedRoot !== outMostPrefabInstanceNode) {
                        addedChildren.push(childNode);
                    }
                }
            }
        }
        utils_1.prefabUtils.fireBeforeChangeMsg(outMostPrefabInstanceNode);
        if (addedChildren.length > 0) {
            const addedChildInfo = utils_1.prefabUtils.getPrefabInstanceMountedChildren(outMostPrefabInstance, targetPath);
            addedChildInfo.nodes = addedChildren;
            addedChildInfo.nodes.forEach((childNode) => {
                utils_1.prefabUtils.setMountedRoot(childNode, outMostPrefabInstanceNode);
            });
        }
        else {
            for (let i = 0; i < outMostPrefabInstance.mountedChildren.length; i++) {
                const childInfo = outMostPrefabInstance.mountedChildren[i];
                if (childInfo.isTarget(targetPath)) {
                    childInfo.nodes.forEach((child) => {
                        utils_1.prefabUtils.setMountedRoot(child, undefined);
                    });
                    outMostPrefabInstance.mountedChildren.splice(i, 1);
                    break;
                }
            }
        }
        utils_1.prefabUtils.fireChangeMsg(outMostPrefabInstanceNode);
    }
    isCircularRefPrefabInstance(checkNode, root) {
        // @ts-ignore
        const checkPrefabInfo = checkNode['_prefab'];
        if (!checkPrefabInfo) {
            return false;
        }
        const checkPrefabInstance = checkPrefabInfo.instance;
        if (!checkPrefabInstance) {
            return false;
        }
        if (checkNode === root) {
            return false;
        }
        function checkPrefabAssetEqual(nodeA, nodeB) {
            // @ts-ignore
            const prefabInfoA = nodeA['_prefab'];
            const prefabInstanceA = prefabInfoA?.instance;
            // @ts-ignore
            const prefabInfoB = nodeB['_prefab'];
            const prefabInstanceB = prefabInfoB?.instance;
            if (prefabInstanceA && prefabInstanceB && prefabInfoA?.asset?._uuid === prefabInfoB?.asset?._uuid) {
                return true;
            }
            return false;
        }
        if (checkPrefabAssetEqual(checkNode, root)) {
            return true;
        }
        let parent = checkNode.parent;
        if (!parent) {
            return false;
        }
        while (parent && parent !== root) {
            if (checkPrefabAssetEqual(checkNode, parent)) {
                return true;
            }
            parent = parent.parent;
        }
        return false;
    }
    canBeMadeToPrefabAsset(node) {
        let hasTerrain = false;
        let hasNestedPrefab = false;
        node.walk((target) => {
            if (target.getComponent(cc_1.Terrain)) {
                hasTerrain = true;
            }
            if (this.isCircularRefPrefabInstance(target, node)) {
                console.warn(`Circular reference prefab checked: [${target.name}]`);
                hasNestedPrefab = true;
            }
        });
        if (hasTerrain) {
            console.warn('Can\'t create prefabAsset from a node that contains terrain');
            return false;
        }
        if (hasNestedPrefab) {
            console.warn('Can\'t create prefabAsset from a node that contains circular reference prefab');
            return false;
        }
        return true;
    }
    /**
     * 从一个节点生成一个 PrefabAsset
     * @param nodeUUID
     * @param url
     * @param options
     */
    async createPrefabAssetFromNode(nodeUUID, url, options = { undo: true, overwrite: true }) {
        const node = nodeMgr.getNode(nodeUUID);
        if (!node) {
            return null;
        }
        const prefabInfo = utils_1.prefabUtils.getPrefab(node);
        if (prefabInfo) {
            const { outMostPrefabInstanceNode } = utils_1.prefabUtils.getOutMostPrefabInstanceInfo(node);
            // 是一个 PrefabAsset 中的子节点并且 PrefabAsset 被实例化了
            if (outMostPrefabInstanceNode !== node && node.isChildOf(outMostPrefabInstanceNode) && !utils_1.prefabUtils.getMountedRoot(node)) {
                console.warn('can\'t create prefabAsset from a prefabNode inside a prefabInstance');
                return null;
            }
            // 拖拽预制体时，需要更新所有的 propertyOverrides #17622
            const prefabInstance = prefabInfo.instance;
            if (prefabInstance) {
                this.applyPropertyOverrides(node);
            }
        }
        if (!this.canBeMadeToPrefabAsset(node)) {
            return null;
        }
        const ret = utils_1.prefabUtils.generatePrefabDataFromNode(node);
        if (!ret)
            return null;
        // 如果本身就是一个 prefab了，那就先从自动监听变动的列表删除，等后面 link 完再 softReload
        if (prefabInfo && prefabInfo.asset) {
            this.assetToNodesMap.delete(prefabInfo.asset._uuid);
        }
        const asset = await rpc_1.Rpc.getInstance().request('assetManager', 'createAsset', [{
                target: url,
                content: ret.prefabData,
                overwrite: options.overwrite,
            }]);
        let assetRootNode = null;
        if (asset) {
            let undoID;
            let command;
            const parent = node.parent;
            if (options.undo && parent) {
                // command = new CreatePrefabCommand();
                // undoID = cce.SceneFacadeManager.beginRecording(nodeUUID, { customCommand: command });
                // command.undoData = new Map();
                // command.undoData.set(parent.uuid, cce.Dump.encode.encodeNode(parent));
                // command.undoData.set(nodeUUID, cce.Dump.encode.encodeNode(node));
            }
            assetRootNode = await this.replaceNewPrefabAssetWithClearedReference(node, asset.uuid, ret.clearedReference);
            if (undoID && command && parent) {
                // command.redoData = new Map();
                // command.redoData.set(parent.uuid, cce.Dump.encode.encodeNode(parent));
                // command.redoData.set(assetRootNode.uuid, cce.Dump.encode.encodeNode(assetRootNode));
                // cce.SceneFacadeManager.endRecording(undoID);
            }
        }
        return assetRootNode;
    }
    /**
     *  应用被清理掉的引用数据
     * @param node 预制体实例节点
     * @param clearedReference 被清理掉的引用数据
     */
    restoreClearedReference(node, clearedReference) {
        const targetMap = {};
        cc_1.Prefab._utils.generateTargetMap(node, targetMap, true);
        // 如果拖拽的是普通节点，还原引用后，要更新 propertyOverrides/targetOverride 信息
        // 如果拖拽的是预制体，由于数据已经存在，所以可以不用更新
        for (const fileID in clearedReference) {
            const data = clearedReference[fileID];
            const localIDs = [data.component];
            const comp = cc_1.Prefab._utils.getTarget(localIDs, targetMap);
            if (comp) {
                // @ts-ignore 重新赋值
                comp[data.path] = data.value;
                // 更新 node 数据
                const node = comp.node;
                const index = comp.node.components.indexOf(comp);
                const opt = {
                    propPath: `__comps__.${index}.${data.path}`,
                    type: common_1.NodeEventType.SET_PROPERTY,
                };
                // 这个方法会更新 propertyOverrides/targetOverride 信息
                this.onNodeChangedInGeneralMode(node, opt, core_1.Service.Editor.getRootNode());
            }
        }
    }
    /**
     * 更新预制体资源后,替换场景中的预制体实例,并还原被清理掉的引用数据
     * @param node 待替换的节点
     * @param prefabAsset 新的预制体资源 uuid
     * @param clearedReference 被清除的对外部节点的引用数据
     */
    async replaceNewPrefabAssetWithClearedReference(node, prefabAsset, clearedReference) {
        // 移除原来的 node,加载新的预制体作为子节点
        const parent = node.parent;
        if (parent) {
            utils_1.prefabUtils.fireBeforeChangeMsg(parent);
            const index = node.getSiblingIndex();
            const prefab = await (0, util_1.promisify)(cc_1.assetManager.loadAny)(prefabAsset);
            const assetRootNode = (0, cc_1.instantiate)(prefab);
            if (!assetRootNode['_prefab'].instance) {
                assetRootNode['_prefab'].instance = utils_1.prefabUtils.createPrefabInstance();
            }
            if (node['_prefab'] && node['_prefab'].instance) {
                assetRootNode['_prefab'].instance.fileId = node['_prefab'].instance.fileId;
            }
            this.createReservedPropertyOverrides(assetRootNode);
            // 同步 PropertyOverrides
            this.syncPropertyOverrides(assetRootNode, core_1.Service.Editor.getRootNode());
            this.restoreClearedReference(assetRootNode, clearedReference);
            node.parent = null;
            parent.insertChild(assetRootNode, index);
            utils_1.prefabUtils.fireChangeMsg(parent);
            return assetRootNode;
        }
    }
    /**
     * 将一个 node 与一个 prefab 关联到一起
     * @param nodeUUID
     * @param {*} assetUuid 关联的资源
     */
    async linkNodeWithPrefabAsset(nodeUUID, assetUuid) {
        let node = null;
        if (typeof nodeUUID === 'string') {
            node = nodeMgr.getNode(nodeUUID);
        }
        else {
            node = nodeUUID;
        }
        if (!node) {
            return false;
        }
        let asset = assetUuid;
        if (typeof assetUuid === 'string') {
            // asset = cce.prefabUtil.serialize.asAsset(assetUuid);
            asset = await (0, util_1.promisify)(cc_1.assetManager.loadAny)(assetUuid);
        }
        if (!asset) {
            console.error(`asset ${assetUuid} doesn't exist`);
            return false;
        }
        const assetRootNode = asset.data;
        if (!assetRootNode || !assetRootNode['_prefab']) {
            return;
        }
        utils_1.prefabUtils.fireBeforeChangeMsg(node);
        // @ts-ignore
        let prefabInfo = node['_prefab'];
        if (!prefabInfo) {
            prefabInfo = new PrefabInfo();
            // @ts-ignore
            node['_prefab'] = prefabInfo;
        }
        utils_1.prefabUtils.removePrefabAssetNodeInstanceCache(prefabInfo);
        if (!prefabInfo.instance) {
            const prefabInstance = utils_1.prefabUtils.createPrefabInstance();
            // @ts-ignore
            const prefabInfo = node['_prefab'];
            if (prefabInfo) {
                // TBD 当 prefabInfo 是新建的时候，root 会为空
                prefabInstance.prefabRootNode = prefabInfo.root;
            }
            // @ts-ignore
            prefabInfo.instance = prefabInstance;
        }
        else {
            utils_1.prefabUtils.removeMountedRootInfo(node);
        }
        // 当前根节点的 fileId 同步为 PrefabAsset 根节点的 fileId 后，再创建默认根节点的 PropertyOverride
        prefabInfo.fileId = assetRootNode['_prefab'].fileId;
        prefabInfo.root = node;
        const prefabInstance = prefabInfo?.instance;
        if (prefabInfo && prefabInstance) {
            this.createReservedPropertyOverrides(node);
            // 去掉身上的各种 override,以便重新加载时完全用 PrefabAsset 的数据
            prefabInstance.mountedChildren = [];
            this.removeModifiedPropertyOverrides(prefabInstance, prefabInfo.fileId);
        }
        // @ts-ignore
        prefabInfo.asset = asset;
        utils_1.prefabUtils.fireChangeMsg(node);
        // 将 PrefabAsset 中的 PrefabInfo 同步到当前要 link 的节点上
        // 这里为了 Undo 能正常工作，不使用 softReload 的方式，需要注意处理好数据的一致性
        this.syncPrefabInfo(assetRootNode, node, node);
        this.checkToAddPrefabAssetMap(node);
        return true;
    }
    /**
     * 把嵌套预制体的 PropertyOverrides 信息更新到新的预制体实例上
     * @param prefabNode 待同步的预制体节点
     * @param rootNode 带有所有预制体实例信息的根节点
     */
    syncPropertyOverrides(prefabNode, rootNode) {
        // collectInstanceOfRoot
        const roots = [];
        utils_1.prefabUtils.findOutmostPrefabInstanceNodes(rootNode, roots);
        if (roots.length > 0) {
            // collectInstanceOfPrefab
            const instanceNodes = new Map();
            prefabNode.walk((child) => {
                if (child['_prefab'] && child['_prefab'].instance) {
                    instanceNodes.set(child['_prefab'].instance.fileId, child);
                }
            });
            // sync property overrides
            for (let index = roots.length - 1; index >= 0; index--) {
                // @ts-ignore
                const prefabInfo = roots[index]['_prefab'];
                const instanceFileId = prefabInfo?.instance?.fileId;
                // @ts-ignore
                const targetFileId = prefabNode['_prefab'].instance?.fileId;
                if (instanceNodes.has(instanceFileId) && prefabInfo?.instance && prefabInfo.instance.propertyOverrides) {
                    // @ts-ignore
                    const targetPropOverrides = prefabNode['_prefab'].instance.propertyOverrides;
                    prefabInfo.instance.propertyOverrides.forEach((props) => {
                        // 部分保留属性不需要重复处理
                        if (!this.isReservedPropertyOverrides(props, prefabInfo.fileId)) {
                            targetPropOverrides.push(props);
                            // @ts-ignore
                            if (instanceFileId !== targetFileId && instanceFileId && props.targetInfo?.localID[0] !== instanceFileId) {
                                props.targetInfo?.localID.unshift(instanceFileId);
                            }
                        }
                    });
                }
            }
            // 需要更新属性
            const targetMap = {};
            cc_1.Prefab._utils.generateTargetMap(prefabNode, targetMap, true);
            // @ts-ignore
            cc_1.Prefab._utils.applyPropertyOverrides(prefabNode, prefabNode['_prefab'].instance.propertyOverrides, targetMap);
        }
    }
    // 将 PrefabAsset 中的 Prefab 信息同步到当前的节点上
    syncPrefabInfo(assetNode, dstNode, rootNode) {
        if (!assetNode || !dstNode || !rootNode) {
            return;
        }
        // @ts-ignore member access
        const srcPrefabInfo = assetNode['_prefab'];
        if (!srcPrefabInfo) {
            return;
        }
        utils_1.prefabUtils.fireBeforeChangeMsg(dstNode);
        // @ts-ignore member access
        if (!dstNode['_prefab']) {
            // @ts-ignore member access
            dstNode['_prefab'] = new PrefabInfo();
        }
        // @ts-ignore member access
        const dstPrefabInfo = dstNode['_prefab'];
        if (!dstPrefabInfo) {
            return;
        }
        // 嵌套的 prefab 子节点只需要同步一下新的 asset 和 prefabRootNode 就好了
        if (dstPrefabInfo.instance && dstNode !== rootNode) {
            dstPrefabInfo.asset = srcPrefabInfo.asset;
            dstPrefabInfo.instance.prefabRootNode = rootNode;
            utils_1.prefabUtils.fireChangeMsg(dstNode);
            return;
        }
        dstPrefabInfo.fileId = srcPrefabInfo.fileId;
        dstPrefabInfo.asset = srcPrefabInfo.asset;
        dstPrefabInfo.root = rootNode;
        if (assetNode.components.length !== dstNode.components.length) {
            console.error('Prefab Component doesn\'t match');
            return;
        }
        // copy component fileID
        for (let i = 0; i < assetNode.components.length; i++) {
            const srcComp = assetNode.components[i];
            const dstComp = dstNode.components[i];
            if (srcComp && srcComp.__prefab && dstComp) {
                if (!dstComp.__prefab) {
                    dstComp.__prefab = new CompPrefabInfo();
                }
                dstComp.__prefab.fileId = srcComp.__prefab.fileId;
            }
        }
        utils_1.prefabUtils.fireChangeMsg(dstNode);
        // 需要剔除掉私有 Node 的影响
        // 并且假设除去私有节点后，children 顺序和原来一致
        const dstChildren = [];
        dstNode.children.forEach((child) => {
            // 去掉不显示的节点
            if (child.objFlags & cc_1.CCObject.Flags.HideInHierarchy) {
                return;
            }
            dstChildren.push(child);
        });
        if (assetNode.children.length !== dstChildren.length) {
            console.error('Prefab Node doesn\'t match');
            return;
        }
        for (let i = 0; i < assetNode.children.length; i++) {
            const srcChildNode = assetNode.children[i];
            const dstChildNode = dstChildren[i];
            this.syncPrefabInfo(srcChildNode, dstChildNode, rootNode);
        }
    }
    createReservedPropertyOverrides(node) {
        // @ts-ignore
        const prefabInfo = node['_prefab'];
        const prefabInstance = prefabInfo?.instance;
        if (!prefabInfo || !prefabInstance) {
            return;
        }
        for (let i = 0; i < RootReservedProperty.length; i++) {
            const localID = [prefabInfo.fileId];
            const propPath = [RootReservedProperty[i]];
            const propValue = node[RootReservedProperty[i]];
            const propOverride = utils_1.prefabUtils.getPropertyOverride(prefabInstance, localID, propPath);
            propOverride.value = propValue;
        }
    }
    revertPropertyOverride(propOverride, curNodeTargetMap, assetTargetMap) {
        if (!propOverride || !propOverride.targetInfo) {
            return false;
        }
        const targetInfo = propOverride.targetInfo;
        const assetTarget = cc_1.Prefab._utils.getTarget(targetInfo.localID, assetTargetMap);
        const curTarget = cc_1.Prefab._utils.getTarget(targetInfo.localID, curNodeTargetMap);
        if (!assetTarget || !curTarget) {
            // Can't find target
            return false;
        }
        let node = null;
        if (curTarget instanceof cc_1.Node) {
            node = curTarget;
        }
        else if (curTarget instanceof cc_1.Component) {
            node = curTarget.node;
        }
        if (!node) {
            return false;
        }
        let assetTargetPropOwner = assetTarget;
        let curTargetPropOwner = curTarget;
        let curTargetPropOwnerParent = curTarget; // 用于记录最后数组所在的object
        let targetPropOwnerName = '';
        const propertyPath = propOverride.propertyPath.slice();
        if (propertyPath.length > 0) {
            const targetPropName = propertyPath.pop();
            if (!targetPropName) {
                return false;
            }
            for (let i = 0; i < propertyPath.length; i++) {
                const propName = propertyPath[i];
                targetPropOwnerName = propName;
                assetTargetPropOwner = assetTargetPropOwner[propName];
                curTargetPropOwnerParent = curTargetPropOwner;
                curTargetPropOwner = curTargetPropOwner[propName];
            }
            utils_1.prefabUtils.fireBeforeChangeMsg(node);
            curTargetPropOwner[targetPropName] = assetTargetPropOwner[targetPropName];
            // 如果是改数组元素，需要重新赋值一下自己以触发 setter
            if (Array.isArray(curTargetPropOwner) && curTargetPropOwnerParent && targetPropOwnerName) {
                curTargetPropOwnerParent[targetPropOwnerName] = curTargetPropOwner;
            }
            utils_1.prefabUtils.fireChangeMsg(node);
        }
        else {
            console.warn('property path is empty');
        }
        return true;
    }
    /**
     * 还原一个 PrefabInstance 的数据为它所关联的 PrefabAsset
     * @param nodeUUID node
     */
    async revertPrefab(nodeUUID) {
        let node = null;
        if (typeof nodeUUID === 'string') {
            node = nodeMgr.getNode(nodeUUID);
        }
        else {
            node = nodeUUID;
        }
        if (!node) {
            return false;
        }
        // @ts-ignore
        const prefabInfo = node['_prefab'];
        const prefabInstance = prefabInfo?.instance;
        if (!prefabInstance || !prefabInfo?.asset) {
            return false;
        }
        const assetRootNode = (0, cc_1.instantiate)(prefabInfo.asset);
        if (!assetRootNode) {
            return false;
        }
        // @ts-ignore
        const curNodePrefabInfo = node['_prefab'];
        // @ts-ignore
        const assetRootNodePrefabInfo = assetRootNode['_prefab'];
        if (!curNodePrefabInfo || !assetRootNodePrefabInfo) {
            return false;
        }
        const assetTargetMap = {};
        const curNodeTargetMap = {};
        cc_1.Prefab._utils.generateTargetMap(assetRootNode, assetTargetMap, true);
        cc_1.Prefab._utils.generateTargetMap(node, curNodeTargetMap, true);
        utils_1.prefabUtils.fireBeforeChangeMsg(node);
        // const command = new RevertPrefabCommand();
        // const undoID = cce.SceneFacadeManager.beginRecording(node.uuid, { customCommand: command });
        // command.undoData = new Map();
        // command.undoData.set(node.uuid, cce.Dump.encode.encodeNode(node));
        // command.redoData = new Map();
        const reservedPropertyOverrides = [];
        for (let i = 0; i < prefabInstance.propertyOverrides.length; i++) {
            const propOverride = prefabInstance.propertyOverrides[i];
            if (this.isReservedPropertyOverrides(propOverride, prefabInfo.fileId)) {
                reservedPropertyOverrides.push(propOverride);
            }
            else {
                const target = utils_1.prefabUtils.getTarget(propOverride.targetInfo?.localID ?? [], node);
                // const node2 = target instanceof Node ? target : target?.node;
                // if (node2 && !command.undoData.has(node2.uuid)) {
                //     command.undoData.set(node2.uuid, cce.Dump.encode.encodeNode(node2));
                // }
                this.revertPropertyOverride(propOverride, curNodeTargetMap, assetTargetMap);
                // if (node2 && !command.redoData.has(node2.uuid)) {
                //     command.redoData.set(node2.uuid, cce.Dump.encode.encodeNode(node2));
                // }
            }
        }
        prefabInstance.propertyOverrides = reservedPropertyOverrides;
        // 去掉额外添加的节点
        this.isRemovingMountedChildren = true; // 用于防止下面移除子节点时去更新mountedChildren里的数据
        for (let i = 0; i < prefabInstance.mountedChildren.length; i++) {
            const addedChildInfo = prefabInstance.mountedChildren[i];
            for (let j = 0; j < addedChildInfo.nodes.length; j++) {
                addedChildInfo.nodes[j].setParent(null);
            }
        }
        prefabInstance.mountedChildren = [];
        this.isRemovingMountedChildren = false;
        component_1.componentOperation.isRemovingMountedComponents = true;
        for (let i = 0; i < prefabInstance.mountedComponents.length; i++) {
            const mountedCompInfo = prefabInstance.mountedComponents[i];
            // 逆序，避免组件间有依赖关系导致报错
            const length = mountedCompInfo.components.length;
            for (let j = length - 1; j >= 0; j--) {
                const comp = mountedCompInfo.components[j];
                if (comp && comp.node) {
                    comp.node.removeComponent(comp);
                }
            }
        }
        // 需要立刻执行 removeComponent 操作，否则会延迟到下一帧
        cc.Object._deferredDestroy();
        prefabInstance.mountedComponents = [];
        component_1.componentOperation.isRemovingMountedComponents = false;
        component_1.componentOperation.isRevertingRemovedComponents = true;
        for (let i = 0; i < prefabInstance.removedComponents.length; i++) {
            const targetInfo = prefabInstance.removedComponents[i];
            const targetCompInAsset = cc_1.Prefab._utils.getTarget(targetInfo.localID, assetTargetMap);
            if (!targetCompInAsset) {
                continue;
            }
            const nodeLocalID = targetInfo.localID.slice();
            nodeLocalID.pop();
            // @ts-ignore
            nodeLocalID.push(targetCompInAsset.node['_prefab']?.fileId);
            const compNode = cc_1.Prefab._utils.getTarget(nodeLocalID, curNodeTargetMap);
            await component_1.componentOperation.cloneComponentToNode(compNode, targetCompInAsset);
        }
        prefabInstance.removedComponents = [];
        component_1.componentOperation.isRevertingRemovedComponents = false;
        // command.redoData.set(node.uuid, cce.Dump.encode.encodeNode(node));
        // if (undoID) {
        //     cce.SceneFacadeManager.endRecording(undoID);
        // }
        utils_1.prefabUtils.fireChangeMsg(node);
        // 因为现在恢复的是私有变量，没有触发 setter，所以暂时只能 softReload 来保证效果正确
        await core_1.Service.Editor.reload({});
        return true;
    }
    removePrefabInfoFromNode(node, removeNested) {
        node.children.forEach((child) => {
            // @ts-ignore
            const childPrefabInstance = child['_prefab']?.instance;
            if (childPrefabInstance) {
                // 判断嵌套的 PrefabInstance 是否需要移除
                if (removeNested) {
                    this.removePrefabInfoFromNode(child, removeNested);
                }
            }
            else {
                this.removePrefabInfoFromNode(child, removeNested);
            }
        });
        utils_1.prefabUtils.removePrefabInfo(node);
    }
    removePrefabInfoFromInstanceNode(node, removeNested) {
        // @ts-ignore
        const prefabInfo = node['_prefab'];
        if (!prefabInfo) {
            return false;
        }
        const prefabInstance = prefabInfo.instance;
        // 正常情况下只能在 PrefabInstance 上使用 unWrap
        // 如果资源丢失，也可以解除关系
        if (prefabInstance || !prefabInfo.asset) {
            // 移除 mountedRoot 信息
            utils_1.prefabUtils.removeMountedRootInfo(node);
            // remove prefabInfo
            utils_1.prefabUtils.walkNode(node, (target, isChild) => {
                // skip root
                if (!isChild) {
                    return false;
                }
                // @ts-ignore
                const targetPrefabInfo = target['_prefab'];
                if (!targetPrefabInfo) {
                    return true;
                }
                const targetPrefabInstance = targetPrefabInfo.instance;
                if (targetPrefabInstance || !targetPrefabInfo.asset) {
                    if (targetPrefabInstance && targetPrefabInstance.prefabRootNode === node) {
                        // 去掉子节点中的 PrefabInstance 的 prefabRootNode 对这个节点的指向
                        targetPrefabInstance.prefabRootNode = undefined;
                        utils_1.prefabUtils.fireChangeMsg(target);
                    }
                    if (removeNested) {
                        this.removePrefabInfoFromInstanceNode(target);
                    }
                    else {
                        return true;
                    }
                }
                else {
                    utils_1.prefabUtils.removePrefabInfo(target);
                }
                return false;
            });
            utils_1.prefabUtils.removePrefabInfo(node);
            return true;
        }
        return false;
    }
    removePrefabInstanceAndChangeRoot(node, rootNode, removeNested) {
        node.children.forEach((child) => {
            // @ts-ignore
            if (child['_prefab']?.instance) {
                // 判断嵌套的 PrefabInstance 是否需要移除
                if (removeNested) {
                    this.removePrefabInstanceAndChangeRoot(child, rootNode, removeNested);
                }
            }
            else {
                this.removePrefabInstanceAndChangeRoot(child, rootNode, removeNested);
            }
        });
        // @ts-ignore member access
        const prefabInfo = node['_prefab'];
        if (!prefabInfo) {
            return;
        }
        utils_1.prefabUtils.fireBeforeChangeMsg(node);
        // @ts-ignore member access
        const rootPrefabInfo = rootNode['_prefab'];
        if (rootPrefabInfo) {
            prefabInfo.root = rootNode;
            prefabInfo.asset = rootPrefabInfo.asset;
        }
        if (prefabInfo.instance) {
            prefabInfo.instance = undefined;
        }
        // 解除嵌套的 Prefab 实例,内部节点退化为当前 Prefab 资源里的节点
        // 需要将它们的 PrefabInfo 中的 FileId 重新设置，否则由同一个资源
        // 实例化出来的多个 Prefab 实例，解除后它们的 FileId 会冲突
        prefabInfo.fileId = node.uuid;
        node.components.forEach((comp) => {
            if (comp.__prefab) {
                comp.__prefab.fileId = comp.uuid;
            }
        });
        utils_1.prefabUtils.fireChangeMsg(node);
    }
    /**
     * 解除 PrefabInstance 对 PrefabAsset 的关联
     * @param nodeUUID 节点或节点的 UUID
     * @param removeNested 是否递归的解除子节点 PrefabInstance
     */
    unWrapPrefabInstance(nodeUUID, removeNested) {
        let node = null;
        if (typeof nodeUUID === 'string') {
            node = nodeMgr.getNode(nodeUUID);
        }
        else {
            node = nodeUUID;
        }
        if (!node) {
            return false;
        }
        // @ts-ignore
        const prefabInfo = node['_prefab'];
        if (!prefabInfo) {
            return false;
        }
        // 正常情况下只能在 PrefabInstance 上使用 unWrap
        // 如果资源丢失，也可以解除关系
        if (prefabInfo.instance || !prefabInfo.asset) {
            return this.removePrefabInfoFromInstanceNode(node, removeNested);
        }
        return false;
    }
    // 在 Prefab 编辑模式下不能移除 prefabInfo，只需要移除 instance
    unWrapPrefabInstanceInPrefabMode(nodeUUID, removeNested) {
        let node = null;
        if (typeof nodeUUID === 'string') {
            node = nodeMgr.getNode(nodeUUID);
        }
        else {
            node = nodeUUID;
        }
        if (!node) {
            return false;
        }
        // @ts-ignore
        const prefabInfo = node['_prefab'];
        if (!prefabInfo) {
            return false;
        }
        let rootNode = node;
        const mountedRoot = utils_1.prefabUtils.getMountedRoot(node);
        if (mountedRoot) {
            // mounted 的 prefab 节点需要把 root 设置为当前 prefab 的根节点
            rootNode = core_1.Service.Editor.getRootNode();
        }
        else {
            // @ts-ignore private member access
            if (node.parent && node.parent['_prefab']) {
                // @ts-ignore private member access
                rootNode = node.parent['_prefab'].root;
            }
        }
        if (!rootNode) {
            return false;
        }
        // @ts-ignore
        const rootPrefabInfo = rootNode['_prefab'];
        if (!rootPrefabInfo) {
            return false;
        }
        // 正常情况下只能在 PrefabInstance 上使用 unWrap
        // 如果资源丢失，也可以解除关系
        if (prefabInfo.instance || !prefabInfo.asset) {
            // this.removePrefabInstanceAndChangeRoot(node, rootNode, removeNested);
            this.removePrefabInfoFromInstanceNode(node, removeNested);
            utils_1.prefabUtils.addPrefabInfo(node, rootNode, rootPrefabInfo.asset);
            // 解决子节点中的 PrefabInstance 的 FileId 冲突
            // 子节点中的 PrefabInstance 的 FileId 可能和当前场景的其它解除 PrefabInstance 的子节点中
            // 的 PrefabInstance 的 FileId 冲突，所以需要重新生成一个
            const instanceRoots = [];
            utils_1.prefabUtils.findOutmostPrefabInstanceNodes(node, instanceRoots);
            instanceRoots.forEach((instanceRoot) => {
                const rootPrefabInstance = instanceRoot?.['_prefab']?.instance;
                if (rootPrefabInstance) {
                    rootPrefabInstance.fileId = utils_1.prefabUtils.generateUUID();
                    utils_1.prefabUtils.fireChangeMsg(instanceRoot);
                }
            });
            return true;
        }
        return false;
    }
}
const nodeOperation = new NodeOperation();
exports.nodeOperation = nodeOperation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL3NjZW5lL3NjZW5lLXByb2Nlc3Mvc2VydmljZS9wcmVmYWIvbm9kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQkFnQlk7QUFDWixtQ0FBc0M7QUFDdEMsMkNBQXVFO0FBQ3ZFLCtCQUFpQztBQUNqQyxtREFBZ0U7QUFDaEUsa0NBQWlEO0FBQ2pELDRDQUFtRjtBQUNuRixtQ0FBZ0M7QUFDaEMsNkNBQXlDO0FBRXpDLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUM7QUFDbkMsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQztBQUd4QyxNQUFNLFVBQVUsR0FBRyxXQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztBQUU1QyxNQUFNLG9CQUFvQixHQUFHLFdBQU0sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUM7QUFHaEUsTUFBTSxjQUFjLEdBQUcsV0FBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7QUFFcEQsTUFBTSxVQUFVLEdBQUcsV0FBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFFNUMsTUFBTSxrQkFBa0IsR0FBRyxXQUFNLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDO0FBRTVELDZDQUE2QztBQUM3QyxNQUFNLG9CQUFvQixHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDbkUsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDO0FBTzlCLG1CQUFtQjtBQUNuQixNQUFNLGtCQUFrQixHQUFnQztJQUNwRCxTQUFTLEVBQUUsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLG9CQUFlLENBQUM7SUFDM0YsY0FBYyxFQUFFLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxvQkFBZSxD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QUMsS0FBSyxDQUFDLENBQUM7WUFFaEUscUNBQXFDO1lBQ3JDLGtFQUFrRTtZQUNsRSwwQ0FBMEM7WUFDMUMsTUFBTSxhQUFhLEdBQVcsRUFBRSxDQUFDO1lBQ2pDLG1CQUFXLENBQUMsOEJBQThCLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ2hFLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRTtnQkFDbkMsTUFBTSxrQkFBa0IsR0FBRyxZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxRQUFRLENBQUM7Z0JBQy9ELElBQUksa0JBQWtCLEVBQUUsQ0FBQztvQkFDckIsa0JBQWtCLENBQUMsTUFBTSxHQUFHLG1CQUFXLENBQUMsWUFBWSxFQUFFLENBQUM7b0JBQ3ZELG1CQUFXLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUM1QyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztDQUNKO0FBRUQsTUFBTSxhQUFhLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztBQUVqQyxzQ0FBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgICBBc3NldCxcclxuICAgIGFzc2V0TWFuYWdlcixcclxuICAgIENDQ2xhc3MsXHJcbiAgICBDQ09iamVjdCxcclxuICAgIENvbXBvbmVudCxcclxuICAgIGVkaXRvckV4dHJhc1RhZyxcclxuICAgIGluc3RhbnRpYXRlLFxyXG4gICAganMsXHJcbiAgICBOb2RlLFxyXG4gICAgUHJlZmFiLFxyXG4gICAgU2NlbmUsXHJcbiAgICBUZXJyYWluLFxyXG4gICAgVmFsdWVUeXBlLFxyXG4gICAgV2lkZ2V0LFxyXG4gICAgaXNWYWxpZCxcclxufSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IHByZWZhYlV0aWxzIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IGNvbXBvbmVudE9wZXJhdGlvbiwgSUNvbXBvbmVudFByZWZhYkRhdGEgfSBmcm9tICcuL2NvbXBvbmVudCc7XHJcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gJ3V0aWwnO1xyXG5pbXBvcnQgeyBpc0VkaXRvck5vZGUsIGlzUGFydE9mTm9kZSB9IGZyb20gJy4uL25vZGUvbm9kZS11dGlscyc7XHJcbmltcG9ydCB7IFNlcnZpY2UsIFNlcnZpY2VFdmVudHMgfSBmcm9tICcuLi9jb3JlJztcclxuaW1wb3J0IHsgSUNoYW5nZU5vZGVPcHRpb25zLCBJRWRpdG9yRXZlbnRzLCBOb2RlRXZlbnRUeXBlIH0gZnJvbSAnLi4vLi4vLi4vY29tbW9uJztcclxuaW1wb3J0IHsgUnBjIH0gZnJvbSAnLi4vLi4vcnBjJztcclxuaW1wb3J0IHsgVGltZXJVdGlsIH0gZnJvbSAnLi90aW1lci11dGlsJztcclxuXHJcbmNvbnN0IG5vZGVNZ3IgPSBFZGl0b3JFeHRlbmRzLk5vZGU7XHJcbmNvbnN0IGNvbXBNZ3IgPSBFZGl0b3JFeHRlbmRzLkNvbXBvbmVudDtcclxuXHJcbnR5cGUgUHJlZmFiSW5mbyA9IFByZWZhYi5fdXRpbHMuUHJlZmFiSW5mbztcclxuY29uc3QgUHJlZmFiSW5mbyA9IFByZWZhYi5fdXRpbHMuUHJlZmFiSW5mbztcclxudHlwZSBQcm9wZXJ0eU92ZXJyaWRlSW5mbyA9IFByZWZhYi5fdXRpbHMuUHJvcGVydHlPdmVycmlkZUluZm87XHJcbmNvbnN0IFByb3BlcnR5T3ZlcnJpZGVJbmZvID0gUHJlZmFiLl91dGlscy5Qcm9wZXJ0eU92ZXJyaWRlSW5mbztcclxudHlwZSBQcmVmYWJJbnN0YW5jZSA9IFByZWZhYi5fdXRpbHMuUHJlZmFiSW5zdGFuY2U7XHJcbnR5cGUgQ29tcFByZWZhYkluZm8gPSBQcmVmYWIuX3V0aWxzLkNvbXBQcmVmYWJJbmZvO1xyXG5jb25zdCBDb21wUHJlZmFiSW5mbyA9IFByZWZhYi5fdXRpbHMuQ29tcFByZWZhYkluZm87XHJcbnR5cGUgVGFyZ2V0SW5mbyA9IFByZWZhYi5fdXRpbHMuVGFyZ2V0SW5mbztcclxuY29uc3QgVGFyZ2V0SW5mbyA9IFByZWZhYi5fdXRpbHMuVGFyZ2V0SW5mbztcclxudHlwZSBUYXJnZXRPdmVycmlkZUluZm8gPSBQcmVmYWIuX3V0aWxzLlRhcmdldE92ZXJyaWRlSW5mbztcclxuY29uc3QgVGFyZ2V0T3ZlcnJpZGVJbmZvID0gUHJlZmFiLl91dGlscy5UYXJnZXRPdmVycmlkZUluZm87XHJcblxyXG4vLyBzY2FsZSDpu5jorqTkuI0gb3ZlcnJpZGXvvIzlm6DkuLrmqKHlnovlvoDlvoDnvKnmlL7mnInpl67popjvvIzov5nmoLfph43lr7zlkI7lsLHnm7TmjqXnlJ/mlYjkuoZcclxuY29uc3QgUm9vdFJlc2VydmVkUHJvcGVydHkgPSBbJ19uYW1lJywgJ19scG9zJywgJ19scm90JywgJ19ldWxlciddO1xyXG5jb25zdCBjb21wS2V5ID0gJ19jb21wb25lbnRzJztcclxuXHJcbmludGVyZmFjZSBJRGlmZlByb3BlcnR5SW5mbyB7XHJcbiAgICBwYXRoS2V5czogc3RyaW5nW107IC8vIOebuOWvueS6juiKgueCueaIlue7hOS7tueahOWxnuaAp+afpeaJvui3r+W+hFxyXG4gICAgdmFsdWU6IGFueTsgLy8g5L+u5pS55ZCO55qE5YC8XHJcbn1cclxuXHJcbi8vIOWcqCBkaWZmIOavlOi+g+WJlOmZpOeahOS4gOS6m+WxnuaAp1xyXG5jb25zdCBkaWZmRXhjbHVkZVByb3BNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nW10gfSA9IHtcclxuICAgICdjYy5Ob2RlJzogWydfb2JqRmxhZ3MnLCAnX3BhcmVudCcsICdfY2hpbGRyZW4nLCAnX2NvbXBvbmVudHMnLCAnX3ByZWZhYicsIGVkaXRvckV4dHJhc1RhZ10sXHJcbiAgICAnY2MuQ29tcG9uZW50JzogWydub2RlJywgJ19vYmpGbGFncycsIGVkaXRvckV4dHJhc1RhZ10sXHJcbn07XHJcblxyXG5mdW5jdGlvbiBnZXREaWZmRXhjbHVkZVByb3BzKGN0b3I6IEZ1bmN0aW9uKSB7XHJcbiAgICBsZXQgcHJvcHM6IHN0cmluZ1tdID0gW107XHJcbiAgICBPYmplY3Qua2V5cyhkaWZmRXhjbHVkZVByb3BNYXApLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNjS2xzID0ganMuZ2V0Q2xhc3NCeU5hbWUoa2V5KTtcclxuICAgICAgICBpZiAoY2NLbHMgJiYganMuaXNDaGlsZENsYXNzT2YoY3RvciwgY2NLbHMpKSB7XHJcbiAgICAgICAgICAgIHByb3BzID0gcHJvcHMuY29uY2F0KGRpZmZFeGNsdWRlUHJvcE1hcFtrZXldKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcHJvcHM7XHJcbn1cclxuXHJcbmludGVyZmFjZSBJTm9kZVByZWZhYkRhdGEge1xyXG4gICAgcHJlZmFiSW5mbzogUHJlZmFiSW5mbyB8IG51bGw7XHJcbn1cclxuXHJcbmludGVyZmFjZSBJQXBwbGllZFRhcmdldE92ZXJyaWRlSW5mbyB7XHJcbiAgICBzb3VyY2VVVUlEPzogc3RyaW5nO1xyXG4gICAgc291cmNlSW5mbzogVGFyZ2V0SW5mbyB8IG51bGw7XHJcbiAgICBwcm9wZXJ0eVBhdGg6IHN0cmluZ1tdO1xyXG4gICAgdGFyZ2V0VVVJRD86IHN0cmluZztcclxuICAgIHRhcmdldEluZm86IFRhcmdldEluZm8gfCBudWxsO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgSUFwcGx5UHJlZmFiSW5mbyB7XHJcbiAgICBub2RlVVVJRDogc3RyaW5nO1xyXG4gICAgbW91bnRlZENoaWxkcmVuSW5mb01hcDogTWFwPHN0cmluZ1tdLCBJTm9kZVByZWZhYkRhdGE+O1xyXG4gICAgbW91bnRlZENvbXBvbmVudHNJbmZvTWFwOiBNYXA8c3RyaW5nW10sIElDb21wb25lbnRQcmVmYWJEYXRhPjtcclxuICAgIHByb3BlcnR5T3ZlcnJpZGVzOiBQcm9wZXJ0eU92ZXJyaWRlSW5mb1tdO1xyXG4gICAgcmVtb3ZlZENvbXBvbmVudHM6IFRhcmdldEluZm9bXTtcclxuICAgIG9sZFByZWZhYk5vZGVEYXRhOiBhbnk7XHJcbiAgICB0YXJnZXRPdmVycmlkZXM6IElBcHBsaWVkVGFyZ2V0T3ZlcnJpZGVJbmZvW107XHJcbn1cclxuXHJcbi8vIGNsYXNzIEFwcGx5UHJlZmFiQ29tbWFuZCBleHRlbmRzIFNjZW5lVW5kb0NvbW1hbmQge1xyXG4vLyAgICAgcHVibGljIGFwcGx5UHJlZmFiSW5mbzogSUFwcGx5UHJlZmFiSW5mbyB8IG51bGwgPSBudWxsO1xyXG4vLyAgICAgcHJpdmF0ZSBfdW5kb0Z1bmM6IEZ1bmN0aW9uO1xyXG4vLyAgICAgcHJpdmF0ZSBfcmVkb0Z1bmM6IEZ1bmN0aW9uO1xyXG4vLyAgICAgY29uc3RydWN0b3IodW5kb0Z1bmM6IEZ1bmN0aW9uLCByZWRvRnVuYzogRnVuY3Rpb24pIHtcclxuLy8gICAgICAgICBzdXBlcigpO1xyXG4vLyAgICAgICAgIHRoaXMuX3VuZG9GdW5jID0gdW5kb0Z1bmM7XHJcbi8vICAgICAgICAgdGhpcy5fcmVkb0Z1bmMgPSByZWRvRnVuYztcclxuLy8gICAgIH1cclxuLy9cclxuLy8gICAgIHB1YmxpYyBhc3luYyB1bmRvKCkge1xyXG4vLyAgICAgICAgIGlmICh0aGlzLmFwcGx5UHJlZmFiSW5mbykge1xyXG4vLyAgICAgICAgICAgICBhd2FpdCB0aGlzLl91bmRvRnVuYyh0aGlzLmFwcGx5UHJlZmFiSW5mbyk7XHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgfVxyXG4vL1xyXG4vLyAgICAgcHVibGljIGFzeW5jIHJlZG8oKSB7XHJcbi8vICAgICAgICAgaWYgKHRoaXMuYXBwbHlQcmVmYWJJbmZvKSB7XHJcbi8vICAgICAgICAgICAgIGF3YWl0IHRoaXMuX3JlZG9GdW5jKHRoaXMuYXBwbHlQcmVmYWJJbmZvLm5vZGVVVUlEKTtcclxuLy8gICAgICAgICB9XHJcbi8vICAgICB9XHJcbi8vIH1cclxuLy9cclxuLy8gLy8g5Yib5bu66aKE5Yi25L2T55qE6Ieq5a6a5LmJIHVuZG9cclxuLy8gLy8g5Yib5bu65YmN55qE6IqC54K5IHV1aWQg5ZKM5Yib5bu65ZCO55qE6IqC54K5IHV1aWQg5pWw5o2u5LiN5LiA5qC3XHJcbi8vIGNsYXNzIENyZWF0ZVByZWZhYkNvbW1hbmQgZXh0ZW5kcyBTY2VuZVVuZG9Db21tYW5kIHtcclxuLy8gICAgIHB1YmxpYyBhc3luYyB1bmRvKCkge1xyXG4vLyAgICAgICAgIGF3YWl0IHRoaXMuYXBwbHlEYXRhKHRoaXMudW5kb0RhdGEpO1xyXG4vLyAgICAgfVxyXG4vL1xyXG4vLyAgICAgcHVibGljIGFzeW5jIHJlZG8oKSB7XHJcbi8vICAgICAgICAgYXdhaXQgdGhpcy5hcHBseURhdGEodGhpcy5yZWRvRGF0YSk7XHJcbi8vICAgICB9XHJcbi8vIH1cclxuLy9cclxuLy8gY2xhc3MgUmV2ZXJ0UHJlZmFiQ29tbWFuZCBleHRlbmRzIENyZWF0ZVByZWZhYkNvbW1hbmQge1xyXG4vLyAgICAgdGFnID0gJ1JldmVydFByZWZhYkNvbW1hbmQnO1xyXG4vLyB9XHJcblxyXG5cclxuY2xhc3MgTm9kZU9wZXJhdGlvbiB7XHJcbiAgICBwdWJsaWMgYXNzZXRUb05vZGVzTWFwOiBNYXA8c3RyaW5nLCBOb2RlW10+ID0gbmV3IE1hcCgpOyAvLyDlrZjlgqggcHJlZmFiIOi1hOa6kOWSjOWcuuaZr+iKgueCueeahOWFs+ezu+ihqFxyXG4gICAgcHVibGljIGlzUmVtb3ZpbmdNb3VudGVkQ2hpbGRyZW4gPSBmYWxzZTtcclxuXHJcbiAgICBfdGltZXJVdGlsID0gbmV3IFRpbWVyVXRpbCgpO1xyXG5cclxuICAgIHB1YmxpYyBvblNjZW5lT3BlbmVkKCkge1xyXG4gICAgICAgIHRoaXMuYXNzZXRUb05vZGVzTWFwLmNsZWFyKCk7XHJcbiAgICAgICAgY29tcG9uZW50T3BlcmF0aW9uLmNsZWFyQ29tcENhY2hlKCk7XHJcbiAgICAgICAgcHJlZmFiVXRpbHMuY2xlYXJDYWNoZSgpO1xyXG4gICAgICAgIGZvciAoY29uc3QgdXVpZCBpbiBub2RlTWdyLmdldE5vZGVzKCkpIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVNZ3IuZ2V0Tm9kZSh1dWlkKTtcclxuXHJcbiAgICAgICAgICAgIC8vIOWcuuaZr+iKgueCueeJueauiuWkhOeQhlxyXG4gICAgICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIFNjZW5lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChub2RlICYmICFpc0VkaXRvck5vZGUobm9kZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tUb0FkZFByZWZhYkFzc2V0TWFwKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5jb21wb25lbnRzLmZvckVhY2goKGNvbXApID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRPcGVyYXRpb24uY2FjaGVDb21wKGNvbXApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uTm9kZVJlbW92ZWQobm9kZTogTm9kZSkge1xyXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSBub2RlWydfcHJlZmFiJ107XHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5zdGFuY2UgPSBwcmVmYWJJbmZvPy5pbnN0YW5jZTtcclxuICAgICAgICBpZiAocHJlZmFiSW5zdGFuY2UgJiYgcHJlZmFiSW5mbz8uYXNzZXQpIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLmFzc2V0VG9Ob2Rlc01hcC5nZXQocHJlZmFiSW5mby5hc3NldC5fdXVpZCk7XHJcbiAgICAgICAgICAgIGlmIChub2Rlcykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBub2Rlcy5pbmRleE9mKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBub2Rlcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIOS/ruaUuSBQcmVmYWJJbnN0YW5jZSDkuK3oioLngrnmlbDmja7vvIzopoHkv53lrZjlnKjmnIDlpJblsYLnmoQgUHJlZmFiSW5zdGFuY2XkuK1cclxuICAgIHByaXZhdGUgY2hlY2tUb0FkZE92ZXJyaWRlcyhub2RlOiBOb2RlLCBpblByb3BQYXRoOiBzdHJpbmcsIHJvb3Q6IE5vZGUgfCBudWxsKSB7XHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IHByZWZhYlV0aWxzLmdldFByZWZhYihub2RlKTtcclxuICAgICAgICBpZiAoIW5vZGUgfHwgIWlzVmFsaWQobm9kZSkgfHwgKHByZWZhYkluZm8gJiYgIWlzVmFsaWQocHJlZmFiSW5mby5hc3NldCkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghaW5Qcm9wUGF0aCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwcm9wUGF0aCA9IGluUHJvcFBhdGgucmVwbGFjZSgvXl9fY29tcHNfXy8sIGNvbXBLZXkpO1xyXG4gICAgICAgIGNvbnN0IHBhdGhLZXlzOiBzdHJpbmdbXSA9IChwcm9wUGF0aCB8fCAnJykuc3BsaXQoJy4nKTtcclxuXHJcbiAgICAgICAgbGV0IGNvbXA6IENvbXBvbmVudCB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgICAgICAvLyDot6/lvoTph4zmnIkgX19jb21wc19fIOWwseivtOaYjuaYr+e7hOS7tlxyXG4gICAgICAgIGlmIChpblByb3BQYXRoICE9PSBwcm9wUGF0aCAmJiBwYXRoS2V5c1swXSA9PT0gY29tcEtleSkge1xyXG4gICAgICAgICAgICBjb21wID0gKG5vZGVbcGF0aEtleXNbMF1dIGFzIGFueSlbcGF0aEtleXNbMV1dO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5qOA5rWL5piv5ZCm5pivIFByZWZhYkFzc2V0IOS4reeahOaZrumAmuiKgueCue+8iOmdnuW1jOWllyBQcmVmYWIg5Lit55qE6IqC54K577yJXHJcbiAgICAgICAgY29uc3QgaXNOb3JtYWxQcmVmYWJOb2RlID0gcHJlZmFiSW5mbyAmJiAhcHJlZmFiSW5mby5yb290Py5bJ19wcmVmYWInXT8uaW5zdGFuY2U7XHJcblxyXG4gICAgICAgIC8vIOaZrumAmuiKgueCueaIluiAhSBtb3VudGVkQ29tcG9uZW5077yM5Y+q6ZyA6KaB5Yik5pat5piv5ZCm6KaB5YqgIFRhcmdldE92ZXJyaWRl77yI5Zyo5pmu6YCa6IqC54K555qEIENvbXBvbmVudCDlvJXnlKjliLAgUHJlZmFiIOmHjOeahCBOb2RlIOaIliBDb21wb25lbnQg5pe277yJXHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbmZvIHx8IGlzTm9ybWFsUHJlZmFiTm9kZSB8fCAoY29tcCAmJiBwcmVmYWJVdGlscy5pc01vdW50ZWRDb21wb25lbnQoY29tcCkpKSB7XHJcbiAgICAgICAgICAgIGlmIChyb290KSB7XHJcbiAgICAgICAgICAgICAgICAvLyDkuI3og73nlKggZ2V0RGlmZlByb3BlcnR5SW5mb3Mg5p2l5Yik5pat5byV55So77yM5Zug5Li66I635Y+W5Yiw55qEIGRpZmZlckluZm8g55qE5bGe5oCn6Lev5b6E5piv5LiO5L+u5pS555qE5YC85LiN5LiA5qC355qE77yM5q+U5aaC6Ieq5a6a5LmJ57G75Z6L5pWw57uEICMxMzYxMlxyXG4gICAgICAgICAgICAgICAgLy8gY29uc3QgY29tcGFyZWRDb21wID0gY29tcG9uZW50T3BlcmF0aW9uLmdldENhY2hlZENvbXAoY29tcC51dWlkKTtcclxuICAgICAgICAgICAgICAgIC8vIGlmICghY29tcGFyZWRDb21wKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc29sZS5lcnJvcihgY2FuJ3QgZ2V0IGNvbXBhcmVkIGNvbXBvbmVudCBvZiAke2NvbXAubmFtZX1gKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zdCBkaWZmSW5mb3MgPSB0aGlzLmdldERpZmZQcm9wZXJ0eUluZm9zKGNvbXAsIGNvbXBhcmVkQ29tcCwgW10sXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICB0aGlzLmlzSW5UYXJnZXRPdmVycmlkZXMuYmluZCh0aGlzLCBjb21wLCByb290Ll9wcmVmYWI/LnRhcmdldE92ZXJyaWRlcykpOyAvLyDliKnnlKjlgY/lh73mlbDkvKDlhaXpooTorr7lj4LmlbBcclxuICAgICAgICAgICAgICAgIC8vIGlmIChkaWZmSW5mb3MgJiYgZGlmZkluZm9zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpZmZJbmZvcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjb25zdCBpbmZvID0gZGlmZkluZm9zW2ldO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB0aGlzLmNoZWNrVG9BZGRUYXJnZXRPdmVycmlkZShjb21wLCBpbmZvLCByb290KTtcclxuICAgICAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFRhcmdldE92ZXJyaWRlV2l0aE1vZGlmeVBhdGgobm9kZSwgcGF0aEtleXMsIHJvb3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWmguaenOaUueS6hue7hOS7tu+8jOS4lCBwYXRoIOmVv+W6puWPquaciSAy77yM5YiZ5piv6K6+572u5LqG5pW05Liq57uE5Lu2XHJcbiAgICAgICAgZWxzZSBpZiAoY29tcCAmJiBwYXRoS2V5cy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBjb25zdCBwcm9wczogc3RyaW5nW10gPSBjb21wLmNvbnN0cnVjdG9yLl9fcHJvcHNfXztcclxuICAgICAgICAgICAgcHJvcHMuZm9yRWFjaCgocHJvcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYXR0ciA9IGNjLkNsYXNzLmF0dHIoY29tcCwgcHJvcCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXR0ci52aXNpYmxlICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tUb0FkZFByb3BlcnR5T3ZlcnJpZGVzKG5vZGUsIFsuLi5wYXRoS2V5cywgcHJvcF0sIHJvb3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrVG9BZGRQcm9wZXJ0eU92ZXJyaWRlcyhub2RlLCBwYXRoS2V5cywgcm9vdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LiA5Lqb57uE5Lu277yM5byV5pOO5YaF6YOo5Lya5pyJ5pWw5o2u5pu05paw5pON5L2c77yM5L2G5rKh5pyJ57uf5LiA5aSE55CG77yM5q+U5aaCIGxvZFxcd2lkZ2V0IOeahOabtOaWsFxyXG4gICAgICog6ZKI5a+56L+Z5Lqb57uE5Lu277yM6ZyA6KaB5Zyo6IqC54K55Y+Y5YyW5pe277yM5pu05pawIG92ZXJyaWRlIOaVsOaNrlxyXG4gICAgICogQHBhcmFtIG5vZGVcclxuICAgICAqIEBwYXJhbSBwcm9wUGF0aFxyXG4gICAgICogQHBhcmFtIHJvb3RcclxuICAgICAqL1xyXG4gICAgcHVibGljIHVwZGF0ZVNwZWNpYWxDb21wb25lbnQobm9kZTogTm9kZSwgcHJvcFBhdGg6IHN0cmluZywgcm9vdDogTm9kZSB8IFNjZW5lIHwgbnVsbCkge1xyXG4gICAgICAgIC8vIOacieWPr+iDveWtmOWcqOiKgueCueiiq+WIoOmZpOS6hu+8jOS9huaYr+i/mOWHuuWPkeS6hiB1cGRhdGVTcGVjaWFsQ29tcG9uZW50XHJcbiAgICAgICAgaWYgKCFub2RlLmlzVmFsaWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYgKHByb3BQYXRoID09PSAncG9zaXRpb24nKSB7XHJcbiAgICAgICAgICAgIC8vIOabtOaWsOS4gOS4iyB3aWRnZXRcclxuICAgICAgICAgICAgY29uc3Qgd2lkZ2V0ID0gbm9kZS5nZXRDb21wb25lbnQoV2lkZ2V0KTtcclxuICAgICAgICAgICAgaWYgKHdpZGdldCAmJiAhcHJlZmFiVXRpbHMuaXNNb3VudGVkQ29tcG9uZW50KHdpZGdldCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gbm9kZS5jb21wb25lbnRzLmluZGV4T2Yod2lkZ2V0KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByb3BzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzQWxpZ25MZWZ0OiAnbGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNBbGlnblJpZ2h0OiAncmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzQWxpZ25Ib3Jpem9udGFsQ2VudGVyOiAnaG9yaXpvbnRhbENlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNBbGlnblRvcDogJ3RvcCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNBbGlnbkJvdHRvbTogJ2JvdHRvbScsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNBYnNvbHV0ZVZlcnRpY2FsQ2VudGVyOiAndmVydGljYWxDZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHByb3BzKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICBpZiAod2lkZ2V0W2tleV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja1RvQWRkUHJvcGVydHlPdmVycmlkZXMobm9kZSwgWydfY29tcG9uZW50cycsIGAke2luZGV4fWAsIHByb3BzW2tleV1dLCByb290KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25BZGROb2RlKG5vZGU6IE5vZGUpIHtcclxuICAgICAgICBjb25zdCBwYXJlbnROb2RlID0gbm9kZS5wYXJlbnQ7XHJcblxyXG4gICAgICAgIGlmICghcGFyZW50Tm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUNoaWxkcmVuRGF0YShwYXJlbnROb2RlKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZVJlc2VydmVkUHJvcGVydHlPdmVycmlkZXMobm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uTm9kZUFkZGVkKG5vZGU6IE5vZGUpIHtcclxuICAgICAgICB0aGlzLmNoZWNrVG9BZGRQcmVmYWJBc3NldE1hcChub2RlKTtcclxuXHJcbiAgICAgICAgaWYgKFNlcnZpY2UuRWRpdG9yLmdldEN1cnJlbnRFZGl0b3JUeXBlKCkgPT09ICdwcmVmYWInKSB7XHJcbiAgICAgICAgICAgIC8vIHByZWZhYiDmqKHlvI/kuIvmt7vliqDoioLngrnvvIzpnIDopoHpg73liqAgUHJlZmFiIOebuOWFs+eahOS/oeaBr1xyXG4gICAgICAgICAgICBjb25zdCBwcmVmYWJJbmZvID0gcHJlZmFiVXRpbHMuZ2V0UHJlZmFiKG5vZGUpO1xyXG4gICAgICAgICAgICBjb25zdCByb290Tm9kZSA9IFNlcnZpY2UuRWRpdG9yLmdldFJvb3ROb2RlKCkgYXMgTm9kZTtcclxuICAgICAgICAgICAgaWYgKCFyb290Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJvb3RQcmVmYWJJbmZvID0gcHJlZmFiVXRpbHMuZ2V0UHJlZmFiKHJvb3ROb2RlKTtcclxuICAgICAgICAgICAgaWYgKCFyb290UHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwcmVmYWJJbmZvPy5pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgLy8g5aaC5p6c5piv5bWM5aWX6aKE5Yi25L2T5re75Yqg77yM5a6D5pys6Lqr5piv5pyJIHByZWZhYlJvb3ROb2RlIOeahO+8jOS4jeimgeWOu+aUueWPmOWug1xyXG4gICAgICAgICAgICAgICAgcHJlZmFiSW5mby5pbnN0YW5jZS5wcmVmYWJSb290Tm9kZSA9IHByZWZhYkluZm8uaW5zdGFuY2UucHJlZmFiUm9vdE5vZGUgPz8gcm9vdFByZWZhYkluZm8ucm9vdDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIOmdniBQcmVmYWJJbnN0YW5jZSDoioLngrnmiY3pnIDopoHmt7vliqDmiJbmm7TmlrAgUHJlZmFiSW5mb1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwcmVmYWJJbmZvIHx8ICFwcmVmYWJJbmZvLnJvb3Q/LlsnX3ByZWZhYiddPy5pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyb290UHJlZmFiSW5mby5yb290KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlV0aWxzLmFkZFByZWZhYkluZm8obm9kZSwgcm9vdFByZWZhYkluZm8ucm9vdCwgcm9vdFByZWZhYkluZm8uYXNzZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybigncm9vdCBvZiBQcmVmYWJJbmZvIGlzIG51bGwsIHNldCB0byByb290IG5vZGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5bCGIHJvb3Qg5oyH5ZCR6Ieq5bexXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RQcmVmYWJJbmZvLnJvb3QgPSByb290Tm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiVXRpbHMuYWRkUHJlZmFiSW5mbyhub2RlLCByb290UHJlZmFiSW5mby5yb290LCByb290UHJlZmFiSW5mby5hc3NldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5b2T5LiA5Liq57uE5Lu26ZyA6KaB5byV55So5Yiw5Yir55qEIFByZWZhYkluc3RhbmNlIOS4reeahFxyXG4gICAgICogQHBhcmFtIHRhcmdldCDopoHmo4Dmn6XnmoTnu4Tku7ZcclxuICAgICAqIEBwYXJhbSBkaWZmSW5mbyDlt67lvILmlbDmja5cclxuICAgICAqIEBwYXJhbSByb290IOagueiKgueCuVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNoZWNrVG9BZGRUYXJnZXRPdmVycmlkZSh0YXJnZXQ6IENvbXBvbmVudCwgZGlmZkluZm86IElEaWZmUHJvcGVydHlJbmZvLCByb290OiBOb2RlIHwgbnVsbCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIENvbXBvbmVudCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcHJvcFZhbHVlID0gZGlmZkluZm8udmFsdWU7XHJcblxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBjb25zdCByb290UHJlZmFiSW5mbyA9IHJvb3RbJ19wcmVmYWInXTtcclxuICAgICAgICAvLyDorr7nva4gQ29tcG9uZW50IOeahOafkOS4quWxnuaAp+S4uuepuu+8jOmcgOimgeWIpOaWreaYr+WQpua4hemZpCBUYXJnZXRPdmVycmlkZXNcclxuICAgICAgICBpZiAoKHByb3BWYWx1ZSA9PT0gbnVsbCB8fCBwcm9wVmFsdWUgPT09IHVuZGVmaW5lZCkgJiYgdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHByZWZhYlV0aWxzLnJlbW92ZVRhcmdldE92ZXJyaWRlKHJvb3RQcmVmYWJJbmZvLCB0YXJnZXQsIGRpZmZJbmZvLnBhdGhLZXlzKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNoZWNrTm9kZTogTm9kZSB8IG51bGwgPSBudWxsO1xyXG4gICAgICAgIGlmIChwcm9wVmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XHJcbiAgICAgICAgICAgIGNoZWNrTm9kZSA9IHByb3BWYWx1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHByb3BWYWx1ZSBpbnN0YW5jZW9mIENvbXBvbmVudCkge1xyXG4gICAgICAgICAgICBjaGVja05vZGUgPSBwcm9wVmFsdWUubm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghY2hlY2tOb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNoZWNrUHJlZmFiSW5mbyA9IHByZWZhYlV0aWxzLmdldFByZWZhYihjaGVja05vZGUpO1xyXG4gICAgICAgIGlmICghY2hlY2tQcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOWQkeS4iuafpeaJviBQcmVmYWJJbnN0YW5jZSDot6/lvoRcclxuICAgICAgICBjb25zdCBvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvID0gcHJlZmFiVXRpbHMuZ2V0T3V0TW9zdFByZWZhYkluc3RhbmNlSW5mbyhjaGVja05vZGUpO1xyXG4gICAgICAgIGNvbnN0IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGU6IE5vZGUgfCBudWxsID0gb3V0TW9zdFByZWZhYkluc3RhbmNlSW5mby5vdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlO1xyXG4gICAgICAgIGlmICghb3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocHJvcFZhbHVlIGluc3RhbmNlb2YgTm9kZSAmJiBvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlID09PSBwcm9wVmFsdWUpIHtcclxuICAgICAgICAgICAgLy8g5pyA5aSW55qEIEluc3RhbmNlIOagueiKgueCue+8jOS4jemcgOimgemAmui/hyBUYXJnZXRPdmVycmlkZXMg5p2l6YeN5paw5pig5bCE5LqG77yM55u05o6l5a2Y5Zy65pmv57Si5byV5bCx5Y+v5Lul5om+5YiwXHJcbiAgICAgICAgICAgIHByZWZhYlV0aWxzLnJlbW92ZVRhcmdldE92ZXJyaWRlKHJvb3RQcmVmYWJJbmZvLCB0YXJnZXQsIGRpZmZJbmZvLnBhdGhLZXlzKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdGFyZ2V0UGF0aDogc3RyaW5nW10gPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvLnRhcmdldFBhdGg7XHJcblxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBjb25zdCBvdXRNb3N0UHJlZmFiSW5zdGFuY2U6IFByZWZhYi5fdXRpbHMuUHJlZmFiSW5zdGFuY2UgfCB1bmRlZmluZWQgPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlWydfcHJlZmFiJ10/Lmluc3RhbmNlO1xyXG5cclxuICAgICAgICBpZiAob3V0TW9zdFByZWZhYkluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIHRhcmdldFBhdGguc3BsaWNlKDAsIDEpOyAvLyDkuI3pnIDopoHlrZjmnIDlpJblsYLnmoQgUHJlZmFiSW5zdGFuY2Ug55qEIGZpbGVJRFxyXG4gICAgICAgICAgICAvLyDlj6rlpITnkIZjb21wb25lbnRcclxuICAgICAgICAgICAgaWYgKHByb3BWYWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSBwcm9wVmFsdWVbJ19wcmVmYWInXTtcclxuICAgICAgICAgICAgICAgIGlmIChwcmVmYWJJbmZvICYmIHByZWZhYkluZm8uZmlsZUlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UGF0aC5wdXNoKHByZWZhYkluZm8uZmlsZUlkKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2FuJ3QgZ2V0IGZpbGVJZCBvZiBwcmVmYWIgbm9kZTogJHtwcm9wVmFsdWUubmFtZX1gKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcFZhbHVlIGluc3RhbmNlb2YgQ29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wUHJlZmFiSW5mbyA9IHByb3BWYWx1ZS5fX3ByZWZhYjtcclxuICAgICAgICAgICAgICAgIGlmIChjb21wUHJlZmFiSW5mbyAmJiBjb21wUHJlZmFiSW5mby5maWxlSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRQYXRoLnB1c2goY29tcFByZWZhYkluZm8uZmlsZUlkKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6Z2eIG1vdW50ZWQg55qEIGNvbXBvbmVudCDmiY3pnIDopoHmiqXplJlcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXByZWZhYlV0aWxzLmdldE1vdW50ZWRSb290KHByb3BWYWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2FuJ3QgZ2V0IGZpbGVJZCBvZiBwcmVmYWIgY29tcG9uZW50OiAke3Byb3BWYWx1ZS5uYW1lfSBpbiBub2RlOiAke3Byb3BWYWx1ZS5ub2RlLm5hbWV9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gZ2V0IHJvb3QgcHJlZmFiSW5mb1xyXG4gICAgICAgICAgICAvLyBzY2VuZSBvciByb290IGluIHByZWZhYkFzc2V0XHJcbiAgICAgICAgICAgIGlmICghcm9vdCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIGlmICghcm9vdFsnX3ByZWZhYiddKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICByb290WydfcHJlZmFiJ10gPSBwcmVmYWJVdGlscy5jcmVhdGVQcmVmYWJJbmZvKHJvb3QudXVpZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgY29uc3Qgcm9vdFByZWZhYkluZm8gPSByb290WydfcHJlZmFiJ10hO1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRPdmVycmlkZSA9IHByZWZhYlV0aWxzLmdldFRhcmdldE92ZXJyaWRlKHJvb3RQcmVmYWJJbmZvLCB0YXJnZXQsIGRpZmZJbmZvLnBhdGhLZXlzKTtcclxuICAgICAgICAgICAgaWYgKHRhcmdldE92ZXJyaWRlKSB7XHJcbiAgICAgICAgICAgICAgICBwcmVmYWJVdGlscy5maXJlQmVmb3JlQ2hhbmdlTXNnKHJvb3QpO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0T3ZlcnJpZGUudGFyZ2V0ID0gb3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldEluZm8gPSBuZXcgVGFyZ2V0SW5mbygpO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0SW5mby5sb2NhbElEID0gdGFyZ2V0UGF0aDtcclxuICAgICAgICAgICAgICAgIHRhcmdldE92ZXJyaWRlLnRhcmdldEluZm8gPSB0YXJnZXRJbmZvO1xyXG4gICAgICAgICAgICAgICAgcHJlZmFiVXRpbHMuZmlyZUNoYW5nZU1zZyhyb290KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5a+55q+U5b2T5YmN6IqC54K55ZKM5a+55bqU6aKE5Yi25L2T5Y6f5aeL6LWE5rqQ5Lit55qE5pWw5o2u55qE5beu5byCXHJcbiAgICBwcml2YXRlIGNoZWNrVG9BZGRQcm9wZXJ0eU92ZXJyaWRlcyhub2RlOiBOb2RlLCBwYXRoS2V5czogc3RyaW5nW10sIHJvb3Q6IE5vZGUgfCBudWxsKSB7XHJcbiAgICAgICAgLy8g6I635Y+W6IqC54K55omA5bGe6aKE5Yi25L2T55qE55u45YWz5L+h5oGvXHJcbiAgICAgICAgY29uc3QgcHJvcGVydHlPdmVycmlkZUxvY2F0aW9uID0gcHJlZmFiVXRpbHMuZ2V0UHJvcGVydHlPdmVycmlkZUxvY2F0aW9uSW5mbyhub2RlLCBwYXRoS2V5cyk7XHJcblxyXG4gICAgICAgIGlmICghcHJvcGVydHlPdmVycmlkZUxvY2F0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUgPSBwcm9wZXJ0eU92ZXJyaWRlTG9jYXRpb24ub3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZTtcclxuICAgICAgICBpZiAoIW91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluZm8gPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlWydfcHJlZmFiJ107XHJcbiAgICAgICAgaWYgKCFvdXRNb3N0UHJlZmFiSW5mbyB8fCAhb3V0TW9zdFByZWZhYkluZm8uYXNzZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0TW9zdFByZWZhYkluc3RhbmNlID0gb3V0TW9zdFByZWZhYkluZm8/Lmluc3RhbmNlO1xyXG4gICAgICAgIGlmICghb3V0TW9zdFByZWZhYkluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGN1clRhcmdldCA9IHByb3BlcnR5T3ZlcnJpZGVMb2NhdGlvbi50YXJnZXQ7XHJcblxyXG4gICAgICAgIGNvbnN0IG1vdW50ZWRSb290ID0gcHJlZmFiVXRpbHMuZ2V0TW91bnRlZFJvb3QoY3VyVGFyZ2V0KTtcclxuICAgICAgICAvLyDlpoLmnpzkv67mlLnnmoTmmK/kuIDkuKrlnKjlvZPliY3kuIrkuIvmlofkuIvnmoQgbW91bnRlZCDoioLngrnmiJbnu4Tku7bvvIzlsLHkuI3pnIDopoHlhpkgb3ZlcnJpZGVz77yM5Zug5Li6IG1vdW50ZWQg55qE6IqC54K55oiW57uE5Lu25pys6Lqr5bCx5Lya6KKr5bqP5YiX5YyWXHJcbiAgICAgICAgaWYgKG1vdW50ZWRSb290ICYmIG1vdW50ZWRSb290ID09PSBvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxvY2FsSUQgPSBwcm9wZXJ0eU92ZXJyaWRlTG9jYXRpb24udGFyZ2V0UGF0aDtcclxuICAgICAgICBjb25zdCBhc3NldFJvb3ROb2RlOiBOb2RlIHwgdW5kZWZpbmVkID0gcHJlZmFiVXRpbHMuZ2V0UHJlZmFiQXNzZXROb2RlSW5zdGFuY2Uob3V0TW9zdFByZWZhYkluZm8pO1xyXG4gICAgICAgIGlmICghYXNzZXRSb290Tm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB0YXJnZXRJbkFzc2V0ID0gcHJlZmFiVXRpbHMuZ2V0VGFyZ2V0KGxvY2FsSUQsIGFzc2V0Um9vdE5vZGUpO1xyXG5cclxuICAgICAgICBpZiAoIXRhcmdldEluQXNzZXQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgY2FuJ3QgZmluZCBpdGVtOiAke2N1clRhcmdldC5uYW1lfSBpbiBwcmVmYWIgYXNzZXQgJHtvdXRNb3N0UHJlZmFiSW5mby5hc3NldC5fdXVpZH1gKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcHJvcE92ZXJyaWRlcyA9IHByZWZhYlV0aWxzLmdldFByb3BlcnR5T3ZlcnJpZGVzT2ZUYXJnZXQob3V0TW9zdFByZWZhYkluc3RhbmNlLCBsb2NhbElEKTtcclxuICAgICAgICBjb25zdCBkaWZmSW5mb3MgPSB0aGlzLmdldERpZmZQcm9wZXJ0eUluZm9zKGN1clRhcmdldCwgdGFyZ2V0SW5Bc3NldCwgW10sIHRoaXMuaXNJblByb3BlcnR5T3ZlcnJpZGVzLmJpbmQodGhpcywgcHJvcE92ZXJyaWRlcykpOyAvLyDliKnnlKjlgY/lh73mlbDkvKDlhaXpooTorr7lj4LmlbBcclxuXHJcbiAgICAgICAgLy8g5riF6Zmk5Lul5YmN55SoIHNldHRlciDorrDlvZXkuIvnmoTmlbDmja5cclxuICAgICAgICAvLyBwcmVmYWJVdGlsLnJlbW92ZVByb3BlcnR5T3ZlcnJpZGUob3V0TW9zdFByZWZhYkluc3RhbmNlLCBsb2NhbElELCBwcm9wZXJ0eU92ZXJyaWRlTG9jYXRpb24ucmVsYXRpdmVQYXRoS2V5cyk7XHJcbiAgICAgICAgaWYgKGRpZmZJbmZvcyAmJiBkaWZmSW5mb3MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBwcmVmYWJVdGlscy5maXJlQmVmb3JlQ2hhbmdlTXNnKHByb3BlcnR5T3ZlcnJpZGVMb2NhdGlvbi5vdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGlmZkluZm9zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmZvID0gZGlmZkluZm9zW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjdXJUYXJnZXQgaW5zdGFuY2VvZiBDb21wb25lbnQgJiYgdGhpcy5jaGVja1RvQWRkVGFyZ2V0T3ZlcnJpZGUoY3VyVGFyZ2V0LCBpbmZvLCByb290KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvcE92ZXJyaWRlID0gcHJlZmFiVXRpbHMuZ2V0UHJvcGVydHlPdmVycmlkZShvdXRNb3N0UHJlZmFiSW5zdGFuY2UsIGxvY2FsSUQsIGluZm8ucGF0aEtleXMpO1xyXG4gICAgICAgICAgICAgICAgcHJvcE92ZXJyaWRlLnZhbHVlID0gaW5mby52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocm9vdCkge1xyXG4gICAgICAgICAgICAgICAgLy8gZGlmZlByb3BlcnR5SW5mb3Mg6I635Y+W5Yiw55qE5beu5byC5L+h5oGvLOacieS6m+aDheWGteS8mua8j+aOie+8jOebtOaOpeavlOi+g+acgOWHhuehrlxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRUYXJnZXRPdmVycmlkZVdpdGhNb2RpZnlQYXRoKG5vZGUsIHBhdGhLZXlzLCByb290KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwcmVmYWJVdGlscy5maXJlQ2hhbmdlTXNnKHByb3BlcnR5T3ZlcnJpZGVMb2NhdGlvbi5vdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5piv5ZCm5bey57uP5ZyoIFRhcmdldE92ZXJyaWRlIOiusOW9leS4rVxyXG4gICAgcHJpdmF0ZSBpc0luVGFyZ2V0T3ZlcnJpZGVzKHNvdXJjZTogQ29tcG9uZW50LCB0YXJnZXRPdmVycmlkZXM6IFRhcmdldE92ZXJyaWRlSW5mb1tdIHwgbnVsbCwgcGF0aEtleXM6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgaWYgKCF0YXJnZXRPdmVycmlkZXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcHJlZmFiVXRpbHMuaXNJblRhcmdldE92ZXJyaWRlcyh0YXJnZXRPdmVycmlkZXMsIHNvdXJjZSwgcGF0aEtleXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOaYr+WQpuWcqCBQcm9wZXJ0eU92ZXJyaWRlcyDkuK1cclxuICAgIHByaXZhdGUgaXNJblByb3BlcnR5T3ZlcnJpZGVzKHByb3BlcnR5T3ZlcnJpZGVzOiBQcm9wZXJ0eU92ZXJyaWRlSW5mb1tdLCBwYXRoS2V5czogc3RyaW5nW10pIHtcclxuICAgICAgICByZXR1cm4gcHJlZmFiVXRpbHMuaXNJblByb3BlcnR5T3ZlcnJpZGVzKHBhdGhLZXlzLCBwcm9wZXJ0eU92ZXJyaWRlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlr7nmr5TlvpfliLDkuKTkuKogY2NDbGFzcyDnmoTlt67lvILmlbDmja5cclxuICAgICAqIEBwYXJhbSBjdXJUYXJnZXQg5a+55q+U55qE5a+56LGhXHJcbiAgICAgKiBAcGFyYW0gY29tcGFyZWRUYXJnZXQg6KKr5q+U6L6D55qE5a+56LGhXHJcbiAgICAgKiBAcGFyYW0gcHJvcFBhdGhLZXlzIOW9k+WJjeWvueixoeeahOWxnuaAp+i3r+W+hOaVsOe7hFxyXG4gICAgICogQHBhcmFtIGlzTW9kaWZpZWRGdW5jIOeUqOS6juWIpOaWreWxnuaAp+aYr+WQpuiiq+S/ruaUueeahOaWueazlVxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXREaWZmUHJvcGVydHlJbmZvcyhcclxuICAgICAgICBjdXJUYXJnZXQ6IGFueSxcclxuICAgICAgICBjb21wYXJlZFRhcmdldDogYW55LFxyXG4gICAgICAgIHByb3BQYXRoS2V5czogc3RyaW5nW10sXHJcbiAgICAgICAgaXNNb2RpZmllZEZ1bmM6IEZ1bmN0aW9uLFxyXG4gICAgKTogbnVsbCB8IElEaWZmUHJvcGVydHlJbmZvW10ge1xyXG4gICAgICAgIGlmICghY3VyVGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY3VyVGFyZ2V0Q3RvciA9IGN1clRhcmdldC5jb25zdHJ1Y3RvcjtcclxuICAgICAgICBjb25zdCBjb21wYXJlZFRhcmdldEN0b3IgPSBjb21wYXJlZFRhcmdldC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICAgICAgaWYgKCFjdXJUYXJnZXRDdG9yIHx8ICFjb21wYXJlZFRhcmdldEN0b3IgfHwgY3VyVGFyZ2V0Q3RvciAhPT0gY29tcGFyZWRUYXJnZXRDdG9yKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGNvbnN0IHByb3BzID0gY3VyVGFyZ2V0Q3Rvci5fX3ZhbHVlc19fOyAvLyDlj6/luo/liJfljJbnmoTlsZ7mgKfpg73mlL7lnKjov5nph4zovrlcclxuICAgICAgICBjb25zdCBleGNsdWRlUHJvcHMgPSBnZXREaWZmRXhjbHVkZVByb3BzKGN1clRhcmdldEN0b3IpO1xyXG5cclxuICAgICAgICBsZXQgZGlmZlByb3BlcnR5SW5mb3M6IElEaWZmUHJvcGVydHlJbmZvW10gPSBbXTtcclxuICAgICAgICBwcm9wcy5tYXAoKGtleTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChleGNsdWRlUHJvcHMuaW5jbHVkZXMoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBhdHRyID0gQ0NDbGFzcy5hdHRyKGN1clRhcmdldEN0b3IsIGtleSk7XHJcbiAgICAgICAgICAgIGlmIChhdHRyLnNlcmlhbGl6YWJsZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgY3VyUHJvcFZhbHVlID0gY3VyVGFyZ2V0W2tleV07XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmVkUHJvcFZhbHVlID0gY29tcGFyZWRUYXJnZXRba2V5XTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGluZm9zID0gdGhpcy5oYW5kbGVEaWZmUHJvcGVydHlJbmZvcyhjdXJQcm9wVmFsdWUsIGNvbXBhcmVkUHJvcFZhbHVlLCBrZXksIHByb3BQYXRoS2V5cywgaXNNb2RpZmllZEZ1bmMpO1xyXG4gICAgICAgICAgICBkaWZmUHJvcGVydHlJbmZvcyA9IGRpZmZQcm9wZXJ0eUluZm9zLmNvbmNhdChpbmZvcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBkaWZmUHJvcGVydHlJbmZvcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZURpZmZQcm9wZXJ0eUluZm9zKFxyXG4gICAgICAgIGN1clByb3BWYWx1ZTogYW55LFxyXG4gICAgICAgIGNvbXBhcmVkUHJvcFZhbHVlOiBhbnksXHJcbiAgICAgICAgcHJvcE5hbWU6IHN0cmluZyxcclxuICAgICAgICBwcm9wUGF0aEtleXM6IHN0cmluZ1tdLFxyXG4gICAgICAgIGlzTW9kaWZpZWRGdW5jOiBGdW5jdGlvbixcclxuICAgICkge1xyXG4gICAgICAgIGxldCBkaWZmUHJvcGVydHlJbmZvczogSURpZmZQcm9wZXJ0eUluZm9bXSA9IFtdO1xyXG5cclxuICAgICAgICBjb25zdCBwYXRoS2V5cyA9IHByb3BQYXRoS2V5cy5jb25jYXQocHJvcE5hbWUpO1xyXG4gICAgICAgIGNvbnN0IGRpZmZQcm9wOiBJRGlmZlByb3BlcnR5SW5mbyA9IHtcclxuICAgICAgICAgICAgcGF0aEtleXMsXHJcbiAgICAgICAgICAgIHZhbHVlOiBjdXJQcm9wVmFsdWUsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoY3VyUHJvcFZhbHVlID09PSBudWxsIHx8IGN1clByb3BWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGlmIChjdXJQcm9wVmFsdWUgIT09IGNvbXBhcmVkUHJvcFZhbHVlIHx8IGlzTW9kaWZpZWRGdW5jKHBhdGhLZXlzKSkge1xyXG4gICAgICAgICAgICAgICAgZGlmZlByb3BlcnR5SW5mb3MucHVzaChkaWZmUHJvcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoY29tcGFyZWRQcm9wVmFsdWUgPT09IG51bGwgfHwgY29tcGFyZWRQcm9wVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBpc01vZGlmaWVkRnVuYyhwYXRoS2V5cykpIHtcclxuICAgICAgICAgICAgICAgIGRpZmZQcm9wZXJ0eUluZm9zLnB1c2goZGlmZlByb3ApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8g5Lik5Liq6ZyA6KaB5a+55q+U55qE5YC86YO96Z2e56m677yM6ZyA6KaB6L+b6KGM5pu06K+m57uG55qE5a+55q+UXHJcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjdXJQcm9wVmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5pWw57uE6ZW/5bqm5Y+R55Sf5Y+Y5YyW77yM6ZyA6KaB6K6w5b2VXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVuZ3RoUGF0aEtleXMgPSBwYXRoS2V5cy5jb25jYXQoJ2xlbmd0aCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJQcm9wVmFsdWUubGVuZ3RoICE9PSBjb21wYXJlZFByb3BWYWx1ZS5sZW5ndGggfHwgaXNNb2RpZmllZEZ1bmMobGVuZ3RoUGF0aEtleXMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlbmd0aERpZmZQcm9wOiBJRGlmZlByb3BlcnR5SW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhLZXlzOiBsZW5ndGhQYXRoS2V5cyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJQcm9wVmFsdWUubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmUHJvcGVydHlJbmZvcy5wdXNoKGxlbmd0aERpZmZQcm9wKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY3VyUHJvcFZhbHVlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZm9zID0gdGhpcy5oYW5kbGVEaWZmUHJvcGVydHlJbmZvcyhjdXJQcm9wVmFsdWVbaV0sIGNvbXBhcmVkUHJvcFZhbHVlW2ldLCAnJyArIGksIHBhdGhLZXlzLCBpc01vZGlmaWVkRnVuYyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvcyAmJiBpbmZvcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmUHJvcGVydHlJbmZvcyA9IGRpZmZQcm9wZXJ0eUluZm9zLmNvbmNhdChpbmZvcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjdXJQcm9wVmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1clByb3BWYWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmVmYWJJbmZvID0gY3VyUHJvcFZhbHVlWydfcHJlZmFiJ107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaZrumAmuiKgueCueeUqCB1dWlkIOavlOi+g++8jHByZWZhYiDnlKggZmlsZUlkIOavlOi+g++8iOWPr+iDveS8muacieebuOWQjO+8jOS5i+WQjuWGjSBmaXjvvIlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHByZWZhYkluZm8gJiYgcHJlZmFiSW5mby5maWxlSWQgIT09IGNvbXBhcmVkUHJvcFZhbHVlWydfcHJlZmFiJ10/LmZpbGVJZCkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1clByb3BWYWx1ZS51dWlkICE9PSBjb21wYXJlZFByb3BWYWx1ZS51dWlkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlByb3BlcnR5SW5mb3MucHVzaChkaWZmUHJvcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1clByb3BWYWx1ZSBpbnN0YW5jZW9mIENvbXBvbmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmma7pgJrnu4Tku7bnu4Tku7bnlKggdXVpZCDmr5TovoPvvIxwcmVmYWIg55SoIGZpbGVJZCDmr5TovoPvvIjlj6/og73kvJrmnInnm7jlkIzvvIzkuYvlkI7lho0gZml477yJXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjdXJQcm9wVmFsdWUuX19wcmVmYWIgJiYgY3VyUHJvcFZhbHVlLl9fcHJlZmFiLmZpbGVJZCAhPT0gY29tcGFyZWRQcm9wVmFsdWUuX19wcmVmYWI/LmZpbGVkSWQpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJQcm9wVmFsdWUudXVpZCAhPT0gY29tcGFyZWRQcm9wVmFsdWUudXVpZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZQcm9wZXJ0eUluZm9zLnB1c2goZGlmZlByb3ApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJQcm9wVmFsdWUgaW5zdGFuY2VvZiBWYWx1ZVR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjdXJQcm9wVmFsdWUuZXF1YWxzKGNvbXBhcmVkUHJvcFZhbHVlKSB8fCBpc01vZGlmaWVkRnVuYyhwYXRoS2V5cykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZQcm9wZXJ0eUluZm9zLnB1c2goZGlmZlByb3ApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJQcm9wVmFsdWUgaW5zdGFuY2VvZiBBc3NldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyUHJvcFZhbHVlLl91dWlkICE9PSBjb21wYXJlZFByb3BWYWx1ZS5fdXVpZCB8fCBpc01vZGlmaWVkRnVuYyhwYXRoS2V5cykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZQcm9wZXJ0eUluZm9zLnB1c2goZGlmZlByb3ApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChDQ0NsYXNzLmlzQ0NDbGFzc09yRmFzdERlZmluZWQoY3VyUHJvcFZhbHVlLmNvbnN0cnVjdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmZvcyA9IHRoaXMuZ2V0RGlmZlByb3BlcnR5SW5mb3MoY3VyUHJvcFZhbHVlLCBjb21wYXJlZFByb3BWYWx1ZSwgcGF0aEtleXMsIGlzTW9kaWZpZWRGdW5jKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm9zICYmIGluZm9zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZQcm9wZXJ0eUluZm9zID0gZGlmZlByb3BlcnR5SW5mb3MuY29uY2F0KGluZm9zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJpbWl0aXZlIHR5cGVcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VyUHJvcFZhbHVlICE9PSBjb21wYXJlZFByb3BWYWx1ZSB8fCBpc01vZGlmaWVkRnVuYyhwYXRoS2V5cykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlByb3BlcnR5SW5mb3MucHVzaChkaWZmUHJvcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZGlmZlByb3BlcnR5SW5mb3M7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnm7TmjqXpgJrov4fkv67mlLnoioLngrnot6/lvoTmnaXliKTmlq3mt7vliqAgdGFyZ2V0T3ZlcnJpZGUg5L+h5oGvXHJcbiAgICAgKiBAcGFyYW0gbm9kZSDkv67mlLnnmoToioLngrlcclxuICAgICAqIEBwYXJhbSBwYXRoS2V5cyDlsZ7mgKfplK7lgLzot6/lvoRcclxuICAgICAqIEBwYXJhbSByb290XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYWRkVGFyZ2V0T3ZlcnJpZGVXaXRoTW9kaWZ5UGF0aChub2RlOiBOb2RlLCBwYXRoS2V5czogc3RyaW5nW10sIHJvb3Q6IE5vZGUpIHtcclxuICAgICAgICBsZXQgdmFsdWUgPSBub2RlO1xyXG4gICAgICAgIGxldCBjb21wOiBDb21wb25lbnQgfCBudWxsID0gbnVsbDtcclxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcGF0aEtleXMubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHBhdGhLZXlzW2luZGV4XTtcclxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkgYnJlYWs7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZVtrZXldO1xyXG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IDEgJiYgcGF0aEtleXNbMF0gPT09ICdfY29tcG9uZW50cycpIHtcclxuICAgICAgICAgICAgICAgIC8vIOe7hOS7tuW/heeEtuaYr19jb21wb25lbnRzW3hd5byA5aS0XHJcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICBjb21wID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlICE9PSBub2RlICYmIGNvbXApIHtcclxuICAgICAgICAgICAgLy8g5b+F6aG756e76Zmk5o6J57uE5Lu255qE6Lev5b6E77yM5Zug5Li6dGFyZ2V0T3ZlcnJpZGVJbmZv5piv5a2Y55qEY29tcOiAjOS4jeaYr25vZGVcclxuICAgICAgICAgICAgcGF0aEtleXMuc2hpZnQoKTtcclxuICAgICAgICAgICAgcGF0aEtleXMuc2hpZnQoKTtcclxuICAgICAgICAgICAgdGhpcy5jaGVja1RvQWRkVGFyZ2V0T3ZlcnJpZGUoY29tcCwgeyBwYXRoS2V5czogcGF0aEtleXMsIHZhbHVlOiB2YWx1ZSB9LCByb290KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjaGVja1RvQWRkUHJlZmFiQXNzZXRNYXAobm9kZTogTm9kZSkge1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBjb25zdCBwcmVmYWJJbmZvID0gbm9kZVsnX3ByZWZhYiddO1xyXG4gICAgICAgIGNvbnN0IHByZWZhYkluc3RhbmNlID0gcHJlZmFiSW5mbz8uaW5zdGFuY2U7XHJcbiAgICAgICAgaWYgKHByZWZhYkluc3RhbmNlICYmIHByZWZhYkluZm8/LmFzc2V0KSB7XHJcbiAgICAgICAgICAgIGxldCBub2RlcyA9IHRoaXMuYXNzZXRUb05vZGVzTWFwLmdldChwcmVmYWJJbmZvLmFzc2V0Ll91dWlkKTtcclxuICAgICAgICAgICAgaWYgKCFub2Rlcykge1xyXG4gICAgICAgICAgICAgICAgbm9kZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXRUb05vZGVzTWFwLnNldChwcmVmYWJJbmZvLmFzc2V0Ll91dWlkLCBub2Rlcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghbm9kZXMuaW5jbHVkZXMobm9kZSkpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVzLnB1c2gobm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uTm9kZUNoYW5nZWRJbkdlbmVyYWxNb2RlKG5vZGU6IE5vZGUsIG9wdHM6IElDaGFuZ2VOb2RlT3B0aW9ucywgcm9vdDogTm9kZSB8IFNjZW5lIHwgbnVsbCkge1xyXG4gICAgICAgIGlmICghb3B0cykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3B0cy50eXBlID09PSBOb2RlRXZlbnRUeXBlLkNISUxEX0NIQU5HRUQpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVDaGlsZHJlbkRhdGEobm9kZSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9IGVsc2UgaWYgKG9wdHMudHlwZSA9PT0gTm9kZUV2ZW50VHlwZS5QQVJFTlRfQ0hBTkdFRCkge1xyXG4gICAgICAgICAgICBpZiAoU2VydmljZS5FZGl0b3IuZ2V0Q3VycmVudEVkaXRvclR5cGUoKSA9PT0gJ3ByZWZhYicpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZhYkluc3RhbmNlID0gbm9kZVsnX3ByZWZhYiddPy5pbnN0YW5jZTtcclxuICAgICAgICAgICAgICAgIGlmIChwcmVmYWJJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYkluc3RhbmNlLnByZWZhYlJvb3ROb2RlID0gcm9vdCBhcyBOb2RlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3B0cy5wcm9wUGF0aCA9PT0gJ2NoaWxkcmVuJyAmJiBvcHRzLnR5cGUgPT09IE5vZGVFdmVudFR5cGUuTU9WRV9BUlJBWV9FTEVNRU5UKSB7XHJcbiAgICAgICAgICAgIC8vIOS4jeiusOW9lSBjaGlsZHJlbiDnmoTlj5jliqjlgLzliLAgb3ZlcnJpZGUg5LitXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOS/ruaUuSBQcmVmYWJJbnN0YW5jZSDkuK3oioLngrnmlbDmja7vvIzopoHkv53lrZjlnKjmnIDlpJblsYLnmoQgUHJlZmFiSW5zdGFuY2XkuK1cclxuICAgICAgICBpZiAob3B0cy5wcm9wUGF0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBrZXkgPSBub2RlLnV1aWQgKyAnfCcgKyBvcHRzLnByb3BQYXRoO1xyXG4gICAgICAgICAgICB0aGlzLl90aW1lclV0aWwuY2FsbEZ1bmN0aW9uTGltaXQoa2V5LCB0aGlzLmNoZWNrVG9BZGRPdmVycmlkZXMuYmluZCh0aGlzKSwgbm9kZSwgb3B0cy5wcm9wUGF0aCwgcm9vdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl90aW1lclV0aWwuY2FsbEZ1bmN0aW9uTGltaXQobm9kZS51dWlkLCB0aGlzLnVwZGF0ZVNwZWNpYWxDb21wb25lbnQuYmluZCh0aGlzKSwgbm9kZSwgb3B0cy5wcm9wUGF0aCwgcm9vdCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliKTmlq3mmK/lkKbmmK/pnIDopoHkv53nlZnnmoQgUHJvcGVydHlPdmVycmlkZVxyXG4gICAgICogQHBhcmFtIHByb3BPdmVycmlkZSBQcmVmYWIg5a6e5L6LXHJcbiAgICAgKiBAcGFyYW0gcHJlZmFiUm9vdEZpbGVJZCBwcmVmYWIg5qC56IqC54K555qEIEZpbGVJZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaXNSZXNlcnZlZFByb3BlcnR5T3ZlcnJpZGVzKHByb3BPdmVycmlkZTogUHJlZmFiLl91dGlscy5Qcm9wZXJ0eU92ZXJyaWRlSW5mbywgcHJlZmFiUm9vdEZpbGVJZDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0SW5mbyA9IHByb3BPdmVycmlkZS50YXJnZXRJbmZvO1xyXG4gICAgICAgIGlmICh0YXJnZXRJbmZvPy5sb2NhbElELmxlbmd0aCA9PT0gMSAmJiB0YXJnZXRJbmZvLmxvY2FsSURbMF0gPT09IHByZWZhYlJvb3RGaWxlSWQpIHtcclxuICAgICAgICAgICAgY29uc3QgcHJvcFBhdGggPSBwcm9wT3ZlcnJpZGUucHJvcGVydHlQYXRoO1xyXG4gICAgICAgICAgICBpZiAocHJvcFBhdGgubGVuZ3RoID09PSAxICYmIFJvb3RSZXNlcnZlZFByb3BlcnR5LmluY2x1ZGVzKHByb3BQYXRoWzBdKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOenu+mZpOWunuS+i+eahCBQcm9wZXJ0eU92ZXJyaWRlc++8jOS/neeVmeS4gOS6m+S4gOiIrOS4jemcgOimgeWSjCBQcmVmYWJBc3NldCDoh6rliqjlkIzmraXnmoTopobnm5ZcclxuICAgICAqIEBwYXJhbSBwcmVmYWJJbnN0YW5jZSBQcmVmYWIg5a6e5L6LXHJcbiAgICAgKiBAcGFyYW0gcHJlZmFiUm9vdEZpbGVJZCBwcmVmYWIg5qC56IqC54K555qEIEZpbGVJZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVtb3ZlTW9kaWZpZWRQcm9wZXJ0eU92ZXJyaWRlcyhwcmVmYWJJbnN0YW5jZTogUHJlZmFiSW5zdGFuY2UsIHByZWZhYlJvb3RGaWxlSWQ6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHJlc2VydmVkUHJvcGVydHlPdmVycmlkZXMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZhYkluc3RhbmNlLnByb3BlcnR5T3ZlcnJpZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3BPdmVycmlkZSA9IHByZWZhYkluc3RhbmNlLnByb3BlcnR5T3ZlcnJpZGVzW2ldO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc1Jlc2VydmVkUHJvcGVydHlPdmVycmlkZXMocHJvcE92ZXJyaWRlLCBwcmVmYWJSb290RmlsZUlkKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzZXJ2ZWRQcm9wZXJ0eU92ZXJyaWRlcy5wdXNoKHByb3BPdmVycmlkZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByZWZhYkluc3RhbmNlLnByb3BlcnR5T3ZlcnJpZGVzID0gcmVzZXJ2ZWRQcm9wZXJ0eU92ZXJyaWRlcztcclxuICAgIH1cclxuXHJcbiAgICAvLyDlpITnkIbltYzlpZfoioLngrnnmoQgT3ZlcnJpZGXvvIzopoHku47lnLrmma/nmoQgaW5zdGFuY2Ug5YaZ5YiwIHByZWZhYiDotYTmupDkuK3nmoTltYzlpZflrZDoioLngrnkuIrnmoQgaW5zdGFuY2Ug55qEIG92ZXJyaWRlIOS4rVxyXG4gICAgcHVibGljIGFwcGx5TW91bnRlZENoaWxkcmVuKG5vZGU6IE5vZGUpIHtcclxuICAgICAgICBjb25zdCByb290Tm9kZTogTm9kZSA9IG5vZGU7XHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IHByZWZhYlV0aWxzLmdldFByZWZhYihyb290Tm9kZSk7XHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbmZvIHx8ICFwcmVmYWJJbmZvLmluc3RhbmNlKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHByZWZhYkluc3RhbmNlID0gcHJlZmFiSW5mby5pbnN0YW5jZTtcclxuICAgICAgICBjb25zdCBtb3VudGVkQ2hpbGRyZW5NYXAgPSBuZXcgTWFwPHN0cmluZ1tdLCBJTm9kZVByZWZhYkRhdGE+KCk7XHJcbiAgICAgICAgY29uc3QgbW91bnRlZENoaWxkcmVuID0gcHJlZmFiSW5zdGFuY2UubW91bnRlZENoaWxkcmVuO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1vdW50ZWRDaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBtb3VudGVkQ2hpbGRJbmZvID0gbW91bnRlZENoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRJbmZvID0gbW91bnRlZENoaWxkSW5mby50YXJnZXRJbmZvO1xyXG4gICAgICAgICAgICBpZiAoIXRhcmdldEluZm8pIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBsb2NhbElEIOmVv+W6puWkp+S6jjHvvIzooajnpLrmmK/liqDliLDkuobltYzlpZfnmoQgUHJlZmFiSW5zdGFuY2Ug6IqC54K55Lit5Y675LqGXHJcbiAgICAgICAgICAgIGlmICh0YXJnZXRJbmZvLmxvY2FsSUQubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgLy8g6ZyA6KaB5bCGIG1vdW50ZWQg55qE5L+h5oGv5Yqg5Yiw5bWM5aWX55qE6YKj5LiqIFByZWZhYkluc3RhbmNlIOS4reWOu1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHByZWZhYlV0aWxzLmdldFRhcmdldCh0YXJnZXRJbmZvLmxvY2FsSUQsIHJvb3ROb2RlKSBhcyBOb2RlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIOaJvuS4i+S4gOe6p+eahCBQcmVmYWJJbnN0YW5jZVxyXG4gICAgICAgICAgICAgICAgcHJlZmFiSW5mby5pbnN0YW5jZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5lc3RlZEluc3RQcmVmYWJJbnN0YW5jZUluZm8gPSBwcmVmYWJVdGlscy5nZXRPdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvKHRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICBwcmVmYWJJbmZvLmluc3RhbmNlID0gcHJlZmFiSW5zdGFuY2U7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbmVzdGVkSW5zdE5vZGUgPSBuZXN0ZWRJbnN0UHJlZmFiSW5zdGFuY2VJbmZvLm91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGU7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW5lc3RlZEluc3ROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgY29uc3QgbmVzdGVkSW5zdFByZWZhYkluZm8gPSBuZXN0ZWRJbnN0Tm9kZVsnX3ByZWZhYiddO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFuZXN0ZWRJbnN0UHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgbmVzdGVkSW5zdFByZWZhYkluc3RhbmNlID0gbmVzdGVkSW5zdFByZWZhYkluZm8uaW5zdGFuY2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW5lc3RlZEluc3RQcmVmYWJJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldFBhdGggPSBuZXN0ZWRJbnN0UHJlZmFiSW5zdGFuY2VJbmZvLnRhcmdldFBhdGguc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1vdW50ZWRQYXJlbnRQYXRoID0gbmVzdGVkSW5zdFByZWZhYkluc3RhbmNlSW5mby50YXJnZXRQYXRoLnNsaWNlKDEpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0RmlsZUlkID0gcHJlZmFiVXRpbHMuZ2V0UHJlZmFiKHRhcmdldCk/LmZpbGVJZDtcclxuICAgICAgICAgICAgICAgIGlmICghdGFyZ2V0RmlsZUlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtb3VudGVkUGFyZW50UGF0aC5wdXNoKHRhcmdldEZpbGVJZCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXN0ZWRNb3VudGVkQ2hpbGRJbmZvID0gcHJlZmFiVXRpbHMuZ2V0UHJlZmFiSW5zdGFuY2VNb3VudGVkQ2hpbGRyZW4obmVzdGVkSW5zdFByZWZhYkluc3RhbmNlLCBtb3VudGVkUGFyZW50UGF0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbW91bnRlZENoaWxkSW5mby5ub2Rlcy5mb3JFYWNoKChtb3VudGVkTm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBvbGRQcmVmYWJJbmZvID0gbW91bnRlZE5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICAgICAgICAgICAgICBwcmVmYWJVdGlscy5hZGRQcmVmYWJJbmZvKG1vdW50ZWROb2RlLCBuZXN0ZWRJbnN0Tm9kZSwgbmVzdGVkSW5zdFByZWZhYkluZm8uYXNzZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYlV0aWxzLnNldE1vdW50ZWRSb290KG1vdW50ZWROb2RlLCBuZXN0ZWRJbnN0Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vdW50ZWROb2RlUHJlZmFiSW5mbyA9IG1vdW50ZWROb2RlWydfcHJlZmFiJ107XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtb3VudGVkTm9kZVByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyDmib7liLDljp/mnaXnmoQgbW91bnRlZCDoioLngrnvvIzlnKjmlrDnmoQgUHJlZmFiIOS4i+eahCBMb2NhbElE77yM5Lul5L6/6L+Y5Y6f5pe25YCZ5qC55o2u5a6D5p2l5p+l5om+6IqC54K5XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UGF0aC5wdXNoKG1vdW50ZWROb2RlUHJlZmFiSW5mby5maWxlSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vdW50ZWRDaGlsZHJlbk1hcC5zZXQodGFyZ2V0UGF0aCwgeyBwcmVmYWJJbmZvOiBvbGRQcmVmYWJJbmZvIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbmVzdGVkTW91bnRlZENoaWxkSW5mby5ub2RlcyA9IG5lc3RlZE1vdW50ZWRDaGlsZEluZm8ubm9kZXMuY29uY2F0KG1vdW50ZWRDaGlsZEluZm8ubm9kZXMpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8g5rKh5pyJ5bWM5aWX55qE55qEIG1vdW50ZWQg6IqC54K55Lya55u05o6l5oiQ5Li6IFByZWZhYkFzc2V0IOmHjOeahOiKgueCuVxyXG4gICAgICAgICAgICAgICAgbW91bnRlZENoaWxkSW5mby5ub2Rlcy5mb3JFYWNoKChtb3VudGVkTm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbW91bnRlZE5vZGVQcmVmYWJJbmZvID0gcHJlZmFiVXRpbHMuZ2V0UHJlZmFiKG1vdW50ZWROb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBwcmVmYWJVdGlscy5zZXRNb3VudGVkUm9vdChtb3VudGVkTm9kZSwgdW5kZWZpbmVkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtb3VudGVkTm9kZVByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiVXRpbHMuYWRkUHJlZmFiSW5mbyhtb3VudGVkTm9kZSwgbm9kZSwgcHJlZmFiSW5mby5hc3NldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdW50ZWROb2RlUHJlZmFiSW5mbyA9IHByZWZhYlV0aWxzLmdldFByZWZhYihtb3VudGVkTm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g6Z2eIGluc3RhbmNlIOaJjeimgeaNoiBhc3NldFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW1vdW50ZWROb2RlUHJlZmFiSW5mby5pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiVXRpbHMuYWRkUHJlZmFiSW5mbyhtb3VudGVkTm9kZSwgbm9kZSwgcHJlZmFiSW5mby5hc3NldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbW91bnRlZENoaWxkcmVuTWFwLnNldChbbW91bnRlZE5vZGVQcmVmYWJJbmZvIS5maWxlSWRdLCB7IHByZWZhYkluZm86IG51bGwgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJlZmFiSW5zdGFuY2UubW91bnRlZENoaWxkcmVuID0gW107XHJcblxyXG4gICAgICAgIHJldHVybiBtb3VudGVkQ2hpbGRyZW5NYXA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFwcGx5UHJvcGVydHlPdmVycmlkZXMobm9kZTogTm9kZSkge1xyXG4gICAgICAgIGNvbnN0IHJvb3ROb2RlOiBOb2RlID0gbm9kZTtcclxuXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSByb290Tm9kZVsnX3ByZWZhYiddO1xyXG4gICAgICAgIGlmICghcHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHByZWZhYkluc3RhbmNlID0gcHJlZmFiSW5mby5pbnN0YW5jZTtcclxuICAgICAgICBpZiAoIXByZWZhYkluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHByb3BlcnR5T3ZlcnJpZGVzID0gcHJlZmFiSW5zdGFuY2UucHJvcGVydHlPdmVycmlkZXM7XHJcbiAgICAgICAgY29uc3QgcmVzZXJ2ZWRQcm9wZXJ0eU92ZXJyaWRlcyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvcGVydHlPdmVycmlkZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgcHJvcE92ZXJyaWRlID0gcHJvcGVydHlPdmVycmlkZXNbaV07XHJcblxyXG4gICAgICAgICAgICAvLyDkv53nlZnkuIDkupvkuIDoiKzkuI3pnIDopoHlkowgUHJlZmFiQXNzZXQg6Ieq5Yqo5ZCM5q2l55qEIG92ZXJyaWRlXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzUmVzZXJ2ZWRQcm9wZXJ0eU92ZXJyaWRlcyhwcm9wT3ZlcnJpZGUsIHByZWZhYkluZm8uZmlsZUlkKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzZXJ2ZWRQcm9wZXJ0eU92ZXJyaWRlcy5wdXNoKHByb3BPdmVycmlkZSk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0SW5mbyA9IHByb3BPdmVycmlkZS50YXJnZXRJbmZvO1xyXG4gICAgICAgICAgICBpZiAoIXRhcmdldEluZm8pIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBsb2NhbElEIOmVv+W6puWkp+S6jjHvvIzooajnpLrmmK/liqDliLDkuobltYzlpZfnmoQgUHJlZmFiSW5zdGFuY2Ug6IqC54K55Lit5Y675LqGXHJcbiAgICAgICAgICAgIGlmICh0YXJnZXRJbmZvLmxvY2FsSUQubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgLy8g6ZyA6KaB5bCGIG1vdW50ZWQg55qE5L+h5oGv5Yqg5Yiw5bWM5aWX55qE6YKj5LiqIFByZWZhYkluc3RhbmNlIOS4reWOu1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gcHJlZmFiVXRpbHMuZ2V0VGFyZ2V0KHRhcmdldEluZm8ubG9jYWxJRCwgcm9vdE5vZGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldE5vZGUgPSB0YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Tm9kZSBpbnN0YW5jZW9mIENvbXBvbmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldE5vZGUgPSB0YXJnZXROb2RlLm5vZGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8g5om+5LiL5LiA57qn55qEIFByZWZhYkluc3RhbmNlXHJcbiAgICAgICAgICAgICAgICBwcmVmYWJJbmZvLmluc3RhbmNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmVzdGVkSW5zdFByZWZhYkluc3RhbmNlSW5mbyA9IHByZWZhYlV0aWxzLmdldE91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8odGFyZ2V0Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICBwcmVmYWJJbmZvLmluc3RhbmNlID0gcHJlZmFiSW5zdGFuY2U7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbmVzdGVkSW5zdE5vZGUgPSBuZXN0ZWRJbnN0UHJlZmFiSW5zdGFuY2VJbmZvLm91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGU7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW5lc3RlZEluc3ROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgY29uc3QgbmVzdGVkSW5zdFByZWZhYkluZm8gPSBuZXN0ZWRJbnN0Tm9kZVsnX3ByZWZhYiddO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFuZXN0ZWRJbnN0UHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgbmVzdGVkSW5zdFByZWZhYkluc3RhbmNlID0gbmVzdGVkSW5zdFByZWZhYkluZm8uaW5zdGFuY2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW5lc3RlZEluc3RQcmVmYWJJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldFBhdGggPSBuZXN0ZWRJbnN0UHJlZmFiSW5zdGFuY2VJbmZvLnRhcmdldFBhdGguc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgIHRhcmdldFBhdGguc3BsaWNlKDAsIDEpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldFByZWZhYkluZm8gPSB0YXJnZXQgaW5zdGFuY2VvZiBOb2RlID8gdGFyZ2V0WydfcHJlZmFiJ10gOiB0YXJnZXQuX19wcmVmYWI7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldFByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRhcmdldFBhdGgucHVzaCh0YXJnZXRQcmVmYWJJbmZvLmZpbGVJZCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXN0ZWRQcm9wT3ZlcnJpZGUgPSBwcmVmYWJVdGlscy5nZXRQcm9wZXJ0eU92ZXJyaWRlKG5lc3RlZEluc3RQcmVmYWJJbnN0YW5jZSwgdGFyZ2V0UGF0aCwgcHJvcE92ZXJyaWRlLnByb3BlcnR5UGF0aCk7XHJcbiAgICAgICAgICAgICAgICBuZXN0ZWRQcm9wT3ZlcnJpZGUudmFsdWUgPSBwcm9wT3ZlcnJpZGUudmFsdWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyDmsqHmnInltYzlpZfnmoTnmoQgb3ZlcnJpZGUg5pWw5o2u5Lya55u05o6l5a2Y5YiwIFByZWZhYkFzc2V0IOeahOiKgueCueS4ilxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcmVmYWJJbnN0YW5jZS5wcm9wZXJ0eU92ZXJyaWRlcyA9IHJlc2VydmVkUHJvcGVydHlPdmVycmlkZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5pu05paw6ISa5pys5Lit6aKE5Yi25L2TIGNoaWxkIOW8leeUqOeahOWAvOWIsOmihOWItuS9k+i1hOa6kFxyXG4gICAgcHVibGljIGFwcGx5VGFyZ2V0T3ZlcnJpZGVzKG5vZGU6IE5vZGUpIHtcclxuICAgICAgICBjb25zdCBhcHBsaWVkVGFyZ2V0T3ZlcnJpZGVzOiBUYXJnZXRPdmVycmlkZUluZm9bXSA9IFtdO1xyXG4gICAgICAgIC8vIOWcuuaZr+iKgueCueaIliBwcmVmYWIg6LWE5rqQ5Lit55qE5qC56IqC54K5XHJcbiAgICAgICAgY29uc3Qgc2NlbmVSb290Tm9kZSA9IFNlcnZpY2UuRWRpdG9yLmdldFJvb3ROb2RlKCk7XHJcbiAgICAgICAgaWYgKCFzY2VuZVJvb3ROb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhcHBsaWVkVGFyZ2V0T3ZlcnJpZGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2NlbmVSb290Tm9kZVByZWZhYkluZm8gPSBwcmVmYWJVdGlscy5nZXRQcmVmYWIoc2NlbmVSb290Tm9kZSk7XHJcbiAgICAgICAgaWYgKCFzY2VuZVJvb3ROb2RlUHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICByZXR1cm4gYXBwbGllZFRhcmdldE92ZXJyaWRlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSBwcmVmYWJVdGlscy5nZXRQcmVmYWIobm9kZSk7XHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhcHBsaWVkVGFyZ2V0T3ZlcnJpZGVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwcmVmYWJJbnN0YW5jZSA9IHByZWZhYkluZm8uaW5zdGFuY2U7XHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXBwbGllZFRhcmdldE92ZXJyaWRlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzY2VuZVJvb3ROb2RlUHJlZmFiSW5mby50YXJnZXRPdmVycmlkZXMpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHNjZW5lUm9vdE5vZGVQcmVmYWJJbmZvLnRhcmdldE92ZXJyaWRlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0T3ZlcnJpZGUgPSBzY2VuZVJvb3ROb2RlUHJlZmFiSW5mby50YXJnZXRPdmVycmlkZXNbaV07XHJcbiAgICAgICAgICAgICAgICBsZXQgc291cmNlID0gdGFyZ2V0T3ZlcnJpZGUuc291cmNlO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc291cmNlTm9kZSA9IHNvdXJjZSBpbnN0YW5jZW9mIENvbXBvbmVudCA/IHNvdXJjZS5ub2RlIDogc291cmNlO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc291cmNlSW5mbyA9IHRhcmdldE92ZXJyaWRlLnNvdXJjZUluZm87XHJcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlSW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBwcmVmYWJVdGlscy5nZXRUYXJnZXQoc291cmNlSW5mby5sb2NhbElELCBzb3VyY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2UgPSBub2RlID8gbm9kZSA6IHNvdXJjZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0SW5mbyA9IHRhcmdldE92ZXJyaWRlLnRhcmdldEluZm87XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldEluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRJbnN0YW5jZSA9IHRhcmdldE92ZXJyaWRlLnRhcmdldD8uWydfcHJlZmFiJ10/Lmluc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0YXJnZXRJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgdCA9IHRhcmdldE92ZXJyaWRlLnRhcmdldDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHQgPyBwcmVmYWJVdGlscy5nZXRUYXJnZXQodGFyZ2V0SW5mby5sb2NhbElELCB0IGFzIE5vZGUpIDogbnVsbDtcclxuICAgICAgICAgICAgICAgIGlmICghdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2FuJ3QgZmluZCB0YXJnZXRcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXROb2RlID0gdGFyZ2V0IGluc3RhbmNlb2YgQ29tcG9uZW50ID8gdGFyZ2V0Lm5vZGUgOiB0YXJnZXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFzb3VyY2VOb2RlIHx8ICF0YXJnZXROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzlvJXnlKjlkozooqvlvJXnlKjnmoToioLngrnpg73lnKggcHJlZmFiIOS4re+8jOWwseimgeaKiiB0YXJnZXRPdmVycmlkZSDkv6Hmga/mm7TmlrDmjok7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNQYXJ0T2ZOb2RlKHNvdXJjZU5vZGUsIG5vZGUpICYmIGlzUGFydE9mTm9kZSh0YXJnZXROb2RlLCBub2RlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcHJlZmFiSW5mby50YXJnZXRPdmVycmlkZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiSW5mby50YXJnZXRPdmVycmlkZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzb3VyY2VJbkFzc2V0ID0gc291cmNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhc3NldFRhcmdldE92ZXJyaWRlID0gbmV3IFRhcmdldE92ZXJyaWRlSW5mbygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2V0VGFyZ2V0T3ZlcnJpZGUucHJvcGVydHlQYXRoID0gdGFyZ2V0T3ZlcnJpZGUucHJvcGVydHlQYXRoO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyDmm7TmlrAgc291cmNlIOebuOWFs+aVsOaNrlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZUxvY2FsSUQgPSBzb3VyY2VJbmZvPy5sb2NhbElEO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2VMb2NhbElEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRPdmVycmlkZS5zb3VyY2UgaW5zdGFuY2VvZiBOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VDb21wID0gcHJlZmFiVXRpbHMuZ2V0VGFyZ2V0KHNvdXJjZUxvY2FsSUQsIHRhcmdldE92ZXJyaWRlLnNvdXJjZSkgYXMgQ29tcG9uZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNvdXJjZUNvbXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VJbkFzc2V0ID0gc291cmNlQ29tcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhcmdldEluQXNzZXQgPSB0YXJnZXRPdmVycmlkZS50YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5pu05pawIHRhcmdldCDnm7jlhbPmlbDmja5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhc3NldFRhcmdldExvY2FsSUQgPSB0YXJnZXRJbmZvLmxvY2FsSUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFzc2V0VGFyZ2V0TG9jYWxJRCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDov5nph4zlkowgc291cmNlIOS4jeWQjOeahOWcsOaWueaYr++8jOWvuSB0YXJnZXQg55qE57Si5byV5piv6YCa6L+HIFByZWZhYkluc3RhbmNlIOeahCBGaWxlSWQgKyDoioLngrkv57uE5Lu255qEIEZpbGVJZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzb3VyY2Ug55qE57Si5byV5Y+v5Lul5rKh5pyJIHNvdXJjZSDmiYDlnKjoioLngrnnmoQgUHJlZmFiSW5zdGFuY2Ug55qEIEZpbGVJZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0T3ZlcnJpZGUudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gcHJlZmFiVXRpbHMuZ2V0VGFyZ2V0KGFzc2V0VGFyZ2V0TG9jYWxJRCwgdGFyZ2V0T3ZlcnJpZGUudGFyZ2V0KSBhcyBOb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEluQXNzZXQgPSB0YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYkluZm8uaW5zdGFuY2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja1RvQWRkVGFyZ2V0T3ZlcnJpZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUluQXNzZXQgYXMgQ29tcG9uZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoS2V5czogdGFyZ2V0T3ZlcnJpZGUucHJvcGVydHlQYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRhcmdldEluQXNzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICBwcmVmYWJJbmZvLmluc3RhbmNlID0gcHJlZmFiSW5zdGFuY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5riF55CG5o6JIHRhcmdldE92ZXJyaWRlIOaVsOaNrlxyXG4gICAgICAgICAgICAgICAgICAgIHNjZW5lUm9vdE5vZGVQcmVmYWJJbmZvLnRhcmdldE92ZXJyaWRlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYXBwbGllZFRhcmdldE92ZXJyaWRlcy5wdXNoKHRhcmdldE92ZXJyaWRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGFwcGxpZWRUYXJnZXRPdmVycmlkZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFwcGx5UmVtb3ZlZENvbXBvbmVudHMobm9kZTogTm9kZSkge1xyXG4gICAgICAgIGNvbnN0IHJvb3ROb2RlOiBOb2RlID0gbm9kZTtcclxuXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSByb290Tm9kZVsnX3ByZWZhYiddO1xyXG4gICAgICAgIGlmICghcHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHByZWZhYkluc3RhbmNlID0gcHJlZmFiSW5mby5pbnN0YW5jZTtcclxuICAgICAgICBpZiAoIXByZWZhYkluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGFzc2V0Um9vdE5vZGUgPSBwcmVmYWJVdGlscy5nZXRQcmVmYWJBc3NldE5vZGVJbnN0YW5jZShwcmVmYWJJbmZvKTtcclxuICAgICAgICBpZiAoIWFzc2V0Um9vdE5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZW1vdmVkQ29tcG9uZW50cyA9IHByZWZhYkluc3RhbmNlLnJlbW92ZWRDb21wb25lbnRzO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVtb3ZlZENvbXBvbmVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0SW5mbyA9IHJlbW92ZWRDb21wb25lbnRzW2ldO1xyXG4gICAgICAgICAgICBpZiAoIXRhcmdldEluZm8pIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBsb2NhbElEIOmVv+W6puWkp+S6jjHvvIzooajnpLrmmK/liqDliLDkuobltYzlpZfnmoQgUHJlZmFiSW5zdGFuY2Ug6IqC54K55Lit5Y675LqGXHJcbiAgICAgICAgICAgIGlmICh0YXJnZXRJbmZvLmxvY2FsSUQubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0Q29tcEluQXNzZXQgPSBwcmVmYWJVdGlscy5nZXRUYXJnZXQodGFyZ2V0SW5mby5sb2NhbElELCBhc3NldFJvb3ROb2RlKSBhcyBDb21wb25lbnQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldENvbXBJbkFzc2V0IHx8ICF0YXJnZXRDb21wSW5Bc3NldC5fX3ByZWZhYikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldE5vZGVJbkFzc2V0ID0gdGFyZ2V0Q29tcEluQXNzZXQubm9kZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldE5vZGVJbkFzc2V0UHJlZmFiSW5mbyA9IHByZWZhYlV0aWxzLmdldFByZWZhYih0YXJnZXROb2RlSW5Bc3NldCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldENvbXBJbkFzc2V0IHx8ICF0YXJnZXROb2RlSW5Bc3NldFByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyDlhYjlnKggUHJlZmFiQXNzZXQg5om+5Yiw5Yig6Zmk55qEIGNvbXBvbmVudCDmiYDlnKjnmoToioLngrnnmoQgbG9jYWxJRO+8jOWboOS4uuWIoOmZpOeahCBjb21wb25lbnQg5Zyo5b2T5YmNXHJcbiAgICAgICAgICAgICAgICAvLyBQcmVmYWJJbnN0YW5jZSDkuK3lt7Lnu4/kuI3lnKjkuobvvIzml6Dms5XpgJrov4cgY29tcG9uZW50IOeahCBGaWxlSWQg5p2l5om+5LqG77yM5omA5Lul6KaB6YCa6L+H5om+IG5vZGXvvIxcclxuICAgICAgICAgICAgICAgIC8vIOeEtuWQjuWGjeaJvuS4i+S4gOWxgue6p+eahCBQcmVmYWJJbnN0YW5jZVxyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0Tm9kZUxvY2FsSUQgPSB0YXJnZXRJbmZvLmxvY2FsSUQuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgIHRhcmdldE5vZGVMb2NhbElELnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0Tm9kZUxvY2FsSUQucHVzaCh0YXJnZXROb2RlSW5Bc3NldFByZWZhYkluZm8uZmlsZUlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyDlnKjlvZPliY0gUHJlZmFiSW5zdGFuY2Ug5Lit5p+l5om+6IqC54K5XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJUYXJnZXROb2RlID0gcHJlZmFiVXRpbHMuZ2V0VGFyZ2V0KHRhcmdldE5vZGVMb2NhbElELCByb290Tm9kZSkgYXMgTm9kZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyDmib7kuIvkuIDnuqfnmoQgUHJlZmFiSW5zdGFuY2VcclxuICAgICAgICAgICAgICAgIHByZWZhYkluZm8uaW5zdGFuY2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXN0ZWRJbnN0UHJlZmFiSW5zdGFuY2VJbmZvID0gcHJlZmFiVXRpbHMuZ2V0T3V0TW9zdFByZWZhYkluc3RhbmNlSW5mbyhjdXJUYXJnZXROb2RlKTtcclxuICAgICAgICAgICAgICAgIHByZWZhYkluZm8uaW5zdGFuY2UgPSBwcmVmYWJJbnN0YW5jZTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXN0ZWRJbnN0Tm9kZSA9IG5lc3RlZEluc3RQcmVmYWJJbnN0YW5jZUluZm8ub3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZTtcclxuICAgICAgICAgICAgICAgIGlmICghbmVzdGVkSW5zdE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXN0ZWRJbnN0UHJlZmFiSW5mbyA9IHByZWZhYlV0aWxzLmdldFByZWZhYihuZXN0ZWRJbnN0Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW5lc3RlZEluc3RQcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXN0ZWRJbnN0UHJlZmFiSW5zdGFuY2UgPSBuZXN0ZWRJbnN0UHJlZmFiSW5mby5pbnN0YW5jZTtcclxuICAgICAgICAgICAgICAgIGlmICghbmVzdGVkSW5zdFByZWZhYkluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IG5lc3RlZEluc3RQcmVmYWJJbnN0YW5jZUluZm8udGFyZ2V0UGF0aC5zbGljZSgpO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0UGF0aC5zcGxpY2UoMCwgMSk7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRQYXRoLnB1c2godGFyZ2V0Q29tcEluQXNzZXQuX19wcmVmYWIuZmlsZUlkKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1RhcmdldEluZm8gPSBuZXcgVGFyZ2V0SW5mbygpO1xyXG4gICAgICAgICAgICAgICAgbmV3VGFyZ2V0SW5mby5sb2NhbElEID0gdGFyZ2V0UGF0aDtcclxuICAgICAgICAgICAgICAgIG5lc3RlZEluc3RQcmVmYWJJbnN0YW5jZS5yZW1vdmVkQ29tcG9uZW50cy5wdXNoKG5ld1RhcmdldEluZm8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcmVmYWJJbnN0YW5jZS5yZW1vdmVkQ29tcG9uZW50cyA9IFtdO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIGFzeW5jIHdhaXRGb3JTY2VuZUxvYWRlZCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oKHIsIF8pID0+IHtcclxuICAgICAgICAgICAgU2VydmljZS5FZGl0b3IucmVsb2FkKHt9KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHIodHJ1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlsIbkuIDkuKogUHJlZmFiSW5zdGFuY2Ug55qE5pWw5o2u5bqU55So5Yiw5a+55bqU55qEIEFzc2V0IOi1hOa6kOS4ilxyXG4gICAgICogQHBhcmFtIG5vZGVVVUlEIHV1aWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIGFwcGx5UHJlZmFiKG5vZGVVVUlEOiBzdHJpbmcpIHtcclxuICAgICAgICAvLyBjb25zdCBjb21tYW5kID0gbmV3IEFwcGx5UHJlZmFiQ29tbWFuZCh0aGlzLnVuZG9BcHBseVByZWZhYi5iaW5kKHRoaXMpLCB0aGlzLmRvQXBwbHlQcmVmYWIuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgLy8gY29uc3QgdW5kb0lEID0gY2NlLlNjZW5lRmFjYWRlTWFuYWdlci5iZWdpblJlY29yZGluZyhub2RlVVVJRCwgeyBjdXN0b21Db21tYW5kOiBjb21tYW5kIH0pO1xyXG4gICAgICAgIGNvbnN0IGFwcFByZWZhYkluZm8gPSBhd2FpdCB0aGlzLmRvQXBwbHlQcmVmYWIobm9kZVVVSUQpO1xyXG4gICAgICAgIGlmIChhcHBQcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgIC8vIGNvbW1hbmQuYXBwbHlQcmVmYWJJbmZvID0gYXBwUHJlZmFiSW5mbztcclxuICAgICAgICAgICAgLy8gY2NlLlNjZW5lRmFjYWRlTWFuYWdlci5lbmRSZWNvcmRpbmcodW5kb0lEKTtcclxuICAgICAgICAgICAgLy8gY2NlLlNjZW5lRmFjYWRlTWFuYWdlci5zbmFwc2hvdCgpKTtcclxuICAgICAgICAgICAgLy8gY2NlLlNjZW5lRmFjYWRlTWFuYWdlci5hYm9ydFNuYXBzaG90KCk7XHJcbiAgICAgICAgICAgIC8vIOWboOS4uiBhcHBseSBwcmVmYWIg5ZCO5LiA5a6a5Lya6Kem5Y+RIHNvZnQgcmVsb2FkICzopoHnrYnlnLrmma/liqDovb3lrozmiJBcclxuICAgICAgICAgICAgLy8g6Ziy5q2i5Zyo5YiH5o2i5YiwIHByZWZhYiDnvJbovpHmqKHlvI/kuYvlkI7miY3op6blj5Egc29mdCByZWxvYWRcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gY2NlLlNjZW5lRmFjYWRlTWFuYWdlci5jYW5jZWxSZWNvcmRpbmcodW5kb0lEKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgZG9BcHBseVByZWZhYihub2RlVVVJRDogc3RyaW5nKTogUHJvbWlzZTxJQXBwbHlQcmVmYWJJbmZvIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTWdyLmdldE5vZGUobm9kZVVVSUQpO1xyXG4gICAgICAgIGlmICghbm9kZSkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSBwcmVmYWJVdGlscy5nZXRQcmVmYWIobm9kZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHByZWZhYkluc3RhbmNlID0gcHJlZmFiSW5mbz8uaW5zdGFuY2U7XHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbnN0YW5jZSB8fCAhcHJlZmFiSW5mbz8uYXNzZXQpIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICBjb25zdCBhc3NldCA9IHByZWZhYkluZm8uYXNzZXQ7XHJcblxyXG4gICAgICAgIC8vIOWmguaenOaYr+WtkOi1hOa6kO+8jOWImeS4jeiDveW6lOeUqFxyXG4gICAgICAgIGlmIChwcmVmYWJVdGlscy5pc1N1YkFzc2V0KGFzc2V0Ll91dWlkKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2NhblxcJ3QgYXBwbHkgZGF0YSB0byBTdWJBc3NldCBQcmVmYWInKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvbGROb2RlRGF0YSA9IGFzc2V0LmRhdGE7XHJcblxyXG4gICAgICAgIGNvbnN0IGluZm8gPSBhd2FpdCBScGMuZ2V0SW5zdGFuY2UoKS5yZXF1ZXN0KCdhc3NldE1hbmFnZXInLCAncXVlcnlBc3NldEluZm8nLCBbYXNzZXQuX3V1aWRdKTtcclxuICAgICAgICBpZiAoIWluZm8pIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICAvLyDmiorpnZ7pooTliLbkvZPlhoXnmoToioLngrnvvIzmm7TmlrDliLDpooTliLbkvZPkv6Hmga/kuK1cclxuICAgICAgICBjb25zdCBtb3VudGVkQ2hpbGRyZW5JbmZvTWFwID0gdGhpcy5hcHBseU1vdW50ZWRDaGlsZHJlbihub2RlKTtcclxuICAgICAgICBpZiAoIW1vdW50ZWRDaGlsZHJlbkluZm9NYXApIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICAvLyDmiorpnZ7pooTliLbkvZPlhoXnmoTnu4Tku7bvvIzmm7TmlrDliLDpooTliLbkvZPkv6Hmga/kuK1cclxuICAgICAgICBjb25zdCBtb3VudGVkQ29tcG9uZW50c0luZm9NYXAgPSBjb21wb25lbnRPcGVyYXRpb24uYXBwbHlNb3VudGVkQ29tcG9uZW50cyhub2RlKTtcclxuICAgICAgICBpZiAoIW1vdW50ZWRDb21wb25lbnRzSW5mb01hcCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIGNvbnN0IHByb3BlcnR5T3ZlcnJpZGVzID0gcHJlZmFiSW5zdGFuY2UucHJvcGVydHlPdmVycmlkZXM7XHJcbiAgICAgICAgdGhpcy5hcHBseVByb3BlcnR5T3ZlcnJpZGVzKG5vZGUpO1xyXG4gICAgICAgIGNvbnN0IHJlbW92ZWRDb21wb25lbnRzID0gcHJlZmFiSW5zdGFuY2UucmVtb3ZlZENvbXBvbmVudHM7XHJcbiAgICAgICAgdGhpcy5hcHBseVJlbW92ZWRDb21wb25lbnRzKG5vZGUpO1xyXG4gICAgICAgIGNvbnN0IGFwcGxpZWRUYXJnZXRPdmVycmlkZXMgPSB0aGlzLmFwcGx5VGFyZ2V0T3ZlcnJpZGVzKG5vZGUpO1xyXG4gICAgICAgIGNvbnN0IHJldCA9IHByZWZhYlV0aWxzLmdlbmVyYXRlUHJlZmFiRGF0YUZyb21Ob2RlKG5vZGUpO1xyXG4gICAgICAgIGlmICghcmV0KSByZXR1cm4gbnVsbDtcclxuICAgICAgICBpZiAocmV0LmNsZWFyZWRSZWZlcmVuY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXN0b3JlQ2xlYXJlZFJlZmVyZW5jZShub2RlLCByZXQuY2xlYXJlZFJlZmVyZW5jZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgbGV0IGZpbmlzaGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNvbnN0IFRJTUVPVVRfTVMgPSA1MDAwO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZG9uZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChmaW5pc2hlZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcclxuICAgICAgICAgICAgICAgICAgICBub2RlVVVJRCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VudGVkQ2hpbGRyZW5JbmZvTWFwLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdW50ZWRDb21wb25lbnRzSW5mb01hcCxcclxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU92ZXJyaWRlcyxcclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVkQ29tcG9uZW50cyxcclxuICAgICAgICAgICAgICAgICAgICBvbGRQcmVmYWJOb2RlRGF0YTogb2xkTm9kZURhdGEsXHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3ZlcnJpZGVzOiBhcHBsaWVkVGFyZ2V0T3ZlcnJpZGVzLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyDnm5HlkKzkuovku7ZcclxuICAgICAgICAgICAgU2VydmljZUV2ZW50cy5vbmNlPElFZGl0b3JFdmVudHM+KCdlZGl0b3I6cmVsb2FkJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIOi2heaXtuWFnOW6lVxyXG4gICAgICAgICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbZG9BcHBseVByZWZhYl0gZWRpdG9yOnJlbG9hZCDmnKrop6blj5EnKTtcclxuICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgfSwgVElNRU9VVF9NUyk7XHJcblxyXG4gICAgICAgICAgICAvLyDkv53lrZjotYTmupBcclxuICAgICAgICAgICAgUnBjLmdldEluc3RhbmNlKCkucmVxdWVzdCgnYXNzZXRNYW5hZ2VyJywgJ3NhdmVBc3NldCcsIFtcclxuICAgICAgICAgICAgICAgIGluZm8uc291cmNlLCByZXQucHJlZmFiRGF0YSxcclxuICAgICAgICAgICAgXSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwcmVmYWJVdGlscy5yZW1vdmVQcmVmYWJBc3NldE5vZGVJbnN0YW5jZUNhY2hlKHByZWZhYkluZm8pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgdW5kb0FwcGx5UHJlZmFiKGFwcGx5UHJlZmFiSW5mbzogSUFwcGx5UHJlZmFiSW5mbykge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTWdyLmdldE5vZGUoYXBwbHlQcmVmYWJJbmZvLm5vZGVVVUlEKTtcclxuICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IG5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICBpZiAoIXByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwcmVmYWJJbnN0YW5jZSA9IHByZWZhYkluZm8uaW5zdGFuY2U7XHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhc3NldCA9IHByZWZhYkluZm8uYXNzZXQ7XHJcblxyXG4gICAgICAgIGlmICghYXNzZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaW5mbyA9IGF3YWl0IFJwYy5nZXRJbnN0YW5jZSgpLnJlcXVlc3QoJ2Fzc2V0TWFuYWdlcicsICdxdWVyeUFzc2V0SW5mbycsIFthc3NldC5fdXVpZF0pO1xyXG4gICAgICAgIGlmICghaW5mbykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3NldC5kYXRhID0gYXBwbHlQcmVmYWJJbmZvLm9sZFByZWZhYk5vZGVEYXRhO1xyXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBFZGl0b3JFeHRlbmRzLnNlcmlhbGl6ZShhc3NldCk7XHJcblxyXG4gICAgICAgIHByZWZhYkluc3RhbmNlLm1vdW50ZWRDaGlsZHJlbiA9IFtdO1xyXG5cclxuICAgICAgICBjb25zdCB0YXJnZXRNYXAgPSBwcmVmYWJVdGlscy5nZXRUYXJnZXRNYXAobm9kZSk7XHJcblxyXG4gICAgICAgIGFwcGx5UHJlZmFiSW5mby5tb3VudGVkQ2hpbGRyZW5JbmZvTWFwLmZvckVhY2goKG9sZE5vZGVEYXRhOiBJTm9kZVByZWZhYkRhdGEsIGxvY2FsSUQ6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IFByZWZhYi5fdXRpbHMuZ2V0VGFyZ2V0KGxvY2FsSUQsIHRhcmdldE1hcCkgYXMgTm9kZTtcclxuICAgICAgICAgICAgaWYgKCF0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcHJlZmFiVXRpbHMuc2V0TW91bnRlZFJvb3QodGFyZ2V0LCBub2RlKTtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICB0YXJnZXRbJ19wcmVmYWInXSA9IG9sZE5vZGVEYXRhLnByZWZhYkluZm87XHJcblxyXG4gICAgICAgICAgICBpZiAodGFyZ2V0LnBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDaGlsZHJlbkRhdGEodGFyZ2V0LnBhcmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYXBwbHlQcmVmYWJJbmZvLm1vdW50ZWRDb21wb25lbnRzSW5mb01hcC5mb3JFYWNoKChvbGRDb21wRGF0YTogSUNvbXBvbmVudFByZWZhYkRhdGEsIGxvY2FsSUQ6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IFByZWZhYi5fdXRpbHMuZ2V0VGFyZ2V0KGxvY2FsSUQsIHRhcmdldE1hcCkgYXMgQ29tcG9uZW50O1xyXG4gICAgICAgICAgICBpZiAoIXRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwcmVmYWJVdGlscy5zZXRNb3VudGVkUm9vdCh0YXJnZXQsIG5vZGUpO1xyXG4gICAgICAgICAgICB0YXJnZXQuX19wcmVmYWIgPSBvbGRDb21wRGF0YS5wcmVmYWJJbmZvO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRhcmdldC5ub2RlKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRPcGVyYXRpb24udXBkYXRlTW91bnRlZENvbXBvbmVudHModGFyZ2V0Lm5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHByZWZhYkluc3RhbmNlLnByb3BlcnR5T3ZlcnJpZGVzID0gYXBwbHlQcmVmYWJJbmZvLnByb3BlcnR5T3ZlcnJpZGVzO1xyXG4gICAgICAgIHByZWZhYkluc3RhbmNlLnJlbW92ZWRDb21wb25lbnRzID0gYXBwbHlQcmVmYWJJbmZvLnJlbW92ZWRDb21wb25lbnRzO1xyXG4gICAgICAgIC8vIOWcuuaZr+iKgueCueaIliBwcmVmYWIg6LWE5rqQ5Lit55qE5qC56IqC54K5XHJcbiAgICAgICAgY29uc3Qgc2NlbmVSb290Tm9kZSA9IFNlcnZpY2UuRWRpdG9yLmdldFJvb3ROb2RlKCk7XHJcbiAgICAgICAgaWYgKHNjZW5lUm9vdE5vZGUpIHtcclxuICAgICAgICAgICAgY29uc3Qgc2NlbmVSb290Tm9kZVByZWZhYkluZm8gPSBwcmVmYWJVdGlscy5nZXRQcmVmYWIoc2NlbmVSb290Tm9kZSk7XHJcbiAgICAgICAgICAgIGlmIChzY2VuZVJvb3ROb2RlUHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzY2VuZVJvb3ROb2RlUHJlZmFiSW5mby50YXJnZXRPdmVycmlkZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY2VuZVJvb3ROb2RlUHJlZmFiSW5mby50YXJnZXRPdmVycmlkZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIOi/mOWOn+agueiKgueCueeahHRhcmdldE92ZXJyaWRlXHJcbiAgICAgICAgICAgICAgICBhcHBseVByZWZhYkluZm8udGFyZ2V0T3ZlcnJpZGVzPy5mb3JFYWNoKChvdmVycmlkZUluZm8pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRPdmVycmlkZSA9IG5ldyBUYXJnZXRPdmVycmlkZUluZm8oKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAob3ZlcnJpZGVJbmZvLnNvdXJjZVVVSUQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVNZ3IuZ2V0Tm9kZShvdmVycmlkZUluZm8uc291cmNlVVVJRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPdmVycmlkZS5zb3VyY2UgPSBub2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcCA9IGNvbXBNZ3IuZ2V0Q29tcG9uZW50KG92ZXJyaWRlSW5mby5zb3VyY2VVVUlEKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb21wKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3ZlcnJpZGUuc291cmNlID0gY29tcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3ZlcnJpZGUuc291cmNlSW5mbyA9IG92ZXJyaWRlSW5mby5zb3VyY2VJbmZvO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvdmVycmlkZUluZm8udGFyZ2V0VVVJRCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlID0gbm9kZU1nci5nZXROb2RlKG92ZXJyaWRlSW5mby50YXJnZXRVVUlEKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE92ZXJyaWRlLnRhcmdldCA9IG5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21wID0gY29tcE1nci5nZXRDb21wb25lbnQob3ZlcnJpZGVJbmZvLnRhcmdldFVVSUQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIOi/memHjOS4jeWPr+iDveS7jue7hOS7tueuoeeQhuWZqOafpeaJvu+8jOaYr+S4uuS7gOS5iOi/meS5iOWGmVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPdmVycmlkZS50YXJnZXQgPSBjb21wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldE92ZXJyaWRlLnRhcmdldEluZm8gPSBvdmVycmlkZUluZm8udGFyZ2V0SW5mbztcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRPdmVycmlkZS5wcm9wZXJ0eVBhdGggPSBvdmVycmlkZUluZm8ucHJvcGVydHlQYXRoO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzY2VuZVJvb3ROb2RlUHJlZmFiSW5mby50YXJnZXRPdmVycmlkZXM/LnB1c2godGFyZ2V0T3ZlcnJpZGUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBQcmVmYWIuX3V0aWxzLmFwcGx5VGFyZ2V0T3ZlcnJpZGVzKHNjZW5lUm9vdE5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWcuuaZr+S4reS9v+eUqOeahCBQcmVmYWIg6IqC54K555qEIFByZWZhYkFzc2V0IOWPmOWKqOS8mumHjeaWsCBsb2FkIOWcuuaZr++8jOaJgOS7peS4jemcgOimgeWNleeLrOWOu+WPmOWKqOiKgueCueS6huOAglxyXG4gICAgICAgIGF3YWl0IFJwYy5nZXRJbnN0YW5jZSgpLnJlcXVlc3QoJ2Fzc2V0TWFuYWdlcicsICdjcmVhdGVBc3NldCcsIFt7XHJcbiAgICAgICAgICAgIHRhcmdldDogaW5mby5zb3VyY2UsXHJcbiAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQgYXMgc3RyaW5nLFxyXG4gICAgICAgICAgICBvdmVyd3JpdGU6IHRydWVcclxuICAgICAgICB9XSk7XHJcbiAgICAgICAgLy8gY2NlLlNjZW5lRmFjYWRlTWFuYWdlci5hYm9ydFNuYXBzaG90KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZUNoaWxkcmVuRGF0YShub2RlOiBOb2RlKSB7XHJcbiAgICAgICAgaWYgKCFub2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOWmguaenOW9k+WJjeato+WcqOenu+mZpCBNb3VudGVkQ2hpbGRyZW7vvIzliJnkuI3pnIDopoHmm7TmlrDov5nkuKrmlbDmja7kuoZcclxuICAgICAgICBpZiAodGhpcy5pc1JlbW92aW5nTW91bnRlZENoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBjb25zdCBwcmVmYWJJbmZvID0gbm9kZVsnX3ByZWZhYiddO1xyXG5cclxuICAgICAgICAvLyDlpoLmnpzoioLngrnkuI3mmK/kuIDkuKpQcmVmYWLlsLHkuI3nlKjlvoDkuIvlpITnkIbkuoZcclxuICAgICAgICBpZiAoIXByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5aaC5p6c5pyA5aSW5bGC5pyJ5LiA5LiqIHByZWZhYkluc3RhbmNl77yM5bCx6KaB6K6w5b2V5YiwIHByZWZhYkluc3RhbmNlIOS4reaIkOS4uuS4gOS4qiBtb3VudGVkQ2hpbGRyZW4sIOi/mOmcgOimgeS/neivgemhuuW6j1xyXG4gICAgICAgIGNvbnN0IG91dE1vc3RQcmVmYWJJbnN0YW5jZUluZm8gPSBwcmVmYWJVdGlscy5nZXRPdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvKG5vZGUpO1xyXG4gICAgICAgIGNvbnN0IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGU6IE5vZGUgfCBudWxsID0gb3V0TW9zdFByZWZhYkluc3RhbmNlSW5mby5vdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlO1xyXG4gICAgICAgIGlmICghb3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRhcmdldFBhdGg6IHN0cmluZ1tdID0gb3V0TW9zdFByZWZhYkluc3RhbmNlSW5mby50YXJnZXRQYXRoO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBjb25zdCBvdXRNb3N0UHJlZmFiSW5mbyA9IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICBjb25zdCBvdXRNb3N0UHJlZmFiSW5zdGFuY2U6IFByZWZhYkluc3RhbmNlIHwgdW5kZWZpbmVkID0gb3V0TW9zdFByZWZhYkluZm8/Lmluc3RhbmNlO1xyXG5cclxuICAgICAgICBpZiAoIW91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUgfHwgIW91dE1vc3RQcmVmYWJJbmZvIHx8ICFvdXRNb3N0UHJlZmFiSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYXNzZXRSb290Tm9kZSA9IHByZWZhYlV0aWxzLmdldFByZWZhYkFzc2V0Tm9kZUluc3RhbmNlKG91dE1vc3RQcmVmYWJJbmZvKTtcclxuICAgICAgICBpZiAoIWFzc2V0Um9vdE5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGFyZ2V0UGF0aC5zcGxpY2UoMCwgMSk7IC8vIOS4jemcgOimgeWtmOacgOWkluWxgueahCBQcmVmYWJJbnN0YW5jZSDnmoQgZmlsZUlE77yM5pa55L6/IG92ZXJyaWRlIOWPr+S7peWcqCBQcmVmYWJJbnN0YW5jZSDlpI3liLblkI7lpI3nlKhcclxuICAgICAgICB0YXJnZXRQYXRoLnB1c2gocHJlZmFiSW5mby5maWxlSWQpO1xyXG4gICAgICAgIGNvbnN0IG5vZGVJbkFzc2V0OiBOb2RlIHwgbnVsbCA9IHByZWZhYlV0aWxzLmdldFRhcmdldCh0YXJnZXRQYXRoLCBhc3NldFJvb3ROb2RlKSBhcyBOb2RlO1xyXG5cclxuICAgICAgICBpZiAoIW5vZGVJbkFzc2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuRmlsZUlEcyA9IG5vZGVJbkFzc2V0LmNoaWxkcmVuLm1hcCgoY2hpbGQpID0+IHtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBjb25zdCBwcmVmYWJJbmZvID0gY2hpbGRbJ19wcmVmYWInXTtcclxuICAgICAgICAgICAgaWYgKCFwcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChwcmVmYWJJbmZvLmluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJlZmFiSW5mby5pbnN0YW5jZS5maWxlSWQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJlZmFiSW5mby5maWxlSWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgYWRkZWRDaGlsZHJlbjogTm9kZVtdID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZE5vZGUgPSBub2RlLmNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZFByZWZhYkluZm8gPSBwcmVmYWJVdGlscy5nZXRQcmVmYWIoY2hpbGROb2RlKTtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRQcmVmYWJJbnN0YW5jZSA9IGNoaWxkUHJlZmFiSW5mbz8uaW5zdGFuY2U7XHJcblxyXG4gICAgICAgICAgICAvLyDlj6/ku6XlhpnlhaUgbW91bnRlZENoaWxkcmVuIOeahOadoeS7tu+8mlxyXG4gICAgICAgICAgICAvLyAxLiDmmK/kuIDkuKrmma7pgJroioLngrlcclxuICAgICAgICAgICAgLy8gMi4g5piv5LiA5Liq5LiN5Zyo5Yir55qEIFByZWZhYiDotYTmupDph4znmoTmlrDlop7oioLngrlcclxuICAgICAgICAgICAgaWYgKCFjaGlsZFByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgICAgIGFkZGVkQ2hpbGRyZW4ucHVzaChjaGlsZE5vZGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZUlEID0gY2hpbGRQcmVmYWJJbnN0YW5jZSA/IGNoaWxkUHJlZmFiSW5zdGFuY2UuZmlsZUlkIDogY2hpbGRQcmVmYWJJbmZvLmZpbGVJZDtcclxuICAgICAgICAgICAgICAgIGlmICghY2hpbGRyZW5GaWxlSURzLmluY2x1ZGVzKGZpbGVJRCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAxLiBtb3VudGVkUm9vdCDkuLrnqbrooajnpLrkuLrmlrDliqDnmoToioLngrlcclxuICAgICAgICAgICAgICAgICAgICAvLyAyLiBtb3VudGVkUm9vdCDkuI3kuLrnqbrpnIDopoHmn6XnnIvmmK/kuI3mmK/mjILlnKjov5nkuKogUHJlZmFiSW5zdGFuY2Ug6IqC54K55LiL55qE77yM5Zug5Li65Y+v6IO95piv5oyC5Zyo6YeM5bGCIFByZWZhYkluc3RhbmNlIOmHjCzov5nph4zlsLHkuI3lupTor6Xph43lpI3mt7vliqBcclxuICAgICAgICAgICAgICAgICAgICAvLyAzLiBtb3VudGVkUm9vdCDkuI3kuLrnqbrvvIzlubbkuJQgbW91bnRlZFJvb3Qg5LiN5pivIG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUg6ZyA6KaB6L+b6KGM5ZCM5q2l77yIZml4OiBodHRwczovL2dpdGh1Yi5jb20vY29jb3MvM2QtdGFza3MvaXNzdWVzLzE4NTE277yJXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbW91bnRlZFJvb3QgPSBwcmVmYWJVdGlscy5nZXRNb3VudGVkUm9vdChjaGlsZE5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbW91bnRlZFJvb3QgfHwgbW91bnRlZFJvb3QgPT09IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUgfHwgbW91bnRlZFJvb3QgIT09IG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkZWRDaGlsZHJlbi5wdXNoKGNoaWxkTm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcmVmYWJVdGlscy5maXJlQmVmb3JlQ2hhbmdlTXNnKG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUpO1xyXG4gICAgICAgIGlmIChhZGRlZENoaWxkcmVuLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgY29uc3QgYWRkZWRDaGlsZEluZm8gPSBwcmVmYWJVdGlscy5nZXRQcmVmYWJJbnN0YW5jZU1vdW50ZWRDaGlsZHJlbihvdXRNb3N0UHJlZmFiSW5zdGFuY2UsIHRhcmdldFBhdGgpO1xyXG4gICAgICAgICAgICBhZGRlZENoaWxkSW5mby5ub2RlcyA9IGFkZGVkQ2hpbGRyZW47XHJcbiAgICAgICAgICAgIGFkZGVkQ2hpbGRJbmZvLm5vZGVzLmZvckVhY2goKGNoaWxkTm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcHJlZmFiVXRpbHMuc2V0TW91bnRlZFJvb3QoY2hpbGROb2RlLCBvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRNb3N0UHJlZmFiSW5zdGFuY2UubW91bnRlZENoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEluZm8gPSBvdXRNb3N0UHJlZmFiSW5zdGFuY2UubW91bnRlZENoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkSW5mby5pc1RhcmdldCh0YXJnZXRQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkSW5mby5ub2Rlcy5mb3JFYWNoKChjaGlsZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJVdGlscy5zZXRNb3VudGVkUm9vdChjaGlsZCwgdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBvdXRNb3N0UHJlZmFiSW5zdGFuY2UubW91bnRlZENoaWxkcmVuLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBwcmVmYWJVdGlscy5maXJlQ2hhbmdlTXNnKG91dE1vc3RQcmVmYWJJbnN0YW5jZU5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaXNDaXJjdWxhclJlZlByZWZhYkluc3RhbmNlKGNoZWNrTm9kZTogTm9kZSwgcm9vdDogTm9kZSkge1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBjb25zdCBjaGVja1ByZWZhYkluZm8gPSBjaGVja05vZGVbJ19wcmVmYWInXTtcclxuXHJcbiAgICAgICAgaWYgKCFjaGVja1ByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2hlY2tQcmVmYWJJbnN0YW5jZSA9IGNoZWNrUHJlZmFiSW5mby5pbnN0YW5jZTtcclxuICAgICAgICBpZiAoIWNoZWNrUHJlZmFiSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNoZWNrTm9kZSA9PT0gcm9vdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjaGVja1ByZWZhYkFzc2V0RXF1YWwobm9kZUE6IE5vZGUsIG5vZGVCOiBOb2RlKSB7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgY29uc3QgcHJlZmFiSW5mb0EgPSBub2RlQVsnX3ByZWZhYiddO1xyXG4gICAgICAgICAgICBjb25zdCBwcmVmYWJJbnN0YW5jZUEgPSBwcmVmYWJJbmZvQT8uaW5zdGFuY2U7XHJcblxyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIGNvbnN0IHByZWZhYkluZm9CID0gbm9kZUJbJ19wcmVmYWInXTtcclxuICAgICAgICAgICAgY29uc3QgcHJlZmFiSW5zdGFuY2VCID0gcHJlZmFiSW5mb0I/Lmluc3RhbmNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHByZWZhYkluc3RhbmNlQSAmJiBwcmVmYWJJbnN0YW5jZUIgJiYgcHJlZmFiSW5mb0E/LmFzc2V0Py5fdXVpZCA9PT0gcHJlZmFiSW5mb0I/LmFzc2V0Py5fdXVpZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjaGVja1ByZWZhYkFzc2V0RXF1YWwoY2hlY2tOb2RlLCByb290KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBwYXJlbnQgPSBjaGVja05vZGUucGFyZW50O1xyXG4gICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdoaWxlIChwYXJlbnQgJiYgcGFyZW50ICE9PSByb290KSB7XHJcbiAgICAgICAgICAgIGlmIChjaGVja1ByZWZhYkFzc2V0RXF1YWwoY2hlY2tOb2RlLCBwYXJlbnQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjYW5CZU1hZGVUb1ByZWZhYkFzc2V0KG5vZGU6IE5vZGUpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgaGFzVGVycmFpbiA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBoYXNOZXN0ZWRQcmVmYWIgPSBmYWxzZTtcclxuICAgICAgICBub2RlLndhbGsoKHRhcmdldDogTm9kZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGFyZ2V0LmdldENvbXBvbmVudChUZXJyYWluKSkge1xyXG4gICAgICAgICAgICAgICAgaGFzVGVycmFpbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQ2lyY3VsYXJSZWZQcmVmYWJJbnN0YW5jZSh0YXJnZXQsIG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYENpcmN1bGFyIHJlZmVyZW5jZSBwcmVmYWIgY2hlY2tlZDogWyR7dGFyZ2V0Lm5hbWV9XWApO1xyXG4gICAgICAgICAgICAgICAgaGFzTmVzdGVkUHJlZmFiID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoaGFzVGVycmFpbikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0NhblxcJ3QgY3JlYXRlIHByZWZhYkFzc2V0IGZyb20gYSBub2RlIHRoYXQgY29udGFpbnMgdGVycmFpbicpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaGFzTmVzdGVkUHJlZmFiKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQ2FuXFwndCBjcmVhdGUgcHJlZmFiQXNzZXQgZnJvbSBhIG5vZGUgdGhhdCBjb250YWlucyBjaXJjdWxhciByZWZlcmVuY2UgcHJlZmFiJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LuO5LiA5Liq6IqC54K555Sf5oiQ5LiA5LiqIFByZWZhYkFzc2V0XHJcbiAgICAgKiBAcGFyYW0gbm9kZVVVSURcclxuICAgICAqIEBwYXJhbSB1cmxcclxuICAgICAqIEBwYXJhbSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBjcmVhdGVQcmVmYWJBc3NldEZyb21Ob2RlKG5vZGVVVUlEOiBzdHJpbmcsIHVybDogc3RyaW5nLCBvcHRpb25zID0geyB1bmRvOiB0cnVlLCBvdmVyd3JpdGU6IHRydWUgfSkge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2RlTWdyLmdldE5vZGUobm9kZVVVSUQpO1xyXG4gICAgICAgIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IHByZWZhYlV0aWxzLmdldFByZWZhYihub2RlKTtcclxuXHJcbiAgICAgICAgaWYgKHByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgY29uc3QgeyBvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlIH0gPSBwcmVmYWJVdGlscy5nZXRPdXRNb3N0UHJlZmFiSW5zdGFuY2VJbmZvKG5vZGUpO1xyXG4gICAgICAgICAgICAvLyDmmK/kuIDkuKogUHJlZmFiQXNzZXQg5Lit55qE5a2Q6IqC54K55bm25LiUIFByZWZhYkFzc2V0IOiiq+WunuS+i+WMluS6hlxyXG4gICAgICAgICAgICBpZiAob3V0TW9zdFByZWZhYkluc3RhbmNlTm9kZSAhPT0gbm9kZSAmJiBub2RlLmlzQ2hpbGRPZihvdXRNb3N0UHJlZmFiSW5zdGFuY2VOb2RlKSAmJiAhcHJlZmFiVXRpbHMuZ2V0TW91bnRlZFJvb3Qobm9kZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignY2FuXFwndCBjcmVhdGUgcHJlZmFiQXNzZXQgZnJvbSBhIHByZWZhYk5vZGUgaW5zaWRlIGEgcHJlZmFiSW5zdGFuY2UnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOaLluaLvemihOWItuS9k+aXtu+8jOmcgOimgeabtOaWsOaJgOacieeahCBwcm9wZXJ0eU92ZXJyaWRlcyAjMTc2MjJcclxuICAgICAgICAgICAgY29uc3QgcHJlZmFiSW5zdGFuY2UgPSBwcmVmYWJJbmZvLmluc3RhbmNlO1xyXG4gICAgICAgICAgICBpZiAocHJlZmFiSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlQcm9wZXJ0eU92ZXJyaWRlcyhub2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmNhbkJlTWFkZVRvUHJlZmFiQXNzZXQobm9kZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZXQgPSBwcmVmYWJVdGlscy5nZW5lcmF0ZVByZWZhYkRhdGFGcm9tTm9kZShub2RlKTtcclxuICAgICAgICBpZiAoIXJldCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIC8vIOWmguaenOacrOi6q+WwseaYr+S4gOS4qiBwcmVmYWLkuobvvIzpgqPlsLHlhYjku47oh6rliqjnm5HlkKzlj5jliqjnmoTliJfooajliKDpmaTvvIznrYnlkI7pnaIgbGluayDlrozlho0gc29mdFJlbG9hZFxyXG4gICAgICAgIGlmIChwcmVmYWJJbmZvICYmIHByZWZhYkluZm8uYXNzZXQpIHtcclxuICAgICAgICAgICAgdGhpcy5hc3NldFRvTm9kZXNNYXAuZGVsZXRlKHByZWZhYkluZm8uYXNzZXQuX3V1aWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYXNzZXQgPSBhd2FpdCBScGMuZ2V0SW5zdGFuY2UoKS5yZXF1ZXN0KCdhc3NldE1hbmFnZXInLCAnY3JlYXRlQXNzZXQnLCBbe1xyXG4gICAgICAgICAgICB0YXJnZXQ6IHVybCxcclxuICAgICAgICAgICAgY29udGVudDogcmV0LnByZWZhYkRhdGEsXHJcbiAgICAgICAgICAgIG92ZXJ3cml0ZTogb3B0aW9ucy5vdmVyd3JpdGUsXHJcbiAgICAgICAgfV0pO1xyXG4gICAgICAgIGxldCBhc3NldFJvb3ROb2RlOiBOb2RlIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgaWYgKGFzc2V0KSB7XHJcbiAgICAgICAgICAgIGxldCB1bmRvSUQ7XHJcbiAgICAgICAgICAgIGxldCBjb21tYW5kO1xyXG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudDtcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudW5kbyAmJiBwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNvbW1hbmQgPSBuZXcgQ3JlYXRlUHJlZmFiQ29tbWFuZCgpO1xyXG4gICAgICAgICAgICAgICAgLy8gdW5kb0lEID0gY2NlLlNjZW5lRmFjYWRlTWFuYWdlci5iZWdpblJlY29yZGluZyhub2RlVVVJRCwgeyBjdXN0b21Db21tYW5kOiBjb21tYW5kIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gY29tbWFuZC51bmRvRGF0YSA9IG5ldyBNYXAoKTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbW1hbmQudW5kb0RhdGEuc2V0KHBhcmVudC51dWlkLCBjY2UuRHVtcC5lbmNvZGUuZW5jb2RlTm9kZShwYXJlbnQpKTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbW1hbmQudW5kb0RhdGEuc2V0KG5vZGVVVUlELCBjY2UuRHVtcC5lbmNvZGUuZW5jb2RlTm9kZShub2RlKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGFzc2V0Um9vdE5vZGUgPSBhd2FpdCB0aGlzLnJlcGxhY2VOZXdQcmVmYWJBc3NldFdpdGhDbGVhcmVkUmVmZXJlbmNlKG5vZGUsIGFzc2V0LnV1aWQsIHJldC5jbGVhcmVkUmVmZXJlbmNlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh1bmRvSUQgJiYgY29tbWFuZCAmJiBwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNvbW1hbmQucmVkb0RhdGEgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgICAgICAgICAvLyBjb21tYW5kLnJlZG9EYXRhLnNldChwYXJlbnQudXVpZCwgY2NlLkR1bXAuZW5jb2RlLmVuY29kZU5vZGUocGFyZW50KSk7XHJcbiAgICAgICAgICAgICAgICAvLyBjb21tYW5kLnJlZG9EYXRhLnNldChhc3NldFJvb3ROb2RlLnV1aWQsIGNjZS5EdW1wLmVuY29kZS5lbmNvZGVOb2RlKGFzc2V0Um9vdE5vZGUpKTtcclxuICAgICAgICAgICAgICAgIC8vIGNjZS5TY2VuZUZhY2FkZU1hbmFnZXIuZW5kUmVjb3JkaW5nKHVuZG9JRCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBhc3NldFJvb3ROb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIOW6lOeUqOiiq+a4heeQhuaOieeahOW8leeUqOaVsOaNrlxyXG4gICAgICogQHBhcmFtIG5vZGUg6aKE5Yi25L2T5a6e5L6L6IqC54K5XHJcbiAgICAgKiBAcGFyYW0gY2xlYXJlZFJlZmVyZW5jZSDooqvmuIXnkIbmjonnmoTlvJXnlKjmlbDmja5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlc3RvcmVDbGVhcmVkUmVmZXJlbmNlKG5vZGU6IE5vZGUsIGNsZWFyZWRSZWZlcmVuY2U6IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcclxuICAgICAgICBjb25zdCB0YXJnZXRNYXAgPSB7fTtcclxuICAgICAgICBQcmVmYWIuX3V0aWxzLmdlbmVyYXRlVGFyZ2V0TWFwKG5vZGUsIHRhcmdldE1hcCwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIC8vIOWmguaenOaLluaLveeahOaYr+aZrumAmuiKgueCue+8jOi/mOWOn+W8leeUqOWQju+8jOimgeabtOaWsCBwcm9wZXJ0eU92ZXJyaWRlcy90YXJnZXRPdmVycmlkZSDkv6Hmga9cclxuICAgICAgICAvLyDlpoLmnpzmi5bmi73nmoTmmK/pooTliLbkvZPvvIznlLHkuo7mlbDmja7lt7Lnu4/lrZjlnKjvvIzmiYDku6Xlj6/ku6XkuI3nlKjmm7TmlrBcclxuICAgICAgICBmb3IgKGNvbnN0IGZpbGVJRCBpbiBjbGVhcmVkUmVmZXJlbmNlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBjbGVhcmVkUmVmZXJlbmNlW2ZpbGVJRF07XHJcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsSURzID0gW2RhdGEuY29tcG9uZW50XTtcclxuICAgICAgICAgICAgY29uc3QgY29tcCA9IFByZWZhYi5fdXRpbHMuZ2V0VGFyZ2V0KGxvY2FsSURzLCB0YXJnZXRNYXApIGFzIENvbXBvbmVudDtcclxuICAgICAgICAgICAgaWYgKGNvbXApIHtcclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUg6YeN5paw6LWL5YC8XHJcbiAgICAgICAgICAgICAgICBjb21wW2RhdGEucGF0aF0gPSBkYXRhLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgLy8g5pu05pawIG5vZGUg5pWw5o2uXHJcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlID0gY29tcC5ub2RlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBjb21wLm5vZGUuY29tcG9uZW50cy5pbmRleE9mKGNvbXApO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgb3B0OiBJQ2hhbmdlTm9kZU9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcFBhdGg6IGBfX2NvbXBzX18uJHtpbmRleH0uJHtkYXRhLnBhdGh9YCxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBOb2RlRXZlbnRUeXBlLlNFVF9QUk9QRVJUWSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAvLyDov5nkuKrmlrnms5XkvJrmm7TmlrAgcHJvcGVydHlPdmVycmlkZXMvdGFyZ2V0T3ZlcnJpZGUg5L+h5oGvXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uTm9kZUNoYW5nZWRJbkdlbmVyYWxNb2RlKG5vZGUsIG9wdCwgU2VydmljZS5FZGl0b3IuZ2V0Um9vdE5vZGUoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsOmihOWItuS9k+i1hOa6kOWQjizmm7/mjaLlnLrmma/kuK3nmoTpooTliLbkvZPlrp7kvoss5bm26L+Y5Y6f6KKr5riF55CG5o6J55qE5byV55So5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gbm9kZSDlvoXmm7/mjaLnmoToioLngrlcclxuICAgICAqIEBwYXJhbSBwcmVmYWJBc3NldCDmlrDnmoTpooTliLbkvZPotYTmupAgdXVpZFxyXG4gICAgICogQHBhcmFtIGNsZWFyZWRSZWZlcmVuY2Ug6KKr5riF6Zmk55qE5a+55aSW6YOo6IqC54K555qE5byV55So5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyByZXBsYWNlTmV3UHJlZmFiQXNzZXRXaXRoQ2xlYXJlZFJlZmVyZW5jZShub2RlOiBOb2RlLCBwcmVmYWJBc3NldDogc3RyaW5nLCBjbGVhcmVkUmVmZXJlbmNlOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XHJcbiAgICAgICAgLy8g56e76Zmk5Y6f5p2l55qEIG5vZGUs5Yqg6L295paw55qE6aKE5Yi25L2T5L2c5Li65a2Q6IqC54K5XHJcbiAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnQ7XHJcbiAgICAgICAgaWYgKHBhcmVudCkge1xyXG4gICAgICAgICAgICBwcmVmYWJVdGlscy5maXJlQmVmb3JlQ2hhbmdlTXNnKHBhcmVudCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gbm9kZS5nZXRTaWJsaW5nSW5kZXgoKTtcclxuICAgICAgICAgICAgY29uc3QgcHJlZmFiID0gYXdhaXQgcHJvbWlzaWZ5KGFzc2V0TWFuYWdlci5sb2FkQW55KShwcmVmYWJBc3NldCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0Um9vdE5vZGUgPSBpbnN0YW50aWF0ZShwcmVmYWIpO1xyXG4gICAgICAgICAgICBpZiAoIWFzc2V0Um9vdE5vZGVbJ19wcmVmYWInXS5pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgYXNzZXRSb290Tm9kZVsnX3ByZWZhYiddLmluc3RhbmNlID0gcHJlZmFiVXRpbHMuY3JlYXRlUHJlZmFiSW5zdGFuY2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobm9kZVsnX3ByZWZhYiddICYmIG5vZGVbJ19wcmVmYWInXS5pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgYXNzZXRSb290Tm9kZVsnX3ByZWZhYiddLmluc3RhbmNlLmZpbGVJZCA9IG5vZGVbJ19wcmVmYWInXS5pbnN0YW5jZS5maWxlSWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSZXNlcnZlZFByb3BlcnR5T3ZlcnJpZGVzKGFzc2V0Um9vdE5vZGUpO1xyXG4gICAgICAgICAgICAvLyDlkIzmraUgUHJvcGVydHlPdmVycmlkZXNcclxuICAgICAgICAgICAgdGhpcy5zeW5jUHJvcGVydHlPdmVycmlkZXMoYXNzZXRSb290Tm9kZSwgU2VydmljZS5FZGl0b3IuZ2V0Um9vdE5vZGUoKSBhcyBOb2RlKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVzdG9yZUNsZWFyZWRSZWZlcmVuY2UoYXNzZXRSb290Tm9kZSwgY2xlYXJlZFJlZmVyZW5jZSk7XHJcblxyXG4gICAgICAgICAgICBub2RlLnBhcmVudCA9IG51bGw7XHJcbiAgICAgICAgICAgIHBhcmVudC5pbnNlcnRDaGlsZChhc3NldFJvb3ROb2RlLCBpbmRleCk7XHJcbiAgICAgICAgICAgIHByZWZhYlV0aWxzLmZpcmVDaGFuZ2VNc2cocGFyZW50KTtcclxuICAgICAgICAgICAgcmV0dXJuIGFzc2V0Um9vdE5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5bCG5LiA5LiqIG5vZGUg5LiO5LiA5LiqIHByZWZhYiDlhbPogZTliLDkuIDotbdcclxuICAgICAqIEBwYXJhbSBub2RlVVVJRFxyXG4gICAgICogQHBhcmFtIHsqfSBhc3NldFV1aWQg5YWz6IGU55qE6LWE5rqQXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBsaW5rTm9kZVdpdGhQcmVmYWJBc3NldChub2RlVVVJRDogc3RyaW5nIHwgTm9kZSwgYXNzZXRVdWlkOiBzdHJpbmcgfCBhbnkpIHtcclxuICAgICAgICBsZXQgbm9kZTogTm9kZSB8IG51bGwgPSBudWxsO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygbm9kZVVVSUQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIG5vZGUgPSBub2RlTWdyLmdldE5vZGUobm9kZVVVSUQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5vZGUgPSBub2RlVVVJRDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgYXNzZXQ6IGFueSA9IGFzc2V0VXVpZDtcclxuICAgICAgICBpZiAodHlwZW9mIGFzc2V0VXVpZCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgLy8gYXNzZXQgPSBjY2UucHJlZmFiVXRpbC5zZXJpYWxpemUuYXNBc3NldChhc3NldFV1aWQpO1xyXG4gICAgICAgICAgICBhc3NldCA9IGF3YWl0IHByb21pc2lmeShhc3NldE1hbmFnZXIubG9hZEFueSkoYXNzZXRVdWlkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghYXNzZXQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgYXNzZXQgJHthc3NldFV1aWR9IGRvZXNuJ3QgZXhpc3RgKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYXNzZXRSb290Tm9kZSA9IGFzc2V0LmRhdGE7XHJcbiAgICAgICAgaWYgKCFhc3NldFJvb3ROb2RlIHx8ICFhc3NldFJvb3ROb2RlWydfcHJlZmFiJ10pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJlZmFiVXRpbHMuZmlyZUJlZm9yZUNoYW5nZU1zZyhub2RlKTtcclxuXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGxldCBwcmVmYWJJbmZvID0gbm9kZVsnX3ByZWZhYiddO1xyXG4gICAgICAgIGlmICghcHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICBwcmVmYWJJbmZvID0gbmV3IFByZWZhYkluZm8oKTtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBub2RlWydfcHJlZmFiJ10gPSBwcmVmYWJJbmZvO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJlZmFiVXRpbHMucmVtb3ZlUHJlZmFiQXNzZXROb2RlSW5zdGFuY2VDYWNoZShwcmVmYWJJbmZvKTtcclxuICAgICAgICBpZiAoIXByZWZhYkluZm8uaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgY29uc3QgcHJlZmFiSW5zdGFuY2UgPSBwcmVmYWJVdGlscy5jcmVhdGVQcmVmYWJJbnN0YW5jZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBjb25zdCBwcmVmYWJJbmZvID0gbm9kZVsnX3ByZWZhYiddO1xyXG4gICAgICAgICAgICBpZiAocHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICAgICAgLy8gVEJEIOW9kyBwcmVmYWJJbmZvIOaYr+aWsOW7uueahOaXtuWAme+8jHJvb3Qg5Lya5Li656m6XHJcbiAgICAgICAgICAgICAgICBwcmVmYWJJbnN0YW5jZS5wcmVmYWJSb290Tm9kZSA9IHByZWZhYkluZm8ucm9vdDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBwcmVmYWJJbmZvLmluc3RhbmNlID0gcHJlZmFiSW5zdGFuY2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcHJlZmFiVXRpbHMucmVtb3ZlTW91bnRlZFJvb3RJbmZvKG5vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5b2T5YmN5qC56IqC54K555qEIGZpbGVJZCDlkIzmraXkuLogUHJlZmFiQXNzZXQg5qC56IqC54K555qEIGZpbGVJZCDlkI7vvIzlho3liJvlu7rpu5jorqTmoLnoioLngrnnmoQgUHJvcGVydHlPdmVycmlkZVxyXG4gICAgICAgIHByZWZhYkluZm8uZmlsZUlkID0gYXNzZXRSb290Tm9kZVsnX3ByZWZhYiddLmZpbGVJZDtcclxuICAgICAgICBwcmVmYWJJbmZvLnJvb3QgPSBub2RlO1xyXG4gICAgICAgIGNvbnN0IHByZWZhYkluc3RhbmNlID0gcHJlZmFiSW5mbz8uaW5zdGFuY2U7XHJcbiAgICAgICAgaWYgKHByZWZhYkluZm8gJiYgcHJlZmFiSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSZXNlcnZlZFByb3BlcnR5T3ZlcnJpZGVzKG5vZGUpO1xyXG4gICAgICAgICAgICAvLyDljrvmjonouqvkuIrnmoTlkITnp40gb3ZlcnJpZGUs5Lul5L6/6YeN5paw5Yqg6L295pe25a6M5YWo55SoIFByZWZhYkFzc2V0IOeahOaVsOaNrlxyXG4gICAgICAgICAgICBwcmVmYWJJbnN0YW5jZS5tb3VudGVkQ2hpbGRyZW4gPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVNb2RpZmllZFByb3BlcnR5T3ZlcnJpZGVzKHByZWZhYkluc3RhbmNlLCBwcmVmYWJJbmZvLmZpbGVJZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgcHJlZmFiSW5mby5hc3NldCA9IGFzc2V0O1xyXG5cclxuICAgICAgICBwcmVmYWJVdGlscy5maXJlQ2hhbmdlTXNnKG5vZGUpO1xyXG5cclxuICAgICAgICAvLyDlsIYgUHJlZmFiQXNzZXQg5Lit55qEIFByZWZhYkluZm8g5ZCM5q2l5Yiw5b2T5YmN6KaBIGxpbmsg55qE6IqC54K55LiKXHJcbiAgICAgICAgLy8g6L+Z6YeM5Li65LqGIFVuZG8g6IO95q2j5bi45bel5L2c77yM5LiN5L2/55SoIHNvZnRSZWxvYWQg55qE5pa55byP77yM6ZyA6KaB5rOo5oSP5aSE55CG5aW95pWw5o2u55qE5LiA6Ie05oCnXHJcbiAgICAgICAgdGhpcy5zeW5jUHJlZmFiSW5mbyhhc3NldFJvb3ROb2RlLCBub2RlLCBub2RlKTtcclxuXHJcbiAgICAgICAgdGhpcy5jaGVja1RvQWRkUHJlZmFiQXNzZXRNYXAobm9kZSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5oqK5bWM5aWX6aKE5Yi25L2T55qEIFByb3BlcnR5T3ZlcnJpZGVzIOS/oeaBr+abtOaWsOWIsOaWsOeahOmihOWItuS9k+WunuS+i+S4ilxyXG4gICAgICogQHBhcmFtIHByZWZhYk5vZGUg5b6F5ZCM5q2l55qE6aKE5Yi25L2T6IqC54K5XHJcbiAgICAgKiBAcGFyYW0gcm9vdE5vZGUg5bim5pyJ5omA5pyJ6aKE5Yi25L2T5a6e5L6L5L+h5oGv55qE5qC56IqC54K5XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzeW5jUHJvcGVydHlPdmVycmlkZXMocHJlZmFiTm9kZTogTm9kZSwgcm9vdE5vZGU6IE5vZGUpIHtcclxuICAgICAgICAvLyBjb2xsZWN0SW5zdGFuY2VPZlJvb3RcclxuICAgICAgICBjb25zdCByb290czogTm9kZVtdID0gW107XHJcbiAgICAgICAgcHJlZmFiVXRpbHMuZmluZE91dG1vc3RQcmVmYWJJbnN0YW5jZU5vZGVzKHJvb3ROb2RlIGFzIE5vZGUsIHJvb3RzKTtcclxuXHJcbiAgICAgICAgaWYgKHJvb3RzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgLy8gY29sbGVjdEluc3RhbmNlT2ZQcmVmYWJcclxuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VOb2RlcyA9IG5ldyBNYXAoKTtcclxuICAgICAgICAgICAgcHJlZmFiTm9kZS53YWxrKChjaGlsZDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRbJ19wcmVmYWInXSAmJiBjaGlsZFsnX3ByZWZhYiddLmluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VOb2Rlcy5zZXQoY2hpbGRbJ19wcmVmYWInXS5pbnN0YW5jZS5maWxlSWQsIGNoaWxkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBzeW5jIHByb3BlcnR5IG92ZXJyaWRlc1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IHJvb3RzLmxlbmd0aCAtIDE7IGluZGV4ID49IDA7IGluZGV4LS0pIHtcclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSByb290c1tpbmRleF1bJ19wcmVmYWInXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlRmlsZUlkID0gcHJlZmFiSW5mbz8uaW5zdGFuY2U/LmZpbGVJZDtcclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldEZpbGVJZCA9IHByZWZhYk5vZGVbJ19wcmVmYWInXS5pbnN0YW5jZT8uZmlsZUlkO1xyXG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlTm9kZXMuaGFzKGluc3RhbmNlRmlsZUlkKSAmJiBwcmVmYWJJbmZvPy5pbnN0YW5jZSAmJiBwcmVmYWJJbmZvLmluc3RhbmNlLnByb3BlcnR5T3ZlcnJpZGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldFByb3BPdmVycmlkZXMgPSBwcmVmYWJOb2RlWydfcHJlZmFiJ10uaW5zdGFuY2UucHJvcGVydHlPdmVycmlkZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJlZmFiSW5mby5pbnN0YW5jZS5wcm9wZXJ0eU92ZXJyaWRlcy5mb3JFYWNoKChwcm9wczogUHJvcGVydHlPdmVycmlkZUluZm8pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g6YOo5YiG5L+d55WZ5bGe5oCn5LiN6ZyA6KaB6YeN5aSN5aSE55CGXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc1Jlc2VydmVkUHJvcGVydHlPdmVycmlkZXMocHJvcHMsIHByZWZhYkluZm8uZmlsZUlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcE92ZXJyaWRlcy5wdXNoKHByb3BzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZUZpbGVJZCAhPT0gdGFyZ2V0RmlsZUlkICYmIGluc3RhbmNlRmlsZUlkICYmIHByb3BzLnRhcmdldEluZm8/LmxvY2FsSURbMF0gIT09IGluc3RhbmNlRmlsZUlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMudGFyZ2V0SW5mbz8ubG9jYWxJRC51bnNoaWZ0KGluc3RhbmNlRmlsZUlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOmcgOimgeabtOaWsOWxnuaAp1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRNYXAgPSB7fTtcclxuICAgICAgICAgICAgUHJlZmFiLl91dGlscy5nZW5lcmF0ZVRhcmdldE1hcChwcmVmYWJOb2RlLCB0YXJnZXRNYXAsIHRydWUpO1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIFByZWZhYi5fdXRpbHMuYXBwbHlQcm9wZXJ0eU92ZXJyaWRlcyhwcmVmYWJOb2RlLCBwcmVmYWJOb2RlWydfcHJlZmFiJ10uaW5zdGFuY2UucHJvcGVydHlPdmVycmlkZXMsIHRhcmdldE1hcCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIOWwhiBQcmVmYWJBc3NldCDkuK3nmoQgUHJlZmFiIOS/oeaBr+WQjOatpeWIsOW9k+WJjeeahOiKgueCueS4ilxyXG4gICAgcHVibGljIHN5bmNQcmVmYWJJbmZvKGFzc2V0Tm9kZTogTm9kZSwgZHN0Tm9kZTogTm9kZSwgcm9vdE5vZGU6IE5vZGUpIHtcclxuICAgICAgICBpZiAoIWFzc2V0Tm9kZSB8fCAhZHN0Tm9kZSB8fCAhcm9vdE5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBtZW1iZXIgYWNjZXNzXHJcbiAgICAgICAgY29uc3Qgc3JjUHJlZmFiSW5mbyA9IGFzc2V0Tm9kZVsnX3ByZWZhYiddO1xyXG5cclxuICAgICAgICBpZiAoIXNyY1ByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJlZmFiVXRpbHMuZmlyZUJlZm9yZUNoYW5nZU1zZyhkc3ROb2RlKTtcclxuXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBtZW1iZXIgYWNjZXNzXHJcbiAgICAgICAgaWYgKCFkc3ROb2RlWydfcHJlZmFiJ10pIHtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSBtZW1iZXIgYWNjZXNzXHJcbiAgICAgICAgICAgIGRzdE5vZGVbJ19wcmVmYWInXSA9IG5ldyBQcmVmYWJJbmZvKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBAdHMtaWdub3JlIG1lbWJlciBhY2Nlc3NcclxuICAgICAgICBjb25zdCBkc3RQcmVmYWJJbmZvID0gZHN0Tm9kZVsnX3ByZWZhYiddO1xyXG5cclxuICAgICAgICBpZiAoIWRzdFByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5bWM5aWX55qEIHByZWZhYiDlrZDoioLngrnlj6rpnIDopoHlkIzmraXkuIDkuIvmlrDnmoQgYXNzZXQg5ZKMIHByZWZhYlJvb3ROb2RlIOWwseWlveS6hlxyXG4gICAgICAgIGlmIChkc3RQcmVmYWJJbmZvLmluc3RhbmNlICYmIGRzdE5vZGUgIT09IHJvb3ROb2RlKSB7XHJcbiAgICAgICAgICAgIGRzdFByZWZhYkluZm8uYXNzZXQgPSBzcmNQcmVmYWJJbmZvLmFzc2V0O1xyXG4gICAgICAgICAgICBkc3RQcmVmYWJJbmZvLmluc3RhbmNlLnByZWZhYlJvb3ROb2RlID0gcm9vdE5vZGU7XHJcbiAgICAgICAgICAgIHByZWZhYlV0aWxzLmZpcmVDaGFuZ2VNc2coZHN0Tm9kZSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRzdFByZWZhYkluZm8uZmlsZUlkID0gc3JjUHJlZmFiSW5mby5maWxlSWQ7XHJcbiAgICAgICAgZHN0UHJlZmFiSW5mby5hc3NldCA9IHNyY1ByZWZhYkluZm8uYXNzZXQ7XHJcbiAgICAgICAgZHN0UHJlZmFiSW5mby5yb290ID0gcm9vdE5vZGU7XHJcblxyXG4gICAgICAgIGlmIChhc3NldE5vZGUuY29tcG9uZW50cy5sZW5ndGggIT09IGRzdE5vZGUuY29tcG9uZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignUHJlZmFiIENvbXBvbmVudCBkb2VzblxcJ3QgbWF0Y2gnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY29weSBjb21wb25lbnQgZmlsZUlEXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhc3NldE5vZGUuY29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBzcmNDb21wID0gYXNzZXROb2RlLmNvbXBvbmVudHNbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IGRzdENvbXAgPSBkc3ROb2RlLmNvbXBvbmVudHNbaV07XHJcbiAgICAgICAgICAgIGlmIChzcmNDb21wICYmIHNyY0NvbXAuX19wcmVmYWIgJiYgZHN0Q29tcCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFkc3RDb21wLl9fcHJlZmFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHN0Q29tcC5fX3ByZWZhYiA9IG5ldyBDb21wUHJlZmFiSW5mbygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGRzdENvbXAuX19wcmVmYWIhLmZpbGVJZCA9IHNyY0NvbXAuX19wcmVmYWIuZmlsZUlkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcmVmYWJVdGlscy5maXJlQ2hhbmdlTXNnKGRzdE5vZGUpO1xyXG5cclxuICAgICAgICAvLyDpnIDopoHliZTpmaTmjonnp4HmnIkgTm9kZSDnmoTlvbHlk41cclxuICAgICAgICAvLyDlubbkuJTlgYforr7pmaTljrvnp4HmnInoioLngrnlkI7vvIxjaGlsZHJlbiDpobrluo/lkozljp/mnaXkuIDoh7RcclxuICAgICAgICBjb25zdCBkc3RDaGlsZHJlbjogTm9kZVtdID0gW107XHJcbiAgICAgICAgZHN0Tm9kZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xyXG4gICAgICAgICAgICAvLyDljrvmjonkuI3mmL7npLrnmoToioLngrlcclxuICAgICAgICAgICAgaWYgKGNoaWxkLm9iakZsYWdzICYgQ0NPYmplY3QuRmxhZ3MuSGlkZUluSGllcmFyY2h5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRzdENoaWxkcmVuLnB1c2goY2hpbGQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoYXNzZXROb2RlLmNoaWxkcmVuLmxlbmd0aCAhPT0gZHN0Q2hpbGRyZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1ByZWZhYiBOb2RlIGRvZXNuXFwndCBtYXRjaCcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFzc2V0Tm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBzcmNDaGlsZE5vZGUgPSBhc3NldE5vZGUuY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgIGNvbnN0IGRzdENoaWxkTm9kZSA9IGRzdENoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICB0aGlzLnN5bmNQcmVmYWJJbmZvKHNyY0NoaWxkTm9kZSwgZHN0Q2hpbGROb2RlLCByb290Tm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjcmVhdGVSZXNlcnZlZFByb3BlcnR5T3ZlcnJpZGVzKG5vZGU6IE5vZGUpIHtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IG5vZGVbJ19wcmVmYWInXTtcclxuXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5zdGFuY2UgPSBwcmVmYWJJbmZvPy5pbnN0YW5jZTtcclxuXHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbmZvIHx8ICFwcmVmYWJJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IFJvb3RSZXNlcnZlZFByb3BlcnR5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsSUQgPSBbcHJlZmFiSW5mby5maWxlSWRdO1xyXG4gICAgICAgICAgICBjb25zdCBwcm9wUGF0aCA9IFtSb290UmVzZXJ2ZWRQcm9wZXJ0eVtpXV07XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3BWYWx1ZSA9IChub2RlIGFzIGFueSlbUm9vdFJlc2VydmVkUHJvcGVydHlbaV1dO1xyXG4gICAgICAgICAgICBjb25zdCBwcm9wT3ZlcnJpZGUgPSBwcmVmYWJVdGlscy5nZXRQcm9wZXJ0eU92ZXJyaWRlKHByZWZhYkluc3RhbmNlLCBsb2NhbElELCBwcm9wUGF0aCk7XHJcbiAgICAgICAgICAgIHByb3BPdmVycmlkZS52YWx1ZSA9IHByb3BWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJldmVydFByb3BlcnR5T3ZlcnJpZGUocHJvcE92ZXJyaWRlOiBQcmVmYWIuX3V0aWxzLlByb3BlcnR5T3ZlcnJpZGVJbmZvLCBjdXJOb2RlVGFyZ2V0TWFwOiBhbnksIGFzc2V0VGFyZ2V0TWFwOiBhbnkpIHtcclxuICAgICAgICBpZiAoIXByb3BPdmVycmlkZSB8fCAhcHJvcE92ZXJyaWRlLnRhcmdldEluZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdGFyZ2V0SW5mbyA9IHByb3BPdmVycmlkZS50YXJnZXRJbmZvO1xyXG4gICAgICAgIGNvbnN0IGFzc2V0VGFyZ2V0ID0gUHJlZmFiLl91dGlscy5nZXRUYXJnZXQodGFyZ2V0SW5mby5sb2NhbElELCBhc3NldFRhcmdldE1hcCk7XHJcbiAgICAgICAgY29uc3QgY3VyVGFyZ2V0ID0gUHJlZmFiLl91dGlscy5nZXRUYXJnZXQodGFyZ2V0SW5mby5sb2NhbElELCBjdXJOb2RlVGFyZ2V0TWFwKTtcclxuICAgICAgICBpZiAoIWFzc2V0VGFyZ2V0IHx8ICFjdXJUYXJnZXQpIHtcclxuICAgICAgICAgICAgLy8gQ2FuJ3QgZmluZCB0YXJnZXRcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG5vZGU6IE5vZGUgfCBudWxsID0gbnVsbDtcclxuICAgICAgICBpZiAoY3VyVGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkge1xyXG4gICAgICAgICAgICBub2RlID0gY3VyVGFyZ2V0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY3VyVGFyZ2V0IGluc3RhbmNlb2YgQ29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgIG5vZGUgPSBjdXJUYXJnZXQubm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgYXNzZXRUYXJnZXRQcm9wT3duZXI6IGFueSA9IGFzc2V0VGFyZ2V0O1xyXG5cclxuICAgICAgICBsZXQgY3VyVGFyZ2V0UHJvcE93bmVyOiBhbnkgPSBjdXJUYXJnZXQ7XHJcbiAgICAgICAgbGV0IGN1clRhcmdldFByb3BPd25lclBhcmVudDogYW55ID0gY3VyVGFyZ2V0OyAvLyDnlKjkuo7orrDlvZXmnIDlkI7mlbDnu4TmiYDlnKjnmoRvYmplY3RcclxuICAgICAgICBsZXQgdGFyZ2V0UHJvcE93bmVyTmFtZSA9ICcnO1xyXG4gICAgICAgIGNvbnN0IHByb3BlcnR5UGF0aCA9IHByb3BPdmVycmlkZS5wcm9wZXJ0eVBhdGguc2xpY2UoKTtcclxuICAgICAgICBpZiAocHJvcGVydHlQYXRoLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0UHJvcE5hbWUgPSBwcm9wZXJ0eVBhdGgucG9wKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRhcmdldFByb3BOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvcGVydHlQYXRoLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9wTmFtZSA9IHByb3BlcnR5UGF0aFtpXTtcclxuICAgICAgICAgICAgICAgIHRhcmdldFByb3BPd25lck5hbWUgPSBwcm9wTmFtZTtcclxuICAgICAgICAgICAgICAgIGFzc2V0VGFyZ2V0UHJvcE93bmVyID0gYXNzZXRUYXJnZXRQcm9wT3duZXJbcHJvcE5hbWVdO1xyXG5cclxuICAgICAgICAgICAgICAgIGN1clRhcmdldFByb3BPd25lclBhcmVudCA9IGN1clRhcmdldFByb3BPd25lcjtcclxuICAgICAgICAgICAgICAgIGN1clRhcmdldFByb3BPd25lciA9IGN1clRhcmdldFByb3BPd25lcltwcm9wTmFtZV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHByZWZhYlV0aWxzLmZpcmVCZWZvcmVDaGFuZ2VNc2cobm9kZSk7XHJcblxyXG4gICAgICAgICAgICBjdXJUYXJnZXRQcm9wT3duZXJbdGFyZ2V0UHJvcE5hbWVdID0gYXNzZXRUYXJnZXRQcm9wT3duZXJbdGFyZ2V0UHJvcE5hbWVdO1xyXG5cclxuICAgICAgICAgICAgLy8g5aaC5p6c5piv5pS55pWw57uE5YWD57Sg77yM6ZyA6KaB6YeN5paw6LWL5YC85LiA5LiL6Ieq5bex5Lul6Kem5Y+RIHNldHRlclxyXG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjdXJUYXJnZXRQcm9wT3duZXIpICYmIGN1clRhcmdldFByb3BPd25lclBhcmVudCAmJiB0YXJnZXRQcm9wT3duZXJOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJUYXJnZXRQcm9wT3duZXJQYXJlbnRbdGFyZ2V0UHJvcE93bmVyTmFtZV0gPSBjdXJUYXJnZXRQcm9wT3duZXI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHByZWZhYlV0aWxzLmZpcmVDaGFuZ2VNc2cobm9kZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdwcm9wZXJ0eSBwYXRoIGlzIGVtcHR5Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOi/mOWOn+S4gOS4qiBQcmVmYWJJbnN0YW5jZSDnmoTmlbDmja7kuLrlroPmiYDlhbPogZTnmoQgUHJlZmFiQXNzZXRcclxuICAgICAqIEBwYXJhbSBub2RlVVVJRCBub2RlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyByZXZlcnRQcmVmYWIobm9kZVVVSUQ6IE5vZGUgfCBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgbm9kZTogTm9kZSB8IG51bGwgPSBudWxsO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygbm9kZVVVSUQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIG5vZGUgPSBub2RlTWdyLmdldE5vZGUobm9kZVVVSUQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5vZGUgPSBub2RlVVVJRDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IG5vZGVbJ19wcmVmYWInXTtcclxuXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5zdGFuY2UgPSBwcmVmYWJJbmZvPy5pbnN0YW5jZTtcclxuXHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbnN0YW5jZSB8fCAhcHJlZmFiSW5mbz8uYXNzZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYXNzZXRSb290Tm9kZSA9IGluc3RhbnRpYXRlKHByZWZhYkluZm8uYXNzZXQpO1xyXG5cclxuICAgICAgICBpZiAoIWFzc2V0Um9vdE5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGNvbnN0IGN1ck5vZGVQcmVmYWJJbmZvID0gbm9kZVsnX3ByZWZhYiddO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBjb25zdCBhc3NldFJvb3ROb2RlUHJlZmFiSW5mbyA9IGFzc2V0Um9vdE5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICBpZiAoIWN1ck5vZGVQcmVmYWJJbmZvIHx8ICFhc3NldFJvb3ROb2RlUHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhc3NldFRhcmdldE1hcCA9IHt9O1xyXG4gICAgICAgIGNvbnN0IGN1ck5vZGVUYXJnZXRNYXAgPSB7fTtcclxuXHJcbiAgICAgICAgUHJlZmFiLl91dGlscy5nZW5lcmF0ZVRhcmdldE1hcChhc3NldFJvb3ROb2RlLCBhc3NldFRhcmdldE1hcCwgdHJ1ZSk7XHJcbiAgICAgICAgUHJlZmFiLl91dGlscy5nZW5lcmF0ZVRhcmdldE1hcChub2RlLCBjdXJOb2RlVGFyZ2V0TWFwLCB0cnVlKTtcclxuXHJcbiAgICAgICAgcHJlZmFiVXRpbHMuZmlyZUJlZm9yZUNoYW5nZU1zZyhub2RlKTtcclxuXHJcbiAgICAgICAgLy8gY29uc3QgY29tbWFuZCA9IG5ldyBSZXZlcnRQcmVmYWJDb21tYW5kKCk7XHJcbiAgICAgICAgLy8gY29uc3QgdW5kb0lEID0gY2NlLlNjZW5lRmFjYWRlTWFuYWdlci5iZWdpblJlY29yZGluZyhub2RlLnV1aWQsIHsgY3VzdG9tQ29tbWFuZDogY29tbWFuZCB9KTtcclxuICAgICAgICAvLyBjb21tYW5kLnVuZG9EYXRhID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIC8vIGNvbW1hbmQudW5kb0RhdGEuc2V0KG5vZGUudXVpZCwgY2NlLkR1bXAuZW5jb2RlLmVuY29kZU5vZGUobm9kZSkpO1xyXG4gICAgICAgIC8vIGNvbW1hbmQucmVkb0RhdGEgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgY29uc3QgcmVzZXJ2ZWRQcm9wZXJ0eU92ZXJyaWRlcyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlZmFiSW5zdGFuY2UucHJvcGVydHlPdmVycmlkZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgcHJvcE92ZXJyaWRlID0gcHJlZmFiSW5zdGFuY2UucHJvcGVydHlPdmVycmlkZXNbaV07XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzUmVzZXJ2ZWRQcm9wZXJ0eU92ZXJyaWRlcyhwcm9wT3ZlcnJpZGUsIHByZWZhYkluZm8uZmlsZUlkKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzZXJ2ZWRQcm9wZXJ0eU92ZXJyaWRlcy5wdXNoKHByb3BPdmVycmlkZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBwcmVmYWJVdGlscy5nZXRUYXJnZXQocHJvcE92ZXJyaWRlLnRhcmdldEluZm8/LmxvY2FsSUQgPz8gW10sIG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc3Qgbm9kZTIgPSB0YXJnZXQgaW5zdGFuY2VvZiBOb2RlID8gdGFyZ2V0IDogdGFyZ2V0Py5ub2RlO1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKG5vZGUyICYmICFjb21tYW5kLnVuZG9EYXRhLmhhcyhub2RlMi51dWlkKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbW1hbmQudW5kb0RhdGEuc2V0KG5vZGUyLnV1aWQsIGNjZS5EdW1wLmVuY29kZS5lbmNvZGVOb2RlKG5vZGUyKSk7XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJldmVydFByb3BlcnR5T3ZlcnJpZGUocHJvcE92ZXJyaWRlLCBjdXJOb2RlVGFyZ2V0TWFwLCBhc3NldFRhcmdldE1hcCk7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiAobm9kZTIgJiYgIWNvbW1hbmQucmVkb0RhdGEuaGFzKG5vZGUyLnV1aWQpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgY29tbWFuZC5yZWRvRGF0YS5zZXQobm9kZTIudXVpZCwgY2NlLkR1bXAuZW5jb2RlLmVuY29kZU5vZGUobm9kZTIpKTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJlZmFiSW5zdGFuY2UucHJvcGVydHlPdmVycmlkZXMgPSByZXNlcnZlZFByb3BlcnR5T3ZlcnJpZGVzO1xyXG5cclxuICAgICAgICAvLyDljrvmjonpop3lpJbmt7vliqDnmoToioLngrlcclxuICAgICAgICB0aGlzLmlzUmVtb3ZpbmdNb3VudGVkQ2hpbGRyZW4gPSB0cnVlOyAvLyDnlKjkuo7pmLLmraLkuIvpnaLnp7vpmaTlrZDoioLngrnml7bljrvmm7TmlrBtb3VudGVkQ2hpbGRyZW7ph4znmoTmlbDmja5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZhYkluc3RhbmNlLm1vdW50ZWRDaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBhZGRlZENoaWxkSW5mbyA9IHByZWZhYkluc3RhbmNlLm1vdW50ZWRDaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBhZGRlZENoaWxkSW5mby5ub2Rlcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgYWRkZWRDaGlsZEluZm8ubm9kZXNbal0uc2V0UGFyZW50KG51bGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByZWZhYkluc3RhbmNlLm1vdW50ZWRDaGlsZHJlbiA9IFtdO1xyXG4gICAgICAgIHRoaXMuaXNSZW1vdmluZ01vdW50ZWRDaGlsZHJlbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjb21wb25lbnRPcGVyYXRpb24uaXNSZW1vdmluZ01vdW50ZWRDb21wb25lbnRzID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZhYkluc3RhbmNlLm1vdW50ZWRDb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1vdW50ZWRDb21wSW5mbyA9IHByZWZhYkluc3RhbmNlLm1vdW50ZWRDb21wb25lbnRzW2ldO1xyXG4gICAgICAgICAgICAvLyDpgIbluo/vvIzpgb/lhY3nu4Tku7bpl7TmnInkvp3otZblhbPns7vlr7zoh7TmiqXplJlcclxuICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0gbW91bnRlZENvbXBJbmZvLmNvbXBvbmVudHMubGVuZ3RoO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gbGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXAgPSBtb3VudGVkQ29tcEluZm8uY29tcG9uZW50c1tqXTtcclxuICAgICAgICAgICAgICAgIGlmIChjb21wICYmIGNvbXAubm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXAubm9kZS5yZW1vdmVDb21wb25lbnQoY29tcCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g6ZyA6KaB56uL5Yi75omn6KGMIHJlbW92ZUNvbXBvbmVudCDmk43kvZzvvIzlkKbliJnkvJrlu7bov5/liLDkuIvkuIDluKdcclxuICAgICAgICBjYy5PYmplY3QuX2RlZmVycmVkRGVzdHJveSgpO1xyXG4gICAgICAgIHByZWZhYkluc3RhbmNlLm1vdW50ZWRDb21wb25lbnRzID0gW107XHJcbiAgICAgICAgY29tcG9uZW50T3BlcmF0aW9uLmlzUmVtb3ZpbmdNb3VudGVkQ29tcG9uZW50cyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjb21wb25lbnRPcGVyYXRpb24uaXNSZXZlcnRpbmdSZW1vdmVkQ29tcG9uZW50cyA9IHRydWU7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVmYWJJbnN0YW5jZS5yZW1vdmVkQ29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRJbmZvID0gcHJlZmFiSW5zdGFuY2UucmVtb3ZlZENvbXBvbmVudHNbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldENvbXBJbkFzc2V0ID0gUHJlZmFiLl91dGlscy5nZXRUYXJnZXQodGFyZ2V0SW5mby5sb2NhbElELCBhc3NldFRhcmdldE1hcCkgYXMgQ29tcG9uZW50O1xyXG4gICAgICAgICAgICBpZiAoIXRhcmdldENvbXBJbkFzc2V0KSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3Qgbm9kZUxvY2FsSUQgPSB0YXJnZXRJbmZvLmxvY2FsSUQuc2xpY2UoKTtcclxuICAgICAgICAgICAgbm9kZUxvY2FsSUQucG9wKCk7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgbm9kZUxvY2FsSUQucHVzaCh0YXJnZXRDb21wSW5Bc3NldC5ub2RlWydfcHJlZmFiJ10/LmZpbGVJZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbXBOb2RlID0gUHJlZmFiLl91dGlscy5nZXRUYXJnZXQobm9kZUxvY2FsSUQsIGN1ck5vZGVUYXJnZXRNYXApIGFzIE5vZGU7XHJcbiAgICAgICAgICAgIGF3YWl0IGNvbXBvbmVudE9wZXJhdGlvbi5jbG9uZUNvbXBvbmVudFRvTm9kZShjb21wTm9kZSwgdGFyZ2V0Q29tcEluQXNzZXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcmVmYWJJbnN0YW5jZS5yZW1vdmVkQ29tcG9uZW50cyA9IFtdO1xyXG4gICAgICAgIGNvbXBvbmVudE9wZXJhdGlvbi5pc1JldmVydGluZ1JlbW92ZWRDb21wb25lbnRzID0gZmFsc2U7XHJcbiAgICAgICAgLy8gY29tbWFuZC5yZWRvRGF0YS5zZXQobm9kZS51dWlkLCBjY2UuRHVtcC5lbmNvZGUuZW5jb2RlTm9kZShub2RlKSk7XHJcbiAgICAgICAgLy8gaWYgKHVuZG9JRCkge1xyXG4gICAgICAgIC8vICAgICBjY2UuU2NlbmVGYWNhZGVNYW5hZ2VyLmVuZFJlY29yZGluZyh1bmRvSUQpO1xyXG4gICAgICAgIC8vIH1cclxuICAgICAgICBwcmVmYWJVdGlscy5maXJlQ2hhbmdlTXNnKG5vZGUpO1xyXG5cclxuICAgICAgICAvLyDlm6DkuLrnjrDlnKjmgaLlpI3nmoTmmK/np4HmnInlj5jph4/vvIzmsqHmnInop6blj5Egc2V0dGVy77yM5omA5Lul5pqC5pe25Y+q6IO9IHNvZnRSZWxvYWQg5p2l5L+d6K+B5pWI5p6c5q2j56GuXHJcbiAgICAgICAgYXdhaXQgU2VydmljZS5FZGl0b3IucmVsb2FkKHt9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbW92ZVByZWZhYkluZm9Gcm9tTm9kZShub2RlOiBOb2RlLCByZW1vdmVOZXN0ZWQ/OiBib29sZWFuKSB7XHJcbiAgICAgICAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZDogTm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkUHJlZmFiSW5zdGFuY2UgPSBjaGlsZFsnX3ByZWZhYiddPy5pbnN0YW5jZTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkUHJlZmFiSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgIC8vIOWIpOaWreW1jOWll+eahCBQcmVmYWJJbnN0YW5jZSDmmK/lkKbpnIDopoHnp7vpmaRcclxuICAgICAgICAgICAgICAgIGlmIChyZW1vdmVOZXN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVByZWZhYkluZm9Gcm9tTm9kZShjaGlsZCwgcmVtb3ZlTmVzdGVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlUHJlZmFiSW5mb0Zyb21Ob2RlKGNoaWxkLCByZW1vdmVOZXN0ZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHByZWZhYlV0aWxzLnJlbW92ZVByZWZhYkluZm8obm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbW92ZVByZWZhYkluZm9Gcm9tSW5zdGFuY2VOb2RlKG5vZGU6IE5vZGUsIHJlbW92ZU5lc3RlZD86IGJvb2xlYW4pOiBib29sZWFuIHtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IG5vZGVbJ19wcmVmYWInXTtcclxuXHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHByZWZhYkluc3RhbmNlID0gcHJlZmFiSW5mby5pbnN0YW5jZTtcclxuICAgICAgICAvLyDmraPluLjmg4XlhrXkuIvlj6rog73lnKggUHJlZmFiSW5zdGFuY2Ug5LiK5L2/55SoIHVuV3JhcFxyXG4gICAgICAgIC8vIOWmguaenOi1hOa6kOS4ouWkse+8jOS5n+WPr+S7peino+mZpOWFs+ezu1xyXG4gICAgICAgIGlmIChwcmVmYWJJbnN0YW5jZSB8fCAhcHJlZmFiSW5mby5hc3NldCkge1xyXG4gICAgICAgICAgICAvLyDnp7vpmaQgbW91bnRlZFJvb3Qg5L+h5oGvXHJcbiAgICAgICAgICAgIHByZWZhYlV0aWxzLnJlbW92ZU1vdW50ZWRSb290SW5mbyhub2RlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSBwcmVmYWJJbmZvXHJcbiAgICAgICAgICAgIHByZWZhYlV0aWxzLndhbGtOb2RlKG5vZGUsICh0YXJnZXQsIGlzQ2hpbGQpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIHNraXAgcm9vdFxyXG4gICAgICAgICAgICAgICAgaWYgKCFpc0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0UHJlZmFiSW5mbyA9IHRhcmdldFsnX3ByZWZhYiddO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0YXJnZXRQcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRQcmVmYWJJbnN0YW5jZSA9IHRhcmdldFByZWZhYkluZm8uaW5zdGFuY2U7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0UHJlZmFiSW5zdGFuY2UgfHwgIXRhcmdldFByZWZhYkluZm8uYXNzZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0UHJlZmFiSW5zdGFuY2UgJiYgdGFyZ2V0UHJlZmFiSW5zdGFuY2UucHJlZmFiUm9vdE5vZGUgPT09IG5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Y675o6J5a2Q6IqC54K55Lit55qEIFByZWZhYkluc3RhbmNlIOeahCBwcmVmYWJSb290Tm9kZSDlr7nov5nkuKroioLngrnnmoTmjIflkJFcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJlZmFiSW5zdGFuY2UucHJlZmFiUm9vdE5vZGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlV0aWxzLmZpcmVDaGFuZ2VNc2codGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZU5lc3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVByZWZhYkluZm9Gcm9tSW5zdGFuY2VOb2RlKHRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmVmYWJVdGlscy5yZW1vdmVQcmVmYWJJbmZvKHRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHByZWZhYlV0aWxzLnJlbW92ZVByZWZhYkluZm8obm9kZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbW92ZVByZWZhYkluc3RhbmNlQW5kQ2hhbmdlUm9vdChub2RlOiBOb2RlLCByb290Tm9kZTogTm9kZSwgcmVtb3ZlTmVzdGVkPzogYm9vbGVhbikge1xyXG4gICAgICAgIG5vZGUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQ6IE5vZGUpID0+IHtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBpZiAoY2hpbGRbJ19wcmVmYWInXT8uaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgIC8vIOWIpOaWreW1jOWll+eahCBQcmVmYWJJbnN0YW5jZSDmmK/lkKbpnIDopoHnp7vpmaRcclxuICAgICAgICAgICAgICAgIGlmIChyZW1vdmVOZXN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVByZWZhYkluc3RhbmNlQW5kQ2hhbmdlUm9vdChjaGlsZCwgcm9vdE5vZGUsIHJlbW92ZU5lc3RlZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVByZWZhYkluc3RhbmNlQW5kQ2hhbmdlUm9vdChjaGlsZCwgcm9vdE5vZGUsIHJlbW92ZU5lc3RlZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBtZW1iZXIgYWNjZXNzXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IG5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICBpZiAoIXByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJlZmFiVXRpbHMuZmlyZUJlZm9yZUNoYW5nZU1zZyhub2RlKTtcclxuXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBtZW1iZXIgYWNjZXNzXHJcbiAgICAgICAgY29uc3Qgcm9vdFByZWZhYkluZm8gPSByb290Tm9kZVsnX3ByZWZhYiddO1xyXG4gICAgICAgIGlmIChyb290UHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICBwcmVmYWJJbmZvLnJvb3QgPSByb290Tm9kZTtcclxuICAgICAgICAgICAgcHJlZmFiSW5mby5hc3NldCA9IHJvb3RQcmVmYWJJbmZvLmFzc2V0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHByZWZhYkluZm8uaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgcHJlZmFiSW5mby5pbnN0YW5jZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOino+mZpOW1jOWll+eahCBQcmVmYWIg5a6e5L6LLOWGhemDqOiKgueCuemAgOWMluS4uuW9k+WJjSBQcmVmYWIg6LWE5rqQ6YeM55qE6IqC54K5XHJcbiAgICAgICAgLy8g6ZyA6KaB5bCG5a6D5Lus55qEIFByZWZhYkluZm8g5Lit55qEIEZpbGVJZCDph43mlrDorr7nva7vvIzlkKbliJnnlLHlkIzkuIDkuKrotYTmupBcclxuICAgICAgICAvLyDlrp7kvovljJblh7rmnaXnmoTlpJrkuKogUHJlZmFiIOWunuS+i++8jOino+mZpOWQjuWug+S7rOeahCBGaWxlSWQg5Lya5Yay56qBXHJcbiAgICAgICAgcHJlZmFiSW5mby5maWxlSWQgPSBub2RlLnV1aWQ7XHJcbiAgICAgICAgbm9kZS5jb21wb25lbnRzLmZvckVhY2goKGNvbXApID0+IHtcclxuICAgICAgICAgICAgaWYgKGNvbXAuX19wcmVmYWIpIHtcclxuICAgICAgICAgICAgICAgIGNvbXAuX19wcmVmYWIuZmlsZUlkID0gY29tcC51dWlkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHByZWZhYlV0aWxzLmZpcmVDaGFuZ2VNc2cobm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDop6PpmaQgUHJlZmFiSW5zdGFuY2Ug5a+5IFByZWZhYkFzc2V0IOeahOWFs+iBlFxyXG4gICAgICogQHBhcmFtIG5vZGVVVUlEIOiKgueCueaIluiKgueCueeahCBVVUlEXHJcbiAgICAgKiBAcGFyYW0gcmVtb3ZlTmVzdGVkIOaYr+WQpumAkuW9kueahOino+mZpOWtkOiKgueCuSBQcmVmYWJJbnN0YW5jZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdW5XcmFwUHJlZmFiSW5zdGFuY2Uobm9kZVVVSUQ6IHN0cmluZyB8IE5vZGUsIHJlbW92ZU5lc3RlZD86IGJvb2xlYW4pOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgbm9kZTogTm9kZSB8IG51bGwgPSBudWxsO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygbm9kZVVVSUQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIG5vZGUgPSBub2RlTWdyLmdldE5vZGUobm9kZVVVSUQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5vZGUgPSBub2RlVVVJRDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IG5vZGVbJ19wcmVmYWInXTtcclxuICAgICAgICBpZiAoIXByZWZhYkluZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5q2j5bi45oOF5Ya15LiL5Y+q6IO95ZyoIFByZWZhYkluc3RhbmNlIOS4iuS9v+eUqCB1bldyYXBcclxuICAgICAgICAvLyDlpoLmnpzotYTmupDkuKLlpLHvvIzkuZ/lj6/ku6Xop6PpmaTlhbPns7tcclxuICAgICAgICBpZiAocHJlZmFiSW5mby5pbnN0YW5jZSB8fCAhcHJlZmFiSW5mby5hc3NldCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZW1vdmVQcmVmYWJJbmZvRnJvbUluc3RhbmNlTm9kZShub2RlLCByZW1vdmVOZXN0ZWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5ZyoIFByZWZhYiDnvJbovpHmqKHlvI/kuIvkuI3og73np7vpmaQgcHJlZmFiSW5mb++8jOWPqumcgOimgeenu+mZpCBpbnN0YW5jZVxyXG4gICAgcHVibGljIHVuV3JhcFByZWZhYkluc3RhbmNlSW5QcmVmYWJNb2RlKG5vZGVVVUlEOiBzdHJpbmcgfCBOb2RlLCByZW1vdmVOZXN0ZWQ/OiBib29sZWFuKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IG5vZGU6IE5vZGUgfCBudWxsID0gbnVsbDtcclxuICAgICAgICBpZiAodHlwZW9mIG5vZGVVVUlEID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBub2RlID0gbm9kZU1nci5nZXROb2RlKG5vZGVVVUlEKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBub2RlID0gbm9kZVVVSUQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm8gPSBub2RlWydfcHJlZmFiJ107XHJcbiAgICAgICAgaWYgKCFwcmVmYWJJbmZvKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCByb290Tm9kZTogTm9kZSB8IHVuZGVmaW5lZCA9IG5vZGU7XHJcblxyXG4gICAgICAgIGNvbnN0IG1vdW50ZWRSb290ID0gcHJlZmFiVXRpbHMuZ2V0TW91bnRlZFJvb3Qobm9kZSk7XHJcbiAgICAgICAgaWYgKG1vdW50ZWRSb290KSB7XHJcbiAgICAgICAgICAgIC8vIG1vdW50ZWQg55qEIHByZWZhYiDoioLngrnpnIDopoHmioogcm9vdCDorr7nva7kuLrlvZPliY0gcHJlZmFiIOeahOagueiKgueCuVxyXG4gICAgICAgICAgICByb290Tm9kZSA9IFNlcnZpY2UuRWRpdG9yLmdldFJvb3ROb2RlKCkgYXMgTm9kZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIHByaXZhdGUgbWVtYmVyIGFjY2Vzc1xyXG4gICAgICAgICAgICBpZiAobm9kZS5wYXJlbnQgJiYgbm9kZS5wYXJlbnRbJ19wcmVmYWInXSkge1xyXG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSBwcml2YXRlIG1lbWJlciBhY2Nlc3NcclxuICAgICAgICAgICAgICAgIHJvb3ROb2RlID0gbm9kZS5wYXJlbnRbJ19wcmVmYWInXS5yb290O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJvb3ROb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBjb25zdCByb290UHJlZmFiSW5mbyA9IHJvb3ROb2RlWydfcHJlZmFiJ107XHJcbiAgICAgICAgaWYgKCFyb290UHJlZmFiSW5mbykge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDmraPluLjmg4XlhrXkuIvlj6rog73lnKggUHJlZmFiSW5zdGFuY2Ug5LiK5L2/55SoIHVuV3JhcFxyXG4gICAgICAgIC8vIOWmguaenOi1hOa6kOS4ouWkse+8jOS5n+WPr+S7peino+mZpOWFs+ezu1xyXG4gICAgICAgIGlmIChwcmVmYWJJbmZvLmluc3RhbmNlIHx8ICFwcmVmYWJJbmZvLmFzc2V0KSB7XHJcbiAgICAgICAgICAgIC8vIHRoaXMucmVtb3ZlUHJlZmFiSW5zdGFuY2VBbmRDaGFuZ2VSb290KG5vZGUsIHJvb3ROb2RlLCByZW1vdmVOZXN0ZWQpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVByZWZhYkluZm9Gcm9tSW5zdGFuY2VOb2RlKG5vZGUsIHJlbW92ZU5lc3RlZCk7XHJcbiAgICAgICAgICAgIHByZWZhYlV0aWxzLmFkZFByZWZhYkluZm8obm9kZSwgcm9vdE5vZGUsIHJvb3RQcmVmYWJJbmZvLmFzc2V0KTtcclxuXHJcbiAgICAgICAgICAgIC8vIOino+WGs+WtkOiKgueCueS4reeahCBQcmVmYWJJbnN0YW5jZSDnmoQgRmlsZUlkIOWGsueqgVxyXG4gICAgICAgICAgICAvLyDlrZDoioLngrnkuK3nmoQgUHJlZmFiSW5zdGFuY2Ug55qEIEZpbGVJZCDlj6/og73lkozlvZPliY3lnLrmma/nmoTlhbblroPop6PpmaQgUHJlZmFiSW5zdGFuY2Ug55qE5a2Q6IqC54K55LitXHJcbiAgICAgICAgICAgIC8vIOeahCBQcmVmYWJJbnN0YW5jZSDnmoQgRmlsZUlkIOWGsueqge+8jOaJgOS7pemcgOimgemHjeaWsOeUn+aIkOS4gOS4qlxyXG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZVJvb3RzOiBOb2RlW10gPSBbXTtcclxuICAgICAgICAgICAgcHJlZmFiVXRpbHMuZmluZE91dG1vc3RQcmVmYWJJbnN0YW5jZU5vZGVzKG5vZGUsIGluc3RhbmNlUm9vdHMpO1xyXG4gICAgICAgICAgICBpbnN0YW5jZVJvb3RzLmZvckVhY2goKGluc3RhbmNlUm9vdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdFByZWZhYkluc3RhbmNlID0gaW5zdGFuY2VSb290Py5bJ19wcmVmYWInXT8uaW5zdGFuY2U7XHJcbiAgICAgICAgICAgICAgICBpZiAocm9vdFByZWZhYkluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm9vdFByZWZhYkluc3RhbmNlLmZpbGVJZCA9IHByZWZhYlV0aWxzLmdlbmVyYXRlVVVJRCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYlV0aWxzLmZpcmVDaGFuZ2VNc2coaW5zdGFuY2VSb290KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IG5vZGVPcGVyYXRpb24gPSBuZXcgTm9kZU9wZXJhdGlvbigpO1xyXG5cclxuZXhwb3J0IHsgbm9kZU9wZXJhdGlvbiwgSU5vZGVQcmVmYWJEYXRhLCBJQXBwbHlQcmVmYWJJbmZvIH07XHJcbiJdfQ==