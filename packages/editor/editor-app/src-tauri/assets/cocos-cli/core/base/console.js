"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newConsole = exports.NewConsole = void 0;
exports.formateBytes = formateBytes;
exports.transTimeToNumber = transTimeToNumber;
exports.getRealTime = getRealTime;
const path_1 = require("path");
const consola_1 = require("consola");
const pino_1 = __importDefault(require("pino"));
const i18n_1 = __importDefault(require("./i18n"));
const strip_ansi_1 = __importDefault(require("strip-ansi"));
let rawConsole = global.console;
/**
 * 自定义的一个新 console 类型，用于收集日志
 * 集成 console 提供美观的日志输出
 */
class NewConsole {
    command = false;
    messages = [];
    logDest = '';
    _start = false;
    memoryTrackMap = new Map();
    trackTimeStartMap = new Map();
    consola;
    pino = (0, pino_1.default)({
        level: process.env.DEBUG === 'true' || process.argv.includes('--debug')
            ? 'debug' : 'trace', // 暂时全部记录
    });
    cacheLogs = true;
    isLogging = false;
    isVerbose = false;
    // 进度管理相关
    currentSpinner = null;
    progressMode = false;
    lastProgressMessage = '';
    progressStartTime = 0;
    // 去重控制（控制台防抖与重复抑制）
    lastPrintType;
    lastPrintMessage;
    lastPrintTime = 0;
    duplicateSuppressWindowMs = 800;
    _init = false;
    constructor() {
        // 初始化 consola 实例
        this.consola = consola_1.consola.create({
            level: process.env.DEBUG === 'true' || process.argv.includes('--debug') ? 4 : 3,
            formatOptions: {
                colors: true,
                compact: false,
                date: false
            }
        });
        // 检查是否启用详细模式
        this.isVerbose = process.env.DEBUG === 'true' || process.argv.includes('--debug');
    }
    init(logDest, cacheLogs = false) {
        if (this._init) {
            return;
        }
        // 兼容可能存在多个同样自定义 console 的处理
        // @ts-ignore
        if (console.__rawConsole) {
            // @ts-ignore
            rawConsole = console.__rawConsole;
        }
        else {
            rawConsole = console;
        }
        // @ts-ignore 手动继承 console
        this.__proto__.__proto__ = rawConsole;
        this.logDest = logDest;
        this.cacheLogs = cacheLogs;
        this._init = true;
    }
    /**
     * 开始记录资源导入日志
     * */
    record(logDest) {
        if (this._start) {
            console.warn('Console is already recording logs.');
            return;
        }
        logDest && (this.logDest = logDest);
        if (!this.logDest) {
            console.error('logDest is required');
            return;
        }
        // @ts-ignore
        if (globalThis.console.switchConsole) {
            // @ts-ignore
            globalThis.console.switchConsole(this);
            return;
        }
        this.pino.flush(); // Finish previous writes
        // Reset pino using new log destination
        this.pino = (0, pino_1.default)({
            level: process.env.DEBUG === 'true' || process.argv.includes('--debug')
                ? 'debug' : 'trace', // 暂时全部记录
            transport: {
                targets: [
                    {
                        target: 'pino-transport-rotating-file',
                        options: {
                            dir: this.logDest,
                            filename: 'cocos',
                            enabled: true,
                            size: '1M',
                            interval: '1d',
                            compress: true,
                            immutable: true,
                            retentionDays: 30,
                            compressionOptions: { level: 6, strategy: 0 },
                            errorLogFile: (0, path_1.join)(this.logDest, 'errors.log'),
                            timestampFormat: 'iso',
                            skipPretty: false,
                            errorFlushIntervalMs: 1000,
                        },
                    }
                ],
            }
        });
        this._start = true;
        // @ts-ignore 将处理过的继承自 console 的新对象赋给 windows
        // 保存原始 console 引用，以便其他模块可以访问原始 console 避免死循环
        this.__rawConsole = rawConsole;
        // @ts-ignore
        globalThis.console = this;
        rawConsole.debug(`Start record log in {file(${this.logDest})}`);
    }
    /**
     * 停止记录
     */
    stopRecord() {
        if (!this._start) {
            console.warn('Console is not recording logs.');
            return;
        }
        rawConsole.debug(`Stop record asset-db log. {file(${this.logDest})}`);
        // @ts-ignore 将处理过的继承自 console 的新对象赋给 windows
        globalThis.console = rawConsole;
        this._start = false;
    }
    // --------------------- 重写 console 相关方法 -------------------------
    /**
     * 将参数数组格式化为消息字符串
     * 支持 Error 对象、多个参数等
     */
    _formatMessage(...args) {
        if (args.length === 0) {
            return '';
        }
        // 如果第一个参数是 Error，特殊处理
        if (args[0] instanceof Error) {
            const error = args[0];
            const errorMessage = error.stack || error.message || String(error);
            // 如果有其他参数，也包含进去
            if (args.length > 1) {
                const otherArgs = args.slice(1).map(arg => String(arg));
                return [errorMessage, ...otherArgs].join(' ');
            }
            return errorMessage;
        }
        // 所有参数都转换为字符串并连接
        return args.map(arg => String(arg)).join(' ');
    }
    /**
     * 通用的日志记录方法
     * @param type 日志类型
     * @param args 日志参数
     */
    _logMessage(type, ...args) {
        if (this.isLogging) {
            // 如果正在记录日志，直接返回，避免死循环
            return;
        }
        // 防止递归调用
        this.isLogging = true;
        try {
            const message = this._formatMessage(...args);
            this._handleProgressMessage(type, message);
            if (this._start) {
                this.save();
            }
        }
        catch (error) {
            // 如果日志记录过程中出错，使用原始 console 输出，避免死循环
            // 不能使用 newConsole.error，因为那会再次触发这个流程
            try {
                const rawConsole = globalThis.console?.__rawConsole || require('console');
                rawConsole.error('[NewConsole] Error in _logMessage:', error);
            }
            catch {
                // 如果连原始 console 都失败了，忽略（避免无限循环）
            }
        }
        finally {
            // 必须在 finally 中重置标志，确保即使出错也能重置
            this.isLogging = false;
        }
    }
    log(...args) {
        this._logMessage('log', ...args);
    }
    info(...args) {
        this._logMessage('info', ...args);
    }
    success(...args) {
        this._logMessage('success', ...args);
    }
    ready(...args) {
        this._logMessage('ready', ...args);
    }
    start(...args) {
        this._logMessage('start', ...args);
    }
    error(...args) {
        this._logMessage('error', ...args);
    }
    warn(...args) {
        this._logMessage('warn', ...args);
    }
    debug(...args) {
        this._logMessage('debug', ...args);
    }
    /**
     * 处理进度消息显示
     */
    _handleProgressMessage(type, message) {
        // 如果是错误或警告，总是显示
        if (type === 'error') {
            this._stopProgress();
            this._printOnce(type, message);
            return;
        }
        // 在进度模式下，使用 ora 显示
        if (this.progressMode) {
            this._updateProgress(message);
        }
        else {
            // 非进度模式，正常显示
            this._printOnce(type, message);
        }
    }
    /**
     * 控制台输出去重与防抖
     */
    _printOnce(type, message) {
        const now = Date.now();
        if (this.lastPrintType === type && this.lastPrintMessage === message && (now - this.lastPrintTime) < this.duplicateSuppressWindowMs) {
            // 在时间窗口内的重复消息不再打印，避免刷屏
            return;
        }
        this.lastPrintType = type;
        this.lastPrintMessage = message;
        this.lastPrintTime = now;
        // 控制台输出：保留 ANSI 转义码（用于彩色显示）
        // 使用 try-catch 包裹 consola 调用，避免 consola 内部错误触发全局错误处理器导致死循环
        try {
            this.consola[type](message);
        }
        catch (consolaError) {
            // 如果 consola 调用失败，使用原始 console 输出，避免死循环
            try {
                const rawConsole = globalThis.console?.__rawConsole || require('console');
                rawConsole.error('[NewConsole] Failed to log to consola:', consolaError);
            }
            catch {
                // 如果连原始 console 都失败了，忽略（避免无限循环）
            }
        }
        // 文件日志：去除 ANSI 转义码（避免日志文件中出现乱码）
        const cleanMessage = (0, strip_ansi_1.default)(message);
        this.messages.push({
            type,
            value: cleanMessage,
        });
        // 使用 try-catch 包裹 pino 调用，避免 pino 内部错误触发全局错误处理器导致死循环
        try {
            switch (type) {
                case 'debug':
                    this.pino.debug(cleanMessage);
                    break;
                case 'log':
                    this.pino.info(cleanMessage);
                    break;
                case 'warn':
                    this.pino.warn(cleanMessage);
                    break;
                case 'error':
                    this.pino.error(cleanMessage);
                    break;
                case 'info':
                    this.pino.info(cleanMessage);
                    break;
                case 'success':
                    this.pino.info(cleanMessage);
                    break;
                case 'ready':
                    this.pino.info(cleanMessage);
                    break;
                case 'start':
                    this.pino.info(cleanMessage);
                    break;
            }
        }
        catch (pinoError) {
            // 如果 pino 调用失败，使用原始 console 输出，避免死循环
            // 不能使用 newConsole.error，因为那会再次触发这个流程
            try {
                const rawConsole = globalThis.console?.__rawConsole || require('console');
                rawConsole.error('[NewConsole] Failed to log to pino:', pinoError);
            }
            catch {
                // 如果连原始 console 都失败了，忽略（避免无限循环）
            }
        }
    }
    /**
     * 开始进度模式
     */
    startProgress(_initialMessage = 'Processing...') {
        // this.progressMode = true;
        // this.lastProgressMessage = initialMessage;
        // try {
        //     this.currentSpinner = ora({
        //         text: initialMessage,
        //         spinner: 'dots',
        //         color: 'blue'
        //     }).start();
        // } catch (error) {
        //     // 如果 ora 导入失败，回退到简单的文本显示
        //     console.log(`⏳ ${initialMessage}`);
        //     console.error(error);
        // }
    }
    /**
     * 更新进度消息
     */
    _updateProgress(message) {
        if (this.currentSpinner) {
            this.lastProgressMessage = message;
            this.currentSpinner.text = message;
        }
    }
    /**
     * 停止进度模式
     */
    stopProgress(success = true, finalMessage) {
        if (this.currentSpinner) {
            const message = finalMessage || this.lastProgressMessage;
            if (success) {
                this.currentSpinner.succeed(message);
            }
            else {
                this.currentSpinner.fail(message);
            }
            this.currentSpinner = null;
        }
        else {
            // 如果没有 spinner，使用简单的文本显示
            const message = finalMessage || this.lastProgressMessage;
            if (success) {
                console.log(`✅ ${message}`);
            }
            else {
                console.log(`❌ ${message}`);
            }
        }
        this.progressMode = false;
    }
    /**
     * 停止当前进度（不显示成功/失败状态）
     */
    _stopProgress() {
        if (this.currentSpinner) {
            this.currentSpinner.stop();
            this.currentSpinner = null;
        }
        this.progressMode = false;
    }
    async save() {
        if (!this._start || !this.messages.length) {
            return;
        }
        if (!this.cacheLogs) {
            this.messages.shift(); // pop first message
        }
    }
    trackMemoryStart(name) {
        const heapUsed = process.memoryUsage().heapUsed;
        this.memoryTrackMap.set(name, heapUsed);
        return heapUsed;
    }
    trackMemoryEnd(name, _output = true) {
        // TODO test
        // const start = this.memoryTrackMap.get(name);
        // if (!start) {
        //     return 0;
        // }
        // const heapUsed = process.memoryUsage().heapUsed;
        // this.memoryTrackMap.delete(name);
        // const res = heapUsed - start;
        // if (output) {
        //     // 数值过小时不输出，没有统计意义
        //     res > 1024 * 1024 && console.debug(`[Assets Memory track]: ${name} start:${formateBytes(start)}, end ${formateBytes(heapUsed)}, increase: ${formateBytes(res)}`);
        //     return output;
        // }
        // return res;
    }
    trackTimeStart(message, time) {
        if (this.trackTimeStartMap.has(message)) {
            this.trackTimeStartMap.delete(message);
        }
        this.trackTimeStartMap.set(message, time || Date.now());
    }
    trackTimeEnd(message, options = {}, time) {
        const recordTime = this.trackTimeStartMap.get(message);
        if (!recordTime) {
            this.debug(`trackTimeEnd failed! Can not find the track time ${message} start`);
            return 0;
        }
        time = time || Date.now();
        const durTime = time - recordTime;
        const label = typeof options.label === 'string' ? i18n_1.default.transI18nName(options.label) : message;
        this.debug(label + ` (${durTime}ms)`);
        this.trackTimeStartMap.delete(message);
        return durTime;
    }
    // --------------------- 构建相关便捷方法 -------------------------
    /**
     * 显示构建开始信息
     */
    buildStart(platform) {
        this.start(`🚀 Starting build for ${platform}`);
        this.info(`📋 Detailed logs will be saved to log file`);
        this.startProgress(`Building ${platform}...`);
    }
    /**
     * 显示构建完成信息
     */
    buildComplete(platform, duration, success = true) {
        this.stopProgress(success);
        if (success) {
            this.success(`✅ Build completed successfully for ${platform} in ${duration}`);
        }
        else {
            this.error(`❌ Build failed for ${platform} after ${duration}`);
        }
    }
    /**
     * 显示插件任务信息
     */
    pluginTask(pkgName, funcName, status, duration) {
        const pluginInfo = `${pkgName}:${funcName}`;
        switch (status) {
            case 'start':
                this.info(`🔧 ${pluginInfo} starting...`);
                break;
            case 'complete':
                this.success(`✅ ${pluginInfo} completed${duration ? ` in ${duration}` : ''}`);
                break;
            case 'error':
                this.error(`❌ ${pluginInfo} failed`);
                break;
        }
    }
    /**
     * 显示进度信息（在进度模式下更新，否则正常显示）
     */
    progress(message, current, total) {
        const percentage = Math.round((current / total) * 100);
        const progressBar = this.createProgressBar(percentage);
        const progressMessage = `${progressBar} ${percentage}% - ${message}`;
        if (this.progressMode) {
            this._updateProgress(progressMessage);
        }
        else {
            this.info(progressMessage);
        }
    }
    /**
     * 创建进度条
     */
    createProgressBar(percentage, width = 20) {
        const filled = Math.round((percentage / 100) * width);
        const empty = width - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        return `[${bar}]`;
    }
    /**
     * 显示阶段信息
     */
    stage(stage, message) {
        const stageText = `[${stage}]`;
        if (message) {
            this.info(`${stageText} ${message}`);
        }
        else {
            this.info(stageText);
        }
    }
    /**
     * 显示任务开始（带进度）
     */
    taskStart(taskName, description) {
        const message = description ? `${taskName}: ${description}` : taskName;
        this.start(`🚀 ${message}`);
        this.startProgress(message);
    }
    /**
     * 显示任务完成
     */
    taskComplete(taskName, success = true, duration) {
        const message = duration ? `${taskName} completed in ${duration}` : `${taskName} completed`;
        this.stopProgress(success, message);
        if (success) {
            this.success(`✅ ${message}`);
        }
        else {
            this.error(`❌ ${taskName} failed`);
        }
    }
    // --------------------- Query logs -------------------------
    /**
     * 获取最近的日志信息
     */
    queryLogs(count, type) {
        const messages = [];
        for (let i = this.messages.length - 1; i >= 0 && count > 0; --i) {
            const msg = this.messages[i];
            if (!type || msg.type === type) {
                if (type) {
                    messages.push(`${translate(msg.value)}`);
                }
                else {
                    messages.push(`[${msg.type.toUpperCase()}] ${translate(msg.value)}`);
                }
                --count;
            }
        }
        messages.reverse();
        return messages;
    }
    /**
     * 清除所有日志信息
     */
    clearLogs() {
        this.messages.length = 0;
    }
}
exports.NewConsole = NewConsole;
function formateBytes(bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
}
function transTimeToNumber(time) {
    time = (0, path_1.basename)(time, '.log');
    const info = time.match(/-(\d+)$/);
    if (info) {
        const timeStr = Array.from(time);
        timeStr[info.index] = ':';
        return new Date(timeStr.join('')).getTime();
    }
    return new Date().getTime();
}
function translate(msg) {
    if (typeof msg === 'string' && !msg.includes('\n') || typeof msg === 'number') {
        return String(msg);
    }
    if (typeof msg === 'string' && msg.includes('\n')) {
        return translate(msg.split('\n'));
    }
    if (typeof msg === 'object') {
        if (Array.isArray(msg)) {
            let res = '';
            msg.forEach((data) => {
                res += `${translate(data)}\r`;
            });
            return res;
        }
        try {
            if (msg.stack) {
                return translate(msg.stack);
            }
            return JSON.stringify(msg);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }
        catch (error) {
            // noop
        }
    }
    return msg && msg.toString && msg.toString();
}
/**
 * 获取最新时间
 * @returns 2019-03-26 11:03
 */
function getRealTime() {
    const time = new Date();
    return time.toLocaleDateString().replace(/\//g, '-') + ' ' + time.toTimeString().slice(0, 8);
}
exports.newConsole = new NewConsole();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2Jhc2UvY29uc29sZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFzbEJBLG9DQUVDO0FBRUQsOENBU0M7QUFtQ0Qsa0NBR0M7QUF6b0JELCtCQUFzQztBQUN0QyxxQ0FBd0Q7QUFFeEQsZ0RBQXdCO0FBQ3hCLGtEQUEwQjtBQUMxQiw0REFBbUM7QUFhbkMsSUFBSSxVQUFVLEdBQVEsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUVyQzs7O0dBR0c7QUFDSCxNQUFhLFVBQVU7SUFDbkIsT0FBTyxHQUFHLEtBQUssQ0FBQztJQUNoQixRQUFRLEdBQXNCLEVBQUUsQ0FBQztJQUN6QixPQUFPLEdBQVcsRUFBRSxDQUFDO0lBQ3JCLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDZixjQUFjLEdBQXdCLElBQUksR0FBRyxFQUFFLENBQUM7SUFDaEQsaUJBQWlCLEdBQXdCLElBQUksR0FBRyxFQUFFLENBQUM7SUFDbkQsT0FBTyxDQUFrQjtJQUN6QixJQUFJLEdBQWdCLElBQUEsY0FBSSxFQUFDO1FBQzdCLEtBQUssRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxNQUFNLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO1lBQ25FLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxTQUFTO0tBQ3JDLENBQUMsQ0FBQztJQUNLLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDakIsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUNsQixTQUFTLEdBQVksS0FBSyxDQUFDO0lBRW5DLFNBQVM7SUFDRCxjQUFjLEdBQWUsSUFBSSxDQUFDO0lBQ2xDLFlBQVksR0FBWSxLQUFLLENBQUM7SUFDOUIsbUJBQW1CLEdBQVcsRUFBRSxDQUFDO0lBQ2pDLGlCQUFpQixHQUFXLENBQUMsQ0FBQztJQUV0QyxtQkFBbUI7SUFD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TyxLQUFLLEVBQUUsQ0FBQztZQUNiLE9BQU87UUFDWCxDQUFDO0lBQ0wsQ0FBQztJQUNELE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2pELENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixXQUFXO0lBQ3ZCLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDeEIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNqRyxDQUFDO0FBRVksUUFBQSxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhc2VuYW1lLCBqb2luIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGNvbnNvbGEsIHR5cGUgQ29uc29sYUluc3RhbmNlIH0gZnJvbSAnY29uc29sYSc7XHJcbmltcG9ydCB0eXBlIHsgT3JhIH0gZnJvbSAnb3JhJztcclxuaW1wb3J0IHBpbm8gZnJvbSAncGlubyc7XHJcbmltcG9ydCBpMThuIGZyb20gJy4vaTE4bic7XHJcbmltcG9ydCBzdHJpcEFuc2kgZnJvbSAnc3RyaXAtYW5zaSc7XHJcbmV4cG9ydCB0eXBlIElDb25zb2xlVHlwZSA9ICdsb2cnIHwgJ3dhcm4nIHwgJ2Vycm9yJyB8ICdkZWJ1ZycgfCAnaW5mbycgfCAnc3VjY2VzcycgfCAncmVhZHknIHwgJ3N0YXJ0JztcclxuXHJcbmludGVyZmFjZSBJQ29uc29sZU1lc3NhZ2Uge1xyXG4gICAgdHlwZTogSUNvbnNvbGVUeXBlLFxyXG4gICAgdmFsdWU6IGFueTtcclxufVxyXG5leHBvcnQgaW50ZXJmYWNlIHRyYWNrVGltZUVuZE9wdGlvbnMge1xyXG4gICAgb3V0cHV0PzogYm9vbGVhbjtcclxuICAgIGxhYmVsPzogc3RyaW5nO1xyXG4gICAgdmFsdWU/OiBudW1iZXI7XHJcbn1cclxuXHJcbmxldCByYXdDb25zb2xlOiBhbnkgPSBnbG9iYWwuY29uc29sZTtcclxuXHJcbi8qKlxyXG4gKiDoh6rlrprkuYnnmoTkuIDkuKrmlrAgY29uc29sZSDnsbvlnovvvIznlKjkuo7mlLbpm4bml6Xlv5dcclxuICog6ZuG5oiQIGNvbnNvbGUg5o+Q5L6b576O6KeC55qE5pel5b+X6L6T5Ye6XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTmV3Q29uc29sZSB7XHJcbiAgICBjb21tYW5kID0gZmFsc2U7XHJcbiAgICBtZXNzYWdlczogSUNvbnNvbGVNZXNzYWdlW10gPSBbXTtcclxuICAgIHByaXZhdGUgbG9nRGVzdDogc3RyaW5nID0gJyc7XHJcbiAgICBwcml2YXRlIF9zdGFydCA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBtZW1vcnlUcmFja01hcDogTWFwPHN0cmluZywgbnVtYmVyPiA9IG5ldyBNYXAoKTtcclxuICAgIHByaXZhdGUgdHJhY2tUaW1lU3RhcnRNYXA6IE1hcDxzdHJpbmcsIG51bWJlcj4gPSBuZXcgTWFwKCk7XHJcbiAgICBwcml2YXRlIGNvbnNvbGE6IENvbnNvbGFJbnN0YW5jZTtcclxuICAgIHByaXZhdGUgcGlubzogcGluby5Mb2dnZXIgPSBwaW5vKHtcclxuICAgICAgICBsZXZlbDogcHJvY2Vzcy5lbnYuREVCVUcgPT09ICd0cnVlJyB8fCBwcm9jZXNzLmFyZ3YuaW5jbHVkZXMoJy0tZGVidWcnKVxyXG4gICAgICAgICAgICA/ICdkZWJ1ZycgOiAndHJhY2UnLCAvLyDmmoLml7blhajpg6jorrDlvZVcclxuICAgIH0pO1xyXG4gICAgcHJpdmF0ZSBjYWNoZUxvZ3MgPSB0cnVlO1xyXG4gICAgcHJpdmF0ZSBpc0xvZ2dpbmcgPSBmYWxzZTtcclxuICAgIHByaXZhdGUgaXNWZXJib3NlOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgLy8g6L+b5bqm566h55CG55u45YWzXHJcbiAgICBwcml2YXRlIGN1cnJlbnRTcGlubmVyOiBPcmEgfCBudWxsID0gbnVsbDtcclxuICAgIHByaXZhdGUgcHJvZ3Jlc3NNb2RlOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIGxhc3RQcm9ncmVzc01lc3NhZ2U6IHN0cmluZyA9ICcnO1xyXG4gICAgcHJpdmF0ZSBwcm9ncmVzc1N0YXJ0VGltZTogbnVtYmVyID0gMDtcclxuXHJcbiAgICAvLyDljrvph43mjqfliLbvvIjmjqfliLblj7DpmLLmipbkuI7ph43lpI3mipHliLbvvIlcclxuICAgIHByaXZhdGUgbGFzdFByaW50VHlwZT86IElDb25zb2xlVHlwZTtcclxuICAgIHByaXZhdGUgbGFzdFByaW50TWVzc2FnZT86IHN0cmluZztcclxuICAgIHByaXZhdGUgbGFzdFByaW50VGltZSA9IDA7XHJcbiAgICBwcml2YXRlIGR1cGxpY2F0ZVN1cHByZXNzV2luZG93TXMgPSA4MDA7XHJcblxyXG4gICAgX2luaXQgPSBmYWxzZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyDliJ3lp4vljJYgY29uc29sYSDlrp7kvotcclxuICAgICAgICB0aGlzLmNvbnNvbGEgPSBjb25zb2xhLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgIGxldmVsOiBwcm9jZXNzLmVudi5ERUJVRyA9PT0gJ3RydWUnIHx8IHByb2Nlc3MuYXJndi5pbmNsdWRlcygnLS1kZWJ1ZycpID8gNCA6IDMsXHJcbiAgICAgICAgICAgIGZvcm1hdE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIGNvbG9yczogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGNvbXBhY3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZGF0ZTogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyDmo4Dmn6XmmK/lkKblkK/nlKjor6bnu4bmqKHlvI9cclxuICAgICAgICB0aGlzLmlzVmVyYm9zZSA9IHByb2Nlc3MuZW52LkRFQlVHID09PSAndHJ1ZScgfHwgcHJvY2Vzcy5hcmd2LmluY2x1ZGVzKCctLWRlYnVnJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQobG9nRGVzdDogc3RyaW5nLCBjYWNoZUxvZ3MgPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5YW85a655Y+v6IO95a2Y5Zyo5aSa5Liq5ZCM5qC36Ieq5a6a5LmJIGNvbnNvbGUg55qE5aSE55CGXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGlmIChjb25zb2xlLl9fcmF3Q29uc29sZSkge1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIHJhd0NvbnNvbGUgPSBjb25zb2xlLl9fcmF3Q29uc29sZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByYXdDb25zb2xlID0gY29uc29sZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSDmiYvliqjnu6fmib8gY29uc29sZVxyXG4gICAgICAgIHRoaXMuX19wcm90b19fLl9fcHJvdG9fXyA9IHJhd0NvbnNvbGU7XHJcblxyXG4gICAgICAgIHRoaXMubG9nRGVzdCA9IGxvZ0Rlc3Q7XHJcbiAgICAgICAgdGhpcy5jYWNoZUxvZ3MgPSBjYWNoZUxvZ3M7XHJcblxyXG4gICAgICAgIHRoaXMuX2luaXQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5byA5aeL6K6w5b2V6LWE5rqQ5a+85YWl5pel5b+XXHJcbiAgICAgKiAqL1xyXG4gICAgcHVibGljIHJlY29yZChsb2dEZXN0Pzogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3N0YXJ0KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQ29uc29sZSBpcyBhbHJlYWR5IHJlY29yZGluZyBsb2dzLicpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxvZ0Rlc3QgJiYgKHRoaXMubG9nRGVzdCA9IGxvZ0Rlc3QpO1xyXG4gICAgICAgIGlmICghdGhpcy5sb2dEZXN0KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2xvZ0Rlc3QgaXMgcmVxdWlyZWQnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgaWYgKGdsb2JhbFRoaXMuY29uc29sZS5zd2l0Y2hDb25zb2xlKSB7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgZ2xvYmFsVGhpcy5jb25zb2xlLnN3aXRjaENvbnNvbGUodGhpcyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucGluby5mbHVzaCgpOyAvLyBGaW5pc2ggcHJldmlvdXMgd3JpdGVzXHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHBpbm8gdXNpbmcgbmV3IGxvZyBkZXN0aW5hdGlvblxyXG4gICAgICAgIHRoaXMucGlubyA9IHBpbm8oe1xyXG4gICAgICAgICAgICBsZXZlbDogcHJvY2Vzcy5lbnYuREVCVUcgPT09ICd0cnVlJyB8fCBwcm9jZXNzLmFyZ3YuaW5jbHVkZXMoJy0tZGVidWcnKVxyXG4gICAgICAgICAgICAgICAgPyAnZGVidWcnIDogJ3RyYWNlJywgLy8g5pqC5pe25YWo6YOo6K6w5b2VXHJcbiAgICAgICAgICAgIHRyYW5zcG9ydDoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0czogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiAncGluby10cmFuc3BvcnQtcm90YXRpbmctZmlsZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcjogdGhpcy5sb2dEZXN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6ICdjb2NvcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogJzFNJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludGVydmFsOiAnMWQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcHJlc3M6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbW11dGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRlbnRpb25EYXlzOiAzMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXByZXNzaW9uT3B0aW9uczogeyBsZXZlbDogNiwgc3RyYXRlZ3k6IDAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTG9nRmlsZTogam9pbih0aGlzLmxvZ0Rlc3QsICdlcnJvcnMubG9nJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXBGb3JtYXQ6ICdpc28nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpcFByZXR0eTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvckZsdXNoSW50ZXJ2YWxNczogMTAwMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3N0YXJ0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSDlsIblpITnkIbov4fnmoTnu6fmib/oh6ogY29uc29sZSDnmoTmlrDlr7nosaHotYvnu5kgd2luZG93c1xyXG4gICAgICAgIC8vIOS/neWtmOWOn+WniyBjb25zb2xlIOW8leeUqO+8jOS7peS+v+WFtuS7luaooeWdl+WPr+S7peiuv+mXruWOn+WniyBjb25zb2xlIOmBv+WFjeatu+W+queOr1xyXG4gICAgICAgICh0aGlzIGFzIGFueSkuX19yYXdDb25zb2xlID0gcmF3Q29uc29sZTtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgZ2xvYmFsVGhpcy5jb25zb2xlID0gdGhpcztcclxuICAgICAgICByYXdDb25zb2xlLmRlYnVnKGBTdGFydCByZWNvcmQgbG9nIGluIHtmaWxlKCR7dGhpcy5sb2dEZXN0fSl9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlgZzmraLorrDlvZVcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0b3BSZWNvcmQoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zdGFydCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0NvbnNvbGUgaXMgbm90IHJlY29yZGluZyBsb2dzLicpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJhd0NvbnNvbGUuZGVidWcoYFN0b3AgcmVjb3JkIGFzc2V0LWRiIGxvZy4ge2ZpbGUoJHt0aGlzLmxvZ0Rlc3R9KX1gKTtcclxuICAgICAgICAvLyBAdHMtaWdub3JlIOWwhuWkhOeQhui/h+eahOe7p+aJv+iHqiBjb25zb2xlIOeahOaWsOWvueixoei1i+e7mSB3aW5kb3dzXHJcbiAgICAgICAgZ2xvYmFsVGhpcy5jb25zb2xlID0gcmF3Q29uc29sZTtcclxuICAgICAgICB0aGlzLl9zdGFydCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLSDph43lhpkgY29uc29sZSDnm7jlhbPmlrnms5UgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5bCG5Y+C5pWw5pWw57uE5qC85byP5YyW5Li65raI5oGv5a2X56ym5LiyXHJcbiAgICAgKiDmlK/mjIEgRXJyb3Ig5a+56LGh44CB5aSa5Liq5Y+C5pWw562JXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2Zvcm1hdE1lc3NhZ2UoLi4uYXJnczogYW55W10pOiBzdHJpbmcge1xyXG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDlpoLmnpznrKzkuIDkuKrlj4LmlbDmmK8gRXJyb3LvvIznibnmrorlpITnkIZcclxuICAgICAgICBpZiAoYXJnc1swXSBpbnN0YW5jZW9mIEVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gYXJnc1swXTtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3Iuc3RhY2sgfHwgZXJyb3IubWVzc2FnZSB8fCBTdHJpbmcoZXJyb3IpO1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzmnInlhbbku5blj4LmlbDvvIzkuZ/ljIXlkKvov5vljrtcclxuICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgb3RoZXJBcmdzID0gYXJncy5zbGljZSgxKS5tYXAoYXJnID0+IFN0cmluZyhhcmcpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbZXJyb3JNZXNzYWdlLCAuLi5vdGhlckFyZ3NdLmpvaW4oJyAnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZXJyb3JNZXNzYWdlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5omA5pyJ5Y+C5pWw6YO96L2s5o2i5Li65a2X56ym5Liy5bm26L+e5o6lXHJcbiAgICAgICAgcmV0dXJuIGFyZ3MubWFwKGFyZyA9PiBTdHJpbmcoYXJnKSkuam9pbignICcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YCa55So55qE5pel5b+X6K6w5b2V5pa55rOVXHJcbiAgICAgKiBAcGFyYW0gdHlwZSDml6Xlv5fnsbvlnotcclxuICAgICAqIEBwYXJhbSBhcmdzIOaXpeW/l+WPguaVsFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9sb2dNZXNzYWdlKHR5cGU6IElDb25zb2xlVHlwZSwgLi4uYXJnczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xvZ2dpbmcpIHtcclxuICAgICAgICAgICAgLy8g5aaC5p6c5q2j5Zyo6K6w5b2V5pel5b+X77yM55u05o6l6L+U5Zue77yM6YG/5YWN5q275b6q546vXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g6Ziy5q2i6YCS5b2S6LCD55SoXHJcbiAgICAgICAgdGhpcy5pc0xvZ2dpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fZm9ybWF0TWVzc2FnZSguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5faGFuZGxlUHJvZ3Jlc3NNZXNzYWdlKHR5cGUsIG1lc3NhZ2UpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX3N0YXJ0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIC8vIOWmguaenOaXpeW/l+iusOW9lei/h+eoi+S4reWHuumUme+8jOS9v+eUqOWOn+WniyBjb25zb2xlIOi+k+WHuu+8jOmBv+WFjeatu+W+queOr1xyXG4gICAgICAgICAgICAvLyDkuI3og73kvb/nlKggbmV3Q29uc29sZS5lcnJvcu+8jOWboOS4uumCo+S8muWGjeasoeinpuWPkei/meS4qua1geeoi1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmF3Q29uc29sZSA9IChnbG9iYWxUaGlzIGFzIGFueSkuY29uc29sZT8uX19yYXdDb25zb2xlIHx8IHJlcXVpcmUoJ2NvbnNvbGUnKTtcclxuICAgICAgICAgICAgICAgIHJhd0NvbnNvbGUuZXJyb3IoJ1tOZXdDb25zb2xlXSBFcnJvciBpbiBfbG9nTWVzc2FnZTonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLy8g5aaC5p6c6L+e5Y6f5aeLIGNvbnNvbGUg6YO95aSx6LSl5LqG77yM5b+955Wl77yI6YG/5YWN5peg6ZmQ5b6q546v77yJXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICAvLyDlv4XpobvlnKggZmluYWxseSDkuK3ph43nva7moIflv5fvvIznoa7kv53ljbPkvb/lh7rplJnkuZ/og73ph43nva5cclxuICAgICAgICAgICAgdGhpcy5pc0xvZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGxvZyguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICAgIHRoaXMuX2xvZ01lc3NhZ2UoJ2xvZycsIC4uLmFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbmZvKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgICAgdGhpcy5fbG9nTWVzc2FnZSgnaW5mbycsIC4uLmFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdWNjZXNzKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgICAgdGhpcy5fbG9nTWVzc2FnZSgnc3VjY2VzcycsIC4uLmFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZWFkeSguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICAgIHRoaXMuX2xvZ01lc3NhZ2UoJ3JlYWR5JywgLi4uYXJncyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXJ0KC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgICAgdGhpcy5fbG9nTWVzc2FnZSgnc3RhcnQnLCAuLi5hcmdzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZXJyb3IoLi4uYXJnczogYW55W10pIHtcclxuICAgICAgICB0aGlzLl9sb2dNZXNzYWdlKCdlcnJvcicsIC4uLmFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB3YXJuKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgICAgdGhpcy5fbG9nTWVzc2FnZSgnd2FybicsIC4uLmFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZWJ1ZyguLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICAgIHRoaXMuX2xvZ01lc3NhZ2UoJ2RlYnVnJywgLi4uYXJncyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlpITnkIbov5vluqbmtojmga/mmL7npLpcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfaGFuZGxlUHJvZ3Jlc3NNZXNzYWdlKHR5cGU6IElDb25zb2xlVHlwZSwgbWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgICAgICAgLy8g5aaC5p6c5piv6ZSZ6K+v5oiW6K2m5ZGK77yM5oC75piv5pi+56S6XHJcbiAgICAgICAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RvcFByb2dyZXNzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByaW50T25jZSh0eXBlLCBtZXNzYWdlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5Zyo6L+b5bqm5qih5byP5LiL77yM5L2/55SoIG9yYSDmmL7npLpcclxuICAgICAgICBpZiAodGhpcy5wcm9ncmVzc01vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlUHJvZ3Jlc3MobWVzc2FnZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8g6Z2e6L+b5bqm5qih5byP77yM5q2j5bi45pi+56S6XHJcbiAgICAgICAgICAgIHRoaXMuX3ByaW50T25jZSh0eXBlLCBtZXNzYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmjqfliLblj7DovpPlh7rljrvph43kuI7pmLLmipZcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfcHJpbnRPbmNlKHR5cGU6IElDb25zb2xlVHlwZSwgbWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgICAgICBpZiAodGhpcy5sYXN0UHJpbnRUeXBlID09PSB0eXBlICYmIHRoaXMubGFzdFByaW50TWVzc2FnZSA9PT0gbWVzc2FnZSAmJiAobm93IC0gdGhpcy5sYXN0UHJpbnRUaW1lKSA8IHRoaXMuZHVwbGljYXRlU3VwcHJlc3NXaW5kb3dNcykge1xyXG4gICAgICAgICAgICAvLyDlnKjml7bpl7Tnqpflj6PlhoXnmoTph43lpI3mtojmga/kuI3lho3miZPljbDvvIzpgb/lhY3liLflsY9cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmxhc3RQcmludFR5cGUgPSB0eXBlO1xyXG4gICAgICAgIHRoaXMubGFzdFByaW50TWVzc2FnZSA9IG1lc3NhZ2U7XHJcbiAgICAgICAgdGhpcy5sYXN0UHJpbnRUaW1lID0gbm93O1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOaOp+WItuWPsOi+k+WHuu+8muS/neeVmSBBTlNJIOi9rOS5ieegge+8iOeUqOS6juW9qeiJsuaYvuekuu+8iVxyXG4gICAgICAgIC8vIOS9v+eUqCB0cnktY2F0Y2gg5YyF6KO5IGNvbnNvbGEg6LCD55So77yM6YG/5YWNIGNvbnNvbGEg5YaF6YOo6ZSZ6K+v6Kem5Y+R5YWo5bGA6ZSZ6K+v5aSE55CG5Zmo5a+86Ie05q275b6q546vXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy5jb25zb2xhW3R5cGVdKG1lc3NhZ2UpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGNvbnNvbGFFcnJvcikge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpwgY29uc29sYSDosIPnlKjlpLHotKXvvIzkvb/nlKjljp/lp4sgY29uc29sZSDovpPlh7rvvIzpgb/lhY3mrbvlvqrnjq9cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJhd0NvbnNvbGUgPSAoZ2xvYmFsVGhpcyBhcyBhbnkpLmNvbnNvbGU/Ll9fcmF3Q29uc29sZSB8fCByZXF1aXJlKCdjb25zb2xlJyk7XHJcbiAgICAgICAgICAgICAgICByYXdDb25zb2xlLmVycm9yKCdbTmV3Q29uc29sZV0gRmFpbGVkIHRvIGxvZyB0byBjb25zb2xhOicsIGNvbnNvbGFFcnJvcik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLy8g5aaC5p6c6L+e5Y6f5aeLIGNvbnNvbGUg6YO95aSx6LSl5LqG77yM5b+955Wl77yI6YG/5YWN5peg6ZmQ5b6q546v77yJXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5paH5Lu25pel5b+X77ya5Y676ZmkIEFOU0kg6L2s5LmJ56CB77yI6YG/5YWN5pel5b+X5paH5Lu25Lit5Ye6546w5Lmx56CB77yJXHJcbiAgICAgICAgY29uc3QgY2xlYW5NZXNzYWdlID0gc3RyaXBBbnNpKG1lc3NhZ2UpO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZXMucHVzaCh7XHJcbiAgICAgICAgICAgIHR5cGUsXHJcbiAgICAgICAgICAgIHZhbHVlOiBjbGVhbk1lc3NhZ2UsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIOS9v+eUqCB0cnktY2F0Y2gg5YyF6KO5IHBpbm8g6LCD55So77yM6YG/5YWNIHBpbm8g5YaF6YOo6ZSZ6K+v6Kem5Y+R5YWo5bGA6ZSZ6K+v5aSE55CG5Zmo5a+86Ie05q275b6q546vXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkZWJ1Zyc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waW5vLmRlYnVnKGNsZWFuTWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdsb2cnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGluby5pbmZvKGNsZWFuTWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd3YXJuJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBpbm8ud2FybihjbGVhbk1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZXJyb3InOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGluby5lcnJvcihjbGVhbk1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnaW5mbyc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waW5vLmluZm8oY2xlYW5NZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3N1Y2Nlc3MnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGluby5pbmZvKGNsZWFuTWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdyZWFkeSc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waW5vLmluZm8oY2xlYW5NZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3N0YXJ0JzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBpbm8uaW5mbyhjbGVhbk1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAocGlub0Vycm9yKSB7XHJcbiAgICAgICAgICAgIC8vIOWmguaenCBwaW5vIOiwg+eUqOWksei0pe+8jOS9v+eUqOWOn+WniyBjb25zb2xlIOi+k+WHuu+8jOmBv+WFjeatu+W+queOr1xyXG4gICAgICAgICAgICAvLyDkuI3og73kvb/nlKggbmV3Q29uc29sZS5lcnJvcu+8jOWboOS4uumCo+S8muWGjeasoeinpuWPkei/meS4qua1geeoi1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmF3Q29uc29sZSA9IChnbG9iYWxUaGlzIGFzIGFueSkuY29uc29sZT8uX19yYXdDb25zb2xlIHx8IHJlcXVpcmUoJ2NvbnNvbGUnKTtcclxuICAgICAgICAgICAgICAgIHJhd0NvbnNvbGUuZXJyb3IoJ1tOZXdDb25zb2xlXSBGYWlsZWQgdG8gbG9nIHRvIHBpbm86JywgcGlub0Vycm9yKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzov57ljp/lp4sgY29uc29sZSDpg73lpLHotKXkuobvvIzlv73nlaXvvIjpgb/lhY3ml6DpmZDlvqrnjq/vvIlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOW8gOWni+i/m+W6puaooeW8j1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhcnRQcm9ncmVzcyhfaW5pdGlhbE1lc3NhZ2U6IHN0cmluZyA9ICdQcm9jZXNzaW5nLi4uJykge1xyXG4gICAgICAgIC8vIHRoaXMucHJvZ3Jlc3NNb2RlID0gdHJ1ZTtcclxuICAgICAgICAvLyB0aGlzLmxhc3RQcm9ncmVzc01lc3NhZ2UgPSBpbml0aWFsTWVzc2FnZTtcclxuXHJcbiAgICAgICAgLy8gdHJ5IHtcclxuICAgICAgICAvLyAgICAgdGhpcy5jdXJyZW50U3Bpbm5lciA9IG9yYSh7XHJcbiAgICAgICAgLy8gICAgICAgICB0ZXh0OiBpbml0aWFsTWVzc2FnZSxcclxuICAgICAgICAvLyAgICAgICAgIHNwaW5uZXI6ICdkb3RzJyxcclxuICAgICAgICAvLyAgICAgICAgIGNvbG9yOiAnYmx1ZSdcclxuICAgICAgICAvLyAgICAgfSkuc3RhcnQoKTtcclxuICAgICAgICAvLyB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIC8vICAgICAvLyDlpoLmnpwgb3JhIOWvvOWFpeWksei0pe+8jOWbnumAgOWIsOeugOWNleeahOaWh+acrOaYvuekulxyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhg4o+zICR7aW5pdGlhbE1lc3NhZ2V9YCk7XHJcbiAgICAgICAgLy8gICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgIC8vIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOabtOaWsOi/m+W6pua2iOaBr1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF91cGRhdGVQcm9ncmVzcyhtZXNzYWdlOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50U3Bpbm5lcikge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RQcm9ncmVzc01lc3NhZ2UgPSBtZXNzYWdlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTcGlubmVyLnRleHQgPSBtZXNzYWdlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWBnOatoui/m+W6puaooeW8j1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RvcFByb2dyZXNzKHN1Y2Nlc3M6IGJvb2xlYW4gPSB0cnVlLCBmaW5hbE1lc3NhZ2U/OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50U3Bpbm5lcikge1xyXG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gZmluYWxNZXNzYWdlIHx8IHRoaXMubGFzdFByb2dyZXNzTWVzc2FnZTtcclxuICAgICAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNwaW5uZXIuc3VjY2VlZChtZXNzYWdlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNwaW5uZXIuZmFpbChtZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTcGlubmVyID0gbnVsbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzmsqHmnIkgc3Bpbm5lcu+8jOS9v+eUqOeugOWNleeahOaWh+acrOaYvuekulxyXG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gZmluYWxNZXNzYWdlIHx8IHRoaXMubGFzdFByb2dyZXNzTWVzc2FnZTtcclxuICAgICAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUgJHttZXNzYWdlfWApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOKdjCAke21lc3NhZ2V9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wcm9ncmVzc01vZGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWBnOatouW9k+WJjei/m+W6pu+8iOS4jeaYvuekuuaIkOWKny/lpLHotKXnirbmgIHvvIlcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc3RvcFByb2dyZXNzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRTcGlubmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNwaW5uZXIuc3RvcCgpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTcGlubmVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wcm9ncmVzc01vZGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIHNhdmUoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zdGFydCB8fCAhdGhpcy5tZXNzYWdlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuY2FjaGVMb2dzKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZXMuc2hpZnQoKTsgLy8gcG9wIGZpcnN0IG1lc3NhZ2VcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdHJhY2tNZW1vcnlTdGFydChuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBoZWFwVXNlZCA9IHByb2Nlc3MubWVtb3J5VXNhZ2UoKS5oZWFwVXNlZDtcclxuICAgICAgICB0aGlzLm1lbW9yeVRyYWNrTWFwLnNldChuYW1lLCBoZWFwVXNlZCk7XHJcbiAgICAgICAgcmV0dXJuIGhlYXBVc2VkO1xyXG4gICAgfVxyXG5cclxuICAgIHRyYWNrTWVtb3J5RW5kKG5hbWU6IHN0cmluZywgX291dHB1dCA9IHRydWUpIHtcclxuICAgICAgICAvLyBUT0RPIHRlc3RcclxuICAgICAgICAvLyBjb25zdCBzdGFydCA9IHRoaXMubWVtb3J5VHJhY2tNYXAuZ2V0KG5hbWUpO1xyXG4gICAgICAgIC8vIGlmICghc3RhcnQpIHtcclxuICAgICAgICAvLyAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIC8vIGNvbnN0IGhlYXBVc2VkID0gcHJvY2Vzcy5tZW1vcnlVc2FnZSgpLmhlYXBVc2VkO1xyXG4gICAgICAgIC8vIHRoaXMubWVtb3J5VHJhY2tNYXAuZGVsZXRlKG5hbWUpO1xyXG4gICAgICAgIC8vIGNvbnN0IHJlcyA9IGhlYXBVc2VkIC0gc3RhcnQ7XHJcbiAgICAgICAgLy8gaWYgKG91dHB1dCkge1xyXG4gICAgICAgIC8vICAgICAvLyDmlbDlgLzov4flsI/ml7bkuI3ovpPlh7rvvIzmsqHmnInnu5/orqHmhI/kuYlcclxuICAgICAgICAvLyAgICAgcmVzID4gMTAyNCAqIDEwMjQgJiYgY29uc29sZS5kZWJ1ZyhgW0Fzc2V0cyBNZW1vcnkgdHJhY2tdOiAke25hbWV9IHN0YXJ0OiR7Zm9ybWF0ZUJ5dGVzKHN0YXJ0KX0sIGVuZCAke2Zvcm1hdGVCeXRlcyhoZWFwVXNlZCl9LCBpbmNyZWFzZTogJHtmb3JtYXRlQnl0ZXMocmVzKX1gKTtcclxuICAgICAgICAvLyAgICAgcmV0dXJuIG91dHB1dDtcclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgLy8gcmV0dXJuIHJlcztcclxuICAgIH1cclxuXHJcbiAgICB0cmFja1RpbWVTdGFydChtZXNzYWdlOiBzdHJpbmcsIHRpbWU/OiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy50cmFja1RpbWVTdGFydE1hcC5oYXMobWVzc2FnZSkpIHtcclxuICAgICAgICAgICAgdGhpcy50cmFja1RpbWVTdGFydE1hcC5kZWxldGUobWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudHJhY2tUaW1lU3RhcnRNYXAuc2V0KG1lc3NhZ2UsIHRpbWUgfHwgRGF0ZS5ub3coKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdHJhY2tUaW1lRW5kKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9uczogdHJhY2tUaW1lRW5kT3B0aW9ucyA9IHt9LCB0aW1lPzogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCByZWNvcmRUaW1lID0gdGhpcy50cmFja1RpbWVTdGFydE1hcC5nZXQobWVzc2FnZSk7XHJcbiAgICAgICAgaWYgKCFyZWNvcmRUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVidWcoYHRyYWNrVGltZUVuZCBmYWlsZWQhIENhbiBub3QgZmluZCB0aGUgdHJhY2sgdGltZSAke21lc3NhZ2V9IHN0YXJ0YCk7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aW1lID0gdGltZSB8fCBEYXRlLm5vdygpO1xyXG4gICAgICAgIGNvbnN0IGR1clRpbWUgPSB0aW1lIC0gcmVjb3JkVGltZTtcclxuICAgICAgICBjb25zdCBsYWJlbCA9IHR5cGVvZiBvcHRpb25zLmxhYmVsID09PSAnc3RyaW5nJyA/IGkxOG4udHJhbnNJMThuTmFtZShvcHRpb25zLmxhYmVsKSA6IG1lc3NhZ2U7XHJcbiAgICAgICAgdGhpcy5kZWJ1ZyhsYWJlbCArIGAgKCR7ZHVyVGltZX1tcylgKTtcclxuICAgICAgICB0aGlzLnRyYWNrVGltZVN0YXJ0TWFwLmRlbGV0ZShtZXNzYWdlKTtcclxuICAgICAgICByZXR1cm4gZHVyVGltZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0g5p6E5bu655u45YWz5L6/5o235pa55rOVIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuuaehOW7uuW8gOWni+S/oeaBr1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYnVpbGRTdGFydChwbGF0Zm9ybTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5zdGFydChg8J+agCBTdGFydGluZyBidWlsZCBmb3IgJHtwbGF0Zm9ybX1gKTtcclxuICAgICAgICB0aGlzLmluZm8oYPCfk4sgRGV0YWlsZWQgbG9ncyB3aWxsIGJlIHNhdmVkIHRvIGxvZyBmaWxlYCk7XHJcbiAgICAgICAgdGhpcy5zdGFydFByb2dyZXNzKGBCdWlsZGluZyAke3BsYXRmb3JtfS4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S65p6E5bu65a6M5oiQ5L+h5oGvXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBidWlsZENvbXBsZXRlKHBsYXRmb3JtOiBzdHJpbmcsIGR1cmF0aW9uOiBzdHJpbmcsIHN1Y2Nlc3M6IGJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICAgICAgdGhpcy5zdG9wUHJvZ3Jlc3Moc3VjY2Vzcyk7XHJcbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgdGhpcy5zdWNjZXNzKGDinIUgQnVpbGQgY29tcGxldGVkIHN1Y2Nlc3NmdWxseSBmb3IgJHtwbGF0Zm9ybX0gaW4gJHtkdXJhdGlvbn1gKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVycm9yKGDinYwgQnVpbGQgZmFpbGVkIGZvciAke3BsYXRmb3JtfSBhZnRlciAke2R1cmF0aW9ufWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuuaPkuS7tuS7u+WKoeS/oeaBr1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcGx1Z2luVGFzayhwa2dOYW1lOiBzdHJpbmcsIGZ1bmNOYW1lOiBzdHJpbmcsIHN0YXR1czogJ3N0YXJ0JyB8ICdjb21wbGV0ZScgfCAnZXJyb3InLCBkdXJhdGlvbj86IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHBsdWdpbkluZm8gPSBgJHtwa2dOYW1lfToke2Z1bmNOYW1lfWA7XHJcbiAgICAgICAgc3dpdGNoIChzdGF0dXMpIHtcclxuICAgICAgICAgICAgY2FzZSAnc3RhcnQnOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbmZvKGDwn5SnICR7cGx1Z2luSW5mb30gc3RhcnRpbmcuLi5gKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdjb21wbGV0ZSc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Y2Nlc3MoYOKchSAke3BsdWdpbkluZm99IGNvbXBsZXRlZCR7ZHVyYXRpb24gPyBgIGluICR7ZHVyYXRpb259YCA6ICcnfWApO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcclxuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IoYOKdjCAke3BsdWdpbkluZm99IGZhaWxlZGApO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S66L+b5bqm5L+h5oGv77yI5Zyo6L+b5bqm5qih5byP5LiL5pu05paw77yM5ZCm5YiZ5q2j5bi45pi+56S677yJXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBwcm9ncmVzcyhtZXNzYWdlOiBzdHJpbmcsIGN1cnJlbnQ6IG51bWJlciwgdG90YWw6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSBNYXRoLnJvdW5kKChjdXJyZW50IC8gdG90YWwpICogMTAwKTtcclxuICAgICAgICBjb25zdCBwcm9ncmVzc0JhciA9IHRoaXMuY3JlYXRlUHJvZ3Jlc3NCYXIocGVyY2VudGFnZSk7XHJcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3NNZXNzYWdlID0gYCR7cHJvZ3Jlc3NCYXJ9ICR7cGVyY2VudGFnZX0lIC0gJHttZXNzYWdlfWA7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnByb2dyZXNzTW9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVQcm9ncmVzcyhwcm9ncmVzc01lc3NhZ2UpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5mbyhwcm9ncmVzc01lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uui/m+W6puadoVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNyZWF0ZVByb2dyZXNzQmFyKHBlcmNlbnRhZ2U6IG51bWJlciwgd2lkdGg6IG51bWJlciA9IDIwKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBmaWxsZWQgPSBNYXRoLnJvdW5kKChwZXJjZW50YWdlIC8gMTAwKSAqIHdpZHRoKTtcclxuICAgICAgICBjb25zdCBlbXB0eSA9IHdpZHRoIC0gZmlsbGVkO1xyXG4gICAgICAgIGNvbnN0IGJhciA9ICfilognLnJlcGVhdChmaWxsZWQpICsgJ+KWkScucmVwZWF0KGVtcHR5KTtcclxuICAgICAgICByZXR1cm4gYFske2Jhcn1dYDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuumYtuauteS/oeaBr1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhZ2Uoc3RhZ2U6IHN0cmluZywgbWVzc2FnZT86IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHN0YWdlVGV4dCA9IGBbJHtzdGFnZX1dYDtcclxuICAgICAgICBpZiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICB0aGlzLmluZm8oYCR7c3RhZ2VUZXh0fSAke21lc3NhZ2V9YCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5pbmZvKHN0YWdlVGV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S65Lu75Yqh5byA5aeL77yI5bim6L+b5bqm77yJXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0YXNrU3RhcnQodGFza05hbWU6IHN0cmluZywgZGVzY3JpcHRpb24/OiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBtZXNzYWdlID0gZGVzY3JpcHRpb24gPyBgJHt0YXNrTmFtZX06ICR7ZGVzY3JpcHRpb259YCA6IHRhc2tOYW1lO1xyXG4gICAgICAgIHRoaXMuc3RhcnQoYPCfmoAgJHttZXNzYWdlfWApO1xyXG4gICAgICAgIHRoaXMuc3RhcnRQcm9ncmVzcyhtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuuS7u+WKoeWujOaIkFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdGFza0NvbXBsZXRlKHRhc2tOYW1lOiBzdHJpbmcsIHN1Y2Nlc3M6IGJvb2xlYW4gPSB0cnVlLCBkdXJhdGlvbj86IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBkdXJhdGlvbiA/IGAke3Rhc2tOYW1lfSBjb21wbGV0ZWQgaW4gJHtkdXJhdGlvbn1gIDogYCR7dGFza05hbWV9IGNvbXBsZXRlZGA7XHJcbiAgICAgICAgdGhpcy5zdG9wUHJvZ3Jlc3Moc3VjY2VzcywgbWVzc2FnZSk7XHJcbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgdGhpcy5zdWNjZXNzKGDinIUgJHttZXNzYWdlfWApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXJyb3IoYOKdjCAke3Rhc2tOYW1lfSBmYWlsZWRgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFF1ZXJ5IGxvZ3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmnIDov5HnmoTml6Xlv5fkv6Hmga9cclxuICAgICAqL1xyXG4gICAgcHVibGljIHF1ZXJ5TG9ncyhjb3VudDogbnVtYmVyLCB0eXBlPzogSUNvbnNvbGVUeXBlKTogc3RyaW5nW10ge1xyXG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLm1lc3NhZ2VzLmxlbmd0aCAtIDE7IGkgPj0gMCAmJiBjb3VudCA+IDA7IC0taSkge1xyXG4gICAgICAgICAgICBjb25zdCBtc2cgPSB0aGlzLm1lc3NhZ2VzW2ldO1xyXG4gICAgICAgICAgICBpZiAoIXR5cGUgfHwgbXNnLnR5cGUgPT09IHR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChgJHt0cmFuc2xhdGUobXNnLnZhbHVlKX1gKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChgWyR7bXNnLnR5cGUudG9VcHBlckNhc2UoKX1dICR7dHJhbnNsYXRlKG1zZy52YWx1ZSl9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAtLWNvdW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1lc3NhZ2VzLnJldmVyc2UoKTtcclxuICAgICAgICByZXR1cm4gbWVzc2FnZXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOa4hemZpOaJgOacieaXpeW/l+S/oeaBr1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY2xlYXJMb2dzKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubWVzc2FnZXMubGVuZ3RoID0gMDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdGVCeXRlcyhieXRlczogbnVtYmVyKSB7XHJcbiAgICByZXR1cm4gKGJ5dGVzIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMikgKyAnTUInO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNUaW1lVG9OdW1iZXIodGltZTogc3RyaW5nKSB7XHJcbiAgICB0aW1lID0gYmFzZW5hbWUodGltZSwgJy5sb2cnKTtcclxuICAgIGNvbnN0IGluZm8gPSB0aW1lLm1hdGNoKC8tKFxcZCspJC8pO1xyXG4gICAgaWYgKGluZm8pIHtcclxuICAgICAgICBjb25zdCB0aW1lU3RyID0gQXJyYXkuZnJvbSh0aW1lKTtcclxuICAgICAgICB0aW1lU3RyW2luZm8uaW5kZXghXSA9ICc6JztcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUodGltZVN0ci5qb2luKCcnKSkuZ2V0VGltZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0cmFuc2xhdGUobXNnOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgaWYgKHR5cGVvZiBtc2cgPT09ICdzdHJpbmcnICYmICFtc2cuaW5jbHVkZXMoJ1xcbicpIHx8IHR5cGVvZiBtc2cgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgcmV0dXJuIFN0cmluZyhtc2cpO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBtc2cgPT09ICdzdHJpbmcnICYmIG1zZy5pbmNsdWRlcygnXFxuJykpIHtcclxuICAgICAgICByZXR1cm4gdHJhbnNsYXRlKG1zZy5zcGxpdCgnXFxuJykpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgbXNnID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG1zZykpIHtcclxuICAgICAgICAgICAgbGV0IHJlcyA9ICcnO1xyXG4gICAgICAgICAgICBtc2cuZm9yRWFjaCgoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXMgKz0gYCR7dHJhbnNsYXRlKGRhdGEpfVxccmA7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAobXNnLnN0YWNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNsYXRlKG1zZy5zdGFjayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG1zZyk7XHJcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAvLyBub29wXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1zZyAmJiBtc2cudG9TdHJpbmcgJiYgbXNnLnRvU3RyaW5nKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDojrflj5bmnIDmlrDml7bpl7RcclxuICogQHJldHVybnMgMjAxOS0wMy0yNiAxMTowM1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFJlYWxUaW1lKCkge1xyXG4gICAgY29uc3QgdGltZSA9IG5ldyBEYXRlKCk7XHJcbiAgICByZXR1cm4gdGltZS50b0xvY2FsZURhdGVTdHJpbmcoKS5yZXBsYWNlKC9cXC8vZywgJy0nKSArICcgJyArIHRpbWUudG9UaW1lU3RyaW5nKCkuc2xpY2UoMCwgOCk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBuZXdDb25zb2xlID0gbmV3IE5ld0NvbnNvbGUoKTtcclxuIl19