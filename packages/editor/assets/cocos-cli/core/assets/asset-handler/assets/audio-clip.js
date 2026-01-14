"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cc_1 = require("cc");
const utils_1 = require("../utils");
const AudioHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'audio-clip',
    // 引擎内对应的类型
    assetType: 'cc.AudioClip',
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
            // 如果当前资源没有导入，则开始导入当前资源
            // 0 - WEBAUDIO, 1 - DOM
            asset.userData.downloadMode = 0;
            await asset.copyToLibrary(asset.extname, asset.source);
            let duration = 0;
            // 如果当前资源没有生成 audio，则开始生成 audio
            try {
                duration = await (0, utils_1.getMediaDuration)(asset.source);
            }
            catch (error) {
                console.error(error);
                console.error(`Loading audio ${asset.source} failed, the audio you are using may be in a corrupted format or not supported by the current browser version of the editor, in the latter case you can ignore this error.`);
            }
            const audio = createAudio(asset, duration);
            await asset.saveToLibrary('.json', EditorExtends.serialize(audio));
            return true;
        },
    },
};
exports.default = AudioHandler;
function createAudio(asset, duration) {
    const audio = new cc_1.AudioClip();
    // @ts-ignore
    audio._loadMode = asset.userData.downloadMode;
    // @ts-ignore
    audio._duration = duration;
    audio.name = asset.basename;
    audio._setRawAsset(asset.extname);
    return audio;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVkaW8tY2xpcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy9hdWRpby1jbGlwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsMkJBQStCO0FBQy9CLG9DQUE0QztBQUU1QyxNQUFNLFlBQVksR0FBaUI7SUFDL0IsZ0NBQWdDO0lBQ2hDLElBQUksRUFBRSxZQUFZO0lBRWxCLFdBQVc7SUFDWCxTQUFTLEVBQUUsY0FBYztJQUV6QixRQUFRLEVBQUU7UUFDTixPQUFPLEVBQUUsT0FBTztRQUNoQjs7Ozs7Ozs7V0FRRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBWTtZQUNyQix1QkFBdUI7WUFDdkIsd0JBQXdCO1lBQ3hCLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztZQUNoQyxNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkQsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLCtCQUErQjtZQUMvQixJQUFJLENBQUM7Z0JBQ0QsUUFBUSxHQUFHLE1BQU0sSUFBQSx3QkFBZ0IsRUFBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEQsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDckIsT0FBTyxDQUFDLEtBQUssQ0FDVCxpQkFBaUIsS0FBSyxDQUFDLE1BQU0sNEtBQTRLLENBQzVNLENBQUM7WUFDTixDQUFDO1lBQ0QsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMzQyxNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNuRSxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0tBQ0o7Q0FDSixDQUFDO0FBRUYsa0JBQWUsWUFBWSxDQUFDO0FBRTVCLFNBQVMsV0FBVyxDQUFDLEtBQVksRUFBRSxRQUFnQjtJQUMvQyxNQUFNLEtBQUssR0FBRyxJQUFJLGNBQVMsRUFBRSxDQUFDO0lBQzlCLGFBQWE7SUFDYixLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDO0lBQzlDLGFBQWE7SUFDYixLQUFLLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUUzQixLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7SUFDNUIsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbEMsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0IH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3ByaXZhdGUnO1xyXG5pbXBvcnQgeyBBdWRpb0NsaXAgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IGdldE1lZGlhRHVyYXRpb24gfSBmcm9tICcuLi91dGlscyc7XHJcblxyXG5jb25zdCBBdWRpb0hhbmRsZXI6IEFzc2V0SGFuZGxlciA9IHtcclxuICAgIC8vIEhhbmRsZXIg55qE5ZCN5a2X77yM55So5LqO5oyH5a6aIEhhbmRsZXIgYXMg562JXHJcbiAgICBuYW1lOiAnYXVkaW8tY2xpcCcsXHJcblxyXG4gICAgLy8g5byV5pOO5YaF5a+55bqU55qE57G75Z6LXHJcbiAgICBhc3NldFR5cGU6ICdjYy5BdWRpb0NsaXAnLFxyXG5cclxuICAgIGltcG9ydGVyOiB7XHJcbiAgICAgICAgdmVyc2lvbjogJzEuMC4wJyxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlrp7pmYXlr7zlhaXmtYHnqItcclxuICAgICAgICAgKiDpnIDopoHoh6rlt7HmjqfliLbmmK/lkKbnlJ/miJDjgIHmi7fotJ3mlofku7ZcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIOi/lOWbnuaYr+WQpuWvvOWFpeaIkOWKn+eahOagh+iusFxyXG4gICAgICAgICAqIOWmguaenOi/lOWbniBmYWxzZe+8jOWImSBpbXBvcnRlZCDmoIforrDkuI3kvJrlj5jmiJAgdHJ1ZVxyXG4gICAgICAgICAqIOWQjue7reeahOS4gOezu+WIl+aTjeS9nOmDveS4jeS8muaJp+ihjFxyXG4gICAgICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFzeW5jIGltcG9ydChhc3NldDogQXNzZXQpIHtcclxuICAgICAgICAgICAgLy8g5aaC5p6c5b2T5YmN6LWE5rqQ5rKh5pyJ5a+85YWl77yM5YiZ5byA5aeL5a+85YWl5b2T5YmN6LWE5rqQXHJcbiAgICAgICAgICAgIC8vIDAgLSBXRUJBVURJTywgMSAtIERPTVxyXG4gICAgICAgICAgICBhc3NldC51c2VyRGF0YS5kb3dubG9hZE1vZGUgPSAwO1xyXG4gICAgICAgICAgICBhd2FpdCBhc3NldC5jb3B5VG9MaWJyYXJ5KGFzc2V0LmV4dG5hbWUsIGFzc2V0LnNvdXJjZSk7XHJcbiAgICAgICAgICAgIGxldCBkdXJhdGlvbiA9IDA7XHJcbiAgICAgICAgICAgIC8vIOWmguaenOW9k+WJjei1hOa6kOayoeacieeUn+aIkCBhdWRpb++8jOWImeW8gOWni+eUn+aIkCBhdWRpb1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPSBhd2FpdCBnZXRNZWRpYUR1cmF0aW9uKGFzc2V0LnNvdXJjZSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAgICAgICAgICAgYExvYWRpbmcgYXVkaW8gJHthc3NldC5zb3VyY2V9IGZhaWxlZCwgdGhlIGF1ZGlvIHlvdSBhcmUgdXNpbmcgbWF5IGJlIGluIGEgY29ycnVwdGVkIGZvcm1hdCBvciBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBjdXJyZW50IGJyb3dzZXIgdmVyc2lvbiBvZiB0aGUgZWRpdG9yLCBpbiB0aGUgbGF0dGVyIGNhc2UgeW91IGNhbiBpZ25vcmUgdGhpcyBlcnJvci5gLFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBhdWRpbyA9IGNyZWF0ZUF1ZGlvKGFzc2V0LCBkdXJhdGlvbik7XHJcbiAgICAgICAgICAgIGF3YWl0IGFzc2V0LnNhdmVUb0xpYnJhcnkoJy5qc29uJywgRWRpdG9yRXh0ZW5kcy5zZXJpYWxpemUoYXVkaW8pKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBdWRpb0hhbmRsZXI7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVBdWRpbyhhc3NldDogQXNzZXQsIGR1cmF0aW9uOiBudW1iZXIpOiBBdWRpb0NsaXAge1xyXG4gICAgY29uc3QgYXVkaW8gPSBuZXcgQXVkaW9DbGlwKCk7XHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICBhdWRpby5fbG9hZE1vZGUgPSBhc3NldC51c2VyRGF0YS5kb3dubG9hZE1vZGU7XHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICBhdWRpby5fZHVyYXRpb24gPSBkdXJhdGlvbjtcclxuXHJcbiAgICBhdWRpby5uYW1lID0gYXNzZXQuYmFzZW5hbWU7XHJcbiAgICBhdWRpby5fc2V0UmF3QXNzZXQoYXNzZXQuZXh0bmFtZSk7XHJcblxyXG4gICAgcmV0dXJuIGF1ZGlvO1xyXG59XHJcbiJdfQ==