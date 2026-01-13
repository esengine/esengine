import ts, { TextChange } from 'typescript';
import { LanguageServiceAdapter } from '.';
import { DbURLInfo } from '../intelligence';
export declare enum CommandType {
    rename = 0
}
export declare abstract class Command {
    abstract id: string;
    abstract description: string;
    abstract commandType: CommandType;
    abstract execute(languageServiceAdapter: LanguageServiceAdapter): Promise<Set<FilePath>>;
}
export interface AwaitCommand {
    /** 调用这个方法将解除命令的等待 */
    resolveAwait: (any: any) => void;
    command: Command;
}
export declare class RenameCommand extends Command {
    protected readonly oldFilePath: FilePath;
    protected readonly newFilePath: FilePath;
    private _newFileDBInfo;
    private _oldFileDBInfo;
    /** 新的文件/文件夹在 db的 url */
    private _newFileDBURL;
    /** 旧的文件/文件夹在 db的 url */
    private _oldFileDBURL;
    /** 仅在移动的内容为文件的时候有效 */
    readonly oldFilePathWithOutExt: string;
    /** 仅在移动的内容为文件的时候有效 */
    readonly newFilePathWithOutExt: string;
    private static _createDescription;
    private static _createID;
    private _executed;
    readonly id: string;
    readonly description: string;
    readonly commandType: CommandType;
    static create(oldFilePath: FilePath, newFilePath: FilePath): Command;
    constructor(oldFilePath: FilePath, newFilePath: FilePath);
    /**
      *
      * @param dbUrlInfos
      * @param filePath 修改文件后的资源的路径
      * @param text 修改文件的原始内容
      * @param changes 文件需要做得变动
      * @returns
      */
    protected applyImportChanges(dbUrlInfos: readonly DbURLInfo[], filePath: string, text: string, changes: readonly TextChange[]): string;
    protected textSpanEnd(span: ts.TextSpan): number;
    execute(languageServiceAdapter: LanguageServiceAdapter): Promise<Set<string>>;
}
