import React, { useCallback, useMemo, useRef } from 'react';
import { NodeGroup } from '../../domain/models/NodeGroup';
import '../../styles/GroupNode.css';

export interface GroupNodeComponentProps {
    /** The group to render */
    group: NodeGroup;

    /** Whether the group is selected */
    isSelected?: boolean;

    /** Whether the group is being dragged */
    isDragging?: boolean;

    /** Selection handler */
    onSelect?: (groupId: string, additive: boolean) => void;

    /** Drag start handler */
    onDragStart?: (groupId: string, startPosition: { x: number; y: number }) => void;

    /** Context menu handler */
    onContextMenu?: (group: NodeGroup, e: React.MouseEvent) => void;

    /** Double click handler for editing name */
    onDoubleClick?: (group: NodeGroup) => void;
}

/**
 * GroupNodeComponent - Renders a visual group box around nodes
 * GroupNodeComponent - 渲染节点周围的可视化组框
 *
 * This is a simple background box that provides visual organization.
 * 这是一个简单的背景框，提供视觉组织功能。
 */
export const GroupNodeComponent: React.FC<GroupNodeComponentProps> = ({
    group,
    isSelected = false,
    isDragging = false,
    onSelect,
    onDragStart,
    onContextMenu,
    onDoubleClick
}) => {
    const groupRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0) return;
        // Only handle clicks on the header or border, not on the content area
        const target = e.target as HTMLElement;
        if (!target.closest('.ne-group-box-header') && !target.classList.contains('ne-group-box')) {
            return;
        }
        e.stopPropagation();

        const additive = e.ctrlKey || e.metaKey;
        onSelect?.(group.id, additive);
        onDragStart?.(group.id, { x: e.clientX, y: e.clientY });
    }, [group.id, onSelect, onDragStart]);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(group, e);
    }, [group, onContextMenu]);

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        // Only handle double-click on the header
        const target = e.target as HTMLElement;
        if (!target.closest('.ne-group-box-header')) {
            return;
        }
        e.stopPropagation();
        onDoubleClick?.(group);
    }, [group, onDoubleClick]);

    const classNames = useMemo(() => {
        const classes = ['ne-group-box'];
        if (isSelected) classes.push('selected');
        if (isDragging) classes.push('dragging');
        return classes.join(' ');
    }, [isSelected, isDragging]);

    const style: React.CSSProperties = useMemo(() => ({
        left: group.position.x,
        top: group.position.y,
        width: group.size.width,
        height: group.size.height,
        '--group-color': group.color || 'rgba(100, 149, 237, 0.15)'
    } as React.CSSProperties), [group.position.x, group.position.y, group.size.width, group.size.height, group.color]);

    return (
        <div
            ref={groupRef}
            className={classNames}
            style={style}
            data-group-id={group.id}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
            onDoubleClick={handleDoubleClick}
        >
            <div className="ne-group-box-header">
                <span className="ne-group-box-title">{group.name}</span>
            </div>
        </div>
    );
};

/**
 * Memoized version for performance
 */
export const MemoizedGroupNodeComponent = React.memo(GroupNodeComponent, (prev, next) => {
    if (prev.group.id !== next.group.id) return false;
    if (prev.isSelected !== next.isSelected) return false;
    if (prev.isDragging !== next.isDragging) return false;
    if (prev.group.position.x !== next.group.position.x ||
        prev.group.position.y !== next.group.position.y) return false;
    if (prev.group.size.width !== next.group.size.width ||
        prev.group.size.height !== next.group.size.height) return false;
    if (prev.group.name !== next.group.name) return false;
    if (prev.group.color !== next.group.color) return false;
    return true;
});

export default GroupNodeComponent;
