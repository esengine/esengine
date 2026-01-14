'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitGroups = splitGroups;
exports.walk = walk;
exports.hasGroups = hasGroups;
const asset_library_1 = require("../manager/asset-library");
const _ = require('lodash');
/**
 * 分组重新划分
 * 将所有分组内，重复的数据，单独提取成新的分组
 *
 * @param groups 传入一个分组数组（二维数组）
 * @param checkResult 是否检查结果
 */
function splitGroups(groups, checkResult = false) {
    if (groups.length < 2) {
        return groups;
    }
    const processedList = [groups[0]];
    loopGroups: for (let i1 = 1; i1 < groups.length; i1++) {
        let test = groups[i1];
        const oldProcessedListLen = processedList.length;
        for (let i2 = 0; i2 < oldProcessedListLen; i2++) {
            let processed = processedList[i2];
            const intersection = _.intersection(processed, test);
            const processedLen = processed.length, testLen = test.length, intersectionLen = intersection.length;
            // compare
            if (intersectionLen === 0) {
                continue;
            }
            else if (intersectionLen === processedLen) {
                if (processedLen !== testLen) {
                    // processed entirely contained in test
                    test = _.difference(test, intersection);
                }
                else {
                    continue loopGroups;
                }
            }
            else if (intersectionLen === testLen) {
                if (processedLen !== testLen) {
                    // test entirely contained in processed
                    processed = _.difference(processed, intersection);
                    processedList[i2] = processed;
                    processedList.push(intersection);
                }
                continue loopGroups;
            }
            else {
                test = _.difference(test, intersection);
                processed = _.difference(processed, intersection);
                processedList[i2] = processed;
                processedList.push(intersection);
            }
        }
        processedList.push(test);
    }
    if (checkResult) {
        const resFlatten = _.flatten(processedList);
        const resUniq = _.uniq(resFlatten);
        if (resUniq.length < resFlatten.length) {
            console.warn('Internal error: SizeMinimized.transformGroups: res not unique, transform canceled');
            return groups;
        }
        else {
            const inputFlatten = _.flatten(groups);
            const diff = _.difference(inputFlatten, resUniq);
            if (diff.length > 0) {
                console.warn('Internal error: SizeMinimized.transformGroups: not have the same members, transform canceled');
                return groups;
            }
        }
    }
    return processedList;
}
// TODO json 分组不应该简单只依照依赖关系，应该考虑到控制最终大 json 在一定范围之内
// TODO 资源依赖关系在 bundle 整理资源时已经查询过一次，理论上不需要重复整理，这个递归比较消耗需要尽量减少不必要的查询
// 否则有可能出现非常大的 json 文件，这对加载来说没有好处
/**
 * 爬取某个资源依赖的 json 资源的分组数据
 * @param uuid
 */
async function walk(asset, bundle) {
    // 资源依赖数组
    const assetDepends = [];
    const hasChecked = new Set();
    const rawAsset = asset;
    /**
     * 获取依赖 uuid 数组
     * @param uuid
     */
    async function getDepends(asset) {
        hasChecked.add(asset.uuid);
        if (bundle.getRedirect(asset.uuid)) {
            return;
        }
        if (assetDepends.includes(asset.uuid)) {
            return;
        }
        // 有 json 文件的，才会被记录
        if (asset.meta.files.includes('.json')) {
            assetDepends.push(asset.uuid);
        }
        // 将不满足条件的资源 uuid 排除出去
        const uuids = (await asset_library_1.buildAssetLibrary.getDependUuids(asset.uuid) || []).filter((uuid) => {
            const asset = asset_library_1.buildAssetLibrary.getAsset(uuid);
            if (!asset) {
                return false;
            }
            const assetType = asset_library_1.buildAssetLibrary.getAssetProperty(asset, 'type');
            if (!assetType) {
                return;
            }
            if (assetType === 'cc.Texture2D') {
                return false;
            }
            const ctor = cc.js.getClassByName(assetType);
            return ctor;
        });
        // 需要递归查询依赖的资源是否还有依赖
        for (let i = 0; i < uuids.length; i++) {
            const sUuid = uuids[i];
            if (hasChecked.has(sUuid)) {
                if (sUuid === asset.uuid || sUuid === rawAsset.uuid) {
                    console.debug(`[json-group] check self or raw asset, skip. ${sUuid} depended by ${asset.uuid} has checked in raw asset ${rawAsset.uuid}/bundle(${bundle.name})}`);
                    continue;
                }
                // console.debug(`[json-group] ${sUuid} depended by ${asset.uuid} has checked in raw asset ${rawAsset.uuid}}`);
                continue;
            }
            await getDepends(asset_library_1.buildAssetLibrary.getAsset(sUuid));
        }
    }
    // 将不满足条件的资源 uuid 排除出去
    await getDepends(asset);
    // 如果没有依赖，则不需要分组
    if (!assetDepends || assetDepends.length < 1) {
        // 如果没有 json 文件，则跳过
        if (asset.meta.files.includes('.json')) {
            return [asset.uuid];
        }
        else {
            return [];
        }
    }
    // 将自己添加到合并队列
    if (!assetDepends.includes(asset.uuid) && asset.meta.files.includes('.json')) {
        assetDepends.push(asset.uuid);
    }
    return [...new Set(assetDepends)];
}
/**
 * 检查一个 uuid 是否已经在其他分组里
 * @param uuid
 * @param groups
 */
function hasGroups(uuid, groups) {
    for (let i = 0; i < groups.length; i++) {
        const list = groups[i];
        for (let j = 0; j < list.length; j++) {
            if (list[j] === uuid) {
                return true;
            }
        }
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2J1aWxkZXIvd29ya2VyL2J1aWxkZXIvYXNzZXQtaGFuZGxlci9qc29uLWdyb3VwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFpQmIsa0NBZ0VDO0FBU0Qsb0JBMEVDO0FBT0QsOEJBV0M7QUFsTEQsNERBQTZEO0FBSTdELE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUU1Qjs7Ozs7O0dBTUc7QUFDSCxTQUFnQixXQUFXLENBQUMsTUFBa0IsRUFBRSxXQUFXLEdBQUcsS0FBSztJQUUvRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDcEIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNELE1BQU0sYUFBYSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEMsVUFBVSxFQUNWLEtBQUssSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDeEMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sbUJBQW1CLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQztRQUNqRCxLQUFLLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsbUJBQW1CLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUM5QyxJQUFJLFNBQVMsR0FBRyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDckQsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxlQUFlLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztZQUNwRyxVQUFVO1lBQ1YsSUFBSSxlQUFlLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ3hCLFNBQVM7WUFDYixDQUFDO2lCQUNJLElBQUksZUFBZSxLQUFLLFlBQVksRUFBRSxDQUFDO2dCQUN4QyxJQUFJLFlBQVksS0FBSyxPQUFPLEVBQUUsQ0FBQztvQkFDM0IsdUNBQXVDO29CQUN2QyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQzVDLENBQUM7cUJBQ0ksQ0FBQztvQkFDRixTQUFTLFVBQVUsQ0FBQztnQkFDeEIsQ0FBQztZQUNMLENBQUM7aUJBQ0ksSUFBSSxlQUFlLEtBQUssT0FBTyxFQUFFLENBQUM7Z0JBQ25DLElBQUksWUFBWSxLQUFLLE9BQU8sRUFBRSxDQUFDO29CQUMzQix1Q0FBdUM7b0JBQ3ZDLFNBQVMsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztvQkFDbEQsYUFBYSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQztvQkFDOUIsYUFBYSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDckMsQ0FBQztnQkFDRCxTQUFTLFVBQVUsQ0FBQztZQUN4QixDQUFDO2lCQUNJLENBQUM7Z0JBQ0YsSUFBSSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUN4QyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQ2xELGFBQWEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUM7Z0JBQzlCLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDckMsQ0FBQztRQUNMLENBQUM7UUFDRCxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ2QsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM1QyxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25DLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxtRkFBbUYsQ0FBQyxDQUFDO1lBQ2xHLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7YUFDSSxDQUFDO1lBQ0YsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNqRCxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsOEZBQThGLENBQUMsQ0FBQztnQkFDN0csT0FBTyxNQUFNLENBQUM7WUFDbEIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsT0FBTyxhQUFhLENBQUM7QUFDekIsQ0FBQztBQUVELG1EQUFtRDtBQUNuRCxtRUFBbUU7QUFDbkUsaUNBQWlDO0FBQ2pDOzs7R0FHRztBQUNJLEtBQUssVUFBVSxJQUFJLENBQUMsS0FBYSxFQUFFLE1BQWU7SUFDckQsU0FBUztJQUNULE1BQU0sWUFBWSxHQUFhLEVBQUUsQ0FBQztJQUNsQyxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO0lBQ3JDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQztJQUN2Qjs7O09BR0c7SUFDSCxLQUFLLFVBQVUsVUFBVSxDQUFDLEtBQWE7UUFDbkMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ2pDLE9BQU87UUFDWCxDQUFDO1FBQ0QsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3BDLE9BQU87UUFDWCxDQUFDO1FBRUQsbUJBQW1CO1FBQ25CLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDckMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUVELHNCQUFzQjtRQUN0QixNQUFNLEtBQUssR0FBRyxDQUFDLE1BQU0saUNBQWlCLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFZLEVBQUUsRUFBRTtZQUM3RixNQUFNLEtBQUssR0FBRyxpQ0FBaUIsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNULE9BQU8sS0FBSyxDQUFDO1lBQ2pCLENBQUM7WUFDRCxNQUFNLFNBQVMsR0FBRyxpQ0FBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNiLE9BQU87WUFDWCxDQUFDO1lBQ0QsSUFBSSxTQUFTLEtBQUssY0FBYyxFQUFFLENBQUM7Z0JBQy9CLE9BQU8sS0FBSyxDQUFDO1lBQ2pCLENBQUM7WUFDRCxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM3QyxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztRQUVILG9CQUFvQjtRQUNwQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3BDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsSUFBSSxLQUFLLEtBQUssS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLEtBQUssUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNsRCxPQUFPLENBQUMsS0FBSyxDQUFDLCtDQUErQyxLQUFLLGdCQUFnQixLQUFLLENBQUMsSUFBSSw2QkFBNkIsUUFBUSxDQUFDLElBQUksV0FBVyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztvQkFDbEssU0FBUztnQkFDYixDQUFDO2dCQUNELCtHQUErRztnQkFDL0csU0FBUztZQUNiLENBQUM7WUFDRCxNQUFNLFVBQVUsQ0FBQyxpQ0FBaUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN4RCxDQUFDO0lBQ0wsQ0FBQztJQUVELHNCQUFzQjtJQUN0QixNQUFNLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUV4QixnQkFBZ0I7SUFDaEIsSUFBSSxDQUFDLFlBQVksSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzNDLG1CQUFtQjtRQUNuQixJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsQ0FBQzthQUFNLENBQUM7WUFDSixPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUM7SUFDTCxDQUFDO0lBRUQsYUFBYTtJQUNiLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUMzRSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQWdCLFNBQVMsQ0FBQyxJQUFZLEVBQUUsTUFBa0I7SUFDdEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNyQyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNuQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDbkIsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IElBc3NldCB9IGZyb20gJy4uLy4uLy4uLy4uL2Fzc2V0cy9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IHsgSUJ1bmRsZSB9IGZyb20gJy4uLy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBidWlsZEFzc2V0TGlicmFyeSB9IGZyb20gJy4uL21hbmFnZXIvYXNzZXQtbGlicmFyeSc7XHJcblxyXG5kZWNsYXJlIGNvbnN0IGNjOiBhbnk7XHJcblxyXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XHJcblxyXG4vKipcclxuICog5YiG57uE6YeN5paw5YiS5YiGXHJcbiAqIOWwhuaJgOacieWIhue7hOWGhe+8jOmHjeWkjeeahOaVsOaNru+8jOWNleeLrOaPkOWPluaIkOaWsOeahOWIhue7hFxyXG4gKiBcclxuICogQHBhcmFtIGdyb3VwcyDkvKDlhaXkuIDkuKrliIbnu4TmlbDnu4TvvIjkuoznu7TmlbDnu4TvvIlcclxuICogQHBhcmFtIGNoZWNrUmVzdWx0IOaYr+WQpuajgOafpee7k+aenFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0R3JvdXBzKGdyb3Vwczogc3RyaW5nW11bXSwgY2hlY2tSZXN1bHQgPSBmYWxzZSkge1xyXG5cclxuICAgIGlmIChncm91cHMubGVuZ3RoIDwgMikge1xyXG4gICAgICAgIHJldHVybiBncm91cHM7XHJcbiAgICB9XHJcbiAgICBjb25zdCBwcm9jZXNzZWRMaXN0ID0gW2dyb3Vwc1swXV07XHJcbiAgICBsb29wR3JvdXBzOlxyXG4gICAgZm9yIChsZXQgaTEgPSAxOyBpMSA8IGdyb3Vwcy5sZW5ndGg7IGkxKyspIHtcclxuICAgICAgICBsZXQgdGVzdCA9IGdyb3Vwc1tpMV07XHJcbiAgICAgICAgY29uc3Qgb2xkUHJvY2Vzc2VkTGlzdExlbiA9IHByb2Nlc3NlZExpc3QubGVuZ3RoO1xyXG4gICAgICAgIGZvciAobGV0IGkyID0gMDsgaTIgPCBvbGRQcm9jZXNzZWRMaXN0TGVuOyBpMisrKSB7XHJcbiAgICAgICAgICAgIGxldCBwcm9jZXNzZWQgPSBwcm9jZXNzZWRMaXN0W2kyXTtcclxuICAgICAgICAgICAgY29uc3QgaW50ZXJzZWN0aW9uID0gXy5pbnRlcnNlY3Rpb24ocHJvY2Vzc2VkLCB0ZXN0KTtcclxuICAgICAgICAgICAgY29uc3QgcHJvY2Vzc2VkTGVuID0gcHJvY2Vzc2VkLmxlbmd0aCwgdGVzdExlbiA9IHRlc3QubGVuZ3RoLCBpbnRlcnNlY3Rpb25MZW4gPSBpbnRlcnNlY3Rpb24ubGVuZ3RoO1xyXG4gICAgICAgICAgICAvLyBjb21wYXJlXHJcbiAgICAgICAgICAgIGlmIChpbnRlcnNlY3Rpb25MZW4gPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGludGVyc2VjdGlvbkxlbiA9PT0gcHJvY2Vzc2VkTGVuKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJvY2Vzc2VkTGVuICE9PSB0ZXN0TGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJvY2Vzc2VkIGVudGlyZWx5IGNvbnRhaW5lZCBpbiB0ZXN0XHJcbiAgICAgICAgICAgICAgICAgICAgdGVzdCA9IF8uZGlmZmVyZW5jZSh0ZXN0LCBpbnRlcnNlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWUgbG9vcEdyb3VwcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpbnRlcnNlY3Rpb25MZW4gPT09IHRlc3RMZW4pIHtcclxuICAgICAgICAgICAgICAgIGlmIChwcm9jZXNzZWRMZW4gIT09IHRlc3RMZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyB0ZXN0IGVudGlyZWx5IGNvbnRhaW5lZCBpbiBwcm9jZXNzZWRcclxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWQgPSBfLmRpZmZlcmVuY2UocHJvY2Vzc2VkLCBpbnRlcnNlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NlZExpc3RbaTJdID0gcHJvY2Vzc2VkO1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NlZExpc3QucHVzaChpbnRlcnNlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGludWUgbG9vcEdyb3VwcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRlc3QgPSBfLmRpZmZlcmVuY2UodGVzdCwgaW50ZXJzZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3NlZCA9IF8uZGlmZmVyZW5jZShwcm9jZXNzZWQsIGludGVyc2VjdGlvbik7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzZWRMaXN0W2kyXSA9IHByb2Nlc3NlZDtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3NlZExpc3QucHVzaChpbnRlcnNlY3Rpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb2Nlc3NlZExpc3QucHVzaCh0ZXN0KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY2hlY2tSZXN1bHQpIHtcclxuICAgICAgICBjb25zdCByZXNGbGF0dGVuID0gXy5mbGF0dGVuKHByb2Nlc3NlZExpc3QpO1xyXG4gICAgICAgIGNvbnN0IHJlc1VuaXEgPSBfLnVuaXEocmVzRmxhdHRlbik7XHJcbiAgICAgICAgaWYgKHJlc1VuaXEubGVuZ3RoIDwgcmVzRmxhdHRlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdJbnRlcm5hbCBlcnJvcjogU2l6ZU1pbmltaXplZC50cmFuc2Zvcm1Hcm91cHM6IHJlcyBub3QgdW5pcXVlLCB0cmFuc2Zvcm0gY2FuY2VsZWQnKTtcclxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwcztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlucHV0RmxhdHRlbiA9IF8uZmxhdHRlbihncm91cHMpO1xyXG4gICAgICAgICAgICBjb25zdCBkaWZmID0gXy5kaWZmZXJlbmNlKGlucHV0RmxhdHRlbiwgcmVzVW5pcSk7XHJcbiAgICAgICAgICAgIGlmIChkaWZmLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSW50ZXJuYWwgZXJyb3I6IFNpemVNaW5pbWl6ZWQudHJhbnNmb3JtR3JvdXBzOiBub3QgaGF2ZSB0aGUgc2FtZSBtZW1iZXJzLCB0cmFuc2Zvcm0gY2FuY2VsZWQnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBncm91cHM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHByb2Nlc3NlZExpc3Q7XHJcbn1cclxuXHJcbi8vIFRPRE8ganNvbiDliIbnu4TkuI3lupTor6XnroDljZXlj6rkvp3nhafkvp3otZblhbPns7vvvIzlupTor6XogIPomZHliLDmjqfliLbmnIDnu4jlpKcganNvbiDlnKjkuIDlrprojIPlm7TkuYvlhoVcclxuLy8gVE9ETyDotYTmupDkvp3otZblhbPns7vlnKggYnVuZGxlIOaVtOeQhui1hOa6kOaXtuW3sue7j+afpeivoui/h+S4gOasoe+8jOeQhuiuuuS4iuS4jemcgOimgemHjeWkjeaVtOeQhu+8jOi/meS4qumAkuW9kuavlOi+g+a2iOiAl+mcgOimgeWwvemHj+WHj+WwkeS4jeW/heimgeeahOafpeivolxyXG4vLyDlkKbliJnmnInlj6/og73lh7rnjrDpnZ7luLjlpKfnmoQganNvbiDmlofku7bvvIzov5nlr7nliqDovb3mnaXor7TmsqHmnInlpb3lpIRcclxuLyoqXHJcbiAqIOeIrOWPluafkOS4qui1hOa6kOS+nei1lueahCBqc29uIOi1hOa6kOeahOWIhue7hOaVsOaNrlxyXG4gKiBAcGFyYW0gdXVpZFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdhbGsoYXNzZXQ6IElBc3NldCwgYnVuZGxlOiBJQnVuZGxlKSB7XHJcbiAgICAvLyDotYTmupDkvp3otZbmlbDnu4RcclxuICAgIGNvbnN0IGFzc2V0RGVwZW5kczogc3RyaW5nW10gPSBbXTtcclxuICAgIGNvbnN0IGhhc0NoZWNrZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICAgIGNvbnN0IHJhd0Fzc2V0ID0gYXNzZXQ7XHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluS+nei1liB1dWlkIOaVsOe7hFxyXG4gICAgICogQHBhcmFtIHV1aWRcclxuICAgICAqL1xyXG4gICAgYXN5bmMgZnVuY3Rpb24gZ2V0RGVwZW5kcyhhc3NldDogSUFzc2V0KSB7XHJcbiAgICAgICAgaGFzQ2hlY2tlZC5hZGQoYXNzZXQudXVpZCk7XHJcbiAgICAgICAgaWYgKGJ1bmRsZS5nZXRSZWRpcmVjdChhc3NldC51dWlkKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhc3NldERlcGVuZHMuaW5jbHVkZXMoYXNzZXQudXVpZCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5pyJIGpzb24g5paH5Lu255qE77yM5omN5Lya6KKr6K6w5b2VXHJcbiAgICAgICAgaWYgKGFzc2V0Lm1ldGEuZmlsZXMuaW5jbHVkZXMoJy5qc29uJykpIHtcclxuICAgICAgICAgICAgYXNzZXREZXBlbmRzLnB1c2goYXNzZXQudXVpZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDlsIbkuI3mu6HotrPmnaHku7bnmoTotYTmupAgdXVpZCDmjpLpmaTlh7rljrtcclxuICAgICAgICBjb25zdCB1dWlkcyA9IChhd2FpdCBidWlsZEFzc2V0TGlicmFyeS5nZXREZXBlbmRVdWlkcyhhc3NldC51dWlkKSB8fCBbXSkuZmlsdGVyKCh1dWlkOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYXNzZXQgPSBidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldCh1dWlkKTtcclxuICAgICAgICAgICAgaWYgKCFhc3NldCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0VHlwZSA9IGJ1aWxkQXNzZXRMaWJyYXJ5LmdldEFzc2V0UHJvcGVydHkoYXNzZXQsICd0eXBlJyk7XHJcbiAgICAgICAgICAgIGlmICghYXNzZXRUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFzc2V0VHlwZSA9PT0gJ2NjLlRleHR1cmUyRCcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBjdG9yID0gY2MuanMuZ2V0Q2xhc3NCeU5hbWUoYXNzZXRUeXBlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGN0b3I7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIOmcgOimgemAkuW9kuafpeivouS+nei1lueahOi1hOa6kOaYr+WQpui/mOacieS+nei1llxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdXVpZHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3Qgc1V1aWQgPSB1dWlkc1tpXTtcclxuICAgICAgICAgICAgaWYgKGhhc0NoZWNrZWQuaGFzKHNVdWlkKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNVdWlkID09PSBhc3NldC51dWlkIHx8IHNVdWlkID09PSByYXdBc3NldC51dWlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgW2pzb24tZ3JvdXBdIGNoZWNrIHNlbGYgb3IgcmF3IGFzc2V0LCBza2lwLiAke3NVdWlkfSBkZXBlbmRlZCBieSAke2Fzc2V0LnV1aWR9IGhhcyBjaGVja2VkIGluIHJhdyBhc3NldCAke3Jhd0Fzc2V0LnV1aWR9L2J1bmRsZSgke2J1bmRsZS5uYW1lfSl9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmRlYnVnKGBbanNvbi1ncm91cF0gJHtzVXVpZH0gZGVwZW5kZWQgYnkgJHthc3NldC51dWlkfSBoYXMgY2hlY2tlZCBpbiByYXcgYXNzZXQgJHtyYXdBc3NldC51dWlkfX1gKTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGF3YWl0IGdldERlcGVuZHMoYnVpbGRBc3NldExpYnJhcnkuZ2V0QXNzZXQoc1V1aWQpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5bCG5LiN5ruh6Laz5p2h5Lu255qE6LWE5rqQIHV1aWQg5o6S6Zmk5Ye65Y67XHJcbiAgICBhd2FpdCBnZXREZXBlbmRzKGFzc2V0KTtcclxuXHJcbiAgICAvLyDlpoLmnpzmsqHmnInkvp3otZbvvIzliJnkuI3pnIDopoHliIbnu4RcclxuICAgIGlmICghYXNzZXREZXBlbmRzIHx8IGFzc2V0RGVwZW5kcy5sZW5ndGggPCAxKSB7XHJcbiAgICAgICAgLy8g5aaC5p6c5rKh5pyJIGpzb24g5paH5Lu277yM5YiZ6Lez6L+HXHJcbiAgICAgICAgaWYgKGFzc2V0Lm1ldGEuZmlsZXMuaW5jbHVkZXMoJy5qc29uJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFthc3NldC51dWlkXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIOWwhuiHquW3sea3u+WKoOWIsOWQiOW5tumYn+WIl1xyXG4gICAgaWYgKCFhc3NldERlcGVuZHMuaW5jbHVkZXMoYXNzZXQudXVpZCkgJiYgYXNzZXQubWV0YS5maWxlcy5pbmNsdWRlcygnLmpzb24nKSkge1xyXG4gICAgICAgIGFzc2V0RGVwZW5kcy5wdXNoKGFzc2V0LnV1aWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbLi4ubmV3IFNldChhc3NldERlcGVuZHMpXTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOajgOafpeS4gOS4qiB1dWlkIOaYr+WQpuW3sue7j+WcqOWFtuS7luWIhue7hOmHjFxyXG4gKiBAcGFyYW0gdXVpZCBcclxuICogQHBhcmFtIGdyb3VwcyBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBoYXNHcm91cHModXVpZDogc3RyaW5nLCBncm91cHM6IHN0cmluZ1tdW10pIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ3JvdXBzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbGlzdCA9IGdyb3Vwc1tpXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBsaXN0Lmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmIChsaXN0W2pdID09PSB1dWlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG4iXX0=