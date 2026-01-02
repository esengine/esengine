/**
 * @zh 平台兼容性 polyfill
 * @en Platform compatibility polyfill
 *
 * @zh 为微信小游戏等不支持原生 TextEncoder/TextDecoder 的平台提供兼容层
 * @en Provides compatibility layer for platforms like WeChat Mini Games that don't support native TextEncoder/TextDecoder
 */

/**
 * @zh 获取全局 TextEncoder 实现
 * @en Get global TextEncoder implementation
 */
function getTextEncoder(): { encode(str: string): Uint8Array } {
    if (typeof TextEncoder !== 'undefined') {
        return new TextEncoder();
    }
    return {
        encode(str: string): Uint8Array {
            const utf8: number[] = [];
            for (let i = 0; i < str.length; i++) {
                let charCode = str.charCodeAt(i);
                if (charCode < 0x80) {
                    utf8.push(charCode);
                } else if (charCode < 0x800) {
                    utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
                } else if (charCode >= 0xd800 && charCode <= 0xdbff) {
                    i++;
                    const low = str.charCodeAt(i);
                    charCode = 0x10000 + ((charCode - 0xd800) << 10) + (low - 0xdc00);
                    utf8.push(
                        0xf0 | (charCode >> 18),
                        0x80 | ((charCode >> 12) & 0x3f),
                        0x80 | ((charCode >> 6) & 0x3f),
                        0x80 | (charCode & 0x3f)
                    );
                } else {
                    utf8.push(
                        0xe0 | (charCode >> 12),
                        0x80 | ((charCode >> 6) & 0x3f),
                        0x80 | (charCode & 0x3f)
                    );
                }
            }
            return new Uint8Array(utf8);
        }
    };
}

/**
 * @zh 获取全局 TextDecoder 实现
 * @en Get global TextDecoder implementation
 */
function getTextDecoder(): { decode(data: Uint8Array): string } {
    if (typeof TextDecoder !== 'undefined') {
        return new TextDecoder();
    }
    return {
        decode(data: Uint8Array): string {
            let str = '';
            let i = 0;
            while (i < data.length) {
                const byte1 = data[i++];
                if (byte1 < 0x80) {
                    str += String.fromCharCode(byte1);
                } else if ((byte1 & 0xe0) === 0xc0) {
                    const byte2 = data[i++];
                    str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
                } else if ((byte1 & 0xf0) === 0xe0) {
                    const byte2 = data[i++];
                    const byte3 = data[i++];
                    str += String.fromCharCode(
                        ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f)
                    );
                } else if ((byte1 & 0xf8) === 0xf0) {
                    const byte2 = data[i++];
                    const byte3 = data[i++];
                    const byte4 = data[i++];
                    const codePoint =
                        ((byte1 & 0x07) << 18) |
                        ((byte2 & 0x3f) << 12) |
                        ((byte3 & 0x3f) << 6) |
                        (byte4 & 0x3f);
                    const offset = codePoint - 0x10000;
                    str += String.fromCharCode(
                        0xd800 + (offset >> 10),
                        0xdc00 + (offset & 0x3ff)
                    );
                }
            }
            return str;
        }
    };
}

const encoder = getTextEncoder();
const decoder = getTextDecoder();

/**
 * @zh 将字符串编码为 UTF-8 字节数组
 * @en Encode string to UTF-8 byte array
 */
export function textEncode(str: string): Uint8Array {
    return encoder.encode(str);
}

/**
 * @zh 将 UTF-8 字节数组解码为字符串
 * @en Decode UTF-8 byte array to string
 */
export function textDecode(data: Uint8Array): string {
    return decoder.decode(data);
}
