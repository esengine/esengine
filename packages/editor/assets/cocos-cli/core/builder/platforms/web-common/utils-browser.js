"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserType = void 0;
exports.connectToChromeDevTools = connectToChromeDevTools;
exports.openUrl = openUrl;
exports.openUrlAsync = openUrlAsync;
const child_process_1 = require("child_process");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const ws_1 = __importDefault(require("ws"));
const remote_debugging_browser_1 = require("./remote-debugging-browser");
Object.defineProperty(exports, "BrowserType", { enumerable: true, get: function () { return remote_debugging_browser_1.BrowserType; } });
/**
 * openDebuggingBrowser的流程图如下
 * %% 主流程：启动带调试模式的浏览器
flowchart TD
    A([开始]) --> B["定义支持浏览器数组<br>['chrome','edge']"]
    B --> C{"用户是否指定<br>browserType ?"}
    C -->|是| G
    C -->|否| D["调用 获取已安装浏览器<br>得到 browserType"]
    D --> E{" browserType<br>存在 ?"}
    E -->|否| F["提示用户下载并安装<br>支持数组第一项，流程结束"]
    E -->|是| G["以 --remote-debugging-port=9222<br>启动 browserType，流程结束"]

%% 子流程：获取已安装浏览器
flowchart TD
    A([开始]) --> B["定义支持浏览器数组<br>['chrome','edge']"]
    B --> C["获取系统默认浏览器<br>defaultBrowser"]
    C --> D{" defaultBrowser<br>存在且在数组中 ?"}
    D -->|是| E["返回 defaultBrowser<br>流程结束"]
    D -->|否| F["按数组顺序依次检查<br>是否已安装"]
    F --> G{" 找到第一个<br>已安装 ?"}
    G -->|是| H["返回该 browserType<br>流程结束"]
    G -->|否| I["返回空<br>流程结束"]
 */
/**
 * 启动带调试端口的浏览器（按照流程图逻辑）
 * @param url 要打开的 URL
 * @param port 远程调试端口，默认 9222
 * @param browserType 可选的浏览器类型，如果不提供则自动检测
 * @param completedCallback 浏览器启动完成后的回调函数
 */
function openDebuggingBrowser(url, port, browserType, completedCallback) {
    console.log(`🚀 Launching browser with debugging port ${port}...`);
    // 设置 user-data-dir 以避免与正常浏览器实例冲突
    const userDataDir = (0, os_1.platform)() === 'win32'
        ? path_1.default.join(process.env.TEMP || process.env.TMP || (0, os_1.tmpdir)(), "chrome-debug")
        : path_1.default.join((0, os_1.tmpdir)(), "chrome-debug");
    (0, remote_debugging_browser_1.launchRemoteDebuggingBrowser)(url, port, browserType, userDataDir, () => {
        console.log(`📡 Debugging URL: http://127.0.0.1:${port}`);
        if (completedCallback) {
            completedCallback();
        }
    });
}
/**
 * 使用系统默认命令打开浏览器
 * @param url 要打开的 URL
 * @param completedCallback 浏览器打开完成后的回调函数
 */
function openBrowser(url, completedCallback) {
    const currentPlatform = process.platform;
    let command;
    switch (currentPlatform) {
        case 'win32':
            command = `start ${url}`;
            break;
        case 'darwin':
            command = `open ${url}`;
            break;
        case 'linux':
            command = `xdg-open ${url}`;
            break;
        default:
            console.log(`请手动打开浏览器访问: ${url}`);
            if (completedCallback) {
                completedCallback();
            }
            return;
    }
    //@ts-expect-error
    //hack: when run on pink use simple browser instead of default browser
    if (process && process.addGlobalOpenUrl) {
        //@ts-expect-error
        process.addGlobalOpenUrl(url);
        if (completedCallback) {
            completedCallback();
        }
        return;
    }
    if (command) {
        (0, child_process_1.exec)(command, (error) => {
            if (error) {
                console.error('打开浏览器失败:', error.message);
                console.log(`请手动打开浏览器访问: ${url}`);
            }
            else {
                console.log(`正在浏览器中打开: ${url}`);
            }
            // 无论成功或失败都调用回调
            if (completedCallback) {
                completedCallback();
            }
        });
    }
    else if (completedCallback) {
        completedCallback();
    }
}
/**
 * 连接到 Chrome DevTools Protocol 并监听浏览器日志
 * @param port 远程调试端口，默认 9222
 * @param targetUrl 目标 URL，用于匹配正确的调试目标
 * @param retries 重试次数，默认 5 次
 * @param retryDelay 重试延迟（毫秒），默认 1000ms
 */
async function connectToChromeDevTools(port = 9222, targetUrl, retries = 5, retryDelay = 1000) {
    return new Promise((resolve) => {
        // 获取调试目标列表
        const requestUrl = `http://127.0.0.1:${port}/json`;
        (0, http_1.get)(requestUrl, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const targets = JSON.parse(data);
                    // 查找匹配的目标（优先匹配 URL）
                    let target = targets.find((t) => targetUrl && t.url && t.url.includes(targetUrl));
                    // 如果没有找到匹配的，使用第一个 page 类型的目标
                    if (!target) {
                        target = targets.find((t) => t.type === 'page');
                    }
                    if (!target) {
                        console.warn(`未找到可用的调试目标，端口: ${port}`);
                        resolve();
                        return;
                    }
                    const wsUrl = target.webSocketDebuggerUrl;
                    if (!wsUrl) {
                        console.warn(`调试目标没有 WebSocket URL`);
                        resolve();
                        return;
                    }
                    // 连接到 WebSocket
                    const ws = new ws_1.default(wsUrl);
                    let messageId = 1;
                    ws.on('open', () => {
                        console.log(`🔗 已连接到浏览器调试端口 ${port}`);
                        // 发送 Runtime.enable 命令
                        ws.send(JSON.stringify({
                            id: messageId++,
                            method: 'Runtime.enable',
                            params: {}
                        }));
                        // 发送 Log.enable 命令
                        ws.send(JSON.stringify({
                            id: messageId++,
                            method: 'Log.enable',
                            params: {}
                        }));
                        // 发送 Runtime.runIfWaitingForDebugger 命令（如果需要）
                        ws.send(JSON.stringify({
                            id: messageId++,
                            method: 'Runtime.runIfWaitingForDebugger',
                            params: {}
                        }));
                    });
                    ws.on('message', (data) => {
                        try {
                            const message = JSON.parse(data.toString());
                            // 处理 Log.entryAdded 事件
                            if (message.method === 'Log.entryAdded') {
                                const entry = message.params.entry;
                                const level = entry.level || 'info';
                                const text = entry.text || '';
                                // 处理聚合消息 (Chrome 可能会聚合相同的日志)
                                // 注意：CDP 的 Log.entryAdded 可能不包含 count 属性，这里预留扩展
                                // 如果使用了 Console.messageAdded (已废弃) 或其它事件可能会有
                                // 格式化日志消息
                                const logMessage = `[Browser ${level.toUpperCase()}] ${text}`;
                                // 根据日志级别输出到 console
                                switch (level) {
                                    case 'error':
                                        console.error(logMessage);
                                        break;
                                    case 'warning':
                                        console.warn(logMessage);
                                        break;
                                    case 'info':
                                    case 'verbose':
                                    default:
                                        console.log(logMessage);
                                        break;
                                }
                            }
                            // 处理 Runtime.consoleAPICalled 事件（console.log 等）
                            if (message.method === 'Runtime.consoleAPICalled') {
                                const params = message.params;
                                const type = params.type || 'log';
                                const args = params.args || [];
                                // 辅助函数：格式化 RemoteObject
                                const formatRemoteObject = (arg) => {
                                    if (arg.type === 'string') {
                                        return arg.value;
                                    }
                                    // 优先显示具体值
                                    if (arg.value !== undefined) {
                                        // 处理 undefined, null, boolean, number
                                        return String(arg.value);
                                    }
                                    // 处理对象预览
                                    let str = arg.description || '';
                                    if (arg.preview && arg.preview.properties) {
                                        const props = arg.preview.properties
                                            .map((p) => `${p.name}: ${p.value || (p.type === 'string' ? `"${p.value}"` : p.type)}`)
                                            .join(', ');
                                        // 如果是 Array，格式稍有不同
                                        if (arg.subtype === 'array') {
                                            str = `${arg.description || 'Array'} [${props}]`;
                                        }
                                        else if (arg.subtype === 'error') {
                                            // Error 类型通常 description 已经包含了名字和消息，不需要 preview 属性
                                            str = arg.description;
                                        }
                                        else {
                                            str = `${arg.description || 'Object'} { ${props} }`;
                                        }
                                    }
                                    return str;
                                };
                                // 将参数转换为字符串
                                const messages = args.map(formatRemoteObject);
                                const consoleMessage = `[Browser Console.${type}] ${messages.join(' ')}`;
                                // 根据 console 类型输出
                                switch (type) {
                                    case 'error':
                                    case 'assert':
                                        console.error(consoleMessage);
                                        break;
                                    case 'warning':
                                        console.warn(consoleMessage);
                                        break;
                                    case 'info':
                                        console.info(consoleMessage);
                                        break;
                                    case 'debug':
                                    case 'trace':
                                        console.debug(consoleMessage);
                                        break;
                                    case 'clear':
                                        // 忽略 clear 或输出提示
                                        break;
                                    default:
                                        console.log(consoleMessage);
                                        break;
                                }
                            }
                            // 处理 Runtime.exceptionThrown 事件（未捕获的异常）
                            if (message.method === 'Runtime.exceptionThrown') {
                                const params = message.params;
                                const exceptionDetails = params.exceptionDetails;
                                const text = exceptionDetails.text; // 通常是 "Uncaught"
                                const exception = exceptionDetails.exception;
                                const description = exception ? (exception.description || exception.value) : '';
                                const url = exceptionDetails.url || '';
                                const line = exceptionDetails.lineNumber;
                                const col = exceptionDetails.columnNumber;
                                let errorMsg = `[Browser Error] ${text}`;
                                if (description) {
                                    errorMsg += `: ${description}`;
                                }
                                if (url) {
                                    errorMsg += `\n    at ${url}:${line}:${col}`;
                                }
                                console.error(errorMsg);
                            }
                        }
                        catch (error) {
                            // 打印解析失败的原因，防止静默吞掉消息
                            if (process.env.NODE_ENV === 'development') {
                                console.debug(`[WS Processing Error] Failed to process message: ${error.message}`);
                            }
                        }
                    });
                    ws.on('error', (error) => {
                        console.warn(`WebSocket 连接错误: ${error.message}`);
                        resolve(); // 不 reject，允许继续执行
                    });
                    ws.on('close', () => {
                        console.log(`🔌 浏览器调试连接已关闭`);
                    });
                    // 连接成功
                    resolve();
                }
                catch (error) {
                    console.warn(`解析调试目标列表失败: ${error.message}`);
                    resolve(); // 不 reject，允许继续执行
                }
            });
        }).on('error', async (error) => {
            // 如果无法连接到调试端口，可能是浏览器还没启动，尝试重试
            if (retries > 0) {
                console.debug(`无法连接到调试端口 ${port}，${retries} 次重试后重试...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                await connectToChromeDevTools(port, targetUrl, retries - 1, retryDelay);
            }
            else {
                console.debug(`无法连接到调试端口 ${port}: ${error.message}`);
            }
            resolve(); // 允许继续执行
        });
    });
}
/**
 * 打开 URL
 * @param url 要打开的 URL
 * @param options 选项
 * @param completedCallback 浏览器打开完成后的回调函数
 */
function openUrl(url, options = {}, completedCallback) {
    const { remoteDebuggingMode = false, port = 9222 } = options;
    if (remoteDebuggingMode) {
        // 自动检测并使用已安装的浏览器
        openDebuggingBrowser(url, port, undefined, completedCallback);
        return;
    }
    // 回退到默认浏览器打开方式
    openBrowser(url, completedCallback);
}
/**
 * 异步打开 URL，在浏览器打开完成时 resolve
 * @param url 要打开的 URL
 * @param options 选项
 * @returns Promise，在浏览器打开完成时 resolve
 */
function openUrlAsync(url, options = {}) {
    return new Promise((resolve) => {
        openUrl(url, options, () => {
            resolve();
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMtYnJvd3Nlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2J1aWxkZXIvcGxhdGZvcm1zL3dlYi1jb21tb24vdXRpbHMtYnJvd3Nlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFtSUEsMERBc09DO0FBUUQsMEJBY0M7QUFRRCxvQ0FNQztBQTdZRCxpREFBcUM7QUFDckMsMkJBQXNDO0FBQ3RDLGdEQUF3QjtBQUN4QiwrQkFBc0M7QUFDdEMsNENBQTJCO0FBQzNCLHlFQUF1RjtBQUc5RSw0RkFIQSxzQ0FBVyxPQUdBO0FBWXBCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBRUg7Ozs7OztHQU1HO0FBQ0gsU0FBUyxvQkFBb0IsQ0FBQyxHQUFXLEVBQUUsSUFBWSxFQUFFLFdBQXlCLEVBQUUsaUJBQThCO0lBQzlHLE9BQU8sQ0FBQyxHQUFHLENBQUMsNENBQTRDLElBQUksS0FBSyxDQUFDLENBQUM7SUFFbkUsaUNBQWlDO0lBQ2pDLE1BQU0sV0FBVyxHQUFHLElBQUEsYUFBUSxHQUFFLEtBQUssT0FBTztRQUN0QyxDQUFDLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxJQUFBLFdBQU0sR0FBRSxFQUFFLGNBQWMsQ0FBQztRQUM1RSxDQUFDLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxJQUFBLFdBQU0sR0FBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBRTFDLElBQUEsdURBQTRCLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRTtRQUNuRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNDQUFzQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzFELElBQUksaUJBQWlCLEVBQUUsQ0FBQztZQUNwQixpQkFBaUIsRUFBRSxDQUFDO1FB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TyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFO1lBQ3ZCLE9BQU8sRUFBRSxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleGVjIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcclxuaW1wb3J0IHsgcGxhdGZvcm0sIHRtcGRpciB9IGZyb20gXCJvc1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBnZXQgYXMgaHR0cEdldCB9IGZyb20gXCJodHRwXCI7XHJcbmltcG9ydCBXZWJTb2NrZXQgZnJvbSBcIndzXCI7XHJcbmltcG9ydCB7IEJyb3dzZXJUeXBlLCBsYXVuY2hSZW1vdGVEZWJ1Z2dpbmdCcm93c2VyIH0gZnJvbSBcIi4vcmVtb3RlLWRlYnVnZ2luZy1icm93c2VyXCI7XHJcblxyXG4vLyDlr7zlh7ogQnJvd3NlclR5cGUg5L6b5aSW6YOo5L2/55SoXHJcbmV4cG9ydCB7IEJyb3dzZXJUeXBlIH07XHJcblxyXG4vKipcclxuICogb3BlblVybCDlh73mlbDnmoTpgInpobnnsbvlnotcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgT3BlblVybE9wdGlvbnMge1xyXG4gICAgLyoqIOaYr+WQpuWQr+eUqOi/nOeoi+iwg+ivleaooeW8j++8jOm7mOiupCBmYWxzZSAqL1xyXG4gICAgcmVtb3RlRGVidWdnaW5nTW9kZT86IGJvb2xlYW47XHJcbiAgICAvKiog6L+c56iL6LCD6K+V56uv5Y+j77yM5LuF5ZyoIHJlbW90ZURlYnVnZ2luZ01vZGUg5Li6IHRydWUg5pe25pyJ5pWI77yM6buY6K6kIDkyMjIgKi9cclxuICAgIHBvcnQ/OiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBvcGVuRGVidWdnaW5nQnJvd3NlcueahOa1geeoi+WbvuWmguS4i1xyXG4gKiAlJSDkuLvmtYHnqIvvvJrlkK/liqjluKbosIPor5XmqKHlvI/nmoTmtY/op4jlmahcclxuZmxvd2NoYXJ0IFREXHJcbiAgICBBKFvlvIDlp4tdKSAtLT4gQltcIuWumuS5ieaUr+aMgea1j+iniOWZqOaVsOe7hDxicj5bJ2Nocm9tZScsJ2VkZ2UnXVwiXVxyXG4gICAgQiAtLT4gQ3tcIueUqOaIt+aYr+WQpuaMh+Wumjxicj5icm93c2VyVHlwZSA/XCJ9XHJcbiAgICBDIC0tPnzmmK98IEdcclxuICAgIEMgLS0+fOWQpnwgRFtcIuiwg+eUqCDojrflj5blt7Llronoo4XmtY/op4jlmag8YnI+5b6X5YiwIGJyb3dzZXJUeXBlXCJdXHJcbiAgICBEIC0tPiBFe1wiIGJyb3dzZXJUeXBlPGJyPuWtmOWcqCA/XCJ9XHJcbiAgICBFIC0tPnzlkKZ8IEZbXCLmj5DnpLrnlKjmiLfkuIvovb3lubblronoo4U8YnI+5pSv5oyB5pWw57uE56ys5LiA6aG577yM5rWB56iL57uT5p2fXCJdXHJcbiAgICBFIC0tPnzmmK98IEdbXCLku6UgLS1yZW1vdGUtZGVidWdnaW5nLXBvcnQ9OTIyMjxicj7lkK/liqggYnJvd3NlclR5cGXvvIzmtYHnqIvnu5PmnZ9cIl1cclxuXHJcbiUlIOWtkOa1geeoi++8muiOt+WPluW3suWuieijhea1j+iniOWZqFxyXG5mbG93Y2hhcnQgVERcclxuICAgIEEoW+W8gOWni10pIC0tPiBCW1wi5a6a5LmJ5pSv5oyB5rWP6KeI5Zmo5pWw57uEPGJyPlsnY2hyb21lJywnZWRnZSddXCJdXHJcbiAgICBCIC0tPiBDW1wi6I635Y+W57O757uf6buY6K6k5rWP6KeI5ZmoPGJyPmRlZmF1bHRCcm93c2VyXCJdXHJcbiAgICBDIC0tPiBEe1wiIGRlZmF1bHRCcm93c2VyPGJyPuWtmOWcqOS4lOWcqOaVsOe7hOS4rSA/XCJ9XHJcbiAgICBEIC0tPnzmmK98IEVbXCLov5Tlm54gZGVmYXVsdEJyb3dzZXI8YnI+5rWB56iL57uT5p2fXCJdXHJcbiAgICBEIC0tPnzlkKZ8IEZbXCLmjInmlbDnu4Tpobrluo/kvp3mrKHmo4Dmn6U8YnI+5piv5ZCm5bey5a6J6KOFXCJdXHJcbiAgICBGIC0tPiBHe1wiIOaJvuWIsOesrOS4gOS4qjxicj7lt7Llronoo4UgP1wifVxyXG4gICAgRyAtLT585pivfCBIW1wi6L+U5Zue6K+lIGJyb3dzZXJUeXBlPGJyPua1geeoi+e7k+adn1wiXVxyXG4gICAgRyAtLT585ZCmfCBJW1wi6L+U5Zue56m6PGJyPua1geeoi+e7k+adn1wiXVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiDlkK/liqjluKbosIPor5Xnq6/lj6PnmoTmtY/op4jlmajvvIjmjInnhafmtYHnqIvlm77pgLvovpHvvIlcclxuICogQHBhcmFtIHVybCDopoHmiZPlvIDnmoQgVVJMXHJcbiAqIEBwYXJhbSBwb3J0IOi/nOeoi+iwg+ivleerr+WPo++8jOm7mOiupCA5MjIyXHJcbiAqIEBwYXJhbSBicm93c2VyVHlwZSDlj6/pgInnmoTmtY/op4jlmajnsbvlnovvvIzlpoLmnpzkuI3mj5DkvpvliJnoh6rliqjmo4DmtYtcclxuICogQHBhcmFtIGNvbXBsZXRlZENhbGxiYWNrIOa1j+iniOWZqOWQr+WKqOWujOaIkOWQjueahOWbnuiwg+WHveaVsFxyXG4gKi9cclxuZnVuY3Rpb24gb3BlbkRlYnVnZ2luZ0Jyb3dzZXIodXJsOiBzdHJpbmcsIHBvcnQ6IG51bWJlciwgYnJvd3NlclR5cGU/OiBCcm93c2VyVHlwZSwgY29tcGxldGVkQ2FsbGJhY2s/OiAoKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICBjb25zb2xlLmxvZyhg8J+agCBMYXVuY2hpbmcgYnJvd3NlciB3aXRoIGRlYnVnZ2luZyBwb3J0ICR7cG9ydH0uLi5gKTtcclxuXHJcbiAgICAvLyDorr7nva4gdXNlci1kYXRhLWRpciDku6Xpgb/lhY3kuI7mraPluLjmtY/op4jlmajlrp7kvovlhrLnqoFcclxuICAgIGNvbnN0IHVzZXJEYXRhRGlyID0gcGxhdGZvcm0oKSA9PT0gJ3dpbjMyJ1xyXG4gICAgICAgID8gcGF0aC5qb2luKHByb2Nlc3MuZW52LlRFTVAgfHwgcHJvY2Vzcy5lbnYuVE1QIHx8IHRtcGRpcigpLCBcImNocm9tZS1kZWJ1Z1wiKVxyXG4gICAgICAgIDogcGF0aC5qb2luKHRtcGRpcigpLCBcImNocm9tZS1kZWJ1Z1wiKTtcclxuXHJcbiAgICBsYXVuY2hSZW1vdGVEZWJ1Z2dpbmdCcm93c2VyKHVybCwgcG9ydCwgYnJvd3NlclR5cGUsIHVzZXJEYXRhRGlyLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYPCfk6EgRGVidWdnaW5nIFVSTDogaHR0cDovLzEyNy4wLjAuMToke3BvcnR9YCk7XHJcbiAgICAgICAgaWYgKGNvbXBsZXRlZENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGNvbXBsZXRlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkvb/nlKjns7vnu5/pu5jorqTlkb3ku6TmiZPlvIDmtY/op4jlmahcclxuICogQHBhcmFtIHVybCDopoHmiZPlvIDnmoQgVVJMXHJcbiAqIEBwYXJhbSBjb21wbGV0ZWRDYWxsYmFjayDmtY/op4jlmajmiZPlvIDlrozmiJDlkI7nmoTlm57osIPlh73mlbBcclxuICovXHJcbmZ1bmN0aW9uIG9wZW5Ccm93c2VyKHVybDogc3RyaW5nLCBjb21wbGV0ZWRDYWxsYmFjaz86ICgpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGN1cnJlbnRQbGF0Zm9ybSA9IHByb2Nlc3MucGxhdGZvcm07XHJcblxyXG4gICAgbGV0IGNvbW1hbmQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgIHN3aXRjaCAoY3VycmVudFBsYXRmb3JtKSB7XHJcbiAgICAgICAgY2FzZSAnd2luMzInOlxyXG4gICAgICAgICAgICBjb21tYW5kID0gYHN0YXJ0ICR7dXJsfWA7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2Rhcndpbic6XHJcbiAgICAgICAgICAgIGNvbW1hbmQgPSBgb3BlbiAke3VybH1gO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdsaW51eCc6XHJcbiAgICAgICAgICAgIGNvbW1hbmQgPSBgeGRnLW9wZW4gJHt1cmx9YDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYOivt+aJi+WKqOaJk+W8gOa1j+iniOWZqOiuv+mXrjogJHt1cmx9YCk7XHJcbiAgICAgICAgICAgIGlmIChjb21wbGV0ZWRDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgY29tcGxldGVkQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy9AdHMtZXhwZWN0LWVycm9yXHJcbiAgICAvL2hhY2s6IHdoZW4gcnVuIG9uIHBpbmsgdXNlIHNpbXBsZSBicm93c2VyIGluc3RlYWQgb2YgZGVmYXVsdCBicm93c2VyXHJcbiAgICBpZiAocHJvY2VzcyAmJiBwcm9jZXNzLmFkZEdsb2JhbE9wZW5VcmwpIHtcclxuICAgICAgICAvL0B0cy1leHBlY3QtZXJyb3JcclxuICAgICAgICBwcm9jZXNzLmFkZEdsb2JhbE9wZW5VcmwodXJsKTtcclxuICAgICAgICBpZiAoY29tcGxldGVkQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgY29tcGxldGVkQ2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjb21tYW5kKSB7XHJcbiAgICAgICAgZXhlYyhjb21tYW5kLCAoZXJyb3I6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+aJk+W8gOa1j+iniOWZqOWksei0pTonLCBlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDor7fmiYvliqjmiZPlvIDmtY/op4jlmajorr/pl646ICR7dXJsfWApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOato+WcqOa1j+iniOWZqOS4reaJk+W8gDogJHt1cmx9YCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIOaXoOiuuuaIkOWKn+aIluWksei0pemDveiwg+eUqOWbnuiwg1xyXG4gICAgICAgICAgICBpZiAoY29tcGxldGVkQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0gZWxzZSBpZiAoY29tcGxldGVkQ2FsbGJhY2spIHtcclxuICAgICAgICBjb21wbGV0ZWRDYWxsYmFjaygpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog6L+e5o6l5YiwIENocm9tZSBEZXZUb29scyBQcm90b2NvbCDlubbnm5HlkKzmtY/op4jlmajml6Xlv5dcclxuICogQHBhcmFtIHBvcnQg6L+c56iL6LCD6K+V56uv5Y+j77yM6buY6K6kIDkyMjJcclxuICogQHBhcmFtIHRhcmdldFVybCDnm67moIcgVVJM77yM55So5LqO5Yy56YWN5q2j56Gu55qE6LCD6K+V55uu5qCHXHJcbiAqIEBwYXJhbSByZXRyaWVzIOmHjeivleasoeaVsO+8jOm7mOiupCA1IOasoVxyXG4gKiBAcGFyYW0gcmV0cnlEZWxheSDph43or5Xlu7bov5/vvIjmr6vnp5LvvInvvIzpu5jorqQgMTAwMG1zXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29ubmVjdFRvQ2hyb21lRGV2VG9vbHMoXHJcbiAgICBwb3J0OiBudW1iZXIgPSA5MjIyLFxyXG4gICAgdGFyZ2V0VXJsPzogc3RyaW5nLFxyXG4gICAgcmV0cmllczogbnVtYmVyID0gNSxcclxuICAgIHJldHJ5RGVsYXk6IG51bWJlciA9IDEwMDBcclxuKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAvLyDojrflj5bosIPor5Xnm67moIfliJfooahcclxuICAgICAgICBjb25zdCByZXF1ZXN0VXJsID0gYGh0dHA6Ly8xMjcuMC4wLjE6JHtwb3J0fS9qc29uYDtcclxuXHJcbiAgICAgICAgaHR0cEdldChyZXF1ZXN0VXJsLCAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gJyc7XHJcblxyXG4gICAgICAgICAgICByZXMub24oJ2RhdGEnLCAoY2h1bmspID0+IHtcclxuICAgICAgICAgICAgICAgIGRhdGEgKz0gY2h1bms7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmVzLm9uKCdlbmQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldHMgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyDmn6Xmib7ljLnphY3nmoTnm67moIfvvIjkvJjlhYjljLnphY0gVVJM77yJXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9IHRhcmdldHMuZmluZCgodDogYW55KSA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRVcmwgJiYgdC51cmwgJiYgdC51cmwuaW5jbHVkZXModGFyZ2V0VXJsKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWmguaenOayoeacieaJvuWIsOWMuemFjeeahO+8jOS9v+eUqOesrOS4gOS4qiBwYWdlIOexu+Wei+eahOebruagh1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldHMuZmluZCgodDogYW55KSA9PiB0LnR5cGUgPT09ICdwYWdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYOacquaJvuWIsOWPr+eUqOeahOiwg+ivleebruagh++8jOerr+WPozogJHtwb3J0fWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdzVXJsID0gdGFyZ2V0LndlYlNvY2tldERlYnVnZ2VyVXJsO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghd3NVcmwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGDosIPor5Xnm67moIfmsqHmnIkgV2ViU29ja2V0IFVSTGApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOi/nuaOpeWIsCBXZWJTb2NrZXRcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB3cyA9IG5ldyBXZWJTb2NrZXQod3NVcmwpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlSWQgPSAxO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB3cy5vbignb3BlbicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYPCflJcg5bey6L+e5o6l5Yiw5rWP6KeI5Zmo6LCD6K+V56uv5Y+jICR7cG9ydH1gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWPkemAgSBSdW50aW1lLmVuYWJsZSDlkb3ku6RcclxuICAgICAgICAgICAgICAgICAgICAgICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogbWVzc2FnZUlkKyssXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdSdW50aW1lLmVuYWJsZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHt9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWPkemAgSBMb2cuZW5hYmxlIOWRveS7pFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBtZXNzYWdlSWQrKyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0xvZy5lbmFibGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlj5HpgIEgUnVudGltZS5ydW5JZldhaXRpbmdGb3JEZWJ1Z2dlciDlkb3ku6TvvIjlpoLmnpzpnIDopoHvvIlcclxuICAgICAgICAgICAgICAgICAgICAgICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogbWVzc2FnZUlkKyssXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdSdW50aW1lLnJ1bklmV2FpdGluZ0ZvckRlYnVnZ2VyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczoge31cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB3cy5vbignbWVzc2FnZScsIChkYXRhOiBXZWJTb2NrZXQuRGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IEpTT04ucGFyc2UoZGF0YS50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDlpITnkIYgTG9nLmVudHJ5QWRkZWQg5LqL5Lu2XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobWVzc2FnZS5tZXRob2QgPT09ICdMb2cuZW50cnlBZGRlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbnRyeSA9IG1lc3NhZ2UucGFyYW1zLmVudHJ5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxldmVsID0gZW50cnkubGV2ZWwgfHwgJ2luZm8nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSBlbnRyeS50ZXh0IHx8ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWkhOeQhuiBmuWQiOa2iOaBryAoQ2hyb21lIOWPr+iDveS8muiBmuWQiOebuOWQjOeahOaXpeW/lylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDms6jmhI/vvJpDRFAg55qEIExvZy5lbnRyeUFkZGVkIOWPr+iDveS4jeWMheWQqyBjb3VudCDlsZ7mgKfvvIzov5nph4zpooTnlZnmianlsZVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzkvb/nlKjkuoYgQ29uc29sZS5tZXNzYWdlQWRkZWQgKOW3suW6n+W8gykg5oiW5YW25a6D5LqL5Lu25Y+v6IO95Lya5pyJXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5qC85byP5YyW5pel5b+X5raI5oGvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9nTWVzc2FnZSA9IGBbQnJvd3NlciAke2xldmVsLnRvVXBwZXJDYXNlKCl9XSAke3RleHR9YDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5qC55o2u5pel5b+X57qn5Yir6L6T5Ye65YiwIGNvbnNvbGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGxldmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IobG9nTWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnd2FybmluZyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4obG9nTWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnaW5mbyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3ZlcmJvc2UnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobG9nTWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5aSE55CGIFJ1bnRpbWUuY29uc29sZUFQSUNhbGxlZCDkuovku7bvvIhjb25zb2xlLmxvZyDnrYnvvIlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLm1ldGhvZCA9PT0gJ1J1bnRpbWUuY29uc29sZUFQSUNhbGxlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJhbXMgPSBtZXNzYWdlLnBhcmFtcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gcGFyYW1zLnR5cGUgfHwgJ2xvZyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJncyA9IHBhcmFtcy5hcmdzIHx8IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDovoXliqnlh73mlbDvvJrmoLzlvI/ljJYgUmVtb3RlT2JqZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZm9ybWF0UmVtb3RlT2JqZWN0ID0gKGFyZzogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmcudHlwZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhcmcudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5LyY5YWI5pi+56S65YW35L2T5YC8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmcudmFsdWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5aSE55CGIHVuZGVmaW5lZCwgbnVsbCwgYm9vbGVhbiwgbnVtYmVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3RyaW5nKGFyZy52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWkhOeQhuWvueixoemihOiniFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RyID0gYXJnLmRlc2NyaXB0aW9uIHx8ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJnLnByZXZpZXcgJiYgYXJnLnByZXZpZXcucHJvcGVydGllcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcHMgPSBhcmcucHJldmlldy5wcm9wZXJ0aWVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgocDogYW55KSA9PiBgJHtwLm5hbWV9OiAke3AudmFsdWUgfHwgKHAudHlwZSA9PT0gJ3N0cmluZycgPyBgXCIke3AudmFsdWV9XCJgIDogcC50eXBlKX1gKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5qb2luKCcsICcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c5pivIEFycmF577yM5qC85byP56iN5pyJ5LiN5ZCMXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJnLnN1YnR5cGUgPT09ICdhcnJheScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgPSBgJHthcmcuZGVzY3JpcHRpb24gfHwgJ0FycmF5J30gWyR7cHJvcHN9XWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFyZy5zdWJ0eXBlID09PSAnZXJyb3InKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXJyb3Ig57G75Z6L6YCa5bi4IGRlc2NyaXB0aW9uIOW3sue7j+WMheWQq+S6huWQjeWtl+WSjOa2iOaBr++8jOS4jemcgOimgSBwcmV2aWV3IOWxnuaAp1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciA9IGFyZy5kZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyID0gYCR7YXJnLmRlc2NyaXB0aW9uIHx8ICdPYmplY3QnfSB7ICR7cHJvcHN9IH1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5bCG5Y+C5pWw6L2s5o2i5Li65a2X56ym5LiyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZXMgPSBhcmdzLm1hcChmb3JtYXRSZW1vdGVPYmplY3QpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb25zb2xlTWVzc2FnZSA9IGBbQnJvd3NlciBDb25zb2xlLiR7dHlwZX1dICR7bWVzc2FnZXMuam9pbignICcpfWA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOagueaNriBjb25zb2xlIOexu+Wei+i+k+WHulxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdlcnJvcic6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Fzc2VydCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGNvbnNvbGVNZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICd3YXJuaW5nJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihjb25zb2xlTWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnaW5mbyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oY29uc29sZU1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RlYnVnJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAndHJhY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1Zyhjb25zb2xlTWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY2xlYXInOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5b+955WlIGNsZWFyIOaIlui+k+WHuuaPkOekulxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjb25zb2xlTWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5aSE55CGIFJ1bnRpbWUuZXhjZXB0aW9uVGhyb3duIOS6i+S7tu+8iOacquaNleiOt+eahOW8guW4uO+8iVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UubWV0aG9kID09PSAnUnVudGltZS5leGNlcHRpb25UaHJvd24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gbWVzc2FnZS5wYXJhbXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhjZXB0aW9uRGV0YWlscyA9IHBhcmFtcy5leGNlcHRpb25EZXRhaWxzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSBleGNlcHRpb25EZXRhaWxzLnRleHQ7IC8vIOmAmuW4uOaYryBcIlVuY2F1Z2h0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGNlcHRpb24gPSBleGNlcHRpb25EZXRhaWxzLmV4Y2VwdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGV4Y2VwdGlvbiA/IChleGNlcHRpb24uZGVzY3JpcHRpb24gfHwgZXhjZXB0aW9uLnZhbHVlKSA6ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBleGNlcHRpb25EZXRhaWxzLnVybCB8fCAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsaW5lID0gZXhjZXB0aW9uRGV0YWlscy5saW5lTnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbCA9IGV4Y2VwdGlvbkRldGFpbHMuY29sdW1uTnVtYmVyO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXJyb3JNc2cgPSBgW0Jyb3dzZXIgRXJyb3JdICR7dGV4dH1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1zZyArPSBgOiAke2Rlc2NyaXB0aW9ufWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cmwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNc2cgKz0gYFxcbiAgICBhdCAke3VybH06JHtsaW5lfToke2NvbH1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvck1zZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaJk+WNsOino+aekOWksei0peeahOWOn+WboO+8jOmYsuatoumdmem7mOWQnuaOiea2iOaBr1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgW1dTIFByb2Nlc3NpbmcgRXJyb3JdIEZhaWxlZCB0byBwcm9jZXNzIG1lc3NhZ2U6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB3cy5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBXZWJTb2NrZXQg6L+e5o6l6ZSZ6K+vOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTsgLy8g5LiNIHJlamVjdO+8jOWFgeiuuOe7p+e7reaJp+ihjFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB3cy5vbignY2xvc2UnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDwn5SMIOa1j+iniOWZqOiwg+ivlei/nuaOpeW3suWFs+mXrWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyDov57mjqXmiJDlip9cclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGDop6PmnpDosIPor5Xnm67moIfliJfooajlpLHotKU6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7IC8vIOS4jSByZWplY3TvvIzlhYHorrjnu6fnu63miafooYxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSkub24oJ2Vycm9yJywgYXN5bmMgKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOWmguaenOaXoOazlei/nuaOpeWIsOiwg+ivleerr+WPo++8jOWPr+iDveaYr+a1j+iniOWZqOi/mOayoeWQr+WKqO+8jOWwneivlemHjeivlVxyXG4gICAgICAgICAgICBpZiAocmV0cmllcyA+IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYOaXoOazlei/nuaOpeWIsOiwg+ivleerr+WPoyAke3BvcnR977yMJHtyZXRyaWVzfSDmrKHph43or5XlkI7ph43or5UuLi5gKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCByZXRyeURlbGF5KSk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBjb25uZWN0VG9DaHJvbWVEZXZUb29scyhwb3J0LCB0YXJnZXRVcmwsIHJldHJpZXMgLSAxLCByZXRyeURlbGF5KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYOaXoOazlei/nuaOpeWIsOiwg+ivleerr+WPoyAke3BvcnR9OiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzb2x2ZSgpOyAvLyDlhYHorrjnu6fnu63miafooYxcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vKipcclxuICog5omT5byAIFVSTFxyXG4gKiBAcGFyYW0gdXJsIOimgeaJk+W8gOeahCBVUkxcclxuICogQHBhcmFtIG9wdGlvbnMg6YCJ6aG5XHJcbiAqIEBwYXJhbSBjb21wbGV0ZWRDYWxsYmFjayDmtY/op4jlmajmiZPlvIDlrozmiJDlkI7nmoTlm57osIPlh73mlbBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBvcGVuVXJsKHVybDogc3RyaW5nLCBvcHRpb25zOiBPcGVuVXJsT3B0aW9ucyA9IHt9LCBjb21wbGV0ZWRDYWxsYmFjaz86ICgpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIGNvbnN0IHtcclxuICAgICAgICByZW1vdGVEZWJ1Z2dpbmdNb2RlID0gZmFsc2UsXHJcbiAgICAgICAgcG9ydCA9IDkyMjJcclxuICAgIH0gPSBvcHRpb25zO1xyXG5cclxuICAgIGlmIChyZW1vdGVEZWJ1Z2dpbmdNb2RlKSB7XHJcbiAgICAgICAgLy8g6Ieq5Yqo5qOA5rWL5bm25L2/55So5bey5a6J6KOF55qE5rWP6KeI5ZmoXHJcbiAgICAgICAgb3BlbkRlYnVnZ2luZ0Jyb3dzZXIodXJsLCBwb3J0LCB1bmRlZmluZWQsIGNvbXBsZXRlZENhbGxiYWNrKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5Zue6YCA5Yiw6buY6K6k5rWP6KeI5Zmo5omT5byA5pa55byPXHJcbiAgICBvcGVuQnJvd3Nlcih1cmwsIGNvbXBsZXRlZENhbGxiYWNrKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOW8guatpeaJk+W8gCBVUkzvvIzlnKjmtY/op4jlmajmiZPlvIDlrozmiJDml7YgcmVzb2x2ZVxyXG4gKiBAcGFyYW0gdXJsIOimgeaJk+W8gOeahCBVUkxcclxuICogQHBhcmFtIG9wdGlvbnMg6YCJ6aG5XHJcbiAqIEByZXR1cm5zIFByb21pc2XvvIzlnKjmtY/op4jlmajmiZPlvIDlrozmiJDml7YgcmVzb2x2ZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5VcmxBc3luYyh1cmw6IHN0cmluZywgb3B0aW9uczogT3BlblVybE9wdGlvbnMgPSB7fSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgb3BlblVybCh1cmwsIG9wdGlvbnMsICgpID0+IHtcclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuIl19