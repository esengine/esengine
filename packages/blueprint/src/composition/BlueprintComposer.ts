/**
 * @zh 蓝图组合器接口和实现
 * @en Blueprint Composer Interface and Implementation
 *
 * @zh 将多个蓝图片段组合成一个完整的蓝图
 * @en Composes multiple blueprint fragments into a complete blueprint
 */

import type { BlueprintAsset, BlueprintVariable } from '../types/blueprint';
import type { BlueprintNode, BlueprintConnection } from '../types/nodes';
import type { IBlueprintFragment } from './BlueprintFragment';

// =============================================================================
// 槽位定义 | Slot Definition
// =============================================================================

/**
 * @zh 片段槽位
 * @en Fragment slot
 *
 * @zh 组合器中放置片段的位置
 * @en A position in the composer where a fragment is placed
 */
export interface FragmentSlot {
    /**
     * @zh 槽位 ID
     * @en Slot ID
     */
    readonly id: string;

    /**
     * @zh 槽位名称
     * @en Slot name
     */
    readonly name: string;

    /**
     * @zh 放置的片段
     * @en Placed fragment
     */
    readonly fragment: IBlueprintFragment;

    /**
     * @zh 在组合图中的位置偏移
     * @en Position offset in the composed graph
     */
    readonly position: { x: number; y: number };
}

/**
 * @zh 槽位间连接
 * @en Connection between slots
 */
export interface SlotConnection {
    /**
     * @zh 连接 ID
     * @en Connection ID
     */
    readonly id: string;

    /**
     * @zh 源槽位 ID
     * @en Source slot ID
     */
    readonly fromSlotId: string;

    /**
     * @zh 源引脚名称
     * @en Source pin name
     */
    readonly fromPin: string;

    /**
     * @zh 目标槽位 ID
     * @en Target slot ID
     */
    readonly toSlotId: string;

    /**
     * @zh 目标引脚名称
     * @en Target pin name
     */
    readonly toPin: string;
}

// =============================================================================
// 组合器接口 | Composer Interface
// =============================================================================

/**
 * @zh 蓝图组合器接口
 * @en Blueprint composer interface
 *
 * @zh 用于将多个蓝图片段组合成一个完整蓝图
 * @en Used to compose multiple blueprint fragments into a complete blueprint
 */
export interface IBlueprintComposer {
    /**
     * @zh 组合器名称
     * @en Composer name
     */
    readonly name: string;

    /**
     * @zh 获取所有槽位
     * @en Get all slots
     */
    getSlots(): FragmentSlot[];

    /**
     * @zh 获取所有连接
     * @en Get all connections
     */
    getConnections(): SlotConnection[];

    /**
     * @zh 添加片段到槽位
     * @en Add fragment to slot
     *
     * @param fragment - @zh 蓝图片段 @en Blueprint fragment
     * @param slotId - @zh 槽位 ID @en Slot ID
     * @param options - @zh 选项 @en Options
     */
    addFragment(
        fragment: IBlueprintFragment,
        slotId: string,
        options?: {
            name?: string;
            position?: { x: number; y: number };
        }
    ): void;

    /**
     * @zh 移除槽位
     * @en Remove slot
     *
     * @param slotId - @zh 槽位 ID @en Slot ID
     */
    removeSlot(slotId: string): void;

    /**
     * @zh 连接两个槽位的引脚
     * @en Connect pins between two slots
     *
     * @param fromSlotId - @zh 源槽位 ID @en Source slot ID
     * @param fromPin - @zh 源引脚名称 @en Source pin name
     * @param toSlotId - @zh 目标槽位 ID @en Target slot ID
     * @param toPin - @zh 目标引脚名称 @en Target pin name
     */
    connect(
        fromSlotId: string,
        fromPin: string,
        toSlotId: string,
        toPin: string
    ): void;

    /**
     * @zh 断开连接
     * @en Disconnect
     *
     * @param connectionId - @zh 连接 ID @en Connection ID
     */
    disconnect(connectionId: string): void;

    /**
     * @zh 验证组合是否有效
     * @en Validate if the composition is valid
     */
    validate(): CompositionValidationResult;

    /**
     * @zh 编译成蓝图资产
     * @en Compile into blueprint asset
     */
    compile(): BlueprintAsset;

    /**
     * @zh 清空组合器
     * @en Clear the composer
     */
    clear(): void;
}

// =============================================================================
// 验证结果 | Validation Result
// =============================================================================

/**
 * @zh 组合验证结果
 * @en Composition validation result
 */
export interface CompositionValidationResult {
    /**
     * @zh 是否有效
     * @en Whether valid
     */
    readonly isValid: boolean;

    /**
     * @zh 错误列表
     * @en Error list
     */
    readonly errors: CompositionError[];

    /**
     * @zh 警告列表
     * @en Warning list
     */
    readonly warnings: CompositionWarning[];
}

/**
 * @zh 组合错误
 * @en Composition error
 */
export interface CompositionError {
    readonly type: 'missing-connection' | 'type-mismatch' | 'cycle-detected' | 'invalid-slot';
    readonly message: string;
    readonly slotId?: string;
    readonly pinName?: string;
}

/**
 * @zh 组合警告
 * @en Composition warning
 */
export interface CompositionWarning {
    readonly type: 'unused-output' | 'unconnected-input';
    readonly message: string;
    readonly slotId?: string;
    readonly pinName?: string;
}

// =============================================================================
// 组合器实现 | Composer Implementation
// =============================================================================

/**
 * @zh 蓝图组合器实现
 * @en Blueprint composer implementation
 */
export class BlueprintComposer implements IBlueprintComposer {
    readonly name: string;

    private slots: Map<string, FragmentSlot> = new Map();
    private connections: Map<string, SlotConnection> = new Map();
    private connectionIdCounter = 0;

    constructor(name: string) {
        this.name = name;
    }

    getSlots(): FragmentSlot[] {
        return Array.from(this.slots.values());
    }

    getConnections(): SlotConnection[] {
        return Array.from(this.connections.values());
    }

    addFragment(
        fragment: IBlueprintFragment,
        slotId: string,
        options?: {
            name?: string;
            position?: { x: number; y: number };
        }
    ): void {
        if (this.slots.has(slotId)) {
            throw new Error(`Slot '${slotId}' already exists`);
        }

        const slot: FragmentSlot = {
            id: slotId,
            name: options?.name ?? fragment.name,
            fragment,
            position: options?.position ?? { x: 0, y: 0 }
        };

        this.slots.set(slotId, slot);
    }

    removeSlot(slotId: string): void {
        if (!this.slots.has(slotId)) {
            return;
        }

        // Remove all connections involving this slot
        const toRemove: string[] = [];
        for (const [id, conn] of this.connections) {
            if (conn.fromSlotId === slotId || conn.toSlotId === slotId) {
                toRemove.push(id);
            }
        }
        for (const id of toRemove) {
            this.connections.delete(id);
        }

        this.slots.delete(slotId);
    }

    connect(
        fromSlotId: string,
        fromPin: string,
        toSlotId: string,
        toPin: string
    ): void {
        const fromSlot = this.slots.get(fromSlotId);
        const toSlot = this.slots.get(toSlotId);

        if (!fromSlot) {
            throw new Error(`Source slot '${fromSlotId}' not found`);
        }
        if (!toSlot) {
            throw new Error(`Target slot '${toSlotId}' not found`);
        }

        const fromPinDef = fromSlot.fragment.outputs.find(p => p.name === fromPin);
        const toPinDef = toSlot.fragment.inputs.find(p => p.name === toPin);

        if (!fromPinDef) {
            throw new Error(`Output pin '${fromPin}' not found in slot '${fromSlotId}'`);
        }
        if (!toPinDef) {
            throw new Error(`Input pin '${toPin}' not found in slot '${toSlotId}'`);
        }

        const connectionId = `conn_${++this.connectionIdCounter}`;

        const connection: SlotConnection = {
            id: connectionId,
            fromSlotId,
            fromPin,
            toSlotId,
            toPin
        };

        this.connections.set(connectionId, connection);
    }

    disconnect(connectionId: string): void {
        this.connections.delete(connectionId);
    }

    validate(): CompositionValidationResult {
        const errors: CompositionError[] = [];
        const warnings: CompositionWarning[] = [];

        // Check for required inputs without connections
        for (const slot of this.slots.values()) {
            for (const input of slot.fragment.inputs) {
                const hasConnection = Array.from(this.connections.values()).some(
                    c => c.toSlotId === slot.id && c.toPin === input.name
                );

                if (!hasConnection && input.defaultValue === undefined) {
                    warnings.push({
                        type: 'unconnected-input',
                        message: `Input '${input.name}' in slot '${slot.id}' is not connected`,
                        slotId: slot.id,
                        pinName: input.name
                    });
                }
            }

            // Check for unused outputs
            for (const output of slot.fragment.outputs) {
                const hasConnection = Array.from(this.connections.values()).some(
                    c => c.fromSlotId === slot.id && c.fromPin === output.name
                );

                if (!hasConnection) {
                    warnings.push({
                        type: 'unused-output',
                        message: `Output '${output.name}' in slot '${slot.id}' is not connected`,
                        slotId: slot.id,
                        pinName: output.name
                    });
                }
            }
        }

        // Check type compatibility
        for (const conn of this.connections.values()) {
            const fromSlot = this.slots.get(conn.fromSlotId);
            const toSlot = this.slots.get(conn.toSlotId);

            if (!fromSlot || !toSlot) {
                errors.push({
                    type: 'invalid-slot',
                    message: `Invalid slot reference in connection '${conn.id}'`
                });
                continue;
            }

            const fromPinDef = fromSlot.fragment.outputs.find(p => p.name === conn.fromPin);
            const toPinDef = toSlot.fragment.inputs.find(p => p.name === conn.toPin);

            if (fromPinDef && toPinDef && fromPinDef.type !== toPinDef.type) {
                if (fromPinDef.type !== 'any' && toPinDef.type !== 'any') {
                    errors.push({
                        type: 'type-mismatch',
                        message: `Type mismatch: '${fromPinDef.type}' -> '${toPinDef.type}' in connection '${conn.id}'`
                    });
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    compile(): BlueprintAsset {
        const nodes: BlueprintNode[] = [];
        const connections: BlueprintConnection[] = [];
        const variables: BlueprintVariable[] = [];

        const nodeIdMap = new Map<string, Map<string, string>>();

        // Copy nodes from each fragment with new IDs
        let nodeIdCounter = 0;
        for (const slot of this.slots.values()) {
            const slotNodeMap = new Map<string, string>();
            nodeIdMap.set(slot.id, slotNodeMap);

            for (const node of slot.fragment.graph.nodes) {
                const newNodeId = `node_${++nodeIdCounter}`;
                slotNodeMap.set(node.id, newNodeId);

                nodes.push({
                    ...node,
                    id: newNodeId,
                    position: {
                        x: node.position.x + slot.position.x,
                        y: node.position.y + slot.position.y
                    }
                });
            }

            // Copy internal connections
            for (const conn of slot.fragment.graph.connections) {
                const newFromId = slotNodeMap.get(conn.fromNodeId);
                const newToId = slotNodeMap.get(conn.toNodeId);

                if (newFromId && newToId) {
                    connections.push({
                        ...conn,
                        id: `conn_internal_${connections.length}`,
                        fromNodeId: newFromId,
                        toNodeId: newToId
                    });
                }
            }

            // Copy variables (with slot prefix to avoid conflicts)
            for (const variable of slot.fragment.graph.variables) {
                variables.push({
                    ...variable,
                    name: `${slot.id}_${variable.name}`
                });
            }
        }

        // Create connections between slots based on exposed pins
        for (const slotConn of this.connections.values()) {
            const fromSlot = this.slots.get(slotConn.fromSlotId);
            const toSlot = this.slots.get(slotConn.toSlotId);

            if (!fromSlot || !toSlot) continue;

            const fromPinDef = fromSlot.fragment.outputs.find(p => p.name === slotConn.fromPin);
            const toPinDef = toSlot.fragment.inputs.find(p => p.name === slotConn.toPin);

            if (!fromPinDef || !toPinDef) continue;

            const fromNodeMap = nodeIdMap.get(slotConn.fromSlotId);
            const toNodeMap = nodeIdMap.get(slotConn.toSlotId);

            if (!fromNodeMap || !toNodeMap) continue;

            const fromNodeId = fromNodeMap.get(fromPinDef.internalNodeId);
            const toNodeId = toNodeMap.get(toPinDef.internalNodeId);

            if (fromNodeId && toNodeId) {
                connections.push({
                    id: `conn_slot_${connections.length}`,
                    fromNodeId,
                    fromPin: fromPinDef.internalPinName,
                    toNodeId,
                    toPin: toPinDef.internalPinName
                });
            }
        }

        return {
            version: 1,
            type: 'blueprint',
            metadata: {
                name: this.name,
                description: `Composed from ${this.slots.size} fragments`,
                createdAt: Date.now(),
                modifiedAt: Date.now()
            },
            variables,
            nodes,
            connections
        };
    }

    clear(): void {
        this.slots.clear();
        this.connections.clear();
        this.connectionIdCounter = 0;
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建蓝图组合器
 * @en Create blueprint composer
 */
export function createComposer(name: string): IBlueprintComposer {
    return new BlueprintComposer(name);
}

// =============================================================================
// 组合资产格式 | Composition Asset Format
// =============================================================================

/**
 * @zh 蓝图组合资产格式
 * @en Blueprint composition asset format
 */
export interface BlueprintCompositionAsset {
    /**
     * @zh 格式版本
     * @en Format version
     */
    version: number;

    /**
     * @zh 资产类型标识
     * @en Asset type identifier
     */
    type: 'blueprint-composition';

    /**
     * @zh 组合名称
     * @en Composition name
     */
    name: string;

    /**
     * @zh 槽位数据
     * @en Slot data
     */
    slots: Array<{
        id: string;
        name: string;
        fragmentId: string;
        position: { x: number; y: number };
    }>;

    /**
     * @zh 连接数据
     * @en Connection data
     */
    connections: SlotConnection[];
}
