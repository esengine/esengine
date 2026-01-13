import { Component, Node, Prefab } from 'cc';
interface IAddPrefabInfoOption {
    nodeFileIdGenerator?: (node: Node) => string;
    compFileIdGenerator?: (comp: Component, index: number) => string;
}
/**
 * 递归循环所有的子节点，执行 handle 方法
 * @param {*} node
 * @param {*} handle
 */
export declare function walkNode(node: Node, handle: (node: Node, isChild: boolean) => boolean | void, isChild?: boolean): void;
export declare function visitObjTypeReferences(node: Node, visitor: any): void;
export declare function addPrefabInfo(targetNode: Node, rootNode: Node, asset: Prefab, opts?: IAddPrefabInfoOption): void;
export declare function checkAndStripNode(node: Node, quiet?: boolean | undefined): Record<string, any>;
export declare function addPrefabInstance(node: Node): void;
export {};
