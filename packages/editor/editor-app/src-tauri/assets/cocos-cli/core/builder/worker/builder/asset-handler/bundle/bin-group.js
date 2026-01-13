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
exports.previewBinGroup = previewBinGroup;
exports.handleBinGroup = handleBinGroup;
exports.outputBinGroup = outputBinGroup;
const path_1 = require("path");
const asset_library_1 = require("../../manager/asset-library");
const cconb_1 = require("../../utils/cconb");
const fs_extra_1 = require("fs-extra");
const HashUuid = __importStar(require("../../utils/hash-uuid"));
const utils_1 = require("../../../../share/utils");
const bin_package_pack_1 = require("./bin-package-pack");
const PACK_FILE_TYPE_LIST = ['cc.AnimationClip'];
const KB = 1024;
// 预览bundle对bin文件合并以后的效果, 可用于调试, 也可用于以后editor做界面预览展示给用户查看合并效果
async function previewBinGroup(bundle, threshold) {
    const uuidList = [];
    const sizeList = [];
    let totalSize = 0;
    const analyzeResult = await Promise.all(bundle.assetsWithoutRedirect.map(uuid => analyzePack(uuid, threshold)));
    analyzeResult.forEach(output => {
        if (!output.shouldPack)
            return;
        uuidList.push(output.uuid);
        sizeList.push(output.size);
        totalSize += output.size;
    });
    return { uuidList, sizeList, totalSize };
}
async function handleBinGroup(bundle, config) {
    if (!config || !config.enable) {
        return;
    }
    console.debug(`Handle binary group in bundle ${bundle.name}: start`);
    const threshold = config.threshold * KB;
    const uuids = (await previewBinGroup(bundle, threshold)).uuidList;
    if (uuids.length <= 1) {
        console.debug(`Handle binary group in bundle ${bundle.name}: no need to handle`);
        return;
    }
    uuids.sort(utils_1.compareUUID);
    bundle.addGroup('BIN', uuids, HashUuid.calculate([uuids], HashUuid.BuiltinHashType.PackedAssets)[0]);
    console.debug(`Handle binary group in bundle ${bundle.name}: success`);
}
async function outputBinGroup(bundle, config) {
    if (!config || !config.enable) {
        return;
    }
    const group = bundle.groups.find(group => group.type == 'BIN');
    if (!group) {
        return;
    }
    await outputOneBinGroup(group, bundle);
}
async function getAssetSize(asset) {
    const path = (0, cconb_1.getCCONFormatAssetInLibrary)(asset);
    return (await (0, fs_extra_1.stat)(path)).size;
}
async function analyzePack(uuid, threshold) {
    const asset = asset_library_1.buildAssetLibrary.getAsset(uuid);
    const assetType = asset_library_1.buildAssetLibrary.getAssetProperty(asset, 'type');
    if (!PACK_FILE_TYPE_LIST.includes(assetType)) {
        return { uuid, shouldPack: false, size: 0 };
    }
    const size = await getAssetSize(asset);
    return { uuid, shouldPack: size <= threshold, size };
}
function getOutputFilePath(bundle, uuid) {
    return (0, path_1.join)(bundle.dest, bundle.importBase, uuid.slice(0, 2), uuid + '.bin');
}
async function outputOneBinGroup(group, bundle) {
    console.debug(`output bin groups in bundle ${bundle.name} start`);
    bundle.addAssetWithUuid(group.name);
    const buffers = await Promise.all(group.uuids.map(uuid => {
        const asset = asset_library_1.buildAssetLibrary.getAsset(uuid);
        const path = (0, cconb_1.getCCONFormatAssetInLibrary)(asset);
        return (0, fs_extra_1.readFile)(path);
    }));
    const packedBin = (0, bin_package_pack_1.binPackagePack)(buffers.map(buffer => new Uint8Array(buffer).buffer));
    await (0, fs_extra_1.outputFile)(getOutputFilePath(bundle, group.name), new Uint8Array(packedBin));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluLWdyb3VwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci93b3JrZXIvYnVpbGRlci9hc3NldC1oYW5kbGVyL2J1bmRsZS9iaW4tZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFjQSwwQ0FZQztBQUVELHdDQWNDO0FBRUQsd0NBU0M7QUFyREQsK0JBQTRCO0FBQzVCLCtEQUFnRTtBQUNoRSw2Q0FBZ0U7QUFDaEUsdUNBQXNEO0FBQ3RELGdFQUFrRDtBQUNsRCxtREFBc0Q7QUFDdEQseURBQW9EO0FBSXBELE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztBQUVoQiw2REFBNkQ7QUFDdEQsS0FBSyxVQUFVLGVBQWUsQ0FBQyxNQUFlLEVBQUUsU0FBaUI7SUFDcEUsTUFBTSxRQUFRLEdBQWEsRUFBRSxDQUFDO0lBQzlCLE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztJQUM5QixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDbEIsTUFBTSxhQUFhLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoSCxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVTtZQUFFLE9BQU87UUFDL0IsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsU0FBUyxJQUFJ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QUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0FBQ2pGLENBQUM7QUFFRCxLQUFLLFVBQVUsaUJBQWlCLENBQUMsS0FBYSxFQUFFLE1BQWU7SUFDM0QsT0FBTyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLENBQUM7SUFDbEUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwQyxNQUFNLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDckQsTUFBTSxLQUFLLEdBQUcsaUNBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLE1BQU0sSUFBSSxHQUFHLElBQUEsbUNBQTJCLEVBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEQsT0FBTyxJQUFBLG1CQUFRLEVBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNKLE1BQU0sU0FBUyxHQUFHLElBQUEsaUNBQWMsRUFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN2RixNQUFNLElBQUEscUJBQVUsRUFBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDdkYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgYnVpbGRBc3NldExpYnJhcnkgfSBmcm9tICcuLi8uLi9tYW5hZ2VyL2Fzc2V0LWxpYnJhcnknO1xyXG5pbXBvcnQgeyBnZXRDQ09ORm9ybWF0QXNzZXRJbkxpYnJhcnkgfSBmcm9tICcuLi8uLi91dGlscy9jY29uYic7XHJcbmltcG9ydCB7IG91dHB1dEZpbGUsIHJlYWRGaWxlLCBzdGF0IH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgKiBhcyBIYXNoVXVpZCBmcm9tICcuLi8uLi91dGlscy9oYXNoLXV1aWQnO1xyXG5pbXBvcnQgeyBjb21wYXJlVVVJRCB9IGZyb20gJy4uLy4uLy4uLy4uL3NoYXJlL3V0aWxzJztcclxuaW1wb3J0IHsgYmluUGFja2FnZVBhY2sgfSBmcm9tICcuL2Jpbi1wYWNrYWdlLXBhY2snO1xyXG5pbXBvcnQgeyBJQXNzZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9hc3NldHMvQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IElCaW5Hcm91cENvbmZpZywgSUJ1bmRsZSwgSUdyb3VwIH0gZnJvbSAnLi4vLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcblxyXG5jb25zdCBQQUNLX0ZJTEVfVFlQRV9MSVNUID0gWydjYy5BbmltYXRpb25DbGlwJ107XHJcbmNvbnN0IEtCID0gMTAyNDtcclxuXHJcbi8vIOmihOiniGJ1bmRsZeWvuWJpbuaWh+S7tuWQiOW5tuS7peWQjueahOaViOaenCwg5Y+v55So5LqO6LCD6K+VLCDkuZ/lj6/nlKjkuo7ku6XlkI5lZGl0b3LlgZrnlYzpnaLpooTop4jlsZXnpLrnu5nnlKjmiLfmn6XnnIvlkIjlubbmlYjmnpxcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByZXZpZXdCaW5Hcm91cChidW5kbGU6IElCdW5kbGUsIHRocmVzaG9sZDogbnVtYmVyKTogUHJvbWlzZTx7IHV1aWRMaXN0OiBzdHJpbmdbXSwgc2l6ZUxpc3Q6IG51bWJlcltdLCB0b3RhbFNpemU6IG51bWJlciB9PiB7XHJcbiAgICBjb25zdCB1dWlkTGlzdDogc3RyaW5nW10gPSBbXTtcclxuICAgIGNvbnN0IHNpemVMaXN0OiBudW1iZXJbXSA9IFtdO1xyXG4gICAgbGV0IHRvdGFsU2l6ZSA9IDA7XHJcbiAgICBjb25zdCBhbmFseXplUmVzdWx0ID0gYXdhaXQgUHJvbWlzZS5hbGwoYnVuZGxlLmFzc2V0c1dpdGhvdXRSZWRpcmVjdC5tYXAodXVpZCA9PiBhbmFseXplUGFjayh1dWlkLCB0aHJlc2hvbGQpKSk7XHJcbiAgICBhbmFseXplUmVzdWx0LmZvckVhY2gob3V0cHV0ID0+IHtcclxuICAgICAgICBpZiAoIW91dHB1dC5zaG91bGRQYWNrKSByZXR1cm47XHJcbiAgICAgICAgdXVpZExpc3QucHVzaChvdXRwdXQudXVpZCk7XHJcbiAgICAgICAgc2l6ZUxpc3QucHVzaChvdXRwdXQuc2l6ZSk7XHJcbiAgICAgICAgdG90YWxTaXplICs9IG91dHB1dC5zaXplO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4geyB1dWlkTGlzdCwgc2l6ZUxpc3QsIHRvdGFsU2l6ZSB9O1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlQmluR3JvdXAoYnVuZGxlOiBJQnVuZGxlLCBjb25maWc/OiBJQmluR3JvdXBDb25maWcpIHtcclxuICAgIGlmICghY29uZmlnIHx8ICFjb25maWcuZW5hYmxlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5kZWJ1ZyhgSGFuZGxlIGJpbmFyeSBncm91cCBpbiBidW5kbGUgJHtidW5kbGUubmFtZX06IHN0YXJ0YCk7XHJcbiAgICBjb25zdCB0aHJlc2hvbGQgPSBjb25maWcudGhyZXNob2xkICogS0I7XHJcbiAgICBjb25zdCB1dWlkcyA9IChhd2FpdCBwcmV2aWV3QmluR3JvdXAoYnVuZGxlLCB0aHJlc2hvbGQpKS51dWlkTGlzdDtcclxuICAgIGlmICh1dWlkcy5sZW5ndGggPD0gMSkge1xyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoYEhhbmRsZSBiaW5hcnkgZ3JvdXAgaW4gYnVuZGxlICR7YnVuZGxlLm5hbWV9OiBubyBuZWVkIHRvIGhhbmRsZWApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHV1aWRzLnNvcnQoY29tcGFyZVVVSUQpO1xyXG4gICAgYnVuZGxlLmFkZEdyb3VwKCdCSU4nLCB1dWlkcywgSGFzaFV1aWQuY2FsY3VsYXRlKFt1dWlkc10sIEhhc2hVdWlkLkJ1aWx0aW5IYXNoVHlwZS5QYWNrZWRBc3NldHMpWzBdKTtcclxuICAgIGNvbnNvbGUuZGVidWcoYEhhbmRsZSBiaW5hcnkgZ3JvdXAgaW4gYnVuZGxlICR7YnVuZGxlLm5hbWV9OiBzdWNjZXNzYCk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvdXRwdXRCaW5Hcm91cChidW5kbGU6IElCdW5kbGUsIGNvbmZpZz86IElCaW5Hcm91cENvbmZpZykge1xyXG4gICAgaWYgKCFjb25maWcgfHwgIWNvbmZpZy5lbmFibGUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBncm91cCA9IGJ1bmRsZS5ncm91cHMuZmluZChncm91cCA9PiBncm91cC50eXBlID09ICdCSU4nKTtcclxuICAgIGlmICghZ3JvdXApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBhd2FpdCBvdXRwdXRPbmVCaW5Hcm91cChncm91cCwgYnVuZGxlKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0QXNzZXRTaXplKGFzc2V0OiBJQXNzZXQpOiBQcm9taXNlPG51bWJlcj4ge1xyXG4gICAgY29uc3QgcGF0aCA9IGdldENDT05Gb3JtYXRBc3NldEluTGlicmFyeShhc3NldCk7XHJcbiAgICByZXR1cm4gKGF3YWl0IHN0YXQocGF0aCkpLnNpemU7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGFuYWx5emVQYWNrKHV1aWQ6IHN0cmluZywgdGhyZXNob2xkOiBudW1iZXIpOiBQcm9taXNlPHsgdXVpZDogc3RyaW5nLCBzaG91bGRQYWNrOiBib29sZWFuLCBzaXplOiBudW1iZXIgfT4ge1xyXG4gICAgY29uc3QgYXNzZXQgPSBidWlsZEFzc2V0TGlicmFyeS5nZXRBc3NldCh1dWlkKTtcclxuICAgIGNvbnN0IGFzc2V0VHlwZSA9IGJ1aWxkQXNzZXRMaWJyYXJ5LmdldEFzc2V0UHJvcGVydHkoYXNzZXQsICd0eXBlJyk7XHJcblxyXG4gICAgaWYgKCFQQUNLX0ZJTEVfVFlQRV9MSVNULmluY2x1ZGVzKGFzc2V0VHlwZSkpIHtcclxuICAgICAgICByZXR1cm4geyB1dWlkLCBzaG91bGRQYWNrOiBmYWxzZSwgc2l6ZTogMCB9O1xyXG4gICAgfVxyXG4gICAgY29uc3Qgc2l6ZSA9IGF3YWl0IGdldEFzc2V0U2l6ZShhc3NldCk7XHJcbiAgICByZXR1cm4geyB1dWlkLCBzaG91bGRQYWNrOiBzaXplIDw9IHRocmVzaG9sZCwgc2l6ZSB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRPdXRwdXRGaWxlUGF0aChidW5kbGU6IElCdW5kbGUsIHV1aWQ6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIGpvaW4oYnVuZGxlLmRlc3QsIGJ1bmRsZS5pbXBvcnRCYXNlLCB1dWlkLnNsaWNlKDAsIDIpLCB1dWlkICsgJy5iaW4nKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gb3V0cHV0T25lQmluR3JvdXAoZ3JvdXA6IElHcm91cCwgYnVuZGxlOiBJQnVuZGxlKSB7XHJcbiAgICBjb25zb2xlLmRlYnVnKGBvdXRwdXQgYmluIGdyb3VwcyBpbiBidW5kbGUgJHtidW5kbGUubmFtZX0gc3RhcnRgKTtcclxuICAgIGJ1bmRsZS5hZGRBc3NldFdpdGhVdWlkKGdyb3VwLm5hbWUpO1xyXG4gICAgY29uc3QgYnVmZmVycyA9IGF3YWl0IFByb21pc2UuYWxsKGdyb3VwLnV1aWRzLm1hcCh1dWlkID0+IHtcclxuICAgICAgICBjb25zdCBhc3NldCA9IGJ1aWxkQXNzZXRMaWJyYXJ5LmdldEFzc2V0KHV1aWQpO1xyXG4gICAgICAgIGNvbnN0IHBhdGggPSBnZXRDQ09ORm9ybWF0QXNzZXRJbkxpYnJhcnkoYXNzZXQpO1xyXG4gICAgICAgIHJldHVybiByZWFkRmlsZShwYXRoKTtcclxuICAgIH0pKTtcclxuICAgIGNvbnN0IHBhY2tlZEJpbiA9IGJpblBhY2thZ2VQYWNrKGJ1ZmZlcnMubWFwKGJ1ZmZlciA9PiBuZXcgVWludDhBcnJheShidWZmZXIpLmJ1ZmZlcikpO1xyXG4gICAgYXdhaXQgb3V0cHV0RmlsZShnZXRPdXRwdXRGaWxlUGF0aChidW5kbGUsIGdyb3VwLm5hbWUpLCBuZXcgVWludDhBcnJheShwYWNrZWRCaW4pKTtcclxufVxyXG4iXX0=