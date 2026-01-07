import { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Square, Maximize2, Grid } from 'lucide-react';
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
    const [isEngineReady, setIsEngineReady] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const [showGrid, setShowGrid] = useState(mode === 'scene');

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
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        // Trigger engine resize if initialized
        if (isEngineReady) {
            // TODO: Call ccesengine resize
            // game.canvas = canvas;
            // screen.windowSize = { width: canvasSize.width, height: canvasSize.height };
        }
    }, [canvasSize, isEngineReady]);

    // Initialize engine
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // TODO: Initialize ccesengine here
        // import { game, Game, director } from 'ccesengine';
        //
        // game.init({
        //     overrideSettings: {
        //         rendering: {
        //             renderMode: 2, // WebGL
        //         }
        //     }
        // }).then(() => {
        //     game.run();
        //     setIsEngineReady(true);
        // });

        // For now, draw a placeholder grid
        const ctx = canvas.getContext('2d');
        if (ctx) {
            drawGrid(ctx, canvasSize.width, canvasSize.height);
        }

        return () => {
            // TODO: Cleanup ccesengine
            // game.end();
        };
    }, []);

    // Redraw grid when size changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || isEngineReady) return;

        const ctx = canvas.getContext('2d');
        if (ctx && showGrid) {
            drawGrid(ctx, canvasSize.width, canvasSize.height);
        }
    }, [canvasSize, isEngineReady, showGrid]);

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        if (!showGrid) return;

        const gridSize = 50;
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;

        // Draw grid lines
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw center lines
        ctx.strokeStyle = '#3a3a3a';
        ctx.lineWidth = 2;
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Draw center marker
        ctx.fillStyle = '#4a9eff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fill();
    };

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
