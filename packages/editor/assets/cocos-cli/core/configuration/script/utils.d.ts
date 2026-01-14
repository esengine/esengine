/**
 * 配置管理工具函数
 */
/**
 * 通过点号分隔的路径获取嵌套对象的值
 * @param source 源对象
 * @param dotPath 点号分隔的路径，如 'builder.platforms.web-mobile'
 * @returns 找到的值，如果路径不存在返回 undefined
 */
export declare function getByDotPath(source: any, dotPath: string): any;
/**
 * 通过点号分隔的路径设置嵌套对象的值
 * @param target 目标对象
 * @param dotPath 点号分隔的路径
 * @param value 要设置的值
 */
export declare function setByDotPath(target: any, dotPath: string, value: any): void;
/**
 * 验证配置键名是否有效
 * @param key 配置键名
 * @returns 是否有效
 */
export declare function isValidConfigKey(key: string): boolean;
/**
 * 通过点号分隔的路径删除嵌套对象的值
 * @param target 目标对象
 * @param dotPath 点号分隔的路径
 * @returns 是否成功删除
 */
export declare function removeByDotPath(target: any, dotPath: string): boolean;
/**
 * 深度合并两个值
 * @param target 目标值
 * @param source 源值
 * @returns 合并后的值
 */
export declare function deepMerge(target: any, source: any): any;
