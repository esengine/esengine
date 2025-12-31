/**
 * @zh HTTP 路由器
 * @en HTTP Router
 *
 * @zh 简洁的 HTTP 路由实现，支持与 WebSocket 共用端口
 * @en Simple HTTP router implementation, supports sharing port with WebSocket
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import type {
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpRoutes,
    CorsOptions,
} from './types.js';

/**
 * @zh 创建 HTTP 请求对象
 * @en Create HTTP request object
 */
async function createRequest(req: IncomingMessage): Promise<HttpRequest> {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    // 解析查询参数
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
        query[key] = value;
    });

    // 解析请求体
    let body: unknown = null;
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        body = await parseBody(req);
    }

    // 获取客户端 IP
    const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        'unknown';

    return {
        raw: req,
        method: req.method ?? 'GET',
        path: url.pathname,
        query,
        headers: req.headers as Record<string, string | string[] | undefined>,
        body,
        ip,
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

    const response: HttpResponse = {
        raw: res,

        status(code: number) {
            statusCode = code;
            return response;
        },

        header(name: string, value: string) {
            res.setHeader(name, value);
            return response;
        },

        json(data: unknown) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.statusCode = statusCode;
            res.end(JSON.stringify(data));
        },

        text(data: string) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.statusCode = statusCode;
            res.end(data);
        },

        error(code: number, message: string) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.statusCode = code;
            res.end(JSON.stringify({ error: message }));
        },
    };

    return response;
}

/**
 * @zh 应用 CORS 头
 * @en Apply CORS headers
 */
function applyCors(res: ServerResponse, req: IncomingMessage, cors: CorsOptions): void {
    const origin = req.headers.origin;

    // 处理 origin
    if (cors.origin === true || cors.origin === '*') {
        res.setHeader('Access-Control-Allow-Origin', origin ?? '*');
    } else if (typeof cors.origin === 'string') {
        res.setHeader('Access-Control-Allow-Origin', cors.origin);
    } else if (Array.isArray(cors.origin) && origin && cors.origin.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // 允许的方法
    if (cors.methods) {
        res.setHeader('Access-Control-Allow-Methods', cors.methods.join(', '));
    } else {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    }

    // 允许的头
    if (cors.allowedHeaders) {
        res.setHeader('Access-Control-Allow-Headers', cors.allowedHeaders.join(', '));
    } else {
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    // 凭证
    if (cors.credentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 缓存
    if (cors.maxAge) {
        res.setHeader('Access-Control-Max-Age', String(cors.maxAge));
    }
}

/**
 * @zh 创建 HTTP 路由器
 * @en Create HTTP router
 */
export function createHttpRouter(routes: HttpRoutes, cors?: CorsOptions | boolean) {
    // 解析路由
    const parsedRoutes: Array<{
        method: string;
        path: string;
        handler: HttpHandler;
    }> = [];

    for (const [path, handlerOrMethods] of Object.entries(routes)) {
        if (typeof handlerOrMethods === 'function') {
            // 简单形式：路径 -> 处理器（接受所有方法）
            parsedRoutes.push({ method: '*', path, handler: handlerOrMethods });
        } else {
            // 对象形式：路径 -> { GET, POST, ... }
            for (const [method, handler] of Object.entries(handlerOrMethods)) {
                if (handler !== undefined) {
                    parsedRoutes.push({ method, path, handler });
                }
            }
        }
    }

    // 默认 CORS 配置
    const corsOptions: CorsOptions | null =
        cors === true
            ? { origin: true, credentials: true }
            : cors === false
                ? null
                : cors ?? null;

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

            // 处理预检请求
            if (method === 'OPTIONS') {
                res.statusCode = 204;
                res.end();
                return true;
            }
        }

        // 查找匹配的路由
        const route = parsedRoutes.find(
            (r) => r.path === path && (r.method === '*' || r.method === method)
        );

        if (!route) {
            return false; // 未找到路由，让其他处理器处理
        }

        try {
            const httpReq = await createRequest(req);
            const httpRes = createResponse(res);
            await route.handler(httpReq, httpRes);
            return true;
        } catch (error) {
            console.error('[HTTP] Route handler error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
            return true;
        }
    };
}
