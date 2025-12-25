/**
 * @zh @esengine/spatial - 空间查询和索引系统
 * @en @esengine/spatial - Spatial Query and Indexing System
 *
 * @zh 提供空间查询能力，支持范围查询、最近邻查询和射线检测
 * @en Provides spatial query capabilities including range queries, nearest neighbor queries, and raycasting
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
// 服务令牌 | Service Tokens
// =============================================================================

export { SpatialIndexToken, SpatialQueryToken } from './tokens';
