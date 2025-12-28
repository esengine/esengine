/**
 * @zh ESEngine RPC 库
 * @en ESEngine RPC Library
 *
 * @zh 类型安全的 RPC 通信库，支持 WebSocket 长连接
 * @en Type-safe RPC communication library with WebSocket support
 *
 * @example
 * ```typescript
 * // 1. 定义协议（共享）
 * import { rpc } from '@esengine/rpc'
 *
 * export const protocol = rpc.define({
 *     api: {
 *         join: rpc.api<{ name: string }, { id: string }>(),
 *     },
 *     msg: {
 *         chat: rpc.msg<{ from: string; text: string }>(),
 *     },
 * })
 *
 * // 2. 服务端
 * import { serve } from '@esengine/rpc/server'
 *
 * const server = serve(protocol, {
 *     port: 3000,
 *     api: {
 *         join: async (input, conn) => ({ id: conn.id }),
 *     },
 * })
 * await server.start()
 *
 * // 3. 客户端
 * import { connect } from '@esengine/rpc/client'
 *
 * const client = await connect(protocol, 'ws://localhost:3000')
 * const result = await client.call('join', { name: 'Alice' })
 * ```
 */

export { rpc } from './define'
export * from './types'

// Re-export client for browser/bundler compatibility
export { RpcClient, connect } from './client/index'
export type { RpcClientOptions, WebSocketAdapter, WebSocketFactory } from './client/index'
