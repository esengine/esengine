/**
 * @zh InventoryOperation 单元测试
 * @en InventoryOperation unit tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
    InventoryOperation,
    createInventoryOperation,
    type IInventoryProvider,
    type ItemData,
} from '../../src/operations/InventoryOperation.js'
import { TransactionContext } from '../../src/core/TransactionContext.js'
import { MemoryStorage } from '../../src/storage/MemoryStorage.js'
import type { ITransactionContext } from '../../src/core/types.js'

// ============================================================================
// Mock Provider | 模拟数据提供者
// ============================================================================

class MockInventoryProvider implements IInventoryProvider {
    private _inventory: Map<string, Map<string, ItemData>> = new Map()
    private _capacity: Map<string, number> = new Map()

    addItem(playerId: string, itemId: string, item: ItemData): void {
        if (!this._inventory.has(playerId)) {
            this._inventory.set(playerId, new Map())
        }
        this._inventory.get(playerId)!.set(itemId, item)
    }

    setCapacity(playerId: string, capacity: number): void {
        this._capacity.set(playerId, capacity)
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

    async hasCapacity(playerId: string, count: number): Promise<boolean> {
        const capacity = this._capacity.get(playerId)
        if (capacity === undefined) return true
        const currentCount = this._inventory.get(playerId)?.size ?? 0
        return currentCount + count <= capacity
    }
}

// ============================================================================
// Test Suite | 测试套件
// ============================================================================

describe('InventoryOperation', () => {
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
            const op = new InventoryOperation({
                type: 'add',
                playerId: 'player-1',
                itemId: 'sword-001',
                quantity: 1,
            })

            expect(op.name).toBe('inventory')
            expect(op.data.type).toBe('add')
            expect(op.data.playerId).toBe('player-1')
            expect(op.data.itemId).toBe('sword-001')
            expect(op.data.quantity).toBe(1)
        })

        it('should use createInventoryOperation factory', () => {
            const op = createInventoryOperation({
                type: 'remove',
                playerId: 'player-2',
                itemId: 'potion-hp',
                quantity: 5,
            })

            expect(op).toBeInstanceOf(InventoryOperation)
            expect(op.data.type).toBe('remove')
        })
    })

    // ========================================================================
    // 验证测试 | Validation Tests
    // ========================================================================

    describe('validate()', () => {
        it('should fail validation with zero quantity', async () => {
            const op = new InventoryOperation({
                type: 'add',
                playerId: 'player-1',
                itemId: 'sword',
                quantity: 0,
            })

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(false)
        })

        it('should fail validation with negative quantity', async () => {
            const op = new InventoryOperation({
                type: 'add',
                playerId: 'player-1',
                itemId: 'sword',
                quantity: -1,
            })

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(false)
        })

        it('should pass validation for add with positive quantity', async () => {
            const op = new InventoryOperation({
                type: 'add',
                playerId: 'player-1',
                itemId: 'sword',
                quantity: 1,
            })

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(true)
        })

        it('should fail validation for remove with insufficient quantity', async () => {
            await storage.set('player:player-1:inventory:sword', {
                itemId: 'sword',
                quantity: 2,
            })

            const op = new InventoryOperation({
                type: 'remove',
                playerId: 'player-1',
                itemId: 'sword',
                quantity: 5,
            })

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(false)
        })

        it('should fail validation for remove with non-existent item', async () => {
            const op = new InventoryOperation({
                type: 'remove',
                playerId: 'player-1',
                itemId: 'nonexistent',
                quantity: 1,
            })

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(false)
        })

        it('should pass validation for remove with sufficient quantity', async () => {
            await storage.set('player:player-1:inventory:sword', {
                itemId: 'sword',
                quantity: 10,
            })

            const op = new InventoryOperation({
                type: 'remove',
                playerId: 'player-1',
                itemId: 'sword',
                quantity: 5,
            })

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(true)
        })

        it('should check capacity with provider', async () => {
            const provider = new MockInventoryProvider()
            provider.setCapacity('player-1', 1)
            provider.addItem('player-1', 'existing', { itemId: 'existing', quantity: 1 })

            const op = new InventoryOperation({
                type: 'add',
                playerId: 'player-1',
                itemId: 'new-item',
                quantity: 1,
            }).setProvider(provider)

            const isValid = await op.validate(ctx)
            expect(isValid).toBe(false)
        })
    })

    // ========================================================================
    // 执行测试 - 添加物品 | Execute Tests - Add Item
    // ========================================================================

    describe('execute() - add', () => {
        it('should add new item to empty inventory', async () => {
            const op = new InventoryOperation({
                type: 'add',
                playerId: 'player-1',
                itemId: 'sword',
                quantity: 1,
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(result.data?.beforeItem).toBeUndefined()
            expect(result.data?.afterItem).toEqual({
                itemId: 'sword',
                quantity: 1,
                properties: undefined,
            })

            const item = await storage.get<ItemData>('player:player-1:inventory:sword')
            expect(item?.quantity).toBe(1)
        })

        it('should stack items when adding to existing', async () => {
            await storage.set('player:player-1:inventory:potion', {
                itemId: 'potion',
                quantity: 5,
            })

            const op = new InventoryOperation({
                type: 'add',
                playerId: 'player-1',
                itemId: 'potion',
                quantity: 3,
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(result.data?.beforeItem?.quantity).toBe(5)
            expect(result.data?.afterItem?.quantity).toBe(8)
        })

        it('should add item with properties', async () => {
            const op = new InventoryOperation({
                type: 'add',
                playerId: 'player-1',
                itemId: 'enchanted-sword',
                quantity: 1,
                properties: { damage: 100, enchant: 'fire' },
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(result.data?.afterItem?.properties).toEqual({
                damage: 100,
                enchant: 'fire',
            })
        })

        it('should store context data', async () => {
            const op = new InventoryOperation({
                type: 'add',
                playerId: 'player-1',
                itemId: 'sword',
                quantity: 1,
            })

            await op.execute(ctx)

            expect(ctx.get('inventory:player-1:sword:before')).toBeNull()
            expect(ctx.get('inventory:player-1:sword:after')).toEqual({
                itemId: 'sword',
                quantity: 1,
                properties: undefined,
            })
        })
    })

    // ========================================================================
    // 执行测试 - 移除物品 | Execute Tests - Remove Item
    // ========================================================================

    describe('execute() - remove', () => {
        it('should remove partial quantity', async () => {
            await storage.set('player:player-1:inventory:potion', {
                itemId: 'potion',
                quantity: 10,
            })

            const op = new InventoryOperation({
                type: 'remove',
                playerId: 'player-1',
                itemId: 'potion',
                quantity: 3,
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(result.data?.beforeItem?.quantity).toBe(10)
            expect(result.data?.afterItem?.quantity).toBe(7)

            const item = await storage.get<ItemData>('player:player-1:inventory:potion')
            expect(item?.quantity).toBe(7)
        })

        it('should delete item when removing all quantity', async () => {
            await storage.set('player:player-1:inventory:sword', {
                itemId: 'sword',
                quantity: 1,
            })

            const op = new InventoryOperation({
                type: 'remove',
                playerId: 'player-1',
                itemId: 'sword',
                quantity: 1,
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(result.data?.afterItem).toBeUndefined()

            const item = await storage.get('player:player-1:inventory:sword')
            expect(item).toBeNull()
        })

        it('should fail when item not found', async () => {
            const op = new InventoryOperation({
                type: 'remove',
                playerId: 'player-1',
                itemId: 'nonexistent',
                quantity: 1,
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(false)
            expect(result.error).toBe('Insufficient item quantity')
            expect(result.errorCode).toBe('INSUFFICIENT_ITEM')
        })

        it('should fail when quantity insufficient', async () => {
            await storage.set('player:player-1:inventory:potion', {
                itemId: 'potion',
                quantity: 2,
            })

            const op = new InventoryOperation({
                type: 'remove',
                playerId: 'player-1',
                itemId: 'potion',
                quantity: 5,
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(false)
            expect(result.errorCode).toBe('INSUFFICIENT_ITEM')
        })
    })

    // ========================================================================
    // 执行测试 - 更新物品 | Execute Tests - Update Item
    // ========================================================================

    describe('execute() - update', () => {
        it('should update item properties', async () => {
            await storage.set('player:player-1:inventory:sword', {
                itemId: 'sword',
                quantity: 1,
                properties: { damage: 10 },
            })

            const op = new InventoryOperation({
                type: 'update',
                playerId: 'player-1',
                itemId: 'sword',
                quantity: 0, // keep existing
                properties: { damage: 20, enchant: 'ice' },
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(result.data?.afterItem?.properties).toEqual({
                damage: 20,
                enchant: 'ice',
            })
            expect(result.data?.afterItem?.quantity).toBe(1)
        })

        it('should update item quantity', async () => {
            await storage.set('player:player-1:inventory:potion', {
                itemId: 'potion',
                quantity: 5,
            })

            const op = new InventoryOperation({
                type: 'update',
                playerId: 'player-1',
                itemId: 'potion',
                quantity: 10,
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(result.data?.afterItem?.quantity).toBe(10)
        })

        it('should fail when updating non-existent item', async () => {
            const op = new InventoryOperation({
                type: 'update',
                playerId: 'player-1',
                itemId: 'nonexistent',
                quantity: 1,
            })

            const result = await op.execute(ctx)

            expect(result.success).toBe(false)
            expect(result.error).toBe('Item not found')
            expect(result.errorCode).toBe('ITEM_NOT_FOUND')
        })
    })

    // ========================================================================
    // 补偿测试 | Compensate Tests
    // ========================================================================

    describe('compensate()', () => {
        it('should restore state after add', async () => {
            const op = new InventoryOperation({
                type: 'add',
                playerId: 'player-1',
                itemId: 'sword',
                quantity: 1,
            })

            await op.execute(ctx)
            expect(await storage.get('player:player-1:inventory:sword')).not.toBeNull()

            await op.compensate(ctx)
            expect(await storage.get('player:player-1:inventory:sword')).toBeNull()
        })

        it('should restore state after remove', async () => {
            await storage.set('player:player-1:inventory:potion', {
                itemId: 'potion',
                quantity: 5,
            })

            const op = new InventoryOperation({
                type: 'remove',
                playerId: 'player-1',
                itemId: 'potion',
                quantity: 3,
            })

            await op.execute(ctx)
            const afterRemove = await storage.get<ItemData>('player:player-1:inventory:potion')
            expect(afterRemove?.quantity).toBe(2)

            await op.compensate(ctx)
            const afterCompensate = await storage.get<ItemData>('player:player-1:inventory:potion')
            expect(afterCompensate?.quantity).toBe(5)
        })

        it('should restore deleted item after remove all', async () => {
            await storage.set('player:player-1:inventory:sword', {
                itemId: 'sword',
                quantity: 1,
            })

            const op = new InventoryOperation({
                type: 'remove',
                playerId: 'player-1',
                itemId: 'sword',
                quantity: 1,
            })

            await op.execute(ctx)
            expect(await storage.get('player:player-1:inventory:sword')).toBeNull()

            await op.compensate(ctx)
            const restored = await storage.get<ItemData>('player:player-1:inventory:sword')
            expect(restored?.quantity).toBe(1)
        })

        it('should restore state after update', async () => {
            await storage.set('player:player-1:inventory:sword', {
                itemId: 'sword',
                quantity: 1,
                properties: { damage: 10 },
            })

            const op = new InventoryOperation({
                type: 'update',
                playerId: 'player-1',
                itemId: 'sword',
                quantity: 0,
                properties: { damage: 50 },
            })

            await op.execute(ctx)
            await op.compensate(ctx)

            const restored = await storage.get<ItemData>('player:player-1:inventory:sword')
            expect(restored?.properties).toEqual({ damage: 10 })
        })
    })

    // ========================================================================
    // Provider 测试 | Provider Tests
    // ========================================================================

    describe('Provider', () => {
        it('should use provider for operations', async () => {
            const provider = new MockInventoryProvider()
            provider.addItem('player-1', 'sword', { itemId: 'sword', quantity: 1 })

            const op = new InventoryOperation({
                type: 'add',
                playerId: 'player-1',
                itemId: 'sword',
                quantity: 2,
            }).setProvider(provider)

            const result = await op.execute(ctx)

            expect(result.success).toBe(true)
            expect(result.data?.afterItem?.quantity).toBe(3)

            const item = await provider.getItem('player-1', 'sword')
            expect(item?.quantity).toBe(3)
        })

        it('should compensate using provider', async () => {
            const provider = new MockInventoryProvider()
            provider.addItem('player-1', 'potion', { itemId: 'potion', quantity: 10 })

            const op = new InventoryOperation({
                type: 'remove',
                playerId: 'player-1',
                itemId: 'potion',
                quantity: 3,
            }).setProvider(provider)

            await op.execute(ctx)
            expect((await provider.getItem('player-1', 'potion'))?.quantity).toBe(7)

            await op.compensate(ctx)
            expect((await provider.getItem('player-1', 'potion'))?.quantity).toBe(10)
        })
    })

    // ========================================================================
    // 边界情况测试 | Edge Cases
    // ========================================================================

    describe('Edge Cases', () => {
        it('should handle context without storage', async () => {
            const noStorageCtx = new TransactionContext()

            const op = new InventoryOperation({
                type: 'add',
                playerId: 'player-1',
                itemId: 'sword',
                quantity: 1,
            })

            const result = await op.execute(noStorageCtx)
            expect(result.success).toBe(true)
        })

        it('should include reason in data', () => {
            const op = new InventoryOperation({
                type: 'add',
                playerId: 'player-1',
                itemId: 'reward-sword',
                quantity: 1,
                reason: 'quest_reward',
            })

            expect(op.data.reason).toBe('quest_reward')
        })

        it('should preserve item properties when stacking', async () => {
            await storage.set('player:player-1:inventory:potion', {
                itemId: 'potion',
                quantity: 5,
                properties: { quality: 'rare' },
            })

            const op = new InventoryOperation({
                type: 'add',
                playerId: 'player-1',
                itemId: 'potion',
                quantity: 3,
            })

            const result = await op.execute(ctx)

            expect(result.data?.afterItem?.properties).toEqual({ quality: 'rare' })
            expect(result.data?.afterItem?.quantity).toBe(8)
        })
    })
})
