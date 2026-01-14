"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpServerCommand = void 0;
const chalk_1 = __importDefault(require("chalk"));
const base_1 = require("./base");
const start_server_1 = require("../mcp/start-server");
/**
 * MCP Server 命令类
 */
class McpServerCommand extends base_1.BaseCommand {
    register() {
        this.program
            .command('start-mcp-server')
            .description('Start MCP (Model Context Protocol) server for Cocos project')
            .requiredOption('-j, --project <path>', 'Path to the Cocos project (required)')
            .option('-p, --port <number>', 'Port number for the MCP server', '9527')
            .action(async (options) => {
            try {
                const resolvedPath = this.validateProjectPath(options.project);
                const port = parseInt(options.port, 10);
                // 验证端口号
                if (isNaN(port) || port < 1 || port > 65535) {
                    console.error(chalk_1.default.red('Error: Invalid port number. Port must be between 1 and 65535.'));
                    process.exit(1);
                }
                base_1.CommandUtils.showMcpServerInfo(resolvedPath, port);
                // 启动 MCP 服务器
                await (0, start_server_1.startServer)(resolvedPath, port);
                // 保持进程运行
                process.stdin.resume();
            }
            catch (error) {
                console.error(chalk_1.default.red('Failed to start MCP server'));
                console.error(error);
                process.exit(1);
            }
        });
    }
}
exports.McpServerCommand = McpServerCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWNwLXNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9tY3Atc2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEwQjtBQUMxQixpQ0FBbUQ7QUFDbkQsc0RBQWtEO0FBRWxEOztHQUVHO0FBQ0gsTUFBYSxnQkFBaUIsU0FBUSxrQkFBVztJQUM3QyxRQUFRO1FBQ0osSUFBSSxDQUFDLE9BQU87YUFDUCxPQUFPLENBQUMsa0JBQWtCLENBQUM7YUFDM0IsV0FBVyxDQUFDLDZEQUE2RCxDQUFDO2FBQzFFLGNBQWMsQ0FBQyxzQkFBc0IsRUFBRSxzQ0FBc0MsQ0FBQzthQUM5RSxNQUFNLENBQUMscUJBQXFCLEVBQUUsZ0NBQWdDLEVBQUUsTUFBTSxDQUFDO2FBQ3ZFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBWSxFQUFFLEVBQUU7WUFDM0IsSUFBSSxDQUFDO2dCQUNELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQy9ELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUV4QyxRQUFRO2dCQUNSLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLEtBQUssRUFBRSxDQUFDO29CQUMxQyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQUssQ0FBQyxHQUFHLENBQUMsK0RBQStELENBQUMsQ0FBQyxDQUFDO29CQUMxRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixDQUFDO2dCQUVELG1CQUFZLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNuRCxhQUFhO2dCQUNiLE1BQU0sSUFBQSwwQkFBVyxFQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFdEMsU0FBUztnQkFDVCxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzNCLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBSyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztDQUNKO0FBL0JELDRDQStCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XHJcbmltcG9ydCB7IEJhc2VDb21tYW5kLCBDb21tYW5kVXRpbHMgfSBmcm9tICcuL2Jhc2UnO1xyXG5pbXBvcnQgeyBzdGFydFNlcnZlciB9IGZyb20gJy4uL21jcC9zdGFydC1zZXJ2ZXInO1xyXG5cclxuLyoqXHJcbiAqIE1DUCBTZXJ2ZXIg5ZG95Luk57G7XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTWNwU2VydmVyQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcclxuICAgIHJlZ2lzdGVyKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucHJvZ3JhbVxyXG4gICAgICAgICAgICAuY29tbWFuZCgnc3RhcnQtbWNwLXNlcnZlcicpXHJcbiAgICAgICAgICAgIC5kZXNjcmlwdGlvbignU3RhcnQgTUNQIChNb2RlbCBDb250ZXh0IFByb3RvY29sKSBzZXJ2ZXIgZm9yIENvY29zIHByb2plY3QnKVxyXG4gICAgICAgICAgICAucmVxdWlyZWRPcHRpb24oJy1qLCAtLXByb2plY3QgPHBhdGg+JywgJ1BhdGggdG8gdGhlIENvY29zIHByb2plY3QgKHJlcXVpcmVkKScpXHJcbiAgICAgICAgICAgIC5vcHRpb24oJy1wLCAtLXBvcnQgPG51bWJlcj4nLCAnUG9ydCBudW1iZXIgZm9yIHRoZSBNQ1Agc2VydmVyJywgJzk1MjcnKVxyXG4gICAgICAgICAgICAuYWN0aW9uKGFzeW5jIChvcHRpb25zOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gdGhpcy52YWxpZGF0ZVByb2plY3RQYXRoKG9wdGlvbnMucHJvamVjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9ydCA9IHBhcnNlSW50KG9wdGlvbnMucG9ydCwgMTApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyDpqozor4Hnq6/lj6Plj7dcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNOYU4ocG9ydCkgfHwgcG9ydCA8IDEgfHwgcG9ydCA+IDY1NTM1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKCdFcnJvcjogSW52YWxpZCBwb3J0IG51bWJlci4gUG9ydCBtdXN0IGJlIGJldHdlZW4gMSBhbmQgNjU1MzUuJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBDb21tYW5kVXRpbHMuc2hvd01jcFNlcnZlckluZm8ocmVzb2x2ZWRQYXRoLCBwb3J0KTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDlkK/liqggTUNQIOacjeWKoeWZqFxyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHN0YXJ0U2VydmVyKHJlc29sdmVkUGF0aCwgcG9ydCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOS/neaMgei/m+eoi+i/kOihjFxyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3Muc3RkaW4ucmVzdW1lKCk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKCdGYWlsZWQgdG8gc3RhcnQgTUNQIHNlcnZlcicpKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==