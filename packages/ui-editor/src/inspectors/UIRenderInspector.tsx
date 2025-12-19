/**
 * UI Render Component Inspector.
 * UI 渲染组件检查器。
 *
 * Provides unified material editing for UIRenderComponent.
 * 为 UIRenderComponent 提供统一的材质编辑。
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Component, Core } from '@esengine/ecs-framework';
import type { IComponentInspector, ComponentInspectorContext } from '@esengine/editor-core';
import { MessageHub } from '@esengine/editor-core';
import { UIRenderComponent } from '@esengine/ui';
import type { ShaderPropertyMeta } from '@esengine/material-system';
import { getShaderPropertiesById } from '@esengine/material-system';
import { ChevronDown, ChevronRight, Palette, X, Plus, FileBox } from 'lucide-react';

/**
 * Material source type.
 * 材质来源类型。
 */
type MaterialSource = 'none' | 'builtin' | 'asset';

/**
 * Built-in effect options.
 * 内置效果选项。
 */
const BUILTIN_EFFECTS = [
    { id: 1, name: 'Grayscale', description: 'Convert to grayscale' },
    { id: 2, name: 'Tint', description: 'Apply color tint' },
    { id: 3, name: 'Flash', description: 'Flash effect for hit feedback' },
    { id: 4, name: 'Outline', description: 'Add outline border' },
    { id: 5, name: 'Shiny', description: 'Animated shine sweep' },
];

// Uniform type display names
const UNIFORM_TYPE_LABELS: Record<string, string> = {
    'float': 'Float',
    'int': 'Int',
    'vec2': 'Vec2',
    'vec3': 'Vec3',
    'vec4': 'Vec4',
    'color': 'Color',
};

/**
 * Single number input with local state to prevent focus loss.
 * 带本地状态的单数字输入框，防止失焦。
 */
function NumberInput({ value, onChange, min, max, step, style }: {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    style?: React.CSSProperties;
}) {
    const [localValue, setLocalValue] = useState(String(value));
    const [isFocused, setIsFocused] = useState(false);

    // Sync from prop when not focused
    // 未聚焦时从 prop 同步
    React.useEffect(() => {
        if (!isFocused) {
            setLocalValue(String(value));
        }
    }, [value, isFocused]);

    const handleBlur = () => {
        setIsFocused(false);
        const parsed = parseFloat(localValue);
        if (!isNaN(parsed)) {
            onChange(parsed);
        } else {
            setLocalValue(String(value));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <input
            type="number"
            value={localValue}
            min={min}
            max={max}
            step={step}
            onChange={(e) => setLocalValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={style}
        />
    );
}

/**
 * Convert radians to degrees.
 * 弧度转角度。
 */
function radToDeg(rad: number): number {
    return rad * 180 / Math.PI;
}

/**
 * Convert degrees to radians.
 * 角度转弧度。
 */
function degToRad(deg: number): number {
    return deg * Math.PI / 180;
}

/**
 * Property value editor component.
 * 属性值编辑器组件。
 */
function PropertyValueEditor({ meta, value, onChange }: {
    meta: ShaderPropertyMeta;
    value: number | number[];
    onChange: (value: number | number[]) => void;
}) {
    const inputStyle: React.CSSProperties = {
        backgroundColor: 'var(--color-bg-inset)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-sm)',
        padding: '2px 6px',
        fontSize: '11px',
        width: '60px'
    };

    switch (meta.type) {
        case 'float':
        case 'int': {
            // Handle 'angle' hint: display degrees, store radians
            // 处理 'angle' 提示：显示角度，存储弧度
            const isAngle = meta.hint === 'angle';
            const numValue = typeof value === 'number' ? value : 0;
            const displayValue = isAngle ? radToDeg(numValue) : numValue;
            const displayMin = isAngle && meta.min !== undefined ? radToDeg(meta.min) : meta.min;
            const displayMax = isAngle && meta.max !== undefined ? radToDeg(meta.max) : meta.max;
            const displayStep = isAngle ? 1 : (meta.step ?? (meta.type === 'int' ? 1 : 0.01));

            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <NumberInput
                        value={displayValue}
                        min={displayMin}
                        max={displayMax}
                        step={displayStep}
                        onChange={(v) => {
                            const storeValue = isAngle ? degToRad(v) : v;
                            (onChange as (v: number) => void)(storeValue);
                        }}
                        style={inputStyle}
                    />
                    {isAngle && (
                        <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>°</span>
                    )}
                </div>
            );
        }

        case 'vec2': {
            const v2 = Array.isArray(value) ? value : [0, 0];
            return (
                <div style={{ display: 'flex', gap: '4px' }}>
                    <NumberInput
                        value={v2[0] ?? 0}
                        step={meta.step ?? 0.01}
                        onChange={(v) => onChange([v, v2[1] ?? 0])}
                        style={{ ...inputStyle, width: '50px' }}
                    />
                    <NumberInput
                        value={v2[1] ?? 0}
                        step={meta.step ?? 0.01}
                        onChange={(v) => onChange([v2[0] ?? 0, v])}
                        style={{ ...inputStyle, width: '50px' }}
                    />
                </div>
            );
        }

        case 'vec3': {
            const v3 = Array.isArray(value) ? value : [0, 0, 0];
            return (
                <div style={{ display: 'flex', gap: '4px' }}>
                    {[0, 1, 2].map(i => (
                        <NumberInput
                            key={i}
                            value={v3[i] ?? 0}
                            step={meta.step ?? 0.01}
                            onChange={(v) => {
                                const newVal = [...v3];
                                newVal[i] = v;
                                onChange(newVal);
                            }}
                            style={{ ...inputStyle, width: '40px' }}
                        />
                    ))}
                </div>
            );
        }

        case 'vec4': {
            const v4 = Array.isArray(value) ? value : [0, 0, 0, 0];
            return (
                <div style={{ display: 'flex', gap: '4px' }}>
                    {[0, 1, 2, 3].map(i => (
                        <NumberInput
                            key={i}
                            value={v4[i] ?? 0}
                            step={meta.step ?? 0.01}
                            onChange={(v) => {
                                const newVal = [...v4];
                                newVal[i] = v;
                                onChange(newVal);
                            }}
                            style={{ ...inputStyle, width: '35px' }}
                        />
                    ))}
                </div>
            );
        }

        case 'color': {
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
                    <NumberInput
                        value={ca}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(v) => onChange([cr, cg, cb, v])}
                        style={{ ...inputStyle, width: '40px' }}
                    />
                </div>
            );
        }

        default:
            return <span style={{ color: 'var(--color-text-tertiary)' }}>Unsupported</span>;
    }
}

/**
 * Determine material source from component state.
 * 从组件状态确定材质来源。
 */
function getMaterialSource(render: UIRenderComponent): MaterialSource {
    if (render.materialGuid && render.materialGuid.length > 0) {
        return 'asset';
    }
    if (render.getMaterialId() !== 0) {
        return 'builtin';
    }
    return 'none';
}

/**
 * UI Render Inspector content component.
 * UI 渲染检查器内容组件。
 */
function UIRenderInspectorContent({ context }: { context: ComponentInspectorContext }) {
    const render = context.component as UIRenderComponent;
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Effect', 'Default']));
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [, forceUpdate] = useState({});

    // Determine current state
    const materialSource = getMaterialSource(render);
    const materialId = render.getMaterialId();
    const properties = getShaderPropertiesById(materialId);

    // Get effect name for display
    const effectName = BUILTIN_EFFECTS.find(e => e.id === materialId)?.name || '';

    // Group properties
    const groupedProps = useMemo(() => {
        if (!properties) return {};

        const groups: Record<string, Array<[string, ShaderPropertyMeta]>> = {};
        for (const [name, meta] of Object.entries(properties) as [string, ShaderPropertyMeta][]) {
            if (meta.hidden) continue;
            const group = meta.group || 'Default';
            if (!groups[group]) groups[group] = [];
            groups[group].push([name, meta]);
        }
        return groups;
    }, [properties]);

    // Get available properties for override
    const availableProperties = useMemo((): Array<{ name: string; meta: ShaderPropertyMeta }> => {
        if (!properties) return [];
        const currentOverrides = render.materialOverrides || {};
        return (Object.entries(properties) as [string, ShaderPropertyMeta][])
            .filter(([name, meta]) => !meta.hidden && !currentOverrides[name])
            .map(([name, meta]) => ({ name, meta }));
    }, [properties, render.materialOverrides]);

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

    const notifyChange = useCallback(() => {
        forceUpdate({});
        const messageHub = Core.services.tryResolve(MessageHub);
        if (messageHub) {
            messageHub.publish('scene:modified', {});
        }
    }, []);

    // Handle source change
    const handleSourceChange = useCallback((newSource: MaterialSource) => {
        if (newSource === 'none') {
            render.materialGuid = '';
            render.setMaterialId(0);
            render.clearOverrides();
        } else if (newSource === 'builtin') {
            render.materialGuid = '';
            // Set to first effect if currently none
            if (render.getMaterialId() === 0) {
                render.setMaterialId(1); // Grayscale
            }
            render.clearOverrides();
        } else if (newSource === 'asset') {
            render.setMaterialId(0);
            render.clearOverrides();
            // materialGuid will be set by asset picker
        }
        context.onChange?.('materialGuid', render.materialGuid);
        notifyChange();
    }, [render, context, notifyChange]);

    // Handle effect change
    const handleEffectChange = useCallback((effectId: number) => {
        render.setMaterialId(effectId);
        render.clearOverrides();
        context.onChange?.('_materialId', effectId);
        notifyChange();
    }, [render, context, notifyChange]);

    // Handle asset change
    const handleAssetChange = useCallback((assetGuid: string) => {
        render.materialGuid = assetGuid;
        context.onChange?.('materialGuid', assetGuid);
        notifyChange();
    }, [render, context, notifyChange]);

    // Handle property change
    const handlePropertyChange = useCallback((name: string, meta: ShaderPropertyMeta, newValue: number | number[]) => {
        switch (meta.type) {
            case 'float':
                render.setOverrideFloat(name, newValue as number);
                break;
            case 'int':
                render.setOverrideInt(name, newValue as number);
                break;
            case 'vec2': {
                const v2 = newValue as number[];
                render.setOverrideVec2(name, v2[0] ?? 0, v2[1] ?? 0);
                break;
            }
            case 'vec3': {
                const v3 = newValue as number[];
                render.setOverrideVec3(name, v3[0] ?? 0, v3[1] ?? 0, v3[2] ?? 0);
                break;
            }
            case 'vec4': {
                const v4 = newValue as number[];
                render.setOverrideVec4(name, v4[0] ?? 0, v4[1] ?? 0, v4[2] ?? 0, v4[3] ?? 0);
                break;
            }
            case 'color': {
                const c = newValue as number[];
                render.setOverrideColor(name, c[0] ?? 1, c[1] ?? 1, c[2] ?? 1, c[3] ?? 1);
                break;
            }
        }
        context.onChange?.('materialOverrides', render.materialOverrides);
        notifyChange();
    }, [render, context, notifyChange]);

    const handleRemoveOverride = useCallback((name: string) => {
        render.removeOverride(name);
        context.onChange?.('materialOverrides', render.materialOverrides);
        notifyChange();
    }, [render, context, notifyChange]);

    const handleAddOverride = useCallback((name: string, meta: ShaderPropertyMeta) => {
        const defaultValue = meta.default ?? (meta.type === 'color' ? [1, 1, 1, 1] : 0);
        handlePropertyChange(name, meta, defaultValue as number | number[]);
        setShowAddMenu(false);
    }, [handlePropertyChange]);

    const getCurrentValue = (name: string, meta: ShaderPropertyMeta): number | number[] => {
        const override = render.getOverride(name);
        if (override) {
            return override.value as number | number[];
        }
        return meta.default as number | number[] ?? (meta.type === 'color' ? [1, 1, 1, 1] : 0);
    };

    const currentOverrides = render.materialOverrides || {};
    const overrideKeys = Object.keys(currentOverrides);

    // Styles
    const selectStyle: React.CSSProperties = {
        flex: 1,
        backgroundColor: 'var(--color-bg-inset)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-sm)',
        padding: '4px 8px',
        fontSize: '12px'
    };

    const rowStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        marginBottom: '4px'
    };

    const labelStyle: React.CSSProperties = {
        color: 'var(--color-text-secondary)',
        marginRight: '8px',
        minWidth: '60px',
        fontSize: '12px'
    };

    return (
        <div style={{ fontSize: '12px', marginTop: '8px' }}>
            {/* Section header */}
            <div style={{
                padding: '6px 8px',
                backgroundColor: 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Palette size={14} style={{ color: materialSource !== 'none' ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }} />
                    <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Material</span>
                </div>
                {materialSource === 'builtin' && effectName && (
                    <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        backgroundColor: 'var(--color-primary-subtle)',
                        color: 'var(--color-primary)',
                        borderRadius: 'var(--radius-sm)'
                    }}>
                        {effectName}
                    </span>
                )}
                {materialSource === 'asset' && (
                    <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        backgroundColor: 'var(--color-success-subtle)',
                        color: 'var(--color-success)',
                        borderRadius: 'var(--radius-sm)'
                    }}>
                        Asset
                    </span>
                )}
            </div>

            {/* Source selector */}
            <div style={rowStyle}>
                <span style={labelStyle}>Source</span>
                <select
                    value={materialSource}
                    onChange={(e) => handleSourceChange(e.target.value as MaterialSource)}
                    style={selectStyle}
                >
                    <option value="none">None (Default)</option>
                    <option value="builtin">Built-in Effect</option>
                    <option value="asset">Material Asset</option>
                </select>
            </div>

            {/* None selected hint */}
            {materialSource === 'none' && (
                <div style={{
                    padding: '12px',
                    margin: '4px 8px 8px',
                    backgroundColor: 'var(--color-bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-tertiary)',
                    fontSize: '11px',
                    textAlign: 'center'
                }}>
                    No material effect applied.<br />
                    Select a source above to add visual effects.
                </div>
            )}

            {/* Built-in effect selector */}
            {materialSource === 'builtin' && (
                <>
                    <div style={rowStyle}>
                        <span style={labelStyle}>Effect</span>
                        <select
                            value={materialId}
                            onChange={(e) => handleEffectChange(Number(e.target.value))}
                            style={selectStyle}
                        >
                            {BUILTIN_EFFECTS.map(effect => (
                                <option key={effect.id} value={effect.id}>
                                    {effect.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Effect description */}
                    {effectName && (
                        <div style={{
                            padding: '4px 8px',
                            marginBottom: '8px',
                            color: 'var(--color-text-tertiary)',
                            fontSize: '10px',
                            fontStyle: 'italic'
                        }}>
                            {BUILTIN_EFFECTS.find(e => e.id === materialId)?.description}
                        </div>
                    )}

                    {/* Overrides section */}
                    {overrideKeys.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                            <div style={{
                                padding: '4px 8px',
                                backgroundColor: 'var(--color-bg-subtle)',
                                borderRadius: 'var(--radius-sm)',
                                marginBottom: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>
                                    Overrides ({overrideKeys.length})
                                </span>
                            </div>
                            {overrideKeys.map(key => {
                                const override = currentOverrides[key];
                                if (!override) return null;
                                const meta = properties?.[key];
                                if (!meta) return null;

                                return (
                                    <div key={key} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '4px 8px',
                                        borderBottom: '1px solid var(--color-border-muted)'
                                    }}>
                                        <span style={{ color: 'var(--color-text-secondary)', minWidth: '80px' }} title={meta.tooltip}>
                                            {key.replace(/^u_/, '')}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <PropertyValueEditor
                                                meta={meta}
                                                value={override.value as number | number[]}
                                                onChange={(v) => handlePropertyChange(key, meta, v)}
                                            />
                                            <button
                                                onClick={() => handleRemoveOverride(key)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: '2px',
                                                    cursor: 'pointer',
                                                    color: 'var(--color-text-tertiary)',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                                title="Remove override"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Property groups */}
                    {Object.entries(groupedProps).map(([group, props]) => (
                        <div key={group} style={{ marginBottom: '4px' }}>
                            <div
                                onClick={() => toggleGroup(group)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '4px 8px',
                                    backgroundColor: 'var(--color-bg-subtle)',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
                            >
                                {expandedGroups.has(group) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                <span style={{ marginLeft: '4px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{group}</span>
                            </div>

                            {expandedGroups.has(group) && (
                                <div style={{ padding: '4px 8px' }}>
                                    {props.map(([name, meta]) => {
                                        const hasOverride = !!currentOverrides[name];
                                        return (
                                            <div key={name} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '3px 0',
                                                borderBottom: '1px solid var(--color-border-muted)',
                                                opacity: hasOverride ? 1 : 0.7
                                            }}>
                                                <span
                                                    style={{
                                                        color: hasOverride ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                                                        cursor: 'pointer'
                                                    }}
                                                    title={meta.tooltip || `Click to add override for ${name}`}
                                                    onClick={() => !hasOverride && handleAddOverride(name, meta)}
                                                >
                                                    {name.replace(/^u_/, '')}
                                                    {!hasOverride && <Plus size={10} style={{ marginLeft: '4px', opacity: 0.5 }} />}
                                                </span>
                                                {hasOverride ? (
                                                    <PropertyValueEditor
                                                        meta={meta}
                                                        value={getCurrentValue(name, meta)}
                                                        onChange={(v) => handlePropertyChange(name, meta, v)}
                                                    />
                                                ) : (
                                                    <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>
                                                        {typeof meta.default === 'number' ? meta.default.toFixed(2) : 'default'}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add override button */}
                    {availableProperties.length > 0 && (
                        <div style={{ position: 'relative', padding: '4px 8px' }}>
                            <button
                                onClick={() => setShowAddMenu(!showAddMenu)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 8px',
                                    backgroundColor: 'var(--color-bg-subtle)',
                                    border: '1px solid var(--color-border-default)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--color-text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                }}
                            >
                                <Plus size={12} />
                                <span>Add Override</span>
                            </button>
                            {showAddMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '8px',
                                    zIndex: 100,
                                    backgroundColor: 'var(--color-bg-elevated)',
                                    border: '1px solid var(--color-border-default)',
                                    borderRadius: 'var(--radius-sm)',
                                    boxShadow: 'var(--shadow-lg)',
                                    minWidth: '180px',
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
                                    {availableProperties.map(({ name, meta }) => (
                                        <button
                                            key={name}
                                            onClick={() => handleAddOverride(name, meta)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                                padding: '6px 8px',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                borderBottom: '1px solid var(--color-border-muted)',
                                                color: 'var(--color-text-primary)',
                                                cursor: 'pointer',
                                                fontSize: '11px',
                                                textAlign: 'left'
                                            }}
                                        >
                                            <span>{name.replace(/^u_/, '')}</span>
                                            <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>
                                                {UNIFORM_TYPE_LABELS[meta.type] || meta.type}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty state for effect without properties */}
                    {!properties && (
                        <div style={{
                            padding: '8px 12px',
                            margin: '0 8px',
                            backgroundColor: 'var(--color-bg-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-text-tertiary)',
                            fontSize: '11px',
                            fontStyle: 'italic'
                        }}>
                            No editable properties for this effect
                        </div>
                    )}
                </>
            )}

            {/* Material Asset selector */}
            {materialSource === 'asset' && (
                <div style={{ padding: '4px 8px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px',
                        backgroundColor: 'var(--color-bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px dashed var(--color-border-default)'
                    }}>
                        <FileBox size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                        <div style={{ flex: 1 }}>
                            <input
                                type="text"
                                value={render.materialGuid}
                                onChange={(e) => handleAssetChange(e.target.value)}
                                placeholder="Drag .mat file here or enter GUID"
                                style={{
                                    width: '100%',
                                    backgroundColor: 'var(--color-bg-inset)',
                                    color: 'var(--color-text-primary)',
                                    border: '1px solid var(--color-border-default)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '4px 8px',
                                    fontSize: '11px'
                                }}
                            />
                        </div>
                        {render.materialGuid && (
                            <button
                                onClick={() => handleAssetChange('')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '2px',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-tertiary)'
                                }}
                                title="Clear"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div style={{
                        padding: '8px',
                        color: 'var(--color-text-tertiary)',
                        fontSize: '10px'
                    }}>
                        Material assets (.mat) define shared shader configurations
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * UI Render component inspector implementation.
 * UI 渲染组件检查器实现。
 *
 * Uses 'append' mode to add unified material UI after default properties.
 * 使用 'append' 模式在默认属性后添加统一的材质 UI。
 */
export class UIRenderInspector implements IComponentInspector<UIRenderComponent> {
    readonly id = 'uirender-inspector';
    readonly name = 'UIRender Inspector';
    readonly priority = 100;
    readonly targetComponents = ['UIRender', 'UIRenderComponent'];
    readonly renderMode = 'append' as const;

    canHandle(component: Component): component is UIRenderComponent {
        return component instanceof UIRenderComponent ||
               component.constructor.name === 'UIRenderComponent';
    }

    render(context: ComponentInspectorContext): React.ReactElement {
        return React.createElement(UIRenderInspectorContent, {
            context,
            key: `uirender-${context.version}`
        });
    }
}
