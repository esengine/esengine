/**
 * @zh Engine API Schema 定义
 * @en Engine API Schema definitions
 */
import { z } from 'zod';
/**
 * @zh Chunk 信息
 * @en Chunk info
 */
export declare const SchemaChunkInfo: z.ZodRecord<z.ZodString, z.ZodString>;
export type TChunkInfo = z.infer<typeof SchemaChunkInfo>;
/**
 * @zh Effect 源码信息
 * @en Effect source info
 */
export declare const SchemaEffectSource: z.ZodRecord<z.ZodString, z.ZodString>;
export type TEffectSource = z.infer<typeof SchemaEffectSource>;
/**
 * @zh 内置材质配置
 * @en Builtin material config
 */
export declare const SchemaMaterialConfig: z.ZodObject<{
    name: z.ZodString;
    effectName: z.ZodString;
    defines: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    effectName: string;
    defines?: Record<string, string | number | boolean> | undefined;
}, {
    name: string;
    effectName: string;
    defines?: Record<string, string | number | boolean> | undefined;
}>;
export type TMaterialConfig = z.infer<typeof SchemaMaterialConfig>;
/**
 * @zh 内置资源数据
 * @en Builtin resources data
 */
export declare const SchemaBuiltinResources: z.ZodObject<{
    chunks: z.ZodRecord<z.ZodString, z.ZodString>;
    effects: z.ZodRecord<z.ZodString, z.ZodString>;
    materialConfigs: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        effectName: z.ZodString;
        defines: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        effectName: string;
        defines?: Record<string, string | number | boolean> | undefined;
    }, {
        name: string;
        effectName: string;
        defines?: Record<string, string | number | boolean> | undefined;
    }>, "many">;
    effectNameMapping: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    chunks: Record<string, string>;
    effects: Record<string, string>;
    materialConfigs: {
        name: string;
        effectName: string;
        defines?: Record<string, string | number | boolean> | undefined;
    }[];
    effectNameMapping?: Record<string, string> | undefined;
}, {
    chunks: Record<string, string>;
    effects: Record<string, string>;
    materialConfigs: {
        name: string;
        effectName: string;
        defines?: Record<string, string | number | boolean> | undefined;
    }[];
    effectNameMapping?: Record<string, string> | undefined;
}>;
export type TBuiltinResources = z.infer<typeof SchemaBuiltinResources>;
