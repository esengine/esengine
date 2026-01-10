import { useState, useCallback, useEffect } from 'react';
import { Move, RotateCcw, Maximize, MousePointer2 } from 'lucide-react';
import { TitleBar } from './components/TitleBar';
import { SceneHierarchy } from './components/SceneHierarchy';
import { Inspector } from './components/Inspector';
import { StatusBar } from './components/StatusBar';
import { DockContainer } from './components/DockContainer';
import { GameViewport } from './components/GameViewport';
import { getProjectManager } from './services/ProjectManager';
import { getEditorEngine } from './services/engine';
import './styles/App.css';

type TransformTool = 'select' | 'move' | 'rotate' | 'scale';
type TransformSpace = 'local' | 'world';
type PivotMode = 'pivot' | 'center';
type ViewportMode = 'scene' | 'game';

function App() {
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [selectedEntityName, setSelectedEntityName] = useState<string>('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeTool, setActiveTool] = useState<TransformTool>('select');
    const [transformSpace, setTransformSpace] = useState<TransformSpace>('local');
    const [pivotMode, setPivotMode] = useState<PivotMode>('pivot');
    const [projectPath, setProjectPath] = useState<string | null>(null);
    const [currentScenePath, setCurrentScenePath] = useState<string | null>(null);
    /**
     * @zh 视口模式（Scene 编辑模式 或 Game 运行模式）
     * @en Viewport mode (Scene edit mode or Game run mode)
     *
     * 单视图架构：一个 canvas，通过 mode 切换行为
     * Single viewport architecture: one canvas, behavior switches via mode
     */
    const [viewportMode, setViewportMode] = useState<ViewportMode>('scene');

    const handleSelectEntity = useCallback((uuid: string) => {
        setSelectedEntityId(uuid);
        setSelectedEntityName('Entity');
    }, []);

    const handleSelectNode = useCallback((nodeId: string | null) => {
        if (nodeId) {
            // TODO: Get node name from getSceneService()
            setSelectedEntityId(nodeId);
            setSelectedEntityName('Node');
        } else {
            setSelectedEntityId(null);
            setSelectedEntityName('');
        }
    }, []);

    const handlePlay = useCallback(() => {
        setViewportMode('game');
        setIsPlaying(true);
    }, []);

    const handlePause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const handleStop = useCallback(() => {
        setIsPlaying(false);
        setViewportMode('scene');
    }, []);

    const toggleTransformSpace = useCallback(() => {
        setTransformSpace(prev => prev === 'local' ? 'world' : 'local');
    }, []);

    const togglePivotMode = useCallback(() => {
        setPivotMode(prev => prev === 'pivot' ? 'center' : 'pivot');
    }, []);

    const handleProjectOpen = useCallback(async (path: string) => {
        setProjectPath(path);

        try {
            const projectManager = getProjectManager();
            const engine = getEditorEngine();

            const { invoke } = await import('@tauri-apps/api/core');
            try {
                const currentDir = await invoke<string>('get_current_dir');
                const workspaceRoot = currentDir.replace(/[\\/]packages[\\/]editor[\\/]editor-app([\\/]src-tauri)?$/, '');
                const enginePath = `${workspaceRoot}/engine`;
                engine.setEngineSourcePath(enginePath);
            } catch {
                // Running outside Tauri, engine path will use default
            }

            await engine.init();

            await projectManager.init();
            await projectManager.openProject({ projectPath: path });
        } catch (error) {
            console.error('[App] Failed to open project:', error);
        }
    }, []);

    const handleOpenScene = useCallback(async (scenePath: string) => {

        const projectManager = getProjectManager();
        const project = projectManager.getCurrentProject();

        // Extract scene name from path
        const sceneName = scenePath.split(/[/\\]/).pop()?.replace(/\.(scene|json)$/i, '') || '';

        if (project?.hasEditorCache) {
            // 编辑器模式：从 library 加载场景

            const success = await projectManager.loadSceneFromLibrary(sceneName);
            if (success) {
                setCurrentScenePath(scenePath);
            } else {
                // 尝试直接加载（可能有缺失类）
                setCurrentScenePath(scenePath);
            }
        } else if (project?.hasValidBuild) {
            // 构建模式：从 bundle 加载场景

            const success = await projectManager.loadScene(sceneName);
            if (success) {
                setCurrentScenePath(scenePath);
            } else {
                setCurrentScenePath(scenePath);
            }
        } else {
            // 无缓存也无构建，直接加载（会有缺失类错误）
            setCurrentScenePath(scenePath);
        }
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Transform tool shortcuts
            if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'q':
                        setActiveTool('select');
                        break;
                    case 'w':
                        setActiveTool('move');
                        break;
                    case 'e':
                        setActiveTool('rotate');
                        break;
                    case 'r':
                        setActiveTool('scale');
                        break;
                    case 'x':
                        toggleTransformSpace();
                        break;
                    case 'z':
                        togglePivotMode();
                        break;
                }
            }

            // Play controls
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                if (isPlaying) {
                    handleStop();
                } else {
                    handlePlay();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, handlePlay, handleStop, toggleTransformSpace, togglePivotMode]);

    return (
        <div className="editor-container">
            <TitleBar title="ESEngine Editor" onOpenProject={handleProjectOpen} />

            {/* Main Toolbar */}
            <div className="main-toolbar">
                {/* File Operations */}
                <div className="toolbar-group">
                    <button className="toolbar-btn" title="Save (Ctrl+S)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                            <polyline points="17,21 17,13 7,13 7,21"/>
                            <polyline points="7,3 7,8 15,8"/>
                        </svg>
                    </button>
                    <button className="toolbar-btn" title="Undo (Ctrl+Z)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
                        </svg>
                    </button>
                    <button className="toolbar-btn" title="Redo (Ctrl+Y)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13"/>
                        </svg>
                    </button>
                </div>

                <div className="toolbar-separator" />

                {/* Transform Tools */}
                <div className="toolbar-group">
                    <button
                        className={`toolbar-btn ${activeTool === 'select' ? 'active' : ''}`}
                        title="Select (Q)"
                        onClick={() => setActiveTool('select')}
                    >
                        <MousePointer2 size={16} />
                    </button>
                    <button
                        className={`toolbar-btn ${activeTool === 'move' ? 'active' : ''}`}
                        title="Move (W)"
                        onClick={() => setActiveTool('move')}
                    >
                        <Move size={16} />
                    </button>
                    <button
                        className={`toolbar-btn ${activeTool === 'rotate' ? 'active' : ''}`}
                        title="Rotate (E)"
                        onClick={() => setActiveTool('rotate')}
                    >
                        <RotateCcw size={16} />
                    </button>
                    <button
                        className={`toolbar-btn ${activeTool === 'scale' ? 'active' : ''}`}
                        title="Scale (R)"
                        onClick={() => setActiveTool('scale')}
                    >
                        <Maximize size={16} />
                    </button>
                </div>

                <div className="toolbar-separator" />

                {/* Transform Space & Pivot */}
                <div className="toolbar-group">
                    <button
                        className="toolbar-btn toolbar-btn-text"
                        title="Toggle Transform Space"
                        onClick={toggleTransformSpace}
                    >
                        {transformSpace === 'local' ? 'Local' : 'World'}
                    </button>
                    <button
                        className="toolbar-btn toolbar-btn-text"
                        title="Toggle Pivot Mode"
                        onClick={togglePivotMode}
                    >
                        {pivotMode === 'pivot' ? 'Pivot' : 'Center'}
                    </button>
                </div>

                <div className="toolbar-separator" />

                {/* Play Controls */}
                <div className="toolbar-group toolbar-play">
                    <button
                        className={`toolbar-btn ${isPlaying ? '' : 'play-btn'}`}
                        title="Play"
                        onClick={handlePlay}
                        disabled={isPlaying}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,3 19,12 5,21"/>
                        </svg>
                    </button>
                    <button
                        className="toolbar-btn"
                        title="Pause"
                        onClick={handlePause}
                        disabled={!isPlaying}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                        </svg>
                    </button>
                    <button
                        className={`toolbar-btn ${isPlaying ? 'stop-btn' : ''}`}
                        title="Stop"
                        onClick={handleStop}
                        disabled={!isPlaying}
                    >
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
                    viewportPanel={
                        <GameViewport
                            mode={viewportMode}
                            isPlaying={isPlaying}
                            activeTool={activeTool}
                            scenePath={currentScenePath}
                            projectPath={projectPath}
                            onPlay={handlePlay}
                            onPause={handlePause}
                            onStop={handleStop}
                            onSelectNode={handleSelectNode}
                        />
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
            <StatusBar
                projectPath={projectPath ?? undefined}
                onOpenScene={handleOpenScene}
            />
        </div>
    );
}

export default App;
