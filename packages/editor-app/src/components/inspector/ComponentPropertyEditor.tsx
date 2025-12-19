/**
 * ComponentPropertyEditor - 组件属性编辑器
 * ComponentPropertyEditor - Component property editor
 *
 * 使用新控件渲染组件属性
 * Renders component properties using new controls
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Component, Core, Entity, getComponentInstanceTypeName, PrefabInstanceComponent } from '@esengine/ecs-framework';
import { PropertyMetadataService, MessageHub, PrefabService, FileActionRegistry, AssetRegistryService } from '@esengine/editor-core';
import { Lock } from 'lucide-react';
import {
    PropertyRow,
    NumberInput,
    StringInput,
    BooleanInput,
    VectorInput,
    EnumInput,
    ColorInput,
    AssetInput,
    EntityRefInput,
    ArrayInput
} from './controls';

// ==================== 类型定义 | Type Definitions ====================

interface PropertyMetadata {
    type: string;
    label?: string;
    min?: number;
    max?: number;
    step?: number;
    readOnly?: boolean;
    placeholder?: string;
    options?: Array<{ label: string; value: string | number } | string | number>;
    controls?: Array<{ component: string; property: string }>;
    category?: string;
    assetType?: string;
    extensions?: string[];
    itemType?: { type: string; extensions?: string[]; assetType?: string };
    minLength?: number;
    maxLength?: number;
    reorderable?: boolean;
    actions?: Array<{ id: string; label: string; icon?: string; tooltip?: string }>;
}

export interface ComponentPropertyEditorProps {
    /** 组件实例 | Component instance */
    component: Component;
    /** 所属实体 | Owner entity */
    entity?: Entity;
    /** 版本号 | Version number */
    version?: number;
    /** 属性变更回调 | Property change callback */
    onChange?: (propertyName: string, value: any) => void;
    /** 动作回调 | Action callback */
    onAction?: (actionId: string, propertyName: string, component: Component) => void;
}

// ==================== 主组件 | Main Component ====================

export const ComponentPropertyEditor: React.FC<ComponentPropertyEditorProps> = ({
    component,
    entity,
    version,
    onChange,
    onAction
}) => {
    const [properties, setProperties] = useState<Record<string, PropertyMetadata>>({});
    const [controlledFields, setControlledFields] = useState<Map<string, string>>(new Map());
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; propertyName: string } | null>(null);

    // 服务 | Services
    const prefabService = useMemo(() => Core.services.tryResolve(PrefabService) as PrefabService | null, []);
    const componentTypeName = useMemo(() => getComponentInstanceTypeName(component), [component]);

    // 预制体实例组件 | Prefab instance component
    const prefabInstanceComp = useMemo(() => {
        return entity?.getComponent(PrefabInstanceComponent) ?? null;
    }, [entity, version]);

    // 检查属性是否被覆盖 | Check if property is overridden
    const isPropertyOverridden = useCallback((propertyName: string): boolean => {
        if (!prefabInstanceComp) return false;
        return prefabInstanceComp.isPropertyModified(componentTypeName, propertyName);
    }, [prefabInstanceComp, componentTypeName]);

    // 加载属性元数据 | Load property metadata
    useEffect(() => {
        const propertyMetadataService = Core.services.resolve(PropertyMetadataService);
        if (!propertyMetadataService) return;

        const metadata = propertyMetadataService.getEditableProperties(component);
        setProperties(metadata as Record<string, PropertyMetadata>);
    }, [component]);

    // 扫描控制字段 | Scan controlled fields
    useEffect(() => {
        if (!entity) return;

        const propertyMetadataService = Core.services.resolve(PropertyMetadataService);
        if (!propertyMetadataService) return;

        const componentName = getComponentInstanceTypeName(component);
        const controlled = new Map<string, string>();

        for (const otherComponent of entity.components) {
            if (otherComponent === component) continue;

            const otherMetadata = propertyMetadataService.getEditableProperties(otherComponent) as Record<string, PropertyMetadata>;
            const otherComponentName = getComponentInstanceTypeName(otherComponent);

            for (const [, propMeta] of Object.entries(otherMetadata)) {
                if (propMeta.controls) {
                    for (const control of propMeta.controls) {
                        if (control.component === componentName ||
                            control.component === componentName.replace('Component', '')) {
                            controlled.set(control.property, otherComponentName.replace('Component', ''));
                        }
                    }
                }
            }
        }

        setControlledFields(controlled);
    }, [component, entity, version]);

    // 关闭右键菜单 | Close context menu
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    // 获取属性值 | Get property value
    const getValue = useCallback((propertyName: string) => {
        return (component as any)[propertyName];
    }, [component, version]);

    // 处理属性变更 | Handle property change
    const handleChange = useCallback((propertyName: string, value: any) => {
        (component as any)[propertyName] = value;

        if (onChange) {
            onChange(propertyName, value);
        }

        const messageHub = Core.services.resolve(MessageHub);
        if (messageHub) {
            messageHub.publish('scene:modified', {});
        }
    }, [component, onChange]);

    // 处理动作 | Handle action
    const handleAction = useCallback((actionId: string, propertyName: string) => {
        if (onAction) {
            onAction(actionId, propertyName, component);
        }
    }, [onAction, component]);

    // 还原属性 | Revert property
    const handleRevertProperty = useCallback(async () => {
        if (!contextMenu || !prefabService || !entity) return;
        await prefabService.revertProperty(entity, componentTypeName, contextMenu.propertyName);
        setContextMenu(null);
    }, [contextMenu, prefabService, entity, componentTypeName]);

    // 处理右键菜单 | Handle context menu
    const handleContextMenu = useCallback((e: React.MouseEvent, propertyName: string) => {
        if (!isPropertyOverridden(propertyName)) return;
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, propertyName });
    }, [isPropertyOverridden]);

    // 获取控制者 | Get controlled by
    const getControlledBy = (propertyName: string): string | undefined => {
        return controlledFields.get(propertyName);
    };

    // ==================== 渲染属性 | Render Property ====================

    const renderProperty = (propertyName: string, metadata: PropertyMetadata) => {
        const value = getValue(propertyName);
        const label = metadata.label || propertyName;
        const readonly = metadata.readOnly || !!getControlledBy(propertyName);
        const controlledBy = getControlledBy(propertyName);

        // 标签后缀（如果被控制）| Label suffix (if controlled)
        const labelElement = controlledBy ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {label}
                <span title={`Controlled by ${controlledBy}`}>
                    <Lock size={10} style={{ color: 'var(--inspector-text-secondary)' }} />
                </span>
            </span>
        ) : label;
        const labelTitle = label;

        switch (metadata.type) {
            case 'number':
            case 'integer':
                return (
                    <PropertyRow key={propertyName} label={labelElement} labelTitle={labelTitle} draggable>
                        <NumberInput
                            value={value ?? 0}
                            onChange={(v) => handleChange(propertyName, v)}
                            readonly={readonly}
                            min={metadata.min}
                            max={metadata.max}
                            step={metadata.step ?? (metadata.type === 'integer' ? 1 : 0.1)}
                            integer={metadata.type === 'integer'}
                        />
                    </PropertyRow>
                );

            case 'string':
                return (
                    <PropertyRow key={propertyName} label={labelElement} labelTitle={labelTitle}>
                        <StringInput
                            value={value ?? ''}
                            onChange={(v) => handleChange(propertyName, v)}
                            readonly={readonly}
                            placeholder={metadata.placeholder}
                        />
                    </PropertyRow>
                );

            case 'boolean':
                return (
                    <PropertyRow key={propertyName} label={labelElement} labelTitle={labelTitle}>
                        <BooleanInput
                            value={value ?? false}
                            onChange={(v) => handleChange(propertyName, v)}
                            readonly={readonly}
                        />
                    </PropertyRow>
                );

            case 'color': {
                let colorValue = value ?? '#ffffff';
                const wasNumber = typeof colorValue === 'number';
                if (wasNumber) {
                    colorValue = '#' + colorValue.toString(16).padStart(6, '0');
                }
                return (
                    <PropertyRow key={propertyName} label={labelElement} labelTitle={labelTitle}>
                        <ColorInput
                            value={colorValue}
                            onChange={(v) => {
                                if (wasNumber && typeof v === 'string') {
                                    handleChange(propertyName, parseInt(v.slice(1), 16));
                                } else {
                                    handleChange(propertyName, v);
                                }
                            }}
                            readonly={readonly}
                        />
                    </PropertyRow>
                );
            }

            case 'vector2':
                return (
                    <PropertyRow key={propertyName} label={labelElement} labelTitle={labelTitle}>
                        <VectorInput
                            value={value ?? { x: 0, y: 0 }}
                            onChange={(v) => handleChange(propertyName, v)}
                            readonly={readonly}
                            dimensions={2}
                        />
                    </PropertyRow>
                );

            case 'vector3':
                return (
                    <PropertyRow key={propertyName} label={labelElement} labelTitle={labelTitle}>
                        <VectorInput
                            value={value ?? { x: 0, y: 0, z: 0 }}
                            onChange={(v) => handleChange(propertyName, v)}
                            readonly={readonly}
                            dimensions={3}
                        />
                    </PropertyRow>
                );

            case 'enum': {
                const options = (metadata.options || []).map(opt =>
                    typeof opt === 'object' ? opt : { label: String(opt), value: opt }
                );
                return (
                    <PropertyRow key={propertyName} label={labelElement} labelTitle={labelTitle}>
                        <EnumInput
                            value={value}
                            onChange={(v) => handleChange(propertyName, v)}
                            readonly={readonly}
                            options={options}
                        />
                    </PropertyRow>
                );
            }

            case 'asset': {
                const handleNavigate = (path: string) => {
                    const messageHub = Core.services.tryResolve(MessageHub);
                    if (messageHub) {
                        messageHub.publish('asset:reveal', { path });
                    }
                };

                const fileActionRegistry = Core.services.tryResolve(FileActionRegistry);
                const getCreationMapping = () => {
                    if (!fileActionRegistry || !metadata.extensions) return null;
                    for (const ext of metadata.extensions) {
                        const mapping = (fileActionRegistry as any).getAssetCreationMapping?.(ext);
                        if (mapping) return mapping;
                    }
                    return null;
                };

                const creationMapping = getCreationMapping();

                // 解析资产值 | Resolve asset value
                // 检查值是否为 GUID（UUID 格式）并尝试解析为路径
                // Check if value is a GUID (UUID format) and try to resolve to path
                const resolveAssetValue = () => {
                    if (!value) return null;
                    const strValue = String(value);

                    // GUID 格式检查：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                    // UUID format check
                    const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(strValue);

                    if (isGuid) {
                        // 尝试从 AssetRegistryService 获取路径
                        // Try to get path from AssetRegistryService
                        const assetRegistry = Core.services.tryResolve(AssetRegistryService) as AssetRegistryService | null;
                        if (assetRegistry) {
                            const assetMeta = assetRegistry.getAsset(strValue);
                            if (assetMeta) {
                                return {
                                    id: strValue,
                                    path: assetMeta.path,
                                    type: assetMeta.type
                                };
                            }
                        }
                        // 如果无法解析，仍然显示 GUID
                        // If cannot resolve, still show GUID
                        return { id: strValue, path: strValue };
                    }

                    // 不是 GUID，假设是路径
                    // Not a GUID, assume it's a path
                    return { id: strValue, path: strValue };
                };

                const assetValue = resolveAssetValue();

                return (
                    <PropertyRow key={propertyName} label={labelElement} labelTitle={labelTitle}>
                        <AssetInput
                            value={assetValue}
                            onChange={(v) => {
                                if (v === null) {
                                    handleChange(propertyName, '');
                                } else if (typeof v === 'string') {
                                    handleChange(propertyName, v);
                                } else {
                                    // 存储路径而不是 GUID
                                    // Store path instead of GUID
                                    handleChange(propertyName, v.path || v.id || '');
                                }
                            }}
                            readonly={readonly}
                            extensions={metadata.extensions}
                            onPickAsset={() => {
                                const messageHub = Core.services.tryResolve(MessageHub);
                                if (messageHub) {
                                    messageHub.publish('asset:pick', {
                                        extensions: metadata.extensions,
                                        onSelect: (path: string) => handleChange(propertyName, path)
                                    });
                                }
                            }}
                            onOpenAsset={(asset) => {
                                if (asset.path) handleNavigate(asset.path);
                            }}
                            onLocateAsset={(asset) => {
                                if (asset.path) handleNavigate(asset.path);
                            }}
                        />
                    </PropertyRow>
                );
            }

            case 'entityRef':
                return (
                    <PropertyRow key={propertyName} label={labelElement} labelTitle={labelTitle}>
                        <EntityRefInput
                            value={value ?? null}
                            onChange={(v) => {
                                const id = typeof v === 'object' && v !== null ? v.id : v;
                                handleChange(propertyName, id);
                            }}
                            readonly={readonly}
                            resolveEntityName={(id) => {
                                if (!entity) return undefined;
                                const scene = entity.scene;
                                if (!scene) return undefined;
                                const targetEntity = (scene as any).getEntityById?.(Number(id));
                                return targetEntity?.name;
                            }}
                            onLocateEntity={(id) => {
                                const messageHub = Core.services.tryResolve(MessageHub);
                                if (messageHub) {
                                    messageHub.publish('hierarchy:select', { entityId: Number(id) });
                                }
                            }}
                        />
                    </PropertyRow>
                );

            case 'array': {
                return (
                    <PropertyRow key={propertyName} label={labelElement} labelTitle={labelTitle}>
                        <ArrayInput
                            value={value ?? []}
                            onChange={(v) => handleChange(propertyName, v)}
                            readonly={readonly}
                            minItems={metadata.minLength}
                            maxItems={metadata.maxLength}
                            sortable={metadata.reorderable ?? true}
                        />
                    </PropertyRow>
                );
            }

            default:
                return null;
        }
    };

    // ==================== 渲染 | Render ====================

    return (
        <div className="component-property-editor">
            {Object.entries(properties).map(([propertyName, metadata]) => {
                const overridden = isPropertyOverridden(propertyName);
                return (
                    <div
                        key={propertyName}
                        className={overridden ? 'property-overridden' : ''}
                        onContextMenu={(e) => handleContextMenu(e, propertyName)}
                        style={overridden ? { borderLeft: '2px solid var(--inspector-accent)' } : undefined}
                    >
                        {renderProperty(propertyName, metadata)}
                    </div>
                );
            })}

            {/* Context Menu */}
            {contextMenu && (
                <div
                    style={{
                        position: 'fixed',
                        left: contextMenu.x,
                        top: contextMenu.y,
                        background: 'var(--inspector-bg-section)',
                        border: '1px solid var(--inspector-border-light)',
                        borderRadius: '4px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                        zIndex: 1000,
                        overflow: 'hidden'
                    }}
                >
                    <button
                        onClick={handleRevertProperty}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--inspector-text-primary)',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--inspector-bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <span>↩</span>
                        <span>Revert to Prefab</span>
                    </button>
                </div>
            )}
        </div>
    );
};
