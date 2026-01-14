import { deserialize } from 'cc';
import D = deserialize.Internal;
type OtherObjectData = D.OtherObjectData_;
type AnyData = D.AnyData_;
import DataTypeID = D.DataTypeID_;
type DataTypes = D.DataTypes_;
type IClassObjectData = D.IClassObjectData_;
type ICustomObjectData = D.ICustomObjectData_;
type ICustomObjectDataContent = D.ICustomObjectDataContent_;
type IDictData = D.IDictData_;
type IMask = D.IMask_;
type IClass = D.IClass_;
export declare class TraceableItem {
    private tracers;
    private keys;
    static compareByRefCount(lhs: TraceableItem, rhs: TraceableItem): number;
    private static readonly NO_RESULT;
    result: any;
    constructor();
    traceBy(tracer: object, key: (string | number)): void;
    movedTo(index: number): void;
}
export declare class TraceableDict<T> {
    static readonly PLACEHOLDER = 0;
    private values;
    trace(source: any, tracer: object, key: (string | number)): TraceableItem;
    traceString(source: string, tracer: object, key: (string | number)): void;
    get(source: any): TraceableItem | undefined;
    getSortedItems(): TraceableItem[];
    dump(offset?: number): T[];
}
export interface IRefsBuilder {
    addRef(owner: Node, key: string | number, target: Node): number;
}
type DynamicType = DataTypeID.Array | DataTypeID.Dict | DataTypeID.Class | DataTypeID.CustomizedClass;
type DerivedType = DataTypeID.InstanceRef | // 被多个对象复用时
DataTypeID.SimpleType | // 可以完美被 json 序列化时
DataTypeID.Array_AssetRefByInnerObj | DataTypeID.Array_Class | DataTypeID.Array_InstanceRef;
type StaticType = DataTypeID.SimpleType | DataTypeID.ValueType | DataTypeID.ValueTypeCreated | DataTypeID.TRS | DataTypeID.AssetRefByInnerObj;
export declare class Node {
    selfType: DynamicType | DerivedType;
    refCount: number;
    indexed: boolean;
    shouldBeIndexed: boolean;
    private _index;
    get instanceIndex(): number;
    set instanceIndex(val: number);
    get refType(): DynamicType | DerivedType;
    static compareByRefCount(lhs: Node, rhs: Node): number;
    constructor(dataTypeID: DynamicType);
    setStatic<T extends StaticType>(key: string | number, dataTypeID: T, data: DataTypes[T]): void;
    setDynamic(target: Node, key?: string | number): void;
    static readonly AssetPlaceholderType: any;
    static readonly AssetPlaceholderValue: null;
    setAssetRefPlaceholderOnIndexed(key: string | number): void;
    dumpRecursively(refsBuilder: IRefsBuilder): (IClassObjectData | OtherObjectData);
}
export declare class ArrayNode extends Node {
    types: (DataTypeID | undefined)[];
    datas: (AnyData | Node)[];
    static DeriveTypes: any[][];
    constructor(length: number);
    setStatic(key: number, dataTypeID: StaticType, data: AnyData): void;
    setDynamic(target: Node, key: number): void;
    setAssetRefPlaceholderOnIndexed(key: number): void;
    dumpRecursively(refsBuilder: IRefsBuilder): any;
}
export declare class DictNode extends Node {
    data: IDictData;
    json: Record<string, DataTypes[DataTypeID.SimpleType]>;
    dynamics: Record<string, Node>;
    constructor();
    setStatic(key: string, dataTypeID: StaticType, value: AnyData): void;
    setDynamic(target: Node, key: string): void;
    dumpRecursively(refsBuilder: IRefsBuilder): IDictData | object;
}
export declare class ClassNode extends Node {
    ctor: string;
    simpleKeys: string[];
    private simpleValues;
    advanceds: any[];
    dumped: IClassObjectData | undefined;
    static fromData(clazz: IClass, mask: IMask, data: IClassObjectData): ClassNode;
    constructor(ctor: string);
    setStatic(key: string, dataTypeID: StaticType, value: AnyData): void;
    setDynamic(target: Node, key: string): void;
    dumpRecursively(refsBuilder: IRefsBuilder): IClassObjectData;
}
export declare class CustomClassNode extends Node {
    ctor: string;
    content: ICustomObjectDataContent;
    dumped: ICustomObjectData | undefined;
    static fromData(ctor: string, data: ICustomObjectData): CustomClassNode;
    constructor(ctor: string, content: ICustomObjectDataContent);
    setStatic(key: string, dataTypeID: StaticType, value: AnyData): void;
    setDynamic(target: Node, key: string): void;
    dumpRecursively(refsBuilder: IRefsBuilder): ICustomObjectData;
}
export {};
