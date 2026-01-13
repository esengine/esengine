"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const texture_base_1 = require("./texture-base");
const utils_1 = require("../utils");
const defaultAutoAtlasUserData = {
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
    textureSetting: (0, texture_base_1.makeDefaultTextureBaseAssetUserData)(),
};
const AutoAtlasHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'auto-atlas',
    // pac 文件实际上在编辑器下没用到，只有构建时会用。因此这里把类型设置为 cc.SpriteAtlas，方便构建时当成图集来处理。
    assetType: 'cc.SpriteAtlas',
    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: 'i18n:ENGINE.assets.newPac',
                    fullFileName: 'auto-atlas.pac',
                    template: `db://internal/default_file_content/${AutoAtlasHandler.name}/default.pac`,
                    name: 'default',
                },
            ];
        },
    },
    importer: {
        version: '1.0.8',
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
            const userData = asset.userData;
            // @ts-ignore
            Object.keys(defaultAutoAtlasUserData).forEach((key) => {
                if (!(key in userData)) {
                    // @ts-ignore
                    userData[key] = defaultAutoAtlasUserData[key];
                }
            });
            // @ts-ignore
            const autoAtlas = new cc.SpriteAtlas();
            autoAtlas.name = asset.basename || '';
            const serializeJSON = EditorExtends.serialize(autoAtlas);
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            return true;
        },
    },
};
exports.default = AutoAtlasHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1hdGxhcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy9hdXRvLWF0bGFzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsaURBQXFFO0FBRXJFLG9DQUE2QztBQUk3QyxNQUFNLHdCQUF3QixHQUFHO0lBQzdCLFFBQVEsRUFBRSxJQUFJO0lBQ2QsU0FBUyxFQUFFLElBQUk7SUFFZixvQkFBb0I7SUFDcEIsT0FBTyxFQUFFLENBQUM7SUFFVixhQUFhLEVBQUUsSUFBSTtJQUNuQixZQUFZLEVBQUUsS0FBSztJQUNuQixVQUFVLEVBQUUsS0FBSztJQUNqQixTQUFTLEVBQUUsVUFBVTtJQUNyQixNQUFNLEVBQUUsS0FBSztJQUNiLE9BQU8sRUFBRSxFQUFFO0lBQ1gsWUFBWSxFQUFFLElBQUk7SUFDbEIsWUFBWSxFQUFFLElBQUk7SUFDbEIsWUFBWSxFQUFFLElBQUk7SUFDbEIscUJBQXFCLEVBQUUsSUFBSTtJQUMzQixtQkFBbUIsRUFBRSxJQUFJO0lBQ3pCLHlCQUF5QixFQUFFLElBQUk7SUFDL0IsZ0JBQWdCLEVBQUUsRUFBRTtJQUNwQixjQUFjLEVBQUUsSUFBQSxrREFBbUMsR0FBRTtDQUN4RCxDQUFDO0FBRUYsTUFBTSxnQkFBZ0IsR0FBaUI7SUFDbkMsZ0NBQWdDO0lBQ2hDLElBQUksRUFBRSxZQUFZO0lBRWxCLG9FQUFvRTtJQUNwRSxTQUFTLEVBQUUsZ0JBQWdCO0lBQzNCLFVBQVUsRUFBRTtRQUNSLGdCQUFnQjtZQUNaLE9BQU87Z0JBQ0g7b0JBQ0ksS0FBSyxFQUFFLDJCQUEyQjtvQkFDbEMsWUFBWSxFQUFFLGdCQUFnQjtvQkFDOUIsUUFBUSxFQUFFLHNDQUFzQyxnQkFBZ0IsQ0FBQyxJQUFJLGNBQWM7b0JBQ25GLElBQUksRUFBRSxTQUFTO2lCQUNsQjthQUNKLENBQUM7UUFDTixDQUFDO0tBQ0o7SUFFRCxRQUFRLEVBQUU7UUFDTixPQUFPLEVBQUUsT0FBTztRQUVoQjs7Ozs7Ozs7V0FRRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBWTtZQUNyQixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBa0MsQ0FBQztZQUMxRCxhQUFhO1lBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQVcsRUFBRSxFQUFFO2dCQUMxRCxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLEVBQUUsQ0FBQztvQkFDckIsYUFBYTtvQkFDYixRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2xELENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUNILGFBQWE7WUFDYixNQUFNLFNBQVMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxTQUFTLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO1lBRXRDLE1BQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekQsTUFBTSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUVsRCxNQUFNLE9BQU8sR0FBRyxJQUFBLHlCQUFpQixFQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2pELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRWxDLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FDSjtDQUNKLENBQUM7QUFFRixrQkFBZSxnQkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0IH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0IHsgbWFrZURlZmF1bHRUZXh0dXJlQmFzZUFzc2V0VXNlckRhdGEgfSBmcm9tICcuL3RleHR1cmUtYmFzZSc7XHJcblxyXG5pbXBvcnQgeyBnZXREZXBlbmRVVUlETGlzdCB9IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IEF1dG9BdGxhc0Fzc2V0VXNlckRhdGEgfSBmcm9tICcuLi8uLi9AdHlwZXMvdXNlckRhdGFzJztcclxuXHJcbmNvbnN0IGRlZmF1bHRBdXRvQXRsYXNVc2VyRGF0YSA9IHtcclxuICAgIG1heFdpZHRoOiAxMDI0LFxyXG4gICAgbWF4SGVpZ2h0OiAxMDI0LFxyXG5cclxuICAgIC8vIHBhZGRpbmcgb2YgaW1hZ2UuXHJcbiAgICBwYWRkaW5nOiAyLFxyXG5cclxuICAgIGFsbG93Um90YXRpb246IHRydWUsXHJcbiAgICBmb3JjZVNxdWFyZWQ6IGZhbHNlLFxyXG4gICAgcG93ZXJPZlR3bzogZmFsc2UsXHJcbiAgICBhbGdvcml0aG06ICdNYXhSZWN0cycsXHJcbiAgICBmb3JtYXQ6ICdwbmcnLFxyXG4gICAgcXVhbGl0eTogODAsXHJcbiAgICBjb250b3VyQmxlZWQ6IHRydWUsXHJcbiAgICBwYWRkaW5nQmxlZWQ6IHRydWUsXHJcbiAgICBmaWx0ZXJVbnVzZWQ6IHRydWUsXHJcbiAgICByZW1vdmVUZXh0dXJlSW5CdW5kbGU6IHRydWUsXHJcbiAgICByZW1vdmVJbWFnZUluQnVuZGxlOiB0cnVlLFxyXG4gICAgcmVtb3ZlU3ByaXRlQXRsYXNJbkJ1bmRsZTogdHJ1ZSxcclxuICAgIGNvbXByZXNzU2V0dGluZ3M6IHt9LFxyXG4gICAgdGV4dHVyZVNldHRpbmc6IG1ha2VEZWZhdWx0VGV4dHVyZUJhc2VBc3NldFVzZXJEYXRhKCksXHJcbn07XHJcblxyXG5jb25zdCBBdXRvQXRsYXNIYW5kbGVyOiBBc3NldEhhbmRsZXIgPSB7XHJcbiAgICAvLyBIYW5kbGVyIOeahOWQjeWtl++8jOeUqOS6juaMh+WumiBIYW5kbGVyIGFzIOetiVxyXG4gICAgbmFtZTogJ2F1dG8tYXRsYXMnLFxyXG5cclxuICAgIC8vIHBhYyDmlofku7blrp7pmYXkuIrlnKjnvJbovpHlmajkuIvmsqHnlKjliLDvvIzlj6rmnInmnoTlu7rml7bkvJrnlKjjgILlm6DmraTov5nph4zmiornsbvlnovorr7nva7kuLogY2MuU3ByaXRlQXRsYXPvvIzmlrnkvr/mnoTlu7rml7blvZPmiJDlm77pm4bmnaXlpITnkIbjgIJcclxuICAgIGFzc2V0VHlwZTogJ2NjLlNwcml0ZUF0bGFzJyxcclxuICAgIGNyZWF0ZUluZm86IHtcclxuICAgICAgICBnZW5lcmF0ZU1lbnVJbmZvKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpFTkdJTkUuYXNzZXRzLm5ld1BhYycsXHJcbiAgICAgICAgICAgICAgICAgICAgZnVsbEZpbGVOYW1lOiAnYXV0by1hdGxhcy5wYWMnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBgZGI6Ly9pbnRlcm5hbC9kZWZhdWx0X2ZpbGVfY29udGVudC8ke0F1dG9BdGxhc0hhbmRsZXIubmFtZX0vZGVmYXVsdC5wYWNgLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdkZWZhdWx0JyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjgnLFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlrp7pmYXlr7zlhaXmtYHnqItcclxuICAgICAgICAgKiDpnIDopoHoh6rlt7HmjqfliLbmmK/lkKbnlJ/miJDjgIHmi7fotJ3mlofku7ZcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIOi/lOWbnuaYr+WQpuWvvOWFpeaIkOWKn+eahOagh+iusFxyXG4gICAgICAgICAqIOWmguaenOi/lOWbniBmYWxzZe+8jOWImSBpbXBvcnRlZCDmoIforrDkuI3kvJrlj5jmiJAgdHJ1ZVxyXG4gICAgICAgICAqIOWQjue7reeahOS4gOezu+WIl+aTjeS9nOmDveS4jeS8muaJp+ihjFxyXG4gICAgICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFzeW5jIGltcG9ydChhc3NldDogQXNzZXQpIHtcclxuICAgICAgICAgICAgY29uc3QgdXNlckRhdGEgPSBhc3NldC51c2VyRGF0YSBhcyBBdXRvQXRsYXNBc3NldFVzZXJEYXRhO1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGRlZmF1bHRBdXRvQXRsYXNVc2VyRGF0YSkuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghKGtleSBpbiB1c2VyRGF0YSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGFba2V5XSA9IGRlZmF1bHRBdXRvQXRsYXNVc2VyRGF0YVtrZXldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBjb25zdCBhdXRvQXRsYXMgPSBuZXcgY2MuU3ByaXRlQXRsYXMoKTtcclxuICAgICAgICAgICAgYXV0b0F0bGFzLm5hbWUgPSBhc3NldC5iYXNlbmFtZSB8fCAnJztcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZUpTT04gPSBFZGl0b3JFeHRlbmRzLnNlcmlhbGl6ZShhdXRvQXRsYXMpO1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldC5zYXZlVG9MaWJyYXJ5KCcuanNvbicsIHNlcmlhbGl6ZUpTT04pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZGVwZW5kcyA9IGdldERlcGVuZFVVSURMaXN0KHNlcmlhbGl6ZUpTT04pO1xyXG4gICAgICAgICAgICBhc3NldC5zZXREYXRhKCdkZXBlbmRzJywgZGVwZW5kcyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEF1dG9BdGxhc0hhbmRsZXI7XHJcbiJdfQ==