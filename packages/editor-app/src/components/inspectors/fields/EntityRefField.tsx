/**
 * Entity Reference Field
 * 实体引用字段
 *
 * Allows drag-and-drop of entities from SceneHierarchy.
 * 支持从场景层级面板拖拽实体。
 */

import React, { useCallback, useState } from 'react';
import { Core } from '@esengine/ecs-framework';
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
    placeholder = '拖拽实体到此处 / Drop entity here',
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

    const handleDragOver = useCallback((e: React.DragEvent) => {
        if (readonly) return;

        // Check if dragging an entity
        // 检查是否拖拽实体
        if (e.dataTransfer.types.includes('entity-id')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'link';
            setIsDragOver(true);
        }
    }, [readonly]);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        if (readonly) return;

        e.preventDefault();
        setIsDragOver(false);

        const entityIdStr = e.dataTransfer.getData('entity-id');
        if (entityIdStr) {
            const entityId = parseInt(entityIdStr, 10);
            if (!isNaN(entityId) && entityId > 0) {
                onChange(entityId);
            }
        }
    }, [readonly, onChange]);

    const handleClear = useCallback(() => {
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

    return (
        <div className="property-field entity-ref-field">
            <label className="property-label">{label}</label>
            <div
                className={`entity-ref-field__input ${isDragOver ? 'drag-over' : ''} ${readonly ? 'readonly' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
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
                                ×
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
