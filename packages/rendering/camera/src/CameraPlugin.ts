import type { IComponentRegistry, IScene } from '@esengine/ecs-framework';
import type { IRuntimeModule, IRuntimePlugin, ModuleManifest, SystemContext } from '@esengine/engine-core';
import { RenderConfigServiceToken } from '@esengine/engine-core';
import { CameraComponent } from './CameraComponent';
import { CameraSystem } from './CameraSystem';

class CameraRuntimeModule implements IRuntimeModule {
    registerComponents(registry: IComponentRegistry): void {
        registry.register(CameraComponent);
    }

    createSystems(scene: IScene, context: SystemContext): void {
        // 从服务注册表获取渲染配置服务 | Get render config service from registry
        const renderConfig = context.services.get(RenderConfigServiceToken);
        if (!renderConfig) {
            console.warn('[CameraPlugin] RenderConfigService not found, CameraSystem will not be created');
            return;
        }

        // 创建并添加 CameraSystem | Create and add CameraSystem
        const cameraSystem = new CameraSystem(renderConfig);
        scene.addSystem(cameraSystem);
    }
}

const manifest: ModuleManifest = {
    id: 'camera',
    name: '@esengine/camera',
    displayName: 'Camera',
    version: '1.0.0',
    description: '2D/3D 相机组件',
    category: 'Rendering',
    isCore: false,
    defaultEnabled: true,
    isEngineModule: true,
    dependencies: ['core', 'math'],
    exports: { components: ['CameraComponent'] }
};

export const CameraPlugin: IRuntimePlugin = {
    manifest,
    runtimeModule: new CameraRuntimeModule()
};
