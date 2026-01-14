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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GltfImageHandler = void 0;
const DataURI = __importStar(require("@cocos/data-uri"));
const fs_extra_1 = __importStar(require("fs-extra"));
const path_1 = __importStar(require("path"));
const urijs_1 = __importDefault(require("urijs"));
const url_1 = __importDefault(require("url"));
const image_mics_1 = require("../image/image-mics");
const uri_utils_1 = require("../utils/uri-utils");
const reader_manager_1 = require("./reader-manager");
const utils_1 = require("../../utils");
const match_image_type_pattern_1 = require("../utils/match-image-type-pattern");
const image_mime_type_to_ext_1 = require("../utils/image-mime-type-to-ext");
const base64_1 = require("../utils/base64");
const cc_1 = require("cc");
const utils_2 = require("../../utils");
const utils_3 = require("../image/utils");
const fbx_1 = __importDefault(require("../fbx"));
const gltf_1 = __importDefault(require("../gltf"));
exports.GltfImageHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'gltf-embeded-image',
    // 引擎内对应的类型
    assetType: 'cc.ImageAsset',
    iconInfo: {
        default: utils_3.defaultIconConfig,
        generateThumbnail(asset) {
            return {
                type: 'image',
                value: asset.library + asset.getData('imageExtName'),
            };
        },
    },
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.3',
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
            const imageIndex = asset.userData.gltfIndex;
            let version = gltf_1.default.importer.version;
            if (asset.parent.meta.importer === 'fbx') {
                version = fbx_1.default.importer.version;
            }
            const gltfConverter = await reader_manager_1.glTfReaderManager.getOrCreate(asset.parent, version);
            const glTFImage = gltfConverter.gltf.images[imageIndex];
            // The `mimeType` is the mime type which is recorded on or deduced from transport layer.
            let image;
            const tryLoadFile = async (fileURL) => {
                try {
                    const imagePath = url_1.default.fileURLToPath(fileURL);
                    const imageData = await fs_extra_1.default.readFile(imagePath);
                    // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#file-extensions-and-mime-types
                    // > Implementations should use the image type pattern matching algorithm
                    // > from the MIME Sniffing Standard to detect PNG and JPEG images as file extensions
                    // > may be unavailable in some contexts.
                    const mimeType = (0, match_image_type_pattern_1.matchImageTypePattern)(imageData);
                    image = { data: imageData, mimeType, extName: path_1.default.extname(imagePath) };
                }
                catch (error) {
                    console.error((0, utils_1.i18nTranslate)('importer.gltf.failed_to_load_image', {
                        url: fileURL,
                        reason: error,
                    }), (0, utils_1.linkToAssetTarget)(asset.uuid));
                }
            };
            const resolved = asset.getSwapSpace().resolved;
            if (resolved) {
                const fileURL = url_1.default.pathToFileURL(resolved);
                await tryLoadFile(fileURL.href);
            }
            else {
                if (glTFImage.bufferView !== undefined) {
                    image = {
                        data: gltfConverter.readImageInBufferView(gltfConverter.gltf.bufferViews[glTFImage.bufferView]),
                    };
                }
                else if (glTFImage.uri !== undefined) {
                    // Note: should not be `asset.parent.source`, which may be path to fbx.
                    const glTFFilePath = gltfConverter.path;
                    const badURI = (error) => {
                        console.error(`The uri "${glTFImage.uri}" provided by model file${glTFFilePath} is not correct: ${error}`);
                    };
                    if (glTFImage.uri.startsWith('data:')) {
                        try {
                            const dataURI = DataURI.parse(glTFImage.uri);
                            if (!dataURI) {
                                throw new Error(`Unable to parse data uri "${glTFImage.uri}"`);
                            }
                            image = resolveImageDataURI(dataURI);
                        }
                        catch (error) {
                            badURI(error);
                        }
                    }
                    else {
                        // Note: should not be `asset.parent.source`, which may be path to fbx.
                        const glTFFilePath = gltfConverter.path;
                        let imageURI;
                        try {
                            const baseURI = url_1.default.pathToFileURL(glTFFilePath).toString();
                            let uriObj = new urijs_1.default(glTFImage.uri);
                            uriObj = uriObj.absoluteTo(baseURI);
                            (0, uri_utils_1.convertsEncodedSeparatorsInURI)(uriObj);
                            imageURI = uriObj.toString();
                        }
                        catch (error) {
                            badURI(error);
                        }
                        if (imageURI) {
                            if (!imageURI.startsWith('file://')) {
                                console.error((0, utils_1.i18nTranslate)('importer.gltf.image_uri_should_be_file_url'), (0, utils_1.linkToAssetTarget)(asset.uuid));
                            }
                            else {
                                await tryLoadFile(imageURI);
                            }
                        }
                    }
                }
            }
            const imageAsset = new cc_1.ImageAsset();
            if (image) {
                let extName;
                // Note, we prefer to use `mimeType` to detect image type and
                // reduce to use the possible `extName` if mime type is not available or is some we can't process.
                // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#images
                // > When image data is provided by uri and mimeType is defined,
                // > client implementations should prefer JSON-defined MIME Type over one provided by transport layer.
                const mimeType = glTFImage.mimeType ?? image.mimeType;
                if (mimeType) {
                    extName = (0, image_mime_type_to_ext_1.imageMimeTypeToExt)(mimeType);
                }
                if (!extName) {
                    extName = image.extName;
                }
                if (!extName) {
                    throw new Error('Unknown image type');
                }
                let imageData = image.data;
                if (extName.toLowerCase() === '.tga') {
                    const converted = await (0, image_mics_1.convertTGA)(imageData);
                    if (converted instanceof Error || !converted) {
                        console.error((0, utils_1.i18nTranslate)('importer.gltf.failed_to_convert_tga'), (0, utils_1.linkToAssetTarget)(asset.uuid));
                        return false;
                    }
                    extName = converted.extName;
                    imageData = converted.data;
                }
                else if (extName.toLowerCase() === '.psd') {
                    const converted = await (0, image_mics_1.convertPSD)(imageData);
                    ({ extName, data: imageData } = converted);
                }
                else if (extName.toLowerCase() === '.exr') {
                    const tempFile = (0, path_1.join)(asset.temp, `image${extName}`);
                    await (0, fs_extra_1.outputFile)(tempFile, imageData);
                    // TODO 需要与 image/index 整合复用 https://github.com/cocos/3d-tasks/issues/19092
                    const converted = await (0, image_mics_1.convertHDROrEXR)(extName, tempFile, asset.uuid, asset.temp);
                    if (converted instanceof Error || !converted) {
                        console.error((0, utils_1.i18nTranslate)('importer.gltf.failed_to_convert_tga'), (0, utils_1.linkToAssetTarget)(asset.uuid));
                        return false;
                    }
                    extName = converted.extName;
                    imageData = converted.source;
                }
                imageAsset._setRawAsset(extName);
                asset.userData.fixAlphaTransparencyArtifacts = true;
                // 和imageImport保持一致 cocos/3d-tasks#13641
                imageData = await (0, utils_3.handleImageUserData)(asset, imageData, extName);
                await asset.saveToLibrary(extName, imageData);
                asset.setData('imageExtName', extName);
            }
            const serializeJSON = EditorExtends.serialize(imageAsset);
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_2.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            return true;
        },
    },
};
exports.default = exports.GltfImageHandler;
function resolveImageDataURI(uri) {
    if (!uri.base64 || !uri.mediaType || uri.mediaType.type !== 'image') {
        throw new Error(`Cannot understand data uri(base64: ${uri.base64}, mediaType: ${uri.mediaType}) for image.`);
    }
    const data = (0, base64_1.decodeBase64ToArrayBuffer)(uri.data);
    return {
        data: Buffer.from(data),
        mimeType: uri.mediaType.value,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvZ2x0Zi9pbWFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5REFBMkM7QUFFM0MscURBQTBDO0FBQzFDLDZDQUFnQztBQUNoQyxrREFBd0I7QUFDeEIsOENBQXNCO0FBQ3RCLG9EQUE4RTtBQUM5RSxrREFBb0U7QUFDcEUscURBQXFEO0FBQ3JELHVDQUErRDtBQUMvRCxnRkFBMEU7QUFDMUUsNEVBQXFFO0FBQ3JFLDRDQUE0RDtBQUM1RCwyQkFBZ0M7QUFDaEMsdUNBQWdEO0FBQ2hELDBDQUF3RTtBQUV4RSxpREFBZ0M7QUFDaEMsbURBQWtDO0FBRXJCLFFBQUEsZ0JBQWdCLEdBQWlCO0lBQzFDLGdDQUFnQztJQUNoQyxJQUFJLEVBQUUsb0JBQW9CO0lBRTFCLFdBQVc7SUFDWCxTQUFTLEVBQUUsZUFBZTtJQUMxQixRQUFRLEVBQUU7UUFDTixPQUFPLEVBQUUseUJBQWlCO1FBQzFCLGlCQUFpQixDQUFDLEtBQVk7WUFDMUIsT0FBTztnQkFDSCxJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQzthQUN2RCxDQUFDO1FBQ04sQ0FBQztLQUNKO0lBQ0QsUUFBUSxFQUFFO1FBQ04sbUJBQW1CO1FBQ25CLE9BQU8sRUFBRSxPQUFPO1FBQ2hCOzs7Ozs7O1dBT0c7UUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQW1CO1lBQzVCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2hCLE9BQU8sS0FBSyxDQUFDO1lBQ2pCLENBQUM7WUFFRCxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLFNB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UyxDQUFDLEtBQUs7S0FDaEMsQ0FBQztBQUNOLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBEYXRhVVJJIGZyb20gJ0Bjb2Nvcy9kYXRhLXVyaSc7XHJcbmltcG9ydCB7IEFzc2V0LCBWaXJ0dWFsQXNzZXQgfSBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5pbXBvcnQgZnMsIHsgb3V0cHV0RmlsZSB9IGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHBzLCB7IGpvaW4gfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IFVSSSBmcm9tICd1cmlqcyc7XHJcbmltcG9ydCBVUkwgZnJvbSAndXJsJztcclxuaW1wb3J0IHsgY29udmVydEhEUk9yRVhSLCBjb252ZXJ0UFNELCBjb252ZXJ0VEdBIH0gZnJvbSAnLi4vaW1hZ2UvaW1hZ2UtbWljcyc7XHJcbmltcG9ydCB7IGNvbnZlcnRzRW5jb2RlZFNlcGFyYXRvcnNJblVSSSB9IGZyb20gJy4uL3V0aWxzL3VyaS11dGlscyc7XHJcbmltcG9ydCB7IGdsVGZSZWFkZXJNYW5hZ2VyIH0gZnJvbSAnLi9yZWFkZXItbWFuYWdlcic7XHJcbmltcG9ydCB7IGkxOG5UcmFuc2xhdGUsIGxpbmtUb0Fzc2V0VGFyZ2V0IH0gZnJvbSAnLi4vLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBtYXRjaEltYWdlVHlwZVBhdHRlcm4gfSBmcm9tICcuLi91dGlscy9tYXRjaC1pbWFnZS10eXBlLXBhdHRlcm4nO1xyXG5pbXBvcnQgeyBpbWFnZU1pbWVUeXBlVG9FeHQgfSBmcm9tICcuLi91dGlscy9pbWFnZS1taW1lLXR5cGUtdG8tZXh0JztcclxuaW1wb3J0IHsgZGVjb2RlQmFzZTY0VG9BcnJheUJ1ZmZlciB9IGZyb20gJy4uL3V0aWxzL2Jhc2U2NCc7XHJcbmltcG9ydCB7IEltYWdlQXNzZXQgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IGdldERlcGVuZFVVSURMaXN0IH0gZnJvbSAnLi4vLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBkZWZhdWx0SWNvbkNvbmZpZywgaGFuZGxlSW1hZ2VVc2VyRGF0YSB9IGZyb20gJy4uL2ltYWdlL3V0aWxzJztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCBGYnhIYW5kbGVyIGZyb20gJy4uL2ZieCc7XHJcbmltcG9ydCBHbHRmSGFuZGxlciBmcm9tICcuLi9nbHRmJztcclxuXHJcbmV4cG9ydCBjb25zdCBHbHRmSW1hZ2VIYW5kbGVyOiBBc3NldEhhbmRsZXIgPSB7XHJcbiAgICAvLyBIYW5kbGVyIOeahOWQjeWtl++8jOeUqOS6juaMh+WumiBIYW5kbGVyIGFzIOetiVxyXG4gICAgbmFtZTogJ2dsdGYtZW1iZWRlZC1pbWFnZScsXHJcblxyXG4gICAgLy8g5byV5pOO5YaF5a+55bqU55qE57G75Z6LXHJcbiAgICBhc3NldFR5cGU6ICdjYy5JbWFnZUFzc2V0JyxcclxuICAgIGljb25JbmZvOiB7XHJcbiAgICAgICAgZGVmYXVsdDogZGVmYXVsdEljb25Db25maWcsXHJcbiAgICAgICAgZ2VuZXJhdGVUaHVtYm5haWwoYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGFzc2V0LmxpYnJhcnkgKyBhc3NldC5nZXREYXRhKCdpbWFnZUV4dE5hbWUnKSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIGltcG9ydGVyOiB7XHJcbiAgICAgICAgLy8g54mI5pys5Y+35aaC5p6c5Y+Y5pu077yM5YiZ5Lya5by65Yi26YeN5paw5a+85YWlXHJcbiAgICAgICAgdmVyc2lvbjogJzEuMC4zJyxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlrp7pmYXlr7zlhaXmtYHnqItcclxuICAgICAgICAgKiDpnIDopoHoh6rlt7HmjqfliLbmmK/lkKbnlJ/miJDjgIHmi7fotJ3mlofku7ZcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIOi/lOWbnuaYr+WQpuWvvOWFpeaIkOWKn+eahCBib29sZWFuXHJcbiAgICAgICAgICog5aaC5p6c6L+U5ZueIGZhbHNl77yM5YiZ5LiL5qyh5ZCv5Yqo6L+Y5Lya6YeN5paw5a+85YWlXHJcbiAgICAgICAgICogQHBhcmFtIGFzc2V0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXN5bmMgaW1wb3J0KGFzc2V0OiBWaXJ0dWFsQXNzZXQpIHtcclxuICAgICAgICAgICAgaWYgKCFhc3NldC5wYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgaW1hZ2VJbmRleCA9IGFzc2V0LnVzZXJEYXRhLmdsdGZJbmRleCBhcyBudW1iZXI7XHJcbiAgICAgICAgICAgIGxldCB2ZXJzaW9uID0gR2x0ZkhhbmRsZXIuaW1wb3J0ZXIudmVyc2lvbjtcclxuICAgICAgICAgICAgaWYgKGFzc2V0LnBhcmVudC5tZXRhLmltcG9ydGVyID09PSAnZmJ4Jykge1xyXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IEZieEhhbmRsZXIuaW1wb3J0ZXIudmVyc2lvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBnbHRmQ29udmVydGVyID0gYXdhaXQgZ2xUZlJlYWRlck1hbmFnZXIuZ2V0T3JDcmVhdGUoYXNzZXQucGFyZW50IGFzIEFzc2V0LCB2ZXJzaW9uKTtcclxuICAgICAgICAgICAgY29uc3QgZ2xURkltYWdlID0gZ2x0ZkNvbnZlcnRlci5nbHRmLmltYWdlcyFbaW1hZ2VJbmRleF07XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgYG1pbWVUeXBlYCBpcyB0aGUgbWltZSB0eXBlIHdoaWNoIGlzIHJlY29yZGVkIG9uIG9yIGRlZHVjZWQgZnJvbSB0cmFuc3BvcnQgbGF5ZXIuXHJcbiAgICAgICAgICAgIGxldCBpbWFnZTogeyBkYXRhOiBCdWZmZXI7IG1pbWVUeXBlPzogc3RyaW5nOyBleHROYW1lPzogc3RyaW5nIH0gfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB0cnlMb2FkRmlsZSA9IGFzeW5jIChmaWxlVVJMOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1hZ2VQYXRoID0gVVJMLmZpbGVVUkxUb1BhdGgoZmlsZVVSTCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1hZ2VEYXRhID0gYXdhaXQgZnMucmVhZEZpbGUoaW1hZ2VQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvdHJlZS9tYXN0ZXIvc3BlY2lmaWNhdGlvbi8yLjAjZmlsZS1leHRlbnNpb25zLWFuZC1taW1lLXR5cGVzXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gPiBJbXBsZW1lbnRhdGlvbnMgc2hvdWxkIHVzZSB0aGUgaW1hZ2UgdHlwZSBwYXR0ZXJuIG1hdGNoaW5nIGFsZ29yaXRobVxyXG4gICAgICAgICAgICAgICAgICAgIC8vID4gZnJvbSB0aGUgTUlNRSBTbmlmZmluZyBTdGFuZGFyZCB0byBkZXRlY3QgUE5HIGFuZCBKUEVHIGltYWdlcyBhcyBmaWxlIGV4dGVuc2lvbnNcclxuICAgICAgICAgICAgICAgICAgICAvLyA+IG1heSBiZSB1bmF2YWlsYWJsZSBpbiBzb21lIGNvbnRleHRzLlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1pbWVUeXBlID0gbWF0Y2hJbWFnZVR5cGVQYXR0ZXJuKGltYWdlRGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2UgPSB7IGRhdGE6IGltYWdlRGF0YSwgbWltZVR5cGUsIGV4dE5hbWU6IHBzLmV4dG5hbWUoaW1hZ2VQYXRoKSB9O1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpMThuVHJhbnNsYXRlKCdpbXBvcnRlci5nbHRmLmZhaWxlZF90b19sb2FkX2ltYWdlJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBmaWxlVVJMLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uOiBlcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtUb0Fzc2V0VGFyZ2V0KGFzc2V0LnV1aWQpLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjb25zdCByZXNvbHZlZCA9IGFzc2V0LmdldFN3YXBTcGFjZTx7IHJlc29sdmVkPzogc3RyaW5nIH0+KCkucmVzb2x2ZWQ7XHJcbiAgICAgICAgICAgIGlmIChyZXNvbHZlZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZVVSTCA9IFVSTC5wYXRoVG9GaWxlVVJMKHJlc29sdmVkKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRyeUxvYWRGaWxlKGZpbGVVUkwuaHJlZik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ2xURkltYWdlLmJ1ZmZlclZpZXcgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBnbHRmQ29udmVydGVyLnJlYWRJbWFnZUluQnVmZmVyVmlldyhnbHRmQ29udmVydGVyLmdsdGYuYnVmZmVyVmlld3MhW2dsVEZJbWFnZS5idWZmZXJWaWV3XSksXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2xURkltYWdlLnVyaSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogc2hvdWxkIG5vdCBiZSBgYXNzZXQucGFyZW50LnNvdXJjZWAsIHdoaWNoIG1heSBiZSBwYXRoIHRvIGZieC5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBnbFRGRmlsZVBhdGggPSBnbHRmQ29udmVydGVyLnBhdGg7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhZFVSSSA9IChlcnJvcjogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFRoZSB1cmkgXCIke2dsVEZJbWFnZS51cml9XCIgcHJvdmlkZWQgYnkgbW9kZWwgZmlsZSR7Z2xURkZpbGVQYXRofSBpcyBub3QgY29ycmVjdDogJHtlcnJvcn1gKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZ2xURkltYWdlLnVyaS5zdGFydHNXaXRoKCdkYXRhOicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhVVJJID0gRGF0YVVSSS5wYXJzZShnbFRGSW1hZ2UudXJpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGF0YVVSSSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHBhcnNlIGRhdGEgdXJpIFwiJHtnbFRGSW1hZ2UudXJpfVwiYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZSA9IHJlc29sdmVJbWFnZURhdGFVUkkoZGF0YVVSSSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWRVUkkoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogc2hvdWxkIG5vdCBiZSBgYXNzZXQucGFyZW50LnNvdXJjZWAsIHdoaWNoIG1heSBiZSBwYXRoIHRvIGZieC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZ2xURkZpbGVQYXRoID0gZ2x0ZkNvbnZlcnRlci5wYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2VVUkk6IHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VVUkkgPSBVUkwucGF0aFRvRmlsZVVSTChnbFRGRmlsZVBhdGgpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXJpT2JqID0gbmV3IFVSSShnbFRGSW1hZ2UudXJpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVyaU9iaiA9IHVyaU9iai5hYnNvbHV0ZVRvKGJhc2VVUkkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udmVydHNFbmNvZGVkU2VwYXJhdG9yc0luVVJJKHVyaU9iaik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVVSSSA9IHVyaU9iai50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFkVVJJKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlVVJJKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWltYWdlVVJJLnN0YXJ0c1dpdGgoJ2ZpbGU6Ly8nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkxOG5UcmFuc2xhdGUoJ2ltcG9ydGVyLmdsdGYuaW1hZ2VfdXJpX3Nob3VsZF9iZV9maWxlX3VybCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rVG9Bc3NldFRhcmdldChhc3NldC51dWlkKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0cnlMb2FkRmlsZShpbWFnZVVSSSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlQXNzZXQgPSBuZXcgSW1hZ2VBc3NldCgpO1xyXG4gICAgICAgICAgICBpZiAoaW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBleHROYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAvLyBOb3RlLCB3ZSBwcmVmZXIgdG8gdXNlIGBtaW1lVHlwZWAgdG8gZGV0ZWN0IGltYWdlIHR5cGUgYW5kXHJcbiAgICAgICAgICAgICAgICAvLyByZWR1Y2UgdG8gdXNlIHRoZSBwb3NzaWJsZSBgZXh0TmFtZWAgaWYgbWltZSB0eXBlIGlzIG5vdCBhdmFpbGFibGUgb3IgaXMgc29tZSB3ZSBjYW4ndCBwcm9jZXNzLlxyXG4gICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL0tocm9ub3NHcm91cC9nbFRGL3RyZWUvbWFzdGVyL3NwZWNpZmljYXRpb24vMi4wI2ltYWdlc1xyXG4gICAgICAgICAgICAgICAgLy8gPiBXaGVuIGltYWdlIGRhdGEgaXMgcHJvdmlkZWQgYnkgdXJpIGFuZCBtaW1lVHlwZSBpcyBkZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgLy8gPiBjbGllbnQgaW1wbGVtZW50YXRpb25zIHNob3VsZCBwcmVmZXIgSlNPTi1kZWZpbmVkIE1JTUUgVHlwZSBvdmVyIG9uZSBwcm92aWRlZCBieSB0cmFuc3BvcnQgbGF5ZXIuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBtaW1lVHlwZSA9IGdsVEZJbWFnZS5taW1lVHlwZSA/PyBpbWFnZS5taW1lVHlwZTtcclxuICAgICAgICAgICAgICAgIGlmIChtaW1lVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4dE5hbWUgPSBpbWFnZU1pbWVUeXBlVG9FeHQobWltZVR5cGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFleHROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0TmFtZSA9IGltYWdlLmV4dE5hbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIWV4dE5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gaW1hZ2UgdHlwZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGV0IGltYWdlRGF0YTogQnVmZmVyIHwgc3RyaW5nID0gaW1hZ2UuZGF0YTtcclxuICAgICAgICAgICAgICAgIGlmIChleHROYW1lLnRvTG93ZXJDYXNlKCkgPT09ICcudGdhJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZCA9IGF3YWl0IGNvbnZlcnRUR0EoaW1hZ2VEYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29udmVydGVkIGluc3RhbmNlb2YgRXJyb3IgfHwgIWNvbnZlcnRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGkxOG5UcmFuc2xhdGUoJ2ltcG9ydGVyLmdsdGYuZmFpbGVkX3RvX2NvbnZlcnRfdGdhJyksIGxpbmtUb0Fzc2V0VGFyZ2V0KGFzc2V0LnV1aWQpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBleHROYW1lID0gY29udmVydGVkLmV4dE5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VEYXRhID0gY29udmVydGVkLmRhdGE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV4dE5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJy5wc2QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udmVydGVkID0gYXdhaXQgY29udmVydFBTRChpbWFnZURhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICh7IGV4dE5hbWUsIGRhdGE6IGltYWdlRGF0YSB9ID0gY29udmVydGVkKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXh0TmFtZS50b0xvd2VyQ2FzZSgpID09PSAnLmV4cicpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZW1wRmlsZSA9IGpvaW4oYXNzZXQudGVtcCwgYGltYWdlJHtleHROYW1lfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IG91dHB1dEZpbGUodGVtcEZpbGUsIGltYWdlRGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyDpnIDopoHkuI4gaW1hZ2UvaW5kZXgg5pW05ZCI5aSN55SoIGh0dHBzOi8vZ2l0aHViLmNvbS9jb2Nvcy8zZC10YXNrcy9pc3N1ZXMvMTkwOTJcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb252ZXJ0ZWQgPSBhd2FpdCBjb252ZXJ0SERST3JFWFIoZXh0TmFtZSwgdGVtcEZpbGUsIGFzc2V0LnV1aWQsIGFzc2V0LnRlbXApO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb252ZXJ0ZWQgaW5zdGFuY2VvZiBFcnJvciB8fCAhY29udmVydGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoaTE4blRyYW5zbGF0ZSgnaW1wb3J0ZXIuZ2x0Zi5mYWlsZWRfdG9fY29udmVydF90Z2EnKSwgbGlua1RvQXNzZXRUYXJnZXQoYXNzZXQudXVpZCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGV4dE5hbWUgPSBjb252ZXJ0ZWQuZXh0TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZURhdGEgPSBjb252ZXJ0ZWQuc291cmNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaW1hZ2VBc3NldC5fc2V0UmF3QXNzZXQoZXh0TmFtZSk7XHJcbiAgICAgICAgICAgICAgICBhc3NldC51c2VyRGF0YS5maXhBbHBoYVRyYW5zcGFyZW5jeUFydGlmYWN0cyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAvLyDlkoxpbWFnZUltcG9ydOS/neaMgeS4gOiHtCBjb2Nvcy8zZC10YXNrcyMxMzY0MVxyXG4gICAgICAgICAgICAgICAgaW1hZ2VEYXRhID0gYXdhaXQgaGFuZGxlSW1hZ2VVc2VyRGF0YShhc3NldCwgaW1hZ2VEYXRhLCBleHROYW1lKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IGFzc2V0LnNhdmVUb0xpYnJhcnkoZXh0TmFtZSwgaW1hZ2VEYXRhKTtcclxuICAgICAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2ltYWdlRXh0TmFtZScsIGV4dE5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBzZXJpYWxpemVKU09OID0gRWRpdG9yRXh0ZW5kcy5zZXJpYWxpemUoaW1hZ2VBc3NldCk7XHJcbiAgICAgICAgICAgIGF3YWl0IGFzc2V0LnNhdmVUb0xpYnJhcnkoJy5qc29uJywgc2VyaWFsaXplSlNPTik7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRzID0gZ2V0RGVwZW5kVVVJRExpc3Qoc2VyaWFsaXplSlNPTik7XHJcbiAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBkZXBlbmRzKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgR2x0ZkltYWdlSGFuZGxlcjtcclxuXHJcbmZ1bmN0aW9uIHJlc29sdmVJbWFnZURhdGFVUkkodXJpOiBEYXRhVVJJLkRhdGFVUkkpOiB7IGRhdGE6IEJ1ZmZlcjsgbWltZVR5cGU6IHN0cmluZyB9IHtcclxuICAgIGlmICghdXJpLmJhc2U2NCB8fCAhdXJpLm1lZGlhVHlwZSB8fCB1cmkubWVkaWFUeXBlLnR5cGUgIT09ICdpbWFnZScpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCB1bmRlcnN0YW5kIGRhdGEgdXJpKGJhc2U2NDogJHt1cmkuYmFzZTY0fSwgbWVkaWFUeXBlOiAke3VyaS5tZWRpYVR5cGV9KSBmb3IgaW1hZ2UuYCk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBkYXRhID0gZGVjb2RlQmFzZTY0VG9BcnJheUJ1ZmZlcih1cmkuZGF0YSk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGRhdGE6IEJ1ZmZlci5mcm9tKGRhdGEpLFxyXG4gICAgICAgIG1pbWVUeXBlOiB1cmkubWVkaWFUeXBlLnZhbHVlLFxyXG4gICAgfTtcclxufVxyXG4iXX0=