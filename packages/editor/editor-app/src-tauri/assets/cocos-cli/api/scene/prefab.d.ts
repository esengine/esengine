import { CommonResultType } from '../base/schema-base';
import { TNode } from './node-schema';
import { TApplyPrefabChangesOptions, TApplyPrefabChangesResult, TCreatePrefabFromNodeOptions, TGetPrefabInfoParams, TGetPrefabResult, TIsPrefabInstanceOptions, TIsPrefabInstanceResult, TRevertToPrefabOptions, TRevertToPrefabResult, TUnpackPrefabInstanceOptions } from './prefab-schema';
export declare class PrefabApi {
    createPrefabFromNode(options: TCreatePrefabFromNodeOptions): Promise<CommonResultType<TNode>>;
    applyPrefabChanges(options: TApplyPrefabChangesOptions): Promise<CommonResultType<TApplyPrefabChangesResult>>;
    revertToPrefab(options: TRevertToPrefabOptions): Promise<CommonResultType<TRevertToPrefabResult>>;
    unpackPrefabInstance(options: TUnpackPrefabInstanceOptions): Promise<CommonResultType<TNode>>;
    isPrefabInstance(options: TIsPrefabInstanceOptions): Promise<CommonResultType<TIsPrefabInstanceResult>>;
    getPrefabInfo(options: TGetPrefabInfoParams): Promise<CommonResultType<TGetPrefabResult>>;
}
