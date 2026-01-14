import { IMiddlewareContribution } from './interfaces';
/**
 * 启动服务器
 */
export declare function startServer(port?: number): Promise<void>;
/**
 * 停止服务器
 */
export declare function stopServer(): Promise<void>;
/**
 * 获取当前服务器的地址
 */
export declare function getServerUrl(): string;
export declare function register(name: string, module: IMiddlewareContribution): void;
