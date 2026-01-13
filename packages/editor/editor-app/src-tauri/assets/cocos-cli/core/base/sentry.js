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
exports.initSentry = initSentry;
exports.captureException = captureException;
const Sentry = __importStar(require("@sentry/node"));
const console_1 = require("./console");
/**
 * Sentry 初始化器
 */
class SentryInitializer {
    static initialized = false;
    /**
     * 初始化 Sentry
     * @param config Sentry 配置
     */
    static init() {
        if (this.initialized) {
            return;
        }
        const sentryConfig = {
            dsn: 'https://4d4b6f03b83b47a4aad50674eedd087e@sentry.cocos.org/12',
            // dsn: 'https://d1228c9c9d49468a9f6795d0f8f66df3@sentry.cocos.org/11',
            environment: 'development',
            release: require('../../../package.json').version,
            debug: false,
            tracesSampleRate: 0.2,
            sampleRate: 0.5,
            user: {
                id: 'cli-alpha-test',
            },
        };
        // 如果没有 DSN，跳过初始化
        if (!sentryConfig.dsn) {
            return;
        }
        try {
            Sentry.init({
                ...sentryConfig,
                beforeSend(event) {
                    // 过滤敏感信息
                    if (event.request?.cookies) {
                        delete event.request.cookies;
                    }
                    if (event.request?.headers) {
                        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
                        sensitiveHeaders.forEach(header => {
                            delete event.request.headers[header];
                        });
                    }
                    return event;
                },
            });
            // // 设置用户信息
            // if (config.user) {
            //     Sentry.setUser(config.user);
            // }
            // // 设置标签
            // if (config.tags) {
            //     Sentry.setTags(config.tags);
            // }
            // // 设置额外上下文
            // if (config.extra) {
            //     Sentry.setContext('extra', config.extra);
            // }
            // 设置全局上下文
            Sentry.setContext('app', {
                name: 'cocos-cli',
                version: process.env.npm_package_version || '1.0.0',
                node_version: process.version,
                platform: process.platform,
                arch: process.arch,
            });
            setupGlobalErrorHandlers();
            this.initialized = true;
        }
        catch (error) {
        }
    }
    /**
     * 捕获异常
     * @param error 错误对象
     * @param context 额外上下文
     */
    static captureException(error, context) {
        if (!this.initialized) {
            return;
        }
        try {
            if (context) {
                Sentry.withScope(scope => {
                    Object.entries(context).forEach(([key, value]) => {
                        scope.setContext(key, value);
                    });
                    Sentry.captureException(error);
                });
            }
            else {
                Sentry.captureException(error);
            }
        }
        catch (e) {
        }
    }
    /**
     * 获取是否已初始化
     */
    static get isInitialized() {
        return this.initialized;
    }
}
/**
 * 全局错误处理器
 */
function setupGlobalErrorHandlers() {
    // 捕获未处理的异常
    process.on('uncaughtException', (error) => {
        console_1.newConsole.error(`[Global] 未捕获的异常: ${error instanceof Error ? error.message : String(error)}`);
        SentryInitializer.captureException(error, {
            type: 'uncaughtException',
            timestamp: new Date().toISOString(),
        });
    });
    // 捕获未处理的 Promise 拒绝
    process.on('unhandledRejection', (reason, promise) => {
        console_1.newConsole.error(`[Global] 未处理的 Promise 拒绝: ${reason instanceof Error ? reason.message : String(reason)}`);
        SentryInitializer.captureException(reason instanceof Error ? reason : new Error(String(reason)), {
            type: 'unhandledRejection',
            promise: promise.toString(),
            timestamp: new Date().toISOString(),
        });
    });
}
/**
 * 便捷的初始化函数
 */
function initSentry() {
    try {
        SentryInitializer.init();
    }
    catch (error) {
    }
}
/**
 * 便捷的异常捕获函数
 * @param error 错误对象
 * @param context 额外上下文
 */
function captureException(error, context) {
    SentryInitializer.captureException(error, context);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VudHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvYmFzZS9zZW50cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE4S0EsZ0NBS0M7QUFPRCw0Q0FFQztBQTVMRCxxREFBdUM7QUFDdkMsdUNBQXVDO0FBNEJ2Qzs7R0FFRztBQUNILE1BQU0saUJBQWlCO0lBQ1gsTUFBTSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7SUFFbkM7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLElBQUk7UUFDZCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQixPQUFPO1FBQ1gsQ0FBQztRQUVELE1BQU0sWUFBWSxHQUFHO1lBQ2pCLEdBQUcsRUFBRSw4REFBOEQ7WUFDbkUsdUVBQXVFO1lBQ3ZFLFdBQVcsRUFBRSxhQUFhO1lBQzFCLE9BQU8sRUFBRSxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxPQUFPO1lBQ2pELEtBQUssRUFBRSxLQUFLO1lBQ1osZ0JBQWdCLEVBQUUsR0FBRztZQUNyQixVQUFVLEVBQUUsR0FBRztZQUNmLElBQUksRUFBRTtnQkFDRixFQUFFLEVBQUUsZ0JBQWdCO2FBQ3ZCO1NBQ0osQ0FBQztRQUVGLGlCQUFpQjtRQUNqQixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLE9BQU87UUFDWCxDQUFDO1FBRUQsSUFBSSxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDUixHQUFHLFlBQVk7Z0JBQ2YsVUFBVSxDQUFDLEtBQUs7b0JBQ1osU0FBUztvQkFDVCxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUM7d0JBQ3pCLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7b0JBQ2pDLENBQUM7b0JBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFB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QU0sRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUNqRCxvQkFBVSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsTUFBTSxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzRyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FDOUIsTUFBTSxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFDNUQ7WUFDSSxJQUFJLEVBQUUsb0JBQW9CO1lBQzFCLE9BQU8sRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQzNCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUN0QyxDQUNKLENBQUM7SUFDTixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLFVBQVU7SUFDdEIsSUFBSSxDQUFDO1FBQ0QsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztBQUNMLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsZ0JBQWdCLENBQUMsS0FBWSxFQUFFLE9BQTZCO0lBQ3hFLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN2RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgU2VudHJ5IGZyb20gJ0BzZW50cnkvbm9kZSc7XHJcbmltcG9ydCB7IG5ld0NvbnNvbGUgfSBmcm9tICcuL2NvbnNvbGUnO1xyXG5cclxuLyoqXHJcbiAqIFNlbnRyeSDphY3nva7pgInpoblcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2VudHJ5Q29uZmlnIHtcclxuICAgIC8qKiBTZW50cnkgRFNOICovXHJcbiAgICBkc24/OiBzdHJpbmc7XHJcbiAgICAvKiog546v5aKD5ZCN56ewICovXHJcbiAgICBlbnZpcm9ubWVudD86IHN0cmluZztcclxuICAgIC8qKiDlj5HluIPniYjmnKwgKi9cclxuICAgIHJlbGVhc2U/OiBzdHJpbmc7XHJcbiAgICAvKiog5piv5ZCm5ZCv55So6LCD6K+V5qih5byPICovXHJcbiAgICBkZWJ1Zz86IGJvb2xlYW47XHJcbiAgICAvKiog6YeH5qC3546HICgwLjAgLSAxLjApICovXHJcbiAgICB0cmFjZXNTYW1wbGVSYXRlPzogbnVtYmVyO1xyXG4gICAgLyoqIOeUqOaIt+S/oeaBryAqL1xyXG4gICAgdXNlcj86IHtcclxuICAgICAgICBpZD86IHN0cmluZztcclxuICAgICAgICB1c2VybmFtZT86IHN0cmluZztcclxuICAgICAgICBlbWFpbD86IHN0cmluZztcclxuICAgIH07XHJcbiAgICAvKiog5qCH562+ICovXHJcbiAgICB0YWdzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcclxuICAgIC8qKiDpop3lpJbkuIrkuIvmlocgKi9cclxuICAgIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55PjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNlbnRyeSDliJ3lp4vljJblmahcclxuICovXHJcbmNsYXNzIFNlbnRyeUluaXRpYWxpemVyIHtcclxuICAgIHByaXZhdGUgc3RhdGljIGluaXRpYWxpemVkID0gZmFsc2U7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJ3lp4vljJYgU2VudHJ5XHJcbiAgICAgKiBAcGFyYW0gY29uZmlnIFNlbnRyeSDphY3nva5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBpbml0KCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNlbnRyeUNvbmZpZyA9IHtcclxuICAgICAgICAgICAgZHNuOiAnaHR0cHM6Ly80ZDRiNmYwM2I4M2I0N2E0YWFkNTA2NzRlZWRkMDg3ZUBzZW50cnkuY29jb3Mub3JnLzEyJyxcclxuICAgICAgICAgICAgLy8gZHNuOiAnaHR0cHM6Ly9kMTIyOGM5YzlkNDk0NjhhOWY2Nzk1ZDBmOGY2NmRmM0BzZW50cnkuY29jb3Mub3JnLzExJyxcclxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6ICdkZXZlbG9wbWVudCcsXHJcbiAgICAgICAgICAgIHJlbGVhc2U6IHJlcXVpcmUoJy4uLy4uLy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24sXHJcbiAgICAgICAgICAgIGRlYnVnOiBmYWxzZSxcclxuICAgICAgICAgICAgdHJhY2VzU2FtcGxlUmF0ZTogMC4yLFxyXG4gICAgICAgICAgICBzYW1wbGVSYXRlOiAwLjUsXHJcbiAgICAgICAgICAgIHVzZXI6IHtcclxuICAgICAgICAgICAgICAgIGlkOiAnY2xpLWFscGhhLXRlc3QnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIOWmguaenOayoeaciSBEU07vvIzot7Pov4fliJ3lp4vljJZcclxuICAgICAgICBpZiAoIXNlbnRyeUNvbmZpZy5kc24pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgU2VudHJ5LmluaXQoe1xyXG4gICAgICAgICAgICAgICAgLi4uc2VudHJ5Q29uZmlnLFxyXG4gICAgICAgICAgICAgICAgYmVmb3JlU2VuZChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOi/h+a7pOaVj+aEn+S/oeaBr1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5yZXF1ZXN0Py5jb29raWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBldmVudC5yZXF1ZXN0LmNvb2tpZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5yZXF1ZXN0Py5oZWFkZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbnNpdGl2ZUhlYWRlcnMgPSBbJ2F1dGhvcml6YXRpb24nLCAnY29va2llJywgJ3gtYXBpLWtleSddO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5zaXRpdmVIZWFkZXJzLmZvckVhY2goaGVhZGVyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBldmVudC5yZXF1ZXN0IS5oZWFkZXJzIVtoZWFkZXJdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2ZW50O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyAvLyDorr7nva7nlKjmiLfkv6Hmga9cclxuICAgICAgICAgICAgLy8gaWYgKGNvbmZpZy51c2VyKSB7XHJcbiAgICAgICAgICAgIC8vICAgICBTZW50cnkuc2V0VXNlcihjb25maWcudXNlcik7XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIC8vIC8vIOiuvue9ruagh+etvlxyXG4gICAgICAgICAgICAvLyBpZiAoY29uZmlnLnRhZ3MpIHtcclxuICAgICAgICAgICAgLy8gICAgIFNlbnRyeS5zZXRUYWdzKGNvbmZpZy50YWdzKTtcclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgLy8gLy8g6K6+572u6aKd5aSW5LiK5LiL5paHXHJcbiAgICAgICAgICAgIC8vIGlmIChjb25maWcuZXh0cmEpIHtcclxuICAgICAgICAgICAgLy8gICAgIFNlbnRyeS5zZXRDb250ZXh0KCdleHRyYScsIGNvbmZpZy5leHRyYSk7XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIC8vIOiuvue9ruWFqOWxgOS4iuS4i+aWh1xyXG4gICAgICAgICAgICBTZW50cnkuc2V0Q29udGV4dCgnYXBwJywge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ2NvY29zLWNsaScsXHJcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiBwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9uIHx8ICcxLjAuMCcsXHJcbiAgICAgICAgICAgICAgICBub2RlX3ZlcnNpb246IHByb2Nlc3MudmVyc2lvbixcclxuICAgICAgICAgICAgICAgIHBsYXRmb3JtOiBwcm9jZXNzLnBsYXRmb3JtLFxyXG4gICAgICAgICAgICAgICAgYXJjaDogcHJvY2Vzcy5hcmNoLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNldHVwR2xvYmFsRXJyb3JIYW5kbGVycygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmjZXojrflvILluLhcclxuICAgICAqIEBwYXJhbSBlcnJvciDplJnor6/lr7nosaFcclxuICAgICAqIEBwYXJhbSBjb250ZXh0IOmineWkluS4iuS4i+aWh1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNhcHR1cmVFeGNlcHRpb24oZXJyb3I6IEVycm9yLCBjb250ZXh0PzogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAoY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgU2VudHJ5LndpdGhTY29wZShzY29wZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoY29udGV4dCkuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnNldENvbnRleHQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgU2VudHJ5LmNhcHR1cmVFeGNlcHRpb24oZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBTZW50cnkuY2FwdHVyZUV4Y2VwdGlvbihlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5piv5ZCm5bey5Yid5aeL5YyWXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IGlzSW5pdGlhbGl6ZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5pdGlhbGl6ZWQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDlhajlsYDplJnor6/lpITnkIblmahcclxuICovXHJcbmZ1bmN0aW9uIHNldHVwR2xvYmFsRXJyb3JIYW5kbGVycygpOiB2b2lkIHtcclxuICAgIC8vIOaNleiOt+acquWkhOeQhueahOW8guW4uFxyXG4gICAgcHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCAoZXJyb3IpID0+IHtcclxuICAgICAgICBuZXdDb25zb2xlLmVycm9yKGBbR2xvYmFsXSDmnKrmjZXojrfnmoTlvILluLg6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xyXG4gICAgICAgIFNlbnRyeUluaXRpYWxpemVyLmNhcHR1cmVFeGNlcHRpb24oZXJyb3IsIHtcclxuICAgICAgICAgICAgdHlwZTogJ3VuY2F1Z2h0RXhjZXB0aW9uJyxcclxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyDmjZXojrfmnKrlpITnkIbnmoQgUHJvbWlzZSDmi5Lnu51cclxuICAgIHByb2Nlc3Mub24oJ3VuaGFuZGxlZFJlamVjdGlvbicsIChyZWFzb24sIHByb21pc2UpID0+IHtcclxuICAgICAgICBuZXdDb25zb2xlLmVycm9yKGBbR2xvYmFsXSDmnKrlpITnkIbnmoQgUHJvbWlzZSDmi5Lnu506ICR7cmVhc29uIGluc3RhbmNlb2YgRXJyb3IgPyByZWFzb24ubWVzc2FnZSA6IFN0cmluZyhyZWFzb24pfWApO1xyXG4gICAgICAgIFNlbnRyeUluaXRpYWxpemVyLmNhcHR1cmVFeGNlcHRpb24oXHJcbiAgICAgICAgICAgIHJlYXNvbiBpbnN0YW5jZW9mIEVycm9yID8gcmVhc29uIDogbmV3IEVycm9yKFN0cmluZyhyZWFzb24pKSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3VuaGFuZGxlZFJlamVjdGlvbicsXHJcbiAgICAgICAgICAgICAgICBwcm9taXNlOiBwcm9taXNlLnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOS+v+aNt+eahOWIneWni+WMluWHveaVsFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRTZW50cnkoKTogdm9pZCB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIFNlbnRyeUluaXRpYWxpemVyLmluaXQoKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkvr/mjbfnmoTlvILluLjmjZXojrflh73mlbBcclxuICogQHBhcmFtIGVycm9yIOmUmeivr+WvueixoVxyXG4gKiBAcGFyYW0gY29udGV4dCDpop3lpJbkuIrkuIvmlodcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjYXB0dXJlRXhjZXB0aW9uKGVycm9yOiBFcnJvciwgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIGFueT4pOiB2b2lkIHtcclxuICAgIFNlbnRyeUluaXRpYWxpemVyLmNhcHR1cmVFeGNlcHRpb24oZXJyb3IsIGNvbnRleHQpO1xyXG59XHJcbiJdfQ==