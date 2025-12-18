/**
 * Asset File Loader Interface
 * 资产文件加载器接口
 *
 * High-level file loading abstraction that combines path resolution
 * with platform-specific file reading.
 * 高级文件加载抽象，结合路径解析和平台特定的文件读取。
 *
 * This is the unified entry point for all file loading in the engine.
 * Different from IAssetLoader (which parses content), this interface
 * handles the actual file fetching from asset paths.
 * 这是引擎中所有文件加载的统一入口。
 * 与 IAssetLoader（解析内容）不同，此接口处理从资产路径获取文件。
 */

/**
 * Asset file loader interface.
 * 资产文件加载器接口。
 *
 * Provides a unified API for loading files from asset paths (relative to project).
 * Different platforms provide their own implementations.
 * 提供从资产路径（相对于项目）加载文件的统一 API。
 * 不同平台提供各自的实现。
 *
 * @example
 * ```typescript
 * // Get global loader
 * const loader = getGlobalAssetFileLoader();
 *
 * // Load image from asset path (relative to project)
 * const image = await loader.loadImage('assets/demo/button.png');
 *
 * // Load text content
 * const json = await loader.loadText('assets/config.json');
 * ```
 */
export interface IAssetFileLoader {
    /**
     * Load image from asset path.
     * 从资产路径加载图片。
     *
     * @param assetPath - Asset path relative to project (e.g., "assets/demo/button.png").
     *                    相对于项目的资产路径。
     * @returns Promise resolving to HTMLImageElement. | 返回 HTMLImageElement 的 Promise。
     */
    loadImage(assetPath: string): Promise<HTMLImageElement>;

    /**
     * Load text content from asset path.
     * 从资产路径加载文本内容。
     *
     * @param assetPath - Asset path relative to project. | 相对于项目的资产路径。
     * @returns Promise resolving to text content. | 返回文本内容的 Promise。
     */
    loadText(assetPath: string): Promise<string>;

    /**
     * Load binary data from asset path.
     * 从资产路径加载二进制数据。
     *
     * @param assetPath - Asset path relative to project. | 相对于项目的资产路径。
     * @returns Promise resolving to ArrayBuffer. | 返回 ArrayBuffer 的 Promise。
     */
    loadBinary(assetPath: string): Promise<ArrayBuffer>;

    /**
     * Check if asset file exists.
     * 检查资产文件是否存在。
     *
     * @param assetPath - Asset path relative to project. | 相对于项目的资产路径。
     * @returns Promise resolving to boolean. | 返回布尔值的 Promise。
     */
    exists(assetPath: string): Promise<boolean>;
}

/**
 * Global asset file loader instance.
 * 全局资产文件加载器实例。
 */
let globalAssetFileLoader: IAssetFileLoader | null = null;

/**
 * Set the global asset file loader.
 * 设置全局资产文件加载器。
 *
 * Should be called during engine initialization with platform-specific implementation.
 * 应在引擎初始化期间使用平台特定的实现调用。
 *
 * @param loader - Asset file loader instance or null. | 资产文件加载器实例或 null。
 */
export function setGlobalAssetFileLoader(loader: IAssetFileLoader | null): void {
    globalAssetFileLoader = loader;
}

/**
 * Get the global asset file loader.
 * 获取全局资产文件加载器。
 *
 * @returns Asset file loader instance or null. | 资产文件加载器实例或 null。
 */
export function getGlobalAssetFileLoader(): IAssetFileLoader | null {
    return globalAssetFileLoader;
}
