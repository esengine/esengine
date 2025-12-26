/**
 * Shiny effect animator for ES Engine.
 * ES引擎闪光效果动画器。
 *
 * This module provides shared animation logic for shiny effects that can be used
 * by both SpriteShinyEffectSystem and UIShinyEffectSystem.
 * 此模块提供可由 SpriteShinyEffectSystem 和 UIShinyEffectSystem 使用的
 * 共享闪光效果动画逻辑。
 *
 * @packageDocumentation
 */

import type { IShinyEffect } from './BaseShinyEffect';
import { getShinyRotationRadians } from './BaseShinyEffect';
import type { IMaterialOverridable } from '../interfaces/IMaterialOverridable';
import { BuiltInShaders } from '../types';

/**
 * Shared animator logic for shiny effect.
 * 闪光效果共享的动画逻辑。
 *
 * This class provides static methods for updating animation state and
 * applying material overrides, eliminating code duplication between
 * sprite and UI shiny effect systems.
 * 此类提供用于更新动画状态和应用材质覆盖的静态方法，
 * 消除精灵和 UI 闪光效果系统之间的代码重复。
 */
export class ShinyEffectAnimator {
    /**
     * Update animation state.
     * 更新动画状态。
     *
     * This method handles:
     * - Initial delay processing
     * - Delay phase countdown
     * - Progress calculation
     * - Loop handling
     *
     * 此方法处理：
     * - 初始延迟处理
     * - 延迟阶段倒计时
     * - 进度计算
     * - 循环处理
     *
     * @param shiny - The shiny effect component | 闪光效果组件
     * @param deltaTime - Time elapsed since last frame (seconds) | 上一帧以来经过的时间（秒）
     */
    static updateAnimation(shiny: IShinyEffect, deltaTime: number): void {
        // Handle initial delay
        // 处理初始延迟
        if (!shiny.initialDelayProcessed && shiny.initialDelay > 0) {
            shiny.delayRemaining = shiny.initialDelay;
            shiny.inDelay = true;
            shiny.initialDelayProcessed = true;
        }

        // Handle delay phase
        // 处理延迟阶段
        if (shiny.inDelay) {
            shiny.delayRemaining -= deltaTime;
            if (shiny.delayRemaining <= 0) {
                shiny.inDelay = false;
                shiny.elapsedTime = 0;
            }
            return;
        }

        // Update elapsed time
        // 更新已用时间
        shiny.elapsedTime += deltaTime;

        // Calculate progress (0 to 1)
        // 计算进度（0 到 1）
        shiny.progress = Math.min(shiny.elapsedTime / shiny.duration, 1.0);

        // Check if animation completed
        // 检查动画是否完成
        if (shiny.progress >= 1.0) {
            if (shiny.loop) {
                // Start loop delay
                // 开始循环延迟
                shiny.inDelay = true;
                shiny.delayRemaining = shiny.loopDelay;
                shiny.progress = 0;
                shiny.elapsedTime = 0;
            } else {
                // Stop animation
                // 停止动画
                shiny.play = false;
                shiny.progress = 1.0;
            }
        }
    }

    /**
     * Apply shiny effect material overrides to a renderable component.
     * 将闪光效果材质覆盖应用到可渲染组件。
     *
     * This method:
     * - Sets the Shiny shader if not already set
     * - Applies all uniform overrides for the shiny effect
     *
     * Note: aspectRatio is passed via vertex attribute from the rendering pipeline,
     * calculated from sprite's scaleX/scaleY in the Rust engine.
     *
     * 此方法：
     * - 如果尚未设置，则设置 Shiny 着色器
     * - 应用闪光效果的所有 uniform 覆盖
     *
     * 注意：宽高比通过渲染管线的顶点属性传递，在 Rust 引擎中从精灵的 scaleX/scaleY 计算。
     *
     * @param shiny - The shiny effect component | 闪光效果组件
     * @param target - The target component implementing IMaterialOverridable | 实现 IMaterialOverridable 的目标组件
     */
    static applyMaterialOverrides(shiny: IShinyEffect, target: IMaterialOverridable): void {
        // Ensure target uses Shiny shader
        // 确保目标使用 Shiny 着色器
        if (target.getMaterialId() === 0) {
            target.setMaterialId(BuiltInShaders.Shiny);
        }

        // Apply uniform overrides (aspectRatio is from vertex attribute v_aspectRatio)
        // 应用 uniform 覆盖（宽高比来自顶点属性 v_aspectRatio）
        target.setOverrideFloat('u_shinyProgress', shiny.progress);
        target.setOverrideFloat('u_shinyWidth', shiny.width);
        target.setOverrideFloat('u_shinyRotation', getShinyRotationRadians(shiny));
        target.setOverrideFloat('u_shinySoftness', shiny.softness);
        target.setOverrideFloat('u_shinyBrightness', shiny.brightness);
        target.setOverrideFloat('u_shinyGloss', shiny.gloss);
    }

    /**
     * Process a single entity with shiny effect.
     * 处理单个带有闪光效果的实体。
     *
     * This is a convenience method that combines updateAnimation and applyMaterialOverrides.
     * 这是一个结合了 updateAnimation 和 applyMaterialOverrides 的便捷方法。
     *
     * @param shiny - The shiny effect component | 闪光效果组件
     * @param target - The target component implementing IMaterialOverridable | 实现 IMaterialOverridable 的目标组件
     * @param deltaTime - Time elapsed since last frame (seconds) | 上一帧以来经过的时间（秒）
     * @returns True if the effect was processed, false if skipped | 如果效果已处理则返回 true，如果跳过则返回 false
     */
    static processEffect(shiny: IShinyEffect, target: IMaterialOverridable, deltaTime: number): boolean {
        if (!shiny.play) {
            return false;
        }

        this.updateAnimation(shiny, deltaTime);
        this.applyMaterialOverrides(shiny, target);
        return true;
    }
}
