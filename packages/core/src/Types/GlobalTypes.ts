/**
 * @zh 全局类型声明 - 用于减少 as any 的使用
 * @en Global type declarations - to reduce as any usage
 */

// ============================================================================
// 小游戏平台 API 接口 | Mini-Game Platform API Interfaces
// ============================================================================

/**
 * @zh 小游戏平台基础 API 接口
 * @en Base interface for mini-game platform APIs
 */
export interface IMiniGamePlatformAPI {
    getSystemInfo?: (options?: { success?: (res: unknown) => void }) => void;
    getSystemInfoSync?: () => Record<string, unknown>;
    createCanvas?: () => HTMLCanvasElement;
    createImage?: () => HTMLImageElement;
}

/**
 * @zh 微信小游戏 API
 * @en WeChat Mini Game API
 */
export interface IWeChatMiniGameAPI extends IMiniGamePlatformAPI {
    env?: {
        USER_DATA_PATH?: string;
    };
    getFileSystemManager?: () => unknown;
    createInnerAudioContext?: () => unknown;
}

/**
 * @zh 字节跳动小游戏 API
 * @en ByteDance Mini Game API
 */
export interface IByteDanceMiniGameAPI extends IMiniGamePlatformAPI {
    // 继承 IMiniGamePlatformAPI 的可选方法
}

/**
 * @zh 支付宝小游戏 API
 * @en Alipay Mini Game API
 */
export interface IAlipayMiniGameAPI extends IMiniGamePlatformAPI {
    // 继承 IMiniGamePlatformAPI 的可选方法
}

/**
 * @zh 百度小游戏 API
 * @en Baidu Mini Game API
 */
export interface IBaiduMiniGameAPI extends IMiniGamePlatformAPI {
    // 继承 IMiniGamePlatformAPI 的可选方法
}

/**
 * @zh 扩展的 globalThis 类型，包含小游戏平台
 * @en Extended globalThis type with mini-game platforms
 */
export interface IGlobalThisWithMiniGame {
    wx?: IWeChatMiniGameAPI;
    tt?: IByteDanceMiniGameAPI;
    my?: IAlipayMiniGameAPI;
    swan?: IBaiduMiniGameAPI;
}

// ============================================================================
// Chrome 性能 API | Chrome Performance API
// ============================================================================

/**
 * @zh Chrome 内存信息接口
 * @en Chrome memory info interface
 */
export interface IChromeMemoryInfo {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
}

/**
 * @zh 扩展的 Performance 接口，包含 Chrome 特有 API
 * @en Extended Performance interface with Chrome-specific APIs
 */
export interface IPerformanceWithMemory extends Performance {
    memory?: IChromeMemoryInfo;
    measureUserAgentSpecificMemory?: () => Promise<{
        bytes: number;
        breakdown: Array<{
            bytes: number;
            types: string[];
            attribution: Array<{ scope: string; container?: unknown }>;
        }>;
    }>;
}

// ============================================================================
// 组件元数据接口 | Component Metadata Interface
// ============================================================================

/**
 * @zh SoA 组件类型元数据接口
 * @en SoA component type metadata interface
 *
 * @zh 用于 SoA 存储装饰器附加的元数据
 * @en Used for metadata attached by SoA storage decorators
 */
export interface IComponentTypeMetadata {
    __enableSoA?: boolean;
    __float64Fields?: Set<string>;
    __float32Fields?: Set<string>;
    __int32Fields?: Set<string>;
    __uint32Fields?: Set<string>;
    __int16Fields?: Set<string>;
    __uint16Fields?: Set<string>;
    __int8Fields?: Set<string>;
    __uint8Fields?: Set<string>;
    __uint8ClampedFields?: Set<string>;
    __highPrecisionFields?: Set<string>;
    __serializeMapFields?: Set<string>;
    __serializeSetFields?: Set<string>;
    __serializeArrayFields?: Set<string>;
    __deepCopyFields?: Set<string>;
}

/**
 * @zh 带元数据的组件构造函数类型
 * @en Component constructor type with metadata
 */
export type ComponentTypeWithMetadata<T> = (new () => T) & IComponentTypeMetadata;

// ============================================================================
// 类型守卫辅助函数 | Type Guard Helper Functions
// ============================================================================

/**
 * @zh 获取全局小游戏平台对象
 * @en Get global mini-game platform objects
 */
export function getGlobalWithMiniGame(): IGlobalThisWithMiniGame {
    return globalThis as unknown as IGlobalThisWithMiniGame;
}

/**
 * @zh 获取带内存 API 的 performance 对象
 * @en Get performance object with memory API
 */
export function getPerformanceWithMemory(): IPerformanceWithMemory {
    return performance as IPerformanceWithMemory;
}
