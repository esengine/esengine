import { ICommand } from './ICommand';

/**
 * @zh 命令历史记录配置
 * @en Command history configuration
 */
export interface CommandManagerConfig {
    /** @zh 最大历史记录数量 @en Maximum history size */
    maxHistorySize?: number;
    /** @zh 是否自动合并相似命令 @en Auto merge similar commands */
    autoMerge?: boolean;
}

/**
 * @zh 命令管理器 - 管理命令的执行、撤销、重做以及历史记录
 * @en Command Manager - Manages command execution, undo, redo and history
 */
export class CommandManager {
    private undoStack: ICommand[] = [];
    private redoStack: ICommand[] = [];
    private readonly config: Required<CommandManagerConfig>;
    private isExecuting = false;

    constructor(config: CommandManagerConfig = {}) {
        this.config = {
            maxHistorySize: config.maxHistorySize ?? 100,
            autoMerge: config.autoMerge ?? true
        };
    }

    /**
     * @zh 尝试将命令与栈顶命令合并
     * @en Try to merge command with the top of stack
     */
    private tryMergeWithLast(command: ICommand): boolean {
        if (!this.config.autoMerge || this.undoStack.length === 0) {
            return false;
        }

        const lastCommand = this.undoStack[this.undoStack.length - 1];
        if (lastCommand?.canMergeWith(command)) {
            this.undoStack[this.undoStack.length - 1] = lastCommand.mergeWith(command);
            this.redoStack = [];
            return true;
        }

        return false;
    }

    /**
     * @zh 将命令推入撤销栈
     * @en Push command to undo stack
     */
    private pushToUndoStack(command: ICommand): void {
        if (this.tryMergeWithLast(command)) {
            return;
        }

        this.undoStack.push(command);
        this.redoStack = [];

        if (this.undoStack.length > this.config.maxHistorySize) {
            this.undoStack.shift();
        }
    }

    /**
     * @zh 执行命令
     * @en Execute command
     */
    execute(command: ICommand): void {
        if (this.isExecuting) {
            throw new Error('Cannot execute command while another is executing');
        }

        this.isExecuting = true;

        try {
            command.execute();
            this.pushToUndoStack(command);
        } finally {
            this.isExecuting = false;
        }
    }

    /**
     * @zh 撤销上一个命令
     * @en Undo last command
     */
    undo(): void {
        if (this.isExecuting) {
            throw new Error('Cannot undo while executing');
        }

        const command = this.undoStack.pop();
        if (!command) return;

        this.isExecuting = true;

        try {
            command.undo();
            this.redoStack.push(command);
        } catch (error) {
            this.undoStack.push(command);
            throw error;
        } finally {
            this.isExecuting = false;
        }
    }

    /**
     * @zh 重做上一个被撤销的命令
     * @en Redo last undone command
     */
    redo(): void {
        if (this.isExecuting) {
            throw new Error('Cannot redo while executing');
        }

        const command = this.redoStack.pop();
        if (!command) return;

        this.isExecuting = true;

        try {
            command.execute();
            this.undoStack.push(command);
        } catch (error) {
            this.redoStack.push(command);
            throw error;
        } finally {
            this.isExecuting = false;
        }
    }

    /** @zh 检查是否可以撤销 @en Check if can undo */
    canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    /** @zh 检查是否可以重做 @en Check if can redo */
    canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    /** @zh 获取撤销栈的描述列表 @en Get undo history descriptions */
    getUndoHistory(): string[] {
        return this.undoStack.map(cmd => cmd.getDescription());
    }

    /** @zh 获取重做栈的描述列表 @en Get redo history descriptions */
    getRedoHistory(): string[] {
        return this.redoStack.map(cmd => cmd.getDescription());
    }

    /** @zh 清空所有历史记录 @en Clear all history */
    clear(): void {
        this.undoStack = [];
        this.redoStack = [];
    }

    /**
     * @zh 批量执行命令（作为单一操作，可以一次撤销）
     * @en Execute batch commands (as single operation, can be undone at once)
     */
    executeBatch(commands: ICommand[]): void {
        if (commands.length === 0) return;
        this.execute(new BatchCommand(commands));
    }

    /**
     * @zh 将命令推入撤销栈但不执行（用于已执行的操作如拖动变换）
     * @en Push command to undo stack without executing (for already performed operations)
     */
    pushWithoutExecute(command: ICommand): void {
        this.pushToUndoStack(command);
    }
}

/**
 * @zh 批量命令 - 将多个命令组合为一个命令
 * @en Batch Command - Combines multiple commands into one
 */
class BatchCommand implements ICommand {
    constructor(private readonly commands: ICommand[]) {}

    execute(): void {
        for (const command of this.commands) {
            command.execute();
        }
    }

    undo(): void {
        for (let i = this.commands.length - 1; i >= 0; i--) {
            this.commands[i]?.undo();
        }
    }

    getDescription(): string {
        return `Batch (${this.commands.length} commands)`;
    }

    canMergeWith(): boolean {
        return false;
    }

    mergeWith(): ICommand {
        throw new Error('Batch commands cannot be merged');
    }
}
