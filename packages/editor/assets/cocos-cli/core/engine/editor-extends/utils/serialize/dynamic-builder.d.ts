import { Asset, ValueType, Constructor } from 'cc';
import { PropertyOptions, IArrayOptions, IClassOptions, ICustomClassOptions, IObjParsingInfo } from './parser';
import { Builder, IBuilderOptions } from './base-builder';
declare namespace Format {
    export interface Class {
        __type__: string;
        [prop: string]: AnyItem;
    }
    export interface CustomizedClass extends Class {
        content: any;
    }
    export interface TypedArray extends Class {
        __type__: 'TypedArray';
        ctor: string;
        array: any[];
    }
    export interface InstanceReference {
        __id__: number;
    }
    export interface AssetReference {
        __uuid__: string;
    }
    type RawItem = number | string | boolean | null;
    type Item = Class | InstanceReference | RawItem;
    type Dict = {
        [key in string]: AnyItem;
    };
    type Array = AnyItem[];
    export type Object = Class | Dict | Array;
    export type AnyItem = Item | Dict | Array;
    export {};
}
interface IObjAndId extends IObjParsingInfo {
    data: Format.AnyItem;
    id: number;
}
export default class DynamicBuilder extends Builder {
    forceInline: boolean;
    private serializedList;
    constructor(options: IBuilderOptions);
    setProperty_Array(owner: object | null, ownerInfo: IObjAndId | null, key: string | number, options: IArrayOptions): IObjAndId;
    setProperty_Dict(owner: object | null, ownerInfo: IObjAndId | null, key: string | number, options: PropertyOptions): IObjAndId;
    private addObject;
    setProperty_Class(owner: object | null, ownerInfo: IObjAndId | null, key: string | number, options: IClassOptions): IObjAndId;
    setProperty_CustomizedClass(owner: object | null, ownerInfo: IObjAndId | null, key: string | number, options: ICustomClassOptions): IObjAndId;
    setProperty_ParsedObject(ownerInfo: IObjAndId, key: string | number, valueInfo: IObjAndId, formerlySerializedAs: string | null): void;
    setProperty_Raw(owner: object, ownerInfo: IObjAndId, key: string | number, value: any, options: PropertyOptions): void;
    setProperty_ValueType(owner: object | null, ownerInfo: IObjAndId | null, key: string | number, value: ValueType, options: PropertyOptions): IObjAndId;
    setProperty_TypedArray(owner: object, ownerInfo: IObjAndId, key: string | number, value: any, options: PropertyOptions): void;
    setProperty_AssetUuid(owner: object, ownerInfo: IObjAndId, key: string | number, uuid: string, options: PropertyOptions): void;
    setRoot(objInfo: IObjAndId): void;
    protected finalizeJsonPart(): any;
}
/**
 * Create a pseudo object which will be force serialized as a reference to any asset by specified uuid.
 */
export declare function asAsset(uuid: string, type?: Constructor<Asset>): Asset | null;
/**
 * Set the asset's name directly in JSON object
 */
export declare function setName(data: Format.AnyItem, name: string): void;
export declare function findRootObject(data: Format.AnyItem, type: string): string | number | boolean | Format.InstanceReference | {
    [x: string]: Format.AnyItem;
} | null;
export declare function assert(condition: any, message?: string): void;
export {};
