export interface ICreatePrefabFromNodeParams {
    /** 要转换为预制体的源节点路径 */
    nodePath: string;
    /** 预制体资源保存 URL */
    dbURL: string;
    /** 是否强制覆盖现有资源 */
    overwrite?: boolean;
}
export interface IApplyPrefabChangesParams {
    nodePath: string;
}
export interface IRevertToPrefabParams {
    nodePath: string;
}
export interface IUnpackPrefabInstanceParams {
    /** 要解耦的预制体实例节点 */
    nodePath: string;
    /** 递归解耦所有子预制体 */
    recursive?: boolean;
}
export interface IIsPrefabInstanceParams {
    nodePath: string;
}
export interface IGetPrefabInfoParams {
    nodePath: string;
}
