import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createHttpRouter } from '../router.js';
import type { HttpMiddleware, HttpRoutes } from '../types.js';

/**
 * @zh 创建模拟请求对象
 * @en Create mock request object
 */
function createMockRequest(options: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: string;
} = {}): IncomingMessage {
    const { method = 'GET', url = '/', headers = {}, body } = options;

    const req = {
        method,
        url,
        headers: { host: 'localhost', ...headers },
        socket: { remoteAddress: '127.0.0.1' },
        on: vi.fn((event: string, handler: (data?: any) => void) => {
            if (event === 'data' && body) {
                handler(Buffer.from(body));
            }
            if (event === 'end') {
                handler();
            }
            return req;
        })
    } as unknown as IncomingMessage;

    return req;
}

/**
 * @zh 创建模拟响应对象
 * @en Create mock response object
 */
function createMockResponse(): ServerResponse & {
    _statusCode: number;
    _headers: Record<string, string>;
    _body: string;
} {
    const res = {
        _statusCode: 200,
        _headers: {} as Record<string, string>,
        _body: '',
        writableEnded: false,

        get statusCode() {
            return this._statusCode;
        },
        set statusCode(code: number) {
            this._statusCode = code;
        },

        setHeader(name: string, value: string) {
            this._headers[name.toLowerCase()] = value;
        },
        removeHeader(name: string) {
            delete this._headers[name.toLowerCase()];
        },
        end(data?: string) {
            this._body = data ?? '';
            this.writableEnded = true;
        }
    } as any;

    return res;
}

describe('HTTP Router', () => {
    describe('Route Matching', () => {
        it('should match exact paths', async () => {
            const handler = vi.fn((req, res) => res.json({ ok: true }));
            const router = createHttpRouter({
                '/api/health': handler
            });

            const req = createMockRequest({ url: '/api/health' });
            const res = createMockResponse();

            const matched = await router(req, res);

            expect(matched).toBe(true);
            expect(handler).toHaveBeenCalled();
        });

        it('should return false for non-matching paths', async () => {
            const router = createHttpRouter({
                '/api/health': (req, res) => res.json({ ok: true })
            });

            const req = createMockRequest({ url: '/api/unknown' });
            const res = createMockResponse();

            const matched = await router(req, res);

            expect(matched).toBe(false);
        });

        it('should match by HTTP method', async () => {
            const getHandler = vi.fn((req, res) => res.json({ method: 'GET' }));
            const postHandler = vi.fn((req, res) => res.json({ method: 'POST' }));

            const router = createHttpRouter({
                '/api/users': {
                    GET: getHandler,
                    POST: postHandler
                }
            });

            const getReq = createMockRequest({ method: 'GET', url: '/api/users' });
            const getRes = createMockResponse();
            await router(getReq, getRes);
            expect(getHandler).toHaveBeenCalled();
            expect(postHandler).not.toHaveBeenCalled();

            getHandler.mockClear();
            postHandler.mockClear();

            const postReq = createMockRequest({ method: 'POST', url: '/api/users' });
            const postRes = createMockResponse();
            await router(postReq, postRes);
            expect(postHandler).toHaveBeenCalled();
            expect(getHandler).not.toHaveBeenCalled();
        });
    });

    describe('Route Parameters', () => {
        it('should extract single route param', async () => {
            let capturedParams: Record<string, string> = {};

            const router = createHttpRouter({
                '/users/:id': (req, res) => {
                    capturedParams = req.params;
                    res.json({ id: req.params.id });
                }
            });

            const req = createMockRequest({ url: '/users/123' });
            const res = createMockResponse();

            await router(req, res);

            expect(capturedParams).toEqual({ id: '123' });
        });

        it('should extract multiple route params', async () => {
            let capturedParams: Record<string, string> = {};

            const router = createHttpRouter({
                '/users/:userId/posts/:postId': (req, res) => {
                    capturedParams = req.params;
                    res.json(req.params);
                }
            });

            const req = createMockRequest({ url: '/users/42/posts/99' });
            const res = createMockResponse();

            await router(req, res);

            expect(capturedParams).toEqual({ userId: '42', postId: '99' });
        });

        it('should decode URI components in params', async () => {
            let capturedParams: Record<string, string> = {};

            const router = createHttpRouter({
                '/search/:query': (req, res) => {
                    capturedParams = req.params;
                    res.json({ query: req.params.query });
                }
            });

            const req = createMockRequest({ url: '/search/hello%20world' });
            const res = createMockResponse();

            await router(req, res);

            expect(capturedParams.query).toBe('hello world');
        });

        it('should prioritize static routes over param routes', async () => {
            const staticHandler = vi.fn((req, res) => res.json({ type: 'static' }));
            const paramHandler = vi.fn((req, res) => res.json({ type: 'param' }));

            const router = createHttpRouter({
                '/users/me': staticHandler,
                '/users/:id': paramHandler
            });

            const req = createMockRequest({ url: '/users/me' });
            const res = createMockResponse();

            await router(req, res);

            expect(staticHandler).toHaveBeenCalled();
            expect(paramHandler).not.toHaveBeenCalled();
        });
    });

    describe('Middleware', () => {
        it('should execute global middlewares in order', async () => {
            const order: number[] = [];

            const middleware1: HttpMiddleware = async (req, res, next) => {
                order.push(1);
                await next();
                order.push(4);
            };

            const middleware2: HttpMiddleware = async (req, res, next) => {
                order.push(2);
                await next();
                order.push(3);
            };

            const router = createHttpRouter(
                {
                    '/test': (req, res) => {
                        order.push(0);
                        res.json({ ok: true });
                    }
                },
                { middlewares: [middleware1, middleware2] }
            );

            const req = createMockRequest({ url: '/test' });
            const res = createMockResponse();

            await router(req, res);

            expect(order).toEqual([1, 2, 0, 3, 4]);
        });

        it('should allow middleware to short-circuit', async () => {
            const handler = vi.fn((req, res) => res.json({ ok: true }));

            const authMiddleware: HttpMiddleware = async (req, res, next) => {
                res.error(401, 'Unauthorized');
                // 不调用 next()
            };

            const router = createHttpRouter(
                { '/protected': handler },
                { middlewares: [authMiddleware] }
            );

            const req = createMockRequest({ url: '/protected' });
            const res = createMockResponse();

            await router(req, res);

            expect(handler).not.toHaveBeenCalled();
            expect(res._statusCode).toBe(401);
        });

        it('should execute route-level middlewares', async () => {
            const globalMiddleware = vi.fn(async (req, res, next) => {
                (req as any).global = true;
                await next();
            });

            const routeMiddleware = vi.fn(async (req, res, next) => {
                (req as any).route = true;
                await next();
            });

            let receivedReq: any;
            const router = createHttpRouter(
                {
                    '/test': {
                        handler: (req, res) => {
                            receivedReq = req;
                            res.json({ ok: true });
                        },
                        middlewares: [routeMiddleware]
                    }
                },
                { middlewares: [globalMiddleware] }
            );

            const req = createMockRequest({ url: '/test' });
            const res = createMockResponse();

            await router(req, res);

            expect(globalMiddleware).toHaveBeenCalled();
            expect(routeMiddleware).toHaveBeenCalled();
            expect(receivedReq.global).toBe(true);
            expect(receivedReq.route).toBe(true);
        });
    });

    describe('Timeout', () => {
        it('should timeout slow handlers', async () => {
            const router = createHttpRouter(
                {
                    '/slow': async (req, res) => {
                        await new Promise(resolve => setTimeout(resolve, 200));
                        res.json({ ok: true });
                    }
                },
                { timeout: 50 }
            );

            const req = createMockRequest({ url: '/slow' });
            const res = createMockResponse();

            await router(req, res);

            expect(res._statusCode).toBe(408);
            expect(JSON.parse(res._body)).toEqual({ error: 'Request Timeout' });
        });

        it('should use route-specific timeout over global', async () => {
            const router = createHttpRouter(
                {
                    '/slow': {
                        handler: async (req, res) => {
                            await new Promise(resolve => setTimeout(resolve, 100));
                            res.json({ ok: true });
                        },
                        timeout: 200 // 路由级超时更长
                    }
                },
                { timeout: 50 } // 全局超时较短
            );

            const req = createMockRequest({ url: '/slow' });
            const res = createMockResponse();

            await router(req, res);

            // 应该成功，因为路由级超时是 200ms
            expect(res._statusCode).toBe(200);
        });

        it('should not timeout fast handlers', async () => {
            const router = createHttpRouter(
                {
                    '/fast': (req, res) => {
                        res.json({ ok: true });
                    }
                },
                { timeout: 1000 }
            );

            const req = createMockRequest({ url: '/fast' });
            const res = createMockResponse();

            await router(req, res);

            expect(res._statusCode).toBe(200);
        });
    });

    describe('Request Parsing', () => {
        it('should parse query parameters', async () => {
            let capturedQuery: Record<string, string> = {};

            const router = createHttpRouter({
                '/search': (req, res) => {
                    capturedQuery = req.query;
                    res.json({ query: req.query });
                }
            });

            const req = createMockRequest({ url: '/search?q=hello&page=1' });
            const res = createMockResponse();

            await router(req, res);

            expect(capturedQuery).toEqual({ q: 'hello', page: '1' });
        });

        it('should parse JSON body', async () => {
            let capturedBody: unknown;

            const router = createHttpRouter({
                '/api/data': {
                    POST: (req, res) => {
                        capturedBody = req.body;
                        res.json({ received: true });
                    }
                }
            });

            const req = createMockRequest({
                method: 'POST',
                url: '/api/data',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ name: 'test', value: 42 })
            });
            const res = createMockResponse();

            await router(req, res);

            expect(capturedBody).toEqual({ name: 'test', value: 42 });
        });

        it('should extract client IP', async () => {
            let capturedIp: string = '';

            const router = createHttpRouter({
                '/ip': (req, res) => {
                    capturedIp = req.ip;
                    res.json({ ip: req.ip });
                }
            });

            const req = createMockRequest({ url: '/ip' });
            const res = createMockResponse();

            await router(req, res);

            expect(capturedIp).toBe('127.0.0.1');
        });

        it('should prefer X-Forwarded-For header for IP', async () => {
            let capturedIp: string = '';

            const router = createHttpRouter({
                '/ip': (req, res) => {
                    capturedIp = req.ip;
                    res.json({ ip: req.ip });
                }
            });

            const req = createMockRequest({
                url: '/ip',
                headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' }
            });
            const res = createMockResponse();

            await router(req, res);

            expect(capturedIp).toBe('203.0.113.195');
        });
    });

    describe('CORS', () => {
        it('should handle OPTIONS preflight', async () => {
            const router = createHttpRouter(
                { '/api/data': (req, res) => res.json({}) },
                { cors: true }
            );

            const req = createMockRequest({
                method: 'OPTIONS',
                url: '/api/data',
                headers: { origin: 'http://example.com' }
            });
            const res = createMockResponse();

            await router(req, res);

            expect(res._statusCode).toBe(204);
            // cors: true 使用通配符 '*'，安全默认不启用 credentials
            expect(res._headers['access-control-allow-origin']).toBe('*');
        });

        it('should reflect origin when using origin: true without credentials', async () => {
            const router = createHttpRouter(
                { '/api/data': (req, res) => res.json({}) },
                { cors: { origin: true } }
            );

            const req = createMockRequest({
                method: 'OPTIONS',
                url: '/api/data',
                headers: { origin: 'http://example.com' }
            });
            const res = createMockResponse();

            await router(req, res);

            expect(res._statusCode).toBe(204);
            expect(res._headers['access-control-allow-origin']).toBe('http://example.com');
        });

        it('should set CORS headers on regular requests', async () => {
            const router = createHttpRouter(
                { '/api/data': (req, res) => res.json({}) },
                { cors: { origin: 'http://allowed.com', credentials: true } }
            );

            const req = createMockRequest({
                url: '/api/data',
                headers: { origin: 'http://allowed.com' }
            });
            const res = createMockResponse();

            await router(req, res);

            expect(res._headers['access-control-allow-origin']).toBe('http://allowed.com');
            expect(res._headers['access-control-allow-credentials']).toBe('true');
        });

        it('should not set CORS headers when cors is false', async () => {
            const router = createHttpRouter(
                { '/api/data': (req, res) => res.json({}) },
                { cors: false }
            );

            const req = createMockRequest({
                url: '/api/data',
                headers: { origin: 'http://example.com' }
            });
            const res = createMockResponse();

            await router(req, res);

            expect(res._headers['access-control-allow-origin']).toBeUndefined();
        });
    });

    describe('Response Methods', () => {
        it('should send JSON response', async () => {
            const router = createHttpRouter({
                '/json': (req, res) => res.json({ message: 'hello' })
            });

            const req = createMockRequest({ url: '/json' });
            const res = createMockResponse();

            await router(req, res);

            expect(res._headers['content-type']).toBe('application/json; charset=utf-8');
            expect(JSON.parse(res._body)).toEqual({ message: 'hello' });
        });

        it('should send text response', async () => {
            const router = createHttpRouter({
                '/text': (req, res) => res.text('Hello World')
            });

            const req = createMockRequest({ url: '/text' });
            const res = createMockResponse();

            await router(req, res);

            expect(res._headers['content-type']).toBe('text/plain; charset=utf-8');
            expect(res._body).toBe('Hello World');
        });

        it('should send error response', async () => {
            const router = createHttpRouter({
                '/error': (req, res) => res.error(404, 'Not Found')
            });

            const req = createMockRequest({ url: '/error' });
            const res = createMockResponse();

            await router(req, res);

            expect(res._statusCode).toBe(404);
            expect(JSON.parse(res._body)).toEqual({ error: 'Not Found' });
        });

        it('should support status chaining', async () => {
            const router = createHttpRouter({
                '/created': (req, res) => res.status(201).json({ id: 1 })
            });

            const req = createMockRequest({ url: '/created' });
            const res = createMockResponse();

            await router(req, res);

            expect(res._statusCode).toBe(201);
        });
    });

    describe('Error Handling', () => {
        it('should catch handler errors and return 500', async () => {
            const router = createHttpRouter({
                '/error': () => {
                    throw new Error('Something went wrong');
                }
            });

            const req = createMockRequest({ url: '/error' });
            const res = createMockResponse();

            await router(req, res);

            expect(res._statusCode).toBe(500);
            expect(JSON.parse(res._body)).toEqual({ error: 'Internal Server Error' });
        });
    });
});
