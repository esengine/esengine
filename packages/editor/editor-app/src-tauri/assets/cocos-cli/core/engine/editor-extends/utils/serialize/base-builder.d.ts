import type { ValueType } from 'cc';
import { CCON } from 'cc/editor/serialization';
import { IArrayOptions, IClassOptions, ICustomClassOptions, IObjParsingInfo, PropertyOptions } from './parser';
export declare abstract class Builder {
    constructor(options: IBuilderOptions);
    abstract setProperty_Raw(owner: object, ownerInfo: IObjParsingInfo, key: string | number, value: any, options: PropertyOptions): void;
    abstract setProperty_Class(owner: object | null, ownerInfo: IObjParsingInfo | null, key: string | number, options: IClassOptions): IObjParsingInfo;
    abstract setProperty_CustomizedClass(owner: object | null, ownerInfo: IObjParsingInfo | null, key: string | number, options: ICustomClassOptions): IObjParsingInfo;
    abstract setProperty_ValueType(owner: object | null, ownerInfo: IObjParsingInfo | null, key: string | number, value: ValueType, options: PropertyOptions): IObjParsingInfo | null;
    abstract setProperty_TypedArray(owner: object, ownerInfo: IObjParsingInfo, key: string | number, value: any, options: PropertyOptions): void;
    abstract setProperty_AssetUuid(owner: object, ownerInfo: IObjParsingInfo, key: string | number, uuid: string, options: PropertyOptions): void;
    abstract setProperty_Array(owner: object | null, ownerInfo: IObjParsingInfo | null, key: string | number, options: IArrayOptions): IObjParsingInfo;
    abstract setProperty_Dict(owner: object | null, ownerInfo: IObjParsingInfo | null, key: string | number, options: PropertyOptions): IObjParsingInfo;
    abstract setProperty_ParsedObject(ownerInfo: IObjParsingInfo, key: string | number, valueInfo: IObjParsingInfo, formerlySerializedAs: string | null): void;
    abstract setRoot(objInfo: IObjParsingInfo): void;
    dump(): object | string | CCON;
    protected abstract finalizeJsonPart(): any;
    protected get hasBinaryBuffer(): boolean;
    protected get mainBufferBuilder(): any;
    private stringify;
    private minify;
    private _useCCON;
    private _mainBufferBuilder;
    private _dumpAsJson;
    private _dumpAsCCON;
}
export interface IBuilderOptions {
    builder?: 'dynamic' | 'compiled';
    stringify?: boolean;
    minify?: boolean;
    noNativeDep?: boolean;
    forceInline?: boolean;
    /**
     * Outputs as CCON.
     *
     * CCON denotes `Cocos Creator Object Notation`(let's imagine JSON as JavaScript Object Notation).
     * It allows binary representation of some value but loses the readability.
     *
     * CCON can be represented as two formal:
     * - JSON + Binary file(s)
     * - Single Binary file
     * However `serialize()` produces whole `CCON` and you could select a suitable formal.
     * As Cocos Creator 3.3, the `useCCON` only be turned on
     * when it's going to serialize `AnimationClip` into library or into production.
     */
    useCCON?: boolean;
}
