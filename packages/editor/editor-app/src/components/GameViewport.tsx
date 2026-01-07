import { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Square, Maximize2, Grid } from 'lucide-react';
import { getEngineService, IEngineService, SceneObject, GizmoHandle } from '../services/EngineService';
import '../styles/GameViewport.css';

type TransformTool = 'select' | 'move' | 'rotate' | 'scale';

interface GameViewportProps {
    mode: 'scene' | 'game';
    isPlaying?: boolean;
    activeTool?: TransformTool;
    onPlay?: () => void;
    onPause?: () => void;
    onStop?: () => void;
    onSelectObject?: (object: SceneObject | null) => void;
}

export function GameViewport({
    mode,
    isPlaying = false,
    activeTool = 'select',
    onPlay,
    onPause,
    onStop,
    onSelectObject
}: GameViewportProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<IEngineService | null>(null);
    const [isEngineReady, setIsEngineReady] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const [showGrid, setShowGrid] = useState(mode === 'scene');
    const [engineState, setEngineState] = useState({ fps: 0, frameCount: 0 });

    // Drag state
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const dragObjectStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, rotation: 0 });
    const selectedObjectRef = useRef<SceneObject | null>(null);
    const activeGizmoHandleRef = useRef<GizmoHandle>('none');

    // Handle canvas resize
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    // Update canvas size
    useEffect(() => {
        if (engineRef.current && isEngineReady) {
            engineRef.current.resize(canvasSize.width, canvasSize.height);
        }
    }, [canvasSize, isEngineReady]);

    // Initialize engine
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const engine = getEngineService();
        engineRef.current = engine;

        engine.init({
            canvas,
            width: canvasSize.width,
            height: canvasSize.height,
            backgroundColor: '#1a1a1a',
            showGrid: mode === 'scene',
        }).then(() => {
            setIsEngineReady(true);

            // Add demo objects in scene mode
            if (mode === 'scene') {
                engine.addObject({
                    id: 1,
                    name: 'Player',
                    type: 'box',
                    x: 0,
                    y: 0,
                    width: 60,
                    height: 80,
                    rotation: 0,
                    color: '#4a9eff'
                });
                engine.addObject({
                    id: 2,
                    name: 'Enemy',
                    type: 'circle',
                    x: 120,
                    y: 50,
                    width: 50,
                    height: 50,
                    rotation: 0,
                    color: '#ff4a4a'
                });
                engine.addObject({
                    id: 3,
                    name: 'Platform',
                    type: 'box',
                    x: -80,
                    y: -100,
                    width: 200,
                    height: 30,
                    rotation: 0,
                    color: '#4aff4a'
                });
                engine.addObject({
                    id: 4,
                    name: 'Sprite',
                    type: 'sprite',
                    x: -150,
                    y: 80,
                    width: 64,
                    height: 64,
                    rotation: 15,
                    color: '#ffaa00'
                });
            }
        });

        return () => {
            engine.destroy();
            engineRef.current = null;
        };
    }, []);

    // Update grid visibility
    useEffect(() => {
        if (engineRef.current && isEngineReady) {
            engineRef.current.resize(canvasSize.width, canvasSize.height);
        }
    }, [showGrid, isEngineReady]);

    // Handle play/pause/stop from parent
    useEffect(() => {
        if (!engineRef.current || !isEngineReady) return;

        const engine = engineRef.current;
        const state = engine.getState();

        if (isPlaying && !state.isRunning) {
            engine.start();
        } else if (!isPlaying && state.isRunning) {
            engine.stop();
        }
    }, [isPlaying, isEngineReady]);

    // Update engine state display
    useEffect(() => {
        if (!isPlaying || !engineRef.current) return;

        const interval = setInterval(() => {
            if (engineRef.current) {
                const state = engineRef.current.getState();
                setEngineState({ fps: state.fps, frameCount: state.frameCount });
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying]);

    // Sync active tool to engine
    useEffect(() => {
        if (engineRef.current && isEngineReady) {
            engineRef.current.setActiveTool(activeTool);
        }
    }, [activeTool, isEngineReady]);

    // Get canvas-relative coordinates
    const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }, []);

    // Mouse down handler
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (mode !== 'scene' || !engineRef.current || !isEngineReady) return;

        const coords = getCanvasCoords(e);

        // First check if we hit a gizmo handle
        const gizmoHandle = engineRef.current.hitTestGizmo(coords.x, coords.y);
        if (gizmoHandle !== 'none') {
            activeGizmoHandleRef.current = gizmoHandle;
            isDraggingRef.current = true;
            dragStartRef.current = coords;

            const selectedId = engineRef.current.getSelectedObjectId();
            if (selectedId !== null) {
                const objects = engineRef.current.getObjects();
                const obj = objects.find(o => o.id === selectedId);
                if (obj) {
                    selectedObjectRef.current = obj;
                    dragObjectStartRef.current = {
                        x: obj.x,
                        y: obj.y,
                        width: obj.width,
                        height: obj.height,
                        rotation: obj.rotation
                    };
                }
            }
            return;
        }

        // Hit test objects
        const hitObject = engineRef.current.hitTest(coords.x, coords.y);

        // Select object
        engineRef.current.selectObject(hitObject?.id ?? null);
        selectedObjectRef.current = hitObject;
        onSelectObject?.(hitObject);

        // Start drag if using move tool and hit an object
        if (hitObject && (activeTool === 'move' || activeTool === 'select')) {
            isDraggingRef.current = true;
            activeGizmoHandleRef.current = 'xy';
            dragStartRef.current = coords;
            dragObjectStartRef.current = {
                x: hitObject.x,
                y: hitObject.y,
                width: hitObject.width,
                height: hitObject.height,
                rotation: hitObject.rotation
            };
        }
    }, [mode, isEngineReady, activeTool, getCanvasCoords, onSelectObject]);

    // Mouse move handler
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDraggingRef.current || !engineRef.current || !selectedObjectRef.current) return;

        const coords = getCanvasCoords(e);
        const dx = coords.x - dragStartRef.current.x;
        const dy = coords.y - dragStartRef.current.y;
        const handle = activeGizmoHandleRef.current;
        const objId = selectedObjectRef.current.id;

        switch (handle) {
            case 'x':
                // Move only along X axis
                engineRef.current.updateObject(objId, {
                    x: dragObjectStartRef.current.x + dx
                });
                break;
            case 'y':
                // Move only along Y axis (screen Y is inverted)
                engineRef.current.updateObject(objId, {
                    y: dragObjectStartRef.current.y - dy
                });
                break;
            case 'xy':
                // Move along both axes
                engineRef.current.updateObject(objId, {
                    x: dragObjectStartRef.current.x + dx,
                    y: dragObjectStartRef.current.y - dy
                });
                break;
            case 'rotate': {
                // Calculate rotation based on angle from center
                const objScreen = engineRef.current.worldToScreen(
                    dragObjectStartRef.current.x,
                    dragObjectStartRef.current.y
                );
                const startAngle = Math.atan2(
                    dragStartRef.current.y - objScreen.y,
                    dragStartRef.current.x - objScreen.x
                );
                const currentAngle = Math.atan2(
                    coords.y - objScreen.y,
                    coords.x - objScreen.x
                );
                const deltaAngle = (currentAngle - startAngle) * 180 / Math.PI;
                engineRef.current.updateObject(objId, {
                    rotation: dragObjectStartRef.current.rotation - deltaAngle
                });
                break;
            }
            case 'scale-x':
                // Scale width only
                engineRef.current.updateObject(objId, {
                    width: Math.max(10, dragObjectStartRef.current.width + dx * 2)
                });
                break;
            case 'scale-y':
                // Scale height only (screen Y inverted)
                engineRef.current.updateObject(objId, {
                    height: Math.max(10, dragObjectStartRef.current.height - dy * 2)
                });
                break;
            case 'scale-xy': {
                // Uniform scale
                const scale = 1 + (dx - dy) / 100;
                engineRef.current.updateObject(objId, {
                    width: Math.max(10, dragObjectStartRef.current.width * scale),
                    height: Math.max(10, dragObjectStartRef.current.height * scale)
                });
                break;
            }
        }
    }, [getCanvasCoords]);

    // Mouse up handler
    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        activeGizmoHandleRef.current = 'none';
    }, []);

    // Get cursor style based on active tool
    const getCursorStyle = useCallback((): string => {
        if (mode !== 'scene') return 'default';
        switch (activeTool) {
            case 'move': return 'move';
            case 'rotate': return 'crosshair';
            case 'scale': return 'nwse-resize';
            default: return 'default';
        }
    }, [mode, activeTool]);

    const handleMaximize = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            container.requestFullscreen();
        }
    }, []);

    return (
        <div className="game-viewport" ref={containerRef}>
            <div className="viewport-toolbar">
                <div className="viewport-toolbar-left">
                    <span className="viewport-mode">{mode === 'scene' ? 'Scene' : 'Game'}</span>
                </div>
                <div className="viewport-toolbar-center">
                    {mode === 'game' && (
                        <>
                            <button
                                className={`viewport-btn ${isPlaying ? '' : 'active'}`}
                                onClick={isPlaying ? onPause : onPlay}
                                title={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                            <button
                                className="viewport-btn"
                                onClick={onStop}
                                title="Stop"
                                disabled={!isPlaying}
                            >
                                <Square size={14} />
                            </button>
                        </>
                    )}
                </div>
                <div className="viewport-toolbar-right">
                    {mode === 'scene' && (
                        <button
                            className={`viewport-btn ${showGrid ? 'active' : ''}`}
                            onClick={() => setShowGrid(!showGrid)}
                            title="Toggle Grid"
                        >
                            <Grid size={14} />
                        </button>
                    )}
                    {mode === 'game' && isPlaying && (
                        <span className="viewport-fps">FPS: {engineState.fps}</span>
                    )}
                    <button
                        className="viewport-btn"
                        onClick={handleMaximize}
                        title="Maximize"
                    >
                        <Maximize2 size={14} />
                    </button>
                    <span className="viewport-size">{canvasSize.width} x {canvasSize.height}</span>
                </div>
            </div>
            <div className="viewport-canvas-container">
                <canvas
                    ref={canvasRef}
                    className="viewport-canvas"
                    style={{ cursor: getCursorStyle() }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
                {!isEngineReady && (
                    <div className="viewport-overlay">
                        <span className="viewport-status">
                            {mode === 'scene'
                                ? 'Scene View - ccesengine integration pending'
                                : 'Game View - Press Play to start'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
