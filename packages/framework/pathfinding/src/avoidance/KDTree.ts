/**
 * @zh KD-Tree 空间索引
 * @en KD-Tree Spatial Index
 *
 * @zh 用于快速查询指定范围内的邻近代理
 * @en Used for fast neighbor queries within specified range
 */

import type { IVector2 } from '@esengine/ecs-framework-math';
import type { IAvoidanceAgent, ISpatialIndex, INeighborResult } from './ILocalAvoidance';

// =============================================================================
// KD-Tree 节点 | KD-Tree Node
// =============================================================================

/**
 * @zh KD-Tree 节点
 * @en KD-Tree node
 */
interface KDTreeNode {
    /**
     * @zh 代理索引（叶节点）或分割维度（内部节点）
     * @en Agent index (leaf) or split dimension (internal node)
     */
    agentIndex: number;

    /**
     * @zh 分割值
     * @en Split value
     */
    splitValue: number;

    /**
     * @zh 左子节点索引
     * @en Left child index
     */
    left: number;

    /**
     * @zh 右子节点索引
     * @en Right child index
     */
    right: number;

    /**
     * @zh 子树中代理索引的起始位置
     * @en Start index of agents in subtree
     */
    begin: number;

    /**
     * @zh 子树中代理索引的结束位置
     * @en End index of agents in subtree
     */
    end: number;

    /**
     * @zh 边界框最小值
     * @en Bounding box minimum
     */
    minX: number;
    minY: number;

    /**
     * @zh 边界框最大值
     * @en Bounding box maximum
     */
    maxX: number;
    maxY: number;
}

// =============================================================================
// KD-Tree 实现 | KD-Tree Implementation
// =============================================================================

/**
 * @zh KD-Tree 空间索引
 * @en KD-Tree spatial index
 *
 * @zh 每帧重建，支持高效的范围查询
 * @en Rebuilt every frame, supports efficient range queries
 */
export class KDTree implements ISpatialIndex {
    private agents: IAvoidanceAgent[] = [];
    private agentIndices: number[] = [];
    private nodes: KDTreeNode[] = [];

    /**
     * @zh 最大叶节点大小
     * @en Maximum leaf size
     */
    private readonly maxLeafSize = 10;

    /**
     * @zh 构建 KD-Tree
     * @en Build KD-Tree
     */
    build(agents: readonly IAvoidanceAgent[]): void {
        this.agents = agents as IAvoidanceAgent[];
        this.agentIndices = [];
        this.nodes = [];

        if (agents.length === 0) {
            return;
        }

        // 初始化代理索引数组
        for (let i = 0; i < agents.length; i++) {
            this.agentIndices.push(i);
        }

        // 递归构建树
        this.buildRecursive(0, agents.length, 0);
    }

    /**
     * @zh 递归构建 KD-Tree
     * @en Recursively build KD-Tree
     */
    private buildRecursive(begin: number, end: number, depth: number): number {
        const nodeIndex = this.nodes.length;

        const node: KDTreeNode = {
            agentIndex: -1,
            splitValue: 0,
            left: -1,
            right: -1,
            begin,
            end,
            minX: Infinity,
            minY: Infinity,
            maxX: -Infinity,
            maxY: -Infinity
        };

        this.nodes.push(node);

        // 计算边界框
        for (let i = begin; i < end; i++) {
            const agent = this.agents[this.agentIndices[i]!]!;
            node.minX = Math.min(node.minX, agent.position.x);
            node.minY = Math.min(node.minY, agent.position.y);
            node.maxX = Math.max(node.maxX, agent.position.x);
            node.maxY = Math.max(node.maxY, agent.position.y);
        }

        const count = end - begin;

        if (count <= this.maxLeafSize) {
            // 叶节点
            return nodeIndex;
        }

        // 选择分割维度（交替使用 x 和 y）
        const splitDim = depth % 2;

        // 按分割维度排序
        if (splitDim === 0) {
            this.sortByX(begin, end);
        } else {
            this.sortByY(begin, end);
        }

        // 找到中点
        const mid = Math.floor((begin + end) / 2);
        const midAgent = this.agents[this.agentIndices[mid]!]!;
        node.splitValue = splitDim === 0 ? midAgent.position.x : midAgent.position.y;

        // 递归构建子树
        node.left = this.buildRecursive(begin, mid, depth + 1);
        node.right = this.buildRecursive(mid, end, depth + 1);

        return nodeIndex;
    }

    /**
     * @zh 按 X 坐标排序
     * @en Sort by X coordinate
     */
    private sortByX(begin: number, end: number): void {
        const indices = this.agentIndices;
        const agents = this.agents;

        for (let i = begin + 1; i < end; i++) {
            const key = indices[i]!;
            const keyX = agents[key]!.position.x;
            let j = i - 1;

            while (j >= begin && agents[indices[j]!]!.position.x > keyX) {
                indices[j + 1] = indices[j]!;
                j--;
            }
            indices[j + 1] = key;
        }
    }

    /**
     * @zh 按 Y 坐标排序
     * @en Sort by Y coordinate
     */
    private sortByY(begin: number, end: number): void {
        const indices = this.agentIndices;
        const agents = this.agents;

        for (let i = begin + 1; i < end; i++) {
            const key = indices[i]!;
            const keyY = agents[key]!.position.y;
            let j = i - 1;

            while (j >= begin && agents[indices[j]!]!.position.y > keyY) {
                indices[j + 1] = indices[j]!;
                j--;
            }
            indices[j + 1] = key;
        }
    }

    /**
     * @zh 查询邻居
     * @en Query neighbors
     */
    queryNeighbors(
        position: IVector2,
        radius: number,
        maxResults: number,
        excludeId?: number
    ): INeighborResult[] {
        const results: INeighborResult[] = [];
        const radiusSq = radius * radius;

        if (this.nodes.length === 0) {
            return results;
        }

        this.queryRecursive(0, position, radiusSq, maxResults, excludeId, results);

        // 按距离排序
        results.sort((a, b) => a.distanceSq - b.distanceSq);

        // 截取最大数量
        if (results.length > maxResults) {
            results.length = maxResults;
        }

        return results;
    }

    /**
     * @zh 递归查询
     * @en Recursive query
     */
    private queryRecursive(
        nodeIndex: number,
        position: IVector2,
        radiusSq: number,
        maxResults: number,
        excludeId: number | undefined,
        results: INeighborResult[]
    ): void {
        const node = this.nodes[nodeIndex];
        if (!node) return;

        // 检查边界框是否与查询圆相交
        const closestX = Math.max(node.minX, Math.min(position.x, node.maxX));
        const closestY = Math.max(node.minY, Math.min(position.y, node.maxY));
        const dx = position.x - closestX;
        const dy = position.y - closestY;
        const distSqToBBox = dx * dx + dy * dy;

        if (distSqToBBox > radiusSq) {
            return;
        }

        // 叶节点：检查所有代理
        if (node.left === -1 && node.right === -1) {
            for (let i = node.begin; i < node.end; i++) {
                const agentIndex = this.agentIndices[i]!;
                const agent = this.agents[agentIndex]!;

                if (excludeId !== undefined && agent.id === excludeId) {
                    continue;
                }

                const adx = position.x - agent.position.x;
                const ady = position.y - agent.position.y;
                const distSq = adx * adx + ady * ady;

                if (distSq < radiusSq) {
                    results.push({ agent, distanceSq: distSq });
                }
            }
            return;
        }

        // 递归查询子节点
        if (node.left !== -1) {
            this.queryRecursive(node.left, position, radiusSq, maxResults, excludeId, results);
        }
        if (node.right !== -1) {
            this.queryRecursive(node.right, position, radiusSq, maxResults, excludeId, results);
        }
    }

    /**
     * @zh 清空索引
     * @en Clear the index
     */
    clear(): void {
        this.agents = [];
        this.agentIndices = [];
        this.nodes = [];
    }

    /**
     * @zh 获取代理数量
     * @en Get agent count
     */
    get agentCount(): number {
        return this.agents.length;
    }
}

/**
 * @zh 创建 KD-Tree
 * @en Create KD-Tree
 */
export function createKDTree(): KDTree {
    return new KDTree();
}
