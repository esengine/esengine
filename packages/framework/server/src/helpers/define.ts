/**
 * @zh API、消息和 HTTP 定义助手
 * @en API, message, and HTTP definition helpers
 */

import type { ApiDefinition, MsgDefinition, HttpDefinition } from '../types/index.js'

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
 */
export function defineApi<TReq, TRes, TData = Record<string, unknown>>(
    definition: ApiDefinition<TReq, TRes, TData>
): ApiDefinition<TReq, TRes, TData> {
    return definition
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
 */
export function defineMsg<TMsg, TData = Record<string, unknown>>(
    definition: MsgDefinition<TMsg, TData>
): MsgDefinition<TMsg, TData> {
    return definition
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
    return definition
}
