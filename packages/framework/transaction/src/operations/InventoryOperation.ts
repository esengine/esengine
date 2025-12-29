/**
 * @zh 背包操作
 * @en Inventory operation
 */

import type { ITransactionContext, OperationResult } from '../core/types.js'
import { BaseOperation } from './BaseOperation.js'

/**
 * @zh 背包操作类型
 * @en Inventory operation type
 */
export type InventoryOperationType = 'add' | 'remove' | 'update'

/**
 * @zh 物品数据
 * @en Item data
 */
export interface ItemData {
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

    /**
     * @zh 物品属性
     * @en Item properties
     */
    properties?: Record<string, unknown>
}

/**
 * @zh 背包操作数据
 * @en Inventory operation data
 */
export interface InventoryOperationData {
    /**
     * @zh 操作类型
     * @en Operation type
     */
    type: InventoryOperationType

    /**
     * @zh 玩家 ID
     * @en Player ID
     */
    playerId: string

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

    /**
     * @zh 物品属性（用于更新）
     * @en Item properties (for update)
     */
    properties?: Record<string, unknown>

    /**
     * @zh 原因/来源
     * @en Reason/source
     */
    reason?: string
}

/**
 * @zh 背包操作结果
 * @en Inventory operation result
 */
export interface InventoryOperationResult {
    /**
     * @zh 操作前的物品数据
     * @en Item data before operation
     */
    beforeItem?: ItemData

    /**
     * @zh 操作后的物品数据
     * @en Item data after operation
     */
    afterItem?: ItemData
}

/**
 * @zh 背包数据提供者接口
 * @en Inventory data provider interface
 */
export interface IInventoryProvider {
    /**
     * @zh 获取物品
     * @en Get item
     */
    getItem(playerId: string, itemId: string): Promise<ItemData | null>

    /**
     * @zh 设置物品
     * @en Set item
     */
    setItem(playerId: string, itemId: string, item: ItemData | null): Promise<void>

    /**
     * @zh 检查背包容量
     * @en Check inventory capacity
     */
    hasCapacity?(playerId: string, count: number): Promise<boolean>
}

/**
 * @zh 背包操作
 * @en Inventory operation
 *
 * @zh 用于处理物品的添加、移除和更新
 * @en Used for handling item addition, removal, and update
 *
 * @example
 * ```typescript
 * // 添加物品
 * tx.addOperation(new InventoryOperation({
 *     type: 'add',
 *     playerId: 'player1',
 *     itemId: 'sword_001',
 *     quantity: 1,
 * }))
 *
 * // 移除物品
 * tx.addOperation(new InventoryOperation({
 *     type: 'remove',
 *     playerId: 'player1',
 *     itemId: 'potion_hp',
 *     quantity: 5,
 * }))
 * ```
 */
export class InventoryOperation extends BaseOperation<InventoryOperationData, InventoryOperationResult> {
    readonly name = 'inventory'

    private _provider: IInventoryProvider | null = null
    private _beforeItem: ItemData | null = null

    /**
     * @zh 设置背包数据提供者
     * @en Set inventory data provider
     */
    setProvider(provider: IInventoryProvider): this {
        this._provider = provider
        return this
    }

    async validate(ctx: ITransactionContext): Promise<boolean> {
        const { type, quantity } = this.data

        if (quantity <= 0) {
            return false
        }

        if (type === 'remove') {
            const item = await this._getItem(ctx)
            return item !== null && item.quantity >= quantity
        }

        if (type === 'add' && this._provider?.hasCapacity) {
            return this._provider.hasCapacity(this.data.playerId, 1)
        }

        return true
    }

    async execute(ctx: ITransactionContext): Promise<OperationResult<InventoryOperationResult>> {
        const { type, playerId, itemId, quantity, properties } = this.data

        this._beforeItem = await this._getItem(ctx)

        let afterItem: ItemData | null = null

        switch (type) {
            case 'add': {
                if (this._beforeItem) {
                    afterItem = {
                        ...this._beforeItem,
                        quantity: this._beforeItem.quantity + quantity,
                    }
                } else {
                    afterItem = {
                        itemId,
                        quantity,
                        properties,
                    }
                }
                break
            }

            case 'remove': {
                if (!this._beforeItem || this._beforeItem.quantity < quantity) {
                    return this.failure('Insufficient item quantity', 'INSUFFICIENT_ITEM')
                }

                const newQuantity = this._beforeItem.quantity - quantity
                if (newQuantity > 0) {
                    afterItem = {
                        ...this._beforeItem,
                        quantity: newQuantity,
                    }
                } else {
                    afterItem = null
                }
                break
            }

            case 'update': {
                if (!this._beforeItem) {
                    return this.failure('Item not found', 'ITEM_NOT_FOUND')
                }

                afterItem = {
                    ...this._beforeItem,
                    quantity: quantity > 0 ? quantity : this._beforeItem.quantity,
                    properties: properties ?? this._beforeItem.properties,
                }
                break
            }
        }

        await this._setItem(ctx, afterItem)

        ctx.set(`inventory:${playerId}:${itemId}:before`, this._beforeItem)
        ctx.set(`inventory:${playerId}:${itemId}:after`, afterItem)

        return this.success({
            beforeItem: this._beforeItem ?? undefined,
            afterItem: afterItem ?? undefined,
        })
    }

    async compensate(ctx: ITransactionContext): Promise<void> {
        await this._setItem(ctx, this._beforeItem)
    }

    private async _getItem(ctx: ITransactionContext): Promise<ItemData | null> {
        const { playerId, itemId } = this.data

        if (this._provider) {
            return this._provider.getItem(playerId, itemId)
        }

        if (ctx.storage) {
            return ctx.storage.get<ItemData>(`player:${playerId}:inventory:${itemId}`)
        }

        return null
    }

    private async _setItem(ctx: ITransactionContext, item: ItemData | null): Promise<void> {
        const { playerId, itemId } = this.data

        if (this._provider) {
            await this._provider.setItem(playerId, itemId, item)
            return
        }

        if (ctx.storage) {
            if (item) {
                await ctx.storage.set(`player:${playerId}:inventory:${itemId}`, item)
            } else {
                await ctx.storage.delete(`player:${playerId}:inventory:${itemId}`)
            }
        }
    }
}

/**
 * @zh 创建背包操作
 * @en Create inventory operation
 */
export function createInventoryOperation(data: InventoryOperationData): InventoryOperation {
    return new InventoryOperation(data)
}
