#!/usr/bin/env node
/**
 * @zh 更新所有文档中的网站 URL
 * @en Update website URL in all documentation files
 *
 * @zh 用法: node scripts/update-site-url.mjs [--to-alias]
 * @en Usage: node scripts/update-site-url.mjs [--to-alias]
 *
 * @zh 默认使用 siteUrl (GitHub Pages)，加 --to-alias 参数则使用 siteUrlAlias (自定义域名)
 * @en Uses siteUrl (GitHub Pages) by default, use --to-alias flag to switch to siteUrlAlias (custom domain)
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
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
const astroConfig = useAlias ? config.astro.custom : config.astro.github;

console.log(`Updating URLs: ${fromUrl} -> ${toUrl}`);

// Files to update
const patterns = [
    'README.md',
    'README_CN.md',
    'packages/**/README.md',
    'packages/**/README_CN.md',
    'docs/src/content/**/*.md',
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
        unlinkSync(cnameFile);
        console.log('Removed CNAME file');
    }
}

// Update astro.config.mjs
const astroConfigPath = join(rootDir, 'docs/astro.config.mjs');
if (existsSync(astroConfigPath)) {
    let astroContent = readFileSync(astroConfigPath, 'utf-8');

    // Update or add site config
    if (astroContent.includes("site: '")) {
        astroContent = astroContent.replace(
            /site: '[^']*'/,
            `site: '${astroConfig.site}'`
        );
    }

    // Update or add base config
    if (astroConfig.base) {
        if (astroContent.includes("base: '")) {
            astroContent = astroContent.replace(
                /base: '[^']*'/,
                `base: '${astroConfig.base}'`
            );
        } else if (astroContent.includes("site: '")) {
            // Add base after site
            astroContent = astroContent.replace(
                /(site: '[^']*')/,
                `$1,\n  base: '${astroConfig.base}'`
            );
        }
    } else {
        // Remove base config for custom domain (root path)
        astroContent = astroContent.replace(/\n\s*base: '[^']*',?/, '');
    }

    writeFileSync(astroConfigPath, astroContent);
    console.log('Updated: docs/astro.config.mjs');
}

// Update markdown files
let updatedCount = 0;

for (const pattern of patterns) {
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

console.log(`\nDone! Updated ${updatedCount} markdown files + astro.config.mjs`);
console.log(`Current site URL: ${toUrl}`);
console.log(`Astro config: site='${astroConfig.site}', base='${astroConfig.base || '/'}'`);
