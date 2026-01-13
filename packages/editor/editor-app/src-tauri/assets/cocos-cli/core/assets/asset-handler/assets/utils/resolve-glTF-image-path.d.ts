/**
 * 解析 glTF 图像的真实路径。
 * @param imageName 图像资源名。
 * @param expectedPath 图像期望的绝对路径。
 * @param glTFDir glTF 文件所在路径。
 * @param extras glTF 图像的 extras。
 * @param jail Locks the search within specified path.
 */
export declare function resolveGlTfImagePath(imageName: string | undefined, expectedPath: string | undefined, glTFDir: string, extras: any, jail: string): Promise<string | null>;
