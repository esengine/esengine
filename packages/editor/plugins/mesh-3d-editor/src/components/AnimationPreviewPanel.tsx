/**
 * Animation Preview Panel
 * 动画预览面板
 *
 * Displays 3D model preview with animation playback controls.
 * 显示 3D 模型预览和动画播放控制。
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Core } from '@esengine/ecs-framework';
import { MessageHub } from '@esengine/editor-core';
import type { IAssetContent, IAssetParseContext, IGLTFAsset, IGLTFAnimationClip } from '@esengine/asset-system';
import { FBXLoader, GLTFLoader } from '@esengine/asset-system';
import {
    Play, Pause, Square, SkipBack, SkipForward,
    RefreshCw, Clock, Layers, Activity, ChevronDown, RotateCcw
} from 'lucide-react';
import { ModelPreview3D } from './ModelPreview3D';
import '../styles/AnimationPreviewPanel.css';

/**
 * 格式化时间为 MM:SS.ms 格式
 * Format time to MM:SS.ms format
 */
function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

/**
 * 读取二进制文件（Tauri 环境）
 * Read binary file (Tauri environment)
 */
async function readFileBinary(path: string): Promise<ArrayBuffer | null> {
    try {
        const { invoke } = await import('@tauri-apps/api/core');
        const base64: string = await invoke<string>('read_file_as_base64', { filePath: path });
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    } catch (error) {
        console.error('[AnimationPreview] Failed to read file:', error);
        return null;
    }
}

interface AnimationPreviewState {
    asset: IGLTFAsset | null;
    assetPath: string | null;
    selectedAnimationIndex: number;
    isPlaying: boolean;
    currentTime: number;
    speed: number;
    loop: boolean;
    isLoading: boolean;
}

const initialState: AnimationPreviewState = {
    asset: null,
    assetPath: null,
    selectedAnimationIndex: 0,
    isPlaying: false,
    currentTime: 0,
    speed: 1.0,
    loop: true,
    isLoading: false,
};

export function AnimationPreviewPanel() {
    const [state, setState] = useState<AnimationPreviewState>(initialState);

    const animationFrameRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    const {
        asset,
        assetPath,
        selectedAnimationIndex,
        isPlaying,
        currentTime,
        speed,
        loop,
        isLoading,
    } = state;

    const currentClip = asset?.animations?.[selectedAnimationIndex] ?? null;

    // Animation loop | 动画循环
    useEffect(() => {
        if (!isPlaying || !asset) return;

        const clip = asset.animations?.[selectedAnimationIndex];
        if (!clip || clip.duration <= 0) return;

        const animate = (time: number) => {
            if (lastTimeRef.current === 0) {
                lastTimeRef.current = time;
            }

            const deltaTime = (time - lastTimeRef.current) / 1000;
            lastTimeRef.current = time;

            setState(prev => {
                if (!prev.isPlaying) return prev;

                const clip = prev.asset?.animations?.[prev.selectedAnimationIndex];
                if (!clip || clip.duration <= 0) return prev;

                let newTime = prev.currentTime + deltaTime * prev.speed;

                if (newTime >= clip.duration) {
                    if (prev.loop) {
                        newTime = newTime % clip.duration;
                    } else {
                        return { ...prev, currentTime: clip.duration, isPlaying: false };
                    }
                }

                return { ...prev, currentTime: newTime };
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        lastTimeRef.current = 0;
        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, asset, selectedAnimationIndex, speed, loop]);

    // Load asset | 加载资产
    const loadAsset = useCallback(async (filePath: string) => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            const fileName = filePath.split(/[\\/]/).pop() || 'Model';
            const ext = fileName.split('.').pop()?.toLowerCase() || '';

            const binaryData = await readFileBinary(filePath);
            if (!binaryData || binaryData.byteLength === 0) {
                console.warn('[AnimationPreview] Cannot read file:', filePath);
                setState(prev => ({ ...prev, isLoading: false }));
                return;
            }

            const parseContext = {
                metadata: {
                    path: filePath,
                    name: fileName,
                    type: ext === 'fbx' ? 'model/fbx' : 'model/gltf',
                    guid: '',
                    size: binaryData.byteLength,
                    hash: '',
                    dependencies: [],
                    lastModified: Date.now(),
                    importerVersion: '1.0.0',
                    labels: [],
                    tags: [],
                    version: 1
                },
                loadDependency: async () => null
            } as unknown as IAssetParseContext;

            const content: IAssetContent = {
                type: 'binary',
                binary: binaryData
            };

            let parsedAsset: IGLTFAsset;
            if (ext === 'fbx') {
                const loader = new FBXLoader();
                parsedAsset = await loader.parse(content, parseContext);
            } else if (ext === 'gltf' || ext === 'glb') {
                const loader = new GLTFLoader();
                parsedAsset = await loader.parse(content, parseContext);
            } else {
                console.warn('[AnimationPreview] Unsupported format:', ext);
                setState(prev => ({ ...prev, isLoading: false }));
                return;
            }

            console.log(`[AnimationPreview] Loaded: ${parsedAsset.meshes?.length ?? 0} meshes, ${parsedAsset.animations?.length ?? 0} animations`);
            setState({
                asset: parsedAsset,
                assetPath: filePath,
                selectedAnimationIndex: 0,
                currentTime: 0,
                isPlaying: false,
                speed: 1.0,
                loop: true,
                isLoading: false,
            });
        } catch (error) {
            console.error('[AnimationPreview] Failed to load asset:', error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    // Listen for animation preview requests | 监听动画预览请求
    useEffect(() => {
        const messageHub = Core.services.tryResolve(MessageHub);
        if (!messageHub) return;

        const unsubscribe = messageHub.subscribe('animation:preview', (data: { filePath: string; animationIndex?: number }) => {
            loadAsset(data.filePath);
            if (data.animationIndex !== undefined) {
                setState(prev => ({
                    ...prev,
                    selectedAnimationIndex: data.animationIndex!,
                    currentTime: 0,
                    isPlaying: false,
                }));
            }
        });

        return () => unsubscribe?.();
    }, [loadAsset]);

    // Action handlers | 操作处理器
    const selectAnimation = useCallback((index: number) => {
        setState(prev => ({
            ...prev,
            selectedAnimationIndex: index,
            currentTime: 0,
            isPlaying: false,
        }));
    }, []);

    const play = useCallback(() => {
        setState(prev => ({ ...prev, isPlaying: true }));
    }, []);

    const pause = useCallback(() => {
        setState(prev => ({ ...prev, isPlaying: false }));
    }, []);

    const stop = useCallback(() => {
        setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    }, []);

    const setTime = useCallback((time: number) => {
        setState(prev => {
            const clip = prev.asset?.animations?.[prev.selectedAnimationIndex];
            if (clip) {
                return { ...prev, currentTime: Math.max(0, Math.min(time, clip.duration)) };
            }
            return prev;
        });
    }, []);

    const setSpeed = useCallback((newSpeed: number) => {
        setState(prev => ({ ...prev, speed: Math.max(0.1, Math.min(newSpeed, 5)) }));
    }, []);

    const setLoop = useCallback((newLoop: boolean) => {
        setState(prev => ({ ...prev, loop: newLoop }));
    }, []);

    const handleTimelineChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setTime(value);
    }, [setTime]);

    const handleSpeedChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSpeed(parseFloat(e.target.value));
    }, [setSpeed]);

    // Render loading state | 渲染加载状态
    if (isLoading) {
        return (
            <div className="animation-preview-panel loading">
                <RefreshCw className="spin" size={24} />
                <span>Loading...</span>
            </div>
        );
    }

    // Render empty state | 渲染空状态
    if (!asset) {
        return (
            <div className="animation-preview-panel empty">
                <Activity size={48} strokeWidth={1} />
                <p>No model loaded</p>
                <p className="hint">Double-click a model or animation in Content Browser</p>
            </div>
        );
    }

    const animations = asset.animations ?? [];
    const hasAnimations = animations.length > 0;
    const hasMeshes = (asset.meshes?.length ?? 0) > 0;
    const duration = currentClip?.duration ?? 0;
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="animation-preview-panel">
            {/* Header | 头部 */}
            <div className="panel-header">
                <span className="asset-name" title={assetPath ?? ''}>
                    {assetPath?.split(/[\\/]/).pop() ?? 'Unknown'}
                </span>
                <button
                    className="icon-button"
                    onClick={() => setState(initialState)}
                    title="Clear"
                >
                    <RotateCcw size={14} />
                </button>
            </div>

            {/* 3D Preview | 3D 预览 */}
            {hasMeshes && (
                <div className="preview-viewport">
                    <ModelPreview3D
                        asset={asset}
                        animationClip={currentClip}
                        currentTime={currentTime}
                        width={280}
                        height={180}
                    />
                </div>
            )}

            {/* No mesh message | 无网格消息 */}
            {!hasMeshes && (
                <div className="no-mesh-message">
                    <p>No mesh data in this file</p>
                </div>
            )}

            {/* Animation selector | 动画选择器 */}
            {hasAnimations && (
                <div className="animation-selector">
                    <label>Animation:</label>
                    <div className="select-wrapper">
                        <select
                            value={selectedAnimationIndex}
                            onChange={(e) => selectAnimation(parseInt(e.target.value))}
                        >
                            {animations.map((anim: IGLTFAnimationClip, index: number) => (
                                <option key={index} value={index}>
                                    {anim.name || `Animation ${index}`}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} />
                    </div>
                </div>
            )}

            {/* Animation info | 动画信息 */}
            {currentClip && (
                <div className="animation-info">
                    <div className="info-row">
                        <Clock size={14} />
                        <span>Duration: {formatTime(currentClip.duration)}</span>
                    </div>
                    <div className="info-row">
                        <Layers size={14} />
                        <span>Channels: {currentClip.channels?.length ?? 0}</span>
                    </div>
                </div>
            )}

            {/* Timeline | 时间轴 */}
            {hasAnimations && (
                <div className="timeline-section">
                    <div className="time-display">
                        <span className="current-time">{formatTime(currentTime)}</span>
                        <span className="separator">/</span>
                        <span className="total-time">{formatTime(duration)}</span>
                    </div>
                    <div className="timeline-track">
                        <input
                            type="range"
                            min={0}
                            max={duration}
                            step={0.01}
                            value={currentTime}
                            onChange={handleTimelineChange}
                            className="timeline-slider"
                        />
                        <div
                            className="timeline-progress"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Playback controls | 播放控制 */}
            {hasAnimations && (
                <div className="playback-controls">
                    <button
                        className="control-button"
                        onClick={() => setTime(0)}
                        title="Go to start"
                    >
                        <SkipBack size={16} />
                    </button>

                    {isPlaying ? (
                        <button
                            className="control-button primary"
                            onClick={pause}
                            title="Pause"
                        >
                            <Pause size={20} />
                        </button>
                    ) : (
                        <button
                            className="control-button primary"
                            onClick={play}
                            title="Play"
                        >
                            <Play size={20} />
                        </button>
                    )}

                    <button
                        className="control-button"
                        onClick={stop}
                        title="Stop"
                    >
                        <Square size={16} />
                    </button>

                    <button
                        className="control-button"
                        onClick={() => setTime(duration)}
                        title="Go to end"
                    >
                        <SkipForward size={16} />
                    </button>
                </div>
            )}

            {/* Options | 选项 */}
            {hasAnimations && (
                <div className="playback-options">
                    <div className="option-row">
                        <label>Speed:</label>
                        <select value={speed} onChange={handleSpeedChange}>
                            <option value={0.25}>0.25x</option>
                            <option value={0.5}>0.5x</option>
                            <option value={1}>1x</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2}>2x</option>
                        </select>
                    </div>
                    <div className="option-row">
                        <label>
                            <input
                                type="checkbox"
                                checked={loop}
                                onChange={(e) => setLoop(e.target.checked)}
                            />
                            Loop
                        </label>
                    </div>
                </div>
            )}

            {/* No animations message | 无动画消息 */}
            {hasMeshes && !hasAnimations && (
                <div className="no-animations">
                    <p>This model has no animations</p>
                </div>
            )}

            {/* Model info | 模型信息 */}
            <div className="model-info">
                <div className="section-title">Model Info</div>
                <div className="info-row">
                    <span>Meshes: {asset.meshes?.length ?? 0}</span>
                </div>
                <div className="info-row">
                    <span>Materials: {asset.materials?.length ?? 0}</span>
                </div>
                {asset.skeleton && (
                    <div className="info-row">
                        <span>Joints: {asset.skeleton.joints?.length ?? 0}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AnimationPreviewPanel;
