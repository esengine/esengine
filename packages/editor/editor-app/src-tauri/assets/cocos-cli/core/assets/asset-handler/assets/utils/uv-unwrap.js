"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrapLightmapUV = unwrapLightmapUV;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const utils_1 = __importDefault(require("../../../../base/utils"));
const global_1 = require("../../../../../global");
/**
 *
 * @param inputFile The file is the mesh data extracted from cc.Mesh for generating LightmapUV.
 * @param outFile The file is the generated LightmapUV data.
 */
function unwrapLightmapUV(inputFile, outFile) {
    const toolName = 'uvunwrap';
    const toolExt = os_1.default.type() === 'Windows_NT' ? '.exe' : '';
    // @ts-ignore
    const tool = path_1.default.join(global_1.GlobalPaths.staticDir, 'tools/LightFX', toolName + toolExt);
    const args = ['--input', inputFile, '--output', outFile];
    return utils_1.default.Process.quickSpawn(tool, args, {
        shell: true,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXYtdW53cmFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvYXNzZXRzL3V0aWxzL3V2LXVud3JhcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQVNBLDRDQVVDO0FBbkJELDRDQUFvQjtBQUNwQixnREFBd0I7QUFDeEIsbUVBQTJDO0FBQzNDLGtEQUFvRDtBQUNwRDs7OztHQUlHO0FBQ0gsU0FBZ0IsZ0JBQWdCLENBQUMsU0FBaUIsRUFBRSxPQUFlO0lBQy9ELE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQztJQUM1QixNQUFNLE9BQU8sR0FBRyxZQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUN6RCxhQUFhO0lBQ2IsTUFBTSxJQUFJLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxvQkFBVyxDQUFDLFNBQVMsRUFBRSxlQUFlLEVBQUUsUUFBUSxHQUFHLE9BQU8sQ0FBQyxDQUFDO0lBQ25GLE1BQU0sSUFBSSxHQUFHLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFekQsT0FBTyxlQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO1FBQ3hDLEtBQUssRUFBRSxJQUFJO0tBQ2QsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBvcyBmcm9tICdvcyc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vYmFzZS91dGlscyc7XHJcbmltcG9ydCB7IEdsb2JhbFBhdGhzIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vZ2xvYmFsJztcclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSBpbnB1dEZpbGUgVGhlIGZpbGUgaXMgdGhlIG1lc2ggZGF0YSBleHRyYWN0ZWQgZnJvbSBjYy5NZXNoIGZvciBnZW5lcmF0aW5nIExpZ2h0bWFwVVYuXHJcbiAqIEBwYXJhbSBvdXRGaWxlIFRoZSBmaWxlIGlzIHRoZSBnZW5lcmF0ZWQgTGlnaHRtYXBVViBkYXRhLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHVud3JhcExpZ2h0bWFwVVYoaW5wdXRGaWxlOiBzdHJpbmcsIG91dEZpbGU6IHN0cmluZykge1xyXG4gICAgY29uc3QgdG9vbE5hbWUgPSAndXZ1bndyYXAnO1xyXG4gICAgY29uc3QgdG9vbEV4dCA9IG9zLnR5cGUoKSA9PT0gJ1dpbmRvd3NfTlQnID8gJy5leGUnIDogJyc7XHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICBjb25zdCB0b29sID0gcGF0aC5qb2luKEdsb2JhbFBhdGhzLnN0YXRpY0RpciwgJ3Rvb2xzL0xpZ2h0RlgnLCB0b29sTmFtZSArIHRvb2xFeHQpO1xyXG4gICAgY29uc3QgYXJncyA9IFsnLS1pbnB1dCcsIGlucHV0RmlsZSwgJy0tb3V0cHV0Jywgb3V0RmlsZV07XHJcblxyXG4gICAgcmV0dXJuIHV0aWxzLlByb2Nlc3MucXVpY2tTcGF3bih0b29sLCBhcmdzLCB7XHJcbiAgICAgICAgc2hlbGw6IHRydWUsXHJcbiAgICB9KTtcclxufVxyXG4iXX0=