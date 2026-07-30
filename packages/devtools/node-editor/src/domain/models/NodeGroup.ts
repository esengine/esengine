import { Position } from '../value-objects/Position';

/**
 * NodeGroup - Represents a visual group box around nodes
 * NodeGroup - 表示节点周围的可视化组框
 *
 * Groups are purely visual organization - they don't affect runtime execution.
 * 组是纯视觉组织 - 不影响运行时执行。
 */
export interface NodeGroup {
    /** Unique identifier for the group */
    id: string;

    /** Display name of the group */
    name: string;

    /** IDs of nodes contained in this group */
    nodeIds: string[];

    /** Position of the group box (top-left corner) */
    position: Position;

    /** Size of the group box */
    size: { width: number; height: number };

    /** Optional color for the group box */
    color?: string;
}

/**
 * Creates a new NodeGroup with the given properties
 */
export function createNodeGroup(
    id: string,
    name: string,
    nodeIds: string[],
    position: Position,
    size: { width: number; height: number },
    color?: string
): NodeGroup {
    return {
        id,
        name,
        nodeIds: [...nodeIds],
        position,
        size,
        color
    };
}

/**
 * Node bounds info for group calculation
 * 用于组计算的节点边界信息
 */
export interface NodeBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Estimates node height based on pin count
 * 根据引脚数量估算节点高度
 */
export function estimateNodeHeight(inputPinCount: number, outputPinCount: number, isCollapsed: boolean = false): number {
    if (isCollapsed) {
        return 32; // Just header
    }
    const headerHeight = 32;
    const pinHeight = 26;
    const bottomPadding = 12;
    const maxPins = Math.max(inputPinCount, outputPinCount);
    return headerHeight + maxPins * pinHeight + bottomPadding;
}

/**
 * Computes the bounding box for a group based on its nodes
 * Returns position (top-left) and size with padding
 *
 * @param nodeBounds - Array of node bounds (position + size)
 * @param padding - Padding around the group box
 */
export function computeGroupBounds(
    nodeBounds: NodeBounds[],
    padding: number = 30
): { position: Position; size: { width: number; height: number } } {
    if (nodeBounds.length === 0) {
        return {
            position: new Position(0, 0),
            size: { width: 250, height: 150 }
        };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of nodeBounds) {
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + node.width);
        maxY = Math.max(maxY, node.y + node.height);
    }

    // Add padding and header space for group title
    const groupHeaderHeight = 28;
    return {
        position: new Position(minX - padding, minY - padding - groupHeaderHeight),
        size: {
            width: maxX - minX + padding * 2,
            height: maxY - minY + padding * 2 + groupHeaderHeight
        }
    };
}

/**
 * Serializes a NodeGroup for JSON storage
 */
export function serializeNodeGroup(group: NodeGroup): Record<string, unknown> {
    return {
        id: group.id,
        name: group.name,
        nodeIds: [...group.nodeIds],
        position: { x: group.position.x, y: group.position.y },
        size: { width: group.size.width, height: group.size.height },
        color: group.color
    };
}

/**
 * Deserializes a NodeGroup from JSON
 */
export function deserializeNodeGroup(data: Record<string, unknown>): NodeGroup {
    const pos = data.position as { x: number; y: number } | undefined;
    const size = data.size as { width: number; height: number } | undefined;
    return {
        id: data.id as string,
        name: data.name as string,
        nodeIds: (data.nodeIds as string[]) || [],
        position: new Position(pos?.x || 0, pos?.y || 0),
        size: size || { width: 250, height: 150 },
        color: data.color as string | undefined
    };
}
