/**
 * @zh Gizmo 交互层组件 - 处理编辑器工具交互
 * @en Gizmo Interaction Layer Component - Handles editor tool interactions
 *
 * 绘制已移至 GizmoRenderService（在 ccesengine 内绘制）。
 * 此组件只负责处理鼠标事件和相机控制。
 *
 * Drawing has been moved to GizmoRenderService (drawn inside ccesengine).
 * This component only handles mouse events and camera control.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { getEditorEngine, getGizmoRenderService } from '../services/engine';

export type TransformTool = 'select' | 'move' | 'rotate' | 'scale';
export type GizmoHandle = 'none' | 'x' | 'y' | 'xy' | 'rotate' | 'scale-x' | 'scale-y' | 'scale-xy';

interface DragState {
    active: boolean;
    handle: GizmoHandle;
    startMouseX: number;
    startMouseY: number;
    startNodeX: number;
    startNodeY: number;
    startRotation: number;
    startScaleX: number;
    startScaleY: number;
}

interface GizmoOverlayProps {
    width: number;
    height: number;
    activeTool: TransformTool;
    showGrid: boolean;
    onSelectNode?: (nodeId: string | null) => void;
}

// Gizmo constants (for hit testing)
const GIZMO_AXIS_LENGTH = 80;
const GIZMO_ARROW_SIZE = 12;
const GIZMO_ROTATE_RADIUS = 60;
const GIZMO_HANDLE_SIZE = 10;

export function GizmoOverlay({
    width,
    height,
    activeTool,
    showGrid,
    onSelectNode
}: GizmoOverlayProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Get editor engine and gizmo service
    const engine = getEditorEngine();
    const gizmoService = getGizmoRenderService();

    // Drag state
    const [dragState, setDragState] = useState<DragState>({
        active: false,
        handle: 'none',
        startMouseX: 0,
        startMouseY: 0,
        startNodeX: 0,
        startNodeY: 0,
        startRotation: 0,
        startScaleX: 1,
        startScaleY: 1
    });

    // Current gizmo screen position (for hit testing)
    const gizmoScreenPosRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

    // Initialize gizmo service when scene is loaded
    useEffect(() => {
        const initGizmo = async () => {
            // Wait a bit to ensure scene is fully loaded
            await new Promise(resolve => setTimeout(resolve, 100));

            const success = await gizmoService.initialize();
            if (success) {
                gizmoService.setShowGrid(showGrid);
                gizmoService.setActiveTool(activeTool);
            } else {
            }
        };

        // Subscribe to scene loaded events
        engine.onSceneLoaded(initGizmo);

        // Also try to initialize immediately in case scene is already loaded
        initGizmo();

        return () => {
            engine.offSceneLoaded(initGizmo);
        };
    }, [gizmoService, engine, showGrid, activeTool]);

    // Update gizmo service when props change
    useEffect(() => {
        if (gizmoService.isInitialized) {
            gizmoService.setShowGrid(showGrid);
        }
    }, [showGrid, gizmoService]);

    useEffect(() => {
        if (gizmoService.isInitialized) {
            gizmoService.setActiveTool(activeTool);
        }
    }, [activeTool, gizmoService]);

    // Update gizmo screen position for hit testing
    useEffect(() => {
        const selectedId = engine.getSelectedNodeId();
        if (selectedId && activeTool !== 'select') {
            const transform = engine.getSelectedNodeTransform();
            const camera = engine.getEditorCamera();

            if (transform) {
                const screenX = width / 2 + (transform.position.x + camera.x) * camera.zoom;
                const screenY = height / 2 - (transform.position.y + camera.y) * camera.zoom;
                const objWidth = 100 * transform.scale.x * camera.zoom;
                const objHeight = 100 * transform.scale.y * camera.zoom;

                gizmoScreenPosRef.current = { x: screenX, y: screenY, width: objWidth, height: objHeight };
            }
        } else {
            gizmoScreenPosRef.current = null;
        }
    });

    /**
     * @zh Gizmo 命中测试
     * @en Gizmo hit testing
     */
    const hitTestGizmo = useCallback((mouseX: number, mouseY: number): GizmoHandle => {
        const gizmoPos = gizmoScreenPosRef.current;
        if (!gizmoPos) return 'none';

        const dx = mouseX - gizmoPos.x;
        const dy = mouseY - gizmoPos.y;

        if (activeTool === 'move') {
            // Check XY handle (center square)
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
                return 'xy';
            }
            // Check X axis (right side, allowing some tolerance)
            if (dx > 10 && dx < GIZMO_AXIS_LENGTH + GIZMO_ARROW_SIZE + 10 && Math.abs(dy) < 15) {
                return 'x';
            }
            // Check Y axis (up, screen Y is inverted)
            if (dy < -10 && dy > -(GIZMO_AXIS_LENGTH + GIZMO_ARROW_SIZE + 10) && Math.abs(dx) < 15) {
                return 'y';
            }
        } else if (activeTool === 'rotate') {
            // Check rotate circle
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (Math.abs(dist - GIZMO_ROTATE_RADIUS) < 12) {
                return 'rotate';
            }
        } else if (activeTool === 'scale') {
            const halfW = gizmoPos.width / 2;
            const halfH = gizmoPos.height / 2;
            const handleSize = GIZMO_HANDLE_SIZE + 5;

            // Check corner handles (scale XY)
            const corners = [
                { x: halfW, y: -halfH },   // top-right
                { x: -halfW, y: -halfH },  // top-left
                { x: -halfW, y: halfH },   // bottom-left
                { x: halfW, y: halfH }     // bottom-right
            ];
            for (const corner of corners) {
                if (Math.abs(dx - corner.x) < handleSize && Math.abs(dy - corner.y) < handleSize) {
                    return 'scale-xy';
                }
            }
            // Check X scale handles (left/right edges)
            if (Math.abs(dx - halfW) < handleSize && Math.abs(dy) < handleSize) return 'scale-x';
            if (Math.abs(dx + halfW) < handleSize && Math.abs(dy) < handleSize) return 'scale-x';
            // Check Y scale handles (top/bottom edges)
            if (Math.abs(dy + halfH) < handleSize && Math.abs(dx) < handleSize) return 'scale-y';
            if (Math.abs(dy - halfH) < handleSize && Math.abs(dx) < handleSize) return 'scale-y';
        }

        return 'none';
    }, [activeTool]);

    // Handle mouse events for camera control and gizmo interaction
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        const rect = overlayRef.current?.getBoundingClientRect();
        if (rect) {
            const centerX = e.clientX - rect.left - width / 2;
            const centerY = e.clientY - rect.top - height / 2;
            engine.zoomEditorCamera(delta, centerX, centerY);
        }
    }, [engine, width, height]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const rect = overlayRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Middle mouse or Alt+Left for panning
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            e.preventDefault();
            let lastX = e.clientX;
            let lastY = e.clientY;

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const dx = moveEvent.clientX - lastX;
                const dy = moveEvent.clientY - lastY;
                lastX = moveEvent.clientX;
                lastY = moveEvent.clientY;
                engine.panEditorCamera(dx, dy);
            };

            const handleMouseUp = () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return;
        }

        // Left click handling
        if (e.button === 0) {
            // Check for gizmo interaction first (if not in select mode)
            if (activeTool !== 'select') {
                const handle = hitTestGizmo(mouseX, mouseY);

                if (handle !== 'none') {
                    e.preventDefault();
                    const transform = engine.getSelectedNodeTransform();
                    if (!transform) return;

                    // Start drag
                    setDragState({
                        active: true,
                        handle,
                        startMouseX: mouseX,
                        startMouseY: mouseY,
                        startNodeX: transform.position.x,
                        startNodeY: transform.position.y,
                        startRotation: transform.eulerAngles.z,
                        startScaleX: transform.scale.x,
                        startScaleY: transform.scale.y
                    });
                    return;
                }
            }

            // Click on scene - try to select a node
            const hitNodeId = engine.hitTestNode(mouseX, mouseY, width, height);
            if (hitNodeId) {
                engine.selectNode(hitNodeId);
                onSelectNode?.(hitNodeId);
            } else {
                // Click on empty space - deselect
                engine.selectNode(null);
                onSelectNode?.(null);
            }
        }
    }, [engine, activeTool, hitTestGizmo, width, height, onSelectNode]);

    // Handle mouse move for dragging
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!dragState.active) return;

        const rect = overlayRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const camera = engine.getEditorCamera();

        // Calculate delta in screen space
        const deltaScreenX = mouseX - dragState.startMouseX;
        const deltaScreenY = mouseY - dragState.startMouseY;

        // Convert to world space (screen Y is inverted)
        const deltaWorldX = deltaScreenX / camera.zoom;
        const deltaWorldY = -deltaScreenY / camera.zoom;

        switch (dragState.handle) {
            case 'x':
                engine.setSelectedNodePosition(
                    dragState.startNodeX + deltaWorldX,
                    dragState.startNodeY
                );
                break;
            case 'y':
                engine.setSelectedNodePosition(
                    dragState.startNodeX,
                    dragState.startNodeY + deltaWorldY
                );
                break;
            case 'xy':
                engine.setSelectedNodePosition(
                    dragState.startNodeX + deltaWorldX,
                    dragState.startNodeY + deltaWorldY
                );
                break;
            case 'rotate': {
                // Calculate rotation angle from center
                const gizmoPos = gizmoScreenPosRef.current;
                if (gizmoPos) {
                    const startAngle = Math.atan2(
                        dragState.startMouseY - gizmoPos.y,
                        dragState.startMouseX - gizmoPos.x
                    );
                    const currentAngle = Math.atan2(
                        mouseY - gizmoPos.y,
                        mouseX - gizmoPos.x
                    );
                    const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);
                    engine.setSelectedNodeRotation(dragState.startRotation - deltaAngle);
                }
                break;
            }
            case 'scale-x': {
                const scaleFactor = 1 + deltaScreenX / 100;
                engine.setSelectedNodeScale(
                    dragState.startScaleX * scaleFactor,
                    dragState.startScaleY
                );
                break;
            }
            case 'scale-y': {
                const scaleFactor = 1 - deltaScreenY / 100;
                engine.setSelectedNodeScale(
                    dragState.startScaleX,
                    dragState.startScaleY * scaleFactor
                );
                break;
            }
            case 'scale-xy': {
                const scaleFactor = 1 + (deltaScreenX - deltaScreenY) / 100;
                engine.setSelectedNodeScale(
                    dragState.startScaleX * scaleFactor,
                    dragState.startScaleY * scaleFactor
                );
                break;
            }
        }

        // Update gizmo display
        gizmoService.update();
    }, [dragState, engine, gizmoService]);

    // Handle mouse up - end drag
    const handleMouseUp = useCallback(() => {
        if (dragState.active) {
            setDragState(prev => ({ ...prev, active: false, handle: 'none' }));
        }
    }, [dragState.active]);

    // Determine cursor based on state
    const getCursor = () => {
        if (dragState.active) {
            switch (dragState.handle) {
                case 'x': return 'ew-resize';
                case 'y': return 'ns-resize';
                case 'xy': return 'move';
                case 'rotate': return 'crosshair';
                case 'scale-x': return 'ew-resize';
                case 'scale-y': return 'ns-resize';
                case 'scale-xy': return 'nwse-resize';
            }
        }
        switch (activeTool) {
            case 'move': return 'move';
            case 'rotate': return 'crosshair';
            case 'scale': return 'default';
            default: return 'default';
        }
    };

    return (
        <div
            ref={overlayRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width,
                height,
                pointerEvents: 'auto',
                cursor: getCursor(),
                // Transparent - no drawing, just interaction
                background: 'transparent',
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        />
    );
}
