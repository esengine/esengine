#!/usr/bin/env node
/**
 * @zh 同步 ccesengine 构建产物到编辑器
 * @en Sync ccesengine build output to editor
 *
 * 此脚本自动将 ccesengine 构建产物从 engine/bin/editor/esm 拷贝到
 * packages/editor/editor-app/public/ccesengine，确保构建流程的连贯性。
 *
 * This script automatically copies ccesengine build output from engine/bin/editor/esm
 * to packages/editor/editor-app/public/ccesengine, ensuring build flow continuity.
 *
 * Usage:
 *   node scripts/sync-ccesengine.mjs           # 仅同步 (sync only)
 *   node scripts/sync-ccesengine.mjs --build   # 先构建再同步 (build then sync)
 */

import { existsSync, mkdirSync, rmSync, cpSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const editorAppDir = join(__dirname, '..');
const engineDir = join(editorAppDir, '../../../engine');
const sourceDir = join(engineDir, 'bin/editor/esm');
const targetDir = join(editorAppDir, 'public/ccesengine');
const engineAssetsSource = join(engineDir, 'editor/assets');
const engineAssetsTarget = join(editorAppDir, 'public/engine-assets');

/**
 * @zh 获取目录大小（用于统计）
 * @en Get directory size (for statistics)
 */
function getDirSize(dirPath) {
    let size = 0;
    if (!existsSync(dirPath)) return size;

    const items = readdirSync(dirPath, { withFileTypes: true });
    for (const item of items) {
        const itemPath = join(dirPath, item.name);
        if (item.isDirectory()) {
            size += getDirSize(itemPath);
        } else {
            size += statSync(itemPath).size;
        }
    }
    return size;
}

/**
 * @zh 格式化文件大小
 * @en Format file size
 */
function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * @zh 统计文件数量
 * @en Count files
 */
function countFiles(dirPath, ext = null) {
    let count = 0;
    if (!existsSync(dirPath)) return count;

    const items = readdirSync(dirPath, { withFileTypes: true });
    for (const item of items) {
        const itemPath = join(dirPath, item.name);
        if (item.isDirectory()) {
            count += countFiles(itemPath, ext);
        } else if (!ext || item.name.endsWith(ext)) {
            count++;
        }
    }
    return count;
}

async function main() {
    const args = process.argv.slice(2);
    const shouldBuild = args.includes('--build');

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║           Sync CCESEngine to Editor                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Step 1: Build ccesengine if requested
    if (shouldBuild) {
        console.log('📦 Building ccesengine (PREVIEW mode)...');

        if (!existsSync(engineDir)) {
            console.error(`❌ Engine directory not found: ${engineDir}`);
            console.error('   Please ensure the engine submodule is initialized.');
            process.exit(1);
        }

        try {
            execSync('npm run build:editor', {
                cwd: engineDir,
                stdio: 'inherit',
            });
            console.log('✅ ccesengine build complete\n');
        } catch (error) {
            console.error('❌ ccesengine build failed:', error.message);
            process.exit(1);
        }
    }

    // Step 2: Verify source exists
    if (!existsSync(sourceDir)) {
        console.error(`❌ Source directory not found: ${sourceDir}`);
        console.error('   Run with --build to build ccesengine first.');
        process.exit(1);
    }

    // Step 3: Sync ESM build
    console.log('📁 Syncing ESM build output...');
    console.log(`   From: ${sourceDir}`);
    console.log(`   To:   ${targetDir}\n`);

    // Remove old target directory
    if (existsSync(targetDir)) {
        rmSync(targetDir, { recursive: true });
    }
    mkdirSync(targetDir, { recursive: true });

    // Copy all files
    cpSync(sourceDir, targetDir, { recursive: true });

    // Statistics
    const jsCount = countFiles(targetDir, '.js');
    const wasmCount = countFiles(targetDir, '.wasm');
    const totalSize = getDirSize(targetDir);

    console.log(`✅ Copied ${jsCount} JS files, ${wasmCount} WASM files`);
    console.log(`   Total size: ${formatSize(totalSize)}\n`);

    // Step 4: Sync engine editor assets (optional)
    if (existsSync(engineAssetsSource)) {
        console.log('📁 Syncing engine editor assets...');
        console.log(`   From: ${engineAssetsSource}`);
        console.log(`   To:   ${engineAssetsTarget}\n`);

        if (existsSync(engineAssetsTarget)) {
            rmSync(engineAssetsTarget, { recursive: true });
        }
        mkdirSync(engineAssetsTarget, { recursive: true });

        cpSync(engineAssetsSource, engineAssetsTarget, { recursive: true });

        const assetSize = getDirSize(engineAssetsTarget);
        console.log(`✅ Editor assets synced: ${formatSize(assetSize)}\n`);
    }

    console.log('════════════════════════════════════════════════════════');
    console.log('✨ Sync complete! You can now run: pnpm dev');
    console.log('════════════════════════════════════════════════════════\n');
}

main().catch((error) => {
    console.error('❌ Sync failed:', error);
    process.exit(1);
});
