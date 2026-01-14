import { z } from 'zod';
import { IConsoleType } from '../../core/base/console';
export declare const SchemaQueryLogParamInfo: z.ZodObject<{
    number: z.ZodDefault<z.ZodNumber>;
    logLevel: z.ZodOptional<z.ZodEnum<[IConsoleType, ...IConsoleType[]]>>;
}, "strip", z.ZodTypeAny, {
    number: number;
    logLevel?: IConsoleType | undefined;
}, {
    number?: number | undefined;
    logLevel?: IConsoleType | undefined;
}>;
export declare const SchemaQueryLogResult: z.ZodArray<z.ZodString, "many">;
export declare const SchemaClearLogResult: z.ZodBoolean;
export type TQueryLogParamInfo = z.infer<typeof SchemaQueryLogParamInfo>;
export type TQueryLogResult = z.infer<typeof SchemaQueryLogResult>;
export type TClearLogResult = z.infer<typeof SchemaClearLogResult>;
