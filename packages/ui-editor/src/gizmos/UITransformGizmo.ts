import type { Entity } from '@esengine/ecs-framework';
import type { IGizmoRenderData, IRectGizmoData, GizmoColor } from '@esengine/editor-core';
import { GizmoRegistry } from '@esengine/editor-core';
import { UITransformComponent } from '@esengine/ui';

const UI_GIZMO_COLOR: GizmoColor = { r: 0.2, g: 0.6, b: 1, a: 0.8 };
const UI_GIZMO_COLOR_UNSELECTED: GizmoColor = { r: 0.2, g: 0.6, b: 1, a: 0.3 };

function uiTransformGizmoProvider(
    transform: UITransformComponent,
    _entity: Entity,
    isSelected: boolean
): IGizmoRenderData[] {
    if (!transform.visible) {
        return [];
    }

    // 使用 UILayoutSystem 计算的世界坐标
    // Use world coordinates computed by UILayoutSystem
    // 如果 layoutComputed = false，说明 UILayoutSystem 还没运行，回退到本地坐标
    // If layoutComputed = false, UILayoutSystem hasn't run yet, fallback to local coordinates
    const x = transform.layoutComputed ? transform.worldX : transform.x;
    const y = transform.layoutComputed ? transform.worldY : transform.y;
    const scaleX = transform.worldScaleX ?? transform.scaleX;
    const scaleY = transform.worldScaleY ?? transform.scaleY;
    const width = (transform.layoutComputed && transform.computedWidth > 0
        ? transform.computedWidth
        : transform.width) * scaleX;
    const height = (transform.layoutComputed && transform.computedHeight > 0
        ? transform.computedHeight
        : transform.height) * scaleY;
    // 角度转弧度 | Convert degrees to radians
    const rotationDegrees = transform.worldRotation ?? transform.rotation;
    const rotation = (rotationDegrees * Math.PI) / 180;
    // 使用 transform 的 pivot 作为旋转/缩放中心
    const pivotX = transform.pivotX;
    const pivotY = transform.pivotY;
    // 渲染位置 = 左下角 + pivot 偏移
    const renderX = x + width * pivotX;
    const renderY = y + height * pivotY;

    // Use pivot position with transform's pivot values as origin
    // 使用 transform 的 pivot 值作为 gizmo 的原点
    const gizmo: IRectGizmoData = {
        type: 'rect',
        x: renderX,
        y: renderY,
        width,
        height,
        rotation,
        originX: pivotX,
        originY: pivotY,
        color: isSelected ? UI_GIZMO_COLOR : UI_GIZMO_COLOR_UNSELECTED,
        showHandles: isSelected
    };

    return [gizmo];
}

export function registerUITransformGizmo(): void {
    GizmoRegistry.register(UITransformComponent, uiTransformGizmoProvider);
}

export function unregisterUITransformGizmo(): void {
    GizmoRegistry.unregister(UITransformComponent);
}
