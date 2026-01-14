import { TAssetUrlOrUUID, TCloseResult, TCreateOptions, TCreateResult, TCurrentResult, TOpenResult, TReload, TSaveResult } from './schema';
import { CommonResultType } from '../base/schema-base';
import { ComponentApi } from './component';
import { NodeApi } from './node';
import { PrefabApi } from './prefab';
export declare class SceneApi {
    component: ComponentApi;
    node: NodeApi;
    prefab: PrefabApi;
    constructor();
    queryCurrent(): Promise<CommonResultType<TCurrentResult>>;
    open(dbURLOrUUID: TAssetUrlOrUUID): Promise<CommonResultType<TOpenResult>>;
    close(): Promise<CommonResultType<TCloseResult>>;
    save(): Promise<CommonResultType<TSaveResult>>;
    createScene(options: TCreateOptions): Promise<CommonResultType<TCreateResult>>;
    reloadScene(): Promise<CommonResultType<TReload>>;
}
