import z from 'zod';
export declare const SchemaVec3: z.ZodObject<{
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
export declare const SchemaQuat: z.ZodObject<{
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
export declare const SchemaMat4: z.ZodObject<{
    m00: z.ZodNumber;
    m01: z.ZodNumber;
    m02: z.ZodNumber;
    m03: z.ZodNumber;
    m04: z.ZodNumber;
    m05: z.ZodNumber;
    m06: z.ZodNumber;
    m07: z.ZodNumber;
    m08: z.ZodNumber;
    m09: z.ZodNumber;
    m10: z.ZodNumber;
    m11: z.ZodNumber;
    m12: z.ZodNumber;
    m13: z.ZodNumber;
    m14: z.ZodNumber;
    m15: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    m00: number;
    m01: number;
    m02: number;
    m03: number;
    m04: number;
    m05: number;
    m06: number;
    m07: number;
    m08: number;
    m09: number;
    m10: number;
    m11: number;
    m12: number;
    m13: number;
    m14: number;
    m15: number;
}, {
    m00: number;
    m01: number;
    m02: number;
    m03: number;
    m04: number;
    m05: number;
    m06: number;
    m07: number;
    m08: number;
    m09: number;
    m10: number;
    m11: number;
    m12: number;
    m13: number;
    m14: number;
    m15: number;
}>;
