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
exports.ERPTextureCubeHandler = exports.MipmapMode = void 0;
exports.checkSize = checkSize;
const asset_db_1 = require("@cocos/asset-db");
const texture_base_1 = require("./texture-base");
const equirect_cubemap_faces_1 = require("./utils/equirect-cubemap-faces");
const cc = __importStar(require("cc"));
const cube_map_simple_layout_1 = require("./utils/cube-map-simple-layout");
const sharp_1 = __importDefault(require("sharp"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const fs_extra_2 = require("fs-extra");
const utils_1 = require("../utils");
const utils_2 = require("./image/utils");
const global_1 = require("../../../../global");
const utils_3 = __importDefault(require("../../../base/utils"));
const verticalCount = 2;
/**
 * @en The way to fill mipmaps.
 * @zh 填充mipmaps的方式。
 */
var MipmapMode;
(function (MipmapMode) {
    /**
     * @zh
     * 不使用mipmaps
     * @en
     * Not using mipmaps
     * @readonly
     */
    MipmapMode[MipmapMode["NONE"] = 0] = "NONE";
    /**
     * @zh
     * 使用自动生成的mipmaps
     * @en
     * Using the automatically generated mipmaps
     * @readonly
     */
    MipmapMode[MipmapMode["AUTO"] = 1] = "AUTO";
    /**
     * @zh
     * 使用卷积图填充mipmaps
     * @en
     * Filling mipmaps with convolutional maps
     * @readonly
     */
    MipmapMode[MipmapMode["BAKED_CONVOLUTION_MAP"] = 2] = "BAKED_CONVOLUTION_MAP";
})(MipmapMode || (exports.MipmapMode = MipmapMode = {}));
exports.ERPTextureCubeHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'erp-texture-cube',
    assetType: 'cc.TextureCube',
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.10',
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
            if (Object.getOwnPropertyNames(asset.userData).length === 0) {
                asset.assignUserData((0, utils_2.makeDefaultTextureCubeAssetUserData)(), true);
            }
            const userData = asset.userData;
            const imageAsset = (0, asset_db_1.queryAsset)(userData.imageDatabaseUri);
            if (!imageAsset) {
                return false;
            }
            let imageSource;
            // @ts-ignore parent
            const ext = asset.parent.extname?.toLowerCase();
            // image 导入器对这些类型进行了转换
            if (['.tga', '.hdr', '.bmp', '.psd', '.tif', '.tiff', '.exr'].includes(ext) || !ext) {
                imageSource = imageAsset.library + '.png';
            }
            else {
                imageSource = imageAsset.source;
            }
            // const imageSource = queryPath(userData.imageDatabaseUri as string);
            // if (!imageSource) {
            //     return false;
            // }
            const image = (0, sharp_1.default)(imageSource);
            const imageMetadata = await image.metadata();
            const width = imageMetadata.width;
            const height = imageMetadata.height;
            //need bakeOfflineMipmaps
            switch (asset.userData.mipBakeMode) {
                case MipmapMode.BAKED_CONVOLUTION_MAP: {
                    const file = asset.parent.source;
                    let outWithoutExtname = (0, path_1.join)(asset.temp, 'mipmap');
                    const convolutionDir = getDirOfMipmaps(imageAsset.source, ext);
                    if (isNeedConvolution(convolutionDir)) {
                        const vectorParams = [
                            '--srcFaceSize',
                            '768',
                            '--mipatlas',
                            '--filter',
                            'radiance',
                            '--lightingModel',
                            'ggx',
                            '--excludeBase',
                            'true',
                            '--output0params',
                            userData.isRGBE ? 'png,rgbm,facelist' : 'png,bgra8,facelist', // LDR: 'png,bgra8,facelist', HDR: 'png,rgbm,facelist',
                            '--input',
                            file,
                            '--output0',
                            outWithoutExtname,
                        ];
                        if (userData.isRGBE && !['.hdr', '.exr'].includes(ext)) {
                            vectorParams.splice(0, 0, '--rgbm');
                        }
                        (0, fs_extra_2.ensureDirSync)(asset.temp);
                        console.log(`Start to bake asset {asset[${asset.uuid}](${asset.uuid})}`);
                        const cmdTool = (0, path_1.join)(global_1.GlobalPaths.staticDir, 'tools/cmft/cmftRelease64') + (process.platform === 'win32' ? '.exe' : '');
                        await utils_3.default.Process.quickSpawn(cmdTool, vectorParams, {
                            stdio: 'inherit',
                        });
                    }
                    else {
                        outWithoutExtname = (0, path_1.join)(convolutionDir, 'mipmap');
                    }
                    const faces = ['right', 'left', 'top', 'bottom', 'front', 'back'];
                    const mipmapAtlas = {};
                    const mipmapLayoutList = [];
                    const swapSpaceMip = asset.getSwapSpace();
                    for (let i = 0; i < faces.length; i++) {
                        // 6 个面的 atlas
                        const fileName = `${outWithoutExtname}_${i}.png`;
                        //拷贝mipmaps到project目录
                        saveMipmaps(fileName, convolutionDir);
                        const imageFace = (0, sharp_1.default)(fileName);
                        const imageFaceMetadata = await imageFace.metadata();
                        const width = imageFaceMetadata.width;
                        mipmapLayoutList[i] = getMipmapLayout(width);
                        const faceName = faces[i];
                        const faceImageData = await imageFace.toFormat(sharp_1.default.format.png).toBuffer();
                        swapSpaceMip[faceName] = faceImageData;
                        const faceAsset = await asset.createSubAsset(faceName, 'texture-cube-face');
                        mipmapAtlas[faceName] = EditorExtends.serialize.asAsset(faceAsset.uuid, cc.ImageAsset);
                    }
                    const texture = new cc.TextureCube();
                    (0, texture_base_1.applyTextureBaseAssetUserData)(userData, texture);
                    texture.isRGBE = userData.isRGBE;
                    texture._mipmapMode = MipmapMode.BAKED_CONVOLUTION_MAP;
                    texture._mipmapAtlas = {
                        atlas: mipmapAtlas,
                        layout: mipmapLayoutList[0],
                    };
                    const serializeJSON = EditorExtends.serialize(texture);
                    await asset.saveToLibrary('.json', serializeJSON);
                    const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
                    asset.setData('depends', depends);
                    return true;
                }
            }
            let mipmapData;
            const simpleLayout = (0, cube_map_simple_layout_1.matchSimpleLayout)(width, height);
            if (simpleLayout) {
                mipmapData = await _getFacesInSimpleLayout(imageSource, simpleLayout);
            }
            else {
                mipmapData = await _getFacesInEquirectangularProjected(imageSource, userData.faceSize === 0 ? undefined : userData.faceSize, userData.isRGBE);
            }
            const mipmap = {};
            const swapSpace = asset.getSwapSpace();
            for (const faceName of Object.getOwnPropertyNames(mipmapData)) {
                const faceImageData = mipmapData[faceName];
                swapSpace[faceName] = faceImageData;
                const faceAsset = await asset.createSubAsset(faceName, 'texture-cube-face');
                // @ts-ignore
                mipmap[faceName] = EditorExtends.serialize.asAsset(faceAsset.uuid, cc.ImageAsset);
            }
            const texture = new cc.TextureCube();
            (0, texture_base_1.applyTextureBaseAssetUserData)(userData, texture);
            texture.isRGBE = userData.isRGBE;
            texture._mipmaps = [mipmap];
            const serializeJSON = EditorExtends.serialize(texture);
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            return true;
        },
    },
};
exports.default = exports.ERPTextureCubeHandler;
async function _getFacesInSimpleLayout(imageSource, layout) {
    const mipmapData = {};
    const faceNames = Object.getOwnPropertyNames(layout);
    for (const faceName of faceNames) {
        // @ts-expect-error To keep consistent order
        mipmapData[faceName] = undefined;
    }
    await Promise.all(faceNames.map(async (faceName) => {
        const faceBlit = layout[faceName];
        // 最新版本 sharp 0.32.6 连续裁剪时使用同一个 image sharp 对象会裁剪异常，需要重新创建
        const image = (0, sharp_1.default)(imageSource);
        const faceSharp = image.extract({
            left: faceBlit.x,
            top: faceBlit.y,
            width: faceBlit.width,
            height: faceBlit.height,
        });
        const faceImageData = await faceSharp.toFormat(sharp_1.default.format.png).toBuffer();
        mipmapData[faceName] = faceImageData;
    }));
    return mipmapData;
}
async function _getFacesInEquirectangularProjected(imageSource, faceSize, isRGBE) {
    const buffer = await (0, fs_extra_1.readFile)(imageSource);
    const sharpResult = await (0, sharp_1.default)(buffer);
    const meta = await sharpResult.metadata();
    if (!faceSize) {
        faceSize = (0, equirect_cubemap_faces_1.nearestPowerOfTwo)((meta.width || 0) / 4) | 0;
    }
    // 分割图片
    const faceArray = await (0, equirect_cubemap_faces_1.equirectToCubemapFaces)(sharpResult, faceSize, {
        isRGBE,
    });
    if (faceArray.length !== 6) {
        throw new Error('Failed to resolve equirectangular projection image.');
    }
    // const faces = await Promise.all(faceArray.map(getCanvasData));
    return {
        right: await (0, sharp_1.default)(Buffer.from(faceArray[0].data), { raw: { width: faceSize, height: faceSize, channels: 4 } })
            .toFormat(meta.format || 'png')
            .toBuffer(),
        left: await (0, sharp_1.default)(Buffer.from(faceArray[1].data), { raw: { width: faceSize, height: faceSize, channels: 4 } })
            .toFormat(meta.format || 'png')
            .toBuffer(),
        top: await (0, sharp_1.default)(Buffer.from(faceArray[2].data), { raw: { width: faceSize, height: faceSize, channels: 4 } })
            .toFormat(meta.format || 'png')
            .toBuffer(),
        bottom: await (0, sharp_1.default)(Buffer.from(faceArray[3].data), { raw: { width: faceSize, height: faceSize, channels: 4 } })
            .toFormat(meta.format || 'png')
            .toBuffer(),
        front: await (0, sharp_1.default)(Buffer.from(faceArray[4].data), { raw: { width: faceSize, height: faceSize, channels: 4 } })
            .toFormat(meta.format || 'png')
            .toBuffer(),
        back: await (0, sharp_1.default)(Buffer.from(faceArray[5].data), { raw: { width: faceSize, height: faceSize, channels: 4 } })
            .toFormat(meta.format || 'png')
            .toBuffer(),
    };
}
function getTop(level, mipmapLayout) {
    if (level == 0) {
        return 0;
    }
    else {
        return mipmapLayout.length > 0 ? mipmapLayout[0].height : 0;
    }
}
function getLeft(level, mipmapLayout) {
    //前两张mipmap纵置布局
    if (level < verticalCount) {
        return 0;
    }
    let left = 0;
    for (let i = verticalCount - 1; i < mipmapLayout.length; i++) {
        if (i >= level) {
            break;
        }
        left += mipmapLayout[i].width;
    }
    return left;
}
/**
 * 计算约定好的mipmap布局，前两张mipmap纵向排列，后面接第二张横向排列。
 * @param size 是level 0的尺寸
 */
function getMipmapLayout(size) {
    const mipmapLayout = [];
    let level = 0;
    while (size) {
        mipmapLayout.push({
            left: getLeft(level, mipmapLayout),
            top: getTop(level, mipmapLayout),
            width: size,
            height: size,
            level: level++,
        });
        size >>= 1;
    }
    return mipmapLayout;
}
/**
 * 获取mipmap的保存目录
 * 反射探针烘焙图的目录结构：场景名 + 文件名_convolution
 * 其他情况烘焙图的目录结构: 文件名 + _convolution
 */
function getDirOfMipmaps(filePath, ext) {
    const basePath = (0, path_1.dirname)(filePath);
    const baseName = (0, path_1.basename)(filePath, ext);
    return (0, path_1.join)(basePath, baseName + '_convolution');
}
/**
 * 如果project目录存有上次卷积的结果，无需再次做卷积以节省导入时间
 */
function isNeedConvolution(convolutionDir) {
    if (!(0, fs_extra_1.existsSync)(convolutionDir)) {
        return true;
    }
    const faceCount = 6;
    for (let i = 0; i < faceCount; i++) {
        const filePath = (0, path_1.join)(convolutionDir, 'mipmap_' + i.toString() + '.png');
        if (!(0, fs_extra_1.existsSync)(filePath)) {
            return true;
        }
    }
    return false;
}
/**
 * 保存卷积工具生成的mipmaps
 */
function saveMipmaps(filePath, destPath) {
    if (!(0, fs_extra_1.existsSync)(destPath)) {
        (0, fs_extra_2.ensureDirSync)(destPath);
    }
    (0, fs_extra_1.copyFileSync)(filePath, (0, path_1.join)(destPath, (0, path_1.basename)(filePath)));
}
function checkSize(width, height) {
    return width * 4 === height * 3 || width * 3 === height * 4 || width * 6 === height || width === height * 6 || width === height * 2;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJwLXRleHR1cmUtY3ViZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy9lcnAtdGV4dHVyZS1jdWJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaVliLDhCQUVDO0FBallELDhDQUEyRDtBQUMzRCxpREFBK0Q7QUFDL0QsMkVBQTJGO0FBQzNGLHVDQUF5QjtBQUN6QiwyRUFBa0Y7QUFFbEYsa0RBQTBCO0FBQzFCLHVDQUE4RDtBQUM5RCwrQkFBK0M7QUFDL0MsdUNBQXlDO0FBRXpDLG9DQUE2QztBQUc3Qyx5Q0FBb0U7QUFDcEUsK0NBQWlEO0FBQ2pELGdFQUF3QztBQUt4QyxNQUFNLGFBQWEsR0FBRyxDQUFDLENBQUM7QUFTeEI7OztHQUdHO0FBQ0gsSUFBWSxVQXlCWDtBQXpCRCxXQUFZLFVBQVU7SUFDbEI7Ozs7OztPQU1HO0lBQ0gsMkNBQVEsQ0FBQTtJQUNSOzs7Ozs7T0FNRztJQUNILDJDQUFRLENBQUE7SUFDUjs7Ozs7O09BTUc7SUFDSCw2RUFBeUIsQ0FBQTtBQUM3QixDQUFDLEVBekJXLFVBQVUsMEJBQVYsVUFBVSxRQXlCckI7QUFFWSxRQUFBLHFCQUFxQixHQUFpQjtJQUMvQyxnQ0FBZ0M7SUFDaEMsSUFBSSxFQUFFLGtCQUFrQjtJQUN4QixTQUFTLEVBQUUsZ0JBQWdCO0lBRTNCLFFBQVEsRUFBRTtRQUNOLG1CQUFtQjtRQUNuQixPQUFPLEVBQUUsUUFBUTtRQUNqQjs7Ozs7Ozs7V0FRRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBbUI7WUFDNUIsSUFBSSxNQUFNLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDMUQsS0FBSyxDQUFDLGNBQWMsQ0FB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LEtBQUssTUFBTSxHQUFHLENBQUMsSUFBSSxLQUFLLEtBQUssTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN4SSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgcXVlcnlBc3NldCwgVmlydHVhbEFzc2V0IH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0IHsgYXBwbHlUZXh0dXJlQmFzZUFzc2V0VXNlckRhdGEgfSBmcm9tICcuL3RleHR1cmUtYmFzZSc7XHJcbmltcG9ydCB7IGVxdWlyZWN0VG9DdWJlbWFwRmFjZXMsIG5lYXJlc3RQb3dlck9mVHdvIH0gZnJvbSAnLi91dGlscy9lcXVpcmVjdC1jdWJlbWFwLWZhY2VzJztcclxuaW1wb3J0ICogYXMgY2MgZnJvbSAnY2MnO1xyXG5pbXBvcnQgeyBJU2ltcGxlTGF5b3V0LCBtYXRjaFNpbXBsZUxheW91dCB9IGZyb20gJy4vdXRpbHMvY3ViZS1tYXAtc2ltcGxlLWxheW91dCc7XHJcblxyXG5pbXBvcnQgc2hhcnAgZnJvbSAnc2hhcnAnO1xyXG5pbXBvcnQgeyBjb3B5RmlsZVN5bmMsIGV4aXN0c1N5bmMsIHJlYWRGaWxlIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBiYXNlbmFtZSwgZGlybmFtZSwgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBlbnN1cmVEaXJTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5cclxuaW1wb3J0IHsgZ2V0RGVwZW5kVVVJRExpc3QgfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB7IEFzc2V0SGFuZGxlciB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBUZXh0dXJlQ3ViZUFzc2V0VXNlckRhdGEgfSBmcm9tICcuLi8uLi9AdHlwZXMvdXNlckRhdGFzJztcclxuaW1wb3J0IHsgbWFrZURlZmF1bHRUZXh0dXJlQ3ViZUFzc2V0VXNlckRhdGEgfSBmcm9tICcuL2ltYWdlL3V0aWxzJztcclxuaW1wb3J0IHsgR2xvYmFsUGF0aHMgfSBmcm9tICcuLi8uLi8uLi8uLi9nbG9iYWwnO1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vLi4vLi4vYmFzZS91dGlscyc7XHJcblxyXG50eXBlIElUZXh0dXJlQ3ViZU1pcE1hcCA9IGNjLlRleHR1cmVDdWJlWydtaXBtYXBzJ11bMF07XHJcblxyXG50eXBlIElUZXh0dXJlRmFjZU1pcE1hcERhdGEgPSBSZWNvcmQ8a2V5b2YgSVRleHR1cmVDdWJlTWlwTWFwLCBCdWZmZXI+O1xyXG5jb25zdCB2ZXJ0aWNhbENvdW50ID0gMjtcclxuXHJcbmludGVyZmFjZSBJTWlwbWFwQXRsYXNMYXlvdXQge1xyXG4gICAgbGVmdDogbnVtYmVyO1xyXG4gICAgdG9wOiBudW1iZXI7XHJcbiAgICB3aWR0aDogbnVtYmVyO1xyXG4gICAgaGVpZ2h0OiBudW1iZXI7XHJcbiAgICBsZXZlbDogbnVtYmVyO1xyXG59XHJcbi8qKlxyXG4gKiBAZW4gVGhlIHdheSB0byBmaWxsIG1pcG1hcHMuXHJcbiAqIEB6aCDloavlhYVtaXBtYXBz55qE5pa55byP44CCXHJcbiAqL1xyXG5leHBvcnQgZW51bSBNaXBtYXBNb2RlIHtcclxuICAgIC8qKlxyXG4gICAgICogQHpoXHJcbiAgICAgKiDkuI3kvb/nlKhtaXBtYXBzXHJcbiAgICAgKiBAZW5cclxuICAgICAqIE5vdCB1c2luZyBtaXBtYXBzXHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgTk9ORSA9IDAsXHJcbiAgICAvKipcclxuICAgICAqIEB6aFxyXG4gICAgICog5L2/55So6Ieq5Yqo55Sf5oiQ55qEbWlwbWFwc1xyXG4gICAgICogQGVuXHJcbiAgICAgKiBVc2luZyB0aGUgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQgbWlwbWFwc1xyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIEFVVE8gPSAxLFxyXG4gICAgLyoqXHJcbiAgICAgKiBAemhcclxuICAgICAqIOS9v+eUqOWNt+enr+WbvuWhq+WFhW1pcG1hcHNcclxuICAgICAqIEBlblxyXG4gICAgICogRmlsbGluZyBtaXBtYXBzIHdpdGggY29udm9sdXRpb25hbCBtYXBzXHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgQkFLRURfQ09OVk9MVVRJT05fTUFQID0gMixcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IEVSUFRleHR1cmVDdWJlSGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICdlcnAtdGV4dHVyZS1jdWJlJyxcclxuICAgIGFzc2V0VHlwZTogJ2NjLlRleHR1cmVDdWJlJyxcclxuXHJcbiAgICBpbXBvcnRlcjoge1xyXG4gICAgICAgIC8vIOeJiOacrOWPt+WmguaenOWPmOabtO+8jOWImeS8muW8uuWItumHjeaWsOWvvOWFpVxyXG4gICAgICAgIHZlcnNpb246ICcxLjAuMTAnLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWunumZheWvvOWFpea1geeoi1xyXG4gICAgICAgICAqIOmcgOimgeiHquW3seaOp+WItuaYr+WQpueUn+aIkOOAgeaLt+i0neaWh+S7tlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICog6L+U5Zue5piv5ZCm5a+85YWl5oiQ5Yqf55qE5qCH6K6wXHJcbiAgICAgICAgICog5aaC5p6c6L+U5ZueIGZhbHNl77yM5YiZIGltcG9ydGVkIOagh+iusOS4jeS8muWPmOaIkCB0cnVlXHJcbiAgICAgICAgICog5ZCO57ut55qE5LiA57O75YiX5pON5L2c6YO95LiN5Lya5omn6KGMXHJcbiAgICAgICAgICogQHBhcmFtIGFzc2V0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXN5bmMgaW1wb3J0KGFzc2V0OiBWaXJ0dWFsQXNzZXQpIHtcclxuICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFzc2V0LnVzZXJEYXRhKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGFzc2V0LmFzc2lnblVzZXJEYXRhKG1ha2VEZWZhdWx0VGV4dHVyZUN1YmVBc3NldFVzZXJEYXRhKCksIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCB1c2VyRGF0YSA9IGFzc2V0LnVzZXJEYXRhIGFzIFRleHR1cmVDdWJlQXNzZXRVc2VyRGF0YTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlQXNzZXQgPSBxdWVyeUFzc2V0KHVzZXJEYXRhLmltYWdlRGF0YWJhc2VVcmkgYXMgc3RyaW5nKTtcclxuICAgICAgICAgICAgaWYgKCFpbWFnZUFzc2V0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGltYWdlU291cmNlO1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIHBhcmVudFxyXG4gICAgICAgICAgICBjb25zdCBleHQgPSBhc3NldC5wYXJlbnQuZXh0bmFtZT8udG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgLy8gaW1hZ2Ug5a+85YWl5Zmo5a+56L+Z5Lqb57G75Z6L6L+b6KGM5LqG6L2s5o2iXHJcbiAgICAgICAgICAgIGlmIChbJy50Z2EnLCAnLmhkcicsICcuYm1wJywgJy5wc2QnLCAnLnRpZicsICcudGlmZicsICcuZXhyJ10uaW5jbHVkZXMoZXh0KSB8fCAhZXh0KSB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZVNvdXJjZSA9IGltYWdlQXNzZXQubGlicmFyeSArICcucG5nJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGltYWdlU291cmNlID0gaW1hZ2VBc3NldC5zb3VyY2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGNvbnN0IGltYWdlU291cmNlID0gcXVlcnlQYXRoKHVzZXJEYXRhLmltYWdlRGF0YWJhc2VVcmkgYXMgc3RyaW5nKTtcclxuICAgICAgICAgICAgLy8gaWYgKCFpbWFnZVNvdXJjZSkge1xyXG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBpbWFnZSA9IHNoYXJwKGltYWdlU291cmNlKTtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2VNZXRhZGF0YSA9IGF3YWl0IGltYWdlLm1ldGFkYXRhKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gaW1hZ2VNZXRhZGF0YS53aWR0aCE7XHJcbiAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IGltYWdlTWV0YWRhdGEuaGVpZ2h0ITtcclxuXHJcbiAgICAgICAgICAgIC8vbmVlZCBiYWtlT2ZmbGluZU1pcG1hcHNcclxuICAgICAgICAgICAgc3dpdGNoIChhc3NldC51c2VyRGF0YS5taXBCYWtlTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBNaXBtYXBNb2RlLkJBS0VEX0NPTlZPTFVUSU9OX01BUDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBhc3NldC5wYXJlbnQhLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgb3V0V2l0aG91dEV4dG5hbWUgPSBqb2luKGFzc2V0LnRlbXAsICdtaXBtYXAnKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb252b2x1dGlvbkRpciA9IGdldERpck9mTWlwbWFwcyhpbWFnZUFzc2V0LnNvdXJjZSwgZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNOZWVkQ29udm9sdXRpb24oY29udm9sdXRpb25EaXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZlY3RvclBhcmFtcyA9IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICctLXNyY0ZhY2VTaXplJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc3NjgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy0tbWlwYXRsYXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy0tZmlsdGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdyYWRpYW5jZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLS1saWdodGluZ01vZGVsJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdnZ3gnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy0tZXhjbHVkZUJhc2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RydWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy0tb3V0cHV0MHBhcmFtcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YS5pc1JHQkUgPyAncG5nLHJnYm0sZmFjZWxpc3QnIDogJ3BuZyxiZ3JhOCxmYWNlbGlzdCcsIC8vIExEUjogJ3BuZyxiZ3JhOCxmYWNlbGlzdCcsIEhEUjogJ3BuZyxyZ2JtLGZhY2VsaXN0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICctLWlucHV0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLS1vdXRwdXQwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dFdpdGhvdXRFeHRuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXJEYXRhLmlzUkdCRSAmJiAhWycuaGRyJywgJy5leHInXS5pbmNsdWRlcyhleHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZWN0b3JQYXJhbXMuc3BsaWNlKDAsIDAsICctLXJnYm0nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZW5zdXJlRGlyU3luYyhhc3NldC50ZW1wKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBTdGFydCB0byBiYWtlIGFzc2V0IHthc3NldFske2Fzc2V0LnV1aWR9XSgke2Fzc2V0LnV1aWR9KX1gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNtZFRvb2wgPSBqb2luKEdsb2JhbFBhdGhzLnN0YXRpY0RpciwgJ3Rvb2xzL2NtZnQvY21mdFJlbGVhc2U2NCcpICsgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgPyAnLmV4ZScgOiAnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHV0aWxzLlByb2Nlc3MucXVpY2tTcGF3bihjbWRUb29sLCB2ZWN0b3JQYXJhbXMsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZGlvOiAnaW5oZXJpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dFdpdGhvdXRFeHRuYW1lID0gam9pbihjb252b2x1dGlvbkRpciwgJ21pcG1hcCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmFjZXMgPSBbJ3JpZ2h0JywgJ2xlZnQnLCAndG9wJywgJ2JvdHRvbScsICdmcm9udCcsICdiYWNrJ107XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWlwbWFwQXRsYXM6IGFueSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1pcG1hcExheW91dExpc3QgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3dhcFNwYWNlTWlwID0gYXNzZXQuZ2V0U3dhcFNwYWNlPElGYWNlU3dhcFNwYWNlPigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZhY2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDYg5Liq6Z2i55qEIGF0bGFzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVOYW1lID0gYCR7b3V0V2l0aG91dEV4dG5hbWV9XyR7aX0ucG5nYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy/mi7fotJ1taXBtYXBz5YiwcHJvamVjdOebruW9lVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlTWlwbWFwcyhmaWxlTmFtZSwgY29udm9sdXRpb25EaXIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1hZ2VGYWNlID0gc2hhcnAoZmlsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWFnZUZhY2VNZXRhZGF0YSA9IGF3YWl0IGltYWdlRmFjZS5tZXRhZGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB3aWR0aCA9IGltYWdlRmFjZU1ldGFkYXRhLndpZHRoITtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWlwbWFwTGF5b3V0TGlzdFtpXSA9IGdldE1pcG1hcExheW91dCh3aWR0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmYWNlTmFtZSA9IGZhY2VzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmYWNlSW1hZ2VEYXRhID0gYXdhaXQgaW1hZ2VGYWNlLnRvRm9ybWF0KHNoYXJwLmZvcm1hdC5wbmcpLnRvQnVmZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3YXBTcGFjZU1pcFtmYWNlTmFtZV0gPSBmYWNlSW1hZ2VEYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmYWNlQXNzZXQgPSBhd2FpdCBhc3NldC5jcmVhdGVTdWJBc3NldChmYWNlTmFtZSwgJ3RleHR1cmUtY3ViZS1mYWNlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pcG1hcEF0bGFzW2ZhY2VOYW1lXSA9IEVkaXRvckV4dGVuZHMuc2VyaWFsaXplLmFzQXNzZXQoZmFjZUFzc2V0LnV1aWQsIGNjLkltYWdlQXNzZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dHVyZSA9IG5ldyBjYy5UZXh0dXJlQ3ViZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcGx5VGV4dHVyZUJhc2VBc3NldFVzZXJEYXRhKHVzZXJEYXRhLCB0ZXh0dXJlKTtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmlzUkdCRSA9IHVzZXJEYXRhLmlzUkdCRTtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLl9taXBtYXBNb2RlID0gTWlwbWFwTW9kZS5CQUtFRF9DT05WT0xVVElPTl9NQVAgYXMgbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHR1cmUuX21pcG1hcEF0bGFzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdGxhczogbWlwbWFwQXRsYXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogbWlwbWFwTGF5b3V0TGlzdFswXSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXJpYWxpemVKU09OID0gRWRpdG9yRXh0ZW5kcy5zZXJpYWxpemUodGV4dHVyZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgYXNzZXQuc2F2ZVRvTGlicmFyeSgnLmpzb24nLCBzZXJpYWxpemVKU09OKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVwZW5kcyA9IGdldERlcGVuZFVVSURMaXN0KHNlcmlhbGl6ZUpTT04pO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBkZXBlbmRzKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG1pcG1hcERhdGE6IElUZXh0dXJlRmFjZU1pcE1hcERhdGE7XHJcbiAgICAgICAgICAgIGNvbnN0IHNpbXBsZUxheW91dCA9IG1hdGNoU2ltcGxlTGF5b3V0KHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICBpZiAoc2ltcGxlTGF5b3V0KSB7XHJcbiAgICAgICAgICAgICAgICBtaXBtYXBEYXRhID0gYXdhaXQgX2dldEZhY2VzSW5TaW1wbGVMYXlvdXQoaW1hZ2VTb3VyY2UsIHNpbXBsZUxheW91dCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBtaXBtYXBEYXRhID0gYXdhaXQgX2dldEZhY2VzSW5FcXVpcmVjdGFuZ3VsYXJQcm9qZWN0ZWQoXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VTb3VyY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGEuZmFjZVNpemUgPT09IDAgPyB1bmRlZmluZWQgOiB1c2VyRGF0YS5mYWNlU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YS5pc1JHQkUsXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBtaXBtYXAgPSB7fSBhcyBJVGV4dHVyZUN1YmVNaXBNYXA7XHJcbiAgICAgICAgICAgIGNvbnN0IHN3YXBTcGFjZSA9IGFzc2V0LmdldFN3YXBTcGFjZTxJRmFjZVN3YXBTcGFjZT4oKTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBmYWNlTmFtZSBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhtaXBtYXBEYXRhKSBhcyAoa2V5b2YgdHlwZW9mIG1pcG1hcERhdGEpW10pIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZhY2VJbWFnZURhdGEgPSBtaXBtYXBEYXRhW2ZhY2VOYW1lXTtcclxuICAgICAgICAgICAgICAgIHN3YXBTcGFjZVtmYWNlTmFtZV0gPSBmYWNlSW1hZ2VEYXRhO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmFjZUFzc2V0ID0gYXdhaXQgYXNzZXQuY3JlYXRlU3ViQXNzZXQoZmFjZU5hbWUsICd0ZXh0dXJlLWN1YmUtZmFjZScpO1xyXG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgbWlwbWFwW2ZhY2VOYW1lXSA9IEVkaXRvckV4dGVuZHMuc2VyaWFsaXplLmFzQXNzZXQoZmFjZUFzc2V0LnV1aWQsIGNjLkltYWdlQXNzZXQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCB0ZXh0dXJlID0gbmV3IGNjLlRleHR1cmVDdWJlKCk7XHJcbiAgICAgICAgICAgIGFwcGx5VGV4dHVyZUJhc2VBc3NldFVzZXJEYXRhKHVzZXJEYXRhLCB0ZXh0dXJlKTtcclxuICAgICAgICAgICAgdGV4dHVyZS5pc1JHQkUgPSB1c2VyRGF0YS5pc1JHQkU7XHJcbiAgICAgICAgICAgIHRleHR1cmUuX21pcG1hcHMgPSBbbWlwbWFwXTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZUpTT04gPSBFZGl0b3JFeHRlbmRzLnNlcmlhbGl6ZSh0ZXh0dXJlKTtcclxuICAgICAgICAgICAgYXdhaXQgYXNzZXQuc2F2ZVRvTGlicmFyeSgnLmpzb24nLCBzZXJpYWxpemVKU09OKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRlcGVuZHMgPSBnZXREZXBlbmRVVUlETGlzdChzZXJpYWxpemVKU09OKTtcclxuICAgICAgICAgICAgYXNzZXQuc2V0RGF0YSgnZGVwZW5kcycsIGRlcGVuZHMpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBFUlBUZXh0dXJlQ3ViZUhhbmRsZXI7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBfZ2V0RmFjZXNJblNpbXBsZUxheW91dChpbWFnZVNvdXJjZTogc3RyaW5nLCBsYXlvdXQ6IElTaW1wbGVMYXlvdXQpOiBQcm9taXNlPElUZXh0dXJlRmFjZU1pcE1hcERhdGE+IHtcclxuICAgIGNvbnN0IG1pcG1hcERhdGEgPSB7fSBhcyBJVGV4dHVyZUZhY2VNaXBNYXBEYXRhO1xyXG4gICAgY29uc3QgZmFjZU5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobGF5b3V0KSBhcyAoa2V5b2YgdHlwZW9mIGxheW91dClbXTtcclxuICAgIGZvciAoY29uc3QgZmFjZU5hbWUgb2YgZmFjZU5hbWVzKSB7XHJcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUbyBrZWVwIGNvbnNpc3RlbnQgb3JkZXJcclxuICAgICAgICBtaXBtYXBEYXRhW2ZhY2VOYW1lXSA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIGF3YWl0IFByb21pc2UuYWxsKFxyXG4gICAgICAgIGZhY2VOYW1lcy5tYXAoYXN5bmMgKGZhY2VOYW1lKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZhY2VCbGl0ID0gbGF5b3V0W2ZhY2VOYW1lXTtcclxuICAgICAgICAgICAgLy8g5pyA5paw54mI5pysIHNoYXJwIDAuMzIuNiDov57nu63oo4Hliarml7bkvb/nlKjlkIzkuIDkuKogaW1hZ2Ugc2hhcnAg5a+56LGh5Lya6KOB5Ymq5byC5bi477yM6ZyA6KaB6YeN5paw5Yib5bu6XHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gc2hhcnAoaW1hZ2VTb3VyY2UpO1xyXG4gICAgICAgICAgICBjb25zdCBmYWNlU2hhcnAgPSBpbWFnZS5leHRyYWN0KHtcclxuICAgICAgICAgICAgICAgIGxlZnQ6IGZhY2VCbGl0LngsXHJcbiAgICAgICAgICAgICAgICB0b3A6IGZhY2VCbGl0LnksXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogZmFjZUJsaXQud2lkdGgsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGZhY2VCbGl0LmhlaWdodCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGZhY2VJbWFnZURhdGEgPSBhd2FpdCBmYWNlU2hhcnAudG9Gb3JtYXQoc2hhcnAuZm9ybWF0LnBuZykudG9CdWZmZXIoKTtcclxuICAgICAgICAgICAgbWlwbWFwRGF0YVtmYWNlTmFtZV0gPSBmYWNlSW1hZ2VEYXRhO1xyXG4gICAgICAgIH0pLFxyXG4gICAgKTtcclxuICAgIHJldHVybiBtaXBtYXBEYXRhO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBfZ2V0RmFjZXNJbkVxdWlyZWN0YW5ndWxhclByb2plY3RlZChcclxuICAgIGltYWdlU291cmNlOiBzdHJpbmcsXHJcbiAgICBmYWNlU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkLFxyXG4gICAgaXNSR0JFOiBib29sZWFuIHwgdW5kZWZpbmVkLFxyXG4pOiBQcm9taXNlPElUZXh0dXJlRmFjZU1pcE1hcERhdGE+IHtcclxuICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IHJlYWRGaWxlKGltYWdlU291cmNlKTtcclxuICAgIGNvbnN0IHNoYXJwUmVzdWx0ID0gYXdhaXQgc2hhcnAoYnVmZmVyKTtcclxuICAgIGNvbnN0IG1ldGEgPSBhd2FpdCBzaGFycFJlc3VsdC5tZXRhZGF0YSgpO1xyXG5cclxuICAgIGlmICghZmFjZVNpemUpIHtcclxuICAgICAgICBmYWNlU2l6ZSA9IG5lYXJlc3RQb3dlck9mVHdvKChtZXRhLndpZHRoIHx8IDApIC8gNCkgfCAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOWIhuWJsuWbvueJh1xyXG4gICAgY29uc3QgZmFjZUFycmF5ID0gYXdhaXQgZXF1aXJlY3RUb0N1YmVtYXBGYWNlcyhzaGFycFJlc3VsdCwgZmFjZVNpemUsIHtcclxuICAgICAgICBpc1JHQkUsXHJcbiAgICB9KTtcclxuICAgIGlmIChmYWNlQXJyYXkubGVuZ3RoICE9PSA2KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gcmVzb2x2ZSBlcXVpcmVjdGFuZ3VsYXIgcHJvamVjdGlvbiBpbWFnZS4nKTtcclxuICAgIH1cclxuICAgIC8vIGNvbnN0IGZhY2VzID0gYXdhaXQgUHJvbWlzZS5hbGwoZmFjZUFycmF5Lm1hcChnZXRDYW52YXNEYXRhKSk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJpZ2h0OiBhd2FpdCBzaGFycChCdWZmZXIuZnJvbShmYWNlQXJyYXlbMF0uZGF0YSksIHsgcmF3OiB7IHdpZHRoOiBmYWNlU2l6ZSwgaGVpZ2h0OiBmYWNlU2l6ZSwgY2hhbm5lbHM6IDQgfSB9KVxyXG4gICAgICAgICAgICAudG9Gb3JtYXQobWV0YS5mb3JtYXQgfHwgJ3BuZycpXHJcbiAgICAgICAgICAgIC50b0J1ZmZlcigpLFxyXG4gICAgICAgIGxlZnQ6IGF3YWl0IHNoYXJwKEJ1ZmZlci5mcm9tKGZhY2VBcnJheVsxXS5kYXRhKSwgeyByYXc6IHsgd2lkdGg6IGZhY2VTaXplLCBoZWlnaHQ6IGZhY2VTaXplLCBjaGFubmVsczogNCB9IH0pXHJcbiAgICAgICAgICAgIC50b0Zvcm1hdChtZXRhLmZvcm1hdCB8fCAncG5nJylcclxuICAgICAgICAgICAgLnRvQnVmZmVyKCksXHJcbiAgICAgICAgdG9wOiBhd2FpdCBzaGFycChCdWZmZXIuZnJvbShmYWNlQXJyYXlbMl0uZGF0YSksIHsgcmF3OiB7IHdpZHRoOiBmYWNlU2l6ZSwgaGVpZ2h0OiBmYWNlU2l6ZSwgY2hhbm5lbHM6IDQgfSB9KVxyXG4gICAgICAgICAgICAudG9Gb3JtYXQobWV0YS5mb3JtYXQgfHwgJ3BuZycpXHJcbiAgICAgICAgICAgIC50b0J1ZmZlcigpLFxyXG4gICAgICAgIGJvdHRvbTogYXdhaXQgc2hhcnAoQnVmZmVyLmZyb20oZmFjZUFycmF5WzNdLmRhdGEpLCB7IHJhdzogeyB3aWR0aDogZmFjZVNpemUsIGhlaWdodDogZmFjZVNpemUsIGNoYW5uZWxzOiA0IH0gfSlcclxuICAgICAgICAgICAgLnRvRm9ybWF0KG1ldGEuZm9ybWF0IHx8ICdwbmcnKVxyXG4gICAgICAgICAgICAudG9CdWZmZXIoKSxcclxuICAgICAgICBmcm9udDogYXdhaXQgc2hhcnAoQnVmZmVyLmZyb20oZmFjZUFycmF5WzRdLmRhdGEpLCB7IHJhdzogeyB3aWR0aDogZmFjZVNpemUsIGhlaWdodDogZmFjZVNpemUsIGNoYW5uZWxzOiA0IH0gfSlcclxuICAgICAgICAgICAgLnRvRm9ybWF0KG1ldGEuZm9ybWF0IHx8ICdwbmcnKVxyXG4gICAgICAgICAgICAudG9CdWZmZXIoKSxcclxuICAgICAgICBiYWNrOiBhd2FpdCBzaGFycChCdWZmZXIuZnJvbShmYWNlQXJyYXlbNV0uZGF0YSksIHsgcmF3OiB7IHdpZHRoOiBmYWNlU2l6ZSwgaGVpZ2h0OiBmYWNlU2l6ZSwgY2hhbm5lbHM6IDQgfSB9KVxyXG4gICAgICAgICAgICAudG9Gb3JtYXQobWV0YS5mb3JtYXQgfHwgJ3BuZycpXHJcbiAgICAgICAgICAgIC50b0J1ZmZlcigpLFxyXG4gICAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0VG9wKGxldmVsOiBudW1iZXIsIG1pcG1hcExheW91dDogSU1pcG1hcEF0bGFzTGF5b3V0W10pIHtcclxuICAgIGlmIChsZXZlbCA9PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBtaXBtYXBMYXlvdXQubGVuZ3RoID4gMCA/IG1pcG1hcExheW91dFswXS5oZWlnaHQgOiAwO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIGdldExlZnQobGV2ZWw6IG51bWJlciwgbWlwbWFwTGF5b3V0OiBJTWlwbWFwQXRsYXNMYXlvdXRbXSkge1xyXG4gICAgLy/liY3kuKTlvKBtaXBtYXDnurXnva7luIPlsYBcclxuICAgIGlmIChsZXZlbCA8IHZlcnRpY2FsQ291bnQpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGxldCBsZWZ0ID0gMDtcclxuICAgIGZvciAobGV0IGkgPSB2ZXJ0aWNhbENvdW50IC0gMTsgaSA8IG1pcG1hcExheW91dC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChpID49IGxldmVsKSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZWZ0ICs9IG1pcG1hcExheW91dFtpXS53aWR0aDtcclxuICAgIH1cclxuICAgIHJldHVybiBsZWZ0O1xyXG59XHJcbi8qKlxyXG4gKiDorqHnrpfnuqblrprlpb3nmoRtaXBtYXDluIPlsYDvvIzliY3kuKTlvKBtaXBtYXDnurXlkJHmjpLliJfvvIzlkI7pnaLmjqXnrKzkuozlvKDmqKrlkJHmjpLliJfjgIJcclxuICogQHBhcmFtIHNpemUg5pivbGV2ZWwgMOeahOWwuuWvuFxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0TWlwbWFwTGF5b3V0KHNpemU6IG51bWJlcikge1xyXG4gICAgY29uc3QgbWlwbWFwTGF5b3V0OiBJTWlwbWFwQXRsYXNMYXlvdXRbXSA9IFtdO1xyXG4gICAgbGV0IGxldmVsID0gMDtcclxuICAgIHdoaWxlIChzaXplKSB7XHJcbiAgICAgICAgbWlwbWFwTGF5b3V0LnB1c2goe1xyXG4gICAgICAgICAgICBsZWZ0OiBnZXRMZWZ0KGxldmVsLCBtaXBtYXBMYXlvdXQpLFxyXG4gICAgICAgICAgICB0b3A6IGdldFRvcChsZXZlbCwgbWlwbWFwTGF5b3V0KSxcclxuICAgICAgICAgICAgd2lkdGg6IHNpemUsXHJcbiAgICAgICAgICAgIGhlaWdodDogc2l6ZSxcclxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsKyssXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2l6ZSA+Pj0gMTtcclxuICAgIH1cclxuICAgIHJldHVybiBtaXBtYXBMYXlvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDojrflj5ZtaXBtYXDnmoTkv53lrZjnm67lvZVcclxuICog5Y+N5bCE5o6i6ZKI54OY54SZ5Zu+55qE55uu5b2V57uT5p6E77ya5Zy65pmv5ZCNICsg5paH5Lu25ZCNX2NvbnZvbHV0aW9uXHJcbiAqIOWFtuS7luaDheWGteeDmOeEmeWbvueahOebruW9lee7k+aehDog5paH5Lu25ZCNICsgX2NvbnZvbHV0aW9uXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXREaXJPZk1pcG1hcHMoZmlsZVBhdGg6IHN0cmluZywgZXh0OiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IGJhc2VQYXRoID0gZGlybmFtZShmaWxlUGF0aCk7XHJcbiAgICBjb25zdCBiYXNlTmFtZSA9IGJhc2VuYW1lKGZpbGVQYXRoLCBleHQpO1xyXG4gICAgcmV0dXJuIGpvaW4oYmFzZVBhdGgsIGJhc2VOYW1lICsgJ19jb252b2x1dGlvbicpO1xyXG59XHJcblxyXG4vKipcclxuICog5aaC5p6ccHJvamVjdOebruW9leWtmOacieS4iuasoeWNt+enr+eahOe7k+aenO+8jOaXoOmcgOWGjeasoeWBmuWNt+enr+S7peiKguecgeWvvOWFpeaXtumXtFxyXG4gKi9cclxuZnVuY3Rpb24gaXNOZWVkQ29udm9sdXRpb24oY29udm9sdXRpb25EaXI6IHN0cmluZykge1xyXG4gICAgaWYgKCFleGlzdHNTeW5jKGNvbnZvbHV0aW9uRGlyKSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZmFjZUNvdW50ID0gNjtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmFjZUNvdW50OyBpKyspIHtcclxuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGpvaW4oY29udm9sdXRpb25EaXIsICdtaXBtYXBfJyArIGkudG9TdHJpbmcoKSArICcucG5nJyk7XHJcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGZpbGVQYXRoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkv53lrZjljbfnp6/lt6XlhbfnlJ/miJDnmoRtaXBtYXBzXHJcbiAqL1xyXG5mdW5jdGlvbiBzYXZlTWlwbWFwcyhmaWxlUGF0aDogc3RyaW5nLCBkZXN0UGF0aDogc3RyaW5nKSB7XHJcbiAgICBpZiAoIWV4aXN0c1N5bmMoZGVzdFBhdGgpKSB7XHJcbiAgICAgICAgZW5zdXJlRGlyU3luYyhkZXN0UGF0aCk7XHJcbiAgICB9XHJcbiAgICBjb3B5RmlsZVN5bmMoZmlsZVBhdGgsIGpvaW4oZGVzdFBhdGgsIGJhc2VuYW1lKGZpbGVQYXRoKSkpO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElGYWNlU3dhcFNwYWNlIHtcclxuICAgIFtmYWNlTmFtZTogc3RyaW5nXTogQnVmZmVyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tTaXplKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XHJcbiAgICByZXR1cm4gd2lkdGggKiA0ID09PSBoZWlnaHQgKiAzIHx8IHdpZHRoICogMyA9PT0gaGVpZ2h0ICogNCB8fCB3aWR0aCAqIDYgPT09IGhlaWdodCB8fCB3aWR0aCA9PT0gaGVpZ2h0ICogNiB8fCB3aWR0aCA9PT0gaGVpZ2h0ICogMjtcclxufVxyXG5cclxuLy8gYXN5bmMgZnVuY3Rpb24gZ2V0Q2FudmFzRGF0YShjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KSB7XHJcbi8vICAgICBjb25zdCBibG9iID0gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmU6IChibG9iOiBCbG9iKSA9PiB2b2lkLCByZWplY3QpID0+IHtcclxuLy8gICAgICAgICBjYW52YXMudG9CbG9iKChibG9iKSA9PiB7XHJcbi8vICAgICAgICAgICAgIGlmIChibG9iKSB7XHJcbi8vICAgICAgICAgICAgICAgICByZXNvbHZlKGJsb2IpO1xyXG4vLyAgICAgICAgICAgICB9IGVsc2Uge1xyXG4vLyAgICAgICAgICAgICAgICAgcmVqZWN0KGJsb2IpO1xyXG4vLyAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgfSk7XHJcbi8vICAgICB9KTtcclxuLy8gICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYXdhaXQgbmV3IFJlc3BvbnNlKGJsb2IpLmFycmF5QnVmZmVyKCk7XHJcbi8vICAgICByZXR1cm4gQnVmZmVyLmZyb20oYXJyYXlCdWZmZXIpO1xyXG4vLyB9XHJcbiJdfQ==