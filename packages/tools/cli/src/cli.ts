#!/usr/bin/env node

/**
 * @zh ESEngine CLI - 跨平台 ECS 游戏框架命令行工具
 * @en ESEngine CLI - Cross-Platform ECS Game Framework CLI Tool
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import ora from 'ora';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { getPlatformChoices, getPlatforms, getAdapter } from './adapters/index.js';
import type { PlatformType, ProjectConfig } from './adapters/types.js';
import {
    AVAILABLE_MODULES,
    getModuleById,
    getAllModuleIds,
    getModulesByCategory,
    type ModuleInfo
} from './modules.js';
import {
    printCompactLogo,
    printHeader,
    theme,
    renderCategorizedTable,
    renderModuleTable,
    renderModuleDetails,
    renderModuleList,
    getCategoryColor,
    categoryHeader
} from './ui/index.js';

const VERSION = '2.0.0';

// =============================================================================
// Presets Definition
// =============================================================================

interface PresetDefinition {
    id: string;
    name: string;
    description: string;
    modules: string[];
}

const PRESETS: PresetDefinition[] = [
    {
        id: 'minimal',
        name: 'Minimal',
        description: '最小化 - 仅核心 ECS | Minimal - Core ECS only',
        modules: ['core', 'math']
    },
    {
        id: 'starter',
        name: 'Starter',
        description: '入门套件 - 核心 + 常用工具 | Starter - Core + utilities',
        modules: ['core', 'math', 'timer', 'fsm']
    },
    {
        id: 'ai-game',
        name: 'AI Game',
        description: 'AI 游戏开发 | AI game development',
        modules: ['core', 'math', 'timer', 'fsm', 'behavior-tree', 'pathfinding']
    },
    {
        id: 'network-game',
        name: 'Network Game',
        description: '网络游戏 | Network multiplayer game',
        modules: ['core', 'math', 'network-protocols', 'network']
    },
    {
        id: 'full',
        name: 'Full',
        description: '全部模块 | All modules',
        modules: getAllModuleIds()
    }
];

// =============================================================================
// Utility Functions
// =============================================================================

const exists = (cwd: string, ...paths: string[]): boolean =>
    paths.some(p => fs.existsSync(path.join(cwd, p)));

function readJson<T = Record<string, unknown>>(filePath: string): T | null {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return null;
    }
}

function hasFileWithExt(cwd: string, ext: string): boolean {
    try {
        return fs.readdirSync(cwd).some(f => f.endsWith(ext));
    } catch {
        return false;
    }
}

function getCocosVersionFromPackage(cwd: string): string | null {
    const pkg = readJson<{ creator?: { version?: string } }>(path.join(cwd, 'package.json'));
    return pkg?.creator?.version ?? null;
}

function getCocos2VersionFromProject(cwd: string): string | null {
    const project = readJson<{ 'engine-version'?: string; engine?: string }>(
        path.join(cwd, 'project.json')
    );
    return project?.['engine-version'] ?? project?.engine ?? null;
}

function getMajorVersion(version: string): number | null {
    const match = version.match(/^(\d+)\./);
    return match ? parseInt(match[1], 10) : null;
}

function detectPackageManager(cwd: string): 'pnpm' | 'yarn' | 'npm' {
    if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
    return 'npm';
}

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
            console.log(pc.green('  ✓ Created package.json'));
            return pkg;
        }
        throw err;
    }
}

function installDependencies(cwd: string, deps: Record<string, string>): boolean {
    const pm = detectPackageManager(cwd);
    const packageJsonPath = path.join(cwd, 'package.json');

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
        console.log(pc.dim('  Dependencies already configured.'));
        return true;
    }

    pkg.dependencies = pkgDeps;
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf-8');

    const installCmd = pm === 'pnpm' ? 'pnpm install' : pm === 'yarn' ? 'yarn' : 'npm install';

    const spinner = ora(`Running ${installCmd}...`).start();

    try {
        execSync(installCmd, { cwd, stdio: 'pipe' });
        spinner.succeed('Dependencies installed');
        return true;
    } catch {
        spinner.fail(`Failed to run ${installCmd}. Please run it manually.`);
        return false;
    }
}

function installDependenciesWithConfig(
    cwd: string,
    deps: Record<string, string>,
    devDeps: Record<string, string>,
    scripts: Record<string, string>,
    isEsm: boolean
): boolean {
    const pm = detectPackageManager(cwd);
    const packageJsonPath = path.join(cwd, 'package.json');

    const pkg = readOrCreatePackageJson(packageJsonPath, path.basename(cwd));
    const pkgDeps = (pkg.dependencies || {}) as Record<string, string>;
    const pkgDevDeps = (pkg.devDependencies || {}) as Record<string, string>;
    const pkgScripts = (pkg.scripts || {}) as Record<string, string>;

    let needsInstall = false;

    for (const [name, version] of Object.entries(deps)) {
        if (!pkgDeps[name]) {
            pkgDeps[name] = version;
            needsInstall = true;
        }
    }

    for (const [name, version] of Object.entries(devDeps)) {
        if (!pkgDevDeps[name]) {
            pkgDevDeps[name] = version;
            needsInstall = true;
        }
    }

    for (const [name, script] of Object.entries(scripts)) {
        if (!pkgScripts[name]) {
            pkgScripts[name] = script;
        }
    }

    if (isEsm && pkg.type !== 'module') {
        pkg.type = 'module';
    }

    if (!needsInstall && Object.keys(scripts).length === 0) {
        console.log(pc.dim('  Dependencies already configured.'));
        return true;
    }

    pkg.dependencies = pkgDeps;
    if (Object.keys(pkgDevDeps).length > 0) {
        pkg.devDependencies = pkgDevDeps;
    }
    if (Object.keys(pkgScripts).length > 0) {
        pkg.scripts = pkgScripts;
    }
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf-8');

    if (!needsInstall) {
        console.log(pc.dim('  Dependencies already configured.'));
        return true;
    }

    const installCmd = pm === 'pnpm' ? 'pnpm install' : pm === 'yarn' ? 'yarn' : 'npm install';

    const spinner = ora(`Running ${installCmd}...`).start();

    try {
        execSync(installCmd, { cwd, stdio: 'pipe' });
        spinner.succeed('Dependencies installed');
        return true;
    } catch {
        spinner.fail(`Failed to run ${installCmd}. Please run it manually.`);
        return false;
    }
}

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

function getLatestVersion(packageName: string): string | null {
    try {
        const result = execSync(`npm view ${packageName} version`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        }).trim();
        return result || null;
    } catch {
        return null;
    }
}

function isNewerVersion(current: string, latest: string): boolean {
    const cleanCurrent = current.replace(/^\^|~/, '');
    if (cleanCurrent === 'latest' || cleanCurrent === '*') {
        return true;
    }

    const currentParts = cleanCurrent.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
        const c = currentParts[i] || 0;
        const l = latestParts[i] || 0;
        if (l > c) return true;
        if (l < c) return false;
    }
    return false;
}

// =============================================================================
// Commands
// =============================================================================

async function initCommand(options: { platform?: string }): Promise<void> {
    printCompactLogo(VERSION);

    const cwd = process.cwd();
    let platform = options.platform as PlatformType | undefined;

    // 如果没有指定平台，让用户选择
    if (!platform) {
        const result = await p.select({
            message: 'Select target platform:',
            options: getPlatformChoices().map(c => ({
                value: c.value,
                label: `${c.title}`,
                hint: c.description
            }))
        });

        if (p.isCancel(result)) {
            p.cancel('Cancelled');
            process.exit(0);
        }
        platform = result as PlatformType;
    }

    const validPlatforms = getPlatforms();
    if (!platform || !validPlatforms.includes(platform)) {
        console.log(pc.red(`\n  ${theme.error} Invalid platform. Choose from: ${validPlatforms.join(', ')}`));
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
    console.log(pc.bold('Adding ECS to your project...'));

    const files = adapter.generateFiles(config);
    const createdFiles: string[] = [];

    for (const file of files) {
        const filePath = path.join(cwd, file.path);
        const dir = path.dirname(filePath);

        fs.mkdirSync(dir, { recursive: true });

        try {
            fs.writeFileSync(filePath, file.content, { encoding: 'utf-8', flag: 'wx' });
            createdFiles.push(file.path);
            console.log(pc.green(`  ${theme.success} Created ${file.path}`));
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
                console.log(pc.yellow(`  ${theme.warning} Skipped ${file.path} (already exists)`));
            } else {
                throw err;
            }
        }
    }

    if (createdFiles.length === 0) {
        console.log(pc.yellow('\n  No files created. ECS may already be set up.'));
        return;
    }

    console.log();
    console.log(pc.bold('Installing dependencies...'));
    const deps = adapter.getDependencies();
    const devDeps = adapter.getDevDependencies?.() ?? {};
    const scripts = adapter.getScripts?.() ?? {};
    installDependenciesWithConfig(cwd, deps, devDeps, scripts, platform === 'nodejs');

    console.log();
    p.outro(pc.green('Done! ECS framework added to your project.'));

    if (platform === 'cocos' || platform === 'cocos2') {
        console.log(pc.dim('  Attach ECSManager to a node in your scene to start.'));
    } else if (platform === 'laya') {
        console.log(pc.dim('  Attach ECSManager script to a node in Laya IDE to start.'));
    } else {
        console.log(pc.dim('  Run `npm run dev` to start your game.'));
    }
    console.log();
}

function listCommand(options: { category?: string; json?: boolean }): void {
    printHeader(VERSION);

    let modules = AVAILABLE_MODULES;

    if (options.category) {
        modules = getModulesByCategory(options.category as ModuleInfo['category']);
    }

    if (options.json) {
        console.log(JSON.stringify(modules, null, 2));
        return;
    }

    console.log(pc.bold(`  Found ${pc.cyan(String(modules.length))} modules\n`));

    if (options.category) {
        console.log(renderModuleTable(modules));
    } else {
        console.log(renderCategorizedTable(modules));
    }

    console.log(pc.dim('  Use `esengine info <module>` to view details'));
    console.log(pc.dim('  Use `esengine add <module>` to install\n'));
}

function infoCommand(moduleId: string): void {
    const mod = getModuleById(moduleId);

    if (!mod) {
        console.log(pc.red(`\n  ${theme.error} Module not found: ${moduleId}`));
        console.log(pc.dim(`\n  Available modules: ${getAllModuleIds().join(', ')}`));
        process.exit(1);
    }

    printHeader(VERSION);
    console.log(renderModuleDetails(mod));

    console.log(pc.dim('  Install with:'));
    console.log(pc.cyan(`    esengine add ${mod.id}\n`));
}

function searchCommand(query: string): void {
    printHeader(VERSION);

    const q = query.toLowerCase();
    const results = AVAILABLE_MODULES.filter(m =>
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.package.toLowerCase().includes(q)
    );

    if (results.length === 0) {
        console.log(pc.yellow(`  No modules found matching "${query}"\n`));
        return;
    }

    console.log(pc.bold(`  Found ${pc.cyan(String(results.length))} modules matching "${query}"\n`));
    console.log(renderModuleList(results));
    console.log();
}

async function addCommand(moduleIds: string[], options: { yes?: boolean; preset?: string }): Promise<void> {
    p.intro(pc.cyan(pc.bold('Add ESEngine Modules')));

    const cwd = process.cwd();
    const packageJsonPath = path.join(cwd, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        p.cancel('No package.json found. Run `npm init` first.');
        process.exit(1);
    }

    let selectedModules: ModuleInfo[] = [];

    // Handle preset
    if (options.preset) {
        const preset = PRESETS.find(p => p.id === options.preset);
        if (!preset) {
            p.cancel(`Unknown preset: ${options.preset}. Available: ${PRESETS.map(p => p.id).join(', ')}`);
            process.exit(1);
        }
        selectedModules = preset.modules.map(id => getModuleById(id)!).filter(Boolean);
        console.log(pc.dim(`  Using preset: ${preset.name}`));
    }
    // Handle direct module ids
    else if (moduleIds.length > 0) {
        const invalidIds: string[] = [];
        for (const id of moduleIds) {
            const mod = getModuleById(id);
            if (mod) {
                selectedModules.push(mod);
            } else {
                invalidIds.push(id);
            }
        }

        if (invalidIds.length > 0) {
            p.cancel(`Unknown module(s): ${invalidIds.join(', ')}\nAvailable: ${getAllModuleIds().join(', ')}`);
            process.exit(1);
        }
    }
    // Interactive selection
    else {
        const usePreset = await p.confirm({
            message: 'Use a preset package?',
            initialValue: true
        });

        if (p.isCancel(usePreset)) {
            p.cancel('Cancelled');
            process.exit(0);
        }

        if (usePreset) {
            const presetId = await p.select({
                message: 'Select a preset:',
                options: PRESETS.map(preset => ({
                    value: preset.id,
                    label: pc.bold(preset.name),
                    hint: pc.dim(preset.description)
                }))
            });

            if (p.isCancel(presetId)) {
                p.cancel('Cancelled');
                process.exit(0);
            }

            const preset = PRESETS.find(p => p.id === presetId)!;
            selectedModules = preset.modules.map(id => getModuleById(id)!).filter(Boolean);
        } else {
            // Group modules by category for selection
            const categories = ['core', 'ai', 'utility', 'network'] as const;

            const selectOptions = [];
            for (const category of categories) {
                const mods = getModulesByCategory(category);
                const categoryColor = getCategoryColor(category);

                for (const mod of mods) {
                    selectOptions.push({
                        value: mod.id,
                        label: categoryColor(`[${category.toUpperCase()}] `) + mod.id,
                        hint: pc.dim(mod.description.split('|')[0].trim())
                    });
                }
            }

            const selected = await p.multiselect({
                message: 'Select modules to install:',
                options: selectOptions,
                required: true
            });

            if (p.isCancel(selected)) {
                p.cancel('Cancelled');
                process.exit(0);
            }

            selectedModules = (selected as string[]).map(id => getModuleById(id)!).filter(Boolean);
        }
    }

    if (selectedModules.length === 0) {
        p.cancel('No modules selected');
        process.exit(0);
    }

    // Resolve dependencies
    const allModules = new Set<string>();
    const addWithDeps = (mod: ModuleInfo) => {
        allModules.add(mod.id);
        for (const depId of mod.dependencies || []) {
            const dep = getModuleById(depId);
            if (dep && !allModules.has(depId)) {
                addWithDeps(dep);
            }
        }
    };
    for (const mod of selectedModules) {
        addWithDeps(mod);
    }

    const finalModules = Array.from(allModules).map(id => getModuleById(id)!);

    // Show install plan
    console.log();
    console.log(pc.bold('  Install Plan:'));
    for (const mod of finalModules) {
        const isDep = !selectedModules.some(m => m.id === mod.id);
        const icon = isDep ? pc.dim('+') : pc.green('+');
        const suffix = isDep ? pc.dim(' (dependency)') : '';
        console.log(`    ${icon} ${mod.package}@latest${suffix}`);
    }
    console.log();

    // Confirm
    if (!options.yes) {
        const proceed = await p.confirm({
            message: `Install ${finalModules.length} package(s)?`,
            initialValue: true
        });

        if (p.isCancel(proceed) || !proceed) {
            p.cancel('Cancelled');
            process.exit(0);
        }
    }

    // Install
    const deps: Record<string, string> = {};
    for (const mod of finalModules) {
        deps[mod.package] = mod.version;
    }

    const success = installDependencies(cwd, deps);

    if (success) {
        p.outro(pc.green(`Successfully installed ${finalModules.length} packages`));

        console.log(pc.dim('\n  Import in your code:'));
        for (const mod of finalModules.slice(0, 3)) {
            console.log(pc.cyan(`    import { ... } from '${mod.package}';`));
        }
        if (finalModules.length > 3) {
            console.log(pc.dim(`    ... and ${finalModules.length - 3} more`));
        }
    }
    console.log();
}

async function removeCommand(moduleIds: string[], options: { yes?: boolean }): Promise<void> {
    p.intro(pc.cyan(pc.bold('Remove ESEngine Modules')));

    const cwd = process.cwd();
    const packageJsonPath = path.join(cwd, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        p.cancel('No package.json found.');
        process.exit(1);
    }

    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deps = pkg.dependencies || {};

    const installed = AVAILABLE_MODULES.filter(m => deps[m.package]);

    if (installed.length === 0) {
        p.cancel('No ESEngine modules installed.');
        process.exit(0);
    }

    let toRemove: ModuleInfo[] = [];

    if (moduleIds.length === 0) {
        const selected = await p.multiselect({
            message: 'Select modules to remove:',
            options: installed.map(m => ({
                value: m.id,
                label: m.id,
                hint: pc.dim(m.package)
            })),
            required: true
        });

        if (p.isCancel(selected)) {
            p.cancel('Cancelled');
            process.exit(0);
        }

        toRemove = (selected as string[]).map(id => getModuleById(id)!).filter(Boolean);
    } else {
        for (const id of moduleIds) {
            const mod = getModuleById(id);
            if (mod && deps[mod.package]) {
                toRemove.push(mod);
            } else if (!mod) {
                console.log(pc.yellow(`  ${theme.warning} Unknown module: ${id}`));
            } else {
                console.log(pc.yellow(`  ${theme.warning} Module not installed: ${id}`));
            }
        }
    }

    if (toRemove.length === 0) {
        p.cancel('No modules to remove.');
        process.exit(0);
    }

    console.log();
    console.log(pc.bold('  Remove:'));
    for (const mod of toRemove) {
        console.log(`    ${pc.red('-')} ${mod.package}`);
    }
    console.log();

    if (!options.yes) {
        const proceed = await p.confirm({
            message: `Remove ${toRemove.length} package(s)?`,
            initialValue: true
        });

        if (p.isCancel(proceed) || !proceed) {
            p.cancel('Cancelled');
            process.exit(0);
        }
    }

    for (const mod of toRemove) {
        delete deps[mod.package];
    }
    pkg.dependencies = deps;
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf-8');

    const pm = detectPackageManager(cwd);
    const packages = toRemove.map(m => m.package).join(' ');
    const uninstallCmd = pm === 'pnpm'
        ? `pnpm remove ${packages}`
        : pm === 'yarn'
            ? `yarn remove ${packages}`
            : `npm uninstall ${packages}`;

    const spinner = ora(`Running ${uninstallCmd}...`).start();

    try {
        execSync(uninstallCmd, { cwd, stdio: 'pipe' });
        spinner.succeed('Packages removed');
        p.outro(pc.green('Done!'));
    } catch {
        spinner.fail('Failed to run uninstall. Modules removed from package.json.');
    }
    console.log();
}

async function updateCommand(moduleIds: string[], options: { yes?: boolean; check?: boolean }): Promise<void> {
    p.intro(pc.cyan(pc.bold('Update ESEngine Packages')));

    const cwd = process.cwd();
    const packageJsonPath = path.join(cwd, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        p.cancel('No package.json found.');
        process.exit(1);
    }

    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deps = pkg.dependencies || {};

    const esenginePackages: { name: string; current: string; latest: string | null }[] = [];

    const spinner = ora('Checking for updates...').start();

    for (const [name, version] of Object.entries(deps)) {
        if (name.startsWith('@esengine/')) {
            if (moduleIds.length > 0) {
                const mod = AVAILABLE_MODULES.find(m => m.package === name);
                if (!mod || !moduleIds.includes(mod.id)) continue;
            }

            const latest = getLatestVersion(name);
            esenginePackages.push({
                name,
                current: version as string,
                latest
            });
        }
    }

    spinner.stop();

    if (esenginePackages.length === 0) {
        p.cancel('No ESEngine packages found in dependencies.');
        process.exit(0);
    }

    const updatable: typeof esenginePackages = [];

    console.log();
    console.log(pc.bold('  Package Status:'));
    for (const pkg of esenginePackages) {
        const currentClean = pkg.current.replace(/^\^|~/, '');

        if (pkg.latest === null) {
            console.log(`    ${pc.dim(pkg.name)}`);
            console.log(`      ${theme.error} Unable to fetch latest version`);
        } else if (isNewerVersion(pkg.current, pkg.latest)) {
            console.log(`    ${pc.cyan(pkg.name)}`);
            console.log(`      ${pc.yellow(currentClean)} ${theme.arrow} ${pc.green(pkg.latest)}`);
            updatable.push(pkg);
        } else {
            console.log(`    ${pc.dim(pkg.name)}`);
            console.log(`      ${theme.success} ${currentClean} (up to date)`);
        }
    }

    if (updatable.length === 0) {
        console.log();
        p.outro(pc.green('All packages are up to date!'));
        return;
    }

    if (options.check) {
        console.log();
        p.outro(`${updatable.length} package(s) can be updated. Run \`esengine update\` to update.`);
        return;
    }

    if (!options.yes) {
        console.log();
        const proceed = await p.confirm({
            message: `Update ${updatable.length} package(s)?`,
            initialValue: true
        });

        if (p.isCancel(proceed) || !proceed) {
            p.cancel('Cancelled');
            process.exit(0);
        }
    }

    const updateSpinner = ora('Updating packages...').start();

    const freshPkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    for (const upd of updatable) {
        const prefix = upd.current.startsWith('^') ? '^' : upd.current.startsWith('~') ? '~' : '';
        freshPkg.dependencies[upd.name] = `${prefix}${upd.latest}`;
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(freshPkg, null, 2), 'utf-8');

    const pm = detectPackageManager(cwd);
    const installCmd = pm === 'pnpm' ? 'pnpm install' : pm === 'yarn' ? 'yarn' : 'npm install';

    try {
        execSync(installCmd, { cwd, stdio: 'pipe' });
        updateSpinner.succeed('Packages updated');
        p.outro(pc.green('All packages updated successfully!'));
    } catch {
        updateSpinner.fail(`Failed to run install. package.json has been updated.`);
        console.log(pc.dim(`    Run \`${installCmd}\` manually.`));
    }
    console.log();
}

// =============================================================================
// CLI Setup
// =============================================================================

const program = new Command();

program
    .name('esengine')
    .description('CLI tool for ESEngine ECS framework')
    .version(VERSION);

program
    .command('init')
    .description('Add ECS framework to your existing project')
    .option('-p, --platform <platform>', 'Target platform (cocos, cocos2, laya, nodejs, web)')
    .action(initCommand);

program
    .command('list')
    .alias('ls')
    .description('List available modules')
    .option('-c, --category <category>', 'Filter by category (core, ai, utility, network)')
    .option('--json', 'Output as JSON')
    .action(listCommand);

program
    .command('info <module>')
    .description('View module details')
    .action(infoCommand);

program
    .command('search <query>')
    .description('Search modules')
    .action(searchCommand);

program
    .command('add [modules...]')
    .description('Add modules to your project')
    .option('-y, --yes', 'Skip confirmation')
    .option('-p, --preset <preset>', 'Use a preset (minimal, starter, ai-game, network-game, full)')
    .action(addCommand);

program
    .command('remove [modules...]')
    .alias('rm')
    .description('Remove modules from your project')
    .option('-y, --yes', 'Skip confirmation')
    .action(removeCommand);

program
    .command('update [modules...]')
    .alias('up')
    .description('Update ESEngine packages to latest versions')
    .option('-y, --yes', 'Skip confirmation')
    .option('-c, --check', 'Only check for updates, do not install')
    .action(updateCommand);

program
    .action(() => {
        printCompactLogo(VERSION);
        console.log(pc.dim('  Run `esengine --help` for available commands\n'));
    });

program.parse();
