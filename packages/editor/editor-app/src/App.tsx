import { useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { SceneHierarchy } from './components/SceneHierarchy';
import { Inspector } from './components/Inspector';
import { StatusBar } from './components/StatusBar';
import { DockContainer } from './components/DockContainer';
import './styles/App.css';

function App() {
    const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
    const [selectedEntityName, setSelectedEntityName] = useState<string>('');

    const handleSelectEntity = (id: number) => {
        setSelectedEntityId(id);
        // Mock entity name lookup
        const names: Record<number, string> = {
            1: 'Scene',
            2: 'Main Camera',
            3: 'Directional Light',
            4: 'Game Objects',
            5: 'Player',
            6: 'Enemy'
        };
        setSelectedEntityName(names[id] || 'Entity');
    };

    return (
        <div className="editor-container">
            <TitleBar title="ESEngine Editor" />

            {/* Main Toolbar */}
            <div className="main-toolbar">
                <div className="toolbar-group">
                    <button className="toolbar-btn" title="Save">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                            <polyline points="17,21 17,13 7,13 7,21"/>
                            <polyline points="7,3 7,8 15,8"/>
                        </svg>
                    </button>
                    <button className="toolbar-btn" title="Undo">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
                        </svg>
                    </button>
                    <button className="toolbar-btn" title="Redo">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13"/>
                        </svg>
                    </button>
                </div>
                <div className="toolbar-separator" />
                <div className="toolbar-group toolbar-play">
                    <button className="toolbar-btn play-btn" title="Play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,3 19,12 5,21"/>
                        </svg>
                    </button>
                    <button className="toolbar-btn" title="Pause">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                        </svg>
                    </button>
                    <button className="toolbar-btn" title="Stop">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="4" y="4" width="16" height="16"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="editor-content">
                <DockContainer
                    hierarchyPanel={
                        <SceneHierarchy
                            selectedEntityId={selectedEntityId}
                            onSelectEntity={handleSelectEntity}
                        />
                    }
                    scenePanel={
                        <div className="viewport-canvas">
                            <canvas id="viewport-canvas" />
                            <div className="viewport-overlay">
                                <span>Viewport - ccesengine integration pending</span>
                            </div>
                        </div>
                    }
                    gamePanel={
                        <div className="viewport-canvas">
                            <canvas id="game-canvas" />
                            <div className="viewport-overlay">
                                <span>Game View - Press Play to start</span>
                            </div>
                        </div>
                    }
                    inspectorPanel={
                        <Inspector
                            entityId={selectedEntityId}
                            entityName={selectedEntityName}
                        />
                    }
                />
            </div>

            {/* Status Bar */}
            <StatusBar />
        </div>
    );
}

export default App;
