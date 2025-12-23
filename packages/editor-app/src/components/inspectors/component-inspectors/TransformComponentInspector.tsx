import React, { useState, useEffect, useRef } from 'react';
import { Component } from '@esengine/ecs-framework';
import { IComponentInspector, ComponentInspectorContext } from '@esengine/editor-core';
import { TransformComponent } from '@esengine/engine-core';
import { ChevronDown, Lock, Unlock } from 'lucide-react';
import '../../../styles/TransformInspector.css';

interface AxisInputProps {
    axis: 'x' | 'y' | 'z';
    value: number;
    onChange: (value: number) => void;
    onChangeCommit?: (value: number) => void;  // 拖拽结束时调用 | Called when drag ends
    suffix?: string;
}

function AxisInput({ axis, value, onChange, onChangeCommit, suffix }: AxisInputProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [inputValue, setInputValue] = useState(String(value ?? 0));
    const dragStartRef = useRef({ x: 0, value: 0 });
    const currentValueRef = useRef(value ?? 0);  // 跟踪当前值 | Track current value

    useEffect(() => {
        if (!isDragging) {
            setInputValue(String(value ?? 0));
            currentValueRef.current = value ?? 0;
        }
    }, [value, isDragging]);

    const handleBarMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, value: value ?? 0 };
        currentValueRef.current = value ?? 0;
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const delta = e.clientX - dragStartRef.current.x;
            const sensitivity = e.shiftKey ? 0.01 : e.ctrlKey ? 1 : 0.1;
            const newValue = dragStartRef.current.value + delta * sensitivity;
            const rounded = Math.round(newValue * 1000) / 1000;
            currentValueRef.current = rounded;
            setInputValue(String(rounded));
            onChange(rounded);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            onChangeCommit?.(currentValueRef.current);  // 拖拽结束时通知 | Notify when drag ends
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, onChange, onChangeCommit]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        const parsed = parseFloat(inputValue);
        if (!isNaN(parsed)) {
            onChange(parsed);
        } else {
            setInputValue(String(value ?? 0));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        } else if (e.key === 'Escape') {
            setInputValue(String(value ?? 0));
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <div className={`tf-axis-input ${isDragging ? 'dragging' : ''}`}>
            <div
                className={`tf-axis-bar tf-axis-${axis}`}
                onMouseDown={handleBarMouseDown}
            />
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                onFocus={(e) => e.target.select()}
            />
            {suffix && <span className="tf-axis-suffix">{suffix}</span>}
        </div>
    );
}

// 双向箭头重置图标
function ResetIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 6H11M1 6L3 4M1 6L3 8M11 6L9 4M11 6L9 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

interface TransformRowProps {
    label: string;
    value: { x: number; y: number; z: number };
    showLock?: boolean;
    isLocked?: boolean;
    onLockChange?: (locked: boolean) => void;
    onChange: (value: { x: number; y: number; z: number }) => void;
    onChangeCommit?: () => void;  // 拖拽结束时调用 | Called when drag ends
    onReset?: () => void;
    suffix?: string;
    showDivider?: boolean;
}

function TransformRow({
    label,
    value,
    showLock = false,
    isLocked = false,
    onLockChange,
    onChange,
    onChangeCommit,
    onReset,
    suffix,
    showDivider = true
}: TransformRowProps) {
    // 使用 ref 来跟踪当前值，避免在拖拽过程中因重新渲染而丢失
    // Use ref to track current value, avoiding loss during drag re-renders
    const currentValueRef = useRef({ x: value?.x ?? 0, y: value?.y ?? 0, z: value?.z ?? 0 });

    useEffect(() => {
        currentValueRef.current = { x: value?.x ?? 0, y: value?.y ?? 0, z: value?.z ?? 0 };
    }, [value?.x, value?.y, value?.z]);

    const handleAxisChange = (axis: 'x' | 'y' | 'z', newValue: number) => {
        // 使用 ref 中的当前值，确保即使在快速拖拽时也能正确读取
        // Use current value from ref to ensure correct reading during fast dragging
        const currentX = currentValueRef.current.x;
        const currentY = currentValueRef.current.y;
        const currentZ = currentValueRef.current.z;

        let newVector: { x: number; y: number; z: number };

        if (isLocked && showLock) {
            const oldVal = axis === 'x' ? currentX : axis === 'y' ? currentY : currentZ;
            if (oldVal !== 0) {
                const ratio = newValue / oldVal;
                newVector = {
                    x: axis === 'x' ? newValue : currentX * ratio,
                    y: axis === 'y' ? newValue : currentY * ratio,
                    z: axis === 'z' ? newValue : currentZ * ratio
                };
            } else {
                newVector = {
                    x: axis === 'x' ? newValue : currentX,
                    y: axis === 'y' ? newValue : currentY,
                    z: axis === 'z' ? newValue : currentZ
                };
            }
        } else {
            newVector = {
                x: axis === 'x' ? newValue : currentX,
                y: axis === 'y' ? newValue : currentY,
                z: axis === 'z' ? newValue : currentZ
            };
        }

        currentValueRef.current = newVector;
        onChange(newVector);
    };

    return (
        <>
            <div className="tf-row">
                <button className="tf-label-btn">
                    {label}
                    <ChevronDown size={10} />
                </button>
                <div className="tf-inputs">
                    <AxisInput
                        axis="x"
                        value={value?.x ?? 0}
                        onChange={(v) => handleAxisChange('x', v)}
                        onChangeCommit={onChangeCommit}
                        suffix={suffix}
                    />
                    <AxisInput
                        axis="y"
                        value={value?.y ?? 0}
                        onChange={(v) => handleAxisChange('y', v)}
                        onChangeCommit={onChangeCommit}
                        suffix={suffix}
                    />
                    <AxisInput
                        axis="z"
                        value={value?.z ?? 0}
                        onChange={(v) => handleAxisChange('z', v)}
                        onChangeCommit={onChangeCommit}
                        suffix={suffix}
                    />
                </div>
                {showLock && (
                    <button
                        className={`tf-lock-btn ${isLocked ? 'locked' : ''}`}
                        onClick={() => onLockChange?.(!isLocked)}
                        title={isLocked ? 'Unlock' : 'Lock'}
                    >
                        {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                )}
                <button
                    className="tf-reset-btn"
                    onClick={onReset}
                    title="Reset"
                >
                    <ResetIcon />
                </button>
            </div>
            {showDivider && <div className="tf-divider" />}
        </>
    );
}

interface MobilityRowProps {
    value: 'static' | 'stationary' | 'movable';
    onChange: (value: 'static' | 'stationary' | 'movable') => void;
}

function MobilityRow({ value, onChange }: MobilityRowProps) {
    return (
        <div className="tf-mobility-row">
            <span className="tf-mobility-label">Mobility</span>
            <div className="tf-mobility-buttons">
                <button
                    className={`tf-mobility-btn ${value === 'static' ? 'active' : ''}`}
                    onClick={() => onChange('static')}
                >
                    Static
                </button>
                <button
                    className={`tf-mobility-btn ${value === 'stationary' ? 'active' : ''}`}
                    onClick={() => onChange('stationary')}
                >
                    Stationary
                </button>
                <button
                    className={`tf-mobility-btn ${value === 'movable' ? 'active' : ''}`}
                    onClick={() => onChange('movable')}
                >
                    Movable
                </button>
            </div>
        </div>
    );
}

function TransformInspectorContent({ context }: { context: ComponentInspectorContext }) {
    const transform = context.component as TransformComponent;
    const [isScaleLocked, setIsScaleLocked] = useState(false);
    const [mobility, setMobility] = useState<'static' | 'stationary' | 'movable'>('static');
    const [, forceUpdate] = useState({});

    // 拖拽过程中只更新 transform 值，不触发 UI 刷新
    // During dragging, only update transform value, don't trigger UI refresh
    const handlePositionChange = (value: { x: number; y: number; z: number }) => {
        transform.position = value;
    };

    const handleRotationChange = (value: { x: number; y: number; z: number }) => {
        transform.rotation = value;
    };

    const handleScaleChange = (value: { x: number; y: number; z: number }) => {
        transform.scale = value;
    };

    // 拖拽结束时通知外部并刷新 UI
    // Notify external and refresh UI when drag ends
    const handlePositionCommit = () => {
        context.onChange?.('position', transform.position);
        forceUpdate({});
    };

    const handleRotationCommit = () => {
        context.onChange?.('rotation', transform.rotation);
        forceUpdate({});
    };

    const handleScaleCommit = () => {
        context.onChange?.('scale', transform.scale);
        forceUpdate({});
    };

    // Reset 操作立即生效
    // Reset operations take effect immediately
    const handlePositionReset = () => {
        transform.position = { x: 0, y: 0, z: 0 };
        context.onChange?.('position', transform.position);
        forceUpdate({});
    };

    const handleRotationReset = () => {
        transform.rotation = { x: 0, y: 0, z: 0 };
        context.onChange?.('rotation', transform.rotation);
        forceUpdate({});
    };

    const handleScaleReset = () => {
        transform.scale = { x: 1, y: 1, z: 1 };
        context.onChange?.('scale', transform.scale);
        forceUpdate({});
    };

    return (
        <div className="tf-inspector">
            <TransformRow
                label="Location"
                value={transform.position}
                onChange={handlePositionChange}
                onChangeCommit={handlePositionCommit}
                onReset={handlePositionReset}
            />
            <TransformRow
                label="Rotation"
                value={transform.rotation}
                onChange={handleRotationChange}
                onChangeCommit={handleRotationCommit}
                onReset={handleRotationReset}
                suffix="°"
            />
            <TransformRow
                label="Scale"
                value={transform.scale}
                showLock
                isLocked={isScaleLocked}
                onLockChange={setIsScaleLocked}
                onChange={handleScaleChange}
                onChangeCommit={handleScaleCommit}
                onReset={handleScaleReset}
                showDivider={false}
            />
            <div className="tf-divider" />
            <MobilityRow value={mobility} onChange={setMobility} />
        </div>
    );
}

export class TransformComponentInspector implements IComponentInspector<TransformComponent> {
    readonly id = 'transform-component-inspector';
    readonly name = 'Transform Component Inspector';
    readonly priority = 100;
    readonly targetComponents = ['Transform', 'TransformComponent'];

    canHandle(component: Component): component is TransformComponent {
        return component instanceof TransformComponent ||
               component.constructor.name === 'TransformComponent' ||
               (component.constructor as any).componentName === 'Transform';
    }

    render(context: ComponentInspectorContext): React.ReactElement {
        return React.createElement(TransformInspectorContent, {
            context,
            key: `transform-${context.version}`
        });
    }
}
