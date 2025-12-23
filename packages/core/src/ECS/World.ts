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
export type IGlobalSystem = {
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
export type IWorldConfig = {
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
     *
     * @default 300000 (5 minutes)
     */
    cleanupThresholdMs?: number;
}

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
 * @zh 这种设计允许创建独立的游戏世界，如：
 * - 游戏房间（每个房间一个World）
 * - 不同的游戏模式
 * - 独立的模拟环境
 * @en This design allows creating independent game worlds like:
 * - Game rooms (one World per room)
 * - Different game modes
 * - Independent simulation environments
 *
 * @example
 * ```typescript
 * // @zh 创建游戏房间的World | @en Create World for game room
 * const roomWorld = new World({ name: 'Room_001' });
 *
 * // @zh 注册World级别的服务 | @en Register World-level service
 * roomWorld.services.registerSingleton(RoomManager);
 *
 * // @zh 在World中创建Scene | @en Create Scene in World
 * const gameScene = roomWorld.createScene('game', new Scene());
 * const uiScene = roomWorld.createScene('ui', new Scene());
 *
 * // @zh 在Scene中使用World级别的服务 | @en Use World-level service in Scene
 * const roomManager = roomWorld.services.resolve(RoomManager);
 *
 * // @zh 更新整个World | @en Update entire World
 * roomWorld.update(deltaTime);
 * ```
 */
export class World {
    public readonly name: string;
    private readonly _config: IWorldConfig;
    private readonly _scenes: Map<string, IScene> = new Map();
    private readonly _activeScenes: Set<string> = new Set();
    private readonly _globalSystems: IGlobalSystem[] = [];
    private readonly _services: ServiceContainer;
    private _isActive: boolean = false;
    private _createdAt: number;

    constructor(config: IWorldConfig = {}) {
        this._config = {
            name: 'World',
            debug: false,
            maxScenes: 10,
            autoCleanup: true,
            cleanupThresholdMs: 5 * 60 * 1000,
            ...config
        };

        this.name = this._config.name!;
        this._createdAt = Date.now();
        this._services = new ServiceContainer();
    }

    /**
     * @zh World级别的服务容器，用于管理World范围内的全局服务
     * @en World-level service container for managing World-scoped global services
     */
    public get services(): ServiceContainer {
        return this._services;
    }

    /**
     * @zh 创建并添加Scene到World
     * @en Create and add Scene to World
     *
     * @param sceneName - @zh Scene名称 @en Scene name
     * @param sceneInstance - @zh Scene实例（可选）@en Scene instance (optional)
     * @returns @zh 创建的Scene实例 @en Created Scene instance
     */
    public createScene<T extends IScene>(sceneName: string, sceneInstance?: T): T {
        if (!sceneName || typeof sceneName !== 'string' || sceneName.trim() === '') {
            throw new Error('Scene name不能为空');
        }

        if (this._scenes.has(sceneName)) {
            throw new Error(`Scene name '${sceneName}' 已存在于World '${this.name}' 中`);
        }

        if (this._scenes.size >= this._config.maxScenes!) {
            throw new Error(`World '${this.name}' 已达到最大Scene数量限制: ${this._config.maxScenes}`);
        }

        const scene = sceneInstance || (new Scene() as unknown as T);

        if (this._config.debug) {
            const performanceMonitor = new PerformanceMonitor();
            performanceMonitor.enable();
            scene.services.registerInstance(PerformanceMonitor, performanceMonitor);
        }

        (scene as { id?: string }).id = sceneName;
        if (!scene.name) {
            scene.name = sceneName;
        }

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
        if (!scene) {
            return false;
        }

        if (this._activeScenes.has(sceneName)) {
            this.setSceneActive(sceneName, false);
        }

        scene.end();
        this._scenes.delete(sceneName);

        logger.info(`从World '${this.name}' 中移除Scene: ${sceneName}`);
        return true;
    }

    /**
     * @zh 获取Scene
     * @en Get Scene
     *
     * @param sceneName - @zh Scene名称 @en Scene name
     * @returns @zh Scene实例或null @en Scene instance or null
     */
    public getScene<T extends IScene>(sceneName: string): T | null {
        return this._scenes.get(sceneName) as T || null;
    }

    /**
     * 获取所有Scene ID
     */
    public getSceneIds(): string[] {
        return Array.from(this._scenes.keys());
    }

    /**
     * 获取所有Scene
     */
    public getAllScenes(): IScene[] {
        return Array.from(this._scenes.values());
    }

    /**
     * 移除所有Scene
     */
    public removeAllScenes(): void {
        const sceneNames = Array.from(this._scenes.keys());
        for (const sceneName of sceneNames) {
            this.removeScene(sceneName);
        }
        logger.info(`从World '${this.name}' 中移除所有Scene`);
    }

    /**
     * 设置Scene激活状态
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
     * 检查Scene是否激活
     */
    public isSceneActive(sceneName: string): boolean {
        return this._activeScenes.has(sceneName);
    }

    /**
     * 获取活跃Scene数量
     */
    public getActiveSceneCount(): number {
        return this._activeScenes.size;
    }

    /**
     * 添加全局System
     * 全局System会在所有激活Scene之前更新
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
     * 移除全局System
     */
    public removeGlobalSystem(system: IGlobalSystem): boolean {
        const index = this._globalSystems.indexOf(system);
        if (index === -1) {
            return false;
        }

        this._globalSystems.splice(index, 1);
        system.reset?.();

        logger.debug(`从World '${this.name}' 中移除全局System: ${system.name}`);
        return true;
    }

    /**
     * 获取全局System
     */
    public getGlobalSystem<T extends IGlobalSystem>(type: new (...args: any[]) => T): T | null {
        for (const system of this._globalSystems) {
            if (system instanceof type) {
                return system as T;
            }
        }
        return null;
    }

    /**
     * 启动World
     */
    public start(): void {
        if (this._isActive) {
            return;
        }

        this._isActive = true;

        for (const system of this._globalSystems) {
            system.initialize?.();
        }

        logger.info(`启动World: ${this.name}`);
    }

    /**
     * 停止World
     */
    public stop(): void {
        if (!this._isActive) {
            return;
        }

        for (const sceneName of this._activeScenes) {
            this.setSceneActive(sceneName, false);
        }

        for (const system of this._globalSystems) {
            system.reset?.();
        }

        this._isActive = false;
        logger.info(`停止World: ${this.name}`);
    }

    /**
     * @zh 更新World中的全局System
     * @en Update global systems in World
     *
     * @internal Called by Core.update()
     */
    public updateGlobalSystems(): void {
        if (!this._isActive) {
            return;
        }

        for (const system of this._globalSystems) {
            system.update?.();
        }
    }

    /**
     * @zh 更新World中的所有激活Scene
     * @en Update all active scenes in World
     *
     * @internal Called by Core.update()
     */
    public updateScenes(): void {
        if (!this._isActive) {
            return;
        }

        for (const sceneName of this._activeScenes) {
            const scene = this._scenes.get(sceneName);
            scene?.update?.();
        }

        if (this._config.autoCleanup) {
            this.cleanup();
        }
    }

    /**
     * 销毁World
     */
    public destroy(): void {
        logger.info(`销毁World: ${this.name}`);

        this.stop();

        for (const sceneName of Array.from(this._scenes.keys())) {
            this.removeScene(sceneName);
        }

        for (const system of this._globalSystems) {
            if (system.destroy) {
                system.destroy();
            } else {
                system.reset?.();
            }
        }
        this._globalSystems.length = 0;

        this._services.clear();
        this._scenes.clear();
        this._activeScenes.clear();
    }

    /**
     * 获取World状态
     */
    public getStatus() {
        return {
            name: this.name,
            isActive: this._isActive,
            sceneCount: this._scenes.size,
            activeSceneCount: this._activeScenes.size,
            globalSystemCount: this._globalSystems.length,
            createdAt: this._createdAt,
            config: { ...this._config },
            scenes: Array.from(this._scenes.keys()).map((sceneName) => ({
                id: sceneName,
                isActive: this._activeScenes.has(sceneName),
                name: this._scenes.get(sceneName)?.name || sceneName
            }))
        };
    }

    /**
     * 获取World统计信息
     */
    public getStats() {
        const stats = {
            totalEntities: 0,
            totalSystems: this._globalSystems.length,
            memoryUsage: 0,
            performance: {
                averageUpdateTime: 0,
                maxUpdateTime: 0
            }
        };

        for (const scene of this._scenes.values()) {
            stats.totalEntities += scene.entities?.count ?? 0;
            stats.totalSystems += scene.systems?.length ?? 0;
        }

        return stats;
    }

    /**
     * @zh 检查Scene是否可以被自动清理
     * @en Check if a scene is eligible for auto cleanup
     */
    private _isSceneCleanupCandidate(sceneName: string, scene: IScene): boolean {
        const elapsed = Date.now() - this._createdAt;
        return !this._activeScenes.has(sceneName) &&
            scene.entities != null &&
            scene.entities.count === 0 &&
            elapsed > this._config.cleanupThresholdMs!;
    }

    /**
     * @zh 执行自动清理操作
     * @en Execute auto cleanup operation
     */
    private cleanup(): void {
        const candidates = [...this._scenes.entries()]
            .filter(([name, scene]) => this._isSceneCleanupCandidate(name, scene));

        for (const [sceneName] of candidates) {
            this.removeScene(sceneName);
            logger.debug(`自动清理空Scene: ${sceneName} from World ${this.name}`);
        }
    }

    /**
     * 检查World是否激活
     */
    public get isActive(): boolean {
        return this._isActive;
    }

    /**
     * 获取Scene数量
     */
    public get sceneCount(): number {
        return this._scenes.size;
    }

    /**
     * 获取创建时间
     */
    public get createdAt(): number {
        return this._createdAt;
    }
}
