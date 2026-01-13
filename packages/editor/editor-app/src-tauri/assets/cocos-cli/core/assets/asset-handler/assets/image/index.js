"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageHandler = void 0;
const fs_extra_1 = require("fs-extra");
const erp_texture_cube_1 = require("../erp-texture-cube");
const image_mics_1 = require("./image-mics");
const sharp_1 = __importDefault(require("sharp"));
const path_1 = require("path");
const utils_1 = require("./utils");
const utils_2 = __importDefault(require("../../../../base/utils"));
exports.ImageHandler = {
    displayName: 'i18n:ENGINE.assets.image.label',
    description: 'i18n:ENGINE.assets.image.description',
    // Handler 的名字，用于指定 Handler as 等
    name: 'image',
    // 引擎内对应的类型
    assetType: 'cc.ImageAsset',
    open: utils_1.openImageAsset,
    iconInfo: {
        default: utils_1.defaultIconConfig,
        generateThumbnail(asset) {
            const extname = asset.meta.files.find((extName) => extName !== '.json') || '.png';
            return {
                type: 'image',
                value: asset.library + extname,
            };
        },
    },
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.27',
        /**
         * 是否强制刷新
         * @param asset
         */
        async force(asset) {
            return false;
        },
        /**
         * @param asset
         */
        async import(asset) {
            let extName = asset.extname.toLocaleLowerCase();
            // If it's a string, is a path to the image file.
            // Else it's the image data buffer.
            let imageDataBufferOrimagePath = asset.source;
            const userData = asset.meta.userData;
            // 这个流程会将不同类型的图片转成 png
            if (extName === '.bmp') {
                const converted = await (0, image_mics_1.convertHDR)(asset.source, asset.uuid, asset.temp);
                if (converted instanceof Error || !converted) {
                    console.error('Failed to convert bmp image.');
                    return false;
                }
                extName = converted.extName;
                imageDataBufferOrimagePath = converted.source;
                // bmp 导入的，默认钩上 isRGBE
                userData.isRGBE = true;
                // 对于 rgbe 类型图片默认关闭这个选项
                userData.fixAlphaTransparencyArtifacts ||= false;
            }
            else if (extName === '.znt') {
                const source = asset.source;
                const converted = await (0, image_mics_1.convertHDR)(source, asset.uuid, asset.temp);
                if (converted instanceof Error || !converted) {
                    console.error(`Failed to convert asset {asset(${asset.uuid})}.`);
                    return false;
                }
                extName = converted.extName;
                imageDataBufferOrimagePath = converted.source;
                // 对于 rgbe 类型图片默认关闭这个选项
                userData.fixAlphaTransparencyArtifacts = false;
                userData.isRGBE = true;
            }
            else if (extName === '.hdr' || extName === '.exr') {
                const source = asset.source;
                const converted = await (0, image_mics_1.convertHDROrEXR)(extName, source, asset.uuid, asset.temp);
                if (converted instanceof Error || !converted) {
                    console.error(`Failed to convert asset {asset(${asset.uuid})}.`);
                    return false;
                }
                extName = converted.extName;
                imageDataBufferOrimagePath = converted.source;
                // 对于 rgbe 类型图片默认关闭这个选项
                userData.fixAlphaTransparencyArtifacts = false;
                // hdr 导入的，默认钩上 isRGBE
                userData.isRGBE = true;
                const sharpResult = await (0, sharp_1.default)(imageDataBufferOrimagePath);
                const metaData = await sharpResult.metadata();
                // 长宽符合 cubemap 的导入规则时，默认导入成 texture cube
                if (!userData.type && (0, erp_texture_cube_1.checkSize)(metaData.width, metaData.height)) {
                    userData.type = 'texture cube';
                }
                const signFile = (0, path_1.join)(converted.source.replace('.png', '_sign.png'));
                if ((0, fs_extra_1.existsSync)(signFile)) {
                    userData.sign = utils_2.default.Path.resolveToUrl(signFile, 'project');
                }
                const alphaFile = (0, path_1.join)(converted.source.replace('.png', '_alpha.png'));
                if ((0, fs_extra_1.existsSync)(alphaFile)) {
                    userData.alpha = utils_2.default.Path.resolveToUrl(alphaFile, 'project');
                }
            }
            else if (extName === '.tga') {
                const converted = await (0, image_mics_1.convertTGA)(await (0, fs_extra_1.readFile)(asset.source));
                if (converted instanceof Error || !converted) {
                    console.error('Failed to convert tga image.');
                    return false;
                }
                extName = converted.extName;
                imageDataBufferOrimagePath = converted.data;
            }
            else if (extName === '.psd') {
                const converted = await (0, image_mics_1.convertPSD)(await (0, fs_extra_1.readFile)(asset.source));
                extName = converted.extName;
                imageDataBufferOrimagePath = converted.data;
            }
            else if (extName === '.tif' || extName === '.tiff') {
                const converted = await (0, image_mics_1.convertTIFF)(asset.source);
                if (converted instanceof Error || !converted) {
                    console.error(`Failed to convert ${extName} image.`);
                    return false;
                }
                extName = converted.extName;
                imageDataBufferOrimagePath = converted.data;
            }
            // 为不同导入类型的图片设置伪影的默认值
            if (userData.fixAlphaTransparencyArtifacts === undefined) {
                userData.fixAlphaTransparencyArtifacts = (0, utils_1.isCapableToFixAlphaTransparencyArtifacts)(asset, userData.type, asset.extname);
            }
            imageDataBufferOrimagePath = await (0, utils_1.handleImageUserData)(asset, imageDataBufferOrimagePath, extName);
            await (0, utils_1.saveImageAsset)(asset, imageDataBufferOrimagePath, extName, asset.basename);
            await (0, utils_1.importWithType)(asset, userData.type, asset.basename, asset.extname);
            if (userData.sign) {
                await asset.createSubAsset('sign', 'sign-image', {
                    displayName: 'sign',
                });
            }
            // if (userData.alpha) {
            //     // TODO 暂时先用着，后续可以更改更通用的名字
            //     await asset.createSubAsset('alpha', 'sign-image', {
            //         displayName: 'alpha',
            //     });
            // }
            // await this.importWithType(asset, userData.type, asset.basename);
            if (userData.alpha) {
                // TODO 暂时先用着，后续可以更改更通用的名字
                await asset.createSubAsset('alpha', 'alpha-image', {
                    displayName: 'alpha',
                });
            }
            return true;
        },
    },
    userDataConfig: {
        default: {
            type: {
                label: 'i18n:ENGINE.assets.image.type',
                default: 'sprite-frame',
                render: {
                    ui: 'ui-select',
                    items: [
                        {
                            label: 'raw',
                            value: 'raw',
                        },
                        {
                            label: 'texture',
                            value: 'texture',
                        },
                        {
                            label: 'normal map',
                            value: 'normal map',
                        },
                        {
                            label: 'sprite-frame',
                            value: 'sprite-frame',
                        },
                        {
                            label: 'texture cube',
                            value: 'texture cube',
                        },
                    ],
                },
            },
            flipVertical: {
                label: 'i18n:ENGINE.assets.image.flipVertical',
                render: {
                    ui: 'ui-checkbox',
                },
            },
        },
    },
    /**
     * 判断是否允许使用当前的 Handler 进行导入
     * @param asset
     */
    async validate(asset) {
        return !(await asset.isDirectory());
    },
};
exports.default = exports.ImageHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvaW1hZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsdUNBQWdEO0FBQ2hELDBEQUFnRDtBQUNoRCw2Q0FBZ0c7QUFDaEcsa0RBQTBCO0FBRzFCLCtCQUE0QjtBQUM1QixtQ0FPaUI7QUFFakIsbUVBQTJDO0FBRTlCLFFBQUEsWUFBWSxHQUFpQjtJQUN0QyxXQUFXLEVBQUUsZ0NBQWdDO0lBQzdDLFdBQVcsRUFBRSxzQ0FBc0M7SUFDbkQsZ0NBQWdDO0lBQ2hDLElBQUksRUFBRSxPQUFPO0lBRWIsV0FBVztJQUNYLFNBQVMsRUFBRSxlQUFlO0lBQzFCLElBQUksRUFBRSxzQkFBYztJQUNwQixRQUFRLEVBQUU7UUFDTixPQUFPLEVBQUUseUJBQWlCO1FBQzFCLGlCQUFpQixDQUFDLEtBQVk7WUFDMUIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDO1lBQ2xGLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsS0FBSyxFQUFFLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTzthQUNqQyxDQUFDO1FBQ04sQ0FBQztLQUNKO0lBQ0QsUUFBUSxFQUFFO1FBQ04sbUJBQW1CO1FBQ25CLE9BQU8sRUFBRSxRQUFRO1FBQ2pCOzs7V0FHRztRQUNILEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBWTtZQUNwQixPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBQ0Q7O1dBRUc7UUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQVk7WUFDckIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFB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QUNyQixLQUFLLEVBQUUsY0FBYzt5QkFDeEI7d0JBQ0Q7NEJBQ0ksS0FBSyxFQUFFLGNBQWM7NEJBQ3JCLEtBQUssRUFBRSxjQUFjO3lCQUN4QjtxQkFDSjtpQkFDSjthQUNKO1lBQ0QsWUFBWSxFQUFFO2dCQUNWLEtBQUssRUFBRSx1Q0FBdUM7Z0JBQzlDLE1BQU0sRUFBRTtvQkFDSixFQUFFLEVBQUUsYUFBYTtpQkFDcEI7YUFDSjtTQUNKO0tBQ0o7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQVk7UUFDdkIsT0FBTyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUN4QyxDQUFDO0NBQ0osQ0FBQztBQUVGLGtCQUFlLG9CQUFZLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBc3NldCB9IGZyb20gJ0Bjb2Nvcy9hc3NldC1kYic7XHJcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBjaGVja1NpemUgfSBmcm9tICcuLi9lcnAtdGV4dHVyZS1jdWJlJztcclxuaW1wb3J0IHsgY29udmVydFRHQSwgY29udmVydFBTRCwgY29udmVydFRJRkYsIGNvbnZlcnRIRFJPckVYUiwgY29udmVydEhEUiB9IGZyb20gJy4vaW1hZ2UtbWljcyc7XHJcbmltcG9ydCBTaGFycCBmcm9tICdzaGFycCc7XHJcbmltcG9ydCB7IEltYWdlQXNzZXRVc2VyRGF0YSB9IGZyb20gJy4uLy4uLy4uL0B0eXBlcy91c2VyRGF0YXMnO1xyXG5cclxuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQge1xyXG4gICAgZGVmYXVsdEljb25Db25maWcsXHJcbiAgICBoYW5kbGVJbWFnZVVzZXJEYXRhLFxyXG4gICAgaW1wb3J0V2l0aFR5cGUsXHJcbiAgICBpc0NhcGFibGVUb0ZpeEFscGhhVHJhbnNwYXJlbmN5QXJ0aWZhY3RzLFxyXG4gICAgb3BlbkltYWdlQXNzZXQsXHJcbiAgICBzYXZlSW1hZ2VBc3NldCxcclxufSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi8uLi8uLi8uLi9iYXNlL3V0aWxzJztcclxuXHJcbmV4cG9ydCBjb25zdCBJbWFnZUhhbmRsZXI6IEFzc2V0SGFuZGxlciA9IHtcclxuICAgIGRpc3BsYXlOYW1lOiAnaTE4bjpFTkdJTkUuYXNzZXRzLmltYWdlLmxhYmVsJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnaTE4bjpFTkdJTkUuYXNzZXRzLmltYWdlLmRlc2NyaXB0aW9uJyxcclxuICAgIC8vIEhhbmRsZXIg55qE5ZCN5a2X77yM55So5LqO5oyH5a6aIEhhbmRsZXIgYXMg562JXHJcbiAgICBuYW1lOiAnaW1hZ2UnLFxyXG5cclxuICAgIC8vIOW8leaTjuWGheWvueW6lOeahOexu+Wei1xyXG4gICAgYXNzZXRUeXBlOiAnY2MuSW1hZ2VBc3NldCcsXHJcbiAgICBvcGVuOiBvcGVuSW1hZ2VBc3NldCxcclxuICAgIGljb25JbmZvOiB7XHJcbiAgICAgICAgZGVmYXVsdDogZGVmYXVsdEljb25Db25maWcsXHJcbiAgICAgICAgZ2VuZXJhdGVUaHVtYm5haWwoYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV4dG5hbWUgPSBhc3NldC5tZXRhLmZpbGVzLmZpbmQoKGV4dE5hbWUpID0+IGV4dE5hbWUgIT09ICcuanNvbicpIHx8ICcucG5nJztcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdpbWFnZScsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogYXNzZXQubGlicmFyeSArIGV4dG5hbWUsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBpbXBvcnRlcjoge1xyXG4gICAgICAgIC8vIOeJiOacrOWPt+WmguaenOWPmOabtO+8jOWImeS8muW8uuWItumHjeaWsOWvvOWFpVxyXG4gICAgICAgIHZlcnNpb246ICcxLjAuMjcnLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOaYr+WQpuW8uuWItuWIt+aWsFxyXG4gICAgICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFzeW5jIGZvcmNlKGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAcGFyYW0gYXNzZXRcclxuICAgICAgICAgKi9cclxuICAgICAgICBhc3luYyBpbXBvcnQoYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICAgICAgICAgIGxldCBleHROYW1lID0gYXNzZXQuZXh0bmFtZS50b0xvY2FsZUxvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAvLyBJZiBpdCdzIGEgc3RyaW5nLCBpcyBhIHBhdGggdG8gdGhlIGltYWdlIGZpbGUuXHJcbiAgICAgICAgICAgIC8vIEVsc2UgaXQncyB0aGUgaW1hZ2UgZGF0YSBidWZmZXIuXHJcbiAgICAgICAgICAgIGxldCBpbWFnZURhdGFCdWZmZXJPcmltYWdlUGF0aDogc3RyaW5nIHwgQnVmZmVyID0gYXNzZXQuc291cmNlO1xyXG4gICAgICAgICAgICBjb25zdCB1c2VyRGF0YSA9IGFzc2V0Lm1ldGEudXNlckRhdGEgYXMgSW1hZ2VBc3NldFVzZXJEYXRhO1xyXG5cclxuICAgICAgICAgICAgLy8g6L+Z5Liq5rWB56iL5Lya5bCG5LiN5ZCM57G75Z6L55qE5Zu+54mH6L2s5oiQIHBuZ1xyXG4gICAgICAgICAgICBpZiAoZXh0TmFtZSA9PT0gJy5ibXAnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb252ZXJ0ZWQgPSBhd2FpdCBjb252ZXJ0SERSKGFzc2V0LnNvdXJjZSwgYXNzZXQudXVpZCwgYXNzZXQudGVtcCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29udmVydGVkIGluc3RhbmNlb2YgRXJyb3IgfHwgIWNvbnZlcnRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjb252ZXJ0IGJtcCBpbWFnZS4nKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBleHROYW1lID0gY29udmVydGVkLmV4dE5hbWU7XHJcbiAgICAgICAgICAgICAgICBpbWFnZURhdGFCdWZmZXJPcmltYWdlUGF0aCA9IGNvbnZlcnRlZC5zb3VyY2U7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gYm1wIOWvvOWFpeeahO+8jOm7mOiupOmSqeS4iiBpc1JHQkVcclxuICAgICAgICAgICAgICAgIHVzZXJEYXRhLmlzUkdCRSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAvLyDlr7nkuo4gcmdiZSDnsbvlnovlm77niYfpu5jorqTlhbPpl63ov5nkuKrpgInpoblcclxuICAgICAgICAgICAgICAgIHVzZXJEYXRhLmZpeEFscGhhVHJhbnNwYXJlbmN5QXJ0aWZhY3RzIHx8PSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChleHROYW1lID09PSAnLnpudCcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZSA9IGFzc2V0LnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZCA9IGF3YWl0IGNvbnZlcnRIRFIoc291cmNlLCBhc3NldC51dWlkLCBhc3NldC50ZW1wKTtcclxuICAgICAgICAgICAgICAgIGlmIChjb252ZXJ0ZWQgaW5zdGFuY2VvZiBFcnJvciB8fCAhY29udmVydGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIGNvbnZlcnQgYXNzZXQge2Fzc2V0KCR7YXNzZXQudXVpZH0pfS5gKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBleHROYW1lID0gY29udmVydGVkLmV4dE5hbWU7XHJcbiAgICAgICAgICAgICAgICBpbWFnZURhdGFCdWZmZXJPcmltYWdlUGF0aCA9IGNvbnZlcnRlZC5zb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAvLyDlr7nkuo4gcmdiZSDnsbvlnovlm77niYfpu5jorqTlhbPpl63ov5nkuKrpgInpoblcclxuICAgICAgICAgICAgICAgIHVzZXJEYXRhLmZpeEFscGhhVHJhbnNwYXJlbmN5QXJ0aWZhY3RzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB1c2VyRGF0YS5pc1JHQkUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV4dE5hbWUgPT09ICcuaGRyJyB8fCBleHROYW1lID09PSAnLmV4cicpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZSA9IGFzc2V0LnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZCA9IGF3YWl0IGNvbnZlcnRIRFJPckVYUihleHROYW1lLCBzb3VyY2UsIGFzc2V0LnV1aWQsIGFzc2V0LnRlbXApO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbnZlcnRlZCBpbnN0YW5jZW9mIEVycm9yIHx8ICFjb252ZXJ0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gY29udmVydCBhc3NldCB7YXNzZXQoJHthc3NldC51dWlkfSl9LmApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGV4dE5hbWUgPSBjb252ZXJ0ZWQuZXh0TmFtZTtcclxuICAgICAgICAgICAgICAgIGltYWdlRGF0YUJ1ZmZlck9yaW1hZ2VQYXRoID0gY29udmVydGVkLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIC8vIOWvueS6jiByZ2JlIOexu+Wei+WbvueJh+m7mOiupOWFs+mXrei/meS4qumAiemhuVxyXG4gICAgICAgICAgICAgICAgdXNlckRhdGEuZml4QWxwaGFUcmFuc3BhcmVuY3lBcnRpZmFjdHMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIC8vIGhkciDlr7zlhaXnmoTvvIzpu5jorqTpkqnkuIogaXNSR0JFXHJcbiAgICAgICAgICAgICAgICB1c2VyRGF0YS5pc1JHQkUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2hhcnBSZXN1bHQgPSBhd2FpdCBTaGFycChpbWFnZURhdGFCdWZmZXJPcmltYWdlUGF0aCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtZXRhRGF0YSA9IGF3YWl0IHNoYXJwUmVzdWx0Lm1ldGFkYXRhKCk7XHJcbiAgICAgICAgICAgICAgICAvLyDplb/lrr3nrKblkIggY3ViZW1hcCDnmoTlr7zlhaXop4TliJnml7bvvIzpu5jorqTlr7zlhaXmiJAgdGV4dHVyZSBjdWJlXHJcbiAgICAgICAgICAgICAgICBpZiAoIXVzZXJEYXRhLnR5cGUgJiYgY2hlY2tTaXplKG1ldGFEYXRhLndpZHRoISwgbWV0YURhdGEuaGVpZ2h0ISkpIHtcclxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YS50eXBlID0gJ3RleHR1cmUgY3ViZSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzaWduRmlsZSA9IGpvaW4oY29udmVydGVkLnNvdXJjZS5yZXBsYWNlKCcucG5nJywgJ19zaWduLnBuZycpKTtcclxuICAgICAgICAgICAgICAgIGlmIChleGlzdHNTeW5jKHNpZ25GaWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJEYXRhLnNpZ24gPSB1dGlscy5QYXRoLnJlc29sdmVUb1VybChzaWduRmlsZSwgJ3Byb2plY3QnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGFscGhhRmlsZSA9IGpvaW4oY29udmVydGVkLnNvdXJjZS5yZXBsYWNlKCcucG5nJywgJ19hbHBoYS5wbmcnKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXhpc3RzU3luYyhhbHBoYUZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGEuYWxwaGEgPSB1dGlscy5QYXRoLnJlc29sdmVUb1VybChhbHBoYUZpbGUsICdwcm9qZWN0Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXh0TmFtZSA9PT0gJy50Z2EnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb252ZXJ0ZWQgPSBhd2FpdCBjb252ZXJ0VEdBKGF3YWl0IHJlYWRGaWxlKGFzc2V0LnNvdXJjZSkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbnZlcnRlZCBpbnN0YW5jZW9mIEVycm9yIHx8ICFjb252ZXJ0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY29udmVydCB0Z2EgaW1hZ2UuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZXh0TmFtZSA9IGNvbnZlcnRlZC5leHROYW1lO1xyXG4gICAgICAgICAgICAgICAgaW1hZ2VEYXRhQnVmZmVyT3JpbWFnZVBhdGggPSBjb252ZXJ0ZWQuZGF0YTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChleHROYW1lID09PSAnLnBzZCcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZCA9IGF3YWl0IGNvbnZlcnRQU0QoYXdhaXQgcmVhZEZpbGUoYXNzZXQuc291cmNlKSk7XHJcbiAgICAgICAgICAgICAgICBleHROYW1lID0gY29udmVydGVkLmV4dE5hbWU7XHJcbiAgICAgICAgICAgICAgICBpbWFnZURhdGFCdWZmZXJPcmltYWdlUGF0aCA9IGNvbnZlcnRlZC5kYXRhO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV4dE5hbWUgPT09ICcudGlmJyB8fCBleHROYW1lID09PSAnLnRpZmYnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb252ZXJ0ZWQgPSBhd2FpdCBjb252ZXJ0VElGRihhc3NldC5zb3VyY2UpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbnZlcnRlZCBpbnN0YW5jZW9mIEVycm9yIHx8ICFjb252ZXJ0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gY29udmVydCAke2V4dE5hbWV9IGltYWdlLmApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGV4dE5hbWUgPSBjb252ZXJ0ZWQuZXh0TmFtZTtcclxuICAgICAgICAgICAgICAgIGltYWdlRGF0YUJ1ZmZlck9yaW1hZ2VQYXRoID0gY29udmVydGVkLmRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8g5Li65LiN5ZCM5a+85YWl57G75Z6L55qE5Zu+54mH6K6+572u5Lyq5b2x55qE6buY6K6k5YC8XHJcbiAgICAgICAgICAgIGlmICh1c2VyRGF0YS5maXhBbHBoYVRyYW5zcGFyZW5jeUFydGlmYWN0cyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB1c2VyRGF0YS5maXhBbHBoYVRyYW5zcGFyZW5jeUFydGlmYWN0cyA9IGlzQ2FwYWJsZVRvRml4QWxwaGFUcmFuc3BhcmVuY3lBcnRpZmFjdHMoYXNzZXQsIHVzZXJEYXRhLnR5cGUsIGFzc2V0LmV4dG5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGltYWdlRGF0YUJ1ZmZlck9yaW1hZ2VQYXRoID0gYXdhaXQgaGFuZGxlSW1hZ2VVc2VyRGF0YShhc3NldCwgaW1hZ2VEYXRhQnVmZmVyT3JpbWFnZVBhdGgsIGV4dE5hbWUpO1xyXG5cclxuICAgICAgICAgICAgYXdhaXQgc2F2ZUltYWdlQXNzZXQoYXNzZXQsIGltYWdlRGF0YUJ1ZmZlck9yaW1hZ2VQYXRoLCBleHROYW1lLCBhc3NldC5iYXNlbmFtZSk7XHJcbiAgICAgICAgICAgIGF3YWl0IGltcG9ydFdpdGhUeXBlKGFzc2V0LCB1c2VyRGF0YS50eXBlLCBhc3NldC5iYXNlbmFtZSwgYXNzZXQuZXh0bmFtZSk7XHJcbiAgICAgICAgICAgIGlmICh1c2VyRGF0YS5zaWduKSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBhc3NldC5jcmVhdGVTdWJBc3NldCgnc2lnbicsICdzaWduLWltYWdlJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnc2lnbicsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgKHVzZXJEYXRhLmFscGhhKSB7XHJcbiAgICAgICAgICAgIC8vICAgICAvLyBUT0RPIOaaguaXtuWFiOeUqOedgO+8jOWQjue7reWPr+S7peabtOaUueabtOmAmueUqOeahOWQjeWtl1xyXG4gICAgICAgICAgICAvLyAgICAgYXdhaXQgYXNzZXQuY3JlYXRlU3ViQXNzZXQoJ2FscGhhJywgJ3NpZ24taW1hZ2UnLCB7XHJcbiAgICAgICAgICAgIC8vICAgICAgICAgZGlzcGxheU5hbWU6ICdhbHBoYScsXHJcbiAgICAgICAgICAgIC8vICAgICB9KTtcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAvLyBhd2FpdCB0aGlzLmltcG9ydFdpdGhUeXBlKGFzc2V0LCB1c2VyRGF0YS50eXBlLCBhc3NldC5iYXNlbmFtZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodXNlckRhdGEuYWxwaGEpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRPRE8g5pqC5pe25YWI55So552A77yM5ZCO57ut5Y+v5Lul5pu05pS55pu06YCa55So55qE5ZCN5a2XXHJcbiAgICAgICAgICAgICAgICBhd2FpdCBhc3NldC5jcmVhdGVTdWJBc3NldCgnYWxwaGEnLCAnYWxwaGEtaW1hZ2UnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdhbHBoYScsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuXHJcbiAgICB1c2VyRGF0YUNvbmZpZzoge1xyXG4gICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgdHlwZToge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdpMThuOkVOR0lORS5hc3NldHMuaW1hZ2UudHlwZScsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiAnc3ByaXRlLWZyYW1lJyxcclxuICAgICAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHVpOiAndWktc2VsZWN0JyxcclxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ3JhdycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3JhdycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAndGV4dHVyZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3RleHR1cmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ25vcm1hbCBtYXAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdub3JtYWwgbWFwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdzcHJpdGUtZnJhbWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdzcHJpdGUtZnJhbWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ3RleHR1cmUgY3ViZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3RleHR1cmUgY3ViZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZsaXBWZXJ0aWNhbDoge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdpMThuOkVOR0lORS5hc3NldHMuaW1hZ2UuZmxpcFZlcnRpY2FsJyxcclxuICAgICAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHVpOiAndWktY2hlY2tib3gnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIpOaWreaYr+WQpuWFgeiuuOS9v+eUqOW9k+WJjeeahCBIYW5kbGVyIOi/m+ihjOWvvOWFpVxyXG4gICAgICogQHBhcmFtIGFzc2V0XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHZhbGlkYXRlKGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgIHJldHVybiAhKGF3YWl0IGFzc2V0LmlzRGlyZWN0b3J5KCkpO1xyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEltYWdlSGFuZGxlcjtcclxuIl19