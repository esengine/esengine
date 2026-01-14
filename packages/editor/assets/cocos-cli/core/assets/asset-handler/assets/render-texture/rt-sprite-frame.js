'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RTSpriteFrameHandler = void 0;
const cc_1 = require("cc");
const utils_1 = require("../../utils");
exports.RTSpriteFrameHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'rt-sprite-frame',
    assetType: 'cc.SpriteFrame',
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.0',
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
            // 如果没有生成 json 文件，则重新生成
            if (!asset.parent) {
                return false;
            }
            const sprite = new cc_1.SpriteFrame();
            // @ts-ignore
            sprite._texture = EditorExtends.serialize.asAsset(asset.userData.imageUuidOrDatabaseUri, cc.Texture2D);
            sprite.rect.width = sprite.originalSize.width = asset.userData.width || 1;
            sprite.rect.height = sprite.originalSize.height = asset.userData.height || 1;
            const serializeJSON = EditorExtends.serialize(sprite);
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            return true;
        },
    },
};
exports.default = exports.RTSpriteFrameHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnQtc3ByaXRlLWZyYW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvYXNzZXRzL3JlbmRlci10ZXh0dXJlL3J0LXNwcml0ZS1mcmFtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUliLDJCQUFpQztBQUVqQyx1Q0FBZ0Q7QUFFbkMsUUFBQSxvQkFBb0IsR0FBaUI7SUFDOUMsZ0NBQWdDO0lBQ2hDLElBQUksRUFBRSxpQkFBaUI7SUFDdkIsU0FBUyxFQUFFLGdCQUFnQjtJQUUzQixRQUFRLEVBQUU7UUFDTixtQkFBbUI7UUFDbkIsT0FBTyxFQUFFLE9BQU87UUFDaEI7Ozs7Ozs7O1dBUUc7UUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQVk7WUFDckIsdUJBQXVCO1lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2hCLE9BQU8sS0FBSyxDQUFDO1lBQ2pCLENBQUM7WUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGdCQUFXLEVBQUUsQ0FBQztZQUNqQyxhQUFhO1lBQ2IsTUFBTSxDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV2RyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7WUFDMUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO1lBRTdFLE1BQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdEQsTUFBTSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUVsRCxNQUFNLE9BQU8sR0FBRyxJQUFBLHlCQUFpQixFQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2pELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRWxDLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FDSjtDQUNKLENBQUM7QUFFRixrQkFBZSw0QkFBb0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IEFzc2V0LCBWaXJ0dWFsQXNzZXQsIHF1ZXJ5UGF0aCwgcXVlcnlVVUlEIH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IFNwcml0ZUZyYW1lIH0gZnJvbSAnY2MnO1xyXG5cclxuaW1wb3J0IHsgZ2V0RGVwZW5kVVVJRExpc3QgfSBmcm9tICcuLi8uLi91dGlscyc7XHJcblxyXG5leHBvcnQgY29uc3QgUlRTcHJpdGVGcmFtZUhhbmRsZXI6IEFzc2V0SGFuZGxlciA9IHtcclxuICAgIC8vIEhhbmRsZXIg55qE5ZCN5a2X77yM55So5LqO5oyH5a6aIEhhbmRsZXIgYXMg562JXHJcbiAgICBuYW1lOiAncnQtc3ByaXRlLWZyYW1lJyxcclxuICAgIGFzc2V0VHlwZTogJ2NjLlNwcml0ZUZyYW1lJyxcclxuXHJcbiAgICBpbXBvcnRlcjoge1xyXG4gICAgICAgIC8vIOeJiOacrOWPt+WmguaenOWPmOabtO+8jOWImeS8muW8uuWItumHjeaWsOWvvOWFpVxyXG4gICAgICAgIHZlcnNpb246ICcxLjAuMCcsXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5a6e6ZmF5a+85YWl5rWB56iLXHJcbiAgICAgICAgICog6ZyA6KaB6Ieq5bex5o6n5Yi25piv5ZCm55Sf5oiQ44CB5ou36LSd5paH5Lu2XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiDov5Tlm57mmK/lkKblr7zlhaXmiJDlip/nmoTmoIforrBcclxuICAgICAgICAgKiDlpoLmnpzov5Tlm54gZmFsc2XvvIzliJkgaW1wb3J0ZWQg5qCH6K6w5LiN5Lya5Y+Y5oiQIHRydWVcclxuICAgICAgICAgKiDlkI7nu63nmoTkuIDns7vliJfmk43kvZzpg73kuI3kvJrmiafooYxcclxuICAgICAgICAgKiBAcGFyYW0gYXNzZXRcclxuICAgICAgICAgKi9cclxuICAgICAgICBhc3luYyBpbXBvcnQoYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICAgICAgICAgIC8vIOWmguaenOayoeacieeUn+aIkCBqc29uIOaWh+S7tu+8jOWImemHjeaWsOeUn+aIkFxyXG4gICAgICAgICAgICBpZiAoIWFzc2V0LnBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBzcHJpdGUgPSBuZXcgU3ByaXRlRnJhbWUoKTtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBzcHJpdGUuX3RleHR1cmUgPSBFZGl0b3JFeHRlbmRzLnNlcmlhbGl6ZS5hc0Fzc2V0KGFzc2V0LnVzZXJEYXRhLmltYWdlVXVpZE9yRGF0YWJhc2VVcmksIGNjLlRleHR1cmUyRCk7XHJcblxyXG4gICAgICAgICAgICBzcHJpdGUucmVjdC53aWR0aCA9IHNwcml0ZS5vcmlnaW5hbFNpemUud2lkdGggPSBhc3NldC51c2VyRGF0YS53aWR0aCB8fCAxO1xyXG4gICAgICAgICAgICBzcHJpdGUucmVjdC5oZWlnaHQgPSBzcHJpdGUub3JpZ2luYWxTaXplLmhlaWdodCA9IGFzc2V0LnVzZXJEYXRhLmhlaWdodCB8fCAxO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplSlNPTiA9IEVkaXRvckV4dGVuZHMuc2VyaWFsaXplKHNwcml0ZSk7XHJcbiAgICAgICAgICAgIGF3YWl0IGFzc2V0LnNhdmVUb0xpYnJhcnkoJy5qc29uJywgc2VyaWFsaXplSlNPTik7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRzID0gZ2V0RGVwZW5kVVVJRExpc3Qoc2VyaWFsaXplSlNPTik7XHJcbiAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBkZXBlbmRzKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUlRTcHJpdGVGcmFtZUhhbmRsZXI7XHJcbiJdfQ==