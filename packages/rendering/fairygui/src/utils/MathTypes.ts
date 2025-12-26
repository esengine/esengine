/**
 * Point interface
 * 2D point
 */
export interface IPoint {
    x: number;
    y: number;
}

/**
 * Rectangle interface
 * 2D rectangle
 */
export interface IRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Point class
 * 2D point with utility methods
 */
export class Point implements IPoint {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public set(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }

    public copyFrom(source: IPoint): this {
        this.x = source.x;
        this.y = source.y;
        return this;
    }

    public clone(): Point {
        return new Point(this.x, this.y);
    }

    public distance(target: IPoint): number {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public equals(other: IPoint): boolean {
        return this.x === other.x && this.y === other.y;
    }

    public static readonly ZERO: Readonly<Point> = new Point(0, 0);
}

/**
 * Rectangle class
 * 2D rectangle with utility methods
 */
export class Rectangle implements IRectangle {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public get right(): number {
        return this.x + this.width;
    }

    public get bottom(): number {
        return this.y + this.height;
    }

    public set(x: number, y: number, width: number, height: number): this {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
    }

    public copyFrom(source: IRectangle): this {
        this.x = source.x;
        this.y = source.y;
        this.width = source.width;
        this.height = source.height;
        return this;
    }

    public clone(): Rectangle {
        return new Rectangle(this.x, this.y, this.width, this.height);
    }

    public contains(x: number, y: number): boolean {
        return x >= this.x && x < this.right && y >= this.y && y < this.bottom;
    }

    public containsPoint(point: IPoint): boolean {
        return this.contains(point.x, point.y);
    }

    public intersects(other: IRectangle): boolean {
        return !(
            other.x >= this.right ||
            other.x + other.width <= this.x ||
            other.y >= this.bottom ||
            other.y + other.height <= this.y
        );
    }

    public intersection(other: IRectangle, out?: Rectangle): Rectangle | null {
        const x = Math.max(this.x, other.x);
        const y = Math.max(this.y, other.y);
        const right = Math.min(this.right, other.x + other.width);
        const bottom = Math.min(this.bottom, other.y + other.height);

        if (right <= x || bottom <= y) {
            return null;
        }

        out = out || new Rectangle();
        return out.set(x, y, right - x, bottom - y);
    }

    public union(other: IRectangle, out?: Rectangle): Rectangle {
        const x = Math.min(this.x, other.x);
        const y = Math.min(this.y, other.y);
        const right = Math.max(this.right, other.x + other.width);
        const bottom = Math.max(this.bottom, other.y + other.height);

        out = out || new Rectangle();
        return out.set(x, y, right - x, bottom - y);
    }

    public isEmpty(): boolean {
        return this.width <= 0 || this.height <= 0;
    }

    public setEmpty(): this {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        return this;
    }

    public static readonly EMPTY: Readonly<Rectangle> = new Rectangle();
}

/**
 * Margin class
 * Represents margins/padding (left, top, right, bottom)
 */
export class Margin {
    public left: number;
    public top: number;
    public right: number;
    public bottom: number;

    constructor(left: number = 0, top: number = 0, right: number = 0, bottom: number = 0) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }

    public copyFrom(source: Margin): this {
        this.left = source.left;
        this.top = source.top;
        this.right = source.right;
        this.bottom = source.bottom;
        return this;
    }

    public clone(): Margin {
        return new Margin(this.left, this.top, this.right, this.bottom);
    }
}
