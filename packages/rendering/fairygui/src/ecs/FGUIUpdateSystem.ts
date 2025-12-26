/**
 * FGUIUpdateSystem
 *
 * ECS system that handles automatic loading and updating of FGUIComponents.
 *
 * 处理 FGUIComponent 自动加载和更新的 ECS 系统
 */

import { EntitySystem, Matcher, type Entity, Time } from '@esengine/ecs-framework';
import type { IAssetManager } from '@esengine/asset-system';
import { FGUIComponent } from './FGUIComponent';
import { getFGUIRenderSystem } from './FGUIRenderSystem';
import type { IFUIAsset } from '../asset/FUIAssetLoader';

/**
 * Tracked state for detecting property changes
 * 用于检测属性变化的跟踪状态
 */
interface TrackedState {
    packageGuid: string;
    componentName: string;
}

/**
 * FGUIUpdateSystem
 *
 * Automatically loads FUI packages and creates UI components for FGUIComponent.
 * 自动为 FGUIComponent 加载 FUI 包并创建 UI 组件
 */
export class FGUIUpdateSystem extends EntitySystem {
    private _assetManager: IAssetManager | null = null;
    private _trackedStates: WeakMap<FGUIComponent, TrackedState> = new WeakMap();
    private _pendingLoads: Map<FGUIComponent, Promise<void>> = new Map();

    constructor() {
        super(Matcher.empty().all(FGUIComponent));
    }

    public setAssetManager(assetManager: IAssetManager): void {
        this._assetManager = assetManager;
    }

    protected override process(entities: readonly Entity[]): void {
        for (const entity of entities) {
            const fguiComp = entity.getComponent(FGUIComponent) as FGUIComponent | null;
            if (!fguiComp) continue;

            // Skip if currently loading
            if (fguiComp.isLoading || this._pendingLoads.has(fguiComp)) {
                continue;
            }

            // Check if we need to reload
            const tracked = this._trackedStates.get(fguiComp);
            const needsReload = this._needsReload(fguiComp, tracked);

            if (needsReload && fguiComp.packageGuid) {
                this._loadComponent(fguiComp);
            }
        }

        const renderSystem = getFGUIRenderSystem();
        if (renderSystem) {
            renderSystem.update(Time.deltaTime);
        }
    }

    /**
     * Check if component needs to reload
     * 检查组件是否需要重新加载
     */
    private _needsReload(comp: FGUIComponent, tracked: TrackedState | undefined): boolean {
        // Not tracked yet - needs initial load
        if (!tracked) {
            return true;
        }

        // Package changed - needs full reload
        if (tracked.packageGuid !== comp.packageGuid) {
            return true;
        }

        // Component name changed - needs to recreate component
        if (tracked.componentName !== comp.componentName) {
            // If package is already loaded, just recreate the component
            if (comp.package && comp.componentName) {
                comp.createComponent(comp.componentName);
                // Update tracked state
                this._trackedStates.set(comp, {
                    packageGuid: comp.packageGuid,
                    componentName: comp.componentName
                });
            }
            return false;
        }

        return false;
    }

    private async _loadComponent(comp: FGUIComponent): Promise<void> {
        if (!this._assetManager) {
            return;
        }

        const loadPromise = this._doLoad(comp);
        this._pendingLoads.set(comp, loadPromise);

        try {
            await loadPromise;
        } finally {
            this._pendingLoads.delete(comp);
        }
    }

    private async _doLoad(comp: FGUIComponent): Promise<void> {
        const packageRef = comp.packageGuid;

        // Dispose previous content before loading new package
        comp.dispose();

        try {
            // Check if packageRef is a path (contains / or . before extension) or a GUID
            // GUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
            // Path format: assets/ui/Bag.fui or similar
            const isPath = packageRef.includes('/') || packageRef.includes('\\') || packageRef.endsWith('.fui');
            const result = isPath
                ? await this._assetManager!.loadAssetByPath<IFUIAsset>(packageRef)
                : await this._assetManager!.loadAsset<IFUIAsset>(packageRef);
            if (!result || !result.asset) {
                return;
            }

            const fuiAsset = result.asset;

            if (fuiAsset.package) {
                const width = comp.width > 0 ? comp.width : 1920;
                const height = comp.height > 0 ? comp.height : 1080;
                comp.initRoot(width, height);
                comp.setLoadedPackage(fuiAsset.package);

                if (comp.componentName) {
                    comp.createComponent(comp.componentName);
                }
            } else {
                const asset = fuiAsset as unknown;
                let data: ArrayBuffer | null = null;

                if (asset instanceof ArrayBuffer) {
                    data = asset;
                } else if (typeof asset === 'object' && asset !== null && 'data' in asset && (asset as { data: ArrayBuffer }).data instanceof ArrayBuffer) {
                    data = (asset as { data: ArrayBuffer }).data;
                } else if (typeof asset === 'object' && asset !== null && 'buffer' in asset) {
                    data = (asset as { buffer: ArrayBuffer }).buffer;
                }

                if (!data) {
                    return;
                }

                const width = comp.width > 0 ? comp.width : 1920;
                const height = comp.height > 0 ? comp.height : 1080;
                comp.initRoot(width, height);
                comp.loadPackage(packageRef, data);

                if (comp.componentName) {
                    comp.createComponent(comp.componentName);
                }
            }

            const renderSystem = getFGUIRenderSystem();
            if (renderSystem && comp.isReady) {
                renderSystem.registerComponent(comp);
            }

            // Update tracked state after successful load
            this._trackedStates.set(comp, {
                packageGuid: comp.packageGuid,
                componentName: comp.componentName
            });

        } catch (err) {
            console.error(`[FGUI] Error loading package ${packageRef}:`, err);
        }
    }

    protected override onDestroy(): void {
        const renderSystem = getFGUIRenderSystem();
        if (renderSystem && this.scene) {
            for (const entity of this.scene.entities.buffer) {
                const fguiComp = entity.getComponent(FGUIComponent) as FGUIComponent | null;
                if (fguiComp) {
                    renderSystem.unregisterComponent(fguiComp);
                }
            }
        }

        this._pendingLoads.clear();
        this._trackedStates = new WeakMap();
    }
}
