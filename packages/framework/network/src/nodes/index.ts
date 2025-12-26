/**
 * @zh 网络蓝图节点模块
 * @en Network Blueprint Nodes Module
 *
 * @zh 提供网络功能的蓝图节点
 * @en Provides blueprint nodes for network functionality
 */

export {
    // Templates
    IsLocalPlayerTemplate,
    IsServerTemplate,
    HasAuthorityTemplate,
    GetNetworkIdTemplate,
    GetLocalPlayerIdTemplate,
    // Executors
    IsLocalPlayerExecutor,
    IsServerExecutor,
    HasAuthorityExecutor,
    GetNetworkIdExecutor,
    GetLocalPlayerIdExecutor,
    // Collection
    NetworkNodeDefinitions
} from './NetworkNodes';
