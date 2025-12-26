/**
 * ArrayInput - 数组编辑控件
 * ArrayInput - Array editor control
 */

import React, { useCallback, useState } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { PropertyControlProps } from '../types';

export interface ArrayInputProps<T = any> extends PropertyControlProps<T[]> {
    /** 元素渲染器 | Element renderer */
    renderElement?: (
        element: T,
        index: number,
        onChange: (value: T) => void,
        onRemove: () => void
    ) => React.ReactNode;
    /** 创建新元素 | Create new element */
    createNewElement?: () => T;
    /** 最小元素数 | Minimum element count */
    minItems?: number;
    /** 最大元素数 | Maximum element count */
    maxItems?: number;
    /** 是否可排序 | Sortable */
    sortable?: boolean;
    /** 折叠标题 | Collapsed title */
    collapsedTitle?: (items: T[]) => string;
}

export function ArrayInput<T = any>({
    value = [],
    onChange,
    readonly = false,
    renderElement,
    createNewElement,
    minItems = 0,
    maxItems,
    sortable = false,
    collapsedTitle
}: ArrayInputProps<T>): React.ReactElement {
    const [expanded, setExpanded] = useState(true);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const items = value ?? [];
    const canAdd = !maxItems || items.length < maxItems;
    const canRemove = items.length > minItems;

    // 展开/折叠 | Expand/Collapse
    const toggleExpanded = useCallback(() => {
        setExpanded(prev => !prev);
    }, []);

    // 添加元素 | Add element
    const handleAdd = useCallback(() => {
        if (!canAdd || readonly) return;

        const newElement = createNewElement ? createNewElement() : (null as T);
        onChange([...items, newElement]);
    }, [items, onChange, canAdd, readonly, createNewElement]);

    // 移除元素 | Remove element
    const handleRemove = useCallback((index: number) => {
        if (!canRemove || readonly) return;

        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
    }, [items, onChange, canRemove, readonly]);

    // 更新元素 | Update element
    const handleElementChange = useCallback((index: number, newValue: T) => {
        if (readonly) return;

        const newItems = [...items];
        newItems[index] = newValue;
        onChange(newItems);
    }, [items, onChange, readonly]);

    // ========== 拖拽排序 | Drag Sort ==========

    const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
        if (!sortable || readonly) return;

        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
    }, [sortable, readonly]);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        if (!sortable || readonly || dragIndex === null) return;

        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    }, [sortable, readonly, dragIndex]);

    const handleDragLeave = useCallback(() => {
        setDragOverIndex(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();

        if (!sortable || readonly || dragIndex === null || dragIndex === targetIndex) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }

        const newItems = [...items];
        const [removed] = newItems.splice(dragIndex, 1);
        if (removed !== undefined) {
            newItems.splice(targetIndex, 0, removed);
        }

        onChange(newItems);
        setDragIndex(null);
        setDragOverIndex(null);
    }, [items, onChange, sortable, readonly, dragIndex]);

    const handleDragEnd = useCallback(() => {
        setDragIndex(null);
        setDragOverIndex(null);
    }, []);

    // 获取折叠标题 | Get collapsed title
    const getTitle = (): string => {
        if (collapsedTitle) {
            return collapsedTitle(items);
        }
        return `${items.length} item${items.length !== 1 ? 's' : ''}`;
    };

    // 默认元素渲染 | Default element renderer
    const defaultRenderElement = (element: T, index: number) => (
        <div className="inspector-array-element-default">
            {String(element)}
        </div>
    );

    return (
        <div className="inspector-array-input">
            {/* 头部 | Header */}
            <div className="inspector-array-header" onClick={toggleExpanded}>
                <span className="inspector-array-arrow">
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
                <span className="inspector-array-title">{getTitle()}</span>

                {/* 添加按钮 | Add button */}
                {canAdd && !readonly && (
                    <button
                        type="button"
                        className="inspector-array-add"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAdd();
                        }}
                        title="Add element"
                    >
                        <Plus size={12} />
                    </button>
                )}
            </div>

            {/* 元素列表 | Element list */}
            {expanded && (
                <div className="inspector-array-elements">
                    {items.map((element, index) => (
                        <div
                            key={index}
                            className={`inspector-array-element ${dragOverIndex === index ? 'drag-over' : ''} ${dragIndex === index ? 'dragging' : ''}`}
                            draggable={sortable && !readonly}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                        >
                            {/* 拖拽手柄 | Drag handle */}
                            {sortable && !readonly && (
                                <div className="inspector-array-handle">
                                    <GripVertical size={12} />
                                </div>
                            )}

                            {/* 索引 | Index */}
                            <span className="inspector-array-index">{index}</span>

                            {/* 内容 | Content */}
                            <div className="inspector-array-content">
                                {renderElement
                                    ? renderElement(
                                        element,
                                        index,
                                        (val) => handleElementChange(index, val),
                                        () => handleRemove(index)
                                    )
                                    : defaultRenderElement(element, index)
                                }
                            </div>

                            {/* 删除按钮 | Remove button */}
                            {canRemove && !readonly && (
                                <button
                                    type="button"
                                    className="inspector-array-remove"
                                    onClick={() => handleRemove(index)}
                                    title="Remove"
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* 空状态 | Empty state */}
                    {items.length === 0 && (
                        <div className="inspector-array-empty">
                            No items
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
