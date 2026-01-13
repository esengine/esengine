"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderTextureHandler = void 0;
const fs_extra_1 = require("fs-extra");
const texture_base_1 = require("../texture-base");
const utils_1 = require("../../utils");
function fillUserdata(asset, name, value) {
    if (!(name in asset.userData)) {
        asset.userData[name] = value;
    }
}
exports.RenderTextureHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'render-texture',
    // 引擎内对应的类型
    assetType: 'cc.RenderTexture',
    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: 'i18n:ENGINE.assets.newRenderTexture',
                    fullFileName: 'render-texture.rt',
                    template: `db://internal/default_file_content/${exports.RenderTextureHandler.name}/default.rt`,
                    name: 'default',
                },
            ];
        },
    },
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.2.1',
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
            const json = await (0, fs_extra_1.readJSON)(asset.source);
            // @ts-ignore
            const renderTexture = cc.deserialize(json);
            renderTexture.name = asset.basename || '';
            fillUserdata(asset, 'width', renderTexture.width);
            fillUserdata(asset, 'height', renderTexture.height);
            // @ts-ignore renderTexture._anisotropy
            fillUserdata(asset, 'anisotropy', renderTexture._anisotropy);
            // @ts-ignore renderTexture._minFilter
            fillUserdata(asset, 'minfilter', (0, texture_base_1.getFilterString)(renderTexture._minFilter));
            // @ts-ignore renderTexture._magfilter
            fillUserdata(asset, 'magfilter', (0, texture_base_1.getFilterString)(renderTexture._magFilter));
            // @ts-ignore renderTexture._mipfilter
            fillUserdata(asset, 'mipfilter', (0, texture_base_1.getFilterString)(renderTexture._mipFilter));
            // @ts-ignore renderTexture._wrapS
            fillUserdata(asset, 'wrapModeS', (0, texture_base_1.getWrapModeString)(renderTexture._wrapS));
            // @ts-ignore renderTexture._wrapT
            fillUserdata(asset, 'wrapModeT', (0, texture_base_1.getWrapModeString)(renderTexture._wrapT));
            const userData = asset.userData;
            renderTexture.resize(userData.width, userData.height);
            (0, texture_base_1.applyTextureBaseAssetUserData)(userData, renderTexture);
            const serializeJSON = EditorExtends.serialize(renderTexture);
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            const textureSpriteFrameSubAsset = await asset.createSubAsset('spriteFrame', 'rt-sprite-frame', {
                displayName: asset.basename,
            });
            textureSpriteFrameSubAsset.userData.imageUuidOrDatabaseUri = asset.uuid;
            textureSpriteFrameSubAsset.userData.width = asset.userData.width;
            textureSpriteFrameSubAsset.userData.height = asset.userData.height;
            return true;
        },
    },
};
exports.default = exports.RenderTextureHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvcmVuZGVyLXRleHR1cmUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsdUNBQW9DO0FBQ3BDLGtEQUFvRztBQUdwRyx1Q0FBZ0Q7QUFJaEQsU0FBUyxZQUFZLENBQUMsS0FBWSxFQUFFLElBQVksRUFBRSxLQUFVO0lBQ3hELElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUM1QixLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUNqQyxDQUFDO0FBQ0wsQ0FBQztBQUVZLFFBQUEsb0JBQW9CLEdBQWlCO0lBQzlDLGdDQUFnQztJQUNoQyxJQUFJLEVBQUUsZ0JBQWdCO0lBRXRCLFdBQVc7SUFDWCxTQUFTLEVBQUUsa0JBQWtCO0lBRTdCLFVBQVUsRUFBRTtRQUNSLGdCQUFnQjtZQUNaLE9BQU87Z0JBQ0g7b0JBQ0ksS0FBSyxFQUFFLHFDQUFxQztvQkFDNUMsWUFBWSxFQUFFLG1CQUFtQjtvQkFDakMsUUFBUSxFQUFFLHNDQUFzQyw0QkFBb0IsQ0FBQyxJQUFJLGFBQWE7b0JBQ3RGLElBQUksRUFBRSxTQUFTO2lCQUNsQjthQUNKLENBQUM7UUFDTixDQUFDO0tBQ0o7SUFFRCxRQUFRLEVBQUU7UUFDTixtQkFBbUI7UUFDbkIsT0FBTyxFQUFFLE9BQU87UUFFaEI7Ozs7Ozs7O1dBUUc7UUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQVk7WUFDckIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLG1CQUFRLEVBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLGFBQWE7WUFDYixNQUFNLGFBQWEsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBa0IsQ0FBQztZQUM1RCxhQUFhLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO1lBRTFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRCxZQUFZLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFcEQsdUNBQXVDO1lBQ3ZDLFlBQVksQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM3RCxzQ0FBc0M7WUFDdEMsWUFBWSxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBQSw4QkFBZSxFQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzVFLHNDQUFzQztZQUN0QyxZQUFZLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFBLDhCQUFlLEVBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDNUUsc0NBQXNDO1lBQ3RDLFlBQVksQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUEsOEJBQWUsRUFBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM1RSxrQ0FBa0M7WUFDbEMsWUFBWSxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBQSxnQ0FBaUIsRUFBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMxRSxrQ0FBa0M7WUFDbEMsWUFBWSxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBQSxnQ0FBaUIsRUFBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUUxRSxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBc0MsQ0FBQztZQUM5RCxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RELElBQUEsNENBQTZCLEVBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBRXZELE1BQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDN0QsTUFBTSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUVsRCxNQUFNLE9BQU8sR0FBRyxJQUFBLHlCQUFpQixFQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2pELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRWxDLE1BQU0sMEJBQTBCLEdBQUcsTUFBTSxLQUFLLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxpQkFBaUIsRUFBRTtnQkFDNUYsV0FBVyxFQUFFLEtBQUssQ0FBQyxRQUFRO2FBQzlCLENBQUMsQ0FBQztZQUNILDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ3hFLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDakUsMEJBQTBCLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUVuRSxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0tBQ0o7Q0FDSixDQUFDO0FBRUYsa0JBQWUsNEJBQW9CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBc3NldCB9IGZyb20gJ0Bjb2Nvcy9hc3NldC1kYic7XHJcbmltcG9ydCB7IHJlYWRKU09OIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBhcHBseVRleHR1cmVCYXNlQXNzZXRVc2VyRGF0YSwgZ2V0V3JhcE1vZGVTdHJpbmcsIGdldEZpbHRlclN0cmluZyB9IGZyb20gJy4uL3RleHR1cmUtYmFzZSc7XHJcbmltcG9ydCB7IFJlbmRlclRleHR1cmUgfSBmcm9tICdjYyc7XHJcblxyXG5pbXBvcnQgeyBnZXREZXBlbmRVVUlETGlzdCB9IGZyb20gJy4uLy4uL3V0aWxzJztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IFJlbmRlclRleHR1cmVBc3NldFVzZXJEYXRhLCBUZXh0dXJlQmFzZUFzc2V0VXNlckRhdGEgfSBmcm9tICcuLi8uLi8uLi9AdHlwZXMvdXNlckRhdGFzJztcclxuXHJcbmZ1bmN0aW9uIGZpbGxVc2VyZGF0YShhc3NldDogQXNzZXQsIG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSkge1xyXG4gICAgaWYgKCEobmFtZSBpbiBhc3NldC51c2VyRGF0YSkpIHtcclxuICAgICAgICBhc3NldC51c2VyRGF0YVtuYW1lXSA9IHZhbHVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgUmVuZGVyVGV4dHVyZUhhbmRsZXI6IEFzc2V0SGFuZGxlciA9IHtcclxuICAgIC8vIEhhbmRsZXIg55qE5ZCN5a2X77yM55So5LqO5oyH5a6aIEhhbmRsZXIgYXMg562JXHJcbiAgICBuYW1lOiAncmVuZGVyLXRleHR1cmUnLFxyXG5cclxuICAgIC8vIOW8leaTjuWGheWvueW6lOeahOexu+Wei1xyXG4gICAgYXNzZXRUeXBlOiAnY2MuUmVuZGVyVGV4dHVyZScsXHJcblxyXG4gICAgY3JlYXRlSW5mbzoge1xyXG4gICAgICAgIGdlbmVyYXRlTWVudUluZm8oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdpMThuOkVOR0lORS5hc3NldHMubmV3UmVuZGVyVGV4dHVyZScsXHJcbiAgICAgICAgICAgICAgICAgICAgZnVsbEZpbGVOYW1lOiAncmVuZGVyLXRleHR1cmUucnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBgZGI6Ly9pbnRlcm5hbC9kZWZhdWx0X2ZpbGVfY29udGVudC8ke1JlbmRlclRleHR1cmVIYW5kbGVyLm5hbWV9L2RlZmF1bHQucnRgLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdkZWZhdWx0JyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICAvLyDniYjmnKzlj7flpoLmnpzlj5jmm7TvvIzliJnkvJrlvLrliLbph43mlrDlr7zlhaVcclxuICAgICAgICB2ZXJzaW9uOiAnMS4yLjEnLFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlrp7pmYXlr7zlhaXmtYHnqItcclxuICAgICAgICAgKiDpnIDopoHoh6rlt7HmjqfliLbmmK/lkKbnlJ/miJDjgIHmi7fotJ3mlofku7ZcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIOi/lOWbnuaYr+WQpuWvvOWFpeaIkOWKn+eahOagh+iusFxyXG4gICAgICAgICAqIOWmguaenOi/lOWbniBmYWxzZe+8jOWImSBpbXBvcnRlZCDmoIforrDkuI3kvJrlj5jmiJAgdHJ1ZVxyXG4gICAgICAgICAqIOWQjue7reeahOS4gOezu+WIl+aTjeS9nOmDveS4jeS8muaJp+ihjFxyXG4gICAgICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFzeW5jIGltcG9ydChhc3NldDogQXNzZXQpIHtcclxuICAgICAgICAgICAgY29uc3QganNvbiA9IGF3YWl0IHJlYWRKU09OKGFzc2V0LnNvdXJjZSk7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgY29uc3QgcmVuZGVyVGV4dHVyZSA9IGNjLmRlc2VyaWFsaXplKGpzb24pIGFzIFJlbmRlclRleHR1cmU7XHJcbiAgICAgICAgICAgIHJlbmRlclRleHR1cmUubmFtZSA9IGFzc2V0LmJhc2VuYW1lIHx8ICcnO1xyXG5cclxuICAgICAgICAgICAgZmlsbFVzZXJkYXRhKGFzc2V0LCAnd2lkdGgnLCByZW5kZXJUZXh0dXJlLndpZHRoKTtcclxuICAgICAgICAgICAgZmlsbFVzZXJkYXRhKGFzc2V0LCAnaGVpZ2h0JywgcmVuZGVyVGV4dHVyZS5oZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSByZW5kZXJUZXh0dXJlLl9hbmlzb3Ryb3B5XHJcbiAgICAgICAgICAgIGZpbGxVc2VyZGF0YShhc3NldCwgJ2FuaXNvdHJvcHknLCByZW5kZXJUZXh0dXJlLl9hbmlzb3Ryb3B5KTtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSByZW5kZXJUZXh0dXJlLl9taW5GaWx0ZXJcclxuICAgICAgICAgICAgZmlsbFVzZXJkYXRhKGFzc2V0LCAnbWluZmlsdGVyJywgZ2V0RmlsdGVyU3RyaW5nKHJlbmRlclRleHR1cmUuX21pbkZpbHRlcikpO1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIHJlbmRlclRleHR1cmUuX21hZ2ZpbHRlclxyXG4gICAgICAgICAgICBmaWxsVXNlcmRhdGEoYXNzZXQsICdtYWdmaWx0ZXInLCBnZXRGaWx0ZXJTdHJpbmcocmVuZGVyVGV4dHVyZS5fbWFnRmlsdGVyKSk7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgcmVuZGVyVGV4dHVyZS5fbWlwZmlsdGVyXHJcbiAgICAgICAgICAgIGZpbGxVc2VyZGF0YShhc3NldCwgJ21pcGZpbHRlcicsIGdldEZpbHRlclN0cmluZyhyZW5kZXJUZXh0dXJlLl9taXBGaWx0ZXIpKTtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSByZW5kZXJUZXh0dXJlLl93cmFwU1xyXG4gICAgICAgICAgICBmaWxsVXNlcmRhdGEoYXNzZXQsICd3cmFwTW9kZVMnLCBnZXRXcmFwTW9kZVN0cmluZyhyZW5kZXJUZXh0dXJlLl93cmFwUykpO1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIHJlbmRlclRleHR1cmUuX3dyYXBUXHJcbiAgICAgICAgICAgIGZpbGxVc2VyZGF0YShhc3NldCwgJ3dyYXBNb2RlVCcsIGdldFdyYXBNb2RlU3RyaW5nKHJlbmRlclRleHR1cmUuX3dyYXBUKSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB1c2VyRGF0YSA9IGFzc2V0LnVzZXJEYXRhIGFzIFJlbmRlclRleHR1cmVBc3NldFVzZXJEYXRhO1xyXG4gICAgICAgICAgICByZW5kZXJUZXh0dXJlLnJlc2l6ZSh1c2VyRGF0YS53aWR0aCwgdXNlckRhdGEuaGVpZ2h0KTtcclxuICAgICAgICAgICAgYXBwbHlUZXh0dXJlQmFzZUFzc2V0VXNlckRhdGEodXNlckRhdGEsIHJlbmRlclRleHR1cmUpO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplSlNPTiA9IEVkaXRvckV4dGVuZHMuc2VyaWFsaXplKHJlbmRlclRleHR1cmUpO1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldC5zYXZlVG9MaWJyYXJ5KCcuanNvbicsIHNlcmlhbGl6ZUpTT04pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZGVwZW5kcyA9IGdldERlcGVuZFVVSURMaXN0KHNlcmlhbGl6ZUpTT04pO1xyXG4gICAgICAgICAgICBhc3NldC5zZXREYXRhKCdkZXBlbmRzJywgZGVwZW5kcyk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB0ZXh0dXJlU3ByaXRlRnJhbWVTdWJBc3NldCA9IGF3YWl0IGFzc2V0LmNyZWF0ZVN1YkFzc2V0KCdzcHJpdGVGcmFtZScsICdydC1zcHJpdGUtZnJhbWUnLCB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogYXNzZXQuYmFzZW5hbWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0dXJlU3ByaXRlRnJhbWVTdWJBc3NldC51c2VyRGF0YS5pbWFnZVV1aWRPckRhdGFiYXNlVXJpID0gYXNzZXQudXVpZDtcclxuICAgICAgICAgICAgdGV4dHVyZVNwcml0ZUZyYW1lU3ViQXNzZXQudXNlckRhdGEud2lkdGggPSBhc3NldC51c2VyRGF0YS53aWR0aDtcclxuICAgICAgICAgICAgdGV4dHVyZVNwcml0ZUZyYW1lU3ViQXNzZXQudXNlckRhdGEuaGVpZ2h0ID0gYXNzZXQudXNlckRhdGEuaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSZW5kZXJUZXh0dXJlSGFuZGxlcjtcclxuIl19