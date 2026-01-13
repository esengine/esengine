/**
 * 检查文件在指定文件夹中是否存在，如果存在则通过追加数字后缀的方式生成一个唯一的文件名。
 * @param targetFolder 目标文件夹的路径。
 * @param fileName 需要检查存在的文件名。
 * @returns 返回一个唯一的文件名字符串。
 */
export declare const resolveFileNameConflict: (targetFolder: string, fileName: string) => string;
/**
 * 初始化一个可用的文件名
 * Initializes a available filename
 * 返回可用名称的文件路径
 * Returns the file path with the available name
 *
 * @param file 初始文件路径 Initial file path
 */
export declare function getName(file: string): string;
export declare function trashItem(file: string): Promise<void>;
export declare function requireFile(file: string, options?: {
    root: string;
}): any;
export declare function removeCache(file: string): void;
