"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverService = exports.ServerService = void 0;
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const fs_extra_1 = require("fs-extra");
const http_1 = require("http");
const https_1 = require("https");
const utils_1 = require("./utils");
const socket_1 = require("./socket");
const middleware_1 = require("./middleware");
const cors_1 = require("./utils/cors");
const path_1 = __importDefault(require("path"));
class ServerService {
    app = (0, express_1.default)();
    server;
    _port = 9527;
    useHttps = false;
    httpsConfig = {
        key: '', // HTTPS 私钥文件路径
        cert: '', // HTTPS 证书文件路径
        ca: '', // 证书的签发请求文件 csr ，没有可省略
    };
    get url() {
        if (this.server && this.server.listening) {
            const httpRoot = this.useHttps ? 'https' : 'http';
            return `${httpRoot}://localhost:${this._port}`;
        }
        return '服务器未启动';
    }
    get port() {
        return this._port;
    }
    async start(port) {
        console.log('🚀 开始启动服务器...');
        this.init();
        this._port = await (0, utils_1.getAvailablePort)(port || this._port);
        this.server = await this.createServer({
            port: this._port,
            useHttps: this.useHttps,
            keyFile: this.httpsConfig.key,
            certFile: this.httpsConfig.cert,
            caFile: this.httpsConfig.ca,
        }, this.app);
        socket_1.socketService.startup(this.server);
        // 打印服务器地址
        this.printServerUrls();
    }
    async stop() {
        return new Promise((resolve, reject) => {
            this.server?.close((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('关闭服务器');
                this.server = undefined;
                resolve();
            });
        });
    }
    /**
     * 创建 HTTP 或 HTTPS 服务器并等待启动
     * @param options 配置对象
     * @param requestHandler
     * @returns Promise<http.Server | https.Server>
     */
    async createServer(options, requestHandler) {
        const { port, useHttps, keyFile, certFile, caFile } = options;
        let server;
        if (useHttps) {
            if (!keyFile || !certFile) {
                return Promise.reject(new Error('HTTPS requires keyFile and certFile'));
            }
            const options = {
                key: undefined,
                cert: undefined,
                ca: undefined,
            };
            if ((0, fs_extra_1.existsSync)(keyFile)) {
                options.key = (0, fs_extra_1.readFileSync)(path_1.default.resolve(keyFile));
            }
            if ((0, fs_extra_1.existsSync)(certFile)) {
                options.cert = (0, fs_extra_1.readFileSync)(certFile);
            }
            if (caFile && (0, fs_extra_1.existsSync)(caFile)) {
                options.ca = (0, fs_extra_1.readFileSync)(caFile);
            }
            server = (0, https_1.createServer)(options, requestHandler);
        }
        else {
            server = (0, http_1.createServer)(requestHandler);
        }
        return new Promise((resolve, reject) => {
            server.once('listening', () => {
                resolve(server);
            });
            server.once('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.error(`❌ 端口 ${port} 已被占用`);
                }
                else {
                    console.error(`❌ ${useHttps ? 'HTTPS' : 'HTTP'} 服务器启动失败:`, err);
                }
                reject(err);
            });
            server.listen(port);
        });
    }
    printServerUrls() {
        const hasListening = !!(this.server && this.server.listening);
        if (!hasListening) {
            console.warn('⚠️ 服务器未开启或未监听端口');
            return;
        }
        console.log(`\n🚀 服务器已启动: ${this.url}`);
    }
    init() {
        this.app.use((0, compression_1.default)());
        this.app.use(cors_1.cors);
        this.app.use(middleware_1.middlewareService.router);
        this.app.use(middleware_1.middlewareService.staticRouter);
        // 未能正常响应的接口
        this.app.use((req, res) => {
            res.status(404);
            res.send('404 - Not Found');
        });
        // 出现错误的接口
        this.app.use((err, req, res, next) => {
            console.error(err);
            res.status(500);
            res.send('500 - Server Error');
        });
    }
    register(name, module) {
        middleware_1.middlewareService.register(name, module);
        this.app.use(middleware_1.middlewareService.router);
    }
}
exports.ServerService = ServerService;
exports.serverService = new ServerService();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZlci9zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsc0RBQTJDO0FBQzNDLDhEQUFzQztBQUN0Qyx1Q0FBb0Q7QUFDcEQsK0JBQThFO0FBQzlFLGlDQUFpRjtBQUNqRixtQ0FBMkM7QUFFM0MscUNBQXlDO0FBQ3pDLDZDQUFpRDtBQUNqRCx1Q0FBb0M7QUFDcEMsZ0RBQXdCO0FBV3hCLE1BQWEsYUFBYTtJQUNkLEdBQUcsR0FBWSxJQUFBLGlCQUFPLEdBQUUsQ0FBQztJQUN6QixNQUFNLENBQXVDO0lBQzdDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDYixRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQ2pCLFdBQVcsR0FBRztRQUNsQixHQUFHLEVBQUUsRUFBRSxFQUFDLGVBQWU7UUFDdkIsSUFBSSxFQUFFLEVBQUUsRUFBQyxlQUFlO1FBQ3hCLEVBQUUsRUFBRSxFQUFFLEVBQUMsdUJBQXVCO0tBQ2pDLENBQUM7SUFFRixJQUFXLEdBQUc7UUFDVixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN2QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUNsRCxPQUFPLEdBQUcsUUFBUSxnQkFBZ0IsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ25ELENBQUM7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRUQsSUFBVyxJQUFJO1FBQ1gsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLElBQWE7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxFQUFFLENB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QztRQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyw4QkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyw4QkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUU3QyxZQUFZO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFRLEVBQUUsR0FBUSxFQUFFLEVBQUU7WUFDaEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQixHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxVQUFVO1FBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFRLEVBQUUsR0FBUSxFQUFFLEdBQVEsRUFBRSxJQUFTLEVBQUUsRUFBRTtZQUNyRCxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEIsR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFFBQVEsQ0FBQyxJQUFZLEVBQUUsTUFBK0I7UUFDbEQsOEJBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyw4QkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQyxDQUFDO0NBQ0o7QUEzSUQsc0NBMklDO0FBRVksUUFBQSxhQUFhLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleHByZXNzLCB7IEV4cHJlc3MgfSBmcm9tICdleHByZXNzJztcclxuaW1wb3J0IGNvbXByZXNzaW9uIGZyb20gJ2NvbXByZXNzaW9uJztcclxuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBjcmVhdGVTZXJ2ZXIgYXMgY3JlYXRlSFRUUFNlcnZlciwgU2VydmVyIGFzIEhUVFBTZXJ2ZXIgfSBmcm9tICdodHRwJztcclxuaW1wb3J0IHsgY3JlYXRlU2VydmVyIGFzIGNyZWF0ZUhUVFBTU2VydmVyLCBTZXJ2ZXIgYXMgSFRUUFNTZXJ2ZXIgfSBmcm9tICdodHRwcyc7XHJcbmltcG9ydCB7IGdldEF2YWlsYWJsZVBvcnQgfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbmltcG9ydCB7IHNvY2tldFNlcnZpY2UgfSBmcm9tICcuL3NvY2tldCc7XHJcbmltcG9ydCB7IG1pZGRsZXdhcmVTZXJ2aWNlIH0gZnJvbSAnLi9taWRkbGV3YXJlJztcclxuaW1wb3J0IHsgY29ycyB9IGZyb20gJy4vdXRpbHMvY29ycyc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBJTWlkZGxld2FyZUNvbnRyaWJ1dGlvbiB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XHJcblxyXG5pbnRlcmZhY2UgU2VydmVyT3B0aW9ucyB7XHJcbiAgICBwb3J0OiBudW1iZXIsLy8g56uv5Y+jXHJcbiAgICB1c2VIdHRwczogYm9vbGVhbjsvLyDmmK/lkKblkK/liqggSFRUUFNcclxuICAgIGtleUZpbGU/OiBzdHJpbmc7IC8vIEhUVFBTIOengemSpeaWh+S7tui3r+W+hFxyXG4gICAgY2VydEZpbGU/OiBzdHJpbmc7Ly8gSFRUUFMg6K+B5Lmm5paH5Lu26Lev5b6EXHJcbiAgICBjYUZpbGU/OiBzdHJpbmc7Ly8g6K+B5Lmm55qE562+5Y+R6K+35rGC5paH5Lu2IGNzclxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2VydmVyU2VydmljZSB7XHJcbiAgICBwcml2YXRlIGFwcDogRXhwcmVzcyA9IGV4cHJlc3MoKTtcclxuICAgIHByaXZhdGUgc2VydmVyOiBIVFRQU2VydmVyIHwgSFRUUFNTZXJ2ZXIgfCB1bmRlZmluZWQ7XHJcbiAgICBwcml2YXRlIF9wb3J0ID0gOTUyNztcclxuICAgIHByaXZhdGUgdXNlSHR0cHMgPSBmYWxzZTtcclxuICAgIHByaXZhdGUgaHR0cHNDb25maWcgPSB7XHJcbiAgICAgICAga2V5OiAnJywvLyBIVFRQUyDnp4HpkqXmlofku7bot6/lvoRcclxuICAgICAgICBjZXJ0OiAnJywvLyBIVFRQUyDor4Hkuabmlofku7bot6/lvoRcclxuICAgICAgICBjYTogJycsLy8g6K+B5Lmm55qE562+5Y+R6K+35rGC5paH5Lu2IGNzciDvvIzmsqHmnInlj6/nnIHnlaVcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGdldCB1cmwoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VydmVyICYmIHRoaXMuc2VydmVyLmxpc3RlbmluZykge1xyXG4gICAgICAgICAgICBjb25zdCBodHRwUm9vdCA9IHRoaXMudXNlSHR0cHMgPyAnaHR0cHMnIDogJ2h0dHAnO1xyXG4gICAgICAgICAgICByZXR1cm4gYCR7aHR0cFJvb3R9Oi8vbG9jYWxob3N0OiR7dGhpcy5fcG9ydH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gJ+acjeWKoeWZqOacquWQr+WKqCc7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBwb3J0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wb3J0O1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHN0YXJ0KHBvcnQ/OiBudW1iZXIpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygn8J+agCDlvIDlp4vlkK/liqjmnI3liqHlmaguLi4nKTtcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB0aGlzLl9wb3J0ID0gYXdhaXQgZ2V0QXZhaWxhYmxlUG9ydChwb3J0IHx8IHRoaXMuX3BvcnQpO1xyXG4gICAgICAgIHRoaXMuc2VydmVyID0gYXdhaXQgdGhpcy5jcmVhdGVTZXJ2ZXIoe1xyXG4gICAgICAgICAgICBwb3J0OiB0aGlzLl9wb3J0LFxyXG4gICAgICAgICAgICB1c2VIdHRwczogdGhpcy51c2VIdHRwcyxcclxuICAgICAgICAgICAga2V5RmlsZTogdGhpcy5odHRwc0NvbmZpZy5rZXksXHJcbiAgICAgICAgICAgIGNlcnRGaWxlOiB0aGlzLmh0dHBzQ29uZmlnLmNlcnQsXHJcbiAgICAgICAgICAgIGNhRmlsZTogdGhpcy5odHRwc0NvbmZpZy5jYSxcclxuICAgICAgICB9LCB0aGlzLmFwcCk7XHJcbiAgICAgICAgc29ja2V0U2VydmljZS5zdGFydHVwKHRoaXMuc2VydmVyKTtcclxuICAgICAgICAvLyDmiZPljbDmnI3liqHlmajlnLDlnYBcclxuICAgICAgICB0aGlzLnByaW50U2VydmVyVXJscygpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZXJ2ZXI/LmNsb3NlKChlcnI/OiBFcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCflhbPpl63mnI3liqHlmagnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VydmVyID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7ogSFRUUCDmiJYgSFRUUFMg5pyN5Yqh5Zmo5bm2562J5b6F5ZCv5YqoXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyDphY3nva7lr7nosaFcclxuICAgICAqIEBwYXJhbSByZXF1ZXN0SGFuZGxlclxyXG4gICAgICogQHJldHVybnMgUHJvbWlzZTxodHRwLlNlcnZlciB8IGh0dHBzLlNlcnZlcj5cclxuICAgICAqL1xyXG4gICAgYXN5bmMgY3JlYXRlU2VydmVyKG9wdGlvbnM6IFNlcnZlck9wdGlvbnMsIHJlcXVlc3RIYW5kbGVyOiBFeHByZXNzKTogUHJvbWlzZTxIVFRQU2VydmVyIHwgSFRUUFNTZXJ2ZXI+IHtcclxuICAgICAgICBjb25zdCB7IHBvcnQsIHVzZUh0dHBzLCBrZXlGaWxlLCBjZXJ0RmlsZSwgY2FGaWxlIH0gPSBvcHRpb25zO1xyXG5cclxuICAgICAgICBsZXQgc2VydmVyOiBIVFRQU2VydmVyIHwgSFRUUFNTZXJ2ZXI7XHJcblxyXG4gICAgICAgIGlmICh1c2VIdHRwcykge1xyXG4gICAgICAgICAgICBpZiAoIWtleUZpbGUgfHwgIWNlcnRGaWxlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdIVFRQUyByZXF1aXJlcyBrZXlGaWxlIGFuZCBjZXJ0RmlsZScpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBvcHRpb25zOiB7IGtleT86IEJ1ZmZlciwgY2VydD86IEJ1ZmZlciwgY2E/OiBCdWZmZXIsIH0gPSB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgIGNlcnQ6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgIGNhOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChleGlzdHNTeW5jKGtleUZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmtleSA9IHJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoa2V5RmlsZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChleGlzdHNTeW5jKGNlcnRGaWxlKSkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5jZXJ0ID0gcmVhZEZpbGVTeW5jKGNlcnRGaWxlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2FGaWxlICYmIGV4aXN0c1N5bmMoY2FGaWxlKSkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5jYSA9IHJlYWRGaWxlU3luYyhjYUZpbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNlcnZlciA9IGNyZWF0ZUhUVFBTU2VydmVyKG9wdGlvbnMsIHJlcXVlc3RIYW5kbGVyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZXJ2ZXIgPSBjcmVhdGVIVFRQU2VydmVyKHJlcXVlc3RIYW5kbGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHNlcnZlci5vbmNlKCdsaXN0ZW5pbmcnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHNlcnZlcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VydmVyLm9uY2UoJ2Vycm9yJywgKGVycjogTm9kZUpTLkVycm5vRXhjZXB0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyLmNvZGUgPT09ICdFQUREUklOVVNFJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOKdjCDnq6/lj6MgJHtwb3J0fSDlt7LooqvljaDnlKhgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihg4p2MICR7dXNlSHR0cHMgPyAnSFRUUFMnIDogJ0hUVFAnfSDmnI3liqHlmajlkK/liqjlpLHotKU6YCwgZXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlcnZlci5saXN0ZW4ocG9ydCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwcmludFNlcnZlclVybHMoKSB7XHJcbiAgICAgICAgY29uc3QgaGFzTGlzdGVuaW5nID0gISEodGhpcy5zZXJ2ZXIgJiYgdGhpcy5zZXJ2ZXIubGlzdGVuaW5nKTtcclxuICAgICAgICBpZiAoIWhhc0xpc3RlbmluZykge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ+KaoO+4jyDmnI3liqHlmajmnKrlvIDlkK/miJbmnKrnm5HlkKznq6/lj6MnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZyhgXFxu8J+agCDmnI3liqHlmajlt7LlkK/liqg6ICR7dGhpcy51cmx9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmFwcC51c2UoY29tcHJlc3Npb24oKSk7XHJcbiAgICAgICAgdGhpcy5hcHAudXNlKGNvcnMpO1xyXG4gICAgICAgIHRoaXMuYXBwLnVzZShtaWRkbGV3YXJlU2VydmljZS5yb3V0ZXIpO1xyXG4gICAgICAgIHRoaXMuYXBwLnVzZShtaWRkbGV3YXJlU2VydmljZS5zdGF0aWNSb3V0ZXIpO1xyXG5cclxuICAgICAgICAvLyDmnKrog73mraPluLjlk43lupTnmoTmjqXlj6NcclxuICAgICAgICB0aGlzLmFwcC51c2UoKHJlcTogYW55LCByZXM6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzKDQwNCk7XHJcbiAgICAgICAgICAgIHJlcy5zZW5kKCc0MDQgLSBOb3QgRm91bmQnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8g5Ye6546w6ZSZ6K+v55qE5o6l5Y+jXHJcbiAgICAgICAgdGhpcy5hcHAudXNlKChlcnI6IGFueSwgcmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzKDUwMCk7XHJcbiAgICAgICAgICAgIHJlcy5zZW5kKCc1MDAgLSBTZXJ2ZXIgRXJyb3InKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZWdpc3RlcihuYW1lOiBzdHJpbmcsIG1vZHVsZTogSU1pZGRsZXdhcmVDb250cmlidXRpb24pIHtcclxuICAgICAgICBtaWRkbGV3YXJlU2VydmljZS5yZWdpc3RlcihuYW1lLCBtb2R1bGUpO1xyXG4gICAgICAgIHRoaXMuYXBwLnVzZShtaWRkbGV3YXJlU2VydmljZS5yb3V0ZXIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2VydmVyU2VydmljZSA9IG5ldyBTZXJ2ZXJTZXJ2aWNlKCk7XHJcbiJdfQ==