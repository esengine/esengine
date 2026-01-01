/**
 * @zh HTTP 路由器
 * @en HTTP Router
 *
 * @zh 支持路由参数、中间件和超时控制的 HTTP 路由实现
 * @en HTTP router with route parameters, middleware and timeout support
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { createLogger } from '../logger.js';
import type {
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpRoutes,
    HttpRouteMethods,
    HttpMiddleware,
    HttpRouterOptions,
    HttpMethodHandler,
    HttpHandlerDefinition,
    CorsOptions
} from './types.js';

const logger = createLogger('HTTP');

// ============================================================================
// 路由解析 | Route Parsing
// ============================================================================

/**
 * @zh 解析后的路由
 * @en Parsed route
 */
interface ParsedRoute {
    method: string;
    path: string;
    handler: HttpHandler;
    pattern: RegExp;
    paramNames: string[];
    middlewares: HttpMiddleware[];
    timeout?: number;
    isStatic: boolean;
}

/**
 * @zh 解析路由路径，提取参数名并生成匹配正则
 * @en Parse route path, extract param names and generate matching regex
 */
function parseRoutePath(path: string): { pattern: RegExp; paramNames: string[]; isStatic: boolean } {
    const paramNames: string[] = [];
    const isStatic = !path.includes(':');

    if (isStatic) {
        return {
            pattern: new RegExp(`^${escapeRegex(path)}$`),
            paramNames,
            isStatic: true
        };
    }

    const segments = path.split('/').map(segment => {
        if (segment.startsWith(':')) {
            const paramName = segment.slice(1);
            paramNames.push(paramName);
            return '([^/]+)';
        }
        return escapeRegex(segment);
    });

    return {
        pattern: new RegExp(`^${segments.join('/')}$`),
        paramNames,
        isStatic: false
    };
}

/**
 * @zh 转义正则表达式特殊字符
 * @en Escape regex special characters
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @zh 匹配路由并提取参数
 * @en Match route and extract params
 */
function matchRoute(
    routes: ParsedRoute[],
    path: string,
    method: string
): { route: ParsedRoute; params: Record<string, string> } | null {
    // 优先匹配静态路由
    for (const route of routes) {
        if (!route.isStatic) continue;
        if (route.method !== '*' && route.method !== method) continue;
        if (route.pattern.test(path)) {
            return { route, params: {} };
        }
    }

    // 然后匹配动态路由
    for (const route of routes) {
        if (route.isStatic) continue;
        if (route.method !== '*' && route.method !== method) continue;

        const match = path.match(route.pattern);
        if (match) {
            const params: Record<string, string> = {};
            route.paramNames.forEach((name, index) => {
                params[name] = decodeURIComponent(match[index + 1]);
            });
            return { route, params };
        }
    }

    return null;
}

// ============================================================================
// 请求/响应处理 | Request/Response Handling
// ============================================================================

/**
 * @zh 创建 HTTP 请求对象
 * @en Create HTTP request object
 */
async function createRequest(
    req: IncomingMessage,
    params: Record<string, string> = {}
): Promise<HttpRequest> {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
        query[key] = value;
    });

    let body: unknown = null;
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        body = await parseBody(req);
    }

    const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        'unknown';

    return {
        raw: req,
        method: req.method ?? 'GET',
        path: url.pathname,
        params,
        query,
        headers: req.headers as Record<string, string | string[] | undefined>,
        body,
        ip
    };
}

/**
 * @zh 解析请求体
 * @en Parse request body
 */
function parseBody(req: IncomingMessage): Promise<unknown> {
    return new Promise((resolve) => {
        const chunks: Buffer[] = [];

        req.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });

        req.on('end', () => {
            const rawBody = Buffer.concat(chunks).toString('utf-8');

            if (!rawBody) {
                resolve(null);
                return;
            }

            const contentType = req.headers['content-type'] ?? '';

            if (contentType.includes('application/json')) {
                try {
                    resolve(JSON.parse(rawBody));
                } catch {
                    resolve(rawBody);
                }
            } else if (contentType.includes('application/x-www-form-urlencoded')) {
                const params = new URLSearchParams(rawBody);
                const result: Record<string, string> = {};
                params.forEach((value, key) => {
                    result[key] = value;
                });
                resolve(result);
            } else {
                resolve(rawBody);
            }
        });

        req.on('error', () => {
            resolve(null);
        });
    });
}

/**
 * @zh 创建 HTTP 响应对象
 * @en Create HTTP response object
 */
function createResponse(res: ServerResponse): HttpResponse {
    let statusCode = 200;
    let ended = false;

    const response: HttpResponse = {
        raw: res,

        status(code: number) {
            statusCode = code;
            return response;
        },

        header(name: string, value: string) {
            if (!ended) {
                res.setHeader(name, value);
            }
            return response;
        },

        json(data: unknown) {
            if (ended) return;
            ended = true;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.statusCode = statusCode;
            res.end(JSON.stringify(data));
        },

        text(data: string) {
            if (ended) return;
            ended = true;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.statusCode = statusCode;
            res.end(data);
        },

        error(code: number, message: string) {
            if (ended) return;
            ended = true;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.statusCode = code;
            res.end(JSON.stringify({ error: message }));
        }
    };

    return response;
}

// ============================================================================
// CORS 处理 | CORS Handling
// ============================================================================

/**
 * @zh 应用 CORS 头
 * @en Apply CORS headers
 *
 * @zh 安全注意：当启用 credentials 时，不能使用通配符 origin
 * @en Security note: When credentials enabled, wildcard origin is not allowed
 */
function applyCors(res: ServerResponse, req: IncomingMessage, cors: CorsOptions): void {
    const origin = req.headers.origin;

    // 当启用 credentials 时，不能使用通配符，必须指定具体 origin
    // When credentials enabled, wildcard is not allowed, must specify exact origin
    if (cors.credentials && (cors.origin === true || cors.origin === '*')) {
        // 安全模式：只有当请求有 origin 头时才反射，否则不设置
        // Safe mode: only reflect when request has origin header, otherwise don't set
        if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
    } else if (cors.origin === true) {
        // 无 credentials 时可以反射 origin
        // Without credentials, can reflect origin
        res.setHeader('Access-Control-Allow-Origin', origin ?? '*');
    } else if (cors.origin === '*') {
        res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (typeof cors.origin === 'string') {
        res.setHeader('Access-Control-Allow-Origin', cors.origin);
    } else if (Array.isArray(cors.origin) && origin && cors.origin.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    if (cors.methods) {
        res.setHeader('Access-Control-Allow-Methods', cors.methods.join(', '));
    } else {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    }

    if (cors.allowedHeaders) {
        res.setHeader('Access-Control-Allow-Headers', cors.allowedHeaders.join(', '));
    } else {
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    if (cors.credentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (cors.maxAge) {
        res.setHeader('Access-Control-Max-Age', String(cors.maxAge));
    }
}

// ============================================================================
// 中间件执行 | Middleware Execution
// ============================================================================

/**
 * @zh 执行中间件链
 * @en Execute middleware chain
 */
async function executeMiddlewares(
    middlewares: HttpMiddleware[],
    req: HttpRequest,
    res: HttpResponse,
    finalHandler: () => Promise<void>
): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
        if (index < middlewares.length) {
            const middleware = middlewares[index++];
            await middleware(req, res, next);
        } else {
            await finalHandler();
        }
    };

    await next();
}

// ============================================================================
// 超时控制 | Timeout Control
// ============================================================================

/**
 * @zh 带超时的执行器
 * @en Execute with timeout
 */
async function executeWithTimeout(
    handler: () => Promise<void>,
    timeoutMs: number,
    res: ServerResponse
): Promise<void> {
    let resolved = false;

    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
            if (!resolved) {
                reject(new Error('Request timeout'));
            }
        }, timeoutMs);
    });

    try {
        await Promise.race([
            handler().then(() => { resolved = true; }),
            timeoutPromise
        ]);
    } catch (error) {
        if (error instanceof Error && error.message === 'Request timeout') {
            if (!res.writableEnded) {
                res.statusCode = 408;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ error: 'Request Timeout' }));
            }
        } else {
            throw error;
        }
    }
}

// ============================================================================
// 路由解析辅助 | Route Parsing Helpers
// ============================================================================

/**
 * @zh 判断是否为处理器定义对象（带 handler 属性）
 * @en Check if value is a handler definition object (with handler property)
 */
function isHandlerDefinition(value: unknown): value is HttpHandlerDefinition {
    return typeof value === 'object' && value !== null && 'handler' in value && typeof (value as HttpHandlerDefinition).handler === 'function';
}

/**
 * @zh 判断是否为路由方法映射对象
 * @en Check if value is a route methods mapping object
 */
function isRouteMethods(value: unknown): value is HttpRouteMethods {
    if (typeof value !== 'object' || value === null) return false;
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
    return Object.keys(value).some(key => methods.includes(key));
}

/**
 * @zh 从方法处理器提取处理函数和配置
 * @en Extract handler and config from method handler
 */
function extractHandler(methodHandler: HttpMethodHandler): {
    handler: HttpHandler;
    middlewares: HttpMiddleware[];
    timeout?: number;
} {
    if (isHandlerDefinition(methodHandler)) {
        return {
            handler: methodHandler.handler,
            middlewares: methodHandler.middlewares ?? [],
            timeout: methodHandler.timeout
        };
    }
    return {
        handler: methodHandler,
        middlewares: [],
        timeout: undefined
    };
}

// ============================================================================
// 主路由器 | Main Router
// ============================================================================

/**
 * @zh 创建 HTTP 路由器
 * @en Create HTTP router
 *
 * @example
 * ```typescript
 * const router = createHttpRouter({
 *     '/users': {
 *         GET: (req, res) => res.json([]),
 *         POST: (req, res) => res.json({ created: true })
 *     },
 *     '/users/:id': {
 *         GET: (req, res) => res.json({ id: req.params.id }),
 *         DELETE: {
 *             handler: (req, res) => res.json({ deleted: true }),
 *             middlewares: [authMiddleware],
 *             timeout: 5000
 *         }
 *     }
 * }, {
 *     cors: true,
 *     timeout: 30000,
 *     middlewares: [loggerMiddleware]
 * });
 * ```
 */
export function createHttpRouter(
    routes: HttpRoutes,
    options: HttpRouterOptions = {}
): (req: IncomingMessage, res: ServerResponse) => Promise<boolean> {
    const globalMiddlewares = options.middlewares ?? [];
    const globalTimeout = options.timeout;

    // 解析路由
    const parsedRoutes: ParsedRoute[] = [];

    for (const [path, handlerOrMethods] of Object.entries(routes)) {
        const { pattern, paramNames, isStatic } = parseRoutePath(path);

        if (typeof handlerOrMethods === 'function') {
            // 简单函数处理器
            parsedRoutes.push({
                method: '*',
                path,
                handler: handlerOrMethods,
                pattern,
                paramNames,
                middlewares: [],
                timeout: undefined,
                isStatic
            });
        } else if (isRouteMethods(handlerOrMethods)) {
            // 方法映射对象 { GET, POST, ... }
            for (const [method, methodHandler] of Object.entries(handlerOrMethods)) {
                if (methodHandler !== undefined) {
                    const { handler, middlewares, timeout } = extractHandler(methodHandler);
                    parsedRoutes.push({
                        method,
                        path,
                        handler,
                        pattern,
                        paramNames,
                        middlewares,
                        timeout,
                        isStatic
                    });
                }
            }
        } else if (isHandlerDefinition(handlerOrMethods)) {
            // 带配置的处理器定义 { handler, middlewares, timeout }
            const { handler, middlewares, timeout } = extractHandler(handlerOrMethods);
            parsedRoutes.push({
                method: '*',
                path,
                handler,
                pattern,
                paramNames,
                middlewares,
                timeout,
                isStatic
            });
        }
    }

    // CORS 配置
    // 安全默认：cors: true 时不启用 credentials，避免凭证泄露
    // Safe default: cors: true doesn't enable credentials to prevent credential leak
    const corsOptions: CorsOptions | null =
        options.cors === true
            ? { origin: '*' }
            : options.cors === false
                ? null
                : options.cors ?? null;

    /**
     * @zh 处理 HTTP 请求
     * @en Handle HTTP request
     */
    return async function handleRequest(
        req: IncomingMessage,
        res: ServerResponse
    ): Promise<boolean> {
        const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
        const path = url.pathname;
        const method = req.method ?? 'GET';

        // 应用 CORS
        if (corsOptions) {
            applyCors(res, req, corsOptions);

            if (method === 'OPTIONS') {
                res.statusCode = 204;
                res.end();
                return true;
            }
        }

        // 查找匹配的路由
        const match = matchRoute(parsedRoutes, path, method);

        if (!match) {
            return false;
        }

        const { route, params } = match;

        try {
            const httpReq = await createRequest(req, params);
            const httpRes = createResponse(res);

            // 合并中间件：全局 + 路由级
            const allMiddlewares = [...globalMiddlewares, ...route.middlewares];

            // 确定超时时间：路由级 > 全局
            const timeout = route.timeout ?? globalTimeout;

            // 最终处理器
            const finalHandler = async () => {
                await route.handler(httpReq, httpRes);
            };

            // 执行中间件链 + 处理器
            const executeHandler = async () => {
                if (allMiddlewares.length > 0) {
                    await executeMiddlewares(allMiddlewares, httpReq, httpRes, finalHandler);
                } else {
                    await finalHandler();
                }
            };

            // 带超时执行
            if (timeout && timeout > 0) {
                await executeWithTimeout(executeHandler, timeout, res);
            } else {
                await executeHandler();
            }

            return true;
        } catch (error) {
            logger.error('Route handler error:', error);
            if (!res.writableEnded) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
            return true;
        }
    };
}
