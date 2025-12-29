---
"@esengine/transaction": minor
---

feat(transaction): 添加游戏事务系统 | add game transaction system

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
