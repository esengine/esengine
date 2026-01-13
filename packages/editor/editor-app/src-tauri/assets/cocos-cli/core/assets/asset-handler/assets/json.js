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
exports.JsonHandler = void 0;
const fs_extra_1 = require("fs-extra");
const JSON5 = __importStar(require("json5"));
const cc_1 = require("cc");
exports.JsonHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'json',
    // 引擎内对应的类型
    assetType: 'cc.JsonAsset',
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '2.0.1',
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
            const json5Enabled = asset.userData.json5 ?? true;
            let json;
            if (json5Enabled) {
                const text = await (0, fs_extra_1.readFile)(asset.source, 'utf8');
                json = JSON5.parse(text);
            }
            else {
                json = await (0, fs_extra_1.readJSON)(asset.source);
            }
            const jsonAsset = new cc_1.JsonAsset();
            jsonAsset.name = asset.basename;
            jsonAsset.json = json;
            const serializeJSON = EditorExtends.serialize(jsonAsset);
            await asset.saveToLibrary('.json', serializeJSON);
            // 旧版本可能记录了错误的依赖数据，需要清空
            asset.setData('depends', []);
            return true;
        },
    },
};
exports.default = exports.JsonHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy9qc29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR2IsdUNBQThDO0FBQzlDLDZDQUErQjtBQUcvQiwyQkFBK0I7QUFHbEIsUUFBQSxXQUFXLEdBQWlCO0lBQ3JDLGdDQUFnQztJQUNoQyxJQUFJLEVBQUUsTUFBTTtJQUNaLFdBQVc7SUFDWCxTQUFTLEVBQUUsY0FBYztJQUV6QixRQUFRLEVBQUU7UUFDTixtQkFBbUI7UUFDbkIsT0FBTyxFQUFFLE9BQU87UUFFaEI7Ozs7Ozs7O1dBUUc7UUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQVk7WUFDckIsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDO1lBRWxELElBQUksSUFBYSxDQUFDO1lBQ2xCLElBQUksWUFBWSxFQUFFLENBQUM7Z0JBQ2YsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLG1CQUFRLEVBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0IsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLElBQUksR0FBRyxNQUFNLElBQUEsbUJBQVEsRUFBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEMsQ0FBQztZQUVELE1BQU0sU0FBUyxHQUFHLElBQUksY0FBUyxFQUFFLENBQUM7WUFDbEMsU0FBUyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQ2hDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsSUFBVyxDQUFDO1lBRTdCLE1BQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekQsTUFBTSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUVsRCx1QkFBdUI7WUFDdkIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFN0IsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztLQUNKO0NBQ0osQ0FBQztBQUVGLGtCQUFlLG1CQUFXLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBBc3NldCB9IGZyb20gJ0Bjb2Nvcy9hc3NldC1kYic7XHJcbmltcG9ydCB7IHJlYWRGaWxlLCByZWFkSlNPTiB9IGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0ICogYXMgSlNPTjUgZnJvbSAnanNvbjUnO1xyXG5cclxuaW1wb3J0IHsgZ2V0RGVwZW5kVVVJRExpc3QgfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB7IEpzb25Bc3NldCB9IGZyb20gJ2NjJztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcblxyXG5leHBvcnQgY29uc3QgSnNvbkhhbmRsZXI6IEFzc2V0SGFuZGxlciA9IHtcclxuICAgIC8vIEhhbmRsZXIg55qE5ZCN5a2X77yM55So5LqO5oyH5a6aIEhhbmRsZXIgYXMg562JXHJcbiAgICBuYW1lOiAnanNvbicsXHJcbiAgICAvLyDlvJXmk47lhoXlr7nlupTnmoTnsbvlnotcclxuICAgIGFzc2V0VHlwZTogJ2NjLkpzb25Bc3NldCcsXHJcblxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICAvLyDniYjmnKzlj7flpoLmnpzlj5jmm7TvvIzliJnkvJrlvLrliLbph43mlrDlr7zlhaVcclxuICAgICAgICB2ZXJzaW9uOiAnMi4wLjEnLFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlrp7pmYXlr7zlhaXmtYHnqItcclxuICAgICAgICAgKiDpnIDopoHoh6rlt7HmjqfliLbmmK/lkKbnlJ/miJDjgIHmi7fotJ3mlofku7ZcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIOi/lOWbnuaYr+WQpuWvvOWFpeaIkOWKn+eahOagh+iusFxyXG4gICAgICAgICAqIOWmguaenOi/lOWbniBmYWxzZe+8jOWImSBpbXBvcnRlZCDmoIforrDkuI3kvJrlj5jmiJAgdHJ1ZVxyXG4gICAgICAgICAqIOWQjue7reeahOS4gOezu+WIl+aTjeS9nOmDveS4jeS8muaJp+ihjFxyXG4gICAgICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFzeW5jIGltcG9ydChhc3NldDogQXNzZXQpIHtcclxuICAgICAgICAgICAgY29uc3QganNvbjVFbmFibGVkID0gYXNzZXQudXNlckRhdGEuanNvbjUgPz8gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIGxldCBqc29uOiB1bmtub3duO1xyXG4gICAgICAgICAgICBpZiAoanNvbjVFbmFibGVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVhZEZpbGUoYXNzZXQuc291cmNlLCAndXRmOCcpO1xyXG4gICAgICAgICAgICAgICAganNvbiA9IEpTT041LnBhcnNlKHRleHQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAganNvbiA9IGF3YWl0IHJlYWRKU09OKGFzc2V0LnNvdXJjZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGpzb25Bc3NldCA9IG5ldyBKc29uQXNzZXQoKTtcclxuICAgICAgICAgICAganNvbkFzc2V0Lm5hbWUgPSBhc3NldC5iYXNlbmFtZTtcclxuICAgICAgICAgICAganNvbkFzc2V0Lmpzb24gPSBqc29uIGFzIGFueTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZUpTT04gPSBFZGl0b3JFeHRlbmRzLnNlcmlhbGl6ZShqc29uQXNzZXQpO1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldC5zYXZlVG9MaWJyYXJ5KCcuanNvbicsIHNlcmlhbGl6ZUpTT04pO1xyXG5cclxuICAgICAgICAgICAgLy8g5pen54mI5pys5Y+v6IO96K6w5b2V5LqG6ZSZ6K+v55qE5L6d6LWW5pWw5o2u77yM6ZyA6KaB5riF56m6XHJcbiAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBbXSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEpzb25IYW5kbGVyO1xyXG4iXX0=