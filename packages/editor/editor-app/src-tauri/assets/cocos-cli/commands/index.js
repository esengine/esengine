"use strict";
/**
 * 命令模块导出
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandRegistry = exports.RunCommand = exports.MakeCommand = exports.CreateCommand = exports.McpServerCommand = exports.BuildCommand = exports.CommandUtils = exports.BaseCommand = void 0;
var base_1 = require("./base");
Object.defineProperty(exports, "BaseCommand", { enumerable: true, get: function () { return base_1.BaseCommand; } });
Object.defineProperty(exports, "CommandUtils", { enumerable: true, get: function () { return base_1.CommandUtils; } });
var build_1 = require("./build");
Object.defineProperty(exports, "BuildCommand", { enumerable: true, get: function () { return build_1.BuildCommand; } });
var mcp_server_1 = require("./mcp-server");
Object.defineProperty(exports, "McpServerCommand", { enumerable: true, get: function () { return mcp_server_1.McpServerCommand; } });
var create_1 = require("./create");
Object.defineProperty(exports, "CreateCommand", { enumerable: true, get: function () { return create_1.CreateCommand; } });
var make_1 = require("./make");
Object.defineProperty(exports, "MakeCommand", { enumerable: true, get: function () { return make_1.MakeCommand; } });
var run_1 = require("./run");
Object.defineProperty(exports, "RunCommand", { enumerable: true, get: function () { return run_1.RunCommand; } });
/**
 * 命令注册器
 */
class CommandRegistry {
    commands = [];
    /**
     * 注册命令
     */
    register(command) {
        this.commands.push(command);
    }
    /**
     * 注册所有命令
     */
    registerAll() {
        this.commands.forEach(command => command.register());
    }
    /**
     * 获取所有命令
     */
    getAllCommands() {
        return [...this.commands];
    }
}
exports.CommandRegistry = CommandRegistry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7QUFRSCwrQkFBbUQ7QUFBMUMsbUdBQUEsV0FBVyxPQUFBO0FBQUUsb0dBQUEsWUFBWSxPQUFBO0FBQ2xDLGlDQUF1QztBQUE5QixxR0FBQSxZQUFZLE9BQUE7QUFDckIsMkNBQWdEO0FBQXZDLDhHQUFBLGdCQUFnQixPQUFBO0FBQ3pCLG1DQUF5QztBQUFoQyx1R0FBQSxhQUFhLE9BQUE7QUFDdEIsK0JBQXFDO0FBQTVCLG1HQUFBLFdBQVcsT0FBQTtBQUNwQiw2QkFBbUM7QUFBMUIsaUdBQUEsVUFBVSxPQUFBO0FBT25COztHQUVHO0FBQ0gsTUFBYSxlQUFlO0lBQ2hCLFFBQVEsR0FBbUIsRUFBRSxDQUFDO0lBRXRDOztPQUVHO0lBQ0gsUUFBUSxDQUFDLE9BQXFCO1FBQzFCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7T0FFRztJQUNILFdBQVc7UUFDUCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRDs7T0FFRztJQUNILGNBQWM7UUFDVixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUIsQ0FBQztDQUNKO0FBdkJELDBDQXVCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiDlkb3ku6TmqKHlnZflr7zlh7pcclxuICovXHJcblxyXG5pbXBvcnQgeyBCdWlsZENvbW1hbmQgfSBmcm9tICcuL2J1aWxkJztcclxuaW1wb3J0IHsgTWNwU2VydmVyQ29tbWFuZCB9IGZyb20gJy4vbWNwLXNlcnZlcic7XHJcbmltcG9ydCB7IENyZWF0ZUNvbW1hbmQgfSBmcm9tICcuL2NyZWF0ZSc7XHJcbmltcG9ydCB7IE1ha2VDb21tYW5kIH0gZnJvbSAnLi9tYWtlJztcclxuaW1wb3J0IHsgUnVuQ29tbWFuZCB9IGZyb20gJy4vcnVuJztcclxuXHJcbmV4cG9ydCB7IEJhc2VDb21tYW5kLCBDb21tYW5kVXRpbHMgfSBmcm9tICcuL2Jhc2UnO1xyXG5leHBvcnQgeyBCdWlsZENvbW1hbmQgfSBmcm9tICcuL2J1aWxkJztcclxuZXhwb3J0IHsgTWNwU2VydmVyQ29tbWFuZCB9IGZyb20gJy4vbWNwLXNlcnZlcic7XHJcbmV4cG9ydCB7IENyZWF0ZUNvbW1hbmQgfSBmcm9tICcuL2NyZWF0ZSc7XHJcbmV4cG9ydCB7IE1ha2VDb21tYW5kIH0gZnJvbSAnLi9tYWtlJztcclxuZXhwb3J0IHsgUnVuQ29tbWFuZCB9IGZyb20gJy4vcnVuJztcclxuXHJcbi8qKlxyXG4gKiDmiYDmnInlkb3ku6TnsbvnmoTnsbvlnotcclxuICovXHJcbmV4cG9ydCB0eXBlIENvbW1hbmRDbGFzcyA9IEJ1aWxkQ29tbWFuZCB8IE1jcFNlcnZlckNvbW1hbmQgfCBDcmVhdGVDb21tYW5kIHwgTWFrZUNvbW1hbmQgfCBSdW5Db21tYW5kO1xyXG5cclxuLyoqXHJcbiAqIOWRveS7pOazqOWGjOWZqFxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENvbW1hbmRSZWdpc3RyeSB7XHJcbiAgICBwcml2YXRlIGNvbW1hbmRzOiBDb21tYW5kQ2xhc3NbXSA9IFtdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog5rOo5YaM5ZG95LukXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdGVyKGNvbW1hbmQ6IENvbW1hbmRDbGFzcyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY29tbWFuZHMucHVzaChjb21tYW5kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOazqOWGjOaJgOacieWRveS7pFxyXG4gICAgICovXHJcbiAgICByZWdpc3RlckFsbCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNvbW1hbmRzLmZvckVhY2goY29tbWFuZCA9PiBjb21tYW5kLnJlZ2lzdGVyKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5omA5pyJ5ZG95LukXHJcbiAgICAgKi9cclxuICAgIGdldEFsbENvbW1hbmRzKCk6IENvbW1hbmRDbGFzc1tdIHtcclxuICAgICAgICByZXR1cm4gWy4uLnRoaXMuY29tbWFuZHNdO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==