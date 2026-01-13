"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileEditorApi = void 0;
const file_editor_schema_1 = require("./file-editor-schema");
const decorator_js_1 = require("../decorator/decorator.js");
const schema_base_1 = require("../base/schema-base");
const file_edit_1 = require("../../core/filesystem/file-edit");
class FileEditorApi {
    async insertTextAtLine(param) {
        try {
            const result = await (0, file_edit_1.insertTextAtLine)(param.dbURL, param.fileType, param.lineNumber, param.text);
            return {
                code: schema_base_1.COMMON_STATUS.SUCCESS,
                data: result,
            };
        }
        catch (e) {
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e)
            };
        }
    }
    async eraseLinesInRange(param) {
        try {
            const result = await (0, file_edit_1.eraseLinesInRange)(param.dbURL, param.fileType, param.startLine, param.endLine);
            return {
                code: schema_base_1.COMMON_STATUS.SUCCESS,
                data: result,
            };
        }
        catch (e) {
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e)
            };
        }
    }
    async replaceTextInFile(param) {
        try {
            const result = await (0, file_edit_1.replaceTextInFile)(param.dbURL, param.fileType, param.targetText, param.replacementText, param.regex);
            return {
                code: schema_base_1.COMMON_STATUS.SUCCESS,
                data: result,
            };
        }
        catch (e) {
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e)
            };
        }
    }
    async queryFileText(param) {
        try {
            const result = await (0, file_edit_1.queryLinesInFile)(param.dbURL, param.fileType, param.startLine, param.lineCount);
            return {
                code: schema_base_1.COMMON_STATUS.SUCCESS,
                data: result,
            };
        }
        catch (e) {
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e)
            };
        }
    }
}
exports.FileEditorApi = FileEditorApi;
__decorate([
    (0, decorator_js_1.tool)('file-insert-text'),
    (0, decorator_js_1.title)('Insert content before line n of the file') // 在文件第n行前插入内容
    ,
    (0, decorator_js_1.description)('Insert content before line n of the file, return success or failure. If the line number is greater than the total number of lines in the file, insert it at the end of the file.') // 在文件第 n 行前插入内容，返回成功或者失败。行号大于文件总行数时，插入到文件末尾
    ,
    (0, decorator_js_1.result)(file_editor_schema_1.SchemaFileEditorResult),
    __param(0, (0, decorator_js_1.param)(file_editor_schema_1.SchemaInsertTextAtLineInfo)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileEditorApi.prototype, "insertTextAtLine", null);
__decorate([
    (0, decorator_js_1.tool)('file-delete-text'),
    (0, decorator_js_1.title)('Delete content between startLine and endLine of the file') // 删除文件第 startLine 到 endLine 之间的内容
    ,
    (0, decorator_js_1.description)('Delete content between startLine and endLine of the file, return success or failure') // 删除文件第 startLine 到 endLine 之间的内容，返回成功或者失败
    ,
    (0, decorator_js_1.result)(file_editor_schema_1.SchemaFileEditorResult),
    __param(0, (0, decorator_js_1.param)(file_editor_schema_1.SchemaEraseLinesInRangeInfo)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileEditorApi.prototype, "eraseLinesInRange", null);
__decorate([
    (0, decorator_js_1.tool)('file-replace-text'),
    (0, decorator_js_1.title)('Replace target text with replacement text in the file') // 替换文件中的 目标文本 为 替换文本
    ,
    (0, decorator_js_1.description)('Replace target text (including regular expressions) with replacement text in the file. Only replace the unique occurrence of the target text (fail if there are multiple), return success or failure.') // 替换文件中的 目标文本(含正则表达式) 为 替换文本，只替换唯一出现的目标文本（如果有多个视为失败），返回成功或者失败
    ,
    (0, decorator_js_1.result)(file_editor_schema_1.SchemaFileEditorResult),
    __param(0, (0, decorator_js_1.param)(file_editor_schema_1.SchemaReplaceTextInFileInfo)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileEditorApi.prototype, "replaceTextInFile", null);
__decorate([
    (0, decorator_js_1.tool)('file-query-text'),
    (0, decorator_js_1.title)('Query content of specified lines in the file') // 查询文件指定行数的内容
    ,
    (0, decorator_js_1.description)('Query content of specified number of lines starting from startLine in the file, return the array of queried content') // 查询文件从 startLine 行开始的指定行数内容，返回查询到的内容数组
    ,
    (0, decorator_js_1.result)(file_editor_schema_1.SchemaFileQueryTextResult),
    __param(0, (0, decorator_js_1.param)(file_editor_schema_1.SchemaQueryFileTextInfo)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileEditorApi.prototype, "queryFileText", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1lZGl0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpL3N5c3RlbS9maWxlLWVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFDQSw2REFjOEI7QUFFOUIsNERBQW9GO0FBQ3BGLHFEQUFzRTtBQUN0RSwrREFBMkg7QUFFM0gsTUFBYSxhQUFhO0lBS2hCLEFBQU4sS0FBSyxDQUFDLGdCQUFnQixDQUFvQyxLQUE0QjtRQUNsRixJQUFJLENBQUM7WUFDRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsNEJBQWdCLEVBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pHLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLDJCQUFhLENBQUMsT0FBTztnQkFDM0IsSUFBSSxFQUFFLE1BQU07YUFDZixDQUFDO1FBQ04sQ0FBQztRQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDVCxPQUFPO2dCQUNILElBQUksRUFBRSwyQkFBYSxDQUFDLElBQUk7Z0JBQ3hCLE1BQU0sRUFBRSxDQUFDLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ3JELENBQUM7UUFDTixDQUFDO0lBQ0wsQ0FBQztJQU1LLEFBQU4sS0FBSyxDQUFDLGlCQUFpQixDQUFxQyxLQUE2QjtRQUNyRixJQUFJLENBQUM7WUFDRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsNkJBQWlCLEVBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3BHLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLDJCQUFhLENBQUMsT0FBTztn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QUNOLFdBQUEsSUFBQSxvQkFBSyxFQUFDLGdEQUEyQixDQUFDLENBQUE7Ozs7c0RBYTFEO0FBTUs7SUFKTCxJQUFBLG1CQUFJLEVBQUMsaUJBQWlCLENBQUM7SUFDdkIsSUFBQSxvQkFBSyxFQUFDLDhDQUE4QyxDQUFDLENBQUMsY0FBYzs7SUFDcEUsSUFBQSwwQkFBVyxFQUFDLHFIQUFxSCxDQUFDLENBQUMsd0NBQXdDOztJQUMzSyxJQUFBLHFCQUFNLEVBQUMsOENBQXlCLENBQUM7SUFDYixXQUFBLElBQUEsb0JBQUssRUFBQyw0Q0FBdUIsQ0FBQyxDQUFBOzs7O2tEQWFsRCIsInNvdXJjZXNDb250ZW50IjpbIlxyXG5pbXBvcnQge1xyXG4gICAgU2NoZW1hSW5zZXJ0VGV4dEF0TGluZUluZm8sXHJcbiAgICBTY2hlbWFFcmFzZUxpbmVzSW5SYW5nZUluZm8sXHJcbiAgICBTY2hlbWFSZXBsYWNlVGV4dEluRmlsZUluZm8sXHJcbiAgICBTY2hlbWFGaWxlRWRpdG9yUmVzdWx0LFxyXG5cclxuICAgIFRJbnNlcnRUZXh0QXRMaW5lSW5mbyxcclxuICAgIFRGaWxlRWRpdG9yUmVzdWx0LFxyXG4gICAgVEVyYXNlTGluZXNJblJhbmdlSW5mbyxcclxuICAgIFRSZXBsYWNlVGV4dEluRmlsZUluZm8sXHJcbiAgICBTY2hlbWFRdWVyeUZpbGVUZXh0SW5mbyxcclxuICAgIFRRdWVyeUZpbGVUZXh0SW5mbyxcclxuICAgIFRGaWxlUXVlcnlUZXh0UmVzdWx0LFxyXG4gICAgU2NoZW1hRmlsZVF1ZXJ5VGV4dFJlc3VsdCxcclxufSBmcm9tICcuL2ZpbGUtZWRpdG9yLXNjaGVtYSc7XHJcblxyXG5pbXBvcnQgeyBkZXNjcmlwdGlvbiwgcGFyYW0sIHJlc3VsdCwgdGl0bGUsIHRvb2wgfSBmcm9tICcuLi9kZWNvcmF0b3IvZGVjb3JhdG9yLmpzJztcclxuaW1wb3J0IHsgQ09NTU9OX1NUQVRVUywgQ29tbW9uUmVzdWx0VHlwZSB9IGZyb20gJy4uL2Jhc2Uvc2NoZW1hLWJhc2UnO1xyXG5pbXBvcnQgeyBpbnNlcnRUZXh0QXRMaW5lLCBlcmFzZUxpbmVzSW5SYW5nZSwgcmVwbGFjZVRleHRJbkZpbGUsIHF1ZXJ5TGluZXNJbkZpbGUgfSBmcm9tICcuLi8uLi9jb3JlL2ZpbGVzeXN0ZW0vZmlsZS1lZGl0JztcclxuXHJcbmV4cG9ydCBjbGFzcyBGaWxlRWRpdG9yQXBpIHtcclxuICAgIEB0b29sKCdmaWxlLWluc2VydC10ZXh0JylcclxuICAgIEB0aXRsZSgnSW5zZXJ0IGNvbnRlbnQgYmVmb3JlIGxpbmUgbiBvZiB0aGUgZmlsZScpIC8vIOWcqOaWh+S7tuesrG7ooYzliY3mj5LlhaXlhoXlrrlcclxuICAgIEBkZXNjcmlwdGlvbignSW5zZXJ0IGNvbnRlbnQgYmVmb3JlIGxpbmUgbiBvZiB0aGUgZmlsZSwgcmV0dXJuIHN1Y2Nlc3Mgb3IgZmFpbHVyZS4gSWYgdGhlIGxpbmUgbnVtYmVyIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIGxpbmVzIGluIHRoZSBmaWxlLCBpbnNlcnQgaXQgYXQgdGhlIGVuZCBvZiB0aGUgZmlsZS4nKSAvLyDlnKjmlofku7bnrKwgbiDooYzliY3mj5LlhaXlhoXlrrnvvIzov5Tlm57miJDlip/miJbogIXlpLHotKXjgILooYzlj7flpKfkuo7mlofku7bmgLvooYzmlbDml7bvvIzmj5LlhaXliLDmlofku7bmnKvlsL5cclxuICAgIEByZXN1bHQoU2NoZW1hRmlsZUVkaXRvclJlc3VsdClcclxuICAgIGFzeW5jIGluc2VydFRleHRBdExpbmUoQHBhcmFtKFNjaGVtYUluc2VydFRleHRBdExpbmVJbmZvKSBwYXJhbTogVEluc2VydFRleHRBdExpbmVJbmZvKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRGaWxlRWRpdG9yUmVzdWx0Pj4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGluc2VydFRleHRBdExpbmUocGFyYW0uZGJVUkwsIHBhcmFtLmZpbGVUeXBlLCBwYXJhbS5saW5lTnVtYmVyLCBwYXJhbS50ZXh0KTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IENPTU1PTl9TVEFUVVMuU1VDQ0VTUyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHJlc3VsdCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBDT01NT05fU1RBVFVTLkZBSUwsXHJcbiAgICAgICAgICAgICAgICByZWFzb246IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBAdG9vbCgnZmlsZS1kZWxldGUtdGV4dCcpXHJcbiAgICBAdGl0bGUoJ0RlbGV0ZSBjb250ZW50IGJldHdlZW4gc3RhcnRMaW5lIGFuZCBlbmRMaW5lIG9mIHRoZSBmaWxlJykgLy8g5Yig6Zmk5paH5Lu256ysIHN0YXJ0TGluZSDliLAgZW5kTGluZSDkuYvpl7TnmoTlhoXlrrlcclxuICAgIEBkZXNjcmlwdGlvbignRGVsZXRlIGNvbnRlbnQgYmV0d2VlbiBzdGFydExpbmUgYW5kIGVuZExpbmUgb2YgdGhlIGZpbGUsIHJldHVybiBzdWNjZXNzIG9yIGZhaWx1cmUnKSAvLyDliKDpmaTmlofku7bnrKwgc3RhcnRMaW5lIOWIsCBlbmRMaW5lIOS5i+mXtOeahOWGheWuue+8jOi/lOWbnuaIkOWKn+aIluiAheWksei0pVxyXG4gICAgQHJlc3VsdChTY2hlbWFGaWxlRWRpdG9yUmVzdWx0KVxyXG4gICAgYXN5bmMgZXJhc2VMaW5lc0luUmFuZ2UoQHBhcmFtKFNjaGVtYUVyYXNlTGluZXNJblJhbmdlSW5mbykgcGFyYW06IFRFcmFzZUxpbmVzSW5SYW5nZUluZm8pOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8VEZpbGVFZGl0b3JSZXN1bHQ+PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXJhc2VMaW5lc0luUmFuZ2UocGFyYW0uZGJVUkwsIHBhcmFtLmZpbGVUeXBlLCBwYXJhbS5zdGFydExpbmUsIHBhcmFtLmVuZExpbmUpO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgY29kZTogQ09NTU9OX1NUQVRVUy5TVUNDRVNTLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogcmVzdWx0LFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IENPTU1PTl9TVEFUVVMuRkFJTCxcclxuICAgICAgICAgICAgICAgIHJlYXNvbjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIEB0b29sKCdmaWxlLXJlcGxhY2UtdGV4dCcpXHJcbiAgICBAdGl0bGUoJ1JlcGxhY2UgdGFyZ2V0IHRleHQgd2l0aCByZXBsYWNlbWVudCB0ZXh0IGluIHRoZSBmaWxlJykgLy8g5pu/5o2i5paH5Lu25Lit55qEIOebruagh+aWh+acrCDkuLog5pu/5o2i5paH5pysXHJcbiAgICBAZGVzY3JpcHRpb24oJ1JlcGxhY2UgdGFyZ2V0IHRleHQgKGluY2x1ZGluZyByZWd1bGFyIGV4cHJlc3Npb25zKSB3aXRoIHJlcGxhY2VtZW50IHRleHQgaW4gdGhlIGZpbGUuIE9ubHkgcmVwbGFjZSB0aGUgdW5pcXVlIG9jY3VycmVuY2Ugb2YgdGhlIHRhcmdldCB0ZXh0IChmYWlsIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSksIHJldHVybiBzdWNjZXNzIG9yIGZhaWx1cmUuJykgLy8g5pu/5o2i5paH5Lu25Lit55qEIOebruagh+aWh+acrCjlkKvmraPliJnooajovr7lvI8pIOS4uiDmm7/mjaLmlofmnKzvvIzlj6rmm7/mjaLllK/kuIDlh7rnjrDnmoTnm67moIfmlofmnKzvvIjlpoLmnpzmnInlpJrkuKrop4bkuLrlpLHotKXvvInvvIzov5Tlm57miJDlip/miJbogIXlpLHotKVcclxuICAgIEByZXN1bHQoU2NoZW1hRmlsZUVkaXRvclJlc3VsdClcclxuICAgIGFzeW5jIHJlcGxhY2VUZXh0SW5GaWxlKEBwYXJhbShTY2hlbWFSZXBsYWNlVGV4dEluRmlsZUluZm8pIHBhcmFtOiBUUmVwbGFjZVRleHRJbkZpbGVJbmZvKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRGaWxlRWRpdG9yUmVzdWx0Pj4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlcGxhY2VUZXh0SW5GaWxlKHBhcmFtLmRiVVJMLCBwYXJhbS5maWxlVHlwZSwgcGFyYW0udGFyZ2V0VGV4dCwgcGFyYW0ucmVwbGFjZW1lbnRUZXh0LCBwYXJhbS5yZWdleCk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBDT01NT05fU1RBVFVTLlNVQ0NFU1MsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiByZXN1bHQsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgY29kZTogQ09NTU9OX1NUQVRVUy5GQUlMLFxyXG4gICAgICAgICAgICAgICAgcmVhc29uOiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgQHRvb2woJ2ZpbGUtcXVlcnktdGV4dCcpXHJcbiAgICBAdGl0bGUoJ1F1ZXJ5IGNvbnRlbnQgb2Ygc3BlY2lmaWVkIGxpbmVzIGluIHRoZSBmaWxlJykgLy8g5p+l6K+i5paH5Lu25oyH5a6a6KGM5pWw55qE5YaF5a65XHJcbiAgICBAZGVzY3JpcHRpb24oJ1F1ZXJ5IGNvbnRlbnQgb2Ygc3BlY2lmaWVkIG51bWJlciBvZiBsaW5lcyBzdGFydGluZyBmcm9tIHN0YXJ0TGluZSBpbiB0aGUgZmlsZSwgcmV0dXJuIHRoZSBhcnJheSBvZiBxdWVyaWVkIGNvbnRlbnQnKSAvLyDmn6Xor6Lmlofku7bku44gc3RhcnRMaW5lIOihjOW8gOWni+eahOaMh+WumuihjOaVsOWGheWuue+8jOi/lOWbnuafpeivouWIsOeahOWGheWuueaVsOe7hFxyXG4gICAgQHJlc3VsdChTY2hlbWFGaWxlUXVlcnlUZXh0UmVzdWx0KVxyXG4gICAgYXN5bmMgcXVlcnlGaWxlVGV4dChAcGFyYW0oU2NoZW1hUXVlcnlGaWxlVGV4dEluZm8pIHBhcmFtOiBUUXVlcnlGaWxlVGV4dEluZm8pOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8VEZpbGVRdWVyeVRleHRSZXN1bHQ+PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcXVlcnlMaW5lc0luRmlsZShwYXJhbS5kYlVSTCwgcGFyYW0uZmlsZVR5cGUsIHBhcmFtLnN0YXJ0TGluZSwgcGFyYW0ubGluZUNvdW50KTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IENPTU1PTl9TVEFUVVMuU1VDQ0VTUyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHJlc3VsdCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBDT01NT05fU1RBVFVTLkZBSUwsXHJcbiAgICAgICAgICAgICAgICByZWFzb246IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=