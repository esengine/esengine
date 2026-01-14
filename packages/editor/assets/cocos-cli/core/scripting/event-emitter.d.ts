import { EventEmitter } from 'events';
export type EventType = 'pack-build-end' | 'pack-build-start' | 'compiled' | 'compile-start';
/**
 * 用于事件派发
 */
export declare class CustomEvent extends EventEmitter {
    on(type: EventType, listener: (...arg: any[]) => void): this;
    off(type: EventType, listener: (...arg: any[]) => void): this;
    once(type: EventType, listener: (...arg: any[]) => void): this;
    emit(type: EventType, ...arg: any[]): boolean;
}
export declare const eventEmitter: CustomEvent;
