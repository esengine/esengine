'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownHandler = void 0;
const asset_db_1 = require("@cocos/asset-db");
const cc_1 = require("cc");
const utils_1 = require("../utils");
exports.UnknownHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: '*',
    // 引擎内对应的类型
    assetType: 'cc.Asset',
    iconInfo: {
        default: {
            type: 'icon',
            value: 'file',
        },
        generateThumbnail(asset) {
            let val = 'file';
            switch (asset.extname) {
                case '.zip':
                    val = 'zip';
                    break;
                case '.html':
                    val = 'html5';
                    break;
                case '.bin':
                    val = 'bin';
                    break;
                case '.svg':
                    val = 'svg';
                    break;
            }
            return {
                type: 'icon',
                value: val,
            };
        },
    },
    async open() {
        return false;
    },
    /**
     * 检查文件是否适用于这个 Handler
     * @param asset
     */
    async validate(asset) {
        return !asset.isDirectory();
    },
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.0',
        /**
         * 实际导入流程
         *
         * 返回是否导入成功的标记
         * 如果返回 false，则 imported 标记不会变成 true
         * 后续的一系列操作都不会执行
         * @param asset
         */
        async import(asset) {
            // 虚拟的未知类型资源不做处理
            if (!(asset instanceof asset_db_1.Asset)) {
                return true;
            }
            // 如果当前资源没有导入，则开始导入当前资源
            await asset.copyToLibrary(asset.extname, asset.source);
            const unknowAsset = new cc_1.Asset();
            unknowAsset.name = asset.basename;
            // @ts-ignore
            unknowAsset._setRawAsset(asset.extname);
            const serializeJSON = EditorExtends.serialize(unknowAsset);
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            return true;
        },
    },
};
exports.default = exports.UnknownHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5rbm93bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy91bmtub3duLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsOENBQXNEO0FBQ3RELDJCQUFzQztBQUV0QyxvQ0FBNkM7QUFHaEMsUUFBQSxjQUFjLEdBQWlCO0lBQ3hDLGdDQUFnQztJQUNoQyxJQUFJLEVBQUUsR0FBRztJQUVULFdBQVc7SUFDWCxTQUFTLEVBQUUsVUFBVTtJQUVyQixRQUFRLEVBQUU7UUFDTixPQUFPLEVBQUU7WUFDTCxJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxNQUFNO1NBQ2hCO1FBQ0QsaUJBQWlCLENBQUMsS0FBWTtZQUMxQixJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUM7WUFDakIsUUFBUSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3BCLEtBQUssTUFBTTtvQkFDUCxHQUFHLEdBQUcsS0FBSyxDQUFDO29CQUNaLE1BQU07Z0JBQ1YsS0FBSyxPQUFPO29CQUNSLEdBQUcsR0FBRyxPQUFPLENBQUM7b0JBQ2QsTUFBTTtnQkFDVixLQUFLLE1BQU07b0JBQ1AsR0FBRyxHQUFHLEtBQUssQ0FBQztvQkFDWixNQUFNO2dCQUNWLEtBQUssTUFBTTtvQkFDUCxHQUFHLEdBQUcsS0FBSyxDQUFDO29CQUNaLE1BQU07WUFDZCxDQUFDO1lBQ0QsT0FBTztnQkFDSCxJQUFJLEVBQUUsTUFBTTtnQkFDWixLQUFLLEVBQUUsR0FBRzthQUNiLENBQUM7UUFDTixDQUFDO0tBQ0o7SUFFRCxLQUFLLENBQUMsSUFBSTtRQUVOLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQTJCO1FBQ3RDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELFFBQVEsRUFBRTtRQUNOLG1CQUFtQjtRQUNuQixPQUFPLEVBQUUsT0FBTztRQUNoQjs7Ozs7OztXQU9HO1FBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFZO1lBQ3JCLGdCQUFnQjtZQUNoQixJQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksZ0JBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzVCLE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFFRCx1QkFBdUI7WUFDdkIsTUFBTSxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXZELE1BQU0sV0FBVyxHQUFHLElBQUksVUFBTyxFQUFFLENBQUM7WUFDbEMsV0FBVyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQ2xDLGFBQWE7WUFDYixXQUFXLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV4QyxNQUFNLGFBQWEsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNELE1BQU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFFbEQsTUFBTSxPQUFPLEdBQUcsSUFBQSx5QkFBaUIsRUFBQyxhQUFhLENBQUMsQ0FBQztZQUNqRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVsQyxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0tBQ0o7Q0FDSixDQUFDO0FBRUYsa0JBQWUsc0JBQWMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IEFzc2V0LCBWaXJ0dWFsQXNzZXQgfSBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5pbXBvcnQgeyBBc3NldCBhcyBjY0Fzc2V0IH0gZnJvbSAnY2MnO1xyXG5cclxuaW1wb3J0IHsgZ2V0RGVwZW5kVVVJRExpc3QgfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB7IEFzc2V0SGFuZGxlciB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5cclxuZXhwb3J0IGNvbnN0IFVua25vd25IYW5kbGVyOiBBc3NldEhhbmRsZXIgPSB7XHJcbiAgICAvLyBIYW5kbGVyIOeahOWQjeWtl++8jOeUqOS6juaMh+WumiBIYW5kbGVyIGFzIOetiVxyXG4gICAgbmFtZTogJyonLFxyXG5cclxuICAgIC8vIOW8leaTjuWGheWvueW6lOeahOexu+Wei1xyXG4gICAgYXNzZXRUeXBlOiAnY2MuQXNzZXQnLFxyXG5cclxuICAgIGljb25JbmZvOiB7XHJcbiAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICB0eXBlOiAnaWNvbicsXHJcbiAgICAgICAgICAgIHZhbHVlOiAnZmlsZScsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZW5lcmF0ZVRodW1ibmFpbChhc3NldDogQXNzZXQpIHtcclxuICAgICAgICAgICAgbGV0IHZhbCA9ICdmaWxlJztcclxuICAgICAgICAgICAgc3dpdGNoIChhc3NldC5leHRuYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICcuemlwJzpcclxuICAgICAgICAgICAgICAgICAgICB2YWwgPSAnemlwJztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJy5odG1sJzpcclxuICAgICAgICAgICAgICAgICAgICB2YWwgPSAnaHRtbDUnO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnLmJpbic6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsID0gJ2Jpbic7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICcuc3ZnJzpcclxuICAgICAgICAgICAgICAgICAgICB2YWwgPSAnc3ZnJztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2ljb24nLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuXHJcbiAgICBhc3luYyBvcGVuKCkge1xyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qOA5p+l5paH5Lu25piv5ZCm6YCC55So5LqO6L+Z5LiqIEhhbmRsZXJcclxuICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICovXHJcbiAgICBhc3luYyB2YWxpZGF0ZShhc3NldDogVmlydHVhbEFzc2V0IHwgQXNzZXQpIHtcclxuICAgICAgICByZXR1cm4gIWFzc2V0LmlzRGlyZWN0b3J5KCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGltcG9ydGVyOiB7XHJcbiAgICAgICAgLy8g54mI5pys5Y+35aaC5p6c5Y+Y5pu077yM5YiZ5Lya5by65Yi26YeN5paw5a+85YWlXHJcbiAgICAgICAgdmVyc2lvbjogJzEuMC4wJyxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlrp7pmYXlr7zlhaXmtYHnqItcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIOi/lOWbnuaYr+WQpuWvvOWFpeaIkOWKn+eahOagh+iusFxyXG4gICAgICAgICAqIOWmguaenOi/lOWbniBmYWxzZe+8jOWImSBpbXBvcnRlZCDmoIforrDkuI3kvJrlj5jmiJAgdHJ1ZVxyXG4gICAgICAgICAqIOWQjue7reeahOS4gOezu+WIl+aTjeS9nOmDveS4jeS8muaJp+ihjFxyXG4gICAgICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFzeW5jIGltcG9ydChhc3NldDogQXNzZXQpIHtcclxuICAgICAgICAgICAgLy8g6Jma5ouf55qE5pyq55+l57G75Z6L6LWE5rqQ5LiN5YGa5aSE55CGXHJcbiAgICAgICAgICAgIGlmICghKGFzc2V0IGluc3RhbmNlb2YgQXNzZXQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8g5aaC5p6c5b2T5YmN6LWE5rqQ5rKh5pyJ5a+85YWl77yM5YiZ5byA5aeL5a+85YWl5b2T5YmN6LWE5rqQXHJcbiAgICAgICAgICAgIGF3YWl0IGFzc2V0LmNvcHlUb0xpYnJhcnkoYXNzZXQuZXh0bmFtZSwgYXNzZXQuc291cmNlKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHVua25vd0Fzc2V0ID0gbmV3IGNjQXNzZXQoKTtcclxuICAgICAgICAgICAgdW5rbm93QXNzZXQubmFtZSA9IGFzc2V0LmJhc2VuYW1lO1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIHVua25vd0Fzc2V0Ll9zZXRSYXdBc3NldChhc3NldC5leHRuYW1lKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZUpTT04gPSBFZGl0b3JFeHRlbmRzLnNlcmlhbGl6ZSh1bmtub3dBc3NldCk7XHJcbiAgICAgICAgICAgIGF3YWl0IGFzc2V0LnNhdmVUb0xpYnJhcnkoJy5qc29uJywgc2VyaWFsaXplSlNPTik7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRzID0gZ2V0RGVwZW5kVVVJRExpc3Qoc2VyaWFsaXplSlNPTik7XHJcbiAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBkZXBlbmRzKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVW5rbm93bkhhbmRsZXI7XHJcbiJdfQ==