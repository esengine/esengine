"use strict";
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
exports.NativePackToolManager = void 0;
const platformPackToolMap = {
    windows: './platforms/windows',
    android: './platforms/android',
    mac: './platforms/mac',
    ios: './platforms/ios',
};
class NativePackToolManager {
    PackToolMap = new Map();
    static platformToPackTool = new Map();
    static register(platform, tool) {
        NativePackToolManager.platformToPackTool.set(platform, tool);
    }
    async getTool(platform) {
        const handler = this.PackToolMap.get(platform);
        if (handler) {
            return handler;
        }
        const PackTool = await NativePackToolManager.getPackTool(platform);
        const tool = new PackTool();
        this.PackToolMap.set(platform, tool);
        return tool;
    }
    async register(params) {
        const tool = await this.getTool(params.platform);
        tool.init(params);
        return tool;
    }
    async destory(platform) {
        this.PackToolMap.delete(platform);
    }
    static async getPackTool(platform) {
        if (NativePackToolManager.platformToPackTool.has(platform)) {
            return NativePackToolManager.platformToPackTool.get(platform);
        }
        if (!platformPackToolMap[platform]) {
            throw new Error(`No pack tool for platform ${platform}}`);
        }
        const PackTool = (await Promise.resolve(`${platformPackToolMap[platform]}`).then(s => __importStar(require(s)))).default;
        NativePackToolManager.platformToPackTool.set(platform, PackTool);
        return PackTool;
    }
    async openWithIDE(platform, projectPath, IDEDir) {
        const PackTool = await NativePackToolManager.getPackTool(platform);
        await PackTool.openWithIDE(projectPath, IDEDir);
        return PackTool;
    }
    async create(params) {
        const tool = await this.register(params);
        await tool.create();
        return tool;
    }
    async generate(params) {
        const tool = await this.register(params);
        await tool.generate();
        return tool;
    }
    async make(params) {
        const tool = await this.register(params);
        await tool.make();
        return tool;
    }
    async run(params) {
        const tool = await this.register(params);
        await tool.run();
        return tool;
    }
}
exports.NativePackToolManager = NativePackToolManager;
const nativePackToolMg = new NativePackToolManager();
exports.default = nativePackToolMg;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2J1aWxkZXIvcGxhdGZvcm1zL25hdGl2ZS1jb21tb24vcGFjay10b29sL21hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0EsTUFBTSxtQkFBbUIsR0FBMkI7SUFDaEQsT0FBTyxFQUFFLHFCQUFxQjtJQUM5QixPQUFPLEVBQUUscUJBQXFCO0lBQzlCLEdBQUcsRUFBRSxpQkFBaUI7SUFDdEIsR0FBRyxFQUFFLGlCQUFpQjtDQUN6QixDQUFDO0FBRUYsTUFBYSxxQkFBcUI7SUFDdEIsV0FBVyxHQUFnRCxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQzdFLE1BQU0sQ0FBQyxrQkFBa0IsR0FBdUQsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUUxRixNQUFNLENBQUMsUUFBUSxDQUFDLFFBQWdDLEVBQUUsSUFBMkI7UUFDekUscUJBQXFCLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFnQztRQUNsRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQyxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ1YsT0FBTyxPQUFPLENBQUM7UUFDbkIsQ0FBQztRQUNELE1BQU0sUUFBUSxHQUFHLE1BQU0scUJBQXFCLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sSUFBSSxHQUFHLElBQUssUUFBcUMsRUFBRSxDQUFDO1FBQzFELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUEwQjtRQUNyQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBZ0M7UUFDMUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQWdDO1FBQ3JELElBQUkscUJBQXFCLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDekQsT0FBTyxxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFFLENBQUM7UUFDbkUsQ0FBQztRQUNELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUNELE1BQU0sUUFBUSxHQUFHLENBQUMseUJBQWEsbUJBQW1CLENBQUMsUUFBUSxDQUFDLHVDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDdkUscUJBQXFCLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNqRSxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFnQyxFQUFFLFdBQW1CLEVBQUUsTUFBZTtRQUNwRixNQUFNLFFBQVEsR0FBRyxNQUFNLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuRSxNQUFNLFFBQVEsQ0FBQyxXQUFZLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQTBCO1FBQ25DLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QyxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNwQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUEwQjtRQUNyQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekMsTUFBTSxJQUFJLENBQUMsUUFBUyxFQUFFLENBQUM7UUFDdkIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBMEI7UUFDakMsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sSUFBSSxDQUFDLElBQUssRUFBRSxDQUFDO1FBQ25CLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQTBCO1FBQ2hDLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QyxNQUFNLElBQUksQ0FBQyxHQUFJLEVBQUUsQ0FBQztRQUNsQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDOztBQXBFTCxzREFxRUM7QUFFRCxNQUFNLGdCQUFnQixHQUFHLElBQUkscUJBQXFCLEVBQUUsQ0FBQztBQUVyRCxrQkFBZSxnQkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOYXRpdmVQYWNrVG9vbCwgeyBDb2Nvc1BhcmFtcywgSW50ZXJuYWxOYXRpdmVQbGF0Zm9ybSB9IGZyb20gJy4vYmFzZS9kZWZhdWx0JztcclxuXHJcblxyXG5jb25zdCBwbGF0Zm9ybVBhY2tUb29sTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgd2luZG93czogJy4vcGxhdGZvcm1zL3dpbmRvd3MnLFxyXG4gICAgYW5kcm9pZDogJy4vcGxhdGZvcm1zL2FuZHJvaWQnLFxyXG4gICAgbWFjOiAnLi9wbGF0Zm9ybXMvbWFjJyxcclxuICAgIGlvczogJy4vcGxhdGZvcm1zL2lvcycsXHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgTmF0aXZlUGFja1Rvb2xNYW5hZ2VyIHtcclxuICAgIHByaXZhdGUgUGFja1Rvb2xNYXA6IE1hcDxJbnRlcm5hbE5hdGl2ZVBsYXRmb3JtLCBOYXRpdmVQYWNrVG9vbD4gPSBuZXcgTWFwKCk7XHJcbiAgICBzdGF0aWMgcGxhdGZvcm1Ub1BhY2tUb29sOiBNYXA8SW50ZXJuYWxOYXRpdmVQbGF0Zm9ybSwgdHlwZW9mIE5hdGl2ZVBhY2tUb29sPiA9IG5ldyBNYXAoKTtcclxuXHJcbiAgICBzdGF0aWMgcmVnaXN0ZXIocGxhdGZvcm06IEludGVybmFsTmF0aXZlUGxhdGZvcm0sIHRvb2w6IHR5cGVvZiBOYXRpdmVQYWNrVG9vbCkge1xyXG4gICAgICAgIE5hdGl2ZVBhY2tUb29sTWFuYWdlci5wbGF0Zm9ybVRvUGFja1Rvb2wuc2V0KHBsYXRmb3JtLCB0b29sKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIGdldFRvb2wocGxhdGZvcm06IEludGVybmFsTmF0aXZlUGxhdGZvcm0pOiBQcm9taXNlPE5hdGl2ZVBhY2tUb29sPiB7XHJcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuUGFja1Rvb2xNYXAuZ2V0KHBsYXRmb3JtKTtcclxuICAgICAgICBpZiAoaGFuZGxlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgUGFja1Rvb2wgPSBhd2FpdCBOYXRpdmVQYWNrVG9vbE1hbmFnZXIuZ2V0UGFja1Rvb2wocGxhdGZvcm0pO1xyXG4gICAgICAgIGNvbnN0IHRvb2wgPSBuZXcgKFBhY2tUb29sIGFzIG5ldyAoKSA9PiBOYXRpdmVQYWNrVG9vbCkoKTtcclxuICAgICAgICB0aGlzLlBhY2tUb29sTWFwLnNldChwbGF0Zm9ybSwgdG9vbCk7XHJcbiAgICAgICAgcmV0dXJuIHRvb2w7XHJcbiAgICB9XHJcbiAgICBhc3luYyByZWdpc3RlcihwYXJhbXM6Q29jb3NQYXJhbXM8T2JqZWN0Pikge1xyXG4gICAgICAgIGNvbnN0IHRvb2wgPSBhd2FpdCB0aGlzLmdldFRvb2wocGFyYW1zLnBsYXRmb3JtKTtcclxuICAgICAgICB0b29sLmluaXQocGFyYW1zKTtcclxuICAgICAgICByZXR1cm4gdG9vbDtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBkZXN0b3J5KHBsYXRmb3JtOiBJbnRlcm5hbE5hdGl2ZVBsYXRmb3JtKSB7XHJcbiAgICAgICAgdGhpcy5QYWNrVG9vbE1hcC5kZWxldGUocGxhdGZvcm0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRQYWNrVG9vbChwbGF0Zm9ybTogSW50ZXJuYWxOYXRpdmVQbGF0Zm9ybSk6IFByb21pc2U8dHlwZW9mIE5hdGl2ZVBhY2tUb29sPiB7XHJcbiAgICAgICAgaWYgKE5hdGl2ZVBhY2tUb29sTWFuYWdlci5wbGF0Zm9ybVRvUGFja1Rvb2wuaGFzKHBsYXRmb3JtKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gTmF0aXZlUGFja1Rvb2xNYW5hZ2VyLnBsYXRmb3JtVG9QYWNrVG9vbC5nZXQocGxhdGZvcm0pITtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFwbGF0Zm9ybVBhY2tUb29sTWFwW3BsYXRmb3JtXSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHBhY2sgdG9vbCBmb3IgcGxhdGZvcm0gJHtwbGF0Zm9ybX19YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IFBhY2tUb29sID0gKGF3YWl0IGltcG9ydChwbGF0Zm9ybVBhY2tUb29sTWFwW3BsYXRmb3JtXSkpLmRlZmF1bHQ7XHJcbiAgICAgICAgTmF0aXZlUGFja1Rvb2xNYW5hZ2VyLnBsYXRmb3JtVG9QYWNrVG9vbC5zZXQocGxhdGZvcm0sIFBhY2tUb29sKTtcclxuICAgICAgICByZXR1cm4gUGFja1Rvb2w7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgb3BlbldpdGhJREUocGxhdGZvcm06IEludGVybmFsTmF0aXZlUGxhdGZvcm0sIHByb2plY3RQYXRoOiBzdHJpbmcsIElERURpcj86IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IFBhY2tUb29sID0gYXdhaXQgTmF0aXZlUGFja1Rvb2xNYW5hZ2VyLmdldFBhY2tUb29sKHBsYXRmb3JtKTtcclxuICAgICAgICBhd2FpdCBQYWNrVG9vbC5vcGVuV2l0aElERSEocHJvamVjdFBhdGgsIElERURpcik7XHJcbiAgICAgICAgcmV0dXJuIFBhY2tUb29sO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGNyZWF0ZShwYXJhbXM6Q29jb3NQYXJhbXM8T2JqZWN0Pik6IFByb21pc2U8TmF0aXZlUGFja1Rvb2w+IHtcclxuICAgICAgICBjb25zdCB0b29sID0gYXdhaXQgdGhpcy5yZWdpc3RlcihwYXJhbXMpO1xyXG4gICAgICAgIGF3YWl0IHRvb2wuY3JlYXRlKCk7XHJcbiAgICAgICAgcmV0dXJuIHRvb2w7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2VuZXJhdGUocGFyYW1zOkNvY29zUGFyYW1zPE9iamVjdD4pOiBQcm9taXNlPE5hdGl2ZVBhY2tUb29sPiB7XHJcbiAgICAgICAgY29uc3QgdG9vbCA9IGF3YWl0IHRoaXMucmVnaXN0ZXIocGFyYW1zKTtcclxuICAgICAgICBhd2FpdCB0b29sLmdlbmVyYXRlISgpO1xyXG4gICAgICAgIHJldHVybiB0b29sO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIG1ha2UocGFyYW1zOkNvY29zUGFyYW1zPE9iamVjdD4pOiBQcm9taXNlPE5hdGl2ZVBhY2tUb29sPiB7XHJcbiAgICAgICAgY29uc3QgdG9vbCA9IGF3YWl0IHRoaXMucmVnaXN0ZXIocGFyYW1zKTtcclxuICAgICAgICBhd2FpdCB0b29sLm1ha2UhKCk7XHJcbiAgICAgICAgcmV0dXJuIHRvb2w7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcnVuKHBhcmFtczpDb2Nvc1BhcmFtczxPYmplY3Q+KTogUHJvbWlzZTxOYXRpdmVQYWNrVG9vbD4ge1xyXG4gICAgICAgIGNvbnN0IHRvb2wgPSBhd2FpdCB0aGlzLnJlZ2lzdGVyKHBhcmFtcyk7XHJcbiAgICAgICAgYXdhaXQgdG9vbC5ydW4hKCk7XHJcbiAgICAgICAgcmV0dXJuIHRvb2w7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IG5hdGl2ZVBhY2tUb29sTWcgPSBuZXcgTmF0aXZlUGFja1Rvb2xNYW5hZ2VyKCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBuYXRpdmVQYWNrVG9vbE1nO1xyXG4iXX0=