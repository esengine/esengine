/**
 * @zh MessagePack 编解码器
 * @en MessagePack Codec
 */

import { Packr, Unpackr } from 'msgpackr';
import type { Packet } from '../types';
import type { Codec } from './types';
import { textEncode } from './polyfill';

/**
 * @zh 创建 MessagePack 编解码器
 * @en Create MessagePack codec
 *
 * @zh 适用于生产环境，体积更小、速度更快
 * @en Suitable for production, smaller size and faster speed
 */
export function msgpack(): Codec {
    const encoder = new Packr({ structuredClone: true });
    const decoder = new Unpackr({ structuredClone: true });

    return {
        encode(packet: Packet): Uint8Array {
            return encoder.pack(packet);
        },

        decode(data: string | Uint8Array): Packet {
            const buf = typeof data === 'string'
                ? textEncode(data)
                : data;
            return decoder.unpack(buf) as Packet;
        }
    };
}
