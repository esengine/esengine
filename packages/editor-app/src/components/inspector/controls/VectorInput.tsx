/**
 * VectorInput - 向量输入控件（支持 2D/3D/4D）
 * VectorInput - Vector input control (supports 2D/3D/4D)
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { PropertyControlProps, Vector2, Vector3, Vector4 } from '../types';

type VectorValue = Vector2 | Vector3 | Vector4;
type AxisKey = 'x' | 'y' | 'z' | 'w';

export interface VectorInputProps extends PropertyControlProps<VectorValue> {
    /** 向量维度 | Vector dimensions */
    dimensions?: 2 | 3 | 4;
}

interface AxisInputProps {
    axis: AxisKey;
    value: number;
    onChange: (value: number) => void;
    readonly?: boolean;
}

const AxisInput: React.FC<AxisInputProps> = ({ axis, value, onChange, readonly }) => {
    const [localValue, setLocalValue] = useState(String(value ?? 0));
    const [isFocused, setIsFocused] = useState(false);

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
        setLocalValue(String(num));
        if (num !== value) {
            onChange(num);
        }
    }, [localValue, value, onChange]);

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
        <div className="inspector-vector-axis">
            <span className={`inspector-vector-axis-bar ${axis}`} />
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                disabled={readonly}
            />
        </div>
    );
};

export const VectorInput: React.FC<VectorInputProps> = ({
    value,
    onChange,
    readonly = false,
    dimensions = 3
}) => {
    const axes = useMemo<AxisKey[]>(() => {
        if (dimensions === 2) return ['x', 'y'];
        if (dimensions === 4) return ['x', 'y', 'z', 'w'];
        return ['x', 'y', 'z'];
    }, [dimensions]);

    const handleAxisChange = useCallback((axis: AxisKey, newValue: number) => {
        const newVector = { ...value, [axis]: newValue } as VectorValue;
        onChange(newVector);
    }, [value, onChange]);

    return (
        <div className="inspector-vector-input">
            {axes.map(axis => (
                <AxisInput
                    key={axis}
                    axis={axis}
                    value={(value as any)?.[axis] ?? 0}
                    onChange={(v) => handleAxisChange(axis, v)}
                    readonly={readonly}
                />
            ))}
        </div>
    );
};
