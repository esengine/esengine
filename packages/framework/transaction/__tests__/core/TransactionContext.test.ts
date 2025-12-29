/**
 * @zh TransactionContext 单元测试
 * @en TransactionContext unit tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TransactionContext, createTransactionContext } from '../../src/core/TransactionContext.js'
import { MemoryStorage } from '../../src/storage/MemoryStorage.js'
import type { ITransactionOperation, ITransactionContext, OperationResult } from '../../src/core/types.js'

// ============================================================================
// Mock Operations | 模拟操作
// ============================================================================

class SuccessOperation implements ITransactionOperation<{ value: number }, { doubled: number }> {
    readonly name: string
    readonly data: { value: number }

    private _compensated = false

    constructor(name: string, value: number) {
        this.name = name
        this.data = { value }
    }

    async validate(_ctx: ITransactionContext): Promise<boolean> {
        return this.data.value > 0
    }

    async execute(_ctx: ITransactionContext): Promise<OperationResult<{ doubled: number }>> {
        return { success: true, data: { doubled: this.data.value * 2 } }
    }

    async compensate(_ctx: ITransactionContext): Promise<void> {
        this._compensated = true
    }

    get compensated(): boolean {
        return this._compensated
    }
}

class FailOperation implements ITransactionOperation {
    readonly name = 'fail'
    readonly data = {}

    async validate(_ctx: ITransactionContext): Promise<boolean> {
        return true
    }

    async execute(_ctx: ITransactionContext): Promise<OperationResult> {
        return { success: false, error: 'Intentional failure', errorCode: 'FAIL' }
    }

    async compensate(_ctx: ITransactionContext): Promise<void> {
        // No-op
    }
}

class ValidationFailOperation implements ITransactionOperation {
    readonly name = 'validation-fail'
    readonly data = {}

    async validate(_ctx: ITransactionContext): Promise<boolean> {
        return false
    }

    async execute(_ctx: ITransactionContext): Promise<OperationResult> {
        return { success: true }
    }

    async compensate(_ctx: ITransactionContext): Promise<void> {
        // No-op
    }
}

class SlowOperation implements ITransactionOperation {
    readonly name = 'slow'
    readonly data: { delay: number }

    constructor(delay: number) {
        this.data = { delay }
    }

    async validate(_ctx: ITransactionContext): Promise<boolean> {
        return true
    }

    async execute(_ctx: ITransactionContext): Promise<OperationResult> {
        await new Promise((resolve) => setTimeout(resolve, this.data.delay))
        return { success: true }
    }

    async compensate(_ctx: ITransactionContext): Promise<void> {
        // No-op
    }
}

class ContextDataOperation implements ITransactionOperation {
    readonly name = 'context-data'
    readonly data = {}

    async validate(_ctx: ITransactionContext): Promise<boolean> {
        return true
    }

    async execute(ctx: ITransactionContext): Promise<OperationResult> {
        ctx.set('testKey', 'testValue')
        ctx.set('numberKey', 42)
        return { success: true, data: { stored: true } }
    }

    async compensate(_ctx: ITransactionContext): Promise<void> {
        // No-op
    }
}

// ============================================================================
// Test Suite | 测试套件
// ============================================================================

describe('TransactionContext', () => {
    let storage: MemoryStorage

    beforeEach(() => {
        storage = new MemoryStorage()
    })

    // ========================================================================
    // 构造器测试 | Constructor Tests
    // ========================================================================

    describe('Constructor', () => {
        it('should create with default options', () => {
            const ctx = new TransactionContext()
            expect(ctx.id).toMatch(/^tx_/)
            expect(ctx.state).toBe('pending')
            expect(ctx.timeout).toBe(30000)
            expect(ctx.operations).toHaveLength(0)
            expect(ctx.storage).toBeNull()
        })

        it('should create with custom options', () => {
            const ctx = new TransactionContext({
                timeout: 10000,
                storage,
                metadata: { userId: 'user-1' },
                distributed: true,
            })

            expect(ctx.timeout).toBe(10000)
            expect(ctx.storage).toBe(storage)
            expect(ctx.metadata.userId).toBe('user-1')
        })

        it('should use createTransactionContext factory', () => {
            const ctx = createTransactionContext({ timeout: 5000 })
            expect(ctx).toBeDefined()
            expect(ctx.timeout).toBe(5000)
        })
    })

    // ========================================================================
    // 添加操作测试 | Add Operation Tests
    // ========================================================================

    describe('addOperation()', () => {
        it('should add operations', () => {
            const ctx = new TransactionContext()
            const op1 = new SuccessOperation('op1', 10)
            const op2 = new SuccessOperation('op2', 20)

            ctx.addOperation(op1).addOperation(op2)

            expect(ctx.operations).toHaveLength(2)
            expect(ctx.operations[0]).toBe(op1)
            expect(ctx.operations[1]).toBe(op2)
        })

        it('should support method chaining', () => {
            const ctx = new TransactionContext()
            const result = ctx
                .addOperation(new SuccessOperation('op1', 10))
                .addOperation(new SuccessOperation('op2', 20))

            expect(result).toBe(ctx)
        })

        it('should throw when adding to non-pending transaction', async () => {
            const ctx = new TransactionContext()
            ctx.addOperation(new SuccessOperation('op1', 10))
            await ctx.execute()

            expect(() => ctx.addOperation(new SuccessOperation('op2', 20))).toThrow(
                'Cannot add operation to transaction in state'
            )
        })
    })

    // ========================================================================
    // 执行测试 | Execute Tests
    // ========================================================================

    describe('execute()', () => {
        it('should execute all operations successfully', async () => {
            const ctx = new TransactionContext()
            ctx.addOperation(new SuccessOperation('op1', 10))
            ctx.addOperation(new SuccessOperation('op2', 20))

            const result = await ctx.execute()

            expect(result.success).toBe(true)
            expect(result.transactionId).toBe(ctx.id)
            expect(result.results).toHaveLength(2)
            expect(result.duration).toBeGreaterThanOrEqual(0)
            expect(ctx.state).toBe('committed')
        })

        it('should return combined result data', async () => {
            const ctx = new TransactionContext()
            ctx.addOperation(new SuccessOperation('op1', 10))

            const result = await ctx.execute<{ doubled: number }>()

            expect(result.success).toBe(true)
            expect(result.data?.doubled).toBe(20)
        })

        it('should fail if already executed', async () => {
            const ctx = new TransactionContext()
            ctx.addOperation(new SuccessOperation('op1', 10))

            await ctx.execute()
            const result = await ctx.execute()

            expect(result.success).toBe(false)
            expect(result.error).toContain('already in state')
        })

        it('should fail on validation error', async () => {
            const ctx = new TransactionContext()
            ctx.addOperation(new ValidationFailOperation())

            const result = await ctx.execute()

            expect(result.success).toBe(false)
            expect(result.error).toContain('Validation failed')
            expect(ctx.state).toBe('rolledback')
        })

        it('should fail and rollback on operation failure', async () => {
            const ctx = new TransactionContext()
            const op1 = new SuccessOperation('op1', 10)
            const op2 = new FailOperation()

            ctx.addOperation(op1).addOperation(op2)

            const result = await ctx.execute()

            expect(result.success).toBe(false)
            expect(result.error).toBe('Intentional failure')
            expect(ctx.state).toBe('rolledback')
            expect(op1.compensated).toBe(true)
        })

        it('should timeout on slow operations', async () => {
            const ctx = new TransactionContext({ timeout: 50 })
            // Add two operations - timeout is checked between operations
            ctx.addOperation(new SlowOperation(100))
            ctx.addOperation(new SuccessOperation('second', 1))

            const result = await ctx.execute()

            expect(result.success).toBe(false)
            expect(result.error).toContain('timed out')
            expect(ctx.state).toBe('rolledback')
        })

        it('should save transaction log with storage', async () => {
            const ctx = new TransactionContext({ storage })
            ctx.addOperation(new SuccessOperation('op1', 10))

            await ctx.execute()

            const log = await storage.getTransaction(ctx.id)
            expect(log).not.toBeNull()
            expect(log?.state).toBe('committed')
            expect(log?.operations).toHaveLength(1)
            expect(log?.operations[0].state).toBe('executed')
        })

        it('should update operation states on failure', async () => {
            const ctx = new TransactionContext({ storage })
            ctx.addOperation(new SuccessOperation('op1', 10))
            ctx.addOperation(new FailOperation())

            await ctx.execute()

            const log = await storage.getTransaction(ctx.id)
            expect(log?.state).toBe('rolledback')
            expect(log?.operations[0].state).toBe('compensated')
        })
    })

    // ========================================================================
    // 回滚测试 | Rollback Tests
    // ========================================================================

    describe('rollback()', () => {
        it('should rollback pending transaction', async () => {
            const ctx = new TransactionContext()
            const op1 = new SuccessOperation('op1', 10)
            ctx.addOperation(op1)

            await ctx.rollback()

            expect(ctx.state).toBe('rolledback')
        })

        it('should not rollback already committed transaction', async () => {
            const ctx = new TransactionContext()
            ctx.addOperation(new SuccessOperation('op1', 10))

            await ctx.execute()
            expect(ctx.state).toBe('committed')

            await ctx.rollback()
            expect(ctx.state).toBe('committed')
        })

        it('should not rollback already rolledback transaction', async () => {
            const ctx = new TransactionContext()
            ctx.addOperation(new FailOperation())

            await ctx.execute()
            expect(ctx.state).toBe('rolledback')

            await ctx.rollback()
            expect(ctx.state).toBe('rolledback')
        })
    })

    // ========================================================================
    // 上下文数据测试 | Context Data Tests
    // ========================================================================

    describe('Context Data', () => {
        it('should get and set context data', () => {
            const ctx = new TransactionContext()

            ctx.set('key1', 'value1')
            ctx.set('key2', { nested: true })

            expect(ctx.get<string>('key1')).toBe('value1')
            expect(ctx.get<{ nested: boolean }>('key2')).toEqual({ nested: true })
        })

        it('should return undefined for non-existent key', () => {
            const ctx = new TransactionContext()
            expect(ctx.get('nonexistent')).toBeUndefined()
        })

        it('should allow operations to share context data', async () => {
            const ctx = new TransactionContext()
            ctx.addOperation(new ContextDataOperation())

            await ctx.execute()

            expect(ctx.get<string>('testKey')).toBe('testValue')
            expect(ctx.get<number>('numberKey')).toBe(42)
        })
    })

    // ========================================================================
    // 边界情况测试 | Edge Cases
    // ========================================================================

    describe('Edge Cases', () => {
        it('should handle empty operations list', async () => {
            const ctx = new TransactionContext()
            const result = await ctx.execute()

            expect(result.success).toBe(true)
            expect(result.results).toHaveLength(0)
            expect(ctx.state).toBe('committed')
        })

        it('should handle single operation', async () => {
            const ctx = new TransactionContext()
            ctx.addOperation(new SuccessOperation('single', 5))

            const result = await ctx.execute()

            expect(result.success).toBe(true)
            expect(result.results).toHaveLength(1)
        })

        it('should handle operation throwing exception', async () => {
            const ctx = new TransactionContext()
            const throwOp: ITransactionOperation = {
                name: 'throw',
                data: {},
                validate: async () => true,
                execute: async () => {
                    throw new Error('Unexpected error')
                },
                compensate: async () => {},
            }

            ctx.addOperation(throwOp)
            const result = await ctx.execute()

            expect(result.success).toBe(false)
            expect(result.error).toBe('Unexpected error')
        })

        it('should handle compensate throwing exception', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

            const ctx = new TransactionContext({ storage })
            const badCompensateOp: ITransactionOperation = {
                name: 'bad-compensate',
                data: {},
                validate: async () => true,
                execute: async () => ({ success: true }),
                compensate: async () => {
                    throw new Error('Compensation error')
                },
            }
            const failOp = new FailOperation()

            ctx.addOperation(badCompensateOp).addOperation(failOp)
            const result = await ctx.execute()

            expect(result.success).toBe(false)

            // Check that operation state was updated with error
            const log = await storage.getTransaction(ctx.id)
            expect(log?.operations[0].state).toBe('failed')
            expect(log?.operations[0].error).toContain('Compensation error')

            consoleSpy.mockRestore()
        })
    })
})
