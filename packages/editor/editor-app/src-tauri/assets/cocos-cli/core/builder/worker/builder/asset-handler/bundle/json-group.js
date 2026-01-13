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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleJsonGroup = handleJsonGroup;
exports.outputJsonGroup = outputJsonGroup;
const path_1 = require("path");
const bundle_utils_1 = require("../../../../share/bundle-utils");
const asset_library_1 = require("../../manager/asset-library");
const json_group_1 = require("../json-group");
const HashUuid = __importStar(require("../../utils/hash-uuid"));
const fs_extra_1 = require("fs-extra");
const utils_1 = require("../../../../share/utils");
const cc_1 = require("cc");
const i18n_1 = __importDefault(require("../../../../../base/i18n"));
async function handleJsonGroup(bundle) {
    console.debug(`handle json group in bundle ${bundle.name}`);
    // 不压缩
    if (bundle.compressionType === bundle_utils_1.BundleCompressionTypes.NONE) {
        return;
    }
    if (bundle.compressionType === bundle_utils_1.BundleCompressionTypes.MERGE_ALL_JSON) {
        // 全部压缩为一个 json
        bundle.addGroup('NORMAL', bundle.assetsWithoutRedirect);
    }
    else {
        // 分组信息存放位置
        const groups = {};
        const hasInGroup = [];
        const textureUuids = [];
        // 每个根资源与场景生成一个分组
        // 默认情况下将会尽量的合并分组，被 Bundle 内其他根资源依赖的根资源不独立成组
        for (const uuid of bundle.assetsWithoutRedirect) {
            const assetInfo = asset_library_1.buildAssetLibrary.getAsset(uuid);
            const assetType = asset_library_1.buildAssetLibrary.getAssetProperty(assetInfo, 'type');
            if (assetType == 'cc.Texture2D') {
                textureUuids.push(assetInfo.uuid);
                continue;
            }
            let groupUuids = await (0, json_group_1.walk)(assetInfo, bundle);
            if (groupUuids.length <= 1) {
                continue;
            }
            // 过滤已经在其他分组内的依赖资源 uuid
            groupUuids = groupUuids.filter((uuid) => !hasInGroup.includes(uuid));
            if (groupUuids.length <= 1) {
                continue;
            }
            hasInGroup.push(...groupUuids);
            groups[uuid] = groupUuids;
        }
        if (textureUuids.length > 1) {
            textureUuids.sort(utils_1.compareUUID);
            bundle.addGroup('TEXTURE', textureUuids);
        }
        Object.keys(groups).forEach((rootUuid) => {
            const groupUuids = groups[rootUuid];
            if (!groupUuids) {
                return;
            }
            const uudis = JSON.parse(JSON.stringify(groupUuids));
            uudis.forEach((uuid) => {
                if (rootUuid === uuid) {
                    return;
                }
                if (groups[uuid]) {
                    console.debug(`remove group uuid ${uuid}`);
                    delete groups[uuid];
                }
            });
        });
        // 重新计算分组
        // const arr = splitGroups(groups, true);
        Object.values(groups).forEach((uuids, index) => {
            // 过滤掉只有一个资源的数组
            if (uuids.length <= 1) {
                return;
            }
            bundle.addGroup('NORMAL', uuids);
        });
    }
    console.debug(`handle json group in bundle ${bundle.name} success`);
}
async function outputJsonGroup(bundle, manager) {
    const dest = (0, path_1.join)(bundle.dest, bundle.importBase);
    console.debug(`Handle all json groups in bundle ${bundle.name}`);
    let hasBuild = [];
    // 循环分组，计算每个分组的 hash 值
    const uuids = [];
    bundle.groups.forEach((group) => {
        uuids.push(group.uuids);
        if (group.uuids.length <= 1) {
            return;
        }
        hasBuild = hasBuild.concat(group.uuids);
    });
    const hasBuildSet = new Set(hasBuild);
    const hashUuids = HashUuid.calculate(uuids, HashUuid.BuiltinHashType.PackedAssets);
    // 循环分组，执行实际处理
    console.debug('handle json group');
    const assetSerializeOptions = {
        debug: manager.options.debug,
        ...manager.options.assetSerializeOptions,
    };
    for (let index = 0; index < bundle.groups.length; index++) {
        const group = bundle.groups[index];
        if (group.uuids.length <= 1) {
            continue;
        }
        // 分组名设置成当时的 hash 名字，并将 assets 进行排序
        group.name = hashUuids[index];
        group.uuids.sort(utils_1.compareUUID);
        bundle.addAssetWithUuid(group.name);
        hasBuildSet.add(group.name);
        // 如果分组类型不是 type，则跳过，这里可能是 spriteFrame 或者 texture
        if (group.type === 'TEXTURE') {
            await packTextures(dest, hashUuids[index], group);
            continue;
        }
        if (group.type === 'IMAGE') {
            await packImageAsset(dest, hashUuids[index], group);
            continue;
        }
        if (group.type !== 'NORMAL') {
            continue;
        }
        // 去重
        // group.uuids = Array.from(new Set(groupItem.jsonUuids));
        // 拼接 json 数据
        let jsons = [];
        const realUuids = [];
        group.uuids.sort();
        for (let i = 0; i < group.uuids.length; i++) {
            const assetInfo = asset_library_1.buildAssetLibrary.getAsset(group.uuids[i]);
            if (assetInfo && (!assetInfo.meta.files.includes('.json'))) {
                // 分组塞 uuid 时并不会判断是否有 json，这里需要过滤
                continue;
            }
            const json = await manager.cache.getSerializedJSON(group.uuids[i], assetSerializeOptions);
            if (!json) {
                console.error(i18n_1.default.t('builder.error.get_asset_json_failed', {
                    url: assetInfo.url,
                    type: asset_library_1.buildAssetLibrary.getAssetProperty(assetInfo, 'type'),
                }));
                continue;
            }
            realUuids.push(group.uuids[i]);
            jsons.push(json);
        }
        group.uuids = realUuids;
        jsons = JSON.parse(JSON.stringify(jsons));
        jsons = EditorExtends.serializeCompiled.packJSONs(jsons);
        await outputSerializeJSON(dest, hashUuids[index], jsons);
        // 输出部分信息
        console.debug(`Json group(${group.name}) compile success，json number: ${jsons.length}`);
    }
    console.debug('handle single json');
    // 循环所有需要输出的资源，打印单个 json 数据
    for (const uuid of bundle.assetsWithoutRedirect) {
        if (hasBuildSet.has(uuid)) {
            continue;
        }
        // 只有一个 uuid 的分组按照原来的规则生成
        const json = await manager.cache.getSerializedJSON(uuid, assetSerializeOptions);
        if (!json) {
            continue;
        }
        // Hack 输出 uuid 不一定和原始 uuid 一样，特殊字符打包出来的 uuid 要与 library 里的一致
        const asset = asset_library_1.buildAssetLibrary.getAsset(uuid);
        let destName = uuid;
        // 资源 asset 不一定存在，因为有可能是类似于合图这样新生成的资源数据
        if (asset && asset.library && asset.meta.files.includes('.json')) {
            destName = (0, path_1.basename)(asset.library);
        }
        await outputSerializeJSON(dest, destName, json);
    }
    bundle.groups.forEach((group) => {
        if (group.name) {
            bundle.addAssetWithUuid(group.name);
        }
    });
    /**
     * 合并 imageAsset 序列化信息
     */
    async function packImageAsset(dest, name, groupItem) {
        const values = await Promise.all(groupItem.uuids.map(async (uuid) => {
            const data = await manager.cache.getSerializedJSON(uuid, assetSerializeOptions);
            if (!data) {
                console.error(`Can't get SerializedJSON of asset {asset(${uuid})}`);
            }
            return data;
        }));
        const packedData = {
            type: cc_1.js.getClassId(cc_1.ImageAsset),
            data: values,
        };
        await outputSerializeJSON(dest, name, packedData);
    }
    /**
     * 合并 texture 资源
     * @param groupItem
     */
    async function packTextures(dest, name, groupItem) {
        const jsons = await Promise.all(groupItem.uuids.map(async (uuid) => {
            const data = await manager.cache.getSerializedJSON(uuid, assetSerializeOptions);
            if (!data) {
                console.error(`Can't get SerializedJSON of asset {asset(${uuid})}`);
            }
            return data;
        }));
        const values = jsons.map((json) => {
            // @ts-ignore
            const { base, mipmaps } = EditorExtends.serializeCompiled.getRootData(json);
            return [base, mipmaps];
        });
        const packedData = {
            type: cc_1.js.getClassId(cc_1.Texture2D),
            data: values,
        };
        await outputSerializeJSON(dest, name, packedData);
    }
    async function outputSerializeJSON(dest, name, json) {
        // 将拼接好的数据，实际写到指定位置
        const path = (0, path_1.join)(dest, name.substr(0, 2), name + '.json');
        // json = _compressJson(json);
        await (0, fs_extra_1.outputJSON)(path, json);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2J1aWxkZXIvd29ya2VyL2J1aWxkZXIvYXNzZXQtaGFuZGxlci9idW5kbGUvanNvbi1ncm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVlBLDBDQWlFQztBQUVELDBDQTZKQztBQTVPRCwrQkFBc0M7QUFFdEMsaUVBQXdFO0FBQ3hFLCtEQUFnRTtBQUNoRSw4Q0FBcUM7QUFDckMsZ0VBQWtEO0FBQ2xELHVDQUFzQztBQUN0QyxtREFBc0Q7QUFDdEQsMkJBQStDO0FBQy9DLG9FQUE0QztBQUdyQyxLQUFLLFVBQVUsZUFBZSxDQUFDLE1BQWU7SUFDakQsT0FBTyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDNUQsTUFBTTtJQUNOLElBQUksTUFBTSxDQUFDLGVBQWUsS0FBSyxxQ0FBc0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUFDLE9BQU87SUFBQyxDQUFDO0lBQ3ZFLElBQUksTUFBTSxDQUFDLGVBQWUsS0FBSyxxQ0FBc0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNuRSxlQUFlO1FBQ2YsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDNUQsQ0FBQztTQUFNLENBQUM7UUFDSixXQUFXO1FBQ1gsTUFBTSxNQUFNLEdBQTZCLEVBQUUsQ0FBQztRQUM1QyxNQUFNLFVBQVUsR0FBYSxFQUFFLENBQUM7UUFDaEMsTUFBTSxZQUFZLEdBQWEsRUFBRSxDQUFDO1FBRWxDLGlCQUFpQjtRQUNqQiw0Q0FBNEM7UUFDNUMsS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUM5QyxNQUFNLFNBQVMsR0FBRyxpQ0FBaUIs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QixDQUFDLENBQUMsQ0FDTCxDQUFDO1FBQ0YsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQVMsRUFBRSxFQUFFO1lBQ25DLGFBQWE7WUFDYixNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUUsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sVUFBVSxHQUFHO1lBQ2YsSUFBSSxFQUFFLE9BQUUsQ0FBQyxVQUFVLENBQUMsY0FBUyxDQUFDO1lBQzlCLElBQUksRUFBRSxNQUFNO1NBQ2YsQ0FBQztRQUNGLE1BQU0sbUJBQW1CLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsS0FBSyxVQUFVLG1CQUFtQixDQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsSUFBUztRQUNwRSxtQkFBbUI7UUFDbkIsTUFBTSxJQUFJLEdBQUcsSUFBQSxXQUFJLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQztRQUMzRCw4QkFBOEI7UUFDOUIsTUFBTSxJQUFBLHFCQUFVLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmFzZW5hbWUsIGpvaW4gfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgQnVuZGxlTWFuYWdlciB9IGZyb20gJy4nO1xyXG5pbXBvcnQgeyBCdW5kbGVDb21wcmVzc2lvblR5cGVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2hhcmUvYnVuZGxlLXV0aWxzJztcclxuaW1wb3J0IHsgYnVpbGRBc3NldExpYnJhcnkgfSBmcm9tICcuLi8uLi9tYW5hZ2VyL2Fzc2V0LWxpYnJhcnknO1xyXG5pbXBvcnQgeyB3YWxrIH0gZnJvbSAnLi4vanNvbi1ncm91cCc7XHJcbmltcG9ydCAqIGFzIEhhc2hVdWlkIGZyb20gJy4uLy4uL3V0aWxzL2hhc2gtdXVpZCc7XHJcbmltcG9ydCB7IG91dHB1dEpTT04gfSBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCB7IGNvbXBhcmVVVUlEIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2hhcmUvdXRpbHMnO1xyXG5pbXBvcnQgeyBJbWFnZUFzc2V0LCBqcywgVGV4dHVyZTJEIH0gZnJvbSAnY2MnO1xyXG5pbXBvcnQgaTE4biBmcm9tICcuLi8uLi8uLi8uLi8uLi9iYXNlL2kxOG4nO1xyXG5pbXBvcnQgeyBJQnVuZGxlLCBJR3JvdXAgfSBmcm9tICcuLi8uLi8uLi8uLi9AdHlwZXMvcHJvdGVjdGVkJztcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVKc29uR3JvdXAoYnVuZGxlOiBJQnVuZGxlKSB7XHJcbiAgICBjb25zb2xlLmRlYnVnKGBoYW5kbGUganNvbiBncm91cCBpbiBidW5kbGUgJHtidW5kbGUubmFtZX1gKTtcclxuICAgIC8vIOS4jeWOi+e8qVxyXG4gICAgaWYgKGJ1bmRsZS5jb21wcmVzc2lvblR5cGUgPT09IEJ1bmRsZUNvbXByZXNzaW9uVHlwZXMuTk9ORSkgeyByZXR1cm47IH1cclxuICAgIGlmIChidW5kbGUuY29tcHJlc3Npb25UeXBlID09PSBCdW5kbGVDb21wcmVzc2lvblR5cGVzLk1FUkdFX0FMTF9KU09OKSB7XHJcbiAgICAgICAgLy8g5YWo6YOo5Y6L57yp5Li65LiA5LiqIGpzb25cclxuICAgICAgICBidW5kbGUuYWRkR3JvdXAoJ05PUk1BTCcsIGJ1bmRsZS5hc3NldHNXaXRob3V0UmVkaXJlY3QpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyDliIbnu4Tkv6Hmga/lrZjmlL7kvY3nva5cclxuICAgICAgICBjb25zdCBncm91cHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHt9O1xyXG4gICAgICAgIGNvbnN0IGhhc0luR3JvdXA6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgY29uc3QgdGV4dHVyZVV1aWRzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgICAgICAvLyDmr4/kuKrmoLnotYTmupDkuI7lnLrmma/nlJ/miJDkuIDkuKrliIbnu4RcclxuICAgICAgICAvLyDpu5jorqTmg4XlhrXkuIvlsIbkvJrlsL3ph4/nmoTlkIjlubbliIbnu4TvvIzooqsgQnVuZGxlIOWGheWFtuS7luaguei1hOa6kOS+nei1lueahOaguei1hOa6kOS4jeeLrOeri+aIkOe7hFxyXG4gICAgICAgIGZvciAoY29uc3QgdXVpZCBvZiBidW5kbGUuYXNzZXRzV2l0aG91dFJlZGlyZWN0KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0SW5mbyA9IGJ1aWxkQXNzZXRMaWJyYXJ5LmdldEFzc2V0KHV1aWQpO1xyXG4gICAgICAgICAgICBjb25zdCBhc3NldFR5cGUgPSBidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldFByb3BlcnR5KGFzc2V0SW5mbywgJ3R5cGUnKTtcclxuICAgICAgICAgICAgaWYgKGFzc2V0VHlwZSA9PSAnY2MuVGV4dHVyZTJEJykge1xyXG4gICAgICAgICAgICAgICAgdGV4dHVyZVV1aWRzLnB1c2goYXNzZXRJbmZvLnV1aWQpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGdyb3VwVXVpZHMgPSBhd2FpdCB3YWxrKGFzc2V0SW5mbywgYnVuZGxlKTtcclxuICAgICAgICAgICAgaWYgKGdyb3VwVXVpZHMubGVuZ3RoIDw9IDEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOi/h+a7pOW3sue7j+WcqOWFtuS7luWIhue7hOWGheeahOS+nei1lui1hOa6kCB1dWlkXHJcbiAgICAgICAgICAgIGdyb3VwVXVpZHMgPSBncm91cFV1aWRzLmZpbHRlcigodXVpZCkgPT4gIWhhc0luR3JvdXAuaW5jbHVkZXModXVpZCkpO1xyXG4gICAgICAgICAgICBpZiAoZ3JvdXBVdWlkcy5sZW5ndGggPD0gMSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaGFzSW5Hcm91cC5wdXNoKC4uLmdyb3VwVXVpZHMpO1xyXG4gICAgICAgICAgICBncm91cHNbdXVpZF0gPSBncm91cFV1aWRzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGV4dHVyZVV1aWRzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgdGV4dHVyZVV1aWRzLnNvcnQoY29tcGFyZVVVSUQpO1xyXG4gICAgICAgICAgICBidW5kbGUuYWRkR3JvdXAoJ1RFWFRVUkUnLCB0ZXh0dXJlVXVpZHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgT2JqZWN0LmtleXMoZ3JvdXBzKS5mb3JFYWNoKChyb290VXVpZCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBncm91cFV1aWRzID0gZ3JvdXBzW3Jvb3RVdWlkXTtcclxuICAgICAgICAgICAgaWYgKCFncm91cFV1aWRzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgdXVkaXM6IHN0cmluZ1tdID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShncm91cFV1aWRzKSk7XHJcbiAgICAgICAgICAgIHV1ZGlzLmZvckVhY2goKHV1aWQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChyb290VXVpZCA9PT0gdXVpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChncm91cHNbdXVpZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKGByZW1vdmUgZ3JvdXAgdXVpZCAke3V1aWR9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGdyb3Vwc1t1dWlkXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIOmHjeaWsOiuoeeul+WIhue7hFxyXG4gICAgICAgIC8vIGNvbnN0IGFyciA9IHNwbGl0R3JvdXBzKGdyb3VwcywgdHJ1ZSk7XHJcbiAgICAgICAgT2JqZWN0LnZhbHVlcyhncm91cHMpLmZvckVhY2goKHV1aWRzLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAvLyDov4fmu6Tmjonlj6rmnInkuIDkuKrotYTmupDnmoTmlbDnu4RcclxuICAgICAgICAgICAgaWYgKHV1aWRzLmxlbmd0aCA8PSAxKSB7IHJldHVybjsgfVxyXG4gICAgICAgICAgICBidW5kbGUuYWRkR3JvdXAoJ05PUk1BTCcsIHV1aWRzKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGNvbnNvbGUuZGVidWcoYGhhbmRsZSBqc29uIGdyb3VwIGluIGJ1bmRsZSAke2J1bmRsZS5uYW1lfSBzdWNjZXNzYCk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvdXRwdXRKc29uR3JvdXAoYnVuZGxlOiBJQnVuZGxlLCBtYW5hZ2VyOiBCdW5kbGVNYW5hZ2VyKSB7XHJcbiAgICBjb25zdCBkZXN0ID0gam9pbihidW5kbGUuZGVzdCwgYnVuZGxlLmltcG9ydEJhc2UpO1xyXG4gICAgY29uc29sZS5kZWJ1ZyhgSGFuZGxlIGFsbCBqc29uIGdyb3VwcyBpbiBidW5kbGUgJHtidW5kbGUubmFtZX1gKTtcclxuICAgIGxldCBoYXNCdWlsZDogc3RyaW5nW10gPSBbXTtcclxuICAgIC8vIOW+queOr+WIhue7hO+8jOiuoeeul+avj+S4quWIhue7hOeahCBoYXNoIOWAvFxyXG4gICAgY29uc3QgdXVpZHM6IHN0cmluZ1tdW10gPSBbXTtcclxuICAgIGJ1bmRsZS5ncm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IHtcclxuICAgICAgICB1dWlkcy5wdXNoKGdyb3VwLnV1aWRzKTtcclxuICAgICAgICBpZiAoZ3JvdXAudXVpZHMubGVuZ3RoIDw9IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBoYXNCdWlsZCA9IGhhc0J1aWxkLmNvbmNhdChncm91cC51dWlkcyk7XHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGhhc0J1aWxkU2V0ID0gbmV3IFNldChoYXNCdWlsZCk7XHJcbiAgICBjb25zdCBoYXNoVXVpZHM6IHN0cmluZ1tdID0gSGFzaFV1aWQuY2FsY3VsYXRlKHV1aWRzLCBIYXNoVXVpZC5CdWlsdGluSGFzaFR5cGUuUGFja2VkQXNzZXRzKTtcclxuICAgIC8vIOW+queOr+WIhue7hO+8jOaJp+ihjOWunumZheWkhOeQhlxyXG4gICAgY29uc29sZS5kZWJ1ZygnaGFuZGxlIGpzb24gZ3JvdXAnKTtcclxuXHJcbiAgICBjb25zdCBhc3NldFNlcmlhbGl6ZU9wdGlvbnMgPSB7XHJcbiAgICAgICAgZGVidWc6IG1hbmFnZXIub3B0aW9ucy5kZWJ1ZyxcclxuICAgICAgICAuLi5tYW5hZ2VyLm9wdGlvbnMuYXNzZXRTZXJpYWxpemVPcHRpb25zLFxyXG4gICAgfTtcclxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBidW5kbGUuZ3JvdXBzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwID0gYnVuZGxlLmdyb3Vwc1tpbmRleF07XHJcblxyXG4gICAgICAgIGlmIChncm91cC51dWlkcy5sZW5ndGggPD0gMSkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5YiG57uE5ZCN6K6+572u5oiQ5b2T5pe255qEIGhhc2gg5ZCN5a2X77yM5bm25bCGIGFzc2V0cyDov5vooYzmjpLluo9cclxuICAgICAgICBncm91cC5uYW1lID0gaGFzaFV1aWRzW2luZGV4XTtcclxuICAgICAgICBncm91cC51dWlkcy5zb3J0KGNvbXBhcmVVVUlEKTtcclxuICAgICAgICBidW5kbGUuYWRkQXNzZXRXaXRoVXVpZChncm91cC5uYW1lKTtcclxuICAgICAgICBoYXNCdWlsZFNldC5hZGQoZ3JvdXAubmFtZSk7XHJcbiAgICAgICAgLy8g5aaC5p6c5YiG57uE57G75Z6L5LiN5pivIHR5cGXvvIzliJnot7Pov4fvvIzov5nph4zlj6/og73mmK8gc3ByaXRlRnJhbWUg5oiW6ICFIHRleHR1cmVcclxuICAgICAgICBpZiAoZ3JvdXAudHlwZSA9PT0gJ1RFWFRVUkUnKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHBhY2tUZXh0dXJlcyhkZXN0LCBoYXNoVXVpZHNbaW5kZXhdLCBncm91cCk7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZ3JvdXAudHlwZSA9PT0gJ0lNQUdFJykge1xyXG4gICAgICAgICAgICBhd2FpdCBwYWNrSW1hZ2VBc3NldChkZXN0LCBoYXNoVXVpZHNbaW5kZXhdLCBncm91cCk7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZ3JvdXAudHlwZSAhPT0gJ05PUk1BTCcpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWOu+mHjVxyXG4gICAgICAgIC8vIGdyb3VwLnV1aWRzID0gQXJyYXkuZnJvbShuZXcgU2V0KGdyb3VwSXRlbS5qc29uVXVpZHMpKTtcclxuXHJcbiAgICAgICAgLy8g5ou85o6lIGpzb24g5pWw5o2uXHJcbiAgICAgICAgbGV0IGpzb25zOiBBcnJheTxhbnkgfCBudWxsPiA9IFtdO1xyXG4gICAgICAgIGNvbnN0IHJlYWxVdWlkczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBncm91cC51dWlkcy5zb3J0KCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncm91cC51dWlkcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBhc3NldEluZm8gPSBidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldChncm91cC51dWlkc1tpXSk7XHJcbiAgICAgICAgICAgIGlmIChhc3NldEluZm8gJiYgKCFhc3NldEluZm8ubWV0YS5maWxlcy5pbmNsdWRlcygnLmpzb24nKSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIOWIhue7hOWhniB1dWlkIOaXtuW5tuS4jeS8muWIpOaWreaYr+WQpuaciSBqc29u77yM6L+Z6YeM6ZyA6KaB6L+H5rukXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBqc29uID0gYXdhaXQgbWFuYWdlci5jYWNoZS5nZXRTZXJpYWxpemVkSlNPTihncm91cC51dWlkc1tpXSwgYXNzZXRTZXJpYWxpemVPcHRpb25zKTtcclxuICAgICAgICAgICAgaWYgKCFqc29uKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGkxOG4udCgnYnVpbGRlci5lcnJvci5nZXRfYXNzZXRfanNvbl9mYWlsZWQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBhc3NldEluZm8udXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGJ1aWxkQXNzZXRMaWJyYXJ5LmdldEFzc2V0UHJvcGVydHkoYXNzZXRJbmZvLCAndHlwZScpLFxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVhbFV1aWRzLnB1c2goZ3JvdXAudXVpZHNbaV0pO1xyXG4gICAgICAgICAgICBqc29ucy5wdXNoKGpzb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBncm91cC51dWlkcyA9IHJlYWxVdWlkcztcclxuICAgICAgICBqc29ucyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoanNvbnMpKTtcclxuICAgICAgICBqc29ucyA9IEVkaXRvckV4dGVuZHMuc2VyaWFsaXplQ29tcGlsZWQucGFja0pTT05zKGpzb25zKTtcclxuICAgICAgICBhd2FpdCBvdXRwdXRTZXJpYWxpemVKU09OKGRlc3QsIGhhc2hVdWlkc1tpbmRleF0sIGpzb25zKTtcclxuICAgICAgICAvLyDovpPlh7rpg6jliIbkv6Hmga9cclxuICAgICAgICBjb25zb2xlLmRlYnVnKGBKc29uIGdyb3VwKCR7Z3JvdXAubmFtZX0pIGNvbXBpbGUgc3VjY2Vzc++8jGpzb24gbnVtYmVyOiAke2pzb25zLmxlbmd0aH1gKTtcclxuICAgIH1cclxuICAgIGNvbnNvbGUuZGVidWcoJ2hhbmRsZSBzaW5nbGUganNvbicpO1xyXG4gICAgLy8g5b6q546v5omA5pyJ6ZyA6KaB6L6T5Ye655qE6LWE5rqQ77yM5omT5Y2w5Y2V5LiqIGpzb24g5pWw5o2uXHJcbiAgICBmb3IgKGNvbnN0IHV1aWQgb2YgYnVuZGxlLmFzc2V0c1dpdGhvdXRSZWRpcmVjdCkge1xyXG4gICAgICAgIGlmIChoYXNCdWlsZFNldC5oYXModXVpZCkpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDlj6rmnInkuIDkuKogdXVpZCDnmoTliIbnu4TmjInnhafljp/mnaXnmoTop4TliJnnlJ/miJBcclxuICAgICAgICBjb25zdCBqc29uID0gYXdhaXQgbWFuYWdlci5jYWNoZS5nZXRTZXJpYWxpemVkSlNPTih1dWlkLCBhc3NldFNlcmlhbGl6ZU9wdGlvbnMpO1xyXG4gICAgICAgIGlmICghanNvbikge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEhhY2sg6L6T5Ye6IHV1aWQg5LiN5LiA5a6a5ZKM5Y6f5aeLIHV1aWQg5LiA5qC377yM54m55q6K5a2X56ym5omT5YyF5Ye65p2l55qEIHV1aWQg6KaB5LiOIGxpYnJhcnkg6YeM55qE5LiA6Ie0XHJcbiAgICAgICAgY29uc3QgYXNzZXQgPSBidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldCh1dWlkKTtcclxuICAgICAgICBsZXQgZGVzdE5hbWUgPSB1dWlkO1xyXG4gICAgICAgIC8vIOi1hOa6kCBhc3NldCDkuI3kuIDlrprlrZjlnKjvvIzlm6DkuLrmnInlj6/og73mmK/nsbvkvLzkuo7lkIjlm77ov5nmoLfmlrDnlJ/miJDnmoTotYTmupDmlbDmja5cclxuICAgICAgICBpZiAoYXNzZXQgJiYgYXNzZXQubGlicmFyeSAmJiBhc3NldC5tZXRhLmZpbGVzLmluY2x1ZGVzKCcuanNvbicpKSB7XHJcbiAgICAgICAgICAgIGRlc3ROYW1lID0gYmFzZW5hbWUoYXNzZXQubGlicmFyeSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IG91dHB1dFNlcmlhbGl6ZUpTT04oZGVzdCwgZGVzdE5hbWUsIGpzb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGJ1bmRsZS5ncm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IHtcclxuICAgICAgICBpZiAoZ3JvdXAubmFtZSkge1xyXG4gICAgICAgICAgICBidW5kbGUuYWRkQXNzZXRXaXRoVXVpZChncm91cC5uYW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOWQiOW5tiBpbWFnZUFzc2V0IOW6j+WIl+WMluS/oeaBr1xyXG4gICAgICovXHJcbiAgICBhc3luYyBmdW5jdGlvbiBwYWNrSW1hZ2VBc3NldChkZXN0OiBzdHJpbmcsIG5hbWU6IHN0cmluZywgZ3JvdXBJdGVtOiBJR3JvdXApIHtcclxuICAgICAgICBjb25zdCB2YWx1ZXMgPSBhd2FpdCBQcm9taXNlLmFsbChcclxuICAgICAgICAgICAgZ3JvdXBJdGVtLnV1aWRzLm1hcChhc3luYyAodXVpZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IG1hbmFnZXIuY2FjaGUuZ2V0U2VyaWFsaXplZEpTT04odXVpZCwgYXNzZXRTZXJpYWxpemVPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGlmICghZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYENhbid0IGdldCBTZXJpYWxpemVkSlNPTiBvZiBhc3NldCB7YXNzZXQoJHt1dWlkfSl9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBwYWNrZWREYXRhID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBqcy5nZXRDbGFzc0lkKEltYWdlQXNzZXQpLFxyXG4gICAgICAgICAgICBkYXRhOiB2YWx1ZXMsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBhd2FpdCBvdXRwdXRTZXJpYWxpemVKU09OKGRlc3QsIG5hbWUsIHBhY2tlZERhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5ZCI5bm2IHRleHR1cmUg6LWE5rqQXHJcbiAgICAgKiBAcGFyYW0gZ3JvdXBJdGVtXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGZ1bmN0aW9uIHBhY2tUZXh0dXJlcyhkZXN0OiBzdHJpbmcsIG5hbWU6IHN0cmluZywgZ3JvdXBJdGVtOiBJR3JvdXApIHtcclxuICAgICAgICBjb25zdCBqc29ucyA9IGF3YWl0IFByb21pc2UuYWxsKFxyXG4gICAgICAgICAgICBncm91cEl0ZW0udXVpZHMubWFwKGFzeW5jICh1dWlkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgbWFuYWdlci5jYWNoZS5nZXRTZXJpYWxpemVkSlNPTih1dWlkLCBhc3NldFNlcmlhbGl6ZU9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQ2FuJ3QgZ2V0IFNlcmlhbGl6ZWRKU09OIG9mIGFzc2V0IHthc3NldCgke3V1aWR9KX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IGpzb25zLm1hcCgoanNvbjogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgY29uc3QgeyBiYXNlLCBtaXBtYXBzIH0gPSBFZGl0b3JFeHRlbmRzLnNlcmlhbGl6ZUNvbXBpbGVkLmdldFJvb3REYXRhKGpzb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gW2Jhc2UsIG1pcG1hcHNdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IHBhY2tlZERhdGEgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IGpzLmdldENsYXNzSWQoVGV4dHVyZTJEKSxcclxuICAgICAgICAgICAgZGF0YTogdmFsdWVzLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgYXdhaXQgb3V0cHV0U2VyaWFsaXplSlNPTihkZXN0LCBuYW1lLCBwYWNrZWREYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBmdW5jdGlvbiBvdXRwdXRTZXJpYWxpemVKU09OKGRlc3Q6IHN0cmluZywgbmFtZTogc3RyaW5nLCBqc29uOiBhbnkpIHtcclxuICAgICAgICAvLyDlsIbmi7zmjqXlpb3nmoTmlbDmja7vvIzlrp7pmYXlhpnliLDmjIflrprkvY3nva5cclxuICAgICAgICBjb25zdCBwYXRoID0gam9pbihkZXN0LCBuYW1lLnN1YnN0cigwLCAyKSwgbmFtZSArICcuanNvbicpO1xyXG4gICAgICAgIC8vIGpzb24gPSBfY29tcHJlc3NKc29uKGpzb24pO1xyXG4gICAgICAgIGF3YWl0IG91dHB1dEpTT04ocGF0aCwganNvbik7XHJcbiAgICB9XHJcbn1cclxuIl19