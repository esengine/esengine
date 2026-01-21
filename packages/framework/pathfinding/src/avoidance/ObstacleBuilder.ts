/**
 * @zh 障碍物构建器
 * @en Obstacle Builder
 */

import type { IVector2 } from '@esengine/ecs-framework-math';
import type { IObstacle, IObstacleVertex } from './ILocalAvoidance';

const EPSILON = 0.00001;

/**
 * @zh 计算点相对于线段的位置（左侧判断）
 * @en Compute point position relative to line segment (left-of test)
 *
 * @zh 使用叉积判断点在向量的哪一侧
 * @en Use cross product to determine which side of the vector the point is on
 *
 * @zh 返回值 > 0 表示 p3 在向量 p1->p2 的左边
 * @en Returns > 0 if p3 is to the left of vector p1->p2
 */
function leftOf(p1: IVector2, p2: IVector2, p3: IVector2): number {
    return (p1.x - p3.x) * (p2.y - p1.y) - (p1.y - p3.y) * (p2.x - p1.x);
}

/**
 * @zh 从顶点数组创建障碍物链表
 * @en Create obstacle linked list from vertex array
 *
 * @param vertices - @zh 顶点数组（CCW 顺序）@en Vertex array (CCW order)
 * @param startId - @zh 起始顶点 ID @en Starting vertex ID
 */
export function createObstacleVertices(
    vertices: readonly IVector2[],
    startId: number = 0
): IObstacleVertex[] {
    const n = vertices.length;
    if (n < 2) {
        return [];
    }

    const obstacleVertices: IObstacleVertex[] = [];
    for (let i = 0; i < n; i++) {
        obstacleVertices.push({
            point: { x: vertices[i]!.x, y: vertices[i]!.y },
            direction: { x: 0, y: 0 },
            next: null as unknown as IObstacleVertex,
            previous: null as unknown as IObstacleVertex,
            isConvex: false,
            id: startId + i
        });
    }

    for (let i = 0; i < n; i++) {
        const curr = obstacleVertices[i]!;
        const next = obstacleVertices[(i + 1) % n]!;
        const prev = obstacleVertices[(i + n - 1) % n]!;

        curr.next = next;
        curr.previous = prev;

        const dx = next.point.x - curr.point.x;
        const dy = next.point.y - curr.point.y;
        const edgeLen = Math.sqrt(dx * dx + dy * dy);

        if (edgeLen > EPSILON) {
            curr.direction = { x: dx / edgeLen, y: dy / edgeLen };
        } else {
            curr.direction = { x: 1, y: 0 };
        }
    }

    for (let i = 0; i < n; i++) {
        const curr = obstacleVertices[i]!;
        const prev = curr.previous;
        const next = curr.next;
        curr.isConvex = leftOf(prev.point, curr.point, next.point) >= 0;
    }

    return obstacleVertices;
}

/**
 * @zh 构建障碍物顶点的选项
 * @en Options for building obstacle vertices
 */
export interface IBuildObstacleOptions {
    /**
     * @zh 是否使用 Y 轴向下的坐标系（如 Canvas/屏幕坐标）
     * @en Whether using Y-axis down coordinate system (like Canvas/screen coords)
     *
     * @zh 这会影响障碍物顶点顺序的判断
     * @en This affects obstacle vertex order detection
     *
     * @default false
     */
    yAxisDown?: boolean;
}

/**
 * @zh 从障碍物数组创建所有障碍物顶点
 * @en Create all obstacle vertices from obstacle array
 *
 * @zh 自动检测并纠正顶点顺序为 CCW（逆时针）
 * @en Automatically detects and corrects vertex order to CCW (counter-clockwise)
 *
 * @param obstacles - @zh 障碍物数组 @en Array of obstacles
 * @param options - @zh 构建选项 @en Build options
 */
export function buildObstacleVertices(
    obstacles: readonly IObstacle[],
    options: IBuildObstacleOptions = {}
): IObstacleVertex[] {
    const { yAxisDown = false } = options;
    const allVertices: IObstacleVertex[] = [];
    let nextId = 0;

    for (const obstacle of obstacles) {
        // @zh 自动确保顶点为 CCW 顺序
        // @en Automatically ensure vertices are in CCW order
        const ccwVertices = ensureCCW([...obstacle.vertices], yAxisDown);
        const vertices = createObstacleVertices(ccwVertices, nextId);
        allVertices.push(...vertices);
        nextId += vertices.length;
    }

    return allVertices;
}

/**
 * @zh 确保顶点按逆时针顺序排列
 * @en Ensure vertices are in counter-clockwise order
 */
export function ensureCCW(vertices: IVector2[], yAxisDown: boolean = false): IVector2[] {
    if (vertices.length < 3) {
        return vertices;
    }

    let signedArea = 0;
    for (let i = 0; i < vertices.length; i++) {
        const curr = vertices[i]!;
        const next = vertices[(i + 1) % vertices.length]!;
        signedArea += (curr.x * next.y - next.x * curr.y);
    }
    signedArea *= 0.5;

    const isCCW = yAxisDown ? signedArea < 0 : signedArea > 0;

    if (isCCW) {
        return vertices;
    }

    return [...vertices].reverse();
}
