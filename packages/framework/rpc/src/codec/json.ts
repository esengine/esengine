/**
 * @zh JSON 编解码器
 * @en JSON Codec
 */

import type { Packet } from '../types'
import type { Codec } from './types'
import { textDecode } from './polyfill'

/**
 * @zh 创建 JSON 编解码器
 * @en Create JSON codec
 *
 * @zh 适用于开发调试，可读性好
 * @en Suitable for development, human-readable
 */
export function json(): Codec {
    return {
        encode(packet: Packet): string {
            return JSON.stringify(packet)
        },

        decode(data: string | Uint8Array): Packet {
            const str = typeof data === 'string'
                ? data
                : textDecode(data)
            return JSON.parse(str) as Packet
        },
    }
}
