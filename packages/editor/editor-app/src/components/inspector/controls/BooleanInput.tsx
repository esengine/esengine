/**
 * BooleanInput - 复选框控件
 * BooleanInput - Checkbox control
 */

import React, { useCallback } from 'react';
import { Check } from 'lucide-react';
import { PropertyControlProps } from '../types';

export interface BooleanInputProps extends PropertyControlProps<boolean> {}

export const BooleanInput: React.FC<BooleanInputProps> = ({
    value,
    onChange,
    readonly = false
}) => {
    const handleClick = useCallback(() => {
        if (!readonly) {
            onChange(!value);
        }
    }, [value, onChange, readonly]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!readonly && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onChange(!value);
        }
    }, [value, onChange, readonly]);

    return (
        <div
            className={`inspector-checkbox ${value ? 'checked' : ''}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={readonly ? -1 : 0}
            role="checkbox"
            aria-checked={value}
            aria-disabled={readonly}
        >
            <Check size={12} className="inspector-checkbox-icon" />
        </div>
    );
};
