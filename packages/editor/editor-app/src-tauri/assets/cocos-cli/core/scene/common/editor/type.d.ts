/**
 * 场景模板类型
 */
export declare const SCENE_TEMPLATE_TYPE: readonly ["2d", "3d", "quality"];
export type TSceneTemplateType = typeof SCENE_TEMPLATE_TYPE[number];
/**
 * 创建类型
 */
export declare const CREATE_TYPES: readonly ["scene", "prefab"];
export type ICreateType = typeof CREATE_TYPES[number];
