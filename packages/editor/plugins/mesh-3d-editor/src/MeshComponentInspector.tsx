/**
 * Mesh Component Inspector.
 * 网格组件检查器。
 *
 * Provides custom inspector UI for MeshComponent.
 * 为 MeshComponent 提供自定义检查器 UI。
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Component, Core, getComponentInstanceTypeName } from '@esengine/ecs-framework';
import { IComponentInspector, ComponentInspectorContext, MessageHub } from '@esengine/editor-core';
import { MeshComponent } from '@esengine/mesh-3d';
import { ChevronDown, ChevronRight, Box, Info } from 'lucide-react';
import './MeshComponentInspector.css';

/**
 * Mesh info display props.
 * 网格信息显示属性。
 */
interface MeshInfoProps {
    mesh: MeshComponent;
}

/**
 * Mesh info component.
 * 网格信息组件。
 *
 * Displays detailed mesh information when a model is loaded.
 * 当模型加载后显示详细的网格信息。
 */
function MeshInfo({ mesh }: MeshInfoProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!mesh.meshAsset) {
        return (
            <div className="mesh-info-empty">
                <Info size={14} />
                <span>No model loaded</span>
            </div>
        );
    }

    const asset = mesh.meshAsset;
    const currentMesh = mesh.currentMesh;
    const totalMeshes = asset.meshes?.length ?? 0;

    return (
        <div className="mesh-info-section">
            <div
                className="mesh-info-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="mesh-info-expand">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
                <Box size={14} />
                <span className="mesh-info-title">Mesh Info</span>
            </div>

            {isExpanded && (
                <div className="mesh-info-content">
                    {/* Model name */}
                    <div className="mesh-info-row">
                        <label>Name</label>
                        <span className="mesh-info-value">{asset.name || 'Unnamed'}</span>
                    </div>

                    {/* Total meshes */}
                    <div className="mesh-info-row">
                        <label>Meshes</label>
                        <span className="mesh-info-value">{totalMeshes}</span>
                    </div>

                    {/* Current mesh details */}
                    {currentMesh && (
                        <>
                            <div className="mesh-info-divider" />
                            <div className="mesh-info-subtitle">Current Mesh ({mesh.meshIndex})</div>

                            <div className="mesh-info-row">
                                <label>Mesh Name</label>
                                <span className="mesh-info-value">{currentMesh.name || `Mesh ${mesh.meshIndex}`}</span>
                            </div>

                            {currentMesh.vertices && (
                                <div className="mesh-info-row">
                                    <label>Vertices</label>
                                    <span className="mesh-info-value">{Math.floor(currentMesh.vertices.length / 3).toLocaleString()}</span>
                                </div>
                            )}

                            {currentMesh.indices && (
                                <div className="mesh-info-row">
                                    <label>Triangles</label>
                                    <span className="mesh-info-value">{Math.floor(currentMesh.indices.length / 3).toLocaleString()}</span>
                                </div>
                            )}
                        </>
                    )}

                    {/* Materials */}
                    {asset.materials && asset.materials.length > 0 && (
                        <>
                            <div className="mesh-info-divider" />
                            <div className="mesh-info-subtitle">Materials ({asset.materials.length})</div>
                            <div className="mesh-info-materials">
                                {asset.materials.map((mat, i) => (
                                    <div key={i} className="mesh-info-material">
                                        <span className="mesh-info-material-index">{i}</span>
                                        <span className="mesh-info-material-name">{mat.name || `Material ${i}`}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Bounds */}
                    {asset.bounds && (
                        <>
                            <div className="mesh-info-divider" />
                            <div className="mesh-info-subtitle">Bounds</div>
                            <div className="mesh-info-row">
                                <label>Min</label>
                                <span className="mesh-info-value mesh-info-vec3">
                                    ({asset.bounds.min[0].toFixed(2)}, {asset.bounds.min[1].toFixed(2)}, {asset.bounds.min[2].toFixed(2)})
                                </span>
                            </div>
                            <div className="mesh-info-row">
                                <label>Max</label>
                                <span className="mesh-info-value mesh-info-vec3">
                                    ({asset.bounds.max[0].toFixed(2)}, {asset.bounds.max[1].toFixed(2)}, {asset.bounds.max[2].toFixed(2)})
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Mesh inspector content component.
 * 网格检查器内容组件。
 */
function MeshInspectorContent({ context }: { context: ComponentInspectorContext }) {
    const mesh = context.component as MeshComponent;
    const [, forceUpdate] = useState({});

    // Force update when mesh index changes
    // 当网格索引变化时强制更新
    useEffect(() => {
        forceUpdate({});
    }, [mesh.meshIndex, mesh.modelGuid]);

    const handleChange = useCallback((propertyName: string, value: unknown) => {
        (mesh as unknown as Record<string, unknown>)[propertyName] = value;
        context.onChange?.(propertyName, value);
        forceUpdate({});

        // Publish scene:modified
        // 发布 scene:modified
        const messageHub = Core.services.tryResolve(MessageHub);
        if (messageHub) {
            messageHub.publish('scene:modified', {});
        }
    }, [mesh, context]);

    return (
        <div className="mesh-component-inspector">
            {/* Mesh info display */}
            <MeshInfo mesh={mesh} />
        </div>
    );
}

/**
 * Mesh component inspector implementation.
 * 网格组件检查器实现。
 *
 * Uses 'append' mode to show mesh info after the default PropertyInspector.
 * 使用 'append' 模式在默认 PropertyInspector 后显示网格信息。
 */
export class MeshComponentInspector implements IComponentInspector<MeshComponent> {
    readonly id = 'mesh-component-inspector';
    readonly name = 'Mesh Component Inspector';
    readonly priority = 100;
    readonly targetComponents = ['Mesh', 'MeshComponent'];
    readonly renderMode = 'append' as const;

    canHandle(component: Component): component is MeshComponent {
        const typeName = getComponentInstanceTypeName(component);
        return typeName === 'Mesh' || typeName === 'MeshComponent';
    }

    render(context: ComponentInspectorContext): React.ReactElement {
        return React.createElement(MeshInspectorContent, {
            context,
            key: `mesh-${context.version}`
        });
    }
}
