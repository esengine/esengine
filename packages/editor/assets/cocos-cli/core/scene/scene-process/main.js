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
const common_1 = require("../common");
const rpc_1 = require("./rpc");
const utils_1 = require("./utils");
const engine_1 = require("../../engine");
const path_1 = require("path");
const service_manager_1 = require("./service/service-manager");
async function startup() {
    // 监听进程退出事件
    process.on('message', (msg) => {
        if (msg === 'scene-process:exit') {
            rpc_1.Rpc.dispose();
            process.disconnect?.(); // 关闭 IPC
            process.exit(0); // 退出进程
        }
    });
    console.log(`[Scene] startup worker pid: ${process.pid}`);
    console.log(`[Scene] parse args ${process.argv}`);
    const { enginePath, projectPath, serverURL } = (0, utils_1.parseCommandLineArgs)(process.argv);
    if (!enginePath || !projectPath) {
        throw new Error('enginePath or projectPath is not set');
    }
    // 初始化 service-manager
    service_manager_1.serviceManager.initialize();
    await engine_1.Engine.init(enginePath);
    // 这里 importBase 与 nativeBase 用服务器是为了让服务器转换资源真实存放的路径
    await engine_1.Engine.initEngine({
        serverURL: serverURL,
        importBase: serverURL ?? (0, path_1.join)(projectPath, 'library'),
        nativeBase: serverURL ?? (0, path_1.join)(projectPath, 'library'),
        writablePath: (0, path_1.join)(projectPath, 'temp'),
    }, async () => {
        // 导入 service，处理装饰器，捕获开发的 api
        await Promise.resolve().then(() => __importStar(require('./service')));
        console.log('[Scene] import service');
        await rpc_1.Rpc.startup();
        console.log('[Scene] startup Rpc');
        const { Service } = await Promise.resolve().then(() => __importStar(require('./service/core/decorator')));
        globalThis.cce = {
            Script: Service.Script
        };
    }, async () => {
        await cc.game.run();
        // 初始化 engine 服务
        const { Service } = await Promise.resolve().then(() => __importStar(require('./service/core/decorator')));
        await Service.Engine.init();
    });
    console.log('[Scene] initEngine success');
    // 发送消息给父进程
    process.send?.(common_1.SceneReadyChannel);
    console.log(`[Scene] startup worker success, cocos version: ${cc.ENGINE_VERSION}`);
}
void startup();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlL3NjZW5lL3NjZW5lLXByb2Nlc3MvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNDQUE4QztBQUM5QywrQkFBNEI7QUFDNUIsbUNBQStDO0FBQy9DLHlDQUFzQztBQUN0QywrQkFBNEI7QUFDNUIsK0RBQTJEO0FBRTNELEtBQUssVUFBVSxPQUFPO0lBQ2xCLFdBQVc7SUFDWCxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQzFCLElBQUksR0FBRyxLQUFLLG9CQUFvQixFQUFFLENBQUM7WUFDL0IsU0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2QsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTO1lBQ2pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxPQUFPO1FBQzNCLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBRTFELE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2xELE1BQU0sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUEsNEJBQW9CLEVBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xGLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM5QixNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVELHNCQUFzQjtJQUN0QixnQ0FBYyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBRTVCLE1BQU0sZUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM5QixvREFBb0Q7SUFDcEQsTUFBTSxlQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3BCLFNBQVMsRUFBRSxTQUFTO1FBQ3BCLFVBQVUsRUFBRSxTQUFTLElBQUksSUFBQSxXQUFJLEVBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQztRQUNyRCxVQUFVLEVBQUUsU0FBUyxJQUFJLElBQUEsV0FBSSxFQUFDLFdBQVcsRUFBRSxTQUFTLENBQUM7UUFDckQsWUFBWSxFQUFFLElBQUEsV0FBSSxFQUFDLFdBQVcsRUFBRSxNQUFNLENBQUM7S0FDMUMsRUFBRSxLQUFLLElBQUksRUFBRTtRQUNWLDZCQUE2QjtRQUM3Qix3REFBYSxXQUFXLEdBQUMsQ0FBQztRQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDdEMsTUFBTSxTQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBRW5DLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyx3REFBYSwwQkFBMEIsR0FBQyxDQUFDO1FBQzVELFVBQVUsQ0FBQyxHQUFXLEdBQUc7WUFDdEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1NBQ3pCLENBQUM7SUFDTixDQUFDLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDVixNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDcEIsZ0JBQWdCO1FBQ2hCLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyx3REFBYSwwQkFBMEIsR0FBQyxDQUFDO1FBQzdELE1BQU0sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNoQyxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztJQUUxQyxXQUFXO0lBQ1gsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLDBCQUFpQixDQUFDLENBQUM7SUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrREFBa0QsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDdkYsQ0FBQztBQUVELEtBQUssT0FBTyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTY2VuZVJlYWR5Q2hhbm5lbCB9IGZyb20gJy4uL2NvbW1vbic7XHJcbmltcG9ydCB7IFJwYyB9IGZyb20gJy4vcnBjJztcclxuaW1wb3J0IHsgcGFyc2VDb21tYW5kTGluZUFyZ3MgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgRW5naW5lIH0gZnJvbSAnLi4vLi4vZW5naW5lJztcclxuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBzZXJ2aWNlTWFuYWdlciB9IGZyb20gJy4vc2VydmljZS9zZXJ2aWNlLW1hbmFnZXInO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gc3RhcnR1cCgpIHtcclxuICAgIC8vIOebkeWQrOi/m+eoi+mAgOWHuuS6i+S7tlxyXG4gICAgcHJvY2Vzcy5vbignbWVzc2FnZScsIChtc2cpID0+IHtcclxuICAgICAgICBpZiAobXNnID09PSAnc2NlbmUtcHJvY2VzczpleGl0Jykge1xyXG4gICAgICAgICAgICBScGMuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICBwcm9jZXNzLmRpc2Nvbm5lY3Q/LigpOyAvLyDlhbPpl60gSVBDXHJcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgwKTsvLyDpgIDlh7rov5vnqItcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhgW1NjZW5lXSBzdGFydHVwIHdvcmtlciBwaWQ6ICR7cHJvY2Vzcy5waWR9YCk7XHJcblxyXG4gICAgY29uc29sZS5sb2coYFtTY2VuZV0gcGFyc2UgYXJncyAke3Byb2Nlc3MuYXJndn1gKTtcclxuICAgIGNvbnN0IHsgZW5naW5lUGF0aCwgcHJvamVjdFBhdGgsIHNlcnZlclVSTCB9ID0gcGFyc2VDb21tYW5kTGluZUFyZ3MocHJvY2Vzcy5hcmd2KTtcclxuICAgIGlmICghZW5naW5lUGF0aCB8fCAhcHJvamVjdFBhdGgpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2VuZ2luZVBhdGggb3IgcHJvamVjdFBhdGggaXMgbm90IHNldCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOWIneWni+WMliBzZXJ2aWNlLW1hbmFnZXJcclxuICAgIHNlcnZpY2VNYW5hZ2VyLmluaXRpYWxpemUoKTtcclxuXHJcbiAgICBhd2FpdCBFbmdpbmUuaW5pdChlbmdpbmVQYXRoKTtcclxuICAgIC8vIOi/memHjCBpbXBvcnRCYXNlIOS4jiBuYXRpdmVCYXNlIOeUqOacjeWKoeWZqOaYr+S4uuS6huiuqeacjeWKoeWZqOi9rOaNoui1hOa6kOecn+WunuWtmOaUvueahOi3r+W+hFxyXG4gICAgYXdhaXQgRW5naW5lLmluaXRFbmdpbmUoe1xyXG4gICAgICAgIHNlcnZlclVSTDogc2VydmVyVVJMLFxyXG4gICAgICAgIGltcG9ydEJhc2U6IHNlcnZlclVSTCA/PyBqb2luKHByb2plY3RQYXRoLCAnbGlicmFyeScpLFxyXG4gICAgICAgIG5hdGl2ZUJhc2U6IHNlcnZlclVSTCA/PyBqb2luKHByb2plY3RQYXRoLCAnbGlicmFyeScpLFxyXG4gICAgICAgIHdyaXRhYmxlUGF0aDogam9pbihwcm9qZWN0UGF0aCwgJ3RlbXAnKSxcclxuICAgIH0sIGFzeW5jICgpID0+IHtcclxuICAgICAgICAvLyDlr7zlhaUgc2VydmljZe+8jOWkhOeQhuijhemlsOWZqO+8jOaNleiOt+W8gOWPkeeahCBhcGlcclxuICAgICAgICBhd2FpdCBpbXBvcnQoJy4vc2VydmljZScpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbU2NlbmVdIGltcG9ydCBzZXJ2aWNlJyk7XHJcbiAgICAgICAgYXdhaXQgUnBjLnN0YXJ0dXAoKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnW1NjZW5lXSBzdGFydHVwIFJwYycpO1xyXG5cclxuICAgICAgICBjb25zdCB7IFNlcnZpY2UgfSA9IGF3YWl0IGltcG9ydCgnLi9zZXJ2aWNlL2NvcmUvZGVjb3JhdG9yJyk7XHJcbiAgICAgICAgKGdsb2JhbFRoaXMuY2NlIGFzIGFueSkgPSB7XHJcbiAgICAgICAgICAgIFNjcmlwdDogU2VydmljZS5TY3JpcHRcclxuICAgICAgICB9O1xyXG4gICAgfSwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIGF3YWl0IGNjLmdhbWUucnVuKCk7XHJcbiAgICAgICAgLy8g5Yid5aeL5YyWIGVuZ2luZSDmnI3liqFcclxuICAgICAgICBjb25zdCB7IFNlcnZpY2UgfSA9IGF3YWl0IGltcG9ydCgnLi9zZXJ2aWNlL2NvcmUvZGVjb3JhdG9yJyk7XHJcbiAgICAgICAgYXdhaXQgU2VydmljZS5FbmdpbmUuaW5pdCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc29sZS5sb2coJ1tTY2VuZV0gaW5pdEVuZ2luZSBzdWNjZXNzJyk7XHJcblxyXG4gICAgLy8g5Y+R6YCB5raI5oGv57uZ54i26L+b56iLXHJcbiAgICBwcm9jZXNzLnNlbmQ/LihTY2VuZVJlYWR5Q2hhbm5lbCk7XHJcbiAgICBjb25zb2xlLmxvZyhgW1NjZW5lXSBzdGFydHVwIHdvcmtlciBzdWNjZXNzLCBjb2NvcyB2ZXJzaW9uOiAke2NjLkVOR0lORV9WRVJTSU9OfWApO1xyXG59XHJcblxyXG52b2lkIHN0YXJ0dXAoKTtcclxuIl19