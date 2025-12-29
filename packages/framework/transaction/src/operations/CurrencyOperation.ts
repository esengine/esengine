/**
 * @zh 货币操作
 * @en Currency operation
 */

import type { ITransactionContext, OperationResult } from '../core/types.js'
import { BaseOperation } from './BaseOperation.js'

/**
 * @zh 货币操作类型
 * @en Currency operation type
 */
export type CurrencyOperationType = 'add' | 'deduct'

/**
 * @zh 货币操作数据
 * @en Currency operation data
 */
export interface CurrencyOperationData {
    /**
     * @zh 操作类型
     * @en Operation type
     */
    type: CurrencyOperationType

    /**
     * @zh 玩家 ID
     * @en Player ID
     */
    playerId: string

    /**
     * @zh 货币类型（如 gold, diamond 等）
     * @en Currency type (e.g., gold, diamond)
     */
    currency: string

    /**
     * @zh 数量
     * @en Amount
     */
    amount: number

    /**
     * @zh 原因/来源
     * @en Reason/source
     */
    reason?: string
}

/**
 * @zh 货币操作结果
 * @en Currency operation result
 */
export interface CurrencyOperationResult {
    /**
     * @zh 操作前余额
     * @en Balance before operation
     */
    beforeBalance: number

    /**
     * @zh 操作后余额
     * @en Balance after operation
     */
    afterBalance: number
}

/**
 * @zh 货币数据提供者接口
 * @en Currency data provider interface
 */
export interface ICurrencyProvider {
    /**
     * @zh 获取货币余额
     * @en Get currency balance
     */
    getBalance(playerId: string, currency: string): Promise<number>

    /**
     * @zh 设置货币余额
     * @en Set currency balance
     */
    setBalance(playerId: string, currency: string, amount: number): Promise<void>
}

/**
 * @zh 货币操作
 * @en Currency operation
 *
 * @zh 用于处理货币的增加和扣除
 * @en Used for handling currency addition and deduction
 *
 * @example
 * ```typescript
 * // 扣除金币
 * tx.addOperation(new CurrencyOperation({
 *     type: 'deduct',
 *     playerId: 'player1',
 *     currency: 'gold',
 *     amount: 100,
 *     reason: 'purchase_item',
 * }))
 *
 * // 增加钻石
 * tx.addOperation(new CurrencyOperation({
 *     type: 'add',
 *     playerId: 'player1',
 *     currency: 'diamond',
 *     amount: 50,
 * }))
 * ```
 */
export class CurrencyOperation extends BaseOperation<CurrencyOperationData, CurrencyOperationResult> {
    readonly name = 'currency'

    private _provider: ICurrencyProvider | null = null
    private _beforeBalance: number = 0

    /**
     * @zh 设置货币数据提供者
     * @en Set currency data provider
     */
    setProvider(provider: ICurrencyProvider): this {
        this._provider = provider
        return this
    }

    async validate(ctx: ITransactionContext): Promise<boolean> {
        if (this.data.amount <= 0) {
            return false
        }

        if (this.data.type === 'deduct') {
            const balance = await this._getBalance(ctx)
            return balance >= this.data.amount
        }

        return true
    }

    async execute(ctx: ITransactionContext): Promise<OperationResult<CurrencyOperationResult>> {
        const { type, playerId, currency, amount } = this.data

        this._beforeBalance = await this._getBalance(ctx)

        let afterBalance: number

        if (type === 'add') {
            afterBalance = this._beforeBalance + amount
        } else {
            if (this._beforeBalance < amount) {
                return this.failure('Insufficient balance', 'INSUFFICIENT_BALANCE')
            }
            afterBalance = this._beforeBalance - amount
        }

        await this._setBalance(ctx, afterBalance)

        ctx.set(`currency:${playerId}:${currency}:before`, this._beforeBalance)
        ctx.set(`currency:${playerId}:${currency}:after`, afterBalance)

        return this.success({
            beforeBalance: this._beforeBalance,
            afterBalance,
        })
    }

    async compensate(ctx: ITransactionContext): Promise<void> {
        await this._setBalance(ctx, this._beforeBalance)
    }

    private async _getBalance(ctx: ITransactionContext): Promise<number> {
        const { playerId, currency } = this.data

        if (this._provider) {
            return this._provider.getBalance(playerId, currency)
        }

        if (ctx.storage) {
            const balance = await ctx.storage.get<number>(`player:${playerId}:currency:${currency}`)
            return balance ?? 0
        }

        return 0
    }

    private async _setBalance(ctx: ITransactionContext, amount: number): Promise<void> {
        const { playerId, currency } = this.data

        if (this._provider) {
            await this._provider.setBalance(playerId, currency, amount)
            return
        }

        if (ctx.storage) {
            await ctx.storage.set(`player:${playerId}:currency:${currency}`, amount)
        }
    }
}

/**
 * @zh 创建货币操作
 * @en Create currency operation
 */
export function createCurrencyOperation(data: CurrencyOperationData): CurrencyOperation {
    return new CurrencyOperation(data)
}
