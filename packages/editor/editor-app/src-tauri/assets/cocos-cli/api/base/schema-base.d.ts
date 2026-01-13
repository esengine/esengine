import z from 'zod';
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly ACCEPTED: 202;
    readonly NO_CONTENT: 204;
    readonly NOT_MODIFIED: 304;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly METHOD_NOT_ALLOWED: 405;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly NOT_IMPLEMENTED: 501;
    readonly BAD_GATEWAY: 502;
    readonly SERVICE_UNAVAILABLE: 503;
    readonly GATEWAY_TIMEOUT: 504;
};
export declare const COMMON_STATUS: {
    readonly SUCCESS: 200;
    readonly FAIL: 500;
};
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type CommonStatus = typeof COMMON_STATUS[keyof typeof COMMON_STATUS];
export declare const HttpStatusCodeSchema: z.ZodUnion<[z.ZodLiteral<200>, z.ZodLiteral<500>]>;
export declare function createCommonResult<T extends z.ZodTypeAny>(dataSchema: T): z.ZodObject<{
    code: z.ZodUnion<[z.ZodLiteral<200>, z.ZodLiteral<500>]>;
    data: z.ZodUnion<[T, z.ZodUndefined]>;
    reason: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    code: z.ZodUnion<[z.ZodLiteral<200>, z.ZodLiteral<500>]>;
    data: z.ZodUnion<[T, z.ZodUndefined]>;
    reason: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    code: z.ZodUnion<[z.ZodLiteral<200>, z.ZodLiteral<500>]>;
    data: z.ZodUnion<[T, z.ZodUndefined]>;
    reason: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export type CommonResultType<T> = {
    code: CommonStatus;
    data?: T;
    reason?: string;
};
/**
 * Project Path // 项目路径
 */
export declare const SchemaProjectPath: z.ZodString;
