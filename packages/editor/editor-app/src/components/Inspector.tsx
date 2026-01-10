import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Plus, ChevronRight, ChevronDown, Box, Trash2, Lock, Unlock, Image, Eye, Code, Move, Layers, Settings } from 'lucide-react';
import { getEditorEngine, type ComponentInfo, type ComponentPropertyInfo } from '../services/engine';
import '../styles/EntityInspector.css';

interface ComponentData {
    name: string;
    icon: string;
    type: string;
    enabled: boolean;
    properties: PropertyData[];
    expanded: boolean;
}

interface PropertyData {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'vector2' | 'vector3' | 'color' | 'object' | 'array' | 'asset' | 'node' | 'component' | 'enum' | 'size' | 'rect';
    value: unknown;
    editable: boolean;
    // 装饰器元数据
    displayName?: string;
    displayOrder?: number;
    tooltip?: string;
    group?: string | { id: string; name: string; displayOrder?: number };
    min?: number;
    max?: number;
    step?: number;
    slide?: boolean;
    multiline?: boolean;
    unit?: string;
    radian?: boolean;
    // 资源类型过滤
    assetType?: string;
    extensions?: string[];
    // 数组元素类型
    arrayElementType?: string;
}

/**
 * @zh 拖拽数据格式
 * @en Drag data format
 */
interface DragData {
    type: 'asset' | 'node';
    path?: string;
    name?: string;
    extension?: string;
    assetType?: string;
    uuid?: string;
    nodeType?: string;
}

interface InspectorProps {
    entityId?: string | null;
    entityName?: string;
}

// Checkbox Component
function Checkbox({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            className={`property-checkbox ${checked ? 'property-checkbox-checked' : ''} ${disabled ? 'property-checkbox-disabled' : ''}`}
            onClick={(e) => {
                e.stopPropagation(); // 防止事件冒泡
                if (!disabled) onChange(!checked);
            }}
            type="button"
            disabled={disabled}
        >
            {checked && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            )}
        </button>
    );
}

/**
 * @zh 可拖拽放置的引用字段
 * @en Droppable reference field
 */
function DroppableRefField({
    value,
    acceptType,
    assetType,
    extensions,
    icon,
    placeholder,
    onChange,
    onClear,
}: {
    value: { name?: string; uuid?: string; path?: string; type?: string } | null;
    acceptType: 'asset' | 'node' | 'both';
    assetType?: string;
    extensions?: string[];
    icon: React.ReactNode;
    placeholder: string;
    onChange: (data: DragData) => void;
    onClear: () => void;
}) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // 在 dragover 期间，浏览器可能限制对数据的访问
        // 通过检查 types 来判断是否是有效的拖拽
        // During dragover, browsers may restrict access to data
        // Check types to determine if it's a valid drag
        if (e.dataTransfer.types.includes('application/json')) {
            e.dataTransfer.dropEffect = 'copy';
            setIsDragOver(true);
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types.includes('application/json')) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const jsonData = e.dataTransfer.getData('application/json');
        if (jsonData) {
            try {
                const data = JSON.parse(jsonData) as DragData;
                // 验证类型
                if (acceptType === 'both' || data.type === acceptType) {
                    if (data.type === 'asset' && assetType && data.assetType !== assetType) {
                        console.warn(`Asset type mismatch: expected ${assetType}, got ${data.assetType}`);
                        return;
                    }
                    if (data.type === 'asset' && extensions?.length && data.extension) {
                        if (!extensions.includes(`.${data.extension}`)) {
                            console.warn(`Extension not allowed: ${data.extension}`);
                            return;
                        }
                    }
                    onChange(data);
                }
            } catch (err) {
                console.error('Failed to parse drop data:', err);
            }
        }
    };

    const displayName = value?.name || value?.uuid?.substring(0, 8) || placeholder;
    const hasValue = !!(value?.name || value?.uuid || value?.path);

    return (
        <div
            className={`property-ref-field ${isDragOver ? 'drag-over' : ''} ${hasValue ? 'has-value' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <span className="property-ref-icon">{icon}</span>
            <span className="property-ref-name" title={value?.path || value?.uuid}>
                {displayName}
            </span>
            {hasValue && (
                <button
                    className="property-ref-clear"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear();
                    }}
                    title="Clear"
                >
                    ×
                </button>
            )}
        </div>
    );
}

// HSV to RGB conversion
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

// RGB to HSV conversion
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    if (max !== min) {
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        else if (max === g) h = ((b - r) / d + 2) * 60;
        else h = ((r - g) / d + 4) * 60;
    }
    return [h, s, v];
}

// Hex to RGB
function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result && result[1] && result[2] && result[3]) {
        return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
    }
    return [255, 255, 255];
}

// RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Color Field Component with custom picker
function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [hexValue, setHexValue] = useState(value);
    const [displayColor, setDisplayColor] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);
    const saturationRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);

    const [r, g, b] = hexToRgb(value);
    const [hue, sat, val] = rgbToHsv(r, g, b);
    const [currentHue, setCurrentHue] = useState(hue);
    const [currentSat, setCurrentSat] = useState(sat);
    const [currentVal, setCurrentVal] = useState(val);

    const updateColor = (h: number, s: number, v: number) => {
        const [nr, ng, nb] = hsvToRgb(h, s, v);
        const hex = rgbToHex(nr, ng, nb);
        setHexValue(hex);
        setDisplayColor(hex);
        onChange(hex);
    };

    const handleSaturationMouseDown = (e: React.MouseEvent) => {
        const rect = saturationRef.current?.getBoundingClientRect();
        if (!rect) return;
        const handleMove = (e: MouseEvent) => {
            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
            setCurrentSat(x);
            setCurrentVal(1 - y);
            updateColor(currentHue, x, 1 - y);
        };
        handleMove(e.nativeEvent);
        const handleUp = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
        };
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
    };

    const handleHueMouseDown = (e: React.MouseEvent) => {
        const rect = hueRef.current?.getBoundingClientRect();
        if (!rect) return;
        const handleMove = (e: MouseEvent) => {
            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const h = x * 360;
            setCurrentHue(h);
            updateColor(h, currentSat, currentVal);
        };
        handleMove(e.nativeEvent);
        const handleUp = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
        };
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
    };

    const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        setHexValue(hex);
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            setDisplayColor(hex);
            onChange(hex);
            const [r, g, b] = hexToRgb(hex);
            const [h, s, v] = rgbToHsv(r, g, b);
            setCurrentHue(h);
            setCurrentSat(s);
            setCurrentVal(v);
        }
    };

    // Close picker when clicking outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const hueColor = `hsl(${currentHue}, 100%, 50%)`;

    return (
        <div className="property-color-wrapper" ref={containerRef}>
            <div
                className="property-color-preview"
                style={{ backgroundColor: displayColor }}
                onClick={() => setIsOpen(!isOpen)}
            />
            <input
                type="text"
                className="property-input-color-text"
                value={hexValue}
                onChange={handleHexInput}
            />
            {isOpen && (
                <div className="color-picker-popup">
                    <div
                        ref={saturationRef}
                        className="color-picker-saturation"
                        style={{ backgroundColor: hueColor }}
                        onMouseDown={handleSaturationMouseDown}
                    >
                        <div className="color-picker-saturation-white" />
                        <div className="color-picker-saturation-black" />
                        <div
                            className="color-picker-cursor"
                            style={{ left: `${currentSat * 100}%`, top: `${(1 - currentVal) * 100}%` }}
                        />
                    </div>
                    <div
                        ref={hueRef}
                        className="color-picker-hue"
                        onMouseDown={handleHueMouseDown}
                    >
                        <div
                            className="color-picker-hue-cursor"
                            style={{ left: `${(currentHue / 360) * 100}%` }}
                        />
                    </div>
                    <div className="color-picker-preview-row">
                        <div className="color-picker-preview-box" style={{ backgroundColor: displayColor }} />
                        <span className="color-picker-hex">{hexValue.toUpperCase()}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// Get Lucide icon component for component type
function ComponentIcon({ type }: { type: string }) {
    const name = type.toLowerCase();

    // Node 组件
    if (name === 'node') {
        return <Layers size={14} />;
    }
    // Transform 相关
    if (name.includes('transform') || name.includes('uitransform')) {
        return <Move size={14} />;
    }
    // Sprite 相关
    if (name.includes('sprite')) {
        return <Image size={14} />;
    }
    // Camera 相关
    if (name.includes('camera')) {
        return <Eye size={14} />;
    }
    // Script 相关
    if (name.includes('script')) {
        return <Code size={14} />;
    }
    // 默认使用设置图标
    return <Settings size={14} />;
}

export function Inspector({ entityId, entityName = 'Entity' }: InspectorProps) {
    const [components, setComponents] = useState<ComponentData[]>([]);
    const [nodeName, setNodeName] = useState(entityName);
    const [nodeActive, setNodeActive] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const engine = getEditorEngine();

    // Load component data when selection changes
    const loadComponentData = useCallback(() => {
        const nodeInfo = engine.getSelectedNodeInfo();
        if (!nodeInfo) {
            setComponents([]);
            return;
        }

        setNodeName(nodeInfo.name);
        setNodeActive(nodeInfo.active);

        // Convert ComponentInfo[] to ComponentData[]
        const componentData: ComponentData[] = nodeInfo.components.map((comp: ComponentInfo) => ({
            name: comp.name,
            icon: comp.type, // 用 type 作为 icon 标识，实际图标在 ComponentIcon 中决定
            type: comp.type,
            enabled: comp.enabled,
            properties: comp.properties.map((prop: ComponentPropertyInfo) => ({
                name: prop.name,
                type: prop.type,
                value: prop.value,
                editable: prop.editable,
                // 复制装饰器元数据
                displayName: prop.displayName,
                displayOrder: prop.displayOrder,
                tooltip: prop.tooltip,
                group: prop.group,
                min: prop.min,
                max: prop.max,
                step: prop.step,
                slide: prop.slide,
                multiline: prop.multiline,
                unit: prop.unit,
                radian: prop.radian,
                // 资源引用过滤
                assetType: prop.assetType,
                extensions: prop.extensions,
                // 数组元素类型
                arrayElementType: prop.arrayElementType,
            })),
            expanded: true // Start expanded by default
        }));

        setComponents(componentData);
    }, [engine]);

    // Listen for selection changes
    useEffect(() => {
        if (isLocked) return; // Don't update if locked

        loadComponentData();

        const handleSelectionChanged = () => {
            loadComponentData();
        };

        engine.onSelectionChanged(handleSelectionChanged);
        return () => {
            engine.offSelectionChanged(handleSelectionChanged);
        };
    }, [engine, isLocked, loadComponentData]);

    // Also reload when entityId changes
    useEffect(() => {
        if (!isLocked && entityId) {
            loadComponentData();
        }
    }, [entityId, isLocked, loadComponentData]);

    const toggleComponent = (name: string) => {
        setComponents(components.map(c =>
            c.name === name ? { ...c, expanded: !c.expanded } : c
        ));
    };

    if (!entityId) {
        return (
            <div className="entity-inspector">
                <div className="empty-inspector">
                    <Box size={48} className="empty-icon" />
                    <div className="empty-title">No Entity Selected</div>
                    <div className="empty-hint">Select an entity in the hierarchy to view its properties</div>
                </div>
            </div>
        );
    }

    const renderVector3Input = (value: { x: number; y: number; z: number }, label: string) => (
        <div className="transform-row">
            <div className="transform-row-label">
                <span className="transform-label-text">{label}</span>
            </div>
            <div className="property-vector-compact">
                <div className="property-vector-axis-compact">
                    <span className="property-vector-axis-label property-vector-axis-x" />
                    <input
                        type="number"
                        className="property-input-number-compact"
                        defaultValue={value.x}
                        step="0.1"
                    />
                </div>
                <div className="property-vector-axis-compact">
                    <span className="property-vector-axis-label property-vector-axis-y" />
                    <input
                        type="number"
                        className="property-input-number-compact"
                        defaultValue={value.y}
                        step="0.1"
                    />
                </div>
                <div className="property-vector-axis-compact">
                    <span className="property-vector-axis-label property-vector-axis-z" />
                    <input
                        type="number"
                        className="property-input-number-compact"
                        defaultValue={value.z}
                        step="0.1"
                    />
                </div>
            </div>
        </div>
    );

    /**
     * @zh 获取属性的显示标签
     * @en Get property display label
     */
    const getPropertyLabel = (prop: PropertyData): string => {
        let label = prop.displayName || prop.name;
        // 如果是弧度属性，添加角度标识
        if (prop.radian) {
            label += ' (°)';
        }
        return label;
    };

    /**
     * @zh 渲染带有 tooltip 和 unit 的标签
     * @en Render label with tooltip and unit
     */
    const renderLabel = (prop: PropertyData) => (
        <span
            className="property-label"
            title={prop.tooltip}
            style={prop.tooltip ? { cursor: 'help', textDecoration: 'underline dotted' } : undefined}
        >
            {getPropertyLabel(prop)}
            {prop.unit && <span className="property-unit">{prop.unit}</span>}
        </span>
    );

    const renderPropertyValue = (prop: PropertyData) => {
        switch (prop.type) {
            case 'vector3':
                return renderVector3Input(prop.value as { x: number; y: number; z: number }, getPropertyLabel(prop));

            case 'vector2': {
                const v2 = prop.value as { x: number; y: number };
                return (
                    <div className="property-field simple-field" title={prop.tooltip}>
                        {renderLabel(prop)}
                        <div className="property-vector-compact">
                            <div className="property-vector-axis-compact">
                                <span className="property-vector-axis-label property-vector-axis-x" />
                                <input
                                    type="number"
                                    className="property-input-number-compact"
                                    defaultValue={v2.x?.toFixed(2)}
                                    step={prop.step ?? 0.1}
                                />
                            </div>
                            <div className="property-vector-axis-compact">
                                <span className="property-vector-axis-label property-vector-axis-y" />
                                <input
                                    type="number"
                                    className="property-input-number-compact"
                                    defaultValue={v2.y?.toFixed(2)}
                                    step={prop.step ?? 0.1}
                                />
                            </div>
                        </div>
                    </div>
                );
            }

            case 'size': {
                const size = prop.value as { width: number; height: number };
                return (
                    <div className="property-field simple-field" title={prop.tooltip}>
                        {renderLabel(prop)}
                        <div className="property-vector-compact">
                            <div className="property-vector-axis-compact">
                                <span className="property-vector-axis-label property-vector-axis-w">W</span>
                                <input
                                    type="number"
                                    className="property-input-number-compact"
                                    defaultValue={size.width?.toFixed(0)}
                                    step={prop.step ?? 1}
                                />
                            </div>
                            <div className="property-vector-axis-compact">
                                <span className="property-vector-axis-label property-vector-axis-h">H</span>
                                <input
                                    type="number"
                                    className="property-input-number-compact"
                                    defaultValue={size.height?.toFixed(0)}
                                    step={prop.step ?? 1}
                                />
                            </div>
                        </div>
                    </div>
                );
            }

            case 'rect': {
                const rect = prop.value as { x: number; y: number; width: number; height: number };
                return (
                    <div className="property-field simple-field" title={prop.tooltip}>
                        {renderLabel(prop)}
                        <div className="property-rect-compact">
                            <div className="property-rect-row">
                                <span className="property-rect-label">X</span>
                                <input type="number" className="property-input-number-compact" defaultValue={rect.x?.toFixed(2)} step="0.1" />
                                <span className="property-rect-label">Y</span>
                                <input type="number" className="property-input-number-compact" defaultValue={rect.y?.toFixed(2)} step="0.1" />
                            </div>
                            <div className="property-rect-row">
                                <span className="property-rect-label">W</span>
                                <input type="number" className="property-input-number-compact" defaultValue={rect.width?.toFixed(2)} step="0.1" />
                                <span className="property-rect-label">H</span>
                                <input type="number" className="property-input-number-compact" defaultValue={rect.height?.toFixed(2)} step="0.1" />
                            </div>
                        </div>
                    </div>
                );
            }

            case 'enum': {
                const enumVal = prop.value as { value: number; name: string; options: Array<{ name: string; value: number }> };
                return (
                    <div className="property-field simple-field" title={prop.tooltip}>
                        {renderLabel(prop)}
                        <div className="property-select-wrapper">
                            <select
                                className="property-select"
                                defaultValue={enumVal.value}
                                disabled={!prop.editable}
                            >
                                {enumVal.options?.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                );
            }

            case 'boolean':
                return (
                    <div className="property-field simple-field property-field-boolean" title={prop.tooltip}>
                        {renderLabel(prop)}
                        <Checkbox
                            checked={prop.value as boolean}
                            onChange={() => {/* handle change */}}
                        />
                    </div>
                );

            case 'color': {
                const colorVal = prop.value as { hex?: string; r?: number; g?: number; b?: number } | string;
                const hexColor = typeof colorVal === 'string' ? colorVal : (colorVal.hex || '#ffffff');
                return (
                    <div className="property-field simple-field" title={prop.tooltip}>
                        {renderLabel(prop)}
                        <ColorField
                            value={hexColor}
                            onChange={() => {/* handle change */}}
                        />
                    </div>
                );
            }

            case 'number': {
                const value = prop.value as number;
                const step = prop.step ?? 0.1;
                const hasRange = prop.min !== undefined || prop.max !== undefined;
                const showSlider = prop.slide && hasRange;

                if (showSlider) {
                    return (
                        <div className="property-field simple-field" title={prop.tooltip}>
                            {renderLabel(prop)}
                            <div className="property-slider-wrapper">
                                <input
                                    type="range"
                                    className="property-slider"
                                    defaultValue={value}
                                    min={prop.min ?? 0}
                                    max={prop.max ?? 100}
                                    step={step}
                                />
                                <input
                                    type="number"
                                    className="property-input-number-small"
                                    defaultValue={value}
                                    min={prop.min}
                                    max={prop.max}
                                    step={step}
                                />
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="property-field simple-field" title={prop.tooltip}>
                        {renderLabel(prop)}
                        <input
                            type="number"
                            className="property-input property-input-number"
                            defaultValue={typeof value === 'number' ? value : 0}
                            readOnly={!prop.editable}
                            min={prop.min}
                            max={prop.max}
                            step={step}
                        />
                    </div>
                );
            }

            case 'string': {
                // 多行文本使用 textarea
                if (prop.multiline) {
                    return (
                        <div className="property-field property-field-multiline" title={prop.tooltip}>
                            {renderLabel(prop)}
                            <textarea
                                className="property-textarea"
                                defaultValue={String(prop.value)}
                                readOnly={!prop.editable}
                                rows={3}
                            />
                        </div>
                    );
                }
                return (
                    <div className="property-field simple-field" title={prop.tooltip}>
                        {renderLabel(prop)}
                        <input
                            type="text"
                            className="property-input property-input-text"
                            defaultValue={String(prop.value)}
                            readOnly={!prop.editable}
                        />
                    </div>
                );
            }

            case 'asset': {
                const assetVal = prop.value as { uuid?: string; name?: string; path?: string; type?: string } | string | null;
                const refValue = typeof assetVal === 'string'
                    ? { uuid: assetVal, name: undefined, path: undefined }
                    : assetVal;
                const assetTypeName = prop.assetType || 'Asset';
                return (
                    <div className="property-field simple-field" title={prop.tooltip}>
                        {renderLabel(prop)}
                        <DroppableRefField
                            value={refValue}
                            acceptType="asset"
                            assetType={prop.assetType}
                            extensions={prop.extensions}
                            icon={<Image size={12} />}
                            placeholder={`None (${assetTypeName})`}
                            onChange={(data) => {
                                // TODO: Call engine to set property value
                            }}
                            onClear={() => {
                                // TODO: Call engine to clear property value
                            }}
                        />
                    </div>
                );
            }

            case 'node': {
                const nodeVal = prop.value as { uuid?: string; name?: string } | string | null;
                const refValue = typeof nodeVal === 'string'
                    ? { uuid: nodeVal, name: undefined }
                    : nodeVal;
                return (
                    <div className="property-field simple-field" title={prop.tooltip}>
                        {renderLabel(prop)}
                        <DroppableRefField
                            value={refValue}
                            acceptType="node"
                            icon={<Layers size={12} />}
                            placeholder="None (Node)"
                            onChange={(data) => {
                                // TODO: Call engine to set property value
                            }}
                            onClear={() => {
                                // TODO: Call engine to clear property value
                            }}
                        />
                    </div>
                );
            }

            case 'component': {
                const compVal = prop.value as { uuid?: string; name?: string; type?: string } | string | null;
                const refValue = typeof compVal === 'string'
                    ? { uuid: compVal, name: undefined }
                    : compVal;
                return (
                    <div className="property-field simple-field" title={prop.tooltip}>
                        {renderLabel(prop)}
                        <DroppableRefField
                            value={refValue}
                            acceptType="node"
                            icon={<Settings size={12} />}
                            placeholder="None (Component)"
                            onChange={(data) => {
                                // TODO: Call engine to set property value
                            }}
                            onClear={() => {
                                // TODO: Call engine to clear property value
                            }}
                        />
                    </div>
                );
            }

            case 'array': {
                const arrayVal = prop.value as {
                    items?: Array<{
                        index: number;
                        target?: string;
                        component?: string;
                        handler?: string;
                        customEventData?: string;
                    }>;
                    length: number;
                    elementType?: string;
                };
                const isEventHandler = arrayVal.elementType === 'ComponentEventHandler' || arrayVal.elementType === 'EventHandler';

                if (isEventHandler && arrayVal.items) {
                    return (
                        <div className="property-field property-field-array" title={prop.tooltip}>
                            <div className="property-array-header">
                                {renderLabel(prop)}
                                <span className="property-array-count">[{arrayVal.length}]</span>
                                <button className="property-array-add-btn" title="Add Event">
                                    <Plus size={10} />
                                </button>
                            </div>
                            <div className="property-array-items">
                                {arrayVal.items.map((item, idx) => (
                                    <div key={idx} className="property-event-item">
                                        <div className="property-event-row">
                                            <span className="property-event-label">Target</span>
                                            <input
                                                type="text"
                                                className="property-input property-input-text"
                                                defaultValue={item.target || ''}
                                                placeholder="Node"
                                                readOnly
                                            />
                                        </div>
                                        <div className="property-event-row">
                                            <span className="property-event-label">Component</span>
                                            <input
                                                type="text"
                                                className="property-input property-input-text"
                                                defaultValue={item.component || ''}
                                                placeholder="Component"
                                                readOnly
                                            />
                                        </div>
                                        <div className="property-event-row">
                                            <span className="property-event-label">Handler</span>
                                            <input
                                                type="text"
                                                className="property-input property-input-text"
                                                defaultValue={item.handler || ''}
                                                placeholder="Handler"
                                                readOnly
                                            />
                                        </div>
                                        {item.customEventData && (
                                            <div className="property-event-row">
                                                <span className="property-event-label">Data</span>
                                                <input
                                                    type="text"
                                                    className="property-input property-input-text"
                                                    defaultValue={item.customEventData}
                                                    placeholder="Custom Data"
                                                    readOnly
                                                />
                                            </div>
                                        )}
                                        <button className="property-event-remove-btn" title="Remove">
                                            <Trash2 size={10} />
                                        </button>
                                    </div>
                                ))}
                                {arrayVal.length === 0 && (
                                    <div className="property-array-empty">
                                        No events. Click + to add.
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }

                // 其他数组类型显示为只读
                return (
                    <div className="property-field simple-field" title={prop.tooltip}>
                        {renderLabel(prop)}
                        <span className="property-readonly">
                            [{arrayVal.length} {arrayVal.elementType || 'items'}]
                        </span>
                    </div>
                );
            }

            case 'object':
                return (
                    <div className="property-field simple-field" title={prop.tooltip}>
                        {renderLabel(prop)}
                        <span className="property-readonly">{String(prop.value)}</span>
                    </div>
                );

            default:
                return (
                    <div className="property-field simple-field" title={prop.tooltip}>
                        {renderLabel(prop)}
                        <input
                            type="text"
                            className="property-input property-input-text"
                            defaultValue={String(prop.value)}
                            readOnly={!prop.editable}
                        />
                    </div>
                );
        }
    };

    // Filter components based on search query
    const filteredComponents = components.filter(comp => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        if (comp.name.toLowerCase().includes(query)) return true;
        return comp.properties.some(prop => prop.name.toLowerCase().includes(query));
    });

    return (
        <div className="entity-inspector">
            <div className="inspector-header">
                <div className="inspector-header-left">
                    <Checkbox
                        checked={nodeActive}
                        onChange={(v) => setNodeActive(v)}
                    />
                    <span className="entity-name">{nodeName || entityName}</span>
                </div>
                <button
                    className={`inspector-lock-btn ${isLocked ? 'locked' : ''}`}
                    onClick={() => setIsLocked(!isLocked)}
                    title={isLocked ? 'Unlock Inspector' : 'Lock Inspector'}
                >
                    {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
            </div>

            <div className="inspector-search">
                <Search size={12} />
                <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="inspector-content">
                {filteredComponents.length === 0 && components.length === 0 && (
                    <div className="no-components">
                        <span>No components</span>
                    </div>
                )}
                {filteredComponents.map(component => (
                    <div key={`${component.type}-${component.name}`} className={`component-item-card ${component.expanded ? 'expanded' : ''}`}>
                        <div
                            className="component-item-header"
                            onClick={() => toggleComponent(component.name)}
                        >
                            <span className="component-expand-icon">
                                {component.expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </span>
                            <span className="component-icon">
                                <ComponentIcon type={component.type} />
                            </span>
                            <span className="component-item-name">{component.name}</span>
                            <Checkbox
                                checked={component.enabled}
                                onChange={() => {/* TODO: toggle component enabled */}}
                            />
                            <button className="component-remove-btn" onClick={(e) => e.stopPropagation()}>
                                <Trash2 size={12} />
                            </button>
                        </div>
                        {component.expanded && (
                            <div className="component-item-content">
                                {component.name === 'Transform' ? (
                                    <div className="transform-section-content">
                                        {component.properties.map(prop => (
                                            <div key={prop.name}>
                                                {renderPropertyValue(prop)}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    component.properties.map(prop => (
                                        <div key={prop.name}>
                                            {renderPropertyValue(prop)}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                ))}

                <div className="section-title-with-action" style={{ padding: '12px 10px', marginTop: '4px' }}>
                    <button className="add-component-trigger">
                        <Plus size={14} />
                        <span>Add Component</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
