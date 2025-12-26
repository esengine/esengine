/**
 * @zh 项目配置
 * @en Project configuration
 */
export interface ProjectConfig {
    /** @zh 项目名称 @en Project name */
    name: string;
    /** @zh 目标平台 @en Target platform */
    platform: PlatformType;
    /** @zh 项目路径 @en Project path */
    path: string;
}

/**
 * @zh 支持的平台类型
 * @en Supported platform types
 */
export type PlatformType = 'cocos' | 'cocos2' | 'laya' | 'nodejs';

/**
 * @zh 文件入口
 * @en File entry
 */
export interface FileEntry {
    /** @zh 相对路径 @en Relative path */
    path: string;
    /** @zh 文件内容 @en File content */
    content: string;
}

/**
 * @zh 平台适配器接口
 * @en Platform adapter interface
 *
 * @zh 每个平台只需实现这个接口，即可支持项目生成
 * @en Each platform only needs to implement this interface to support project generation
 */
export interface PlatformAdapter {
    /** @zh 平台标识 @en Platform identifier */
    readonly id: PlatformType;

    /** @zh 平台显示名称 @en Platform display name */
    readonly name: string;

    /** @zh 平台描述 @en Platform description */
    readonly description: string;

    /**
     * @zh 获取平台特定的依赖
     * @en Get platform-specific dependencies
     */
    getDependencies(): Record<string, string>;

    /**
     * @zh 获取平台特定的开发依赖
     * @en Get platform-specific dev dependencies
     */
    getDevDependencies(): Record<string, string>;

    /**
     * @zh 生成平台特定的文件
     * @en Generate platform-specific files
     */
    generateFiles(config: ProjectConfig): FileEntry[];

    /**
     * @zh 获取 package.json 的 scripts
     * @en Get package.json scripts
     */
    getScripts(): Record<string, string>;
}

/**
 * @zh 平台适配器注册表类型
 * @en Platform adapter registry type
 */
export type AdapterRegistry = Record<PlatformType, PlatformAdapter>;
