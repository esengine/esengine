/**
 * 渲染调试面板（Frame Debugger 风格）
 * Render Debug Panel (Frame Debugger Style)
 *
 * 用于诊断渲染问题的可视化调试工具
 * Visual debugging tool for diagnosing rendering issues
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    X,
    ExternalLink,
    Monitor,
    Play,
    Pause,
    SkipForward,
    SkipBack,
    ChevronRight,
    ChevronDown,
    ChevronFirst,
    ChevronLast,
    Layers,
    Image,
    Sparkles,
    RefreshCw,
    Download,
    Radio,
    Square,
    Type
} from 'lucide-react';
import { WebviewWindow, getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { emit, emitTo, listen, type UnlistenFn } from '@tauri-apps/api/event';
import { renderDebugService, type RenderDebugSnapshot, type SpriteDebugInfo, type ParticleDebugInfo, type UIDebugInfo } from '../../services/RenderDebugService';
import './RenderDebugPanel.css';

/**
 * 渲染事件类型
 * Render event type
 */
type RenderEventType = 'clear' | 'sprite' | 'particle' | 'ui' | 'batch' | 'draw';

/**
 * 渲染事件
 * Render event
 */
interface RenderEvent {
    id: number;
    type: RenderEventType;
    name: string;
    children?: RenderEvent[];
    expanded?: boolean;
    data?: SpriteDebugInfo | ParticleDebugInfo | UIDebugInfo | any;
    drawCalls?: number;
    vertices?: number;
}

interface RenderDebugPanelProps {
    visible: boolean;
    onClose: () => void;
    /** 独立窗口模式（填满整个窗口）| Standalone mode (fill entire window) */
    standalone?: boolean;
}

// 最大历史帧数 | Max history frames
const MAX_HISTORY_FRAMES = 120;

export const RenderDebugPanel: React.FC<RenderDebugPanelProps> = ({ visible, onClose, standalone = false }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [snapshot, setSnapshot] = useState<RenderDebugSnapshot | null>(null);
    const [events, setEvents] = useState<RenderEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<RenderEvent | null>(null);

    // 帧历史 | Frame history
    const [frameHistory, setFrameHistory] = useState<RenderDebugSnapshot[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1); // -1 表示实时模式 | -1 means live mode

    // 窗口拖动状态 | Window drag state
    const [position, setPosition] = useState({ x: 100, y: 60 });
    const [size, setSize] = useState({ width: 900, height: 600 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const windowRef = useRef<HTMLDivElement>(null);

    // 弹出为独立窗口 | Pop out to separate window
    const handlePopOut = useCallback(async () => {
        try {
            // 检查窗口是否已存在 | Check if window already exists
            const existingWindow = await WebviewWindow.getByLabel('frame-debugger');
            if (existingWindow) {
                // 聚焦到现有窗口 | Focus existing window
                await existingWindow.setFocus();
                onClose();
                return;
            }

            const webview = new WebviewWindow('frame-debugger', {
                url: window.location.href.split('?')[0] + '?mode=frame-debugger',
                title: 'Frame Debugger',
                width: 1000,
                height: 700,
                minWidth: 600,
                minHeight: 400,
                center: false,
                x: 100,
                y: 100,
                resizable: true,
                decorations: true,
                alwaysOnTop: false,
                focus: true
            });

            webview.once('tauri://created', () => {
                console.log('[FrameDebugger] Separate window created');
                onClose(); // 关闭内嵌面板 | Close embedded panel
            });

            webview.once('tauri://error', (e) => {
                console.error('[FrameDebugger] Failed to create window:', e);
            });
        } catch (err) {
            console.error('[FrameDebugger] Error creating window:', err);
        }
    }, [onClose]);

    // 从快照构建事件树 | Build event tree from snapshot
    const buildEventsFromSnapshot = useCallback((snap: RenderDebugSnapshot): RenderEvent[] => {
        const newEvents: RenderEvent[] = [];
        let eventId = 0;

        newEvents.push({
            id: eventId++,
            type: 'clear',
            name: 'Clear (color)',
            drawCalls: 1,
            vertices: 0
        });

        if (snap.sprites.length > 0) {
            const spriteChildren: RenderEvent[] = snap.sprites.map((sprite) => ({
                id: eventId++,
                type: 'sprite' as RenderEventType,
                name: `Draw Sprite: ${sprite.entityName}`,
                data: sprite,
                drawCalls: 1,
                vertices: 4
            }));

            newEvents.push({
                id: eventId++,
                type: 'batch',
                name: `SpriteBatch (${snap.sprites.length} sprites)`,
                children: spriteChildren,
                expanded: true,
                drawCalls: snap.sprites.length,
                vertices: snap.sprites.length * 4
            });
        }

        snap.particles.forEach(ps => {
            const particleChildren: RenderEvent[] = ps.sampleParticles.map((p, idx) => ({
                id: eventId++,
                type: 'particle' as RenderEventType,
                name: `Particle ${idx}: frame=${p.frame}`,
                data: { ...p, systemName: ps.systemName },
                drawCalls: 0,
                vertices: 4
            }));

            newEvents.push({
                id: eventId++,
                type: 'particle',
                name: `ParticleSystem: ${ps.entityName} (${ps.activeCount} active)`,
                children: particleChildren,
                expanded: false,
                data: ps,
                drawCalls: 1,
                vertices: ps.activeCount * 4
            });
        });

        // UI 元素 | UI elements
        if (snap.uiElements && snap.uiElements.length > 0) {
            const uiChildren: RenderEvent[] = snap.uiElements.map((ui) => ({
                id: eventId++,
                type: 'ui' as RenderEventType,
                name: `UI ${ui.type}: ${ui.entityName}`,
                data: ui,
                drawCalls: 1,
                vertices: 4
            }));

            newEvents.push({
                id: eventId++,
                type: 'batch',
                name: `UIBatch (${snap.uiElements.length} elements)`,
                children: uiChildren,
                expanded: true,
                drawCalls: snap.uiElements.length,
                vertices: snap.uiElements.length * 4
            });
        }

        newEvents.push({
            id: eventId++,
            type: 'draw',
            name: 'BlitFinalToBackBuffer',
            drawCalls: 1,
            vertices: 3
        });

        return newEvents;
    }, []);

    // 添加快照到历史 | Add snapshot to history
    const addToHistory = useCallback((snap: RenderDebugSnapshot) => {
        setFrameHistory(prev => {
            const newHistory = [...prev, snap];
            if (newHistory.length > MAX_HISTORY_FRAMES) {
                newHistory.shift();
            }
            return newHistory;
        });
    }, []);

    // 跳转到指定帧 | Go to specific frame
    const goToFrame = useCallback((index: number) => {
        if (index < 0 || index >= frameHistory.length) return;

        setHistoryIndex(index);
        const snap = frameHistory[index];
        if (snap) {
            setSnapshot(snap);
            setEvents(buildEventsFromSnapshot(snap));
            setSelectedEvent(null);
        }
    }, [frameHistory, buildEventsFromSnapshot]);

    // 返回实时模式 | Return to live mode
    const goLive = useCallback(() => {
        setHistoryIndex(-1);
        setIsPaused(false);
    }, []);

    // 刷新数据 | Refresh data
    const refreshData = useCallback(() => {
        // 独立窗口模式下不直接收集，等待主窗口广播 | In standalone mode, wait for broadcast from main window
        if (standalone) return;
        // 如果在历史回放模式，不刷新 | Don't refresh if in history playback mode
        if (historyIndex >= 0) return;

        renderDebugService.setEnabled(true);
        const snap = renderDebugService.collectSnapshot();

        if (snap) {
            setSnapshot(snap);
            addToHistory(snap);
            setEvents(buildEventsFromSnapshot(snap));

            // 广播给独立窗口 | Broadcast to standalone windows
            emit('render-debug-snapshot', snap).catch(() => {});
        }
    }, [standalone, historyIndex, addToHistory, buildEventsFromSnapshot]);

    // 处理接收到的快照数据 | Process received snapshot data
    const processSnapshot = useCallback((snap: RenderDebugSnapshot) => {
        // 如果在历史回放模式，不处理新数据 | Don't process new data if in history playback mode
        if (historyIndex >= 0) return;

        setSnapshot(snap);
        addToHistory(snap);
        setEvents(buildEventsFromSnapshot(snap));
    }, [historyIndex, addToHistory, buildEventsFromSnapshot]);

    // 独立窗口模式：监听主窗口广播 | Standalone mode: listen to main window broadcast
    useEffect(() => {
        if (!standalone || !visible) return;

        console.log('[FrameDebugger-Standalone] Setting up listener for render-debug-snapshot');

        let unlisten: UnlistenFn | null = null;

        listen<RenderDebugSnapshot>('render-debug-snapshot', (event) => {
            console.log('[FrameDebugger-Standalone] Received snapshot:', event.payload?.frameNumber);
            if (!isPaused) {
                processSnapshot(event.payload);
            }
        }).then(fn => {
            unlisten = fn;
            console.log('[FrameDebugger-Standalone] Listener registered successfully');
        });

        // 通知主窗口开始收集 | Notify main window to start collecting
        console.log('[FrameDebugger-Standalone] Sending render-debug-request-data to main window...');
        emitTo('main', 'render-debug-request-data', {}).then(() => {
            console.log('[FrameDebugger-Standalone] Request sent to main window successfully');
        }).catch((err) => {
            console.error('[FrameDebugger-Standalone] Failed to send request:', err);
        });

        return () => {
            unlisten?.();
        };
    }, [standalone, visible, isPaused, processSnapshot]);

    // 自动刷新（仅主窗口模式且面板可见）| Auto refresh (main window mode only, when panel visible)
    useEffect(() => {
        if (visible && !isPaused && !standalone) {
            refreshData();
            const interval = setInterval(refreshData, 500);
            return () => clearInterval(interval);
        }
    }, [visible, isPaused, standalone, refreshData]);

    // 拖动处理 | Drag handling
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.window-header')) {
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    }, [position]);

    const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
        setDragOffset({
            x: e.clientX,
            y: e.clientY
        });
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: Math.max(0, e.clientX - dragOffset.x),
                    y: Math.max(0, e.clientY - dragOffset.y)
                });
            } else if (isResizing) {
                const dx = e.clientX - dragOffset.x;
                const dy = e.clientY - dragOffset.y;
                setSize(prev => ({
                    width: Math.max(400, prev.width + dx),
                    height: Math.max(300, prev.height + dy)
                }));
                setDragOffset({ x: e.clientX, y: e.clientY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, dragOffset]);

    // 绘制预览 | Draw preview
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        // 背景 | Background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, rect.width, rect.height);

        if (!selectedEvent) {
            ctx.fillStyle = '#666';
            ctx.font = '12px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('Select a render event to preview', rect.width / 2, rect.height / 2);
            return;
        }

        const data = selectedEvent.data;
        const margin = 20;
        const viewWidth = rect.width - margin * 2;
        const viewHeight = rect.height - margin * 2;

        // ParticleSystem：显示粒子空间分布 | ParticleSystem: show particle spatial distribution
        if (selectedEvent.type === 'particle' && data?.sampleParticles?.length > 0) {
            const particles = data.sampleParticles;

            // 计算边界 | Calculate bounds
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            particles.forEach((p: any) => {
                minX = Math.min(minX, p.x);
                maxX = Math.max(maxX, p.x);
                minY = Math.min(minY, p.y);
                maxY = Math.max(maxY, p.y);
            });

            // 添加边距 | Add padding
            const padding = 50;
            const rangeX = Math.max(maxX - minX, 100) + padding * 2;
            const rangeY = Math.max(maxY - minY, 100) + padding * 2;
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            const scale = Math.min(viewWidth / rangeX, viewHeight / rangeY);

            // 绘制坐标轴 | Draw axes
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            const originX = margin + viewWidth / 2 - centerX * scale;
            const originY = margin + viewHeight / 2 + centerY * scale;

            // X 轴 | X axis
            ctx.beginPath();
            ctx.moveTo(margin, originY);
            ctx.lineTo(margin + viewWidth, originY);
            ctx.stroke();
            // Y 轴 | Y axis
            ctx.beginPath();
            ctx.moveTo(originX, margin);
            ctx.lineTo(originX, margin + viewHeight);
            ctx.stroke();

            // 绘制粒子 | Draw particles
            const frameColors = ['#4a9eff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'] as const;
            particles.forEach((p: any, idx: number) => {
                const px = margin + viewWidth / 2 + (p.x - centerX) * scale;
                const py = margin + viewHeight / 2 - (p.y - centerY) * scale;
                const size = Math.max(4, Math.min(20, (p.size ?? 10) * scale * 0.1));
                const color = frameColors[idx % frameColors.length] ?? '#4a9eff';
                const alpha = p.alpha ?? 1;

                ctx.globalAlpha = alpha;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fill();

                // 标注帧号 | Label frame number
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#fff';
                ctx.font = '9px Consolas';
                ctx.textAlign = 'center';
                ctx.fillText(`f${p.frame}`, px, py - size - 3);
            });

            ctx.globalAlpha = 1;

            // 显示信息 | Show info
            ctx.fillStyle = '#666';
            ctx.font = '10px system-ui';
            ctx.textAlign = 'left';
            ctx.fillText(`${particles.length} particles sampled`, margin, rect.height - 6);

        } else if (data?.uv) {
            // Sprite 或单个粒子：显示 UV 区域 | Sprite or single particle: show UV region
            const uv = data.uv;
            const previewSize = Math.min(viewWidth, viewHeight);
            const offsetX = (rect.width - previewSize) / 2;
            const offsetY = (rect.height - previewSize) / 2;

            // 绘制纹理边框 | Draw texture border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(offsetX, offsetY, previewSize, previewSize);

            // 如果是粒子帧，显示 TextureSheet 网格 | If particle frame, show TextureSheet grid
            const tilesX = data._animTilesX ?? (data.systemName ? 1 : 1);
            const tilesY = data._animTilesY ?? 1;

            if (tilesX > 1 || tilesY > 1) {
                const cellWidth = previewSize / tilesX;
                const cellHeight = previewSize / tilesY;

                // 绘制网格 | Draw grid
                ctx.strokeStyle = '#2a2a2a';
                for (let i = 0; i <= tilesX; i++) {
                    ctx.beginPath();
                    ctx.moveTo(offsetX + i * cellWidth, offsetY);
                    ctx.lineTo(offsetX + i * cellWidth, offsetY + previewSize);
                    ctx.stroke();
                }
                for (let j = 0; j <= tilesY; j++) {
                    ctx.beginPath();
                    ctx.moveTo(offsetX, offsetY + j * cellHeight);
                    ctx.lineTo(offsetX + previewSize, offsetY + j * cellHeight);
                    ctx.stroke();
                }
            }

            // 高亮 UV 区域 | Highlight UV region
            const x = offsetX + uv[0] * previewSize;
            const y = offsetY + uv[1] * previewSize;
            const w = (uv[2] - uv[0]) * previewSize;
            const h = (uv[3] - uv[1]) * previewSize;

            ctx.fillStyle = 'rgba(74, 158, 255, 0.3)';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = '#4a9eff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);

            // 显示 UV 坐标 | Show UV coordinates
            ctx.fillStyle = '#4a9eff';
            ctx.font = '10px Consolas, monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`UV: [${uv.map((v: number) => v.toFixed(3)).join(', ')}]`, offsetX, offsetY + previewSize + 14);

            if (data.frame !== undefined) {
                ctx.fillText(`Frame: ${data.frame}`, offsetX, offsetY + previewSize + 26);
            }
        } else {
            // 其他事件类型 | Other event types
            ctx.fillStyle = '#555';
            ctx.font = '11px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(selectedEvent.name, rect.width / 2, rect.height / 2 - 10);
            ctx.fillStyle = '#444';
            ctx.font = '10px system-ui';
            ctx.fillText('No visual data available', rect.width / 2, rect.height / 2 + 10);
        }
    }, [selectedEvent]);

    // 切换展开/折叠 | Toggle expand/collapse
    const toggleExpand = (event: RenderEvent) => {
        setEvents(prev => prev.map(e => {
            if (e.id === event.id) {
                return { ...e, expanded: !e.expanded };
            }
            return e;
        }));
    };

    // 导出数据 | Export data
    const handleExport = () => {
        const json = renderDebugService.exportAsJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `render-debug-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!visible) return null;

    // 独立窗口模式的样式 | Standalone mode styles
    const windowStyle = standalone
        ? { left: 0, top: 0, width: '100%', height: '100%', borderRadius: 0 }
        : { left: position.x, top: position.y, width: size.width, height: size.height };

    return (
        <div
            ref={windowRef}
            className={`render-debug-window ${isDragging ? 'dragging' : ''} ${standalone ? 'standalone' : ''}`}
            style={windowStyle}
            onMouseDown={standalone ? undefined : handleMouseDown}
        >
            {/* 头部（可拖动）| Header (draggable) */}
            <div className="window-header">
                <div className="window-title">
                    <Monitor size={16} />
                    <span>Frame Debugger</span>
                    {isPaused && (
                        <span className="paused-badge">PAUSED</span>
                    )}
                </div>
                <div className="window-controls">
                    {!standalone && (
                        <button className="window-btn" onClick={handlePopOut} title="Pop out to separate window">
                            <ExternalLink size={14} />
                        </button>
                    )}
                    <button className="window-btn" onClick={onClose} title="Close">
                        <X size={14} />
                    </button>
                </div>
            </div>

                {/* 工具栏 | Toolbar */}
                <div className="render-debug-toolbar">
                    <div className="toolbar-left">
                        <button
                            className={`toolbar-btn icon-only ${historyIndex < 0 && !isPaused ? 'recording' : ''}`}
                            onClick={() => {
                                if (historyIndex >= 0) {
                                    goLive();
                                } else {
                                    setIsPaused(!isPaused);
                                }
                            }}
                            title={historyIndex >= 0 ? 'Go Live' : (isPaused ? 'Start capturing' : 'Stop capturing')}
                        >
                            {historyIndex >= 0 ? <Radio size={14} /> : (isPaused ? <Play size={14} /> : <span className="record-dot" />)}
                        </button>
                        {historyIndex >= 0 && (
                            <span className="history-badge">HISTORY</span>
                        )}
                        <div className="toolbar-separator" />
                        <button
                            className="toolbar-btn icon-only"
                            onClick={() => goToFrame(0)}
                            disabled={frameHistory.length === 0}
                            title="First Frame"
                        >
                            <ChevronFirst size={14} />
                        </button>
                        <button
                            className="toolbar-btn icon-only"
                            onClick={() => goToFrame(historyIndex > 0 ? historyIndex - 1 : frameHistory.length - 1)}
                            disabled={frameHistory.length === 0}
                            title="Previous Frame"
                        >
                            <SkipBack size={14} />
                        </button>
                        <span className="frame-counter">
                            {historyIndex >= 0
                                ? `${historyIndex + 1} / ${frameHistory.length}`
                                : `Frame ${snapshot?.frameNumber ?? 0}`}
                        </span>
                        <button
                            className="toolbar-btn icon-only"
                            onClick={() => goToFrame(historyIndex >= 0 ? historyIndex + 1 : 0)}
                            disabled={frameHistory.length === 0 || (historyIndex >= 0 && historyIndex >= frameHistory.length - 1)}
                            title="Next Frame"
                        >
                            <SkipForward size={14} />
                        </button>
                        <button
                            className="toolbar-btn icon-only"
                            onClick={() => goToFrame(frameHistory.length - 1)}
                            disabled={frameHistory.length === 0}
                            title="Last Frame"
                        >
                            <ChevronLast size={14} />
                        </button>
                    </div>
                    <div className="toolbar-right">
                        <button className="toolbar-btn icon-only" onClick={refreshData} title="Capture Frame">
                            <RefreshCw size={14} />
                        </button>
                        <button className="toolbar-btn icon-only" onClick={handleExport} title="Export JSON">
                            <Download size={14} />
                        </button>
                    </div>
                </div>

                {/* 时间线 | Timeline */}
                {frameHistory.length > 0 && (
                    <div className="render-debug-timeline">
                        <input
                            type="range"
                            min={0}
                            max={frameHistory.length - 1}
                            value={historyIndex >= 0 ? historyIndex : frameHistory.length - 1}
                            onChange={(e) => {
                                const idx = parseInt(e.target.value);
                                setIsPaused(true);
                                goToFrame(idx);
                            }}
                            className="timeline-slider"
                        />
                        <div className="timeline-info">
                            <span>{frameHistory.length} frames captured</span>
                            {historyIndex >= 0 && snapshot && (
                                <span>Frame #{snapshot.frameNumber}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* 主内容区 | Main content */}
                <div className="render-debug-main">
                    {/* 左侧事件列表 | Left: Event list */}
                    <div className="render-debug-left">
                        <div className="event-list-header">
                            <span>Render Events</span>
                            <span className="event-count">{events.reduce((sum, e) => sum + (e.drawCalls || 0), 0)} draw calls</span>
                        </div>
                        <div className="event-list">
                            {events.length === 0 ? (
                                <div className="event-empty">
                                    No render events captured.
                                    <br />
                                    Start preview mode to see events.
                                </div>
                            ) : (
                                events.map(event => (
                                    <EventItem
                                        key={event.id}
                                        event={event}
                                        depth={0}
                                        selected={selectedEvent?.id === event.id}
                                        onSelect={setSelectedEvent}
                                        onToggle={toggleExpand}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* 右侧内容 | Right: Content */}
                    <div className="render-debug-right">
                        {/* 预览区 | Preview */}
                        <div className="render-debug-preview">
                            <div className="preview-header">
                                <span>Output</span>
                            </div>
                            <div className="preview-canvas-container">
                                <canvas ref={canvasRef} />
                            </div>
                        </div>

                        {/* 详情区 | Details */}
                        <div className="render-debug-details">
                            <div className="details-header">
                                <span>Details</span>
                            </div>
                            <div className="details-content">
                                {selectedEvent ? (
                                    <EventDetails event={selectedEvent} />
                                ) : (
                                    <div className="details-empty">
                                        Select a render event to see details
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            {/* 统计栏 | Stats bar */}
            <div className="render-debug-stats">
                <div className="stat-item">
                    <Monitor size={12} />
                    <span>Draw Calls: {events.reduce((sum, e) => sum + (e.drawCalls || 0), 0)}</span>
                </div>
                <div className="stat-item">
                    <Layers size={12} />
                    <span>Sprites: {snapshot?.sprites?.length ?? 0}</span>
                </div>
                <div className="stat-item">
                    <Sparkles size={12} />
                    <span>Particles: {snapshot?.particles?.reduce((sum, p) => sum + p.activeCount, 0) ?? 0}</span>
                </div>
                <div className="stat-item">
                    <Square size={12} />
                    <span>UI: {snapshot?.uiElements?.length ?? 0}</span>
                </div>
                <div className="stat-item">
                    <Image size={12} />
                    <span>Systems: {snapshot?.particles?.length ?? 0}</span>
                </div>
            </div>

            {/* 调整大小手柄（独立模式下隐藏）| Resize handle (hidden in standalone mode) */}
            {!standalone && <div className="resize-handle" onMouseDown={handleResizeMouseDown} />}
        </div>
    );
};

// ========== 子组件 | Sub-components ==========

interface EventItemProps {
    event: RenderEvent;
    depth: number;
    selected: boolean;
    onSelect: (event: RenderEvent) => void;
    onToggle: (event: RenderEvent) => void;
}

const EventItem: React.FC<EventItemProps> = ({ event, depth, selected, onSelect, onToggle }) => {
    const hasChildren = event.children && event.children.length > 0;
    const iconSize = 12;

    const getTypeIcon = () => {
        switch (event.type) {
            case 'sprite': return <Image size={iconSize} className="event-icon sprite" />;
            case 'particle': return <Sparkles size={iconSize} className="event-icon particle" />;
            case 'ui': return <Square size={iconSize} className="event-icon ui" />;
            case 'batch': return <Layers size={iconSize} className="event-icon batch" />;
            default: return <Monitor size={iconSize} className="event-icon" />;
        }
    };

    return (
        <>
            <div
                className={`event-item ${selected ? 'selected' : ''}`}
                style={{ paddingLeft: 8 + depth * 16 }}
                onClick={() => onSelect(event)}
            >
                {hasChildren ? (
                    <span className="expand-icon" onClick={(e) => { e.stopPropagation(); onToggle(event); }}>
                        {event.expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </span>
                ) : (
                    <span className="expand-icon placeholder" />
                )}
                {getTypeIcon()}
                <span className="event-name">{event.name}</span>
                {event.drawCalls !== undefined && (
                    <span className="event-draws">{event.drawCalls}</span>
                )}
            </div>
            {hasChildren && event.expanded && event.children!.map(child => (
                <EventItem
                    key={child.id}
                    event={child}
                    depth={depth + 1}
                    selected={selected && child.id === event.id}
                    onSelect={onSelect}
                    onToggle={onToggle}
                />
            ))}
        </>
    );
};

/**
 * 纹理预览组件
 * Texture Preview Component
 */
const TexturePreview: React.FC<{
    textureUrl?: string;
    texturePath?: string;
    label?: string;
}> = ({ textureUrl, texturePath, label = 'Texture' }) => {
    return (
        <div className="texture-preview-row">
            <span className="detail-label">{label}</span>
            <div className="texture-preview-content">
                {textureUrl ? (
                    <div className="texture-thumbnail-container">
                        <img src={textureUrl} alt="Texture" className="texture-thumbnail" />
                        <span className="texture-path">{texturePath || '-'}</span>
                    </div>
                ) : (
                    <span className="detail-value">{texturePath || '-'}</span>
                )}
            </div>
        </div>
    );
};

interface EventDetailsProps {
    event: RenderEvent;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event }) => {
    const data = event.data;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 绘制 TextureSheet 网格 | Draw TextureSheet grid
    useEffect(() => {
        if (event.type !== 'particle' || !data?.textureSheetAnimation) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const tsAnim = data.textureSheetAnimation;
        const tilesX = tsAnim.tilesX;
        const tilesY = tsAnim.tilesY;
        const totalFrames = tsAnim.totalFrames;

        const size = Math.min(rect.width, rect.height);
        const offsetX = (rect.width - size) / 2;
        const offsetY = (rect.height - size) / 2;
        const cellWidth = size / tilesX;
        const cellHeight = size / tilesY;

        // 背景 | Background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, rect.width, rect.height);

        // 绘制网格 | Draw grid
        ctx.strokeStyle = '#3a3a3a';
        ctx.lineWidth = 1;
        for (let i = 0; i <= tilesX; i++) {
            ctx.beginPath();
            ctx.moveTo(offsetX + i * cellWidth, offsetY);
            ctx.lineTo(offsetX + i * cellWidth, offsetY + size);
            ctx.stroke();
        }
        for (let j = 0; j <= tilesY; j++) {
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + j * cellHeight);
            ctx.lineTo(offsetX + size, offsetY + j * cellHeight);
            ctx.stroke();
        }

        // 绘制帧编号 | Draw frame numbers
        ctx.fillStyle = '#555';
        ctx.font = `${Math.max(8, Math.min(12, cellWidth / 3))}px Consolas`;
        ctx.textAlign = 'center';
        for (let frame = 0; frame < totalFrames; frame++) {
            const col = frame % tilesX;
            const row = Math.floor(frame / tilesX);
            ctx.fillText(frame.toString(), offsetX + col * cellWidth + cellWidth / 2, offsetY + row * cellHeight + cellHeight / 2 + 4);
        }

        // 高亮活跃帧 | Highlight active frames
        const sampleParticles = data.sampleParticles ?? [];
        const frameColors = ['#4a9eff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'] as const;
        const usedFrames = new Map<number, string>();
        sampleParticles.forEach((p: any, idx: number) => {
            if (!usedFrames.has(p.frame)) {
                usedFrames.set(p.frame, frameColors[idx % frameColors.length] ?? '#4a9eff');
            }
        });

        usedFrames.forEach((color, frame) => {
            const col = frame % tilesX;
            const row = Math.floor(frame / tilesX);
            const x = offsetX + col * cellWidth;
            const y = offsetY + row * cellHeight;

            ctx.fillStyle = `${color}40`;
            ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
        });
    }, [event, data]);

    return (
        <div className="details-grid">
            <DetailRow label="Event" value={event.name} />
            <DetailRow label="Type" value={event.type} />
            <DetailRow label="Draw Calls" value={event.drawCalls?.toString() ?? '-'} />
            <DetailRow label="Vertices" value={event.vertices?.toString() ?? '-'} />

            {data && (
                <>
                    <div className="details-section">Properties</div>

                    {/* Sprite 数据 | Sprite data */}
                    {event.type === 'sprite' && data.entityName && (
                        <>
                            <DetailRow label="Entity" value={data.entityName} />
                            <DetailRow label="Position" value={`(${data.x?.toFixed(1)}, ${data.y?.toFixed(1)})`} />
                            <DetailRow label="Size" value={`${data.width?.toFixed(0)} x ${data.height?.toFixed(0)}`} />
                            <DetailRow label="Rotation" value={`${(data.rotation ?? 0).toFixed(1)}°`} />
                            <DetailRow label="UV" value={data.uv ? `[${data.uv.map((v: number) => v.toFixed(3)).join(', ')}]` : '-'} highlight />
                            <TexturePreview textureUrl={data.textureUrl} texturePath={data.texturePath} />
                            <DetailRow label="Sort Layer" value={data.sortingLayer || 'Default'} />
                            <DetailRow label="Order" value={data.orderInLayer?.toString() ?? '0'} />
                            <DetailRow label="Alpha" value={data.alpha?.toFixed(2) ?? '1.00'} />
                        </>
                    )}

                    {/* 粒子系统数据 | Particle system data */}
                    {event.type === 'particle' && data.activeCount !== undefined && (
                        <>
                            {data.entityName && <DetailRow label="Entity" value={data.entityName} />}
                            <DetailRow label="Active" value={`${data.activeCount} / ${data.maxParticles}`} />
                            <DetailRow label="Playing" value={data.isPlaying ? 'Yes' : 'No'} />
                            <TexturePreview textureUrl={data.textureUrl} texturePath={data.texturePath} />
                            {data.textureSheetAnimation && (
                                <>
                                    <div className="details-section">Texture Sheet</div>
                                    <DetailRow label="Tiles" value={`${data.textureSheetAnimation.tilesX} x ${data.textureSheetAnimation.tilesY}`} />
                                    <DetailRow label="Frames" value={data.textureSheetAnimation.totalFrames?.toString() ?? '-'} />
                                    {data.sampleParticles?.length > 0 && (
                                        <DetailRow
                                            label="Active Frames"
                                            value={Array.from(new Set<number>(data.sampleParticles.map((p: any) => p.frame))).sort((a, b) => a - b).join(', ')}
                                            highlight
                                        />
                                    )}
                                    {/* TextureSheet 网格预览 | TextureSheet grid preview */}
                                    <div className="texture-sheet-preview">
                                        <canvas ref={canvasRef} style={{ width: '100%', height: '120px' }} />
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {/* 单个粒子数据 | Single particle data */}
                    {event.type === 'particle' && data.frame !== undefined && data.activeCount === undefined && (
                        <>
                            {data.systemName && <DetailRow label="System" value={data.systemName} />}
                            <DetailRow label="Frame" value={data.frame.toString()} highlight />
                            <DetailRow label="UV" value={data.uv ? `[${data.uv.map((v: number) => v.toFixed(3)).join(', ')}]` : '-'} />
                            <DetailRow label="Position" value={`(${data.x?.toFixed(1)}, ${data.y?.toFixed(1)})`} />
                            <DetailRow label="Size" value={data.size?.toFixed(1) ?? '-'} />
                            <DetailRow label="Age/Life" value={`${data.age?.toFixed(2)}s / ${data.lifetime?.toFixed(2)}s`} />
                            <DetailRow label="Alpha" value={data.alpha?.toFixed(2) ?? '1.00'} />
                        </>
                    )}

                    {/* UI 元素数据 | UI element data */}
                    {event.type === 'ui' && data.entityName && (
                        <>
                            <DetailRow label="Entity" value={data.entityName} />
                            <DetailRow label="Type" value={data.type} highlight />
                            <DetailRow label="Position" value={`(${data.x?.toFixed(0)}, ${data.y?.toFixed(0)})`} />
                            <DetailRow label="World Pos" value={`(${data.worldX?.toFixed(0)}, ${data.worldY?.toFixed(0)})`} />
                            <DetailRow label="Size" value={`${data.width?.toFixed(0)} x ${data.height?.toFixed(0)}`} />
                            <DetailRow label="Rotation" value={`${((data.rotation ?? 0) * 180 / Math.PI).toFixed(1)}°`} />
                            <DetailRow label="Visible" value={data.visible ? 'Yes' : 'No'} />
                            <DetailRow label="Alpha" value={data.alpha?.toFixed(2) ?? '1.00'} />
                            <DetailRow label="Sort Layer" value={data.sortingLayer || 'UI'} />
                            <DetailRow label="Order" value={data.orderInLayer?.toString() ?? '0'} />
                            {data.backgroundColor && (
                                <DetailRow label="Background" value={data.backgroundColor} />
                            )}
                            {data.textureGuid && (
                                <TexturePreview textureUrl={data.textureUrl} texturePath={data.textureGuid} />
                            )}
                            {data.text && (
                                <>
                                    <div className="details-section">Text</div>
                                    <DetailRow label="Content" value={data.text.length > 30 ? data.text.slice(0, 30) + '...' : data.text} />
                                    {data.fontSize && <DetailRow label="Font Size" value={data.fontSize.toString()} />}
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

const DetailRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
    <div className={`detail-row ${highlight ? 'highlight' : ''}`}>
        <span className="detail-label">{label}</span>
        <span className="detail-value">{value}</span>
    </div>
);

export default RenderDebugPanel;
