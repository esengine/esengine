---
title: "Operations"
description: "Built-in transaction operations: currency, inventory, trade"
---

## BaseOperation

Base class for all operations, providing a common implementation template.

```typescript
import { BaseOperation, ITransactionContext, OperationResult } from '@esengine/transaction';

class MyOperation extends BaseOperation<MyData, MyResult> {
    readonly name = 'myOperation';

    async validate(ctx: ITransactionContext): Promise<boolean> {
        // Validate preconditions
        return true;
    }

    async execute(ctx: ITransactionContext): Promise<OperationResult<MyResult>> {
        // Execute operation
        return this.success({ result: 'ok' });
        // or
        return this.failure('Something went wrong', 'ERROR_CODE');
    }

    async compensate(ctx: ITransactionContext): Promise<void> {
        // Rollback operation
    }
}
```

## CurrencyOperation

Handles currency addition and deduction.

### Deduct Currency

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

### Add Currency

```typescript
tx.addOperation(new CurrencyOperation({
    type: 'add',
    playerId: 'player1',
    currency: 'diamond',
    amount: 50,
    reason: 'daily_reward',
}));
```

### Operation Data

```typescript
interface CurrencyOperationData {
    type: 'add' | 'deduct';   // Operation type
    playerId: string;          // Player ID
    currency: string;          // Currency type
    amount: number;            // Amount
    reason?: string;           // Reason/source
}
```

### Operation Result

```typescript
interface CurrencyOperationResult {
    beforeBalance: number;     // Balance before operation
    afterBalance: number;      // Balance after operation
}
```

### Custom Data Provider

```typescript
interface ICurrencyProvider {
    getBalance(playerId: string, currency: string): Promise<number>;
    setBalance(playerId: string, currency: string, amount: number): Promise<void>;
}

class MyCurrencyProvider implements ICurrencyProvider {
    async getBalance(playerId: string, currency: string): Promise<number> {
        // Get balance from database
        return await db.getCurrency(playerId, currency);
    }

    async setBalance(playerId: string, currency: string, amount: number): Promise<void> {
        // Save to database
        await db.setCurrency(playerId, currency, amount);
    }
}

// Use custom provider
const op = new CurrencyOperation({ ... });
op.setProvider(new MyCurrencyProvider());
tx.addOperation(op);
```

## InventoryOperation

Handles item addition, removal, and updates.

### Add Item

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

### Remove Item

```typescript
tx.addOperation(new InventoryOperation({
    type: 'remove',
    playerId: 'player1',
    itemId: 'potion_hp',
    quantity: 5,
}));
```

### Update Item

```typescript
tx.addOperation(new InventoryOperation({
    type: 'update',
    playerId: 'player1',
    itemId: 'sword_001',
    quantity: 1,  // Optional, keeps original if not provided
    properties: { enchant: 'lightning', level: 5 },
}));
```

### Operation Data

```typescript
interface InventoryOperationData {
    type: 'add' | 'remove' | 'update';  // Operation type
    playerId: string;                    // Player ID
    itemId: string;                      // Item ID
    quantity: number;                    // Quantity
    properties?: Record<string, unknown>; // Item properties
    reason?: string;                     // Reason/source
}
```

### Operation Result

```typescript
interface InventoryOperationResult {
    beforeItem?: ItemData;   // Item before operation
    afterItem?: ItemData;    // Item after operation
}

interface ItemData {
    itemId: string;
    quantity: number;
    properties?: Record<string, unknown>;
}
```

### Custom Data Provider

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

Handles item and currency exchange between players.

### Basic Usage

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

### Operation Data

```typescript
interface TradeOperationData {
    tradeId: string;      // Trade ID
    partyA: TradeParty;   // Trade initiator
    partyB: TradeParty;   // Trade receiver
    reason?: string;      // Reason/note
}

interface TradeParty {
    playerId: string;              // Player ID
    items?: TradeItem[];           // Items to give
    currencies?: TradeCurrency[];  // Currencies to give
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

### Execution Flow

TradeOperation internally generates the following sub-operation sequence:

```
1. Remove partyA's items
2. Add items to partyB (from partyA)
3. Deduct partyA's currencies
4. Add currencies to partyB (from partyA)
5. Remove partyB's items
6. Add items to partyA (from partyB)
7. Deduct partyB's currencies
8. Add currencies to partyA (from partyB)
```

If any step fails, all previous operations are rolled back.

### Using Custom Providers

```typescript
const op = new TradeOperation({ ... });
op.setProvider({
    currencyProvider: new MyCurrencyProvider(),
    inventoryProvider: new MyInventoryProvider(),
});
tx.addOperation(op);
```

## Factory Functions

Each operation class provides a factory function:

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
