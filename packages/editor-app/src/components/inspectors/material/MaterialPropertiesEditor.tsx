/**
 * Material properties editor component.
 * 材质属性编辑器组件。
 *
 * This component provides a UI for editing shader uniform values
 * based on shader property metadata.
 * 此组件提供基于着色器属性元数据编辑着色器 uniform 值的 UI。
 */

import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Palette } from 'lucide-react';
import type {
    IMaterialOverridable,
    ShaderPropertyMeta,
    MaterialPropertyOverride
} from '@esengine/material-system';
import {
    BuiltInShaders,
    getShaderPropertiesById
} from '@esengine/material-system';

// Shader name mapping
const SHADER_NAMES: Record<number, string> = {
    0: 'DefaultSprite',
    1: 'Grayscale',
    2: 'Tint',
    3: 'Flash',
    4: 'Outline',
    5: 'Shiny'
};

interface MaterialPropertiesEditorProps {
    /** Target component implementing IMaterialOverridable */
    target: IMaterialOverridable;
    /** Callback when property changes */
    onChange?: (name: string, value: MaterialPropertyOverride) => void;
}

/**
 * Material properties editor.
 * 材质属性编辑器。
 */
export const MaterialPropertiesEditor: React.FC<MaterialPropertiesEditorProps> = ({
    target,
    onChange
}) => {
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Effect', 'Default']));

    const materialId = target.getMaterialId();
    const shaderName = SHADER_NAMES[materialId] || `Custom(${materialId})`;
    const properties = getShaderPropertiesById(materialId);

    // Group properties
    const groupedProps = useMemo(() => {
        if (!properties) return {};

        const groups: Record<string, Array<[string, ShaderPropertyMeta]>> = {};
        for (const [name, meta] of Object.entries(properties)) {
            if (meta.hidden) continue;
            const group = meta.group || 'Default';
            if (!groups[group]) groups[group] = [];
            groups[group].push([name, meta]);
        }
        return groups;
    }, [properties]);

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(group)) {
                next.delete(group);
            } else {
                next.add(group);
            }
            return next;
        });
    };

    const handleChange = (name: string, meta: ShaderPropertyMeta, newValue: number | number[]) => {
        const override: MaterialPropertyOverride = {
            type: meta.type === 'texture' ? 'int' : meta.type as MaterialPropertyOverride['type'],
            value: newValue
        };

        // Apply to target
        switch (meta.type) {
            case 'float':
                target.setOverrideFloat(name, newValue as number);
                break;
            case 'int':
                target.setOverrideInt(name, newValue as number);
                break;
            case 'vec2':
                const v2 = newValue as number[];
                target.setOverrideVec2(name, v2[0] ?? 0, v2[1] ?? 0);
                break;
            case 'vec3':
                const v3 = newValue as number[];
                target.setOverrideVec3(name, v3[0] ?? 0, v3[1] ?? 0, v3[2] ?? 0);
                break;
            case 'vec4':
                const v4 = newValue as number[];
                target.setOverrideVec4(name, v4[0] ?? 0, v4[1] ?? 0, v4[2] ?? 0, v4[3] ?? 0);
                break;
            case 'color':
                const c = newValue as number[];
                target.setOverrideColor(name, c[0] ?? 1, c[1] ?? 1, c[2] ?? 1, c[3] ?? 1);
                break;
        }

        onChange?.(name, override);
    };

    const getCurrentValue = (name: string, meta: ShaderPropertyMeta): number | number[] => {
        const override = target.getOverride(name);
        if (override) {
            return override.value as number | number[];
        }
        return meta.default as number | number[] ?? (meta.type === 'color' ? [1, 1, 1, 1] : 0);
    };

    // Parse i18n label
    const parseLabel = (label: string): string => {
        // Format: "中文 | English" - for now just return as-is
        return label;
    };

    return (
        <div className="material-properties-editor" style={{ fontSize: '12px' }}>
            {/* Shader selector */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 8px',
                backgroundColor: '#3a3a3a',
                borderRadius: '4px',
                marginBottom: '8px'
            }}>
                <Palette size={14} style={{ marginRight: '8px', color: '#888' }} />
                <span style={{ color: '#aaa', marginRight: '8px' }}>Shader:</span>
                <select
                    value={materialId}
                    onChange={(e) => target.setMaterialId(Number(e.target.value))}
                    style={{
                        flex: 1,
                        backgroundColor: '#2a2a2a',
                        color: '#e0e0e0',
                        border: '1px solid #4a4a4a',
                        borderRadius: '3px',
                        padding: '3px 6px',
                        fontSize: '12px'
                    }}
                >
                    <option value={0}>DefaultSprite</option>
                    <option value={1}>Grayscale</option>
                    <option value={2}>Tint</option>
                    <option value={3}>Flash</option>
                    <option value={4}>Outline</option>
                    <option value={5}>Shiny</option>
                </select>
            </div>

            {/* Property groups */}
            {Object.entries(groupedProps).map(([group, props]) => (
                <div key={group} style={{ marginBottom: '4px' }}>
                    {/* Group header */}
                    <div
                        onClick={() => toggleGroup(group)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px 8px',
                            backgroundColor: '#333',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            userSelect: 'none'
                        }}
                    >
                        {expandedGroups.has(group) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        <span style={{ marginLeft: '4px', color: '#aaa', fontWeight: 500 }}>{group}</span>
                    </div>

                    {/* Properties */}
                    {expandedGroups.has(group) && (
                        <div style={{ padding: '4px 8px' }}>
                            {props.map(([name, meta]) => (
                                <PropertyEditor
                                    key={name}
                                    name={name}
                                    meta={meta}
                                    value={getCurrentValue(name, meta)}
                                    onChange={(v) => handleChange(name, meta, v)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {!properties && (
                <div style={{ color: '#666', padding: '8px', fontStyle: 'italic' }}>
                    No editable properties for {shaderName}
                </div>
            )}
        </div>
    );
};

interface PropertyEditorProps {
    name: string;
    meta: ShaderPropertyMeta;
    value: number | number[];
    onChange: (value: number | number[]) => void;
}

/**
 * Individual property editor.
 * 单个属性编辑器。
 */
const PropertyEditor: React.FC<PropertyEditorProps> = ({ name, meta, value, onChange }) => {
    const displayName = name.replace(/^u_/, '');

    const inputStyle: React.CSSProperties = {
        backgroundColor: '#2a2a2a',
        color: '#e0e0e0',
        border: '1px solid #4a4a4a',
        borderRadius: '3px',
        padding: '2px 6px',
        fontSize: '11px',
        width: '60px'
    };

    const renderInput = () => {
        switch (meta.type) {
            case 'float':
            case 'int':
                return (
                    <input
                        type="number"
                        value={typeof value === 'number' ? value : 0}
                        min={meta.min}
                        max={meta.max}
                        step={meta.step ?? (meta.type === 'int' ? 1 : 0.01)}
                        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                        style={inputStyle}
                    />
                );

            case 'vec2':
                const v2 = Array.isArray(value) ? value : [0, 0];
                const v2x = v2[0] ?? 0;
                const v2y = v2[1] ?? 0;
                return (
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                            type="number"
                            value={v2x}
                            step={meta.step ?? 0.01}
                            onChange={(e) => onChange([parseFloat(e.target.value) || 0, v2y])}
                            style={{ ...inputStyle, width: '50px' }}
                        />
                        <input
                            type="number"
                            value={v2y}
                            step={meta.step ?? 0.01}
                            onChange={(e) => onChange([v2x, parseFloat(e.target.value) || 0])}
                            style={{ ...inputStyle, width: '50px' }}
                        />
                    </div>
                );

            case 'vec3':
                const v3 = Array.isArray(value) ? value : [0, 0, 0];
                return (
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[0, 1, 2].map(i => (
                            <input
                                key={i}
                                type="number"
                                value={v3[i]}
                                step={meta.step ?? 0.01}
                                onChange={(e) => {
                                    const newVal = [...v3];
                                    newVal[i] = parseFloat(e.target.value) || 0;
                                    onChange(newVal);
                                }}
                                style={{ ...inputStyle, width: '40px' }}
                            />
                        ))}
                    </div>
                );

            case 'vec4':
                const v4 = Array.isArray(value) ? value : [0, 0, 0, 0];
                return (
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[0, 1, 2, 3].map(i => (
                            <input
                                key={i}
                                type="number"
                                value={v4[i]}
                                step={meta.step ?? 0.01}
                                onChange={(e) => {
                                    const newVal = [...v4];
                                    newVal[i] = parseFloat(e.target.value) || 0;
                                    onChange(newVal);
                                }}
                                style={{ ...inputStyle, width: '35px' }}
                            />
                        ))}
                    </div>
                );

            case 'color':
                const c = Array.isArray(value) ? value : [1, 1, 1, 1];
                const cr = c[0] ?? 1;
                const cg = c[1] ?? 1;
                const cb = c[2] ?? 1;
                const ca = c[3] ?? 1;
                const hexColor = `#${Math.round(cr * 255).toString(16).padStart(2, '0')}${Math.round(cg * 255).toString(16).padStart(2, '0')}${Math.round(cb * 255).toString(16).padStart(2, '0')}`;
                return (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                            type="color"
                            value={hexColor}
                            onChange={(e) => {
                                const hex = e.target.value;
                                const r = parseInt(hex.slice(1, 3), 16) / 255;
                                const g = parseInt(hex.slice(3, 5), 16) / 255;
                                const b = parseInt(hex.slice(5, 7), 16) / 255;
                                onChange([r, g, b, ca]);
                            }}
                            style={{ width: '24px', height: '20px', padding: 0, border: 'none' }}
                        />
                        <input
                            type="number"
                            value={ca}
                            min={0}
                            max={1}
                            step={0.01}
                            onChange={(e) => onChange([cr, cg, cb, parseFloat(e.target.value) || 1])}
                            style={{ ...inputStyle, width: '40px' }}
                            title="Alpha"
                        />
                    </div>
                );

            default:
                return <span style={{ color: '#666' }}>Unsupported type: {meta.type}</span>;
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '3px 0',
            borderBottom: '1px solid #333'
        }}>
            <span style={{ color: '#aaa' }} title={meta.tooltip}>
                {displayName}
            </span>
            {renderInput()}
        </div>
    );
};

export default MaterialPropertiesEditor;
