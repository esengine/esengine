import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import fs from 'fs';
import path from 'path';
import type { Connect } from 'vite';

/**
 * Plugin to copy engine modules after each build.
 * 每次构建后复制引擎模块的插件。
 */
function copyEngineModulesPlugin(): Plugin {
  const packagesDir = path.resolve(__dirname, '..');

  function getEngineModules() {
    const modules: Array<{
      id: string;
      name: string;
      displayName: string;
      packageDir: string;
      moduleJsonPath: string;
      distPath: string;
      editorPackage?: string;
      isCore: boolean;
      category: string;
    }> = [];

    let packages: string[];
    try {
      packages = fs.readdirSync(packagesDir);
    } catch {
      return modules;
    }

    for (const pkg of packages) {
      const pkgDir = path.join(packagesDir, pkg);
      const moduleJsonPath = path.join(pkgDir, 'module.json');

      try {
        if (!fs.statSync(pkgDir).isDirectory()) continue;
      } catch {
        continue;
      }

      if (!fs.existsSync(moduleJsonPath)) continue;

      try {
        const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));
        if (moduleJson.isEngineModule !== false) {
          // Use outputPath from module.json, default to "dist/index.js"
          const outputPath = moduleJson.outputPath || 'dist/index.js';
          const distPath = path.join(pkgDir, outputPath);

          modules.push({
            id: moduleJson.id || pkg,
            name: moduleJson.name || `@esengine/${pkg}`,
            displayName: moduleJson.displayName || pkg,
            packageDir: pkgDir,
            moduleJsonPath,
            distPath,
            editorPackage: moduleJson.editorPackage,
            isCore: moduleJson.isCore || false,
            category: moduleJson.category || 'Other'
          });
        }
      } catch {
        // Ignore parse errors
      }
    }

    return modules;
  }

  return {
    name: 'copy-engine-modules',
    writeBundle(options) {
      const outDir = options.dir || 'dist';
      const engineDir = path.join(outDir, 'engine');

      // Clean and recreate engine directory
      if (fs.existsSync(engineDir)) {
        fs.rmSync(engineDir, { recursive: true });
      }
      fs.mkdirSync(engineDir, { recursive: true });

      const modules = getEngineModules();
      const moduleInfos: Array<{
        id: string;
        name: string;
        displayName: string;
        hasRuntime: boolean;
        editorPackage?: string;
        isCore: boolean;
        category: string;
        jsSize?: number;
        requiresWasm?: boolean;
        wasmSize?: number;
        wasmFiles?: string[];
      }> = [];

      const editorPackages = new Set<string>();

      /**
       * Calculate total WASM file size in a directory.
       * 计算目录中 WASM 文件的总大小。
       */
      function getWasmSize(pkgDir: string): number {
        let totalSize = 0;
        const checkDirs = [
          pkgDir,
          path.join(pkgDir, 'pkg'),
          path.join(pkgDir, 'dist')
        ];

        for (const dir of checkDirs) {
          if (!fs.existsSync(dir)) continue;
          try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
              if (file.endsWith('.wasm')) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                totalSize += stat.size;
              }
            }
          } catch {
            // Ignore errors
          }
        }
        return totalSize;
      }

      console.log(`[copy-engine-modules] Copying ${modules.length} modules to dist/engine/`);

      for (const module of modules) {
        const moduleOutputDir = path.join(engineDir, module.id);
        fs.mkdirSync(moduleOutputDir, { recursive: true });

        // Read full module.json for additional fields
        // 读取完整 module.json 获取额外字段
        let moduleJson: Record<string, unknown> = {};
        try {
          moduleJson = JSON.parse(fs.readFileSync(module.moduleJsonPath, 'utf-8'));
        } catch {
          // Ignore parse errors
        }

        // Copy module.json
        fs.copyFileSync(module.moduleJsonPath, path.join(moduleOutputDir, 'module.json'));

        // Copy dist/index.js if exists
        let hasRuntime = false;
        let jsSize = 0;
        if (fs.existsSync(module.distPath)) {
          fs.copyFileSync(module.distPath, path.join(moduleOutputDir, 'index.js'));
          // Get JS file size
          jsSize = fs.statSync(module.distPath).size;
          // Copy source map if exists
          const sourceMapPath = module.distPath + '.map';
          if (fs.existsSync(sourceMapPath)) {
            fs.copyFileSync(sourceMapPath, path.join(moduleOutputDir, 'index.js.map'));
          }
          // Copy type definitions if exists
          // 复制类型定义文件（如果存在）
          // Handle both .js and .mjs extensions
          // 处理 .js 和 .mjs 两种扩展名
          const distDir = path.dirname(module.distPath);
          const dtsPath = path.join(distDir, 'index.d.ts');
          if (fs.existsSync(dtsPath)) {
            fs.copyFileSync(dtsPath, path.join(moduleOutputDir, 'index.d.ts'));
          }
          hasRuntime = true;

          // Copy additional included files (e.g., chunks)
          // 复制额外包含的文件（如 chunk）
          const includes = moduleJson.includes as string[] | undefined;
          if (includes && includes.length > 0) {
            const distDir = path.dirname(module.distPath);
            for (const pattern of includes) {
              // Convert glob pattern to regex
              const regexPattern = pattern
                .replace(/\\/g, '\\\\')
                .replace(/\./g, '\\.')
                .replace(/\*/g, '.*')
                .replace(/\?/g, '.');
              const regex = new RegExp(`^${regexPattern}$`);

              // Find matching files in dist directory
              if (fs.existsSync(distDir)) {
                const files = fs.readdirSync(distDir);
                for (const file of files) {
                  if (regex.test(file)) {
                    const srcFile = path.join(distDir, file);
                    const destFile = path.join(moduleOutputDir, file);
                    fs.copyFileSync(srcFile, destFile);
                    jsSize += fs.statSync(srcFile).size;
                    // Copy source map for included file if exists
                    const mapFile = srcFile + '.map';
                    if (fs.existsSync(mapFile)) {
                      fs.copyFileSync(mapFile, destFile + '.map');
                    }
                    console.log(`[copy-engine-modules] Copied include to ${module.id}/: ${file}`);
                  }
                }
              }
            }
          }
        }

        // Calculate WASM size and copy WASM files if module requires WASM
        // 如果模块需要 WASM，计算 WASM 大小并复制 WASM 文件
        const requiresWasm = moduleJson.requiresWasm === true;
        let wasmSize = 0;
        const copiedWasmFiles: string[] = [];
        if (requiresWasm) {
          wasmSize = getWasmSize(module.packageDir);
          if (wasmSize > 0) {
            console.log(`[copy-engine-modules] ${module.id}: WASM size = ${(wasmSize / 1024).toFixed(1)} KB`);
          }

          // Copy WASM files from wasmPaths defined in module.json
          // wasmPaths 现在是相对于源包目录的路径，如 "rapier_wasm2d_bg.wasm"
          // 需要找到实际的 WASM 文件并复制到输出的模块目录
          const wasmPaths = moduleJson.wasmPaths as string[] | undefined;
          if (wasmPaths && wasmPaths.length > 0) {
            for (const wasmRelPath of wasmPaths) {
              const wasmFileName = path.basename(wasmRelPath);

              // 查找源 WASM 文件的可能位置
              // wasmPaths 里配置的是相对路径，实际文件在源包里
              // 对于 @esengine/rapier2d，WASM 在 packages/rapier2d/pkg/ 下
              const possibleSrcPaths = [
                // 直接在包目录下（如果 wasmRelPath 就是文件名）
                path.join(module.packageDir, wasmRelPath),
                // 在包的 pkg 目录下（wasm-pack 输出）
                path.join(module.packageDir, 'pkg', wasmFileName),
                // 在包的 dist 目录下
                path.join(module.packageDir, 'dist', wasmFileName),
              ];

              // 对于依赖其他包 WASM 的情况，检查依赖包
              // 例如 physics-rapier2d 依赖 rapier2d 的 WASM
              const depMatch = moduleJson.name?.toString().match(/@esengine\/(.+)/);
              if (depMatch) {
                // 检查同名的依赖包（去掉 physics- 前缀）
                const baseName = depMatch[1].replace('physics-', '');
                possibleSrcPaths.push(
                  path.join(packagesDir, baseName, 'pkg', wasmFileName),
                  path.join(packagesDir, baseName, wasmFileName)
                );
              }

              let copied = false;
              for (const srcPath of possibleSrcPaths) {
                if (fs.existsSync(srcPath)) {
                  const destPath = path.join(moduleOutputDir, wasmFileName);
                  fs.copyFileSync(srcPath, destPath);
                  copiedWasmFiles.push(wasmFileName);
                  console.log(`[copy-engine-modules] Copied WASM to ${module.id}/: ${wasmFileName}`);
                  copied = true;
                  break;
                }
              }

              if (!copied) {
                console.warn(`[copy-engine-modules] WASM file not found: ${wasmRelPath} (tried ${possibleSrcPaths.length} paths)`);
              }
            }
          }

          // Copy pkg directory if exists (for WASM JS bindings like rapier2d)
          // 如果存在 pkg 目录则复制（用于 WASM JS 绑定如 rapier2d）
          // The JS and WASM files must be in the same directory for import.meta.url to work
          // JS 和 WASM 文件必须在同一目录才能让 import.meta.url 正常工作
          const pkgDir = path.join(module.packageDir, 'pkg');
          if (fs.existsSync(pkgDir)) {
            const pkgOutputDir = path.join(moduleOutputDir, 'pkg');
            fs.mkdirSync(pkgOutputDir, { recursive: true });
            const pkgFiles = fs.readdirSync(pkgDir);
            for (const file of pkgFiles) {
              // Copy both JS and WASM files to pkg directory
              // 将 JS 和 WASM 文件都复制到 pkg 目录
              if (file.endsWith('.js') || file.endsWith('.wasm')) {
                const srcFile = path.join(pkgDir, file);
                const destFile = path.join(pkgOutputDir, file);
                fs.copyFileSync(srcFile, destFile);
                console.log(`[copy-engine-modules] Copied pkg to ${module.id}/pkg/: ${file}`);
              }
            }
          }
        }

        moduleInfos.push({
          id: module.id,
          name: module.name,
          displayName: module.displayName,
          hasRuntime,
          editorPackage: module.editorPackage,
          isCore: module.isCore,
          category: module.category,
          // Only include jsSize if there's actual runtime code
          // 只有实际有运行时代码时才包含 jsSize
          jsSize: jsSize > 0 ? jsSize : undefined,
          requiresWasm: requiresWasm || undefined,
          wasmSize: wasmSize > 0 ? wasmSize : undefined,
          // WASM files that were copied to dist/wasm/
          // 复制到 dist/wasm/ 的 WASM 文件
          wasmFiles: copiedWasmFiles.length > 0 ? copiedWasmFiles : undefined
        });

        if (module.editorPackage) {
          editorPackages.add(module.editorPackage);
        }
      }

      // Copy editor packages
      for (const editorPkg of editorPackages) {
        const match = editorPkg.match(/@esengine\/(.+)/);
        if (!match) continue;

        const pkgName = match[1];
        const pkgDir = path.join(packagesDir, pkgName);
        const distPath = path.join(pkgDir, 'dist', 'index.js');

        if (!fs.existsSync(distPath)) continue;

        const editorOutputDir = path.join(engineDir, pkgName);
        fs.mkdirSync(editorOutputDir, { recursive: true });
        fs.copyFileSync(distPath, path.join(editorOutputDir, 'index.js'));

        const sourceMapPath = distPath + '.map';
        if (fs.existsSync(sourceMapPath)) {
          fs.copyFileSync(sourceMapPath, path.join(editorOutputDir, 'index.js.map'));
        }
      }

      // Create index.json
      const indexData = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        modules: moduleInfos
      };

      fs.writeFileSync(
        path.join(engineDir, 'index.json'),
        JSON.stringify(indexData, null, 2)
      );

      console.log(`[copy-engine-modules] Done! Created dist/engine/index.json`);
    }
  };
}

const host = process.env.TAURI_DEV_HOST;
const wasmPackages: string[] = [];

/**
 * 检查包目录是否包含 WASM 文件
 */
function hasWasmFiles(dirPath: string): boolean {
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (file.endsWith('.wasm')) return true;
      if (file === 'pkg') {
        const pkgPath = path.join(dirPath, file);
        const pkgFiles = fs.readdirSync(pkgPath);
        if (pkgFiles.some(f => f.endsWith('.wasm'))) return true;
      }
    }
  } catch {
    // Ignore errors
  }
  return false;
}

/**
 * 扫描 packages 目录检测 WASM 包
 */
function detectWasmPackages() {
  const packagesDir = path.resolve(__dirname, '..');
  if (!fs.existsSync(packagesDir)) return;

  const packageDirs = fs.readdirSync(packagesDir).filter(dir => {
    const stat = fs.statSync(path.join(packagesDir, dir));
    return stat.isDirectory();
  });

  for (const dir of packageDirs) {
    const packageJsonPath = path.join(packagesDir, dir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const packageName = packageJson.name;
        const packageDir = path.join(packagesDir, dir);

        if (packageName && hasWasmFiles(packageDir)) {
          wasmPackages.push(packageName);
          console.log(`[Vite] Detected WASM package: ${packageName}`);
        }
      } catch {
        // Ignore errors
      }
    }
  }

  // 扫描 node_modules
  const nodeModulesDir = path.resolve(__dirname, 'node_modules');
  if (fs.existsSync(nodeModulesDir)) {
    scanNodeModulesForWasm(nodeModulesDir);
  }
}

function scanNodeModulesForWasm(nodeModulesDir: string) {
  try {
    const entries = fs.readdirSync(nodeModulesDir);
    for (const entry of entries) {
      if (entry.startsWith('.')) continue;

      const entryPath = path.join(nodeModulesDir, entry);
      const stat = fs.statSync(entryPath);
      if (!stat.isDirectory()) continue;

      if (entry.startsWith('@')) {
        const scopedPackages = fs.readdirSync(entryPath);
        for (const scopedPkg of scopedPackages) {
          const scopedPath = path.join(entryPath, scopedPkg);
          if (fs.statSync(scopedPath).isDirectory()) {
            if (!wasmPackages.includes(`${entry}/${scopedPkg}`) && hasWasmFiles(scopedPath)) {
              wasmPackages.push(`${entry}/${scopedPkg}`);
              console.log(`[Vite] Detected WASM package in node_modules: ${entry}/${scopedPkg}`);
            }
          }
        }
      } else {
        if (!wasmPackages.includes(entry) && hasWasmFiles(entryPath)) {
          wasmPackages.push(entry);
          console.log(`[Vite] Detected WASM package in node_modules: ${entry}`);
        }
      }
    }
  } catch {
    // Ignore errors
  }
}

detectWasmPackages();

/**
 * Plugin to serve engine editor assets from engine/editor/assets directory.
 * 插件：从 engine/editor/assets 目录提供引擎编辑器资源服务。
 *
 * In dev mode: serves via middleware
 * In build mode: copies assets to dist/engine-assets/
 */
function serveEngineEditorAssets(): Plugin {
  // Engine editor assets path (relative to project root)
  const engineAssetsPath = path.resolve(__dirname, '../../../engine/editor/assets');

  /**
   * Recursively copy directory with specific file patterns
   */
  function copyDirFiltered(srcDir: string, destDir: string, patterns: string[]): void {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);

      if (entry.isDirectory()) {
        // Always recurse into directories
        copyDirFiltered(srcPath, destPath, patterns);
      } else if (entry.isFile()) {
        // Only copy files matching patterns
        const ext = path.extname(entry.name).toLowerCase();
        if (patterns.some(p => entry.name.endsWith(p))) {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
  }

  return {
    name: 'serve-engine-editor-assets',

    // For dev server: add middleware
    configureServer(server) {
      // Add middleware to serve engine editor assets under /engine-assets/
      server.middlewares.use('/engine-assets', (req, res, next) => {
        if (!req.url) {
          next();
          return;
        }

        const filePath = path.join(engineAssetsPath, decodeURIComponent(req.url));

        // Security: ensure path is within engine assets directory
        if (!filePath.startsWith(engineAssetsPath)) {
          res.statusCode = 403;
          res.end('Forbidden');
          return;
        }

        fs.stat(filePath, (err, stats) => {
          if (err || !stats.isFile()) {
            next();
            return;
          }

          // Set content type based on extension
          const ext = path.extname(filePath).toLowerCase();
          const contentTypes: Record<string, string> = {
            '.json': 'application/json',
            '.meta': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.hdr': 'application/octet-stream',
          };
          res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
          res.setHeader('Access-Control-Allow-Origin', '*');

          const stream = fs.createReadStream(filePath);
          stream.pipe(res);
        });
      });

      console.log(`[serve-engine-editor-assets] Serving engine assets from: ${engineAssetsPath}`);
    },

    // For production build: copy assets to dist
    writeBundle(options) {
      const outDir = options.dir || 'dist';
      const destDir = path.join(outDir, 'engine-assets');

      // Only copy specific subdirectories needed by the editor
      const assetDirs = ['default_skybox', 'default_ui'];
      const filePatterns = ['.png', '.jpg', '.jpeg', '.hdr', '.meta', '.json'];

      let copiedCount = 0;
      for (const dir of assetDirs) {
        const srcPath = path.join(engineAssetsPath, dir);
        const destPath = path.join(destDir, dir);

        if (fs.existsSync(srcPath)) {
          copyDirFiltered(srcPath, destPath, filePatterns);
          copiedCount++;
        }
      }

      if (copiedCount > 0) {
        console.log(`[serve-engine-editor-assets] Copied ${copiedCount} asset directories to ${destDir}`);
      }
    }
  };
}

/**
 * Plugin to handle ccesengine PREVIEW mode requests.
 * 处理 ccesengine PREVIEW 模式的请求。
 *
 * PREVIEW mode uses:
 * 1. /engine_external/?url=<path> for WASM files
 * 2. virtual:///prerequisite-imports/<bundle> for bundle prerequisites
 */
function serveCcesenginePreviewMode(): Plugin {
  const ccesengineDir = path.resolve(__dirname, 'public/ccesengine');

  return {
    name: 'serve-ccesengine-preview-mode',

    configureServer(server) {
      // Handle /engine_external/?url=<path> requests for WASM and other assets
      // Must be registered early to intercept before Vite's default handlers
      server.middlewares.use((req, res, next) => {
        // Only handle /engine_external/ requests
        if (!req.url || !req.url.startsWith('/engine_external/')) {
          next();
          return;
        }

        console.log(`[engine_external] Request: ${req.url}`);

        // Parse the url parameter from the full URL
        const fullUrl = new URL(req.url, 'http://localhost');
        const assetPath = fullUrl.searchParams.get('url');

        if (!assetPath) {
          console.warn(`[engine_external] Missing url parameter: ${req.url}`);
          res.statusCode = 400;
          res.end('Missing url parameter');
          return;
        }

        // Construct the file path - assets are in public/ccesengine/
        const filePath = path.join(ccesengineDir, assetPath);

        console.log(`[engine_external] Loading: ${assetPath} -> ${filePath}`);

        // Security: ensure path is within ccesengine directory
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(ccesengineDir)) {
          res.statusCode = 403;
          res.end('Forbidden');
          return;
        }

        fs.stat(filePath, (err, stats) => {
          if (err || !stats.isFile()) {
            console.warn(`[engine_external] File not found: ${assetPath} (${filePath})`);
            res.statusCode = 404;
            res.end(`File not found: ${assetPath}`);
            return;
          }

          // Set content type based on extension
          const ext = path.extname(filePath).toLowerCase();
          const contentTypes: Record<string, string> = {
            '.wasm': 'application/wasm',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.bin': 'application/octet-stream',
            '.mem': 'application/octet-stream',
          };
          res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
          res.setHeader('Access-Control-Allow-Origin', '*');

          console.log(`[engine_external] Serving: ${assetPath} (${ext})`);
          const stream = fs.createReadStream(filePath);
          stream.pipe(res);
        });
      });

      console.log(`[ccesengine-preview] Serving /engine_external/ from: ${ccesengineDir}`);
    },

    // Handle virtual:///prerequisite-imports/ requests at dev time
    // This is used by ccesengine bundle system - return empty module since we don't use bundles
    resolveId(id) {
      if (id.startsWith('virtual:///prerequisite-imports/')) {
        return id;
      }
      return null;
    },

    load(id) {
      if (id.startsWith('virtual:///prerequisite-imports/')) {
        // Return empty module - we don't use bundle prerequisites in editor
        return 'export default {};';
      }
      return null;
    },
  };
}

/**
 * Plugin to serve project files (library, assets) via HTTP.
 * 通过 HTTP 提供项目文件服务（library、assets）。
 *
 * This replaces the problematic asset:// protocol with HTTP endpoints.
 * 用 HTTP 端点替代有问题的 asset:// 协议。
 *
 * URL format: /__project__/<drive>/<path>
 * Example: /__project__/F/ecs-framework/examples/demo/library/imports/xx/uuid.json
 *
 * This path-based format allows ccesengine to append path segments correctly.
 *
 * ccesengine appends version hash to UUIDs: uuid@hash
 * Actual files are stored as uuid.json (for imports) or uuid.bin (for native)
 * ccesengine 会在 UUID 后追加版本哈希：uuid@hash
 * 实际文件存储为 uuid.json（imports）或 uuid.bin（native）
 */
function serveProjectFilesPlugin(): Plugin {
  return {
    name: 'serve-project-files',

    configureServer(server) {
      // Serve project files from /__project__/<drive>/<path>
      // Windows path F:/foo/bar becomes /__project__/F/foo/bar
      // NOTE: Don't use path prefix in .use() - check URL inside handler instead
      // 注意：不要在 .use() 中使用路径前缀 - 在 handler 内部检查 URL
      server.middlewares.use(((req, res, next) => {
        if (!req.url || !req.url.startsWith('/__project__/')) {
          next();
          return;
        }

        // Remove /__project__ prefix and query string
        let urlPath = req.url.substring('/__project__'.length).split('?')[0];
        if (urlPath.startsWith('/')) {
          urlPath = urlPath.substring(1);
        }

        console.log(`[serve-project-files] Request: ${req.url.substring(0, 100)}...`);

        // Decode URL-encoded characters
        urlPath = decodeURIComponent(urlPath);

        // Convert back to Windows path: F/foo/bar -> F:/foo/bar
        // The first segment is the drive letter
        let filePath = urlPath.replace(/^([A-Za-z])\//, '$1:/');

        if (!filePath) {
          res.statusCode = 400;
          res.end('Invalid path');
          return;
        }

        // Handle ccesengine asset URLs: uuid@hash -> uuid@hash.json
        // Cocos Creator 3.x library format stores files WITH the hash in filename
        // Example: bd1bcaba-bd7d-4a71-b143-997c882383e4@f9941.json
        // 处理 ccesengine 资源 URL：uuid@hash -> uuid@hash.json
        // Cocos Creator 3.x 库格式在文件名中保留哈希
        const hasExtension = /\.[a-z0-9]+$/i.test(filePath);
        if (!hasExtension && filePath.includes('/library/')) {
          // Try common extensions in order of likelihood
          const extensions = ['.json', '.png', '.jpg', '.jpeg', '.webp', '.bin', '.mp3', '.ogg', '.wav', '.ttf', '.woff', '.woff2'];
          let found = false;
          for (const ext of extensions) {
            const testPath = filePath + ext;
            if (fs.existsSync(testPath)) {
              filePath = testPath;
              found = true;
              break;
            }
          }
          if (!found) {
            // Default to .json for library assets
            filePath = filePath + '.json';
          }
        }

        fs.stat(filePath, (err, stats) => {
          if (err || !stats.isFile()) {
            console.warn(`[serve-project-files] File not found: ${filePath}`);
            res.statusCode = 404;
            res.end(`File not found: ${filePath}`);
            return;
          }

          // Set content type based on extension
          const ext = path.extname(filePath).toLowerCase();
          const contentTypes: Record<string, string> = {
            '.json': 'application/json',
            '.bin': 'application/octet-stream',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
            '.mp3': 'audio/mpeg',
            '.ogg': 'audio/ogg',
            '.wav': 'audio/wav',
            '.ttf': 'font/ttf',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
          };
          res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
          res.setHeader('Access-Control-Allow-Origin', '*');

          const stream = fs.createReadStream(filePath);
          stream.on('error', () => {
            res.statusCode = 500;
            res.end('Error reading file');
          });
          stream.pipe(res);
        });
      }) as Connect.NextHandleFunction);

      console.log('[serve-project-files] Serving project files at /__project__/<drive>/<path>');
    },
  };
}

/**
 * Plugin to patch ccesengine files to work in non-Cocos-Creator environment.
 * 修补 ccesengine 文件以在非 Cocos Creator 环境中工作。
 *
 * Patches applied at runtime (not modifying built files):
 * 1. cce://internal/x/prerequisite-imports -> /prerequisite-imports
 * 2. _loadCCEScripts -> return empty (skip cce:// protocol)
 * 3. virtual:///prerequisite-imports -> skip in bundle creation
 * 4. WASM loading path: /engine_external/?url= -> /ccesengine/
 */
function patchCcesenginePlugin(): Plugin {
  const ccesengineDir = path.resolve(__dirname, 'public/ccesengine');

  return {
    name: 'patch-ccesengine',
    enforce: 'pre',

    configureServer(server) {
      // Handle /prerequisite-imports requests - return empty module
      server.middlewares.use('/prerequisite-imports', ((req, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end('export default {};');
      }) as Connect.NextHandleFunction);

      // Intercept ALL ccesengine JS files and apply patches BEFORE Vite serves them
      // NOT returning a function means this runs BEFORE Vite's internal handlers
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/ccesengine/')) {
          next();
          return;
        }

        // Remove query string for file lookup
        const urlPath = req.url.split('?')[0];

        // Only process JS files
        if (!urlPath.endsWith('.js')) {
          next();
          return;
        }

        // urlPath is /ccesengine/xxx.js, need to remove /ccesengine prefix
        const relativePath = urlPath.replace('/ccesengine', '');
        const filePath = path.join(ccesengineDir, relativePath);

        // Security check
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(ccesengineDir)) {
          next();
          return;
        }

        fs.readFile(filePath, 'utf-8', (err, content) => {
          if (err) {
            next();
            return;
          }

          let patched = content;

          // Patch 1: Replace cce:// protocol URLs with HTTP endpoint
          // This handles the _loadCCEScripts function which imports 'cce:/internal/x/prerequisite-imports'
          if (patched.includes('cce:/internal/x/prerequisite-imports')) {
            patched = patched.replace(
              /['"]cce:\/internal\/x\/prerequisite-imports['"]/g,
              '"/prerequisite-imports"'
            );
          }

          // Patch 2: Skip virtual:///prerequisite-imports in bundle creation
          // Look for bundle.create calls that try to load prerequisite-imports
          if (patched.includes('virtual:///prerequisite-imports')) {
            // Replace dynamic import of virtual modules with immediate resolution
            patched = patched.replace(
              /import\s*\(\s*['"]virtual:\/\/\/prerequisite-imports\/[^'"]*['"]\s*\)/g,
              'Promise.resolve({})'
            );
          }

          // Note: WASM loading uses /engine_external/?url= which is handled by
          // serveCcesenginePreviewMode middleware - no patching needed

          res.setHeader('Content-Type', 'application/javascript');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(patched);
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [
    patchCcesenginePlugin(),
    serveProjectFilesPlugin(),
    wasm(),
    topLevelAwait(),
    ...react({
      tsDecorators: true,
    }),
    copyEngineModulesPlugin(),
    serveEngineEditorAssets(),
    serveCcesenginePreviewMode(),
  ],
  clearScreen: false,
  server: {
    host: host || false,
    port: 5173,
    strictPort: true,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 5183,
        }
      : undefined,
    fs: {
      strict: false,
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: 'es2021',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    rollupOptions: {
      // Externalize ccesengine - loaded at runtime from public folder
      external: [/^\/ccesengine\/.*/],
    },
  },
  esbuild: {
    // 保留类名和函数名，用于跨包插件服务匹配
    keepNames: true,
  },
  optimizeDeps: {
    include: ['tslib', 'react', 'react-dom', 'zustand', 'lucide-react'],
    exclude: wasmPackages,
  },
});
