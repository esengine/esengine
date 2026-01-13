"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetDBManager = exports.assetManager = void 0;
exports.startupAssetDB = startupAssetDB;
/**
 * 资源导入、构建的对外调度，后续可能移除
 */
const console_1 = require("../base/console");
const asset_db_1 = __importDefault(require("./manager/asset-db"));
const asset_1 = __importDefault(require("./manager/asset"));
const asset_config_1 = __importDefault(require("./asset-config"));
/**
 * 启动资源数据库，依赖于 project, engine 的初始化
 */
async function startupAssetDB() {
    try {
        // @ts-ignore HACK 目前引擎有在一些资源序列化会调用的接口里使用这个变量，没有合理的传参之前需要临时设置兼容
        globalThis.Build = true;
        await asset_config_1.default.init();
        console_1.newConsole.trackMemoryStart('assets:worker-init');
        await asset_1.default.init();
        await asset_db_1.default.init();
        console_1.newConsole.trackMemoryEnd('asset-db:worker-init');
        await asset_db_1.default.start();
    }
    catch (error) {
        console_1.newConsole.error('Init asset worker failed!');
        console_1.newConsole.error(error);
        throw error;
    }
}
var asset_2 = require("./manager/asset");
Object.defineProperty(exports, "assetManager", { enumerable: true, get: function () { return __importDefault(asset_2).default; } });
var asset_db_2 = require("./manager/asset-db");
Object.defineProperty(exports, "assetDBManager", { enumerable: true, get: function () { return __importDefault(asset_db_2).default; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBV0Esd0NBZUM7QUExQkQ7O0dBRUc7QUFDSCw2Q0FBNkM7QUFDN0Msa0VBQWdEO0FBQ2hELDREQUEyQztBQUMzQyxrRUFBeUM7QUFFekM7O0dBRUc7QUFDSSxLQUFLLFVBQVUsY0FBYztJQUNoQyxJQUFJLENBQUM7UUFDRCwrREFBK0Q7UUFDL0QsVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDeEIsTUFBTSxzQkFBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3pCLG9CQUFVLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNsRCxNQUFNLGVBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMxQixNQUFNLGtCQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDNUIsb0JBQVUsQ0FBQyxjQUFjLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNsRCxNQUFNLGtCQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDbEIsb0JBQVUsQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUM5QyxvQkFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QixNQUFNLEtBQUssQ0FBQztJQUNoQixDQUFDO0FBQ0wsQ0FBQztBQUVELHlDQUEwRDtBQUFqRCxzSEFBQSxPQUFPLE9BQWdCO0FBQ2hDLCtDQUErRDtBQUF0RCwySEFBQSxPQUFPLE9BQWtCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIOi1hOa6kOWvvOWFpeOAgeaehOW7uueahOWvueWkluiwg+W6pu+8jOWQjue7reWPr+iDveenu+mZpFxyXG4gKi9cclxuaW1wb3J0IHsgbmV3Q29uc29sZSB9IGZyb20gJy4uL2Jhc2UvY29uc29sZSc7XHJcbmltcG9ydCBhc3NldERCTWFuYWdlciBmcm9tICcuL21hbmFnZXIvYXNzZXQtZGInO1xyXG5pbXBvcnQgYXNzZXRNYW5hZ2VyIGZyb20gJy4vbWFuYWdlci9hc3NldCc7XHJcbmltcG9ydCBhc3NldENvbmZpZyBmcm9tICcuL2Fzc2V0LWNvbmZpZyc7XHJcblxyXG4vKipcclxuICog5ZCv5Yqo6LWE5rqQ5pWw5o2u5bqT77yM5L6d6LWW5LqOIHByb2plY3QsIGVuZ2luZSDnmoTliJ3lp4vljJZcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydHVwQXNzZXREQigpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBIQUNLIOebruWJjeW8leaTjuacieWcqOS4gOS6m+i1hOa6kOW6j+WIl+WMluS8muiwg+eUqOeahOaOpeWPo+mHjOS9v+eUqOi/meS4quWPmOmHj++8jOayoeacieWQiOeQhueahOS8oOWPguS5i+WJjemcgOimgeS4tOaXtuiuvue9ruWFvOWuuVxyXG4gICAgICAgIGdsb2JhbFRoaXMuQnVpbGQgPSB0cnVlO1xyXG4gICAgICAgIGF3YWl0IGFzc2V0Q29uZmlnLmluaXQoKTtcclxuICAgICAgICBuZXdDb25zb2xlLnRyYWNrTWVtb3J5U3RhcnQoJ2Fzc2V0czp3b3JrZXItaW5pdCcpO1xyXG4gICAgICAgIGF3YWl0IGFzc2V0TWFuYWdlci5pbml0KCk7XHJcbiAgICAgICAgYXdhaXQgYXNzZXREQk1hbmFnZXIuaW5pdCgpO1xyXG4gICAgICAgIG5ld0NvbnNvbGUudHJhY2tNZW1vcnlFbmQoJ2Fzc2V0LWRiOndvcmtlci1pbml0Jyk7XHJcbiAgICAgICAgYXdhaXQgYXNzZXREQk1hbmFnZXIuc3RhcnQoKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICBuZXdDb25zb2xlLmVycm9yKCdJbml0IGFzc2V0IHdvcmtlciBmYWlsZWQhJyk7XHJcbiAgICAgICAgbmV3Q29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgYXNzZXRNYW5hZ2VyIH0gZnJvbSAnLi9tYW5hZ2VyL2Fzc2V0JztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBhc3NldERCTWFuYWdlciB9IGZyb20gJy4vbWFuYWdlci9hc3NldC1kYic7XHJcbiJdfQ==