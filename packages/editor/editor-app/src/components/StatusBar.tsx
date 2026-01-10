import { useState, useCallback } from 'react';
import { FolderOpen, Terminal, ChevronDown, ChevronUp, X, LayoutGrid } from 'lucide-react';
import { ContentBrowser } from './ContentBrowser';
import '../styles/StatusBar.css';

interface StatusBarProps {
    projectPath?: string;
    onOpenScene?: (scenePath: string) => void;
}

export function StatusBar({ projectPath, onOpenScene }: StatusBarProps) {
    const [contentDrawerOpen, setContentDrawerOpen] = useState(false);
    const [outputDrawerOpen, setOutputDrawerOpen] = useState(false);
    const [drawerHeight, setDrawerHeight] = useState(300);

    const handleContentDrawerClick = useCallback(() => {
        setContentDrawerOpen(!contentDrawerOpen);
        if (!contentDrawerOpen) {
            setOutputDrawerOpen(false);
        }
    }, [contentDrawerOpen]);

    const handleOutputClick = useCallback(() => {
        setOutputDrawerOpen(!outputDrawerOpen);
        if (!outputDrawerOpen) {
            setContentDrawerOpen(false);
        }
    }, [outputDrawerOpen]);

    return (
        <>
            {/* Drawer Backdrop */}
            {(contentDrawerOpen || outputDrawerOpen) && (
                <div
                    className="drawer-backdrop"
                    onClick={() => {
                        setContentDrawerOpen(false);
                        setOutputDrawerOpen(false);
                    }}
                />
            )}

            {/* Content Drawer */}
            <div
                className={`drawer-panel content-drawer-panel ${contentDrawerOpen ? 'open' : ''}`}
                style={{ height: contentDrawerOpen ? drawerHeight : 0 }}
            >
                <div className="drawer-resize-handle" />
                <div className="drawer-header">
                    <div className="drawer-title">
                        <FolderOpen size={14} />
                        <span>Content Browser</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button
                            className="drawer-close"
                            title="Dock in Layout"
                        >
                            <LayoutGrid size={14} />
                        </button>
                        <button
                            className="drawer-close"
                            onClick={() => setContentDrawerOpen(false)}
                            title="Close"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
                <div className="drawer-body">
                    <ContentBrowser
                        isDrawer
                        projectPath={projectPath}
                        onOpenScene={onOpenScene}
                    />
                </div>
            </div>

            {/* Output Log Drawer */}
            <div
                className={`drawer-panel output-drawer-panel ${outputDrawerOpen ? 'open' : ''}`}
                style={{ height: outputDrawerOpen ? drawerHeight : 0 }}
            >
                <div className="drawer-resize-handle" />
                <div className="drawer-header">
                    <div className="drawer-title">
                        <Terminal size={14} />
                        <span>Output</span>
                    </div>
                    <button
                        className="drawer-close"
                        onClick={() => setOutputDrawerOpen(false)}
                        title="Close"
                    >
                        <X size={14} />
                    </button>
                </div>
                <div className="drawer-body output-log-body">
                    <div style={{ padding: 12, color: '#555', fontSize: 12, textAlign: 'center' }}>
                        No output
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="status-bar">
                <div className="status-bar-left">
                    <button
                        className={`drawer-toggle-btn ${contentDrawerOpen ? 'active' : ''}`}
                        onClick={handleContentDrawerClick}
                    >
                        <FolderOpen size={14} />
                        <span>Content</span>
                        {contentDrawerOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                    </button>

                    <button
                        className={`status-bar-tab ${outputDrawerOpen ? 'active' : ''}`}
                        onClick={handleOutputClick}
                    >
                        <Terminal size={12} />
                        <span>Output</span>
                    </button>

                    <div className="status-bar-divider" />

                    <div className="status-bar-console-input">
                        <span className="console-prompt">&gt;</span>
                        <input
                            type="text"
                            placeholder="Type command..."
                        />
                    </div>
                </div>

                <div className="status-bar-right">
                    <span className="status-bar-version">v0.1.0</span>
                </div>
            </div>
        </>
    );
}
