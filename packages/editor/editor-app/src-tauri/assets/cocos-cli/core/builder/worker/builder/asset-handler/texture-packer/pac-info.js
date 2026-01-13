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
exports.SpriteFrameInfo = exports.AtlasInfo = exports.PacInfo = exports.DefaultPackOption = void 0;
exports.createAssetInstance = createAssetInstance;
exports.createApriteAtlasFromAtlas = createApriteAtlasFromAtlas;
exports.createTextureFromAtlas = createTextureFromAtlas;
exports.applyTextureBaseAssetUserData = applyTextureBaseAssetUserData;
exports.generateSpriteFrame = generateSpriteFrame;
/**
 * 此文件依赖了许多引擎接口，注意版本升级影响
 */
const cc_1 = require("cc");
const path_1 = require("path");
const asset_library_1 = require("../../manager/asset-library");
const HashUuid = __importStar(require("../../utils/hash-uuid"));
const utils_1 = __importDefault(require("../../../../../base/utils"));
const lodash_1 = __importDefault(require("lodash"));
const builder_config_1 = __importDefault(require("../../../../share/builder-config"));
exports.DefaultPackOption = {
    maxWidth: 1024,
    maxHeight: 1024,
    // padding of image.
    padding: 2,
    allowRotation: true,
    forceSquared: false,
    powerOfTwo: false,
    algorithm: 'MaxRects',
    format: 'png',
    quality: 80,
    contourBleed: true,
    paddingBleed: true,
    filterUnused: true,
    removeTextureInBundle: true,
    removeImageInBundle: true,
    removeSpriteAtlasInBundle: true,
    compressSettings: {},
    bleed: 0,
    mode: 'build',
};
/**
 * 一个图集信息
 */
class PacInfo {
    spriteFrameInfos = [];
    spriteFrames = [];
    relativePath = '';
    relativeDir = '';
    path = '';
    uuid = '';
    imagePath = '';
    imageUuid = '';
    textureUuid = ''; // Texture2D
    name = 'autoatlas';
    width = 1024;
    height = 1024;
    dirty = false;
    packOptions = JSON.parse(JSON.stringify(exports.DefaultPackOption));
    storeInfo;
    result;
    constructor(pacAsset, options) {
        this.uuid = pacAsset.uuid;
        // 在 db 进程内取得得 meta 数据需要深拷贝避免影响原数据
        let userData = JSON.parse(JSON.stringify(pacAsset.meta.userData));
        userData = options ? Object.assign(userData, options) : userData;
        // TODO 可能会有非法数据被 assign
        this.packOptions = Object.assign(this.packOptions, userData);
        this.packOptions.bleed = this.packOptions.paddingBleed ? 1 : 0;
        this.path = pacAsset.url;
        // 参与缓存计算的数据
        this.storeInfo = {
            pac: {
                uuid: pacAsset.uuid,
                mtime: asset_library_1.buildAssetLibrary.getAssetProperty(pacAsset, 'mtime'),
            },
            sprites: [],
            options: this.packOptions,
        };
        const assetsPath = (0, path_1.join)(builder_config_1.default.projectRoot, 'assets');
        this.relativePath = (0, path_1.relative)(assetsPath, pacAsset.source);
        this.relativeDir = (0, path_1.relative)(assetsPath, (0, path_1.dirname)(pacAsset.source));
        this.name = asset_library_1.buildAssetLibrary.getAssetProperty(pacAsset, 'name');
    }
    async initSpriteFramesWithRange(includeAssets) {
        const spriteFrameAssets = await this.queryInvalidSpriteAssets(includeAssets);
        if (!spriteFrameAssets.length) {
            return this;
        }
        await this.initSpriteFrames(spriteFrameAssets);
        return this;
    }
    /**
     * @param {Object} pacAssetInfo 从 db 中获取出来的 pac 信息
     */
    async initSpriteFrames(spriteFrameAssets) {
        let spriteFrameInfos = await Promise.all(spriteFrameAssets.map(async (asset) => {
            if (cc_1.assetManager.assets.has(asset.uuid)) {
                cc_1.assetManager.releaseAsset(cc_1.assetManager.assets.get(asset.uuid));
            }
            return new Promise((resolve, reject) => {
                cc_1.assetManager.loadAny(asset.uuid, (err, spriteFrame) => {
                    // 此处的错误处理都不 reject ，全部执行完后续会过滤非法数据
                    if (err || !spriteFrame) {
                        console.error(`sprite frame can't be load:${asset.uuid}, will remove it from atlas.`);
                        err && console.error(err);
                        resolve(null);
                        return;
                    }
                    try {
                        const spriteFrameInfo = new SpriteFrameInfo(spriteFrame, asset, this.packOptions);
                        spriteFrameInfo._pacUuid = this.uuid;
                        this.spriteFrames.push(spriteFrame);
                        resolve(spriteFrameInfo);
                    }
                    catch (error) {
                        console.error(`packer: load sprite frame failed:${asset.uuid}`);
                        console.error(error);
                        resolve(null);
                    }
                });
            });
        }));
        // 移除 无效的 sprite frame
        spriteFrameInfos = spriteFrameInfos.filter((info) => info != null);
        // 对 图片 进行排序，确保每次重新计算合图后的结果是稳定的。
        // 该排序只影响合图解析碎图的顺序，最终图集中的排序与合图算法有关，只有当图集中有相同尺寸的碎图时该排序才会产生作用。
        spriteFrameInfos = lodash_1.default.sortBy(spriteFrameInfos, 'uuid');
        this.spriteFrameInfos = spriteFrameInfos;
        this.storeInfo.sprites = this.spriteFrameInfos.map((info) => info.toJSON());
        return this;
    }
    async queryInvalidSpriteAssets(_includeAssets) {
        // 去 db 查询理论上会比在同进程 cache 里查询的慢 TODO
        const assets = await asset_library_1.buildAssetLibrary.queryAssetsByOptions({
            pattern: (0, path_1.dirname)(this.path) + '/**/*',
            importer: 'sprite-frame',
        });
        let spriteFrameAssets = [];
        // 过滤配置了不参与自动图集或者不在指定资源范围内的 sprite
        for (const asset of assets) {
            if (!asset.meta.userData.packable) {
                continue;
            }
            if (!this.packOptions.filterUnused) {
                spriteFrameAssets.push(asset);
                continue;
            }
            else if (this.packOptions.filterUnused && (!_includeAssets || _includeAssets.includes(asset.uuid))) {
                spriteFrameAssets.push(asset);
                continue;
            }
        }
        if (!spriteFrameAssets || spriteFrameAssets.length === 0) {
            return [];
        }
        // 查找子目录下的所有 pac 文件
        const subPacAssets = await asset_library_1.buildAssetLibrary.queryAssetsByOptions({
            pattern: (0, path_1.dirname)(this.path) + '/*/**/*.pac',
        });
        const subPacDirs = subPacAssets.map((subPac) => (0, path_1.dirname)(subPac.source));
        /// 查找子文件夹中的 .pac 文件，如果有则排除子文件夹下的 sprite frame
        if (subPacAssets.length !== 0) {
            // 排除含有 .pac 文件的子文件夹下的 sprite frame
            spriteFrameAssets = spriteFrameAssets.filter((info) => {
                for (const subPacDir of subPacDirs) {
                    if (utils_1.default.Path.contains(subPacDir, info.source)) {
                        return false;
                    }
                }
                return true;
            });
        }
        return spriteFrameAssets;
    }
    toJSON() {
        const json = Object.assign({}, this);
        // @ts-ignore
        delete json.spriteFrames;
        // @ts-ignore
        delete json.storeInfo;
    }
}
exports.PacInfo = PacInfo;
/**
 * 每张图集可能生成多张大图，每一张大图有对应的 AtlasInfo
 */
class AtlasInfo {
    imagePath;
    imageUuid = '';
    textureUuid = ''; // Texture2D
    name;
    spriteFrameInfos;
    width;
    height;
    compressed = {
        imagePathNoExt: '',
        suffixs: [],
    };
    constructor(spriteFrameInfos, width, height, name, imagePath) {
        // 这里使用碎图 uuid 来计算大图的 uuid
        const uuids = spriteFrameInfos.map((spriteFrameInfo) => spriteFrameInfo.uuid);
        this.imageUuid = HashUuid.calculate([uuids], HashUuid.BuiltinHashType.AutoAtlasImage)[0];
        this.textureUuid = this.imageUuid + '@' + require('@cocos/asset-db/libs/utils').nameToId('texture');
        this.spriteFrameInfos = spriteFrameInfos;
        this.width = width;
        this.height = height;
        this.name = name;
        // 暂时 hack 直接替换有风险，需要重新组织这块逻辑
        // 合图的临时缓存地址也需要使用计算好的 imageUuid ，因为 etc 的纹理压缩工具只支持指定输出文件夹，文件名将会用 src 的
        this.imagePath = imagePath.replace(name, this.imageUuid);
        this.compressed.suffixs.push((0, path_1.extname)(imagePath));
    }
    toJSON() {
        return {
            spriteFrameInfos: this.spriteFrameInfos.map((info) => info.toJSON()),
            width: this.width,
            height: this.height,
            name: this.name,
            imagePath: this.imagePath,
            imageUuid: this.imageUuid,
            textureUuid: this.textureUuid,
            compressed: this.compressed,
        };
    }
}
exports.AtlasInfo = AtlasInfo;
// 自定义的 spriteFrame 数据格式信息，将会序列化到缓存内二次使用
class SpriteFrameInfo {
    name = '';
    uuid = '';
    imageUuid = '';
    textureUuid = '';
    spriteFrame;
    trim = {
        width: 0,
        height: 0,
        rotatedWidth: 0,
        rotatedHeight: 0,
        x: 0,
        y: 0,
    };
    rawWidth = 0;
    rawHeight = 0;
    width = 0;
    height = 0;
    originalPath = '';
    rotated = false;
    _file = '';
    _libraryPath = '';
    _pacUuid = '';
    _mtime = 0;
    constructor(spriteFrame, assetInfo, options) {
        const trim = spriteFrame.rect;
        this.spriteFrame = spriteFrame;
        const rotatedWidth = spriteFrame.rotated ? trim.height : trim.width;
        const rotatedHeight = spriteFrame.rotated ? trim.width : trim.height;
        this.name = assetInfo.displayName || '';
        // 已经自动合图的情况下，不再动态合图
        spriteFrame.packable = false;
        this.rotated = spriteFrame.rotated;
        this.uuid = assetInfo.uuid;
        // @ts-ignore TODO 目前只有私有接口可用
        this.imageUuid = spriteFrame.texture._mipmaps[0]._uuid;
        this.textureUuid = spriteFrame.texture._uuid;
        // TODO 子资源嵌套时，取父资源可能依旧无法拿到实际图片地址
        // 目前 spriteFrame 的父资源都是图片，暂时没问题
        this._file = assetInfo.parent.source; // image 的原始地址
        // @ts-ignore
        this._libraryPath = (0, path_1.normalize)(spriteFrame.texture._mipmaps[0].url);
        this.trim = {
            rotatedWidth: rotatedWidth,
            rotatedHeight: rotatedHeight,
            x: trim.x,
            y: trim.y,
            width: trim.width,
            height: trim.height,
        };
        this.rawWidth = spriteFrame.originalSize.width;
        this.rawHeight = spriteFrame.originalSize.height;
        this.width = trim.width + (options.padding + options.bleed) * 2;
        this.height = trim.height + (options.padding + options.bleed) * 2;
        this._mtime = assetInfo._assetDB.infoManager.get(assetInfo.parent.source).time;
    }
    toJSON() {
        const json = Object.assign({}, this);
        // TODO 移除所有的私有属性（临时属性）
        delete json._libraryPath;
        delete json._file;
        delete json._pacUuid;
        delete json.spriteFrame;
        return json;
    }
}
exports.SpriteFrameInfo = SpriteFrameInfo;
function createAssetInstance(atlases, pacInfo, spriteFrames) {
    const res = createApriteAtlasFromAtlas(atlases, pacInfo, spriteFrames);
    return [
        res.spriteAtlas,
        ...res.images,
        ...res.spriteFrames,
        ...res.textures,
    ];
}
function createApriteAtlasFromAtlas(atlases, pacInfo, allSpriteFrames) {
    const spriteAtlas = new cc_1.SpriteAtlas();
    spriteAtlas._uuid = pacInfo.uuid;
    // TODO name 获取有误
    spriteAtlas.name = (0, path_1.basename)(pacInfo.source, (0, path_1.extname)(pacInfo.source));
    const images = [];
    const textures = [];
    const spriteFrames = [];
    for (const atlas of atlases) {
        const { image, texture } = createTextureFromAtlas(atlas, pacInfo);
        images.push(image);
        textures.push(texture);
        if (atlas.spriteFrameInfos) {
            atlas.spriteFrameInfos.forEach((spriteFrameInfo) => {
                let spriteFrame = allSpriteFrames.find((frame) => frame._uuid === spriteFrameInfo.uuid);
                // TODO 是否可以通过直接更改现有对象的某个属性实现
                spriteFrame = generateSpriteFrame(spriteFrameInfo, spriteFrame, texture);
                spriteFrames.push(spriteFrame);
                spriteAtlas.spriteFrames[spriteFrameInfo.name] = EditorExtends.serialize.asAsset(spriteFrameInfo.uuid);
            });
        }
    }
    return {
        spriteAtlas,
        textures,
        images,
        spriteFrames,
    };
}
function createTextureFromAtlas(atlas, pacInfo) {
    const imageUuid = atlas.imageUuid;
    const textureUuid = atlas.textureUuid;
    // @ts-ignore
    if (atlas.compressd) {
        // @ts-ignore
        atlas.compressed = atlas.compressd;
    }
    if (!atlas.compressed) {
        throw new Error('Can\'t find atlas.compressed.');
    }
    const image = new cc_1.ImageAsset();
    image._setRawAsset('.png');
    image._uuid = imageUuid;
    // @ts-ignore
    image._width = image._nativeAsset.width = atlas.width;
    // @ts-ignore
    image._height = image._nativeAsset.height = atlas.height;
    const texture = new cc_1.Texture2D();
    if (!pacInfo.meta.userData.textureSetting) {
        console.warn(`meta.userData.textureSetting in asset(${pacInfo.uuid}) is missing.`);
    }
    applyTextureBaseAssetUserData(pacInfo.meta.userData.textureSetting, texture);
    texture._mipmaps = [image];
    texture._uuid = textureUuid;
    return { texture, image };
}
function applyTextureBaseAssetUserData(userData, texture) {
    userData = userData || {
        wrapModeS: 'repeat',
        wrapModeT: 'repeat',
        minfilter: 'nearest',
        magfilter: 'linear',
        mipfilter: 'none',
        anisotropy: 1,
    };
    const getWrapMode = (wrapMode) => {
        switch (wrapMode) {
            case 'clamp-to-edge':
                return cc_1.Texture2D.WrapMode.CLAMP_TO_EDGE;
            case 'repeat':
                return cc_1.Texture2D.WrapMode.REPEAT;
            case 'mirrored-repeat':
                return cc_1.Texture2D.WrapMode.MIRRORED_REPEAT;
        }
    };
    const getFilter = (filter) => {
        switch (filter) {
            case 'nearest':
                return cc_1.Texture2D.Filter.NEAREST;
            case 'linear':
                return cc_1.Texture2D.Filter.LINEAR;
            case 'none':
                return cc_1.Texture2D.Filter.NONE;
        }
    };
    texture.setWrapMode(getWrapMode(userData.wrapModeS), getWrapMode(userData.wrapModeT));
    texture.setFilters(getFilter(userData.minfilter), getFilter(userData.magfilter));
    texture.setMipFilter(getFilter(userData.mipfilter));
    texture.setAnisotropy(userData.anisotropy);
}
function generateSpriteFrame(item, oldSpriteFrame, texture) {
    const spriteFrame = new cc_1.SpriteFrame();
    // texture 需要先设置，在引擎的接口实现里后续的 rect、originalSize、offset 会根据 texture 计算
    spriteFrame.texture = texture;
    spriteFrame.rect = new cc_1.Rect(item.trim.x, item.trim.y, item.trim.width, item.trim.height);
    spriteFrame.originalSize = new cc_1.Size(item.rawWidth, item.rawHeight);
    spriteFrame.offset = oldSpriteFrame.offset;
    spriteFrame.name = item.name;
    spriteFrame.rotated = item.rotated;
    spriteFrame.insetBottom = oldSpriteFrame.insetBottom;
    spriteFrame.insetTop = oldSpriteFrame.insetTop;
    spriteFrame.insetRight = oldSpriteFrame.insetRight;
    spriteFrame.insetLeft = oldSpriteFrame.insetLeft;
    spriteFrame._uuid = oldSpriteFrame.uuid;
    return spriteFrame;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFjLWluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3dvcmtlci9idWlsZGVyL2Fzc2V0LWhhbmRsZXIvdGV4dHVyZS1wYWNrZXIvcGFjLWluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMlRBLGtEQVFDO0FBRUQsZ0VBOEJDO0FBRUQsd0RBMkJDO0FBRUQsc0VBaUNDO0FBRUQsa0RBa0JDO0FBdmJEOztHQUVHO0FBQ0gsMkJBQStGO0FBQy9GLCtCQUE2RTtBQUM3RSwrREFBZ0U7QUFDaEUsZ0VBQWtEO0FBR2xELHNFQUE4QztBQUM5QyxvREFBNEI7QUFDNUIsc0ZBQTZEO0FBRWhELFFBQUEsaUJBQWlCLEdBQWlCO0lBQzNDLFFBQVEsRUFBRSxJQUFJO0lBQ2QsU0FBUyxFQUFFLElBQUk7SUFFZixvQkFBb0I7SUFDcEIsT0FBTyxFQUFFLENBQUM7SUFFVixhQUFhLEVBQUUsSUFBSTtJQUNuQixZQUFZLEVBQUUsS0FBSztJQUNuQixVQUFVLEVBQUUsS0FBSztJQUNqQixTQUFTLEVBQUUsVUFBVTtJQUNyQixNQUFNLEVBQUUsS0FBSztJQUNiLE9BQU8sRUFBRSxFQUFFO0lBQ1gsWUFBWSxFQUFFLElBQUk7SUFDbEIsWUFBWSxFQUFFLElBQUk7SUFDbEIsWUFBWSxFQUFFLElBQUk7SUFDbEIscUJBQXFCLEVBQUUsSUFBSTtJQUMzQixtQkFBbUIsRUFBRSxJQUFJO0lBQ3pCLHlCQUF5QixFQUFFLElBQUk7SUFDL0IsZ0JBQWdCLEVBQUUsRUFBRTtJQUNwQixLQUFLLEVBQUUsQ0FBQztJQUNSLElBQUksRUFBRSxPQUFPO0NBQ2hCLENBQUM7QUFFRjs7R0FFRztBQUNILE1BQWEsT0FBTztJQUNULGdCQUFnQixHQUFzQixFQUFFLENBQUM7SUFDekMsWUFBWSxHQUFrQixFQUFFLENBQUM7SUFDakMsWUFB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QVcsQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQztJQUVqRCxXQUFXLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUM7SUFDeEMsT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiDmraTmlofku7bkvp3otZbkuoborrjlpJrlvJXmk47mjqXlj6PvvIzms6jmhI/niYjmnKzljYfnuqflvbHlk41cclxuICovXHJcbmltcG9ydCB7IEltYWdlQXNzZXQsIFJlY3QsIFNpemUsIFNwcml0ZUF0bGFzLCBTcHJpdGVGcmFtZSwgVGV4dHVyZTJELCBhc3NldE1hbmFnZXIgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IGJhc2VuYW1lLCBkaXJuYW1lLCBleHRuYW1lLCBqb2luLCBub3JtYWxpemUsIHJlbGF0aXZlIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGJ1aWxkQXNzZXRMaWJyYXJ5IH0gZnJvbSAnLi4vLi4vbWFuYWdlci9hc3NldC1saWJyYXJ5JztcclxuaW1wb3J0ICogYXMgSGFzaFV1aWQgZnJvbSAnLi4vLi4vdXRpbHMvaGFzaC11dWlkJztcclxuaW1wb3J0IHsgSUFzc2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXNzZXRzL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBJUGFja09wdGlvbnMsIElQYWNJbmZvLCBQYWNTdG9yZUluZm8sIElQYWNrUmVzdWx0LCBDb21wcmVzc2VkSW5mbywgSUF0bGFzSW5mbywgSVNwcml0ZUZyYW1lSW5mbyB9IGZyb20gJy4uLy4uLy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYmFzZS91dGlscyc7XHJcbmltcG9ydCBsb2Rhc2ggZnJvbSAnbG9kYXNoJztcclxuaW1wb3J0IGJ1aWxkZXJDb25maWcgZnJvbSAnLi4vLi4vLi4vLi4vc2hhcmUvYnVpbGRlci1jb25maWcnO1xyXG5cclxuZXhwb3J0IGNvbnN0IERlZmF1bHRQYWNrT3B0aW9uOiBJUGFja09wdGlvbnMgPSB7XHJcbiAgICBtYXhXaWR0aDogMTAyNCxcclxuICAgIG1heEhlaWdodDogMTAyNCxcclxuXHJcbiAgICAvLyBwYWRkaW5nIG9mIGltYWdlLlxyXG4gICAgcGFkZGluZzogMixcclxuXHJcbiAgICBhbGxvd1JvdGF0aW9uOiB0cnVlLFxyXG4gICAgZm9yY2VTcXVhcmVkOiBmYWxzZSxcclxuICAgIHBvd2VyT2ZUd286IGZhbHNlLFxyXG4gICAgYWxnb3JpdGhtOiAnTWF4UmVjdHMnLFxyXG4gICAgZm9ybWF0OiAncG5nJyxcclxuICAgIHF1YWxpdHk6IDgwLFxyXG4gICAgY29udG91ckJsZWVkOiB0cnVlLFxyXG4gICAgcGFkZGluZ0JsZWVkOiB0cnVlLFxyXG4gICAgZmlsdGVyVW51c2VkOiB0cnVlLFxyXG4gICAgcmVtb3ZlVGV4dHVyZUluQnVuZGxlOiB0cnVlLFxyXG4gICAgcmVtb3ZlSW1hZ2VJbkJ1bmRsZTogdHJ1ZSxcclxuICAgIHJlbW92ZVNwcml0ZUF0bGFzSW5CdW5kbGU6IHRydWUsXHJcbiAgICBjb21wcmVzc1NldHRpbmdzOiB7fSxcclxuICAgIGJsZWVkOiAwLFxyXG4gICAgbW9kZTogJ2J1aWxkJyxcclxufTtcclxuXHJcbi8qKlxyXG4gKiDkuIDkuKrlm77pm4bkv6Hmga9cclxuICovXHJcbmV4cG9ydCBjbGFzcyBQYWNJbmZvIGltcGxlbWVudHMgSVBhY0luZm8ge1xyXG4gICAgcHVibGljIHNwcml0ZUZyYW1lSW5mb3M6IFNwcml0ZUZyYW1lSW5mb1tdID0gW107XHJcbiAgICBwdWJsaWMgc3ByaXRlRnJhbWVzOiBTcHJpdGVGcmFtZVtdID0gW107XHJcbiAgICBwdWJsaWMgcmVsYXRpdmVQYXRoID0gJyc7XHJcbiAgICBwdWJsaWMgcmVsYXRpdmVEaXIgPSAnJztcclxuICAgIHB1YmxpYyBwYXRoID0gJyc7XHJcbiAgICBwdWJsaWMgdXVpZCA9ICcnO1xyXG4gICAgcHVibGljIGltYWdlUGF0aCA9ICcnO1xyXG4gICAgcHVibGljIGltYWdlVXVpZCA9ICcnO1xyXG4gICAgcHVibGljIHRleHR1cmVVdWlkID0gJyc7IC8vIFRleHR1cmUyRFxyXG4gICAgcHVibGljIG5hbWUgPSAnYXV0b2F0bGFzJztcclxuICAgIHB1YmxpYyB3aWR0aCA9IDEwMjQ7XHJcbiAgICBwdWJsaWMgaGVpZ2h0ID0gMTAyNDtcclxuICAgIHB1YmxpYyBkaXJ0eSA9IGZhbHNlO1xyXG5cclxuICAgIHB1YmxpYyBwYWNrT3B0aW9uczogSVBhY2tPcHRpb25zID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShEZWZhdWx0UGFja09wdGlvbikpO1xyXG5cclxuICAgIHB1YmxpYyBzdG9yZUluZm86IFBhY1N0b3JlSW5mbztcclxuICAgIHB1YmxpYyByZXN1bHQ/OiBJUGFja1Jlc3VsdDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwYWNBc3NldDogSUFzc2V0LCBvcHRpb25zPzogUGFydGlhbDxJUGFja09wdGlvbnM+KSB7XHJcbiAgICAgICAgdGhpcy51dWlkID0gcGFjQXNzZXQudXVpZDtcclxuICAgICAgICAvLyDlnKggZGIg6L+b56iL5YaF5Y+W5b6X5b6XIG1ldGEg5pWw5o2u6ZyA6KaB5rex5ou36LSd6YG/5YWN5b2x5ZON5Y6f5pWw5o2uXHJcbiAgICAgICAgbGV0IHVzZXJEYXRhID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShwYWNBc3NldC5tZXRhLnVzZXJEYXRhKSk7XHJcbiAgICAgICAgdXNlckRhdGEgPSBvcHRpb25zID8gT2JqZWN0LmFzc2lnbih1c2VyRGF0YSwgb3B0aW9ucykgOiB1c2VyRGF0YTtcclxuICAgICAgICAvLyBUT0RPIOWPr+iDveS8muaciemdnuazleaVsOaNruiiqyBhc3NpZ25cclxuICAgICAgICB0aGlzLnBhY2tPcHRpb25zID0gT2JqZWN0LmFzc2lnbih0aGlzLnBhY2tPcHRpb25zLCB1c2VyRGF0YSk7XHJcbiAgICAgICAgdGhpcy5wYWNrT3B0aW9ucy5ibGVlZCA9IHRoaXMucGFja09wdGlvbnMucGFkZGluZ0JsZWVkID8gMSA6IDA7XHJcbiAgICAgICAgdGhpcy5wYXRoID0gcGFjQXNzZXQudXJsO1xyXG4gICAgICAgIC8vIOWPguS4jue8k+WtmOiuoeeul+eahOaVsOaNrlxyXG4gICAgICAgIHRoaXMuc3RvcmVJbmZvID0ge1xyXG4gICAgICAgICAgICBwYWM6IHtcclxuICAgICAgICAgICAgICAgIHV1aWQ6IHBhY0Fzc2V0LnV1aWQsXHJcbiAgICAgICAgICAgICAgICBtdGltZTogYnVpbGRBc3NldExpYnJhcnkuZ2V0QXNzZXRQcm9wZXJ0eShwYWNBc3NldCwgJ210aW1lJyksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNwcml0ZXM6IFtdLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB0aGlzLnBhY2tPcHRpb25zLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgYXNzZXRzUGF0aCA9IGpvaW4oYnVpbGRlckNvbmZpZy5wcm9qZWN0Um9vdCwgJ2Fzc2V0cycpO1xyXG4gICAgICAgIHRoaXMucmVsYXRpdmVQYXRoID0gcmVsYXRpdmUoYXNzZXRzUGF0aCwgcGFjQXNzZXQuc291cmNlKTtcclxuICAgICAgICB0aGlzLnJlbGF0aXZlRGlyID0gcmVsYXRpdmUoYXNzZXRzUGF0aCwgZGlybmFtZShwYWNBc3NldC5zb3VyY2UpKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldFByb3BlcnR5KHBhY0Fzc2V0LCAnbmFtZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyBpbml0U3ByaXRlRnJhbWVzV2l0aFJhbmdlKGluY2x1ZGVBc3NldHM/OiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGNvbnN0IHNwcml0ZUZyYW1lQXNzZXRzID0gYXdhaXQgdGhpcy5xdWVyeUludmFsaWRTcHJpdGVBc3NldHMoaW5jbHVkZUFzc2V0cyk7XHJcbiAgICAgICAgaWYgKCFzcHJpdGVGcmFtZUFzc2V0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdFNwcml0ZUZyYW1lcyhzcHJpdGVGcmFtZUFzc2V0cyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGFjQXNzZXRJbmZvIOS7jiBkYiDkuK3ojrflj5blh7rmnaXnmoQgcGFjIOS/oeaBr1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgaW5pdFNwcml0ZUZyYW1lcyhzcHJpdGVGcmFtZUFzc2V0czogKElBc3NldClbXSkge1xyXG4gICAgICAgIGxldCBzcHJpdGVGcmFtZUluZm9zID0gYXdhaXQgUHJvbWlzZS5hbGwoc3ByaXRlRnJhbWVBc3NldHMubWFwKGFzeW5jIChhc3NldDogSUFzc2V0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChhc3NldE1hbmFnZXIuYXNzZXRzLmhhcyhhc3NldC51dWlkKSkge1xyXG4gICAgICAgICAgICAgICAgYXNzZXRNYW5hZ2VyLnJlbGVhc2VBc3NldChhc3NldE1hbmFnZXIuYXNzZXRzLmdldChhc3NldC51dWlkKSEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhc3NldE1hbmFnZXIubG9hZEFueShhc3NldC51dWlkLCAoZXJyLCBzcHJpdGVGcmFtZTogU3ByaXRlRnJhbWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDmraTlpITnmoTplJnor6/lpITnkIbpg73kuI0gcmVqZWN0IO+8jOWFqOmDqOaJp+ihjOWujOWQjue7reS8mui/h+a7pOmdnuazleaVsOaNrlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIgfHwgIXNwcml0ZUZyYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHNwcml0ZSBmcmFtZSBjYW4ndCBiZSBsb2FkOiR7YXNzZXQudXVpZH0sIHdpbGwgcmVtb3ZlIGl0IGZyb20gYXRsYXMuYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVyciAmJiBjb25zb2xlLmVycm9yKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ByaXRlRnJhbWVJbmZvID0gbmV3IFNwcml0ZUZyYW1lSW5mbyhzcHJpdGVGcmFtZSwgYXNzZXQsIHRoaXMucGFja09wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcHJpdGVGcmFtZUluZm8uX3BhY1V1aWQgPSB0aGlzLnV1aWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlRnJhbWVzLnB1c2goc3ByaXRlRnJhbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHNwcml0ZUZyYW1lSW5mbyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgcGFja2VyOiBsb2FkIHNwcml0ZSBmcmFtZSBmYWlsZWQ6JHthc3NldC51dWlkfWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAvLyDnp7vpmaQg5peg5pWI55qEIHNwcml0ZSBmcmFtZVxyXG4gICAgICAgIHNwcml0ZUZyYW1lSW5mb3MgPSBzcHJpdGVGcmFtZUluZm9zLmZpbHRlcigoaW5mbykgPT4gaW5mbyAhPSBudWxsKTtcclxuXHJcbiAgICAgICAgLy8g5a+5IOWbvueJhyDov5vooYzmjpLluo/vvIznoa7kv53mr4/mrKHph43mlrDorqHnrpflkIjlm77lkI7nmoTnu5PmnpzmmK/nqLPlrprnmoTjgIJcclxuICAgICAgICAvLyDor6XmjpLluo/lj6rlvbHlk43lkIjlm77op6PmnpDnoo7lm77nmoTpobrluo/vvIzmnIDnu4jlm77pm4bkuK3nmoTmjpLluo/kuI7lkIjlm77nrpfms5XmnInlhbPvvIzlj6rmnInlvZPlm77pm4bkuK3mnInnm7jlkIzlsLrlr7jnmoTnoo7lm77ml7bor6XmjpLluo/miY3kvJrkuqfnlJ/kvZznlKjjgIJcclxuICAgICAgICBzcHJpdGVGcmFtZUluZm9zID0gbG9kYXNoLnNvcnRCeShzcHJpdGVGcmFtZUluZm9zLCAndXVpZCcpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlRnJhbWVJbmZvcyA9IHNwcml0ZUZyYW1lSW5mb3MgYXMgU3ByaXRlRnJhbWVJbmZvW107XHJcbiAgICAgICAgdGhpcy5zdG9yZUluZm8uc3ByaXRlcyA9IHRoaXMuc3ByaXRlRnJhbWVJbmZvcy5tYXAoKGluZm8pID0+IGluZm8udG9KU09OKCkpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIHF1ZXJ5SW52YWxpZFNwcml0ZUFzc2V0cyhfaW5jbHVkZUFzc2V0cz86IHN0cmluZ1tdKTogUHJvbWlzZTxBcnJheTxJQXNzZXQ+PiB7XHJcblxyXG4gICAgICAgIC8vIOWOuyBkYiDmn6Xor6LnkIborrrkuIrkvJrmr5TlnKjlkIzov5vnqIsgY2FjaGUg6YeM5p+l6K+i55qE5oWiIFRPRE9cclxuICAgICAgICBjb25zdCBhc3NldHMgPSBhd2FpdCBidWlsZEFzc2V0TGlicmFyeS5xdWVyeUFzc2V0c0J5T3B0aW9ucyh7XHJcbiAgICAgICAgICAgIHBhdHRlcm46IGRpcm5hbWUodGhpcy5wYXRoKSArICcvKiovKicsXHJcbiAgICAgICAgICAgIGltcG9ydGVyOiAnc3ByaXRlLWZyYW1lJyxcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgc3ByaXRlRnJhbWVBc3NldHM6IEFycmF5PElBc3NldD4gPSBbXTtcclxuICAgICAgICAvLyDov4fmu6TphY3nva7kuobkuI3lj4LkuI7oh6rliqjlm77pm4bmiJbogIXkuI3lnKjmjIflrprotYTmupDojIPlm7TlhoXnmoQgc3ByaXRlXHJcbiAgICAgICAgZm9yIChjb25zdCBhc3NldCBvZiBhc3NldHMpIHtcclxuICAgICAgICAgICAgaWYgKCFhc3NldC5tZXRhLnVzZXJEYXRhLnBhY2thYmxlKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXRoaXMucGFja09wdGlvbnMuZmlsdGVyVW51c2VkKSB7XHJcbiAgICAgICAgICAgICAgICBzcHJpdGVGcmFtZUFzc2V0cy5wdXNoKGFzc2V0KTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucGFja09wdGlvbnMuZmlsdGVyVW51c2VkICYmICghX2luY2x1ZGVBc3NldHMgfHwgX2luY2x1ZGVBc3NldHMuaW5jbHVkZXMoYXNzZXQudXVpZCkpKSB7XHJcbiAgICAgICAgICAgICAgICBzcHJpdGVGcmFtZUFzc2V0cy5wdXNoKGFzc2V0KTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc3ByaXRlRnJhbWVBc3NldHMgfHwgc3ByaXRlRnJhbWVBc3NldHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5p+l5om+5a2Q55uu5b2V5LiL55qE5omA5pyJIHBhYyDmlofku7ZcclxuICAgICAgICBjb25zdCBzdWJQYWNBc3NldHM6IGFueSA9IGF3YWl0IGJ1aWxkQXNzZXRMaWJyYXJ5LnF1ZXJ5QXNzZXRzQnlPcHRpb25zKHtcclxuICAgICAgICAgICAgcGF0dGVybjogZGlybmFtZSh0aGlzLnBhdGgpICsgJy8qLyoqLyoucGFjJyxcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBzdWJQYWNEaXJzID0gc3ViUGFjQXNzZXRzLm1hcCgoc3ViUGFjOiBJQXNzZXQpID0+IGRpcm5hbWUoc3ViUGFjLnNvdXJjZSkpO1xyXG4gICAgICAgIC8vLyDmn6Xmib7lrZDmlofku7blpLnkuK3nmoQgLnBhYyDmlofku7bvvIzlpoLmnpzmnInliJnmjpLpmaTlrZDmlofku7blpLnkuIvnmoQgc3ByaXRlIGZyYW1lXHJcbiAgICAgICAgaWYgKHN1YlBhY0Fzc2V0cy5sZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgLy8g5o6S6Zmk5ZCr5pyJIC5wYWMg5paH5Lu255qE5a2Q5paH5Lu25aS55LiL55qEIHNwcml0ZSBmcmFtZVxyXG4gICAgICAgICAgICBzcHJpdGVGcmFtZUFzc2V0cyA9IHNwcml0ZUZyYW1lQXNzZXRzLmZpbHRlcigoaW5mbzogSUFzc2V0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN1YlBhY0RpciBvZiBzdWJQYWNEaXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHV0aWxzLlBhdGguY29udGFpbnMoc3ViUGFjRGlyLCBpbmZvLnNvdXJjZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzcHJpdGVGcmFtZUFzc2V0cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdG9KU09OKCkge1xyXG4gICAgICAgIGNvbnN0IGpzb24gPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzKTtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgZGVsZXRlIGpzb24uc3ByaXRlRnJhbWVzO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBkZWxldGUganNvbi5zdG9yZUluZm87XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmr4/lvKDlm77pm4blj6/og73nlJ/miJDlpJrlvKDlpKflm77vvIzmr4/kuIDlvKDlpKflm77mnInlr7nlupTnmoQgQXRsYXNJbmZvXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQXRsYXNJbmZvIHtcclxuICAgIHB1YmxpYyBpbWFnZVBhdGg6IHN0cmluZztcclxuICAgIHB1YmxpYyBpbWFnZVV1aWQgPSAnJztcclxuICAgIHB1YmxpYyB0ZXh0dXJlVXVpZCA9ICcnOyAvLyBUZXh0dXJlMkRcclxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgc3ByaXRlRnJhbWVJbmZvczogU3ByaXRlRnJhbWVJbmZvW107XHJcbiAgICBwdWJsaWMgd2lkdGg6IG51bWJlcjtcclxuICAgIHB1YmxpYyBoZWlnaHQ6IG51bWJlcjtcclxuICAgIHB1YmxpYyBjb21wcmVzc2VkOiBDb21wcmVzc2VkSW5mbyA9IHtcclxuICAgICAgICBpbWFnZVBhdGhOb0V4dDogJycsXHJcbiAgICAgICAgc3VmZml4czogW10sXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNwcml0ZUZyYW1lSW5mb3M6IFNwcml0ZUZyYW1lSW5mb1tdLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgbmFtZTogc3RyaW5nLCBpbWFnZVBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIC8vIOi/memHjOS9v+eUqOeijuWbviB1dWlkIOadpeiuoeeul+Wkp+WbvueahCB1dWlkXHJcbiAgICAgICAgY29uc3QgdXVpZHMgPSBzcHJpdGVGcmFtZUluZm9zLm1hcCgoc3ByaXRlRnJhbWVJbmZvKSA9PiBzcHJpdGVGcmFtZUluZm8udXVpZCk7XHJcbiAgICAgICAgdGhpcy5pbWFnZVV1aWQgPSBIYXNoVXVpZC5jYWxjdWxhdGUoW3V1aWRzXSwgSGFzaFV1aWQuQnVpbHRpbkhhc2hUeXBlLkF1dG9BdGxhc0ltYWdlKVswXTtcclxuICAgICAgICB0aGlzLnRleHR1cmVVdWlkID0gdGhpcy5pbWFnZVV1aWQgKyAnQCcgKyByZXF1aXJlKCdAY29jb3MvYXNzZXQtZGIvbGlicy91dGlscycpLm5hbWVUb0lkKCd0ZXh0dXJlJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVGcmFtZUluZm9zID0gc3ByaXRlRnJhbWVJbmZvcztcclxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICAvLyDmmoLml7YgaGFjayDnm7TmjqXmm7/mjaLmnInpo47pmanvvIzpnIDopoHph43mlrDnu4Tnu4fov5nlnZfpgLvovpFcclxuICAgICAgICAvLyDlkIjlm77nmoTkuLTml7bnvJPlrZjlnLDlnYDkuZ/pnIDopoHkvb/nlKjorqHnrpflpb3nmoQgaW1hZ2VVdWlkIO+8jOWboOS4uiBldGMg55qE57q555CG5Y6L57yp5bel5YW35Y+q5pSv5oyB5oyH5a6a6L6T5Ye65paH5Lu25aS577yM5paH5Lu25ZCN5bCG5Lya55SoIHNyYyDnmoRcclxuICAgICAgICB0aGlzLmltYWdlUGF0aCA9IGltYWdlUGF0aC5yZXBsYWNlKG5hbWUsIHRoaXMuaW1hZ2VVdWlkKTtcclxuICAgICAgICB0aGlzLmNvbXByZXNzZWQuc3VmZml4cy5wdXNoKGV4dG5hbWUoaW1hZ2VQYXRoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRvSlNPTigpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzcHJpdGVGcmFtZUluZm9zOiB0aGlzLnNwcml0ZUZyYW1lSW5mb3MubWFwKChpbmZvKSA9PiBpbmZvLnRvSlNPTigpKSxcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXHJcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXHJcbiAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgICAgICAgaW1hZ2VQYXRoOiB0aGlzLmltYWdlUGF0aCxcclxuICAgICAgICAgICAgaW1hZ2VVdWlkOiB0aGlzLmltYWdlVXVpZCxcclxuICAgICAgICAgICAgdGV4dHVyZVV1aWQ6IHRoaXMudGV4dHVyZVV1aWQsXHJcbiAgICAgICAgICAgIGNvbXByZXNzZWQ6IHRoaXMuY29tcHJlc3NlZCxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyDoh6rlrprkuYnnmoQgc3ByaXRlRnJhbWUg5pWw5o2u5qC85byP5L+h5oGv77yM5bCG5Lya5bqP5YiX5YyW5Yiw57yT5a2Y5YaF5LqM5qyh5L2/55SoXHJcbmV4cG9ydCBjbGFzcyBTcHJpdGVGcmFtZUluZm8ge1xyXG4gICAgcHVibGljIG5hbWUgPSAnJztcclxuICAgIHB1YmxpYyB1dWlkID0gJyc7XHJcbiAgICBwdWJsaWMgaW1hZ2VVdWlkID0gJyc7XHJcbiAgICBwdWJsaWMgdGV4dHVyZVV1aWQgPSAnJztcclxuICAgIHB1YmxpYyBzcHJpdGVGcmFtZTogU3ByaXRlRnJhbWU7XHJcblxyXG4gICAgcHVibGljIHRyaW0gPSB7XHJcbiAgICAgICAgd2lkdGg6IDAsXHJcbiAgICAgICAgaGVpZ2h0OiAwLFxyXG4gICAgICAgIHJvdGF0ZWRXaWR0aDogMCxcclxuICAgICAgICByb3RhdGVkSGVpZ2h0OiAwLFxyXG4gICAgICAgIHg6IDAsXHJcbiAgICAgICAgeTogMCxcclxuICAgIH07XHJcbiAgICBwdWJsaWMgcmF3V2lkdGggPSAwO1xyXG4gICAgcHVibGljIHJhd0hlaWdodCA9IDA7XHJcbiAgICBwdWJsaWMgd2lkdGggPSAwO1xyXG4gICAgcHVibGljIGhlaWdodCA9IDA7XHJcbiAgICBwdWJsaWMgb3JpZ2luYWxQYXRoID0gJyc7XHJcbiAgICBwdWJsaWMgcm90YXRlZCA9IGZhbHNlO1xyXG5cclxuICAgIHB1YmxpYyBfZmlsZSA9ICcnO1xyXG4gICAgcHVibGljIF9saWJyYXJ5UGF0aCA9ICcnO1xyXG4gICAgcHVibGljIF9wYWNVdWlkID0gJyc7XHJcblxyXG4gICAgcHJpdmF0ZSBfbXRpbWUgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNwcml0ZUZyYW1lOiBTcHJpdGVGcmFtZSwgYXNzZXRJbmZvOiBJQXNzZXQsIG9wdGlvbnM6IElQYWNrT3B0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IHRyaW0gPSBzcHJpdGVGcmFtZS5yZWN0O1xyXG4gICAgICAgIHRoaXMuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZTtcclxuICAgICAgICBjb25zdCByb3RhdGVkV2lkdGggPSBzcHJpdGVGcmFtZS5yb3RhdGVkID8gdHJpbS5oZWlnaHQgOiB0cmltLndpZHRoO1xyXG4gICAgICAgIGNvbnN0IHJvdGF0ZWRIZWlnaHQgPSBzcHJpdGVGcmFtZS5yb3RhdGVkID8gdHJpbS53aWR0aCA6IHRyaW0uaGVpZ2h0O1xyXG5cclxuICAgICAgICB0aGlzLm5hbWUgPSBhc3NldEluZm8uZGlzcGxheU5hbWUgfHwgJyc7XHJcbiAgICAgICAgLy8g5bey57uP6Ieq5Yqo5ZCI5Zu+55qE5oOF5Ya15LiL77yM5LiN5YaN5Yqo5oCB5ZCI5Zu+XHJcbiAgICAgICAgc3ByaXRlRnJhbWUucGFja2FibGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnJvdGF0ZWQgPSBzcHJpdGVGcmFtZS5yb3RhdGVkO1xyXG4gICAgICAgIHRoaXMudXVpZCA9IGFzc2V0SW5mby51dWlkO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgVE9ETyDnm67liY3lj6rmnInnp4HmnInmjqXlj6Plj6/nlKhcclxuICAgICAgICB0aGlzLmltYWdlVXVpZCA9IHNwcml0ZUZyYW1lLnRleHR1cmUuX21pcG1hcHMhWzBdLl91dWlkO1xyXG4gICAgICAgIHRoaXMudGV4dHVyZVV1aWQgPSBzcHJpdGVGcmFtZS50ZXh0dXJlLl91dWlkO1xyXG4gICAgICAgIC8vIFRPRE8g5a2Q6LWE5rqQ5bWM5aWX5pe277yM5Y+W54i26LWE5rqQ5Y+v6IO95L6d5pen5peg5rOV5ou/5Yiw5a6e6ZmF5Zu+54mH5Zyw5Z2AXHJcbiAgICAgICAgLy8g55uu5YmNIHNwcml0ZUZyYW1lIOeahOeItui1hOa6kOmDveaYr+WbvueJh++8jOaaguaXtuayoemXrumimFxyXG4gICAgICAgIHRoaXMuX2ZpbGUgPSBhc3NldEluZm8ucGFyZW50IS5zb3VyY2U7IC8vIGltYWdlIOeahOWOn+Wni+WcsOWdgFxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICB0aGlzLl9saWJyYXJ5UGF0aCA9IG5vcm1hbGl6ZShzcHJpdGVGcmFtZS50ZXh0dXJlLl9taXBtYXBzIVswXS51cmwpO1xyXG4gICAgICAgIHRoaXMudHJpbSA9IHtcclxuICAgICAgICAgICAgcm90YXRlZFdpZHRoOiByb3RhdGVkV2lkdGgsXHJcbiAgICAgICAgICAgIHJvdGF0ZWRIZWlnaHQ6IHJvdGF0ZWRIZWlnaHQsXHJcbiAgICAgICAgICAgIHg6IHRyaW0ueCxcclxuICAgICAgICAgICAgeTogdHJpbS55LFxyXG4gICAgICAgICAgICB3aWR0aDogdHJpbS53aWR0aCxcclxuICAgICAgICAgICAgaGVpZ2h0OiB0cmltLmhlaWdodCxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMucmF3V2lkdGggPSBzcHJpdGVGcmFtZS5vcmlnaW5hbFNpemUud2lkdGg7XHJcbiAgICAgICAgdGhpcy5yYXdIZWlnaHQgPSBzcHJpdGVGcmFtZS5vcmlnaW5hbFNpemUuaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMud2lkdGggPSB0cmltLndpZHRoICsgKG9wdGlvbnMucGFkZGluZyArIG9wdGlvbnMuYmxlZWQpICogMjtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHRyaW0uaGVpZ2h0ICsgKG9wdGlvbnMucGFkZGluZyArIG9wdGlvbnMuYmxlZWQpICogMjtcclxuICAgICAgICB0aGlzLl9tdGltZSA9IGFzc2V0SW5mby5fYXNzZXREQi5pbmZvTWFuYWdlci5nZXQoYXNzZXRJbmZvLnBhcmVudCEuc291cmNlKS50aW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0b0pTT04oKSB7XHJcbiAgICAgICAgY29uc3QganNvbjogYW55ID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcyk7XHJcbiAgICAgICAgLy8gVE9ETyDnp7vpmaTmiYDmnInnmoTnp4HmnInlsZ7mgKfvvIjkuLTml7blsZ7mgKfvvIlcclxuICAgICAgICBkZWxldGUganNvbi5fbGlicmFyeVBhdGg7XHJcbiAgICAgICAgZGVsZXRlIGpzb24uX2ZpbGU7XHJcbiAgICAgICAgZGVsZXRlIGpzb24uX3BhY1V1aWQ7XHJcbiAgICAgICAgZGVsZXRlIGpzb24uc3ByaXRlRnJhbWU7XHJcbiAgICAgICAgcmV0dXJuIGpzb247XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcHVibGljIGNsb25lKCkge1xyXG4gICAgLy8gICAgIGNvbnN0IG9iaiA9IG5ldyBTcHJpdGVGcmFtZUluZm8oKTtcclxuICAgIC8vICAgICBPYmplY3QuYXNzaWduKG9iaiwgdGhpcyk7XHJcbiAgICAvLyAgICAgcmV0dXJuIG9iajtcclxuICAgIC8vIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUFzc2V0SW5zdGFuY2UoYXRsYXNlczogSUF0bGFzSW5mb1tdLCBwYWNJbmZvOiBJQXNzZXQsIHNwcml0ZUZyYW1lczogU3ByaXRlRnJhbWVbXSkge1xyXG4gICAgY29uc3QgcmVzID0gY3JlYXRlQXByaXRlQXRsYXNGcm9tQXRsYXMoYXRsYXNlcywgcGFjSW5mbywgc3ByaXRlRnJhbWVzKTtcclxuICAgIHJldHVybiBbXHJcbiAgICAgICAgcmVzLnNwcml0ZUF0bGFzLFxyXG4gICAgICAgIC4uLnJlcy5pbWFnZXMsXHJcbiAgICAgICAgLi4ucmVzLnNwcml0ZUZyYW1lcyxcclxuICAgICAgICAuLi5yZXMudGV4dHVyZXMsXHJcbiAgICBdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXByaXRlQXRsYXNGcm9tQXRsYXMoYXRsYXNlczogSUF0bGFzSW5mb1tdLCBwYWNJbmZvOiBJQXNzZXQsIGFsbFNwcml0ZUZyYW1lczogU3ByaXRlRnJhbWVbXSkge1xyXG4gICAgY29uc3Qgc3ByaXRlQXRsYXMgPSBuZXcgU3ByaXRlQXRsYXMoKTtcclxuICAgIHNwcml0ZUF0bGFzLl91dWlkID0gcGFjSW5mby51dWlkO1xyXG4gICAgLy8gVE9ETyBuYW1lIOiOt+WPluacieivr1xyXG4gICAgc3ByaXRlQXRsYXMubmFtZSA9IGJhc2VuYW1lKHBhY0luZm8uc291cmNlLCBleHRuYW1lKHBhY0luZm8uc291cmNlKSk7XHJcblxyXG4gICAgY29uc3QgaW1hZ2VzOiBJbWFnZUFzc2V0W10gPSBbXTtcclxuICAgIGNvbnN0IHRleHR1cmVzOiBUZXh0dXJlMkRbXSA9IFtdO1xyXG4gICAgY29uc3Qgc3ByaXRlRnJhbWVzOiBTcHJpdGVGcmFtZVtdID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGF0bGFzIG9mIGF0bGFzZXMpIHtcclxuICAgICAgICBjb25zdCB7IGltYWdlLCB0ZXh0dXJlIH0gPSBjcmVhdGVUZXh0dXJlRnJvbUF0bGFzKGF0bGFzLCBwYWNJbmZvKTtcclxuICAgICAgICBpbWFnZXMucHVzaChpbWFnZSk7XHJcbiAgICAgICAgdGV4dHVyZXMucHVzaCh0ZXh0dXJlKTtcclxuICAgICAgICBpZiAoYXRsYXMuc3ByaXRlRnJhbWVJbmZvcykge1xyXG4gICAgICAgICAgICBhdGxhcy5zcHJpdGVGcmFtZUluZm9zLmZvckVhY2goKHNwcml0ZUZyYW1lSW5mbykgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNwcml0ZUZyYW1lID0gYWxsU3ByaXRlRnJhbWVzLmZpbmQoKGZyYW1lKSA9PiBmcmFtZS5fdXVpZCA9PT0gc3ByaXRlRnJhbWVJbmZvLnV1aWQpO1xyXG4gICAgICAgICAgICAgICAgLy8gVE9ETyDmmK/lkKblj6/ku6XpgJrov4fnm7TmjqXmm7TmlLnnjrDmnInlr7nosaHnmoTmn5DkuKrlsZ7mgKflrp7njrBcclxuICAgICAgICAgICAgICAgIHNwcml0ZUZyYW1lID0gZ2VuZXJhdGVTcHJpdGVGcmFtZShzcHJpdGVGcmFtZUluZm8sIHNwcml0ZUZyYW1lISwgdGV4dHVyZSk7XHJcbiAgICAgICAgICAgICAgICBzcHJpdGVGcmFtZXMucHVzaChzcHJpdGVGcmFtZSk7XHJcbiAgICAgICAgICAgICAgICBzcHJpdGVBdGxhcy5zcHJpdGVGcmFtZXNbc3ByaXRlRnJhbWVJbmZvLm5hbWVdID0gRWRpdG9yRXh0ZW5kcy5zZXJpYWxpemUuYXNBc3NldChzcHJpdGVGcmFtZUluZm8udXVpZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNwcml0ZUF0bGFzLFxyXG4gICAgICAgIHRleHR1cmVzLFxyXG4gICAgICAgIGltYWdlcyxcclxuICAgICAgICBzcHJpdGVGcmFtZXMsXHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVGV4dHVyZUZyb21BdGxhcyhhdGxhczogSUF0bGFzSW5mbywgcGFjSW5mbzogSUFzc2V0KSB7XHJcbiAgICBjb25zdCBpbWFnZVV1aWQgPSBhdGxhcy5pbWFnZVV1aWQ7XHJcbiAgICBjb25zdCB0ZXh0dXJlVXVpZCA9IGF0bGFzLnRleHR1cmVVdWlkO1xyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgaWYgKGF0bGFzLmNvbXByZXNzZCkge1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBhdGxhcy5jb21wcmVzc2VkID0gYXRsYXMuY29tcHJlc3NkO1xyXG4gICAgfVxyXG4gICAgaWYgKCFhdGxhcy5jb21wcmVzc2VkKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5cXCd0IGZpbmQgYXRsYXMuY29tcHJlc3NlZC4nKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlQXNzZXQoKTtcclxuICAgIGltYWdlLl9zZXRSYXdBc3NldCgnLnBuZycpO1xyXG4gICAgaW1hZ2UuX3V1aWQgPSBpbWFnZVV1aWQ7XHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICBpbWFnZS5fd2lkdGggPSBpbWFnZS5fbmF0aXZlQXNzZXQud2lkdGggPSBhdGxhcy53aWR0aDtcclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIGltYWdlLl9oZWlnaHQgPSBpbWFnZS5fbmF0aXZlQXNzZXQuaGVpZ2h0ID0gYXRsYXMuaGVpZ2h0O1xyXG5cclxuICAgIGNvbnN0IHRleHR1cmUgPSBuZXcgVGV4dHVyZTJEKCk7XHJcbiAgICBpZiAoIXBhY0luZm8ubWV0YS51c2VyRGF0YS50ZXh0dXJlU2V0dGluZykge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihgbWV0YS51c2VyRGF0YS50ZXh0dXJlU2V0dGluZyBpbiBhc3NldCgke3BhY0luZm8udXVpZH0pIGlzIG1pc3NpbmcuYCk7XHJcbiAgICB9XHJcbiAgICBhcHBseVRleHR1cmVCYXNlQXNzZXRVc2VyRGF0YShwYWNJbmZvLm1ldGEudXNlckRhdGEudGV4dHVyZVNldHRpbmcsIHRleHR1cmUpO1xyXG4gICAgdGV4dHVyZS5fbWlwbWFwcyA9IFtpbWFnZV07XHJcbiAgICB0ZXh0dXJlLl91dWlkID0gdGV4dHVyZVV1aWQ7XHJcbiAgICByZXR1cm4geyB0ZXh0dXJlLCBpbWFnZSB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlUZXh0dXJlQmFzZUFzc2V0VXNlckRhdGEodXNlckRhdGE6IGFueSwgdGV4dHVyZTogVGV4dHVyZTJEKSB7XHJcbiAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IHtcclxuICAgICAgICB3cmFwTW9kZVM6ICdyZXBlYXQnLFxyXG4gICAgICAgIHdyYXBNb2RlVDogJ3JlcGVhdCcsXHJcbiAgICAgICAgbWluZmlsdGVyOiAnbmVhcmVzdCcsXHJcbiAgICAgICAgbWFnZmlsdGVyOiAnbGluZWFyJyxcclxuICAgICAgICBtaXBmaWx0ZXI6ICdub25lJyxcclxuICAgICAgICBhbmlzb3Ryb3B5OiAxLFxyXG4gICAgfTtcclxuICAgIGNvbnN0IGdldFdyYXBNb2RlID0gKHdyYXBNb2RlOiAnY2xhbXAtdG8tZWRnZScgfCAncmVwZWF0JyB8ICdtaXJyb3JlZC1yZXBlYXQnKSA9PiB7XHJcbiAgICAgICAgc3dpdGNoICh3cmFwTW9kZSkge1xyXG4gICAgICAgICAgICBjYXNlICdjbGFtcC10by1lZGdlJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBUZXh0dXJlMkQuV3JhcE1vZGUuQ0xBTVBfVE9fRURHRTtcclxuICAgICAgICAgICAgY2FzZSAncmVwZWF0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBUZXh0dXJlMkQuV3JhcE1vZGUuUkVQRUFUO1xyXG4gICAgICAgICAgICBjYXNlICdtaXJyb3JlZC1yZXBlYXQnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRleHR1cmUyRC5XcmFwTW9kZS5NSVJST1JFRF9SRVBFQVQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIGNvbnN0IGdldEZpbHRlciA9IChmaWx0ZXI6ICduZWFyZXN0JyB8ICdsaW5lYXInIHwgJ25vbmUnKSA9PiB7XHJcbiAgICAgICAgc3dpdGNoIChmaWx0ZXIpIHtcclxuICAgICAgICAgICAgY2FzZSAnbmVhcmVzdCc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gVGV4dHVyZTJELkZpbHRlci5ORUFSRVNUO1xyXG4gICAgICAgICAgICBjYXNlICdsaW5lYXInOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRleHR1cmUyRC5GaWx0ZXIuTElORUFSO1xyXG4gICAgICAgICAgICBjYXNlICdub25lJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBUZXh0dXJlMkQuRmlsdGVyLk5PTkU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRleHR1cmUuc2V0V3JhcE1vZGUoZ2V0V3JhcE1vZGUodXNlckRhdGEud3JhcE1vZGVTKSwgZ2V0V3JhcE1vZGUodXNlckRhdGEud3JhcE1vZGVUKSk7XHJcbiAgICB0ZXh0dXJlLnNldEZpbHRlcnMoZ2V0RmlsdGVyKHVzZXJEYXRhLm1pbmZpbHRlciksIGdldEZpbHRlcih1c2VyRGF0YS5tYWdmaWx0ZXIpKTtcclxuICAgIHRleHR1cmUuc2V0TWlwRmlsdGVyKGdldEZpbHRlcih1c2VyRGF0YS5taXBmaWx0ZXIpKTtcclxuICAgIHRleHR1cmUuc2V0QW5pc290cm9weSh1c2VyRGF0YS5hbmlzb3Ryb3B5KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlU3ByaXRlRnJhbWUoaXRlbTogSVNwcml0ZUZyYW1lSW5mbywgb2xkU3ByaXRlRnJhbWU6IFNwcml0ZUZyYW1lLCB0ZXh0dXJlOiBUZXh0dXJlMkQpOiBTcHJpdGVGcmFtZSB7XHJcbiAgICBjb25zdCBzcHJpdGVGcmFtZSA9IG5ldyBTcHJpdGVGcmFtZSgpO1xyXG4gICAgLy8gdGV4dHVyZSDpnIDopoHlhYjorr7nva7vvIzlnKjlvJXmk47nmoTmjqXlj6Plrp7njrDph4zlkI7nu63nmoQgcmVjdOOAgW9yaWdpbmFsU2l6ZeOAgW9mZnNldCDkvJrmoLnmja4gdGV4dHVyZSDorqHnrpdcclxuICAgIHNwcml0ZUZyYW1lLnRleHR1cmUgPSB0ZXh0dXJlO1xyXG5cclxuICAgIHNwcml0ZUZyYW1lLnJlY3QgPSBuZXcgUmVjdChpdGVtLnRyaW0ueCwgaXRlbS50cmltLnksIGl0ZW0udHJpbS53aWR0aCwgaXRlbS50cmltLmhlaWdodCk7XHJcbiAgICBzcHJpdGVGcmFtZS5vcmlnaW5hbFNpemUgPSBuZXcgU2l6ZShpdGVtLnJhd1dpZHRoLCBpdGVtLnJhd0hlaWdodCk7XHJcbiAgICBzcHJpdGVGcmFtZS5vZmZzZXQgPSBvbGRTcHJpdGVGcmFtZS5vZmZzZXQ7XHJcbiAgICBzcHJpdGVGcmFtZS5uYW1lID0gaXRlbS5uYW1lO1xyXG4gICAgc3ByaXRlRnJhbWUucm90YXRlZCA9IGl0ZW0ucm90YXRlZDtcclxuXHJcbiAgICBzcHJpdGVGcmFtZS5pbnNldEJvdHRvbSA9IG9sZFNwcml0ZUZyYW1lLmluc2V0Qm90dG9tO1xyXG4gICAgc3ByaXRlRnJhbWUuaW5zZXRUb3AgPSBvbGRTcHJpdGVGcmFtZS5pbnNldFRvcDtcclxuICAgIHNwcml0ZUZyYW1lLmluc2V0UmlnaHQgPSBvbGRTcHJpdGVGcmFtZS5pbnNldFJpZ2h0O1xyXG4gICAgc3ByaXRlRnJhbWUuaW5zZXRMZWZ0ID0gb2xkU3ByaXRlRnJhbWUuaW5zZXRMZWZ0O1xyXG5cclxuICAgIHNwcml0ZUZyYW1lLl91dWlkID0gb2xkU3ByaXRlRnJhbWUudXVpZDtcclxuICAgIHJldHVybiBzcHJpdGVGcmFtZTtcclxufSJdfQ==