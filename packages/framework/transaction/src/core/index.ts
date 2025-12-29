/**
 * @zh 核心模块导出
 * @en Core module exports
 */

export type {
    TransactionState,
    OperationResult,
    TransactionResult,
    OperationLog,
    TransactionLog,
    TransactionOptions,
    TransactionManagerConfig,
    ITransactionStorage,
    ITransactionOperation,
    ITransactionContext,
} from './types.js'

export { TransactionContext, createTransactionContext } from './TransactionContext.js'
export { TransactionManager, createTransactionManager } from './TransactionManager.js'
