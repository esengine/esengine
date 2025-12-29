/**
 * @zh 二进制写入器
 * @en Binary Writer
 *
 * @zh 提供高效的二进制数据写入功能，支持自动扩容
 * @en Provides efficient binary data writing with auto-expansion
 */

import { encodeVarint, varintSize } from './varint';

/**
 * @zh 文本编码器（使用浏览器原生 API）
 * @en Text encoder (using browser native API)
 */
const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

/**
 * @zh 二进制写入器
 * @en Binary writer for encoding data
 */
export class BinaryWriter {
    /**
     * @zh 内部缓冲区
     * @en Internal buffer
     */
    private _buffer: Uint8Array;

    /**
     * @zh DataView 用于写入数值
     * @en DataView for writing numbers
     */
    private _view: DataView;

    /**
     * @zh 当前写入位置
     * @en Current write position
     */
    private _offset: number = 0;

    /**
     * @zh 创建二进制写入器
     * @en Create binary writer
     *
     * @param initialCapacity - @zh 初始容量 @en Initial capacity
     */
    constructor(initialCapacity: number = 256) {
        this._buffer = new Uint8Array(initialCapacity);
        this._view = new DataView(this._buffer.buffer);
    }

    /**
     * @zh 获取当前写入位置
     * @en Get current write position
     */
    public get offset(): number {
        return this._offset;
    }

    /**
     * @zh 获取写入的数据
     * @en Get written data
     *
     * @returns @zh 包含写入数据的 Uint8Array @en Uint8Array containing written data
     */
    public toUint8Array(): Uint8Array {
        return this._buffer.slice(0, this._offset);
    }

    /**
     * @zh 重置写入器（清空数据但保留缓冲区）
     * @en Reset writer (clear data but keep buffer)
     */
    public reset(): void {
        this._offset = 0;
    }

    /**
     * @zh 确保有足够空间
     * @en Ensure enough space
     *
     * @param size - @zh 需要的额外字节数 @en Extra bytes needed
     */
    private ensureCapacity(size: number): void {
        const required = this._offset + size;
        if (required > this._buffer.length) {
            // Double the buffer size or use required size, whichever is larger
            const newSize = Math.max(this._buffer.length * 2, required);
            const newBuffer = new Uint8Array(newSize);
            newBuffer.set(this._buffer);
            this._buffer = newBuffer;
            this._view = new DataView(this._buffer.buffer);
        }
    }

    /**
     * @zh 写入单个字节
     * @en Write single byte
     */
    public writeUint8(value: number): void {
        this.ensureCapacity(1);
        this._buffer[this._offset++] = value;
    }

    /**
     * @zh 写入有符号字节
     * @en Write signed byte
     */
    public writeInt8(value: number): void {
        this.ensureCapacity(1);
        this._view.setInt8(this._offset++, value);
    }

    /**
     * @zh 写入布尔值
     * @en Write boolean
     */
    public writeBoolean(value: boolean): void {
        this.writeUint8(value ? 1 : 0);
    }

    /**
     * @zh 写入 16 位无符号整数（小端序）
     * @en Write 16-bit unsigned integer (little-endian)
     */
    public writeUint16(value: number): void {
        this.ensureCapacity(2);
        this._view.setUint16(this._offset, value, true);
        this._offset += 2;
    }

    /**
     * @zh 写入 16 位有符号整数（小端序）
     * @en Write 16-bit signed integer (little-endian)
     */
    public writeInt16(value: number): void {
        this.ensureCapacity(2);
        this._view.setInt16(this._offset, value, true);
        this._offset += 2;
    }

    /**
     * @zh 写入 32 位无符号整数（小端序）
     * @en Write 32-bit unsigned integer (little-endian)
     */
    public writeUint32(value: number): void {
        this.ensureCapacity(4);
        this._view.setUint32(this._offset, value, true);
        this._offset += 4;
    }

    /**
     * @zh 写入 32 位有符号整数（小端序）
     * @en Write 32-bit signed integer (little-endian)
     */
    public writeInt32(value: number): void {
        this.ensureCapacity(4);
        this._view.setInt32(this._offset, value, true);
        this._offset += 4;
    }

    /**
     * @zh 写入 32 位浮点数（小端序）
     * @en Write 32-bit float (little-endian)
     */
    public writeFloat32(value: number): void {
        this.ensureCapacity(4);
        this._view.setFloat32(this._offset, value, true);
        this._offset += 4;
    }

    /**
     * @zh 写入 64 位浮点数（小端序）
     * @en Write 64-bit float (little-endian)
     */
    public writeFloat64(value: number): void {
        this.ensureCapacity(8);
        this._view.setFloat64(this._offset, value, true);
        this._offset += 8;
    }

    /**
     * @zh 写入变长整数
     * @en Write variable-length integer
     */
    public writeVarint(value: number): void {
        this.ensureCapacity(varintSize(value));
        this._offset = encodeVarint(value, this._buffer, this._offset);
    }

    /**
     * @zh 写入字符串（UTF-8 编码，带长度前缀）
     * @en Write string (UTF-8 encoded with length prefix)
     */
    public writeString(value: string): void {
        if (textEncoder) {
            const encoded = textEncoder.encode(value);
            this.writeVarint(encoded.length);
            this.ensureCapacity(encoded.length);
            this._buffer.set(encoded, this._offset);
            this._offset += encoded.length;
        } else {
            // Fallback for environments without TextEncoder
            const bytes = this.stringToUtf8Bytes(value);
            this.writeVarint(bytes.length);
            this.ensureCapacity(bytes.length);
            this._buffer.set(bytes, this._offset);
            this._offset += bytes.length;
        }
    }

    /**
     * @zh 写入原始字节
     * @en Write raw bytes
     */
    public writeBytes(data: Uint8Array): void {
        this.ensureCapacity(data.length);
        this._buffer.set(data, this._offset);
        this._offset += data.length;
    }

    /**
     * @zh 字符串转 UTF-8 字节（后备方案）
     * @en String to UTF-8 bytes (fallback)
     */
    private stringToUtf8Bytes(str: string): Uint8Array {
        const bytes: number[] = [];
        for (let i = 0; i < str.length; i++) {
            let charCode = str.charCodeAt(i);

            // Handle surrogate pairs
            if (charCode >= 0xD800 && charCode <= 0xDBFF && i + 1 < str.length) {
                const next = str.charCodeAt(i + 1);
                if (next >= 0xDC00 && next <= 0xDFFF) {
                    charCode = 0x10000 + ((charCode - 0xD800) << 10) + (next - 0xDC00);
                    i++;
                }
            }

            if (charCode < 0x80) {
                bytes.push(charCode);
            } else if (charCode < 0x800) {
                bytes.push(0xC0 | (charCode >> 6));
                bytes.push(0x80 | (charCode & 0x3F));
            } else if (charCode < 0x10000) {
                bytes.push(0xE0 | (charCode >> 12));
                bytes.push(0x80 | ((charCode >> 6) & 0x3F));
                bytes.push(0x80 | (charCode & 0x3F));
            } else {
                bytes.push(0xF0 | (charCode >> 18));
                bytes.push(0x80 | ((charCode >> 12) & 0x3F));
                bytes.push(0x80 | ((charCode >> 6) & 0x3F));
                bytes.push(0x80 | (charCode & 0x3F));
            }
        }
        return new Uint8Array(bytes);
    }
}
