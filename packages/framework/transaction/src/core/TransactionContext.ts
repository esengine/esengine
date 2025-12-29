/**
 * @zh 事务上下文实现
 * @en Transaction context implementation
 */

import type {
    ITransactionContext,
    ITransactionOperation,
    ITransactionStorage,
    TransactionState,
    TransactionResult,
    TransactionOptions,
    TransactionLog,
    OperationLog,
    OperationResult
} from './types.js';

/**
 * @zh 生成唯一 ID
 * @en Generate unique ID
 */
function generateId(): string {
    return `tx_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * @zh 事务上下文
 * @en Transaction context
 *
 * @zh 封装事务的状态、操作和执行逻辑
 * @en Encapsulates transaction state, operations, and execution logic
 *
 * @example
 * ```typescript
 * const ctx = new TransactionContext({ timeout: 5000 })
 * ctx.addOperation(new DeductCurrency({ playerId: '1', amount: 100 }))
 * ctx.addOperation(new AddItem({ playerId: '1', itemId: 'sword' }))
 * const result = await ctx.execute()
 * ```
 */
export class TransactionContext implements ITransactionContext {
    private _id: string;
    private _state: TransactionState = 'pending';
    private _timeout: number;
    private _operations: ITransactionOperation[] = [];
    private _storage: ITransactionStorage | null;
    private _metadata: Record<string, unknown>;
    private _contextData: Map<string, unknown> = new Map();
    private _startTime: number = 0;
    private _distributed: boolean;

    constructor(options: TransactionOptions & { storage?: ITransactionStorage } = {}) {
        this._id = generateId();
        this._timeout = options.timeout ?? 30000;
        this._storage = options.storage ?? null;
        this._metadata = options.metadata ?? {};
        this._distributed = options.distributed ?? false;
    }

    // =========================================================================
    // 只读属性 | Readonly properties
    // =========================================================================

    get id(): string {
        return this._id;
    }

    get state(): TransactionState {
        return this._state;
    }

    get timeout(): number {
        return this._timeout;
    }

    get operations(): ReadonlyArray<ITransactionOperation> {
        return this._operations;
    }

    get storage(): ITransactionStorage | null {
        return this._storage;
    }

    get metadata(): Record<string, unknown> {
        return this._metadata;
    }

    // =========================================================================
    // 公共方法 | Public methods
    // =========================================================================

    /**
     * @zh 添加操作
     * @en Add operation
     */
    addOperation<T extends ITransactionOperation>(operation: T): this {
        if (this._state !== 'pending') {
            throw new Error(`Cannot add operation to transaction in state: ${this._state}`);
        }
        this._operations.push(operation);
        return this;
    }

    /**
     * @zh 执行事务
     * @en Execute transaction
     */
    async execute<T = unknown>(): Promise<TransactionResult<T>> {
        if (this._state !== 'pending') {
            return {
                success: false,
                transactionId: this._id,
                results: [],
                error: `Transaction already in state: ${this._state}`,
                duration: 0
            };
        }

        this._startTime = Date.now();
        this._state = 'executing';

        const results: OperationResult[] = [];
        let executedCount = 0;

        try {
            await this._saveLog();

            for (let i = 0; i < this._operations.length; i++) {
                if (this._isTimedOut()) {
                    throw new Error('Transaction timed out');
                }

                const op = this._operations[i];

                const isValid = await op.validate(this);
                if (!isValid) {
                    throw new Error(`Validation failed for operation: ${op.name}`);
                }

                const result = await op.execute(this);
                results.push(result);
                executedCount++;

                await this._updateOperationLog(i, 'executed');

                if (!result.success) {
                    throw new Error(result.error ?? `Operation ${op.name} failed`);
                }
            }

            this._state = 'committed';
            await this._updateTransactionState('committed');

            return {
                success: true,
                transactionId: this._id,
                results,
                data: this._collectResultData(results) as T,
                duration: Date.now() - this._startTime
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            await this._compensate(executedCount - 1);

            return {
                success: false,
                transactionId: this._id,
                results,
                error: errorMessage,
                duration: Date.now() - this._startTime
            };
        }
    }

    /**
     * @zh 手动回滚事务
     * @en Manually rollback transaction
     */
    async rollback(): Promise<void> {
        if (this._state === 'committed' || this._state === 'rolledback') {
            return;
        }

        await this._compensate(this._operations.length - 1);
    }

    /**
     * @zh 获取上下文数据
     * @en Get context data
     */
    get<T>(key: string): T | undefined {
        return this._contextData.get(key) as T | undefined;
    }

    /**
     * @zh 设置上下文数据
     * @en Set context data
     */
    set<T>(key: string, value: T): void {
        this._contextData.set(key, value);
    }

    // =========================================================================
    // 私有方法 | Private methods
    // =========================================================================

    private _isTimedOut(): boolean {
        return Date.now() - this._startTime > this._timeout;
    }

    private async _compensate(fromIndex: number): Promise<void> {
        this._state = 'rolledback';

        for (let i = fromIndex; i >= 0; i--) {
            const op = this._operations[i];
            try {
                await op.compensate(this);
                await this._updateOperationLog(i, 'compensated');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                await this._updateOperationLog(i, 'failed', errorMessage);
            }
        }

        await this._updateTransactionState('rolledback');
    }

    private async _saveLog(): Promise<void> {
        if (!this._storage) return;

        const log: TransactionLog = {
            id: this._id,
            state: this._state,
            createdAt: this._startTime,
            updatedAt: this._startTime,
            timeout: this._timeout,
            operations: this._operations.map((op) => ({
                name: op.name,
                data: op.data,
                state: 'pending' as const
            })),
            metadata: this._metadata,
            distributed: this._distributed
        };

        await this._storage.saveTransaction(log);
    }

    private async _updateTransactionState(state: TransactionState): Promise<void> {
        this._state = state;
        if (this._storage) {
            await this._storage.updateTransactionState(this._id, state);
        }
    }

    private async _updateOperationLog(
        index: number,
        state: OperationLog['state'],
        error?: string
    ): Promise<void> {
        if (this._storage) {
            await this._storage.updateOperationState(this._id, index, state, error);
        }
    }

    private _collectResultData(results: OperationResult[]): unknown {
        const data: Record<string, unknown> = {};
        for (const result of results) {
            if (result.data !== undefined) {
                Object.assign(data, result.data);
            }
        }
        return Object.keys(data).length > 0 ? data : undefined;
    }
}

/**
 * @zh 创建事务上下文
 * @en Create transaction context
 */
export function createTransactionContext(
    options: TransactionOptions & { storage?: ITransactionStorage } = {}
): ITransactionContext {
    return new TransactionContext(options);
}
