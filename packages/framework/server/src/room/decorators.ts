/**
 * @zh 房间装饰器
 * @en Room decorators
 */

import { registerMessageHandler } from './Room.js';

/**
 * @zh 消息处理器装饰器
 * @en Message handler decorator
 *
 * @example
 * ```typescript
 * class GameRoom extends Room {
 *     @onMessage('Move')
 *     handleMove(data: { x: number, y: number }, player: Player) {
 *         // handle move
 *     }
 *
 *     @onMessage('Chat')
 *     handleChat(data: { text: string }, player: Player) {
 *         this.broadcast('Chat', { from: player.id, text: data.text })
 *     }
 * }
 * ```
 */
export function onMessage(type: string): MethodDecorator {
    return function (
        target: any,
        propertyKey: string | symbol,
        _descriptor: PropertyDescriptor
    ) {
        registerMessageHandler(target.constructor, type, propertyKey as string);
    };
}
