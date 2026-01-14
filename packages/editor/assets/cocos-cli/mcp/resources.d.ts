export interface ResourceInfo {
    uri: string;
    name: string;
    title: string;
    description: string;
    filePath?: string;
    content?: string;
    mimeType: string;
}
export declare class ResourceManager {
    private docsPath;
    constructor(docsPath: string);
    /**
     * 加载所有文档资源
     */
    loadAllResources(): ResourceInfo[];
    /**
     * 只读取 zh 和 en 目录下的文档文件
     */
    private loadDocsFromLanguageDirectories;
    /**
     * 递归读取目录下的所有文档文件
     */
    private loadDocsFromDirectory;
    /**
     * 添加 Cocos 官方文档链接
     */
    private addCocosOfficialDocs;
    /**
     * 检测客户端语言偏好
     */
    detectClientLanguage(extra: any): string;
    /**
     * 根据语言偏好获取对应的文件路径
     */
    getLanguageSpecificPath(originalPath: string, preferredLanguage: string): string;
    /**
     * 动态读取文件内容
     */
    readFileContent(resource: ResourceInfo, preferredLanguage: string): string;
}
