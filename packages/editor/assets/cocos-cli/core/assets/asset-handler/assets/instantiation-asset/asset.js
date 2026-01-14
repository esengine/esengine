'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstantiationAssetHandler = void 0;
exports.zip = zip;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const utils_1 = __importDefault(require("../../../../base/utils"));
const global_1 = require("../../../../../global");
exports.InstantiationAssetHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'instantiation-asset',
    // 引擎内对应的类型
    assetType: 'cc.Asset',
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.0',
        /**
         * 实际导入流程
         * 需要自己控制是否生成、拷贝文件
         * @param asset
         */
        async import(asset) {
            const temp = (0, path_1.join)(asset._assetDB.options.temp, asset.uuid);
            const uzipTool = process.platform === 'darwin' ? 'unzip' : (0, path_1.join)(global_1.GlobalPaths.staticDir, 'tools/unzip.exe');
            await utils_1.default.Process.quickSpawn(uzipTool, [asset.source, '-d', temp]);
            const list = (0, fs_extra_1.readdirSync)(temp);
            for (let i = 0; i < list.length; i++) {
                const name = list[i];
                const file = (0, path_1.join)(temp, name);
                await asset.copyToLibrary('.' + name, file);
            }
            if ((0, fs_extra_1.existsSync)(temp)) {
                (0, fs_extra_1.removeSync)(temp);
            }
            return true;
        },
    },
};
exports.default = exports.InstantiationAssetHandler;
/**
 * 创建指定的实例化资源
 * @param target 生成到哪个位置
 * @param files 打包的文件数组
 */
function zip(target, files) {
    const archiver = require('archiver');
    const output = (0, fs_extra_1.createWriteStream)(target);
    const archive = archiver('zip');
    archive.on('error', (error) => {
        throw error;
    });
    archive.pipe(output);
    files.forEach((file) => {
        const nameItem = (0, path_1.parse)(file);
        archive.append((0, fs_extra_1.createReadStream)(file), { name: nameItem.ext.substr(1) });
    });
    archive.finalize();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvaW5zdGFudGlhdGlvbi1hc3NldC9hc3NldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7OztBQXVEYixrQkFpQkM7QUFwRUQsdUNBQW1IO0FBQ25ILCtCQUE0QztBQUM1QyxtRUFBMkM7QUFDM0Msa0RBQW9EO0FBRXZDLFFBQUEseUJBQXlCLEdBQXFCO0lBQ3ZELGdDQUFnQztJQUNoQyxJQUFJLEVBQUUscUJBQXFCO0lBRTNCLFdBQVc7SUFDWCxTQUFTLEVBQUUsVUFBVTtJQUVyQixRQUFRLEVBQUU7UUFDTixtQkFBbUI7UUFDbkIsT0FBTyxFQUFFLE9BQU87UUFDaEI7Ozs7V0FJRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBWTtZQUNyQixNQUFNLElBQUksR0FBRyxJQUFBLFdBQUksRUFBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTNELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUEsV0FBSSxFQUFDLG9CQUFXLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFFMUcsTUFBTSxlQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXJFLE1BQU0sSUFBSSxHQUFHLElBQUEsc0JBQVcsRUFBQyxJQUFJLENBQUMsQ0FBQztZQUUvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNuQyxNQUFNLElBQUksR0FBVyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLE1BQU0sSUFBSSxHQUFHLElBQUEsV0FBSSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDOUIsTUFBTSxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDaEQsQ0FBQztZQUVELElBQUksSUFBQSxxQkFBVSxFQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ25CLElBQUEscUJBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQztZQUNyQixDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztLQUNKO0NBQ0osQ0FBQztBQUVGLGtCQUFlLGlDQUF5QixDQUFDO0FBRXpDOzs7O0dBSUc7QUFDSCxTQUFnQixHQUFHLENBQUMsTUFBYyxFQUFFLEtBQWU7SUFDL0MsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sTUFBTSxHQUFHLElBQUEsNEJBQWlCLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFDekMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWhDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBWSxFQUFFLEVBQUU7UUFDakMsTUFBTSxLQUFLLENBQUM7SUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXJCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFZLEVBQUUsRUFBRTtRQUMzQixNQUFNLFFBQVEsR0FBRyxJQUFBLFlBQUssRUFBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUEsMkJBQWdCLEVBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzdFLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3ZCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBBc3NldCB9IGZyb20gJ0Bjb2Nvcy9hc3NldC1kYic7XHJcbmltcG9ydCB7IEFzc2V0SGFuZGxlckJhc2UgfSBmcm9tICcuLi8uLi8uLi9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IHsgY3JlYXRlUmVhZFN0cmVhbSwgY3JlYXRlV3JpdGVTdHJlYW0sIGVuc3VyZURpclN5bmMsIGV4aXN0c1N5bmMsIHJlYWRkaXJTeW5jLCByZW1vdmVTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBkaXJuYW1lLCBqb2luLCBwYXJzZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vYmFzZS91dGlscyc7XHJcbmltcG9ydCB7IEdsb2JhbFBhdGhzIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vZ2xvYmFsJztcclxuXHJcbmV4cG9ydCBjb25zdCBJbnN0YW50aWF0aW9uQXNzZXRIYW5kbGVyOiBBc3NldEhhbmRsZXJCYXNlID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICdpbnN0YW50aWF0aW9uLWFzc2V0JyxcclxuXHJcbiAgICAvLyDlvJXmk47lhoXlr7nlupTnmoTnsbvlnotcclxuICAgIGFzc2V0VHlwZTogJ2NjLkFzc2V0JyxcclxuXHJcbiAgICBpbXBvcnRlcjoge1xyXG4gICAgICAgIC8vIOeJiOacrOWPt+WmguaenOWPmOabtO+8jOWImeS8muW8uuWItumHjeaWsOWvvOWFpVxyXG4gICAgICAgIHZlcnNpb246ICcxLjAuMCcsXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5a6e6ZmF5a+85YWl5rWB56iLXHJcbiAgICAgICAgICog6ZyA6KaB6Ieq5bex5o6n5Yi25piv5ZCm55Sf5oiQ44CB5ou36LSd5paH5Lu2XHJcbiAgICAgICAgICogQHBhcmFtIGFzc2V0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXN5bmMgaW1wb3J0KGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wID0gam9pbihhc3NldC5fYXNzZXREQi5vcHRpb25zLnRlbXAsIGFzc2V0LnV1aWQpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgdXppcFRvb2wgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJyA/ICd1bnppcCcgOiBqb2luKEdsb2JhbFBhdGhzLnN0YXRpY0RpciwgJ3Rvb2xzL3VuemlwLmV4ZScpO1xyXG5cclxuICAgICAgICAgICAgYXdhaXQgdXRpbHMuUHJvY2Vzcy5xdWlja1NwYXduKHV6aXBUb29sLCBbYXNzZXQuc291cmNlLCAnLWQnLCB0ZW1wXSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gcmVhZGRpclN5bmModGVtcCk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWU6IHN0cmluZyA9IGxpc3RbaV07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gam9pbih0ZW1wLCBuYW1lKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IGFzc2V0LmNvcHlUb0xpYnJhcnkoJy4nICsgbmFtZSwgZmlsZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChleGlzdHNTeW5jKHRlbXApKSB7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVTeW5jKHRlbXApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEluc3RhbnRpYXRpb25Bc3NldEhhbmRsZXI7XHJcblxyXG4vKipcclxuICog5Yib5bu65oyH5a6a55qE5a6e5L6L5YyW6LWE5rqQXHJcbiAqIEBwYXJhbSB0YXJnZXQg55Sf5oiQ5Yiw5ZOq5Liq5L2N572uXHJcbiAqIEBwYXJhbSBmaWxlcyDmiZPljIXnmoTmlofku7bmlbDnu4RcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB6aXAodGFyZ2V0OiBzdHJpbmcsIGZpbGVzOiBzdHJpbmdbXSkge1xyXG4gICAgY29uc3QgYXJjaGl2ZXIgPSByZXF1aXJlKCdhcmNoaXZlcicpO1xyXG4gICAgY29uc3Qgb3V0cHV0ID0gY3JlYXRlV3JpdGVTdHJlYW0odGFyZ2V0KTtcclxuICAgIGNvbnN0IGFyY2hpdmUgPSBhcmNoaXZlcignemlwJyk7XHJcblxyXG4gICAgYXJjaGl2ZS5vbignZXJyb3InLCAoZXJyb3I6IEVycm9yKSA9PiB7XHJcbiAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9KTtcclxuXHJcbiAgICBhcmNoaXZlLnBpcGUob3V0cHV0KTtcclxuXHJcbiAgICBmaWxlcy5mb3JFYWNoKChmaWxlOiBzdHJpbmcpID0+IHtcclxuICAgICAgICBjb25zdCBuYW1lSXRlbSA9IHBhcnNlKGZpbGUpO1xyXG4gICAgICAgIGFyY2hpdmUuYXBwZW5kKGNyZWF0ZVJlYWRTdHJlYW0oZmlsZSksIHsgbmFtZTogbmFtZUl0ZW0uZXh0LnN1YnN0cigxKSB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGFyY2hpdmUuZmluYWxpemUoKTtcclxufVxyXG4iXX0=