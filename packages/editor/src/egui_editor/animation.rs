//! @zh 动画系统模块
//! @en Animation system module
//!
//! 提供 UI 元素的平滑过渡动画。
//! Provides smooth transition animations for UI elements.

use eframe::egui;
use std::collections::HashMap;

/// @zh 动画状态管理器
/// @en Animation state manager
#[derive(Default)]
pub struct AnimationState {
    values: HashMap<egui::Id, AnimatedValue>,
}

struct AnimatedValue {
    current: f32,
    target: f32,
    start_time: f64,
    duration: f32,
}

impl AnimationState {
    /// @zh 创建新的动画状态管理器
    /// @en Create a new animation state manager
    pub fn new() -> Self {
        Self::default()
    }

    /// @zh 平滑动画一个值到目标
    /// @en Smoothly animate a value to a target
    ///
    /// @param ctx - egui 上下文
    /// @param id - 动画的唯一标识
    /// @param target - 目标值
    /// @param duration - 动画持续时间（秒）
    /// @returns 当前动画值
    pub fn animate(
        &mut self,
        ctx: &egui::Context,
        id: egui::Id,
        target: f32,
        duration: f32,
    ) -> f32 {
        let now = ctx.input(|i| i.time);

        if let Some(anim) = self.values.get_mut(&id) {
            // Target changed, restart animation from current value
            if (anim.target - target).abs() > 0.001 {
                anim.target = target;
                anim.start_time = now;
                anim.duration = duration;
            }

            let elapsed = (now - anim.start_time) as f32;
            let t = (elapsed / anim.duration).clamp(0.0, 1.0);
            let eased = ease_out_cubic(t);
            anim.current = lerp(anim.current, anim.target, eased);

            if t < 1.0 {
                ctx.request_repaint();
            }

            anim.current
        } else {
            self.values.insert(
                id,
                AnimatedValue {
                    current: target,
                    target,
                    start_time: now,
                    duration,
                },
            );
            target
        }
    }

    /// @zh 立即设置值（无动画）
    /// @en Set value immediately (no animation)
    pub fn set_immediate(&mut self, id: egui::Id, value: f32) {
        if let Some(anim) = self.values.get_mut(&id) {
            anim.current = value;
            anim.target = value;
        } else {
            self.values.insert(
                id,
                AnimatedValue {
                    current: value,
                    target: value,
                    start_time: 0.0,
                    duration: 0.0,
                },
            );
        }
    }

    /// @zh 获取当前值（不触发动画）
    /// @en Get current value (without triggering animation)
    pub fn get(&self, id: &egui::Id) -> Option<f32> {
        self.values.get(id).map(|v| v.current)
    }

    /// @zh 检查动画是否正在进行
    /// @en Check if animation is in progress
    pub fn is_animating(&self, ctx: &egui::Context, id: &egui::Id) -> bool {
        if let Some(anim) = self.values.get(id) {
            let now = ctx.input(|i| i.time);
            let elapsed = (now - anim.start_time) as f32;
            elapsed < anim.duration
        } else {
            false
        }
    }

    /// @zh 清除指定 ID 的动画状态
    /// @en Clear animation state for a specific ID
    pub fn clear(&mut self, id: &egui::Id) {
        self.values.remove(id);
    }

    /// @zh 清除所有动画状态
    /// @en Clear all animation states
    pub fn clear_all(&mut self) {
        self.values.clear();
    }
}

/// @zh 线性插值
/// @en Linear interpolation
#[inline]
pub fn lerp(a: f32, b: f32, t: f32) -> f32 {
    a + (b - a) * t
}

/// @zh 缓出三次方缓动函数
/// @en Ease-out cubic easing function
#[inline]
pub fn ease_out_cubic(t: f32) -> f32 {
    1.0 - (1.0 - t).powi(3)
}

/// @zh 缓入三次方缓动函数
/// @en Ease-in cubic easing function
#[inline]
pub fn ease_in_cubic(t: f32) -> f32 {
    t.powi(3)
}

/// @zh 缓入缓出三次方缓动函数
/// @en Ease-in-out cubic easing function
#[inline]
pub fn ease_in_out_cubic(t: f32) -> f32 {
    if t < 0.5 {
        4.0 * t.powi(3)
    } else {
        1.0 - (-2.0 * t + 2.0).powi(3) / 2.0
    }
}
