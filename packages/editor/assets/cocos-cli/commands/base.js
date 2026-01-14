"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandUtils = exports.BaseCommand = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
/**
 * 命令基类
 */
class BaseCommand {
    program;
    constructor(program) {
        this.program = program;
    }
    /**
     * 验证项目路径
     */
    validateProjectPath(projectPath) {
        const resolvedPath = (0, path_1.resolve)(projectPath);
        if (!(0, fs_1.existsSync)(resolvedPath)) {
            console.error(chalk_1.default.red(`Error: Project path does not exist: ${resolvedPath}`));
            process.exit(1);
        }
        // 检查是否是有效的 Cocos 项目
        const packageJsonPath = (0, path_1.join)(resolvedPath, 'package.json');
        if (!(0, fs_1.existsSync)(packageJsonPath)) {
            console.error(chalk_1.default.red(`Error: Not a valid Cocos project: ${resolvedPath}`));
            console.error(chalk_1.default.yellow('Expected to find package.json in the project directory.'));
            process.exit(1);
        }
        return resolvedPath;
    }
    /**
     * 获取全局选项
     */
    getGlobalOptions() {
        // TODO 需要修改为全局的配置系统
        return this.program.opts();
    }
}
exports.BaseCommand = BaseCommand;
/**
 * 命令工具函数
 */
class CommandUtils {
    /**
     * 显示构建信息
     */
    static showBuildInfo(projectPath, platform) {
        console.log(chalk_1.default.blue('Building project...'));
        console.log(chalk_1.default.gray(`Project: ${projectPath}`));
        console.log(chalk_1.default.gray(`Platform: ${platform}`));
    }
    /**
     * 显示 MCP 服务器信息
     */
    static showMcpServerInfo(projectPath, port) {
        console.log(chalk_1.default.blue('MCP Server Configuration'));
        console.log(chalk_1.default.blue('========================'));
        console.log(chalk_1.default.gray(`Project: ${projectPath}`));
        console.log(chalk_1.default.gray(`Port: ${port}`));
        console.log('');
    }
}
exports.CommandUtils = CommandUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLCtCQUFxQztBQUNyQywyQkFBZ0M7QUFDaEMsa0RBQTBCO0FBRTFCOztHQUVHO0FBQ0gsTUFBc0IsV0FBVztJQUNuQixPQUFPLENBQVU7SUFFM0IsWUFBWSxPQUFnQjtRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBT0Q7O09BRUc7SUFDTyxtQkFBbUIsQ0FBQyxXQUFtQjtRQUM3QyxNQUFNLFlBQVksR0FBRyxJQUFBLGNBQU8sRUFBQyxXQUFXLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsSUFBQSxlQUFVLEVBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztZQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLGVBQUssQ0FBQyxHQUFHLENBQUMsdUNBQXVDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLENBQUM7UUFFRCxvQkFBb0I7UUFDcEIsTUFBTSxlQUFlLEdBQUcsSUFBQSxXQUFJLEVBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxJQUFBLGVBQVUsRUFBQyxlQUFlLENBQUMsRUFBRSxDQUFDO1lBQy9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBSyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlFLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBSyxDQUFDLE1BQU0sQ0FBQyx5REFBeUQsQ0FBQyxDQUFDLENBQUM7WUFDdkYsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixDQUFDO1FBRUQsT0FBTyxZQUFZLENBQUM7SUFDeEIsQ0FBQztJQUVEOztPQUVHO0lBQ08sZ0JBQWdCO1FBQ3RCLG9CQUFvQjtRQUNwQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0IsQ0FBQztDQUNKO0FBeENELGtDQXdDQztBQUVEOztHQUVHO0FBQ0gsTUFBYSxZQUFZO0lBQ3JCOztPQUVHO0lBQ0gsTUFBTSxDQUFDLGFBQWEsQ0FBQyxXQUFtQixFQUFFLFFBQWdCO1FBQ3RELE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7UUFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLElBQUksQ0FBQyxhQUFhLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxNQUFNLENBQUMsaUJBQWlCLENBQUMsV0FBbUIsRUFBRSxJQUFZO1FBQ3RELE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7UUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFLLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQztRQUNwRCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEIsQ0FBQztDQUNKO0FBcEJELG9DQW9CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1hbmQgfSBmcm9tICdjb21tYW5kZXInO1xyXG5pbXBvcnQgeyBqb2luLCByZXNvbHZlIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tICdmcyc7XHJcbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XHJcblxyXG4vKipcclxuICog5ZG95Luk5Z+657G7XHJcbiAqL1xyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZUNvbW1hbmQge1xyXG4gICAgcHJvdGVjdGVkIHByb2dyYW06IENvbW1hbmQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJvZ3JhbTogQ29tbWFuZCkge1xyXG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IHByb2dyYW07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jlhozlkb3ku6RcclxuICAgICAqL1xyXG4gICAgYWJzdHJhY3QgcmVnaXN0ZXIoKTogdm9pZDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOmqjOivgemhueebrui3r+W+hFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgdmFsaWRhdGVQcm9qZWN0UGF0aChwcm9qZWN0UGF0aDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCByZXNvbHZlZFBhdGggPSByZXNvbHZlKHByb2plY3RQYXRoKTtcclxuICAgICAgICBpZiAoIWV4aXN0c1N5bmMocmVzb2x2ZWRQYXRoKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZChgRXJyb3I6IFByb2plY3QgcGF0aCBkb2VzIG5vdCBleGlzdDogJHtyZXNvbHZlZFBhdGh9YCkpO1xyXG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDmo4Dmn6XmmK/lkKbmmK/mnInmlYjnmoQgQ29jb3Mg6aG555uuXHJcbiAgICAgICAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gam9pbihyZXNvbHZlZFBhdGgsICdwYWNrYWdlLmpzb24nKTtcclxuICAgICAgICBpZiAoIWV4aXN0c1N5bmMocGFja2FnZUpzb25QYXRoKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZChgRXJyb3I6IE5vdCBhIHZhbGlkIENvY29zIHByb2plY3Q6ICR7cmVzb2x2ZWRQYXRofWApKTtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihjaGFsay55ZWxsb3coJ0V4cGVjdGVkIHRvIGZpbmQgcGFja2FnZS5qc29uIGluIHRoZSBwcm9qZWN0IGRpcmVjdG9yeS4nKSk7XHJcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXNvbHZlZFBhdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blhajlsYDpgInpoblcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGdldEdsb2JhbE9wdGlvbnMoKTogYW55IHtcclxuICAgICAgICAvLyBUT0RPIOmcgOimgeS/ruaUueS4uuWFqOWxgOeahOmFjee9ruezu+e7n1xyXG4gICAgICAgIHJldHVybiB0aGlzLnByb2dyYW0ub3B0cygpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog5ZG95Luk5bel5YW35Ye95pWwXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ29tbWFuZFV0aWxzIHtcclxuICAgIC8qKlxyXG4gICAgICog5pi+56S65p6E5bu65L+h5oGvXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzaG93QnVpbGRJbmZvKHByb2plY3RQYXRoOiBzdHJpbmcsIHBsYXRmb3JtOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5ibHVlKCdCdWlsZGluZyBwcm9qZWN0Li4uJykpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmdyYXkoYFByb2plY3Q6ICR7cHJvamVjdFBhdGh9YCkpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmdyYXkoYFBsYXRmb3JtOiAke3BsYXRmb3JtfWApKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuiBNQ1Ag5pyN5Yqh5Zmo5L+h5oGvXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzaG93TWNwU2VydmVySW5mbyhwcm9qZWN0UGF0aDogc3RyaW5nLCBwb3J0OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5ibHVlKCdNQ1AgU2VydmVyIENvbmZpZ3VyYXRpb24nKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coY2hhbGsuYmx1ZSgnPT09PT09PT09PT09PT09PT09PT09PT09JykpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmdyYXkoYFByb2plY3Q6ICR7cHJvamVjdFBhdGh9YCkpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmdyYXkoYFBvcnQ6ICR7cG9ydH1gKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJycpO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==