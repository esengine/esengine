"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceManager = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const global_1 = require("../global");
class ResourceManager {
    docsPath;
    constructor(docsPath) {
        this.docsPath = docsPath;
    }
    /**
     * 加载所有文档资源
     */
    loadAllResources() {
        const resources = [];
        const registeredUris = new Set();
        // 添加 Cocos 官方文档链接
        this.addCocosOfficialDocs(resources);
        // 加载本地文档资源
        this.loadDocsFromLanguageDirectories(resources, registeredUris);
        return resources;
    }
    /**
     * 只读取 zh 和 en 目录下的文档文件
     */
    loadDocsFromLanguageDirectories(resources, registeredUris) {
        try {
            resources.push({
                uri: 'cli://docs/readme',
                name: 'Readme',
                title: 'Readme',
                description: 'Cocos CLI Readme',
                filePath: (0, path_1.join)(global_1.GlobalPaths.workspace, 'readme.md'), // 存储完整文件路径
                mimeType: 'text/markdown'
            });
            const items = (0, fs_1.readdirSync)(this.docsPath);
            for (const item of items) {
                const fullPath = (0, path_1.join)(this.docsPath, item);
                const stat = (0, fs_1.statSync)(fullPath);
                // 只处理 zh 和 en 目录
                if (stat.isDirectory() && (item === 'zh' || item === 'en')) {
                    this.loadDocsFromDirectory(fullPath, item, resources, registeredUris);
                }
            }
        }
        catch (error) {
            console.warn(`Failed to read docs directory ${this.docsPath}:`, error);
        }
    }
    /**
     * 递归读取目录下的所有文档文件
     */
    loadDocsFromDirectory(dirPath, language, resources, registeredUris) {
        try {
            const items = (0, fs_1.readdirSync)(dirPath);
            for (const item of items) {
                const fullPath = (0, path_1.join)(dirPath, item);
                const stat = (0, fs_1.statSync)(fullPath);
                if (stat.isDirectory()) {
                    // 递归处理子目录
                    this.loadDocsFromDirectory(fullPath, language, resources, registeredUris);
                }
                else if (stat.isFile() && (0, path_1.extname)(item) === '.md') {
                    // 处理 Markdown 文件
                    try {
                        const fileName = (0, path_1.basename)(item, '.md');
                        // 只读取文件的前几行来提取标题，避免读取整个文件
                        const fileContent = (0, fs_1.readFileSync)(fullPath, 'utf-8');
                        const firstLines = fileContent.split('\n').slice(0, 10).join('\n');
                        const titleMatch = firstLines.match(/^#\s+(.+)$/m);
                        const title = titleMatch ? titleMatch[1].replace(/^[\u{1F3AE}\u{1F680}\u{1F4DA}\u{1F6E0}\u{1F4CB}\u{1F4E6}\u{2705}\u{1F3D7}\u{26A1}\u{1F4C2}\u{2139}\u{1F3A8}\u{1F50C}\u{2699}\u{1F6AB}\u{1F41B}\u{1F527}\u{274C}\u{26A0}\u{1F4C1}\u{1F3AF}\u{2753}\u{1F4D6}\u{1F4C4}\u{2728}]/gu, '').trim() : fileName;
                        // 生成描述
                        const description = `Cocos CLI ${title} - ${language}`;
                        // 生成相对路径（不包含语言前缀）
                        const relativePath = fullPath.replace((0, path_1.join)(global_1.GlobalPaths.workspace, 'docs', language), '').replace(/^[\\/]/, '');
                        const cleanPath = relativePath.replace(/\.md$/, '');
                        const uri = `cli://docs/${cleanPath}`;
                        // 检查 URI 是否已经注册，避免重复
                        if (!registeredUris.has(uri)) {
                            registeredUris.add(uri);
                            resources.push({
                                uri: uri,
                                name: title,
                                title: title,
                                description: description,
                                filePath: fullPath, // 存储完整文件路径
                                mimeType: 'text/markdown'
                            });
                        }
                    }
                    catch (error) {
                        console.warn(`Failed to process file ${fullPath}:`, error);
                    }
                }
            }
        }
        catch (error) {
            console.warn(`Failed to read directory ${dirPath}:`, error);
        }
    }
    /**
     * 添加 Cocos 官方文档链接
     */
    addCocosOfficialDocs(resources) {
        resources.push({
            uri: 'cocos://docs/api',
            name: 'Cocos Creator API 文档',
            title: 'Cocos Creator 引擎 API 参考',
            description: 'Cocos Creator 引擎的完整 API 参考文档',
            content: `# Cocos Creator 引擎 API 文档

这是 Cocos Creator 引擎的完整 API 参考文档。

## 在线文档
访问官方 API 文档：https://docs.cocos.com/creator/3.8/api/zh/

## 主要内容
- 核心类库 (cc)
- 组件系统
- 节点系统
- 渲染系统
- 物理系统
- 动画系统
- 音频系统
- 网络系统
- 资源管理

## 快速链接
- [API 参考](https://docs.cocos.com/creator/3.8/api/zh/)
- [引擎源码](https://github.com/cocos/cocos4)
- [社区论坛](https://forum.cocos.org/)`,
            mimeType: 'text/markdown'
        });
    }
    /**
     * 检测客户端语言偏好
     */
    detectClientLanguage(extra) {
        // 从请求头中获取语言信息
        const acceptLanguage = extra?.request?.headers?.['accept-language'] || '';
        // 解析 Accept-Language 头
        if (acceptLanguage) {
            const languages = acceptLanguage.split(',').map((lang) => {
                const [code, qValue] = lang.trim().split(';q=');
                return {
                    code: code.split('-')[0], // 只取主要语言代码
                    quality: qValue ? parseFloat(qValue) : 1.0
                };
            });
            // 按质量排序
            languages.sort((a, b) => b.quality - a.quality);
            // 检查是否支持中文
            for (const lang of languages) {
                if (lang.code === 'zh') {
                    return 'zh';
                }
            }
        }
        // 默认返回中文
        return 'zh';
    }
    /**
     * 根据语言偏好获取对应的文件路径
     */
    getLanguageSpecificPath(originalPath, preferredLanguage) {
        // 如果原始路径已经包含语言目录，替换为偏好语言
        const docsPath = (0, path_1.join)(global_1.GlobalPaths.workspace, 'docs');
        const relativePath = originalPath.replace(docsPath, '').replace(/^[\\/]/, '');
        // 移除现有的语言前缀
        const cleanPath = relativePath.replace(/^(zh|en)[\\/]/, '');
        // 构建新的语言特定路径
        const newPath = (0, path_1.join)(docsPath, preferredLanguage, cleanPath);
        // 检查文件是否存在，如果不存在则回退到英文
        try {
            (0, fs_1.statSync)(newPath);
            return newPath;
        }
        catch {
            // 回退到英文版本
            const fallbackPath = (0, path_1.join)(docsPath, 'en', cleanPath);
            try {
                (0, fs_1.statSync)(fallbackPath);
                return fallbackPath;
            }
            catch {
                // 如果英文版本也不存在，返回原始路径
                return originalPath;
            }
        }
    }
    /**
     * 动态读取文件内容
     */
    readFileContent(resource, preferredLanguage) {
        let textContent = resource.content;
        if (resource.filePath && !textContent) {
            try {
                // 根据语言偏好选择对应的文件
                const languageSpecificPath = this.getLanguageSpecificPath(resource.filePath, preferredLanguage);
                textContent = (0, fs_1.readFileSync)(languageSpecificPath, 'utf-8');
            }
            catch (error) {
                console.warn(`Failed to read file ${resource.filePath}:`, error);
                textContent = `# ${resource.title}\n\n文件读取失败: ${resource.filePath}`;
            }
        }
        return textContent || `# ${resource.title}\n\n内容不可用`;
    }
}
exports.ResourceManager = ResourceManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21jcC9yZXNvdXJjZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkJBQXlEO0FBQ3pELCtCQUErQztBQUMvQyxzQ0FBd0M7QUFZeEMsTUFBYSxlQUFlO0lBQ2hCLFFBQVEsQ0FBUztJQUV6QixZQUFZLFFBQWdCO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzdCLENBQUM7SUFFRDs7T0FFRztJQUNJLGdCQUFnQjtRQUNuQixNQUFNLFNBQVMsR0FBbUIsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFFekMsa0JBQWtCO1FBQ2xCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyQyxXQUFXO1FBQ1gsSUFBSSxDQUFDLCtCQUErQixDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUVoRSxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBRUQ7O09BRUc7SUFDSywrQkFBK0IsQ0FBQyxTQUF5QixFQUFFLGNBQTJCO1FBQzFGLElBQUksQ0FBQztZQUNELFNBQVMsQ0FBQyxJQUFJLENBQUM7Z0JBQ1gsR0FBRyxFQUFFLG1CQUFtQjtnQkFDeEIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsV0FBVyxFQUFFLGtCQUFrQjtnQkFDL0IsUUFBUSxFQUFFLElBQUEsV0FBSSxFQUFDLG9CQUFXLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxFQUFFLFdBQVc7Z0JBQy9ELFFBQVEsRUFBRSxlQUFlO2FBQzVCLENBQUMsQ0FBQztZQUNILE1BQU0sS0FBSyxHQUFHLElBQUEsZ0JBQVcsRUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFekMsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQztnQkFDdkIsTUFBTSxR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Q0FBQztnQkFDYixPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixRQUFRLENBQUMsUUFBUSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2pFLFdBQVcsR0FBRyxLQUFLLFFBQVEsQ0FBQyxLQUFLLGVBQWUsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3hFLENBQUM7UUFDTCxDQUFDO1FBRUQsT0FBTyxXQUFXLElBQUksS0FBSyxRQUFRLENBQUMsS0FBSyxXQUFXLENBQUM7SUFDekQsQ0FBQztDQUNKO0FBak9ELDBDQWlPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlYWRGaWxlU3luYywgcmVhZGRpclN5bmMsIHN0YXRTeW5jIH0gZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBqb2luLCBleHRuYW1lLCBiYXNlbmFtZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBHbG9iYWxQYXRocyB9IGZyb20gJy4uL2dsb2JhbCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlc291cmNlSW5mbyB7XHJcbiAgICB1cmk6IHN0cmluZztcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIHRpdGxlOiBzdHJpbmc7XHJcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xyXG4gICAgZmlsZVBhdGg/OiBzdHJpbmc7XHJcbiAgICBjb250ZW50Pzogc3RyaW5nO1xyXG4gICAgbWltZVR5cGU6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFJlc291cmNlTWFuYWdlciB7XHJcbiAgICBwcml2YXRlIGRvY3NQYXRoOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZG9jc1BhdGg6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZG9jc1BhdGggPSBkb2NzUGF0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9veaJgOacieaWh+aho+i1hOa6kFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbG9hZEFsbFJlc291cmNlcygpOiBSZXNvdXJjZUluZm9bXSB7XHJcbiAgICAgICAgY29uc3QgcmVzb3VyY2VzOiBSZXNvdXJjZUluZm9bXSA9IFtdO1xyXG4gICAgICAgIGNvbnN0IHJlZ2lzdGVyZWRVcmlzID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcblxyXG4gICAgICAgIC8vIOa3u+WKoCBDb2NvcyDlrpjmlrnmlofmoaPpk77mjqVcclxuICAgICAgICB0aGlzLmFkZENvY29zT2ZmaWNpYWxEb2NzKHJlc291cmNlcyk7XHJcbiAgICAgICAgLy8g5Yqg6L295pys5Zyw5paH5qGj6LWE5rqQXHJcbiAgICAgICAgdGhpcy5sb2FkRG9jc0Zyb21MYW5ndWFnZURpcmVjdG9yaWVzKHJlc291cmNlcywgcmVnaXN0ZXJlZFVyaXMpO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzb3VyY2VzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Y+q6K+75Y+WIHpoIOWSjCBlbiDnm67lvZXkuIvnmoTmlofmoaPmlofku7ZcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBsb2FkRG9jc0Zyb21MYW5ndWFnZURpcmVjdG9yaWVzKHJlc291cmNlczogUmVzb3VyY2VJbmZvW10sIHJlZ2lzdGVyZWRVcmlzOiBTZXQ8c3RyaW5nPik6IHZvaWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJlc291cmNlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHVyaTogJ2NsaTovL2RvY3MvcmVhZG1lJyxcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdSZWFkbWUnLFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdSZWFkbWUnLFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDb2NvcyBDTEkgUmVhZG1lJyxcclxuICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBqb2luKEdsb2JhbFBhdGhzLndvcmtzcGFjZSwgJ3JlYWRtZS5tZCcpLCAvLyDlrZjlgqjlrozmlbTmlofku7bot6/lvoRcclxuICAgICAgICAgICAgICAgIG1pbWVUeXBlOiAndGV4dC9tYXJrZG93bidcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0gcmVhZGRpclN5bmModGhpcy5kb2NzUGF0aCk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gam9pbih0aGlzLmRvY3NQYXRoLCBpdGVtKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXQgPSBzdGF0U3luYyhmdWxsUGF0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8g5Y+q5aSE55CGIHpoIOWSjCBlbiDnm67lvZVcclxuICAgICAgICAgICAgICAgIGlmIChzdGF0LmlzRGlyZWN0b3J5KCkgJiYgKGl0ZW0gPT09ICd6aCcgfHwgaXRlbSA9PT0gJ2VuJykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWREb2NzRnJvbURpcmVjdG9yeShmdWxsUGF0aCwgaXRlbSwgcmVzb3VyY2VzLCByZWdpc3RlcmVkVXJpcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byByZWFkIGRvY3MgZGlyZWN0b3J5ICR7dGhpcy5kb2NzUGF0aH06YCwgZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmAkuW9kuivu+WPluebruW9leS4i+eahOaJgOacieaWh+aho+aWh+S7tlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGxvYWREb2NzRnJvbURpcmVjdG9yeShkaXJQYXRoOiBzdHJpbmcsIGxhbmd1YWdlOiBzdHJpbmcsIHJlc291cmNlczogUmVzb3VyY2VJbmZvW10sIHJlZ2lzdGVyZWRVcmlzOiBTZXQ8c3RyaW5nPik6IHZvaWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0gcmVhZGRpclN5bmMoZGlyUGF0aCk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gam9pbihkaXJQYXRoLCBpdGVtKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXQgPSBzdGF0U3luYyhmdWxsUGF0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOmAkuW9kuWkhOeQhuWtkOebruW9lVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZERvY3NGcm9tRGlyZWN0b3J5KGZ1bGxQYXRoLCBsYW5ndWFnZSwgcmVzb3VyY2VzLCByZWdpc3RlcmVkVXJpcyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0YXQuaXNGaWxlKCkgJiYgZXh0bmFtZShpdGVtKSA9PT0gJy5tZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDlpITnkIYgTWFya2Rvd24g5paH5Lu2XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBiYXNlbmFtZShpdGVtLCAnLm1kJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlj6ror7vlj5bmlofku7bnmoTliY3lh6DooYzmnaXmj5Dlj5bmoIfpopjvvIzpgb/lhY3or7vlj5bmlbTkuKrmlofku7ZcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaXJzdExpbmVzID0gZmlsZUNvbnRlbnQuc3BsaXQoJ1xcbicpLnNsaWNlKDAsIDEwKS5qb2luKCdcXG4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGl0bGVNYXRjaCA9IGZpcnN0TGluZXMubWF0Y2goL14jXFxzKyguKykkL20pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IHRpdGxlTWF0Y2ggPyB0aXRsZU1hdGNoWzFdLnJlcGxhY2UoL15bXFx1ezFGM0FFfVxcdXsxRjY4MH1cXHV7MUY0REF9XFx1ezFGNkUwfVxcdXsxRjRDQn1cXHV7MUY0RTZ9XFx1ezI3MDV9XFx1ezFGM0Q3fVxcdXsyNkExfVxcdXsxRjRDMn1cXHV7MjEzOX1cXHV7MUYzQTh9XFx1ezFGNTBDfVxcdXsyNjk5fVxcdXsxRjZBQn1cXHV7MUY0MUJ9XFx1ezFGNTI3fVxcdXsyNzRDfVxcdXsyNkEwfVxcdXsxRjRDMX1cXHV7MUYzQUZ9XFx1ezI3NTN9XFx1ezFGNEQ2fVxcdXsxRjRDNH1cXHV7MjcyOH1dL2d1LCAnJykudHJpbSgpIDogZmlsZU5hbWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDnlJ/miJDmj4/ov7BcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBgQ29jb3MgQ0xJICR7dGl0bGV9IC0gJHtsYW5ndWFnZX1gO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g55Sf5oiQ55u45a+56Lev5b6E77yI5LiN5YyF5ZCr6K+t6KiA5YmN57yA77yJXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IGZ1bGxQYXRoLnJlcGxhY2Uoam9pbihHbG9iYWxQYXRocy53b3Jrc3BhY2UsICdkb2NzJywgbGFuZ3VhZ2UpLCAnJykucmVwbGFjZSgvXltcXFxcL10vLCAnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsZWFuUGF0aCA9IHJlbGF0aXZlUGF0aC5yZXBsYWNlKC9cXC5tZCQvLCAnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IGBjbGk6Ly9kb2NzLyR7Y2xlYW5QYXRofWA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmo4Dmn6UgVVJJIOaYr+WQpuW3sue7j+azqOWGjO+8jOmBv+WFjemHjeWkjVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlZ2lzdGVyZWRVcmlzLmhhcyh1cmkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpc3RlcmVkVXJpcy5hZGQodXJpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmk6IHVyaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBmdWxsUGF0aCwgLy8g5a2Y5YKo5a6M5pW05paH5Lu26Lev5b6EXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWltZVR5cGU6ICd0ZXh0L21hcmtkb3duJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBwcm9jZXNzIGZpbGUgJHtmdWxsUGF0aH06YCwgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIHJlYWQgZGlyZWN0b3J5ICR7ZGlyUGF0aH06YCwgZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoCBDb2NvcyDlrpjmlrnmlofmoaPpk77mjqVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhZGRDb2Nvc09mZmljaWFsRG9jcyhyZXNvdXJjZXM6IFJlc291cmNlSW5mb1tdKTogdm9pZCB7XHJcbiAgICAgICAgcmVzb3VyY2VzLnB1c2goXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHVyaTogJ2NvY29zOi8vZG9jcy9hcGknLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0NvY29zIENyZWF0b3IgQVBJIOaWh+ahoycsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NvY29zIENyZWF0b3Ig5byV5pOOIEFQSSDlj4LogIMnLFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDb2NvcyBDcmVhdG9yIOW8leaTjueahOWujOaVtCBBUEkg5Y+C6ICD5paH5qGjJyxcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGAjIENvY29zIENyZWF0b3Ig5byV5pOOIEFQSSDmlofmoaNcclxuXHJcbui/meaYryBDb2NvcyBDcmVhdG9yIOW8leaTjueahOWujOaVtCBBUEkg5Y+C6ICD5paH5qGj44CCXHJcblxyXG4jIyDlnKjnur/mlofmoaNcclxu6K6/6Zeu5a6Y5pa5IEFQSSDmlofmoaPvvJpodHRwczovL2RvY3MuY29jb3MuY29tL2NyZWF0b3IvMy44L2FwaS96aC9cclxuXHJcbiMjIOS4u+imgeWGheWuuVxyXG4tIOaguOW/g+exu+W6kyAoY2MpXHJcbi0g57uE5Lu257O757ufXHJcbi0g6IqC54K557O757ufXHJcbi0g5riy5p+T57O757ufXHJcbi0g54mp55CG57O757ufXHJcbi0g5Yqo55S757O757ufXHJcbi0g6Z+z6aKR57O757ufXHJcbi0g572R57uc57O757ufXHJcbi0g6LWE5rqQ566h55CGXHJcblxyXG4jIyDlv6vpgJ/pk77mjqVcclxuLSBbQVBJIOWPguiAg10oaHR0cHM6Ly9kb2NzLmNvY29zLmNvbS9jcmVhdG9yLzMuOC9hcGkvemgvKVxyXG4tIFvlvJXmk47mupDnoIFdKGh0dHBzOi8vZ2l0aHViLmNvbS9jb2Nvcy9jb2NvczQpXHJcbi0gW+ekvuWMuuiuuuWdm10oaHR0cHM6Ly9mb3J1bS5jb2Nvcy5vcmcvKWAsXHJcbiAgICAgICAgICAgICAgICBtaW1lVHlwZTogJ3RleHQvbWFya2Rvd24nXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qOA5rWL5a6i5oi356uv6K+t6KiA5YGP5aW9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBkZXRlY3RDbGllbnRMYW5ndWFnZShleHRyYTogYW55KTogc3RyaW5nIHtcclxuICAgICAgICAvLyDku47or7fmsYLlpLTkuK3ojrflj5bor63oqIDkv6Hmga9cclxuICAgICAgICBjb25zdCBhY2NlcHRMYW5ndWFnZSA9IGV4dHJhPy5yZXF1ZXN0Py5oZWFkZXJzPy5bJ2FjY2VwdC1sYW5ndWFnZSddIHx8ICcnO1xyXG5cclxuICAgICAgICAvLyDop6PmnpAgQWNjZXB0LUxhbmd1YWdlIOWktFxyXG4gICAgICAgIGlmIChhY2NlcHRMYW5ndWFnZSkge1xyXG4gICAgICAgICAgICBjb25zdCBsYW5ndWFnZXMgPSBhY2NlcHRMYW5ndWFnZS5zcGxpdCgnLCcpLm1hcCgobGFuZzogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBbY29kZSwgcVZhbHVlXSA9IGxhbmcudHJpbSgpLnNwbGl0KCc7cT0nKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29kZTogY29kZS5zcGxpdCgnLScpWzBdLCAvLyDlj6rlj5bkuLvopoHor63oqIDku6PnoIFcclxuICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiBxVmFsdWUgPyBwYXJzZUZsb2F0KHFWYWx1ZSkgOiAxLjBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8g5oyJ6LSo6YeP5o6S5bqPXHJcbiAgICAgICAgICAgIGxhbmd1YWdlcy5zb3J0KChhOiB7IGNvZGU6IHN0cmluZzsgcXVhbGl0eTogbnVtYmVyIH0sIGI6IHsgY29kZTogc3RyaW5nOyBxdWFsaXR5OiBudW1iZXIgfSkgPT4gYi5xdWFsaXR5IC0gYS5xdWFsaXR5KTtcclxuXHJcbiAgICAgICAgICAgIC8vIOajgOafpeaYr+WQpuaUr+aMgeS4reaWh1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxhbmcgb2YgbGFuZ3VhZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobGFuZy5jb2RlID09PSAnemgnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICd6aCc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOm7mOiupOi/lOWbnuS4reaWh1xyXG4gICAgICAgIHJldHVybiAnemgnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2u6K+t6KiA5YGP5aW96I635Y+W5a+55bqU55qE5paH5Lu26Lev5b6EXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRMYW5ndWFnZVNwZWNpZmljUGF0aChvcmlnaW5hbFBhdGg6IHN0cmluZywgcHJlZmVycmVkTGFuZ3VhZ2U6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgLy8g5aaC5p6c5Y6f5aeL6Lev5b6E5bey57uP5YyF5ZCr6K+t6KiA55uu5b2V77yM5pu/5o2i5Li65YGP5aW96K+t6KiAXHJcbiAgICAgICAgY29uc3QgZG9jc1BhdGggPSBqb2luKEdsb2JhbFBhdGhzLndvcmtzcGFjZSwgJ2RvY3MnKTtcclxuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBvcmlnaW5hbFBhdGgucmVwbGFjZShkb2NzUGF0aCwgJycpLnJlcGxhY2UoL15bXFxcXC9dLywgJycpO1xyXG5cclxuICAgICAgICAvLyDnp7vpmaTnjrDmnInnmoTor63oqIDliY3nvIBcclxuICAgICAgICBjb25zdCBjbGVhblBhdGggPSByZWxhdGl2ZVBhdGgucmVwbGFjZSgvXih6aHxlbilbXFxcXC9dLywgJycpO1xyXG5cclxuICAgICAgICAvLyDmnoTlu7rmlrDnmoTor63oqIDnibnlrprot6/lvoRcclxuICAgICAgICBjb25zdCBuZXdQYXRoID0gam9pbihkb2NzUGF0aCwgcHJlZmVycmVkTGFuZ3VhZ2UsIGNsZWFuUGF0aCk7XHJcblxyXG4gICAgICAgIC8vIOajgOafpeaWh+S7tuaYr+WQpuWtmOWcqO+8jOWmguaenOS4jeWtmOWcqOWImeWbnumAgOWIsOiLseaWh1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHN0YXRTeW5jKG5ld1BhdGgpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3UGF0aDtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgLy8g5Zue6YCA5Yiw6Iux5paH54mI5pysXHJcbiAgICAgICAgICAgIGNvbnN0IGZhbGxiYWNrUGF0aCA9IGpvaW4oZG9jc1BhdGgsICdlbicsIGNsZWFuUGF0aCk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0U3luYyhmYWxsYmFja1BhdGgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbGxiYWNrUGF0aDtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzoi7HmlofniYjmnKzkuZ/kuI3lrZjlnKjvvIzov5Tlm57ljp/lp4vot6/lvoRcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFBhdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliqjmgIHor7vlj5bmlofku7blhoXlrrlcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlYWRGaWxlQ29udGVudChyZXNvdXJjZTogUmVzb3VyY2VJbmZvLCBwcmVmZXJyZWRMYW5ndWFnZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgdGV4dENvbnRlbnQgPSByZXNvdXJjZS5jb250ZW50O1xyXG5cclxuICAgICAgICBpZiAocmVzb3VyY2UuZmlsZVBhdGggJiYgIXRleHRDb250ZW50KSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAvLyDmoLnmja7or63oqIDlgY/lpb3pgInmi6nlr7nlupTnmoTmlofku7ZcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxhbmd1YWdlU3BlY2lmaWNQYXRoID0gdGhpcy5nZXRMYW5ndWFnZVNwZWNpZmljUGF0aChyZXNvdXJjZS5maWxlUGF0aCwgcHJlZmVycmVkTGFuZ3VhZ2UpO1xyXG4gICAgICAgICAgICAgICAgdGV4dENvbnRlbnQgPSByZWFkRmlsZVN5bmMobGFuZ3VhZ2VTcGVjaWZpY1BhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gcmVhZCBmaWxlICR7cmVzb3VyY2UuZmlsZVBhdGh9OmAsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHRleHRDb250ZW50ID0gYCMgJHtyZXNvdXJjZS50aXRsZX1cXG5cXG7mlofku7bor7vlj5blpLHotKU6ICR7cmVzb3VyY2UuZmlsZVBhdGh9YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRleHRDb250ZW50IHx8IGAjICR7cmVzb3VyY2UudGl0bGV9XFxuXFxu5YaF5a655LiN5Y+v55SoYDtcclxuICAgIH1cclxufVxyXG4iXX0=