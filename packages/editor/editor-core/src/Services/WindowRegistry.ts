import { createLogger, type ILogger, type IService } from '@esengine/ecs-framework';
import type { ComponentType } from 'react';
import { createRegistryToken } from './BaseRegistry';

/**
 * @zh 窗口描述符
 * @en Window descriptor
 */
export interface WindowDescriptor {
    /** @zh 窗口唯一标识 @en Unique window ID */
    id: string;
    /** @zh 窗口组件 @en Window component */
    component: ComponentType<unknown>;
    /** @zh 窗口标题 @en Window title */
    title?: string;
    /** @zh 默认宽度 @en Default width */
    defaultWidth?: number;
    /** @zh 默认高度 @en Default height */
    defaultHeight?: number;
}

/**
 * @zh 窗口实例
 * @en Window instance
 */
export interface WindowInstance {
    /** @zh 窗口描述符 @en Window descriptor */
    descriptor: WindowDescriptor;
    /** @zh 是否打开 @en Whether the window is open */
    isOpen: boolean;
    /** @zh 窗口参数 @en Window parameters */
    params?: Record<string, unknown>;
}

/**
 * @zh 窗口注册表服务 - 管理插件注册的窗口组件
 * @en Window Registry Service - Manages plugin-registered window components
 */
export class WindowRegistry implements IService {
    private readonly _windows = new Map<string, WindowDescriptor>();
    private readonly _openWindows = new Map<string, WindowInstance>();
    private readonly _listeners = new Set<() => void>();
    private readonly _logger: ILogger;

    constructor() {
        this._logger = createLogger('WindowRegistry');
    }

    /**
     * @zh 注册窗口
     * @en Register a window
     */
    registerWindow(descriptor: WindowDescriptor): void {
        if (this._windows.has(descriptor.id)) {
            this._logger.warn(`Window already registered: ${descriptor.id}`);
            return;
        }
        this._windows.set(descriptor.id, descriptor);
        this._logger.debug(`Registered window: ${descriptor.id}`);
    }

    /**
     * @zh 取消注册窗口
     * @en Unregister a window
     */
    unregisterWindow(windowId: string): void {
        this._windows.delete(windowId);
        this._openWindows.delete(windowId);
        this._notifyListeners();
        this._logger.debug(`Unregistered window: ${windowId}`);
    }

    /** @zh 获取窗口描述符 @en Get window descriptor */
    getWindow(windowId: string): WindowDescriptor | undefined {
        return this._windows.get(windowId);
    }

    /** @zh 获取所有窗口描述符 @en Get all window descriptors */
    getAllWindows(): WindowDescriptor[] {
        return Array.from(this._windows.values());
    }

    /**
     * @zh 打开窗口
     * @en Open a window
     */
    openWindow(windowId: string, params?: Record<string, unknown>): void {
        const descriptor = this._windows.get(windowId);
        if (!descriptor) {
            this._logger.warn(`Window not registered: ${windowId}`);
            return;
        }

        this._openWindows.set(windowId, {
            descriptor,
            isOpen: true,
            params
        });
        this._notifyListeners();
        this._logger.debug(`Opened window: ${windowId}`);
    }

    /**
     * @zh 关闭窗口
     * @en Close a window
     */
    closeWindow(windowId: string): void {
        this._openWindows.delete(windowId);
        this._notifyListeners();
        this._logger.debug(`Closed window: ${windowId}`);
    }

    /** @zh 获取打开的窗口实例 @en Get open window instance */
    getOpenWindow(windowId: string): WindowInstance | undefined {
        return this._openWindows.get(windowId);
    }

    /** @zh 获取所有打开的窗口 @en Get all open windows */
    getAllOpenWindows(): WindowInstance[] {
        return Array.from(this._openWindows.values());
    }

    /** @zh 检查窗口是否打开 @en Check if window is open */
    isWindowOpen(windowId: string): boolean {
        return this._openWindows.has(windowId);
    }

    /**
     * @zh 添加变化监听器
     * @en Add change listener
     * @returns @zh 取消订阅函数 @en Unsubscribe function
     */
    addListener(listener: () => void): () => void {
        this._listeners.add(listener);
        return () => {
            this._listeners.delete(listener);
        };
    }

    /** @zh 通知所有监听器 @en Notify all listeners */
    private _notifyListeners(): void {
        for (const listener of this._listeners) {
            listener();
        }
    }

    /** @zh 清空所有窗口 @en Clear all windows */
    clear(): void {
        this._windows.clear();
        this._openWindows.clear();
        this._listeners.clear();
        this._logger.debug('Cleared');
    }

    /** @zh 释放资源 @en Dispose resources */
    dispose(): void {
        this.clear();
    }
}

/** @zh 窗口注册表服务标识符 @en Window registry service identifier */
export const IWindowRegistry = createRegistryToken<WindowRegistry>('WindowRegistry');
