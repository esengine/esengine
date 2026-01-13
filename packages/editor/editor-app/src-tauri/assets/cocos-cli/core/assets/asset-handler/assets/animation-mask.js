"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const utils_1 = require("../utils");
const AnimationMaskHandler = {
    name: 'animation-mask',
    // 引擎内对应的类型
    assetType: 'cc.AnimationMask',
    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: 'i18n:ENGINE.assets.newAnimationMask',
                    fullFileName: 'Animation Mask.animask',
                    template: `db://internal/default_file_content/${AnimationMaskHandler.name}/default.animask`,
                    group: 'animation',
                    name: 'default',
                },
            ];
        },
    },
    importer: {
        version: '1.0.0',
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
exports.default = AnimationMaskHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uLW1hc2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvYW5pbWF0aW9uLW1hc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx1Q0FBb0M7QUFFcEMsb0NBQTZDO0FBRzdDLE1BQU0sb0JBQW9CLEdBQWlCO0lBQ3ZDLElBQUksRUFBRSxnQkFBZ0I7SUFFdEIsV0FBVztJQUNYLFNBQVMsRUFBRSxrQkFBa0I7SUFDN0IsVUFBVSxFQUFFO1FBQ1IsZ0JBQWdCO1lBQ1osT0FBTztnQkFDSDtvQkFDSSxLQUFLLEVBQUUscUNBQXFDO29CQUM1QyxZQUFZLEVBQUUsd0JBQXdCO29CQUN0QyxRQUFRLEVBQUUsc0NBQXNDLG9CQUFvQixDQUFDLElBQUksa0JBQWtCO29CQUMzRixLQUFLLEVBQUUsV0FBVztvQkFDbEIsSUFBSSxFQUFFLFNBQVM7aUJBQ2xCO2FBQ0osQ0FBQztRQUNOLENBQUM7S0FDSjtJQUVELFFBQVEsRUFBRTtRQUNOLE9BQU8sRUFBRSxPQUFPO1FBQ2hCOzs7OztXQUtHO1FBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFZO1lBQ3JCLE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBQSxtQkFBUSxFQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDM0QsTUFBTSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUVsRCxNQUFNLE9BQU8sR0FBRyxJQUFBLHlCQUFpQixFQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2pELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRWxDLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FDSjtDQUNKLENBQUM7QUFFRixrQkFBZSxvQkFBb0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0IH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0IHsgcmVhZEZpbGUgfSBmcm9tICdmcy1leHRyYSc7XHJcblxyXG5pbXBvcnQgeyBnZXREZXBlbmRVVUlETGlzdCB9IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcblxyXG5jb25zdCBBbmltYXRpb25NYXNrSGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgbmFtZTogJ2FuaW1hdGlvbi1tYXNrJyxcclxuXHJcbiAgICAvLyDlvJXmk47lhoXlr7nlupTnmoTnsbvlnotcclxuICAgIGFzc2V0VHlwZTogJ2NjLkFuaW1hdGlvbk1hc2snLFxyXG4gICAgY3JlYXRlSW5mbzoge1xyXG4gICAgICAgIGdlbmVyYXRlTWVudUluZm8oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdpMThuOkVOR0lORS5hc3NldHMubmV3QW5pbWF0aW9uTWFzaycsXHJcbiAgICAgICAgICAgICAgICAgICAgZnVsbEZpbGVOYW1lOiAnQW5pbWF0aW9uIE1hc2suYW5pbWFzaycsXHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IGBkYjovL2ludGVybmFsL2RlZmF1bHRfZmlsZV9jb250ZW50LyR7QW5pbWF0aW9uTWFza0hhbmRsZXIubmFtZX0vZGVmYXVsdC5hbmltYXNrYCxcclxuICAgICAgICAgICAgICAgICAgICBncm91cDogJ2FuaW1hdGlvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2RlZmF1bHQnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuXHJcbiAgICBpbXBvcnRlcjoge1xyXG4gICAgICAgIHZlcnNpb246ICcxLjAuMCcsXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog6L+U5Zue5piv5ZCm5a+85YWl5oiQ5Yqf55qE5qCH6K6wXHJcbiAgICAgICAgICog5aaC5p6c6L+U5ZueIGZhbHNl77yM5YiZIGltcG9ydGVkIOagh+iusOS4jeS8muWPmOaIkCB0cnVlXHJcbiAgICAgICAgICog5ZCO57ut55qE5LiA57O75YiX5pON5L2c6YO95LiN5Lya5omn6KGMXHJcbiAgICAgICAgICogQHBhcmFtIGFzc2V0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXN5bmMgaW1wb3J0KGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgICAgICBjb25zdCBzZXJpYWxpemVKU09OID0gYXdhaXQgcmVhZEZpbGUoYXNzZXQuc291cmNlLCAndXRmOCcpO1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldC5zYXZlVG9MaWJyYXJ5KCcuanNvbicsIHNlcmlhbGl6ZUpTT04pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZGVwZW5kcyA9IGdldERlcGVuZFVVSURMaXN0KHNlcmlhbGl6ZUpTT04pO1xyXG4gICAgICAgICAgICBhc3NldC5zZXREYXRhKCdkZXBlbmRzJywgZGVwZW5kcyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFuaW1hdGlvbk1hc2tIYW5kbGVyO1xyXG4iXX0=