"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoHandler = void 0;
const cc_1 = require("cc");
const utils_1 = require("../utils");
exports.VideoHandler = {
    name: 'video-clip',
    // assetType: js.getClassName(VideoClip),
    assetType: 'cc.VideoClip',
    importer: {
        version: '1.0.0',
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
            await asset.copyToLibrary(asset.extname, asset.source);
            let duration = 10;
            try {
                duration = await (0, utils_1.getMediaDuration)(asset.source);
            }
            catch (error) {
                console.error(`Loading video ${asset.source} failed, the video you are using may be in a corrupted format or not supported by the current browser version of the editor, in the latter case you can ignore this error.`);
                console.debug(error);
            }
            const video = createVideo(asset, duration);
            const serializeJSON = EditorExtends.serialize(video);
            await asset.saveToLibrary('.json', serializeJSON);
            return true;
        },
    },
};
exports.default = exports.VideoHandler;
function createVideo(asset, duration) {
    const video = new cc_1.VideoClip();
    // @ts-ignore
    duration && (video._duration = duration);
    video.name = asset.basename;
    video._setRawAsset(asset.extname);
    return video;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlkZW8tY2xpcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy92aWRlby1jbGlwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLDJCQUErQjtBQUMvQixvQ0FBNEM7QUFFL0IsUUFBQSxZQUFZLEdBQWlCO0lBQ3RDLElBQUksRUFBRSxZQUFZO0lBQ2xCLHlDQUF5QztJQUN6QyxTQUFTLEVBQUUsY0FBYztJQUN6QixRQUFRLEVBQUU7UUFDTixPQUFPLEVBQUUsT0FBTztRQUNoQjs7Ozs7Ozs7V0FRRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBWTtZQUNyQixNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkQsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQztnQkFDRCxRQUFRLEdBQUcsTUFBTSxJQUFBLHdCQUFnQixFQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRCxDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDYixPQUFPLENBQUMsS0FBSyxDQUNULGlCQUFpQixLQUFLLENBQUMsTUFBTSw0S0FBNEssQ0FDNU0sQ0FBQztnQkFDRixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pCLENBQUM7WUFDRCxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFXLENBQUM7WUFDL0QsTUFBTSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUNsRCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0tBQ0o7Q0FDSixDQUFDO0FBRUYsa0JBQWUsb0JBQVksQ0FBQztBQUU1QixTQUFTLFdBQVcsQ0FBQyxLQUFZLEVBQUUsUUFBaUI7SUFFaEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxjQUFTLEVBQUUsQ0FBQztJQUM5QixhQUFhO0lBQ2IsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQztJQUV6QyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7SUFDNUIsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbEMsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0IH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IFZpZGVvQ2xpcCB9IGZyb20gJ2NjJztcclxuaW1wb3J0IHsgZ2V0TWVkaWFEdXJhdGlvbiB9IGZyb20gJy4uL3V0aWxzJztcclxuXHJcbmV4cG9ydCBjb25zdCBWaWRlb0hhbmRsZXI6IEFzc2V0SGFuZGxlciA9IHtcclxuICAgIG5hbWU6ICd2aWRlby1jbGlwJyxcclxuICAgIC8vIGFzc2V0VHlwZToganMuZ2V0Q2xhc3NOYW1lKFZpZGVvQ2xpcCksXHJcbiAgICBhc3NldFR5cGU6ICdjYy5WaWRlb0NsaXAnLFxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjAnLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWunumZheWvvOWFpea1geeoi1xyXG4gICAgICAgICAqIOmcgOimgeiHquW3seaOp+WItuaYr+WQpueUn+aIkOOAgeaLt+i0neaWh+S7tlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICog6L+U5Zue5piv5ZCm5a+85YWl5oiQ5Yqf55qE5qCH6K6wXHJcbiAgICAgICAgICog5aaC5p6c6L+U5ZueIGZhbHNl77yM5YiZIGltcG9ydGVkIOagh+iusOS4jeS8muWPmOaIkCB0cnVlXHJcbiAgICAgICAgICog5ZCO57ut55qE5LiA57O75YiX5pON5L2c6YO95LiN5Lya5omn6KGMXHJcbiAgICAgICAgICogQHBhcmFtIGFzc2V0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXN5bmMgaW1wb3J0KGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldC5jb3B5VG9MaWJyYXJ5KGFzc2V0LmV4dG5hbWUsIGFzc2V0LnNvdXJjZSk7XHJcbiAgICAgICAgICAgIGxldCBkdXJhdGlvbiA9IDEwO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPSBhd2FpdCBnZXRNZWRpYUR1cmF0aW9uKGFzc2V0LnNvdXJjZSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgIGBMb2FkaW5nIHZpZGVvICR7YXNzZXQuc291cmNlfSBmYWlsZWQsIHRoZSB2aWRlbyB5b3UgYXJlIHVzaW5nIG1heSBiZSBpbiBhIGNvcnJ1cHRlZCBmb3JtYXQgb3Igbm90IHN1cHBvcnRlZCBieSB0aGUgY3VycmVudCBicm93c2VyIHZlcnNpb24gb2YgdGhlIGVkaXRvciwgaW4gdGhlIGxhdHRlciBjYXNlIHlvdSBjYW4gaWdub3JlIHRoaXMgZXJyb3IuYCxcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCB2aWRlbyA9IGNyZWF0ZVZpZGVvKGFzc2V0LCBkdXJhdGlvbik7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZUpTT04gPSBFZGl0b3JFeHRlbmRzLnNlcmlhbGl6ZSh2aWRlbykgYXMgc3RyaW5nO1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldC5zYXZlVG9MaWJyYXJ5KCcuanNvbicsIHNlcmlhbGl6ZUpTT04pO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZpZGVvSGFuZGxlcjtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVZpZGVvKGFzc2V0OiBBc3NldCwgZHVyYXRpb24/OiBudW1iZXIpIHtcclxuXHJcbiAgICBjb25zdCB2aWRlbyA9IG5ldyBWaWRlb0NsaXAoKTtcclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIGR1cmF0aW9uICYmICh2aWRlby5fZHVyYXRpb24gPSBkdXJhdGlvbik7XHJcblxyXG4gICAgdmlkZW8ubmFtZSA9IGFzc2V0LmJhc2VuYW1lO1xyXG4gICAgdmlkZW8uX3NldFJhd0Fzc2V0KGFzc2V0LmV4dG5hbWUpO1xyXG5cclxuICAgIHJldHVybiB2aWRlbztcclxufVxyXG4iXX0=