export declare class NodePathManager {
    private _uuidToPath;
    private _pathToUuid;
    private _nodeNames;
    /**
        * 清理名称中的非法字符
        */
    private _sanitizeName;
    /**
     * 生成唯一路径
     */
    generateUniquePath(uuid: string, name: string, parentUuid?: string): string;
    add(uuid: string, path: string): void;
    remove(uuid: string): void;
    changeUuid(oldUuid: string, newUuid: string): void;
    clear(): void;
    private _getParentUuid;
    /**
     * 确保节点名称在父节点下唯一
     */
    ensureUniqueName(parentUuid: string, baseName: string): string;
    getNodeUuid(path: string): string | undefined;
    getNodePath(uuid: string): string;
    updateUuid(uuid: string, newName: string, parentUuid?: string): void;
    getNameMap(uuid: string): Map<string, number> | null;
}
declare const _default: NodePathManager;
export default _default;
