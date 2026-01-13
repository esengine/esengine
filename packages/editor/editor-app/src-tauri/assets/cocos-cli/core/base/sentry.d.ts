/**
 * Sentry 配置选项
 */
export interface SentryConfig {
    /** Sentry DSN */
    dsn?: string;
    /** 环境名称 */
    environment?: string;
    /** 发布版本 */
    release?: string;
    /** 是否启用调试模式 */
    debug?: boolean;
    /** 采样率 (0.0 - 1.0) */
    tracesSampleRate?: number;
    /** 用户信息 */
    user?: {
        id?: string;
        username?: string;
        email?: string;
    };
    /** 标签 */
    tags?: Record<string, string>;
    /** 额外上下文 */
    extra?: Record<string, any>;
}
/**
 * 便捷的初始化函数
 */
export declare function initSentry(): void;
/**
 * 便捷的异常捕获函数
 * @param error 错误对象
 * @param context 额外上下文
 */
export declare function captureException(error: Error, context?: Record<string, any>): void;
