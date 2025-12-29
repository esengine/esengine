/**
 * @zh 速率限制装饰器
 * @en Rate limit decorators
 */

import type { MessageRateLimitConfig, RateLimitMetadata } from '../types.js';

/**
 * @zh 速率限制元数据存储键
 * @en Rate limit metadata storage key
 */
export const RATE_LIMIT_METADATA_KEY = Symbol('rateLimitMetadata');

/**
 * @zh 获取速率限制元数据
 * @en Get rate limit metadata
 *
 * @param target - @zh 目标对象 @en Target object
 * @param messageType - @zh 消息类型 @en Message type
 * @returns @zh 元数据 @en Metadata
 */
export function getRateLimitMetadata(target: any, messageType: string): RateLimitMetadata | undefined {
    const metadataMap = target[RATE_LIMIT_METADATA_KEY] as Map<string, RateLimitMetadata> | undefined;
    return metadataMap?.get(messageType);
}

/**
 * @zh 设置速率限制元数据
 * @en Set rate limit metadata
 *
 * @param target - @zh 目标对象 @en Target object
 * @param messageType - @zh 消息类型 @en Message type
 * @param metadata - @zh 元数据 @en Metadata
 */
function setRateLimitMetadata(target: any, messageType: string, metadata: RateLimitMetadata): void {
    if (!target[RATE_LIMIT_METADATA_KEY]) {
        target[RATE_LIMIT_METADATA_KEY] = new Map<string, RateLimitMetadata>();
    }
    const metadataMap = target[RATE_LIMIT_METADATA_KEY] as Map<string, RateLimitMetadata>;
    const existing = metadataMap.get(messageType) ?? { enabled: true };
    metadataMap.set(messageType, { ...existing, ...metadata });
}

/**
 * @zh 从方法获取消息类型
 * @en Get message type from method
 *
 * @zh 通过查找 onMessage 装饰器设置的元数据来获取消息类型
 * @en Gets message type by looking up metadata set by onMessage decorator
 */
function getMessageTypeFromMethod(target: any, methodName: string): string | undefined {
    const messageHandlers = Symbol.for('messageHandlers');

    for (const sym of Object.getOwnPropertySymbols(target.constructor)) {
        const desc = Object.getOwnPropertyDescriptor(target.constructor, sym);
        if (desc?.value && Array.isArray(desc.value)) {
            for (const handler of desc.value) {
                if (handler.method === methodName) {
                    return handler.type;
                }
            }
        }
    }

    const handlers = target.constructor[Symbol.for('messageHandlers')] as { type: string; method: string }[] | undefined;
    if (handlers) {
        for (const handler of handlers) {
            if (handler.method === methodName) {
                return handler.type;
            }
        }
    }

    return undefined;
}

/**
 * @zh 速率限制装饰器
 * @en Rate limit decorator
 *
 * @zh 为消息处理器设置独立的速率限制配置
 * @en Set independent rate limit configuration for message handler
 *
 * @example
 * ```typescript
 * class GameRoom extends withRateLimit(Room) {
 *     @rateLimit({ messagesPerSecond: 1, burstSize: 2 })
 *     @onMessage('Trade')
 *     handleTrade(data: TradeData, player: Player) {
 *         // This message has stricter rate limit
 *     }
 *
 *     @rateLimit({ cost: 5 })
 *     @onMessage('ExpensiveAction')
 *     handleExpensiveAction(data: any, player: Player) {
 *         // This message consumes 5 tokens
 *     }
 * }
 * ```
 */
export function rateLimit(config?: MessageRateLimitConfig): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        const methodName = String(propertyKey);

        queueMicrotask(() => {
            const msgType = getMessageTypeFromMethod(target, methodName);
            if (msgType) {
                setRateLimitMetadata(target, msgType, {
                    enabled: true,
                    config
                });
            }
        });

        const metadata: RateLimitMetadata = {
            enabled: true,
            config
        };

        if (!target.hasOwnProperty(RATE_LIMIT_METADATA_KEY)) {
            Object.defineProperty(target, RATE_LIMIT_METADATA_KEY, {
                value: new Map<string, RateLimitMetadata>(),
                writable: false,
                enumerable: false
            });
        }

        return descriptor;
    };
}

/**
 * @zh 豁免速率限制装饰器
 * @en Exempt from rate limit decorator
 *
 * @zh 标记消息处理器不受速率限制
 * @en Mark message handler as exempt from rate limit
 *
 * @example
 * ```typescript
 * class GameRoom extends withRateLimit(Room) {
 *     @noRateLimit()
 *     @onMessage('Heartbeat')
 *     handleHeartbeat(data: any, player: Player) {
 *         // This message is not rate limited
 *     }
 *
 *     @noRateLimit()
 *     @onMessage('Ping')
 *     handlePing(data: any, player: Player) {
 *         player.send('Pong', {});
 *     }
 * }
 * ```
 */
export function noRateLimit(): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        const methodName = String(propertyKey);

        queueMicrotask(() => {
            const msgType = getMessageTypeFromMethod(target, methodName);
            if (msgType) {
                setRateLimitMetadata(target, msgType, {
                    enabled: false,
                    exempt: true
                });
            }
        });

        return descriptor;
    };
}

/**
 * @zh 速率限制消息装饰器（直接指定消息类型）
 * @en Rate limit message decorator (directly specify message type)
 *
 * @zh 当无法自动获取消息类型时使用此装饰器
 * @en Use this decorator when message type cannot be obtained automatically
 *
 * @example
 * ```typescript
 * class GameRoom extends withRateLimit(Room) {
 *     @rateLimitMessage('Trade', { messagesPerSecond: 1 })
 *     @onMessage('Trade')
 *     handleTrade(data: TradeData, player: Player) {
 *         // Explicitly rate limited
 *     }
 * }
 * ```
 */
export function rateLimitMessage(
    messageType: string,
    config?: MessageRateLimitConfig
): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        setRateLimitMetadata(target, messageType, {
            enabled: true,
            config
        });

        return descriptor;
    };
}

/**
 * @zh 豁免速率限制消息装饰器（直接指定消息类型）
 * @en Exempt rate limit message decorator (directly specify message type)
 *
 * @example
 * ```typescript
 * class GameRoom extends withRateLimit(Room) {
 *     @noRateLimitMessage('Heartbeat')
 *     @onMessage('Heartbeat')
 *     handleHeartbeat(data: any, player: Player) {
 *         // Explicitly exempted
 *     }
 * }
 * ```
 */
export function noRateLimitMessage(messageType: string): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        setRateLimitMetadata(target, messageType, {
            enabled: false,
            exempt: true
        });

        return descriptor;
    };
}
