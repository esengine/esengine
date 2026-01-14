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
exports.middlewareService = exports.MiddlewareManager = void 0;
const express_1 = __importStar(require("express"));
class MiddlewareManager {
    router = (0, express_1.Router)();
    staticRouter = (0, express_1.Router)();
    middlewareStaticFile = [];
    middlewareSocket = new Map();
    /** 加载中间件模块 */
    register(name, module) {
        module.get?.forEach((m) => {
            this.router.get(m.url, m.handler);
        });
        module.post?.forEach((m) => {
            this.router.post(m.url, m.handler);
        });
        module.staticFiles?.forEach((m) => {
            this.middlewareStaticFile.push(m);
            this.staticRouter.use(m.url, express_1.default.static(m.path));
        });
        if (module.socket) {
            this.middlewareSocket.set(name, {
                disconnect: module.socket.disconnect,
                connection: module.socket.connection,
            });
        }
    }
}
exports.MiddlewareManager = MiddlewareManager;
exports.middlewareService = new MiddlewareManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvbWlkZGxld2FyZS9jb3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLG1EQUEwQztBQUUxQyxNQUFhLGlCQUFpQjtJQUNuQixNQUFNLEdBQUcsSUFBQSxnQkFBTSxHQUFFLENBQUM7SUFDbEIsWUFBWSxHQUFHLElBQUEsZ0JBQU0sR0FBRSxDQUFDO0lBQ3hCLG9CQUFvQixHQUF3QixFQUFFLENBQUM7SUFDL0MsZ0JBQWdCLEdBQStCLElBQUksR0FBRyxFQUFFLENBQUM7SUFFaEUsY0FBYztJQUNkLFFBQVEsQ0FBQyxJQUFZLEVBQUUsTUFBK0I7UUFDbEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFpQixFQUFFLEVBQUU7WUFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQWlCLEVBQUUsRUFBRTtZQUN2QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBb0IsRUFBRSxFQUFFO1lBQ2pELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFO2dCQUM1QixVQUFVLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVO2dCQUNwQyxVQUFVLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVO2FBQ3ZDLENBQUMsQ0FBQztRQUNQLENBQUM7SUFDTCxDQUFDO0NBQ0o7QUF6QkQsOENBeUJDO0FBRVksUUFBQSxpQkFBaUIsR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJR2V0UG9zdENvbmZpZywgSU1pZGRsZXdhcmVDb250cmlidXRpb24sIElTb2NrZXRDb25maWcsIElTdGF0aWNGaWxlQ29uZmlnIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XHJcbmltcG9ydCBleHByZXNzLCB7IFJvdXRlciB9IGZyb20gJ2V4cHJlc3MnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE1pZGRsZXdhcmVNYW5hZ2VyIHtcclxuICAgIHB1YmxpYyByb3V0ZXIgPSBSb3V0ZXIoKTtcclxuICAgIHB1YmxpYyBzdGF0aWNSb3V0ZXIgPSBSb3V0ZXIoKTtcclxuICAgIHB1YmxpYyBtaWRkbGV3YXJlU3RhdGljRmlsZTogSVN0YXRpY0ZpbGVDb25maWdbXSA9IFtdO1xyXG4gICAgcHVibGljIG1pZGRsZXdhcmVTb2NrZXQ6IE1hcDxzdHJpbmcsIElTb2NrZXRDb25maWc+ID0gbmV3IE1hcCgpO1xyXG5cclxuICAgIC8qKiDliqDovb3kuK3pl7Tku7bmqKHlnZcgKi9cclxuICAgIHJlZ2lzdGVyKG5hbWU6IHN0cmluZywgbW9kdWxlOiBJTWlkZGxld2FyZUNvbnRyaWJ1dGlvbikge1xyXG4gICAgICAgIG1vZHVsZS5nZXQ/LmZvckVhY2goKG06IElHZXRQb3N0Q29uZmlnKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucm91dGVyLmdldChtLnVybCwgbS5oYW5kbGVyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBtb2R1bGUucG9zdD8uZm9yRWFjaCgobTogSUdldFBvc3RDb25maWcpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yb3V0ZXIucG9zdChtLnVybCwgbS5oYW5kbGVyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBtb2R1bGUuc3RhdGljRmlsZXM/LmZvckVhY2goKG06IElTdGF0aWNGaWxlQ29uZmlnKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubWlkZGxld2FyZVN0YXRpY0ZpbGUucHVzaChtKTtcclxuICAgICAgICAgICAgdGhpcy5zdGF0aWNSb3V0ZXIudXNlKG0udXJsLCBleHByZXNzLnN0YXRpYyhtLnBhdGgpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAobW9kdWxlLnNvY2tldCkge1xyXG4gICAgICAgICAgICB0aGlzLm1pZGRsZXdhcmVTb2NrZXQuc2V0KG5hbWUsIHtcclxuICAgICAgICAgICAgICAgIGRpc2Nvbm5lY3Q6IG1vZHVsZS5zb2NrZXQuZGlzY29ubmVjdCxcclxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb246IG1vZHVsZS5zb2NrZXQuY29ubmVjdGlvbixcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgbWlkZGxld2FyZVNlcnZpY2UgPSBuZXcgTWlkZGxld2FyZU1hbmFnZXIoKTtcclxuIl19