//! @zh Lucide 风格图标绘制模块
//! @en Lucide-style icon drawing module
//!
//! 使用矢量绘制方式渲染 Lucide 图标，无需字体文件。
//! Renders Lucide icons using vector drawing, no font files needed.

use eframe::egui;
use std::f32::consts::PI;

/// @zh 图标绘制器
/// @en Icon painter
pub struct Icons;

impl Icons {
    /// @zh 绘制图标
    /// @en Draw an icon
    ///
    /// @param painter - egui 画笔
    /// @param center - 图标中心位置
    /// @param size - 图标大小
    /// @param name - 图标名称
    /// @param color - 图标颜色
    pub fn draw(
        painter: &egui::Painter,
        center: egui::Pos2,
        size: f32,
        name: &str,
        color: egui::Color32,
    ) {
        let s = size * 0.85;
        let stroke = egui::Stroke::new(1.5, color);

        match name {
            "chevron-down" => Self::chevron_down(painter, center, s, stroke),
            "chevron-right" => Self::chevron_right(painter, center, s, stroke),
            "chevron-up" => Self::chevron_up(painter, center, s, stroke),
            "x" => Self::x_icon(painter, center, s, stroke),
            "minus" => Self::minus(painter, center, s, stroke),
            "square" => Self::square(painter, center, s, stroke),
            "copy" => Self::copy(painter, center, s, stroke),
            "folder" => Self::folder(painter, center, s, stroke),
            "folder-open" => Self::folder_open(painter, center, s, stroke),
            "file" => Self::file(painter, center, s, stroke),
            "file-code" => Self::file_code(painter, center, s, stroke, color),
            "image" => Self::image(painter, center, s, stroke),
            "search" => Self::search(painter, center, s, stroke),
            "plus" => Self::plus(painter, center, s, stroke),
            "eye" => Self::eye(painter, center, s, stroke),
            "eye-off" => Self::eye_off(painter, center, s, stroke, color),
            "lock" => Self::lock(painter, center, s, stroke),
            "unlock" => Self::unlock(painter, center, s, stroke),
            "play" => Self::play(painter, center, s, color),
            "pause" => Self::pause(painter, center, s, color),
            "stop" => Self::stop(painter, center, s, color),
            "skip-forward" => Self::skip_forward(painter, center, s, color),
            "move" => Self::move_icon(painter, center, s, stroke),
            "rotate-cw" => Self::rotate_cw(painter, center, s, stroke),
            "rotate-ccw" => Self::rotate_ccw(painter, center, s, stroke),
            "maximize" => Self::maximize(painter, center, s, stroke),
            "maximize-2" => Self::maximize_2(painter, center, s, stroke),
            "box" | "cube" => Self::cube(painter, center, s, stroke),
            "camera" => Self::camera(painter, center, s, stroke),
            "sun" => Self::sun(painter, center, s, stroke),
            "terminal" => Self::terminal(painter, center, s, stroke),
            "settings" | "cog" => Self::settings(painter, center, s, stroke),
            "refresh-cw" => Self::refresh_cw(painter, center, s, stroke),
            "grid" => Self::grid(painter, center, s, stroke),
            "list" => Self::list(painter, center, s, color, stroke),
            "globe" => Self::globe(painter, center, s, stroke),
            "crosshair" => Self::crosshair(painter, center, s, stroke),
            "pivot" => Self::pivot(painter, center, s, color, stroke),
            "target" => Self::target(painter, center, s, color, stroke),
            "hash" => Self::hash(painter, center, s, stroke),
            "layout-grid" => Self::layout_grid(painter, center, s, stroke),
            "check" => Self::check(painter, center, s, stroke),
            "trash" => Self::trash(painter, center, s, stroke),
            "save" => Self::save(painter, center, s, stroke),
            "undo" => Self::undo(painter, center, s, stroke),
            "redo" => Self::redo(painter, center, s, stroke),
            "mouse-pointer" => Self::mouse_pointer(painter, center, s, stroke),
            _ => Self::fallback(painter, center, s, stroke),
        }
    }

    // Chevrons
    fn chevron_down(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.line_segment([c + egui::vec2(-s * 0.4, -s * 0.2), c + egui::vec2(0.0, s * 0.3)], stroke);
        p.line_segment([c + egui::vec2(0.0, s * 0.3), c + egui::vec2(s * 0.4, -s * 0.2)], stroke);
    }

    fn chevron_right(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.line_segment([c + egui::vec2(-s * 0.2, -s * 0.4), c + egui::vec2(s * 0.3, 0.0)], stroke);
        p.line_segment([c + egui::vec2(s * 0.3, 0.0), c + egui::vec2(-s * 0.2, s * 0.4)], stroke);
    }

    fn chevron_up(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.line_segment([c + egui::vec2(-s * 0.4, s * 0.2), c + egui::vec2(0.0, -s * 0.3)], stroke);
        p.line_segment([c + egui::vec2(0.0, -s * 0.3), c + egui::vec2(s * 0.4, s * 0.2)], stroke);
    }

    // Basic shapes
    fn x_icon(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.line_segment([c + egui::vec2(-s * 0.35, -s * 0.35), c + egui::vec2(s * 0.35, s * 0.35)], stroke);
        p.line_segment([c + egui::vec2(s * 0.35, -s * 0.35), c + egui::vec2(-s * 0.35, s * 0.35)], stroke);
    }

    fn minus(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.line_segment([c + egui::vec2(-s * 0.5, 0.0), c + egui::vec2(s * 0.5, 0.0)], stroke);
    }

    fn plus(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.line_segment([c + egui::vec2(-s * 0.4, 0.0), c + egui::vec2(s * 0.4, 0.0)], stroke);
        p.line_segment([c + egui::vec2(0.0, -s * 0.4), c + egui::vec2(0.0, s * 0.4)], stroke);
    }

    fn square(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let rect = egui::Rect::from_center_size(c, egui::vec2(s * 0.9, s * 0.9));
        p.rect_stroke(rect, 1.0, stroke);
    }

    fn check(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.line_segment([c + egui::vec2(-s * 0.35, 0.0), c + egui::vec2(-s * 0.1, s * 0.3)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.1, s * 0.3), c + egui::vec2(s * 0.35, -s * 0.25)], stroke);
    }

    // File system
    fn folder(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let points = vec![
            c + egui::vec2(-s * 0.5, -s * 0.2),
            c + egui::vec2(-s * 0.5, s * 0.4),
            c + egui::vec2(s * 0.5, s * 0.4),
            c + egui::vec2(s * 0.5, -s * 0.2),
            c + egui::vec2(s * 0.1, -s * 0.2),
            c + egui::vec2(-s * 0.1, -s * 0.45),
            c + egui::vec2(-s * 0.5, -s * 0.45),
            c + egui::vec2(-s * 0.5, -s * 0.2),
        ];
        p.add(egui::Shape::line(points, stroke));
    }

    fn folder_open(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let points = vec![
            c + egui::vec2(-s * 0.5, -s * 0.1),
            c + egui::vec2(-s * 0.5, s * 0.4),
            c + egui::vec2(s * 0.5, s * 0.4),
            c + egui::vec2(s * 0.6, -s * 0.1),
            c + egui::vec2(-s * 0.4, -s * 0.1),
        ];
        p.add(egui::Shape::line(points, stroke));
        p.line_segment([c + egui::vec2(-s * 0.5, -s * 0.1), c + egui::vec2(-s * 0.5, -s * 0.35)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.5, -s * 0.35), c + egui::vec2(-s * 0.15, -s * 0.35)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.15, -s * 0.35), c + egui::vec2(0.0, -s * 0.1)], stroke);
    }

    fn file(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let points = vec![
            c + egui::vec2(-s * 0.35, -s * 0.5),
            c + egui::vec2(-s * 0.35, s * 0.5),
            c + egui::vec2(s * 0.35, s * 0.5),
            c + egui::vec2(s * 0.35, -s * 0.2),
            c + egui::vec2(s * 0.05, -s * 0.5),
            c + egui::vec2(-s * 0.35, -s * 0.5),
        ];
        p.add(egui::Shape::line(points, stroke));
        p.line_segment([c + egui::vec2(s * 0.05, -s * 0.5), c + egui::vec2(s * 0.05, -s * 0.2)], stroke);
        p.line_segment([c + egui::vec2(s * 0.05, -s * 0.2), c + egui::vec2(s * 0.35, -s * 0.2)], stroke);
    }

    fn file_code(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke, _color: egui::Color32) {
        Self::file(p, c, s / 0.85, stroke);
        p.line_segment([c + egui::vec2(-s * 0.15, 0.0), c + egui::vec2(-s * 0.05, s * 0.15)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.05, s * 0.15), c + egui::vec2(-s * 0.15, s * 0.3)], stroke);
        p.line_segment([c + egui::vec2(s * 0.15, 0.0), c + egui::vec2(s * 0.05, s * 0.15)], stroke);
        p.line_segment([c + egui::vec2(s * 0.05, s * 0.15), c + egui::vec2(s * 0.15, s * 0.3)], stroke);
    }

    fn image(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let rect = egui::Rect::from_center_size(c, egui::vec2(s * 1.0, s * 0.8));
        p.rect_stroke(rect, 2.0, stroke);
        p.circle_stroke(c + egui::vec2(-s * 0.2, -s * 0.15), s * 0.12, stroke);
        let points = vec![
            c + egui::vec2(-s * 0.5, s * 0.25),
            c + egui::vec2(-s * 0.15, -s * 0.05),
            c + egui::vec2(s * 0.1, s * 0.15),
            c + egui::vec2(s * 0.5, -s * 0.1),
        ];
        p.add(egui::Shape::line(points, stroke));
    }

    fn copy(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let r1 = egui::Rect::from_min_size(c + egui::vec2(-s * 0.4, -s * 0.2), egui::vec2(s * 0.7, s * 0.7));
        let r2 = egui::Rect::from_min_size(c + egui::vec2(-s * 0.1, -s * 0.5), egui::vec2(s * 0.7, s * 0.7));
        p.rect_stroke(r1, 1.0, stroke);
        p.rect_stroke(r2, 1.0, stroke);
    }

    // Actions
    fn search(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.circle_stroke(c + egui::vec2(-s * 0.1, -s * 0.1), s * 0.35, stroke);
        p.line_segment([c + egui::vec2(s * 0.15, s * 0.15), c + egui::vec2(s * 0.45, s * 0.45)], stroke);
    }

    fn trash(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.line_segment([c + egui::vec2(-s * 0.4, -s * 0.3), c + egui::vec2(s * 0.4, -s * 0.3)], stroke);
        let points = vec![
            c + egui::vec2(-s * 0.3, -s * 0.3),
            c + egui::vec2(-s * 0.25, s * 0.45),
            c + egui::vec2(s * 0.25, s * 0.45),
            c + egui::vec2(s * 0.3, -s * 0.3),
        ];
        p.add(egui::Shape::line(points, stroke));
        p.line_segment([c + egui::vec2(-s * 0.1, -s * 0.3), c + egui::vec2(-s * 0.1, -s * 0.45)], stroke);
        p.line_segment([c + egui::vec2(s * 0.1, -s * 0.3), c + egui::vec2(s * 0.1, -s * 0.45)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.1, -s * 0.45), c + egui::vec2(s * 0.1, -s * 0.45)], stroke);
    }

    fn save(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let rect = egui::Rect::from_center_size(c, egui::vec2(s * 0.9, s * 0.9));
        p.rect_stroke(rect, 2.0, stroke);
        p.line_segment([c + egui::vec2(-s * 0.15, -s * 0.45), c + egui::vec2(-s * 0.15, -s * 0.15)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.15, -s * 0.15), c + egui::vec2(s * 0.15, -s * 0.15)], stroke);
        p.line_segment([c + egui::vec2(s * 0.15, -s * 0.15), c + egui::vec2(s * 0.15, -s * 0.45)], stroke);
        let inner = egui::Rect::from_min_max(c + egui::vec2(-s * 0.3, s * 0.05), c + egui::vec2(s * 0.3, s * 0.45));
        p.rect_stroke(inner, 1.0, stroke);
    }

    fn undo(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let arc: Vec<egui::Pos2> = (0..=8).map(|i| {
            let t = i as f32 / 8.0 * PI * 1.2 + PI * 0.4;
            c + egui::vec2(t.cos() * s * 0.35, t.sin() * s * 0.35)
        }).collect();
        p.add(egui::Shape::line(arc, stroke));
        p.line_segment([c + egui::vec2(-s * 0.45, -s * 0.1), c + egui::vec2(-s * 0.2, -s * 0.1)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.2, -s * 0.1), c + egui::vec2(-s * 0.2, s * 0.15)], stroke);
    }

    fn redo(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let arc: Vec<egui::Pos2> = (0..=8).map(|i| {
            let t = i as f32 / 8.0 * PI * 1.2 - PI * 0.6;
            c + egui::vec2(t.cos() * s * 0.35, t.sin() * s * 0.35)
        }).collect();
        p.add(egui::Shape::line(arc, stroke));
        p.line_segment([c + egui::vec2(s * 0.45, -s * 0.1), c + egui::vec2(s * 0.2, -s * 0.1)], stroke);
        p.line_segment([c + egui::vec2(s * 0.2, -s * 0.1), c + egui::vec2(s * 0.2, s * 0.15)], stroke);
    }

    // Visibility
    fn eye(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let points_top: Vec<egui::Pos2> = (0..=12).map(|i| {
            let t = i as f32 / 12.0 * PI;
            c + egui::vec2(t.cos() * s * 0.5, t.sin() * s * 0.25 - s * 0.05)
        }).collect();
        p.add(egui::Shape::line(points_top, stroke));

        let points_bot: Vec<egui::Pos2> = (0..=12).map(|i| {
            let t = i as f32 / 12.0 * PI + PI;
            c + egui::vec2(t.cos() * s * 0.5, t.sin() * s * 0.25 - s * 0.05)
        }).collect();
        p.add(egui::Shape::line(points_bot, stroke));
        p.circle_stroke(c + egui::vec2(0.0, -s * 0.05), s * 0.15, stroke);
    }

    fn eye_off(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke, _color: egui::Color32) {
        Self::eye(p, c, s / 0.85, stroke);
        p.line_segment([c + egui::vec2(-s * 0.5, s * 0.4), c + egui::vec2(s * 0.5, -s * 0.5)], stroke);
    }

    fn lock(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let rect = egui::Rect::from_min_size(c + egui::vec2(-s * 0.35, -s * 0.05), egui::vec2(s * 0.7, s * 0.55));
        p.rect_stroke(rect, 2.0, stroke);
        let arc: Vec<egui::Pos2> = (0..=8).map(|i| {
            let t = i as f32 / 8.0 * PI;
            c + egui::vec2(t.cos() * s * 0.22, -t.sin() * s * 0.3 - s * 0.05)
        }).collect();
        p.add(egui::Shape::line(arc, stroke));
    }

    fn unlock(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let rect = egui::Rect::from_min_size(c + egui::vec2(-s * 0.35, -s * 0.05), egui::vec2(s * 0.7, s * 0.55));
        p.rect_stroke(rect, 2.0, stroke);
        p.line_segment([c + egui::vec2(-s * 0.22, -s * 0.05), c + egui::vec2(-s * 0.22, -s * 0.35)], stroke);
        let arc: Vec<egui::Pos2> = (0..=4).map(|i| {
            let t = i as f32 / 4.0 * PI * 0.5 + PI * 0.5;
            c + egui::vec2(t.cos() * s * 0.22, -t.sin() * s * 0.3 - s * 0.35 + s * 0.3)
        }).collect();
        p.add(egui::Shape::line(arc, stroke));
    }

    // Media controls (filled)
    fn play(p: &egui::Painter, c: egui::Pos2, s: f32, color: egui::Color32) {
        let points = vec![
            c + egui::vec2(-s * 0.3, -s * 0.4),
            c + egui::vec2(s * 0.4, 0.0),
            c + egui::vec2(-s * 0.3, s * 0.4),
        ];
        p.add(egui::Shape::convex_polygon(points, color, egui::Stroke::NONE));
    }

    fn pause(p: &egui::Painter, c: egui::Pos2, s: f32, color: egui::Color32) {
        p.rect_filled(egui::Rect::from_min_size(c + egui::vec2(-s * 0.35, -s * 0.35), egui::vec2(s * 0.25, s * 0.7)), 1.0, color);
        p.rect_filled(egui::Rect::from_min_size(c + egui::vec2(s * 0.1, -s * 0.35), egui::vec2(s * 0.25, s * 0.7)), 1.0, color);
    }

    fn stop(p: &egui::Painter, c: egui::Pos2, s: f32, color: egui::Color32) {
        p.rect_filled(egui::Rect::from_center_size(c, egui::vec2(s * 0.7, s * 0.7)), 2.0, color);
    }

    fn skip_forward(p: &egui::Painter, c: egui::Pos2, s: f32, color: egui::Color32) {
        let points = vec![
            c + egui::vec2(-s * 0.4, -s * 0.35),
            c + egui::vec2(s * 0.1, 0.0),
            c + egui::vec2(-s * 0.4, s * 0.35),
        ];
        p.add(egui::Shape::convex_polygon(points, color, egui::Stroke::NONE));
        p.rect_filled(egui::Rect::from_min_size(c + egui::vec2(s * 0.2, -s * 0.35), egui::vec2(s * 0.15, s * 0.7)), 0.0, color);
    }

    // Transform tools
    fn move_icon(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.line_segment([c + egui::vec2(-s * 0.5, 0.0), c + egui::vec2(s * 0.5, 0.0)], stroke);
        p.line_segment([c + egui::vec2(0.0, -s * 0.5), c + egui::vec2(0.0, s * 0.5)], stroke);
        // Arrows
        for &(dx, dy) in &[(0.5, 0.0), (-0.5, 0.0), (0.0, -0.5), (0.0, 0.5)] {
            let end = c + egui::vec2(s * dx, s * dy);
            let perp = if dx.abs() > 0.01 { egui::vec2(0.0, s * 0.15) } else { egui::vec2(s * 0.15, 0.0) };
            let back = if dx.abs() > 0.01 { egui::vec2(-s * 0.15 * dx.signum(), 0.0) } else { egui::vec2(0.0, -s * 0.15 * dy.signum()) };
            p.line_segment([end + back + perp, end], stroke);
            p.line_segment([end + back - perp, end], stroke);
        }
    }

    fn rotate_cw(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let arc: Vec<egui::Pos2> = (0..=10).map(|i| {
            let t = i as f32 / 10.0 * PI * 1.5 - PI * 0.25;
            c + egui::vec2(t.cos() * s * 0.35, t.sin() * s * 0.35)
        }).collect();
        p.add(egui::Shape::line(arc, stroke));
        p.line_segment([c + egui::vec2(s * 0.35, -s * 0.15), c + egui::vec2(s * 0.35, s * 0.1)], stroke);
        p.line_segment([c + egui::vec2(s * 0.1, s * 0.1), c + egui::vec2(s * 0.35, s * 0.1)], stroke);
    }

    fn rotate_ccw(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let arc: Vec<egui::Pos2> = (0..=10).map(|i| {
            let t = i as f32 / 10.0 * PI * 1.5 + PI * 0.75;
            c + egui::vec2(t.cos() * s * 0.35, t.sin() * s * 0.35)
        }).collect();
        p.add(egui::Shape::line(arc, stroke));
        p.line_segment([c + egui::vec2(-s * 0.35, -s * 0.15), c + egui::vec2(-s * 0.35, s * 0.1)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.1, s * 0.1), c + egui::vec2(-s * 0.35, s * 0.1)], stroke);
    }

    fn maximize(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.line_segment([c + egui::vec2(-s * 0.4, -s * 0.4), c + egui::vec2(s * 0.4, s * 0.4)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.4, -s * 0.4), c + egui::vec2(-s * 0.4, -s * 0.1)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.4, -s * 0.4), c + egui::vec2(-s * 0.1, -s * 0.4)], stroke);
        p.line_segment([c + egui::vec2(s * 0.4, s * 0.4), c + egui::vec2(s * 0.4, s * 0.1)], stroke);
        p.line_segment([c + egui::vec2(s * 0.4, s * 0.4), c + egui::vec2(s * 0.1, s * 0.4)], stroke);
    }

    fn maximize_2(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.line_segment([c + egui::vec2(-s * 0.4, -s * 0.4), c + egui::vec2(-s * 0.1, -s * 0.4)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.4, -s * 0.4), c + egui::vec2(-s * 0.4, -s * 0.1)], stroke);
        p.line_segment([c + egui::vec2(s * 0.4, s * 0.4), c + egui::vec2(s * 0.1, s * 0.4)], stroke);
        p.line_segment([c + egui::vec2(s * 0.4, s * 0.4), c + egui::vec2(s * 0.4, s * 0.1)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.4, -s * 0.4), c + egui::vec2(s * 0.4, s * 0.4)], stroke);
    }

    fn mouse_pointer(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let points = vec![
            c + egui::vec2(-s * 0.3, -s * 0.45),
            c + egui::vec2(-s * 0.3, s * 0.35),
            c + egui::vec2(-s * 0.05, s * 0.1),
            c + egui::vec2(s * 0.25, s * 0.4),
            c + egui::vec2(s * 0.35, s * 0.25),
            c + egui::vec2(s * 0.05, -s * 0.05),
            c + egui::vec2(s * 0.3, -s * 0.3),
            c + egui::vec2(-s * 0.3, -s * 0.45),
        ];
        p.add(egui::Shape::line(points, stroke));
    }

    // Objects
    fn cube(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let rect = egui::Rect::from_center_size(c + egui::vec2(0.0, s * 0.1), egui::vec2(s * 0.7, s * 0.6));
        p.rect_stroke(rect, 0.0, stroke);
        p.line_segment([c + egui::vec2(-s * 0.35, -s * 0.2), c + egui::vec2(-s * 0.15, -s * 0.45)], stroke);
        p.line_segment([c + egui::vec2(s * 0.35, -s * 0.2), c + egui::vec2(s * 0.55, -s * 0.45)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.15, -s * 0.45), c + egui::vec2(s * 0.55, -s * 0.45)], stroke);
        p.line_segment([c + egui::vec2(s * 0.35, s * 0.4), c + egui::vec2(s * 0.55, s * 0.15)], stroke);
        p.line_segment([c + egui::vec2(s * 0.55, -s * 0.45), c + egui::vec2(s * 0.55, s * 0.15)], stroke);
    }

    fn camera(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let rect = egui::Rect::from_min_size(c + egui::vec2(-s * 0.45, -s * 0.25), egui::vec2(s * 0.7, s * 0.5));
        p.rect_stroke(rect, 2.0, stroke);
        p.line_segment([c + egui::vec2(s * 0.25, -s * 0.1), c + egui::vec2(s * 0.5, -s * 0.25)], stroke);
        p.line_segment([c + egui::vec2(s * 0.5, -s * 0.25), c + egui::vec2(s * 0.5, s * 0.25)], stroke);
        p.line_segment([c + egui::vec2(s * 0.5, s * 0.25), c + egui::vec2(s * 0.25, s * 0.1)], stroke);
    }

    fn sun(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.circle_stroke(c, s * 0.25, stroke);
        for i in 0..8 {
            let angle = i as f32 * PI / 4.0;
            let inner = s * 0.35;
            let outer = s * 0.5;
            p.line_segment([
                c + egui::vec2(angle.cos() * inner, angle.sin() * inner),
                c + egui::vec2(angle.cos() * outer, angle.sin() * outer),
            ], stroke);
        }
    }

    // UI elements
    fn terminal(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let rect = egui::Rect::from_center_size(c, egui::vec2(s * 1.0, s * 0.8));
        p.rect_stroke(rect, 2.0, stroke);
        p.line_segment([c + egui::vec2(-s * 0.3, -s * 0.1), c + egui::vec2(-s * 0.1, s * 0.1)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.1, s * 0.1), c + egui::vec2(-s * 0.3, s * 0.3)], stroke);
        p.line_segment([c + egui::vec2(0.0, s * 0.25), c + egui::vec2(s * 0.3, s * 0.25)], stroke);
    }

    fn settings(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.circle_stroke(c, s * 0.2, stroke);
        for i in 0..6 {
            let angle = i as f32 * PI / 3.0;
            let inner = s * 0.28;
            let outer = s * 0.45;
            p.line_segment([
                c + egui::vec2(angle.cos() * inner, angle.sin() * inner),
                c + egui::vec2(angle.cos() * outer, angle.sin() * outer),
            ], stroke);
        }
    }

    fn refresh_cw(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let arc1: Vec<egui::Pos2> = (0..=8).map(|i| {
            let t = i as f32 / 8.0 * PI * 1.2;
            c + egui::vec2(t.cos() * s * 0.35, t.sin() * s * 0.35)
        }).collect();
        p.add(egui::Shape::line(arc1, stroke));

        let arc2: Vec<egui::Pos2> = (0..=8).map(|i| {
            let t = i as f32 / 8.0 * PI * 1.2 + PI;
            c + egui::vec2(t.cos() * s * 0.35, t.sin() * s * 0.35)
        }).collect();
        p.add(egui::Shape::line(arc2, stroke));
    }

    fn grid(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.line_segment([c + egui::vec2(-s * 0.15, -s * 0.5), c + egui::vec2(-s * 0.15, s * 0.5)], stroke);
        p.line_segment([c + egui::vec2(s * 0.15, -s * 0.5), c + egui::vec2(s * 0.15, s * 0.5)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.5, -s * 0.15), c + egui::vec2(s * 0.5, -s * 0.15)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.5, s * 0.15), c + egui::vec2(s * 0.5, s * 0.15)], stroke);
    }

    fn list(p: &egui::Painter, c: egui::Pos2, s: f32, color: egui::Color32, stroke: egui::Stroke) {
        for i in 0..3 {
            let y = -s * 0.3 + i as f32 * s * 0.3;
            p.circle_filled(c + egui::vec2(-s * 0.35, y), s * 0.08, color);
            p.line_segment([c + egui::vec2(-s * 0.15, y), c + egui::vec2(s * 0.4, y)], stroke);
        }
    }

    fn globe(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.circle_stroke(c, s * 0.4, stroke);
        let arc: Vec<egui::Pos2> = (0..=12).map(|i| {
            let t = i as f32 / 12.0 * PI * 2.0;
            c + egui::vec2(t.sin() * s * 0.2, t.cos() * s * 0.4)
        }).collect();
        p.add(egui::Shape::line(arc, stroke));
        p.line_segment([c + egui::vec2(-s * 0.4, 0.0), c + egui::vec2(s * 0.4, 0.0)], stroke);
    }

    fn crosshair(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.circle_stroke(c, s * 0.35, stroke);
        p.line_segment([c + egui::vec2(-s * 0.5, 0.0), c + egui::vec2(-s * 0.2, 0.0)], stroke);
        p.line_segment([c + egui::vec2(s * 0.2, 0.0), c + egui::vec2(s * 0.5, 0.0)], stroke);
        p.line_segment([c + egui::vec2(0.0, -s * 0.5), c + egui::vec2(0.0, -s * 0.2)], stroke);
        p.line_segment([c + egui::vec2(0.0, s * 0.2), c + egui::vec2(0.0, s * 0.5)], stroke);
    }

    fn pivot(p: &egui::Painter, c: egui::Pos2, s: f32, color: egui::Color32, stroke: egui::Stroke) {
        p.circle_filled(c, s * 0.12, color);
        p.line_segment([c + egui::vec2(-s * 0.5, -s * 0.5), c + egui::vec2(-s * 0.2, -s * 0.2)], stroke);
        p.line_segment([c + egui::vec2(s * 0.5, -s * 0.5), c + egui::vec2(s * 0.2, -s * 0.2)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.5, s * 0.5), c + egui::vec2(-s * 0.2, s * 0.2)], stroke);
        p.line_segment([c + egui::vec2(s * 0.5, s * 0.5), c + egui::vec2(s * 0.2, s * 0.2)], stroke);
    }

    fn target(p: &egui::Painter, c: egui::Pos2, s: f32, color: egui::Color32, stroke: egui::Stroke) {
        p.circle_stroke(c, s * 0.4, stroke);
        p.circle_stroke(c, s * 0.2, stroke);
        p.circle_filled(c, s * 0.06, color);
    }

    fn hash(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.line_segment([c + egui::vec2(-s * 0.15, -s * 0.5), c + egui::vec2(-s * 0.25, s * 0.5)], stroke);
        p.line_segment([c + egui::vec2(s * 0.15, -s * 0.5), c + egui::vec2(s * 0.05, s * 0.5)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.4, -s * 0.15), c + egui::vec2(s * 0.4, -s * 0.15)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.4, s * 0.15), c + egui::vec2(s * 0.4, s * 0.15)], stroke);
    }

    fn layout_grid(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        let rect = egui::Rect::from_center_size(c, egui::vec2(s * 0.9, s * 0.9));
        p.rect_stroke(rect, 2.0, stroke);
        p.line_segment([c + egui::vec2(0.0, -s * 0.45), c + egui::vec2(0.0, s * 0.45)], stroke);
        p.line_segment([c + egui::vec2(-s * 0.45, 0.0), c + egui::vec2(s * 0.45, 0.0)], stroke);
    }

    fn fallback(p: &egui::Painter, c: egui::Pos2, s: f32, stroke: egui::Stroke) {
        p.rect_stroke(egui::Rect::from_center_size(c, egui::vec2(s * 0.6, s * 0.6)), 2.0, stroke);
    }
}
