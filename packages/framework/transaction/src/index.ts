/**
 * @zh @esengine/transaction 事务系统
 * @en @esengine/transaction Transaction System
 *
 * @zh 提供游戏事务处理能力，支持商店购买、玩家交易、分布式事务
 * @en Provides game transaction capabilities, supporting shop purchases, player trading, and distributed transactions
 *
 * @example
 * ```typescript
 * import {
 *     TransactionManager,
 *     MemoryStorage,
 *     CurrencyOperation,
 *     InventoryOperation,
 * } from '@esengine/transaction'
 *
 * // 创建事务管理器
 * const manager = new TransactionManager({
 *     storage: new MemoryStorage(),
 * })
 *
 * // 执行事务
 * const result = await manager.run((tx) => {
 *     tx.addOperation(new CurrencyOperation({
 *         type: 'deduct',
 *         playerId: 'player1',
 *         currency: 'gold',
 *         amount: 100,
 *     }))
 *     tx.addOperation(new InventoryOperation({
 *         type: 'add',
 *         playerId: 'player1',
 *         itemId: 'sword',
 *         quantity: 1,
 *     }))
 * })
 *
 * if (result.success) {
 *     console.log('Transaction completed!')
 * }
 * ```
 */

// =============================================================================
// Core | 核心
// =============================================================================

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
} from './core/types.js'

export {
    TransactionContext,
    createTransactionContext,
} from './core/TransactionContext.js'

export {
    TransactionManager,
    createTransactionManager,
} from './core/TransactionManager.js'

// =============================================================================
// Storage | 存储
// =============================================================================

export {
    MemoryStorage,
    createMemoryStorage,
    type MemoryStorageConfig,
} from './storage/MemoryStorage.js'

export {
    RedisStorage,
    createRedisStorage,
    type RedisStorageConfig,
    type RedisClient,
} from './storage/RedisStorage.js'

export {
    MongoStorage,
    createMongoStorage,
    type MongoStorageConfig,
    type MongoDb,
    type MongoCollection,
} from './storage/MongoStorage.js'

// =============================================================================
// Operations | 操作
// =============================================================================

export { BaseOperation } from './operations/BaseOperation.js'

export {
    CurrencyOperation,
    createCurrencyOperation,
    type CurrencyOperationType,
    type CurrencyOperationData,
    type CurrencyOperationResult,
    type ICurrencyProvider,
} from './operations/CurrencyOperation.js'

export {
    InventoryOperation,
    createInventoryOperation,
    type InventoryOperationType,
    type InventoryOperationData,
    type InventoryOperationResult,
    type IInventoryProvider,
    type ItemData,
} from './operations/InventoryOperation.js'

export {
    TradeOperation,
    createTradeOperation,
    type TradeOperationData,
    type TradeOperationResult,
    type TradeItem,
    type TradeCurrency,
    type TradeParty,
    type ITradeProvider,
} from './operations/TradeOperation.js'

// =============================================================================
// Distributed | 分布式
// =============================================================================

export {
    SagaOrchestrator,
    createSagaOrchestrator,
    type SagaOrchestratorConfig,
    type SagaStep,
    type SagaStepState,
    type SagaStepLog,
    type SagaLog,
    type SagaResult,
} from './distributed/SagaOrchestrator.js'

// =============================================================================
// Integration | 集成
// =============================================================================

export {
    withTransactions,
    TransactionRoom,
    type TransactionRoomConfig,
    type ITransactionRoom,
} from './integration/RoomTransactionMixin.js'

// =============================================================================
// Tokens | 令牌
// =============================================================================

export {
    TransactionManagerToken,
    TransactionStorageToken,
} from './tokens.js'
