/**
 * 枚举选项，可以是字符串值或带标签的值
 */
export type EnumItem = string | {
    /** 选项显示的标签，支持 i18n:xxx */
    label: string;
    /** 选项的值 */
    value: string | number;
};
/**
 * 用户数据配置项的基础接口
 */
interface IConfigItemBase {
    /** 唯一标识符 */
    key?: string;
    /** 配置显示的名字，如果需要翻译，则传入 i18n:${key} */
    label?: string;
    /** 设置的简单说明，支持 i18n:xxx */
    description?: string;
    /** 默认值 */
    default?: any;
}
/**
 * 字符串类型配置项
 */
export interface IConfigItemString extends IConfigItemBase {
    type: 'string';
    /** 最小长度 */
    minLength?: number;
    /** 最大长度 */
    maxLength?: number;
    /** 正则表达式验证 */
    pattern?: string;
    default?: string;
}
/**
 * 数字类型配置项
 */
export interface IConfigItemNumber extends IConfigItemBase {
    type: 'number';
    /** 最小值 */
    minimum?: number;
    /** 最大值 */
    maximum?: number;
    /** 步长 */
    step?: number;
    default?: number;
}
/**
 * 布尔类型配置项
 */
export interface IConfigItemBoolean extends IConfigItemBase {
    type: 'boolean';
    default?: boolean;
}
/**
 * 枚举类型配置项
 */
export interface IConfigItemEnum extends IConfigItemBase {
    type: 'enum';
    /** 枚举选项列表，可以是字符串数组或对象数组 */
    items: EnumItem[];
    /** 默认值必须是 items 中的值 */
    default?: string | number;
}
/**
 * 数组类型配置项
 */
export interface IConfigItemArray extends IConfigItemBase {
    type: 'array';
    /** 数组项配置，定义数组中每个元素的类型和结构 */
    items: IConfigItem | IConfigItem[];
    /** 最小数组长度 */
    minItems?: number;
    /** 最大数组长度 */
    maxItems?: number;
    /** 默认值必须是数组 */
    default?: any[];
}
/**
 * 对象类型配置项
 */
export interface IConfigItemObject extends IConfigItemBase {
    type: 'object';
    /** 对象属性配置，定义对象中每个属性的类型和结构 */
    properties: Record<string, IConfigItem>;
    /** 必需属性列表 */
    required?: string[];
    /** 默认值必须是对象 */
    default?: Record<string, any>;
}
/**
 * 用户数据配置项
 * 根据 type 字段的不同，需要提供相应的必需字段：
 * - enum: 必须提供 items
 * - array: 必须提供 items
 * - object: 必须提供 properties
 * - boolean/string/number: 只需基本字段
 */
export type IConfigItem = IConfigItemString | IConfigItemNumber | IConfigItemBoolean | IConfigItemEnum | IConfigItemArray | IConfigItemObject;
export {};
