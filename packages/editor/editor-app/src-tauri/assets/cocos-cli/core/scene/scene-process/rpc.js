"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rpc = exports.RpcProxy = void 0;
const process_rpc_1 = require("../process-rpc");
class RpcProxy {
    rpcInstance = null;
    getInstance() {
        if (!this.rpcInstance) {
            throw new Error('[Scene] Rpc instance is not started!');
        }
        return this.rpcInstance;
    }
    async startup() {
        // 在创建新实例前，先清理旧实例，防止内存泄漏
        this.dispose();
        this.rpcInstance = new process_rpc_1.ProcessRPC();
        this.rpcInstance.attach(process);
        const { Service } = await Promise.resolve().then(() => __importStar(require('./service/core/decorator')));
        this.rpcInstance.register(Service);
        console.log('[Scene] Scene Process RPC ready');
    }
    /**
     * 清理 RPC 实例
     */
    dispose() {
        if (this.rpcInstance) {
            console.log('[Node] Disposing RPC instance');
            try {
                this.rpcInstance.dispose();
            }
            catch (error) {
                console.warn('[Node] Error disposing RPC instance:', error);
            }
            finally {
                this.rpcInstance = null;
            }
        }
    }
}
exports.RpcProxy = RpcProxy;
exports.Rpc = new RpcProxy();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnBjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvc2NlbmUvc2NlbmUtcHJvY2Vzcy9ycGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsZ0RBQTRDO0FBRzVDLE1BQWEsUUFBUTtJQUNULFdBQVcsR0FBbUMsSUFBSSxDQUFDO0lBRXBELFdBQVc7UUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzVCLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTztRQUNULHdCQUF3QjtRQUN4QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksd0JBQVUsRUFBZSxDQUFDO1FBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyx3REFBYSwwQkFBMEIsR0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxPQUFPO1FBQ0gsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQztnQkFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQy9CLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0NBQXNDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEUsQ0FBQztvQkFBUyxDQUFDO2dCQUNQLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQzVCLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBbkNELDRCQW1DQztBQUVZLFFBQUEsR0FBRyxHQUFHLElBQUksUUFBUSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcm9jZXNzUlBDIH0gZnJvbSAnLi4vcHJvY2Vzcy1ycGMnO1xyXG5pbXBvcnQgdHlwZSB7IElNYWluTW9kdWxlIH0gZnJvbSAnLi4vbWFpbi1wcm9jZXNzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBScGNQcm94eSB7XHJcbiAgICBwcml2YXRlIHJwY0luc3RhbmNlOiBQcm9jZXNzUlBDPElNYWluTW9kdWxlPiB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIHB1YmxpYyBnZXRJbnN0YW5jZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMucnBjSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdbU2NlbmVdIFJwYyBpbnN0YW5jZSBpcyBub3Qgc3RhcnRlZCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucnBjSW5zdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgc3RhcnR1cCgpIHtcclxuICAgICAgICAvLyDlnKjliJvlu7rmlrDlrp7kvovliY3vvIzlhYjmuIXnkIbml6flrp7kvovvvIzpmLLmraLlhoXlrZjms4TmvI9cclxuICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcclxuICAgICAgICB0aGlzLnJwY0luc3RhbmNlID0gbmV3IFByb2Nlc3NSUEM8SU1haW5Nb2R1bGU+KCk7XHJcbiAgICAgICAgdGhpcy5ycGNJbnN0YW5jZS5hdHRhY2gocHJvY2Vzcyk7XHJcbiAgICAgICAgY29uc3QgeyBTZXJ2aWNlIH0gPSBhd2FpdCBpbXBvcnQoJy4vc2VydmljZS9jb3JlL2RlY29yYXRvcicpO1xyXG4gICAgICAgIHRoaXMucnBjSW5zdGFuY2UucmVnaXN0ZXIoU2VydmljZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tTY2VuZV0gU2NlbmUgUHJvY2VzcyBSUEMgcmVhZHknKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa4heeQhiBSUEMg5a6e5L6LXHJcbiAgICAgKi9cclxuICAgIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMucnBjSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tOb2RlXSBEaXNwb3NpbmcgUlBDIGluc3RhbmNlJyk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJwY0luc3RhbmNlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW05vZGVdIEVycm9yIGRpc3Bvc2luZyBSUEMgaW5zdGFuY2U6JywgZXJyb3IpO1xyXG4gICAgICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ycGNJbnN0YW5jZSA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBScGMgPSBuZXcgUnBjUHJveHkoKTtcclxuIl19