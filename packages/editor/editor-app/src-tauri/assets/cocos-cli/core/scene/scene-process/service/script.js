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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptService = void 0;
const cc_1 = __importDefault(require("cc"));
const executor_1 = require("@cocos/lib-programming/dist/executor");
const loader_1 = require("@cocos/creator-programming-quick-pack/lib/loader");
const rpc_1 = require("../rpc");
const core_1 = require("./core");
const utils_1 = __importDefault(require("../../../base/utils"));
/**
 * 异步迭代。有以下特点：
 * 1. 每次调用 `nextIteration()` 会执行一次传入的**迭代函数**；迭代函数允许是异步的，在构造函数中确定之后不能更改；
 * 2. 同时**最多仅会有一例**迭代在执行；
 * 3. **迭代是可合并的**，也就是说，在前面的迭代没完成之前，后面的所有迭代都会被合并成一个。
 */
class AsyncIterationConcurrency1 {
    _iterate;
    _executionPromise = null;
    _pendingPromise = null;
    constructor(iterate) {
        this._iterate = iterate;
    }
    nextIteration() {
        if (!this._executionPromise) {
            // 如果未在执行，那就去执行
            // assert(!this._pendingPromise)
            return this._executionPromise = Promise.resolve(this._iterate()).finally(() => {
                this._executionPromise = null;
            });
        }
        else if (!this._pendingPromise) {
            // 如果没有等待队列，创建等待 promise，在 执行 promise 完成后执行
            return this._pendingPromise = this._executionPromise.finally(() => {
                this._pendingPromise = null;
                // 等待 promise 将等待执行 promise，并在完成后重新入队
                return this.nextIteration();
            });
        }
        else {
            // 如果已经有等待队列，那就等待现有的队列
            return this._pendingPromise;
        }
    }
}
/**
 * 导入时异常的消息的标签。
 */
const importExceptionLogTag = '::SceneExecutorImportExceptionHandler::';
const importExceptionLogRegex = new RegExp(importExceptionLogTag);
class GlobalEnv {
    async record(fn) {
        this.clear();
        this._queue.push(async () => {
            const beforeKeys = Object.keys(globalThis);
            await fn();
            const afterKeys = Object.keys(globalThis);
            for (const afterKey of afterKeys) {
                if (!beforeKeys.includes(afterKey)) {
                    this._incrementalKeys.add(afterKey);
                }
            }
            console.debug(`Incremental keys: ${Array.from(this._incrementalKeys)}`);
        });
        await this.processQueue(); // 处理队列
    }
    clear() {
        this._queue.push(async () => {
            for (const incrementalKey of this._incrementalKeys) {
                delete globalThis[incrementalKey];
            }
            this._incrementalKeys.clear();
        });
    }
    async processQueue() {
        while (this._queue.length > 0) {
            const next = this._queue.shift();
            if (next)
                await next(); // 执行队列中的下一个任务
        }
    }
    _incrementalKeys = new Set();
    _queue = [];
}
const globalEnv = new GlobalEnv();
let ScriptService = class ScriptService extends core_1.BaseService {
    _executor;
    _suspendPromise = null;
    _syncPluginScripts;
    _reloadScripts;
    /**
     * 非引擎定义的组件
     * @private
     */
    customComponents = new Set();
    constructor() {
        super();
        this._reloadScripts = new AsyncIterationConcurrency1(() => this._execute());
        this._syncPluginScripts = new AsyncIterationConcurrency1(() => this._syncPluginScriptList());
    }
    /**
     * 挂起脚本管理器直到 `condition` 结束，才会进行下一次执行。
     * @param condition
     */
    suspend(condition) {
        this._suspendPromise = condition;
    }
    async init() {
        EditorExtends.on('class-registered', (classConstructor, metadata, className) => {
            console.log('classRegistered', className);
            console.log('class-registered ' + cc_1.default.js.isChildClassOf(classConstructor, cc_1.default.Component));
            if (metadata && // Only project scripts
                cc_1.default.js.isChildClassOf(classConstructor, cc_1.default.Component) // Only components
            ) {
                this.customComponents.add(classConstructor);
                EditorExtends.Component.addMenu(classConstructor, 'i18n:menu.custom_script/' + className, -1);
            }
        });
        const serializedPackLoaderContext = await rpc_1.Rpc.getInstance().request('programming', 'getPackerDriverLoaderContext', ['editor']);
        if (!serializedPackLoaderContext) {
            throw new Error('packer-driver/get-loader-context is not defined');
        }
        const quickPackLoaderContext = loader_1.QuickPackLoaderContext.deserialize(serializedPackLoaderContext);
        const { loadDynamic } = await Promise.resolve().then(() => __importStar(require('cc/preload')));
        const cceModuleMap = await rpc_1.Rpc.getInstance().request('programming', 'queryCCEModuleMap');
        this._executor = await executor_1.Executor.create({
            // @ts-ignore
            importEngineMod: async (id) => {
                return await loadDynamic(id);
            },
            quickPackLoaderContext,
            beforeUnregisterClass: (classConstructor) => {
                // 清除 menu 里面的缓存
                this.customComponents.delete(classConstructor);
                EditorExtends.Component.removeMenu(classConstructor);
            },
            logger: {
                loadException: (moduleId, error, hasBeenThrown) => {
                    // console.error(`An exception is thrown during load of module "${moduleId}" (or its recursive dependencies). `, error);
                },
                possibleCircularReference: (imported, moduleRequest, importMeta, extras) => {
                    const moduleUrlToAssetLink = (url) => {
                        const prefix = 'project:///';
                        return url.startsWith(prefix) ? `{asset(db://${url.slice(prefix.length).replace('.js', '.ts')})}` : url;
                    };
                    console.warn(`在 ${moduleUrlToAssetLink(importMeta.url)} 中检测到可能的循环引用：从 ${moduleRequest} 导入 ${imported} 时。`, extras?.error?.stack);
                },
            },
            importExceptionHandler: (...args) => this._handleImportException(...args),
            cceModuleMap,
        });
        // eslint-disable-next-line no-undef
        globalThis.self = window;
        this._executor.addPolyfillFile(require.resolve('@cocos/build-polyfills/prebuilt/editor/bundle'));
        // 同步插件脚本列表
        await this._syncPluginScripts.nextIteration();
        // 重载项目与插件脚本
        await this._reloadScripts.nextIteration();
    }
    async investigatePackerDriver() {
        void this._executeAsync();
    }
    /**
     * 传入一个 uuid 返回这个 uuid 对应的脚本组件名字
     * @param uuid
     */
    async queryScriptName(uuid) {
        const compressUuid = utils_1.default.UUID.compressUUID(uuid, false);
        const list = this._executor.queryClassesInModule(compressUuid);
        if (!list) {
            return null;
        }
        const classConstructor = list.find((classConstructor) => cc_1.default.js.isChildClassOf(classConstructor, cc_1.default.Component));
        return classConstructor ? cc_1.default.js.getClassName(classConstructor) : null;
    }
    /**
     * 传入一个 uuid 返回这个 uuid 对应的脚本的 cid
     * @param uuid
     */
    async queryScriptCid(uuid) {
        const compressUuid = utils_1.default.UUID.compressUUID(uuid, false);
        const list = this._executor.queryClassesInModule(compressUuid);
        if (!list) {
            return null;
        }
        const classConstructor = list.find((classConstructor) => cc_1.default.js.isChildClassOf(classConstructor, cc_1.default.Component));
        return classConstructor ? cc_1.default.js.getClassId(classConstructor) : null;
    }
    /**
     * 是否是自定义脚本（不是引擎定义的组件）
     * @param classConstructor
     */
    async isCustomComponent(classConstructor) {
        return this.customComponents.has(classConstructor);
    }
    async _loadScripts() { }
    /**
     * 加载脚本时触发
     */
    async loadScript() {
        this._syncPluginScriptListAsync();
    }
    /**
     * 删除脚本时触发
     */
    async removeScript() {
        this._syncPluginScriptListAsync();
    }
    /**
     * 脚本发生变化时触发
     */
    async scriptChange() {
        this._syncPluginScriptListAsync();
    }
    _executeAsync() {
        void this._reloadScripts.nextIteration();
    }
    async _execute() {
        return Promise.resolve(this._suspendPromise ?? undefined).catch((reason) => {
            console.error(reason);
        }).finally(() => {
            this._suspendPromise = null;
            return globalEnv.record(() => this._executor.reload().finally(() => {
                this.emit('script:execution-finished');
            }));
        });
    }
    /**
     * 防止插件脚本切换到项目脚本或者反之时，没有同步插件脚本列表
     * 这里使用了 AsyncIterationConcurrency1 功能，为了防止被多次调用，进行了迭代合并
     * @private
     */
    _syncPluginScriptListAsync() {
        void this._syncPluginScripts.nextIteration();
    }
    /**
     * 同步插件脚本列表到 Executor
     * @private
     */
    async _syncPluginScriptList() {
        return Promise.resolve(rpc_1.Rpc.getInstance().request('assetManager', 'querySortedPlugins', [{
                loadPluginInEditor: true,
            }]))
            .then((pluginScripts) => {
            this._executor.setPluginScripts(pluginScripts);
        })
            .catch((reason) => {
            console.error(reason);
        });
    }
    _handleImportException(err) {
        console.error(`{hidden(${importExceptionLogTag})}`, err);
    }
};
exports.ScriptService = ScriptService;
exports.ScriptService = ScriptService = __decorate([
    (0, core_1.register)('Script'),
    __metadata("design:paramtypes", [])
], ScriptService);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvc2NlbmUvc2NlbmUtcHJvY2Vzcy9zZXJ2aWNlL3NjcmlwdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0Q0FBb0I7QUFDcEIsbUVBQWdFO0FBQ2hFLDZFQUEwRjtBQUMxRixnQ0FBNkI7QUFDN0IsaUNBQStDO0FBRS9DLGdFQUF3QztBQUV4Qzs7Ozs7R0FLRztBQUNILE1BQU0sMEJBQTBCO0lBQ3BCLFFBQVEsQ0FBc0I7SUFFOUIsaUJBQWlCLEdBQXlCLElBQUksQ0FBQztJQUUvQyxlQUFlLEdBQXlCLElBQUksQ0FBQztJQUVyRCxZQUFZLE9BQTRCO1FBQ3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0lBQzVCLENBQUM7SUFFTSxhQUFhO1FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMxQixlQUFlO1lBQ2YsZ0NBQWdDO1lBQ2hDLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDMUUsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztZQUNsQyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7YUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQy9CLDJDQUEyQztZQUMzQyxPQUFPLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7Z0JBQzlELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO2dCQUM1QixxQ0FBcUM7Z0JBQ3JDLE9BQU8sSUFBSSxDQUFDLGFBQWEsRUFBRSxD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RUFBRSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbkQsQ0FBQyxDQUFDO2FBQ0QsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVPLHNCQUFzQixDQUFDLEdBQVk7UUFDdkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLHFCQUFxQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDN0QsQ0FBQztDQUNKLENBQUE7QUFuTVksc0NBQWE7d0JBQWIsYUFBYTtJQUR6QixJQUFBLGVBQVEsRUFBQyxRQUFRLENBQUM7O0dBQ04sYUFBYSxDQW1NekIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2MgZnJvbSAnY2MnO1xyXG5pbXBvcnQgeyBFeGVjdXRvciB9IGZyb20gJ0Bjb2Nvcy9saWItcHJvZ3JhbW1pbmcvZGlzdC9leGVjdXRvcic7XHJcbmltcG9ydCB7IFF1aWNrUGFja0xvYWRlckNvbnRleHQgfSBmcm9tICdAY29jb3MvY3JlYXRvci1wcm9ncmFtbWluZy1xdWljay1wYWNrL2xpYi9sb2FkZXInO1xyXG5pbXBvcnQgeyBScGMgfSBmcm9tICcuLi9ycGMnO1xyXG5pbXBvcnQgeyBCYXNlU2VydmljZSwgcmVnaXN0ZXIgfSBmcm9tICcuL2NvcmUnO1xyXG5pbXBvcnQgeyBJU2NyaXB0RXZlbnRzLCBJU2NyaXB0U2VydmljZSB9IGZyb20gJy4uLy4uL2NvbW1vbic7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi8uLi8uLi9iYXNlL3V0aWxzJztcclxuXHJcbi8qKlxyXG4gKiDlvILmraXov63ku6PjgILmnInku6XkuIvnibnngrnvvJpcclxuICogMS4g5q+P5qyh6LCD55SoIGBuZXh0SXRlcmF0aW9uKClgIOS8muaJp+ihjOS4gOasoeS8oOWFpeeahCoq6L+t5Luj5Ye95pWwKirvvJvov63ku6Plh73mlbDlhYHorrjmmK/lvILmraXnmoTvvIzlnKjmnoTpgKDlh73mlbDkuK3noa7lrprkuYvlkI7kuI3og73mm7TmlLnvvJtcclxuICogMi4g5ZCM5pe2KirmnIDlpJrku4XkvJrmnInkuIDkvosqKui/reS7o+WcqOaJp+ihjO+8m1xyXG4gKiAzLiAqKui/reS7o+aYr+WPr+WQiOW5tueahCoq77yM5Lmf5bCx5piv6K+077yM5Zyo5YmN6Z2i55qE6L+t5Luj5rKh5a6M5oiQ5LmL5YmN77yM5ZCO6Z2i55qE5omA5pyJ6L+t5Luj6YO95Lya6KKr5ZCI5bm25oiQ5LiA5Liq44CCXHJcbiAqL1xyXG5jbGFzcyBBc3luY0l0ZXJhdGlvbkNvbmN1cnJlbmN5MSB7XHJcbiAgICBwcml2YXRlIF9pdGVyYXRlOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xyXG5cclxuICAgIHByaXZhdGUgX2V4ZWN1dGlvblByb21pc2U6IFByb21pc2U8dm9pZD4gfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICBwcml2YXRlIF9wZW5kaW5nUHJvbWlzZTogUHJvbWlzZTx2b2lkPiB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGl0ZXJhdGU6ICgpID0+IFByb21pc2U8dm9pZD4pIHtcclxuICAgICAgICB0aGlzLl9pdGVyYXRlID0gaXRlcmF0ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbmV4dEl0ZXJhdGlvbigpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGlmICghdGhpcy5fZXhlY3V0aW9uUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzmnKrlnKjmiafooYzvvIzpgqPlsLHljrvmiafooYxcclxuICAgICAgICAgICAgLy8gYXNzZXJ0KCF0aGlzLl9wZW5kaW5nUHJvbWlzZSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2V4ZWN1dGlvblByb21pc2UgPSBQcm9taXNlLnJlc29sdmUodGhpcy5faXRlcmF0ZSgpKS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2V4ZWN1dGlvblByb21pc2UgPSBudWxsO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLl9wZW5kaW5nUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzmsqHmnInnrYnlvoXpmJ/liJfvvIzliJvlu7rnrYnlvoUgcHJvbWlzZe+8jOWcqCDmiafooYwgcHJvbWlzZSDlrozmiJDlkI7miafooYxcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BlbmRpbmdQcm9taXNlID0gdGhpcy5fZXhlY3V0aW9uUHJvbWlzZS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BlbmRpbmdQcm9taXNlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIC8vIOetieW+hSBwcm9taXNlIOWwhuetieW+heaJp+ihjCBwcm9taXNl77yM5bm25Zyo5a6M5oiQ5ZCO6YeN5paw5YWl6ZifXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5uZXh0SXRlcmF0aW9uKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIOWmguaenOW3sue7j+acieetieW+hemYn+WIl++8jOmCo+WwseetieW+heeOsOacieeahOmYn+WIl1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGVuZGluZ1Byb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog5a+85YWl5pe25byC5bi455qE5raI5oGv55qE5qCH562+44CCXHJcbiAqL1xyXG5jb25zdCBpbXBvcnRFeGNlcHRpb25Mb2dUYWcgPSAnOjpTY2VuZUV4ZWN1dG9ySW1wb3J0RXhjZXB0aW9uSGFuZGxlcjo6JztcclxuY29uc3QgaW1wb3J0RXhjZXB0aW9uTG9nUmVnZXggPSBuZXcgUmVnRXhwKGltcG9ydEV4Y2VwdGlvbkxvZ1RhZyk7XHJcblxyXG5jbGFzcyBHbG9iYWxFbnYge1xyXG4gICAgcHVibGljIGFzeW5jIHJlY29yZChmbjogKCkgPT4gUHJvbWlzZTx2b2lkPikge1xyXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLl9xdWV1ZS5wdXNoKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYmVmb3JlS2V5cyA9IE9iamVjdC5rZXlzKGdsb2JhbFRoaXMpO1xyXG4gICAgICAgICAgICBhd2FpdCBmbigpO1xyXG4gICAgICAgICAgICBjb25zdCBhZnRlcktleXMgPSBPYmplY3Qua2V5cyhnbG9iYWxUaGlzKTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBhZnRlcktleSBvZiBhZnRlcktleXMpIHtcclxuICAgICAgICAgICAgICAgIGlmICghYmVmb3JlS2V5cy5pbmNsdWRlcyhhZnRlcktleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbmNyZW1lbnRhbEtleXMuYWRkKGFmdGVyS2V5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBJbmNyZW1lbnRhbCBrZXlzOiAke0FycmF5LmZyb20odGhpcy5faW5jcmVtZW50YWxLZXlzKX1gKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBhd2FpdCB0aGlzLnByb2Nlc3NRdWV1ZSgpOyAvLyDlpITnkIbpmJ/liJdcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNsZWFyKCkge1xyXG4gICAgICAgIHRoaXMuX3F1ZXVlLnB1c2goYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGluY3JlbWVudGFsS2V5IG9mIHRoaXMuX2luY3JlbWVudGFsS2V5cykge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIChnbG9iYWxUaGlzIGFzIGFueSlbaW5jcmVtZW50YWxLZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2luY3JlbWVudGFsS2V5cy5jbGVhcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgcHJvY2Vzc1F1ZXVlKCkge1xyXG4gICAgICAgIHdoaWxlICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLl9xdWV1ZS5zaGlmdCgpO1xyXG4gICAgICAgICAgICBpZiAobmV4dCkgYXdhaXQgbmV4dCgpOyAvLyDmiafooYzpmJ/liJfkuK3nmoTkuIvkuIDkuKrku7vliqFcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5jcmVtZW50YWxLZXlzID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgICBwcml2YXRlIF9xdWV1ZTogKCgpID0+IFByb21pc2U8dm9pZD4pW10gPSBbXTtcclxufVxyXG5cclxuY29uc3QgZ2xvYmFsRW52ID0gbmV3IEdsb2JhbEVudigpO1xyXG5cclxuQHJlZ2lzdGVyKCdTY3JpcHQnKVxyXG5leHBvcnQgY2xhc3MgU2NyaXB0U2VydmljZSBleHRlbmRzIEJhc2VTZXJ2aWNlPElTY3JpcHRFdmVudHM+IGltcGxlbWVudHMgSVNjcmlwdFNlcnZpY2Uge1xyXG4gICAgcHJpdmF0ZSBfZXhlY3V0b3IhOiBFeGVjdXRvcjtcclxuXHJcbiAgICBwcml2YXRlIF9zdXNwZW5kUHJvbWlzZTogUHJvbWlzZTx2b2lkPiB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIHByaXZhdGUgX3N5bmNQbHVnaW5TY3JpcHRzOiBBc3luY0l0ZXJhdGlvbkNvbmN1cnJlbmN5MTtcclxuICAgIHByaXZhdGUgX3JlbG9hZFNjcmlwdHM6IEFzeW5jSXRlcmF0aW9uQ29uY3VycmVuY3kxO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog6Z2e5byV5pOO5a6a5LmJ55qE57uE5Lu2XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGN1c3RvbUNvbXBvbmVudHM6IFNldDxGdW5jdGlvbj4gPSBuZXcgU2V0KCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLl9yZWxvYWRTY3JpcHRzID0gbmV3IEFzeW5jSXRlcmF0aW9uQ29uY3VycmVuY3kxKCgpID0+IHRoaXMuX2V4ZWN1dGUoKSk7XHJcbiAgICAgICAgdGhpcy5fc3luY1BsdWdpblNjcmlwdHMgPSBuZXcgQXN5bmNJdGVyYXRpb25Db25jdXJyZW5jeTEoKCkgPT4gdGhpcy5fc3luY1BsdWdpblNjcmlwdExpc3QoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmjILotbfohJrmnKznrqHnkIblmajnm7TliLAgYGNvbmRpdGlvbmAg57uT5p2f77yM5omN5Lya6L+b6KGM5LiL5LiA5qyh5omn6KGM44CCXHJcbiAgICAgKiBAcGFyYW0gY29uZGl0aW9uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdXNwZW5kKGNvbmRpdGlvbjogUHJvbWlzZTx2b2lkPikge1xyXG4gICAgICAgIHRoaXMuX3N1c3BlbmRQcm9taXNlID0gY29uZGl0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGluaXQoKSB7XHJcbiAgICAgICAgRWRpdG9yRXh0ZW5kcy5vbignY2xhc3MtcmVnaXN0ZXJlZCcsIChjbGFzc0NvbnN0cnVjdG9yOiBGdW5jdGlvbiwgbWV0YWRhdGE6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NsYXNzUmVnaXN0ZXJlZCcsIGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbGFzcy1yZWdpc3RlcmVkICcgKyBjYy5qcy5pc0NoaWxkQ2xhc3NPZihjbGFzc0NvbnN0cnVjdG9yLCBjYy5Db21wb25lbnQpKTtcclxuICAgICAgICAgICAgaWYgKG1ldGFkYXRhICYmIC8vIE9ubHkgcHJvamVjdCBzY3JpcHRzXHJcbiAgICAgICAgICAgICAgICBjYy5qcy5pc0NoaWxkQ2xhc3NPZihjbGFzc0NvbnN0cnVjdG9yLCBjYy5Db21wb25lbnQpIC8vIE9ubHkgY29tcG9uZW50c1xyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29tcG9uZW50cy5hZGQoY2xhc3NDb25zdHJ1Y3Rvcik7XHJcbiAgICAgICAgICAgICAgICBFZGl0b3JFeHRlbmRzLkNvbXBvbmVudC5hZGRNZW51KFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzQ29uc3RydWN0b3IsICdpMThuOm1lbnUuY3VzdG9tX3NjcmlwdC8nICsgY2xhc3NOYW1lLCAtMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBzZXJpYWxpemVkUGFja0xvYWRlckNvbnRleHQgPSBhd2FpdCBScGMuZ2V0SW5zdGFuY2UoKS5yZXF1ZXN0KCdwcm9ncmFtbWluZycsICdnZXRQYWNrZXJEcml2ZXJMb2FkZXJDb250ZXh0JywgWydlZGl0b3InXSk7XHJcbiAgICAgICAgaWYgKCFzZXJpYWxpemVkUGFja0xvYWRlckNvbnRleHQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwYWNrZXItZHJpdmVyL2dldC1sb2FkZXItY29udGV4dCBpcyBub3QgZGVmaW5lZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBxdWlja1BhY2tMb2FkZXJDb250ZXh0ID0gUXVpY2tQYWNrTG9hZGVyQ29udGV4dC5kZXNlcmlhbGl6ZShzZXJpYWxpemVkUGFja0xvYWRlckNvbnRleHQpO1xyXG5cclxuICAgICAgICBjb25zdCB7IGxvYWREeW5hbWljIH0gPSBhd2FpdCBpbXBvcnQoJ2NjL3ByZWxvYWQnKTtcclxuICAgICAgICBjb25zdCBjY2VNb2R1bGVNYXAgPSBhd2FpdCBScGMuZ2V0SW5zdGFuY2UoKS5yZXF1ZXN0KCdwcm9ncmFtbWluZycsICdxdWVyeUNDRU1vZHVsZU1hcCcpO1xyXG4gICAgICAgIHRoaXMuX2V4ZWN1dG9yID0gYXdhaXQgRXhlY3V0b3IuY3JlYXRlKHtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBpbXBvcnRFbmdpbmVNb2Q6IGFzeW5jIChpZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGxvYWREeW5hbWljKGlkKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcXVpY2tQYWNrTG9hZGVyQ29udGV4dCxcclxuICAgICAgICAgICAgYmVmb3JlVW5yZWdpc3RlckNsYXNzOiAoY2xhc3NDb25zdHJ1Y3RvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8g5riF6ZmkIG1lbnUg6YeM6Z2i55qE57yT5a2YXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbXBvbmVudHMuZGVsZXRlKGNsYXNzQ29uc3RydWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgRWRpdG9yRXh0ZW5kcy5Db21wb25lbnQucmVtb3ZlTWVudShjbGFzc0NvbnN0cnVjdG9yKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbG9nZ2VyOiB7XHJcbiAgICAgICAgICAgICAgICBsb2FkRXhjZXB0aW9uOiAobW9kdWxlSWQsIGVycm9yLCBoYXNCZWVuVGhyb3duPzogYm9vbGVhbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoYEFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZHVyaW5nIGxvYWQgb2YgbW9kdWxlIFwiJHttb2R1bGVJZH1cIiAob3IgaXRzIHJlY3Vyc2l2ZSBkZXBlbmRlbmNpZXMpLiBgLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcG9zc2libGVDaXJjdWxhclJlZmVyZW5jZTogKGltcG9ydGVkOiBzdHJpbmcsIG1vZHVsZVJlcXVlc3Q6IHN0cmluZywgaW1wb3J0TWV0YTogYW55LCBleHRyYXM6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vZHVsZVVybFRvQXNzZXRMaW5rID0gKHVybDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZWZpeCA9ICdwcm9qZWN0Oi8vLyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1cmwuc3RhcnRzV2l0aChwcmVmaXgpID8gYHthc3NldChkYjovLyR7dXJsLnNsaWNlKHByZWZpeC5sZW5ndGgpLnJlcGxhY2UoJy5qcycsICcudHMnKX0pfWAgOiB1cmw7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYOWcqCAke21vZHVsZVVybFRvQXNzZXRMaW5rKGltcG9ydE1ldGEudXJsKX0g5Lit5qOA5rWL5Yiw5Y+v6IO955qE5b6q546v5byV55So77ya5LuOICR7bW9kdWxlUmVxdWVzdH0g5a+85YWlICR7aW1wb3J0ZWR9IOaXtuOAgmAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhcz8uZXJyb3I/LnN0YWNrLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpbXBvcnRFeGNlcHRpb25IYW5kbGVyOiAoLi4uYXJncykgPT4gdGhpcy5faGFuZGxlSW1wb3J0RXhjZXB0aW9uKC4uLmFyZ3MpLFxyXG4gICAgICAgICAgICBjY2VNb2R1bGVNYXAsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgICAgZ2xvYmFsVGhpcy5zZWxmID0gd2luZG93O1xyXG4gICAgICAgIHRoaXMuX2V4ZWN1dG9yLmFkZFBvbHlmaWxsRmlsZShyZXF1aXJlLnJlc29sdmUoJ0Bjb2Nvcy9idWlsZC1wb2x5ZmlsbHMvcHJlYnVpbHQvZWRpdG9yL2J1bmRsZScpKTtcclxuICAgICAgICAvLyDlkIzmraXmj5Lku7bohJrmnKzliJfooahcclxuICAgICAgICBhd2FpdCB0aGlzLl9zeW5jUGx1Z2luU2NyaXB0cy5uZXh0SXRlcmF0aW9uKCk7XHJcbiAgICAgICAgLy8g6YeN6L296aG555uu5LiO5o+S5Lu26ISa5pysXHJcbiAgICAgICAgYXdhaXQgdGhpcy5fcmVsb2FkU2NyaXB0cy5uZXh0SXRlcmF0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgaW52ZXN0aWdhdGVQYWNrZXJEcml2ZXIoKSB7XHJcbiAgICAgICAgdm9pZCB0aGlzLl9leGVjdXRlQXN5bmMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS8oOWFpeS4gOS4qiB1dWlkIOi/lOWbnui/meS4qiB1dWlkIOWvueW6lOeahOiEmuacrOe7hOS7tuWQjeWtl1xyXG4gICAgICogQHBhcmFtIHV1aWRcclxuICAgICAqL1xyXG4gICAgYXN5bmMgcXVlcnlTY3JpcHROYW1lKHV1aWQ6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IGNvbXByZXNzVXVpZCA9IHV0aWxzLlVVSUQuY29tcHJlc3NVVUlEKHV1aWQsIGZhbHNlKTtcclxuICAgICAgICBjb25zdCBsaXN0ID0gdGhpcy5fZXhlY3V0b3IucXVlcnlDbGFzc2VzSW5Nb2R1bGUoY29tcHJlc3NVdWlkKTtcclxuICAgICAgICBpZiAoIWxpc3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNsYXNzQ29uc3RydWN0b3IgPSBsaXN0LmZpbmQoKGNsYXNzQ29uc3RydWN0b3IpID0+IGNjLmpzLmlzQ2hpbGRDbGFzc09mKGNsYXNzQ29uc3RydWN0b3IgYXMgRnVuY3Rpb24sIGNjLkNvbXBvbmVudCkpO1xyXG4gICAgICAgIHJldHVybiBjbGFzc0NvbnN0cnVjdG9yID8gY2MuanMuZ2V0Q2xhc3NOYW1lKGNsYXNzQ29uc3RydWN0b3IpIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS8oOWFpeS4gOS4qiB1dWlkIOi/lOWbnui/meS4qiB1dWlkIOWvueW6lOeahOiEmuacrOeahCBjaWRcclxuICAgICAqIEBwYXJhbSB1dWlkXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHF1ZXJ5U2NyaXB0Q2lkKHV1aWQ6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IGNvbXByZXNzVXVpZCA9IHV0aWxzLlVVSUQuY29tcHJlc3NVVUlEKHV1aWQsIGZhbHNlKTtcclxuICAgICAgICBjb25zdCBsaXN0ID0gdGhpcy5fZXhlY3V0b3IucXVlcnlDbGFzc2VzSW5Nb2R1bGUoY29tcHJlc3NVdWlkKTtcclxuICAgICAgICBpZiAoIWxpc3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNsYXNzQ29uc3RydWN0b3IgPSBsaXN0LmZpbmQoKGNsYXNzQ29uc3RydWN0b3IpID0+IGNjLmpzLmlzQ2hpbGRDbGFzc09mKGNsYXNzQ29uc3RydWN0b3IgYXMgRnVuY3Rpb24sIGNjLkNvbXBvbmVudCkpO1xyXG4gICAgICAgIHJldHVybiBjbGFzc0NvbnN0cnVjdG9yID8gY2MuanMuZ2V0Q2xhc3NJZChjbGFzc0NvbnN0cnVjdG9yKSA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmmK/lkKbmmK/oh6rlrprkuYnohJrmnKzvvIjkuI3mmK/lvJXmk47lrprkuYnnmoTnu4Tku7bvvIlcclxuICAgICAqIEBwYXJhbSBjbGFzc0NvbnN0cnVjdG9yXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBpc0N1c3RvbUNvbXBvbmVudChjbGFzc0NvbnN0cnVjdG9yOiBGdW5jdGlvbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN1c3RvbUNvbXBvbmVudHMuaGFzKGNsYXNzQ29uc3RydWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIF9sb2FkU2NyaXB0cygpIHsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L296ISa5pys5pe26Kem5Y+RXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGxvYWRTY3JpcHQoKSB7XHJcbiAgICAgICAgdGhpcy5fc3luY1BsdWdpblNjcmlwdExpc3RBc3luYygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yig6Zmk6ISa5pys5pe26Kem5Y+RXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHJlbW92ZVNjcmlwdCgpIHtcclxuICAgICAgICB0aGlzLl9zeW5jUGx1Z2luU2NyaXB0TGlzdEFzeW5jKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDohJrmnKzlj5HnlJ/lj5jljJbml7bop6blj5FcclxuICAgICAqL1xyXG4gICAgYXN5bmMgc2NyaXB0Q2hhbmdlKCkge1xyXG4gICAgICAgIHRoaXMuX3N5bmNQbHVnaW5TY3JpcHRMaXN0QXN5bmMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9leGVjdXRlQXN5bmMoKSB7XHJcblxyXG4gICAgICAgIHZvaWQgdGhpcy5fcmVsb2FkU2NyaXB0cy5uZXh0SXRlcmF0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfZXhlY3V0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX3N1c3BlbmRQcm9taXNlID8/IHVuZGVmaW5lZCkuY2F0Y2goKHJlYXNvbikgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XHJcbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N1c3BlbmRQcm9taXNlID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnbG9iYWxFbnYucmVjb3JkKFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gdGhpcy5fZXhlY3V0b3IucmVsb2FkKCkuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdzY3JpcHQ6ZXhlY3V0aW9uLWZpbmlzaGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmYsuatouaPkuS7tuiEmuacrOWIh+aNouWIsOmhueebruiEmuacrOaIluiAheWPjeS5i+aXtu+8jOayoeacieWQjOatpeaPkuS7tuiEmuacrOWIl+ihqFxyXG4gICAgICog6L+Z6YeM5L2/55So5LqGIEFzeW5jSXRlcmF0aW9uQ29uY3VycmVuY3kxIOWKn+iDve+8jOS4uuS6humYsuatouiiq+Wkmuasoeiwg+eUqO+8jOi/m+ihjOS6hui/reS7o+WQiOW5tlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc3luY1BsdWdpblNjcmlwdExpc3RBc3luYygpIHtcclxuICAgICAgICB2b2lkIHRoaXMuX3N5bmNQbHVnaW5TY3JpcHRzLm5leHRJdGVyYXRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWQjOatpeaPkuS7tuiEmuacrOWIl+ihqOWIsCBFeGVjdXRvclxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBfc3luY1BsdWdpblNjcmlwdExpc3QoKSB7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShScGMuZ2V0SW5zdGFuY2UoKS5yZXF1ZXN0KCdhc3NldE1hbmFnZXInLCAncXVlcnlTb3J0ZWRQbHVnaW5zJywgW3tcclxuICAgICAgICAgICAgbG9hZFBsdWdpbkluRWRpdG9yOiB0cnVlLFxyXG4gICAgICAgIH1dKSlcclxuICAgICAgICAgICAgLnRoZW4oKHBsdWdpblNjcmlwdHMpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2V4ZWN1dG9yLnNldFBsdWdpblNjcmlwdHMocGx1Z2luU2NyaXB0cyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgocmVhc29uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2hhbmRsZUltcG9ydEV4Y2VwdGlvbihlcnI6IHVua25vd24pIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGB7aGlkZGVuKCR7aW1wb3J0RXhjZXB0aW9uTG9nVGFnfSl9YCwgZXJyKTtcclxuICAgIH1cclxufVxyXG4iXX0=