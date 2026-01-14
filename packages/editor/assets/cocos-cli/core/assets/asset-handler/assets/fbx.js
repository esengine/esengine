"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FbxHandler = void 0;
const gltf_1 = __importDefault(require("./gltf"));
exports.FbxHandler = {
    ...gltf_1.default,
    // Handler 的名字，用于指定 Handler as 等
    name: 'fbx',
};
exports.default = exports.FbxHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmJ4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvYXNzZXRzL2ZieC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxrREFBaUM7QUFFcEIsUUFBQSxVQUFVLEdBQXFCO0lBQ3hDLEdBQUcsY0FBVztJQUVkLGdDQUFnQztJQUNoQyxJQUFJLEVBQUUsS0FBSztDQUNkLENBQUM7QUFFRixrQkFBZSxrQkFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXNzZXRIYW5kbGVyQmFzZSB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgR2x0ZkhhbmRsZXIgZnJvbSAnLi9nbHRmJztcclxuXHJcbmV4cG9ydCBjb25zdCBGYnhIYW5kbGVyOiBBc3NldEhhbmRsZXJCYXNlID0ge1xyXG4gICAgLi4uR2x0ZkhhbmRsZXIsXHJcblxyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICdmYngnLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRmJ4SGFuZGxlcjtcclxuIl19