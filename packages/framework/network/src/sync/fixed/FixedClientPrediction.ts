/**
 * @zh 定点数客户端预测
 * @en Fixed-point Client Prediction
 *
 * @zh 用于帧同步的确定性客户端预测和回滚
 * @en Deterministic client prediction and rollback for lockstep
 */

import { Fixed32, FixedVector2 } from '@esengine/ecs-framework-math';

// =============================================================================
// 定点数输入快照接口 | Fixed Input Snapshot Interface
// =============================================================================

/**
 * @zh 定点数输入快照
 * @en Fixed-point input snapshot
 */
export interface IFixedInputSnapshot<TInput> {
    /**
     * @zh 输入帧号
     * @en Input frame number
     */
    readonly frame: number;

    /**
     * @zh 输入数据
     * @en Input data
     */
    readonly input: TInput;
}

/**
 * @zh 定点数预测状态
 * @en Fixed-point predicted state
 */
export interface IFixedPredictedState<TState> {
    /**
     * @zh 状态数据
     * @en State data
     */
    readonly state: TState;

    /**
     * @zh 对应的帧号
     * @en Corresponding frame number
     */
    readonly frame: number;
}

// =============================================================================
// 定点数预测器接口 | Fixed Predictor Interface
// =============================================================================

/**
 * @zh 定点数状态预测器接口
 * @en Fixed-point state predictor interface
 *
 * @zh 必须使用定点数运算确保确定性
 * @en Must use fixed-point arithmetic to ensure determinism
 */
export interface IFixedPredictor<TState, TInput> {
    /**
     * @zh 根据当前状态和输入预测下一状态
     * @en Predict next state based on current state and input
     *
     * @param state - @zh 当前状态 @en Current state
     * @param input - @zh 输入 @en Input
     * @param deltaTime - @zh 固定时间步长（定点数）@en Fixed delta time (fixed-point)
     * @returns @zh 预测的状态 @en Predicted state
     */
    predict(state: TState, input: TInput, deltaTime: Fixed32): TState;
}

/**
 * @zh 状态位置提取器接口
 * @en State position extractor interface
 */
export interface IFixedStatePositionExtractor<TState> {
    /**
     * @zh 从状态中提取位置
     * @en Extract position from state
     */
    getPosition(state: TState): FixedVector2;
}

// =============================================================================
// 定点数客户端预测配置 | Fixed Client Prediction Config
// =============================================================================

/**
 * @zh 定点数客户端预测配置
 * @en Fixed-point client prediction configuration
 */
export interface FixedClientPredictionConfig {
    /**
     * @zh 最大未确认输入数量
     * @en Maximum unacknowledged inputs
     */
    maxUnacknowledgedInputs: number;

    /**
     * @zh 固定时间步长（定点数）
     * @en Fixed delta time (fixed-point)
     */
    fixedDeltaTime: Fixed32;

    /**
     * @zh 校正阈值（定点数，超过此值才进行校正）
     * @en Reconciliation threshold (fixed-point, correction only above this value)
     */
    reconciliationThreshold: Fixed32;

    /**
     * @zh 是否启用平滑校正（帧同步通常关闭）
     * @en Enable smooth reconciliation (usually disabled for lockstep)
     */
    enableSmoothReconciliation: boolean;

    /**
     * @zh 平滑校正速度（定点数）
     * @en Smooth reconciliation speed (fixed-point)
     */
    reconciliationSpeed: Fixed32;
}

// =============================================================================
// 定点数客户端预测管理器 | Fixed Client Prediction Manager
// =============================================================================

/**
 * @zh 定点数客户端预测管理器
 * @en Fixed-point client prediction manager
 *
 * @zh 提供确定性的客户端预测和服务器状态回滚校正
 * @en Provides deterministic client prediction and server state rollback reconciliation
 */
export class FixedClientPrediction<TState, TInput> {
    private readonly _predictor: IFixedPredictor<TState, TInput>;
    private readonly _config: FixedClientPredictionConfig;
    private readonly _pendingInputs: IFixedInputSnapshot<TInput>[] = [];
    private _lastAcknowledgedFrame: number = 0;
    private _currentFrame: number = 0;
    private _lastServerState: TState | null = null;
    private _predictedState: TState | null = null;
    private _correctionOffset: FixedVector2 = FixedVector2.ZERO;
    private _stateHistory: Map<number, TState> = new Map();
    private readonly _maxHistorySize: number = 120;

    constructor(
        predictor: IFixedPredictor<TState, TInput>,
        config?: Partial<FixedClientPredictionConfig>
    ) {
        this._predictor = predictor;
        this._config = {
            maxUnacknowledgedInputs: 60,
            fixedDeltaTime: Fixed32.from(1 / 60),
            reconciliationThreshold: Fixed32.from(0.001),
            enableSmoothReconciliation: false,
            reconciliationSpeed: Fixed32.from(10),
            ...config
        };
    }

    /**
     * @zh 获取当前预测状态
     * @en Get current predicted state
     */
    get predictedState(): TState | null {
        return this._predictedState;
    }

    /**
     * @zh 获取校正偏移（用于渲染平滑）
     * @en Get correction offset (for render smoothing)
     */
    get correctionOffset(): FixedVector2 {
        return this._correctionOffset;
    }

    /**
     * @zh 获取待确认输入数量
     * @en Get pending input count
     */
    get pendingInputCount(): number {
        return this._pendingInputs.length;
    }

    /**
     * @zh 获取当前帧号
     * @en Get current frame number
     */
    get currentFrame(): number {
        return this._currentFrame;
    }

    /**
     * @zh 获取最后确认帧号
     * @en Get last acknowledged frame
     */
    get lastAcknowledgedFrame(): number {
        return this._lastAcknowledgedFrame;
    }

    /**
     * @zh 记录并预测输入
     * @en Record and predict input
     *
     * @param input - @zh 输入数据 @en Input data
     * @param currentState - @zh 当前状态 @en Current state
     * @returns @zh 预测的状态 @en Predicted state
     */
    recordInput(input: TInput, currentState: TState): TState {
        this._currentFrame++;

        const inputSnapshot: IFixedInputSnapshot<TInput> = {
            frame: this._currentFrame,
            input
        };

        this._pendingInputs.push(inputSnapshot);

        while (this._pendingInputs.length > this._config.maxUnacknowledgedInputs) {
            this._pendingInputs.shift();
        }

        this._predictedState = this._predictor.predict(
            currentState,
            input,
            this._config.fixedDeltaTime
        );

        this._stateHistory.set(this._currentFrame, this._predictedState);
        this._cleanupHistory();

        return this._predictedState;
    }

    /**
     * @zh 获取指定帧的输入
     * @en Get input at specific frame
     */
    getInputAtFrame(frame: number): IFixedInputSnapshot<TInput> | null {
        return this._pendingInputs.find(i => i.frame === frame) ?? null;
    }

    /**
     * @zh 获取所有待确认输入
     * @en Get all pending inputs
     */
    getPendingInputs(): readonly IFixedInputSnapshot<TInput>[] {
        return this._pendingInputs;
    }

    /**
     * @zh 处理服务器状态并进行回滚校正
     * @en Process server state and perform rollback reconciliation
     *
     * @param serverState - @zh 服务器权威状态 @en Server authoritative state
     * @param serverFrame - @zh 服务器状态对应的帧号 @en Server state frame number
     * @param positionExtractor - @zh 状态位置提取器 @en State position extractor
     * @returns @zh 校正后的状态 @en Reconciled state
     */
    reconcile(
        serverState: TState,
        serverFrame: number,
        positionExtractor: IFixedStatePositionExtractor<TState>
    ): TState {
        this._lastServerState = serverState;
        this._lastAcknowledgedFrame = serverFrame;

        while (this._pendingInputs.length > 0 && this._pendingInputs[0].frame <= serverFrame) {
            this._pendingInputs.shift();
        }

        const localStateAtServerFrame = this._stateHistory.get(serverFrame);

        if (localStateAtServerFrame) {
            const serverPos = positionExtractor.getPosition(serverState);
            const localPos = positionExtractor.getPosition(localStateAtServerFrame);
            const error = serverPos.sub(localPos);
            const errorMagnitude = error.length();

            if (errorMagnitude.gt(this._config.reconciliationThreshold)) {
                if (this._config.enableSmoothReconciliation) {
                    const t = Fixed32.min(
                        Fixed32.ONE,
                        this._config.reconciliationSpeed.mul(this._config.fixedDeltaTime)
                    );
                    this._correctionOffset = this._correctionOffset.add(error.mul(t));

                    const decayRate = Fixed32.from(0.9);
                    this._correctionOffset = this._correctionOffset.mul(decayRate);
                } else {
                    this._correctionOffset = FixedVector2.ZERO;
                }

                let state = serverState;
                for (const inputSnapshot of this._pendingInputs) {
                    state = this._predictor.predict(
                        state,
                        inputSnapshot.input,
                        this._config.fixedDeltaTime
                    );
                    this._stateHistory.set(inputSnapshot.frame, state);
                }
                this._predictedState = state;

                return state;
            }
        }

        let state = serverState;
        for (const inputSnapshot of this._pendingInputs) {
            state = this._predictor.predict(
                state,
                inputSnapshot.input,
                this._config.fixedDeltaTime
            );
        }
        this._predictedState = state;

        return state;
    }

    /**
     * @zh 回滚到指定帧并重新模拟
     * @en Rollback to specific frame and re-simulate
     *
     * @param targetFrame - @zh 目标帧号 @en Target frame number
     * @param authoritativeState - @zh 权威状态 @en Authoritative state
     * @returns @zh 重新模拟后的当前状态 @en Re-simulated current state
     */
    rollbackAndResimulate(targetFrame: number, authoritativeState: TState): TState {
        this._stateHistory.set(targetFrame, authoritativeState);

        let state = authoritativeState;
        const inputsToResimulate = this._pendingInputs.filter(i => i.frame > targetFrame);

        for (const inputSnapshot of inputsToResimulate) {
            state = this._predictor.predict(
                state,
                inputSnapshot.input,
                this._config.fixedDeltaTime
            );
            this._stateHistory.set(inputSnapshot.frame, state);
        }

        this._predictedState = state;
        return state;
    }

    /**
     * @zh 获取历史状态
     * @en Get historical state
     */
    getStateAtFrame(frame: number): TState | null {
        return this._stateHistory.get(frame) ?? null;
    }

    /**
     * @zh 清空预测状态
     * @en Clear prediction state
     */
    clear(): void {
        this._pendingInputs.length = 0;
        this._lastAcknowledgedFrame = 0;
        this._currentFrame = 0;
        this._lastServerState = null;
        this._predictedState = null;
        this._correctionOffset = FixedVector2.ZERO;
        this._stateHistory.clear();
    }

    private _cleanupHistory(): void {
        if (this._stateHistory.size > this._maxHistorySize) {
            const sortedFrames = Array.from(this._stateHistory.keys()).sort((a, b) => a - b);
            const framesToRemove = sortedFrames.slice(
                0,
                this._stateHistory.size - this._maxHistorySize
            );
            for (const frame of framesToRemove) {
                this._stateHistory.delete(frame);
            }
        }
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建定点数客户端预测管理器
 * @en Create fixed-point client prediction manager
 */
export function createFixedClientPrediction<TState, TInput>(
    predictor: IFixedPredictor<TState, TInput>,
    config?: Partial<FixedClientPredictionConfig>
): FixedClientPrediction<TState, TInput> {
    return new FixedClientPrediction(predictor, config);
}

// =============================================================================
// 预设预测器 | Preset Predictors
// =============================================================================

/**
 * @zh 移动输入类型
 * @en Movement input type
 */
export interface IFixedMovementInput {
    /**
     * @zh X方向输入 (-1, 0, 1)
     * @en X direction input (-1, 0, 1)
     */
    readonly dx: number;

    /**
     * @zh Y方向输入 (-1, 0, 1)
     * @en Y direction input (-1, 0, 1)
     */
    readonly dy: number;
}

/**
 * @zh 移动状态类型
 * @en Movement state type
 */
export interface IFixedMovementState {
    /**
     * @zh 位置
     * @en Position
     */
    readonly position: FixedVector2;

    /**
     * @zh 速度
     * @en Velocity
     */
    readonly velocity: FixedVector2;
}

/**
 * @zh 创建简单移动预测器
 * @en Create simple movement predictor
 *
 * @param speed - @zh 移动速度（定点数）@en Movement speed (fixed-point)
 */
export function createFixedMovementPredictor(
    speed: Fixed32
): IFixedPredictor<IFixedMovementState, IFixedMovementInput> {
    return {
        predict(
            state: IFixedMovementState,
            input: IFixedMovementInput,
            deltaTime: Fixed32
        ): IFixedMovementState {
            const inputVec = FixedVector2.from(input.dx, input.dy);
            const normalizedInput =
                inputVec.lengthSquared().gt(Fixed32.ZERO) ? inputVec.normalize() : inputVec;

            const velocity = normalizedInput.mul(speed);
            const displacement = velocity.mul(deltaTime);
            const newPosition = state.position.add(displacement);

            return {
                position: newPosition,
                velocity
            };
        }
    };
}

/**
 * @zh 创建移动状态位置提取器
 * @en Create movement state position extractor
 */
export function createFixedMovementPositionExtractor(): IFixedStatePositionExtractor<IFixedMovementState> {
    return {
        getPosition(state: IFixedMovementState): FixedVector2 {
            return state.position;
        }
    };
}
