"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rpc = exports.RpcProxy = exports.ProcessRPC = void 0;
const process_rpc_1 = require("../process-rpc");
Object.defineProperty(exports, "ProcessRPC", { enumerable: true, get: function () { return process_rpc_1.ProcessRPC; } });
const assets_1 = require("../../assets");
const scripting_1 = __importDefault(require("../../scripting"));
const scene_configs_1 = require("../scene-configs");
class RpcProxy {
    rpcInstance = null;
    getInstance() {
        if (!this.rpcInstance) {
            throw new Error('[Node] Rpc instance is not started!');
        }
        return this.rpcInstance;
    }
    isConnect() {
        return this.rpcInstance?.isConnect();
    }
    async startup(prc) {
        // 在创建新实例前，先清理旧实例，防止内存泄漏
        this.dispose();
        this.rpcInstance = new process_rpc_1.ProcessRPC();
        this.rpcInstance.attach(prc);
        this.rpcInstance.register({
            assetManager: assets_1.assetManager,
            programming: scripting_1.default,
            sceneConfigInstance: scene_configs_1.sceneConfigInstance,
        });
        console.log('[Node] Scene Process RPC ready');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnBjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvc2NlbmUvbWFpbi1wcm9jZXNzL3JwYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxnREFBNEM7QUFRbkMsMkZBUkEsd0JBQVUsT0FRQTtBQU5uQix5Q0FBNEM7QUFDNUMsZ0VBQTRDO0FBQzVDLG9EQUF1RDtBQU12RCxNQUFhLFFBQVE7SUFDVCxXQUFXLEdBQTZDLElBQUksQ0FBQztJQUU5RCxXQUFXO1FBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUM1QixDQUFDO0lBRU0sU0FBUztRQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFrQztRQUM1Qyx3QkFBd0I7UUFDeEIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLHdCQUFVLEVBQXlCLENBQUM7UUFDM0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7WUFDdEIsWUFBWSxFQUFFLHFCQUFZO1lBQzFCLFdBQVcsRUFBRSxtQkFBYTtZQUMxQixtQkFBbUIsRUFBRSxtQ0FBbUI7U0FDM0MsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU87UUFDSCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDO2dCQUNELElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDL0IsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNoRSxDQUFDO29CQUFTLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDNUIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0NBQ0o7QUExQ0QsNEJBMENDO0FBRVksUUFBQSxHQUFHLEdBQUcsSUFBSSxRQUFRLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByb2Nlc3NSUEMgfSBmcm9tICcuLi9wcm9jZXNzLXJwYyc7XHJcbmltcG9ydCB7IENoaWxkUHJvY2VzcyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xyXG5pbXBvcnQgeyBhc3NldE1hbmFnZXIgfSBmcm9tICcuLi8uLi9hc3NldHMnO1xyXG5pbXBvcnQgc2NyaXB0TWFuYWdlciBmcm9tICcuLi8uLi9zY3JpcHRpbmcnO1xyXG5pbXBvcnQgeyBzY2VuZUNvbmZpZ0luc3RhbmNlIH0gZnJvbSAnLi4vc2NlbmUtY29uZmlncyc7XHJcblxyXG5pbXBvcnQgdHlwZSB7IElQdWJsaWNTZXJ2aWNlTWFuYWdlciB9IGZyb20gJy4uL3NjZW5lLXByb2Nlc3MnO1xyXG5cclxuZXhwb3J0IHsgUHJvY2Vzc1JQQyB9O1xyXG5cclxuZXhwb3J0IGNsYXNzIFJwY1Byb3h5IHtcclxuICAgIHByaXZhdGUgcnBjSW5zdGFuY2U6IFByb2Nlc3NSUEM8SVB1YmxpY1NlcnZpY2VNYW5hZ2VyPiB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIHB1YmxpYyBnZXRJbnN0YW5jZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMucnBjSW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdbTm9kZV0gUnBjIGluc3RhbmNlIGlzIG5vdCBzdGFydGVkIScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5ycGNJbnN0YW5jZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaXNDb25uZWN0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJwY0luc3RhbmNlPy5pc0Nvbm5lY3QoKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBzdGFydHVwKHByYzogQ2hpbGRQcm9jZXNzIHwgTm9kZUpTLlByb2Nlc3MpIHtcclxuICAgICAgICAvLyDlnKjliJvlu7rmlrDlrp7kvovliY3vvIzlhYjmuIXnkIbml6flrp7kvovvvIzpmLLmraLlhoXlrZjms4TmvI9cclxuICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcclxuICAgICAgICB0aGlzLnJwY0luc3RhbmNlID0gbmV3IFByb2Nlc3NSUEM8SVB1YmxpY1NlcnZpY2VNYW5hZ2VyPigpO1xyXG4gICAgICAgIHRoaXMucnBjSW5zdGFuY2UuYXR0YWNoKHByYyk7XHJcbiAgICAgICAgdGhpcy5ycGNJbnN0YW5jZS5yZWdpc3Rlcih7XHJcbiAgICAgICAgICAgIGFzc2V0TWFuYWdlcjogYXNzZXRNYW5hZ2VyLFxyXG4gICAgICAgICAgICBwcm9ncmFtbWluZzogc2NyaXB0TWFuYWdlcixcclxuICAgICAgICAgICAgc2NlbmVDb25maWdJbnN0YW5jZTogc2NlbmVDb25maWdJbnN0YW5jZSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zb2xlLmxvZygnW05vZGVdIFNjZW5lIFByb2Nlc3MgUlBDIHJlYWR5Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmuIXnkIYgUlBDIOWunuS+i1xyXG4gICAgICovXHJcbiAgICBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLnJwY0luc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTm9kZV0gRGlzcG9zaW5nIFJQQyBpbnN0YW5jZScpO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ycGNJbnN0YW5jZS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tOb2RlXSBFcnJvciBkaXNwb3NpbmcgUlBDIGluc3RhbmNlOicsIGVycm9yKTtcclxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucnBjSW5zdGFuY2UgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgUnBjID0gbmV3IFJwY1Byb3h5KCk7XHJcbiJdfQ==