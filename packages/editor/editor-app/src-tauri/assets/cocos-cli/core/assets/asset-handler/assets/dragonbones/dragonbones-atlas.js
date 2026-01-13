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
exports.DragonBonesAtlasHandler = void 0;
const asset_db_1 = require("@cocos/asset-db");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const fse = __importStar(require("fs-extra"));
const cc_1 = require("cc");
const utils_1 = require("../../utils");
function basenameNoExt(p) {
    const b = path.basename(p);
    const ext = path.extname(p);
    return b.substring(0, b.length - ext.length);
}
exports.DragonBonesAtlasHandler = {
    name: 'dragonbones-atlas',
    assetType: 'dragonBones.DragonBonesAtlasAsset',
    async validate(asset) {
        const assetpath = asset.source;
        let json;
        const text = fs.readFileSync(assetpath, 'utf8');
        try {
            json = JSON.parse(text);
        }
        catch (e) {
            return false;
        }
        return typeof json.imagePath === 'string' && Array.isArray(json.SubTexture);
    },
    importer: {
        version: '1.0.2',
        async import(asset) {
            const fspath = asset.source;
            const data = fse.readFileSync(fspath, { encoding: 'utf8' });
            const json = JSON.parse(data);
            // parse the depended texture
            const imgPath = path.resolve(path.dirname(fspath), json.imagePath);
            asset.depend(imgPath);
            const texAsset = (0, asset_db_1.queryAsset)(imgPath);
            if (texAsset && !texAsset.init) {
                asset._assetDB.taskManager.pause(asset.task);
                await texAsset.waitInit();
                asset._assetDB.taskManager.resume(asset.task);
            }
            if (!texAsset || !texAsset.imported) {
                console.warn((0, utils_1.i18nTranslate)('importer.dragonbones_atlas.texture_not_imported', { texture: imgPath }) +
                    ` {asset(${asset.uuid})}`);
                return false;
            }
            else if (!fs.existsSync(imgPath)) {
                throw new Error((0, utils_1.i18nTranslate)('importer.dragonbones_atlas.texture_not_found', {
                    atlas: fspath,
                    texture: json.imagePath,
                }) + ` {asset(${asset.uuid})}`);
            }
            const atlas = new cc_1.dragonBones.DragonBonesAtlasAsset();
            atlas.name = basenameNoExt(fspath);
            atlas.atlasJson = data;
            atlas.texture = EditorExtends.serialize.asAsset(texAsset.uuid + '@6c48a', cc_1.Texture2D);
            const serializeJSON = EditorExtends.serialize(atlas);
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            return true;
        },
    },
};
exports.default = exports.DragonBonesAtlasHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZ29uYm9uZXMtYXRsYXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvZHJhZ29uYm9uZXMvZHJhZ29uYm9uZXMtYXRsYXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsOENBQStEO0FBQy9ELDJDQUE2QjtBQUM3Qix1Q0FBeUI7QUFDekIsOENBQWdDO0FBRWhDLDJCQUE0QztBQUM1Qyx1Q0FBK0Q7QUFHL0QsU0FBUyxhQUFhLENBQUMsQ0FBUztJQUM1QixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUIsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqRCxDQUFDO0FBRVksUUFBQSx1QkFBdUIsR0FBaUI7SUFDakQsSUFBSSxFQUFFLG1CQUFtQjtJQUN6QixTQUFTLEVBQUUsbUNBQW1DO0lBRTlDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBWTtRQUN2QixNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQy9CLElBQUksSUFBSSxDQUFDO1FBQ1QsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDO1lBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDVCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBQ0QsT0FB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cnlBc3NldCwgcXVlcnlVVUlEIH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgKiBhcyBmc2UgZnJvbSAnZnMtZXh0cmEnO1xyXG5cclxuaW1wb3J0IHsgZHJhZ29uQm9uZXMsIFRleHR1cmUyRCB9IGZyb20gJ2NjJztcclxuaW1wb3J0IHsgaTE4blRyYW5zbGF0ZSwgZ2V0RGVwZW5kVVVJRExpc3QgfSBmcm9tICcuLi8uLi91dGlscyc7XHJcbmltcG9ydCB7IEFzc2V0SGFuZGxlciB9IGZyb20gJy4uLy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5cclxuZnVuY3Rpb24gYmFzZW5hbWVOb0V4dChwOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgYiA9IHBhdGguYmFzZW5hbWUocCk7XHJcbiAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUocCk7XHJcbiAgICByZXR1cm4gYi5zdWJzdHJpbmcoMCwgYi5sZW5ndGggLSBleHQubGVuZ3RoKTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IERyYWdvbkJvbmVzQXRsYXNIYW5kbGVyOiBBc3NldEhhbmRsZXIgPSB7XHJcbiAgICBuYW1lOiAnZHJhZ29uYm9uZXMtYXRsYXMnLFxyXG4gICAgYXNzZXRUeXBlOiAnZHJhZ29uQm9uZXMuRHJhZ29uQm9uZXNBdGxhc0Fzc2V0JyxcclxuXHJcbiAgICBhc3luYyB2YWxpZGF0ZShhc3NldDogQXNzZXQpIHtcclxuICAgICAgICBjb25zdCBhc3NldHBhdGggPSBhc3NldC5zb3VyY2U7XHJcbiAgICAgICAgbGV0IGpzb247XHJcbiAgICAgICAgY29uc3QgdGV4dCA9IGZzLnJlYWRGaWxlU3luYyhhc3NldHBhdGgsICd1dGY4Jyk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAganNvbiA9IEpTT04ucGFyc2UodGV4dCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0eXBlb2YganNvbi5pbWFnZVBhdGggPT09ICdzdHJpbmcnICYmIEFycmF5LmlzQXJyYXkoanNvbi5TdWJUZXh0dXJlKTtcclxuICAgIH0sXHJcblxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjInLFxyXG4gICAgICAgIGFzeW5jIGltcG9ydChhc3NldDogQXNzZXQpIHtcclxuICAgICAgICAgICAgY29uc3QgZnNwYXRoID0gYXNzZXQuc291cmNlO1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gZnNlLnJlYWRGaWxlU3luYyhmc3BhdGgsIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgLy8gcGFyc2UgdGhlIGRlcGVuZGVkIHRleHR1cmVcclxuICAgICAgICAgICAgY29uc3QgaW1nUGF0aCA9IHBhdGgucmVzb2x2ZShwYXRoLmRpcm5hbWUoZnNwYXRoKSwganNvbi5pbWFnZVBhdGgpO1xyXG4gICAgICAgICAgICBhc3NldC5kZXBlbmQoaW1nUGF0aCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRleEFzc2V0ID0gcXVlcnlBc3NldChpbWdQYXRoKTtcclxuICAgICAgICAgICAgaWYgKHRleEFzc2V0ICYmICF0ZXhBc3NldC5pbml0KSB7XHJcbiAgICAgICAgICAgICAgICBhc3NldC5fYXNzZXREQi50YXNrTWFuYWdlci5wYXVzZShhc3NldC50YXNrKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRleEFzc2V0LndhaXRJbml0KCk7XHJcbiAgICAgICAgICAgICAgICBhc3NldC5fYXNzZXREQi50YXNrTWFuYWdlci5yZXN1bWUoYXNzZXQudGFzayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF0ZXhBc3NldCB8fCAhdGV4QXNzZXQuaW1wb3J0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgICAgICAgICAgICBpMThuVHJhbnNsYXRlKCdpbXBvcnRlci5kcmFnb25ib25lc19hdGxhcy50ZXh0dXJlX25vdF9pbXBvcnRlZCcsIHsgdGV4dHVyZTogaW1nUGF0aCB9KSArXHJcbiAgICAgICAgICAgICAgICAgICAgYCB7YXNzZXQoJHthc3NldC51dWlkfSl9YCxcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWZzLmV4aXN0c1N5bmMoaW1nUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgICAgICAgICBpMThuVHJhbnNsYXRlKCdpbXBvcnRlci5kcmFnb25ib25lc19hdGxhcy50ZXh0dXJlX25vdF9mb3VuZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXRsYXM6IGZzcGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZToganNvbi5pbWFnZVBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgfSkgKyBgIHthc3NldCgke2Fzc2V0LnV1aWR9KX1gLFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgYXRsYXMgPSBuZXcgZHJhZ29uQm9uZXMuRHJhZ29uQm9uZXNBdGxhc0Fzc2V0KCk7XHJcbiAgICAgICAgICAgIGF0bGFzLm5hbWUgPSBiYXNlbmFtZU5vRXh0KGZzcGF0aCk7XHJcbiAgICAgICAgICAgIGF0bGFzLmF0bGFzSnNvbiA9IGRhdGE7XHJcbiAgICAgICAgICAgIGF0bGFzLnRleHR1cmUgPSBFZGl0b3JFeHRlbmRzLnNlcmlhbGl6ZS5hc0Fzc2V0KHRleEFzc2V0LnV1aWQgKyAnQDZjNDhhJywgVGV4dHVyZTJEKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZUpTT04gPSBFZGl0b3JFeHRlbmRzLnNlcmlhbGl6ZShhdGxhcyk7XHJcbiAgICAgICAgICAgIGF3YWl0IGFzc2V0LnNhdmVUb0xpYnJhcnkoJy5qc29uJywgc2VyaWFsaXplSlNPTik7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRzID0gZ2V0RGVwZW5kVVVJRExpc3Qoc2VyaWFsaXplSlNPTik7XHJcbiAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBkZXBlbmRzKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRHJhZ29uQm9uZXNBdGxhc0hhbmRsZXI7XHJcbiJdfQ==