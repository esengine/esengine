/**
 * ColorInput - 颜色选择控件
 * ColorInput - Color picker control
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { PropertyControlProps } from '../types';

export interface ColorValue {
    r: number;
    g: number;
    b: number;
    a?: number;
}

export interface ColorInputProps extends PropertyControlProps<ColorValue | string> {
    /** 是否显示 Alpha 通道 | Show alpha channel */
    showAlpha?: boolean;
}

/**
 * 将颜色值转换为 CSS 颜色字符串
 * Convert color value to CSS color string
 */
const toHexString = (color: ColorValue | string): string => {
    if (typeof color === 'string') {
        return color;
    }

    const r = Math.round(Math.max(0, Math.min(255, color.r)));
    const g = Math.round(Math.max(0, Math.min(255, color.g)));
    const b = Math.round(Math.max(0, Math.min(255, color.b)));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * 从 Hex 字符串解析颜色
 * Parse color from hex string
 */
const parseHex = (hex: string): ColorValue => {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i);
    if (match && match[1] && match[2] && match[3]) {
        return {
            r: parseInt(match[1], 16),
            g: parseInt(match[2], 16),
            b: parseInt(match[3], 16),
            a: match[4] ? parseInt(match[4], 16) / 255 : 1
        };
    }
    return { r: 0, g: 0, b: 0, a: 1 };
};

export const ColorInput: React.FC<ColorInputProps> = ({
    value,
    onChange,
    readonly = false,
    showAlpha = false
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    // 标准化颜色值 | Normalize color value
    const normalizedValue: ColorValue = typeof value === 'string'
        ? parseHex(value)
        : (value ?? { r: 0, g: 0, b: 0, a: 1 });

    const hexValue = toHexString(normalizedValue);

    const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (readonly) return;

        const newHex = e.target.value;
        const newColor = parseHex(newHex);

        // 保持原始 alpha | Preserve original alpha
        if (typeof value === 'object' && value !== null) {
            newColor.a = value.a;
        }

        onChange(typeof value === 'string' ? newHex : newColor);
    }, [onChange, readonly, value]);

    const handleSwatchClick = useCallback(() => {
        if (readonly) return;
        inputRef.current?.click();
    }, [readonly]);

    // Hex 输入处理 | Hex input handling
    const [hexInput, setHexInput] = useState(hexValue);

    useEffect(() => {
        setHexInput(hexValue);
    }, [hexValue]);

    const handleHexInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setHexInput(newValue);

        // 验证并应用 | Validate and apply
        if (/^#?[a-f\d]{6}$/i.test(newValue)) {
            const newColor = parseHex(newValue);
            if (typeof value === 'object' && value !== null) {
                newColor.a = value.a;
            }
            onChange(typeof value === 'string' ? newValue : newColor);
        }
    }, [onChange, value]);

    const handleHexInputBlur = useCallback(() => {
        // 恢复有效值 | Restore valid value
        setHexInput(hexValue);
    }, [hexValue]);

    return (
        <div className="inspector-color-input">
            {/* 颜色预览块 | Color swatch */}
            <button
                type="button"
                className="inspector-color-swatch"
                style={{ backgroundColor: hexValue }}
                onClick={handleSwatchClick}
                disabled={readonly}
                title="Click to pick color"
            />

            {/* 隐藏的原生颜色选择器 | Hidden native color picker */}
            <input
                ref={inputRef}
                type="color"
                className="inspector-color-native"
                value={hexValue}
                onChange={handleColorChange}
                disabled={readonly}
            />

            {/* Hex 输入框 | Hex input */}
            <input
                type="text"
                className="inspector-color-hex"
                value={hexInput}
                onChange={handleHexInputChange}
                onBlur={handleHexInputBlur}
                disabled={readonly}
                placeholder="#000000"
            />

            {/* Alpha 滑块 | Alpha slider */}
            {showAlpha && (
                <input
                    type="range"
                    className="inspector-color-alpha"
                    min={0}
                    max={1}
                    step={0.01}
                    value={normalizedValue.a ?? 1}
                    onChange={(e) => {
                        if (readonly) return;
                        const newAlpha = parseFloat(e.target.value);
                        onChange({
                            ...normalizedValue,
                            a: newAlpha
                        });
                    }}
                    disabled={readonly}
                />
            )}
        </div>
    );
};
