'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshHandler = void 0;
const asset_1 = __importDefault(require("./asset"));
exports.MeshHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'instantiation-mesh',
    // 引擎内对应的类型
    assetType: 'cc.Mesh',
    importer: {
        // 版本号如果变更，则会强制重新导入
        ...asset_1.default.importer,
        version: '1.0.0',
    },
};
exports.default = exports.MeshHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy9pbnN0YW50aWF0aW9uLWFzc2V0L21lc2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7QUFHYixvREFBZ0Q7QUFFbkMsUUFBQSxXQUFXLEdBQWlCO0lBQ3JDLGdDQUFnQztJQUNoQyxJQUFJLEVBQUUsb0JBQW9CO0lBRTFCLFdBQVc7SUFDWCxTQUFTLEVBQUUsU0FBUztJQUVwQixRQUFRLEVBQUU7UUFDTixtQkFBbUI7UUFDbkIsR0FBRyxlQUF5QixDQUFDLFFBQVE7UUFDckMsT0FBTyxFQUFFLE9BQU87S0FDbkI7Q0FDSixDQUFDO0FBRUYsa0JBQWUsbUJBQVcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IEFzc2V0SGFuZGxlciB9IGZyb20gJy4uLy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgSW5zdGFudGlhdGlvbkFzc2V0SGFuZGxlciBmcm9tICcuL2Fzc2V0JztcclxuXHJcbmV4cG9ydCBjb25zdCBNZXNoSGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICdpbnN0YW50aWF0aW9uLW1lc2gnLFxyXG5cclxuICAgIC8vIOW8leaTjuWGheWvueW6lOeahOexu+Wei1xyXG4gICAgYXNzZXRUeXBlOiAnY2MuTWVzaCcsXHJcblxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICAvLyDniYjmnKzlj7flpoLmnpzlj5jmm7TvvIzliJnkvJrlvLrliLbph43mlrDlr7zlhaVcclxuICAgICAgICAuLi5JbnN0YW50aWF0aW9uQXNzZXRIYW5kbGVyLmltcG9ydGVyLFxyXG4gICAgICAgIHZlcnNpb246ICcxLjAuMCcsXHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTWVzaEhhbmRsZXI7XHJcbiJdfQ==