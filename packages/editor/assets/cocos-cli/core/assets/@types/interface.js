"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TangentImportSetting = exports.NormalImportSetting = exports.SUPPORT_CREATE_TYPES = exports.ASSET_HANDLER_TYPES = void 0;
// 记录一些会在运行时使用的类型常量，确保编译后可用
/** 所有资源处理器类型的常量数组（用于 Zod enum 和 TypeScript type） */
exports.ASSET_HANDLER_TYPES = [
    'directory',
    'unknown',
    'text',
    'json',
    'spine-data',
    'dragonbones',
    'dragonbones-atlas',
    'terrain',
    'javascript',
    'typescript',
    'scene',
    'prefab',
    'sprite-frame',
    'tiled-map',
    'buffer',
    'image',
    'sign-image',
    'alpha-image',
    'texture',
    'texture-cube',
    'erp-texture-cube',
    'render-texture',
    'texture-cube-face',
    'rt-sprite-frame',
    'gltf',
    'gltf-mesh',
    'gltf-animation',
    'gltf-skeleton',
    'gltf-material',
    'gltf-scene',
    'gltf-embeded-image',
    'fbx',
    'material',
    'physics-material',
    'effect',
    'effect-header',
    'audio-clip',
    'animation-clip',
    'animation-graph',
    'animation-graph-variant',
    'animation-mask',
    'ttf-font',
    'bitmap-font',
    'particle',
    'sprite-atlas',
    'auto-atlas',
    'label-atlas',
    'render-pipeline',
    'render-stage',
    'render-flow',
    'instantiation-material',
    'instantiation-mesh',
    'instantiation-skeleton',
    'instantiation-animation',
    'video-clip',
    '*',
    'database',
];
/** 支持创建的资源类型常量数组（用于 Zod enum 和 TypeScript type） */
exports.SUPPORT_CREATE_TYPES = [
    'animation-clip', // 动画剪辑
    'typescript', // TypeScript 脚本
    'auto-atlas', // 自动图集
    'effect', // 着色器效果
    'scene', // 场景
    'prefab', // 预制体
    'material', // 材质
    // 'texture-cube',            // 立方体贴图
    'terrain', // 地形
    'physics-material', // 物理材质
    'label-atlas', // 标签图集
    'render-texture', // 渲染纹理
    // 'animation-graph',         // 动画图
    // 'animation-mask',          // 动画遮罩
    // 'animation-graph-variant', // 动画图变体
    'directory', // 文件夹
    'effect-header', // 着色器头文件（chunk）
];
var NormalImportSetting;
(function (NormalImportSetting) {
    /**
     * 如果模型文件中包含法线信息则导出法线，否则不导出法线。
     */
    NormalImportSetting[NormalImportSetting["optional"] = 0] = "optional";
    /**
     * 不在导出的网格中包含法线信息。
     */
    NormalImportSetting[NormalImportSetting["exclude"] = 1] = "exclude";
    /**
     * 如果模型文件中包含法线信息则导出法线，否则重新计算并导出法线。
     */
    NormalImportSetting[NormalImportSetting["require"] = 2] = "require";
    /**
     * 不管模型文件中是否包含法线信息，直接重新计算并导出法线。
     */
    NormalImportSetting[NormalImportSetting["recalculate"] = 3] = "recalculate";
})(NormalImportSetting || (exports.NormalImportSetting = NormalImportSetting = {}));
var TangentImportSetting;
(function (TangentImportSetting) {
    /**
     * 不在导出的网格中包含正切信息。
     */
    TangentImportSetting[TangentImportSetting["exclude"] = 0] = "exclude";
    /**
     * 如果模型文件中包含正切信息则导出正切，否则不导出正切。
     */
    TangentImportSetting[TangentImportSetting["optional"] = 1] = "optional";
    /**
     * 如果模型文件中包含正切信息则导出正切，否则若纹理坐标存在则重新计算并导出正切。
     */
    TangentImportSetting[TangentImportSetting["require"] = 2] = "require";
    /**
     * 不管模型文件中是否包含正切信息，直接重新计算并导出正切。
     */
    TangentImportSetting[TangentImportSetting["recalculate"] = 3] = "recalculate";
})(TangentImportSetting || (exports.TangentImportSetting = TangentImportSetting = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJmYWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL0B0eXBlcy9pbnRlcmZhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkJBQTJCO0FBQzNCLG9EQUFvRDtBQUN2QyxRQUFBLG1CQUFtQixHQUFHO0lBQy9CLFdBQVc7SUFDWCxTQUFTO0lBQ1QsTUFBTTtJQUNOLE1BQU07SUFDTixZQUFZO0lBQ1osYUFBYTtJQUNiLG1CQUFtQjtJQUNuQixTQUFTO0lBQ1QsWUFBWTtJQUNaLFlBQVk7SUFDWixPQUFPO0lBQ1AsUUFBUTtJQUNSLGNBQWM7SUFDZCxXQUFXO0lBQ1gsUUFBUTtJQUNSLE9BQU87SUFDUCxZQUFZO0lBQ1osYUFBYTtJQUNiLFNBQVM7SUFDVCxjQUFjO0lBQ2Qsa0JBQWtCO0lBQ2xCLGdCQUFnQjtJQUNoQixtQkFBbUI7SUFDbkIsaUJBQWlCO0lBQ2pCLE1BQU07SUFDTixXQUFXO0lBQ1gsZ0JBQWdCO0lBQ2hCLGVBQWU7SUFDZixlQUFlO0lBQ2YsWUFBWTtJQUNaLG9CQUFvQjtJQUNwQixLQUFLO0lBQ0wsVUFBVTtJQUNWLGtCQUFrQjtJQUNsQixRQUFRO0lBQ1IsZUFBZTtJQUNmLFlBQVk7SUFDWixnQkFBZ0I7SUFDaEIsaUJBQWlCO0lBQ2pCLHlCQUF5QjtJQUN6QixnQkFBZ0I7SUFDaEIsVUFBVTtJQUNWLGFBQWE7SUFDYixVQUFVO0lBQ1YsY0FBYztJQUNkLFlBQVk7SUFDWixhQUFhO0lBQ2IsaUJBQWlCO0lBQ2pCLGNBQWM7SUFDZCxhQUFhO0lBQ2Isd0JBQXdCO0lBQ3hCLG9CQUFvQjtJQUNwQix3QkFBd0I7SUFDeEIseUJBQXlCO0lBQ3pCLFlBQVk7SUFDWixHQUFHO0lBQ0gsVUFBVTtDQUNiLENBQUM7QUFFRixtREFBbUQ7QUFDdEMsUUFBQSxvQkFBb0IsR0FBRztJQUNoQyxnQkFBZ0IsRUFBVyxPQUFPO0lBQ2xDLFlBQVksRUFBZSxnQkFBZ0I7SUFDM0MsWUFBWSxFQUFlLE9BQU87SUFDbEMsUUFBUSxFQUFtQixRQUFRO0lBQ25DLE9BQU8sRUFBb0IsS0FBSztJQUNoQyxRQUFRLEVBQW1CLE1BQU07SUFDakMsVUFBVSxFQUFpQixLQUFLO0lBQ2hDLHNDQUFzQztJQUN0QyxTQUFTLEVBQWtCLEtBQUs7SUFDaEMsa0JBQWtCLEVBQVMsT0FBTztJQUNsQyxhQUFhLEVBQWMsT0FBTztJQUNsQyxnQkFBZ0IsRUFBVyxPQUFPO0lBQ2xDLG9DQUFvQztJQUNwQyxxQ0FBcUM7SUFDckMsc0NBQXNDO0lBQ3RDLFdBQVcsRUFBZ0IsTUFBTTtJQUNqQyxlQUFlLEVBQVksZ0JBQWdCO0NBQ3JDLENBQUM7QUFFWCxJQUFZLG1CQW9CWDtBQXBCRCxXQUFZLG1CQUFtQjtJQUMzQjs7T0FFRztJQUNILHFFQUFRLENBQUE7SUFFUjs7T0FFRztJQUNILG1FQUFPLENBQUE7SUFFUDs7T0FFRztJQUNILG1FQUFPLENBQUE7SUFFUDs7T0FFRztJQUNILDJFQUFXLENBQUE7QUFDZixDQUFDLEVBcEJXLG1CQUFtQixtQ0FBbkIsbUJBQW1CLFFBb0I5QjtBQUVELElBQVksb0JBb0JYO0FBcEJELFdBQVksb0JBQW9CO0lBQzVCOztPQUVHO0lBQ0gscUVBQU8sQ0FBQTtJQUVQOztPQUVHO0lBQ0gsdUVBQVEsQ0FBQTtJQUVSOztPQUVHO0lBQ0gscUVBQU8sQ0FBQTtJQUVQOztPQUVHO0lBQ0gsNkVBQVcsQ0FBQTtBQUNmLENBQUMsRUFwQlcsb0JBQW9CLG9DQUFwQixvQkFBb0IsUUFvQi9CIiwic291cmNlc0NvbnRlbnQiOlsiLy8g6K6w5b2V5LiA5Lqb5Lya5Zyo6L+Q6KGM5pe25L2/55So55qE57G75Z6L5bi46YeP77yM56Gu5L+d57yW6K+R5ZCO5Y+v55SoXHJcbi8qKiDmiYDmnInotYTmupDlpITnkIblmajnsbvlnovnmoTluLjph4/mlbDnu4TvvIjnlKjkuo4gWm9kIGVudW0g5ZKMIFR5cGVTY3JpcHQgdHlwZe+8iSAqL1xyXG5leHBvcnQgY29uc3QgQVNTRVRfSEFORExFUl9UWVBFUyA9IFtcclxuICAgICdkaXJlY3RvcnknLFxyXG4gICAgJ3Vua25vd24nLFxyXG4gICAgJ3RleHQnLFxyXG4gICAgJ2pzb24nLFxyXG4gICAgJ3NwaW5lLWRhdGEnLFxyXG4gICAgJ2RyYWdvbmJvbmVzJyxcclxuICAgICdkcmFnb25ib25lcy1hdGxhcycsXHJcbiAgICAndGVycmFpbicsXHJcbiAgICAnamF2YXNjcmlwdCcsXHJcbiAgICAndHlwZXNjcmlwdCcsXHJcbiAgICAnc2NlbmUnLFxyXG4gICAgJ3ByZWZhYicsXHJcbiAgICAnc3ByaXRlLWZyYW1lJyxcclxuICAgICd0aWxlZC1tYXAnLFxyXG4gICAgJ2J1ZmZlcicsXHJcbiAgICAnaW1hZ2UnLFxyXG4gICAgJ3NpZ24taW1hZ2UnLFxyXG4gICAgJ2FscGhhLWltYWdlJyxcclxuICAgICd0ZXh0dXJlJyxcclxuICAgICd0ZXh0dXJlLWN1YmUnLFxyXG4gICAgJ2VycC10ZXh0dXJlLWN1YmUnLFxyXG4gICAgJ3JlbmRlci10ZXh0dXJlJyxcclxuICAgICd0ZXh0dXJlLWN1YmUtZmFjZScsXHJcbiAgICAncnQtc3ByaXRlLWZyYW1lJyxcclxuICAgICdnbHRmJyxcclxuICAgICdnbHRmLW1lc2gnLFxyXG4gICAgJ2dsdGYtYW5pbWF0aW9uJyxcclxuICAgICdnbHRmLXNrZWxldG9uJyxcclxuICAgICdnbHRmLW1hdGVyaWFsJyxcclxuICAgICdnbHRmLXNjZW5lJyxcclxuICAgICdnbHRmLWVtYmVkZWQtaW1hZ2UnLFxyXG4gICAgJ2ZieCcsXHJcbiAgICAnbWF0ZXJpYWwnLFxyXG4gICAgJ3BoeXNpY3MtbWF0ZXJpYWwnLFxyXG4gICAgJ2VmZmVjdCcsXHJcbiAgICAnZWZmZWN0LWhlYWRlcicsXHJcbiAgICAnYXVkaW8tY2xpcCcsXHJcbiAgICAnYW5pbWF0aW9uLWNsaXAnLFxyXG4gICAgJ2FuaW1hdGlvbi1ncmFwaCcsXHJcbiAgICAnYW5pbWF0aW9uLWdyYXBoLXZhcmlhbnQnLFxyXG4gICAgJ2FuaW1hdGlvbi1tYXNrJyxcclxuICAgICd0dGYtZm9udCcsXHJcbiAgICAnYml0bWFwLWZvbnQnLFxyXG4gICAgJ3BhcnRpY2xlJyxcclxuICAgICdzcHJpdGUtYXRsYXMnLFxyXG4gICAgJ2F1dG8tYXRsYXMnLFxyXG4gICAgJ2xhYmVsLWF0bGFzJyxcclxuICAgICdyZW5kZXItcGlwZWxpbmUnLFxyXG4gICAgJ3JlbmRlci1zdGFnZScsXHJcbiAgICAncmVuZGVyLWZsb3cnLFxyXG4gICAgJ2luc3RhbnRpYXRpb24tbWF0ZXJpYWwnLFxyXG4gICAgJ2luc3RhbnRpYXRpb24tbWVzaCcsXHJcbiAgICAnaW5zdGFudGlhdGlvbi1za2VsZXRvbicsXHJcbiAgICAnaW5zdGFudGlhdGlvbi1hbmltYXRpb24nLFxyXG4gICAgJ3ZpZGVvLWNsaXAnLFxyXG4gICAgJyonLFxyXG4gICAgJ2RhdGFiYXNlJyxcclxuXTtcclxuXHJcbi8qKiDmlK/mjIHliJvlu7rnmoTotYTmupDnsbvlnovluLjph4/mlbDnu4TvvIjnlKjkuo4gWm9kIGVudW0g5ZKMIFR5cGVTY3JpcHQgdHlwZe+8iSAqL1xyXG5leHBvcnQgY29uc3QgU1VQUE9SVF9DUkVBVEVfVFlQRVMgPSBbXHJcbiAgICAnYW5pbWF0aW9uLWNsaXAnLCAgICAgICAgICAvLyDliqjnlLvliarovpFcclxuICAgICd0eXBlc2NyaXB0JywgICAgICAgICAgICAgIC8vIFR5cGVTY3JpcHQg6ISa5pysXHJcbiAgICAnYXV0by1hdGxhcycsICAgICAgICAgICAgICAvLyDoh6rliqjlm77pm4ZcclxuICAgICdlZmZlY3QnLCAgICAgICAgICAgICAgICAgIC8vIOedgOiJsuWZqOaViOaenFxyXG4gICAgJ3NjZW5lJywgICAgICAgICAgICAgICAgICAgLy8g5Zy65pmvXHJcbiAgICAncHJlZmFiJywgICAgICAgICAgICAgICAgICAvLyDpooTliLbkvZNcclxuICAgICdtYXRlcmlhbCcsICAgICAgICAgICAgICAgIC8vIOadkOi0qFxyXG4gICAgLy8gJ3RleHR1cmUtY3ViZScsICAgICAgICAgICAgLy8g56uL5pa55L2T6LS05Zu+XHJcbiAgICAndGVycmFpbicsICAgICAgICAgICAgICAgICAvLyDlnLDlvaJcclxuICAgICdwaHlzaWNzLW1hdGVyaWFsJywgICAgICAgIC8vIOeJqeeQhuadkOi0qFxyXG4gICAgJ2xhYmVsLWF0bGFzJywgICAgICAgICAgICAgLy8g5qCH562+5Zu+6ZuGXHJcbiAgICAncmVuZGVyLXRleHR1cmUnLCAgICAgICAgICAvLyDmuLLmn5PnurnnkIZcclxuICAgIC8vICdhbmltYXRpb24tZ3JhcGgnLCAgICAgICAgIC8vIOWKqOeUu+WbvlxyXG4gICAgLy8gJ2FuaW1hdGlvbi1tYXNrJywgICAgICAgICAgLy8g5Yqo55S76YGu572pXHJcbiAgICAvLyAnYW5pbWF0aW9uLWdyYXBoLXZhcmlhbnQnLCAvLyDliqjnlLvlm77lj5jkvZNcclxuICAgICdkaXJlY3RvcnknLCAgICAgICAgICAgICAgIC8vIOaWh+S7tuWkuVxyXG4gICAgJ2VmZmVjdC1oZWFkZXInLCAgICAgICAgICAgLy8g552A6Imy5Zmo5aS05paH5Lu277yIY2h1bmvvvIlcclxuXSBhcyBjb25zdDtcclxuXHJcbmV4cG9ydCBlbnVtIE5vcm1hbEltcG9ydFNldHRpbmcge1xyXG4gICAgLyoqXHJcbiAgICAgKiDlpoLmnpzmqKHlnovmlofku7bkuK3ljIXlkKvms5Xnur/kv6Hmga/liJnlr7zlh7rms5Xnur/vvIzlkKbliJnkuI3lr7zlh7rms5Xnur/jgIJcclxuICAgICAqL1xyXG4gICAgb3B0aW9uYWwsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDkuI3lnKjlr7zlh7rnmoTnvZHmoLzkuK3ljIXlkKvms5Xnur/kv6Hmga/jgIJcclxuICAgICAqL1xyXG4gICAgZXhjbHVkZSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOWmguaenOaooeWei+aWh+S7tuS4reWMheWQq+azlee6v+S/oeaBr+WImeWvvOWHuuazlee6v++8jOWQpuWImemHjeaWsOiuoeeul+W5tuWvvOWHuuazlee6v+OAglxyXG4gICAgICovXHJcbiAgICByZXF1aXJlLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LiN566h5qih5Z6L5paH5Lu25Lit5piv5ZCm5YyF5ZCr5rOV57q/5L+h5oGv77yM55u05o6l6YeN5paw6K6h566X5bm25a+85Ye65rOV57q/44CCXHJcbiAgICAgKi9cclxuICAgIHJlY2FsY3VsYXRlLFxyXG59XHJcblxyXG5leHBvcnQgZW51bSBUYW5nZW50SW1wb3J0U2V0dGluZyB7XHJcbiAgICAvKipcclxuICAgICAqIOS4jeWcqOWvvOWHuueahOe9keagvOS4reWMheWQq+ato+WIh+S/oeaBr+OAglxyXG4gICAgICovXHJcbiAgICBleGNsdWRlLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5aaC5p6c5qih5Z6L5paH5Lu25Lit5YyF5ZCr5q2j5YiH5L+h5oGv5YiZ5a+85Ye65q2j5YiH77yM5ZCm5YiZ5LiN5a+85Ye65q2j5YiH44CCXHJcbiAgICAgKi9cclxuICAgIG9wdGlvbmFsLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5aaC5p6c5qih5Z6L5paH5Lu25Lit5YyF5ZCr5q2j5YiH5L+h5oGv5YiZ5a+85Ye65q2j5YiH77yM5ZCm5YiZ6Iul57q555CG5Z2Q5qCH5a2Y5Zyo5YiZ6YeN5paw6K6h566X5bm25a+85Ye65q2j5YiH44CCXHJcbiAgICAgKi9cclxuICAgIHJlcXVpcmUsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDkuI3nrqHmqKHlnovmlofku7bkuK3mmK/lkKbljIXlkKvmraPliIfkv6Hmga/vvIznm7TmjqXph43mlrDorqHnrpflubblr7zlh7rmraPliIfjgIJcclxuICAgICAqL1xyXG4gICAgcmVjYWxjdWxhdGUsXHJcbn1cclxuIl19