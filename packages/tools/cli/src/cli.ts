#!/usr/bin/env node

import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { getPlatformChoices, getPlatforms, getAdapter } from './adapters/index.js';
import type { PlatformType, ProjectConfig } from './adapters/types.js';
import { AVAILABLE_MODULES, getModuleById, getAllModuleIds, type ModuleInfo } from './modules.js';

const VERSION = '1.1.0';

/**
 * @zh 打印 Logo
 * @en Print logo
 */
function printLogo(): void {
    console.log();
    console.log(chalk.cyan('  ╭──────────────────────────────────────╮'));
    console.log(chalk.cyan('  │                                      │'));
    console.log(chalk.cyan('  │   ') + chalk.bold.white('ESEngine CLI') + chalk.gray(` v${VERSION}`) + chalk.cyan('               │'));
    console.log(chalk.cyan('  │                                      │'));
    console.log(chalk.cyan('  ╰──────────────────────────────────────╯'));
    console.log();
}

// =============================================================================
// 项目检测 | Project Detection
// =============================================================================

/**
 * @zh 检查文件或目录是否存在
 * @en Check if file or directory exists
 */
const exists = (cwd: string, ...paths: string[]): boolean =>
    paths.some(p => fs.existsSync(path.join(cwd, p)));

/**
 * @zh 安全读取 JSON 文件
 * @en Safely read JSON file
 */
function readJson<T = Record<string, unknown>>(filePath: string): T | null {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return null;
    }
}

/**
 * @zh 检查目录中是否有匹配后缀的文件
 * @en Check if directory contains files with matching extension
 */
function hasFileWithExt(cwd: string, ext: string): boolean {
    try {
        return fs.readdirSync(cwd).some(f => f.endsWith(ext));
    } catch {
        return false;
    }
}

/**
 * @zh 从 package.json 获取 Cocos Creator 版本
 * @en Get Cocos Creator version from package.json
 */
function getCocosVersionFromPackage(cwd: string): string | null {
    const pkg = readJson<{ creator?: { version?: string } }>(path.join(cwd, 'package.json'));
    return pkg?.creator?.version ?? null;
}

/**
 * @zh 从 project.json 获取 Cocos 2.x 版本
 * @en Get Cocos 2.x version from project.json
 */
function getCocos2VersionFromProject(cwd: string): string | null {
    const project = readJson<{ 'engine-version'?: string; engine?: string }>(
        path.join(cwd, 'project.json')
    );
    return project?.['engine-version'] ?? project?.engine ?? null;
}

/**
 * @zh 判断版本号属于哪个大版本
 * @en Determine major version from version string
 */
function getMajorVersion(version: string): number | null {
    const match = version.match(/^(\d+)\./);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * @zh 检测项目类型
 * @en Detect project type
 */
function detectProjectType(cwd: string): PlatformType | null {
    // Laya: *.laya 文件、.laya 目录、laya.json
    if (hasFileWithExt(cwd, '.laya') || exists(cwd, '.laya', 'laya.json')) {
        return 'laya';
    }

    // Cocos Creator: 检查 package.json 中的 creator.version
    const cocosVersion = getCocosVersionFromPackage(cwd);
    if (cocosVersion) {
        const major = getMajorVersion(cocosVersion);
        if (major === 2) return 'cocos2';
        if (major && major >= 3) return 'cocos';
    }

    // Cocos 3.x: .creator 目录、settings 目录、cc.config.json、extensions 目录
    if (exists(cwd, '.creator', 'settings', 'cc.config.json', 'extensions')) {
        return 'cocos';
    }

    // Cocos 2.x: project.json 中的 engine-version
    const cocos2Version = getCocos2VersionFromProject(cwd);
    if (cocos2Version) {
        if (cocos2Version.includes('2.') || cocos2Version.startsWith('2')) {
            return 'cocos2';
        }
        return 'cocos';
    }

    // Node.js: 有 package.json 但不是 Cocos
    if (exists(cwd, 'package.json')) {
        return 'nodejs';
    }

    return null;
}

/**
 * @zh 检测包管理器
 * @en Detect package manager
 */
function detectPackageManager(cwd: string): 'pnpm' | 'yarn' | 'npm' {
    if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
    return 'npm';
}

/**
 * @zh 读取或创建 package.json
 * @en Read or create package.json
 */
function readOrCreatePackageJson(packageJsonPath: string, projectName: string): Record<string, unknown> {
    try {
        return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            const pkg = {
                name: projectName,
                version: '1.0.0',
                private: true,
                dependencies: {}
            };
            fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf-8');
            console.log(chalk.green('  ✓ Created package.json'));
            return pkg;
        }
        throw err;
    }
}

/**
 * @zh 安装依赖
 * @en Install dependencies
 */
function installDependencies(cwd: string, deps: Record<string, string>): boolean {
    const pm = detectPackageManager(cwd);
    const packageJsonPath = path.join(cwd, 'package.json');

    // 读取或创建 package.json（原子操作，避免竞态条件）
    const pkg = readOrCreatePackageJson(packageJsonPath, path.basename(cwd));
    const pkgDeps = (pkg.dependencies || {}) as Record<string, string>;

    let needsInstall = false;
    for (const [name, version] of Object.entries(deps)) {
        if (!pkgDeps[name]) {
            pkgDeps[name] = version;
            needsInstall = true;
        }
    }

    if (!needsInstall) {
        console.log(chalk.gray('  Dependencies already configured.'));
        return true;
    }

    pkg.dependencies = pkgDeps;
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf-8');

    // 运行安装命令
    const installCmd = pm === 'pnpm' ? 'pnpm install' : pm === 'yarn' ? 'yarn' : 'npm install';
    console.log(chalk.gray(`  Running ${installCmd}...`));

    try {
        execSync(installCmd, { cwd, stdio: 'inherit' });
        return true;
    } catch {
        console.log(chalk.yellow(`  ⚠ Failed to run ${installCmd}. Please run it manually.`));
        return false;
    }
}

/**
 * @zh 获取项目名称
 * @en Get project name
 */
function getProjectName(cwd: string): string {
    const packageJsonPath = path.join(cwd, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            return pkg.name || path.basename(cwd);
        } catch {
            // ignore
        }
    }
    return path.basename(cwd);
}

/**
 * @zh 初始化 ECS 到现有项目
 * @en Initialize ECS into existing project
 */
async function initCommand(options: { platform?: string }): Promise<void> {
    printLogo();

    const cwd = process.cwd();
    let platform = options.platform as PlatformType | undefined;

    // 尝试自动检测项目类型
    const detected = detectProjectType(cwd);

    if (!platform) {
        if (detected) {
            console.log(chalk.gray(`  Detected: ${detected} project`));
            platform = detected;
        } else {
            // 交互式选择
            const response = await prompts({
                type: 'select',
                name: 'platform',
                message: 'Select platform:',
                choices: getPlatformChoices(),
                initial: 0
            }, {
                onCancel: () => {
                    console.log(chalk.yellow('\n  Cancelled.'));
                    process.exit(0);
                }
            });
            platform = response.platform;
        }
    }

    // 验证平台
    const validPlatforms = getPlatforms();
    if (!platform || !validPlatforms.includes(platform)) {
        console.log(chalk.red(`\n  ✗ Invalid platform. Choose from: ${validPlatforms.join(', ')}`));
        process.exit(1);
    }

    const projectName = getProjectName(cwd);
    const adapter = getAdapter(platform);

    const config: ProjectConfig = {
        name: projectName,
        platform,
        path: cwd
    };

    console.log();
    console.log(chalk.bold('Adding ECS to your project...'));

    // 生成文件
    const files = adapter.generateFiles(config);
    const createdFiles: string[] = [];

    for (const file of files) {
        const filePath = path.join(cwd, file.path);
        const dir = path.dirname(filePath);

        // 创建目录（recursive: true 不会因目录存在而失败）
        fs.mkdirSync(dir, { recursive: true });

        // 尝试写入文件（wx 模式：如果文件存在则失败，避免竞态条件）
        try {
            fs.writeFileSync(filePath, file.content, { encoding: 'utf-8', flag: 'wx' });
            createdFiles.push(file.path);
            console.log(chalk.green(`  ✓ Created ${file.path}`));
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
                console.log(chalk.yellow(`  ⚠ Skipped ${file.path} (already exists)`));
            } else {
                throw err;
            }
        }
    }

    if (createdFiles.length === 0) {
        console.log(chalk.yellow('\n  No files created. ECS may already be set up.'));
        return;
    }

    // 安装依赖
    console.log();
    console.log(chalk.bold('Installing dependencies...'));
    const deps = adapter.getDependencies();
    installDependencies(cwd, deps);

    // 打印下一步
    console.log();
    console.log(chalk.bold('Done!'));
    console.log();

    if (platform === 'cocos' || platform === 'cocos2') {
        console.log(chalk.gray('  Attach ECSManager to a node in your scene to start.'));
    } else if (platform === 'laya') {
        console.log(chalk.gray('  Attach ECSManager script to a node in Laya IDE to start.'));
    } else {
        console.log(chalk.gray('  Run `npm run dev` to start your game.'));
    }
    console.log();
}

// =========================================================================
// Module Management Commands
// =========================================================================

/**
 * @zh 列出可用模块
 * @en List available modules
 */
function listCommand(options: { category?: string }): void {
    printLogo();

    console.log(chalk.bold('  Available Modules:\n'));

    const categories = ['core', 'ai', 'utility', 'physics', 'rendering', 'network'] as const;
    const categoryNames: Record<string, string> = {
        core: '核心 | Core',
        ai: 'AI',
        utility: '工具 | Utility',
        physics: '物理 | Physics',
        rendering: '渲染 | Rendering',
        network: '网络 | Network'
    };

    for (const category of categories) {
        const modules = AVAILABLE_MODULES.filter(m => m.category === category);
        if (modules.length === 0) continue;
        if (options.category && options.category !== category) continue;

        console.log(chalk.cyan(`  ─── ${categoryNames[category]} ───`));
        for (const mod of modules) {
            console.log(`    ${chalk.green(mod.id.padEnd(15))} ${chalk.gray(mod.package)}`);
            console.log(`    ${' '.repeat(15)} ${chalk.dim(mod.description)}`);
        }
        console.log();
    }

    console.log(chalk.gray('  Use `esengine add <module>` to add a module to your project.'));
    console.log();
}

/**
 * @zh 添加模块到项目
 * @en Add module to project
 */
async function addCommand(moduleIds: string[], options: { yes?: boolean }): Promise<void> {
    printLogo();

    const cwd = process.cwd();
    const packageJsonPath = path.join(cwd, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        console.log(chalk.red('  ✗ No package.json found. Run `npm init` first.'));
        process.exit(1);
    }

    // Validate modules
    const validModules: ModuleInfo[] = [];
    const invalidIds: string[] = [];

    for (const id of moduleIds) {
        const mod = getModuleById(id);
        if (mod) {
            validModules.push(mod);
        } else {
            invalidIds.push(id);
        }
    }

    if (invalidIds.length > 0) {
        console.log(chalk.red(`  ✗ Unknown module(s): ${invalidIds.join(', ')}`));
        console.log(chalk.gray(`    Available: ${getAllModuleIds().join(', ')}`));
        process.exit(1);
    }

    if (validModules.length === 0) {
        // Interactive selection
        const response = await prompts({
            type: 'multiselect',
            name: 'modules',
            message: 'Select modules to add:',
            choices: AVAILABLE_MODULES.map(m => ({
                title: `${m.id} - ${m.description}`,
                value: m.id,
                selected: false
            })),
            min: 1
        }, {
            onCancel: () => {
                console.log(chalk.yellow('\n  Cancelled.'));
                process.exit(0);
            }
        });

        for (const id of response.modules) {
            const mod = getModuleById(id);
            if (mod) validModules.push(mod);
        }
    }

    if (validModules.length === 0) {
        console.log(chalk.yellow('  No modules selected.'));
        return;
    }

    console.log(chalk.bold('\n  Adding modules:\n'));
    for (const mod of validModules) {
        console.log(`    ${chalk.green('+')} ${mod.package}`);
    }

    // Confirm
    if (!options.yes) {
        const confirm = await prompts({
            type: 'confirm',
            name: 'proceed',
            message: 'Proceed with installation?',
            initial: true
        });

        if (!confirm.proceed) {
            console.log(chalk.yellow('\n  Cancelled.'));
            return;
        }
    }

    // Install
    console.log();
    const deps: Record<string, string> = {};
    for (const mod of validModules) {
        deps[mod.package] = mod.version;
    }

    const success = installDependencies(cwd, deps);

    if (success) {
        console.log(chalk.bold('\n  Done!'));
        console.log(chalk.gray('\n  Import modules in your code:'));
        for (const mod of validModules) {
            console.log(chalk.cyan(`    import { ... } from '${mod.package}';`));
        }
    }
    console.log();
}

/**
 * @zh 从项目移除模块
 * @en Remove module from project
 */
async function removeCommand(moduleIds: string[], options: { yes?: boolean }): Promise<void> {
    printLogo();

    const cwd = process.cwd();
    const packageJsonPath = path.join(cwd, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        console.log(chalk.red('  ✗ No package.json found.'));
        process.exit(1);
    }

    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deps = pkg.dependencies || {};

    // Find installed modules
    const installed = AVAILABLE_MODULES.filter(m => deps[m.package]);

    if (installed.length === 0) {
        console.log(chalk.yellow('  No ESEngine modules installed.'));
        return;
    }

    // Validate modules to remove
    let toRemove: ModuleInfo[] = [];

    if (moduleIds.length === 0) {
        // Interactive selection
        const response = await prompts({
            type: 'multiselect',
            name: 'modules',
            message: 'Select modules to remove:',
            choices: installed.map(m => ({
                title: `${m.id} - ${m.package}`,
                value: m.id
            })),
            min: 1
        }, {
            onCancel: () => {
                console.log(chalk.yellow('\n  Cancelled.'));
                process.exit(0);
            }
        });

        for (const id of response.modules) {
            const mod = getModuleById(id);
            if (mod) toRemove.push(mod);
        }
    } else {
        for (const id of moduleIds) {
            const mod = getModuleById(id);
            if (mod && deps[mod.package]) {
                toRemove.push(mod);
            } else if (!mod) {
                console.log(chalk.yellow(`  ⚠ Unknown module: ${id}`));
            } else {
                console.log(chalk.yellow(`  ⚠ Module not installed: ${id}`));
            }
        }
    }

    if (toRemove.length === 0) {
        console.log(chalk.yellow('  No modules to remove.'));
        return;
    }

    console.log(chalk.bold('\n  Removing modules:\n'));
    for (const mod of toRemove) {
        console.log(`    ${chalk.red('-')} ${mod.package}`);
    }

    // Confirm
    if (!options.yes) {
        const confirm = await prompts({
            type: 'confirm',
            name: 'proceed',
            message: 'Proceed with removal?',
            initial: true
        });

        if (!confirm.proceed) {
            console.log(chalk.yellow('\n  Cancelled.'));
            return;
        }
    }

    // Remove from package.json
    for (const mod of toRemove) {
        delete deps[mod.package];
    }
    pkg.dependencies = deps;
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf-8');

    // Run uninstall
    const pm = detectPackageManager(cwd);
    const packages = toRemove.map(m => m.package).join(' ');
    const uninstallCmd = pm === 'pnpm'
        ? `pnpm remove ${packages}`
        : pm === 'yarn'
            ? `yarn remove ${packages}`
            : `npm uninstall ${packages}`;

    console.log(chalk.gray(`\n  Running ${uninstallCmd}...`));

    try {
        execSync(uninstallCmd, { cwd, stdio: 'inherit' });
        console.log(chalk.bold('\n  Done!'));
    } catch {
        console.log(chalk.yellow(`\n  ⚠ Failed to run uninstall. Modules removed from package.json.`));
    }
    console.log();
}

// =========================================================================
// CLI Setup
// =========================================================================

// Setup CLI
const program = new Command();

program
    .name('esengine')
    .description('CLI tool for ESEngine ECS framework')
    .version(VERSION);

program
    .command('init')
    .description('Add ECS framework to your existing project')
    .option('-p, --platform <platform>', 'Target platform (cocos, cocos2, laya, nodejs)')
    .action(initCommand);

program
    .command('list')
    .alias('ls')
    .description('List available modules')
    .option('-c, --category <category>', 'Filter by category (core, ai, utility, physics, rendering, network)')
    .action(listCommand);

program
    .command('add [modules...]')
    .description('Add modules to your project')
    .option('-y, --yes', 'Skip confirmation')
    .action(addCommand);

program
    .command('remove [modules...]')
    .alias('rm')
    .description('Remove modules from your project')
    .option('-y, --yes', 'Skip confirmation')
    .action(removeCommand);

// Default command: show help
program
    .action(() => {
        program.help();
    });

program.parse();
