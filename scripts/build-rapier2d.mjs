#!/usr/bin/env node

/**
 * Build Rapier2D WASM artifacts
 * 构建 Rapier2D WASM 产物
 *
 * This script automates the entire Rapier2D WASM build process:
 * 此脚本自动化整个 Rapier2D WASM 构建流程：
 *
 * 1. Prepare Rust project from thirdparty/rapier.js
 * 2. Build WASM using wasm-pack
 * 3. Copy artifacts to packages/physics/rapier2d/pkg
 * 4. Generate TypeScript source code
 */

import { execSync, spawn } from 'child_process';
import { existsSync, cpSync, rmSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const rapierJsDir = join(rootDir, 'thirdparty', 'rapier.js');
const rapier2dBuildDir = join(rapierJsDir, 'builds', 'rapier2d');
const rapier2dPkgSrc = join(rapier2dBuildDir, 'pkg');
const rapier2dPkgDest = join(rootDir, 'packages', 'physics', 'rapier2d', 'pkg');

/**
 * Run a command and stream output
 */
function runCommand(command, cwd, description) {
    console.log(`\n📦 ${description}...`);
    console.log(`   Running: ${command}`);
    console.log(`   In: ${cwd}\n`);

    try {
        execSync(command, {
            cwd,
            stdio: 'inherit',
            shell: true
        });
        return true;
    } catch (error) {
        console.error(`❌ Failed: ${description}`);
        return false;
    }
}

/**
 * Main build function
 */
async function build() {
    console.log('🚀 Building Rapier2D WASM...\n');

    // Check if rapier.js exists
    if (!existsSync(rapierJsDir)) {
        console.error('❌ Error: thirdparty/rapier.js not found!');
        console.error('   Please clone it first:');
        console.error('   git clone https://github.com/esengine/rapier.js.git thirdparty/rapier.js');
        process.exit(1);
    }

    // Check if Rust/Cargo is installed
    try {
        execSync('cargo --version', { stdio: 'pipe' });
    } catch {
        console.error('❌ Error: Rust/Cargo not found!');
        console.error('   Please install Rust: https://rustup.rs/');
        process.exit(1);
    }

    // Check if wasm-pack is installed
    try {
        execSync('wasm-pack --version', { stdio: 'pipe' });
    } catch {
        console.error('❌ Error: wasm-pack not found!');
        console.error('   Please install it: cargo install wasm-pack');
        process.exit(1);
    }

    // Step 1: Prepare Rust project
    if (!runCommand(
        'cargo run -p prepare_builds -- -d dim2 -f non-deterministic',
        rapierJsDir,
        'Step 1/4: Preparing Rust project'
    )) {
        process.exit(1);
    }

    // Step 2: Install npm dependencies for rapier2d build
    if (!runCommand(
        'npm install',
        rapier2dBuildDir,
        'Step 2/4: Installing npm dependencies'
    )) {
        process.exit(1);
    }

    // Step 3: Build WASM
    if (!runCommand(
        'npm run build',
        rapier2dBuildDir,
        'Step 3/4: Building WASM'
    )) {
        process.exit(1);
    }

    // Step 4: Copy pkg to packages/physics/rapier2d/pkg
    console.log('\n📦 Step 4/4: Copying WASM artifacts...');
    console.log(`   From: ${rapier2dPkgSrc}`);
    console.log(`   To: ${rapier2dPkgDest}\n`);

    if (!existsSync(rapier2dPkgSrc)) {
        console.error('❌ Error: Build output not found at', rapier2dPkgSrc);
        process.exit(1);
    }

    // Remove old pkg if exists
    if (existsSync(rapier2dPkgDest)) {
        rmSync(rapier2dPkgDest, { recursive: true });
    }

    // Copy new pkg
    cpSync(rapier2dPkgSrc, rapier2dPkgDest, { recursive: true });
    console.log('   ✅ Copied successfully!\n');

    // Step 5: Generate TypeScript source
    if (!runCommand(
        'pnpm --filter @esengine/rapier2d gen:src',
        rootDir,
        'Bonus: Generating TypeScript source'
    )) {
        console.warn('⚠️  Warning: Failed to generate TypeScript source.');
        console.warn('   You can run it manually: pnpm --filter @esengine/rapier2d gen:src');
    }

    console.log('\n✅ Rapier2D WASM build completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Run: pnpm build:editor');
    console.log('  2. Start editor: cd packages/editor/editor-app && pnpm tauri:dev\n');
}

build().catch(error => {
    console.error('❌ Build failed:', error);
    process.exit(1);
});
