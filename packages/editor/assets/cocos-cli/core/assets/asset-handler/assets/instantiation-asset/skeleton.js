'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkeletonHandler = void 0;
const asset_1 = __importDefault(require("./asset"));
exports.SkeletonHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'instantiation-skeleton',
    // 引擎内对应的类型
    assetType: 'cc.Skeleton',
    importer: {
        ...asset_1.default.importer,
        // 版本号如果变更，则会强制重新导入
        version: '1.0.0',
    },
};
exports.default = exports.SkeletonHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2tlbGV0b24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvaW5zdGFudGlhdGlvbi1hc3NldC9za2VsZXRvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7OztBQUdiLG9EQUFnRDtBQUVuQyxRQUFBLGVBQWUsR0FBaUI7SUFDekMsZ0NBQWdDO0lBQ2hDLElBQUksRUFBRSx3QkFBd0I7SUFFOUIsV0FBVztJQUNYLFNBQVMsRUFBRSxhQUFhO0lBRXhCLFFBQVEsRUFBRTtRQUNOLEdBQUcsZUFBeUIsQ0FBQyxRQUFRO1FBQ3JDLG1CQUFtQjtRQUNuQixPQUFPLEVBQUUsT0FBTztLQUNuQjtDQUNKLENBQUM7QUFFRixrQkFBZSx1QkFBZSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCBJbnN0YW50aWF0aW9uQXNzZXRIYW5kbGVyIGZyb20gJy4vYXNzZXQnO1xyXG5cclxuZXhwb3J0IGNvbnN0IFNrZWxldG9uSGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICdpbnN0YW50aWF0aW9uLXNrZWxldG9uJyxcclxuXHJcbiAgICAvLyDlvJXmk47lhoXlr7nlupTnmoTnsbvlnotcclxuICAgIGFzc2V0VHlwZTogJ2NjLlNrZWxldG9uJyxcclxuXHJcbiAgICBpbXBvcnRlcjoge1xyXG4gICAgICAgIC4uLkluc3RhbnRpYXRpb25Bc3NldEhhbmRsZXIuaW1wb3J0ZXIsXHJcbiAgICAgICAgLy8g54mI5pys5Y+35aaC5p6c5Y+Y5pu077yM5YiZ5Lya5by65Yi26YeN5paw5a+85YWlXHJcbiAgICAgICAgdmVyc2lvbjogJzEuMC4wJyxcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTa2VsZXRvbkhhbmRsZXI7XHJcbiJdfQ==