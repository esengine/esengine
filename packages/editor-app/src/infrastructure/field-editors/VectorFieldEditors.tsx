import React from 'react';
import { IFieldEditor, FieldEditorProps } from '@esengine/editor-core';

interface Vector2 { x: number; y: number; }
interface Vector3 extends Vector2 { z: number; }
interface Vector4 extends Vector3 { w: number; }

const VectorInput: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    readonly?: boolean;
    axis: 'x' | 'y' | 'z' | 'w';
    step?: number;
}> = ({ label, value, onChange, readonly, axis, step = 0.01 }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        // 允许空字符串、负号、小数点等中间输入状态
        // Allow empty string, minus sign, decimal point as intermediate states
        if (inputValue === '' || inputValue === '-' || inputValue === '.' || inputValue === '-.') {
            return; // 不触发 onChange，等待用户完成输入
        }
        const parsed = parseFloat(inputValue);
        if (!isNaN(parsed)) {
            onChange(parsed);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        // 失去焦点时，如果是无效值则重置为当前值
        // On blur, if value is invalid, reset to current value
        const parsed = parseFloat(e.target.value);
        if (isNaN(parsed)) {
            e.target.value = String(value);
        }
    };

    return (
        <div className="property-vector-axis-compact">
            <span className={`property-vector-axis-label property-vector-axis-${axis}`}>{label}</span>
            <input
                type="number"
                defaultValue={value}
                key={value} // 强制在外部值变化时重新渲染
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={readonly}
                step={step}
                className="property-input property-input-number property-input-number-compact"
            />
        </div>
    );
};

export class Vector2FieldEditor implements IFieldEditor<Vector2> {
    readonly type = 'vector2';
    readonly name = 'Vector2 Field Editor';
    readonly priority = 100;

    canHandle(fieldType: string): boolean {
        return fieldType === 'vector2' || fieldType === 'vec2';
    }

    render({ label, value, onChange, context }: FieldEditorProps<Vector2>): React.ReactElement {
        const v = value || { x: 0, y: 0 };

        return (
            <div className="property-field">
                <label className="property-label">{label}</label>
                <div className="property-vector-compact">
                    <VectorInput
                        label="X"
                        value={v.x}
                        onChange={(x) => onChange({ ...v, x })}
                        readonly={context.readonly}
                        axis="x"
                    />
                    <VectorInput
                        label="Y"
                        value={v.y}
                        onChange={(y) => onChange({ ...v, y })}
                        readonly={context.readonly}
                        axis="y"
                    />
                </div>
            </div>
        );
    }
}

export class Vector3FieldEditor implements IFieldEditor<Vector3> {
    readonly type = 'vector3';
    readonly name = 'Vector3 Field Editor';
    readonly priority = 100;

    canHandle(fieldType: string): boolean {
        return fieldType === 'vector3' || fieldType === 'vec3';
    }

    render({ label, value, onChange, context }: FieldEditorProps<Vector3>): React.ReactElement {
        const v = value || { x: 0, y: 0, z: 0 };

        return (
            <div className="property-field">
                <label className="property-label">{label}</label>
                <div className="property-vector-compact">
                    <VectorInput
                        label="X"
                        value={v.x}
                        onChange={(x) => onChange({ ...v, x })}
                        readonly={context.readonly}
                        axis="x"
                    />
                    <VectorInput
                        label="Y"
                        value={v.y}
                        onChange={(y) => onChange({ ...v, y })}
                        readonly={context.readonly}
                        axis="y"
                    />
                    <VectorInput
                        label="Z"
                        value={v.z}
                        onChange={(z) => onChange({ ...v, z })}
                        readonly={context.readonly}
                        axis="z"
                    />
                </div>
            </div>
        );
    }
}

export class Vector4FieldEditor implements IFieldEditor<Vector4> {
    readonly type = 'vector4';
    readonly name = 'Vector4 Field Editor';
    readonly priority = 100;

    canHandle(fieldType: string): boolean {
        return fieldType === 'vector4' || fieldType === 'vec4' || fieldType === 'quaternion';
    }

    render({ label, value, onChange, context }: FieldEditorProps<Vector4>): React.ReactElement {
        // Support both object {x,y,z,w} and array [0,1,2,3] formats
        // 支持对象 {x,y,z,w} 和数组 [0,1,2,3] 两种格式
        let v: Vector4;
        const isArray = Array.isArray(value);

        if (isArray) {
            const arr = value as unknown as number[];
            v = { x: arr[0] ?? 0, y: arr[1] ?? 0, z: arr[2] ?? 0, w: arr[3] ?? 0 };
        } else {
            v = value || { x: 0, y: 0, z: 0, w: 0 };
        }

        const handleChange = (newV: Vector4) => {
            if (isArray) {
                // Return as array if input was array
                // 如果输入是数组，则返回数组
                onChange([newV.x, newV.y, newV.z, newV.w] as unknown as Vector4);
            } else {
                onChange(newV);
            }
        };

        return (
            <div className="property-field">
                <label className="property-label">{label}</label>
                <div className="property-vector-compact">
                    <VectorInput
                        label="X"
                        value={v.x}
                        onChange={(x) => handleChange({ ...v, x })}
                        readonly={context.readonly}
                        axis="x"
                    />
                    <VectorInput
                        label="Y"
                        value={v.y}
                        onChange={(y) => handleChange({ ...v, y })}
                        readonly={context.readonly}
                        axis="y"
                    />
                    <VectorInput
                        label="Z"
                        value={v.z}
                        onChange={(z) => handleChange({ ...v, z })}
                        readonly={context.readonly}
                        axis="z"
                    />
                    <VectorInput
                        label="W"
                        value={v.w}
                        onChange={(w) => handleChange({ ...v, w })}
                        readonly={context.readonly}
                        axis="w"
                    />
                </div>
            </div>
        );
    }
}
