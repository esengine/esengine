import { useRef, useCallback, useState, ReactNode } from 'react';
import { Layout, Model, IJsonModel, TabNode } from 'flexlayout-react';
import 'flexlayout-react/style/dark.css';
import '../styles/DockContainer.css';

/**
 * @zh 默认布局配置 - 单视口架构
 * @en Default layout config - single viewport architecture
 *
 * 左侧: Hierarchy
 * 中间: Viewport (Scene/Game 共用)
 * 右侧: Inspector
 */
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
                        id: 'viewport',
                        name: 'Viewport',
                        component: 'viewport',
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

/**
 * @zh Dock 布局属性 - 单视口架构
 * @en Dock layout props - single viewport architecture
 */
interface DockLayoutProps {
    hierarchyPanel: ReactNode;
    viewportPanel: ReactNode;
    inspectorPanel: ReactNode;
}

// Layout version - increment when layout structure changes
const LAYOUT_VERSION = 2;

export function DockContainer({
    hierarchyPanel,
    viewportPanel,
    inspectorPanel
}: DockLayoutProps) {
    const layoutRef = useRef<Layout>(null);
    const [model] = useState(() => {
        const savedLayout = localStorage.getItem('editor-layout');
        const savedVersion = localStorage.getItem('editor-layout-version');

        // Check if layout version matches, otherwise use default
        if (savedLayout && savedVersion === String(LAYOUT_VERSION)) {
            try {
                return Model.fromJson(JSON.parse(savedLayout));
            } catch {
                // If parsing fails, use default layout
            }
        }

        // Clear old layout and save new version
        localStorage.removeItem('editor-layout');
        localStorage.setItem('editor-layout-version', String(LAYOUT_VERSION));
        return Model.fromJson(defaultLayout);
    });

    const factory = useCallback((node: TabNode) => {
        const component = node.getComponent();

        switch (component) {
            case 'hierarchy':
                return <div className="dock-panel-content">{hierarchyPanel}</div>;
            case 'viewport':
                return <div className="dock-panel-content dock-panel-viewport">{viewportPanel}</div>;
            case 'inspector':
                return <div className="dock-panel-content">{inspectorPanel}</div>;
            default:
                return <div className="dock-panel-content">Unknown Panel: {component}</div>;
        }
    }, [hierarchyPanel, viewportPanel, inspectorPanel]);

    const handleModelChange = useCallback((model: Model) => {
        localStorage.setItem('editor-layout', JSON.stringify(model.toJson()));
    }, []);

    return (
        <div className="dock-container">
            <Layout
                ref={layoutRef}
                model={model}
                factory={factory}
                onModelChange={handleModelChange}
            />
        </div>
    );
}

// Reset layout to default
export function resetDockLayout() {
    localStorage.removeItem('editor-layout');
    window.location.reload();
}
