"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlphaImageHandler = void 0;
const utils_1 = require("./utils");
const utils_2 = __importDefault(require("../../../../base/utils"));
exports.AlphaImageHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'alpha-image',
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
            const source = utils_2.default.Path.resolveToRaw(parent.userData.alpha);
            Object.assign(asset.userData, parent.userData);
            delete asset.userData.type;
            delete asset.userData.alpha;
            asset.userData.isRGBE = false;
            // 为不同导入类型的图片设置伪影的默认值
            if (asset.userData.fixAlphaTransparencyArtifacts === undefined) {
                asset.userData.fixAlphaTransparencyArtifacts = (0, utils_1.isCapableToFixAlphaTransparencyArtifacts)(asset, parent.userData.type, parent.extname);
            }
            const imageDataBufferOrimagePath = await (0, utils_1.handleImageUserData)(asset, source, '.png');
            await (0, utils_1.saveImageAsset)(asset, imageDataBufferOrimagePath, '.png', 'alpha');
            await (0, utils_1.importWithType)(asset, parent.userData.type, 'alpha', parent.extname);
            return true;
        },
    },
};
exports.default = exports.AlphaImageHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxwaGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvaW1hZ2UvYWxwaGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUEsbUNBQTJJO0FBQzNJLG1FQUEyQztBQUU5QixRQUFBLGlCQUFpQixHQUFpQjtJQUMzQyxnQ0FBZ0M7SUFDaEMsSUFBSSxFQUFFLGFBQWE7SUFFbkIsV0FBVztJQUNYLFNBQVMsRUFBRSxlQUFlO0lBQzFCLFFBQVEsRUFBRTtRQUNOLE9BQU8sRUFBRSx5QkFBaUI7UUFDMUIsaUJBQWlCLENBQUMsS0FBWTtZQUMxQixPQUFPO2dCQUNILElBQUksRUFBRSxPQUFPO2dCQUNiLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU07YUFDaEMsQ0FBQztRQUNOLENBQUM7S0FDSjtJQUVELFFBQVEsRUFBRTtRQUNOLG1CQUFtQjtRQUNuQixPQUFPLEVBQUUsT0FBTztRQUNoQjs7Ozs7OztXQU9HO1FBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFtQjtZQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNoQixPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDO1lBQ0QsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQWUsQ0FBQztZQUNyQyxNQUFNLE1BQU0sR0FBRyxlQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlELE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0MsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztZQUMzQixPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBQzVCLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUU5QixxQkFBcUI7WUFDckIsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLDZCQUE2QixLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUM3RCxLQUFLLENBQUMsUUFBUSxDQUFDLDZCQUE2QixHQUFHLElBQUEsZ0RBQXdDLEVBQ25GLEtBQUssRUFDTCxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFDcEIsTUFBTSxDQUFDLE9BQU8sQ0FDakIsQ0FBQztZQUNOLENBQUM7WUFFRCxNQUFNLDBCQUEwQixHQUFHLE1BQU0sSUFBQSwyQkFBbUIsRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3BGLE1BQU0sSUFBQSxzQkFBYyxFQUFDLEtBQUssRUFBRSwwQkFBMEIsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDekUsTUFBTSxJQUFBLHNCQUFjLEVBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0UsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztLQUNKO0NBQ0osQ0FBQztBQUVGLGtCQUFlLHlCQUFpQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXNzZXQsIFZpcnR1YWxBc3NldCB9IGZyb20gJ0Bjb2Nvcy9hc3NldC1kYic7XHJcbmltcG9ydCB7IEFzc2V0SGFuZGxlciB9IGZyb20gJy4uLy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBkZWZhdWx0SWNvbkNvbmZpZywgaGFuZGxlSW1hZ2VVc2VyRGF0YSwgaW1wb3J0V2l0aFR5cGUsIGlzQ2FwYWJsZVRvRml4QWxwaGFUcmFuc3BhcmVuY3lBcnRpZmFjdHMsIHNhdmVJbWFnZUFzc2V0IH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi8uLi8uLi8uLi9iYXNlL3V0aWxzJztcclxuXHJcbmV4cG9ydCBjb25zdCBBbHBoYUltYWdlSGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICdhbHBoYS1pbWFnZScsXHJcblxyXG4gICAgLy8g5byV5pOO5YaF5a+55bqU55qE57G75Z6LXHJcbiAgICBhc3NldFR5cGU6ICdjYy5JbWFnZUFzc2V0JyxcclxuICAgIGljb25JbmZvOiB7XHJcbiAgICAgICAgZGVmYXVsdDogZGVmYXVsdEljb25Db25maWcsXHJcbiAgICAgICAgZ2VuZXJhdGVUaHVtYm5haWwoYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGFzc2V0LmxpYnJhcnkgKyAnLnBuZycsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICAvLyDniYjmnKzlj7flpoLmnpzlj5jmm7TvvIzliJnkvJrlvLrliLbph43mlrDlr7zlhaVcclxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjEnLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWunumZheWvvOWFpea1geeoi1xyXG4gICAgICAgICAqIOmcgOimgeiHquW3seaOp+WItuaYr+WQpueUn+aIkOOAgeaLt+i0neaWh+S7tlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICog6L+U5Zue5piv5ZCm5a+85YWl5oiQ5Yqf55qEIGJvb2xlYW5cclxuICAgICAgICAgKiDlpoLmnpzov5Tlm54gZmFsc2XvvIzliJnkuIvmrKHlkK/liqjov5jkvJrph43mlrDlr7zlhaVcclxuICAgICAgICAgKiBAcGFyYW0gYXNzZXRcclxuICAgICAgICAgKi9cclxuICAgICAgICBhc3luYyBpbXBvcnQoYXNzZXQ6IFZpcnR1YWxBc3NldCkge1xyXG4gICAgICAgICAgICBpZiAoIWFzc2V0LnBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IGFzc2V0LnBhcmVudCBhcyBBc3NldDtcclxuICAgICAgICAgICAgY29uc3Qgc291cmNlID0gdXRpbHMuUGF0aC5yZXNvbHZlVG9SYXcocGFyZW50LnVzZXJEYXRhLmFscGhhKTtcclxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihhc3NldC51c2VyRGF0YSwgcGFyZW50LnVzZXJEYXRhKTtcclxuICAgICAgICAgICAgZGVsZXRlIGFzc2V0LnVzZXJEYXRhLnR5cGU7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBhc3NldC51c2VyRGF0YS5hbHBoYTtcclxuICAgICAgICAgICAgYXNzZXQudXNlckRhdGEuaXNSR0JFID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAvLyDkuLrkuI3lkIzlr7zlhaXnsbvlnovnmoTlm77niYforr7nva7kvKrlvbHnmoTpu5jorqTlgLxcclxuICAgICAgICAgICAgaWYgKGFzc2V0LnVzZXJEYXRhLmZpeEFscGhhVHJhbnNwYXJlbmN5QXJ0aWZhY3RzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGFzc2V0LnVzZXJEYXRhLmZpeEFscGhhVHJhbnNwYXJlbmN5QXJ0aWZhY3RzID0gaXNDYXBhYmxlVG9GaXhBbHBoYVRyYW5zcGFyZW5jeUFydGlmYWN0cyhcclxuICAgICAgICAgICAgICAgICAgICBhc3NldCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQudXNlckRhdGEudHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuZXh0bmFtZSxcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlRGF0YUJ1ZmZlck9yaW1hZ2VQYXRoID0gYXdhaXQgaGFuZGxlSW1hZ2VVc2VyRGF0YShhc3NldCwgc291cmNlLCAnLnBuZycpO1xyXG4gICAgICAgICAgICBhd2FpdCBzYXZlSW1hZ2VBc3NldChhc3NldCwgaW1hZ2VEYXRhQnVmZmVyT3JpbWFnZVBhdGgsICcucG5nJywgJ2FscGhhJyk7XHJcbiAgICAgICAgICAgIGF3YWl0IGltcG9ydFdpdGhUeXBlKGFzc2V0LCBwYXJlbnQudXNlckRhdGEudHlwZSwgJ2FscGhhJywgcGFyZW50LmV4dG5hbWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFscGhhSW1hZ2VIYW5kbGVyO1xyXG4iXX0=