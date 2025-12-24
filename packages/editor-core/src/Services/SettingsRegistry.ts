import { createLogger, type ILogger, type IService } from '@esengine/ecs-framework';
import { createRegistryToken } from './BaseRegistry';

/**
 * @zh 设置类型
 * @en Setting type
 */
export type SettingType = 'string' | 'number' | 'boolean' | 'select' | 'color' | 'range' | 'pluginList' | 'collisionMatrix' | 'moduleList';

/**
 * Localizable text - can be a plain string or a translation key (prefixed with '$')
 * 可本地化文本 - 可以是普通字符串或翻译键（以 '$' 为前缀）
 *
 * @example
 * // Plain text (not recommended for user-facing strings)
 * title: 'Appearance'
 *
 * // Translation key (recommended)
 * title: '$pluginSettings.appearance.title'
 */
export type LocalizableText = string;

/**
 * Check if text is a translation key (starts with '$')
 * 检查文本是否为翻译键（以 '$' 开头）
 */
export function isTranslationKey(text: string): boolean {
    return text.startsWith('$');
}

/**
 * Get the actual translation key (without '$' prefix)
 * 获取实际的翻译键（去掉 '$' 前缀）
 */
export function getTranslationKey(text: string): string {
    return text.startsWith('$') ? text.slice(1) : text;
}

export interface SettingOption {
  label: LocalizableText;
  value: any;
}

export interface SettingValidator {
  validate: (value: any) => boolean;
  errorMessage: LocalizableText;
}

export interface SettingDescriptor {
  key: string;
  /** Label text or translation key (prefixed with '$') | 标签文本或翻译键（以 '$' 为前缀） */
  label: LocalizableText;
  type: SettingType;
  defaultValue: any;
  /** Description text or translation key (prefixed with '$') | 描述文本或翻译键（以 '$' 为前缀） */
  description?: LocalizableText;
  /** Placeholder text or translation key (prefixed with '$') | 占位符文本或翻译键（以 '$' 为前缀） */
  placeholder?: LocalizableText;
  options?: SettingOption[];
  validator?: SettingValidator;
  min?: number;
  max?: number;
  step?: number;
  /**
   * Custom renderer component (for complex types like collisionMatrix)
   * 自定义渲染器组件（用于 collisionMatrix 等复杂类型）
   */
  customRenderer?: React.ComponentType<any>;
}

export interface SettingSection {
  id: string;
  /** Title text or translation key (prefixed with '$') | 标题文本或翻译键（以 '$' 为前缀） */
  title: LocalizableText;
  /** Description text or translation key (prefixed with '$') | 描述文本或翻译键（以 '$' 为前缀） */
  description?: LocalizableText;
  icon?: string;
  settings: SettingDescriptor[];
}

export interface SettingCategory {
  id: string;
  /** Title text or translation key (prefixed with '$') | 标题文本或翻译键（以 '$' 为前缀） */
  title: LocalizableText;
  /** Description text or translation key (prefixed with '$') | 描述文本或翻译键（以 '$' 为前缀） */
  description?: LocalizableText;
  sections: SettingSection[];
}

/**
 * @zh 设置注册表
 * @en Settings Registry
 */
export class SettingsRegistry implements IService {
    private readonly _categories = new Map<string, SettingCategory>();
    private readonly _logger: ILogger;

    constructor() {
        this._logger = createLogger('SettingsRegistry');
    }

    /** @zh 释放资源 @en Dispose resources */
    dispose(): void {
        this._categories.clear();
        this._logger.debug('Disposed');
    }

    /**
     * @zh 注册设置分类
     * @en Register setting category
     */
    registerCategory(category: SettingCategory): void {
        if (this._categories.has(category.id)) {
            this._logger.warn(`Overwriting category: ${category.id}`);
        }
        this._categories.set(category.id, category);
        this._logger.debug(`Registered category: ${category.id}`);
    }

    /**
     * @zh 注册设置分区
     * @en Register setting section
     */
    registerSection(categoryId: string, section: SettingSection): void {
        const category = this._ensureCategory(categoryId);

        const existingIndex = category.sections.findIndex(s => s.id === section.id);
        if (existingIndex >= 0) {
            category.sections[existingIndex] = section;
            this._logger.warn(`Overwriting section: ${section.id} in ${categoryId}`);
        } else {
            category.sections.push(section);
            this._logger.debug(`Registered section: ${section.id} in ${categoryId}`);
        }
    }

    /**
     * @zh 注册单个设置项
     * @en Register single setting
     */
    registerSetting(categoryId: string, sectionId: string, setting: SettingDescriptor): void {
        const category = this._ensureCategory(categoryId);
        const section = this._ensureSection(category, sectionId);

        const existingIndex = section.settings.findIndex(s => s.key === setting.key);
        if (existingIndex >= 0) {
            section.settings[existingIndex] = setting;
            this._logger.warn(`Overwriting setting: ${setting.key} in ${sectionId}`);
        } else {
            section.settings.push(setting);
            this._logger.debug(`Registered setting: ${setting.key} in ${sectionId}`);
        }
    }

    /**
     * @zh 确保分类存在
     * @en Ensure category exists
     */
    private _ensureCategory(categoryId: string): SettingCategory {
        let category = this._categories.get(categoryId);
        if (!category) {
            category = { id: categoryId, title: categoryId, sections: [] };
            this._categories.set(categoryId, category);
        }
        return category;
    }

    /**
     * @zh 确保分区存在
     * @en Ensure section exists
     */
    private _ensureSection(category: SettingCategory, sectionId: string): SettingSection {
        let section = category.sections.find(s => s.id === sectionId);
        if (!section) {
            section = { id: sectionId, title: sectionId, settings: [] };
            category.sections.push(section);
        }
        return section;
    }

    /** @zh 注销分类 @en Unregister category */
    unregisterCategory(categoryId: string): void {
        this._categories.delete(categoryId);
    }

    /** @zh 注销分区 @en Unregister section */
    unregisterSection(categoryId: string, sectionId: string): void {
        const category = this._categories.get(categoryId);
        if (!category) return;

        category.sections = category.sections.filter(s => s.id !== sectionId);
        if (category.sections.length === 0) {
            this._categories.delete(categoryId);
        }
    }

    /** @zh 获取分类 @en Get category */
    getCategory(categoryId: string): SettingCategory | undefined {
        return this._categories.get(categoryId);
    }

    /** @zh 获取所有分类 @en Get all categories */
    getAllCategories(): SettingCategory[] {
        return Array.from(this._categories.values());
    }

    /** @zh 获取设置项 @en Get setting */
    getSetting(categoryId: string, sectionId: string, key: string): SettingDescriptor | undefined {
        const section = this._categories.get(categoryId)?.sections.find(s => s.id === sectionId);
        return section?.settings.find(s => s.key === key);
    }

    /** @zh 获取所有设置项 @en Get all settings */
    getAllSettings(): Map<string, SettingDescriptor> {
        const allSettings = new Map<string, SettingDescriptor>();
        for (const category of this._categories.values()) {
            for (const section of category.sections) {
                for (const setting of section.settings) {
                    allSettings.set(setting.key, setting);
                }
            }
        }
        return allSettings;
    }

    /**
     * @zh 验证设置值
     * @en Validate setting value
     */
    validateSetting(setting: SettingDescriptor, value: unknown): boolean {
        if (setting.validator) {
            return setting.validator.validate(value);
        }

        switch (setting.type) {
            case 'number':
            case 'range':
                if (typeof value !== 'number') return false;
                if (setting.min !== undefined && value < setting.min) return false;
                if (setting.max !== undefined && value > setting.max) return false;
                return true;

            case 'boolean':
                return typeof value === 'boolean';

            case 'string':
                return typeof value === 'string';

            case 'select':
                return setting.options?.some(opt => opt.value === value) ?? false;

            case 'color':
                return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value);

            default:
                return true;
        }
    }
}

/** @zh 设置注册表服务标识符 @en Settings registry service identifier */
export const ISettingsRegistry = createRegistryToken<SettingsRegistry>('SettingsRegistry');
