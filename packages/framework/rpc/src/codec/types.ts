/**
 * @zh 编解码器类型定义
 * @en Codec Type Definitions
 */

import type { Packet } from '../types';

/**
 * @zh 编解码器接口
 * @en Codec interface
 */
export interface Codec {
    /**
     * @zh 编码数据包
     * @en Encode packet
     */
    encode(packet: Packet): string | Uint8Array

    /**
     * @zh 解码数据包
     * @en Decode packet
     */
    decode(data: string | Uint8Array): Packet
}
