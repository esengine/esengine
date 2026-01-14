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
exports.GltfAnimationHandler = void 0;
const cc = __importStar(require("cc"));
const embedded_player_1 = require("cc/editor/embedded-player");
const exotic_animation_1 = require("cc/editor/exotic-animation");
const url_1 = require("url");
const serialize_library_1 = require("../utils/serialize-library");
const split_animation_1 = require("../utils/split-animation");
const load_asset_sync_1 = require("../utils/load-asset-sync");
const original_animation_1 = require("./original-animation");
const utils_1 = require("../../utils");
const assert_1 = __importDefault(require("assert"));
exports.GltfAnimationHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'gltf-animation',
    // 引擎内对应的类型
    assetType: 'cc.AnimationClip',
    /**
     * 允许这种类型的资源进行实例化
     */
    instantiation: '.animation',
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.18',
        versionCode: 3,
        /**
         * 实际导入流程
         * 需要自己控制是否生成、拷贝文件
         *
         * 返回是否导入成功的 boolean
         * 如果返回 false，则下次启动还会重新导入
         * @param asset
         */
        async import(asset) {
            if (!asset.parent) {
                return false;
            }
            const userData = asset.userData;
            userData.events ??= [];
            const originalAnimationPath = asset.parent.getFilePath((0, original_animation_1.getOriginalAnimationLibraryPath)(userData.gltfIndex));
            let originalAnimationURL = (0, url_1.pathToFileURL)(originalAnimationPath).href;
            if (originalAnimationURL) {
                originalAnimationURL = originalAnimationURL.replace('.bin', '.cconb');
            }
            const originalAnimationClip = await new Promise((resolve, reject) => {
                cc.assetManager.loadAny({ url: originalAnimationURL }, { preset: 'remote' }, null, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            });
            let span = userData.span;
            if (span && span.from === 0 && span.to === asset.parent.userData.duration) {
                span = undefined;
            }
            const animationClip = span ? (0, split_animation_1.splitAnimation)(originalAnimationClip, span.from, span.to) : originalAnimationClip;
            animationClip.name = asset._name;
            if (animationClip.name.endsWith('.animation')) {
                animationClip.name = animationClip.name.substr(0, animationClip.name.length - '.animation'.length);
            }
            animationClip.events = userData.events.map((event) => ({
                frame: event.frame,
                func: event.func,
                params: event.params.slice(),
            }));
            animationClip.wrapMode = userData.wrapMode ?? cc.AnimationClip.WrapMode.Loop;
            if (userData.speed !== undefined) {
                animationClip.speed = userData.speed;
            }
            if (userData.sample !== undefined) {
                animationClip.sample = userData.sample;
            }
            if (typeof userData.editorExtras !== 'undefined') {
                animationClip[cc.editorExtrasTag] = JSON.parse(JSON.stringify(userData.editorExtras));
            }
            if (userData.embeddedPlayers) {
                const { embeddedPlayers: embeddedPlayerInfos } = userData;
                for (const { begin, end, reconciledSpeed, editorExtras, playable: playableInfo } of embeddedPlayerInfos) {
                    const subregion = new embedded_player_1.EmbeddedPlayer();
                    if (typeof editorExtras !== 'undefined') {
                        subregion[cc.editorExtrasTag] = JSON.parse(JSON.stringify(editorExtras));
                    }
                    subregion.begin = begin;
                    subregion.end = end;
                    subregion.reconciledSpeed = reconciledSpeed;
                    if (playableInfo.type === 'animation-clip') {
                        const playable = new embedded_player_1.EmbeddedAnimationClipPlayable();
                        playable.path = playableInfo.path;
                        if (playableInfo.clip) {
                            playable.clip = (0, load_asset_sync_1.loadAssetSync)(playableInfo.clip, cc.AnimationClip) ?? null;
                        }
                        subregion.playable = playable;
                    }
                    else if (playableInfo.type === 'particle-system') {
                        const playable = new embedded_player_1.EmbeddedParticleSystemPlayable();
                        playable.path = playableInfo.path;
                        subregion.playable = playable;
                    }
                    animationClip[embedded_player_1.addEmbeddedPlayerTag](subregion);
                }
            }
            const additiveSettings = animationClip[exotic_animation_1.additiveSettingsTag];
            additiveSettings.enabled = false;
            additiveSettings.refClip = null;
            const customDependencies = [];
            if (typeof userData.additive !== 'undefined') {
                const additiveSettings = animationClip[exotic_animation_1.additiveSettingsTag];
                if (userData.additive.enabled) {
                    additiveSettings.enabled = true;
                    if (userData.additive.refClip) {
                        customDependencies.push(userData.additive.refClip);
                        additiveSettings.refClip = (0, load_asset_sync_1.loadAssetSync)(userData.additive.refClip, cc.AnimationClip) ?? null;
                    }
                }
            }
            if (typeof userData.auxiliaryCurves !== 'undefined') {
                for (const [name, { curve: curveSerialized }] of Object.entries(userData.auxiliaryCurves)) {
                    const curveDeserialized = cc.deserialize(curveSerialized, undefined, undefined);
                    (0, assert_1.default)(curveDeserialized instanceof cc.RealCurve);
                    const auxiliaryCurve = animationClip.addAuxiliaryCurve_experimental(name);
                    auxiliaryCurve.preExtrapolation = curveDeserialized.preExtrapolation;
                    auxiliaryCurve.postExtrapolation = curveDeserialized.postExtrapolation;
                    auxiliaryCurve.assignSorted(curveDeserialized.keyframes());
                }
            }
            // Compute hash
            void animationClip.hash;
            const { extension, data } = (0, serialize_library_1.serializeForLibrary)(animationClip);
            await asset.saveToLibrary(extension, data);
            const depends = (0, utils_1.getDependUUIDList)(data);
            asset.setData('depends', Array.from(new Set([...depends, ...customDependencies])));
            return true;
        },
    },
};
exports.default = exports.GltfAnimationHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvYXNzZXRzL2dsdGYvYW5pbWF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHVDQUF5QjtBQUN6QiwrREFLbUM7QUFDbkMsaUVBQWlFO0FBQ2pFLDZCQUFvQztBQUNwQyxrRUFBaUU7QUFDakUsOERBQTBEO0FBQzFELDhEQUF5RDtBQUN6RCw2REFBdUU7QUFFdkUsdUNBQWdEO0FBQ2hELG9EQUE0QjtBQUlmLFFBQUEsb0JBQW9CLEdBQWlCO0lBQzlDLGdDQUFnQztJQUNoQyxJQUFJLEVBQUUsZ0JBQWdCO0lBRXRCLFdBQVc7SUFDWCxTQUFTLEVBQUUsa0JBQWtCO0lBRTdCOztPQUVHO0lBQ0gsYUFBYSxFQUFFLFlBQVk7SUFFM0IsUUFBUSxFQUFFO1FBQ04sbUJBQW1CO1FBQ25CLE9BQU8sRUFBRSxRQUFRO1FBQ2pCLFdBQVcsRUFBRSxDQUFDO1FBQ2Q7Ozs7Ozs7V0FPRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBbUI7WUFDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDaEIsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztZQUVELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFzQyxDQUFDO1lBRTlELFFBQVEsQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDO1lBRXZCLE1BQU0scUJBQXFCLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSxvREFBK0IsRUFBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUM1RyxJQUFJLG9CQUFvQixHQUFHLElBQUEsbUJBQWEsRUFBQyxxQkFBcUIsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNyRSxJQUFJLG9C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QixHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFDaEYsSUFBQSxnQkFBTSxFQUFDLGlCQUFpQixZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDbEQsTUFBTSxjQUFjLEdBQUcsYUFBYSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMxRSxjQUFjLENBQUMsZ0JBQWdCLEdBQUcsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUM7b0JBQ3JFLGNBQWMsQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQztvQkFDdkUsY0FBYyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO2dCQUMvRCxDQUFDO1lBQ0wsQ0FBQztZQUVELGVBQWU7WUFDZixLQUFLLGFBQWEsQ0FBQyxJQUFJLENBQUM7WUFFeEIsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFBLHVDQUFtQixFQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsSUFBVyxDQUFDLENBQUM7WUFFbEQsTUFBTSxPQUFPLEdBQUcsSUFBQSx5QkFBaUIsRUFBQyxJQUFjLENBQUMsQ0FBQztZQUNsRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRW5GLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FDSjtDQUNKLENBQUM7QUFFRixrQkFBZSw0QkFBb0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0LCBWaXJ0dWFsQXNzZXQgfSBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5pbXBvcnQgKiBhcyBjYyBmcm9tICdjYyc7XHJcbmltcG9ydCB7XHJcbiAgICBhZGRFbWJlZGRlZFBsYXllclRhZyxcclxuICAgIEVtYmVkZGVkQW5pbWF0aW9uQ2xpcFBsYXlhYmxlLFxyXG4gICAgRW1iZWRkZWRQYXJ0aWNsZVN5c3RlbVBsYXlhYmxlLFxyXG4gICAgRW1iZWRkZWRQbGF5ZXIsXHJcbn0gZnJvbSAnY2MvZWRpdG9yL2VtYmVkZGVkLXBsYXllcic7XHJcbmltcG9ydCB7IGFkZGl0aXZlU2V0dGluZ3NUYWcgfSBmcm9tICdjYy9lZGl0b3IvZXhvdGljLWFuaW1hdGlvbic7XHJcbmltcG9ydCB7IHBhdGhUb0ZpbGVVUkwgfSBmcm9tICd1cmwnO1xyXG5pbXBvcnQgeyBzZXJpYWxpemVGb3JMaWJyYXJ5IH0gZnJvbSAnLi4vdXRpbHMvc2VyaWFsaXplLWxpYnJhcnknO1xyXG5pbXBvcnQgeyBzcGxpdEFuaW1hdGlvbiB9IGZyb20gJy4uL3V0aWxzL3NwbGl0LWFuaW1hdGlvbic7XHJcbmltcG9ydCB7IGxvYWRBc3NldFN5bmMgfSBmcm9tICcuLi91dGlscy9sb2FkLWFzc2V0LXN5bmMnO1xyXG5pbXBvcnQgeyBnZXRPcmlnaW5hbEFuaW1hdGlvbkxpYnJhcnlQYXRoIH0gZnJvbSAnLi9vcmlnaW5hbC1hbmltYXRpb24nO1xyXG5cclxuaW1wb3J0IHsgZ2V0RGVwZW5kVVVJRExpc3QgfSBmcm9tICcuLi8uLi91dGlscyc7XHJcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IEdsdGZBbmltYXRpb25Bc3NldFVzZXJEYXRhIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3VzZXJEYXRhcyc7XHJcblxyXG5leHBvcnQgY29uc3QgR2x0ZkFuaW1hdGlvbkhhbmRsZXI6IEFzc2V0SGFuZGxlciA9IHtcclxuICAgIC8vIEhhbmRsZXIg55qE5ZCN5a2X77yM55So5LqO5oyH5a6aIEhhbmRsZXIgYXMg562JXHJcbiAgICBuYW1lOiAnZ2x0Zi1hbmltYXRpb24nLFxyXG5cclxuICAgIC8vIOW8leaTjuWGheWvueW6lOeahOexu+Wei1xyXG4gICAgYXNzZXRUeXBlOiAnY2MuQW5pbWF0aW9uQ2xpcCcsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlhYHorrjov5nnp43nsbvlnovnmoTotYTmupDov5vooYzlrp7kvovljJZcclxuICAgICAqL1xyXG4gICAgaW5zdGFudGlhdGlvbjogJy5hbmltYXRpb24nLFxyXG5cclxuICAgIGltcG9ydGVyOiB7XHJcbiAgICAgICAgLy8g54mI5pys5Y+35aaC5p6c5Y+Y5pu077yM5YiZ5Lya5by65Yi26YeN5paw5a+85YWlXHJcbiAgICAgICAgdmVyc2lvbjogJzEuMC4xOCcsXHJcbiAgICAgICAgdmVyc2lvbkNvZGU6IDMsXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5a6e6ZmF5a+85YWl5rWB56iLXHJcbiAgICAgICAgICog6ZyA6KaB6Ieq5bex5o6n5Yi25piv5ZCm55Sf5oiQ44CB5ou36LSd5paH5Lu2XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiDov5Tlm57mmK/lkKblr7zlhaXmiJDlip/nmoQgYm9vbGVhblxyXG4gICAgICAgICAqIOWmguaenOi/lOWbniBmYWxzZe+8jOWImeS4i+asoeWQr+WKqOi/mOS8mumHjeaWsOWvvOWFpVxyXG4gICAgICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFzeW5jIGltcG9ydChhc3NldDogVmlydHVhbEFzc2V0KSB7XHJcbiAgICAgICAgICAgIGlmICghYXNzZXQucGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHVzZXJEYXRhID0gYXNzZXQudXNlckRhdGEgYXMgR2x0ZkFuaW1hdGlvbkFzc2V0VXNlckRhdGE7XHJcblxyXG4gICAgICAgICAgICB1c2VyRGF0YS5ldmVudHMgPz89IFtdO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxBbmltYXRpb25QYXRoID0gYXNzZXQucGFyZW50LmdldEZpbGVQYXRoKGdldE9yaWdpbmFsQW5pbWF0aW9uTGlicmFyeVBhdGgodXNlckRhdGEuZ2x0ZkluZGV4KSk7XHJcbiAgICAgICAgICAgIGxldCBvcmlnaW5hbEFuaW1hdGlvblVSTCA9IHBhdGhUb0ZpbGVVUkwob3JpZ2luYWxBbmltYXRpb25QYXRoKS5ocmVmO1xyXG4gICAgICAgICAgICBpZiAob3JpZ2luYWxBbmltYXRpb25VUkwpIHtcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQW5pbWF0aW9uVVJMID0gb3JpZ2luYWxBbmltYXRpb25VUkwucmVwbGFjZSgnLmJpbicsICcuY2NvbmInKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbEFuaW1hdGlvbkNsaXAgPSBhd2FpdCBuZXcgUHJvbWlzZTxjYy5BbmltYXRpb25DbGlwPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjYy5hc3NldE1hbmFnZXIubG9hZEFueSh7IHVybDogb3JpZ2luYWxBbmltYXRpb25VUkwgfSwgeyBwcmVzZXQ6ICdyZW1vdGUnIH0sIG51bGwsIChlcnIsIGRhdGE6IGNjLkFuaW1hdGlvbkNsaXApID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IHNwYW4gPSB1c2VyRGF0YS5zcGFuO1xyXG4gICAgICAgICAgICBpZiAoc3BhbiAmJiBzcGFuLmZyb20gPT09IDAgJiYgc3Bhbi50byA9PT0gYXNzZXQucGFyZW50LnVzZXJEYXRhLmR1cmF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBzcGFuID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBhbmltYXRpb25DbGlwID0gc3BhbiA/IHNwbGl0QW5pbWF0aW9uKG9yaWdpbmFsQW5pbWF0aW9uQ2xpcCwgc3Bhbi5mcm9tLCBzcGFuLnRvKSA6IG9yaWdpbmFsQW5pbWF0aW9uQ2xpcDtcclxuXHJcbiAgICAgICAgICAgIGFuaW1hdGlvbkNsaXAubmFtZSA9IGFzc2V0Ll9uYW1lO1xyXG4gICAgICAgICAgICBpZiAoYW5pbWF0aW9uQ2xpcC5uYW1lLmVuZHNXaXRoKCcuYW5pbWF0aW9uJykpIHtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbkNsaXAubmFtZSA9IGFuaW1hdGlvbkNsaXAubmFtZS5zdWJzdHIoMCwgYW5pbWF0aW9uQ2xpcC5uYW1lLmxlbmd0aCAtICcuYW5pbWF0aW9uJy5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhbmltYXRpb25DbGlwLmV2ZW50cyA9IHVzZXJEYXRhLmV2ZW50cy5tYXAoKGV2ZW50KSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgZnJhbWU6IGV2ZW50LmZyYW1lLFxyXG4gICAgICAgICAgICAgICAgZnVuYzogZXZlbnQuZnVuYyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczogZXZlbnQucGFyYW1zLnNsaWNlKCksXHJcbiAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgIGFuaW1hdGlvbkNsaXAud3JhcE1vZGUgPSB1c2VyRGF0YS53cmFwTW9kZSA/PyBjYy5BbmltYXRpb25DbGlwLldyYXBNb2RlLkxvb3A7XHJcblxyXG4gICAgICAgICAgICBpZiAodXNlckRhdGEuc3BlZWQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uQ2xpcC5zcGVlZCA9IHVzZXJEYXRhLnNwZWVkO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodXNlckRhdGEuc2FtcGxlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbkNsaXAuc2FtcGxlID0gdXNlckRhdGEuc2FtcGxlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHVzZXJEYXRhLmVkaXRvckV4dHJhcyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbkNsaXBbY2MuZWRpdG9yRXh0cmFzVGFnXSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodXNlckRhdGEuZWRpdG9yRXh0cmFzKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh1c2VyRGF0YS5lbWJlZGRlZFBsYXllcnMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHsgZW1iZWRkZWRQbGF5ZXJzOiBlbWJlZGRlZFBsYXllckluZm9zIH0gPSB1c2VyRGF0YTtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgeyBiZWdpbiwgZW5kLCByZWNvbmNpbGVkU3BlZWQsIGVkaXRvckV4dHJhcywgcGxheWFibGU6IHBsYXlhYmxlSW5mbyB9IG9mIGVtYmVkZGVkUGxheWVySW5mb3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJyZWdpb24gPSBuZXcgRW1iZWRkZWRQbGF5ZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVkaXRvckV4dHJhcyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VicmVnaW9uW2NjLmVkaXRvckV4dHJhc1RhZ10gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGVkaXRvckV4dHJhcykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzdWJyZWdpb24uYmVnaW4gPSBiZWdpbjtcclxuICAgICAgICAgICAgICAgICAgICBzdWJyZWdpb24uZW5kID0gZW5kO1xyXG4gICAgICAgICAgICAgICAgICAgIHN1YnJlZ2lvbi5yZWNvbmNpbGVkU3BlZWQgPSByZWNvbmNpbGVkU3BlZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXlhYmxlSW5mby50eXBlID09PSAnYW5pbWF0aW9uLWNsaXAnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBsYXlhYmxlID0gbmV3IEVtYmVkZGVkQW5pbWF0aW9uQ2xpcFBsYXlhYmxlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXlhYmxlLnBhdGggPSBwbGF5YWJsZUluZm8ucGF0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXlhYmxlSW5mby5jbGlwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5YWJsZS5jbGlwID0gbG9hZEFzc2V0U3luYyhwbGF5YWJsZUluZm8uY2xpcCwgY2MuQW5pbWF0aW9uQ2xpcCkgPz8gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJyZWdpb24ucGxheWFibGUgPSBwbGF5YWJsZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBsYXlhYmxlSW5mby50eXBlID09PSAncGFydGljbGUtc3lzdGVtJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwbGF5YWJsZSA9IG5ldyBFbWJlZGRlZFBhcnRpY2xlU3lzdGVtUGxheWFibGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWFibGUucGF0aCA9IHBsYXlhYmxlSW5mby5wYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJyZWdpb24ucGxheWFibGUgPSBwbGF5YWJsZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uQ2xpcFthZGRFbWJlZGRlZFBsYXllclRhZ10oc3VicmVnaW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgYWRkaXRpdmVTZXR0aW5ncyA9IGFuaW1hdGlvbkNsaXBbYWRkaXRpdmVTZXR0aW5nc1RhZ107XHJcbiAgICAgICAgICAgIGFkZGl0aXZlU2V0dGluZ3MuZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBhZGRpdGl2ZVNldHRpbmdzLnJlZkNsaXAgPSBudWxsO1xyXG4gICAgICAgICAgICBjb25zdCBjdXN0b21EZXBlbmRlbmNpZXM6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdXNlckRhdGEuYWRkaXRpdmUgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBhZGRpdGl2ZVNldHRpbmdzID0gYW5pbWF0aW9uQ2xpcFthZGRpdGl2ZVNldHRpbmdzVGFnXTtcclxuICAgICAgICAgICAgICAgIGlmICh1c2VyRGF0YS5hZGRpdGl2ZS5lbmFibGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpdmVTZXR0aW5ncy5lbmFibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodXNlckRhdGEuYWRkaXRpdmUucmVmQ2xpcCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXN0b21EZXBlbmRlbmNpZXMucHVzaCh1c2VyRGF0YS5hZGRpdGl2ZS5yZWZDbGlwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpdmVTZXR0aW5ncy5yZWZDbGlwID0gbG9hZEFzc2V0U3luYyh1c2VyRGF0YS5hZGRpdGl2ZS5yZWZDbGlwLCBjYy5BbmltYXRpb25DbGlwKSA/PyBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB1c2VyRGF0YS5hdXhpbGlhcnlDdXJ2ZXMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCB7IGN1cnZlOiBjdXJ2ZVNlcmlhbGl6ZWQgfV0gb2YgT2JqZWN0LmVudHJpZXModXNlckRhdGEuYXV4aWxpYXJ5Q3VydmVzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnZlRGVzZXJpYWxpemVkID0gY2MuZGVzZXJpYWxpemUoY3VydmVTZXJpYWxpemVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGN1cnZlRGVzZXJpYWxpemVkIGluc3RhbmNlb2YgY2MuUmVhbEN1cnZlKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhdXhpbGlhcnlDdXJ2ZSA9IGFuaW1hdGlvbkNsaXAuYWRkQXV4aWxpYXJ5Q3VydmVfZXhwZXJpbWVudGFsKG5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGF1eGlsaWFyeUN1cnZlLnByZUV4dHJhcG9sYXRpb24gPSBjdXJ2ZURlc2VyaWFsaXplZC5wcmVFeHRyYXBvbGF0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIGF1eGlsaWFyeUN1cnZlLnBvc3RFeHRyYXBvbGF0aW9uID0gY3VydmVEZXNlcmlhbGl6ZWQucG9zdEV4dHJhcG9sYXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgYXV4aWxpYXJ5Q3VydmUuYXNzaWduU29ydGVkKGN1cnZlRGVzZXJpYWxpemVkLmtleWZyYW1lcygpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ29tcHV0ZSBoYXNoXHJcbiAgICAgICAgICAgIHZvaWQgYW5pbWF0aW9uQ2xpcC5oYXNoO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgeyBleHRlbnNpb24sIGRhdGEgfSA9IHNlcmlhbGl6ZUZvckxpYnJhcnkoYW5pbWF0aW9uQ2xpcCk7XHJcbiAgICAgICAgICAgIGF3YWl0IGFzc2V0LnNhdmVUb0xpYnJhcnkoZXh0ZW5zaW9uLCBkYXRhIGFzIGFueSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRzID0gZ2V0RGVwZW5kVVVJRExpc3QoZGF0YSBhcyBzdHJpbmcpO1xyXG4gICAgICAgICAgICBhc3NldC5zZXREYXRhKCdkZXBlbmRzJywgQXJyYXkuZnJvbShuZXcgU2V0KFsuLi5kZXBlbmRzLCAuLi5jdXN0b21EZXBlbmRlbmNpZXNdKSkpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHbHRmQW5pbWF0aW9uSGFuZGxlcjtcclxuIl19