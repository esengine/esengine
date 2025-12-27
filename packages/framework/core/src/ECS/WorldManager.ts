import { World, IWorldConfig } from './World';
import { createLogger } from '../Utils/Logger';
import type { IService } from '../Core/ServiceContainer';

const logger = createLogger('WorldManager');

/**
 * @zh WorldManager配置接口
 * @en WorldManager configuration interface
 */
export interface IWorldManagerConfig {
    /**
     * @zh 最大World数量
     * @en Maximum number of worlds
     */
    maxWorlds?: number;

    /**
     * @zh 是否自动清理空World
     * @en Auto cleanup empty worlds
     */
    autoCleanup?: boolean;

    /**
     * @zh 清理间隔（帧数）
     * @en Cleanup interval in frames
     */
    cleanupFrameInterval?: number;

    /**
     * @zh 是否启用调试模式
     * @en Enable debug mode
     */
    debug?: boolean;
}

/**
 * @zh WorldManager默认配置
 * @en WorldManager default configuration
 */
const DEFAULT_CONFIG: Required<IWorldManagerConfig> = {
    maxWorlds: 50,
    autoCleanup: true,
    cleanupFrameInterval: 1800,
    debug: false
};

/**
 * @zh 清理阈值（毫秒）
 * @en Cleanup threshold in milliseconds
 */
const CLEANUP_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

/**
 * @zh World管理器 - 管理所有World实例
 * @en World Manager - Manages all World instances
 *
 * @zh WorldManager负责管理多个独立的World实例。
 * 每个World都是独立的ECS环境，可以包含多个Scene。
 * @en WorldManager is responsible for managing multiple independent World instances.
 * Each World is an isolated ECS environment that can contain multiple Scenes.
 *
 * @zh 适用场景：
 * - MMO游戏的多房间管理
 * - 服务器端的多游戏实例
 * - 需要完全隔离的多个游戏环境
 * @en Use cases:
 * - Multi-room management for MMO games
 * - Multiple game instances on server-side
 * - Completely isolated game environments
 *
 * @example
 * ```typescript
 * const worldManager = new WorldManager({ maxWorlds: 100 });
 * const room = worldManager.createWorld('room_001');
 * worldManager.setWorldActive('room_001', true);
 * ```
 */
export class WorldManager implements IService {
    private readonly _config: Required<IWorldManagerConfig>;
    private readonly _worlds = new Map<string, World>();
    private _isRunning = true;
    private _framesSinceCleanup = 0;

    constructor(config: IWorldManagerConfig = {}) {
        this._config = { ...DEFAULT_CONFIG, ...config };

        logger.info('WorldManager已初始化', {
            maxWorlds: this._config.maxWorlds,
            autoCleanup: this._config.autoCleanup,
            cleanupFrameInterval: this._config.cleanupFrameInterval
        });
    }

    /**
     * @zh 获取World总数
     * @en Get total world count
     */
    public get worldCount(): number {
        return this._worlds.size;
    }

    /**
     * @zh 获取激活World数量
     * @en Get active world count
     */
    public get activeWorldCount(): number {
        let count = 0;
        this._worlds.forEach(world => {
            if (world.isActive) count++;
        });
        return count;
    }

    /**
     * @zh 检查是否正在运行
     * @en Check if running
     */
    public get isRunning(): boolean {
        return this._isRunning;
    }

    /**
     * @zh 获取配置
     * @en Get configuration
     */
    public get config(): IWorldManagerConfig {
        return { ...this._config };
    }

    /**
     * @zh 创建新World
     * @en Create new World
     *
     * @param worldName - @zh World名称 @en World name
     * @param config - @zh World配置 @en World configuration
     * @returns @zh 创建的World实例 @en Created World instance
     * @throws @zh 名称为空、重复或超出限制时抛出错误 @en Throws if name is empty, duplicate, or limit exceeded
     */
    public createWorld(worldName: string, config?: IWorldConfig): World {
        this.validateWorldName(worldName);

        const worldConfig: IWorldConfig = {
            ...config,
            name: worldName,
            debug: config?.debug ?? this._config.debug
        };

        const world = new World(worldConfig);
        this._worlds.set(worldName, world);

        return world;
    }

    /**
     * @zh 移除World
     * @en Remove World
     *
     * @param worldName - @zh World名称 @en World name
     * @returns @zh 是否成功移除 @en Whether removal was successful
     */
    public removeWorld(worldName: string): boolean {
        const world = this._worlds.get(worldName);
        if (!world) return false;

        world.destroy();
        this._worlds.delete(worldName);
        logger.info(`移除World: ${worldName}`);

        return true;
    }

    /**
     * @zh 获取World
     * @en Get World
     *
     * @param worldName - @zh World名称 @en World name
     * @returns @zh World实例或null @en World instance or null
     */
    public getWorld(worldName: string): World | null {
        return this._worlds.get(worldName) ?? null;
    }

    /**
     * @zh 获取所有World ID
     * @en Get all World IDs
     */
    public getWorldIds(): string[] {
        return Array.from(this._worlds.keys());
    }

    /**
     * @zh 获取所有World
     * @en Get all Worlds
     */
    public getAllWorlds(): World[] {
        return Array.from(this._worlds.values());
    }

    /**
     * @zh 设置World激活状态
     * @en Set World active state
     *
     * @param worldName - @zh World名称 @en World name
     * @param active - @zh 是否激活 @en Whether to activate
     */
    public setWorldActive(worldName: string, active: boolean): void {
        const world = this._worlds.get(worldName);
        if (!world) {
            logger.warn(`World '${worldName}' 不存在`);
            return;
        }

        if (active) {
            world.start();
            logger.debug(`激活World: ${worldName}`);
        } else {
            world.stop();
            logger.debug(`停用World: ${worldName}`);
        }
    }

    /**
     * @zh 检查World是否激活
     * @en Check if World is active
     */
    public isWorldActive(worldName: string): boolean {
        return this._worlds.get(worldName)?.isActive ?? false;
    }

    /**
     * @zh 获取所有激活的World
     * @en Get all active Worlds
     */
    public getActiveWorlds(): World[] {
        const result: World[] = [];
        this._worlds.forEach(world => {
            if (world.isActive) result.push(world);
        });
        return result;
    }

    /**
     * @zh 查找满足条件的World
     * @en Find Worlds matching predicate
     *
     * @param predicate - @zh 过滤条件 @en Filter predicate
     */
    public findWorlds(predicate: (world: World) => boolean): World[] {
        const result: World[] = [];
        this._worlds.forEach(world => {
            if (predicate(world)) result.push(world);
        });
        return result;
    }

    /**
     * @zh 根据名称查找World
     * @en Find World by name
     *
     * @param name - @zh World名称 @en World name
     */
    public findWorldByName(name: string): World | null {
        let found: World | null = null;
        this._worlds.forEach(world => {
            if (world.name === name) found = world;
        });
        return found;
    }

    /**
     * @zh 启动所有World
     * @en Start all Worlds
     */
    public startAll(): void {
        this._isRunning = true;
        this._worlds.forEach(world => world.start());
        logger.info('启动所有World');
    }

    /**
     * @zh 停止所有World
     * @en Stop all Worlds
     */
    public stopAll(): void {
        this._isRunning = false;
        this._worlds.forEach(world => world.stop());
        logger.info('停止所有World');
    }

    /**
     * @zh 销毁WorldManager
     * @en Destroy WorldManager
     */
    public destroy(): void {
        logger.info('正在销毁WorldManager...');

        this.stopAll();

        const worldNames = Array.from(this._worlds.keys());
        worldNames.forEach(name => this.removeWorld(name));

        this._worlds.clear();
        this._isRunning = false;

        logger.info('WorldManager已销毁');
    }

    /**
     * @zh 实现 IService 接口的 dispose 方法
     * @en Implement IService dispose method
     */
    public dispose(): void {
        this.destroy();
    }

    /**
     * @zh 更新所有活跃的World
     * @en Update all active Worlds
     *
     * @zh 应该在每帧的游戏循环中调用
     * @en Should be called in each frame of game loop
     */
    public updateAll(): void {
        if (!this._isRunning) return;

        this._worlds.forEach(world => {
            if (world.isActive) {
                world.updateGlobalSystems();
                world.updateScenes();
            }
        });

        this.processAutoCleanup();
    }

    /**
     * @zh 获取WorldManager统计信息
     * @en Get WorldManager statistics
     */
    public getStats() {
        let totalScenes = 0;
        let totalEntities = 0;
        let totalSystems = 0;
        const worldsList: Array<{
            id: string;
            name: string;
            isActive: boolean;
            sceneCount: number;
            totalEntities: number;
            totalSystems: number;
        }> = [];

        this._worlds.forEach((world, worldName) => {
            const worldStats = world.getStats();
            totalScenes += world.sceneCount;
            totalEntities += worldStats.totalEntities;
            totalSystems += worldStats.totalSystems;

            worldsList.push({
                id: worldName,
                name: world.name,
                isActive: world.isActive,
                sceneCount: world.sceneCount,
                ...worldStats
            });
        });

        return {
            totalWorlds: this._worlds.size,
            activeWorlds: this.activeWorldCount,
            totalScenes,
            totalEntities,
            totalSystems,
            memoryUsage: 0,
            isRunning: this._isRunning,
            config: { ...this._config },
            worlds: worldsList
        };
    }

    /**
     * @zh 获取详细状态信息
     * @en Get detailed status information
     */
    public getDetailedStatus() {
        const worlds: Array<{
            id: string;
            isActive: boolean;
            status: ReturnType<World['getStatus']>;
        }> = [];

        this._worlds.forEach((world, worldName) => {
            worlds.push({
                id: worldName,
                isActive: world.isActive,
                status: world.getStatus()
            });
        });

        return { ...this.getStats(), worlds };
    }

    /**
     * @zh 清理空World
     * @en Cleanup empty Worlds
     *
     * @returns @zh 清理的World数量 @en Number of cleaned up Worlds
     */
    public cleanup(): number {
        const toRemove: string[] = [];

        this._worlds.forEach((world, worldName) => {
            if (this.isCleanupCandidate(world)) {
                toRemove.push(worldName);
            }
        });

        toRemove.forEach(name => this.removeWorld(name));

        if (toRemove.length > 0) {
            logger.debug(`清理了 ${toRemove.length} 个World`);
        }

        return toRemove.length;
    }

    /**
     * @zh 验证World名称
     * @en Validate World name
     */
    private validateWorldName(worldName: string): void {
        if (!worldName?.trim()) {
            throw new Error('World name不能为空');
        }
        if (this._worlds.has(worldName)) {
            throw new Error(`World name '${worldName}' 已存在`);
        }
        if (this._worlds.size >= this._config.maxWorlds) {
            throw new Error(`已达到最大World数量限制: ${this._config.maxWorlds}`);
        }
    }

    /**
     * @zh 处理自动清理
     * @en Process auto cleanup
     */
    private processAutoCleanup(): void {
        if (!this._config.autoCleanup) return;

        this._framesSinceCleanup++;

        if (this._framesSinceCleanup >= this._config.cleanupFrameInterval) {
            this.cleanup();
            this._framesSinceCleanup = 0;

            if (this._config.debug) {
                logger.debug(`执行定期清理World (间隔: ${this._config.cleanupFrameInterval} 帧)`);
            }
        }
    }

    /**
     * @zh 判断World是否应该被清理
     * @en Check if World should be cleaned up
     *
     * @zh 清理策略：未激活 + (无Scene或全空Scene) + 创建超过10分钟
     * @en Cleanup policy: inactive + (no scenes or all empty) + created over 10 minutes ago
     */
    private isCleanupCandidate(world: World): boolean {
        if (world.isActive) return false;

        const age = Date.now() - world.createdAt;
        if (age <= CLEANUP_THRESHOLD_MS) return false;

        if (world.sceneCount === 0) return true;

        const hasEntities = world.getAllScenes().some(
            scene => scene.entities && scene.entities.count > 0
        );

        return !hasEntities;
    }
}
