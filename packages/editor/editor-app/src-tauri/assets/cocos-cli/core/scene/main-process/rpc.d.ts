import { ProcessRPC } from '../process-rpc';
import { ChildProcess } from 'child_process';
import type { IPublicServiceManager } from '../scene-process';
export { ProcessRPC };
export declare class RpcProxy {
    private rpcInstance;
    getInstance(): ProcessRPC<IPublicServiceManager>;
    isConnect(): boolean | undefined;
    startup(prc: ChildProcess | NodeJS.Process): Promise<void>;
    /**
     * 清理 RPC 实例
     */
    dispose(): void;
}
export declare const Rpc: RpcProxy;
