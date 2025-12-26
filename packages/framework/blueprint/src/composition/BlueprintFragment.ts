/**
 * @zh 蓝图片段接口和实现
 * @en Blueprint Fragment Interface and Implementation
 *
 * @zh 定义可重用的蓝图片段，用于组合系统
 * @en Defines reusable blueprint fragments for the composition system
 */

import type { BlueprintAsset } from '../types/blueprint';
import type { BlueprintPinType } from '../types/pins';

// =============================================================================
// 暴露引脚定义 | Exposed Pin Definition
// =============================================================================

/**
 * @zh 暴露引脚定义
 * @en Exposed pin definition
 *
 * @zh 片段对外暴露的引脚，可与其他片段连接
 * @en Pins exposed by the fragment that can be connected to other fragments
 */
export interface ExposedPin {
    /**
     * @zh 引脚名称
     * @en Pin name
     */
    readonly name: string;

    /**
     * @zh 显示名称
     * @en Display name
     */
    readonly displayName: string;

    /**
     * @zh 引脚类型
     * @en Pin type
     */
    readonly type: BlueprintPinType;

    /**
     * @zh 引脚方向
     * @en Pin direction
     */
    readonly direction: 'input' | 'output';

    /**
     * @zh 描述
     * @en Description
     */
    readonly description?: string;

    /**
     * @zh 默认值（仅输入引脚）
     * @en Default value (input pins only)
     */
    readonly defaultValue?: unknown;

    /**
     * @zh 关联的内部节点 ID
     * @en Associated internal node ID
     */
    readonly internalNodeId: string;

    /**
     * @zh 关联的内部引脚名称
     * @en Associated internal pin name
     */
    readonly internalPinName: string;
}

// =============================================================================
// 蓝图片段接口 | Blueprint Fragment Interface
// =============================================================================

/**
 * @zh 蓝图片段接口
 * @en Blueprint fragment interface
 *
 * @zh 代表一个可重用的蓝图逻辑单元，如技能、卡牌效果等
 * @en Represents a reusable unit of blueprint logic, such as skills, card effects, etc.
 */
export interface IBlueprintFragment {
    /**
     * @zh 片段唯一标识
     * @en Fragment unique identifier
     */
    readonly id: string;

    /**
     * @zh 片段名称
     * @en Fragment name
     */
    readonly name: string;

    /**
     * @zh 片段描述
     * @en Fragment description
     */
    readonly description?: string;

    /**
     * @zh 片段分类
     * @en Fragment category
     */
    readonly category?: string;

    /**
     * @zh 片段标签
     * @en Fragment tags
     */
    readonly tags?: string[];

    /**
     * @zh 暴露的输入引脚
     * @en Exposed input pins
     */
    readonly inputs: ExposedPin[];

    /**
     * @zh 暴露的输出引脚
     * @en Exposed output pins
     */
    readonly outputs: ExposedPin[];

    /**
     * @zh 内部蓝图图
     * @en Internal blueprint graph
     */
    readonly graph: BlueprintAsset;

    /**
     * @zh 片段版本
     * @en Fragment version
     */
    readonly version?: string;

    /**
     * @zh 图标名称
     * @en Icon name
     */
    readonly icon?: string;

    /**
     * @zh 颜色（用于可视化）
     * @en Color (for visualization)
     */
    readonly color?: string;
}

// =============================================================================
// 蓝图片段实现 | Blueprint Fragment Implementation
// =============================================================================

/**
 * @zh 蓝图片段配置
 * @en Blueprint fragment configuration
 */
export interface BlueprintFragmentConfig {
    id: string;
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    inputs?: ExposedPin[];
    outputs?: ExposedPin[];
    graph: BlueprintAsset;
    version?: string;
    icon?: string;
    color?: string;
}

/**
 * @zh 蓝图片段实现
 * @en Blueprint fragment implementation
 */
export class BlueprintFragment implements IBlueprintFragment {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly category?: string;
    readonly tags?: string[];
    readonly inputs: ExposedPin[];
    readonly outputs: ExposedPin[];
    readonly graph: BlueprintAsset;
    readonly version?: string;
    readonly icon?: string;
    readonly color?: string;

    constructor(config: BlueprintFragmentConfig) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.category = config.category;
        this.tags = config.tags;
        this.inputs = config.inputs ?? [];
        this.outputs = config.outputs ?? [];
        this.graph = config.graph;
        this.version = config.version;
        this.icon = config.icon;
        this.color = config.color;
    }

    /**
     * @zh 获取所有暴露引脚
     * @en Get all exposed pins
     */
    getAllExposedPins(): ExposedPin[] {
        return [...this.inputs, ...this.outputs];
    }

    /**
     * @zh 通过名称查找输入引脚
     * @en Find input pin by name
     */
    findInput(name: string): ExposedPin | undefined {
        return this.inputs.find(p => p.name === name);
    }

    /**
     * @zh 通过名称查找输出引脚
     * @en Find output pin by name
     */
    findOutput(name: string): ExposedPin | undefined {
        return this.outputs.find(p => p.name === name);
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建暴露引脚
 * @en Create exposed pin
 */
export function createExposedPin(
    name: string,
    type: BlueprintPinType,
    direction: 'input' | 'output',
    internalNodeId: string,
    internalPinName: string,
    options?: {
        displayName?: string;
        description?: string;
        defaultValue?: unknown;
    }
): ExposedPin {
    return {
        name,
        displayName: options?.displayName ?? name,
        type,
        direction,
        description: options?.description,
        defaultValue: options?.defaultValue,
        internalNodeId,
        internalPinName
    };
}

/**
 * @zh 创建蓝图片段
 * @en Create blueprint fragment
 */
export function createFragment(config: BlueprintFragmentConfig): IBlueprintFragment {
    return new BlueprintFragment(config);
}

// =============================================================================
// 片段资产格式 | Fragment Asset Format
// =============================================================================

/**
 * @zh 蓝图片段资产格式
 * @en Blueprint fragment asset format
 *
 * @zh 用于序列化和反序列化片段
 * @en Used for serializing and deserializing fragments
 */
export interface BlueprintFragmentAsset {
    /**
     * @zh 格式版本
     * @en Format version
     */
    version: number;

    /**
     * @zh 资产类型标识
     * @en Asset type identifier
     */
    type: 'blueprint-fragment';

    /**
     * @zh 片段数据
     * @en Fragment data
     */
    fragment: {
        id: string;
        name: string;
        description?: string;
        category?: string;
        tags?: string[];
        inputs: ExposedPin[];
        outputs: ExposedPin[];
        version?: string;
        icon?: string;
        color?: string;
    };

    /**
     * @zh 内部蓝图图
     * @en Internal blueprint graph
     */
    graph: BlueprintAsset;
}

/**
 * @zh 从资产创建片段
 * @en Create fragment from asset
 */
export function fragmentFromAsset(asset: BlueprintFragmentAsset): IBlueprintFragment {
    return new BlueprintFragment({
        ...asset.fragment,
        graph: asset.graph
    });
}

/**
 * @zh 将片段转为资产
 * @en Convert fragment to asset
 */
export function fragmentToAsset(fragment: IBlueprintFragment): BlueprintFragmentAsset {
    return {
        version: 1,
        type: 'blueprint-fragment',
        fragment: {
            id: fragment.id,
            name: fragment.name,
            description: fragment.description,
            category: fragment.category,
            tags: fragment.tags,
            inputs: fragment.inputs,
            outputs: fragment.outputs,
            version: fragment.version,
            icon: fragment.icon,
            color: fragment.color
        },
        graph: fragment.graph
    };
}
