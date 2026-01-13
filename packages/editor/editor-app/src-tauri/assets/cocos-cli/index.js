"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const start_server_js_1 = require("./mcp/start-server.js");
const server_js_1 = require("./server/server.js");
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PROVIDER_ID = 'cocos-cli-mcp-provider';
async function activate(context, port) {
    // 创建事件发射器，用于通知 MCP 服务器定义变化
    const onDidChangeMcpServerDefinitionsEmitter = new vscode.EventEmitter();
    const provider = {
        onDidChangeMcpServerDefinitions: onDidChangeMcpServerDefinitionsEmitter.event,
        provideMcpServerDefinitions: async (token) => {
            const folder = getCurrentProjectFolder();
            if (!folder) {
                vscode.window.showWarningMessage('没有打开 cocos 项目');
                return [];
            }
            // 检查是否为 Cocos 工程
            const isCocosProject = await checkIsCocosProject(folder);
            if (!isCocosProject) {
                return []; // 不启动 MCP 服务器，也不返回任何定义
            }
            try {
                // 启动 MCP 服务器
                await (0, start_server_js_1.startServer)(folder, port);
                // 返回 MCP 服务器定义
                return [
                    new vscode.McpHttpServerDefinition('Cocos CLI MCP Server', vscode.Uri.parse(`http://localhost:${server_js_1.serverService.port}/mcp`))
                ];
            }
            catch (error) {
                console.error('启动 MCP 服务器失败:', error);
                return [];
            }
        },
        resolveMcpServerDefinition: async (definition, token) => {
            // 可以在这里做额外检查 / 用户交互 / 获取 token 等
            // 如果一切正常，直接返回 definition 即可
            return definition;
        }
    };
    // 注册 MCP 服务器定义提供者
    const disposable = vscode.lm.registerMcpServerDefinitionProvider(PROVIDER_ID, provider);
    context.subscriptions.push(disposable);
    // 监听工作区变化，当工作区变化时通知 MCP 服务器定义可能发生变化
    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => {
        onDidChangeMcpServerDefinitionsEmitter.fire();
    }));
}
function deactivate() { }
/**
 * 检查当前文件夹是否为 Cocos 工程
 * @param folderPath 文件夹路径
 * @returns 是否为 Cocos 工程
 */
async function checkIsCocosProject(folderPath) {
    try {
        const packageJsonPath = path.join(folderPath, 'package.json');
        // 检查 package.json 是否存在
        if (!fs.existsSync(packageJsonPath)) {
            vscode.window.showErrorMessage('当前不是 Cocos 工程');
            return false;
        }
        // 读取并解析 package.json
        const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageJsonContent);
        // 检查是否有 creator 字段
        if (!packageJson.creator) {
            vscode.window.showErrorMessage('当前不是 Cocos 工程');
            return false;
        }
        return true;
    }
    catch (error) {
        vscode.window.showErrorMessage('当前不是 Cocos 工程');
        return false;
    }
}
/**
 * 获取当前打开的项目文件夹路径
 * @returns 项目文件夹路径
 */
function getCurrentProjectFolder() {
    // 获取当前工作区的第一个文件夹（项目根目录）
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return undefined; // 没有打开任何工作区
    }
    // 如果有多个工作区文件夹，优先返回当前活动文件所在的工作区
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const currentFileUri = editor.document.uri;
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(currentFileUri);
        if (workspaceFolder) {
            return workspaceFolder.uri.fsPath;
        }
    }
    // 否则返回第一个工作区文件夹
    return workspaceFolders[0].uri.fsPath;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFRQSw0QkFzREM7QUFFRCxnQ0FBZ0M7QUFoRWhDLDJEQUFvRDtBQUNwRCxrREFBbUQ7QUFDbkQsK0NBQWlDO0FBQ2pDLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFFN0IsTUFBTSxXQUFXLEdBQUcsd0JBQXdCLENBQUM7QUFFdEMsS0FBSyxVQUFVLFFBQVEsQ0FBQyxPQUFnQyxFQUFFLElBQWE7SUFDMUUsMkJBQTJCO0lBQzNCLE1BQU0sc0NBQXNDLEdBQUcsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFRLENBQUM7SUFFL0UsTUFBTSxRQUFRLEdBQXVDO1FBQ2pELCtCQUErQixFQUFFLHNDQUFzQyxDQUFDLEtBQUs7UUFFN0UsMkJBQTJCLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3pDLE1BQU0sTUFBTSxHQUFHLHVCQUF1QixFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNWLE1BQU0sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ2xELE9BQU8sRUFBRSxDQUFDO1lBQ2QsQ0FBQztZQUVELGlCQUFpQjtZQUNqQixNQUFNLGNBQWMsR0FBRyxNQUFNLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDbEIsT0FBTyxFQUFFLENBQUMsQ0FBQyx1QkFBdUI7WUFDdEMsQ0FBQztZQUVELElBQUksQ0FBQztnQkFDRCxhQUFhO2dCQUNiLE1BQU0sSUFBQSw2QkFBVyxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFaEMsZUFBZTtnQkFDZixPQUFPO29CQUNILElBQUksTUFBTSxDQUFDLHVCQUF1QixDQUM5QixzQkFB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QWUsRUFBRSxDQUFDO1lBQ2xCLE9BQU8sZUFBZSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDdEMsQ0FBQztJQUNMLENBQUM7SUFFRCxnQkFBZ0I7SUFDaEIsT0FBTyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO0FBQzFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzdGFydFNlcnZlciB9IGZyb20gJy4vbWNwL3N0YXJ0LXNlcnZlci5qcyc7XHJcbmltcG9ydCB7IHNlcnZlclNlcnZpY2UgfSBmcm9tICcuL3NlcnZlci9zZXJ2ZXIuanMnO1xyXG5pbXBvcnQgKiBhcyB2c2NvZGUgZnJvbSAndnNjb2RlJztcclxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuY29uc3QgUFJPVklERVJfSUQgPSAnY29jb3MtY2xpLW1jcC1wcm92aWRlcic7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWN0aXZhdGUoY29udGV4dDogdnNjb2RlLkV4dGVuc2lvbkNvbnRleHQsIHBvcnQ/OiBudW1iZXIpIHtcclxuICAgIC8vIOWIm+W7uuS6i+S7tuWPkeWwhOWZqO+8jOeUqOS6jumAmuefpSBNQ1Ag5pyN5Yqh5Zmo5a6a5LmJ5Y+Y5YyWXHJcbiAgICBjb25zdCBvbkRpZENoYW5nZU1jcFNlcnZlckRlZmluaXRpb25zRW1pdHRlciA9IG5ldyB2c2NvZGUuRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XHJcblxyXG4gICAgY29uc3QgcHJvdmlkZXI6IHZzY29kZS5NY3BTZXJ2ZXJEZWZpbml0aW9uUHJvdmlkZXIgPSB7XHJcbiAgICAgICAgb25EaWRDaGFuZ2VNY3BTZXJ2ZXJEZWZpbml0aW9uczogb25EaWRDaGFuZ2VNY3BTZXJ2ZXJEZWZpbml0aW9uc0VtaXR0ZXIuZXZlbnQsXHJcblxyXG4gICAgICAgIHByb3ZpZGVNY3BTZXJ2ZXJEZWZpbml0aW9uczogYXN5bmMgKHRva2VuKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZvbGRlciA9IGdldEN1cnJlbnRQcm9qZWN0Rm9sZGVyKCk7XHJcbiAgICAgICAgICAgIGlmICghZm9sZGVyKSB7XHJcbiAgICAgICAgICAgICAgICB2c2NvZGUud2luZG93LnNob3dXYXJuaW5nTWVzc2FnZSgn5rKh5pyJ5omT5byAIGNvY29zIOmhueebricpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDmo4Dmn6XmmK/lkKbkuLogQ29jb3Mg5bel56iLXHJcbiAgICAgICAgICAgIGNvbnN0IGlzQ29jb3NQcm9qZWN0ID0gYXdhaXQgY2hlY2tJc0NvY29zUHJvamVjdChmb2xkZXIpO1xyXG4gICAgICAgICAgICBpZiAoIWlzQ29jb3NQcm9qZWN0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW107IC8vIOS4jeWQr+WKqCBNQ1Ag5pyN5Yqh5Zmo77yM5Lmf5LiN6L+U5Zue5Lu75L2V5a6a5LmJXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAvLyDlkK/liqggTUNQIOacjeWKoeWZqFxyXG4gICAgICAgICAgICAgICAgYXdhaXQgc3RhcnRTZXJ2ZXIoZm9sZGVyLCBwb3J0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyDov5Tlm54gTUNQIOacjeWKoeWZqOWumuS5iVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgdnNjb2RlLk1jcEh0dHBTZXJ2ZXJEZWZpbml0aW9uKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29jb3MgQ0xJIE1DUCBTZXJ2ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2c2NvZGUuVXJpLnBhcnNlKGBodHRwOi8vbG9jYWxob3N0OiR7c2VydmVyU2VydmljZS5wb3J0fS9tY3BgKVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCflkK/liqggTUNQIOacjeWKoeWZqOWksei0pTonLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICByZXNvbHZlTWNwU2VydmVyRGVmaW5pdGlvbjogYXN5bmMgKGRlZmluaXRpb24sIHRva2VuKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIOWPr+S7peWcqOi/memHjOWBmumineWkluajgOafpSAvIOeUqOaIt+S6pOS6kiAvIOiOt+WPliB0b2tlbiDnrYlcclxuICAgICAgICAgICAgLy8g5aaC5p6c5LiA5YiH5q2j5bi477yM55u05o6l6L+U5ZueIGRlZmluaXRpb24g5Y2z5Y+vXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZpbml0aW9uO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8g5rOo5YaMIE1DUCDmnI3liqHlmajlrprkuYnmj5DkvpvogIVcclxuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSB2c2NvZGUubG0ucmVnaXN0ZXJNY3BTZXJ2ZXJEZWZpbml0aW9uUHJvdmlkZXIoUFJPVklERVJfSUQsIHByb3ZpZGVyKTtcclxuICAgIGNvbnRleHQuc3Vic2NyaXB0aW9ucy5wdXNoKGRpc3Bvc2FibGUpO1xyXG5cclxuICAgIC8vIOebkeWQrOW3peS9nOWMuuWPmOWMlu+8jOW9k+W3peS9nOWMuuWPmOWMluaXtumAmuefpSBNQ1Ag5pyN5Yqh5Zmo5a6a5LmJ5Y+v6IO95Y+R55Sf5Y+Y5YyWXHJcbiAgICBjb250ZXh0LnN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgICB2c2NvZGUud29ya3NwYWNlLm9uRGlkQ2hhbmdlV29ya3NwYWNlRm9sZGVycygoKSA9PiB7XHJcbiAgICAgICAgICAgIG9uRGlkQ2hhbmdlTWNwU2VydmVyRGVmaW5pdGlvbnNFbWl0dGVyLmZpcmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7IH1cclxuXHJcbi8qKlxyXG4gKiDmo4Dmn6XlvZPliY3mlofku7blpLnmmK/lkKbkuLogQ29jb3Mg5bel56iLXHJcbiAqIEBwYXJhbSBmb2xkZXJQYXRoIOaWh+S7tuWkuei3r+W+hFxyXG4gKiBAcmV0dXJucyDmmK/lkKbkuLogQ29jb3Mg5bel56iLXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBjaGVja0lzQ29jb3NQcm9qZWN0KGZvbGRlclBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSBwYXRoLmpvaW4oZm9sZGVyUGF0aCwgJ3BhY2thZ2UuanNvbicpO1xyXG5cclxuICAgICAgICAvLyDmo4Dmn6UgcGFja2FnZS5qc29uIOaYr+WQpuWtmOWcqFxyXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwYWNrYWdlSnNvblBhdGgpKSB7XHJcbiAgICAgICAgICAgIHZzY29kZS53aW5kb3cuc2hvd0Vycm9yTWVzc2FnZSgn5b2T5YmN5LiN5pivIENvY29zIOW3peeoiycpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDor7vlj5blubbop6PmnpAgcGFja2FnZS5qc29uXHJcbiAgICAgICAgY29uc3QgcGFja2FnZUpzb25Db250ZW50ID0gZnMucmVhZEZpbGVTeW5jKHBhY2thZ2VKc29uUGF0aCwgJ3V0ZjgnKTtcclxuICAgICAgICBjb25zdCBwYWNrYWdlSnNvbiA9IEpTT04ucGFyc2UocGFja2FnZUpzb25Db250ZW50KTtcclxuXHJcbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm5pyJIGNyZWF0b3Ig5a2X5q61XHJcbiAgICAgICAgaWYgKCFwYWNrYWdlSnNvbi5jcmVhdG9yKSB7XHJcbiAgICAgICAgICAgIHZzY29kZS53aW5kb3cuc2hvd0Vycm9yTWVzc2FnZSgn5b2T5YmN5LiN5pivIENvY29zIOW3peeoiycpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgdnNjb2RlLndpbmRvdy5zaG93RXJyb3JNZXNzYWdlKCflvZPliY3kuI3mmK8gQ29jb3Mg5bel56iLJyk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog6I635Y+W5b2T5YmN5omT5byA55qE6aG555uu5paH5Lu25aS56Lev5b6EXHJcbiAqIEByZXR1cm5zIOmhueebruaWh+S7tuWkuei3r+W+hFxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0Q3VycmVudFByb2plY3RGb2xkZXIoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgIC8vIOiOt+WPluW9k+WJjeW3peS9nOWMuueahOesrOS4gOS4quaWh+S7tuWkue+8iOmhueebruagueebruW9le+8iVxyXG4gICAgY29uc3Qgd29ya3NwYWNlRm9sZGVycyA9IHZzY29kZS53b3Jrc3BhY2Uud29ya3NwYWNlRm9sZGVycztcclxuICAgIGlmICghd29ya3NwYWNlRm9sZGVycyB8fCB3b3Jrc3BhY2VGb2xkZXJzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7IC8vIOayoeacieaJk+W8gOS7u+S9leW3peS9nOWMulxyXG4gICAgfVxyXG5cclxuICAgIC8vIOWmguaenOacieWkmuS4quW3peS9nOWMuuaWh+S7tuWkue+8jOS8mOWFiOi/lOWbnuW9k+WJjea0u+WKqOaWh+S7tuaJgOWcqOeahOW3peS9nOWMulxyXG4gICAgY29uc3QgZWRpdG9yID0gdnNjb2RlLndpbmRvdy5hY3RpdmVUZXh0RWRpdG9yO1xyXG4gICAgaWYgKGVkaXRvcikge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRGaWxlVXJpID0gZWRpdG9yLmRvY3VtZW50LnVyaTtcclxuICAgICAgICBjb25zdCB3b3Jrc3BhY2VGb2xkZXIgPSB2c2NvZGUud29ya3NwYWNlLmdldFdvcmtzcGFjZUZvbGRlcihjdXJyZW50RmlsZVVyaSk7XHJcbiAgICAgICAgaWYgKHdvcmtzcGFjZUZvbGRlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gd29ya3NwYWNlRm9sZGVyLnVyaS5mc1BhdGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIOWQpuWImei/lOWbnuesrOS4gOS4quW3peS9nOWMuuaWh+S7tuWkuVxyXG4gICAgcmV0dXJuIHdvcmtzcGFjZUZvbGRlcnNbMF0udXJpLmZzUGF0aDtcclxufVxyXG5cclxuIl19