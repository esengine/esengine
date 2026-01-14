'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitmapHandler = void 0;
const asset_db_1 = require("@cocos/asset-db");
const cc_1 = require("cc");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const image_utils_1 = require("./utils/image-utils");
const utils_1 = require("../utils");
const fnt_parser_1 = __importDefault(require("./utils/fnt-parser"));
/**
 * 获取实际的纹理文件位置
 * @param name
 * @param path
 */
function getRealFntTexturePath(name, asset) {
    // const isWin32Path = name.indexOf(':') !== -1;
    const textureBaseName = (0, path_1.basename)(name);
    // if (isWin32Path) {
    //     textureBaseName = Path.win32.basename(textureName);
    // }
    const texturePath = (0, path_1.join)((0, path_1.dirname)(asset.source), textureBaseName);
    if (!(0, fs_extra_1.existsSync)(texturePath)) {
        console.warn('Parse Error: Unable to find file Texture, the path: ' + texturePath);
    }
    return texturePath;
}
const UserFlags = {
    DoNotNotify: false,
};
exports.BitmapHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'bitmap-font',
    // 编辑器属性上定义的如果是资源的基类类型，此处也需要定义基类类型
    // 不会影响实际资源类型
    assetType: 'cc.BitmapFont',
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.6',
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
            // 解析文字文件
            const fntData = await (0, fs_extra_1.readFile)(asset.source, 'utf8');
            let fntConfig;
            try {
                fntConfig = fnt_parser_1.default.parseFnt(fntData);
            }
            catch (error) {
                console.error(error);
                throw new Error(`BitmapFont import failed: ${asset.uuid} file parsing failed`);
            }
            // 缓存 fnt 配置
            asset.userData._fntConfig = fntConfig;
            // 如果文字尺寸不存在的话，不需要导入
            if (!fntConfig.fontSize) {
                console.error(`BitmapFont import failed: ${asset.uuid} file parsing failed, There is no 'fontSize' in the configuration.`);
                return false;
            }
            asset.userData.fontSize = fntConfig.fontSize;
            // 标记依赖资源
            const texturePath = getRealFntTexturePath(fntConfig.atlasName, asset);
            asset.depend(texturePath);
            const textureUuid = asset._assetDB.pathToUuid(texturePath);
            if (!textureUuid) {
                return false;
            }
            // 挂载 textureUuid
            asset.userData.textureUuid = textureUuid;
            // 如果依赖的资源已经导入完成了，则生成对应的数据，并且
            if (asset.userData.textureUuid) {
                const textureAsset = (0, asset_db_1.queryAsset)(asset.userData.textureUuid);
                if (!textureAsset) {
                    return false;
                }
                (0, image_utils_1.changeImageDefaultType)(textureAsset, 'sprite-frame');
                const bitmap = createBitmapFnt(asset);
                bitmap.spriteFrame = EditorExtends.serialize.asAsset(textureAsset.uuid + '@f9941', cc_1.SpriteFrame);
                const serializeJSON = EditorExtends.serialize(bitmap);
                await asset.saveToLibrary('.json', serializeJSON);
                const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
                asset.setData('depends', depends);
            }
            return true;
        },
    },
    /**
     * 判断是否允许使用当前的 Handler 进行导入
     * @param asset
     */
    async validate(asset) {
        return true;
    },
};
exports.default = exports.BitmapHandler;
/**
 * 创建一个 Bitmap 实例对象
 * @param asset
 */
function createBitmapFnt(asset) {
    // @ts-ignore
    const bitmap = new cc.BitmapFont();
    bitmap.name = (0, path_1.basename)(asset.source, asset.extname);
    // 3.5 再改
    bitmap.name = asset.basename || '';
    bitmap.fontSize = asset.userData.fontSize;
    bitmap.fntConfig = asset.userData._fntConfig;
    return bitmap;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYml0bWFwLWZvbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvYml0bWFwLWZvbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7QUFFYiw4Q0FBb0Q7QUFDcEQsMkJBQWlDO0FBQ2pDLHVDQUFnRDtBQUNoRCwrQkFBK0M7QUFDL0MscURBQTZEO0FBRTdELG9DQUE2QztBQUc3QyxvRUFBMkM7QUFFM0M7Ozs7R0FJRztBQUNILFNBQVMscUJBQXFCLENBQUMsSUFBWSxFQUFFLEtBQVk7SUFDckQsZ0RBQWdEO0lBQ2hELE1BQU0sZUFBZSxHQUFHLElBQUEsZUFBUSxFQUFDLElBQUksQ0FBQyxDQUFDO0lBRXZDLHFCQUFxQjtJQUNyQiwwREFBMEQ7SUFDMUQsSUFBSTtJQUNKLE1BQU0sV0FBVyxHQUFHLElBQUEsV0FBSSxFQUFDLElBQUEsY0FBTyxFQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUVqRSxJQUFJLENBQUMsSUFBQSxxQkFBVSxFQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7UUFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxzREFBc0QsR0FBRyxXQUFXLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBQ0QsT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQztBQUVELE1BQU0sU0FBUyxHQUFHO0lBQ2QsV0FBVyxFQUFFLEtBQUs7Q0FDckIsQ0FBQztBQUVXLFFBQUEsYUFBYSxHQUFpQjtJQUN2QyxnQ0FBZ0M7SUFDaEMsSUFBSSxFQUFFLGFBQWE7SUFFbkIsa0NBQWtDO0lBQ2xDLGFBQWE7SUFDYixTQUFTLEVBQUUsZUFBZTtJQUUxQixRQUFRLEVBQUU7UUFDTixtQkFBbUI7UUFDbkIsT0FBTyxFQUFFLE9BQU87UUFDaEI7Ozs7Ozs7O1dBUUc7UUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLEtB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LGVBQVEsRUFBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwRCxTQUFTO0lBQ1QsTUFBTSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQztJQUVuQyxNQUFNLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0lBQzFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7SUFFN0MsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IEFzc2V0LCBxdWVyeUFzc2V0IH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0IHsgU3ByaXRlRnJhbWUgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBiYXNlbmFtZSwgZGlybmFtZSwgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBjaGFuZ2VJbWFnZURlZmF1bHRUeXBlIH0gZnJvbSAnLi91dGlscy9pbWFnZS11dGlscyc7XHJcblxyXG5pbXBvcnQgeyBnZXREZXBlbmRVVUlETGlzdCB9IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcblxyXG5pbXBvcnQgZm50UGFyc2VyIGZyb20gJy4vdXRpbHMvZm50LXBhcnNlcic7XHJcblxyXG4vKipcclxuICog6I635Y+W5a6e6ZmF55qE57q555CG5paH5Lu25L2N572uXHJcbiAqIEBwYXJhbSBuYW1lXHJcbiAqIEBwYXJhbSBwYXRoXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRSZWFsRm50VGV4dHVyZVBhdGgobmFtZTogc3RyaW5nLCBhc3NldDogQXNzZXQpIHtcclxuICAgIC8vIGNvbnN0IGlzV2luMzJQYXRoID0gbmFtZS5pbmRleE9mKCc6JykgIT09IC0xO1xyXG4gICAgY29uc3QgdGV4dHVyZUJhc2VOYW1lID0gYmFzZW5hbWUobmFtZSk7XHJcblxyXG4gICAgLy8gaWYgKGlzV2luMzJQYXRoKSB7XHJcbiAgICAvLyAgICAgdGV4dHVyZUJhc2VOYW1lID0gUGF0aC53aW4zMi5iYXNlbmFtZSh0ZXh0dXJlTmFtZSk7XHJcbiAgICAvLyB9XHJcbiAgICBjb25zdCB0ZXh0dXJlUGF0aCA9IGpvaW4oZGlybmFtZShhc3NldC5zb3VyY2UpLCB0ZXh0dXJlQmFzZU5hbWUpO1xyXG5cclxuICAgIGlmICghZXhpc3RzU3luYyh0ZXh0dXJlUGF0aCkpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ1BhcnNlIEVycm9yOiBVbmFibGUgdG8gZmluZCBmaWxlIFRleHR1cmUsIHRoZSBwYXRoOiAnICsgdGV4dHVyZVBhdGgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRleHR1cmVQYXRoO1xyXG59XHJcblxyXG5jb25zdCBVc2VyRmxhZ3MgPSB7XHJcbiAgICBEb05vdE5vdGlmeTogZmFsc2UsXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgQml0bWFwSGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICdiaXRtYXAtZm9udCcsXHJcblxyXG4gICAgLy8g57yW6L6R5Zmo5bGe5oCn5LiK5a6a5LmJ55qE5aaC5p6c5piv6LWE5rqQ55qE5Z+657G757G75Z6L77yM5q2k5aSE5Lmf6ZyA6KaB5a6a5LmJ5Z+657G757G75Z6LXHJcbiAgICAvLyDkuI3kvJrlvbHlk43lrp7pmYXotYTmupDnsbvlnotcclxuICAgIGFzc2V0VHlwZTogJ2NjLkJpdG1hcEZvbnQnLFxyXG5cclxuICAgIGltcG9ydGVyOiB7XHJcbiAgICAgICAgLy8g54mI5pys5Y+35aaC5p6c5Y+Y5pu077yM5YiZ5Lya5by65Yi26YeN5paw5a+85YWlXHJcbiAgICAgICAgdmVyc2lvbjogJzEuMC42JyxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlrp7pmYXlr7zlhaXmtYHnqItcclxuICAgICAgICAgKiDpnIDopoHoh6rlt7HmjqfliLbmmK/lkKbnlJ/miJDjgIHmi7fotJ3mlofku7ZcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIOi/lOWbnuaYr+WQpuWvvOWFpeaIkOWKn+eahOagh+iusFxyXG4gICAgICAgICAqIOWmguaenOi/lOWbniBmYWxzZe+8jOWImSBpbXBvcnRlZCDmoIforrDkuI3kvJrlj5jmiJAgdHJ1ZVxyXG4gICAgICAgICAqIOWQjue7reeahOS4gOezu+WIl+aTjeS9nOmDveS4jeS8muaJp+ihjFxyXG4gICAgICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFzeW5jIGltcG9ydChhc3NldDogQXNzZXQpIHtcclxuICAgICAgICAgICAgLy8g6Kej5p6Q5paH5a2X5paH5Lu2XHJcbiAgICAgICAgICAgIGNvbnN0IGZudERhdGEgPSBhd2FpdCByZWFkRmlsZShhc3NldC5zb3VyY2UsICd1dGY4Jyk7XHJcbiAgICAgICAgICAgIGxldCBmbnRDb25maWc7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmbnRDb25maWcgPSBmbnRQYXJzZXIucGFyc2VGbnQoZm50RGF0YSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQml0bWFwRm9udCBpbXBvcnQgZmFpbGVkOiAke2Fzc2V0LnV1aWR9IGZpbGUgcGFyc2luZyBmYWlsZWRgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8g57yT5a2YIGZudCDphY3nva5cclxuICAgICAgICAgICAgYXNzZXQudXNlckRhdGEuX2ZudENvbmZpZyA9IGZudENvbmZpZztcclxuXHJcbiAgICAgICAgICAgIC8vIOWmguaenOaWh+Wtl+WwuuWvuOS4jeWtmOWcqOeahOivne+8jOS4jemcgOimgeWvvOWFpVxyXG4gICAgICAgICAgICBpZiAoIWZudENvbmZpZy5mb250U2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQml0bWFwRm9udCBpbXBvcnQgZmFpbGVkOiAke2Fzc2V0LnV1aWR9IGZpbGUgcGFyc2luZyBmYWlsZWQsIFRoZXJlIGlzIG5vICdmb250U2l6ZScgaW4gdGhlIGNvbmZpZ3VyYXRpb24uYCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGFzc2V0LnVzZXJEYXRhLmZvbnRTaXplID0gZm50Q29uZmlnLmZvbnRTaXplO1xyXG5cclxuICAgICAgICAgICAgLy8g5qCH6K6w5L6d6LWW6LWE5rqQXHJcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmVQYXRoID0gZ2V0UmVhbEZudFRleHR1cmVQYXRoKGZudENvbmZpZy5hdGxhc05hbWUgYXMgc3RyaW5nLCBhc3NldCk7XHJcbiAgICAgICAgICAgIGFzc2V0LmRlcGVuZCh0ZXh0dXJlUGF0aCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmVVdWlkID0gYXNzZXQuX2Fzc2V0REIucGF0aFRvVXVpZCh0ZXh0dXJlUGF0aCk7XHJcbiAgICAgICAgICAgIGlmICghdGV4dHVyZVV1aWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8g5oyC6L29IHRleHR1cmVVdWlkXHJcbiAgICAgICAgICAgIGFzc2V0LnVzZXJEYXRhLnRleHR1cmVVdWlkID0gdGV4dHVyZVV1aWQ7XHJcblxyXG4gICAgICAgICAgICAvLyDlpoLmnpzkvp3otZbnmoTotYTmupDlt7Lnu4/lr7zlhaXlrozmiJDkuobvvIzliJnnlJ/miJDlr7nlupTnmoTmlbDmja7vvIzlubbkuJRcclxuICAgICAgICAgICAgaWYgKGFzc2V0LnVzZXJEYXRhLnRleHR1cmVVdWlkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0dXJlQXNzZXQgPSBxdWVyeUFzc2V0KGFzc2V0LnVzZXJEYXRhLnRleHR1cmVVdWlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRleHR1cmVBc3NldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VJbWFnZURlZmF1bHRUeXBlKHRleHR1cmVBc3NldCwgJ3Nwcml0ZS1mcmFtZScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGJpdG1hcCA9IGNyZWF0ZUJpdG1hcEZudChhc3NldCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYml0bWFwLnNwcml0ZUZyYW1lID0gRWRpdG9yRXh0ZW5kcy5zZXJpYWxpemUuYXNBc3NldCh0ZXh0dXJlQXNzZXQudXVpZCArICdAZjk5NDEnLCBTcHJpdGVGcmFtZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplSlNPTiA9IEVkaXRvckV4dGVuZHMuc2VyaWFsaXplKGJpdG1hcCk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBhc3NldC5zYXZlVG9MaWJyYXJ5KCcuanNvbicsIHNlcmlhbGl6ZUpTT04pO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGRlcGVuZHMgPSBnZXREZXBlbmRVVUlETGlzdChzZXJpYWxpemVKU09OKTtcclxuICAgICAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBkZXBlbmRzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIpOaWreaYr+WQpuWFgeiuuOS9v+eUqOW9k+WJjeeahCBIYW5kbGVyIOi/m+ihjOWvvOWFpVxyXG4gICAgICogQHBhcmFtIGFzc2V0XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHZhbGlkYXRlKGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJpdG1hcEhhbmRsZXI7XHJcblxyXG4vKipcclxuICog5Yib5bu65LiA5LiqIEJpdG1hcCDlrp7kvovlr7nosaFcclxuICogQHBhcmFtIGFzc2V0XHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVCaXRtYXBGbnQoYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICBjb25zdCBiaXRtYXAgPSBuZXcgY2MuQml0bWFwRm9udCgpO1xyXG4gICAgYml0bWFwLm5hbWUgPSBiYXNlbmFtZShhc3NldC5zb3VyY2UsIGFzc2V0LmV4dG5hbWUpO1xyXG4gICAgLy8gMy41IOWGjeaUuVxyXG4gICAgYml0bWFwLm5hbWUgPSBhc3NldC5iYXNlbmFtZSB8fCAnJztcclxuXHJcbiAgICBiaXRtYXAuZm9udFNpemUgPSBhc3NldC51c2VyRGF0YS5mb250U2l6ZTtcclxuICAgIGJpdG1hcC5mbnRDb25maWcgPSBhc3NldC51c2VyRGF0YS5fZm50Q29uZmlnO1xyXG5cclxuICAgIHJldHVybiBiaXRtYXA7XHJcbn1cclxuIl19