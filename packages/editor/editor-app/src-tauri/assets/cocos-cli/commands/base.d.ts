import { Command } from 'commander';
/**
 * 命令基类
 */
export declare abstract class BaseCommand {
    protected program: Command;
    constructor(program: Command);
    /**
     * 注册命令
     */
    abstract register(): void;
    /**
     * 验证项目路径
     */
    protected validateProjectPath(projectPath: string): string;
    /**
     * 获取全局选项
     */
    protected getGlobalOptions(): any;
}
/**
 * 命令工具函数
 */
export declare class CommandUtils {
    /**
     * 显示构建信息
     */
    static showBuildInfo(projectPath: string, platform: string): void;
    /**
     * 显示 MCP 服务器信息
     */
    static showMcpServerInfo(projectPath: string, port: number): void;
}
