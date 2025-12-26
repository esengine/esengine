/**
 * CategoryTabs - 分类标签切换
 * CategoryTabs - Category tab switcher
 */

import React, { useCallback } from 'react';
import { CategoryConfig } from '../types';

export interface CategoryTabsProps {
    /** 分类列表 | Category list */
    categories: CategoryConfig[];
    /** 当前选中分类 | Current selected category */
    current: string;
    /** 分类变更回调 | Category change callback */
    onChange: (category: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
    categories,
    current,
    onChange
}) => {
    const handleClick = useCallback((categoryId: string) => {
        onChange(categoryId);
    }, [onChange]);

    return (
        <div className="inspector-category-tabs">
            {categories.map(cat => (
                <button
                    key={cat.id}
                    className={`inspector-category-tab ${current === cat.id ? 'active' : ''}`}
                    onClick={() => handleClick(cat.id)}
                >
                    {cat.label}
                </button>
            ))}
        </div>
    );
};
