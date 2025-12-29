/**
 * @zh 交易操作
 * @en Trade operation
 */

import type { ITransactionContext, OperationResult } from '../core/types.js';
import { BaseOperation } from './BaseOperation.js';
import { CurrencyOperation, type CurrencyOperationData, type ICurrencyProvider } from './CurrencyOperation.js';
import { InventoryOperation, type InventoryOperationData, type IInventoryProvider, type ItemData } from './InventoryOperation.js';

/**
 * @zh 交易物品
 * @en Trade item
 */
export interface TradeItem {
    /**
     * @zh 物品 ID
     * @en Item ID
     */
    itemId: string

    /**
     * @zh 数量
     * @en Quantity
     */
    quantity: number
}

/**
 * @zh 交易货币
 * @en Trade currency
 */
export interface TradeCurrency {
    /**
     * @zh 货币类型
     * @en Currency type
     */
    currency: string

    /**
     * @zh 数量
     * @en Amount
     */
    amount: number
}

/**
 * @zh 交易方数据
 * @en Trade party data
 */
export interface TradeParty {
    /**
     * @zh 玩家 ID
     * @en Player ID
     */
    playerId: string

    /**
     * @zh 给出的物品
     * @en Items to give
     */
    items?: TradeItem[]

    /**
     * @zh 给出的货币
     * @en Currencies to give
     */
    currencies?: TradeCurrency[]
}

/**
 * @zh 交易操作数据
 * @en Trade operation data
 */
export interface TradeOperationData {
    /**
     * @zh 交易 ID
     * @en Trade ID
     */
    tradeId: string

    /**
     * @zh 交易发起方
     * @en Trade initiator
     */
    partyA: TradeParty

    /**
     * @zh 交易接收方
     * @en Trade receiver
     */
    partyB: TradeParty

    /**
     * @zh 原因/备注
     * @en Reason/note
     */
    reason?: string
}

/**
 * @zh 交易操作结果
 * @en Trade operation result
 */
export interface TradeOperationResult {
    /**
     * @zh 交易 ID
     * @en Trade ID
     */
    tradeId: string

    /**
     * @zh 交易是否成功
     * @en Whether trade succeeded
     */
    completed: boolean
}

/**
 * @zh 交易数据提供者
 * @en Trade data provider
 */
export interface ITradeProvider {
    currencyProvider?: ICurrencyProvider
    inventoryProvider?: IInventoryProvider
}

/**
 * @zh 交易操作
 * @en Trade operation
 *
 * @zh 用于处理玩家之间的物品和货币交换
 * @en Used for handling item and currency exchange between players
 *
 * @example
 * ```typescript
 * tx.addOperation(new TradeOperation({
 *     tradeId: 'trade_001',
 *     partyA: {
 *         playerId: 'player1',
 *         items: [{ itemId: 'sword', quantity: 1 }],
 *     },
 *     partyB: {
 *         playerId: 'player2',
 *         currencies: [{ currency: 'gold', amount: 1000 }],
 *     },
 * }))
 * ```
 */
export class TradeOperation extends BaseOperation<TradeOperationData, TradeOperationResult> {
    readonly name = 'trade';

    private _provider: ITradeProvider | null = null;
    private _subOperations: (CurrencyOperation | InventoryOperation)[] = [];
    private _executedCount = 0;

    /**
     * @zh 设置交易数据提供者
     * @en Set trade data provider
     */
    setProvider(provider: ITradeProvider): this {
        this._provider = provider;
        return this;
    }

    async validate(ctx: ITransactionContext): Promise<boolean> {
        this._buildSubOperations();

        for (const op of this._subOperations) {
            const isValid = await op.validate(ctx);
            if (!isValid) {
                return false;
            }
        }

        return true;
    }

    async execute(ctx: ITransactionContext): Promise<OperationResult<TradeOperationResult>> {
        this._buildSubOperations();
        this._executedCount = 0;

        try {
            for (const op of this._subOperations) {
                const result = await op.execute(ctx);
                if (!result.success) {
                    await this._compensateExecuted(ctx);
                    return this.failure(result.error ?? 'Trade operation failed', 'TRADE_FAILED');
                }
                this._executedCount++;
            }

            return this.success({
                tradeId: this.data.tradeId,
                completed: true
            });
        } catch (error) {
            await this._compensateExecuted(ctx);
            const errorMessage = error instanceof Error ? error.message : String(error);
            return this.failure(errorMessage, 'TRADE_ERROR');
        }
    }

    async compensate(ctx: ITransactionContext): Promise<void> {
        await this._compensateExecuted(ctx);
    }

    private _buildSubOperations(): void {
        if (this._subOperations.length > 0) return;

        const { partyA, partyB } = this.data;

        if (partyA.items) {
            for (const item of partyA.items) {
                const removeOp = new InventoryOperation({
                    type: 'remove',
                    playerId: partyA.playerId,
                    itemId: item.itemId,
                    quantity: item.quantity,
                    reason: `trade:${this.data.tradeId}:give`
                });
                const addOp = new InventoryOperation({
                    type: 'add',
                    playerId: partyB.playerId,
                    itemId: item.itemId,
                    quantity: item.quantity,
                    reason: `trade:${this.data.tradeId}:receive`
                });

                if (this._provider?.inventoryProvider) {
                    removeOp.setProvider(this._provider.inventoryProvider);
                    addOp.setProvider(this._provider.inventoryProvider);
                }

                this._subOperations.push(removeOp, addOp);
            }
        }

        if (partyA.currencies) {
            for (const curr of partyA.currencies) {
                const deductOp = new CurrencyOperation({
                    type: 'deduct',
                    playerId: partyA.playerId,
                    currency: curr.currency,
                    amount: curr.amount,
                    reason: `trade:${this.data.tradeId}:give`
                });
                const addOp = new CurrencyOperation({
                    type: 'add',
                    playerId: partyB.playerId,
                    currency: curr.currency,
                    amount: curr.amount,
                    reason: `trade:${this.data.tradeId}:receive`
                });

                if (this._provider?.currencyProvider) {
                    deductOp.setProvider(this._provider.currencyProvider);
                    addOp.setProvider(this._provider.currencyProvider);
                }

                this._subOperations.push(deductOp, addOp);
            }
        }

        if (partyB.items) {
            for (const item of partyB.items) {
                const removeOp = new InventoryOperation({
                    type: 'remove',
                    playerId: partyB.playerId,
                    itemId: item.itemId,
                    quantity: item.quantity,
                    reason: `trade:${this.data.tradeId}:give`
                });
                const addOp = new InventoryOperation({
                    type: 'add',
                    playerId: partyA.playerId,
                    itemId: item.itemId,
                    quantity: item.quantity,
                    reason: `trade:${this.data.tradeId}:receive`
                });

                if (this._provider?.inventoryProvider) {
                    removeOp.setProvider(this._provider.inventoryProvider);
                    addOp.setProvider(this._provider.inventoryProvider);
                }

                this._subOperations.push(removeOp, addOp);
            }
        }

        if (partyB.currencies) {
            for (const curr of partyB.currencies) {
                const deductOp = new CurrencyOperation({
                    type: 'deduct',
                    playerId: partyB.playerId,
                    currency: curr.currency,
                    amount: curr.amount,
                    reason: `trade:${this.data.tradeId}:give`
                });
                const addOp = new CurrencyOperation({
                    type: 'add',
                    playerId: partyA.playerId,
                    currency: curr.currency,
                    amount: curr.amount,
                    reason: `trade:${this.data.tradeId}:receive`
                });

                if (this._provider?.currencyProvider) {
                    deductOp.setProvider(this._provider.currencyProvider);
                    addOp.setProvider(this._provider.currencyProvider);
                }

                this._subOperations.push(deductOp, addOp);
            }
        }
    }

    private async _compensateExecuted(ctx: ITransactionContext): Promise<void> {
        for (let i = this._executedCount - 1; i >= 0; i--) {
            await this._subOperations[i].compensate(ctx);
        }
    }
}

/**
 * @zh 创建交易操作
 * @en Create trade operation
 */
export function createTradeOperation(data: TradeOperationData): TradeOperation {
    return new TradeOperation(data);
}
