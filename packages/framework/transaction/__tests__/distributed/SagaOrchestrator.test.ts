/**
 * @zh SagaOrchestrator 单元测试
 * @en SagaOrchestrator unit tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    SagaOrchestrator,
    createSagaOrchestrator,
    type SagaStep,
    type SagaLog,
} from '../../src/distributed/SagaOrchestrator.js'
import { MemoryStorage } from '../../src/storage/MemoryStorage.js'

// ============================================================================
// Test Suite | 测试套件
// ============================================================================

describe('SagaOrchestrator', () => {
    let storage: MemoryStorage
    let orchestrator: SagaOrchestrator

    beforeEach(() => {
        storage = new MemoryStorage()
        orchestrator = new SagaOrchestrator({
            storage,
            timeout: 5000,
            serverId: 'test-server',
        })
    })

    // ========================================================================
    // 构造器测试 | Constructor Tests
    // ========================================================================

    describe('Constructor', () => {
        it('should create with default config', () => {
            const defaultOrchestrator = new SagaOrchestrator()
            expect(defaultOrchestrator).toBeDefined()
        })

        it('should create with custom config', () => {
            const customOrchestrator = new SagaOrchestrator({
                storage,
                timeout: 10000,
                serverId: 'custom-server',
            })
            expect(customOrchestrator).toBeDefined()
        })

        it('should use createSagaOrchestrator factory', () => {
            const factoryOrchestrator = createSagaOrchestrator({ serverId: 'factory-server' })
            expect(factoryOrchestrator).toBeInstanceOf(SagaOrchestrator)
        })
    })

    // ========================================================================
    // 成功执行测试 | Successful Execution Tests
    // ========================================================================

    describe('execute() - success', () => {
        it('should execute single step saga', async () => {
            const executeLog: string[] = []

            const steps: SagaStep<{ value: number }>[] = [
                {
                    name: 'step1',
                    execute: async (data) => {
                        executeLog.push(`execute:${data.value}`)
                        return { success: true }
                    },
                    compensate: async (data) => {
                        executeLog.push(`compensate:${data.value}`)
                    },
                    data: { value: 1 },
                },
            ]

            const result = await orchestrator.execute(steps)

            expect(result.success).toBe(true)
            expect(result.sagaId).toMatch(/^saga_/)
            expect(result.completedSteps).toEqual(['step1'])
            expect(result.duration).toBeGreaterThanOrEqual(0)
            expect(executeLog).toEqual(['execute:1'])
        })

        it('should execute multi-step saga', async () => {
            const executeLog: string[] = []

            const steps: SagaStep<{ name: string }>[] = [
                {
                    name: 'step1',
                    execute: async (data) => {
                        executeLog.push(`execute:${data.name}`)
                        return { success: true }
                    },
                    compensate: async (data) => {
                        executeLog.push(`compensate:${data.name}`)
                    },
                    data: { name: 'A' },
                },
                {
                    name: 'step2',
                    execute: async (data) => {
                        executeLog.push(`execute:${data.name}`)
                        return { success: true }
                    },
                    compensate: async (data) => {
                        executeLog.push(`compensate:${data.name}`)
                    },
                    data: { name: 'B' },
                },
                {
                    name: 'step3',
                    execute: async (data) => {
                        executeLog.push(`execute:${data.name}`)
                        return { success: true }
                    },
                    compensate: async (data) => {
                        executeLog.push(`compensate:${data.name}`)
                    },
                    data: { name: 'C' },
                },
            ]

            const result = await orchestrator.execute(steps)

            expect(result.success).toBe(true)
            expect(result.completedSteps).toEqual(['step1', 'step2', 'step3'])
            expect(executeLog).toEqual(['execute:A', 'execute:B', 'execute:C'])
        })

        it('should save saga log on success', async () => {
            const steps: SagaStep<{}>[] = [
                {
                    name: 'step1',
                    execute: async () => ({ success: true }),
                    compensate: async () => {},
                    data: {},
                },
            ]

            const result = await orchestrator.execute(steps)

            const log = await orchestrator.getSagaLog(result.sagaId)
            expect(log).not.toBeNull()
            expect(log?.state).toBe('completed')
            expect(log?.steps[0].state).toBe('completed')
        })
    })

    // ========================================================================
    // 失败和补偿测试 | Failure and Compensation Tests
    // ========================================================================

    describe('execute() - failure and compensation', () => {
        it('should compensate on step failure', async () => {
            const executeLog: string[] = []

            const steps: SagaStep<{ name: string }>[] = [
                {
                    name: 'step1',
                    execute: async (data) => {
                        executeLog.push(`execute:${data.name}`)
                        return { success: true }
                    },
                    compensate: async (data) => {
                        executeLog.push(`compensate:${data.name}`)
                    },
                    data: { name: 'A' },
                },
                {
                    name: 'step2',
                    execute: async (data) => {
                        executeLog.push(`execute:${data.name}`)
                        return { success: true }
                    },
                    compensate: async (data) => {
                        executeLog.push(`compensate:${data.name}`)
                    },
                    data: { name: 'B' },
                },
                {
                    name: 'step3',
                    execute: async () => {
                        return { success: false, error: 'Step 3 failed' }
                    },
                    compensate: async () => {},
                    data: { name: 'C' },
                },
            ]

            const result = await orchestrator.execute(steps)

            expect(result.success).toBe(false)
            expect(result.failedStep).toBe('step3')
            expect(result.error).toBe('Step 3 failed')
            expect(result.completedSteps).toEqual(['step1', 'step2'])

            // Compensation should be in reverse order
            expect(executeLog).toEqual([
                'execute:A',
                'execute:B',
                'compensate:B',
                'compensate:A',
            ])
        })

        it('should save saga log on failure', async () => {
            const steps: SagaStep<{}>[] = [
                {
                    name: 'step1',
                    execute: async () => ({ success: true }),
                    compensate: async () => {},
                    data: {},
                },
                {
                    name: 'step2',
                    execute: async () => ({ success: false, error: 'Failed' }),
                    compensate: async () => {},
                    data: {},
                },
            ]

            const result = await orchestrator.execute(steps)

            const log = await orchestrator.getSagaLog(result.sagaId)
            expect(log?.state).toBe('compensated')
            expect(log?.steps[0].state).toBe('compensated')
            expect(log?.steps[1].state).toBe('failed')
        })

        it('should handle compensation error', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

            const steps: SagaStep<{}>[] = [
                {
                    name: 'step1',
                    execute: async () => ({ success: true }),
                    compensate: async () => {
                        throw new Error('Compensation failed')
                    },
                    data: {},
                },
                {
                    name: 'step2',
                    execute: async () => ({ success: false, error: 'Failed' }),
                    compensate: async () => {},
                    data: {},
                },
            ]

            const result = await orchestrator.execute(steps)

            expect(result.success).toBe(false)

            const log = await orchestrator.getSagaLog(result.sagaId)
            expect(log?.steps[0].state).toBe('failed')
            expect(log?.steps[0].error).toContain('Compensation failed')

            consoleSpy.mockRestore()
        })
    })

    // ========================================================================
    // 超时测试 | Timeout Tests
    // ========================================================================

    describe('timeout', () => {
        it('should timeout on slow saga', async () => {
            const fastOrchestrator = new SagaOrchestrator({
                storage,
                timeout: 50, // 50ms timeout
            })

            // Timeout is checked between steps, so we need 2 steps
            const steps: SagaStep<{}>[] = [
                {
                    name: 'slow-step',
                    execute: async () => {
                        await new Promise((resolve) => setTimeout(resolve, 100))
                        return { success: true }
                    },
                    compensate: async () => {},
                    data: {},
                },
                {
                    name: 'second-step',
                    execute: async () => {
                        return { success: true }
                    },
                    compensate: async () => {},
                    data: {},
                },
            ]

            const result = await fastOrchestrator.execute(steps)

            expect(result.success).toBe(false)
            expect(result.error).toContain('timed out')
        })
    })

    // ========================================================================
    // 分布式服务器测试 | Distributed Server Tests
    // ========================================================================

    describe('distributed servers', () => {
        it('should track serverId for each step', async () => {
            const steps: SagaStep<{}>[] = [
                {
                    name: 'step1',
                    serverId: 'server-1',
                    execute: async () => ({ success: true }),
                    compensate: async () => {},
                    data: {},
                },
                {
                    name: 'step2',
                    serverId: 'server-2',
                    execute: async () => ({ success: true }),
                    compensate: async () => {},
                    data: {},
                },
            ]

            const result = await orchestrator.execute(steps)

            const log = await orchestrator.getSagaLog(result.sagaId)
            expect(log?.steps[0].serverId).toBe('server-1')
            expect(log?.steps[1].serverId).toBe('server-2')
        })

        it('should include orchestrator serverId in metadata', async () => {
            const steps: SagaStep<{}>[] = [
                {
                    name: 'step1',
                    execute: async () => ({ success: true }),
                    compensate: async () => {},
                    data: {},
                },
            ]

            const result = await orchestrator.execute(steps)

            const log = await orchestrator.getSagaLog(result.sagaId)
            expect(log?.metadata?.orchestratorServerId).toBe('test-server')
        })
    })

    // ========================================================================
    // getSagaLog 测试 | getSagaLog Tests
    // ========================================================================

    describe('getSagaLog()', () => {
        it('should return saga log by id', async () => {
            const steps: SagaStep<{}>[] = [
                {
                    name: 'step1',
                    execute: async () => ({ success: true }),
                    compensate: async () => {},
                    data: {},
                },
            ]

            const result = await orchestrator.execute(steps)
            const log = await orchestrator.getSagaLog(result.sagaId)

            expect(log).not.toBeNull()
            expect(log?.id).toBe(result.sagaId)
        })

        it('should return null for non-existent saga', async () => {
            const log = await orchestrator.getSagaLog('non-existent')
            expect(log).toBeNull()
        })

        it('should return null without storage', async () => {
            const noStorageOrchestrator = new SagaOrchestrator()
            const log = await noStorageOrchestrator.getSagaLog('any-id')
            expect(log).toBeNull()
        })
    })

    // ========================================================================
    // 恢复测试 | Recovery Tests
    // ========================================================================

    describe('recover()', () => {
        it('should return 0 without storage', async () => {
            const noStorageOrchestrator = new SagaOrchestrator()
            const count = await noStorageOrchestrator.recover()
            expect(count).toBe(0)
        })

        it('should return 0 when no pending sagas', async () => {
            const count = await orchestrator.recover()
            expect(count).toBe(0)
        })
    })

    // ========================================================================
    // 边界情况测试 | Edge Cases
    // ========================================================================

    describe('Edge Cases', () => {
        it('should handle empty steps', async () => {
            const result = await orchestrator.execute([])

            expect(result.success).toBe(true)
            expect(result.completedSteps).toEqual([])
        })

        it('should handle execute throwing exception', async () => {
            const steps: SagaStep<{}>[] = [
                {
                    name: 'throwing-step',
                    execute: async () => {
                        throw new Error('Unexpected error')
                    },
                    compensate: async () => {},
                    data: {},
                },
            ]

            const result = await orchestrator.execute(steps)

            expect(result.success).toBe(false)
            expect(result.error).toBe('Unexpected error')
        })

        it('should work without storage', async () => {
            const noStorageOrchestrator = new SagaOrchestrator()

            const steps: SagaStep<{}>[] = [
                {
                    name: 'step1',
                    execute: async () => ({ success: true }),
                    compensate: async () => {},
                    data: {},
                },
            ]

            const result = await noStorageOrchestrator.execute(steps)

            expect(result.success).toBe(true)
        })

        it('should track step timing', async () => {
            const steps: SagaStep<{}>[] = [
                {
                    name: 'step1',
                    execute: async () => {
                        await new Promise((resolve) => setTimeout(resolve, 50))
                        return { success: true }
                    },
                    compensate: async () => {},
                    data: {},
                },
            ]

            const result = await orchestrator.execute(steps)

            const log = await orchestrator.getSagaLog(result.sagaId)
            expect(log?.steps[0].startedAt).toBeGreaterThan(0)
            expect(log?.steps[0].completedAt).toBeGreaterThan(log?.steps[0].startedAt!)
        })
    })

    // ========================================================================
    // 实际场景测试 | Real World Scenario Tests
    // ========================================================================

    describe('Real World Scenarios', () => {
        it('should handle distributed purchase flow', async () => {
            const inventory: Map<string, number> = new Map()
            const wallet: Map<string, number> = new Map()

            inventory.set('item-1', 10)
            wallet.set('player-1', 1000)

            const steps: SagaStep<{ playerId: string; itemId: string; price: number }>[] = [
                {
                    name: 'deduct_currency',
                    serverId: 'wallet-server',
                    execute: async (data) => {
                        const balance = wallet.get(data.playerId) ?? 0
                        if (balance < data.price) {
                            return { success: false, error: 'Insufficient balance' }
                        }
                        wallet.set(data.playerId, balance - data.price)
                        return { success: true }
                    },
                    compensate: async (data) => {
                        const balance = wallet.get(data.playerId) ?? 0
                        wallet.set(data.playerId, balance + data.price)
                    },
                    data: { playerId: 'player-1', itemId: 'item-1', price: 100 },
                },
                {
                    name: 'reserve_item',
                    serverId: 'inventory-server',
                    execute: async (data) => {
                        const stock = inventory.get(data.itemId) ?? 0
                        if (stock < 1) {
                            return { success: false, error: 'Out of stock' }
                        }
                        inventory.set(data.itemId, stock - 1)
                        return { success: true }
                    },
                    compensate: async (data) => {
                        const stock = inventory.get(data.itemId) ?? 0
                        inventory.set(data.itemId, stock + 1)
                    },
                    data: { playerId: 'player-1', itemId: 'item-1', price: 100 },
                },
            ]

            const result = await orchestrator.execute(steps)

            expect(result.success).toBe(true)
            expect(wallet.get('player-1')).toBe(900)
            expect(inventory.get('item-1')).toBe(9)
        })

        it('should rollback distributed purchase on inventory failure', async () => {
            const wallet: Map<string, number> = new Map()
            const inventory: Map<string, number> = new Map()

            wallet.set('player-1', 1000)
            inventory.set('item-1', 0) // Out of stock

            const steps: SagaStep<{ playerId: string; itemId: string; price: number }>[] = [
                {
                    name: 'deduct_currency',
                    execute: async (data) => {
                        const balance = wallet.get(data.playerId) ?? 0
                        wallet.set(data.playerId, balance - data.price)
                        return { success: true }
                    },
                    compensate: async (data) => {
                        const balance = wallet.get(data.playerId) ?? 0
                        wallet.set(data.playerId, balance + data.price)
                    },
                    data: { playerId: 'player-1', itemId: 'item-1', price: 100 },
                },
                {
                    name: 'reserve_item',
                    execute: async (data) => {
                        const stock = inventory.get(data.itemId) ?? 0
                        if (stock < 1) {
                            return { success: false, error: 'Out of stock' }
                        }
                        inventory.set(data.itemId, stock - 1)
                        return { success: true }
                    },
                    compensate: async (data) => {
                        const stock = inventory.get(data.itemId) ?? 0
                        inventory.set(data.itemId, stock + 1)
                    },
                    data: { playerId: 'player-1', itemId: 'item-1', price: 100 },
                },
            ]

            const result = await orchestrator.execute(steps)

            expect(result.success).toBe(false)
            expect(result.error).toBe('Out of stock')
            expect(wallet.get('player-1')).toBe(1000) // Restored
            expect(inventory.get('item-1')).toBe(0) // Unchanged
        })
    })
})
