import { IService, createLogger, type ILogger } from '@esengine/ecs-framework';
import type { FileActionHandler, FileCreationTemplate } from '../Plugin/EditorModule';
import { createRegistryToken } from './BaseRegistry';

export type { FileCreationTemplate } from '../Plugin/EditorModule';

/**
 * @zh 资产创建消息映射
 * @en Asset creation message mapping
 */
export interface AssetCreationMapping {
    /** @zh 文件扩展名（包含点号，如 '.tilemap'） @en File extension (with dot) */
    extension: string;
    /** @zh 创建资产时发送的消息名 @en Message name to publish when creating asset */
    createMessage: string;
    /** @zh 是否支持创建（可选，默认 true） @en Whether creation is supported */
    canCreate?: boolean;
}

/** @zh FileActionRegistry 服务标识符 @en FileActionRegistry service identifier */
export const IFileActionRegistry = createRegistryToken<FileActionRegistry>('FileActionRegistry');

/**
 * @zh 文件操作注册表服务 - 管理插件注册的文件操作处理器和文件创建模板
 * @en File Action Registry Service - Manages file action handlers and creation templates
 */
export class FileActionRegistry implements IService {
    private readonly _actionHandlers = new Map<string, FileActionHandler[]>();
    private readonly _creationTemplates: FileCreationTemplate[] = [];
    private readonly _assetCreationMappings = new Map<string, AssetCreationMapping>();
    private readonly _logger: ILogger;

    constructor() {
        this._logger = createLogger('FileActionRegistry');
    }

    /**
     * @zh 规范化扩展名（确保以 . 开头且小写）
     * @en Normalize extension (ensure starts with . and lowercase)
     */
    private _normalizeExtension(ext: string): string {
        const lower = ext.toLowerCase();
        return lower.startsWith('.') ? lower : `.${lower}`;
    }

    /** @zh 注册文件操作处理器 @en Register file action handler */
    registerActionHandler(handler: FileActionHandler): void {
        for (const ext of handler.extensions) {
            const handlers = this._actionHandlers.get(ext) ?? [];
            handlers.push(handler);
            this._actionHandlers.set(ext, handlers);
        }
    }

    /** @zh 注销文件操作处理器 @en Unregister file action handler */
    unregisterActionHandler(handler: FileActionHandler): void {
        for (const ext of handler.extensions) {
            const handlers = this._actionHandlers.get(ext);
            if (!handlers) continue;

            const index = handlers.indexOf(handler);
            if (index !== -1) handlers.splice(index, 1);
            if (handlers.length === 0) this._actionHandlers.delete(ext);
        }
    }

    /** @zh 注册文件创建模板 @en Register file creation template */
    registerCreationTemplate(template: FileCreationTemplate): void {
        this._creationTemplates.push(template);
    }

    /** @zh 注销文件创建模板 @en Unregister file creation template */
    unregisterCreationTemplate(template: FileCreationTemplate): void {
        const index = this._creationTemplates.indexOf(template);
        if (index !== -1) this._creationTemplates.splice(index, 1);
    }

    /** @zh 获取文件扩展名的处理器 @en Get handlers for extension */
    getHandlersForExtension(extension: string): FileActionHandler[] {
        return this._actionHandlers.get(extension) ?? [];
    }

    /** @zh 获取文件的处理器 @en Get handlers for file */
    getHandlersForFile(filePath: string): FileActionHandler[] {
        const ext = this._extractFileExtension(filePath);
        return ext ? this.getHandlersForExtension(ext) : [];
    }

    /** @zh 获取所有文件创建模板 @en Get all creation templates */
    getCreationTemplates(): FileCreationTemplate[] {
        return this._creationTemplates;
    }

    /** @zh 处理文件双击 @en Handle file double click */
    async handleDoubleClick(filePath: string): Promise<boolean> {
        for (const handler of this.getHandlersForFile(filePath)) {
            if (handler.onDoubleClick) {
                await handler.onDoubleClick(filePath);
                return true;
            }
        }
        return false;
    }

    /** @zh 处理文件打开 @en Handle file open */
    async handleOpen(filePath: string): Promise<boolean> {
        for (const handler of this.getHandlersForFile(filePath)) {
            if (handler.onOpen) {
                await handler.onOpen(filePath);
                return true;
            }
        }
        return false;
    }

    /** @zh 注册资产创建消息映射 @en Register asset creation mapping */
    registerAssetCreationMapping(mapping: AssetCreationMapping): void {
        const ext = this._normalizeExtension(mapping.extension);
        this._assetCreationMappings.set(ext, { ...mapping, extension: ext });
        this._logger.debug(`Registered asset creation mapping: ${ext}`);
    }

    /** @zh 注销资产创建消息映射 @en Unregister asset creation mapping */
    unregisterAssetCreationMapping(extension: string): void {
        const ext = this._normalizeExtension(extension);
        if (this._assetCreationMappings.delete(ext)) {
            this._logger.debug(`Unregistered asset creation mapping: ${ext}`);
        }
    }

    /** @zh 获取扩展名对应的资产创建消息映射 @en Get asset creation mapping for extension */
    getAssetCreationMapping(extension: string): AssetCreationMapping | undefined {
        return this._assetCreationMappings.get(this._normalizeExtension(extension));
    }

    /** @zh 检查扩展名是否支持创建资产 @en Check if extension supports asset creation */
    canCreateAsset(extension: string): boolean {
        return this.getAssetCreationMapping(extension)?.canCreate !== false;
    }

    /** @zh 获取所有资产创建映射 @en Get all asset creation mappings */
    getAllAssetCreationMappings(): AssetCreationMapping[] {
        return Array.from(this._assetCreationMappings.values());
    }

    /** @zh 清空所有注册 @en Clear all registrations */
    clear(): void {
        this._actionHandlers.clear();
        this._creationTemplates.length = 0;
        this._assetCreationMappings.clear();
    }

    /** @zh 释放资源 @en Dispose resources */
    dispose(): void {
        this.clear();
    }

    /** @zh 提取文件扩展名 @en Extract file extension */
    private _extractFileExtension(filePath: string): string | null {
        const lastDot = filePath.lastIndexOf('.');
        return lastDot === -1 ? null : filePath.substring(lastDot + 1).toLowerCase();
    }
}
