import { IScene } from './IScene';
import { Scene } from './Scene';
import { createLogger } from '../Utils/Logger';
import { PerformanceMonitor } from '../Utils/PerformanceMonitor';
import { ServiceContainer } from '../Core/ServiceContainer';

const logger = createLogger('World');

/**
 * @zh 全局系统接口
 * @en Global system interface
 *
 * @zh 全局系统是在World级别运行的系统，不依赖特定Scene
 * @en Global systems run at World level and don't depend on specific Scene
 */
export interface IGlobalSystem {
    /**
     * @zh 系统名称
     * @en System name
     */
    readonly name: string;

    /**
     * @zh 初始化系统
     * @en Initialize system
     */
    initialize?(): void;

    /**
     * @zh 更新系统
     * @en Update system
     */
    update(deltaTime?: number): void;

    /**
     * @zh 重置系统
     * @en Reset system
     */
    reset?(): void;

    /**
     * @zh 销毁系统
     * @en Destroy system
     */
    destroy?(): void;
}

/**
 * @zh World配置接口
 * @en World configuration interface
 */
export interface IWorldConfig {
    /**
     * @zh World名称
     * @en World name
     */
    name?: string;

    /**
     * @zh 是否启用调试模式
     * @en Enable debug mode
     */
    debug?: boolean;

    /**
     * @zh 最大Scene数量限制
     * @en Maximum number of scenes
     */
    maxScenes?: number;

    /**
     * @zh 是否自动清理空Scene
     * @en Auto cleanup empty scenes
     */
    autoCleanup?: boolean;

    /**
     * @zh 自动清理阈值（毫秒），空Scene超过此时间后将被自动清理
     * @en Auto cleanup threshold (ms), empty scenes exceeding this time will be auto-cleaned
     * @default 300000 (5 minutes)
     */
    cleanupThresholdMs?: number;
}

/**
 * @zh World默认配置
 * @en World default configuration
 */
const DEFAULT_CONFIG: Required<IWorldConfig> = {
    name: 'World',
    debug: false,
    maxScenes: 10,
    autoCleanup: true,
    cleanupThresholdMs: 5 * 60 * 1000
};

/**
 * @zh World类 - ECS世界管理器
 * @en World class - ECS world manager
 *
 * @zh World是Scene的容器，每个World可以管理多个Scene。
 * World拥有独立的服务容器，用于管理World级别的全局服务。
 * @en World is a container for Scenes, each World can manage multiple Scenes.
 * World has its own service container for managing World-level global services.
 *
 * @zh 服务容器层级：
 * - Core.services: 应用程序全局服务
 * - World.services: World级别服务（每个World独立）
 * - Scene.services: Scene级别服务（每个Scene独立）
 * @en Service container hierarchy:
 * - Core.services: Application-wide global services
 * - World.services: World-level services (independent per World)
 * - Scene.services: Scene-level services (independent per Scene)
 *
 * @example
 * ```typescript
 * const roomWorld = new World({ name: 'Room_001' });
 * roomWorld.services.registerSingleton(RoomManager);
 *
 * const gameScene = roomWorld.createScene('game');
 * roomWorld.setSceneActive('game', true);
 * roomWorld.start();
 * ```
 */
export class World {
    public readonly name: string;

    private readonly _config: Required<IWorldConfig>;
    private readonly _scenes = new Map<string, IScene>();
    private readonly _activeScenes = new Set<string>();
    private readonly _globalSystems: IGlobalSystem[] = [];
    private readonly _services: ServiceContainer;
    private readonly _createdAt: number;
    private _isActive = false;

    constructor(config: IWorldConfig = {}) {
        this._config = { ...DEFAULT_CONFIG, ...config };
        this.name = this._config.name;
        this._createdAt = Date.now();
        this._services = new ServiceContainer();
    }

    /**
     * @zh World级别的服务容器
     * @en World-level service container
     */
    public get services(): ServiceContainer {
        return this._services;
    }

    /**
     * @zh 检查World是否激活
     * @en Check if World is active
     */
    public get isActive(): boolean {
        return this._isActive;
    }

    /**
     * @zh 获取Scene数量
     * @en Get scene count
     */
    public get sceneCount(): number {
        return this._scenes.size;
    }

    /**
     * @zh 获取创建时间
     * @en Get creation time
     */
    public get createdAt(): number {
        return this._createdAt;
    }

    /**
     * @zh 创建并添加Scene到World
     * @en Create and add Scene to World
     *
     * @param sceneName - @zh Scene名称 @en Scene name
     * @param sceneInstance - @zh Scene实例（可选）@en Scene instance (optional)
     * @returns @zh 创建的Scene实例 @en Created Scene instance
     * @throws @zh 名称为空、重复或超出限制时抛出错误 @en Throws if name is empty, duplicate, or limit exceeded
     */
    public createScene<T extends IScene>(sceneName: string, sceneInstance?: T): T {
        this.validateSceneName(sceneName);

        const scene = sceneInstance ?? new Scene() as unknown as T;

        if (this._config.debug) {
            const monitor = new PerformanceMonitor();
            monitor.enable();
            scene.services.registerInstance(PerformanceMonitor, monitor);
        }

        (scene as { id?: string }).id = sceneName;
        scene.name ||= sceneName;

        this._scenes.set(sceneName, scene);
        scene.initialize();

        return scene;
    }

    /**
     * @zh 移除Scene
     * @en Remove Scene
     *
     * @param sceneName - @zh Scene名称 @en Scene name
     * @returns @zh 是否成功移除 @en Whether removal was successful
     */
    public removeScene(sceneName: string): boolean {
        const scene = this._scenes.get(sceneName);
        if (!scene) return false;

        if (this._activeScenes.has(sceneName)) {
            this.setSceneActive(sceneName, false);
        }

        scene.end();
        this._scenes.delete(sceneName);
        logger.info(`从World '${this.name}' 中移除Scene: ${sceneName}`);

        return true;
    }

    /**
     * @zh 移除所有Scene
     * @en Remove all Scenes
     */
    public removeAllScenes(): void {
        this._scenes.forEach((_, name) => this.removeScene(name));
        logger.info(`从World '${this.name}' 中移除所有Scene`);
    }

    /**
     * @zh 获取Scene
     * @en Get Scene
     *
     * @param sceneName - @zh Scene名称 @en Scene name
     * @returns @zh Scene实例或null @en Scene instance or null
     */
    public getScene<T extends IScene>(sceneName: string): T | null {
        return (this._scenes.get(sceneName) as T) ?? null;
    }

    /**
     * @zh 获取所有Scene ID
     * @en Get all Scene IDs
     */
    public getSceneIds(): string[] {
        return Array.from(this._scenes.keys());
    }

    /**
     * @zh 获取所有Scene
     * @en Get all Scenes
     */
    public getAllScenes(): IScene[] {
        return Array.from(this._scenes.values());
    }

    /**
     * @zh 设置Scene激活状态
     * @en Set Scene active state
     *
     * @param sceneName - @zh Scene名称 @en Scene name
     * @param active - @zh 是否激活 @en Whether to activate
     */
    public setSceneActive(sceneName: string, active: boolean): void {
        const scene = this._scenes.get(sceneName);
        if (!scene) {
            logger.warn(`Scene '${sceneName}' 不存在于World '${this.name}' 中`);
            return;
        }

        if (active) {
            this._activeScenes.add(sceneName);
            scene.begin?.();
            logger.debug(`在World '${this.name}' 中激活Scene: ${sceneName}`);
        } else {
            this._activeScenes.delete(sceneName);
            logger.debug(`在World '${this.name}' 中停用Scene: ${sceneName}`);
        }
    }

    /**
     * @zh 检查Scene是否激活
     * @en Check if Scene is active
     */
    public isSceneActive(sceneName: string): boolean {
        return this._activeScenes.has(sceneName);
    }

    /**
     * @zh 获取活跃Scene数量
     * @en Get active Scene count
     */
    public getActiveSceneCount(): number {
        return this._activeScenes.size;
    }

    /**
     * @zh 添加全局System
     * @en Add global System
     *
     * @param system - @zh 全局System实例 @en Global System instance
     * @returns @zh 添加的System实例 @en Added System instance
     */
    public addGlobalSystem<T extends IGlobalSystem>(system: T): T {
        if (this._globalSystems.includes(system)) {
            return system;
        }

        this._globalSystems.push(system);
        system.initialize?.();
        logger.debug(`在World '${this.name}' 中添加全局System: ${system.name}`);

        return system;
    }

    /**
     * @zh 移除全局System
     * @en Remove global System
     *
     * @param system - @zh 要移除的System @en System to remove
     * @returns @zh 是否成功移除 @en Whether removal was successful
     */
    public removeGlobalSystem(system: IGlobalSystem): boolean {
        const index = this._globalSystems.indexOf(system);
        if (index === -1) return false;

        this._globalSystems.splice(index, 1);
        system.reset?.();
        logger.debug(`从World '${this.name}' 中移除全局System: ${system.name}`);

        return true;
    }

    /**
     * @zh 获取全局System
     * @en Get global System
     *
     * @param type - @zh System类型 @en System type
     * @returns @zh System实例或null @en System instance or null
     */
    public getGlobalSystem<T extends IGlobalSystem>(type: new (...args: unknown[]) => T): T | null {
        return (this._globalSystems.find(s => s instanceof type) as T) ?? null;
    }


    /**
     * @zh 启动World
     * @en Start World
     */
    public start(): void {
        if (this._isActive) return;

        this._isActive = true;
        this._globalSystems.forEach(s => s.initialize?.());
        logger.info(`启动World: ${this.name}`);
    }

    /**
     * @zh 停止World
     * @en Stop World
     */
    public stop(): void {
        if (!this._isActive) return;

        this._activeScenes.forEach(name => this.setSceneActive(name, false));
        this._globalSystems.forEach(s => s.reset?.());
        this._isActive = false;
        logger.info(`停止World: ${this.name}`);
    }

    /**
     * @zh 销毁World
     * @en Destroy World
     */
    public destroy(): void {
        logger.info(`销毁World: ${this.name}`);

        this.stop();
        this.removeAllScenes();

        this._globalSystems.forEach(s => s.destroy?.() ?? s.reset?.());
        this._globalSystems.length = 0;

        this._services.clear();
        this._scenes.clear();
        this._activeScenes.clear();
    }


    /**
     * @zh 更新World中的全局System
     * @en Update global systems in World
     * @internal
     */
    public updateGlobalSystems(): void {
        if (!this._isActive) return;
        this._globalSystems.forEach(s => s.update?.());
    }

    /**
     * @zh 更新World中的所有激活Scene
     * @en Update all active scenes in World
     * @internal
     */
    public updateScenes(): void {
        if (!this._isActive) return;

        this._activeScenes.forEach(name => {
            this._scenes.get(name)?.update?.();
        });

        if (this._config.autoCleanup) {
            this.cleanup();
        }
    }


    /**
     * @zh 获取World状态
     * @en Get World status
     */
    public getStatus() {
        const scenes: Array<{ id: string; name: string; isActive: boolean }> = [];
        this._scenes.forEach((scene, id) => {
            scenes.push({
                id,
                name: scene.name || id,
                isActive: this._activeScenes.has(id)
            });
        });

        return {
            name: this.name,
            isActive: this._isActive,
            sceneCount: this._scenes.size,
            activeSceneCount: this._activeScenes.size,
            globalSystemCount: this._globalSystems.length,
            createdAt: this._createdAt,
            config: { ...this._config },
            scenes
        };
    }

    /**
     * @zh 获取World统计信息
     * @en Get World statistics
     */
    public getStats() {
        let totalEntities = 0;
        let totalSystems = this._globalSystems.length;

        this._scenes.forEach(scene => {
            totalEntities += scene.entities?.count ?? 0;
            totalSystems += scene.systems?.length ?? 0;
        });

        return {
            totalEntities,
            totalSystems,
            memoryUsage: 0,
            performance: {
                averageUpdateTime: 0,
                maxUpdateTime: 0
            }
        };
    }


    /**
     * @zh 验证Scene名称
     * @en Validate Scene name
     */
    private validateSceneName(sceneName: string): void {
        if (!sceneName?.trim()) {
            throw new Error('Scene name不能为空');
        }
        if (this._scenes.has(sceneName)) {
            throw new Error(`Scene name '${sceneName}' 已存在于World '${this.name}' 中`);
        }
        if (this._scenes.size >= this._config.maxScenes) {
            throw new Error(`World '${this.name}' 已达到最大Scene数量限制: ${this._config.maxScenes}`);
        }
    }

    /**
     * @zh 检查Scene是否可以被自动清理
     * @en Check if a scene is eligible for auto cleanup
     */
    private isCleanupCandidate(sceneName: string, scene: IScene): boolean {
        const elapsed = Date.now() - this._createdAt;
        return !this._activeScenes.has(sceneName) &&
            scene.entities != null &&
            scene.entities.count === 0 &&
            elapsed > this._config.cleanupThresholdMs;
    }

    /**
     * @zh 执行自动清理操作
     * @en Execute auto cleanup operation
     */
    private cleanup(): void {
        const toRemove: string[] = [];

        this._scenes.forEach((scene, name) => {
            if (this.isCleanupCandidate(name, scene)) {
                toRemove.push(name);
            }
        });

        toRemove.forEach(name => {
            this.removeScene(name);
            logger.debug(`自动清理空Scene: ${name} from World ${this.name}`);
        });
    }

}
