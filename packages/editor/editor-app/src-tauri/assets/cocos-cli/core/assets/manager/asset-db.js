'use strict';
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assetdb = __importStar(require("@cocos/asset-db"));
const events_1 = __importDefault(require("events"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const console_1 = require("../../base/console");
const utils_1 = require("../utils");
const plugin_1 = __importDefault(require("./plugin"));
const asset_handler_1 = __importDefault(require("./asset-handler"));
const i18n_1 = __importDefault(require("../../base/i18n"));
const utils_2 = __importDefault(require("../../base/utils"));
const asset_config_1 = __importDefault(require("../asset-config"));
const scripting_1 = __importDefault(require("../../scripting"));
const asset_db_interop_1 = require("../../scripting/packer-driver/asset-db-interop");
const asset_1 = require("@cocos/asset-db/libs/asset");
const AssetDBPriority = {
    internal: 99,
    assets: 98,
};
/**
 * 总管理器，管理整个资源进程的启动流程、以及一些子管理器的启动流程
 */
class AssetDBManager extends events_1.default {
    assetDBMap = {};
    globalInternalLibrary = false;
    hasPause = false;
    startPause = false;
    get isPause() {
        // return this.hasPause || this.startPause;
        return false;
    }
    ready = false;
    waitPauseHandle;
    waitPausePromiseTask;
    state = 'free';
    assetDBInfo = {};
    waitingTaskQueue = [];
    waitingRefreshAsset = [];
    pendingAutoRefreshResolves = [];
    autoRefreshTimer;
    get assetBusy() {
        return this.assetBusyTask.size > 0;
    }
    reimportCheck = false;
    assetBusyTask = new Set();
    pluginManager = plugin_1.default;
    assetHandlerManager = asset_handler_1.default;
    static useCache = false;
    static libraryRoot;
    static tempRoot;
    get free() {
        return this.ready && !this.isPause && this.state !== 'free' && !this.assetBusy;
    }
    /**
     * 初始化，需要优先调用
     * @param 资源配置信息
     */
    async init() {
        const { assetDBList, flagReimportCheck, libraryRoot, tempRoot, restoreAssetDBFromCache } = asset_config_1.default.data;
        if (!assetDBList.length) {
            throw new Error(i18n_1.default.t('assets.init.no_asset_db_list'));
        }
        AssetDBManager.libraryRoot = libraryRoot;
        AssetDBManager.tempRoot = tempRoot;
        AssetDBManager.useCache = restoreAssetDBFromCache;
        assetDBList.forEach((info) => {
            this.assetDBInfo[info.name] = patchAssetDBInfo(info);
        });
        // TODO 版本升级资源应该只认自身记录的版本号
        // if (AssetDBManager.useCache && Project.info.version !== Project.info.lastVersion) {
        //     AssetDBManager.useCache = false;
        //     console.log(i18n.t('assets.restoreAssetDBFromCacheInValid.upgrade'));
        // }
        if (AssetDBManager.useCache && !(0, fs_extra_1.existsSync)(AssetDBManager.libraryRoot)) {
            AssetDBManager.useCache = false;
            console.log(i18n_1.default.t('assets.restore_asset_d_b_from_cache_in_valid.no_library_path'));
        }
        await this.pluginManager.init();
        await this.assetHandlerManager.init();
        this.reimportCheck = flagReimportCheck;
    }
    /**
     * 启动数据库入口
     */
    async start() {
        console_1.newConsole.trackTimeStart('assets:start-database');
        if (AssetDBManager.useCache) {
            await this._startFromCache();
        }
        else {
            // await this._start();
            await this._startDirectly();
        }
        await afterStartDB(this.assetDBInfo);
        this.ready = true;
        console_1.newConsole.trackTimeEnd('asset-db:start-database', { output: true });
        // 性能测试: 资源冷导入
        console_1.newConsole.trackTimeEnd('asset-db:ready', { output: true });
        this.emit('assets:ready');
        // TODO 不是常驻模式，则无需开启，启动成功后，开始加载尚未注册的资源处理器
        // this.assetHandlerManager.activateRegisterAll();
        this.step();
        // TODO 启动成功后开始再去做一些日志缓存清理
    }
    /**
     * 首次启动数据库
     */
    async _start() {
        console_1.newConsole.trackMemoryStart('assets:worker-init: preStart');
        const assetDBNames = Object.keys(this.assetDBInfo).sort((a, b) => (AssetDBPriority[b] || 0) - (AssetDBPriority[a] || 0));
        const startupDatabaseQueue = [];
        for (const assetDBName of assetDBNames) {
            const db = await this._createDB(this.assetDBInfo[assetDBName]);
            const waitingStartupDBInfo = await this._preStartDB(db);
            startupDatabaseQueue.push(waitingStartupDBInfo);
        }
        console_1.newConsole.trackMemoryEnd('asset-db:worker-init: preStart');
        console_1.newConsole.trackMemoryStart('assets:worker-init: startup');
        for (let i = 0; i < startupDatabaseQueue.length; i++) {
            const startupDatabase = startupDatabaseQueue[i];
            await this._startupDB(startupDatabase);
        }
        console_1.newConsole.trackMemoryEnd('asset-db:worker-init: startup');
    }
    /**
     * 直接启动数据库
     */
    async _startDirectly() {
        const assetDBNames = Object.keys(this.assetDBInfo).sort((a, b) => (AssetDBPriority[b] || 0) - (AssetDBPriority[a] || 0));
        for (const assetDBName of assetDBNames) {
            await this.startDB(this.assetDBInfo[assetDBName]);
        }
    }
    /**
     * 从缓存启动数据库，如果恢复失败会回退到原始的启动流程
     */
    async _startFromCache() {
        console.debug('try start all assetDB from cache...');
        const assetDBNames = Object.keys(this.assetDBInfo).sort((a, b) => (AssetDBPriority[b] || 0) - (AssetDBPriority[a] || 0));
        for (const assetDBName of assetDBNames) {
            const db = await this._createDB(this.assetDBInfo[assetDBName]);
            if ((0, fs_extra_1.existsSync)(db.cachePath)) {
                try {
                    await db.startWithCache();
                    this.assetDBInfo[assetDBName].state = 'startup';
                    this.emit('db-started', db);
                    console.debug(`start db ${assetDBName} with cache success`);
                    this.emit('assets:db-ready', assetDBName);
                    continue;
                }
                catch (error) {
                    console.error(error);
                    console.warn(`start db ${assetDBName} with cache failed, try to start db ${assetDBName} without cache`);
                }
            }
            // 没有正常走完缓存恢复，走普通的启动流程
            const waitingStartupDBInfo = await this._preStartDB(db);
            await this._startupDB(waitingStartupDBInfo);
        }
    }
    isBusy() {
        for (const name in this.assetDBMap) {
            if (!this.assetDBMap[name]) {
                continue;
            }
            const db = this.assetDBMap[name];
            if (db.assetProgressInfo.wait > 0) {
                return true;
            }
        }
        return false;
    }
    hasDB(name) {
        return !!this.assetDBMap[name];
    }
    async startDB(info) {
        if (this.hasDB(info.name)) {
            return;
        }
        await this._createDB(info);
        await this._startDB(info.name);
        this.emit('assets:db-ready', info.name);
    }
    /**
     * 将一个绝对路径，转成 url 地址
     * @param path
     * @param dbName 可选
     */
    path2url(path, dbName) {
        // 否则会出现返回 'db://internal/../../../../../db:/internal' 的情况
        if (path === `db://${dbName}`) {
            return path;
        }
        let database;
        if (!dbName) {
            database = Object.values(assetDBManager.assetDBMap).find((db) => utils_2.default.Path.contains(db.options.target, path));
        }
        else {
            database = assetDBManager.assetDBMap[dbName];
        }
        if (!database) {
            console.error(`Can not find asset db with asset path: ${path}`);
            return path;
        }
        // 将 windows 上的 \ 转成 /，统一成 url 格式
        let _path = (0, path_1.relative)(database.options.target, path);
        _path = _path.replace(/\\/g, '/');
        return `db://${database.options.name}/${_path}`;
    }
    async _createDB(info) {
        (0, fs_extra_1.ensureDirSync)(info.library);
        (0, fs_extra_1.ensureDirSync)(info.temp);
        // TODO 目标数据库地址为空的时候，其实无需走后续完整的启动流程，可以考虑优化
        (0, fs_extra_1.ensureDirSync)(info.target);
        info.flags = {
            reimportCheck: this.reimportCheck,
        };
        const db = assetdb.create(info);
        this.assetDBMap[info.name] = db;
        db.importerManager.find = async (asset) => {
            const importer = await this.assetHandlerManager.findImporter(asset, true);
            if (importer) {
                return importer;
            }
            const newImporter = await this.assetHandlerManager.getDefaultImporter(asset);
            return newImporter || importer;
        };
        this.emit('db-created', db);
        console.debug(`create db ${info.name} success in ${info.library}`);
        // 初始化一些脚本需要的数据库信息
        scripting_1.default.updateDatabases({ dbID: info.name, target: info.target }, asset_db_interop_1.DBChangeType.add);
        return db;
    }
    /**
     * 预启动 db, 需要与 _startupDB 搭配使用，请勿单独调用
     * @param db
     * @returns
     */
    async _preStartDB(db) {
        const hooks = {
            afterScan,
        };
        // HACK 目前因为一些特殊的导入需求，将 db 启动流程强制分成了两次
        return await new Promise(async (resolve, reject) => {
            const handleInfo = {
                name: db.options.name,
                afterPreImportResolve: () => {
                    console.error(`Start database ${db.options.name} failed!`);
                    // 防止意外情况下，资源进程卡死无任何信息
                    handleInfo.finish && handleInfo.finish();
                },
            };
            // HACK 1/3 启动数据库时，不导入全部资源，先把预导入资源导入完成后进入等待状态
            hooks.afterPreImport = async () => {
                await afterPreImport(db);
                console.debug(`PreImport db ${db.options.name} success`);
                resolve(handleInfo);
                return new Promise((resolve) => {
                    handleInfo.afterPreImportResolve = resolve;
                });
            };
            hooks.afterStart = () => {
                handleInfo.finish && handleInfo.finish();
            };
            db.start({
                hooks,
            }).catch((error) => {
                reject(error);
            });
            this.assetDBInfo[db.options.name].state = 'start';
        });
    }
    /**
     * 完全启动之前预启动的 db ，请勿单独调用
     * @param startupDatabase
     */
    async _startupDB(startupDatabase) {
        console.debug(`Start up the '${startupDatabase.name}' database...`);
        console_1.newConsole.trackTimeStart(`asset-db: startup '${startupDatabase.name}' database...`);
        // 2/3 结束 afterPreImport 预留的等待状态，正常进入资源的导入流程,标记 finish 作为结束判断
        await new Promise(async (resolve) => {
            startupDatabase.finish = resolve;
            startupDatabase.afterPreImportResolve();
        });
        console_1.newConsole.trackTimeEnd(`asset-db:worker-startup-database[${startupDatabase.name}]`, { output: true });
        console_1.newConsole.trackMemoryEnd(`asset-db:worker-startup-database[${startupDatabase.name}]`);
        this.assetDBInfo[startupDatabase.name].state = 'startup';
        const db = this.assetDBMap[startupDatabase.name];
        this.emit('db-started', db);
        console_1.newConsole.trackTimeEnd(`asset-db: startup '${startupDatabase.name}' database...`);
    }
    /**
     * 启动某个指定数据库
     * @param name
     */
    async _startDB(name) {
        const db = this.assetDBMap[name];
        console_1.newConsole.trackTimeStart(`asset-db:worker-startup-database[${db.options.name}]`);
        console_1.newConsole.trackMemoryStart(`asset-db:worker-startup-database[${db.options.name}]`);
        this.assetDBInfo[name].state = 'start';
        const preImporterHandler = getPreImporterHandler(this.assetDBInfo[name].preImportExtList);
        if (preImporterHandler) {
            db.preImporterHandler = preImporterHandler;
        }
        const hooks = {
            afterScan,
        };
        hooks.afterPreImport = async () => {
            await afterPreImport(db);
        };
        console.debug(`start asset-db(${name})...`);
        await db.start({
            hooks,
        });
        this.assetDBInfo[name].state = 'startup';
        this.emit('db-started', db);
        console_1.newConsole.trackTimeEnd(`asset-db:worker-startup-database[${db.options.name}]`, { output: true });
        console_1.newConsole.trackMemoryEnd(`asset-db:worker-startup-database[${db.options.name}]`);
        return;
    }
    /**
     * 添加某个 asset db
     */
    async addDB(info) {
        this.assetDBInfo[info.name] = patchAssetDBInfo(info);
        await this.startDB(this.assetDBInfo[info.name]);
    }
    /**
     * 移除某个 asset-db
     * @param name
     * @returns
     */
    async removeDB(name) {
        if (this.isPause) {
            console.log(i18n_1.default.t('assets.asset_d_b_pause_tips', { operate: 'removeDB' }));
            return new Promise((resolve, reject) => {
                this._addTaskToQueue({
                    func: this._removeDB.bind(this),
                    args: [name],
                    resolve,
                    reject
                });
            });
        }
        return await this._removeDB(name);
    }
    async _operate(name, ...args) {
        const taskId = name + Date.now();
        if (name.endsWith('Asset')) {
            this.assetBusyTask.add(taskId);
        }
        try {
            // @ts-ignore
            const res = await this[name](...args);
            this.assetBusyTask.delete(taskId);
            return res;
        }
        catch (error) {
            console.error(`${name} failed with args: ${args.toString()}`);
            console.error(error);
            this.assetBusyTask.delete(taskId);
        }
    }
    async _removeDB(name) {
        const db = this.assetDBMap[name];
        if (!db) {
            return;
        }
        await db.stop();
        this.emit('db-removed', db);
        delete this.assetDBMap[name];
        delete this.assetDBInfo[name];
        this.emit('assets:db-close', name);
    }
    /**
     * 刷新所有数据库
     * @returns
     */
    async refresh() {
        if (!this.ready) {
            return;
        }
        if (this.state !== 'free' || this.isPause || this.assetBusy) {
            if (this.isPause) {
                console.log(i18n_1.default.t('assets.asset_d_b_pause_tips', { operate: 'refresh' }));
            }
            return new Promise((resolve, reject) => {
                this._addTaskToQueue({
                    func: this._refresh.bind(this),
                    args: [],
                    resolve,
                    reject
                });
            });
        }
        return await this._refresh();
    }
    async _refresh() {
        this.state = 'busy';
        console_1.newConsole.trackTimeStart('assets:refresh-all-database');
        for (const name in this.assetDBMap) {
            if (!this.assetDBMap[name]) {
                console.debug(`Get assetDB ${name} form manager failed!`);
                continue;
            }
            const db = this.assetDBMap[name];
            await db.refresh(db.options.target, {
                ignoreSelf: true,
                // 只有 assets 资源库做 effect 编译处理
                hooks: name === 'assets' ? {
                    afterPreImport: async () => {
                        await afterPreImport(db);
                    },
                } : {},
            });
            console.debug(`refresh db ${name} success`);
        }
        console_1.newConsole.trackTimeEnd('asset-db:refresh-all-database', { output: true });
        this.emit('assets:refresh-finish');
        this.state = 'free';
        this.step();
    }
    /**
     * 懒刷新资源，请勿使用，目前的逻辑是针对重刷文件夹定制的
     * @param file
     */
    async autoRefreshAssetLazy(pathOrUrlOrUUID) {
        if (!this.waitingRefreshAsset.includes(pathOrUrlOrUUID)) {
            this.waitingRefreshAsset.push(pathOrUrlOrUUID);
        }
        this.autoRefreshTimer && clearTimeout(this.autoRefreshTimer);
        return new Promise((resolve) => {
            this.pendingAutoRefreshResolves.push(resolve);
            this.autoRefreshTimer = setTimeout(async () => {
                const taskId = 'autoRefreshAssetLazy' + Date.now();
                this.assetBusyTask.add(taskId);
                const files = JSON.parse(JSON.stringify(this.waitingRefreshAsset));
                this.waitingRefreshAsset.length = 0;
                await Promise.all(files.map((file) => assetdb.refresh(file)));
                this.assetBusyTask.delete(taskId);
                this.step();
                this.pendingAutoRefreshResolves.forEach((resolve) => resolve(true));
                this.pendingAutoRefreshResolves.length = 0;
            }, 100);
        });
    }
    /**
     * 恢复被暂停的数据库
     * @returns
     */
    async resume() {
        if (!this.hasPause && !this.startPause) {
            return true;
        }
        this.hasPause = false;
        this.startPause = false;
        this.emit('assets:resume');
        await this.step();
        return true;
    }
    async addTask(func, args) {
        if (this.isPause || this.state === 'busy') {
            console.log(i18n_1.default.t('assets.asset_d_b_pause_tips', { operate: func.name }));
            return new Promise((resolve, reject) => {
                this._addTaskToQueue({
                    func,
                    args: args,
                    resolve,
                    reject,
                });
            });
        }
        return await func(...args);
    }
    _addTaskToQueue(task) {
        const last = this.waitingTaskQueue[this.waitingTaskQueue.length - 1];
        const curTask = {
            func: task.func,
            args: task.args,
        };
        if (task.resolve && task.reject) {
            curTask.resolves = [task.resolve];
            curTask.rejects = [task.reject];
        }
        if (!last) {
            this.waitingTaskQueue.push(curTask);
            this.step();
            return;
        }
        // 不一样的任务添加进队列
        if (last.func.name !== curTask.func.name || curTask.args.toString() !== last.args.toString()) {
            this.waitingTaskQueue.push(curTask);
            this.step();
            return;
        }
        // 将一样的任务合并
        if (!task.resolve || !task.reject) {
            return;
        }
        if (last.resolves && last.rejects) {
            last.resolves.push(task.resolve);
            last.rejects.push(task.reject);
        }
        else {
            last.resolves = curTask.resolves;
            last.rejects = curTask.rejects;
        }
        this.step();
    }
    async step() {
        // 存在等待的 handle 先处理回调
        if (this.startPause && this.waitPauseHandle) {
            this.waitPauseHandle(true);
            this.waitPauseHandle = undefined;
        }
        // db 暂停时，不处理等待任务
        if (this.isPause || !this.waitingTaskQueue.length || this.state === 'busy') {
            return;
        }
        // 深拷贝以避免在处理的过程中持续收到任务
        let waitingTaskQueue = Array.from(this.waitingTaskQueue);
        const lastWaitingQueue = [];
        // 当同时有资源操作与整体的检查刷新任务时，优先执行资源操作任务
        waitingTaskQueue = waitingTaskQueue.filter((task) => {
            if (!this.assetBusy || (this.assetBusy && task.func.name !== '_refresh')) {
                return true;
            }
            lastWaitingQueue.push(task);
            return false;
        });
        this.waitingTaskQueue = lastWaitingQueue;
        for (let index = 0; index < waitingTaskQueue.length; index++) {
            const task = waitingTaskQueue[index];
            try {
                if (task.func.name === '_refresh' && this.assetBusy) {
                    // 没有执行的任务塞回队列
                    this.waitingTaskQueue.push(task);
                    continue;
                }
                const res = await task.func(...task.args);
                if (!task.resolves) {
                    return;
                }
                task.resolves.forEach((resolve) => resolve(res));
            }
            catch (error) {
                console.warn(error);
                if (task.rejects) {
                    task.rejects.forEach((reject) => reject(error));
                }
            }
        }
        // 当前 step 的处理任务完成即可结束，剩余任务会在下一次 step 中处理
    }
    /**
     * 暂停数据库
     * @param source 来源标识
     * @returns
     */
    async pause(source = 'unkown') {
        this.startPause = true;
        // 只要当前底层没有正在处理的资源都视为资源进入可暂停状态
        if (!this.isBusy()) {
            this.hasPause = true;
            this.emit('assets:pause', source);
            console.log(`Asset DB is paused with ${source}!`);
            return true;
        }
        if (!this.hasPause) {
            return this.waitPausePromiseTask;
        }
        this.waitPausePromiseTask = new Promise((resolve) => {
            this.waitPauseHandle = () => {
                this.waitPausePromiseTask = undefined;
                this.emit('assets:pause', source);
                console.log(`Asset DB is paused with ${source}!`);
                this.hasPause = true;
                resolve(true);
            };
        });
        // 2 分钟的超时时间，超过自动返回回调
        setTimeout(() => {
            this.waitPausePromiseTask && (0, utils_1.decidePromiseState)(this.waitPausePromiseTask).then(state => {
                if (state === utils_1.PROMISE_STATE.PENDING) {
                    this.hasPause = true;
                    this.emit('assets:pause', source);
                    this.waitPauseHandle();
                    console.debug('Pause asset db time out');
                }
            });
        }, 2000 * 60);
        return this.waitPausePromiseTask;
    }
}
const assetDBManager = new AssetDBManager();
exports.default = assetDBManager;
globalThis.assetDBManager = assetDBManager;
function patchAssetDBInfo(config) {
    return {
        name: config.name,
        target: utils_2.default.Path.normalize(config.target),
        readonly: !!config.readonly,
        temp: config.temp || utils_2.default.Path.normalize((0, path_1.join)(AssetDBManager.tempRoot, config.name)),
        library: config.library || AssetDBManager.libraryRoot,
        level: 4,
        globList: asset_config_1.default.data.globList,
        ignoreFiles: [],
        visible: config.visible,
        state: 'none',
        preImportExtList: config.preImportExtList || [],
    };
}
// TODO 排队队列做合并
// class AutoMergeQueue extends Array {
//     add(item: IWaitingTask) {
//         const lastTask = this[this.length - 1];
//         // 自动合并和上一个任务一样的
//         if (!lastTask || !lodash.isEqual({name: item.name, args: item.args}, {name: lastTask.name, args: lastTask.args})) {
//             return this.push(item);
//         }
//         if (!item.resolve) {
//             return this.length - 1;
//         }
//         lastTask.resolves = lastTask.resolves ? [] : lastTask.resolves;
//         lastTask.resolve && lastTask.resolves.push(lastTask.resolve);
//         lastTask.resolves.push(item.resolve);
//     }
// }
const layerMask = [];
for (let i = 0; i <= 19; i++) {
    layerMask[i] = 1 << i;
}
const defaultPreImportExtList = ['.ts', '.chunk', '.effect'];
function getPreImporterHandler(preImportExtList) {
    if (!preImportExtList || !preImportExtList.length) {
        preImportExtList = defaultPreImportExtList;
    }
    else {
        preImportExtList = Array.from(new Set(preImportExtList.concat(defaultPreImportExtList)));
    }
    return function (file) {
        // HACK 用于指定部分资源优先导入
        const ext = (0, path_1.extname)(file);
        if (!ext) {
            return true;
        }
        else {
            return preImportExtList.includes(ext);
        }
    };
}
const afterScan = async function (files) {
    let dirIndex = 0;
    let chunkIndex = 0;
    let effectIndex = 0;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = (0, path_1.extname)(file);
        if (!ext) {
            files.splice(i, 1);
            files.splice(dirIndex, 0, file);
            dirIndex += 1;
        }
        else if (ext === '.chunk') {
            files.splice(i, 1);
            files.splice(dirIndex + chunkIndex, 0, file);
            chunkIndex += 1;
        }
        else if (ext === '.effect') {
            files.splice(i, 1);
            files.splice(dirIndex + chunkIndex + effectIndex, 0, file);
            effectIndex += 1;
        }
    }
};
async function afterPreImport(db) {
    // 先把已收集的任务队列（preImporterHandler 过滤出来的那部分资源类型）内容优先导入执行完毕
    db.taskManager.start();
    await db.taskManager.waitQueue();
    db.taskManager.stop();
}
async function afterStartDB(dbInfoMap) {
    await asset_handler_1.default.compileEffect(true);
    // 启动数据库后，打开 effect 导入后的自动重新生成 effect.bin 开关
    await asset_handler_1.default.startAutoGenEffectBin();
    // 脚本系统未触发构建，启动脚本构建流程
    if (!scripting_1.default.isTargetReady('editor')) {
        const options = {
            ccType: 'cc.Script',
        };
        // TODO 底层 assetDB 支持查询过滤后，就可以移除这里的 globalThis.assetQuery
        const assetInfos = globalThis.assetQuery.queryAssetInfos(options, ['meta', 'url', 'file', 'importer', 'type']);
        for (const assetInfo of assetInfos) {
            const assetChange = {
                type: asset_1.AssetActionEnum.add,
                uuid: assetInfo.uuid,
                filePath: assetInfo.file,
                importer: assetInfo.importer,
                userData: assetInfo.meta?.userData || {},
            };
            try {
                // 编译报错会抛异常，不能影响启动流程
                await scripting_1.default.compileScripts([assetChange]);
            }
            catch (error) {
                console.error(error);
            }
        }
    }
    // 目前结构里，没有关闭数据库的逻辑
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQtZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvbWFuYWdlci9hc3NldC1kYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR2IseURBQTJDO0FBQzNDLG9EQUFrQztBQUNsQyx1Q0FBcUQ7QUFDckQsK0JBQStDO0FBQy9DLGdEQUFnRDtBQUNoRCxvQ0FBNkQ7QUFDN0Qsc0RBQXFDO0FBQ3JDLG9FQUFrRDtBQUNsRCwyREFBbUM7QUFDbkMsNkRBQXFDO0FBQ3JDLG1FQUEwQztBQUMxQyxnRUFBd0M7QUFDeEMscUZBQStGO0FBQy9GLHNEQUE2RDtBQUU3RCxNQUFNLGVBQWUsR0FBMkI7SUFDNUMsUUFBUSxFQUFFLEVBQUU7SUFDWixNQUFNLEVBQUUsRUFBRTtDQUNiLENBQUM7QUF3QkY7O0dBRUc7QUFDSCxNQUFNLGNBQWUsU0FBUSxnQkFBWTtJQUM5QixVQUFVLEdBQW9DLEVBQUUsQ0FBQztJQUNqRCxxQkFBcUIsR0FBRyxLQUFLLENBQUM7SUFFN0IsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUNqQixVQUFVLEdBQUcsS0FBSyxDQUFDO0lBQzNCLElBQVcsT0FBTztRQUNkLDJDQUEyQztRQUMzQyxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ00sS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNiLGVBQWUsQ0FBWTtJQUMzQixvQkFBb0IsQ0FBb0I7SUFDeEMsS0FBSyxHQUFpQixNQUFNLENBQUM7SUFDOUIsV0FBVyxHQUFpQyxFQUFFLENBQUM7SUFDOUMsZ0JBQWdCLEdBQXVCLEVBQUUsQ0FBQztJQUMxQyxtQkFBbUIsR0FBYSxFQUFFLENBQUM7SUFDbkMsMEJBQTBCLEdBQWUsRUFBRSxDQUFDO0lBQzVDLGdCQUFnQixDQUFrQjtJQUMxQyxJQUFZLFNBQVM7UUFDakIsT0FBTyxJQUFJLENBQUMs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V0FBVyxHQUFvQjtnQkFDakMsSUFBSSxFQUFFLHVCQUFlLENBQUMsR0FBRztnQkFDekIsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJO2dCQUNwQixRQUFRLEVBQUUsU0FBUyxDQUFDLElBQUk7Z0JBQ3hCLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUTtnQkFDNUIsUUFBUSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxJQUFJLEVBQUU7YUFDM0MsQ0FBQztZQUNGLElBQUksQ0FBQztnQkFDRCxvQkFBb0I7Z0JBQ3BCLE1BQU0sbUJBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2xELENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ0QsbUJBQW1CO0FBQ3ZCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBBc3NldERCUmVnaXN0ZXJJbmZvLCBJQXNzZXQsIElBc3NldERCSW5mbywgSUFzc2V0SW5mbywgUXVlcnlBc3NldHNPcHRpb24gfSBmcm9tICcuLi9AdHlwZXMvcHJpdmF0ZSc7XHJcbmltcG9ydCAqIGFzIGFzc2V0ZGIgZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xyXG5pbXBvcnQgeyBlbnN1cmVEaXJTeW5jLCBleGlzdHNTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBleHRuYW1lLCBqb2luLCByZWxhdGl2ZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBuZXdDb25zb2xlIH0gZnJvbSAnLi4vLi4vYmFzZS9jb25zb2xlJztcclxuaW1wb3J0IHsgZGVjaWRlUHJvbWlzZVN0YXRlLCBQUk9NSVNFX1NUQVRFIH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgcGx1Z2luTWFuYWdlciBmcm9tICcuL3BsdWdpbic7XHJcbmltcG9ydCBhc3NldEhhbmRsZXJNYW5hZ2VyIGZyb20gJy4vYXNzZXQtaGFuZGxlcic7XHJcbmltcG9ydCBpMThuIGZyb20gJy4uLy4uL2Jhc2UvaTE4bic7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9iYXNlL3V0aWxzJztcclxuaW1wb3J0IGFzc2V0Q29uZmlnIGZyb20gJy4uL2Fzc2V0LWNvbmZpZyc7XHJcbmltcG9ydCBzY3JpcHRpbmcgZnJvbSAnLi4vLi4vc2NyaXB0aW5nJztcclxuaW1wb3J0IHsgQXNzZXRDaGFuZ2VJbmZvLCBEQkNoYW5nZVR5cGUgfSBmcm9tICcuLi8uLi9zY3JpcHRpbmcvcGFja2VyLWRyaXZlci9hc3NldC1kYi1pbnRlcm9wJztcclxuaW1wb3J0IHsgQXNzZXRBY3Rpb25FbnVtIH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiL2xpYnMvYXNzZXQnO1xyXG5cclxuY29uc3QgQXNzZXREQlByaW9yaXR5OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge1xyXG4gICAgaW50ZXJuYWw6IDk5LFxyXG4gICAgYXNzZXRzOiA5OCxcclxufTtcclxuXHJcbmludGVyZmFjZSBJU3RhcnR1cERhdGFiYXNlSGFuZGxlSW5mbyB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBhZnRlclByZUltcG9ydFJlc29sdmU6IEZ1bmN0aW9uO1xyXG4gICAgZmluaXNoPzogRnVuY3Rpb247XHJcbn1cclxuXHJcbnR5cGUgUmVmcmVzaFN0YXRlID0gJ2ZyZWUnIHwgJ2J1c3knIHwgJ3dhaXQnO1xyXG5cclxuaW50ZXJmYWNlIElXYWl0aW5nVGFzayB7XHJcbiAgICBmdW5jOiBGdW5jdGlvbjtcclxuICAgIGFyZ3M6IGFueVtdO1xyXG4gICAgcmVzb2x2ZT86IEZ1bmN0aW9uO1xyXG4gICAgcmVqZWN0PzogRnVuY3Rpb247XHJcbn1cclxuXHJcbmludGVyZmFjZSBJV2FpdGluZ1Rhc2tJbmZvIHtcclxuICAgIGZ1bmM6IEZ1bmN0aW9uO1xyXG4gICAgYXJnczogYW55W107XHJcbiAgICByZXNvbHZlcz86IEZ1bmN0aW9uW107XHJcbiAgICByZWplY3RzPzogRnVuY3Rpb25bXTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOaAu+euoeeQhuWZqO+8jOeuoeeQhuaVtOS4qui1hOa6kOi/m+eoi+eahOWQr+WKqOa1geeoi+OAgeS7peWPiuS4gOS6m+WtkOeuoeeQhuWZqOeahOWQr+WKqOa1geeoi1xyXG4gKi9cclxuY2xhc3MgQXNzZXREQk1hbmFnZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG4gICAgcHVibGljIGFzc2V0REJNYXA6IFJlY29yZDxzdHJpbmcsIGFzc2V0ZGIuQXNzZXREQj4gPSB7fTtcclxuICAgIHB1YmxpYyBnbG9iYWxJbnRlcm5hbExpYnJhcnkgPSBmYWxzZTtcclxuXHJcbiAgICBwcml2YXRlIGhhc1BhdXNlID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIHN0YXJ0UGF1c2UgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBnZXQgaXNQYXVzZSgpIHtcclxuICAgICAgICAvLyByZXR1cm4gdGhpcy5oYXNQYXVzZSB8fCB0aGlzLnN0YXJ0UGF1c2U7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHJlYWR5ID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIHdhaXRQYXVzZUhhbmRsZT86IEZ1bmN0aW9uO1xyXG4gICAgcHJpdmF0ZSB3YWl0UGF1c2VQcm9taXNlVGFzaz86IFByb21pc2U8Ym9vbGVhbj47XHJcbiAgICBwcml2YXRlIHN0YXRlOiBSZWZyZXNoU3RhdGUgPSAnZnJlZSc7XHJcbiAgICBwdWJsaWMgYXNzZXREQkluZm86IFJlY29yZDxzdHJpbmcsIElBc3NldERCSW5mbz4gPSB7fTtcclxuICAgIHByaXZhdGUgd2FpdGluZ1Rhc2tRdWV1ZTogSVdhaXRpbmdUYXNrSW5mb1tdID0gW107XHJcbiAgICBwcml2YXRlIHdhaXRpbmdSZWZyZXNoQXNzZXQ6IHN0cmluZ1tdID0gW107XHJcbiAgICBwcml2YXRlIHBlbmRpbmdBdXRvUmVmcmVzaFJlc29sdmVzOiBGdW5jdGlvbltdID0gW107XHJcbiAgICBwcml2YXRlIGF1dG9SZWZyZXNoVGltZXI/OiBOb2RlSlMuVGltZW91dDtcclxuICAgIHByaXZhdGUgZ2V0IGFzc2V0QnVzeSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hc3NldEJ1c3lUYXNrLnNpemUgPiAwO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSByZWltcG9ydENoZWNrID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIGFzc2V0QnVzeVRhc2sgPSBuZXcgU2V0KCk7XHJcbiAgICBwcml2YXRlIHBsdWdpbk1hbmFnZXIgPSBwbHVnaW5NYW5hZ2VyO1xyXG4gICAgcHJpdmF0ZSBhc3NldEhhbmRsZXJNYW5hZ2VyID0gYXNzZXRIYW5kbGVyTWFuYWdlcjtcclxuXHJcbiAgICBzdGF0aWMgdXNlQ2FjaGUgPSBmYWxzZTtcclxuICAgIHN0YXRpYyBsaWJyYXJ5Um9vdDogc3RyaW5nO1xyXG4gICAgc3RhdGljIHRlbXBSb290OiBzdHJpbmc7XHJcblxyXG4gICAgZ2V0IGZyZWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZHkgJiYgIXRoaXMuaXNQYXVzZSAmJiB0aGlzLnN0YXRlICE9PSAnZnJlZScgJiYgIXRoaXMuYXNzZXRCdXN5O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yid5aeL5YyW77yM6ZyA6KaB5LyY5YWI6LCD55SoXHJcbiAgICAgKiBAcGFyYW0g6LWE5rqQ6YWN572u5L+h5oGvIFxyXG4gICAgICovXHJcbiAgICBhc3luYyBpbml0KCkge1xyXG4gICAgICAgIGNvbnN0IHsgYXNzZXREQkxpc3QsIGZsYWdSZWltcG9ydENoZWNrLCBsaWJyYXJ5Um9vdCwgdGVtcFJvb3QsIHJlc3RvcmVBc3NldERCRnJvbUNhY2hlIH0gPSBhc3NldENvbmZpZy5kYXRhO1xyXG4gICAgICAgIGlmICghYXNzZXREQkxpc3QubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihpMThuLnQoJ2Fzc2V0cy5pbml0Lm5vX2Fzc2V0X2RiX2xpc3QnKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEFzc2V0REJNYW5hZ2VyLmxpYnJhcnlSb290ID0gbGlicmFyeVJvb3Q7XHJcbiAgICAgICAgQXNzZXREQk1hbmFnZXIudGVtcFJvb3QgPSB0ZW1wUm9vdDtcclxuICAgICAgICBBc3NldERCTWFuYWdlci51c2VDYWNoZSA9IHJlc3RvcmVBc3NldERCRnJvbUNhY2hlO1xyXG4gICAgICAgIGFzc2V0REJMaXN0LmZvckVhY2goKGluZm8pID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hc3NldERCSW5mb1tpbmZvLm5hbWVdID0gcGF0Y2hBc3NldERCSW5mbyhpbmZvKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBUT0RPIOeJiOacrOWNh+e6p+i1hOa6kOW6lOivpeWPquiupOiHqui6q+iusOW9leeahOeJiOacrOWPt1xyXG4gICAgICAgIC8vIGlmIChBc3NldERCTWFuYWdlci51c2VDYWNoZSAmJiBQcm9qZWN0LmluZm8udmVyc2lvbiAhPT0gUHJvamVjdC5pbmZvLmxhc3RWZXJzaW9uKSB7XHJcbiAgICAgICAgLy8gICAgIEFzc2V0REJNYW5hZ2VyLnVzZUNhY2hlID0gZmFsc2U7XHJcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGkxOG4udCgnYXNzZXRzLnJlc3RvcmVBc3NldERCRnJvbUNhY2hlSW5WYWxpZC51cGdyYWRlJykpO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgaWYgKEFzc2V0REJNYW5hZ2VyLnVzZUNhY2hlICYmICFleGlzdHNTeW5jKEFzc2V0REJNYW5hZ2VyLmxpYnJhcnlSb290KSkge1xyXG4gICAgICAgICAgICBBc3NldERCTWFuYWdlci51c2VDYWNoZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhpMThuLnQoJ2Fzc2V0cy5yZXN0b3JlX2Fzc2V0X2RfYl9mcm9tX2NhY2hlX2luX3ZhbGlkLm5vX2xpYnJhcnlfcGF0aCcpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW5NYW5hZ2VyLmluaXQoKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmFzc2V0SGFuZGxlck1hbmFnZXIuaW5pdCgpO1xyXG5cclxuICAgICAgICB0aGlzLnJlaW1wb3J0Q2hlY2sgPSBmbGFnUmVpbXBvcnRDaGVjaztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWQr+WKqOaVsOaNruW6k+WFpeWPo1xyXG4gICAgICovXHJcbiAgICBhc3luYyBzdGFydCgpIHtcclxuICAgICAgICBuZXdDb25zb2xlLnRyYWNrVGltZVN0YXJ0KCdhc3NldHM6c3RhcnQtZGF0YWJhc2UnKTtcclxuXHJcbiAgICAgICAgaWYgKEFzc2V0REJNYW5hZ2VyLnVzZUNhY2hlKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX3N0YXJ0RnJvbUNhY2hlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gYXdhaXQgdGhpcy5fc3RhcnQoKTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5fc3RhcnREaXJlY3RseSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhd2FpdCBhZnRlclN0YXJ0REIodGhpcy5hc3NldERCSW5mbyk7XHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IHRydWU7XHJcbiAgICAgICAgbmV3Q29uc29sZS50cmFja1RpbWVFbmQoJ2Fzc2V0LWRiOnN0YXJ0LWRhdGFiYXNlJywgeyBvdXRwdXQ6IHRydWUgfSk7XHJcbiAgICAgICAgLy8g5oCn6IO95rWL6K+VOiDotYTmupDlhrflr7zlhaVcclxuICAgICAgICBuZXdDb25zb2xlLnRyYWNrVGltZUVuZCgnYXNzZXQtZGI6cmVhZHknLCB7IG91dHB1dDogdHJ1ZSB9KTtcclxuICAgICAgICB0aGlzLmVtaXQoJ2Fzc2V0czpyZWFkeScpO1xyXG4gICAgICAgIC8vIFRPRE8g5LiN5piv5bi46am75qih5byP77yM5YiZ5peg6ZyA5byA5ZCv77yM5ZCv5Yqo5oiQ5Yqf5ZCO77yM5byA5aeL5Yqg6L295bCa5pyq5rOo5YaM55qE6LWE5rqQ5aSE55CG5ZmoXHJcbiAgICAgICAgLy8gdGhpcy5hc3NldEhhbmRsZXJNYW5hZ2VyLmFjdGl2YXRlUmVnaXN0ZXJBbGwoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGVwKCk7XHJcbiAgICAgICAgLy8gVE9ETyDlkK/liqjmiJDlip/lkI7lvIDlp4vlho3ljrvlgZrkuIDkupvml6Xlv5fnvJPlrZjmuIXnkIZcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmmluasoeWQr+WKqOaVsOaNruW6k1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFzeW5jIF9zdGFydCgpIHtcclxuICAgICAgICBuZXdDb25zb2xlLnRyYWNrTWVtb3J5U3RhcnQoJ2Fzc2V0czp3b3JrZXItaW5pdDogcHJlU3RhcnQnKTtcclxuICAgICAgICBjb25zdCBhc3NldERCTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLmFzc2V0REJJbmZvKS5zb3J0KChhLCBiKSA9PiAoQXNzZXREQlByaW9yaXR5W2JdIHx8IDApIC0gKEFzc2V0REJQcmlvcml0eVthXSB8fCAwKSk7XHJcbiAgICAgICAgY29uc3Qgc3RhcnR1cERhdGFiYXNlUXVldWU6IElTdGFydHVwRGF0YWJhc2VIYW5kbGVJbmZvW10gPSBbXTtcclxuICAgICAgICBmb3IgKGNvbnN0IGFzc2V0REJOYW1lIG9mIGFzc2V0REJOYW1lcykge1xyXG4gICAgICAgICAgICBjb25zdCBkYiA9IGF3YWl0IHRoaXMuX2NyZWF0ZURCKHRoaXMuYXNzZXREQkluZm9bYXNzZXREQk5hbWVdKTtcclxuICAgICAgICAgICAgY29uc3Qgd2FpdGluZ1N0YXJ0dXBEQkluZm8gPSBhd2FpdCB0aGlzLl9wcmVTdGFydERCKGRiKTtcclxuICAgICAgICAgICAgc3RhcnR1cERhdGFiYXNlUXVldWUucHVzaCh3YWl0aW5nU3RhcnR1cERCSW5mbyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5ld0NvbnNvbGUudHJhY2tNZW1vcnlFbmQoJ2Fzc2V0LWRiOndvcmtlci1pbml0OiBwcmVTdGFydCcpO1xyXG5cclxuICAgICAgICBuZXdDb25zb2xlLnRyYWNrTWVtb3J5U3RhcnQoJ2Fzc2V0czp3b3JrZXItaW5pdDogc3RhcnR1cCcpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RhcnR1cERhdGFiYXNlUXVldWUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhcnR1cERhdGFiYXNlID0gc3RhcnR1cERhdGFiYXNlUXVldWVbaV07XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX3N0YXJ0dXBEQihzdGFydHVwRGF0YWJhc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBuZXdDb25zb2xlLnRyYWNrTWVtb3J5RW5kKCdhc3NldC1kYjp3b3JrZXItaW5pdDogc3RhcnR1cCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog55u05o6l5ZCv5Yqo5pWw5o2u5bqTXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgX3N0YXJ0RGlyZWN0bHkoKSB7XHJcbiAgICAgICAgY29uc3QgYXNzZXREQk5hbWVzID0gT2JqZWN0LmtleXModGhpcy5hc3NldERCSW5mbykuc29ydCgoYSwgYikgPT4gKEFzc2V0REJQcmlvcml0eVtiXSB8fCAwKSAtIChBc3NldERCUHJpb3JpdHlbYV0gfHwgMCkpO1xyXG4gICAgICAgIGZvciAoY29uc3QgYXNzZXREQk5hbWUgb2YgYXNzZXREQk5hbWVzKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc3RhcnREQih0aGlzLmFzc2V0REJJbmZvW2Fzc2V0REJOYW1lXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LuO57yT5a2Y5ZCv5Yqo5pWw5o2u5bqT77yM5aaC5p6c5oGi5aSN5aSx6LSl5Lya5Zue6YCA5Yiw5Y6f5aeL55qE5ZCv5Yqo5rWB56iLXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgX3N0YXJ0RnJvbUNhY2hlKCkge1xyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ3RyeSBzdGFydCBhbGwgYXNzZXREQiBmcm9tIGNhY2hlLi4uJyk7XHJcbiAgICAgICAgY29uc3QgYXNzZXREQk5hbWVzID0gT2JqZWN0LmtleXModGhpcy5hc3NldERCSW5mbykuc29ydCgoYSwgYikgPT4gKEFzc2V0REJQcmlvcml0eVtiXSB8fCAwKSAtIChBc3NldERCUHJpb3JpdHlbYV0gfHwgMCkpO1xyXG4gICAgICAgIGZvciAoY29uc3QgYXNzZXREQk5hbWUgb2YgYXNzZXREQk5hbWVzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRiID0gYXdhaXQgdGhpcy5fY3JlYXRlREIodGhpcy5hc3NldERCSW5mb1thc3NldERCTmFtZV0pO1xyXG4gICAgICAgICAgICBpZiAoZXhpc3RzU3luYyhkYi5jYWNoZVBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGRiLnN0YXJ0V2l0aENhY2hlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hc3NldERCSW5mb1thc3NldERCTmFtZV0uc3RhdGUgPSAnc3RhcnR1cCc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdkYi1zdGFydGVkJywgZGIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYHN0YXJ0IGRiICR7YXNzZXREQk5hbWV9IHdpdGggY2FjaGUgc3VjY2Vzc2ApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnYXNzZXRzOmRiLXJlYWR5JywgYXNzZXREQk5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHN0YXJ0IGRiICR7YXNzZXREQk5hbWV9IHdpdGggY2FjaGUgZmFpbGVkLCB0cnkgdG8gc3RhcnQgZGIgJHthc3NldERCTmFtZX0gd2l0aG91dCBjYWNoZWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDmsqHmnInmraPluLjotbDlroznvJPlrZjmgaLlpI3vvIzotbDmma7pgJrnmoTlkK/liqjmtYHnqItcclxuICAgICAgICAgICAgY29uc3Qgd2FpdGluZ1N0YXJ0dXBEQkluZm8gPSBhd2FpdCB0aGlzLl9wcmVTdGFydERCKGRiKTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5fc3RhcnR1cERCKHdhaXRpbmdTdGFydHVwREJJbmZvKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGlzQnVzeSgpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gdGhpcy5hc3NldERCTWFwKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5hc3NldERCTWFwW25hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBkYiA9IHRoaXMuYXNzZXREQk1hcFtuYW1lXTtcclxuICAgICAgICAgICAgaWYgKGRiLmFzc2V0UHJvZ3Jlc3NJbmZvLndhaXQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhhc0RCKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuYXNzZXREQk1hcFtuYW1lXTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIHN0YXJ0REIoaW5mbzogSUFzc2V0REJJbmZvKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGFzREIoaW5mby5uYW1lKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IHRoaXMuX2NyZWF0ZURCKGluZm8pO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuX3N0YXJ0REIoaW5mby5uYW1lKTtcclxuICAgICAgICB0aGlzLmVtaXQoJ2Fzc2V0czpkYi1yZWFkeScsIGluZm8ubmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlsIbkuIDkuKrnu53lr7not6/lvoTvvIzovazmiJAgdXJsIOWcsOWdgFxyXG4gICAgICogQHBhcmFtIHBhdGhcclxuICAgICAqIEBwYXJhbSBkYk5hbWUg5Y+v6YCJXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBwYXRoMnVybChwYXRoOiBzdHJpbmcsIGRiTmFtZT86IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgLy8g5ZCm5YiZ5Lya5Ye6546w6L+U5ZueICdkYjovL2ludGVybmFsLy4uLy4uLy4uLy4uLy4uL2RiOi9pbnRlcm5hbCcg55qE5oOF5Ya1XHJcbiAgICAgICAgaWYgKHBhdGggPT09IGBkYjovLyR7ZGJOYW1lfWApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBkYXRhYmFzZTtcclxuICAgICAgICBpZiAoIWRiTmFtZSkge1xyXG4gICAgICAgICAgICBkYXRhYmFzZSA9IE9iamVjdC52YWx1ZXMoYXNzZXREQk1hbmFnZXIuYXNzZXREQk1hcCkuZmluZCgoZGIpID0+IFV0aWxzLlBhdGguY29udGFpbnMoZGIub3B0aW9ucy50YXJnZXQsIHBhdGgpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkYXRhYmFzZSA9IGFzc2V0REJNYW5hZ2VyLmFzc2V0REJNYXBbZGJOYW1lXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFkYXRhYmFzZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDYW4gbm90IGZpbmQgYXNzZXQgZGIgd2l0aCBhc3NldCBwYXRoOiAke3BhdGh9YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5bCGIHdpbmRvd3Mg5LiK55qEIFxcIOi9rOaIkCAv77yM57uf5LiA5oiQIHVybCDmoLzlvI9cclxuICAgICAgICBsZXQgX3BhdGggPSByZWxhdGl2ZShkYXRhYmFzZS5vcHRpb25zLnRhcmdldCwgcGF0aCk7XHJcbiAgICAgICAgX3BhdGggPSBfcGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XHJcblxyXG4gICAgICAgIHJldHVybiBgZGI6Ly8ke2RhdGFiYXNlLm9wdGlvbnMubmFtZX0vJHtfcGF0aH1gO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2NyZWF0ZURCKGluZm86IElBc3NldERCSW5mbykge1xyXG4gICAgICAgIGVuc3VyZURpclN5bmMoaW5mby5saWJyYXJ5KTtcclxuICAgICAgICBlbnN1cmVEaXJTeW5jKGluZm8udGVtcCk7XHJcbiAgICAgICAgLy8gVE9ETyDnm67moIfmlbDmja7lupPlnLDlnYDkuLrnqbrnmoTml7blgJnvvIzlhbblrp7ml6DpnIDotbDlkI7nu63lrozmlbTnmoTlkK/liqjmtYHnqIvvvIzlj6/ku6XogIPomZHkvJjljJZcclxuICAgICAgICBlbnN1cmVEaXJTeW5jKGluZm8udGFyZ2V0KTtcclxuICAgICAgICBpbmZvLmZsYWdzID0ge1xyXG4gICAgICAgICAgICByZWltcG9ydENoZWNrOiB0aGlzLnJlaW1wb3J0Q2hlY2ssXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBkYiA9IGFzc2V0ZGIuY3JlYXRlKGluZm8pO1xyXG4gICAgICAgIHRoaXMuYXNzZXREQk1hcFtpbmZvLm5hbWVdID0gZGI7XHJcbiAgICAgICAgZGIuaW1wb3J0ZXJNYW5hZ2VyLmZpbmQgPSBhc3luYyAoYXNzZXQ6IElBc3NldCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbXBvcnRlciA9IGF3YWl0IHRoaXMuYXNzZXRIYW5kbGVyTWFuYWdlci5maW5kSW1wb3J0ZXIoYXNzZXQsIHRydWUpO1xyXG4gICAgICAgICAgICBpZiAoaW1wb3J0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbXBvcnRlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBuZXdJbXBvcnRlciA9IGF3YWl0IHRoaXMuYXNzZXRIYW5kbGVyTWFuYWdlci5nZXREZWZhdWx0SW1wb3J0ZXIoYXNzZXQpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3SW1wb3J0ZXIgfHwgaW1wb3J0ZXI7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmVtaXQoJ2RiLWNyZWF0ZWQnLCBkYik7XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgY3JlYXRlIGRiICR7aW5mby5uYW1lfSBzdWNjZXNzIGluICR7aW5mby5saWJyYXJ5fWApO1xyXG5cclxuICAgICAgICAgLy8g5Yid5aeL5YyW5LiA5Lqb6ISa5pys6ZyA6KaB55qE5pWw5o2u5bqT5L+h5oGvXHJcbiAgICAgICAgIHNjcmlwdGluZy51cGRhdGVEYXRhYmFzZXMoe2RiSUQ6IGluZm8ubmFtZSwgdGFyZ2V0OiBpbmZvLnRhcmdldH0sIERCQ2hhbmdlVHlwZS5hZGQpO1xyXG4gICAgICAgIHJldHVybiBkYjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmihOWQr+WKqCBkYiwg6ZyA6KaB5LiOIF9zdGFydHVwREIg5pCt6YWN5L2/55So77yM6K+35Yu/5Y2V54us6LCD55SoXHJcbiAgICAgKiBAcGFyYW0gZGIgXHJcbiAgICAgKiBAcmV0dXJucyBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBfcHJlU3RhcnREQihkYjogYXNzZXRkYi5Bc3NldERCKSB7XHJcbiAgICAgICAgY29uc3QgaG9va3M6IFJlY29yZDxzdHJpbmcsIEZ1bmN0aW9uPiA9IHtcclxuICAgICAgICAgICAgYWZ0ZXJTY2FuLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy8gSEFDSyDnm67liY3lm6DkuLrkuIDkupvnibnmrornmoTlr7zlhaXpnIDmsYLvvIzlsIYgZGIg5ZCv5Yqo5rWB56iL5by65Yi25YiG5oiQ5LqG5Lik5qyhXHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlPElTdGFydHVwRGF0YWJhc2VIYW5kbGVJbmZvPihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZUluZm86IElTdGFydHVwRGF0YWJhc2VIYW5kbGVJbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogZGIub3B0aW9ucy5uYW1lLFxyXG4gICAgICAgICAgICAgICAgYWZ0ZXJQcmVJbXBvcnRSZXNvbHZlOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgU3RhcnQgZGF0YWJhc2UgJHtkYi5vcHRpb25zLm5hbWV9IGZhaWxlZCFgKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDpmLLmraLmhI/lpJbmg4XlhrXkuIvvvIzotYTmupDov5vnqIvljaHmrbvml6Dku7vkvZXkv6Hmga9cclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVJbmZvLmZpbmlzaCAmJiBoYW5kbGVJbmZvLmZpbmlzaCgpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgLy8gSEFDSyAxLzMg5ZCv5Yqo5pWw5o2u5bqT5pe277yM5LiN5a+85YWl5YWo6YOo6LWE5rqQ77yM5YWI5oqK6aKE5a+85YWl6LWE5rqQ5a+85YWl5a6M5oiQ5ZCO6L+b5YWl562J5b6F54q25oCBXHJcbiAgICAgICAgICAgIGhvb2tzLmFmdGVyUHJlSW1wb3J0ID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgYWZ0ZXJQcmVJbXBvcnQoZGIpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgUHJlSW1wb3J0IGRiICR7ZGIub3B0aW9ucy5uYW1lfSBzdWNjZXNzYCk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGhhbmRsZUluZm8pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlSW5mby5hZnRlclByZUltcG9ydFJlc29sdmUgPSByZXNvbHZlO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGhvb2tzLmFmdGVyU3RhcnQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVJbmZvLmZpbmlzaCAmJiBoYW5kbGVJbmZvLmZpbmlzaCgpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBkYi5zdGFydCh7XHJcbiAgICAgICAgICAgICAgICBob29rcyxcclxuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5hc3NldERCSW5mb1tkYi5vcHRpb25zLm5hbWVdLnN0YXRlID0gJ3N0YXJ0JztcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWujOWFqOWQr+WKqOS5i+WJjemihOWQr+WKqOeahCBkYiDvvIzor7fli7/ljZXni6zosIPnlKhcclxuICAgICAqIEBwYXJhbSBzdGFydHVwRGF0YWJhc2UgXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgX3N0YXJ0dXBEQihzdGFydHVwRGF0YWJhc2U6IElTdGFydHVwRGF0YWJhc2VIYW5kbGVJbmZvKSB7XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgU3RhcnQgdXAgdGhlICcke3N0YXJ0dXBEYXRhYmFzZS5uYW1lfScgZGF0YWJhc2UuLi5gKTtcclxuICAgICAgICBuZXdDb25zb2xlLnRyYWNrVGltZVN0YXJ0KGBhc3NldC1kYjogc3RhcnR1cCAnJHtzdGFydHVwRGF0YWJhc2UubmFtZX0nIGRhdGFiYXNlLi4uYCk7XHJcbiAgICAgICAgLy8gMi8zIOe7k+adnyBhZnRlclByZUltcG9ydCDpooTnlZnnmoTnrYnlvoXnirbmgIHvvIzmraPluLjov5vlhaXotYTmupDnmoTlr7zlhaXmtYHnqIss5qCH6K6wIGZpbmlzaCDkvZzkuLrnu5PmnZ/liKTmlq1cclxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBzdGFydHVwRGF0YWJhc2UuZmluaXNoID0gcmVzb2x2ZTtcclxuICAgICAgICAgICAgc3RhcnR1cERhdGFiYXNlLmFmdGVyUHJlSW1wb3J0UmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG5ld0NvbnNvbGUudHJhY2tUaW1lRW5kKGBhc3NldC1kYjp3b3JrZXItc3RhcnR1cC1kYXRhYmFzZVske3N0YXJ0dXBEYXRhYmFzZS5uYW1lfV1gLCB7IG91dHB1dDogdHJ1ZSB9KTtcclxuICAgICAgICBuZXdDb25zb2xlLnRyYWNrTWVtb3J5RW5kKGBhc3NldC1kYjp3b3JrZXItc3RhcnR1cC1kYXRhYmFzZVske3N0YXJ0dXBEYXRhYmFzZS5uYW1lfV1gKTtcclxuXHJcbiAgICAgICAgdGhpcy5hc3NldERCSW5mb1tzdGFydHVwRGF0YWJhc2UubmFtZV0uc3RhdGUgPSAnc3RhcnR1cCc7XHJcbiAgICAgICAgY29uc3QgZGIgPSB0aGlzLmFzc2V0REJNYXBbc3RhcnR1cERhdGFiYXNlLm5hbWVdO1xyXG4gICAgICAgIHRoaXMuZW1pdCgnZGItc3RhcnRlZCcsIGRiKTtcclxuICAgICAgICBuZXdDb25zb2xlLnRyYWNrVGltZUVuZChgYXNzZXQtZGI6IHN0YXJ0dXAgJyR7c3RhcnR1cERhdGFiYXNlLm5hbWV9JyBkYXRhYmFzZS4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5ZCv5Yqo5p+Q5Liq5oyH5a6a5pWw5o2u5bqTXHJcbiAgICAgKiBAcGFyYW0gbmFtZSBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIF9zdGFydERCKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IGRiID0gdGhpcy5hc3NldERCTWFwW25hbWVdO1xyXG4gICAgICAgIG5ld0NvbnNvbGUudHJhY2tUaW1lU3RhcnQoYGFzc2V0LWRiOndvcmtlci1zdGFydHVwLWRhdGFiYXNlWyR7ZGIub3B0aW9ucy5uYW1lfV1gKTtcclxuICAgICAgICBuZXdDb25zb2xlLnRyYWNrTWVtb3J5U3RhcnQoYGFzc2V0LWRiOndvcmtlci1zdGFydHVwLWRhdGFiYXNlWyR7ZGIub3B0aW9ucy5uYW1lfV1gKTtcclxuICAgICAgICB0aGlzLmFzc2V0REJJbmZvW25hbWVdLnN0YXRlID0gJ3N0YXJ0JztcclxuXHJcbiAgICAgICAgY29uc3QgcHJlSW1wb3J0ZXJIYW5kbGVyID0gZ2V0UHJlSW1wb3J0ZXJIYW5kbGVyKHRoaXMuYXNzZXREQkluZm9bbmFtZV0ucHJlSW1wb3J0RXh0TGlzdCk7XHJcbiAgICAgICAgaWYgKHByZUltcG9ydGVySGFuZGxlcikge1xyXG4gICAgICAgICAgICBkYi5wcmVJbXBvcnRlckhhbmRsZXIgPSBwcmVJbXBvcnRlckhhbmRsZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGhvb2tzOiBSZWNvcmQ8c3RyaW5nLCBGdW5jdGlvbj4gPSB7XHJcbiAgICAgICAgICAgIGFmdGVyU2NhbixcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBob29rcy5hZnRlclByZUltcG9ydCA9IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgYXdhaXQgYWZ0ZXJQcmVJbXBvcnQoZGIpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc29sZS5kZWJ1Zyhgc3RhcnQgYXNzZXQtZGIoJHtuYW1lfSkuLi5gKTtcclxuICAgICAgICBhd2FpdCBkYi5zdGFydCh7XHJcbiAgICAgICAgICAgIGhvb2tzLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYXNzZXREQkluZm9bbmFtZV0uc3RhdGUgPSAnc3RhcnR1cCc7XHJcbiAgICAgICAgdGhpcy5lbWl0KCdkYi1zdGFydGVkJywgZGIpO1xyXG4gICAgICAgIG5ld0NvbnNvbGUudHJhY2tUaW1lRW5kKGBhc3NldC1kYjp3b3JrZXItc3RhcnR1cC1kYXRhYmFzZVske2RiLm9wdGlvbnMubmFtZX1dYCwgeyBvdXRwdXQ6IHRydWUgfSk7XHJcbiAgICAgICAgbmV3Q29uc29sZS50cmFja01lbW9yeUVuZChgYXNzZXQtZGI6d29ya2VyLXN0YXJ0dXAtZGF0YWJhc2VbJHtkYi5vcHRpb25zLm5hbWV9XWApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOafkOS4qiBhc3NldCBkYlxyXG4gICAgICovXHJcbiAgICBhc3luYyBhZGREQihpbmZvOiBBc3NldERCUmVnaXN0ZXJJbmZvKSB7XHJcbiAgICAgICAgdGhpcy5hc3NldERCSW5mb1tpbmZvLm5hbWVdID0gcGF0Y2hBc3NldERCSW5mbyhpbmZvKTtcclxuICAgICAgICBhd2FpdCB0aGlzLnN0YXJ0REIodGhpcy5hc3NldERCSW5mb1tpbmZvLm5hbWVdKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOenu+mZpOafkOS4qiBhc3NldC1kYlxyXG4gICAgICogQHBhcmFtIG5hbWUgXHJcbiAgICAgKiBAcmV0dXJucyBcclxuICAgICAqL1xyXG4gICAgYXN5bmMgcmVtb3ZlREIobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNQYXVzZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhpMThuLnQoJ2Fzc2V0cy5hc3NldF9kX2JfcGF1c2VfdGlwcycsXHJcbiAgICAgICAgICAgICAgICB7IG9wZXJhdGU6ICdyZW1vdmVEQicgfVxyXG4gICAgICAgICAgICApKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tUb1F1ZXVlKHtcclxuICAgICAgICAgICAgICAgICAgICBmdW5jOiB0aGlzLl9yZW1vdmVEQi5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtuYW1lXSxcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fcmVtb3ZlREIobmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfb3BlcmF0ZShuYW1lOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgICAgY29uc3QgdGFza0lkID0gbmFtZSArIERhdGUubm93KCk7XHJcbiAgICAgICAgaWYgKG5hbWUuZW5kc1dpdGgoJ0Fzc2V0JykpIHtcclxuICAgICAgICAgICAgdGhpcy5hc3NldEJ1c3lUYXNrLmFkZCh0YXNrSWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXNbbmFtZV0oLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMuYXNzZXRCdXN5VGFzay5kZWxldGUodGFza0lkKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcztcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke25hbWV9IGZhaWxlZCB3aXRoIGFyZ3M6ICR7YXJncy50b1N0cmluZygpfWApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgdGhpcy5hc3NldEJ1c3lUYXNrLmRlbGV0ZSh0YXNrSWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9yZW1vdmVEQihuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBkYiA9IHRoaXMuYXNzZXREQk1hcFtuYW1lXTtcclxuICAgICAgICBpZiAoIWRiKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgZGIuc3RvcCgpO1xyXG4gICAgICAgIHRoaXMuZW1pdCgnZGItcmVtb3ZlZCcsIGRiKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5hc3NldERCTWFwW25hbWVdO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLmFzc2V0REJJbmZvW25hbWVdO1xyXG4gICAgICAgIHRoaXMuZW1pdCgnYXNzZXRzOmRiLWNsb3NlJywgbmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliLfmlrDmiYDmnInmlbDmja7lupNcclxuICAgICAqIEByZXR1cm5zIFxyXG4gICAgICovXHJcbiAgICBhc3luYyByZWZyZXNoKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5yZWFkeSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlICE9PSAnZnJlZScgfHwgdGhpcy5pc1BhdXNlIHx8IHRoaXMuYXNzZXRCdXN5KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzUGF1c2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGkxOG4udCgnYXNzZXRzLmFzc2V0X2RfYl9wYXVzZV90aXBzJyxcclxuICAgICAgICAgICAgICAgICAgICB7IG9wZXJhdGU6ICdyZWZyZXNoJyB9XHJcbiAgICAgICAgICAgICAgICApKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGFza1RvUXVldWUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmM6IHRoaXMuX3JlZnJlc2guYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fcmVmcmVzaCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX3JlZnJlc2goKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdidXN5JztcclxuICAgICAgICBuZXdDb25zb2xlLnRyYWNrVGltZVN0YXJ0KCdhc3NldHM6cmVmcmVzaC1hbGwtZGF0YWJhc2UnKTtcclxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gdGhpcy5hc3NldERCTWFwKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5hc3NldERCTWFwW25hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBHZXQgYXNzZXREQiAke25hbWV9IGZvcm0gbWFuYWdlciBmYWlsZWQhYCk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBkYiA9IHRoaXMuYXNzZXREQk1hcFtuYW1lXTtcclxuICAgICAgICAgICAgYXdhaXQgZGIucmVmcmVzaChkYi5vcHRpb25zLnRhcmdldCwge1xyXG4gICAgICAgICAgICAgICAgaWdub3JlU2VsZjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIC8vIOWPquaciSBhc3NldHMg6LWE5rqQ5bqT5YGaIGVmZmVjdCDnvJbor5HlpITnkIZcclxuICAgICAgICAgICAgICAgIGhvb2tzOiBuYW1lID09PSAnYXNzZXRzJyA/IHtcclxuICAgICAgICAgICAgICAgICAgICBhZnRlclByZUltcG9ydDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBhZnRlclByZUltcG9ydChkYik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH0gOiB7fSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYHJlZnJlc2ggZGIgJHtuYW1lfSBzdWNjZXNzYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5ld0NvbnNvbGUudHJhY2tUaW1lRW5kKCdhc3NldC1kYjpyZWZyZXNoLWFsbC1kYXRhYmFzZScsIHsgb3V0cHV0OiB0cnVlIH0pO1xyXG4gICAgICAgIHRoaXMuZW1pdCgnYXNzZXRzOnJlZnJlc2gtZmluaXNoJyk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdmcmVlJztcclxuICAgICAgICB0aGlzLnN0ZXAoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaHkuWIt+aWsOi1hOa6kO+8jOivt+WLv+S9v+eUqO+8jOebruWJjeeahOmAu+i+keaYr+mSiOWvuemHjeWIt+aWh+S7tuWkueWumuWItueahFxyXG4gICAgICogQHBhcmFtIGZpbGUgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBhdXRvUmVmcmVzaEFzc2V0TGF6eShwYXRoT3JVcmxPclVVSUQ6IHN0cmluZykge1xyXG4gICAgICAgIGlmICghdGhpcy53YWl0aW5nUmVmcmVzaEFzc2V0LmluY2x1ZGVzKHBhdGhPclVybE9yVVVJRCkpIHtcclxuICAgICAgICAgICAgdGhpcy53YWl0aW5nUmVmcmVzaEFzc2V0LnB1c2gocGF0aE9yVXJsT3JVVUlEKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b1JlZnJlc2hUaW1lciAmJiBjbGVhclRpbWVvdXQodGhpcy5hdXRvUmVmcmVzaFRpbWVyKTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wZW5kaW5nQXV0b1JlZnJlc2hSZXNvbHZlcy5wdXNoKHJlc29sdmUpO1xyXG4gICAgICAgICAgICB0aGlzLmF1dG9SZWZyZXNoVGltZXIgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhc2tJZCA9ICdhdXRvUmVmcmVzaEFzc2V0TGF6eScgKyBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hc3NldEJ1c3lUYXNrLmFkZCh0YXNrSWQpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMud2FpdGluZ1JlZnJlc2hBc3NldCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53YWl0aW5nUmVmcmVzaEFzc2V0Lmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChmaWxlcy5tYXAoKGZpbGU6IHN0cmluZykgPT4gYXNzZXRkYi5yZWZyZXNoKGZpbGUpKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2V0QnVzeVRhc2suZGVsZXRlKHRhc2tJZCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0ZXAoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGVuZGluZ0F1dG9SZWZyZXNoUmVzb2x2ZXMuZm9yRWFjaCgocmVzb2x2ZSkgPT4gcmVzb2x2ZSh0cnVlKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBlbmRpbmdBdXRvUmVmcmVzaFJlc29sdmVzLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmgaLlpI3ooqvmmoLlgZznmoTmlbDmja7lupNcclxuICAgICAqIEByZXR1cm5zIFxyXG4gICAgICovXHJcbiAgICBhc3luYyByZXN1bWUoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhhc1BhdXNlICYmICF0aGlzLnN0YXJ0UGF1c2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaGFzUGF1c2UgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnN0YXJ0UGF1c2UgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmVtaXQoJ2Fzc2V0czpyZXN1bWUnKTtcclxuICAgICAgICBhd2FpdCB0aGlzLnN0ZXAoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBhZGRUYXNrKGZ1bmM6IEZ1bmN0aW9uLCBhcmdzOiBhbnlbXSk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNQYXVzZSB8fCB0aGlzLnN0YXRlID09PSAnYnVzeScpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coaTE4bi50KCdhc3NldHMuYXNzZXRfZF9iX3BhdXNlX3RpcHMnLFxyXG4gICAgICAgICAgICAgICAgeyBvcGVyYXRlOiBmdW5jLm5hbWUgfVxyXG4gICAgICAgICAgICApKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tUb1F1ZXVlKHtcclxuICAgICAgICAgICAgICAgICAgICBmdW5jLFxyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3MsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSxcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhd2FpdCBmdW5jKC4uLmFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2FkZFRhc2tUb1F1ZXVlKHRhc2s6IElXYWl0aW5nVGFzaykge1xyXG4gICAgICAgIGNvbnN0IGxhc3QgPSB0aGlzLndhaXRpbmdUYXNrUXVldWVbdGhpcy53YWl0aW5nVGFza1F1ZXVlLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIGNvbnN0IGN1clRhc2s6IElXYWl0aW5nVGFza0luZm8gPSB7XHJcbiAgICAgICAgICAgIGZ1bmM6IHRhc2suZnVuYyxcclxuICAgICAgICAgICAgYXJnczogdGFzay5hcmdzLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHRhc2sucmVzb2x2ZSAmJiB0YXNrLnJlamVjdCkge1xyXG4gICAgICAgICAgICBjdXJUYXNrLnJlc29sdmVzID0gW3Rhc2sucmVzb2x2ZV07XHJcbiAgICAgICAgICAgIGN1clRhc2sucmVqZWN0cyA9IFt0YXNrLnJlamVjdF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghbGFzdCkge1xyXG4gICAgICAgICAgICB0aGlzLndhaXRpbmdUYXNrUXVldWUucHVzaChjdXJUYXNrKTtcclxuICAgICAgICAgICAgdGhpcy5zdGVwKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOS4jeS4gOagt+eahOS7u+WKoea3u+WKoOi/m+mYn+WIl1xyXG4gICAgICAgIGlmIChsYXN0LmZ1bmMubmFtZSAhPT0gY3VyVGFzay5mdW5jLm5hbWUgfHwgY3VyVGFzay5hcmdzLnRvU3RyaW5nKCkgIT09IGxhc3QuYXJncy50b1N0cmluZygpKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2FpdGluZ1Rhc2tRdWV1ZS5wdXNoKGN1clRhc2spO1xyXG4gICAgICAgICAgICB0aGlzLnN0ZXAoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDlsIbkuIDmoLfnmoTku7vliqHlkIjlubZcclxuICAgICAgICBpZiAoIXRhc2sucmVzb2x2ZSB8fCAhdGFzay5yZWplY3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxhc3QucmVzb2x2ZXMgJiYgbGFzdC5yZWplY3RzKSB7XHJcbiAgICAgICAgICAgIGxhc3QucmVzb2x2ZXMucHVzaCh0YXNrLnJlc29sdmUpO1xyXG4gICAgICAgICAgICBsYXN0LnJlamVjdHMucHVzaCh0YXNrLnJlamVjdCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGFzdC5yZXNvbHZlcyA9IGN1clRhc2sucmVzb2x2ZXM7XHJcbiAgICAgICAgICAgIGxhc3QucmVqZWN0cyA9IGN1clRhc2sucmVqZWN0cztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zdGVwKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgc3RlcCgpIHtcclxuICAgICAgICAvLyDlrZjlnKjnrYnlvoXnmoQgaGFuZGxlIOWFiOWkhOeQhuWbnuiwg1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXJ0UGF1c2UgJiYgdGhpcy53YWl0UGF1c2VIYW5kbGUpIHtcclxuICAgICAgICAgICAgdGhpcy53YWl0UGF1c2VIYW5kbGUodHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMud2FpdFBhdXNlSGFuZGxlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBkYiDmmoLlgZzml7bvvIzkuI3lpITnkIbnrYnlvoXku7vliqFcclxuICAgICAgICBpZiAodGhpcy5pc1BhdXNlIHx8ICF0aGlzLndhaXRpbmdUYXNrUXVldWUubGVuZ3RoIHx8IHRoaXMuc3RhdGUgPT09ICdidXN5Jykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOa3seaLt+i0neS7pemBv+WFjeWcqOWkhOeQhueahOi/h+eoi+S4reaMgee7reaUtuWIsOS7u+WKoVxyXG4gICAgICAgIGxldCB3YWl0aW5nVGFza1F1ZXVlID0gQXJyYXkuZnJvbSh0aGlzLndhaXRpbmdUYXNrUXVldWUpO1xyXG4gICAgICAgIGNvbnN0IGxhc3RXYWl0aW5nUXVldWU6IElXYWl0aW5nVGFza0luZm9bXSA9IFtdO1xyXG4gICAgICAgIC8vIOW9k+WQjOaXtuaciei1hOa6kOaTjeS9nOS4juaVtOS9k+eahOajgOafpeWIt+aWsOS7u+WKoeaXtu+8jOS8mOWFiOaJp+ihjOi1hOa6kOaTjeS9nOS7u+WKoVxyXG4gICAgICAgIHdhaXRpbmdUYXNrUXVldWUgPSB3YWl0aW5nVGFza1F1ZXVlLmZpbHRlcigodGFzaykgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuYXNzZXRCdXN5IHx8ICh0aGlzLmFzc2V0QnVzeSAmJiB0YXNrLmZ1bmMubmFtZSAhPT0gJ19yZWZyZXNoJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxhc3RXYWl0aW5nUXVldWUucHVzaCh0YXNrKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMud2FpdGluZ1Rhc2tRdWV1ZSA9IGxhc3RXYWl0aW5nUXVldWU7XHJcbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHdhaXRpbmdUYXNrUXVldWUubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhc2sgPSB3YWl0aW5nVGFza1F1ZXVlW2luZGV4XTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGlmICh0YXNrLmZ1bmMubmFtZSA9PT0gJ19yZWZyZXNoJyAmJiB0aGlzLmFzc2V0QnVzeSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOayoeacieaJp+ihjOeahOS7u+WKoeWhnuWbnumYn+WIl1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2FpdGluZ1Rhc2tRdWV1ZS5wdXNoKHRhc2spO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgdGFzay5mdW5jKC4uLnRhc2suYXJncyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRhc2sucmVzb2x2ZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0YXNrLnJlc29sdmVzLmZvckVhY2goKHJlc29sdmUpID0+IHJlc29sdmUocmVzKSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhc2sucmVqZWN0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2sucmVqZWN0cy5mb3JFYWNoKChyZWplY3QpID0+IHJlamVjdChlcnJvcikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDlvZPliY0gc3RlcCDnmoTlpITnkIbku7vliqHlrozmiJDljbPlj6/nu5PmnZ/vvIzliankvZnku7vliqHkvJrlnKjkuIvkuIDmrKEgc3RlcCDkuK3lpITnkIZcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaaguWBnOaVsOaNruW6k1xyXG4gICAgICogQHBhcmFtIHNvdXJjZSDmnaXmupDmoIfor4ZcclxuICAgICAqIEByZXR1cm5zIFxyXG4gICAgICovXHJcbiAgICBhc3luYyBwYXVzZShzb3VyY2UgPSAndW5rb3duJykge1xyXG4gICAgICAgIHRoaXMuc3RhcnRQYXVzZSA9IHRydWU7XHJcbiAgICAgICAgLy8g5Y+q6KaB5b2T5YmN5bqV5bGC5rKh5pyJ5q2j5Zyo5aSE55CG55qE6LWE5rqQ6YO96KeG5Li66LWE5rqQ6L+b5YWl5Y+v5pqC5YGc54q25oCBXHJcbiAgICAgICAgaWYgKCF0aGlzLmlzQnVzeSgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFzUGF1c2UgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Fzc2V0czpwYXVzZScsIHNvdXJjZSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBBc3NldCBEQiBpcyBwYXVzZWQgd2l0aCAke3NvdXJjZX0hYCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuaGFzUGF1c2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2FpdFBhdXNlUHJvbWlzZVRhc2s7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMud2FpdFBhdXNlUHJvbWlzZVRhc2sgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLndhaXRQYXVzZUhhbmRsZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMud2FpdFBhdXNlUHJvbWlzZVRhc2sgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2Fzc2V0czpwYXVzZScsIHNvdXJjZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQXNzZXQgREIgaXMgcGF1c2VkIHdpdGggJHtzb3VyY2V9IWApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oYXNQYXVzZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIDIg5YiG6ZKf55qE6LaF5pe25pe26Ze077yM6LaF6L+H6Ieq5Yqo6L+U5Zue5Zue6LCDXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMud2FpdFBhdXNlUHJvbWlzZVRhc2sgJiYgZGVjaWRlUHJvbWlzZVN0YXRlKHRoaXMud2FpdFBhdXNlUHJvbWlzZVRhc2spLnRoZW4oc3RhdGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlID09PSBQUk9NSVNFX1NUQVRFLlBFTkRJTkcpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhc1BhdXNlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2Fzc2V0czpwYXVzZScsIHNvdXJjZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53YWl0UGF1c2VIYW5kbGUhKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnUGF1c2UgYXNzZXQgZGIgdGltZSBvdXQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSwgMjAwMCAqIDYwKTtcclxuICAgICAgICByZXR1cm4gdGhpcy53YWl0UGF1c2VQcm9taXNlVGFzaztcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgYXNzZXREQk1hbmFnZXIgPSBuZXcgQXNzZXREQk1hbmFnZXIoKTtcclxuZXhwb3J0IGRlZmF1bHQgYXNzZXREQk1hbmFnZXI7XHJcbihnbG9iYWxUaGlzIGFzIGFueSkuYXNzZXREQk1hbmFnZXIgPSBhc3NldERCTWFuYWdlcjtcclxuXHJcbmZ1bmN0aW9uIHBhdGNoQXNzZXREQkluZm8oY29uZmlnOiBBc3NldERCUmVnaXN0ZXJJbmZvKTogSUFzc2V0REJJbmZvIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbmFtZTogY29uZmlnLm5hbWUsXHJcbiAgICAgICAgdGFyZ2V0OiBVdGlscy5QYXRoLm5vcm1hbGl6ZShjb25maWcudGFyZ2V0KSxcclxuICAgICAgICByZWFkb25seTogISFjb25maWcucmVhZG9ubHksXHJcblxyXG4gICAgICAgIHRlbXA6IGNvbmZpZy50ZW1wIHx8IFV0aWxzLlBhdGgubm9ybWFsaXplKGpvaW4oQXNzZXREQk1hbmFnZXIudGVtcFJvb3QsIGNvbmZpZy5uYW1lKSksXHJcbiAgICAgICAgbGlicmFyeTogY29uZmlnLmxpYnJhcnkgfHwgQXNzZXREQk1hbmFnZXIubGlicmFyeVJvb3QsXHJcblxyXG4gICAgICAgIGxldmVsOiA0LFxyXG4gICAgICAgIGdsb2JMaXN0OiBhc3NldENvbmZpZy5kYXRhLmdsb2JMaXN0LFxyXG4gICAgICAgIGlnbm9yZUZpbGVzOiBbXSxcclxuICAgICAgICB2aXNpYmxlOiBjb25maWcudmlzaWJsZSxcclxuICAgICAgICBzdGF0ZTogJ25vbmUnLFxyXG4gICAgICAgIHByZUltcG9ydEV4dExpc3Q6IGNvbmZpZy5wcmVJbXBvcnRFeHRMaXN0IHx8IFtdLFxyXG4gICAgfTtcclxufVxyXG5cclxuLy8gVE9ETyDmjpLpmJ/pmJ/liJflgZrlkIjlubZcclxuLy8gY2xhc3MgQXV0b01lcmdlUXVldWUgZXh0ZW5kcyBBcnJheSB7XHJcbi8vICAgICBhZGQoaXRlbTogSVdhaXRpbmdUYXNrKSB7XHJcbi8vICAgICAgICAgY29uc3QgbGFzdFRhc2sgPSB0aGlzW3RoaXMubGVuZ3RoIC0gMV07XHJcbi8vICAgICAgICAgLy8g6Ieq5Yqo5ZCI5bm25ZKM5LiK5LiA5Liq5Lu75Yqh5LiA5qC355qEXHJcbi8vICAgICAgICAgaWYgKCFsYXN0VGFzayB8fCAhbG9kYXNoLmlzRXF1YWwoe25hbWU6IGl0ZW0ubmFtZSwgYXJnczogaXRlbS5hcmdzfSwge25hbWU6IGxhc3RUYXNrLm5hbWUsIGFyZ3M6IGxhc3RUYXNrLmFyZ3N9KSkge1xyXG4vLyAgICAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGl0ZW0pO1xyXG4vLyAgICAgICAgIH1cclxuLy8gICAgICAgICBpZiAoIWl0ZW0ucmVzb2x2ZSkge1xyXG4vLyAgICAgICAgICAgICByZXR1cm4gdGhpcy5sZW5ndGggLSAxO1xyXG4vLyAgICAgICAgIH1cclxuLy8gICAgICAgICBsYXN0VGFzay5yZXNvbHZlcyA9IGxhc3RUYXNrLnJlc29sdmVzID8gW10gOiBsYXN0VGFzay5yZXNvbHZlcztcclxuLy8gICAgICAgICBsYXN0VGFzay5yZXNvbHZlICYmIGxhc3RUYXNrLnJlc29sdmVzLnB1c2gobGFzdFRhc2sucmVzb2x2ZSk7XHJcbi8vICAgICAgICAgbGFzdFRhc2sucmVzb2x2ZXMucHVzaChpdGVtLnJlc29sdmUpO1xyXG4vLyAgICAgfVxyXG4vLyB9XHJcblxyXG5jb25zdCBsYXllck1hc2s6IG51bWJlcltdID0gW107XHJcbmZvciAobGV0IGkgPSAwOyBpIDw9IDE5OyBpKyspIHtcclxuICAgIGxheWVyTWFza1tpXSA9IDEgPDwgaTtcclxufVxyXG5cclxuY29uc3QgZGVmYXVsdFByZUltcG9ydEV4dExpc3QgPSBbJy50cycsICcuY2h1bmsnLCAnLmVmZmVjdCddO1xyXG5cclxuZnVuY3Rpb24gZ2V0UHJlSW1wb3J0ZXJIYW5kbGVyKHByZUltcG9ydEV4dExpc3Q/OiBzdHJpbmdbXSkge1xyXG4gICAgaWYgKCFwcmVJbXBvcnRFeHRMaXN0IHx8ICFwcmVJbXBvcnRFeHRMaXN0Lmxlbmd0aCkge1xyXG4gICAgICAgIHByZUltcG9ydEV4dExpc3QgPSBkZWZhdWx0UHJlSW1wb3J0RXh0TGlzdDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcHJlSW1wb3J0RXh0TGlzdCA9IEFycmF5LmZyb20obmV3IFNldChwcmVJbXBvcnRFeHRMaXN0LmNvbmNhdChkZWZhdWx0UHJlSW1wb3J0RXh0TGlzdCkpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGZpbGU6IHN0cmluZykge1xyXG4gICAgICAgIC8vIEhBQ0sg55So5LqO5oyH5a6a6YOo5YiG6LWE5rqQ5LyY5YWI5a+85YWlXHJcbiAgICAgICAgY29uc3QgZXh0ID0gZXh0bmFtZShmaWxlKTtcclxuICAgICAgICBpZiAoIWV4dCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gcHJlSW1wb3J0RXh0TGlzdC5pbmNsdWRlcyhleHQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1cclxuXHJcbmNvbnN0IGFmdGVyU2NhbiA9IGFzeW5jIGZ1bmN0aW9uIChmaWxlczogc3RyaW5nW10pIHtcclxuICAgIGxldCBkaXJJbmRleCA9IDA7XHJcbiAgICBsZXQgY2h1bmtJbmRleCA9IDA7XHJcbiAgICBsZXQgZWZmZWN0SW5kZXggPSAwO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGZpbGUgPSBmaWxlc1tpXTtcclxuICAgICAgICBjb25zdCBleHQgPSBleHRuYW1lKGZpbGUpO1xyXG4gICAgICAgIGlmICghZXh0KSB7XHJcbiAgICAgICAgICAgIGZpbGVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgZmlsZXMuc3BsaWNlKGRpckluZGV4LCAwLCBmaWxlKTtcclxuICAgICAgICAgICAgZGlySW5kZXggKz0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKGV4dCA9PT0gJy5jaHVuaycpIHtcclxuICAgICAgICAgICAgZmlsZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICBmaWxlcy5zcGxpY2UoZGlySW5kZXggKyBjaHVua0luZGV4LCAwLCBmaWxlKTtcclxuICAgICAgICAgICAgY2h1bmtJbmRleCArPSAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZXh0ID09PSAnLmVmZmVjdCcpIHtcclxuICAgICAgICAgICAgZmlsZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICBmaWxlcy5zcGxpY2UoZGlySW5kZXggKyBjaHVua0luZGV4ICsgZWZmZWN0SW5kZXgsIDAsIGZpbGUpO1xyXG4gICAgICAgICAgICBlZmZlY3RJbmRleCArPSAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGFmdGVyUHJlSW1wb3J0KGRiOiBhc3NldGRiLkFzc2V0REIpIHtcclxuICAgIC8vIOWFiOaKiuW3suaUtumbhueahOS7u+WKoemYn+WIl++8iHByZUltcG9ydGVySGFuZGxlciDov4fmu6Tlh7rmnaXnmoTpgqPpg6jliIbotYTmupDnsbvlnovvvInlhoXlrrnkvJjlhYjlr7zlhaXmiafooYzlrozmr5VcclxuICAgIGRiLnRhc2tNYW5hZ2VyLnN0YXJ0KCk7XHJcbiAgICBhd2FpdCBkYi50YXNrTWFuYWdlci53YWl0UXVldWUoKTtcclxuICAgIGRiLnRhc2tNYW5hZ2VyLnN0b3AoKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gYWZ0ZXJTdGFydERCKGRiSW5mb01hcDogUmVjb3JkPHN0cmluZywgSUFzc2V0REJJbmZvPikge1xyXG4gICAgYXdhaXQgYXNzZXRIYW5kbGVyTWFuYWdlci5jb21waWxlRWZmZWN0KHRydWUpO1xyXG4gICAgLy8g5ZCv5Yqo5pWw5o2u5bqT5ZCO77yM5omT5byAIGVmZmVjdCDlr7zlhaXlkI7nmoToh6rliqjph43mlrDnlJ/miJAgZWZmZWN0LmJpbiDlvIDlhbNcclxuICAgIGF3YWl0IGFzc2V0SGFuZGxlck1hbmFnZXIuc3RhcnRBdXRvR2VuRWZmZWN0QmluKCk7XHJcblxyXG4gICAgLy8g6ISa5pys57O757uf5pyq6Kem5Y+R5p6E5bu677yM5ZCv5Yqo6ISa5pys5p6E5bu65rWB56iLXHJcbiAgICBpZiAoIXNjcmlwdGluZy5pc1RhcmdldFJlYWR5KCdlZGl0b3InKSkge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IFF1ZXJ5QXNzZXRzT3B0aW9uID0ge1xyXG4gICAgICAgICAgICBjY1R5cGU6ICdjYy5TY3JpcHQnLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy8gVE9ETyDlupXlsYIgYXNzZXREQiDmlK/mjIHmn6Xor6Lov4fmu6TlkI7vvIzlsLHlj6/ku6Xnp7vpmaTov5nph4znmoQgZ2xvYmFsVGhpcy5hc3NldFF1ZXJ5XHJcbiAgICAgICAgY29uc3QgYXNzZXRJbmZvcyA9IGdsb2JhbFRoaXMuYXNzZXRRdWVyeS5xdWVyeUFzc2V0SW5mb3Mob3B0aW9ucywgWydtZXRhJywgJ3VybCcsICdmaWxlJywgJ2ltcG9ydGVyJywgJ3R5cGUnXSkgYXMgSUFzc2V0SW5mb1tdO1xyXG4gICAgICAgIGZvciAoY29uc3QgYXNzZXRJbmZvIG9mIGFzc2V0SW5mb3MpIHtcclxuICAgICAgICAgICAgY29uc3QgYXNzZXRDaGFuZ2U6IEFzc2V0Q2hhbmdlSW5mbyA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IEFzc2V0QWN0aW9uRW51bS5hZGQsXHJcbiAgICAgICAgICAgICAgICB1dWlkOiBhc3NldEluZm8udXVpZCxcclxuICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBhc3NldEluZm8uZmlsZSxcclxuICAgICAgICAgICAgICAgIGltcG9ydGVyOiBhc3NldEluZm8uaW1wb3J0ZXIsXHJcbiAgICAgICAgICAgICAgICB1c2VyRGF0YTogYXNzZXRJbmZvLm1ldGE/LnVzZXJEYXRhIHx8IHt9LFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgLy8g57yW6K+R5oql6ZSZ5Lya5oqb5byC5bi477yM5LiN6IO95b2x5ZON5ZCv5Yqo5rWB56iLXHJcbiAgICAgICAgICAgICAgICBhd2FpdCBzY3JpcHRpbmcuY29tcGlsZVNjcmlwdHMoW2Fzc2V0Q2hhbmdlXSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIOebruWJjee7k+aehOmHjO+8jOayoeacieWFs+mXreaVsOaNruW6k+eahOmAu+i+kVxyXG59Il19