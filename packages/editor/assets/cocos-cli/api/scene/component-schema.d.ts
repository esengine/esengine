import { z } from 'zod';
import type { IComponent } from '../../core/scene';
import { SchemaComponentIdentifier } from '../base/schema-identifier';
export declare const SchemaAddComponentInfo: z.ZodObject<{
    nodePath: z.ZodString;
    component: z.ZodString;
}, "strip", z.ZodTypeAny, {
    component: string;
    nodePath: string;
}, {
    component: string;
    nodePath: string;
}>;
export declare const SchemaRemoveComponent: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const SchemaQueryComponent: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const Vec2Type: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    x: number;
    y: number;
}, {
    x: number;
    y: number;
}>;
export declare const Vec3Type: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
    z: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    x: number;
    y: number;
    z: number;
}, {
    x: number;
    y: number;
    z: number;
}>;
export declare const Vec4Type: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
    z: z.ZodNumber;
    w: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    x: number;
    y: number;
    z: number;
    w: number;
}, {
    x: number;
    y: number;
    z: number;
    w: number;
}>;
export declare const Mat4Type: z.ZodObject<{
    m00: z.ZodNumber;
    m01: z.ZodNumber;
    m02: z.ZodNumber;
    m03: z.ZodNumber;
    m10: z.ZodNumber;
    m11: z.ZodNumber;
    m12: z.ZodNumber;
    m13: z.ZodNumber;
    m20: z.ZodNumber;
    m21: z.ZodNumber;
    m22: z.ZodNumber;
    m23: z.ZodNumber;
    m30: z.ZodNumber;
    m31: z.ZodNumber;
    m32: z.ZodNumber;
    m33: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    m00: number;
    m01: number;
    m02: number;
    m03: number;
    m10: number;
    m11: number;
    m12: number;
    m13: number;
    m20: number;
    m21: number;
    m22: number;
    m23: number;
    m30: number;
    m31: number;
    m32: number;
    m33: number;
}, {
    m00: number;
    m01: number;
    m02: number;
    m03: number;
    m10: number;
    m11: number;
    m12: number;
    m13: number;
    m20: number;
    m21: number;
    m22: number;
    m23: number;
    m30: number;
    m31: number;
    m32: number;
    m33: number;
}>;
/**
 * Property data structure and configuration options // 属性数据结构和配置选项
 * Used to describe property fields in the editor, supporting multiple data types and UI controls // 用于描述编辑器中的属性字段，支持多种数据类型和UI控件
 */
export declare const SchemaProperty: z.ZodObject<{
    value: z.ZodUnion<[z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodArray<z.ZodAny, "many">, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>, z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        z: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        z: number;
    }, {
        x: number;
        y: number;
        z: number;
    }>, z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        z: z.ZodNumber;
        w: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        z: number;
        w: number;
    }, {
        x: number;
        y: number;
        z: number;
        w: number;
    }>, z.ZodObject<{
        m00: z.ZodNumber;
        m01: z.ZodNumber;
        m02: z.ZodNumber;
        m03: z.ZodNumber;
        m10: z.ZodNumber;
        m11: z.ZodNumber;
        m12: z.ZodNumber;
        m13: z.ZodNumber;
        m20: z.ZodNumber;
        m21: z.ZodNumber;
        m22: z.ZodNumber;
        m23: z.ZodNumber;
        m30: z.ZodNumber;
        m31: z.ZodNumber;
        m32: z.ZodNumber;
        m33: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        m00: number;
        m01: number;
        m02: number;
        m03: number;
        m10: number;
        m11: number;
        m12: number;
        m13: number;
        m20: number;
        m21: number;
        m22: number;
        m23: number;
        m30: number;
        m31: number;
        m32: number;
        m33: number;
    }, {
        m00: number;
        m01: number;
        m02: number;
        m03: number;
        m10: number;
        m11: number;
        m12: number;
        m13: number;
        m20: number;
        m21: number;
        m22: number;
        m23: number;
        m30: number;
        m31: number;
        m32: number;
        m33: number;
    }>, z.ZodNull, z.ZodAny]>;
    cid: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    readonly: z.ZodOptional<z.ZodBoolean>;
    name: z.ZodOptional<z.ZodString>;
    path: z.ZodOptional<z.ZodString>;
    isArray: z.ZodOptional<z.ZodBoolean>;
    userData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    value?: any;
    type?: string | undefined;
    path?: string | undefined;
    readonly?: boolean | undefined;
    userData?: Record<string, any> | undefined;
    cid?: string | undefined;
    isArray?: boolean | undefined;
}, {
    name?: string | undefined;
    value?: any;
    type?: string | undefined;
    path?: string | undefined;
    readonly?: boolean | undefined;
    userData?: Record<string, any> | undefined;
    cid?: string | undefined;
    isArray?: boolean | undefined;
}>;
export declare const SchemaSetPropertyOptions: z.ZodObject<{
    componentPath: z.ZodString;
    properties: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodArray<z.ZodUnknown, "many">, z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodAny]>>;
}, "strip", z.ZodTypeAny, {
    properties: Record<string, any>;
    componentPath: string;
}, {
    properties: Record<string, any>;
    componentPath: string;
}>;
export declare const SchemaComponent: z.ZodType<IComponent>;
export declare const SchemaQueryAllComponentResult: z.ZodArray<z.ZodString, "many">;
export declare const SchemaComponentResult: z.ZodUnion<[z.ZodType<IComponent, z.ZodTypeDef, IComponent>, z.ZodNull]>;
export declare const SchemaBooleanResult: z.ZodBoolean;
export type TAddComponentInfo = z.infer<typeof SchemaAddComponentInfo>;
export type TComponentIdentifier = z.infer<typeof SchemaComponentIdentifier>;
export type TRemoveComponentOptions = z.infer<typeof SchemaRemoveComponent>;
export type TQueryComponentOptions = z.infer<typeof SchemaQueryComponent>;
export type TSetPropertyOptions = z.infer<typeof SchemaSetPropertyOptions>;
export type TComponentResult = z.infer<typeof SchemaComponentResult>;
export type TQueryAllComponentResult = z.infer<typeof SchemaQueryAllComponentResult>;
export type TBooleanResult = z.infer<typeof SchemaBooleanResult>;
