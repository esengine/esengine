/**
 * @zh 脚本编译 API Schema
 * @en Scripting API Schema
 */
import { z } from 'zod';
/**
 * @zh 编译脚本的目标类型
 * @en Compile script target type
 */
export declare const SchemaCompileTarget: z.ZodEnum<["editor", "preview"]>;
export type TCompileTarget = z.infer<typeof SchemaCompileTarget>;
/**
 * @zh 脚本 UUID
 * @en Script UUID
 */
export declare const SchemaScriptUUID: z.ZodString;
export type TScriptUUID = z.infer<typeof SchemaScriptUUID>;
/**
 * @zh 脚本信息
 * @en Script info
 */
export declare const SchemaScriptInfo: z.ZodObject<{
    uuid: z.ZodString;
    cid: z.ZodString;
    name: z.ZodString;
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    path: string;
    uuid: string;
    cid: string;
}, {
    name: string;
    path: string;
    uuid: string;
    cid: string;
}>;
export type TScriptInfo = z.infer<typeof SchemaScriptInfo>;
/**
 * @zh 编译脚本结果
 * @en Compile scripts result
 */
export declare const SchemaCompileResult: z.ZodObject<{
    success: z.ZodBoolean;
    code: z.ZodOptional<z.ZodString>;
    scriptInfos: z.ZodOptional<z.ZodArray<z.ZodObject<{
        uuid: z.ZodString;
        cid: z.ZodString;
        name: z.ZodString;
        path: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        path: string;
        uuid: string;
        cid: string;
    }, {
        name: string;
        path: string;
        uuid: string;
        cid: string;
    }>, "many">>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    error?: string | undefined;
    code?: string | undefined;
    scriptInfos?: {
        name: string;
        path: string;
        uuid: string;
        cid: string;
    }[] | undefined;
}, {
    success: boolean;
    error?: string | undefined;
    code?: string | undefined;
    scriptInfos?: {
        name: string;
        path: string;
        uuid: string;
        cid: string;
    }[] | undefined;
}>;
export type TCompileResult = z.infer<typeof SchemaCompileResult>;
/**
 * @zh 脚本信息结果
 * @en Script info result
 */
export declare const SchemaScriptInfoResult: z.ZodNullable<z.ZodObject<{
    uuid: z.ZodString;
    cid: z.ZodNullable<z.ZodString>;
    name: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string | null;
    uuid: string;
    cid: string | null;
}, {
    name: string | null;
    uuid: string;
    cid: string | null;
}>>;
export type TScriptInfoResult = z.infer<typeof SchemaScriptInfoResult>;
/**
 * @zh 脚本加载器上下文
 * @en Script loader context
 */
export declare const SchemaLoaderContext: z.ZodNullable<z.ZodObject<{
    modules: z.ZodRecord<z.ZodString, z.ZodString>;
    importMap: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    modules: Record<string, string>;
    importMap?: any;
}, {
    modules: Record<string, string>;
    importMap?: any;
}>>;
export type TLoaderContext = z.infer<typeof SchemaLoaderContext>;
