/**
 * EntityRefInput - 实体引用选择控件
 * EntityRefInput - Entity reference picker control
 *
 * 支持从场景层级面板拖放实体
 * Supports drag and drop entities from scene hierarchy panel
 */

import React, { useCallback, useState, useRef } from 'react';
import { Box, X, Target, Link } from 'lucide-react';
import { PropertyControlProps } from '../types';

export interface EntityReference {
    /** 实体 ID | Entity ID */
    id: number | string;
    /** 实体名称 | Entity name */
    name?: string;
}

export interface EntityRefInputProps extends PropertyControlProps<EntityReference | number | string | null> {
    /** 实体名称解析器 | Entity name resolver */
    resolveEntityName?: (id: number | string) => string | undefined;
    /** 选择实体回调 | Select entity callback */
    onSelectEntity?: () => void;
    /** 定位实体回调 | Locate entity callback */
    onLocateEntity?: (id: number | string) => void;
}

/**
 * 获取实体 ID
 * Get entity ID
 */
const getEntityId = (value: EntityReference | number | string | null): number | string | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'object') return value.id;
    return value;
};

/**
 * 获取显示名称
 * Get display name
 */
const getDisplayName = (
    value: EntityReference | number | string | null,
    resolver?: (id: number | string) => string | undefined
): string => {
    if (value === null || value === undefined) return '';

    // 如果是完整引用对象且有名称 | If full reference with name
    if (typeof value === 'object' && value.name) {
        return value.name;
    }

    const id = getEntityId(value);
    if (id === null) return '';

    // 尝试通过解析器获取名称 | Try to resolve name
    if (resolver) {
        const resolved = resolver(id);
        if (resolved) return resolved;
    }

    // 回退到 ID | Fallback to ID
    return `Entity ${id}`;
};

export const EntityRefInput: React.FC<EntityRefInputProps> = ({
    value,
    onChange,
    readonly = false,
    resolveEntityName,
    onSelectEntity,
    onLocateEntity
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    const entityId = getEntityId(value);
    const displayName = getDisplayName(value, resolveEntityName);
    const hasValue = entityId !== null;

    // 清除值 | Clear value
    const handleClear = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!readonly) {
            onChange(null);
        }
    }, [onChange, readonly]);

    // 定位实体 | Locate entity
    const handleLocate = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (entityId !== null && onLocateEntity) {
            onLocateEntity(entityId);
        }
    }, [entityId, onLocateEntity]);

    // 选择实体 | Select entity
    const handleSelect = useCallback(() => {
        if (!readonly && onSelectEntity) {
            onSelectEntity();
        }
    }, [readonly, onSelectEntity]);

    // ========== 拖放处理 | Drag and Drop Handling ==========

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (readonly) return;

        // 检查是否有实体数据 | Check for entity data
        const types = Array.from(e.dataTransfer.types);
        if (types.includes('entity-id') || types.includes('text/plain')) {
            setIsDragOver(true);
            e.dataTransfer.dropEffect = 'link';
        }
    }, [readonly]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (readonly) return;

        // 必须设置 dropEffect 才能接收 drop | Must set dropEffect to receive drop
        e.dataTransfer.dropEffect = 'link';
    }, [readonly]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // 确保离开的是当前元素而非子元素 | Ensure leaving current element not child
        const relatedTarget = e.relatedTarget as Node | null;
        if (dropZoneRef.current && !dropZoneRef.current.contains(relatedTarget)) {
            setIsDragOver(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (readonly) return;

        // 尝试获取实体 ID | Try to get entity ID
        let droppedId: number | string | null = null;
        let droppedName: string | undefined;

        // 优先使用 entity-id | Prefer entity-id
        const entityIdData = e.dataTransfer.getData('entity-id');
        if (entityIdData) {
            droppedId = isNaN(Number(entityIdData)) ? entityIdData : Number(entityIdData);
        }

        // 获取实体名称 | Get entity name
        const entityNameData = e.dataTransfer.getData('entity-name');
        if (entityNameData) {
            droppedName = entityNameData;
        }

        // 回退到 text/plain | Fallback to text/plain
        if (droppedId === null) {
            const textData = e.dataTransfer.getData('text/plain');
            if (textData) {
                droppedId = isNaN(Number(textData)) ? textData : Number(textData);
            }
        }

        if (droppedId !== null) {
            // 创建完整引用或简单值 | Create full reference or simple value
            if (droppedName) {
                onChange({ id: droppedId, name: droppedName });
            } else {
                onChange(droppedId);
            }
        }
    }, [onChange, readonly]);

    return (
        <div
            ref={dropZoneRef}
            className={`inspector-entity-input ${isDragOver ? 'drag-over' : ''} ${hasValue ? 'has-value' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* 图标 | Icon */}
            <Box size={14} className="inspector-entity-icon" />

            {/* 值显示 | Value display */}
            <div
                className="inspector-entity-value"
                onClick={handleSelect}
                title={hasValue ? `${displayName} (ID: ${entityId})` : 'None - Drag entity here'}
            >
                {displayName || <span className="inspector-entity-placeholder">None</span>}
            </div>

            {/* 操作按钮 | Action buttons */}
            <div className="inspector-entity-actions">
                {/* 定位按钮 | Locate button */}
                {hasValue && onLocateEntity && (
                    <button
                        type="button"
                        className="inspector-entity-btn"
                        onClick={handleLocate}
                        title="Locate in hierarchy"
                    >
                        <Target size={12} />
                    </button>
                )}

                {/* 选择按钮 | Select button */}
                {onSelectEntity && !readonly && (
                    <button
                        type="button"
                        className="inspector-entity-btn"
                        onClick={handleSelect}
                        title="Select entity"
                    >
                        <Link size={12} />
                    </button>
                )}

                {/* 清除按钮 | Clear button */}
                {hasValue && !readonly && (
                    <button
                        type="button"
                        className="inspector-entity-btn inspector-entity-clear"
                        onClick={handleClear}
                        title="Clear"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {/* 拖放提示 | Drop hint */}
            {isDragOver && (
                <div className="inspector-entity-drop-hint">
                    Drop to assign
                </div>
            )}
        </div>
    );
};
