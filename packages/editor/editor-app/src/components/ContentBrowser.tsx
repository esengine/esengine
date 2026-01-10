import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
    Search, Plus, ChevronRight, ChevronDown, LayoutGrid, List,
    FolderClosed, FolderOpen, File, FileCode, FileJson, FileImage, FileText,
    RefreshCw
} from 'lucide-react';
import '../styles/ContentBrowser.css';

/**
 * @zh 目录条目信息（从 Tauri 返回）
 * @en Directory entry info (returned from Tauri)
 */
interface DirectoryEntry {
    name: string;
    path: string;
    is_dir: boolean;
    size: number | null;
    modified: number | null;
}

interface FolderNode {
    name: string;
    path: string;
    children: FolderNode[];
    expanded: boolean;
}

interface AssetItem {
    name: string;
    path: string;
    type: 'file' | 'folder';
    extension?: string;
}

const emptyFolders: FolderNode[] = [];

const emptyAssets: AssetItem[] = [];

function getAssetIcon(extension?: string, isFolder?: boolean) {
    if (isFolder) return <FolderClosed size={20} className="asset-thumbnail-icon folder" />;

    switch (extension?.toLowerCase()) {
        case 'scene':
        case 'ecs':
            return <FileText size={20} className="asset-thumbnail-icon scene" />;
        case 'ts':
        case 'js':
            return <FileCode size={20} className="asset-thumbnail-icon code" />;
        case 'json':
            return <FileJson size={20} className="asset-thumbnail-icon json" />;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'webp':
            return <FileImage size={20} className="asset-thumbnail-icon image" />;
        default:
            return <File size={20} className="asset-thumbnail-icon" />;
    }
}

interface ContentBrowserProps {
    onSelectAsset?: (path: string) => void;
    onOpenScene?: (scenePath: string) => void;
    projectPath?: string;
    isDrawer?: boolean;
}

export function ContentBrowser({
    onSelectAsset,
    onOpenScene,
    projectPath,
    isDrawer = false
}: ContentBrowserProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [folders, setFolders] = useState<FolderNode[]>(emptyFolders);
    const [assets, setAssets] = useState<AssetItem[]>(emptyAssets);
    const [currentPath, setCurrentPath] = useState('/');
    const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * @zh 加载目录内容
     * @en Load directory contents
     */
    const loadDirectory = useCallback(async (dirPath: string) => {
        try {
            setIsLoading(true);
            const entries = await invoke<DirectoryEntry[]>('list_directory', { path: dirPath });

            // Convert to AssetItem format
            const newAssets: AssetItem[] = entries.map(entry => ({
                name: entry.name,
                path: entry.path,
                type: entry.is_dir ? 'folder' : 'file',
                extension: entry.is_dir ? undefined : entry.name.split('.').pop()
            }));

            setAssets(newAssets);
            setCurrentPath(dirPath);
        } catch (error) {
            console.error('[ContentBrowser] Failed to load directory:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * @zh 构建文件夹树结构
     * @en Build folder tree structure
     */
    const buildFolderTree = useCallback(async (rootPath: string): Promise<FolderNode[]> => {
        try {
            const entries = await invoke<DirectoryEntry[]>('list_directory', { path: rootPath });
            const folderEntries = entries.filter(e => e.is_dir);

            return folderEntries.map(entry => ({
                name: entry.name,
                path: entry.path,
                children: [],
                expanded: false
            }));
        } catch (error) {
            console.error('[ContentBrowser] Failed to build folder tree:', error);
            return [];
        }
    }, []);

    // Load project when projectPath changes
    useEffect(() => {
        if (projectPath) {
            (async () => {
                const rootFolders = await buildFolderTree(projectPath);
                setFolders([{
                    name: projectPath.split(/[/\\]/).pop() || 'Project',
                    path: projectPath,
                    children: rootFolders,
                    expanded: true
                }]);
                await loadDirectory(projectPath);
            })();
        }
    }, [projectPath, buildFolderTree, loadDirectory]);

    const toggleFolder = async (path: string) => {
        const updateFoldersAsync = async (nodes: FolderNode[]): Promise<FolderNode[]> => {
            const results: FolderNode[] = [];
            for (const node of nodes) {
                if (node.path === path) {
                    // If expanding and no children loaded yet, load them
                    let children = node.children;
                    if (!node.expanded && children.length === 0) {
                        children = await buildFolderTree(path);
                    }
                    results.push({ ...node, expanded: !node.expanded, children });
                } else if (node.children.length > 0) {
                    results.push({ ...node, children: await updateFoldersAsync(node.children) });
                } else {
                    results.push(node);
                }
            }
            return results;
        };
        setFolders(await updateFoldersAsync(folders));
    };

    const selectFolder = (path: string) => {
        loadDirectory(path);
    };

    const renderFolderTree = (nodes: FolderNode[], depth: number = 0) => {
        return nodes.map(node => (
            <div key={node.path}>
                <div
                    className={`folder-tree-item ${currentPath === node.path ? 'selected' : ''}`}
                    style={{ paddingLeft: `${8 + depth * 12}px` }}
                    onClick={() => selectFolder(node.path)}
                >
                    <span className="folder-tree-expand" onClick={(e) => {
                        e.stopPropagation();
                        toggleFolder(node.path);
                    }}>
                        {node.children.length > 0 ? (
                            node.expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                        ) : null}
                    </span>
                    <span className="folder-tree-icon">
                        {node.expanded ? <FolderOpen size={14} /> : <FolderClosed size={14} />}
                    </span>
                    <span className="folder-tree-name">{node.name}</span>
                </div>
                {node.expanded && node.children.length > 0 && (
                    <div>{renderFolderTree(node.children, depth + 1)}</div>
                )}
            </div>
        ));
    };

    const handleAssetClick = (asset: AssetItem) => {
        setSelectedAsset(asset.path);
        onSelectAsset?.(asset.path);
    };

    const handleAssetDoubleClick = (asset: AssetItem) => {
        if (asset.type === 'folder') {
            // Navigate into folder
            loadDirectory(asset.path);
        } else {
            // Check if it's a scene file
            const ext = asset.extension?.toLowerCase();
            if (ext === 'scene' || ext === 'ecs' || ext === 'json') {
                onOpenScene?.(asset.path);
            }
        }
    };

    /**
     * @zh 处理资源拖拽开始
     * @en Handle asset drag start
     */
    const handleAssetDragStart = (e: React.DragEvent<HTMLDivElement>, asset: AssetItem) => {
        // 设置拖拽数据（JSON 格式）
        const dragData = {
            type: 'asset',
            path: asset.path,
            name: asset.name,
            extension: asset.extension,
            assetType: getAssetTypeFromExtension(asset.extension),
        };
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
        e.dataTransfer.setData('text/plain', asset.path);
        e.dataTransfer.effectAllowed = 'copy';

        // 添加拖拽视觉效果
        if (e.currentTarget) {
            e.currentTarget.classList.add('dragging');
        }
    };

    /**
     * @zh 处理资源拖拽结束
     * @en Handle asset drag end
     */
    const handleAssetDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        if (e.currentTarget) {
            e.currentTarget.classList.remove('dragging');
        }
    };

    /**
     * @zh 根据文件扩展名获取资源类型
     * @en Get asset type from file extension
     */
    const getAssetTypeFromExtension = (extension?: string): string => {
        switch (extension?.toLowerCase()) {
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'webp':
            case 'gif':
                return 'Texture2D';
            case 'spriteframe':
                return 'SpriteFrame';
            case 'mp3':
            case 'wav':
            case 'ogg':
                return 'AudioClip';
            case 'prefab':
                return 'Prefab';
            case 'scene':
            case 'ecs':
                return 'Scene';
            case 'ts':
            case 'js':
                return 'Script';
            case 'json':
                return 'JsonAsset';
            case 'mtl':
            case 'material':
                return 'Material';
            case 'fbx':
            case 'gltf':
            case 'glb':
            case 'obj':
                return 'Mesh';
            case 'ttf':
            case 'otf':
            case 'fnt':
                return 'Font';
            case 'anim':
            case 'animation':
                return 'AnimationClip';
            default:
                return 'Asset';
        }
    };

    const handleRefresh = () => {
        if (currentPath !== '/') {
            loadDirectory(currentPath);
        }
    };

    return (
        <div className={`content-browser ${isDrawer ? 'is-drawer' : ''}`}>
            <div className="content-browser-left">
                <div className="cb-folder-tree">
                    {renderFolderTree(folders)}
                </div>
            </div>

            <div className="content-browser-right">
                <div className="cb-toolbar">
                    <div className="cb-toolbar-left">
                        <button
                            className="cb-toolbar-btn"
                            onClick={handleRefresh}
                            disabled={currentPath === '/' || isLoading}
                            title="Refresh"
                        >
                            <RefreshCw size={14} className={isLoading ? 'spinning' : ''} />
                        </button>
                        <button className="cb-toolbar-btn" disabled>
                            <Plus size={14} />
                        </button>
                    </div>
                    <div className="cb-breadcrumb">
                        {currentPath.split('/').filter(Boolean).map((part, index, arr) => (
                            <span key={index} className="cb-breadcrumb-item">
                                {index > 0 && <ChevronRight size={12} className="cb-breadcrumb-sep" />}
                                <span className="cb-breadcrumb-link">{part}</span>
                            </span>
                        ))}
                    </div>
                    <div className="cb-toolbar-right">
                        <div className="cb-view-options">
                            <button
                                className={`cb-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid size={14} />
                            </button>
                            <button
                                className={`cb-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <List size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="cb-search-bar">
                    <div className="cb-search-input-wrapper">
                        <Search size={14} className="cb-search-icon" />
                        <input
                            type="text"
                            className="cb-search-input"
                            placeholder="Search assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className={`cb-asset-grid ${viewMode}`}>
                    {isLoading ? (
                        <div className="cb-empty-state">
                            <RefreshCw size={24} className="spinning" />
                            <span>Loading...</span>
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="cb-empty-state">
                            {currentPath === '/' ? (
                                <>
                                    <FolderClosed size={32} />
                                    <span>File &gt; Open Project to browse files</span>
                                </>
                            ) : (
                                <span>Empty folder</span>
                            )}
                        </div>
                    ) : assets
                        .filter(asset => asset.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(asset => (
                            <div
                                key={asset.path}
                                className={`cb-asset-item ${selectedAsset === asset.path ? 'selected' : ''}`}
                                onClick={() => handleAssetClick(asset)}
                                onDoubleClick={() => handleAssetDoubleClick(asset)}
                                draggable={asset.type === 'file'}
                                onDragStart={(e) => handleAssetDragStart(e, asset)}
                                onDragEnd={handleAssetDragEnd}
                            >
                                <div className="cb-asset-thumbnail">
                                    {getAssetIcon(asset.extension, asset.type === 'folder')}
                                </div>
                                <div className="cb-asset-info">
                                    <div className="cb-asset-name">{asset.name}</div>
                                    <div className="cb-asset-type">{asset.extension?.toUpperCase() || 'Folder'}</div>
                                </div>
                            </div>
                        ))}
                </div>

                <div className="cb-status-bar">
                    <span>{assets.length} items</span>
                    {selectedAsset && <span className="cb-status-selected">1 selected</span>}
                </div>
            </div>
        </div>
    );
}
