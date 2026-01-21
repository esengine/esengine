/**
 * @zh 颜色主题和样式工具
 * @en Color theme and styling utilities
 */

import pc from 'picocolors';

/**
 * @zh 分类颜色映射
 * @en Category color mapping
 */
export const categoryColors: Record<string, (text: string) => string> = {
    core: pc.cyan,
    ai: pc.yellow,
    utility: pc.green,
    physics: pc.red,
    rendering: pc.magenta,
    network: pc.blue
};

/**
 * @zh 获取分类颜色
 * @en Get category color
 */
export function getCategoryColor(category: string): (text: string) => string {
    return categoryColors[category.toLowerCase()] || pc.white;
}

/**
 * @zh 主题样式
 * @en Theme styles
 */
export const theme = {
    // Status icons
    success: pc.green('✓'),
    error: pc.red('✗'),
    warning: pc.yellow('!'),
    info: pc.cyan('ℹ'),
    star: pc.yellow('★'),
    bullet: pc.dim('•'),
    arrow: pc.cyan('→'),

    // Text styles
    title: (text: string) => pc.bold(pc.cyan(text)),
    subtitle: (text: string) => pc.dim(text),
    highlight: (text: string) => pc.bold(text),
    muted: (text: string) => pc.dim(text),
    link: (text: string) => pc.underline(pc.cyan(text)),

    // Status colors
    ok: pc.green,
    warn: pc.yellow,
    fail: pc.red,
    dim: pc.dim
};

/**
 * @zh 分类标签
 * @en Category label
 */
export function categoryLabel(category: string): string {
    const color = getCategoryColor(category);
    return color(category.toUpperCase());
}

/**
 * @zh 格式化分类标题
 * @en Format category header
 */
export function categoryHeader(category: string, count: number): string {
    const color = getCategoryColor(category);
    const label = category.charAt(0).toUpperCase() + category.slice(1);
    return color(pc.bold(`━━━ ${label} (${count}) ━━━`));
}
