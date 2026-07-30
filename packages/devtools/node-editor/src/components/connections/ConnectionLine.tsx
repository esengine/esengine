import React, { useMemo } from 'react';
import { Connection } from '../../domain/models/Connection';
import { PinCategory } from '../../domain/value-objects/PinType';
import { Position } from '../../domain/value-objects/Position';

export interface ConnectionLineProps {
    /** Connection data (连接数据) */
    connection: Connection;

    /** Start position (起点位置) */
    from: Position;

    /** End position (终点位置) */
    to: Position;

    /** Whether the connection is selected (连接是否被选中) */
    isSelected?: boolean;

    /** Whether to show flow animation for exec connections (是否显示执行连接的流动动画) */
    animated?: boolean;

    /**
     * 1-based execution order among the wires leaving the same exec pin
     * 同一 exec 引脚上多条连线中的执行顺序（从 1 开始）
     *
     * @zh 仅在该引脚扇出多条时传入。一个 exec 输出引脚可以接多个节点，运行时按
     *     连线顺序依次执行，光看三条一样的线看不出谁先跑，所以标出序号。
     * @en Only set when the pin fans out. An exec output pin may feed several nodes
     *     and the runtime executes them in connection order; identical-looking wires
     *     give no hint of that order, hence the badge.
     */
    execOrder?: number;

    /** Click handler (点击处理) */
    onClick?: (connectionId: string, e: React.MouseEvent) => void;

    /** Context menu handler (右键菜单处理) */
    onContextMenu?: (connectionId: string, e: React.MouseEvent) => void;
}

/**
 * Calculates bezier curve control points for smooth connection
 * 计算平滑连接的贝塞尔曲线控制点
 */
function calculateBezierControlPoints(from: Position, to: Position) {
    const dx = to.x - from.x;

    // Calculate control point offset based on distance
    // 根据距离计算控制点偏移
    const curvature = Math.min(Math.abs(dx) * 0.5, 150);

    // Horizontal bezier curve (水平贝塞尔曲线)
    return {
        cp1x: from.x + curvature,
        cp1y: from.y,
        cp2x: to.x - curvature,
        cp2y: to.y
    };
}

function calculateBezierPath(from: Position, to: Position): string {
    const { cp1x, cp1y, cp2x, cp2y } = calculateBezierControlPoints(from, to);
    return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
}

/**
 * Point on the connection curve at parameter t (0 = start, 1 = end)
 * 连接曲线上参数 t 处的点（0 为起点，1 为终点）
 */
function bezierPointAt(from: Position, to: Position, t: number) {
    const { cp1x, cp1y, cp2x, cp2y } = calculateBezierControlPoints(from, to);
    const u = 1 - t;
    const w0 = u * u * u;
    const w1 = 3 * u * u * t;
    const w2 = 3 * u * t * t;
    const w3 = t * t * t;

    return {
        x: w0 * from.x + w1 * cp1x + w2 * cp2x + w3 * to.x,
        y: w0 * from.y + w1 * cp1y + w2 * cp2y + w3 * to.y
    };
}

/**
 * @zh 序号徽标在曲线上的位置。取靠起点的一小段，这样同一引脚扇出的多条线各自
 *     的徽标会随曲线分开，不会叠在引脚上。
 * @en Where the order badge sits on the curve. Kept near the start so that badges
 *     for several wires leaving one pin separate along their own curves instead of
 *     piling up on the pin.
 */
const ORDER_BADGE_T = 0.18;

/**
 * ConnectionLine - SVG bezier curve connection between pins
 * ConnectionLine - 引脚之间的 SVG 贝塞尔曲线连接
 */
export const ConnectionLine: React.FC<ConnectionLineProps> = ({
    connection,
    from,
    to,
    isSelected = false,
    animated = false,
    execOrder,
    onClick,
    onContextMenu
}) => {
    const pathD = useMemo(() => calculateBezierPath(from, to), [from, to]);

    const badgeAt = useMemo(
        () => (execOrder === undefined ? undefined : bezierPointAt(from, to, ORDER_BADGE_T)),
        [execOrder, from, to]
    );

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.(connection.id, e);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(connection.id, e);
    };

    const classNames = useMemo(() => {
        const classes = ['ne-connection', connection.category];
        if (isSelected) classes.push('selected');
        if (animated && connection.isExec) classes.push('animated');
        return classes.join(' ');
    }, [connection.category, connection.isExec, isSelected, animated]);

    return (
        <g>
            {/* Hit area for easier selection (更容易选择的点击区域) */}
            <path
                className="ne-connection-hit"
                d={pathD}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
            />
            {/* Glow effect (发光效果) */}
            <path
                className={`ne-connection-glow ${connection.category}`}
                d={pathD}
            />
            {/* Main connection line (主连接线) */}
            <path
                className={classNames}
                d={pathD}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
            />
            {/* Execution order badge for fanned-out exec pins (exec 引脚扇出时的执行顺序徽标) */}
            {badgeAt && (
                <g className="ne-connection-order" transform={`translate(${badgeAt.x}, ${badgeAt.y})`}>
                    <circle className="ne-connection-order-bg" r={8} />
                    <text className="ne-connection-order-text" textAnchor="middle" dy="0.35em">
                        {execOrder}
                    </text>
                </g>
            )}
        </g>
    );
};

export interface ConnectionPreviewProps {
    /** Start position (起点位置) */
    from: Position;

    /** End position (current mouse position) (终点位置，当前鼠标位置) */
    to: Position;

    /** Pin category for coloring (引脚类型用于着色) */
    category: PinCategory;

    /** Whether the target is valid (目标是否有效) */
    isValid?: boolean;
}

/**
 * ConnectionPreview - Preview line shown while dragging a connection
 * ConnectionPreview - 拖拽连接时显示的预览线
 */
export const ConnectionPreview: React.FC<ConnectionPreviewProps> = ({
    from,
    to,
    category,
    isValid
}) => {
    const pathD = useMemo(() => calculateBezierPath(from, to), [from, to]);

    const classNames = useMemo(() => {
        const classes = ['ne-connection-preview', category];
        if (isValid === true) classes.push('valid');
        if (isValid === false) classes.push('invalid');
        return classes.join(' ');
    }, [category, isValid]);

    return (
        <path
            className={classNames}
            d={pathD}
        />
    );
};

export interface ConnectionLayerProps {
    /** All connections to render (要渲染的所有连接) */
    connections: Connection[];

    /** Function to get pin position by ID (通过ID获取引脚位置的函数) */
    getPinPosition: (pinId: string) => Position | undefined;

    /** Currently selected connection IDs (当前选中的连接ID) */
    selectedConnectionIds?: Set<string>;

    /** Whether to animate exec connections (是否动画化执行连接) */
    animateExec?: boolean;

    /**
     * Show execution order badges on exec pins that fan out (default: true)
     * 在扇出的 exec 引脚上显示执行顺序徽标（默认开启）
     */
    showExecOrder?: boolean;

    /** Preview connection while dragging (拖拽时的预览连接) */
    preview?: {
        from: Position;
        to: Position;
        category: PinCategory;
        isValid?: boolean;
    };

    /** Connection click handler (连接点击处理) */
    onConnectionClick?: (connectionId: string, e: React.MouseEvent) => void;

    /** Connection context menu handler (连接右键菜单处理) */
    onConnectionContextMenu?: (connectionId: string, e: React.MouseEvent) => void;
}

/**
 * ConnectionLayer - SVG layer containing all connection lines
 * ConnectionLayer - 包含所有连接线的 SVG 层
 */
export const ConnectionLayer: React.FC<ConnectionLayerProps> = ({
    connections,
    getPinPosition,
    selectedConnectionIds,
    animateExec = false,
    showExecOrder = true,
    preview,
    onConnectionClick,
    onConnectionContextMenu
}) => {
    // 1-based execution order per connection, only for exec pins carrying more than
    // one wire. Numbered by position in `connections` because that is the order the
    // runtime follows them in.
    // 每条连线的执行顺序（从 1 开始），只对带多条线的 exec 引脚计算。按 `connections`
    // 中的先后编号，因为运行时就是按这个顺序执行的。
    const execOrders = useMemo(() => {
        if (!showExecOrder) return undefined;

        const byPin = new Map<string, Connection[]>();
        for (const connection of connections) {
            if (!connection.isExec) continue;
            const siblings = byPin.get(connection.fromPinId);
            if (siblings) siblings.push(connection);
            else byPin.set(connection.fromPinId, [connection]);
        }

        const orders = new Map<string, number>();
        for (const siblings of byPin.values()) {
            if (siblings.length < 2) continue;
            siblings.forEach((connection, index) => orders.set(connection.id, index + 1));
        }
        return orders;
    }, [connections, showExecOrder]);

    return (
        <svg className="ne-connection-layer">
            {/* Render all connections (渲染所有连接) */}
            {connections.map(connection => {
                const from = getPinPosition(connection.fromPinId);
                const to = getPinPosition(connection.toPinId);

                if (!from || !to) return null;

                return (
                    <ConnectionLine
                        key={connection.id}
                        connection={connection}
                        from={from}
                        to={to}
                        isSelected={selectedConnectionIds?.has(connection.id)}
                        animated={animateExec}
                        execOrder={execOrders?.get(connection.id)}
                        onClick={onConnectionClick}
                        onContextMenu={onConnectionContextMenu}
                    />
                );
            })}

            {/* Render preview connection (渲染预览连接) */}
            {preview && (
                <ConnectionPreview
                    from={preview.from}
                    to={preview.to}
                    category={preview.category}
                    isValid={preview.isValid}
                />
            )}
        </svg>
    );
};

export default ConnectionLine;
