/**
 * FGUIInspector
 *
 * Custom inspector for FGUIComponent.
 * Uses 'append' mode to add Component selection UI after the default PropertyInspector.
 *
 * FGUIComponent 的自定义检视器，在默认 PropertyInspector 后追加组件选择 UI
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Package, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import type { Component } from '@esengine/ecs-framework';
import type { ComponentInspectorContext, IComponentInspector } from '@esengine/editor-core';
import { VirtualNodeRegistry } from '@esengine/editor-core';
import { FGUIComponent } from '@esengine/fairygui';

/** Shared styles | 共享样式 */
const styles = {
    section: {
        marginTop: '8px',
        padding: '8px',
        background: 'var(--color-bg-secondary, #252526)',
        borderRadius: '4px',
        border: '1px solid var(--color-border, #3a3a3a)'
    } as React.CSSProperties,
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '8px',
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--color-text-secondary, #888)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px'
    } as React.CSSProperties,
    row: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '6px',
        gap: '8px'
    } as React.CSSProperties,
    label: {
        width: '70px',
        flexShrink: 0,
        fontSize: '12px',
        color: 'var(--color-text-secondary, #888)'
    } as React.CSSProperties,
    select: {
        flex: 1,
        padding: '5px 8px',
        background: 'var(--color-bg-tertiary, #1e1e1e)',
        border: '1px solid var(--color-border, #3a3a3a)',
        borderRadius: '4px',
        color: 'inherit',
        fontSize: '12px',
        minWidth: 0,
        cursor: 'pointer'
    } as React.CSSProperties,
    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 500
    } as React.CSSProperties
};

/**
 * FGUIInspectorContent
 *
 * React component for FGUI inspector content.
 * Shows package status and component selection dropdown.
 *
 * FGUI 检视器内容的 React 组件，显示包状态和组件选择下拉框
 */
export const FGUIInspectorContent: React.FC<{ context: ComponentInspectorContext }> = ({ context }) => {
    const component = context.component as FGUIComponent;
    const onChange = context.onChange;
    const entityId = context.entity?.id;

    // Track version to trigger re-render when component state changes
    // 跟踪版本以在组件状态变化时触发重新渲染
    const [refreshKey, setRefreshKey] = useState(0);

    // Subscribe to VirtualNodeRegistry changes (event-driven, no polling)
    // 订阅 VirtualNodeRegistry 变化（事件驱动，无需轮询）
    useEffect(() => {
        if (entityId === undefined) return;

        const unsubscribe = VirtualNodeRegistry.onChange((event) => {
            if (event.entityId === entityId) {
                setRefreshKey(prev => prev + 1);
            }
        });

        return unsubscribe;
    }, [entityId]);

    // Get available components from loaded package
    // Use refreshKey as dependency to refresh when package/component changes
    // 使用 refreshKey 作为依赖，当包/组件变化时刷新
    const availableComponents = useMemo(() => {
        if (!component.package) return [];
        const exported = component.getAvailableComponentNames();
        if (exported.length > 0) return exported;
        return component.getAllComponentNames();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [component.package, refreshKey]);

    // Handle component name change
    const handleComponentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        if (onChange) {
            onChange('componentName', e.target.value);
        }
    }, [onChange]);

    // Render status badge
    const renderStatus = () => {
        if (component.isLoading) {
            return (
                <span style={{ ...styles.statusBadge, background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
                    <Loader size={12} style={{ animation: 'fgui-spin 1s linear infinite' }} />
                    Loading...
                </span>
            );
        }
        if (component.error) {
            return (
                <span style={{ ...styles.statusBadge, background: 'rgba(248, 113, 113, 0.15)', color: '#f87171' }}>
                    <AlertCircle size={12} />
                    Error
                </span>
            );
        }
        if (component.isReady) {
            return (
                <span style={{ ...styles.statusBadge, background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }}>
                    <CheckCircle size={12} />
                    {component.package?.name || 'Ready'}
                </span>
            );
        }
        return (
            <span style={{ ...styles.statusBadge, background: 'rgba(136, 136, 136, 0.15)', color: '#888' }}>
                <Package size={12} />
                No Package
            </span>
        );
    };

    return (
        <div style={styles.section}>
            {/* Section Header */}
            <div style={styles.sectionHeader}>
                <Package size={12} />
                <span>FGUI Runtime</span>
            </div>

            {/* Status Row */}
            <div style={styles.row}>
                <span style={styles.label}>Status</span>
                <div style={{ flex: 1 }}>
                    {renderStatus()}
                </div>
            </div>

            {/* Error Message */}
            {component.error && (
                <div style={{
                    marginBottom: '8px',
                    padding: '6px 8px',
                    background: 'rgba(248, 113, 113, 0.1)',
                    border: '1px solid rgba(248, 113, 113, 0.3)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#f87171',
                    wordBreak: 'break-word'
                }}>
                    {component.error}
                </div>
            )}

            {/* Component Selection - only show when package is loaded */}
            {availableComponents.length > 0 && (
                <div style={{ ...styles.row, marginBottom: 0 }}>
                    <span style={styles.label}>Component</span>
                    <select
                        value={component.componentName}
                        onChange={handleComponentChange}
                        style={styles.select}
                    >
                        <option value="">Select...</option>
                        {availableComponents.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Spin animation for loader */}
            <style>{`
                @keyframes fgui-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

/**
 * FGUIComponentInspector
 *
 * Component inspector for FGUIComponent.
 * Uses 'append' mode to show additional UI after the default PropertyInspector.
 *
 * FGUIComponent 的组件检视器，使用 'append' 模式在默认 Inspector 后追加 UI
 */
export class FGUIComponentInspector implements IComponentInspector<FGUIComponent> {
    readonly id = 'fgui-component-inspector';
    readonly name = 'FGUI Component Inspector';
    readonly priority = 100;
    readonly targetComponents = ['FGUIComponent'];
    readonly renderMode = 'append' as const;

    canHandle(component: Component): component is FGUIComponent {
        return component instanceof FGUIComponent;
    }

    render(context: ComponentInspectorContext): React.ReactElement {
        return React.createElement(FGUIInspectorContent, { context });
    }
}

/**
 * Default FGUI component inspector instance
 * 默认 FGUI 组件检视器实例
 */
export const fguiComponentInspector = new FGUIComponentInspector();
