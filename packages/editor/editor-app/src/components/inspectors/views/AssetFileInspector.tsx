import { useState, useEffect, useCallback, useRef } from 'react';
import { Folder, File as FileIcon, Image as ImageIcon, Clock, HardDrive, Settings2, Grid3X3 } from 'lucide-react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { Core } from '@esengine/ecs-framework';
import { AssetRegistryService, MessageHub } from '@esengine/editor-core';
import type { ISpriteSettings } from '@esengine/asset-system-editor';
import { EngineService } from '../../../services/EngineService';
import { AssetFileInfo } from '../types';
import { ImagePreview, CodePreview, getLanguageFromExtension } from '../common';
import '../../../styles/EntityInspector.css';

interface AssetFileInspectorProps {
    fileInfo: AssetFileInfo;
    content?: string;
    isImage?: boolean;
}

/**
 * Built-in loader types (always available)
 * 内置加载器类型（始终可用）
 */
const BUILTIN_LOADER_TYPES = [
    'texture',
    'audio',
    'json',
    'text',
    'binary'
];

function formatFileSize(bytes?: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function formatDate(timestamp?: number): string {
    if (!timestamp) return '未知';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Sprite Settings Editor Component
 * 精灵设置编辑器组件
 *
 * Allows editing nine-patch slice borders for texture assets.
 * 允许编辑纹理资源的九宫格切片边框。
 */
interface SpriteSettingsEditorProps {
    filePath: string;
    imageSrc: string;
    initialSettings?: ISpriteSettings;
    onSettingsChange: (settings: ISpriteSettings) => void;
}

function SpriteSettingsEditor({ filePath, imageSrc, initialSettings, onSettingsChange }: SpriteSettingsEditorProps) {
    const [sliceBorder, setSliceBorder] = useState<[number, number, number, number]>(
        initialSettings?.sliceBorder || [0, 0, 0, 0]
    );
    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Sync sliceBorder state when initialSettings changes (async load)
    // 当 initialSettings 变化时同步 sliceBorder 状态（异步加载）
    useEffect(() => {
        if (initialSettings?.sliceBorder) {
            setSliceBorder(initialSettings.sliceBorder);
        }
    }, [initialSettings?.sliceBorder]);

    // Load image to get dimensions
    // 加载图像以获取尺寸
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setImageSize({ width: img.width, height: img.height });
        };
        img.src = imageSrc;
    }, [imageSrc]);

    // Draw slice preview
    // 绘制切片预览
    useEffect(() => {
        if (!canvasRef.current || !imageSize) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            // Calculate scale to fit canvas
            // 计算缩放以适应画布
            const maxSize = 200;
            const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
            const displayWidth = img.width * scale;
            const displayHeight = img.height * scale;

            canvas.width = displayWidth;
            canvas.height = displayHeight;

            // Draw image
            // 绘制图像
            ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

            // Draw slice lines
            // 绘制切片线
            const [top, right, bottom, left] = sliceBorder;

            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);

            // Top line
            if (top > 0) {
                ctx.beginPath();
                ctx.moveTo(0, top * scale);
                ctx.lineTo(displayWidth, top * scale);
                ctx.stroke();
            }

            // Bottom line
            if (bottom > 0) {
                ctx.beginPath();
                ctx.moveTo(0, displayHeight - bottom * scale);
                ctx.lineTo(displayWidth, displayHeight - bottom * scale);
                ctx.stroke();
            }

            // Left line
            if (left > 0) {
                ctx.beginPath();
                ctx.moveTo(left * scale, 0);
                ctx.lineTo(left * scale, displayHeight);
                ctx.stroke();
            }

            // Right line
            if (right > 0) {
                ctx.beginPath();
                ctx.moveTo(displayWidth - right * scale, 0);
                ctx.lineTo(displayWidth - right * scale, displayHeight);
                ctx.stroke();
            }
        };
        img.src = imageSrc;
    }, [imageSrc, imageSize, sliceBorder]);

    const handleSliceChange = (index: number, value: number) => {
        const newSlice = [...sliceBorder] as [number, number, number, number];
        newSlice[index] = Math.max(0, value);
        setSliceBorder(newSlice);
        onSettingsChange({ ...initialSettings, sliceBorder: newSlice });
    };

    const labels = ['Top', 'Right', 'Bottom', 'Left'];
    const labelsCN = ['上', '右', '下', '左'];

    return (
        <div className="sprite-settings-editor">
            {/* Slice Preview Canvas */}
            <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                <canvas
                    ref={canvasRef}
                    style={{
                        border: '1px solid #444',
                        borderRadius: '4px',
                        maxWidth: '100%'
                    }}
                />
                {imageSize && (
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                        {imageSize.width} × {imageSize.height} px
                    </div>
                )}
            </div>

            {/* Slice Border Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {sliceBorder.map((value, index) => (
                    <div key={index} className="property-field" style={{ marginBottom: '0' }}>
                        <label className="property-label" style={{ minWidth: '50px' }}>
                            {labelsCN[index]} ({labels[index]})
                        </label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => handleSliceChange(index, parseInt(e.target.value) || 0)}
                            min={0}
                            max={imageSize ? (index % 2 === 0 ? imageSize.height : imageSize.width) : 9999}
                            className="property-input property-input-number"
                            style={{ width: '60px' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AssetFileInspector({ fileInfo, content, isImage }: AssetFileInspectorProps) {
    const IconComponent = fileInfo.isDirectory ? Folder : isImage ? ImageIcon : FileIcon;
    const iconColor = fileInfo.isDirectory ? '#dcb67a' : isImage ? '#a78bfa' : '#90caf9';

    // State for loader type selector
    const [currentLoaderType, setCurrentLoaderType] = useState<string | null>(null);
    const [availableLoaderTypes, setAvailableLoaderTypes] = useState<string[]>([]);
    const [detectedType, setDetectedType] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // State for sprite settings (nine-patch borders)
    // 精灵设置状态（九宫格边框）
    const [spriteSettings, setSpriteSettings] = useState<ISpriteSettings | undefined>(undefined);

    // Load meta info and available loader types
    useEffect(() => {
        if (fileInfo.isDirectory) return;

        const loadMetaInfo = async () => {
            try {
                const assetRegistry = Core.services.tryResolve(AssetRegistryService) as AssetRegistryService | null;
                if (!assetRegistry?.isReady) return;

                const metaManager = assetRegistry.metaManager;
                const meta = await metaManager.getOrCreateMeta(fileInfo.path);

                // Get current loader type from meta
                setCurrentLoaderType(meta.loaderType || null);
                setDetectedType(meta.type);

                // Get sprite settings from meta (for texture assets)
                // 从 meta 获取精灵设置（用于纹理资源）
                if (meta.importSettings?.spriteSettings) {
                    setSpriteSettings(meta.importSettings.spriteSettings as ISpriteSettings);
                } else {
                    setSpriteSettings(undefined);
                }

                // Get available loader types from assetManager
                const assetManager = EngineService.getInstance().getAssetManager();
                const loaderFactory = assetManager?.getLoaderFactory();
                const registeredTypes = loaderFactory?.getRegisteredTypes() || [];

                // Combine built-in types with registered types (deduplicated)
                const allTypes = new Set([...BUILTIN_LOADER_TYPES, ...registeredTypes]);
                setAvailableLoaderTypes(Array.from(allTypes).sort());
            } catch (error) {
                console.warn('Failed to load meta info:', error);
            }
        };

        loadMetaInfo();
    }, [fileInfo.path, fileInfo.isDirectory]);

    // Handle loader type change
    const handleLoaderTypeChange = useCallback(async (newType: string) => {
        if (fileInfo.isDirectory || isUpdating) return;

        setIsUpdating(true);
        try {
            const assetRegistry = Core.services.tryResolve(AssetRegistryService) as AssetRegistryService | null;
            if (!assetRegistry?.isReady) return;

            const metaManager = assetRegistry.metaManager;

            // Update meta with new loader type
            // Empty string means use auto-detection (remove override)
            const loaderType = newType === '' ? undefined : newType;
            await metaManager.updateMeta(fileInfo.path, { loaderType });

            setCurrentLoaderType(loaderType || null);
            console.log(`[AssetFileInspector] Updated loader type for ${fileInfo.name}: ${loaderType || '(auto)'}`);
        } catch (error) {
            console.error('Failed to update loader type:', error);
        } finally {
            setIsUpdating(false);
        }
    }, [fileInfo.path, fileInfo.name, fileInfo.isDirectory, isUpdating]);

    // Handle sprite settings change
    // 处理精灵设置更改
    const handleSpriteSettingsChange = useCallback(async (newSettings: ISpriteSettings) => {
        if (fileInfo.isDirectory || isUpdating) return;

        setIsUpdating(true);
        try {
            const assetRegistry = Core.services.tryResolve(AssetRegistryService) as AssetRegistryService | null;
            if (!assetRegistry?.isReady) return;

            const metaManager = assetRegistry.metaManager;
            const meta = await metaManager.getOrCreateMeta(fileInfo.path);

            // Update meta with new sprite settings
            // 使用新的精灵设置更新 meta
            const updatedImportSettings = {
                ...meta.importSettings,
                spriteSettings: newSettings
            };

            await metaManager.updateMeta(fileInfo.path, {
                importSettings: updatedImportSettings
            });

            setSpriteSettings(newSettings);
            console.log(`[AssetFileInspector] Updated sprite settings for ${fileInfo.name}:`, newSettings);

            // 通知 EngineService 同步资产数据库（以便渲染系统获取最新的九宫格设置）
            // Notify EngineService to sync asset database (so render systems get latest sprite settings)
            const messageHub = Core.services.tryResolve(MessageHub);
            if (messageHub) {
                messageHub.publish('assets:changed', {
                    type: 'modify',
                    path: fileInfo.path,
                    relativePath: assetRegistry.absoluteToRelative(fileInfo.path) || fileInfo.path,
                    guid: meta.guid
                });
            }
        } catch (error) {
            console.error('Failed to update sprite settings:', error);
        } finally {
            setIsUpdating(false);
        }
    }, [fileInfo.path, fileInfo.name, fileInfo.isDirectory, isUpdating]);

    return (
        <div className="entity-inspector">
            <div className="inspector-header">
                <IconComponent size={16} style={{ color: iconColor }} />
                <span className="entity-name">{fileInfo.name}</span>
            </div>

            <div className="inspector-content">
                <div className="inspector-section">
                    <div className="section-title">文件信息</div>
                    <div className="property-field">
                        <label className="property-label">类型</label>
                        <span className="property-value-text">
                            {fileInfo.isDirectory
                                ? '文件夹'
                                : fileInfo.extension
                                    ? `.${fileInfo.extension}`
                                    : '文件'}
                        </span>
                    </div>
                    {fileInfo.size !== undefined && !fileInfo.isDirectory && (
                        <div className="property-field">
                            <label className="property-label">
                                <HardDrive size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                大小
                            </label>
                            <span className="property-value-text">{formatFileSize(fileInfo.size)}</span>
                        </div>
                    )}
                    {fileInfo.modified !== undefined && (
                        <div className="property-field">
                            <label className="property-label">
                                <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                修改时间
                            </label>
                            <span className="property-value-text">{formatDate(fileInfo.modified)}</span>
                        </div>
                    )}
                    <div className="property-field">
                        <label className="property-label">路径</label>
                        <span
                            className="property-value-text"
                            style={{
                                fontFamily: 'Consolas, Monaco, monospace',
                                fontSize: '11px',
                                color: '#666',
                                wordBreak: 'break-all'
                            }}
                        >
                            {fileInfo.path}
                        </span>
                    </div>
                </div>

                {/* Loader Type Section - only for files, not directories */}
                {!fileInfo.isDirectory && availableLoaderTypes.length > 0 && (
                    <div className="inspector-section">
                        <div className="section-title">
                            <Settings2 size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                            加载设置
                        </div>
                        <div className="property-field">
                            <label className="property-label">加载器类型</label>
                            <select
                                className="property-select"
                                value={currentLoaderType || ''}
                                onChange={(e) => handleLoaderTypeChange(e.target.value)}
                                disabled={isUpdating}
                                style={{
                                    flex: 1,
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    borderRadius: '4px',
                                    border: '1px solid #444',
                                    backgroundColor: '#2a2a2a',
                                    color: '#e0e0e0',
                                    cursor: isUpdating ? 'wait' : 'pointer'
                                }}
                            >
                                <option value="">
                                    自动检测 {detectedType ? `(${detectedType})` : ''}
                                </option>
                                {availableLoaderTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {currentLoaderType && (
                            <div
                                style={{
                                    marginTop: '4px',
                                    fontSize: '11px',
                                    color: '#888',
                                    fontStyle: 'italic'
                                }}
                            >
                                已覆盖自动检测，使用 "{currentLoaderType}" 加载器
                            </div>
                        )}
                    </div>
                )}

                {isImage && (
                    <div className="inspector-section">
                        <div className="section-title">图片预览</div>
                        <ImagePreview src={convertFileSrc(fileInfo.path)} alt={fileInfo.name} />
                    </div>
                )}

                {/* Sprite Settings Section - only for image files */}
                {/* 精灵设置部分 - 仅用于图像文件 */}
                {isImage && (
                    <div className="inspector-section">
                        <div className="section-title">
                            <Grid3X3 size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                            九宫格设置 (Nine-Patch)
                        </div>
                        <SpriteSettingsEditor
                            filePath={fileInfo.path}
                            imageSrc={convertFileSrc(fileInfo.path)}
                            initialSettings={spriteSettings}
                            onSettingsChange={handleSpriteSettingsChange}
                        />
                    </div>
                )}

                {content && (
                    <div className="inspector-section code-preview-section">
                        <div className="section-title">文件预览</div>
                        <CodePreview
                            content={content}
                            language={getLanguageFromExtension(fileInfo.extension)}
                            height="100%"
                        />
                    </div>
                )}

                {!content && !isImage && !fileInfo.isDirectory && (
                    <div className="inspector-section">
                        <div
                            style={{
                                padding: '20px',
                                textAlign: 'center',
                                color: '#666',
                                fontSize: '13px'
                            }}
                        >
                            此文件类型不支持预览
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
