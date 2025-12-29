/**
 * @zh 变长整数编解码
 * @en Variable-length integer encoding/decoding
 *
 * @zh 使用 LEB128 编码方式，可变长度编码正整数。
 * 小数值使用更少字节，大数值使用更多字节。
 * @en Uses LEB128 encoding for variable-length integer encoding.
 * Small values use fewer bytes, large values use more bytes.
 *
 * | 值范围 | 字节数 |
 * |--------|--------|
 * | 0-127 | 1 |
 * | 128-16383 | 2 |
 * | 16384-2097151 | 3 |
 * | 2097152-268435455 | 4 |
 * | 268435456+ | 5 |
 */

/**
 * @zh 计算变长整数所需的字节数
 * @en Calculate bytes needed for a varint
 *
 * @param value - @zh 整数值 @en Integer value
 * @returns @zh 所需字节数 @en Bytes needed
 */
export function varintSize(value: number): number {
    if (value < 0) {
        throw new Error('Varint only supports non-negative integers');
    }
    if (value < 128) return 1;
    if (value < 16384) return 2;
    if (value < 2097152) return 3;
    if (value < 268435456) return 4;
    return 5;
}

/**
 * @zh 编码变长整数到字节数组
 * @en Encode varint to byte array
 *
 * @param value - @zh 要编码的整数 @en Integer to encode
 * @param buffer - @zh 目标缓冲区 @en Target buffer
 * @param offset - @zh 写入偏移 @en Write offset
 * @returns @zh 写入后的新偏移 @en New offset after writing
 */
export function encodeVarint(value: number, buffer: Uint8Array, offset: number): number {
    if (value < 0) {
        throw new Error('Varint only supports non-negative integers');
    }

    while (value >= 0x80) {
        buffer[offset++] = (value & 0x7F) | 0x80;
        value >>>= 7;
    }
    buffer[offset++] = value;
    return offset;
}

/**
 * @zh 从字节数组解码变长整数
 * @en Decode varint from byte array
 *
 * @param buffer - @zh 源缓冲区 @en Source buffer
 * @param offset - @zh 读取偏移 @en Read offset
 * @returns @zh [解码值, 新偏移] @en [decoded value, new offset]
 */
export function decodeVarint(buffer: Uint8Array, offset: number): [number, number] {
    let result = 0;
    let shift = 0;
    let byte: number;

    do {
        if (offset >= buffer.length) {
            throw new Error('Varint decode: buffer overflow');
        }
        byte = buffer[offset++]!;
        result |= (byte & 0x7F) << shift;
        shift += 7;
    } while (byte >= 0x80);

    return [result, offset];
}

/**
 * @zh 编码有符号整数（ZigZag 编码）
 * @en Encode signed integer (ZigZag encoding)
 *
 * @zh ZigZag 编码将有符号整数映射到无符号整数：
 * 0 → 0, -1 → 1, 1 → 2, -2 → 3, 2 → 4, ...
 * 这样小的负数也能用较少字节表示。
 * @en ZigZag encoding maps signed integers to unsigned:
 * 0 → 0, -1 → 1, 1 → 2, -2 → 3, 2 → 4, ...
 * This allows small negative numbers to use fewer bytes.
 *
 * @param value - @zh 有符号整数 @en Signed integer
 * @returns @zh ZigZag 编码后的值 @en ZigZag encoded value
 */
export function zigzagEncode(value: number): number {
    return (value << 1) ^ (value >> 31);
}

/**
 * @zh 解码有符号整数（ZigZag 解码）
 * @en Decode signed integer (ZigZag decoding)
 *
 * @param value - @zh ZigZag 编码的值 @en ZigZag encoded value
 * @returns @zh 原始有符号整数 @en Original signed integer
 */
export function zigzagDecode(value: number): number {
    return (value >>> 1) ^ -(value & 1);
}

/**
 * @zh 编码有符号变长整数
 * @en Encode signed varint
 *
 * @param value - @zh 有符号整数 @en Signed integer
 * @param buffer - @zh 目标缓冲区 @en Target buffer
 * @param offset - @zh 写入偏移 @en Write offset
 * @returns @zh 写入后的新偏移 @en New offset after writing
 */
export function encodeSignedVarint(value: number, buffer: Uint8Array, offset: number): number {
    return encodeVarint(zigzagEncode(value), buffer, offset);
}

/**
 * @zh 解码有符号变长整数
 * @en Decode signed varint
 *
 * @param buffer - @zh 源缓冲区 @en Source buffer
 * @param offset - @zh 读取偏移 @en Read offset
 * @returns @zh [解码值, 新偏移] @en [decoded value, new offset]
 */
export function decodeSignedVarint(buffer: Uint8Array, offset: number): [number, number] {
    const [encoded, newOffset] = decodeVarint(buffer, offset);
    return [zigzagDecode(encoded), newOffset];
}
