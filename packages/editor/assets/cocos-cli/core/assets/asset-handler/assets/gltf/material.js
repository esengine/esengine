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
exports.GltfMaterialHandler = void 0;
exports.dumpMaterial = dumpMaterial;
const asset_db_1 = require("@cocos/asset-db");
const cc = __importStar(require("cc"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const asset_finder_1 = require("./asset-finder");
const load_asset_sync_1 = require("../utils/load-asset-sync");
const reader_manager_1 = require("./reader-manager");
const utils_1 = require("../../utils");
const url_1 = require("url");
const asset_db_2 = __importDefault(require("../../../manager/asset-db"));
const fbx_1 = __importDefault(require("../fbx"));
const gltf_1 = __importDefault(require("../gltf"));
exports.GltfMaterialHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'gltf-material',
    // 引擎内对应的类型
    assetType: 'cc.Material',
    /**
     * 允许这种类型的资源进行实例化
     */
    instantiation: '.material',
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.14',
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
            // 如果之前的 fbx 有存在相同的 id 材质的编辑数据了，复用之前的数据
            if (asset.parent.meta?.userData?.materials) {
                const previousEditedData = asset.parent.meta.userData.materials[asset.uuid];
                if (previousEditedData) {
                    console.log(`importer: Reuse previously edited material data. ${asset.uuid}`);
                    const serializeJSON = JSON.stringify(previousEditedData);
                    await asset.saveToLibrary('.json', serializeJSON);
                    const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
                    asset.setData('depends', depends);
                    return true;
                }
            }
            let version = gltf_1.default.importer.version;
            if (asset.parent.meta.importer === 'fbx') {
                version = fbx_1.default.importer.version;
            }
            const gltfConverter = await reader_manager_1.glTfReaderManager.getOrCreate(asset.parent, version);
            const gltfUserData = asset.parent.userData;
            const material = createMaterial(asset.userData.gltfIndex, gltfConverter, new asset_finder_1.DefaultGltfAssetFinder(gltfUserData.assetFinder), gltfUserData);
            const serializeJSON = EditorExtends.serialize(material);
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            return true;
        },
    },
    createInfo: {
        async save(asset, content) {
            const materialUuid = asset.uuid;
            if (!content || Buffer.isBuffer(content)) {
                throw new Error(`${(0, utils_1.i18nTranslate)('assets.save_asset_meta.fail.content')}`);
            }
            if (!asset.parent) {
                return false;
            }
            const fbxMeta = asset.parent.meta;
            if (!fbxMeta.userData.materials || typeof fbxMeta.userData.materials !== 'object') {
                fbxMeta.userData.materials = {};
            }
            try {
                fbxMeta.userData.materials[materialUuid] = typeof content === 'string' ? JSON.parse(content) : content;
                (0, utils_1.mergeMeta)(asset.meta, fbxMeta);
                await asset.save();
            }
            catch (e) {
                console.error(`Save materials({asset(${materialUuid})} data to fbx {asset(${asset.parent.uuid})} failed!`);
                console.error(e);
                return false;
            }
            return true;
        },
    },
};
exports.default = exports.GltfMaterialHandler;
function createMaterial(index, gltfConverter, assetFinder, glTFUserData) {
    const material = gltfConverter.createMaterial(index, assetFinder, (effectName) => {
        const uuid = (0, asset_db_1.queryUUID)(effectName);
        return (0, load_asset_sync_1.loadAssetSync)(uuid, cc.EffectAsset);
    }, {
        useVertexColors: glTFUserData.useVertexColors,
        depthWriteInAlphaModeBlend: glTFUserData.depthWriteInAlphaModeBlend,
        smartMaterialEnabled: glTFUserData.fbx?.smartMaterialEnabled ?? false,
    });
    return material;
}
async function dumpMaterial(asset, assetFinder, gltfConverter, index, name) {
    const glTFUserData = asset.userData;
    let materialDumpDir = null;
    if (glTFUserData.materialDumpDir) {
        materialDumpDir = (0, asset_db_1.queryPath)(glTFUserData.materialDumpDir);
        if (!materialDumpDir) {
            console.warn('The specified dump directory of materials is not valid. ' + 'Default directory is used.');
        }
    }
    if (!materialDumpDir) {
        materialDumpDir = path_1.default.join(path_1.default.dirname(asset.source), `Materials_${asset.basename}`);
        // 生成默认值后，填入 userData，防止生成后，重新移动资源位置，导致 material 资源重新生成
        glTFUserData.materialDumpDir = await (0, asset_db_1.queryUrl)(materialDumpDir);
    }
    fs_extra_1.default.ensureDirSync(materialDumpDir);
    const destFileName = name;
    // 需要将 windows 上不支持的路径符号替换掉
    const destFilePath = path_1.default.join(materialDumpDir, destFileName.replace(/[\/:*?"<>|]/g, '-'));
    if (!fs_extra_1.default.existsSync(destFilePath)) {
        const material = createMaterial(index, gltfConverter, assetFinder, glTFUserData);
        // @ts-ignore
        const serialized = EditorExtends.serialize(material);
        fs_extra_1.default.writeFileSync(destFilePath, serialized);
    }
    // 不需要等待导入完成，这里只是想要获取到资源的 uuid
    (findAssetDB(glTFUserData.materialDumpDir) || asset._assetDB).refresh(destFilePath);
    const url = (0, asset_db_1.queryUrl)(destFilePath);
    if (url) {
        const uuid = (0, asset_db_1.queryUUID)(url);
        if (uuid && typeof uuid === 'string') {
            return uuid;
        }
    }
    asset.depend(destFilePath);
    return null;
}
function findAssetDB(url) {
    if (!url) {
        return null;
    }
    const uri = (0, url_1.parse)(url);
    if (!uri.host) {
        return null;
    }
    return asset_db_2.default.assetDBMap[uri.host];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvZ2x0Zi9tYXRlcmlhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtSUEsb0NBeUNDO0FBNUtELDhDQUFzRjtBQUN0Rix1Q0FBeUI7QUFDekIsd0RBQTBCO0FBQzFCLGdEQUF3QjtBQUd4QixpREFBd0Q7QUFDeEQsOERBQXlEO0FBQ3pELHFEQUFxRDtBQUVyRCx1Q0FBMEU7QUFDMUUsNkJBQTRCO0FBRTVCLHlFQUF1RDtBQUN2RCxpREFBZ0M7QUFDaEMsbURBQWtDO0FBRXJCLFFBQUEsbUJBQW1CLEdBQWlCO0lBQzdDLGdDQUFnQztJQUNoQyxJQUFJLEVBQUUsZUFBZTtJQUNyQixXQUFXO0lBQ1gsU0FBUyxFQUFFLGFBQWE7SUFFeEI7O09BRUc7SUFDSCxhQUFhLEVBQUUsV0FBVztJQUUxQixRQUFRLEVBQUU7UUFDTixtQkFBbUI7UUFDbkIsT0FBTyxFQUFFLFFBQVE7UUFDakI7Ozs7Ozs7V0FPRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBbUI7WUFDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDaEIsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztZQUVELHVDQUF1QztZQUN2QyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQztnQkFDekMsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUUsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO29CQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLG9EQUFvRCxL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O0lBQ3BGLE1BQU0sR0FBRyxHQUFHLElBQUEsbUJBQVEsRUFBQyxZQUFZLENBQUMsQ0FBQztJQUNuQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ04sTUFBTSxJQUFJLEdBQUcsSUFBQSxvQkFBUyxFQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLElBQUksSUFBSSxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ25DLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7SUFDTCxDQUFDO0lBQ0QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMzQixPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsR0FBWTtJQUM3QixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDUCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0QsTUFBTSxHQUFHLEdBQUcsSUFBQSxXQUFLLEVBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDRCxPQUFPLGtCQUFjLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXNzZXQsIHF1ZXJ5UGF0aCwgcXVlcnlVcmwsIHF1ZXJ5VVVJRCwgVmlydHVhbEFzc2V0IH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0ICogYXMgY2MgZnJvbSAnY2MnO1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgR2xURlVzZXJEYXRhIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3VzZXJEYXRhcyc7XHJcbmltcG9ydCB7IEdsdGZDb252ZXJ0ZXIsIElHbHRmQXNzZXRGaW5kZXIgfSBmcm9tICcuLi91dGlscy9nbHRmLWNvbnZlcnRlcic7XHJcbmltcG9ydCB7IERlZmF1bHRHbHRmQXNzZXRGaW5kZXIgfSBmcm9tICcuL2Fzc2V0LWZpbmRlcic7XHJcbmltcG9ydCB7IGxvYWRBc3NldFN5bmMgfSBmcm9tICcuLi91dGlscy9sb2FkLWFzc2V0LXN5bmMnO1xyXG5pbXBvcnQgeyBnbFRmUmVhZGVyTWFuYWdlciB9IGZyb20gJy4vcmVhZGVyLW1hbmFnZXInO1xyXG5cclxuaW1wb3J0IHsgZ2V0RGVwZW5kVVVJRExpc3QsIGkxOG5UcmFuc2xhdGUsIG1lcmdlTWV0YSB9IGZyb20gJy4uLy4uL3V0aWxzJztcclxuaW1wb3J0IHsgcGFyc2UgfSBmcm9tICd1cmwnO1xyXG5pbXBvcnQgeyBBc3NldEhhbmRsZXIgfSBmcm9tICcuLi8uLi8uLi9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IGFzc2V0REJNYW5hZ2VyIGZyb20gJy4uLy4uLy4uL21hbmFnZXIvYXNzZXQtZGInO1xyXG5pbXBvcnQgRmJ4SGFuZGxlciBmcm9tICcuLi9mYngnO1xyXG5pbXBvcnQgR2x0ZkhhbmRsZXIgZnJvbSAnLi4vZ2x0Zic7XHJcblxyXG5leHBvcnQgY29uc3QgR2x0Zk1hdGVyaWFsSGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICdnbHRmLW1hdGVyaWFsJyxcclxuICAgIC8vIOW8leaTjuWGheWvueW6lOeahOexu+Wei1xyXG4gICAgYXNzZXRUeXBlOiAnY2MuTWF0ZXJpYWwnLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5YWB6K646L+Z56eN57G75Z6L55qE6LWE5rqQ6L+b6KGM5a6e5L6L5YyWXHJcbiAgICAgKi9cclxuICAgIGluc3RhbnRpYXRpb246ICcubWF0ZXJpYWwnLFxyXG5cclxuICAgIGltcG9ydGVyOiB7XHJcbiAgICAgICAgLy8g54mI5pys5Y+35aaC5p6c5Y+Y5pu077yM5YiZ5Lya5by65Yi26YeN5paw5a+85YWlXHJcbiAgICAgICAgdmVyc2lvbjogJzEuMC4xNCcsXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5a6e6ZmF5a+85YWl5rWB56iLXHJcbiAgICAgICAgICog6ZyA6KaB6Ieq5bex5o6n5Yi25piv5ZCm55Sf5oiQ44CB5ou36LSd5paH5Lu2XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiDov5Tlm57mmK/lkKblr7zlhaXmiJDlip/nmoQgYm9vbGVhblxyXG4gICAgICAgICAqIOWmguaenOi/lOWbniBmYWxzZe+8jOWImeS4i+asoeWQr+WKqOi/mOS8mumHjeaWsOWvvOWFpVxyXG4gICAgICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFzeW5jIGltcG9ydChhc3NldDogVmlydHVhbEFzc2V0KSB7XHJcbiAgICAgICAgICAgIGlmICghYXNzZXQucGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIOWmguaenOS5i+WJjeeahCBmYngg5pyJ5a2Y5Zyo55u45ZCM55qEIGlkIOadkOi0qOeahOe8lui+keaVsOaNruS6hu+8jOWkjeeUqOS5i+WJjeeahOaVsOaNrlxyXG4gICAgICAgICAgICBpZiAoYXNzZXQucGFyZW50Lm1ldGE/LnVzZXJEYXRhPy5tYXRlcmlhbHMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzRWRpdGVkRGF0YSA9IGFzc2V0LnBhcmVudC5tZXRhLnVzZXJEYXRhLm1hdGVyaWFsc1thc3NldC51dWlkXTtcclxuICAgICAgICAgICAgICAgIGlmIChwcmV2aW91c0VkaXRlZERhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgaW1wb3J0ZXI6IFJldXNlIHByZXZpb3VzbHkgZWRpdGVkIG1hdGVyaWFsIGRhdGEuICR7YXNzZXQudXVpZH1gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplSlNPTiA9IEpTT04uc3RyaW5naWZ5KHByZXZpb3VzRWRpdGVkRGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgYXNzZXQuc2F2ZVRvTGlicmFyeSgnLmpzb24nLCBzZXJpYWxpemVKU09OKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVwZW5kcyA9IGdldERlcGVuZFVVSURMaXN0KHNlcmlhbGl6ZUpTT04pO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBkZXBlbmRzKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgdmVyc2lvbiA9IEdsdGZIYW5kbGVyLmltcG9ydGVyLnZlcnNpb247XHJcbiAgICAgICAgICAgIGlmIChhc3NldC5wYXJlbnQubWV0YS5pbXBvcnRlciA9PT0gJ2ZieCcpIHtcclxuICAgICAgICAgICAgICAgIHZlcnNpb24gPSBGYnhIYW5kbGVyLmltcG9ydGVyLnZlcnNpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZ2x0ZkNvbnZlcnRlciA9IGF3YWl0IGdsVGZSZWFkZXJNYW5hZ2VyLmdldE9yQ3JlYXRlKGFzc2V0LnBhcmVudCBhcyBBc3NldCwgdmVyc2lvbik7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBnbHRmVXNlckRhdGEgPSBhc3NldC5wYXJlbnQudXNlckRhdGEgYXMgR2xURlVzZXJEYXRhO1xyXG4gICAgICAgICAgICBjb25zdCBtYXRlcmlhbCA9IGNyZWF0ZU1hdGVyaWFsKFxyXG4gICAgICAgICAgICAgICAgYXNzZXQudXNlckRhdGEuZ2x0ZkluZGV4IGFzIG51bWJlcixcclxuICAgICAgICAgICAgICAgIGdsdGZDb252ZXJ0ZXIsXHJcbiAgICAgICAgICAgICAgICBuZXcgRGVmYXVsdEdsdGZBc3NldEZpbmRlcihnbHRmVXNlckRhdGEuYXNzZXRGaW5kZXIpLFxyXG4gICAgICAgICAgICAgICAgZ2x0ZlVzZXJEYXRhLFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplSlNPTiA9IEVkaXRvckV4dGVuZHMuc2VyaWFsaXplKG1hdGVyaWFsKTtcclxuICAgICAgICAgICAgYXdhaXQgYXNzZXQuc2F2ZVRvTGlicmFyeSgnLmpzb24nLCBzZXJpYWxpemVKU09OKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRlcGVuZHMgPSBnZXREZXBlbmRVVUlETGlzdChzZXJpYWxpemVKU09OKTtcclxuICAgICAgICAgICAgYXNzZXQuc2V0RGF0YSgnZGVwZW5kcycsIGRlcGVuZHMpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgY3JlYXRlSW5mbzoge1xyXG4gICAgICAgIGFzeW5jIHNhdmUoYXNzZXQsIGNvbnRlbnQpIHtcclxuICAgICAgICAgICAgY29uc3QgbWF0ZXJpYWxVdWlkID0gYXNzZXQudXVpZDtcclxuICAgICAgICAgICAgaWYgKCFjb250ZW50IHx8IEJ1ZmZlci5pc0J1ZmZlcihjb250ZW50KSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2kxOG5UcmFuc2xhdGUoJ2Fzc2V0cy5zYXZlX2Fzc2V0X21ldGEuZmFpbC5jb250ZW50Jyl9YCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghYXNzZXQucGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGZieE1ldGEgPSBhc3NldC5wYXJlbnQubWV0YTtcclxuICAgICAgICAgICAgaWYgKCFmYnhNZXRhLnVzZXJEYXRhLm1hdGVyaWFscyB8fCB0eXBlb2YgZmJ4TWV0YS51c2VyRGF0YS5tYXRlcmlhbHMgIT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICBmYnhNZXRhLnVzZXJEYXRhLm1hdGVyaWFscyA9IHt9O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZmJ4TWV0YS51c2VyRGF0YS5tYXRlcmlhbHNbbWF0ZXJpYWxVdWlkXSA9IHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoY29udGVudCkgOiBjb250ZW50O1xyXG4gICAgICAgICAgICAgICAgbWVyZ2VNZXRhKGFzc2V0Lm1ldGEsIGZieE1ldGEpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgYXNzZXQuc2F2ZSgpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBTYXZlIG1hdGVyaWFscyh7YXNzZXQoJHttYXRlcmlhbFV1aWR9KX0gZGF0YSB0byBmYngge2Fzc2V0KCR7YXNzZXQucGFyZW50LnV1aWR9KX0gZmFpbGVkIWApO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdsdGZNYXRlcmlhbEhhbmRsZXI7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVNYXRlcmlhbChpbmRleDogbnVtYmVyLCBnbHRmQ29udmVydGVyOiBHbHRmQ29udmVydGVyLCBhc3NldEZpbmRlcjogSUdsdGZBc3NldEZpbmRlciwgZ2xURlVzZXJEYXRhOiBHbFRGVXNlckRhdGEpIHtcclxuICAgIGNvbnN0IG1hdGVyaWFsID0gZ2x0ZkNvbnZlcnRlci5jcmVhdGVNYXRlcmlhbChcclxuICAgICAgICBpbmRleCxcclxuICAgICAgICBhc3NldEZpbmRlcixcclxuICAgICAgICAoZWZmZWN0TmFtZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB1dWlkID0gcXVlcnlVVUlEKGVmZmVjdE5hbWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gbG9hZEFzc2V0U3luYyh1dWlkLCBjYy5FZmZlY3RBc3NldCkhO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB1c2VWZXJ0ZXhDb2xvcnM6IGdsVEZVc2VyRGF0YS51c2VWZXJ0ZXhDb2xvcnMsXHJcbiAgICAgICAgICAgIGRlcHRoV3JpdGVJbkFscGhhTW9kZUJsZW5kOiBnbFRGVXNlckRhdGEuZGVwdGhXcml0ZUluQWxwaGFNb2RlQmxlbmQsXHJcbiAgICAgICAgICAgIHNtYXJ0TWF0ZXJpYWxFbmFibGVkOiBnbFRGVXNlckRhdGEuZmJ4Py5zbWFydE1hdGVyaWFsRW5hYmxlZCA/PyBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgKTtcclxuICAgIHJldHVybiBtYXRlcmlhbDtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGR1bXBNYXRlcmlhbChcclxuICAgIGFzc2V0OiBBc3NldCxcclxuICAgIGFzc2V0RmluZGVyOiBEZWZhdWx0R2x0ZkFzc2V0RmluZGVyLFxyXG4gICAgZ2x0ZkNvbnZlcnRlcjogR2x0ZkNvbnZlcnRlcixcclxuICAgIGluZGV4OiBudW1iZXIsXHJcbiAgICBuYW1lOiBzdHJpbmcsXHJcbikge1xyXG4gICAgY29uc3QgZ2xURlVzZXJEYXRhID0gYXNzZXQudXNlckRhdGEgYXMgR2xURlVzZXJEYXRhO1xyXG4gICAgbGV0IG1hdGVyaWFsRHVtcERpcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBpZiAoZ2xURlVzZXJEYXRhLm1hdGVyaWFsRHVtcERpcikge1xyXG4gICAgICAgIG1hdGVyaWFsRHVtcERpciA9IHF1ZXJ5UGF0aChnbFRGVXNlckRhdGEubWF0ZXJpYWxEdW1wRGlyKTtcclxuICAgICAgICBpZiAoIW1hdGVyaWFsRHVtcERpcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1RoZSBzcGVjaWZpZWQgZHVtcCBkaXJlY3Rvcnkgb2YgbWF0ZXJpYWxzIGlzIG5vdCB2YWxpZC4gJyArICdEZWZhdWx0IGRpcmVjdG9yeSBpcyB1c2VkLicpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICghbWF0ZXJpYWxEdW1wRGlyKSB7XHJcbiAgICAgICAgbWF0ZXJpYWxEdW1wRGlyID0gcGF0aC5qb2luKHBhdGguZGlybmFtZShhc3NldC5zb3VyY2UpLCBgTWF0ZXJpYWxzXyR7YXNzZXQuYmFzZW5hbWV9YCk7XHJcbiAgICAgICAgLy8g55Sf5oiQ6buY6K6k5YC85ZCO77yM5aGr5YWlIHVzZXJEYXRh77yM6Ziy5q2i55Sf5oiQ5ZCO77yM6YeN5paw56e75Yqo6LWE5rqQ5L2N572u77yM5a+86Ie0IG1hdGVyaWFsIOi1hOa6kOmHjeaWsOeUn+aIkFxyXG4gICAgICAgIGdsVEZVc2VyRGF0YS5tYXRlcmlhbER1bXBEaXIgPSBhd2FpdCBxdWVyeVVybChtYXRlcmlhbER1bXBEaXIpO1xyXG4gICAgfVxyXG4gICAgZnMuZW5zdXJlRGlyU3luYyhtYXRlcmlhbER1bXBEaXIpO1xyXG4gICAgY29uc3QgZGVzdEZpbGVOYW1lID0gbmFtZTtcclxuICAgIC8vIOmcgOimgeWwhiB3aW5kb3dzIOS4iuS4jeaUr+aMgeeahOi3r+W+hOespuWPt+abv+aNouaOiVxyXG4gICAgY29uc3QgZGVzdEZpbGVQYXRoID0gcGF0aC5qb2luKG1hdGVyaWFsRHVtcERpciwgZGVzdEZpbGVOYW1lLnJlcGxhY2UoL1tcXC86Kj9cIjw+fF0vZywgJy0nKSk7XHJcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGVzdEZpbGVQYXRoKSkge1xyXG4gICAgICAgIGNvbnN0IG1hdGVyaWFsID0gY3JlYXRlTWF0ZXJpYWwoaW5kZXgsIGdsdGZDb252ZXJ0ZXIsIGFzc2V0RmluZGVyLCBnbFRGVXNlckRhdGEpO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBjb25zdCBzZXJpYWxpemVkID0gRWRpdG9yRXh0ZW5kcy5zZXJpYWxpemUobWF0ZXJpYWwpO1xyXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGVzdEZpbGVQYXRoLCBzZXJpYWxpemVkKTtcclxuICAgIH1cclxuICAgIC8vIOS4jemcgOimgeetieW+heWvvOWFpeWujOaIkO+8jOi/memHjOWPquaYr+aDs+imgeiOt+WPluWIsOi1hOa6kOeahCB1dWlkXHJcbiAgICAoZmluZEFzc2V0REIoZ2xURlVzZXJEYXRhLm1hdGVyaWFsRHVtcERpcikgfHwgYXNzZXQuX2Fzc2V0REIpLnJlZnJlc2goZGVzdEZpbGVQYXRoKTtcclxuICAgIGNvbnN0IHVybCA9IHF1ZXJ5VXJsKGRlc3RGaWxlUGF0aCk7XHJcbiAgICBpZiAodXJsKSB7XHJcbiAgICAgICAgY29uc3QgdXVpZCA9IHF1ZXJ5VVVJRCh1cmwpO1xyXG4gICAgICAgIGlmICh1dWlkICYmIHR5cGVvZiB1dWlkID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdXVpZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhc3NldC5kZXBlbmQoZGVzdEZpbGVQYXRoKTtcclxuICAgIHJldHVybiBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmaW5kQXNzZXREQih1cmw/OiBzdHJpbmcpIHtcclxuICAgIGlmICghdXJsKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBjb25zdCB1cmkgPSBwYXJzZSh1cmwpO1xyXG4gICAgaWYgKCF1cmkuaG9zdCkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFzc2V0REJNYW5hZ2VyLmFzc2V0REJNYXBbdXJpLmhvc3RdO1xyXG59XHJcbiJdfQ==