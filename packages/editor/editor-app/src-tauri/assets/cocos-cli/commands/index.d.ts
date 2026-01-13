/**
 * 命令模块导出
 */
import { BuildCommand } from './build';
import { McpServerCommand } from './mcp-server';
import { CreateCommand } from './create';
import { MakeCommand } from './make';
import { RunCommand } from './run';
export { BaseCommand, CommandUtils } from './base';
export { BuildCommand } from './build';
export { McpServerCommand } from './mcp-server';
export { CreateCommand } from './create';
export { MakeCommand } from './make';
export { RunCommand } from './run';
/**
 * 所有命令类的类型
 */
export type CommandClass = BuildCommand | McpServerCommand | CreateCommand | MakeCommand | RunCommand;
/**
 * 命令注册器
 */
export declare class CommandRegistry {
    private commands;
    /**
     * 注册命令
     */
    register(command: CommandClass): void;
    /**
     * 注册所有命令
     */
    registerAll(): void;
    /**
     * 获取所有命令
     */
    getAllCommands(): CommandClass[];
}
