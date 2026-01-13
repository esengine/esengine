import { Builder, IBuilderOptions } from './base-builder';
interface IPropertyOptions {
    formerlySerializedAs?: string;
    defaultValue?: any;
    expectedType?: string;
}
export type PropertyOptions = IPropertyOptions | null;
export interface IArrayOptions extends IPropertyOptions {
    writeOnlyArray: any[];
}
export interface IClassOptions extends IPropertyOptions {
    type: string;
    /**
     * 此类的实例永远只会被一个地方引用到。
     */
    uniquelyReferenced?: boolean;
}
export interface ICustomClassOptions extends IClassOptions {
    content: any;
}
export interface IObjParsingInfo {
}
export interface IParserOptions {
    compressUuid?: boolean;
    discardInvalid?: boolean;
    dontStripDefault?: boolean;
    missingClassReporter?: any;
    missingObjectReporter?: any;
    reserveContentsForSyncablePrefab?: boolean;
    _exporting?: boolean;
    useCCON?: boolean;
    keepNodeUuid?: boolean;
    recordAssetDepends?: string[];
}
export declare class Parser {
    exporting: boolean;
    mustCompresseUuid: boolean;
    discardInvalid: boolean;
    dontStripDefault: boolean;
    missingClassReporter: any;
    missingObjectReporter: any;
    reserveContentsForAllSyncablePrefab: boolean;
    keepNodeUuid: boolean;
    recordAssetDepends: IParserOptions['recordAssetDepends'];
    private builder;
    private root;
    private prefabRoot;
    private assetExists;
    private parsingInfos;
    private customExportingCtxCache;
    private _serializationContext;
    private assetDepends?;
    constructor(builder: Builder, options: IParserOptions);
    parse(obj: object): void;
    private checkMissingAsset;
    private isObjRemoved;
    private setParsedObj;
    private verifyNotParsedValue;
    private canDiscardByPrefabRoot;
    private enumerateClass;
    static isDefaultTrs(trs: any): boolean;
    private parseField;
    /**
     * 解析对象
     * 1. 调用 builder 的 API 声明一个新的【空对象】
     * 2. 对可引用对象，标记解析状态，防止循环解析
     * 3. 【最后】枚举对象包含的其它属性
     */
    private parseObjField;
    private enumerateDict;
    private enumerateBindedDict;
}
export interface IOptions extends IParserOptions, IBuilderOptions {
}
export default function serialize(obj: Exclude<any, null | undefined>, options: IOptions): string | object;
export {};
