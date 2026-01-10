#!/usr/bin/env node
/**
 * Copy CCESEngine Script
 * 复制 CCESEngine 脚本
 *
 * Copies the built ccesengine files to packages/editor/editor-app/public/ccesengine/
 *
 * Usage:
 *   node scripts/copy-ccesengine.mjs [--mode=editor|dev]
 *   pnpm run copy:ccesengine           # Uses editor mode (default)
 *   pnpm run copy:ccesengine:dev       # Uses dev mode
 *
 * Build modes:
 *   editor (default): engine/bin/editor/esm/ (built by: npm run build:editor)
 *   dev:              engine/bin/dev/cc/     (built by: npm run build:dev)
 *
 * Prerequisites:
 *   1. Initialize submodule: git submodule update --init engine
 *   2. Build ccesengine:
 *      - For editor mode: cd engine && npm run build:editor
 *      - For dev mode: cd engine && npm run build:dev
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const modeArg = args.find(arg => arg.startsWith('--mode='));
const mode = modeArg ? modeArg.split('=')[1] : 'editor';

// Source directories for different build modes
const sourceDirs = {
    editor: path.join(rootDir, 'engine', 'bin', 'editor', 'esm'),
    dev: path.join(rootDir, 'engine', 'bin', 'dev', 'cc'),
};

// Build commands for different modes
const buildCommands = {
    editor: 'npm run build:editor',
    dev: 'npm run build:dev',
};

if (!sourceDirs[mode]) {
    console.error(`\n❌ Error: Unknown mode "${mode}". Use "editor" or "dev".\n`);
    process.exit(1);
}

const sourceDir = sourceDirs[mode];
const buildCommand = buildCommands[mode];

// Destination: editor-app public folder
const destDir = path.join(rootDir, 'packages', 'editor', 'editor-app', 'public', 'ccesengine');

/**
 * Check if source directory exists and has files
 */
function checkSource() {
    if (!fs.existsSync(sourceDir)) {
        console.error('\n❌ Error: CCESEngine build output not found!');
        console.error(`   Expected: ${sourceDir}\n`);
        console.error('   Please run the following commands first:');
        console.error('   1. git submodule update --init engine');
        console.error(`   2. cd engine && npm install && ${buildCommand}\n`);
        process.exit(1);
    }

    const files = fs.readdirSync(sourceDir);
    if (files.length === 0) {
        console.error('\n❌ Error: CCESEngine build output is empty!');
        console.error(`   Please run: cd engine && ${buildCommand}\n`);
        process.exit(1);
    }

    return files;
}

/**
 * Copy directory recursively
 */
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });
    let fileCount = 0;
    let totalSize = 0;

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            const result = copyDir(srcPath, destPath);
            fileCount += result.fileCount;
            totalSize += result.totalSize;
        } else {
            fs.copyFileSync(srcPath, destPath);
            const stats = fs.statSync(srcPath);
            totalSize += stats.size;
            fileCount++;
        }
    }

    return { fileCount, totalSize };
}

/**
 * Get ccesengine version from package.json
 */
function getVersion() {
    const pkgPath = path.join(rootDir, 'engine', 'package.json');
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            return pkg.version || 'unknown';
        } catch {
            return 'unknown';
        }
    }
    return 'unknown';
}

/**
 * Get git commit hash of engine submodule
 */
function getCommitHash() {
    const gitFile = path.join(rootDir, 'engine', '.git');
    if (fs.existsSync(gitFile)) {
        try {
            // .git file contains: gitdir: ../.git/modules/engine
            const gitContent = fs.readFileSync(gitFile, 'utf-8').trim();
            const match = gitContent.match(/gitdir:\s*(.+)/);
            if (match) {
                const gitDir = path.resolve(path.dirname(gitFile), match[1]);
                const headPath = path.join(gitDir, 'HEAD');
                if (fs.existsSync(headPath)) {
                    const head = fs.readFileSync(headPath, 'utf-8').trim();
                    // If it's a ref, resolve it
                    if (head.startsWith('ref:')) {
                        const refPath = path.join(gitDir, head.replace('ref: ', ''));
                        if (fs.existsSync(refPath)) {
                            return fs.readFileSync(refPath, 'utf-8').trim().substring(0, 8);
                        }
                    }
                    return head.substring(0, 8);
                }
            }
        } catch {
            // Ignore errors
        }
    }
    return 'unknown';
}

/**
 * Main function
 */
function main() {
    console.log(`\n📦 Copying CCESEngine to editor-app/public/ccesengine/ (mode: ${mode})\n`);

    // Check source
    checkSource();

    // Get version info
    const version = getVersion();
    const commit = getCommitHash();
    console.log(`   Version: ${version}`);
    console.log(`   Commit:  ${commit}`);
    console.log(`   Source:  ${sourceDir}`);
    console.log(`   Dest:    ${destDir}\n`);

    // Clean destination (except assets folder which may have project-specific files)
    if (fs.existsSync(destDir)) {
        const entries = fs.readdirSync(destDir);
        for (const entry of entries) {
            if (entry === 'assets') continue; // Keep assets folder
            const entryPath = path.join(destDir, entry);
            fs.rmSync(entryPath, { recursive: true, force: true });
        }
    }

    // Copy files
    console.log('   Copying files...');
    const { fileCount, totalSize } = copyDir(sourceDir, destDir);

    // Write version info
    const versionInfo = {
        version,
        commit,
        copiedAt: new Date().toISOString(),
        fileCount,
        totalSizeBytes: totalSize
    };
    fs.writeFileSync(
        path.join(destDir, '_version.json'),
        JSON.stringify(versionInfo, null, 2)
    );

    const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
    console.log(`\n✅ Copied ${fileCount} files (${sizeMB} MB)`);
    console.log(`   Version info saved to: public/ccesengine/_version.json\n`);
}

// Run
main();
