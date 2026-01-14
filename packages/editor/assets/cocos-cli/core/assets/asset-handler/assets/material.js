'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialHandler = void 0;
const fs_extra_1 = require("fs-extra");
const material_upgrader_1 = require("./utils/material-upgrader");
const utils_1 = require("../utils");
exports.MaterialHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'material',
    // 引擎内对应的类型
    assetType: 'cc.Material',
    async validate(asset) {
        try {
            const json = (0, fs_extra_1.readJSONSync)(asset.source);
            return json.__type__ === 'cc.Material';
        }
        catch (error) {
            return false;
        }
    },
    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: 'i18n:ENGINE.assets.newMaterial',
                    fullFileName: 'material.mtl',
                    template: `db://internal/default_file_content/${exports.MaterialHandler.name}/default.mtl`,
                    group: 'material',
                    name: 'default',
                },
            ];
        },
    },
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.21',
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
            try {
                const material = (0, fs_extra_1.readJSONSync)(asset.source);
                // uuid dependency
                const uuid = material._effectAsset && material._effectAsset.__uuid__;
                asset.depend(uuid);
                // upgrade properties
                if (await (0, material_upgrader_1.upgradeProperties)(material, asset)) {
                    (0, fs_extra_1.writeJSONSync)(asset.source, material, { spaces: 2 });
                }
                material._name = asset.basename || '';
                const serializeJSON = JSON.stringify(material, undefined, 2);
                await asset.saveToLibrary('.json', serializeJSON);
                const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
                asset.setData('depends', depends);
                return true;
            }
            catch (err) {
                console.error(err);
                return false;
            }
        },
    },
};
exports.default = exports.MaterialHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvbWF0ZXJpYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFHYix1Q0FBNkY7QUFDN0YsaUVBQThEO0FBRTlELG9DQUE2QztBQUdoQyxRQUFBLGVBQWUsR0FBaUI7SUFDekMsZ0NBQWdDO0lBQ2hDLElBQUksRUFBRSxVQUFVO0lBRWhCLFdBQVc7SUFDWCxTQUFTLEVBQUUsYUFBYTtJQUV4QixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQVk7UUFDdkIsSUFBSSxDQUFDO1lBQ0QsTUFBTSxJQUFJLEdBQUcsSUFBQSx1QkFBWSxFQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QyxPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssYUFBYSxDQUFDO1FBQzNDLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2IsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztJQUNMLENBQUM7SUFFRCxVQUFVLEVBQUU7UUFDUixnQkFBZ0I7WUFDWixPQUFPO2dCQUNIO29CQUNJLEtBQUssRUFBRSxnQ0FBZ0M7b0JBQ3ZDLFlBQVksRUFBRSxjQUFjO29CQUM1QixRQUFRLEVBQUUsc0NBQXNDLHVCQUFlLENBQUMsSUFBSSxjQUFjO29CQUNsRixLQUFLLEVBQUUsVUFBVTtvQkFDakIsSUFBSSxFQUFFLFNBQVM7aUJBQ2xCO2FBQ0osQ0FBQztRQUNOLENBQUM7S0FDSjtJQUVELFFBQVEsRUFBRTtRQUNOLG1CQUFtQjtRQUNuQixPQUFPLEVBQUUsUUFBUTtRQUVqQjs7Ozs7Ozs7V0FRRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBWTtZQUNyQixJQUFJLENBQUM7Z0JBQ0QsTUFBTSxRQUFRLEdBQUcsSUFBQSx1QkFBWSxFQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFNUMsa0JBQWtCO2dCQUNsQixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsWUFBWSxJQUFJLFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDO2dCQUNyRSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVuQixxQkFBcUI7Z0JBQ3JCLElBQUksTUFBTSxJQUFBLHFDQUFpQixFQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUMzQyxJQUFBLHdCQUFhLEVBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDekQsQ0FBQztnQkFDRCxRQUFRLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO2dCQUN0QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzdELE1BQU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBRWxELE1BQU0sT0FBTyxHQUFHLElBQUEseUJBQWlCLEVBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ2pELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUVsQyxPQUFPLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztnQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDO1FBQ0wsQ0FBQztLQUNKO0NBQ0osQ0FBQztBQUVGLGtCQUFlLHVCQUFlLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBBc3NldCwgcXVlcnlBc3NldCwgcXVlcnlQYXRoLCBWaXJ0dWFsQXNzZXQgfSBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5pbXBvcnQgeyBvdXRwdXRKU09OLCBvdXRwdXRKU09OU3luYywgcmVhZEpTT04sIHJlYWRKU09OU3luYywgd3JpdGVKU09OU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHsgdXBncmFkZVByb3BlcnRpZXMgfSBmcm9tICcuL3V0aWxzL21hdGVyaWFsLXVwZ3JhZGVyJztcclxuXHJcbmltcG9ydCB7IGdldERlcGVuZFVVSURMaXN0IH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBBc3NldEhhbmRsZXIsIElBc3NldCwgSUNyZWF0ZU1lbnVJbmZvIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcblxyXG5leHBvcnQgY29uc3QgTWF0ZXJpYWxIYW5kbGVyOiBBc3NldEhhbmRsZXIgPSB7XHJcbiAgICAvLyBIYW5kbGVyIOeahOWQjeWtl++8jOeUqOS6juaMh+WumiBIYW5kbGVyIGFzIOetiVxyXG4gICAgbmFtZTogJ21hdGVyaWFsJyxcclxuXHJcbiAgICAvLyDlvJXmk47lhoXlr7nlupTnmoTnsbvlnotcclxuICAgIGFzc2V0VHlwZTogJ2NjLk1hdGVyaWFsJyxcclxuXHJcbiAgICBhc3luYyB2YWxpZGF0ZShhc3NldDogQXNzZXQpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBqc29uID0gcmVhZEpTT05TeW5jKGFzc2V0LnNvdXJjZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBqc29uLl9fdHlwZV9fID09PSAnY2MuTWF0ZXJpYWwnO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGNyZWF0ZUluZm86IHtcclxuICAgICAgICBnZW5lcmF0ZU1lbnVJbmZvKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpFTkdJTkUuYXNzZXRzLm5ld01hdGVyaWFsJyxcclxuICAgICAgICAgICAgICAgICAgICBmdWxsRmlsZU5hbWU6ICdtYXRlcmlhbC5tdGwnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBgZGI6Ly9pbnRlcm5hbC9kZWZhdWx0X2ZpbGVfY29udGVudC8ke01hdGVyaWFsSGFuZGxlci5uYW1lfS9kZWZhdWx0Lm10bGAsXHJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXA6ICdtYXRlcmlhbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2RlZmF1bHQnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuXHJcbiAgICBpbXBvcnRlcjoge1xyXG4gICAgICAgIC8vIOeJiOacrOWPt+WmguaenOWPmOabtO+8jOWImeS8muW8uuWItumHjeaWsOWvvOWFpVxyXG4gICAgICAgIHZlcnNpb246ICcxLjAuMjEnLFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlrp7pmYXlr7zlhaXmtYHnqItcclxuICAgICAgICAgKiDpnIDopoHoh6rlt7HmjqfliLbmmK/lkKbnlJ/miJDjgIHmi7fotJ3mlofku7ZcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIOi/lOWbnuaYr+WQpuWvvOWFpeaIkOWKn+eahOagh+iusFxyXG4gICAgICAgICAqIOWmguaenOi/lOWbniBmYWxzZe+8jOWImSBpbXBvcnRlZCDmoIforrDkuI3kvJrlj5jmiJAgdHJ1ZVxyXG4gICAgICAgICAqIOWQjue7reeahOS4gOezu+WIl+aTjeS9nOmDveS4jeS8muaJp+ihjFxyXG4gICAgICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFzeW5jIGltcG9ydChhc3NldDogQXNzZXQpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGVyaWFsID0gcmVhZEpTT05TeW5jKGFzc2V0LnNvdXJjZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gdXVpZCBkZXBlbmRlbmN5XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1dWlkID0gbWF0ZXJpYWwuX2VmZmVjdEFzc2V0ICYmIG1hdGVyaWFsLl9lZmZlY3RBc3NldC5fX3V1aWRfXztcclxuICAgICAgICAgICAgICAgIGFzc2V0LmRlcGVuZCh1dWlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyB1cGdyYWRlIHByb3BlcnRpZXNcclxuICAgICAgICAgICAgICAgIGlmIChhd2FpdCB1cGdyYWRlUHJvcGVydGllcyhtYXRlcmlhbCwgYXNzZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd3JpdGVKU09OU3luYyhhc3NldC5zb3VyY2UsIG1hdGVyaWFsLCB7IHNwYWNlczogMiB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG1hdGVyaWFsLl9uYW1lID0gYXNzZXQuYmFzZW5hbWUgfHwgJyc7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXJpYWxpemVKU09OID0gSlNPTi5zdHJpbmdpZnkobWF0ZXJpYWwsIHVuZGVmaW5lZCwgMik7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBhc3NldC5zYXZlVG9MaWJyYXJ5KCcuanNvbicsIHNlcmlhbGl6ZUpTT04pO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGRlcGVuZHMgPSBnZXREZXBlbmRVVUlETGlzdChzZXJpYWxpemVKU09OKTtcclxuICAgICAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBkZXBlbmRzKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1hdGVyaWFsSGFuZGxlcjtcclxuIl19