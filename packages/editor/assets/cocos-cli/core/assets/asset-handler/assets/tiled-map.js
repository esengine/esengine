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
exports.TiledMapHandler = void 0;
const asset_db_1 = require("@cocos/asset-db");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const xmldom_1 = require("xmldom");
const sharp_1 = __importDefault(require("sharp"));
const cc_1 = require("cc");
const image_utils_1 = require("./utils/image-utils");
const utils_1 = require("../utils");
/**
 * 读取 tmx 文件内容，查找依赖的 texture 文件信息
 * @param tmxFile tmx 文件路径
 * @param tmxFileData tmx 文件内容
 */
async function searchDependFiles(asset, tmxFile, tmxFileData) {
    // 读取 xml 数据
    const doc = new xmldom_1.DOMParser().parseFromString(tmxFileData);
    if (!doc) {
        console.error(`failed to parse ${tmxFileData}`);
        throw new Error(`TiledMap import failed: failed to parser ${tmxFile}`);
    }
    let imgFullPath = [];
    const tsxAbsFiles = [];
    const tsxSources = [];
    let imgBaseName = [];
    // @ts-ignore
    let imgSizes = [];
    const rootElement = doc.documentElement;
    const tilesetElements = rootElement.getElementsByTagName('tileset');
    // 读取内部的 source 数据
    for (let i = 0; i < tilesetElements.length; i++) {
        const tileset = tilesetElements[i];
        const sourceTSXAttr = tileset.getAttribute('source');
        if (sourceTSXAttr) {
            tsxSources.push(sourceTSXAttr);
            // 获取 texture 路径
            const tsxAbsPath = path.join(path.dirname(tmxFile), sourceTSXAttr);
            asset.depend(tsxAbsPath);
            // const tsxAsset = queryAsset(tsxAbsPath);
            // if (!tsxAsset || !tsxAsset.imported) {
            //     console.warn(`cannot find ${tsxAbsPath}`);
            //     return null;
            // }
            if (fs.existsSync(tsxAbsPath)) {
                tsxAbsFiles.push(tsxAbsPath);
                const tsxContent = fs.readFileSync(tsxAbsPath, 'utf-8');
                const tsxDoc = new xmldom_1.DOMParser().parseFromString(tsxContent);
                if (tsxDoc) {
                    const image = await parseTilesetImages(asset, tsxDoc, tsxAbsPath);
                    if (!image) {
                        return null;
                    }
                    imgFullPath = imgFullPath.concat(image.imageFullPath);
                    imgBaseName = imgBaseName.concat(image.imageBaseName);
                    imgSizes = imgSizes.concat(image.imageSizes);
                }
                else {
                    console.warn('Parse %s failed.', tsxAbsPath);
                }
            }
            else {
                console.warn(`cannot find ${tsxAbsPath}`);
                return null;
            }
        }
        // import images
        const img = await parseTilesetImages(asset, tileset, tmxFile);
        if (!img) {
            return null;
        }
        imgFullPath = imgFullPath.concat(img.imageFullPath);
        imgBaseName = imgBaseName.concat(img.imageBaseName);
        imgSizes = imgSizes.concat(img.imageSizes);
    }
    const imageLayerTextures = [];
    const imageLayerTextureNames = [];
    const imageLayerElements = rootElement.getElementsByTagName('imagelayer');
    for (let ii = 0, nn = imageLayerElements.length; ii < nn; ii++) {
        const imageLayer = imageLayerElements[ii];
        const imageInfos = imageLayer.getElementsByTagName('image');
        if (imageInfos && imageInfos.length > 0) {
            const imageInfo = imageInfos[0];
            const imageSource = imageInfo.getAttribute('source');
            const imgPath = path.join(path.dirname(tmxFile), imageSource);
            asset.depend(imgPath);
            // const imgAsset = queryAsset(imgPath);
            // if (!imgAsset || !imgAsset.imported) {
            //     console.warn(`cannot find ${imgPath}`);
            //     return null;
            // }
            if (fs.existsSync(imgPath)) {
                imageLayerTextures.push(imgPath);
                let imgName = path.relative(path.dirname(tmxFile), imgPath);
                imgName = imgName.replace(/\\/g, '/');
                imageLayerTextureNames.push(imgName);
            }
            else {
                console.warn(`cannot find ${imgPath}`);
            }
        }
    }
    return {
        imgFullPaths: imgFullPath,
        tsxFiles: tsxAbsFiles,
        tsxSources: tsxSources,
        imgBaseNames: imgBaseName,
        imageLayerTextures,
        imageLayerTextureNames,
        imgSizes,
    };
}
/**
 * 读取文件路径下 image 的 source 路径信息以及对应的文件名
 * @param tsxDoc
 * @param tsxPath
 * @returns {srcs, names}
 */
async function parseTilesetImages(asset, tsxDoc, tsxPath) {
    const images = tsxDoc.getElementsByTagName('image');
    const imageFullPath = [];
    const imageBaseName = [];
    // @ts-ignore
    const imageSizes = [];
    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imageCfg = image.getAttribute('source');
        if (imageCfg) {
            const imgPath = path.join(path.dirname(tsxPath), imageCfg);
            asset.depend(imgPath);
            // const tsxAsset = queryAsset(imgPath);
            // if (!tsxAsset || !tsxAsset.imported) {
            //     console.warn(`cannot find ${imgPath}`);
            //     return null;
            // }
            if (fs.existsSync(imgPath)) {
                const metaData = await (0, sharp_1.default)(imgPath).metadata();
                imageSizes.push(new cc_1.Size(metaData.width, metaData.height));
                imageFullPath.push(imgPath);
                const textureName = path.basename(imgPath);
                imageBaseName.push(textureName);
            }
            else {
                throw new Error(`Image does not exist: ${imgPath}`);
            }
        }
    }
    return { imageFullPath, imageBaseName, imageSizes };
}
exports.TiledMapHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'tiled-map',
    // 引擎内对应的类型
    assetType: 'cc.TiledMapAsset',
    /**
     * 判断是否允许使用当前的 Handler 进行导入
     * @param asset
     */
    async validate(asset) {
        return true;
    },
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.2',
        versionCode: 1,
        /**
         * 实际导入流程
         * 需要自己控制是否生成、拷贝文件
         * @param asset
         */
        async import(asset) {
            await asset.copyToLibrary(asset.extname, asset.source);
            const tiledMap = new cc_1.TiledMapAsset();
            // 读取 tield-map 文件内的数据
            const data = fs.readFileSync(asset.source, { encoding: 'utf8' });
            tiledMap.name = path.basename(asset.source, asset.extname);
            // 3.5 再改
            // tiledMap.name = asset.basename || '';
            const jsonAsset = new cc_1.TextAsset();
            jsonAsset.name = tiledMap.name;
            jsonAsset.text = data;
            // tiledMap.tmxXmlStr = jsonAsset;
            tiledMap.tmxXmlStr = data;
            // 查询获取对应的 texture 依赖文件信息
            const info = await searchDependFiles(asset, asset.source, data);
            if (!info) {
                return false;
            }
            tiledMap.spriteFrames = info.imgFullPaths.map((u) => {
                asset.depend(u);
                const tex = (0, asset_db_1.queryAsset)(u);
                if (tex) {
                    // 如果同时导入，image 已经被导入，则把 image 的类型改为 sprite-frame
                    (0, image_utils_1.changeImageDefaultType)(tex, 'sprite-frame');
                    // @ts-ignore
                    return EditorExtends.serialize.asAsset(tex.uuid + '@f9941', cc_1.SpriteFrame);
                }
            });
            tiledMap.spriteFrameNames = info.imgBaseNames;
            tiledMap.tsxFiles = info.tsxFiles.map((u) => {
                const tsxFile = (0, asset_db_1.queryAsset)(u);
                if (tsxFile) {
                    // @ts-ignore
                    return EditorExtends.serialize.asAsset(tsxFile.uuid, cc_1.TextAsset);
                }
            });
            tiledMap.tsxFileNames = info.tsxSources;
            tiledMap.imageLayerSpriteFrame = info.imageLayerTextures.map((u) => {
                const tex = (0, asset_db_1.queryAsset)(u);
                // @ts-ignore
                return EditorExtends.serialize.asAsset(tex.uuid + '@f9941', cc_1.SpriteFrame);
            });
            tiledMap.imageLayerSpriteFrameNames = info.imageLayerTextureNames.map((u) => path.basename(u));
            tiledMap.spriteFrameSizes = info.imgSizes;
            const serializeJSON = EditorExtends.serialize(tiledMap);
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            return true;
        },
    },
};
exports.default = exports.TiledMapHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGlsZWQtbWFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvYXNzZXRzL3RpbGVkLW1hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw4Q0FBb0Q7QUFDcEQsMkNBQTZCO0FBQzdCLHVDQUF5QjtBQUN6QixtQ0FBbUM7QUFDbkMsa0RBQTBCO0FBQzFCLDJCQUFpRTtBQUNqRSxxREFBNkQ7QUFFN0Qsb0NBQTZDO0FBRzdDOzs7O0dBSUc7QUFDSCxLQUFLLFVBQVUsaUJBQWlCLENBQUMsS0FBWSxFQUFFLE9BQWUsRUFBRSxXQUFtQjtJQUMvRSxZQUFZO0lBQ1osTUFBTSxHQUFHLEdBQUcsSUFBSSxrQkFBUyxFQUFFLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3pELElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNQLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDaEQsTUFBTSxJQUFJLEtBQUssQ0FBQyw0Q0FBNEMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBQ0QsSUFBSSxXQUFXLEdBQWEsRUFBRSxDQUFDO0lBQy9CLE1BQU0sV0FBVyxHQUFhLEVBQUUsQ0FBQztJQUNqQyxNQUFNLFVBQVUsR0FBYSxFQUFFLENBQUM7SUFDaEMsSUFBSSxXQUFXLEdBQWEsRUFBRSxDQUFDO0lBQy9CLGFBQWE7SUFDYixJQUFJLFFBQVEsR0FBVyxFQUFFLENBQUM7SUFDMUIsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQztJQUN4QyxNQUFNLGVBQWUsR0FBRyxXQUFXLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEUsa0JBQWtCO0lBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENB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SSxDQUFDO1FBQ2hCLENBQUM7S0FDSjtDQUNKLENBQUM7QUFFRixrQkFBZSx1QkFBZSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXNzZXQsIHF1ZXJ5QXNzZXQgfSBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XHJcbmltcG9ydCB7IERPTVBhcnNlciB9IGZyb20gJ3htbGRvbSc7XHJcbmltcG9ydCBTaGFycCBmcm9tICdzaGFycCc7XHJcbmltcG9ydCB7IFNpemUsIFNwcml0ZUZyYW1lLCBUZXh0QXNzZXQsIFRpbGVkTWFwQXNzZXQgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IGNoYW5nZUltYWdlRGVmYXVsdFR5cGUgfSBmcm9tICcuL3V0aWxzL2ltYWdlLXV0aWxzJztcclxuXHJcbmltcG9ydCB7IGdldERlcGVuZFVVSURMaXN0IH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBBc3NldEhhbmRsZXIgfSBmcm9tICcuLi8uLi9AdHlwZXMvcHJvdGVjdGVkJztcclxuXHJcbi8qKlxyXG4gKiDor7vlj5YgdG14IOaWh+S7tuWGheWuue+8jOafpeaJvuS+nei1lueahCB0ZXh0dXJlIOaWh+S7tuS/oeaBr1xyXG4gKiBAcGFyYW0gdG14RmlsZSB0bXgg5paH5Lu26Lev5b6EXHJcbiAqIEBwYXJhbSB0bXhGaWxlRGF0YSB0bXgg5paH5Lu25YaF5a65XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hEZXBlbmRGaWxlcyhhc3NldDogQXNzZXQsIHRteEZpbGU6IHN0cmluZywgdG14RmlsZURhdGE6IHN0cmluZykge1xyXG4gICAgLy8g6K+75Y+WIHhtbCDmlbDmja5cclxuICAgIGNvbnN0IGRvYyA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcodG14RmlsZURhdGEpO1xyXG4gICAgaWYgKCFkb2MpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBmYWlsZWQgdG8gcGFyc2UgJHt0bXhGaWxlRGF0YX1gKTtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRpbGVkTWFwIGltcG9ydCBmYWlsZWQ6IGZhaWxlZCB0byBwYXJzZXIgJHt0bXhGaWxlfWApO1xyXG4gICAgfVxyXG4gICAgbGV0IGltZ0Z1bGxQYXRoOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgY29uc3QgdHN4QWJzRmlsZXM6IHN0cmluZ1tdID0gW107XHJcbiAgICBjb25zdCB0c3hTb3VyY2VzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgbGV0IGltZ0Jhc2VOYW1lOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgbGV0IGltZ1NpemVzOiBTaXplW10gPSBbXTtcclxuICAgIGNvbnN0IHJvb3RFbGVtZW50ID0gZG9jLmRvY3VtZW50RWxlbWVudDtcclxuICAgIGNvbnN0IHRpbGVzZXRFbGVtZW50cyA9IHJvb3RFbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0aWxlc2V0Jyk7XHJcbiAgICAvLyDor7vlj5blhoXpg6jnmoQgc291cmNlIOaVsOaNrlxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aWxlc2V0RWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCB0aWxlc2V0ID0gdGlsZXNldEVsZW1lbnRzW2ldO1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZVRTWEF0dHIgPSB0aWxlc2V0LmdldEF0dHJpYnV0ZSgnc291cmNlJyk7XHJcbiAgICAgICAgaWYgKHNvdXJjZVRTWEF0dHIpIHtcclxuICAgICAgICAgICAgdHN4U291cmNlcy5wdXNoKHNvdXJjZVRTWEF0dHIpO1xyXG4gICAgICAgICAgICAvLyDojrflj5YgdGV4dHVyZSDot6/lvoRcclxuICAgICAgICAgICAgY29uc3QgdHN4QWJzUGF0aCA9IHBhdGguam9pbihwYXRoLmRpcm5hbWUodG14RmlsZSksIHNvdXJjZVRTWEF0dHIpO1xyXG4gICAgICAgICAgICBhc3NldC5kZXBlbmQodHN4QWJzUGF0aCk7XHJcblxyXG4gICAgICAgICAgICAvLyBjb25zdCB0c3hBc3NldCA9IHF1ZXJ5QXNzZXQodHN4QWJzUGF0aCk7XHJcbiAgICAgICAgICAgIC8vIGlmICghdHN4QXNzZXQgfHwgIXRzeEFzc2V0LmltcG9ydGVkKSB7XHJcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLndhcm4oYGNhbm5vdCBmaW5kICR7dHN4QWJzUGF0aH1gKTtcclxuICAgICAgICAgICAgLy8gICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyh0c3hBYnNQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgdHN4QWJzRmlsZXMucHVzaCh0c3hBYnNQYXRoKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRzeENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmModHN4QWJzUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0c3hEb2MgPSBuZXcgRE9NUGFyc2VyKCkucGFyc2VGcm9tU3RyaW5nKHRzeENvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRzeERvYykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlID0gYXdhaXQgcGFyc2VUaWxlc2V0SW1hZ2VzKGFzc2V0LCB0c3hEb2MsIHRzeEFic1BhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGltZ0Z1bGxQYXRoID0gaW1nRnVsbFBhdGguY29uY2F0KGltYWdlIS5pbWFnZUZ1bGxQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICBpbWdCYXNlTmFtZSA9IGltZ0Jhc2VOYW1lLmNvbmNhdChpbWFnZSEuaW1hZ2VCYXNlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1nU2l6ZXMgPSBpbWdTaXplcy5jb25jYXQoaW1hZ2UhLmltYWdlU2l6ZXMpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1BhcnNlICVzIGZhaWxlZC4nLCB0c3hBYnNQYXRoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgY2Fubm90IGZpbmQgJHt0c3hBYnNQYXRofWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaW1wb3J0IGltYWdlc1xyXG4gICAgICAgIGNvbnN0IGltZyA9IGF3YWl0IHBhcnNlVGlsZXNldEltYWdlcyhhc3NldCwgdGlsZXNldCwgdG14RmlsZSk7XHJcbiAgICAgICAgaWYgKCFpbWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGltZ0Z1bGxQYXRoID0gaW1nRnVsbFBhdGguY29uY2F0KGltZy5pbWFnZUZ1bGxQYXRoKTtcclxuICAgICAgICBpbWdCYXNlTmFtZSA9IGltZ0Jhc2VOYW1lLmNvbmNhdChpbWcuaW1hZ2VCYXNlTmFtZSk7XHJcbiAgICAgICAgaW1nU2l6ZXMgPSBpbWdTaXplcy5jb25jYXQoaW1nIS5pbWFnZVNpemVzKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpbWFnZUxheWVyVGV4dHVyZXM6IHN0cmluZ1tdID0gW107XHJcbiAgICBjb25zdCBpbWFnZUxheWVyVGV4dHVyZU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgY29uc3QgaW1hZ2VMYXllckVsZW1lbnRzID0gcm9vdEVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltYWdlbGF5ZXInKTtcclxuICAgIGZvciAobGV0IGlpID0gMCwgbm4gPSBpbWFnZUxheWVyRWxlbWVudHMubGVuZ3RoOyBpaSA8IG5uOyBpaSsrKSB7XHJcbiAgICAgICAgY29uc3QgaW1hZ2VMYXllciA9IGltYWdlTGF5ZXJFbGVtZW50c1tpaV07XHJcbiAgICAgICAgY29uc3QgaW1hZ2VJbmZvcyA9IGltYWdlTGF5ZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltYWdlJyk7XHJcbiAgICAgICAgaWYgKGltYWdlSW5mb3MgJiYgaW1hZ2VJbmZvcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlSW5mbyA9IGltYWdlSW5mb3NbMF07XHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlU291cmNlID0gaW1hZ2VJbmZvLmdldEF0dHJpYnV0ZSgnc291cmNlJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGltZ1BhdGggPSBwYXRoLmpvaW4ocGF0aC5kaXJuYW1lKHRteEZpbGUpLCBpbWFnZVNvdXJjZSEpO1xyXG4gICAgICAgICAgICBhc3NldC5kZXBlbmQoaW1nUGF0aCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IGltZ0Fzc2V0ID0gcXVlcnlBc3NldChpbWdQYXRoKTtcclxuICAgICAgICAgICAgLy8gaWYgKCFpbWdBc3NldCB8fCAhaW1nQXNzZXQuaW1wb3J0ZWQpIHtcclxuICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUud2FybihgY2Fubm90IGZpbmQgJHtpbWdQYXRofWApO1xyXG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGltZ1BhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZUxheWVyVGV4dHVyZXMucHVzaChpbWdQYXRoKTtcclxuICAgICAgICAgICAgICAgIGxldCBpbWdOYW1lID0gcGF0aC5yZWxhdGl2ZShwYXRoLmRpcm5hbWUodG14RmlsZSksIGltZ1BhdGgpO1xyXG4gICAgICAgICAgICAgICAgaW1nTmFtZSA9IGltZ05hbWUucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xyXG4gICAgICAgICAgICAgICAgaW1hZ2VMYXllclRleHR1cmVOYW1lcy5wdXNoKGltZ05hbWUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBjYW5ub3QgZmluZCAke2ltZ1BhdGh9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpbWdGdWxsUGF0aHM6IGltZ0Z1bGxQYXRoLFxyXG4gICAgICAgIHRzeEZpbGVzOiB0c3hBYnNGaWxlcyxcclxuICAgICAgICB0c3hTb3VyY2VzOiB0c3hTb3VyY2VzLFxyXG4gICAgICAgIGltZ0Jhc2VOYW1lczogaW1nQmFzZU5hbWUsXHJcbiAgICAgICAgaW1hZ2VMYXllclRleHR1cmVzLFxyXG4gICAgICAgIGltYWdlTGF5ZXJUZXh0dXJlTmFtZXMsXHJcbiAgICAgICAgaW1nU2l6ZXMsXHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICog6K+75Y+W5paH5Lu26Lev5b6E5LiLIGltYWdlIOeahCBzb3VyY2Ug6Lev5b6E5L+h5oGv5Lul5Y+K5a+55bqU55qE5paH5Lu25ZCNXHJcbiAqIEBwYXJhbSB0c3hEb2NcclxuICogQHBhcmFtIHRzeFBhdGhcclxuICogQHJldHVybnMge3NyY3MsIG5hbWVzfVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gcGFyc2VUaWxlc2V0SW1hZ2VzKGFzc2V0OiBBc3NldCwgdHN4RG9jOiBFbGVtZW50IHwgRG9jdW1lbnQsIHRzeFBhdGg6IHN0cmluZykge1xyXG4gICAgY29uc3QgaW1hZ2VzID0gdHN4RG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWFnZScpO1xyXG4gICAgY29uc3QgaW1hZ2VGdWxsUGF0aDogc3RyaW5nW10gPSBbXTtcclxuICAgIGNvbnN0IGltYWdlQmFzZU5hbWU6IHN0cmluZ1tdID0gW107XHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICBjb25zdCBpbWFnZVNpemVzOiBTaXplW10gPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW1hZ2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgaW1hZ2UgPSBpbWFnZXNbaV07XHJcbiAgICAgICAgY29uc3QgaW1hZ2VDZmcgPSBpbWFnZS5nZXRBdHRyaWJ1dGUoJ3NvdXJjZScpO1xyXG4gICAgICAgIGlmIChpbWFnZUNmZykge1xyXG4gICAgICAgICAgICBjb25zdCBpbWdQYXRoID0gcGF0aC5qb2luKHBhdGguZGlybmFtZSh0c3hQYXRoKSwgaW1hZ2VDZmcpO1xyXG5cclxuICAgICAgICAgICAgYXNzZXQuZGVwZW5kKGltZ1BhdGgpO1xyXG4gICAgICAgICAgICAvLyBjb25zdCB0c3hBc3NldCA9IHF1ZXJ5QXNzZXQoaW1nUGF0aCk7XHJcbiAgICAgICAgICAgIC8vIGlmICghdHN4QXNzZXQgfHwgIXRzeEFzc2V0LmltcG9ydGVkKSB7XHJcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLndhcm4oYGNhbm5vdCBmaW5kICR7aW1nUGF0aH1gKTtcclxuICAgICAgICAgICAgLy8gICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGltZ1BhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtZXRhRGF0YSA9IGF3YWl0IFNoYXJwKGltZ1BhdGgpLm1ldGFkYXRhKCk7XHJcbiAgICAgICAgICAgICAgICBpbWFnZVNpemVzLnB1c2gobmV3IFNpemUobWV0YURhdGEud2lkdGgsIG1ldGFEYXRhLmhlaWdodCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGltYWdlRnVsbFBhdGgucHVzaChpbWdQYXRoKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHR1cmVOYW1lID0gcGF0aC5iYXNlbmFtZShpbWdQYXRoKTtcclxuICAgICAgICAgICAgICAgIGltYWdlQmFzZU5hbWUucHVzaCh0ZXh0dXJlTmFtZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEltYWdlIGRvZXMgbm90IGV4aXN0OiAke2ltZ1BhdGh9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyBpbWFnZUZ1bGxQYXRoLCBpbWFnZUJhc2VOYW1lLCBpbWFnZVNpemVzIH07XHJcbn1cclxuZXhwb3J0IGNvbnN0IFRpbGVkTWFwSGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICd0aWxlZC1tYXAnLFxyXG5cclxuICAgIC8vIOW8leaTjuWGheWvueW6lOeahOexu+Wei1xyXG4gICAgYXNzZXRUeXBlOiAnY2MuVGlsZWRNYXBBc3NldCcsXHJcbiAgICAvKipcclxuICAgICAqIOWIpOaWreaYr+WQpuWFgeiuuOS9v+eUqOW9k+WJjeeahCBIYW5kbGVyIOi/m+ihjOWvvOWFpVxyXG4gICAgICogQHBhcmFtIGFzc2V0XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHZhbGlkYXRlKGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbXBvcnRlcjoge1xyXG4gICAgICAgIC8vIOeJiOacrOWPt+WmguaenOWPmOabtO+8jOWImeS8muW8uuWItumHjeaWsOWvvOWFpVxyXG4gICAgICAgIHZlcnNpb246ICcxLjAuMicsXHJcbiAgICAgICAgdmVyc2lvbkNvZGU6IDEsXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5a6e6ZmF5a+85YWl5rWB56iLXHJcbiAgICAgICAgICog6ZyA6KaB6Ieq5bex5o6n5Yi25piv5ZCm55Sf5oiQ44CB5ou36LSd5paH5Lu2XHJcbiAgICAgICAgICogQHBhcmFtIGFzc2V0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXN5bmMgaW1wb3J0KGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldC5jb3B5VG9MaWJyYXJ5KGFzc2V0LmV4dG5hbWUsIGFzc2V0LnNvdXJjZSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB0aWxlZE1hcCA9IG5ldyBUaWxlZE1hcEFzc2V0KCk7XHJcbiAgICAgICAgICAgIC8vIOivu+WPliB0aWVsZC1tYXAg5paH5Lu25YaF55qE5pWw5o2uXHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoYXNzZXQuc291cmNlLCB7IGVuY29kaW5nOiAndXRmOCcgfSk7XHJcbiAgICAgICAgICAgIHRpbGVkTWFwLm5hbWUgPSBwYXRoLmJhc2VuYW1lKGFzc2V0LnNvdXJjZSwgYXNzZXQuZXh0bmFtZSk7XHJcbiAgICAgICAgICAgIC8vIDMuNSDlho3mlLlcclxuICAgICAgICAgICAgLy8gdGlsZWRNYXAubmFtZSA9IGFzc2V0LmJhc2VuYW1lIHx8ICcnO1xyXG5cclxuICAgICAgICAgICAgY29uc3QganNvbkFzc2V0ID0gbmV3IFRleHRBc3NldCgpO1xyXG4gICAgICAgICAgICBqc29uQXNzZXQubmFtZSA9IHRpbGVkTWFwLm5hbWU7XHJcbiAgICAgICAgICAgIGpzb25Bc3NldC50ZXh0ID0gZGF0YTtcclxuICAgICAgICAgICAgLy8gdGlsZWRNYXAudG14WG1sU3RyID0ganNvbkFzc2V0O1xyXG4gICAgICAgICAgICB0aWxlZE1hcC50bXhYbWxTdHIgPSBkYXRhO1xyXG5cclxuICAgICAgICAgICAgLy8g5p+l6K+i6I635Y+W5a+55bqU55qEIHRleHR1cmUg5L6d6LWW5paH5Lu25L+h5oGvXHJcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSBhd2FpdCBzZWFyY2hEZXBlbmRGaWxlcyhhc3NldCwgYXNzZXQuc291cmNlLCBkYXRhKTtcclxuICAgICAgICAgICAgaWYgKCFpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRpbGVkTWFwLnNwcml0ZUZyYW1lcyA9IGluZm8uaW1nRnVsbFBhdGhzLm1hcCgodSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYXNzZXQuZGVwZW5kKHUpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4ID0gcXVlcnlBc3NldCh1KTtcclxuICAgICAgICAgICAgICAgIGlmICh0ZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzlkIzml7blr7zlhaXvvIxpbWFnZSDlt7Lnu4/ooqvlr7zlhaXvvIzliJnmioogaW1hZ2Ug55qE57G75Z6L5pS55Li6IHNwcml0ZS1mcmFtZVxyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZUltYWdlRGVmYXVsdFR5cGUodGV4LCAnc3ByaXRlLWZyYW1lJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRWRpdG9yRXh0ZW5kcy5zZXJpYWxpemUuYXNBc3NldCh0ZXgudXVpZCArICdAZjk5NDEnLCBTcHJpdGVGcmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aWxlZE1hcC5zcHJpdGVGcmFtZU5hbWVzID0gaW5mby5pbWdCYXNlTmFtZXM7XHJcbiAgICAgICAgICAgIHRpbGVkTWFwLnRzeEZpbGVzID0gaW5mby50c3hGaWxlcy5tYXAoKHUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRzeEZpbGUgPSBxdWVyeUFzc2V0KHUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRzeEZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEVkaXRvckV4dGVuZHMuc2VyaWFsaXplLmFzQXNzZXQodHN4RmlsZS51dWlkLCBUZXh0QXNzZXQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGlsZWRNYXAudHN4RmlsZU5hbWVzID0gaW5mby50c3hTb3VyY2VzO1xyXG5cclxuICAgICAgICAgICAgdGlsZWRNYXAuaW1hZ2VMYXllclNwcml0ZUZyYW1lID0gaW5mby5pbWFnZUxheWVyVGV4dHVyZXMubWFwKCh1KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXggPSBxdWVyeUFzc2V0KHUpO1xyXG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEVkaXRvckV4dGVuZHMuc2VyaWFsaXplLmFzQXNzZXQodGV4LnV1aWQgKyAnQGY5OTQxJywgU3ByaXRlRnJhbWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGlsZWRNYXAuaW1hZ2VMYXllclNwcml0ZUZyYW1lTmFtZXMgPSBpbmZvLmltYWdlTGF5ZXJUZXh0dXJlTmFtZXMubWFwKCh1KSA9PiBwYXRoLmJhc2VuYW1lKHUpKTtcclxuICAgICAgICAgICAgdGlsZWRNYXAuc3ByaXRlRnJhbWVTaXplcyA9IGluZm8uaW1nU2l6ZXM7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBzZXJpYWxpemVKU09OID0gRWRpdG9yRXh0ZW5kcy5zZXJpYWxpemUodGlsZWRNYXApO1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldC5zYXZlVG9MaWJyYXJ5KCcuanNvbicsIHNlcmlhbGl6ZUpTT04pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZGVwZW5kcyA9IGdldERlcGVuZFVVSURMaXN0KHNlcmlhbGl6ZUpTT04pO1xyXG4gICAgICAgICAgICBhc3NldC5zZXREYXRhKCdkZXBlbmRzJywgZGVwZW5kcyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRpbGVkTWFwSGFuZGxlcjtcclxuIl19