"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = exports.SocketService = void 0;
const middleware_1 = require("./middleware");
const socket_io_1 = require("socket.io");
class SocketService {
    io;
    /**
     * 启动 io 服务器
     * @param server http 服务器
     */
    startup(server) {
        this.io = new socket_io_1.Server(server);
        this.io.on('connection', (socket) => {
            console.log(`socket ${socket.id} connected`);
            middleware_1.middlewareService.middlewareSocket.forEach((middleware) => {
                middleware.connection(socket);
            });
            socket.on('disconnect', () => {
                middleware_1.middlewareService.middlewareSocket.forEach((middleware) => {
                    middleware.disconnect(socket);
                });
            });
        });
    }
    /**
     * 断开与客户端的连接
     */
    disconnect() {
        this.io?.disconnectSockets();
    }
}
exports.SocketService = SocketService;
exports.socketService = new SocketService();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZlci9zb2NrZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsNkNBQWlEO0FBQ2pELHlDQUFtQztBQUVuQyxNQUFhLGFBQWE7SUFDZixFQUFFLENBQXFCO0lBRTlCOzs7T0FHRztJQUNILE9BQU8sQ0FBQyxNQUFnQztRQUNwQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksa0JBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFXLEVBQUUsRUFBRTtZQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsTUFBTSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDN0MsOEJBQWlCLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQ3RELFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7Z0JBQ3pCLDhCQUFpQixDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO29CQUN0RCxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNsQyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxVQUFVO1FBQ04sSUFBSSxDQUFDLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxDQUFDO0lBQ2pDLENBQUM7Q0FDSjtBQTVCRCxzQ0E0QkM7QUFFWSxRQUFBLGFBQWEsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBTZXJ2ZXIgYXMgSFRUUFNlcnZlciB9IGZyb20gJ2h0dHAnO1xyXG5pbXBvcnQgdHlwZSB7IFNlcnZlciBhcyBIVFRQU1NlcnZlciB9IGZyb20gJ2h0dHBzJztcclxuaW1wb3J0IHsgbWlkZGxld2FyZVNlcnZpY2UgfSBmcm9tICcuL21pZGRsZXdhcmUnO1xyXG5pbXBvcnQgeyBTZXJ2ZXIgfSBmcm9tICdzb2NrZXQuaW8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIFNvY2tldFNlcnZpY2Uge1xyXG4gICAgcHVibGljIGlvOiBTZXJ2ZXIgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlkK/liqggaW8g5pyN5Yqh5ZmoXHJcbiAgICAgKiBAcGFyYW0gc2VydmVyIGh0dHAg5pyN5Yqh5ZmoXHJcbiAgICAgKi9cclxuICAgIHN0YXJ0dXAoc2VydmVyOiBIVFRQU2VydmVyIHwgSFRUUFNTZXJ2ZXIpIHtcclxuICAgICAgICB0aGlzLmlvID0gbmV3IFNlcnZlcihzZXJ2ZXIpO1xyXG4gICAgICAgIHRoaXMuaW8ub24oJ2Nvbm5lY3Rpb24nLCAoc29ja2V0OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHNvY2tldCAke3NvY2tldC5pZH0gY29ubmVjdGVkYCk7XHJcbiAgICAgICAgICAgIG1pZGRsZXdhcmVTZXJ2aWNlLm1pZGRsZXdhcmVTb2NrZXQuZm9yRWFjaCgobWlkZGxld2FyZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbWlkZGxld2FyZS5jb25uZWN0aW9uKHNvY2tldCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBtaWRkbGV3YXJlU2VydmljZS5taWRkbGV3YXJlU29ja2V0LmZvckVhY2goKG1pZGRsZXdhcmUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBtaWRkbGV3YXJlLmRpc2Nvbm5lY3Qoc29ja2V0KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaWreW8gOS4juWuouaIt+err+eahOi/nuaOpVxyXG4gICAgICovXHJcbiAgICBkaXNjb25uZWN0KCkge1xyXG4gICAgICAgIHRoaXMuaW8/LmRpc2Nvbm5lY3RTb2NrZXRzKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzb2NrZXRTZXJ2aWNlID0gbmV3IFNvY2tldFNlcnZpY2UoKTtcclxuIl19