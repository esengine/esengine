import { DisplayObject } from './DisplayObject';
import type { IRenderCollector } from '../render/IRenderCollector';

/**
 * Container
 *
 * A concrete DisplayObject that can contain children but has no visual content itself.
 * Used as the display object for GComponent.
 *
 * 一个具体的 DisplayObject，可以包含子对象但本身没有可视内容。
 * 用作 GComponent 的显示对象。
 */
export class Container extends DisplayObject {
    constructor() {
        super();
    }

    /**
     * Collect render data from children
     * 从子对象收集渲染数据
     */
    public collectRenderData(collector: IRenderCollector): void {
        if (!this._visible) return;

        // Update transform before collecting render data
        // 收集渲染数据前更新变换
        this.updateTransform();

        // Collect render data from all children
        // 从所有子对象收集渲染数据
        for (const child of this._children) {
            child.collectRenderData(collector);
        }
    }
}
