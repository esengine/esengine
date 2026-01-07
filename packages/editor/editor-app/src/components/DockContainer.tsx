import { useRef, useCallback, useState, ReactNode } from 'react';
import { Layout, Model, IJsonModel, TabNode, Actions, ITabSetRenderValues, TabSetNode, BorderNode } from 'flexlayout-react';
import 'flexlayout-react/style/dark.css';
import '../styles/DockContainer.css';

interface PanelConfig {
    id: string;
    name: string;
    component: ReactNode;
    enableClose?: boolean;
}

interface DockContainerProps {
    panels: PanelConfig[];
    onLayoutChange?: (model: Model) => void;
}

const defaultLayout: IJsonModel = {
    global: {
        tabEnableClose: false,
        tabEnableRename: false,
        tabSetMinWidth: 100,
        tabSetMinHeight: 100,
        borderMinSize: 100,
        splitterSize: 4,
        tabSetEnableMaximize: true,
        tabSetEnableDrop: true,
        tabSetEnableDrag: true,
        tabSetEnableDivide: true,
    },
    borders: [],
    layout: {
        type: 'row',
        weight: 100,
        children: [
            {
                type: 'tabset',
                weight: 20,
                minWidth: 200,
                children: [
                    {
                        type: 'tab',
                        id: 'hierarchy',
                        name: 'Hierarchy',
                        component: 'hierarchy',
                        enableClose: false,
                    }
                ]
            },
            {
                type: 'tabset',
                weight: 60,
                minWidth: 400,
                children: [
                    {
                        type: 'tab',
                        id: 'scene',
                        name: 'Scene',
                        component: 'scene',
                        enableClose: false,
                    },
                    {
                        type: 'tab',
                        id: 'game',
                        name: 'Game',
                        component: 'game',
                        enableClose: false,
                    }
                ]
            },
            {
                type: 'tabset',
                weight: 20,
                minWidth: 240,
                children: [
                    {
                        type: 'tab',
                        id: 'inspector',
                        name: 'Inspector',
                        component: 'inspector',
                        enableClose: false,
                    }
                ]
            }
        ]
    }
};

interface DockLayoutProps {
    hierarchyPanel: ReactNode;
    scenePanel: ReactNode;
    gamePanel: ReactNode;
    inspectorPanel: ReactNode;
}

export function DockContainer({
    hierarchyPanel,
    scenePanel,
    gamePanel,
    inspectorPanel
}: DockLayoutProps) {
    const layoutRef = useRef<Layout>(null);
    const [model] = useState(() => {
        const savedLayout = localStorage.getItem('editor-layout');
        if (savedLayout) {
            try {
                return Model.fromJson(JSON.parse(savedLayout));
            } catch {
                // If parsing fails, use default layout
            }
        }
        return Model.fromJson(defaultLayout);
    });

    const factory = useCallback((node: TabNode) => {
        const component = node.getComponent();

        switch (component) {
            case 'hierarchy':
                return <div className="dock-panel-content">{hierarchyPanel}</div>;
            case 'scene':
                return <div className="dock-panel-content dock-panel-viewport">{scenePanel}</div>;
            case 'game':
                return <div className="dock-panel-content dock-panel-viewport">{gamePanel}</div>;
            case 'inspector':
                return <div className="dock-panel-content">{inspectorPanel}</div>;
            default:
                return <div className="dock-panel-content">Unknown Panel: {component}</div>;
        }
    }, [hierarchyPanel, scenePanel, gamePanel, inspectorPanel]);

    const handleModelChange = useCallback((model: Model) => {
        localStorage.setItem('editor-layout', JSON.stringify(model.toJson()));
    }, []);

    const onRenderTabSet = useCallback((
        tabSetNode: TabSetNode | BorderNode,
        renderValues: ITabSetRenderValues
    ) => {
        // Custom tab set rendering if needed
    }, []);

    return (
        <div className="dock-container">
            <Layout
                ref={layoutRef}
                model={model}
                factory={factory}
                onModelChange={handleModelChange}
                onRenderTabSet={onRenderTabSet}
            />
        </div>
    );
}

// Reset layout to default
export function resetDockLayout() {
    localStorage.removeItem('editor-layout');
    window.location.reload();
}
