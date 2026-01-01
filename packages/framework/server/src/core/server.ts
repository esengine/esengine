/**
 * @zh 游戏服务器核心
 * @en Game server core
 */

import * as path from 'node:path';
import { createServer as createHttpServer, type Server as HttpServer } from 'node:http';
import { serve, type RpcServer } from '@esengine/rpc/server';
import { rpc } from '@esengine/rpc';
import { createLogger } from '../logger.js';
import type {
    ServerConfig,
    ServerConnection,
    GameServer,
    ApiContext,
    MsgContext,
    LoadedApiHandler,
    LoadedMsgHandler,
    LoadedHttpHandler
} from '../types/index.js';
import type { HttpRoutes, HttpHandler } from '../http/types.js';
import { loadApiHandlers, loadMsgHandlers, loadHttpHandlers } from '../router/loader.js';
import { RoomManager, type RoomClass, type Room } from '../room/index.js';
import { createHttpRouter } from '../http/router.js';

/**
 * @zh 默认配置
 * @en Default configuration
 */
const DEFAULT_CONFIG: Required<Omit<ServerConfig, 'onStart' | 'onConnect' | 'onDisconnect' | 'http' | 'cors' | 'httpDir' | 'httpPrefix'>> & { httpDir: string; httpPrefix: string } = {
    port: 3000,
    apiDir: 'src/api',
    msgDir: 'src/msg',
    httpDir: 'src/http',
    httpPrefix: '/api',
    tickRate: 20
};

/**
 * @zh 创建游戏服务器
 * @en Create game server
 *
 * @example
 * ```typescript
 * import { createServer, Room, onMessage } from '@esengine/server'
 *
 * class GameRoom extends Room {
 *     onJoin(player) {
 *         this.broadcast('Joined', { id: player.id })
 *     }
 * }
 *
 * const server = await createServer({ port: 3000 })
 * server.define('game', GameRoom)
 * await server.start()
 * ```
 */
export async function createServer(config: ServerConfig = {}): Promise<GameServer> {
    const opts = { ...DEFAULT_CONFIG, ...config };
    const cwd = process.cwd();
    const logger = createLogger('Server');

    // 加载文件路由处理器
    const apiHandlers = await loadApiHandlers(path.resolve(cwd, opts.apiDir));
    const msgHandlers = await loadMsgHandlers(path.resolve(cwd, opts.msgDir));

    // 加载 HTTP 文件路由
    const httpDir = config.httpDir ?? opts.httpDir;
    const httpPrefix = config.httpPrefix ?? opts.httpPrefix;
    const httpHandlers = await loadHttpHandlers(path.resolve(cwd, httpDir), httpPrefix);

    if (apiHandlers.length > 0) {
        logger.info(`Loaded ${apiHandlers.length} API handlers`);
    }
    if (msgHandlers.length > 0) {
        logger.info(`Loaded ${msgHandlers.length} message handlers`);
    }
    if (httpHandlers.length > 0) {
        logger.info(`Loaded ${httpHandlers.length} HTTP handlers`);
    }

    // 合并 HTTP 路由（文件路由 + 内联路由）
    const mergedHttpRoutes: HttpRoutes = {};

    // 先添加文件路由
    for (const handler of httpHandlers) {
        const existingRoute = mergedHttpRoutes[handler.route];
        if (existingRoute && typeof existingRoute !== 'function') {
            (existingRoute as Record<string, HttpHandler>)[handler.method] = handler.definition.handler;
        } else {
            mergedHttpRoutes[handler.route] = {
                [handler.method]: handler.definition.handler
            };
        }
    }

    // 再添加内联路由（覆盖文件路由）
    if (config.http) {
        for (const [route, handlerOrMethods] of Object.entries(config.http)) {
            if (typeof handlerOrMethods === 'function') {
                mergedHttpRoutes[route] = handlerOrMethods;
            } else {
                const existing = mergedHttpRoutes[route];
                if (existing && typeof existing !== 'function') {
                    Object.assign(existing, handlerOrMethods);
                } else {
                    mergedHttpRoutes[route] = handlerOrMethods;
                }
            }
        }
    }

    const hasHttpRoutes = Object.keys(mergedHttpRoutes).length > 0;

    // 动态构建协议
    const apiDefs: Record<string, ReturnType<typeof rpc.api>> = {
        // 内置 API
        JoinRoom: rpc.api(),
        LeaveRoom: rpc.api()
    };
    const msgDefs: Record<string, ReturnType<typeof rpc.msg>> = {
        // 内置消息（房间消息透传）
        RoomMessage: rpc.msg()
    };

    for (const handler of apiHandlers) {
        apiDefs[handler.name] = rpc.api();
    }
    for (const handler of msgHandlers) {
        msgDefs[handler.name] = rpc.msg();
    }

    const protocol = rpc.define({
        api: apiDefs,
        msg: msgDefs
    });

    // 服务器状态
    let currentTick = 0;
    let tickInterval: ReturnType<typeof setInterval> | null = null;
    let rpcServer: RpcServer<typeof protocol, Record<string, unknown>> | null = null;
    let httpServer: HttpServer | null = null;

    // 房间管理器（立即初始化，以便 define() 可在 start() 前调用）
    const roomManager = new RoomManager((conn, type, data) => {
        rpcServer?.send(conn, 'RoomMessage' as any, { type, data } as any);
    });

    // 构建 API 处理器映射
    const apiMap: Record<string, LoadedApiHandler> = {};
    for (const handler of apiHandlers) {
        apiMap[handler.name] = handler;
    }

    // 构建消息处理器映射
    const msgMap: Record<string, LoadedMsgHandler> = {};
    for (const handler of msgHandlers) {
        msgMap[handler.name] = handler;
    }

    // 游戏服务器实例
    const gameServer: GameServer & {
        rooms: RoomManager
    } = {
        get connections() {
            return (rpcServer?.connections ?? []) as ReadonlyArray<ServerConnection>;
        },

        get tick() {
            return currentTick;
        },

        get rooms() {
            return roomManager;
        },

        /**
         * @zh 注册房间类型
         * @en Define room type
         */
        define(name: string, roomClass: new () => unknown): void {
            roomManager.define(name, roomClass as RoomClass);
        },

        async start() {
            // 构建 API handlers
            const apiHandlersObj: Record<string, (input: unknown, conn: any) => Promise<unknown>> = {};

            // 内置 JoinRoom API
            apiHandlersObj['JoinRoom'] = async (input: any, conn) => {
                const { roomType, roomId, options } = input as {
                    roomType?: string
                    roomId?: string
                    options?: Record<string, unknown>
                };

                if (roomId) {
                    const result = await roomManager.joinById(roomId, conn.id, conn);
                    if (!result) {
                        throw new Error('Failed to join room');
                    }
                    return { roomId: result.room.id, playerId: result.player.id };
                }

                if (roomType) {
                    const result = await roomManager.joinOrCreate(roomType, conn.id, conn, options);
                    if (!result) {
                        throw new Error('Failed to join or create room');
                    }
                    return { roomId: result.room.id, playerId: result.player.id };
                }

                throw new Error('roomType or roomId required');
            };

            // 内置 LeaveRoom API
            apiHandlersObj['LeaveRoom'] = async (_input, conn) => {
                await roomManager.leave(conn.id);
                return { success: true };
            };

            // 文件路由 API
            for (const [name, handler] of Object.entries(apiMap)) {
                apiHandlersObj[name] = async (input, conn) => {
                    const ctx: ApiContext = {
                        conn: conn as ServerConnection,
                        server: gameServer
                    };
                    return handler.definition.handler(input, ctx);
                };
            }

            // 构建消息 handlers
            const msgHandlersObj: Record<string, (data: unknown, conn: any) => void | Promise<void>> = {};

            // 内置 RoomMessage 处理
            msgHandlersObj['RoomMessage'] = async (data: any, conn) => {
                const { type, data: payload } = data as { type: string; data: unknown };
                roomManager.handleMessage(conn.id, type, payload);
            };

            // 文件路由消息
            for (const [name, handler] of Object.entries(msgMap)) {
                msgHandlersObj[name] = async (data, conn) => {
                    const ctx: MsgContext = {
                        conn: conn as ServerConnection,
                        server: gameServer
                    };
                    await handler.definition.handler(data, ctx);
                };
            }

            // 如果有 HTTP 路由，创建 HTTP 服务器
            if (hasHttpRoutes) {
                const httpRouter = createHttpRouter(mergedHttpRoutes, {
                    cors: config.cors ?? true
                });

                httpServer = createHttpServer(async (req, res) => {
                    // 先尝试 HTTP 路由
                    const handled = await httpRouter(req, res);
                    if (!handled) {
                        // 未匹配的请求返回 404
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Not Found' }));
                    }
                });

                // 使用 HTTP 服务器创建 RPC
                rpcServer = serve(protocol, {
                    server: httpServer,
                    createConnData: () => ({}),
                    onStart: () => {
                        logger.info(`Started on http://localhost:${opts.port}`);
                        opts.onStart?.(opts.port);
                    },
                    onConnect: async (conn) => {
                        await config.onConnect?.(conn as ServerConnection);
                    },
                    onDisconnect: async (conn) => {
                        await roomManager?.leave(conn.id, 'disconnected');
                        await config.onDisconnect?.(conn as ServerConnection);
                    },
                    api: apiHandlersObj as any,
                    msg: msgHandlersObj as any
                });

                await rpcServer.start();

                // 启动 HTTP 服务器
                await new Promise<void>((resolve) => {
                    httpServer!.listen(opts.port, () => resolve());
                });
            } else {
                // 仅 WebSocket 模式
                rpcServer = serve(protocol, {
                    port: opts.port,
                    createConnData: () => ({}),
                    onStart: (p) => {
                        logger.info(`Started on ws://localhost:${p}`);
                        opts.onStart?.(p);
                    },
                    onConnect: async (conn) => {
                        await config.onConnect?.(conn as ServerConnection);
                    },
                    onDisconnect: async (conn) => {
                        await roomManager?.leave(conn.id, 'disconnected');
                        await config.onDisconnect?.(conn as ServerConnection);
                    },
                    api: apiHandlersObj as any,
                    msg: msgHandlersObj as any
                });

                await rpcServer.start();
            }

            // 启动 tick 循环
            if (opts.tickRate > 0) {
                tickInterval = setInterval(() => {
                    currentTick++;
                }, 1000 / opts.tickRate);
            }
        },

        async stop() {
            if (tickInterval) {
                clearInterval(tickInterval);
                tickInterval = null;
            }
            if (rpcServer) {
                await rpcServer.stop();
                rpcServer = null;
            }
            if (httpServer) {
                await new Promise<void>((resolve, reject) => {
                    httpServer!.close((err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
                httpServer = null;
            }
        },

        broadcast(name, data) {
            rpcServer?.broadcast(name as any, data as any);
        },

        send(conn, name, data) {
            rpcServer?.send(conn as any, name as any, data as any);
        }
    };

    return gameServer as GameServer;
}
