#!/usr/bin/env node

import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { getPlatformChoices, getPlatforms, getAdapter } from './adapters/index.js';
import type { PlatformType, ProjectConfig } from './adapters/types.js';

const VERSION = '1.0.0';

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

/**
 * @zh 检测是否存在 *.laya 文件
 * @en Check if *.laya file exists
 */
function hasLayaProjectFile(cwd: string): boolean {
    try {
        const files = fs.readdirSync(cwd);
        return files.some(f => f.endsWith('.laya'));
    } catch {
        return false;
    }
}

/**
 * @zh 检测 Cocos Creator 版本
 * @en Detect Cocos Creator version
 */
function detectCocosVersion(cwd: string): 'cocos' | 'cocos2' | null {
    // Cocos 3.x: 检查 cc.config.json 或 extensions 目录
    if (fs.existsSync(path.join(cwd, 'cc.config.json')) ||
        fs.existsSync(path.join(cwd, 'extensions'))) {
        return 'cocos';
    }

    // 检查 project.json 中的版本号
    const projectJsonPath = path.join(cwd, 'project.json');
    if (fs.existsSync(projectJsonPath)) {
        try {
            const project = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));
            // Cocos 2.x project.json 有 engine-version 字段
            if (project['engine-version'] || project.engine) {
                const version = project['engine-version'] || project.engine || '';
                // 2.x 版本格式: "cocos-creator-js-2.4.x" 或 "2.4.x"
                if (version.includes('2.') || version.startsWith('2')) {
                    return 'cocos2';
                }
            }
            // 有 project.json 但没有版本信息，假设是 3.x
            return 'cocos';
        } catch {
            // 解析失败，假设是 3.x
            return 'cocos';
        }
    }

    return null;
}

/**
 * @zh 检测项目类型
 * @en Detect project type
 */
function detectProjectType(cwd: string): PlatformType | null {
    // Laya: 检查 *.laya 文件 或 .laya 目录 或 laya.json
    if (hasLayaProjectFile(cwd) ||
        fs.existsSync(path.join(cwd, '.laya')) ||
        fs.existsSync(path.join(cwd, 'laya.json'))) {
        return 'laya';
    }

    // Cocos Creator: 检查 assets 目录
    if (fs.existsSync(path.join(cwd, 'assets'))) {
        const cocosVersion = detectCocosVersion(cwd);
        if (cocosVersion) {
            return cocosVersion;
        }
    }

    // Node.js: 检查 package.json
    if (fs.existsSync(path.join(cwd, 'package.json'))) {
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

// Setup CLI
const program = new Command();

program
    .name('esengine')
    .description('CLI tool for adding ESEngine ECS to your project')
    .version(VERSION);

program
    .command('init')
    .description('Add ECS framework to your existing project')
    .option('-p, --platform <platform>', 'Target platform (cocos, cocos2, laya, nodejs)')
    .action(initCommand);

// Default command: run init
program
    .action(() => {
        initCommand({});
    });

program.parse();
