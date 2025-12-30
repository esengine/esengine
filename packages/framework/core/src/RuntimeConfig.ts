import type { RuntimeEnvironment } from './Types';

/**
 * @zh 全局运行时配置
 * @en Global runtime configuration
 *
 * @zh 独立模块，避免 Core 和 Scene 之间的循环依赖
 * @en Standalone module to avoid circular dependency between Core and Scene
 */
class RuntimeConfigClass {
    private _runtimeEnvironment: RuntimeEnvironment = 'standalone';

    /**
     * @zh 获取运行时环境
     * @en Get runtime environment
     */
    get runtimeEnvironment(): RuntimeEnvironment {
        return this._runtimeEnvironment;
    }

    /**
     * @zh 设置运行时环境
     * @en Set runtime environment
     */
    set runtimeEnvironment(value: RuntimeEnvironment) {
        this._runtimeEnvironment = value;
    }

    /**
     * @zh 是否在服务端运行
     * @en Whether running on server
     */
    get isServer(): boolean {
        return this._runtimeEnvironment === 'server';
    }

    /**
     * @zh 是否在客户端运行
     * @en Whether running on client
     */
    get isClient(): boolean {
        return this._runtimeEnvironment === 'client';
    }
}

/**
 * @zh 全局运行时配置单例
 * @en Global runtime configuration singleton
 */
export const RuntimeConfig = new RuntimeConfigClass();
