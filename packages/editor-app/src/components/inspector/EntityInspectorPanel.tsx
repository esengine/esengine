/**
 * EntityInspectorPanel - 实体检视器面板
 * EntityInspectorPanel - Entity inspector panel
 *
 * 使用新 Inspector 架构的实体检视器
 * Entity inspector using new Inspector architecture
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Plus,
    X,
    Box,
    Search,
    Lock,
    Unlock,
    Settings
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
    Entity,
    Component,
    Core,
    getComponentDependencies,
    getComponentTypeName,
    getComponentInstanceTypeName,
    isComponentInstanceHiddenInInspector,
    PrefabInstanceComponent
} from '@esengine/ecs-framework';
import {
    MessageHub,
    CommandManager,
    ComponentRegistry,
    ComponentActionRegistry,
    ComponentInspectorRegistry,
    PrefabService,
    PropertyMetadataService
} from '@esengine/editor-core';
import { NotificationService } from '../../services/NotificationService';
import {
    RemoveComponentCommand,
    UpdateComponentCommand,
    AddComponentCommand
} from '../../application/commands/component';
import { PropertySearch, CategoryTabs } from './header';
import { PropertySection } from './sections';
import { ComponentPropertyEditor } from './ComponentPropertyEditor';
import { CategoryConfig } from './types';
import './styles/inspector.css';

// ==================== 类型定义 | Type Definitions ====================

type CategoryFilter = 'all' | 'general' | 'transform' | 'rendering' | 'physics' | 'audio' | 'other';

interface ComponentInfo {
    name: string;
    type?: new () => Component;
    category?: string;
    description?: string;
    icon?: string;
}

export interface EntityInspectorPanelProps {
    /** 目标实体 | Target entity */
    entity: Entity;
    /** 消息中心 | Message hub */
    messageHub: MessageHub;
    /** 命令管理器 | Command manager */
    commandManager: CommandManager;
    /** 组件版本号 | Component version */
    componentVersion: number;
    /** 是否锁定 | Is locked */
    isLocked?: boolean;
    /** 锁定变更回调 | Lock change callback */
    onLockChange?: (locked: boolean) => void;
}

// ==================== 常量 | Constants ====================

const CATEGORY_MAP: Record<string, CategoryFilter> = {
    'components.category.core': 'general',
    'components.category.rendering': 'rendering',
    'components.category.physics': 'physics',
    'components.category.audio': 'audio',
    'components.category.ui': 'rendering',
    'components.category.ui.core': 'rendering',
    'components.category.ui.widgets': 'rendering',
    'components.category.other': 'other',
};

const CATEGORY_TABS: CategoryConfig[] = [
    { id: 'general', label: 'General' },
    { id: 'transform', label: 'Transform' },
    { id: 'rendering', label: 'Rendering' },
    { id: 'physics', label: 'Physics' },
    { id: 'audio', label: 'Audio' },
    { id: 'other', label: 'Other' },
    { id: 'all', label: 'All' }
];

const CATEGORY_LABELS: Record<string, string> = {
    'components.category.core': '核心',
    'components.category.rendering': '渲染',
    'components.category.physics': '物理',
    'components.category.audio': '音频',
    'components.category.ui': 'UI',
    'components.category.ui.core': 'UI 核心',
    'components.category.ui.widgets': 'UI 控件',
    'components.category.other': '其他',
};

// ==================== 主组件 | Main Component ====================

export const EntityInspectorPanel: React.FC<EntityInspectorPanelProps> = ({
    entity,
    messageHub,
    commandManager,
    componentVersion,
    isLocked = false,
    onLockChange
}) => {
    // ==================== 状态 | State ====================

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [localVersion, setLocalVersion] = useState(0);

    // 折叠状态（持久化）| Collapsed state (persisted)
    const [collapsedComponents, setCollapsedComponents] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem('inspector-collapsed-components');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });

    // 组件添加菜单 | Component add menu
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [addMenuSearch, setAddMenuSearch] = useState('');
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const addButtonRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // ==================== 服务 | Services ====================

    const componentRegistry = Core.services.resolve(ComponentRegistry);
    const componentActionRegistry = Core.services.resolve(ComponentActionRegistry);
    const componentInspectorRegistry = Core.services.resolve(ComponentInspectorRegistry);
    const prefabService = Core.services.tryResolve(PrefabService) as PrefabService | null;
    const availableComponents = (componentRegistry?.getAllComponents() || []) as ComponentInfo[];

    // ==================== 计算属性 | Computed Properties ====================

    const isPrefabInstance = useMemo(() => {
        return entity.hasComponent(PrefabInstanceComponent);
    }, [entity, componentVersion]);

    const getComponentCategory = useCallback((componentName: string): CategoryFilter => {
        const componentInfo = componentRegistry?.getComponent(componentName);
        if (componentInfo?.category) {
            return CATEGORY_MAP[componentInfo.category] || 'general';
        }
        return 'general';
    }, [componentRegistry]);

    // 计算当前实体拥有的分类 | Compute categories present in current entity
    const availableCategories = useMemo((): CategoryConfig[] => {
        const categorySet = new Set<CategoryFilter>();

        entity.components.forEach((component: Component) => {
            if (isComponentInstanceHiddenInInspector(component)) return;
            const componentName = getComponentInstanceTypeName(component);
            const category = getComponentCategory(componentName);
            categorySet.add(category);
        });

        // 只显示实际存在的分类 + All | Only show categories that exist + All
        const categories: CategoryConfig[] = [];

        // 按固定顺序添加存在的分类 | Add existing categories in fixed order
        const orderedCategories: { id: CategoryFilter; label: string }[] = [
            { id: 'general', label: 'General' },
            { id: 'transform', label: 'Transform' },
            { id: 'rendering', label: 'Rendering' },
            { id: 'physics', label: 'Physics' },
            { id: 'audio', label: 'Audio' },
            { id: 'other', label: 'Other' },
        ];

        for (const cat of orderedCategories) {
            if (categorySet.has(cat.id)) {
                categories.push(cat);
            }
        }

        // 如果有多个分类，添加 All 选项 | If multiple categories, add All option
        if (categories.length > 1) {
            categories.push({ id: 'all', label: 'All' });
        }

        return categories;
    }, [entity.components, getComponentCategory, componentVersion]);

    // 过滤组件列表 | Filter component list
    const filteredComponents = useMemo(() => {
        return entity.components.filter((component: Component) => {
            if (isComponentInstanceHiddenInInspector(component)) {
                return false;
            }

            const componentName = getComponentInstanceTypeName(component);

            if (categoryFilter !== 'all') {
                const category = getComponentCategory(componentName);
                if (category !== categoryFilter) {
                    return false;
                }
            }

            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                if (!componentName.toLowerCase().includes(query)) {
                    return false;
                }
            }

            return true;
        });
    }, [entity.components, categoryFilter, searchQuery, getComponentCategory, componentVersion]);

    // 添加菜单组件分组 | Add menu component grouping
    const groupedComponents = useMemo(() => {
        const query = addMenuSearch.toLowerCase().trim();
        const filtered = query
            ? availableComponents.filter(c =>
                c.name.toLowerCase().includes(query) ||
                (c.description && c.description.toLowerCase().includes(query))
            )
            : availableComponents;

        const grouped = new Map<string, ComponentInfo[]>();
        filtered.forEach((info) => {
            const cat = info.category || 'components.category.other';
            if (!grouped.has(cat)) grouped.set(cat, []);
            grouped.get(cat)!.push(info);
        });
        return grouped;
    }, [availableComponents, addMenuSearch]);

    // 扁平化列表（用于键盘导航）| Flat list (for keyboard navigation)
    const flatComponents = useMemo(() => {
        const result: ComponentInfo[] = [];
        for (const [category, components] of groupedComponents.entries()) {
            const isCollapsed = collapsedCategories.has(category) && !addMenuSearch;
            if (!isCollapsed) {
                result.push(...components);
            }
        }
        return result;
    }, [groupedComponents, collapsedCategories, addMenuSearch]);

    // ==================== 副作用 | Effects ====================

    // 保存折叠状态 | Save collapsed state
    useEffect(() => {
        try {
            localStorage.setItem(
                'inspector-collapsed-components',
                JSON.stringify([...collapsedComponents])
            );
        } catch {
            // Ignore
        }
    }, [collapsedComponents]);

    // 打开添加菜单时聚焦搜索 | Focus search when opening add menu
    useEffect(() => {
        if (showAddMenu) {
            setAddMenuSearch('');
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
    }, [showAddMenu]);

    // 重置选中索引 | Reset selected index
    useEffect(() => {
        setSelectedIndex(addMenuSearch ? 0 : -1);
    }, [addMenuSearch]);

    // 当前分类不可用时重置 | Reset when current category is not available
    useEffect(() => {
        if (availableCategories.length <= 1) {
            // 只有一个或没有分类时，使用 all
            setCategoryFilter('all');
        } else if (categoryFilter !== 'all' && !availableCategories.some(c => c.id === categoryFilter)) {
            // 当前分类不在可用列表中，重置为 all
            setCategoryFilter('all');
        }
    }, [availableCategories, categoryFilter]);

    // ==================== 事件处理 | Event Handlers ====================

    const toggleComponentExpanded = useCallback((componentName: string) => {
        setCollapsedComponents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(componentName)) {
                newSet.delete(componentName);
            } else {
                newSet.add(componentName);
            }
            return newSet;
        });
    }, []);

    const handleAddComponent = useCallback((ComponentClass: new () => Component) => {
        const command = new AddComponentCommand(messageHub, entity, ComponentClass);
        commandManager.execute(command);
        setShowAddMenu(false);
    }, [messageHub, entity, commandManager]);

    const handleRemoveComponent = useCallback((component: Component) => {
        const componentName = getComponentTypeName(component.constructor as any);

        // 检查依赖 | Check dependencies
        const dependentComponents: string[] = [];
        for (const otherComponent of entity.components) {
            if (otherComponent === component) continue;

            const dependencies = getComponentDependencies(otherComponent.constructor as any);
            const otherName = getComponentTypeName(otherComponent.constructor as any);
            if (dependencies && dependencies.includes(componentName)) {
                dependentComponents.push(otherName);
            }
        }

        if (dependentComponents.length > 0) {
            const notificationService = Core.services.tryResolve(NotificationService) as NotificationService | null;
            if (notificationService) {
                notificationService.warning(
                    '无法删除组件',
                    `${componentName} 被以下组件依赖: ${dependentComponents.join(', ')}。请先删除这些组件。`
                );
            }
            return;
        }

        const command = new RemoveComponentCommand(messageHub, entity, component);
        commandManager.execute(command);
    }, [messageHub, entity, commandManager]);

    const handlePropertyChange = useCallback((component: Component, propertyName: string, value: unknown) => {
        const command = new UpdateComponentCommand(
            messageHub,
            entity,
            component,
            propertyName,
            value
        );
        commandManager.execute(command);
    }, [messageHub, entity, commandManager]);

    const handlePropertyAction = useCallback(async (actionId: string, _propertyName: string, component: Component) => {
        if (actionId === 'nativeSize' && component.constructor.name === 'SpriteComponent') {
            const sprite = component as unknown as { texture: string; width: number; height: number };
            if (!sprite.texture) return;

            try {
                const { convertFileSrc } = await import('@tauri-apps/api/core');
                const assetUrl = convertFileSrc(sprite.texture);

                const img = new Image();
                img.onload = () => {
                    handlePropertyChange(component, 'width', img.naturalWidth);
                    handlePropertyChange(component, 'height', img.naturalHeight);
                    setLocalVersion(v => v + 1);
                };
                img.src = assetUrl;
            } catch (error) {
                console.error('Error getting texture size:', error);
            }
        }
    }, [handlePropertyChange]);

    const handleAddMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, flatComponents.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            const selected = flatComponents[selectedIndex];
            if (selected?.type) {
                handleAddComponent(selected.type);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setShowAddMenu(false);
        }
    }, [flatComponents, selectedIndex, handleAddComponent]);

    const toggleCategory = useCallback((category: string) => {
        setCollapsedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) next.delete(category);
            else next.add(category);
            return next;
        });
    }, []);

    // ==================== 渲染 | Render ====================

    return (
        <div className="inspector-panel">
            {/* Header */}
            <div className="inspector-header">
                <div className="inspector-header-info">
                    <button
                        className={`inspector-lock-btn ${isLocked ? 'locked' : ''}`}
                        onClick={() => onLockChange?.(!isLocked)}
                        title={isLocked ? '解锁检视器' : '锁定检视器'}
                    >
                        {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                    <span className="inspector-header-icon">
                        <Settings size={14} />
                    </span>
                    <span className="inspector-header-name">
                        {entity.name || `Entity #${entity.id}`}
                    </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--inspector-text-secondary)' }}>
                    1 object
                </span>
            </div>

            {/* Search */}
            <PropertySearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search components..."
            />

            {/* Category Tabs - 只有多个分类时显示 | Only show when multiple categories */}
            {availableCategories.length > 1 && (
                <CategoryTabs
                    categories={availableCategories}
                    current={categoryFilter}
                    onChange={(cat) => setCategoryFilter(cat as CategoryFilter)}
                />
            )}

            {/* Content */}
            <div className="inspector-panel-content">
                {/* Add Component Section Header */}
                <div className="inspector-section">
                    <div
                        className="inspector-section-header"
                        style={{ justifyContent: 'space-between' }}
                    >
                        <span className="inspector-section-title">组件</span>
                        <button
                            ref={addButtonRef}
                            className="inspector-header-add-btn"
                            onClick={() => setShowAddMenu(!showAddMenu)}
                        >
                            <Plus size={12} />
                            添加
                        </button>
                    </div>
                </div>

                {/* Component List */}
                {filteredComponents.length === 0 ? (
                    <div className="inspector-empty">
                        {entity.components.length === 0 ? '暂无组件' : '没有匹配的组件'}
                    </div>
                ) : (
                    filteredComponents.map((component: Component) => {
                        const componentName = getComponentInstanceTypeName(component);
                        const isExpanded = !collapsedComponents.has(componentName);
                        const componentInfo = componentRegistry?.getComponent(componentName);
                        const iconName = (componentInfo as { icon?: string } | undefined)?.icon;
                        const IconComponent = iconName && (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[iconName];

                        return (
                            <div key={`${componentName}-${entity.components.indexOf(component)}`} className="inspector-section">
                                <div
                                    className="inspector-section-header"
                                    onClick={() => toggleComponentExpanded(componentName)}
                                >
                                    <span className={`inspector-section-arrow ${isExpanded ? 'expanded' : ''}`}>
                                        <ChevronRight size={14} />
                                    </span>
                                    <span style={{ marginRight: '6px', color: 'var(--inspector-text-secondary)' }}>
                                        {IconComponent ? <IconComponent size={14} /> : <Box size={14} />}
                                    </span>
                                    <span className="inspector-section-title">{componentName}</span>
                                    <button
                                        className="inspector-section-remove"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveComponent(component);
                                        }}
                                        title="移除组件"
                                        style={{
                                            marginLeft: 'auto',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--inspector-text-secondary)',
                                            cursor: 'pointer',
                                            padding: '2px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                                {isExpanded && (
                                    <div className="inspector-section-content expanded">
                                        {componentInspectorRegistry?.hasInspector(component) ? (
                                            componentInspectorRegistry.render({
                                                component,
                                                entity,
                                                version: componentVersion + localVersion,
                                                onChange: (propName: string, value: unknown) =>
                                                    handlePropertyChange(component, propName, value),
                                                onAction: handlePropertyAction
                                            })
                                        ) : (
                                            <ComponentPropertyEditor
                                                component={component}
                                                entity={entity}
                                                version={componentVersion + localVersion}
                                                onChange={(propName, value) =>
                                                    handlePropertyChange(component, propName, value)
                                                }
                                                onAction={handlePropertyAction}
                                            />
                                        )}

                                        {/* Append inspectors */}
                                        {componentInspectorRegistry?.renderAppendInspectors({
                                            component,
                                            entity,
                                            version: componentVersion + localVersion,
                                            onChange: (propName: string, value: unknown) =>
                                                handlePropertyChange(component, propName, value),
                                            onAction: handlePropertyAction
                                        })}

                                        {/* Component actions */}
                                        {componentActionRegistry?.getActionsForComponent(componentName).map((action) => {
                                            const ActionIcon = typeof action.icon === 'string'
                                                ? (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[action.icon]
                                                : null;
                                            return (
                                                <button
                                                    key={action.id}
                                                    className="inspector-header-add-btn"
                                                    style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }}
                                                    onClick={() => action.execute(component, entity)}
                                                >
                                                    {ActionIcon ? <ActionIcon size={14} /> : action.icon}
                                                    {action.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Component Menu */}
            {showAddMenu && (
                <>
                    <div
                        className="inspector-dropdown-overlay"
                        onClick={() => setShowAddMenu(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 99
                        }}
                    />
                    <div
                        className="inspector-dropdown-menu"
                        style={{
                            position: 'fixed',
                            top: addButtonRef.current?.getBoundingClientRect().bottom ?? 0 + 4,
                            right: window.innerWidth - (addButtonRef.current?.getBoundingClientRect().right ?? 0),
                            width: '280px',
                            maxHeight: '400px',
                            zIndex: 100
                        }}
                    >
                        {/* Search */}
                        <div className="inspector-search" style={{ borderBottom: '1px solid var(--inspector-border)' }}>
                            <Search size={14} className="inspector-search-icon" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="inspector-search-input"
                                placeholder="搜索组件..."
                                value={addMenuSearch}
                                onChange={(e) => setAddMenuSearch(e.target.value)}
                                onKeyDown={handleAddMenuKeyDown}
                            />
                        </div>

                        {/* Component List */}
                        <div style={{ overflowY: 'auto', maxHeight: '350px' }}>
                            {groupedComponents.size === 0 ? (
                                <div className="inspector-empty">
                                    {addMenuSearch ? '未找到匹配的组件' : '没有可用组件'}
                                </div>
                            ) : (
                                (() => {
                                    let globalIndex = 0;
                                    return Array.from(groupedComponents.entries()).map(([category, components]) => {
                                        const isCollapsed = collapsedCategories.has(category) && !addMenuSearch;
                                        const label = CATEGORY_LABELS[category] || category;
                                        const startIndex = globalIndex;
                                        if (!isCollapsed) {
                                            globalIndex += components.length;
                                        }

                                        return (
                                            <div key={category}>
                                                <div
                                                    className="inspector-dropdown-item"
                                                    onClick={() => toggleCategory(category)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontWeight: 500,
                                                        background: 'var(--inspector-bg-section)'
                                                    }}
                                                >
                                                    {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                                                    <span>{label}</span>
                                                    <span style={{
                                                        marginLeft: 'auto',
                                                        fontSize: '10px',
                                                        color: 'var(--inspector-text-secondary)'
                                                    }}>
                                                        {components.length}
                                                    </span>
                                                </div>

                                                {!isCollapsed && components.map((info, idx) => {
                                                    const IconComp = info.icon && (LucideIcons as any)[info.icon];
                                                    const itemIndex = startIndex + idx;
                                                    const isSelected = itemIndex === selectedIndex;

                                                    return (
                                                        <div
                                                            key={info.name}
                                                            className={`inspector-dropdown-item ${isSelected ? 'selected' : ''}`}
                                                            onClick={() => info.type && handleAddComponent(info.type)}
                                                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                paddingLeft: '24px'
                                                            }}
                                                        >
                                                            {IconComp ? <IconComp size={14} /> : <Box size={14} />}
                                                            <span>{info.name}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    });
                                })()
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
