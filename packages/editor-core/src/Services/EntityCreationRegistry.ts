/**
 * @zh 实体创建模板注册表
 * @en Entity Creation Registry Service
 *
 * @zh 管理场景层级右键菜单中的实体创建模板
 * @en Manages entity creation templates for the scene hierarchy context menu
 */

import { BaseRegistry, createRegistryToken } from './BaseRegistry';
import type { EntityCreationTemplate } from '../Types/UITypes';

/**
 * @zh 实体创建模板注册表
 * @en Entity Creation Registry
 */
export class EntityCreationRegistry extends BaseRegistry<EntityCreationTemplate> {
    constructor() {
        super('EntityCreationRegistry');
    }

    protected getItemKey(item: EntityCreationTemplate): string {
        return item.id;
    }

    protected override getItemDisplayName(item: EntityCreationTemplate): string {
        return `${item.label} (${item.id})`;
    }

    /**
     * @zh 获取所有模板（按 order 排序）
     * @en Get all templates sorted by order
     */
    getAllSorted(): EntityCreationTemplate[] {
        return this.sortByOrder(this.getAll(), 100);
    }

    /**
     * @zh 获取指定分类的模板
     * @en Get templates by category
     */
    getByCategory(category: string): EntityCreationTemplate[] {
        return this.sortByOrder(this.filter(t => t.category === category), 100);
    }
}

/** @zh 实体创建模板注册表服务标识符 @en Entity creation registry service identifier */
export const IEntityCreationRegistry = createRegistryToken<EntityCreationRegistry>('EntityCreationRegistry');
