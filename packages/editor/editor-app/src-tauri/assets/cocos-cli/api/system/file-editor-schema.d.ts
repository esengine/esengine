import { z } from 'zod';
export declare const SchemaInsertTextAtLineInfo: z.ZodObject<{
    dbURL: z.ZodString;
    fileType: z.ZodEnum<["js", "ts", "jsx", "tsx", "json", "txt", "md", "xml", "html", "css"]>;
    lineNumber: z.ZodDefault<z.ZodNumber>;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
    dbURL: string;
    fileType: "json" | "jsx" | "html" | "js" | "ts" | "tsx" | "txt" | "md" | "xml" | "css";
    lineNumber: number;
}, {
    text: string;
    dbURL: string;
    fileType: "json" | "jsx" | "html" | "js" | "ts" | "tsx" | "txt" | "md" | "xml" | "css";
    lineNumber?: number | undefined;
}>;
export declare const SchemaEraseLinesInRangeInfo: z.ZodObject<{
    dbURL: z.ZodString;
    fileType: z.ZodEnum<["js", "ts", "jsx", "tsx", "json", "txt", "md", "xml", "html", "css"]>;
    startLine: z.ZodDefault<z.ZodNumber>;
    endLine: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    dbURL: string;
    fileType: "json" | "jsx" | "html" | "js" | "ts" | "tsx" | "txt" | "md" | "xml" | "css";
    startLine: number;
    endLine: number;
}, {
    dbURL: string;
    fileType: "json" | "jsx" | "html" | "js" | "ts" | "tsx" | "txt" | "md" | "xml" | "css";
    startLine?: number | undefined;
    endLine?: number | undefined;
}>;
export declare const SchemaReplaceTextInFileInfo: z.ZodObject<{
    dbURL: z.ZodString;
    fileType: z.ZodEnum<["js", "ts", "jsx", "tsx", "json", "txt", "md", "xml", "html", "css"]>;
    targetText: z.ZodString;
    replacementText: z.ZodString;
    regex: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    dbURL: string;
    regex: boolean;
    fileType: "json" | "jsx" | "html" | "js" | "ts" | "tsx" | "txt" | "md" | "xml" | "css";
    targetText: string;
    replacementText: string;
}, {
    dbURL: string;
    regex: boolean;
    fileType: "json" | "jsx" | "html" | "js" | "ts" | "tsx" | "txt" | "md" | "xml" | "css";
    targetText: string;
    replacementText: string;
}>;
export declare const SchemaQueryFileTextInfo: z.ZodObject<{
    dbURL: z.ZodString;
    fileType: z.ZodEnum<["js", "ts", "jsx", "tsx", "json", "txt", "md", "xml", "html", "css"]>;
    startLine: z.ZodDefault<z.ZodNumber>;
    lineCount: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    dbURL: string;
    fileType: "json" | "jsx" | "html" | "js" | "ts" | "tsx" | "txt" | "md" | "xml" | "css";
    startLine: number;
    lineCount: number;
}, {
    dbURL: string;
    fileType: "json" | "jsx" | "html" | "js" | "ts" | "tsx" | "txt" | "md" | "xml" | "css";
    startLine?: number | undefined;
    lineCount?: number | undefined;
}>;
export declare const SchemaFileEditorResult: z.ZodBoolean;
export declare const SchemaFileQueryTextResult: z.ZodString;
export type TInsertTextAtLineInfo = z.infer<typeof SchemaInsertTextAtLineInfo>;
export type TEraseLinesInRangeInfo = z.infer<typeof SchemaEraseLinesInRangeInfo>;
export type TReplaceTextInFileInfo = z.infer<typeof SchemaReplaceTextInFileInfo>;
export type TQueryFileTextInfo = z.infer<typeof SchemaQueryFileTextInfo>;
export type TFileEditorResult = z.infer<typeof SchemaFileEditorResult>;
export type TFileQueryTextResult = z.infer<typeof SchemaFileQueryTextResult>;
