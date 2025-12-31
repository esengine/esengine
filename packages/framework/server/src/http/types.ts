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
 * @zh HTTP 路由定义
 * @en HTTP route definition
 */
export interface HttpRoute {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | '*';
    path: string;
    handler: HttpHandler;
}

/**
 * @zh HTTP 路由配置
 * @en HTTP routes configuration
 */
export type HttpRoutes = Record<string, HttpHandler | {
    GET?: HttpHandler;
    POST?: HttpHandler;
    PUT?: HttpHandler;
    DELETE?: HttpHandler;
    PATCH?: HttpHandler;
    OPTIONS?: HttpHandler;
}>;

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
