'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhysicsMaterialHandler = void 0;
exports.PhysicsMaterialHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'physics-material',
    // 引擎内对应的类型
    assetType: 'cc.PhysicsMaterial',
    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: 'i18n:ENGINE.assets.newPhysicsMaterial',
                    fullFileName: 'physics-material.pmtl',
                    template: 'db://internal/default_file_content/physics-material/default.pmtl',
                    group: 'material',
                    name: 'default',
                },
            ];
        },
    },
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.1',
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
            await asset.copyToLibrary('.json', asset.source);
            return true;
        },
    },
};
exports.default = exports.PhysicsMaterialHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGh5c2ljcy1tYXRlcmlhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy9waHlzaWNzLW1hdGVyaWFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBS0EsUUFBQSxzQkFBc0IsR0FBaUI7SUFDaEQsZ0NBQWdDO0lBQ2hDLElBQUksRUFBRSxrQkFBa0I7SUFFeEIsV0FBVztJQUNYLFNBQVMsRUFBRSxvQkFBb0I7SUFDL0IsVUFBVSxFQUFFO1FBQ1IsZ0JBQWdCO1lBQ1osT0FBTztnQkFDSDtvQkFDSSxLQUFLLEVBQUUsdUNBQXVDO29CQUM5QyxZQUFZLEVBQUUsdUJBQXVCO29CQUNyQyxRQUFRLEVBQUUsa0VBQWtFO29CQUM1RSxLQUFLLEVBQUUsVUFBVTtvQkFDakIsSUFBSSxFQUFFLFNBQVM7aUJBQ2xCO2FBQ0osQ0FBQztRQUNOLENBQUM7S0FDSjtJQUVELFFBQVEsRUFBRTtRQUNOLG1CQUFtQjtRQUNuQixPQUFPLEVBQUUsT0FBTztRQUVoQjs7Ozs7Ozs7V0FRRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBWTtZQUNyQixNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqRCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0tBQ0o7Q0FDSixDQUFDO0FBRUYsa0JBQWUsOEJBQXNCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBBc3NldCB9IGZyb20gJ0Bjb2Nvcy9hc3NldC1kYic7XHJcbmltcG9ydCB7IEFzc2V0SGFuZGxlciB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBoeXNpY3NNYXRlcmlhbEhhbmRsZXI6IEFzc2V0SGFuZGxlciA9IHtcclxuICAgIC8vIEhhbmRsZXIg55qE5ZCN5a2X77yM55So5LqO5oyH5a6aIEhhbmRsZXIgYXMg562JXHJcbiAgICBuYW1lOiAncGh5c2ljcy1tYXRlcmlhbCcsXHJcblxyXG4gICAgLy8g5byV5pOO5YaF5a+55bqU55qE57G75Z6LXHJcbiAgICBhc3NldFR5cGU6ICdjYy5QaHlzaWNzTWF0ZXJpYWwnLFxyXG4gICAgY3JlYXRlSW5mbzoge1xyXG4gICAgICAgIGdlbmVyYXRlTWVudUluZm8oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdpMThuOkVOR0lORS5hc3NldHMubmV3UGh5c2ljc01hdGVyaWFsJyxcclxuICAgICAgICAgICAgICAgICAgICBmdWxsRmlsZU5hbWU6ICdwaHlzaWNzLW1hdGVyaWFsLnBtdGwnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnZGI6Ly9pbnRlcm5hbC9kZWZhdWx0X2ZpbGVfY29udGVudC9waHlzaWNzLW1hdGVyaWFsL2RlZmF1bHQucG10bCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXA6ICdtYXRlcmlhbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2RlZmF1bHQnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuXHJcbiAgICBpbXBvcnRlcjoge1xyXG4gICAgICAgIC8vIOeJiOacrOWPt+WmguaenOWPmOabtO+8jOWImeS8muW8uuWItumHjeaWsOWvvOWFpVxyXG4gICAgICAgIHZlcnNpb246ICcxLjAuMScsXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWunumZheWvvOWFpea1geeoi1xyXG4gICAgICAgICAqIOmcgOimgeiHquW3seaOp+WItuaYr+WQpueUn+aIkOOAgeaLt+i0neaWh+S7tlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICog6L+U5Zue5piv5ZCm5a+85YWl5oiQ5Yqf55qE5qCH6K6wXHJcbiAgICAgICAgICog5aaC5p6c6L+U5ZueIGZhbHNl77yM5YiZIGltcG9ydGVkIOagh+iusOS4jeS8muWPmOaIkCB0cnVlXHJcbiAgICAgICAgICog5ZCO57ut55qE5LiA57O75YiX5pON5L2c6YO95LiN5Lya5omn6KGMXHJcbiAgICAgICAgICogQHBhcmFtIGFzc2V0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXN5bmMgaW1wb3J0KGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldC5jb3B5VG9MaWJyYXJ5KCcuanNvbicsIGFzc2V0LnNvdXJjZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGh5c2ljc01hdGVyaWFsSGFuZGxlcjtcclxuIl19