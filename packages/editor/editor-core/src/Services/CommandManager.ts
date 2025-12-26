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
    private _undoStack: ICommand[] = [];
    private _redoStack: ICommand[] = [];
    private readonly _config: Required<CommandManagerConfig>;
    private _isExecuting = false;

    constructor(config: CommandManagerConfig = {}) {
        this._config = {
            maxHistorySize: config.maxHistorySize ?? 100,
            autoMerge: config.autoMerge ?? true
        };
    }

    /**
     * @zh 尝试将命令与栈顶命令合并
     * @en Try to merge command with the top of stack
     */
    private _tryMergeWithLast(command: ICommand): boolean {
        if (!this._config.autoMerge || this._undoStack.length === 0) {
            return false;
        }

        const lastCommand = this._undoStack[this._undoStack.length - 1];
        if (lastCommand?.canMergeWith(command)) {
            this._undoStack[this._undoStack.length - 1] = lastCommand.mergeWith(command);
            this._redoStack = [];
            return true;
        }

        return false;
    }

    /**
     * @zh 将命令推入撤销栈
     * @en Push command to undo stack
     */
    private _pushToUndoStack(command: ICommand): void {
        if (this._tryMergeWithLast(command)) {
            return;
        }

        this._undoStack.push(command);
        this._redoStack = [];

        if (this._undoStack.length > this._config.maxHistorySize) {
            this._undoStack.shift();
        }
    }

    /**
     * @zh 执行命令
     * @en Execute command
     */
    execute(command: ICommand): void {
        if (this._isExecuting) {
            throw new Error('Cannot execute command while another is executing');
        }

        this._isExecuting = true;

        try {
            command.execute();
            this._pushToUndoStack(command);
        } finally {
            this._isExecuting = false;
        }
    }

    /**
     * @zh 撤销上一个命令
     * @en Undo last command
     */
    undo(): void {
        if (this._isExecuting) {
            throw new Error('Cannot undo while executing');
        }

        const command = this._undoStack.pop();
        if (!command) return;

        this._isExecuting = true;

        try {
            command.undo();
            this._redoStack.push(command);
        } catch (error) {
            this._undoStack.push(command);
            throw error;
        } finally {
            this._isExecuting = false;
        }
    }

    /**
     * @zh 重做上一个被撤销的命令
     * @en Redo last undone command
     */
    redo(): void {
        if (this._isExecuting) {
            throw new Error('Cannot redo while executing');
        }

        const command = this._redoStack.pop();
        if (!command) return;

        this._isExecuting = true;

        try {
            command.execute();
            this._undoStack.push(command);
        } catch (error) {
            this._redoStack.push(command);
            throw error;
        } finally {
            this._isExecuting = false;
        }
    }

    /** @zh 检查是否可以撤销 @en Check if can undo */
    canUndo(): boolean {
        return this._undoStack.length > 0;
    }

    /** @zh 检查是否可以重做 @en Check if can redo */
    canRedo(): boolean {
        return this._redoStack.length > 0;
    }

    /** @zh 获取撤销栈的描述列表 @en Get undo history descriptions */
    getUndoHistory(): string[] {
        return this._undoStack.map(cmd => cmd.getDescription());
    }

    /** @zh 获取重做栈的描述列表 @en Get redo history descriptions */
    getRedoHistory(): string[] {
        return this._redoStack.map(cmd => cmd.getDescription());
    }

    /** @zh 清空所有历史记录 @en Clear all history */
    clear(): void {
        this._undoStack = [];
        this._redoStack = [];
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
        this._pushToUndoStack(command);
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
