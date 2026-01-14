"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteDebuggingBrowserWin32 = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const interface_1 = require("./interface");
/**
 * Windows 平台的远程调试浏览器实现
 */
class RemoteDebuggingBrowserWin32 {
    /**
     * 通过注册表获取 Chrome 浏览器路径
     */
    getChromePathFromRegistry() {
        try {
            const regPaths = [
                'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe',
                'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe',
                'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe'
            ];
            for (const regPath of regPaths) {
                try {
                    const regQuery = (0, child_process_1.execSync)(`reg query "${regPath}" /ve`, { encoding: "utf8", stdio: 'pipe' });
                    let match = regQuery.match(/"([^"]+)"/);
                    if (match) {
                        const browserPath = match[1].trim();
                        if (fs_1.default.existsSync(browserPath)) {
                            return browserPath;
                        }
                    }
                    else {
                        const lines = regQuery.split(/\r?\n/);
                        for (const line of lines) {
                            if (line.includes('REG_SZ')) {
                                match = line.match(/REG_SZ\s+(.+)$/);
                                if (match) {
                                    let browserPath = match[1].trim();
                                    if (fs_1.default.existsSync(browserPath)) {
                                        return browserPath;
                                    }
                                    const parts = browserPath.split(/\s+/);
                                    for (let i = parts.length; i > 0; i--) {
                                        const testPath = parts.slice(0, i).join(' ');
                                        if (fs_1.default.existsSync(testPath)) {
                                            return testPath;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                catch {
                    continue;
                }
            }
        }
        catch {
            return undefined;
        }
        return undefined;
    }
    /**
     * 通过注册表获取 Edge 浏览器路径
     */
    getEdgePathFromRegistry() {
        try {
            const regPaths = [
                'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe',
                'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe',
                'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe'
            ];
            for (const regPath of regPaths) {
                try {
                    const regQuery = (0, child_process_1.execSync)(`reg query "${regPath}" /ve`, { encoding: "utf8", stdio: 'pipe' });
                    let match = regQuery.match(/"([^"]+)"/);
                    if (match) {
                        const browserPath = match[1].trim();
                        if (fs_1.default.existsSync(browserPath)) {
                            return browserPath;
                        }
                    }
                    else {
                        const lines = regQuery.split(/\r?\n/);
                        for (const line of lines) {
                            if (line.includes('REG_SZ')) {
                                match = line.match(/REG_SZ\s+(.+)$/);
                                if (match) {
                                    let browserPath = match[1].trim();
                                    if (fs_1.default.existsSync(browserPath)) {
                                        return browserPath;
                                    }
                                    const parts = browserPath.split(/\s+/);
                                    for (let i = parts.length; i > 0; i--) {
                                        const testPath = parts.slice(0, i).join(' ');
                                        if (fs_1.default.existsSync(testPath)) {
                                            return testPath;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                catch {
                    continue;
                }
            }
        }
        catch {
            return undefined;
        }
        return undefined;
    }
    getDefaultBrowserType() {
        try {
            const regQuery = (0, child_process_1.execSync)('reg query "HKEY_CLASSES_ROOT\\HTTP\\shell\\open\\command" /ve', { encoding: "utf8", stdio: 'pipe' });
            // 将注册表查询结果转为小写，便于搜索
            const lowerQuery = regQuery.toLowerCase();
            // 直接搜索浏览器类型字符串
            // 注意：先检查 Edge，因为 Chrome 路径可能包含 'chrome' 但 Edge 路径也可能包含 'chrome'（如 Chrome Edge）
            if (lowerQuery.includes('msedge') || lowerQuery.includes('edge')) {
                return interface_1.BrowserType.Edge;
            }
            else if (lowerQuery.includes('chrome')) {
                return interface_1.BrowserType.Chrome;
            }
        }
        catch {
            return undefined;
        }
        return undefined;
    }
    isBrowserInstalled(browserType) {
        if (browserType === interface_1.BrowserType.Chrome) {
            const chromePath = this.getChromePathFromRegistry();
            return chromePath !== undefined && fs_1.default.existsSync(chromePath);
        }
        else if (browserType === interface_1.BrowserType.Edge) {
            const edgePath = this.getEdgePathFromRegistry();
            return edgePath !== undefined && fs_1.default.existsSync(edgePath);
        }
        return false;
    }
    launchBrowser(browserType, url, port, userDataDir, completedCallback) {
        const args = `--remote-debugging-port=${port} --no-first-run --no-default-browser-check --user-data-dir="${userDataDir}" "${url}"`;
        try {
            if (browserType === interface_1.BrowserType.Chrome) {
                const chromePath = this.getChromePathFromRegistry();
                if (chromePath) {
                    (0, child_process_1.exec)(`start "" "${chromePath}" ${args}`, (error) => {
                        if (error) {
                            console.error(`❌ Failed to launch Chrome: ${error.message}`);
                        }
                        else {
                            console.log(`✅ Chrome launched with debugging port ${port}`);
                        }
                        if (completedCallback) {
                            completedCallback();
                        }
                    });
                    return;
                }
                (0, child_process_1.exec)(`start chrome.exe ${args}`, (error) => {
                    if (error) {
                        console.error(`❌ Failed to launch Chrome: ${error.message}`);
                    }
                    else {
                        console.log(`✅ Chrome launched with debugging port ${port}`);
                    }
                    if (completedCallback) {
                        completedCallback();
                    }
                });
            }
            else if (browserType === interface_1.BrowserType.Edge) {
                const edgePath = this.getEdgePathFromRegistry();
                if (edgePath) {
                    (0, child_process_1.exec)(`start "" "${edgePath}" ${args}`, (error) => {
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
                    return;
                }
                (0, child_process_1.exec)(`start msedge ${args}`, (error) => {
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
exports.RemoteDebuggingBrowserWin32 = RemoteDebuggingBrowserWin32;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luMzIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3BsYXRmb3Jtcy93ZWItY29tbW9uL3JlbW90ZS1kZWJ1Z2dpbmctYnJvd3Nlci93aW4zMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxpREFBK0M7QUFDL0MsNENBQW9CO0FBQ3BCLDJDQUFtRTtBQUVuRTs7R0FFRztBQUNILE1BQWEsMkJBQTJCO0lBQ3BDOztPQUVHO0lBQ0sseUJBQXlCO1FBQzdCLElBQUksQ0FBQztZQUNELE1BQU0sUUFBUSxHQUFHO2dCQUNiLHlGQUF5RjtnQkFDekYsc0dBQXNHO2dCQUN0Ryx3RkFBd0Y7YUFDM0YsQ0FBQztZQUVGLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQzdCLElBQUksQ0FBQztvQkFDRCxNQUFNLFFBQVEsR0FBRyxJQUFBLHdCQUFRLEVBQ3JCLGNBQWMsT0FBTyxPQUFPLEVBQzVCLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQ3RDLENBQUM7b0JBQ0YsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxLQUFLLEVBQUUsQ0FBQzt3QkFDUixNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ3BDLElBQUksWUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDOzRCQUM3QixPQUFPLFdBQVcsQ0FBQzt3QkFDdkIsQ0FBQztvQkFDTCxDQUFDO3lCQUFNLENBQUM7d0JBQ0osTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDdEMsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQzs0QkFDdkIsSUFBSSxJQUFJLENB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LENBQUM7NEJBQ3BCLGlCQUFpQixFQUFFLENBQUM7d0JBQ3hCLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsT0FBTztnQkFDWCxDQUFDO2dCQUNELElBQUEsb0JBQUksRUFBQyxnQkFBZ0IsSUFBSSxFQUFFLEVBQUUsQ0FBQyxLQUFVLEVBQUUsRUFBRTtvQkFDeEMsSUFBSSxLQUFLLEVBQUUsQ0FBQzt3QkFDUixPQUFPLENBQUMsS0FBSyxDQUFDLDRCQUE0QixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDL0QsQ0FBQzt5QkFBTSxDQUFDO3dCQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLElBQUksRUFBRSxDQUFDLENBQUM7b0JBQy9ELENBQUM7b0JBQ0QsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO3dCQUNwQixpQkFBaUIsRUFBRSxDQUFDO29CQUN4QixDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztRQUNMLENBQUM7UUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1lBQ2xCLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQzlELElBQUksaUJBQWlCLEVBQUUsQ0FBQztnQkFDcEIsaUJBQWlCLEVBQUUsQ0FBQztZQUN4QixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQW5ORCxrRUFtTkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleGVjLCBleGVjU3luYyB9IGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XHJcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcclxuaW1wb3J0IHsgQnJvd3NlclR5cGUsIElSZW1vdGVEZWJ1Z2dpbmdCcm93c2VyIH0gZnJvbSBcIi4vaW50ZXJmYWNlXCI7XHJcblxyXG4vKipcclxuICogV2luZG93cyDlubPlj7DnmoTov5znqIvosIPor5XmtY/op4jlmajlrp7njrBcclxuICovXHJcbmV4cG9ydCBjbGFzcyBSZW1vdGVEZWJ1Z2dpbmdCcm93c2VyV2luMzIgaW1wbGVtZW50cyBJUmVtb3RlRGVidWdnaW5nQnJvd3NlciB7XHJcbiAgICAvKipcclxuICAgICAqIOmAmui/h+azqOWGjOihqOiOt+WPliBDaHJvbWUg5rWP6KeI5Zmo6Lev5b6EXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0Q2hyb21lUGF0aEZyb21SZWdpc3RyeSgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlZ1BhdGhzID0gW1xyXG4gICAgICAgICAgICAgICAgJ0hLRVlfTE9DQUxfTUFDSElORVxcXFxTT0ZUV0FSRVxcXFxNaWNyb3NvZnRcXFxcV2luZG93c1xcXFxDdXJyZW50VmVyc2lvblxcXFxBcHAgUGF0aHNcXFxcY2hyb21lLmV4ZScsXHJcbiAgICAgICAgICAgICAgICAnSEtFWV9MT0NBTF9NQUNISU5FXFxcXFNPRlRXQVJFXFxcXFdPVzY0MzJOb2RlXFxcXE1pY3Jvc29mdFxcXFxXaW5kb3dzXFxcXEN1cnJlbnRWZXJzaW9uXFxcXEFwcCBQYXRoc1xcXFxjaHJvbWUuZXhlJyxcclxuICAgICAgICAgICAgICAgICdIS0VZX0NVUlJFTlRfVVNFUlxcXFxTT0ZUV0FSRVxcXFxNaWNyb3NvZnRcXFxcV2luZG93c1xcXFxDdXJyZW50VmVyc2lvblxcXFxBcHAgUGF0aHNcXFxcY2hyb21lLmV4ZSdcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVnUGF0aCBvZiByZWdQYXRocykge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWdRdWVyeSA9IGV4ZWNTeW5jKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgcmVnIHF1ZXJ5IFwiJHtyZWdQYXRofVwiIC92ZWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZW5jb2Rpbmc6IFwidXRmOFwiLCBzdGRpbzogJ3BpcGUnIH1cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IHJlZ1F1ZXJ5Lm1hdGNoKC9cIihbXlwiXSspXCIvKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYnJvd3NlclBhdGggPSBtYXRjaFsxXS50cmltKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGJyb3dzZXJQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJyb3dzZXJQYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGluZXMgPSByZWdRdWVyeS5zcGxpdCgvXFxyP1xcbi8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaW5lLmluY2x1ZGVzKCdSRUdfU1onKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoID0gbGluZS5tYXRjaCgvUkVHX1NaXFxzKyguKykkLyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBicm93c2VyUGF0aCA9IG1hdGNoWzFdLnRyaW0oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoYnJvd3NlclBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnJvd3NlclBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydHMgPSBicm93c2VyUGF0aC5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gcGFydHMubGVuZ3RoOyBpID4gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXN0UGF0aCA9IHBhcnRzLnNsaWNlKDAsIGkpLmpvaW4oJyAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHRlc3RQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0UGF0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpgJrov4fms6jlhozooajojrflj5YgRWRnZSDmtY/op4jlmajot6/lvoRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRFZGdlUGF0aEZyb21SZWdpc3RyeSgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlZ1BhdGhzID0gW1xyXG4gICAgICAgICAgICAgICAgJ0hLRVlfTE9DQUxfTUFDSElORVxcXFxTT0ZUV0FSRVxcXFxNaWNyb3NvZnRcXFxcV2luZG93c1xcXFxDdXJyZW50VmVyc2lvblxcXFxBcHAgUGF0aHNcXFxcbXNlZGdlLmV4ZScsXHJcbiAgICAgICAgICAgICAgICAnSEtFWV9MT0NBTF9NQUNISU5FXFxcXFNPRlRXQVJFXFxcXFdPVzY0MzJOb2RlXFxcXE1pY3Jvc29mdFxcXFxXaW5kb3dzXFxcXEN1cnJlbnRWZXJzaW9uXFxcXEFwcCBQYXRoc1xcXFxtc2VkZ2UuZXhlJyxcclxuICAgICAgICAgICAgICAgICdIS0VZX0NVUlJFTlRfVVNFUlxcXFxTT0ZUV0FSRVxcXFxNaWNyb3NvZnRcXFxcV2luZG93c1xcXFxDdXJyZW50VmVyc2lvblxcXFxBcHAgUGF0aHNcXFxcbXNlZGdlLmV4ZSdcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVnUGF0aCBvZiByZWdQYXRocykge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWdRdWVyeSA9IGV4ZWNTeW5jKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgcmVnIHF1ZXJ5IFwiJHtyZWdQYXRofVwiIC92ZWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZW5jb2Rpbmc6IFwidXRmOFwiLCBzdGRpbzogJ3BpcGUnIH1cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IHJlZ1F1ZXJ5Lm1hdGNoKC9cIihbXlwiXSspXCIvKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYnJvd3NlclBhdGggPSBtYXRjaFsxXS50cmltKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGJyb3dzZXJQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJyb3dzZXJQYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGluZXMgPSByZWdRdWVyeS5zcGxpdCgvXFxyP1xcbi8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaW5lLmluY2x1ZGVzKCdSRUdfU1onKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoID0gbGluZS5tYXRjaCgvUkVHX1NaXFxzKyguKykkLyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBicm93c2VyUGF0aCA9IG1hdGNoWzFdLnRyaW0oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoYnJvd3NlclBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnJvd3NlclBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydHMgPSBicm93c2VyUGF0aC5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gcGFydHMubGVuZ3RoOyBpID4gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXN0UGF0aCA9IHBhcnRzLnNsaWNlKDAsIGkpLmpvaW4oJyAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHRlc3RQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0UGF0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGVmYXVsdEJyb3dzZXJUeXBlKCk6IEJyb3dzZXJUeXBlIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCByZWdRdWVyeSA9IGV4ZWNTeW5jKFxyXG4gICAgICAgICAgICAgICAgJ3JlZyBxdWVyeSBcIkhLRVlfQ0xBU1NFU19ST09UXFxcXEhUVFBcXFxcc2hlbGxcXFxcb3BlblxcXFxjb21tYW5kXCIgL3ZlJyxcclxuICAgICAgICAgICAgICAgIHsgZW5jb2Rpbmc6IFwidXRmOFwiLCBzdGRpbzogJ3BpcGUnIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIOWwhuazqOWGjOihqOafpeivoue7k+aenOi9rOS4uuWwj+WGme+8jOS+v+S6juaQnOe0olxyXG4gICAgICAgICAgICBjb25zdCBsb3dlclF1ZXJ5ID0gcmVnUXVlcnkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIOebtOaOpeaQnOe0oua1j+iniOWZqOexu+Wei+Wtl+espuS4slxyXG4gICAgICAgICAgICAvLyDms6jmhI/vvJrlhYjmo4Dmn6UgRWRnZe+8jOWboOS4uiBDaHJvbWUg6Lev5b6E5Y+v6IO95YyF5ZCrICdjaHJvbWUnIOS9hiBFZGdlIOi3r+W+hOS5n+WPr+iDveWMheWQqyAnY2hyb21lJ++8iOWmgiBDaHJvbWUgRWRnZe+8iVxyXG4gICAgICAgICAgICBpZiAobG93ZXJRdWVyeS5pbmNsdWRlcygnbXNlZGdlJykgfHwgbG93ZXJRdWVyeS5pbmNsdWRlcygnZWRnZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQnJvd3NlclR5cGUuRWRnZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsb3dlclF1ZXJ5LmluY2x1ZGVzKCdjaHJvbWUnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJyb3dzZXJUeXBlLkNocm9tZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIGlzQnJvd3Nlckluc3RhbGxlZChicm93c2VyVHlwZTogQnJvd3NlclR5cGUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoYnJvd3NlclR5cGUgPT09IEJyb3dzZXJUeXBlLkNocm9tZSkge1xyXG4gICAgICAgICAgICBjb25zdCBjaHJvbWVQYXRoID0gdGhpcy5nZXRDaHJvbWVQYXRoRnJvbVJlZ2lzdHJ5KCk7XHJcbiAgICAgICAgICAgIHJldHVybiBjaHJvbWVQYXRoICE9PSB1bmRlZmluZWQgJiYgZnMuZXhpc3RzU3luYyhjaHJvbWVQYXRoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGJyb3dzZXJUeXBlID09PSBCcm93c2VyVHlwZS5FZGdlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVkZ2VQYXRoID0gdGhpcy5nZXRFZGdlUGF0aEZyb21SZWdpc3RyeSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gZWRnZVBhdGggIT09IHVuZGVmaW5lZCAmJiBmcy5leGlzdHNTeW5jKGVkZ2VQYXRoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGxhdW5jaEJyb3dzZXIoXHJcbiAgICAgICAgYnJvd3NlclR5cGU6IEJyb3dzZXJUeXBlLFxyXG4gICAgICAgIHVybDogc3RyaW5nLFxyXG4gICAgICAgIHBvcnQ6IG51bWJlcixcclxuICAgICAgICB1c2VyRGF0YURpcjogc3RyaW5nLFxyXG4gICAgICAgIGNvbXBsZXRlZENhbGxiYWNrPzogKCkgPT4gdm9pZFxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgYXJncyA9IGAtLXJlbW90ZS1kZWJ1Z2dpbmctcG9ydD0ke3BvcnR9IC0tbm8tZmlyc3QtcnVuIC0tbm8tZGVmYXVsdC1icm93c2VyLWNoZWNrIC0tdXNlci1kYXRhLWRpcj1cIiR7dXNlckRhdGFEaXJ9XCIgXCIke3VybH1cImA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGJyb3dzZXJUeXBlID09PSBCcm93c2VyVHlwZS5DaHJvbWUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNocm9tZVBhdGggPSB0aGlzLmdldENocm9tZVBhdGhGcm9tUmVnaXN0cnkoKTtcclxuICAgICAgICAgICAgICAgIGlmIChjaHJvbWVQYXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhlYyhgc3RhcnQgXCJcIiBcIiR7Y2hyb21lUGF0aH1cIiAke2FyZ3N9YCwgKGVycm9yOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGDinYwgRmFpbGVkIHRvIGxhdW5jaCBDaHJvbWU6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUgQ2hyb21lIGxhdW5jaGVkIHdpdGggZGVidWdnaW5nIHBvcnQgJHtwb3J0fWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb21wbGV0ZWRDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGV4ZWMoYHN0YXJ0IGNocm9tZS5leGUgJHthcmdzfWAsIChlcnJvcjogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBGYWlsZWQgdG8gbGF1bmNoIENocm9tZTogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUgQ2hyb21lIGxhdW5jaGVkIHdpdGggZGVidWdnaW5nIHBvcnQgJHtwb3J0fWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcGxldGVkQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChicm93c2VyVHlwZSA9PT0gQnJvd3NlclR5cGUuRWRnZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZWRnZVBhdGggPSB0aGlzLmdldEVkZ2VQYXRoRnJvbVJlZ2lzdHJ5KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWRnZVBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBleGVjKGBzdGFydCBcIlwiIFwiJHtlZGdlUGF0aH1cIiAke2FyZ3N9YCwgKGVycm9yOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGDinYwgRmFpbGVkIHRvIGxhdW5jaCBFZGdlOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg4pyFIEVkZ2UgbGF1bmNoZWQgd2l0aCBkZWJ1Z2dpbmcgcG9ydCAke3BvcnR9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBsZXRlZENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWRDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZXhlYyhgc3RhcnQgbXNlZGdlICR7YXJnc31gLCAoZXJyb3I6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGDinYwgRmFpbGVkIHRvIGxhdW5jaCBFZGdlOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOKchSBFZGdlIGxhdW5jaGVkIHdpdGggZGVidWdnaW5nIHBvcnQgJHtwb3J0fWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcGxldGVkQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihg4p2MIEZhaWxlZCB0byBsYXVuY2ggYnJvd3NlcjogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICAgICAgICBpZiAoY29tcGxldGVkQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbiJdfQ==