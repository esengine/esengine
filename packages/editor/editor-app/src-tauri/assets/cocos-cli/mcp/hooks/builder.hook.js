"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderHook = void 0;
const zod_1 = require("zod");
const path_1 = require("path");
const fs_1 = require("fs");
const schema_1 = require("../../api/builder/schema");
class BuilderHook {
    dynamicPlatforms = [];
    constructor() {
        this.scanPlatformPackages();
    }
    /**
     * 扫描 packages/platforms 目录下的平台插件
     */
    scanPlatformPackages() {
        const platforms = [];
        const platformsDir = (0, path_1.resolve)(__dirname, '../../../packages/platforms');
        if (!(0, fs_1.existsSync)(platformsDir)) {
            this.dynamicPlatforms = platforms;
            return;
        }
        try {
            const dirs = (0, fs_1.readdirSync)(platformsDir);
            for (const dir of dirs) {
                const pkgJsonPath = (0, path_1.join)(platformsDir, dir, 'package.json');
                if ((0, fs_1.existsSync)(pkgJsonPath)) {
                    try {
                        const pkgContent = JSON.parse((0, fs_1.readFileSync)(pkgJsonPath, 'utf-8'));
                        // 检查是否是平台插件 (contributes.builder.register === true)
                        if (pkgContent?.contributes?.builder?.register === true) {
                            // 优先使用 contributes.builder.platform，如果没有则使用 package.name
                            const platformName = pkgContent.contributes.builder.platform || pkgContent.name;
                            if (platformName) {
                                platforms.push(platformName);
                            }
                        }
                    }
                    catch (e) {
                        console.warn(`Failed to parse package.json for ${dir}:`, e);
                    }
                }
            }
        }
        catch (e) {
            console.error('Failed to scan platform packages:', e);
        }
        this.dynamicPlatforms = platforms;
    }
    onRegisterParam(toolName, param, inputSchemaFields) {
        if (toolName !== 'builder-build')
            return;
        const knownPlatforms = ['web-desktop', 'web-mobile', 'android', 'ios', 'windows', 'mac'];
        // 合并去重
        const allPlatforms = Array.from(new Set([...knownPlatforms, ...this.dynamicPlatforms]));
        const platformDesc = `Platform Identifier (e.g., ${allPlatforms.join(', ')})`;
        if (param.name === 'options') {
            inputSchemaFields[param.name] = zod_1.z.any();
            // 动态构建 SchemaBuildOption
            const dynamicSchemas = this.dynamicPlatforms.map(platform => {
                return schema_1.SchemaBuildBaseOption.extend({
                    platform: zod_1.z.literal(platform).describe('Build platform'),
                    packages: zod_1.z.object({
                        [platform]: zod_1.z.any().optional().describe(`${platform} platform specific configuration`)
                    }).optional().describe(`${platform} platform specific configuration`)
                }).describe(`${platform} complete build options`);
            });
            const newSchema = zod_1.z.discriminatedUnion('platform', [
                ...schema_1.SchemaKnownBuildOptions,
                ...dynamicSchemas,
                schema_1.SchemaOtherPlatformBuildOption
            ]).default({}).describe('Build options (with platform preprocessing)');
            // 更新原始 meta 中的 schema，以便 list handler 使用
            param.schema = newSchema;
        }
        else if (param.name === 'platform') {
            // 动态更新 platform 参数的描述，包含扫描到的平台
            const newPlatformSchema = param.schema.describe(platformDesc);
            inputSchemaFields[param.name] = newPlatformSchema;
            param.schema = newPlatformSchema;
        }
    }
    onBeforeExecute(toolName, args) {
        if (toolName !== 'builder-build')
            return;
        if (!args.options) {
            args.options = {};
        }
        // 处理 configPath
        let options = args.options;
        if (options.configPath) {
            const configPath = options.configPath;
            if ((0, fs_1.existsSync)(configPath)) {
                try {
                    const fileContent = JSON.parse((0, fs_1.readFileSync)(configPath, 'utf-8'));
                    // 合并配置，args.options 优先级高于配置文件
                    options = args.options = {
                        ...fileContent,
                        ...options
                    };
                    // 删除 configPath 字段
                    delete options.configPath;
                }
                catch (e) {
                    console.warn(`Failed to load config file: ${configPath}`, e);
                }
            }
        }
        if (typeof options === 'object') {
            if (!options.platform) {
                // 注入 platform
                options.platform = args.platform;
            }
            // sourceMaps exported by CocosEditor is a string, so need to convert it to boolean
            if (options.sourceMaps && typeof options.sourceMaps !== 'boolean') {
                if (options.sourceMaps === 'true') {
                    options.sourceMaps = true;
                }
                else if (options.sourceMaps === 'false') {
                    options.sourceMaps = false;
                }
            }
        }
    }
    onValidationFailed(toolName, paramName, error) {
        if (toolName === 'builder-build') {
            throw new Error(`Parameter validation failed for ${paramName}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.BuilderHook = BuilderHook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRlci5ob29rLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21jcC9ob29rcy9idWlsZGVyLmhvb2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQXdCO0FBQ3hCLCtCQUFxQztBQUNyQywyQkFBMkQ7QUFDM0QscURBQTBIO0FBRTFILE1BQWEsV0FBVztJQUNaLGdCQUFnQixHQUFhLEVBQUUsQ0FBQztJQUV4QztRQUNJLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7T0FFRztJQUNLLG9CQUFvQjtRQUN4QixNQUFNLFNBQVMsR0FBYSxFQUFFLENBQUM7UUFDL0IsTUFBTSxZQUFZLEdBQUcsSUFBQSxjQUFPLEVBQUMsU0FBUyxFQUFFLDZCQUE2QixDQUFDLENBQUM7UUFFdkUsSUFBSSxDQUFDLElBQUEsZUFBVSxFQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztZQUNsQyxPQUFPO1FBQ1gsQ0FBQztRQUVELElBQUksQ0FBQztZQUNELE1BQU0sSUFBSSxHQUFHLElBQUEsZ0JBQVcsRUFBQyxZQUFZLENBQUMsQ0FBQztZQUN2QyxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNyQixNQUFNLFdBQVcsR0FBRyxJQUFBLFdBQUksRUFBQyxZQUFZLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLElBQUEsZUFBVSxFQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7b0JBQzFCLElBQUksQ0FBQzt3QkFDRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUEsaUJBQVksRUFBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQzt3QkFDbEUsb0RBQW9EO3dCQUNwRCxJQUFJLFVBQVUsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLFFBQVEsS0FBSyxJ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T0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ3JDLENBQUM7WUFFRCxtRkFBbUY7WUFDbkYsSUFBSSxPQUFPLENBQUMsVUFBVSxJQUFJLE9BQU8sT0FBTyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDaEUsSUFBSSxPQUFPLENBQUMsVUFBVSxLQUFLLE1BQU0sRUFBRSxDQUFDO29CQUNoQyxPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztnQkFDOUIsQ0FBQztxQkFBTSxJQUFJLE9BQU8sQ0FBQyxVQUFVLEtBQUssT0FBTyxFQUFFLENBQUM7b0JBQ3hDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO2dCQUMvQixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRU0sa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLEtBQVU7UUFDckUsSUFBSSxRQUFRLEtBQUssZUFBZSxFQUFFLENBQUM7WUFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsU0FBUyxLQUFLLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0gsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQXRJRCxrQ0FzSUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcclxuaW1wb3J0IHsgam9pbiwgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkZGlyU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBTY2hlbWFCdWlsZEJhc2VPcHRpb24sIFNjaGVtYUtub3duQnVpbGRPcHRpb25zLCBTY2hlbWFPdGhlclBsYXRmb3JtQnVpbGRPcHRpb24gfSBmcm9tICcuLi8uLi9hcGkvYnVpbGRlci9zY2hlbWEnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJ1aWxkZXJIb29rIHtcclxuICAgIHByaXZhdGUgZHluYW1pY1BsYXRmb3Jtczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnNjYW5QbGF0Zm9ybVBhY2thZ2VzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmiavmj48gcGFja2FnZXMvcGxhdGZvcm1zIOebruW9leS4i+eahOW5s+WPsOaPkuS7tlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHNjYW5QbGF0Zm9ybVBhY2thZ2VzKCkge1xyXG4gICAgICAgIGNvbnN0IHBsYXRmb3Jtczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBjb25zdCBwbGF0Zm9ybXNEaXIgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uLy4uL3BhY2thZ2VzL3BsYXRmb3JtcycpO1xyXG5cclxuICAgICAgICBpZiAoIWV4aXN0c1N5bmMocGxhdGZvcm1zRGlyKSkge1xyXG4gICAgICAgICAgICB0aGlzLmR5bmFtaWNQbGF0Zm9ybXMgPSBwbGF0Zm9ybXM7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRpcnMgPSByZWFkZGlyU3luYyhwbGF0Zm9ybXNEaXIpO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGRpciBvZiBkaXJzKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwa2dKc29uUGF0aCA9IGpvaW4ocGxhdGZvcm1zRGlyLCBkaXIsICdwYWNrYWdlLmpzb24nKTtcclxuICAgICAgICAgICAgICAgIGlmIChleGlzdHNTeW5jKHBrZ0pzb25QYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBrZ0NvbnRlbnQgPSBKU09OLnBhcnNlKHJlYWRGaWxlU3luYyhwa2dKc29uUGF0aCwgJ3V0Zi04JykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmo4Dmn6XmmK/lkKbmmK/lubPlj7Dmj5Lku7YgKGNvbnRyaWJ1dGVzLmJ1aWxkZXIucmVnaXN0ZXIgPT09IHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwa2dDb250ZW50Py5jb250cmlidXRlcz8uYnVpbGRlcj8ucmVnaXN0ZXIgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOS8mOWFiOS9v+eUqCBjb250cmlidXRlcy5idWlsZGVyLnBsYXRmb3Jt77yM5aaC5p6c5rKh5pyJ5YiZ5L2/55SoIHBhY2thZ2UubmFtZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGxhdGZvcm1OYW1lID0gcGtnQ29udGVudC5jb250cmlidXRlcy5idWlsZGVyLnBsYXRmb3JtIHx8IHBrZ0NvbnRlbnQubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbGF0Zm9ybU5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF0Zm9ybXMucHVzaChwbGF0Zm9ybU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBwYXJzZSBwYWNrYWdlLmpzb24gZm9yICR7ZGlyfTpgLCBlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzY2FuIHBsYXRmb3JtIHBhY2thZ2VzOicsIGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5keW5hbWljUGxhdGZvcm1zID0gcGxhdGZvcm1zO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvblJlZ2lzdGVyUGFyYW0odG9vbE5hbWU6IHN0cmluZywgcGFyYW06IGFueSwgaW5wdXRTY2hlbWFGaWVsZHM6IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcclxuICAgICAgICBpZiAodG9vbE5hbWUgIT09ICdidWlsZGVyLWJ1aWxkJykgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBrbm93blBsYXRmb3JtcyA9IFsnd2ViLWRlc2t0b3AnLCAnd2ViLW1vYmlsZScsICdhbmRyb2lkJywgJ2lvcycsICd3aW5kb3dzJywgJ21hYyddO1xyXG4gICAgICAgIC8vIOWQiOW5tuWOu+mHjVxyXG4gICAgICAgIGNvbnN0IGFsbFBsYXRmb3JtcyA9IEFycmF5LmZyb20obmV3IFNldChbLi4ua25vd25QbGF0Zm9ybXMsIC4uLnRoaXMuZHluYW1pY1BsYXRmb3Jtc10pKTtcclxuICAgICAgICBjb25zdCBwbGF0Zm9ybURlc2MgPSBgUGxhdGZvcm0gSWRlbnRpZmllciAoZS5nLiwgJHthbGxQbGF0Zm9ybXMuam9pbignLCAnKX0pYDtcclxuXHJcbiAgICAgICAgaWYgKHBhcmFtLm5hbWUgPT09ICdvcHRpb25zJykge1xyXG4gICAgICAgICAgICBpbnB1dFNjaGVtYUZpZWxkc1twYXJhbS5uYW1lXSA9IHouYW55KCk7XHJcblxyXG4gICAgICAgICAgICAvLyDliqjmgIHmnoTlu7ogU2NoZW1hQnVpbGRPcHRpb25cclxuICAgICAgICAgICAgY29uc3QgZHluYW1pY1NjaGVtYXMgPSB0aGlzLmR5bmFtaWNQbGF0Zm9ybXMubWFwKHBsYXRmb3JtID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBTY2hlbWFCdWlsZEJhc2VPcHRpb24uZXh0ZW5kKHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF0Zm9ybTogei5saXRlcmFsKHBsYXRmb3JtKS5kZXNjcmliZSgnQnVpbGQgcGxhdGZvcm0nKSxcclxuICAgICAgICAgICAgICAgICAgICBwYWNrYWdlczogei5vYmplY3Qoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBbcGxhdGZvcm1dOiB6LmFueSgpLm9wdGlvbmFsKCkuZGVzY3JpYmUoYCR7cGxhdGZvcm19IHBsYXRmb3JtIHNwZWNpZmljIGNvbmZpZ3VyYXRpb25gKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pLm9wdGlvbmFsKCkuZGVzY3JpYmUoYCR7cGxhdGZvcm19IHBsYXRmb3JtIHNwZWNpZmljIGNvbmZpZ3VyYXRpb25gKVxyXG4gICAgICAgICAgICAgICAgfSkuZGVzY3JpYmUoYCR7cGxhdGZvcm19IGNvbXBsZXRlIGJ1aWxkIG9wdGlvbnNgKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBuZXdTY2hlbWEgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigncGxhdGZvcm0nLCBbXHJcbiAgICAgICAgICAgICAgICAuLi5TY2hlbWFLbm93bkJ1aWxkT3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIC4uLmR5bmFtaWNTY2hlbWFzLFxyXG4gICAgICAgICAgICAgICAgU2NoZW1hT3RoZXJQbGF0Zm9ybUJ1aWxkT3B0aW9uXHJcbiAgICAgICAgICAgIF0gYXMgYW55KS5kZWZhdWx0KHt9KS5kZXNjcmliZSgnQnVpbGQgb3B0aW9ucyAod2l0aCBwbGF0Zm9ybSBwcmVwcm9jZXNzaW5nKScpO1xyXG5cclxuICAgICAgICAgICAgLy8g5pu05paw5Y6f5aeLIG1ldGEg5Lit55qEIHNjaGVtYe+8jOS7peS+vyBsaXN0IGhhbmRsZXIg5L2/55SoXHJcbiAgICAgICAgICAgIHBhcmFtLnNjaGVtYSA9IG5ld1NjaGVtYTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbS5uYW1lID09PSAncGxhdGZvcm0nKSB7XHJcbiAgICAgICAgICAgIC8vIOWKqOaAgeabtOaWsCBwbGF0Zm9ybSDlj4LmlbDnmoTmj4/ov7DvvIzljIXlkKvmiavmj4/liLDnmoTlubPlj7BcclxuICAgICAgICAgICAgY29uc3QgbmV3UGxhdGZvcm1TY2hlbWEgPSBwYXJhbS5zY2hlbWEuZGVzY3JpYmUocGxhdGZvcm1EZXNjKTtcclxuICAgICAgICAgICAgaW5wdXRTY2hlbWFGaWVsZHNbcGFyYW0ubmFtZV0gPSBuZXdQbGF0Zm9ybVNjaGVtYTtcclxuICAgICAgICAgICAgcGFyYW0uc2NoZW1hID0gbmV3UGxhdGZvcm1TY2hlbWE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkJlZm9yZUV4ZWN1dGUodG9vbE5hbWU6IHN0cmluZywgYXJnczogYW55KSB7XHJcbiAgICAgICAgaWYgKHRvb2xOYW1lICE9PSAnYnVpbGRlci1idWlsZCcpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYgKCFhcmdzLm9wdGlvbnMpIHtcclxuICAgICAgICAgICAgYXJncy5vcHRpb25zID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDlpITnkIYgY29uZmlnUGF0aFxyXG4gICAgICAgIGxldCBvcHRpb25zID0gYXJncy5vcHRpb25zO1xyXG4gICAgICAgIGlmIChvcHRpb25zLmNvbmZpZ1BhdGgpIHtcclxuICAgICAgICAgICAgY29uc3QgY29uZmlnUGF0aCA9IG9wdGlvbnMuY29uZmlnUGF0aDtcclxuICAgICAgICAgICAgaWYgKGV4aXN0c1N5bmMoY29uZmlnUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSBKU09OLnBhcnNlKHJlYWRGaWxlU3luYyhjb25maWdQYXRoLCAndXRmLTgnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5ZCI5bm26YWN572u77yMYXJncy5vcHRpb25zIOS8mOWFiOe6p+mrmOS6jumFjee9ruaWh+S7tlxyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBhcmdzLm9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLmZpbGVDb250ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5vcHRpb25zXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5Yig6ZmkIGNvbmZpZ1BhdGgg5a2X5q61XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnMuY29uZmlnUGF0aDtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBsb2FkIGNvbmZpZyBmaWxlOiAke2NvbmZpZ1BhdGh9YCwgZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLnBsYXRmb3JtKSB7XHJcbiAgICAgICAgICAgICAgICAvLyDms6jlhaUgcGxhdGZvcm1cclxuICAgICAgICAgICAgICAgIG9wdGlvbnMucGxhdGZvcm0gPSBhcmdzLnBsYXRmb3JtO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBzb3VyY2VNYXBzIGV4cG9ydGVkIGJ5IENvY29zRWRpdG9yIGlzIGEgc3RyaW5nLCBzbyBuZWVkIHRvIGNvbnZlcnQgaXQgdG8gYm9vbGVhblxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zb3VyY2VNYXBzICYmIHR5cGVvZiBvcHRpb25zLnNvdXJjZU1hcHMgIT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc291cmNlTWFwcyA9PT0gJ3RydWUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5zb3VyY2VNYXBzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5zb3VyY2VNYXBzID09PSAnZmFsc2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5zb3VyY2VNYXBzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uVmFsaWRhdGlvbkZhaWxlZCh0b29sTmFtZTogc3RyaW5nLCBwYXJhbU5hbWU6IHN0cmluZywgZXJyb3I6IGFueSkge1xyXG4gICAgICAgIGlmICh0b29sTmFtZSA9PT0gJ2J1aWxkZXItYnVpbGQnKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUGFyYW1ldGVyIHZhbGlkYXRpb24gZmFpbGVkIGZvciAke3BhcmFtTmFtZX06ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=