/**
 * TweenValue
 *
 * Container for tween interpolation values.
 * Supports up to 4 numeric values and color values.
 *
 * 补间插值容器，支持最多 4 个数值和颜色值
 */
export class TweenValue {
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;
    public w: number = 0;

    private _color: number = 0;

    /**
     * Get/set color value (packed ARGB)
     * 获取/设置颜色值（打包的 ARGB）
     */
    public get color(): number {
        return this._color;
    }

    public set color(value: number) {
        this._color = value;
        // Unpack color to x, y, z, w (r, g, b, a)
        this.x = (value >> 16) & 0xff;
        this.y = (value >> 8) & 0xff;
        this.z = value & 0xff;
        this.w = (value >> 24) & 0xff;
    }

    /**
     * Get field by index (0=x, 1=y, 2=z, 3=w)
     * 根据索引获取字段
     */
    public getField(index: number): number {
        switch (index) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            case 2:
                return this.z;
            case 3:
                return this.w;
            default:
                return 0;
        }
    }

    /**
     * Set field by index (0=x, 1=y, 2=z, 3=w)
     * 根据索引设置字段
     */
    public setField(index: number, value: number): void {
        switch (index) {
            case 0:
                this.x = value;
                break;
            case 1:
                this.y = value;
                break;
            case 2:
                this.z = value;
                break;
            case 3:
                this.w = value;
                break;
        }
    }

    /**
     * Reset all values to zero
     * 重置所有值为零
     */
    public setZero(): void {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;
    }

    /**
     * Copy from another TweenValue
     * 从另一个 TweenValue 复制
     */
    public copyFrom(source: TweenValue): void {
        this.x = source.x;
        this.y = source.y;
        this.z = source.z;
        this.w = source.w;
        this._color = source._color;
    }
}
