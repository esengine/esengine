/**
 * @zh HTTP 路由类型定义
 * @en HTTP router type definitions
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * @zh HTTP 请求上下文
 * @en HTTP request context
 */
export interface HttpRequest {
    /**
     * @zh 原始请求对象
     * @en Raw request object
     */
    raw: IncomingMessage;

    /**
     * @zh 请求方法
     * @en Request method
     */
    method: string;

    /**
     * @zh 请求路径
     * @en Request path
     */
    path: string;

    /**
     * @zh 路由参数（从 URL 路径提取，如 /users/:id）
     * @en Route parameters (extracted from URL path, e.g., /users/:id)
     */
    params: Record<string, string>;

    /**
     * @zh 查询参数
     * @en Query parameters
     */
    query: Record<string, string>;

    /**
     * @zh 请求头
     * @en Request headers
     */
    headers: Record<string, string | string[] | undefined>;

    /**
     * @zh 解析后的 JSON 请求体
     * @en Parsed JSON body
     */
    body: unknown;

    /**
     * @zh 客户端 IP
     * @en Client IP
     */
    ip: string;
}

/**
 * @zh HTTP 响应工具
 * @en HTTP response utilities
 */
export interface HttpResponse {
    /**
     * @zh 原始响应对象
     * @en Raw response object
     */
    raw: ServerResponse;

    /**
     * @zh 设置状态码
     * @en Set status code
     */
    status(code: number): HttpResponse;

    /**
     * @zh 设置响应头
     * @en Set response header
     */
    header(name: string, value: string): HttpResponse;

    /**
     * @zh 发送 JSON 响应
     * @en Send JSON response
     */
    json(data: unknown): void;

    /**
     * @zh 发送文本响应
     * @en Send text response
     */
    text(data: string): void;

    /**
     * @zh 发送错误响应
     * @en Send error response
     */
    error(code: number, message: string): void;
}

/**
 * @zh HTTP 路由处理器
 * @en HTTP route handler
 */
export type HttpHandler = (req: HttpRequest, res: HttpResponse) => void | Promise<void>;

/**
 * @zh HTTP 中间件函数
 * @en HTTP middleware function
 *
 * @example
 * ```typescript
 * const authMiddleware: HttpMiddleware = async (req, res, next) => {
 *     if (!req.headers.authorization) {
 *         res.error(401, 'Unauthorized');
 *         return;
 *     }
 *     await next();
 * };
 * ```
 */
export type HttpMiddleware = (
    req: HttpRequest,
    res: HttpResponse,
    next: () => Promise<void>
) => void | Promise<void>;

/**
 * @zh 带中间件和超时的路由处理器定义
 * @en Route handler definition with middleware and timeout support
 */
export interface HttpHandlerDefinition {
    /**
     * @zh 处理函数
     * @en Handler function
     */
    handler: HttpHandler;

    /**
     * @zh 路由级中间件
     * @en Route-level middlewares
     */
    middlewares?: HttpMiddleware[];

    /**
     * @zh 路由级超时时间（毫秒），覆盖全局设置
     * @en Route-level timeout in milliseconds, overrides global setting
     */
    timeout?: number;
}

/**
 * @zh HTTP 路由方法配置（支持简单处理器或完整定义）
 * @en HTTP route method configuration (supports simple handler or full definition)
 */
export type HttpMethodHandler = HttpHandler | HttpHandlerDefinition;

/**
 * @zh HTTP 路由方法映射
 * @en HTTP route methods mapping
 */
export interface HttpRouteMethods {
    GET?: HttpMethodHandler;
    POST?: HttpMethodHandler;
    PUT?: HttpMethodHandler;
    DELETE?: HttpMethodHandler;
    PATCH?: HttpMethodHandler;
    OPTIONS?: HttpMethodHandler;
}

/**
 * @zh HTTP 路由配置
 * @en HTTP routes configuration
 *
 * @example
 * ```typescript
 * const routes: HttpRoutes = {
 *     // 简单处理器
 *     '/health': (req, res) => res.json({ ok: true }),
 *
 *     // 按方法分开
 *     '/users': {
 *         GET: (req, res) => res.json([]),
 *         POST: (req, res) => res.json({ created: true })
 *     },
 *
 *     // 路由参数
 *     '/users/:id': {
 *         GET: (req, res) => res.json({ id: req.params.id }),
 *         DELETE: {
 *             handler: (req, res) => res.json({ deleted: true }),
 *             middlewares: [authMiddleware],
 *             timeout: 5000
 *         }
 *     }
 * };
 * ```
 */
export type HttpRoutes = Record<string, HttpMethodHandler | HttpRouteMethods>;

/**
 * @zh HTTP 路由定义（内部使用）
 * @en HTTP route definition (internal use)
 */
export interface HttpRoute {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | '*';
    path: string;
    handler: HttpHandler;
}

/**
 * @zh CORS 配置
 * @en CORS configuration
 */
export interface CorsOptions {
    /**
     * @zh 允许的来源
     * @en Allowed origins
     */
    origin?: string | string[] | boolean;

    /**
     * @zh 允许的方法
     * @en Allowed methods
     */
    methods?: string[];

    /**
     * @zh 允许的请求头
     * @en Allowed headers
     */
    allowedHeaders?: string[];

    /**
     * @zh 是否允许携带凭证
     * @en Allow credentials
     */
    credentials?: boolean;

    /**
     * @zh 预检请求缓存时间（秒）
     * @en Preflight cache max age
     */
    maxAge?: number;
}

/**
 * @zh HTTP 路由器选项
 * @en HTTP router options
 */
export interface HttpRouterOptions {
    /**
     * @zh CORS 配置
     * @en CORS configuration
     */
    cors?: CorsOptions | boolean;

    /**
     * @zh 全局请求超时时间（毫秒）
     * @en Global request timeout in milliseconds
     */
    timeout?: number;

    /**
     * @zh 全局中间件
     * @en Global middlewares
     */
    middlewares?: HttpMiddleware[];
}
