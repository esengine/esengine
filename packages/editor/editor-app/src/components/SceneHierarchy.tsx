import { useState } from 'react';
import { Search, Plus, Eye, EyeOff, ChevronRight, ChevronDown, Box, Folder, Sun, Camera } from 'lucide-react';
import '../styles/SceneHierarchy.css';

interface EntityNode {
    id: number;
    name: string;
    type: string;
    children: EntityNode[];
    visible: boolean;
    expanded: boolean;
}

const emptyData: EntityNode[] = [];

function getEntityIcon(type: string) {
    switch (type) {
        case 'World': return <Box size={14} className="entity-type-icon world" />;
        case 'Folder': return <Folder size={14} className="entity-type-icon folder" />;
        case 'Light': return <Sun size={14} className="entity-type-icon light" />;
        case 'Camera': return <Camera size={14} className="entity-type-icon" style={{ color: '#4a9eff' }} />;
        default: return <Box size={14} className="entity-type-icon default" />;
    }
}

interface SceneHierarchyProps {
    onSelectEntity?: (id: number) => void;
    selectedEntityId?: number | null;
}

export function SceneHierarchy({ onSelectEntity, selectedEntityId }: SceneHierarchyProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [entities, setEntities] = useState<EntityNode[]>(emptyData);

    const toggleExpand = (id: number) => {
        const updateEntities = (nodes: EntityNode[]): EntityNode[] => {
            return nodes.map(node => {
                if (node.id === id) {
                    return { ...node, expanded: !node.expanded };
                }
                if (node.children.length > 0) {
                    return { ...node, children: updateEntities(node.children) };
                }
                return node;
            });
        };
        setEntities(updateEntities(entities));
    };

    const toggleVisibility = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const updateEntities = (nodes: EntityNode[]): EntityNode[] => {
            return nodes.map(node => {
                if (node.id === id) {
                    return { ...node, visible: !node.visible };
                }
                if (node.children.length > 0) {
                    return { ...node, children: updateEntities(node.children) };
                }
                return node;
            });
        };
        setEntities(updateEntities(entities));
    };

    const renderEntity = (entity: EntityNode, depth: number = 0) => {
        const hasChildren = entity.children.length > 0;
        const isSelected = selectedEntityId === entity.id;

        return (
            <div key={entity.id}>
                <div
                    className={`outliner-item ${isSelected ? 'selected' : ''} ${entity.type === 'World' ? 'world-item' : ''}`}
                    style={{ paddingLeft: `${8 + depth * 16}px` }}
                    onClick={() => onSelectEntity?.(entity.id)}
                >
                    <div className="outliner-item-icons">
                        <span
                            className={`item-icon visibility ${!entity.visible ? 'hidden' : ''}`}
                            onClick={(e) => toggleVisibility(entity.id, e)}
                        >
                            {entity.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                        </span>
                    </div>
                    <div className="outliner-item-content">
                        <span
                            className={`outliner-item-expand ${hasChildren ? 'clickable' : ''}`}
                            onClick={(e) => {
                                if (hasChildren) {
                                    e.stopPropagation();
                                    toggleExpand(entity.id);
                                }
                            }}
                        >
                            {hasChildren ? (
                                entity.expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                            ) : null}
                        </span>
                        {getEntityIcon(entity.type)}
                        <span className="outliner-item-name">{entity.name}</span>
                    </div>
                    <span className="outliner-item-type">{entity.type}</span>
                </div>
                {entity.expanded && entity.children.map(child => renderEntity(child, depth + 1))}
            </div>
        );
    };

    return (
        <div className="scene-hierarchy outliner">
            <div className="outliner-toolbar">
                <div className="outliner-search">
                    <Search size={14} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="outliner-toolbar-right">
                    <button className="outliner-action-btn" title="Add Entity">
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            <div className="outliner-header">
                <div className="outliner-header-icons">
                    <Eye size={12} className="header-icon" />
                </div>
                <span className="outliner-header-label">Name</span>
                <span className="outliner-header-type">Type</span>
            </div>

            <div className="outliner-content">
                {entities.length === 0 ? (
                    <div className="empty-state">
                        <Box size={32} className="empty-icon" />
                        <span className="empty-hint">No scene loaded</span>
                    </div>
                ) : (
                    <div className="outliner-list">
                        {entities.map(entity => renderEntity(entity))}
                    </div>
                )}
            </div>
        </div>
    );
}
