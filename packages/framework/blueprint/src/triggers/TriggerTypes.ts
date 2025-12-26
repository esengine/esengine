/**
 * @zh 蓝图触发器类型定义
 * @en Blueprint Trigger Type Definitions
 *
 * @zh 定义触发器的核心类型和接口
 * @en Defines core types and interfaces for triggers
 */

// =============================================================================
// 触发器类型 | Trigger Types
// =============================================================================

/**
 * @zh 触发器类型枚举
 * @en Trigger type enumeration
 */
export type TriggerType =
    | 'tick'        // 每帧触发 | Every frame
    | 'input'       // 输入事件 | Input event
    | 'collision'   // 碰撞事件 | Collision event
    | 'message'     // 消息事件 | Message event
    | 'timer'       // 定时器事件 | Timer event
    | 'stateEnter'  // 状态进入 | State enter
    | 'stateExit'   // 状态退出 | State exit
    | 'custom';     // 自定义事件 | Custom event

/**
 * @zh 触发器类型常量
 * @en Trigger type constants
 */
export const TriggerTypes = {
    TICK: 'tick' as const,
    INPUT: 'input' as const,
    COLLISION: 'collision' as const,
    MESSAGE: 'message' as const,
    TIMER: 'timer' as const,
    STATE_ENTER: 'stateEnter' as const,
    STATE_EXIT: 'stateExit' as const,
    CUSTOM: 'custom' as const
} as const;

// =============================================================================
// 触发器上下文 | Trigger Context
// =============================================================================

/**
 * @zh 触发器上下文基础接口
 * @en Trigger context base interface
 */
export interface ITriggerContext {
    /**
     * @zh 触发器类型
     * @en Trigger type
     */
    readonly type: TriggerType;

    /**
     * @zh 触发时间戳
     * @en Trigger timestamp
     */
    readonly timestamp: number;

    /**
     * @zh 触发源实体 ID
     * @en Source entity ID
     */
    readonly sourceEntityId?: string;

    /**
     * @zh 附加数据
     * @en Additional data
     */
    readonly data?: Record<string, unknown>;
}

/**
 * @zh Tick 触发器上下文
 * @en Tick trigger context
 */
export interface ITickTriggerContext extends ITriggerContext {
    readonly type: 'tick';
    /**
     * @zh 增量时间（秒）
     * @en Delta time (seconds)
     */
    readonly deltaTime: number;
    /**
     * @zh 帧计数
     * @en Frame count
     */
    readonly frameCount: number;
}

/**
 * @zh 输入触发器上下文
 * @en Input trigger context
 */
export interface IInputTriggerContext extends ITriggerContext {
    readonly type: 'input';
    /**
     * @zh 输入动作名称
     * @en Input action name
     */
    readonly action: string;
    /**
     * @zh 输入值
     * @en Input value
     */
    readonly value: number | boolean;
    /**
     * @zh 是否刚按下
     * @en Is just pressed
     */
    readonly pressed?: boolean;
    /**
     * @zh 是否刚释放
     * @en Is just released
     */
    readonly released?: boolean;
}

/**
 * @zh 碰撞触发器上下文
 * @en Collision trigger context
 */
export interface ICollisionTriggerContext extends ITriggerContext {
    readonly type: 'collision';
    /**
     * @zh 碰撞的另一个实体 ID
     * @en Other entity ID in collision
     */
    readonly otherEntityId: string;
    /**
     * @zh 碰撞点
     * @en Collision point
     */
    readonly point?: { x: number; y: number };
    /**
     * @zh 碰撞法线
     * @en Collision normal
     */
    readonly normal?: { x: number; y: number };
    /**
     * @zh 是否开始碰撞
     * @en Is collision start
     */
    readonly isEnter: boolean;
    /**
     * @zh 是否结束碰撞
     * @en Is collision end
     */
    readonly isExit: boolean;
}

/**
 * @zh 消息触发器上下文
 * @en Message trigger context
 */
export interface IMessageTriggerContext extends ITriggerContext {
    readonly type: 'message';
    /**
     * @zh 消息名称
     * @en Message name
     */
    readonly messageName: string;
    /**
     * @zh 发送者 ID
     * @en Sender ID
     */
    readonly senderId?: string;
    /**
     * @zh 消息负载
     * @en Message payload
     */
    readonly payload?: unknown;
}

/**
 * @zh 定时器触发器上下文
 * @en Timer trigger context
 */
export interface ITimerTriggerContext extends ITriggerContext {
    readonly type: 'timer';
    /**
     * @zh 定时器 ID
     * @en Timer ID
     */
    readonly timerId: string;
    /**
     * @zh 是否循环触发
     * @en Is repeating
     */
    readonly isRepeating: boolean;
    /**
     * @zh 已触发次数
     * @en Times fired
     */
    readonly timesFired: number;
}

/**
 * @zh 状态触发器上下文
 * @en State trigger context
 */
export interface IStateTriggerContext extends ITriggerContext {
    readonly type: 'stateEnter' | 'stateExit';
    /**
     * @zh 状态机 ID
     * @en State machine ID
     */
    readonly stateMachineId: string;
    /**
     * @zh 当前状态
     * @en Current state
     */
    readonly currentState: string;
    /**
     * @zh 之前状态
     * @en Previous state
     */
    readonly previousState?: string;
}

/**
 * @zh 自定义触发器上下文
 * @en Custom trigger context
 */
export interface ICustomTriggerContext extends ITriggerContext {
    readonly type: 'custom';
    /**
     * @zh 事件名称
     * @en Event name
     */
    readonly eventName: string;
}

/**
 * @zh 所有触发器上下文的联合类型
 * @en Union type of all trigger contexts
 */
export type TriggerContext =
    | ITickTriggerContext
    | IInputTriggerContext
    | ICollisionTriggerContext
    | IMessageTriggerContext
    | ITimerTriggerContext
    | IStateTriggerContext
    | ICustomTriggerContext;

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建 Tick 触发器上下文
 * @en Create tick trigger context
 */
export function createTickContext(
    deltaTime: number,
    frameCount: number,
    sourceEntityId?: string
): ITickTriggerContext {
    return {
        type: 'tick',
        timestamp: Date.now(),
        deltaTime,
        frameCount,
        sourceEntityId
    };
}

/**
 * @zh 创建输入触发器上下文
 * @en Create input trigger context
 */
export function createInputContext(
    action: string,
    value: number | boolean,
    options?: {
        pressed?: boolean;
        released?: boolean;
        sourceEntityId?: string;
    }
): IInputTriggerContext {
    return {
        type: 'input',
        timestamp: Date.now(),
        action,
        value,
        pressed: options?.pressed,
        released: options?.released,
        sourceEntityId: options?.sourceEntityId
    };
}

/**
 * @zh 创建碰撞触发器上下文
 * @en Create collision trigger context
 */
export function createCollisionContext(
    otherEntityId: string,
    isEnter: boolean,
    options?: {
        point?: { x: number; y: number };
        normal?: { x: number; y: number };
        sourceEntityId?: string;
    }
): ICollisionTriggerContext {
    return {
        type: 'collision',
        timestamp: Date.now(),
        otherEntityId,
        isEnter,
        isExit: !isEnter,
        point: options?.point,
        normal: options?.normal,
        sourceEntityId: options?.sourceEntityId
    };
}

/**
 * @zh 创建消息触发器上下文
 * @en Create message trigger context
 */
export function createMessageContext(
    messageName: string,
    payload?: unknown,
    options?: {
        senderId?: string;
        sourceEntityId?: string;
    }
): IMessageTriggerContext {
    return {
        type: 'message',
        timestamp: Date.now(),
        messageName,
        payload,
        senderId: options?.senderId,
        sourceEntityId: options?.sourceEntityId
    };
}

/**
 * @zh 创建定时器触发器上下文
 * @en Create timer trigger context
 */
export function createTimerContext(
    timerId: string,
    isRepeating: boolean,
    timesFired: number,
    sourceEntityId?: string
): ITimerTriggerContext {
    return {
        type: 'timer',
        timestamp: Date.now(),
        timerId,
        isRepeating,
        timesFired,
        sourceEntityId
    };
}

/**
 * @zh 创建状态触发器上下文
 * @en Create state trigger context
 */
export function createStateContext(
    type: 'stateEnter' | 'stateExit',
    stateMachineId: string,
    currentState: string,
    previousState?: string,
    sourceEntityId?: string
): IStateTriggerContext {
    return {
        type,
        timestamp: Date.now(),
        stateMachineId,
        currentState,
        previousState,
        sourceEntityId
    };
}

/**
 * @zh 创建自定义触发器上下文
 * @en Create custom trigger context
 */
export function createCustomContext(
    eventName: string,
    data?: Record<string, unknown>,
    sourceEntityId?: string
): ICustomTriggerContext {
    return {
        type: 'custom',
        timestamp: Date.now(),
        eventName,
        data,
        sourceEntityId
    };
}
