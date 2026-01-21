/**
 * @zh 表格渲染工具
 * @en Table rendering utilities
 */

import Table from 'cli-table3';
import pc from 'picocolors';
import type { ModuleInfo } from '../modules.js';
import { getCategoryColor, categoryHeader, theme } from './colors.js';

/**
 * @zh 表格配置选项
 * @en Table configuration options
 */
export interface TableOptions {
    showInstalled?: boolean;
    showDependencies?: boolean;
    compact?: boolean;
}

/**
 * @zh 渲染模块列表表格
 * @en Render module list table
 */
export function renderModuleTable(modules: ModuleInfo[], options: TableOptions = {}): string {
    const { showInstalled = false, showDependencies = false, compact = false } = options;

    const headers = [
        pc.bold('Module'),
        pc.bold('Package'),
        pc.bold('Description')
    ];

    if (showDependencies) {
        headers.push(pc.bold('Deps'));
    }
    if (showInstalled) {
        headers.push(pc.bold('Status'));
    }

    const table = new Table({
        head: headers,
        style: {
            head: [],
            border: ['dim']
        },
        wordWrap: true,
        colWidths: compact
            ? [12, 24, 30]
            : [14, 28, 38, ...(showDependencies ? [6] : []), ...(showInstalled ? [10] : [])]
    });

    for (const mod of modules) {
        const categoryColor = getCategoryColor(mod.category);
        const row: string[] = [
            categoryColor(mod.id),
            pc.dim(mod.package),
            pc.dim(mod.description.split('|')[0].trim())
        ];

        if (showDependencies) {
            row.push(pc.dim(String(mod.dependencies?.length || 0)));
        }
        if (showInstalled) {
            row.push(theme.muted('-'));
        }

        table.push(row);
    }

    return table.toString();
}

/**
 * @zh 按分类分组渲染表格
 * @en Render categorized table
 */
export function renderCategorizedTable(
    modules: ModuleInfo[],
    options: TableOptions = {}
): string {
    const categories = ['core', 'ai', 'utility', 'network', 'physics', 'rendering'] as const;
    const groups = new Map<string, ModuleInfo[]>();

    // Group modules by category
    for (const mod of modules) {
        if (!groups.has(mod.category)) {
            groups.set(mod.category, []);
        }
        groups.get(mod.category)!.push(mod);
    }

    let output = '';

    for (const category of categories) {
        const mods = groups.get(category);
        if (!mods || mods.length === 0) continue;

        output += '\n' + categoryHeader(category, mods.length) + '\n';
        output += renderModuleTable(mods, { ...options, compact: true }) + '\n';
    }

    return output;
}

/**
 * @zh 渲染简洁模块列表
 * @en Render compact module list
 */
export function renderModuleList(modules: ModuleInfo[]): string {
    let output = '';

    for (const mod of modules) {
        const categoryColor = getCategoryColor(mod.category);
        output += `  ${categoryColor(mod.id.padEnd(16))} ${pc.dim(mod.description.split('|')[0].trim())}\n`;
    }

    return output;
}

/**
 * @zh 渲染模块详情
 * @en Render module details
 */
export function renderModuleDetails(mod: ModuleInfo): string {
    const categoryColor = getCategoryColor(mod.category);

    let output = `
${pc.bold(mod.name)} ${pc.dim(`(${mod.id})`)}
${categoryColor(`[${mod.category.toUpperCase()}]`)}

${mod.description}

${pc.dim('Package:')}  ${mod.package}
${pc.dim('Version:')}  ${mod.version}
`;

    if (mod.dependencies && mod.dependencies.length > 0) {
        output += `${pc.dim('Depends:')}  ${mod.dependencies.join(', ')}\n`;
    }

    return output;
}
