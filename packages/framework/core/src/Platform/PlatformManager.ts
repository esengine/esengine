import type { IPlatformAdapter } from './IPlatformAdapter';
import { createLogger, type ILogger } from '../Utils/Logger';

/**
 * 平台管理器
 * 用户需要手动注册平台适配器
 */
export class PlatformManager {
    private static _instance: PlatformManager;
    private _adapter: IPlatformAdapter | null = null;
    private readonly _logger: ILogger;

    private constructor() {
        this._logger = createLogger('PlatformManager');
    }

    /**
     * @zh 获取单例实例
     * @en Get singleton instance
     */
    public static getInstance(): PlatformManager {
        if (!PlatformManager._instance) {
            PlatformManager._instance = new PlatformManager();
        }
        return PlatformManager._instance;
    }

    /**
     * @zh 获取当前平台适配器
     * @en Get current platform adapter
     */
    public getAdapter(): IPlatformAdapter {
        if (!this._adapter) {
            throw new Error('平台适配器未注册，请调用 registerAdapter() 注册适配器');
        }
        return this._adapter;
    }

    /**
     * @zh 注册平台适配器
     * @en Register platform adapter
     */
    public registerAdapter(adapter: IPlatformAdapter): void {
        this._adapter = adapter;
        this._logger.info(`平台适配器已注册: ${adapter.name}`, {
            name: adapter.name,
            version: adapter.version,
            supportsWorker: adapter.isWorkerSupported(),
            supportsSharedArrayBuffer: adapter.isSharedArrayBufferSupported(),
            hardwareConcurrency: adapter.getHardwareConcurrency()
        });
    }

    /**
     * @zh 检查是否已注册适配器
     * @en Check if adapter is registered
     */
    public hasAdapter(): boolean {
        return this._adapter !== null;
    }


    /**
     * @zh 获取平台适配器信息（用于调试）
     * @en Get platform adapter info (for debugging)
     */
    public getAdapterInfo(): any {
        return this._adapter ? {
            name: this._adapter.name,
            version: this._adapter.version,
            config: this._adapter.getPlatformConfig()
        } : null;
    }

    /**
     * @zh 检查当前平台是否支持特定功能
     * @en Check if current platform supports specific feature
     */
    public supportsFeature(feature: 'worker' | 'shared-array-buffer' | 'transferable-objects' | 'module-worker'): boolean {
        if (!this._adapter) return false;

        const config = this._adapter.getPlatformConfig();

        switch (feature) {
            case 'worker':
                return this._adapter.isWorkerSupported();
            case 'shared-array-buffer':
                return this._adapter.isSharedArrayBufferSupported();
            case 'transferable-objects':
                return config.supportsTransferableObjects;
            case 'module-worker':
                return config.supportsModuleWorker;
            default:
                return false;
        }
    }

    /**
     * @zh 获取基础的Worker配置信息（不做自动决策）
     * @en Get basic Worker configuration (no auto-decision)
     *
     * @zh 用户应该根据自己的业务需求来配置Worker参数
     * @en Users should configure Worker parameters based on their business requirements
     */
    public getBasicWorkerConfig(): {
        platformSupportsWorker: boolean;
        platformSupportsSharedArrayBuffer: boolean;
        platformMaxWorkerCount: number;
        platformLimitations: any;
        } {
        if (!this._adapter) {
            return {
                platformSupportsWorker: false,
                platformSupportsSharedArrayBuffer: false,
                platformMaxWorkerCount: 1,
                platformLimitations: {}
            };
        }

        const config = this._adapter.getPlatformConfig();

        return {
            platformSupportsWorker: this._adapter.isWorkerSupported(),
            platformSupportsSharedArrayBuffer: this._adapter.isSharedArrayBufferSupported(),
            platformMaxWorkerCount: config.maxWorkerCount,
            platformLimitations: config.limitations || {}
        };
    }

    /**
     * @zh 异步获取完整的平台配置信息（包含性能信息）
     * @en Async get full platform configuration (includes performance info)
     */
    public async getFullPlatformConfig(): Promise<any> {
        if (!this._adapter) {
            throw new Error('平台适配器未注册');
        }

        if (typeof this._adapter.getPlatformConfigAsync === 'function') {
            return await this._adapter.getPlatformConfigAsync();
        }

        return this._adapter.getPlatformConfig();
    }
}
