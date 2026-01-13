/**
 * 将对象序列化为存储在库文件夹中应有的格式。
 * @param value
 */
export declare function serializeForLibrary(value: unknown): {
    extension: '.json';
    data: string;
} | {
    extension: '.bin';
    data: Uint8Array;
};
