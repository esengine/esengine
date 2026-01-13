import { TClearLogResult, TQueryLogParamInfo, TQueryLogResult } from './system-schema';
import { CommonResultType } from '../base/schema-base';
import { FileEditorApi } from './file-editor';
export declare class SystemApi {
    fileEditor: FileEditorApi;
    constructor();
    /**
     * Query CLI log information // 查询 cli 日志信息
     */
    queryLogs(queryParam: TQueryLogParamInfo): Promise<CommonResultType<TQueryLogResult>>;
    /**
     * Clear CLI log information // 清除 cli 日志信息
     */
    clearLogs(): Promise<CommonResultType<TClearLogResult>>;
}
