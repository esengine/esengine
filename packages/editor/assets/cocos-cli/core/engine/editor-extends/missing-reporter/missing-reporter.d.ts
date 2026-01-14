export declare class MissingReporter {
    outputLevel: 'debug' | 'warn' | 'error';
    static INFO_DETAILED: string;
    static getObjectType(obj: any): "scene" | "prefab" | "asset" | "component";
    missingObjects: Set<unknown>;
    missingOwners: Map<any, any>;
    root: any;
    report(): void;
    reportByOwner(): void;
    constructor(root?: any);
    reset(): void;
    stash(obj: any): void;
    /**
     * stashByOwner 和 stash 的区别在于，stash 要求对象中有值，stashByOwner 允许对象的值为空
     * @param {any} [value] - 如果 value 未设置，不会影响提示信息，只不过提示信息可能会不够详细
     */
    stashByOwner(owner: any, propName: any, value: any): void;
    removeStashedByOwner(owner: any, propName: any): any;
}
