"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetWatcherManager = void 0;
const cc_1 = require("cc");
const callbacks_invoker_1 = require("./callbacks-invoker");
const core_1 = require("../core");
const rpc_1 = require("../../rpc");
const ASSET_PROPS = 'A$$ETprops';
const DELIMETER = cc_1.CCClass.Attr.DELIMETER;
const ASSET_PROPS_KEY = ASSET_PROPS + DELIMETER + ASSET_PROPS;
// the asset changed listener
// 这里的回调需要完全由使用者自己维护，AssetLibrary只负责调用。
const assetListener = (cc_1.assetManager.assetListener = new callbacks_invoker_1.CallbacksInvoker());
function removeCaches(uuid) {
    if (cc_1.assetManager.assets.has(uuid)) {
        cc_1.assetManager.releaseAsset(cc_1.assetManager.assets.get(uuid));
    }
}
function getPropertyDescriptorAndOwner(obj, name) {
    while (obj) {
        const pd = Object.getOwnPropertyDescriptor(obj, name);
        if (pd) {
            return { owner: obj, pd };
        }
        obj = Object.getPrototypeOf(obj);
    }
    return null;
}
/**
 * 替换资源属性的setter，加入事件监听
 * @param ctor 构造函数
 * @param name 属性名
 */
function forceSetterNotify(ctor, name) {
    const data = getPropertyDescriptorAndOwner(ctor.prototype, name);
    if (!data) {
        console.warn('Failed to get property descriptor of %s.%s', cc_1.js.getClassName(ctor), name);
        return;
    }
    if (data.owner._modifiedSetters && data.owner._modifiedSetters.includes(name)) {
        return;
    }
    const pd = data.pd;
    if (pd.configurable === false) {
        console.warn('Failed to register notifier for %s.%s', cc_1.js.getClassName(ctor), name);
        return;
    }
    if ('value' in pd) {
        console.warn('Cannot watch instance variable of %s.%s', cc_1.js.getClassName(ctor), name);
        return;
    }
    const setter = pd.set;
    pd.set = function (value, forceRefresh) {
        // forceRefresh 如果为 true，那么哪怕资源的引用不变，也应该强制更新资源
        // @ts-ignore
        setter.call(this, value, forceRefresh);
        // this指向当前调用set的component
        // @ts-ignore
        if (this._watcherHandle) {
            // 实际保存后的值（鬼知道 setter 里面会做什么）
            // @ts-ignore
            const realUsedValue = this[name];
            const uuids = getUuidsOfPropValue(realUsedValue);
            // @ts-ignore
            this._watcherHandle.changeWatchAsset(name, uuids);
        }
    };
    Object.defineProperty(data.owner, name, pd);
    // 修改过setter后打个标记，防止重复修改setter造成多层嵌套
    if (data.owner._modifiedSetters) {
        data.owner._modifiedSetters.push(name);
    }
    else {
        data.owner._modifiedSetters = [name];
    }
}
function invokeAssetSetter(obj, propName, assetOrUrl) {
    obj = obj.deref();
    if (!obj)
        return;
    const pd = cc_1.js.getPropertyDescriptor(obj, propName);
    let newData = assetOrUrl;
    if (pd && pd.get) {
        const data = pd.get.call(obj);
        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                if (data[i] && assetOrUrl && data[i]._uuid === assetOrUrl._uuid) {
                    data[i] = assetOrUrl;
                }
            }
            newData = data;
        }
        if (pd.set) {
            const forceRefresh = true;
            try {
                // 如果是数组，需要清空该数组，防止数组内判断资源是否修改的判断阻止更新
                if (Array.isArray(data)) {
                    // @ts-ignore
                    pd.set.call(obj, new Array(newData.length).fill(null), 
                    // @ts-ignore
                    forceRefresh);
                }
            }
            catch (e) {
                console.error(e);
            }
            // @ts-ignore
            pd.set.call(obj, newData, forceRefresh);
            // 发出 asset-refresh的消息
            if (assetOrUrl._uuid) {
                core_1.ServiceEvents.emit('asset-refresh', assetOrUrl._uuid);
            }
        }
    }
    else {
        // animation graph 问题先绕过
        if (obj && obj.constructor && obj.constructor.name === 'AnimationController' && propName === 'graph') {
            obj[propName] = newData;
        }
    }
}
function getUuidsOfPropValue(val) {
    const uuids = [];
    if (Array.isArray(val)) {
        for (const data of val) {
            if (data instanceof cc_1.Asset && data._uuid) {
                uuids.push(data._uuid);
            }
        }
    }
    else if (val instanceof cc_1.Asset && val._uuid) {
        uuids.push(val._uuid);
    }
    return uuids;
}
class AssetWatcher {
    owner = null;
    watchingInfos = Object.create(null);
    constructor(owner) {
        this.owner = owner;
    }
    start() {
        const owner = this.owner;
        const ctor = owner.constructor;
        const assetPropsData = cc_1.CCClass.Attr.getClassAttrs(ctor)[ASSET_PROPS_KEY];
        for (const propPath of assetPropsData.assetProps) {
            const propName = propPath[0];
            forceSetterNotify(ctor, propName);
            const val = owner[propName];
            const uuids = getUuidsOfPropValue(val);
            this.registerListener(uuids, owner, propName);
        }
    }
    stop() {
        for (const name in this.watchingInfos) {
            if (!(name in this.watchingInfos)) {
                continue;
            }
            const info = this.watchingInfos[name];
            if (info) {
                for (const uuid of info.uuids) {
                    assetListener.off(uuid, info.callback);
                }
            }
        }
        this.watchingInfos = Object.create(null);
    }
    changeWatchAsset(propName, newUuids) {
        // unRegister old
        this.unRegisterListener(propName);
        // register new
        if (newUuids.length > 0) {
            this.registerListener(newUuids, this.owner, propName);
        }
    }
    registerListener(uuids, owner, propName) {
        this.unRegisterListener(propName);
        const onDirty = invokeAssetSetter.bind(null, new WeakRef(owner), propName);
        for (const uuid of uuids) {
            assetListener.on(uuid, onDirty);
        }
        this.watchingInfos[propName] = {
            uuids,
            callback: onDirty,
        };
    }
    unRegisterListener(propName) {
        const info = this.watchingInfos[propName];
        if (info) {
            for (const uuid of info.uuids) {
                // @ts-ignore
                assetListener.off(uuid, info.callback);
            }
            this.watchingInfos[propName] = undefined;
        }
    }
}
/**
 * 递归遍历一个ccClass，找出所有可编辑的cc.Asset属性路径
 * @param ctor ccClass的构造函数
 * @param propPath 属性路径数组
 * @param parentTypes 已经遍历过的类型，防止循环引用
 */
function parseAssetProps(ctor, propPath, parentTypes) {
    let assetProps = null;
    // const ctor = obj.constructor;
    // 防止循环引用
    const type = cc_1.js.getClassName(ctor);
    if (parentTypes.includes(type)) {
        return null;
    }
    // TODO：目前数组的元素如果是一个自定义的ccClass，此处会为空
    if (!ctor.__props__) {
        return null;
    }
    const attrs = cc_1.CCClass.Attr.getClassAttrs(ctor);
    parentTypes = parentTypes.concat(type);
    for (let i = 0, props = ctor.__props__; i < props.length; i++) {
        const propName = props[i];
        const attrKey = propName + DELIMETER;
        // 需要筛选出是引擎内可编辑的属性
        if ((attrs[attrKey + 'hasSetter'] && attrs[attrKey + 'hasGetter']) ||
            // animation graph 问题先绕过
            (ctor.name === 'AnimationController' && propName === 'graph')) {
            const propCtor = attrs[attrKey + 'ctor'];
            const isAssetType = /*propValue instanceof Asset || */ cc_1.js.isChildClassOf(propCtor, cc_1.Asset);
            const fullPath = propPath.concat(propName);
            if (isAssetType) {
                if (assetProps) {
                    assetProps.push(fullPath);
                }
                else {
                    assetProps = [fullPath];
                }
            }
            else if (cc_1.CCClass._isCCClass(propCtor)) {
                // 递归处理非asset的ccClass
                const props = parseAssetProps(propCtor, fullPath, parentTypes);
                if (props) {
                    if (assetProps) {
                        assetProps = assetProps.concat(props);
                    }
                    else {
                        assetProps = props;
                    }
                }
            }
        }
    }
    return assetProps;
}
function getAssetPropsData(obj) {
    let assetPropsData = cc_1.CCClass.Attr.getClassAttrs(obj.constructor)[ASSET_PROPS_KEY];
    if (assetPropsData === undefined) {
        const assetProps = parseAssetProps(obj.constructor, [], []);
        assetPropsData = {};
        if (assetProps) {
            for (const propPath of assetProps) {
                if (propPath.length > 1) {
                    if (assetPropsData.nestedAssetProps) {
                        assetPropsData.nestedAssetProps.push(propPath);
                    }
                    else {
                        assetPropsData.nestedAssetProps = [propPath];
                    }
                }
                else if (propPath.length === 1) {
                    if (assetPropsData.assetProps) {
                        assetPropsData.assetProps.push(propPath);
                    }
                    else {
                        assetPropsData.assetProps = [propPath];
                    }
                }
            }
        }
        cc_1.CCClass.Attr.setClassAttr(obj.constructor, ASSET_PROPS, ASSET_PROPS, assetPropsData);
    }
    return assetPropsData;
}
/**
 * 根据一个path数组，获得一个属性的值
 * @param obj 对象
 * @param propPath 路径数组
 */
function getPropObj(obj, propPath) {
    let propObj = obj;
    for (let i = 0; i < propPath.length; i++) {
        const path = propPath[i];
        if (propObj) {
            propObj = propObj[path];
        }
        if (!propObj) {
            return null;
        }
    }
    return propObj;
}
/**
 * 遍历第二级的CCAsset
 * @param obj 对象
 * @param callback 回调
 */
function walkNestedAssetProp(obj, callback) {
    const assetPropsData = getAssetPropsData(obj);
    if (assetPropsData && assetPropsData.nestedAssetProps) {
        for (const propPath of assetPropsData.nestedAssetProps) {
            const pathKeys = propPath.concat();
            const propName = pathKeys.pop();
            let owner = obj;
            if (pathKeys.length > 0) {
                owner = getPropObj(owner, pathKeys);
                if (owner) {
                    callback(owner);
                }
            }
        }
    }
}
/**
 * 更新所有引用该资源的资源
 * @param uuid
 * @param asset
 * @param processedAssets 保存处理过的资源，防止循环引用
 */
function updateAsset(uuid, asset, processedAssets = []) {
    if (cc_1.assetManager.references.has(uuid)) {
        const references = cc_1.assetManager.references.get(uuid);
        for (let i = 0, l = references.length; i < l; i++) {
            const reference = references[i];
            const owner_asset = reference[0].deref();
            const owner = reference[1].deref();
            const prop = reference[2];
            if (!owner || !owner_asset) {
                continue;
            }
            if (processedAssets.includes(owner_asset)) {
                continue;
            }
            if (!(0, cc_1.isValid)(owner_asset, true)) {
                continue;
            }
            if (owner_asset instanceof cc_1.Material && (asset instanceof cc_1.Texture2D || asset instanceof cc_1.TextureCube)) {
                owner_asset.setProperty(prop, asset);
            }
            else {
                owner[prop] = asset;
                owner_asset.onLoaded && owner_asset.onLoaded();
            }
            assetListener.emit(owner_asset._uuid, owner_asset, asset?.uuid);
            processedAssets.push(owner_asset);
            // 引用的资源修改了，需要递归调用
            updateAsset(owner_asset._uuid, owner_asset, processedAssets);
        }
    }
}
class AssetUpdater {
    lockNum = 0;
    timer = null;
    lock() {
        this.lockNum++;
        clearTimeout(this.timer);
    }
    unlock() {
        this.lockNum--;
        if (this.lockNum === 0) {
            this.timer = setTimeout(() => {
                this.update();
            }, 400);
        }
    }
    update() {
        this.queue.forEach((asset, uuid) => {
            // console.log(`更新资源 ${uuid}`);
            if (asset) {
                assetListener.emit(uuid, asset);
            }
            else {
                assetListener.emit(uuid, null);
                assetListener.off(uuid);
            }
            updateAsset(uuid, asset);
        });
        this.queue.clear();
    }
    queue = new Map();
    add(uuid, asset) {
        this.queue.set(uuid, asset);
    }
    remove(uuid) {
        this.queue.delete(uuid);
    }
}
class AssetWatcherManager {
    updater = new AssetUpdater();
    initHandle(obj) {
        const assetPropsData = getAssetPropsData(obj);
        obj._watcherHandle = assetPropsData && assetPropsData.assetProps ? new AssetWatcher(obj) : undefined;
        walkNestedAssetProp(obj, (owner) => {
            this.initHandle(owner);
        });
    }
    startWatch(obj) {
        if (!obj._watcherHandle) {
            this.initHandle(obj);
        }
        if (obj._watcherHandle) {
            obj._watcherHandle.start();
        }
        walkNestedAssetProp(obj, (owner) => {
            this.startWatch(owner);
        });
    }
    stopWatch(obj) {
        if (obj._watcherHandle) {
            obj._watcherHandle.stop();
        }
        walkNestedAssetProp(obj, (owner) => {
            this.stopWatch(owner);
        });
    }
    isTextureCubeSubImageAsset(uuid) {
        return uuid.endsWith('@74afd')
            || uuid.endsWith('@8fd34')
            || uuid.endsWith('@bb97f')
            || uuid.endsWith('@7d38f')
            || uuid.endsWith('@e9a6d')
            || uuid.endsWith('@40c10');
    }
    async onAssetChanged(uuid) {
        const info = await rpc_1.Rpc.getInstance().request('assetManager', 'queryAssetInfo', [uuid]);
        if (!info) {
            return;
        }
        // 如果是 texture，则 release 掉所依赖的 ImageAsset
        // TODO: 目前这是个 Hack 方式， 在此issue讨论：https://github.com/cocos-creator/3d-tasks/issues/4503
        if (uuid.endsWith('@6c48a')) {
            const end = uuid.indexOf('@');
            const imageAssetUuid = uuid.substring(0, end);
            removeCaches(imageAssetUuid);
        }
        // 清除textureCube依赖的imageAsset缓存，临时解决方案，相关issue：https://github.com/cocos/3d-tasks/issues/12569
        if (!assetListener.hasEventListener(uuid) && !cc_1.assetManager.references.has(uuid) && !this.isTextureCubeSubImageAsset(uuid)) {
            return;
        }
        const oldAsset = cc_1.assetManager.assets.get(uuid);
        removeCaches(uuid);
        this.updater.lock();
        // console.log(`开始加载 ${uuid} ${info?.name}`);
        cc_1.assetManager.loadAny(uuid, (err, asset) => {
            // console.log(`加载结束 ${uuid} ${info?.name}`);
            if (err) {
                this.updater.unlock();
                console.error(err);
                return;
            }
            if (oldAsset && asset && oldAsset.constructor.name !== asset.constructor.name) {
                this.updater.add(uuid, null);
                // assetListener.emit(uuid, null);
                // assetListener.off(uuid);
                // tslint:disable-next-line: max-line-length
                console.warn('The asset type has been modified, and emptied the original reference in the scene.');
            }
            else {
                this.updater.add(uuid, asset);
                // assetListener.emit(uuid, asset);
            }
            this.updater.unlock();
            // updateAsset(uuid, asset);
        });
    }
    onAssetDeleted(uuid) {
        const oldAsset = cc_1.assetManager.assets.get(uuid);
        if (oldAsset) {
            const placeHolder = new oldAsset.constructor();
            placeHolder.initDefault(uuid);
            assetListener.emit(uuid, placeHolder);
        }
        removeCaches(uuid);
    }
}
const assetWatcherManager = new AssetWatcherManager();
exports.assetWatcherManager = assetWatcherManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQtd2F0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL3NjZW5lL3NjZW5lLXByb2Nlc3Mvc2VydmljZS9hc3NldC9hc3NldC13YXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUE4RztBQUM5RywyREFBdUQ7QUFDdkQsa0NBQXdDO0FBRXhDLG1DQUFnQztBQUVoQyxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUM7QUFDakMsTUFBTSxTQUFTLEdBQUcsWUFBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDekMsTUFBTSxlQUFlLEdBQUcsV0FBVyxHQUFHLFNBQVMsR0FBRyxXQUFXLENBQUM7QUFZOUQsNkJBQTZCO0FBQzdCLHVDQUF1QztBQUN2QyxNQUFNLGFBQWEsR0FBRyxDQUFDLGlCQUFZLENBQUMsYUFBYSxHQUFHLElBQUksb0NBQWdCLEVBQUUsQ0FBQyxDQUFDO0FBRTVFLFNBQVMsWUFBWSxDQUFDLElBQVk7SUFDOUIsSUFBSSxpQkFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNoQyxpQkFBWSxDQUFDLFlBQVksQ0FBQyxpQkFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBQztJQUM5RCxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsNkJBQTZCLENBQUMsR0FBUSxFQUFFLElBQVM7SUFDdEQsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNULE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEQsSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUNMLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQzlCLENBQUM7UUFDRCxHQUFHLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFH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QyxDQUFDO1lBQ3ZHLENBQUM7aUJBQU0sQ0FBQztnQkFDSixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzlCLG1DQUFtQztZQUN2QyxDQUFDO1lBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN0Qiw0QkFBNEI7UUFDaEMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sY0FBYyxDQUFDLElBQVk7UUFDOUIsTUFBTSxRQUFRLEdBQUcsaUJBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLElBQUksUUFBUSxFQUFFLENBQUM7WUFDWCxNQUFNLFdBQVcsR0FBRyxJQUFLLFFBQVEsQ0FBQyxXQUFrQyxFQUFFLENBQUM7WUFDdkUsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QixhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBQ0QsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7Q0FDSjtBQUVELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0FBRTdDLGtEQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0LCBhc3NldE1hbmFnZXIsIENDQ2xhc3MsIENvbnN0cnVjdG9yLCBpc1ZhbGlkLCBqcywgTWF0ZXJpYWwsIFRleHR1cmUyRCwgVGV4dHVyZUN1YmUgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IENhbGxiYWNrc0ludm9rZXIgfSBmcm9tICcuL2NhbGxiYWNrcy1pbnZva2VyJztcclxuaW1wb3J0IHsgU2VydmljZUV2ZW50cyB9IGZyb20gJy4uL2NvcmUnO1xyXG5pbXBvcnQgeyBJQXNzZXRFdmVudHMgfSBmcm9tICcuLi8uLi8uLi9jb21tb24nO1xyXG5pbXBvcnQgeyBScGMgfSBmcm9tICcuLi8uLi9ycGMnO1xyXG5cclxuY29uc3QgQVNTRVRfUFJPUFMgPSAnQSQkRVRwcm9wcyc7XHJcbmNvbnN0IERFTElNRVRFUiA9IENDQ2xhc3MuQXR0ci5ERUxJTUVURVI7XHJcbmNvbnN0IEFTU0VUX1BST1BTX0tFWSA9IEFTU0VUX1BST1BTICsgREVMSU1FVEVSICsgQVNTRVRfUFJPUFM7XHJcblxyXG5kZWNsYXJlIGNsYXNzIFdlYWtSZWYge1xyXG4gICAgY29uc3RydWN0b3IgKG9iajogYW55KTtcclxufVxyXG5cclxuZGVjbGFyZSBtb2R1bGUgJ2NjJyB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIEFzc2V0TWFuYWdlciB7XHJcbiAgICAgICAgYXNzZXRMaXN0ZW5lcjogQ2FsbGJhY2tzSW52b2tlcjtcclxuICAgIH1cclxufVxyXG5cclxuLy8gdGhlIGFzc2V0IGNoYW5nZWQgbGlzdGVuZXJcclxuLy8g6L+Z6YeM55qE5Zue6LCD6ZyA6KaB5a6M5YWo55Sx5L2/55So6ICF6Ieq5bex57u05oqk77yMQXNzZXRMaWJyYXJ55Y+q6LSf6LSj6LCD55So44CCXHJcbmNvbnN0IGFzc2V0TGlzdGVuZXIgPSAoYXNzZXRNYW5hZ2VyLmFzc2V0TGlzdGVuZXIgPSBuZXcgQ2FsbGJhY2tzSW52b2tlcigpKTtcclxuXHJcbmZ1bmN0aW9uIHJlbW92ZUNhY2hlcyh1dWlkOiBzdHJpbmcpIHtcclxuICAgIGlmIChhc3NldE1hbmFnZXIuYXNzZXRzLmhhcyh1dWlkKSkge1xyXG4gICAgICAgIGFzc2V0TWFuYWdlci5yZWxlYXNlQXNzZXQoYXNzZXRNYW5hZ2VyLmFzc2V0cy5nZXQodXVpZCkhKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UHJvcGVydHlEZXNjcmlwdG9yQW5kT3duZXIob2JqOiBhbnksIG5hbWU6IGFueSkge1xyXG4gICAgd2hpbGUgKG9iaikge1xyXG4gICAgICAgIGNvbnN0IHBkID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIG5hbWUpO1xyXG4gICAgICAgIGlmIChwZCkge1xyXG4gICAgICAgICAgICByZXR1cm4geyBvd25lcjogb2JqLCBwZCB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBvYmogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG59XHJcblxyXG4vKipcclxuICog5pu/5o2i6LWE5rqQ5bGe5oCn55qEc2V0dGVy77yM5Yqg5YWl5LqL5Lu255uR5ZCsXHJcbiAqIEBwYXJhbSBjdG9yIOaehOmAoOWHveaVsFxyXG4gKiBAcGFyYW0gbmFtZSDlsZ7mgKflkI1cclxuICovXHJcbmZ1bmN0aW9uIGZvcmNlU2V0dGVyTm90aWZ5KGN0b3I6IEZ1bmN0aW9uLCBuYW1lOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IGRhdGEgPSBnZXRQcm9wZXJ0eURlc2NyaXB0b3JBbmRPd25lcihjdG9yLnByb3RvdHlwZSwgbmFtZSk7XHJcbiAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ0ZhaWxlZCB0byBnZXQgcHJvcGVydHkgZGVzY3JpcHRvciBvZiAlcy4lcycsIGpzLmdldENsYXNzTmFtZShjdG9yKSwgbmFtZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChkYXRhLm93bmVyLl9tb2RpZmllZFNldHRlcnMgJiYgZGF0YS5vd25lci5fbW9kaWZpZWRTZXR0ZXJzLmluY2x1ZGVzKG5hbWUpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgcGQgPSBkYXRhLnBkO1xyXG4gICAgaWYgKHBkLmNvbmZpZ3VyYWJsZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ0ZhaWxlZCB0byByZWdpc3RlciBub3RpZmllciBmb3IgJXMuJXMnLCBqcy5nZXRDbGFzc05hbWUoY3RvciksIG5hbWUpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICgndmFsdWUnIGluIHBkKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdDYW5ub3Qgd2F0Y2ggaW5zdGFuY2UgdmFyaWFibGUgb2YgJXMuJXMnLCBqcy5nZXRDbGFzc05hbWUoY3RvciksIG5hbWUpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZXR0ZXIgPSBwZC5zZXQ7XHJcbiAgICBwZC5zZXQgPSBmdW5jdGlvbih2YWx1ZTogYW55LCBmb3JjZVJlZnJlc2g/OiBib29sZWFuKSB7XHJcbiAgICAgICAgLy8gZm9yY2VSZWZyZXNoIOWmguaenOS4uiB0cnVl77yM6YKj5LmI5ZOq5oCV6LWE5rqQ55qE5byV55So5LiN5Y+Y77yM5Lmf5bqU6K+l5by65Yi25pu05paw6LWE5rqQXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIHNldHRlci5jYWxsKHRoaXMsIHZhbHVlLCBmb3JjZVJlZnJlc2gpO1xyXG5cclxuICAgICAgICAvLyB0aGlz5oyH5ZCR5b2T5YmN6LCD55Soc2V055qEY29tcG9uZW50XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGlmICh0aGlzLl93YXRjaGVySGFuZGxlKSB7XHJcbiAgICAgICAgICAgIC8vIOWunumZheS/neWtmOWQjueahOWAvO+8iOmsvOefpemBkyBzZXR0ZXIg6YeM6Z2i5Lya5YGa5LuA5LmI77yJXHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgY29uc3QgcmVhbFVzZWRWYWx1ZSA9IHRoaXNbbmFtZV07XHJcbiAgICAgICAgICAgIGNvbnN0IHV1aWRzID0gZ2V0VXVpZHNPZlByb3BWYWx1ZShyZWFsVXNlZFZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgdGhpcy5fd2F0Y2hlckhhbmRsZS5jaGFuZ2VXYXRjaEFzc2V0KG5hbWUsIHV1aWRzKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRhdGEub3duZXIsIG5hbWUsIHBkKTtcclxuXHJcbiAgICAvLyDkv67mlLnov4dzZXR0ZXLlkI7miZPkuKrmoIforrDvvIzpmLLmraLph43lpI3kv67mlLlzZXR0ZXLpgKDmiJDlpJrlsYLltYzlpZdcclxuICAgIGlmIChkYXRhLm93bmVyLl9tb2RpZmllZFNldHRlcnMpIHtcclxuICAgICAgICBkYXRhLm93bmVyLl9tb2RpZmllZFNldHRlcnMucHVzaChuYW1lKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZGF0YS5vd25lci5fbW9kaWZpZWRTZXR0ZXJzID0gW25hbWVdO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbnZva2VBc3NldFNldHRlcihvYmo6IGFueSwgcHJvcE5hbWU6IHN0cmluZywgYXNzZXRPclVybDogYW55KSB7XHJcbiAgICBvYmogPSBvYmouZGVyZWYoKTtcclxuICAgIGlmICghb2JqKSByZXR1cm47XHJcbiAgICBjb25zdCBwZCA9IGpzLmdldFByb3BlcnR5RGVzY3JpcHRvcihvYmosIHByb3BOYW1lKTtcclxuICAgIGxldCBuZXdEYXRhID0gYXNzZXRPclVybDtcclxuXHJcbiAgICBpZiAocGQgJiYgcGQuZ2V0KSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHBkLmdldC5jYWxsKG9iaik7XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YVtpXSAmJiBhc3NldE9yVXJsICYmIGRhdGFbaV0uX3V1aWQgPT09IGFzc2V0T3JVcmwuX3V1aWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhW2ldID0gYXNzZXRPclVybDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbmV3RGF0YSA9IGRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGQuc2V0KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZvcmNlUmVmcmVzaCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgLy8g5aaC5p6c5piv5pWw57uE77yM6ZyA6KaB5riF56m66K+l5pWw57uE77yM6Ziy5q2i5pWw57uE5YaF5Yik5pat6LWE5rqQ5piv5ZCm5L+u5pS555qE5Yik5pat6Zi75q2i5pu05pawXHJcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICBwZC5zZXQuY2FsbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgQXJyYXkobmV3RGF0YS5sZW5ndGgpLmZpbGwobnVsbCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VSZWZyZXNoLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBwZC5zZXQuY2FsbChvYmosIG5ld0RhdGEsIGZvcmNlUmVmcmVzaCk7XHJcblxyXG4gICAgICAgICAgICAvLyDlj5Hlh7ogYXNzZXQtcmVmcmVzaOeahOa2iOaBr1xyXG4gICAgICAgICAgICBpZiAoYXNzZXRPclVybC5fdXVpZCkge1xyXG4gICAgICAgICAgICAgICAgU2VydmljZUV2ZW50cy5lbWl0PElBc3NldEV2ZW50cz4oJ2Fzc2V0LXJlZnJlc2gnLCBhc3NldE9yVXJsLl91dWlkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gYW5pbWF0aW9uIGdyYXBoIOmXrumimOWFiOe7lei/h1xyXG4gICAgICAgIGlmIChvYmogJiYgb2JqLmNvbnN0cnVjdG9yICYmIG9iai5jb25zdHJ1Y3Rvci5uYW1lID09PSAnQW5pbWF0aW9uQ29udHJvbGxlcicgJiYgcHJvcE5hbWUgPT09ICdncmFwaCcpIHtcclxuICAgICAgICAgICAgb2JqW3Byb3BOYW1lXSA9IG5ld0RhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRVdWlkc09mUHJvcFZhbHVlKHZhbDogYW55KTogYW55W10ge1xyXG4gICAgY29uc3QgdXVpZHM6IGFueVtdID0gW107XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBkYXRhIG9mIHZhbCkge1xyXG4gICAgICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEFzc2V0ICYmIGRhdGEuX3V1aWQpIHtcclxuICAgICAgICAgICAgICAgIHV1aWRzLnB1c2goZGF0YS5fdXVpZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHZhbCBpbnN0YW5jZW9mIEFzc2V0ICYmIHZhbC5fdXVpZCkge1xyXG4gICAgICAgIHV1aWRzLnB1c2godmFsLl91dWlkKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdXVpZHM7XHJcbn1cclxuXHJcbmNsYXNzIEFzc2V0V2F0Y2hlciB7XHJcbiAgICBwdWJsaWMgb3duZXI6IGFueSA9IG51bGw7XHJcbiAgICBwdWJsaWMgd2F0Y2hpbmdJbmZvczogeyBbaW5kZXg6IHN0cmluZ106IGFueSB9ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihvd25lcjogYW55KSB7XHJcbiAgICAgICAgdGhpcy5vd25lciA9IG93bmVyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGFydCgpIHtcclxuICAgICAgICBjb25zdCBvd25lciA9IHRoaXMub3duZXI7XHJcbiAgICAgICAgY29uc3QgY3RvciA9IG93bmVyLmNvbnN0cnVjdG9yO1xyXG4gICAgICAgIGNvbnN0IGFzc2V0UHJvcHNEYXRhID0gQ0NDbGFzcy5BdHRyLmdldENsYXNzQXR0cnMoY3RvcilbQVNTRVRfUFJPUFNfS0VZXTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBwcm9wUGF0aCBvZiBhc3NldFByb3BzRGF0YS5hc3NldFByb3BzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3BOYW1lID0gcHJvcFBhdGhbMF07XHJcblxyXG4gICAgICAgICAgICBmb3JjZVNldHRlck5vdGlmeShjdG9yLCBwcm9wTmFtZSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB2YWwgPSBvd25lcltwcm9wTmFtZV07XHJcbiAgICAgICAgICAgIGNvbnN0IHV1aWRzID0gZ2V0VXVpZHNPZlByb3BWYWx1ZSh2YWwpO1xyXG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyTGlzdGVuZXIodXVpZHMsIG93bmVyLCBwcm9wTmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdG9wKCkge1xyXG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiB0aGlzLndhdGNoaW5nSW5mb3MpIHtcclxuICAgICAgICAgICAgaWYgKCEobmFtZSBpbiB0aGlzLndhdGNoaW5nSW5mb3MpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBpbmZvID0gdGhpcy53YXRjaGluZ0luZm9zW25hbWVdO1xyXG4gICAgICAgICAgICBpZiAoaW5mbykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB1dWlkIG9mIGluZm8udXVpZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBhc3NldExpc3RlbmVyLm9mZih1dWlkLCBpbmZvLmNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLndhdGNoaW5nSW5mb3MgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjaGFuZ2VXYXRjaEFzc2V0KHByb3BOYW1lOiBzdHJpbmcsIG5ld1V1aWRzOiBbXSkge1xyXG4gICAgICAgIC8vIHVuUmVnaXN0ZXIgb2xkXHJcbiAgICAgICAgdGhpcy51blJlZ2lzdGVyTGlzdGVuZXIocHJvcE5hbWUpO1xyXG5cclxuICAgICAgICAvLyByZWdpc3RlciBuZXdcclxuICAgICAgICBpZiAobmV3VXVpZHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyTGlzdGVuZXIobmV3VXVpZHMsIHRoaXMub3duZXIsIHByb3BOYW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWdpc3Rlckxpc3RlbmVyKHV1aWRzOiBhbnlbXSwgb3duZXI6IGFueSwgcHJvcE5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMudW5SZWdpc3Rlckxpc3RlbmVyKHByb3BOYW1lKTtcclxuXHJcbiAgICAgICAgY29uc3Qgb25EaXJ0eSA9IGludm9rZUFzc2V0U2V0dGVyLmJpbmQobnVsbCwgbmV3IFdlYWtSZWYob3duZXIpLCBwcm9wTmFtZSk7XHJcbiAgICAgICAgZm9yIChjb25zdCB1dWlkIG9mIHV1aWRzKSB7XHJcbiAgICAgICAgICAgIGFzc2V0TGlzdGVuZXIub24odXVpZCwgb25EaXJ0eSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLndhdGNoaW5nSW5mb3NbcHJvcE5hbWVdID0ge1xyXG4gICAgICAgICAgICB1dWlkcyxcclxuICAgICAgICAgICAgY2FsbGJhY2s6IG9uRGlydHksXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVuUmVnaXN0ZXJMaXN0ZW5lcihwcm9wTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgaW5mbyA9IHRoaXMud2F0Y2hpbmdJbmZvc1twcm9wTmFtZV07XHJcblxyXG4gICAgICAgIGlmIChpbmZvKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgdXVpZCBvZiBpbmZvLnV1aWRzKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICBhc3NldExpc3RlbmVyLm9mZih1dWlkLCBpbmZvLmNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy53YXRjaGluZ0luZm9zW3Byb3BOYW1lXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDpgJLlvZLpgY3ljobkuIDkuKpjY0NsYXNz77yM5om+5Ye65omA5pyJ5Y+v57yW6L6R55qEY2MuQXNzZXTlsZ7mgKfot6/lvoRcclxuICogQHBhcmFtIGN0b3IgY2NDbGFzc+eahOaehOmAoOWHveaVsFxyXG4gKiBAcGFyYW0gcHJvcFBhdGgg5bGe5oCn6Lev5b6E5pWw57uEXHJcbiAqIEBwYXJhbSBwYXJlbnRUeXBlcyDlt7Lnu4/pgY3ljobov4fnmoTnsbvlnovvvIzpmLLmraLlvqrnjq/lvJXnlKhcclxuICovXHJcbmZ1bmN0aW9uIHBhcnNlQXNzZXRQcm9wcyhjdG9yOiBhbnksIHByb3BQYXRoOiBzdHJpbmdbXSwgcGFyZW50VHlwZXM6IHN0cmluZ1tdKTogc3RyaW5nW11bXSB8IG51bGwge1xyXG4gICAgbGV0IGFzc2V0UHJvcHM6IHN0cmluZ1tdW10gfCBudWxsID0gbnVsbDtcclxuICAgIC8vIGNvbnN0IGN0b3IgPSBvYmouY29uc3RydWN0b3I7XHJcbiAgICAvLyDpmLLmraLlvqrnjq/lvJXnlKhcclxuICAgIGNvbnN0IHR5cGUgPSBqcy5nZXRDbGFzc05hbWUoY3Rvcik7XHJcbiAgICBpZiAocGFyZW50VHlwZXMuaW5jbHVkZXModHlwZSkpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RP77ya55uu5YmN5pWw57uE55qE5YWD57Sg5aaC5p6c5piv5LiA5Liq6Ieq5a6a5LmJ55qEY2NDbGFzc++8jOatpOWkhOS8muS4uuepulxyXG4gICAgaWYgKCFjdG9yLl9fcHJvcHNfXykge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGF0dHJzID0gQ0NDbGFzcy5BdHRyLmdldENsYXNzQXR0cnMoY3Rvcik7XHJcbiAgICBwYXJlbnRUeXBlcyA9IHBhcmVudFR5cGVzLmNvbmNhdCh0eXBlKTtcclxuICAgIGZvciAobGV0IGkgPSAwLCBwcm9wcyA9IGN0b3IuX19wcm9wc19fOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBwcm9wTmFtZSA9IHByb3BzW2ldO1xyXG4gICAgICAgIGNvbnN0IGF0dHJLZXkgPSBwcm9wTmFtZSArIERFTElNRVRFUjtcclxuXHJcbiAgICAgICAgLy8g6ZyA6KaB562b6YCJ5Ye65piv5byV5pOO5YaF5Y+v57yW6L6R55qE5bGe5oCnXHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAoYXR0cnNbYXR0cktleSArICdoYXNTZXR0ZXInXSAmJiBhdHRyc1thdHRyS2V5ICsgJ2hhc0dldHRlciddKSB8fFxyXG4gICAgICAgICAgICAvLyBhbmltYXRpb24gZ3JhcGgg6Zeu6aKY5YWI57uV6L+HXHJcbiAgICAgICAgICAgIChjdG9yLm5hbWUgPT09ICdBbmltYXRpb25Db250cm9sbGVyJyAmJiBwcm9wTmFtZSA9PT0gJ2dyYXBoJylcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgY29uc3QgcHJvcEN0b3IgPSBhdHRyc1thdHRyS2V5ICsgJ2N0b3InXTtcclxuICAgICAgICAgICAgY29uc3QgaXNBc3NldFR5cGUgPSAvKnByb3BWYWx1ZSBpbnN0YW5jZW9mIEFzc2V0IHx8ICovanMuaXNDaGlsZENsYXNzT2YocHJvcEN0b3IsIEFzc2V0KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcHJvcFBhdGguY29uY2F0KHByb3BOYW1lKTtcclxuICAgICAgICAgICAgaWYgKGlzQXNzZXRUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXNzZXRQcm9wcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2V0UHJvcHMucHVzaChmdWxsUGF0aCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2V0UHJvcHMgPSBbZnVsbFBhdGhdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKENDQ2xhc3MuX2lzQ0NDbGFzcyhwcm9wQ3RvcikpIHtcclxuICAgICAgICAgICAgICAgIC8vIOmAkuW9kuWkhOeQhumdnmFzc2V055qEY2NDbGFzc1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHByb3BzID0gcGFyc2VBc3NldFByb3BzKHByb3BDdG9yLCBmdWxsUGF0aCwgcGFyZW50VHlwZXMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHByb3BzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFzc2V0UHJvcHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRQcm9wcyA9IGFzc2V0UHJvcHMuY29uY2F0KHByb3BzKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldFByb3BzID0gcHJvcHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhc3NldFByb3BzO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgSUFzc2V0UHJvcHNEYXRhIHtcclxuICAgIGFzc2V0UHJvcHM/OiBzdHJpbmdbXVtdOyAvLyDlvZPliY1PYmplY3TkuK3nmoTotYTmupBcclxuICAgIG5lc3RlZEFzc2V0UHJvcHM/OiBzdHJpbmdbXVtdOyAvLyDltYzlpZflnKjlsZ7mgKfkuK3nmoTotYTmupBcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0QXNzZXRQcm9wc0RhdGEob2JqOiBhbnkpIHtcclxuICAgIGxldCBhc3NldFByb3BzRGF0YTogSUFzc2V0UHJvcHNEYXRhID0gQ0NDbGFzcy5BdHRyLmdldENsYXNzQXR0cnMob2JqLmNvbnN0cnVjdG9yKVtBU1NFVF9QUk9QU19LRVldO1xyXG4gICAgaWYgKGFzc2V0UHJvcHNEYXRhID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBjb25zdCBhc3NldFByb3BzID0gcGFyc2VBc3NldFByb3BzKG9iai5jb25zdHJ1Y3RvciwgW10sIFtdKTtcclxuICAgICAgICBhc3NldFByb3BzRGF0YSA9IHt9O1xyXG4gICAgICAgIGlmIChhc3NldFByb3BzKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgcHJvcFBhdGggb2YgYXNzZXRQcm9wcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHByb3BQYXRoLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXNzZXRQcm9wc0RhdGEubmVzdGVkQXNzZXRQcm9wcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldFByb3BzRGF0YS5uZXN0ZWRBc3NldFByb3BzLnB1c2gocHJvcFBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0UHJvcHNEYXRhLm5lc3RlZEFzc2V0UHJvcHMgPSBbcHJvcFBhdGhdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcFBhdGgubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFzc2V0UHJvcHNEYXRhLmFzc2V0UHJvcHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRQcm9wc0RhdGEuYXNzZXRQcm9wcy5wdXNoKHByb3BQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldFByb3BzRGF0YS5hc3NldFByb3BzID0gW3Byb3BQYXRoXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIENDQ2xhc3MuQXR0ci5zZXRDbGFzc0F0dHIob2JqLmNvbnN0cnVjdG9yLCBBU1NFVF9QUk9QUywgQVNTRVRfUFJPUFMsIGFzc2V0UHJvcHNEYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYXNzZXRQcm9wc0RhdGE7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmoLnmja7kuIDkuKpwYXRo5pWw57uE77yM6I635b6X5LiA5Liq5bGe5oCn55qE5YC8XHJcbiAqIEBwYXJhbSBvYmog5a+56LGhXHJcbiAqIEBwYXJhbSBwcm9wUGF0aCDot6/lvoTmlbDnu4RcclxuICovXHJcbmZ1bmN0aW9uIGdldFByb3BPYmoob2JqOiBhbnksIHByb3BQYXRoOiBzdHJpbmdbXSkge1xyXG4gICAgbGV0IHByb3BPYmogPSBvYmo7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3BQYXRoLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgcGF0aCA9IHByb3BQYXRoW2ldO1xyXG4gICAgICAgIGlmIChwcm9wT2JqKSB7XHJcbiAgICAgICAgICAgIHByb3BPYmogPSBwcm9wT2JqW3BhdGhdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFwcm9wT2JqKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcHJvcE9iajtcclxufVxyXG5cclxuLyoqXHJcbiAqIOmBjeWOhuesrOS6jOe6p+eahENDQXNzZXRcclxuICogQHBhcmFtIG9iaiDlr7nosaFcclxuICogQHBhcmFtIGNhbGxiYWNrIOWbnuiwg1xyXG4gKi9cclxuZnVuY3Rpb24gd2Fsa05lc3RlZEFzc2V0UHJvcChvYmo6IGFueSwgY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XHJcbiAgICBjb25zdCBhc3NldFByb3BzRGF0YSA9IGdldEFzc2V0UHJvcHNEYXRhKG9iaik7XHJcbiAgICBpZiAoYXNzZXRQcm9wc0RhdGEgJiYgYXNzZXRQcm9wc0RhdGEubmVzdGVkQXNzZXRQcm9wcykge1xyXG4gICAgICAgIGZvciAoY29uc3QgcHJvcFBhdGggb2YgYXNzZXRQcm9wc0RhdGEubmVzdGVkQXNzZXRQcm9wcykge1xyXG4gICAgICAgICAgICBjb25zdCBwYXRoS2V5cyA9IHByb3BQYXRoLmNvbmNhdCgpO1xyXG4gICAgICAgICAgICBjb25zdCBwcm9wTmFtZSA9IHBhdGhLZXlzLnBvcCgpO1xyXG4gICAgICAgICAgICBsZXQgb3duZXIgPSBvYmo7XHJcbiAgICAgICAgICAgIGlmIChwYXRoS2V5cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBvd25lciA9IGdldFByb3BPYmoob3duZXIsIHBhdGhLZXlzKTtcclxuICAgICAgICAgICAgICAgIGlmIChvd25lcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG93bmVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOabtOaWsOaJgOacieW8leeUqOivpei1hOa6kOeahOi1hOa6kFxyXG4gKiBAcGFyYW0gdXVpZCBcclxuICogQHBhcmFtIGFzc2V0IFxyXG4gKiBAcGFyYW0gcHJvY2Vzc2VkQXNzZXRzIOS/neWtmOWkhOeQhui/h+eahOi1hOa6kO+8jOmYsuatouW+queOr+W8leeUqFxyXG4gKi9cclxuZnVuY3Rpb24gdXBkYXRlQXNzZXQodXVpZDogc3RyaW5nLCBhc3NldDogQXNzZXQgfCBudWxsLCBwcm9jZXNzZWRBc3NldHM6IEFzc2V0W10gPSBbXSkge1xyXG4gICAgaWYgKGFzc2V0TWFuYWdlci5yZWZlcmVuY2VzIS5oYXModXVpZCkpIHtcclxuICAgICAgICBjb25zdCByZWZlcmVuY2VzID0gYXNzZXRNYW5hZ2VyLnJlZmVyZW5jZXMhLmdldCh1dWlkKSE7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSByZWZlcmVuY2VzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCByZWZlcmVuY2UgPSByZWZlcmVuY2VzW2ldO1xyXG4gICAgICAgICAgICBjb25zdCBvd25lcl9hc3NldCA9IHJlZmVyZW5jZVswXS5kZXJlZigpO1xyXG4gICAgICAgICAgICBjb25zdCBvd25lciA9IHJlZmVyZW5jZVsxXS5kZXJlZigpO1xyXG4gICAgICAgICAgICBjb25zdCBwcm9wID0gcmVmZXJlbmNlWzJdO1xyXG4gICAgICAgICAgICBpZiAoIW93bmVyIHx8ICFvd25lcl9hc3NldCkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBpZiAocHJvY2Vzc2VkQXNzZXRzLmluY2x1ZGVzKG93bmVyX2Fzc2V0KSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBpZiAoIWlzVmFsaWQob3duZXJfYXNzZXQsIHRydWUpKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGlmIChvd25lcl9hc3NldCBpbnN0YW5jZW9mIE1hdGVyaWFsICYmIChhc3NldCBpbnN0YW5jZW9mIFRleHR1cmUyRCB8fCBhc3NldCBpbnN0YW5jZW9mIFRleHR1cmVDdWJlKSkge1xyXG4gICAgICAgICAgICAgICAgb3duZXJfYXNzZXQuc2V0UHJvcGVydHkocHJvcCwgYXNzZXQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgb3duZXJbcHJvcF0gPSBhc3NldDtcclxuICAgICAgICAgICAgICAgIG93bmVyX2Fzc2V0Lm9uTG9hZGVkICYmIG93bmVyX2Fzc2V0Lm9uTG9hZGVkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXNzZXRMaXN0ZW5lci5lbWl0KG93bmVyX2Fzc2V0Ll91dWlkLCBvd25lcl9hc3NldCwgYXNzZXQ/LnV1aWQpO1xyXG4gICAgICAgICAgICBwcm9jZXNzZWRBc3NldHMucHVzaChvd25lcl9hc3NldCk7XHJcbiAgICAgICAgICAgIC8vIOW8leeUqOeahOi1hOa6kOS/ruaUueS6hu+8jOmcgOimgemAkuW9kuiwg+eUqFxyXG4gICAgICAgICAgICB1cGRhdGVBc3NldChvd25lcl9hc3NldC5fdXVpZCwgb3duZXJfYXNzZXQsIHByb2Nlc3NlZEFzc2V0cyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBBc3NldFVwZGF0ZXIge1xyXG5cclxuICAgIGxvY2tOdW0gPSAwO1xyXG4gICAgdGltZXI6IGFueSA9IG51bGw7XHJcblxyXG4gICAgbG9jaygpIHtcclxuICAgICAgICB0aGlzLmxvY2tOdW0rKztcclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lcik7XHJcbiAgICB9XHJcbiAgICB1bmxvY2soKSB7XHJcbiAgICAgICAgdGhpcy5sb2NrTnVtLS07XHJcbiAgICAgICAgaWYgKHRoaXMubG9ja051bSA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9LCA0MDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLnF1ZXVlLmZvckVhY2goKGFzc2V0LCB1dWlkKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGDmm7TmlrDotYTmupAgJHt1dWlkfWApO1xyXG4gICAgICAgICAgICBpZiAoYXNzZXQpIHtcclxuICAgICAgICAgICAgICAgIGFzc2V0TGlzdGVuZXIuZW1pdCh1dWlkLCBhc3NldCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhc3NldExpc3RlbmVyLmVtaXQodXVpZCwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICBhc3NldExpc3RlbmVyLm9mZih1dWlkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1cGRhdGVBc3NldCh1dWlkLCBhc3NldCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5xdWV1ZS5jbGVhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHF1ZXVlOiBNYXA8c3RyaW5nLCBBc3NldCB8IG51bGw+ID0gbmV3IE1hcCgpO1xyXG5cclxuICAgIGFkZCh1dWlkOiBzdHJpbmcsIGFzc2V0OiBBc3NldCB8IG51bGwpIHtcclxuICAgICAgICB0aGlzLnF1ZXVlLnNldCh1dWlkLCBhc3NldCk7XHJcbiAgICB9XHJcbiAgICByZW1vdmUodXVpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5xdWV1ZS5kZWxldGUodXVpZCk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5jbGFzcyBBc3NldFdhdGNoZXJNYW5hZ2VyIHtcclxuICAgIHVwZGF0ZXI6IEFzc2V0VXBkYXRlciA9IG5ldyBBc3NldFVwZGF0ZXIoKTtcclxuXHJcbiAgICBwdWJsaWMgaW5pdEhhbmRsZShvYmo6IGFueSkge1xyXG4gICAgICAgIGNvbnN0IGFzc2V0UHJvcHNEYXRhID0gZ2V0QXNzZXRQcm9wc0RhdGEob2JqKTtcclxuXHJcbiAgICAgICAgb2JqLl93YXRjaGVySGFuZGxlID0gYXNzZXRQcm9wc0RhdGEgJiYgYXNzZXRQcm9wc0RhdGEuYXNzZXRQcm9wcyA/IG5ldyBBc3NldFdhdGNoZXIob2JqKSA6IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgd2Fsa05lc3RlZEFzc2V0UHJvcChvYmosIChvd25lcjogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdEhhbmRsZShvd25lcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXJ0V2F0Y2gob2JqOiBhbnkpIHtcclxuICAgICAgICBpZiAoIW9iai5fd2F0Y2hlckhhbmRsZSkge1xyXG4gICAgICAgICAgICB0aGlzLmluaXRIYW5kbGUob2JqKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvYmouX3dhdGNoZXJIYW5kbGUpIHtcclxuICAgICAgICAgICAgb2JqLl93YXRjaGVySGFuZGxlLnN0YXJ0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3YWxrTmVzdGVkQXNzZXRQcm9wKG9iaiwgKG93bmVyOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zdGFydFdhdGNoKG93bmVyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RvcFdhdGNoKG9iajogYW55KSB7XHJcbiAgICAgICAgaWYgKG9iai5fd2F0Y2hlckhhbmRsZSkge1xyXG4gICAgICAgICAgICBvYmouX3dhdGNoZXJIYW5kbGUuc3RvcCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2Fsa05lc3RlZEFzc2V0UHJvcChvYmosIChvd25lcjogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcFdhdGNoKG93bmVyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBpc1RleHR1cmVDdWJlU3ViSW1hZ2VBc3NldCh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gdXVpZC5lbmRzV2l0aCgnQDc0YWZkJylcclxuICAgICAgICAgICAgfHwgdXVpZC5lbmRzV2l0aCgnQDhmZDM0JylcclxuICAgICAgICAgICAgfHwgdXVpZC5lbmRzV2l0aCgnQGJiOTdmJylcclxuICAgICAgICAgICAgfHwgdXVpZC5lbmRzV2l0aCgnQDdkMzhmJylcclxuICAgICAgICAgICAgfHwgdXVpZC5lbmRzV2l0aCgnQGU5YTZkJylcclxuICAgICAgICAgICAgfHwgdXVpZC5lbmRzV2l0aCgnQDQwYzEwJyk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgYXN5bmMgb25Bc3NldENoYW5nZWQodXVpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgaW5mbyA9IGF3YWl0IFJwYy5nZXRJbnN0YW5jZSgpLnJlcXVlc3QoJ2Fzc2V0TWFuYWdlcicsICdxdWVyeUFzc2V0SW5mbycsIFt1dWlkXSk7XHJcbiAgICAgICAgaWYgKCFpbmZvKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOWmguaenOaYryB0ZXh0dXJl77yM5YiZIHJlbGVhc2Ug5o6J5omA5L6d6LWW55qEIEltYWdlQXNzZXRcclxuICAgICAgICAvLyBUT0RPOiDnm67liY3ov5nmmK/kuKogSGFjayDmlrnlvI/vvIwg5Zyo5q2kaXNzdWXorqjorrrvvJpodHRwczovL2dpdGh1Yi5jb20vY29jb3MtY3JlYXRvci8zZC10YXNrcy9pc3N1ZXMvNDUwM1xyXG4gICAgICAgIGlmICh1dWlkLmVuZHNXaXRoKCdANmM0OGEnKSkge1xyXG4gICAgICAgICAgICBjb25zdCBlbmQgPSB1dWlkLmluZGV4T2YoJ0AnKTtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2VBc3NldFV1aWQgPSB1dWlkLnN1YnN0cmluZygwLCBlbmQpO1xyXG4gICAgICAgICAgICByZW1vdmVDYWNoZXMoaW1hZ2VBc3NldFV1aWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5riF6ZmkdGV4dHVyZUN1YmXkvp3otZbnmoRpbWFnZUFzc2V057yT5a2Y77yM5Li05pe26Kej5Yaz5pa55qGI77yM55u45YWzaXNzdWXvvJpodHRwczovL2dpdGh1Yi5jb20vY29jb3MvM2QtdGFza3MvaXNzdWVzLzEyNTY5XHJcblxyXG4gICAgICAgIGlmICghYXNzZXRMaXN0ZW5lci5oYXNFdmVudExpc3RlbmVyKHV1aWQpICYmICFhc3NldE1hbmFnZXIucmVmZXJlbmNlcyEuaGFzKHV1aWQpICYmICF0aGlzLmlzVGV4dHVyZUN1YmVTdWJJbWFnZUFzc2V0KHV1aWQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG9sZEFzc2V0ID0gYXNzZXRNYW5hZ2VyLmFzc2V0cy5nZXQodXVpZCk7XHJcbiAgICAgICAgcmVtb3ZlQ2FjaGVzKHV1aWQpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZXIubG9jaygpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGDlvIDlp4vliqDovb0gJHt1dWlkfSAke2luZm8/Lm5hbWV9YCk7XHJcbiAgICAgICAgYXNzZXRNYW5hZ2VyLmxvYWRBbnkodXVpZCwgKGVycjogYW55LCBhc3NldDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGDliqDovb3nu5PmnZ8gJHt1dWlkfSAke2luZm8/Lm5hbWV9YCk7XHJcbiAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlci51bmxvY2soKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG9sZEFzc2V0ICYmIGFzc2V0ICYmIG9sZEFzc2V0LmNvbnN0cnVjdG9yLm5hbWUgIT09IGFzc2V0LmNvbnN0cnVjdG9yLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlci5hZGQodXVpZCwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAvLyBhc3NldExpc3RlbmVyLmVtaXQodXVpZCwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAvLyBhc3NldExpc3RlbmVyLm9mZih1dWlkKTtcclxuICAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbWF4LWxpbmUtbGVuZ3RoXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1RoZSBhc3NldCB0eXBlIGhhcyBiZWVuIG1vZGlmaWVkLCBhbmQgZW1wdGllZCB0aGUgb3JpZ2luYWwgcmVmZXJlbmNlIGluIHRoZSBzY2VuZS4nKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlci5hZGQodXVpZCwgYXNzZXQpO1xyXG4gICAgICAgICAgICAgICAgLy8gYXNzZXRMaXN0ZW5lci5lbWl0KHV1aWQsIGFzc2V0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZXIudW5sb2NrKCk7XHJcbiAgICAgICAgICAgIC8vIHVwZGF0ZUFzc2V0KHV1aWQsIGFzc2V0KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25Bc3NldERlbGV0ZWQodXVpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3Qgb2xkQXNzZXQgPSBhc3NldE1hbmFnZXIuYXNzZXRzLmdldCh1dWlkKTtcclxuICAgICAgICBpZiAob2xkQXNzZXQpIHtcclxuICAgICAgICAgICAgY29uc3QgcGxhY2VIb2xkZXIgPSBuZXcgKG9sZEFzc2V0LmNvbnN0cnVjdG9yIGFzIENvbnN0cnVjdG9yPEFzc2V0PikoKTtcclxuICAgICAgICAgICAgcGxhY2VIb2xkZXIuaW5pdERlZmF1bHQodXVpZCk7XHJcbiAgICAgICAgICAgIGFzc2V0TGlzdGVuZXIuZW1pdCh1dWlkLCBwbGFjZUhvbGRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlbW92ZUNhY2hlcyh1dWlkKTtcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgYXNzZXRXYXRjaGVyTWFuYWdlciA9IG5ldyBBc3NldFdhdGNoZXJNYW5hZ2VyKCk7XHJcblxyXG5leHBvcnQgeyBhc3NldFdhdGNoZXJNYW5hZ2VyIH07XHJcbiJdfQ==