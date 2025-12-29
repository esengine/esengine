/**
 * @zh MemoryStorage 单元测试
 * @en MemoryStorage unit tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryStorage } from '../../src/storage/MemoryStorage.js'
import type { TransactionLog } from '../../src/core/types.js'

describe('MemoryStorage', () => {
    let storage: MemoryStorage

    beforeEach(() => {
        storage = new MemoryStorage()
    })

    // ========================================================================
    // 分布式锁测试 | Distributed Lock Tests
    // ========================================================================

    describe('Distributed Lock', () => {
        it('should acquire lock successfully', async () => {
            const token = await storage.acquireLock('test-key', 5000)
            expect(token).not.toBeNull()
            expect(typeof token).toBe('string')
        })

        it('should fail to acquire same lock twice', async () => {
            const token1 = await storage.acquireLock('test-key', 5000)
            const token2 = await storage.acquireLock('test-key', 5000)

            expect(token1).not.toBeNull()
            expect(token2).toBeNull()
        })

        it('should release lock with correct token', async () => {
            const token = await storage.acquireLock('test-key', 5000)
            expect(token).not.toBeNull()

            const released = await storage.releaseLock('test-key', token!)
            expect(released).toBe(true)
        })

        it('should fail to release lock with wrong token', async () => {
            const token = await storage.acquireLock('test-key', 5000)
            expect(token).not.toBeNull()

            const released = await storage.releaseLock('test-key', 'wrong-token')
            expect(released).toBe(false)
        })

        it('should allow re-acquiring after release', async () => {
            const token1 = await storage.acquireLock('test-key', 5000)
            await storage.releaseLock('test-key', token1!)

            const token2 = await storage.acquireLock('test-key', 5000)
            expect(token2).not.toBeNull()
        })

        it('should expire lock after TTL', async () => {
            await storage.acquireLock('test-key', 50) // 50ms TTL

            // 等待锁过期
            await new Promise((resolve) => setTimeout(resolve, 100))

            const token2 = await storage.acquireLock('test-key', 5000)
            expect(token2).not.toBeNull()
        })
    })

    // ========================================================================
    // 事务日志测试 | Transaction Log Tests
    // ========================================================================

    describe('Transaction Log', () => {
        const createMockLog = (id: string): TransactionLog => ({
            id,
            state: 'pending',
            operations: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        })

        it('should save and retrieve transaction', async () => {
            const log = createMockLog('tx-1')
            await storage.saveTransaction(log)

            const retrieved = await storage.getTransaction('tx-1')
            expect(retrieved).not.toBeNull()
            expect(retrieved!.id).toBe('tx-1')
        })

        it('should return null for non-existent transaction', async () => {
            const retrieved = await storage.getTransaction('non-existent')
            expect(retrieved).toBeNull()
        })

        it('should update transaction state', async () => {
            const log = createMockLog('tx-1')
            await storage.saveTransaction(log)

            await storage.updateTransactionState('tx-1', 'committed')

            const retrieved = await storage.getTransaction('tx-1')
            expect(retrieved!.state).toBe('committed')
        })

        it('should update operation state', async () => {
            const log: TransactionLog = {
                ...createMockLog('tx-1'),
                operations: [
                    { name: 'op1', state: 'pending' },
                    { name: 'op2', state: 'pending' },
                ],
            }
            await storage.saveTransaction(log)

            await storage.updateOperationState('tx-1', 0, 'completed')
            await storage.updateOperationState('tx-1', 1, 'failed', 'Some error')

            const retrieved = await storage.getTransaction('tx-1')
            expect(retrieved!.operations[0].state).toBe('completed')
            expect(retrieved!.operations[1].state).toBe('failed')
            expect(retrieved!.operations[1].error).toBe('Some error')
        })

        it('should delete transaction', async () => {
            const log = createMockLog('tx-1')
            await storage.saveTransaction(log)

            await storage.deleteTransaction('tx-1')

            const retrieved = await storage.getTransaction('tx-1')
            expect(retrieved).toBeNull()
        })

        it('should get pending transactions', async () => {
            await storage.saveTransaction({ ...createMockLog('tx-1'), state: 'pending' })
            await storage.saveTransaction({ ...createMockLog('tx-2'), state: 'executing' })
            await storage.saveTransaction({ ...createMockLog('tx-3'), state: 'committed' })

            const pending = await storage.getPendingTransactions()
            expect(pending.length).toBe(2) // pending and executing
            expect(pending.map((p) => p.id).sort()).toEqual(['tx-1', 'tx-2'])
        })

        it('should filter pending transactions by serverId', async () => {
            await storage.saveTransaction({
                ...createMockLog('tx-1'),
                state: 'pending',
                metadata: { serverId: 'server-1' },
            })
            await storage.saveTransaction({
                ...createMockLog('tx-2'),
                state: 'pending',
                metadata: { serverId: 'server-2' },
            })

            const pending = await storage.getPendingTransactions('server-1')
            expect(pending.length).toBe(1)
            expect(pending[0].id).toBe('tx-1')
        })
    })

    // ========================================================================
    // 数据操作测试 | Data Operations Tests
    // ========================================================================

    describe('Data Operations', () => {
        it('should set and get data', async () => {
            await storage.set('key1', { value: 123 })

            const data = await storage.get<{ value: number }>('key1')
            expect(data).toEqual({ value: 123 })
        })

        it('should return null for non-existent key', async () => {
            const data = await storage.get('non-existent')
            expect(data).toBeNull()
        })

        it('should delete data', async () => {
            await storage.set('key1', { value: 123 })
            const deleted = await storage.delete('key1')

            expect(deleted).toBe(true)
            expect(await storage.get('key1')).toBeNull()
        })

        it('should return false when deleting non-existent key', async () => {
            const deleted = await storage.delete('non-existent')
            expect(deleted).toBe(false)
        })

        it('should expire data after TTL', async () => {
            await storage.set('key1', { value: 123 }, 50) // 50ms TTL

            // 数据应该存在
            expect(await storage.get('key1')).toEqual({ value: 123 })

            // 等待过期
            await new Promise((resolve) => setTimeout(resolve, 100))

            expect(await storage.get('key1')).toBeNull()
        })

        it('should overwrite existing data', async () => {
            await storage.set('key1', { value: 1 })
            await storage.set('key1', { value: 2 })

            const data = await storage.get<{ value: number }>('key1')
            expect(data).toEqual({ value: 2 })
        })
    })

    // ========================================================================
    // 辅助方法测试 | Helper Methods Tests
    // ========================================================================

    describe('Helper Methods', () => {
        it('should clear all data', async () => {
            await storage.set('key1', 'value1')
            await storage.set('key2', 'value2')
            await storage.saveTransaction({
                id: 'tx-1',
                state: 'pending',
                operations: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
            })

            storage.clear()

            expect(await storage.get('key1')).toBeNull()
            expect(await storage.get('key2')).toBeNull()
            expect(await storage.getTransaction('tx-1')).toBeNull()
            expect(storage.transactionCount).toBe(0)
        })

        it('should track transaction count', async () => {
            expect(storage.transactionCount).toBe(0)

            await storage.saveTransaction({
                id: 'tx-1',
                state: 'pending',
                operations: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
            })

            expect(storage.transactionCount).toBe(1)
        })
    })
})
