import { TInsertTextAtLineInfo, TFileEditorResult, TEraseLinesInRangeInfo, TReplaceTextInFileInfo, TQueryFileTextInfo, TFileQueryTextResult } from './file-editor-schema';
import { CommonResultType } from '../base/schema-base';
export declare class FileEditorApi {
    insertTextAtLine(param: TInsertTextAtLineInfo): Promise<CommonResultType<TFileEditorResult>>;
    eraseLinesInRange(param: TEraseLinesInRangeInfo): Promise<CommonResultType<TFileEditorResult>>;
    replaceTextInFile(param: TReplaceTextInFileInfo): Promise<CommonResultType<TFileEditorResult>>;
    queryFileText(param: TQueryFileTextInfo): Promise<CommonResultType<TFileQueryTextResult>>;
}
