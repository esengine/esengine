/**
 * @zh 日志模块 - 直接使用 @esengine/ecs-framework 的 Logger
 * @en Logger module - Uses @esengine/ecs-framework Logger directly
 */

import { createLogger as ecsCreateLogger, type ILogger } from '@esengine/ecs-framework';

export type { ILogger };

/**
 * @zh 创建命名日志器
 * @en Create a named logger
 *
 * @param name - @zh 日志器名称 @en Logger name
 * @returns @zh 日志器实例 @en Logger instance
 *
 * @example
 * ```typescript
 * import { createLogger } from './logger.js'
 *
 * const logger = createLogger('Server')
 * logger.info('Started on port 3000')
 * logger.error('Connection failed:', error)
 * ```
 */
export function createLogger(name: string): ILogger {
    return ecsCreateLogger(name);
}

/**
 * @zh 默认服务器日志器
 * @en Default server logger
 */
export const serverLogger = createLogger('Server');
