/**
 * @zh 网络预测系统
 * @en Network Prediction System
 *
 * @zh 处理本地玩家的客户端预测和服务器校正
 * @en Handles client-side prediction and server reconciliation for local player
 */

import { EntitySystem, Matcher, Time, type Entity } from '@esengine/ecs-framework'
import { NetworkIdentity } from '../components/NetworkIdentity'
import { NetworkTransform } from '../components/NetworkTransform'
import type { SyncData, PlayerInput } from '../protocol'
import {
    ClientPrediction,
    createClientPrediction,
    type IPredictor,
    type ClientPredictionConfig,
    type ITransformState,
} from '../sync'

// =============================================================================
// Types | 类型定义
// =============================================================================

/**
 * @zh 移动输入
 * @en Movement input
 */
export interface MovementInput {
    x: number
    y: number
    actions?: string[]
}

/**
 * @zh 预测状态（位置 + 旋转）
 * @en Predicted state (position + rotation)
 */
export interface PredictedTransform extends ITransformState {
    velocityX: number
    velocityY: number
}

/**
 * @zh 预测系统配置
 * @en Prediction system configuration
 */
export interface NetworkPredictionConfig extends Partial<ClientPredictionConfig> {
    /**
     * @zh 移动速度（单位/秒）
     * @en Movement speed (units/second)
     */
    moveSpeed: number

    /**
     * @zh 是否启用预测
     * @en Whether prediction is enabled
     */
    enabled: boolean
}

const DEFAULT_CONFIG: NetworkPredictionConfig = {
    moveSpeed: 200,
    enabled: true,
    maxUnacknowledgedInputs: 60,
    reconciliationThreshold: 0.5,
    reconciliationSpeed: 10,
}

// =============================================================================
// 默认预测器 | Default Predictor
// =============================================================================

/**
 * @zh 简单移动预测器
 * @en Simple movement predictor
 */
class SimpleMovementPredictor implements IPredictor<PredictedTransform, MovementInput> {
    constructor(private readonly _moveSpeed: number) {}

    predict(state: PredictedTransform, input: MovementInput, deltaTime: number): PredictedTransform {
        const velocityX = input.x * this._moveSpeed
        const velocityY = input.y * this._moveSpeed

        return {
            x: state.x + velocityX * deltaTime,
            y: state.y + velocityY * deltaTime,
            rotation: state.rotation,
            velocityX,
            velocityY,
        }
    }
}

// =============================================================================
// NetworkPredictionSystem | 网络预测系统
// =============================================================================

/**
 * @zh 网络预测系统
 * @en Network prediction system
 *
 * @zh 处理本地玩家的输入预测和服务器状态校正
 * @en Handles local player input prediction and server state reconciliation
 */
export class NetworkPredictionSystem extends EntitySystem {
    private readonly _config: NetworkPredictionConfig
    private readonly _predictor: IPredictor<PredictedTransform, MovementInput>
    private _prediction: ClientPrediction<PredictedTransform, MovementInput> | null = null
    private _localPlayerNetId: number = -1
    private _currentInput: MovementInput = { x: 0, y: 0 }
    private _inputSequence: number = 0

    constructor(config?: Partial<NetworkPredictionConfig>) {
        super(Matcher.all(NetworkIdentity, NetworkTransform))
        this._config = { ...DEFAULT_CONFIG, ...config }
        this._predictor = new SimpleMovementPredictor(this._config.moveSpeed)
    }

    /**
     * @zh 获取配置
     * @en Get configuration
     */
    get config(): Readonly<NetworkPredictionConfig> {
        return this._config
    }

    /**
     * @zh 获取当前输入序列号
     * @en Get current input sequence number
     */
    get inputSequence(): number {
        return this._inputSequence
    }

    /**
     * @zh 获取待确认输入数量
     * @en Get pending input count
     */
    get pendingInputCount(): number {
        return this._prediction?.pendingInputCount ?? 0
    }

    /**
     * @zh 是否启用预测
     * @en Whether prediction is enabled
     */
    get enabled(): boolean {
        return this._config.enabled
    }

    set enabled(value: boolean) {
        this._config.enabled = value
    }

    /**
     * @zh 设置本地玩家网络 ID
     * @en Set local player network ID
     */
    setLocalPlayerNetId(netId: number): void {
        this._localPlayerNetId = netId
        this._prediction = createClientPrediction<PredictedTransform, MovementInput>(
            this._predictor,
            {
                maxUnacknowledgedInputs: this._config.maxUnacknowledgedInputs,
                reconciliationThreshold: this._config.reconciliationThreshold,
                reconciliationSpeed: this._config.reconciliationSpeed,
            }
        )
    }

    /**
     * @zh 设置移动输入
     * @en Set movement input
     */
    setInput(x: number, y: number, actions?: string[]): void {
        this._currentInput = { x, y, actions }
    }

    /**
     * @zh 获取下一个要发送的输入（带序列号）
     * @en Get next input to send (with sequence number)
     */
    getInputToSend(): PlayerInput | null {
        if (!this._prediction) return null

        const input = this._prediction.getInputToSend()
        if (!input) return null

        return {
            seq: input.sequence,
            frame: 0,
            timestamp: input.timestamp,
            moveDir: { x: input.input.x, y: input.input.y },
            actions: input.input.actions,
        }
    }

    /**
     * @zh 处理服务器同步数据进行校正
     * @en Process server sync data for reconciliation
     */
    reconcileWithServer(data: SyncData): void {
        if (!this._prediction || this._localPlayerNetId < 0) return

        // Find local player state in sync data
        const localState = data.entities.find(e => e.netId === this._localPlayerNetId)
        if (!localState || !localState.pos) return

        const serverState: PredictedTransform = {
            x: localState.pos.x,
            y: localState.pos.y,
            rotation: localState.rot ?? 0,
            velocityX: localState.vel?.x ?? 0,
            velocityY: localState.vel?.y ?? 0,
        }

        // Reconcile prediction with server state
        if (data.ackSeq !== undefined) {
            this._prediction.reconcile(
                serverState,
                data.ackSeq,
                (state) => ({ x: state.x, y: state.y }),
                Time.deltaTime
            )
        }
    }

    protected override process(entities: readonly Entity[]): void {
        if (!this._config.enabled || !this._prediction) return

        const deltaTime = Time.deltaTime

        for (const entity of entities) {
            const identity = this.requireComponent(entity, NetworkIdentity)

            // Only process local player with authority
            if (!identity.bHasAuthority || identity.netId !== this._localPlayerNetId) continue

            const transform = this.requireComponent(entity, NetworkTransform)

            // Get current state
            const currentState: PredictedTransform = {
                x: transform.currentX,
                y: transform.currentY,
                rotation: transform.currentRotation,
                velocityX: 0,
                velocityY: 0,
            }

            // Record input and get predicted state
            if (this._currentInput.x !== 0 || this._currentInput.y !== 0) {
                const predicted = this._prediction.recordInput(
                    this._currentInput,
                    currentState,
                    deltaTime
                )

                // Apply predicted position
                transform.currentX = predicted.x
                transform.currentY = predicted.y
                transform.currentRotation = predicted.rotation

                // Update target to match (for rendering)
                transform.targetX = predicted.x
                transform.targetY = predicted.y
                transform.targetRotation = predicted.rotation

                this._inputSequence = this._prediction.currentSequence
            }

            // Apply correction offset smoothly
            const offset = this._prediction.correctionOffset
            if (Math.abs(offset.x) > 0.01 || Math.abs(offset.y) > 0.01) {
                transform.currentX += offset.x * deltaTime * 5
                transform.currentY += offset.y * deltaTime * 5
            }
        }
    }

    /**
     * @zh 重置预测状态
     * @en Reset prediction state
     */
    reset(): void {
        this._prediction?.clear()
        this._inputSequence = 0
        this._currentInput = { x: 0, y: 0 }
    }

    protected override onDestroy(): void {
        this._prediction?.clear()
        this._prediction = null
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建网络预测系统
 * @en Create network prediction system
 */
export function createNetworkPredictionSystem(
    config?: Partial<NetworkPredictionConfig>
): NetworkPredictionSystem {
    return new NetworkPredictionSystem(config)
}
