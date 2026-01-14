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
exports.DragonBonesHandler = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const fse = __importStar(require("fs-extra"));
const cc_1 = require("cc");
const utils_1 = require("../../utils");
const DRAGONBONES_ENCODING = { encoding: 'utf8' };
function basenameNoExt(p) {
    const b = path.basename(p);
    const ext = path.extname(p);
    return b.substring(0, b.length - ext.length);
}
exports.DragonBonesHandler = {
    name: 'dragonbones',
    assetType: 'dragonBones.DragonBonesAsset',
    async validate(asset) {
        let json;
        const assetpath = asset.source;
        if (assetpath.endsWith('.json')) {
            const text = fs.readFileSync(assetpath, 'utf8');
            try {
                json = JSON.parse(text);
            }
            catch (e) {
                return false;
            }
        }
        else {
            const bin = fs.readFileSync(assetpath);
            try {
                // https://github.com/nodejs/node/issues/11132
                const ab = bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength);
                json = cc_1.dragonBones.BinaryDataParser.getInstance().parseDragonBonesData(ab);
            }
            catch (e) {
                return false;
            }
        }
        if (!json) {
            return false;
        }
        return Array.isArray(json.armature) || !!json.armatures;
    },
    importer: {
        version: '1.0.2',
        async import(asset) {
            const fspath = asset.source;
            const data = await fse.readFile(fspath, DRAGONBONES_ENCODING);
            const dragonBone = new cc_1.dragonBones.DragonBonesAsset();
            dragonBone.name = basenameNoExt(fspath);
            if (fspath.endsWith('.json')) {
                dragonBone.dragonBonesJson = data;
            }
            else {
                await asset.copyToLibrary('.dbbin', fspath);
                dragonBone._setRawAsset('.dbbin');
            }
            const serializeJSON = EditorExtends.serialize(dragonBone);
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            return true;
        },
    },
};
exports.default = exports.DragonBonesHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZ29uYm9uZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvZHJhZ29uYm9uZXMvZHJhZ29uYm9uZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsMkNBQTZCO0FBQzdCLHVDQUF5QjtBQUN6Qiw4Q0FBZ0M7QUFFaEMsMkJBQWlDO0FBRWpDLHVDQUFnRDtBQUdoRCxNQUFNLG9CQUFvQixHQUFHLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBRWxELFNBQVMsYUFBYSxDQUFDLENBQVM7SUFDNUIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVCLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakQsQ0FBQztBQUVZLFFBQUEsa0JBQWtCLEdBQWlCO0lBQzVDLElBQUksRUFBRSxhQUFhO0lBRW5CLFNBQVMsRUFBRSw4QkFBOEI7SUFFekMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFZO1FBQ3ZCLElBQUksSUFBSSxDQUFDO1FBQ1QsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUMvQixJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUM5QixNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUM7Z0JBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsQ0FBQztZQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ1QsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztRQUNMLENBQUM7YUFBTSxDQUFDO1lBQ0osTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUM7Z0JBQ0QsOENBQThDO2dCQUM5QyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM3RSxJQUFJLEdBQUcsZ0JBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMvRSxDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDVCxPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNSLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzVELENBQUM7SUFFRCxRQUFRLEVBQUU7UUFDTixPQUFPLEVBQUUsT0FBTztRQUNoQixLQUFLLENBQUMsTUFBTSxDQUFDLEtBQVk7WUFDckIsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUM1QixNQUFNLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDOUQsTUFBTSxVQUFVLEdBQVEsSUFBSSxnQkFBVyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDM0QsVUFBVSxDQUFDLElBQUksR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLFVBQVUsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1lBQ3RDLENBQUM7aUJBQU0sQ0FBQztnQkFDSixNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUM1QyxVQUFVLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RDLENBQUM7WUFFRCxNQUFNLGFBQWEsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzFELE1BQU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFFbEQsTUFBTSxPQUFPLEdBQUcsSUFBQSx5QkFBaUIsRUFBQyxhQUFhLENBQUMsQ0FBQztZQUNqRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVsQyxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0tBQ0o7Q0FDSixDQUFDO0FBRUYsa0JBQWUsMEJBQWtCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBc3NldCB9IGZyb20gJ0Bjb2Nvcy9hc3NldC1kYic7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0ICogYXMgZnNlIGZyb20gJ2ZzLWV4dHJhJztcclxuXHJcbmltcG9ydCB7IGRyYWdvbkJvbmVzIH0gZnJvbSAnY2MnO1xyXG5cclxuaW1wb3J0IHsgZ2V0RGVwZW5kVVVJRExpc3QgfSBmcm9tICcuLi8uLi91dGlscyc7XHJcbmltcG9ydCB7IEFzc2V0SGFuZGxlciB9IGZyb20gJy4uLy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5cclxuY29uc3QgRFJBR09OQk9ORVNfRU5DT0RJTkcgPSB7IGVuY29kaW5nOiAndXRmOCcgfTtcclxuXHJcbmZ1bmN0aW9uIGJhc2VuYW1lTm9FeHQocDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGIgPSBwYXRoLmJhc2VuYW1lKHApO1xyXG4gICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKHApO1xyXG4gICAgcmV0dXJuIGIuc3Vic3RyaW5nKDAsIGIubGVuZ3RoIC0gZXh0Lmxlbmd0aCk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBEcmFnb25Cb25lc0hhbmRsZXI6IEFzc2V0SGFuZGxlciA9IHtcclxuICAgIG5hbWU6ICdkcmFnb25ib25lcycsXHJcblxyXG4gICAgYXNzZXRUeXBlOiAnZHJhZ29uQm9uZXMuRHJhZ29uQm9uZXNBc3NldCcsXHJcblxyXG4gICAgYXN5bmMgdmFsaWRhdGUoYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICAgICAgbGV0IGpzb247XHJcbiAgICAgICAgY29uc3QgYXNzZXRwYXRoID0gYXNzZXQuc291cmNlO1xyXG4gICAgICAgIGlmIChhc3NldHBhdGguZW5kc1dpdGgoJy5qc29uJykpIHtcclxuICAgICAgICAgICAgY29uc3QgdGV4dCA9IGZzLnJlYWRGaWxlU3luYyhhc3NldHBhdGgsICd1dGY4Jyk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBqc29uID0gSlNPTi5wYXJzZSh0ZXh0KTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgYmluID0gZnMucmVhZEZpbGVTeW5jKGFzc2V0cGF0aCk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvaXNzdWVzLzExMTMyXHJcbiAgICAgICAgICAgICAgICBjb25zdCBhYiA9IGJpbi5idWZmZXIuc2xpY2UoYmluLmJ5dGVPZmZzZXQsIGJpbi5ieXRlT2Zmc2V0ICsgYmluLmJ5dGVMZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAganNvbiA9IGRyYWdvbkJvbmVzLkJpbmFyeURhdGFQYXJzZXIuZ2V0SW5zdGFuY2UoKS5wYXJzZURyYWdvbkJvbmVzRGF0YShhYik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFqc29uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KGpzb24uYXJtYXR1cmUpIHx8ICEhanNvbi5hcm1hdHVyZXM7XHJcbiAgICB9LFxyXG5cclxuICAgIGltcG9ydGVyOiB7XHJcbiAgICAgICAgdmVyc2lvbjogJzEuMC4yJyxcclxuICAgICAgICBhc3luYyBpbXBvcnQoYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZzcGF0aCA9IGFzc2V0LnNvdXJjZTtcclxuICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGZzZS5yZWFkRmlsZShmc3BhdGgsIERSQUdPTkJPTkVTX0VOQ09ESU5HKTtcclxuICAgICAgICAgICAgY29uc3QgZHJhZ29uQm9uZTogYW55ID0gbmV3IGRyYWdvbkJvbmVzLkRyYWdvbkJvbmVzQXNzZXQoKTtcclxuICAgICAgICAgICAgZHJhZ29uQm9uZS5uYW1lID0gYmFzZW5hbWVOb0V4dChmc3BhdGgpO1xyXG4gICAgICAgICAgICBpZiAoZnNwYXRoLmVuZHNXaXRoKCcuanNvbicpKSB7XHJcbiAgICAgICAgICAgICAgICBkcmFnb25Cb25lLmRyYWdvbkJvbmVzSnNvbiA9IGRhdGE7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBhc3NldC5jb3B5VG9MaWJyYXJ5KCcuZGJiaW4nLCBmc3BhdGgpO1xyXG4gICAgICAgICAgICAgICAgZHJhZ29uQm9uZS5fc2V0UmF3QXNzZXQoJy5kYmJpbicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBzZXJpYWxpemVKU09OID0gRWRpdG9yRXh0ZW5kcy5zZXJpYWxpemUoZHJhZ29uQm9uZSk7XHJcbiAgICAgICAgICAgIGF3YWl0IGFzc2V0LnNhdmVUb0xpYnJhcnkoJy5qc29uJywgc2VyaWFsaXplSlNPTik7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRzID0gZ2V0RGVwZW5kVVVJRExpc3Qoc2VyaWFsaXplSlNPTik7XHJcbiAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBkZXBlbmRzKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRHJhZ29uQm9uZXNIYW5kbGVyO1xyXG4iXX0=