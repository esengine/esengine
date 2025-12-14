/**
 * 系统依赖图
 *
 * 用于构建系统间的依赖关系并进行拓扑排序。
 * 支持 before/after 依赖声明和 set 分组。
 *
 * System dependency graph.
 * Used to build dependency relationships between systems and perform topological sorting.
 * Supports before/after dependencies and set grouping.
 */

/**
 * 循环依赖错误
 * Cycle dependency error
 */
export class CycleDependencyError extends Error {
    /**
     * 参与循环的节点 ID
     * Node IDs involved in the cycle
     */
    public readonly involvedNodes: string[];

    constructor(involvedNodes: string[]) {
        const message = `[SystemDependencyGraph] 检测到循环依赖 | Cycle dependency detected: ${involvedNodes.join(' -> ')}`;
        super(message);
        this.name = 'CycleDependencyError';
        this.involvedNodes = involvedNodes;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * 依赖图节点
 * Dependency graph node
 */
interface GraphNode {
    /** 节点 ID | Node ID */
    id: string;
    /** 是否为虚拟集合节点 | Whether this is a virtual set node */
    bIsVirtual: boolean;
    /** 入边（依赖于此节点的节点） | Incoming edges (nodes that depend on this node) */
    inEdges: Set<string>;
    /** 出边（此节点依赖的节点） | Outgoing edges (nodes this node depends on) */
    outEdges: Set<string>;
}

/**
 * 系统依赖信息
 * System dependency info
 */
export interface SystemDependencyInfo {
    /** 系统名称 | System name */
    name: string;
    /** 在这些系统之前执行 | Execute before these systems */
    before: string[];
    /** 在这些系统之后执行 | Execute after these systems */
    after: string[];
    /** 所属集合 | Sets this system belongs to */
    sets: string[];
}

/** 集合前缀 | Set prefix */
const SET_PREFIX = 'set:';

/**
 * 系统依赖图
 *
 * 使用 Kahn 算法进行拓扑排序，检测循环依赖。
 *
 * System dependency graph.
 * Uses Kahn's algorithm for topological sorting and cycle detection.
 */
export class SystemDependencyGraph {
    /** 节点映射 | Node map */
    private _nodes: Map<string, GraphNode> = new Map();

    /**
     * 添加系统节点
     * Add system node
     *
     * @param name 系统名称 | System name
     */
    public addSystemNode(name: string): void {
        this.getOrCreateNode(name, false);
    }

    /**
     * 添加集合节点（虚拟节点）
     * Add set node (virtual node)
     *
     * @param setName 集合名称 | Set name
     */
    public addSetNode(setName: string): void {
        const nodeId = SET_PREFIX + setName;
        this.getOrCreateNode(nodeId, true);
    }

    /**
     * 添加依赖边
     * Add dependency edge
     *
     * @param from 起始节点 | Source node
     * @param to 目标节点 | Target node
     */
    public addEdge(from: string, to: string): void {
        if (from === to) return;

        const fromNode = this.getOrCreateNode(from, from.startsWith(SET_PREFIX));
        const toNode = this.getOrCreateNode(to, to.startsWith(SET_PREFIX));

        fromNode.outEdges.add(to);
        toNode.inEdges.add(from);
    }

    /**
     * 从系统依赖信息构建图
     * Build graph from system dependency info
     *
     * @param systems 系统依赖信息列表 | System dependency info list
     */
    public buildFromSystems(systems: SystemDependencyInfo[]): void {
        this.clear();

        // 1. 添加所有系统节点
        for (const sys of systems) {
            this.addSystemNode(sys.name);

            // 添加集合节点
            for (const setName of sys.sets) {
                this.addSetNode(setName);
            }
        }

        // 2. 添加边
        for (const sys of systems) {
            // 集合 -> 系统（系统属于集合，集合执行后系统执行）
            for (const setName of sys.sets) {
                const setId = SET_PREFIX + setName;
                this.addEdge(setId, sys.name);
            }

            // before: 此系统 -> 目标（此系统先执行）
            for (const target of sys.before) {
                const targetId = this.resolveTargetId(target);
                this.addEdge(sys.name, targetId);
            }

            // after: 目标 -> 此系统（目标先执行）
            for (const target of sys.after) {
                const targetId = this.resolveTargetId(target);
                this.addEdge(targetId, sys.name);
            }
        }
    }

    /**
     * 执行拓扑排序（Kahn 算法）
     * Perform topological sort (Kahn's algorithm)
     *
     * @returns 排序后的系统名称列表（不包含虚拟节点） | Sorted system names (excluding virtual nodes)
     * @throws {CycleDependencyError} 如果存在循环依赖 | If cycle dependency detected
     */
    public topologicalSort(): string[] {
        // 复制入边计数（避免修改原始数据）
        const inDegree = new Map<string, number>();
        for (const [id, node] of this._nodes) {
            inDegree.set(id, node.inEdges.size);
        }

        // 初始化队列：入度为 0 的节点
        const queue: string[] = [];
        for (const [id, degree] of inDegree) {
            if (degree === 0) {
                queue.push(id);
            }
        }

        const result: string[] = [];
        let processedCount = 0;

        while (queue.length > 0) {
            const nodeId = queue.shift()!;
            processedCount++;

            const node = this._nodes.get(nodeId);
            if (!node) continue;

            // 只添加非虚拟节点到结果
            if (!node.bIsVirtual) {
                result.push(nodeId);
            }

            // 减少所有出边目标的入度
            for (const outId of node.outEdges) {
                const newDegree = (inDegree.get(outId) ?? 0) - 1;
                inDegree.set(outId, newDegree);

                if (newDegree === 0) {
                    queue.push(outId);
                }
            }
        }

        // 检测循环：如果处理的节点数少于总节点数，说明存在循环
        if (processedCount < this._nodes.size) {
            const cycleNodes: string[] = [];
            for (const [id, degree] of inDegree) {
                if (degree > 0) {
                    cycleNodes.push(id);
                }
            }
            throw new CycleDependencyError(cycleNodes);
        }

        return result;
    }

    /**
     * 清空图
     * Clear graph
     */
    public clear(): void {
        this._nodes.clear();
    }

    /**
     * 获取节点数量
     * Get node count
     */
    public get size(): number {
        return this._nodes.size;
    }

    /**
     * 获取或创建节点
     * Get or create node
     */
    private getOrCreateNode(id: string, bIsVirtual: boolean): GraphNode {
        let node = this._nodes.get(id);
        if (!node) {
            node = {
                id,
                bIsVirtual,
                inEdges: new Set(),
                outEdges: new Set()
            };
            this._nodes.set(id, node);
        }
        return node;
    }

    /**
     * 解析目标 ID（支持 set: 前缀）
     * Resolve target ID (supports set: prefix)
     */
    private resolveTargetId(nameOrSet: string): string {
        // 如果已经有 set: 前缀，直接返回
        if (nameOrSet.startsWith(SET_PREFIX)) {
            return nameOrSet;
        }
        return nameOrSet;
    }
}
