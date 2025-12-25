/**
 * @zh 定时器服务令牌
 * @en Timer Service Tokens
 */

import { createServiceToken } from '@esengine/ecs-framework';
import type { ITimerService } from './ITimerService';

/**
 * @zh 定时器服务令牌
 * @en Timer service token
 *
 * @zh 用于注入定时器服务
 * @en Used for injecting timer service
 */
export const TimerServiceToken = createServiceToken<ITimerService>('timerService');
