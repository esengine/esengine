import ts, { CompilerOptions, IScriptSnapshot, LanguageServiceHost, ParseConfigFileHost } from 'typescript';
import { DbURLInfo } from '../intelligence';
import { ModifiedAssetChange } from '../packer-driver/asset-db-interop';
import { FileInfo } from '../shared/cache';
import { AsyncDelegate } from '../utils/delegate';
import { AwaitCommand, Command } from './command';
/**
 * 这个类用来处理内存中的文件
 */
export declare class VirtualIOAdapter {
    protected readonly _fileCache: Map<string, FileInfo>;
    constructor();
    /** 如果内存中有这部分内容则优先使用内存的 */
    readFile(filePath: FilePath): string | undefined;
    /**从内存加载脚本信息 */
    readCache(filePath: FilePath): Readonly<FileInfo> | undefined;
    removeCache(filePath: FilePath): boolean;
    /** 将文件写入至内存 */
    writeCache({ uuid, content, version, filePath }: Readonly<FileInfo>): void;
    fileExists(path: string): boolean;
    getFileNames(): string[];
}
export declare class ParseConfigFileHostAdapter extends VirtualIOAdapter implements ParseConfigFileHost {
    protected readonly _currentDirectory: FilePath;
    constructor(_currentDirectory: FilePath);
    getCurrentDirectory(): string;
    useCaseSensitiveFileNames: boolean;
    readDirectory(rootDir: string, extensions: readonly string[], excludes: readonly string[] | undefined, includes: readonly string[], depth?: number | undefined): readonly string[];
    onUnRecoverableConfigFileDiagnostic(...args: Parameters<ParseConfigFileHost['onUnRecoverableConfigFileDiagnostic']>): void;
}
export declare class LanguageServiceHostAdapter extends VirtualIOAdapter implements LanguageServiceHost {
    protected readonly _parseConfigFileHost: Readonly<ParseConfigFileHostAdapter>;
    protected readonly _tsconfigPath: FilePath;
    protected readonly _currentDirectory: FilePath;
    protected readonly _compilerOptions: CompilerOptions;
    static readonly defaultLibFileName = "__DEFAULT_LIB_FILE_NAME_IS_NEVER_EXIST.d.ts";
    constructor(_parseConfigFileHost: Readonly<ParseConfigFileHostAdapter>, _tsconfigPath: FilePath, _currentDirectory: FilePath, _compilerOptions: CompilerOptions);
    getCompilationSettings(): CompilerOptions;
    getScriptFileNames(): string[];
    getScriptVersion(fileName: string): string;
    getScriptSnapshot(fileName: string): IScriptSnapshot | undefined;
    getCurrentDirectory(): string;
    getDefaultLibFileName(options: CompilerOptions): string;
    useCaseSensitiveFileNames(): boolean;
}
export interface LanguageServiceAdapterEditOptions {
    renameOptions?: {
        oldFilePath: FilePath;
        newFilePath: FilePath;
    };
    /** 是否输出修改后的脚本到硬盘 */
    outputFiles?: boolean;
}
export declare class LanguageServiceAdapter {
    protected readonly _tsconfigPath: FilePath;
    protected readonly _currentDirectory: FilePath;
    /** 外部提供一个委托，这里注入委托，主要防止重复编译 */
    protected readonly _beforeBuildDelegate: AsyncDelegate<(changes: ModifiedAssetChange[]) => Promise<void>>;
    protected readonly _compilerOptions: Readonly<CompilerOptions>;
    readonly dbURLInfos: readonly DbURLInfo[];
    readonly languageService: ts.LanguageService;
    readonly host: LanguageServiceHostAdapter;
    autoUpdateFileImport: boolean | undefined;
    protected readonly _parseConfigFileHost: ParseConfigFileHostAdapter;
    /** 命令队列 */
    protected readonly _awaitCommandQueue: AwaitCommand[];
    /** 正在执行的命令 */
    protected _executingCommandID: Command['id'];
    protected readonly _changedFileSet: Set<string>;
    protected readonly _afterOutputTasks: (() => void)[];
    constructor(_tsconfigPath: FilePath, _currentDirectory: FilePath, 
    /** 外部提供一个委托，这里注入委托，主要防止重复编译 */
    _beforeBuildDelegate: AsyncDelegate<(changes: ModifiedAssetChange[]) => Promise<void>>, _compilerOptions: Readonly<CompilerOptions>, dbURLInfos: readonly DbURLInfo[]);
    isExecuting(commandID: string): boolean;
    get isBusy(): boolean;
    executeCommand(command: Command): Promise<void>;
    /** 请求更新路径 */
    requestRenameFile(oldFilePath: FilePath, newFilePath: FilePath): Promise<void>;
    applyChanges(text: string, changes: readonly ts.TextChange[]): string;
    /** 将缓存中的数据生成到位置 */
    outPutFiles(fileNameSet: Set<string>): Promise<void>;
    protected clearCache(): void;
    protected textSpanEnd(span: ts.TextSpan): number;
    protected finishCommand(assetChanges: ModifiedAssetChange[]): Promise<void>;
}
