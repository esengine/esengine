/**
 * @zh 状态机服务令牌
 * @en State Machine Service Tokens
 */

import { createServiceToken } from '@esengine/ecs-framework';
import type { IStateMachine } from './IStateMachine';

/**
 * @zh 状态机服务令牌
 * @en State machine service token
 *
 * @zh 用于注入状态机服务
 * @en Used for injecting state machine service
 */
export const StateMachineToken = createServiceToken<IStateMachine<string, unknown>>('stateMachine');
