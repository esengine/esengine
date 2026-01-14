"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteDebuggingBrowserDarwin = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const interface_1 = require("./interface");
/**
 * macOS 平台的远程调试浏览器实现
 */
class RemoteDebuggingBrowserDarwin {
    /**
     * 获取默认浏览器路径
     */
    getDefaultBrowserPath() {
        try {
            const bundleId = (0, child_process_1.execSync)('defaults read com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers | grep -A 1 "http" | grep LSHandlerRoleAll | awk \'{print $3}\'', { encoding: "utf8" }).trim();
            if (bundleId) {
                const appPath = (0, child_process_1.execSync)(`mdfind "kMDItemCFBundleIdentifier == '${bundleId}'"`, {
                    encoding: "utf8",
                }).split("\n")[0];
                if (appPath && fs_1.default.existsSync(appPath)) {
                    return path_1.default.join(appPath, "Contents", "MacOS", path_1.default.basename(appPath, ".app"));
                }
            }
        }
        catch {
            return undefined;
        }
        return undefined;
    }
    /**
     * 从浏览器路径判断浏览器类型
     */
    getBrowserTypeFromPath(browserPath) {
        const lowerPath = browserPath.toLowerCase();
        if (lowerPath.includes('chrome') && !lowerPath.includes('edge')) {
            return interface_1.BrowserType.Chrome;
        }
        else if (lowerPath.includes('edge')) {
            return interface_1.BrowserType.Edge;
        }
        return undefined;
    }
    getDefaultBrowserType() {
        const browserPath = this.getDefaultBrowserPath();
        if (!browserPath) {
            return undefined;
        }
        return this.getBrowserTypeFromPath(browserPath);
    }
    isBrowserInstalled(browserType) {
        if (browserType === interface_1.BrowserType.Chrome) {
            return fs_1.default.existsSync('/Applications/Google Chrome.app');
        }
        else if (browserType === interface_1.BrowserType.Edge) {
            return fs_1.default.existsSync('/Applications/Microsoft Edge.app');
        }
        return false;
    }
    launchBrowser(browserType, url, port, userDataDir, completedCallback) {
        // 防止重复启动的标志
        let hasLaunched = false;
        const markAsLaunched = () => {
            if (!hasLaunched) {
                hasLaunched = true;
                if (completedCallback) {
                    completedCallback();
                }
            }
        };
        try {
            let executablePath;
            let appName;
            if (browserType === interface_1.BrowserType.Chrome) {
                executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
                appName = 'Google Chrome';
            }
            else if (browserType === interface_1.BrowserType.Edge) {
                executablePath = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
                appName = 'Microsoft Edge';
            }
            else {
                console.error(`❌ Unsupported browser type: ${browserType}`);
                markAsLaunched();
                return;
            }
            // 检查可执行文件是否存在
            if (!fs_1.default.existsSync(executablePath)) {
                // 回退到使用 open -a 方式
                this.launchBrowserWithOpen(browserType, url, port, userDataDir, markAsLaunched);
                return;
            }
            // 构建参数数组（使用数组格式避免 shell 引号问题）
            const args = [
                `--remote-debugging-port=${port}`,
                '--no-first-run',
                '--no-default-browser-check',
                `--user-data-dir=${userDataDir}`,
                url
            ];
            console.log(`📋 Executing: ${executablePath} ${args.join(' ')}`);
            // 使用 spawn 而不是 exec，这样可以更好地控制参数传递
            const childProcess = (0, child_process_1.spawn)(executablePath, args, {
                detached: true,
                stdio: 'ignore'
            });
            // 监听 spawn 错误（如果可执行文件不存在或无法启动）
            // 这是唯一可靠的错误检测方式
            childProcess.on('error', (error) => {
                if (!hasLaunched) {
                    console.error(`❌ Failed to spawn ${appName}: ${error.message}`);
                    // 回退到使用 open -a 方式
                    this.launchBrowserWithOpen(browserType, url, port, userDataDir, markAsLaunched);
                }
            });
            // 监听进程退出（如果立即退出，说明启动失败）
            // 注意：使用 detached: true 和 unref() 后，exit 事件可能不会立即触发
            // 但如果触发了且退出码不为 0，说明启动失败
            let exitTimer = null;
            childProcess.on('exit', (code, signal) => {
                // 清除成功启动的定时器
                if (exitTimer) {
                    clearTimeout(exitTimer);
                    exitTimer = null;
                }
                // 只有在进程立即退出且退出码不为 0 时才认为启动失败
                if (!hasLaunched && code !== null && code !== 0) {
                    console.error(`❌ ${appName} process exited with code ${code}, signal: ${signal}`);
                    this.launchBrowserWithOpen(browserType, url, port, userDataDir, markAsLaunched);
                }
            });
            // 立即解除父子关系，让浏览器独立运行
            childProcess.unref();
            // 如果 spawn 没有立即触发 error，认为启动成功
            // 给一点时间确认没有 error 事件
            exitTimer = setTimeout(() => {
                if (!hasLaunched) {
                    // spawn 没有触发 error，认为启动成功
                    console.log(`✅ ${appName} launched with debugging port ${port}`);
                    markAsLaunched();
                }
            }, 100);
        }
        catch (error) {
            if (!hasLaunched) {
                console.error(`❌ Exception caught: ${error.message}`);
                // 回退到使用 open -a 方式
                this.launchBrowserWithOpen(browserType, url, port, userDataDir, markAsLaunched);
            }
        }
    }
    /**
     * 使用 open -a 方式启动浏览器（备用方法）
     */
    launchBrowserWithOpen(browserType, url, port, userDataDir, completedCallback) {
        // 构建参数字符串，注意：URL 需要单独处理
        const args = [
            `--remote-debugging-port=${port}`,
            '--no-first-run',
            '--no-default-browser-check',
            `--user-data-dir=${userDataDir}`,
            url
        ];
        let command;
        let appName;
        if (browserType === interface_1.BrowserType.Chrome) {
            appName = 'Google Chrome';
            // 使用 open -n 强制打开新实例，--args 后面的所有参数都会传递给应用
            command = `open -n -a "Google Chrome" --args ${args.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(' ')}`;
        }
        else if (browserType === interface_1.BrowserType.Edge) {
            appName = 'Microsoft Edge';
            command = `open -n -a "Microsoft Edge" --args ${args.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(' ')}`;
        }
        else {
            console.error(`❌ Unsupported browser type: ${browserType}`);
            if (completedCallback) {
                completedCallback();
            }
            return;
        }
        console.log(`📋 Executing: ${command}`);
        (0, child_process_1.exec)(command, (error) => {
            if (error) {
                console.error(`❌ Failed to launch ${appName}: ${error.message}`);
            }
            else {
                console.log(`✅ ${appName} launched with debugging port ${port}`);
            }
            if (completedCallback) {
                completedCallback();
            }
        });
    }
}
exports.RemoteDebuggingBrowserDarwin = RemoteDebuggingBrowserDarwin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFyd2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci9wbGF0Zm9ybXMvd2ViLWNvbW1vbi9yZW1vdGUtZGVidWdnaW5nLWJyb3dzZXIvZGFyd2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGlEQUFzRDtBQUN0RCw0Q0FBb0I7QUFDcEIsZ0RBQXdCO0FBQ3hCLDJDQUFtRTtBQUVuRTs7R0FFRztBQUNILE1BQWEsNEJBQTRCO0lBQ3JDOztPQUVHO0lBQ0sscUJBQXFCO1FBQ3pCLElBQUksQ0FBQztZQUNELE1BQU0sUUFBUSxHQUFHLElBQUEsd0JBQVEsRUFDckIsbUpBQW1KLEVBQ25KLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUN2QixDQUFDLElBQUksRUFBRSxDQUFDO1lBRVQsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDWCxNQUFNLE9BQU8sR0FBRyxJQUFBLHdCQUFRLEVBQUMseUNBQXlDLFFBQVEsSUFBSSxFQUFFO29CQUM1RSxRQUFRLEVBQUUsTUFBTTtpQkFDbkIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEIsSUFBSSxPQUFPLElBQUksWUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO29CQUNwQyxPQUFPLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsY0FBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDbkYsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBQUMsTUFBTSxDQUFDO1lBQ0wsT0FBTyxTQUFTLENBQUM7UUFDckIsQ0FBQztRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7T0FFRztJQUNLLHNCQUFzQixDQUFDLFdBQW1CO1FBQzlDLE1BQU0sU0FBUyxH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SUFBSSxpQkFBaUIsRUFBRSxDQUFDO2dCQUNwQixpQkFBaUIsRUFBRSxDQUFDO1lBQ3hCLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXJORCxvRUFxTkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleGVjLCBleGVjU3luYywgc3Bhd24gfSBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xyXG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IEJyb3dzZXJUeXBlLCBJUmVtb3RlRGVidWdnaW5nQnJvd3NlciB9IGZyb20gXCIuL2ludGVyZmFjZVwiO1xyXG5cclxuLyoqXHJcbiAqIG1hY09TIOW5s+WPsOeahOi/nOeoi+iwg+ivlea1j+iniOWZqOWunueOsFxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFJlbW90ZURlYnVnZ2luZ0Jyb3dzZXJEYXJ3aW4gaW1wbGVtZW50cyBJUmVtb3RlRGVidWdnaW5nQnJvd3NlciB7XHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlum7mOiupOa1j+iniOWZqOi3r+W+hFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldERlZmF1bHRCcm93c2VyUGF0aCgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ1bmRsZUlkID0gZXhlY1N5bmMoXHJcbiAgICAgICAgICAgICAgICAnZGVmYXVsdHMgcmVhZCBjb20uYXBwbGUuTGF1bmNoU2VydmljZXMvY29tLmFwcGxlLmxhdW5jaHNlcnZpY2VzLnNlY3VyZSBMU0hhbmRsZXJzIHwgZ3JlcCAtQSAxIFwiaHR0cFwiIHwgZ3JlcCBMU0hhbmRsZXJSb2xlQWxsIHwgYXdrIFxcJ3twcmludCAkM31cXCcnLFxyXG4gICAgICAgICAgICAgICAgeyBlbmNvZGluZzogXCJ1dGY4XCIgfVxyXG4gICAgICAgICAgICApLnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChidW5kbGVJZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYXBwUGF0aCA9IGV4ZWNTeW5jKGBtZGZpbmQgXCJrTURJdGVtQ0ZCdW5kbGVJZGVudGlmaWVyID09ICcke2J1bmRsZUlkfSdcImAsIHtcclxuICAgICAgICAgICAgICAgICAgICBlbmNvZGluZzogXCJ1dGY4XCIsXHJcbiAgICAgICAgICAgICAgICB9KS5zcGxpdChcIlxcblwiKVswXTtcclxuICAgICAgICAgICAgICAgIGlmIChhcHBQYXRoICYmIGZzLmV4aXN0c1N5bmMoYXBwUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGF0aC5qb2luKGFwcFBhdGgsIFwiQ29udGVudHNcIiwgXCJNYWNPU1wiLCBwYXRoLmJhc2VuYW1lKGFwcFBhdGgsIFwiLmFwcFwiKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS7jua1j+iniOWZqOi3r+W+hOWIpOaWrea1j+iniOWZqOexu+Wei1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldEJyb3dzZXJUeXBlRnJvbVBhdGgoYnJvd3NlclBhdGg6IHN0cmluZyk6IEJyb3dzZXJUeXBlIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBjb25zdCBsb3dlclBhdGggPSBicm93c2VyUGF0aC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGlmIChsb3dlclBhdGguaW5jbHVkZXMoJ2Nocm9tZScpICYmICFsb3dlclBhdGguaW5jbHVkZXMoJ2VkZ2UnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gQnJvd3NlclR5cGUuQ2hyb21lO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobG93ZXJQYXRoLmluY2x1ZGVzKCdlZGdlJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJyb3dzZXJUeXBlLkVkZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGVmYXVsdEJyb3dzZXJUeXBlKCk6IEJyb3dzZXJUeXBlIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBjb25zdCBicm93c2VyUGF0aCA9IHRoaXMuZ2V0RGVmYXVsdEJyb3dzZXJQYXRoKCk7XHJcbiAgICAgICAgaWYgKCFicm93c2VyUGF0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRCcm93c2VyVHlwZUZyb21QYXRoKGJyb3dzZXJQYXRoKTtcclxuICAgIH1cclxuXHJcbiAgICBpc0Jyb3dzZXJJbnN0YWxsZWQoYnJvd3NlclR5cGU6IEJyb3dzZXJUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKGJyb3dzZXJUeXBlID09PSBCcm93c2VyVHlwZS5DaHJvbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMoJy9BcHBsaWNhdGlvbnMvR29vZ2xlIENocm9tZS5hcHAnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGJyb3dzZXJUeXBlID09PSBCcm93c2VyVHlwZS5FZGdlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmcy5leGlzdHNTeW5jKCcvQXBwbGljYXRpb25zL01pY3Jvc29mdCBFZGdlLmFwcCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgbGF1bmNoQnJvd3NlcihcclxuICAgICAgICBicm93c2VyVHlwZTogQnJvd3NlclR5cGUsXHJcbiAgICAgICAgdXJsOiBzdHJpbmcsXHJcbiAgICAgICAgcG9ydDogbnVtYmVyLFxyXG4gICAgICAgIHVzZXJEYXRhRGlyOiBzdHJpbmcsXHJcbiAgICAgICAgY29tcGxldGVkQ2FsbGJhY2s/OiAoKSA9PiB2b2lkXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICAvLyDpmLLmraLph43lpI3lkK/liqjnmoTmoIflv5dcclxuICAgICAgICBsZXQgaGFzTGF1bmNoZWQgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBtYXJrQXNMYXVuY2hlZCA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFoYXNMYXVuY2hlZCkge1xyXG4gICAgICAgICAgICAgICAgaGFzTGF1bmNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBsZXRlZENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBleGVjdXRhYmxlUGF0aDogc3RyaW5nO1xyXG4gICAgICAgICAgICBsZXQgYXBwTmFtZTogc3RyaW5nO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJyb3dzZXJUeXBlID09PSBCcm93c2VyVHlwZS5DaHJvbWUpIHtcclxuICAgICAgICAgICAgICAgIGV4ZWN1dGFibGVQYXRoID0gJy9BcHBsaWNhdGlvbnMvR29vZ2xlIENocm9tZS5hcHAvQ29udGVudHMvTWFjT1MvR29vZ2xlIENocm9tZSc7XHJcbiAgICAgICAgICAgICAgICBhcHBOYW1lID0gJ0dvb2dsZSBDaHJvbWUnO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGJyb3dzZXJUeXBlID09PSBCcm93c2VyVHlwZS5FZGdlKSB7XHJcbiAgICAgICAgICAgICAgICBleGVjdXRhYmxlUGF0aCA9ICcvQXBwbGljYXRpb25zL01pY3Jvc29mdCBFZGdlLmFwcC9Db250ZW50cy9NYWNPUy9NaWNyb3NvZnQgRWRnZSc7XHJcbiAgICAgICAgICAgICAgICBhcHBOYW1lID0gJ01pY3Jvc29mdCBFZGdlJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBVbnN1cHBvcnRlZCBicm93c2VyIHR5cGU6ICR7YnJvd3NlclR5cGV9YCk7XHJcbiAgICAgICAgICAgICAgICBtYXJrQXNMYXVuY2hlZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDmo4Dmn6Xlj6/miafooYzmlofku7bmmK/lkKblrZjlnKhcclxuICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGV4ZWN1dGFibGVQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgLy8g5Zue6YCA5Yiw5L2/55SoIG9wZW4gLWEg5pa55byPXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhdW5jaEJyb3dzZXJXaXRoT3Blbihicm93c2VyVHlwZSwgdXJsLCBwb3J0LCB1c2VyRGF0YURpciwgbWFya0FzTGF1bmNoZWQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDmnoTlu7rlj4LmlbDmlbDnu4TvvIjkvb/nlKjmlbDnu4TmoLzlvI/pgb/lhY0gc2hlbGwg5byV5Y+36Zeu6aKY77yJXHJcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBbXHJcbiAgICAgICAgICAgICAgICBgLS1yZW1vdGUtZGVidWdnaW5nLXBvcnQ9JHtwb3J0fWAsXHJcbiAgICAgICAgICAgICAgICAnLS1uby1maXJzdC1ydW4nLFxyXG4gICAgICAgICAgICAgICAgJy0tbm8tZGVmYXVsdC1icm93c2VyLWNoZWNrJyxcclxuICAgICAgICAgICAgICAgIGAtLXVzZXItZGF0YS1kaXI9JHt1c2VyRGF0YURpcn1gLFxyXG4gICAgICAgICAgICAgICAgdXJsXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg8J+TiyBFeGVjdXRpbmc6ICR7ZXhlY3V0YWJsZVBhdGh9ICR7YXJncy5qb2luKCcgJyl9YCk7XHJcblxyXG4gICAgICAgICAgICAvLyDkvb/nlKggc3Bhd24g6ICM5LiN5pivIGV4ZWPvvIzov5nmoLflj6/ku6Xmm7Tlpb3lnLDmjqfliLblj4LmlbDkvKDpgJJcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRQcm9jZXNzID0gc3Bhd24oZXhlY3V0YWJsZVBhdGgsIGFyZ3MsIHtcclxuICAgICAgICAgICAgICAgIGRldGFjaGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc3RkaW86ICdpZ25vcmUnXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8g55uR5ZCsIHNwYXduIOmUmeivr++8iOWmguaenOWPr+aJp+ihjOaWh+S7tuS4jeWtmOWcqOaIluaXoOazleWQr+WKqO+8iVxyXG4gICAgICAgICAgICAvLyDov5nmmK/llK/kuIDlj6/pnaDnmoTplJnor6/mo4DmtYvmlrnlvI9cclxuICAgICAgICAgICAgY2hpbGRQcm9jZXNzLm9uKCdlcnJvcicsIChlcnJvcjogRXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghaGFzTGF1bmNoZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGDinYwgRmFpbGVkIHRvIHNwYXduICR7YXBwTmFtZX06ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDlm57pgIDliLDkvb/nlKggb3BlbiAtYSDmlrnlvI9cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhdW5jaEJyb3dzZXJXaXRoT3Blbihicm93c2VyVHlwZSwgdXJsLCBwb3J0LCB1c2VyRGF0YURpciwgbWFya0FzTGF1bmNoZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIOebkeWQrOi/m+eoi+mAgOWHuu+8iOWmguaenOeri+WNs+mAgOWHuu+8jOivtOaYjuWQr+WKqOWksei0pe+8iVxyXG4gICAgICAgICAgICAvLyDms6jmhI/vvJrkvb/nlKggZGV0YWNoZWQ6IHRydWUg5ZKMIHVucmVmKCkg5ZCO77yMZXhpdCDkuovku7blj6/og73kuI3kvJrnq4vljbPop6blj5FcclxuICAgICAgICAgICAgLy8g5L2G5aaC5p6c6Kem5Y+R5LqG5LiU6YCA5Ye656CB5LiN5Li6IDDvvIzor7TmmI7lkK/liqjlpLHotKVcclxuICAgICAgICAgICAgbGV0IGV4aXRUaW1lcjogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDtcclxuICAgICAgICAgICAgY2hpbGRQcm9jZXNzLm9uKCdleGl0JywgKGNvZGU6IG51bWJlciB8IG51bGwsIHNpZ25hbDogc3RyaW5nIHwgbnVsbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8g5riF6Zmk5oiQ5Yqf5ZCv5Yqo55qE5a6a5pe25ZmoXHJcbiAgICAgICAgICAgICAgICBpZiAoZXhpdFRpbWVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGV4aXRUaW1lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhpdFRpbWVyID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyDlj6rmnInlnKjov5vnqIvnq4vljbPpgIDlh7rkuJTpgIDlh7rnoIHkuI3kuLogMCDml7bmiY3orqTkuLrlkK/liqjlpLHotKVcclxuICAgICAgICAgICAgICAgIGlmICghaGFzTGF1bmNoZWQgJiYgY29kZSAhPT0gbnVsbCAmJiBjb2RlICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihg4p2MICR7YXBwTmFtZX0gcHJvY2VzcyBleGl0ZWQgd2l0aCBjb2RlICR7Y29kZX0sIHNpZ25hbDogJHtzaWduYWx9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXVuY2hCcm93c2VyV2l0aE9wZW4oYnJvd3NlclR5cGUsIHVybCwgcG9ydCwgdXNlckRhdGFEaXIsIG1hcmtBc0xhdW5jaGVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyDnq4vljbPop6PpmaTniLblrZDlhbPns7vvvIzorqnmtY/op4jlmajni6znq4vov5DooYxcclxuICAgICAgICAgICAgY2hpbGRQcm9jZXNzLnVucmVmKCk7XHJcblxyXG4gICAgICAgICAgICAvLyDlpoLmnpwgc3Bhd24g5rKh5pyJ56uL5Y2z6Kem5Y+RIGVycm9y77yM6K6k5Li65ZCv5Yqo5oiQ5YqfXHJcbiAgICAgICAgICAgIC8vIOe7meS4gOeCueaXtumXtOehruiupOayoeaciSBlcnJvciDkuovku7ZcclxuICAgICAgICAgICAgZXhpdFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWhhc0xhdW5jaGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gc3Bhd24g5rKh5pyJ6Kem5Y+RIGVycm9y77yM6K6k5Li65ZCv5Yqo5oiQ5YqfXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOKchSAke2FwcE5hbWV9IGxhdW5jaGVkIHdpdGggZGVidWdnaW5nIHBvcnQgJHtwb3J0fWApO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcmtBc0xhdW5jaGVkKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcblxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICAgICAgaWYgKCFoYXNMYXVuY2hlZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihg4p2MIEV4Y2VwdGlvbiBjYXVnaHQ6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgICAgICAgICAgIC8vIOWbnumAgOWIsOS9v+eUqCBvcGVuIC1hIOaWueW8j1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXVuY2hCcm93c2VyV2l0aE9wZW4oYnJvd3NlclR5cGUsIHVybCwgcG9ydCwgdXNlckRhdGFEaXIsIG1hcmtBc0xhdW5jaGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS9v+eUqCBvcGVuIC1hIOaWueW8j+WQr+WKqOa1j+iniOWZqO+8iOWkh+eUqOaWueazle+8iVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGxhdW5jaEJyb3dzZXJXaXRoT3BlbihcclxuICAgICAgICBicm93c2VyVHlwZTogQnJvd3NlclR5cGUsXHJcbiAgICAgICAgdXJsOiBzdHJpbmcsXHJcbiAgICAgICAgcG9ydDogbnVtYmVyLFxyXG4gICAgICAgIHVzZXJEYXRhRGlyOiBzdHJpbmcsXHJcbiAgICAgICAgY29tcGxldGVkQ2FsbGJhY2s/OiAoKSA9PiB2b2lkXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICAvLyDmnoTlu7rlj4LmlbDlrZfnrKbkuLLvvIzms6jmhI/vvJpVUkwg6ZyA6KaB5Y2V54us5aSE55CGXHJcbiAgICAgICAgY29uc3QgYXJncyA9IFtcclxuICAgICAgICAgICAgYC0tcmVtb3RlLWRlYnVnZ2luZy1wb3J0PSR7cG9ydH1gLFxyXG4gICAgICAgICAgICAnLS1uby1maXJzdC1ydW4nLFxyXG4gICAgICAgICAgICAnLS1uby1kZWZhdWx0LWJyb3dzZXItY2hlY2snLFxyXG4gICAgICAgICAgICBgLS11c2VyLWRhdGEtZGlyPSR7dXNlckRhdGFEaXJ9YCxcclxuICAgICAgICAgICAgdXJsXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgbGV0IGNvbW1hbmQ6IHN0cmluZztcclxuICAgICAgICBsZXQgYXBwTmFtZTogc3RyaW5nO1xyXG5cclxuICAgICAgICBpZiAoYnJvd3NlclR5cGUgPT09IEJyb3dzZXJUeXBlLkNocm9tZSkge1xyXG4gICAgICAgICAgICBhcHBOYW1lID0gJ0dvb2dsZSBDaHJvbWUnO1xyXG4gICAgICAgICAgICAvLyDkvb/nlKggb3BlbiAtbiDlvLrliLbmiZPlvIDmlrDlrp7kvovvvIwtLWFyZ3Mg5ZCO6Z2i55qE5omA5pyJ5Y+C5pWw6YO95Lya5Lyg6YCS57uZ5bqU55SoXHJcbiAgICAgICAgICAgIGNvbW1hbmQgPSBgb3BlbiAtbiAtYSBcIkdvb2dsZSBDaHJvbWVcIiAtLWFyZ3MgJHthcmdzLm1hcChhcmcgPT4gYFwiJHthcmcucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpfVwiYCkuam9pbignICcpfWA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChicm93c2VyVHlwZSA9PT0gQnJvd3NlclR5cGUuRWRnZSkge1xyXG4gICAgICAgICAgICBhcHBOYW1lID0gJ01pY3Jvc29mdCBFZGdlJztcclxuICAgICAgICAgICAgY29tbWFuZCA9IGBvcGVuIC1uIC1hIFwiTWljcm9zb2Z0IEVkZ2VcIiAtLWFyZ3MgJHthcmdzLm1hcChhcmcgPT4gYFwiJHthcmcucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpfVwiYCkuam9pbignICcpfWA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihg4p2MIFVuc3VwcG9ydGVkIGJyb3dzZXIgdHlwZTogJHticm93c2VyVHlwZX1gKTtcclxuICAgICAgICAgICAgaWYgKGNvbXBsZXRlZENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWRDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5OLIEV4ZWN1dGluZzogJHtjb21tYW5kfWApO1xyXG5cclxuICAgICAgICBleGVjKGNvbW1hbmQsIChlcnJvcjogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihg4p2MIEZhaWxlZCB0byBsYXVuY2ggJHthcHBOYW1lfTogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOKchSAke2FwcE5hbWV9IGxhdW5jaGVkIHdpdGggZGVidWdnaW5nIHBvcnQgJHtwb3J0fWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb21wbGV0ZWRDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgY29tcGxldGVkQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4iXX0=