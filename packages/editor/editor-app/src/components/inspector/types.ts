/**
 * Inspector Type Definitions
 * Inspector 类型定义
 */

import { ReactElement } from 'react';

/**
 * 属性控件 Props
 * Property Control Props
 */
export interface PropertyControlProps<T = any> {
    /** 当前值 | Current value */
    value: T;
    /** 值变更回调 | Value change callback */
    onChange: (value: T) => void;
    /** 是否只读 | Read-only mode */
    readonly?: boolean;
    /** 属性元数据 | Property metadata */
    metadata?: PropertyMetadata;
}

/**
 * 属性元数据
 * Property Metadata
 */
export interface PropertyMetadata {
    /** 最小值 | Minimum value */
    min?: number;
    /** 最大值 | Maximum value */
    max?: number;
    /** 步进值 | Step value */
    step?: number;
    /** 是否为整数 | Integer only */
    integer?: boolean;
    /** 占位文本 | Placeholder text */
    placeholder?: string;
    /** 枚举选项 | Enum options */
    options?: Array<{ label: string; value: string | number }>;
    /** 文件扩展名 | File extensions */
    extensions?: string[];
    /** 资产类型 | Asset type */
    assetType?: string;
    /** 自定义数据 | Custom data */
    [key: string]: any;
}

/**
 * 属性配置
 * Property Configuration
 */
export interface PropertyConfig {
    /** 属性名 | Property name */
    name: string;
    /** 显示标签 | Display label */
    label: string;
    /** 属性类型 | Property type */
    type: PropertyType;
    /** 属性元数据 | Property metadata */
    metadata?: PropertyMetadata;
    /** 分类 | Category */
    category?: string;
}

/**
 * 属性类型
 * Property Types
 */
export type PropertyType =
    | 'number'
    | 'string'
    | 'boolean'
    | 'enum'
    | 'vector2'
    | 'vector3'
    | 'vector4'
    | 'color'
    | 'asset'
    | 'entityRef'
    | 'array'
    | 'object';

/**
 * Section 配置
 * Section Configuration
 */
export interface SectionConfig {
    /** Section ID */
    id: string;
    /** 标题 | Title */
    title: string;
    /** 分类 | Category */
    category?: string;
    /** 默认展开 | Default expanded */
    defaultExpanded?: boolean;
    /** 属性列表 | Property list */
    properties: PropertyConfig[];
    /** 子 Section | Sub sections */
    subsections?: SectionConfig[];
}

/**
 * 分类配置
 * Category Configuration
 */
export interface CategoryConfig {
    /** 分类 ID | Category ID */
    id: string;
    /** 显示名称 | Display name */
    label: string;
}

/**
 * 属性控件接口
 * Property Control Interface
 */
export interface IPropertyControl<T = any> {
    /** 控件类型 | Control type */
    readonly type: string;
    /** 控件名称 | Control name */
    readonly name: string;
    /** 优先级 | Priority */
    readonly priority?: number;
    /** 检查是否可处理 | Check if can handle */
    canHandle?(fieldType: string, metadata?: PropertyMetadata): boolean;
    /** 渲染控件 | Render control */
    render(props: PropertyControlProps<T>): ReactElement;
}

/**
 * Inspector 面板 Props
 * Inspector Panel Props
 */
export interface InspectorPanelProps {
    /** 目标对象名称 | Target object name */
    targetName?: string;
    /** Section 列表 | Section list */
    sections: SectionConfig[];
    /** 分类列表 | Category list */
    categories?: CategoryConfig[];
    /** 当前分类 | Current category */
    currentCategory?: string;
    /** 分类变更回调 | Category change callback */
    onCategoryChange?: (category: string) => void;
    /** 属性值获取器 | Property value getter */
    getValue: (propertyName: string) => any;
    /** 属性值变更回调 | Property value change callback */
    onChange: (propertyName: string, value: any) => void;
    /** 是否只读 | Read-only mode */
    readonly?: boolean;
    /** 搜索关键词 | Search keyword */
    searchQuery?: string;
    /** 搜索变更回调 | Search change callback */
    onSearchChange?: (query: string) => void;
}

/**
 * 向量值类型
 * Vector Value Types
 */
export interface Vector2 {
    x: number;
    y: number;
}

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface Vector4 {
    x: number;
    y: number;
    z: number;
    w: number;
}
