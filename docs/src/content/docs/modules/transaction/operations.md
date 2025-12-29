---
title: "操作类"
description: "内置的事务操作：货币、背包、交易"
---

## BaseOperation

所有操作类的基类，提供通用的实现模板。

```typescript
import { BaseOperation, ITransactionContext, OperationResult } from '@esengine/transaction';

class MyOperation extends BaseOperation<MyData, MyResult> {
    readonly name = 'myOperation';

    async validate(ctx: ITransactionContext): Promise<boolean> {
        // 验证前置条件
        return true;
    }

    async execute(ctx: ITransactionContext): Promise<OperationResult<MyResult>> {
        // 执行操作
        return this.success({ result: 'ok' });
        // 或
        return this.failure('Something went wrong', 'ERROR_CODE');
    }

    async compensate(ctx: ITransactionContext): Promise<void> {
        // 回滚操作
    }
}
```

## CurrencyOperation

处理货币的增加和扣除。

### 扣除货币

```typescript
import { CurrencyOperation } from '@esengine/transaction';

tx.addOperation(new CurrencyOperation({
    type: 'deduct',
    playerId: 'player1',
    currency: 'gold',
    amount: 100,
    reason: 'purchase_item',
}));
```

### 增加货币

```typescript
tx.addOperation(new CurrencyOperation({
    type: 'add',
    playerId: 'player1',
    currency: 'diamond',
    amount: 50,
    reason: 'daily_reward',
}));
```

### 操作数据

```typescript
interface CurrencyOperationData {
    type: 'add' | 'deduct';   // 操作类型
    playerId: string;          // 玩家 ID
    currency: string;          // 货币类型
    amount: number;            // 数量
    reason?: string;           // 原因/来源
}
```

### 操作结果

```typescript
interface CurrencyOperationResult {
    beforeBalance: number;     // 操作前余额
    afterBalance: number;      // 操作后余额
}
```

### 自定义数据提供者

```typescript
interface ICurrencyProvider {
    getBalance(playerId: string, currency: string): Promise<number>;
    setBalance(playerId: string, currency: string, amount: number): Promise<void>;
}

class MyCurrencyProvider implements ICurrencyProvider {
    async getBalance(playerId: string, currency: string): Promise<number> {
        // 从数据库获取余额
        return await db.getCurrency(playerId, currency);
    }

    async setBalance(playerId: string, currency: string, amount: number): Promise<void> {
        // 保存到数据库
        await db.setCurrency(playerId, currency, amount);
    }
}

// 使用自定义提供者
const op = new CurrencyOperation({ ... });
op.setProvider(new MyCurrencyProvider());
tx.addOperation(op);
```

## InventoryOperation

处理物品的添加、移除和更新。

### 添加物品

```typescript
import { InventoryOperation } from '@esengine/transaction';

tx.addOperation(new InventoryOperation({
    type: 'add',
    playerId: 'player1',
    itemId: 'sword_001',
    quantity: 1,
    properties: { enchant: 'fire' },
}));
```

### 移除物品

```typescript
tx.addOperation(new InventoryOperation({
    type: 'remove',
    playerId: 'player1',
    itemId: 'potion_hp',
    quantity: 5,
}));
```

### 更新物品

```typescript
tx.addOperation(new InventoryOperation({
    type: 'update',
    playerId: 'player1',
    itemId: 'sword_001',
    quantity: 1,  // 可选，不传则保持原数量
    properties: { enchant: 'lightning', level: 5 },
}));
```

### 操作数据

```typescript
interface InventoryOperationData {
    type: 'add' | 'remove' | 'update';  // 操作类型
    playerId: string;                    // 玩家 ID
    itemId: string;                      // 物品 ID
    quantity: number;                    // 数量
    properties?: Record<string, unknown>; // 物品属性
    reason?: string;                     // 原因/来源
}
```

### 操作结果

```typescript
interface InventoryOperationResult {
    beforeItem?: ItemData;   // 操作前物品
    afterItem?: ItemData;    // 操作后物品
}

interface ItemData {
    itemId: string;
    quantity: number;
    properties?: Record<string, unknown>;
}
```

### 自定义数据提供者

```typescript
interface IInventoryProvider {
    getItem(playerId: string, itemId: string): Promise<ItemData | null>;
    setItem(playerId: string, itemId: string, item: ItemData | null): Promise<void>;
    hasCapacity?(playerId: string, count: number): Promise<boolean>;
}

class MyInventoryProvider implements IInventoryProvider {
    async getItem(playerId: string, itemId: string): Promise<ItemData | null> {
        return await db.getItem(playerId, itemId);
    }

    async setItem(playerId: string, itemId: string, item: ItemData | null): Promise<void> {
        if (item) {
            await db.saveItem(playerId, itemId, item);
        } else {
            await db.deleteItem(playerId, itemId);
        }
    }

    async hasCapacity(playerId: string, count: number): Promise<boolean> {
        const current = await db.getItemCount(playerId);
        const max = await db.getMaxCapacity(playerId);
        return current + count <= max;
    }
}
```

## TradeOperation

处理玩家之间的物品和货币交换。

### 基本用法

```typescript
import { TradeOperation } from '@esengine/transaction';

tx.addOperation(new TradeOperation({
    tradeId: 'trade_001',
    partyA: {
        playerId: 'player1',
        items: [{ itemId: 'sword', quantity: 1 }],
        currencies: [{ currency: 'diamond', amount: 10 }],
    },
    partyB: {
        playerId: 'player2',
        currencies: [{ currency: 'gold', amount: 1000 }],
    },
    reason: 'player_trade',
}));
```

### 操作数据

```typescript
interface TradeOperationData {
    tradeId: string;      // 交易 ID
    partyA: TradeParty;   // 交易发起方
    partyB: TradeParty;   // 交易接收方
    reason?: string;      // 原因/备注
}

interface TradeParty {
    playerId: string;              // 玩家 ID
    items?: TradeItem[];           // 给出的物品
    currencies?: TradeCurrency[];  // 给出的货币
}

interface TradeItem {
    itemId: string;
    quantity: number;
}

interface TradeCurrency {
    currency: string;
    amount: number;
}
```

### 执行流程

TradeOperation 内部会生成以下子操作序列：

```
1. 移除 partyA 的物品
2. 添加 partyB 的物品（来自 partyA）
3. 扣除 partyA 的货币
4. 增加 partyB 的货币（来自 partyA）
5. 移除 partyB 的物品
6. 添加 partyA 的物品（来自 partyB）
7. 扣除 partyB 的货币
8. 增加 partyA 的货币（来自 partyB）
```

任何一步失败都会回滚之前的所有操作。

### 使用自定义提供者

```typescript
const op = new TradeOperation({ ... });
op.setProvider({
    currencyProvider: new MyCurrencyProvider(),
    inventoryProvider: new MyInventoryProvider(),
});
tx.addOperation(op);
```

## 创建工厂函数

每个操作类都提供工厂函数：

```typescript
import {
    createCurrencyOperation,
    createInventoryOperation,
    createTradeOperation,
} from '@esengine/transaction';

tx.addOperation(createCurrencyOperation({
    type: 'deduct',
    playerId: 'player1',
    currency: 'gold',
    amount: 100,
}));

tx.addOperation(createInventoryOperation({
    type: 'add',
    playerId: 'player1',
    itemId: 'sword',
    quantity: 1,
}));
```
