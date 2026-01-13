"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeFull = deserializeFull;
const cc_1 = require("cc");
/**
 * 反序列化指定数据，并处理其中涉及的资源引用。
 * @param serialized 序列化后的数据。
 * @returns 反序列化的结果。
 */
async function deserializeFull(serialized) {
    const deserializeDetails = new cc_1.deserialize.Details();
    deserializeDetails.reset();
    const result = (0, cc_1.deserialize)(serialized, deserializeDetails);
    const uuidList = deserializeDetails.uuidList;
    if (!uuidList) {
        return result;
    }
    if (uuidList.some((uuid) => typeof uuid === 'number')) {
        throw new Error(`Don't know how to handle numeric UUID in ${uuidList}`);
    }
    const uuidToAssetMap = {};
    await Promise.all(uuidList.map((uuid) => new Promise((resolve, reject) => {
        cc_1.assetManager.loadAny(uuid, (err, asset) => {
            if (err) {
                reject(err);
            }
            else {
                uuidToAssetMap[uuid] = asset;
                resolve();
            }
        });
    })));
    deserializeDetails.assignAssetsBy((uuid, _) => {
        if (!(uuid in uuidToAssetMap)) {
            throw new Error(`Deserialized object is referencing ${uuid} which was not appeared in deserialize details.`);
        }
        const asset = uuidToAssetMap[uuid];
        if (!(asset instanceof cc_1.Asset)) {
            throw new Error(`Deserialized object is referencing ${uuid} which was appeared in deserialize details but isn't an asset.`);
        }
        return asset;
    });
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVzZXJpYWxpemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9lbmdpbmUvZWRpdG9yLWV4dGVuZHMvdXRpbHMvZGVzZXJpYWxpemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFPQSwwQ0FpQ0M7QUF4Q0QsMkJBQXNEO0FBRXREOzs7O0dBSUc7QUFDSSxLQUFLLFVBQVUsZUFBZSxDQUFDLFVBQW1CO0lBQ3JELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxnQkFBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3JELGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzNCLE1BQU0sTUFBTSxHQUFHLElBQUEsZ0JBQVcsRUFBQyxVQUFVLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztJQUMzRCxNQUFNLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxRQUFRLENBQUM7SUFDN0MsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ1osT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNELElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsT0FBTyxJQUFJLEtBQUssUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUNwRCxNQUFNLElBQUksS0FBSyxDQUFDLDRDQUE0QyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFDRCxNQUFNLGNBQWMsR0FBNEIsRUFBRSxDQUFDO0lBQ25ELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBRSxRQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDekYsaUJBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3RDLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ04sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLENBQUM7aUJBQU0sQ0FBQztnQkFDSixjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUM3QixPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUMxQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksY0FBYyxDQUFDLEVBQUUsQ0FBQztZQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxJQUFJLGlEQUFpRCxDQUFDLENBQUM7UUFDakgsQ0FBQztRQUNELE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksVUFBSyxDQUFDLEVBQUUsQ0FBQztZQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxJQUFJLGdFQUFnRSxDQUFDLENBQUM7UUFDaEksQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0LCBhc3NldE1hbmFnZXIsIGRlc2VyaWFsaXplIH0gZnJvbSAnY2MnO1xyXG5cclxuLyoqXHJcbiAqIOWPjeW6j+WIl+WMluaMh+WumuaVsOaNru+8jOW5tuWkhOeQhuWFtuS4rea2ieWPiueahOi1hOa6kOW8leeUqOOAglxyXG4gKiBAcGFyYW0gc2VyaWFsaXplZCDluo/liJfljJblkI7nmoTmlbDmja7jgIJcclxuICogQHJldHVybnMg5Y+N5bqP5YiX5YyW55qE57uT5p6c44CCXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVzZXJpYWxpemVGdWxsKHNlcmlhbGl6ZWQ6IHVua25vd24pIHtcclxuICAgIGNvbnN0IGRlc2VyaWFsaXplRGV0YWlscyA9IG5ldyBkZXNlcmlhbGl6ZS5EZXRhaWxzKCk7XHJcbiAgICBkZXNlcmlhbGl6ZURldGFpbHMucmVzZXQoKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGRlc2VyaWFsaXplKHNlcmlhbGl6ZWQsIGRlc2VyaWFsaXplRGV0YWlscyk7XHJcbiAgICBjb25zdCB1dWlkTGlzdCA9IGRlc2VyaWFsaXplRGV0YWlscy51dWlkTGlzdDtcclxuICAgIGlmICghdXVpZExpc3QpIHtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgaWYgKHV1aWRMaXN0LnNvbWUoKHV1aWQpID0+IHR5cGVvZiB1dWlkID09PSAnbnVtYmVyJykpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYERvbid0IGtub3cgaG93IHRvIGhhbmRsZSBudW1lcmljIFVVSUQgaW4gJHt1dWlkTGlzdH1gKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHV1aWRUb0Fzc2V0TWFwOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xyXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoKHV1aWRMaXN0IGFzIHN0cmluZ1tdKS5tYXAoKHV1aWQpID0+IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBhc3NldE1hbmFnZXIubG9hZEFueSh1dWlkLCAoZXJyLCBhc3NldCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHV1aWRUb0Fzc2V0TWFwW3V1aWRdID0gYXNzZXQ7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0pKSk7XHJcbiAgICBkZXNlcmlhbGl6ZURldGFpbHMuYXNzaWduQXNzZXRzQnkoKHV1aWQsIF8pID0+IHtcclxuICAgICAgICBpZiAoISh1dWlkIGluIHV1aWRUb0Fzc2V0TWFwKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYERlc2VyaWFsaXplZCBvYmplY3QgaXMgcmVmZXJlbmNpbmcgJHt1dWlkfSB3aGljaCB3YXMgbm90IGFwcGVhcmVkIGluIGRlc2VyaWFsaXplIGRldGFpbHMuYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGFzc2V0ID0gdXVpZFRvQXNzZXRNYXBbdXVpZF07XHJcbiAgICAgICAgaWYgKCEoYXNzZXQgaW5zdGFuY2VvZiBBc3NldCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEZXNlcmlhbGl6ZWQgb2JqZWN0IGlzIHJlZmVyZW5jaW5nICR7dXVpZH0gd2hpY2ggd2FzIGFwcGVhcmVkIGluIGRlc2VyaWFsaXplIGRldGFpbHMgYnV0IGlzbid0IGFuIGFzc2V0LmApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYXNzZXQ7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn0iXX0=