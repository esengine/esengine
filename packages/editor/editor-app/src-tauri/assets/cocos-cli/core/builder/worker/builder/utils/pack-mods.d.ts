interface IMod {
    code: string;
    map?: string;
}
/**
 * 打包指定的所有脚本到一个单独的脚本中。
 * @param mods
 * @param chunkMappings
 * @param outFile
 * @param options
 */
export declare function packMods(mods: IMod[], chunkMappings: Record<string, string>, outFile: string, options: {
    sourceMaps: boolean | 'inline';
    wrap?: boolean;
}): Promise<void>;
export {};
