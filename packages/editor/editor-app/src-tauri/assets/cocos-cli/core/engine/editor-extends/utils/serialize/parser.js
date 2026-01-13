"use strict";
// 实现序列化的场景解析逻辑
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
exports.Parser = void 0;
exports.default = serialize;
const cc_1 = require("cc");
const cc = __importStar(require("cc"));
const utils_1 = __importDefault(require("../../../../base/utils"));
// @ts-ignore
const populate_internal_constants_1 = require("cc/editor/populate-internal-constants");
const builder_1 = __importDefault(require("./compiled/builder"));
const dynamic_builder_1 = __importDefault(require("./dynamic-builder"));
const { PersistentMask, DontSave, DontDestroy, EditorOnly } = cc_1.CCObject.Flags;
const getDefault = cc_1.CCClass.getDefault;
const Attr = cc_1.CCClass.Attr;
const EDITOR_ONLY = Attr.DELIMETER + 'editorOnly';
const DEFAULT = Attr.DELIMETER + 'default';
const FORMERLY_SERIALIZED_AS = Attr.DELIMETER + 'formerlySerializedAs';
function equalsToDefault(def, value) {
    if (typeof def === 'function') {
        try {
            def = def();
        }
        catch (e) {
            return false;
        }
    }
    if (def === value) {
        return true;
    }
    if (def && value &&
        typeof def === 'object' && typeof value === 'object' &&
        def.constructor === value.constructor) {
        if (def instanceof cc_1.ValueType) {
            if (def.equals(value)) {
                return true;
            }
        }
        else if (Array.isArray(def)) {
            return def.length === 0 && value.length === 0;
        }
        else if (def.constructor === Object) {
            return cc_1.js.isEmptyObject(def) && cc_1.js.isEmptyObject(value);
        }
    }
    return false;
}
function isSerializableClass(obj, ctor) {
    if (!ctor) {
        return false;
    }
    return cc_1.CCClass.isCCClassOrFastDefined(ctor) && !!cc_1.js.getClassId(obj, false);
}
// 是否是PrefabInstance中的节点
function isSyncPrefab(node) {
    // 1. 在PrefabInstance下的非Mounted节点
    // 2. 如果Mounted节点是一个PrefabInstance，那它也是一个syncPrefab
    // @ts-ignore member-access
    return node?._prefab?.root?._prefab?.instance && (node?._prefab?.instance || !isMountedChild(node));
}
// 用于检测当前节点是否是一个PrefabInstance中的Mounted的节点，后面可以考虑优化一下
function isMountedChild(node) {
    return !!node[cc_1.editorExtrasTag]?.mountedRoot;
}
class Parser {
    exporting;
    mustCompresseUuid;
    discardInvalid;
    dontStripDefault;
    missingClassReporter;
    missingObjectReporter;
    reserveContentsForAllSyncablePrefab;
    keepNodeUuid;
    recordAssetDepends;
    builder;
    root;
    prefabRoot;
    assetExists;
    // 为所有对象创建并缓存 IObjParsingInfo，同时防止循环引用
    parsingInfos = new Map();
    customExportingCtxCache;
    _serializationContext;
    assetDepends;
    constructor(builder, options) {
        options = options || {};
        this.exporting = !!options._exporting;
        this.mustCompresseUuid = !!options.compressUuid;
        this.discardInvalid = 'discardInvalid' in options ? !!options.discardInvalid : true;
        this.dontStripDefault = !this.exporting || ('dontStripDefault' in options ? !!options.dontStripDefault : true);
        this.missingClassReporter = options.missingClassReporter;
        this.missingObjectReporter = options.missingObjectReporter;
        this.reserveContentsForAllSyncablePrefab = !!options.reserveContentsForSyncablePrefab;
        const customArguments = {};
        customArguments[cc.Node.reserveContentsForAllSyncablePrefabTag] = this.reserveContentsForAllSyncablePrefab;
        this._serializationContext = {
            root: null,
            toCCON: options.useCCON ?? false,
            customArguments,
        };
        this.builder = builder;
        this.keepNodeUuid = !!options.keepNodeUuid;
        this.assetExists = this.missingObjectReporter && Object.create(null);
        this.customExportingCtxCache = this.exporting ? {
            _depends: [],
            dependsOn(propName, uuid) {
                if (this._compressUuid) {
                    uuid = utils_1.default.UUID.compressUUID(uuid, true);
                }
                this._depends.push(propName, uuid);
            },
            _compressUuid: this.mustCompresseUuid,
        } : null;
        if (options.recordAssetDepends) {
            this.recordAssetDepends = options.recordAssetDepends;
            this.assetDepends = new Set();
        }
    }
    parse(obj) {
        this.root = obj;
        if (obj instanceof cc.Prefab) {
            this.prefabRoot = obj.data;
            this._serializationContext.root = obj.data;
        }
        else {
            this._serializationContext.root = obj;
        }
        const rootInfo = this.parseObjField(null, null, '', obj, null);
        this.builder.setRoot(rootInfo);
        // if (obj && typeof obj === 'object' && isSerializableClass(obj, obj.constructor)) {
        // }
        // else {
        //     throw new Error(`Unknown object to serialize: ${obj}`);
        // }
        if (this.recordAssetDepends) {
            this.recordAssetDepends.push(...this.assetDepends);
        }
    }
    checkMissingAsset(asset, uuid) {
        if (this.missingObjectReporter) {
            const exists = this.assetExists[uuid];
            // TODO 这里需要判断一下 db 是否存在对应的资源
            if (!exists) {
                this.missingObjectReporter(asset);
            }
        }
    }
    // 校验是否需要序列化
    isObjRemoved(val) {
        if (val instanceof cc_1.CCObject) {
            // validate obj flags
            const objFlags = val.objFlags;
            if (this.exporting && ((objFlags & EditorOnly) ||
                (populate_internal_constants_1.SERVER_MODE))) {
                return true;
            }
            if (objFlags & DontSave) {
                if (this.discardInvalid) {
                    return true;
                }
                else {
                    // live reloading
                    if (objFlags & DontDestroy) {
                        // 目前编辑器下的 DontSave 节点往往是常驻节点（DontDestroy），这类节点不需要序列化，因为本身就不需要重新创建。
                        return true;
                    }
                }
            }
        }
        return false;
    }
    setParsedObj(ownerInfo, key, val, formerlySerializedAs) {
        if (val && typeof val === 'object') {
            let parsingInfo = this.parsingInfos.get(val);
            if (!parsingInfo && val instanceof cc_1.Asset && this.root instanceof cc_1.Asset) {
                // Double check uuids to guarantee same-uuid (with main asset loaded from DB) objects that created unexpectedly to use direct reference (non-uuid format).
                // This way, even if the uuid changes when copying, there is no fear of missing-uuid.
                if (val._uuid && val._uuid === this.root._uuid) {
                    parsingInfo = this.parsingInfos.get(this.root);
                }
            }
            if (parsingInfo) {
                this.builder.setProperty_ParsedObject(ownerInfo, key, parsingInfo, formerlySerializedAs);
                return true;
            }
        }
        return false;
    }
    // 转换为需要序列化的值
    verifyNotParsedValue(owner, key, val) {
        const type = typeof val;
        if (type === 'object') {
            if (!val) {
                return null;
            }
            if (val instanceof cc_1.CCObject) {
                if (val instanceof cc_1.Asset) {
                    const uuid = val._uuid;
                    if (uuid) {
                        this.checkMissingAsset(val, uuid);
                        return val;
                    }
                    else {
                        // 没有 uuid 的 asset 即程序创建的资源，比如一些内建的程序创建的 material，
                        // 或者是序列化的主资源，但是主资源应该已经在 setParsedObj 处理了。
                        return null;
                    }
                }
                if (this.discardInvalid) {
                    if (!val.isValid) {
                        this.missingObjectReporter?.(val);
                        return null;
                    }
                }
                else {
                    // live reloading
                    // @ts-ignore
                    if (!val.isRealValid) {
                        return null;
                    }
                }
                // validate prefab
                if (cc_1.Node && cc_1.Node.isNode(val)) {
                    // @ts-ignore member-access
                    const willBeDiscard = this.canDiscardByPrefabRoot(val) && val !== val._prefab.root;
                    if (willBeDiscard) {
                        return null;
                    }
                }
                // validate component in prefab
                if (val instanceof cc_1.Component) {
                    // component without mountedRoot info will be discard
                    const willBeDiscard = val.node && this.canDiscardByPrefabRoot(val.node) && !val[cc_1.editorExtrasTag]?.mountedRoot;
                    if (willBeDiscard) {
                        return null;
                    }
                }
            }
            return val;
        }
        else if (type !== 'function') {
            if (owner instanceof cc_1.CCObject && key === '_objFlags' && val > 0) {
                return val & PersistentMask;
            }
            return val;
        }
        else /* function*/ {
            return null;
        }
    }
    // @ts-ignore
    canDiscardByPrefabRoot(node) {
        return !(this.reserveContentsForAllSyncablePrefab || !isSyncPrefab(node) || this.prefabRoot === node);
    }
    enumerateClass(owner, ownerInfo, ccclass, customProps) {
        const attrs = Attr.getClassAttrs(ccclass);
        const props = customProps || ccclass.__values__;
        for (let p = 0; p < props.length; p++) {
            const propName = props[p];
            let val = owner[propName];
            if (this.isObjRemoved(val)) {
                continue;
            }
            if (this.exporting) {
                if (attrs[propName + EDITOR_ONLY]) {
                    // skip editor only when exporting
                    continue;
                }
                // 这里不用考虑对 PrefabInfo 的剔除，这一块在编辑器中的反序列化时已经实现了
                // var isPrefabInfo = CCNode && CCNode.isNode(obj) && propName === '_prefab';
                // if (isPrefabInfo && !isSyncPrefab(obj)) {
                //     // don't export prefab info in runtime
                //     continue;
                // }
            }
            const formerlySerializedAs = attrs[propName + FORMERLY_SERIALIZED_AS];
            if (this.setParsedObj(ownerInfo, propName, val, formerlySerializedAs)) {
                continue;
            }
            val = this.verifyNotParsedValue(owner, propName, val);
            const defaultValue = getDefault(attrs[propName + DEFAULT]);
            if (this.exporting && !this.dontStripDefault && equalsToDefault(defaultValue, val)) {
                continue;
            }
            this.parseField(owner, ownerInfo, propName, val, { formerlySerializedAs, defaultValue });
        }
        if ((cc_1.Node && owner instanceof cc_1.Node) || (cc_1.Component && owner instanceof cc_1.Component)) {
            if (this.exporting) {
                if (!this.keepNodeUuid) {
                    // @ts-ignore member-access
                    const usedInPersistRoot = (owner instanceof cc_1.Node && owner._parent instanceof cc.Scene);
                    if (!usedInPersistRoot) {
                        return;
                    }
                }
                if (this.prefabRoot) {
                    return;
                }
                // @ts-ignore member-access
                if (!this.dontStripDefault && !owner._id) {
                    return;
                }
            }
            // @ts-ignore member-access
            this.builder.setProperty_Raw(owner, ownerInfo, '_id', owner._id);
        }
    }
    // 重置 TRS 中的缩放
    // private setTrsOfSyncablePrefabRoot (obj: CCNode) {
    //     const trs = obj._trs.slice();
    //     trs[7] = trs[8] = trs[9] = 1; // reset scale.xyz
    //     if (!Parser.isDefaultTrs(trs)) {
    //         this.builder.setProperty_TypedArray(obj, '_trs', trs);
    //     }
    // }
    static isDefaultTrs(trs) {
        return trs[0] === 0 && trs[1] === 0 && trs[2] === 0 && // position.xyz
            trs[3] === 0 && trs[4] === 0 && trs[5] === 0 && trs[6] === 1 && // quat.xyzw
            trs[7] === 1 && trs[8] === 1 && trs[9] === 1; // scale.xyz
    }
    parseField(owner, ownerInfo, key, val, options) {
        const type = typeof val;
        if (type === 'object') {
            if (!val) {
                this.builder.setProperty_Raw(owner, ownerInfo, key, null, options);
                return;
            }
            if (val instanceof cc_1.Asset) {
                if (owner) {
                    let uuid = val._uuid;
                    if (this.mustCompresseUuid) {
                        uuid = utils_1.default.UUID.compressUUID(uuid, true);
                    }
                    options = options || {};
                    options.expectedType = cc_1.js.getClassId(val.constructor);
                    this.builder.setProperty_AssetUuid(owner, ownerInfo, key, uuid, options);
                    this.assetDepends?.add(uuid);
                    return;
                }
                else {
                    // continue to serialize main asset
                }
            }
            this.parseObjField(owner, ownerInfo, key, val, options);
        }
        else if (type !== 'function') {
            this.builder.setProperty_Raw(owner, ownerInfo, key, val, options);
        }
        else /* function*/ {
            this.builder.setProperty_Raw(owner, ownerInfo, key, null, options);
        }
    }
    parseObjField(owner, ownerInfo, key, val, options) {
        const ctor = val.constructor;
        if (isSerializableClass(val, ctor)) {
            const defaultSerialize = (valueInfo) => {
                let props = ctor.__values__;
                if (val._onBeforeSerialize) {
                    props = val._onBeforeSerialize(props) || props;
                }
                // DEBUG: Assert MissingScript __values__ for issue 9878
                try {
                    if (ctor === cc_1.cclegacy._MissingScript && (props.length === 0 || props[props.length - 1] !== '_$erialized')) {
                        cc.error(`The '_$erialized' prop in '${val.name}' is missing. Will force the raw data to be read.`);
                        cc.error(`    Error props: ['${props}'], raw props: ['${ctor.__values__}']. Please contact jare.`);
                        props.push('_$erialized');
                    }
                }
                catch (e) {
                    cc.warn(`Error when checking MissingScript 3, ${e}`);
                }
                if (props.length === 0) {
                    return;
                }
                if (props[props.length - 1] !== '_$erialized') {
                    this.enumerateClass(val, valueInfo, ctor, props);
                    return;
                }
                // DEBUG: Assert MissingScript data for issue 9878
                try {
                    if (!val._$erialized) {
                        cc.error(`The formerly serialized data is not found from '${val.name}'. Please check the previous error report.`);
                        return;
                    }
                }
                catch (e) {
                    cc.warn(`Error when checking MissingScript 2, ${e}`);
                }
                // 直接写入之前序列化过的数据，用于脚本丢失的情况
                const serialized = val._$erialized;
                const type = serialized.__type__;
                // If is missing script proxy, serialized as original data
                this.enumerateDict(serialized, valueInfo);
                // report warning
                if (this.missingClassReporter) {
                    this.missingClassReporter(val, type);
                }
            };
            const serializeNormalClass = () => {
                const opt = (options || {});
                const type = val._$erialized
                    ? val._$erialized.__type__
                    : cc.js.getClassId(ctor, false);
                opt.type = type;
                opt.uniquelyReferenced = cc.getSerializationMetadata(ctor)?.uniquelyReferenced;
                const valueInfo = this.builder.setProperty_Class(owner, ownerInfo, key, opt);
                this.parsingInfos.set(val, valueInfo);
                if (!val[cc.serializeTag]) {
                    defaultSerialize(valueInfo);
                    return valueInfo;
                }
                // DEBUG: Check MissingScript object for issue 9878
                try {
                    if (val instanceof cc_1.cclegacy._MissingScript) {
                        cc.error('Should not declare CustomSerializable on MissingScript. Please contact jare.');
                        defaultSerialize(valueInfo);
                        return valueInfo;
                    }
                }
                catch (e) {
                    cc.warn(`Error when checking MissingScript 1, ${e}`);
                }
                const serializationOutput = {
                    writeProperty: (propertyName, propertyValue) => {
                        if (this.isObjRemoved(propertyValue)) {
                            return;
                        }
                        else if (this.setParsedObj(valueInfo, propertyName, propertyValue, null)) {
                            return;
                        }
                        else {
                            // TODO: verifyNotParsedValue
                        }
                        this.parseField(val, valueInfo, propertyName, propertyValue, {});
                    },
                    writeThis: () => {
                        return defaultSerialize(valueInfo);
                    },
                    writeSuper: () => {
                        const superClass = cc_1.js.getSuper(ctor);
                        if (!superClass) {
                            return;
                        }
                        const superProperties = superClass.__values__;
                        if (!superProperties) {
                            return;
                        }
                        this.enumerateClass(val, valueInfo, ctor, superProperties);
                    },
                };
                val[cc.serializeTag](serializationOutput, this._serializationContext);
                return valueInfo;
            };
            if (val instanceof cc_1.ValueType) {
                const valueInfo = this.builder.setProperty_ValueType(owner, ownerInfo, key, val, options);
                // 不支持多个地方引用同一个 ValueType
                if (valueInfo) {
                    return valueInfo;
                }
            }
            // DEBUG: Check MissingScript object for issue 9878
            try {
                if (val instanceof cc_1.cclegacy._MissingScript && val._serialize) {
                    cc.error('Should not declare _serialize on MissingScript. Please contact jare.');
                    val._serialize = undefined;
                }
            }
            catch (e) {
                cc.warn(`Error when checking MissingScript 0, ${e}`);
            }
            if (!val._serialize) {
                return serializeNormalClass();
            }
            else {
                const opt = (options || {});
                opt.content = val._serialize(this.customExportingCtxCache);
                opt.type = cc.js.getClassId(ctor, false);
                const valueInfo = this.builder.setProperty_CustomizedClass(owner, ownerInfo, key, opt);
                this.parsingInfos.set(val, valueInfo);
                if (this.customExportingCtxCache) {
                    const depends = this.customExportingCtxCache._depends;
                    for (let i = 0; i < depends.length; i += 2) {
                        this.builder.setProperty_AssetUuid(val, valueInfo, depends[i], depends[i + 1], null);
                        this.assetDepends?.add(depends[i + 1]);
                    }
                    // reset customExportingCtxCache
                    depends.length = 0;
                }
                return valueInfo;
            }
        }
        else if (ArrayBuffer.isView(val)) {
            if (cc_1.Node && cc_1.Node.isNode(owner) && key === '_trs' && Parser.isDefaultTrs(val)) {
                return null;
            }
            this.builder.setProperty_TypedArray(owner, ownerInfo, key, val, options);
            // 不考虑直接序列化 TypedArray 的情况
            // 不考虑多个地方引用同一个 TypedArray
            return null;
        }
        else if (ctor && ctor !== Object && !Array.isArray(val)) {
            if (!owner) {
                throw new Error(`Unknown object to serialize: ${val}`);
            }
            // ts interface 类型的接口类，对应 c++ 的 struct，struct 被绑定后并不是 plain object
            // 因此，这里优先判断是否是 JSB 绑定对象
            if (ctor.__isJSB) {
                const valueInfo = this.builder.setProperty_Dict(owner, ownerInfo, key, options);
                this.parsingInfos.set(val, valueInfo);
                this.enumerateBindedDict(val, valueInfo);
                return valueInfo;
            }
            // Not serializable object type, such as Set/Map..., etc.
            // Use default value rather than null.
            return null;
        }
        else {
            // check circular reference for primitive objects ([], {}, etc...)
            // 对于原生 JS 类型，只做循环引用的保护，
            // 并不保证同个对象的多处引用反序列化后仍然指向同一个对象。
            // 如果有此需求，应该继承自FObject
            // var circularReferenced = this.parsingObjs.includes(val);
            // if (circularReferenced) {
            //     this.builder.markAsSharedObj(val);
            // }
            if (Array.isArray(val)) {
                const filteredArray = val.filter((x) => !this.isObjRemoved(x));
                const opt = (options || {});
                opt.writeOnlyArray = filteredArray;
                const valueInfo = this.builder.setProperty_Array(owner, ownerInfo, key, opt);
                this.parsingInfos.set(val, valueInfo);
                // enumerateArray
                for (let i = 0; i < filteredArray.length; ++i) {
                    let element = filteredArray[i];
                    if (this.setParsedObj(valueInfo, i, element, null)) {
                        continue;
                    }
                    element = this.verifyNotParsedValue(val, i, element);
                    this.parseField(val, valueInfo, i, element, null);
                }
                return valueInfo;
            }
            else {
                const valueInfo = this.builder.setProperty_Dict(owner, ownerInfo, key, options);
                this.parsingInfos.set(val, valueInfo);
                this.enumerateDict(val, valueInfo);
                return valueInfo;
            }
        }
    }
    enumerateDict(obj, objInfo) {
        for (const key in obj) {
            // eslint-disable-next-line no-prototype-builtins
            if ((obj.hasOwnProperty && !obj.hasOwnProperty(key)) ||
                (key.charCodeAt(0) === 95 && key.charCodeAt(1) === 95) // starts with __
                    && key !== '__prefab') {
                continue;
            }
            let val = obj[key];
            if (this.isObjRemoved(val)) {
                val = null;
            }
            else if (this.setParsedObj(objInfo, key, val, null)) {
                continue;
            }
            else {
                val = this.verifyNotParsedValue(obj, key, val);
            }
            this.parseField(obj, objInfo, key, val, null);
        }
    }
    enumerateBindedDict(obj, objInfo) {
        for (const key in obj) {
            // 不能用 hasOwnProperty 来判断，因为 JSB 对象的属性在 prototype 上面
            if ((key.charCodeAt(0) === 95 && key.charCodeAt(1) === 95) // starts with __
                && key !== '__prefab') {
                continue;
            }
            let val = obj[key];
            if (typeof val === 'function') {
                continue;
            }
            if (this.isObjRemoved(val)) {
                val = null;
            }
            else if (this.setParsedObj(objInfo, key, val, null)) {
                continue;
            }
            else {
                val = this.verifyNotParsedValue(obj, key, val);
            }
            this.parseField(obj, objInfo, key, val, null);
        }
    }
}
exports.Parser = Parser;
function serialize(obj, options) {
    options = options || {};
    let builder;
    if (options.builder === 'compiled') {
        options._exporting = true;
        options.useCCON = false;
        builder = new builder_1.default(options);
    }
    else {
        builder = new dynamic_builder_1.default(options);
    }
    const parser = new Parser(builder, options);
    parser.parse(obj);
    obj = null;
    return builder.dump();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvZW5naW5lL2VkaXRvci1leHRlbmRzL3V0aWxzL3NlcmlhbGl6ZS9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLGVBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW90QmYsNEJBa0JDO0FBcHVCRCwyQkFXWTtBQUNaLHVDQUF5QjtBQUN6QixtRUFBMkM7QUFDM0MsYUFBYTtBQUNiLHVGQUFvRTtBQUVwRSxpRUFBaUQ7QUFDakQsd0VBQStDO0FBTy9DLE1BQU0sRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsR0FBRyxhQUFRLENBQUMsS0FBSyxDQUFDO0FBRTdFLE1BQU0sVUFBVSxHQUFHLFlBQU8sQ0FBQyxVQUFVLENBQUM7QUFzRHRDLE1BQU0sSUFBSSxHQUFHLFlBQU8sQ0FBQyxJQUFJLENBQUM7QUFDMUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUM7QUFDbEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0MsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLHNCQUFzQixDQUFDO0FBRXZFLFNBQVMsZUFBZSxDQUFDLEdBQVEsRUFBRSxLQUFVO0lBQ3pDLElBQUksT0FBTyxHQUFHLEtBQUssVUFBVSxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDO1lBQ0QsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ1AsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztJQUNMLENBQUM7SUFDRCxJQUFJLEdBQUcsS0FBSyxLQUFLLEVBQUUsQ0FBQztRQUNoQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lB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LENBQUMsR0FBbUMsRUFBRSxPQUFpQjtJQUNwRixPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztJQUV4QixJQUFJLE9BQWdCLENBQUM7SUFDckIsSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLFVBQVUsRUFBRSxDQUFDO1FBQ2pDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQzFCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLE9BQU8sR0FBRyxJQUFJLGlCQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0MsQ0FBQztTQUNJLENBQUM7UUFDRixPQUFPLEdBQUcsSUFBSSx5QkFBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQixHQUFHLEdBQUcsSUFBSSxDQUFDO0lBRVgsT0FBTyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDMUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxyXG4vLyDlrp7njrDluo/liJfljJbnmoTlnLrmma/op6PmnpDpgLvovpFcclxuXHJcbmltcG9ydCB7XHJcbiAgICBDQ09iamVjdCxcclxuICAgIEFzc2V0IGFzIENDQXNzZXQsXHJcbiAgICBOb2RlIGFzIENDTm9kZSxcclxuICAgIENvbXBvbmVudCBhcyBDQ0NvbXBvbmVudCxcclxuICAgIFZhbHVlVHlwZSxcclxuICAgIGRlc2VyaWFsaXplLFxyXG4gICAgQ0NDbGFzcyxcclxuICAgIGpzLFxyXG4gICAgZWRpdG9yRXh0cmFzVGFnLFxyXG4gICAgY2NsZWdhY3ksXHJcbn0gZnJvbSAnY2MnO1xyXG5pbXBvcnQgKiBhcyBjYyBmcm9tICdjYyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9iYXNlL3V0aWxzJztcclxuLy8gQHRzLWlnbm9yZVxyXG5pbXBvcnQgeyBTRVJWRVJfTU9ERSB9IGZyb20gJ2NjL2VkaXRvci9wb3B1bGF0ZS1pbnRlcm5hbC1jb25zdGFudHMnO1xyXG5cclxuaW1wb3J0IENvbXBpbGVkQnVpbGRlciBmcm9tICcuL2NvbXBpbGVkL2J1aWxkZXInO1xyXG5pbXBvcnQgRHluYW1pY0J1aWxkZXIgZnJvbSAnLi9keW5hbWljLWJ1aWxkZXInO1xyXG5cclxuLy8gaW1wb3J0IGRlc2VyaWFsaXplciB0eXBlc1xyXG5pbXBvcnQgRCA9IGRlc2VyaWFsaXplLkludGVybmFsO1xyXG5pbXBvcnQgeyBCdWlsZGVyLCBJQnVpbGRlck9wdGlvbnMgfSBmcm9tICcuL2Jhc2UtYnVpbGRlcic7XHJcbnR5cGUgQW55Q0NDbGFzcyA9IEQuQW55Q0NDbGFzc187XHJcblxyXG5jb25zdCB7IFBlcnNpc3RlbnRNYXNrLCBEb250U2F2ZSwgRG9udERlc3Ryb3ksIEVkaXRvck9ubHkgfSA9IENDT2JqZWN0LkZsYWdzO1xyXG5cclxuY29uc3QgZ2V0RGVmYXVsdCA9IENDQ2xhc3MuZ2V0RGVmYXVsdDtcclxuXHJcbmludGVyZmFjZSBJUHJvcGVydHlPcHRpb25zIHtcclxuICAgIGZvcm1lcmx5U2VyaWFsaXplZEFzPzogc3RyaW5nO1xyXG4gICAgZGVmYXVsdFZhbHVlPzogYW55O1xyXG4gICAgZXhwZWN0ZWRUeXBlPzogc3RyaW5nO1xyXG59XHJcbmV4cG9ydCB0eXBlIFByb3BlcnR5T3B0aW9ucyA9IElQcm9wZXJ0eU9wdGlvbnMgfCBudWxsO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJQXJyYXlPcHRpb25zIGV4dGVuZHMgSVByb3BlcnR5T3B0aW9ucyB7XHJcbiAgICAvLyDmlbDnu4Tmi7fotJ3vvIzlj6/nlLEgYnVpbGRlciDoh6rnlLHkv67mlLnvvIzkuI3lj6/or7vlj5bph4zpnaLnmoTlgLxcclxuICAgIHdyaXRlT25seUFycmF5OiBhbnlbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJQ2xhc3NPcHRpb25zIGV4dGVuZHMgSVByb3BlcnR5T3B0aW9ucyB7XHJcbiAgICB0eXBlOiBzdHJpbmc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmraTnsbvnmoTlrp7kvovmsLjov5zlj6rkvJrooqvkuIDkuKrlnLDmlrnlvJXnlKjliLDjgIJcclxuICAgICAqL1xyXG4gICAgdW5pcXVlbHlSZWZlcmVuY2VkPzogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJQ3VzdG9tQ2xhc3NPcHRpb25zIGV4dGVuZHMgSUNsYXNzT3B0aW9ucyB7XHJcbiAgICBjb250ZW50OiBhbnk7XHJcbn1cclxuXHJcbi8vIGV4cG9ydCBpbnRlcmZhY2UgSVNlcmlhbGl6ZWREYXRhT3B0aW9ucyBleHRlbmRzIElQcm9wZXJ0eU9wdGlvbnMge1xyXG4vLyAgICAgZXhwZWN0ZWRUeXBlOiBzdHJpbmc7XHJcbi8vICAgICBmb3JtZXJseVNlcmlhbGl6ZWREYXRhOiBhbnk7XHJcbi8vIH1cclxuXHJcbi8vIOW9k+WJjeato+WcqOino+aekOeahOWvueixoeaVsOaNrue8k+WtmO+8jOWPr+S7peaYr+S7u+aEj+WAvOaIluiAheS4uuepuu+8jOeUqOS6jiBCdWlsZGVyIOe8k+WtmOWvueixoeeahOino+aekOe7k+aenO+8jOS8mOWMluino+aekOaAp+iDveOAglxyXG5leHBvcnQgaW50ZXJmYWNlIElPYmpQYXJzaW5nSW5mbyB7IH1cclxuLy8gZXhwb3J0IHR5cGUgSU9ialBhcnNpbmdJbmZvID0gT2JqZWN0IHwgbnVsbDtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVBhcnNlck9wdGlvbnMge1xyXG4gICAgLy8g5piv5ZCm5Y6L57ypIHV1aWRcclxuICAgIGNvbXByZXNzVXVpZD86IGJvb2xlYW47XHJcbiAgICBkaXNjYXJkSW52YWxpZD86IGJvb2xlYW47XHJcbiAgICBkb250U3RyaXBEZWZhdWx0PzogYm9vbGVhbjtcclxuICAgIG1pc3NpbmdDbGFzc1JlcG9ydGVyPzogYW55O1xyXG4gICAgbWlzc2luZ09iamVjdFJlcG9ydGVyPzogYW55O1xyXG4gICAgcmVzZXJ2ZUNvbnRlbnRzRm9yU3luY2FibGVQcmVmYWI/OiBib29sZWFuO1xyXG4gICAgLy8g5piv5ZCm5p6E5bu677yM5Y+W5Yaz5LqOIGJ1aWxkZXJcclxuICAgIF9leHBvcnRpbmc/OiBib29sZWFuO1xyXG4gICAgdXNlQ0NPTj86IGJvb2xlYW47XHJcbiAgICAvLyDmmK/lkKbkv53nlZnoioLngrnjgIHnu4Tku7YgdXVpZCDmlbDmja5cclxuICAgIGtlZXBOb2RlVXVpZD86IGJvb2xlYW47XHJcbiAgICAvLyDorrDlvZXkvp3otZbnmoTotYTmupAgVVVJRO+8jOaVsOaNruS8muWOu+mHje+8jOS4jeWQq+iEmuacrOS+nei1luOAguS8oOWFpeaVsOe7hOWmguaenOmdnuepuu+8jOaVsOaNruWwhuS8mui/veWKoOi/m+WOu+OAglxyXG4gICAgLy8g5rOo5oSP77ya5qC55o2u5Lyg5YWl5Y+C5pWw5aaCIGNvbXByZXNzVXVpZCwgX2V4cG9ydGluZywgcmVzZXJ2ZUNvbnRlbnRzRm9yU3luY2FibGVQcmVmYWLvvIznu5PmnpzkvJrlj5HnlJ/lr7nlupTlj5jljJbjgIJcclxuICAgIHJlY29yZEFzc2V0RGVwZW5kcz86IHN0cmluZ1tdO1xyXG59XHJcblxyXG5jb25zdCBBdHRyID0gQ0NDbGFzcy5BdHRyO1xyXG5jb25zdCBFRElUT1JfT05MWSA9IEF0dHIuREVMSU1FVEVSICsgJ2VkaXRvck9ubHknO1xyXG5jb25zdCBERUZBVUxUID0gQXR0ci5ERUxJTUVURVIgKyAnZGVmYXVsdCc7XHJcbmNvbnN0IEZPUk1FUkxZX1NFUklBTElaRURfQVMgPSBBdHRyLkRFTElNRVRFUiArICdmb3JtZXJseVNlcmlhbGl6ZWRBcyc7XHJcblxyXG5mdW5jdGlvbiBlcXVhbHNUb0RlZmF1bHQoZGVmOiBhbnksIHZhbHVlOiBhbnkpIHtcclxuICAgIGlmICh0eXBlb2YgZGVmID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZGVmID0gZGVmKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoZGVmID09PSB2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKGRlZiAmJiB2YWx1ZSAmJlxyXG4gICAgICAgIHR5cGVvZiBkZWYgPT09ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiZcclxuICAgICAgICBkZWYuY29uc3RydWN0b3IgPT09IHZhbHVlLmNvbnN0cnVjdG9yXHJcbiAgICApIHtcclxuICAgICAgICBpZiAoZGVmIGluc3RhbmNlb2YgVmFsdWVUeXBlKSB7XHJcbiAgICAgICAgICAgIGlmIChkZWYuZXF1YWxzKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShkZWYpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWYubGVuZ3RoID09PSAwICYmIHZhbHVlLmxlbmd0aCA9PT0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoZGVmLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGpzLmlzRW1wdHlPYmplY3QoZGVmKSAmJiBqcy5pc0VtcHR5T2JqZWN0KHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzU2VyaWFsaXphYmxlQ2xhc3Mob2JqOiBvYmplY3QsIGN0b3I6IGFueSk6IGN0b3IgaXMgQW55Q0NDbGFzcyB7XHJcbiAgICBpZiAoIWN0b3IpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gQ0NDbGFzcy5pc0NDQ2xhc3NPckZhc3REZWZpbmVkKGN0b3IpICYmICEhanMuZ2V0Q2xhc3NJZChvYmosIGZhbHNlKTtcclxufVxyXG5cclxuLy8g5piv5ZCm5pivUHJlZmFiSW5zdGFuY2XkuK3nmoToioLngrlcclxuZnVuY3Rpb24gaXNTeW5jUHJlZmFiKG5vZGU6IENDTm9kZSkge1xyXG4gICAgLy8gMS4g5ZyoUHJlZmFiSW5zdGFuY2XkuIvnmoTpnZ5Nb3VudGVk6IqC54K5XHJcbiAgICAvLyAyLiDlpoLmnpxNb3VudGVk6IqC54K55piv5LiA5LiqUHJlZmFiSW5zdGFuY2XvvIzpgqPlroPkuZ/mmK/kuIDkuKpzeW5jUHJlZmFiXHJcbiAgICAvLyBAdHMtaWdub3JlIG1lbWJlci1hY2Nlc3NcclxuICAgIHJldHVybiBub2RlPy5fcHJlZmFiPy5yb290Py5fcHJlZmFiPy5pbnN0YW5jZSAmJiAobm9kZT8uX3ByZWZhYj8uaW5zdGFuY2UgfHwgIWlzTW91bnRlZENoaWxkKG5vZGUpKTtcclxufVxyXG5cclxuLy8g55So5LqO5qOA5rWL5b2T5YmN6IqC54K55piv5ZCm5piv5LiA5LiqUHJlZmFiSW5zdGFuY2XkuK3nmoRNb3VudGVk55qE6IqC54K577yM5ZCO6Z2i5Y+v5Lul6ICD6JmR5LyY5YyW5LiA5LiLXHJcbmZ1bmN0aW9uIGlzTW91bnRlZENoaWxkKG5vZGU6IENDTm9kZSkge1xyXG4gICAgcmV0dXJuICEhbm9kZVtlZGl0b3JFeHRyYXNUYWddPy5tb3VudGVkUm9vdDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFBhcnNlciB7XHJcbiAgICBleHBvcnRpbmc6IGJvb2xlYW47XHJcbiAgICBtdXN0Q29tcHJlc3NlVXVpZDogYm9vbGVhbjtcclxuICAgIGRpc2NhcmRJbnZhbGlkOiBib29sZWFuO1xyXG4gICAgZG9udFN0cmlwRGVmYXVsdDogYm9vbGVhbjtcclxuICAgIG1pc3NpbmdDbGFzc1JlcG9ydGVyOiBhbnk7XHJcbiAgICBtaXNzaW5nT2JqZWN0UmVwb3J0ZXI6IGFueTtcclxuICAgIHJlc2VydmVDb250ZW50c0ZvckFsbFN5bmNhYmxlUHJlZmFiOiBib29sZWFuO1xyXG4gICAga2VlcE5vZGVVdWlkOiBib29sZWFuO1xyXG4gICAgcmVjb3JkQXNzZXREZXBlbmRzOiBJUGFyc2VyT3B0aW9uc1sncmVjb3JkQXNzZXREZXBlbmRzJ107XHJcblxyXG4gICAgcHJpdmF0ZSBidWlsZGVyOiBCdWlsZGVyO1xyXG4gICAgcHJpdmF0ZSByb290OiBvYmplY3QgfCB1bmRlZmluZWQ7XHJcbiAgICBwcml2YXRlIHByZWZhYlJvb3Q6IENDTm9kZSB8IHVuZGVmaW5lZDtcclxuICAgIHByaXZhdGUgYXNzZXRFeGlzdHM6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+O1xyXG4gICAgLy8g5Li65omA5pyJ5a+56LGh5Yib5bu65bm257yT5a2YIElPYmpQYXJzaW5nSW5mb++8jOWQjOaXtumYsuatouW+queOr+W8leeUqFxyXG4gICAgcHJpdmF0ZSBwYXJzaW5nSW5mb3MgPSBuZXcgTWFwPG9iamVjdCwgSU9ialBhcnNpbmdJbmZvPigpO1xyXG5cclxuICAgIHByaXZhdGUgY3VzdG9tRXhwb3J0aW5nQ3R4Q2FjaGU6IGFueTtcclxuICAgIHByaXZhdGUgX3NlcmlhbGl6YXRpb25Db250ZXh0OiBjYy5TZXJpYWxpemF0aW9uQ29udGV4dDtcclxuICAgIHByaXZhdGUgYXNzZXREZXBlbmRzPzogU2V0PHN0cmluZz47XHJcblxyXG4gICAgY29uc3RydWN0b3IoYnVpbGRlcjogQnVpbGRlciwgb3B0aW9uczogSVBhcnNlck9wdGlvbnMpIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuICAgICAgICB0aGlzLmV4cG9ydGluZyA9ICEhb3B0aW9ucy5fZXhwb3J0aW5nO1xyXG4gICAgICAgIHRoaXMubXVzdENvbXByZXNzZVV1aWQgPSAhIW9wdGlvbnMuY29tcHJlc3NVdWlkO1xyXG4gICAgICAgIHRoaXMuZGlzY2FyZEludmFsaWQgPSAnZGlzY2FyZEludmFsaWQnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMuZGlzY2FyZEludmFsaWQgOiB0cnVlO1xyXG4gICAgICAgIHRoaXMuZG9udFN0cmlwRGVmYXVsdCA9ICF0aGlzLmV4cG9ydGluZyB8fCAoJ2RvbnRTdHJpcERlZmF1bHQnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMuZG9udFN0cmlwRGVmYXVsdCA6IHRydWUpO1xyXG4gICAgICAgIHRoaXMubWlzc2luZ0NsYXNzUmVwb3J0ZXIgPSBvcHRpb25zLm1pc3NpbmdDbGFzc1JlcG9ydGVyO1xyXG4gICAgICAgIHRoaXMubWlzc2luZ09iamVjdFJlcG9ydGVyID0gb3B0aW9ucy5taXNzaW5nT2JqZWN0UmVwb3J0ZXI7XHJcbiAgICAgICAgdGhpcy5yZXNlcnZlQ29udGVudHNGb3JBbGxTeW5jYWJsZVByZWZhYiA9ICEhb3B0aW9ucy5yZXNlcnZlQ29udGVudHNGb3JTeW5jYWJsZVByZWZhYjtcclxuICAgICAgICBjb25zdCBjdXN0b21Bcmd1bWVudHM6IGNjLlNlcmlhbGl6YXRpb25Db250ZXh0WydjdXN0b21Bcmd1bWVudHMnXSA9IHt9O1xyXG4gICAgICAgIGN1c3RvbUFyZ3VtZW50c1tjYy5Ob2RlLnJlc2VydmVDb250ZW50c0ZvckFsbFN5bmNhYmxlUHJlZmFiVGFnIGFzIGFueV0gPSB0aGlzLnJlc2VydmVDb250ZW50c0ZvckFsbFN5bmNhYmxlUHJlZmFiO1xyXG4gICAgICAgIHRoaXMuX3NlcmlhbGl6YXRpb25Db250ZXh0ID0ge1xyXG4gICAgICAgICAgICByb290OiBudWxsLFxyXG4gICAgICAgICAgICB0b0NDT046IG9wdGlvbnMudXNlQ0NPTiA/PyBmYWxzZSxcclxuICAgICAgICAgICAgY3VzdG9tQXJndW1lbnRzLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGRlciA9IGJ1aWxkZXI7XHJcbiAgICAgICAgdGhpcy5rZWVwTm9kZVV1aWQgPSAhIW9wdGlvbnMua2VlcE5vZGVVdWlkO1xyXG4gICAgICAgIHRoaXMuYXNzZXRFeGlzdHMgPSB0aGlzLm1pc3NpbmdPYmplY3RSZXBvcnRlciAmJiBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gICAgICAgIHRoaXMuY3VzdG9tRXhwb3J0aW5nQ3R4Q2FjaGUgPSB0aGlzLmV4cG9ydGluZyA/IHtcclxuICAgICAgICAgICAgX2RlcGVuZHM6IFtdIGFzIHN0cmluZ1tdLFxyXG4gICAgICAgICAgICBkZXBlbmRzT24ocHJvcE5hbWU6IHN0cmluZywgdXVpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fY29tcHJlc3NVdWlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXVpZCA9IFV0aWxzLlVVSUQuY29tcHJlc3NVVUlEKHV1aWQsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fZGVwZW5kcy5wdXNoKHByb3BOYW1lLCB1dWlkKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgX2NvbXByZXNzVXVpZDogdGhpcy5tdXN0Q29tcHJlc3NlVXVpZCxcclxuICAgICAgICB9IDogbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMucmVjb3JkQXNzZXREZXBlbmRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVjb3JkQXNzZXREZXBlbmRzID0gb3B0aW9ucy5yZWNvcmRBc3NldERlcGVuZHM7XHJcbiAgICAgICAgICAgIHRoaXMuYXNzZXREZXBlbmRzID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlKG9iajogb2JqZWN0KSB7XHJcbiAgICAgICAgdGhpcy5yb290ID0gb2JqO1xyXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBjYy5QcmVmYWIpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmVmYWJSb290ID0gb2JqLmRhdGE7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlcmlhbGl6YXRpb25Db250ZXh0LnJvb3QgPSBvYmouZGF0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlcmlhbGl6YXRpb25Db250ZXh0LnJvb3QgPSBvYmo7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJvb3RJbmZvID0gdGhpcy5wYXJzZU9iakZpZWxkKG51bGwsIG51bGwsICcnLCBvYmosIG51bGwpO1xyXG4gICAgICAgIHRoaXMuYnVpbGRlci5zZXRSb290KHJvb3RJbmZvKTtcclxuICAgICAgICAvLyBpZiAob2JqICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIGlzU2VyaWFsaXphYmxlQ2xhc3Mob2JqLCBvYmouY29uc3RydWN0b3IpKSB7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIC8vIGVsc2Uge1xyXG4gICAgICAgIC8vICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gb2JqZWN0IHRvIHNlcmlhbGl6ZTogJHtvYmp9YCk7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5yZWNvcmRBc3NldERlcGVuZHMpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWNvcmRBc3NldERlcGVuZHMucHVzaCguLi50aGlzLmFzc2V0RGVwZW5kcyEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNoZWNrTWlzc2luZ0Fzc2V0KGFzc2V0OiBDQ0Fzc2V0LCB1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAodGhpcy5taXNzaW5nT2JqZWN0UmVwb3J0ZXIpIHtcclxuICAgICAgICAgICAgY29uc3QgZXhpc3RzID0gdGhpcy5hc3NldEV4aXN0c1t1dWlkXTtcclxuICAgICAgICAgICAgLy8gVE9ETyDov5nph4zpnIDopoHliKTmlq3kuIDkuIsgZGIg5piv5ZCm5a2Y5Zyo5a+55bqU55qE6LWE5rqQXHJcbiAgICAgICAgICAgIGlmICghZXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1pc3NpbmdPYmplY3RSZXBvcnRlcihhc3NldCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5qCh6aqM5piv5ZCm6ZyA6KaB5bqP5YiX5YyWXHJcbiAgICBwcml2YXRlIGlzT2JqUmVtb3ZlZCh2YWw6IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh2YWwgaW5zdGFuY2VvZiBDQ09iamVjdCkge1xyXG4gICAgICAgICAgICAvLyB2YWxpZGF0ZSBvYmogZmxhZ3NcclxuICAgICAgICAgICAgY29uc3Qgb2JqRmxhZ3MgPSB2YWwub2JqRmxhZ3M7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmV4cG9ydGluZyAmJiAoXHJcbiAgICAgICAgICAgICAgICAob2JqRmxhZ3MgJiBFZGl0b3JPbmx5KSB8fFxyXG4gICAgICAgICAgICAgICAgKFNFUlZFUl9NT0RFKVxyXG4gICAgICAgICAgICApKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob2JqRmxhZ3MgJiBEb250U2F2ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlzY2FyZEludmFsaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGxpdmUgcmVsb2FkaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iakZsYWdzICYgRG9udERlc3Ryb3kpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g55uu5YmN57yW6L6R5Zmo5LiL55qEIERvbnRTYXZlIOiKgueCueW+gOW+gOaYr+W4uOmpu+iKgueCue+8iERvbnREZXN0cm9577yJ77yM6L+Z57G76IqC54K55LiN6ZyA6KaB5bqP5YiX5YyW77yM5Zug5Li65pys6Lqr5bCx5LiN6ZyA6KaB6YeN5paw5Yib5bu644CCXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRQYXJzZWRPYmoob3duZXJJbmZvOiBJT2JqUGFyc2luZ0luZm8sIGtleTogc3RyaW5nIHwgbnVtYmVyLCB2YWw6IGFueSwgZm9ybWVybHlTZXJpYWxpemVkQXM6IHN0cmluZyB8IG51bGwpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJzaW5nSW5mbyA9IHRoaXMucGFyc2luZ0luZm9zLmdldCh2YWwpO1xyXG4gICAgICAgICAgICBpZiAoIXBhcnNpbmdJbmZvICYmIHZhbCBpbnN0YW5jZW9mIENDQXNzZXQgJiYgdGhpcy5yb290IGluc3RhbmNlb2YgQ0NBc3NldCkge1xyXG4gICAgICAgICAgICAgICAgLy8gRG91YmxlIGNoZWNrIHV1aWRzIHRvIGd1YXJhbnRlZSBzYW1lLXV1aWQgKHdpdGggbWFpbiBhc3NldCBsb2FkZWQgZnJvbSBEQikgb2JqZWN0cyB0aGF0IGNyZWF0ZWQgdW5leHBlY3RlZGx5IHRvIHVzZSBkaXJlY3QgcmVmZXJlbmNlIChub24tdXVpZCBmb3JtYXQpLlxyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyB3YXksIGV2ZW4gaWYgdGhlIHV1aWQgY2hhbmdlcyB3aGVuIGNvcHlpbmcsIHRoZXJlIGlzIG5vIGZlYXIgb2YgbWlzc2luZy11dWlkLlxyXG4gICAgICAgICAgICAgICAgaWYgKHZhbC5fdXVpZCAmJiB2YWwuX3V1aWQgPT09IHRoaXMucm9vdC5fdXVpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNpbmdJbmZvID0gdGhpcy5wYXJzaW5nSW5mb3MuZ2V0KHRoaXMucm9vdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcnNpbmdJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1aWxkZXIuc2V0UHJvcGVydHlfUGFyc2VkT2JqZWN0KG93bmVySW5mbywga2V5LCBwYXJzaW5nSW5mbywgZm9ybWVybHlTZXJpYWxpemVkQXMpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOi9rOaNouS4uumcgOimgeW6j+WIl+WMlueahOWAvFxyXG4gICAgcHJpdmF0ZSB2ZXJpZnlOb3RQYXJzZWRWYWx1ZShvd25lcjogYW55LCBrZXk6IHN0cmluZyB8IG51bWJlciwgdmFsOiBhbnkpOiBhbnkge1xyXG4gICAgICAgIGNvbnN0IHR5cGUgPSB0eXBlb2YgdmFsO1xyXG4gICAgICAgIGlmICh0eXBlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBpZiAoIXZhbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHZhbCBpbnN0YW5jZW9mIENDT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsIGluc3RhbmNlb2YgQ0NBc3NldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHV1aWQgPSB2YWwuX3V1aWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHV1aWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja01pc3NpbmdBc3NldCh2YWwsIHV1aWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5rKh5pyJIHV1aWQg55qEIGFzc2V0IOWNs+eoi+W6j+WIm+W7uueahOi1hOa6kO+8jOavlOWmguS4gOS6m+WGheW7uueahOeoi+W6j+WIm+W7uueahCBtYXRlcmlhbO+8jFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmiJbogIXmmK/luo/liJfljJbnmoTkuLvotYTmupDvvIzkvYbmmK/kuLvotYTmupDlupTor6Xlt7Lnu4/lnKggc2V0UGFyc2VkT2JqIOWkhOeQhuS6huOAglxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlzY2FyZEludmFsaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbC5pc1ZhbGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWlzc2luZ09iamVjdFJlcG9ydGVyPy4odmFsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbGl2ZSByZWxvYWRpbmdcclxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWwuaXNSZWFsVmFsaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHZhbGlkYXRlIHByZWZhYlxyXG4gICAgICAgICAgICAgICAgaWYgKENDTm9kZSAmJiBDQ05vZGUuaXNOb2RlKHZhbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIG1lbWJlci1hY2Nlc3NcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB3aWxsQmVEaXNjYXJkID0gdGhpcy5jYW5EaXNjYXJkQnlQcmVmYWJSb290KHZhbCkgJiYgdmFsICE9PSB2YWwuX3ByZWZhYi5yb290O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3aWxsQmVEaXNjYXJkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyB2YWxpZGF0ZSBjb21wb25lbnQgaW4gcHJlZmFiXHJcbiAgICAgICAgICAgICAgICBpZiAodmFsIGluc3RhbmNlb2YgQ0NDb21wb25lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb21wb25lbnQgd2l0aG91dCBtb3VudGVkUm9vdCBpbmZvIHdpbGwgYmUgZGlzY2FyZFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdpbGxCZURpc2NhcmQgPSB2YWwubm9kZSAmJiB0aGlzLmNhbkRpc2NhcmRCeVByZWZhYlJvb3QodmFsLm5vZGUpICYmICF2YWxbZWRpdG9yRXh0cmFzVGFnXT8ubW91bnRlZFJvb3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbGxCZURpc2NhcmQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGlmIChvd25lciBpbnN0YW5jZW9mIENDT2JqZWN0ICYmIGtleSA9PT0gJ19vYmpGbGFncycgJiYgdmFsID4gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbCAmIFBlcnNpc3RlbnRNYXNrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgLyogZnVuY3Rpb24qLyB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICBwcml2YXRlIGNhbkRpc2NhcmRCeVByZWZhYlJvb3Qobm9kZTogQ0NOb2RlKSB7XHJcbiAgICAgICAgcmV0dXJuICEodGhpcy5yZXNlcnZlQ29udGVudHNGb3JBbGxTeW5jYWJsZVByZWZhYiB8fCAhaXNTeW5jUHJlZmFiKG5vZGUpIHx8IHRoaXMucHJlZmFiUm9vdCA9PT0gbm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBlbnVtZXJhdGVDbGFzcyhvd25lcjogYW55LCBvd25lckluZm86IElPYmpQYXJzaW5nSW5mbywgY2NjbGFzczogQW55Q0NDbGFzcywgY3VzdG9tUHJvcHM/OiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGNvbnN0IGF0dHJzID0gQXR0ci5nZXRDbGFzc0F0dHJzKGNjY2xhc3MpO1xyXG4gICAgICAgIGNvbnN0IHByb3BzID0gY3VzdG9tUHJvcHMgfHwgY2NjbGFzcy5fX3ZhbHVlc19fO1xyXG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcHJvcHMubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgY29uc3QgcHJvcE5hbWUgPSBwcm9wc1twXTtcclxuICAgICAgICAgICAgbGV0IHZhbCA9IG93bmVyW3Byb3BOYW1lXTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNPYmpSZW1vdmVkKHZhbCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmV4cG9ydGluZykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGF0dHJzW3Byb3BOYW1lICsgRURJVE9SX09OTFldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gc2tpcCBlZGl0b3Igb25seSB3aGVuIGV4cG9ydGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8g6L+Z6YeM5LiN55So6ICD6JmR5a+5IFByZWZhYkluZm8g55qE5YmU6Zmk77yM6L+Z5LiA5Z2X5Zyo57yW6L6R5Zmo5Lit55qE5Y+N5bqP5YiX5YyW5pe25bey57uP5a6e546w5LqGXHJcbiAgICAgICAgICAgICAgICAvLyB2YXIgaXNQcmVmYWJJbmZvID0gQ0NOb2RlICYmIENDTm9kZS5pc05vZGUob2JqKSAmJiBwcm9wTmFtZSA9PT0gJ19wcmVmYWInO1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKGlzUHJlZmFiSW5mbyAmJiAhaXNTeW5jUHJlZmFiKG9iaikpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBkb24ndCBleHBvcnQgcHJlZmFiIGluZm8gaW4gcnVudGltZVxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBmb3JtZXJseVNlcmlhbGl6ZWRBcyA9IGF0dHJzW3Byb3BOYW1lICsgRk9STUVSTFlfU0VSSUFMSVpFRF9BU107XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldFBhcnNlZE9iaihvd25lckluZm8sIHByb3BOYW1lLCB2YWwsIGZvcm1lcmx5U2VyaWFsaXplZEFzKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhbCA9IHRoaXMudmVyaWZ5Tm90UGFyc2VkVmFsdWUob3duZXIsIHByb3BOYW1lLCB2YWwpO1xyXG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0VmFsdWUgPSBnZXREZWZhdWx0KGF0dHJzW3Byb3BOYW1lICsgREVGQVVMVF0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZXhwb3J0aW5nICYmICF0aGlzLmRvbnRTdHJpcERlZmF1bHQgJiYgZXF1YWxzVG9EZWZhdWx0KGRlZmF1bHRWYWx1ZSwgdmFsKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMucGFyc2VGaWVsZChvd25lciwgb3duZXJJbmZvLCBwcm9wTmFtZSwgdmFsLCB7IGZvcm1lcmx5U2VyaWFsaXplZEFzLCBkZWZhdWx0VmFsdWUgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKENDTm9kZSAmJiBvd25lciBpbnN0YW5jZW9mIENDTm9kZSkgfHwgKENDQ29tcG9uZW50ICYmIG93bmVyIGluc3RhbmNlb2YgQ0NDb21wb25lbnQpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmV4cG9ydGluZykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmtlZXBOb2RlVXVpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgbWVtYmVyLWFjY2Vzc1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZWRJblBlcnNpc3RSb290ID0gKG93bmVyIGluc3RhbmNlb2YgQ0NOb2RlICYmIG93bmVyLl9wYXJlbnQgaW5zdGFuY2VvZiBjYy5TY2VuZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF1c2VkSW5QZXJzaXN0Um9vdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJlZmFiUm9vdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgbWVtYmVyLWFjY2Vzc1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmRvbnRTdHJpcERlZmF1bHQgJiYgIW93bmVyLl9pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSBtZW1iZXItYWNjZXNzXHJcbiAgICAgICAgICAgIHRoaXMuYnVpbGRlci5zZXRQcm9wZXJ0eV9SYXcob3duZXIsIG93bmVySW5mbywgJ19pZCcsIG93bmVyLl9pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIOmHjee9riBUUlMg5Lit55qE57yp5pS+XHJcbiAgICAvLyBwcml2YXRlIHNldFRyc09mU3luY2FibGVQcmVmYWJSb290IChvYmo6IENDTm9kZSkge1xyXG4gICAgLy8gICAgIGNvbnN0IHRycyA9IG9iai5fdHJzLnNsaWNlKCk7XHJcbiAgICAvLyAgICAgdHJzWzddID0gdHJzWzhdID0gdHJzWzldID0gMTsgLy8gcmVzZXQgc2NhbGUueHl6XHJcbiAgICAvLyAgICAgaWYgKCFQYXJzZXIuaXNEZWZhdWx0VHJzKHRycykpIHtcclxuICAgIC8vICAgICAgICAgdGhpcy5idWlsZGVyLnNldFByb3BlcnR5X1R5cGVkQXJyYXkob2JqLCAnX3RycycsIHRycyk7XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gfVxyXG5cclxuICAgIHN0YXRpYyBpc0RlZmF1bHRUcnModHJzOiBhbnkpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdHJzWzBdID09PSAwICYmIHRyc1sxXSA9PT0gMCAmJiB0cnNbMl0gPT09IDAgJiYgLy8gcG9zaXRpb24ueHl6XHJcbiAgICAgICAgICAgIHRyc1szXSA9PT0gMCAmJiB0cnNbNF0gPT09IDAgJiYgdHJzWzVdID09PSAwICYmIHRyc1s2XSA9PT0gMSAmJiAvLyBxdWF0Lnh5endcclxuICAgICAgICAgICAgdHJzWzddID09PSAxICYmIHRyc1s4XSA9PT0gMSAmJiB0cnNbOV0gPT09IDE7IC8vIHNjYWxlLnh5elxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcGFyc2VGaWVsZChvd25lcjogb2JqZWN0LCBvd25lckluZm86IElPYmpQYXJzaW5nSW5mbywga2V5OiBzdHJpbmcgfCBudW1iZXIsIHZhbDogYW55LCBvcHRpb25zOiBQcm9wZXJ0eU9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB0eXBlID0gdHlwZW9mIHZhbDtcclxuICAgICAgICBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgaWYgKCF2YWwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVpbGRlci5zZXRQcm9wZXJ0eV9SYXcob3duZXIsIG93bmVySW5mbywga2V5LCBudWxsLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodmFsIGluc3RhbmNlb2YgQ0NBc3NldCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG93bmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHV1aWQgPSB2YWwuX3V1aWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubXVzdENvbXByZXNzZVV1aWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXVpZCA9IFV0aWxzLlVVSUQuY29tcHJlc3NVVUlEKHV1aWQsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmV4cGVjdGVkVHlwZSA9IGpzLmdldENsYXNzSWQodmFsLmNvbnN0cnVjdG9yKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1aWxkZXIuc2V0UHJvcGVydHlfQXNzZXRVdWlkKG93bmVyLCBvd25lckluZm8sIGtleSwgdXVpZCwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hc3NldERlcGVuZHM/LmFkZCh1dWlkKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb250aW51ZSB0byBzZXJpYWxpemUgbWFpbiBhc3NldFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucGFyc2VPYmpGaWVsZChvd25lciwgb3duZXJJbmZvLCBrZXksIHZhbCwgb3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGUgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhpcy5idWlsZGVyLnNldFByb3BlcnR5X1Jhdyhvd25lciwgb3duZXJJbmZvLCBrZXksIHZhbCwgb3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgLyogZnVuY3Rpb24qLyB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVpbGRlci5zZXRQcm9wZXJ0eV9SYXcob3duZXIsIG93bmVySW5mbywga2V5LCBudWxsLCBvcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDop6PmnpDlr7nosaFcclxuICAgICAqIDEuIOiwg+eUqCBidWlsZGVyIOeahCBBUEkg5aOw5piO5LiA5Liq5paw55qE44CQ56m65a+56LGh44CRXHJcbiAgICAgKiAyLiDlr7nlj6/lvJXnlKjlr7nosaHvvIzmoIforrDop6PmnpDnirbmgIHvvIzpmLLmraLlvqrnjq/op6PmnpBcclxuICAgICAqIDMuIOOAkOacgOWQjuOAkeaemuS4vuWvueixoeWMheWQq+eahOWFtuWug+WxnuaAp1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHBhcnNlT2JqRmllbGQob3duZXI6IG51bGwsIG93bmVySW5mbzogbnVsbCwga2V5OiBzdHJpbmcgfCBudW1iZXIsIHZhbDogb2JqZWN0LCBvcHRpb25zOiBudWxsKTogSU9ialBhcnNpbmdJbmZvOyAvLyBmb3Igcm9vdCBvYmplY3RcclxuICAgIHByaXZhdGUgcGFyc2VPYmpGaWVsZChvd25lcjogb2JqZWN0LCBvd25lckluZm86IElPYmpQYXJzaW5nSW5mbywga2V5OiBzdHJpbmcgfCBudW1iZXIsIHZhbDogYW55LCBvcHRpb25zOiBQcm9wZXJ0eU9wdGlvbnMpOiBJT2JqUGFyc2luZ0luZm8gfCBudWxsOyAvLyBmb3Igbm9ybWFsXHJcbiAgICBwcml2YXRlIHBhcnNlT2JqRmllbGQob3duZXI6IG9iamVjdCB8IG51bGwsIG93bmVySW5mbzogSU9ialBhcnNpbmdJbmZvIHwgbnVsbCwga2V5OiBzdHJpbmcgfCBudW1iZXIsIHZhbDogYW55LCBvcHRpb25zOiBQcm9wZXJ0eU9wdGlvbnMpOiBJT2JqUGFyc2luZ0luZm8gfCBudWxsIHtcclxuICAgICAgICBjb25zdCBjdG9yID0gdmFsLmNvbnN0cnVjdG9yO1xyXG4gICAgICAgIGlmIChpc1NlcmlhbGl6YWJsZUNsYXNzKHZhbCwgY3RvcikpIHtcclxuICAgICAgICAgICAgY29uc3QgZGVmYXVsdFNlcmlhbGl6ZSA9ICh2YWx1ZUluZm86IElPYmpQYXJzaW5nSW5mbykgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHByb3BzID0gY3Rvci5fX3ZhbHVlc19fO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbC5fb25CZWZvcmVTZXJpYWxpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wcyA9IHZhbC5fb25CZWZvcmVTZXJpYWxpemUocHJvcHMpIHx8IHByb3BzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIERFQlVHOiBBc3NlcnQgTWlzc2luZ1NjcmlwdCBfX3ZhbHVlc19fIGZvciBpc3N1ZSA5ODc4XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdG9yID09PSBjY2xlZ2FjeS5fTWlzc2luZ1NjcmlwdCAmJiAocHJvcHMubGVuZ3RoID09PSAwIHx8IHByb3BzW3Byb3BzLmxlbmd0aCAtIDFdICE9PSAnXyRlcmlhbGl6ZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYy5lcnJvcihgVGhlICdfJGVyaWFsaXplZCcgcHJvcCBpbiAnJHt2YWwubmFtZX0nIGlzIG1pc3NpbmcuIFdpbGwgZm9yY2UgdGhlIHJhdyBkYXRhIHRvIGJlIHJlYWQuYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNjLmVycm9yKGAgICAgRXJyb3IgcHJvcHM6IFsnJHtwcm9wc30nXSwgcmF3IHByb3BzOiBbJyR7Y3Rvci5fX3ZhbHVlc19ffSddLiBQbGVhc2UgY29udGFjdCBqYXJlLmApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKCdfJGVyaWFsaXplZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYy53YXJuKGBFcnJvciB3aGVuIGNoZWNraW5nIE1pc3NpbmdTY3JpcHQgMywgJHtlfWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwcm9wcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHByb3BzW3Byb3BzLmxlbmd0aCAtIDFdICE9PSAnXyRlcmlhbGl6ZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnVtZXJhdGVDbGFzcyh2YWwsIHZhbHVlSW5mbywgY3RvciwgcHJvcHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBERUJVRzogQXNzZXJ0IE1pc3NpbmdTY3JpcHQgZGF0YSBmb3IgaXNzdWUgOTg3OFxyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbC5fJGVyaWFsaXplZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYy5lcnJvcihgVGhlIGZvcm1lcmx5IHNlcmlhbGl6ZWQgZGF0YSBpcyBub3QgZm91bmQgZnJvbSAnJHt2YWwubmFtZX0nLiBQbGVhc2UgY2hlY2sgdGhlIHByZXZpb3VzIGVycm9yIHJlcG9ydC5gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYy53YXJuKGBFcnJvciB3aGVuIGNoZWNraW5nIE1pc3NpbmdTY3JpcHQgMiwgJHtlfWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIOebtOaOpeWGmeWFpeS5i+WJjeW6j+WIl+WMlui/h+eahOaVsOaNru+8jOeUqOS6juiEmuacrOS4ouWkseeahOaDheWGtVxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplZCA9IHZhbC5fJGVyaWFsaXplZDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBzZXJpYWxpemVkLl9fdHlwZV9fO1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgaXMgbWlzc2luZyBzY3JpcHQgcHJveHksIHNlcmlhbGl6ZWQgYXMgb3JpZ2luYWwgZGF0YVxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnVtZXJhdGVEaWN0KHNlcmlhbGl6ZWQsIHZhbHVlSW5mbyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gcmVwb3J0IHdhcm5pbmdcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1pc3NpbmdDbGFzc1JlcG9ydGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5taXNzaW5nQ2xhc3NSZXBvcnRlcih2YWwsIHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplTm9ybWFsQ2xhc3MgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvcHQgPSAob3B0aW9ucyB8fCB7fSkgYXMgSUNsYXNzT3B0aW9ucztcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSB2YWwuXyRlcmlhbGl6ZWRcclxuICAgICAgICAgICAgICAgICAgICA/IHZhbC5fJGVyaWFsaXplZC5fX3R5cGVfX1xyXG4gICAgICAgICAgICAgICAgICAgIDogY2MuanMuZ2V0Q2xhc3NJZChjdG9yLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICBvcHQudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgICAgICBvcHQudW5pcXVlbHlSZWZlcmVuY2VkID0gY2MuZ2V0U2VyaWFsaXphdGlvbk1ldGFkYXRhKGN0b3IpPy51bmlxdWVseVJlZmVyZW5jZWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVJbmZvID0gdGhpcy5idWlsZGVyLnNldFByb3BlcnR5X0NsYXNzKG93bmVyLCBvd25lckluZm8sIGtleSwgb3B0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2luZ0luZm9zLnNldCh2YWwsIHZhbHVlSW5mbyk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCEodmFsIGFzIFBhcnRpYWw8Y2MuQ3VzdG9tU2VyaWFsaXphYmxlPilbY2Muc2VyaWFsaXplVGFnXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRTZXJpYWxpemUodmFsdWVJbmZvKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVJbmZvO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIERFQlVHOiBDaGVjayBNaXNzaW5nU2NyaXB0IG9iamVjdCBmb3IgaXNzdWUgOTg3OFxyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodmFsIGluc3RhbmNlb2YgY2NsZWdhY3kuX01pc3NpbmdTY3JpcHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2MuZXJyb3IoJ1Nob3VsZCBub3QgZGVjbGFyZSBDdXN0b21TZXJpYWxpemFibGUgb24gTWlzc2luZ1NjcmlwdC4gUGxlYXNlIGNvbnRhY3QgamFyZS4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFNlcmlhbGl6ZSh2YWx1ZUluZm8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVJbmZvO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYy53YXJuKGBFcnJvciB3aGVuIGNoZWNraW5nIE1pc3NpbmdTY3JpcHQgMSwgJHtlfWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6YXRpb25PdXRwdXQ6IGNjLlNlcmlhbGl6YXRpb25PdXRwdXQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd3JpdGVQcm9wZXJ0eTogKHByb3BlcnR5TmFtZTogc3RyaW5nLCBwcm9wZXJ0eVZhbHVlOiB1bmtub3duKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzT2JqUmVtb3ZlZChwcm9wZXJ0eVZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2V0UGFyc2VkT2JqKHZhbHVlSW5mbywgcHJvcGVydHlOYW1lLCBwcm9wZXJ0eVZhbHVlLCBudWxsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogdmVyaWZ5Tm90UGFyc2VkVmFsdWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnNlRmllbGQodmFsLCB2YWx1ZUluZm8sIHByb3BlcnR5TmFtZSwgcHJvcGVydHlWYWx1ZSwge30pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgd3JpdGVUaGlzOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0U2VyaWFsaXplKHZhbHVlSW5mbyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB3cml0ZVN1cGVyOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1cGVyQ2xhc3MgPSBqcy5nZXRTdXBlcihjdG9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzdXBlckNsYXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VwZXJQcm9wZXJ0aWVzID0gc3VwZXJDbGFzcy5fX3ZhbHVlc19fIGFzIHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXN1cGVyUHJvcGVydGllcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW51bWVyYXRlQ2xhc3ModmFsLCB2YWx1ZUluZm8sIGN0b3IsIHN1cGVyUHJvcGVydGllcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAodmFsIGFzIGNjLkN1c3RvbVNlcmlhbGl6YWJsZSlbY2Muc2VyaWFsaXplVGFnXShzZXJpYWxpemF0aW9uT3V0cHV0LCB0aGlzLl9zZXJpYWxpemF0aW9uQ29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVJbmZvO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKHZhbCBpbnN0YW5jZW9mIFZhbHVlVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVJbmZvID0gdGhpcy5idWlsZGVyLnNldFByb3BlcnR5X1ZhbHVlVHlwZShvd25lciwgb3duZXJJbmZvLCBrZXksIHZhbCwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAvLyDkuI3mlK/mjIHlpJrkuKrlnLDmlrnlvJXnlKjlkIzkuIDkuKogVmFsdWVUeXBlXHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWVJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlSW5mbztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gREVCVUc6IENoZWNrIE1pc3NpbmdTY3JpcHQgb2JqZWN0IGZvciBpc3N1ZSA5ODc4XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsIGluc3RhbmNlb2YgY2NsZWdhY3kuX01pc3NpbmdTY3JpcHQgJiYgdmFsLl9zZXJpYWxpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYy5lcnJvcignU2hvdWxkIG5vdCBkZWNsYXJlIF9zZXJpYWxpemUgb24gTWlzc2luZ1NjcmlwdC4gUGxlYXNlIGNvbnRhY3QgamFyZS4nKTtcclxuICAgICAgICAgICAgICAgICAgICB2YWwuX3NlcmlhbGl6ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY2Mud2FybihgRXJyb3Igd2hlbiBjaGVja2luZyBNaXNzaW5nU2NyaXB0IDAsICR7ZX1gKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCF2YWwuX3NlcmlhbGl6ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6ZU5vcm1hbENsYXNzKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvcHQgPSAob3B0aW9ucyB8fCB7fSkgYXMgSUN1c3RvbUNsYXNzT3B0aW9ucztcclxuICAgICAgICAgICAgICAgIG9wdC5jb250ZW50ID0gdmFsLl9zZXJpYWxpemUodGhpcy5jdXN0b21FeHBvcnRpbmdDdHhDYWNoZSk7XHJcbiAgICAgICAgICAgICAgICBvcHQudHlwZSA9IGNjLmpzLmdldENsYXNzSWQoY3RvciwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVJbmZvID0gdGhpcy5idWlsZGVyLnNldFByb3BlcnR5X0N1c3RvbWl6ZWRDbGFzcyhvd25lciwgb3duZXJJbmZvLCBrZXksIG9wdCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNpbmdJbmZvcy5zZXQodmFsLCB2YWx1ZUluZm8pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1c3RvbUV4cG9ydGluZ0N0eENhY2hlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVwZW5kcyA9IHRoaXMuY3VzdG9tRXhwb3J0aW5nQ3R4Q2FjaGUuX2RlcGVuZHM7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXBlbmRzLmxlbmd0aDsgaSArPSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnVpbGRlci5zZXRQcm9wZXJ0eV9Bc3NldFV1aWQodmFsLCB2YWx1ZUluZm8sIGRlcGVuZHNbaV0sIGRlcGVuZHNbaSArIDFdLCBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hc3NldERlcGVuZHM/LmFkZChkZXBlbmRzW2kgKyAxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlc2V0IGN1c3RvbUV4cG9ydGluZ0N0eENhY2hlXHJcbiAgICAgICAgICAgICAgICAgICAgZGVwZW5kcy5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlSW5mbztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKSkge1xyXG4gICAgICAgICAgICBpZiAoQ0NOb2RlICYmIENDTm9kZS5pc05vZGUob3duZXIpICYmIGtleSA9PT0gJ190cnMnICYmIFBhcnNlci5pc0RlZmF1bHRUcnModmFsKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5idWlsZGVyLnNldFByb3BlcnR5X1R5cGVkQXJyYXkob3duZXIhLCBvd25lckluZm8hLCBrZXksIHZhbCwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgIC8vIOS4jeiAg+iZkeebtOaOpeW6j+WIl+WMliBUeXBlZEFycmF5IOeahOaDheWGtVxyXG4gICAgICAgICAgICAvLyDkuI3ogIPomZHlpJrkuKrlnLDmlrnlvJXnlKjlkIzkuIDkuKogVHlwZWRBcnJheVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoY3RvciAmJiBjdG9yICE9PSBPYmplY3QgJiYgIUFycmF5LmlzQXJyYXkodmFsKSkge1xyXG4gICAgICAgICAgICBpZiAoIW93bmVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gb2JqZWN0IHRvIHNlcmlhbGl6ZTogJHt2YWx9YCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHRzIGludGVyZmFjZSDnsbvlnovnmoTmjqXlj6PnsbvvvIzlr7nlupQgYysrIOeahCBzdHJ1Y3TvvIxzdHJ1Y3Qg6KKr57uR5a6a5ZCO5bm25LiN5pivIHBsYWluIG9iamVjdFxyXG4gICAgICAgICAgICAvLyDlm6DmraTvvIzov5nph4zkvJjlhYjliKTmlq3mmK/lkKbmmK8gSlNCIOe7keWumuWvueixoVxyXG4gICAgICAgICAgICBpZiAoY3Rvci5fX2lzSlNCKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZUluZm8gPSB0aGlzLmJ1aWxkZXIuc2V0UHJvcGVydHlfRGljdChvd25lciwgb3duZXJJbmZvLCBrZXksIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzaW5nSW5mb3Muc2V0KHZhbCwgdmFsdWVJbmZvKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW51bWVyYXRlQmluZGVkRGljdCh2YWwsIHZhbHVlSW5mbyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVJbmZvO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBOb3Qgc2VyaWFsaXphYmxlIG9iamVjdCB0eXBlLCBzdWNoIGFzIFNldC9NYXAuLi4sIGV0Yy5cclxuICAgICAgICAgICAgLy8gVXNlIGRlZmF1bHQgdmFsdWUgcmF0aGVyIHRoYW4gbnVsbC5cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBjaGVjayBjaXJjdWxhciByZWZlcmVuY2UgZm9yIHByaW1pdGl2ZSBvYmplY3RzIChbXSwge30sIGV0Yy4uLilcclxuICAgICAgICAgICAgLy8g5a+55LqO5Y6f55SfIEpTIOexu+Wei++8jOWPquWBmuW+queOr+W8leeUqOeahOS/neaKpO+8jFxyXG4gICAgICAgICAgICAvLyDlubbkuI3kv53or4HlkIzkuKrlr7nosaHnmoTlpJrlpITlvJXnlKjlj43luo/liJfljJblkI7ku43nhLbmjIflkJHlkIzkuIDkuKrlr7nosaHjgIJcclxuICAgICAgICAgICAgLy8g5aaC5p6c5pyJ5q2k6ZyA5rGC77yM5bqU6K+l57un5om/6IeqRk9iamVjdFxyXG4gICAgICAgICAgICAvLyB2YXIgY2lyY3VsYXJSZWZlcmVuY2VkID0gdGhpcy5wYXJzaW5nT2Jqcy5pbmNsdWRlcyh2YWwpO1xyXG4gICAgICAgICAgICAvLyBpZiAoY2lyY3VsYXJSZWZlcmVuY2VkKSB7XHJcbiAgICAgICAgICAgIC8vICAgICB0aGlzLmJ1aWxkZXIubWFya0FzU2hhcmVkT2JqKHZhbCk7XHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlsdGVyZWRBcnJheSA9IHZhbC5maWx0ZXIoKHg6IGFueSkgPT4gIXRoaXMuaXNPYmpSZW1vdmVkKHgpKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9wdCA9IChvcHRpb25zIHx8IHt9KSBhcyBJQXJyYXlPcHRpb25zO1xyXG4gICAgICAgICAgICAgICAgb3B0LndyaXRlT25seUFycmF5ID0gZmlsdGVyZWRBcnJheTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlSW5mbyA9IHRoaXMuYnVpbGRlci5zZXRQcm9wZXJ0eV9BcnJheShvd25lciwgb3duZXJJbmZvLCBrZXksIG9wdCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNpbmdJbmZvcy5zZXQodmFsLCB2YWx1ZUluZm8pO1xyXG4gICAgICAgICAgICAgICAgLy8gZW51bWVyYXRlQXJyYXlcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsdGVyZWRBcnJheS5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBlbGVtZW50ID0gZmlsdGVyZWRBcnJheVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXRQYXJzZWRPYmoodmFsdWVJbmZvLCBpLCBlbGVtZW50LCBudWxsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9IHRoaXMudmVyaWZ5Tm90UGFyc2VkVmFsdWUodmFsLCBpLCBlbGVtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnNlRmllbGQodmFsLCB2YWx1ZUluZm8sIGksIGVsZW1lbnQsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlSW5mbztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlSW5mbyA9IHRoaXMuYnVpbGRlci5zZXRQcm9wZXJ0eV9EaWN0KG93bmVyLCBvd25lckluZm8sIGtleSwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNpbmdJbmZvcy5zZXQodmFsLCB2YWx1ZUluZm8pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnVtZXJhdGVEaWN0KHZhbCwgdmFsdWVJbmZvKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZUluZm87XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBlbnVtZXJhdGVEaWN0KG9iajogYW55LCBvYmpJbmZvOiBJT2JqUGFyc2luZ0luZm8pIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcclxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xyXG4gICAgICAgICAgICBpZiAoKG9iai5oYXNPd25Qcm9wZXJ0eSAmJiAhb2JqLmhhc093blByb3BlcnR5KGtleSkpIHx8XHJcbiAgICAgICAgICAgICAgICAoa2V5LmNoYXJDb2RlQXQoMCkgPT09IDk1ICYmIGtleS5jaGFyQ29kZUF0KDEpID09PSA5NSkgLy8gc3RhcnRzIHdpdGggX19cclxuICAgICAgICAgICAgICAgICYmIGtleSAhPT0gJ19fcHJlZmFiJ1xyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCB2YWwgPSBvYmpba2V5XTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNPYmpSZW1vdmVkKHZhbCkpIHtcclxuICAgICAgICAgICAgICAgIHZhbCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5zZXRQYXJzZWRPYmoob2JqSW5mbywga2V5LCB2YWwsIG51bGwpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhbCA9IHRoaXMudmVyaWZ5Tm90UGFyc2VkVmFsdWUob2JqLCBrZXksIHZhbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wYXJzZUZpZWxkKG9iaiwgb2JqSW5mbywga2V5LCB2YWwsIG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGVudW1lcmF0ZUJpbmRlZERpY3Qob2JqOiBhbnksIG9iakluZm86IElPYmpQYXJzaW5nSW5mbykge1xyXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xyXG4gICAgICAgICAgICAvLyDkuI3og73nlKggaGFzT3duUHJvcGVydHkg5p2l5Yik5pat77yM5Zug5Li6IEpTQiDlr7nosaHnmoTlsZ7mgKflnKggcHJvdG90eXBlIOS4iumdolxyXG5cclxuICAgICAgICAgICAgaWYgKChrZXkuY2hhckNvZGVBdCgwKSA9PT0gOTUgJiYga2V5LmNoYXJDb2RlQXQoMSkgPT09IDk1KSAvLyBzdGFydHMgd2l0aCBfX1xyXG4gICAgICAgICAgICAgICAgJiYga2V5ICE9PSAnX19wcmVmYWInXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHZhbCA9IG9ialtrZXldO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzT2JqUmVtb3ZlZCh2YWwpKSB7XHJcbiAgICAgICAgICAgICAgICB2YWwgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuc2V0UGFyc2VkT2JqKG9iakluZm8sIGtleSwgdmFsLCBudWxsKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLnZlcmlmeU5vdFBhcnNlZFZhbHVlKG9iaiwga2V5LCB2YWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucGFyc2VGaWVsZChvYmosIG9iakluZm8sIGtleSwgdmFsLCBudWxsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSU9wdGlvbnMgZXh0ZW5kcyBJUGFyc2VyT3B0aW9ucywgSUJ1aWxkZXJPcHRpb25zIHsgfVxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzZXJpYWxpemUob2JqOiBFeGNsdWRlPGFueSwgbnVsbCB8IHVuZGVmaW5lZD4sIG9wdGlvbnM6IElPcHRpb25zKTogc3RyaW5nIHwgb2JqZWN0IHtcclxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG5cclxuICAgIGxldCBidWlsZGVyOiBCdWlsZGVyO1xyXG4gICAgaWYgKG9wdGlvbnMuYnVpbGRlciA9PT0gJ2NvbXBpbGVkJykge1xyXG4gICAgICAgIG9wdGlvbnMuX2V4cG9ydGluZyA9IHRydWU7XHJcbiAgICAgICAgb3B0aW9ucy51c2VDQ09OID0gZmFsc2U7XHJcbiAgICAgICAgYnVpbGRlciA9IG5ldyBDb21waWxlZEJ1aWxkZXIob3B0aW9ucyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBidWlsZGVyID0gbmV3IER5bmFtaWNCdWlsZGVyKG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIoYnVpbGRlciwgb3B0aW9ucyk7XHJcbiAgICBwYXJzZXIucGFyc2Uob2JqKTtcclxuICAgIG9iaiA9IG51bGw7XHJcblxyXG4gICAgcmV0dXJuIGJ1aWxkZXIuZHVtcCgpO1xyXG59XHJcbiJdfQ==