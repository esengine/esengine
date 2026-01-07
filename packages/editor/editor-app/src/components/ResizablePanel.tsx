import { useState, useRef, useEffect, ReactNode } from 'react';
import '../styles/ResizablePanel.css';

interface ResizablePanelProps {
    direction: 'horizontal' | 'vertical';
    leftOrTop: ReactNode;
    rightOrBottom: ReactNode;
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
    side?: 'left' | 'right' | 'top' | 'bottom';
    storageKey?: string;
}

export function ResizablePanel({
    direction,
    leftOrTop,
    rightOrBottom,
    defaultSize = 250,
    minSize = 150,
    maxSize = 600,
    side = 'left',
    storageKey
}: ResizablePanelProps) {
    const getInitialSize = () => {
        if (storageKey) {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsedSize = parseInt(saved, 10);
                if (!isNaN(parsedSize)) {
                    return Math.max(minSize, Math.min(maxSize, parsedSize));
                }
            }
        }
        return defaultSize;
    };

    const [size, setSize] = useState(getInitialSize);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (storageKey && !isDragging) {
            localStorage.setItem(storageKey, size.toString());
        }
    }, [size, isDragging, storageKey]);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            let newSize: number;

            if (direction === 'horizontal') {
                if (side === 'right') {
                    newSize = rect.right - e.clientX;
                } else {
                    newSize = e.clientX - rect.left;
                }
            } else {
                if (side === 'bottom') {
                    newSize = rect.bottom - e.clientY;
                } else {
                    newSize = e.clientY - rect.top;
                }
            }

            newSize = Math.max(minSize, Math.min(maxSize, newSize));
            setSize(newSize);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.classList.remove('resizing', 'resizing-vertical');
        };

        document.body.classList.add(direction === 'horizontal' ? 'resizing' : 'resizing-vertical');
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.classList.remove('resizing', 'resizing-vertical');
        };
    }, [isDragging, direction, minSize, maxSize, side]);

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const className = `resizable-panel resizable-panel-${direction}`;
    const resizerClassName = `resizer resizer-${direction}${isDragging ? ' active' : ''}`;

    if (direction === 'horizontal') {
        if (side === 'right') {
            return (
                <div ref={containerRef} className={className}>
                    <div className="panel-section" style={{ flex: 1 }}>
                        {leftOrTop}
                    </div>
                    <div
                        className={resizerClassName}
                        onMouseDown={handleMouseDown}
                    >
                        <div className="resizer-handle" />
                    </div>
                    <div className="panel-section" style={{ width: `${size}px` }}>
                        {rightOrBottom}
                    </div>
                </div>
            );
        } else {
            return (
                <div ref={containerRef} className={className}>
                    <div className="panel-section" style={{ width: `${size}px` }}>
                        {leftOrTop}
                    </div>
                    <div
                        className={resizerClassName}
                        onMouseDown={handleMouseDown}
                    >
                        <div className="resizer-handle" />
                    </div>
                    <div className="panel-section" style={{ flex: 1 }}>
                        {rightOrBottom}
                    </div>
                </div>
            );
        }
    } else {
        if (side === 'bottom') {
            return (
                <div ref={containerRef} className={className}>
                    <div className="panel-section" style={{ flex: 1 }}>
                        {leftOrTop}
                    </div>
                    <div
                        className={resizerClassName}
                        onMouseDown={handleMouseDown}
                    >
                        <div className="resizer-handle" />
                    </div>
                    <div className="panel-section" style={{ height: `${size}px` }}>
                        {rightOrBottom}
                    </div>
                </div>
            );
        } else {
            return (
                <div ref={containerRef} className={className}>
                    <div className="panel-section" style={{ height: `${size}px` }}>
                        {leftOrTop}
                    </div>
                    <div
                        className={resizerClassName}
                        onMouseDown={handleMouseDown}
                    >
                        <div className="resizer-handle" />
                    </div>
                    <div className="panel-section" style={{ flex: 1 }}>
                        {rightOrBottom}
                    </div>
                </div>
            );
        }
    }
}
