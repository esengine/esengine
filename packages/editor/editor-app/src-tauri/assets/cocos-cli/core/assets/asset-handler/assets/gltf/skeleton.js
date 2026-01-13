"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GltfSkeletonHandler = void 0;
const reader_manager_1 = require("./reader-manager");
const utils_1 = require("../../utils");
const gltf_1 = __importDefault(require("../gltf"));
const fbx_1 = __importDefault(require("../fbx"));
exports.GltfSkeletonHandler = {
    name: 'gltf-skeleton',
    // 引擎内对应的类型
    assetType: 'cc.Skeleton',
    /**
     * 允许这种类型的资源进行实例化
     */
    instantiation: '.skeleton',
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.1',
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
            let version = gltf_1.default.importer.version;
            if (asset.parent.meta.importer === 'fbx') {
                version = fbx_1.default.importer.version;
            }
            const gltfConverter = await reader_manager_1.glTfReaderManager.getOrCreate(asset.parent, version);
            const skeleton = gltfConverter.createSkeleton(asset.userData.gltfIndex);
            asset.userData.jointsLength = skeleton.joints.length;
            const serializeJSON = EditorExtends.serialize(skeleton);
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            return true;
        },
    },
};
exports.default = exports.GltfSkeletonHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2tlbGV0b24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvZ2x0Zi9za2VsZXRvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxxREFBcUQ7QUFFckQsdUNBQWdEO0FBRWhELG1EQUFrQztBQUNsQyxpREFBZ0M7QUFFbkIsUUFBQSxtQkFBbUIsR0FBaUI7SUFDN0MsSUFBSSxFQUFFLGVBQWU7SUFFckIsV0FBVztJQUNYLFNBQVMsRUFBRSxhQUFhO0lBRXhCOztPQUVHO0lBQ0gsYUFBYSxFQUFFLFdBQVc7SUFFMUIsUUFBUSxFQUFFO1FBQ04sbUJBQW1CO1FBQ25CLE9BQU8sRUFBRSxPQUFPO1FBQ2hCOzs7Ozs7O1dBT0c7UUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQW1CO1lBQzVCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2hCLE9BQU8sS0FBSyxDQUFDO1lBQ2pCLENBQUM7WUFDRCxJQUFJLE9BQU8sR0FBRyxjQUFXLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztZQUMzQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxLQUFLLEVBQUUsQ0FBQztnQkFDdkMsT0FBTyxHQUFHLGFBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQzFDLENBQUM7WUFDRCxNQUFNLGFBQWEsR0FBRyxNQUFNLGtDQUFpQixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRTFGLE1BQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFtQixDQUFDLENBQUM7WUFFbEYsS0FBSyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFFckQsTUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN4RCxNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBRWxELE1BQU0sT0FBTyxHQUFHLElBQUEseUJBQWlCLEVBQUMsYUFBYSxDQUFDLENBQUM7WUFDakQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFbEMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztLQUNKO0NBQ0osQ0FBQztBQUVGLGtCQUFlLDJCQUFtQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXNzZXQsIFZpcnR1YWxBc3NldCB9IGZyb20gJ0Bjb2Nvcy9hc3NldC1kYic7XHJcbmltcG9ydCB7IGdsVGZSZWFkZXJNYW5hZ2VyIH0gZnJvbSAnLi9yZWFkZXItbWFuYWdlcic7XHJcblxyXG5pbXBvcnQgeyBnZXREZXBlbmRVVUlETGlzdCB9IGZyb20gJy4uLy4uL3V0aWxzJztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCBHbHRmSGFuZGxlciBmcm9tICcuLi9nbHRmJztcclxuaW1wb3J0IEZieEhhbmRsZXIgZnJvbSAnLi4vZmJ4JztcclxuXHJcbmV4cG9ydCBjb25zdCBHbHRmU2tlbGV0b25IYW5kbGVyOiBBc3NldEhhbmRsZXIgPSB7XHJcbiAgICBuYW1lOiAnZ2x0Zi1za2VsZXRvbicsXHJcblxyXG4gICAgLy8g5byV5pOO5YaF5a+55bqU55qE57G75Z6LXHJcbiAgICBhc3NldFR5cGU6ICdjYy5Ta2VsZXRvbicsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlhYHorrjov5nnp43nsbvlnovnmoTotYTmupDov5vooYzlrp7kvovljJZcclxuICAgICAqL1xyXG4gICAgaW5zdGFudGlhdGlvbjogJy5za2VsZXRvbicsXHJcblxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICAvLyDniYjmnKzlj7flpoLmnpzlj5jmm7TvvIzliJnkvJrlvLrliLbph43mlrDlr7zlhaVcclxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjEnLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWunumZheWvvOWFpea1geeoi1xyXG4gICAgICAgICAqIOmcgOimgeiHquW3seaOp+WItuaYr+WQpueUn+aIkOOAgeaLt+i0neaWh+S7tlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICog6L+U5Zue5piv5ZCm5a+85YWl5oiQ5Yqf55qEIGJvb2xlYW5cclxuICAgICAgICAgKiDlpoLmnpzov5Tlm54gZmFsc2XvvIzliJnkuIvmrKHlkK/liqjov5jkvJrph43mlrDlr7zlhaVcclxuICAgICAgICAgKiBAcGFyYW0gYXNzZXRcclxuICAgICAgICAgKi9cclxuICAgICAgICBhc3luYyBpbXBvcnQoYXNzZXQ6IFZpcnR1YWxBc3NldCkge1xyXG4gICAgICAgICAgICBpZiAoIWFzc2V0LnBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCB2ZXJzaW9uID0gR2x0ZkhhbmRsZXIuaW1wb3J0ZXIudmVyc2lvbjtcclxuICAgICAgICAgICAgaWYgKGFzc2V0LnBhcmVudC5tZXRhLmltcG9ydGVyID09PSAnZmJ4Jykge1xyXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IEZieEhhbmRsZXIuaW1wb3J0ZXIudmVyc2lvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBnbHRmQ29udmVydGVyID0gYXdhaXQgZ2xUZlJlYWRlck1hbmFnZXIuZ2V0T3JDcmVhdGUoYXNzZXQucGFyZW50IGFzIEFzc2V0LCB2ZXJzaW9uKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNrZWxldG9uID0gZ2x0ZkNvbnZlcnRlci5jcmVhdGVTa2VsZXRvbihhc3NldC51c2VyRGF0YS5nbHRmSW5kZXggYXMgbnVtYmVyKTtcclxuXHJcbiAgICAgICAgICAgIGFzc2V0LnVzZXJEYXRhLmpvaW50c0xlbmd0aCA9IHNrZWxldG9uLmpvaW50cy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBzZXJpYWxpemVKU09OID0gRWRpdG9yRXh0ZW5kcy5zZXJpYWxpemUoc2tlbGV0b24pO1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldC5zYXZlVG9MaWJyYXJ5KCcuanNvbicsIHNlcmlhbGl6ZUpTT04pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZGVwZW5kcyA9IGdldERlcGVuZFVVSURMaXN0KHNlcmlhbGl6ZUpTT04pO1xyXG4gICAgICAgICAgICBhc3NldC5zZXREYXRhKCdkZXBlbmRzJywgZGVwZW5kcyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdsdGZTa2VsZXRvbkhhbmRsZXI7XHJcbiJdfQ==