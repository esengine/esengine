/**
 * @zh NavMesh 路径规划器适配器
 * @en NavMesh Path Planner Adapter
 *
 * @zh 将现有 NavMesh 适配到 IPathPlanner 接口
 * @en Adapts existing NavMesh to IPathPlanner interface
 */

import type { IPathPlanner, IPathPlanResult, IPathPlanOptions, IVector2 } from '../interfaces/IPathPlanner';
import type { NavMesh } from '../navmesh/NavMesh';
import { EMPTY_PLAN_RESULT } from '../interfaces/IPathPlanner';

/**
 * @zh NavMesh 路径规划器适配器
 * @en NavMesh path planner adapter
 *
 * @example
 * ```typescript
 * const navMesh = createNavMesh();
 * navMesh.addPolygon([...]);
 * navMesh.build();
 *
 * const planner = createNavMeshPathPlanner(navMesh);
 * const result = planner.findPath({ x: 0, y: 0 }, { x: 100, y: 100 });
 * ```
 */
export class NavMeshPathPlannerAdapter implements IPathPlanner {
    readonly type = 'navmesh';

    constructor(private readonly navMesh: NavMesh) {}

    findPath(start: IVector2, end: IVector2, options?: IPathPlanOptions): IPathPlanResult {
        const result = this.navMesh.findPathWithObstacles(
            start.x, start.y,
            end.x, end.y,
            options ? { agentRadius: options.agentRadius } : undefined
        );

        if (!result.found) {
            return EMPTY_PLAN_RESULT;
        }

        return {
            found: true,
            path: result.path.map(p => ({ x: p.x, y: p.y })),
            cost: result.cost,
            nodesSearched: result.nodesSearched
        };
    }

    isWalkable(position: IVector2): boolean {
        return this.navMesh.isWalkable(position.x, position.y);
    }

    getNearestWalkable(position: IVector2): IVector2 | null {
        const polygon = this.navMesh.findPolygonAt(position.x, position.y);
        if (polygon) {
            return { x: position.x, y: position.y };
        }

        const polygons = this.navMesh.getPolygons();
        if (polygons.length === 0) {
            return null;
        }

        let nearestDist = Infinity;
        let nearestPoint: IVector2 | null = null;

        for (const poly of polygons) {
            const dx = poly.center.x - position.x;
            const dy = poly.center.y - position.y;
            const dist = dx * dx + dy * dy;

            if (dist < nearestDist) {
                nearestDist = dist;
                nearestPoint = { x: poly.center.x, y: poly.center.y };
            }
        }

        return nearestPoint;
    }

    clear(): void {
        // NavMesh manages its own state
    }

    dispose(): void {
        // NavMesh lifecycle managed externally
    }
}

/**
 * @zh 创建 NavMesh 路径规划器
 * @en Create NavMesh path planner
 *
 * @param navMesh - @zh NavMesh 实例 @en NavMesh instance
 * @returns @zh 路径规划器 @en Path planner
 *
 * @example
 * ```typescript
 * const planner = createNavMeshPathPlanner(navMesh);
 * navSystem.setPathPlanner(planner);
 * ```
 */
export function createNavMeshPathPlanner(navMesh: NavMesh): IPathPlanner {
    return new NavMeshPathPlannerAdapter(navMesh);
}
