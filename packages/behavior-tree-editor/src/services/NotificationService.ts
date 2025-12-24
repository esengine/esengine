import { createLogger, PluginAPI } from '@esengine/editor-runtime';
import type { MessageHub } from '@esengine/editor-runtime';

const logger = createLogger('NotificationService');

export class NotificationService {
    private static _instance: NotificationService;
    private _messageHub: MessageHub | null = null;

    private constructor() {
        // 延迟获取 MessageHub，因为初始化时可能还不可用
    }

    private _getMessageHub(): MessageHub | null {
        if (!this._messageHub && PluginAPI.isAvailable) {
            try {
                this._messageHub = PluginAPI.messageHub;
            } catch (error) {
                logger.warn('MessageHub not available');
            }
        }
        return this._messageHub;
    }

    public static getInstance(): NotificationService {
        if (!NotificationService._instance) {
            NotificationService._instance = new NotificationService();
        }
        return NotificationService._instance;
    }

    public showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
        const hub = this._getMessageHub();
        if (!hub) {
            logger.info(`[Toast ${type}] ${message}`);
            return;
        }

        const notification = {
            type,
            message,
            timestamp: Date.now()
        };

        hub.publish('notification:show', notification);
    }

    public success(message: string): void {
        this.showToast(message, 'success');
    }

    public error(message: string): void {
        this.showToast(message, 'error');
    }

    public warning(message: string): void {
        this.showToast(message, 'warning');
    }

    public info(message: string): void {
        this.showToast(message, 'info');
    }
}

// 导出单例实例的便捷方法
export const showToast = (message: string, type?: 'success' | 'error' | 'warning' | 'info') => {
    NotificationService.getInstance().showToast(message, type);
};
