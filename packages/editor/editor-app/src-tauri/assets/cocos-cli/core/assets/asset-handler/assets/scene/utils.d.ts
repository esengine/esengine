import { IBaseNode, IObjectRef } from './defines';
/**
 * 遍历每一个对象，找到带有 uuid 的 object 并执行 handle
 * @param object
 * @param handle
 */
export declare function walk(object: any, handle: (obj: object) => void): void;
export declare function walkAsync(object: any, handle: (obj: object) => void): Promise<void>;
/**
 * 查找一个 json 里面的 component
 * @param json
 * @param nodeIdx
 * @param compRE
 */
export declare function getComponent(json: any[], nodeIdx: number, compRE: RegExp): any;
/**
 * 遍历节点和它的子节点
 * @param json
 * @param nodeIdx
 * @param processFunc
 * @returns
 */
export declare function walkNode(json: any[], nodeRef: IObjectRef, processFunc: (nodeJson: IBaseNode, nodeRef: IObjectRef) => void): void;
/**
 * 遍历节点和它的子节点
 * @param json
 * @param nodeIdx
 * @param processFunc
 * @returns
 */
export declare function walkNodeAsync(json: any[], nodeRef: IObjectRef, processFunc: (nodeJson: IBaseNode, nodeRef: IObjectRef) => void): Promise<void>;
/**
 * 通过__id__获取node的prefab信息
 * @param json
 */
export declare function getPrefabOfNode(id: number, json: any[]): any;
export declare function isNestedPrefab(node: any, json: any[], prefabUuid: string): boolean;
/**
 * 遍历嵌套预制体实例的所有节点和组件
 * @param node 预制体所在节点json
 * @param json 场景jsonscene
 */
export declare function walkPrefabInstances(node: any, json: any[], sceneAsset: any, callback: Function): Promise<void>;
