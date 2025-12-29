/**
 * @zh 二进制读取器
 * @en Binary Reader
 *
 * @zh 提供高效的二进制数据读取功能
 * @en Provides efficient binary data reading
 */

import { decodeVarint } from './varint';

/**
 * @zh 文本解码器（使用浏览器原生 API）
 * @en Text decoder (using browser native API)
 */
const textDecoder = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null;

/**
 * @zh 二进制读取器
 * @en Binary reader for decoding data
 */
export class BinaryReader {
    /**
     * @zh 数据缓冲区
     * @en Data buffer
     */
    private _buffer: Uint8Array;

    /**
     * @zh DataView 用于读取数值
     * @en DataView for reading numbers
     */
    private _view: DataView;

    /**
     * @zh 当前读取位置
     * @en Current read position
     */
    private _offset: number = 0;

    /**
     * @zh 创建二进制读取器
     * @en Create binary reader
     *
     * @param buffer - @zh 要读取的数据 @en Data to read
     */
    constructor(buffer: Uint8Array) {
        this._buffer = buffer;
        this._view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    }

    /**
     * @zh 获取当前读取位置
     * @en Get current read position
     */
    public get offset(): number {
        return this._offset;
    }

    /**
     * @zh 设置读取位置
     * @en Set read position
     */
    public set offset(value: number) {
        this._offset = value;
    }

    /**
     * @zh 获取剩余可读字节数
     * @en Get remaining readable bytes
     */
    public get remaining(): number {
        return this._buffer.length - this._offset;
    }

    /**
     * @zh 检查是否有更多数据可读
     * @en Check if there's more data to read
     */
    public hasMore(): boolean {
        return this._offset < this._buffer.length;
    }

    /**
     * @zh 读取单个字节
     * @en Read single byte
     */
    public readUint8(): number {
        this.checkBounds(1);
        return this._buffer[this._offset++]!;
    }

    /**
     * @zh 读取有符号字节
     * @en Read signed byte
     */
    public readInt8(): number {
        this.checkBounds(1);
        return this._view.getInt8(this._offset++);
    }

    /**
     * @zh 读取布尔值
     * @en Read boolean
     */
    public readBoolean(): boolean {
        return this.readUint8() !== 0;
    }

    /**
     * @zh 读取 16 位无符号整数（小端序）
     * @en Read 16-bit unsigned integer (little-endian)
     */
    public readUint16(): number {
        this.checkBounds(2);
        const value = this._view.getUint16(this._offset, true);
        this._offset += 2;
        return value;
    }

    /**
     * @zh 读取 16 位有符号整数（小端序）
     * @en Read 16-bit signed integer (little-endian)
     */
    public readInt16(): number {
        this.checkBounds(2);
        const value = this._view.getInt16(this._offset, true);
        this._offset += 2;
        return value;
    }

    /**
     * @zh 读取 32 位无符号整数（小端序）
     * @en Read 32-bit unsigned integer (little-endian)
     */
    public readUint32(): number {
        this.checkBounds(4);
        const value = this._view.getUint32(this._offset, true);
        this._offset += 4;
        return value;
    }

    /**
     * @zh 读取 32 位有符号整数（小端序）
     * @en Read 32-bit signed integer (little-endian)
     */
    public readInt32(): number {
        this.checkBounds(4);
        const value = this._view.getInt32(this._offset, true);
        this._offset += 4;
        return value;
    }

    /**
     * @zh 读取 32 位浮点数（小端序）
     * @en Read 32-bit float (little-endian)
     */
    public readFloat32(): number {
        this.checkBounds(4);
        const value = this._view.getFloat32(this._offset, true);
        this._offset += 4;
        return value;
    }

    /**
     * @zh 读取 64 位浮点数（小端序）
     * @en Read 64-bit float (little-endian)
     */
    public readFloat64(): number {
        this.checkBounds(8);
        const value = this._view.getFloat64(this._offset, true);
        this._offset += 8;
        return value;
    }

    /**
     * @zh 读取变长整数
     * @en Read variable-length integer
     */
    public readVarint(): number {
        const [value, newOffset] = decodeVarint(this._buffer, this._offset);
        this._offset = newOffset;
        return value;
    }

    /**
     * @zh 读取字符串（UTF-8 编码，带长度前缀）
     * @en Read string (UTF-8 encoded with length prefix)
     */
    public readString(): string {
        const length = this.readVarint();
        this.checkBounds(length);

        const bytes = this._buffer.subarray(this._offset, this._offset + length);
        this._offset += length;

        if (textDecoder) {
            return textDecoder.decode(bytes);
        } else {
            return this.utf8BytesToString(bytes);
        }
    }

    /**
     * @zh 读取原始字节
     * @en Read raw bytes
     *
     * @param length - @zh 要读取的字节数 @en Number of bytes to read
     */
    public readBytes(length: number): Uint8Array {
        this.checkBounds(length);
        const bytes = this._buffer.slice(this._offset, this._offset + length);
        this._offset += length;
        return bytes;
    }

    /**
     * @zh 查看下一个字节但不移动读取位置
     * @en Peek next byte without advancing read position
     */
    public peekUint8(): number {
        this.checkBounds(1);
        return this._buffer[this._offset]!;
    }

    /**
     * @zh 跳过指定字节数
     * @en Skip specified number of bytes
     */
    public skip(count: number): void {
        this.checkBounds(count);
        this._offset += count;
    }

    /**
     * @zh 检查边界
     * @en Check bounds
     */
    private checkBounds(size: number): void {
        if (this._offset + size > this._buffer.length) {
            throw new Error(`BinaryReader: buffer overflow (offset=${this._offset}, size=${size}, bufferLength=${this._buffer.length})`);
        }
    }

    /**
     * @zh UTF-8 字节转字符串（后备方案）
     * @en UTF-8 bytes to string (fallback)
     */
    private utf8BytesToString(bytes: Uint8Array): string {
        let result = '';
        let i = 0;

        while (i < bytes.length) {
            let charCode: number;
            const byte1 = bytes[i++]!;

            if (byte1 < 0x80) {
                charCode = byte1;
            } else if (byte1 < 0xE0) {
                const byte2 = bytes[i++]!;
                charCode = ((byte1 & 0x1F) << 6) | (byte2 & 0x3F);
            } else if (byte1 < 0xF0) {
                const byte2 = bytes[i++]!;
                const byte3 = bytes[i++]!;
                charCode = ((byte1 & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F);
            } else {
                const byte2 = bytes[i++]!;
                const byte3 = bytes[i++]!;
                const byte4 = bytes[i++]!;
                charCode = ((byte1 & 0x07) << 18) | ((byte2 & 0x3F) << 12) |
                    ((byte3 & 0x3F) << 6) | (byte4 & 0x3F);

                // Convert to surrogate pair
                if (charCode > 0xFFFF) {
                    charCode -= 0x10000;
                    result += String.fromCharCode(0xD800 + (charCode >> 10));
                    charCode = 0xDC00 + (charCode & 0x3FF);
                }
            }

            result += String.fromCharCode(charCode);
        }

        return result;
    }
}
