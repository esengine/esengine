/**
 * @zh 游戏视口组件 - 单视口架构
 * @en Game Viewport Component - Single viewport architecture
 *
 * 一个 canvas，通过 mode 切换行为：
 * - Scene 模式: 场景编辑，显示 Gizmo，支持节点选择和变换
 * - Game 模式: 编译脚本并运行游戏
 *
 * Single canvas, behavior switches via mode:
 * - Scene mode: Scene editing, show gizmos, support node selection and transform
 * - Game mode: Compile scripts and run game
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Square, Maximize2, Grid, RotateCcw, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { getEditorEngine } from '../services/engine';
import { getUserScriptCompiler } from '../services/UserScriptCompiler';
import { GizmoOverlay, TransformTool } from './GizmoOverlay';
import '../styles/GameViewport.css';

interface GameViewportProps {
    mode: 'scene' | 'game';
    isPlaying?: boolean;
    activeTool?: TransformTool;
    scenePath?: string | null;
    projectPath?: string | null;
    onPlay?: () => void;
    onPause?: () => void;
    onStop?: () => void;
    onSelectNode?: (nodeId: string | null) => void;
}

export function GameViewport({
    mode,
    isPlaying = false,
    activeTool = 'select',
    scenePath,
    projectPath,
    onPlay,
    onPause,
    onStop,
    onSelectNode
}: GameViewportProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const [showGrid, setShowGrid] = useState(true);
    const [isEngineReady, setIsEngineReady] = useState(false);
    const [engineError, setEngineError] = useState<string | null>(null);
    const [engineState, setEngineState] = useState({ fps: 60, frameCount: 0 });

    // Game mode compilation state
    const [compileStatus, setCompileStatus] = useState<{
        state: 'idle' | 'compiling' | 'injecting' | 'loading' | 'running' | 'error';
        message?: string;
        compiledCount?: number;
        failedCount?: number;
    }>({ state: 'idle' });

    // Scene mode loading state
    const [sceneLoadStatus, setSceneLoadStatus] = useState<{
        state: 'idle' | 'compiling' | 'loading' | 'ready' | 'error';
        message?: string;
    }>({ state: 'idle' });

    const engine = getEditorEngine();
    const scriptCompiler = getUserScriptCompiler();

    // Handle container resize
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
                }
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    // Initialize engine and attach canvas
    // Handle hot reload: if engine is already initialized, just re-attach the canvas
    useEffect(() => {
        const canvasContainer = canvasContainerRef.current;
        if (!canvasContainer) return;

        let mounted = true;

        const initAndAttach = async () => {
            try {
                // Check if engine is already initialized (e.g., after hot reload)
                if (engine.getIsInitialized()) {
                    if (mounted) {
                        setIsEngineReady(true);
                        setEngineError(null);
                        engine.attachToContainer(canvasContainer);
                    }
                    return;
                }

                const success = await engine.init();

                if (!mounted) return;

                if (success) {
                    setIsEngineReady(true);
                    setEngineError(null);
                    engine.attachToContainer(canvasContainer);
                } else {
                    setEngineError('Engine initialization failed');
                    console.error('[GameViewport] Engine init returned false');
                }
            } catch (err) {
                console.error('[GameViewport] Engine init error:', err);
                if (mounted) {
                    setEngineError(err instanceof Error ? err.message : String(err));
                }
            }
        };

        initAndAttach();

        return () => {
            mounted = false;
        };
    }, [engine]);

    // Update canvas size
    useEffect(() => {
        if (isEngineReady) {
            engine.resize(canvasSize.width, canvasSize.height);
        }
    }, [canvasSize, isEngineReady, engine]);

    // Load scene when scenePath changes (Scene mode)
    useEffect(() => {
        if (!scenePath || !isEngineReady || !projectPath) return;
        if (mode !== 'scene') return;


        const loadSceneForEditing = async () => {
            try {
                // Step 1: Compile user scripts
                setSceneLoadStatus({ state: 'compiling', message: 'Compiling scripts...' });
                const compileResult = await scriptCompiler.compileProject(projectPath);

                if (compileResult.compiledCount > 0) {
                    await scriptCompiler.injectCompiledModules();
                }

                // Step 2: Load scene into ccesengine
                setSceneLoadStatus({ state: 'loading', message: 'Loading scene...' });
                const success = await engine.loadSceneFromFile(scenePath);
                if (success) {
                    setSceneLoadStatus({ state: 'ready' });
                } else {
                    setSceneLoadStatus({ state: 'error', message: 'Failed to load scene' });
                }
            } catch (err) {
                console.error('[GameViewport] Scene load error:', err);
                setSceneLoadStatus({ state: 'error', message: String(err) });
            }
        };

        loadSceneForEditing();
    }, [scenePath, isEngineReady, mode, engine, projectPath, scriptCompiler]);

    // Track if game is starting to prevent duplicate starts
    const isStartingRef = useRef(false);

    // Handle play/stop (Game mode)
    useEffect(() => {
        if (mode !== 'game') return;

        if (isPlaying && projectPath && scenePath) {
            if (isStartingRef.current || compileStatus.state !== 'idle') {
                return;
            }

            isStartingRef.current = true;

            const startGame = async () => {
                try {
                    // Step 1: Compile scripts
                    setCompileStatus({ state: 'compiling', message: 'Compiling scripts...' });
                    const compileResult = await scriptCompiler.compileProject(projectPath);

                    if (!compileResult.success && compileResult.failedCount > 0) {
                        setCompileStatus({
                            state: 'error',
                            message: `Compilation failed: ${compileResult.errors[0]}`,
                            compiledCount: compileResult.compiledCount,
                            failedCount: compileResult.failedCount,
                        });
                        isStartingRef.current = false;
                        return;
                    }

                    // Step 2: Inject compiled modules
                    setCompileStatus({
                        state: 'injecting',
                        message: 'Registering classes...',
                        compiledCount: compileResult.compiledCount,
                    });
                    await scriptCompiler.injectCompiledModules();

                    // Step 3: Load scene
                    setCompileStatus({
                        state: 'loading',
                        message: 'Loading scene...',
                        compiledCount: compileResult.compiledCount,
                    });

                    const loadSuccess = await engine.loadSceneFromFile(scenePath);
                    if (!loadSuccess) {
                        setCompileStatus({ state: 'error', message: 'Failed to load scene' });
                        isStartingRef.current = false;
                        return;
                    }

                    // Step 4: Running
                    setCompileStatus({
                        state: 'running',
                        message: 'Game running',
                        compiledCount: compileResult.compiledCount,
                    });
                    engine.play();
                    isStartingRef.current = false;

                } catch (error) {
                    console.error('[GameViewport] Failed to start game:', error);
                    setCompileStatus({ state: 'error', message: String(error) });
                    isStartingRef.current = false;
                }
            };

            startGame();
        } else if (!isPlaying) {
            isStartingRef.current = false;
            if (compileStatus.state === 'running') {
                engine.stop();
            }
            setCompileStatus({ state: 'idle' });
            scriptCompiler.clearCache().catch(console.error);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, isPlaying, projectPath, scenePath]);

    // Reload game
    const handleReloadGame = useCallback(async () => {
        if (!projectPath || !scenePath) return;
        engine.stop();
        await scriptCompiler.clearCache();
        setCompileStatus({ state: 'idle' });
    }, [projectPath, scenePath, engine, scriptCompiler]);

    // Update FPS display
    useEffect(() => {
        if (mode !== 'game' || !isPlaying) return;

        const interval = setInterval(() => {
            setEngineState(prev => ({ ...prev, frameCount: prev.frameCount + 1 }));
        }, 100);

        return () => clearInterval(interval);
    }, [mode, isPlaying]);

    // Handle node selection
    const handleSelectNode = useCallback((nodeId: string | null) => {
        engine.selectNode(nodeId);
        onSelectNode?.(nodeId);
    }, [engine, onSelectNode]);

    // Reset camera
    const handleResetCamera = useCallback(() => {
        engine.resetEditorCamera();
    }, [engine]);

    // Fullscreen
    const handleMaximize = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            container.requestFullscreen();
        }
    }, []);

    const isGameMode = mode === 'game';
    const isSceneMode = mode === 'scene';

    return (
        <div className="game-viewport" ref={containerRef}>
            {/* Toolbar */}
            <div className="viewport-toolbar">
                <div className="viewport-toolbar-left">
                    <span className="viewport-mode">{isSceneMode ? 'Scene' : 'Game'}</span>
                </div>
                <div className="viewport-toolbar-center">
                    {isGameMode && (
                        <>
                            <button
                                className={`viewport-btn ${isPlaying ? '' : 'active'}`}
                                onClick={isPlaying ? onStop : onPlay}
                                title={isPlaying ? 'Stop' : 'Play'}
                                disabled={compileStatus.state === 'compiling' || compileStatus.state === 'injecting' || compileStatus.state === 'loading'}
                            >
                                {compileStatus.state === 'compiling' || compileStatus.state === 'injecting' || compileStatus.state === 'loading' ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : isPlaying ? (
                                    <Square size={14} />
                                ) : (
                                    <Play size={14} />
                                )}
                            </button>
                            {isPlaying && compileStatus.state === 'running' && (
                                <button
                                    className="viewport-btn"
                                    onClick={handleReloadGame}
                                    title="Reload"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            )}
                        </>
                    )}
                </div>
                <div className="viewport-toolbar-right">
                    {isSceneMode && (
                        <>
                            <button
                                className={`viewport-btn ${showGrid ? 'active' : ''}`}
                                onClick={() => setShowGrid(!showGrid)}
                                title="Toggle Grid"
                            >
                                <Grid size={14} />
                            </button>
                            <button
                                className="viewport-btn"
                                onClick={handleResetCamera}
                                title="Reset Camera"
                            >
                                <RotateCcw size={14} />
                            </button>
                        </>
                    )}
                    {isGameMode && isPlaying && (
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

            {/* Canvas area - single container for both modes */}
            <div className="viewport-canvas-container">
                <div
                    className="viewport-canvas-wrapper"
                    ref={canvasContainerRef}
                    style={{ position: 'relative', width: '100%', height: '100%' }}
                >
                    {/* Gizmo overlay for Scene mode */}
                    {isSceneMode && isEngineReady && (
                        <GizmoOverlay
                            width={canvasSize.width}
                            height={canvasSize.height}
                            activeTool={activeTool}
                            showGrid={showGrid}
                            onSelectNode={handleSelectNode}
                        />
                    )}

                    {/* Loading overlay */}
                    {!isEngineReady && !engineError && (
                        <div className="viewport-overlay">
                            <Loader2 size={24} className="animate-spin" />
                            <span className="viewport-status">Initializing engine...</span>
                        </div>
                    )}

                    {/* Engine error overlay */}
                    {engineError && (
                        <div className="viewport-overlay viewport-error">
                            <AlertCircle size={24} />
                            <span className="viewport-status">Engine Error</span>
                            <span className="viewport-status-detail">{engineError}</span>
                        </div>
                    )}

                    {/* Scene mode loading overlays */}
                    {isSceneMode && isEngineReady && (
                        <>
                            {sceneLoadStatus.state === 'compiling' && (
                                <div className="viewport-overlay">
                                    <Loader2 size={24} className="animate-spin" />
                                    <span className="viewport-status">Compiling scripts...</span>
                                </div>
                            )}

                            {sceneLoadStatus.state === 'loading' && (
                                <div className="viewport-overlay">
                                    <Loader2 size={24} className="animate-spin" />
                                    <span className="viewport-status">Loading scene...</span>
                                </div>
                            )}

                            {sceneLoadStatus.state === 'error' && (
                                <div className="viewport-overlay viewport-error">
                                    <AlertCircle size={24} />
                                    <span className="viewport-status">Scene Load Error</span>
                                    <span className="viewport-status-detail">{sceneLoadStatus.message}</span>
                                </div>
                            )}

                            {!scenePath && sceneLoadStatus.state === 'idle' && (
                                <div className="viewport-overlay">
                                    <span className="viewport-status">Double-click a scene file to open</span>
                                </div>
                            )}
                        </>
                    )}

                    {/* Game mode overlays */}
                    {isGameMode && (
                        <>
                            {compileStatus.state === 'compiling' && (
                                <div className="viewport-overlay">
                                    <Loader2 size={24} className="animate-spin" />
                                    <span className="viewport-status">Compiling scripts...</span>
                                </div>
                            )}

                            {compileStatus.state === 'injecting' && (
                                <div className="viewport-overlay">
                                    <Loader2 size={24} className="animate-spin" />
                                    <span className="viewport-status">
                                        Registering {compileStatus.compiledCount} classes...
                                    </span>
                                </div>
                            )}

                            {compileStatus.state === 'loading' && (
                                <div className="viewport-overlay">
                                    <Loader2 size={24} className="animate-spin" />
                                    <span className="viewport-status">Loading scene...</span>
                                </div>
                            )}

                            {compileStatus.state === 'error' && (
                                <div className="viewport-overlay viewport-error">
                                    <AlertCircle size={24} />
                                    <span className="viewport-status">{compileStatus.message}</span>
                                    {compileStatus.failedCount && (
                                        <span className="viewport-status-detail">
                                            {compileStatus.compiledCount} compiled, {compileStatus.failedCount} failed
                                        </span>
                                    )}
                                </div>
                            )}

                            {!isPlaying && compileStatus.state === 'idle' && (
                                <div className="viewport-overlay">
                                    <Play size={24} />
                                    <span className="viewport-status">Press Play to compile and run</span>
                                </div>
                            )}

                            {compileStatus.state === 'running' && (
                                <div className="viewport-running-status">
                                    <span className="status-dot"></span>
                                    <span>Running ({compileStatus.compiledCount} scripts)</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
