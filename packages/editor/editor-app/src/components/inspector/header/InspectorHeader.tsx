/**
 * InspectorHeader - 头部组件（对象名称 + Add 按钮）
 * InspectorHeader - Header component (object name + Add button)
 */

import React from 'react';
import { Plus } from 'lucide-react';

export interface InspectorHeaderProps {
    /** 目标对象名称 | Target object name */
    name: string;
    /** 对象图标 | Object icon */
    icon?: React.ReactNode;
    /** 添加按钮点击 | Add button click */
    onAdd?: () => void;
    /** 是否显示添加按钮 | Show add button */
    showAddButton?: boolean;
}

export const InspectorHeader: React.FC<InspectorHeaderProps> = ({
    name,
    icon,
    onAdd,
    showAddButton = true
}) => {
    return (
        <div className="inspector-header">
            <div className="inspector-header-info">
                {icon && <span className="inspector-header-icon">{icon}</span>}
                <span className="inspector-header-name" title={name}>{name}</span>
            </div>
            {showAddButton && onAdd && (
                <button
                    className="inspector-header-add-btn"
                    onClick={onAdd}
                    title="添加组件 | Add Component"
                >
                    <Plus size={14} />
                    <span>Add</span>
                </button>
            )}
        </div>
    );
};
