/**
 * @zh 文件系统 Memory 存储
 * @en File System Memory Store
 *
 * @zh 使用文件系统存储玩家 Memory 和世界状态
 * @en Uses file system to store player Memory and world state
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import type {
    IMemoryStore,
    PlayerMemory,
    WorldState,
    MemoryStoreStats
} from './IMemoryStore';

/**
 * @zh 文件存储配置
 * @en File storage configuration
 */
export interface FileMemoryStoreConfig {
    /**
     * @zh 存储根目录
     * @en Storage root directory
     */
    basePath: string;

    /**
     * @zh 是否美化 JSON 输出
     * @en Whether to prettify JSON output
     */
    prettyPrint?: boolean;

    /**
     * @zh Memory 大小限制（字节）
     * @en Memory size limit (bytes)
     */
    memorySizeLimit?: number;
}

/**
 * @zh 默认配置
 * @en Default configuration
 */
const DEFAULT_CONFIG: Required<FileMemoryStoreConfig> = {
    basePath: './data',
    prettyPrint: true,
    memorySizeLimit: 2 * 1024 * 1024 // 2MB
};

/**
 * @zh 文件系统 Memory 存储
 * @en File System Memory Store
 *
 * @zh 简单的文件存储实现，适合开发和小规模部署
 * @en Simple file storage implementation, suitable for development and small deployments
 *
 * @example
 * ```typescript
 * const store = new FileMemoryStore({ basePath: './game-data' });
 * await store.init();
 *
 * // 保存玩家 Memory | Save player Memory
 * await store.savePlayerMemory('player1', { creeps: {} });
 *
 * // 加载玩家 Memory | Load player Memory
 * const memory = await store.loadPlayerMemory('player1');
 * ```
 */
export class FileMemoryStore implements IMemoryStore {
    /**
     * @zh 配置
     * @en Configuration
     */
    private readonly _config: Required<FileMemoryStoreConfig>;

    /**
     * @zh Memory 目录路径
     * @en Memory directory path
     */
    private readonly _memoryPath: string;

    /**
     * @zh 世界状态文件路径
     * @en World state file path
     */
    private readonly _worldPath: string;

    /**
     * @zh 是否已初始化
     * @en Whether initialized
     */
    private _initialized: boolean = false;

    constructor(config: Partial<FileMemoryStoreConfig> = {}) {
        this._config = { ...DEFAULT_CONFIG, ...config };
        this._memoryPath = path.join(this._config.basePath, 'memory');
        this._worldPath = path.join(this._config.basePath, 'world.json');
    }

    /**
     * @zh 初始化存储（创建目录）
     * @en Initialize storage (create directories)
     */
    async init(): Promise<void> {
        if (this._initialized) return;

        try {
            await fs.mkdir(this._memoryPath, { recursive: true });
            this._initialized = true;
        } catch (error) {
            throw new Error(`Failed to initialize storage: ${error}`);
        }
    }

    /**
     * @zh 确保已初始化
     * @en Ensure initialized
     */
    private async _ensureInit(): Promise<void> {
        if (!this._initialized) {
            await this.init();
        }
    }

    /**
     * @zh 获取玩家 Memory 文件路径
     * @en Get player Memory file path
     */
    private _getPlayerMemoryPath(playerId: string): string {
        // 清理 playerId 以防止路径遍历 | Sanitize playerId to prevent path traversal
        const safeId = playerId.replace(/[^a-zA-Z0-9_-]/g, '_');
        return path.join(this._memoryPath, `${safeId}.json`);
    }

    /**
     * @zh 加载玩家 Memory
     * @en Load player Memory
     */
    async loadPlayerMemory(playerId: string): Promise<PlayerMemory> {
        await this._ensureInit();

        const filePath = this._getPlayerMemoryPath(playerId);

        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content) as PlayerMemory;
        } catch (error) {
            // 文件不存在则返回空对象 | Return empty object if file doesn't exist
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return {};
            }
            throw new Error(`Failed to load Memory for ${playerId}: ${error}`);
        }
    }

    /**
     * @zh 保存玩家 Memory
     * @en Save player Memory
     */
    async savePlayerMemory(playerId: string, memory: PlayerMemory): Promise<void> {
        await this._ensureInit();

        const content = this._config.prettyPrint
            ? JSON.stringify(memory, null, 2)
            : JSON.stringify(memory);

        // 检查大小限制 | Check size limit
        if (content.length > this._config.memorySizeLimit) {
            throw new Error(
                `Memory size (${content.length} bytes) exceeds limit ` +
                `(${this._config.memorySizeLimit} bytes) for player ${playerId}`
            );
        }

        const filePath = this._getPlayerMemoryPath(playerId);

        try {
            await fs.writeFile(filePath, content, 'utf-8');
        } catch (error) {
            throw new Error(`Failed to save Memory for ${playerId}: ${error}`);
        }
    }

    /**
     * @zh 批量保存玩家 Memory
     * @en Batch save player Memory
     */
    async savePlayerMemoryBatch(
        entries: Array<{ playerId: string; memory: PlayerMemory }>
    ): Promise<void> {
        await this._ensureInit();

        // 并行保存所有玩家 | Save all players in parallel
        await Promise.all(
            entries.map(({ playerId, memory }) =>
                this.savePlayerMemory(playerId, memory)
            )
        );
    }

    /**
     * @zh 删除玩家 Memory
     * @en Delete player Memory
     */
    async deletePlayerMemory(playerId: string): Promise<void> {
        await this._ensureInit();

        const filePath = this._getPlayerMemoryPath(playerId);

        try {
            await fs.unlink(filePath);
        } catch (error) {
            // 文件不存在则忽略 | Ignore if file doesn't exist
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw new Error(`Failed to delete Memory for ${playerId}: ${error}`);
            }
        }
    }

    /**
     * @zh 获取所有玩家 ID
     * @en Get all player IDs
     */
    async getAllPlayerIds(): Promise<string[]> {
        await this._ensureInit();

        try {
            const files = await fs.readdir(this._memoryPath);
            return files
                .filter(f => f.endsWith('.json'))
                .map(f => f.slice(0, -5)); // 移除 .json 后缀 | Remove .json suffix
        } catch (error) {
            return [];
        }
    }

    /**
     * @zh 加载世界状态
     * @en Load world state
     */
    async loadWorldState(): Promise<WorldState | null> {
        await this._ensureInit();

        try {
            const content = await fs.readFile(this._worldPath, 'utf-8');
            return JSON.parse(content) as WorldState;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return null;
            }
            throw new Error(`Failed to load world state: ${error}`);
        }
    }

    /**
     * @zh 保存世界状态
     * @en Save world state
     */
    async saveWorldState(state: WorldState): Promise<void> {
        await this._ensureInit();

        const stateWithTimestamp: WorldState = {
            ...state,
            lastSaveTime: Date.now()
        };

        const content = this._config.prettyPrint
            ? JSON.stringify(stateWithTimestamp, null, 2)
            : JSON.stringify(stateWithTimestamp);

        try {
            await fs.writeFile(this._worldPath, content, 'utf-8');
        } catch (error) {
            throw new Error(`Failed to save world state: ${error}`);
        }
    }

    /**
     * @zh 获取存储统计信息
     * @en Get storage statistics
     */
    async getStats(): Promise<MemoryStoreStats> {
        await this._ensureInit();

        const playerIds = await this.getAllPlayerIds();
        let totalSize = 0;
        let lastSaveTime = 0;

        for (const playerId of playerIds) {
            try {
                const filePath = this._getPlayerMemoryPath(playerId);
                const stats = await fs.stat(filePath);
                totalSize += stats.size;
                if (stats.mtimeMs > lastSaveTime) {
                    lastSaveTime = stats.mtimeMs;
                }
            } catch {
                // 忽略错误 | Ignore errors
            }
        }

        // 加上世界状态文件大小 | Add world state file size
        try {
            const worldStats = await fs.stat(this._worldPath);
            totalSize += worldStats.size;
            if (worldStats.mtimeMs > lastSaveTime) {
                lastSaveTime = worldStats.mtimeMs;
            }
        } catch {
            // 忽略错误 | Ignore errors
        }

        return {
            playerCount: playerIds.length,
            totalSize,
            lastSaveTime
        };
    }

    /**
     * @zh 清除所有数据（慎用！）
     * @en Clear all data (use with caution!)
     */
    async clearAll(): Promise<void> {
        await this._ensureInit();

        const playerIds = await this.getAllPlayerIds();
        await Promise.all(playerIds.map(id => this.deletePlayerMemory(id)));

        try {
            await fs.unlink(this._worldPath);
        } catch {
            // 忽略错误 | Ignore errors
        }
    }
}
