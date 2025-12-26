/**
 * PropertyRow - 属性行容器
 * PropertyRow - Property row container
 */

import React, { ReactNode } from 'react';

export interface PropertyRowProps {
    /** 属性标签 | Property label */
    label: ReactNode;
    /** 标签工具提示 | Label tooltip */
    labelTitle?: string;
    /** 嵌套深度 | Nesting depth */
    depth?: number;
    /** 标签是否可拖拽（用于数值调整）| Label draggable for value adjustment */
    draggable?: boolean;
    /** 拖拽开始回调 | Drag start callback */
    onDragStart?: (e: React.MouseEvent) => void;
    /** 子内容（控件）| Children content (control) */
    children: ReactNode;
}

export const PropertyRow: React.FC<PropertyRowProps> = ({
    label,
    labelTitle,
    depth = 0,
    draggable = false,
    onDragStart,
    children
}) => {
    const labelClassName = `inspector-property-label ${draggable ? 'draggable' : ''}`;

    // 生成 title | Generate title
    const title = labelTitle ?? (typeof label === 'string' ? label : undefined);

    return (
        <div className="inspector-property-row" data-depth={depth}>
            <span
                className={labelClassName}
                title={title}
                onMouseDown={draggable ? onDragStart : undefined}
            >
                {label}
            </span>
            <div className="inspector-property-control">
                {children}
            </div>
        </div>
    );
};
