"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailablePort = getAvailablePort;
const net_1 = __importDefault(require("net"));
/**
 * 获取当前系统可用端口
 * @param preferredPort 希望使用的起始端口
 */
async function getAvailablePort(preferredPort) {
    return new Promise((resolve, reject) => {
        const server = net_1.default.createServer();
        server.unref(); // 不阻止 Node 进程退出
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // 端口被占用 -> 递归尝试下一个端口
                resolve(getAvailablePort(preferredPort + 1));
            }
            else {
                reject(err);
            }
        });
        server.listen(preferredPort, () => {
            const { port } = server.address();
            server.close(() => resolve(port));
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmVyL3V0aWxzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBTUEsNENBb0JDO0FBMUJELDhDQUFzQjtBQUV0Qjs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsYUFBcUI7SUFDeEQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNuQyxNQUFNLE1BQU0sR0FBRyxhQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFbEMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsZ0JBQWdCO1FBRWhDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBUSxFQUFFLEVBQUU7WUFDNUIsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLFlBQVksRUFBRSxDQUFDO2dCQUM1QixxQkFBcUI7Z0JBQ3JCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRCxDQUFDO2lCQUFNLENBQUM7Z0JBQ0osTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtZQUM5QixNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBcUIsQ0FBQztZQUNyRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG5ldCBmcm9tICduZXQnO1xyXG5cclxuLyoqXHJcbiAqIOiOt+WPluW9k+WJjeezu+e7n+WPr+eUqOerr+WPo1xyXG4gKiBAcGFyYW0gcHJlZmVycmVkUG9ydCDluIzmnJvkvb/nlKjnmoTotbflp4vnq6/lj6NcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBdmFpbGFibGVQb3J0KHByZWZlcnJlZFBvcnQ6IG51bWJlcik6IFByb21pc2U8bnVtYmVyPiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNlcnZlciA9IG5ldC5jcmVhdGVTZXJ2ZXIoKTtcclxuXHJcbiAgICAgICAgc2VydmVyLnVucmVmKCk7IC8vIOS4jemYu+atoiBOb2RlIOi/m+eoi+mAgOWHulxyXG5cclxuICAgICAgICBzZXJ2ZXIub24oJ2Vycm9yJywgKGVycjogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlcnIuY29kZSA9PT0gJ0VBRERSSU5VU0UnKSB7XHJcbiAgICAgICAgICAgICAgICAvLyDnq6/lj6PooqvljaDnlKggLT4g6YCS5b2S5bCd6K+V5LiL5LiA5Liq56uv5Y+jXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGdldEF2YWlsYWJsZVBvcnQocHJlZmVycmVkUG9ydCArIDEpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHNlcnZlci5saXN0ZW4ocHJlZmVycmVkUG9ydCwgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7IHBvcnQgfSA9IHNlcnZlci5hZGRyZXNzKCkgYXMgbmV0LkFkZHJlc3NJbmZvO1xyXG4gICAgICAgICAgICBzZXJ2ZXIuY2xvc2UoKCkgPT4gcmVzb2x2ZShwb3J0KSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG4iXX0=