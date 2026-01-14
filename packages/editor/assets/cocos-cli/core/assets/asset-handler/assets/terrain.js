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
exports.TerrainHandler = void 0;
const fs = __importStar(require("fs-extra"));
const index_1 = require("./scene/index");
const cc_1 = require("cc");
const utils_1 = require("../utils");
exports.TerrainHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'terrain',
    // 引擎内对应的类型
    assetType: 'cc.TerrainAsset',
    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: 'i18n:ENGINE.assets.newTerrain',
                    fullFileName: 'terrain.terrain',
                    template: `db://internal/default_file_content/${exports.TerrainHandler.name}/default.terrain`,
                    name: 'default',
                },
            ];
        },
    },
    importer: {
        version: index_1.version,
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
            await asset.copyToLibrary('.bin', asset.source);
            const terrainAsset = new cc_1.TerrainAsset();
            if (terrainAsset._loadNativeData(new Uint8Array(fs.readFileSync(asset.source)))) {
                terrainAsset.layerInfos.length = terrainAsset.layerBinaryInfos.length;
                for (let i = 0; i < terrainAsset.layerInfos.length; ++i) {
                    const binaryLayer = terrainAsset.layerBinaryInfos[i];
                    const layer = new cc_1.TerrainLayerInfo();
                    layer.slot = binaryLayer.slot;
                    layer.tileSize = binaryLayer.tileSize;
                    if (binaryLayer.detailMapId && binaryLayer.detailMapId != '') {
                        // @ts-ignore
                        layer.detailMap = EditorExtends.serialize.asAsset(binaryLayer.detailMapId, cc_1.Texture2D);
                    }
                    if (binaryLayer.normalMapId && binaryLayer.normalMapId != '') {
                        // @ts-ignore
                        layer.normalMap = EditorExtends.serialize.asAsset(binaryLayer.normalMapId, cc_1.Texture2D);
                    }
                    layer.metallic = binaryLayer.metallic;
                    layer.roughness = binaryLayer.roughness;
                    terrainAsset.layerInfos[i] = layer;
                }
            }
            terrainAsset.name = asset.basename;
            terrainAsset._setRawAsset('.bin');
            const serializeJSON = EditorExtends.serialize(terrainAsset);
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            return true;
        },
    },
};
exports.default = exports.TerrainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVycmFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy90ZXJyYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRWIsNkNBQStCO0FBRS9CLHlDQUF3QztBQUN4QywyQkFBK0Q7QUFFL0Qsb0NBQTZDO0FBR2hDLFFBQUEsY0FBYyxHQUFpQjtJQUN4QyxnQ0FBZ0M7SUFDaEMsSUFBSSxFQUFFLFNBQVM7SUFDZixXQUFXO0lBQ1gsU0FBUyxFQUFFLGlCQUFpQjtJQUM1QixVQUFVLEVBQUU7UUFDUixnQkFBZ0I7WUFDWixPQUFPO2dCQUNIO29CQUNJLEtBQUssRUFBRSwrQkFBK0I7b0JBQ3RDLFlBQVksRUFBRSxpQkFBaUI7b0JBQy9CLFFBQVEsRUFBRSxzQ0FBc0Msc0JBQWMsQ0FBQyxJQUFJLGtCQUFrQjtvQkFDckYsSUFBSSxFQUFFLFNBQVM7aUJBQ2xCO2FBQ0osQ0FBQztRQUNOLENBQUM7S0FDSjtJQUVELFFBQVEsRUFBRTtRQUNOLE9BQU8sRUFBUCxlQUFPO1FBRVA7Ozs7Ozs7O1dBUUc7UUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQVk7WUFDckIsTUFBTSxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFaEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxpQkFBWSxFQUFFLENBQUM7WUFDeEMsSUFBSSxZQUFZLENBQUMsZUFBZSxDQUFDLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUM5RSxZQUFZLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO2dCQUN0RSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztvQkFDdEQsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyRCxNQUFNLEtBQUssR0FBRyxJQUFJLHFCQUFnQixFQUFFLENBQUM7b0JBQ3JDLEtBQUssQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztvQkFDOUIsS0FBSyxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDO29CQUN0QyxJQUFJLFdBQVcsQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLFdBQVcsSUFBSSxFQUFFLEVBQUUsQ0FBQzt3QkFDM0QsYUFBYTt3QkFDYixLQUFLLENBQUMsU0FBUyxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsY0FBUyxDQUFDLENBQUM7b0JBQzFGLENBQUM7b0JBQ0QsSUFBSSxXQUFXLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxXQUFXLElBQUksRUFBRSxFQUFFLENBQUM7d0JBQzNELGFBQWE7d0JBQ2IsS0FBSyxDQUFDLFNBQVMsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLGNBQVMsQ0FBQyxDQUFDO29CQUMxRixDQUFDO29CQUNELEtBQUssQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQztvQkFDdEMsS0FBSyxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDO29CQUN4QyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDdkMsQ0FBQztZQUNMLENBQUM7WUFFRCxZQUFZLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7WUFDbkMsWUFBWSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVsQyxNQUFNLGFBQWEsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzVELE1BQU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFFbEQsTUFBTSxPQUFPLEdBQUcsSUFBQSx5QkFBaUIsRUFBQyxhQUFhLENBQUMsQ0FBQztZQUNqRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVsQyxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0tBQ0o7Q0FDSixDQUFDO0FBRUYsa0JBQWUsc0JBQWMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHsgQXNzZXQgfSBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5pbXBvcnQgeyB2ZXJzaW9uIH0gZnJvbSAnLi9zY2VuZS9pbmRleCc7XHJcbmltcG9ydCB7IFRlcnJhaW5Bc3NldCwgVGVycmFpbkxheWVySW5mbywgVGV4dHVyZTJEIH0gZnJvbSAnY2MnO1xyXG5cclxuaW1wb3J0IHsgZ2V0RGVwZW5kVVVJRExpc3QgfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB7IEFzc2V0SGFuZGxlciB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5cclxuZXhwb3J0IGNvbnN0IFRlcnJhaW5IYW5kbGVyOiBBc3NldEhhbmRsZXIgPSB7XHJcbiAgICAvLyBIYW5kbGVyIOeahOWQjeWtl++8jOeUqOS6juaMh+WumiBIYW5kbGVyIGFzIOetiVxyXG4gICAgbmFtZTogJ3RlcnJhaW4nLFxyXG4gICAgLy8g5byV5pOO5YaF5a+55bqU55qE57G75Z6LXHJcbiAgICBhc3NldFR5cGU6ICdjYy5UZXJyYWluQXNzZXQnLFxyXG4gICAgY3JlYXRlSW5mbzoge1xyXG4gICAgICAgIGdlbmVyYXRlTWVudUluZm8oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdpMThuOkVOR0lORS5hc3NldHMubmV3VGVycmFpbicsXHJcbiAgICAgICAgICAgICAgICAgICAgZnVsbEZpbGVOYW1lOiAndGVycmFpbi50ZXJyYWluJyxcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogYGRiOi8vaW50ZXJuYWwvZGVmYXVsdF9maWxlX2NvbnRlbnQvJHtUZXJyYWluSGFuZGxlci5uYW1lfS9kZWZhdWx0LnRlcnJhaW5gLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdkZWZhdWx0JyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICB2ZXJzaW9uLFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlrp7pmYXlr7zlhaXmtYHnqItcclxuICAgICAgICAgKiDpnIDopoHoh6rlt7HmjqfliLbmmK/lkKbnlJ/miJDjgIHmi7fotJ3mlofku7ZcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIOi/lOWbnuaYr+WQpuWvvOWFpeaIkOWKn+eahOagh+iusFxyXG4gICAgICAgICAqIOWmguaenOi/lOWbniBmYWxzZe+8jOWImSBpbXBvcnRlZCDmoIforrDkuI3kvJrlj5jmiJAgdHJ1ZVxyXG4gICAgICAgICAqIOWQjue7reeahOS4gOezu+WIl+aTjeS9nOmDveS4jeS8muaJp+ihjFxyXG4gICAgICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFzeW5jIGltcG9ydChhc3NldDogQXNzZXQpIHtcclxuICAgICAgICAgICAgYXdhaXQgYXNzZXQuY29weVRvTGlicmFyeSgnLmJpbicsIGFzc2V0LnNvdXJjZSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB0ZXJyYWluQXNzZXQgPSBuZXcgVGVycmFpbkFzc2V0KCk7XHJcbiAgICAgICAgICAgIGlmICh0ZXJyYWluQXNzZXQuX2xvYWROYXRpdmVEYXRhKG5ldyBVaW50OEFycmF5KGZzLnJlYWRGaWxlU3luYyhhc3NldC5zb3VyY2UpKSkpIHtcclxuICAgICAgICAgICAgICAgIHRlcnJhaW5Bc3NldC5sYXllckluZm9zLmxlbmd0aCA9IHRlcnJhaW5Bc3NldC5sYXllckJpbmFyeUluZm9zLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGVycmFpbkFzc2V0LmxheWVySW5mb3MubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBiaW5hcnlMYXllciA9IHRlcnJhaW5Bc3NldC5sYXllckJpbmFyeUluZm9zW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxheWVyID0gbmV3IFRlcnJhaW5MYXllckluZm8oKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXllci5zbG90ID0gYmluYXJ5TGF5ZXIuc2xvdDtcclxuICAgICAgICAgICAgICAgICAgICBsYXllci50aWxlU2l6ZSA9IGJpbmFyeUxheWVyLnRpbGVTaXplO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChiaW5hcnlMYXllci5kZXRhaWxNYXBJZCAmJiBiaW5hcnlMYXllci5kZXRhaWxNYXBJZCAhPSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLmRldGFpbE1hcCA9IEVkaXRvckV4dGVuZHMuc2VyaWFsaXplLmFzQXNzZXQoYmluYXJ5TGF5ZXIuZGV0YWlsTWFwSWQsIFRleHR1cmUyRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChiaW5hcnlMYXllci5ub3JtYWxNYXBJZCAmJiBiaW5hcnlMYXllci5ub3JtYWxNYXBJZCAhPSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLm5vcm1hbE1hcCA9IEVkaXRvckV4dGVuZHMuc2VyaWFsaXplLmFzQXNzZXQoYmluYXJ5TGF5ZXIubm9ybWFsTWFwSWQsIFRleHR1cmUyRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxheWVyLm1ldGFsbGljID0gYmluYXJ5TGF5ZXIubWV0YWxsaWM7XHJcbiAgICAgICAgICAgICAgICAgICAgbGF5ZXIucm91Z2huZXNzID0gYmluYXJ5TGF5ZXIucm91Z2huZXNzO1xyXG4gICAgICAgICAgICAgICAgICAgIHRlcnJhaW5Bc3NldC5sYXllckluZm9zW2ldID0gbGF5ZXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRlcnJhaW5Bc3NldC5uYW1lID0gYXNzZXQuYmFzZW5hbWU7XHJcbiAgICAgICAgICAgIHRlcnJhaW5Bc3NldC5fc2V0UmF3QXNzZXQoJy5iaW4nKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZUpTT04gPSBFZGl0b3JFeHRlbmRzLnNlcmlhbGl6ZSh0ZXJyYWluQXNzZXQpO1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldC5zYXZlVG9MaWJyYXJ5KCcuanNvbicsIHNlcmlhbGl6ZUpTT04pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZGVwZW5kcyA9IGdldERlcGVuZFVVSURMaXN0KHNlcmlhbGl6ZUpTT04pO1xyXG4gICAgICAgICAgICBhc3NldC5zZXREYXRhKCdkZXBlbmRzJywgZGVwZW5kcyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRlcnJhaW5IYW5kbGVyO1xyXG4iXX0=