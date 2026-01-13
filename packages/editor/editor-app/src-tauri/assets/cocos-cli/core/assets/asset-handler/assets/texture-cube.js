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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextureCubeHandler = void 0;
exports.makeDefaultTextureCubeAssetUserData = makeDefaultTextureCubeAssetUserData;
const asset_db_1 = require("@cocos/asset-db");
const cc = __importStar(require("cc"));
const utils_1 = require("../utils");
const texture_base_1 = require("./texture-base");
const load_asset_sync_1 = require("./utils/load-asset-sync");
function makeDefaultTextureCubeAssetUserData() {
    const userData = (0, texture_base_1.makeDefaultTextureBaseAssetUserData)();
    userData.isRGBE = false;
    return userData;
}
exports.TextureCubeHandler = {
    name: 'texture-cube',
    assetType: 'cc.TextureCube',
    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: 'i18n:ENGINE.assets.newCubeMap',
                    fullFileName: 'cubemap.cubemap',
                    content: '',
                    name: 'default',
                },
            ];
        },
    },
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.4',
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
                asset.assignUserData(makeDefaultTextureCubeAssetUserData(), true);
                asset.userData.isRGBE = false;
            }
            const userData = asset.userData;
            const faceNames = ['front', 'back', 'left', 'right', 'top', 'bottom'];
            const faceAssets = {};
            for (const faceName of faceNames) {
                let faceImageUUID = userData[faceName];
                if (!faceImageUUID) {
                    const defaultFaceUrl = `db://internal/default_cubemap/${faceName}.jpg`;
                    const uuid = (0, asset_db_1.queryUUID)(defaultFaceUrl);
                    if (uuid) {
                        faceImageUUID = uuid;
                    }
                    else {
                        throw new Error(`[[internal-error]] Default face url ${defaultFaceUrl} doesn't exists.`);
                    }
                }
                const face = (0, load_asset_sync_1.loadAssetSync)(faceImageUUID, cc.ImageAsset);
                if (!face) {
                    throw new Error(`Failed to load ${faceName} face of ${asset.uuid}.`);
                }
                faceAssets[faceName] = face;
            }
            const texture = new cc.TextureCube();
            (0, texture_base_1.applyTextureBaseAssetUserData)(userData, texture);
            if (asset.parent instanceof asset_db_1.Asset) {
                texture.name = asset.parent.basename || '';
            }
            texture.isRGBE = userData.isRGBE;
            texture._mipmaps = [faceAssets];
            const serializeJSON = EditorExtends.serialize(texture);
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            return true;
        },
    },
};
exports.default = exports.TextureCubeHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dHVyZS1jdWJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvYXNzZXRzL3RleHR1cmUtY3ViZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxrRkFJQztBQWZELDhDQUFpRTtBQUNqRSx1Q0FBeUI7QUFJekIsb0NBQTZDO0FBQzdDLGlEQUFvRztBQUNwRyw2REFBd0Q7QUFJeEQsU0FBZ0IsbUNBQW1DO0lBQy9DLE1BQU0sUUFBUSxHQUFHLElBQUEsa0RBQW1DLEdBQUUsQ0FBQztJQUN0RCxRQUFnRCxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDakUsT0FBTyxRQUErQyxDQUFDO0FBQzNELENBQUM7QUFFWSxRQUFBLGtCQUFrQixHQUFpQjtJQUM1QyxJQUFJLEVBQUUsY0FBYztJQUVwQixTQUFTLEVBQUUsZ0JBQWdCO0lBRTNCLFVBQVUsRUFBRTtRQUNSLGdCQUFnQjtZQUNaLE9BQU87Z0JBQ0g7b0JBQ0ksS0FBSyxFQUFFLCtCQUErQjtvQkFDdEMsWUFBWSxFQUFFLGlCQUFpQjtvQkFDL0IsT0FBTyxFQUFFLEVBQUU7b0JBQ1gsSUFBSSxFQUFFLFNBQVM7aUJBQ2xCO2FBQ0osQ0FBQztRQUNOLENBQUM7S0FDSjtJQUNELFFBQVEsRUFBRTtRQUNOLG1CQUFtQjtRQUNuQixPQUFPLEVBQUUsT0FBTztRQUVoQjs7Ozs7Ozs7V0FRRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBbUI7WUFDNUIsSUFBSSxNQUFNLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDMUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxtQ0FBbUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNsRSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDbEMsQ0FBQztZQUVELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFvQyxDQUFDO1lBRTVELE1BQU0sU0FBUyxHQUFlLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztZQUVsRixNQUFNLFVBQVUsR0FBRyxFQUFxQyxDQUFDO1lBQ3pELEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFLENBQUM7Z0JBQy9CLElBQUksYUFBYSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUNqQixNQUFNLGNBQWMsR0FBRyxpQ0FBaUMsUUFBUSxNQUFNLENBQUM7b0JBQ3ZFLE1BQU0sSUFBSSxHQUFHLElBQUEsb0JBQVMsRUFBQyxjQUFjLENBQUMsQ0FBQztvQkFDdkMsSUFBSSxJQUFJLEVBQUUsQ0FBQzt3QkFDUCxhQUFhLEdBQUcsSUFBSSxDQUFDO29CQUN6QixDQUFDO3lCQUFNLENBQUM7d0JBQ0osTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsY0FBYyxrQkFBa0IsQ0FBQyxDQUFDO29CQUM3RixDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsTUFBTSxJQUFJLEdBQUcsSUFBQSwrQkFBYSxFQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDUixNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixRQUFRLFlBQVksS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7Z0JBQ3pFLENBQUM7Z0JBQ0QsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNoQyxDQUFDO1lBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDckMsSUFBQSw0Q0FBNkIsRUFBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDakQsSUFBSSxLQUFLLENBQUMsTUFBTSxZQUFZLGdCQUFLLEVBQUUsQ0FBQztnQkFDaEMsT0FBTyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7WUFDL0MsQ0FBQztZQUNELE9BQU8sQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUNqQyxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFaEMsTUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RCxNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBRWxELE1BQU0sT0FBTyxHQUFHLElBQUEseUJBQWlCLEVBQUMsYUFBYSxDQUFDLENBQUM7WUFDakQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFbEMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztLQUNKO0NBQ0osQ0FBQztBQUVGLGtCQUFlLDBCQUFrQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlydHVhbEFzc2V0LCBBc3NldCwgcXVlcnlVVUlEIH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0ICogYXMgY2MgZnJvbSAnY2MnO1xyXG5cclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IFRleHR1cmVDdWJlQXNzZXRVc2VyRGF0YSB9IGZyb20gJy4uLy4uL0B0eXBlcy91c2VyRGF0YXMnO1xyXG5pbXBvcnQgeyBnZXREZXBlbmRVVUlETGlzdCB9IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IHsgbWFrZURlZmF1bHRUZXh0dXJlQmFzZUFzc2V0VXNlckRhdGEsIGFwcGx5VGV4dHVyZUJhc2VBc3NldFVzZXJEYXRhIH0gZnJvbSAnLi90ZXh0dXJlLWJhc2UnO1xyXG5pbXBvcnQgeyBsb2FkQXNzZXRTeW5jIH0gZnJvbSAnLi91dGlscy9sb2FkLWFzc2V0LXN5bmMnO1xyXG5cclxudHlwZSBGYWNlTmFtZSA9ICdmcm9udCcgfCAnYmFjaycgfCAnbGVmdCcgfCAncmlnaHQnIHwgJ3RvcCcgfCAnYm90dG9tJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtYWtlRGVmYXVsdFRleHR1cmVDdWJlQXNzZXRVc2VyRGF0YSgpOiBUZXh0dXJlQ3ViZUFzc2V0VXNlckRhdGEge1xyXG4gICAgY29uc3QgdXNlckRhdGEgPSBtYWtlRGVmYXVsdFRleHR1cmVCYXNlQXNzZXRVc2VyRGF0YSgpO1xyXG4gICAgKHVzZXJEYXRhIGFzIHVua25vd24gYXMgVGV4dHVyZUN1YmVBc3NldFVzZXJEYXRhKS5pc1JHQkUgPSBmYWxzZTtcclxuICAgIHJldHVybiB1c2VyRGF0YSBhcyB1bmtub3duIGFzIFRleHR1cmVDdWJlQXNzZXRVc2VyRGF0YTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFRleHR1cmVDdWJlSGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgbmFtZTogJ3RleHR1cmUtY3ViZScsXHJcblxyXG4gICAgYXNzZXRUeXBlOiAnY2MuVGV4dHVyZUN1YmUnLFxyXG5cclxuICAgIGNyZWF0ZUluZm86IHtcclxuICAgICAgICBnZW5lcmF0ZU1lbnVJbmZvKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpFTkdJTkUuYXNzZXRzLm5ld0N1YmVNYXAnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxGaWxlTmFtZTogJ2N1YmVtYXAuY3ViZW1hcCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2RlZmF1bHQnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIGltcG9ydGVyOiB7XHJcbiAgICAgICAgLy8g54mI5pys5Y+35aaC5p6c5Y+Y5pu077yM5YiZ5Lya5by65Yi26YeN5paw5a+85YWlXHJcbiAgICAgICAgdmVyc2lvbjogJzEuMC40JyxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5a6e6ZmF5a+85YWl5rWB56iLXHJcbiAgICAgICAgICog6ZyA6KaB6Ieq5bex5o6n5Yi25piv5ZCm55Sf5oiQ44CB5ou36LSd5paH5Lu2XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiDov5Tlm57mmK/lkKblr7zlhaXmiJDlip/nmoTmoIforrBcclxuICAgICAgICAgKiDlpoLmnpzov5Tlm54gZmFsc2XvvIzliJkgaW1wb3J0ZWQg5qCH6K6w5LiN5Lya5Y+Y5oiQIHRydWVcclxuICAgICAgICAgKiDlkI7nu63nmoTkuIDns7vliJfmk43kvZzpg73kuI3kvJrmiafooYxcclxuICAgICAgICAgKiBAcGFyYW0gYXNzZXRcclxuICAgICAgICAgKi9cclxuICAgICAgICBhc3luYyBpbXBvcnQoYXNzZXQ6IFZpcnR1YWxBc3NldCkge1xyXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYXNzZXQudXNlckRhdGEpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgYXNzZXQuYXNzaWduVXNlckRhdGEobWFrZURlZmF1bHRUZXh0dXJlQ3ViZUFzc2V0VXNlckRhdGEoKSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBhc3NldC51c2VyRGF0YS5pc1JHQkUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgdXNlckRhdGEgPSBhc3NldC51c2VyRGF0YSBhcyBUZXh0dXJlQ3ViZUFzc2V0VXNlckRhdGE7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBmYWNlTmFtZXM6IEZhY2VOYW1lW10gPSBbJ2Zyb250JywgJ2JhY2snLCAnbGVmdCcsICdyaWdodCcsICd0b3AnLCAnYm90dG9tJ107XHJcblxyXG4gICAgICAgICAgICBjb25zdCBmYWNlQXNzZXRzID0ge30gYXMgUmVjb3JkPEZhY2VOYW1lLCBjYy5JbWFnZUFzc2V0PjtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBmYWNlTmFtZSBvZiBmYWNlTmFtZXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBmYWNlSW1hZ2VVVUlEID0gdXNlckRhdGFbZmFjZU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFmYWNlSW1hZ2VVVUlEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdEZhY2VVcmwgPSBgZGI6Ly9pbnRlcm5hbC9kZWZhdWx0X2N1YmVtYXAvJHtmYWNlTmFtZX0uanBnYDtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1dWlkID0gcXVlcnlVVUlEKGRlZmF1bHRGYWNlVXJsKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodXVpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWNlSW1hZ2VVVUlEID0gdXVpZDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFtbaW50ZXJuYWwtZXJyb3JdXSBEZWZhdWx0IGZhY2UgdXJsICR7ZGVmYXVsdEZhY2VVcmx9IGRvZXNuJ3QgZXhpc3RzLmApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGZhY2UgPSBsb2FkQXNzZXRTeW5jKGZhY2VJbWFnZVVVSUQsIGNjLkltYWdlQXNzZXQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFmYWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gbG9hZCAke2ZhY2VOYW1lfSBmYWNlIG9mICR7YXNzZXQudXVpZH0uYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmYWNlQXNzZXRzW2ZhY2VOYW1lXSA9IGZhY2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmUgPSBuZXcgY2MuVGV4dHVyZUN1YmUoKTtcclxuICAgICAgICAgICAgYXBwbHlUZXh0dXJlQmFzZUFzc2V0VXNlckRhdGEodXNlckRhdGEsIHRleHR1cmUpO1xyXG4gICAgICAgICAgICBpZiAoYXNzZXQucGFyZW50IGluc3RhbmNlb2YgQXNzZXQpIHtcclxuICAgICAgICAgICAgICAgIHRleHR1cmUubmFtZSA9IGFzc2V0LnBhcmVudC5iYXNlbmFtZSB8fCAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0ZXh0dXJlLmlzUkdCRSA9IHVzZXJEYXRhLmlzUkdCRTtcclxuICAgICAgICAgICAgdGV4dHVyZS5fbWlwbWFwcyA9IFtmYWNlQXNzZXRzXTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZUpTT04gPSBFZGl0b3JFeHRlbmRzLnNlcmlhbGl6ZSh0ZXh0dXJlKTtcclxuICAgICAgICAgICAgYXdhaXQgYXNzZXQuc2F2ZVRvTGlicmFyeSgnLmpzb24nLCBzZXJpYWxpemVKU09OKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRlcGVuZHMgPSBnZXREZXBlbmRVVUlETGlzdChzZXJpYWxpemVKU09OKTtcclxuICAgICAgICAgICAgYXNzZXQuc2V0RGF0YSgnZGVwZW5kcycsIGRlcGVuZHMpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUZXh0dXJlQ3ViZUhhbmRsZXI7XHJcbiJdfQ==