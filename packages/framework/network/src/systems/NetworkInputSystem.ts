/**
 * @zh 网络输入系统
 * @en Network Input System
 *
 * @zh 收集本地玩家输入并发送到服务器，支持与预测系统集成
 * @en Collects local player input and sends to server, supports integration with prediction system
 */

import { EntitySystem, Matcher } from '@esengine/ecs-framework'
import type { PlayerInput } from '../protocol'
import type { NetworkService } from '../services/NetworkService'
import type { NetworkPredictionSystem } from './NetworkPredictionSystem'

// =============================================================================
// Types | 类型定义
// =============================================================================

/**
 * @zh 输入配置
 * @en Input configuration
 */
export interface NetworkInputConfig {
    /**
     * @zh 发送输入的最小间隔（毫秒）
     * @en Minimum interval between input sends (milliseconds)
     */
    sendInterval: number

    /**
     * @zh 是否合并相同输入
     * @en Whether to merge identical inputs
     */
    mergeIdenticalInputs: boolean

    /**
     * @zh 最大输入队列长度
     * @en Maximum input queue length
     */
    maxQueueLength: number
}

const DEFAULT_CONFIG: NetworkInputConfig = {
    sendInterval: 16, // ~60fps
    mergeIdenticalInputs: true,
    maxQueueLength: 10,
}

/**
 * @zh 待发送输入
 * @en Pending input
 */
interface PendingInput {
    moveDir?: { x: number; y: number }
    actions?: string[]
    timestamp: number
}

// =============================================================================
// NetworkInputSystem | 网络输入系统
// =============================================================================

/**
 * @zh 网络输入系统
 * @en Network input system
 *
 * @zh 收集本地玩家输入并发送到服务器
 * @en Collects local player input and sends to server
 */
export class NetworkInputSystem extends EntitySystem {
    private readonly _networkService: NetworkService
    private readonly _config: NetworkInputConfig
    private _predictionSystem: NetworkPredictionSystem | null = null

    private _frame: number = 0
    private _inputSequence: number = 0
    private _inputQueue: PendingInput[] = []
    private _lastSendTime: number = 0
    private _lastMoveDir: { x: number; y: number } = { x: 0, y: 0 }

    constructor(networkService: NetworkService, config?: Partial<NetworkInputConfig>) {
        super(Matcher.nothing())
        this._networkService = networkService
        this._config = { ...DEFAULT_CONFIG, ...config }
    }

    /**
     * @zh 获取配置
     * @en Get configuration
     */
    get config(): Readonly<NetworkInputConfig> {
        return this._config
    }

    /**
     * @zh 获取当前帧号
     * @en Get current frame number
     */
    get frame(): number {
        return this._frame
    }

    /**
     * @zh 获取当前输入序列号
     * @en Get current input sequence
     */
    get inputSequence(): number {
        return this._inputSequence
    }

    /**
     * @zh 设置预测系统引用
     * @en Set prediction system reference
     */
    setPredictionSystem(system: NetworkPredictionSystem): void {
        this._predictionSystem = system
    }

    /**
     * @zh 处理输入队列
     * @en Process input queue
     */
    protected override process(): void {
        if (!this._networkService.isConnected) return

        this._frame++
        const now = Date.now()

        // Rate limiting
        if (now - this._lastSendTime < this._config.sendInterval) return

        // If using prediction system, get input from there
        if (this._predictionSystem) {
            const predictedInput = this._predictionSystem.getInputToSend()
            if (predictedInput) {
                this._networkService.sendInput(predictedInput)
                this._lastSendTime = now
            }
            return
        }

        // Otherwise process queue
        if (this._inputQueue.length === 0) return

        // Merge inputs if configured
        let mergedInput: PendingInput
        if (this._config.mergeIdenticalInputs && this._inputQueue.length > 1) {
            mergedInput = this._mergeInputs(this._inputQueue)
            this._inputQueue.length = 0
        } else {
            mergedInput = this._inputQueue.shift()!
        }

        // Build and send input
        this._inputSequence++
        const input: PlayerInput = {
            seq: this._inputSequence,
            frame: this._frame,
            timestamp: mergedInput.timestamp,
            moveDir: mergedInput.moveDir,
            actions: mergedInput.actions,
        }

        this._networkService.sendInput(input)
        this._lastSendTime = now
    }

    private _mergeInputs(inputs: PendingInput[]): PendingInput {
        const allActions: string[] = []
        let lastMoveDir: { x: number; y: number } | undefined

        for (const input of inputs) {
            if (input.moveDir) {
                lastMoveDir = input.moveDir
            }
            if (input.actions) {
                allActions.push(...input.actions)
            }
        }

        return {
            moveDir: lastMoveDir,
            actions: allActions.length > 0 ? allActions : undefined,
            timestamp: inputs[inputs.length - 1].timestamp,
        }
    }

    /**
     * @zh 添加移动输入
     * @en Add move input
     */
    public addMoveInput(x: number, y: number): void {
        // Skip if same as last input
        if (
            this._config.mergeIdenticalInputs &&
            this._lastMoveDir.x === x &&
            this._lastMoveDir.y === y &&
            this._inputQueue.length > 0
        ) {
            return
        }

        this._lastMoveDir = { x, y }

        // Also set input on prediction system
        if (this._predictionSystem) {
            this._predictionSystem.setInput(x, y)
        }

        this._addToQueue({ moveDir: { x, y }, timestamp: Date.now() })
    }

    /**
     * @zh 添加动作输入
     * @en Add action input
     */
    public addActionInput(action: string): void {
        // Try to add to last input in queue
        const lastInput = this._inputQueue[this._inputQueue.length - 1]
        if (lastInput) {
            lastInput.actions = lastInput.actions || []
            lastInput.actions.push(action)
        } else {
            this._addToQueue({ actions: [action], timestamp: Date.now() })
        }

        // Also set on prediction system
        if (this._predictionSystem) {
            this._predictionSystem.setInput(
                this._lastMoveDir.x,
                this._lastMoveDir.y,
                [action]
            )
        }
    }

    private _addToQueue(input: PendingInput): void {
        this._inputQueue.push(input)

        // Limit queue size
        while (this._inputQueue.length > this._config.maxQueueLength) {
            this._inputQueue.shift()
        }
    }

    /**
     * @zh 清空输入队列
     * @en Clear input queue
     */
    public clearQueue(): void {
        this._inputQueue.length = 0
        this._lastMoveDir = { x: 0, y: 0 }
    }

    /**
     * @zh 重置状态
     * @en Reset state
     */
    public reset(): void {
        this._frame = 0
        this._inputSequence = 0
        this.clearQueue()
    }

    protected override onDestroy(): void {
        this._inputQueue.length = 0
        this._predictionSystem = null
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建网络输入系统
 * @en Create network input system
 */
export function createNetworkInputSystem(
    networkService: NetworkService,
    config?: Partial<NetworkInputConfig>
): NetworkInputSystem {
    return new NetworkInputSystem(networkService, config)
}
