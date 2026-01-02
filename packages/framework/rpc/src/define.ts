/**
 * @zh 协议定义模块
 * @en Protocol Definition Module
 */

import type { ApiDef, MsgDef, ProtocolDef } from './types';

/**
 * @zh 创建 API 定义
 * @en Create API definition
 *
 * @example
 * ```typescript
 * const join = rpc.api<{ name: string }, { id: string }>()
 * ```
 */
function api<TInput = void, TOutput = void>(): ApiDef<TInput, TOutput> {
    return { _type: 'api' } as ApiDef<TInput, TOutput>;
}

/**
 * @zh 创建消息定义
 * @en Create message definition
 *
 * @example
 * ```typescript
 * const chat = rpc.msg<{ from: string; text: string }>()
 * ```
 */
function msg<TData = void>(): MsgDef<TData> {
    return { _type: 'msg' } as MsgDef<TData>;
}

/**
 * @zh 定义协议
 * @en Define protocol
 *
 * @example
 * ```typescript
 * export const protocol = rpc.define({
 *     api: {
 *         join: rpc.api<{ name: string }, { id: string }>(),
 *         leave: rpc.api<void, void>(),
 *     },
 *     msg: {
 *         chat: rpc.msg<{ from: string; text: string }>(),
 *     },
 * })
 * ```
 */
function define<T extends ProtocolDef>(protocol: T): T {
    return protocol;
}

/**
 * @zh RPC 协议定义工具
 * @en RPC protocol definition utilities
 */
export const rpc = {
    define,
    api,
    msg
} as const;
