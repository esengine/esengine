/**
 * @zh TradeOperation 单元测试
 * @en TradeOperation unit tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TradeOperation, createTradeOperation, type ITradeProvider } from '../../src/operations/TradeOperation.js'
import { TransactionContext } from '../../src/core/TransactionContext.js'
import { MemoryStorage } from '../../src/storage/MemoryStorage.js'
import type { ITransactionContext } from '../../src/core/types.js'
import type { ICurrencyProvider } from '../../src/operations/CurrencyOperation.js'
import type { IInventoryProvider, ItemData } from '../../src/operations/InventoryOperation.js'

// ============================================================================
// Mock Providers | 模拟数据提供者
// ============================================================================

class MockCurrencyProvider implements ICurrencyProvider {
    private _balances: Map<string, Map<string, number>> = new Map()

    initBalance(playerId: string, currency: string, amount: number): void {
        if (!this._balances.has(playerId)) {
            this._balances.set(playerId, new Map())
        }
        this._balances.get(playerId)!.set(currency, amount)
    }

    async getBalance(playerId: string, currency: string): Promise<number> {
        return this._balances.get(playerId)?.get(currency) ?? 0
    }

    async setBalance(playerId: string, currency: string, amount: number): Promise<void> {
        if (!this._balances.has(playerId)) {
            this._balances.set(playerId, new Map())
        }
        this._balances.get(playerId)!.set(currency, amount)
    }
}

class MockInventoryProvider implements IInventoryProvider {
    private _inventory: Map<string, Map<string, ItemData>> = new Map()

    addItem(playerId: string, itemId: string, item: ItemData): void {
        if (!this._inventory.has(playerId)) {
            this._inventory.set(playerId, new Map())
        }
        this._inventory.get(playerId)!.set(itemId, item)
    }

    async getItem(playerId: string, itemId: string): Promise<ItemData | null> {
        return this._inventory.get(playerId)?.get(itemId) ?? null
    }

    async setItem(playerId: string, itemId: string, item: ItemData | null): Promise<void> {
        if (!this._inventory.has(playerId)) {
            this._inventory.set(playerId, new Map())
        }
        if (item) {
            this._inventory.get(playerId)!.set(itemId, item)
        } else {
            this._inventory.get(playerId)!.delete(itemId)
        }
    }
}

// ============================================================================
// Test Suite | 测试套件
// ============================================================================

describe('TradeOperation', () => {
    let storage: MemoryStorage
    let ctx: ITransactionContext

    beforeEach(() => {
        storage = new MemoryStorage()
        ctx = new TransactionContext({ storage })
    })

    // ========================================================================
    // 构造器测试 | Constructor Tests
    // ========================================================================

    describe('Constructor', () => {
        it('should create with data', () => {
            const op = new TradeOperation({
                tradeId: 'trade-001',
                partyA: {
                    playerId: 'player-1',
                    items: [{ itemId: 'sword', quantity: 1 }],
                },
                partyB: {
                    playerId: 'player-2',
                    currencies: [{ currency: 'gold', amount: 1000 }],
                },
            })

            expect(op.name).toBe('trade')
            expect(op.data.tradeId).toBe('trade-001')
            expect(op.data.partyA.playerId).toBe('player-1')
            expect(op.data.partyB.playerId).toBe('player-2')
        })

        it('should use createTradeOperation factory', () => {
            const op = createTradeOperation({
                tradeId: 'trade-002',
                partyA: { playerId: 'player-1' },
                partyB: { playerId: 'player-2' },
            })

            expect(op).toBeInstanceOf(TradeOperation)
        })
    })

    // ========================================================================
    // 验证测试 | Validation Tests
    // ========================================================================

    describe('validate()', () => {
        it('should validate item trade', async () => {
            // Player 1 has sword, Player 2 has gold
            await storage.set('player:player-1:inventory:sword', {
                itemId: 'sword',
                quantity: 1,
            })
            await storage.set('player:player-2:currency:gold', 1000)

            const op = new TradeOperation({
                tradeId: 'trade-001',
                partyA: {
                    playerId: 'player-1',
                    items: [{ itemId: 'sword', quantity: 1 }],
                },
                partyB: {
                    playerId: 'player-2',
                    currencies: [{ currency: 'gold', amount: 1000 }],
                },
            })

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(true)
        })

        it('should fail validation when party A lacks items', async () => {
            await storage.set('player:player-2:currency:gold', 1000)

            const op = new TradeOperation({
                tradeId: 'trade-001',
                partyA: {
                    playerId: 'player-1',
                    items: [{ itemId: 'sword', quantity: 1 }],
                },
                partyB: {
                    playerId: 'player-2',
                    currencies: [{ currency: 'gold', amount: 1000 }],
                },
            })

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(false)
        })

        it('should fail validation when party B lacks currency', async () => {
            await storage.set('player:player-1:inventory:sword', {
                itemId: 'sword',
                quantity: 1,
            })
            await storage.set('player:player-2:currency:gold', 500) // Not enough

            const op = new TradeOperation({
                tradeId: 'trade-001',
                partyA: {
                    playerId: 'player-1',
                    items: [{ itemId: 'sword', quantity: 1 }],
                },
                partyB: {
                    playerId: 'player-2',
                    currencies: [{ currency: 'gold', amount: 1000 }],
                },
            })

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(false)
        })
    })

    // ========================================================================
    // 执行测试 - 物品换货币 | Execute Tests - Item for Currency
    // ========================================================================

    describe('execute() - item for currency', () => {
        it('should trade item for currency', async () => {
            await storage.set('player:player-1:inventory:sword', {
                itemId: 'sword',
                quantity: 1,
            })
            await storage.set('player:player-2:currency:gold', 1000)

            const op = new TradeOperation({
                tradeId: 'trade-001',
                partyA: {
                    playerId: 'player-1',
                    items: [{ itemId: 'sword', quantity: 1 }],
                },
                partyB: {
                    playerId: 'player-2',
                    currencies: [{ currency: 'gold', amount: 1000 }],
                },
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(result.data?.tradeId).toBe('trade-001')
            expect(result.data?.completed).toBe(true)

            // Player 1: no sword, got gold
            expect(await storage.get('player:player-1:inventory:sword')).toBeNull()
            expect(await storage.get('player:player-1:currency:gold')).toBe(1000)

            // Player 2: got sword, no gold
            const p2Sword = await storage.get<ItemData>('player:player-2:inventory:sword')
            expect(p2Sword?.quantity).toBe(1)
            expect(await storage.get('player:player-2:currency:gold')).toBe(0)
        })
    })

    // ========================================================================
    // 执行测试 - 物品换物品 | Execute Tests - Item for Item
    // ========================================================================

    describe('execute() - item for item', () => {
        it('should trade items between players', async () => {
            await storage.set('player:player-1:inventory:sword', {
                itemId: 'sword',
                quantity: 1,
            })
            await storage.set('player:player-2:inventory:shield', {
                itemId: 'shield',
                quantity: 1,
            })

            const op = new TradeOperation({
                tradeId: 'trade-002',
                partyA: {
                    playerId: 'player-1',
                    items: [{ itemId: 'sword', quantity: 1 }],
                },
                partyB: {
                    playerId: 'player-2',
                    items: [{ itemId: 'shield', quantity: 1 }],
                },
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)

            // Player 1: got shield, no sword
            expect(await storage.get('player:player-1:inventory:sword')).toBeNull()
            const p1Shield = await storage.get<ItemData>('player:player-1:inventory:shield')
            expect(p1Shield?.quantity).toBe(1)

            // Player 2: got sword, no shield
            expect(await storage.get('player:player-2:inventory:shield')).toBeNull()
            const p2Sword = await storage.get<ItemData>('player:player-2:inventory:sword')
            expect(p2Sword?.quantity).toBe(1)
        })
    })

    // ========================================================================
    // 执行测试 - 货币换货币 | Execute Tests - Currency for Currency
    // ========================================================================

    describe('execute() - currency for currency', () => {
        it('should trade currencies between players', async () => {
            await storage.set('player:player-1:currency:gold', 1000)
            await storage.set('player:player-2:currency:diamond', 100)

            const op = new TradeOperation({
                tradeId: 'trade-003',
                partyA: {
                    playerId: 'player-1',
                    currencies: [{ currency: 'gold', amount: 1000 }],
                },
                partyB: {
                    playerId: 'player-2',
                    currencies: [{ currency: 'diamond', amount: 100 }],
                },
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)

            // Player 1: no gold, got diamonds
            expect(await storage.get('player:player-1:currency:gold')).toBe(0)
            expect(await storage.get('player:player-1:currency:diamond')).toBe(100)

            // Player 2: got gold, no diamonds
            expect(await storage.get('player:player-2:currency:gold')).toBe(1000)
            expect(await storage.get('player:player-2:currency:diamond')).toBe(0)
        })
    })

    // ========================================================================
    // 执行测试 - 复杂交易 | Execute Tests - Complex Trade
    // ========================================================================

    describe('execute() - complex trade', () => {
        it('should handle multiple items and currencies', async () => {
            // Setup
            await storage.set('player:player-1:inventory:sword', { itemId: 'sword', quantity: 2 })
            await storage.set('player:player-1:inventory:potion', { itemId: 'potion', quantity: 10 })
            await storage.set('player:player-2:currency:gold', 5000)
            await storage.set('player:player-2:currency:diamond', 50)

            const op = new TradeOperation({
                tradeId: 'trade-004',
                partyA: {
                    playerId: 'player-1',
                    items: [
                        { itemId: 'sword', quantity: 1 },
                        { itemId: 'potion', quantity: 5 },
                    ],
                },
                partyB: {
                    playerId: 'player-2',
                    currencies: [
                        { currency: 'gold', amount: 2000 },
                        { currency: 'diamond', amount: 20 },
                    ],
                },
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)

            // Player 1
            const p1Sword = await storage.get<ItemData>('player:player-1:inventory:sword')
            expect(p1Sword?.quantity).toBe(1) // Had 2, gave 1
            const p1Potion = await storage.get<ItemData>('player:player-1:inventory:potion')
            expect(p1Potion?.quantity).toBe(5) // Had 10, gave 5
            expect(await storage.get('player:player-1:currency:gold')).toBe(2000)
            expect(await storage.get('player:player-1:currency:diamond')).toBe(20)

            // Player 2
            const p2Sword = await storage.get<ItemData>('player:player-2:inventory:sword')
            expect(p2Sword?.quantity).toBe(1)
            const p2Potion = await storage.get<ItemData>('player:player-2:inventory:potion')
            expect(p2Potion?.quantity).toBe(5)
            expect(await storage.get('player:player-2:currency:gold')).toBe(3000) // Had 5000, gave 2000
            expect(await storage.get('player:player-2:currency:diamond')).toBe(30) // Had 50, gave 20
        })
    })

    // ========================================================================
    // 失败和补偿测试 | Failure and Compensation Tests
    // ========================================================================

    describe('failure and compensation', () => {
        it('should rollback on partial failure', async () => {
            // Player 1 has sword, Player 2 does NOT have enough gold
            await storage.set('player:player-1:inventory:sword', {
                itemId: 'sword',
                quantity: 1,
            })
            await storage.set('player:player-2:currency:gold', 500) // Not enough

            const op = new TradeOperation({
                tradeId: 'trade-fail',
                partyA: {
                    playerId: 'player-1',
                    items: [{ itemId: 'sword', quantity: 1 }],
                },
                partyB: {
                    playerId: 'player-2',
                    currencies: [{ currency: 'gold', amount: 1000 }],
                },
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(false)
            expect(result.errorCode).toBe('TRADE_FAILED')

            // Everything should be restored
            const p1Sword = await storage.get<ItemData>('player:player-1:inventory:sword')
            expect(p1Sword?.quantity).toBe(1) // Restored
            expect(await storage.get('player:player-2:inventory:sword')).toBeNull()
        })

        it('should compensate after successful execute', async () => {
            await storage.set('player:player-1:inventory:sword', {
                itemId: 'sword',
                quantity: 1,
            })
            await storage.set('player:player-2:currency:gold', 1000)

            const op = new TradeOperation({
                tradeId: 'trade-compensate',
                partyA: {
                    playerId: 'player-1',
                    items: [{ itemId: 'sword', quantity: 1 }],
                },
                partyB: {
                    playerId: 'player-2',
                    currencies: [{ currency: 'gold', amount: 1000 }],
                },
            })

            await op.execute(ctx)

            // Verify trade happened
            expect(await storage.get('player:player-1:inventory:sword')).toBeNull()
            expect(await storage.get('player:player-1:currency:gold')).toBe(1000)

            // Compensate
            await op.compensate(ctx)

            // Everything should be restored
            const p1Sword = await storage.get<ItemData>('player:player-1:inventory:sword')
            expect(p1Sword?.quantity).toBe(1)
            expect(await storage.get('player:player-1:currency:gold')).toBe(0)
            expect(await storage.get('player:player-2:inventory:sword')).toBeNull()
            expect(await storage.get('player:player-2:currency:gold')).toBe(1000)
        })
    })

    // ========================================================================
    // Provider 测试 | Provider Tests
    // ========================================================================

    describe('Provider', () => {
        it('should use providers for trade', async () => {
            const currencyProvider = new MockCurrencyProvider()
            const inventoryProvider = new MockInventoryProvider()

            currencyProvider.initBalance('player-1', 'gold', 0)
            currencyProvider.initBalance('player-2', 'gold', 1000)
            inventoryProvider.addItem('player-1', 'sword', { itemId: 'sword', quantity: 1 })

            const provider: ITradeProvider = {
                currencyProvider,
                inventoryProvider,
            }

            const op = new TradeOperation({
                tradeId: 'trade-provider',
                partyA: {
                    playerId: 'player-1',
                    items: [{ itemId: 'sword', quantity: 1 }],
                },
                partyB: {
                    playerId: 'player-2',
                    currencies: [{ currency: 'gold', amount: 1000 }],
                },
            }).setProvider(provider)

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)

            // Verify using providers
            expect(await inventoryProvider.getItem('player-1', 'sword')).toBeNull()
            expect(await currencyProvider.getBalance('player-1', 'gold')).toBe(1000)
            expect((await inventoryProvider.getItem('player-2', 'sword'))?.quantity).toBe(1)
            expect(await currencyProvider.getBalance('player-2', 'gold')).toBe(0)
        })
    })

    // ========================================================================
    // 边界情况测试 | Edge Cases
    // ========================================================================

    describe('Edge Cases', () => {
        it('should handle empty trade', async () => {
            const op = new TradeOperation({
                tradeId: 'trade-empty',
                partyA: { playerId: 'player-1' },
                partyB: { playerId: 'player-2' },
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(result.data?.completed).toBe(true)
        })

        it('should handle one-sided gift', async () => {
            await storage.set('player:player-1:inventory:gift', {
                itemId: 'gift',
                quantity: 1,
            })

            const op = new TradeOperation({
                tradeId: 'trade-gift',
                partyA: {
                    playerId: 'player-1',
                    items: [{ itemId: 'gift', quantity: 1 }],
                },
                partyB: { playerId: 'player-2' }, // Gives nothing
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(await storage.get('player:player-1:inventory:gift')).toBeNull()
            const p2Gift = await storage.get<ItemData>('player:player-2:inventory:gift')
            expect(p2Gift?.quantity).toBe(1)
        })

        it('should include reason in data', () => {
            const op = new TradeOperation({
                tradeId: 'trade-reason',
                partyA: { playerId: 'player-1' },
                partyB: { playerId: 'player-2' },
                reason: 'player_trade',
            })

            expect(op.data.reason).toBe('player_trade')
        })
    })
})
