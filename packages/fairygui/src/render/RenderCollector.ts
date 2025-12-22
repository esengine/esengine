import type { IRectangle } from '../utils/MathTypes';
import type { IRenderCollector, IRenderPrimitive } from './IRenderCollector';

/**
 * RenderCollector
 *
 * Collects render primitives from UI hierarchy for batch rendering.
 * Implements IRenderCollector interface with efficient primitive storage.
 *
 * 从 UI 层级收集渲染图元用于批量渲染
 */
export class RenderCollector implements IRenderCollector {
    private _primitives: IRenderPrimitive[] = [];
    private _clipStack: IRectangle[] = [];
    private _sortNeeded: boolean = false;

    /**
     * Add a render primitive
     * 添加渲染图元
     */
    public addPrimitive(primitive: IRenderPrimitive): void {
        this._primitives.push(primitive);
        this._sortNeeded = true;
    }

    /**
     * Push a clip rect onto the stack
     * 压入裁剪矩形
     */
    public pushClipRect(rect: IRectangle): void {
        if (this._clipStack.length > 0) {
            // Intersect with current clip rect
            const current = this._clipStack[this._clipStack.length - 1];
            const intersected = this.intersectRects(current, rect);
            this._clipStack.push(intersected);
        } else {
            this._clipStack.push({ ...rect });
        }
    }

    /**
     * Pop the current clip rect
     * 弹出当前裁剪矩形
     */
    public popClipRect(): void {
        if (this._clipStack.length > 0) {
            this._clipStack.pop();
        }
    }

    /**
     * Get current clip rect
     * 获取当前裁剪矩形
     */
    public getCurrentClipRect(): IRectangle | null {
        if (this._clipStack.length > 0) {
            return this._clipStack[this._clipStack.length - 1];
        }
        return null;
    }

    /**
     * Clear all primitives
     * 清除所有图元
     */
    public clear(): void {
        this._primitives.length = 0;
        this._clipStack.length = 0;
        this._sortNeeded = false;
    }

    /**
     * Get all primitives sorted by sortOrder
     * 获取所有按 sortOrder 排序的图元
     */
    public getPrimitives(): readonly IRenderPrimitive[] {
        if (this._sortNeeded) {
            this._primitives.sort((a, b) => a.sortOrder - b.sortOrder);
            this._sortNeeded = false;
        }
        return this._primitives;
    }

    /**
     * Get primitive count
     * 获取图元数量
     */
    public get primitiveCount(): number {
        return this._primitives.length;
    }

    /**
     * Get clip stack depth
     * 获取裁剪栈深度
     */
    public get clipStackDepth(): number {
        return this._clipStack.length;
    }

    /**
     * Calculate intersection of two rectangles
     * 计算两个矩形的交集
     */
    private intersectRects(a: IRectangle, b: IRectangle): IRectangle {
        const x = Math.max(a.x, b.x);
        const y = Math.max(a.y, b.y);
        const right = Math.min(a.x + a.width, b.x + b.width);
        const bottom = Math.min(a.y + a.height, b.y + b.height);

        return {
            x,
            y,
            width: Math.max(0, right - x),
            height: Math.max(0, bottom - y)
        };
    }

    /**
     * Iterate over primitives with callback
     * 遍历图元
     */
    public forEach(callback: (primitive: IRenderPrimitive, index: number) => void): void {
        const primitives = this.getPrimitives();
        for (let i = 0; i < primitives.length; i++) {
            callback(primitives[i], i);
        }
    }

    /**
     * Filter primitives by type
     * 按类型过滤图元
     */
    public filterByType(type: string): IRenderPrimitive[] {
        return this._primitives.filter((p) => p.type === type);
    }
}
