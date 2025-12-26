/**
 * StringInput - 文本输入控件
 * StringInput - String input control
 */

import React, { useState, useCallback, useEffect } from 'react';
import { PropertyControlProps } from '../types';

export interface StringInputProps extends PropertyControlProps<string> {
    /** 占位文本 | Placeholder text */
    placeholder?: string;
    /** 是否多行 | Multiline mode */
    multiline?: boolean;
}

export const StringInput: React.FC<StringInputProps> = ({
    value,
    onChange,
    readonly = false,
    placeholder = ''
}) => {
    const [localValue, setLocalValue] = useState(value ?? '');
    const [isFocused, setIsFocused] = useState(false);

    // 同步外部值 | Sync external value
    useEffect(() => {
        if (!isFocused) {
            setLocalValue(value ?? '');
        }
    }, [value, isFocused]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    }, []);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
        if (localValue !== value) {
            onChange(localValue);
        }
    }, [localValue, value, onChange]);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        } else if (e.key === 'Escape') {
            setLocalValue(value ?? '');
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
            placeholder={placeholder}
            disabled={readonly}
        />
    );
};
