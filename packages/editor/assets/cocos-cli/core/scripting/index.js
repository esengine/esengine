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
exports.title = void 0;
const packer_driver_1 = require("./packer-driver");
const executor_1 = require("@cocos/lib-programming/dist/executor");
const loader_1 = require("@cocos/creator-programming-quick-pack/lib/loader");
const event_emitter_1 = require("./event-emitter");
const node_uuid_1 = require("node-uuid");
exports.title = 'i18n:builder.tasks.load_script';
let executor = null;
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
class ScriptManager {
    on(type, listener) { return event_emitter_1.eventEmitter.on(type, listener); }
    off(type, listener) { return event_emitter_1.eventEmitter.off(type, listener); }
    once(type, listener) { return event_emitter_1.eventEmitter.once(type, listener); }
    _initialized = false;
    _pendingCompileTimer = null;
    _pendingCompileTaskId = null;
    /**
     * 初始化Scripting模块
     * @param projectPath 项目路径
     * @param enginePath 引擎路径
     * @param features 引擎功能特性列表
     */
    async initialize(projectPath, enginePath, features) {
        if (this._initialized) {
            return;
        }
        const packerDriver = await packer_driver_1.PackerDriver.create(projectPath, enginePath);
        await packerDriver.init(features);
        this._initialized = true;
    }
    /**
     * 查询文件的依赖者（谁使用了这个文件）
     * @param path 文件路径
     * @returns 使用该文件的其他文件路径列表
     */
    async queryScriptUsers(path) {
        return packer_driver_1.PackerDriver.getInstance().queryScriptUsers(path);
    }
    /**
     * 查询文件的依赖（这个文件使用了哪些文件）
     * @param path 文件路径
     * @returns 该文件依赖的其他文件路径列表
     */
    async queryScriptDependencies(path) {
        return packer_driver_1.PackerDriver.getInstance().queryScriptDeps(path);
    }
    /**
     * 查询共享配置
     * @returns 共享配置对象
     */
    async querySharedSettings() {
        return packer_driver_1.PackerDriver.getInstance().querySharedSettings();
    }
    /**
     * 生成类型声明文件
     */
    async generateDeclarations() {
        return packer_driver_1.PackerDriver.getInstance().generateDeclarations();
    }
    /**
     * @param type 变更类型
     * @param uuid 资源UUID
     * @param assetInfo 资源信息
     * @param meta 元数据
     */
    dispatchAssetChange(assetChange) {
        packer_driver_1.PackerDriver.getInstance().dispatchAssetChanges(assetChange);
    }
    /**
     * 调用方需要捕获异常，无异常则编译成功
     * 编译脚本文件
     * @param assetChanges 资源变更列表，如果未提供，则编译上一次缓存的资源变更列表
     */
    async compileScripts(assetChanges) {
        await packer_driver_1.PackerDriver.getInstance().build(assetChanges);
    }
    /**
     *
     * @param delay 延迟时间，单位为毫秒, 同一时间只能有一个延迟编译任务，如果存在则返回已有的任务ID
     * @returns 延迟编译任务的ID，如果存在则返回已有的任务ID
     */
    postCompileScripts(delay) {
        // 如果已经有待执行的延迟任务，取消它
        if (this._pendingCompileTimer) {
            clearTimeout(this._pendingCompileTimer);
        }
        // 如果已有任务ID，继续使用它；否则生成新的
        const taskId = this._pendingCompileTaskId || (0, node_uuid_1.v4)();
        this._pendingCompileTaskId = taskId;
        // 创建新的延迟任务
        this._pendingCompileTimer = setTimeout(async () => {
            if (this.isCompiling()) {
                this.postCompileScripts(delay);
                return taskId;
            }
            this._pendingCompileTimer = null;
            const currentTaskId = this._pendingCompileTaskId;
            this._pendingCompileTaskId = null;
            packer_driver_1.PackerDriver.getInstance().build(undefined, currentTaskId || undefined);
        }, delay);
        return taskId;
    }
    /**
     * 检查编译是否忙碌
     * @returns 是否正在编译
     */
    isCompiling() {
        return packer_driver_1.PackerDriver.getInstance().busy();
    }
    /**
     * 获取当前正在执行的编译任务ID
     * @returns 任务ID，如果没有正在执行的任务则返回null
     */
    getCurrentTaskId() {
        return packer_driver_1.PackerDriver.getInstance().getCurrentTaskId();
    }
    /**
     * 检查目标是否就绪
     * @param targetName 目标名称，如 'editor' 或 'preview'
     * @returns 是否就绪
     */
    isTargetReady(targetName) {
        return packer_driver_1.PackerDriver.getInstance().isReady(targetName) ?? false;
    }
    /**
     * 加载脚本并执行
     * @param scriptUuids 脚本UUID列表
     * @param pluginScripts 插件脚本信息列表
     */
    async loadScript(scriptUuids, pluginScripts = []) {
        if (!scriptUuids.length) {
            console.debug('No script need reload.');
            return;
        }
        console.debug('reload all scripts.');
        // TODO 需要支持按入参按需加载脚本
        await globalEnv.record(async () => {
            if (!executor) {
                console.log(`creating executor ...`);
                const packerDriver = packer_driver_1.PackerDriver.getInstance();
                const serializedPackLoaderContext = packerDriver.getQuickPackLoaderContext('editor').serialize();
                const quickPackLoaderContext = loader_1.QuickPackLoaderContext.deserialize(serializedPackLoaderContext);
                const { loadDynamic } = await Promise.resolve().then(() => __importStar(require('cc/preload')));
                const cceModuleMap = packer_driver_1.PackerDriver.queryCCEModuleMap();
                executor = await executor_1.Executor.create({
                    // @ts-ignore
                    importEngineMod: async (id) => {
                        return await loadDynamic(id);
                    },
                    quickPackLoaderContext,
                    cceModuleMap,
                });
                // eslint-disable-next-line no-undef
                globalThis.self = window;
                executor.addPolyfillFile(require.resolve('@cocos/build-polyfills/prebuilt/editor/bundle'));
            }
            if (!executor) {
                console.error('Failed to init executor');
                return;
            }
            executor.setPluginScripts(pluginScripts);
            await executor.reload();
        });
    }
    /**
     * 查询CCE模块映射
     * @returns CCE模块映射对象
     */
    queryCCEModuleMap() {
        return packer_driver_1.PackerDriver.queryCCEModuleMap();
    }
    /**
     * 获取指定目标的Loader上下文
     * @param targetName 目标名称
     * @returns 序列化后的Loader上下文
     */
    getPackerDriverLoaderContext(targetName) {
        return packer_driver_1.PackerDriver.getInstance().getQuickPackLoaderContext(targetName)?.serialize();
    }
    /**
     * 清除缓存并重新编译
     */
    async clearCacheAndRebuild() {
        await packer_driver_1.PackerDriver.getInstance().clearCache();
    }
    /**
     * 更新数据库信息
     * @param dbInfos 数据库信息列表
     */
    async updateDatabases(dbInfo, dbChangeType) {
        await packer_driver_1.PackerDriver.getInstance().updateDbInfos(dbInfo, dbChangeType);
    }
}
exports.default = new ScriptManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9zY3JpcHRpbmcvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsbURBQStDO0FBQy9DLG1FQUFnRTtBQUNoRSw2RUFBMEY7QUFDMUYsbURBQXVFO0FBRXZFLHlDQUF1QztBQUcxQixRQUFBLEtBQUssR0FBRyxnQ0FBZ0MsQ0FBQztBQUV0RCxJQUFJLFFBQVEsR0FBb0IsSUFBSSxDQUFDO0FBRXJDLE1BQU0sU0FBUztJQUNKLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBdUI7UUFDdkMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDeEIsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMzQyxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQ1gsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMxQyxLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRSxDQUFDO2dCQUMvQixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO29CQUNqQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN4QyxDQUFDO1lBQ0wsQ0FBQztZQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxPQUFPO0lBQ3RDLENBQUM7SUFFTyxLQUFL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bnRlbnQiOlsiaW1wb3J0IHsgQ0NFTW9kdWxlTWFwIH0gZnJvbSAnLi4vZW5naW5lL0B0eXBlcy9jb25maWcnO1xyXG5pbXBvcnQgeyBJUGx1Z2luU2NyaXB0SW5mbywgU2hhcmVkU2V0dGluZ3MgfSBmcm9tICcuL2ludGVyZmFjZSc7XHJcbmltcG9ydCB7IFBhY2tlckRyaXZlciB9IGZyb20gJy4vcGFja2VyLWRyaXZlcic7XHJcbmltcG9ydCB7IEV4ZWN1dG9yIH0gZnJvbSAnQGNvY29zL2xpYi1wcm9ncmFtbWluZy9kaXN0L2V4ZWN1dG9yJztcclxuaW1wb3J0IHsgUXVpY2tQYWNrTG9hZGVyQ29udGV4dCB9IGZyb20gJ0Bjb2Nvcy9jcmVhdG9yLXByb2dyYW1taW5nLXF1aWNrLXBhY2svbGliL2xvYWRlcic7XHJcbmltcG9ydCB7IEN1c3RvbUV2ZW50LCBFdmVudFR5cGUsIGV2ZW50RW1pdHRlciB9IGZyb20gJy4vZXZlbnQtZW1pdHRlcic7XHJcbmltcG9ydCB7IEFzc2V0Q2hhbmdlSW5mbywgREJDaGFuZ2VUeXBlIH0gZnJvbSAnLi9wYWNrZXItZHJpdmVyL2Fzc2V0LWRiLWludGVyb3AnO1xyXG5pbXBvcnQgeyB2NCBhcyB1dWlkIH0gZnJvbSAnbm9kZS11dWlkJztcclxuaW1wb3J0IHsgREJJbmZvIH0gZnJvbSAnLi9AdHlwZXMvY29uZmlnLWV4cG9ydCc7XHJcblxyXG5leHBvcnQgY29uc3QgdGl0bGUgPSAnaTE4bjpidWlsZGVyLnRhc2tzLmxvYWRfc2NyaXB0JztcclxuXHJcbmxldCBleGVjdXRvcjogRXhlY3V0b3IgfCBudWxsID0gbnVsbDtcclxuXHJcbmNsYXNzIEdsb2JhbEVudiB7XHJcbiAgICBwdWJsaWMgYXN5bmMgcmVjb3JkKGZuOiAoKSA9PiBQcm9taXNlPHZvaWQ+KSB7XHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuX3F1ZXVlLnB1c2goYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBiZWZvcmVLZXlzID0gT2JqZWN0LmtleXMoZ2xvYmFsVGhpcyk7XHJcbiAgICAgICAgICAgIGF3YWl0IGZuKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGFmdGVyS2V5cyA9IE9iamVjdC5rZXlzKGdsb2JhbFRoaXMpO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGFmdGVyS2V5IG9mIGFmdGVyS2V5cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFiZWZvcmVLZXlzLmluY2x1ZGVzKGFmdGVyS2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luY3JlbWVudGFsS2V5cy5hZGQoYWZ0ZXJLZXkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYEluY3JlbWVudGFsIGtleXM6ICR7QXJyYXkuZnJvbSh0aGlzLl9pbmNyZW1lbnRhbEtleXMpfWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGF3YWl0IHRoaXMucHJvY2Vzc1F1ZXVlKCk7IC8vIOWkhOeQhumYn+WIl1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2xlYXIoKSB7XHJcbiAgICAgICAgdGhpcy5fcXVldWUucHVzaChhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgaW5jcmVtZW50YWxLZXkgb2YgdGhpcy5faW5jcmVtZW50YWxLZXlzKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgKGdsb2JhbFRoaXMgYXMgYW55KVtpbmNyZW1lbnRhbEtleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5faW5jcmVtZW50YWxLZXlzLmNsZWFyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBwcm9jZXNzUXVldWUoKSB7XHJcbiAgICAgICAgd2hpbGUgKHRoaXMuX3F1ZXVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuX3F1ZXVlLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIGlmIChuZXh0KSBhd2FpdCBuZXh0KCk7IC8vIOaJp+ihjOmYn+WIl+S4reeahOS4i+S4gOS4quS7u+WKoVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbmNyZW1lbnRhbEtleXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICAgIHByaXZhdGUgX3F1ZXVlOiAoKCkgPT4gUHJvbWlzZTx2b2lkPilbXSA9IFtdO1xyXG59XHJcblxyXG5jb25zdCBnbG9iYWxFbnYgPSBuZXcgR2xvYmFsRW52KCk7XHJcblxyXG5jbGFzcyBTY3JpcHRNYW5hZ2VyIHtcclxuXHJcbiAgICBvbih0eXBlOiBFdmVudFR5cGUsIGxpc3RlbmVyOiAoYXJnOiBhbnkpID0+IHZvaWQpOiBDdXN0b21FdmVudCB7IHJldHVybiBldmVudEVtaXR0ZXIub24odHlwZSwgbGlzdGVuZXIpOyB9XHJcbiAgICBvZmYodHlwZTogRXZlbnRUeXBlLCBsaXN0ZW5lcjogKGFyZzogYW55KSA9PiB2b2lkKTogQ3VzdG9tRXZlbnQgeyByZXR1cm4gZXZlbnRFbWl0dGVyLm9mZih0eXBlLCBsaXN0ZW5lcik7IH1cclxuICAgIG9uY2UodHlwZTogRXZlbnRUeXBlLCBsaXN0ZW5lcjogKGFyZzogYW55KSA9PiB2b2lkKTogQ3VzdG9tRXZlbnQgeyByZXR1cm4gZXZlbnRFbWl0dGVyLm9uY2UodHlwZSwgbGlzdGVuZXIpOyB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX3BlbmRpbmdDb21waWxlVGltZXI6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbCA9IG51bGw7XHJcbiAgICBwcml2YXRlIF9wZW5kaW5nQ29tcGlsZVRhc2tJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJ3lp4vljJZTY3JpcHRpbmfmqKHlnZdcclxuICAgICAqIEBwYXJhbSBwcm9qZWN0UGF0aCDpobnnm67ot6/lvoRcclxuICAgICAqIEBwYXJhbSBlbmdpbmVQYXRoIOW8leaTjui3r+W+hFxyXG4gICAgICogQHBhcmFtIGZlYXR1cmVzIOW8leaTjuWKn+iDveeJueaAp+WIl+ihqFxyXG4gICAgICovXHJcbiAgICBhc3luYyBpbml0aWFsaXplKHByb2plY3RQYXRoOiBzdHJpbmcsIGVuZ2luZVBhdGg6IHN0cmluZywgZmVhdHVyZXM6IHN0cmluZ1tdKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcGFja2VyRHJpdmVyID0gYXdhaXQgUGFja2VyRHJpdmVyLmNyZWF0ZShwcm9qZWN0UGF0aCwgZW5naW5lUGF0aCk7XHJcbiAgICAgICAgYXdhaXQgcGFja2VyRHJpdmVyLmluaXQoZmVhdHVyZXMpO1xyXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOafpeivouaWh+S7tueahOS+nei1luiAhe+8iOiwgeS9v+eUqOS6hui/meS4quaWh+S7tu+8iVxyXG4gICAgICogQHBhcmFtIHBhdGgg5paH5Lu26Lev5b6EXHJcbiAgICAgKiBAcmV0dXJucyDkvb/nlKjor6Xmlofku7bnmoTlhbbku5bmlofku7bot6/lvoTliJfooahcclxuICAgICAqL1xyXG4gICAgYXN5bmMgcXVlcnlTY3JpcHRVc2VycyhwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XHJcbiAgICAgICAgcmV0dXJuIFBhY2tlckRyaXZlci5nZXRJbnN0YW5jZSgpLnF1ZXJ5U2NyaXB0VXNlcnMocGF0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmn6Xor6Lmlofku7bnmoTkvp3otZbvvIjov5nkuKrmlofku7bkvb/nlKjkuoblk6rkupvmlofku7bvvIlcclxuICAgICAqIEBwYXJhbSBwYXRoIOaWh+S7tui3r+W+hFxyXG4gICAgICogQHJldHVybnMg6K+l5paH5Lu25L6d6LWW55qE5YW25LuW5paH5Lu26Lev5b6E5YiX6KGoXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHF1ZXJ5U2NyaXB0RGVwZW5kZW5jaWVzKHBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcclxuICAgICAgICByZXR1cm4gUGFja2VyRHJpdmVyLmdldEluc3RhbmNlKCkucXVlcnlTY3JpcHREZXBzKHBhdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5p+l6K+i5YWx5Lqr6YWN572uXHJcbiAgICAgKiBAcmV0dXJucyDlhbHkuqvphY3nva7lr7nosaFcclxuICAgICAqL1xyXG4gICAgYXN5bmMgcXVlcnlTaGFyZWRTZXR0aW5ncygpOiBQcm9taXNlPFNoYXJlZFNldHRpbmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIFBhY2tlckRyaXZlci5nZXRJbnN0YW5jZSgpLnF1ZXJ5U2hhcmVkU2V0dGluZ3MoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOeUn+aIkOexu+Wei+WjsOaYjuaWh+S7tlxyXG4gICAgICovXHJcbiAgICBhc3luYyBnZW5lcmF0ZURlY2xhcmF0aW9ucygpIHtcclxuICAgICAgICByZXR1cm4gUGFja2VyRHJpdmVyLmdldEluc3RhbmNlKCkuZ2VuZXJhdGVEZWNsYXJhdGlvbnMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB0eXBlIOWPmOabtOexu+Wei1xyXG4gICAgICogQHBhcmFtIHV1aWQg6LWE5rqQVVVJRFxyXG4gICAgICogQHBhcmFtIGFzc2V0SW5mbyDotYTmupDkv6Hmga9cclxuICAgICAqIEBwYXJhbSBtZXRhIOWFg+aVsOaNrlxyXG4gICAgICovXHJcbiAgICBkaXNwYXRjaEFzc2V0Q2hhbmdlKGFzc2V0Q2hhbmdlOiBBc3NldENoYW5nZUluZm8pOiB2b2lkIHtcclxuICAgICAgICBQYWNrZXJEcml2ZXIuZ2V0SW5zdGFuY2UoKS5kaXNwYXRjaEFzc2V0Q2hhbmdlcyhhc3NldENoYW5nZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDosIPnlKjmlrnpnIDopoHmjZXojrflvILluLjvvIzml6DlvILluLjliJnnvJbor5HmiJDlip9cclxuICAgICAqIOe8luivkeiEmuacrOaWh+S7tlxyXG4gICAgICogQHBhcmFtIGFzc2V0Q2hhbmdlcyDotYTmupDlj5jmm7TliJfooajvvIzlpoLmnpzmnKrmj5DkvpvvvIzliJnnvJbor5HkuIrkuIDmrKHnvJPlrZjnmoTotYTmupDlj5jmm7TliJfooahcclxuICAgICAqL1xyXG4gICAgYXN5bmMgY29tcGlsZVNjcmlwdHMoYXNzZXRDaGFuZ2VzPzogQXNzZXRDaGFuZ2VJbmZvW10pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBhd2FpdCBQYWNrZXJEcml2ZXIuZ2V0SW5zdGFuY2UoKS5idWlsZChhc3NldENoYW5nZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gZGVsYXkg5bu26L+f5pe26Ze077yM5Y2V5L2N5Li65q+r56eSLCDlkIzkuIDml7bpl7Tlj6rog73mnInkuIDkuKrlu7bov5/nvJbor5Hku7vliqHvvIzlpoLmnpzlrZjlnKjliJnov5Tlm57lt7LmnInnmoTku7vliqFJRFxyXG4gICAgICogQHJldHVybnMg5bu26L+f57yW6K+R5Lu75Yqh55qESUTvvIzlpoLmnpzlrZjlnKjliJnov5Tlm57lt7LmnInnmoTku7vliqFJRFxyXG4gICAgICovXHJcbiAgICBwb3N0Q29tcGlsZVNjcmlwdHMoZGVsYXk6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgLy8g5aaC5p6c5bey57uP5pyJ5b6F5omn6KGM55qE5bu26L+f5Lu75Yqh77yM5Y+W5raI5a6DXHJcbiAgICAgICAgaWYgKHRoaXMuX3BlbmRpbmdDb21waWxlVGltZXIpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3BlbmRpbmdDb21waWxlVGltZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDlpoLmnpzlt7LmnInku7vliqFJRO+8jOe7p+e7reS9v+eUqOWug++8m+WQpuWImeeUn+aIkOaWsOeahFxyXG4gICAgICAgIGNvbnN0IHRhc2tJZCA9IHRoaXMuX3BlbmRpbmdDb21waWxlVGFza0lkIHx8IHV1aWQoKTtcclxuICAgICAgICB0aGlzLl9wZW5kaW5nQ29tcGlsZVRhc2tJZCA9IHRhc2tJZDtcclxuICAgICAgICBcclxuICAgICAgICAvLyDliJvlu7rmlrDnmoTlu7bov5/ku7vliqFcclxuICAgICAgICB0aGlzLl9wZW5kaW5nQ29tcGlsZVRpbWVyID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQ29tcGlsaW5nKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9zdENvbXBpbGVTY3JpcHRzKGRlbGF5KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrSWQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3BlbmRpbmdDb21waWxlVGltZXIgPSBudWxsO1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50VGFza0lkID0gdGhpcy5fcGVuZGluZ0NvbXBpbGVUYXNrSWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3BlbmRpbmdDb21waWxlVGFza0lkID0gbnVsbDtcclxuICAgICAgICAgICAgUGFja2VyRHJpdmVyLmdldEluc3RhbmNlKCkuYnVpbGQodW5kZWZpbmVkLCBjdXJyZW50VGFza0lkIHx8IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgfSwgZGVsYXkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0YXNrSWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6XnvJbor5HmmK/lkKblv5nnooxcclxuICAgICAqIEByZXR1cm5zIOaYr+WQpuato+WcqOe8luivkVxyXG4gICAgICovXHJcbiAgICBpc0NvbXBpbGluZygpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gUGFja2VyRHJpdmVyLmdldEluc3RhbmNlKCkuYnVzeSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5b2T5YmN5q2j5Zyo5omn6KGM55qE57yW6K+R5Lu75YqhSURcclxuICAgICAqIEByZXR1cm5zIOS7u+WKoUlE77yM5aaC5p6c5rKh5pyJ5q2j5Zyo5omn6KGM55qE5Lu75Yqh5YiZ6L+U5ZuebnVsbFxyXG4gICAgICovXHJcbiAgICBnZXRDdXJyZW50VGFza0lkKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiBQYWNrZXJEcml2ZXIuZ2V0SW5zdGFuY2UoKS5nZXRDdXJyZW50VGFza0lkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmo4Dmn6Xnm67moIfmmK/lkKblsLHnu6pcclxuICAgICAqIEBwYXJhbSB0YXJnZXROYW1lIOebruagh+WQjeensO+8jOWmgiAnZWRpdG9yJyDmiJYgJ3ByZXZpZXcnXHJcbiAgICAgKiBAcmV0dXJucyDmmK/lkKblsLHnu6pcclxuICAgICAqL1xyXG4gICAgaXNUYXJnZXRSZWFkeSh0YXJnZXROYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gUGFja2VyRHJpdmVyLmdldEluc3RhbmNlKCkuaXNSZWFkeSh0YXJnZXROYW1lKSA/PyBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9veiEmuacrOW5tuaJp+ihjFxyXG4gICAgICogQHBhcmFtIHNjcmlwdFV1aWRzIOiEmuacrFVVSUTliJfooahcclxuICAgICAqIEBwYXJhbSBwbHVnaW5TY3JpcHRzIOaPkuS7tuiEmuacrOS/oeaBr+WIl+ihqFxyXG4gICAgICovXHJcbiAgICBhc3luYyBsb2FkU2NyaXB0KHNjcmlwdFV1aWRzOiBzdHJpbmdbXSwgcGx1Z2luU2NyaXB0czogSVBsdWdpblNjcmlwdEluZm9bXSA9IFtdKSB7XHJcbiAgICAgICAgaWYgKCFzY3JpcHRVdWlkcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnTm8gc2NyaXB0IG5lZWQgcmVsb2FkLicpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ3JlbG9hZCBhbGwgc2NyaXB0cy4nKTtcclxuICAgICAgICAvLyBUT0RPIOmcgOimgeaUr+aMgeaMieWFpeWPguaMiemcgOWKoOi9veiEmuacrFxyXG4gICAgICAgIGF3YWl0IGdsb2JhbEVudi5yZWNvcmQoYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWV4ZWN1dG9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgY3JlYXRpbmcgZXhlY3V0b3IgLi4uYCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYWNrZXJEcml2ZXIgPSBQYWNrZXJEcml2ZXIuZ2V0SW5zdGFuY2UoKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZWRQYWNrTG9hZGVyQ29udGV4dCA9IHBhY2tlckRyaXZlci5nZXRRdWlja1BhY2tMb2FkZXJDb250ZXh0KCdlZGl0b3InKSEuc2VyaWFsaXplKCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBxdWlja1BhY2tMb2FkZXJDb250ZXh0ID0gUXVpY2tQYWNrTG9hZGVyQ29udGV4dC5kZXNlcmlhbGl6ZShzZXJpYWxpemVkUGFja0xvYWRlckNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBsb2FkRHluYW1pYyB9ID0gYXdhaXQgaW1wb3J0KCdjYy9wcmVsb2FkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2NlTW9kdWxlTWFwID0gUGFja2VyRHJpdmVyLnF1ZXJ5Q0NFTW9kdWxlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICBleGVjdXRvciA9IGF3YWl0IEV4ZWN1dG9yLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgICAgIGltcG9ydEVuZ2luZU1vZDogYXN5bmMgKGlkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBsb2FkRHluYW1pYyhpZCkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBxdWlja1BhY2tMb2FkZXJDb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgIGNjZU1vZHVsZU1hcCxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgICAgICAgICAgICBnbG9iYWxUaGlzLnNlbGYgPSB3aW5kb3c7XHJcbiAgICAgICAgICAgICAgICBleGVjdXRvci5hZGRQb2x5ZmlsbEZpbGUocmVxdWlyZS5yZXNvbHZlKCdAY29jb3MvYnVpbGQtcG9seWZpbGxzL3ByZWJ1aWx0L2VkaXRvci9idW5kbGUnKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghZXhlY3V0b3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBpbml0IGV4ZWN1dG9yJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZXhlY3V0b3Iuc2V0UGx1Z2luU2NyaXB0cyhwbHVnaW5TY3JpcHRzKTtcclxuICAgICAgICAgICAgYXdhaXQgZXhlY3V0b3IucmVsb2FkKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmn6Xor6JDQ0XmqKHlnZfmmKDlsIRcclxuICAgICAqIEByZXR1cm5zIENDReaooeWdl+aYoOWwhOWvueixoVxyXG4gICAgICovXHJcbiAgICBxdWVyeUNDRU1vZHVsZU1hcCgpOiBDQ0VNb2R1bGVNYXAge1xyXG4gICAgICAgIHJldHVybiBQYWNrZXJEcml2ZXIucXVlcnlDQ0VNb2R1bGVNYXAoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluaMh+Wumuebruagh+eahExvYWRlcuS4iuS4i+aWh1xyXG4gICAgICogQHBhcmFtIHRhcmdldE5hbWUg55uu5qCH5ZCN56ewXHJcbiAgICAgKiBAcmV0dXJucyDluo/liJfljJblkI7nmoRMb2FkZXLkuIrkuIvmlodcclxuICAgICAqL1xyXG4gICAgZ2V0UGFja2VyRHJpdmVyTG9hZGVyQ29udGV4dCh0YXJnZXROYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gUGFja2VyRHJpdmVyLmdldEluc3RhbmNlKCkuZ2V0UXVpY2tQYWNrTG9hZGVyQ29udGV4dCh0YXJnZXROYW1lKT8uc2VyaWFsaXplKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmuIXpmaTnvJPlrZjlubbph43mlrDnvJbor5FcclxuICAgICAqL1xyXG4gICAgYXN5bmMgY2xlYXJDYWNoZUFuZFJlYnVpbGQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgYXdhaXQgUGFja2VyRHJpdmVyLmdldEluc3RhbmNlKCkuY2xlYXJDYWNoZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pu05paw5pWw5o2u5bqT5L+h5oGvXHJcbiAgICAgKiBAcGFyYW0gZGJJbmZvcyDmlbDmja7lupPkv6Hmga/liJfooahcclxuICAgICAqL1xyXG4gICAgYXN5bmMgdXBkYXRlRGF0YWJhc2VzKGRiSW5mbzogREJJbmZvLCBkYkNoYW5nZVR5cGU6IERCQ2hhbmdlVHlwZSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGF3YWl0IFBhY2tlckRyaXZlci5nZXRJbnN0YW5jZSgpLnVwZGF0ZURiSW5mb3MoZGJJbmZvLCBkYkNoYW5nZVR5cGUpO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgbmV3IFNjcmlwdE1hbmFnZXIoKTtcclxuXHJcbi8vIOWvvOWHuuexu+Wei+S+m+WklumDqOS9v+eUqFxyXG5leHBvcnQgeyBBc3NldENoYW5nZUluZm8sIEFzc2V0Q2hhbmdlVHlwZSB9IGZyb20gJy4vcGFja2VyLWRyaXZlci9hc3NldC1kYi1pbnRlcm9wJztcclxuZXhwb3J0IHR5cGUgeyBTaGFyZWRTZXR0aW5ncywgSVBsdWdpblNjcmlwdEluZm8gfSBmcm9tICcuL2ludGVyZmFjZSc7XHJcbmV4cG9ydCB0eXBlIHsgQ0NFTW9kdWxlTWFwIH0gZnJvbSAnLi4vZW5naW5lL0B0eXBlcy9jb25maWcnO1xyXG5leHBvcnQgdHlwZSB7IEV2ZW50VHlwZSB9IGZyb20gJy4vZXZlbnQtZW1pdHRlcic7XHJcbmV4cG9ydCB0eXBlIHsgVHlwZVNjcmlwdEFzc2V0SW5mb0NhY2hlIH0gZnJvbSAnLi9zaGFyZWQvY2FjaGUnO1xyXG4iXX0=