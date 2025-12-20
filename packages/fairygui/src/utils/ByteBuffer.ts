/**
 * ByteBuffer
 *
 * Binary data reader for parsing FairyGUI package files.
 *
 * 二进制数据读取器，用于解析 FairyGUI 包文件
 */
export class ByteBuffer {
    private _data: DataView;
    private _position: number = 0;
    private _littleEndian: boolean = false;
    private _stringTable: string[] = [];
    private _version: number = 0;

    constructor(buffer: ArrayBuffer, offset: number = 0, length?: number) {
        length = length ?? buffer.byteLength - offset;
        this._data = new DataView(buffer, offset, length);
    }

    /**
     * Get buffer length
     * 获取缓冲区长度
     */
    public get length(): number {
        return this._data.byteLength;
    }

    /**
     * Get current position
     * 获取当前位置
     */
    public get position(): number {
        return this._position;
    }

    /**
     * Set current position
     * 设置当前位置
     */
    public set position(value: number) {
        this._position = value;
    }

    /**
     * Get version
     * 获取版本
     */
    public get version(): number {
        return this._version;
    }

    /**
     * Set version
     * 设置版本
     */
    public set version(value: number) {
        this._version = value;
    }

    /**
     * Check if can read more bytes
     * 检查是否可以读取更多字节
     */
    public get bytesAvailable(): number {
        return this._data.byteLength - this._position;
    }

    /**
     * Skip bytes
     * 跳过字节
     */
    public skip(count: number): void {
        this._position += count;
    }

    /**
     * Seek to position
     * 定位到指定位置
     */
    public seek(indexTablePos: number, blockIndex: number): boolean {
        const tmp = this._position;
        this._position = indexTablePos;

        const segCount = this.getUint8();
        if (blockIndex < segCount) {
            const useShort = this.getUint8() === 1;
            let newPos: number;

            if (useShort) {
                this._position = indexTablePos + 2 + 2 * blockIndex;
                newPos = this.getUint16();
            } else {
                this._position = indexTablePos + 2 + 4 * blockIndex;
                newPos = this.getUint32();
            }

            if (newPos > 0) {
                this._position = indexTablePos + newPos;
                return true;
            } else {
                this._position = tmp;
                return false;
            }
        } else {
            this._position = tmp;
            return false;
        }
    }

    // Read methods | 读取方法

    public getUint8(): number {
        const value = this._data.getUint8(this._position);
        this._position += 1;
        return value;
    }

    public getInt8(): number {
        const value = this._data.getInt8(this._position);
        this._position += 1;
        return value;
    }

    public getUint16(): number {
        const value = this._data.getUint16(this._position, this._littleEndian);
        this._position += 2;
        return value;
    }

    public getInt16(): number {
        const value = this._data.getInt16(this._position, this._littleEndian);
        this._position += 2;
        return value;
    }

    public getUint32(): number {
        const value = this._data.getUint32(this._position, this._littleEndian);
        this._position += 4;
        return value;
    }

    public getInt32(): number {
        const value = this._data.getInt32(this._position, this._littleEndian);
        this._position += 4;
        return value;
    }

    public getFloat32(): number {
        const value = this._data.getFloat32(this._position, this._littleEndian);
        this._position += 4;
        return value;
    }

    public getFloat64(): number {
        const value = this._data.getFloat64(this._position, this._littleEndian);
        this._position += 8;
        return value;
    }

    /**
     * Read boolean
     * 读取布尔值
     */
    public readBool(): boolean {
        return this.getUint8() === 1;
    }

    /**
     * Read byte
     * 读取字节
     */
    public readByte(): number {
        return this.getUint8();
    }

    /**
     * Read short
     * 读取短整数
     */
    public readShort(): number {
        return this.getInt16();
    }

    /**
     * Read unsigned short
     * 读取无符号短整数
     */
    public readUshort(): number {
        return this.getUint16();
    }

    /**
     * Read int
     * 读取整数
     */
    public readInt(): number {
        return this.getInt32();
    }

    /**
     * Read unsigned int
     * 读取无符号整数
     */
    public readUint(): number {
        return this.getUint32();
    }

    /**
     * Read float
     * 读取浮点数
     */
    public readFloat(): number {
        return this.getFloat32();
    }

    /**
     * Read string from string table
     * 从字符串表读取字符串
     */
    public readS(): string {
        const index = this.getUint16();
        if (index === 65535) {
            return '';
        }
        return this._stringTable[index] || '';
    }

    /**
     * Read string with length prefix
     * 读取带长度前缀的字符串
     */
    public readString(): string {
        const len = this.getUint16();
        if (len === 0) {
            return '';
        }
        return this.readStringWithLength(len);
    }

    private readStringWithLength(len: number): string {
        const bytes = new Uint8Array(this._data.buffer, this._data.byteOffset + this._position, len);
        this._position += len;
        return new TextDecoder('utf-8').decode(bytes);
    }

    /**
     * Read color
     * 读取颜色
     */
    public readColor(bHasAlpha: boolean = false): number {
        const r = this.getUint8();
        const g = this.getUint8();
        const b = this.getUint8();
        const a = bHasAlpha ? this.getUint8() : 255;
        return (a << 24) | (r << 16) | (g << 8) | b;
    }

    /**
     * Read bytes
     * 读取字节数组
     */
    public readBytes(length: number): Uint8Array {
        const bytes = new Uint8Array(this._data.buffer, this._data.byteOffset + this._position, length);
        this._position += length;
        return bytes;
    }

    /**
     * Set string table
     * 设置字符串表
     */
    public set stringTable(value: string[]) {
        this._stringTable = value;
    }

    /**
     * Get string table
     * 获取字符串表
     */
    public get stringTable(): string[] {
        return this._stringTable;
    }

    /**
     * Alias for position getter
     * position getter 别名
     */
    public get pos(): number {
        return this._position;
    }

    /**
     * Alias for position setter
     * position setter 别名
     */
    public set pos(value: number) {
        this._position = value;
    }

    /**
     * Get underlying buffer
     * 获取底层缓冲区
     */
    public get buffer(): ArrayBuffer {
        return this._data.buffer as ArrayBuffer;
    }

    /**
     * Read UTF string (length-prefixed)
     * 读取 UTF 字符串（带长度前缀）
     */
    public readUTFString(): string {
        const len = this.getUint16();
        if (len === 0) {
            return '';
        }
        return this.readStringWithLength(len);
    }

    /**
     * Read string array
     * 读取字符串数组
     */
    public readSArray(count: number): string[] {
        const arr: string[] = [];
        for (let i = 0; i < count; i++) {
            arr.push(this.readS());
        }
        return arr;
    }

    /**
     * Read custom string with specified length
     * 读取指定长度的自定义字符串
     */
    public getCustomString(len: number): string {
        const bytes = new Uint8Array(this._data.buffer, this._data.byteOffset + this._position, len);
        this._position += len;
        return new TextDecoder('utf-8').decode(bytes);
    }

    /**
     * Read sub-buffer
     * 读取子缓冲区
     */
    public readBuffer(): ByteBuffer {
        const len = this.getUint32();
        const buffer = new ByteBuffer(this._data.buffer as ArrayBuffer, this._data.byteOffset + this._position, len);
        buffer.version = this._version;
        buffer.stringTable = this._stringTable;
        this._position += len;
        return buffer;
    }

    /**
     * Read Int32 (alias)
     * 读取 Int32（别名）
     */
    public readInt32(): number {
        return this.getInt32();
    }

    /**
     * Read Uint16 (alias)
     * 读取 Uint16（别名）
     */
    public readUint16(): number {
        return this.getUint16();
    }
}
