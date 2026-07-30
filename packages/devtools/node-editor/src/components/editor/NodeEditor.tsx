import React, { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { Graph } from '../../domain/models/Graph';
import { GraphNode, NodeTemplate } from '../../domain/models/GraphNode';
import { Connection } from '../../domain/models/Connection';
import { Pin } from '../../domain/models/Pin';
import { Position } from '../../domain/value-objects/Position';
import { NodeGroup, computeGroupBounds, estimateNodeHeight } from '../../domain/models/NodeGroup';
import { GraphCanvas } from '../canvas/GraphCanvas';
import { MemoizedGraphNodeComponent, NodeExecutionState } from '../nodes/GraphNodeComponent';
import { MemoizedGroupNodeComponent } from '../nodes/GroupNodeComponent';
import { ConnectionLayer } from '../connections/ConnectionLine';

/**
 * Node execution states map
 * 节点执行状态映射
 */
export type NodeExecutionStates = Map<string, NodeExecutionState>;

export interface NodeEditorProps {
    /** Graph data (图数据) */
    graph: Graph;

    /** Available node templates (可用的节点模板) */
    templates?: NodeTemplate[];

    /** Currently selected node IDs (当前选中的节点ID) */
    selectedNodeIds?: Set<string>;

    /** Currently selected connection IDs (当前选中的连接ID) */
    selectedConnectionIds?: Set<string>;

    /** Node execution states for visual feedback (节点执行状态用于视觉反馈) */
    executionStates?: NodeExecutionStates;

    /** Whether to animate exec connections (是否动画化执行连接) */
    animateExecConnections?: boolean;

    /** Read-only mode (只读模式) */
    readOnly?: boolean;

    /** Icon renderer (图标渲染器) */
    renderIcon?: (iconName: string) => React.ReactNode;

    /** Graph change callback (图变化回调) */
    onGraphChange?: (graph: Graph) => void;

    /** Selection change callback (选择变化回调) */
    onSelectionChange?: (nodeIds: Set<string>, connectionIds: Set<string>) => void;

    /** Node double click callback (节点双击回调) */
    onNodeDoubleClick?: (node: GraphNode) => void;

    /** Canvas context menu callback (画布右键菜单回调) */
    onCanvasContextMenu?: (position: Position, e: React.MouseEvent) => void;

    /** Node context menu callback (节点右键菜单回调) */
    onNodeContextMenu?: (node: GraphNode, e: React.MouseEvent) => void;

    /** Connection context menu callback (连接右键菜单回调) */
    onConnectionContextMenu?: (connection: Connection, e: React.MouseEvent) => void;

    /** Group context menu callback (组右键菜单回调) */
    onGroupContextMenu?: (group: NodeGroup, e: React.MouseEvent) => void;

    /** Group double click callback - typically used to expand group (组双击回调 - 通常用于展开组) */
    onGroupDoubleClick?: (group: NodeGroup) => void;
}

/**
 * Dragging state for node movement
 * 节点移动的拖拽状态
 */
interface DragState {
    nodeIds: string[];
    startPositions: Map<string, Position>;
    startMouse: Position;
}

/**
 * Connection dragging state
 * 连接拖拽状态
 */
interface ConnectionDragState {
    fromPin: Pin;
    fromPosition: Position;
    currentPosition: Position;
    targetPin?: Pin;
    isValid?: boolean;
}

/**
 * Box selection state
 * 框选状态
 */
interface BoxSelectState {
    startPos: Position;
    currentPos: Position;
    additive: boolean;
}

/**
 * NodeEditor - Complete node graph editor component
 * NodeEditor - 完整的节点图编辑器组件
 */
export const NodeEditor: React.FC<NodeEditorProps> = ({
    graph,
    // templates is reserved for future node palette feature
    // templates 保留用于未来的节点面板功能
    templates: _templates = [],
    selectedNodeIds = new Set(),
    selectedConnectionIds = new Set(),
    executionStates,
    animateExecConnections = false,
    readOnly = false,
    renderIcon,
    onGraphChange,
    onSelectionChange,
    // onNodeDoubleClick is reserved for future double-click handling
    // onNodeDoubleClick 保留用于未来的双击处理
    onNodeDoubleClick: _onNodeDoubleClick,
    onCanvasContextMenu,
    onNodeContextMenu,
    onConnectionContextMenu,
    onGroupContextMenu,
    onGroupDoubleClick
}) => {
    // Silence unused variable warnings (消除未使用变量警告)
    void _templates;
    void _onNodeDoubleClick;
    const containerRef = useRef<HTMLDivElement>(null);

    // Canvas transform state - use ref to always have latest values
    // 画布变换状态 - 使用 ref 保证总是能获取最新值
    const transformRef = useRef({ pan: Position.ZERO, zoom: 1 });

    // Callbacks for GraphCanvas to sync transform state
    const handlePanChange = useCallback((newPan: Position) => {
        transformRef.current.pan = newPan;
    }, []);

    const handleZoomChange = useCallback((newZoom: number) => {
        transformRef.current.zoom = newZoom;
    }, []);

    // Local state for dragging (拖拽的本地状态)
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [connectionDrag, setConnectionDrag] = useState<ConnectionDragState | null>(null);
    const [hoveredPin, setHoveredPin] = useState<Pin | null>(null);
    const [boxSelectState, setBoxSelectState] = useState<BoxSelectState | null>(null);

    // Track if box selection just ended to prevent click from clearing selection
    // 跟踪框选是否刚刚结束，以防止 click 清除选择
    const boxSelectJustEndedRef = useRef(false);

    // Force re-render after mount to ensure connections are drawn correctly
    // 挂载后强制重渲染以确保连接线正确绘制
    const [, forceUpdate] = useState(0);

    // Track collapsed state to force connection re-render
    // 跟踪折叠状态以强制连接线重渲染
    const collapsedNodesKey = useMemo(() => {
        return graph.nodes.map(n => `${n.id}:${n.isCollapsed}`).join(',');
    }, [graph.nodes]);

    // Groups are now simple visual boxes - no node hiding
    // 组现在是简单的可视化框 - 不隐藏节点

    // Track selected group IDs (local state, managed similarly to nodes)
    // 跟踪选中的组ID（本地状态，类似节点管理方式）
    const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());

    // Group drag state - includes initial positions of nodes in the group
    // 组拖拽状态 - 包含组内节点的初始位置
    const [groupDragState, setGroupDragState] = useState<{
        groupId: string;
        startGroupPosition: Position;
        startMouse: { x: number; y: number };
        nodeStartPositions: Map<string, Position>;
    } | null>(null);

    // Key for tracking group changes
    const groupsKey = useMemo(() => {
        return graph.groups.map(g => `${g.id}:${g.position.x}:${g.position.y}`).join(',');
    }, [graph.groups]);

    // Compute dynamic group bounds based on current node positions and sizes
    // 根据当前节点位置和尺寸动态计算组边界
    const groupsWithDynamicBounds = useMemo(() => {
        const defaultNodeWidth = 200;

        return graph.groups.map(group => {
            // Get current bounds of all nodes in this group
            const nodeBounds = group.nodeIds
                .map(nodeId => graph.getNode(nodeId))
                .filter((node): node is GraphNode => node !== undefined)
                .map(node => ({
                    x: node.position.x,
                    y: node.position.y,
                    width: defaultNodeWidth,
                    height: estimateNodeHeight(
                        node.inputPins.length,
                        node.outputPins.length,
                        node.isCollapsed
                    )
                }));

            if (nodeBounds.length === 0) {
                // No nodes found, use stored position/size as fallback
                return group;
            }

            // Calculate dynamic bounds based on actual node sizes
            const { position, size } = computeGroupBounds(nodeBounds);

            return {
                ...group,
                position,
                size
            };
        });
    }, [graph.groups, graph.nodes]);

    useEffect(() => {
        // Use requestAnimationFrame to wait for DOM to be fully rendered
        // 使用 requestAnimationFrame 等待 DOM 完全渲染
        const rafId = requestAnimationFrame(() => {
            forceUpdate(n => n + 1);
        });
        return () => cancelAnimationFrame(rafId);
    }, [graph.id, collapsedNodesKey, groupsKey]);

    /**
     * Converts screen coordinates to canvas coordinates
     * 将屏幕坐标转换为画布坐标
     * 使用 ref 中的最新值，避免闭包捕获旧状态
     */
    const screenToCanvas = useCallback((screenX: number, screenY: number): Position => {
        if (!containerRef.current) return new Position(screenX, screenY);
        const rect = containerRef.current.getBoundingClientRect();
        const { pan, zoom } = transformRef.current;
        const x = (screenX - rect.left - pan.x) / zoom;
        const y = (screenY - rect.top - pan.y) / zoom;
        return new Position(x, y);
    }, []);

    /**
     * Gets pin position in canvas coordinates
     * 获取引脚在画布坐标系中的位置
     *
     * 直接从节点位置和引脚在节点内的相对位置计算，不依赖 DOM 测量
     * 当节点收缩时，返回节点头部的位置
     * 当节点在折叠组中时，返回组节点的位置
     */
    const getPinPosition = useCallback((pinId: string): Position | undefined => {
        // First, find which node this pin belongs to
        // 首先查找该引脚属于哪个节点
        let ownerNode: GraphNode | undefined;
        for (const node of graph.nodes) {
            if (node.allPins.some(p => p.id === pinId)) {
                ownerNode = node;
                break;
            }
        }
        if (!ownerNode) return undefined;

        // Find the pin element and its parent node
        const pinElement = containerRef.current?.querySelector(`[data-pin-id="${pinId}"]`) as HTMLElement;

        // If pin element not found (e.g., node is collapsed), use node header position
        // 如果找不到引脚元素（例如节点已收缩），使用节点头部位置
        if (!pinElement) {
            const nodeElement = containerRef.current?.querySelector(`[data-node-id="${ownerNode.id}"]`) as HTMLElement;
            if (!nodeElement) return undefined;

            const nodeRect = nodeElement.getBoundingClientRect();
            const { zoom } = transformRef.current;

            // Find the pin to determine if it's input or output
            const pin = ownerNode.allPins.find(p => p.id === pinId);
            const isOutput = pin?.isOutput ?? false;

            // For collapsed nodes, position at the right side for outputs, left side for inputs
            // 对于收缩的节点，输出引脚在右侧，输入引脚在左侧
            const headerHeight = 28; // Approximate header height
            const relativeX = isOutput ? nodeRect.width / zoom : 0;
            const relativeY = headerHeight / 2;

            return new Position(
                ownerNode.position.x + relativeX,
                ownerNode.position.y + relativeY
            );
        }

        const nodeElement = pinElement.closest('[data-node-id]') as HTMLElement;
        if (!nodeElement) return undefined;

        // Get pin position relative to node element (in unscaled pixels)
        const nodeRect = nodeElement.getBoundingClientRect();
        const pinRect = pinElement.getBoundingClientRect();

        // Calculate relative position within the node (accounting for zoom)
        const { zoom } = transformRef.current;
        const relativeX = (pinRect.left + pinRect.width / 2 - nodeRect.left) / zoom;
        const relativeY = (pinRect.top + pinRect.height / 2 - nodeRect.top) / zoom;

        // Final position = node position + relative position
        return new Position(
            ownerNode.position.x + relativeX,
            ownerNode.position.y + relativeY
        );
    }, [graph]);

    /**
     * Handles node selection
     * 处理节点选择
     */
    const handleNodeSelect = useCallback((nodeId: string, additive: boolean) => {
        if (readOnly) return;

        const newSelection = new Set(selectedNodeIds);

        if (additive) {
            if (newSelection.has(nodeId)) {
                newSelection.delete(nodeId);
            } else {
                newSelection.add(nodeId);
            }
        } else {
            newSelection.clear();
            newSelection.add(nodeId);
        }

        onSelectionChange?.(newSelection, new Set());
    }, [selectedNodeIds, readOnly, onSelectionChange]);

    /**
     * Handles node drag start
     * 处理节点拖拽开始
     */
    const handleNodeDragStart = useCallback((nodeId: string, e: React.MouseEvent) => {
        if (readOnly) return;

        // Get all nodes to drag (selected or just this one)
        // 获取要拖拽的所有节点（选中的或仅此节点）
        const nodesToDrag = selectedNodeIds.has(nodeId)
            ? Array.from(selectedNodeIds)
            : [nodeId];

        // Store starting positions (存储起始位置)
        const startPositions = new Map<string, Position>();
        nodesToDrag.forEach(id => {
            const node = graph.getNode(id);
            if (node) {
                startPositions.set(id, node.position);
            }
        });

        const mousePos = screenToCanvas(e.clientX, e.clientY);

        setDragState({
            nodeIds: nodesToDrag,
            startPositions,
            startMouse: mousePos
        });
    }, [graph, selectedNodeIds, readOnly, screenToCanvas]);

    /**
     * Handles mouse move for dragging
     * 处理拖拽的鼠标移动
     */
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const mousePos = screenToCanvas(e.clientX, e.clientY);

        // Node dragging (节点拖拽)
        if (dragState) {
            const dx = mousePos.x - dragState.startMouse.x;
            const dy = mousePos.y - dragState.startMouse.y;

            let newGraph = graph;
            dragState.nodeIds.forEach(nodeId => {
                const startPos = dragState.startPositions.get(nodeId);
                if (startPos) {
                    const newPos = new Position(startPos.x + dx, startPos.y + dy);
                    newGraph = newGraph.moveNode(nodeId, newPos);
                }
            });

            onGraphChange?.(newGraph);
        }

        // Group dragging - moves all nodes inside (group bounds are dynamic)
        // 组拖拽 - 移动组内所有节点（组边界是动态计算的）
        if (groupDragState) {
            const dx = mousePos.x - groupDragState.startMouse.x;
            const dy = mousePos.y - groupDragState.startMouse.y;

            // Only move nodes - group bounds will auto-recalculate
            let newGraph = graph;
            for (const [nodeId, startPos] of groupDragState.nodeStartPositions) {
                const newNodePos = new Position(startPos.x + dx, startPos.y + dy);
                newGraph = newGraph.moveNode(nodeId, newNodePos);
            }

            onGraphChange?.(newGraph);
        }

        // Connection dragging (连接拖拽)
        if (connectionDrag) {
            const isValid = hoveredPin ? connectionDrag.fromPin.canConnectTo(hoveredPin) : undefined;

            setConnectionDrag(prev => prev ? {
                ...prev,
                currentPosition: mousePos,
                targetPin: hoveredPin ?? undefined,
                isValid
            } : null);
        }
    }, [graph, dragState, groupDragState, connectionDrag, hoveredPin, screenToCanvas, onGraphChange]);

    /**
     * Handles mouse up to end dragging
     * 处理鼠标释放结束拖拽
     */
    const handleMouseUp = useCallback(() => {
        // End node dragging (结束节点拖拽)
        if (dragState) {
            setDragState(null);
        }

        // End group dragging (结束组拖拽)
        if (groupDragState) {
            setGroupDragState(null);
        }

        // End connection dragging (结束连接拖拽)
        if (connectionDrag) {
            // Use hoveredPin directly instead of relying on async state update
            const targetPin = hoveredPin;

            if (targetPin && connectionDrag.fromPin.canConnectTo(targetPin)) {
                // Create connection (创建连接)
                const fromPin = connectionDrag.fromPin;
                const toPin = targetPin;

                // Determine direction (确定方向)
                const [outputPin, inputPin] = fromPin.isOutput
                    ? [fromPin, toPin]
                    : [toPin, fromPin];

                const connection = new Connection(
                    Connection.createId(outputPin.id, inputPin.id),
                    outputPin.nodeId,
                    outputPin.id,
                    inputPin.nodeId,
                    inputPin.id,
                    outputPin.category
                );

                try {
                    const newGraph = graph.addConnection(connection);
                    onGraphChange?.(newGraph);
                } catch (error) {
                    console.error('Failed to create connection:', error);
                }
            }

            setConnectionDrag(null);
        }
    }, [graph, dragState, groupDragState, connectionDrag, hoveredPin, onGraphChange]);

    /**
     * Handles pin mouse down
     * 处理引脚鼠标按下
     */
    const handlePinMouseDown = useCallback((e: React.MouseEvent, pin: Pin) => {
        if (readOnly) return;
        e.stopPropagation();

        const position = getPinPosition(pin.id);
        if (position) {
            setConnectionDrag({
                fromPin: pin,
                fromPosition: position,
                currentPosition: position
            });
        }
    }, [readOnly, getPinPosition]);

    /**
     * Handles pin mouse up
     * 处理引脚鼠标释放
     */
    const handlePinMouseUp = useCallback((_e: React.MouseEvent, pin: Pin) => {
        if (connectionDrag && connectionDrag.fromPin.canConnectTo(pin)) {
            const fromPin = connectionDrag.fromPin;
            const toPin = pin;

            const [outputPin, inputPin] = fromPin.isOutput
                ? [fromPin, toPin]
                : [toPin, fromPin];

            const connection = new Connection(
                Connection.createId(outputPin.id, inputPin.id),
                outputPin.nodeId,
                outputPin.id,
                inputPin.nodeId,
                inputPin.id,
                outputPin.category
            );

            try {
                const newGraph = graph.addConnection(connection);
                onGraphChange?.(newGraph);
            } catch (error) {
                console.error('Failed to create connection:', error);
            }

            setConnectionDrag(null);
        }
    }, [connectionDrag, graph, onGraphChange]);

    /**
     * Handles pin hover
     * 处理引脚悬停
     */
    const handlePinMouseEnter = useCallback((pin: Pin) => {
        setHoveredPin(pin);
    }, []);

    const handlePinMouseLeave = useCallback(() => {
        setHoveredPin(null);
    }, []);

    /**
     * Handles node context menu
     * 处理节点右键菜单
     */
    const handleNodeContextMenu = useCallback((nodeId: string, e: React.MouseEvent) => {
        const node = graph.getNode(nodeId);
        if (node) {
            onNodeContextMenu?.(node, e);
        }
    }, [graph, onNodeContextMenu]);

    /**
     * Handles connection click
     * 处理连接点击
     */
    const handleConnectionClick = useCallback((connectionId: string, e: React.MouseEvent) => {
        if (readOnly) return;

        const newSelection = new Set<string>();
        if (e.ctrlKey || e.metaKey) {
            if (selectedConnectionIds.has(connectionId)) {
                selectedConnectionIds.forEach(id => {
                    if (id !== connectionId) newSelection.add(id);
                });
            } else {
                selectedConnectionIds.forEach(id => newSelection.add(id));
                newSelection.add(connectionId);
            }
        } else {
            newSelection.add(connectionId);
        }

        onSelectionChange?.(new Set(), newSelection);
    }, [selectedConnectionIds, readOnly, onSelectionChange]);

    /**
     * Handles connection context menu
     * 处理连接右键菜单
     */
    const handleConnectionContextMenu = useCallback((connectionId: string, e: React.MouseEvent) => {
        const connection = graph.connections.find(c => c.id === connectionId);
        if (connection) {
            onConnectionContextMenu?.(connection, e);
        }
    }, [graph, onConnectionContextMenu]);

    /**
     * Handles group selection
     * 处理组选择
     */
    const handleGroupSelect = useCallback((groupId: string, additive: boolean) => {
        if (readOnly) return;

        const newSelection = new Set(selectedGroupIds);

        if (additive) {
            if (newSelection.has(groupId)) {
                newSelection.delete(groupId);
            } else {
                newSelection.add(groupId);
            }
        } else {
            newSelection.clear();
            newSelection.add(groupId);
        }

        setSelectedGroupIds(newSelection);
        // Clear node and connection selection when selecting groups
        onSelectionChange?.(new Set(), new Set());
    }, [selectedGroupIds, readOnly, onSelectionChange]);

    /**
     * Handles group drag start
     * 处理组拖拽开始
     *
     * Captures initial positions of both the group and all nodes inside it
     * 捕获组和组内所有节点的初始位置
     */
    const handleGroupDragStart = useCallback((groupId: string, startMouse: { x: number; y: number }) => {
        if (readOnly) return;

        const group = graph.getGroup(groupId);
        if (!group) return;

        // Convert screen coordinates to canvas coordinates (same as node dragging)
        // 将屏幕坐标转换为画布坐标（与节点拖拽相同）
        const canvasPos = screenToCanvas(startMouse.x, startMouse.y);

        // Capture initial positions of all nodes in the group
        const nodeStartPositions = new Map<string, Position>();
        for (const nodeId of group.nodeIds) {
            const node = graph.getNode(nodeId);
            if (node) {
                nodeStartPositions.set(nodeId, node.position);
            }
        }

        setGroupDragState({
            groupId,
            startGroupPosition: group.position,
            startMouse: { x: canvasPos.x, y: canvasPos.y },
            nodeStartPositions
        });
    }, [graph, readOnly, screenToCanvas]);

    /**
     * Handles group context menu
     * 处理组右键菜单
     */
    const handleGroupContextMenu = useCallback((group: NodeGroup, e: React.MouseEvent) => {
        onGroupContextMenu?.(group, e);
    }, [onGroupContextMenu]);

    /**
     * Handles group double click
     * 处理组双击
     */
    const handleGroupDoubleClick = useCallback((group: NodeGroup) => {
        onGroupDoubleClick?.(group);
    }, [onGroupDoubleClick]);

    /**
     * Handles canvas click to deselect
     * 处理画布点击取消选择
     */
    const handleCanvasClick = useCallback((_position: Position, _e: React.MouseEvent) => {
        // Skip if box selection just ended (click fires after mouseup)
        // 如果框选刚刚结束则跳过（click 在 mouseup 之后触发）
        if (boxSelectJustEndedRef.current) {
            boxSelectJustEndedRef.current = false;
            return;
        }
        if (!readOnly) {
            onSelectionChange?.(new Set(), new Set());
            setSelectedGroupIds(new Set());
        }
    }, [readOnly, onSelectionChange]);

    /**
     * Handles canvas context menu
     * 处理画布右键菜单
     */
    const handleCanvasContextMenu = useCallback((position: Position, e: React.MouseEvent) => {
        onCanvasContextMenu?.(position, e);
    }, [onCanvasContextMenu]);

    /**
     * Handles box selection start
     * 处理框选开始
     */
    const handleBoxSelectStart = useCallback((position: Position, e: React.MouseEvent) => {
        if (readOnly) return;
        setBoxSelectState({
            startPos: position,
            currentPos: position,
            additive: e.ctrlKey || e.metaKey
        });
    }, [readOnly]);

    /**
     * Handles box selection move
     * 处理框选移动
     */
    const handleBoxSelectMove = useCallback((position: Position) => {
        if (boxSelectState) {
            setBoxSelectState(prev => prev ? { ...prev, currentPos: position } : null);
        }
    }, [boxSelectState]);

    /**
     * Handles box selection end
     * 处理框选结束
     */
    const handleBoxSelectEnd = useCallback(() => {
        if (!boxSelectState) return;

        const { startPos, currentPos, additive } = boxSelectState;

        // Calculate selection box bounds
        const minX = Math.min(startPos.x, currentPos.x);
        const maxX = Math.max(startPos.x, currentPos.x);
        const minY = Math.min(startPos.y, currentPos.y);
        const maxY = Math.max(startPos.y, currentPos.y);

        // Find nodes within the selection box
        const nodesInBox: string[] = [];
        const nodeWidth = 200;  // Approximate node width
        const nodeHeight = 100; // Approximate node height

        for (const node of graph.nodes) {
            const nodeLeft = node.position.x;
            const nodeTop = node.position.y;
            const nodeRight = nodeLeft + nodeWidth;
            const nodeBottom = nodeTop + nodeHeight;

            // Check if node intersects with selection box
            const intersects = !(nodeRight < minX || nodeLeft > maxX || nodeBottom < minY || nodeTop > maxY);
            if (intersects) {
                nodesInBox.push(node.id);
            }
        }

        // Update selection
        if (additive) {
            // Add to existing selection
            const newSelection = new Set(selectedNodeIds);
            nodesInBox.forEach(id => newSelection.add(id));
            onSelectionChange?.(newSelection, new Set());
        } else {
            // Replace selection
            onSelectionChange?.(new Set(nodesInBox), new Set());
        }

        // Mark that box selection just ended to prevent click from clearing selection
        // 标记框选刚刚结束，以防止 click 清除选择
        boxSelectJustEndedRef.current = true;
        setBoxSelectState(null);
    }, [boxSelectState, graph.nodes, selectedNodeIds, onSelectionChange]);

    /**
     * Handles pin value change
     * 处理引脚值变化
     */
    const handlePinValueChange = useCallback((nodeId: string, pinId: string, value: unknown) => {
        if (readOnly) return;

        const node = graph.getNode(nodeId);
        if (node) {
            // Find pin name from pin id
            // 从引脚ID查找引脚名称
            const pin = node.getPin(pinId);
            if (pin) {
                const newData = { ...node.data, [pin.name]: value };
                const newGraph = graph.updateNode(nodeId, n => n.updateData(newData));
                onGraphChange?.(newGraph);
            }
        }
    }, [graph, readOnly, onGraphChange]);

    /**
     * Handles node collapse toggle
     * 处理节点折叠切换
     */
    const handleToggleCollapse = useCallback((nodeId: string) => {
        const newGraph = graph.updateNode(nodeId, n => n.toggleCollapse());
        onGraphChange?.(newGraph);
    }, [graph, onGraphChange]);

    // Build connection preview for drag state
    // 为拖拽状态构建连接预览
    const connectionPreview = useMemo(() => {
        if (!connectionDrag) return undefined;

        return {
            from: connectionDrag.fromPosition,
            to: connectionDrag.currentPosition,
            category: connectionDrag.fromPin.category,
            isValid: connectionDrag.isValid
        };
    }, [connectionDrag]);

    return (
        <div
            ref={containerRef}
            className="ne-editor"
            style={{ width: '100%', height: '100%' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <GraphCanvas
                onClick={handleCanvasClick}
                onContextMenu={handleCanvasContextMenu}
                onPanChange={handlePanChange}
                onZoomChange={handleZoomChange}
                onMouseDown={handleBoxSelectStart}
                onCanvasMouseMove={handleBoxSelectMove}
                onCanvasMouseUp={handleBoxSelectEnd}
            >
                {/* Group boxes - rendered first so they appear behind nodes (组框 - 先渲染，这样显示在节点后面) */}
                {/* Use dynamically calculated bounds so groups auto-resize to fit nodes */}
                {groupsWithDynamicBounds.map(group => (
                    <MemoizedGroupNodeComponent
                        key={group.id}
                        group={group}
                        isSelected={selectedGroupIds.has(group.id)}
                        isDragging={groupDragState?.groupId === group.id}
                        onSelect={handleGroupSelect}
                        onDragStart={handleGroupDragStart}
                        onContextMenu={handleGroupContextMenu}
                        onDoubleClick={handleGroupDoubleClick}
                    />
                ))}

                {/* Connection layer (连接层) */}
                <ConnectionLayer
                    connections={graph.connections}
                    getPinPosition={getPinPosition}
                    selectedConnectionIds={selectedConnectionIds}
                    animateExec={animateExecConnections}
                    preview={connectionPreview}
                    onConnectionClick={handleConnectionClick}
                    onConnectionContextMenu={handleConnectionContextMenu}
                />

                {/* All Nodes (所有节点) */}
                {graph.nodes.map(node => (
                    <MemoizedGraphNodeComponent
                        key={node.id}
                        node={node}
                        isSelected={selectedNodeIds.has(node.id)}
                        isDragging={dragState?.nodeIds.includes(node.id) ?? false}
                        executionState={executionStates?.get(node.id)}
                        connections={graph.connections}
                        draggingFromPin={connectionDrag?.fromPin}
                        renderIcon={renderIcon}
                        onSelect={handleNodeSelect}
                        onDragStart={handleNodeDragStart}
                        onContextMenu={handleNodeContextMenu}
                        onPinMouseDown={handlePinMouseDown}
                        onPinMouseUp={handlePinMouseUp}
                        onPinMouseEnter={handlePinMouseEnter}
                        onPinMouseLeave={handlePinMouseLeave}
                        onPinValueChange={handlePinValueChange}
                        onToggleCollapse={handleToggleCollapse}
                    />
                ))}

                {/* Box selection overlay (框选覆盖层) */}
                {boxSelectState && (
                    <div
                        className="ne-selection-box"
                        style={{
                            left: Math.min(boxSelectState.startPos.x, boxSelectState.currentPos.x),
                            top: Math.min(boxSelectState.startPos.y, boxSelectState.currentPos.y),
                            width: Math.abs(boxSelectState.currentPos.x - boxSelectState.startPos.x),
                            height: Math.abs(boxSelectState.currentPos.y - boxSelectState.startPos.y)
                        }}
                    />
                )}
            </GraphCanvas>
        </div>
    );
};

export default NodeEditor;
