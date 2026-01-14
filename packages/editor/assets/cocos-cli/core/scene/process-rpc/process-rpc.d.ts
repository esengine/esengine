import { ChildProcess } from 'child_process';
/**
 * request 的 options
 */
interface RequestOptions {
    timeout?: number;
}
/**
 * 双向 RPC 类
 * TModules 为注册模块接口集合
 *
 * 使用示例：
 *
 * interface INodeService {
 *   createNode(name: string): Promise<string>;
 *   deleteNode(id: string): Promise<void>;
 * }
 *
 * interface ISceneService {
 *   loadScene(id: string): Promise<boolean>;
 * }
 *
 * // 假设我们在主进程
 * const rpc = new ProcessRPC<{ node: INodeService; scene: ISceneService }>(childProcess);
 *
 * // 注册对象实例
 * rpc.register('scene', {
 *   async loadScene(id: string) {
 *     console.log('Scene loaded:', id);
 *     return true;
 *   }
 * });
 *
 * // 注册类实例
 * class NodeService implements INodeService {
 *   async createNode(name: string) {
 *     return `Node:${name}`;
 *   }
 *   async deleteNode(id: string) {
 *     console.log('Node deleted:', id);
 *   }
 * }
 * rpc.register('node', new NodeService());
 *
 * // 调用子进程方法
 * const nodeName = await rpc.request('node', 'createNode', ['Player']);
 *
 * // 发送单向消息
 * rpc.send('scene', 'loadScene', ['Level01']);
 */
export declare class ProcessRPC<TModules extends Record<string, any>> {
    private handlers;
    private callbacks;
    private msgId;
    private process;
    private onMessageBind;
    /**
     * @param proc - NodeJS.Process 或 ChildProcess 实例
     */
    attach(proc: NodeJS.Process | ChildProcess): void;
    /**
     * 注册模块，只支持对象或者类实例
     * @param handler - 注册模块列表
     */
    register(handler: Record<string, any>): void;
    /**
     * 重置消息注册
     */
    dispose(): void;
    /**
     * 是否连接
     */
    isConnect(): boolean | undefined;
    /**
     * 监听 incoming 消息
     */
    private listen;
    private onMessage;
    /**
     * 回复
     * @param msg
     * @private
     */
    private reply;
    /**
     * 发送请求并等待响应
     * @param module 模块名
     * @param method 方法名
     * @param rest
     */
    request<K extends keyof TModules, M extends keyof TModules[K]>(module: K, method: M, ...rest: Parameters<TModules[K][M]> extends [] ? [args?: [], options?: RequestOptions] : [args: Parameters<TModules[K][M]>, options?: RequestOptions]): Promise<Awaited<ReturnType<TModules[K][M]>>>;
    /**
     * 发送单向消息（无返回值）
     */
    notify<K extends keyof TModules, M extends keyof TModules[K]>(module: K, method: M, args?: Parameters<TModules[K][M]>): void;
}
export {};
