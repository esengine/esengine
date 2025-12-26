/**
 * NumberInput - 数值输入控件
 * NumberInput - Number input control
 */

import React, { useState, useCallback, useEffect } from 'react';
import { PropertyControlProps } from '../types';

export interface NumberInputProps extends PropertyControlProps<number> {
    /** 最小值 | Minimum value */
    min?: number;
    /** 最大值 | Maximum value */
    max?: number;
    /** 步进值 | Step value */
    step?: number;
    /** 是否为整数 | Integer only */
    integer?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
    value,
    onChange,
    readonly = false,
    min,
    max,
    step = 1,
    integer = false
}) => {
    const [localValue, setLocalValue] = useState(String(value ?? 0));
    const [isFocused, setIsFocused] = useState(false);

    // 同步外部值 | Sync external value
    useEffect(() => {
        if (!isFocused) {
            setLocalValue(String(value ?? 0));
        }
    }, [value, isFocused]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    }, []);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
        let num = parseFloat(localValue);

        if (isNaN(num)) {
            num = value ?? 0;
        }

        // 应用约束 | Apply constraints
        if (integer) {
            num = Math.round(num);
        }
        if (min !== undefined) {
            num = Math.max(min, num);
        }
        if (max !== undefined) {
            num = Math.min(max, num);
        }

        setLocalValue(String(num));
        if (num !== value) {
            onChange(num);
        }
    }, [localValue, value, onChange, integer, min, max]);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        } else if (e.key === 'Escape') {
            setLocalValue(String(value ?? 0));
            e.currentTarget.blur();
        }
    }, [value]);

    return (
        <input
            type="text"
            className="inspector-input"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            disabled={readonly}
        />
    );
};
