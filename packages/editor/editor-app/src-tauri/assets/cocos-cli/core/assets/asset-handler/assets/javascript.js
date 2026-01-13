"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavascriptHandler = void 0;
const asset_db_1 = require("@cocos/asset-db");
const fs_extra_1 = require("fs-extra");
const script_compiler_1 = require("./utils/script-compiler");
const utils_1 = require("../utils");
const scripting_1 = __importDefault(require("../../../scripting"));
const asset_1 = require("@cocos/asset-db/libs/asset");
exports.JavascriptHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'javascript',
    // 引擎内对应的类型
    assetType: 'cc.Script',
    open: utils_1.openCode,
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '4.0.24',
        /**
         * 实际导入流程
         * 需要自己控制是否生成、拷贝文件
         *
         * 返回是否导入成功的标记
         * 如果返回 false，则 imported 标记不会变成 true
         * 后续的一系列操作都不会执行
         * @param asset
         */
        async import(asset) {
            if (!(asset instanceof asset_db_1.Asset)) {
                console.error('Expect non-virtual asset');
                return false;
            }
            const userData = asset.userData;
            try {
                if (userData.isPlugin) {
                    return await _importPluginScript(asset);
                }
                else {
                    await scripting_1.default.compileScripts([{
                            type: asset.action,
                            uuid: asset.uuid,
                            filePath: asset.source,
                            importer: asset.meta.importer,
                            userData: asset.meta.userData,
                        }]);
                    return true;
                }
            }
            catch (error) {
                console.error(`Failed to import script ${asset.source}`);
                throw error;
            }
        },
    },
    async destroy(asset) {
        scripting_1.default.dispatchAssetChange({
            type: asset_1.AssetActionEnum.delete,
            uuid: asset.uuid,
            filePath: asset.source,
            importer: asset.meta.importer,
            userData: asset.meta.userData,
        });
        try {
            await scripting_1.default.compileScripts();
        }
        catch {
            //
        }
    },
};
exports.default = exports.JavascriptHandler;
async function _importPluginScript(asset) {
    // https://mathiasbynens.be/notes/globalthis
    const code = await (0, fs_extra_1.readFile)(asset.source, 'utf-8');
    // 填写默认的插件导入选项
    const { executionScope = 'enclosed', experimentalHideCommonJs, experimentalHideAmd, simulateGlobals, } = asset.userData;
    const defaultUserData = {
        isPlugin: true,
        loadPluginInEditor: false,
        loadPluginInWeb: true,
        loadPluginInMiniGame: true,
        loadPluginInNative: true,
    };
    asset.assignUserData(defaultUserData, false);
    if (executionScope === 'global') {
        await asset.saveToLibrary('.js', code);
        return true;
    }
    const simulateGlobalNames = simulateGlobals === undefined ? ['self', 'window', 'global', 'globalThis'] : simulateGlobals;
    const transformed = await (0, script_compiler_1.transformPluginScript)(code, {
        simulateGlobals: simulateGlobalNames,
        hideCommonJs: experimentalHideCommonJs ?? true,
        hideAmd: experimentalHideAmd ?? true,
    });
    await asset.saveToLibrary('.js', transformed.code);
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamF2YXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy9qYXZhc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDhDQUFzRDtBQUN0RCx1Q0FBb0M7QUFDcEMsNkRBQWdFO0FBQ2hFLG9DQUFvQztBQUdwQyxtRUFBMkM7QUFDM0Msc0RBQTZEO0FBRWhELFFBQUEsaUJBQWlCLEdBQXFCO0lBQy9DLGdDQUFnQztJQUNoQyxJQUFJLEVBQUUsWUFBWTtJQUVsQixXQUFXO0lBQ1gsU0FBUyxFQUFFLFdBQVc7SUFFdEIsSUFBSSxFQUFFLGdCQUFRO0lBRWQsUUFBUSxFQUFFO1FBQ04sbUJBQW1CO1FBQ25CLE9BQU8sRUFBRSxRQUFRO1FBRWpCOzs7Ozs7OztXQVFHO1FBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUEyQjtZQUNwQyxJQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksZ0JBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztnQkFDMUMsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztZQUVELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFtQyxDQUFDO1lBQzNELElBQUksQ0FBQztnQkFDRCxJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDcEIsT0FBTyxNQUFNLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM1QyxDQUFDO3FCQUFNLENBQUM7b0JBQ0osTUFBTSxtQkFBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDOzRCQUM1QixJQUFJLEVBQUUsS0FBSyxDQUFDLE1BQU07NEJBQ2xCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTs0QkFDaEIsUUFBUSxFQUFFLEtBQUssQ0FBQyxNQUFNOzRCQUN0QixRQUFRLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFROzRCQUM3QixRQUFRLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRO3lCQUNoQyxDQUFDLENBQUMsQ0FBQztvQkFDSixPQUFPLElBQUksQ0FBQztnQkFDaEIsQ0FBQztZQUNMLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLEtBQUssQ0FBQztZQUNoQixDQUFDO1FBQ0wsQ0FBQztLQUNKO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUEyQjtRQUNyQyxtQkFBUyxDQUFDLG1CQUFtQixDQUFDO1lBQzFCLElBQUksRUFBRSx1QkFBZSxDQUFDLE1BQU07WUFDNUIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO1lBQ2hCLFFBQVEsRUFBRSxLQUFLLENBQUMsTUFBTTtZQUN0QixRQUFRLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRO1lBQzdCLFFBQVEsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVE7U0FDaEMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDO1lBQ0QsTUFBTSxtQkFBUyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3JDLENBQUM7UUFBQyxNQUFNLENBQUM7WUFDTCxFQUFFO1FBQ04sQ0FBQztJQUVMLENBQUM7Q0FDSixDQUFDO0FBRUYsa0JBQWUseUJBQWlCLENBQUM7QUFFakMsS0FBSyxVQUFVLG1CQUFtQixDQUFDLEtBQVk7SUFDM0MsNENBQTRDO0lBQzVDLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSxtQkFBUSxFQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFbkQsY0FBYztJQUNkLE1BQU0sRUFDRixjQUFjLEdBQUcsVUFBVSxFQUMzQix3QkFBd0IsRUFDeEIsbUJBQW1CLEVBQ25CLGVBQWUsR0FDbEIsR0FBRyxLQUFLLENBQUMsUUFBZ0MsQ0FBQztJQUUzQyxNQUFNLGVBQWUsR0FBeUI7UUFDMUMsUUFBUSxFQUFFLElBQUk7UUFDZCxrQkFBa0IsRUFBRSxLQUFLO1FBQ3pCLGVBQWUsRUFBRSxJQUFJO1FBQ3JCLG9CQUFvQixFQUFFLElBQUk7UUFDMUIsa0JBQWtCLEVBQUUsSUFBSTtLQUMzQixDQUFDO0lBRUYsS0FBSyxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFN0MsSUFBSSxjQUFjLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDOUIsTUFBTSxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2QyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsTUFBTSxtQkFBbUIsR0FBYSxlQUFlLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUM7SUFFbkksTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFBLHVDQUFxQixFQUFDLElBQUksRUFBRTtRQUNsRCxlQUFlLEVBQUUsbUJBQW1CO1FBQ3BDLFlBQVksRUFBRSx3QkFBd0IsSUFBSSxJQUFJO1FBQzlDLE9BQU8sRUFBRSxtQkFBbUIsSUFBSSxJQUFJO0tBQ3ZDLENBQUMsQ0FBQztJQUVILE1BQU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25ELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBc3NldCwgVmlydHVhbEFzc2V0IH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0IHsgcmVhZEZpbGUgfSBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCB7IHRyYW5zZm9ybVBsdWdpblNjcmlwdCB9IGZyb20gJy4vdXRpbHMvc2NyaXB0LWNvbXBpbGVyJztcclxuaW1wb3J0IHsgb3BlbkNvZGUgfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB7IEFzc2V0SGFuZGxlckJhc2UgfSBmcm9tICcuLi8uLi9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IHsgSmF2YVNjcmlwdEFzc2V0VXNlckRhdGEsIFBsdWdpblNjcmlwdFVzZXJEYXRhIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3VzZXJEYXRhcyc7XHJcbmltcG9ydCBzY3JpcHRpbmcgZnJvbSAnLi4vLi4vLi4vc2NyaXB0aW5nJztcclxuaW1wb3J0IHsgQXNzZXRBY3Rpb25FbnVtIH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiL2xpYnMvYXNzZXQnO1xyXG5cclxuZXhwb3J0IGNvbnN0IEphdmFzY3JpcHRIYW5kbGVyOiBBc3NldEhhbmRsZXJCYXNlID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICdqYXZhc2NyaXB0JyxcclxuXHJcbiAgICAvLyDlvJXmk47lhoXlr7nlupTnmoTnsbvlnotcclxuICAgIGFzc2V0VHlwZTogJ2NjLlNjcmlwdCcsXHJcblxyXG4gICAgb3Blbjogb3BlbkNvZGUsXHJcblxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICAvLyDniYjmnKzlj7flpoLmnpzlj5jmm7TvvIzliJnkvJrlvLrliLbph43mlrDlr7zlhaVcclxuICAgICAgICB2ZXJzaW9uOiAnNC4wLjI0JyxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5a6e6ZmF5a+85YWl5rWB56iLXHJcbiAgICAgICAgICog6ZyA6KaB6Ieq5bex5o6n5Yi25piv5ZCm55Sf5oiQ44CB5ou36LSd5paH5Lu2XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiDov5Tlm57mmK/lkKblr7zlhaXmiJDlip/nmoTmoIforrBcclxuICAgICAgICAgKiDlpoLmnpzov5Tlm54gZmFsc2XvvIzliJkgaW1wb3J0ZWQg5qCH6K6w5LiN5Lya5Y+Y5oiQIHRydWVcclxuICAgICAgICAgKiDlkI7nu63nmoTkuIDns7vliJfmk43kvZzpg73kuI3kvJrmiafooYxcclxuICAgICAgICAgKiBAcGFyYW0gYXNzZXRcclxuICAgICAgICAgKi9cclxuICAgICAgICBhc3luYyBpbXBvcnQoYXNzZXQ6IEFzc2V0IHwgVmlydHVhbEFzc2V0KSB7XHJcbiAgICAgICAgICAgIGlmICghKGFzc2V0IGluc3RhbmNlb2YgQXNzZXQpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFeHBlY3Qgbm9uLXZpcnR1YWwgYXNzZXQnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgdXNlckRhdGEgPSBhc3NldC51c2VyRGF0YSBhcyBKYXZhU2NyaXB0QXNzZXRVc2VyRGF0YTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGlmICh1c2VyRGF0YS5pc1BsdWdpbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBfaW1wb3J0UGx1Z2luU2NyaXB0KGFzc2V0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgc2NyaXB0aW5nLmNvbXBpbGVTY3JpcHRzKFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGFzc2V0LmFjdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXVpZDogYXNzZXQudXVpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGFzc2V0LnNvdXJjZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1wb3J0ZXI6IGFzc2V0Lm1ldGEuaW1wb3J0ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJEYXRhOiBhc3NldC5tZXRhLnVzZXJEYXRhLFxyXG4gICAgICAgICAgICAgICAgICAgIH1dKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byBpbXBvcnQgc2NyaXB0ICR7YXNzZXQuc291cmNlfWApO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuXHJcbiAgICBhc3luYyBkZXN0cm95KGFzc2V0OiBBc3NldCB8IFZpcnR1YWxBc3NldCkge1xyXG4gICAgICAgIHNjcmlwdGluZy5kaXNwYXRjaEFzc2V0Q2hhbmdlKHtcclxuICAgICAgICAgICAgdHlwZTogQXNzZXRBY3Rpb25FbnVtLmRlbGV0ZSxcclxuICAgICAgICAgICAgdXVpZDogYXNzZXQudXVpZCxcclxuICAgICAgICAgICAgZmlsZVBhdGg6IGFzc2V0LnNvdXJjZSxcclxuICAgICAgICAgICAgaW1wb3J0ZXI6IGFzc2V0Lm1ldGEuaW1wb3J0ZXIsXHJcbiAgICAgICAgICAgIHVzZXJEYXRhOiBhc3NldC5tZXRhLnVzZXJEYXRhLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHNjcmlwdGluZy5jb21waWxlU2NyaXB0cygpO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAvL1xyXG4gICAgICAgIH0gXHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgSmF2YXNjcmlwdEhhbmRsZXI7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBfaW1wb3J0UGx1Z2luU2NyaXB0KGFzc2V0OiBBc3NldCkge1xyXG4gICAgLy8gaHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2dsb2JhbHRoaXNcclxuICAgIGNvbnN0IGNvZGUgPSBhd2FpdCByZWFkRmlsZShhc3NldC5zb3VyY2UsICd1dGYtOCcpO1xyXG5cclxuICAgIC8vIOWhq+WGmem7mOiupOeahOaPkuS7tuWvvOWFpemAiemhuVxyXG4gICAgY29uc3Qge1xyXG4gICAgICAgIGV4ZWN1dGlvblNjb3BlID0gJ2VuY2xvc2VkJyxcclxuICAgICAgICBleHBlcmltZW50YWxIaWRlQ29tbW9uSnMsXHJcbiAgICAgICAgZXhwZXJpbWVudGFsSGlkZUFtZCxcclxuICAgICAgICBzaW11bGF0ZUdsb2JhbHMsXHJcbiAgICB9ID0gYXNzZXQudXNlckRhdGEgYXMgUGx1Z2luU2NyaXB0VXNlckRhdGE7XHJcblxyXG4gICAgY29uc3QgZGVmYXVsdFVzZXJEYXRhOiBQbHVnaW5TY3JpcHRVc2VyRGF0YSA9IHtcclxuICAgICAgICBpc1BsdWdpbjogdHJ1ZSxcclxuICAgICAgICBsb2FkUGx1Z2luSW5FZGl0b3I6IGZhbHNlLFxyXG4gICAgICAgIGxvYWRQbHVnaW5JbldlYjogdHJ1ZSxcclxuICAgICAgICBsb2FkUGx1Z2luSW5NaW5pR2FtZTogdHJ1ZSxcclxuICAgICAgICBsb2FkUGx1Z2luSW5OYXRpdmU6IHRydWUsXHJcbiAgICB9O1xyXG5cclxuICAgIGFzc2V0LmFzc2lnblVzZXJEYXRhKGRlZmF1bHRVc2VyRGF0YSwgZmFsc2UpO1xyXG5cclxuICAgIGlmIChleGVjdXRpb25TY29wZSA9PT0gJ2dsb2JhbCcpIHtcclxuICAgICAgICBhd2FpdCBhc3NldC5zYXZlVG9MaWJyYXJ5KCcuanMnLCBjb2RlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzaW11bGF0ZUdsb2JhbE5hbWVzOiBzdHJpbmdbXSA9IHNpbXVsYXRlR2xvYmFscyA9PT0gdW5kZWZpbmVkID8gWydzZWxmJywgJ3dpbmRvdycsICdnbG9iYWwnLCAnZ2xvYmFsVGhpcyddIDogc2ltdWxhdGVHbG9iYWxzO1xyXG5cclxuICAgIGNvbnN0IHRyYW5zZm9ybWVkID0gYXdhaXQgdHJhbnNmb3JtUGx1Z2luU2NyaXB0KGNvZGUsIHtcclxuICAgICAgICBzaW11bGF0ZUdsb2JhbHM6IHNpbXVsYXRlR2xvYmFsTmFtZXMsXHJcbiAgICAgICAgaGlkZUNvbW1vbkpzOiBleHBlcmltZW50YWxIaWRlQ29tbW9uSnMgPz8gdHJ1ZSxcclxuICAgICAgICBoaWRlQW1kOiBleHBlcmltZW50YWxIaWRlQW1kID8/IHRydWUsXHJcbiAgICB9KTtcclxuXHJcbiAgICBhd2FpdCBhc3NldC5zYXZlVG9MaWJyYXJ5KCcuanMnLCB0cmFuc2Zvcm1lZC5jb2RlKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcbiJdfQ==