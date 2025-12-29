/**
 * @zh 操作基类
 * @en Base operation class
 */

import type {
    ITransactionOperation,
    ITransactionContext,
    OperationResult
} from '../core/types.js';

/**
 * @zh 操作基类
 * @en Base operation class
 *
 * @zh 提供通用的操作实现模板
 * @en Provides common operation implementation template
 */
export abstract class BaseOperation<TData = unknown, TResult = unknown>
implements ITransactionOperation<TData, TResult>
{
    abstract readonly name: string
    readonly data: TData;

    constructor(data: TData) {
        this.data = data;
    }

    /**
     * @zh 验证前置条件（默认通过）
     * @en Validate preconditions (passes by default)
     */
    async validate(_ctx: ITransactionContext): Promise<boolean> {
        return true;
    }

    /**
     * @zh 执行操作
     * @en Execute operation
     */
    abstract execute(ctx: ITransactionContext): Promise<OperationResult<TResult>>

    /**
     * @zh 补偿操作
     * @en Compensate operation
     */
    abstract compensate(ctx: ITransactionContext): Promise<void>

    /**
     * @zh 创建成功结果
     * @en Create success result
     */
    protected success(data?: TResult): OperationResult<TResult> {
        return { success: true, data };
    }

    /**
     * @zh 创建失败结果
     * @en Create failure result
     */
    protected failure(error: string, errorCode?: string): OperationResult<TResult> {
        return { success: false, error, errorCode };
    }
}
