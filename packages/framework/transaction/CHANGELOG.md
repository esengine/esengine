# @esengine/transaction

## 2.0.2

### Patch Changes

- Updated dependencies [[`afdeb00`](https://github.com/esengine/esengine/commit/afdeb00b4df9427e7f03b91558bf95804a837b70)]:
    - @esengine/server@1.3.0

## 2.0.1

### Patch Changes

- Updated dependencies [[`61a13ba`](https://github.com/esengine/esengine/commit/61a13baca2e1e8fba14e23d439521ec0e6b7ca6e)]:
    - @esengine/server@1.2.0

## 2.0.0

### Major Changes

- [#384](https://github.com/esengine/esengine/pull/384) [`3b97838`](https://github.com/esengine/esengine/commit/3b978384c7d4570f9af9d139e3bfea04c6875543) Thanks [@esengine](https://github.com/esengine)! - ## Breaking Changes

    ### Storage API Simplification

    RedisStorage and MongoStorage now use **factory pattern only** for connection management. The direct client injection option has been removed.

    **Before (removed):**

    ```typescript
    // Direct client injection - NO LONGER SUPPORTED
    const storage = new RedisStorage({ client: redisClient });
    const storage = new MongoStorage({ client: mongoClient, database: 'game' });
    ```

    **After (factory pattern only):**

    ```typescript
    // RedisStorage
    const storage = new RedisStorage({
        factory: () => new Redis('redis://localhost:6379'),
        prefix: 'tx:',
        transactionTTL: 86400
    });

    // MongoStorage
    const storage = new MongoStorage({
        factory: async () => {
            const client = new MongoClient('mongodb://localhost:27017');
            await client.connect();
            return client;
        },
        database: 'game'
    });
    ```

    ### New Features
    - **Lazy Connection**: Connection is established on first operation, not at construction time
    - **Automatic Cleanup**: Support `await using` syntax (TypeScript 5.2+) for automatic resource cleanup
    - **Explicit Close**: Call `storage.close()` when done, or use `await using` for automatic disposal

    ### Migration Guide
    1. Replace `client` option with `factory` function
    2. Add `storage.close()` call when done, or use `await using`
    3. For MongoStorage, ensure factory returns a connected client

## 1.1.0

### Minor Changes

- [#381](https://github.com/esengine/esengine/pull/381) [`d4cef82`](https://github.com/esengine/esengine/commit/d4cef828e1dc1475e8483d40eb1d800c607cf3b6) Thanks [@esengine](https://github.com/esengine)! - feat(transaction): 添加游戏事务系统 | add game transaction system

    **@esengine/transaction** - 游戏事务系统 | Game transaction system

    ### 核心功能 | Core Features
    - **TransactionManager** - 事务生命周期管理 | Transaction lifecycle management
        - begin()/run() 创建事务 | Create transactions
        - 分布式锁支持 | Distributed lock support
        - 自动恢复未完成事务 | Auto-recover pending transactions
    - **TransactionContext** - 事务上下文 | Transaction context
        - 操作链式添加 | Chain operation additions
        - 上下文数据共享 | Context data sharing
        - 超时控制 | Timeout control
    - **Saga 模式** - 补偿式事务 | Compensating transactions
        - execute/compensate 成对操作 | Paired execute/compensate
        - 自动回滚失败事务 | Auto-rollback on failure

    ### 存储实现 | Storage Implementations
    - **MemoryStorage** - 内存存储，用于开发测试 | In-memory for dev/testing
    - **RedisStorage** - Redis 分布式锁和缓存 | Redis distributed lock & cache
    - **MongoStorage** - MongoDB 持久化事务日志 | MongoDB persistent transaction logs

    ### 内置操作 | Built-in Operations
    - **CurrencyOperation** - 货币增减操作 | Currency add/deduct
    - **InventoryOperation** - 背包物品操作 | Inventory item operations
    - **TradeOperation** - 玩家交易操作 | Player trade operations

    ### 分布式事务 | Distributed Transactions
    - **SagaOrchestrator** - 跨服务器 Saga 编排 | Cross-server Saga orchestration
    - 完整的 Saga 日志记录 | Complete Saga logging
    - 未完成 Saga 恢复 | Incomplete Saga recovery

    ### Room 集成 | Room Integration
    - **withTransactions()** - Room mixin 扩展 | Room mixin extension
    - **TransactionRoom** - 预配置的事务 Room 基类 | Pre-configured transaction Room base

    ### 文档 | Documentation
    - 完整的中英文文档 | Complete bilingual documentation
    - 核心概念、存储层、操作、分布式事务 | Core concepts, storage, operations, distributed
