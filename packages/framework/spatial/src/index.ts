/**
 * @zh @esengine/spatial - 空间查询和索引系统
 * @en @esengine/spatial - Spatial Query and Indexing System
 *
 * @zh 提供空间查询能力，支持范围查询、最近邻查询、射线检测和 AOI 兴趣区域管理
 * @en Provides spatial query capabilities including range queries, nearest neighbor queries, raycasting, and AOI management
 */

// =============================================================================
// 接口和类型 | Interfaces and Types
// =============================================================================

export type {
    IBounds,
    IPositionable,
    IBoundable,
    IRaycastHit,
    SpatialFilter,
    ISpatialQuery,
    ISpatialIndex
} from './ISpatialQuery';

export {
    createBounds,
    createBoundsFromCenter,
    createBoundsFromCircle,
    isPointInBounds,
    boundsIntersect,
    boundsIntersectsCircle,
    distanceSquared,
    distance
} from './ISpatialQuery';

// =============================================================================
// 实现 | Implementations
// =============================================================================

export type { GridSpatialIndexConfig } from './GridSpatialIndex';
export { GridSpatialIndex, createGridSpatialIndex } from './GridSpatialIndex';

// =============================================================================
// AOI 兴趣区域 | AOI (Area of Interest)
// =============================================================================

export type {
    AOIEventType,
    IAOIEvent,
    AOIEventListener,
    IAOIObserverConfig,
    IAOIManager
} from './aoi';

export type { GridAOIConfig } from './aoi';
export { GridAOI, createGridAOI } from './aoi';

// =============================================================================
// 服务令牌 | Service Tokens
// =============================================================================

export { SpatialIndexToken, SpatialQueryToken, AOIManagerToken } from './tokens';

// =============================================================================
// 蓝图节点 | Blueprint Nodes
// =============================================================================

export {
    // Spatial Query Templates
    FindInRadiusTemplate,
    FindInRectTemplate,
    FindNearestTemplate,
    FindKNearestTemplate,
    RaycastTemplate,
    RaycastFirstTemplate,
    // Spatial Query Executors
    FindInRadiusExecutor,
    FindInRectExecutor,
    FindNearestExecutor,
    FindKNearestExecutor,
    RaycastExecutor,
    RaycastFirstExecutor,
    // Collection
    SpatialQueryNodeDefinitions
} from './nodes';

export {
    // AOI Templates
    GetEntitiesInViewTemplate,
    GetObserversOfTemplate,
    CanSeeTemplate,
    OnEntityEnterViewTemplate,
    OnEntityExitViewTemplate,
    // AOI Executors
    GetEntitiesInViewExecutor,
    GetObserversOfExecutor,
    CanSeeExecutor,
    OnEntityEnterViewExecutor,
    OnEntityExitViewExecutor,
    // Collection
    AOINodeDefinitions
} from './aoi/AOINodes';
