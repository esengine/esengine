/**
 * AssetInput - 资产引用选择控件
 * AssetInput - Asset reference picker control
 *
 * 功能 | Features:
 * - 缩略图预览 | Thumbnail preview
 * - 下拉选择 | Dropdown selection
 * - 拖放支持 | Drag and drop support
 * - 操作按钮 | Action buttons (browse, copy, locate, clear)
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { ChevronDown, FolderOpen, Copy, Navigation, X, FileImage, Image, Music, Film, FileText, Box } from 'lucide-react';
import { PropertyControlProps } from '../types';

export interface AssetReference {
    /** 资产 ID | Asset ID */
    id: string;
    /** 资产路径 | Asset path */
    path?: string;
    /** 资产类型 | Asset type */
    type?: string;
    /** 缩略图 URL | Thumbnail URL */
    thumbnail?: string;
}

export interface AssetInputProps extends PropertyControlProps<AssetReference | string | null> {
    /** 允许的资产类型 | Allowed asset types */
    assetTypes?: string[];
    /** 允许的文件扩展名 | Allowed file extensions */
    extensions?: string[];
    /** 打开资产选择器回调 | Open asset picker callback */
    onPickAsset?: () => void;
    /** 打开资产回调 | Open asset callback */
    onOpenAsset?: (asset: AssetReference) => void;
    /** 定位资产回调 | Locate asset callback */
    onLocateAsset?: (asset: AssetReference) => void;
    /** 复制路径回调 | Copy path callback */
    onCopyPath?: (path: string) => void;
    /** 获取缩略图 URL | Get thumbnail URL */
    getThumbnail?: (asset: AssetReference) => string | undefined;
    /** 最近使用的资产 | Recently used assets */
    recentAssets?: AssetReference[];
    /** 显示缩略图 | Show thumbnail */
    showThumbnail?: boolean;
}

/**
 * 获取资产显示名称
 * Get asset display name
 */
const getAssetDisplayName = (value: AssetReference | string | null): string => {
    if (!value) return '';
    if (typeof value === 'string') {
        // 从路径中提取文件名 | Extract filename from path
        const parts = value.split('/');
        return parts[parts.length - 1] ?? value;
    }
    if (value.path) {
        const parts = value.path.split('/');
        return parts[parts.length - 1] ?? value.id;
    }
    return value.id;
};

/**
 * 获取资产路径
 * Get asset path
 */
const getAssetPath = (value: AssetReference | string | null): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.path || value.id;
};

/**
 * 根据扩展名获取图标
 * Get icon by extension
 */
const getAssetIcon = (value: AssetReference | string | null) => {
    const path = getAssetPath(value).toLowerCase();
    if (path.match(/\.(png|jpg|jpeg|gif|webp|svg|bmp|ico)$/)) return Image;
    if (path.match(/\.(mp3|wav|ogg|flac|aac)$/)) return Music;
    if (path.match(/\.(mp4|webm|avi|mov|mkv)$/)) return Film;
    if (path.match(/\.(txt|json|xml|yaml|yml|md)$/)) return FileText;
    if (path.match(/\.(fbx|obj|gltf|glb|dae)$/)) return Box;
    return FileImage;
};

export const AssetInput: React.FC<AssetInputProps> = ({
    value,
    onChange,
    readonly = false,
    extensions,
    onPickAsset,
    onOpenAsset,
    onLocateAsset,
    onCopyPath,
    getThumbnail,
    recentAssets = [],
    showThumbnail = true
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const displayName = getAssetDisplayName(value);
    const assetPath = getAssetPath(value);
    const hasValue = !!value;
    const IconComponent = getAssetIcon(value);

    // 获取缩略图 | Get thumbnail
    const thumbnailUrl = value && getThumbnail
        ? getThumbnail(typeof value === 'string' ? { id: value, path: value } : value)
        : undefined;

    // 关闭下拉菜单 | Close dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    // 清除值 | Clear value
    const handleClear = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!readonly) {
            onChange(null);
        }
    }, [onChange, readonly]);

    // 打开选择器 | Open picker
    const handleBrowse = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!readonly && onPickAsset) {
            onPickAsset();
        }
        setShowDropdown(false);
    }, [readonly, onPickAsset]);

    // 定位资产 | Locate asset
    const handleLocate = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (value && onLocateAsset) {
            const asset: AssetReference = typeof value === 'string'
                ? { id: value, path: value }
                : value;
            onLocateAsset(asset);
        }
    }, [value, onLocateAsset]);

    // 复制路径 | Copy path
    const handleCopy = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (assetPath) {
            if (onCopyPath) {
                onCopyPath(assetPath);
            } else {
                navigator.clipboard.writeText(assetPath);
            }
        }
    }, [assetPath, onCopyPath]);

    // 双击打开资产 | Double click to open asset
    const handleDoubleClick = useCallback(() => {
        if (value && onOpenAsset) {
            const asset: AssetReference = typeof value === 'string'
                ? { id: value, path: value }
                : value;
            onOpenAsset(asset);
        }
    }, [value, onOpenAsset]);

    // 切换下拉菜单 | Toggle dropdown
    const handleToggleDropdown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!readonly) {
            setShowDropdown(!showDropdown);
        }
    }, [readonly, showDropdown]);

    // 选择资产 | Select asset
    const handleSelectAsset = useCallback((asset: AssetReference) => {
        onChange(asset);
        setShowDropdown(false);
    }, [onChange]);

    // 拖放处理 | Drag and drop handling
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!readonly) {
            setIsDragOver(true);
        }
    }, [readonly]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (readonly) return;

        const assetId = e.dataTransfer.getData('asset-id');
        const assetPath = e.dataTransfer.getData('asset-path');
        const assetType = e.dataTransfer.getData('asset-type');

        if (assetId || assetPath) {
            // 检查扩展名匹配 | Check extension match
            if (extensions && assetPath) {
                const ext = assetPath.split('.').pop()?.toLowerCase();
                if (ext && !extensions.some(e => e.toLowerCase() === ext || e.toLowerCase() === `.${ext}`)) {
                    console.warn(`Extension "${ext}" not allowed. Allowed: ${extensions.join(', ')}`);
                    return;
                }
            }

            onChange({
                id: assetId || assetPath,
                path: assetPath || undefined,
                type: assetType || undefined
            });
        }
    }, [onChange, readonly, extensions]);

    return (
        <div
            ref={containerRef}
            className={`inspector-asset-input ${isDragOver ? 'drag-over' : ''} ${hasValue ? 'has-value' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* 缩略图 | Thumbnail */}
            {showThumbnail && (
                <div className="inspector-asset-thumbnail" onDoubleClick={handleDoubleClick}>
                    {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt="" />
                    ) : (
                        <IconComponent size={16} />
                    )}
                </div>
            )}

            {/* 值显示和下拉按钮 | Value display and dropdown button */}
            <div className="inspector-asset-main" onClick={handleToggleDropdown}>
                <div
                    className="inspector-asset-value"
                    onDoubleClick={handleDoubleClick}
                    title={assetPath || 'None'}
                >
                    {displayName || <span className="inspector-asset-placeholder">None</span>}
                </div>
                {!readonly && (
                    <ChevronDown size={12} className={`inspector-asset-arrow ${showDropdown ? 'open' : ''}`} />
                )}
            </div>

            {/* 操作按钮 | Action buttons */}
            <div className="inspector-asset-actions">
                {/* 定位按钮 | Locate button */}
                {hasValue && onLocateAsset && (
                    <button
                        type="button"
                        className="inspector-asset-btn"
                        onClick={handleLocate}
                        title="Locate in Content Browser"
                    >
                        <Navigation size={11} />
                    </button>
                )}

                {/* 复制按钮 | Copy button */}
                {hasValue && (
                    <button
                        type="button"
                        className="inspector-asset-btn"
                        onClick={handleCopy}
                        title="Copy Path"
                    >
                        <Copy size={11} />
                    </button>
                )}

                {/* 浏览按钮 | Browse button */}
                {onPickAsset && !readonly && (
                    <button
                        type="button"
                        className="inspector-asset-btn"
                        onClick={handleBrowse}
                        title="Browse"
                    >
                        <FolderOpen size={11} />
                    </button>
                )}

                {/* 清除按钮 | Clear button */}
                {hasValue && !readonly && (
                    <button
                        type="button"
                        className="inspector-asset-btn inspector-asset-clear"
                        onClick={handleClear}
                        title="Clear"
                    >
                        <X size={11} />
                    </button>
                )}
            </div>

            {/* 下拉菜单 | Dropdown menu */}
            {showDropdown && (
                <div ref={dropdownRef} className="inspector-asset-dropdown">
                    {/* 浏览选项 | Browse option */}
                    {onPickAsset && (
                        <div className="inspector-asset-dropdown-item" onClick={handleBrowse}>
                            <FolderOpen size={14} />
                            <span>Browse...</span>
                        </div>
                    )}

                    {/* 清除选项 | Clear option */}
                    {hasValue && (
                        <div className="inspector-asset-dropdown-item" onClick={handleClear}>
                            <X size={14} />
                            <span>Clear</span>
                        </div>
                    )}

                    {/* 分割线 | Divider */}
                    {recentAssets.length > 0 && (
                        <>
                            <div className="inspector-asset-dropdown-divider" />
                            <div className="inspector-asset-dropdown-label">Recent</div>
                        </>
                    )}

                    {/* 最近使用 | Recent assets */}
                    {recentAssets.map((asset, index) => (
                        <div
                            key={asset.id || index}
                            className="inspector-asset-dropdown-item"
                            onClick={() => handleSelectAsset(asset)}
                        >
                            {asset.thumbnail ? (
                                <img src={asset.thumbnail} alt="" className="inspector-asset-dropdown-thumb" />
                            ) : (
                                <FileImage size={14} />
                            )}
                            <span>{getAssetDisplayName(asset)}</span>
                        </div>
                    ))}

                    {/* 空状态 | Empty state */}
                    {!onPickAsset && !hasValue && recentAssets.length === 0 && (
                        <div className="inspector-asset-dropdown-empty">No assets available</div>
                    )}
                </div>
            )}
        </div>
    );
};
