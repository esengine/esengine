import { TNodeDetail, TNodeUpdateResult, TNodeDeleteResult, TCreateNodeByAssetOptions, TCreateNodeByTypeOptions, TUpdateNodeOptions, TQueryNodeOptions, TDeleteNodeOptions } from './node-schema';
import { CommonResultType } from '../base/schema-base';
export declare class NodeApi {
    /**
     * Create Node // 创建节点
     */
    createNodeByType(options: TCreateNodeByTypeOptions): Promise<CommonResultType<TNodeDetail>>;
    /**
     * Create Node // 创建节点
     */
    createNodeByAsset(options: TCreateNodeByAssetOptions): Promise<CommonResultType<TNodeDetail>>;
    /**
     * Delete Node // 删除节点
     */
    deleteNode(options: TDeleteNodeOptions): Promise<CommonResultType<TNodeDeleteResult>>;
    /**
     * Update Node // 更新节点
     */
    updateNode(options: TUpdateNodeOptions): Promise<CommonResultType<TNodeUpdateResult>>;
    /**
    * Query Node // 查询节点
    */
    queryNode(options: TQueryNodeOptions): Promise<CommonResultType<TNodeDetail>>;
}
