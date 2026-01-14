"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const utils_1 = require("../utils");
const AnimationGraphHandler = {
    name: 'animation-graph',
    // 引擎内对应的类型
    assetType: 'cc.AnimationGraph',
    open(asset) {
        // TODO: 实现打开动画图资产
        return false;
    },
    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: 'i18n:ENGINE.assets.newAnimationGraph',
                    fullFileName: 'Animation Graph.animgraph',
                    template: `db://internal/default_file_content/${AnimationGraphHandler.name}/default.animgraph`,
                    group: 'animation',
                    name: 'default',
                },
                {
                    label: 'i18n:ENGINE.assets.newAnimationGraphTS',
                    fullFileName: 'AnimationGraphComponent.ts',
                    template: `db://internal/default_file_content/${AnimationGraphHandler.name}/ts-animation-graph`,
                    handler: 'typescript',
                    group: 'animation',
                    name: 'ts-animation-graph',
                },
            ];
        },
    },
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.2.0',
        /**
         * 返回是否导入成功的标记
         * 如果返回 false，则 imported 标记不会变成 true
         * 后续的一系列操作都不会执行
         * @param asset
         */
        async import(asset) {
            const serializeJSON = await (0, fs_extra_1.readFile)(asset.source, 'utf8');
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            return true;
        },
    },
};
exports.default = AnimationGraphHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uLWdyYXBoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvYXNzZXRzL2FuaW1hdGlvbi1ncmFwaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLHVDQUFvQztBQUVwQyxvQ0FBNkM7QUFHN0MsTUFBTSxxQkFBcUIsR0FBaUI7SUFDeEMsSUFBSSxFQUFFLGlCQUFpQjtJQUN2QixXQUFXO0lBQ1gsU0FBUyxFQUFFLG1CQUFtQjtJQUM5QixJQUFJLENBQUMsS0FBSztRQUNOLGtCQUFrQjtRQUNsQixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0QsVUFBVSxFQUFFO1FBQ1IsZ0JBQWdCO1lBQ1osT0FBTztnQkFDSDtvQkFDSSxLQUFLLEVBQUUsc0NBQXNDO29CQUM3QyxZQUFZLEVBQUUsMkJBQTJCO29CQUN6QyxRQUFRLEVBQUUsc0NBQXNDLHFCQUFxQixDQUFDLElBQUksb0JBQW9CO29CQUM5RixLQUFLLEVBQUUsV0FBVztvQkFDbEIsSUFBSSxFQUFFLFNBQVM7aUJBQ2xCO2dCQUNEO29CQUNJLEtBQUssRUFBRSx3Q0FBd0M7b0JBQy9DLFlBQVksRUFBRSw0QkFBNEI7b0JBQzFDLFFBQVEsRUFBRSxzQ0FBc0MscUJBQXFCLENBQUMsSUFBSSxxQkFBcUI7b0JBQy9GLE9BQU8sRUFBRSxZQUFZO29CQUNyQixLQUFLLEVBQUUsV0FBVztvQkFDbEIsSUFBSSxFQUFFLG9CQUFvQjtpQkFDN0I7YUFDSixDQUFDO1FBQ04sQ0FBQztLQUNKO0lBQ0QsUUFBUSxFQUFFO1FBQ04sbUJBQW1CO1FBQ25CLE9BQU8sRUFBRSxPQUFPO1FBQ2hCOzs7OztXQUtHO1FBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFZO1lBQ3JCLE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBQSxtQkFBUSxFQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDM0QsTUFBTSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUVsRCxNQUFNLE9BQU8sR0FBRyxJQUFBLHlCQUFpQixFQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2pELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRWxDLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FDSjtDQUNKLENBQUM7QUFFRixrQkFBZSxxQkFBcUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0IH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0IHsganMgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IEFuaW1hdGlvbkdyYXBoIH0gZnJvbSAnY2MvZWRpdG9yL25ldy1nZW4tYW5pbSc7XHJcbmltcG9ydCB7IHJlYWRGaWxlIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5cclxuaW1wb3J0IHsgZ2V0RGVwZW5kVVVJRExpc3QgfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB7IEFzc2V0SGFuZGxlciB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5cclxuY29uc3QgQW5pbWF0aW9uR3JhcGhIYW5kbGVyOiBBc3NldEhhbmRsZXIgPSB7XHJcbiAgICBuYW1lOiAnYW5pbWF0aW9uLWdyYXBoJyxcclxuICAgIC8vIOW8leaTjuWGheWvueW6lOeahOexu+Wei1xyXG4gICAgYXNzZXRUeXBlOiAnY2MuQW5pbWF0aW9uR3JhcGgnLFxyXG4gICAgb3Blbihhc3NldCkge1xyXG4gICAgICAgIC8vIFRPRE86IOWunueOsOaJk+W8gOWKqOeUu+Wbvui1hOS6p1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBjcmVhdGVJbmZvOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVNZW51SW5mbygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ2kxOG46RU5HSU5FLmFzc2V0cy5uZXdBbmltYXRpb25HcmFwaCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZnVsbEZpbGVOYW1lOiAnQW5pbWF0aW9uIEdyYXBoLmFuaW1ncmFwaCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IGBkYjovL2ludGVybmFsL2RlZmF1bHRfZmlsZV9jb250ZW50LyR7QW5pbWF0aW9uR3JhcGhIYW5kbGVyLm5hbWV9L2RlZmF1bHQuYW5pbWdyYXBoYCxcclxuICAgICAgICAgICAgICAgICAgICBncm91cDogJ2FuaW1hdGlvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2RlZmF1bHQnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ2kxOG46RU5HSU5FLmFzc2V0cy5uZXdBbmltYXRpb25HcmFwaFRTJyxcclxuICAgICAgICAgICAgICAgICAgICBmdWxsRmlsZU5hbWU6ICdBbmltYXRpb25HcmFwaENvbXBvbmVudC50cycsXHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IGBkYjovL2ludGVybmFsL2RlZmF1bHRfZmlsZV9jb250ZW50LyR7QW5pbWF0aW9uR3JhcGhIYW5kbGVyLm5hbWV9L3RzLWFuaW1hdGlvbi1ncmFwaGAsXHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcjogJ3R5cGVzY3JpcHQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwOiAnYW5pbWF0aW9uJyxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAndHMtYW5pbWF0aW9uLWdyYXBoJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBpbXBvcnRlcjoge1xyXG4gICAgICAgIC8vIOeJiOacrOWPt+WmguaenOWPmOabtO+8jOWImeS8muW8uuWItumHjeaWsOWvvOWFpVxyXG4gICAgICAgIHZlcnNpb246ICcxLjIuMCcsXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6L+U5Zue5piv5ZCm5a+85YWl5oiQ5Yqf55qE5qCH6K6wXHJcbiAgICAgICAgICog5aaC5p6c6L+U5ZueIGZhbHNl77yM5YiZIGltcG9ydGVkIOagh+iusOS4jeS8muWPmOaIkCB0cnVlXHJcbiAgICAgICAgICog5ZCO57ut55qE5LiA57O75YiX5pON5L2c6YO95LiN5Lya5omn6KGMXHJcbiAgICAgICAgICogQHBhcmFtIGFzc2V0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXN5bmMgaW1wb3J0KGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgICAgICBjb25zdCBzZXJpYWxpemVKU09OID0gYXdhaXQgcmVhZEZpbGUoYXNzZXQuc291cmNlLCAndXRmOCcpO1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldC5zYXZlVG9MaWJyYXJ5KCcuanNvbicsIHNlcmlhbGl6ZUpTT04pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZGVwZW5kcyA9IGdldERlcGVuZFVVSURMaXN0KHNlcmlhbGl6ZUpTT04pO1xyXG4gICAgICAgICAgICBhc3NldC5zZXREYXRhKCdkZXBlbmRzJywgZGVwZW5kcyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFuaW1hdGlvbkdyYXBoSGFuZGxlcjtcclxuIl19