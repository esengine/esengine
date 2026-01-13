#!/usr/bin/env node
/**
 * @zh 更新所有文档中的网站 URL
 * @en Update website URL in all documentation files
 *
 * @zh 用法: node scripts/update-site-url.mjs [--to-alias]
 * @en Usage: node scripts/update-site-url.mjs [--to-alias]
 *
 * @zh 默认使用 siteUrl，加 --to-alias 参数则使用 siteUrlAlias
 * @en Uses siteUrl by default, use --to-alias flag to switch to siteUrlAlias
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Load config
const configPath = join(rootDir, 'site.config.json');
if (!existsSync(configPath)) {
    console.error('Error: site.config.json not found');
    process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, 'utf-8'));
const useAlias = process.argv.includes('--to-alias');

const fromUrl = useAlias ? config.siteUrl : config.siteUrlAlias;
const toUrl = useAlias ? config.siteUrlAlias : config.siteUrl;

console.log(`Updating URLs: ${fromUrl} -> ${toUrl}`);

// Files to update
const patterns = [
    'README.md',
    'README_CN.md',
    'packages/**/README.md',
    'packages/**/README_CN.md',
    'docs/src/content/**/*.md',
    'docs/public/CNAME',
];

// CNAME file handling
const cnameFile = join(rootDir, 'docs/public/CNAME');
if (useAlias) {
    // Switching to custom domain - create CNAME
    const domain = new URL(config.siteUrlAlias).hostname;
    writeFileSync(cnameFile, domain + '\n');
    console.log(`Created CNAME: ${domain}`);
} else {
    // Switching to GitHub Pages - remove CNAME
    if (existsSync(cnameFile)) {
        const { unlinkSync } = await import('fs');
        unlinkSync(cnameFile);
        console.log('Removed CNAME file');
    }
}

// Update markdown files
let updatedCount = 0;

for (const pattern of patterns) {
    if (pattern.includes('CNAME')) continue;

    const files = await glob(pattern, {
        cwd: rootDir,
        absolute: true,
        ignore: ['**/node_modules/**', '**/dist/**'],
    });

    for (const file of files) {
        try {
            const content = readFileSync(file, 'utf-8');
            if (content.includes(fromUrl)) {
                const newContent = content.replaceAll(fromUrl, toUrl);
                writeFileSync(file, newContent);
                console.log(`Updated: ${file.replace(rootDir, '')}`);
                updatedCount++;
            }
        } catch (err) {
            console.error(`Error processing ${file}: ${err.message}`);
        }
    }
}

console.log(`\nDone! Updated ${updatedCount} files.`);
console.log(`Current site URL: ${toUrl}`);
