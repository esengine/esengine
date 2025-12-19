/**
 * Entity Reference Field
 * 实体引用字段
 *
 * Allows drag-and-drop of entities from SceneHierarchy.
 * 支持从场景层级面板拖拽实体。
 */

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Core } from '@esengine/ecs-framework';
import { Box, X } from 'lucide-react';
import { useHierarchyStore } from '../../../stores';
import './EntityRefField.css';

export interface EntityRefFieldProps {
    /** Field label | 字段标签 */
    label: string;
    /** Current entity ID (0 = none) | 当前实体 ID (0 = 无) */
    value: number;
    /** Value change callback | 值变更回调 */
    onChange: (value: number) => void;
    /** Placeholder text | 占位文本 */
    placeholder?: string;
    /** Read-only mode | 只读模式 */
    readonly?: boolean;
}

export const EntityRefField: React.FC<EntityRefFieldProps> = ({
    label,
    value,
    onChange,
    placeholder = '拖拽实体到此处',
    readonly = false
}) => {
    const [isDragOver, setIsDragOver] = useState(false);

    // Get entity name for display
    // 获取实体名称用于显示
    const getEntityName = useCallback((): string | null => {
        if (!value || value === 0) return null;
        const scene = Core.scene;
        if (!scene) return null;
        const entity = scene.entities.findEntityById(value);
        return entity?.name || `Entity #${value}`;
    }, [value]);

    const entityName = getEntityName();
    const hasValue = !!entityName;

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        if (readonly) return;
        e.preventDefault();
        e.stopPropagation();
        console.log('[EntityRefField] DragEnter, types:', Array.from(e.dataTransfer.types));
        setIsDragOver(true);
    }, [readonly]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        if (readonly) return;
        // Always accept drag over - validate on drop
        // 始终接受拖拽悬停 - 在放置时验证
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'link';
        if (!isDragOver) {
            setIsDragOver(true);
        }
    }, [readonly, isDragOver]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set drag over false if leaving the element entirely
        // 只有完全离开元素时才取消拖拽状态
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
            setIsDragOver(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        if (readonly) return;

        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        // Debug: log all available types and data
        // 调试：记录所有可用的类型和数据
        const types = Array.from(e.dataTransfer.types);
        console.log('[EntityRefField] Drop - types:', types);
        types.forEach(type => {
            console.log(`[EntityRefField] Drop - ${type}:`, e.dataTransfer.getData(type));
        });

        // Try entity-id first, then fall back to text/plain
        // 优先尝试 entity-id，然后回退到 text/plain
        let entityIdStr = e.dataTransfer.getData('entity-id');
        if (!entityIdStr) {
            entityIdStr = e.dataTransfer.getData('text/plain');
        }

        console.log('[EntityRefField] Drop received, entityIdStr:', entityIdStr);

        if (entityIdStr) {
            const entityId = parseInt(entityIdStr, 10);
            if (!isNaN(entityId) && entityId > 0) {
                console.log('[EntityRefField] Calling onChange with entityId:', entityId);
                onChange(entityId);
            }
        }
    }, [readonly, onChange]);

    const handleClear = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (readonly) return;
        onChange(0);
    }, [readonly, onChange]);

    const handleNavigateToEntity = useCallback(() => {
        if (!value || value === 0) return;

        // Select the referenced entity in SceneHierarchy
        // 在场景层级面板中选择引用的实体
        const { setSelectedIds } = useHierarchyStore.getState();
        setSelectedIds(new Set([value]));
    }, [value]);

    const inputClassName = [
        'entity-ref-field__input',
        isDragOver && 'drag-over',
        readonly && 'readonly',
        hasValue && 'has-value'
    ].filter(Boolean).join(' ');

    return (
        <div className="property-field entity-ref-field">
            <label className="property-label">{label}</label>
            <div
                className={inputClassName}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDropCapture={handleDrop}
            >
                {/* Drop icon */}
                <span className="entity-ref-field__drop-icon">
                    <Box size={14} />
                </span>

                {entityName ? (
                    <>
                        <span
                            className="entity-ref-field__name"
                            onClick={handleNavigateToEntity}
                            title="点击选择此实体 / Click to select this entity"
                        >
                            {entityName}
                        </span>
                        {!readonly && (
                            <button
                                className="entity-ref-field__clear"
                                onClick={handleClear}
                                title="清除引用 / Clear reference"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </>
                ) : (
                    <span className="entity-ref-field__placeholder">{placeholder}</span>
                )}
            </div>
        </div>
    );
};
