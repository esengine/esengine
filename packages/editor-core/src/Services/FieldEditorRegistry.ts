/**
 * @zh 字段编辑器注册表
 * @en Field Editor Registry
 */

import { PrioritizedRegistry, createRegistryToken } from './BaseRegistry';
import type { IFieldEditor, IFieldEditorRegistry, FieldEditorContext } from './IFieldEditor';

/**
 * @zh 字段编辑器注册表
 * @en Field Editor Registry
 */
export class FieldEditorRegistry
    extends PrioritizedRegistry<IFieldEditor>
    implements IFieldEditorRegistry {

    constructor() {
        super('FieldEditorRegistry');
    }

    protected getItemKey(item: IFieldEditor): string {
        return item.type;
    }

    protected override getItemDisplayName(item: IFieldEditor): string {
        return `${item.name} (${item.type})`;
    }

    /**
     * @zh 获取字段编辑器
     * @en Get field editor
     */
    getEditor(type: string, context?: FieldEditorContext): IFieldEditor | undefined {
        // 先尝试精确匹配
        const exact = this.get(type);
        if (exact) return exact;

        // 再按优先级查找可处理的编辑器
        return this.findByPriority(editor => editor.canHandle(type, context));
    }

    /**
     * @zh 获取所有编辑器
     * @en Get all editors
     */
    getAllEditors(): IFieldEditor[] {
        return this.getAll();
    }
}

/** @zh 字段编辑器注册表服务标识符 @en Field editor registry service identifier */
export const FieldEditorRegistryToken = createRegistryToken<FieldEditorRegistry>('FieldEditorRegistry');
