import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Eye, EyeOff, ChevronRight, ChevronDown, Box, Folder, Sun, Camera, Code, Image, Type, ToggleLeft } from 'lucide-react';
import { getEditorEngine, type SceneNodeInfo } from '../services/engine';
import { getProjectManager } from '../services/ProjectManager';
import type { ParsedNode } from '../services/SceneParser';
import '../styles/SceneHierarchy.css';

interface EntityNode {
    id: number;
    uuid: string;  // 引擎节点 UUID，用于 selectNode
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
        case 'Script': return <Code size={14} className="entity-type-icon" style={{ color: '#9cdcfe' }} />;
        case 'Sprite': return <Image size={14} className="entity-type-icon" style={{ color: '#4ec9b0' }} />;
        case 'Label': return <Type size={14} className="entity-type-icon" style={{ color: '#ce9178' }} />;
        case 'UI': return <ToggleLeft size={14} className="entity-type-icon" style={{ color: '#dcdcaa' }} />;
        default: return <Box size={14} className="entity-type-icon default" />;
    }
}

interface SceneHierarchyProps {
    onSelectEntity?: (uuid: string) => void;
    selectedEntityId?: string | null;
}

export function SceneHierarchy({ onSelectEntity, selectedEntityId }: SceneHierarchyProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [entities, setEntities] = useState<EntityNode[]>(emptyData);

    const engine = getEditorEngine();
    const projectManager = getProjectManager();

    /**
     * @zh 将解析的节点转换为实体节点
     * @en Convert parsed nodes to entity nodes
     */
    const convertParsedNodeToEntityNode = useCallback((nodes: ParsedNode[]): EntityNode[] => {
        return nodes.map((node, index) => {
            // Determine type based on components (priority: Camera > Light > Script > Sprite > Label > Entity)
            let type = 'Entity';

            for (const comp of node.components) {
                // Camera has highest priority
                if (comp.type === 'cc.Camera') {
                    type = 'Camera';
                    break;
                }
                // Light types
                if (comp.type === 'cc.Light' || comp.type === 'cc.DirectionalLight' ||
                    comp.type === 'cc.SpotLight' || comp.type === 'cc.PointLight') {
                    type = 'Light';
                    break;
                }
                // Custom scripts (class ID)
                if (comp.classId) {
                    type = 'Script';
                    // Don't break - other components might be more specific
                    continue;
                }
                // Common UI/2D components
                if (comp.type === 'cc.Sprite' || comp.type === 'cc.UISprite') {
                    if (type === 'Entity') type = 'Sprite';
                }
                if (comp.type === 'cc.Label' || comp.type === 'cc.RichText') {
                    if (type === 'Entity') type = 'Label';
                }
                if (comp.type === 'cc.Button' || comp.type === 'cc.Toggle' || comp.type === 'cc.EditBox') {
                    if (type === 'Entity') type = 'UI';
                }
                // UITransform is just a basic component, doesn't change type
            }

            // Only completely empty nodes (no components) with children are folders
            if (type === 'Entity' && node.children.length > 0 && node.components.length === 0) {
                type = 'Folder';
            }

            return {
                id: parseInt(node.id.replace('node_', ''), 10) || index,
                uuid: node.id,  // ParsedNode 的 id 格式是 "node_X"
                name: node.name || 'Node',
                type,
                children: convertParsedNodeToEntityNode(node.children),
                visible: node.active,
                expanded: true
            };
        });
    }, []);

    /**
     * @zh 根据组件名称列表判断节点类型
     * @en Determine node type based on component names
     */
    const getNodeTypeFromComponents = useCallback((components: string[] | undefined, hasChildren: boolean): string => {
        if (!components || components.length === 0) {
            // 没有组件的节点，如果有子节点则是 Folder
            return hasChildren ? 'Folder' : 'Entity';
        }

        // 根据组件类型判断（优先级：Camera > Light > Script > Sprite > Label > UI > Entity）
        for (const comp of components) {
            const compLower = comp.toLowerCase();

            // Camera 最高优先级
            if (compLower.includes('camera')) {
                return 'Camera';
            }
            // Light 类型
            if (compLower.includes('light')) {
                return 'Light';
            }
        }

        // 第二轮检查（较低优先级组件）
        let type = 'Entity';
        for (const comp of components) {
            const compLower = comp.toLowerCase();

            // Sprite 组件
            if (compLower.includes('sprite')) {
                if (type === 'Entity') type = 'Sprite';
            }
            // Label 组件
            if (compLower.includes('label') || compLower.includes('richtext')) {
                if (type === 'Entity') type = 'Label';
            }
            // UI 组件
            if (compLower.includes('button') || compLower.includes('toggle') || compLower.includes('editbox') || compLower.includes('scrollview')) {
                if (type === 'Entity') type = 'UI';
            }
            // Script 组件（自定义脚本通常不以 cc. 开头或包含特定标识）
            if (!comp.startsWith('cc.') && !compLower.includes('transform') && !compLower.includes('uitransform')) {
                if (type === 'Entity') type = 'Script';
            }
        }

        return type;
    }, []);

    /**
     * @zh 将场景节点信息转换为实体节点
     * @en Convert scene node info to entity node
     */
    const convertSceneNodeToEntityNode = useCallback((nodes: SceneNodeInfo[]): EntityNode[] => {
        return nodes.map((node, index) => ({
            id: parseInt(node.id, 16) || index,
            uuid: node.id,  // SceneNodeInfo.id 是真正的 UUID
            name: node.name || 'Node',
            type: getNodeTypeFromComponents(node.components, node.children.length > 0),
            children: convertSceneNodeToEntityNode(node.children),
            visible: node.active,
            expanded: true
        }));
    }, [getNodeTypeFromComponents]);

    /**
     * @zh 更新场景树
     * @en Update scene tree
     *
     * 优先级：引擎场景树（有真正的 UUID）> 解析的节点树
     * Priority: Engine scene tree (has real UUID) > Parsed node tree
     */
    const updateSceneTree = useCallback(() => {
        // 优先从引擎获取场景树（包含真正的 UUID，用于 Inspector）
        const sceneTree = engine.getSceneTree();
        if (sceneTree.length > 0) {
            setEntities(convertSceneNodeToEntityNode(sceneTree));
            return;
        }

        // 引擎没有场景时，回退到解析的节点树（快速预览）
        const parsedNodes = projectManager.getSceneNodes();
        if (parsedNodes.length > 0) {
            setEntities(convertParsedNodeToEntityNode(parsedNodes));
        }
    }, [engine, projectManager, convertSceneNodeToEntityNode, convertParsedNodeToEntityNode]);

    /**
     * @zh 监听场景加载事件（统一事件系统）
     * @en Listen for scene loaded events (unified event system)
     *
     * 同时监听两个事件源：
     * 1. Engine.onSceneLoaded - 引擎完整加载场景后触发
     * 2. ProjectManager.onSceneLoaded - 解析场景 JSON 后触发（编辑器模式）
     *
     * Listen to both event sources:
     * 1. Engine.onSceneLoaded - triggered after engine fully loads scene
     * 2. ProjectManager.onSceneLoaded - triggered after parsing scene JSON (editor mode)
     */
    useEffect(() => {
        engine.onSceneLoaded(updateSceneTree);
        projectManager.onSceneLoaded(updateSceneTree);
        updateSceneTree();

        return () => {
            engine.offSceneLoaded(updateSceneTree);
            projectManager.offSceneLoaded(updateSceneTree);
        };
    }, [engine, projectManager, updateSceneTree]);

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

    /**
     * @zh 处理节点拖拽开始
     * @en Handle node drag start
     */
    const handleNodeDragStart = (e: React.DragEvent<HTMLDivElement>, entity: EntityNode) => {
        const dragData = {
            type: 'node',
            uuid: entity.uuid,
            name: entity.name,
            nodeType: entity.type,
        };
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
        e.dataTransfer.setData('text/plain', entity.uuid);
        e.dataTransfer.effectAllowed = 'copyMove';

        // 添加拖拽视觉效果
        if (e.currentTarget) {
            e.currentTarget.classList.add('dragging');
        }
    };

    /**
     * @zh 处理节点拖拽结束
     * @en Handle node drag end
     */
    const handleNodeDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        if (e.currentTarget) {
            e.currentTarget.classList.remove('dragging');
        }
    };

    const renderEntity = (entity: EntityNode, depth: number = 0) => {
        const hasChildren = entity.children.length > 0;
        const isSelected = selectedEntityId === entity.uuid;

        return (
            <div key={entity.id}>
                <div
                    className={`outliner-item ${isSelected ? 'selected' : ''} ${entity.type === 'World' ? 'world-item' : ''}`}
                    style={{ paddingLeft: `${8 + depth * 16}px` }}
                    onClick={() => {
                        // 同时调用引擎选择和回调
                        engine.selectNode(entity.uuid);
                        onSelectEntity?.(entity.uuid);
                    }}
                    draggable
                    onDragStart={(e) => handleNodeDragStart(e, entity)}
                    onDragEnd={handleNodeDragEnd}
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
