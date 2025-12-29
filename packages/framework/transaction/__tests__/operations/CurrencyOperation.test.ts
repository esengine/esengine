/**
 * @zh CurrencyOperation 单元测试
 * @en CurrencyOperation unit tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { CurrencyOperation, createCurrencyOperation, type ICurrencyProvider } from '../../src/operations/CurrencyOperation.js'
import { TransactionContext } from '../../src/core/TransactionContext.js'
import { MemoryStorage } from '../../src/storage/MemoryStorage.js'
import type { ITransactionContext } from '../../src/core/types.js'

// ============================================================================
// Mock Provider | 模拟数据提供者
// ============================================================================

class MockCurrencyProvider implements ICurrencyProvider {
    private _balances: Map<string, Map<string, number>> = new Map()

    setInitialBalance(playerId: string, currency: string, amount: number): void {
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

// ============================================================================
// Test Suite | 测试套件
// ============================================================================

describe('CurrencyOperation', () => {
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
            const op = new CurrencyOperation({
                type: 'add',
                playerId: 'player-1',
                currency: 'gold',
                amount: 100,
            })

            expect(op.name).toBe('currency')
            expect(op.data.type).toBe('add')
            expect(op.data.playerId).toBe('player-1')
            expect(op.data.currency).toBe('gold')
            expect(op.data.amount).toBe(100)
        })

        it('should use createCurrencyOperation factory', () => {
            const op = createCurrencyOperation({
                type: 'deduct',
                playerId: 'player-2',
                currency: 'diamond',
                amount: 50,
            })

            expect(op).toBeInstanceOf(CurrencyOperation)
            expect(op.data.type).toBe('deduct')
        })
    })

    // ========================================================================
    // 验证测试 | Validation Tests
    // ========================================================================

    describe('validate()', () => {
        it('should fail validation with zero amount', async () => {
            const op = new CurrencyOperation({
                type: 'add',
                playerId: 'player-1',
                currency: 'gold',
                amount: 0,
            })

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(false)
        })

        it('should fail validation with negative amount', async () => {
            const op = new CurrencyOperation({
                type: 'add',
                playerId: 'player-1',
                currency: 'gold',
                amount: -10,
            })

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(false)
        })

        it('should pass validation for add with positive amount', async () => {
            const op = new CurrencyOperation({
                type: 'add',
                playerId: 'player-1',
                currency: 'gold',
                amount: 100,
            })

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(true)
        })

        it('should fail validation for deduct with insufficient balance', async () => {
            await storage.set('player:player-1:currency:gold', 50)

            const op = new CurrencyOperation({
                type: 'deduct',
                playerId: 'player-1',
                currency: 'gold',
                amount: 100,
            })

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(false)
        })

        it('should pass validation for deduct with sufficient balance', async () => {
            await storage.set('player:player-1:currency:gold', 150)

            const op = new CurrencyOperation({
                type: 'deduct',
                playerId: 'player-1',
                currency: 'gold',
                amount: 100,
            })

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(true)
        })

        it('should use provider for validation', async () => {
            const provider = new MockCurrencyProvider()
            provider.setInitialBalance('player-1', 'gold', 200)

            const op = new CurrencyOperation({
                type: 'deduct',
                playerId: 'player-1',
                currency: 'gold',
                amount: 150,
            }).setProvider(provider)

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(true)
        })
    })

    // ========================================================================
    // 执行测试 - 增加货币 | Execute Tests - Add Currency
    // ========================================================================

    describe('execute() - add', () => {
        it('should add currency to empty balance', async () => {
            const op = new CurrencyOperation({
                type: 'add',
                playerId: 'player-1',
                currency: 'gold',
                amount: 100,
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(result.data?.beforeBalance).toBe(0)
            expect(result.data?.afterBalance).toBe(100)

            const balance = await storage.get<number>('player:player-1:currency:gold')
            expect(balance).toBe(100)
        })

        it('should add currency to existing balance', async () => {
            await storage.set('player:player-1:currency:gold', 50)

            const op = new CurrencyOperation({
                type: 'add',
                playerId: 'player-1',
                currency: 'gold',
                amount: 100,
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(result.data?.beforeBalance).toBe(50)
            expect(result.data?.afterBalance).toBe(150)
        })

        it('should store context data for verification', async () => {
            const op = new CurrencyOperation({
                type: 'add',
                playerId: 'player-1',
                currency: 'gold',
                amount: 100,
            })

            await op.execute(ctx)

            expect(ctx.get('currency:player-1:gold:before')).toBe(0)
            expect(ctx.get('currency:player-1:gold:after')).toBe(100)
        })
    })

    // ========================================================================
    // 执行测试 - 扣除货币 | Execute Tests - Deduct Currency
    // ========================================================================

    describe('execute() - deduct', () => {
        it('should deduct currency from balance', async () => {
            await storage.set('player:player-1:currency:gold', 200)

            const op = new CurrencyOperation({
                type: 'deduct',
                playerId: 'player-1',
                currency: 'gold',
                amount: 75,
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(result.data?.beforeBalance).toBe(200)
            expect(result.data?.afterBalance).toBe(125)

            const balance = await storage.get<number>('player:player-1:currency:gold')
            expect(balance).toBe(125)
        })

        it('should fail deduct with insufficient balance', async () => {
            await storage.set('player:player-1:currency:gold', 50)

            const op = new CurrencyOperation({
                type: 'deduct',
                playerId: 'player-1',
                currency: 'gold',
                amount: 100,
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(false)
            expect(result.error).toBe('Insufficient balance')
            expect(result.errorCode).toBe('INSUFFICIENT_BALANCE')
        })

        it('should deduct exact balance', async () => {
            await storage.set('player:player-1:currency:gold', 100)

            const op = new CurrencyOperation({
                type: 'deduct',
                playerId: 'player-1',
                currency: 'gold',
                amount: 100,
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(result.data?.afterBalance).toBe(0)
        })
    })

    // ========================================================================
    // 补偿测试 | Compensate Tests
    // ========================================================================

    describe('compensate()', () => {
        it('should restore balance after add', async () => {
            const op = new CurrencyOperation({
                type: 'add',
                playerId: 'player-1',
                currency: 'gold',
                amount: 100,
            })

            await op.execute(ctx)
            expect(await storage.get('player:player-1:currency:gold')).toBe(100)

            await op.compensate(ctx)
            expect(await storage.get('player:player-1:currency:gold')).toBe(0)
        })

        it('should restore balance after deduct', async () => {
            await storage.set('player:player-1:currency:gold', 200)

            const op = new CurrencyOperation({
                type: 'deduct',
                playerId: 'player-1',
                currency: 'gold',
                amount: 75,
            })

            await op.execute(ctx)
            expect(await storage.get('player:player-1:currency:gold')).toBe(125)

            await op.compensate(ctx)
            expect(await storage.get('player:player-1:currency:gold')).toBe(200)
        })
    })

    // ========================================================================
    // Provider 测试 | Provider Tests
    // ========================================================================

    describe('Provider', () => {
        it('should use provider for operations', async () => {
            const provider = new MockCurrencyProvider()
            provider.setInitialBalance('player-1', 'gold', 1000)

            const op = new CurrencyOperation({
                type: 'deduct',
                playerId: 'player-1',
                currency: 'gold',
                amount: 300,
            }).setProvider(provider)

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(result.data?.beforeBalance).toBe(1000)
            expect(result.data?.afterBalance).toBe(700)

            const newBalance = await provider.getBalance('player-1', 'gold')
            expect(newBalance).toBe(700)
        })

        it('should compensate using provider', async () => {
            const provider = new MockCurrencyProvider()
            provider.setInitialBalance('player-1', 'gold', 500)

            const op = new CurrencyOperation({
                type: 'add',
                playerId: 'player-1',
                currency: 'gold',
                amount: 200,
            }).setProvider(provider)

            await op.execute(ctx)
            expect(await provider.getBalance('player-1', 'gold')).toBe(700)

            await op.compensate(ctx)
            expect(await provider.getBalance('player-1', 'gold')).toBe(500)
        })

        it('should support method chaining with setProvider', () => {
            const provider = new MockCurrencyProvider()
            const op = new CurrencyOperation({
                type: 'add',
                playerId: 'player-1',
                currency: 'gold',
                amount: 100,
            })

            const result = op.setProvider(provider)
            expect(result).toBe(op)
        })
    })

    // ========================================================================
    // 多货币类型测试 | Multiple Currency Types Tests
    // ========================================================================

    describe('Multiple Currency Types', () => {
        it('should handle different currency types independently', async () => {
            await storage.set('player:player-1:currency:gold', 1000)
            await storage.set('player:player-1:currency:diamond', 50)

            const goldOp = new CurrencyOperation({
                type: 'deduct',
                playerId: 'player-1',
                currency: 'gold',
                amount: 500,
            })

            const diamondOp = new CurrencyOperation({
                type: 'add',
                playerId: 'player-1',
                currency: 'diamond',
                amount: 10,
            })

            await goldOp.execute(ctx)
            await diamondOp.execute(ctx)

            expect(await storage.get('player:player-1:currency:gold')).toBe(500)
            expect(await storage.get('player:player-1:currency:diamond')).toBe(60)
        })

        it('should handle multiple players independently', async () => {
            await storage.set('player:player-1:currency:gold', 1000)
            await storage.set('player:player-2:currency:gold', 500)

            const op1 = new CurrencyOperation({
                type: 'deduct',
                playerId: 'player-1',
                currency: 'gold',
                amount: 300,
            })

            const op2 = new CurrencyOperation({
                type: 'add',
                playerId: 'player-2',
                currency: 'gold',
                amount: 300,
            })

            await op1.execute(ctx)
            await op2.execute(ctx)

            expect(await storage.get('player:player-1:currency:gold')).toBe(700)
            expect(await storage.get('player:player-2:currency:gold')).toBe(800)
        })
    })

    // ========================================================================
    // 边界情况测试 | Edge Cases
    // ========================================================================

    describe('Edge Cases', () => {
        it('should handle zero balance for new player', async () => {
            const op = new CurrencyOperation({
                type: 'add',
                playerId: 'new-player',
                currency: 'gold',
                amount: 100,
            })

            const result = await op.execute(ctx)
            expect(result.data?.beforeBalance).toBe(0)
        })

        it('should handle context without storage', async () => {
            const noStorageCtx = new TransactionContext()

            const op = new CurrencyOperation({
                type: 'add',
                playerId: 'player-1',
                currency: 'gold',
                amount: 100,
            })

            const result = await op.execute(noStorageCtx)
            expect(result.success).toBe(true)
            expect(result.data?.beforeBalance).toBe(0)
            expect(result.data?.afterBalance).toBe(100)
        })

        it('should include reason in data', () => {
            const op = new CurrencyOperation({
                type: 'deduct',
                playerId: 'player-1',
                currency: 'gold',
                amount: 100,
                reason: 'purchase_item',
            })

            expect(op.data.reason).toBe('purchase_item')
        })
    })
})
