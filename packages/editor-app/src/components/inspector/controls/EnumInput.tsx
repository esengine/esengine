/**
 * EnumInput - 下拉选择控件
 * EnumInput - Dropdown select control
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { PropertyControlProps } from '../types';

export interface EnumOption {
    label: string;
    value: string | number;
}

export interface EnumInputProps extends PropertyControlProps<string | number> {
    /** 选项列表 | Options list */
    options: EnumOption[];
    /** 占位文本 | Placeholder text */
    placeholder?: string;
}

export const EnumInput: React.FC<EnumInputProps> = ({
    value,
    onChange,
    readonly = false,
    options = [],
    placeholder = '选择...'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 点击外部关闭 | Close on outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleToggle = useCallback(() => {
        if (!readonly) {
            setIsOpen(prev => !prev);
        }
    }, [readonly]);

    const handleSelect = useCallback((optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
    }, [onChange]);

    const selectedOption = options.find(opt => opt.value === value);
    const displayValue = selectedOption?.label ?? placeholder;

    return (
        <div className="inspector-dropdown" ref={containerRef}>
            <div
                className={`inspector-dropdown-trigger ${isOpen ? 'open' : ''}`}
                onClick={handleToggle}
            >
                <span className="inspector-dropdown-value">{displayValue}</span>
                <ChevronDown size={12} className="inspector-dropdown-arrow" />
            </div>

            {isOpen && (
                <div className="inspector-dropdown-menu">
                    {options.map(option => (
                        <div
                            key={option.value}
                            className={`inspector-dropdown-item ${option.value === value ? 'selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
