/**
 * UI Slider Fill Control System
 * UI 滑块填充控制系统
 *
 * Runs BEFORE UILayoutSystem to modify Fill entity's anchors based on slider progress.
 * This allows UILayoutSystem to correctly compute Fill's position and size.
 *
 * 在 UILayoutSystem 之前运行，根据滑块进度修改 Fill 实体的锚点。
 * 这样 UILayoutSystem 可以正确计算 Fill 的位置和尺寸。
 */

import { EntitySystem, Matcher, Entity, ECSSystem, Core } from '@esengine/ecs-framework';
import { UITransformComponent } from '../components/UITransformComponent';
import { UISliderComponent, UISliderOrientation } from '../components/widgets/UISliderComponent';

/**
 * UI Slider Fill Control System
 * UI 滑块填充控制系统
 *
 * Controls the Fill entity's anchor to reflect slider progress.
 * Must run before UILayoutSystem (updateOrder < 0).
 *
 * 控制 Fill 实体的锚点以反映滑块进度。
 * 必须在 UILayoutSystem 之前运行（updateOrder < 0）。
 */
@ECSSystem('UISliderFill', { updateOrder: -10, runInEditMode: true })
export class UISliderFillSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(UITransformComponent, UISliderComponent));
    }

    protected process(entities: readonly Entity[]): void {
        const scene = Core.scene;
        if (!scene) return;

        for (const entity of entities) {
            const slider = entity.getComponent(UISliderComponent);
            if (!slider || slider.fillRectEntityId <= 0) continue;

            const fillEntity = scene.entities.findEntityById(slider.fillRectEntityId);
            if (!fillEntity) continue;

            const fillTransform = fillEntity.getComponent(UITransformComponent);
            if (!fillTransform) continue;

            const progress = slider.getProgress();
            const isHorizontal = slider.orientation === UISliderOrientation.Horizontal;

            if (isHorizontal) {
                // For horizontal slider:
                // - X: anchorMinX=0, anchorMaxX=progress (stretch by progress)
                // - Y: anchorMinY=0, anchorMaxY=1 (full vertical stretch in parent)
                // 水平滑块：
                // - X：anchorMinX=0, anchorMaxX=progress（按进度拉伸）
                // - Y：anchorMinY=0, anchorMaxY=1（在父容器内垂直完全拉伸）
                const targetAnchorMaxX = progress;

                // Check if any anchor needs update
                // 检查是否有锚点需要更新
                const needsUpdate =
                    Math.abs(fillTransform.anchorMaxX - targetAnchorMaxX) > 0.0001 ||
                    fillTransform.anchorMinX !== 0 ||
                    fillTransform.anchorMinY !== 0 ||
                    fillTransform.anchorMaxY !== 1;

                if (needsUpdate) {
                    // X axis: stretch from left to progress
                    // X 轴：从左边拉伸到进度位置
                    fillTransform.anchorMinX = 0;
                    fillTransform.anchorMaxX = targetAnchorMaxX;

                    // Y axis: full stretch within parent (Fill Area)
                    // Y 轴：在父容器（Fill Area）内完全拉伸
                    fillTransform.anchorMinY = 0;
                    fillTransform.anchorMaxY = 1;

                    // For stretch mode, size stores sizeDelta (usually 0)
                    // 拉伸模式下，尺寸存储 sizeDelta（通常为 0）
                    fillTransform.width = 0;
                    fillTransform.height = 0;

                    // Mark as dirty for UILayoutSystem
                    // 标记为脏，让 UILayoutSystem 重新计算
                    fillTransform.layoutDirty = true;
                }
            } else {
                // For vertical slider:
                // - Y: anchorMinY=0, anchorMaxY=progress (stretch by progress)
                // - X: anchorMinX=0, anchorMaxX=1 (full horizontal stretch in parent)
                // 垂直滑块：
                // - Y：anchorMinY=0, anchorMaxY=progress（按进度拉伸）
                // - X：anchorMinX=0, anchorMaxX=1（在父容器内水平完全拉伸）
                const targetAnchorMaxY = progress;

                const needsUpdate =
                    Math.abs(fillTransform.anchorMaxY - targetAnchorMaxY) > 0.0001 ||
                    fillTransform.anchorMinY !== 0 ||
                    fillTransform.anchorMinX !== 0 ||
                    fillTransform.anchorMaxX !== 1;

                if (needsUpdate) {
                    // Y axis: stretch from bottom to progress
                    // Y 轴：从底部拉伸到进度位置
                    fillTransform.anchorMinY = 0;
                    fillTransform.anchorMaxY = targetAnchorMaxY;

                    // X axis: full stretch within parent (Fill Area)
                    // X 轴：在父容器（Fill Area）内完全拉伸
                    fillTransform.anchorMinX = 0;
                    fillTransform.anchorMaxX = 1;

                    fillTransform.width = 0;
                    fillTransform.height = 0;
                    fillTransform.layoutDirty = true;
                }
            }
        }
    }
}
