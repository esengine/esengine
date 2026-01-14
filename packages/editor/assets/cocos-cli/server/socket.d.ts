import type { Server as HTTPServer } from 'http';
import type { Server as HTTPSServer } from 'https';
import { Server } from 'socket.io';
export declare class SocketService {
    io: Server | undefined;
    /**
     * 启动 io 服务器
     * @param server http 服务器
     */
    startup(server: HTTPServer | HTTPSServer): void;
    /**
     * 断开与客户端的连接
     */
    disconnect(): void;
}
export declare const socketService: SocketService;
