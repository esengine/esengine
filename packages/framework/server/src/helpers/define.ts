/**
 * @zh API、消息和 HTTP 定义助手
 * @en API, message, and HTTP definition helpers
 */

import type { ApiDefinition, MsgDefinition, HttpDefinition } from '../types/index.js';
import type { Validator, Infer } from '../schema/index.js';

/**
 * @zh 带 Schema 的 API 定义选项
 * @en API definition options with schema
 */
export interface ApiDefinitionWithSchema<TReq, TRes, TData = Record<string, unknown>> extends ApiDefinition<TReq, TRes, TData> {
    /**
     * @zh 请求数据 Schema（自动验证）
     * @en Request data schema (auto validation)
     */
    schema?: Validator<TReq>;
}

/**
 * @zh 定义 API 处理器
 * @en Define API handler
 *
 * @example
 * ```typescript
 * // src/api/join.ts
 * import { defineApi } from '@esengine/server'
 *
 * export default defineApi<ReqJoin, ResJoin>({
 *     handler(req, ctx) {
 *         ctx.conn.data.playerId = generateId()
 *         return { playerId: ctx.conn.data.playerId }
 *     }
 * })
 * ```
 *
 * @example
 * ```typescript
 * // 使用 Schema 验证 | With schema validation
 * import { defineApi, s } from '@esengine/server'
 *
 * const MoveSchema = s.object({
 *     x: s.number(),
 *     y: s.number()
 * });
 *
 * export default defineApi({
 *     schema: MoveSchema,
 *     handler(req, ctx) {
 *         // req 已验证，类型安全 | req is validated, type-safe
 *         console.log(req.x, req.y);
 *     }
 * })
 * ```
 */
export function defineApi<TReq, TRes, TData = Record<string, unknown>>(
    definition: ApiDefinitionWithSchema<TReq, TRes, TData>
): ApiDefinitionWithSchema<TReq, TRes, TData> {
    return definition;
}

/**
 * @zh 使用 Schema 定义 API 处理器（类型自动推断）
 * @en Define API handler with schema (auto type inference)
 *
 * @example
 * ```typescript
 * import { defineApiWithSchema, s } from '@esengine/server'
 *
 * const MoveSchema = s.object({
 *     x: s.number(),
 *     y: s.number()
 * });
 *
 * export default defineApiWithSchema(MoveSchema, {
 *     handler(req, ctx) {
 *         // req 类型自动推断为 { x: number, y: number }
 *         // req type is auto-inferred as { x: number, y: number }
 *         console.log(req.x, req.y);
 *         return { success: true };
 *     }
 * })
 * ```
 */
export function defineApiWithSchema<
    TReq,
    TRes,
    TData = Record<string, unknown>
>(
    schema: Validator<TReq>,
    definition: Omit<ApiDefinition<TReq, TRes, TData>, 'validate'>
): ApiDefinitionWithSchema<TReq, TRes, TData> {
    return {
        ...definition,
        schema
    };
}

/**
 * @zh 带 Schema 的消息定义选项
 * @en Message definition options with schema
 */
export interface MsgDefinitionWithSchema<TMsg, TData = Record<string, unknown>> extends MsgDefinition<TMsg, TData> {
    /**
     * @zh 消息数据 Schema（自动验证）
     * @en Message data schema (auto validation)
     */
    schema?: Validator<TMsg>;
}

/**
 * @zh 定义消息处理器
 * @en Define message handler
 *
 * @example
 * ```typescript
 * // src/msg/input.ts
 * import { defineMsg } from '@esengine/server'
 *
 * export default defineMsg<MsgInput>({
 *     handler(msg, ctx) {
 *         console.log('Input from', ctx.conn.id, msg)
 *     }
 * })
 * ```
 *
 * @example
 * ```typescript
 * // 使用 Schema 验证 | With schema validation
 * import { defineMsg, s } from '@esengine/server'
 *
 * const InputSchema = s.object({
 *     keys: s.array(s.string()),
 *     timestamp: s.number()
 * });
 *
 * export default defineMsg({
 *     schema: InputSchema,
 *     handler(msg, ctx) {
 *         // msg 已验证，类型安全 | msg is validated, type-safe
 *         console.log(msg.keys, msg.timestamp);
 *     }
 * })
 * ```
 */
export function defineMsg<TMsg, TData = Record<string, unknown>>(
    definition: MsgDefinitionWithSchema<TMsg, TData>
): MsgDefinitionWithSchema<TMsg, TData> {
    return definition;
}

/**
 * @zh 使用 Schema 定义消息处理器（类型自动推断）
 * @en Define message handler with schema (auto type inference)
 *
 * @example
 * ```typescript
 * import { defineMsgWithSchema, s } from '@esengine/server'
 *
 * const InputSchema = s.object({
 *     keys: s.array(s.string()),
 *     timestamp: s.number()
 * });
 *
 * export default defineMsgWithSchema(InputSchema, {
 *     handler(msg, ctx) {
 *         // msg 类型自动推断
 *         // msg type is auto-inferred
 *         console.log(msg.keys, msg.timestamp);
 *     }
 * })
 * ```
 */
export function defineMsgWithSchema<
    TMsg,
    TData = Record<string, unknown>
>(
    schema: Validator<TMsg>,
    definition: MsgDefinition<TMsg, TData>
): MsgDefinitionWithSchema<TMsg, TData> {
    return {
        ...definition,
        schema
    };
}

/**
 * @zh 定义 HTTP 路由处理器
 * @en Define HTTP route handler
 *
 * @example
 * ```typescript
 * // src/http/login.ts
 * import { defineHttp } from '@esengine/server'
 *
 * interface LoginBody {
 *     username: string
 *     password: string
 * }
 *
 * export default defineHttp<LoginBody>({
 *     method: 'POST',
 *     handler(req, res) {
 *         const { username, password } = req.body
 *         // ... validate credentials
 *         res.json({ token: '...', userId: '...' })
 *     }
 * })
 * ```
 */
export function defineHttp<TBody = unknown>(
    definition: HttpDefinition<TBody>
): HttpDefinition<TBody> {
    return definition;
}
