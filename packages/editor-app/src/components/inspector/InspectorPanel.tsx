/**
 * InspectorPanel - 属性面板主组件
 * InspectorPanel - Property panel main component
 */

import React, { useCallback, useMemo, useState } from 'react';
import { PropertySection } from './sections';
import {
    PropertyRow,
    NumberInput,
    StringInput,
    BooleanInput,
    VectorInput,
    EnumInput,
    ColorInput,
    AssetInput,
    EntityRefInput,
    ArrayInput
} from './controls';
import {
    InspectorHeader,
    PropertySearch,
    CategoryTabs
} from './header';
import {
    InspectorPanelProps,
    SectionConfig,
    PropertyConfig,
    PropertyType,
    CategoryConfig
} from './types';
import './styles/inspector.css';

/**
 * 渲染属性控件
 * Render property control
 */
const renderControl = (
    type: PropertyType,
    value: any,
    onChange: (value: any) => void,
    readonly: boolean,
    metadata?: Record<string, any>
): React.ReactNode => {
    switch (type) {
        case 'number':
            return (
                <NumberInput
                    value={value ?? 0}
                    onChange={onChange}
                    readonly={readonly}
                    min={metadata?.min}
                    max={metadata?.max}
                    step={metadata?.step}
                    integer={metadata?.integer}
                />
            );

        case 'string':
            return (
                <StringInput
                    value={value ?? ''}
                    onChange={onChange}
                    readonly={readonly}
                    placeholder={metadata?.placeholder}
                />
            );

        case 'boolean':
            return (
                <BooleanInput
                    value={value ?? false}
                    onChange={onChange}
                    readonly={readonly}
                />
            );

        case 'vector2':
            return (
                <VectorInput
                    value={value ?? { x: 0, y: 0 }}
                    onChange={onChange}
                    readonly={readonly}
                    dimensions={2}
                />
            );

        case 'vector3':
            return (
                <VectorInput
                    value={value ?? { x: 0, y: 0, z: 0 }}
                    onChange={onChange}
                    readonly={readonly}
                    dimensions={3}
                />
            );

        case 'vector4':
            return (
                <VectorInput
                    value={value ?? { x: 0, y: 0, z: 0, w: 0 }}
                    onChange={onChange}
                    readonly={readonly}
                    dimensions={4}
                />
            );

        case 'enum':
            return (
                <EnumInput
                    value={value}
                    onChange={onChange}
                    readonly={readonly}
                    options={metadata?.options ?? []}
                    placeholder={metadata?.placeholder}
                />
            );

        case 'color':
            return (
                <ColorInput
                    value={value ?? { r: 0, g: 0, b: 0, a: 1 }}
                    onChange={onChange}
                    readonly={readonly}
                    showAlpha={metadata?.showAlpha}
                />
            );

        case 'asset':
            return (
                <AssetInput
                    value={value}
                    onChange={onChange}
                    readonly={readonly}
                    assetTypes={metadata?.assetTypes}
                    extensions={metadata?.extensions}
                    onPickAsset={metadata?.onPickAsset}
                    onOpenAsset={metadata?.onOpenAsset}
                />
            );

        case 'entityRef':
            return (
                <EntityRefInput
                    value={value}
                    onChange={onChange}
                    readonly={readonly}
                    resolveEntityName={metadata?.resolveEntityName}
                    onSelectEntity={metadata?.onSelectEntity}
                    onLocateEntity={metadata?.onLocateEntity}
                />
            );

        case 'array':
            return (
                <ArrayInput
                    value={value ?? []}
                    onChange={onChange}
                    readonly={readonly}
                    renderElement={metadata?.renderElement}
                    createNewElement={metadata?.createNewElement}
                    minItems={metadata?.minItems}
                    maxItems={metadata?.maxItems}
                    sortable={metadata?.sortable}
                    collapsedTitle={metadata?.collapsedTitle}
                />
            );

        // TODO: 后续实现 | To be implemented
        case 'object':
            return <span style={{ color: '#666', fontSize: '10px' }}>[{type}]</span>;

        default:
            return <span style={{ color: '#666', fontSize: '10px' }}>[unknown]</span>;
    }
};

/**
 * 默认分类配置
 * Default category configuration
 */
const DEFAULT_CATEGORIES: CategoryConfig[] = [
    { id: 'all', label: 'All' }
];

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
    targetName,
    sections,
    categories,
    currentCategory: controlledCategory,
    onCategoryChange,
    getValue,
    onChange,
    readonly = false,
    searchQuery: controlledSearch,
    onSearchChange
}) => {
    // 内部状态（非受控模式）| Internal state (uncontrolled mode)
    const [internalSearch, setInternalSearch] = useState('');
    const [internalCategory, setInternalCategory] = useState('all');

    // 支持受控/非受控模式 | Support controlled/uncontrolled mode
    const searchQuery = controlledSearch ?? internalSearch;
    const currentCategory = controlledCategory ?? internalCategory;

    const handleSearchChange = useCallback((value: string) => {
        if (onSearchChange) {
            onSearchChange(value);
        } else {
            setInternalSearch(value);
        }
    }, [onSearchChange]);

    const handleCategoryChange = useCallback((category: string) => {
        if (onCategoryChange) {
            onCategoryChange(category);
        } else {
            setInternalCategory(category);
        }
    }, [onCategoryChange]);

    // 使用提供的分类或默认分类 | Use provided categories or default
    const effectiveCategories = useMemo(() => {
        if (categories && categories.length > 0) {
            return categories;
        }
        return DEFAULT_CATEGORIES;
    }, [categories]);

    // 是否显示分类标签 | Whether to show category tabs
    const showCategoryTabs = effectiveCategories.length > 1;

    /**
     * 过滤属性（搜索 + 分类）
     * Filter properties (search + category)
     */
    const filterProperty = useCallback((prop: PropertyConfig): boolean => {
        // 分类过滤 | Category filter
        if (currentCategory !== 'all' && prop.category && prop.category !== currentCategory) {
            return false;
        }

        // 搜索过滤 | Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                prop.name.toLowerCase().includes(query) ||
                prop.label.toLowerCase().includes(query)
            );
        }

        return true;
    }, [searchQuery, currentCategory]);

    /**
     * 过滤后的 sections
     * Filtered sections
     */
    const filteredSections = useMemo(() => {
        return sections
            .map(section => ({
                ...section,
                properties: section.properties.filter(filterProperty)
            }))
            .filter(section => section.properties.length > 0);
    }, [sections, filterProperty]);

    /**
     * 渲染 Section
     * Render section
     */
    const renderSection = useCallback((section: SectionConfig, depth: number = 0) => {
        return (
            <PropertySection
                key={section.id}
                title={section.title}
                defaultExpanded={section.defaultExpanded ?? true}
                depth={depth}
            >
                {/* 属性列表 | Property list */}
                {section.properties.map(prop => (
                    <PropertyRow
                        key={prop.name}
                        label={prop.label}
                        depth={depth}
                        draggable={prop.type === 'number'}
                    >
                        {renderControl(
                            prop.type,
                            getValue(prop.name),
                            (value) => onChange(prop.name, value),
                            readonly,
                            prop.metadata
                        )}
                    </PropertyRow>
                ))}

                {/* 子 Section | Sub sections */}
                {section.subsections?.map(sub => renderSection(sub, depth + 1))}
            </PropertySection>
        );
    }, [getValue, onChange, readonly]);

    return (
        <div className="inspector-panel">
            {/* 头部 | Header */}
            {targetName && (
                <InspectorHeader name={targetName} />
            )}

            {/* 搜索栏 | Search bar */}
            <PropertySearch
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search properties..."
            />

            {/* 分类标签 | Category tabs */}
            {showCategoryTabs && (
                <CategoryTabs
                    categories={effectiveCategories}
                    current={currentCategory}
                    onChange={handleCategoryChange}
                />
            )}

            {/* 属性内容 | Property content */}
            <div className="inspector-panel-content">
                {filteredSections.length > 0 ? (
                    filteredSections.map(section => renderSection(section))
                ) : (
                    <div className="inspector-empty">
                        {searchQuery ? 'No matching properties' : 'No properties'}
                    </div>
                )}
            </div>
        </div>
    );
};
