"use strict";
// 实现序列化的运行时数据格式
// 参考文档：https://github.com/cocos-creator/3d-tasks/tree/master/design-docs/data-structure/data-structures-serialization.md
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
exports.FORMAT_VERSION = void 0;
exports.reduceEmptyArray = reduceEmptyArray;
exports.getRootData = getRootData;
const cc_1 = require("cc");
const cc = __importStar(require("cc"));
const serialization_1 = require("cc/editor/serialization");
const types_1 = require("./types");
const create_class_mask_1 = __importDefault(require("./create-class-mask"));
// import deserializer types
var D = cc_1.deserialize.Internal;
var DataTypeID = D.DataTypeID_;
var File = D.File_;
var Refs = D.Refs_;
const base_builder_1 = require("../base-builder");
const { EMPTY_PLACEHOLDER, CUSTOM_OBJ_DATA_CLASS, CUSTOM_OBJ_DATA_CONTENT, } = cc_1.deserialize._macros;
exports.FORMAT_VERSION = 1;
// 序列化为任意值即可，反序列化时才会解析出来的对象
const INNER_OBJ_PLACEHOLDER = 0;
var RefsBuilder;
(function (RefsBuilder) {
    class Impl {
        beforeOffsetRefs = new Array();
        afterOffsetRefs = new Array();
        ctx;
        constructor(ctx) {
            this.ctx = ctx;
        }
        addRef(owner, key, target) {
            const canRefDirectly = (target.instanceIndex < owner.instanceIndex);
            if (canRefDirectly) {
                return target.instanceIndex;
            }
            const record = [NaN, key, target.instanceIndex];
            if (owner.indexed) {
                record[Refs.OWNER_OFFSET] = owner.instanceIndex;
                this.afterOffsetRefs.push(record);
                return NaN;
            }
            else {
                record[Refs.OWNER_OFFSET] = INNER_OBJ_PLACEHOLDER;
                this.beforeOffsetRefs.push(record);
                // 返回对象需要在反序列化过程中赋值给 refs 数组的索引（运行时索引会 * 3）
                return ~(this.beforeOffsetRefs.length - 1);
            }
        }
        build() {
            if (this.beforeOffsetRefs.length === 0 && this.afterOffsetRefs.length === 0) {
                return null;
            }
            const offset = this.beforeOffsetRefs.length;
            const allRefs = this.beforeOffsetRefs.concat(this.afterOffsetRefs);
            const res = new Array(allRefs.length * Refs.EACH_RECORD_LENGTH + 1);
            let i = 0;
            for (const ref of allRefs) {
                res[i++] = ref[Refs.OWNER_OFFSET];
                const key = ref[Refs.KEY_OFFSET];
                if (typeof key === 'number') {
                    res[i++] = ~key;
                }
                else {
                    this.ctx.sharedStrings.traceString(key, res, i++);
                }
                res[i++] = ref[Refs.TARGET_OFFSET];
            }
            res[i] = offset;
            return res;
        }
    }
    RefsBuilder.Impl = Impl;
})(RefsBuilder || (RefsBuilder = {}));
function reduceEmptyArray(array) {
    return (array && array.length > 0) ? array : EMPTY_PLACEHOLDER;
}
class CompiledBuilder extends base_builder_1.Builder {
    noNativeDep;
    sharedUuids = new types_1.TraceableDict();
    sharedStrings = new types_1.TraceableDict();
    refsBuilder;
    // 缓存资源使用情况
    // [item1, key1, uuid1, item2, key2, uuid2, ...]
    dependAssets = new Array();
    rootNode;
    normalNodes = new Array();
    advancedNodes = new Array();
    classNodes = new Array();
    data = new Array(File.ARRAY_LENGTH);
    constructor(options) {
        super(options);
        if (options.forceInline) {
            throw new Error('CompiledBuilder doesn\'t support `forceInline`');
        }
        this.noNativeDep = !!('noNativeDep' in options ? options.noNativeDep : true);
        this.refsBuilder = new RefsBuilder.Impl(this);
    }
    // Object Nodes，将来如有复用则会变成 InstanceRef
    setProperty_Array(owner, ownerInfo, key, options) {
        const node = new types_1.ArrayNode(options.writeOnlyArray.length);
        this.advancedNodes.push(node);
        this.setDynamicProperty(ownerInfo, key, node);
        return node;
    }
    setProperty_Dict(owner, ownerInfo, key, options) {
        const node = new types_1.DictNode();
        this.advancedNodes.push(node);
        this.setDynamicProperty(ownerInfo, key, node);
        return node;
    }
    setProperty_Class(owner, ownerInfo, key, options) {
        const node = new types_1.ClassNode(options.type);
        this.normalNodes.push(node);
        this.classNodes.push(node);
        this.setDynamicProperty(ownerInfo, key, node);
        return node;
    }
    setProperty_CustomizedClass(owner, ownerInfo, key, options) {
        const node = new types_1.CustomClassNode(options.type, options.content);
        this.advancedNodes.push(node);
        this.classNodes.push(node);
        this.setDynamicProperty(ownerInfo, key, node);
        return node;
    }
    // parsed
    setProperty_ParsedObject(ownerInfo, key, valueInfo, formerlySerializedAs) {
        ownerInfo.setDynamic(valueInfo, key);
    }
    // Static Values
    setProperty_Raw(owner, ownerInfo, key, value, options) {
        ownerInfo.setStatic(key, DataTypeID.SimpleType, value);
    }
    setProperty_ValueType(owner, ownerInfo, key, value, options) {
        if (!ownerInfo) {
            throw new Error('CompiledBulider: Not support serializing ValueType as root object.');
        }
        const data = (0, serialization_1.serializeBuiltinValueType)(value);
        if (!data) {
            // not built-in value type, just serialize as normal class
            return null;
        }
        let dataTypeID = DataTypeID.ValueType;
        if (options && options.defaultValue instanceof cc.ValueType) {
            dataTypeID = DataTypeID.ValueTypeCreated;
        }
        ownerInfo.setStatic(key, dataTypeID, data);
        return data;
    }
    setProperty_TypedArray(owner, ownerInfo, key, value, options) {
        if (!(owner instanceof cc.Node) || key !== '_trs') {
            throw new Error('Not support to serialize TypedArray yet. Can only use TypedArray in TRS.');
        }
        if (value.length !== 10) {
            throw new Error(`TRS ${value} should contains 10 elements.`);
        }
        const data = Array.from(value);
        ownerInfo.setStatic(key, DataTypeID.TRS, data);
    }
    setProperty_AssetUuid(owner, ownerInfo, key, uuid, options) {
        // 先缓存到 dependAssets，最后 ownerItem 如做为嵌套对象将改成 AssetRefByInnerObj
        const ownerNode = ownerInfo;
        this.dependAssets.push(ownerNode, key, uuid);
        if (ownerNode instanceof types_1.CustomClassNode) {
            ownerNode.shouldBeIndexed = true;
        }
    }
    setRoot(objInfo) {
        this.rootNode = objInfo;
    }
    // markAsSharedObj (obj: any): void {}
    setDynamicProperty(ownerInfo, key, node) {
        ownerInfo && ownerInfo.setDynamic(node, key);
    }
    collectInstances() {
        this.normalNodes = this.normalNodes.filter((x) => x.refCount > 1);
        this.normalNodes.sort(types_1.Node.compareByRefCount);
        this.advancedNodes = this.advancedNodes.filter((x) => x.shouldBeIndexed || x.refCount > 1);
        this.advancedNodes.sort(types_1.Node.compareByRefCount);
        const rootNode = this.rootNode;
        if (rootNode instanceof types_1.ClassNode) {
            // root is normal
            const rootIndex = this.normalNodes.indexOf(rootNode);
            if (rootIndex !== -1) {
                this.normalNodes.splice(rootIndex, 1);
            }
            else {
                // root.refCount <= 1
            }
            this.normalNodes.unshift(rootNode);
        }
        else {
            // root is advanced
            // @ts-ignore
            const rootIndex = this.advancedNodes.indexOf(rootNode);
            if (rootIndex === -1) {
                // root.refCount <= 1
                this.advancedNodes.length;
                // @ts-ignore
                this.advancedNodes.push(rootNode);
            }
        }
        const normalCount = this.normalNodes.length;
        for (let i = 0; i < normalCount; ++i) {
            const obj = this.normalNodes[i];
            obj.instanceIndex = i;
            obj.indexed = true;
        }
        for (let i = 0; i < this.advancedNodes.length; ++i) {
            const obj = this.advancedNodes[i];
            obj.instanceIndex = normalCount + i;
            obj.indexed = true;
        }
        // TODO - 数组尽量特化为 Array_InstanceRef 以加快反序列化性能（但是又会增加索引数量及索引类型）
        // TODO - 分析引用关系，让相互引用的对象尽量同时反序列化，提升内存命中率。
        // TODO - 分析引用关系，让被依赖的对象尽量提前序列化，减少 refs 数据量的开销（多生成 owner、key 的索引），以及设置内嵌对象实例到 owner 的开销
    }
    // 生成 Instances
    dumpInstances() {
        const objCount = this.normalNodes.length + this.advancedNodes.length;
        const instances = new Array(objCount);
        const normalCount = this.normalNodes.length;
        for (let i = 0; i < normalCount; ++i) {
            const obj = this.normalNodes[i];
            instances[i] = obj.dumpRecursively(this.refsBuilder);
        }
        for (let i = 0; i < this.advancedNodes.length; ++i) {
            const obj = this.advancedNodes[i];
            const dumped = obj.dumpRecursively(this.refsBuilder);
            if (obj instanceof types_1.CustomClassNode) {
                instances[normalCount + i] = dumped[CUSTOM_OBJ_DATA_CONTENT];
            }
            else {
                instances[normalCount + i] = dumped;
            }
        }
        if (this.rootNode.instanceIndex !== 0 ||
            typeof instances[instances.length - 1] === 'number' || // 防止最后一个数字被错当 rootInfo
            !this.noNativeDep) {
            const rootIndex = this.rootNode.instanceIndex;
            instances.push(this.noNativeDep ? rootIndex : ~rootIndex);
        }
        this.data[File.Instances] = instances;
    }
    // 生成 InstanceTypes
    dumpInstanceTypes() {
        const instanceTypes = this.advancedNodes.map((x) => {
            if (x instanceof types_1.CustomClassNode) {
                return x.dumped[CUSTOM_OBJ_DATA_CLASS];
            }
            else {
                return ~x.selfType;
            }
        });
        this.data[File.InstanceTypes] = reduceEmptyArray(instanceTypes);
    }
    dumpDependUuids() {
        const innerDepends = {
            owners: new Array(),
            keys: new Array(),
            uuids: new Array(),
        };
        const indexedDepends = {
            owners: new Array(),
            keys: new Array(),
            uuids: new Array(),
        };
        const array = this.dependAssets;
        for (let i = 0; i < array.length; i += 3) {
            const owner = array[i];
            let key = array[i + 1];
            const uuid = array[i + 2];
            let depends;
            if (owner.indexed) {
                depends = indexedDepends;
                owner.setAssetRefPlaceholderOnIndexed(key);
                depends.owners.push(owner.instanceIndex);
            }
            else {
                depends = innerDepends;
                owner.setStatic(key, DataTypeID.AssetRefByInnerObj, depends.owners.length);
                depends.owners.push(INNER_OBJ_PLACEHOLDER);
            }
            if (typeof key === 'number') {
                key = ~key;
            }
            depends.keys.push(key);
            depends.uuids.push(uuid);
        }
        this.data[File.DependObjs] = innerDepends.owners.concat(indexedDepends.owners);
        const allKeys = this.data[File.DependKeys] = innerDepends.keys.concat(indexedDepends.keys);
        for (let i = 0; i < allKeys.length; ++i) {
            const key = allKeys[i];
            if (typeof key === 'string') {
                this.sharedStrings.traceString(key, allKeys, i);
            }
        }
        const allUuids = this.data[File.DependUuidIndices] = innerDepends.uuids.concat(indexedDepends.uuids);
        for (let i = 0; i < allUuids.length; ++i) {
            const uuid = allUuids[i];
            this.sharedUuids.traceString(uuid, allUuids, i);
        }
    }
    finalizeJsonPart() {
        // 1. 遍历所有对象，将 root 和所有引用数超过 1 的对象放到 instances 中，同时将数据转换成引用
        // （如果已经在 instances 中则跳过）
        this.collectInstances();
        // 2. 生成资源依赖关系
        this.dumpDependUuids();
        // 3. 生成所有对象数据
        this.dumpInstances();
        this.data[File.Version] = exports.FORMAT_VERSION;
        // data[File.SharedUuids] = this.dependSharedUuids.dump();
        // data[File.SharedStrings] = this.sharedStrings.dump();
        // 4. 生成 SharedClasses 和 SharedMasks
        const { sharedClasses, sharedMasks } = (0, create_class_mask_1.default)(this.classNodes);
        this.data[File.SharedClasses] = sharedClasses;
        this.data[File.SharedMasks] = reduceEmptyArray(sharedMasks);
        // 5. 写入 instance 对象类型
        this.dumpInstanceTypes();
        this.data[File.Refs] = this.refsBuilder.build() || EMPTY_PLACEHOLDER;
        const strings = this.sharedStrings.dump();
        this.data[File.SharedStrings] = reduceEmptyArray(strings);
        const uuids = this.sharedUuids.dump();
        this.data[File.SharedUuids] = reduceEmptyArray(uuids);
        return this.data;
    }
}
exports.default = CompiledBuilder;
function getRootData(data) {
    const instances = data[File.Instances];
    if (Array.isArray(instances)) {
        const rootInfo = instances[instances.length - 1];
        if (typeof rootInfo === 'number') {
            return instances[rootInfo >= 0 ? rootInfo : ~rootInfo];
        }
        else {
            return instances[0];
        }
    }
    else {
        return instances;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2VuZ2luZS9lZGl0b3ItZXh0ZW5kcy91dGlscy9zZXJpYWxpemUvY29tcGlsZWQvYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsZ0JBQWdCO0FBQ2hCLHlIQUF5SDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0h6SCw0Q0FFQztBQThTRCxrQ0FjQztBQTlhRCwyQkFHWTtBQUNaLHVDQUF5QjtBQUN6QiwyREFFaUM7QUFFakMsbUNBQTZHO0FBUTdHLDRFQUE4QztBQUU5Qyw0QkFBNEI7QUFDNUIsSUFBTyxDQUFDLEdBQUcsZ0JBQVcsQ0FBQyxRQUFRLENBQUM7QUFFaEMsSUFBTyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQztBQUNsQyxJQUFPLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBTXRCLElBQU8sSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDdEIsa0RBQTJEO0FBSTNELE1BQU0sRUFDRixpQkFBaUIsRUFDakIscUJBQXFCLEVBQ3JCLHVCQUF1QixHQUMxQixHQUFHLGdCQUFXLENBQUMsT0FBTyxDQUFDO0FBRVgsUUFBQSxjQUFjLEdBQUcsQ0FBQyxDQUFDO0FBRWhDLDJCQUEyQjtBQUMzQixNQUFNLHFCQUFxQixHQUFHLENBQUMsQ0FBQztBQUVoQyxJQUFVLFdBQVcsQ0FpRXBCO0FBakVELFdBQVUsV0FBVztJQVdqQixNQUFhLElBQUk7UUFDTCxnQkFBZ0IsR0FBRyxJQUFJLEtBQUssRUFBYSxDQUFDO1FBQzFDLGVBQWUsR0FBRyxJQUFJLEtBQUssRUFBYSxDQUFDO1FBQ3pDLEdBQUcsQ0FBa0I7UUFFN0IsWUFBWSxHQUFvQjtZQUM1QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNuQixDQUFDO1FBRUQsTUFBTSxDQUFDLEtB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QUFDO1FBQ2pELElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDL0IsT0FBTyxTQUFTLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNELENBQUM7YUFDSSxDQUFDO1lBQ0YsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsQ0FBQztJQUNMLENBQUM7U0FDSSxDQUFDO1FBQ0YsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuLy8g5a6e546w5bqP5YiX5YyW55qE6L+Q6KGM5pe25pWw5o2u5qC85byPXHJcbi8vIOWPguiAg+aWh+aho++8mmh0dHBzOi8vZ2l0aHViLmNvbS9jb2Nvcy1jcmVhdG9yLzNkLXRhc2tzL3RyZWUvbWFzdGVyL2Rlc2lnbi1kb2NzL2RhdGEtc3RydWN0dXJlL2RhdGEtc3RydWN0dXJlcy1zZXJpYWxpemF0aW9uLm1kXHJcblxyXG5pbXBvcnQge1xyXG4gICAgVmFsdWVUeXBlLFxyXG4gICAgZGVzZXJpYWxpemUsXHJcbn0gZnJvbSAnY2MnO1xyXG5pbXBvcnQgKiBhcyBjYyBmcm9tICdjYyc7XHJcbmltcG9ydCB7XHJcbiAgICBzZXJpYWxpemVCdWlsdGluVmFsdWVUeXBlLFxyXG59IGZyb20gJ2NjL2VkaXRvci9zZXJpYWxpemF0aW9uJztcclxuXHJcbmltcG9ydCB7IEFycmF5Tm9kZSwgTm9kZSwgQ2xhc3NOb2RlLCBDdXN0b21DbGFzc05vZGUsIERpY3ROb2RlLCBJUmVmc0J1aWxkZXIsIFRyYWNlYWJsZURpY3QgfSBmcm9tICcuL3R5cGVzJztcclxuaW1wb3J0IHtcclxuICAgIFByb3BlcnR5T3B0aW9ucyxcclxuICAgIElBcnJheU9wdGlvbnMsXHJcbiAgICBJQ2xhc3NPcHRpb25zLFxyXG4gICAgSUN1c3RvbUNsYXNzT3B0aW9ucyxcclxuICAgIElPYmpQYXJzaW5nSW5mbyxcclxufSBmcm9tICcuLi9wYXJzZXInO1xyXG5pbXBvcnQgZHVtcENsYXNzZXMgZnJvbSAnLi9jcmVhdGUtY2xhc3MtbWFzayc7XHJcblxyXG4vLyBpbXBvcnQgZGVzZXJpYWxpemVyIHR5cGVzXHJcbmltcG9ydCBEID0gZGVzZXJpYWxpemUuSW50ZXJuYWw7XHJcbnR5cGUgRW1wdHkgPSBELkVtcHR5XztcclxuaW1wb3J0IERhdGFUeXBlSUQgPSBELkRhdGFUeXBlSURfO1xyXG5pbXBvcnQgRmlsZSA9IEQuRmlsZV87XHJcbnR5cGUgSUN1c3RvbU9iamVjdERhdGEgPSBELklDdXN0b21PYmplY3REYXRhXztcclxudHlwZSBJRmlsZURhdGEgPSBELklGaWxlRGF0YV87XHJcbnR5cGUgSW5zdGFuY2VJbmRleCA9IEQuSW5zdGFuY2VJbmRleF87XHJcbnR5cGUgSVJlZnMgPSBELklSZWZzXztcclxudHlwZSBJVFJTRGF0YSA9IEQuSVRSU0RhdGFfO1xyXG5pbXBvcnQgUmVmcyA9IEQuUmVmc187XHJcbmltcG9ydCB7IEJ1aWxkZXIsIElCdWlsZGVyT3B0aW9ucyB9IGZyb20gJy4uL2Jhc2UtYnVpbGRlcic7XHJcbnR5cGUgU2hhcmVkU3RyaW5nID0gRC5TaGFyZWRTdHJpbmdfO1xyXG50eXBlIEFueUNDQ2xhc3MgPSBELkFueUNDQ2xhc3NfO1xyXG5cclxuY29uc3Qge1xyXG4gICAgRU1QVFlfUExBQ0VIT0xERVIsXHJcbiAgICBDVVNUT01fT0JKX0RBVEFfQ0xBU1MsXHJcbiAgICBDVVNUT01fT0JKX0RBVEFfQ09OVEVOVCxcclxufSA9IGRlc2VyaWFsaXplLl9tYWNyb3M7XHJcblxyXG5leHBvcnQgY29uc3QgRk9STUFUX1ZFUlNJT04gPSAxO1xyXG5cclxuLy8g5bqP5YiX5YyW5Li65Lu75oSP5YC85Y2z5Y+v77yM5Y+N5bqP5YiX5YyW5pe25omN5Lya6Kej5p6Q5Ye65p2l55qE5a+56LGhXHJcbmNvbnN0IElOTkVSX09CSl9QTEFDRUhPTERFUiA9IDA7XHJcblxyXG5uYW1lc3BhY2UgUmVmc0J1aWxkZXIge1xyXG5cclxuICAgIHR5cGUgUmVmUmVjb3JkID0gW1xyXG4gICAgICAgIC8vIFtSZWZzLk9XTkVSX09GRlNFVF0gLSDosIHmjIflkJHnm67moIflr7nosaFcclxuICAgICAgICBJbnN0YW5jZUluZGV4LFxyXG4gICAgICAgIC8vIFtSZWZzLktFWV9PRkZTRVRdIC0g5oyH5ZCR55uu5qCH5a+56LGh55qE5bGe5oCn5ZCN5oiW6ICF5pWw57uE57Si5byVXHJcbiAgICAgICAgc3RyaW5nIHwgbnVtYmVyLFxyXG4gICAgICAgIC8vIFtSZWZzLlRBUkdFVF9PRkZTRVRdIC0g5oyH5ZCR55qE55uu5qCH5a+56LGhXHJcbiAgICAgICAgSW5zdGFuY2VJbmRleFxyXG4gICAgXTtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgSW1wbCBpbXBsZW1lbnRzIElSZWZzQnVpbGRlciB7XHJcbiAgICAgICAgcHJpdmF0ZSBiZWZvcmVPZmZzZXRSZWZzID0gbmV3IEFycmF5PFJlZlJlY29yZD4oKTtcclxuICAgICAgICBwcml2YXRlIGFmdGVyT2Zmc2V0UmVmcyA9IG5ldyBBcnJheTxSZWZSZWNvcmQ+KCk7XHJcbiAgICAgICAgcHJpdmF0ZSBjdHg6IENvbXBpbGVkQnVpbGRlcjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoY3R4OiBDb21waWxlZEJ1aWxkZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5jdHggPSBjdHg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhZGRSZWYob3duZXI6IE5vZGUsIGtleTogc3RyaW5nIHwgbnVtYmVyLCB0YXJnZXQ6IE5vZGUpOiBudW1iZXIge1xyXG4gICAgICAgICAgICBjb25zdCBjYW5SZWZEaXJlY3RseSA9ICh0YXJnZXQuaW5zdGFuY2VJbmRleCA8IG93bmVyLmluc3RhbmNlSW5kZXgpO1xyXG4gICAgICAgICAgICBpZiAoY2FuUmVmRGlyZWN0bHkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQuaW5zdGFuY2VJbmRleDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcmVjb3JkID0gW05hTiwga2V5LCB0YXJnZXQuaW5zdGFuY2VJbmRleF0gYXMgUmVmUmVjb3JkO1xyXG5cclxuICAgICAgICAgICAgaWYgKG93bmVyLmluZGV4ZWQpIHtcclxuICAgICAgICAgICAgICAgIHJlY29yZFtSZWZzLk9XTkVSX09GRlNFVF0gPSBvd25lci5pbnN0YW5jZUluZGV4O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZnRlck9mZnNldFJlZnMucHVzaChyZWNvcmQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE5hTjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlY29yZFtSZWZzLk9XTkVSX09GRlNFVF0gPSBJTk5FUl9PQkpfUExBQ0VIT0xERVI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJlZm9yZU9mZnNldFJlZnMucHVzaChyZWNvcmQpO1xyXG4gICAgICAgICAgICAgICAgLy8g6L+U5Zue5a+56LGh6ZyA6KaB5Zyo5Y+N5bqP5YiX5YyW6L+H56iL5Lit6LWL5YC857uZIHJlZnMg5pWw57uE55qE57Si5byV77yI6L+Q6KGM5pe257Si5byV5LyaICogM++8iVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIH4odGhpcy5iZWZvcmVPZmZzZXRSZWZzLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBidWlsZCgpOiBJUmVmcyB8IG51bGwge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5iZWZvcmVPZmZzZXRSZWZzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLmFmdGVyT2Zmc2V0UmVmcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHRoaXMuYmVmb3JlT2Zmc2V0UmVmcy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGNvbnN0IGFsbFJlZnMgPSB0aGlzLmJlZm9yZU9mZnNldFJlZnMuY29uY2F0KHRoaXMuYWZ0ZXJPZmZzZXRSZWZzKTtcclxuICAgICAgICAgICAgY29uc3QgcmVzID0gbmV3IEFycmF5PG51bWJlcj4oYWxsUmVmcy5sZW5ndGggKiBSZWZzLkVBQ0hfUkVDT1JEX0xFTkdUSCArIDEpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlZiBvZiBhbGxSZWZzKSB7XHJcbiAgICAgICAgICAgICAgICByZXNbaSsrXSA9IHJlZltSZWZzLk9XTkVSX09GRlNFVF07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSByZWZbUmVmcy5LRVlfT0ZGU0VUXTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc1tpKytdID0gfmtleTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LnNoYXJlZFN0cmluZ3MudHJhY2VTdHJpbmcoa2V5LCByZXMsIGkrKyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNbaSsrXSA9IHJlZltSZWZzLlRBUkdFVF9PRkZTRVRdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc1tpXSA9IG9mZnNldDtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcyBhcyBJUmVmcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZWR1Y2VFbXB0eUFycmF5PFQgZXh0ZW5kcyBhbnlbXT4oYXJyYXk6IFQpOiBUIHwgRW1wdHkge1xyXG4gICAgcmV0dXJuIChhcnJheSAmJiBhcnJheS5sZW5ndGggPiAwKSA/IGFycmF5IDogRU1QVFlfUExBQ0VIT0xERVI7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbXBpbGVkQnVpbGRlciBleHRlbmRzIEJ1aWxkZXIge1xyXG4gICAgbm9OYXRpdmVEZXA6IGJvb2xlYW47XHJcblxyXG4gICAgc2hhcmVkVXVpZHMgPSBuZXcgVHJhY2VhYmxlRGljdDxTaGFyZWRTdHJpbmc+KCk7XHJcbiAgICBzaGFyZWRTdHJpbmdzID0gbmV3IFRyYWNlYWJsZURpY3Q8U2hhcmVkU3RyaW5nPigpO1xyXG5cclxuICAgIHJlZnNCdWlsZGVyOiBSZWZzQnVpbGRlci5JbXBsO1xyXG5cclxuICAgIC8vIOe8k+WtmOi1hOa6kOS9v+eUqOaDheWGtVxyXG4gICAgLy8gW2l0ZW0xLCBrZXkxLCB1dWlkMSwgaXRlbTIsIGtleTIsIHV1aWQyLCAuLi5dXHJcbiAgICBkZXBlbmRBc3NldHMgPSBuZXcgQXJyYXk8Tm9kZSB8IHN0cmluZyB8IG51bWJlcj4oKTtcclxuXHJcbiAgICBwcml2YXRlIHJvb3ROb2RlOiBOb2RlIHwgdW5kZWZpbmVkO1xyXG4gICAgcHJpdmF0ZSBub3JtYWxOb2RlcyA9IG5ldyBBcnJheTxDbGFzc05vZGU+KCk7XHJcbiAgICBwcml2YXRlIGFkdmFuY2VkTm9kZXMgPSBuZXcgQXJyYXk8Q3VzdG9tQ2xhc3NOb2RlIHwgQXJyYXlOb2RlIHwgRGljdE5vZGU+KCk7XHJcbiAgICBwcml2YXRlIGNsYXNzTm9kZXMgPSBuZXcgQXJyYXk8Q2xhc3NOb2RlIHwgQ3VzdG9tQ2xhc3NOb2RlPigpO1xyXG5cclxuICAgIHByaXZhdGUgZGF0YSA9IG5ldyBBcnJheTxhbnk+KEZpbGUuQVJSQVlfTEVOR1RIKSBhcyBJRmlsZURhdGE7XHJcblxyXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogSUJ1aWxkZXJPcHRpb25zKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLmZvcmNlSW5saW5lKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29tcGlsZWRCdWlsZGVyIGRvZXNuXFwndCBzdXBwb3J0IGBmb3JjZUlubGluZWAnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubm9OYXRpdmVEZXAgPSAhISgnbm9OYXRpdmVEZXAnIGluIG9wdGlvbnMgPyBvcHRpb25zLm5vTmF0aXZlRGVwIDogdHJ1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMucmVmc0J1aWxkZXIgPSBuZXcgUmVmc0J1aWxkZXIuSW1wbCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBPYmplY3QgTm9kZXPvvIzlsIbmnaXlpoLmnInlpI3nlKjliJnkvJrlj5jmiJAgSW5zdGFuY2VSZWZcclxuXHJcbiAgICBzZXRQcm9wZXJ0eV9BcnJheShvd25lcjogb2JqZWN0IHwgbnVsbCwgb3duZXJJbmZvOiBJT2JqUGFyc2luZ0luZm8gfCBudWxsLCBrZXk6IHN0cmluZyB8IG51bWJlciwgb3B0aW9uczogSUFycmF5T3B0aW9ucyk6IElPYmpQYXJzaW5nSW5mbyB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5ldyBBcnJheU5vZGUob3B0aW9ucy53cml0ZU9ubHlBcnJheS5sZW5ndGgpO1xyXG4gICAgICAgIHRoaXMuYWR2YW5jZWROb2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgIHRoaXMuc2V0RHluYW1pY1Byb3BlcnR5KG93bmVySW5mbywga2V5LCBub2RlKTtcclxuICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQcm9wZXJ0eV9EaWN0KG93bmVyOiBvYmplY3QgfCBudWxsLCBvd25lckluZm86IElPYmpQYXJzaW5nSW5mbyB8IG51bGwsIGtleTogc3RyaW5nIHwgbnVtYmVyLCBvcHRpb25zOiBQcm9wZXJ0eU9wdGlvbnMpOiBJT2JqUGFyc2luZ0luZm8ge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgRGljdE5vZGUoKTtcclxuICAgICAgICB0aGlzLmFkdmFuY2VkTm9kZXMucHVzaChub2RlKTtcclxuICAgICAgICB0aGlzLnNldER5bmFtaWNQcm9wZXJ0eShvd25lckluZm8sIGtleSwgbm9kZSk7XHJcbiAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0UHJvcGVydHlfQ2xhc3Mob3duZXI6IG9iamVjdCB8IG51bGwsIG93bmVySW5mbzogSU9ialBhcnNpbmdJbmZvIHwgbnVsbCwga2V5OiBzdHJpbmcgfCBudW1iZXIsIG9wdGlvbnM6IElDbGFzc09wdGlvbnMpOiBJT2JqUGFyc2luZ0luZm8ge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgQ2xhc3NOb2RlKG9wdGlvbnMudHlwZSk7XHJcbiAgICAgICAgdGhpcy5ub3JtYWxOb2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgIHRoaXMuY2xhc3NOb2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgIHRoaXMuc2V0RHluYW1pY1Byb3BlcnR5KG93bmVySW5mbywga2V5LCBub2RlKTtcclxuICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQcm9wZXJ0eV9DdXN0b21pemVkQ2xhc3Mob3duZXI6IG9iamVjdCB8IG51bGwsIG93bmVySW5mbzogSU9ialBhcnNpbmdJbmZvIHwgbnVsbCwga2V5OiBzdHJpbmcgfCBudW1iZXIsIG9wdGlvbnM6IElDdXN0b21DbGFzc09wdGlvbnMpOiBJT2JqUGFyc2luZ0luZm8ge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgQ3VzdG9tQ2xhc3NOb2RlKG9wdGlvbnMudHlwZSwgb3B0aW9ucy5jb250ZW50KTtcclxuICAgICAgICB0aGlzLmFkdmFuY2VkTm9kZXMucHVzaChub2RlKTtcclxuICAgICAgICB0aGlzLmNsYXNzTm9kZXMucHVzaChub2RlKTtcclxuICAgICAgICB0aGlzLnNldER5bmFtaWNQcm9wZXJ0eShvd25lckluZm8sIGtleSwgbm9kZSk7XHJcbiAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcGFyc2VkXHJcblxyXG4gICAgc2V0UHJvcGVydHlfUGFyc2VkT2JqZWN0KG93bmVySW5mbzogSU9ialBhcnNpbmdJbmZvLCBrZXk6IHN0cmluZyB8IG51bWJlciwgdmFsdWVJbmZvOiBJT2JqUGFyc2luZ0luZm8sIGZvcm1lcmx5U2VyaWFsaXplZEFzOiBzdHJpbmcgfCBudWxsKTogdm9pZCB7XHJcbiAgICAgICAgKG93bmVySW5mbyBhcyBOb2RlKS5zZXREeW5hbWljKCh2YWx1ZUluZm8gYXMgTm9kZSksIGtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3RhdGljIFZhbHVlc1xyXG5cclxuICAgIHNldFByb3BlcnR5X1Jhdyhvd25lcjogb2JqZWN0LCBvd25lckluZm86IElPYmpQYXJzaW5nSW5mbywga2V5OiBzdHJpbmcgfCBudW1iZXIsIHZhbHVlOiBhbnksIG9wdGlvbnM6IFByb3BlcnR5T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIChvd25lckluZm8gYXMgTm9kZSkuc2V0U3RhdGljKGtleSwgRGF0YVR5cGVJRC5TaW1wbGVUeXBlLCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0UHJvcGVydHlfVmFsdWVUeXBlKG93bmVyOiBvYmplY3QgfCBudWxsLCBvd25lckluZm86IElPYmpQYXJzaW5nSW5mbyB8IG51bGwsIGtleTogc3RyaW5nIHwgbnVtYmVyLCB2YWx1ZTogVmFsdWVUeXBlLCBvcHRpb25zOiBQcm9wZXJ0eU9wdGlvbnMpOiBJT2JqUGFyc2luZ0luZm8gfCBudWxsIHtcclxuICAgICAgICBpZiAoIW93bmVySW5mbykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBpbGVkQnVsaWRlcjogTm90IHN1cHBvcnQgc2VyaWFsaXppbmcgVmFsdWVUeXBlIGFzIHJvb3Qgb2JqZWN0LicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkYXRhID0gc2VyaWFsaXplQnVpbHRpblZhbHVlVHlwZSh2YWx1ZSk7XHJcbiAgICAgICAgaWYgKCFkYXRhKSB7XHJcbiAgICAgICAgICAgIC8vIG5vdCBidWlsdC1pbiB2YWx1ZSB0eXBlLCBqdXN0IHNlcmlhbGl6ZSBhcyBub3JtYWwgY2xhc3NcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBkYXRhVHlwZUlEID0gRGF0YVR5cGVJRC5WYWx1ZVR5cGU7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5kZWZhdWx0VmFsdWUgaW5zdGFuY2VvZiBjYy5WYWx1ZVR5cGUpIHtcclxuICAgICAgICAgICAgZGF0YVR5cGVJRCA9IERhdGFUeXBlSUQuVmFsdWVUeXBlQ3JlYXRlZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgKG93bmVySW5mbyBhcyBOb2RlKS5zZXRTdGF0aWMoa2V5LCBkYXRhVHlwZUlELCBkYXRhKTtcclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQcm9wZXJ0eV9UeXBlZEFycmF5KG93bmVyOiBvYmplY3QsIG93bmVySW5mbzogSU9ialBhcnNpbmdJbmZvLCBrZXk6IHN0cmluZyB8IG51bWJlciwgdmFsdWU6IGFueSwgb3B0aW9uczogUHJvcGVydHlPcHRpb25zKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCEob3duZXIgaW5zdGFuY2VvZiBjYy5Ob2RlKSB8fCBrZXkgIT09ICdfdHJzJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBzdXBwb3J0IHRvIHNlcmlhbGl6ZSBUeXBlZEFycmF5IHlldC4gQ2FuIG9ubHkgdXNlIFR5cGVkQXJyYXkgaW4gVFJTLicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoICE9PSAxMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRSUyAke3ZhbHVlfSBzaG91bGQgY29udGFpbnMgMTAgZWxlbWVudHMuYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBBcnJheS5mcm9tKHZhbHVlKSBhcyBJVFJTRGF0YTtcclxuICAgICAgICAob3duZXJJbmZvIGFzIE5vZGUpLnNldFN0YXRpYyhrZXksIERhdGFUeXBlSUQuVFJTLCBkYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQcm9wZXJ0eV9Bc3NldFV1aWQob3duZXI6IG9iamVjdCwgb3duZXJJbmZvOiBJT2JqUGFyc2luZ0luZm8sIGtleTogc3RyaW5nIHwgbnVtYmVyLCB1dWlkOiBzdHJpbmcsIG9wdGlvbnM6IFByb3BlcnR5T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIC8vIOWFiOe8k+WtmOWIsCBkZXBlbmRBc3NldHPvvIzmnIDlkI4gb3duZXJJdGVtIOWmguWBmuS4uuW1jOWll+WvueixoeWwhuaUueaIkCBBc3NldFJlZkJ5SW5uZXJPYmpcclxuICAgICAgICBjb25zdCBvd25lck5vZGUgPSAob3duZXJJbmZvIGFzIE5vZGUpO1xyXG4gICAgICAgIHRoaXMuZGVwZW5kQXNzZXRzLnB1c2gob3duZXJOb2RlLCBrZXksIHV1aWQpO1xyXG4gICAgICAgIGlmIChvd25lck5vZGUgaW5zdGFuY2VvZiBDdXN0b21DbGFzc05vZGUpIHtcclxuICAgICAgICAgICAgb3duZXJOb2RlLnNob3VsZEJlSW5kZXhlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldFJvb3Qob2JqSW5mbzogSU9ialBhcnNpbmdJbmZvKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yb290Tm9kZSA9IG9iakluZm8gYXMgTm9kZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBtYXJrQXNTaGFyZWRPYmogKG9iajogYW55KTogdm9pZCB7fVxyXG5cclxuICAgIHByaXZhdGUgc2V0RHluYW1pY1Byb3BlcnR5KG93bmVySW5mbzogSU9ialBhcnNpbmdJbmZvIHwgbnVsbCwga2V5OiBzdHJpbmcgfCBudW1iZXIsIG5vZGU6IE5vZGUpIHtcclxuICAgICAgICBvd25lckluZm8gJiYgKG93bmVySW5mbyBhcyBOb2RlKS5zZXREeW5hbWljKG5vZGUsIGtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjb2xsZWN0SW5zdGFuY2VzKCkge1xyXG4gICAgICAgIHRoaXMubm9ybWFsTm9kZXMgPSB0aGlzLm5vcm1hbE5vZGVzLmZpbHRlcigoeCkgPT4geC5yZWZDb3VudCA+IDEpO1xyXG4gICAgICAgIHRoaXMubm9ybWFsTm9kZXMuc29ydChOb2RlLmNvbXBhcmVCeVJlZkNvdW50KTtcclxuICAgICAgICB0aGlzLmFkdmFuY2VkTm9kZXMgPSB0aGlzLmFkdmFuY2VkTm9kZXMuZmlsdGVyKCh4KSA9PiB4LnNob3VsZEJlSW5kZXhlZCB8fCB4LnJlZkNvdW50ID4gMSk7XHJcbiAgICAgICAgdGhpcy5hZHZhbmNlZE5vZGVzLnNvcnQoTm9kZS5jb21wYXJlQnlSZWZDb3VudCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5yb290Tm9kZTtcclxuICAgICAgICBpZiAocm9vdE5vZGUgaW5zdGFuY2VvZiBDbGFzc05vZGUpIHtcclxuICAgICAgICAgICAgLy8gcm9vdCBpcyBub3JtYWxcclxuICAgICAgICAgICAgY29uc3Qgcm9vdEluZGV4ID0gdGhpcy5ub3JtYWxOb2Rlcy5pbmRleE9mKHJvb3ROb2RlKTtcclxuICAgICAgICAgICAgaWYgKHJvb3RJbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubm9ybWFsTm9kZXMuc3BsaWNlKHJvb3RJbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyByb290LnJlZkNvdW50IDw9IDFcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm5vcm1hbE5vZGVzLnVuc2hpZnQocm9vdE5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gcm9vdCBpcyBhZHZhbmNlZFxyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIGNvbnN0IHJvb3RJbmRleCA9IHRoaXMuYWR2YW5jZWROb2Rlcy5pbmRleE9mKHJvb3ROb2RlKTtcclxuICAgICAgICAgICAgaWYgKHJvb3RJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIC8vIHJvb3QucmVmQ291bnQgPD0gMVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZHZhbmNlZE5vZGVzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIHRoaXMuYWR2YW5jZWROb2Rlcy5wdXNoKHJvb3ROb2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgbm9ybWFsQ291bnQgPSB0aGlzLm5vcm1hbE5vZGVzLmxlbmd0aDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vcm1hbENvdW50OyArK2kpIHtcclxuICAgICAgICAgICAgY29uc3Qgb2JqID0gdGhpcy5ub3JtYWxOb2Rlc1tpXTtcclxuICAgICAgICAgICAgb2JqLmluc3RhbmNlSW5kZXggPSBpO1xyXG4gICAgICAgICAgICBvYmouaW5kZXhlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5hZHZhbmNlZE5vZGVzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9iaiA9IHRoaXMuYWR2YW5jZWROb2Rlc1tpXTtcclxuICAgICAgICAgICAgb2JqLmluc3RhbmNlSW5kZXggPSBub3JtYWxDb3VudCArIGk7XHJcbiAgICAgICAgICAgIG9iai5pbmRleGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRPRE8gLSDmlbDnu4TlsL3ph4/nibnljJbkuLogQXJyYXlfSW5zdGFuY2VSZWYg5Lul5Yqg5b+r5Y+N5bqP5YiX5YyW5oCn6IO977yI5L2G5piv5Y+I5Lya5aKe5Yqg57Si5byV5pWw6YeP5Y+K57Si5byV57G75Z6L77yJXHJcbiAgICAgICAgLy8gVE9ETyAtIOWIhuaekOW8leeUqOWFs+ezu++8jOiuqeebuOS6kuW8leeUqOeahOWvueixoeWwvemHj+WQjOaXtuWPjeW6j+WIl+WMlu+8jOaPkOWNh+WGheWtmOWRveS4reeOh+OAglxyXG4gICAgICAgIC8vIFRPRE8gLSDliIbmnpDlvJXnlKjlhbPns7vvvIzorqnooqvkvp3otZbnmoTlr7nosaHlsL3ph4/mj5DliY3luo/liJfljJbvvIzlh4/lsJEgcmVmcyDmlbDmja7ph4/nmoTlvIDplIDvvIjlpJrnlJ/miJAgb3duZXLjgIFrZXkg55qE57Si5byV77yJ77yM5Lul5Y+K6K6+572u5YaF5bWM5a+56LGh5a6e5L6L5YiwIG93bmVyIOeahOW8gOmUgFxyXG4gICAgfVxyXG5cclxuICAgIC8vIOeUn+aIkCBJbnN0YW5jZXNcclxuICAgIHByaXZhdGUgZHVtcEluc3RhbmNlcygpIHtcclxuICAgICAgICBjb25zdCBvYmpDb3VudCA9IHRoaXMubm9ybWFsTm9kZXMubGVuZ3RoICsgdGhpcy5hZHZhbmNlZE5vZGVzLmxlbmd0aDtcclxuICAgICAgICBjb25zdCBpbnN0YW5jZXMgPSBuZXcgQXJyYXkob2JqQ291bnQpO1xyXG5cclxuICAgICAgICBjb25zdCBub3JtYWxDb3VudCA9IHRoaXMubm9ybWFsTm9kZXMubGVuZ3RoO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9ybWFsQ291bnQ7ICsraSkge1xyXG4gICAgICAgICAgICBjb25zdCBvYmogPSB0aGlzLm5vcm1hbE5vZGVzW2ldO1xyXG4gICAgICAgICAgICBpbnN0YW5jZXNbaV0gPSBvYmouZHVtcFJlY3Vyc2l2ZWx5KHRoaXMucmVmc0J1aWxkZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmFkdmFuY2VkTm9kZXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgY29uc3Qgb2JqID0gdGhpcy5hZHZhbmNlZE5vZGVzW2ldO1xyXG4gICAgICAgICAgICBjb25zdCBkdW1wZWQgPSBvYmouZHVtcFJlY3Vyc2l2ZWx5KHRoaXMucmVmc0J1aWxkZXIpO1xyXG4gICAgICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgQ3VzdG9tQ2xhc3NOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZXNbbm9ybWFsQ291bnQgKyBpXSA9IChkdW1wZWQgYXMgSUN1c3RvbU9iamVjdERhdGEpW0NVU1RPTV9PQkpfREFUQV9DT05URU5UXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlc1tub3JtYWxDb3VudCArIGldID0gZHVtcGVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKHRoaXMucm9vdE5vZGUgYXMgTm9kZSkuaW5zdGFuY2VJbmRleCAhPT0gMCB8fFxyXG4gICAgICAgICAgICB0eXBlb2YgaW5zdGFuY2VzW2luc3RhbmNlcy5sZW5ndGggLSAxXSA9PT0gJ251bWJlcicgfHwgLy8g6Ziy5q2i5pyA5ZCO5LiA5Liq5pWw5a2X6KKr6ZSZ5b2TIHJvb3RJbmZvXHJcbiAgICAgICAgICAgICF0aGlzLm5vTmF0aXZlRGVwXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJvb3RJbmRleCA9ICh0aGlzLnJvb3ROb2RlIGFzIE5vZGUpLmluc3RhbmNlSW5kZXg7XHJcbiAgICAgICAgICAgIGluc3RhbmNlcy5wdXNoKHRoaXMubm9OYXRpdmVEZXAgPyByb290SW5kZXggOiB+cm9vdEluZGV4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZGF0YVtGaWxlLkluc3RhbmNlc10gPSBpbnN0YW5jZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g55Sf5oiQIEluc3RhbmNlVHlwZXNcclxuICAgIHByaXZhdGUgZHVtcEluc3RhbmNlVHlwZXMoKSB7XHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2VUeXBlcyA9IHRoaXMuYWR2YW5jZWROb2Rlcy5tYXAoKHgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHggaW5zdGFuY2VvZiBDdXN0b21DbGFzc05vZGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoeC5kdW1wZWQgYXMgSUN1c3RvbU9iamVjdERhdGEpW0NVU1RPTV9PQkpfREFUQV9DTEFTU107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gfnguc2VsZlR5cGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmRhdGFbRmlsZS5JbnN0YW5jZVR5cGVzXSA9IHJlZHVjZUVtcHR5QXJyYXkoaW5zdGFuY2VUeXBlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkdW1wRGVwZW5kVXVpZHMoKSB7XHJcbiAgICAgICAgY29uc3QgaW5uZXJEZXBlbmRzID0ge1xyXG4gICAgICAgICAgICBvd25lcnM6IG5ldyBBcnJheTxudW1iZXI+KCksXHJcbiAgICAgICAgICAgIGtleXM6IG5ldyBBcnJheTxzdHJpbmcgfCBudW1iZXI+KCksXHJcbiAgICAgICAgICAgIHV1aWRzOiBuZXcgQXJyYXk8c3RyaW5nPigpLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgaW5kZXhlZERlcGVuZHMgPSB7XHJcbiAgICAgICAgICAgIG93bmVyczogbmV3IEFycmF5PEluc3RhbmNlSW5kZXg+KCksXHJcbiAgICAgICAgICAgIGtleXM6IG5ldyBBcnJheTxzdHJpbmcgfCBudW1iZXI+KCksXHJcbiAgICAgICAgICAgIHV1aWRzOiBuZXcgQXJyYXk8c3RyaW5nPigpLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IGFycmF5ID0gdGhpcy5kZXBlbmRBc3NldHM7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkgKz0gMykge1xyXG4gICAgICAgICAgICBjb25zdCBvd25lciA9IGFycmF5W2ldIGFzIE5vZGU7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSBhcnJheVtpICsgMV0gYXMgc3RyaW5nIHwgbnVtYmVyO1xyXG4gICAgICAgICAgICBjb25zdCB1dWlkID0gYXJyYXlbaSArIDJdIGFzIHN0cmluZztcclxuICAgICAgICAgICAgbGV0IGRlcGVuZHM7XHJcbiAgICAgICAgICAgIGlmIChvd25lci5pbmRleGVkKSB7XHJcbiAgICAgICAgICAgICAgICBkZXBlbmRzID0gaW5kZXhlZERlcGVuZHM7XHJcbiAgICAgICAgICAgICAgICBvd25lci5zZXRBc3NldFJlZlBsYWNlaG9sZGVyT25JbmRleGVkKGtleSk7XHJcbiAgICAgICAgICAgICAgICBkZXBlbmRzLm93bmVycy5wdXNoKG93bmVyLmluc3RhbmNlSW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGVwZW5kcyA9IGlubmVyRGVwZW5kcztcclxuICAgICAgICAgICAgICAgIG93bmVyLnNldFN0YXRpYyhrZXksIERhdGFUeXBlSUQuQXNzZXRSZWZCeUlubmVyT2JqLCBkZXBlbmRzLm93bmVycy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgZGVwZW5kcy5vd25lcnMucHVzaChJTk5FUl9PQkpfUExBQ0VIT0xERVIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAga2V5ID0gfmtleTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZXBlbmRzLmtleXMucHVzaChrZXkpO1xyXG4gICAgICAgICAgICBkZXBlbmRzLnV1aWRzLnB1c2godXVpZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRhdGFbRmlsZS5EZXBlbmRPYmpzXSA9IGlubmVyRGVwZW5kcy5vd25lcnMuY29uY2F0KGluZGV4ZWREZXBlbmRzLm93bmVycyk7XHJcbiAgICAgICAgY29uc3QgYWxsS2V5cyA9IHRoaXMuZGF0YVtGaWxlLkRlcGVuZEtleXNdID0gaW5uZXJEZXBlbmRzLmtleXMuY29uY2F0KGluZGV4ZWREZXBlbmRzLmtleXMpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsS2V5cy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhbGxLZXlzW2ldO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hhcmVkU3RyaW5ncy50cmFjZVN0cmluZyhrZXksIGFsbEtleXMsIGkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGFsbFV1aWRzID0gdGhpcy5kYXRhW0ZpbGUuRGVwZW5kVXVpZEluZGljZXNdID0gaW5uZXJEZXBlbmRzLnV1aWRzLmNvbmNhdChpbmRleGVkRGVwZW5kcy51dWlkcyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxVdWlkcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBjb25zdCB1dWlkID0gYWxsVXVpZHNbaV07XHJcbiAgICAgICAgICAgIHRoaXMuc2hhcmVkVXVpZHMudHJhY2VTdHJpbmcodXVpZCwgYWxsVXVpZHMsIGkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmaW5hbGl6ZUpzb25QYXJ0KCk6IG9iamVjdCB8IHN0cmluZyB7XHJcbiAgICAgICAgLy8gMS4g6YGN5Y6G5omA5pyJ5a+56LGh77yM5bCGIHJvb3Qg5ZKM5omA5pyJ5byV55So5pWw6LaF6L+HIDEg55qE5a+56LGh5pS+5YiwIGluc3RhbmNlcyDkuK3vvIzlkIzml7blsIbmlbDmja7ovazmjaLmiJDlvJXnlKhcclxuICAgICAgICAvLyDvvIjlpoLmnpzlt7Lnu4/lnKggaW5zdGFuY2VzIOS4reWImei3s+i/h++8iVxyXG4gICAgICAgIHRoaXMuY29sbGVjdEluc3RhbmNlcygpO1xyXG5cclxuICAgICAgICAvLyAyLiDnlJ/miJDotYTmupDkvp3otZblhbPns7tcclxuICAgICAgICB0aGlzLmR1bXBEZXBlbmRVdWlkcygpO1xyXG5cclxuICAgICAgICAvLyAzLiDnlJ/miJDmiYDmnInlr7nosaHmlbDmja5cclxuICAgICAgICB0aGlzLmR1bXBJbnN0YW5jZXMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5kYXRhW0ZpbGUuVmVyc2lvbl0gPSBGT1JNQVRfVkVSU0lPTjtcclxuICAgICAgICAvLyBkYXRhW0ZpbGUuU2hhcmVkVXVpZHNdID0gdGhpcy5kZXBlbmRTaGFyZWRVdWlkcy5kdW1wKCk7XHJcbiAgICAgICAgLy8gZGF0YVtGaWxlLlNoYXJlZFN0cmluZ3NdID0gdGhpcy5zaGFyZWRTdHJpbmdzLmR1bXAoKTtcclxuXHJcbiAgICAgICAgLy8gNC4g55Sf5oiQIFNoYXJlZENsYXNzZXMg5ZKMIFNoYXJlZE1hc2tzXHJcbiAgICAgICAgY29uc3QgeyBzaGFyZWRDbGFzc2VzLCBzaGFyZWRNYXNrcyB9ID0gZHVtcENsYXNzZXModGhpcy5jbGFzc05vZGVzKTtcclxuICAgICAgICB0aGlzLmRhdGFbRmlsZS5TaGFyZWRDbGFzc2VzXSA9IHNoYXJlZENsYXNzZXM7XHJcbiAgICAgICAgdGhpcy5kYXRhW0ZpbGUuU2hhcmVkTWFza3NdID0gcmVkdWNlRW1wdHlBcnJheShzaGFyZWRNYXNrcyk7XHJcblxyXG4gICAgICAgIC8vIDUuIOWGmeWFpSBpbnN0YW5jZSDlr7nosaHnsbvlnotcclxuICAgICAgICB0aGlzLmR1bXBJbnN0YW5jZVR5cGVzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0YVtGaWxlLlJlZnNdID0gdGhpcy5yZWZzQnVpbGRlci5idWlsZCgpIHx8IEVNUFRZX1BMQUNFSE9MREVSO1xyXG5cclxuICAgICAgICBjb25zdCBzdHJpbmdzID0gdGhpcy5zaGFyZWRTdHJpbmdzLmR1bXAoKTtcclxuICAgICAgICB0aGlzLmRhdGFbRmlsZS5TaGFyZWRTdHJpbmdzXSA9IHJlZHVjZUVtcHR5QXJyYXkoc3RyaW5ncyk7XHJcblxyXG4gICAgICAgIGNvbnN0IHV1aWRzID0gdGhpcy5zaGFyZWRVdWlkcy5kdW1wKCk7XHJcbiAgICAgICAgdGhpcy5kYXRhW0ZpbGUuU2hhcmVkVXVpZHNdID0gcmVkdWNlRW1wdHlBcnJheSh1dWlkcyk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGE7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRSb290RGF0YShkYXRhOiBJRmlsZURhdGEpOiBJRmlsZURhdGFbRmlsZS5JbnN0YW5jZXNdIHtcclxuICAgIGNvbnN0IGluc3RhbmNlcyA9IGRhdGFbRmlsZS5JbnN0YW5jZXNdO1xyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaW5zdGFuY2VzKSkge1xyXG4gICAgICAgIGNvbnN0IHJvb3RJbmZvID0gaW5zdGFuY2VzW2luc3RhbmNlcy5sZW5ndGggLSAxXTtcclxuICAgICAgICBpZiAodHlwZW9mIHJvb3RJbmZvID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICByZXR1cm4gaW5zdGFuY2VzW3Jvb3RJbmZvID49IDAgPyByb290SW5mbyA6IH5yb290SW5mb107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gaW5zdGFuY2VzWzBdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBpbnN0YW5jZXM7XHJcbiAgICB9XHJcbn1cclxuIl19