"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStaticCompileCheck = runStaticCompileCheck;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * 检测是否为 Windows 系统
 */
function isWindows() {
    return process.platform === 'win32';
}
/**
 * 获取平台特定的 shell
 */
function getShell() {
    if (isWindows()) {
        return 'cmd.exe';
    }
    // macOS/Linux 使用默认 shell
    return undefined;
}
/**
 * 过滤 TypeScript 错误输出，只保留包含 "assets" 的错误
 * 智能识别错误块，保留属于 assets 文件的完整错误信息
 */
function filterAssetsErrors(output) {
    if (!output) {
        return '';
    }
    // 统一换行符
    const lines = output.replace(/\r\n/g, '\n').split('\n');
    const filteredLines = [];
    let isAssetError = false; // 标记当前是否在处理一个 assets 相关的错误块
    // 正则匹配 TypeScript 错误行
    // 格式 1: filename(line,col): error TSxxxx: message
    // 格式 2: filename:line:col - error TSxxxx: message
    // 注意：文件名可能包含路径分隔符
    const errorStartRegex = /^(.+?)[(:]\d+[,:]\d+[):]?\s*(?:-\s*)?(?:error|warning)\s+TS\d+:/;
    for (const line of lines) {
        // 跳过空行，避免打断错误块
        if (!line.trim()) {
            continue;
        }
        const match = line.match(errorStartRegex);
        if (match) {
            // 这是一个新的错误行
            const filename = match[1].trim();
            // 检查文件名是否包含 assets
            // 使用宽松的匹配，只要路径中包含 assets 即可
            if (filename.toLowerCase().includes('assets')) {
                isAssetError = true;
                filteredLines.push(line);
            }
            else {
                isAssetError = false;
            }
        }
        else {
            // 不是新的错误行（可能是错误详情、代码上下文等）
            if (isAssetError) {
                // 如果当前处于 assets 错误块中，保留该行
                filteredLines.push(line);
            }
            else if (line.toLowerCase().includes('assets') && (line.includes('error TS') || line.includes('warning TS'))) {
                // 兜底：如果行本身包含 assets 且看起来像是一个错误，保留该行并开启错误块
                // 这可以处理正则未匹配到但确实是 assets 错误的情况
                isAssetError = true;
                filteredLines.push(line);
            }
        }
    }
    return filteredLines.join('\n').trim();
}
/**
 * 执行静态编译检查
 * @param projectPath 项目路径
 * @param showOutput 是否显示输出信息（默认 true）
 * @returns 返回对象，包含检查结果和错误信息。passed 为 true 表示检查通过（没有 assets 相关错误），false 表示有错误
 */
async function runStaticCompileCheck(projectPath, showOutput = true) {
    if (showOutput) {
        console.log(chalk_1.default.blue('Running TypeScript static compile check...'));
        console.log(chalk_1.default.gray(`Project: ${projectPath}`));
        console.log('');
    }
    // 切换到项目目录并执行命令
    // 使用 2>&1 将 stderr 合并到 stdout，避免流写入冲突导致的乱序
    const command = `npx tsc --noEmit 2>&1"`;
    const shell = getShell();
    try {
        const execOptions = {
            cwd: projectPath,
            maxBuffer: 20 * 1024 * 1024, // 增加 buffer 大小到 20MB
            env: {
                ...process.env,
                CI: 'true', // 告诉工具我们在 CI 环境中，避免交互式输出
                FORCE_COLOR: '0', // 禁用颜色输出，避免控制字符干扰解析
            }
        };
        if (shell) {
            execOptions.shell = shell;
        }
        // 只读取 stdout，因为 stderr 已经合并进去了
        const { stdout } = await execAsync(command, execOptions);
        const output = String(stdout || '').trim();
        if (!output) {
            // 没有输出，说明编译成功
            if (showOutput) {
                console.log(chalk_1.default.green('✓ No assets-related TypeScript errors found!'));
            }
            return { passed: true };
        }
        // 过滤出包含 "assets" 的错误
        const filteredOutput = filterAssetsErrors(output);
        if (filteredOutput) {
            // 有 assets 相关的错误
            if (showOutput) {
                console.error(filteredOutput);
            }
            return { passed: false, errorMessage: filteredOutput };
        }
        else {
            // 没有 assets 相关的错误
            if (showOutput) {
                console.log(chalk_1.default.green('✓ No assets-related TypeScript errors found!'));
            }
            return { passed: true };
        }
    }
    catch (error) {
        // execAsync 在命令返回非零退出码时会抛出错误
        // tsc 如果有错误会返回非零退出码，这是正常的
        // 合并 stdout 和 stderr (虽然我们使用了 2>&1，但如果 execAsync 捕获到了 stderr 也要处理)
        const errorStdout = String(error.stdout || '').trim();
        const errorStderr = String(error.stderr || '').trim();
        const fullOutput = (errorStdout + (errorStdout && errorStderr ? '\n' : '') + errorStderr).trim();
        if (!fullOutput) {
            // 没有输出，说明可能是其他错误（比如 tsc 命令不存在）
            if (showOutput) {
                console.log(chalk_1.default.green('✓ No assets-related TypeScript errors found!'));
            }
            return { passed: true };
        }
        // 过滤出包含 "assets" 的错误
        const filteredOutput = filterAssetsErrors(fullOutput);
        if (filteredOutput) {
            // 有 assets 相关的错误
            if (showOutput) {
                console.error(filteredOutput);
            }
            return { passed: false, errorMessage: filteredOutput };
        }
        else {
            // 没有 assets 相关的错误
            if (showOutput) {
                console.log(chalk_1.default.green('✓ No assets-related TypeScript errors found!'));
            }
            return { passed: true };
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljLWNvbXBpbGUtY2hlY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3dvcmtlci9idWlsZGVyL2Fzc2V0LWhhbmRsZXIvc2NyaXB0L3N0YXRpYy1jb21waWxlLWNoZWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBc0ZBLHNEQXdGQztBQTlLRCxrREFBMEI7QUFDMUIsaURBQXFDO0FBQ3JDLCtCQUFpQztBQUVqQyxNQUFNLFNBQVMsR0FBRyxJQUFBLGdCQUFTLEVBQUMsb0JBQUksQ0FBQyxDQUFDO0FBRWxDOztHQUVHO0FBQ0gsU0FBUyxTQUFTO0lBQ2QsT0FBTyxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQztBQUN4QyxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLFFBQVE7SUFDYixJQUFJLFNBQVMsRUFBRSxFQUFFLENBQUM7UUFDZCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBQ0QseUJBQXlCO0lBQ3pCLE9BQU8sU0FBUyxDQUFDO0FBQ3JCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGtCQUFrQixDQUFDLE1BQWM7SUFDdEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQsUUFBUTtJQUNSLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4RCxNQUFNLGFBQWEsR0FBYSxFQUFFLENBQUM7SUFDbkMsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsNEJBQTRCO0lBRXRELHNCQUFzQjtJQUN0QixrREFBa0Q7SUFDbEQsa0RBQWtEO0lBQ2xELGtCQUFrQjtJQUNsQixNQUFNLGVBQWUsR0FBRyxpRUFBaUUsQ0FBQztJQUUxRixLQUFLLE1BQU0sSUFBSSxJQUFJ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LENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWpHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLCtCQUErQjtZQUMvQixJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7WUFDN0UsQ0FBQztZQUNELE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVELHFCQUFxQjtRQUNyQixNQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV0RCxJQUFJLGNBQWMsRUFBRSxDQUFDO1lBQ2pCLGlCQUFpQjtZQUNqQixJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDbEMsQ0FBQztZQUNELE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsQ0FBQztRQUMzRCxDQUFDO2FBQU0sQ0FBQztZQUNKLGtCQUFrQjtZQUNsQixJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7WUFDN0UsQ0FBQztZQUNELE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFDNUIsQ0FBQztJQUNMLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJztcclxuaW1wb3J0IHsgZXhlYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xyXG5pbXBvcnQgeyBwcm9taXNpZnkgfSBmcm9tICd1dGlsJztcclxuXHJcbmNvbnN0IGV4ZWNBc3luYyA9IHByb21pc2lmeShleGVjKTtcclxuXHJcbi8qKlxyXG4gKiDmo4DmtYvmmK/lkKbkuLogV2luZG93cyDns7vnu59cclxuICovXHJcbmZ1bmN0aW9uIGlzV2luZG93cygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xyXG59XHJcblxyXG4vKipcclxuICog6I635Y+W5bmz5Y+w54m55a6a55qEIHNoZWxsXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRTaGVsbCgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgaWYgKGlzV2luZG93cygpKSB7XHJcbiAgICAgICAgcmV0dXJuICdjbWQuZXhlJztcclxuICAgIH1cclxuICAgIC8vIG1hY09TL0xpbnV4IOS9v+eUqOm7mOiupCBzaGVsbFxyXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIOi/h+a7pCBUeXBlU2NyaXB0IOmUmeivr+i+k+WHuu+8jOWPquS/neeVmeWMheWQqyBcImFzc2V0c1wiIOeahOmUmeivr1xyXG4gKiDmmbrog73or4bliKvplJnor6/lnZfvvIzkv53nlZnlsZ7kuo4gYXNzZXRzIOaWh+S7tueahOWujOaVtOmUmeivr+S/oeaBr1xyXG4gKi9cclxuZnVuY3Rpb24gZmlsdGVyQXNzZXRzRXJyb3JzKG91dHB1dDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmICghb3V0cHV0KSB7XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyDnu5/kuIDmjaLooYznrKZcclxuICAgIGNvbnN0IGxpbmVzID0gb3V0cHV0LnJlcGxhY2UoL1xcclxcbi9nLCAnXFxuJykuc3BsaXQoJ1xcbicpO1xyXG4gICAgY29uc3QgZmlsdGVyZWRMaW5lczogc3RyaW5nW10gPSBbXTtcclxuICAgIGxldCBpc0Fzc2V0RXJyb3IgPSBmYWxzZTsgLy8g5qCH6K6w5b2T5YmN5piv5ZCm5Zyo5aSE55CG5LiA5LiqIGFzc2V0cyDnm7jlhbPnmoTplJnor6/lnZdcclxuXHJcbiAgICAvLyDmraPliJnljLnphY0gVHlwZVNjcmlwdCDplJnor6/ooYxcclxuICAgIC8vIOagvOW8jyAxOiBmaWxlbmFtZShsaW5lLGNvbCk6IGVycm9yIFRTeHh4eDogbWVzc2FnZVxyXG4gICAgLy8g5qC85byPIDI6IGZpbGVuYW1lOmxpbmU6Y29sIC0gZXJyb3IgVFN4eHh4OiBtZXNzYWdlXHJcbiAgICAvLyDms6jmhI/vvJrmlofku7blkI3lj6/og73ljIXlkKvot6/lvoTliIbpmpTnrKZcclxuICAgIGNvbnN0IGVycm9yU3RhcnRSZWdleCA9IC9eKC4rPylbKDpdXFxkK1ssOl1cXGQrWyk6XT9cXHMqKD86LVxccyopPyg/OmVycm9yfHdhcm5pbmcpXFxzK1RTXFxkKzovO1xyXG4gICAgXHJcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcclxuICAgICAgICAvLyDot7Pov4fnqbrooYzvvIzpgb/lhY3miZPmlq3plJnor6/lnZdcclxuICAgICAgICBpZiAoIWxpbmUudHJpbSgpKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKGVycm9yU3RhcnRSZWdleCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIC8vIOi/meaYr+S4gOS4quaWsOeahOmUmeivr+ihjFxyXG4gICAgICAgICAgICBjb25zdCBmaWxlbmFtZSA9IG1hdGNoWzFdLnRyaW0oKTtcclxuICAgICAgICAgICAgLy8g5qOA5p+l5paH5Lu25ZCN5piv5ZCm5YyF5ZCrIGFzc2V0c1xyXG4gICAgICAgICAgICAvLyDkvb/nlKjlrr3mnb7nmoTljLnphY3vvIzlj6ropoHot6/lvoTkuK3ljIXlkKsgYXNzZXRzIOWNs+WPr1xyXG4gICAgICAgICAgICBpZiAoZmlsZW5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnYXNzZXRzJykpIHtcclxuICAgICAgICAgICAgICAgIGlzQXNzZXRFcnJvciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBmaWx0ZXJlZExpbmVzLnB1c2gobGluZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpc0Fzc2V0RXJyb3IgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIOS4jeaYr+aWsOeahOmUmeivr+ihjO+8iOWPr+iDveaYr+mUmeivr+ivpuaDheOAgeS7o+eggeS4iuS4i+aWh+etie+8iVxyXG4gICAgICAgICAgICBpZiAoaXNBc3NldEVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzlvZPliY3lpITkuo4gYXNzZXRzIOmUmeivr+Wdl+S4re+8jOS/neeVmeivpeihjFxyXG4gICAgICAgICAgICAgICAgZmlsdGVyZWRMaW5lcy5wdXNoKGxpbmUpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxpbmUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnYXNzZXRzJykgJiYgKGxpbmUuaW5jbHVkZXMoJ2Vycm9yIFRTJykgfHwgbGluZS5pbmNsdWRlcygnd2FybmluZyBUUycpKSkge1xyXG4gICAgICAgICAgICAgICAgLy8g5YWc5bqV77ya5aaC5p6c6KGM5pys6Lqr5YyF5ZCrIGFzc2V0cyDkuJTnnIvotbfmnaXlg4/mmK/kuIDkuKrplJnor6/vvIzkv53nlZnor6XooYzlubblvIDlkK/plJnor6/lnZdcclxuICAgICAgICAgICAgICAgIC8vIOi/meWPr+S7peWkhOeQhuato+WImeacquWMuemFjeWIsOS9huehruWunuaYryBhc3NldHMg6ZSZ6K+v55qE5oOF5Ya1XHJcbiAgICAgICAgICAgICAgICBpc0Fzc2V0RXJyb3IgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZmlsdGVyZWRMaW5lcy5wdXNoKGxpbmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gZmlsdGVyZWRMaW5lcy5qb2luKCdcXG4nKS50cmltKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmiafooYzpnZnmgIHnvJbor5Hmo4Dmn6VcclxuICogQHBhcmFtIHByb2plY3RQYXRoIOmhueebrui3r+W+hFxyXG4gKiBAcGFyYW0gc2hvd091dHB1dCDmmK/lkKbmmL7npLrovpPlh7rkv6Hmga/vvIjpu5jorqQgdHJ1Ze+8iVxyXG4gKiBAcmV0dXJucyDov5Tlm57lr7nosaHvvIzljIXlkKvmo4Dmn6Xnu5PmnpzlkozplJnor6/kv6Hmga/jgIJwYXNzZWQg5Li6IHRydWUg6KGo56S65qOA5p+l6YCa6L+H77yI5rKh5pyJIGFzc2V0cyDnm7jlhbPplJnor6/vvInvvIxmYWxzZSDooajnpLrmnInplJnor69cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5TdGF0aWNDb21waWxlQ2hlY2socHJvamVjdFBhdGg6IHN0cmluZywgc2hvd091dHB1dDogYm9vbGVhbiA9IHRydWUpOiBQcm9taXNlPHsgcGFzc2VkOiBib29sZWFuOyBlcnJvck1lc3NhZ2U/OiBzdHJpbmcgfT4ge1xyXG4gICAgaWYgKHNob3dPdXRwdXQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5ibHVlKCdSdW5uaW5nIFR5cGVTY3JpcHQgc3RhdGljIGNvbXBpbGUgY2hlY2suLi4nKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JheShgUHJvamVjdDogJHtwcm9qZWN0UGF0aH1gKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJycpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOWIh+aNouWIsOmhueebruebruW9leW5tuaJp+ihjOWRveS7pFxyXG4gICAgLy8g5L2/55SoIDI+JjEg5bCGIHN0ZGVyciDlkIjlubbliLAgc3Rkb3V077yM6YG/5YWN5rWB5YaZ5YWl5Yay56qB5a+86Ie055qE5Lmx5bqPXHJcbiAgICBjb25zdCBjb21tYW5kID0gYG5weCB0c2MgLS1ub0VtaXQgMj4mMVwiYDtcclxuICAgIGNvbnN0IHNoZWxsID0gZ2V0U2hlbGwoKTtcclxuICAgIFxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBleGVjT3B0aW9uczogYW55ID0ge1xyXG4gICAgICAgICAgICBjd2Q6IHByb2plY3RQYXRoLFxyXG4gICAgICAgICAgICBtYXhCdWZmZXI6IDIwICogMTAyNCAqIDEwMjQsIC8vIOWinuWKoCBidWZmZXIg5aSn5bCP5YiwIDIwTUJcclxuICAgICAgICAgICAgZW52OiB7XHJcbiAgICAgICAgICAgICAgICAuLi5wcm9jZXNzLmVudixcclxuICAgICAgICAgICAgICAgIENJOiAndHJ1ZScsICAgICAgIC8vIOWRiuivieW3peWFt+aIkeS7rOWcqCBDSSDnjq/looPkuK3vvIzpgb/lhY3kuqTkupLlvI/ovpPlh7pcclxuICAgICAgICAgICAgICAgIEZPUkNFX0NPTE9SOiAnMCcsIC8vIOemgeeUqOminOiJsui+k+WHuu+8jOmBv+WFjeaOp+WItuWtl+espuW5suaJsOino+aekFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoc2hlbGwpIHtcclxuICAgICAgICAgICAgZXhlY09wdGlvbnMuc2hlbGwgPSBzaGVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOWPquivu+WPliBzdGRvdXTvvIzlm6DkuLogc3RkZXJyIOW3sue7j+WQiOW5tui/m+WOu+S6hlxyXG4gICAgICAgIGNvbnN0IHsgc3Rkb3V0IH0gPSBhd2FpdCBleGVjQXN5bmMoY29tbWFuZCwgZXhlY09wdGlvbnMpO1xyXG4gICAgICAgIGNvbnN0IG91dHB1dCA9IFN0cmluZyhzdGRvdXQgfHwgJycpLnRyaW0oKTtcclxuXHJcbiAgICAgICAgaWYgKCFvdXRwdXQpIHtcclxuICAgICAgICAgICAgLy8g5rKh5pyJ6L6T5Ye677yM6K+05piO57yW6K+R5oiQ5YqfXHJcbiAgICAgICAgICAgIGlmIChzaG93T3V0cHV0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5ncmVlbign4pyTIE5vIGFzc2V0cy1yZWxhdGVkIFR5cGVTY3JpcHQgZXJyb3JzIGZvdW5kIScpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4geyBwYXNzZWQ6IHRydWUgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOi/h+a7pOWHuuWMheWQqyBcImFzc2V0c1wiIOeahOmUmeivr1xyXG4gICAgICAgIGNvbnN0IGZpbHRlcmVkT3V0cHV0ID0gZmlsdGVyQXNzZXRzRXJyb3JzKG91dHB1dCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGZpbHRlcmVkT3V0cHV0KSB7XHJcbiAgICAgICAgICAgIC8vIOaciSBhc3NldHMg55u45YWz55qE6ZSZ6K+vXHJcbiAgICAgICAgICAgIGlmIChzaG93T3V0cHV0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGZpbHRlcmVkT3V0cHV0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4geyBwYXNzZWQ6IGZhbHNlLCBlcnJvck1lc3NhZ2U6IGZpbHRlcmVkT3V0cHV0IH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8g5rKh5pyJIGFzc2V0cyDnm7jlhbPnmoTplJnor69cclxuICAgICAgICAgICAgaWYgKHNob3dPdXRwdXQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmdyZWVuKCfinJMgTm8gYXNzZXRzLXJlbGF0ZWQgVHlwZVNjcmlwdCBlcnJvcnMgZm91bmQhJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB7IHBhc3NlZDogdHJ1ZSB9O1xyXG4gICAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICAvLyBleGVjQXN5bmMg5Zyo5ZG95Luk6L+U5Zue6Z2e6Zu26YCA5Ye656CB5pe25Lya5oqb5Ye66ZSZ6K+vXHJcbiAgICAgICAgLy8gdHNjIOWmguaenOaciemUmeivr+S8mui/lOWbnumdnumbtumAgOWHuuegge+8jOi/meaYr+ato+W4uOeahFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOWQiOW5tiBzdGRvdXQg5ZKMIHN0ZGVyciAo6Jm954S25oiR5Lus5L2/55So5LqGIDI+JjHvvIzkvYblpoLmnpwgZXhlY0FzeW5jIOaNleiOt+WIsOS6hiBzdGRlcnIg5Lmf6KaB5aSE55CGKVxyXG4gICAgICAgIGNvbnN0IGVycm9yU3Rkb3V0ID0gU3RyaW5nKGVycm9yLnN0ZG91dCB8fCAnJykudHJpbSgpO1xyXG4gICAgICAgIGNvbnN0IGVycm9yU3RkZXJyID0gU3RyaW5nKGVycm9yLnN0ZGVyciB8fCAnJykudHJpbSgpO1xyXG4gICAgICAgIGNvbnN0IGZ1bGxPdXRwdXQgPSAoZXJyb3JTdGRvdXQgKyAoZXJyb3JTdGRvdXQgJiYgZXJyb3JTdGRlcnIgPyAnXFxuJyA6ICcnKSArIGVycm9yU3RkZXJyKS50cmltKCk7XHJcblxyXG4gICAgICAgIGlmICghZnVsbE91dHB1dCkge1xyXG4gICAgICAgICAgICAvLyDmsqHmnInovpPlh7rvvIzor7TmmI7lj6/og73mmK/lhbbku5bplJnor6/vvIjmr5TlpoIgdHNjIOWRveS7pOS4jeWtmOWcqO+8iVxyXG4gICAgICAgICAgICBpZiAoc2hvd091dHB1dCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JlZW4oJ+KckyBObyBhc3NldHMtcmVsYXRlZCBUeXBlU2NyaXB0IGVycm9ycyBmb3VuZCEnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHsgcGFzc2VkOiB0cnVlIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDov4fmu6Tlh7rljIXlkKsgXCJhc3NldHNcIiDnmoTplJnor69cclxuICAgICAgICBjb25zdCBmaWx0ZXJlZE91dHB1dCA9IGZpbHRlckFzc2V0c0Vycm9ycyhmdWxsT3V0cHV0KTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoZmlsdGVyZWRPdXRwdXQpIHtcclxuICAgICAgICAgICAgLy8g5pyJIGFzc2V0cyDnm7jlhbPnmoTplJnor69cclxuICAgICAgICAgICAgaWYgKHNob3dPdXRwdXQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZmlsdGVyZWRPdXRwdXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB7IHBhc3NlZDogZmFsc2UsIGVycm9yTWVzc2FnZTogZmlsdGVyZWRPdXRwdXQgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyDmsqHmnIkgYXNzZXRzIOebuOWFs+eahOmUmeivr1xyXG4gICAgICAgICAgICBpZiAoc2hvd091dHB1dCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JlZW4oJ+KckyBObyBhc3NldHMtcmVsYXRlZCBUeXBlU2NyaXB0IGVycm9ycyBmb3VuZCEnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHsgcGFzc2VkOiB0cnVlIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==