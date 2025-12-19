/**
 * PropertySection - 可折叠的属性分组
 * PropertySection - Collapsible property group
 */

import React, { useState, useCallback, ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

export interface PropertySectionProps {
    /** Section 标题 | Section title */
    title: string;
    /** 默认展开状态 | Default expanded state */
    defaultExpanded?: boolean;
    /** 子内容 | Children content */
    children: ReactNode;
    /** 嵌套深度 | Nesting depth */
    depth?: number;
}

export const PropertySection: React.FC<PropertySectionProps> = ({
    title,
    defaultExpanded = true,
    children,
    depth = 0
}) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const handleToggle = useCallback(() => {
        setExpanded(prev => !prev);
    }, []);

    const paddingLeft = depth * 16;

    return (
        <div className="inspector-section">
            <div
                className="inspector-section-header"
                onClick={handleToggle}
                style={{ paddingLeft: paddingLeft + 8 }}
            >
                <span className={`inspector-section-arrow ${expanded ? 'expanded' : ''}`}>
                    <ChevronRight size={12} />
                </span>
                <span className="inspector-section-title">{title}</span>
            </div>
            <div className={`inspector-section-content ${expanded ? 'expanded' : ''}`}>
                {children}
            </div>
        </div>
    );
};
