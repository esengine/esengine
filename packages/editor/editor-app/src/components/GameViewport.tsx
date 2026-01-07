import { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Square, Maximize2, Grid } from 'lucide-react';
import { getEngineService, IEngineService } from '../services/EngineService';
import '../styles/GameViewport.css';

interface GameViewportProps {
    mode: 'scene' | 'game';
    isPlaying?: boolean;
    onPlay?: () => void;
    onPause?: () => void;
    onStop?: () => void;
}

export function GameViewport({ mode, isPlaying = false, onPlay, onPause, onStop }: GameViewportProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<IEngineService | null>(null);
    const [isEngineReady, setIsEngineReady] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const [showGrid, setShowGrid] = useState(mode === 'scene');
    const [engineState, setEngineState] = useState({ fps: 0, frameCount: 0 });

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
                <canvas ref={canvasRef} className="viewport-canvas" />
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
