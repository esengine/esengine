const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 使用 Rollup 构建 @esengine/ecs-framework-math npm包...');

async function main() {
    try {
        // 清理旧的dist目录
        if (fs.existsSync('./dist')) {
            console.log('🧹 清理旧的构建文件...');
            execSync('rimraf ./dist', { stdio: 'inherit' });
        }

        // 执行Rollup构建
        console.log('📦 执行 Rollup 构建...');
        execSync('npx rollup -c rollup.config.cjs', { stdio: 'inherit' });

        // 复制其他文件
        console.log('📁 复制必要文件...');
        copyFiles();

        // 输出构建结果
        showBuildResults();

        console.log('✅ 构建完成！');

    } catch (error) {
        console.error('❌ 构建失败:', error.message);
        process.exit(1);
    }
}

function copyFiles() {
    const filesToCopy = [
        // 移除不存在的文件以避免警告
    ];

    filesToCopy.forEach(({ src, dest }) => {
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log(`  ✓ 复制: ${path.basename(dest)}`);
        } else {
            console.log(`  ⚠️  文件不存在: ${src}`);
        }
    });

    if (filesToCopy.length === 0) {
        console.log('  ℹ️  没有需要复制的文件');
    }
}

function showBuildResults() {
    const distDir = './dist';
    const files = ['index.mjs', 'index.cjs', 'index.umd.js', 'index.d.ts'];

    console.log('\n📊 构建结果:');
    files.forEach(file => {
        const filePath = path.join(distDir, file);
        if (fs.existsSync(filePath)) {
            const size = fs.statSync(filePath).size;
            console.log(`  ${file}: ${(size / 1024).toFixed(1)}KB`);
        }
    });
}

main().catch(console.error);
