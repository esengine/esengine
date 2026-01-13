import 'reflect-metadata';
import type { ZodType } from 'zod';
interface ParamSchema {
    index: number;
    schema: ZodType<any>;
    name?: string;
}
interface ToolMetaData {
    toolName: string;
    title?: string;
    description?: string;
    paramSchemas: ParamSchema[];
    returnSchema?: ZodType<any>;
    methodName: string | symbol;
}
declare const toolRegistry: Map<string, {
    target: any;
    meta: ToolMetaData;
}>;
export declare function tool(toolName?: string): (...decoratorArgs: any[]) => void;
export declare function description(desc: string): (target: any, propertyKey: string | symbol, _descriptor?: PropertyDescriptor) => void;
export declare function title(title: string): (target: any, propertyKey: string | symbol, _descriptor?: PropertyDescriptor) => void;
export declare function param(schema: ZodType<any>): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
export declare function result(returnType: ZodType<any>): (target: any, propertyKey: string | symbol, _descriptor?: PropertyDescriptor) => void;
export { toolRegistry, ToolMetaData };
