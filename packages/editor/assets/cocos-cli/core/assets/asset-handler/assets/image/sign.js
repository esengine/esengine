"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignImageHandler = void 0;
const utils_1 = require("./utils");
const utils_2 = __importDefault(require("../../../../base/utils"));
exports.SignImageHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'sign-image',
    // 引擎内对应的类型
    assetType: 'cc.ImageAsset',
    iconInfo: {
        default: utils_1.defaultIconConfig,
        generateThumbnail(asset) {
            return {
                type: 'image',
                value: asset.library + '.png',
            };
        },
    },
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.1',
        /**
         * 实际导入流程
         * 需要自己控制是否生成、拷贝文件
         *
         * 返回是否导入成功的 boolean
         * 如果返回 false，则下次启动还会重新导入
         * @param asset
         */
        async import(asset) {
            if (!asset.parent) {
                return false;
            }
            const parent = asset.parent;
            const source = utils_2.default.Path.resolveToRaw(parent.userData.sign);
            Object.assign(asset.userData, parent.userData);
            delete asset.userData.type;
            delete asset.userData.sign;
            asset.userData.isRGBE = false;
            // 为不同导入类型的图片设置伪影的默认值
            if (asset.userData.fixAlphaTransparencyArtifacts === undefined) {
                asset.userData.fixAlphaTransparencyArtifacts = (0, utils_1.isCapableToFixAlphaTransparencyArtifacts)(asset, parent.userData.type, parent.extname);
            }
            const imageDataBufferOrimagePath = await (0, utils_1.handleImageUserData)(asset, source, '.png');
            await (0, utils_1.saveImageAsset)(asset, imageDataBufferOrimagePath, '.png', 'sign');
            await (0, utils_1.importWithType)(asset, parent.userData.type, 'sign', parent.extname);
            return true;
        },
    },
};
exports.default = exports.SignImageHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy9pbWFnZS9zaWduLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBLG1DQUEySTtBQUMzSSxtRUFBMkM7QUFFOUIsUUFBQSxnQkFBZ0IsR0FBaUI7SUFDMUMsZ0NBQWdDO0lBQ2hDLElBQUksRUFBRSxZQUFZO0lBRWxCLFdBQVc7SUFDWCxTQUFTLEVBQUUsZUFBZTtJQUUxQixRQUFRLEVBQUU7UUFDTixPQUFPLEVBQUUseUJBQWlCO1FBQzFCLGlCQUFpQixDQUFDLEtBQVk7WUFDMUIsT0FBTztnQkFDSCxJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNO2FBQ2hDLENBQUM7UUFDTixDQUFDO0tBQ0o7SUFFRCxRQUFRLEVBQUU7UUFDTixtQkFBbUI7UUFDbkIsT0FBTyxFQUFFLE9BQU87UUFDaEI7Ozs7Ozs7V0FPRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBbUI7WUFDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDaEIsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztZQUNELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFlLENBQUM7WUFDckMsTUFBTSxNQUFNLEdBQUcsZUFBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9DLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDM0IsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztZQUMzQixLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFFOUIscUJBQXFCO1lBQ3JCLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDN0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsR0FBRyxJQUFBLGdEQUF3QyxFQUNuRixLQUFLLEVBQ0wsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQ3BCLE1BQU0sQ0FBQyxPQUFPLENBQ2pCLENBQUM7WUFDTixDQUFDO1lBRUQsTUFBTSwwQkFBMEIsR0FBRyxNQUFNLElBQUEsMkJBQW1CLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNwRixNQUFNLElBQUEsc0JBQWMsRUFBQyxLQUFLLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sSUFBQSxzQkFBYyxFQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFFLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FDSjtDQUNKLENBQUM7QUFDRixrQkFBZSx3QkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0LCBWaXJ0dWFsQXNzZXQgfSBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5pbXBvcnQgeyBBc3NldEhhbmRsZXIsIFRodW1ibmFpbEluZm8gfSBmcm9tICcuLi8uLi8uLi9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IHsgZGVmYXVsdEljb25Db25maWcsIGhhbmRsZUltYWdlVXNlckRhdGEsIGltcG9ydFdpdGhUeXBlLCBpc0NhcGFibGVUb0ZpeEFscGhhVHJhbnNwYXJlbmN5QXJ0aWZhY3RzLCBzYXZlSW1hZ2VBc3NldCB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vYmFzZS91dGlscyc7XHJcblxyXG5leHBvcnQgY29uc3QgU2lnbkltYWdlSGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICdzaWduLWltYWdlJyxcclxuXHJcbiAgICAvLyDlvJXmk47lhoXlr7nlupTnmoTnsbvlnotcclxuICAgIGFzc2V0VHlwZTogJ2NjLkltYWdlQXNzZXQnLFxyXG5cclxuICAgIGljb25JbmZvOiB7XHJcbiAgICAgICAgZGVmYXVsdDogZGVmYXVsdEljb25Db25maWcsXHJcbiAgICAgICAgZ2VuZXJhdGVUaHVtYm5haWwoYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGFzc2V0LmxpYnJhcnkgKyAnLnBuZycsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICAvLyDniYjmnKzlj7flpoLmnpzlj5jmm7TvvIzliJnkvJrlvLrliLbph43mlrDlr7zlhaVcclxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjEnLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWunumZheWvvOWFpea1geeoi1xyXG4gICAgICAgICAqIOmcgOimgeiHquW3seaOp+WItuaYr+WQpueUn+aIkOOAgeaLt+i0neaWh+S7tlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICog6L+U5Zue5piv5ZCm5a+85YWl5oiQ5Yqf55qEIGJvb2xlYW5cclxuICAgICAgICAgKiDlpoLmnpzov5Tlm54gZmFsc2XvvIzliJnkuIvmrKHlkK/liqjov5jkvJrph43mlrDlr7zlhaVcclxuICAgICAgICAgKiBAcGFyYW0gYXNzZXRcclxuICAgICAgICAgKi9cclxuICAgICAgICBhc3luYyBpbXBvcnQoYXNzZXQ6IFZpcnR1YWxBc3NldCkge1xyXG4gICAgICAgICAgICBpZiAoIWFzc2V0LnBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IGFzc2V0LnBhcmVudCBhcyBBc3NldDtcclxuICAgICAgICAgICAgY29uc3Qgc291cmNlID0gdXRpbHMuUGF0aC5yZXNvbHZlVG9SYXcocGFyZW50LnVzZXJEYXRhLnNpZ24pO1xyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKGFzc2V0LnVzZXJEYXRhLCBwYXJlbnQudXNlckRhdGEpO1xyXG4gICAgICAgICAgICBkZWxldGUgYXNzZXQudXNlckRhdGEudHlwZTtcclxuICAgICAgICAgICAgZGVsZXRlIGFzc2V0LnVzZXJEYXRhLnNpZ247XHJcbiAgICAgICAgICAgIGFzc2V0LnVzZXJEYXRhLmlzUkdCRSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8g5Li65LiN5ZCM5a+85YWl57G75Z6L55qE5Zu+54mH6K6+572u5Lyq5b2x55qE6buY6K6k5YC8XHJcbiAgICAgICAgICAgIGlmIChhc3NldC51c2VyRGF0YS5maXhBbHBoYVRyYW5zcGFyZW5jeUFydGlmYWN0cyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBhc3NldC51c2VyRGF0YS5maXhBbHBoYVRyYW5zcGFyZW5jeUFydGlmYWN0cyA9IGlzQ2FwYWJsZVRvRml4QWxwaGFUcmFuc3BhcmVuY3lBcnRpZmFjdHMoXHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50LnVzZXJEYXRhLnR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50LmV4dG5hbWUsXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBpbWFnZURhdGFCdWZmZXJPcmltYWdlUGF0aCA9IGF3YWl0IGhhbmRsZUltYWdlVXNlckRhdGEoYXNzZXQsIHNvdXJjZSwgJy5wbmcnKTtcclxuICAgICAgICAgICAgYXdhaXQgc2F2ZUltYWdlQXNzZXQoYXNzZXQsIGltYWdlRGF0YUJ1ZmZlck9yaW1hZ2VQYXRoLCAnLnBuZycsICdzaWduJyk7XHJcbiAgICAgICAgICAgIGF3YWl0IGltcG9ydFdpdGhUeXBlKGFzc2V0LCBwYXJlbnQudXNlckRhdGEudHlwZSwgJ3NpZ24nLCBwYXJlbnQuZXh0bmFtZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG59O1xyXG5leHBvcnQgZGVmYXVsdCBTaWduSW1hZ2VIYW5kbGVyO1xyXG4iXX0=