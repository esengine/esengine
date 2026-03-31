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
import type { Validator } from '../schema/index.js';
import { loadApiHandlers, loadMsgHandlers, loadHttpHandlers } from '../router/loader.js';
import { RoomManager, type RoomClass, type Room, type Player } from '../room/index.js';
import { createHttpRouter } from '../http/router.js';
import { DistributedRoomManager } from '../distributed/DistributedRoomManager.js';
import { MemoryAdapter } from '../distributed/adapters/MemoryAdapter.js';

/**
 * @zh 默认配置
 * @en Default configuration
 */
const DEFAULT_CONFIG: Required<Omit<ServerConfig, 'onStart' | 'onConnect' | 'onDisconnect' | 'http' | 'cors' | 'httpDir' | 'httpPrefix' | 'distributed'>> & { httpDir: string; httpPrefix: string } = {
    port: 3000,
    apiDir: 'src/api',
    msgDir: 'src/msg',
    httpDir: 'src/http',
    httpPrefix: '/api',
    tickRate: 20,
    duplicateJoinPolicy: 'auto-leave'
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

    // port: 0 时自动分配随机端口
    if (opts.port === 0) {
        const net = await import('node:net');
        opts.port = await new Promise<number>((resolve, reject) => {
            const srv = net.createServer();
            srv.listen(0, () => {
                const addr = srv.address();
                srv.close(() => resolve(addr && typeof addr === 'object' ? addr.port : 3000));
            });
            srv.on('error', reject);
        });
    }

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

    // 分布式模式配置
    const distributedConfig = config.distributed;
    const isDistributed = distributedConfig?.enabled ?? false;

    // 动态构建协议
    const apiDefs: Record<string, ReturnType<typeof rpc.api>> = {
        // 内置 API
        JoinRoom: rpc.api(),
        LeaveRoom: rpc.api(),
        ReconnectRoom: rpc.api(),
        ListRooms: rpc.api(),
        GetRoomInfo: rpc.api()
    };
    const msgDefs: Record<string, ReturnType<typeof rpc.msg>> = {
        // 内置消息（房间消息透传）
        RoomMessage: rpc.msg(),
        // 分布式重定向消息
        $redirect: rpc.msg()
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
    let actualPort = opts.port;
    let tickInterval: ReturnType<typeof setInterval> | null = null;
    let rpcServer: RpcServer<typeof protocol, Record<string, unknown>> | null = null;
    let httpServer: HttpServer | null = null;

    // 发送函数（延迟绑定，因为 rpcServer 在 start() 后才创建）
    const sendFn = (conn: any, type: string, data: unknown) => {
        rpcServer?.send(conn, 'RoomMessage' as never, { type, data } as never);
    };

    // 二进制发送函数（使用原生 WebSocket 二进制帧，效率更高）
    const sendBinaryFn = (conn: any, data: Uint8Array) => {
        if (conn && typeof conn.sendBinary === 'function') {
            conn.sendBinary(data);
        }
    };

    // 房间管理器（立即初始化，以便 define() 可在 start() 前调用）
    let roomManager: RoomManager | DistributedRoomManager;
    let distributedManager: DistributedRoomManager | null = null;

    if (isDistributed && distributedConfig) {
        // 分布式模式
        const adapter = distributedConfig.adapter ?? new MemoryAdapter();
        distributedManager = new DistributedRoomManager(
            adapter,
            {
                serverId: distributedConfig.serverId,
                serverAddress: distributedConfig.serverAddress,
                serverPort: distributedConfig.serverPort ?? opts.port,
                heartbeatInterval: distributedConfig.heartbeatInterval,
                snapshotInterval: distributedConfig.snapshotInterval,
                enableFailover: distributedConfig.enableFailover,
                capacity: distributedConfig.capacity
            },
            sendFn,
            sendBinaryFn
        );
        roomManager = distributedManager;
        logger.info(`Distributed mode enabled (serverId: ${distributedConfig.serverId})`);
    } else {
        // 单机模式
        roomManager = new RoomManager(sendFn, sendBinaryFn);
    }

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

        get port() {
            return actualPort;
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
                // 检查重复加入
                const existingRoom = roomManager.getPlayerRoom(conn.id);
                if (existingRoom) {
                    const policy = opts.duplicateJoinPolicy ?? 'auto-leave';
                    if (policy === 'reject') {
                        throw new Error('Already in a room. Leave current room first.');
                    }
                    await roomManager.leave(conn.id, 'joining_other_room');
                }

                const { roomType, roomId, options, playerData } = input as {
                    roomType?: string;
                    roomId?: string;
                    options?: Record<string, unknown>;
                    playerData?: Record<string, unknown>;
                };

                if (roomId) {
                    const result = await roomManager.joinById(roomId, conn.id, conn, playerData);
                    if (!result) {
                        throw new Error('Failed to join room');
                    }
                    return { roomId: result.room.id, playerId: result.player.id, sessionToken: result.player.sessionToken };
                }

                if (roomType) {
                    // 分布式模式：使用 joinOrCreateDistributed
                    if (distributedManager) {
                        const result = await distributedManager.joinOrCreateDistributed(
                            roomType,
                            conn.id,
                            conn,
                            options
                        );
                        if (!result) {
                            throw new Error('Failed to join or create room');
                        }
                        if ('redirect' in result) {
                            // 发送重定向消息给客户端
                            rpcServer?.send(conn, '$redirect' as never, {
                                address: result.redirect,
                                roomType
                            } as never);
                            return { redirect: result.redirect };
                        }
                        return { roomId: result.room.id, playerId: result.player.id, sessionToken: result.player.sessionToken };
                    }

                    // 单机模式
                    const result = await roomManager.joinOrCreate(roomType, conn.id, conn, options, playerData);
                    if (!result) {
                        throw new Error('Failed to join or create room');
                    }
                    return { roomId: result.room.id, playerId: result.player.id, sessionToken: result.player.sessionToken };
                }

                throw new Error('roomType or roomId required');
            };

            // 内置 LeaveRoom API
            apiHandlersObj['LeaveRoom'] = async (_input, conn) => {
                await roomManager.leave(conn.id);
                return { success: true };
            };

            // 内置 ReconnectRoom API
            apiHandlersObj['ReconnectRoom'] = async (input: any, conn) => {
                const { sessionToken } = input as { sessionToken: string };
                if (!sessionToken) {
                    throw new Error('sessionToken is required');
                }

                const result = await roomManager.reconnect(sessionToken, conn.id, conn);
                if (!result) {
                    throw new Error('Reconnection failed: invalid session or room no longer exists');
                }

                return { roomId: result.room.id, playerId: result.player.id, sessionToken: result.player.sessionToken };
            };

            // 内置 ListRooms API
            apiHandlersObj['ListRooms'] = async (input) => {
                const { type } = (input ?? {}) as { type?: string };
                const rooms = type
                    ? roomManager.getRoomsByType(type)
                    : roomManager.getRooms();

                return {
                    rooms: rooms.map((room: Room) => ({
                        roomId: room.id,
                        playerCount: room.playerCount,
                        maxPlayers: room.maxPlayers,
                        locked: room.isLocked,
                        metadata: room.metadata
                    }))
                };
            };

            // 内置 GetRoomInfo API
            apiHandlersObj['GetRoomInfo'] = async (input) => {
                const { roomId } = input as { roomId: string };
                if (!roomId) {
                    throw new Error('roomId is required');
                }

                const room = roomManager.getRoom(roomId);
                if (!room) {
                    throw new Error(`Room not found: ${roomId}`);
                }

                return {
                    roomId: room.id,
                    playerCount: room.playerCount,
                    maxPlayers: room.maxPlayers,
                    locked: room.isLocked,
                    metadata: room.metadata,
                    players: room.players.map((p: Player) => ({
                        id: p.id
                    }))
                };
            };

            // 文件路由 API
            for (const [name, handler] of Object.entries(apiMap)) {
                apiHandlersObj[name] = async (input, conn) => {
                    const ctx: ApiContext = {
                        conn: conn as ServerConnection,
                        server: gameServer
                    };

                    const definition = handler.definition as { schema?: Validator<unknown> };
                    if (definition.schema) {
                        const result = definition.schema.validate(input);
                        if (!result.success) {
                            const pathStr = result.error.path.length > 0
                                ? ` at "${result.error.path.join('.')}"`
                                : '';
                            throw new Error(`Validation failed${pathStr}: ${result.error.message}`);
                        }
                        return handler.definition.handler(result.data, ctx);
                    }

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

                    const definition = handler.definition as { schema?: Validator<unknown> };
                    if (definition.schema) {
                        const result = definition.schema.validate(data);
                        if (!result.success) {
                            const pathStr = result.error.path.length > 0
                                ? ` at "${result.error.path.join('.')}"`
                                : '';
                            logger.warn(`Message validation failed for ${name}${pathStr}: ${result.error.message}`);
                            return;
                        }
                        await handler.definition.handler(result.data, ctx);
                        return;
                    }

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
                        const serverConn = conn as ServerConnection;
                        await gameServer._onConnect?.(serverConn, conn);
                        await config.onConnect?.(serverConn);
                    },
                    onDisconnect: async (conn) => {
                        const serverConn = conn as ServerConnection;
                        await roomManager?.leave(conn.id, 'disconnected');
                        await gameServer._onDisconnect?.(serverConn);
                        await config.onDisconnect?.(serverConn);
                    },
                    api: apiHandlersObj as Record<string, (input: unknown, conn: unknown) => Promise<unknown>>,
                    msg: msgHandlersObj as Record<string, (data: unknown, conn: unknown) => void | Promise<void>>
                });

                await rpcServer.start();

                // 启动 HTTP 服务器
                await new Promise<void>((resolve) => {
                    httpServer!.listen(opts.port, () => {
                        const addr = httpServer!.address();
                        if (addr && typeof addr === 'object') {
                            actualPort = addr.port;
                        }
                        resolve();
                    });
                });
            } else {
                // 仅 WebSocket 模式
                rpcServer = serve(protocol, {
                    port: opts.port,
                    createConnData: () => ({}),
                    onStart: (p) => {
                        if (p !== undefined) actualPort = p;
                        logger.info(`Started on ws://localhost:${actualPort}`);
                        opts.onStart?.(actualPort);
                    },
                    onConnect: async (conn) => {
                        const serverConn = conn as ServerConnection;
                        await gameServer._onConnect?.(serverConn, conn);
                        await config.onConnect?.(serverConn);
                    },
                    onDisconnect: async (conn) => {
                        const serverConn = conn as ServerConnection;
                        await roomManager?.leave(conn.id, 'disconnected');
                        await gameServer._onDisconnect?.(serverConn);
                        await config.onDisconnect?.(serverConn);
                    },
                    api: apiHandlersObj as Record<string, (input: unknown, conn: unknown) => Promise<unknown>>,
                    msg: msgHandlersObj as Record<string, (data: unknown, conn: unknown) => void | Promise<void>>
                });

                await rpcServer.start();
            }

            // 启动分布式管理器
            if (distributedManager) {
                await distributedManager.start();
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

            // 停止分布式管理器（优雅关闭）
            if (distributedManager) {
                await distributedManager.stop(true);
            }

            // 先关闭 HTTP server（会同时关闭底层 socket），再清理 RPC
            if (httpServer) {
                await new Promise<void>((resolve) => {
                    const timeout = setTimeout(() => {
                        resolve();
                    }, 3000);
                    httpServer!.close(() => {
                        clearTimeout(timeout);
                        resolve();
                    });
                    // 强制关闭所有活跃连接，避免 keep-alive 阻塞
                    httpServer!.closeAllConnections?.();
                });
                httpServer = null;
            }

            if (rpcServer) {
                await rpcServer.stop();
                rpcServer = null;
            }
        },

        broadcast(name, data) {
            rpcServer?.broadcast(name as never, data as never);
        },

        send(conn, name, data) {
            rpcServer?.send(conn as never, name as never, data as never);
        }
    };

    return gameServer as GameServer;
}
