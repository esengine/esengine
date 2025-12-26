/**
 * @zh 客户端预测
 * @en Client Prediction
 *
 * @zh 提供客户端输入预测和服务器校正
 * @en Provides client-side input prediction and server reconciliation
 */

// =============================================================================
// 输入快照接口 | Input Snapshot Interface
// =============================================================================

/**
 * @zh 输入快照
 * @en Input snapshot
 */
export interface IInputSnapshot<TInput> {
    /**
     * @zh 输入序列号
     * @en Input sequence number
     */
    readonly sequence: number;

    /**
     * @zh 输入数据
     * @en Input data
     */
    readonly input: TInput;

    /**
     * @zh 输入时间戳
     * @en Input timestamp
     */
    readonly timestamp: number;
}

/**
 * @zh 预测状态
 * @en Predicted state
 */
export interface IPredictedState<TState> {
    /**
     * @zh 状态数据
     * @en State data
     */
    readonly state: TState;

    /**
     * @zh 对应的输入序列号
     * @en Corresponding input sequence number
     */
    readonly sequence: number;
}

// =============================================================================
// 预测器接口 | Predictor Interface
// =============================================================================

/**
 * @zh 状态预测器接口
 * @en State predictor interface
 */
export interface IPredictor<TState, TInput> {
    /**
     * @zh 根据当前状态和输入预测下一状态
     * @en Predict next state based on current state and input
     *
     * @param state - @zh 当前状态 @en Current state
     * @param input - @zh 输入 @en Input
     * @param deltaTime - @zh 时间间隔 @en Delta time
     * @returns @zh 预测的状态 @en Predicted state
     */
    predict(state: TState, input: TInput, deltaTime: number): TState;
}

// =============================================================================
// 客户端预测管理器 | Client Prediction Manager
// =============================================================================

/**
 * @zh 客户端预测配置
 * @en Client prediction configuration
 */
export interface ClientPredictionConfig {
    /**
     * @zh 最大未确认输入数量
     * @en Maximum unacknowledged inputs
     */
    maxUnacknowledgedInputs: number;

    /**
     * @zh 校正阈值（超过此值才进行平滑校正）
     * @en Reconciliation threshold (smooth correction only above this value)
     */
    reconciliationThreshold: number;

    /**
     * @zh 校正平滑速度
     * @en Reconciliation smoothing speed
     */
    reconciliationSpeed: number;
}

/**
 * @zh 客户端预测管理器
 * @en Client prediction manager
 */
export class ClientPrediction<TState, TInput> {
    private readonly _predictor: IPredictor<TState, TInput>;
    private readonly _config: ClientPredictionConfig;
    private readonly _pendingInputs: IInputSnapshot<TInput>[] = [];
    private _lastAcknowledgedSequence: number = 0;
    private _currentSequence: number = 0;
    private _lastServerState: TState | null = null;
    private _predictedState: TState | null = null;
    private _correctionOffset: { x: number; y: number } = { x: 0, y: 0 };

    constructor(predictor: IPredictor<TState, TInput>, config?: Partial<ClientPredictionConfig>) {
        this._predictor = predictor;
        this._config = {
            maxUnacknowledgedInputs: 60,
            reconciliationThreshold: 0.1,
            reconciliationSpeed: 10,
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
     * @zh 获取校正偏移
     * @en Get correction offset
     */
    get correctionOffset(): { x: number; y: number } {
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
     * @zh 记录并预测输入
     * @en Record and predict input
     *
     * @param input - @zh 输入数据 @en Input data
     * @param currentState - @zh 当前状态 @en Current state
     * @param deltaTime - @zh 时间间隔 @en Delta time
     * @returns @zh 预测的状态 @en Predicted state
     */
    recordInput(input: TInput, currentState: TState, deltaTime: number): TState {
        this._currentSequence++;

        const inputSnapshot: IInputSnapshot<TInput> = {
            sequence: this._currentSequence,
            input,
            timestamp: Date.now()
        };

        this._pendingInputs.push(inputSnapshot);

        // Remove old inputs if buffer is full
        while (this._pendingInputs.length > this._config.maxUnacknowledgedInputs) {
            this._pendingInputs.shift();
        }

        // Predict new state
        this._predictedState = this._predictor.predict(currentState, input, deltaTime);

        return this._predictedState;
    }

    /**
     * @zh 获取下一个要发送的输入
     * @en Get next input to send
     */
    getInputToSend(): IInputSnapshot<TInput> | null {
        return this._pendingInputs.length > 0 ? this._pendingInputs[this._pendingInputs.length - 1] : null;
    }

    /**
     * @zh 获取当前序列号
     * @en Get current sequence number
     */
    get currentSequence(): number {
        return this._currentSequence;
    }

    /**
     * @zh 处理服务器状态并进行校正
     * @en Process server state and reconcile
     *
     * @param serverState - @zh 服务器状态 @en Server state
     * @param acknowledgedSequence - @zh 已确认的输入序列号 @en Acknowledged input sequence
     * @param stateGetter - @zh 获取状态位置的函数 @en Function to get state position
     * @param deltaTime - @zh 帧时间 @en Frame delta time
     */
    reconcile(
        serverState: TState,
        acknowledgedSequence: number,
        stateGetter: (state: TState) => { x: number; y: number },
        deltaTime: number
    ): TState {
        this._lastServerState = serverState;
        this._lastAcknowledgedSequence = acknowledgedSequence;

        // Remove acknowledged inputs
        while (this._pendingInputs.length > 0 && this._pendingInputs[0].sequence <= acknowledgedSequence) {
            this._pendingInputs.shift();
        }

        // Re-predict from server state using unacknowledged inputs
        let state = serverState;
        for (const inputSnapshot of this._pendingInputs) {
            state = this._predictor.predict(state, inputSnapshot.input, deltaTime);
        }

        // Calculate error
        const serverPos = stateGetter(serverState);
        const predictedPos = stateGetter(state);
        const errorX = serverPos.x - predictedPos.x;
        const errorY = serverPos.y - predictedPos.y;
        const errorMagnitude = Math.sqrt(errorX * errorX + errorY * errorY);

        // Apply correction
        if (errorMagnitude > this._config.reconciliationThreshold) {
            // Smooth correction over time
            const t = Math.min(1, this._config.reconciliationSpeed * deltaTime);
            this._correctionOffset.x += errorX * t;
            this._correctionOffset.y += errorY * t;
        }

        // Decay correction offset
        const decayRate = 0.9;
        this._correctionOffset.x *= decayRate;
        this._correctionOffset.y *= decayRate;

        this._predictedState = state;
        return state;
    }

    /**
     * @zh 清空预测状态
     * @en Clear prediction state
     */
    clear(): void {
        this._pendingInputs.length = 0;
        this._lastAcknowledgedSequence = 0;
        this._currentSequence = 0;
        this._lastServerState = null;
        this._predictedState = null;
        this._correctionOffset = { x: 0, y: 0 };
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建客户端预测管理器
 * @en Create client prediction manager
 */
export function createClientPrediction<TState, TInput>(
    predictor: IPredictor<TState, TInput>,
    config?: Partial<ClientPredictionConfig>
): ClientPrediction<TState, TInput> {
    return new ClientPrediction(predictor, config);
}
