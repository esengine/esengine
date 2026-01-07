import { useState, useRef, useEffect } from 'react';
import { Search, Plus, ChevronRight, ChevronDown, Box, Trash2, Lock, Unlock } from 'lucide-react';
import '../styles/EntityInspector.css';

interface ComponentData {
    name: string;
    icon: string;
    properties: PropertyData[];
    expanded: boolean;
}

interface PropertyData {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'vector2' | 'vector3' | 'color';
    value: unknown;
}

interface InspectorProps {
    entityId?: number | null;
    entityName?: string;
}

// Toggle Switch Component
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            className={`property-toggle ${checked ? 'property-toggle-on' : 'property-toggle-off'}`}
            onClick={() => onChange(!checked)}
            type="button"
        >
            <span className="property-toggle-thumb" />
        </button>
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

export function Inspector({ entityId, entityName = 'Entity' }: InspectorProps) {
    const [components, setComponents] = useState<ComponentData[]>([]);
    const [isLocked, setIsLocked] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    const renderPropertyValue = (prop: PropertyData) => {
        switch (prop.type) {
            case 'vector3':
                return renderVector3Input(prop.value as { x: number; y: number; z: number }, prop.name);
            case 'vector2':
                const v2 = prop.value as { x: number; y: number };
                return (
                    <div className="property-field simple-field">
                        <span className="property-label">{prop.name}</span>
                        <div className="property-vector-compact">
                            <div className="property-vector-axis-compact">
                                <span className="property-vector-axis-label property-vector-axis-x" />
                                <input
                                    type="number"
                                    className="property-input-number-compact"
                                    defaultValue={v2.x}
                                    step="0.1"
                                />
                            </div>
                            <div className="property-vector-axis-compact">
                                <span className="property-vector-axis-label property-vector-axis-y" />
                                <input
                                    type="number"
                                    className="property-input-number-compact"
                                    defaultValue={v2.y}
                                    step="0.1"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'boolean':
                return (
                    <div className="property-field simple-field property-field-boolean">
                        <span className="property-label">{prop.name}</span>
                        <ToggleSwitch
                            checked={prop.value as boolean}
                            onChange={() => {/* handle change */}}
                        />
                    </div>
                );
            case 'color':
                return (
                    <div className="property-field simple-field">
                        <span className="property-label">{prop.name}</span>
                        <ColorField
                            value={prop.value as string}
                            onChange={() => {/* handle change */}}
                        />
                    </div>
                );
            case 'number':
                return (
                    <div className="property-field simple-field">
                        <span className="property-label">{prop.name}</span>
                        <input
                            type="number"
                            className="property-input property-input-number"
                            defaultValue={prop.value as number}
                        />
                    </div>
                );
            default:
                return (
                    <div className="property-field simple-field">
                        <span className="property-label">{prop.name}</span>
                        <input
                            type="text"
                            className="property-input property-input-text"
                            defaultValue={String(prop.value)}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="entity-inspector">
            <div className="inspector-header">
                <div className="inspector-header-left">
                    <Box size={14} />
                    <span className="entity-name">{entityName}</span>
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
                {components.map(component => (
                    <div key={component.name} className={`component-item-card ${component.expanded ? 'expanded' : ''}`}>
                        <div
                            className="component-item-header"
                            onClick={() => toggleComponent(component.name)}
                        >
                            <span className="component-expand-icon">
                                {component.expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </span>
                            <span className="component-icon">
                                <Box size={14} />
                            </span>
                            <span className="component-item-name">{component.name}</span>
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

                <div className="section-title-with-action" style={{ padding: '8px', marginTop: '8px' }}>
                    <button className="add-component-trigger">
                        <Plus size={12} />
                        <span>Add Component</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
