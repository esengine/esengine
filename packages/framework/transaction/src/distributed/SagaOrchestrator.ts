/**
 * @zh Saga 编排器
 * @en Saga Orchestrator
 *
 * @zh 实现分布式事务的 Saga 模式编排
 * @en Implements Saga pattern orchestration for distributed transactions
 */

import type {
    ITransactionStorage,
    TransactionLog,
    TransactionState,
    OperationResult,
} from '../core/types.js'

/**
 * @zh Saga 步骤状态
 * @en Saga step state
 */
export type SagaStepState = 'pending' | 'executing' | 'completed' | 'compensating' | 'compensated' | 'failed'

/**
 * @zh Saga 步骤
 * @en Saga step
 */
export interface SagaStep<T = unknown> {
    /**
     * @zh 步骤名称
     * @en Step name
     */
    name: string

    /**
     * @zh 目标服务器 ID（分布式用）
     * @en Target server ID (for distributed)
     */
    serverId?: string

    /**
     * @zh 执行函数
     * @en Execute function
     */
    execute: (data: T) => Promise<OperationResult>

    /**
     * @zh 补偿函数
     * @en Compensate function
     */
    compensate: (data: T) => Promise<void>

    /**
     * @zh 步骤数据
     * @en Step data
     */
    data: T
}

/**
 * @zh Saga 步骤日志
 * @en Saga step log
 */
export interface SagaStepLog {
    name: string
    serverId?: string
    state: SagaStepState
    startedAt?: number
    completedAt?: number
    error?: string
}

/**
 * @zh Saga 日志
 * @en Saga log
 */
export interface SagaLog {
    id: string
    state: 'pending' | 'running' | 'completed' | 'compensating' | 'compensated' | 'failed'
    steps: SagaStepLog[]
    createdAt: number
    updatedAt: number
    metadata?: Record<string, unknown>
}

/**
 * @zh Saga 结果
 * @en Saga result
 */
export interface SagaResult {
    success: boolean
    sagaId: string
    completedSteps: string[]
    failedStep?: string
    error?: string
    duration: number
}

/**
 * @zh Saga 编排器配置
 * @en Saga orchestrator configuration
 */
export interface SagaOrchestratorConfig {
    /**
     * @zh 存储实例
     * @en Storage instance
     */
    storage?: ITransactionStorage

    /**
     * @zh 默认超时时间（毫秒）
     * @en Default timeout in milliseconds
     */
    timeout?: number

    /**
     * @zh 服务器 ID
     * @en Server ID
     */
    serverId?: string
}

/**
 * @zh 生成 Saga ID
 * @en Generate Saga ID
 */
function generateSagaId(): string {
    return `saga_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * @zh Saga 编排器
 * @en Saga Orchestrator
 *
 * @zh 管理分布式事务的 Saga 模式执行流程
 * @en Manages Saga pattern execution flow for distributed transactions
 *
 * @example
 * ```typescript
 * const orchestrator = new SagaOrchestrator({
 *     storage: redisStorage,
 *     serverId: 'server1',
 * })
 *
 * const result = await orchestrator.execute([
 *     {
 *         name: 'deduct_currency',
 *         serverId: 'server1',
 *         execute: async (data) => {
 *             // 扣除货币
 *             return { success: true }
 *         },
 *         compensate: async (data) => {
 *             // 恢复货币
 *         },
 *         data: { playerId: '1', amount: 100 },
 *     },
 *     {
 *         name: 'add_item',
 *         serverId: 'server2',
 *         execute: async (data) => {
 *             // 添加物品
 *             return { success: true }
 *         },
 *         compensate: async (data) => {
 *             // 移除物品
 *         },
 *         data: { playerId: '1', itemId: 'sword' },
 *     },
 * ])
 * ```
 */
export class SagaOrchestrator {
    private _storage: ITransactionStorage | null
    private _timeout: number
    private _serverId: string

    constructor(config: SagaOrchestratorConfig = {}) {
        this._storage = config.storage ?? null
        this._timeout = config.timeout ?? 30000
        this._serverId = config.serverId ?? 'default'
    }

    /**
     * @zh 执行 Saga
     * @en Execute Saga
     */
    async execute<T>(steps: SagaStep<T>[]): Promise<SagaResult> {
        const sagaId = generateSagaId()
        const startTime = Date.now()
        const completedSteps: string[] = []

        const sagaLog: SagaLog = {
            id: sagaId,
            state: 'pending',
            steps: steps.map((s) => ({
                name: s.name,
                serverId: s.serverId,
                state: 'pending' as SagaStepState,
            })),
            createdAt: startTime,
            updatedAt: startTime,
            metadata: { orchestratorServerId: this._serverId },
        }

        await this._saveSagaLog(sagaLog)

        try {
            sagaLog.state = 'running'
            await this._saveSagaLog(sagaLog)

            for (let i = 0; i < steps.length; i++) {
                const step = steps[i]

                if (Date.now() - startTime > this._timeout) {
                    throw new Error('Saga execution timed out')
                }

                sagaLog.steps[i].state = 'executing'
                sagaLog.steps[i].startedAt = Date.now()
                await this._saveSagaLog(sagaLog)

                const result = await step.execute(step.data)

                if (!result.success) {
                    sagaLog.steps[i].state = 'failed'
                    sagaLog.steps[i].error = result.error
                    await this._saveSagaLog(sagaLog)

                    throw new Error(result.error ?? `Step ${step.name} failed`)
                }

                sagaLog.steps[i].state = 'completed'
                sagaLog.steps[i].completedAt = Date.now()
                completedSteps.push(step.name)
                await this._saveSagaLog(sagaLog)
            }

            sagaLog.state = 'completed'
            sagaLog.updatedAt = Date.now()
            await this._saveSagaLog(sagaLog)

            return {
                success: true,
                sagaId,
                completedSteps,
                duration: Date.now() - startTime,
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            const failedStepIndex = completedSteps.length

            sagaLog.state = 'compensating'
            await this._saveSagaLog(sagaLog)

            for (let i = completedSteps.length - 1; i >= 0; i--) {
                const step = steps[i]

                sagaLog.steps[i].state = 'compensating'
                await this._saveSagaLog(sagaLog)

                try {
                    await step.compensate(step.data)
                    sagaLog.steps[i].state = 'compensated'
                } catch (compError) {
                    const compErrorMessage = compError instanceof Error ? compError.message : String(compError)
                    sagaLog.steps[i].state = 'failed'
                    sagaLog.steps[i].error = `Compensation failed: ${compErrorMessage}`
                }

                await this._saveSagaLog(sagaLog)
            }

            sagaLog.state = 'compensated'
            sagaLog.updatedAt = Date.now()
            await this._saveSagaLog(sagaLog)

            return {
                success: false,
                sagaId,
                completedSteps,
                failedStep: steps[failedStepIndex]?.name,
                error: errorMessage,
                duration: Date.now() - startTime,
            }
        }
    }

    /**
     * @zh 恢复未完成的 Saga
     * @en Recover pending Sagas
     */
    async recover(): Promise<number> {
        if (!this._storage) return 0

        const pendingSagas = await this._getPendingSagas()
        let recoveredCount = 0

        for (const saga of pendingSagas) {
            try {
                await this._recoverSaga(saga)
                recoveredCount++
            } catch (error) {
                console.error(`Failed to recover saga ${saga.id}:`, error)
            }
        }

        return recoveredCount
    }

    /**
     * @zh 获取 Saga 日志
     * @en Get Saga log
     */
    async getSagaLog(sagaId: string): Promise<SagaLog | null> {
        if (!this._storage) return null
        return this._storage.get<SagaLog>(`saga:${sagaId}`)
    }

    private async _saveSagaLog(log: SagaLog): Promise<void> {
        if (!this._storage) return
        log.updatedAt = Date.now()
        await this._storage.set(`saga:${log.id}`, log)
    }

    private async _getPendingSagas(): Promise<SagaLog[]> {
        return []
    }

    private async _recoverSaga(saga: SagaLog): Promise<void> {
        if (saga.state === 'running' || saga.state === 'compensating') {
            const completedSteps = saga.steps
                .filter((s) => s.state === 'completed')
                .map((s) => s.name)

            saga.state = 'compensated'
            saga.updatedAt = Date.now()

            if (this._storage) {
                await this._storage.set(`saga:${saga.id}`, saga)
            }
        }
    }
}

/**
 * @zh 创建 Saga 编排器
 * @en Create Saga orchestrator
 */
export function createSagaOrchestrator(config: SagaOrchestratorConfig = {}): SagaOrchestrator {
    return new SagaOrchestrator(config)
}
