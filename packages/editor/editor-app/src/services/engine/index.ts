/**
 * @zh 编辑器引擎服务
 * @en Editor Engine Services
 *
 * 提供统一的引擎服务访问接口。
 * Provides unified engine service access interface.
 */

// Type Exports

export * from './types';

// Service Exports (Layer 0)

export { getEngineAdapter, resetEngineAdapter, type IEngineAdapter } from './EngineAdapter';

// Service Exports (Layer 1)

export { getCameraService, resetCameraService, type ICameraService } from './CameraService';
export { getEngineLifecycle, resetEngineLifecycle, type IEngineLifecycle, type EngineState, type InitPhase, type EngineInitConfig, type InitResult } from './EngineLifecycle';
export { getAssetService, resetAssetService, type IAssetService, type AssetType, type AssetInfo, type AssetLoadResult } from './AssetService';

// Service Exports (Layer 2)

export { getSceneService, type ISceneService, type SceneLoadResult } from './SceneService';
export { getEditorAssetConfig, getEditorBundle, type EditorBundle } from './EditorBundle';
export { getTransformService, resetTransformService, type ITransformService } from './TransformService';

// Service Exports (Layer 3)

export { getSelectionService, resetSelectionService, type ISelectionService } from './SelectionService';
export { getGizmoRenderService, resetGizmoRenderService, type IGizmoRenderService, type TransformTool } from './GizmoRenderService';

// Compatibility Facade (for migration)

export {
    getEditorEngine,
    resetEditorEngineFacade,
    type IEditorEngineFacade,
    type EditorCamera
} from './EditorEngineFacade';

// Re-export commonly used types from facade
export type { ComponentInfo, SceneNodeInfo } from './EditorEngineFacade';

// Service Container Interface

import type { IEngineAdapter } from './EngineAdapter';
import type { ICameraService } from './CameraService';
import type { IEngineLifecycle } from './EngineLifecycle';
import type { IAssetService } from './AssetService';
import type { ISceneService } from './SceneService';
import type { ISelectionService } from './SelectionService';
import type { ITransformService } from './TransformService';
import type { IGizmoRenderService } from './GizmoRenderService';

/**
 * @zh 编辑器引擎服务容器接口
 * @en Editor engine service container interface
 */
export interface IEditorEngineServices {
    readonly adapter: IEngineAdapter;
    readonly camera: ICameraService;
    readonly lifecycle: IEngineLifecycle;
    readonly assets: IAssetService;
    readonly scene: ISceneService;
    readonly selection: ISelectionService;
    readonly transform: ITransformService;
    readonly gizmo: IGizmoRenderService;
}

// Service Container

import { getEngineAdapter } from './EngineAdapter';
import { getCameraService } from './CameraService';
import { getEngineLifecycle } from './EngineLifecycle';
import { getAssetService } from './AssetService';
import { getSceneService } from './SceneService';
import { getSelectionService } from './SelectionService';
import { getTransformService } from './TransformService';
import { getGizmoRenderService } from './GizmoRenderService';

let services: IEditorEngineServices | null = null;

/**
 * @zh 获取编辑器引擎服务容器
 * @en Get editor engine service container
 */
export function getEditorEngineServices(): IEditorEngineServices {
    if (!services) {
        services = {
            adapter: getEngineAdapter(),
            camera: getCameraService(),
            lifecycle: getEngineLifecycle(),
            assets: getAssetService(),
            scene: getSceneService(),
            selection: getSelectionService(),
            transform: getTransformService(),
            gizmo: getGizmoRenderService(),
        };
    }
    return services;
}

/**
 * @zh 重置所有服务（仅用于测试）
 * @en Reset all services (for testing only)
 */
export function resetAllServices(): void {
    services = null;
}
