/**
 * 虚拟节点检查器
 * Virtual Node Inspector
 *
 * 显示 FGUI 等组件内部虚拟节点的只读属性
 * Displays read-only properties of virtual nodes from components like FGUI
 */

import type { IVirtualNode } from '@esengine/editor-core';
import { Box, Eye, EyeOff, Move, Maximize2, RotateCw, Palette, Type, Image, Square, Layers, MousePointer, Sliders } from 'lucide-react';
import '../../../styles/VirtualNodeInspector.css';

interface VirtualNodeInspectorProps {
    parentEntityId: number;
    virtualNode: IVirtualNode;
}

/**
 * Format number to fixed decimal places
 * 格式化数字到固定小数位
 */
function formatNumber(value: number | undefined, decimals: number = 2): string {
    if (value === undefined || value === null) return '-';
    return value.toFixed(decimals);
}

/**
 * Property row component
 * 属性行组件
 */
function PropertyRow({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <div className="virtual-node-property-row">
            <span className="property-label">
                {icon && <span className="property-icon">{icon}</span>}
                {label}
            </span>
            <span className="property-value">{value}</span>
        </div>
    );
}

/**
 * Section component
 * 分组组件
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="virtual-node-section">
            <div className="section-header">{title}</div>
            <div className="section-content">{children}</div>
        </div>
    );
}

/**
 * Color swatch component for displaying colors
 * 颜色色块组件
 */
function ColorSwatch({ color }: { color: string }) {
    return (
        <span className="color-swatch-wrapper">
            <span
                className="color-swatch"
                style={{ backgroundColor: color }}
            />
            <span className="color-value">{color}</span>
        </span>
    );
}

/**
 * Check if a property key is for common/transform properties
 * 检查属性键是否为公共/变换属性
 */
const COMMON_PROPS = new Set([
    'className', 'x', 'y', 'width', 'height', 'alpha', 'visible',
    'touchable', 'rotation', 'scaleX', 'scaleY', 'pivotX', 'pivotY', 'grayed'
]);

/**
 * Property categories for type-specific display
 * 类型特定显示的属性分类
 */
const TYPE_SPECIFIC_SECTIONS: Record<string, { title: string; icon: React.ReactNode; props: string[] }> = {
    Graph: {
        title: '图形属性 | Graph',
        icon: <Square size={12} />,
        props: ['graphType', 'lineSize', 'lineColor', 'fillColor', 'cornerRadius', 'sides', 'startAngle']
    },
    Image: {
        title: '图像属性 | Image',
        icon: <Image size={12} />,
        props: ['color', 'flip', 'fillMethod', 'fillOrigin', 'fillClockwise', 'fillAmount']
    },
    TextField: {
        title: '文本属性 | Text',
        icon: <Type size={12} />,
        props: ['text', 'font', 'fontSize', 'color', 'align', 'valign', 'leading', 'letterSpacing',
            'bold', 'italic', 'underline', 'singleLine', 'autoSize', 'stroke', 'strokeColor']
    },
    Loader: {
        title: '加载器属性 | Loader',
        icon: <Image size={12} />,
        props: ['url', 'align', 'verticalAlign', 'fill', 'shrinkOnly', 'autoSize', 'color',
            'fillMethod', 'fillOrigin', 'fillClockwise', 'fillAmount']
    },
    Button: {
        title: '按钮属性 | Button',
        icon: <MousePointer size={12} />,
        props: ['title', 'icon', 'mode', 'selected', 'titleColor', 'titleFontSize',
            'selectedTitle', 'selectedIcon']
    },
    List: {
        title: '列表属性 | List',
        icon: <Layers size={12} />,
        props: ['defaultItem', 'itemCount', 'selectedIndex', 'scrollPane']
    },
    ProgressBar: {
        title: '进度条属性 | Progress',
        icon: <Sliders size={12} />,
        props: ['value', 'max']
    },
    Slider: {
        title: '滑块属性 | Slider',
        icon: <Sliders size={12} />,
        props: ['value', 'max']
    },
    Component: {
        title: '组件属性 | Component',
        icon: <Layers size={12} />,
        props: ['numChildren', 'numControllers', 'numTransitions']
    }
};

/**
 * Format a property value for display
 * 格式化属性值以供显示
 */
function formatPropertyValue(key: string, value: unknown): React.ReactNode {
    if (value === null || value === undefined) {
        return '-';
    }

    // Color properties - show color swatch
    if (typeof value === 'string' && (
        key.toLowerCase().includes('color') ||
        key === 'fillColor' ||
        key === 'lineColor' ||
        key === 'strokeColor' ||
        key === 'titleColor'
    )) {
        if (value.startsWith('#') || value.startsWith('rgb')) {
            return <ColorSwatch color={value} />;
        }
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    if (typeof value === 'number') {
        return formatNumber(value);
    }

    if (typeof value === 'string') {
        // Truncate long strings
        if (value.length > 50) {
            return value.substring(0, 47) + '...';
        }
        return value || '-';
    }

    return JSON.stringify(value);
}

export function VirtualNodeInspector({ parentEntityId, virtualNode }: VirtualNodeInspectorProps) {
    const { name, type, visible, x, y, width, height, data } = virtualNode;

    // Extract additional properties from data
    // 从 data 中提取额外属性
    const alpha = data.alpha as number | undefined;
    const rotation = data.rotation as number | undefined;
    const scaleX = data.scaleX as number | undefined;
    const scaleY = data.scaleY as number | undefined;
    const touchable = data.touchable as boolean | undefined;
    const grayed = data.grayed as boolean | undefined;
    const pivotX = data.pivotX as number | undefined;
    const pivotY = data.pivotY as number | undefined;

    // Get type-specific section config
    const typeSection = TYPE_SPECIFIC_SECTIONS[type];

    // Collect type-specific properties
    const typeSpecificProps: Array<{ key: string; value: unknown }> = [];
    const otherProps: Array<{ key: string; value: unknown }> = [];

    Object.entries(data).forEach(([key, value]) => {
        if (COMMON_PROPS.has(key)) {
            return; // Skip common props
        }

        if (typeSection?.props.includes(key)) {
            typeSpecificProps.push({ key, value });
        } else {
            otherProps.push({ key, value });
        }
    });

    return (
        <div className="entity-inspector virtual-node-inspector">
            {/* Header */}
            <div className="virtual-node-header">
                <Box size={16} className="header-icon" />
                <div className="header-info">
                    <div className="header-name">{name}</div>
                    <div className="header-type">{type}</div>
                </div>
                <div className="header-badge">
                    Virtual Node
                </div>
            </div>

            {/* Read-only notice */}
            <div className="virtual-node-notice">
                此节点为只读，属性由运行时动态生成
            </div>

            {/* Basic Properties */}
            <Section title="基本属性 | Basic">
                <PropertyRow
                    label="Visible"
                    value={visible ? <Eye size={14} /> : <EyeOff size={14} className="disabled" />}
                />
                {touchable !== undefined && (
                    <PropertyRow
                        label="Touchable"
                        value={touchable ? 'Yes' : 'No'}
                    />
                )}
                {grayed !== undefined && (
                    <PropertyRow
                        label="Grayed"
                        value={grayed ? 'Yes' : 'No'}
                    />
                )}
                {alpha !== undefined && (
                    <PropertyRow
                        label="Alpha"
                        value={formatNumber(alpha)}
                        icon={<Palette size={12} />}
                    />
                )}
            </Section>

            {/* Transform */}
            <Section title="变换 | Transform">
                <PropertyRow
                    label="Position"
                    value={`(${formatNumber(x)}, ${formatNumber(y)})`}
                    icon={<Move size={12} />}
                />
                <PropertyRow
                    label="Size"
                    value={`${formatNumber(width)} × ${formatNumber(height)}`}
                    icon={<Maximize2 size={12} />}
                />
                {(rotation !== undefined && rotation !== 0) && (
                    <PropertyRow
                        label="Rotation"
                        value={`${formatNumber(rotation)}°`}
                        icon={<RotateCw size={12} />}
                    />
                )}
                {(scaleX !== undefined || scaleY !== undefined) && (
                    <PropertyRow
                        label="Scale"
                        value={`(${formatNumber(scaleX ?? 1)}, ${formatNumber(scaleY ?? 1)})`}
                    />
                )}
                {(pivotX !== undefined || pivotY !== undefined) && (
                    <PropertyRow
                        label="Pivot"
                        value={`(${formatNumber(pivotX ?? 0)}, ${formatNumber(pivotY ?? 0)})`}
                    />
                )}
            </Section>

            {/* Type-Specific Properties */}
            {typeSection && typeSpecificProps.length > 0 && (
                <Section title={typeSection.title}>
                    {typeSpecificProps.map(({ key, value }) => (
                        <PropertyRow
                            key={key}
                            label={key}
                            value={formatPropertyValue(key, value)}
                            icon={key === typeSection.props[0] ? typeSection.icon : undefined}
                        />
                    ))}
                </Section>
            )}

            {/* Other Properties */}
            {otherProps.length > 0 && (
                <Section title="其他属性 | Other">
                    {otherProps.map(({ key, value }) => (
                        <PropertyRow
                            key={key}
                            label={key}
                            value={formatPropertyValue(key, value)}
                        />
                    ))}
                </Section>
            )}

            {/* Debug Info */}
            <Section title="调试信息 | Debug">
                <PropertyRow label="Parent Entity ID" value={parentEntityId} />
                <PropertyRow label="Virtual Node ID" value={virtualNode.id} />
                <PropertyRow label="Child Count" value={virtualNode.children?.length ?? 0} />
            </Section>
        </div>
    );
}
