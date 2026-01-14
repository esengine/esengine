import { z } from 'zod';
import { CommonResultType } from '../base/schema-base';
declare const SchemaMigrateResult: z.ZodRecord<z.ZodString, z.ZodAny>;
export type TMigrateResult = z.infer<typeof SchemaMigrateResult>;
declare const SchemaReloadResult: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    message: string;
}, {
    success: boolean;
    message: string;
}>;
export type TReloadResult = z.infer<typeof SchemaReloadResult>;
export declare class ConfigurationApi {
    migrateFromProject(): Promise<CommonResultType<TMigrateResult>>;
    reload(): Promise<CommonResultType<TReloadResult>>;
}
export {};
