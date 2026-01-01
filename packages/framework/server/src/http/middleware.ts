/**
 * @zh 内置 HTTP 中间件
 * @en Built-in HTTP middlewares
 */

import { createLogger } from '../logger.js';
import type { HttpMiddleware } from './types.js';

/**
 * @zh 请求日志中间件
 * @en Request logging middleware
 *
 * @example
 * ```typescript
 * const router = createHttpRouter(routes, {
 *     middlewares: [requestLogger()]
 * });
 * ```
 */
export function requestLogger(options: {
    /**
     * @zh 日志器名称
     * @en Logger name
     */
    name?: string;
    /**
     * @zh 是否记录请求体
     * @en Whether to log request body
     */
    logBody?: boolean;
} = {}): HttpMiddleware {
    const logger = createLogger(options.name ?? 'HTTP');
    const logBody = options.logBody ?? false;

    return async (req, res, next) => {
        const start = Date.now();
        const { method, path, ip } = req;

        if (logBody && req.body) {
            logger.debug(`→ ${method} ${path}`, { ip, body: req.body });
        } else {
            logger.debug(`→ ${method} ${path}`, { ip });
        }

        await next();

        const duration = Date.now() - start;
        logger.info(`← ${method} ${path} ${res.raw.statusCode} ${duration}ms`);
    };
}

/**
 * @zh 请求体大小限制中间件
 * @en Request body size limit middleware
 *
 * @example
 * ```typescript
 * const router = createHttpRouter(routes, {
 *     middlewares: [bodyLimit(1024 * 1024)] // 1MB
 * });
 * ```
 */
export function bodyLimit(maxBytes: number): HttpMiddleware {
    return async (req, res, next) => {
        const contentLength = req.headers['content-length'];

        if (contentLength) {
            const length = parseInt(contentLength as string, 10);
            if (length > maxBytes) {
                res.error(413, 'Payload Too Large');
                return;
            }
        }

        await next();
    };
}

/**
 * @zh 响应时间头中间件
 * @en Response time header middleware
 *
 * @zh 在响应头中添加 X-Response-Time
 * @en Adds X-Response-Time header to response
 */
export function responseTime(): HttpMiddleware {
    return async (req, res, next) => {
        const start = Date.now();
        await next();
        const duration = Date.now() - start;
        res.header('X-Response-Time', `${duration}ms`);
    };
}

/**
 * @zh 请求 ID 中间件
 * @en Request ID middleware
 *
 * @zh 为每个请求生成唯一 ID，添加到响应头和请求对象
 * @en Generates unique ID for each request, adds to response header and request object
 */
export function requestId(headerName: string = 'X-Request-ID'): HttpMiddleware {
    return async (req, res, next) => {
        const id = req.headers[headerName.toLowerCase()] as string
            ?? generateId();

        res.header(headerName, id);
        (req as any).requestId = id;

        await next();
    };
}

/**
 * @zh 生成简单的唯一 ID
 * @en Generate simple unique ID
 */
function generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * @zh 安全头中间件
 * @en Security headers middleware
 *
 * @zh 添加常用的安全响应头
 * @en Adds common security response headers
 */
export function securityHeaders(options: {
    /**
     * @zh 是否禁用 X-Powered-By
     * @en Whether to remove X-Powered-By
     */
    hidePoweredBy?: boolean;
    /**
     * @zh X-Frame-Options 值
     * @en X-Frame-Options value
     */
    frameOptions?: 'DENY' | 'SAMEORIGIN';
    /**
     * @zh 是否启用 noSniff
     * @en Whether to enable noSniff
     */
    noSniff?: boolean;
} = {}): HttpMiddleware {
    const {
        hidePoweredBy = true,
        frameOptions = 'SAMEORIGIN',
        noSniff = true
    } = options;

    return async (req, res, next) => {
        if (hidePoweredBy) {
            res.raw.removeHeader('X-Powered-By');
        }

        if (frameOptions) {
            res.header('X-Frame-Options', frameOptions);
        }

        if (noSniff) {
            res.header('X-Content-Type-Options', 'nosniff');
        }

        await next();
    };
}
