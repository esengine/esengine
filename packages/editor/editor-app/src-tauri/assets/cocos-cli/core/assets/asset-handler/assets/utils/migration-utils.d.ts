import { Asset } from '@cocos/asset-db';
type TypedObjectVisitor = (serialized: any) => void;
export declare class Archive {
    constructor(data?: unknown);
    get root(): object;
    get(value?: object): unknown;
    addObject(): {};
    addTypedObject(typeName: string): object;
    visitTypedObject(className: string, visitor: TypedObjectVisitor): void;
    clearObject(object: object): void;
    private _root;
    private _originalData;
    private _proxyHandler;
    private _visitTypedObject;
}
export interface MigrationSwapSpace {
    json: unknown;
}
/**
 * version: 这个版本之前的 scene Handler 都会进行迁移
 * migrate: 在导入前执行的迁移的动作
 */
export declare const migrationHook: {
    pre(asset: Asset): Promise<void>;
    post(asset: Asset, num: number): Promise<void>;
};
export {};
