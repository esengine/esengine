/**
 * @zh ASCII Logo 和欢迎界面
 * @en ASCII Logo and welcome screen
 */

import pc from 'picocolors';
import boxen from 'boxen';

/**
 * @zh 完整 ASCII Logo
 * @en Full ASCII Logo
 */
const FULL_LOGO = `
███████╗███████╗███████╗███╗   ██╗ ██████╗ ██╗███╗   ██╗███████╗
██╔════╝██╔════╝██╔════╝████╗  ██║██╔════╝ ██║████╗  ██║██╔════╝
█████╗  ███████╗█████╗  ██╔██╗ ██║██║  ███╗██║██╔██╗ ██║█████╗
██╔══╝  ╚════██║██╔══╝  ██║╚██╗██║██║   ██║██║██║╚██╗██║██╔══╝
███████╗███████║███████╗██║ ╚████║╚██████╔╝██║██║ ╚████║███████╗
╚══════╝╚══════╝╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝
`.trim();

/**
 * @zh 紧凑 Logo
 * @en Compact Logo
 */
const COMPACT_LOGO = `
╔═══════════════════════════════════════╗
║         ⚡ ESEngine CLI               ║
║    Cross-Platform ECS Framework       ║
╚═══════════════════════════════════════╝
`.trim();

/**
 * @zh 打印完整 Logo
 * @en Print full logo
 */
export function printFullLogo(version: string): void {
    console.log();
    console.log(pc.cyan(FULL_LOGO));
    console.log(pc.dim(`                                    v${version}`));
    console.log();
}

/**
 * @zh 打印紧凑 Logo
 * @en Print compact logo
 */
export function printCompactLogo(version: string): void {
    const logo = `
  ╭──────────────────────────────────────╮
  │                                      │
  │       ${pc.bold(pc.cyan('ESEngine CLI'))} ${pc.dim(`v${version}`)}          │
  │    ${pc.dim('Cross-Platform ECS Framework')}     │
  │                                      │
  ╰──────────────────────────────────────╯
`.trimEnd();
    console.log(pc.cyan(logo));
}

/**
 * @zh 打印欢迎框
 * @en Print welcome box
 */
export function printWelcome(version: string): void {
    const content = `${pc.bold(pc.cyan('ESEngine CLI'))} ${pc.dim(`v${version}`)}

${pc.dim('Cross-Platform ECS Game Framework')}
${pc.dim('https://esengine.dev')}

${pc.dim('Commands:')}
  ${pc.cyan('init')}     Initialize ECS in your project
  ${pc.cyan('list')}     Browse available modules
  ${pc.cyan('add')}      Add modules to your project
  ${pc.cyan('info')}     View module details
  ${pc.cyan('search')}   Search modules`;

    console.log(boxen(content, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
    }));
}

/**
 * @zh 打印简洁头部
 * @en Print simple header
 */
export function printHeader(version: string): void {
    console.log();
    console.log(`  ${pc.bold(pc.cyan('ESEngine CLI'))} ${pc.dim(`v${version}`)}`);
    console.log();
}
