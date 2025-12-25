/**
 * @zh 空间查询服务令牌
 * @en Spatial Query Service Tokens
 */

import { createServiceToken } from '@esengine/ecs-framework';
import type { ISpatialIndex, ISpatialQuery } from './ISpatialQuery';

/**
 * @zh 空间索引服务令牌
 * @en Spatial index service token
 *
 * @zh 用于注入空间索引服务
 * @en Used for injecting spatial index service
 */
export const SpatialIndexToken = createServiceToken<ISpatialIndex<unknown>>('spatialIndex');

/**
 * @zh 空间查询服务令牌
 * @en Spatial query service token
 *
 * @zh 用于注入空间查询服务（只读）
 * @en Used for injecting spatial query service (read-only)
 */
export const SpatialQueryToken = createServiceToken<ISpatialQuery<unknown>>('spatialQuery');
