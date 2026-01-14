'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationHandler = void 0;
const asset_1 = __importDefault(require("./asset"));
exports.AnimationHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'instantiation-animation',
    // 引擎内对应的类型
    assetType: 'cc.AnimationClip',
    importer: {
        // 版本号如果变更，则会强制重新导入
        ...asset_1.default.importer,
        version: '1.0.0',
    },
};
exports.default = exports.AnimationHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvYXNzZXRzL2luc3RhbnRpYXRpb24tYXNzZXQvYW5pbWF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7O0FBR2Isb0RBQWdEO0FBRW5DLFFBQUEsZ0JBQWdCLEdBQWlCO0lBQzFDLGdDQUFnQztJQUNoQyxJQUFJLEVBQUUseUJBQXlCO0lBRS9CLFdBQVc7SUFDWCxTQUFTLEVBQUUsa0JBQWtCO0lBRTdCLFFBQVEsRUFBRTtRQUNOLG1CQUFtQjtRQUNuQixHQUFHLGVBQXlCLENBQUMsUUFBUTtRQUNyQyxPQUFPLEVBQUUsT0FBTztLQUNuQjtDQUNKLENBQUM7QUFFRixrQkFBZSx3QkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IEFzc2V0SGFuZGxlciB9IGZyb20gJy4uLy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgSW5zdGFudGlhdGlvbkFzc2V0SGFuZGxlciBmcm9tICcuL2Fzc2V0JztcclxuXHJcbmV4cG9ydCBjb25zdCBBbmltYXRpb25IYW5kbGVyOiBBc3NldEhhbmRsZXIgPSB7XHJcbiAgICAvLyBIYW5kbGVyIOeahOWQjeWtl++8jOeUqOS6juaMh+WumiBIYW5kbGVyIGFzIOetiVxyXG4gICAgbmFtZTogJ2luc3RhbnRpYXRpb24tYW5pbWF0aW9uJyxcclxuXHJcbiAgICAvLyDlvJXmk47lhoXlr7nlupTnmoTnsbvlnotcclxuICAgIGFzc2V0VHlwZTogJ2NjLkFuaW1hdGlvbkNsaXAnLFxyXG5cclxuICAgIGltcG9ydGVyOiB7XHJcbiAgICAgICAgLy8g54mI5pys5Y+35aaC5p6c5Y+Y5pu077yM5YiZ5Lya5by65Yi26YeN5paw5a+85YWlXHJcbiAgICAgICAgLi4uSW5zdGFudGlhdGlvbkFzc2V0SGFuZGxlci5pbXBvcnRlcixcclxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjAnLFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFuaW1hdGlvbkhhbmRsZXI7XHJcbiJdfQ==