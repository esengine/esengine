import { useState } from 'react';
import {
    Search, Plus, ChevronRight, ChevronDown, LayoutGrid, List,
    FolderClosed, FolderOpen, File, FileCode, FileJson, FileImage, FileText
} from 'lucide-react';
import '../styles/ContentBrowser.css';

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
    isDrawer?: boolean;
}

export function ContentBrowser({ onSelectAsset, isDrawer = false }: ContentBrowserProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [folders, setFolders] = useState<FolderNode[]>(emptyFolders);
    const [assets] = useState<AssetItem[]>(emptyAssets);
    const [currentPath, setCurrentPath] = useState('/');
    const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

    const toggleFolder = (path: string) => {
        const updateFolders = (nodes: FolderNode[]): FolderNode[] => {
            return nodes.map(node => {
                if (node.path === path) {
                    return { ...node, expanded: !node.expanded };
                }
                if (node.children.length > 0) {
                    return { ...node, children: updateFolders(node.children) };
                }
                return node;
            });
        };
        setFolders(updateFolders(folders));
    };

    const selectFolder = (path: string) => {
        setCurrentPath(path);
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
                        <button className="cb-toolbar-btn primary">
                            <Plus size={14} />
                            <span>New</span>
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
                    {assets.length === 0 ? (
                        <div className="cb-empty-state">
                            <span>No assets</span>
                        </div>
                    ) : assets
                        .filter(asset => asset.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(asset => (
                            <div
                                key={asset.path}
                                className={`cb-asset-item ${selectedAsset === asset.path ? 'selected' : ''}`}
                                onClick={() => handleAssetClick(asset)}
                                onDoubleClick={() => console.log('Open:', asset.path)}
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
