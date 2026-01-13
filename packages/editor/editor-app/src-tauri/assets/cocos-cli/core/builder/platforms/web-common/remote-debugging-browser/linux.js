"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteDebuggingBrowserLinux = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const interface_1 = require("./interface");
/**
 * Linux 平台的远程调试浏览器实现
 */
class RemoteDebuggingBrowserLinux {
    /**
     * 获取默认浏览器路径
     */
    getDefaultBrowserPath() {
        try {
            let browserDesktop = "";
            try {
                browserDesktop = (0, child_process_1.execSync)("xdg-settings get default-web-browser", {
                    encoding: "utf8",
                }).trim();
            }
            catch {
                browserDesktop = (0, child_process_1.execSync)("xdg-mime query default x-scheme-handler/http", { encoding: "utf8" }).trim();
            }
            if (browserDesktop) {
                const desktopFilePath = `/usr/share/applications/${browserDesktop}`;
                if (fs_1.default.existsSync(desktopFilePath)) {
                    const desktopFileContent = fs_1.default.readFileSync(desktopFilePath, "utf8");
                    const execLine = desktopFileContent
                        .split("\n")
                        .find((line) => line.startsWith("Exec="));
                    if (execLine) {
                        const execPath = execLine.replace("Exec=", "").split(" ")[0];
                        if (fs_1.default.existsSync(execPath)) {
                            return execPath;
                        }
                    }
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
            try {
                (0, child_process_1.execSync)('which google-chrome', { stdio: 'ignore' });
                return true;
            }
            catch {
                try {
                    (0, child_process_1.execSync)('which chromium', { stdio: 'ignore' });
                    return true;
                }
                catch {
                    return false;
                }
            }
        }
        else if (browserType === interface_1.BrowserType.Edge) {
            try {
                (0, child_process_1.execSync)('which microsoft-edge', { stdio: 'ignore' });
                return true;
            }
            catch {
                return false;
            }
        }
        return false;
    }
    launchBrowser(browserType, url, port, userDataDir, completedCallback) {
        const args = `--remote-debugging-port=${port} --no-first-run --no-default-browser-check --user-data-dir="${userDataDir}" "${url}"`;
        try {
            if (browserType === interface_1.BrowserType.Chrome) {
                (0, child_process_1.exec)(`google-chrome ${args} &`, (error) => {
                    if (error) {
                        // 尝试 chromium
                        (0, child_process_1.exec)(`chromium ${args} &`, (error2) => {
                            if (error2) {
                                console.error(`❌ Failed to launch Chrome/Chromium: ${error2.message}`);
                            }
                            else {
                                console.log(`✅ Chromium launched with debugging port ${port}`);
                            }
                            if (completedCallback) {
                                completedCallback();
                            }
                        });
                    }
                    else {
                        console.log(`✅ Chrome launched with debugging port ${port}`);
                        if (completedCallback) {
                            completedCallback();
                        }
                    }
                });
            }
            else if (browserType === interface_1.BrowserType.Edge) {
                (0, child_process_1.exec)(`microsoft-edge ${args} &`, (error) => {
                    if (error) {
                        console.error(`❌ Failed to launch Edge: ${error.message}`);
                    }
                    else {
                        console.log(`✅ Edge launched with debugging port ${port}`);
                    }
                    if (completedCallback) {
                        completedCallback();
                    }
                });
            }
        }
        catch (error) {
            console.error(`❌ Failed to launch browser: ${error.message}`);
            if (completedCallback) {
                completedCallback();
            }
        }
    }
}
exports.RemoteDebuggingBrowserLinux = RemoteDebuggingBrowserLinux;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGludXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3BsYXRmb3Jtcy93ZWItY29tbW9uL3JlbW90ZS1kZWJ1Z2dpbmctYnJvd3Nlci9saW51eC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxpREFBK0M7QUFDL0MsNENBQW9CO0FBQ3BCLDJDQUFtRTtBQUVuRTs7R0FFRztBQUNILE1BQWEsMkJBQTJCO0lBQ3BDOztPQUVHO0lBQ0sscUJBQXFCO1FBQ3pCLElBQUksQ0FBQztZQUNELElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUM7Z0JBQ0QsY0FBYyxHQUFHLElBQUEsd0JBQVEsRUFBQyxzQ0FBc0MsRUFBRTtvQkFDOUQsUUFBUSxFQUFFLE1BQU07aUJBQ25CLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNkLENBQUM7WUFBQyxNQUFNLENBQUM7Z0JBQ0wsY0FBYyxHQUFHLElBQUEsd0JBQVEsRUFDckIsOENBQThDLEVBQzlDLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUN2QixDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2IsQ0FBQztZQUVELElBQUksY0FBYyxFQUFFLENBQUM7Z0JBQ2pCLE1BQU0sZUFBZSxHQUFHLDJCQUEyQixjQUFjLEVBQUUsQ0FBQztnQkFDcEUsSUFBSSxZQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7b0JBQ2pDLE1BQU0sa0JBQWtCLEdBQUcsWUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ3BFLE1BQU0sUUFBUSxHQUFHLGtCQUFrQjt5QkFDOUIsS0FBSyxDQUFDLElBQUksQ0FBQzt5QkFDWCxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDOUMsSUFB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VSxFQUFFLENBQUM7WUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDOUQsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO2dCQUNwQixpQkFBaUIsRUFBRSxDQUFDO1lBQ3hCLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBdElELGtFQXNJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4ZWMsIGV4ZWNTeW5jIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcclxuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xyXG5pbXBvcnQgeyBCcm93c2VyVHlwZSwgSVJlbW90ZURlYnVnZ2luZ0Jyb3dzZXIgfSBmcm9tIFwiLi9pbnRlcmZhY2VcIjtcclxuXHJcbi8qKlxyXG4gKiBMaW51eCDlubPlj7DnmoTov5znqIvosIPor5XmtY/op4jlmajlrp7njrBcclxuICovXHJcbmV4cG9ydCBjbGFzcyBSZW1vdGVEZWJ1Z2dpbmdCcm93c2VyTGludXggaW1wbGVtZW50cyBJUmVtb3RlRGVidWdnaW5nQnJvd3NlciB7XHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlum7mOiupOa1j+iniOWZqOi3r+W+hFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldERlZmF1bHRCcm93c2VyUGF0aCgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBicm93c2VyRGVza3RvcCA9IFwiXCI7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBicm93c2VyRGVza3RvcCA9IGV4ZWNTeW5jKFwieGRnLXNldHRpbmdzIGdldCBkZWZhdWx0LXdlYi1icm93c2VyXCIsIHtcclxuICAgICAgICAgICAgICAgICAgICBlbmNvZGluZzogXCJ1dGY4XCIsXHJcbiAgICAgICAgICAgICAgICB9KS50cmltKCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgYnJvd3NlckRlc2t0b3AgPSBleGVjU3luYyhcclxuICAgICAgICAgICAgICAgICAgICBcInhkZy1taW1lIHF1ZXJ5IGRlZmF1bHQgeC1zY2hlbWUtaGFuZGxlci9odHRwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgeyBlbmNvZGluZzogXCJ1dGY4XCIgfVxyXG4gICAgICAgICAgICAgICAgKS50cmltKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChicm93c2VyRGVza3RvcCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGVza3RvcEZpbGVQYXRoID0gYC91c3Ivc2hhcmUvYXBwbGljYXRpb25zLyR7YnJvd3NlckRlc2t0b3B9YDtcclxuICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGRlc2t0b3BGaWxlUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXNrdG9wRmlsZUNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZGVza3RvcEZpbGVQYXRoLCBcInV0ZjhcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhlY0xpbmUgPSBkZXNrdG9wRmlsZUNvbnRlbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNwbGl0KFwiXFxuXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKChsaW5lKSA9PiBsaW5lLnN0YXJ0c1dpdGgoXCJFeGVjPVwiKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4ZWNMaW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4ZWNQYXRoID0gZXhlY0xpbmUucmVwbGFjZShcIkV4ZWM9XCIsIFwiXCIpLnNwbGl0KFwiIFwiKVswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoZXhlY1BhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXhlY1BhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS7jua1j+iniOWZqOi3r+W+hOWIpOaWrea1j+iniOWZqOexu+Wei1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldEJyb3dzZXJUeXBlRnJvbVBhdGgoYnJvd3NlclBhdGg6IHN0cmluZyk6IEJyb3dzZXJUeXBlIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBjb25zdCBsb3dlclBhdGggPSBicm93c2VyUGF0aC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGlmIChsb3dlclBhdGguaW5jbHVkZXMoJ2Nocm9tZScpICYmICFsb3dlclBhdGguaW5jbHVkZXMoJ2VkZ2UnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gQnJvd3NlclR5cGUuQ2hyb21lO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobG93ZXJQYXRoLmluY2x1ZGVzKCdlZGdlJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJyb3dzZXJUeXBlLkVkZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGVmYXVsdEJyb3dzZXJUeXBlKCk6IEJyb3dzZXJUeXBlIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBjb25zdCBicm93c2VyUGF0aCA9IHRoaXMuZ2V0RGVmYXVsdEJyb3dzZXJQYXRoKCk7XHJcbiAgICAgICAgaWYgKCFicm93c2VyUGF0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRCcm93c2VyVHlwZUZyb21QYXRoKGJyb3dzZXJQYXRoKTtcclxuICAgIH1cclxuXHJcbiAgICBpc0Jyb3dzZXJJbnN0YWxsZWQoYnJvd3NlclR5cGU6IEJyb3dzZXJUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKGJyb3dzZXJUeXBlID09PSBCcm93c2VyVHlwZS5DaHJvbWUpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGV4ZWNTeW5jKCd3aGljaCBnb29nbGUtY2hyb21lJywgeyBzdGRpbzogJ2lnbm9yZScgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4ZWNTeW5jKCd3aGljaCBjaHJvbWl1bScsIHsgc3RkaW86ICdpZ25vcmUnIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChicm93c2VyVHlwZSA9PT0gQnJvd3NlclR5cGUuRWRnZSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZXhlY1N5bmMoJ3doaWNoIG1pY3Jvc29mdC1lZGdlJywgeyBzdGRpbzogJ2lnbm9yZScgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGxhdW5jaEJyb3dzZXIoXHJcbiAgICAgICAgYnJvd3NlclR5cGU6IEJyb3dzZXJUeXBlLFxyXG4gICAgICAgIHVybDogc3RyaW5nLFxyXG4gICAgICAgIHBvcnQ6IG51bWJlcixcclxuICAgICAgICB1c2VyRGF0YURpcjogc3RyaW5nLFxyXG4gICAgICAgIGNvbXBsZXRlZENhbGxiYWNrPzogKCkgPT4gdm9pZFxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgYXJncyA9IGAtLXJlbW90ZS1kZWJ1Z2dpbmctcG9ydD0ke3BvcnR9IC0tbm8tZmlyc3QtcnVuIC0tbm8tZGVmYXVsdC1icm93c2VyLWNoZWNrIC0tdXNlci1kYXRhLWRpcj1cIiR7dXNlckRhdGFEaXJ9XCIgXCIke3VybH1cImA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGJyb3dzZXJUeXBlID09PSBCcm93c2VyVHlwZS5DaHJvbWUpIHtcclxuICAgICAgICAgICAgICAgIGV4ZWMoYGdvb2dsZS1jaHJvbWUgJHthcmdzfSAmYCwgKGVycm9yOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5bCd6K+VIGNocm9taXVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWMoYGNocm9taXVtICR7YXJnc30gJmAsIChlcnJvcjI6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBGYWlsZWQgdG8gbGF1bmNoIENocm9tZS9DaHJvbWl1bTogJHtlcnJvcjIubWVzc2FnZX1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOKchSBDaHJvbWl1bSBsYXVuY2hlZCB3aXRoIGRlYnVnZ2luZyBwb3J0ICR7cG9ydH1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb21wbGV0ZWRDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUgQ2hyb21lIGxhdW5jaGVkIHdpdGggZGVidWdnaW5nIHBvcnQgJHtwb3J0fWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29tcGxldGVkQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChicm93c2VyVHlwZSA9PT0gQnJvd3NlclR5cGUuRWRnZSkge1xyXG4gICAgICAgICAgICAgICAgZXhlYyhgbWljcm9zb2Z0LWVkZ2UgJHthcmdzfSAmYCwgKGVycm9yOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihg4p2MIEZhaWxlZCB0byBsYXVuY2ggRWRnZTogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUgRWRnZSBsYXVuY2hlZCB3aXRoIGRlYnVnZ2luZyBwb3J0ICR7cG9ydH1gKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBsZXRlZENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBGYWlsZWQgdG8gbGF1bmNoIGJyb3dzZXI6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgICAgICAgaWYgKGNvbXBsZXRlZENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWRDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4iXX0=