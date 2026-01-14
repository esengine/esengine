/**
 * 传入多个 uuid 数组，计算出每个数组对应的哈希值（16进制字符串表示），保证每次返回的哈希值之间互不重复。
 * 如果指定了 hashName，保证不同的 hashName 返回的哈希值一定互不重复。
 * @param {String[][]} uuidGroups
 * @param {BuiltinHashType|String} hashName - 如果哈希值会用作文件名，要注意 hashName 不区分大小写并且不能包含非法字符
 * @return {String[][]} hashes
 */
export declare function calculate(uuidGroups: string[][], hashName: string | number): string[];
export declare const BuiltinHashType: {
    PackedAssets: number;
    AutoAtlasImage: number;
};
