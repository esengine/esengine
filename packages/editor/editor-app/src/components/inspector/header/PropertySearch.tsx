/**
 * PropertySearch - 属性搜索栏
 * PropertySearch - Property search bar
 */

import React, { useCallback } from 'react';
import { Search, X } from 'lucide-react';

export interface PropertySearchProps {
    /** 搜索关键词 | Search query */
    value: string;
    /** 搜索变更回调 | Search change callback */
    onChange: (value: string) => void;
    /** 占位文本 | Placeholder text */
    placeholder?: string;
}

export const PropertySearch: React.FC<PropertySearchProps> = ({
    value,
    onChange,
    placeholder = 'Search...'
}) => {
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    }, [onChange]);

    const handleClear = useCallback(() => {
        onChange('');
    }, [onChange]);

    return (
        <div className="inspector-search">
            <Search size={14} className="inspector-search-icon" />
            <input
                type="text"
                className="inspector-search-input"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
            />
            {value && (
                <button
                    className="inspector-search-clear"
                    onClick={handleClear}
                    title="清除 | Clear"
                >
                    <X size={12} />
                </button>
            )}
        </div>
    );
};
