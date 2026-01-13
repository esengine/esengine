'use strict';
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
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const serialize_library_1 = require("./utils/serialize-library");
const cc = __importStar(require("cc"));
const utils_1 = require("../utils");
const AnimationHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'animation-clip',
    // 引擎内对应的类型
    assetType: 'cc.AnimationClip',
    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: 'i18n:ENGINE.assets.newAnimation',
                    fullFileName: 'animation.anim',
                    template: `db://internal/default_file_content/${AnimationHandler.name}/default.anim`,
                    group: 'animation',
                    name: 'default',
                },
            ];
        },
    },
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '2.0.4',
        versionCode: 2,
        /**
         * 如果改名就强制刷新
         * @param asset
         */
        async force(asset) {
            const userData = asset.userData;
            return userData.name !== asset.basename;
        },
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
            try {
                const fileContent = await (0, fs_extra_1.readFile)(asset.source, 'utf8');
                const json = JSON.parse(fileContent);
                const details = cc.deserialize.Details.pool.get();
                const clip = cc.deserialize(json, details, undefined);
                const nUUIDRefs = details.uuidList.length;
                for (let i = 0; i < nUUIDRefs; ++i) {
                    const uuid = details.uuidList[i];
                    const uuidObj = details.uuidObjList[i];
                    const uuidProp = details.uuidPropList[i];
                    const uuidType = details.uuidTypeList[i];
                    const Type = cc.js.getClassById(uuidType) ?? cc.Asset;
                    const asset = new Type();
                    asset._uuid = uuid + '';
                    uuidObj[uuidProp] = asset;
                }
                clip.name = (0, path_1.basename)(asset.source, '.anim');
                userData.name = clip.name;
                // Compute hash
                void clip.hash;
                const { extension, data } = (0, serialize_library_1.serializeForLibrary)(clip);
                await asset.saveToLibrary(extension, data);
                const depends = (0, utils_1.getDependUUIDList)(fileContent);
                asset.setData('depends', depends);
            }
            catch (error) {
                console.error(error);
                return false;
            }
            return true;
        },
    },
};
exports.default = AnimationHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uLWNsaXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvYW5pbWF0aW9uLWNsaXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUliLHVDQUFvQztBQUNwQywrQkFBZ0M7QUFDaEMsaUVBQWdFO0FBQ2hFLHVDQUF5QjtBQUV6QixvQ0FBNkM7QUFJN0MsTUFBTSxnQkFBZ0IsR0FBaUI7SUFDbkMsZ0NBQWdDO0lBQ2hDLElBQUksRUFBRSxnQkFBZ0I7SUFDdEIsV0FBVztJQUNYLFNBQVMsRUFBRSxrQkFBa0I7SUFDN0IsVUFBVSxFQUFFO1FBQ1IsZ0JBQWdCO1lBQ1osT0FBTztnQkFDSDtvQkFDSSxLQUFLLEVBQUUsaUNBQWlDO29CQUN4QyxZQUFZLEVBQUUsZ0JBQWdCO29CQUM5QixRQUFRLEVBQUUsc0NBQXNDLGdCQUFnQixDQUFDLElBQUksZUFBZTtvQkFDcEYsS0FBSyxFQUFFLFdBQVc7b0JBQ2xCLElBQUksRUFBRSxTQUFTO2lCQUNsQjthQUNKLENBQUM7UUFDTixDQUFDO0tBQ0o7SUFDRCxRQUFRLEVBQUU7UUFDTixtQkFBbUI7UUFDbkIsT0FBTyxFQUFFLE9BQU87UUFDaEIsV0FBVyxFQUFFLENBQUM7UUFFZDs7O1dBR0c7UUFDSCxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQVk7WUFDcEIsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQXNDLENBQUM7WUFDOUQsT0FBTyxRQUFRLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFDNUMsQ0FBQztRQUVEOzs7Ozs7OztXQVFHO1FBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFZO1lBQ3JCLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFzQyxDQUFDO1lBQzlELElBQUksQ0FBQztnQkFDRCxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUEsbUJBQVEsRUFBQyxLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUVyQyxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFHLENBQUM7Z0JBQ25ELE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQWtCLENBQUM7Z0JBQ3ZFLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxRQUFTLENBQUMsTUFBTSxDQUFDO2dCQUMzQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7b0JBQ2pDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2xDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFZLENBQUMsQ0FBQyxDQUFRLENBQUM7b0JBQy9DLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pDLE1BQU0sSUFBSSxHQUF3QixFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQVMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDO29CQUNuRixNQUFNLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO29CQUN6QixLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7b0JBQ3hCLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUM7Z0JBQzlCLENBQUM7Z0JBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFBLGVBQVEsRUFBQyxLQUFLLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUM1QyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBRTFCLGVBQWU7Z0JBQ2YsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUVmLE1BQU0sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBQSx1Q0FBbUIsRUFBQyxJQUFJLENBQUMsQ0FBQztnQkFFdEQsTUFBTSxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxJQUFXLENBQUMsQ0FBQztnQkFFbEQsTUFBTSxPQUFPLEdBQUcsSUFBQSx5QkFBaUIsRUFBQyxXQUFXLENBQUMsQ0FBQztnQkFDL0MsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdEMsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDckIsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FDSjtDQUNKLENBQUM7QUFFRixrQkFBZSxnQkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IEFzc2V0IH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0IHsgQW5pbWF0aW9uQ2xpcCB9IGZyb20gJ2NjJztcclxuaW1wb3J0IHsgcmVhZEZpbGUgfSBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCB7IGJhc2VuYW1lIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IHNlcmlhbGl6ZUZvckxpYnJhcnkgfSBmcm9tICcuL3V0aWxzL3NlcmlhbGl6ZS1saWJyYXJ5JztcclxuaW1wb3J0ICogYXMgY2MgZnJvbSAnY2MnO1xyXG5cclxuaW1wb3J0IHsgZ2V0RGVwZW5kVVVJRExpc3QgfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB7IEFzc2V0SGFuZGxlciB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBBbmltYXRpb25DbGlwQXNzZXRVc2VyRGF0YSB9IGZyb20gJy4uLy4uL0B0eXBlcy91c2VyRGF0YXMnO1xyXG5cclxuY29uc3QgQW5pbWF0aW9uSGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICdhbmltYXRpb24tY2xpcCcsXHJcbiAgICAvLyDlvJXmk47lhoXlr7nlupTnmoTnsbvlnotcclxuICAgIGFzc2V0VHlwZTogJ2NjLkFuaW1hdGlvbkNsaXAnLFxyXG4gICAgY3JlYXRlSW5mbzoge1xyXG4gICAgICAgIGdlbmVyYXRlTWVudUluZm8oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdpMThuOkVOR0lORS5hc3NldHMubmV3QW5pbWF0aW9uJyxcclxuICAgICAgICAgICAgICAgICAgICBmdWxsRmlsZU5hbWU6ICdhbmltYXRpb24uYW5pbScsXHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IGBkYjovL2ludGVybmFsL2RlZmF1bHRfZmlsZV9jb250ZW50LyR7QW5pbWF0aW9uSGFuZGxlci5uYW1lfS9kZWZhdWx0LmFuaW1gLFxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwOiAnYW5pbWF0aW9uJyxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZGVmYXVsdCcsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICAvLyDniYjmnKzlj7flpoLmnpzlj5jmm7TvvIzliJnkvJrlvLrliLbph43mlrDlr7zlhaVcclxuICAgICAgICB2ZXJzaW9uOiAnMi4wLjQnLFxyXG4gICAgICAgIHZlcnNpb25Db2RlOiAyLFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlpoLmnpzmlLnlkI3lsLHlvLrliLbliLfmlrBcclxuICAgICAgICAgKiBAcGFyYW0gYXNzZXRcclxuICAgICAgICAgKi9cclxuICAgICAgICBhc3luYyBmb3JjZShhc3NldDogQXNzZXQpIHtcclxuICAgICAgICAgICAgY29uc3QgdXNlckRhdGEgPSBhc3NldC51c2VyRGF0YSBhcyBBbmltYXRpb25DbGlwQXNzZXRVc2VyRGF0YTtcclxuICAgICAgICAgICAgcmV0dXJuIHVzZXJEYXRhLm5hbWUgIT09IGFzc2V0LmJhc2VuYW1lO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWunumZheWvvOWFpea1geeoi1xyXG4gICAgICAgICAqIOmcgOimgeiHquW3seaOp+WItuaYr+WQpueUn+aIkOOAgeaLt+i0neaWh+S7tlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICog6L+U5Zue5piv5ZCm5a+85YWl5oiQ5Yqf55qE5qCH6K6wXHJcbiAgICAgICAgICog5aaC5p6c6L+U5ZueIGZhbHNl77yM5YiZIGltcG9ydGVkIOagh+iusOS4jeS8muWPmOaIkCB0cnVlXHJcbiAgICAgICAgICog5ZCO57ut55qE5LiA57O75YiX5pON5L2c6YO95LiN5Lya5omn6KGMXHJcbiAgICAgICAgICogQHBhcmFtIGFzc2V0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXN5bmMgaW1wb3J0KGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgICAgICBjb25zdCB1c2VyRGF0YSA9IGFzc2V0LnVzZXJEYXRhIGFzIEFuaW1hdGlvbkNsaXBBc3NldFVzZXJEYXRhO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSBhd2FpdCByZWFkRmlsZShhc3NldC5zb3VyY2UsICd1dGY4Jyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShmaWxlQ29udGVudCk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgZGV0YWlscyA9IGNjLmRlc2VyaWFsaXplLkRldGFpbHMucG9vbC5nZXQoKSE7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjbGlwID0gY2MuZGVzZXJpYWxpemUoanNvbiwgZGV0YWlscywgdW5kZWZpbmVkKSBhcyBBbmltYXRpb25DbGlwO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgblVVSURSZWZzID0gZGV0YWlscy51dWlkTGlzdCEubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuVVVJRFJlZnM7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHV1aWQgPSBkZXRhaWxzLnV1aWRMaXN0IVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1dWlkT2JqID0gZGV0YWlscy51dWlkT2JqTGlzdCFbaV0gYXMgYW55O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHV1aWRQcm9wID0gZGV0YWlscy51dWlkUHJvcExpc3QhW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHV1aWRUeXBlID0gZGV0YWlscy51dWlkVHlwZUxpc3RbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgVHlwZTogbmV3ICgpID0+IGNjLkFzc2V0ID0gKGNjLmpzLmdldENsYXNzQnlJZCh1dWlkVHlwZSkgYXMgYW55KSA/PyBjYy5Bc3NldDtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhc3NldCA9IG5ldyBUeXBlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXQuX3V1aWQgPSB1dWlkICsgJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgdXVpZE9ialt1dWlkUHJvcF0gPSBhc3NldDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjbGlwLm5hbWUgPSBiYXNlbmFtZShhc3NldC5zb3VyY2UsICcuYW5pbScpO1xyXG4gICAgICAgICAgICAgICAgdXNlckRhdGEubmFtZSA9IGNsaXAubmFtZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDb21wdXRlIGhhc2hcclxuICAgICAgICAgICAgICAgIHZvaWQgY2xpcC5oYXNoO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHsgZXh0ZW5zaW9uLCBkYXRhIH0gPSBzZXJpYWxpemVGb3JMaWJyYXJ5KGNsaXApO1xyXG5cclxuICAgICAgICAgICAgICAgIGF3YWl0IGFzc2V0LnNhdmVUb0xpYnJhcnkoZXh0ZW5zaW9uLCBkYXRhIGFzIGFueSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgZGVwZW5kcyA9IGdldERlcGVuZFVVSURMaXN0KGZpbGVDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBkZXBlbmRzKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFuaW1hdGlvbkhhbmRsZXI7XHJcbiJdfQ==