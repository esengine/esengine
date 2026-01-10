/**
 * @zh 用户脚本编译器 - 使用 esbuild 打包项目中的 TypeScript 脚本
 * @en User Script Compiler - Bundles TypeScript scripts in the project using esbuild
 *
 * 这个服务让我们的编辑器可以完全替代 Cocos Creator：
 * - 扫描项目找到入口文件
 * - 使用 Rust 后端的 esbuild 编译器打包
 * - 打包所有 npm 依赖
 * - 将 'cc' 模块标记为外部（由 ccesengine 提供）
 * - 将编译后的代码注入运行时
 */

import { invoke } from '@tauri-apps/api/core';

export interface CompileError {
    message: string;
    file?: string;
    line?: number;
    column?: number;
}

export interface CompileResult {
    success: boolean;
    outputPath?: string;
    errors: CompileError[];
}

export interface EnvironmentCheckResult {
    ready: boolean;
    esbuild: {
        available: boolean;
        version?: string;
        path?: string;
        source?: string;
        error?: string;
    };
}

/**
 * @zh Cocos Creator UUID 压缩算法
 * @en Cocos Creator UUID compression algorithm
 *
 * Compresses a UUID like "b149f3a4-0e6b-4dc7-8221-05ab48903de7"
 * to a short ID like "b149fOkDmtNx4IhBatIkD3n"
 *
 * Algorithm:
 * - First 5 hex chars stay as-is (reservedHeadLength = 5)
 * - Remaining 27 hex chars are encoded as 18 base64 chars (3 hex -> 2 base64)
 * - Total: 5 + 18 = 23 characters
 */
const BASE64_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function compressUuid(uuid: string): string {
    // Remove dashes
    const hex = uuid.replace(/-/g, '');
    if (hex.length !== 32) return uuid;

    // First 5 hex chars are kept as-is
    const prefix = hex.substring(0, 5);
    const remaining = hex.substring(5); // 27 hex chars

    // Encode remaining 27 hex chars as base64 (3 hex -> 2 base64)
    // This produces 18 base64 chars (27 / 3 * 2 = 18)
    let result = prefix;
    for (let i = 0; i < remaining.length; i += 3) {
        const h0 = parseInt(remaining[i] || '0', 16);
        const h1 = parseInt(remaining[i + 1] || '0', 16);
        const h2 = i + 2 < remaining.length ? parseInt(remaining[i + 2] || '0', 16) : 0;

        // Encode 3 hex nibbles (12 bits) into 2 base64 chars (12 bits)
        const b0 = (h0 << 2) | (h1 >> 2);
        const b1 = ((h1 & 3) << 4) | h2;

        result += BASE64_KEYS[b0] || '';
        result += BASE64_KEYS[b1] || '';
    }

    return result;
}

/**
 * @zh 用户脚本编译器实现
 * @en User Script Compiler Implementation
 */
class UserScriptCompilerImpl {
    private bundledCode: string | null = null;
    private outputPath: string | null = null;
    private isCompiling = false;
    private classIdMapping: Map<string, string> = new Map();

    /**
     * @zh 检查 esbuild 环境是否可用
     * @en Check if esbuild environment is available
     */
    async checkEnvironment(projectPath: string): Promise<EnvironmentCheckResult> {
        try {
            const result = await invoke<EnvironmentCheckResult>('check_environment');
            return result;
        } catch (error) {
            return {
                ready: false,
                esbuild: {
                    available: false,
                    error: String(error),
                },
            };
        }
    }

    /**
     * @zh 安装 esbuild 到项目
     * @en Install esbuild to project
     */
    async installEsbuild(): Promise<boolean> {
        try {
            await invoke('install_esbuild');
            return true;
        } catch (error) {
            console.error('[UserScriptCompiler] Failed to install esbuild:', error);
            return false;
        }
    }

    /**
     * @zh 找到项目入口文件
     * @en Find project entry file
     */
    async findEntryFile(projectPath: string): Promise<string | null> {
        // Cocos 项目可能的入口文件
        const possibleEntries = [
            `${projectPath}/assets/scripts/main.ts`,
            `${projectPath}/assets/scripts/Main.ts`,
            `${projectPath}/assets/scripts/game.ts`,
            `${projectPath}/assets/scripts/Game.ts`,
            `${projectPath}/assets/scripts/index.ts`,
            `${projectPath}/assets/Script/main.ts`,
            `${projectPath}/assets/Script/Main.ts`,
            `${projectPath}/assets/script/main.ts`,
            `${projectPath}/assets/main.ts`,
        ];

        for (const entry of possibleEntries) {
            try {
                const exists = await invoke<boolean>('path_exists', { path: entry });
                if (exists) {
                    return entry;
                }
            } catch {
                // Continue to next
            }
        }

        // 如果没有找到标准入口，扫描目录找第一个 .ts 文件
        const scriptDirs = [
            `${projectPath}/assets/scripts`,
            `${projectPath}/assets/Scripts`,
            `${projectPath}/assets/script`,
            `${projectPath}/assets`,
        ];

        for (const dir of scriptDirs) {
            try {
                const entries = await invoke<Array<{
                    name: string;
                    path: string;
                    is_dir: boolean;
                }>>('list_directory', { path: dir });

                for (const entry of entries) {
                    if (!entry.is_dir && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
                        return entry.path;
                    }
                }
            } catch {
                // Directory doesn't exist
            }
        }

        return null;
    }

    /**
     * @zh 创建虚拟入口文件，导入所有脚本
     * @en Create virtual entry file that imports all scripts
     */
    async createVirtualEntry(projectPath: string): Promise<string | null> {
        // 扫描所有 .ts 文件
        const scriptFiles: string[] = [];
        const scriptDirs = [
            `${projectPath}/assets/scripts`,
            `${projectPath}/assets/Scripts`,
            `${projectPath}/assets/script`,
        ];

        for (const dir of scriptDirs) {
            try {
                const files = await this.scanTsFiles(dir);
                scriptFiles.push(...files);
                if (files.length > 0) break;
            } catch {
                // Continue
            }
        }

        if (scriptFiles.length === 0) {
            return null;
        }

        // 创建虚拟入口内容
        const imports = scriptFiles
            .map((file, index) => `import './${this.relativePath(projectPath, file)}';`)
            .join('\n');

        // 写入临时入口文件
        const entryPath = `${projectPath}/.esengine-entry.ts`;
        await invoke('write_file_content', {
            path: entryPath,
            content: `// Auto-generated entry file\n${imports}\n`,
        });

        return entryPath;
    }

    private relativePath(base: string, file: string): string {
        // 简单的相对路径计算
        const normalizedBase = base.replace(/\\/g, '/');
        const normalizedFile = file.replace(/\\/g, '/');
        if (normalizedFile.startsWith(normalizedBase)) {
            return normalizedFile.substring(normalizedBase.length + 1);
        }
        return normalizedFile;
    }

    /**
     * @zh 转换 cc 模块引用为全局访问
     * @en Transform cc module references to global access
     *
     * IIFE 格式下，esbuild 在打包代码内部定义了自己的 __require 函数，
     * 这个函数会遮蔽 globalThis.__require，所以我们需要直接在代码中替换。
     *
     * For IIFE format, esbuild defines its own __require function inside the bundle
     * which shadows globalThis.__require, so we need to directly replace in code.
     */
    private transformCcImports(code: string): string {
        let transformed = code;

        // IIFE 格式下，esbuild 生成的代码会有这些模式：
        // 1. __toESM(__require("cc")) - 带 ESM 转换
        // 2. __require("cc") - 直接 require
        // 3. require("cc") - 标准 require
        //
        // 我们需要将它们全部替换为 globalThis.cc

        // 替换 __toESM(__require("cc")) 或 __toESM(require("cc"))
        // 这是 esbuild 用于将 CommonJS 转换为 ESM 的模式
        transformed = transformed.replace(
            /__toESM\(\s*(?:__require|require)\s*\(\s*["']cc["']\s*\)\s*\)/g,
            'globalThis.cc'
        );

        // 替换 __require("cc") 或 __require('cc')
        transformed = transformed.replace(
            /__require\s*\(\s*["']cc["']\s*\)/g,
            'globalThis.cc'
        );

        // 替换 require("cc") 或 require('cc')
        transformed = transformed.replace(
            /\brequire\s*\(\s*["']cc["']\s*\)/g,
            'globalThis.cc'
        );

        // 也处理 ESM-style imports（如果有的话，IIFE 格式通常不会有）
        // Replace import { X } from "cc" -> const { X } = globalThis.cc
        const importRegex = /import\s*\{([^}]+)\}\s*from\s*["']cc["'];?/g;
        transformed = transformed.replace(importRegex, (match, imports) => {
            return `const { ${imports.trim()} } = globalThis.cc;`;
        });

        // Replace import * as X from "cc" -> const X = globalThis.cc
        const namespaceRegex = /import\s*\*\s*as\s+(\w+)\s+from\s*["']cc["'];?/g;
        transformed = transformed.replace(namespaceRegex, (match, name) => {
            return `const ${name} = globalThis.cc;`;
        });

        // Replace import X from "cc" -> const X = globalThis.cc
        const defaultRegex = /import\s+(\w+)\s+from\s*["']cc["'];?/g;
        transformed = transformed.replace(defaultRegex, (match, name) => {
            return `const ${name} = globalThis.cc;`;
        });

        return transformed;
    }

    private async scanTsFiles(dir: string): Promise<string[]> {
        const files: string[] = [];
        try {
            const entries = await invoke<Array<{
                name: string;
                path: string;
                is_dir: boolean;
            }>>('list_directory', { path: dir });

            for (const entry of entries) {
                if (entry.is_dir) {
                    if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'build') {
                        const subFiles = await this.scanTsFiles(entry.path);
                        files.push(...subFiles);
                    }
                } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
                    files.push(entry.path);
                }
            }
        } catch {
            // Directory doesn't exist
        }
        return files;
    }

    /**
     * @zh 从 .ts.meta 文件构建类 ID 映射
     * @en Build class ID mapping from .ts.meta files
     *
     * Scans meta files to get script UUIDs and maps compressed UUIDs to class names
     */
    async buildClassIdMapping(projectPath: string): Promise<Map<string, string>> {
        this.classIdMapping.clear();

        const scriptDirs = [
            `${projectPath}/assets/scripts`,
            `${projectPath}/assets/Scripts`,
            `${projectPath}/assets/script`,
        ];

        for (const dir of scriptDirs) {
            await this.scanMetaFiles(dir);
        }

        return this.classIdMapping;
    }

    private async scanMetaFiles(dir: string): Promise<void> {
        try {
            const entries = await invoke<Array<{
                name: string;
                path: string;
                is_dir: boolean;
            }>>('list_directory', { path: dir });

            for (const entry of entries) {
                if (entry.is_dir) {
                    if (entry.name !== 'node_modules' && entry.name !== '.git') {
                        await this.scanMetaFiles(entry.path);
                    }
                } else if (entry.name.endsWith('.ts.meta')) {
                    await this.processMetaFile(entry.path);
                }
            }
        } catch {
            // Directory doesn't exist
        }
    }

    private async processMetaFile(metaPath: string): Promise<void> {
        try {
            const content = await invoke<string>('read_file_content', { path: metaPath });
            const meta = JSON.parse(content);

            if (meta.uuid) {
                // Get class name from file path
                // e.g., LoginView.ts.meta -> LoginView
                const fileName = metaPath.replace(/\\/g, '/').split('/').pop() || '';
                const className = fileName.replace('.ts.meta', '');

                // Compress UUID to get the type ID
                const typeId = compressUuid(meta.uuid);

                this.classIdMapping.set(typeId, className);

                // Also try with slightly different compression (Cocos uses different variants)
                // Store reverse mapping too
            }
        } catch (error) {
            // Skip invalid meta files
        }
    }

    /**
     * @zh 获取类 ID 映射
     * @en Get class ID mapping
     */
    getClassIdMapping(): Map<string, string> {
        return this.classIdMapping;
    }

    /**
     * @zh 编译项目
     * @en Compile project
     */
    async compileProject(projectPath: string): Promise<{
        success: boolean;
        compiledCount: number;
        failedCount: number;
        errors: string[];
    }> {
        if (this.isCompiling) {
            return {
                success: false,
                compiledCount: 0,
                failedCount: 0,
                errors: ['Compilation already in progress'],
            };
        }

        this.isCompiling = true;
        this.bundledCode = null;

        try {
            // 1. 检查 esbuild 环境
            const env = await this.checkEnvironment(projectPath);
            if (!env.ready || !env.esbuild.available) {
                const installed = await this.installEsbuild();
                if (!installed) {
                    return {
                        success: false,
                        compiledCount: 0,
                        failedCount: 0,
                        errors: ['Failed to install esbuild. Please run: npm install -g esbuild'],
                    };
                }
            } else {
            }

            // 2. 找到或创建入口文件
            let entryFile = await this.findEntryFile(projectPath);

            if (!entryFile) {
                // 创建虚拟入口
                entryFile = await this.createVirtualEntry(projectPath);
                if (!entryFile) {
                    return {
                        success: true,
                        compiledCount: 0,
                        failedCount: 0,
                        errors: [],
                    };
                }
            }

            // 3. 使用 esbuild 打包
            const outputPath = `${projectPath}/.esengine-bundle.js`;

            // Use IIFE format to avoid ES module import/export issues in dynamic injection
            // IIFE wraps everything in a self-executing function, no import/export statements
            const result = await invoke<CompileResult>('compile_typescript', {
                options: {
                    entryPath: entryFile,
                    outputPath: outputPath,
                    format: 'iife',
                    globalName: '__esengine_usercode__',
                    sourceMap: false,
                    minify: false,
                    // 将 cc 模块标记为外部，由 ccesengine 提供
                    external: ['cc'],
                    projectRoot: projectPath,
                },
            });

            if (!result.success) {
                const errors = result.errors.map(e =>
                    e.file ? `${e.file}:${e.line}:${e.column}: ${e.message}` : e.message
                );
                return {
                    success: false,
                    compiledCount: 0,
                    failedCount: 1,
                    errors,
                };
            }

            // 4. 读取打包后的代码
            let bundledCode = await invoke<string>('read_file_content', { path: outputPath });

            // 5. 后处理：将 cc 模块导入转换为全局访问
            // esbuild 标记 cc 为 external，所以代码中有 import ... from "cc"
            // 我们需要将其转换为从 globalThis.cc 获取
            const beforeMatches = bundledCode.match(/__require\s*\(\s*["']cc["']\s*\)/g) || [];

            bundledCode = this.transformCcImports(bundledCode);

            const afterMatches = bundledCode.match(/__require\s*\(\s*["']cc["']\s*\)/g) || [];

            // 验证 globalThis.cc 替换
            const globalCcCount = (bundledCode.match(/globalThis\.cc/g) || []).length;

            this.bundledCode = bundledCode;
            this.outputPath = outputPath;

            // 6. 构建类 ID 映射（用于场景反序列化）
            await this.buildClassIdMapping(projectPath);


            return {
                success: true,
                compiledCount: 1,
                failedCount: 0,
                errors: [],
            };
        } finally {
            this.isCompiling = false;
        }
    }

    /**
     * @zh 将编译后的代码注入到全局环境
     * @en Inject compiled code into global environment
     */
    async injectCompiledModules(): Promise<{
        success: boolean;
        injectedCount: number;
        errors: string[];
    }> {
        if (!this.bundledCode) {
            return {
                success: true,
                injectedCount: 0,
                errors: [],
            };
        }

        const errors: string[] = [];

        try {
            // For IIFE format, execute via script tag (synchronous, better error messages)
            const script = document.createElement('script');
            script.type = 'text/javascript';

            // Wrap in try-catch for better error reporting
            const wrappedCode = `
try {
${this.bundledCode}
} catch (e) {
    console.error('[UserScriptCompiler] Runtime error in user code:', e);
    throw e;
}
`;
            script.textContent = wrappedCode;

            // Execute synchronously by appending to document
            document.head.appendChild(script);
            document.head.removeChild(script);

            // Register class ID mappings with Cocos
            this.registerClassIdMappings();


            return {
                success: true,
                injectedCount: 1,
                errors: [],
            };
        } catch (error) {
            const errorMsg = `Failed to inject bundle: ${error}`;
            errors.push(errorMsg);
            console.error(`[UserScriptCompiler] ${errorMsg}`);

            // Log first 500 chars of bundle for debugging
            if (this.bundledCode) {
                console.error('[UserScriptCompiler] Bundle preview:', this.bundledCode.substring(0, 500));
            }

            return {
                success: false,
                injectedCount: 0,
                errors,
            };
        }
    }

    /**
     * @zh 将类 ID 映射注册到 Cocos 运行时
     * @en Register class ID mappings with Cocos runtime
     *
     * This allows Cocos deserializer to find user classes by their compressed UUID.
     *
     * Note: Only classes decorated with @ccclass can be found via getClassByName.
     * ESEngine ECS components (using @ECSComponent) or plain classes will not be found,
     * which is expected - they don't need to be registered with Cocos deserializer.
     */
    private registerClassIdMappings(): void {
        if (this.classIdMapping.size === 0) {
            return;
        }

        const cc = (globalThis as Record<string, unknown>).cc as {
            js?: {
                getClassByName?: (name: string) => unknown;
                _setClassId?: (id: string, constructor: unknown) => void;
                _registeredClassIds?: Record<string, unknown>;
            };
        } | undefined;

        if (!cc?.js) {
            return;
        }

        let registered = 0;
        let skipped = 0;
        const registeredClasses: string[] = [];

        for (const [typeId, className] of this.classIdMapping.entries()) {
            try {
                // Get the class constructor by name
                // Only @ccclass decorated classes will be found
                const classConstructor = cc.js.getClassByName?.(className);

                if (classConstructor) {
                    // Register the class with its compressed UUID as an alias
                    if (cc.js._setClassId) {
                        cc.js._setClassId(typeId, classConstructor);
                        registered++;
                        registeredClasses.push(className);
                    } else if (cc.js._registeredClassIds) {
                        // Alternative: directly set in the registry
                        cc.js._registeredClassIds[typeId] = classConstructor;
                        registered++;
                        registeredClasses.push(className);
                    }
                } else {
                    // This is expected for non-@ccclass classes (ECS components, services, etc.)
                    // Don't warn, just count them
                    skipped++;
                }
            } catch (error) {
            }
        }

        if (registered > 0) {
        }
        if (skipped > 0) {
        }
    }

    /**
     * @zh 清除编译缓存
     * @en Clear compiled cache
     */
    async clearCache(): Promise<void> {
        this.bundledCode = null;
        this.classIdMapping.clear();

        // 清理临时文件
        if (this.outputPath) {
            try {
                await invoke('delete_file', { path: this.outputPath });
            } catch {
                // Ignore
            }
            this.outputPath = null;
        }
    }
}

// 单例
let instance: UserScriptCompilerImpl | null = null;

export function getUserScriptCompiler(): UserScriptCompilerImpl {
    if (!instance) {
        instance = new UserScriptCompilerImpl();
    }
    return instance;
}

export type UserScriptCompiler = UserScriptCompilerImpl;
