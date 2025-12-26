/**
 * Editor Asset File Loader
 * 编辑器资产文件加载器
 *
 * Platform-specific implementation of IAssetFileLoader for Tauri editor.
 * Combines path resolution with TauriAssetReader for unified asset loading.
 * Tauri 编辑器的 IAssetFileLoader 平台特定实现。
 * 结合路径解析和 TauriAssetReader 实现统一的资产加载。
 */

import type { IAssetFileLoader, IAssetReader } from '@esengine/asset-system';

/**
 * Configuration for EditorAssetFileLoader.
 * EditorAssetFileLoader 配置。
 */
export interface EditorAssetFileLoaderConfig {
    /**
     * Function to get current project path.
     * 获取当前项目路径的函数。
     */
    getProjectPath: () => string | null;
}

/**
 * Editor asset file loader implementation.
 * 编辑器资产文件加载器实现。
 *
 * This loader combines:
 * - Path resolution: converts relative asset paths to absolute paths
 * - Platform reading: uses IAssetReader (TauriAssetReader) for actual file loading
 *
 * 此加载器结合：
 * - 路径解析：将相对资产路径转换为绝对路径
 * - 平台读取：使用 IAssetReader (TauriAssetReader) 进行实际文件加载
 *
 * @example
 * ```typescript
 * const loader = new EditorAssetFileLoader(assetReader, {
 *     getProjectPath: () => projectService.getCurrentProject()?.path
 * });
 *
 * // Load from relative asset path
 * const image = await loader.loadImage('assets/demo/button.png');
 * ```
 */
export class EditorAssetFileLoader implements IAssetFileLoader {
    /**
     * Create a new editor asset file loader.
     * 创建新的编辑器资产文件加载器。
     *
     * @param assetReader - Platform-specific asset reader (e.g., TauriAssetReader).
     *                      平台特定的资产读取器。
     * @param config - Loader configuration. | 加载器配置。
     */
    constructor(
        private readonly assetReader: IAssetReader,
        private readonly config: EditorAssetFileLoaderConfig
    ) {}

    /**
     * Load image from asset path.
     * 从资产路径加载图片。
     */
    async loadImage(assetPath: string): Promise<HTMLImageElement> {
        const absolutePath = this.resolveToAbsolutePath(assetPath);
        return this.assetReader.loadImage(absolutePath);
    }

    /**
     * Load text content from asset path.
     * 从资产路径加载文本内容。
     */
    async loadText(assetPath: string): Promise<string> {
        const absolutePath = this.resolveToAbsolutePath(assetPath);
        return this.assetReader.readText(absolutePath);
    }

    /**
     * Load binary data from asset path.
     * 从资产路径加载二进制数据。
     */
    async loadBinary(assetPath: string): Promise<ArrayBuffer> {
        const absolutePath = this.resolveToAbsolutePath(assetPath);
        return this.assetReader.readBinary(absolutePath);
    }

    /**
     * Check if asset file exists.
     * 检查资产文件是否存在。
     */
    async exists(assetPath: string): Promise<boolean> {
        const absolutePath = this.resolveToAbsolutePath(assetPath);
        return this.assetReader.exists(absolutePath);
    }

    /**
     * Resolve relative asset path to absolute file system path.
     * 将相对资产路径解析为绝对文件系统路径。
     *
     * @param assetPath - Relative asset path (e.g., "assets/demo/button.png").
     *                    相对资产路径。
     * @returns Absolute file system path. | 绝对文件系统路径。
     */
    private resolveToAbsolutePath(assetPath: string): string {
        // Already an absolute path or URL - return as-is
        // 已经是绝对路径或 URL - 直接返回
        if (this.isAbsoluteOrUrl(assetPath)) {
            return assetPath;
        }

        // Get project path and combine with asset path
        // 获取项目路径并与资产路径组合
        const projectPath = this.config.getProjectPath();
        if (!projectPath) {
            // No project open, return original path
            // 没有打开项目，返回原始路径
            console.warn('[EditorAssetFileLoader] No project open, cannot resolve path:', assetPath);
            return assetPath;
        }

        // Determine separator based on project path format
        // 根据项目路径格式确定分隔符
        const separator = projectPath.includes('\\') ? '\\' : '/';

        // Normalize asset path separators to match project path
        // 规范化资产路径分隔符以匹配项目路径
        const normalizedAssetPath = assetPath.replace(/\//g, separator);

        // Combine paths
        // 组合路径
        return `${projectPath}${separator}${normalizedAssetPath}`;
    }

    /**
     * Check if path is already absolute or a URL.
     * 检查路径是否已经是绝对路径或 URL。
     */
    private isAbsoluteOrUrl(path: string): boolean {
        return (
            path.startsWith('http://') ||
            path.startsWith('https://') ||
            path.startsWith('data:') ||
            path.startsWith('asset://') ||
            path.startsWith('/') ||
            /^[a-zA-Z]:/.test(path)  // Windows absolute path (e.g., "C:\...")
        );
    }
}
